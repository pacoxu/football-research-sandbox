import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const repositoryRoot = new URL("../", import.meta.url);

async function readJson(path) {
  return JSON.parse(await readFile(new URL(path, repositoryRoot), "utf8"));
}

test("keeps historical trials separate from signed overseas records", async () => {
  const history = await readJson("data/raw/overseas-history.json");
  const china = history.countries.find((country) => country.country === "China PR");
  const trials = china.historical_trial_records;

  assert.deepEqual(
    trials.map(({ id }) => id),
    ["wang-dalei-inter-2006-trial", "zhang-wenzhao-inter-2006-trial"]
  );
  for (const trial of trials) {
    assert.equal(trial.status, "historical-trial-only");
    assert.equal(trial.signed, false);
    assert.equal(trial.registration_changed, false);
    assert.ok(trial.source_links.length > 0);
  }
});

test("records Zeng Cheng's Indonesia spell as a verified loan", async () => {
  const history = await readJson("data/raw/overseas-history.json");
  const china = history.countries.find((country) => country.country === "China PR");
  const zengCheng = china.featured_records.find(
    (record) => record.id === "zeng-cheng-persebaya-2005"
  );

  assert.equal(china.verified_records, china.featured_records.length);
  assert.equal(zengCheng.local_name, "曾诚");
  assert.equal(zengCheng.club, "Persebaya Surabaya");
  assert.equal(zengCheng.bucket, "asia-other");
  assert.equal(zengCheng.season, "2005");
  assert.equal(zengCheng.appearances, 25);
  assert.equal(zengCheng.competitive_debut, true);
  assert.ok(zengCheng.source_links.some(({ type }) => type === "club"));
  assert.ok(zengCheng.source_links.some(({ type }) => type === "stats"));
});

test("exposes verified return and trial candidates in the lineup builder", async () => {
  const players = await readJson("data/raw/players/china-u23-2026.json");
  const liHao = players.find((player) => player.id === "cn-li-hao-2004");
  const lineupSource = await readFile(new URL("assets/lineup.js", repositoryRoot), "utf8");

  assert.equal(liHao.overseas_status, "returned");
  assert.ok(liHao.training_pathway.some(({ stage_label }) => stage_label === "2016 马德里竞技青训"));
  assert.match(lineupSource, /id: "cn-li-hao"[^\n]+era: "returned"/);
  assert.match(lineupSource, /id: "cn-zeng-cheng"[^\n]+position: "GK"[^\n]+era: "history"/);
  assert.match(lineupSource, /id: "cn-wang-dalei-trial"[^\n]+era: "trial"/);
  assert.match(lineupSource, /id: "cn-zhang-wenzhao-trial"[^\n]+era: "trial"/);
  assert.match(lineupSource, /trial: \{ badge: "试训", countLabel: "试训" \}/);
});
