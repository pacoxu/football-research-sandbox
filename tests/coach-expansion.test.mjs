import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { buildCoachCatalog } from "../assets/data-insights.js";

const asianUrl = new URL("../data/raw/asian-coaches.json", import.meta.url);
const bigFiveUrl = new URL("../data/raw/big-five-asian-coaches.json", import.meta.url);
const chinaUrl = new URL("../data/raw/china-youth-development-coaches.json", import.meta.url);
const overviewUrl = new URL("../data/site/overview.json", import.meta.url);

test("keeps all issue 12 Asian coaches in the extension table with sourced scopes", async () => {
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
  const issueCoaches = data.coaches.filter(({ id }) => required.has(id));
  assert.equal(issueCoaches.length, required.size);
  assert.ok(issueCoaches.every(({ id }) => !bigFive.coaches.some((coach) => coach.id === id)));

  for (const coach of issueCoaches) {
    for (const stint of coach.stints) {
      assert.ok(stint.role_scope);
      assert.ok(stint.competition_scope);
      assert.ok(stint.period.start);
      assert.ok(stint.source_links.some(({ type }) => type !== "secondary-crosscheck"));
      assert.equal(stint.record, null);
    }
  }
});

test("keeps grassroots age-group and Football Boys batch scopes explicit", async () => {
  const data = JSON.parse(await readFile(chinaUrl, "utf8"));
  const coachIds = new Set(data.coaches.map(({ id }) => id));
  const cuiPeng = data.coaches.find(({ id }) => id === "cn-cui-peng-shandong-u17");
  const dongLu = data.coaches.find(({ id }) => id === "cn-dong-lu-football-boys");

  assert.equal(data.coaches.length, 14);
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

  assert.ok(cuiPeng?.categories.includes("youth-development"));
  assert.ok(cuiPeng?.roles.includes("U17梯队主教练"));
  assert.ok(muscat?.categories.includes("asia-expanded"));
  assert.ok(muscat?.missing_fields.includes("record"));
});
