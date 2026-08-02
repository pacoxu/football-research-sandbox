import assert from "node:assert/strict";
import fs from "node:fs/promises";
import test from "node:test";

const archive = JSON.parse(
  await fs.readFile(new URL("../data/raw/tournament-archive.json", import.meta.url), "utf8")
);
const byId = new Map(archive.map((tournament) => [tournament.id, tournament]));

test("keeps the verified historical China player-stat coverage boundary", () => {
  const completeIds = [
    "fifa-world-cup-2002",
    "fifa-u20-world-cup-1985",
    "fifa-u16-world-championship-1989",
    "fifa-u17-world-championship-1991",
    "fifa-u17-world-championship-1993",
    "fifa-u17-world-championship-2003",
    "fifa-u17-world-cup-2005",
    "fifa-u20-world-cup-2005"
  ];
  for (const id of completeIds) {
    const status = byId.get(id).minute_status;
    assert.equal(status.status, "complete", id);
    assert.deepEqual(status.missing_fields, [], id);
  }

  assert.deepEqual(
    byId.get("fifa-u20-world-cup-1983").minute_status.missing_fields,
    ["minutes"]
  );
  assert.deepEqual(
    byId.get("fifa-u16-world-championship-1985").minute_status.missing_fields,
    ["starts", "substitute_appearances"]
  );
  assert.deepEqual(
    byId.get("fifa-u20-world-cup-1997").minute_status.missing_fields,
    ["minutes"]
  );
  assert.deepEqual(
    byId.get("fifa-u20-world-cup-2001").minute_status.missing_fields,
    ["appearances", "starts", "substitute_appearances", "minutes"]
  );
});

test("locks the corrected 1985 U16 official match record", () => {
  const matches = byId.get("fifa-u16-world-championship-1985").china_matches;
  assert.deepEqual(
    matches.map(({ date, opponent, score_for, score_against }) => [date, opponent, score_for, score_against]),
    [
      ["1985-07-31", "Bolivia", 1, 1],
      ["1985-08-02", "Guinea", 2, 1],
      ["1985-08-04", "United States", 3, 1],
      ["1985-08-07", "West Germany", 2, 4]
    ]
  );
  assert.equal(matches.flatMap((match) => match.china_contributions).length, 8);
});

test("keeps official player identities attached to their verified rows", () => {
  const u17 = byId.get("fifa-u17-world-cup-2005");
  assert.deepEqual(
    u17.china_squad.map(({ squad_number, player }) => [squad_number, player]),
    [
      [1, "Wang Dalei"], [2, "Cui Nanri"], [3, "Tang Naixin"], [4, "Li Linfeng"],
      [5, "Gu Cao"], [6, "Cai Yaohui"], [7, "Yu Dabao"], [8, "Yang Jian"],
      [9, "Gu Jinjin"], [10, "Zhu Yifan"], [11, "Zhang Xu"], [12, "Wang Gang"],
      [13, "Li Zhuangfei"], [14, "Du Longquan"], [15, "Wang Xuanhong"],
      [16, "Deng Zhuoxiang"], [17, "Chi Wenyi"], [18, "Yang Xu"],
      [19, "Huang Jie"], [20, "Wang Weilong"]
    ]
  );
  assert.equal(u17.china_matches[3].china_contributions[0].player, "Gu Jinjin");
  assert.equal(byId.get("fifa-u20-world-cup-1997").china_squad[11].player, "Chang Weiwei");
  assert.equal(byId.get("fifa-world-cup-2002").china_squad[9].player, "Hao Haidong");
});
