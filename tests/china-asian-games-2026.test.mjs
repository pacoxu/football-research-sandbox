import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const competitionId = "asian-games-men-2026";

async function readJson(relativePath) {
  return JSON.parse(await fs.readFile(path.join(root, relativePath), "utf8"));
}

async function readPlayers() {
  const directory = path.join(root, "data/raw/players");
  const files = (await fs.readdir(directory)).filter((name) => name.endsWith(".json"));
  return (await Promise.all(files.map((name) => readJson(`data/raw/players/${name}`)))).flat();
}

test("records the Asian Games field, Group B, and China fixture dates", async () => {
  const tournaments = await readJson("data/raw/tournaments.json");
  const archive = await readJson("data/raw/tournament-archive.json");
  const tournament = tournaments.find((entry) => entry.id === competitionId);
  const archived = archive.find((entry) => entry.id === competitionId);

  assert.ok(tournament);
  assert.deepEqual(tournament.date_range, { start: "2026-09-15", end: "2026-10-03" });
  assert.equal(tournament.eligibility.format, "u23-plus-three-overage");
  assert.deepEqual(tournament.china_group_stage.teams, [
    "China PR",
    "United Arab Emirates",
    "IR Iran",
    "DPR Korea"
  ]);
  assert.deepEqual(
    tournament.china_group_stage.fixtures.map(({ date, opponent }) => ({ date, opponent })),
    [
      { date: "2026-09-16", opponent: "DPR Korea" },
      { date: "2026-09-20", opponent: "IR Iran" },
      { date: "2026-09-23", opponent: "United Arab Emirates" }
    ]
  );

  assert.ok(archived);
  assert.equal(archived.participants.teams.length, 15);
  assert.deepEqual(
    archived.final_draw.groups.find((group) => group.name === "Group B").teams,
    tournament.china_group_stage.teams
  );
});

test("keeps the official 23-player roster separate from the 24-player CFA camp pool", async () => {
  const [players, tournaments, archive] = await Promise.all([
    readPlayers(),
    readJson("data/raw/tournaments.json"),
    readJson("data/raw/tournament-archive.json")
  ]);
  const playerById = new Map(players.map((player) => [player.id, player]));
  const tournament = tournaments.find((entry) => entry.id === competitionId);
  const archived = archive.find((entry) => entry.id === competitionId);
  const finalIds = archived.china_squad.map((entry) => entry.player_id);
  const publicViewIds = archived.latest_public_roster_view.groups.flatMap((group) =>
    group.entries.map((entry) => entry.player_id)
  );

  assert.equal(finalIds.length, 23);
  assert.equal(new Set(finalIds).size, 23);
  assert.equal(publicViewIds.length, 24);
  assert.equal(new Set(publicViewIds).size, 24);
  assert.deepEqual(publicViewIds.filter((id) => !finalIds.includes(id)), ["cn-shi-songchen-2005"]);
  assert.deepEqual(tournament.roster_boundary.camp_only_player_ids, ["cn-shi-songchen-2005"]);

  for (const playerId of finalIds) {
    const player = playerById.get(playerId);
    assert.ok(player, `missing final-roster player ${playerId}`);
    const participation = player.tournament_participation.find(
      (entry) => entry.competition_id === competitionId
    );
    assert.equal(participation?.squad_status, "registered", playerId);
    assert.equal(participation?.roster_status, "final-squad", playerId);
  }

  const shiSongchen = playerById.get("cn-shi-songchen-2005");
  const shiParticipation = shiSongchen.tournament_participation.find(
    (entry) => entry.competition_id === competitionId
  );
  assert.equal(shiParticipation.squad_status, "called-up");
  assert.equal(shiParticipation.roster_status, "later-camp-callup");
});

test("marks exactly three overage players and preserves the latest CFA club affiliations", async () => {
  const [players, tournaments] = await Promise.all([
    readPlayers(),
    readJson("data/raw/tournaments.json")
  ]);
  const playerById = new Map(players.map((player) => [player.id, player]));
  const tournament = tournaments.find((entry) => entry.id === competitionId);
  const expectedOverage = [
    "cn-wu-xi-1989",
    "cn-zhang-yuning-1997",
    "cn-zhu-chenjie-2000"
  ];

  assert.deepEqual([...tournament.roster_boundary.overage_player_ids].sort(), expectedOverage.sort());
  for (const playerId of expectedOverage) {
    const participation = playerById
      .get(playerId)
      .tournament_participation.find((entry) => entry.competition_id === competitionId);
    assert.equal(participation.overage_player, true, playerId);
  }

  for (const playerId of [
    "cn-he-yiran-2005",
    "cn-mutalifu-yimingkari-2004",
    "cn-baihelamu-abuduwaili-2003"
  ]) {
    assert.equal(playerById.get(playerId).registration_club.name, "Chengdu Rongcheng FC", playerId);
    assert.equal(playerById.get(playerId).registration_club.as_of, "2026-09-01", playerId);
  }
});

test("updates the Asian Games coaching staff to the September tournament camp", async () => {
  const coaches = await readJson("data/raw/china-men-youth-coaches.json");
  const cycle = coaches.team_cycles.find((entry) => entry.team_label === "中国U23 / 亚运队");

  assert.equal(cycle.latest_camp.published_on, "2026-09-01");
  assert.equal(cycle.head_coach.local_name, "安东尼奥·普切");
  assert.deepEqual(
    cycle.staff.find((entry) => entry.role === "助理教练").members,
    ["何塞·德拉萨格拉", "于大宝"]
  );
  assert.deepEqual(
    cycle.staff.find((entry) => entry.role === "运动防护师").members,
    ["姚康", "赵浩然", "苏星涛", "陈恩远", "王润哲"]
  );
});
