import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const repoRoot = new URL("../", import.meta.url);
const readJson = async (path) => JSON.parse(await readFile(new URL(path, repoRoot), "utf8"));

const domesticCompetitionIds = new Set([
  "csl-2026",
  "china-league-one-2026",
  "china-league-two-2026",
  "cfa-cup-2026",
  "china-u21-league-2026",
  "china-champions-league-2026"
]);

test("keeps 2026 China competition levels separate and auditable", async () => {
  const tournaments = await readJson("data/raw/tournaments.json");
  const ids = new Set(tournaments.map((tournament) => tournament.id));

  for (const competitionId of domesticCompetitionIds) {
    assert.ok(ids.has(competitionId), `missing ${competitionId}`);
  }

  const playerFiles = [
    "data/raw/players/china-csl-2026-youth.json",
    "data/raw/players/china-u23-2026.json",
    "data/raw/players/u17.json"
  ];
  const players = (await Promise.all(playerFiles.map(readJson))).flat();
  const domesticEntries = players.flatMap((player) =>
    player.tournament_participation
      .filter((entry) => domesticCompetitionIds.has(entry.competition_id))
      .map((entry) => ({ player, entry }))
  );

  assert.ok(domesticEntries.length > 0);
  for (const { player, entry } of domesticEntries) {
    assert.equal(entry.season, "2026", player.id);
    assert.ok(entry.competition_level, player.id);
    for (const field of ["appearances", "starts", "substitute_appearances", "goals", "minutes"]) {
      assert.ok(Object.hasOwn(entry, field), `${player.id} missing ${field}`);
    }
    assert.match(entry.stats_as_of, /^2026-\d{2}-\d{2}$/);
    assert.match(entry.source_checked_at, /^2026-\d{2}-\d{2}$/);
    assert.ok(entry.statistics_sources.length > 0);
  }
});

test("does not count lower-level or overseas samples as CSL first-team entries", async () => {
  const players = await readJson("data/raw/players/china-csl-2026-youth.json");
  const liYuxuan = players.find((player) => player.id === "cn-li-yuxuan-2006");
  const weiXiangxin = players.find((player) => player.id === "cn-wei-xiangxin-2008");

  assert.ok(
    liYuxuan.tournament_participation.some(
      (entry) => entry.competition_id === "china-champions-league-2026"
    )
  );
  assert.ok(!liYuxuan.tournament_participation.some((entry) => entry.competition_id === "csl-2026"));
  assert.ok(!weiXiangxin.tournament_participation.some((entry) => entry.competition_id === "csl-2026"));
});
