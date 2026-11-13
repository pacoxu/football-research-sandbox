import { buildSiteData } from "./build-site-data.mjs";
import { buildWorldCupForecast } from "./lib/world-cup-forecast.mjs";
import { syncSqlite } from "./sync-sqlite.mjs";
import { validateData } from "./validate-data.mjs";

// Date-dependent lifecycle checks (an event left "in-progress" after it ended) fail
// by default. The Pages deploy sets LIFECYCLE_CHECK=warn so stale data is reported
// in the job log without blocking unrelated fixes from being published.
await validateData(undefined, {
  lifecycle: process.env.LIFECYCLE_CHECK === "warn" ? "warn" : "error"
});
await buildWorldCupForecast();
await buildSiteData();
const databasePath = await syncSqlite();

console.log(`Prepared JSON aggregates and SQLite database at ${databasePath}`);
