import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { loadDataset } from "../scripts/lib/data-loader.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const expectedNumbers = Array.from({ length: 23 }, (_, index) => index + 1);

test("tracks 13 complete AFC comparison rosters and two non-participating Iran boundaries", async () => {
  const dataset = await loadDataset();
  const metadata = dataset.tournamentArchive.flatMap((tournament) =>
    (tournament.comparison_rosters ?? []).map((roster) => ({ ...roster, competition_id: tournament.id }))
  );
  assert.equal(metadata.filter((roster) => roster.status === "complete-final-registration").length, 13);
  assert.equal(metadata.filter((roster) => roster.status === "not-applicable").length, 2);

  for (const roster of metadata) {
    const entries = dataset.players.flatMap((player) =>
      player.country === roster.country
        ? player.tournament_participation
            .filter(
              (entry) =>
                entry.competition_id === roster.competition_id &&
                entry.squad_status === "registered" &&
                entry.roster_status === "final-squad"
            )
            .map((entry) => ({ player, entry }))
        : []
    );
    assert.equal(entries.length, roster.expected_count, `${roster.country} ${roster.competition_id}`);
    assert.equal(new Set(entries.map(({ player }) => player.id)).size, roster.expected_count);
  }
});

test("preserves official shirt numbers, including the documented Iran U23 exception", async () => {
  const dataset = await loadDataset();
  const complete = dataset.tournamentArchive.flatMap((tournament) =>
    (tournament.comparison_rosters ?? [])
      .filter((roster) => roster.status === "complete-final-registration")
      .map((roster) => ({ ...roster, competition_id: tournament.id }))
  );
  for (const roster of complete) {
    const numbers = dataset.players
      .filter((player) => player.country === roster.country)
      .flatMap((player) =>
        player.tournament_participation
          .filter(
            (entry) =>
              entry.competition_id === roster.competition_id && entry.roster_status === "final-squad"
          )
          .map((entry) => entry.shirt_number)
      )
      .sort((left, right) => left - right);
    const expected =
      roster.country === "IR Iran" && roster.competition_id === "afc-u23-2026"
        ? [1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 22, 23]
        : expectedNumbers;
    assert.deepEqual(numbers, expected, `${roster.country} ${roster.competition_id}`);
  }
});

test("reuses stable IDs across age groups and exposes the national academy type", async () => {
  const dataset = await loadDataset();
  const comparisonPlayers = dataset.players.filter((player) => player.focus_tags.includes("afc-comparison-roster"));
  assert.equal(comparisonPlayers.length, 207);
  assert.equal(
    comparisonPlayers.reduce((total, player) => total + player.tournament_participation.length, 0),
    230
  );
  assert(comparisonPlayers.some((player) => player.tournament_participation.length > 1));

  const appSource = await fs.readFile(path.join(root, "assets/app.js"), "utf8");
  const dictionary = await fs.readFile(path.join(root, "docs/data-dictionary.md"), "utf8");
  assert.match(appSource, /"national-academy"/);
  assert.match(dictionary, /Aspire/);
});
