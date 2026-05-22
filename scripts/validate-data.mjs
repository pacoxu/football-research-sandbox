import { loadDataset } from "./lib/data-loader.mjs";

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

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function isIsoDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
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

export async function validateData() {
  const dataset = await loadDataset();
  const playerIds = new Set();
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
    assert(player.external_links.length > 0, `Empty external_links for ${player.id}`);
    assert(
      player.external_links.every((link) => /^https?:\/\//.test(link.url)),
      `Invalid link url for ${player.id}`
    );
    assert(
      player.tournament_participation.every((entry) => tournamentIds.has(entry.competition_id)),
      `Unknown competition_id on player ${player.id}`
    );
    assert(
      player.verification?.status && player.verification?.last_checked,
      `Invalid verification block for ${player.id}`
    );
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
  }

  return dataset;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const dataset = await validateData();
  console.log(
    `Validated ${dataset.players.length} players, ${dataset.tournaments.length} tournaments, ${dataset.projects.length} projects.`
  );
}
