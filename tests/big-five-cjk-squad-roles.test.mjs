import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { loadDataset } from "../scripts/lib/data-loader.mjs";

const BIG_FIVE = new Set(["Premier League", "LaLiga", "Serie A", "Bundesliga", "Ligue 1"]);

function gradeBigFiveSquadRole(record) {
  const minutes = record?.league_minutes;
  const available = record?.matches_available;
  if (
    record?.minutes_basis === "missing" ||
    !Number.isFinite(minutes) ||
    !Number.isFinite(available) ||
    available <= 0
  ) {
    return "unrated";
  }
  if (minutes <= 0) return "fringe";
  const share = minutes / (available * 90);
  if (share >= 0.75) return "core";
  if (share >= 0.5) return "starter";
  if (share >= 0.25) return "rotation";
  return "substitute";
}

test("grades 2026/27 Big Five first-team roles from league minutes", async () => {
  const dataset = await loadDataset();
  const roles = dataset.bigFiveCjkSquadRoles;
  const roster = new Map(dataset.europeTopLeaguesJapanKorea.players.map((player) => [player.id, player]));
  const bigFiveIds = dataset.europeTopLeaguesJapanKorea.players
    .filter((player) => BIG_FIVE.has(player.league))
    .map((player) => player.id);

  assert.equal(roles.season, "2026-2027");
  assert.equal(roles.checked_at, "2026-10-14");
  assert.deepEqual(
    roles.role_scale.map((item) => item.id),
    ["core", "starter", "rotation", "substitute", "fringe"]
  );
  assert.deepEqual(roles.players.map((player) => player.id).filter((id) => roster.has(id)).sort(), [...bigFiveIds].sort());

  const wei = roles.players.find((player) => player.id === "cn-wei-xiangxin-auxerre-2026");
  assert.equal(wei.country, "China PR");
  assert.equal(wei.league, "Ligue 1");
  assert.equal(wei.minutes_basis, "inferred-zero");
  assert.equal(gradeBigFiveSquadRole(wei), "fringe");

  const expected = {
    "jp-zion-suzuki-aston-villa-2026": "core",
    "jp-daichi-kamada-crystal-palace-2026": "core",
    "jp-daizen-maeda-ipswich-2026": "starter",
    "jp-takehiro-tomiyasu-crystal-palace-2026": "rotation",
    "jp-hidemasa-morita-hull-2026": "substitute",
    "jp-wataru-endo-liverpool-2026": "fringe",
    "jp-kaoru-mitoma-brighton-2026": "fringe",
    "kr-lee-kang-in-atletico-2026": "starter",
    "jp-takefusa-kubo-real-sociedad-2026": "rotation",
    "jp-yukinari-sugawara-cagliari-2026": "substitute",
    "jp-yuito-suzuki-freiburg-2026": "core",
    "jp-ritsu-doan-frankfurt-2026": "starter",
    "kr-kim-min-jae-bayern-2026": "rotation",
    "kr-seol-young-woo-augsburg-2026": "substitute",
    "jp-hiroki-ito-bayern-2026": "fringe",
    "jp-mio-backhaus-freiburg-2026": "unrated",
    "kr-lee-jae-sung-mainz-2026": "unrated",
    "kr-jens-castrop-gladbach-2026": "unrated",
    "jp-ayumu-seko-le-havre-2026": "core",
    "jp-ayase-ueda-lille-2026": "rotation",
    "jp-keito-nakamura-lyon-2026": "substitute",
    "jp-takumi-minamino-monaco-2026": "fringe"
  };

  for (const player of roles.players) {
    assert.ok(player.as_of && player.minutes_basis && player.source_id, player.id);
    if (player.country !== "China PR") {
      assert.equal(roster.get(player.id).league && BIG_FIVE.has(roster.get(player.id).league), true, player.id);
    }
    if (player.minutes_basis === "missing") {
      assert.equal(player.league_minutes, null, player.id);
    } else {
      assert.equal(Number.isFinite(player.league_minutes), true, player.id);
      assert.ok(player.matches_available > 0, player.id);
    }
    const role = gradeBigFiveSquadRole(player);
    if (expected[player.id]) {
      assert.equal(role, expected[player.id], player.id);
    }
    assert.ok(["core", "starter", "rotation", "substitute", "fringe", "unrated"].includes(role), player.id);
  }

  const china = roles.players.filter((player) => player.country === "China PR");
  assert.equal(china.length, 1);
});

test("big five role page switches leagues and keeps the five grades", async () => {
  const [html, app, home, overseas] = await Promise.all([
    readFile(new URL("../big-five.html", import.meta.url), "utf8"),
    readFile(new URL("../assets/app.js", import.meta.url), "utf8"),
    readFile(new URL("../index.html", import.meta.url), "utf8"),
    readFile(new URL("../overseas.html", import.meta.url), "utf8")
  ]);
  assert.match(html, /data-page="big-five"/);
  assert.match(html, /id="bigFiveLeagueSwitch"/);
  assert.match(html, /id="bigFiveColumns"/);
  assert.match(app, /function gradeBigFiveSquadRole/);
  assert.match(app, /function renderBigFivePage/);
  assert.match(app, /share >= 0\.75/);
  assert.match(home, /href="\.\/big-five\.html"/);
  assert.match(overseas, /href="\.\/big-five\.html"/);
});
