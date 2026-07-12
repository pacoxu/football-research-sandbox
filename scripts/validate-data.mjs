import { loadDataset } from "./lib/data-loader.mjs";
import { MARKET_VALUE_STATUSES } from "./lib/market-values.mjs";

const requiredPlayerFields = [
  "id",
  "name",
  "local_name",
  "names",
  "country",
  "birth_date",
  "age_band",
  "primary_position",
  "registration_club",
  "training_pathway",
  "focus_tags",
  "tournament_participation",
  "external_links",
  "verification"
];

const allowedVerificationStatuses = new Set([
  "verified",
  "mixed-source",
  "provisional",
  "needs-review",
  "conflict",
  "stale",
  "rejected"
]);

const allowedExternalLinkTypes = new Set([
  "official",
  "club",
  "stats",
  "news",
  "wikipedia",
  "transfermarkt",
  "school",
  "profile",
  "match",
  "reference"
]);

const allowedSquadStatuses = new Set([
  "registered",
  "tracked",
  "pending-transfer",
  "called-up",
  "selected",
  "withdrawn",
  "unknown",
  "used"
]);

const allowedSourceLayerTypes = new Set([
  "afc-registration",
  "national-fa-profile",
  "club-academy-profile",
  "school-profile",
  "league-registration"
]);

const allowedSourceLayerConfidence = new Set(["high", "medium", "low"]);

const allowedTournamentSourceVersionTypes = new Set([
  "afc-final-registration",
  "afc-final-report",
  "afc-match-report",
  "afc-match-schedule",
  "afc-tournament-home",
  "afc-stats-archive",
  "fifa-report",
  "wikipedia-secondary",
  "secondary-stats",
  "news-secondary"
]);

const allowedAsianCoachCompetitionScopes = new Set([
  "europe_non_big_five_top_flight",
  "afc_senior_national_team",
  "afc_youth_national_team",
  "asian_top_flight_club",
  "afc_continental_club"
]);

const allowedAsianCoachRoleTypes = new Set([
  "head_coach",
  "caretaker_head_coach",
  "interim_head_coach"
]);

const allowedAsianCoachRoleScopes = new Set([
  "club_first_team",
  "senior_national_team",
  "youth_national_team"
]);

const allowedAsianCoachTeamTypes = new Set([
  "club",
  "senior_national_team",
  "youth_national_team"
]);

const allowedAsianCoachSpellTypes = new Set(["permanent", "caretaker", "interim"]);
const allowedAsianCoachSourceTypes = new Set([
  "association-announcement",
  "club-announcement",
  "league-profile",
  "competition-record",
  "secondary-crosscheck"
]);
const allowedAsianCoachCountedScopes = new Set([
  "afc_member_association",
  "geographic_broad",
  "uefa_asian_boundary",
  "dual_nationality_watch"
]);
const allowedAsianCoachConfidence = new Set(["high", "medium", "low"]);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function isIsoDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function normalizeIdentityName(value) {
  return String(value ?? "")
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, "");
}

function getIdentityKeys(player) {
  const names = [
    player.name,
    player.local_name,
    player.names?.zh,
    player.names?.en,
    player.names?.native,
    player.names?.ja,
    player.names?.ko
  ];
  return [...new Set(names.map(normalizeIdentityName).filter(Boolean))].map(
    (name) => `${player.birth_date}|${name}`
  );
}

function validateExternalLink(link, label) {
  assert(typeof link === "object" && link !== null, `Invalid external link on ${label}`);
  assert(
    allowedExternalLinkTypes.has(link.type),
    `Invalid external link type "${link.type}" on ${label}`
  );
  assert(typeof link.label === "string" && link.label.length > 0, `Missing external link label on ${label}`);
  assert(/^https?:\/\//.test(link.url), `Invalid external link url on ${label}`);
}

function validateSourceLayer(layer, label) {
  assert(typeof layer === "object" && layer !== null, `Invalid source layer on ${label}`);
  assert(
    allowedSourceLayerTypes.has(layer.type),
    `Invalid source layer type "${layer.type}" on ${label}`
  );
  assert(typeof layer.label === "string" && layer.label.length > 0, `Missing source layer label on ${label}`);
  assert(/^https?:\/\//.test(layer.url), `Invalid source layer url on ${label}`);
  assert(isIsoDate(layer.checked_at), `Invalid source layer checked_at on ${label}`);
  assert(
    allowedSourceLayerConfidence.has(layer.confidence),
    `Invalid source layer confidence "${layer.confidence}" on ${label}`
  );
  assert(typeof layer.claim === "string" && layer.claim.length > 0, `Missing source layer claim on ${label}`);
  assert(Array.isArray(layer.fields) && layer.fields.length > 0, `Invalid source layer fields on ${label}`);
  for (const field of layer.fields) {
    assert(typeof field === "string" && field.length > 0, `Invalid source layer field on ${label}`);
  }
}

function validateTournamentSourceVersion(source, tournamentId) {
  assert(
    typeof source === "object" && source !== null,
    `Invalid source_version entry on ${tournamentId}`
  );
  assert(
    allowedTournamentSourceVersionTypes.has(source.type),
    `Invalid source_version type "${source.type}" on ${tournamentId}`
  );
  assert(
    typeof source.label === "string" && source.label.length > 0,
    `Missing source_version label on ${tournamentId}`
  );
  if (source.url !== undefined) {
    assert(/^https?:\/\//.test(source.url), `Invalid source_version url on ${tournamentId}`);
  }
  assert(
    Array.isArray(source.fields) && source.fields.length > 0,
    `Invalid source_version fields on ${tournamentId}`
  );
  for (const field of source.fields) {
    assert(
      typeof field === "string" && field.length > 0,
      `Invalid source_version field on ${tournamentId}`
    );
  }
  if (source.note !== undefined) {
    assert(
      typeof source.note === "string" && source.note.length > 0,
      `Invalid source_version note on ${tournamentId}`
    );
  }
}

function validateCompetitionNameHistoryEntry(entry, tournamentId) {
  assert(
    typeof entry === "object" && entry !== null,
    `Invalid competition_name_history entry on ${tournamentId}`
  );
  assert(
    typeof entry.name === "string" && entry.name.length > 0,
    `Missing competition_name_history name on ${tournamentId}`
  );
  assert(
    typeof entry.note === "string" && entry.note.length > 0,
    `Missing competition_name_history note on ${tournamentId}`
  );
  if (entry.used_from !== undefined) {
    assert(
      typeof entry.used_from === "string" && entry.used_from.length > 0,
      `Invalid competition_name_history used_from on ${tournamentId}`
    );
  }
  if (entry.used_until !== undefined) {
    assert(
      typeof entry.used_until === "string" && entry.used_until.length > 0,
      `Invalid competition_name_history used_until on ${tournamentId}`
    );
  }
}

function validateTournamentArchiveVersioning(tournament) {
  if (tournament.source_version !== undefined) {
    assert(
      Array.isArray(tournament.source_version) && tournament.source_version.length > 0,
      `Invalid source_version on ${tournament.id}`
    );
    assert(
      isIsoDate(tournament.source_checked_at),
      `Invalid source_checked_at on ${tournament.id}`
    );
    assert(
      typeof tournament.source_conflict_note === "string" &&
        tournament.source_conflict_note.length > 0,
      `Missing source_conflict_note on ${tournament.id}`
    );
    for (const source of tournament.source_version) {
      validateTournamentSourceVersion(source, tournament.id);
    }
  } else if (tournament.source_checked_at !== undefined) {
    assert(
      isIsoDate(tournament.source_checked_at),
      `Invalid source_checked_at on ${tournament.id}`
    );
  }

  if (tournament.source_conflict_note !== undefined) {
    assert(
      typeof tournament.source_conflict_note === "string" &&
        tournament.source_conflict_note.length > 0,
      `Invalid source_conflict_note on ${tournament.id}`
    );
  }

  if (tournament.competition_name_history !== undefined) {
    assert(
      Array.isArray(tournament.competition_name_history) &&
        tournament.competition_name_history.length > 0,
      `Invalid competition_name_history on ${tournament.id}`
    );
    for (const entry of tournament.competition_name_history) {
      validateCompetitionNameHistoryEntry(entry, tournament.id);
    }
  }
}

function validateVerificationBlock(verification, label) {
  assert(typeof verification === "object" && verification !== null, `Invalid verification block on ${label}`);
  assert(
    allowedVerificationStatuses.has(verification.status),
    `Invalid verification status "${verification.status}" on ${label}`
  );
  assert(isIsoDate(verification.last_checked), `Invalid verification last_checked on ${label}`);
  assert(
    typeof verification.notes === "string" && verification.notes.length > 0,
    `Missing verification notes on ${label}`
  );

  if (verification.evidence !== undefined) {
    assert(Array.isArray(verification.evidence), `Invalid verification evidence list on ${label}`);
    for (const evidence of verification.evidence) {
      assert(evidence.field, `Missing evidence field on ${label}`);
      assert(evidence.claim, `Missing evidence claim on ${label}`);
      assert(evidence.source_label, `Missing evidence source_label on ${label}`);
      assert(/^https?:\/\//.test(evidence.source_url), `Invalid evidence source_url on ${label}`);
      assert(isIsoDate(evidence.checked_at), `Invalid evidence checked_at on ${label}`);
    }
  }
}

function validateMarketValuePoint(point, playerId, label) {
  assert(typeof point === "object" && point !== null, `Invalid market_value ${label} on ${playerId}`);
  assert(
    typeof point.eur === "number" && point.eur > 0,
    `Invalid market_value ${label}.eur on ${playerId}`
  );
  assert(
    typeof point.currency === "string" && point.currency.length > 0,
    `Missing market_value ${label}.currency on ${playerId}`
  );
  assert(
    typeof point.display === "string" && point.display.length > 0,
    `Missing market_value ${label}.display on ${playerId}`
  );
  assert(
    point.date === null || isIsoDate(point.date),
    `Invalid market_value ${label}.date on ${playerId}`
  );
}

function validateMarketValueSeries(record, playerId, label = "market_value") {
  assert(typeof record === "object" && record !== null, `Invalid ${label} on ${playerId}`);
  assert(MARKET_VALUE_STATUSES.has(record.status), `Invalid ${label} status on ${playerId}`);
  assert(isIsoDate(record.checked_at), `Invalid ${label} checked_at on ${playerId}`);
  assert(
    typeof record.source?.provider === "string" &&
      typeof record.source?.profile_url === "string",
    `Invalid ${label} source on ${playerId}`
  );
  assert(Array.isArray(record.history), `Missing ${label} history on ${playerId}`);

  let previousDate = "";
  const historyKeys = new Set();
  for (const [index, point] of record.history.entries()) {
    validateMarketValuePoint(point, playerId, `${label}.history[${index}]`);
    assert(point.date !== null, `Missing ${label} history date on ${playerId}`);
    assert(point.date >= previousDate, `Unsorted ${label} history on ${playerId}`);
    previousDate = point.date;
    const key = `${point.date}|${point.currency}|${point.eur}`;
    assert(!historyKeys.has(key), `Duplicate ${label} history point on ${playerId}: ${key}`);
    historyKeys.add(key);
  }

  assert(
    Number.isInteger(record.history_points) && record.history_points === record.history.length,
    `Invalid ${label} history_points on ${playerId}`
  );
  if (record.current !== null && record.current !== undefined) {
    validateMarketValuePoint(record.current, playerId, `${label}.current`);
  }
  if (record.peak !== null && record.peak !== undefined) {
    validateMarketValuePoint(record.peak, playerId, `${label}.peak`);
    const maximum = Math.max(0, ...record.history.map((point) => point.eur));
    assert(record.peak.eur === maximum, `Invalid ${label} peak on ${playerId}`);
  }
  if (record.last_change_date !== null && record.last_change_date !== undefined) {
    assert(isIsoDate(record.last_change_date), `Invalid ${label} last_change_date on ${playerId}`);
  }
}

function validateOverseasRecord(record, countryName, allowedBuckets) {
  const requiredFields = [
    "id",
    "name",
    "local_name",
    "bucket",
    "league",
    "club",
    "season",
    "status",
    "appearance_label",
    "summary"
  ];

  for (const field of requiredFields) {
    assert(record[field], `Missing overseas record field "${field}" on ${countryName}`);
  }

  assert(Array.isArray(record.notes), `Invalid overseas notes list on ${record.id}`);
  assert(
    typeof record.appearances === "number" && Number.isInteger(record.appearances),
    `Invalid overseas appearances on ${record.id}`
  );
  assert(
    typeof record.competitive_debut === "boolean",
    `Invalid overseas competitive_debut on ${record.id}`
  );
  if (record.active_abroad !== undefined) {
    assert(typeof record.active_abroad === "boolean", `Invalid active_abroad on ${record.id}`);
  }
  if (record.history_year_range !== undefined) {
    assert(
      typeof record.history_year_range === "string" && record.history_year_range.length > 0,
      `Invalid history_year_range on ${record.id}`
    );
  }
  assert(allowedBuckets.has(record.bucket), `Unknown overseas bucket on ${record.id}`);
}

function validatePlayerNames(player) {
  assert(typeof player.names === "object" && player.names !== null, `Missing names block on ${player.id}`);
  assert(typeof player.names.zh === "string" && player.names.zh.length > 0, `Missing names.zh on ${player.id}`);
  assert(typeof player.names.en === "string" && player.names.en.length > 0, `Missing names.en on ${player.id}`);
  assert(
    typeof player.names.native === "string" && player.names.native.length > 0,
    `Missing names.native on ${player.id}`
  );

  if (player.country === "Japan") {
    assert(typeof player.names.ja === "string", `Missing names.ja on ${player.id}`);
  }

  if (player.country === "Korea Republic") {
    assert(typeof player.names.ko === "string", `Missing names.ko on ${player.id}`);
  }
}

function validateBigFiveChecklist(checklist, countryName) {
  assert(
    isIsoDate(checklist.checked_at),
    `Invalid big_five_appearance_checklist checked_at on ${countryName}`
  );
  assert(
    isIsoDate(checklist.source_cutoff),
    `Invalid big_five_appearance_checklist source_cutoff on ${countryName}`
  );
  assert(
    typeof checklist.source_title === "string" && checklist.source_title.length > 0,
    `Missing big_five_appearance_checklist source_title on ${countryName}`
  );
  assert(
    typeof checklist.source_url === "string" && /^https?:\/\//.test(checklist.source_url),
    `Invalid big_five_appearance_checklist source_url on ${countryName}`
  );
  assert(
    Array.isArray(checklist.entries),
    `Invalid big_five_appearance_checklist entries on ${countryName}`
  );

  for (const entry of checklist.entries) {
    assert(entry.player, `Missing checklist player name on ${countryName}`);
    assert(
      Number.isInteger(entry.appearances),
      `Invalid checklist appearances on ${countryName}:${entry.player}`
    );
    assert(
      Number.isInteger(entry.goals),
      `Invalid checklist goals on ${countryName}:${entry.player}`
    );
    assert(
      Array.isArray(entry.league_breakdown) && entry.league_breakdown.length > 0,
      `Invalid checklist league_breakdown on ${countryName}:${entry.player}`
    );

    for (const leagueEntry of entry.league_breakdown) {
      assert(
        typeof leagueEntry.league === "string" && leagueEntry.league.length > 0,
        `Missing checklist league name on ${countryName}:${entry.player}`
      );
      assert(
        Number.isInteger(leagueEntry.appearances),
        `Invalid checklist league appearances on ${countryName}:${entry.player}`
      );
      assert(
        Number.isInteger(leagueEntry.goals),
        `Invalid checklist league goals on ${countryName}:${entry.player}`
      );
    }
  }
}

function validateChinaMenYouthCoaches(archive) {
  assert(typeof archive.id === "string" && archive.id.length > 0, "Missing china_men_youth_coaches id");
  assert(
    typeof archive.name === "string" && archive.name.length > 0,
    "Missing china_men_youth_coaches name"
  );
  assert(isIsoDate(archive.last_checked), "Invalid china_men_youth_coaches last_checked");
  assert(
    Array.isArray(archive.team_cycles) && archive.team_cycles.length > 0,
    "Invalid china_men_youth_coaches team_cycles"
  );
  assert(
    Array.isArray(archive.football_boys_alignment),
    "Invalid china_men_youth_coaches football_boys_alignment"
  );

  for (const cycle of archive.team_cycles) {
    assert(cycle.team_label, "Missing team_label on china_men_youth_coaches cycle");
    assert(cycle.age_line, `Missing age_line on ${cycle.team_label}`);
    assert(cycle.head_coach?.local_name, `Missing head coach local_name on ${cycle.team_label}`);
    assert(cycle.current_stage, `Missing current_stage on ${cycle.team_label}`);
    assert(cycle.latest_camp?.label, `Missing latest_camp label on ${cycle.team_label}`);
    assert(
      isIsoDate(cycle.latest_camp?.published_on),
      `Invalid latest_camp published_on on ${cycle.team_label}`
    );
    assert(Array.isArray(cycle.staff), `Invalid staff list on ${cycle.team_label}`);
    assert(Array.isArray(cycle.source_links) && cycle.source_links.length > 0, `Missing sources on ${cycle.team_label}`);

    for (const staffGroup of cycle.staff) {
      assert(staffGroup.role, `Missing staff role on ${cycle.team_label}`);
      assert(
        Array.isArray(staffGroup.members) && staffGroup.members.length > 0,
        `Invalid staff members on ${cycle.team_label}:${staffGroup.role}`
      );
    }

    for (const link of cycle.source_links) {
      assert(link.label, `Missing source label on ${cycle.team_label}`);
      assert(/^https?:\/\//.test(link.url), `Invalid source url on ${cycle.team_label}`);
    }
  }
}

function validateCoachRecord(record, label) {
  assert(typeof record === "object" && record !== null, `Missing coach record on ${label}`);
  for (const field of ["matches", "wins", "draws", "losses", "points"]) {
    assert(
      Number.isInteger(record[field]) && record[field] >= 0,
      `Invalid coach record ${field} on ${label}`
    );
  }
  assert(
    record.matches === record.wins + record.draws + record.losses,
    `Coach record does not add up on ${label}`
  );
  assert(record.points === record.wins * 3 + record.draws, `Coach points do not add up on ${label}`);
}

function validateBigFiveAsianCoaches(archive) {
  assert(typeof archive.id === "string" && archive.id.length > 0, "Missing big_five_asian_coaches id");
  assert(isIsoDate(archive.last_checked), "Invalid big_five_asian_coaches last_checked");
  assert(
    archive.scope_counts && typeof archive.scope_counts === "object",
    "Missing big_five_asian_coaches scope_counts"
  );
  assert(Array.isArray(archive.coaches) && archive.coaches.length > 0, "Invalid big_five_asian_coaches coaches");
  assert(Array.isArray(archive.source_links), "Invalid big_five_asian_coaches source_links");

  const coachIds = new Set();
  const scopeCounts = new Map();

  for (const link of archive.source_links) {
    assert(link.label, "Missing source label on big_five_asian_coaches");
    assert(/^https?:\/\//.test(link.url), "Invalid source url on big_five_asian_coaches");
  }

  validateCoachRecord(archive.primary_scope_record, "big_five_asian_coaches primary_scope_record");

  for (const coach of archive.coaches) {
    assert(coach.id && coach.name && coach.local_name, "Coach must include id, name, and local_name");
    assert(!coachIds.has(coach.id), `Duplicate coach id: ${coach.id}`);
    assert(coach.nationality, `Missing nationality on ${coach.id}`);
    assert(coach.association_confederation, `Missing association_confederation on ${coach.id}`);
    assert(Array.isArray(coach.counted_in) && coach.counted_in.length > 0, `Invalid counted_in on ${coach.id}`);
    assert(Array.isArray(coach.club_records) && coach.club_records.length > 0, `Invalid club_records on ${coach.id}`);
    assert(Array.isArray(coach.source_links) && coach.source_links.length > 0, `Missing sources on ${coach.id}`);
    validateCoachRecord(coach.top_flight_record, coach.id);

    for (const scope of coach.counted_in) {
      scopeCounts.set(scope, (scopeCounts.get(scope) ?? 0) + 1);
    }

    const clubRecord = {
      matches: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      points: 0
    };
    for (const stint of coach.club_records) {
      assert(stint.club && stint.league && stint.season, `Invalid club record label on ${coach.id}`);
      validateCoachRecord(stint, `${coach.id}:${stint.club}`);
      clubRecord.matches += stint.matches;
      clubRecord.wins += stint.wins;
      clubRecord.draws += stint.draws;
      clubRecord.losses += stint.losses;
      clubRecord.points += stint.points;
    }
    assert(
      JSON.stringify(clubRecord) === JSON.stringify(coach.top_flight_record),
      `Club records do not sum to top_flight_record on ${coach.id}`
    );

    for (const link of coach.source_links) {
      assert(link.label, `Missing source label on ${coach.id}`);
      assert(/^https?:\/\//.test(link.url), `Invalid source url on ${coach.id}`);
    }

    coachIds.add(coach.id);
  }

  for (const [scope, count] of Object.entries(archive.scope_counts)) {
    assert(scopeCounts.get(scope) === count, `Invalid scope count ${scope} on big_five_asian_coaches`);
  }
}

function validateAsianCoachSourceLink(link, label) {
  assert(typeof link === "object" && link !== null, `Invalid Asian coach source on ${label}`);
  assert(link.label, `Missing Asian coach source label on ${label}`);
  assert(/^https?:\/\//.test(link.url), `Invalid Asian coach source url on ${label}`);
  assert(
    allowedAsianCoachSourceTypes.has(link.type),
    `Invalid Asian coach source type "${link.type}" on ${label}`
  );
}

function validateAsianCoaches(archive) {
  assert(archive.id === "asian-coaches", "Invalid asian_coaches id");
  assert(isIsoDate(archive.last_checked), "Invalid asian_coaches last_checked");
  assert(
    archive.scope_counts && typeof archive.scope_counts === "object",
    "Missing asian_coaches scope_counts"
  );
  assert(
    archive.stint_counts_by_scope && typeof archive.stint_counts_by_scope === "object",
    "Missing asian_coaches stint_counts_by_scope"
  );
  assert(Array.isArray(archive.coaches) && archive.coaches.length > 0, "Invalid asian_coaches coaches");
  assert(Array.isArray(archive.role_policy?.included), "Invalid asian_coaches included role policy");
  assert(
    Array.isArray(archive.role_policy?.excluded_from_primary),
    "Invalid asian_coaches excluded role policy"
  );

  const coachIds = new Set();
  const scopeCounts = new Map();
  const stintCounts = new Map();

  for (const coach of archive.coaches) {
    assert(coach.id && coach.name && coach.local_name, "Asian coach must include id, name, and local_name");
    assert(!coachIds.has(coach.id), `Duplicate Asian coach id: ${coach.id}`);
    assert(coach.nationality, `Missing nationality on Asian coach ${coach.id}`);
    assert(coach.association, `Missing association on Asian coach ${coach.id}`);
    assert(coach.association_confederation, `Missing confederation on Asian coach ${coach.id}`);
    assert(
      Array.isArray(coach.counted_in) && coach.counted_in.length > 0,
      `Invalid counted_in on Asian coach ${coach.id}`
    );
    assert(Array.isArray(coach.boundary_notes), `Invalid boundary_notes on Asian coach ${coach.id}`);
    assert(Array.isArray(coach.stints) && coach.stints.length > 0, `Invalid stints on Asian coach ${coach.id}`);
    assert(Array.isArray(coach.source_links), `Invalid source_links on Asian coach ${coach.id}`);
    assert(
      allowedAsianCoachConfidence.has(coach.confidence),
      `Invalid confidence on Asian coach ${coach.id}`
    );

    for (const scope of coach.counted_in) {
      assert(
        allowedAsianCoachCountedScopes.has(scope),
        `Invalid counted scope "${scope}" on Asian coach ${coach.id}`
      );
      scopeCounts.set(scope, (scopeCounts.get(scope) ?? 0) + 1);
    }

    for (const link of coach.source_links) {
      validateAsianCoachSourceLink(link, coach.id);
    }

    for (const stint of coach.stints) {
      const stintLabel = `${coach.id}:${stint.team ?? "unknown"}`;
      assert(stint.team && stint.team_country, `Missing team on Asian coach stint ${stintLabel}`);
      assert(
        allowedAsianCoachTeamTypes.has(stint.team_type),
        `Invalid team_type "${stint.team_type}" on ${stintLabel}`
      );
      assert(
        allowedAsianCoachRoleScopes.has(stint.role_scope),
        `Invalid role_scope "${stint.role_scope}" on ${stintLabel}`
      );
      assert(
        allowedAsianCoachCompetitionScopes.has(stint.competition_scope),
        `Invalid competition_scope "${stint.competition_scope}" on ${stintLabel}`
      );
      assert(stint.competition, `Missing competition on ${stintLabel}`);
      assert(
        allowedAsianCoachRoleTypes.has(stint.role_type),
        `Invalid role_type "${stint.role_type}" on ${stintLabel}`
      );
      assert(
        allowedAsianCoachSpellTypes.has(stint.spell_type),
        `Invalid spell_type "${stint.spell_type}" on ${stintLabel}`
      );
      assert(/^\d{4}-\d{2}$/.test(stint.period?.start), `Invalid period.start on ${stintLabel}`);
      assert(
        stint.period?.end === null || /^\d{4}-\d{2}$/.test(stint.period?.end),
        `Invalid period.end on ${stintLabel}`
      );
      if (stint.period.end !== null) {
        assert(stint.period.end >= stint.period.start, `Asian coach period ends before start on ${stintLabel}`);
      }
      assert(stint.season, `Missing season on ${stintLabel}`);
      assert(typeof stint.count_in_primary === "boolean", `Invalid count_in_primary on ${stintLabel}`);
      assert(stint.record_scope, `Missing record_scope on ${stintLabel}`);
      if (stint.record !== null) {
        validateCoachRecord(stint.record, stintLabel);
      }
      assert(
        Array.isArray(stint.source_links) && stint.source_links.length > 0,
        `Missing stint sources on ${stintLabel}`
      );
      for (const link of stint.source_links) {
        validateAsianCoachSourceLink(link, stintLabel);
      }
      validateVerificationBlock(stint.verification, stintLabel);
      stintCounts.set(
        stint.competition_scope,
        (stintCounts.get(stint.competition_scope) ?? 0) + 1
      );
    }

    coachIds.add(coach.id);
  }

  for (const [scope, count] of Object.entries(archive.scope_counts)) {
    assert(scopeCounts.get(scope) === count, `Invalid scope count ${scope} on asian_coaches`);
  }
  for (const [scope, count] of Object.entries(archive.stint_counts_by_scope)) {
    assert(
      allowedAsianCoachCompetitionScopes.has(scope),
      `Invalid stint count scope ${scope} on asian_coaches`
    );
    assert((stintCounts.get(scope) ?? 0) === count, `Invalid stint count ${scope} on asian_coaches`);
  }
}

function validateRegionalHistory(history, tournamentId) {
  assert(typeof history === "object" && history !== null, `Invalid regional_history on ${tournamentId}`);
  assert(Array.isArray(history.team_summaries), `Invalid regional_history team_summaries on ${tournamentId}`);
  assert(Array.isArray(history.editions), `Invalid regional_history editions on ${tournamentId}`);

  for (const summary of history.team_summaries) {
    assert(summary.country, `Missing regional_history country on ${tournamentId}`);
    assert(
      Number.isInteger(summary.appearances),
      `Invalid regional_history appearances on ${tournamentId}:${summary.country}`
    );
    assert(summary.best_finish, `Missing regional_history best_finish on ${tournamentId}:${summary.country}`);
    assert(
      Array.isArray(summary.best_years),
      `Invalid regional_history best_years on ${tournamentId}:${summary.country}`
    );
  }

  for (const edition of history.editions) {
    assert(edition.edition, `Missing regional_history edition on ${tournamentId}`);
    assert(edition.host, `Missing regional_history host on ${tournamentId}:${edition.edition}`);
    assert(edition.china_pr, `Missing regional_history China PR result on ${tournamentId}:${edition.edition}`);
    assert(edition.japan, `Missing regional_history Japan result on ${tournamentId}:${edition.edition}`);
    assert(
      edition.korea_republic,
      `Missing regional_history Korea Republic result on ${tournamentId}:${edition.edition}`
    );
  }
}

function validateUefaYouthLeague(topic, playerIds) {
  assert(typeof topic === "object" && topic !== null, "Missing UEFA Youth League dataset");
  assert(isIsoDate(topic.meta?.checked_at), "Invalid UEFA Youth League checked_at");
  assert(Array.isArray(topic.seasons) && topic.seasons.length === 3, "UEFA Youth League must include three seasons");
  assert(Array.isArray(topic.sources) && topic.sources.length > 0, "UEFA Youth League sources are required");

  const sourceIds = new Set();
  for (const source of topic.sources) {
    assert(source.id && !sourceIds.has(source.id), `Duplicate UEFA Youth League source id: ${source.id}`);
    assert(typeof source.label === "string" && source.label.length > 0, `Missing UEFA Youth League source label: ${source.id}`);
    assert(/^https?:\/\//.test(source.url), `Invalid UEFA Youth League source URL: ${source.id}`);
    sourceIds.add(source.id);
  }

  const validateSourceIds = (record, label) => {
    assert(Array.isArray(record.source_ids) && record.source_ids.length > 0, `Missing source_ids on ${label}`);
    for (const sourceId of record.source_ids) {
      assert(sourceIds.has(sourceId), `Unknown UEFA Youth League source id "${sourceId}" on ${label}`);
    }
  };

  validateSourceIds(topic.qualification, "qualification");
  for (const path of topic.qualification.paths ?? []) {
    validateSourceIds(path, `qualification:${path.id}`);
  }
  for (const rule of topic.player_eligibility?.rules ?? []) {
    validateSourceIds(rule, `player_eligibility:${rule.id}`);
  }

  const seasonIds = new Set();
  for (const season of topic.seasons) {
    assert(season.id && !seasonIds.has(season.id), `Duplicate UEFA Youth League season: ${season.id}`);
    seasonIds.add(season.id);
    assert(Number.isInteger(season.entrant_count) && season.entrant_count > 0, `Invalid entrant_count on ${season.id}`);
    const teams = Object.values(season.teams_by_path ?? {}).flat();
    assert(teams.length === season.entrant_count, `Team count does not match entrant_count on ${season.id}`);
    assert(new Set(teams).size === teams.length, `Duplicate team within UEFA Youth League season ${season.id}`);
    assert(Array.isArray(season.knockout) && season.knockout.length === 7, `Expected seven quarter-final onward matches on ${season.id}`);
    for (const match of season.knockout) {
      assert(isIsoDate(match.date), `Invalid knockout date on ${season.id}`);
      assert(match.home && match.away && match.score, `Incomplete knockout match on ${season.id}`);
    }
    for (const scorer of season.top_scorers ?? []) {
      assert(Number.isInteger(scorer.goals) && scorer.goals >= 0, `Invalid top-scorer goals on ${season.id}`);
    }
    validateSourceIds(season, `season:${season.id}`);
  }

  const playerRecordIds = new Set();
  for (const player of topic.cjk_players ?? []) {
    assert(player.id && !playerRecordIds.has(player.id), `Duplicate UEFA Youth League player record: ${player.id}`);
    playerRecordIds.add(player.id);
    assert(seasonIds.has(player.season_id), `Unknown UEFA Youth League season on ${player.id}`);
    assert(["CHN", "JPN", "KOR"].includes(player.country_code), `Invalid CJK nationality on ${player.id}`);
    assert(["appeared", "registered-only"].includes(player.status), `Invalid participation status on ${player.id}`);
    for (const field of ["appearances", "starts", "minutes", "goals", "assists"]) {
      assert(Number.isInteger(player[field]) && player[field] >= 0, `Invalid ${field} on ${player.id}`);
    }
    assert(player.starts <= player.appearances, `Starts exceed appearances on ${player.id}`);
    if (player.status === "registered-only") {
      assert(player.appearances === 0 && player.minutes === 0, `Registered-only player has appearance statistics: ${player.id}`);
    } else {
      assert(player.appearances > 0, `Appeared player has no appearances: ${player.id}`);
    }
    if (player.player_id !== null) {
      assert(playerIds.has(player.player_id), `Unknown linked player_id on ${player.id}`);
    }
    validateSourceIds(player, `cjk_player:${player.id}`);
  }

  for (const boundary of topic.boundary_watch ?? []) {
    assert(boundary.status === "provisional" || boundary.status === "verified", `Invalid boundary status on ${boundary.id}`);
    validateSourceIds(boundary, `boundary_watch:${boundary.id}`);
  }

  const spotlightCounts = new Map();
  for (const spotlight of topic.other_player_spotlights ?? []) {
    assert(seasonIds.has(spotlight.season_id), `Unknown spotlight season: ${spotlight.season_id}`);
    spotlightCounts.set(spotlight.season_id, (spotlightCounts.get(spotlight.season_id) ?? 0) + 1);
    validateSourceIds(spotlight, `spotlight:${spotlight.season_id}:${spotlight.name}`);
  }
  for (const [seasonId, count] of spotlightCounts) {
    assert(count <= 12, `Too many non-CJK spotlights on ${seasonId}: ${count}`);
  }
}

export async function validateData() {
  const dataset = await loadDataset();
  const playerIds = new Set();
  const playerIdentityKeys = new Map();
  const tournamentIds = new Set(dataset.tournaments.map((item) => item.id));
  const overseasBucketIds = new Set(dataset.overseasHistory.bucket_definition ?? []);

  for (const player of dataset.players) {
    for (const field of requiredPlayerFields) {
      assert(player[field] !== undefined, `Missing player field "${field}" on ${player.id}`);
    }

    assert(!playerIds.has(player.id), `Duplicate player id: ${player.id}`);
    assert(isIsoDate(player.birth_date), `Invalid birth_date for ${player.id}`);
    validatePlayerNames(player);
    assert(
      typeof player.registration_club?.name === "string" &&
        typeof player.registration_club?.country === "string",
      `Invalid registration_club for ${player.id}`
    );
    assert(player.training_pathway.length > 0, `Empty training_pathway for ${player.id}`);
    for (const step of player.training_pathway) {
      assert(
        typeof step.stage_label === "string" &&
          typeof step.organization === "string" &&
          typeof step.country === "string",
        `Invalid training_pathway step on ${player.id}`
      );
      if (step.pathway_meta !== undefined) {
        assert(Array.isArray(step.pathway_meta), `Invalid pathway_meta on ${player.id}`);
      }
    }
    assert(player.external_links.length > 0, `Empty external_links for ${player.id}`);
    for (const link of player.external_links) {
      validateExternalLink(link, player.id);
    }
    if (player.source_layers !== undefined) {
      assert(Array.isArray(player.source_layers), `Invalid source_layers on ${player.id}`);
      for (const layer of player.source_layers) {
        validateSourceLayer(layer, player.id);
      }
    }
    for (const entry of player.tournament_participation) {
      assert(
        !entry.competition_id || tournamentIds.has(entry.competition_id),
        `Unknown competition_id on player ${player.id}`
      );
      assert(
        allowedSquadStatuses.has(entry.squad_status),
        `Invalid squad_status "${entry.squad_status}" on player ${player.id}`
      );
    }
    validateVerificationBlock(player.verification, player.id);
    for (const identityKey of getIdentityKeys(player)) {
      const previousPlayer = playerIdentityKeys.get(identityKey);
      if (previousPlayer !== undefined && previousPlayer.id !== player.id) {
        throw new Error(`Possible duplicate player identity: ${previousPlayer.id} and ${player.id}`);
      }
      playerIdentityKeys.set(identityKey, player);
    }
    if (player.league_system_override !== undefined) {
      assert(
        typeof player.league_system_override === "string" && player.league_system_override.length > 0,
        `Invalid league_system_override on ${player.id}`
      );
    }
    if (player.overseas_bucket_override !== undefined) {
      assert(
        overseasBucketIds.has(player.overseas_bucket_override),
        `Invalid overseas_bucket_override on ${player.id}`
      );
    }
    assert(player.market_value !== undefined, `Missing market_value coverage on ${player.id}`);
    validateMarketValueSeries(player.market_value, player.id);
    assert(Array.isArray(player.market_value.alternatives), `Invalid market_value alternatives on ${player.id}`);
    for (const [index, alternative] of player.market_value.alternatives.entries()) {
      validateMarketValueSeries(alternative, player.id, `market_value.alternatives[${index}]`);
    }

    playerIds.add(player.id);
  }

  for (const tournament of dataset.tournaments) {
    assert(isIsoDate(tournament.last_checked), `Invalid tournament last_checked: ${tournament.id}`);
    assert(
      isIsoDate(tournament.date_range.start) && isIsoDate(tournament.date_range.end),
      `Invalid tournament date range: ${tournament.id}`
    );
  }

  for (const country of dataset.overseasHistory.countries) {
    assert(Array.isArray(country.bucket_focus), `Invalid overseas bucket list for ${country.country}`);
    if (country.big_five_appearance_checklist !== undefined) {
      validateBigFiveChecklist(country.big_five_appearance_checklist, country.country);
    }
    if (country.featured_records !== undefined) {
      assert(
        Array.isArray(country.featured_records),
        `Invalid featured_records list for ${country.country}`
      );
      country.featured_records.forEach((record) =>
        validateOverseasRecord(record, country.country, overseasBucketIds)
      );
    }
  }

  for (const dossier of dataset.dossiers) {
    assert(dossier.id && dossier.name, "Dossier must include id and name");
    assert(isIsoDate(dossier.last_reviewed), `Invalid dossier date: ${dossier.id}`);
    assert(Array.isArray(dossier.timeline), `Invalid dossier timeline: ${dossier.id}`);
    assert(Array.isArray(dossier.roster_views), `Invalid dossier roster views: ${dossier.id}`);
    if (dossier.supporting_documents !== undefined) {
      assert(
        Array.isArray(dossier.supporting_documents),
        `Invalid dossier supporting documents: ${dossier.id}`
      );
    }
    if (dossier.link_audit !== undefined) {
      assert(isIsoDate(dossier.link_audit.checked_at), `Invalid link audit date: ${dossier.id}`);
      assert(Array.isArray(dossier.link_audit.players), `Invalid link audit players: ${dossier.id}`);
    }
    if (dossier.search_disambiguation !== undefined) {
      assert(
        isIsoDate(dossier.search_disambiguation.checked_at),
        `Invalid search disambiguation date: ${dossier.id}`
      );
      assert(
        Array.isArray(dossier.search_disambiguation.search_hygiene),
        `Invalid search hygiene list: ${dossier.id}`
      );
      assert(
        Array.isArray(dossier.search_disambiguation.confusing_entities),
        `Invalid confusing entities list: ${dossier.id}`
      );
    }
  }

  for (const tournament of dataset.tournamentArchive) {
    assert(tournament.id && tournament.competition_name, "Archive tournament must include id and competition_name");
    assert(
      isIsoDate(tournament.date_range.start) && isIsoDate(tournament.date_range.end),
      `Invalid archive tournament date range: ${tournament.id}`
    );
    assert(Array.isArray(tournament.source_links), `Invalid source_links on ${tournament.id}`);
    assert(Array.isArray(tournament.china_matches), `Invalid china_matches on ${tournament.id}`);
    assert(Array.isArray(tournament.china_key_players), `Invalid china_key_players on ${tournament.id}`);
    if (tournament.china_squad !== undefined) {
      assert(Array.isArray(tournament.china_squad), `Invalid china_squad on ${tournament.id}`);
    }
    if (tournament.regional_history !== undefined) {
      validateRegionalHistory(tournament.regional_history, tournament.id);
    }
    validateTournamentArchiveVersioning(tournament);
  }

  if (dataset.chinaMenYouthCoaches !== null) {
    validateChinaMenYouthCoaches(dataset.chinaMenYouthCoaches);
  }

  if (dataset.bigFiveAsianCoaches !== null) {
    validateBigFiveAsianCoaches(dataset.bigFiveAsianCoaches);
  }

  if (dataset.asianCoaches !== null) {
    validateAsianCoaches(dataset.asianCoaches);
  }

  if (dataset.uefaYouthLeague !== null) {
    validateUefaYouthLeague(dataset.uefaYouthLeague, playerIds);
  }

  return dataset;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const dataset = await validateData();
  console.log(
    `Validated ${dataset.players.length} players, ${dataset.tournaments.length} tournaments, ${dataset.projects.length} projects.`
  );
}
