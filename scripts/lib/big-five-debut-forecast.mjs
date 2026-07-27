export const BIG_FIVE_DEBUT_FACTOR_KEYS = [
  "first_team_proximity",
  "senior_competitive_experience",
  "big_five_pathway",
  "registration_eligibility",
  "recent_availability"
];

const SPECIAL_OUTCOME_KEYS = ["other_chinese_player", "no_qualifier"];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function isIsoDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value ?? ""));
}

function round(value, digits = 6) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function playerDisplayName(player) {
  return player.names?.zh || player.local_name || player.name;
}

function weightedScore(factors, weights) {
  return BIG_FIVE_DEBUT_FACTOR_KEYS.reduce(
    (total, key) => total + factors[key] * weights[key],
    0
  );
}

function probabilityRows(rows, temperature) {
  const maximumScore = Math.max(...rows.map((row) => row.score));
  const weighted = rows.map((row) => ({
    ...row,
    exponential: Math.exp((row.score - maximumScore) / temperature)
  }));
  const total = weighted.reduce((sum, row) => sum + row.exponential, 0);
  return weighted.map(({ exponential, ...row }) => ({
    ...row,
    probability: exponential / total
  }));
}

function calculateSnapshot(input, snapshot) {
  const candidateRows = snapshot.candidates.map((candidate) => ({
    id: candidate.player_id,
    kind: "player",
    score: weightedScore(candidate.factors, input.model.weights),
    candidate
  }));
  const specialRows = SPECIAL_OUTCOME_KEYS.map((key) => ({
    id: key,
    kind: key === "no_qualifier" ? "no-qualifier" : "other",
    score: snapshot.baselines[key],
    special: input.special_outcomes[key]
  }));
  return probabilityRows([...candidateRows, ...specialRows], input.model.temperature);
}

export function validateBigFiveDebutForecastInput(input, players = []) {
  assert(input?.schema_version === 1, "Unsupported big-five debut forecast schema version");
  assert(input.market?.id, "Missing big-five debut forecast market id");
  assert(input.market?.country === "China PR", "Big-five debut forecast must target China PR");
  assert(isIsoDate(input.market?.closes_on), "Invalid big-five debut forecast close date");
  assert(
    Array.isArray(input.market?.competitions) && input.market.competitions.length === 5,
    "Big-five debut forecast must define five competitions"
  );
  assert(
    input.market?.settlement?.appearance_scope === "top-flight-league",
    "Big-five debut forecast must settle on top-flight league appearances"
  );

  const weightKeys = Object.keys(input.model?.weights ?? {}).sort();
  assert(
    JSON.stringify(weightKeys) === JSON.stringify([...BIG_FIVE_DEBUT_FACTOR_KEYS].sort()),
    "Big-five debut forecast weights do not match the supported factors"
  );
  const weightTotal = Object.values(input.model.weights).reduce((sum, weight) => sum + weight, 0);
  assert(Math.abs(weightTotal - 1) < 1e-9, "Big-five debut forecast weights must sum to 1");
  assert(
    Number.isFinite(input.model.temperature) && input.model.temperature > 0,
    "Big-five debut forecast temperature must be positive"
  );
  assert(
    Number.isInteger(input.freshness?.stale_after_days) && input.freshness.stale_after_days > 0,
    "Big-five debut forecast freshness window must be a positive integer"
  );

  for (const key of BIG_FIVE_DEBUT_FACTOR_KEYS) {
    assert(input.factor_labels?.[key], `Missing big-five debut forecast factor label: ${key}`);
  }
  for (const key of SPECIAL_OUTCOME_KEYS) {
    assert(input.special_outcomes?.[key]?.label, `Missing special outcome label: ${key}`);
    assert(input.special_outcomes?.[key]?.rationale, `Missing special outcome rationale: ${key}`);
  }

  assert(
    Array.isArray(input.snapshots) && input.snapshots.length > 0,
    "Big-five debut forecast requires at least one snapshot"
  );
  const knownPlayers = new Set(players.map((player) => player.id));
  let previousDate = "";
  for (const snapshot of input.snapshots) {
    assert(isIsoDate(snapshot.as_of), "Invalid big-five debut forecast snapshot date");
    assert(snapshot.as_of > previousDate, "Big-five debut forecast snapshots must be date-sorted");
    previousDate = snapshot.as_of;
    assert(
      Array.isArray(snapshot.candidates) && snapshot.candidates.length === 6,
      `Big-five debut forecast snapshot ${snapshot.as_of} must contain six candidates`
    );
    const playerIds = new Set();
    for (const candidate of snapshot.candidates) {
      assert(!playerIds.has(candidate.player_id), `Duplicate forecast candidate: ${candidate.player_id}`);
      playerIds.add(candidate.player_id);
      if (knownPlayers.size > 0) {
        assert(knownPlayers.has(candidate.player_id), `Unknown forecast candidate: ${candidate.player_id}`);
      }
      assert(candidate.rationale, `Missing forecast rationale: ${candidate.player_id}`);
      assert(
        Array.isArray(candidate.source_links) && candidate.source_links.length > 0,
        `Missing forecast sources: ${candidate.player_id}`
      );
      for (const source of candidate.source_links) {
        assert(/^https:\/\//.test(source.url ?? ""), `Invalid forecast source: ${candidate.player_id}`);
        assert(isIsoDate(source.checked_at), `Invalid forecast source date: ${candidate.player_id}`);
      }
      const factorKeys = Object.keys(candidate.factors ?? {}).sort();
      assert(
        JSON.stringify(factorKeys) === JSON.stringify([...BIG_FIVE_DEBUT_FACTOR_KEYS].sort()),
        `Invalid forecast factors: ${candidate.player_id}`
      );
      for (const value of Object.values(candidate.factors)) {
        assert(
          Number.isFinite(value) && value >= 0 && value <= 100,
          `Forecast factors must be between 0 and 100: ${candidate.player_id}`
        );
      }
    }
    for (const key of SPECIAL_OUTCOME_KEYS) {
      assert(
        Number.isFinite(snapshot.baselines?.[key]) &&
          snapshot.baselines[key] >= 0 &&
          snapshot.baselines[key] <= 100,
        `Invalid special outcome baseline: ${key}`
      );
    }
  }
  return input;
}

export function buildBigFiveDebutForecast(input, players) {
  validateBigFiveDebutForecastInput(input, players);
  const playerById = new Map(players.map((player) => [player.id, player]));
  const currentSnapshot = input.snapshots.at(-1);
  const previousSnapshot = input.snapshots.at(-2);
  const currentRows = calculateSnapshot(input, currentSnapshot);
  const previousRows = previousSnapshot
    ? new Map(calculateSnapshot(input, previousSnapshot).map((row) => [row.id, row]))
    : new Map();
  const marketRank = new Map(
    [...currentRows]
      .sort((left, right) => right.probability - left.probability)
      .map((row, index) => [row.id, index + 1])
  );
  const candidateRank = new Map(
    currentRows
      .filter((row) => row.kind === "player")
      .sort((left, right) => right.probability - left.probability)
      .map((row, index) => [row.id, index + 1])
  );

  const outcomes = currentRows
    .map((row) => {
      const previousProbability = previousRows.get(row.id)?.probability;
      const common = {
        id: row.id,
        kind: row.kind,
        market_rank: marketRank.get(row.id),
        candidate_rank: candidateRank.get(row.id) ?? null,
        model_score: round(row.score, 2),
        probability: round(row.probability),
        probability_percent: round(row.probability * 100, 1),
        decimal_odds: round(1 / row.probability, 2),
        probability_change_pp:
          previousProbability === undefined
            ? null
            : round((row.probability - previousProbability) * 100, 2)
      };

      if (row.kind !== "player") {
        return {
          ...common,
          label: row.special.label,
          rationale: row.special.rationale,
          factor_scores: [],
          source_links: []
        };
      }

      const player = playerById.get(row.id);
      return {
        ...common,
        label: playerDisplayName(player),
        player: {
          id: player.id,
          names: player.names,
          birth_date: player.birth_date,
          primary_position: player.primary_position,
          registration_club: player.registration_club,
          profile_url: `./player.html?id=${encodeURIComponent(player.id)}`
        },
        rationale: row.candidate.rationale,
        factor_scores: BIG_FIVE_DEBUT_FACTOR_KEYS.map((key) => ({
          key,
          label: input.factor_labels[key],
          score: row.candidate.factors[key],
          weight: input.model.weights[key],
          contribution: round(row.candidate.factors[key] * input.model.weights[key], 2)
        })),
        source_links: row.candidate.source_links
      };
    })
    .sort((left, right) => left.market_rank - right.market_rank);

  const topPlayer = outcomes
    .filter((outcome) => outcome.kind === "player")
    .sort((left, right) => left.candidate_rank - right.candidate_rank)[0];
  const noQualifier = outcomes.find((outcome) => outcome.kind === "no-qualifier");

  return {
    schema_version: 1,
    market: input.market,
    last_checked: currentSnapshot.as_of,
    previous_snapshot: previousSnapshot?.as_of ?? null,
    freshness: input.freshness,
    model: {
      type: "weighted-softmax",
      temperature: input.model.temperature,
      formula: "probability = exp(score / temperature) / sum(exp(all scores / temperature))",
      fair_odds_formula: "decimal_odds = 1 / probability",
      factors: BIG_FIVE_DEBUT_FACTOR_KEYS.map((key) => ({
        key,
        label: input.factor_labels[key],
        weight: input.model.weights[key]
      }))
    },
    leader: {
      player_id: topPlayer.player.id,
      label: topPlayer.label,
      probability: topPlayer.probability,
      probability_percent: topPlayer.probability_percent,
      decimal_odds: topPlayer.decimal_odds
    },
    no_qualifier: {
      probability: noQualifier.probability,
      probability_percent: noQualifier.probability_percent,
      decimal_odds: noQualifier.decimal_odds
    },
    outcomes,
    disclaimer: input.disclaimer
  };
}
