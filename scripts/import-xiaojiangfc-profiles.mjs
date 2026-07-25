import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const CHECKED_AT = "2026-07-25";
const DIRECTORY_URL = "https://www.xiaojiangfc.com/players/";
const PROFILE_BASE_URL = "https://www.xiaojiangfc.com/players/";
const DOSSIER_ID = "donglu-football-boys";
const EXPECTED_PROFILE_COUNT = 86;
const EXPECTED_EXISTING_PERSON_COUNT = 47;
const EXPECTED_NEW_PERSON_COUNT = 39;
const EXPECTED_LINKED_PLAYER_COUNT = 14;
const PROFILE_OVERRIDES = {
  "zhang-lintong": {
    birth_year: "2009",
    position: "前锋 / 中场"
  }
};

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dossiersPath = path.join(root, "data/raw/dossiers.json");
const playerDirectory = path.join(root, "data/raw/players");

function normalizeName(value) {
  return String(value ?? "")
    .normalize("NFKC")
    .replace(/（[^）]*）|\([^)]*\)/g, "")
    .replace(/[·\-\s]/g, "")
    .toLowerCase();
}

function stripParenthetical(value) {
  return String(value ?? "").replace(/（[^）]*）|\([^)]*\)/g, "").trim();
}

function extractAliases(displayName, localName) {
  const aliases = new Set([displayName, localName]);
  const match = displayName.match(/（([^）]+)）|\(([^)]+)\)/);
  const nickname = match?.[1] ?? match?.[2];
  if (nickname && nickname !== "女") aliases.add(nickname);
  return [...aliases].filter(Boolean);
}

function englishNameFromSlug(slug) {
  return slug
    .split("-")
    .map((part) => part ? `${part[0].toUpperCase()}${part.slice(1)}` : "")
    .join(" ");
}

function parseProfiles(html) {
  const pattern =
    /\{\\"slug\\":\\"([^"]+)\\",\\"name\\":\\"([^"]*)\\",\\"squad\\":\\"([^"]*)\\",\\"xiaojiangSquad\\":\\"([^"]*)\\",\\"birthYear\\":\\"([^"]*)\\",\\"position\\":\\"([^"]*)\\",\\"summary\\":\\"([^"]*)\\",\\"experience\\":\\"([^"]*)\\"/g;
  const profiles = [...html.matchAll(pattern)].map((match) => {
    const [, slug, displayName, squad, xiaojiangSquad, birthYear, position, summary, experience] = match;
    return {
      slug,
      display_name: displayName,
      local_name: stripParenthetical(displayName),
      aliases: extractAliases(displayName, stripParenthetical(displayName)),
      squad: xiaojiangSquad || squad || "未标注",
      listed_team: squad || null,
      birth_year: birthYear || null,
      position: position || null,
      summary: summary || null,
      representative_experience: experience,
      source_url: `${PROFILE_BASE_URL}${slug}/`,
      ...(PROFILE_OVERRIDES[slug] ?? {})
    };
  });

  if (profiles.length !== EXPECTED_PROFILE_COUNT) {
    throw new Error(`Expected ${EXPECTED_PROFILE_COUNT} profiles, found ${profiles.length}`);
  }
  if (new Set(profiles.map((profile) => profile.slug)).size !== profiles.length) {
    throw new Error("Duplicate xiaojiangfc profile slug");
  }
  return profiles;
}

async function loadRawPlayers() {
  const fileNames = (await fs.readdir(playerDirectory)).filter((name) => name.endsWith(".json"));
  const rows = [];
  for (const fileName of fileNames) {
    const filePath = path.join(playerDirectory, fileName);
    const players = JSON.parse(await fs.readFile(filePath, "utf8"));
    for (const player of players) rows.push({ fileName, filePath, players, player });
  }
  return rows;
}

function buildConflict(profile, linkedPlayer) {
  if (!linkedPlayer || !profile.birth_year) return [];
  const playerBirthYear = linkedPlayer.birth_date?.slice(0, 4);
  if (!playerBirthYear || playerBirthYear === profile.birth_year) return [];
  return [
    {
      field: "birth_year",
      external_value: profile.birth_year,
      site_value: playerBirthYear,
      note: `资料站目录标注为 ${profile.birth_year} 年，本站主球员库按既有来源保留 ${linkedPlayer.birth_date}；该二次资料不覆盖主库字段。`
    }
  ];
}

function buildNewPerson(profile, playerId = null) {
  return {
    id: `${DOSSIER_ID}-${profile.local_name}`,
    ...(playerId ? { player_id: playerId } : {}),
    name: englishNameFromSlug(profile.slug),
    local_name: profile.local_name,
    role: profile.position || "未标注",
    note: profile.representative_experience,
    current_status: {
      category: "needs-review",
      organization: "待核实",
      role: "player",
      as_of: CHECKED_AT,
      confidence: "low",
      source_label: `现状复核入口：中国足球小将资料站人物页`,
      source_url: profile.source_url,
      notes: "该二次资料页可作为人物与项目公开关联的检索入口，但不足以单独证明当前注册、完整出生日期或正式比赛数据。"
    }
  };
}

function buildExternalLink(profile) {
  return {
    type: "profile",
    label: `中国足球小将资料站：${profile.local_name}`,
    url: profile.source_url,
    checked_at: CHECKED_AT,
    note: "二次公开资料索引；可补充项目身份与成长线索，但不单独作为当前注册、完整出生日期或正式比赛数据的强证明。"
  };
}

async function main() {
  const sourcePath = process.argv[2];
  if (!sourcePath) {
    throw new Error("Usage: node scripts/import-xiaojiangfc-profiles.mjs /path/to/players-page.html");
  }

  const html = await fs.readFile(sourcePath, "utf8");
  const sourceProfiles = parseProfiles(html);
  const dossiers = JSON.parse(await fs.readFile(dossiersPath, "utf8"));
  const dossier = dossiers.find((item) => item.id === DOSSIER_ID);
  if (!dossier) throw new Error(`Missing dossier ${DOSSIER_ID}`);

  const rawPlayerRows = await loadRawPlayers();
  const playerByName = new Map();
  for (const row of rawPlayerRows) {
    const names = [
      row.player.local_name,
      row.player.names?.zh,
      row.player.name
    ].map(normalizeName).filter(Boolean);
    for (const name of names) {
      if (!playerByName.has(name)) playerByName.set(name, row);
    }
  }

  const personByName = new Map(
    dossier.people.map((person) => [normalizeName(person.local_name), person])
  );
  let existingPersonCount = 0;
  let newPersonCount = 0;
  const touchedPlayerFiles = new Map();

  const externalProfiles = sourceProfiles.map((profile) => {
    const nameKey = normalizeName(profile.local_name);
    const playerRow = playerByName.get(nameKey);
    let person = personByName.get(nameKey);
    if (!person) {
      person = buildNewPerson(profile, playerRow?.player.id);
      dossier.people.push(person);
      personByName.set(nameKey, person);
    }
    const dossierPersonStatus =
      person.current_status?.source_url === profile.source_url ? "added" : "existing";
    if (dossierPersonStatus === "existing") existingPersonCount += 1;
    else newPersonCount += 1;

    if (playerRow) {
      person.player_id = playerRow.player.id;
      const links = playerRow.player.external_links ?? [];
      if (!links.some((link) => link.url === profile.source_url)) {
        links.push(buildExternalLink(profile));
        playerRow.player.external_links = links;
        touchedPlayerFiles.set(playerRow.filePath, playerRow.players);
      }
    }

    return {
      id: profile.slug,
      person_id: person.id,
      dossier_person_status: dossierPersonStatus,
      ...(playerRow ? { player_id: playerRow.player.id } : {}),
      display_name: profile.display_name,
      aliases: profile.aliases,
      squad: profile.squad,
      listed_team: profile.listed_team,
      birth_year: profile.birth_year,
      position: profile.position,
      summary: profile.summary,
      representative_experience: profile.representative_experience,
      source_url: profile.source_url,
      checked_at: CHECKED_AT,
      verification_status: "needs-review",
      verification_note: "资料站为公开信息二次整理入口；页面字段仅按其公开口径展示，未回溯到独立原始来源的内容不进入本站强事实字段。",
      conflicts: buildConflict(profile, playerRow?.player)
    };
  });

  const linkedPlayerCount = externalProfiles.filter((profile) => profile.player_id).length;
  if (existingPersonCount !== EXPECTED_EXISTING_PERSON_COUNT) {
    throw new Error(`Expected ${EXPECTED_EXISTING_PERSON_COUNT} existing people, found ${existingPersonCount}`);
  }
  if (newPersonCount !== EXPECTED_NEW_PERSON_COUNT) {
    throw new Error(`Expected ${EXPECTED_NEW_PERSON_COUNT} new people, found ${newPersonCount}`);
  }
  if (linkedPlayerCount !== EXPECTED_LINKED_PLAYER_COUNT) {
    throw new Error(`Expected ${EXPECTED_LINKED_PLAYER_COUNT} linked players, found ${linkedPlayerCount}`);
  }
  if (dossier.people.length !== 125) {
    throw new Error(`Expected 125 dossier people after import, found ${dossier.people.length}`);
  }

  dossier.external_player_profiles = externalProfiles;
  dossier.last_reviewed = CHECKED_AT;
  dossier.source_checked_at = CHECKED_AT;
  dossier.headline_stats.tracked_players = dossier.people.length;
  dossier.headline_stats.needs_review_people = dossier.people.filter(
    (person) => person.current_status?.category === "needs-review"
  ).length;

  if (!dossier.supporting_documents.some((source) => source.path === DIRECTORY_URL)) {
    dossier.supporting_documents.push({
      title: "中国足球小将资料站：球员目录",
      path: DIRECTORY_URL,
      summary: "2026-07-25 抓取的 86 人公开目录快照；只作为人物资料索引与待回溯线索，不单独覆盖本站的注册、生日或比赛强事实。"
    });
  }

  await fs.writeFile(dossiersPath, `${JSON.stringify(dossiers, null, 2)}\n`);
  for (const [filePath, players] of touchedPlayerFiles) {
    await fs.writeFile(filePath, `${JSON.stringify(players, null, 2)}\n`);
  }

  console.log(
    `Imported ${externalProfiles.length} profiles: ${existingPersonCount} existing people, ` +
    `${newPersonCount} new people, ${linkedPlayerCount} linked main players, ` +
    `${touchedPlayerFiles.size} player files updated.`
  );
}

await main();
