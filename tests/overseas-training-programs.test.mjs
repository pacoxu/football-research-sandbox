import assert from "node:assert/strict";
import fs from "node:fs/promises";
import test from "node:test";

const history = JSON.parse(
  await fs.readFile(new URL("../data/raw/overseas-history.json", import.meta.url), "utf8")
);
const collection = history.overseas_training_programs;

test("publishes four distinct Chinese overseas training-program models", () => {
  assert.deepEqual(
    collection.programs.map((program) => program.id),
    ["jianlibao-brazil", "olympic-stars-germany", "500-star-portugal", "wanda-spain-plan"]
  );
  assert.equal(new Set(collection.programs.map((program) => program.model)).size, 4);
  assert.ok(collection.programs.every((program) => program.stages.length >= 3));
  assert.ok(collection.programs.every((program) => program.source_links.length >= 2));
});

test("retains reported cohort boundaries instead of treating training as registration", () => {
  const byId = Object.fromEntries(collection.programs.map((program) => [program.id, program]));
  assert.match(byId["jianlibao-brazil"].participant_scope.zh, /29 人/);
  assert.match(byId["jianlibao-brazil"].boundary_note.zh, /不能逐人推定.*正式注册/);
  assert.match(byId["olympic-stars-germany"].participant_scope.zh, /25\/27/);
  assert.match(byId["500-star-portugal"].participant_scope.zh, /24 人.*41 人/);
  assert.match(byId["wanda-spain-plan"].participant_scope.zh, /第六批/);
  assert.match(byId["wanda-spain-plan"].boundary_note.zh, /不等于.*一线队签约/);
});

test("links normalized dossiers and renders the training-program section", async () => {
  const dossierIds = new Set(JSON.parse(
    await fs.readFile(new URL("../data/raw/dossiers.json", import.meta.url), "utf8")
  ).map((dossier) => dossier.id));
  for (const program of collection.programs.filter((item) => item.dossier_id)) {
    assert.ok(dossierIds.has(program.dossier_id), `Unknown dossier ${program.dossier_id}`);
  }
  const [page, app] = await Promise.all([
    fs.readFile(new URL("../overseas.html", import.meta.url), "utf8"),
    fs.readFile(new URL("../assets/app.js", import.meta.url), "utf8")
  ]);
  assert.match(page, /id="overseasTrainingProgramsSection"/);
  assert.match(page, /id="overseasTrainingProgramsCards"/);
  assert.match(app, /function renderOverseasTrainingProgramCard/);
  assert.match(app, /overseas\.training\.openDossier/);
  assert.match(app, /overseas\.training\.openRoster/);
});
