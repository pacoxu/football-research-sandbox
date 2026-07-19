import assert from "node:assert/strict";
import test from "node:test";
import {
  buildForecastPayload,
  loadForecastInput,
  validateForecastInput
} from "../scripts/lib/world-cup-forecast.mjs";

const input = await loadForecastInput();

function probabilitySum(edition) {
  return edition.teams.reduce((sum, team) => sum + team.probability, 0);
}

function median(values) {
  const sorted = [...values].sort((left, right) => left - right);
  return sorted[Math.floor(sorted.length / 2)];
}

test("validates the complete AFC forecast input", () => {
  assert.equal(validateForecastInput(input), input);
  assert.equal(new Set(input.teams.map((team) => team.id)).size, 46);
  assert.equal(input.teams.filter((team) => team.asian_cup_2027).length, 24);
});

test("builds deterministic forecasts with a fixed seed", () => {
  const first = buildForecastPayload(input);
  const second = buildForecastPayload(input);
  assert.deepEqual(second, first);
});

test("calibrates every edition to the configured expected AFC slots", () => {
  const payload = buildForecastPayload(input);
  for (const edition of payload.editions) {
    assert.ok(Math.abs(probabilitySum(edition) - edition.expected_slots) < 0.001);
    for (const team of edition.teams) {
      assert.ok(team.probability >= 0 && team.probability <= 1);
      assert.ok(team.interval_80.lower <= team.probability);
      assert.ok(team.interval_80.upper >= team.probability);
    }
  }
});

test("treats Saudi Arabia as the 2034 host and keeps later hosts unknown", () => {
  const payload = buildForecastPayload(input);
  const edition2034 = payload.editions.find((edition) => edition.year === 2034);
  const saudiArabia = edition2034.teams.find((team) => team.team_id === "saudi-arabia");
  assert.equal(edition2034.host_team_id, "saudi-arabia");
  assert.equal(saudiArabia.probability, 1);
  assert.deepEqual(saudiArabia.interval_80, { lower: 1, upper: 1 });
  assert.equal(payload.editions.find((edition) => edition.year === 2038).host_team_id, null);
  assert.equal(payload.editions.find((edition) => edition.year === 2042).host_team_id, null);
});

test("widens the typical long-range interval and exposes China rivals", () => {
  const payload = buildForecastPayload(input);
  const edition2030 = payload.editions.find((edition) => edition.year === 2030);
  const edition2042 = payload.editions.find((edition) => edition.year === 2042);
  const width2030 = median(edition2030.teams.map((team) => team.interval_80.upper - team.interval_80.lower));
  const width2042 = median(edition2042.teams.map((team) => team.interval_80.upper - team.interval_80.lower));
  assert.ok(width2042 > width2030);
  assert.equal(edition2030.china.rival_ids.length, 5);
  assert.equal(new Set(edition2030.china.rival_ids).size, 5);
});

test("reports senior and combined rolling backtest metrics", () => {
  const payload = buildForecastPayload(input);
  assert.equal(payload.backtest.length, 4);
  for (const row of payload.backtest) {
    assert.ok(row.sample_size > 0);
    assert.ok(Number.isFinite(row.senior_baseline.brier));
    assert.ok(Number.isFinite(row.combined.brier));
    assert.ok(Math.abs(row.senior_weight + row.pipeline_weight - 1) < 0.001);
  }
});
