const DAY_MS = 86_400_000;

export function parseIsoDate(value, label = "date") {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value ?? ""))) {
    throw new Error(`Invalid ${label}: ${value}`);
  }
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.valueOf()) || date.toISOString().slice(0, 10) !== value) {
    throw new Error(`Invalid ${label}: ${value}`);
  }
  return date;
}

export function buildFreshnessFinding({
  asOf,
  entityType,
  entityId,
  field,
  lastChecked,
  reviewWindowDays,
  reason
}) {
  const asOfDate = parseIsoDate(asOf, "as-of date");
  const checkedDate = parseIsoDate(lastChecked, `last_checked on ${entityType}:${entityId}`);
  const ageDays = Math.floor((asOfDate - checkedDate) / DAY_MS);
  if (ageDays < 0) throw new Error(`Future last_checked on ${entityType}:${entityId}`);
  if (ageDays <= reviewWindowDays) return null;
  return {
    entity_type: entityType,
    entity_id: entityId,
    field,
    last_checked: lastChecked,
    review_window_days: reviewWindowDays,
    age_days: ageDays,
    overdue_days: ageDays - reviewWindowDays,
    reason
  };
}

function latestLayerDate(player, field) {
  return (player.source_layers ?? [])
    .filter((layer) => (layer.fields ?? []).includes(field))
    .map((layer) => layer.checked_at)
    .filter(Boolean)
    .sort()
    .at(-1);
}

function addFinding(report, candidate) {
  report.audited_records += 1;
  const finding = buildFreshnessFinding(candidate);
  if (finding) report.findings.push(finding);
}

export function auditFreshness(dataset, marketValues, asOf) {
  parseIsoDate(asOf, "as-of date");
  const report = { as_of: asOf, audited_records: 0, findings: [] };

  for (const player of dataset.players) {
    const snapshot = player.registration_club.status === "tournament-snapshot";
    addFinding(report, {
      asOf,
      entityType: "player",
      entityId: player.id,
      field: "registration_club",
      lastChecked: latestLayerDate(player, "registration_club") ?? player.verification.last_checked,
      reviewWindowDays: snapshot ? 180 : 30,
      reason: snapshot
        ? "Tournament registration snapshots are stable historical records."
        : "Current registration and active-player status require a 30-day review."
    });

    for (const [index, entry] of player.tournament_participation.entries()) {
      if (!["called-up", "pending-transfer"].includes(entry.squad_status)) continue;
      addFinding(report, {
        asOf,
        entityType: "player-participation",
        entityId: `${player.id}:${entry.competition_id ?? index}`,
        field: "squad_status",
        lastChecked: entry.source_checked_at ?? player.verification.last_checked,
        reviewWindowDays: 30,
        reason: "Current call-ups and pending transfers require a 30-day review."
      });
    }
  }

  for (const [playerId, record] of Object.entries(marketValues.players ?? {})) {
    addFinding(report, {
      asOf,
      entityType: "market-value",
      entityId: playerId,
      field: "checked_at",
      lastChecked: record.checked_at,
      reviewWindowDays: 90,
      reason: "Market-value snapshots use the 90-day review window."
    });
  }

  for (const tournament of dataset.tournaments) {
    addFinding(report, {
      asOf,
      entityType: "tournament",
      entityId: tournament.id,
      field: "last_checked",
      lastChecked: tournament.last_checked,
      reviewWindowDays: ["ongoing", "future"].includes(tournament.status) ? 30 : 180,
      reason: ["ongoing", "future"].includes(tournament.status)
        ? "Ongoing and future competitions require a 30-day review."
        : "Completed competition records use the 180-day historical window."
    });
  }

  for (const tournament of dataset.tournamentArchive) {
    if (!tournament.source_checked_at) continue;
    addFinding(report, {
      asOf,
      entityType: "tournament-archive",
      entityId: tournament.id,
      field: "source_checked_at",
      lastChecked: tournament.source_checked_at,
      reviewWindowDays: 180,
      reason: "Completed archive records use the 180-day historical window."
    });
  }

  for (const archive of [dataset.chinaMenYouthCoaches, dataset.bigFiveAsianCoaches]) {
    if (!archive?.last_checked) continue;
    addFinding(report, {
      asOf,
      entityType: "coach-archive",
      entityId: archive.id,
      field: "last_checked",
      lastChecked: archive.last_checked,
      reviewWindowDays: 90,
      reason: "Current coaching coverage uses the 90-day review window."
    });
  }

  for (const coach of dataset.chinaYouthDevelopmentCoaches?.coaches ?? []) {
    const current = coach.period?.end === null || coach.period?.status === "current-reported";
    addFinding(report, {
      asOf,
      entityType: "coach",
      entityId: coach.id,
      field: "verification.last_checked",
      lastChecked: coach.verification.last_checked,
      reviewWindowDays: current ? 90 : 180,
      reason: current
        ? "Current coaching roles use the 90-day review window."
        : "Historical coaching roles use the 180-day review window."
    });
  }

  for (const coach of dataset.asianCoaches?.coaches ?? []) {
    for (const [index, stint] of (coach.stints ?? []).entries()) {
      const current = stint.period?.end === null;
      addFinding(report, {
        asOf,
        entityType: "coach-stint",
        entityId: `${coach.id}:${index}`,
        field: "verification.last_checked",
        lastChecked: stint.verification.last_checked,
        reviewWindowDays: current ? 90 : 180,
        reason: current
          ? "Current coaching roles use the 90-day review window."
          : "Historical coaching roles use the 180-day review window."
      });
    }
  }

  report.findings.sort(
    (left, right) =>
      right.overdue_days - left.overdue_days ||
      left.entity_type.localeCompare(right.entity_type) ||
      left.entity_id.localeCompare(right.entity_id)
  );
  report.summary = {
    overdue: report.findings.length,
    by_window: Object.fromEntries(
      [30, 90, 180].map((window) => [
        String(window),
        report.findings.filter((finding) => finding.review_window_days === window).length
      ])
    )
  };
  return report;
}

export function exitCodeForReport(report, strict) {
  return strict && report.findings.length > 0 ? 1 : 0;
}
