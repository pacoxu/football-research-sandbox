import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dossierPath = path.join(root, "data/raw/dossiers.json");
const projectPath = path.join(root, "data/raw/projects.json");
const checkedAt = "2026-07-20";
const targetIds = new Set([
  "donglu-football-boys",
  "wanda-spain-plan",
  "genbao-football-base",
  "evergrande-football-school",
  "luneng-football-school",
  "olympic-stars-germany",
  "500-star-portugal"
]);

const membershipByView = {
  "verified-core-9": "development-core",
  "netherlands-cup-21": "tournament-only",
  "user-image-2029-u20-projection": "prediction-only",
  "status-samples-2017": "batch-participant",
  "spain-registered-samples-2017": "batch-participant",
  "returned-to-domestic-pathway-2016-2017": "batch-participant",
  "returned-but-needs-follow-up-2017": "batch-participant",
  "departure-list-2004": "batch-participant",
  "widened-85-national-team-context": "project-adjacent",
  "representative-outcomes": "batch-participant",
  "representative-samples": "batch-participant"
};

const dongluBatches = [
  {
    id: "2014-suzhou-selection-16",
    name: "2014 梯队苏州海选最终名单",
    confidence: "A",
    description: "中国足球小将官方微博公布的 16 人海选最终名单；这是批次入选关系，不等同于永久长期培养身份。",
    reported_count: 16,
    relationship: "batch-participant",
    source_label: "中国足球小将官方：2014 梯队苏州海选最终 16 人",
    source_url: "https://www.sina.cn/news/detail/4866099529648440.html",
    people: ["周航锐", "杨耘硕", "袁良宇", "高安泰", "钟予哲", "路浩然", "宋文卓", "崔雲沧", "卞清尧", "孟新艺", "张辰麟", "郭俊贤", "金岷骏", "韩承澔", "胡泓磊", "杨博轩"]
  },
  {
    id: "2015-announced-squad-25",
    name: "2015 梯队公开名单",
    confidence: "A/B",
    description: "公开报道逐名列出的 25 人批次名单，其中包含一名女球员；记录的是梯队公布时点。",
    reported_count: 25,
    relationship: "batch-participant",
    source_label: "腾讯新闻 / 直播吧：2015 梯队 25 人名单",
    source_url: "https://news.qq.com/rain/a/20240319A01JFE00",
    people: ["叶禹同", "梅宇昊", "李蓬", "王泽皓", "谢咏勋", "王煜乐", "郭沐晨", "杨吉力", "曹丙庆", "王梓杰", "王子铭", "李骏德", "李其鸿", "王子嘉", "徐梓阳", "王皓竣", "张泽熙", "梁俊熙", "汤梓豪", "刘佳翰", "柴宇轩", "白紫轩", "金星辰", "张苗倩", "刘禾沐"]
  },
  {
    id: "2016-manuel-cup-12",
    name: "2016 梯队曼努埃尔杯赛会名单",
    confidence: "A/B",
    description: "西班牙曼努埃尔杯 12 人赛会名单，仅表示该届赛事参赛关系，不计入长期培养核心。",
    reported_count: 12,
    relationship: "tournament-only",
    source_label: "直播吧：中国足球小将 2016 曼努埃尔杯 12 人名单",
    source_url: "https://news.zhibo8.com/zuqiu/2025-10-31/690420b6197a5native.htm",
    people: ["兰汶霖", "孙艺哲", "张鸿达", "张洋", "吕世豪", "郑钧瀚", "朱晖", "魏隆屹", "甄英涵", "周李正", "阿卜杜外力-吾买尔江", "林迈可"]
  }
];

const starLaunchRoster = [
  "谢鹏飞", "阮杨", "石柯", "李源一", "储今朝", "刘阳", "李放", "金波",
  "龚良轩", "王猛", "陈凯", "吴毅臻", "罗竞", "高盛", "黄威", "廖均健",
  "李成林", "孙正扬", "贺惯", "常飞亚", "韦世豪", "陈哲超", "周煜辰", "黄嘉俊"
];

const wandaCohorts = [2012, 2013, 2014, 2015, 2016].map((year, index) => ({
  id: `wanda-spain-cohort-${index + 1}-${year}`,
  name: `万达西班牙计划第 ${index + 1} 批（${year}）`,
  reported_count: 30
}));

function containsHan(value = "") {
  return /[\u3400-\u9fff]/u.test(value);
}

function canonicalNames(player) {
  if (containsHan(player.local_name)) return { name: player.name || player.local_name, local_name: player.local_name };
  if (containsHan(player.name)) return { name: player.local_name || player.name, local_name: player.name };
  return { name: player.name || player.local_name, local_name: player.local_name || player.name };
}

function identityKey(player) {
  const names = canonicalNames(player);
  return (names.local_name || names.name).normalize("NFKC").replace(/[·•\s-]/gu, "").toLowerCase();
}

function slug(value) {
  const ascii = value.normalize("NFKD").replace(/[^\p{Letter}\p{Number}]+/gu, "-").replace(/^-|-$/g, "").toLowerCase();
  return ascii || Buffer.from(value).toString("hex").slice(0, 24);
}

function loadPlayerIndex() {
  const playersDir = path.join(root, "data/raw/players");
  const records = fs.readdirSync(playersDir).filter((file) => file.endsWith(".json"))
    .flatMap((file) => JSON.parse(fs.readFileSync(path.join(playersDir, file), "utf8")));
  const overrides = JSON.parse(fs.readFileSync(path.join(root, "data/raw/player-name-overrides.json"), "utf8"));
  const overrideList = Array.isArray(overrides) ? overrides : (overrides.players ?? overrides.overrides ?? []);
  const aliases = new Map();
  for (const player of records) {
    for (const value of [player.name, player.local_name]) {
      if (value) aliases.set(identityKey({ name: value, local_name: value }), player.id);
    }
  }
  for (const item of overrideList) {
    for (const value of Object.values(item.names ?? item)) {
      if (typeof value === "string" && value) aliases.set(identityKey({ name: value, local_name: value }), item.player_id ?? item.id);
    }
  }
  return aliases;
}

const playerIndex = loadPlayerIndex();

function unresolvedStatus(dossier) {
  const source = [dossier.source_document, ...(dossier.supporting_documents ?? [])]
    .find((item) => /^https?:\/\//.test(item.path));
  return {
    category: "needs-review",
    organization: "待核实",
    role: "player",
    as_of: checkedAt,
    confidence: "low",
    source_label: `现状复核入口：${source?.title ?? dossier.source_document.title}`,
    source_url: source?.path ?? dossier.source_document.path,
    notes: "该来源可支撑项目或历史身份，但未提供截至核查日的直接当前注册去向；因此不沿用历史俱乐部作当前事实。"
  };
}

function ensurePostMigration(dossier) {
  if (dossier.schema_version !== 2) return dossier;
  const byName = new Map(dossier.people.map((person) => [identityKey(person), person]));
  const ensurePerson = (localName) => {
    const key = identityKey({ name: localName, local_name: localName });
    if (byName.has(key)) return byName.get(key);
    const person = {
      id: `${dossier.id}-${slug(localName)}`,
      ...(playerIndex.get(key) ? { player_id: playerIndex.get(key) } : {}),
      name: localName,
      local_name: localName,
      role: "未标注",
      note: "公开名单成员；当前去向需以新的直接注册来源继续复核。",
      current_status: unresolvedStatus(dossier)
    };
    dossier.people.push(person);
    byName.set(key, person);
    return person;
  };

  if (dossier.id === "500-star-portugal" && !dossier.roster_views.some((view) => view.id === "official-launch-roster-24")) {
    const members = starLaunchRoster.map((localName) => ({
      person_id: ensurePerson(localName).id,
      relationship: "batch-participant",
      verification_status: "verified",
      source_label: "新浪体育：中国足协 500.com 星计划赴葡 24 人名单",
      source_url: "https://sports.sina.cn/sa/2011-09-07/detail-ikknscsh8922277.d.html?vt=4"
    }));
    dossier.roster_views.unshift({
      id: "official-launch-roster-24",
      name: "2011 启动批次正式 24 人名单",
      confidence: "A/B",
      description: "出征报道逐名列出的 24 人正式名单；与后续 41 人宽口径回顾分开统计。",
      source_url: members[0].source_url,
      members,
      counting: makeCounting({ reported_count: 24 }, members)
    });
  }

  if (dossier.id === "wanda-spain-plan") {
    for (const cohort of wandaCohorts) {
      if (dossier.roster_views.some((view) => view.id === cohort.id)) continue;
      dossier.roster_views.push({
        id: cohort.id,
        name: cohort.name,
        confidence: "B",
        description: "项目公开口径为每批约 30 人；当前来源不足以把既有状态样本可靠反向分配到该批次，因此不创建匿名人物或猜测批次。",
        members: [],
        counting: {
          reported_count: cohort.reported_count,
          listed_count: 0,
          unique_people_count: 0,
          verified_people_count: 0,
          needs_review_count: 0,
          completeness: "partial",
          included_in_verified_core: false,
          note: "公开批次人数已记录，逐名名单仍待官方或同期出征材料补齐。"
        }
      });
    }
  }

  const verifiedCore = new Set(dossier.roster_views.flatMap((view) => view.members)
    .filter((member) => member.verification_status === "verified" && !["partner-player", "project-adjacent", "prediction-only", "tournament-only"].includes(member.relationship))
    .map((member) => member.person_id));
  dossier.headline_stats = {
    ...(dossier.headline_stats ?? {}),
    tracked_generations: dossier.roster_views.length,
    tracked_players: dossier.people.length,
    verified_core_people: verifiedCore.size,
    needs_review_people: dossier.people.filter((person) => person.current_status.category === "needs-review").length
  };
  return dossier;
}

function migrateDossier(dossier) {
  if (!targetIds.has(dossier.id)) return dossier;
  if (dossier.schema_version === 2) return ensurePostMigration(dossier);
  const peopleByKey = new Map();
  const personIds = new Set();
  const addPerson = (raw) => {
    const names = canonicalNames(raw);
    const key = identityKey(raw);
    if (peopleByKey.has(key)) {
      const existing = peopleByKey.get(key);
      if (!existing.player_id) existing.player_id = raw.player_id ?? playerIndex.get(key);
      return existing;
    }
    let id = `${dossier.id}-${slug(names.local_name || names.name)}`;
    let suffix = 2;
    while (personIds.has(id)) id = `${dossier.id}-${slug(names.local_name || names.name)}-${suffix++}`;
    personIds.add(id);
    const person = {
      id,
      ...(raw.player_id ?? playerIndex.get(key) ? { player_id: raw.player_id ?? playerIndex.get(key) } : {}),
      name: names.name,
      local_name: names.local_name,
      role: raw.role || "未标注",
      note: raw.note || "",
      current_status: raw.current_status ?? unresolvedStatus(dossier)
    };
    peopleByKey.set(key, person);
    return person;
  };

  const eventRecords = [...(dossier.event_records ?? [])];
  const programMetrics = [...(dossier.program_metrics ?? [])];
  const views = [];

  for (const view of dossier.roster_views ?? []) {
    if (dossier.id === "donglu-football-boys" && view.id === "2034-cup-finals-results") {
      for (const record of view.players ?? []) eventRecords.push({ ...record, event: view.name, source_url: view.source_url ?? dossier.source_document.path });
      continue;
    }
    if (dossier.id === "500-star-portugal" && view.id === "execution-structure") {
      for (const record of view.players ?? []) programMetrics.push({ ...record, source_url: view.source_url ?? dossier.source_document.path });
      continue;
    }
    const relationship = membershipByView[view.id] ?? "development-core";
    const members = (view.players ?? []).map((raw) => {
      const person = addPerson(raw);
      const partner = dossier.id === "donglu-football-boys" && /Tiago|Rafael|Sekou|Albert|Aitor/i.test(raw.name ?? "");
      const memberRelationship = partner ? "partner-player" : relationship;
      return {
        person_id: person.id,
        relationship: memberRelationship,
        verification_status: memberRelationship === "prediction-only" ? "needs-review" : "verified",
        ...(raw.club ? { historical_organization: raw.club } : {}),
        ...(raw.note ? { note: raw.note } : {})
      };
    });
    views.push({ ...view, players: undefined, members, counting: makeCounting(view, members) });
  }

  if (dossier.id === "donglu-football-boys") {
    for (const batch of dongluBatches) {
      const members = batch.people.map((localName) => {
        const person = addPerson({ name: localName, local_name: localName, role: "未标注" });
        return {
          person_id: person.id,
          relationship: batch.relationship,
          verification_status: "verified",
          source_label: batch.source_label,
          source_url: batch.source_url
        };
      });
      views.push({
        id: batch.id,
        name: batch.name,
        confidence: batch.confidence,
        description: batch.description,
        source_url: batch.source_url,
        members,
        counting: makeCounting(batch, members)
      });
    }
  }

  for (const view of views) view.counting = makeCounting(view, view.members);
  const people = [...peopleByKey.values()];
  const verifiedPeople = new Set(views.flatMap((view) => view.members)
    .filter((member) => member.verification_status === "verified" && !["partner-player", "project-adjacent", "prediction-only", "tournament-only"].includes(member.relationship))
    .map((member) => member.person_id));

  return ensurePostMigration({
    ...dossier,
    schema_version: 2,
    last_reviewed: checkedAt,
    source_checked_at: checkedAt,
    people,
    roster_views: views,
    event_records: eventRecords,
    program_metrics: programMetrics,
    headline_stats: {
      ...(dossier.headline_stats ?? {}),
      tracked_generations: views.length,
      tracked_players: people.length,
      verified_core_people: verifiedPeople.size,
      needs_review_people: people.filter((person) => person.current_status.category === "needs-review").length
    }
  });
}

function makeCounting(view, members) {
  const unique = new Set(members.map((member) => member.person_id));
  const verified = members.filter((member) => member.verification_status === "verified").length;
  const reported = view.reported_count ?? view.counting?.reported_count ?? members.length;
  return {
    reported_count: reported,
    listed_count: members.length,
    unique_people_count: unique.size,
    verified_people_count: verified,
    needs_review_count: members.length - verified,
    completeness: reported === members.length ? "complete" : "partial",
    included_in_verified_core: !members.some((member) => ["partner-player", "project-adjacent", "prediction-only", "tournament-only"].includes(member.relationship)),
    note: view.counting?.note ?? (reported === members.length ? "逐名记录与公开人数口径一致。" : `公开口径为 ${reported} 人，当前逐名记录 ${members.length} 人；差额不以匿名人物占位。`)
  };
}

const dossiers = JSON.parse(fs.readFileSync(dossierPath, "utf8")).map(migrateDossier);
fs.writeFileSync(dossierPath, `${JSON.stringify(dossiers, null, 2)}\n`);

const projects = JSON.parse(fs.readFileSync(projectPath, "utf8")).map((project) => {
  if (!targetIds.has(project.id)) return project;
  const completionNote = "已升级为逐名人物、批次关系、可复算人数口径和唯一现状结构；待核线索不计入已验证核心。";
  return {
    ...project,
    completed: project.completed.includes(completionNote) ? project.completed : `${project.completed} ${completionNote}`,
    next_step: "按复核周期继续补充仍为 needs-review 的当前去向，并用新的直接来源替换历史入口。"
  };
});
fs.writeFileSync(projectPath, `${JSON.stringify(projects, null, 2)}\n`);
