import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const snapshot = JSON.parse(
  await readFile(
    new URL("../data/raw/europe-top-leagues-japan-korea.json", import.meta.url),
    "utf8"
  )
);

test("publishes a complete 2026/27 Japan-Korea snapshot for UEFA's top eight leagues", () => {
  assert.equal(snapshot.checked_at, "2026-09-08");
  assert.deepEqual(
    snapshot.coefficient_ranking.leagues.map(({ rank, association }) => [rank, association]),
    [
      [1, "England"],
      [2, "Italy"],
      [3, "Spain"],
      [4, "Germany"],
      [5, "France"],
      [6, "Portugal"],
      [7, "Netherlands"],
      [8, "Belgium"]
    ]
  );
  assert.equal(snapshot.players.length, 75);
  assert.equal(snapshot.players.filter((player) => player.country === "Japan").length, 60);
  assert.equal(snapshot.players.filter((player) => player.country === "Korea Republic").length, 15);
});

test("keeps market values sourced, partial and machine-sortable", () => {
  const valued = snapshot.players.filter((player) => player.market_value);
  assert.equal(valued.length, 33);
  assert.ok(valued.every((player) => player.market_value.eur > 0));
  assert.match(snapshot.market_value_methodology.note.zh, /不是转会费/);
  assert.match(snapshot.market_value_methodology.note.zh, /未核到者留空/);
});

test("overseas page exposes the coefficient, roster and market-value views", async () => {
  const [html, app] = await Promise.all([
    readFile(new URL("../overseas.html", import.meta.url), "utf8"),
    readFile(new URL("../assets/app.js", import.meta.url), "utf8")
  ]);
  assert.match(html, /id="europeTopLeaguesCoefficient"/);
  assert.match(html, /id="europeTopLeaguesRosters"/);
  assert.match(html, /id="europeTopLeaguesValueRanking"/);
  assert.match(app, /function renderEuropeTopLeaguesSnapshot\(\)/);
  assert.match(app, /renderEuropeTopLeaguesSnapshot\(\);/);
});
