import assert from "node:assert/strict";
import test from "node:test";
import { DatabaseSync } from "node:sqlite";

import { syncSqlite } from "../scripts/sync-sqlite.mjs";

test("SQLite sync preserves optional China fields as null", async () => {
  const databasePath = await syncSqlite();
  const db = new DatabaseSync(databasePath, { readOnly: true });

  try {
    const rows = db
      .prepare(`
        SELECT id, china_status, china_summary
        FROM tournament_archive
        WHERE id IN ('jiangsu-city-league-2025', 'jiangsu-city-league-2026')
        ORDER BY id
      `)
      .all();

    assert.deepEqual(rows.map((row) => ({ ...row })), [
      {
        id: "jiangsu-city-league-2025",
        china_status: null,
        china_summary: null
      },
      {
        id: "jiangsu-city-league-2026",
        china_status: null,
        china_summary: null
      }
    ]);
  } finally {
    db.close();
  }
});
