// Chooses the tournament shown in the home page focus card.
// Archive records may carry null dates (date_precision "tbc" or "open-ended"),
// so every comparison here has to tolerate missing values.

const ACTIVE_STATUSES = new Set(["ongoing", "in-progress"]);
const CLOSED_STATUSES = new Set(["completed", "cancelled"]);
const FAR_FUTURE = "9999-12-31";
const FAR_PAST = "0000-01-01";

export const TOURNAMENT_PHASE = Object.freeze({ current: 0, upcoming: 1, past: 2 });

export function getTournamentPhase(tournament, today) {
  const start = tournament?.date_range?.start ?? null;
  const end = tournament?.date_range?.end ?? null;

  if (CLOSED_STATUSES.has(tournament?.status)) {
    return TOURNAMENT_PHASE.past;
  }
  // A stale "ongoing" status must not keep a finished event in the focus card.
  if (end && end < today) {
    return TOURNAMENT_PHASE.past;
  }
  if (ACTIVE_STATUSES.has(tournament?.status) || (start && start <= today)) {
    return TOURNAMENT_PHASE.current;
  }
  // Future start dates and announced-but-undated events.
  return TOURNAMENT_PHASE.upcoming;
}

function compareWithinPhase(phase, left, right) {
  const leftRange = left.date_range ?? {};
  const rightRange = right.date_range ?? {};

  if (phase === TOURNAMENT_PHASE.current) {
    return (leftRange.end ?? FAR_FUTURE).localeCompare(rightRange.end ?? FAR_FUTURE);
  }
  if (phase === TOURNAMENT_PHASE.upcoming) {
    return (leftRange.start ?? FAR_FUTURE).localeCompare(rightRange.start ?? FAR_FUTURE);
  }
  return (rightRange.end ?? rightRange.start ?? FAR_PAST).localeCompare(
    leftRange.end ?? leftRange.start ?? FAR_PAST
  );
}

export function pickFocusTournament(tournaments, { today, getFocusRank = () => 2 } = {}) {
  const ranked = (tournaments ?? [])
    .filter(Boolean)
    .map((tournament) => ({
      tournament,
      phase: getTournamentPhase(tournament, today),
      focusRank: getFocusRank(tournament)
    }));

  ranked.sort((left, right) => {
    if (left.phase !== right.phase) {
      return left.phase - right.phase;
    }
    if (left.focusRank !== right.focusRank) {
      return left.focusRank - right.focusRank;
    }
    return compareWithinPhase(left.phase, left.tournament, right.tournament);
  });

  return ranked[0]?.tournament ?? null;
}
