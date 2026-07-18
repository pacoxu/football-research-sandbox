import { ensureDirectory, loadDataset, paths, writeJson } from "./lib/data-loader.mjs";
import { countOverseasStatuses, normalizeCountry } from "./lib/overseas-status.mjs";

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
  const generatedAt = "2026-07-18";
  const players = [...dataset.players].sort(comparePlayers);

  const overview = {
    generated_at: generatedAt,
    stats: {
      player_count: players.length,
      country_count: new Set(players.map((player) => player.country)).size,
      foreign_registration_count: players.filter(isForeignRegistration).length,
      china_overseas_status_counts: countOverseasStatuses(players)
    },
    tournaments: dataset.tournaments,
    projects: dataset.projects,
    overseas_history: dataset.overseasHistory,
    dossiers: dataset.dossiers,
    tournament_archive: dataset.tournamentArchive,
    uefa_youth_league: dataset.uefaYouthLeague,
    china_men_youth_coaches: dataset.chinaMenYouthCoaches,
    big_five_asian_coaches: dataset.bigFiveAsianCoaches,
    asian_coaches: dataset.asianCoaches,
    youth_development_systems: dataset.youthDevelopmentSystems,
    club_name_overrides: dataset.clubNameOverrides
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
