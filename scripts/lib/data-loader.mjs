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
    return {
      ...player,
      names: buildPlayerNames(player, override)
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
  const players = applyPlayerMarketValues(
    applyPlayerNames(rawPlayers, playerNameOverrides),
    playerMarketValues.players ?? {}
  );
  const tournaments = await readJson(path.join(paths.raw, "tournaments.json"));
  const projects = await readJson(path.join(paths.raw, "projects.json"));
  const overseasHistory = await readJson(path.join(paths.raw, "overseas-history.json"));
  const dossiers = await readJson(path.join(paths.raw, "dossiers.json"));
  const tournamentArchive = await readJson(path.join(paths.raw, "tournament-archive.json"));
  const chinaMenYouthCoaches = await readOptionalJson(
    path.join(paths.raw, "china-men-youth-coaches.json"),
    null
  );
  const bigFiveAsianCoaches = await readOptionalJson(
    path.join(paths.raw, "big-five-asian-coaches.json"),
    null
  );

  return {
    players,
    tournaments,
    projects,
    overseasHistory,
    dossiers,
    tournamentArchive,
    chinaMenYouthCoaches,
    bigFiveAsianCoaches,
    clubNameOverrides
  };
}

export function writeJson(filePath, payload) {
  return fs.writeFile(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}
