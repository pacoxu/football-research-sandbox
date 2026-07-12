export const OVERSEAS_STATUSES = Object.freeze([
  "active-registered",
  "pending-effective",
  "trial-watch",
  "returned",
  "historical-only"
]);

export const OVERSEAS_STATUS_SET = new Set(OVERSEAS_STATUSES);

export function normalizeCountry(value) {
  const normalized = String(value ?? "").trim().toLowerCase();
  const aliases = {
    "china pr": "china",
    "people's republic of china": "china",
    "korea republic": "south korea",
    "republic of korea": "south korea"
  };

  return aliases[normalized] ?? normalized;
}

export function hasForeignRegistration(player) {
  const playerCountry = normalizeCountry(player?.country);
  const clubCountry = normalizeCountry(player?.registration_club?.country);
  return Boolean(playerCountry && clubCountry && playerCountry !== clubCountry);
}

export function countOverseasStatuses(players, country = "China PR") {
  const counts = Object.fromEntries(OVERSEAS_STATUSES.map((status) => [status, 0]));
  const normalizedCountry = normalizeCountry(country);

  for (const player of players) {
    if (normalizeCountry(player.country) !== normalizedCountry) {
      continue;
    }
    if (OVERSEAS_STATUS_SET.has(player.overseas_status)) {
      counts[player.overseas_status] += 1;
    }
  }

  return counts;
}

export function getChinaOverseasStatusErrors(player) {
  if (normalizeCountry(player?.country) !== "china") {
    return [];
  }

  const errors = [];
  const status = player.overseas_status;
  const foreignRegistration = hasForeignRegistration(player);
  const hasForeignPathway = (player.training_pathway ?? []).some(
    (step) =>
      normalizeCountry(step.country) &&
      normalizeCountry(step.country) !== normalizeCountry(player.country)
  );
  const squadStatuses = new Set(
    (player.tournament_participation ?? []).map((entry) => entry.squad_status)
  );

  if (foreignRegistration && status !== "active-registered") {
    errors.push("foreign registration must be active-registered");
  }

  if (status === undefined) {
    if (hasForeignPathway) {
      errors.push("foreign pathway requires overseas_status");
    }
    return errors;
  }

  if (!OVERSEAS_STATUS_SET.has(status)) {
    errors.push(`invalid overseas_status: ${status}`);
    return errors;
  }

  if (status === "active-registered") {
    if (!foreignRegistration) {
      errors.push("active-registered requires foreign registration");
    }
    return errors;
  }

  if (foreignRegistration) {
    errors.push(`${status} must keep the current domestic registration`);
  }
  if (status === "returned" && !hasForeignPathway) {
    errors.push("returned requires a foreign training pathway");
  }
  if (status === "trial-watch" && !squadStatuses.has("tracked")) {
    errors.push("trial-watch requires a tracked record");
  }
  if (status === "pending-effective" && !squadStatuses.has("pending-transfer")) {
    errors.push("pending-effective requires a pending-transfer record");
  }

  return errors;
}
