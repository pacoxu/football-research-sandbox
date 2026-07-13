import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  matchesMarketValueSelection,
  preservePreviousOnFailure,
  summarizeMarketValuePayload,
  verifyTransfermarktIdentity
} from "./lib/market-values.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PLAYERS_DIR = path.join(ROOT, "data/raw/players");
const SNAPSHOT_PATH = path.join(ROOT, "data/raw/player-market-values.json");
const REPORT_PATH = path.join(ROOT, "docs/research/transfermarkt-market-value-coverage.md");
const API_ROOT = "https://tmapi-alpha.transfermarkt.technology";
const CHECKED_AT = new Intl.DateTimeFormat("en-CA", {
  timeZone: process.env.TZ ?? "Asia/Singapore",
  year: "numeric",
  month: "2-digit",
  day: "2-digit"
}).format(new Date());
const REQUEST_DELAY_MS = Number(process.env.TM_REQUEST_DELAY_MS ?? 350);

const NATIONALITY_IDS = {
  "China PR": [34],
  Japan: [77],
  "Korea Republic": [87],
  Australia: [12],
  Uzbekistan: [180]
};

const DISCOVERY_CLUBS = [
  { id: "35185", label: "China U23", country: "China PR", competition: "afc-u23-2026" },
  { id: "7689", label: "China U20", country: "China PR", competition: "afc-u20-2025" },
  { id: "28420", label: "China U19", country: "China PR" },
  { id: "26944", label: "China U17", country: "China PR", competition: "afc-u17-2026" },
  { id: "28642", label: "Japan U23", country: "Japan", competition: "afc-u23-2026" },
  { id: "29810", label: "Japan U21", country: "Japan" },
  { id: "25507", label: "Japan U17", country: "Japan", competition: "afc-u17-2026" },
  { id: "34950", label: "South Korea U23", country: "Korea Republic", competition: "afc-u23-2026" },
  { id: "76096", label: "South Korea U21", country: "Korea Republic" },
  { id: "25511", label: "South Korea U17", country: "Korea Republic", competition: "afc-u17-2026" },
  { id: "32649", label: "Uzbekistan U17", country: "Uzbekistan", competition: "afc-u17-2026" },
  {
    id: "22976",
    label: "Australia U20 2024/25",
    country: "Australia",
    competition: "afc-u20-2025",
    historyUrl: "https://www.transfermarkt.com/australien-u20/rueckennummern/verein/22976",
    historicalPlayerIds: [
      "970266",
      "1132512",
      "1118086",
      "1099708",
      "1104730",
      "1064377",
      "1104713",
      "857060",
      "1038441",
      "957230",
      "1109205",
      "1110729",
      "1279984",
      "1195422",
      "1104726",
      "1110867",
      "1109957",
      "1109829",
      "1069960",
      "1109826",
      "1144775",
      "1183854",
      "1137438"
    ]
  },
  {
    id: "32269",
    label: "Australia U17 2025/26",
    country: "Australia",
    competition: "afc-u17-2026",
    historyUrl: "https://www.transfermarkt.com/australia-u17/kader/verein/32269/saison_id/2025",
    historicalPlayerIds: [
      "1263751",
      "1413328",
      "1273787",
      "1413350",
      "1329720",
      "1413351",
      "1413327",
      "1413345",
      "1413330",
      "1334905",
      "1333552",
      "1420097",
      "1378246",
      "1533962",
      "1484876",
      "1432380",
      "1329718",
      "1413348",
      "1533960",
      "1413326",
      "1484877",
      "1294139",
      "1413347"
    ]
  },
  { id: "32270", label: "Australia U23", country: "Australia", competition: "afc-u23-2026" }
];

const MANUAL_PROFILE_OVERRIDES = {
  "au-charlie-wilson-papps-2009": "1263751",
  "au-winston-ashburner-2009": "1413328",
  "au-besian-kutleshi-2009": "1273787",
  "au-marcus-savic-2009": "1413350",
  "au-miles-milliner-2009": "1329720",
  "au-sajjad-nasiri-2009": "1413351",
  "au-aston-reid-2009": "1413327",
  "au-oliver-ocarroll-2009": "1413345",
  "au-luke-becvinovski-2009": "1413330",
  "au-akol-akon-2009": "1334905",
  "au-max-court-2009": "1333552",
  "au-lachlan-allen-2009": "1420097",
  "au-archie-mitchell-2009": "1378246",
  "au-fraser-brown-2009": "1533962",
  "au-emile-katrib-2009": "1484876",
  "au-akeem-gerald-2010": "1432380",
  "au-henrique-oliveira-2009": "1329718",
  "au-hugo-ng-2009": "1413348",
  "au-stevan-rujak-2009": "1533960",
  "au-georgio-hassarati-2009": "1413326",
  "au-luka-demuth-2010": "1484877",
  "au-harrison-bond-2009": "1294139",
  "au-corey-da-cruz-2009": "1413347",
  "au-gus-hoefsloot-2006": "1109829",
  "cn-liu-shaoziyang-2003": "966946",
  "cn-mutalifu-yimingkari-2004": "1014231",
  "cn-baihelamu-abuduwaili-2003": "946750",
  "uz-abdukodir-khusanov-2004": "763079",
  "jp-shio-fukuda-2004": "1073997",
  "jp-taichi-fukui-2004": "868622",
  "jp-kodai-sano-2003": "957544",
  "jp-anrie-chase-2004": "948537",
  "jp-rento-takaoka-2007": "1146989",
  "jp-sota-kitano-2004": "671114",
  "jp-tokumo-kawai-2007": "916786",
  "kr-moon-hyunho-2003": "909853",
  "kr-kang-minjun-2003": "709161",
  "kr-bae-hyunseo-2005": "875551",
  "kr-jo-hyuntae-2004": "822126",
  "kr-lee-hyunyong-2003": "1106944",
  "kr-lee-chanouk-2003": "876856",
  "kr-kang-seongjin-2003": "709170",
  "kr-kim-dongjin-2003": "904068",
  "kr-kim-taewon-2005": "1223583",
  "kr-kang-sangyoon-2004": "711708",
  "kr-joung-jihun-2004": "1106934",
  "kr-hwang-jaeyun-2003": "1227027",
  "kr-kim-dohyun-2004": "709769",
  "kr-jung-seungbae-2003": "1053173",
  "kr-baek-gaon-2006": "1162558",
  "kr-kim-hanseo-2003": "921782",
  "kr-kim-yonghak-2003": "706960",
  "kr-jeong-jaesang-2004": "1073573",
  "kr-lee-geonhee-2005": "925084",
  "kr-park-seungsoo-2007": "1134717"
};

function parseArgs(argv) {
  const args = new Set(argv);
  const playerArgument = argv.find((argument) => argument.startsWith("--player="));
  const countryArgument = argv.find((argument) => argument.startsWith("--country="));
  const competitionArgument = argv.find((argument) => argument.startsWith("--competition="));
  return {
    apply: args.has("--apply"),
    discover: !args.has("--no-discovery"),
    playerId: playerArgument?.slice("--player=".length) || null,
    country: countryArgument?.slice("--country=".length) || null,
    competition: competitionArgument?.slice("--competition=".length) || null,
    help: args.has("--help") || args.has("-h")
  };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson(url, { retries = 2 } = {}) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
          "Accept-Language": "en-US"
        },
        signal: AbortSignal.timeout(20_000)
      });
      if (response.ok) {
        await sleep(REQUEST_DELAY_MS);
        return await response.json();
      }
      const retryAfter = Number(response.headers.get("retry-after") ?? 0) * 1_000;
      const retryable = response.status === 429 || response.status >= 500;
      const body = await response.text();
      lastError = new Error(`HTTP ${response.status}: ${body.slice(0, 160)}`);
      if (!retryable || attempt === retries) {
        lastError.nonRetryable = !retryable;
        throw lastError;
      }
      await sleep(retryAfter || (attempt + 1) * 1_000);
    } catch (error) {
      lastError = error;
      if (error?.nonRetryable || attempt === retries) {
        throw error;
      }
      await sleep((attempt + 1) * 1_000);
    }
  }
  throw lastError;
}

function getTransfermarktLink(player) {
  return (player.external_links ?? []).find(
    (link) => /transfermarkt/i.test(String(link.label ?? "")) || /transfermarkt/i.test(String(link.url ?? ""))
  );
}

function extractPlayerId(url) {
  return String(url ?? "").match(/spieler\/(\d+)/i)?.[1] ?? "";
}

function buildProfileUrl(profile) {
  return new URL(profile.relativeUrl, "https://www.transfermarkt.com").toString();
}

function buildSource(profile) {
  const playerId = String(profile.id);
  const profileUrl = buildProfileUrl(profile);
  return {
    provider: "Transfermarkt",
    profile_url: profileUrl,
    market_value_url: profileUrl.replace("/profil/", "/marktwertverlauf/"),
    api_url: `${API_ROOT}/player/${playerId}/market-value-history?_x_preferred_context=com`
  };
}

async function readPlayers() {
  const files = (await fs.readdir(PLAYERS_DIR)).filter((name) => name.endsWith(".json")).sort();
  const groups = [];
  for (const file of files) {
    const filePath = path.join(PLAYERS_DIR, file);
    groups.push({ file, filePath, players: JSON.parse(await fs.readFile(filePath, "utf8")) });
  }
  return groups;
}

async function readPreviousSnapshot() {
  try {
    return JSON.parse(await fs.readFile(SNAPSHOT_PATH, "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") {
      return { meta: null, players: {} };
    }
    throw error;
  }
}

async function loadCandidateProfiles(clubs = DISCOVERY_CLUBS) {
  const candidateIds = new Set();
  const candidateTeams = new Map();
  for (const club of clubs) {
    for (const playerId of club.historicalPlayerIds ?? []) {
      candidateIds.add(String(playerId));
      const labels = candidateTeams.get(String(playerId)) ?? [];
      labels.push(`${club.label}:historical-team-page`);
      candidateTeams.set(String(playerId), labels);
    }
    try {
      const payload = await fetchJson(`${API_ROOT}/club/${club.id}/squad`);
      for (const playerId of payload?.data?.playerIds ?? []) {
        candidateIds.add(String(playerId));
        const labels = candidateTeams.get(String(playerId)) ?? [];
        labels.push(club.label);
        candidateTeams.set(String(playerId), labels);
      }
    } catch (error) {
      console.warn(`Discovery squad failed for ${club.label}: ${error.message}`);
    }
  }

  const profiles = [];
  for (const playerId of [...candidateIds].sort((a, b) => Number(a) - Number(b))) {
    try {
      const payload = await fetchJson(`${API_ROOT}/player/${playerId}`);
      if (payload?.data) {
        profiles.push({ ...payload.data, discoveryTeams: candidateTeams.get(playerId) ?? [] });
      }
    } catch (error) {
      console.warn(`Discovery profile failed for ${playerId}: ${error.message}`);
    }
  }
  return profiles;
}

function matchCandidate(player, profiles) {
  const matches = profiles
    .map((profile) => ({ profile, verification: verifyTransfermarktIdentity(player, profile, NATIONALITY_IDS) }))
    .filter((candidate) => candidate.verification.accepted);

  if (matches.length === 1) {
    return { status: "confirmed", ...matches[0] };
  }
  if (matches.length > 1) {
    return { status: "ambiguous", candidates: matches };
  }
  return { status: "not-found", candidates: [] };
}

async function fetchAndVerifyProfile(player, playerId) {
  const payload = await fetchJson(`${API_ROOT}/player/${playerId}`);
  if (!payload?.data) {
    throw new Error("Profile payload is missing data");
  }
  return {
    profile: payload.data,
    verification: verifyTransfermarktIdentity(player, payload.data, NATIONALITY_IDS)
  };
}

function emptyRecord(status, lookup, source = null) {
  return {
    checked_at: CHECKED_AT,
    status,
    source: source ?? {
      provider: "Transfermarkt",
      profile_url: "",
      market_value_url: "",
      api_url: null
    },
    lookup,
    history: [],
    history_points: 0,
    current: null,
    peak: null,
    last_change_date: null,
    alternatives: []
  };
}

async function buildRecord(player, profiles, previous) {
  const existingLink = getTransfermarktLink(player);
  const existingId = extractPlayerId(existingLink?.url);
  const preferredId = MANUAL_PROFILE_OVERRIDES[player.id] ?? existingId;
  let profile;
  let verification;
  let lookupMethod;

  if (preferredId) {
    try {
      ({ profile, verification } = await fetchAndVerifyProfile(player, preferredId));
      lookupMethod = MANUAL_PROFILE_OVERRIDES[player.id] ? "manual-override" : "existing-link";
    } catch (error) {
      const lookup = {
        checked_at: CHECKED_AT,
        status: "fetch-error",
        method: MANUAL_PROFILE_OVERRIDES[player.id] ? "manual-override" : "existing-link",
        candidate_urls: existingLink?.url
          ? [existingLink.url]
          : preferredId
            ? [`https://www.transfermarkt.com/profil/spieler/${preferredId}`]
            : []
      };
      const profileUrl = existingLink?.url ??
        (preferredId ? `https://www.transfermarkt.com/profil/spieler/${preferredId}` : "");
      const source = profileUrl
        ? {
            provider: "Transfermarkt",
            profile_url: profileUrl,
            market_value_url: profileUrl,
            api_url: preferredId ? `${API_ROOT}/player/${preferredId}/market-value-history?_x_preferred_context=com` : null
          }
        : null;
      return {
        record: preservePreviousOnFailure(previous, emptyRecord("fetch-error", lookup, source), error.message),
        confirmedProfile: null
      };
    }
  } else if (profiles.length) {
    const match = matchCandidate(player, profiles);
    if (match.status === "confirmed") {
      profile = match.profile;
      verification = match.verification;
      lookupMethod = `national-team-squad:${profile.discoveryTeams.join(",")}`;
    } else if (match.status === "ambiguous") {
      const lookup = {
        checked_at: CHECKED_AT,
        status: "ambiguous",
        method: "national-team-squads",
        candidate_urls: match.candidates.map(({ profile: candidate }) => buildProfileUrl(candidate))
      };
      return { record: emptyRecord("ambiguous-profile", lookup), confirmedProfile: null };
    }
  }

  if (!profile) {
    const isTeamPageOnly = Boolean(existingLink && !existingId);
    const lookup = {
      checked_at: CHECKED_AT,
      status: isTeamPageOnly ? "team-page-only" : "not-found",
      method: profiles.length ? "national-team-squads" : "existing-links-only",
      candidate_urls: existingLink?.url ? [existingLink.url] : []
    };
    return {
      record: emptyRecord(isTeamPageOnly ? "team-page-only" : "profile-not-found", lookup, existingLink ? {
        provider: "Transfermarkt",
        profile_url: existingLink.url,
        market_value_url: existingLink.url,
        api_url: null
      } : null),
      confirmedProfile: null
    };
  }

  const source = buildSource(profile);
  const lookup = {
    checked_at: CHECKED_AT,
    status: verification.accepted ? "confirmed" : "ambiguous",
    method: lookupMethod,
    matched_fields: verification.matched_fields,
    candidate_urls: [source.profile_url]
  };

  if (!verification.accepted) {
    return { record: emptyRecord("ambiguous-profile", lookup, source), confirmedProfile: null };
  }

  try {
    const payload = await fetchJson(source.api_url);
    if (!payload?.data) {
      throw new Error("Market value payload is missing data");
    }
    const summary = summarizeMarketValuePayload(payload);
    return {
      record: {
        checked_at: CHECKED_AT,
        ...summary,
        source,
        lookup,
        alternatives: previous?.alternatives ?? [],
        last_success_at: CHECKED_AT
      },
      confirmedProfile: profile
    };
  } catch (error) {
    return {
      record: preservePreviousOnFailure(previous, emptyRecord("fetch-error", lookup, source), error.message),
      confirmedProfile: profile
    };
  }
}

function updateTransfermarktLink(player, profile, fallbackPlayerId = null) {
  if (!profile && !fallbackPlayerId) {
    return false;
  }
  const links = player.external_links ?? [];
  const index = links.findIndex(
    (link) => /transfermarkt/i.test(String(link.label ?? "")) || /transfermarkt/i.test(String(link.url ?? ""))
  );
  if (!profile && index >= 0) {
    return false;
  }
  const url = profile
    ? buildProfileUrl(profile)
    : `https://www.transfermarkt.com/profil/spieler/${fallbackPlayerId}`;
  const next = { type: "transfermarkt", label: "Transfermarkt profile", url };
  if (index >= 0) {
    if (links[index].url === url && links[index].type === next.type) {
      return false;
    }
    links[index] = { ...links[index], ...next };
  } else {
    links.push(next);
  }
  player.external_links = links;
  return true;
}

function summarizeCoverage(players, records) {
  const byCountry = {};
  const statuses = {};
  for (const player of players) {
    const status = records[player.id]?.status ?? "missing";
    statuses[status] = (statuses[status] ?? 0) + 1;
    const country = byCountry[player.country] ?? { total: 0 };
    country.total += 1;
    country[status] = (country[status] ?? 0) + 1;
    byCountry[player.country] = country;
  }
  return { total: players.length, statuses, by_country: byCountry };
}

function renderReport(coverage, records) {
  const lines = [
    "# Transfermarkt 身价覆盖报告",
    "",
    `更新时间：${CHECKED_AT}`,
    "",
    `球员总数：${coverage.total}`,
    "",
    "## 状态汇总",
    "",
    "| 状态 | 人数 |",
    "| --- | ---: |",
    ...Object.entries(coverage.statuses).sort().map(([status, count]) => `| ${status} | ${count} |`),
    "",
    "## 按国家/地区",
    "",
    "| 国家/地区 | 总数 | 有历史 | 无身价 | 未找到个人页 | 待复核 | 抓取失败/过期 |",
    "| --- | ---: | ---: | ---: | ---: | ---: | ---: |",
    ...Object.entries(coverage.by_country).map(([country, row]) =>
      `| ${country} | ${row.total} | ${row.available ?? 0} | ${row["no-market-value"] ?? 0} | ${row["profile-not-found"] ?? 0} | ${(row["ambiguous-profile"] ?? 0) + (row["team-page-only"] ?? 0)} | ${(row["fetch-error"] ?? 0) + (row.stale ?? 0)} |`
    ),
    "",
    "## 待人工复核",
    "",
    ...Object.entries(records)
      .filter(([, record]) => ["ambiguous-profile", "team-page-only", "fetch-error", "stale"].includes(record.status))
      .map(([playerId, record]) => `- \`${playerId}\`：${record.status}${record.refresh_error ? `（${record.refresh_error}）` : ""}`),
    "",
    "说明：搜索结果只用于定位候选个人页；所有写入链接均需通过生日、国籍以及姓名或位置匹配。其他平台估值保存在 `alternatives` 中，不参与 Transfermarkt 排行。",
    ""
  ];
  return lines.join("\n");
}

async function writeAtomic(filePath, contents) {
  const tempPath = `${filePath}.tmp`;
  await fs.writeFile(tempPath, contents, "utf8");
  await fs.rename(tempPath, filePath);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log("Usage: node scripts/sync-transfermarkt-market-values.mjs [--apply] [--no-discovery] [--player=<id>] [--country=<country>] [--competition=<id>]");
    return;
  }

  const groups = await readPlayers();
  const players = groups.flatMap((group) => group.players);
  const previous = await readPreviousSnapshot();
  const selectedPlayers = players.filter((player) => matchesMarketValueSelection(player, options));
  if (selectedPlayers.length === 0) {
    throw new Error("No players match the requested market-value selection");
  }
  const targeted = Boolean(options.playerId || options.country || options.competition);
  const discoveryClubs = DISCOVERY_CLUBS.filter(
    (club) =>
      (!options.country || club.country === options.country) &&
      (!options.competition || club.competition === options.competition)
  );
  const profiles = options.discover && !options.playerId ? await loadCandidateProfiles(discoveryClubs) : [];
  const records = targeted ? { ...(previous.players ?? {}) } : {};
  let linkChanges = 0;

  for (const player of selectedPlayers) {
    const result = await buildRecord(player, profiles, previous.players?.[player.id]);
    records[player.id] = result.record;
    if (updateTransfermarktLink(player, result.confirmedProfile, MANUAL_PROFILE_OVERRIDES[player.id])) {
      linkChanges += 1;
    }
    console.log(`${player.id}: ${result.record.status}`);
  }

  const orderedRecords = Object.fromEntries(Object.entries(records).sort(([left], [right]) => left.localeCompare(right)));
  const coverage = summarizeCoverage(players, orderedRecords);
  const snapshot = {
    meta: {
      provider: "Transfermarkt",
      checked_at: CHECKED_AT,
      api_template: `${API_ROOT}/player/{id}/market-value-history?_x_preferred_context=com`,
      coverage
    },
    players: orderedRecords
  };
  const report = renderReport(coverage, orderedRecords);

  console.log(JSON.stringify({ coverage, discovered_profiles: profiles.length, link_changes: linkChanges }, null, 2));
  if (!options.apply) {
    console.log("Dry run only. Pass --apply to update snapshot, player links, and coverage report.");
    return;
  }

  await writeAtomic(SNAPSHOT_PATH, `${JSON.stringify(snapshot, null, 2)}\n`);
  for (const group of groups) {
    await writeAtomic(group.filePath, `${JSON.stringify(group.players, null, 2)}\n`);
  }
  await writeAtomic(REPORT_PATH, report);
}

await main();
