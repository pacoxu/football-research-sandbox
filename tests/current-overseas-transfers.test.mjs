import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const repositoryRoot = new URL("../", import.meta.url);

test("keeps current overseas records, references and lineup clubs consistent", async () => {
  const [history, lineup, structuredPlayers] = await Promise.all([
    readFile(new URL("data/raw/overseas-history.json", repositoryRoot), "utf8").then(JSON.parse),
    readFile(new URL("assets/lineup.js", repositoryRoot), "utf8"),
    readFile(new URL("data/raw/players/china-overseas-current.json", repositoryRoot), "utf8").then(JSON.parse)
  ]);

  const records = history.countries.flatMap((country) => country.featured_records ?? []);
  const byId = new Map(records.map((record) => [record.id, record]));
  const expectedCurrent = new Map([
    ["daiki-hashioka-slavia-2026", "Slavia Prague"],
    ["kyogo-furuhashi-la-galaxy-2026", "LA Galaxy"],
    ["lee-kang-in-atletico-2026", "Atlético Madrid"],
    ["yang-min-hyeok-tottenham-2026", "Tottenham Hotspur"],
    ["kim-ji-soo-brentford-2026", "Brentford"],
    ["hong-hyun-seok-mainz-2026", "Mainz 05"],
    ["yoon-do-young-magdeburg-2026", "1. FC Magdeburg"]
  ]);

  for (const [id, club] of expectedCurrent) {
    assert.equal(byId.get(id)?.active_abroad, true, `${id} must be current`);
    assert.equal(byId.get(id)?.club, club, `${id} club must match`);
  }

  const expectedHistorical = [
    "liu-shaoziyang-lafc2-2025",
    "takuma-asano-mallorca-2025",
    "daiki-hashioka-gent-2025",
    "kyogo-furuhashi-birmingham-2025",
    "takumu-kawamura-salzburg-2025",
    "lee-kang-in-psg-2025",
    "yang-min-hyeok-coventry-2026",
    "kim-ji-soo-kaiserslautern-2025",
    "hong-hyun-seok-gent-2026",
    "yoon-do-young-dordrecht-2026"
  ];
  for (const id of expectedHistorical) {
    assert.ok(byId.has(id), `${id} historical snapshot must remain queryable`);
    assert.equal(byId.get(id).active_abroad, false, `${id} must not be current`);
  }

  const leeValue = history.market_value_peak_ranking.entries.find((entry) => entry.local_name === "李刚仁");
  assert.equal(leeValue.overseas_history_record_id, "lee-kang-in-atletico-2026");
  const korea = history.countries.find((country) => country.country === "Korea Republic");
  const leeChecklist = korea.big_five_appearance_checklist.entries.find((entry) => entry.player === "李刚仁");
  assert.equal(leeChecklist.featured_record_id, "lee-kang-in-atletico-2026");

  const lineupClubs = new Map([
    ["李刚仁", "Atlético Madrid"],
    ["桥冈大树", "Slavia Prague"],
    ["古桥亨梧", "LA Galaxy"],
    ["梁民革", "Tottenham Hotspur"],
    ["金志洙", "Brentford"],
    ["洪贤锡", "Mainz 05"],
    ["尹道英", "1. FC Magdeburg"],
    ["刘邵子洋", "Beijing Guoan"],
    ["浅野拓磨", "Sanfrecce Hiroshima"],
    ["川村拓梦", "Sanfrecce Hiroshima"]
  ]);
  for (const [name, club] of lineupClubs) {
    assert.match(lineup, new RegExp(`name: "${name}"[^\\n]+club: "${club}"`));
  }
  assert.doesNotMatch(lineup, /name: "李刚仁"[^\n]+club: "Paris Saint-Germain"/);

  const liu = structuredPlayers.find((player) => player.id === "cn-liu-shaoziyang-2003");
  assert.equal(liu.overseas_status, "returned");
  assert.equal(liu.registration_club.name, "Beijing Guoan");
  assert.equal(liu.verification.last_checked, "2026-07-25");
});
