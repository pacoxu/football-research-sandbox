import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const repositoryRoot = new URL("../", import.meta.url);

test("renders China selections and five current Asian overseas recommendations", async () => {
  const [html, script] = await Promise.all([
    readFile(new URL("lineup.html", repositoryRoot), "utf8"),
    readFile(new URL("assets/lineup.js", repositoryRoot), "utf8")
  ]);

  assert.match(html, /id="editorialLineupGrid"/);
  assert.match(html, /自评留洋最佳阵容/);

  const titles = [
    "历史留洋最佳阵容",
    "现役留洋最佳阵容",
    "现役留洋经历最佳阵容",
    "日本现役留洋最佳阵容",
    "韩国现役留洋最佳阵容",
    "澳大利亚现役留洋最佳阵容",
    "伊朗现役留洋最佳阵容",
    "沙特现役留洋推荐组"
  ];
  for (const title of titles) assert.match(script, new RegExp(`title: "${title}"`));

  for (const country of ["Japan", "Korea Republic", "Australia", "IR Iran", "Saudi Arabia"]) {
    assert.match(html, new RegExp(`data-country="${country}"`));
  }

  const lineupBlock = script.match(/const editorialLineups = \[([\s\S]+?)\n\];\n\nconst state/);
  assert.ok(lineupBlock, "editorial lineup configuration should be present");

  const idGroups = [...lineupBlock[1].matchAll(/ids: \[([\s\S]+?)\n    \]/g)];
  assert.equal(idGroups.length, 8);
  assert.deepEqual(
    idGroups.map((group) => [...group[1].matchAll(/"(?:cn|jp|kr|au|ir|sa)-[^"]+"/g)].length),
    [11, 11, 11, 11, 11, 11, 11, 1]
  );

  const expectedPrefixes = ["jp-", "kr-", "au-", "ir-", "sa-"];
  const currentIds = new Set(
    [...script.matchAll(/\{ id: "([^"]+)"[^\n]+era: "current" \}/g)].map((match) => match[1])
  );
  idGroups.slice(3).forEach((group, index) => {
    const ids = [...group[1].matchAll(/"([^"]+)"/g)].map((match) => match[1]);
    assert.ok(ids.every((id) => id.startsWith(expectedPrefixes[index])));
    assert.ok(ids.every((id) => currentIds.has(id)), `${expectedPrefixes[index]} recommendation must only use current players`);
  });

  assert.match(script, /title: "沙特现役留洋推荐组"[\s\S]+?partial: true/);
  assert.match(script, /id: "sa-marwan-alsahafi"[^\n]+era: "returned"/);
  assert.match(script, /id: "sa-faisal-alghamdi"[^\n]+era: "returned"/);
  assert.equal([...script.matchAll(/verifiedAt: "2026-08-02"/g)].length, 5);

  const marketValueBlock = script.match(
    /const editorialMarketValues = \{([\s\S]+?)\n\};\nconst editorialMarketValueCheckedAt/
  );
  assert.ok(marketValueBlock, "editorial market values should be present");
  const valuedIds = new Set(
    [...marketValueBlock[1].matchAll(/"((?:jp|kr|au|ir|sa)-[^"]+)":\s+[\d_]+/g)].map(
      (match) => match[1]
    )
  );
  assert.equal(valuedIds.size, 45);
  idGroups.slice(3).forEach((group) => {
    const ids = [...group[1].matchAll(/"([^"]+)"/g)].map((match) => match[1]);
    assert.ok(ids.every((id) => valuedIds.has(id)), "current Asian recommendation should show every player's value");
  });

  assert.match(script, /class="editorial-market-summary"/);
  assert.match(script, /class="editorial-player-value"/);
  assert.equal([...script.matchAll(/label: "Transfermarkt (?:日本|韩国|澳大利亚|伊朗|沙特)身价"/g)].length, 5);
});
