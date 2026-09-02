import assert from "node:assert/strict";
import fs from "node:fs/promises";
import test from "node:test";

const history = JSON.parse(
  await fs.readFile(new URL("../data/raw/overseas-history.json", import.meta.url), "utf8")
);
const collection = history.overseas_support_policies;
const byId = Object.fromEntries(collection.policies.map((policy) => [policy.id, policy]));

test("publishes the two current national overseas player support programs", () => {
  assert.equal(collection.checked_at, "2026-09-02");
  assert.deepEqual(
    collection.policies.map((policy) => policy.id),
    ["china-team-youth-inspirational-plan-2026", "future-star-overseas-youth-grant-2026"]
  );
  assert.ok(collection.policies.every((policy) => policy.source_links.length > 0));
  assert.ok(collection.policies.every((policy) => /不是|不因|不等于/.test(policy.boundary_note.zh)));
});

test("retains the Inspirational Plan formula without presenting its maximum as guaranteed", () => {
  const policy = byId["china-team-youth-inspirational-plan-2026"];
  assert.deepEqual(
    policy.support_items.map((item) => item.id),
    ["base-grant", "development-grant", "continental-reward", "one-off-living-grant"]
  );
  assert.equal(policy.support_items[0].amount_cny, 120000);
  assert.equal(policy.support_items[1].amount_cny, 120000);
  assert.equal(policy.reported_upper_bound.amount_cny, 1646000);
  assert.match(policy.reported_upper_bound.basis.zh, /理论最高值.*不是保底/);
  assert.match(policy.boundary_note.zh, /不是所有留洋球员自动领取/);
});

test("retains the Future Star application window, annual tiers and eligible-cost boundary", () => {
  const policy = byId["future-star-overseas-youth-grant-2026"];
  assert.deepEqual(policy.application_window, {
    start: "2026-09-01",
    end: "2026-09-30",
    closing_time: "17:00",
    timezone: "Asia/Shanghai",
    portal: "https://futurestar.thecfa.info"
  });
  assert.deepEqual(policy.support_items.map((item) => item.amount_cny), [450000, 350000, 250000]);
  assert.equal(policy.covered_costs.length, 3);
  assert.match(policy.target_scope.zh, /15—17 岁.*男女足球员/);
  assert.match(policy.application_note.zh, /唯一入口/);
});

test("separates club training compensation from player and family subsidies", () => {
  const boundary = collection.non_subsidy_boundaries.find(
    (item) => item.id === "training-compensation-and-solidarity"
  );
  assert.ok(boundary);
  assert.match(boundary.note.zh, /机构之间分配.*不是直接发给球员或家庭/);
});

test("renders support policies and their non-subsidy boundary on the overseas page", async () => {
  const [page, app] = await Promise.all([
    fs.readFile(new URL("../overseas.html", import.meta.url), "utf8"),
    fs.readFile(new URL("../assets/app.js", import.meta.url), "utf8")
  ]);
  assert.match(page, /id="overseasSupportPoliciesSection"/);
  assert.match(page, /id="overseasSupportPoliciesCards"/);
  assert.match(page, /id="overseasSupportPoliciesBoundary"/);
  assert.match(app, /function renderOverseasSupportPolicyCard/);
  assert.match(app, /function renderOverseasSupportBoundaryCard/);
  assert.match(app, /overseas\.support\.reportedMaximum/);
});
