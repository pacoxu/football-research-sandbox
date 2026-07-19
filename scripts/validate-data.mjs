import fs from "node:fs/promises";
import path from "node:path";
import { loadDataset, paths } from "./lib/data-loader.mjs";
import { MARKET_VALUE_STATUSES } from "./lib/market-values.mjs";
import {
  countOverseasStatuses,
  getChinaOverseasStatusErrors,
  hasForeignRegistration,
  normalizeCountry
} from "./lib/overseas-status.mjs";

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

const chinaDomestic2026CompetitionIds = new Set([
  "csl-2026",
  "china-league-one-2026",
  "china-league-two-2026",
  "cfa-cup-2026",
  "china-u21-league-2026",
  "china-champions-league-2026"
]);
const allowedChinaDomesticCompetitionLevels = new Set([
  "senior-top-flight",
  "senior-second-tier",
  "senior-third-tier",
  "senior-cup",
  "youth-u21",
  "senior-amateur-fourth-tier"
]);
const allowedParticipationStatisticsStatuses = new Set(["complete", "partial"]);

const allowedRegistrationClubStatuses = new Set(["current", "tournament-snapshot"]);
const allowedPlayerRosterStatuses = new Set([
  "final-squad",
  "later-camp-callup",
  "replaced-before-match",
  "tournament-squad",
  "tournament-replacement",
  "withdrawn/unused"
]);

const historicalChinaYouthStatTournamentIds = new Set([
  "fifa-u20-world-cup-1983",
  "fifa-u16-world-championship-1985",
  "fifa-u20-world-cup-1985",
  "fifa-u16-world-championship-1989",
  "fifa-u17-world-championship-1991",
  "fifa-u17-world-championship-1993",
  "fifa-u20-world-cup-1997",
  "fifa-u20-world-cup-2001",
  "fifa-u17-world-championship-2003",
  "fifa-u17-world-cup-2005",
  "fifa-u20-world-cup-2005"
]);

const historicalYouthPlayerStatFields = [
  "appearances",
  "starts",
  "substitute_appearances",
  "minutes",
  "goals"
];

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
  "community-club",
  "university",
  "professional-club",
  "military-service-club",
  "overseas-academy",
  "national-academy",
  "football-school",
  "professional-club-unspecified"
]);

const nativeNameAuditCountries = new Set(["China PR", "Japan", "Korea Republic", "Uzbekistan"]);
const allowedNativeVerificationStatuses = new Set(["verified", "unresolved"]);
const allowedNativeLanguageTags = new Set(["zh-Hans", "ja-Jpan", "ko-Kore", "uz-Latn", "uz-Cyrl"]);

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
  "club-league",
  "talent-development-program",
  "academy-certification",
  "club-development-program",
  "player-development-framework"
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

const issue47DeepSampleIds = new Set([
  "au-steven-hall-2005",
  "au-panagiotis-kikianis-2005",
  "au-paul-okon-engstler-2005",
  "au-luka-jovanovic-2005"
]);

const issue48DeepSampleIds = new Set([
  "au-charlie-wilson-papps-2009",
  "au-miles-milliner-2009",
  "au-oliver-ocarroll-2009",
  "au-akeem-gerald-2010"
]);

const completeSquadExpectations = new Map([
  ["IR Iran|afc-u17-2025", 23],
  ["Australia|afc-u20-2025", 23],
  ["IR Iran|afc-u20-2025", 23],
  ["Uzbekistan|afc-u20-2025", 23],
  ["Qatar|afc-u23-2024", 23],
  ["Saudi Arabia|afc-u23-2024", 23],
  ["Uzbekistan|afc-u23-2024", 23],
  ["IR Iran|afc-u23-2026", 23],
  ["Qatar|afc-u23-2026", 23],
  ["Saudi Arabia|afc-u23-2026", 23],
  ["Uzbekistan|afc-u23-2026", 23],
  ["Australia|afc-u17-2026", 23],
  ["Uzbekistan|afc-u17-2026", 23]
]);

const notApplicableSquadExpectations = new Set([
  "IR Iran|afc-u23-2024",
  "IR Iran|afc-u17-2026"
]);

const allowedComparisonRosterStatuses = new Set([
  "complete-final-registration",
  "not-applicable"
]);

const allowedTournamentSourceVersionTypes = new Set([
  "afc-final-registration",
  "afc-final-report",
  "afc-technical-report",
  "afc-match-report",
  "afc-match-schedule",
  "afc-tournament-home",
  "afc-stats-archive",
  "fifa-report",
  "official-match-report",
  "official-match-record",
  "trusted-match-database",
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

const allowedChinaYouthCoachOrganizationTypes = new Set([
  "campus-school",
  "private-academy",
  "independent-base",
  "professional-academy",
  "independent-project",
  "sports-school"
]);

const allowedChinaYouthCoachSourceTypes = new Set([
  "official-association",
  "official-school",
  "official-club",
  "government",
  "state-media",
  "league",
  "secondary-media",
  "self-published"
]);

const allowedChinaYouthCoachPeriodStatuses = new Set([
  "current-reported",
  "former",
  "confirmed-2025"
]);

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
  const expectedCountries = ["Japan", "Korea Republic", "Norway", "Denmark", "Sweden"];
  assert(Array.isArray(payload.systems) && payload.systems.length === expectedCountries.length, "Expected five youth systems");

  const systemIds = new Set();
  const competitionIds = new Set();
  for (const system of payload.systems) {
    assert(!systemIds.has(system.id), `Duplicate youth system id: ${system.id}`);
    systemIds.add(system.id);
    assert(expectedCountries.includes(system.country), `Invalid youth system country: ${system.id}`);
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

  const taggedPlayers = players.filter(
    (player) =>
      player.country === "China PR" &&
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

function validateChinaU23PlayerStatistics(tournament, players) {
  const statistics = tournament.china_player_statistics;
  assert(statistics && typeof statistics === "object", "Missing China U23 2026 player statistics");
  assert(isIsoDate(statistics.checked_at), "Invalid China U23 2026 statistics checked_at");
  assert(tournament.china_matches.length === 6, "China U23 2026 must retain six matches");
  assert(statistics.players?.length === 23, "China U23 2026 statistics must cover 23 players");

  const playerById = new Map(players.map((player) => [player.id, player]));
  const expected = new Map(
    statistics.players.map((row) => [row.player_id, {
      appearances: 0,
      starts: 0,
      substitute_appearances: 0,
      minutes: 0,
      goals: 0,
      yellow_cards: 0,
      red_cards: 0
    }])
  );
  const seenRows = new Set();
  const allowedCardTypes = new Set(["yellow", "second-yellow-red", "straight-red"]);

  for (const match of tournament.china_matches) {
    assert(match.source_tier === "official-result+trusted-event-feed", `Missing China U23 source tier: ${match.date}`);
    assert(/^https?:\/\//.test(match.official_source), `Missing China U23 official match source: ${match.date}`);
    assert(/^https?:\/\//.test(match.event_source), `Missing China U23 event source: ${match.date}`);
    const matchLength = match.stage === "Quarter-final" ? 120 : 90;
    const starters = match.china_lineup?.starters ?? [];
    const substitutes = match.china_lineup?.substitutes ?? [];
    assert(starters.length === 11, `China U23 2026 match must have 11 starters: ${match.date}`);
    assert(starters.length + substitutes.length === 23, `China U23 2026 matchday list must have 23 players: ${match.date}`);

    const matchPlayerIds = new Set();
    for (const entry of [...starters, ...substitutes]) {
      assert(playerById.has(entry.player_id), `Unknown China U23 lineup player: ${entry.player_id}`);
      assert(expected.has(entry.player_id), `China U23 lineup player missing statistics row: ${entry.player_id}`);
      assert(!matchPlayerIds.has(entry.player_id), `Duplicate China U23 matchday player: ${match.date} ${entry.player_id}`);
      matchPlayerIds.add(entry.player_id);
    }

    const substitutionByOutgoingPlayer = new Map(
      substitutes
        .filter((entry) => entry.minute !== undefined)
        .map((entry) => [entry.replaced_player_id, entry])
    );
    for (const starter of starters) {
      const row = expected.get(starter.player_id);
      const substitution = substitutionByOutgoingPlayer.get(starter.player_id);
      row.appearances += 1;
      row.starts += 1;
      row.minutes += substitution ? Number(substitution.minute) : matchLength;
    }
    for (const substitute of substitutes.filter((entry) => entry.minute !== undefined)) {
      assert(
        Number.isInteger(Number(substitute.minute)) && Number(substitute.minute) >= 0 && Number(substitute.minute) <= matchLength,
        `Invalid China U23 substitution minute: ${match.date} ${substitute.player_id}`
      );
      assert(
        starters.some((starter) => starter.player_id === substitute.replaced_player_id),
        `China U23 substitute must identify an outgoing starter: ${match.date} ${substitute.player_id}`
      );
      const row = expected.get(substitute.player_id);
      row.appearances += 1;
      row.substitute_appearances += 1;
      row.minutes += matchLength - Number(substitute.minute);
    }

    for (const contribution of match.china_contributions ?? []) {
      assert(playerById.has(contribution.player_id), `Unknown China U23 contribution player: ${contribution.player_id}`);
      if (contribution.type === "goal") {
        expected.get(contribution.player_id).goals += 1;
      }
    }
    for (const card of match.china_cards ?? []) {
      assert(allowedCardTypes.has(card.type), `Invalid China U23 card type: ${card.type}`);
      assert(playerById.has(card.player_id), `Unknown China U23 card player: ${card.player_id}`);
      const row = expected.get(card.player_id);
      if (card.type === "yellow" || card.type === "second-yellow-red") {
        row.yellow_cards += 1;
      }
      if (card.type === "second-yellow-red" || card.type === "straight-red") {
        row.red_cards += 1;
      }
    }
  }

  const computedTotals = {
    matches: tournament.china_matches.length,
    players: statistics.players.length,
    players_used: 0,
    starts: 0,
    minutes: 0,
    goals: 0,
    yellow_cards: 0,
    red_cards: 0
  };
  for (const row of statistics.players) {
    assert(!seenRows.has(row.player_id), `Duplicate China U23 statistics row: ${row.player_id}`);
    assert(playerById.has(row.player_id), `Missing China U23 player record: ${row.player_id}`);
    assert(row.roster_status === "final-squad", `Invalid China U23 roster status: ${row.player_id}`);
    for (const field of ["appearances", "starts", "substitute_appearances", "minutes", "goals", "yellow_cards", "red_cards"]) {
      assert(Number.isInteger(row[field]) && row[field] >= 0, `Invalid China U23 ${field}: ${row.player_id}`);
      assert(row[field] === expected.get(row.player_id)[field], `China U23 ${field} does not match match events: ${row.player_id}`);
    }
    assert(row.substitute_appearances === row.appearances - row.starts, `Invalid China U23 substitute appearances: ${row.player_id}`);
    if (row.appearances > 0) computedTotals.players_used += 1;
    computedTotals.starts += row.starts;
    computedTotals.minutes += row.minutes;
    computedTotals.goals += row.goals;
    computedTotals.yellow_cards += row.yellow_cards;
    computedTotals.red_cards += row.red_cards;
    seenRows.add(row.player_id);

    const participation = playerById.get(row.player_id).tournament_participation.filter(
      (entry) => entry.competition_id === tournament.id
    );
    assert(participation.length === 1, `Invalid China U23 participation count: ${row.player_id}`);
    for (const field of ["roster_status", "appearances", "starts", "substitute_appearances", "minutes", "goals", "yellow_cards", "red_cards"]) {
      assert(participation[0][field] === row[field], `China U23 generated participation mismatch: ${row.player_id} ${field}`);
    }
  }

  for (const [field, value] of Object.entries(computedTotals)) {
    assert(statistics.totals[field] === value, `Invalid China U23 aggregate: ${field}`);
  }
  assert(computedTotals.players_used === 21, "China U23 2026 must retain 21 players used");
  assert(computedTotals.starts === 66, "China U23 2026 must retain 66 starts");
  assert(computedTotals.minutes === 6270, "China U23 2026 must retain 6270 player-minutes");
  assert(computedTotals.goals === 4, "China U23 2026 must retain four match goals");
}

function validateChinaU17RosterAudit(tournament) {
  const boundary = tournament.roster_boundary;
  const audit = boundary?.unmapped_player_audit;
  assert(tournament.china_squad?.length === 23, "China U17 2026 final squad must remain 23 players");
  assert(boundary?.counts?.final_squad === 23, "China U17 2026 roster boundary must remain 23");
  assert(
    boundary.counts.latest_public_roster_mapped_players + boundary.counts.latest_public_roster_unmapped_players === 24,
    "China U17 2026 latest public roster must remain 24 players"
  );
  assert(audit?.players?.length === 3, "China U17 2026 must retain three explicit unmapped-player audits");
  const auditedNames = new Set(audit.players.map((entry) => entry.name.zh));
  for (const name of ["张君豪", "孙臣曦", "袁博涵"]) {
    assert(auditedNames.has(name), `Missing China U17 roster audit: ${name}`);
  }
  for (const entry of audit.players) {
    assert(entry.roster_status === "later-camp-callup", `Invalid China U17 audited roster status: ${entry.name.zh}`);
    assert(entry.result === "insufficient-evidence" || entry.player_id, `Unresolved China U17 roster audit: ${entry.name.zh}`);
    assert(!tournament.china_squad.some((player) => player.player_id === entry.player_id), `Audited later call-up entered China U17 final squad: ${entry.name.zh}`);
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

function validateChinaOverseasStatus(player) {
  for (const error of getChinaOverseasStatusErrors(player)) {
    assert(false, `Invalid overseas_status on ${player.id}: ${error}`);
  }
}

function validateOverseasMarketValuePeakRanking(ranking, overseasHistory) {
  assert(typeof ranking === "object" && ranking !== null, "Missing overseas market-value peak ranking");
  assert(isIsoDate(ranking.checked_at), "Invalid overseas market-value peak ranking checked_at");
  assert(ranking.provider === "Transfermarkt", "Invalid overseas market-value peak ranking provider");
  assert(typeof ranking.scope_note === "string" && ranking.scope_note.length > 0, "Missing overseas market-value peak ranking scope note");
  assert(Array.isArray(ranking.entries) && ranking.entries.length > 0, "Missing overseas market-value peak ranking entries");

  const featuredRecordIds = new Set(
    overseasHistory.countries.flatMap((country) =>
      (country.featured_records ?? []).map((record) => record.id)
    )
  );
  const entryIds = new Set();
  let previousPeak = Number.POSITIVE_INFINITY;

  for (const entry of ranking.entries) {
    assert(entry.id && entry.name && entry.local_name && entry.country, "Invalid overseas market-value peak ranking identity");
    assert(!entryIds.has(entry.id), `Duplicate overseas market-value peak ranking id: ${entry.id}`);
    entryIds.add(entry.id);
    assert(
      featuredRecordIds.has(entry.overseas_history_record_id),
      `Unknown overseas history record on market-value peak ranking: ${entry.overseas_history_record_id}`
    );
    validateMarketValuePoint(entry.peak, entry.id, "overseas_history_peak");
    assert(Number.isInteger(entry.peak.age) && entry.peak.age > 0, `Invalid overseas history peak age on ${entry.id}`);
    assert(typeof entry.peak.club === "string" && entry.peak.club.length > 0, `Missing overseas history peak club on ${entry.id}`);
    assert(entry.peak.eur <= previousPeak, `Unsorted overseas market-value peak ranking at ${entry.id}`);
    previousPeak = entry.peak.eur;

    if (entry.retired === true) {
      assert(entry.current === undefined, `Retired overseas history entry must not include current value: ${entry.id}`);
    } else {
      validateMarketValuePoint(entry.current, entry.id, "overseas_history_current");
    }
    assert(/^\d+$/.test(entry.transfermarkt?.player_id ?? ""), `Invalid Transfermarkt player id on ${entry.id}`);
    for (const field of ["profile_url", "market_value_url", "api_url"]) {
      assert(/^https:\/\//.test(entry.transfermarkt?.[field] ?? ""), `Invalid Transfermarkt ${field} on ${entry.id}`);
    }
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

function hasExpectedNativeScript(country, value, languageTag) {
  const text = String(value ?? "");
  if (country === "China PR") return languageTag === "zh-Hans" && /[\u3400-\u9fff]/u.test(text);
  if (country === "Japan") return languageTag === "ja-Jpan" && /[\u3040-\u30ff\u3400-\u9fff]/u.test(text);
  if (country === "Korea Republic") return languageTag === "ko-Kore" && /[\uac00-\ud7af]/u.test(text);
  if (country === "Uzbekistan") {
    if (languageTag === "uz-Cyrl") return /[\u0400-\u04ff]/u.test(text);
    return languageTag === "uz-Latn" && /[A-Za-zʻʼ‘’]/u.test(text);
  }
  return false;
}

function validateNativeNameAudit(player, override) {
  assert(override && typeof override === "object", `Missing native-name audit on ${player.id}`);
  const verification = override.native_verification;
  assert(verification && typeof verification === "object", `Missing native_verification on ${player.id}`);
  assert(
    allowedNativeVerificationStatuses.has(verification.status),
    `Invalid native verification status on ${player.id}`
  );
  assert(isIsoDate(verification.checked_at), `Invalid native verification date on ${player.id}`);
  assert(Array.isArray(verification.sources), `Invalid native verification sources on ${player.id}`);
  assert(Array.isArray(verification.attempts), `Invalid native verification attempts on ${player.id}`);
  assert(typeof verification.notes === "string" && verification.notes.length > 0, `Missing native verification notes on ${player.id}`);

  if (verification.status === "verified") {
    assert(allowedNativeLanguageTags.has(verification.language_tag), `Invalid native language tag on ${player.id}`);
    assert(
      hasExpectedNativeScript(player.country, override.native, verification.language_tag),
      `Invalid verified native spelling on ${player.id}`
    );
    assert(verification.sources.length > 0, `Verified native name requires a source on ${player.id}`);
    for (const source of verification.sources) validateSourceLayer(source, `${player.id}.native_verification`);
    assert(
      verification.sources.every((source) => (source.fields ?? []).includes("names.native")),
      `Native-name source must declare names.native on ${player.id}`
    );
    assert(
      (player.source_layers ?? []).some((layer) =>
        verification.sources.some((source) => source.url === layer.url && source.claim === layer.claim)
      ),
      `Verified native-name source was not merged on ${player.id}`
    );
    if (player.country === "Japan") assert(override.ja === override.native, `Japanese native/ja mismatch on ${player.id}`);
    if (player.country === "Korea Republic") assert(override.ko === override.native, `Korean native/ko mismatch on ${player.id}`);
  } else {
    assert(override.native === undefined, `Unresolved native name must not set native on ${player.id}`);
    assert(verification.language_tag === null, `Unresolved native language tag must be null on ${player.id}`);
    assert(verification.sources.length === 0, `Unresolved native name must not claim sources on ${player.id}`);
    assert(verification.attempts.length > 0, `Unresolved native name requires audit attempts on ${player.id}`);
    for (const attempt of verification.attempts) {
      assert(attempt.label && /^https?:\/\//.test(attempt.url), `Invalid native audit attempt on ${player.id}`);
      assert(isIsoDate(attempt.checked_at), `Invalid native audit attempt date on ${player.id}`);
    }
    assert(player.names.native === player.names.en, `Unresolved native name must fall back to English on ${player.id}`);
  }
}

function validateBigFiveChecklist(checklist, countryName, featuredRecords) {
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

  const featuredRecordIds = new Set((featuredRecords ?? []).map((record) => record.id));

  for (const entry of checklist.entries) {
    assert(entry.player, `Missing checklist player name on ${countryName}`);
    if (countryName === "China PR") {
      assert(
        typeof entry.featured_record_id === "string" && featuredRecordIds.has(entry.featured_record_id),
        `Missing or unknown checklist featured_record_id on ${countryName}:${entry.player}`
      );
    } else if (entry.featured_record_id !== undefined) {
      assert(
        featuredRecordIds.has(entry.featured_record_id),
        `Unknown checklist featured_record_id on ${countryName}:${entry.player}`
      );
    }
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

function validateChinaYouthDevelopmentCoaches(archive) {
  assert(
    archive.id === "china-youth-development-coaches",
    "Invalid china_youth_development_coaches id"
  );
  assert(
    Number.isInteger(archive.schema_version) && archive.schema_version > 0,
    "Invalid china_youth_development_coaches schema_version"
  );
  assert(
    isIsoDate(archive.last_checked),
    "Invalid china_youth_development_coaches last_checked"
  );
  assert(
    Array.isArray(archive.role_policy?.included) && Array.isArray(archive.role_policy?.excluded),
    "Invalid china_youth_development_coaches role_policy"
  );
  assert(
    Array.isArray(archive.coaches) && archive.coaches.length > 0,
    "Invalid china_youth_development_coaches coaches"
  );
  assert(Array.isArray(archive.watchlist), "Invalid china_youth_development_coaches watchlist");

  const coachIds = new Set();
  for (const coach of archive.coaches) {
    assert(coach.id, "China youth coach must include id");
    assert(!coachIds.has(coach.id), `Duplicate China youth coach id: ${coach.id}`);
    assert(
      coach.name?.zh && coach.name?.en && coach.name?.native,
      `Missing names on China youth coach ${coach.id}`
    );
    assert(coach.nationality, `Missing nationality on China youth coach ${coach.id}`);
    assert(
      coach.organization?.name && coach.organization?.short_name,
      `Missing organization on China youth coach ${coach.id}`
    );
    assert(
      allowedChinaYouthCoachOrganizationTypes.has(coach.organization.type),
      `Invalid organization type "${coach.organization.type}" on China youth coach ${coach.id}`
    );
    assert(coach.role, `Missing role on China youth coach ${coach.id}`);
    assert(
      Array.isArray(coach.age_bands) && coach.age_bands.length > 0,
      `Invalid age_bands on China youth coach ${coach.id}`
    );
    assert(
      ["year", "snapshot"].includes(coach.period?.precision),
      `Invalid period precision on China youth coach ${coach.id}`
    );
    assert(
      allowedChinaYouthCoachPeriodStatuses.has(coach.period?.status),
      `Invalid period status on China youth coach ${coach.id}`
    );
    assert(
      coach.period.start === null || /^\d{4}$/.test(coach.period.start),
      `Invalid period start on China youth coach ${coach.id}`
    );
    assert(
      coach.period.end === null || /^\d{4}$/.test(coach.period.end),
      `Invalid period end on China youth coach ${coach.id}`
    );
    assert(coach.profile_summary, `Missing profile_summary on China youth coach ${coach.id}`);
    assert(
      Array.isArray(coach.methodology_tags) && coach.methodology_tags.length > 0,
      `Invalid methodology_tags on China youth coach ${coach.id}`
    );
    assert(
      Array.isArray(coach.source_links) && coach.source_links.length > 0,
      `Missing source_links on China youth coach ${coach.id}`
    );

    for (const link of coach.source_links) {
      assert(
        allowedChinaYouthCoachSourceTypes.has(link.type),
        `Invalid source type "${link.type}" on China youth coach ${coach.id}`
      );
      assert(link.label && link.claim, `Incomplete source on China youth coach ${coach.id}`);
      assert(/^https?:\/\//.test(link.url), `Invalid source url on China youth coach ${coach.id}`);
      assert(
        isIsoDate(link.checked_at),
        `Invalid source checked_at on China youth coach ${coach.id}`
      );
    }

    assert(
      allowedVerificationStatuses.has(coach.verification?.status),
      `Invalid verification status on China youth coach ${coach.id}`
    );
    assert(
      isIsoDate(coach.verification?.last_checked),
      `Invalid verification date on China youth coach ${coach.id}`
    );
    assert(coach.verification.notes, `Missing verification notes on China youth coach ${coach.id}`);
    coachIds.add(coach.id);
  }
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

function validateHistoricalChinaYouthPlayerStats(tournament) {
  const label = tournament.id;
  const minuteStatus = tournament.minute_status;
  assert(
    ["complete", "partial"].includes(minuteStatus?.status),
    `Invalid historical China youth minute_status on ${label}`
  );
  assert(
    Array.isArray(minuteStatus.available_fields) && Array.isArray(minuteStatus.missing_fields),
    `Missing historical China youth coverage fields on ${label}`
  );
  assert(
    typeof minuteStatus.source_scope === "string" && minuteStatus.source_scope.length > 0,
    `Missing historical China youth source_scope on ${label}`
  );
  assert(
    typeof minuteStatus.note === "string" && minuteStatus.note.length > 0,
    `Missing historical China youth minute note on ${label}`
  );

  const available = new Set(minuteStatus.available_fields);
  const missing = new Set(minuteStatus.missing_fields);
  for (const field of historicalYouthPlayerStatFields) {
    assert(
      available.has(field) !== missing.has(field),
      `Historical China youth field must be exactly available or missing on ${label}:${field}`
    );
  }
  if (minuteStatus.status === "complete") {
    assert(missing.size === 0, `Complete historical China youth stats still have missing fields on ${label}`);
  } else {
    assert(missing.size > 0, `Partial historical China youth stats must list missing fields on ${label}`);
  }

  assert(Array.isArray(tournament.china_squad) && tournament.china_squad.length > 0, `Missing China squad on ${label}`);
  for (const player of tournament.china_squad) {
    for (const field of historicalYouthPlayerStatFields) {
      assert(Object.hasOwn(player, field), `Missing ${field} on ${label}:${player.player}`);
      if (available.has(field)) {
        assert(
          Number.isInteger(player[field]) && player[field] >= 0,
          `Invalid available ${field} on ${label}:${player.player}`
        );
      } else {
        assert(player[field] === null, `Unavailable ${field} must be null on ${label}:${player.player}`);
      }
    }
    if (available.has("appearances") && available.has("starts")) {
      assert(player.starts <= player.appearances, `Starts exceed appearances on ${label}:${player.player}`);
    }
    if (available.has("appearances") && available.has("substitute_appearances")) {
      assert(
        player.substitute_appearances <= player.appearances,
        `Substitute appearances exceed appearances on ${label}:${player.player}`
      );
    }
    if (
      available.has("appearances") &&
      available.has("starts") &&
      available.has("substitute_appearances")
    ) {
      assert(
        player.starts + player.substitute_appearances === player.appearances,
        `Starts and substitute appearances do not match appearances on ${label}:${player.player}`
      );
      assert(
        player.appearances <= (tournament.china_matches?.length ?? 0),
        `Appearances exceed China match count on ${label}:${player.player}`
      );
    }
  }

  assert(
    tournament.china_squad.reduce((sum, player) => sum + player.goals, 0) ===
      tournament.china_goal_summary?.goals_for,
    `China squad goals do not match goals_for on ${label}`
  );
}

function validateUefaYouthLeague(topic, playerIds) {
  assert(typeof topic === "object" && topic !== null, "Missing UEFA Youth League dataset");
  assert(isIsoDate(topic.meta?.checked_at), "Invalid UEFA Youth League checked_at");
  assert(Array.isArray(topic.seasons) && topic.seasons.length === 3, "UEFA Youth League must include three seasons");
  assert(
    Array.isArray(topic.historical_season_index) && topic.historical_season_index.length === 10,
    "UEFA Youth League historical index must include 2013/14 through 2022/23"
  );
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

  assert(topic.lineage?.coverage_start_year === 2010, "UEFA Youth League lineage must start in 2010");
  assert(topic.lineage?.coverage_end_season === "2022/23", "UEFA Youth League lineage must end at 2022/23");
  assert(topic.lineage?.first_official_season === "2013/14", "UEFA Youth League first official season must be 2013/14");
  assert(topic.lineage?.boundary_note?.zh && topic.lineage?.boundary_note?.en, "Missing UEFA Youth League lineage boundary note");
  const expectedPrehistory = [
    ["2010-under-18-challenge", "precursor-event"],
    ["2010-11", "not-established"],
    ["2011-12", "not-established"],
    ["2012-13", "not-established"],
    ["2012-launch-approval", "launch-approved"]
  ];
  assert(
    JSON.stringify((topic.lineage?.prehistory ?? []).map((entry) => [entry.id, entry.status])) ===
      JSON.stringify(expectedPrehistory),
    "UEFA Youth League prehistory must distinguish the precursor, non-seasons and launch approval"
  );
  for (const entry of topic.lineage.prehistory) {
    const label = `lineage:${entry.id}`;
    assert(entry.summary?.zh && entry.summary?.en, `Missing summary on ${label}`);
    if (entry.status === "not-established") {
      assert(entry.champion === null && entry.runner_up === null, `Non-season must not have finalists on ${label}`);
      assert(!("entrant_count" in entry) && !("matches" in entry), `Non-season must not contain competition records on ${label}`);
    } else if (entry.date_precision === "month") {
      assert(/^\d{4}-\d{2}$/.test(entry.date), `Invalid month-precision date on ${label}`);
    } else {
      assert(entry.date_precision === "day" && isIsoDate(entry.date), `Invalid day-precision date on ${label}`);
    }
    validateSourceIds(entry, label);
  }

  validateSourceIds(topic.qualification, "qualification");
  for (const path of topic.qualification.paths ?? []) {
    validateSourceIds(path, `qualification:${path.id}`);
  }
  for (const rule of topic.player_eligibility?.rules ?? []) {
    validateSourceIds(rule, `player_eligibility:${rule.id}`);
  }

  const expectedHistoricalSeasonIds = [
    "2013-14", "2014-15", "2015-16", "2016-17", "2017-18",
    "2018-19", "2019-20", "2020-21", "2021-22", "2022-23"
  ];
  assert(
    JSON.stringify(topic.historical_season_index.map((season) => season.id)) ===
      JSON.stringify(expectedHistoricalSeasonIds),
    "UEFA Youth League historical seasons must be complete and chronological"
  );
  assert(
    topic.historical_season_index[0]?.label === topic.lineage.first_official_season,
    "UEFA Youth League historical index must begin with the first official season"
  );
  for (const season of topic.historical_season_index) {
    const label = `historical_season:${season.id}`;
    assert(season.competition_id === "uefa-youth-league", `Invalid competition_id on ${label}`);
    assert(season.competition_name === "UEFA Youth League", `Invalid competition_name on ${label}`);
    assert(season.organizer === "UEFA" && season.age_category === "Under-19", `Invalid scope on ${label}`);
    assert(
      ["completed", "completed-delayed", "cancelled"].includes(season.status),
      `Invalid status on ${label}`
    );
    assert(Number.isInteger(season.entrant_count) && season.entrant_count > 0, `Invalid entrant_count on ${label}`);
    assert(Array.isArray(season.paths) && season.paths.length > 0, `Missing qualification paths on ${label}`);
    assert(season.format_summary?.zh && season.format_summary?.en, `Missing format summary on ${label}`);
    assert(typeof season.source_version === "string" && season.source_version.length > 0, `Missing source_version on ${label}`);
    assert(isIsoDate(season.source_checked_at), `Invalid source_checked_at on ${label}`);
    assert(
      typeof season.source_conflict_note === "string" && season.source_conflict_note.length > 0,
      `Missing source_conflict_note on ${label}`
    );
    assert(season.coverage?.participating_teams, `Missing participating-team coverage on ${label}`);
    assert(season.coverage?.knockout_matches && season.coverage?.all_matches, `Missing match coverage on ${label}`);
    if (season.status === "cancelled") {
      assert(season.id === "2020-21", `Unexpected cancelled UEFA Youth League season: ${season.id}`);
      assert(season.start_date === null && season.end_date === null, `Cancelled season must not invent dates on ${label}`);
      assert(season.champion === null && season.runner_up === null && season.final === null, `Cancelled season must not have a winner on ${label}`);
      assert(season.semi_finalists.length === 0 && season.top_scorers.length === 0, `Cancelled season must not have final-stage records on ${label}`);
      assert(season.coverage.all_matches === "not-played", `Cancelled season match status must be not-played on ${label}`);
      assert(!season.teams_by_path, `Cancelled season must not expose actual participating teams on ${label}`);
      assert(
        season.coverage.participating_teams === "draw-published-not-played",
        `Cancelled season must distinguish published draw teams on ${label}`
      );
      const drawPaths = season.published_draw_teams_by_path ?? {};
      assert(
        JSON.stringify(Object.keys(drawPaths).sort()) ===
          JSON.stringify(["champions_league", "domestic_champions"]),
        `Cancelled season must preserve both published draw paths on ${label}`
      );
      const drawTeams = Object.values(drawPaths).flat();
      assert(drawTeams.length === season.entrant_count, `Published draw team count does not match entrant_count on ${label}`);
      assert(new Set(drawTeams).size === drawTeams.length, `Duplicate published draw team on ${label}`);
      assert(
        Object.values(drawPaths).every((teams) => teams.length === 32),
        `Cancelled season must have 32 published draw teams per path on ${label}`
      );
    } else {
      assert(isIsoDate(season.start_date) && isIsoDate(season.end_date), `Invalid season dates on ${label}`);
      assert(season.champion && season.runner_up, `Missing finalists on ${label}`);
      assert(Array.isArray(season.semi_finalists) && season.semi_finalists.length === 2, `Invalid semi-finalists on ${label}`);
      assert(Array.isArray(season.top_scorers) && season.top_scorers.length > 0, `Missing top scorers on ${label}`);
      for (const scorer of season.top_scorers) {
        assert(scorer.name && scorer.club, `Incomplete top scorer on ${label}`);
        assert(Number.isInteger(scorer.goals) && scorer.goals > 0, `Invalid top-scorer goals on ${label}`);
      }
      assert(isIsoDate(season.final?.date), `Invalid final date on ${label}`);
      assert(season.final.home && season.final.away && season.final.score, `Incomplete final on ${label}`);
      assert(season.final.venue && season.final.city && season.final.country, `Missing final venue on ${label}`);
      assert(season.coverage.participating_teams === "complete", `Historical entrant coverage must be complete on ${label}`);
      const expectedTeamPathKeys = season.paths.map((path) => ({
        "uefa-champions-league-path": "champions_league",
        "domestic-champions-path": "domestic_champions"
      })[path]);
      assert(expectedTeamPathKeys.every(Boolean), `Unknown historical qualification path on ${label}`);
      assert(
        JSON.stringify(Object.keys(season.teams_by_path ?? {}).sort()) ===
          JSON.stringify(expectedTeamPathKeys.sort()),
        `Historical team paths do not match declared paths on ${label}`
      );
      const historicalTeams = Object.values(season.teams_by_path).flat();
      assert(historicalTeams.length === season.entrant_count, `Historical team count does not match entrant_count on ${label}`);
      assert(new Set(historicalTeams).size === historicalTeams.length, `Duplicate historical team across paths on ${label}`);
      assert(
        season.teams_by_path.champions_league.length === 32,
        `Historical Champions League path must contain 32 teams on ${label}`
      );
      if (season.id >= "2015-16") {
        assert(
          season.teams_by_path.domestic_champions.length === 32,
          `Historical domestic champions path must contain 32 teams on ${label}`
        );
      }
    }
    validateSourceIds(season, label);
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

function validateScoutingWatchlist(watchlist, players) {
  assert(watchlist?.schema_version === 1, "Invalid scouting watchlist schema_version");
  assert(watchlist.source?.name === "Football Talent Scout", "Invalid scouting watchlist source");
  assert(watchlist.source?.source_tier === "S2", "Football Talent Scout must remain an S2 source");
  assert(isIsoDate(watchlist.source?.checked_at), "Invalid scouting watchlist source checked_at");
  assert(
    watchlist.source?.url === "https://footballtalentscout.net/" &&
      watchlist.source?.terms_url?.startsWith("https://footballtalentscout.net/"),
    "Scouting watchlist source links must use the official FTS site"
  );
  assert(
    typeof watchlist.source?.caveat?.zh === "string" &&
      typeof watchlist.source?.caveat?.en === "string",
    "Scouting watchlist requires a bilingual source caveat"
  );

  const records = watchlist.records ?? [];
  const recordIds = new Set();
  const countries = new Set();
  const playerMap = new Map(players.map((player) => [player.id, player]));
  const allowedReportTypes = new Set(["image-report", "talent-of-the-day", "player-profile", "guest-report"]);
  const allowedSourceScopes = new Set(["individual", "country-index", "category-index"]);
  const forbiddenFactFields = ["registration_club", "national_team", "market_value", "verification"];

  for (const record of records) {
    assert(!recordIds.has(record.id), `Duplicate scouting watchlist id: ${record.id}`);
    recordIds.add(record.id);
    countries.add(record.country);
    assert(typeof record.name === "string" && record.name.length > 0, `Missing scouting name on ${record.id}`);
    assert(Number.isInteger(record.birth_year) && record.birth_year >= 2000 && record.birth_year <= 2010, `Invalid scouting birth_year on ${record.id}`);
    assert(allowedReportTypes.has(record.report_type), `Invalid scouting report_type on ${record.id}`);
    assert(allowedSourceScopes.has(record.source_scope), `Invalid scouting source_scope on ${record.id}`);
    assert(
      record.potential_rating === null ||
        (typeof record.potential_rating === "number" &&
          record.potential_rating >= 1 &&
          record.potential_rating <= 10 &&
          Number.isInteger(record.potential_rating * 2)),
      `Invalid scouting potential_rating on ${record.id}`
    );
    assert(
      typeof record.summary?.zh === "string" && typeof record.summary?.en === "string",
      `Missing bilingual scouting summary on ${record.id}`
    );
    assert(record.source_url?.startsWith("https://footballtalentscout.net/"), `Invalid scouting source_url on ${record.id}`);
    assert(isIsoDate(record.source_checked_at), `Invalid scouting source_checked_at on ${record.id}`);
    for (const field of forbiddenFactFields) {
      assert(record[field] === undefined, `Scouting watchlist must not override ${field} on ${record.id}`);
    }
    if (record.player_id) {
      const player = playerMap.get(record.player_id);
      assert(player, `Unknown scouting player_id on ${record.id}: ${record.player_id}`);
      assert(player.country === record.country, `Scouting country mismatch on ${record.id}`);
      assert(Number(player.birth_date.slice(0, 4)) === record.birth_year, `Scouting birth year mismatch on ${record.id}`);
      const knownNames = [player.name, player.local_name, ...Object.values(player.names ?? {})]
        .map(normalizeIdentityName);
      assert(knownNames.includes(normalizeIdentityName(record.name)), `Scouting name mismatch on ${record.id}`);
    }
  }

  assert(records.length === 30, `Expected 30 scouting watchlist records, found ${records.length}`);
  assert(countries.size === 8, `Expected 8 scouting watchlist countries, found ${countries.size}`);
  assert(watchlist.scope?.record_count === records.length, "Scouting watchlist record_count mismatch");
  assert(watchlist.scope?.country_count === countries.size, "Scouting watchlist country_count mismatch");

  const collectionIds = new Set();
  for (const collection of watchlist.related_collections ?? []) {
    assert(!collectionIds.has(collection.id), `Duplicate scouting collection id: ${collection.id}`);
    collectionIds.add(collection.id);
    assert(typeof collection.name?.zh === "string" && typeof collection.name?.en === "string", `Missing scouting collection name on ${collection.id}`);
    assert(collection.url?.startsWith("https://footballtalentscout.net/"), `Invalid scouting collection URL on ${collection.id}`);
  }
  assert(collectionIds.size === 6, `Expected 6 scouting collections, found ${collectionIds.size}`);
}

export async function validateData() {
  const dataset = await loadDataset();
  const playerNameOverrides = JSON.parse(
    await fs.readFile(path.join(paths.raw, "player-name-overrides.json"), "utf8")
  );
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
  const completeSquads = new Map(
    [...completeSquadExpectations.keys()].map((squadKey) => [squadKey, []])
  );
  const allSquadEntries = new Map();
  const issue54UzbekistanU17 = [];
  let nativeNameAuditCount = 0;

  for (const player of dataset.players) {
    for (const field of requiredPlayerFields) {
      assert(player[field] !== undefined, `Missing player field "${field}" on ${player.id}`);
    }

    assert(!playerIds.has(player.id), `Duplicate player id: ${player.id}`);
    assert(isIsoDate(player.birth_date), `Invalid birth_date for ${player.id}`);
    validatePlayerNames(player);
    if (nativeNameAuditCountries.has(player.country)) {
      nativeNameAuditCount += 1;
      validateNativeNameAudit(player, playerNameOverrides[player.id]);
      assert(
        allowedOrganizationTypes.has(player.registration_club?.organization_type),
        `Missing audited registration organization_type on ${player.id}`
      );
      const currentPathway = player.training_pathway.find(
        (step) => step.organization === player.registration_club.name
      );
      if (currentPathway) {
        assert(
          currentPathway.organization_type === player.registration_club.organization_type,
          `Audited pathway organization type differs from registration on ${player.id}`
        );
      }
    }
    assert(
      typeof player.registration_club?.name === "string" &&
        typeof player.registration_club?.country === "string",
      `Invalid registration_club for ${player.id}`
    );
    const registrationStatus = player.registration_club.status ?? "current";
    assert(
      allowedRegistrationClubStatuses.has(registrationStatus),
      `Invalid registration_club status on ${player.id}`
    );
    if (player.registration_club.as_of !== undefined) {
      assert(isIsoDate(player.registration_club.as_of), `Invalid registration_club as_of on ${player.id}`);
    }
    if (registrationStatus === "tournament-snapshot") {
      assert(
        isIsoDate(player.registration_club.as_of),
        `Tournament registration snapshot requires as_of on ${player.id}`
      );
    }
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
      if (entry.roster_status !== undefined) {
        assert(
          allowedPlayerRosterStatuses.has(entry.roster_status),
          `Invalid roster_status "${entry.roster_status}" on player ${player.id}`
        );
      }
      if (chinaDomestic2026CompetitionIds.has(entry.competition_id)) {
        assert(entry.season === "2026", `Invalid season on ${entry.competition_id} for ${player.id}`);
        assert(
          allowedChinaDomesticCompetitionLevels.has(entry.competition_level),
          `Invalid competition_level on ${entry.competition_id} for ${player.id}`
        );
        assert(
          allowedParticipationStatisticsStatuses.has(entry.statistics_status),
          `Invalid statistics_status on ${entry.competition_id} for ${player.id}`
        );
        for (const field of ["appearances", "starts", "substitute_appearances", "goals", "minutes"]) {
          assert(field in entry, `Missing ${field} on ${entry.competition_id} for ${player.id}`);
          assert(
            entry[field] === null || (Number.isInteger(entry[field]) && entry[field] >= 0),
            `Invalid ${field} on ${entry.competition_id} for ${player.id}`
          );
        }
        if (
          entry.appearances !== null &&
          entry.starts !== null &&
          entry.substitute_appearances !== null
        ) {
          assert(
            entry.starts + entry.substitute_appearances === entry.appearances,
            `Starts and substitute appearances do not add up on ${entry.competition_id} for ${player.id}`
          );
        }
        assert(/^2026-\d{2}-\d{2}$/.test(entry.stats_as_of), `Invalid stats_as_of on ${entry.competition_id} for ${player.id}`);
        assert(
          /^2026-\d{2}-\d{2}$/.test(entry.source_checked_at),
          `Invalid source_checked_at on ${entry.competition_id} for ${player.id}`
        );
        assert(
          Array.isArray(entry.statistics_sources) && entry.statistics_sources.length > 0,
          `Missing statistics_sources on ${entry.competition_id} for ${player.id}`
        );
        for (const url of entry.statistics_sources) {
          assert(/^https?:\/\//.test(url), `Invalid statistics source on ${entry.competition_id} for ${player.id}`);
        }
      }
      const issue16Squad = issue16Squads.get(`${player.country}|${entry.competition_id}`);
      if (issue16Squad !== undefined) {
        issue16Squad.push(player);
      }
      const completeSquad = completeSquads.get(`${player.country}|${entry.competition_id}`);
      if (
        completeSquad !== undefined &&
        entry.squad_status === "registered" &&
        entry.roster_status === "final-squad"
      ) {
        completeSquad.push({ player, entry });
      }
      const squadKey = `${player.country}|${entry.competition_id}`;
      const squadEntries = allSquadEntries.get(squadKey) ?? [];
      squadEntries.push({ player, entry });
      allSquadEntries.set(squadKey, squadEntries);
    }
    if (
      player.country === "Uzbekistan" &&
      player.tournament_participation.some(
        (entry) => entry.competition_id === "afc-u17-2026" && entry.squad_status === "registered"
      )
    ) {
      issue54UzbekistanU17.push(player);
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
    validateChinaOverseasStatus(player);

    playerIds.add(player.id);
  }

  assert(nativeNameAuditCount === 263, `Expected 263 audited CJK/Uzbek players, found ${nativeNameAuditCount}`);

  const chinaOverseasStatusCounts = countOverseasStatuses(dataset.players);
  const chinaForeignRegistrationCount = dataset.players.filter(
    (player) => normalizeCountry(player.country) === "china" && hasForeignRegistration(player)
  ).length;
  assert(
    chinaOverseasStatusCounts["active-registered"] === chinaForeignRegistrationCount,
    `China active-registered count ${chinaOverseasStatusCounts["active-registered"]} does not match foreign registrations ${chinaForeignRegistrationCount}`
  );

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

  assert(
    issue54UzbekistanU17.length === 23,
    `Expected 23 Uzbekistan AFC U17 2026 players, found ${issue54UzbekistanU17.length}`
  );
  const issue54JerseyNumbers = issue54UzbekistanU17
    .map((player) =>
      player.tournament_participation.find((entry) => entry.competition_id === "afc-u17-2026")
        ?.shirt_number
    )
    .sort((left, right) => left - right);
  assert(
    issue54JerseyNumbers.every((number, index) => number === index + 1),
    `Invalid Uzbekistan AFC U17 2026 jersey sequence: ${issue54JerseyNumbers.join(", ")}`
  );
  for (const player of issue54UzbekistanU17) {
    assert(
      player.external_links.some(
        (link) => link.type === "official" && link.url.includes("AFC-U17-Asian-Cup-Saudi-Arabia-2026")
      ),
      `Missing AFC final-squad source on ${player.id}`
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

  for (const [squadKey, expectedCount] of completeSquadExpectations) {
    const squad = completeSquads.get(squadKey);
    const actualCount = squad.length;
    assert(actualCount === expectedCount, `Expected ${expectedCount} players in ${squadKey}, found ${actualCount}`);
    assert(
      new Set(squad.map(({ player }) => player.id)).size === expectedCount,
      `Expected ${expectedCount} distinct players in ${squadKey}`
    );
    const numbers = [];
    for (const { player, entry } of squad) {
      assert(entry.squad_status === "registered", `Invalid final registration status on ${player.id} in ${squadKey}`);
      assert(entry.roster_status === "final-squad", `Invalid final roster status on ${player.id} in ${squadKey}`);
      assert(
        Number.isInteger(entry.shirt_number) && entry.shirt_number >= 1 && entry.shirt_number <= 23,
        `Invalid shirt_number on ${player.id} in ${squadKey}`
      );
      numbers.push(entry.shirt_number);
      assert(
        player.registration_club.status === "tournament-snapshot" && isIsoDate(player.registration_club.as_of),
        `Missing tournament registration snapshot on ${player.id}`
      );
      if (player.country !== "Australia" && !/free agent/i.test(player.registration_club.name)) {
        assert(
          allowedOrganizationTypes.has(player.registration_club.organization_type),
          `Missing comparison organization_type on ${player.id}`
        );
      }
      const afcLayers = (player.source_layers ?? []).filter(
        (layer) => layer.type === "afc-registration" && layer.confidence === "high"
      );
      assert(afcLayers.length > 0, `Missing high-confidence AFC registration layer on ${player.id}`);
      assert(
        afcLayers.some((layer) => isIsoDate(layer.checked_at)),
        `Missing AFC registration checked_at on ${player.id}`
      );
    }
    numbers.sort((left, right) => left - right);
    const expectedNumbers =
      squadKey === "IR Iran|afc-u23-2026"
        ? [1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 22, 23]
        : Array.from({ length: 23 }, (_, index) => index + 1);
    assert(
      numbers.every((number, index) => number === expectedNumbers[index]),
      `Invalid final-squad shirt-number sequence in ${squadKey}: ${numbers.join(", ")}`
    );
  }
  for (const squadKey of notApplicableSquadExpectations) {
    const finalSquadEntries = (allSquadEntries.get(squadKey) ?? []).filter(
      ({ entry }) => entry.roster_status === "final-squad"
    );
    assert(finalSquadEntries.length === 0, `Not-applicable comparison roster has players: ${squadKey}`);
  }
  const issue47Squad = completeSquads.get("Australia|afc-u20-2025");
  const issue47ShirtNumbers = new Set();
  for (const { player, entry } of issue47Squad) {
    assert(player.age_band === "u20", `Invalid Australia U20 age_band on ${player.id}`);
    assert(entry.roster_status === "final-squad", `Invalid Australia U20 roster_status on ${player.id}`);
    assert(
      Number.isInteger(entry.shirt_number) && entry.shirt_number >= 1 && entry.shirt_number <= 23,
      `Invalid Australia U20 shirt_number on ${player.id}`
    );
    assert(!issue47ShirtNumbers.has(entry.shirt_number), `Duplicate Australia U20 shirt_number ${entry.shirt_number}`);
    issue47ShirtNumbers.add(entry.shirt_number);
    assert(
      player.registration_club.status === "tournament-snapshot" &&
        isIsoDate(player.registration_club.as_of),
      `Missing Australia U20 registration snapshot on ${player.id}`
    );
    const afcLayers = (player.source_layers ?? []).filter((layer) => layer.type === "afc-registration");
    assert(afcLayers.length === 1, `Expected one AFC registration source on ${player.id}`);
    assert(afcLayers[0].confidence === "high", `AFC registration source must be high confidence on ${player.id}`);
  }
  for (const playerId of issue47DeepSampleIds) {
    const squadEntry = issue47Squad.find(({ player }) => player.id === playerId);
    assert(squadEntry !== undefined, `Missing issue #47 deep sample ${playerId}`);
    const independentOfficialLayers = squadEntry.player.source_layers.filter(
      (layer) => layer.type === "national-fa-profile" && /final report/i.test(layer.label)
    );
    assert(independentOfficialLayers.length > 0, `Missing issue #47 deep-sample match source on ${playerId}`);
  }

  const issue48Squad = completeSquads.get("Australia|afc-u17-2026");
  const issue48ShirtNumbers = new Set();
  for (const { player, entry } of issue48Squad) {
    assert(player.age_band === "u17", `Invalid Australia U17 age_band on ${player.id}`);
    assert(entry.roster_status === "final-squad", `Invalid Australia U17 roster_status on ${player.id}`);
    assert(
      Number.isInteger(entry.shirt_number) && entry.shirt_number >= 1 && entry.shirt_number <= 23,
      `Invalid Australia U17 shirt_number on ${player.id}`
    );
    assert(!issue48ShirtNumbers.has(entry.shirt_number), `Duplicate Australia U17 shirt_number ${entry.shirt_number}`);
    issue48ShirtNumbers.add(entry.shirt_number);
    assert(
      player.registration_club.status === "tournament-snapshot" &&
        isIsoDate(player.registration_club.as_of),
      `Missing Australia U17 registration snapshot on ${player.id}`
    );
    const afcLayers = (player.source_layers ?? []).filter((layer) => layer.type === "afc-registration");
    assert(afcLayers.length === 1, `Expected one AFC registration source on ${player.id}`);
    assert(afcLayers[0].confidence === "high", `AFC registration source must be high confidence on ${player.id}`);
  }
  for (const playerId of issue48DeepSampleIds) {
    const squadEntry = issue48Squad.find(({ player }) => player.id === playerId);
    assert(squadEntry !== undefined, `Missing issue #48 deep sample ${playerId}`);
    const afcUrls = new Set(
      squadEntry.player.source_layers
        .filter((layer) => layer.type === "afc-registration")
        .map((layer) => layer.url)
    );
    const independentOfficialLayers = squadEntry.player.source_layers.filter(
      (layer) => layer.type !== "afc-registration" && !afcUrls.has(layer.url)
    );
    assert(independentOfficialLayers.length > 0, `Missing issue #48 independent official source on ${playerId}`);
  }
  const henriqueOliveira = issue48Squad.find(
    ({ player }) => player.id === "au-henrique-oliveira-2009"
  )?.player;
  assert(
    /forward.*midfielder/i.test(henriqueOliveira?.verification?.notes ?? ""),
    "Australia U17 Henrique Oliveira position conflict must remain explicit"
  );

  for (const tournament of dataset.tournaments) {
    assert(isIsoDate(tournament.last_checked), `Invalid tournament last_checked: ${tournament.id}`);
    validateTournamentDateRange(tournament, "focus tournament");
  }

  for (const country of dataset.overseasHistory.countries) {
    assert(Array.isArray(country.bucket_focus), `Invalid overseas bucket list for ${country.country}`);
    const trialRecordIds = new Set();
    for (const record of country.historical_trial_records ?? []) {
      assert(record.id && !trialRecordIds.has(record.id), `Duplicate historical trial record on ${country.country}: ${record.id}`);
      trialRecordIds.add(record.id);
      assert(record.name && record.local_name && record.position, `Missing historical trial identity on ${record.id}`);
      assert(record.club && record.country && record.period, `Missing historical trial destination on ${record.id}`);
      assert(["trial", "training-trial"].includes(record.event_type), `Invalid historical trial event_type on ${record.id}`);
      assert(record.status === "historical-trial-only", `Invalid historical trial status on ${record.id}`);
      assert(record.signed === false && record.registration_changed === false, `Historical trial must not imply signing or registration on ${record.id}`);
      assert(typeof record.summary === "string" && record.summary.length > 0, `Missing historical trial summary on ${record.id}`);
      assert(Array.isArray(record.source_links) && record.source_links.length > 0, `Missing historical trial sources on ${record.id}`);
      for (const source of record.source_links) {
        assert(source.label && /^https?:\/\//.test(source.url), `Invalid historical trial source on ${record.id}`);
      }
    }
    if (country.big_five_appearance_checklist !== undefined) {
      validateBigFiveChecklist(
        country.big_five_appearance_checklist,
        country.country,
        country.featured_records
      );
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
  validateOverseasMarketValuePeakRanking(
    dataset.overseasHistory.market_value_peak_ranking,
    dataset.overseasHistory
  );

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

  const comparisonRosterMetadata = new Map();
  for (const tournament of dataset.tournamentArchive) {
    assert(tournament.id && tournament.competition_name, "Archive tournament must include id and competition_name");
    validateTournamentDateRange(tournament);
    if (historicalChinaYouthStatTournamentIds.has(tournament.id)) {
      validateHistoricalChinaYouthPlayerStats(tournament);
    }
    assert(Array.isArray(tournament.source_links), `Invalid source_links on ${tournament.id}`);
    assert(Array.isArray(tournament.china_matches), `Invalid china_matches on ${tournament.id}`);
    assert(Array.isArray(tournament.china_key_players), `Invalid china_key_players on ${tournament.id}`);
    if (tournament.china_squad !== undefined) {
      assert(Array.isArray(tournament.china_squad), `Invalid china_squad on ${tournament.id}`);
    }
    if (tournament.regional_history !== undefined) {
      validateRegionalHistory(tournament.regional_history, tournament.id);
    }
    if (tournament.comparison_rosters !== undefined) {
      assert(Array.isArray(tournament.comparison_rosters), `Invalid comparison_rosters on ${tournament.id}`);
      for (const roster of tournament.comparison_rosters) {
        const squadKey = `${roster.country}|${tournament.id}`;
        assert(!comparisonRosterMetadata.has(squadKey), `Duplicate comparison_rosters entry: ${squadKey}`);
        assert(
          allowedComparisonRosterStatuses.has(roster.status),
          `Invalid comparison roster status on ${squadKey}`
        );
        assert(Number.isInteger(roster.expected_count), `Invalid expected_count on ${squadKey}`);
        assert(/^https?:\/\//.test(roster.source_url), `Invalid comparison source_url on ${squadKey}`);
        assert(isIsoDate(roster.source_checked_at), `Invalid comparison source_checked_at on ${squadKey}`);
        assert(typeof roster.note === "string" && roster.note.length > 0, `Missing comparison note on ${squadKey}`);
        if (roster.status === "complete-final-registration") {
          assert(roster.expected_count === 23, `Complete comparison roster must expect 23 players: ${squadKey}`);
          assert(completeSquadExpectations.has(squadKey), `Unexpected complete comparison roster: ${squadKey}`);
        } else {
          assert(roster.expected_count === 0, `Not-applicable roster must expect zero players: ${squadKey}`);
          assert(notApplicableSquadExpectations.has(squadKey), `Unexpected not-applicable roster: ${squadKey}`);
        }
        comparisonRosterMetadata.set(squadKey, roster);
      }
    }
    validateTournamentArchiveVersioning(tournament);
    validateTournamentField(tournament);
    if (tournament.id === "afc-u20-2025") {
      validateChinaU20PlayerStatistics(tournament, dataset.players);
    }
    if (tournament.id === "afc-u23-2026") {
      validateChinaU23PlayerStatistics(tournament, dataset.players);
    }
    if (tournament.id === "afc-u17-2026") {
      validateChinaU17RosterAudit(tournament);
    }
  }
  assert(
    [...completeSquadExpectations.keys()].every((key) => comparisonRosterMetadata.has(key)),
    "comparison_rosters metadata does not cover all 13 complete final-registration squads"
  );
  assert(
    [...notApplicableSquadExpectations].every((key) => comparisonRosterMetadata.has(key)),
    "comparison_rosters metadata does not cover both not-applicable Iran squads"
  );
  assert(comparisonRosterMetadata.size === 15, `Expected 15 comparison roster metadata entries, found ${comparisonRosterMetadata.size}`);
  validateU20ArchiveCoverage(dataset.tournamentArchive);
  validateScoutingWatchlist(dataset.scoutingWatchlist, dataset.players);

  if (dataset.chinaMenYouthCoaches !== null) {
    validateChinaMenYouthCoaches(dataset.chinaMenYouthCoaches);
  }

  if (dataset.chinaYouthDevelopmentCoaches !== null) {
    validateChinaYouthDevelopmentCoaches(dataset.chinaYouthDevelopmentCoaches);
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
