import assert from "node:assert/strict";
import test from "node:test";
import {
  buildFreshnessFinding,
  exitCodeForReport,
  parseIsoDate
} from "../scripts/lib/freshness-audit.mjs";

function finding(lastChecked, reviewWindowDays) {
  return buildFreshnessFinding({
    asOf: "2026-07-19",
    entityType: "fixture",
    entityId: `${lastChecked}-${reviewWindowDays}`,
    field: "last_checked",
    lastChecked,
    reviewWindowDays,
    reason: "fixture"
  });
}

test("uses inclusive 30, 90, and 180 day freshness boundaries", () => {
  assert.equal(finding("2026-06-19", 30), null);
  assert.equal(finding("2026-06-18", 30).overdue_days, 1);
  assert.equal(finding("2026-04-20", 90), null);
  assert.equal(finding("2026-04-19", 90).overdue_days, 1);
  assert.equal(finding("2026-01-20", 180), null);
  assert.equal(finding("2026-01-19", 180).overdue_days, 1);
});

test("rejects malformed and impossible dates", () => {
  assert.throws(() => parseIsoDate("2026-7-19"), /Invalid/);
  assert.throws(() => parseIsoDate("2026-02-30"), /Invalid/);
  assert.throws(() => finding("2026-07-20", 30), /Future last_checked/);
});

test("is non-blocking by default and strict only when findings exist", () => {
  assert.equal(exitCodeForReport({ findings: [{}] }, false), 0);
  assert.equal(exitCodeForReport({ findings: [] }, true), 0);
  assert.equal(exitCodeForReport({ findings: [{}] }, true), 1);
});
