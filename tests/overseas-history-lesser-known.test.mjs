import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function loadChinaHistory() {
  const raw = await readFile(new URL("../data/raw/overseas-history.json", import.meta.url), "utf8");
  const history = JSON.parse(raw);
  return history.countries.find((entry) => entry.country === "China PR");
}

test("covers the requested lesser-known overseas careers", async () => {
  const china = await loadChinaHistory();
  const expectedNames = [
    "张呈栋", "王刚", "曲圣卿", "高雷雷", "张烁", "陈志钊", "谭龙", "于海",
    "孙祥", "黄博文", "周通", "吴少聪", "杜威", "郭田雨", "李磊", "陈彬彬"
  ];
  const coveredNames = new Set(china.featured_records.map((record) => record.local_name));

  for (const name of expectedNames) {
    assert.ok(coveredNames.has(name), `Missing lesser-known overseas history for ${name}`);
  }
  assert.equal(china.verified_records, china.featured_records.length);
});

test("keeps short appearances and zero-appearance registrations explicit", async () => {
  const china = await loadChinaHistory();
  const byId = new Map(china.featured_records.map((record) => [record.id, record]));

  assert.deepEqual(
    {
      appearances: byId.get("du-wei-celtic-2006").appearances,
      competitiveDebut: byId.get("du-wei-celtic-2006").competitive_debut
    },
    { appearances: 1, competitiveDebut: true }
  );
  assert.deepEqual(
    {
      appearances: byId.get("chen-binbin-toyama-2022").appearances,
      competitiveDebut: byId.get("chen-binbin-toyama-2022").competitive_debut
    },
    { appearances: 0, competitiveDebut: false }
  );
  assert.equal(byId.get("guo-tianyu-vizela-2022").appearances, 3);
});

test("separates Zhang Shuo's Asian and Oceanian league records", async () => {
  const china = await loadChinaHistory();
  const records = china.featured_records.filter((record) => record.local_name === "张烁");

  assert.deepEqual(
    records.map(({ bucket, appearances }) => ({ bucket, appearances })),
    [
      { bucket: "asia-other", appearances: 10 },
      { bucket: "oceania-other", appearances: 8 }
    ]
  );
});
