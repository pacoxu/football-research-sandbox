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

test("places Lin Liangming and Xu Tianyuan without collapsing historical tiers", () => {
  const lin = payload.placements.filter((placement) => placement.featured_record_id === "lin-liangming-spain-2015");
  const xu = payload.placements.filter((placement) => placement.featured_record_id === "xu-tianyuan-spain-2015");
  assert.deepEqual(
    lin.map((placement) => placement.layer_id).sort(),
    ["division-honor-juvenil", "segunda-division-b", "segunda-division-b", "tercera-division"].sort()
  );
  const castilla = lin.find((placement) => placement.club === "Real Madrid Castilla");
  const almeriaThird = lin.find((placement) => placement.id === "lin-liangming-segunda-b-almeria");
  const almeriaFourth = lin.find((placement) => placement.id === "lin-liangming-tercera-almeria");
  assert.equal(castilla.appearance_status, "appeared");
  assert.match(castilla.note.zh, /0 球/);
  assert.match(almeriaThird.note.zh, /4 球/);
  assert.match(almeriaFourth.note.zh, /不能写成第三级/);
  assert.equal(
    lin.some((placement) => placement.layer_id === "primera-federacion" || placement.layer_id === "laliga"),
    false
  );
  assert.deepEqual(
    xu.map((placement) => [placement.layer_id, placement.appearance_status]).sort(),
    [
      ["division-honor-juvenil", "appeared"],
      ["tercera-division", "registered-no-appearance"]
    ].sort()
  );
});

test("combines honour league and Liga Nacional into one open-count table", () => {
  const rows = payload.u19_table.rows;
  assert.deepEqual(
    [...new Set(rows.map((row) => row.layer_id))].sort(),
    ["division-honor-juvenil", "liga-nacional-juvenil"]
  );
  assert.match(payload.u19_table.note.zh, /范围或「起」/);
  const lin = rows.find((row) => row.local_name === "林良铭");
  const xu = rows.find((row) => row.local_name === "徐天沅");
  const lyu = rows.find((row) => row.local_name === "吕孟洋");
  assert.equal(lin.appearances, "4–17");
  assert.equal(lin.goals.zh, "4–5");
  assert.equal(xu.appearances, "1 起");
  assert.equal(lyu.layer_id, "liga-nacional-juvenil");
  assert.equal(lyu.appearances, "4 起");
  assert.equal(lyu.goals.zh, "1");
  for (const name of ["何小珂", "韩丰璘", "王皓文", "陈雨晟", "杨希"]) {
    assert.ok(rows.some((row) => row.local_name === name), `Missing U19 row for ${name}`);
  }
  assert.equal(
    rows.some((row) => row.layer_id === "laliga" || row.layer_id === "primera-federacion"),
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
