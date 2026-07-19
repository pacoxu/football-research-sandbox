import fs from "node:fs/promises";
import path from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { paths } from "./lib/data-loader.mjs";

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

async function expandPath(pattern) {
  if (!pattern.includes("*")) return [path.join(paths.root, pattern)];
  const directory = path.join(paths.root, path.dirname(pattern));
  const matcher = new RegExp(`^${path.basename(pattern).replaceAll(".", "\\.").replaceAll("*", ".*")}$`);
  return (await fs.readdir(directory))
    .filter((name) => matcher.test(name))
    .sort()
    .map((name) => path.join(directory, name));
}

export function formatErrors(filePath, errors = []) {
  return errors
    .map((error) => `${path.relative(paths.root, filePath)}${error.instancePath || "/"}: ${error.message}`)
    .join("\n");
}

export async function validateJsonSchemas({ includeSite = true } = {}) {
  const schemaDirectory = path.join(paths.root, "data/schema");
  const manifest = await readJson(path.join(schemaDirectory, "manifest.json"));
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);

  const schemaFiles = (await fs.readdir(schemaDirectory))
    .filter((name) => name.endsWith(".schema.json"))
    .sort();
  for (const name of schemaFiles) ajv.addSchema(await readJson(path.join(schemaDirectory, name)));

  let validatedFiles = 0;
  for (const entry of manifest.entries) {
    if (!includeSite && entry.path.startsWith("data/site/")) continue;
    const validate = ajv.getSchema(entry.schema);
    if (!validate) throw new Error(`Unknown JSON Schema reference: ${entry.schema}`);
    const files = await expandPath(entry.path);
    if (files.length === 0) throw new Error(`Schema manifest pattern matched no files: ${entry.path}`);
    for (const filePath of files) {
      const payload = await readJson(filePath);
      if (!validate(payload)) throw new Error(`JSON Schema validation failed:\n${formatErrors(filePath, validate.errors)}`);
      validatedFiles += 1;
    }
  }
  return { validatedFiles, manifest };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = await validateJsonSchemas();
  console.log(`Validated ${result.validatedFiles} JSON files against published schemas.`);
}
