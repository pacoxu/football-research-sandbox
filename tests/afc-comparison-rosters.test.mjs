import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { loadDataset } from "../scripts/lib/data-loader.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const expectedNumbers = Array.from({ length: 23 }, (_, index) => index + 1);

test("tracks 17 complete AFC comparison rosters and two non-participating Iran boundaries", async () => {
  const dataset = await loadDataset();
  const metadata = dataset.tournamentArchive.flatMap((tournament) =>
    (tournament.comparison_rosters ?? []).map((roster) => ({ ...roster, competition_id: tournament.id }))
  );
  assert.equal(metadata.filter((roster) => roster.status === "complete-final-registration").length, 17);
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
  assert.equal(comparisonPlayers.length, 291);
  assert.equal(
    comparisonPlayers.reduce((total, player) => total + player.tournament_participation.length, 0),
    322
  );
  assert(comparisonPlayers.some((player) => player.tournament_participation.length > 1));

  const appSource = await fs.readFile(path.join(root, "assets/app.js"), "utf8");
  const dictionary = await fs.readFile(path.join(root, "docs/data-dictionary.md"), "utf8");
  assert.match(appSource, /"national-academy"/);
  assert.match(dictionary, /Aspire/);
});

test("imports four complete Thailand AFC final registrations", async () => {
  const dataset = await loadDataset();
  const competitionIds = ["afc-u17-2025", "afc-u20-2025", "afc-u23-2024", "afc-u23-2026"];
  const thailandPlayers = dataset.players.filter((player) => player.country === "Thailand");
  for (const competitionId of competitionIds) {
    const entries = thailandPlayers.flatMap((player) =>
      player.tournament_participation.filter(
        (entry) => entry.competition_id === competitionId && entry.roster_status === "final-squad"
      )
    );
    assert.equal(entries.length, 23, competitionId);
    assert.deepEqual(
      entries.map((entry) => entry.shirt_number).sort((left, right) => left - right),
      expectedNumbers,
      competitionId
    );
  }
  assert.equal(thailandPlayers.length, 84);
});

test("keeps the Laos and Thailand 2034 Cup leads as non-generating partial candidates", async () => {
  const source = JSON.parse(
    await fs.readFile(path.join(root, "data/raw/afc-comparison-rosters.json"), "utf8")
  );
  const dataset = await loadDataset();
  const expectedIds = [
    "la-wig-naga-2034-cup-2026",
    "th-asia-future-stars-2034-cup-2026"
  ];
  assert.deepEqual(
    source.candidate_batches.map((candidate) => candidate.id).sort(),
    expectedIds
  );
  for (const candidate of source.candidate_batches) {
    assert.equal(candidate.candidate_status, "partial-source-audit");
    assert.equal(candidate.roster_status, "official-complete-roster-not-found");
    assert.equal(candidate.known_player_count, 0);
    assert.equal(candidate.expected_count, null);
    assert.equal(candidate.eligible_for_player_generation, false);
    assert.equal(candidate.national_team_claim, false);
    assert(candidate.missing_fields.includes("official_complete_roster"));
    assert(candidate.sources.length > 0);
  }

  const archive = dataset.tournamentArchive.find((tournament) => tournament.id === "2034-cup-2026");
  assert.equal(archive.archive_scope, "partial-comparison-candidate-audit");
  assert.deepEqual(
    archive.comparison_roster_candidates.map((candidate) => candidate.candidate_id).sort(),
    expectedIds
  );
  assert.equal(
    dataset.players.flatMap((player) =>
      player.tournament_participation.filter((entry) => entry.competition_id === "2034-cup-2026")
    ).length,
    0
  );
});
