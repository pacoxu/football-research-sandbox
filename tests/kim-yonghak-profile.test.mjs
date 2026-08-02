import assert from "node:assert/strict";
import test from "node:test";
import { loadDataset } from "../scripts/lib/data-loader.mjs";

test("links Kim Yonghak's verified names and 2023 youth tournament record", async () => {
  const dataset = await loadDataset();
  const player = dataset.players.find((candidate) => candidate.id === "kr-kim-yonghak-2003");

  assert(player);
  assert.deepEqual(
    {
      zh: player.names.zh,
      en: player.names.en,
      native: player.names.native,
      ko: player.names.ko
    },
    {
      zh: "金龙鹤",
      en: "Kim Yonghak",
      native: "김용학",
      ko: "김용학"
    }
  );
  assert.equal(player.name_verification.status, "verified");
  assert.equal(player.height_cm, 168);
  assert.equal(player.weight_kg, 63);
  assert.equal(player.registration_club.name, "Portimonense SC");

  assert(player.training_pathway.some((step) => step.organization === "Pohang Steelers Academy"));
  assert(
    player.external_links.some(
      (source) => source.url === "https://www.dongqiudi.com/articles/3472598.html"
    )
  );

  const afcU20 = player.tournament_participation.find(
    (entry) => entry.competition_id === "afc-u20-2023"
  );
  assert(afcU20);
  assert.equal(afcU20.goals, 2);
  assert.equal(afcU20.appearances, null);
  assert.equal(afcU20.minutes, null);

  const fifaU20 = player.tournament_participation.find(
    (entry) => entry.competition_id === "fifa-u20-world-cup-2023"
  );
  assert(fifaU20);
  assert.equal(fifaU20.goals, 1);
  assert.equal(fifaU20.appearances, null);
  assert.equal(fifaU20.minutes, null);
  assert.equal(fifaU20.statistics_status, "partial");

  assert(dataset.tournaments.some((tournament) => tournament.id === "fifa-u20-world-cup-2023"));
  assert(dataset.tournamentArchive.some((tournament) => tournament.id === "fifa-u20-world-cup-2023"));
});
