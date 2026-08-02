import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const repositoryRoot = new URL("../", import.meta.url);

test("keeps Wei Xiangxin's Auxerre profile and market-value snapshot sourced", async () => {
  const [players, marketValues, lineup] = await Promise.all([
    readFile(new URL("data/raw/players/china-csl-2026-youth.json", repositoryRoot), "utf8").then(JSON.parse),
    readFile(new URL("data/raw/player-market-values.json", repositoryRoot), "utf8").then(JSON.parse),
    readFile(new URL("assets/lineup.js", repositoryRoot), "utf8")
  ]);

  const player = players.find((entry) => entry.id === "cn-wei-xiangxin-2008");
  assert.ok(player);
  assert.equal(player.local_name, "魏祥鑫");
  assert.equal(player.birth_date, "2008-03-05");
  assert.equal(player.birth_place, "Meizhou, Guangdong, China");
  assert.equal(player.primary_position, "Centre-Forward");
  assert.deepEqual(player.secondary_positions, ["Right Winger"]);
  assert.equal(player.preferred_foot, "right");
  assert.equal(player.height_cm, 178);
  assert.equal(player.weight_kg, 76);
  assert.equal(player.registration_club.name, "AJ Auxerre");
  assert.equal(player.registration_club.joined_date, "2026-07-09");
  assert.equal(player.registration_club.contract_expires, "2031-06-30");
  assert.match(player.verification.notes, /Transfermarkt.*180cm/);
  assert.ok(
    player.external_links.some(
      (link) => link.url === "https://www.transfermarkt.com/xiangxin-wei/profil/spieler/1265965"
    )
  );

  const marketValue = marketValues.players[player.id];
  assert.equal(marketValue.status, "available");
  assert.deepEqual(marketValue.current, {
    eur: 300000,
    currency: "EUR",
    display: "€300k",
    date: "2026-06-17"
  });
  assert.equal(marketValue.peak.eur, 400000);
  assert.equal(marketValue.peak.date, "2025-12-17");
  assert.equal(marketValue.history_points, 2);
  assert.equal(
    marketValue.source.market_value_url,
    "https://www.transfermarkt.com/xiangxin-wei/marktwertverlauf/spieler/1265965"
  );

  assert.match(lineup, /name: "魏祥鑫"[^\n]+role: "中锋 \/ 右边锋"[^\n]+club: "AJ Auxerre"/);
});
