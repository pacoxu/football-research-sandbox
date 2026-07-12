import assert from "node:assert/strict";
import test from "node:test";
import {
  namesMatch,
  normalizeMarketValueHistory,
  preservePreviousOnFailure,
  summarizeMarketValuePayload,
  verifyTransfermarktIdentity
} from "../scripts/lib/market-values.mjs";

function marketValue(value, determined) {
  return { value, currency: "EUR", determined };
}

test("normalizes, sorts, and deduplicates complete market value history", () => {
  const payload = {
    data: {
      current: { marketValue: marketValue(300_000, "2026-06-01") },
      history: [
        { clubId: "2", seasonId: 2025, age: 18, marketValue: marketValue(300_000, "2026-06-01") },
        { clubId: "1", seasonId: 2024, age: 17, marketValue: marketValue(100_000, "2025-01-01") },
        { clubId: "2", seasonId: 2025, age: 18, marketValue: marketValue(300_000, "2026-06-01") }
      ]
    }
  };

  const history = normalizeMarketValueHistory(payload);
  assert.equal(history.length, 2);
  assert.deepEqual(history.map((point) => point.date), ["2025-01-01", "2026-06-01"]);
  assert.equal(history[0].club_id, "1");
  assert.equal(history[0].season_id, 2024);
  assert.equal(history[0].age, 17);
});

test("derives current and the first occurrence of the peak", () => {
  const payload = {
    data: {
      current: { marketValue: marketValue(200_000, "2026-01-01") },
      history: [
        { marketValue: marketValue(300_000, "2024-01-01") },
        { marketValue: marketValue(300_000, "2025-01-01") }
      ]
    }
  };

  const result = summarizeMarketValuePayload(payload);
  assert.equal(result.status, "available");
  assert.equal(result.current.eur, 200_000);
  assert.equal(result.peak.date, "2024-01-01");
  assert.equal(result.history_points, 3);
});

test("handles valid responses with no published valuation", () => {
  const result = summarizeMarketValuePayload({ data: { current: null, history: [] } });
  assert.equal(result.status, "no-market-value");
  assert.deepEqual(result.history, []);
  assert.equal(result.current, null);
  assert.equal(result.peak, null);
});

test("preserves the last successful series after a transient fetch failure", () => {
  const previous = {
    checked_at: "2026-06-01",
    status: "available",
    history: [{ eur: 100_000, currency: "EUR", display: "€100k", date: "2026-05-01" }],
    history_points: 1,
    current: { eur: 100_000, currency: "EUR", display: "€100k", date: "2026-05-01" },
    peak: { eur: 100_000, currency: "EUR", display: "€100k", date: "2026-05-01" },
    source: { provider: "Transfermarkt", profile_url: "https://example.test/old" },
    alternatives: []
  };
  const next = {
    checked_at: "2026-07-12",
    source: { provider: "Transfermarkt", profile_url: "https://example.test/new" },
    lookup: { status: "confirmed" }
  };

  const result = preservePreviousOnFailure(previous, next, "HTTP 429");
  assert.equal(result.status, "stale");
  assert.equal(result.history_points, 1);
  assert.equal(result.source.profile_url, "https://example.test/new");
  assert.equal(result.refresh_error, "HTTP 429");
});

test("rejects malformed payloads without inventing values", () => {
  const result = summarizeMarketValuePayload({ data: { current: { marketValue: { value: "100000" } }, history: [{}] } });
  assert.equal(result.status, "no-market-value");
  assert.equal(result.history_points, 0);
});

test("matches inverted names and requires birthday, nationality, and supporting identity", () => {
  const player = {
    name: "Liu Shaoziyang",
    local_name: "刘邵子洋",
    country: "China PR",
    birth_date: "2003-12-11",
    primary_position: "Goalkeeper"
  };
  const profile = {
    name: "Shaoziyang Liu",
    lifeDates: { dateOfBirth: "2003-12-11" },
    nationalityDetails: { nationalities: { nationalityId: 34, secondNationalityId: 0 } },
    attributes: { positionGroup: "GOALKEEPER" }
  };

  assert.equal(namesMatch(player, profile), true);
  assert.equal(verifyTransfermarktIdentity(player, profile, { "China PR": [34] }).accepted, true);
  assert.equal(
    verifyTransfermarktIdentity({ ...player, birth_date: "2003-12-12" }, profile, { "China PR": [34] }).accepted,
    false
  );
});

test("matches hyphenated East Asian names when surname order is inverted", () => {
  const player = { name: "Kang Seongjin" };
  const profile = { name: "Seong-jin Kang" };
  assert.equal(namesMatch(player, profile), true);
});
