import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const datasetUrl = new URL("../data/raw/uefa-youth-league.json", import.meta.url);

test("keeps completed historical entrants complete, path-aligned and unique", async () => {
  const data = JSON.parse(await readFile(datasetUrl, "utf8"));
  const completed = data.historical_season_index.filter(({ status }) => status !== "cancelled");

  assert.equal(completed.length, 9);
  for (const season of completed) {
    const paths = season.teams_by_path;
    const teams = Object.values(paths).flat();
    assert.equal(season.coverage.participating_teams, "complete", season.id);
    assert.equal(teams.length, season.entrant_count, season.id);
    assert.equal(new Set(teams).size, teams.length, season.id);
    assert.equal(paths.champions_league.length, 32, season.id);
    if (season.id < "2015-16") {
      assert.deepEqual(Object.keys(paths), ["champions_league"], season.id);
    } else {
      assert.equal(paths.domestic_champions.length, 32, season.id);
    }
  }
});

test("keeps the cancelled 2020/21 draw outside actual participant coverage", async () => {
  const data = JSON.parse(await readFile(datasetUrl, "utf8"));
  const season = data.historical_season_index.find(({ id }) => id === "2020-21");
  const teams = Object.values(season.published_draw_teams_by_path).flat();

  assert.equal(season.status, "cancelled");
  assert.equal(season.coverage.participating_teams, "draw-published-not-played");
  assert.equal(season.coverage.all_matches, "not-played");
  assert.equal(Object.hasOwn(season, "teams_by_path"), false);
  assert.equal(teams.length, 64);
  assert.equal(new Set(teams).size, 64);
});

test("keeps Liu Kaiyuan on the 2026/27 boundary watch without upgrading him to registered", async () => {
  const data = JSON.parse(await readFile(datasetUrl, "utf8"));
  const watch = data.boundary_watch.find(({ player_id }) => player_id === "cn-liu-kaiyuan-2010");
  const sourceIds = new Set(data.sources.map(({ id }) => id));

  assert.equal(watch.season_id, "2026-27");
  assert.equal(watch.club, "Villarreal");
  assert.equal(watch.status, "provisional");
  assert.deepEqual(watch.source_ids, [
    "rules-2027-eligibility",
    "rules-2027-lists",
    "villarreal-2027",
    "ffcv-liu-2026"
  ]);
  assert.ok(watch.source_ids.every((id) => sourceIds.has(id)));
  assert.equal(data.player_eligibility.season, "2026/27");
  assert.equal(data.player_eligibility.birth_year_minimum, 2008);
});
