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

test("keeps later Chinese honour-league samples on División de Honor", () => {
  const honorNames = payload.placements
    .filter((placement) => placement.layer_id === "division-honor-juvenil")
    .map((placement) => placement.local_name)
    .sort();
  assert.deepEqual(honorNames, ["何小珂", "王皓文", "杨希", "林良铭", "徐天沅", "陈雨晟", "韩丰璘"].sort());
  for (const id of [
    "he-xiaoke-honor-juvenil",
    "han-fenglin-honor-juvenil",
    "wang-haowen-honor-juvenil",
    "chen-yusheng-honor-juvenil"
  ]) {
    const placement = payload.placements.find((item) => item.id === id);
    assert.equal(placement.verification_status, "mixed-source");
    assert.equal(placement.appearance_status, "appeared");
    assert.equal(placement.contract_type, "youth-formation");
  }
  assert.equal(
    payload.placements.some(
      (placement) => placement.featured_record_id === "he-xiaoke-spain-pathway-2021" && placement.layer_id === "primera-federacion"
    ),
    true
  );
});

test("places the 2026/27 Group 7 Chinese samples on Liga Nacional", () => {
  const wang = payload.placements.find((placement) => placement.id === "wang-xiuhao-liga-nacional");
  const huang = payload.placements.find((placement) => placement.id === "huang-zijie-liga-nacional");
  assert.equal(wang.player_id, "cn-wang-xiuhao-2009");
  assert.equal(wang.appearance_status, "appeared");
  assert.match(wang.note.zh, /2 场/);
  assert.match(wang.note.zh, /不采用/);
  assert.equal(huang.player_id, "cn-huang-zijie-2009");
  assert.equal(huang.appearance_status, "registered-no-appearance");
  assert.match(huang.note.zh, /不写已出场/);
  assert.equal(
    payload.placements.some(
      (placement) =>
        ["cn-wang-xiuhao-2009", "cn-huang-zijie-2009"].includes(placement.player_id) &&
        placement.layer_id === "division-honor-juvenil"
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
