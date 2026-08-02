import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const tournamentsUrl = new URL("../data/raw/tournaments.json", import.meta.url);
const appUrl = new URL("../assets/app.js", import.meta.url);
const tournamentPageUrl = new URL("../tournament.html", import.meta.url);

test("tracks the complete Shanghai Future Star U17 field, draw and China camp roster", async () => {
  const tournaments = JSON.parse(await readFile(tournamentsUrl, "utf8"));
  const event = tournaments.find(({ id }) => id === "shanghai-future-star-cup-men-u17-2026");
  const groups = event.final_draw.groups;
  const roster = event.latest_public_roster_view.groups.flatMap(({ entries }) => entries);
  const broadcast = event.broadcast_plan;
  const ticketing = event.ticketing;

  assert.equal(event.status, "upcoming");
  assert.deepEqual(event.date_range, { start: "2026-08-03", end: "2026-08-09" });
  assert.equal(event.participants.status, "complete");
  assert.equal(event.participants.teams.length, 8);
  assert.equal(groups.length, 2);
  assert.ok(groups.find(({ name }) => name === "A").teams.includes("Arsenal U17"));
  assert.equal(roster.length, 28);
  assert.equal(event.latest_public_roster_view.head_coach.local_name, "浮嶋敏");
  assert.equal(broadcast.status, "complete");
  assert.equal(broadcast.published_at, "2026-08-02");
  assert.deepEqual(
    {
      date: broadcast.match.date,
      kickoff: broadcast.match.kickoff,
      venue: broadcast.match.venue.zh
    },
    { date: "2026-08-03", kickoff: "19:35", venue: "上汽浦东足球场" }
  );
  assert.equal(broadcast.platforms.length, 1);
  assert.equal(broadcast.platforms[0].name.zh, "足球中国");
  assert.deepEqual(
    broadcast.platforms[0].channels.map(({ zh }) => zh),
    ["微博", "抖音", "快手", "视频号"]
  );
  assert.equal(broadcast.source.url, "https://weibo.com/1892463935/RbwYI4VOv");
  assert.match(broadcast.source.poster_url, /^https:\/\/wx1\.sinaimg\.cn\/large\//);
  assert.doesNotMatch(JSON.stringify(broadcast.platforms), /CCTV|央视|咪咕|腾讯/);
  assert.equal(ticketing.status, "on-sale");
  assert.deepEqual(ticketing.price_tiers, [50, 80, 120, 200]);
  assert.deepEqual(ticketing.packages, [
    { people: 2, discount_percent: 15 },
    { people: 3, discount_percent: 20 }
  ]);
  assert.deepEqual(ticketing.sales_channels.map(({ zh }) => zh), ["大麦", "久事体育"]);
  assert.match(ticketing.note.zh, /实时库存/);
  assert.match(ticketing.source.url, /^https:\/\/english\.shanghai\.gov\.cn\//);
});

test("renders the verified Shanghai U17 broadcast plan on the tournament page", async () => {
  const [app, page] = await Promise.all([
    readFile(appUrl, "utf8"),
    readFile(tournamentPageUrl, "utf8")
  ]);

  assert.match(page, /id="tournamentDetailBroadcastSection"/);
  assert.match(page, /id="tournamentDetailBroadcast"/);
  assert.match(page, /id="tournamentDetailTicketingSection"/);
  assert.match(page, /id="tournamentDetailTicketing"/);
  assert.match(app, /function renderTournamentBroadcastPlan\(/);
  assert.match(app, /function renderTournamentTicketing\(/);
  assert.match(app, /tournamentDetail\.broadcast\.poster/);
});
