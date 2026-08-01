import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const tournamentsUrl = new URL("../data/raw/tournaments.json", import.meta.url);

test("tracks the complete Shanghai Future Star U17 field, draw and China camp roster", async () => {
  const tournaments = JSON.parse(await readFile(tournamentsUrl, "utf8"));
  const event = tournaments.find(({ id }) => id === "shanghai-future-star-cup-men-u17-2026");
  const groups = event.final_draw.groups;
  const roster = event.latest_public_roster_view.groups.flatMap(({ entries }) => entries);

  assert.equal(event.status, "upcoming");
  assert.deepEqual(event.date_range, { start: "2026-08-03", end: "2026-08-09" });
  assert.equal(event.participants.status, "complete");
  assert.equal(event.participants.teams.length, 8);
  assert.equal(groups.length, 2);
  assert.ok(groups.find(({ name }) => name === "A").teams.includes("Arsenal U17"));
  assert.equal(roster.length, 28);
  assert.equal(event.latest_public_roster_view.head_coach.local_name, "浮嶋敏");
});
