import assert from "node:assert/strict";
import fs from "node:fs/promises";
import test from "node:test";

const targetIds = [
  "donglu-football-boys", "wanda-spain-plan", "genbao-football-base",
  "evergrande-football-school", "luneng-football-school",
  "olympic-stars-germany", "500-star-portugal"
];

const dossiers = JSON.parse(await fs.readFile(new URL("../data/raw/dossiers.json", import.meta.url), "utf8"));

test("seven youth project dossiers use normalized people and roster memberships", () => {
  for (const id of targetIds) {
    const dossier = dossiers.find((item) => item.id === id);
    assert.equal(dossier.schema_version, 2, id);
    const personIds = new Set(dossier.people.map((person) => person.id));
    assert.equal(personIds.size, dossier.people.length, `${id} unique people`);
    for (const person of dossier.people) {
      assert.ok(person.current_status?.category);
      assert.match(person.current_status?.as_of, /^\d{4}-\d{2}-\d{2}$/);
      assert.match(person.current_status?.source_url, /^https?:\/\//);
    }
    for (const view of dossier.roster_views) {
      assert.equal(view.counting.listed_count, view.members.length);
      assert.equal(view.counting.unique_people_count, new Set(view.members.map((member) => member.person_id)).size);
      assert.equal(view.counting.verified_people_count, view.members.filter((member) => member.verification_status === "verified").length);
      assert.equal(view.counting.needs_review_count, view.members.filter((member) => member.verification_status === "needs-review").length);
      view.members.forEach((member) => assert.ok(personIds.has(member.person_id)));
    }
  }
});

test("known project roster contracts stay fixed", () => {
  const contracts = [
    ["donglu-football-boys", "2014-suzhou-selection-16", 16],
    ["donglu-football-boys", "2015-announced-squad-25", 25],
    ["donglu-football-boys", "2016-manuel-cup-12", 12],
    ["olympic-stars-germany", "departure-list-2004", 27]
  ];
  for (const [dossierId, viewId, expected] of contracts) {
    const view = dossiers.find((item) => item.id === dossierId).roster_views.find((item) => item.id === viewId);
    assert.equal(view.counting.reported_count, expected);
    assert.equal(view.members.length, expected);
    assert.equal(view.counting.completeness, "complete");
  }
  const star = dossiers.find((item) => item.id === "500-star-portugal");
  const launch = star.roster_views.find((item) => item.id === "official-launch-roster-24");
  assert.equal(launch.members.length, 24);
  assert.equal(launch.counting.reported_count, 24);
  assert.match(JSON.stringify(star.program_metrics), /24/);
  assert.match(JSON.stringify(star.program_metrics), /41/);
  const wanda = dossiers.find((item) => item.id === "wanda-spain-plan");
  assert.equal(wanda.roster_views.filter((item) => /^wanda-spain-cohort-[1-5]-/.test(item.id)).length, 5);
});

test("temporary event, partner, adjacent and prediction records are excluded from verified core", () => {
  for (const dossier of dossiers.filter((item) => targetIds.includes(item.id))) {
    const eligible = new Set(dossier.roster_views.flatMap((view) => view.members)
      .filter((member) => member.verification_status === "verified")
      .filter((member) => !["tournament-only", "partner-player", "project-adjacent", "prediction-only"].includes(member.relationship))
      .map((member) => member.person_id));
    assert.equal(dossier.headline_stats.verified_core_people, eligible.size, dossier.id);
  }
  const donglu = dossiers.find((item) => item.id === "donglu-football-boys");
  assert.equal(donglu.event_records.length, 8);
  assert.ok(!donglu.people.some((person) => /Primary School|Dream Team|Chinese Football Boys/.test(person.local_name)));
});

test("dossier UI resolves member refs and project cards expose detail links", async () => {
  const app = await fs.readFile(new URL("../assets/app.js", import.meta.url), "utf8");
  assert.match(app, /dossier\.people/);
  assert.match(app, /view\.members/);
  assert.match(app, /DOSSIER_MEMBER_RELATIONSHIP_LABELS/);
  assert.match(app, /dossier\.html\?id=/);
});
