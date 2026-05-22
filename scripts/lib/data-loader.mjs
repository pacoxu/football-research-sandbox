import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);

export const paths = {
  root: path.resolve(currentDir, "../.."),
  raw: path.resolve(currentDir, "../../data/raw"),
  site: path.resolve(currentDir, "../../data/site"),
  storage: path.resolve(currentDir, "../../storage")
};

async function readJson(filePath) {
  const source = await fs.readFile(filePath, "utf8");
  return JSON.parse(source);
}

async function readJsonFiles(directoryPath) {
  const entries = await fs.readdir(directoryPath, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => path.join(directoryPath, entry.name))
    .sort((left, right) => left.localeCompare(right));

  const records = await Promise.all(files.map(readJson));
  return records.flat();
}

export async function ensureDirectory(directoryPath) {
  await fs.mkdir(directoryPath, { recursive: true });
}

export async function loadDataset() {
  const players = await readJsonFiles(path.join(paths.raw, "players"));
  const tournaments = await readJson(path.join(paths.raw, "tournaments.json"));
  const projects = await readJson(path.join(paths.raw, "projects.json"));
  const overseasHistory = await readJson(path.join(paths.raw, "overseas-history.json"));
  const dossiers = await readJson(path.join(paths.raw, "dossiers.json"));

  return {
    players,
    tournaments,
    projects,
    overseasHistory,
    dossiers
  };
}

export function writeJson(filePath, payload) {
  return fs.writeFile(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}
