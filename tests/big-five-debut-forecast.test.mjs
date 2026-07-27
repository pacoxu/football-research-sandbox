import assert from "node:assert/strict";
import fs from "node:fs/promises";
import test from "node:test";
import {
  BIG_FIVE_DEBUT_FACTOR_KEYS,
  buildBigFiveDebutForecast,
  validateBigFiveDebutForecastInput
} from "../scripts/lib/big-five-debut-forecast.mjs";
import {
  forecastFailureMode,
  isForecastStale
} from "../assets/lineup-forecast-state.js";
import { loadDataset } from "../scripts/lib/data-loader.mjs";

const repositoryRoot = new URL("../", import.meta.url);

async function loadFixture() {
  const [input, dataset] = await Promise.all([
    fs
      .readFile(new URL("data/raw/big-five-debut-forecast.json", repositoryRoot), "utf8")
      .then(JSON.parse),
    loadDataset()
  ]);
  return { input, players: dataset.players };
}

test("validates six unique candidates, five normalized weights, and special outcomes", async () => {
  const { input, players } = await loadFixture();
  assert.equal(validateBigFiveDebutForecastInput(input, players), input);
  assert.deepEqual(
    Object.keys(input.model.weights).sort(),
    [...BIG_FIVE_DEBUT_FACTOR_KEYS].sort()
  );
  assert.ok(
    Math.abs(Object.values(input.model.weights).reduce((sum, value) => sum + value, 0) - 1) <
      1e-9
  );
  const candidateIds = input.snapshots[0].candidates.map((candidate) => candidate.player_id);
  assert.equal(candidateIds.length, 6);
  assert.equal(new Set(candidateIds).size, 6);
  assert.deepEqual(Object.keys(input.snapshots[0].baselines).sort(), [
    "no_qualifier",
    "other_chinese_player"
  ]);
});

test("reproduces the launch probabilities and fair decimal odds", async () => {
  const { input, players } = await loadFixture();
  const output = buildBigFiveDebutForecast(input, players);
  const expected = new Map([
    ["cn-wei-xiangxin-2008", [41.6, 2.4]],
    ["cn-xu-bin-2004", [14.9, 6.69]],
    ["cn-wang-yudong-2006", [7.1, 14.17]],
    ["cn-zhang-jiaming-2007", [4.6, 21.68]],
    ["cn-wang-bohao-2005", [4.7, 21.14]],
    ["cn-du-yuezheng-2005", [1.0, 97.14]],
    ["other_chinese_player", [2.0, 50.71]],
    ["no_qualifier", [24.0, 4.16]]
  ]);

  assert.equal(output.outcomes.length, 8);
  assert.ok(
    Math.abs(output.outcomes.reduce((sum, outcome) => sum + outcome.probability, 0) - 1) <
      0.00001
  );
  for (const outcome of output.outcomes) {
    assert.deepEqual(
      [outcome.probability_percent, outcome.decimal_odds],
      expected.get(outcome.id),
      outcome.id
    );
    assert.ok(
      Math.abs(outcome.decimal_odds - 1 / outcome.probability) < 0.02,
      outcome.id
    );
    assert.equal(outcome.probability_change_pp, null);
  }
  assert.equal(output.leader.player_id, "cn-wei-xiangxin-2008");
  assert.equal(output.market.settlement.tie_rule, "Exact identical debut timestamps are settled as joint winners.");
});

test("compares a new snapshot with its predecessor in percentage points", async () => {
  const { input, players } = await loadFixture();
  const nextSnapshot = structuredClone(input.snapshots[0]);
  nextSnapshot.as_of = "2026-07-27";
  nextSnapshot.candidates.find(
    (candidate) => candidate.player_id === "cn-xu-bin-2004"
  ).factors.first_team_proximity = 90;
  input.snapshots.push(nextSnapshot);

  const output = buildBigFiveDebutForecast(input, players);
  const xuBin = output.outcomes.find((outcome) => outcome.id === "cn-xu-bin-2004");
  assert.ok(xuBin.probability_change_pp > 0);
  assert.equal(output.previous_snapshot, "2026-07-26");
});

test("marks stale payloads and distinguishes initial from refresh failures", () => {
  const payload = {
    last_checked: "2026-07-26",
    freshness: { stale_after_days: 7 }
  };
  assert.equal(isForecastStale(payload, Date.parse("2026-08-02T12:00:00Z")), false);
  assert.equal(isForecastStale(payload, Date.parse("2026-08-03T00:00:00Z")), true);
  assert.equal(forecastFailureMode(null), "initial-error");
  assert.equal(forecastFailureMode(payload), "preserve-current");
});

test("places an accessible forecast table between the builder and editorial lineups", async () => {
  const [html, script] = await Promise.all([
    fs.readFile(new URL("lineup.html", repositoryRoot), "utf8"),
    fs.readFile(new URL("assets/lineup.js", repositoryRoot), "utf8")
  ]);
  const workspaceIndex = html.indexOf('class="lineup-workspace"');
  const forecastIndex = html.indexOf('id="debutForecastTitle"');
  const editorialIndex = html.indexOf('id="editorialLineupsTitle"');
  assert.ok(workspaceIndex < forecastIndex && forecastIndex < editorialIndex);
  assert.match(html, /<table class="forecast-table">/);
  assert.match(html, /id="debutForecastStatus"[^>]+role="status"[^>]+aria-live="polite"/);
  assert.match(html, /id="refreshForecastButton"/);
  assert.match(html, /id="retryForecastButton"/);
  assert.match(script, /cache: "no-store"/);
  assert.match(script, /forecastFailureMode\(forecastPayload\)/);
});
