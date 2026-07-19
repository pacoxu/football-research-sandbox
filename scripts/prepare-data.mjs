import { buildSiteData } from "./build-site-data.mjs";
import { buildWorldCupForecast } from "./lib/world-cup-forecast.mjs";
import { syncSqlite } from "./sync-sqlite.mjs";
import { validateData } from "./validate-data.mjs";

await validateData();
await buildWorldCupForecast();
await buildSiteData();
const databasePath = await syncSqlite();

console.log(`Prepared JSON aggregates and SQLite database at ${databasePath}`);
