import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const repositoryRoot = new URL("../", import.meta.url);

test("exposes overseas training-program candidates without treating training as registration", async () => {
  const lineupSource = await readFile(new URL("assets/lineup.js", repositoryRoot), "utf8");
  const lineupPage = await readFile(new URL("lineup.html", repositoryRoot), "utf8");

  assert.match(lineupSource, /id: "cn-li-tie"[^\n]+trainingProgram: "健力宝巴西"/);
  assert.match(lineupSource, /id: "cn-zhang-xiaorui-jianlibao"[^\n]+era: "training"[^\n]+trainingProgram: "健力宝巴西"/);
  assert.match(lineupSource, /id: "cn-wang-yongpo-olympic-stars"[^\n]+trainingProgram: "08 之星德国培训"/);
  assert.match(lineupSource, /id: "cn-li-yuanyi-500-stars"[^\n]+trainingProgram: "500 星计划"/);
  assert.match(lineupSource, /id: "cn-liu-kaijie-wanda"[^\n]+trainingProgram: "万达西班牙计划"/);
  assert.match(lineupSource, /id: "cn-wang-chu-metz"[^\n]+role: "前腰"[^\n]+trainingProgram: "中法德瑞 \/ 梅斯青训"/);
  assert.match(lineupSource, /training: \{ badge: "培训", countLabel: "培训" \}/);
  assert.match(lineupPage, /试训和培训会单独标记，不等同于海外注册/);
});
