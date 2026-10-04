import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const archiveUrl = new URL("../data/raw/tournament-archive.json", import.meta.url);

test("records the FIFA U-17 World Cup 2026 draw with China in Group H", async () => {
  const archive = JSON.parse(await readFile(archiveUrl, "utf8"));
  const tournament = archive.find(({ id }) => id === "fifa-u17-world-cup-2026");

  assert.ok(tournament);
  assert.equal(tournament.status, "upcoming");
  assert.equal(tournament.china_status, "qualified");
  assert.equal(tournament.final_draw.status, "complete");
  assert.equal(tournament.final_draw.groups.length, 12);
  assert.deepEqual(tournament.china_group_stage.teams, ["Spain", "China PR", "Fiji", "Morocco"]);
  assert.deepEqual(
    tournament.final_draw.groups.find((group) => group.name === "Group H").teams,
    ["Spain", "China PR", "Fiji", "Morocco"]
  );
  assert.equal(tournament.participants.status, "partial");
  assert.equal(tournament.participants.expected_count, 48);
  assert.equal(tournament.participants.teams.length, 46);
  assert.ok(tournament.final_draw.groups.find((group) => group.name === "Group B").teams.includes("CAF 1"));
  assert.ok(tournament.final_draw.groups.find((group) => group.name === "Group C").teams.includes("CAF 2"));
  assert.match(tournament.source_conflict_note, /CAF 1/);
  assert.equal(tournament.china_matches.length, 0);
});
