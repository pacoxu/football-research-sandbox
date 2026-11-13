const editionStatuses = new Set(["completed", "cancelled", "in-progress"]);
const chinaStages = new Set([
  "not-in-finals",
  "group-stage",
  "round-of-16",
  "quarter-final-scheduled",
  "quarter-final",
  "not-applicable"
]);
const buckets = new Set(["big-five", "europe-other", "americas", "oceania"]);
const appearanceStatuses = new Set(["appeared", "registration-reported"]);
const verificationStatuses = new Set(["verified", "mixed-source", "provisional", "needs-review"]);
const expectedEditionIds = [
  "fifa-u17-womens-world-cup-2008",
  "fifa-u17-womens-world-cup-2010",
  "fifa-u17-womens-world-cup-2012",
  "fifa-u17-womens-world-cup-2014",
  "fifa-u17-womens-world-cup-2016",
  "fifa-u17-womens-world-cup-2018",
  "fifa-u17-womens-world-cup-2020",
  "fifa-u17-womens-world-cup-2022",
  "fifa-u17-womens-world-cup-2024",
  "fifa-u17-womens-world-cup-2025",
  "fifa-u17-womens-world-cup-2026"
];
const expectedChinaStages = {
  "fifa-u17-womens-world-cup-2008": "not-in-finals",
  "fifa-u17-womens-world-cup-2010": "not-in-finals",
  "fifa-u17-womens-world-cup-2012": "group-stage",
  "fifa-u17-womens-world-cup-2014": "group-stage",
  "fifa-u17-womens-world-cup-2016": "not-in-finals",
  "fifa-u17-womens-world-cup-2018": "not-in-finals",
  "fifa-u17-womens-world-cup-2020": "not-applicable",
  "fifa-u17-womens-world-cup-2022": "group-stage",
  "fifa-u17-womens-world-cup-2024": "not-in-finals",
  "fifa-u17-womens-world-cup-2025": "round-of-16",
  "fifa-u17-womens-world-cup-2026": "quarter-final"
};
const expectedChampions = {
  "fifa-u17-womens-world-cup-2008": "Korea DPR",
  "fifa-u17-womens-world-cup-2010": "Korea Republic",
  "fifa-u17-womens-world-cup-2012": "France",
  "fifa-u17-womens-world-cup-2014": "Japan",
  "fifa-u17-womens-world-cup-2016": "Korea DPR",
  "fifa-u17-womens-world-cup-2018": "Spain",
  "fifa-u17-womens-world-cup-2022": "Spain",
  "fifa-u17-womens-world-cup-2024": "Korea DPR",
  "fifa-u17-womens-world-cup-2025": "Korea DPR",
  "fifa-u17-womens-world-cup-2026": "Nigeria"
};
const expectedBigFiveIds = ["wsl", "liga-f", "frauen-bundesliga", "premiere-ligue", "serie-a-femminile"];
const expectedPlayerIds = [
  "wang-shuang",
  "zhang-linyan",
  "tang-jiali",
  "yang-lina",
  "li-mengwen",
  "wu-chengshu",
  "wang-yanwen",
  "wurigumula",
  "shao-ziqin"
];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function isIsoDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function validateLocalizedText(value, label) {
  assert(typeof value === "object" && value !== null, `Invalid localized text on ${label}`);
  assert(typeof value.zh === "string" && value.zh.length > 0, `Missing Chinese text on ${label}`);
  assert(typeof value.en === "string" && value.en.length > 0, `Missing English text on ${label}`);
}

function assertHttps(value, label) {
  assert(typeof value === "string" && /^https:\/\//.test(value), `Invalid source URL on ${label}`);
}

export function validateWomenFootball(payload) {
  assert(payload?.schema_version === 1, "Unsupported women-football schema version");
  assert(isIsoDate(payload.checked_at), "Invalid women-football checked_at");
  validateLocalizedText(payload.summary, "women-football.summary");
  validateLocalizedText(payload.scope_note, "women-football.scope_note");

  const tournament = payload.u17_world_cup;
  assert(tournament && Array.isArray(tournament.editions), "Missing U17 women's World Cup editions");
  validateLocalizedText(tournament.summary, "u17_world_cup.summary");
  assert(
    JSON.stringify(tournament.editions.map((edition) => edition.id)) === JSON.stringify(expectedEditionIds),
    "U17 women's World Cup edition ids drifted"
  );

  for (const edition of tournament.editions) {
    assert(editionStatuses.has(edition.status), `Invalid edition status on ${edition.id}`);
    assert(chinaStages.has(edition.china_stage), `Invalid China stage on ${edition.id}`);
    assert(edition.china_stage === expectedChinaStages[edition.id], `Unexpected China stage on ${edition.id}`);
    validateLocalizedText(edition.china_summary, `${edition.id}.china_summary`);
    assertHttps(edition.source_url, edition.id);
    if (edition.status === "completed") {
      assert(edition.champion === expectedChampions[edition.id], `Unexpected champion on ${edition.id}`);
      assert(typeof edition.runner_up === "string" && edition.runner_up.length > 0, `Missing runner-up on ${edition.id}`);
      assert(typeof edition.third_place === "string" && edition.third_place.length > 0, `Missing third place on ${edition.id}`);
      assert(typeof edition.final_score === "string" && edition.final_score.length > 0, `Missing final score on ${edition.id}`);
      assert(edition.finals_teams === 16 || edition.finals_teams === 24, `Invalid field size on ${edition.id}`);
    } else {
      assert(edition.champion === null, `Open edition must not store a champion: ${edition.id}`);
      assert(edition.final_score === null, `Open edition must not store a final score: ${edition.id}`);
    }
  }

  const current = tournament.editions.find((edition) => edition.id === "fifa-u17-womens-world-cup-2026");
  assert(current.status === "completed", "2026 U17 women's World Cup closed with the 7 November final");
  assert(current.date_range.start === "2026-10-17" && current.date_range.end === "2026-11-07", "Unexpected 2026 dates");
  const china2026 = tournament.china_2026;
  assert(china2026.group === "E" && china2026.rank === 1 && china2026.points === 9, "Unexpected 2026 China group line");
  assert(china2026.goals_for === 13 && china2026.goals_against === 2, "Unexpected 2026 China group goals");
  assert(Array.isArray(china2026.matches) && china2026.matches.length === 5, "Expected five 2026 China matches");
  const goalSum = china2026.matches
    .filter((match) => match.stage === "group" && match.played)
    .reduce((sum, match) => sum + match.china_goals, 0);
  assert(goalSum === china2026.goals_for, "2026 China group goals do not add up");
  const quarterFinal = china2026.matches.at(-1);
  assert(quarterFinal.id === "u17wwc-2026-china-brazil", "2026 quarter-final id drifted");
  assert(
    quarterFinal.played === true &&
      quarterFinal.scoreline === "1-2" &&
      quarterFinal.china_goals === 1 &&
      quarterFinal.opponent_goals === 2,
    "2026 quarter-final must record the 1-2 loss to Brazil"
  );
  assert(quarterFinal.opponent === "Brazil" && quarterFinal.date === "2026-11-01", "Unexpected 2026 quarter-final pairing");
  for (const match of china2026.matches) {
    assert(verificationStatuses.has(match.verification_status), `Invalid match verification on ${match.id}`);
    assertHttps(match.source_url, match.id);
    validateLocalizedText(match.note, `${match.id}.note`);
    validateLocalizedText(match.scorers, `${match.id}.scorers`);
    if (match.played) {
      assert(typeof match.scoreline === "string" && match.scoreline.length > 0, `Missing scoreline on ${match.id}`);
      assert(Number.isInteger(match.china_goals) && Number.isInteger(match.opponent_goals), `Missing goals on ${match.id}`);
    }
  }

  assert(
    JSON.stringify(payload.big_five_leagues.map((league) => league.id)) === JSON.stringify(expectedBigFiveIds),
    "Women's big five league ids drifted"
  );
  const leagueIds = new Set();
  for (const league of [...payload.big_five_leagues, ...payload.other_leagues]) {
    assert(!leagueIds.has(league.id), `Duplicate women's league id: ${league.id}`);
    leagueIds.add(league.id);
    validateLocalizedText(league.name, `${league.id}.name`);
    validateLocalizedText(league.stable_structure, `${league.id}.stable_structure`);
    assertHttps(league.source_url, league.id);
  }
  assert(
    payload.players.every((player) => player.stages.every((stage) => stage.league_id !== "frauen-bundesliga")),
    "Frauen-Bundesliga must stay empty in this snapshot"
  );

  assert(
    JSON.stringify(payload.players.map((player) => player.id)) === JSON.stringify(expectedPlayerIds),
    "Women's player sample drifted"
  );
  const stageIds = new Set();
  for (const player of payload.players) {
    assert(typeof player.name_zh === "string" && typeof player.name_en === "string", `Missing name on ${player.id}`);
    validateLocalizedText(player.summary, `${player.id}.summary`);
    assert(Array.isArray(player.stages) && player.stages.length > 0, `Missing stages on ${player.id}`);
    for (const stage of player.stages) {
      assert(!stageIds.has(stage.id), `Duplicate women's stage id: ${stage.id}`);
      stageIds.add(stage.id);
      assert(leagueIds.has(stage.league_id), `Unknown league on ${stage.id}`);
      assert(buckets.has(stage.bucket), `Invalid bucket on ${stage.id}`);
      const bigFive = expectedBigFiveIds.includes(stage.league_id);
      assert(
        bigFive ? stage.bucket === "big-five" : stage.bucket !== "big-five",
        `Bucket does not match league tier on ${stage.id}`
      );
      assert(appearanceStatuses.has(stage.appearance_status), `Invalid appearance status on ${stage.id}`);
      assert(verificationStatuses.has(stage.verification_status), `Invalid verification on ${stage.id}`);
      assert(stage.club === null ? stage.verification_status === "needs-review" : typeof stage.club === "string", `Invalid club on ${stage.id}`);
      validateLocalizedText(stage.season, `${stage.id}.season`);
      assertHttps(stage.source_url, stage.id);
      validateLocalizedText(stage.note, `${stage.id}.note`);
    }
  }

  const grasshoppers = payload.players
    .find((player) => player.id === "zhang-linyan")
    .stages.find((stage) => stage.id === "zhang-linyan-grasshoppers");
  assert(grasshoppers.bucket === "europe-other", "Zhang Linyan's Swiss spell must stay outside the big five");
  const louisville = payload.players
    .find((player) => player.id === "wang-shuang")
    .stages.find((stage) => stage.id === "wang-shuang-louisville-2022");
  assert(louisville.bucket === "americas", "Wang Shuang's NWSL spell must stay outside the big five");
  const benfica = payload.players
    .find((player) => player.id === "shao-ziqin")
    .stages.find((stage) => stage.id === "shao-ziqin-benfica-2026");
  assert(benfica.bucket === "europe-other", "Shao Ziqin's Benfica spell must stay outside the big five");
  const yangItaly = payload.players
    .find((player) => player.id === "yang-lina")
    .stages.find((stage) => stage.id === "yang-lina-serie-a-2026");
  assert(yangItaly.club === null, "Yang Lina's 2026 Serie A club must stay unnamed");

  assert(Array.isArray(payload.source_links) && payload.source_links.length >= 4, "Missing women's football sources");
  for (const source of payload.source_links) {
    assert(typeof source.label === "string" && source.label.length > 0, "Missing women's source label");
    assertHttps(source.url, source.label);
    assert(isIsoDate(source.checked_at), `Invalid source date on ${source.label}`);
  }
}
