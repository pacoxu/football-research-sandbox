import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { loadDataset } from "../scripts/lib/data-loader.mjs";
import { validateSpainFootballSystem } from "../scripts/lib/spain-football-system.mjs";

const payload = JSON.parse(
  await readFile(new URL("../data/raw/spain-football-system.json", import.meta.url), "utf8")
);

test("keeps Spain senior, U19 and U16 pyramids separate", () => {
  assert.deepEqual(
    payload.pyramids.map((pyramid) => pyramid.id),
    ["senior", "u19", "u16"]
  );
  assert.equal(payload.pyramids[0].layers[0].id, "laliga");
  assert.equal(payload.pyramids[1].layers[0].id, "division-honor-juvenil");
  assert.ok(payload.summary.zh.includes("青训合同"));
});

test("does not treat Espanyol academy deals as LaLiga appearances", () => {
  const yangHonor = payload.placements.find(
    (placement) => placement.player_id === "cn-yang-alex-2005" && placement.layer_id === "division-honor-juvenil"
  );
  const lyuNacional = payload.placements.find(
    (placement) => placement.player_id === "cn-lyu-mengyang-2009" && placement.layer_id === "liga-nacional-juvenil"
  );
  assert.equal(yangHonor.contract_type, "youth-formation");
  assert.equal(lyuNacional.contract_type, "youth-formation");
  assert.equal(lyuNacional.verification_status, "mixed-source");
  assert.equal(
    payload.placements.some(
      (placement) => placement.player_id === "cn-lyu-mengyang-2009" && placement.layer_id === "laliga"
    ),
    false
  );
});

test("keeps Wu Lei professional first-team path on LaLiga and Segunda", () => {
  const layers = payload.placements
    .filter((placement) => placement.featured_record_id === "wu-lei-espanyol-2019")
    .map((placement) => placement.layer_id)
    .sort();
  assert.deepEqual(layers, ["laliga", "segunda"]);
  assert.ok(payload.placements.every((placement) => placement.featured_record_id !== "wu-lei-espanyol-2019" || placement.contract_type === "professional"));
});

test("validates Spain placements against player and overseas records", async () => {
  const dataset = await loadDataset();
  const playerIds = new Set(dataset.players.map((player) => player.id));
  const featuredRecordIds = new Set(
    dataset.overseasHistory.countries.flatMap((country) =>
      (country.featured_records ?? []).map((record) => record.id)
    )
  );
  validateSpainFootballSystem(dataset.spainFootballSystem, playerIds, featuredRecordIds);
});
