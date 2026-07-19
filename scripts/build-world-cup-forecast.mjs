import { buildWorldCupForecast } from "./lib/world-cup-forecast.mjs";

const payload = await buildWorldCupForecast();
console.log(
  `Built World Cup forecasts for ${payload.editions.length} editions and ${payload.metadata.candidate_team_count} AFC teams.`
);
