import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const datasetUrl = new URL("../data/raw/players/china-overseas-current.json", import.meta.url);

test("keeps Liu Kaiyuan's Juvenil C listing separate from a completed 2026/27 ficha", async () => {
  const players = JSON.parse(await readFile(datasetUrl, "utf8"));
  const liu = players.find(({ id }) => id === "cn-liu-kaiyuan-2010");
  const juvenilC = liu.tournament_participation.find(
    ({ label }) => label === "2026/27 Villarreal Juvenil C 公开名单观察"
  );
  const links = new Map(liu.external_links.map(({ label, url }) => [label, url]));

  assert.equal(liu.registration_club.name, "FC Villarreal Youth");
  assert.equal(juvenilC.team, "Villarreal CF Juvenil C");
  assert.equal(juvenilC.squad_status, "tracked");
  assert.match(juvenilC.note, /暂无 ficha/);
  assert.equal(
    links.get("Villarreal CF renewal announcement for Kevin Liu"),
    "https://villarrealcf.es/en/villarreal-renew-kevin-liu/"
  );
  assert.equal(
    links.get("El Balón Kaiyuan Liu player page"),
    "https://www.elbalondelacomunitat.es/jugador/29886797"
  );
  assert.equal(liu.verification.last_checked, "2026-09-02");
  assert.match(liu.verification.notes, /不能写成新赛季竞赛许可证已完成/);
});
