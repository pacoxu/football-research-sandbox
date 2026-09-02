import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { publicPlayerContract, toPublicPlayer } from "../scripts/lib/public-site.mjs";
import { stagePages } from "../scripts/stage-pages.mjs";

const forbiddenMarketValueFields = new Set([
  "api_url",
  "candidate_urls",
  "club_id",
  "lookup",
  "matched_fields",
  "refresh_error",
  "season_id"
]);

function collectKeys(value, keys = new Set()) {
  if (Array.isArray(value)) {
    for (const entry of value) collectKeys(entry, keys);
    return keys;
  }
  if (!value || typeof value !== "object") return keys;
  for (const [key, entry] of Object.entries(value)) {
    keys.add(key);
    collectKeys(entry, keys);
  }
  return keys;
}

test("public player projection removes audit-only fields", async () => {
  const players = JSON.parse(
    await fs.readFile(new URL("../data/site/players.json", import.meta.url), "utf8")
  );
  const allowedTopLevel = new Set(publicPlayerContract.topLevelFields);

  for (const player of players) {
    assert.deepEqual(player, toPublicPlayer(player));
    assert.equal(Object.hasOwn(player, "name_verification"), false, player.id);
    assert.equal(
      Object.keys(player).every((key) => allowedTopLevel.has(key)),
      true,
      `Unexpected public player field on ${player.id}`
    );
    const marketValueKeys = collectKeys(player.market_value);
    for (const field of forbiddenMarketValueFields) {
      assert.equal(marketValueKeys.has(field), false, `${player.id} exposes market_value.${field}`);
    }
  }
});

test("Pages artifact publishes site JSON but not raw data or schemas", async () => {
  const temporaryDirectory = await fs.mkdtemp(path.join(os.tmpdir(), "football-pages-test-"));
  const outputDirectory = path.join(temporaryDirectory, "artifact");
  try {
    const result = await stagePages({ outputDirectory });
    assert.deepEqual(result.publishedDataDirectories, ["data/site"]);
    assert.deepEqual(await fs.readdir(path.join(outputDirectory, "data")), ["site"]);
    assert.equal(await fs.stat(path.join(outputDirectory, "data/site/players.json")).then(() => true), true);
    await assert.rejects(fs.stat(path.join(outputDirectory, "data/raw")), { code: "ENOENT" });
    await assert.rejects(fs.stat(path.join(outputDirectory, "data/schema")), { code: "ENOENT" });
  } finally {
    await fs.rm(temporaryDirectory, { recursive: true, force: true });
  }
});
