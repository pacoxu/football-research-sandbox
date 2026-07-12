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
  "university-profile",
  "club-profile",
  "league-registration"
]);

const allowedSourceLayerConfidence = new Set(["high", "medium", "low"]);

const allowedAcademyCurrentStatuses = new Set([
  "active-first-team",
  "active-reserve",
  "active-professional",
  "retired-coach",
  "youth-development",
  "needs-review"
]);

const allowedOrganizationTypes = new Set([
  "high-school",
  "club-academy",
  "university",
  "professional-club",
  "military-service-club",
  "overseas-academy"
]);

const allowedYouthCompetitionTypes = new Set([
  "league-pyramid",
  "league-final",
  "school-cup",
  "club-cup",
  "university-league",
  "university-cup",
  "professional-bridge",
  "school-league",
  "school-championship",
  "club-league"
]);

const issue16DeepSampleIds = new Set([
  "jp-rei-ono-2009",
  "jp-aran-sato-2010",
  "jp-takaya-sekine-2009",
  "jp-masataka-kobayashi-2005",
  "jp-kaito-tsuchiya-2006",
  "jp-kosei-ogura-2005",
  "kr-seung-min-lee-2009",
  "kr-geon-woo-park-2009",
  "kr-moon-hyunho-2003",
  "kr-bae-hyunseo-2005",
  "kr-lee-chanouk-2003",
  "kr-kim-taewon-2005",
  "kr-kim-yonghak-2003",
  "jp-ryosuke-furukawa-2009",
  "jp-tomoyasu-hamasaki-2005",
  "kr-woo-jin-jin-2009"
]);

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

const allowedTournamentParticipantStatuses = new Set(["complete", "partial", "cancelled-snapshot"]);
const allowedTournamentEntryStatuses = new Set(["host", "qualified", "participant"]);
const allowedTournamentDrawStatuses = new Set(["complete", "pending", "cancelled"]);

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
  if (["school-profile", "club-academy-profile", "university-profile", "club-profile"].includes(layer.type)) {
    assert(
      !layer.url.includes("assets.the-afc.com"),
      `Organization source layer must not reuse an AFC document on ${label}`
    );
  }
}

function validateLocalizedText(value, label) {
  assert(typeof value === "object" && value !== null, `Invalid localized text on ${label}`);
  assert(typeof value.zh === "string" && value.zh.length > 0, `Missing Chinese text on ${label}`);
  assert(typeof value.en === "string" && value.en.length > 0, `Missing English text on ${label}`);
}

function validateOrganizationReference(value, label) {
  assert(typeof value === "object" && value !== null, `Invalid organization reference on ${label}`);
  assert(typeof value.name === "string" && value.name.length > 0, `Missing organization name on ${label}`);
  assert(typeof value.country === "string" && value.country.length > 0, `Missing organization country on ${label}`);
}

function validateGenbaoDossier(dossier) {
  assert(isIsoDate(dossier.source_checked_at), "Invalid Genbao source_checked_at");
  assert(dossier.headline_stats?.founded === "2000-07", "Invalid Genbao founding snapshot");
  assert(Array.isArray(dossier.roster_views) && dossier.roster_views.length === 7, "Expected seven Genbao generations");

  const players = dossier.roster_views.flatMap((view) => view.players ?? []);
  assert(players.length === 26, `Expected 26 Genbao tracked players, found ${players.length}`);
  assert(dossier.headline_stats.tracked_players === players.length, "Genbao tracked player count mismatch");
  assert(dossier.headline_stats.tracked_generations === dossier.roster_views.length, "Genbao generation count mismatch");

  const identities = new Set();
  for (const player of players) {
    const label = `Genbao player ${player.local_name ?? player.name}`;
    assert(player.name && player.local_name && player.role, `Invalid ${label}`);
    assert(!identities.has(player.local_name), `Duplicate ${label}`);
    identities.add(player.local_name);
    const status = player.current_status;
    assert(status && allowedAcademyCurrentStatuses.has(status.category), `Invalid current status on ${label}`);
    assert(status.organization && status.role, `Missing current organization on ${label}`);
    assert(isIsoDate(status.as_of), `Invalid current status date on ${label}`);
    assert(allowedSourceLayerConfidence.has(status.confidence), `Invalid current status confidence on ${label}`);
    assert(status.source_label && /^https?:\/\//.test(status.source_url), `Invalid current status source on ${label}`);
  }

  const currentProgram = dossier.roster_views.find((view) => view.id === "commissioned-wave-1314")?.program_status;
  assert(currentProgram?.category === "active-development-program", "Missing Genbao 1314 program status");
  assert(isIsoDate(currentProgram.as_of), "Invalid Genbao program status date");
  assert(/^https?:\/\//.test(currentProgram.source_url), "Invalid Genbao program status source");
}

function validateYouthDevelopmentSystems(payload) {
  assert(payload?.schema_version === 1, "Unsupported youth-development-systems schema version");
  assert(isIsoDate(payload.checked_at), "Invalid youth-development-systems checked_at");
  assert(Array.isArray(payload.systems) && payload.systems.length === 2, "Expected Japan and Korea youth systems");

  const systemIds = new Set();
  const competitionIds = new Set();
  for (const system of payload.systems) {
    assert(!systemIds.has(system.id), `Duplicate youth system id: ${system.id}`);
    systemIds.add(system.id);
    assert(["Japan", "Korea Republic"].includes(system.country), `Invalid youth system country: ${system.id}`);
    validateLocalizedText(system.name, `${system.id}.name`);
    validateLocalizedText(system.summary, `${system.id}.summary`);
    assert(Array.isArray(system.registration_categories), `Invalid registration categories on ${system.id}`);
    for (const category of system.registration_categories) {
      assert(category.id && category.age_band, `Invalid registration category on ${system.id}`);
      validateLocalizedText(category.label, `${category.id}.label`);
      assert(/^https?:\/\//.test(category.source_url), `Invalid registration source on ${category.id}`);
      assert(Array.isArray(category.organization_types), `Invalid organization types on ${category.id}`);
      for (const organizationType of category.organization_types) {
        assert(allowedOrganizationTypes.has(organizationType), `Invalid organization type on ${category.id}`);
      }
    }
    assert(Array.isArray(system.competitions) && system.competitions.length > 0, `Missing competitions on ${system.id}`);
    for (const competition of system.competitions) {
      assert(!competitionIds.has(competition.id), `Duplicate youth competition id: ${competition.id}`);
      competitionIds.add(competition.id);
      assert(allowedYouthCompetitionTypes.has(competition.competition_type), `Invalid competition type on ${competition.id}`);
      validateLocalizedText(competition.name, `${competition.id}.name`);
      validateLocalizedText(competition.stable_structure, `${competition.id}.stable_structure`);
      assert(/^https?:\/\//.test(competition.source_url), `Invalid source URL on ${competition.id}`);
      assert(Array.isArray(competition.organization_types), `Invalid organization types on ${competition.id}`);
      for (const organizationType of competition.organization_types) {
        assert(allowedOrganizationTypes.has(organizationType), `Invalid organization type on ${competition.id}`);
      }
      if (competition.annual_snapshot !== undefined) {
        assert(typeof competition.annual_snapshot.season === "string", `Invalid annual snapshot on ${competition.id}`);
        validateLocalizedText(competition.annual_snapshot.note, `${competition.id}.annual_snapshot.note`);
      }
    }
    for (const source of system.source_links) {
      assert(source.label && /^https?:\/\//.test(source.url), `Invalid youth system source on ${system.id}`);
      assert(isIsoDate(source.checked_at), `Invalid youth system source date on ${system.id}`);
    }
  }

  for (const system of payload.systems) {
    for (const competition of system.competitions) {
      if (competition.parent_competition_id !== undefined) {
        assert(competitionIds.has(competition.parent_competition_id), `Unknown parent competition on ${competition.id}`);
      }
    }
  }

  return competitionIds;
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

function validateTournamentDateRange(tournament, label = "archive tournament") {
  const range = tournament.date_range;
  assert(range && typeof range === "object", `Missing ${label} date range: ${tournament.id}`);
  if (tournament.date_precision === "tbc") {
    assert(
      range.start === null && range.end === null,
      `TBC ${label} must use null dates: ${tournament.id}`
    );
    return;
  }
  assert(
    isIsoDate(range.start) && isIsoDate(range.end),
    `Invalid ${label} date range: ${tournament.id}`
  );
}

function validateTournamentGroup(group, tournamentId, scope) {
  assert(group && typeof group === "object", `Invalid ${scope} group on ${tournamentId}`);
  assert(typeof group.name === "string" && group.name.length > 0, `Missing ${scope} group name on ${tournamentId}`);
  assert(Array.isArray(group.teams) && group.teams.length > 0, `Invalid ${scope} group teams on ${tournamentId}:${group.name}`);
  assert(
    new Set(group.teams).size === group.teams.length,
    `Duplicate team inside ${scope} group on ${tournamentId}:${group.name}`
  );
  for (const team of group.teams) {
    assert(typeof team === "string" && team.length > 0, `Invalid ${scope} team on ${tournamentId}:${group.name}`);
  }
  if (group.host !== undefined) {
    assert(typeof group.host === "string" && group.host.length > 0, `Invalid ${scope} host on ${tournamentId}:${group.name}`);
  }
}

function validateTournamentField(tournament) {
  const participants = tournament.participants;
  const draw = tournament.final_draw;
  if (participants === undefined && draw === undefined) {
    return;
  }

  assert(participants && typeof participants === "object", `Missing participants on ${tournament.id}`);
  assert(
    allowedTournamentParticipantStatuses.has(participants.status),
    `Invalid participants status on ${tournament.id}`
  );
  assert(Array.isArray(participants.teams), `Invalid participants teams on ${tournament.id}`);
  const participantNames = participants.teams.map((entry) => entry.team);
  assert(new Set(participantNames).size === participantNames.length, `Duplicate participant on ${tournament.id}`);
  for (const entry of participants.teams) {
    assert(entry && typeof entry.team === "string" && entry.team.length > 0, `Invalid participant on ${tournament.id}`);
    assert(
      allowedTournamentEntryStatuses.has(entry.entry_status),
      `Invalid participant entry_status on ${tournament.id}:${entry.team}`
    );
    if (entry.qualification_route !== undefined) {
      assert(typeof entry.qualification_route === "string" && entry.qualification_route.length > 0, `Invalid qualification route on ${tournament.id}:${entry.team}`);
    }
    if (entry.confirmed_at !== undefined) {
      assert(isIsoDate(entry.confirmed_at), `Invalid participant confirmed_at on ${tournament.id}:${entry.team}`);
    }
  }

  assert(draw && typeof draw === "object", `Missing final_draw on ${tournament.id}`);
  assert(allowedTournamentDrawStatuses.has(draw.status), `Invalid final_draw status on ${tournament.id}`);
  assert(Array.isArray(draw.groups), `Invalid final_draw groups on ${tournament.id}`);
  draw.groups.forEach((group) => validateTournamentGroup(group, tournament.id, "final draw"));
  const drawnTeams = draw.groups.flatMap((group) => group.teams);
  assert(new Set(drawnTeams).size === drawnTeams.length, `Team appears in multiple final groups on ${tournament.id}`);

  if (tournament.status === "completed") {
    assert(participants.status === "complete", `Completed tournament has partial participants on ${tournament.id}`);
    assert(draw.status === "complete" && draw.groups.length > 0, `Completed tournament has incomplete draw on ${tournament.id}`);
    assert(
      participantNames.length === drawnTeams.length && participantNames.every((team) => drawnTeams.includes(team)),
      `Participants and final draw differ on ${tournament.id}`
    );
  }

  if (tournament.qualifiers !== undefined) {
    assert(Array.isArray(tournament.qualifiers) && tournament.qualifiers.length > 0, `Invalid qualifiers on ${tournament.id}`);
    const qualifierTeams = [];
    for (const phase of tournament.qualifiers) {
      assert(typeof phase.phase === "string" && phase.phase.length > 0, `Missing qualifier phase on ${tournament.id}`);
      assert(phase.status === "drawn", `Invalid qualifier phase status on ${tournament.id}:${phase.phase}`);
      assert(isIsoDate(phase.date_range?.start) && isIsoDate(phase.date_range?.end), `Invalid qualifier dates on ${tournament.id}:${phase.phase}`);
      assert(Array.isArray(phase.groups) && phase.groups.length > 0, `Invalid qualifier groups on ${tournament.id}:${phase.phase}`);
      for (const group of phase.groups) {
        validateTournamentGroup(group, tournament.id, `qualifier ${phase.phase}`);
        qualifierTeams.push(...group.teams);
      }
    }
    assert(new Set(qualifierTeams).size === qualifierTeams.length, `Team appears in multiple qualifier groups on ${tournament.id}`);
  }
}

function validateU20ArchiveCoverage(tournaments) {
  const byId = new Map(tournaments.map((tournament) => [tournament.id, tournament]));
  assert(byId.size === tournaments.length, "Duplicate tournament archive id");

  const fifaYears = [1985, 1987, 1989, 1991, 1993, 1995, 1997, 1999, 2001, 2003, 2005, 2007, 2009, 2011, 2013, 2015, 2017, 2019, 2021, 2023, 2025];
  const afcYears = [1985, 1986, 1988, 1990, 1992, 1994, 1996, 1998, 2000, 2002, 2004, 2006, 2008, 2010, 2012, 2014, 2016, 2018, 2020, 2023, 2025];
  const editionYear = (tournament) => Number.parseInt(tournament.edition_label, 10);
  const fifaCycles = tournaments.filter(
    (tournament) => tournament.level === "u20-world-cup" && editionYear(tournament) >= 1985 && editionYear(tournament) <= 2025
  );
  const afcCycles = tournaments.filter(
    (tournament) => tournament.level === "u20" && editionYear(tournament) >= 1985 && editionYear(tournament) <= 2025
  );
  assert(fifaCycles.length === 21, `Expected exactly 21 FIFA U20 cycles, found ${fifaCycles.length}`);
  assert(afcCycles.length === 21, `Expected exactly 21 AFC U20 cycles, found ${afcCycles.length}`);

  for (const year of fifaYears) {
    assert(byId.has(`fifa-u20-world-cup-${year}`), `Missing FIFA U20 archive cycle: ${year}`);
  }
  for (const year of afcYears) {
    assert(byId.has(`afc-u20-${year}`), `Missing AFC U20 archive cycle: ${year}`);
  }
  assert(byId.get("fifa-u20-world-cup-2021")?.status === "cancelled", "FIFA U20 2021 must remain cancelled");
  assert(byId.get("afc-u20-2020")?.status === "cancelled", "AFC U20 2020 must remain cancelled");
  assert(byId.get("fifa-u20-world-cup-2027")?.status === "upcoming", "Missing FIFA U20 2027 future archive");
  assert(byId.get("afc-u20-2027")?.status === "upcoming", "Missing AFC U20 2027 future archive");

  const u20Scope = [
    ...fifaYears.map((year) => byId.get(`fifa-u20-world-cup-${year}`)),
    ...afcYears.map((year) => byId.get(`afc-u20-${year}`)),
    byId.get("fifa-u20-world-cup-2027"),
    byId.get("afc-u20-2027")
  ];
  for (const tournament of u20Scope) {
    assert(isIsoDate(tournament.source_checked_at), `Missing U20 source_checked_at on ${tournament.id}`);
    assert(
      Array.isArray(tournament.source_version) && tournament.source_version.length > 0,
      `Missing field-level U20 source_version on ${tournament.id}`
    );
    assert(tournament.participants && tournament.final_draw, `Missing U20 field data on ${tournament.id}`);
    if (tournament.status === "completed") {
      assert(tournament.champion && tournament.runner_up, `Missing U20 finalists on ${tournament.id}`);
      assert(tournament.date_precision === "exact", `Completed U20 event needs exact dates: ${tournament.id}`);
    }
    if (tournament.status === "cancelled") {
      assert(tournament.champion === null && tournament.runner_up === null, `Cancelled U20 event must not have finalists: ${tournament.id}`);
      assert(tournament.participants.status === "cancelled-snapshot", `Cancelled U20 event needs a field snapshot: ${tournament.id}`);
      assert(tournament.final_draw.status === "cancelled", `Cancelled U20 draw must be cancelled: ${tournament.id}`);
    }
    if (tournament.status === "upcoming") {
      assert(tournament.champion === null && tournament.runner_up === null, `Future U20 event must not have finalists: ${tournament.id}`);
      assert(tournament.date_precision === "tbc", `Future U20 event must keep dates pending: ${tournament.id}`);
      assert(tournament.final_draw.status === "pending", `Future U20 draw must remain pending: ${tournament.id}`);
    }
  }

  const afc2027QualifierTeams = byId.get("afc-u20-2027")?.qualifiers?.flatMap((phase) =>
    phase.groups.flatMap((group) => group.teams)
  ) ?? [];
  assert(afc2027QualifierTeams.length === 44, "AFC U20 2027 must retain all 44 qualifier entrants");
  assert(
    byId.get("afc-u20-2027").participants.teams.length === 1,
    "AFC U20 2027 qualifier entrants must not be promoted into the partial finals participant list"
  );
  assert(
    byId.get("afc-u20-2027").participants.teams[0].entry_status === "host" &&
      byId.get("afc-u20-2027").china_status === "host",
    "AFC U20 2027 must keep host identity separate from qualified status"
  );
}

function validateChinaU20PlayerStatistics(tournament, players) {
  const statistics = tournament.china_player_statistics;
  const rosterBoundary = tournament.roster_boundary;
  const allowedRosterStatuses = new Set([
    "tournament-squad",
    "tournament-replacement",
    "replaced-before-match"
  ]);

  assert(statistics && typeof statistics === "object", "Missing China U20 2025 player statistics");
  assert(isIsoDate(statistics.checked_at), "Invalid China U20 2025 statistics checked_at");
  assert(statistics.scope, "Missing China U20 2025 statistics scope");
  assert(statistics.minutes_method, "Missing China U20 2025 minutes method");
  assert(
    Array.isArray(statistics.source_links) && statistics.source_links.length === 4,
    "China U20 2025 statistics must retain four official Match Summaries"
  );
  for (const source of statistics.source_links) {
    assert(source.label, "Missing China U20 2025 statistics source label");
    assert(/^https?:\/\//.test(source.url), "Invalid China U20 2025 statistics source URL");
  }

  assert(rosterBoundary && typeof rosterBoundary === "object", "Missing China U20 2025 roster boundary");
  assert(isIsoDate(rosterBoundary.checked_at), "Invalid China U20 2025 roster checked_at");
  assert(
    Array.isArray(rosterBoundary.replacement_deltas) &&
      rosterBoundary.replacement_deltas.length === 1,
    "China U20 2025 must retain the documented goalkeeper replacement"
  );

  assert(
    Array.isArray(statistics.players) && statistics.players.length === 24,
    "China U20 2025 statistics must cover 23 original registrations plus one replacement"
  );

  const playerById = new Map(players.map((player) => [player.id, player]));
  const statisticsPlayerIds = new Set();
  const computed = {
    original_final_registration_players: 0,
    updated_tournament_squad_players: 0,
    competition_tagged_players: statistics.players.length,
    players_used: 0,
    appearance_records: 0,
    starts: 0,
    player_minutes: 0,
    goals: 0
  };

  for (const row of statistics.players) {
    assert(row.player_id && row.player, "Invalid China U20 2025 player statistics row");
    assert(!statisticsPlayerIds.has(row.player_id), `Duplicate China U20 2025 statistics row: ${row.player_id}`);
    assert(
      allowedRosterStatuses.has(row.roster_status),
      `Invalid China U20 2025 roster_status on ${row.player_id}`
    );
    for (const field of ["appearances", "starts", "minutes", "goals"]) {
      assert(
        Number.isInteger(row[field]) && row[field] >= 0,
        `Invalid China U20 2025 ${field} on ${row.player_id}`
      );
    }
    assert(row.starts <= row.appearances, `China U20 2025 starts exceed appearances on ${row.player_id}`);
    if (row.note !== undefined) {
      assert(typeof row.note === "string" && row.note.length > 0, `Invalid China U20 2025 note on ${row.player_id}`);
    }

    const player = playerById.get(row.player_id);
    assert(player, `Missing China U20 2025 player record: ${row.player_id}`);
    const participation = player.tournament_participation.filter(
      (entry) => entry.competition_id === tournament.id
    );
    assert(participation.length === 1, `Invalid China U20 2025 participation count on ${row.player_id}`);
    for (const field of ["roster_status", "appearances", "minutes", "goals"]) {
      assert(
        participation[0][field] === row[field],
        `China U20 2025 ${field} does not match archive statistics on ${row.player_id}`
      );
    }

    if (row.roster_status !== "tournament-replacement") {
      computed.original_final_registration_players += 1;
    }
    if (row.roster_status !== "replaced-before-match") {
      computed.updated_tournament_squad_players += 1;
    }
    if (row.appearances > 0) {
      computed.players_used += 1;
    }
    computed.appearance_records += row.appearances;
    computed.starts += row.starts;
    computed.player_minutes += row.minutes;
    computed.goals += row.goals;
    statisticsPlayerIds.add(row.player_id);
  }

  const taggedPlayers = players.filter((player) =>
    player.tournament_participation.some((entry) => entry.competition_id === tournament.id)
  );
  assert(taggedPlayers.length === 24, "China U20 2025 must retain 24 version-aware player records");
  assert(
    taggedPlayers.every((player) => statisticsPlayerIds.has(player.id)),
    "China U20 2025 tagged player is missing from archive statistics"
  );

  assert(statistics.totals.matches === 4, "China U20 2025 statistics must cover four matches");
  for (const [field, value] of Object.entries(computed)) {
    assert(statistics.totals[field] === value, `Invalid China U20 2025 aggregate: ${field}`);
  }
  assert(
    rosterBoundary.original_final_registration_count ===
      computed.original_final_registration_players,
    "China U20 2025 original roster boundary does not match statistics"
  );
  assert(
    rosterBoundary.updated_tournament_squad_count ===
      computed.updated_tournament_squad_players,
    "China U20 2025 updated roster boundary does not match statistics"
  );
  assert(
    rosterBoundary.competition_tagged_player_count === computed.competition_tagged_players,
    "China U20 2025 tagged-player boundary does not match statistics"
  );
  const [replacement] = rosterBoundary.replacement_deltas;
  assert(
    replacement.out_player_id === "cn-yuan-jianrui-2005" &&
      replacement.in_player_id === "cn-zhang-haoran-2006" &&
      replacement.shirt_number === 22,
    "China U20 2025 goalkeeper replacement boundary changed"
  );
  assert(computed.original_final_registration_players === 23, "China U20 2025 original registration must contain 23 players");
  assert(computed.updated_tournament_squad_players === 23, "China U20 2025 updated squad must contain 23 players");
  assert(computed.players_used === 20, "China U20 2025 must retain 20 players used");
  assert(computed.appearance_records === 61, "China U20 2025 must retain 61 appearance records");
  assert(computed.starts === 44, "China U20 2025 must retain 44 starts");
  assert(computed.player_minutes === 3960, "China U20 2025 must retain 3960 player-minutes");
  assert(computed.goals === 8, "China U20 2025 must retain eight goals");
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
  const youthCompetitionIds = validateYouthDevelopmentSystems(dataset.youthDevelopmentSystems);
  const issue16Squads = new Map([
    ["Japan|afc-u17-2026", []],
    ["Japan|afc-u23-2026", []],
    ["Korea Republic|afc-u17-2026", []],
    ["Korea Republic|afc-u23-2026", []]
  ]);

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
    if (player.registration_club.organization_type !== undefined) {
      assert(
        allowedOrganizationTypes.has(player.registration_club.organization_type),
        `Invalid registration club organization_type on ${player.id}`
      );
    }
    if (player.registration_club.parent_organization !== undefined) {
      validateOrganizationReference(player.registration_club.parent_organization, `${player.id}.parent_organization`);
    }
    if (player.registration_club.education_partner !== undefined) {
      validateOrganizationReference(player.registration_club.education_partner, `${player.id}.education_partner`);
    }
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
      if (step.organization_type !== undefined) {
        assert(allowedOrganizationTypes.has(step.organization_type), `Invalid pathway organization_type on ${player.id}`);
      }
      if (step.competition_context_ids !== undefined) {
        assert(Array.isArray(step.competition_context_ids), `Invalid competition_context_ids on ${player.id}`);
        for (const contextId of step.competition_context_ids) {
          assert(youthCompetitionIds.has(contextId), `Unknown youth competition context ${contextId} on ${player.id}`);
        }
      }
      if (step.parent_organization !== undefined) {
        validateOrganizationReference(step.parent_organization, `${player.id}.pathway.parent_organization`);
      }
      if (step.education_partner !== undefined) {
        validateOrganizationReference(step.education_partner, `${player.id}.pathway.education_partner`);
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
      const issue16Squad = issue16Squads.get(`${player.country}|${entry.competition_id}`);
      if (issue16Squad !== undefined) {
        issue16Squad.push(player);
      }
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

  const issue16Players = [...issue16Squads.values()].flat();
  for (const [squadKey, squad] of issue16Squads) {
    assert(squad.length === 23, `Expected 23 players in issue #16 squad ${squadKey}, found ${squad.length}`);
  }
  assert(issue16Players.length === 92, `Expected 92 issue #16 players, found ${issue16Players.length}`);
  for (const player of issue16Players) {
    assert(
      allowedOrganizationTypes.has(player.registration_club.organization_type),
      `Missing issue #16 organization_type on ${player.id}`
    );
    const afcLayers = (player.source_layers ?? []).filter((layer) => layer.type === "afc-registration");
    assert(afcLayers.length === 1, `Expected one AFC registration source on ${player.id}`);
    const currentPathway = player.training_pathway.find(
      (step) => step.organization === player.registration_club.name
    );
    assert(currentPathway !== undefined, `Current registration missing from pathway on ${player.id}`);
    assert(
      currentPathway.organization_type === player.registration_club.organization_type,
      `Pathway organization type differs from current registration on ${player.id}`
    );
  }
  for (const playerId of issue16DeepSampleIds) {
    const player = issue16Players.find((candidate) => candidate.id === playerId);
    assert(player !== undefined, `Missing issue #16 deep sample ${playerId}`);
    const afcUrls = new Set(
      player.source_layers.filter((layer) => layer.type === "afc-registration").map((layer) => layer.url)
    );
    const independentLayers = player.source_layers.filter(
      (layer) => layer.type !== "afc-registration" && !afcUrls.has(layer.url)
    );
    assert(independentLayers.length > 0, `Missing independent official source layer on ${playerId}`);
  }

  for (const tournament of dataset.tournaments) {
    assert(isIsoDate(tournament.last_checked), `Invalid tournament last_checked: ${tournament.id}`);
    validateTournamentDateRange(tournament, "focus tournament");
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
    if (dossier.id === "genbao-football-base") {
      validateGenbaoDossier(dossier);
    }
  }

  for (const tournament of dataset.tournamentArchive) {
    assert(tournament.id && tournament.competition_name, "Archive tournament must include id and competition_name");
    validateTournamentDateRange(tournament);
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
    validateTournamentField(tournament);
    if (tournament.id === "afc-u20-2025") {
      validateChinaU20PlayerStatistics(tournament, dataset.players);
    }
  }
  validateU20ArchiveCoverage(dataset.tournamentArchive);

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
