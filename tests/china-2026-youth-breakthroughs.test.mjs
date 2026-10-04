import assert from "node:assert/strict";
import fs from "node:fs/promises";
import test from "node:test";

const archive = JSON.parse(
  await fs.readFile(new URL("../data/raw/tournament-archive.json", import.meta.url), "utf8")
);
const tournaments = JSON.parse(
  await fs.readFile(new URL("../data/raw/tournaments.json", import.meta.url), "utf8")
);
const byArchiveId = new Map(archive.map((entry) => [entry.id, entry]));
const byTournamentId = new Map(tournaments.map((entry) => [entry.id, entry]));

test("frames the 2026 U23 Asian Cup as this competition's best finish, not an all-time senior peak", () => {
  const archived = byArchiveId.get("afc-u23-2026");
  const snapshot = byTournamentId.get("afc-u23-2026");

  assert.equal(archived.china_status, "runner-up");
  assert.match(archived.china_summary, /创办以来的最佳成绩/);
  assert.match(archived.china_summary, /2004 成年亚洲杯/);
  assert.doesNotMatch(archived.china_summary, /队史最佳/);
  assert.match(snapshot.headline, /创办以来最佳成绩/);
});

test("keeps the U17 World Cup return at 21 years and the seventh appearance", () => {
  const asianCup = byArchiveId.get("afc-u17-2026");
  const worldCup = byArchiveId.get("fifa-u17-world-cup-2026");
  const snapshot = byTournamentId.get("afc-u17-2026");

  assert.equal(asianCup.china_status, "runner-up");
  assert.match(asianCup.china_summary, /时隔 22 年/);
  assert.match(asianCup.china_summary, /时隔 21 年/);
  assert.match(asianCup.china_summary, /第 7 次/);
  assert.match(asianCup.china_summary, /低于 1992、2004 两座冠军/);
  assert.equal(worldCup.china_participation_history.appearances_before_2026, 6);
  assert.equal(worldCup.china_participation_history.qualified_edition_count_including_2026, 7);
  assert.match(snapshot.notes.join("\n"), /第 7 次/);
  assert.doesNotMatch(snapshot.notes.join("\n"), /第 6 次/);
});

test("records 2004 as the U17 Asian title, not a final defeat to Japan", () => {
  const archived = byArchiveId.get("afc-u17-2004");
  const peru2005 = byArchiveId.get("fifa-u17-world-cup-2005");

  assert.equal(archived.champion, "China PR");
  assert.equal(archived.runner_up, "Korea DPR");
  assert.equal(archived.china_status, "champion");
  assert.deepEqual(archived.date_range, { start: "2004-09-04", end: "2004-09-18" });
  assert.match(archived.china_summary, /1 比 0 击败朝鲜夺冠/);
  assert.match(archived.china_summary, /1 比 3 负于日本/);
  assert.match(peru2005.qualification_path.summary, /夺冠/);
  assert.doesNotMatch(peru2005.qualification_path.summary, /亚军/);
});

test("frames the 2026 Asian Games bronze as a 28-year medal return under the 1994 silver ceiling", () => {
  const archived = byArchiveId.get("asian-games-men-2026");
  const snapshot = byTournamentId.get("asian-games-men-2026");

  assert.equal(archived.china_status, "third-place");
  assert.match(archived.china_summary, /时隔28年/);
  assert.match(archived.china_summary, /1994年广岛银牌/);
  assert.match(archived.china_summary, /2002年改为U23赛制后的最佳成绩/);
  assert.match(snapshot.headline, /铜牌/);
});
