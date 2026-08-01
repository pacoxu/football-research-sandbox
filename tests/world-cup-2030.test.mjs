import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const focusUrl = new URL("../data/raw/tournaments.json", import.meta.url);
const archiveUrl = new URL("../data/raw/tournament-archive.json", import.meta.url);

const expectedTeams = new Map([
  ["Morocco", ["CAF", "tournament-host"]],
  ["Portugal", ["UEFA", "tournament-host"]],
  ["Spain", ["UEFA", "tournament-host"]],
  ["Argentina", ["CONMEBOL", "centenary-celebration-host"]],
  ["Paraguay", ["CONMEBOL", "centenary-celebration-host"]],
  ["Uruguay", ["CONMEBOL", "centenary-celebration-host"]]
]);

async function load2030Records() {
  const [focus, archive] = await Promise.all([
    readFile(focusUrl, "utf8").then(JSON.parse),
    readFile(archiveUrl, "utf8").then(JSON.parse)
  ]);
  return [
    focus.find(({ id }) => id === "fifa-world-cup-2030"),
    archive.find(({ id }) => id === "fifa-world-cup-2030")
  ];
}

test("records all six FIFA-confirmed 2030 automatic qualifiers with distinct hosting roles", async () => {
  for (const record of await load2030Records()) {
    assert.ok(record);
    assert.equal(record.participants.status, "partial");
    assert.equal(record.participants.expected_count, 48);
    assert.equal(record.participants.teams.length, 6);

    for (const entry of record.participants.teams) {
      const [confederation, hostingRole] = expectedTeams.get(entry.team);
      assert.equal(entry.confederation, confederation, entry.team);
      assert.equal(entry.hosting_role, hostingRole, entry.team);
      assert.equal(entry.entry_status, "qualified", entry.team);
      assert.equal(entry.qualified_at, "2024-12-11", entry.team);
      assert.equal(entry.source_checked_at, "2026-08-01", entry.team);
      assert.match(entry.qualification_route, /^Automatic qualification/);
    }
  }
});

test("keeps the remaining 2030 field, schedule and final draw explicitly provisional", async () => {
  for (const record of await load2030Records()) {
    const snapshot = record.qualification_snapshot;
    assert.deepEqual(record.date_range, { start: "2030-06-08", end: "2030-07-21" });
    assert.equal(record.date_precision, "provisional");
    assert.equal(snapshot.expected_field_size, 48);
    assert.equal(snapshot.qualified_count, 6);
    assert.equal(snapshot.remaining_slots, 42);
    assert.deepEqual(
      snapshot.groups.map(({ confederation, teams }) => [confederation, teams.length]),
      [["CAF", 1], ["UEFA", 2], ["CONMEBOL", 3]]
    );
    assert.equal(record.final_draw.status, "pending");
    assert.deepEqual(record.final_draw.groups, []);
  }
});
