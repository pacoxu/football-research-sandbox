import { loadDataset } from "./lib/data-loader.mjs";

const requiredPlayerFields = [
  "id",
  "name",
  "local_name",
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

function validateOverseasRecord(record, countryName) {
  const requiredFields = [
    "id",
    "name",
    "local_name",
    "bucket",
    "league",
    "club",
    "season",
    "status",
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
}

export async function validateData() {
  const dataset = await loadDataset();
  const playerIds = new Set();
  const tournamentIds = new Set(dataset.tournaments.map((item) => item.id));

  for (const player of dataset.players) {
    for (const field of requiredPlayerFields) {
      assert(player[field] !== undefined, `Missing player field "${field}" on ${player.id}`);
    }

    assert(!playerIds.has(player.id), `Duplicate player id: ${player.id}`);
    assert(isIsoDate(player.birth_date), `Invalid birth_date for ${player.id}`);
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
    if (country.featured_records !== undefined) {
      assert(
        Array.isArray(country.featured_records),
        `Invalid featured_records list for ${country.country}`
      );
      country.featured_records.forEach((record) => validateOverseasRecord(record, country.country));
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

  return dataset;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const dataset = await validateData();
  console.log(
    `Validated ${dataset.players.length} players, ${dataset.tournaments.length} tournaments, ${dataset.projects.length} projects.`
  );
}
