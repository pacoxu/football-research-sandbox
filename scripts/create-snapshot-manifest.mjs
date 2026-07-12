import { createHash } from "node:crypto";
import { appendFile, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ALLOWED_KINDS = new Set(["monthly", "event", "scope"]);
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function parseDate(value) {
  const normalized = value ?? new Date().toISOString().slice(0, 10);
  const parsed = new Date(`${normalized}T00:00:00Z`);
  if (!DATE_PATTERN.test(normalized) || Number.isNaN(parsed.valueOf()) || parsed.toISOString().slice(0, 10) !== normalized) {
    throw new Error(`Invalid snapshot date: ${normalized}`);
  }
  return normalized;
}

export function resolveSnapshotIdentity({ kind = "monthly", slug = "", date } = {}) {
  if (!ALLOWED_KINDS.has(kind)) {
    throw new Error(`Invalid snapshot kind: ${kind}`);
  }

  const normalizedDate = parseDate(date);
  const normalizedSlug = slug.trim();
  if (kind !== "monthly" && !SLUG_PATTERN.test(normalizedSlug)) {
    throw new Error(`${kind} snapshots require a lowercase kebab-case slug`);
  }
  if (kind === "monthly" && normalizedSlug) {
    throw new Error("Monthly snapshots must not include a slug");
  }

  const tag = kind === "monthly"
    ? `snapshot-${normalizedDate.slice(0, 7)}`
    : kind === "event"
      ? `snapshot-${normalizedSlug}-${normalizedDate}`
      : `snapshot-scope-${normalizedSlug}-${normalizedDate}`;

  return { kind, slug: normalizedSlug || null, date: normalizedDate, tag };
}

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await listFiles(entryPath));
    } else if (entry.isFile()) {
      files.push(entryPath);
    }
  }
  return files;
}

async function hashDirectory(rootDirectory, relativeDirectory) {
  const directory = path.join(rootDirectory, relativeDirectory);
  const hash = createHash("sha256");
  for (const file of await listFiles(directory)) {
    const relativePath = path.relative(rootDirectory, file).split(path.sep).join("/");
    const contents = await readFile(file);
    hash.update(relativePath);
    hash.update("\0");
    hash.update(contents);
    hash.update("\n");
  }
  return hash.digest("hex");
}

async function hashFiles(rootDirectory, relativePaths) {
  const hash = createHash("sha256");
  for (const relativePath of [...relativePaths].sort()) {
    hash.update(relativePath);
    hash.update("\0");
    hash.update(await readFile(path.join(rootDirectory, relativePath)));
    hash.update("\n");
  }
  return hash.digest("hex");
}

export async function buildSnapshotManifest({
  rootDirectory,
  kind,
  slug,
  date,
  repository = "local",
  commit = "local"
}) {
  const snapshot = resolveSnapshotIdentity({ kind, slug, date });
  const overview = JSON.parse(await readFile(path.join(rootDirectory, "data/site/overview.json"), "utf8"));

  return {
    schema_version: 1,
    snapshot,
    repository,
    source_commit: commit,
    generated_at: overview.generated_at,
    stats: overview.stats,
    content_sha256: {
      raw: await hashDirectory(rootDirectory, "data/raw"),
      site: await hashDirectory(rootDirectory, "data/site"),
      docs: await hashDirectory(rootDirectory, "docs"),
      governance: await hashFiles(rootDirectory, [
        ".github/CODEOWNERS",
        "CHANGELOG.md",
        "CONTRIBUTING.md",
        "README.md",
        "ROADMAP.md",
        "SECURITY.md"
      ])
    },
    validation: [
      "npm run validate-data",
      "npm test",
      "npm run build-data",
      "git diff --exit-code -- data/site"
    ],
    exclusions: ["storage/**", "dist/**", "outputs/**", "temporary fetches", "third-party source files"],
    known_limitations: "docs/known-limitations.md"
  };
}

function renderReleaseNotes(manifest) {
  const { snapshot } = manifest;
  const scope = snapshot.slug ? `${snapshot.kind}: ${snapshot.slug}` : snapshot.kind;
  return `# ${snapshot.tag}

Data snapshot for \`${manifest.repository}\` at commit \`${manifest.source_commit}\`.

- Snapshot type: ${scope}
- Snapshot date: ${snapshot.date}
- Generated data date: ${manifest.generated_at}
- Players: ${manifest.stats.player_count}
- Countries/regions: ${manifest.stats.country_count}
- Foreign registrations in scope: ${manifest.stats.foreign_registration_count}
- Raw SHA-256: \`${manifest.content_sha256.raw}\`
- Site SHA-256: \`${manifest.content_sha256.site}\`
- Docs SHA-256: \`${manifest.content_sha256.docs}\`
- Governance SHA-256: \`${manifest.content_sha256.governance}\`

Validation and exclusions are recorded in the attached \`snapshot-manifest.json\`. This release is a research-data snapshot, not an official or complete football database.
`;
}

async function main() {
  const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
  const rootDirectory = path.resolve(scriptDirectory, "..");
  const outputDirectory = path.resolve(rootDirectory, process.env.SNAPSHOT_OUTPUT_DIR ?? ".snapshot");
  const manifest = await buildSnapshotManifest({
    rootDirectory,
    kind: process.env.SNAPSHOT_KIND ?? "monthly",
    slug: process.env.SNAPSHOT_SLUG ?? "",
    date: process.env.SNAPSHOT_DATE,
    repository: process.env.GITHUB_REPOSITORY ?? "local",
    commit: process.env.GITHUB_SHA ?? "local"
  });

  await mkdir(outputDirectory, { recursive: true });
  await writeFile(path.join(outputDirectory, "snapshot-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  await writeFile(path.join(outputDirectory, "snapshot-release-notes.md"), renderReleaseNotes(manifest));

  if (process.env.GITHUB_OUTPUT) {
    await appendFile(process.env.GITHUB_OUTPUT, `tag=${manifest.snapshot.tag}\n`);
  }
  if (process.env.GITHUB_STEP_SUMMARY) {
    await appendFile(process.env.GITHUB_STEP_SUMMARY, renderReleaseNotes(manifest));
  }

  console.log(JSON.stringify({ tag: manifest.snapshot.tag, output_directory: outputDirectory }));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await main();
}
