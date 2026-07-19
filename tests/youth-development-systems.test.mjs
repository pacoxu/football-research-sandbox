import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const systems = JSON.parse(
  await readFile(new URL("../data/raw/youth-development-systems.json", import.meta.url), "utf8")
).systems;

test("exposes six country youth-development systems", () => {
  assert.deepEqual(
    systems.map(({ country }) => country),
    ["China PR", "Japan", "Korea Republic", "Norway", "Denmark", "Sweden"]
  );
  assert.equal(systems.flatMap(({ competitions }) => competitions).length, 32);
});

test("separates China's historical reserve league, U21 league and B-team route", () => {
  const china = systems.find((item) => item.country === "China PR");
  assert.ok(china);
  assert.deepEqual(
    china.competitions.map(({ id }) => id),
    [
      "china-former-reserve-league",
      "china-professional-u21-league",
      "china-b-teams-league-two",
      "china-u19-youth-league",
      "china-professional-u17-u15"
    ]
  );
  assert.equal(china.competitions.find(({ id }) => id === "china-b-teams-league-two").annual_snapshot.teams, 4);
  assert.ok(china.summary.zh.includes("U21队与成年B队必须分开理解"));
});

test("covers Nordic identification, club-quality and academy-certification projects", () => {
  const expectedProjectIds = {
    Norway: ["norway-landslagsskolen", "norway-kvalitetsklubb", "norway-akademiklassifiseringen"],
    Denmark: ["denmark-youth-club-licence", "denmark-dbu-talent-u13-u14", "denmark-dbu-u15-talent-centres"],
    Sweden: ["sweden-player-development-plan", "sweden-national-game-formats", "sweden-unicoach-certification"]
  };

  for (const [country, expectedIds] of Object.entries(expectedProjectIds)) {
    const system = systems.find((item) => item.country === country);
    assert.ok(system, `Missing ${country} youth system`);
    assert.deepEqual(
      system.competitions.map(({ id }) => id),
      expectedIds
    );
    assert.ok(system.source_links.every(({ url }) => url.startsWith("https://")));
  }
});
