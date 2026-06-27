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
    assert(
      player.external_links.every((link) => /^https?:\/\//.test(link.url)),
      `Invalid link url for ${player.id}`
    );
    assert(
      player.tournament_participation.every(
        (entry) => !entry.competition_id || tournamentIds.has(entry.competition_id)
      ),
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
    if (player.market_value !== undefined) {
      assert(typeof player.market_value === "object" && player.market_value !== null, `Invalid market_value on ${player.id}`);
      assert(
        typeof player.market_value.status === "string" && player.market_value.status.length > 0,
        `Missing market_value status on ${player.id}`
      );
      assert(
        typeof player.market_value.checked_at === "string" && isIsoDate(player.market_value.checked_at),
        `Invalid market_value checked_at on ${player.id}`
      );
      assert(
        typeof player.market_value.source?.provider === "string" &&
          typeof player.market_value.source?.profile_url === "string",
        `Invalid market_value source on ${player.id}`
      );
      if (player.market_value.current !== null && player.market_value.current !== undefined) {
        validateMarketValuePoint(player.market_value.current, player.id, "current");
      }
      if (player.market_value.peak !== null && player.market_value.peak !== undefined) {
        validateMarketValuePoint(player.market_value.peak, player.id, "peak");
      }
      if (player.market_value.last_change_date !== null && player.market_value.last_change_date !== undefined) {
        assert(
          isIsoDate(player.market_value.last_change_date),
          `Invalid market_value last_change_date on ${player.id}`
        );
      }
      if (player.market_value.history_points !== undefined) {
        assert(
          Number.isInteger(player.market_value.history_points) && player.market_value.history_points >= 0,
          `Invalid market_value history_points on ${player.id}`
        );
      }
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
  }

  if (dataset.chinaMenYouthCoaches !== null) {
    validateChinaMenYouthCoaches(dataset.chinaMenYouthCoaches);
  }

  if (dataset.bigFiveAsianCoaches !== null) {
    validateBigFiveAsianCoaches(dataset.bigFiveAsianCoaches);
  }

  return dataset;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const dataset = await validateData();
  console.log(
    `Validated ${dataset.players.length} players, ${dataset.tournaments.length} tournaments, ${dataset.projects.length} projects.`
  );
}
