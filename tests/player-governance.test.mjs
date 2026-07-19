import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { loadDataset } from "../scripts/lib/data-loader.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const countries = new Set(["China PR", "Japan", "Korea Republic", "Uzbekistan"]);

test("audits all 263 target players without inventing unresolved native names", async () => {
  const [dataset, overrides] = await Promise.all([
    loadDataset(),
    fs.readFile(path.join(root, "data/raw/player-name-overrides.json"), "utf8").then(JSON.parse)
  ]);
  const players = dataset.players.filter((player) => countries.has(player.country));
  assert.equal(players.length, 263);
  for (const player of players) {
    const audit = overrides[player.id]?.native_verification;
    assert(["verified", "unresolved"].includes(audit?.status), player.id);
    assert(player.registration_club.organization_type, player.id);
    if (audit.status === "verified") {
      assert(audit.sources.length > 0, player.id);
      assert(player.source_layers.some((layer) => audit.sources.some((source) => source.claim === layer.claim)));
    } else {
      assert.equal(overrides[player.id].native, undefined, player.id);
      assert.equal(player.names.native, player.names.en, player.id);
      assert(audit.attempts.length > 0, player.id);
    }
  }
});

test("keeps registration and current pathway organization types aligned", async () => {
  const dataset = await loadDataset();
  for (const player of dataset.players.filter((candidate) => countries.has(candidate.country))) {
    const current = player.training_pathway.find(
      (step) => step.organization === player.registration_club.name
    );
    if (current) assert.equal(current.organization_type, player.registration_club.organization_type, player.id);
  }
});
