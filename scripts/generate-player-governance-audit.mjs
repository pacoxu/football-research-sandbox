import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const playersDir = path.join(root, "data/raw/players");
const overridesPath = path.join(root, "data/raw/player-name-overrides.json");
const checkedAt = "2026-07-19";
const targetCountries = new Set(["China PR", "Japan", "Korea Republic", "Uzbekistan"]);

const associationAuditSources = {
  "China PR": {
    label: "Chinese Football Association national-team and registration archives",
    url: "https://www.thecfa.cn/"
  },
  Japan: {
    label: "Japan Football Association national-team player archives",
    url: "https://www.jfa.jp/national_team/"
  },
  "Korea Republic": {
    label: "Korea Football Association national-team news archive",
    url: "https://www.kfa.or.kr/"
  },
  Uzbekistan: {
    label: "Uzbekistan Football Association news archive",
    url: "https://ufa.uz/"
  }
};

function hasNativeScript(country, value) {
  const text = String(value ?? "");
  if (country === "China PR") return /[\u3400-\u9fff]/u.test(text);
  if (country === "Japan") return /[\u3040-\u30ff\u3400-\u9fff]/u.test(text);
  if (country === "Korea Republic") return /[\uac00-\ud7af]/u.test(text);
  if (country === "Uzbekistan") return /[\u0400-\u04ff]/u.test(text) || /[ʻʼ‘’]/u.test(text);
  return false;
}

function languageTag(country, value) {
  if (country === "China PR") return "zh-Hans";
  if (country === "Japan") return "ja-Jpan";
  if (country === "Korea Republic") return "ko-Kore";
  if (country === "Uzbekistan") return /[\u0400-\u04ff]/u.test(value) ? "uz-Cyrl" : "uz-Latn";
  return null;
}

function isNativeCapableOfficialUrl(country, url) {
  const value = String(url ?? "").toLowerCase();
  if (value.includes("assets.the-afc.com") || value.includes("the-afc.com")) return false;
  if (country === "China PR") {
    return /thecfa\.cn|\.gov\.cn|\.edu\.cn/.test(value) && !/\/eng\/|global\./.test(value);
  }
  if (country === "Japan") {
    return (
      /jfa\.jp|jleague\.jp|fctokyo\.co\.jp|frontale\.co\.jp|antlers\.co\.jp|urawa-reds\.co\.jp/.test(value) &&
      !/\/eng\//.test(value)
    );
  }
  if (country === "Korea Republic") return /kfa\.or\.kr|kleague\.com|gimcheonfc\.com/.test(value);
  if (country === "Uzbekistan") return /ufa\.uz|pfl\.uz/.test(value);
  return false;
}

function sourceLayerType(country, url) {
  const value = url.toLowerCase();
  if (/thecfa\.cn|jfa\.jp|kfa\.or\.kr|ufa\.uz/.test(value)) return "national-fa-profile";
  if (/jleague\.jp|kleague\.com|pfl\.uz/.test(value)) return "league-registration";
  return country === "China PR" && /\.edu\.cn/.test(value) ? "school-profile" : "club-profile";
}

function findNativeSource(player) {
  const candidates = [
    ...(player.source_layers ?? []).map((layer) => ({
      label: layer.label,
      url: layer.url,
      checked_at: layer.checked_at
    })),
    ...(player.external_links ?? []).map((link) => ({ label: link.label, url: link.url }))
  ];
  return candidates.find((source) => isNativeCapableOfficialUrl(player.country, source.url));
}

function classifyOrganization(player) {
  const name = player.registration_club.name;
  if (/football school|足球学校/i.test(name)) return "football-school";
  if (/high school|middle school|affiliated.*school|school$/i.test(name)) return "high-school";
  if (/university/i.test(name)) return "university";
  if (/sangmu/i.test(name)) return "military-service-club";
  if (/\bu-?\d{2}\b|youth|juvenil|academy|reserve|junior|training center/i.test(name)) {
    return "club-academy";
  }
  const seniorParticipation = (player.tournament_participation ?? []).some(
    (entry) =>
      entry.competition_level?.startsWith("senior-") &&
      Number.isInteger(entry.appearances) &&
      entry.appearances > 0
  );
  const currentOfficialLayer = (player.source_layers ?? []).some(
    (layer) =>
      ["league-registration", "club-profile"].includes(layer.type) &&
      (layer.fields ?? []).includes("registration_club") &&
      /current|registration/i.test(layer.claim ?? "")
  );
  return seniorParticipation || currentOfficialLayer
    ? "professional-club"
    : "professional-club-unspecified";
}

const overrides = JSON.parse(await fs.readFile(overridesPath, "utf8"));
const files = (await fs.readdir(playersDir)).filter((file) => file.endsWith(".json")).sort();
let targetCount = 0;
let verifiedCount = 0;
let organizationCount = 0;

for (const file of files) {
  const filePath = path.join(playersDir, file);
  const players = JSON.parse(await fs.readFile(filePath, "utf8"));
  let changed = false;
  for (const player of players) {
    if (!targetCountries.has(player.country)) continue;
    targetCount += 1;
    const existing = overrides[player.id] ?? {};
    const candidate = existing.native ?? (hasNativeScript(player.country, player.local_name) ? player.local_name : null);
    const source = candidate ? findNativeSource(player) : null;
    const verified = Boolean(candidate && source);
    const next = { ...existing };
    if (verified) {
      next.native = candidate;
      if (player.country === "Japan") next.ja = candidate;
      if (player.country === "Korea Republic") next.ko = candidate;
      next.native_verification = {
        status: "verified",
        language_tag: languageTag(player.country, candidate),
        checked_at: checkedAt,
        sources: [
          {
            type: sourceLayerType(player.country, source.url),
            label: source.label,
            url: source.url,
            checked_at: source.checked_at ?? player.verification.last_checked,
            confidence: "high",
            fields: [
              "names.native",
              ...(player.country === "Japan" ? ["names.ja"] : []),
              ...(player.country === "Korea Republic" ? ["names.ko"] : []),
              ...(player.country === "China PR" ? ["names.zh"] : [])
            ],
            claim: `${source.label} confirms the official local-script spelling ${candidate} for ${player.name}.`
          }
        ],
        attempts: [],
        notes: "Local spelling is retained only because an independent association, league, club, school, or government source is attached."
      };
      verifiedCount += 1;
    } else {
      delete next.native;
      delete next.ja;
      delete next.ko;
      next.native_verification = {
        status: "unresolved",
        language_tag: null,
        checked_at: checkedAt,
        sources: [],
        attempts: [{ ...associationAuditSources[player.country], checked_at: checkedAt }],
        notes:
          "No independent official source captured an unambiguous local spelling for this player. The registered Latin name remains in use; no transliteration is inferred."
      };
    }
    overrides[player.id] = next;

    if (!player.registration_club.organization_type) {
      player.registration_club.organization_type = classifyOrganization(player);
      organizationCount += 1;
      changed = true;
    }
    for (const step of player.training_pathway ?? []) {
      if (
        step.organization === player.registration_club.name &&
        step.organization_type !== player.registration_club.organization_type
      ) {
        step.organization_type = player.registration_club.organization_type;
        changed = true;
      }
    }
  }
  if (changed) await fs.writeFile(filePath, `${JSON.stringify(players, null, 2)}\n`, "utf8");
}

const sortedOverrides = Object.fromEntries(Object.entries(overrides).sort(([left], [right]) => left.localeCompare(right)));
await fs.writeFile(overridesPath, `${JSON.stringify(sortedOverrides, null, 2)}\n`, "utf8");
console.log(
  `Audited ${targetCount} target players: ${verifiedCount} verified native names, ${targetCount - verifiedCount} unresolved, ${organizationCount} registration organization types added.`
);
