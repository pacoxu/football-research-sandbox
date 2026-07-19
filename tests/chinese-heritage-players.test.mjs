import assert from "node:assert/strict";
import fs from "node:fs/promises";
import test from "node:test";

const collection = JSON.parse(
  await fs.readFile(new URL("../data/raw/overseas-history.json", import.meta.url), "utf8")
).chinese_heritage_players;

test("publishes the 13-profile Chinese-heritage directory in three explicit groups", () => {
  assert.equal(collection.profiles.length, 13);
  assert.deepEqual(
    Object.fromEntries(collection.groups.map((group) => [group.id, collection.profiles.filter((profile) => profile.group === group.id).length])),
    { "world-cup-2026": 3, "active-watch": 5, historical: 5 }
  );
  assert.ok(collection.profiles.every((profile) => profile.source_links.length >= 2));
});

test("keeps the 2026 World Cup set and representation boundaries explicit", () => {
  const worldCupIds = collection.profiles
    .filter((profile) => profile.group === "world-cup-2026")
    .map((profile) => profile.id)
    .sort();
  assert.deepEqual(worldCupIds, ["elijah-just", "tahith-chong", "virgil-van-dijk"]);
  assert.equal(collection.profiles.find((profile) => profile.id === "elijah-just").world_cup_2026.squad_status, "played");
  assert.equal(collection.profiles.find((profile) => profile.id === "perry-ng").representation_status, "eligibility-watch");
  assert.equal(collection.profiles.find((profile) => profile.id === "alexander-ndoumbou").representation_status, "association-locked");
  assert.equal(collection.profiles.find((profile) => profile.id === "frank-soo").representation_status, "wartime-unofficial");
});

test("overseas page exposes and renders the Chinese-heritage directory", async () => {
  const [html, app] = await Promise.all([
    fs.readFile(new URL("../overseas.html", import.meta.url), "utf8"),
    fs.readFile(new URL("../assets/app.js", import.meta.url), "utf8")
  ]);
  assert.match(html, /id="chineseHeritagePlayersSection"/);
  assert.match(html, /id="chineseHeritagePlayersGroups"/);
  assert.match(app, /function renderChineseHeritagePlayerCard/);
  assert.match(app, /overseas\.heritage\.status\.wartime-unofficial/);
});
