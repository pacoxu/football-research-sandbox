import fs from "node:fs/promises";
import path from "node:path";
import { paths, writeJson } from "./lib/data-loader.mjs";

function optionValue(name) {
  const direct = process.argv.find((argument) => argument.startsWith(`${name}=`));
  if (direct) return direct.slice(name.length + 1);
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

export async function stampSiteMeta({ commit, builtAt = new Date().toISOString(), filePath } = {}) {
  if (!/^[0-9a-f]{40}$/.test(String(commit ?? ""))) throw new Error("--commit must be a 40-character lowercase Git SHA");
  if (Number.isNaN(Date.parse(builtAt))) throw new Error("--built-at must be an ISO date-time");
  const target = filePath ?? path.join(paths.site, "meta.json");
  const meta = JSON.parse(await fs.readFile(target, "utf8"));
  meta.build = { status: "deployed", commit, built_at: builtAt };
  await writeJson(target, meta);
  return meta;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const meta = await stampSiteMeta({
    commit: optionValue("--commit"),
    builtAt: optionValue("--built-at") ?? new Date().toISOString(),
    filePath: optionValue("--file")
  });
  console.log(`Stamped site metadata for ${meta.build.commit}.`);
}
