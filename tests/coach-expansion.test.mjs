import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { buildCoachCatalog } from "../assets/data-insights.js";

const asianUrl = new URL("../data/raw/asian-coaches.json", import.meta.url);
const bigFiveUrl = new URL("../data/raw/big-five-asian-coaches.json", import.meta.url);
const chinaUrl = new URL("../data/raw/china-youth-development-coaches.json", import.meta.url);
const overviewUrl = new URL("../data/site/overview.json", import.meta.url);

test("keeps all Asian-coach stints in one match-audited scope", async () => {
  const data = JSON.parse(await readFile(asianUrl, "utf8"));
  const bigFive = JSON.parse(await readFile(bigFiveUrl, "utf8"));
  const required = new Set([
    "kevin-muscat",
    "kim-pan-gon",
    "akira-nishino",
    "masatada-ishii",
    "amir-ghalenoei",
    "choi-kang-hee"
  ]);

  assert.equal(data.coaches.length, 11);
  const stints = data.coaches.flatMap((coach) =>
    coach.stints.map((stint) => ({ coach_id: coach.id, ...stint }))
  );
  assert.equal(stints.length, 19);
  assert.deepEqual(data.record_audit_counts, { complete: 15, pending: 4 });
  const issueCoaches = data.coaches.filter(({ id }) => required.has(id));
  assert.equal(issueCoaches.length, required.size);
  assert.ok(issueCoaches.every(({ id }) => !bigFive.coaches.some((coach) => coach.id === id)));

  for (const coach of issueCoaches) {
    for (const stint of coach.stints) {
      assert.ok(stint.role_scope);
      assert.ok(stint.competition_scope);
      assert.ok(stint.period.start);
      assert.ok(stint.source_links.some(({ type }) => type !== "secondary-crosscheck"));
      assert.ok(stint.record_audit.competitions.length > 0);
      assert.ok(stint.record_audit.coverage.from);
      assert.ok(stint.record_audit.coverage.through);
      assert.ok(stint.record_audit.fixture_sources.some(({ type }) => type !== "secondary-crosscheck"));
    }
  }

  for (const stint of stints) {
    if (stint.record_audit.status === "pending") {
      assert.equal(stint.record, null);
      continue;
    }
    assert.equal(stint.record.matches, stint.record.wins + stint.record.draws + stint.record.losses);
    assert.equal(stint.record.points, stint.record.wins * 3 + stint.record.draws);
  }

  assert.deepEqual(
    new Set(stints.filter(({ record }) => record === null).map(({ coach_id, team }) => `${coach_id}:${team}`)),
    new Set([
      "hajime-moriyasu:Japan Olympic-age national teams",
      "kevin-muscat:Shanghai Port FC",
      "kim-pan-gon:Selangor FC",
      "choi-kang-hee:Shandong Taishan FC"
    ])
  );
  assert.deepEqual(
    stints.find(({ coach_id, team }) => coach_id === "ange-postecoglou" && team === "Yokohama F. Marinos").record,
    { matches: 118, wins: 58, draws: 18, losses: 42, points: 192 }
  );
  assert.deepEqual(
    stints.find(({ coach_id, team }) => coach_id === "akira-nishino" && team === "Japan").record,
    { matches: 7, wins: 2, draws: 1, losses: 4, points: 7 }
  );
});

test("keeps grassroots age-group and Football Boys batch scopes explicit", async () => {
  const data = JSON.parse(await readFile(chinaUrl, "utf8"));
  const coachIds = new Set(data.coaches.map(({ id }) => id));
  const cuiPeng = data.coaches.find(({ id }) => id === "cn-cui-peng-shandong-u17");
  const dongLu = data.coaches.find(({ id }) => id === "cn-dong-lu-football-boys");

  assert.equal(data.coaches.length, 16);
  assert.equal(data.coaches.filter(({ id }) => id === "cn-zhou-haibin-shandong-2007").length, 1);
  assert.ok(coachIds.has("cn-tang-xiaocheng-shandong-u15"));
  assert.ok(coachIds.has("jp-masaaki-nakamura-evergrande-2008"));
  assert.deepEqual(cuiPeng.age_bands, ["u17"]);
  assert.equal(cuiPeng.role, "U17梯队主教练");
  assert.equal(cuiPeng.period.status, "confirmed-2025");
  assert.ok(cuiPeng.source_links.some(({ type, url }) =>
    type === "official-association" && url === "https://www.thecfa.cn/qingchaoliansai/20250925/36935.html"
  ));
  assert.deepEqual(dongLu.batch_assignments.map(({ batch }) => batch), ["2014"]);
  assert.equal(dongLu.batch_assignments[0].snapshot_year, "2026");
  assert.ok(dongLu.batch_assignments[0].verification_notes);
  assert.ok(data.watchlist.some(({ organization, need }) =>
    organization === "山东鲁能泰山足球学校" && need.includes("未披露该队主教练姓名")
  ));
  assert.ok(data.watchlist.some(({ organization, need }) =>
    organization === "中国足球小将" && need.includes("尚无可核的具名官方教练名单")
  ));
});

test("publishes verified and incomplete issue 12 records in the coach directory", async () => {
  const overview = JSON.parse(await readFile(overviewUrl, "utf8"));
  const coaches = buildCoachCatalog(overview);
  const cuiPeng = coaches.find(({ record_id }) => record_id === "cn-cui-peng-shandong-u17");
  const muscat = coaches.find(({ record_id }) => record_id === "kevin-muscat");
  const nishino = coaches.find(({ record_id }) => record_id === "akira-nishino");

  assert.ok(cuiPeng?.categories.includes("youth-development"));
  assert.ok(cuiPeng?.roles.includes("U17梯队主教练"));
  assert.ok(muscat?.categories.includes("asia-expanded"));
  assert.ok(muscat?.missing_fields.includes("record"));
  assert.deepEqual(muscat?.record_audit_counts, { complete: 1, pending: 1 });
  assert.equal(muscat?.records.find(({ team }) => team === "Yokohama F. Marinos")?.record.matches, 86);
  assert.ok(!nishino?.missing_fields.includes("record"));
  assert.deepEqual(nishino?.record_audit_counts, { complete: 2, pending: 0 });
});
