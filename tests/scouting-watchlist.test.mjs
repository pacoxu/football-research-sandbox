import test from "node:test";
import assert from "node:assert/strict";
import { loadDataset } from "../scripts/lib/data-loader.mjs";

test("FTS AFC scouting watchlist has the documented coverage and source links", async () => {
  const dataset = await loadDataset();
  const watchlist = dataset.scoutingWatchlist;

  assert.equal(watchlist.source.source_tier, "S2");
  assert.equal(watchlist.records.length, 30);
  assert.equal(new Set(watchlist.records.map((record) => record.country)).size, 8);
  assert.equal(watchlist.related_collections.length, 6);
  for (const item of [...watchlist.records, ...watchlist.related_collections]) {
    const url = item.source_url ?? item.url;
    assert.match(url, /^https:\/\/footballtalentscout\.net\//);
  }
});

test("Eyeball public audit keeps Saudi league links separate from AFC-national players", async () => {
  const dataset = await loadDataset();
  const audits = dataset.scoutingWatchlist.source_audits;

  assert.equal(dataset.scoutingWatchlist.schema_version, 2);
  assert.equal(audits.length, 1);
  assert.equal(audits[0].source.name, "Eyeball");
  assert.equal(audits[0].source.source_tier, "S3");
  assert.equal(audits[0].source.access_status, "login-required");
  assert.equal(audits[0].scope.named_afc_player_count, 0);
  assert.equal(audits[0].asia_linked_leads.length, 4);
  assert.ok(audits[0].asia_linked_leads.every((lead) => lead.afc_national_player === false));
  assert.ok(audits[0].asia_linked_leads.every((lead) => lead.destination_association === "Saudi Arabia"));
  assert.ok(audits[0].asia_linked_leads.every((lead) => /^https:\/\/www\.spl\.com\.sa\//.test(lead.official_verification.url)));
});

test("FTS ratings remain report snapshots and linked players resolve", async () => {
  const dataset = await loadDataset();
  const records = dataset.scoutingWatchlist.records;
  const byId = new Map(records.map((record) => [record.id, record]));
  const playerIds = new Set(dataset.players.map((player) => player.id));

  assert.equal(byId.get("fts-sa-abdulrahman-sufyani-2008").potential_rating, 9);
  assert.equal(byId.get("fts-jp-yuto-ozeki-2005").potential_rating, 8.5);
  assert.equal(byId.get("fts-cn-zhao-songyuan-2009").potential_rating, 7);
  const linked = records.filter((record) => record.player_id);
  assert.equal(linked.length, 12);
  assert.ok(linked.every((record) => playerIds.has(record.player_id)));
});

test("FTS watchlist records cannot masquerade as official player facts", async () => {
  const dataset = await loadDataset();
  const forbidden = ["registration_club", "national_team", "market_value", "verification"];

  for (const record of dataset.scoutingWatchlist.records) {
    for (const field of forbidden) {
      assert.equal(record[field], undefined, `${record.id} unexpectedly contains ${field}`);
    }
    assert.equal(typeof record.summary.zh, "string");
    assert.equal(typeof record.summary.en, "string");
  }
});
