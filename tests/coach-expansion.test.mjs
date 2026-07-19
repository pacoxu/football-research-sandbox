import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const asianUrl = new URL("../data/raw/asian-coaches.json", import.meta.url);
const chinaUrl = new URL("../data/raw/china-youth-development-coaches.json", import.meta.url);

test("keeps all issue 12 Asian coaches in the extension table with sourced scopes", async () => {
  const data = JSON.parse(await readFile(asianUrl, "utf8"));
  const required = new Set([
    "kevin-muscat",
    "kim-pan-gon",
    "akira-nishino",
    "masatada-ishii",
    "amir-ghalenoei",
    "choi-kang-hee"
  ]);

  assert.equal(data.coaches.length, 11);
  for (const coach of data.coaches) required.delete(coach.id);
  assert.deepEqual([...required], []);

  for (const coach of data.coaches.slice(-6)) {
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
  const dongLu = data.coaches.find(({ id }) => id === "cn-dong-lu-football-boys");

  assert.ok(coachIds.has("cn-tang-xiaocheng-shandong-u15"));
  assert.ok(coachIds.has("jp-masaaki-nakamura-evergrande-2008"));
  assert.deepEqual(dongLu.batch_assignments.map(({ batch }) => batch), ["2014"]);
  assert.equal(dongLu.batch_assignments[0].snapshot_year, "2026");
  assert.ok(dongLu.batch_assignments[0].verification_notes);
});
