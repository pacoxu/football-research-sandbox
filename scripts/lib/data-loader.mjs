import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);

export const paths = {
  root: path.resolve(currentDir, "../.."),
  raw: path.resolve(currentDir, "../../data/raw"),
  site: path.resolve(currentDir, "../../data/site"),
  storage: path.resolve(currentDir, "../../storage")
};

async function readJson(filePath) {
  const source = await fs.readFile(filePath, "utf8");
  return JSON.parse(source);
}

async function readOptionalJson(filePath, fallbackValue) {
  try {
    return await readJson(filePath);
  } catch (error) {
    if (error?.code === "ENOENT") {
      return fallbackValue;
    }
    throw error;
  }
}

async function readJsonFiles(directoryPath) {
  const entries = await fs.readdir(directoryPath, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => path.join(directoryPath, entry.name))
    .sort((left, right) => left.localeCompare(right));

  const records = await Promise.all(files.map(readJson));
  return records.flat();
}

export async function ensureDirectory(directoryPath) {
  await fs.mkdir(directoryPath, { recursive: true });
}

function hasHanScript(value) {
  return /[\u3400-\u9fff]/u.test(String(value ?? ""));
}

function hasKanaScript(value) {
  return /[\u3040-\u30ff]/u.test(String(value ?? ""));
}

function hasHangulScript(value) {
  return /[\uac00-\ud7af]/u.test(String(value ?? ""));
}

function hasCyrillicScript(value) {
  return /[\u0400-\u04ff]/u.test(String(value ?? ""));
}

function cleanName(value) {
  return String(value ?? "").trim();
}

function pickFirstName(...candidates) {
  return candidates.map(cleanName).find(Boolean) ?? "";
}

function deriveNativeName(player, override = {}) {
  const explicitNative = pickFirstName(override.native);
  if (explicitNative) {
    return explicitNative;
  }

  if (override.native_verification?.status === "unresolved") {
    return pickFirstName(override.en, player.name, player.local_name);
  }

  const localName = cleanName(player.local_name);
  const englishName = cleanName(player.name);
  const country = cleanName(player.country);

  if (country === "Japan" && (hasKanaScript(localName) || hasHanScript(localName))) {
    return localName;
  }

  if (country === "Korea Republic" && hasHangulScript(localName)) {
    return localName;
  }

  if (country === "China PR" && hasHanScript(localName)) {
    return localName;
  }

  if (country === "Uzbekistan" && hasCyrillicScript(localName)) {
    return localName;
  }

  return pickFirstName(localName, englishName);
}

function deriveChineseName(player, override = {}) {
  const explicitChinese = pickFirstName(override.zh);
  if (explicitChinese) {
    return explicitChinese;
  }

  const localName = cleanName(player.local_name);
  const englishName = cleanName(player.name);
  const country = cleanName(player.country);

  if (country === "China PR" && hasHanScript(localName)) {
    return localName;
  }

  if (country === "Japan" && hasHanScript(localName)) {
    return localName;
  }

  return pickFirstName(englishName, localName);
}

function buildPlayerNames(player, override = {}) {
  const englishName = pickFirstName(override.en, player.name, player.local_name);
  const nativeName = deriveNativeName(player, override);
  const chineseName = deriveChineseName(player, override);
  const country = cleanName(player.country);
  const japaneseName =
    country === "Japan"
      ? pickFirstName(
          override.ja,
          hasKanaScript(nativeName) || hasHanScript(nativeName) ? nativeName : ""
        )
      : "";
  const koreanName =
    country === "Korea Republic"
      ? pickFirstName(override.ko, hasHangulScript(nativeName) ? nativeName : "")
      : "";

  return {
    zh: chineseName,
    en: englishName,
    native: nativeName,
    ja: japaneseName,
    ko: koreanName
  };
}

function applyPlayerNames(players, overrides = {}) {
  return players.map((player) => {
    const override = overrides[player.id] ?? {};
    const nameSources =
      override.native_verification?.status === "verified"
        ? override.native_verification.sources ?? []
        : [];
    return {
      ...player,
      names: buildPlayerNames(player, override),
      ...(override.native_verification
        ? { name_verification: override.native_verification }
        : {}),
      source_layers: [...(player.source_layers ?? []), ...nameSources]
    };
  });
}

function applyPlayerMarketValues(players, snapshot = {}) {
  return players.map((player) => {
    const marketValue = snapshot[player.id];
    if (!marketValue) {
      return player;
    }

    return {
      ...player,
      market_value: marketValue
    };
  });
}

function applyTournamentStatistics(players, tournamentArchive = []) {
  const statisticsByPlayer = new Map();

  for (const tournament of tournamentArchive) {
    const statistics = tournament.china_player_statistics;
    if (!statistics?.players) {
      continue;
    }

    for (const row of statistics.players) {
      statisticsByPlayer.set(`${tournament.id}:${row.player_id}`, row);
    }
  }

  return players.map((player) => ({
    ...player,
    tournament_participation: player.tournament_participation.map((entry) => {
      const row = statisticsByPlayer.get(`${entry.competition_id}:${player.id}`);
      if (!row) {
        return entry;
      }

      return {
        ...entry,
        roster_status: row.roster_status,
        appearances: row.appearances,
        goals: row.goals,
        minutes: row.minutes,
        ...(row.starts !== undefined ? { starts: row.starts } : {}),
        ...(row.substitute_appearances !== undefined
          ? { substitute_appearances: row.substitute_appearances }
          : {}),
        ...(row.yellow_cards !== undefined ? { yellow_cards: row.yellow_cards } : {}),
        ...(row.red_cards !== undefined ? { red_cards: row.red_cards } : {}),
        note:
          row.note ??
          (row.substitute_appearances !== undefined
            ? `逐场比赛汇总：出场 ${row.appearances} 次、首发 ${row.starts} 次、替补 ${row.substitute_appearances} 次、${row.minutes} 分钟、${row.goals} 球、${row.yellow_cards} 黄牌、${row.red_cards} 红牌；分钟不计补时。`
            : `官方逐场 Match Summary 汇总：出场 ${row.appearances} 次、${row.minutes} 分钟、${row.goals} 球；分钟按 90 分钟制、HT=45、补时不另加。`)
      };
    })
  }));
}

export async function loadDataset() {
  const rawPlayers = await readJsonFiles(path.join(paths.raw, "players"));
  const playerNameOverrides = await readOptionalJson(
    path.join(paths.raw, "player-name-overrides.json"),
    {}
  );
  const playerMarketValues = await readOptionalJson(
    path.join(paths.raw, "player-market-values.json"),
    { meta: null, players: {} }
  );
  const clubNameOverrides = await readOptionalJson(
    path.join(paths.raw, "club-name-overrides.json"),
    {}
  );
  const tournamentArchive = await readJson(path.join(paths.raw, "tournament-archive.json"));
  const players = applyPlayerMarketValues(
    applyPlayerNames(
      applyTournamentStatistics(rawPlayers, tournamentArchive),
      playerNameOverrides
    ),
    playerMarketValues.players ?? {}
  );
  const tournaments = await readJson(path.join(paths.raw, "tournaments.json"));
  const projects = await readJson(path.join(paths.raw, "projects.json"));
  const overseasHistory = await readJson(path.join(paths.raw, "overseas-history.json"));
  const dossiers = await readJson(path.join(paths.raw, "dossiers.json"));
  const uefaYouthLeague = await readOptionalJson(
    path.join(paths.raw, "uefa-youth-league.json"),
    null
  );
  const chinaMenYouthCoaches = await readOptionalJson(
    path.join(paths.raw, "china-men-youth-coaches.json"),
    null
  );
  const chinaYouthDevelopmentCoaches = await readOptionalJson(
    path.join(paths.raw, "china-youth-development-coaches.json"),
    null
  );
  const bigFiveAsianCoaches = await readOptionalJson(
    path.join(paths.raw, "big-five-asian-coaches.json"),
    null
  );
  const asianCoaches = await readOptionalJson(
    path.join(paths.raw, "asian-coaches.json"),
    null
  );
  const youthDevelopmentSystems = await readOptionalJson(
    path.join(paths.raw, "youth-development-systems.json"),
    { schema_version: 1, checked_at: null, systems: [] }
  );

  return {
    players,
    tournaments,
    projects,
    overseasHistory,
    dossiers,
    tournamentArchive,
    uefaYouthLeague,
    chinaMenYouthCoaches,
    chinaYouthDevelopmentCoaches,
    bigFiveAsianCoaches,
    asianCoaches,
    youthDevelopmentSystems,
    clubNameOverrides
  };
}

export function writeJson(filePath, payload) {
  return fs.writeFile(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}
