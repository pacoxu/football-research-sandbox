import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { validateTeamRosters } from "../scripts/validate-data.mjs";

const archiveUrl = new URL("../data/raw/tournament-archive.json", import.meta.url);
const focusUrl = new URL("../data/raw/tournaments.json", import.meta.url);

async function loadTournament() {
  const archive = JSON.parse(await readFile(archiveUrl, "utf8"));
  return archive.find(({ id }) => id === "fifa-u17-world-cup-2026");
}

test("records the FIFA U-17 World Cup 2026 draw with China in Group H", async () => {
  const tournament = await loadTournament();

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
  assert.equal(tournament.china_matches.length, 0);
});

test("names the CAF qualifiers in place of the draw placeholders", async () => {
  const tournament = await loadTournament();
  const group = (name) => tournament.final_draw.groups.find((item) => item.name === name).teams;

  assert.deepEqual(group("Group B"), ["Korea Republic", "Uganda", "New Caledonia", "Ecuador"]);
  assert.deepEqual(group("Group C"), ["Argentina", "Australia", "Mozambique", "Denmark"]);
  assert.ok(!tournament.final_draw.groups.some((item) => item.teams.some((team) => /^CAF \d$/.test(team))));
  assert.equal(tournament.participants.status, "complete");
  assert.equal(tournament.participants.teams.length, 48);
  assert.equal(new Set(tournament.participants.teams.map((item) => item.team)).size, 48);
  const drawTeams = tournament.final_draw.groups.flatMap((item) => item.teams).sort();
  assert.deepEqual(tournament.participants.teams.map((item) => item.team).sort(), drawTeams);
  assert.match(tournament.source_conflict_note, /Uganda/);
});

test("keeps China's fixtures with kick-off times in both time zones", async () => {
  const tournament = await loadTournament();
  const focus = JSON.parse(await readFile(focusUrl, "utf8")).find(({ id }) => id === tournament.id);
  const [spain, morocco, fiji] = tournament.china_group_stage.fixtures;

  assert.deepEqual(
    [spain.opponent, spain.kickoff_local, spain.kickoff_beijing, spain.venue],
    ["Spain", "19:00", "2026-11-21 00:00", "Aspire Zone Pitch 7"]
  );
  assert.equal(morocco.kickoff_beijing, "2026-11-23 23:00");
  assert.equal(fiji.kickoff_beijing, "2026-11-26 23:00");
  assert.deepEqual(focus.china_group_stage.fixtures, tournament.china_group_stage.fixtures);
});

test("lists China's 25-player camp list and leaves the Spain-registered players out", async () => {
  const tournament = await loadTournament();
  const view = tournament.latest_public_roster_view;
  const entries = view.groups.flatMap((group) => group.entries);

  assert.equal(entries.length, 25);
  assert.equal(entries.filter((entry) => entry.player_id).length, 18);
  for (const missing of ["cn-xie-jin-2009", "cn-wang-xiuhao-2009", "cn-zhu-yuxuan-2009", "cn-zhang-bolin-2009"]) {
    assert.ok(!entries.some((entry) => entry.player_id === missing), missing);
  }
  assert.match(view.note.zh, /谢晋、汪修昊、朱宇轩/);
});

test("covers all nine Asian teams and China's three group opponents", async () => {
  const tournament = await loadTournament();
  const rosters = tournament.team_rosters;
  const byCountry = new Map(rosters.map((team) => [team.country, team]));

  for (const country of [
    "China PR", "Japan", "Korea Republic", "Qatar", "Australia", "Uzbekistan", "Saudi Arabia", "Tajikistan", "Vietnam"
  ]) {
    assert.ok(byCountry.has(country), country);
  }
  for (const country of ["Spain", "Morocco", "Fiji"]) {
    assert.equal(byCountry.get(country).role, "group-opponent");
  }

  const count = (country) => byCountry.get(country).groups.flatMap((group) => group.entries).length;
  assert.equal(byCountry.get("Japan").squad_status, "announced-21");
  assert.equal(count("Japan"), 19);
  assert.equal(count("Qatar"), 21);
  assert.equal(count("Spain"), 21);
  for (const country of ["Australia", "Uzbekistan", "Saudi Arabia", "Tajikistan", "Vietnam"]) {
    assert.equal(byCountry.get(country).squad_status, "afc-base");
    assert.equal(count(country), 23, country);
  }
  const japanLinked = byCountry.get("Japan").groups.flatMap((group) => group.entries).filter((entry) => entry.player_id);
  assert.ok(japanLinked.every((entry) => entry.player_id.startsWith("jp-")));
  assert.ok(japanLinked.some((entry) => entry.player_id === "jp-maki-kitahara-2009"));
});

test("rejects a team roster whose fixture opponent is outside its group", async () => {
  const tournament = structuredClone(await loadTournament());
  const playerIds = new Set(
    tournament.team_rosters.flatMap((team) => team.groups.flatMap((group) => group.entries.map((entry) => entry.player_id)))
  );
  playerIds.delete(undefined);
  assert.doesNotThrow(() => validateTeamRosters(tournament, playerIds));

  tournament.team_rosters.find((team) => team.country === "Japan").fixtures[0].opponent = "Spain";
  assert.throws(() => validateTeamRosters(tournament, playerIds), /not in Group L/);
});
