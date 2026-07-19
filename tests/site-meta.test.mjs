import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { stampSiteMeta } from "../scripts/stamp-site-meta.mjs";

test("keeps dataset quality and source totals internally consistent", async () => {
  const meta = JSON.parse(await fs.readFile(new URL("../data/site/meta.json", import.meta.url), "utf8"));
  assert.equal(meta.coverage_summary.dataset_count, meta.datasets.length);
  assert.equal(meta.coverage_summary.record_count, meta.datasets.reduce((total, dataset) => total + dataset.record_count, 0));
  for (const dataset of meta.datasets) {
    assert.equal(Object.values(dataset.quality).reduce((total, count) => total + count, 0), dataset.record_count);
    assert.equal(Object.values(dataset.source_tiers).reduce((total, count) => total + count, 0), dataset.record_count);
  }
});

test("keeps committed metadata unstamped and stamps only a deployment copy", async () => {
  const source = new URL("../data/site/meta.json", import.meta.url);
  const committed = JSON.parse(await fs.readFile(source, "utf8"));
  assert.deepEqual(committed.build, { status: "unstamped", commit: null, built_at: null });
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "site-meta-test-"));
  const target = path.join(directory, "meta.json");
  try {
    await fs.copyFile(source, target);
    const stamped = await stampSiteMeta({
      commit: "a".repeat(40),
      builtAt: "2026-07-19T12:00:00.000Z",
      filePath: target
    });
    assert.deepEqual(stamped.build, {
      status: "deployed",
      commit: "a".repeat(40),
      built_at: "2026-07-19T12:00:00.000Z"
    });
    assert.deepEqual(JSON.parse(await fs.readFile(source, "utf8")).build, committed.build);
  } finally {
    await fs.rm(directory, { recursive: true, force: true });
  }
});
