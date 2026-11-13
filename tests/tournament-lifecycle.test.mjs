import test from "node:test";
import assert from "node:assert/strict";
import {
  findStaleScheduledMatches,
  reportLifecycleIssues,
  validateFocusArchiveConsistency,
  validateTournamentLifecycle
} from "../scripts/validate-data.mjs";

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

test("rejects upcoming tournaments whose start date has passed", () => {
  assert.throws(
    () =>
      validateTournamentLifecycle(
        { id: "u17-cup", status: "upcoming", date_range: { start: "2026-11-19", end: "2026-12-13" } },
        "2026-11-20"
      ),
    /Started upcoming tournament: u17-cup \(upcoming, started 2026-11-19\)/
  );
  assert.doesNotThrow(() =>
    validateTournamentLifecycle(
      { id: "u17-cup", status: "upcoming", date_range: { start: "2026-11-19", end: "2026-12-13" } },
      "2026-11-19"
    )
  );
  assert.doesNotThrow(() =>
    validateTournamentLifecycle({ id: "tbc", status: "upcoming", date_range: { start: null, end: null } }, "2026-11-20")
  );
});

test("requires tournaments.json and the archive to agree on status and dates", () => {
  const focus = [{ id: "yinchuan", status: "completed", date_range: { start: "2026-07-05", end: "2026-07-11" } }];
  assert.throws(
    () => validateFocusArchiveConsistency(focus, [{ ...focus[0], status: "ongoing" }]),
    /status differs .* yinchuan \(completed vs ongoing\)/
  );
  assert.throws(
    () =>
      validateFocusArchiveConsistency(focus, [
        { ...focus[0], date_range: { start: "2026-07-05", end: "2026-07-12" } }
      ]),
    /end date differs .* yinchuan/
  );
  assert.doesNotThrow(() => validateFocusArchiveConsistency(focus, [{ ...focus[0] }]));
});

test("flags past matches that are still scheduled, unplayed or TBD", () => {
  const dataset = {
    tournamentArchive: [{ id: "a", china_matches: [{ date: "2026-07-11", opponent: "Nigeria", result: "TBD" }] }],
    tournaments: [
      { id: "b", china_group_stage: { fixtures: [{ date: "2026-09-16", opponent: "DPR Korea", status: "scheduled" }] } }
    ],
    womenFootball: { u17_world_cup: { china_2026: { matches: [{ id: "qf", date: "2026-11-01", played: false }] } } },
    chinaMenYouthCoaches: {
      senior_men_window: { latest_camp: { matches: [{ date: "2026-09-27", opponent: "New Zealand", status: "scheduled" }] } },
      team_cycles: [
        { team_label: "U17", latest_camp: { matches: [{ date: "2026-10-07", opponent: "Argentina U17", status: "reported-schedule" }] } }
      ]
    }
  };
  assert.equal(findStaleScheduledMatches(dataset, "2026-11-13").length, 5);
  assert.equal(findStaleScheduledMatches(dataset, "2026-07-01").length, 0);
});

test("reports lifecycle issues as errors by default and as warnings on request", () => {
  assert.doesNotThrow(() => reportLifecycleIssues([], "error"));
  assert.throws(() => reportLifecycleIssues(["stale one", "stale one"], "error"), /Stale lifecycle data \(1\)/);
  const original = console.warn;
  const warnings = [];
  const originalLog = console.log;
  console.warn = (message) => warnings.push(message);
  console.log = (message) => warnings.push(message);
  try {
    assert.doesNotThrow(() => reportLifecycleIssues(["stale one"], "warn"));
  } finally {
    console.warn = original;
    console.log = originalLog;
  }
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /stale one/);
});
