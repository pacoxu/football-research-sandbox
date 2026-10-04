import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const archiveUrl = new URL("../data/raw/tournament-archive.json", import.meta.url);

test("closes FIFA World Cup 2026 with FIFA champion data and sourced Asian exits", async () => {
  const archive = JSON.parse(await readFile(archiveUrl, "utf8"));
  const tournament = archive.find(({ id }) => id === "fifa-world-cup-2026");

  assert.ok(tournament);
  assert.equal(tournament.status, "completed");
  assert.equal(tournament.champion, "Spain");
  assert.equal(tournament.runner_up, "Argentina");
  assert.equal(tournament.china_status, "did-not-qualify");
  assert.equal(tournament.china_matches.length, 0);
  assert.equal(tournament.source_checked_at, "2026-10-03");
  assert.match(tournament.china_summary, /西班牙/);

  const japan = tournament.asian_finals_outcomes.find((entry) => entry.team === "Japan");
  assert.deepEqual(
    [japan.stage, japan.score_for, japan.score_against, japan.opponent, japan.date],
    ["Round of 32", 1, 2, "Brazil", "2026-06-29"]
  );

  const korea = tournament.asian_finals_outcomes.find((entry) => entry.team === "Korea Republic");
  const iran = tournament.asian_finals_outcomes.find((entry) => entry.team === "IR Iran");
  assert.equal(korea.stage, "Group stage");
  assert.equal(iran.stage, "Group stage");
  assert.equal(korea.score_for, undefined);
  assert.ok(tournament.source_version.some((source) => source.url.includes("spain-crowned-world-cup-2026")));
});
