import test from "node:test";
import assert from "node:assert/strict";
import { validateTournamentLifecycle } from "../scripts/validate-data.mjs";

const tournament = (status, end, id = "sample-tournament") => ({
  id,
  status,
  date_range: { start: "2026-01-01", end }
});

test("rejects ongoing and in-progress tournaments after their end date", () => {
  for (const status of ["ongoing", "in-progress"]) {
    assert.throws(
      () => validateTournamentLifecycle(tournament(status, "2026-07-18"), "2026-07-19"),
      new RegExp(`Expired active tournament: sample-tournament \\(${status}, ended 2026-07-18\\)`)
    );
  }
});

test("accepts active tournaments ending today or in the future", () => {
  assert.doesNotThrow(() =>
    validateTournamentLifecycle(tournament("ongoing", "2026-07-19"), "2026-07-19")
  );
  assert.doesNotThrow(() =>
    validateTournamentLifecycle(tournament("in-progress", "2026-12-31"), "2026-07-19")
  );
});

test("does not apply the active-date rule to completed tournaments", () => {
  assert.doesNotThrow(() =>
    validateTournamentLifecycle(tournament("completed", "2020-01-01"), "2026-07-19")
  );
});

test("includes the tournament id, status and end date in lifecycle errors", () => {
  assert.throws(
    () =>
      validateTournamentLifecycle(
        tournament("ongoing", "2026-05-22", "east-asia-u21-pro-2026"),
        "2026-07-19"
      ),
    /east-asia-u21-pro-2026 \(ongoing, ended 2026-05-22\)/
  );
});
