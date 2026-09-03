import assert from "node:assert/strict";
import test from "node:test";
import { loadDataset } from "../scripts/lib/data-loader.mjs";

const tournamentId = "shanghai-future-star-cup-men-u17-2026";

function flattenRoster(view) {
  return (view?.groups ?? []).flatMap((group) => group.entries ?? []);
}

function rosterByTeam(view, team) {
  return (view?.groups ?? [])
    .filter((group) => group.team === team)
    .flatMap((group) => group.entries ?? []);
}

test("stores the 2026 Shanghai Future Star Cup field and group schedule", async () => {
  const dataset = await loadDataset();
  const focus = dataset.tournaments.find((entry) => entry.id === tournamentId);
  const archive = dataset.tournamentArchive.find((entry) => entry.id === tournamentId);

  assert(focus, "missing focus tournament");
  assert(archive, "missing archive tournament");
  assert.deepEqual(focus.date_range, { start: "2026-08-03", end: "2026-08-09" });
  assert.equal(focus.group_stage_matches.length, 12);
  assert.equal(
    focus.group_stage_matches.filter(
      (match) => match.home === "Shanghai U17" || match.away === "Shanghai U17"
    ).length,
    3
  );
  const shanghaiOpener = focus.group_stage_matches.find(
    (match) => match.home === "Shanghai U17" && match.away === "Sporting CP U17"
  );
  assert.deepEqual(
    [shanghaiOpener?.home_score, shanghaiOpener?.away_score, shanghaiOpener?.score_status],
    [3, 3, "secondary-source-snapshot"]
  );
  assert.equal(archive.participants.teams.length, 8);
  assert.deepEqual(
    archive.final_draw.groups.find((group) => group.name === "Group B")?.teams,
    ["Shanghai U17", "Tottenham Hotspur U17", "River Plate U17", "Sporting CP U17"]
  );
  assert.equal(archive.champion, null, "unverified champion must not be invented");
  assert.equal(archive.runner_up, null, "unverified runner-up must not be invented");
  assert.deepEqual(
    archive.china_matches.map((match) => [match.opponent, match.score_for, match.score_against]),
    [["Arsenal U17", 3, 2]]
  );
});

test("links all 23 Shanghai U17 roster entries to player records", async () => {
  const dataset = await loadDataset();
  const archive = dataset.tournamentArchive.find((entry) => entry.id === tournamentId);
  const roster = rosterByTeam(archive?.latest_public_roster_view, "Shanghai U17");
  const playerById = new Map(dataset.players.map((player) => [player.id, player]));
  const shirtNumbers = roster.map((entry) => entry.squad_number);

  assert.equal(roster.length, 23);
  assert.equal(new Set(roster.map((entry) => entry.player_id)).size, 23);
  assert.equal(new Set(shirtNumbers).size, 23);
  assert(roster.some((entry) => entry.player_id === "cn-gu-boyu-2009" && entry.squad_number === 4));
  assert(roster.some((entry) => entry.player_id === "cn-lyu-mengyang-2009" && entry.squad_number === 15));
  assert(roster.some((entry) => entry.player_id === "cn-liang-jinhong-2008" && entry.squad_number === 10));

  for (const rosterEntry of roster) {
    const player = playerById.get(rosterEntry.player_id);
    assert(player, `missing player ${rosterEntry.player_id}`);
    const participation = player.tournament_participation.find(
      (entry) => entry.competition_id === tournamentId
    );
    assert(participation, `missing tournament participation on ${rosterEntry.player_id}`);
    assert.equal(participation.team, "Shanghai U17");
    assert.equal(participation.squad_status, "registered");
    assert.equal(participation.roster_status, "tournament-squad");
    assert.equal(participation.shirt_number, rosterEntry.squad_number);
  }
});

test("keeps the Shanghai roster position groups at 3-8-6-6", async () => {
  const dataset = await loadDataset();
  const archive = dataset.tournamentArchive.find((entry) => entry.id === tournamentId);
  const counts = (archive?.latest_public_roster_view?.groups ?? [])
    .filter((group) => group.team === "Shanghai U17")
    .map((group) => group.entries.length);

  assert.deepEqual(counts, [3, 8, 6, 6]);
});

test("stores the 22-player Arsenal U17 tournament roster with numbers and positions", async () => {
  const dataset = await loadDataset();
  const archive = dataset.tournamentArchive.find((entry) => entry.id === tournamentId);
  const groups = (archive?.latest_public_roster_view?.groups ?? []).filter(
    (group) => group.team === "Arsenal U17"
  );
  const roster = rosterByTeam(archive?.latest_public_roster_view, "Arsenal U17");
  const englishNames = roster.map((entry) => entry.name.en);
  const numbers = roster.map((entry) => entry.squad_number);

  assert.deepEqual(groups.map((group) => group.entries.length), [2, 8, 6, 6]);
  assert.equal(roster.length, 22);
  assert.equal(new Set(englishNames).size, 22);
  assert.equal(new Set(numbers).size, 22);
  assert(roster.some((entry) => entry.name.en === "Luis Munoz" && entry.squad_number === 12));
  assert(roster.some((entry) => entry.name.en === "Abraham Owusu-Gyasi" && entry.squad_number === 78));
  assert(roster.some((entry) => entry.name.en === "Marley Frohock" && entry.squad_number === 72));
  assert(!englishNames.includes("Marcel Frohock"));
  assert(!englishNames.includes("Abraham Omisuli-Gyasi"));
});
