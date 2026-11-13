import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { getTournamentPhase, pickFocusTournament, TOURNAMENT_PHASE } from "../assets/home-focus.js";
import { formatIsoDate, getLocalIsoDate } from "../assets/dates.js";

const overview = JSON.parse(
  await readFile(new URL("../data/site/overview.json", import.meta.url), "utf8")
);
const focusLevels = new Map(overview.tournaments.map((entry) => [entry.id, entry.focus_level]));
const getFocusRank = (tournament) =>
  ({ primary: 0, reference: 1 })[focusLevels.get(tournament.id)] ?? 2;

test("picks a focus tournament from the real archive without throwing on null dates", () => {
  const undated = overview.tournament_archive.filter(
    (entry) => entry.date_range?.start === null || entry.date_range?.end === null
  );
  for (const today of ["2026-07-01", "2026-09-03", "2026-11-13", "2026-11-25", "2027-01-15", "2031-01-01"]) {
    assert.doesNotThrow(() => pickFocusTournament(overview.tournament_archive, { today, getFocusRank }));
    assert.doesNotThrow(() =>
      pickFocusTournament([...overview.tournament_archive, ...undated], { today, getFocusRank })
    );
  }
});

test("shows the U-17 World Cup before it starts and while it runs", () => {
  const before = pickFocusTournament(overview.tournament_archive, { today: "2026-11-13", getFocusRank });
  const during = pickFocusTournament(overview.tournament_archive, { today: "2026-11-25", getFocusRank });
  assert.equal(before?.id, "fifa-u17-world-cup-2026");
  assert.equal(during?.id, "fifa-u17-world-cup-2026");
});

test("never keeps a finished event in the current slot because of a stale status", () => {
  const stale = { id: "stale", status: "ongoing", date_range: { start: "2026-07-05", end: "2026-07-11" } };
  const undated = { id: "tbc", status: "upcoming", date_range: { start: null, end: null } };
  assert.equal(getTournamentPhase(stale, "2026-11-13"), TOURNAMENT_PHASE.past);
  assert.equal(getTournamentPhase(undated, "2026-11-13"), TOURNAMENT_PHASE.upcoming);
  assert.equal(pickFocusTournament([stale, undated], { today: "2026-11-13" }).id, "tbc");
  assert.equal(pickFocusTournament([], { today: "2026-11-13" }), null);
});

test("keeps ISO calendar dates on the same day in every time zone", () => {
  const previous = process.env.TZ;
  try {
    for (const zone of ["America/Denver", "America/Los_Angeles", "Asia/Shanghai", "UTC"]) {
      process.env.TZ = zone;
      assert.match(formatIsoDate("2025-12-30", { locale: "zh-CN", language: "zh" }), /30/);
      assert.match(formatIsoDate("2026-07-05", { locale: "en-US", language: "en" }), /Jul 5, 2026/);
    }
  } finally {
    process.env.TZ = previous;
  }
  assert.equal(formatIsoDate(null), "-");
});

test("derives today's date from the visitor's local calendar", () => {
  const instant = new Date("2026-11-14T03:00:00Z");
  assert.match(getLocalIsoDate(instant), /^2026-11-1[34]$/);
});
