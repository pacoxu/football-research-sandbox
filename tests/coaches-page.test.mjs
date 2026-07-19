import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { loadDataset } from "../scripts/lib/data-loader.mjs";

test("coaches page exposes development and national youth coach datasets", async () => {
  const dataset = await loadDataset();
  const page = await fs.readFile(new URL("../coaches.html", import.meta.url), "utf8");

  assert.equal(dataset.chinaYouthDevelopmentCoaches.coaches.length, 13);
  assert.equal(dataset.chinaMenYouthCoaches.team_cycles.length, 5);
  assert.match(page, /id="developmentCoachGrid"/);
  assert.match(page, /id="nationalCoachGrid"/);
  assert.match(page, /id="coachWatchlist"/);
});

test("every published coach card has a public source link", async () => {
  const dataset = await loadDataset();
  for (const coach of dataset.chinaYouthDevelopmentCoaches.coaches) {
    assert.ok(coach.source_links.length > 0, `${coach.id} has no source`);
    assert.ok(coach.source_links.every((source) => /^https?:\/\//.test(source.url)));
  }
  for (const cycle of dataset.chinaMenYouthCoaches.team_cycles) {
    assert.ok(cycle.source_links.length > 0, `${cycle.team_label} has no source`);
    assert.ok(cycle.source_links.every((source) => /^https?:\/\//.test(source.url)));
  }
});

test("all primary site pages link to the coaches directory", async () => {
  const pages = [
    "index.html",
    "players.html",
    "player.html",
    "tournaments.html",
    "tournament.html",
    "overseas.html",
    "pathways.html",
    "dossier.html",
    "youth-league.html",
    "lineup.html"
  ];
  for (const pageName of pages) {
    const page = await fs.readFile(new URL(`../${pageName}`, import.meta.url), "utf8");
    assert.match(page, /href="\.\/coaches\.html"/, `${pageName} has no coaches navigation link`);
  }
});
