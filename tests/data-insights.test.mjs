import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  buildCoachCatalog,
  buildProjectCatalog,
  buildU20Honours,
  buildYouthSystemComparison,
  deriveQualityStatus,
  getSourceTier
} from "../assets/data-insights.js";

const overview = JSON.parse(
  await readFile(new URL("../data/site/overview.json", import.meta.url), "utf8")
);

test("builds the six-country pathway comparison without ranking countries", () => {
  const comparison = buildYouthSystemComparison(overview);
  assert.deepEqual(comparison.map((entry) => entry.country), ["China PR", "Japan", "Korea Republic", "Norway", "Denmark", "Sweden"]);
  assert.equal(comparison.reduce((total, entry) => total + entry.system_nodes, 0), 32);
  assert.ok(comparison.every((entry) => entry.source_count > 0 && entry.checked_at));
});

test("counts only completed 1985-2025 U20 editions in separate honours tables", () => {
  const honours = buildU20Honours(overview);
  assert.equal(honours.fifa.editions, 20);
  assert.equal(honours.afc.editions, 20);
  for (const group of [honours.fifa, honours.afc]) {
    assert.equal(group.rows.reduce((total, row) => total + row.titles, 0), group.editions);
    assert.equal(group.rows.reduce((total, row) => total + row.runner_ups, 0), group.editions);
  }
});

test("builds dynamic project and deduplicated coach directories", () => {
  const projects = buildProjectCatalog(overview);
  const coaches = buildCoachCatalog(overview);
  assert.equal(projects.length, 40);
  assert.equal(new Set(projects.map((entry) => entry.id)).size, projects.length);
  assert.ok(!projects.some((entry) => entry.record_id === "east-asia-overseas-history"));
  assert.equal(new Set(coaches.map((entry) => entry.record_id)).size, coaches.length);
  assert.ok(coaches.some((entry) => entry.record_id === "antonio-puche" && entry.categories.includes("china-national-youth")));
  const mergedCoach = coaches.find((entry) => entry.record_id === "cn-zhou-haibin-shandong-2007");
  assert.ok(mergedCoach.categories.includes("youth-development"));
  assert.ok(mergedCoach.categories.includes("china-national-youth"));
  assert.ok(mergedCoach.periods.length >= 2);

  const expanded = structuredClone(overview);
  expanded.youth_development_systems.systems[0].competitions.push({
    id: "future-programme",
    name: { zh: "后续项目", en: "Future programme" },
    competition_type: "talent-development-program",
    age_band: "u15",
    organization_types: ["club-academy"],
    stable_structure: { zh: "测试", en: "Test" },
    source_url: "https://example.com/programme"
  });
  expanded.china_youth_development_coaches.coaches.push({
    id: "future-coach",
    name: { zh: "后续教练", en: "Future Coach" },
    nationality: "China PR",
    organization: { name: "Future Academy" },
    role: "Coach",
    age_bands: ["u15"],
    period: { start: "2026", end: null },
    source_links: [{ label: "Official", url: "https://example.com/coach", type: "official" }],
    verification: { status: "verified", last_checked: "2026-07-19" }
  });
  assert.equal(buildProjectCatalog(expanded).length, projects.length + 1);
  assert.equal(buildCoachCatalog(expanded).length, coaches.length + 1);
});

test("applies source tiers and quality precedence without hiding weak records", () => {
  assert.equal(getSourceTier({ type: "official" }), 1);
  assert.equal(getSourceTier({ url: "https://en.wikipedia.org/wiki/Test" }), 5);
  assert.equal(getSourceTier({ type: "unknown" }), null);
  assert.equal(deriveQualityStatus({ stale: true, missingFields: ["source"] }), "stale");
  assert.equal(deriveQualityStatus({ verificationStatus: "needs-review", sources: [{ source_tier: 1 }] }), "needs-review");
  assert.equal(deriveQualityStatus({ missingFields: ["record"], sources: [{ source_tier: 1 }] }), "partial");
  assert.equal(deriveQualityStatus({ verificationStatus: "mixed-source", sources: [{ source_tier: 1 }] }), "mixed");
  assert.equal(deriveQualityStatus({ sources: [{ source_tier: 1 }] }), "complete");
});
