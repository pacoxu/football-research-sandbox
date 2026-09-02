import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(currentFile), "..");

function resolveOutputDirectory(value) {
  const outputDirectory = path.resolve(root, value ?? "dist");
  if (outputDirectory === root || outputDirectory === path.parse(outputDirectory).root) {
    throw new Error(`Refusing to stage Pages into unsafe directory: ${outputDirectory}`);
  }
  return outputDirectory;
}

export async function stagePages({ outputDirectory = path.join(root, "dist") } = {}) {
  const resolvedOutput = resolveOutputDirectory(outputDirectory);
  const entries = await fs.readdir(root, { withFileTypes: true });
  const htmlFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".html"))
    .map((entry) => entry.name)
    .sort();

  await fs.rm(resolvedOutput, { recursive: true, force: true });
  await fs.mkdir(path.join(resolvedOutput, "data"), { recursive: true });

  await Promise.all(
    htmlFiles.map((name) => fs.copyFile(path.join(root, name), path.join(resolvedOutput, name)))
  );
  await fs.cp(path.join(root, "assets"), path.join(resolvedOutput, "assets"), { recursive: true });
  await fs.cp(path.join(root, "data/site"), path.join(resolvedOutput, "data/site"), {
    recursive: true
  });

  return {
    outputDirectory: resolvedOutput,
    htmlFiles,
    publishedDataDirectories: ["data/site"]
  };
}

function getArgument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = await stagePages({ outputDirectory: getArgument("--output") ?? "dist" });
  console.log(
    `Staged ${result.htmlFiles.length} HTML files; published data is limited to ${result.publishedDataDirectories.join(", ")}.`
  );
}
