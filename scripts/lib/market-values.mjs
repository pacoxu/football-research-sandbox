export const MARKET_VALUE_STATUSES = new Set([
  "available",
  "no-market-value",
  "profile-not-found",
  "ambiguous-profile",
  "team-page-only",
  "fetch-error",
  "stale"
]);

export function formatCompactMarketValue(value) {
  if (typeof value !== "number" || value <= 0) {
    return "";
  }

  if (value >= 1_000_000) {
    return `€${(value / 1_000_000).toFixed(2)}m`;
  }

  return `€${Math.round(value / 1_000)}k`;
}

export function buildMarketValuePoint(marketValue, metadata = {}) {
  if (!marketValue || typeof marketValue.value !== "number" || marketValue.value <= 0) {
    return null;
  }

  return {
    eur: marketValue.value,
    currency: marketValue.currency ?? "EUR",
    display: formatCompactMarketValue(marketValue.value),
    date: marketValue.determined ?? null,
    ...(metadata.club_id ? { club_id: String(metadata.club_id) } : {}),
    ...(Number.isInteger(metadata.season_id) ? { season_id: metadata.season_id } : {}),
    ...(Number.isInteger(metadata.age) ? { age: metadata.age } : {})
  };
}

function pointKey(point) {
  return [point.date ?? "", point.currency, point.eur].join("|");
}

export function normalizeMarketValueHistory(payload) {
  const entries = Array.isArray(payload?.data?.history) ? payload.data.history : [];
  const history = entries
    .map((entry) =>
      buildMarketValuePoint(entry?.marketValue, {
        club_id: entry?.clubId,
        season_id: entry?.seasonId,
        age: entry?.age
      })
    )
    .filter(Boolean);
  const current = buildMarketValuePoint(payload?.data?.current?.marketValue);

  if (current?.date && !history.some((point) => pointKey(point) === pointKey(current))) {
    history.push(current);
  }

  const unique = new Map();
  for (const point of history) {
    unique.set(pointKey(point), point);
  }

  return [...unique.values()].sort((left, right) => {
    const dateOrder = String(left.date ?? "").localeCompare(String(right.date ?? ""));
    return dateOrder || left.eur - right.eur;
  });
}

export function summarizeMarketValuePayload(payload) {
  const history = normalizeMarketValueHistory(payload);
  const apiCurrent = buildMarketValuePoint(payload?.data?.current?.marketValue);
  const current = apiCurrent ?? history.at(-1) ?? null;
  const peak = history.reduce((best, point) => {
    if (!best || point.eur > best.eur) {
      return point;
    }
    return best;
  }, null);

  return {
    status: current || peak ? "available" : "no-market-value",
    history,
    history_points: history.length,
    current,
    peak,
    last_change_date: history.at(-1)?.date ?? current?.date ?? null
  };
}

export function preservePreviousOnFailure(previous, nextRecord, errorMessage) {
  const hasPreviousValue =
    Array.isArray(previous?.history) && previous.history.length > 0 || previous?.current || previous?.peak;

  if (!hasPreviousValue) {
    return {
      ...nextRecord,
      status: "fetch-error",
      refresh_error: errorMessage
    };
  }

  return {
    ...previous,
    checked_at: nextRecord.checked_at,
    status: "stale",
    source: nextRecord.source,
    lookup: nextRecord.lookup,
    alternatives: previous.alternatives ?? [],
    refresh_error: errorMessage,
    last_success_at: previous.last_success_at ?? previous.checked_at ?? null
  };
}

export function normalizeIdentityText(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\p{Script=Han}\p{Script=Hangul}\p{Script=Hiragana}\p{Script=Katakana}]+/gu, " ")
    .trim();
}

function tokenSet(value) {
  return new Set(normalizeIdentityText(value).split(/\s+/).filter(Boolean));
}

function tokensEqual(left, right) {
  if (!left.size || !right.size || left.size !== right.size) {
    return false;
  }
  return [...left].every((token) => right.has(token));
}

function tokenRotations(value) {
  const tokens = normalizeIdentityText(value).split(/\s+/).filter(Boolean);
  return new Set(
    tokens.map((_, index) => [...tokens.slice(index), ...tokens.slice(0, index)].join(""))
  );
}

export function namesMatch(player, profile) {
  const playerNames = [
    player.name,
    player.local_name,
    player.names?.zh,
    player.names?.en,
    player.names?.native,
    player.names?.ja,
    player.names?.ko
  ].filter(Boolean);
  const profileNames = [
    profile?.name,
    profile?.shortName,
    profile?.displayName,
    profile?.nationalityDetails?.passportName
  ].filter(Boolean);

  return playerNames.some((left) =>
    profileNames.some((right) => {
      const normalizedLeft = normalizeIdentityText(left);
      const normalizedRight = normalizeIdentityText(right);
      return (
        normalizedLeft === normalizedRight ||
        tokensEqual(tokenSet(normalizedLeft), tokenSet(normalizedRight)) ||
        [...tokenRotations(normalizedLeft)].some((rotation) => tokenRotations(normalizedRight).has(rotation))
      );
    })
  );
}

const POSITION_GROUPS = new Map([
  ["goalkeeper", "GOALKEEPER"],
  ["centre back", "DEFENDER"],
  ["center back", "DEFENDER"],
  ["left back", "DEFENDER"],
  ["right back", "DEFENDER"],
  ["defender", "DEFENDER"],
  ["defensive midfield", "MIDFIELDER"],
  ["central midfield", "MIDFIELDER"],
  ["attacking midfield", "MIDFIELDER"],
  ["left midfield", "MIDFIELDER"],
  ["right midfield", "MIDFIELDER"],
  ["midfielder", "MIDFIELDER"],
  ["left winger", "FORWARD"],
  ["right winger", "FORWARD"],
  ["centre forward", "FORWARD"],
  ["center forward", "FORWARD"],
  ["second striker", "FORWARD"],
  ["striker", "FORWARD"],
  ["forward", "FORWARD"]
]);

export function positionsMatch(player, profile) {
  const normalized = normalizeIdentityText(player.primary_position).replaceAll("-", " ");
  const expected =
    POSITION_GROUPS.get(normalized) ??
    (normalized.includes("goalkeeper")
      ? "GOALKEEPER"
      : normalized.includes("back") || normalized.includes("defender")
        ? "DEFENDER"
        : normalized.includes("midfield")
          ? "MIDFIELDER"
          : normalized.includes("wing") || normalized.includes("forward") || normalized.includes("striker")
            ? "FORWARD"
            : null);
  const actual = profile?.attributes?.positionGroup;
  return Boolean(expected && actual && expected === actual);
}

export function verifyTransfermarktIdentity(player, profile, nationalityIds) {
  const dateOfBirth = profile?.lifeDates?.dateOfBirth ?? "";
  const primaryNationality = profile?.nationalityDetails?.nationalities?.nationalityId;
  const secondNationality = profile?.nationalityDetails?.nationalities?.secondNationalityId;
  const allowedNationalities = new Set(nationalityIds[player.country] ?? []);
  const birthDateMatch = dateOfBirth === player.birth_date;
  const nationalityMatch =
    allowedNationalities.has(primaryNationality) || allowedNationalities.has(secondNationality);
  const nameMatch = namesMatch(player, profile);
  const positionMatch = positionsMatch(player, profile);
  const matchedFields = [
    ...(birthDateMatch ? ["birth_date"] : []),
    ...(nationalityMatch ? ["nationality"] : []),
    ...(nameMatch ? ["name"] : []),
    ...(positionMatch ? ["position"] : [])
  ];

  return {
    accepted: birthDateMatch && nationalityMatch && (nameMatch || positionMatch),
    birth_date_match: birthDateMatch,
    nationality_match: nationalityMatch,
    name_match: nameMatch,
    position_match: positionMatch,
    matched_fields: matchedFields
  };
}
