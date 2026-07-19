import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const systems = JSON.parse(
  await readFile(new URL("../data/raw/youth-development-systems.json", import.meta.url), "utf8")
).systems;

test("exposes five country youth-development systems", () => {
  assert.deepEqual(
    systems.map(({ country }) => country),
    ["Japan", "Korea Republic", "Norway", "Denmark", "Sweden"]
  );
  assert.equal(systems.flatMap(({ competitions }) => competitions).length, 27);
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
