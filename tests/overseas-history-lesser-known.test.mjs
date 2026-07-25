import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function loadChinaHistory() {
  const raw = await readFile(new URL("../data/raw/overseas-history.json", import.meta.url), "utf8");
  const history = JSON.parse(raw);
  return history.countries.find((entry) => entry.country === "China PR");
}

async function loadJapanHistory() {
  const raw = await readFile(new URL("../data/raw/overseas-history.json", import.meta.url), "utf8");
  const history = JSON.parse(raw);
  return history.countries.find((entry) => entry.country === "Japan");
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

test("tracks Hidemasa Morita's 2026 Hull City move", async () => {
  const japan = await loadJapanHistory();
  const morita = japan.featured_records.find((record) => record.local_name === "守田英正");
  const lineupSource = await readFile(new URL("../assets/lineup.js", import.meta.url), "utf8");

  assert.deepEqual(
    {
      id: morita.id,
      bucket: morita.bucket,
      league: morita.league,
      club: morita.club,
      season: morita.season
    },
    {
      id: "hidemasa-morita-hull-2026",
      bucket: "big-five",
      league: "Premier League",
      club: "Hull City",
      season: "2026-2027"
    }
  );
  assert.equal(morita.source_links.length, 3);
  assert.ok(morita.source_links.some(({ url }) => url.includes("x.com/HullCity/status/")));
  assert.match(lineupSource, /name: "守田英正".+club: "Hull City"/);
});
