import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { loadDataset } from "../scripts/lib/data-loader.mjs";

const htmlFiles = [
  "index.html",
  "players.html",
  "player.html",
  "tournaments.html",
  "tournament.html",
  "overseas.html",
  "pathways.html",
  "coaches.html",
  "stories.html",
  "story.html",
  "dossier.html",
  "dossier-player.html",
  "youth-league.html",
  "lineup.html",
  "data.html",
  "predictions.html",
  "youth-disputes.html"
];

test("youth training disputes file keeps age, money, CFA stance and outcome", async () => {
  const dataset = await loadDataset();
  const archive = dataset.youthTrainingDisputes;
  assert.equal(archive.schema_version, 1);
  assert.ok(archive.cases.length >= 5);
  const ids = new Set(archive.cases.map((item) => item.id));
  assert.ok(ids.has("zhang-zhuoyi-haiqiu-2025"));
  assert.ok(ids.has("yang-qiandong-evergrande-2026"));
  for (const item of archive.cases) {
    assert.ok(item.player_age.zh && item.claimed_amount.zh && item.cfa_position.zh && item.outcome.zh, item.id);
    assert.ok(item.source_links.length > 0, item.id);
  }
});

test("youth disputes page is in the main navigation of every site page", async () => {
  const [page, app] = await Promise.all([
    fs.readFile(new URL("../youth-disputes.html", import.meta.url), "utf8"),
    fs.readFile(new URL("../assets/app.js", import.meta.url), "utf8")
  ]);
  assert.match(page, /data-page="youth-disputes"/);
  assert.match(page, /id="disputesTableBody"/);
  assert.match(page, /id="disputesCaseGrid"/);
  assert.match(app, /renderYouthDisputesPage/);
  assert.match(app, /nav\.disputes/);

  for (const pageName of htmlFiles) {
    const html = await fs.readFile(new URL(`../${pageName}`, import.meta.url), "utf8");
    assert.match(html, /class="site-nav"[\s\S]*href="\.\/youth-disputes\.html"/, `${pageName} has no youth disputes navigation link`);
  }
});
