import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { summarizeMarketValuePayload } from "./lib/market-values.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RAW_PLAYERS_DIR = path.join(ROOT, "data/raw/players");
const OUTPUT_PATH = path.join(ROOT, "data/raw/player-market-values.json");
const API_TEMPLATE =
  "https://tmapi-alpha.transfermarkt.technology/player/{id}/market-value-history?_x_preferred_context=com";

function findTransfermarktLink(player) {
  return (player.external_links ?? []).find(
    (link) => /transfermarkt/i.test(String(link.label ?? "")) || /transfermarkt/i.test(String(link.url ?? ""))
  );
}

function extractTransfermarktPlayerId(url) {
  return String(url ?? "").match(/spieler\/(\d+)/i)?.[1] ?? "";
}

function deriveMarketValueUrl(profileUrl, playerId) {
  if (!profileUrl || !playerId) {
    return profileUrl || "";
  }

  try {
    const parsed = new URL(profileUrl);
    const segments = parsed.pathname.split("/").filter(Boolean);
    const slug = segments[0] || "player";
    parsed.pathname = `/${slug}/marktwertverlauf/spieler/${playerId}`;
    parsed.search = "";
    parsed.hash = "";
    return parsed.toString();
  } catch {
    return profileUrl;
  }
}

async function readPlayerFiles() {
  const entries = await fs.readdir(RAW_PLAYERS_DIR, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => path.join(RAW_PLAYERS_DIR, entry.name))
    .sort((left, right) => left.localeCompare(right));

  const groups = await Promise.all(
    files.map(async (filePath) => ({
      filePath,
      players: JSON.parse(await fs.readFile(filePath, "utf8"))
    }))
  );

  return groups.flatMap((group) => group.players);
}

async function readApiPayload(tempDir, playerId) {
  const filePath = path.join(tempDir, `${playerId}.json`);
  try {
    const payload = await fs.readFile(filePath, "utf8");
    return JSON.parse(payload);
  } catch (error) {
    if (error?.code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

async function buildSnapshot(tempDir) {
  const checkedAt = new Date().toISOString().slice(0, 10);
  const players = await readPlayerFiles();
  const marketValues = {};

  for (const player of players) {
    const transfermarktLink = findTransfermarktLink(player);
    if (!transfermarktLink) {
      continue;
    }

    const tmPlayerId = extractTransfermarktPlayerId(transfermarktLink.url);
    const source = {
      provider: "Transfermarkt",
      profile_url: transfermarktLink.url,
      market_value_url: deriveMarketValueUrl(transfermarktLink.url, tmPlayerId),
      api_url: tmPlayerId ? API_TEMPLATE.replace("{id}", tmPlayerId) : null
    };

    if (!tmPlayerId) {
      marketValues[player.id] = {
        checked_at: checkedAt,
        status: "team-page-only",
        source,
        lookup: {
          checked_at: checkedAt,
          status: "team-page-only",
          method: "existing-link",
          candidate_urls: [transfermarktLink.url]
        },
        history: [],
        history_points: 0,
        current: null,
        peak: null,
        last_change_date: null,
        alternatives: []
      };
      continue;
    }

    const payload = await readApiPayload(tempDir, player.id);
    if (!payload?.data) {
      marketValues[player.id] = {
        checked_at: checkedAt,
        status: "fetch-error",
        source,
        lookup: {
          checked_at: checkedAt,
          status: "fetch-error",
          method: "existing-link",
          candidate_urls: [transfermarktLink.url]
        },
        history: [],
        history_points: 0,
        current: null,
        peak: null,
        last_change_date: null,
        alternatives: []
      };
      continue;
    }

    const summary = summarizeMarketValuePayload(payload);

    marketValues[player.id] = {
      checked_at: checkedAt,
      ...summary,
      source,
      lookup: {
        checked_at: checkedAt,
        status: "confirmed",
        method: "existing-link",
        candidate_urls: [transfermarktLink.url]
      },
      alternatives: [],
      last_success_at: checkedAt
    };
  }

  return {
    meta: {
      provider: "Transfermarkt",
      checked_at: checkedAt,
      api_template: API_TEMPLATE
    },
    players: Object.fromEntries(
      Object.entries(marketValues).sort(([left], [right]) => left.localeCompare(right))
    )
  };
}

async function main() {
  const [tempDir, outputPath = OUTPUT_PATH] = process.argv.slice(2);
  if (!tempDir) {
    throw new Error("Usage: node scripts/build-transfermarkt-market-values.mjs <temp-dir> [output-path]");
  }

  const snapshot = await buildSnapshot(tempDir);
  await fs.writeFile(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
  console.log(
    `Wrote ${Object.keys(snapshot.players).length} Transfermarkt market value entries to ${outputPath}.`
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await main();
}
