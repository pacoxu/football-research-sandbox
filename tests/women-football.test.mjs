import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { loadDataset } from "../scripts/lib/data-loader.mjs";
import { validateWomenFootball } from "../scripts/lib/women-football.mjs";

const payload = JSON.parse(await readFile(new URL("../data/raw/women-football.json", import.meta.url), "utf8"));
const page = await readFile(new URL("../women.html", import.meta.url), "utf8");

test("keeps the U17 women's World Cup separate from the men's archive", () => {
  validateWomenFootball(payload);
  assert.equal(payload.u17_world_cup.editions.at(-1).status, "completed");
  assert.equal(payload.u17_world_cup.editions.at(-1).champion, "Nigeria");
  assert.equal(payload.u17_world_cup.editions.at(-1).runner_up, "Japan");
  assert.equal(payload.u17_world_cup.editions.at(-1).final_score, "2-1");
  const completedChina = payload.u17_world_cup.editions.filter(
    (edition) => edition.status === "completed" && edition.china_stage !== "not-in-finals"
  );
  assert.deepEqual(
    completedChina.map((edition) => [edition.year, edition.china_stage]),
    [
      [2012, "group-stage"],
      [2014, "group-stage"],
      [2022, "group-stage"],
      [2025, "round-of-16"],
      [2026, "quarter-final"]
    ]
  );
});

test("records the 2026 quarter-final loss to Brazil", () => {
  const matches = payload.u17_world_cup.china_2026.matches;
  assert.equal(matches.filter((match) => match.played).length, 5);
  const quarterFinal = matches.find((match) => match.stage === "quarter-final");
  assert.equal(quarterFinal.played, true);
  assert.equal(quarterFinal.scoreline, "1-2");
  assert.equal(quarterFinal.opponent, "Brazil");
  assert.equal(quarterFinal.decided_by, "regulation");
  assert.equal(payload.u17_world_cup.editions.at(-1).china_stage, "quarter-final");
});

test("splits women's big five from Swiss, Portuguese and NWSL spells", () => {
  const stages = payload.players.flatMap((player) => player.stages);
  assert.equal(stages.some((stage) => stage.league_id === "frauen-bundesliga"), false);
  assert.equal(stages.find((stage) => stage.id === "zhang-linyan-grasshoppers").bucket, "europe-other");
  assert.equal(stages.find((stage) => stage.id === "wang-shuang-louisville-2022").bucket, "americas");
  assert.equal(stages.find((stage) => stage.id === "shao-ziqin-benfica-2026").bucket, "europe-other");
  assert.equal(stages.find((stage) => stage.id === "yang-lina-serie-a-2026").club, null);
  assert.match(payload.scope_note.zh, /女子五大联赛/);
});

test("publishes a women's page and loads the topic into site data", async () => {
  assert.match(page, /data-page="women"/);
  assert.match(page, /href="\.\/women\.html"/);
  const dataset = await loadDataset();
  assert.equal(dataset.womenFootball.checked_at, "2026-11-13");
  assert.equal(dataset.womenFootball.players.length, 9);
});
