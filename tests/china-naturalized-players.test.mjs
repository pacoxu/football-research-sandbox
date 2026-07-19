import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { loadDataset } from "../scripts/lib/data-loader.mjs";

test("publishes eight verified China naturalized-player profiles with explicit senior-team status", async () => {
  const dataset = await loadDataset();
  const china = dataset.overseasHistory.countries.find((entry) => entry.country === "China PR");
  const profiles = china.naturalized_players.profiles;

  assert.equal(profiles.length, 8);
  assert.equal(profiles.filter((profile) => profile.china_team_status === "senior-capped").length, 7);
  assert.equal(profiles.filter((profile) => profile.china_team_status === "senior-squad").length, 1);
  assert.equal(
    profiles.find((profile) => profile.china_name === "侯永永").china_team_status,
    "senior-squad"
  );
  assert.ok(profiles.some((profile) => profile.china_name === "阿兰"));
  assert.ok(profiles.some((profile) => profile.china_name === "塞尔吉尼奥"));
});

test("keeps naturalized-player overseas careers sourced and separate from conventional overseas counts", async () => {
  const dataset = await loadDataset();
  const china = dataset.overseasHistory.countries.find((entry) => entry.country === "China PR");
  const collection = china.naturalized_players;

  assert.match(collection.boundary_note.zh, /不是同一统计口径/);
  for (const profile of collection.profiles) {
    assert.ok(profile.career_segments.length > 0, `${profile.id} has no career segment`);
    assert.ok(profile.source_links.length >= 2, `${profile.id} has insufficient sources`);
    assert.ok(profile.source_links.every((source) => /^https:\/\//.test(source.url)));
  }
  assert.equal(china.verified_records, 40, "naturalized profiles must not inflate featured overseas records");
  assert.equal(china.verified_records, china.featured_records.length);
});

test("overseas page exposes the naturalized-player directory and renderer", async () => {
  const [page, app] = await Promise.all([
    fs.readFile(new URL("../overseas.html", import.meta.url), "utf8"),
    fs.readFile(new URL("../assets/app.js", import.meta.url), "utf8")
  ]);

  assert.match(page, /id="chinaNaturalizedPlayersSection"/);
  assert.match(page, /id="chinaNaturalizedPlayersCards"/);
  assert.match(app, /function renderChinaNaturalizedPlayerCard/);
  assert.match(app, /overseas\.naturalized\.status\.senior-capped/);
});
