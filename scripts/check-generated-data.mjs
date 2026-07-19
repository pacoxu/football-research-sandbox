import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { buildSiteData } from "./build-site-data.mjs";
import { paths } from "./lib/data-loader.mjs";

const managedFiles = ["players.json", "overview.json", "meta.json"];

export async function checkGeneratedData() {
  const temporaryDirectory = await fs.mkdtemp(path.join(os.tmpdir(), "football-research-site-"));
  try {
    await buildSiteData({ outputDirectory: temporaryDirectory });
    const stale = [];
    for (const name of managedFiles) {
      const [expected, actual] = await Promise.all([
        fs.readFile(path.join(temporaryDirectory, name), "utf8"),
        fs.readFile(path.join(paths.site, name), "utf8").catch((error) =>
          error?.code === "ENOENT" ? null : Promise.reject(error)
        )
      ]);
      if (expected !== actual) stale.push(`data/site/${name}`);
    }
    if (stale.length > 0) {
      throw new Error(`Generated site data is stale: ${stale.join(", ")}. Run npm run build-data.`);
    }
    return managedFiles;
  } finally {
    await fs.rm(temporaryDirectory, { recursive: true, force: true });
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const files = await checkGeneratedData();
  console.log(`Generated site data matches ${files.length} committed files.`);
}
