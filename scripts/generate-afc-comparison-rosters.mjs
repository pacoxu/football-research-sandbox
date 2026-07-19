import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = path.join(root, "data/raw/afc-comparison-rosters.json");
const playersDir = path.join(root, "data/raw/players");
const tournamentArchivePath = path.join(root, "data/raw/tournament-archive.json");
const marketValuesPath = path.join(root, "data/raw/player-market-values.json");

const COUNTRY_META = {
  "IR Iran": { prefix: "ir", tag: "iran-youth", file: "iran-afc-youth-rosters.json" },
  Qatar: { prefix: "qa", tag: "qatar-youth", file: "qatar-afc-u23-rosters.json" },
  "Saudi Arabia": { prefix: "sa", tag: "saudi-arabia-youth", file: "saudi-arabia-afc-u23-rosters.json" },
  Uzbekistan: { prefix: "uz", tag: "uzbekistan-youth", file: "uzbekistan-afc-u20-u23-rosters.json" }
};

const COMPETITION_META = {
  "afc-u17-2025": { ageBand: "u17", label: "AFC U17 Asian Cup 2025", teamSuffix: "U17" },
  "afc-u20-2025": { ageBand: "u20", label: "AFC U20 Asian Cup 2025", teamSuffix: "U20" },
  "afc-u23-2024": { ageBand: "u23", label: "AFC U23 Asian Cup 2024", teamSuffix: "U23" },
  "afc-u23-2026": { ageBand: "u23", label: "AFC U23 Asian Cup 2026", teamSuffix: "U23" }
};

const SOURCE_URLS = {
  "afc-u17-2025":
    "https://assets.the-afc.com/2025_AFC_U17_Asian_Cup/Finals/Downloads/AFC-U17-Asian-Cup-Saudi-Arabia-2025---Squad-Lists.pdf",
  "afc-u20-2025":
    "https://assets.the-afc.com/2025_AFC_U20_Asian_Cup/Finals/Downloads/Squads/AFC-U20-Asian-Cup-China-2025%E2%84%A2-Final-Squad-Registration.pdf",
  "afc-u23-2024":
    "https://assets.the-afc.com/2024_AFC_U23_Asian_Cup/Downloads/Squad_List/AFC-U23-Asian-Cup-Qatar-2024%E2%84%A2---Squad-Lists-%28Updated-April-16%29.pdf",
  "afc-u23-2026":
    "https://assets.the-afc.com/2026_AFC_U23_Asian_Cup_/Finals/Squad_Lists/AFC-U23-Asian-Cup-2026-Final-Registration.pdf?source=url"
};

const COUNTRY_CODES = {
  IRN: "Iran",
  ESP: "Spain",
  UAE: "United Arab Emirates",
  RUS: "Russia",
  QAT: "Qatar",
  KSA: "Saudi Arabia",
  UZB: "Uzbekistan",
  SRB: "Serbia"
};

const UZBEKISTAN_U17_SHIRT_NUMBERS = new Map([
  ["uz-olimjon-shamuratov-2009", 1], ["uz-m-abdisoliev-2009", 2],
  ["uz-muhammadaziz-ruziboev-2009", 3], ["uz-mukhammad-khakimov-2009", 4],
  ["uz-elsevarbek-olimov-2009", 5], ["uz-mukhammadjon-mamatov-2009", 6],
  ["uz-amirkhon-erkinov-2009", 7], ["uz-islom-ravshanov-2009", 8],
  ["uz-asilbek-aliev-2009", 9], ["uz-mirkomilbek-murodov-2009", 10],
  ["uz-sukhrob-sadirdjanov-2009", 11], ["uz-mekhrojbek-sirojiddinov-2009", 12],
  ["uz-mirjamol-anvarov-2009", 13], ["uz-muhammadodilkhon-orifkhonov-2009", 14],
  ["uz-nurmuhammad-uktamov-2009", 15], ["uz-adis-abdunabiev-2009", 16],
  ["uz-jakhongirmirzo-uktamboev-2009", 17], ["uz-farrukh-khayitmurodov-2009", 18],
  ["uz-akhrorbek-ravshanbekov-2009", 19], ["uz-laziz-abduraimov-2009", 20],
  ["uz-abdulboriy-zoidjonov-2009", 21], ["uz-abubakir-rakhimov-2009", 22],
  ["uz-rustam-aliev-2009", 23]
]);

function titleCase(value) {
  return value
    .toLowerCase()
    .replace(/(^|[\s-])([a-z])/g, (_, prefix, letter) => `${prefix}${letter.toUpperCase()}`)
    .replace(/\bFc\b/g, "FC")
    .replace(/\bSc\b/g, "SC")
    .replace(/\bPfc\b/g, "PFC")
    .replace(/\bCd\b/g, "CD")
    .replace(/\bF\.c\.\b/gi, "F.C.");
}

function normalizedNameTokens(value) {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .sort()
    .join("-");
}

function identityKey(row) {
  return `${row.country}|${row.birth_date}|${normalizedNameTokens(row.name)}`;
}

function slugify(value) {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseClub(value, fallbackCountry) {
  const match = value.match(/^(.*?)\s*\(([A-Z]{3})\)$/);
  const rawName = match?.[1] ?? value;
  const name = titleCase(rawName);
  const country = COUNTRY_CODES[match?.[2]] ?? fallbackCountry;
  const organizationType = /free agent/i.test(rawName)
    ? undefined
    : /aspire/i.test(rawName)
      ? "national-academy"
      : /\bfa\b|academy/i.test(rawName)
        ? "club-academy"
        : "professional-club";
  return { name, country, organizationType };
}

function unique(values) {
  return [...new Set(values)];
}

const source = JSON.parse(await fs.readFile(sourcePath, "utf8"));
const byCountry = new Map(Object.keys(COUNTRY_META).map((country) => [country, new Map()]));
const generatedPlayers = [];

for (const row of source.rows) {
  const countryPlayers = byCountry.get(row.country);
  if (!countryPlayers) throw new Error(`Unsupported comparison country: ${row.country}`);
  const key = identityKey(row);
  const record = countryPlayers.get(key) ?? { rows: [] };
  record.rows.push(row);
  countryPlayers.set(key, record);
}

for (const [country, records] of byCountry) {
  const meta = COUNTRY_META[country];
  const players = [...records.values()]
    .map(({ rows }) => {
      rows.sort((left, right) => left.snapshot_date.localeCompare(right.snapshot_date));
      const latest = rows.at(-1);
      const canonicalName = titleCase(latest.name);
      const latestClub = parseClub(latest.club, country);
      const id = `${meta.prefix}-${slugify(canonicalName)}-${latest.birth_date.slice(0, 4)}`;
      const competitionIds = unique(rows.map((row) => row.competition_id));
      const focusTags = unique([
        meta.tag,
        "afc-comparison-roster",
        "final-squad",
        ...competitionIds,
        ...competitionIds.map((competitionId) => `asia-${competitionId.replace("afc-", "")}`)
      ]);
      const registrationClub = {
        name: latestClub.name,
        country: latestClub.country,
        status: "tournament-snapshot",
        as_of: latest.snapshot_date
      };
      if (latestClub.organizationType) registrationClub.organization_type = latestClub.organizationType;

      return {
        id,
        name: canonicalName,
        local_name: canonicalName,
        country,
        birth_date: latest.birth_date,
        age_band: COMPETITION_META[latest.competition_id].ageBand,
        primary_position: latest.position,
        height_cm: latest.height_cm,
        weight_kg: latest.weight_kg,
        registration_club: registrationClub,
        training_pathway: rows.map((row) => {
          const club = parseClub(row.club, country);
          const step = {
            stage_label: `${COMPETITION_META[row.competition_id].label} registration`,
            organization: club.name,
            country: club.country,
            note: `AFC final registration records this organization on ${row.snapshot_date}; it is a tournament snapshot, not a current-club claim.`
          };
          if (club.organizationType) step.organization_type = club.organizationType;
          return step;
        }),
        focus_tags: focusTags,
        tournament_participation: rows.map((row) => ({
          competition_id: row.competition_id,
          label: `${COMPETITION_META[row.competition_id].label} ${country} final squad`,
          team: `${country} ${COMPETITION_META[row.competition_id].teamSuffix}`,
          squad_status: "registered",
          roster_status: "final-squad",
          shirt_number: row.shirt_number,
          appearances: null,
          goals: null,
          minutes: null,
          note:
            row.competition_id === "afc-u23-2026" && country === "IR Iran"
              ? `Official final registration shirt number ${row.shirt_number}; the source has no number 2 and lists two number 22 entries, preserved without correction.`
              : `Official final registration shirt number ${row.shirt_number}.`
        })),
        external_links: unique(rows.map((row) => row.source_url)).map((url) => ({
          type: "official",
          label: "AFC final squad registration",
          url
        })),
        source_layers: unique(rows.map((row) => `${row.competition_id}|${row.source_url}`)).map((value) => {
          const [competitionId, url] = value.split("|");
          return {
            type: "afc-registration",
            label: `${COMPETITION_META[competitionId].label} final registration`,
            url,
            checked_at: source.checked_at,
            confidence: "high",
            fields: [
              "name",
              "birth_date",
              "primary_position",
              "registration_club",
              "height_cm",
              "weight_kg",
              "tournament_participation"
            ],
            claim: `AFC final registration confirms ${canonicalName} in the ${country} 23-player final squad and records the tournament-time club snapshot.`
          };
        }),
        verification: {
          status: "provisional",
          last_checked: source.checked_at,
          notes:
            "AFC final registration confirms tournament identity and the Latin-script name. No independent official native-script source was captured, so local_name retains the AFC transliteration. Tournament representation does not establish birthplace, citizenship-acquisition method, or naturalization status."
        }
      };
    })
    .sort((left, right) => left.birth_date.localeCompare(right.birth_date) || left.id.localeCompare(right.id));

  const ids = new Set();
  for (const player of players) {
    if (ids.has(player.id)) throw new Error(`Duplicate generated player id: ${player.id}`);
    ids.add(player.id);
  }
  generatedPlayers.push(...players);
  await fs.writeFile(path.join(playersDir, meta.file), `${JSON.stringify(players, null, 2)}\n`, "utf8");
  console.log(`Generated ${players.length} ${country} comparison players in ${meta.file}`);
}

const uzbekistanU17Source =
  "https://assets.the-afc.com/2026_AFC_U17_Asian_Cup/Finals/Download/Squad_Lists/AFC-U17-Asian-Cup-Saudi-Arabia-2026---Final-Squad-Lists.pdf";
const uzbekistanU17NormalizationNote =
  `AFC U17 2026 final-squad number and tournament-time organization were normalized on ${source.checked_at}; AFC representation does not establish birthplace or naturalization status.`;
for (const file of ["u17.json", "uzbekistan-u17-2026-additions.json"]) {
  const filePath = path.join(playersDir, file);
  const players = JSON.parse(await fs.readFile(filePath, "utf8"));
  let normalizedCount = 0;
  const normalized = players.map((player) => {
    const entries = player.tournament_participation.filter(
      (entry) => entry.competition_id === "afc-u17-2026"
    );
    if (player.country !== "Uzbekistan" || entries.length === 0) return player;
    normalizedCount += 1;
    const shirtNumber =
      player.jersey_number ?? entries[0]?.shirt_number ?? UZBEKISTAN_U17_SHIRT_NUMBERS.get(player.id);
    if (!Number.isInteger(shirtNumber)) {
      throw new Error(`Missing Uzbekistan U17 shirt number on ${player.id}`);
    }
    const organizationType = /\bfa\b|rfa|junior|academy/i.test(player.registration_club.name)
      ? "club-academy"
      : "professional-club";
    const registrationClub = {
      ...player.registration_club,
      organization_type: organizationType,
      status: "tournament-snapshot",
      as_of: "2026-05-02"
    };
    const pathway = player.training_pathway.map((step) =>
      step.organization === player.registration_club.name
        ? { ...step, organization_type: organizationType }
        : step
    );
    const afcLayer = {
      type: "afc-registration",
      label: "AFC U17 Asian Cup 2026 final registration",
      url: uzbekistanU17Source,
      checked_at: source.checked_at,
      confidence: "high",
      fields: [
        "name",
        "birth_date",
        "primary_position",
        "registration_club",
        "height_cm",
        "weight_kg",
        "tournament_participation"
      ],
      claim: `AFC final registration confirms ${player.name} in Uzbekistan's 23-player U17 final squad and records the tournament-time club snapshot.`
    };
    const participation = player.tournament_participation.filter(
      (entry) => entry.competition_id !== "afc-u17-2026"
    );
    participation.push({
      competition_id: "afc-u17-2026",
      label: "AFC U17 Asian Cup 2026 Uzbekistan final squad",
      team: "Uzbekistan U17",
      squad_status: "registered",
      roster_status: "final-squad",
      shirt_number: shirtNumber,
      appearances: null,
      goals: null,
      minutes: null,
      note: `Official final registration shirt number ${shirtNumber}.`
    });
    const { jersey_number: _removedJerseyNumber, ...withoutTopLevelNumber } = player;
    return {
      ...withoutTopLevelNumber,
      registration_club: registrationClub,
      training_pathway: pathway,
      tournament_participation: participation,
      source_layers: [
        ...(player.source_layers ?? []).filter((layer) => layer.type !== "afc-registration"),
        afcLayer
      ],
      verification: {
        ...player.verification,
        last_checked: source.checked_at,
        notes: `${player.verification.notes
          .replace(/\s*AFC U17 2026 final-squad number and tournament-time organization were normalized on \d{4}-\d{2}-\d{2}; AFC representation does not establish birthplace or naturalization status\./g, "")
          .trim()} ${uzbekistanU17NormalizationNote}`
      }
    };
  });
  await fs.writeFile(filePath, `${JSON.stringify(normalized, null, 2)}\n`, "utf8");
  console.log(`Normalized ${normalizedCount} Uzbekistan U17 final-squad players in ${file}`);
}

const u17_2026Source = uzbekistanU17Source;
const comparisonRosters = {
  "afc-u17-2025": [
    {
      country: "IR Iran",
      status: "complete-final-registration",
      expected_count: 23,
      source_url: SOURCE_URLS["afc-u17-2025"],
      source_checked_at: source.checked_at,
      note: "AFC final squad list contains 23 named Iran entries."
    }
  ],
  "afc-u17-2026": [
    {
      country: "Australia",
      status: "complete-final-registration",
      expected_count: 23,
      source_url: u17_2026Source,
      source_checked_at: source.checked_at,
      note: "Existing Australia final-squad dataset remains the official 23-player boundary."
    },
    {
      country: "Uzbekistan",
      status: "complete-final-registration",
      expected_count: 23,
      source_url: u17_2026Source,
      source_checked_at: source.checked_at,
      note: "Existing Uzbekistan final-squad records were normalized to the common roster contract."
    },
    {
      country: "IR Iran",
      status: "not-applicable",
      expected_count: 0,
      source_url: u17_2026Source,
      source_checked_at: source.checked_at,
      note: "Iran did not participate in the AFC U17 Asian Cup 2026 finals; no inferred roster is created."
    }
  ],
  "afc-u20-2025": [
    {
      country: "Australia",
      status: "complete-final-registration",
      expected_count: 23,
      source_url: "https://assets.the-afc.com/2025_AFC_U20_Asian_Cup/Finals/Downloads/Squads/AFC-U20-Asian-Cup-China-2025-Squad-List.pdf",
      source_checked_at: source.checked_at,
      note: "Existing Australia final-squad dataset remains the official 23-player boundary."
    },
    ...["IR Iran", "Uzbekistan"].map((country) => ({
      country,
      status: "complete-final-registration",
      expected_count: 23,
      source_url: SOURCE_URLS["afc-u20-2025"],
      source_checked_at: source.checked_at,
      note: "The image-based AFC final registration page was rendered and checked row by row."
    }))
  ],
  "afc-u23-2024": [
    ...["Qatar", "Saudi Arabia", "Uzbekistan"].map((country) => ({
      country,
      status: "complete-final-registration",
      expected_count: 23,
      source_url: SOURCE_URLS["afc-u23-2024"],
      source_checked_at: source.checked_at,
      note: "AFC final squad list contains 23 named entries."
    })),
    {
      country: "IR Iran",
      status: "not-applicable",
      expected_count: 0,
      source_url: SOURCE_URLS["afc-u23-2024"],
      source_checked_at: source.checked_at,
      note: "Iran did not participate in the AFC U23 Asian Cup 2024 finals; no inferred roster is created."
    }
  ],
  "afc-u23-2026": ["IR Iran", "Qatar", "Saudi Arabia", "Uzbekistan"].map((country) => ({
    country,
    status: "complete-final-registration",
    expected_count: 23,
    source_url: SOURCE_URLS["afc-u23-2026"],
    source_checked_at: source.checked_at,
    note:
      country === "IR Iran"
        ? "AFC source contains 23 named entries but omits shirt number 2 and repeats shirt number 22; source numbering is preserved."
        : "AFC final registration contains 23 named entries."
  }))
};

const tournamentArchive = JSON.parse(await fs.readFile(tournamentArchivePath, "utf8"));
for (const tournament of tournamentArchive) {
  if (comparisonRosters[tournament.id]) {
    tournament.comparison_rosters = comparisonRosters[tournament.id];
  }
}
await fs.writeFile(tournamentArchivePath, `${JSON.stringify(tournamentArchive, null, 2)}\n`, "utf8");
console.log("Updated comparison_rosters metadata in tournament-archive.json");

const marketValues = JSON.parse(await fs.readFile(marketValuesPath, "utf8"));
for (const player of generatedPlayers) {
  marketValues.players[player.id] ??= {
    checked_at: source.checked_at,
    status: "profile-not-found",
    history: [],
    history_points: 0,
    current: null,
    peak: null,
    last_change_date: null,
    source: {
      provider: "Transfermarkt",
      profile_url: "",
      market_value_url: "",
      api_url: ""
    },
    lookup: {
      checked_at: source.checked_at,
      status: "not-found",
      method: "not-searched-by-profile",
      matched_fields: [],
      candidate_urls: []
    },
    alternatives: [],
    last_success_at: null
  };
}

const statusCounts = {};
const countryCounts = {};
const allPlayerFiles = (await fs.readdir(playersDir)).filter((file) => file.endsWith(".json"));
const countriesById = new Map();
for (const file of allPlayerFiles) {
  const players = JSON.parse(await fs.readFile(path.join(playersDir, file), "utf8"));
  for (const player of players) countriesById.set(player.id, player.country);
}
for (const [playerId, record] of Object.entries(marketValues.players)) {
  statusCounts[record.status] = (statusCounts[record.status] ?? 0) + 1;
  const country = countriesById.get(playerId);
  if (!country) continue;
  countryCounts[country] ??= { total: 0 };
  countryCounts[country].total += 1;
  countryCounts[country][record.status] = (countryCounts[country][record.status] ?? 0) + 1;
}
marketValues.meta.checked_at = source.checked_at;
marketValues.meta.coverage = {
  total: Object.keys(marketValues.players).length,
  statuses: statusCounts,
  by_country: countryCounts
};
await fs.writeFile(marketValuesPath, `${JSON.stringify(marketValues, null, 2)}\n`, "utf8");
console.log(`Added market-value boundary records for ${generatedPlayers.length} generated players`);
