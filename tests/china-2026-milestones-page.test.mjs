import assert from "node:assert/strict";
import fs from "node:fs/promises";
import test from "node:test";
import { loadDataset } from "../scripts/lib/data-loader.mjs";

test("publishes a 2026 milestones page wired to four sourced results", async () => {
  const [dataset, page, app, home] = await Promise.all([
    loadDataset(),
    fs.readFile(new URL("../milestones.html", import.meta.url), "utf8"),
    fs.readFile(new URL("../assets/app.js", import.meta.url), "utf8"),
    fs.readFile(new URL("../index.html", import.meta.url), "utf8")
  ]);
  const archive = dataset.china2026Milestones;

  assert.equal(archive.items.length, 4);
  assert.equal(archive.items[0].competition_id, "afc-u23-2026");
  assert.equal(archive.items[1].competition_id, "afc-u17-2026");
  assert.equal(archive.items[1].related_competition_id, "fifa-u17-world-cup-2026");
  assert.equal(archive.items[2].competition_id, "asian-games-men-2026");
  assert.equal(archive.items[3].competition_id, "fifa-u17-womens-world-cup-2026");
  assert.equal(archive.items[3].page_href, "./women.html");
  assert.match(archive.items[3].summary.zh, /首次八强/);
  assert.match(archive.items[3].summary.zh, /1 比 2/);
  assert.doesNotMatch(archive.items[3].summary.zh, /没有赛果/);
  assert.match(page, /data-page="milestones"/);
  assert.match(page, /id="milestonesGrid"/);
  assert.match(page, /xiaohongshu-china-football-2026\.jpg/);
  assert.match(app, /function renderMilestonesPage/);
  assert.match(home, /href="\.\/milestones\.html"/);
});

test("keeps the 2026 milestones link on every site page", async () => {
  const root = new URL("../", import.meta.url);
  const names = (await fs.readdir(root)).filter((name) => name.endsWith(".html"));
  assert.ok(names.includes("milestones.html"));
  for (const name of names) {
    const html = await fs.readFile(new URL(`../${name}`, import.meta.url), "utf8");
    assert.match(html, /href="\.\/milestones\.html"/, `${name} is missing the 2026 milestones link`);
  }
});
