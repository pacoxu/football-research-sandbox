import { ensureDirectory, loadDataset, paths, writeJson } from "./lib/data-loader.mjs";

function normalizeCountry(value) {
  const normalized = String(value ?? "").trim().toLowerCase();
  const aliases = {
    "china pr": "china",
    "people's republic of china": "china",
    "korea republic": "south korea",
    "republic of korea": "south korea"
  };

  return aliases[normalized] ?? normalized;
}

function isForeignRegistration(player) {
  return (
    player.registration_club?.country &&
    player.country &&
    normalizeCountry(player.registration_club.country) !== normalizeCountry(player.country)
  );
}

function comparePlayers(left, right) {
  if (left.country !== right.country) {
    return left.country.localeCompare(right.country, "zh-CN");
  }

  return left.birth_date.localeCompare(right.birth_date);
}

export async function buildSiteData() {
  const dataset = await loadDataset();
  const generatedAt = "2026-05-22";
  const players = [...dataset.players].sort(comparePlayers);

  const overview = {
    generated_at: generatedAt,
    stats: {
      player_count: players.length,
      country_count: new Set(players.map((player) => player.country)).size,
      foreign_registration_count: players.filter(isForeignRegistration).length
    },
    tournaments: dataset.tournaments,
    projects: dataset.projects,
    overseas_history: dataset.overseasHistory,
    dossiers: dataset.dossiers
  };

  await ensureDirectory(paths.site);
  await writeJson(`${paths.site}/players.json`, players);
  await writeJson(`${paths.site}/overview.json`, overview);

  return {
    players,
    overview
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = await buildSiteData();
  console.log(
    `Built site data with ${result.players.length} players and ${result.overview.tournaments.length} tournament snapshots.`
  );
}
