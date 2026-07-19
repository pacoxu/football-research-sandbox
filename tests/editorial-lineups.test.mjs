import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const repositoryRoot = new URL("../", import.meta.url);

test("renders three editorial overseas XIs below the lineup builder", async () => {
  const [html, script] = await Promise.all([
    readFile(new URL("lineup.html", repositoryRoot), "utf8"),
    readFile(new URL("assets/lineup.js", repositoryRoot), "utf8")
  ]);

  assert.match(html, /id="editorialLineupGrid"/);
  assert.match(html, /自评留洋最佳阵容/);

  const titles = ["历史留洋最佳阵容", "现役留洋最佳阵容", "现役留洋经历最佳阵容"];
  for (const title of titles) assert.match(script, new RegExp(`title: "${title}"`));

  const lineupBlock = script.match(/const editorialLineups = \[([\s\S]+?)\n\];\n\nconst state/);
  assert.ok(lineupBlock, "editorial lineup configuration should be present");

  const idGroups = [...lineupBlock[1].matchAll(/ids: \[([\s\S]+?)\n    \]/g)];
  assert.equal(idGroups.length, 3);
  idGroups.forEach((group) => {
    assert.equal([...group[1].matchAll(/"cn-[^"]+"/g)].length, 11);
  });
});
