import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
export const forecastPaths = {
  input: path.resolve(currentDir, "../../data/raw/forecast/model.json"),
  output: path.resolve(currentDir, "../../data/site/world-cup-forecast.json")
};

const LEADS = [4, 8, 12, 16];
const PRIOR_SENIOR_WEIGHTS = new Map([
  [4, 0.75],
  [8, 0.55],
  [12, 0.35],
  [16, 0.2]
]);
const PIPELINE_WEIGHTS = {
  u17: 0.12,
  u20: 0.18,
  u23: 0.22,
  overseas: 0.18,
  transition: 0.15,
  continuity: 0.15
};

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function isIsoDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value ?? ""));
}

function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value));
}

function sigmoid(value) {
  if (value >= 0) {
    const exponent = Math.exp(-value);
    return 1 / (1 + exponent);
  }
  const exponent = Math.exp(value);
  return exponent / (1 + exponent);
}

function logit(probability) {
  const safe = clamp(probability, 1e-8, 1 - 1e-8);
  return Math.log(safe / (1 - safe));
}

function round(value, digits = 4) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function mean(values) {
  if (values.length === 0) {
    return 0;
  }
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function quantile(values, probability) {
  const sorted = [...values].sort((left, right) => left - right);
  if (sorted.length === 0) {
    return 0;
  }
  const index = (sorted.length - 1) * probability;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) {
    return sorted[lower];
  }
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
}

function createRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function randomNormal(random) {
  const first = Math.max(random(), Number.EPSILON);
  const second = random();
  return Math.sqrt(-2 * Math.log(first)) * Math.cos(2 * Math.PI * second);
}

export async function loadForecastInput() {
  return JSON.parse(await fs.readFile(forecastPaths.input, "utf8"));
}

export function validateForecastInput(input) {
  assert(input?.schema_version === 1, "Unsupported forecast schema version");
  assert(isIsoDate(input.as_of), "Forecast as_of must be an ISO date");
  assert(Number.isInteger(input.seed), "Forecast seed must be an integer");
  assert(input.bootstrap_samples === 1000, "Forecast must use 1,000 bootstrap samples");
  assert(Array.isArray(input.sources) && input.sources.length > 0, "Forecast sources are required");
  assert(Array.isArray(input.teams) && input.teams.length === 46, "Forecast model must cover 46 AFC entrants");

  const sourceIds = new Set();
  for (const source of input.sources) {
    assert(!sourceIds.has(source.id), `Duplicate forecast source: ${source.id}`);
    sourceIds.add(source.id);
    assert(/^https:\/\//.test(source.url), `Invalid forecast source URL: ${source.id}`);
    assert(isIsoDate(source.checked_at), `Invalid forecast source date: ${source.id}`);
    assert(Array.isArray(source.supports) && source.supports.length > 0, `Missing source supports: ${source.id}`);
  }
  for (const key of ["senior", "u17", "u20", "u23", "overseas", "transition", "continuity"]) {
    assert(Array.isArray(input.feature_sources?.[key]) && input.feature_sources[key].length > 0, `Missing sources for ${key}`);
    for (const sourceId of input.feature_sources[key]) {
      assert(sourceIds.has(sourceId), `Unknown ${key} source: ${sourceId}`);
    }
  }

  const teamIds = new Set();
  for (const team of input.teams) {
    assert(!teamIds.has(team.id), `Duplicate forecast team: ${team.id}`);
    teamIds.add(team.id);
    assert(team.name?.zh && team.name?.en, `Missing localized team name: ${team.id}`);
    for (const key of ["senior", "u17", "u20", "u23", "overseas", "transition", "continuity"]) {
      assert(Number.isFinite(team[key]) && team[key] >= 0 && team[key] <= 100, `Invalid ${key}: ${team.id}`);
    }
    assert(team.coverage >= 0 && team.coverage <= 1, `Invalid coverage: ${team.id}`);
  }

  assert(input.assumptions.map((entry) => entry.year).join(",") === "2030,2034,2038,2042", "Forecast editions must be 2030, 2034, 2038, 2042");
  const assumption2034 = input.assumptions.find((entry) => entry.year === 2034);
  assert(assumption2034.host_team_id === "saudi-arabia", "Saudi Arabia must be the 2034 host");
  for (const assumption of input.assumptions) {
    assert(assumption.expected_slots === 8.5, `Unexpected slot assumption for ${assumption.year}`);
    if ([2038, 2042].includes(assumption.year)) {
      assert(assumption.host_team_id === null, `${assumption.year} host must remain TBD`);
    }
  }

  assert(input.training_feature_years.length === 10, "Expected ten historical feature snapshots");
  assert(input.training_target_years.length === 7, "Expected seven historical target cycles");
  const profileIds = new Set();
  for (const profile of input.training_profiles) {
    assert(teamIds.has(profile.team_id), `Unknown training team: ${profile.team_id}`);
    assert(!profileIds.has(profile.team_id), `Duplicate training profile: ${profile.team_id}`);
    profileIds.add(profile.team_id);
    assert(profile.senior.length === input.training_feature_years.length, `Invalid senior history: ${profile.team_id}`);
    assert(profile.pipeline.length === input.training_feature_years.length, `Invalid pipeline history: ${profile.team_id}`);
    assert(profile.qualified.length === input.training_target_years.length, `Invalid outcome history: ${profile.team_id}`);
  }
  return input;
}

function normalizedIndex(value) {
  return (value - 50) / 20;
}

function pipelineIndex(team) {
  return Object.entries(PIPELINE_WEIGHTS).reduce(
    (total, [key, weight]) => total + team[key] * weight,
    0
  );
}

function buildObservations(input, lead) {
  const featureIndex = new Map(input.training_feature_years.map((year, index) => [year, index]));
  const rows = [];
  input.training_target_years.forEach((targetYear, targetIndex) => {
    const snapshotYear = targetYear - lead;
    const snapshotIndex = featureIndex.get(snapshotYear);
    if (snapshotIndex === undefined) {
      return;
    }
    for (const profile of input.training_profiles) {
      const outcome = profile.qualified[targetIndex];
      if (outcome === null || snapshotYear < profile.eligible_from) {
        continue;
      }
      assert(snapshotYear < targetYear, `Forecast leakage for ${profile.team_id} ${targetYear}`);
      rows.push({
        team_id: profile.team_id,
        target_year: targetYear,
        snapshot_year: snapshotYear,
        senior: normalizedIndex(profile.senior[snapshotIndex]),
        pipeline: normalizedIndex(profile.pipeline[snapshotIndex]),
        outcome
      });
    }
  });
  return rows;
}

function fitLogistic(rows, feature, lambda = 1.5) {
  if (rows.length === 0) {
    return { intercept: -1, coefficient: 1 };
  }
  let intercept = logit(mean(rows.map((row) => row.outcome)) || 0.05);
  let coefficient = 0;
  for (let iteration = 0; iteration < 40; iteration += 1) {
    let gradientIntercept = 0;
    let gradientCoefficient = -lambda * coefficient;
    let h00 = 0;
    let h01 = 0;
    let h11 = lambda;
    for (const row of rows) {
      const x = row[feature];
      const probability = sigmoid(intercept + coefficient * x);
      const weight = Math.max(probability * (1 - probability), 1e-6);
      gradientIntercept += row.outcome - probability;
      gradientCoefficient += (row.outcome - probability) * x;
      h00 += weight;
      h01 += weight * x;
      h11 += weight * x * x;
    }
    const determinant = h00 * h11 - h01 * h01;
    if (Math.abs(determinant) < 1e-10) {
      break;
    }
    const deltaIntercept = (gradientIntercept * h11 - gradientCoefficient * h01) / determinant;
    const deltaCoefficient = (gradientCoefficient * h00 - gradientIntercept * h01) / determinant;
    intercept += deltaIntercept;
    coefficient += deltaCoefficient;
    if (Math.abs(deltaIntercept) + Math.abs(deltaCoefficient) < 1e-8) {
      break;
    }
  }
  return { intercept, coefficient };
}

function predictModelLogit(model, featureValue) {
  return model.intercept + model.coefficient * featureValue;
}

function scoreRows(rows, seniorModel, pipelineModel, seniorWeight) {
  return rows.map((row) => {
    const seniorLogit = predictModelLogit(seniorModel, row.senior);
    const pipelineLogit = predictModelLogit(pipelineModel, row.pipeline);
    return {
      ...row,
      senior_probability: sigmoid(seniorLogit),
      combined_probability: sigmoid(seniorWeight * seniorLogit + (1 - seniorWeight) * pipelineLogit)
    };
  });
}

function brier(rows, key) {
  return mean(rows.map((row) => (row[key] - row.outcome) ** 2));
}

function logLoss(rows, key) {
  return mean(
    rows.map((row) => {
      const probability = clamp(row[key], 1e-8, 1 - 1e-8);
      return -(row.outcome * Math.log(probability) + (1 - row.outcome) * Math.log(1 - probability));
    })
  );
}

function rollingPredictions(rows, seniorWeight) {
  const predictions = [];
  const targetYears = [...new Set(rows.map((row) => row.target_year))].sort((a, b) => a - b);
  for (const targetYear of targetYears.slice(3)) {
    const training = rows.filter((row) => row.target_year < targetYear);
    const testing = rows.filter((row) => row.target_year === targetYear);
    const seniorModel = fitLogistic(training, "senior");
    const pipelineModel = fitLogistic(training, "pipeline");
    predictions.push(...scoreRows(testing, seniorModel, pipelineModel, seniorWeight));
  }
  return predictions;
}

function chooseBlendWeight(rows, lead) {
  let best = { weight: PRIOR_SENIOR_WEIGHTS.get(lead), score: Number.POSITIVE_INFINITY };
  for (let step = 0; step <= 20; step += 1) {
    const weight = step / 20;
    const predictions = rollingPredictions(rows, weight);
    const score = brier(predictions, "combined_probability");
    if (score < best.score) {
      best = { weight, score };
    }
  }
  const prior = PRIOR_SENIOR_WEIGHTS.get(lead);
  return round(best.weight * 0.7 + prior * 0.3, 3);
}

function buildModelBundle(input) {
  const bundles = [];
  let previousWeight = 1;
  for (const lead of LEADS) {
    const observations = buildObservations(input, lead);
    const learnedWeight = chooseBlendWeight(observations, lead);
    let seniorWeight = Math.min(previousWeight, learnedWeight);
    const candidateRolling = rollingPredictions(observations, seniorWeight);
    if (brier(candidateRolling, "combined_probability") > brier(candidateRolling, "senior_probability")) {
      seniorWeight = 1;
    }
    seniorWeight = Math.min(previousWeight, seniorWeight);
    previousWeight = seniorWeight;
    const rolling = rollingPredictions(observations, seniorWeight);
    const seniorModel = fitLogistic(observations, "senior");
    const pipelineModel = fitLogistic(observations, "pipeline");
    bundles.push({
      lead,
      observations,
      seniorModel,
      pipelineModel,
      seniorWeight,
      backtest: {
        lead_years: lead,
        sample_size: rolling.length,
        test_cycles: [...new Set(rolling.map((row) => row.target_year))],
        senior_weight: round(seniorWeight, 3),
        pipeline_weight: round(1 - seniorWeight, 3),
        senior_baseline: {
          brier: round(brier(rolling, "senior_probability")),
          log_loss: round(logLoss(rolling, "senior_probability"))
        },
        combined: {
          brier: round(brier(rolling, "combined_probability")),
          log_loss: round(logLoss(rolling, "combined_probability")),
          calibration_gap: round(
            Math.abs(mean(rolling.map((row) => row.combined_probability)) - mean(rolling.map((row) => row.outcome)))
          )
        }
      }
    });
  }
  return bundles;
}

function calibrateToSlots(logits, teams, expectedSlots, hostTeamId) {
  const hostSlots = hostTeamId ? 1 : 0;
  const competitiveSlots = expectedSlots - hostSlots;
  const eligibleIndexes = teams
    .map((team, index) => ({ team, index }))
    .filter(({ team }) => team.id !== hostTeamId)
    .map(({ index }) => index);
  let lower = -30;
  let upper = 30;
  for (let iteration = 0; iteration < 100; iteration += 1) {
    const midpoint = (lower + upper) / 2;
    const total = eligibleIndexes.reduce((sum, index) => sum + sigmoid(logits[index] + midpoint), 0);
    if (total < competitiveSlots) {
      lower = midpoint;
    } else {
      upper = midpoint;
    }
  }
  const shift = (lower + upper) / 2;
  return teams.map((team, index) => (team.id === hostTeamId ? 1 : sigmoid(logits[index] + shift)));
}

function teamLogits(teams, bundle) {
  return teams.map((team) => {
    const seniorLogit = predictModelLogit(bundle.seniorModel, normalizedIndex(team.senior));
    const pipelineLogit = predictModelLogit(bundle.pipelineModel, normalizedIndex(pipelineIndex(team)));
    return bundle.seniorWeight * seniorLogit + (1 - bundle.seniorWeight) * pipelineLogit;
  });
}

function resampleByCycle(rows, random) {
  const cycles = [...new Set(rows.map((row) => row.target_year))];
  const byCycle = new Map(cycles.map((cycle) => [cycle, rows.filter((row) => row.target_year === cycle)]));
  const sample = [];
  for (let index = 0; index < cycles.length; index += 1) {
    const cycle = cycles[Math.floor(random() * cycles.length)];
    sample.push(...byCycle.get(cycle));
  }
  return sample;
}

function bootstrapIntervals(input, assumption, bundle) {
  const random = createRandom(input.seed + assumption.year);
  const samples = input.teams.map(() => []);
  const leadFactor = bundle.lead / 4;
  for (let iteration = 0; iteration < input.bootstrap_samples; iteration += 1) {
    const training = resampleByCycle(bundle.observations, random);
    const seniorModel = fitLogistic(training, "senior");
    const pipelineModel = fitLogistic(training, "pipeline");
    const logits = input.teams.map((team) => {
      const coveragePenalty = (1 - team.coverage) * 9;
      const seniorNoise = randomNormal(random) * (1.5 + coveragePenalty * 0.4 + leadFactor * 0.7);
      const pipelineNoise = randomNormal(random) * (2.5 + coveragePenalty + leadFactor * 1.6);
      const seniorLogit = predictModelLogit(seniorModel, normalizedIndex(clamp(team.senior + seniorNoise, 0, 100)));
      const pipelineLogit = predictModelLogit(
        pipelineModel,
        normalizedIndex(clamp(pipelineIndex(team) + pipelineNoise, 0, 100))
      );
      return bundle.seniorWeight * seniorLogit + (1 - bundle.seniorWeight) * pipelineLogit;
    });
    const probabilities = calibrateToSlots(logits, input.teams, assumption.expected_slots, assumption.host_team_id);
    probabilities.forEach((probability, index) => samples[index].push(probability));
  }
  return samples.map((values) => ({ lower: quantile(values, 0.1), upper: quantile(values, 0.9) }));
}

function confidenceForCoverage(coverage) {
  if (coverage >= 0.8) {
    return "high";
  }
  if (coverage >= 0.6) {
    return "medium";
  }
  return "low";
}

function tierForProbability(probability) {
  if (probability >= 0.65) {
    return "stable";
  }
  if (probability >= 0.35) {
    return "contender";
  }
  if (probability >= 0.15) {
    return "outside";
  }
  return "watch";
}

function featureMeans(teams) {
  const keys = ["senior", "youth", "overseas", "transition", "continuity"];
  return Object.fromEntries(
    keys.map((key) => [
      key,
      mean(
        teams.map((team) =>
          key === "youth" ? team.u17 * 0.2 + team.u20 * 0.35 + team.u23 * 0.45 : team[key]
        )
      )
    ])
  );
}

function driversForTeam(team, means) {
  const values = {
    senior: team.senior,
    youth: team.u17 * 0.2 + team.u20 * 0.35 + team.u23 * 0.45,
    overseas: team.overseas,
    transition: team.transition,
    continuity: team.continuity
  };
  return Object.entries(values)
    .map(([key, value]) => ({ key, value: round(value, 1), delta: round(value - means[key], 1), direction: value >= means[key] ? "positive" : "negative" }))
    .sort((left, right) => Math.abs(right.delta) - Math.abs(left.delta))
    .slice(0, 3);
}

function chooseRivals(teamResults, targetIndex) {
  const target = teamResults[targetIndex];
  const above = teamResults
    .filter((team) => team.rank < target.rank)
    .sort((left, right) => Math.abs(left.latent_score - target.latent_score) - Math.abs(right.latent_score - target.latent_score));
  const below = teamResults
    .filter((team) => team.rank > target.rank)
    .sort((left, right) => Math.abs(left.latent_score - target.latent_score) - Math.abs(right.latent_score - target.latent_score));
  const selected = [...above.slice(0, 2), ...below.slice(0, 2)];
  const selectedIds = new Set(selected.map((team) => team.team_id));
  const remaining = teamResults
    .filter((team) => team.team_id !== target.team_id && !selectedIds.has(team.team_id))
    .sort((left, right) => Math.abs(left.latent_score - target.latent_score) - Math.abs(right.latent_score - target.latent_score));
  if (remaining[0]) {
    selected.push(remaining[0]);
  }
  return selected
    .sort((left, right) => left.rank - right.rank)
    .map((team) => team.team_id);
}

function scenarioProbability(input, assumption, bundle, baseTeamId, mutate) {
  const teams = input.teams.map((team) => (team.id === baseTeamId ? mutate({ ...team }) : team));
  const probabilities = calibrateToSlots(teamLogits(teams, bundle), teams, assumption.expected_slots, assumption.host_team_id);
  return probabilities[teams.findIndex((team) => team.id === baseTeamId)];
}

function buildEdition(input, assumption, bundle) {
  const logits = teamLogits(input.teams, bundle);
  const probabilities = calibrateToSlots(logits, input.teams, assumption.expected_slots, assumption.host_team_id);
  const intervals = bootstrapIntervals(input, assumption, bundle);
  const means = featureMeans(input.teams);
  const results = input.teams.map((team, index) => {
    const probability = probabilities[index];
    const interval = intervals[index];
    return {
      team_id: team.id,
      name: team.name,
      region: team.region,
      asian_cup_2027: team.asian_cup_2027,
      probability: round(probability),
      interval_80: {
        lower: round(Math.min(interval.lower, probability)),
        upper: round(Math.max(interval.upper, probability))
      },
      tier: tierForProbability(probability),
      coverage: round(team.coverage, 2),
      confidence: confidenceForCoverage(team.coverage),
      latent_score: round(logits[index], 5),
      inputs: {
        senior: team.senior,
        youth: round(team.u17 * 0.2 + team.u20 * 0.35 + team.u23 * 0.45, 1),
        overseas: team.overseas,
        transition: team.transition,
        continuity: team.continuity
      },
      drivers: driversForTeam(team, means),
      rival_ids: []
    };
  });
  results.sort((left, right) => right.probability - left.probability || left.team_id.localeCompare(right.team_id));
  results.forEach((team, index) => {
    team.rank = index + 1;
  });
  results.forEach((team, index) => {
    team.rival_ids = chooseRivals(results, index);
  });

  const chinaIndex = results.findIndex((team) => team.team_id === "china-pr");
  const baseChinaProbability = results[chinaIndex].probability;
  const youthValues = input.teams.map((team) => team.u17 * 0.2 + team.u20 * 0.35 + team.u23 * 0.45);
  const youthMean = mean(youthValues);
  const youthSd = Math.sqrt(mean(youthValues.map((value) => (value - youthMean) ** 2)));
  const youthScenario = scenarioProbability(input, assumption, bundle, "china-pr", (team) => ({
    ...team,
    u17: clamp(team.u17 + youthSd, 0, 100),
    u20: clamp(team.u20 + youthSd, 0, 100),
    u23: clamp(team.u23 + youthSd, 0, 100)
  }));
  const overseasScenario = scenarioProbability(input, assumption, bundle, "china-pr", (team) => ({
    ...team,
    overseas: clamp(team.overseas * 1.25, 0, 100)
  }));

  return {
    year: assumption.year,
    lead_years: bundle.lead,
    outlook_type: assumption.year <= 2034 ? "qualification_forecast" : "system_outlook",
    confidence: assumption.year === 2030 ? "medium" : assumption.year === 2034 ? "medium-low" : "low",
    expected_slots: assumption.expected_slots,
    competitive_slots: assumption.expected_slots - (assumption.host_team_id ? 1 : 0),
    host_team_id: assumption.host_team_id,
    format_status: assumption.format_status,
    expected_qualifier_ids: results.filter((team) => team.team_id !== assumption.host_team_id).slice(0, assumption.host_team_id ? 7 : 8).map((team) => team.team_id),
    playoff_bubble_ids: results.filter((team) => team.team_id !== assumption.host_team_id).slice(assumption.host_team_id ? 7 : 8, assumption.host_team_id ? 11 : 12).map((team) => team.team_id),
    china: {
      rank: results[chinaIndex].rank,
      probability: baseChinaProbability,
      interval_80: results[chinaIndex].interval_80,
      rival_ids: results[chinaIndex].rival_ids,
      sensitivity: {
        youth_plus_one_sd: { probability: round(youthScenario), delta: round(youthScenario - baseChinaProbability) },
        overseas_minutes_plus_25_percent: { probability: round(overseasScenario), delta: round(overseasScenario - baseChinaProbability) }
      }
    },
    teams: results
  };
}

export function buildForecastPayload(input) {
  validateForecastInput(input);
  const bundles = buildModelBundle(input);
  const editions = input.assumptions.map((assumption, index) => buildEdition(input, assumption, bundles[index]));
  editions.forEach((edition, editionIndex) => {
    const previous = editions[editionIndex - 1];
    for (const team of edition.teams) {
      if (!previous) {
        team.trend = "baseline";
        continue;
      }
      const previousTeam = previous.teams.find((candidate) => candidate.team_id === team.team_id);
      const delta = team.probability - previousTeam.probability;
      team.trend = delta > 0.03 ? "up" : delta < -0.03 ? "down" : "stable";
    }
  });
  return {
    metadata: {
      schema_version: 1,
      model_version: input.model_version,
      as_of: input.as_of,
      generated_at: input.as_of,
      seed: input.seed,
      bootstrap_samples: input.bootstrap_samples,
      training_cycles: `${input.training_target_years[0]}-${input.training_target_years.at(-1)}`,
      training_team_count: input.training_profiles.length,
      candidate_team_count: input.teams.length,
      status: "experimental_research_model"
    },
    methodology: {
      models: ["L2-regularized SeniorModel", "L2-regularized PipelineModel"],
      pipeline_weights: PIPELINE_WEIGHTS,
      feature_sources: input.feature_sources,
      blend_selection: "rolling-origin Brier score, regularized toward horizon prior and constrained to non-increasing senior weight",
      probability_calibration: "logit intercept shift so AFC expected qualification probabilities sum to configured slots",
      interval: "10th-90th percentile from 1,000 cycle-bootstrap and input-uncertainty draws",
      exclusions: ["market value", "raw archived player count", "trial or academy registration without senior minutes"]
    },
    assumptions: input.assumptions,
    backtest: bundles.map((bundle) => bundle.backtest),
    editions,
    sources: input.sources
  };
}

export async function buildWorldCupForecast() {
  const input = await loadForecastInput();
  const payload = buildForecastPayload(input);
  await fs.mkdir(path.dirname(forecastPaths.output), { recursive: true });
  await fs.writeFile(forecastPaths.output, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  return payload;
}
