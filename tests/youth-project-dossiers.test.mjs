import assert from "node:assert/strict";
import fs from "node:fs/promises";
import test from "node:test";
import { loadDataset } from "../scripts/lib/data-loader.mjs";

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

test("Donglu dossier publishes an 86-person secondary profile index without inflating the main player library", async () => {
  const dataset = await loadDataset();
  const dossier = dossiers.find((item) => item.id === "donglu-football-boys");
  const profiles = dossier.external_player_profiles;
  const personIds = new Set(dossier.people.map((person) => person.id));
  const mainPlayerIds = new Set(dataset.players.map((player) => player.id));

  assert.equal(profiles.length, 86);
  assert.equal(dossier.people.length, 125);
  assert.equal(new Set(profiles.map((profile) => profile.id)).size, 86);
  assert.equal(new Set(profiles.map((profile) => profile.person_id)).size, 86);
  assert.equal(profiles.filter((profile) => profile.dossier_person_status === "existing").length, 47);
  assert.equal(profiles.filter((profile) => profile.dossier_person_status === "added").length, 39);
  assert.equal(profiles.filter((profile) => profile.player_id).length, 14);
  assert.ok(profiles.every((profile) => personIds.has(profile.person_id)));
  assert.ok(profiles.every((profile) => /^https:\/\/www\.xiaojiangfc\.com\/players\/[^/]+\/$/.test(profile.source_url)));
  assert.ok(profiles.every((profile) => profile.birth_year === null || /^\d{4}$/.test(profile.birth_year)));
  assert.ok(profiles.filter((profile) => profile.player_id).every((profile) => mainPlayerIds.has(profile.player_id)));

  const linkedIds = new Set(profiles.flatMap((profile) => profile.player_id ? [profile.player_id] : []));
  for (const player of dataset.players.filter((item) => linkedIds.has(item.id))) {
    assert.ok(
      player.external_links.some((link) => /^https:\/\/www\.xiaojiangfc\.com\/players\//.test(link.url)),
      `${player.id} missing xiaojiangfc profile link`
    );
  }
});

test("Zhang Lintong conflict remains explicit and does not overwrite the main birth date", async () => {
  const dataset = await loadDataset();
  const dossier = dossiers.find((item) => item.id === "donglu-football-boys");
  const profile = dossier.external_player_profiles.find((item) => item.id === "zhang-lintong");
  const player = dataset.players.find((item) => item.id === "cn-zhang-lindong-2010");

  assert.equal(profile.birth_year, "2009");
  assert.deepEqual(
    profile.conflicts.map((conflict) => [conflict.field, conflict.external_value, conflict.site_value]),
    [["birth_year", "2009", "2010"]]
  );
  assert.equal(player.birth_date, "2010-02-25");
});

test("dossier profile directory and detail route expose filters, source boundaries and main-player links", async () => {
  const [app, dossierPage, profilePage] = await Promise.all([
    fs.readFile(new URL("../assets/app.js", import.meta.url), "utf8"),
    fs.readFile(new URL("../dossier.html", import.meta.url), "utf8"),
    fs.readFile(new URL("../dossier-player.html", import.meta.url), "utf8")
  ]);

  assert.match(dossierPage, /id="dossierExternalProfileFilters"/);
  assert.match(dossierPage, /id="dossierExternalProfiles"/);
  assert.match(profilePage, /data-page="dossier-player-detail"/);
  assert.match(profilePage, /id="dossierPlayerEvidence"/);
  assert.match(app, /renderDossierExternalProfiles/);
  assert.match(app, /renderDossierPlayerDetailPage/);
  assert.match(app, /buildDossierPlayerDetailUrl/);
  assert.match(app, /profile\.conflicts/);
  assert.match(app, /linkedProjectProfile/);
});
