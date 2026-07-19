import {
  buildCoachCatalog,
  buildProjectCatalog,
  buildU20Honours,
  buildYouthSystemComparison,
  deriveQualityStatus,
  getSourceTier
} from "./data-insights.js";

const page = document.body.dataset.page;
const pageDate = document.body.dataset.date || "2026-06-25";
const LANGUAGE_STORAGE_KEY = "youth-tracker-language";
const SITE_ASSET_VERSION =
  (() => {
    const script = document.querySelector('script[src*="./assets/app.js"], script[src*="/assets/app.js"], script[src*="assets/app.js"]');
    if (!script?.src) {
      return "";
    }

    try {
      return new URL(script.src, window.location.href).searchParams.get("v") ?? "";
    } catch {
      return "";
    }
  })() || pageDate.replaceAll("-", "");
const SITE_DATA_VERSION = SITE_ASSET_VERSION;

const state = {
  language: "zh",
  players: [],
  overview: null,
  meta: null,
  enrichedPlayers: [],
  playerFilters: {
    query: "",
    country: "all",
    ageBand: "all",
    competition: "all",
    leagueSystem: "all",
    organizationType: "all",
    tag: "all",
    sort: "default",
    view: "cards"
  },
  scoutingCountry: "all",
  pathwaysCountry: "Japan",
  tournamentFilters: {
    level: "all"
  },
  youthLeagueFilters: {
    season: "all",
    country: "all",
    status: "all"
  },
  overseasFilters: {
    country: "all",
    bucket: "all",
    teamLevel: "all",
    year: "all"
  },
  dataCenter: {
    view: "quality",
    overviewError: null,
    metaError: null,
    projectQuery: "",
    projectCountry: "all",
    projectCategory: "all",
    projectStatus: "all",
    coachQuery: "",
    coachCategory: "all",
    coachCountry: "all",
    coachStatus: "all"
  }
};

const UI_COPY = {
  zh: {
    "page.home.title": "青训球员追踪站",
    "page.home.description": "聚焦中国青训、亚洲青年赛事与中日韩留洋样本的静态数据站。",
    "page.players.title": "球员列表 | 青训球员追踪站",
    "page.players.description": "按国籍、年龄段、赛事、联赛或体系、标签筛选青训与青年球员样本。",
    "page.player-detail.title": "球员详情 | 青训球员追踪站",
    "page.player-detail.description": "查看球员青训路径、赛事经历、当前归属、最近贡献与外部资料链接。",
    "page.tournaments.title": "赛事列表 | 青训球员追踪站",
    "page.tournaments.description": "按赛事层级查看亚洲杯、世界杯、世青赛、世少赛的比赛时间、结果、中国战绩与来源链接。",
    "page.youth-league.title": "欧洲青年冠军联赛 | 青训球员追踪站",
    "page.youth-league.description": "欧洲青年冠军联赛近三个赛季的资格、赛制、淘汰赛与中日韩球员专题。",
    "page.tournament-detail.title": "赛事详情 | 青训球员追踪站",
    "page.tournament-detail.description": "查看单项赛事的时间范围、中国战绩、比赛明细、关键球员与来源链接。",
    "page.overseas.title": "留洋专页 | 青训球员追踪站",
    "page.overseas.description": "查看中日韩当前留洋样本、联赛层级对比与历史记录。",
    "page.pathways.title": "青训体系与项目 | 青训球员追踪站",
    "page.pathways.description": "比较日本、韩国、挪威、丹麦和瑞典的学校足球、俱乐部学院、人才识别与职业桥梁。",
    "page.coaches.title": "青训教练 | 青训球员追踪站",
    "page.coaches.description": "查看中国基层青训教练与男足 U 系列教练组、执教机构、年龄段及官方来源。",
    "page.data-center.title": "数据质量与对比 | 青训球员追踪站",
    "page.data-center.description": "查看研究样本的数据完整度、来源等级、复核时效、国家青训对比、项目目录与教练目录。",
    "page.dossier-detail.title": "青训专题 | 青训球员追踪站",
    "page.dossier-detail.description": "查看青训机构沿革、代表球员代际、当前状态和来源边界。",
    "site.kicker": "青训追踪台",
    "site.brand": "青训球员追踪站",
    "nav.aria": "主导航",
    "nav.home": "首页",
    "nav.players": "球员",
    "nav.tournaments": "赛事",
    "nav.overseas": "留洋",
    "nav.pathways": "青训体系",
    "nav.coaches": "青训教练",
    "nav.dataCenter": "数据中心",
    "header.language": "语言",
    "common.loading": "加载中",
    "common.loadingData": "数据载入中",
    "common.updatedAt": "聚合生成：{date}",
    "common.pageRenderErrorTitle": "页面渲染失败",
    "common.pending": "待补",
    "common.none": "暂无",
    "common.unknown": "未知",
    "common.noTags": "无标签",
    "common.noLinks": "暂无外链",
    "common.age": "{age} 岁",
    "home.hero.eyebrow": "Tracker",
    "home.hero.title": "青训球员追踪站",
    "home.hero.text": "追踪中国青训球员、赛事表现与留洋动态。",
    "home.hero.ctaPlayers": "查看球员",
    "home.hero.ctaTournaments": "查看赛事",
    "home.nextEvent.eyebrow": "当前重点赛事",
    "home.stats.aria": "数据概览",
    "home.stats.players": "球员样本",
    "home.stats.overseas": "当前留洋样本",
    "home.stats.archive": "赛事档案",
    "home.stats.updated": "更新至",
    "home.recentMatches.eyebrow": "Recent Matches",
    "home.recentMatches.title": "最近比赛",
    "home.recentMatches.link": "查看赛事",
    "home.quickLinks.eyebrow": "Quick Links",
    "home.quickLinks.title": "快捷入口",
    "home.quickLinks.playersTitle": "球员",
    "home.quickLinks.playersText": "按国籍、年龄段、赛事和标签筛选球员样本。",
    "home.quickLinks.tournamentsTitle": "赛事",
    "home.quickLinks.tournamentsText": "查看赛事时间、结果和中国队比赛明细。",
    "home.quickLinks.overseasTitle": "留洋",
    "home.quickLinks.overseasText": "区分当前留洋样本与历史记录。",
    "home.quickLinks.genbaoTitle": "根宝足球基地",
    "home.quickLinks.genbaoText": "按代际查看基地代表球员、培养路径与当前状态。",
    "home.quickLinks.coachesTitle": "青训教练",
    "home.quickLinks.coachesText": "查看基层教练、国字号 U 系列教练组与官方来源。",
    "home.overseasSummary.eyebrow": "Overseas Overview",
    "home.overseasSummary.title": "留洋概览",
    "home.overseasSummary.link": "查看留洋",
    "home.recent.noContrib": "本场暂无已录入的进球 / 助攻事件。",
    "home.recent.matchLabel": "{stage} · {date} · 中国 vs {opponent} {score}",
    "home.nextQueue.china": "中国：{summary}",
    "home.overseasSummary.playerGroup": "{country}球员",
    "home.overseasSummary.currentCount": "当前样本 {count} 人",
    "home.overseasSummary.history": "历史记录 {count} 条",
    "home.overseasSummary.currentShort": "当前",
    "home.overseasSummary.historyShort": "历史",
    "home.focus.record": "{matches} 场 · {wins} 胜 {draws} 平 {losses} 负",
    "home.focus.recordFallback": "{team}：{summary}",
    "home.focus.status": "状态：{value}",
    "home.focus.period": "周期：{value}",
    "home.focus.scope": "建档：{value}",
    "home.focus.latest": "最近进展：{value}",
    "home.focus.sources": "来源：{count} 条",
    "home.project.goal": "目标：{value}",
    "home.project.completed": "已完成：{value}",
    "home.project.nextStep": "下一步：{value}",
    "home.topic.eyebrow": "Special Topic",
    "home.topic.title": "中国足球小将专题",
    "home.topic.link": "查看相关球员",
    "home.topic.timelineTitle": "项目时间线",
    "home.topic.timelineLink": "查看球员标签",
    "home.topic.batchesTitle": "公开可核批次主干",
    "home.topic.roleTitle": "董路在项目里的角色",
    "home.topic.scopeTitle": "当前专题口径",
    "home.topic.completedTitle": "当前已补内容",
    "home.topic.nextTitle": "下一步",
    "home.topic.taggedPlayers": "已建档相关球员 {count} 人",
    "home.topic.batchCount": "公开批次 {count} 组",
    "home.topic.timelineCount": "关键节点 {count} 个",
    "home.topic.batchPlayers": "已核名字 {count} 个",
    "home.topic.batchWindow": "时间窗口：{value}",
    "home.topic.batchSample": "样本：{value}",
    "home.topic.empty": "当前还没有可展示的足球小将专题。",
    "home.topic.batchesEmpty": "当前还没有可展示的批次主干。",
    "home.overseasCard.current": "当前：{value}",
    "home.overseasCard.region": "地区：{value}",
    "home.overseasCard.origin": "来源：{value}",
    "home.overseasCard.path": "留洋经历：{value}",
    "home.overseasCard.sample": "样本：{value}",
    "home.overseasCard.league": "赛事或联赛：{value}",
    "players.hero.eyebrow": "Player Directory",
    "players.hero.title": "球员列表",
    "players.hero.text": "这里是球员库总入口。支持按国籍、年龄段、赛事、联赛或体系及专题标签过滤，并展示当前球员库身价排行；下方另列中日韩留洋历史代表样本峰值榜。",
    "players.view.eyebrow": "View Modes",
    "players.view.aria": "视图切换",
    "players.view.cards": "卡片",
    "players.view.table": "列表",
    "players.rankings.eyebrow": "Transfermarkt",
    "players.rankings.currentTitle": "当前身价排行",
    "players.rankings.peakTitle": "当前球员库峰值排行",
    "players.rankings.note": "仅统计本页当前球员库中已关联 Transfermarkt 个人页且已有估值的球员；排行会跟随当前筛选更新，不代表中日韩留洋历史全榜。",
    "players.rankings.coverageCurrent": "当前筛选已补当前身价 {count} / {total} 人",
    "players.rankings.coveragePeak": "当前筛选已补历史峰值 {count} / {total} 人",
    "players.rankings.currentEmpty": "当前筛选下还没有可用的当前身价数据。",
    "players.rankings.peakEmpty": "当前筛选下还没有可用的历史峰值数据。",
    "players.rankings.currentMeta": "峰值 {value} · {date}",
    "players.rankings.peakMeta": "当前 {value} · 达峰于 {date}",
    "players.rankings.peakMetaNoCurrent": "达峰于 {date}",
    "players.rankings.historyTitle": "中日韩留洋历史峰值排行",
    "players.rankings.historyCoverage": "已建档历史代表样本 {count} 人 · 独立于上方球员筛选",
    "players.rankings.historyMeta": "{club} · {date} · {age} 岁",
    "players.rankings.historyCurrent": "当前 {value}",
    "players.rankings.historyRetired": "已退役",
    "players.rankings.historyNote": "口径：仅统计留洋史已建档且有 Transfermarkt 历史估值的中日韩代表样本，不是亚洲球员全量榜。金额为当时名义欧元估值，不做通胀或年代校正；早期球员的历史曲线可能覆盖不完整。",
    "players.rankings.historyEmpty": "暂没有可展示的留洋历史峰值数据。",
    "players.filters.search": "搜索",
    "players.filters.searchPlaceholder": "中文名、原文名、英文名、俱乐部、标签",
    "players.filters.country": "国籍",
    "players.filters.ageBand": "年龄段",
    "players.filters.competition": "赛事",
    "players.filters.league": "联赛 / 体系",
    "players.filters.organizationType": "培养组织类型",
    "players.filters.tag": "标签",
    "players.filters.sort": "排序",
    "players.sort.default": "默认顺序",
    "players.sort.ageAsc": "年龄：从小到大",
    "players.sort.ageDesc": "年龄：从大到小",
    "players.sort.marketValueDesc": "身价：从高到低",
    "players.sort.marketValueAsc": "身价：从低到高",
    "players.filters.actions": "操作",
    "players.filters.reset": "重置筛选",
    "players.filters.allCountry": "全部国籍",
    "players.filters.allAgeBand": "全部年龄段",
    "players.filters.allCompetition": "全部赛事",
    "players.filters.allLeague": "全部联赛 / 体系",
    "players.filters.allOrganizationType": "全部组织类型",
    "players.filters.allTag": "全部标签",
    "players.table.player": "球员",
    "players.table.country": "国籍",
    "players.table.age": "年龄",
    "players.table.marketValue": "当前身价",
    "players.table.marketValuePeak": "峰值 {value}",
    "players.table.club": "球队 / 报名归属",
    "players.table.league": "联赛 / 体系",
    "players.table.tag": "标签",
    "players.table.detail": "查看",
    "players.empty": "当前筛选条件下没有匹配球员。",
    "players.meta.results": "当前命中 {count} / {total} 名球员",
    "players.card.positionPending": "位置待补",
    "players.card.clubPending": "当前球队待补",
    "players.card.marketValueBoth": "当前身价 {current} · 峰值 {peak}",
    "players.card.marketValueCurrentOnly": "当前身价 {current}",
    "players.card.marketValuePeakOnly": "历史峰值 {peak}",
    "players.card.viewProfile": "查看球员档案",
    "players.card.details": "查看",
    "coaches.hero.eyebrow": "Youth Coaches",
    "coaches.hero.title": "青训教练",
    "coaches.hero.text": "集中查看基层、校园、足校和民间青训教练，以及中国男足 U 系列教练组。每条记录保留职责边界和原始来源。",
    "coaches.coverage.eyebrow": "Coverage",
    "coaches.coverage.value": "基层教练 {development} 人 · 国字号周期 {national} 条",
    "coaches.coverage.checked": "基层样本核查至 {development} · 国字号核查至 {national}",
    "coaches.development.eyebrow": "Grassroots & Academy",
    "coaches.development.title": "基层与青训机构教练",
    "coaches.development.note": "只收录能够确认具名机构和实际训练或技术职责的教练，不以行政头衔或球员经历代替执教事实。",
    "coaches.development.period": "任期：{value}",
    "coaches.development.sources": "来源 {count} 条",
    "coaches.development.source": "查看来源",
    "coaches.national.eyebrow": "National Youth Teams",
    "coaches.national.title": "中国男足 U 系列教练组",
    "coaches.national.coach": "主教练：{value}",
    "coaches.national.latest": "最近集训：{value}",
    "coaches.national.window": "时间：{value}",
    "coaches.national.staff": "教练与保障团队",
    "coaches.national.sources": "官方任命与集训来源",
    "coaches.watchlist.eyebrow": "Research Queue",
    "coaches.watchlist.title": "待补教练与机构",
    "coaches.watchlist.need": "待核：{value}",
    "players.scouting.eyebrow": "Scouting Watchlist",
    "players.scouting.title": "FTS 亚洲青年球员观察池",
    "players.scouting.country": "国家 / 地区",
    "players.scouting.allCountry": "全部国家 / 地区",
    "players.scouting.meta": "当前展示 {count} / {total} 人 · 覆盖 {countries} 个 AFC 国家 / 地区",
    "players.scouting.rating": "潜力评分 {value}/10",
    "players.scouting.unrated": "未给出公开评分",
    "players.scouting.original": "查看 FTS 原文",
    "players.scouting.profile": "站内球员档案",
    "players.scouting.checked": "链接核查：{date}",
    "players.scouting.collections": "相关 FTS 合集",
    "players.scouting.type.image-report": "图片报告",
    "players.scouting.type.talent-of-the-day": "每日天才",
    "players.scouting.type.player-profile": "球员报告",
    "players.scouting.type.guest-report": "客座报告",
    "playerDetail.breadcrumb.list": "球员列表",
    "playerDetail.breadcrumb.detail": "球员详情",
    "playerDetail.pathway.eyebrow": "Pathway",
    "playerDetail.pathway.title": "青训路径与归属变化",
    "playerDetail.competition.eyebrow": "Competition Log",
    "playerDetail.competition.title": "赛事经历",
    "playerDetail.verification.eyebrow": "Verification",
    "playerDetail.verification.title": "校验状态",
    "playerDetail.recent.eyebrow": "Recent Contributions",
    "playerDetail.recent.title": "最近贡献",
    "playerDetail.links.eyebrow": "External Links",
    "playerDetail.links.title": "外部资料与来源",
    "playerDetail.sources.eyebrow": "Source Layers",
    "playerDetail.sources.title": "来源层与培养体系",
    "playerDetail.sources.empty": "当前还没有结构化来源层。",
    "playerDetail.sources.fields": "支撑字段：{fields}",
    "playerDetail.sources.checked": "核查：{date} · 可信度：{confidence}",
    "playerDetail.stats.organizationType": "培养组织类型",
    "playerDetail.stats.parentOrganization": "母俱乐部",
    "playerDetail.stats.educationPartner": "合作学校",
    "playerDetail.pathway.context": "赛事环境",
    "pathways.hero.eyebrow": "Youth Development Systems",
    "pathways.hero.title": "青训体系与项目",
    "pathways.hero.text": "比较学校队、俱乐部学院、国家人才识别、学院认证与职业桥梁，拆解不同国家如何组织球员培养。",
    "pathways.meta.eyebrow": "Coverage",
    "pathways.meta.coverage": "{countries} 国 · {count} 个体系节点",
    "pathways.meta.checked": "体系核查至 {date}",
    "pathways.tabs.aria": "国家切换",
    "pathways.tabs.japan": "日本",
    "pathways.tabs.korea": "韩国",
    "pathways.tabs.norway": "挪威",
    "pathways.tabs.denmark": "丹麦",
    "pathways.tabs.sweden": "瑞典",
    "pathways.structure.eyebrow": "Competition Map",
    "pathways.structure.title": "青训项目、竞赛与职业桥梁",
    "pathways.sources.eyebrow": "Official Sources",
    "pathways.sources.title": "官方来源与核查时间",
    "pathways.registration": "体系入口：{value}",
    "pathways.organizationTypes": "适用组织：{value}",
    "pathways.snapshot": "{season} 年度快照：{note}",
    "pathways.viewPlayers": "查看本站样本（{count}）",
    "pathways.noPlayers": "当前无关联样本",
    "pathways.sourceChecked": "最后核查：{date}",
    "dataCenter.hero.eyebrow": "Data Quality & Comparison",
    "dataCenter.hero.title": "数据质量与对比中心",
    "dataCenter.hero.text": "用同一口径查看覆盖质量、国家青训路径、项目与教练目录。",
    "dataCenter.sampleNotice": "本站统计仅代表仓库研究样本，不代表官方全量。",
    "dataCenter.meta.eyebrow": "Build Metadata",
    "dataCenter.meta.generated": "数据生成：{date}",
    "dataCenter.meta.commit": "构建提交：{value}",
    "dataCenter.meta.unstamped": "本地构建（未注入 commit）",
    "dataCenter.meta.deployed": "部署构建",
    "dataCenter.meta.unavailable": "元信息不可用；目录仍可按现有聚合数据浏览。",
    "dataCenter.tabs.aria": "数据中心视图",
    "dataCenter.tabs.quality": "覆盖质量",
    "dataCenter.tabs.countries": "国家对比",
    "dataCenter.tabs.projects": "青训项目",
    "dataCenter.tabs.coaches": "教练目录",
    "dataCenter.quality.eyebrow": "Coverage Quality",
    "dataCenter.quality.title": "数据集覆盖与待补字段",
    "dataCenter.quality.empty": "当前没有可展示的质量元信息。",
    "dataCenter.quality.loadError": "质量元信息加载失败；其他目录仍可继续浏览。",
    "dataCenter.quality.datasets": "数据集",
    "dataCenter.quality.records": "记录",
    "dataCenter.quality.stale": "过期",
    "dataCenter.quality.review": "待复核",
    "dataCenter.quality.checked": "核查范围：{oldest} — {newest}",
    "dataCenter.quality.sourceTier": "最佳来源等级分布",
    "dataCenter.quality.missing": "待补字段",
    "dataCenter.quality.noMissing": "当前未识别待补字段",
    "dataCenter.countries.eyebrow": "Pathway Comparison",
    "dataCenter.countries.title": "五国青训路径矩阵",
    "dataCenter.countries.note": "只比较仓库已经按相同结构收录的国家体系，不代表国家青训实力排名。",
    "dataCenter.countries.empty": "当前没有可展示的国家青训路径数据。",
    "dataCenter.countries.loadError": "国家青训路径数据加载失败。",
    "dataCenter.countries.country": "国家",
    "dataCenter.countries.nodes": "体系节点",
    "dataCenter.countries.categories": "注册入口",
    "dataCenter.countries.ages": "年龄范围",
    "dataCenter.countries.organizations": "组织类型",
    "dataCenter.countries.types": "项目类型",
    "dataCenter.countries.sources": "官方来源",
    "dataCenter.honours.eyebrow": "Tournament Honours",
    "dataCenter.honours.title": "1985—2025 U20 历史荣誉榜",
    "dataCenter.honours.note": "FIFA 与 AFC 分开统计，只纳入已完成届次；历史代表队名称保持原样。",
    "dataCenter.honours.empty": "当前没有符合口径的已完成 U20 赛事。",
    "dataCenter.honours.loadError": "U20 赛事档案加载失败。",
    "dataCenter.honours.editions": "{count} 届已完成赛事",
    "dataCenter.honours.team": "代表队",
    "dataCenter.honours.titles": "冠军",
    "dataCenter.honours.runners": "亚军",
    "dataCenter.honours.finals": "决赛",
    "dataCenter.projects.eyebrow": "Programme Directory",
    "dataCenter.projects.title": "青训项目目录",
    "dataCenter.projects.searchPlaceholder": "名称、国家或项目类型",
    "dataCenter.projects.empty": "没有符合当前筛选的青训项目。",
    "dataCenter.projects.loadError": "青训项目数据加载失败。",
    "dataCenter.coaches.eyebrow": "Coach Directory",
    "dataCenter.coaches.title": "教练目录",
    "dataCenter.coaches.searchPlaceholder": "姓名、机构或岗位",
    "dataCenter.coaches.empty": "没有符合当前筛选的教练记录。",
    "dataCenter.coaches.loadError": "教练数据加载失败。",
    "dataCenter.filters.search": "搜索",
    "dataCenter.filters.country": "国家 / 国籍",
    "dataCenter.filters.category": "类别",
    "dataCenter.filters.status": "质量状态",
    "dataCenter.filters.all": "全部",
    "dataCenter.results": "显示 {count} / {total}",
    "dataCenter.card.checked": "核查：{date}",
    "dataCenter.card.sources": "来源 {count} 条 · 等级 {tier}",
    "dataCenter.card.missing": "待补：{fields}",
    "dataCenter.card.open": "查看来源或详情",
    "dossier.breadcrumb.home": "首页",
    "dossier.breadcrumb.detail": "青训专题",
    "dossier.hero.eyebrow": "Academy Dossier",
    "dossier.hero.lastReviewed": "核查至 {date}",
    "dossier.notFound.title": "未找到对应专题",
    "dossier.notFound.text": "当前专题不存在或尚未进入公开展示范围。",
    "dossier.stats.founded": "基地启用",
    "dossier.stats.generations": "跟踪代际",
    "dossier.stats.players": "代表球员",
    "dossier.stats.currentFocus": "当前梯队",
    "dossier.model.eyebrow": "Development Model",
    "dossier.model.title": "培养模式与专题口径",
    "dossier.timeline.eyebrow": "Timeline",
    "dossier.timeline.title": "基地沿革",
    "dossier.generations.eyebrow": "Generations",
    "dossier.generations.title": "代表球员与当前状态",
    "dossier.generations.players": "代表样本 {count} 人",
    "dossier.generations.empty": "当前代际尚无公开稳定球员名单。",
    "dossier.program.coach": "主教练：{value}",
    "dossier.program.ageGroups": "年龄段：{value}",
    "dossier.player.asOf": "截至 {date}",
    "dossier.player.source": "现状来源",
    "dossier.player.profile": "站内球员档案",
    "dossier.boundaries.eyebrow": "Boundaries",
    "dossier.boundaries.title": "口径与争议",
    "dossier.questions.eyebrow": "Follow-up",
    "dossier.questions.title": "待核问题",
    "dossier.sources.eyebrow": "Sources",
    "dossier.sources.title": "来源与核查日期",
    "dossier.sources.primary": "主来源",
    "dossier.sources.supporting": "补充来源",
    "dossier.sources.checked": "专题核查至 {date}",
    "tournamentDetail.breadcrumb.list": "赛事列表",
    "tournamentDetail.breadcrumb.detail": "赛事详情",
    "tournamentDetail.hero.eyebrow": "Tournament File",
    "tournamentDetail.result.eyebrow": "Result",
    "tournamentDetail.notFound.title": "未找到对应赛事",
    "tournamentDetail.notFound.text": "当前链接里的赛事 id 不存在，或者这条赛事还没有进入建档库。",
    "tournamentDetail.notFound.back": "返回赛事列表",
    "tournamentDetail.stats.result": "结果",
    "tournamentDetail.stats.confederation": "洲别",
    "tournamentDetail.stats.level": "赛事层级",
    "tournamentDetail.stats.dateRange": "比赛时间",
    "tournamentDetail.stats.host": "举办地",
    "tournamentDetail.stats.status": "状态",
    "tournamentDetail.stats.chinaStage": "中国阶段",
    "tournamentDetail.context.eyebrow": "Context",
    "tournamentDetail.context.title": "赛事背景与当前专题口径",
    "tournamentDetail.context.headline": "当前摘要",
    "tournamentDetail.context.focusTeams": "重点队伍",
    "tournamentDetail.context.empty": "当前只有基础赛事档案，还没有额外专题说明。",
    "tournamentDetail.field.eyebrow": "Teams & Draw",
    "tournamentDetail.field.title": "参赛资格与分组",
    "tournamentDetail.field.meta": "决赛圈记录 {count} 支球队 · 最后核查 {date}",
    "tournamentDetail.field.participants": "决赛圈球队",
    "tournamentDetail.field.participantsComplete": "完整参赛名单",
    "tournamentDetail.field.participantsPartial": "当前已确认 / 主办方快照",
    "tournamentDetail.field.participantsCancelled": "赛事取消时的资格快照",
    "tournamentDetail.field.entry.host": "主办国",
    "tournamentDetail.field.entry.qualified": "已晋级",
    "tournamentDetail.field.entry.participant": "参赛",
    "tournamentDetail.field.finalDraw": "决赛圈分组",
    "tournamentDetail.field.drawPending": "决赛圈尚未抽签",
    "tournamentDetail.field.drawCancelled": "赛事已取消；下列为取消前已公布的分组",
    "tournamentDetail.field.qualifiers": "资格赛分组",
    "tournamentDetail.field.phase.qualification": "资格阶段",
    "tournamentDetail.field.phase.development": "发展阶段",
    "tournamentDetail.field.phaseDates": "{start} 至 {end}",
    "tournamentDetail.field.groupHost": "赛区：{host}",
    "tournamentDetail.field.group.finalRound": "决赛轮",
    "tournamentDetail.field.group.group": "{name}组",
    "tournamentDetail.history.eyebrow": "History",
    "tournamentDetail.history.title": "中日韩历届战绩",
    "tournamentDetail.history.empty": "当前这条赛事还没有补到中日韩历届战绩。",
    "tournamentDetail.history.appearances": "决赛圈 {count} 次",
    "tournamentDetail.history.bestFinish": "最佳：{stage}",
    "tournamentDetail.history.bestYears": "最佳届次：{years}",
    "tournamentDetail.history.table.edition": "届次",
    "tournamentDetail.history.table.host": "举办地",
    "tournamentDetail.history.table.china": "中国",
    "tournamentDetail.history.table.japan": "日本",
    "tournamentDetail.history.table.korea": "韩国",
    "tournamentDetail.watch.eyebrow": "Watchlist",
    "tournamentDetail.watch.title": "区域年轻球员观察",
    "tournamentDetail.watch.empty": "当前这条赛事还没有补到区域观察池。",
    "tournamentDetail.watch.sampleCount": "{label} 池 {count} 人",
    "tournamentDetail.watch.overseasCount": "当前留洋 {count} 人",
    "tournamentDetail.watch.allPlayers": "全名单",
    "tournamentDetail.watch.overseasPlayers": "留洋样本",
    "tournamentDetail.watch.noOverseas": "当前已建档池里没有留洋样本。",
    "tournamentDetail.squad.eyebrow": "Squad List",
    "tournamentDetail.squad.title": "中国完整名单",
    "tournamentDetail.squad.empty": "当前还没有录入中国完整名单。",
    "tournamentDetail.squad.latestLabel": "最新公开名单",
    "tournamentDetail.squad.latestNote":
      "按最新公开名单图整理；这份视图用于跟踪当前中国 U17 队名单，不替代 2026 U17 亚洲杯终报名表。",
    "tournamentDetail.squad.headCoach": "主教练：{name}",
    "tournamentDetail.squad.finalsToggle": "查看 2026 U17 亚洲杯终报名表",
    "tournamentDetail.matches.eyebrow": "China Matches",
    "tournamentDetail.matches.title": "中国队比赛明细",
    "tournamentDetail.keyPlayers.eyebrow": "Key Players",
    "tournamentDetail.keyPlayers.title": "中国关键球员",
    "tournamentDetail.keyPlayers.empty": "当前还没有录入中国关键球员汇总。",
    "tournamentDetail.keyPlayers.statLine": "{goals} 球 · {assists} 助攻",
    "tournamentDetail.sources.eyebrow": "Sources",
    "tournamentDetail.sources.title": "赛事来源链接",
    "playerDetail.notFound.title": "未找到对应球员",
    "playerDetail.notFound.text": "当前链接里的球员 id 不存在，或者该样本还没有进入建档库。",
    "playerDetail.notFound.back": "返回球员列表",
    "playerDetail.marketValue.eyebrow": "Market Value",
    "playerDetail.marketValue.title": "Transfermarkt 身价",
    "playerDetail.marketValue.withLink": "Transfermarkt 外链已关联",
    "playerDetail.marketValue.withoutLink": "暂无稳定身价来源",
    "playerDetail.marketValue.note": "身价参考 Transfermarkt；球员页区分当前值与历史峰值，列表页同步提供排行。",
    "playerDetail.marketHistory.eyebrow": "Market Value History",
    "playerDetail.marketHistory.title": "身价历史",
    "playerDetail.marketHistory.source": "来源：{provider}",
    "playerDetail.marketHistory.updated": "最后检查：{date}",
    "playerDetail.marketHistory.empty": "已完成公开来源检索，但暂未找到可展示的身价历史。",
    "playerDetail.marketHistory.date": "日期",
    "playerDetail.marketHistory.value": "估值",
    "playerDetail.marketHistory.providerNote": "不同平台采用不同估值方法；替代来源不会进入 Transfermarkt 排行。",
    "playerDetail.hero.summary": "{country} · {birthYear} 年生 · {position}。现属 {club}。",
    "playerDetail.actions.links": "查看外部资料",
    "playerDetail.actions.competition": "查看赛事记录",
    "playerDetail.status.eyebrow": "Data Status",
    "playerDetail.status.title": "资料状态",
    "playerDetail.status.currentTeam": "当前球队",
    "playerDetail.status.registrationSnapshot": "赛事报名归属",
    "playerDetail.status.transfermarkt": "Transfermarkt",
    "playerDetail.status.transfermarktLinked": "已关联",
    "playerDetail.status.transfermarktRosterOnly": "仅队页 / 名单页",
    "playerDetail.status.transfermarktMissing": "未关联",
    "playerDetail.status.marketValueCurrent": "当前身价",
    "playerDetail.status.marketValuePeak": "历史峰值",
    "playerDetail.status.marketValueUnavailable": "暂无数值",
    "playerDetail.status.marketValueMissing": "暂无稳定来源",
    "playerDetail.status.externalLinks": "外部链接",
    "playerDetail.status.recentContributions": "最近贡献",
    "playerDetail.status.verification": "资料可信度",
    "playerDetail.status.lastChecked": "最后校验：{date}",
    "playerDetail.profile.eyebrow": "Profile",
    "playerDetail.profile.title": "基本资料",
    "playerDetail.affiliation.eyebrow": "Affiliation",
    "playerDetail.affiliation.title": "当前归属",
    "playerDetail.stats.nameZh": "中文名",
    "playerDetail.stats.nameNative": "原文名",
    "playerDetail.stats.nameEn": "英文名",
    "playerDetail.stats.birthYear": "出生年份",
    "playerDetail.stats.country": "国籍",
    "playerDetail.stats.position": "位置",
    "playerDetail.stats.tags": "核心标签",
    "playerDetail.stats.currentTeam": "当前球队",
    "playerDetail.stats.registrationSnapshot": "赛事报名归属",
    "playerDetail.stats.parentClub": "俱乐部",
    "playerDetail.stats.currentSquad": "梯队",
    "playerDetail.stats.currentLeague": "参赛体系",
    "playerDetail.stats.transfermarktStatus": "Transfermarkt 状态",
    "playerDetail.stats.marketValueCurrent": "当前身价",
    "playerDetail.stats.marketValuePeak": "历史峰值",
    "playerDetail.stats.marketValueCurrentDate": "当前值更新",
    "playerDetail.stats.marketValuePeakDate": "峰值日期",
    "playerDetail.nameMeta.zh": "中文：{value}",
    "playerDetail.nameMeta.native": "原文：{value}",
    "playerDetail.nameMeta.en": "英文：{value}",
    "playerDetail.pathway.countryPending": "国家待补",
    "playerDetail.pathway.youthSetup": "青训梯队",
    "playerDetail.pathway.youthTeam": "青年队",
    "playerDetail.pathway.empty": "当前样本尚未补到可用的青训路径。",
    "playerDetail.participation.empty": "当前样本还没有赛事参与记录。",
    "playerDetail.participation.statLine": "{appearances} 场 · {goals} 球 · {minutes} 分钟",
    "playerDetail.participation.statsPending": "详细出场数据待补",
    "playerDetail.participation.scope": "统计层级：{level} · 截止 {date}",
    "playerDetail.participation.sourceChecked": "来源核查：{date}",
    "playerDetail.participation.partial": "部分统计",
    "playerDetail.verification.lastChecked": "最后校验：{date}",
    "playerDetail.verification.noNote": "暂无补充说明",
    "playerDetail.recent.empty": "当前还没有匹配到这名球员的结构化比赛贡献。",
    "playerDetail.links.empty": "当前样本没有外部链接。",
    "tournaments.hero.eyebrow": "Tournament Directory",
    "tournaments.hero.title": "赛事列表",
    "tournaments.hero.text": "这里汇总 1985 年以来的男足 U20 世青赛与亚青赛完整届次，并保留其他亚洲杯、世界杯和世少赛档案。",
    "tournaments.filter.eyebrow": "Filter",
    "tournaments.focus.eyebrow": "Focus Pool",
    "tournaments.focus.title": "重点赛事",
    "tournaments.archive.eyebrow": "Archive",
    "tournaments.archive.title": "赛事档案",
    "tournaments.empty": "当前标签下没有匹配赛事。",
    "tournaments.tabs.all": "全部",
    "tournaments.meta.count": "当前标签下 {count} 项赛事",
    "tournaments.archive.completedResult": "{champion} 冠军 / {runnerUp} 亚军",
    "tournaments.archive.ongoingResult": "进行中 / 结果待定",
    "tournaments.archive.upcomingResult": "即将开始 / 结果待定",
    "tournaments.archive.cancelledResult": "赛事取消 / 无冠军",
    "tournaments.archive.fieldSummary": "决赛圈球队 {count} 支 · {draw}",
    "tournaments.archive.drawComplete": "分组已确认",
    "tournaments.archive.drawPending": "分组待定",
    "tournaments.archive.drawCancelled": "取消前分组快照",
    "tournaments.archive.matchLabel": "中国 vs {opponent} {score} ({result})",
    "tournaments.archive.noContrib": "本场暂无已录入的进球 / 助攻事件。",
    "tournaments.archive.noChinaMatches": "中国队在该赛事无已录入比赛，或未参赛。",
    "tournaments.archive.chinaSummary": "中国战绩：{summary}",
    "tournaments.archive.chinaStage": "中国阶段：{stage}",
    "tournaments.archive.matchStatsTitle": "比赛统计",
    "tournaments.archive.lineupToggle": "中国阵容{formation}",
    "tournaments.archive.lineupTitle": "中国首发{formation}",
    "tournaments.archive.benchTitle": "中国替补名单",
    "tournaments.archive.substituteMinute": "{minute}' 替补出场",
    "tournaments.archive.substituteUnused": "未出场",
    "tournaments.card.open": "查看赛事",
    "tournaments.youthLeague.eyebrow": "Special Topic",
    "tournaments.youthLeague.title": "欧洲青年冠军联赛",
    "tournaments.youthLeague.text": "查看近三个完整赛季的资格、赛制、八强以后赛果与中日韩球员核验。",
    "tournaments.youthLeague.open": "进入专题",
    "youthLeague.hero.eyebrow": "UEFA Youth League",
    "youthLeague.hero.title": "欧洲青年冠军联赛",
    "youthLeague.hero.text": "近三个完整赛季的资格、赛制、淘汰赛，以及中日韩球员核验。",
    "youthLeague.hero.cjkLink": "查看中日韩球员",
    "youthLeague.hero.back": "返回赛事列表",
    "youthLeague.qualification.eyebrow": "Entry & eligibility",
    "youthLeague.qualification.title": "如何参赛",
    "youthLeague.seasons.eyebrow": "Three seasons",
    "youthLeague.seasons.title": "近三季赛事情况",
    "youthLeague.cjk.eyebrow": "China · Japan · Korea",
    "youthLeague.cjk.title": "中日韩球员",
    "youthLeague.cjk.note": "主统计严格按 UEFA 官方国籍识别；双国籍或血缘关联只进入边界观察。",
    "youthLeague.spotlights.eyebrow": "Curated, not exhaustive",
    "youthLeague.spotlights.title": "其他国家精选球员",
    "youthLeague.spotlights.note": "这里只收录最佳射手、决赛进球者和官方赛季回顾中的重点人物，不是完整球员名单。",
    "youthLeague.sources.eyebrow": "Source ledger",
    "youthLeague.sources.title": "官方来源",
    "overseas.hero.eyebrow": "Overseas Tracker",
    "overseas.hero.title": "留洋专页",
    "overseas.hero.text": "当前页把“现役海外样本”和“历史记录”拆开。现役部分默认显示当前仍在海外的球员，历史部分默认显示当前已不在海外的样本；切换年份后，可回看当年仍在海外的球员列表。",
    "overseas.note.eyebrow": "Note",
    "overseas.note.text": "这里展示的是当前已建档样本，不是官方全量留洋人数。中国样本包含较多 U19 / 青年队球员；日韩青年队尚未系统收集，不能直接横向比较。",
    "overseas.quickJump.label": "年份快切",
    "overseas.quickJump.note": "直接切换历史年份，页面会同步到下方筛选。",
    "overseas.filters.country": "国别",
    "overseas.filters.bucket": "联赛桶",
    "overseas.filters.teamLevel": "队伍层级",
    "overseas.filters.year": "历史年份",
    "overseas.filters.actions": "操作",
    "overseas.filters.reset": "重置筛选",
    "overseas.filters.allCountry": "全部国别",
    "overseas.filters.allBucket": "全部联赛桶",
    "overseas.filters.allTeamLevel": "全部队伍层级",
    "overseas.filters.allYear": "全部年份",
    "overseas.current.eyebrow": "Current Abroad",
    "overseas.current.title": "当前留洋样本",
    "overseas.current.empty": "当前筛选条件下没有匹配的现役留洋样本。",
    "overseas.current.eyebrow.year": "Year Snapshot",
    "overseas.current.title.year": "年份回看",
    "overseas.current.empty.year": "{year} 年当前筛选条件下没有匹配的海外样本。",
    "overseas.notes.eyebrow": "Country Notes",
    "overseas.notes.title": "国别说明",
    "overseas.history.eyebrow": "History",
    "overseas.history.title": "历史记录",
    "overseas.history.empty": "当前筛选条件下没有匹配的历史样本。",
    "overseas.comparison.current": "当前留洋样本",
    "overseas.comparison.history": "历史记录 {count} 条",
    "overseas.current.meta": "当前筛选下 {count} 名现役海外样本",
    "overseas.current.meta.year": "{year} 年筛选下 {count} 名当年在海外的样本",
    "overseas.current.teamLevelHistoryNote": "历史记录暂未按队伍层级统计；年份回看会忽略队伍层级筛选。",
    "overseas.history.meta.default": "当前筛选下 {count} 条当前已不在海外的历史样本",
    "overseas.history.meta.year": "{year} 年命中 {count} 条当年在海外的样本",
    "overseas.countryNotes.noNote": "暂无说明",
    "overseas.countryNotes.empty": "当前没有可展示的国别说明。",
    "overseas.countryNotes.playerCount": "{count} 人",
    "overseas.countryNotes.sources": "来源",
    "overseas.status.title": "中国留洋状态口径",
    "overseas.status.note": "当前留洋总数只统计“当前有效注册”；待生效、试训观察、已回流和仅历史不会计入当前人数。",
    "overseas.coaches.eyebrow": "Coaches",
    "overseas.coaches.title": "五大联赛亚洲教练",
    "overseas.coaches.empty": "当前还没有可展示的五大联赛亚洲教练记录。",
    "overseas.coaches.meta": "校验至 {date}",
    "overseas.coaches.afcCount": "AFC 主口径人数",
    "overseas.coaches.broadCount": "广义口径人数",
    "overseas.coaches.primaryRecord": "主口径总战绩",
    "overseas.coaches.sourceCount": "总来源",
    "overseas.coaches.recordLine": "{matches} 场 · {wins} 胜 {draws} 平 {losses} 负",
    "overseas.coaches.points": "{points} 分",
    "overseas.coaches.primaryScope": "主口径：{count} 人；只统计执教时所属足协为 AFC 成员协会的教练。",
    "overseas.coaches.broadScope": "广义口径：{count} 人；另列土耳其、以色列等 UEFA 边界项。",
    "overseas.coaches.clubRecord": "{league} · {club} · {season}",
    "overseas.coaches.period": "周期：{value}",
    "overseas.coaches.scope": "口径：{value}",
    "overseas.coaches.confidence": "可信度：{value}",
    "overseas.coaches.sources": "来源",
    "overseas.coaches.scope.afc": "AFC 成员口径",
    "overseas.coaches.scope.broad": "广义亚洲边界项"
  },
  en: {
    "page.home.title": "Youth Player Tracking Desk",
    "page.home.description": "A static data site focused on Chinese youth development, Asian youth tournaments, and overseas player samples across China, Japan, and South Korea.",
    "page.players.title": "Player Directory | Youth Player Tracking Desk",
    "page.players.description": "Filter youth and young player samples by nationality, age band, competition, league system, and tags.",
    "page.player-detail.title": "Player Detail | Youth Player Tracking Desk",
    "page.player-detail.description": "View player pathways, tournament logs, current club, recent contributions, and external references.",
    "page.tournaments.title": "Tournament Directory | Youth Player Tracking Desk",
    "page.tournaments.description": "Browse Asian Cups, World Cups, U-20 World Cups, and U-17 World Cups by level with China results and source links.",
    "page.youth-league.title": "UEFA Youth League | Youth Player Tracking Desk",
    "page.youth-league.description": "Qualification, formats, knockouts and China-Japan-Korea player research across the latest three UEFA Youth League seasons.",
    "page.tournament-detail.title": "Tournament Detail | Youth Player Tracking Desk",
    "page.tournament-detail.description": "View one tournament at a time with date range, China results, match detail, key players, and source links.",
    "page.overseas.title": "Overseas Tracker | Youth Player Tracking Desk",
    "page.overseas.description": "Compare current overseas samples and historical records for China, Japan, and South Korea.",
    "page.pathways.title": "Youth Systems and Programmes | Youth Player Tracking Desk",
    "page.pathways.description": "Compare school football, club academies, talent identification and professional bridges across Japan, South Korea, Norway, Denmark and Sweden.",
    "page.coaches.title": "Youth Coaches | Youth Player Tracking Desk",
    "page.coaches.description": "Explore Chinese grassroots youth coaches and men's youth national-team staffs with organizations, age groups, and source links.",
    "page.data-center.title": "Data Quality and Comparison | Youth Player Tracking Desk",
    "page.data-center.description": "Review sample completeness, source tiers, freshness, country comparisons, programme directories and coach directories.",
    "page.dossier-detail.title": "Academy Dossier | Youth Player Tracking Desk",
    "page.dossier-detail.description": "Explore an academy's history, player generations, current status, and source boundaries.",
    "site.kicker": "Youth Tracking Desk",
    "site.brand": "Youth Player Tracking Desk",
    "nav.aria": "Main navigation",
    "nav.home": "Home",
    "nav.players": "Players",
    "nav.tournaments": "Tournaments",
    "nav.overseas": "Overseas",
    "nav.pathways": "Youth Systems",
    "nav.coaches": "Coaches",
    "nav.dataCenter": "Data",
    "header.language": "Language",
    "common.loading": "Loading",
    "common.loadingData": "Loading data",
    "common.updatedAt": "Aggregated: {date}",
    "common.pageRenderErrorTitle": "Page render failed",
    "common.pending": "TBD",
    "common.none": "N/A",
    "common.unknown": "Unknown",
    "common.noTags": "No tags",
    "common.noLinks": "No external links",
    "common.age": "{age} yrs",
    "home.hero.eyebrow": "Tracker",
    "home.hero.title": "Youth Player Tracker",
    "home.hero.text": "Track Chinese youth players, tournament results, and overseas movement.",
    "home.hero.ctaPlayers": "View players",
    "home.hero.ctaTournaments": "View tournaments",
    "home.nextEvent.eyebrow": "Focus Event",
    "home.stats.aria": "Data overview",
    "home.stats.players": "Player samples",
    "home.stats.overseas": "Active overseas samples",
    "home.stats.archive": "Tournament archive",
    "home.stats.updated": "Updated",
    "home.recentMatches.eyebrow": "Recent Matches",
    "home.recentMatches.title": "Recent matches",
    "home.recentMatches.link": "View tournaments",
    "home.quickLinks.eyebrow": "Quick Links",
    "home.quickLinks.title": "Quick Links",
    "home.quickLinks.playersTitle": "Players",
    "home.quickLinks.playersText": "Filter player samples by country, age band, competition, and tags.",
    "home.quickLinks.tournamentsTitle": "Tournaments",
    "home.quickLinks.tournamentsText": "Check tournament dates, results, and China match detail.",
    "home.quickLinks.overseasTitle": "Overseas",
    "home.quickLinks.overseasText": "Separate current overseas samples from historical records.",
    "home.quickLinks.genbaoTitle": "Genbao Football Base",
    "home.quickLinks.genbaoText": "Browse representative generations, pathways and current status.",
    "home.quickLinks.coachesTitle": "Youth coaches",
    "home.quickLinks.coachesText": "Explore grassroots coaches, China youth national-team staffs, and official sources.",
    "home.overseasSummary.eyebrow": "Overseas Overview",
    "home.overseasSummary.title": "Overseas overview",
    "home.overseasSummary.link": "View overseas",
    "home.recent.noContrib": "No recorded goal or assist event for this match yet.",
    "home.recent.matchLabel": "{stage} · {date} · China vs {opponent} {score}",
    "home.nextQueue.china": "China: {summary}",
    "home.overseasSummary.playerGroup": "{country} players",
    "home.overseasSummary.currentCount": "{count} current samples",
    "home.overseasSummary.history": "{count} historical records",
    "home.overseasSummary.currentShort": "Active",
    "home.overseasSummary.historyShort": "History",
    "home.focus.record": "{matches} matches · {wins}W {draws}D {losses}L",
    "home.focus.recordFallback": "{team}: {summary}",
    "home.focus.status": "Status: {value}",
    "home.focus.period": "Dates: {value}",
    "home.focus.scope": "Coverage: {value}",
    "home.focus.latest": "Latest: {value}",
    "home.focus.sources": "Sources: {count}",
    "home.project.goal": "Goal: {value}",
    "home.project.completed": "Done: {value}",
    "home.project.nextStep": "Next: {value}",
    "home.topic.eyebrow": "Special Topic",
    "home.topic.title": "Donglu Football Boys",
    "home.topic.link": "View related players",
    "home.topic.timelineTitle": "Project timeline",
    "home.topic.timelineLink": "Open tag filter",
    "home.topic.batchesTitle": "Verified batch outline",
    "home.topic.roleTitle": "Donglu's role in the project",
    "home.topic.scopeTitle": "Current scope note",
    "home.topic.completedTitle": "Current coverage",
    "home.topic.nextTitle": "Next step",
    "home.topic.taggedPlayers": "{count} tagged players",
    "home.topic.batchCount": "{count} verified batches",
    "home.topic.timelineCount": "{count} key milestones",
    "home.topic.batchPlayers": "{count} verified names",
    "home.topic.batchWindow": "Window: {value}",
    "home.topic.batchSample": "Examples: {value}",
    "home.topic.empty": "No featured Football Boys dossier is available yet.",
    "home.topic.batchesEmpty": "No verified batch outline is available yet.",
    "home.overseasCard.current": "Current: {value}",
    "home.overseasCard.region": "Region: {value}",
    "home.overseasCard.origin": "Origin: {value}",
    "home.overseasCard.path": "Overseas path: {value}",
    "home.overseasCard.sample": "Sample: {value}",
    "home.overseasCard.league": "League: {value}",
    "players.hero.eyebrow": "Player Directory",
    "players.hero.title": "Player directory",
    "players.hero.text": "This is the player-directory entry point. Filter by nationality, age band, competition, league system, and topical tags, and compare directory market values; a separate China-Japan-Korea overseas-history peak ranking appears below.",
    "players.view.eyebrow": "View Modes",
    "players.view.aria": "View switch",
    "players.view.cards": "Cards",
    "players.view.table": "Table",
    "players.rankings.eyebrow": "Transfermarkt",
    "players.rankings.currentTitle": "Current market value ranking",
    "players.rankings.peakTitle": "Current directory peak ranking",
    "players.rankings.note": "Only players in this current directory with a linked Transfermarkt player page and a listed valuation are counted. Rankings follow the current filters and are not an all-time overseas ranking.",
    "players.rankings.coverageCurrent": "{count} / {total} filtered players with a current market value",
    "players.rankings.coveragePeak": "{count} / {total} filtered players with a peak market value",
    "players.rankings.currentEmpty": "No current market value is available in this filter yet.",
    "players.rankings.peakEmpty": "No peak market value is available in this filter yet.",
    "players.rankings.currentMeta": "Peak {value} · {date}",
    "players.rankings.peakMeta": "Current {value} · peaked on {date}",
    "players.rankings.peakMetaNoCurrent": "Peaked on {date}",
    "players.rankings.historyTitle": "China-Japan-Korea overseas all-time peaks",
    "players.rankings.historyCoverage": "{count} archived representative samples · independent of the filters above",
    "players.rankings.historyMeta": "{club} · {date} · age {age}",
    "players.rankings.historyCurrent": "Current {value}",
    "players.rankings.historyRetired": "Retired",
    "players.rankings.historyNote": "Scope: representative China, Japan, and Korea overseas-history records with a verified Transfermarkt valuation history, not a complete Asian-player table. Values are nominal euros with no inflation or era adjustment; early-career histories may be incomplete.",
    "players.rankings.historyEmpty": "No overseas-history peak data is available yet.",
    "players.filters.search": "Search",
    "players.filters.searchPlaceholder": "Chinese name, native name, English name, club, tag",
    "players.filters.country": "Country",
    "players.filters.ageBand": "Age band",
    "players.filters.competition": "Competition",
    "players.filters.league": "League / system",
    "players.filters.organizationType": "Development organization",
    "players.filters.tag": "Tag",
    "players.filters.sort": "Sort",
    "players.sort.default": "Default order",
    "players.sort.ageAsc": "Age: youngest first",
    "players.sort.ageDesc": "Age: oldest first",
    "players.sort.marketValueDesc": "Value: highest first",
    "players.sort.marketValueAsc": "Value: lowest first",
    "players.filters.actions": "Actions",
    "players.filters.reset": "Reset filters",
    "players.filters.allCountry": "All countries",
    "players.filters.allAgeBand": "All age bands",
    "players.filters.allCompetition": "All competitions",
    "players.filters.allLeague": "All leagues / systems",
    "players.filters.allOrganizationType": "All organization types",
    "players.filters.allTag": "All tags",
    "players.table.player": "Player",
    "players.table.country": "Country",
    "players.table.age": "Age",
    "players.table.marketValue": "Current value",
    "players.table.marketValuePeak": "Peak {value}",
    "players.table.club": "Club / registration",
    "players.table.league": "League / system",
    "players.table.tag": "Tag",
    "players.table.detail": "View",
    "players.empty": "No players match the current filters.",
    "players.meta.results": "{count} / {total} players in this filter",
    "players.card.positionPending": "Position TBD",
    "players.card.clubPending": "Club TBD",
    "players.card.marketValueBoth": "Current {current} · Peak {peak}",
    "players.card.marketValueCurrentOnly": "Current {current}",
    "players.card.marketValuePeakOnly": "Peak {peak}",
    "players.card.viewProfile": "View player file",
    "coaches.hero.eyebrow": "Youth Coaches",
    "coaches.hero.title": "Youth coaches",
    "coaches.hero.text": "Explore grassroots, school, academy, and independent youth coaches alongside China's men's youth national-team staffs. Every record retains its role boundary and original sources.",
    "coaches.coverage.eyebrow": "Coverage",
    "coaches.coverage.value": "{development} development coaches · {national} national-team cycles",
    "coaches.coverage.checked": "Development checked {development} · national teams checked {national}",
    "coaches.development.eyebrow": "Grassroots & Academy",
    "coaches.development.title": "Grassroots and academy coaches",
    "coaches.development.note": "Only named coaches with a verified organization and an actual training or technical role are included; administrative titles and playing careers are not treated as coaching evidence.",
    "coaches.development.period": "Period: {value}",
    "coaches.development.sources": "{count} sources",
    "coaches.development.source": "Open source",
    "coaches.national.eyebrow": "National Youth Teams",
    "coaches.national.title": "China men's youth national-team staffs",
    "coaches.national.coach": "Head coach: {value}",
    "coaches.national.latest": "Latest camp: {value}",
    "coaches.national.window": "Window: {value}",
    "coaches.national.staff": "Coaching and support staff",
    "coaches.national.sources": "Official appointment and camp sources",
    "coaches.watchlist.eyebrow": "Research Queue",
    "coaches.watchlist.title": "Coaches and organizations to verify",
    "coaches.watchlist.need": "Research need: {value}",
    "players.scouting.eyebrow": "Scouting Watchlist",
    "players.scouting.title": "FTS AFC youth watchlist",
    "players.scouting.country": "Country / region",
    "players.scouting.allCountry": "All countries / regions",
    "players.scouting.meta": "Showing {count} / {total} players across {countries} AFC countries / regions",
    "players.scouting.rating": "Potential rating {value}/10",
    "players.scouting.unrated": "No public rating",
    "players.scouting.original": "Open FTS source",
    "players.scouting.profile": "Site player file",
    "players.scouting.checked": "Link checked: {date}",
    "players.scouting.collections": "Related FTS collections",
    "players.scouting.type.image-report": "Image report",
    "players.scouting.type.talent-of-the-day": "Talent of the Day",
    "players.scouting.type.player-profile": "Player profile",
    "players.scouting.type.guest-report": "Guest report",
    "players.card.details": "View",
    "playerDetail.breadcrumb.list": "Players",
    "playerDetail.breadcrumb.detail": "Player detail",
    "playerDetail.pathway.eyebrow": "Pathway",
    "playerDetail.pathway.title": "Pathway and affiliation changes",
    "playerDetail.competition.eyebrow": "Competition Log",
    "playerDetail.competition.title": "Competition log",
    "playerDetail.verification.eyebrow": "Verification",
    "playerDetail.verification.title": "Verification status",
    "playerDetail.recent.eyebrow": "Recent Contributions",
    "playerDetail.recent.title": "Recent contributions",
    "playerDetail.links.eyebrow": "External Links",
    "playerDetail.links.title": "External sources",
    "playerDetail.sources.eyebrow": "Source Layers",
    "playerDetail.sources.title": "Source layers and development system",
    "playerDetail.sources.empty": "No structured source layer has been recorded yet.",
    "playerDetail.sources.fields": "Supported fields: {fields}",
    "playerDetail.sources.checked": "Checked: {date} · Confidence: {confidence}",
    "playerDetail.stats.organizationType": "Development organization",
    "playerDetail.stats.parentOrganization": "Parent club",
    "playerDetail.stats.educationPartner": "Education partner",
    "playerDetail.pathway.context": "Competition context",
    "pathways.hero.eyebrow": "Youth Development Systems",
    "pathways.hero.title": "Youth systems and programmes",
    "pathways.hero.text": "Compare school teams, club academies, national talent identification, academy certification and professional bridges across different countries.",
    "pathways.meta.eyebrow": "Coverage",
    "pathways.meta.coverage": "{countries} countries · {count} system nodes",
    "pathways.meta.checked": "System checked through {date}",
    "pathways.tabs.aria": "Country switch",
    "pathways.tabs.japan": "Japan",
    "pathways.tabs.korea": "South Korea",
    "pathways.tabs.norway": "Norway",
    "pathways.tabs.denmark": "Denmark",
    "pathways.tabs.sweden": "Sweden",
    "pathways.structure.eyebrow": "Competition Map",
    "pathways.structure.title": "Development programmes, competitions and professional bridges",
    "pathways.sources.eyebrow": "Official Sources",
    "pathways.sources.title": "Official sources and check dates",
    "pathways.registration": "Pathway entry: {value}",
    "pathways.organizationTypes": "Eligible organizations: {value}",
    "pathways.snapshot": "{season} snapshot: {note}",
    "pathways.viewPlayers": "View site samples ({count})",
    "pathways.noPlayers": "No linked samples yet",
    "pathways.sourceChecked": "Last checked: {date}",
    "dataCenter.hero.eyebrow": "Data Quality & Comparison",
    "dataCenter.hero.title": "Data quality and comparison centre",
    "dataCenter.hero.text": "Review coverage quality, national pathways, programmes and coaches under one consistent scope.",
    "dataCenter.sampleNotice": "Statistics describe repository research samples, not official complete totals.",
    "dataCenter.meta.eyebrow": "Build Metadata",
    "dataCenter.meta.generated": "Data generated: {date}",
    "dataCenter.meta.commit": "Build commit: {value}",
    "dataCenter.meta.unstamped": "Local build (commit not stamped)",
    "dataCenter.meta.deployed": "Deployed build",
    "dataCenter.meta.unavailable": "Metadata is unavailable; directories remain browsable from the current aggregate.",
    "dataCenter.tabs.aria": "Data centre views",
    "dataCenter.tabs.quality": "Coverage quality",
    "dataCenter.tabs.countries": "Country comparison",
    "dataCenter.tabs.projects": "Programmes",
    "dataCenter.tabs.coaches": "Coaches",
    "dataCenter.quality.eyebrow": "Coverage Quality",
    "dataCenter.quality.title": "Dataset coverage and missing fields",
    "dataCenter.quality.empty": "No quality metadata is available.",
    "dataCenter.quality.loadError": "Quality metadata failed to load; the other directories remain available.",
    "dataCenter.quality.datasets": "Datasets",
    "dataCenter.quality.records": "Records",
    "dataCenter.quality.stale": "Stale",
    "dataCenter.quality.review": "Needs review",
    "dataCenter.quality.checked": "Checked range: {oldest} — {newest}",
    "dataCenter.quality.sourceTier": "Best-source tier distribution",
    "dataCenter.quality.missing": "Missing recommended fields",
    "dataCenter.quality.noMissing": "No missing recommended field detected",
    "dataCenter.countries.eyebrow": "Pathway Comparison",
    "dataCenter.countries.title": "Five-country pathway matrix",
    "dataCenter.countries.note": "Only systems stored under the same repository structure are compared; this is not a ranking of national development strength.",
    "dataCenter.countries.empty": "No national pathway data is available.",
    "dataCenter.countries.loadError": "National pathway data failed to load.",
    "dataCenter.countries.country": "Country",
    "dataCenter.countries.nodes": "System nodes",
    "dataCenter.countries.categories": "Entry routes",
    "dataCenter.countries.ages": "Age bands",
    "dataCenter.countries.organizations": "Organizations",
    "dataCenter.countries.types": "Programme types",
    "dataCenter.countries.sources": "Official sources",
    "dataCenter.honours.eyebrow": "Tournament Honours",
    "dataCenter.honours.title": "1985–2025 U20 honours tables",
    "dataCenter.honours.note": "FIFA and AFC are counted separately and only completed editions are included; historical team labels are preserved.",
    "dataCenter.honours.empty": "No completed U20 tournaments match the current scope.",
    "dataCenter.honours.loadError": "U20 tournament archive data failed to load.",
    "dataCenter.honours.editions": "{count} completed editions",
    "dataCenter.honours.team": "Team",
    "dataCenter.honours.titles": "Titles",
    "dataCenter.honours.runners": "Runners-up",
    "dataCenter.honours.finals": "Finals",
    "dataCenter.projects.eyebrow": "Programme Directory",
    "dataCenter.projects.title": "Youth programme directory",
    "dataCenter.projects.searchPlaceholder": "Name, country or programme type",
    "dataCenter.projects.empty": "No youth programme matches the current filters.",
    "dataCenter.projects.loadError": "Youth programme data failed to load.",
    "dataCenter.coaches.eyebrow": "Coach Directory",
    "dataCenter.coaches.title": "Coach directory",
    "dataCenter.coaches.searchPlaceholder": "Name, organization or role",
    "dataCenter.coaches.empty": "No coach record matches the current filters.",
    "dataCenter.coaches.loadError": "Coach data failed to load.",
    "dataCenter.filters.search": "Search",
    "dataCenter.filters.country": "Country / nationality",
    "dataCenter.filters.category": "Category",
    "dataCenter.filters.status": "Quality status",
    "dataCenter.filters.all": "All",
    "dataCenter.results": "Showing {count} / {total}",
    "dataCenter.card.checked": "Checked: {date}",
    "dataCenter.card.sources": "{count} sources · tier {tier}",
    "dataCenter.card.missing": "Missing: {fields}",
    "dataCenter.card.open": "Open source or details",
    "dossier.breadcrumb.home": "Home",
    "dossier.breadcrumb.detail": "Academy dossier",
    "dossier.hero.eyebrow": "Academy Dossier",
    "dossier.hero.lastReviewed": "Checked through {date}",
    "dossier.notFound.title": "Dossier not found",
    "dossier.notFound.text": "This dossier does not exist or is not yet available on the public site.",
    "dossier.stats.founded": "Base opened",
    "dossier.stats.generations": "Generations",
    "dossier.stats.players": "Representative players",
    "dossier.stats.currentFocus": "Current squads",
    "dossier.model.eyebrow": "Development Model",
    "dossier.model.title": "Development model and scope",
    "dossier.timeline.eyebrow": "Timeline",
    "dossier.timeline.title": "Base timeline",
    "dossier.generations.eyebrow": "Generations",
    "dossier.generations.title": "Representative players and current status",
    "dossier.generations.players": "{count} representative players",
    "dossier.generations.empty": "No stable public player list is available for this generation yet.",
    "dossier.program.coach": "Head coach: {value}",
    "dossier.program.ageGroups": "Age groups: {value}",
    "dossier.player.asOf": "As of {date}",
    "dossier.player.source": "Status source",
    "dossier.player.profile": "Site player profile",
    "dossier.boundaries.eyebrow": "Boundaries",
    "dossier.boundaries.title": "Scope and caveats",
    "dossier.questions.eyebrow": "Follow-up",
    "dossier.questions.title": "Open questions",
    "dossier.sources.eyebrow": "Sources",
    "dossier.sources.title": "Sources and check date",
    "dossier.sources.primary": "Primary source",
    "dossier.sources.supporting": "Supporting source",
    "dossier.sources.checked": "Dossier checked through {date}",
    "tournamentDetail.breadcrumb.list": "Tournaments",
    "tournamentDetail.breadcrumb.detail": "Tournament detail",
    "tournamentDetail.hero.eyebrow": "Tournament File",
    "tournamentDetail.result.eyebrow": "Result",
    "tournamentDetail.notFound.title": "Tournament not found",
    "tournamentDetail.notFound.text": "The tournament id in this URL does not exist, or the tournament has not been added to the dataset yet.",
    "tournamentDetail.notFound.back": "Back to tournaments",
    "tournamentDetail.stats.result": "Result",
    "tournamentDetail.stats.confederation": "Confederation",
    "tournamentDetail.stats.level": "Level",
    "tournamentDetail.stats.dateRange": "Date range",
    "tournamentDetail.stats.host": "Host",
    "tournamentDetail.stats.status": "Status",
    "tournamentDetail.stats.chinaStage": "China stage",
    "tournamentDetail.context.eyebrow": "Context",
    "tournamentDetail.context.title": "Tournament context and current desk scope",
    "tournamentDetail.context.headline": "Current headline",
    "tournamentDetail.context.focusTeams": "Focus teams",
    "tournamentDetail.context.empty": "Only the base archive record is available for this tournament so far.",
    "tournamentDetail.field.eyebrow": "Teams & Draw",
    "tournamentDetail.field.title": "Qualification and groups",
    "tournamentDetail.field.meta": "{count} finals teams recorded · Last checked {date}",
    "tournamentDetail.field.participants": "Finals teams",
    "tournamentDetail.field.participantsComplete": "Complete participant list",
    "tournamentDetail.field.participantsPartial": "Currently confirmed / host snapshot",
    "tournamentDetail.field.participantsCancelled": "Qualification snapshot when cancelled",
    "tournamentDetail.field.entry.host": "Host",
    "tournamentDetail.field.entry.qualified": "Qualified",
    "tournamentDetail.field.entry.participant": "Participant",
    "tournamentDetail.field.finalDraw": "Finals groups",
    "tournamentDetail.field.drawPending": "The finals draw has not taken place",
    "tournamentDetail.field.drawCancelled": "Tournament cancelled; groups shown were announced before cancellation",
    "tournamentDetail.field.qualifiers": "Qualifying groups",
    "tournamentDetail.field.phase.qualification": "Qualification Phase",
    "tournamentDetail.field.phase.development": "Development Phase",
    "tournamentDetail.field.phaseDates": "{start} to {end}",
    "tournamentDetail.field.groupHost": "Group host: {host}",
    "tournamentDetail.field.group.finalRound": "Final round",
    "tournamentDetail.field.group.group": "Group {name}",
    "tournamentDetail.history.eyebrow": "History",
    "tournamentDetail.history.title": "China, Japan and Korea Republic by edition",
    "tournamentDetail.history.empty": "No East Asia edition history is attached to this tournament yet.",
    "tournamentDetail.history.appearances": "{count} finals appearances",
    "tournamentDetail.history.bestFinish": "Best: {stage}",
    "tournamentDetail.history.bestYears": "Best editions: {years}",
    "tournamentDetail.history.table.edition": "Edition",
    "tournamentDetail.history.table.host": "Host",
    "tournamentDetail.history.table.china": "China PR",
    "tournamentDetail.history.table.japan": "Japan",
    "tournamentDetail.history.table.korea": "Korea Republic",
    "tournamentDetail.watch.eyebrow": "Watchlist",
    "tournamentDetail.watch.title": "Regional young-player watch",
    "tournamentDetail.watch.empty": "No regional watchlist has been attached to this tournament yet.",
    "tournamentDetail.watch.sampleCount": "{count} players in the {label} pool",
    "tournamentDetail.watch.overseasCount": "{count} currently abroad",
    "tournamentDetail.watch.allPlayers": "Full pool",
    "tournamentDetail.watch.overseasPlayers": "Overseas players",
    "tournamentDetail.watch.noOverseas": "No current overseas player is left in this archived pool.",
    "tournamentDetail.squad.eyebrow": "Squad List",
    "tournamentDetail.squad.title": "China full squad",
    "tournamentDetail.squad.empty": "No China full-squad record has been added for this tournament yet.",
    "tournamentDetail.squad.latestLabel": "Latest public roster",
    "tournamentDetail.squad.latestNote":
      "Compiled from the latest public roster graphic; this view tracks the current China U17 pool and does not replace the 2026 AFC U17 finals squad list.",
    "tournamentDetail.squad.headCoach": "Head coach: {name}",
    "tournamentDetail.squad.finalsToggle": "View the 2026 AFC U17 finals squad list",
    "tournamentDetail.matches.eyebrow": "China Matches",
    "tournamentDetail.matches.title": "China match detail",
    "tournamentDetail.keyPlayers.eyebrow": "Key Players",
    "tournamentDetail.keyPlayers.title": "China key players",
    "tournamentDetail.keyPlayers.empty": "No China key-player summary has been recorded for this tournament yet.",
    "tournamentDetail.keyPlayers.statLine": "{goals} goals · {assists} assists",
    "tournamentDetail.sources.eyebrow": "Sources",
    "tournamentDetail.sources.title": "Tournament source links",
    "playerDetail.notFound.title": "Player not found",
    "playerDetail.notFound.text": "The player id in this URL does not exist, or the sample has not entered the dataset yet.",
    "playerDetail.notFound.back": "Back to players",
    "playerDetail.marketValue.eyebrow": "Market Value",
    "playerDetail.marketValue.title": "Transfermarkt values",
    "playerDetail.marketValue.withLink": "Transfermarkt linked",
    "playerDetail.marketValue.withoutLink": "No stable market value source yet",
    "playerDetail.marketValue.note": "Values follow Transfermarkt. The player page separates current and peak value, and the list page shows rankings for both.",
    "playerDetail.marketHistory.eyebrow": "Market Value History",
    "playerDetail.marketHistory.title": "Market value history",
    "playerDetail.marketHistory.source": "Source: {provider}",
    "playerDetail.marketHistory.updated": "Last checked: {date}",
    "playerDetail.marketHistory.empty": "Public sources were checked, but no market-value history is available yet.",
    "playerDetail.marketHistory.date": "Date",
    "playerDetail.marketHistory.value": "Value",
    "playerDetail.marketHistory.providerNote": "Providers use different valuation methods; alternatives are excluded from Transfermarkt rankings.",
    "playerDetail.hero.summary": "{country} · born {birthYear} · {position}. Currently with {club}.",
    "playerDetail.actions.links": "View external sources",
    "playerDetail.actions.competition": "View competition log",
    "playerDetail.status.eyebrow": "Data Status",
    "playerDetail.status.title": "Data status",
    "playerDetail.status.currentTeam": "Current team",
    "playerDetail.status.registrationSnapshot": "Tournament registration",
    "playerDetail.status.transfermarkt": "Transfermarkt",
    "playerDetail.status.transfermarktLinked": "Linked",
    "playerDetail.status.transfermarktRosterOnly": "Roster or team page only",
    "playerDetail.status.transfermarktMissing": "Missing",
    "playerDetail.status.marketValueCurrent": "Current value",
    "playerDetail.status.marketValuePeak": "Peak value",
    "playerDetail.status.marketValueUnavailable": "No listed value",
    "playerDetail.status.marketValueMissing": "No stable source",
    "playerDetail.status.externalLinks": "External links",
    "playerDetail.status.recentContributions": "Recent contributions",
    "playerDetail.status.verification": "Confidence",
    "playerDetail.status.lastChecked": "Last checked: {date}",
    "playerDetail.profile.eyebrow": "Profile",
    "playerDetail.profile.title": "Basic profile",
    "playerDetail.affiliation.eyebrow": "Affiliation",
    "playerDetail.affiliation.title": "Current affiliation",
    "playerDetail.stats.nameZh": "Chinese name",
    "playerDetail.stats.nameNative": "Native name",
    "playerDetail.stats.nameEn": "English name",
    "playerDetail.stats.birthYear": "Birth year",
    "playerDetail.stats.country": "Country",
    "playerDetail.stats.position": "Position",
    "playerDetail.stats.tags": "Core tags",
    "playerDetail.stats.currentTeam": "Current team",
    "playerDetail.stats.registrationSnapshot": "Tournament registration",
    "playerDetail.stats.parentClub": "Club",
    "playerDetail.stats.currentSquad": "Squad",
    "playerDetail.stats.currentLeague": "Competition system",
    "playerDetail.stats.transfermarktStatus": "Transfermarkt status",
    "playerDetail.stats.marketValueCurrent": "Current value",
    "playerDetail.stats.marketValuePeak": "Peak value",
    "playerDetail.stats.marketValueCurrentDate": "Current value updated",
    "playerDetail.stats.marketValuePeakDate": "Peak date",
    "playerDetail.nameMeta.zh": "Chinese: {value}",
    "playerDetail.nameMeta.native": "Native: {value}",
    "playerDetail.nameMeta.en": "English: {value}",
    "playerDetail.pathway.countryPending": "Country TBD",
    "playerDetail.pathway.youthSetup": "Youth setup",
    "playerDetail.pathway.youthTeam": "Youth team",
    "playerDetail.pathway.empty": "No usable pathway has been added for this sample yet.",
    "playerDetail.participation.empty": "No tournament participation record has been added for this sample yet.",
    "playerDetail.participation.statLine": "{appearances} apps · {goals} goals · {minutes} mins",
    "playerDetail.participation.statsPending": "Detailed appearance data pending",
    "playerDetail.participation.scope": "Scope: {level} · through {date}",
    "playerDetail.participation.sourceChecked": "Sources checked: {date}",
    "playerDetail.participation.partial": "Partial statistics",
    "playerDetail.verification.lastChecked": "Last checked: {date}",
    "playerDetail.verification.noNote": "No additional note",
    "playerDetail.recent.empty": "No structured match contribution has been matched to this player yet.",
    "playerDetail.links.empty": "No external links for this sample yet.",
    "tournaments.hero.eyebrow": "Tournament Directory",
    "tournaments.hero.title": "Tournament directory",
    "tournaments.hero.text": "This archive covers every men's U-20 World Cup and AFC U20 Asian Cup cycle since 1985, alongside the existing Asian Cup, World Cup, and U-17 records.",
    "tournaments.filter.eyebrow": "Filter",
    "tournaments.focus.eyebrow": "Focus Pool",
    "tournaments.focus.title": "Focus tournaments",
    "tournaments.archive.eyebrow": "Archive",
    "tournaments.archive.title": "Tournament archive",
    "tournaments.empty": "No tournaments match the current tab.",
    "tournaments.tabs.all": "All",
    "tournaments.meta.count": "{count} tournaments in this filter",
    "tournaments.archive.completedResult": "{champion} champions / {runnerUp} runners-up",
    "tournaments.archive.ongoingResult": "Ongoing / result pending",
    "tournaments.archive.upcomingResult": "Upcoming / result pending",
    "tournaments.archive.cancelledResult": "Tournament cancelled / no champion",
    "tournaments.archive.fieldSummary": "{count} finals teams · {draw}",
    "tournaments.archive.drawComplete": "draw confirmed",
    "tournaments.archive.drawPending": "draw pending",
    "tournaments.archive.drawCancelled": "pre-cancellation draw snapshot",
    "tournaments.archive.matchLabel": "China vs {opponent} {score} ({result})",
    "tournaments.archive.noContrib": "No recorded goal or assist event for this match yet.",
    "tournaments.archive.noChinaMatches": "No China match has been recorded for this tournament, or China did not qualify.",
    "tournaments.archive.chinaSummary": "China summary: {summary}",
    "tournaments.archive.chinaStage": "China stage: {stage}",
    "tournaments.archive.matchStatsTitle": "Match stats",
    "tournaments.archive.lineupToggle": "China lineup{formation}",
    "tournaments.archive.lineupTitle": "China starting XI{formation}",
    "tournaments.archive.benchTitle": "China bench",
    "tournaments.archive.substituteMinute": "on {minute}'",
    "tournaments.archive.substituteUnused": "unused",
    "tournaments.card.open": "View tournament",
    "tournaments.youthLeague.eyebrow": "Special Topic",
    "tournaments.youthLeague.title": "UEFA Youth League",
    "tournaments.youthLeague.text": "Explore qualification, formats, quarter-finals onward and verified CJK players across the latest three completed seasons.",
    "tournaments.youthLeague.open": "Open topic",
    "youthLeague.hero.eyebrow": "UEFA Youth League",
    "youthLeague.hero.title": "UEFA Youth League",
    "youthLeague.hero.text": "Qualification, formats, knockouts and verified CJK players across the latest three completed seasons.",
    "youthLeague.hero.cjkLink": "View CJK players",
    "youthLeague.hero.back": "Back to tournaments",
    "youthLeague.qualification.eyebrow": "Entry & eligibility",
    "youthLeague.qualification.title": "How clubs and players qualify",
    "youthLeague.seasons.eyebrow": "Three seasons",
    "youthLeague.seasons.title": "The latest three seasons",
    "youthLeague.cjk.eyebrow": "China · Japan · Korea",
    "youthLeague.cjk.title": "CJK players",
    "youthLeague.cjk.note": "The main count follows official UEFA nationality. Dual-nationality or heritage links belong only in the separate boundary watch.",
    "youthLeague.spotlights.eyebrow": "Curated, not exhaustive",
    "youthLeague.spotlights.title": "Selected players from elsewhere",
    "youthLeague.spotlights.note": "This section only includes leading scorers, final goalscorers and players highlighted in UEFA season coverage. It is not a complete player list.",
    "youthLeague.sources.eyebrow": "Source ledger",
    "youthLeague.sources.title": "Official sources",
    "overseas.hero.eyebrow": "Overseas Tracker",
    "overseas.hero.title": "Overseas tracker",
    "overseas.hero.text": "This page separates active overseas samples from historical records. The active section defaults to players who are still abroad right now, while the history section defaults to players who are no longer abroad; once you switch the year filter, it becomes a year-by-year view of who was abroad in that season window.",
    "overseas.note.eyebrow": "Note",
    "overseas.note.text": "This page shows archived samples, not an official full headcount. The China sample includes many U19 / youth players; Japan and South Korea youth coverage is not systematic, so the totals are not directly comparable.",
    "overseas.quickJump.label": "Year jump",
    "overseas.quickJump.note": "Pick a historical year here and the main filter below will stay in sync.",
    "overseas.filters.country": "Country",
    "overseas.filters.bucket": "League bucket",
    "overseas.filters.teamLevel": "Team level",
    "overseas.filters.year": "History year",
    "overseas.filters.actions": "Actions",
    "overseas.filters.reset": "Reset filters",
    "overseas.filters.allCountry": "All countries",
    "overseas.filters.allBucket": "All league buckets",
    "overseas.filters.allTeamLevel": "All team levels",
    "overseas.filters.allYear": "All years",
    "overseas.current.eyebrow": "Current Abroad",
    "overseas.current.title": "Current overseas samples",
    "overseas.current.empty": "No active overseas sample matches the current filters.",
    "overseas.current.eyebrow.year": "Year Snapshot",
    "overseas.current.title.year": "Year snapshot",
    "overseas.current.empty.year": "No overseas sample matches the filters for {year}.",
    "overseas.notes.eyebrow": "Country Notes",
    "overseas.notes.title": "Country notes",
    "overseas.history.eyebrow": "History",
    "overseas.history.title": "Historical records",
    "overseas.history.empty": "No historical record matches the current filters.",
    "overseas.comparison.current": "Current abroad samples",
    "overseas.comparison.history": "{count} historical records",
    "overseas.current.meta": "{count} active overseas samples in this filter",
    "overseas.current.meta.year": "{count} samples were abroad in {year}",
    "overseas.current.teamLevelHistoryNote": "Historical records are not yet classified by team level. Year snapshots ignore the team-level filter.",
    "overseas.history.meta.default": "{count} historical records currently no longer abroad in this filter",
    "overseas.history.meta.year": "{count} records abroad in {year}",
    "overseas.countryNotes.noNote": "No note yet",
    "overseas.countryNotes.empty": "No country note is available for display.",
    "overseas.countryNotes.playerCount": "{count} players",
    "overseas.countryNotes.sources": "Sources",
    "overseas.status.title": "China overseas status scope",
    "overseas.status.note": "The current total only counts active registrations. Pending moves, trial watches, returned players and historical-only entities are excluded.",
    "overseas.coaches.eyebrow": "Coaches",
    "overseas.coaches.title": "Asian head coaches in the big five leagues",
    "overseas.coaches.empty": "No big-five Asian coach record is available yet.",
    "overseas.coaches.meta": "Checked through {date}",
    "overseas.coaches.afcCount": "AFC primary count",
    "overseas.coaches.broadCount": "Broad count",
    "overseas.coaches.primaryRecord": "Primary-scope record",
    "overseas.coaches.sourceCount": "Total sources",
    "overseas.coaches.recordLine": "{matches} matches · {wins}W {draws}D {losses}L",
    "overseas.coaches.points": "{points} pts",
    "overseas.coaches.primaryScope": "Primary scope: {count} coaches whose association was an AFC member at the time of the spell.",
    "overseas.coaches.broadScope": "Broad scope: {count} coaches, adding UEFA boundary cases such as Turkey and Israel.",
    "overseas.coaches.clubRecord": "{league} · {club} · {season}",
    "overseas.coaches.period": "Period: {value}",
    "overseas.coaches.scope": "Scope: {value}",
    "overseas.coaches.confidence": "Confidence: {value}",
    "overseas.coaches.sources": "Sources",
    "overseas.coaches.scope.afc": "AFC member scope",
    "overseas.coaches.scope.broad": "Broad Asian boundary"
  }
};

const YOUTH_LEAGUE_COPY = {
  zh: {
    seasonCount: "完整赛季",
    entrantTotal: "球队赛季",
    cjkCount: "中日韩球员",
    currentRules: "资格规则以 2025/26 赛季为基线",
    routeNote: "卫冕与重复资格",
    playerRules: "球员准入",
    oldFormat: "旧制",
    newFormat: "新制",
    entrants: "{count} 支参赛队",
    champion: "冠军",
    runnerUp: "亚军",
    semiFinalists: "其他四强",
    topScorers: "最佳射手",
    knockout: "八强至决赛",
    teams: "查看全部 {count} 支参赛队",
    championsLeaguePath: "欧冠路径",
    domesticPath: "国内青年冠军路径",
    quarterFinal: "八强",
    semiFinal: "半决赛",
    final: "决赛",
    penalties: "点球 {score}",
    filtersSeason: "赛季",
    filtersCountry: "国家 / 地区",
    filtersStatus: "参赛状态",
    all: "全部",
    china: "中国",
    japan: "日本",
    korea: "韩国",
    appeared: "已出场",
    registeredOnly: "仅报名",
    resultCount: "当前显示 {count} / {total} 人",
    player: "球员",
    club: "俱乐部",
    status: "状态",
    apps: "出场",
    starts: "首发",
    minutes: "分钟",
    goals: "进球",
    assists: "助攻",
    profile: "本站详情",
    uefaNationality: "UEFA 国籍",
    noPlayers: "当前筛选下没有球员。三季已核验样本中没有仅报名未出场者。",
    spotlightSeason: "{season} 精选",
    sourceNote: "来源以 UEFA 规则、赛季历史、官方比赛数据及俱乐部资料为主。",
    methodology: "不是全量名单",
    methodologyText: "三季共有 238 个球队赛季；若按每队最多 40 人导入，会产生数千条记录。因此其他国家只保留赛事代表人物，中日韩按 UEFA 官方国籍逐季核验。"
  },
  en: {
    seasonCount: "completed seasons",
    entrantTotal: "team-seasons",
    cjkCount: "CJK players",
    currentRules: "Eligibility baseline: 2025/26 regulations",
    routeNote: "Title holder and duplicate qualification",
    playerRules: "Player eligibility",
    oldFormat: "Old format",
    newFormat: "New format",
    entrants: "{count} entrants",
    champion: "Champions",
    runnerUp: "Runners-up",
    semiFinalists: "Other semi-finalists",
    topScorers: "Top scorer(s)",
    knockout: "Quarter-finals through final",
    teams: "View all {count} entrants",
    championsLeaguePath: "Champions League path",
    domesticPath: "Domestic champions path",
    quarterFinal: "Quarter-final",
    semiFinal: "Semi-final",
    final: "Final",
    penalties: "pens {score}",
    filtersSeason: "Season",
    filtersCountry: "Country",
    filtersStatus: "Participation",
    all: "All",
    china: "China",
    japan: "Japan",
    korea: "South Korea",
    appeared: "Appeared",
    registeredOnly: "Registered only",
    resultCount: "Showing {count} of {total}",
    player: "Player",
    club: "Club",
    status: "Status",
    apps: "Apps",
    starts: "Starts",
    minutes: "Minutes",
    goals: "Goals",
    assists: "Assists",
    profile: "Site profile",
    uefaNationality: "UEFA nationality",
    noPlayers: "No players match these filters. None of the verified players across these seasons were registered without appearing.",
    spotlightSeason: "{season} picks",
    sourceNote: "Sources prioritize UEFA regulations, season histories, official match data and club profiles.",
    methodology: "Not a full roster dump",
    methodologyText: "The three seasons represent 238 team-seasons. Importing up to 40 players per club would create thousands of records, so other nationalities are curated while CJK players are checked season by season using UEFA nationality."
  }
};

function yt(key, variables = {}) {
  const dictionary = YOUTH_LEAGUE_COPY[state.language] ?? YOUTH_LEAGUE_COPY.zh;
  let template = dictionary[key] ?? YOUTH_LEAGUE_COPY.zh[key] ?? key;
  for (const [name, value] of Object.entries(variables)) {
    template = template.replaceAll(`{${name}}`, String(value));
  }
  return template;
}

const PAGE_METADATA = {
  home: { title: "page.home.title", description: "page.home.description" },
  players: { title: "page.players.title", description: "page.players.description" },
  "player-detail": {
    title: "page.player-detail.title",
    description: "page.player-detail.description"
  },
  tournaments: {
    title: "page.tournaments.title",
    description: "page.tournaments.description"
  },
  "youth-league": {
    title: "page.youth-league.title",
    description: "page.youth-league.description"
  },
  "tournament-detail": {
    title: "page.tournament-detail.title",
    description: "page.tournament-detail.description"
  },
  overseas: { title: "page.overseas.title", description: "page.overseas.description" },
  pathways: { title: "page.pathways.title", description: "page.pathways.description" },
  coaches: { title: "page.coaches.title", description: "page.coaches.description" },
  "data-center": { title: "page.data-center.title", description: "page.data-center.description" },
  "dossier-detail": { title: "page.dossier-detail.title", description: "page.dossier-detail.description" }
};

const COUNTRY_LABELS = {
  zh: {
    Argentina: "阿根廷",
    Australia: "澳大利亚",
    Belgium: "比利时",
    Canada: "加拿大",
    Chile: "智利",
    China: "中国",
    "China PR": "中国",
    Croatia: "克罗地亚",
    Denmark: "丹麦",
    England: "英格兰",
    France: "法国",
    Germany: "德国",
    Indonesia: "印度尼西亚",
    Israel: "以色列",
    Italy: "意大利",
    Japan: "日本",
    "Korea Republic": "韩国",
    Mexico: "墨西哥",
    Netherlands: "荷兰",
    Norway: "挪威",
    Portugal: "葡萄牙",
    Qatar: "卡塔尔",
    "Saudi Arabia": "沙特阿拉伯",
    Serbia: "塞尔维亚",
    Spain: "西班牙",
    Sweden: "瑞典",
    Thailand: "泰国",
    Turkey: "土耳其",
    "United Arab Emirates": "阿联酋",
    "United States": "美国",
    Uzbekistan: "乌兹别克斯坦",
    "Canada / Mexico / United States": "加拿大 / 墨西哥 / 美国"
  },
  en: {
    Australia: "Australia",
    China: "China",
    "China PR": "China PR",
    Israel: "Israel",
    "Korea Republic": "South Korea",
    Denmark: "Denmark",
    Norway: "Norway",
    Sweden: "Sweden",
    Turkey: "Turkey",
    "United Arab Emirates": "United Arab Emirates",
    "Saudi Arabia": "Saudi Arabia",
    "Canada / Mexico / United States": "Canada / Mexico / United States"
  }
};

const POSITION_LABELS = {
  zh: {
    "Attacking Midfield": "前腰 / 中场",
    "Central Midfield": "中前卫",
    "Centre-Back": "中后卫",
    "Centre-Forward": "中锋",
    Defender: "后卫",
    "Defender/Midfielder/Forward": "后卫 / 中场 / 前锋",
    Forward: "前锋",
    Goalkeeper: "门将",
    "Left Winger": "左边锋",
    Midfielder: "中场",
    "Right-Back": "右边后卫",
    "Right Winger": "右边锋"
  },
  en: {
    "Attacking Midfield": "Attacking Midfield",
    "Central Midfield": "Central Midfield",
    "Centre-Back": "Centre-Back",
    "Centre-Forward": "Centre-Forward",
    Defender: "Defender",
    "Defender/Midfielder/Forward": "Defender / Midfielder / Forward",
    Forward: "Forward",
    Goalkeeper: "Goalkeeper",
    "Left Winger": "Left Winger",
    Midfielder: "Midfielder",
    "Right-Back": "Right-Back",
    "Right Winger": "Right Winger"
  }
};

const STATUS_LABELS = {
  completed: { zh: "已结束", en: "Completed" },
  ongoing: { zh: "进行中", en: "Ongoing" },
  upcoming: { zh: "未开始", en: "Upcoming" },
  cancelled: { zh: "已取消", en: "Cancelled" },
  "in-progress": { zh: "进行中", en: "In progress" }
};

const CHINA_STATUS_LABELS = {
  "group-stage": { zh: "小组赛", en: "Group stage" },
  "round-of-16": { zh: "十六强", en: "Round of 16" },
  "quarter-final": { zh: "八强", en: "Quarter-final" },
  "semi-final": { zh: "四强", en: "Semi-final" },
  champion: { zh: "冠军", en: "Champions" },
  "runner-up": { zh: "亚军", en: "Runners-up" },
  "finalist-ongoing": { zh: "决赛进行中", en: "Final in progress" },
  qualified: { zh: "已晋级", en: "Qualified" },
  host: { zh: "主办国", en: "Host" },
  preparation: { zh: "备战", en: "Preparation" },
  "did-not-qualify": { zh: "未晋级", en: "Did not qualify" },
  "did-not-participate": { zh: "未参赛", en: "Did not participate" },
  "qualification-cancelled": { zh: "资格路径取消", en: "Qualification cancelled" }
};

const TOURNAMENT_HISTORY_STAGE_LABELS = {
  Champion: { zh: "冠军", en: "Champions" },
  "Runners-up": { zh: "亚军", en: "Runners-up" },
  "Quarter-finals": { zh: "八强", en: "Quarter-finals" },
  "Round of 16": { zh: "十六强", en: "Round of 16" },
  "Round of 32": { zh: "三十二强", en: "Round of 32" },
  "Group stage": { zh: "小组赛", en: "Group stage" },
  Qualified: { zh: "已获资格", en: "Qualified" },
  "Did not qualify": { zh: "未晋级", en: "Did not qualify" },
  "Did not enter": { zh: "未报名参赛", en: "Did not enter" }
};

const CONTRIBUTION_TYPE_LABELS = {
  goal: { zh: "进球", en: "Goal" },
  assist: { zh: "助攻", en: "Assist" }
};

const CONTRIBUTION_ROLE_LABELS = {
  starter: { zh: "首发", en: "Starter" },
  substitute: { zh: "替补", en: "Substitute" },
  unknown: { zh: "身份待补", en: "Role TBD" }
};

const LEVEL_LABELS = {
  senior: { zh: "亚洲杯", en: "Asian Cup" },
  u23: { zh: "U23", en: "U23" },
  u20: { zh: "U20", en: "U20" },
  u17: { zh: "U17", en: "U17" },
  "senior-world-cup": { zh: "世界杯", en: "World Cup" },
  "u20-world-cup": { zh: "世青赛", en: "U-20 World Cup" },
  "u17-world-cup": { zh: "世少赛", en: "U-17 World Cup" }
};

const BUCKET_LABELS = {
  "big-five": { zh: "五大联赛一线队", en: "Big five first team" },
  "big-five-youth": { zh: "五大联赛国家青训 / 梯队", en: "Big five academy / youth squad" },
  "big-five-lower-tier": { zh: "五大联赛国家低级别联赛", en: "Lower-tier league in a big five country" },
  "europe-other": { zh: "欧洲其他", en: "Other Europe" },
  "asia-other": { zh: "亚洲其他", en: "Other Asia" },
  "oceania-other": { zh: "大洋洲其他", en: "Other Oceania" },
  "americas-other": { zh: "美洲其他", en: "Other Americas" }
};

const OVERSEAS_TEAM_LEVEL_LABELS = {
  "first-team": { zh: "一线队", en: "First team" },
  "u21-u23": { zh: "U21 / U23 / 预备队", en: "U21 / U23 / reserves" },
  "u19-youth": { zh: "U19 / 青年队", en: "U19 / youth" },
  unknown: { zh: "未确认", en: "Unconfirmed" }
};

const OVERSEAS_TEAM_LEVEL_ORDER = ["first-team", "u21-u23", "u19-youth", "unknown"];
const OVERSEAS_TEAM_LEVEL_SUMMARY_ORDER = ["first-team", "u21-u23", "u19-youth"];

const OVERSEAS_STATUS_LABELS = {
  "active-registered": { zh: "当前有效注册", en: "Active registration" },
  "pending-effective": { zh: "待生效", en: "Pending effective date" },
  "trial-watch": { zh: "试训观察", en: "Trial watch" },
  returned: { zh: "已回流", en: "Returned" },
  "historical-only": { zh: "仅历史", en: "Historical only" }
};

const OVERSEAS_STATUS_ORDER = [
  "active-registered",
  "pending-effective",
  "trial-watch",
  "returned",
  "historical-only"
];

const AGE_BAND_LABELS = {
  u17: { zh: "U17", en: "U17" },
  u20: { zh: "U20", en: "U20" },
  u21: { zh: "U21", en: "U21" },
  u23: { zh: "U23", en: "U23" }
};

const LEAGUE_LABELS = {
  "Chinese Super League": { zh: "中超", en: "Chinese Super League" },
  "China League One": { zh: "中甲", en: "China League One" },
  "China domestic system": { zh: "国内职业体系", en: "China domestic system" },
  "Japan pro system": { zh: "日本职业体系", en: "Japan pro system" },
  "Korea pro system": { zh: "韩国职业体系", en: "South Korea pro system" },
  "Europe big five": { zh: "五大联赛一线队", en: "Big five first team" },
  "Europe big five academy": { zh: "五大联赛国家青训 / 梯队", en: "Big five academy / youth squad" },
  "Europe big five lower-tier": { zh: "五大联赛国家低级别联赛", en: "Lower-tier league in a big five country" },
  "Europe other": { zh: "欧洲其他联赛", en: "Other European leagues" },
  "Serbian youth league": { zh: "塞尔维亚青年联赛", en: "Serbian youth league" },
  "Asia other": { zh: "亚洲其他联赛", en: "Other Asian leagues" },
  "High school football": { zh: "高中足球", en: "High school football" },
  "University football": { zh: "大学足球", en: "University football" },
  "待补": { zh: "待补", en: "TBD" }
};

const TAG_LABELS = {
  "afc-u23-2026": { zh: "AFC U23 2026", en: "AFC U23 2026" },
  "500-star-portugal": { zh: "500星计划", en: "500 Star Portugal" },
  "asia-u17-2026": { zh: "U17 亚洲杯 2026", en: "AFC U17 2026" },
  "asia-u23-2026": { zh: "U23 亚洲杯 2026", en: "AFC U23 2026" },
  "bayern-pathway": { zh: "拜仁路径", en: "Bayern pathway" },
  "big-five-lower-tier": { zh: "五大联赛次级别", en: "Big five lower tier" },
  "big-five-youth": { zh: "五大联赛青训", en: "Big five youth" },
  "china-overseas-current": { zh: "中国当前留洋", en: "China current overseas" },
  "china-youth": { zh: "中国青训", en: "China youth" },
  "csl-2026": { zh: "2026 中超", en: "CSL 2026" },
  "csl-u21-current": { zh: "中超 U21", en: "CSL U21" },
  "csl-u23-overseas": { zh: "中超 U23 留洋", en: "CSL U23 overseas" },
  "defender-watch": { zh: "后卫观察", en: "Defender watch" },
  "donglu-football-boys": { zh: "中国足球小将", en: "Donglu Football Boys" },
  "europe-other": { zh: "欧洲其他联赛", en: "Other European leagues" },
  "germany-pathway": { zh: "德国路径", en: "Germany pathway" },
  "olympic-stars-germany": { zh: "08之星赴德", en: "Olympic Stars Germany" },
  homegrown: { zh: "本土培养", en: "Homegrown" },
  "japan-youth": { zh: "日本青训", en: "Japan youth" },
  "k-league": { zh: "K 联赛体系", en: "K League system" },
  "korea-youth": { zh: "韩国青训", en: "Korea youth" },
  "loan-pathway": { zh: "租借路径", en: "Loan pathway" },
  "midfield-watch": { zh: "中场观察", en: "Midfield watch" },
  "mixed-source": { zh: "多源校验", en: "Mixed source" },
  "netherlands-pathway": { zh: "荷兰路径", en: "Netherlands pathway" },
  "overseas-asia": { zh: "亚洲留洋", en: "Overseas in Asia" },
  "overseas-europe": { zh: "欧洲留洋", en: "Overseas in Europe" },
  "premier-league-academy": { zh: "英超青训", en: "Premier League academy" },
  "professional-system": { zh: "职业体系", en: "Professional system" },
  "recent-outbound-2025": { zh: "2025 新增留洋", en: "2025 outbound wave" },
  "recent-outbound-2026": { zh: "2026 新增留洋", en: "2026 outbound wave" },
  "salzburg-pathway": { zh: "萨尔茨堡路径", en: "Salzburg pathway" },
  "school-system": { zh: "学校体系", en: "School system" },
  "striker-watch": { zh: "前锋观察", en: "Striker watch" },
  "u21-watch": { zh: "U21 观察", en: "U21 watch" },
  "u23-overseas": { zh: "U23 留洋", en: "U23 overseas" },
  "u23-watch": { zh: "U23 观察", en: "U23 watch" },
  "uzbekistan-youth": { zh: "乌兹别克青训", en: "Uzbekistan youth" },
  "winger-watch": { zh: "边路观察", en: "Winger watch" }
};

const VERIFICATION_STATUS_LABELS = {
  verified: { zh: "已校验", en: "Verified" },
  "mixed-source": { zh: "多源混合", en: "Mixed source" }
};

const DATA_QUALITY_STATUS_LABELS = {
  complete: { zh: "完整", en: "Complete" },
  mixed: { zh: "多源说明", en: "Mixed" },
  partial: { zh: "部分完整", en: "Partial" },
  "needs-review": { zh: "待复核", en: "Needs review" },
  stale: { zh: "已过期", en: "Stale" },
  excluded: { zh: "已排除", en: "Excluded" }
};

const DATA_PROJECT_CATEGORY_LABELS = {
  "research-project": { zh: "研究项目", en: "Research project" },
  "national-programme": { zh: "国家体系项目", en: "National programme" }
};

const DATA_COACH_CATEGORY_LABELS = {
  "youth-development": { zh: "基层 / 青训教练", en: "Youth-development coach" },
  "china-national-youth": { zh: "中国国字号青年队", en: "China national youth" },
  "big-five": { zh: "五大联赛", en: "Big-five leagues" },
  "asia-expanded": { zh: "亚洲扩展", en: "Asian expanded scope" }
};

const DATA_SOURCE_TIER_LABELS = {
  1: { zh: "1 · 足协 / 官方", en: "1 · Association / official" },
  2: { zh: "2 · 俱乐部 / 学校", en: "2 · Club / school" },
  3: { zh: "3 · 官方统计", en: "3 · Official statistics" },
  4: { zh: "4 · 可靠媒体", en: "4 · Reliable media" },
  5: { zh: "5 · 公共数据库", en: "5 · Public database" },
  6: { zh: "6 · 线索来源", en: "6 · Lead source" },
  unclassified: { zh: "未分类", en: "Unclassified" }
};

const SQUAD_STATUS_LABELS = {
  registered: { zh: "已报名", en: "Registered" },
  tracked: { zh: "观察样本", en: "Tracked" }
};

const LINK_TYPE_LABELS = {
  official: { zh: "官方", en: "Official" },
  wikipedia: { zh: "维基", en: "Wikipedia" },
  profile: { zh: "资料页", en: "Profile" },
  club: { zh: "俱乐部", en: "Club" },
  stats: { zh: "数据", en: "Stats" },
  news: { zh: "新闻", en: "News" },
  transfermarkt: { zh: "Transfermarkt", en: "Transfermarkt" },
  school: { zh: "学校", en: "School" },
  external: { zh: "外部链接", en: "External" }
};

const ORGANIZATION_TYPE_LABELS = {
  "high-school": { zh: "高中足球部", en: "High-school team" },
  "club-academy": { zh: "职业俱乐部梯队", en: "Club academy" },
  "community-club": { zh: "基层 / 社区俱乐部", en: "Grassroots / community club" },
  university: { zh: "大学球队", en: "University team" },
  "professional-club": { zh: "职业一线队", en: "Professional first team" },
  "military-service-club": { zh: "成年军队球队", en: "Senior military-service club" },
  "overseas-academy": { zh: "海外青训梯队", en: "Overseas academy" },
  "national-academy": { zh: "国家级青训学院", en: "National academy" },
  "football-school": { zh: "足球学校", en: "Football school" },
  "professional-club-unspecified": { zh: "职业俱乐部（梯队未明）", en: "Professional club (squad level unconfirmed)" }
};

const SOURCE_LAYER_TYPE_LABELS = {
  "afc-registration": { zh: "AFC 报名", en: "AFC registration" },
  "national-fa-profile": { zh: "国家足协", en: "National association" },
  "school-profile": { zh: "学校", en: "School" },
  "university-profile": { zh: "大学", en: "University" },
  "club-academy-profile": { zh: "俱乐部梯队", en: "Club academy" },
  "club-profile": { zh: "职业俱乐部", en: "Professional club" },
  "league-registration": { zh: "联赛", en: "League" }
};

const SOURCE_LAYER_CONFIDENCE_LABELS = {
  high: { zh: "高", en: "High" },
  medium: { zh: "中", en: "Medium" },
  low: { zh: "低", en: "Low" }
};

const ACADEMY_CURRENT_STATUS_LABELS = {
  "active-first-team": { zh: "一线队现役", en: "Active first-team player" },
  "active-reserve": { zh: "预备队 / B队现役", en: "Active reserve / B-team player" },
  "active-professional": { zh: "职业球员", en: "Active professional" },
  "retired-coach": { zh: "退役后执教", en: "Retired, now coaching" },
  "youth-development": { zh: "青训上升期", en: "Youth development pathway" },
  "needs-review": { zh: "当前去向待复核", en: "Current destination needs review" },
  "active-development-program": { zh: "在训梯队", en: "Active development programme" }
};

const YOUTH_COMPETITION_TYPE_LABELS = {
  "league-pyramid": { zh: "联赛金字塔", en: "League pyramid" },
  "league-final": { zh: "联赛总决赛", en: "League final" },
  "school-cup": { zh: "学校杯赛", en: "School cup" },
  "club-cup": { zh: "俱乐部赛事", en: "Club competition" },
  "university-league": { zh: "大学联赛", en: "University league" },
  "university-cup": { zh: "大学杯赛", en: "University cup" },
  "professional-bridge": { zh: "职业桥梁", en: "Professional bridge" },
  "school-league": { zh: "高中联赛", en: "High-school league" },
  "school-championship": { zh: "高中冠军赛", en: "High-school championship" },
  "club-league": { zh: "俱乐部梯队联赛", en: "Club academy league" },
  "talent-development-program": { zh: "人才培养项目", en: "Talent-development programme" },
  "academy-certification": { zh: "学院认证", en: "Academy certification" },
  "club-development-program": { zh: "俱乐部发展项目", en: "Club-development programme" },
  "player-development-framework": { zh: "球员培养框架", en: "Player-development framework" }
};

const MATCH_RESULT_LABELS = {
  W: { zh: "胜", en: "W" },
  D: { zh: "平", en: "D" },
  L: { zh: "负", en: "L" },
  TBD: { zh: "待定", en: "TBD" }
};

const MATCH_STAT_LABELS = {
  expected_goals: { zh: "预期进球 xG", en: "Expected goals (xG)" },
  possession: { zh: "控球率", en: "Possession" },
  big_chances: { zh: "绝佳机会", en: "Big chances" },
  total_shots: { zh: "总射门", en: "Total shots" },
  shots_on_target: { zh: "射正", en: "Shots on target" },
  shots_off_target: { zh: "射偏", en: "Shots off target" },
  shots_inside_box: { zh: "禁区内射门", en: "Shots inside the box" },
  shots_outside_box: { zh: "禁区外射门", en: "Shots outside the box" }
};

const PROJECT_PRIORITY_LABELS = {
  high: { zh: "高优先级", en: "High priority" },
  medium: { zh: "中优先级", en: "Medium priority" }
};

const bigFiveCountries = new Set(["England", "Spain", "Germany", "Italy", "France"]);
const youthAgeBands = new Set(["u17", "u20", "u21"]);
const europeCountries = new Set([
  "England",
  "Spain",
  "Germany",
  "Italy",
  "France",
  "Netherlands",
  "Belgium",
  "Portugal",
  "Croatia",
  "Serbia"
]);
const asiaCountries = new Set([
  "Japan",
  "Korea Republic",
  "China",
  "China PR",
  "Uzbekistan",
  "Saudi Arabia",
  "Qatar",
  "United Arab Emirates"
]);
const chineseSuperLeagueClubs = new Set([
  "Changchun Yatai FC",
  "Chengdu Rongcheng FC",
  "Dalian Yingbo FC",
  "Henan FC",
  "Qingdao Hainiu FC",
  "Qingdao West Coast FC",
  "Shandong Taishan FC",
  "Shanghai Port FC",
  "Shanghai Shenhua FC",
  "Shenzhen Peng City FC",
  "Zhejiang FC"
]);
const chinaLeagueOneClubs = new Set([
  "Chongqing Tonglianglong FC",
  "Shijiazhuang Gongfu FC",
  "Suzhou Dongwu FC"
]);
const PLAYER_MARKET_VALUE_RANK_LIMIT = 8;

document.addEventListener("DOMContentLoaded", () => {
  initializeLanguage();
  void boot();
});

async function boot() {
  try {
    const dataCenterPage = page === "data-center";
    const [players, overview, meta] = await Promise.all([
      dataCenterPage ? Promise.resolve([]) : fetchJson("./data/site/players.json"),
      dataCenterPage
        ? fetchJson("./data/site/overview.json").catch((error) => {
            state.dataCenter.overviewError = error;
            return {};
          })
        : fetchJson("./data/site/overview.json"),
      dataCenterPage
        ? fetchJson("./data/site/meta.json").catch((error) => {
            state.dataCenter.metaError = error;
            return null;
          })
        : Promise.resolve(null)
    ]);

    state.players = players;
    state.overview = overview;
    state.meta = meta;
    state.enrichedPlayers = players.map((player) => enrichPlayer(player, overview));

    setActiveNavigation();
    setGlobalUpdatedLabel();

    if (page === "home") {
      renderHomePage();
      return;
    }

    if (page === "players") {
      initializePlayerFilters();
      renderPlayersPage();
      return;
    }

    if (page === "player-detail") {
      renderPlayerDetailPage();
      return;
    }

    if (page === "dossier-detail") {
      renderDossierDetailPage();
      return;
    }

    if (page === "tournament-detail") {
      renderTournamentDetailPage();
      return;
    }

    if (page === "tournaments") {
      initializeTournamentFilters();
      renderTournamentsPage();
      return;
    }

    if (page === "youth-league") {
      initializeYouthLeagueFilters();
      renderYouthLeaguePage();
      return;
    }

    if (page === "overseas") {
      initializeOverseasFilters();
      renderOverseasPage();
      return;
    }

    if (page === "pathways") {
      initializePathwaysPage();
      renderPathwaysPage();
      return;
    }

    if (page === "coaches") {
      renderCoachesPage();
      return;
    }

    if (page === "data-center") {
      initializeDataCenterPage();
      renderDataCenterPage();
    }
  } catch (error) {
    console.error(error);
    renderGlobalError(error);
  }
}

async function fetchJson(url) {
  const requestUrl = new URL(url, window.location.href);
  requestUrl.searchParams.set("_v", SITE_DATA_VERSION);

  const response = await fetch(requestUrl, {
    cache: "no-store"
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${requestUrl.pathname}: ${response.status}`);
  }

  return response.json();
}

function renderGlobalError(error) {
  const shells = document.querySelectorAll(".content-panel, .hero-spotlight, .page-hero");
  if (shells.length === 0) {
    return;
  }

  const message = `
    <div class="error-box">
      <strong>${escapeHtml(t("common.pageRenderErrorTitle"))}</strong>
      <p>${String(error.message ?? error)}</p>
    </div>
  `;

  const target = shells[0];
  target.insertAdjacentHTML("beforeend", message);
}

function setActiveNavigation() {
  document.querySelectorAll("[data-nav]").forEach((link) => {
    if (
      link.dataset.nav === page ||
      (page === "player-detail" && link.dataset.nav === "players") ||
      (page === "tournament-detail" && link.dataset.nav === "tournaments") ||
      (page === "youth-league" && link.dataset.nav === "tournaments")
    ) {
      link.classList.add("is-active");
    }
  });
}

function setGlobalUpdatedLabel() {
  const node = document.querySelector("#globalUpdatedLabel");
  if (!node || !state.overview) {
    return;
  }

  node.textContent = t("common.updatedAt", { date: formatDate(state.overview.generated_at) });
}

function getSavedLanguage() {
  try {
    const saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return saved === "en" ? "en" : "zh";
  } catch (error) {
    return "zh";
  }
}

function setSavedLanguage(language) {
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch (error) {
    // Ignore storage failures and keep in-memory state only.
  }
}

function t(key, variables = {}) {
  const dictionary = UI_COPY[state.language] ?? UI_COPY.zh;
  const fallbackDictionary = UI_COPY.zh;
  let template = dictionary[key] ?? fallbackDictionary[key] ?? key;

  for (const [name, value] of Object.entries(variables)) {
    template = template.replaceAll(`{${name}}`, String(value));
  }

  return template;
}

function getLabel(map, key, fallback = "-") {
  if (key === undefined || key === null || key === "") {
    return fallback;
  }

  const entry = map[key];
  if (!entry) {
    return fallback ?? key;
  }

  return entry[state.language] ?? entry.zh ?? fallback ?? key;
}

function localizeText(value, fallback = "") {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const localized = value[state.language] ?? value.zh ?? value.en;
    return localized ?? fallback;
  }

  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  return String(value);
}

function getClubNameOverrides() {
  return state.overview?.club_name_overrides ?? {};
}

function translateClubSegment(segment, overrides = getClubNameOverrides()) {
  const value = String(segment ?? "").trim();
  if (!value) {
    return value;
  }

  if (overrides[value]) {
    return overrides[value];
  }

  const youthMatch = value.match(/^(.*)\s+Youth$/i);
  if (youthMatch) {
    const base = translateClubSegment(youthMatch[1], overrides);
    return base === youthMatch[1] ? `${base} Youth` : `${base}青年队`;
  }

  const reserveMatch = value.match(/^(.*)\s+II$/);
  if (reserveMatch) {
    const base = translateClubSegment(reserveMatch[1], overrides);
    return base === reserveMatch[1] ? `${base} II` : `${base}二队`;
  }

  const ageTeamMatch = value.match(/^(.*)\s+U-?(\d{2})$/i);
  if (ageTeamMatch) {
    const base = translateClubSegment(ageTeamMatch[1], overrides);
    return base === ageTeamMatch[1] ? `${base} U${ageTeamMatch[2]}` : `${base}U${ageTeamMatch[2]}队`;
  }

  return value;
}

function localizeClubName(value, language = state.language, overrides = getClubNameOverrides()) {
  const text = String(value ?? "").trim();
  if (!text || language === "en") {
    return text;
  }

  if (overrides[text]) {
    return overrides[text];
  }

  if (text.includes(" / ")) {
    return text
      .split(" / ")
      .map((segment) => translateClubSegment(segment, overrides))
      .join(" / ");
  }

  return translateClubSegment(text, overrides);
}

function formatClubName(value) {
  if (!value) {
    return t("common.pending");
  }

  return localizeClubName(value);
}

function applyPageMetadata() {
  const metadata = PAGE_METADATA[page];
  if (!metadata) {
    return;
  }

  document.title = t(metadata.title);
  const descriptionNode = document.querySelector('meta[name="description"]');
  if (descriptionNode) {
    descriptionNode.setAttribute("content", t(metadata.description));
  }
}

function applyStaticTranslations() {
  document.documentElement.lang = state.language === "en" ? "en" : "zh-CN";
  document.body.dataset.language = state.language;
  applyPageMetadata();

  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
    node.setAttribute("placeholder", t(node.dataset.i18nPlaceholder));
  });

  document.querySelectorAll("[data-i18n-aria-label]").forEach((node) => {
    node.setAttribute("aria-label", t(node.dataset.i18nAriaLabel));
  });

  updateLanguageToggle();
}

function updateLanguageToggle() {
  const button = document.querySelector("#languageToggleButton");
  const value = document.querySelector("#languageToggleValue");
  if (!button || !value) {
    return;
  }

  const nextLanguage = state.language === "zh" ? "en" : "zh";
  value.textContent = nextLanguage === "en" ? "EN" : "中文";
  button.setAttribute(
    "aria-label",
    nextLanguage === "en" ? "Switch to English" : "切换到中文"
  );
}

function initializeLanguage() {
  state.language = getSavedLanguage();
  applyStaticTranslations();

  document.querySelector("#languageToggleButton")?.addEventListener("click", () => {
    const nextLanguage = state.language === "zh" ? "en" : "zh";
    setSavedLanguage(nextLanguage);
    window.location.reload();
  });
}

function getLocale() {
  return state.language === "en" ? "en-US" : "zh-CN";
}

function getSortLocale() {
  return state.language === "en" ? "en" : "zh-CN";
}

function formatCountryName(value) {
  if (!value) {
    return t("common.pending");
  }

  return COUNTRY_LABELS[state.language]?.[value] ?? COUNTRY_LABELS.zh[value] ?? value;
}

function formatPosition(value) {
  if (!value) {
    return t("players.card.positionPending");
  }

  return POSITION_LABELS[state.language]?.[value] ?? POSITION_LABELS.zh[value] ?? value;
}

function formatAge(value) {
  return t("common.age", { age: value });
}

function normalize(value) {
  return String(value ?? "").trim().toLowerCase();
}

function normalizeCountry(value) {
  const aliases = {
    "china pr": "china",
    "people's republic of china": "china",
    "korea republic": "south korea",
    "republic of korea": "south korea"
  };
  const key = normalize(value);
  return aliases[key] ?? key;
}

function uniqueNameValues(values) {
  const seen = new Set();
  const items = [];

  for (const value of values) {
    const name = String(value ?? "").trim();
    if (!name) {
      continue;
    }
    const normalized = normalize(name);
    if (seen.has(normalized)) {
      continue;
    }
    seen.add(normalized);
    items.push(name);
  }

  return items;
}

function getPlayerNames(player) {
  const names = player.names ?? {};
  const englishName = String(names.en ?? player.name ?? "").trim();
  const localName = String(player.local_name ?? "").trim();
  const chineseName = String(names.zh ?? localName ?? englishName).trim() || englishName;
  const nativeName = String(names.native ?? localName ?? englishName).trim() || englishName;

  return {
    zh: chineseName,
    en: englishName,
    native: nativeName,
    ja: String(names.ja ?? "").trim(),
    ko: String(names.ko ?? "").trim()
  };
}

function getPlayerPrimaryName(player) {
  const names = getPlayerNames(player);
  if (state.language === "en") {
    return names.en || names.native || names.zh || player.name;
  }

  return names.zh || names.native || names.en || player.name;
}

function getPlayerSecondaryNames(player) {
  const primary = getPlayerPrimaryName(player);
  const names = getPlayerNames(player);
  const secondaryPool = state.language === "en" ? [names.zh, names.native] : [names.native, names.en];
  return uniqueNameValues(secondaryPool).filter((value) => normalize(value) !== normalize(primary));
}

function getPlayerNameVariants(player) {
  const names = getPlayerNames(player);
  return uniqueNameValues([
    player.name,
    player.local_name,
    names.zh,
    names.en,
    names.native,
    names.ja,
    names.ko
  ]);
}

function getPlayerNameMeta(player) {
  const names = getPlayerNames(player);
  const primary = getPlayerPrimaryName(player);
  const parts = [];

  if (names.zh && normalize(names.zh) !== normalize(primary)) {
    parts.push(t("playerDetail.nameMeta.zh", { value: names.zh }));
  }

  if (
    names.native &&
    normalize(names.native) !== normalize(primary) &&
    normalize(names.native) !== normalize(names.zh)
  ) {
    parts.push(t("playerDetail.nameMeta.native", { value: names.native }));
  }

  if (names.en && normalize(names.en) !== normalize(primary)) {
    parts.push(t("playerDetail.nameMeta.en", { value: names.en }));
  }

  return parts.join(" · ");
}

function getBirthYear(value) {
  return String(value ?? "").slice(0, 4) || t("common.pending");
}

function getPlayerCurrentTeamRaw(player) {
  const registrationCountry = normalizeCountry(player.registration_club?.country);
  const sameCountrySteps = (player.training_pathway ?? []).filter((step) => {
    const stepCountry = normalizeCountry(step.country);
    return registrationCountry ? stepCountry === registrationCountry : true;
  });

  return sameCountrySteps[sameCountrySteps.length - 1]?.organization ?? player.registration_club?.name ?? "";
}

function getPlayerRegistrationStep(player) {
  return (player.training_pathway ?? []).find((step) =>
    normalize(step.stage_label).includes("报名归属") || normalize(step.stage_label).includes("registration")
  );
}

function extractSquadLabel(value) {
  const text = String(value ?? "").trim();
  if (!text) {
    return "";
  }

  const match = text.match(/\b(U-?\d{2}|II|Youth)\b/i);
  if (!match) {
    return "";
  }

  return match[1].replace("U-", "U");
}

function getPlayerAffiliation(player) {
  const currentTeamRaw = getPlayerCurrentTeamRaw(player);
  const registrationStep = getPlayerRegistrationStep(player);
  const parentClubRaw = registrationStep?.organization ?? player.registration_club?.name ?? currentTeamRaw;
  const squadLabel = extractSquadLabel(currentTeamRaw);
  const explicitParent = player.registration_club?.parent_organization?.name ?? "";
  const educationPartner = player.registration_club?.education_partner?.name ?? "";
  const organizationType = player.registration_club?.organization_type ?? "";
  const isTournamentSnapshot = player.registration_club?.status === "tournament-snapshot";
  const registrationAsOf = player.registration_club?.as_of ?? "";
  const formattedTeam = formatClubName(currentTeamRaw || t("common.pending"));
  const currentTeam = isTournamentSnapshot
    ? state.language === "en"
      ? `${formattedTeam} (as of ${formatDate(registrationAsOf)})`
      : `${formattedTeam}（截至 ${formatDate(registrationAsOf)}）`
    : formattedTeam;
  const directoryTeam = isTournamentSnapshot
    ? state.language === "en"
      ? `Tournament registration: ${currentTeam}`
      : `赛事报名归属：${currentTeam}`
    : currentTeam;

  return {
    currentTeamRaw,
    currentTeam,
    directoryTeam,
    parentClubRaw,
    parentClub: formatClubName(parentClubRaw || t("common.pending")),
    squadLabel: squadLabel || t("common.pending"),
    system: formatLeagueSystem(player.currentLeagueSystem),
    organizationType,
    organizationTypeLabel: getLabel(ORGANIZATION_TYPE_LABELS, organizationType, t("common.pending")),
    explicitParent: explicitParent ? formatClubName(explicitParent) : "",
    educationPartner: educationPartner ? formatClubName(educationPartner) : "",
    isTournamentSnapshot,
    registrationAsOf
  };
}

function buildPlayerHeroSummary(player, affiliation) {
  const birthYear = getBirthYear(player.birth_date);
  const lead = state.language === "en"
    ? `${formatCountryName(player.country)} · born ${birthYear} · ${formatPosition(player.primary_position)}`
    : `${formatCountryName(player.country)} · ${birthYear} 年生 · ${formatPosition(player.primary_position)}`;

  const fragments = [];
  if ((player.focus_tags ?? []).includes("donglu-football-boys")) {
    fragments.push(state.language === "en" ? "has a China Football Boys background" : "曾有中国足球小将经历");
  }

  const narrativeStep =
    (player.training_pathway ?? []).find((step) => /成长|青训|出身/.test(localizeText(step.stage_label))) ?? null;
  if (narrativeStep) {
    fragments.push(
      state.language === "en"
        ? `developed in ${formatClubName(narrativeStep.organization)}`
        : `成长于${formatClubName(narrativeStep.organization)}`
    );
  }

  const tail = affiliation.isTournamentSnapshot
    ? state.language === "en"
      ? `AFC tournament registration: ${affiliation.currentTeam}`
      : `AFC 赛事报名归属为${affiliation.currentTeam}`
    : state.language === "en"
      ? `currently with ${affiliation.currentTeam}`
      : `现属${affiliation.currentTeam}`;

  if (fragments.length === 0) {
    return state.language === "en" ? `${lead}. ${tail}.` : `${lead}。${tail}。`;
  }

  const clause = fragments.join(state.language === "en" ? ", " : "，");
  const normalizedClause =
    state.language === "en" ? `${clause.charAt(0).toUpperCase()}${clause.slice(1)}` : clause;

  return state.language === "en"
    ? `${lead}. ${normalizedClause}, ${tail}.`
    : `${lead}。${normalizedClause}，${tail}。`;
}

function formatTagList(tags) {
  return (tags ?? []).map(formatTag).join(" / ") || t("common.noTags");
}

function formatParticipationStatLine(entry) {
  const parts = [];
  if (entry.appearances !== null && entry.appearances !== undefined) {
    parts.push(state.language === "en" ? `${entry.appearances} apps` : `${entry.appearances} 场`);
  }
  if (entry.starts !== null && entry.starts !== undefined) {
    parts.push(state.language === "en" ? `${entry.starts} starts` : `${entry.starts} 次首发`);
  }
  if (entry.substitute_appearances !== null && entry.substitute_appearances !== undefined) {
    parts.push(state.language === "en" ? `${entry.substitute_appearances} sub apps` : `${entry.substitute_appearances} 次替补`);
  }
  if (entry.goals !== null && entry.goals !== undefined) {
    parts.push(state.language === "en" ? `${entry.goals} goals` : `${entry.goals} 球`);
  }
  if (entry.minutes !== null && entry.minutes !== undefined) {
    parts.push(state.language === "en" ? `${entry.minutes} mins` : `${entry.minutes} 分钟`);
  }
  if (entry.yellow_cards !== null && entry.yellow_cards !== undefined) {
    parts.push(state.language === "en" ? `${entry.yellow_cards} yellow` : `${entry.yellow_cards} 黄牌`);
  }
  if (entry.red_cards !== null && entry.red_cards !== undefined) {
    parts.push(state.language === "en" ? `${entry.red_cards} red` : `${entry.red_cards} 红牌`);
  }
  return parts.join(" · ") || t("playerDetail.participation.statsPending");
}

function formatCompetitionLevel(value) {
  const labels = {
    "senior-top-flight": { zh: "成年顶级联赛", en: "senior top flight" },
    "senior-second-tier": { zh: "成年第二级联赛", en: "senior second tier" },
    "senior-third-tier": { zh: "成年第三级联赛", en: "senior third tier" },
    "senior-cup": { zh: "成年杯赛", en: "senior cup" },
    "youth-u21": { zh: "U21 青年联赛", en: "U21 youth league" },
    "senior-amateur-fourth-tier": { zh: "成年业余第四级联赛", en: "senior amateur fourth tier" }
  };
  return labels[value]?.[state.language] ?? value ?? "-";
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

  const options =
    state.language === "en"
      ? { year: "numeric", month: "short", day: "numeric" }
      : { year: "numeric", month: "2-digit", day: "2-digit" };

  return new Intl.DateTimeFormat(getLocale(), options).format(new Date(`${value}T00:00:00Z`));
}

function formatRange(range) {
  if (!range?.start && !range?.end) {
    return t("common.pending");
  }
  return `${formatDate(range.start)} - ${formatDate(range.end)}`;
}

function getAge(birthDate, asOfDate) {
  const birth = new Date(`${birthDate}T00:00:00Z`);
  const asOf = new Date(`${asOfDate}T00:00:00Z`);
  let age = asOf.getUTCFullYear() - birth.getUTCFullYear();
  const monthDiff = asOf.getUTCMonth() - birth.getUTCMonth();
  const dayDiff = asOf.getUTCDate() - birth.getUTCDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age -= 1;
  }

  return age;
}

function uniqueValues(values) {
  return [...new Set(values.filter(Boolean))].sort((left, right) =>
    left.localeCompare(right, getSortLocale())
  );
}

function isForeignRegistration(player) {
  const clubCountry = normalizeCountry(player.registration_club?.country);
  const nationalCountry = normalizeCountry(player.country);
  return clubCountry && nationalCountry && clubCountry !== nationalCountry;
}

function summarizePathway(pathway) {
  if (!Array.isArray(pathway) || pathway.length === 0) {
    return t("common.pending");
  }

  return pathway
    .map((step) => `${localizeText(step.stage_label)}: ${formatClubName(step.organization)}`)
    .join(" / ");
}

function getDomesticOriginStep(pathway, country) {
  if (!Array.isArray(pathway) || pathway.length === 0) {
    return null;
  }

  const normalizedCountry = normalizeCountry(country);
  return (
    pathway.find((step) => normalizeCountry(step.country) === normalizedCountry) ??
    pathway.find((step) => normalize(step.stage_label).includes("国内")) ??
    null
  );
}

function getLatestForeignPathwayStep(pathway, country) {
  if (!Array.isArray(pathway) || pathway.length === 0) {
    return null;
  }

  const normalizedCountry = normalizeCountry(country);
  const foreignSteps = pathway.filter((step) => {
    const stepCountry = normalizeCountry(step.country);
    return stepCountry && stepCountry !== normalizedCountry;
  });

  return foreignSteps[foreignSteps.length - 1] ?? null;
}

function inferPathwayTeamBand(step) {
  const text = [step?.organization ?? "", localizeText(step?.stage_label, "")].join(" ");
  const uMatch = text.match(/\bU[\s-]?(\d{2})([AB])?\b/i);
  if (uMatch) {
    return `U${uMatch[1]}${(uMatch[2] ?? "").toUpperCase()}`;
  }

  const cadetMatch = text.match(/\bCadet(?:e)?\s*([AB])\b/i);
  if (cadetMatch) {
    return `Cadet ${cadetMatch[1].toUpperCase()}`;
  }

  const juvenilMatch = text.match(/\bJuvenil\s*([AB])\b/i);
  if (juvenilMatch) {
    return `Juvenil ${juvenilMatch[1].toUpperCase()}`;
  }

  if (/青年队/.test(text)) {
    return t("playerDetail.pathway.youthTeam");
  }

  if (/青训|youth/i.test(text)) {
    return t("playerDetail.pathway.youthSetup");
  }

  return "";
}

function buildPathwayMetaLabels(step) {
  const labels = [];
  const seen = new Set();

  const push = (value) => {
    const label = typeof value === "string" ? value : localizeText(value, "");
    if (!label) {
      return;
    }

    const key = normalize(label);
    if (seen.has(key)) {
      return;
    }

    seen.add(key);
    labels.push(label);
  };

  push(formatCountryName(step?.country ?? t("playerDetail.pathway.countryPending")));
  push(inferPathwayTeamBand(step));
  for (const item of step?.pathway_meta ?? []) {
    push(item);
  }

  return labels;
}

function cleanStageLabel(value) {
  return String(localizeText(value) ?? "")
    .replace(/报名归属/g, "赛事报名归属")
    .replace(/口径/g, "")
    .replace(/节点/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function formatOverseasPathSummary(step) {
  if (!step) {
    return t("common.pending");
  }

  const label = cleanStageLabel(step.stage_label);
  const organization = formatClubName(step.organization);
  return label ? `${label} · ${organization}` : organization;
}

function getCountryPlayerLabel(country) {
  return t("home.overseasSummary.playerGroup", { country: formatCountryName(country) });
}

function getFocusTournamentLatestNote(tournament) {
  const notes = tournament.notes ?? [];
  return (
    notes.find((note) => /中国|China/i.test(localizeText(note))) ??
    notes[0] ??
    localizeText(tournament.headline)
  );
}

function formatStatus(status) {
  return getLabel(STATUS_LABELS, status, status ?? "-");
}

function formatChinaStatus(status) {
  return getLabel(CHINA_STATUS_LABELS, status, status ?? "-");
}

function formatTournamentHistoryStage(stage) {
  return getLabel(TOURNAMENT_HISTORY_STAGE_LABELS, stage, stage ?? "-");
}

function formatContributionType(type) {
  return getLabel(CONTRIBUTION_TYPE_LABELS, type, type ?? "-");
}

function formatContributionRole(role) {
  return getLabel(CONTRIBUTION_ROLE_LABELS, role, role ?? "-");
}

function formatLevelTag(level) {
  return getLabel(LEVEL_LABELS, level, level);
}

function formatBucket(bucket) {
  return getLabel(BUCKET_LABELS, bucket, bucket ?? "-");
}

function formatOverseasTeamLevel(teamLevel) {
  return getLabel(OVERSEAS_TEAM_LEVEL_LABELS, teamLevel, teamLevel ?? "-");
}

function formatOverseasStatus(status) {
  return getLabel(OVERSEAS_STATUS_LABELS, status, status ?? "-");
}

function formatAgeBand(ageBand) {
  return getLabel(AGE_BAND_LABELS, ageBand, ageBand ?? "-");
}

function formatLeagueSystem(value) {
  if (!value) {
    return t("common.pending");
  }

  if (LEAGUE_LABELS[value]) {
    return LEAGUE_LABELS[value][state.language] ?? LEAGUE_LABELS[value].zh;
  }

  if (value.endsWith(" academy")) {
    return state.language === "en"
      ? `${value.replace(/ academy$/, "")} academy`
      : `${value.replace(/ academy$/, "")} 青训体系`;
  }

  if (value.endsWith(" pro system")) {
    return state.language === "en"
      ? value
      : `${value.replace(/ pro system$/, "")} 职业体系`;
  }

  return value ?? "-";
}

function inferLeagueSystem(player) {
  if (player.league_system_override) {
    return player.league_system_override;
  }

  const clubName = player.registration_club?.name ?? "";
  const clubCountry = player.registration_club?.country ?? "";

  if (chineseSuperLeagueClubs.has(clubName)) {
    return "Chinese Super League";
  }

  if (chinaLeagueOneClubs.has(clubName)) {
    return "China League One";
  }

  if (/High School/i.test(clubName)) {
    return "High school football";
  }

  if (/University/i.test(clubName)) {
    return "University football";
  }

  if (bigFiveCountries.has(clubCountry)) {
    if (isBigFiveYouthRoute(player)) {
      return "Europe big five academy";
    }

    if (player.overseas_bucket_override === "big-five-lower-tier") {
      return "Europe big five lower-tier";
    }

    return "Europe big five";
  }

  if (/Youth/i.test(clubName) || /\bU(?:17|18|19)\b/.test(clubName) || /SC U-18/i.test(clubName)) {
    return `${clubCountry || "Youth"} academy`;
  }

  if (clubCountry === "Japan") {
    return "Japan pro system";
  }

  if (clubCountry === "Korea Republic") {
    return "Korea pro system";
  }

  if (clubCountry === "China") {
    return "China domestic system";
  }

  if (europeCountries.has(clubCountry)) {
    return "Europe other";
  }

  if (asiaCountries.has(clubCountry)) {
    return "Asia other";
  }

  if (clubCountry) {
    return `${clubCountry} pro system`;
  }

  return "待补";
}

function inferOverseasBucket(player) {
  if (!isForeignRegistration(player)) {
    return "domestic";
  }

  if (player.overseas_bucket_override) {
    return player.overseas_bucket_override;
  }

  const clubCountry = player.registration_club?.country ?? "";
  if (bigFiveCountries.has(clubCountry)) {
    if (isBigFiveYouthRoute(player)) {
      return "big-five-youth";
    }

    return "big-five";
  }
  if (europeCountries.has(clubCountry)) {
    return "europe-other";
  }
  if (asiaCountries.has(clubCountry)) {
    return "asia-other";
  }

  return "americas-other";
}

function inferOverseasTeamLevelFromEvidence(clubName, affiliationText, evidenceText) {
  const club = String(clubName ?? "");
  const affiliation = [club, affiliationText].filter(Boolean).join(" ");
  const evidence = [affiliation, evidenceText].filter(Boolean).join(" ");

  if (/\bU[- ]?(?:15|16|17|18|19)(?:[AB])?\b|Youth|Academy|Juvenil|Cadet|青年队|青训/i.test(affiliation)) {
    return "u19-youth";
  }

  if (
    /\bU[- ]?(?:21|23)(?:[AB])?\b|\bReserve(?:s)?\b|\bII\b|二队|预备队|B队/i.test(affiliation) ||
    /\b[A-Z]{2,}FC2\b/.test(club)
  ) {
    return "u21-u23";
  }

  const isAmbiguous =
    /仍需|待(?:确认|核实|跟进)|未(?:确认|核实)|需要.{0,12}(?:确认|核实|跟进)|needs?.{0,20}(?:verification|confirmation|follow-up)|not (?:yet )?(?:confirmed|verified)/i.test(
      evidence
    );
  if (isAmbiguous) {
    return "unknown";
  }

  if (
    /一线队|职业一线|\bfirst[- ]team\b|\bsenior (?:team|squad)\b|official squad profile|顶级联赛|top[- ]flight|Premier League|LaLiga|Bundesliga|Serie A|Ligue 1|Eredivisie|Primeira Liga|Liga Portugal|Austrian Bundesliga|Belgian Pro League|Scottish Premiership|EFL Championship|J[123] League|K League|葡超|荷甲|奥超|德乙|职业联赛实际比赛/i.test(
      evidence
    )
  ) {
    return "first-team";
  }

  return "unknown";
}

function inferOverseasTeamLevel(player) {
  if (!isForeignRegistration(player)) {
    return "unknown";
  }

  const clubName = player.registration_club?.name ?? "";
  const currentForeignStep = getLatestForeignPathwayStep(player.training_pathway, player.country);
  const affiliationText = [
    currentForeignStep?.organization,
    JSON.stringify(currentForeignStep?.stage_label ?? "")
  ]
    .filter(Boolean)
    .join(" ");
  const evidenceText = [currentForeignStep?.note, player.verification?.notes]
    .map((value) => JSON.stringify(value ?? ""))
    .join(" ");

  return inferOverseasTeamLevelFromEvidence(clubName, affiliationText, evidenceText);
}

function inferHistoricalOverseasTeamLevel(record) {
  const evidenceText = [record.league, record.appearance_label, record.summary, ...(record.notes ?? [])]
    .map((value) => JSON.stringify(value ?? ""))
    .join(" ");
  const inferredLevel = inferOverseasTeamLevelFromEvidence(record.club, record.club, evidenceText);
  return inferredLevel === "unknown" && record.bucket === "big-five"
    ? "first-team"
    : inferredLevel;
}

function isYouthClubName(clubName) {
  return (
    /Youth/i.test(clubName) ||
    /Academy/i.test(clubName) ||
    /\bU[- ]?(17|18|19|20|21|23)\b/i.test(clubName) ||
    /SC U-18/i.test(clubName)
  );
}

function isBigFiveYouthRoute(player) {
  const clubName = player.registration_club?.name ?? "";
  return isYouthClubName(clubName) || youthAgeBands.has(player.age_band);
}

function collectPlayerContributions(player, overview) {
  const nameSet = new Set(getPlayerNameVariants(player).map((entry) => normalize(entry)));
  const items = [];

  for (const tournament of overview.tournament_archive) {
    for (const match of tournament.china_matches ?? []) {
      for (const contribution of match.china_contributions ?? []) {
        const matchedById = contribution.player_id && contribution.player_id === player.id;
        const matchedByName = nameSet.has(normalize(contribution.player));

        if (!matchedById && !matchedByName) {
          continue;
        }

        items.push({
          tournamentId: tournament.id,
          tournament: tournament.competition_name,
          date: match.date,
          stage: match.stage,
          opponent: match.opponent,
          score: buildScore(match),
          type: contribution.type,
          player_id: contribution.player_id,
          player: contribution.player,
          minute: contribution.minute,
          role: contribution.role
        });
      }
    }
  }

  return items.sort((left, right) => right.date.localeCompare(left.date));
}

function buildScore(match) {
  if (match.score_for === null || match.score_against === null) {
    return state.language === "en" ? "TBD" : "待定";
  }
  return `${match.score_for}-${match.score_against}`;
}

function buildPlayerSearchBlob(player) {
  return [
    ...getPlayerNameVariants(player),
    player.country,
    formatCountryName(player.country),
    player.registration_club?.name,
    localizeClubName(player.registration_club?.name, "zh", state.overview?.club_name_overrides ?? {}),
    player.registration_club?.country,
    formatCountryName(player.registration_club?.country),
    formatPosition(player.primary_position),
    inferLeagueSystem(player),
    ...(player.focus_tags ?? []),
    ...(player.training_pathway ?? []).flatMap((item) => [
      item.organization,
      localizeClubName(item.organization, "zh", state.overview?.club_name_overrides ?? {})
    ])
  ]
    .filter(Boolean)
    .join(" ");
}

function buildPlayerDetailUrl(id) {
  return `./player.html?id=${encodeURIComponent(id)}`;
}

function buildTournamentDetailUrl(id) {
  return `./tournament.html?id=${encodeURIComponent(id)}`;
}

function buildPlayerTagUrl(tag) {
  return `./players.html?tag=${encodeURIComponent(tag)}`;
}

function getArchiveTournamentById(id) {
  return state.overview?.tournament_archive.find((tournament) => tournament.id === id) ?? null;
}

function hasArchiveTournament(id) {
  return Boolean(getArchiveTournamentById(id));
}

function getFocusTournamentById(id) {
  return state.overview?.tournaments.find((tournament) => tournament.id === id) ?? null;
}

function hasTournamentDetail(id) {
  return Boolean(getArchiveTournamentById(id) || getFocusTournamentById(id));
}

function getProjectById(id) {
  return state.overview?.projects?.find((project) => project.id === id) ?? null;
}

function getDossierById(id) {
  return state.overview?.dossiers?.find((dossier) => dossier.id === id) ?? null;
}

function renderDossierPlayer(player) {
  const status = player.current_status;
  const nameMarkup = player.player_id
    ? `<a class="inline-link" href="${buildPlayerDetailUrl(player.player_id)}">${escapeHtml(player.local_name)}</a>`
    : escapeHtml(player.local_name);
  return `
    <article class="academy-player-card">
      <div class="academy-player-heading">
        <div>
          <h4>${nameMarkup}</h4>
          <p class="small-note">${escapeHtml(player.name)} · ${escapeHtml(localizeText(player.role))}</p>
        </div>
        <span class="chip academy-status-${escapeHtml(status.category)}">${escapeHtml(getLabel(ACADEMY_CURRENT_STATUS_LABELS, status.category, status.category))}</span>
      </div>
      <p><strong>${escapeHtml(formatClubName(status.organization))}</strong></p>
      <p>${escapeHtml(localizeText(player.note))}</p>
      <div class="academy-player-footer">
        <span class="small-note">${escapeHtml(t("dossier.player.asOf", { date: formatDate(status.as_of) }))} · ${escapeHtml(getLabel(SOURCE_LAYER_CONFIDENCE_LABELS, status.confidence, status.confidence))}</span>
        <a class="inline-link" href="${escapeHtml(status.source_url)}" target="_blank" rel="noreferrer">${escapeHtml(t("dossier.player.source"))}</a>
        ${player.player_id ? `<a class="inline-link" href="${buildPlayerDetailUrl(player.player_id)}">${escapeHtml(t("dossier.player.profile"))}</a>` : ""}
      </div>
    </article>
  `;
}

function renderDossierGeneration(view) {
  const players = view.players ?? [];
  const programme = view.program_status;
  return `
    <article class="academy-generation-card">
      <div class="section-head compact-head">
        <div>
          <div class="chip-row">
            <span class="chip">${escapeHtml(view.confidence ?? "-")}</span>
            <span class="chip">${escapeHtml(t("dossier.generations.players", { count: players.length }))}</span>
          </div>
          <h3>${escapeHtml(localizeText(view.name))}</h3>
        </div>
      </div>
      <p>${escapeHtml(localizeText(view.description))}</p>
      ${
        programme
          ? `<div class="academy-program-card">
              <span class="chip">${escapeHtml(getLabel(ACADEMY_CURRENT_STATUS_LABELS, programme.category, programme.category))}</span>
              <h4>${escapeHtml(formatClubName(programme.organization))}</h4>
              <p>${escapeHtml(t("dossier.program.coach", { value: programme.head_coach }))}</p>
              <p>${escapeHtml(t("dossier.program.ageGroups", { value: programme.age_groups.join(" / ") }))}</p>
              <a class="inline-link" href="${escapeHtml(programme.source_url)}" target="_blank" rel="noreferrer">${escapeHtml(programme.source_label)}</a>
            </div>`
          : ""
      }
      ${players.length > 0 ? `<div class="academy-player-grid">${players.map(renderDossierPlayer).join("")}</div>` : `<div class="empty-inline">${escapeHtml(t("dossier.generations.empty"))}</div>`}
    </article>
  `;
}

function renderDossierDetailPage() {
  const params = new URLSearchParams(window.location.search);
  const dossier = getDossierById(params.get("id"));
  const hero = document.querySelector("#dossierHero");
  const body = document.querySelector("#dossierBody");
  if (!dossier || !hero || !body) {
    if (hero) {
      hero.innerHTML = `<div class="hero-copy"><p class="eyebrow">${escapeHtml(t("dossier.hero.eyebrow"))}</p><h1>${escapeHtml(t("dossier.notFound.title"))}</h1><p class="hero-text">${escapeHtml(t("dossier.notFound.text"))}</p></div>`;
    }
    return;
  }

  const stats = dossier.headline_stats ?? {};
  document.title = `${dossier.name} | ${t("dossier.breadcrumb.detail")}`;
  hero.innerHTML = `
    <div class="hero-copy">
      <p class="eyebrow">${escapeHtml(t("dossier.hero.eyebrow"))}</p>
      <h1>${escapeHtml(dossier.name)}</h1>
      <p class="hero-text">${escapeHtml(localizeText(dossier.summary))}</p>
      <div class="chip-row">
        <span class="chip">${escapeHtml(formatStatus(dossier.status))}</span>
        <span class="chip">${escapeHtml(t("dossier.hero.lastReviewed", { date: formatDate(dossier.last_reviewed) }))}</span>
      </div>
    </div>
    <aside class="hero-spotlight">
      <p class="eyebrow">${escapeHtml(t("dossier.stats.players"))}</p>
      <h2>${escapeHtml(String(stats.tracked_players ?? 0))}</h2>
      <p>${escapeHtml(localizeText(stats.official_output_claim))}</p>
    </aside>
  `;

  document.querySelector("#dossierStats").innerHTML = [
    [t("dossier.stats.founded"), stats.founded ?? "-"],
    [t("dossier.stats.generations"), String(stats.tracked_generations ?? 0)],
    [t("dossier.stats.players"), String(stats.tracked_players ?? 0)],
    [t("dossier.stats.currentFocus"), localizeText(stats.current_training_focus)]
  ].map(([label, value]) => `<article class="stat-card"><p class="stat-label">${escapeHtml(label)}</p><p class="stat-value stat-value-small">${escapeHtml(value)}</p></article>`).join("");

  document.querySelector("#dossierModel").innerHTML = [
    `<article class="story-card"><h3>${escapeHtml(t("dossier.model.title"))}</h3>${(dossier.role_model ?? []).map((line) => `<p>${escapeHtml(localizeText(line))}</p>`).join("")}</article>`,
    `<article class="story-card"><h3>${escapeHtml(t("dossier.boundaries.title"))}</h3><p>${escapeHtml(localizeText(dossier.scope_note))}</p></article>`
  ].join("");
  document.querySelector("#dossierTimeline").innerHTML = (dossier.timeline ?? []).map((item) => `<article class="timeline-item"><p class="timeline-label">${escapeHtml(item.date)}</p><h3>${escapeHtml(localizeText(item.label))}</h3><p>${escapeHtml(localizeText(item.detail))}</p></article>`).join("");
  document.querySelector("#dossierGenerations").innerHTML = (dossier.roster_views ?? []).map(renderDossierGeneration).join("");
  document.querySelector("#dossierBoundaries").innerHTML = `<ul class="mini-bullet-list">${(dossier.controversies ?? []).map((item) => `<li>${escapeHtml(localizeText(item))}</li>`).join("")}</ul>`;
  document.querySelector("#dossierQuestions").innerHTML = `<ul class="mini-bullet-list">${(dossier.open_questions ?? []).map((item) => `<li>${escapeHtml(localizeText(item))}</li>`).join("")}</ul>`;

  const sources = [
    { ...dossier.source_document, kind: t("dossier.sources.primary") },
    ...(dossier.supporting_documents ?? []).map((source) => ({ ...source, kind: t("dossier.sources.supporting") }))
  ];
  document.querySelector("#dossierSources").innerHTML = sources.map((source) => `<article class="stack-card"><div class="chip-row"><span class="chip">${escapeHtml(source.kind)}</span></div><h3>${escapeHtml(source.title)}</h3>${source.summary ? `<p>${escapeHtml(localizeText(source.summary))}</p>` : ""}<a class="inline-link" href="${escapeHtml(source.path)}" target="_blank" rel="noreferrer">${escapeHtml(source.path)}</a></article>`).join("");
  body.hidden = false;
}

function getPlayersByTag(tag) {
  return state.enrichedPlayers.filter((player) => (player.focus_tags ?? []).includes(tag));
}

function getTournamentDisplayName(id) {
  const archive = getArchiveTournamentById(id);
  if (archive) {
    return archive.competition_name;
  }

  return getFocusTournamentById(id)?.name ?? id;
}

function getTournamentResultSummary(tournament) {
  if (tournament.status === "completed") {
    return t("tournaments.archive.completedResult", {
      champion: tournament.champion || "-",
      runnerUp: tournament.runner_up || "-"
    });
  }
  if (tournament.status === "cancelled") {
    return t("tournaments.archive.cancelledResult");
  }
  return tournament.status === "ongoing"
    ? t("tournaments.archive.ongoingResult")
    : t("tournaments.archive.upcomingResult");
}

function mergeTournamentLinks(archiveTournament, focusTournament) {
  const merged = [...(archiveTournament?.source_links ?? []), ...(focusTournament?.sources ?? [])];
  const seen = new Set();

  return merged.filter((link) => {
    const url = String(link?.url ?? "").trim();
    if (!url || seen.has(url)) {
      return false;
    }

    seen.add(url);
    return true;
  });
}

function getPlayerById(id) {
  if (!id) {
    return null;
  }

  return state.enrichedPlayers.find((player) => player.id === id) ?? state.players.find((player) => player.id === id) ?? null;
}

function findPlayerByName(name) {
  const normalizedName = normalize(name);
  if (!normalizedName) {
    return null;
  }

  return (
    state.enrichedPlayers.find((player) =>
      getPlayerNameVariants(player).some((variant) => normalize(variant) === normalizedName)
    ) ?? null
  );
}

function resolvePlayerReference(reference) {
  if (!reference) {
    return null;
  }

  if (typeof reference === "string") {
    return findPlayerByName(reference);
  }

  return getPlayerById(reference.player_id ?? reference.id) ?? findPlayerByName(reference.player ?? reference.name);
}

function getPlayerReferenceLabel(reference) {
  const player = resolvePlayerReference(reference);
  if (player) {
    return getPlayerPrimaryName(player);
  }

  if (typeof reference === "string") {
    return localizeText(reference, t("common.pending"));
  }

  return localizeText(reference.player ?? reference.name, t("common.pending"));
}

function renderPlayerReference(reference, className = "inline-link") {
  const player = resolvePlayerReference(reference);
  const label = getPlayerReferenceLabel(reference);

  if (!player) {
    return escapeHtml(label);
  }

  return `<a class="${className}" href="${buildPlayerDetailUrl(player.id)}">${escapeHtml(label)}</a>`;
}

function renderPlayerLink(player, className = "inline-link") {
  if (!player?.id) {
    return escapeHtml(localizeText(player?.name ?? player?.local_name, t("common.pending")));
  }

  return `<a class="${className}" href="${buildPlayerDetailUrl(player.id)}">${escapeHtml(getPlayerPrimaryName(player))}</a>`;
}

function renderContributionItem(entry) {
  return `<li>${formatContributionType(entry.type)}: ${renderPlayerReference(entry)}${entry.minute ? ` ${escapeHtml(entry.minute)}'` : ""}${entry.role ? ` · ${formatContributionRole(entry.role)}` : ""}</li>`;
}

function formatLineupSubstituteNote(item) {
  const replacement = item.replaced_player
    ? state.language === "en"
      ? `, replaced ${getPlayerReferenceLabel({ player_id: item.replaced_player_id, player: item.replaced_player })}`
      : `，换下 ${getPlayerReferenceLabel({ player_id: item.replaced_player_id, player: item.replaced_player })}`
    : "";
  if (item.minute) {
    return `${t("tournaments.archive.substituteMinute", { minute: item.display_minute ?? item.minute })}${replacement}`;
  }
  if (item.status === "unused") {
    return t("tournaments.archive.substituteUnused");
  }
  return "";
}

function renderLineupItem(item, options = {}) {
  const note = options.showSubstituteNote ? formatLineupSubstituteNote(item) : "";
  return `<li>${renderPlayerReference(item)}${note ? ` <span class="lineup-entry-meta">· ${escapeHtml(note)}</span>` : ""}</li>`;
}

function renderStartingLineup(match, options = {}) {
  const starters = match.china_lineup?.starters ?? [];
  const substitutes = options.includeSubstitutes ? match.china_lineup?.substitutes ?? [] : [];
  if (starters.length === 0) {
    return "";
  }

  const formationSuffix = match.china_lineup?.formation ? `（${escapeHtml(match.china_lineup.formation)}）` : "";
  const formationLabel =
    match.china_lineup?.formation && state.language === "en"
      ? ` (${escapeHtml(match.china_lineup.formation)})`
      : formationSuffix;

  return `
    <details class="archive-lineup-toggle">
      <summary>${escapeHtml(t("tournaments.archive.lineupToggle", { formation: formationLabel }))}</summary>
      <div class="archive-lineup">
        <p class="small-note">${escapeHtml(t("tournaments.archive.lineupTitle", { formation: formationLabel }))}</p>
        <ul class="mini-bullet-list">
          ${starters.map((item) => renderLineupItem(item)).join("")}
        </ul>
        ${
          substitutes.length > 0
            ? `
              <p class="small-note">${escapeHtml(t("tournaments.archive.benchTitle"))}</p>
              <ul class="mini-bullet-list">
                ${substitutes.map((item) => renderLineupItem(item, { showSubstituteNote: true })).join("")}
              </ul>
            `
            : ""
        }
      </div>
    </details>
  `;
}

function renderChinaCards(match) {
  const cards = match.china_cards ?? [];
  if (cards.length === 0) {
    return "";
  }

  const labels = {
    yellow: { zh: "黄牌", en: "Yellow card" },
    "second-yellow-red": { zh: "两黄变红", en: "Second-yellow red" },
    "straight-red": { zh: "直接红牌", en: "Straight red" }
  };

  return `
    <p class="small-note">${escapeHtml(state.language === "en" ? "China cards" : "中国队牌事件")}</p>
    <ul class="mini-bullet-list">
      ${cards
        .map((card) => `<li>${escapeHtml(localizeText(labels[card.type], card.type))}: ${renderPlayerReference(card)}${card.minute ? ` ${escapeHtml(card.minute)}'` : ""}</li>`)
        .join("")}
    </ul>
  `;
}

function formatTournamentMatchStatLabel(key) {
  return getLabel(MATCH_STAT_LABELS, key, key);
}

function renderTournamentMatchStats(match) {
  const rows = match.match_stats ?? [];
  if (rows.length === 0) {
    return "";
  }

  return `
    <div class="archive-match-stats">
      <p class="small-note">${escapeHtml(t("tournaments.archive.matchStatsTitle"))}</p>
      <div class="archive-match-stats-grid">
        ${rows
          .map(
            (row) => `
              <div class="archive-match-stat-row">
                <span class="archive-match-stat-value">${escapeHtml(String(row.china ?? "—"))}</span>
                <span class="archive-match-stat-label">${escapeHtml(formatTournamentMatchStatLabel(row.key))}</span>
                <span class="archive-match-stat-value archive-match-stat-value-opponent">${escapeHtml(String(row.opponent ?? "—"))}</span>
              </div>
            `
          )
          .join("")}
      </div>
    </div>
  `;
}

function renderTournamentMatchContent(match, options = {}) {
  const contributions =
    (match.china_contributions ?? []).length > 0
      ? `
        <ul class="mini-bullet-list">
          ${match.china_contributions.map((entry) => renderContributionItem(entry)).join("")}
        </ul>
      `
      : `<p class="small-note">${escapeHtml(t("tournaments.archive.noContrib"))}</p>`;

  return `
    <p>${escapeHtml(t("tournaments.archive.matchLabel", { opponent: formatCountryName(match.opponent), score: buildScore(match), result: getLabel(MATCH_RESULT_LABELS, match.result, match.result) }))}</p>
    ${match.note ? `<p class="small-note">${escapeHtml(localizeText(match.note))}</p>` : ""}
    ${contributions}
    ${renderChinaCards(match)}
    ${renderTournamentMatchStats(match)}
    ${renderStartingLineup(match, options)}
  `;
}

function renderTournamentDetailMatchCard(match) {
  return `
    <article class="stack-card">
      <div class="chip-row">
        <span class="chip">${escapeHtml(getLabel(MATCH_RESULT_LABELS, match.result, match.result))}</span>
      </div>
      <h3>${escapeHtml(localizeText(match.stage))} · ${formatDate(match.date)}</h3>
      ${renderTournamentMatchContent(match, { includeSubstitutes: true })}
    </article>
  `;
}

function getDisplayChinaMatches(matches) {
  return [...(matches ?? [])]
    .map((match, index) => ({ match, index }))
    .sort((left, right) => {
      const dateCompare = String(right.match.date ?? "").localeCompare(String(left.match.date ?? ""));
      if (dateCompare !== 0) {
        return dateCompare;
      }
      return right.index - left.index;
    })
    .map((entry) => entry.match);
}

function renderTournamentKeyPlayerCard(entry) {
  return `
    <article class="stack-card">
      <h3>${renderPlayerReference(entry)}</h3>
      <p>${escapeHtml(t("tournamentDetail.keyPlayers.statLine", { goals: entry.goals ?? 0, assists: entry.assists ?? 0 }))}</p>
      ${entry.role_note ? `<p class="small-note">${escapeHtml(localizeText(entry.role_note))}</p>` : ""}
    </article>
  `;
}

function getTournamentSquadEntries(tournament) {
  const explicitSquad = tournament?.china_squad ?? [];
  const statisticsByPlayer = new Map(
    (tournament?.china_player_statistics?.players ?? []).map((row) => [row.player_id, row])
  );
  if (explicitSquad.length > 0) {
    return explicitSquad
      .map((entry) => ({ ...entry, tournament_statistics: statisticsByPlayer.get(entry.player_id) }))
      .sort((left, right) => (left.squad_number ?? 999) - (right.squad_number ?? 999));
  }

  return state.enrichedPlayers
    .filter(
      (player) =>
        player.country === "China PR" &&
        (player.tournament_participation ?? []).some((entry) => entry.competition_id === tournament?.id)
    )
    .map((player) => ({
      player_id: player.id,
      player: player.name,
      tournament_statistics: statisticsByPlayer.get(player.id)
    }))
    .sort((left, right) => getPlayerReferenceLabel(left).localeCompare(getPlayerReferenceLabel(right), getSortLocale()));
}

function renderTournamentSquadCard(entry) {
  const player = resolvePlayerReference(entry);
  const label = getPlayerReferenceLabel(entry);
  const club = player?.registration_club?.name ?? localizeText(entry.club, t("common.pending"));
  const position = player
    ? formatPosition(player.primary_position)
    : formatPosition(localizeText(entry.position, t("players.card.positionPending")));
  const note = entry.note ? localizeText(entry.note) : "";

  return `
    <article class="player-card player-card-compact">
      <div class="chip-row">
        ${entry.squad_number ? `<span class="chip">#${escapeHtml(entry.squad_number)}</span>` : ""}
        ${player?.age_band ? `<span class="chip">${formatAgeBand(player.age_band)}</span>` : ""}
      </div>
      <h3>${renderPlayerReference(entry)}</h3>
      <p>${escapeHtml(position)}</p>
      <p class="small-note">${escapeHtml(formatClubName(club))}</p>
      ${entry.tournament_statistics ? `<p class="small-note">${escapeHtml(formatParticipationStatLine(entry.tournament_statistics))}</p>` : ""}
      ${note ? `<p class="small-note">${escapeHtml(note)}</p>` : ""}
    </article>
  `;
}

function renderTournamentRosterViewEntry(entry) {
  const affiliation = localizeText(entry.affiliation ?? entry.club, "");
  const note = localizeText(entry.note, "");

  return `
    <li class="roster-group-item">
      <div class="roster-group-player">${renderPlayerReference(entry)}</div>
      ${affiliation ? `<p class="small-note">${escapeHtml(affiliation)}</p>` : ""}
      ${note ? `<p class="small-note">${escapeHtml(note)}</p>` : ""}
    </li>
  `;
}

function renderTournamentRosterViewGroup(group) {
  const label = localizeText(group.label, "");
  const entries = group.entries ?? [];

  return `
    <article class="stack-card roster-group-card">
      <p class="eyebrow">${escapeHtml(label)}</p>
      <ul class="roster-group-list">
        ${entries.map(renderTournamentRosterViewEntry).join("")}
      </ul>
    </article>
  `;
}

function renderTournamentLatestRosterView(view, squadEntries) {
  const groups = view?.groups ?? [];
  const headCoach =
    localizeText(view?.head_coach?.local_name, "") || localizeText(view?.head_coach?.name, "");
  const note = localizeText(view?.note, t("tournamentDetail.squad.latestNote"));
  const label = localizeText(view?.label, t("tournamentDetail.squad.latestLabel"));

  return `
    <article class="stack-card roster-view-card">
      <div class="chip-row">
        <span class="chip accent-chip">${escapeHtml(label)}</span>
      </div>
      <p class="small-note">${escapeHtml(note)}</p>
      ${headCoach ? `<p class="small-note">${escapeHtml(t("tournamentDetail.squad.headCoach", { name: headCoach }))}</p>` : ""}
      <div class="roster-group-grid">
        ${groups.map(renderTournamentRosterViewGroup).join("")}
      </div>
      ${
        squadEntries.length > 0
          ? `
            <details class="archive-lineup-toggle">
              <summary>${escapeHtml(t("tournamentDetail.squad.finalsToggle"))}</summary>
              <div class="archive-lineup">
                <div class="player-card-grid compact-grid">
                  ${squadEntries.map(renderTournamentSquadCard).join("")}
                </div>
              </div>
            </details>
          `
          : ""
      }
    </article>
  `;
}

function renderRegionalHistorySummaryCard(entry) {
  const bestYears = (entry.best_years ?? []).join(" / ");

  return `
    <article class="stack-card">
      <h3>${escapeHtml(formatCountryName(entry.country))}</h3>
      <p>${escapeHtml(t("tournamentDetail.history.appearances", { count: entry.appearances ?? 0 }))}</p>
      <p>${escapeHtml(t("tournamentDetail.history.bestFinish", { stage: formatTournamentHistoryStage(entry.best_finish) }))}</p>
      ${bestYears ? `<p class="small-note">${escapeHtml(t("tournamentDetail.history.bestYears", { years: bestYears }))}</p>` : ""}
      ${entry.note ? `<p class="small-note">${escapeHtml(localizeText(entry.note))}</p>` : ""}
    </article>
  `;
}

function renderRegionalHistoryTable(history) {
  const rows = history?.editions ?? [];
  if (rows.length === 0) {
    return `<div class="empty-inline">${escapeHtml(t("tournamentDetail.history.empty"))}</div>`;
  }

  return `
    <div class="table-shell">
      <table>
        <thead>
          <tr>
            <th>${escapeHtml(t("tournamentDetail.history.table.edition"))}</th>
            <th>${escapeHtml(t("tournamentDetail.history.table.host"))}</th>
            <th>${escapeHtml(t("tournamentDetail.history.table.china"))}</th>
            <th>${escapeHtml(t("tournamentDetail.history.table.japan"))}</th>
            <th>${escapeHtml(t("tournamentDetail.history.table.korea"))}</th>
          </tr>
        </thead>
        <tbody>
          ${rows
            .map(
              (row) => `
                <tr>
                  <td>${escapeHtml(String(row.edition ?? "-"))}</td>
                  <td>${escapeHtml(formatCountryName(row.host ?? "-"))}</td>
                  <td>${escapeHtml(formatTournamentHistoryStage(row.china_pr))}</td>
                  <td>${escapeHtml(formatTournamentHistoryStage(row.japan))}</td>
                  <td>${escapeHtml(formatTournamentHistoryStage(row.korea_republic))}</td>
                </tr>
              `
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function isPlayerCurrentlyOverseas(player) {
  const homeCountry = normalizeCountry(player?.country);
  const clubCountry = normalizeCountry(player?.registration_club?.country);
  return Boolean(homeCountry && clubCountry && homeCountry !== clubCountry);
}

function getRegionalWatchPoolLabel(regionalWatch) {
  return localizeText(regionalWatch?.player_pool_label, "U23");
}

function getRegionalWatchGroupPlayers(group, regionalWatch) {
  if (Array.isArray(group?.player_ids) && group.player_ids.length > 0) {
    const playerIds = new Set(group.player_ids);
    return state.enrichedPlayers.filter((player) => playerIds.has(player.id));
  }

  const tag = group?.tag ?? regionalWatch?.tag ?? "";
  const birthDateAfter = group?.birth_date_after ?? regionalWatch?.birth_date_after ?? "";
  return state.enrichedPlayers.filter((player) => {
    if (player.country !== group.country) {
      return false;
    }
    if (tag && !(player.focus_tags ?? []).includes(tag)) {
      return false;
    }
    if (birthDateAfter && player.birth_date <= birthDateAfter) {
      return false;
    }
    return true;
  });
}

function renderRegionalWatchGroupCard(group, regionalWatch) {
  const players = getRegionalWatchGroupPlayers(group, regionalWatch);
  const overseasPlayers = players.filter(isPlayerCurrentlyOverseas);
  const playerLine = players.map((player) => renderPlayerLink(player)).join("、");
  const poolLabel = getRegionalWatchPoolLabel(regionalWatch);

  return `
    <article class="stack-card">
      <h3>${escapeHtml(formatCountryName(group.country))}</h3>
      <div class="chip-row">
        <span class="chip">${escapeHtml(t("tournamentDetail.watch.sampleCount", { count: players.length, label: poolLabel }))}</span>
        <span class="chip">${escapeHtml(t("tournamentDetail.watch.overseasCount", { count: overseasPlayers.length }))}</span>
      </div>
      ${group.note ? `<p class="small-note">${escapeHtml(localizeText(group.note))}</p>` : ""}
      <p class="timeline-label">${escapeHtml(t("tournamentDetail.watch.allPlayers"))}</p>
      <p>${playerLine || escapeHtml(t("common.pending"))}</p>
      <p class="timeline-label">${escapeHtml(t("tournamentDetail.watch.overseasPlayers"))}</p>
      ${
        overseasPlayers.length > 0
          ? `
            <ul class="mini-bullet-list">
              ${overseasPlayers
                .map(
                  (player) =>
                    `<li>${renderPlayerLink(player)} · ${escapeHtml(formatClubName(player.registration_club?.name ?? t("common.pending")))} · ${escapeHtml(formatCountryName(player.registration_club?.country ?? t("common.pending")))}</li>`
                )
                .join("")}
            </ul>
          `
          : `<p class="small-note">${escapeHtml(t("tournamentDetail.watch.noOverseas"))}</p>`
      }
    </article>
  `;
}

function enrichPlayer(player, overview) {
  const marketValue = getPlayerMarketValueRecord(player);
  return {
    ...player,
    age: getAge(player.birth_date, overview.generated_at),
    currentLeagueSystem: inferLeagueSystem(player),
    organizationType: player.registration_club?.organization_type ?? "",
    overseasBucket: inferOverseasBucket(player),
    overseasTeamLevel: inferOverseasTeamLevel(player),
    foreignRegistration: isForeignRegistration(player),
    recentContributions: collectPlayerContributions(player, overview),
    searchBlob: buildPlayerSearchBlob(player),
    marketValueStatus: marketValue?.status ?? "",
    marketValueCurrentEur: marketValue?.current?.eur ?? 0,
    marketValuePeakEur: marketValue?.peak?.eur ?? 0
  };
}

function buildOptions(target, options, selectedValue, label) {
  if (!target) {
    return;
  }

  const list = [{ value: "all", label }, ...options];
  target.innerHTML = list
    .map(
      (option) =>
        `<option value="${escapeHtml(option.value)}" ${option.value === selectedValue ? "selected" : ""}>${escapeHtml(option.label)}</option>`
    )
    .join("");
}

function normalizeFilterValue(value, options) {
  if (value === "all") {
    return "all";
  }

  return options.some((option) => option.value === value) ? value : "all";
}

function setControlValue(selector, value) {
  const node = document.querySelector(selector);
  if (node && node.value !== value) {
    node.value = value;
  }
}

function replaceQueryParams(nextState) {
  const url = new URL(window.location.href);

  for (const [key, value] of Object.entries(nextState)) {
    if (value === undefined || value === null || value === "" || value === "all" || value === "cards") {
      url.searchParams.delete(key);
      continue;
    }
    url.searchParams.set(key, value);
  }

  const nextUrl = `${url.pathname}${url.search}${url.hash}`;
  window.history.replaceState({}, "", nextUrl);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function humanizeTag(value) {
  return String(value ?? "")
    .split("-")
    .filter(Boolean)
    .map((part) => {
      if (/^[a-z]{2,4}\d{2,4}$/i.test(part)) {
        return part.toUpperCase();
      }
      if (/^\d{4}$/.test(part)) {
        return part;
      }
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(" ");
}

function formatTag(value) {
  if (!value) {
    return t("common.pending");
  }

  const preset = TAG_LABELS[value];
  if (preset) {
    return preset[state.language] ?? preset.zh ?? value;
  }

  return state.language === "zh" ? humanizeTag(value) : humanizeTag(value);
}

function renderTagChips(tags) {
  if (!tags || tags.length === 0) {
    return `<span class="chip muted-chip">${escapeHtml(t("common.noTags"))}</span>`;
  }

  return tags.map((tag) => `<span class="chip">${escapeHtml(formatTag(tag))}</span>`).join("");
}

function renderLinkPills(links) {
  if (!links || links.length === 0) {
    return `<span class="small-note">${escapeHtml(t("common.noLinks"))}</span>`;
  }

  return links
    .map(
      (link) =>
        `<a class="pill-link" href="${link.url}" target="_blank" rel="noreferrer">${escapeHtml(localizeText(link.label))}</a>`
    )
    .join("");
}

function sortPlayers(left, right) {
  if (left.country !== right.country) {
    return left.country.localeCompare(right.country, getSortLocale());
  }
  if (left.age !== right.age) {
    return left.age - right.age;
  }
  return getPlayerPrimaryName(left).localeCompare(getPlayerPrimaryName(right), getSortLocale());
}

function getHomeFocusTournament() {
  const today = state.overview.generated_at;
  const items = [...state.overview.tournament_archive];

  const getPhaseRank = (tournament) => {
    const isCurrent =
      tournament.status === "ongoing" ||
      tournament.status === "in-progress" ||
      (tournament.date_range.start <= today && tournament.date_range.end >= today);
    if (isCurrent) {
      return 0;
    }
    if (tournament.date_range.start > today) {
      return 1;
    }
    return 2;
  };

  const getFocusRank = (tournament) => {
    const focusLevel = getFocusTournamentById(tournament.id)?.focus_level;
    if (focusLevel === "primary") {
      return 0;
    }
    if (focusLevel === "reference") {
      return 1;
    }
    return 2;
  };

  return items.sort((left, right) => {
    const phaseRank = getPhaseRank(left) - getPhaseRank(right);
    if (phaseRank !== 0) {
      return phaseRank;
    }

    const focusRank = getFocusRank(left) - getFocusRank(right);
    if (focusRank !== 0) {
      return focusRank;
    }

    const leftPhase = getPhaseRank(left);
    if (leftPhase === 0) {
      return left.date_range.end.localeCompare(right.date_range.end);
    }
    if (leftPhase === 1) {
      return left.date_range.start.localeCompare(right.date_range.start);
    }
    return right.date_range.end.localeCompare(left.date_range.end);
  })[0] ?? null;
}

function getRecentChinaMatches(limit = 6) {
  const items = [];
  for (const tournament of state.overview.tournament_archive) {
    for (const match of tournament.china_matches ?? []) {
      if (match.date > state.overview.generated_at) {
        continue;
      }
      if (!["W", "D", "L"].includes(match.result)) {
        continue;
      }

      items.push({
        tournamentId: tournament.id,
        tournament: tournament.competition_name,
        level: tournament.level,
        date: match.date,
        stage: match.stage,
        opponent: match.opponent,
        result: match.result,
        score: buildScore(match),
        contributions: match.china_contributions ?? [],
        note: match.note ?? ""
      });
    }
  }

  return items
    .sort((left, right) => right.date.localeCompare(left.date))
    .slice(0, limit);
}

function getCurrentOverseasPlayers() {
  return state.enrichedPlayers
    .filter((player) =>
      player.country === "China PR"
        ? player.overseas_status === "active-registered"
        : player.foreignRegistration
    )
    .sort(sortPlayers);
}

function parseSeasonRange(season) {
  const text = String(season ?? "").trim();
  const slashMatch = text.match(/^(\d{4})\s*\/\s*(\d{2,4})$/);
  if (slashMatch) {
    const startYear = Number(slashMatch[1]);
    const rawEndYear = Number(slashMatch[2]);
    const normalizedEndYear =
      slashMatch[2].length === 2 ? Math.floor(startYear / 100) * 100 + rawEndYear : rawEndYear;
    return {
      startYear,
      endYear: normalizedEndYear < startYear ? normalizedEndYear + 100 : normalizedEndYear
    };
  }

  const matchedYears = [...text.matchAll(/\d{4}/g)].map((entry) => Number(entry[0]));
  if (matchedYears.length === 0) {
    return { startYear: null, endYear: null };
  }
  if (matchedYears.length === 1) {
    return { startYear: matchedYears[0], endYear: matchedYears[0] };
  }

  return {
    startYear: matchedYears[0],
    endYear: matchedYears[matchedYears.length - 1]
  };
}

function getHistoricalRecordRangeKey(record) {
  return record.history_year_range ?? record.season;
}

function getHistoricalRecordYears(record) {
  const { startYear, endYear } = parseSeasonRange(getHistoricalRecordRangeKey(record));
  if (!Number.isInteger(startYear) || !Number.isInteger(endYear) || endYear < startYear) {
    return [];
  }

  const years = [];
  for (let year = startYear; year <= endYear; year += 1) {
    years.push(String(year));
  }
  return years;
}

function isHistoricalRecordActive(record) {
  if (record.active_abroad === true) {
    return true;
  }

  const { startYear, endYear } = parseSeasonRange(getHistoricalRecordRangeKey(record));
  const currentYear = Number(String(state.overview?.generated_at ?? pageDate).slice(0, 4));
  return (
    Number.isInteger(startYear) &&
    Number.isInteger(endYear) &&
    startYear <= currentYear &&
    endYear >= currentYear
  );
}

function seasonIncludesYear(record, year) {
  const { startYear, endYear } = parseSeasonRange(getHistoricalRecordRangeKey(record));
  return Number.isInteger(startYear) && Number.isInteger(endYear) && startYear <= year && endYear >= year;
}

function sortHistoricalRecords(left, right) {
  if (left.endYear !== right.endYear) {
    return Number(right.endYear ?? 0) - Number(left.endYear ?? 0);
  }
  if (left.startYear !== right.startYear) {
    return Number(right.startYear ?? 0) - Number(left.startYear ?? 0);
  }
  if (left.country !== right.country) {
    return left.country.localeCompare(right.country, getSortLocale());
  }

  return String(left.local_name ?? left.name).localeCompare(
    String(right.local_name ?? right.name),
    getSortLocale()
  );
}

function getOverseasCountryMap() {
  const map = new Map();
  const historyCountries = state.overview.overseas_history.countries;

  for (const entry of historyCountries) {
    map.set(entry.country, {
      country: entry.country,
      currentCount: 0,
      bigFiveFirstTeamCount: 0,
      overseasStatusCounts:
        entry.country === "China PR"
          ? state.overview.stats?.china_overseas_status_counts ?? null
          : null,
      teamLevelCounts: Object.fromEntries(OVERSEAS_TEAM_LEVEL_ORDER.map((level) => [level, 0])),
      verifiedRecords: entry.verified_records,
      notes: entry.notes,
      bucketFocus: entry.bucket_focus,
      specialLists: entry.special_lists ?? []
    });
  }

  for (const item of getCurrentOverseasItems()) {
    if (!map.has(item.country)) {
      map.set(item.country, {
        country: item.country,
        currentCount: 0,
        bigFiveFirstTeamCount: 0,
        overseasStatusCounts: null,
        teamLevelCounts: Object.fromEntries(OVERSEAS_TEAM_LEVEL_ORDER.map((level) => [level, 0])),
        verifiedRecords: 0,
        notes: "",
        bucketFocus: [],
        specialLists: []
      });
    }
    map.get(item.country).currentCount += 1;
    map.get(item.country).teamLevelCounts[item.overseasTeamLevel] += 1;
    if (item.overseasBucket === "big-five" && item.overseasTeamLevel === "first-team") {
      map.get(item.country).bigFiveFirstTeamCount += 1;
    }
  }

  return [...map.values()].sort((left, right) =>
    left.country.localeCompare(right.country, getSortLocale())
  );
}

function flattenHistoricalOverseasRecords() {
  const records = [];
  for (const countryEntry of state.overview.overseas_history.countries) {
    for (const record of countryEntry.featured_records ?? []) {
      const { startYear, endYear } = parseSeasonRange(getHistoricalRecordRangeKey(record));
      records.push({
        ...record,
        country: countryEntry.country,
        startYear,
        endYear,
        yearKeys: getHistoricalRecordYears(record),
        isActiveAbroad: isHistoricalRecordActive(record)
      });
    }
  }

  return records.sort(sortHistoricalRecords);
}

function extractStartYear(season) {
  const { startYear } = parseSeasonRange(season);
  return Number.isInteger(startYear) ? String(startYear) : t("common.unknown");
}

function getActiveHistoricalOverseasRecords() {
  return flattenHistoricalOverseasRecords().filter((record) => record.isActiveAbroad);
}

function toCurrentHistoricalOverseasItem(record) {
  return {
    ...record,
    sourceType: "history",
    foreignRegistration: true,
    overseasBucket: record.bucket,
    overseasTeamLevel: inferHistoricalOverseasTeamLevel(record)
  };
}

function getCurrentOverseasItemPrimaryName(item) {
  return item.sourceType === "history" ? item.local_name || item.name : getPlayerPrimaryName(item);
}

function getCurrentOverseasIdentity(item) {
  return `${normalize(item.country)}|${normalize(getCurrentOverseasItemPrimaryName(item))}`;
}

function getHistoricalRecordIdentity(record) {
  return `${normalize(record.country)}|${normalize(record.local_name || record.name)}`;
}

function compareCurrentOverseasItems(left, right) {
  if (left.country !== right.country) {
    return left.country.localeCompare(right.country, getSortLocale());
  }
  return getCurrentOverseasItemPrimaryName(left).localeCompare(
    getCurrentOverseasItemPrimaryName(right),
    getSortLocale()
  );
}

function getCurrentOverseasItems() {
  const items = [
    ...getCurrentOverseasPlayers().map((player) => ({
      ...player,
      sourceType: "player"
    })),
    ...getActiveHistoricalOverseasRecords()
      .filter((record) => record.country !== "China PR")
      .map(toCurrentHistoricalOverseasItem)
  ];
  const seen = new Set();

  return items
    .filter((item) => {
      const clubName =
        item.sourceType === "history" ? item.club : item.registration_club?.name ?? "";
      const dedupeKey = [
        normalize(item.country),
        normalize(getCurrentOverseasItemPrimaryName(item)),
        normalize(clubName),
        normalize(item.overseasBucket)
      ].join("|");
      if (seen.has(dedupeKey)) {
        return false;
      }
      seen.add(dedupeKey);
      return true;
    })
    .sort(compareCurrentOverseasItems);
}

function getHistoricalYearOptions() {
  const years = new Set();
  for (const record of flattenHistoricalOverseasRecords()) {
    for (const year of record.yearKeys ?? []) {
      years.add(year);
    }
  }

  return [...years]
    .sort((left, right) => Number(right) - Number(left))
    .map((year) => ({
      value: year,
      label: year
    }));
}

function getCurrentlyAbroadIdentitySet() {
  return new Set(getCurrentOverseasItems().map(getCurrentOverseasIdentity));
}

function getChinaTeamLabel(level) {
  if (state.language === "en") {
    if (level === "u23") {
      return "China U23";
    }
    if (level === "u20") {
      return "China U20";
    }
    if (level === "u17") {
      return "China U17";
    }
    return "China";
  }

  if (level === "u23") {
    return "中国 U23";
  }
  if (level === "u20") {
    return "中国 U20";
  }
  if (level === "u17") {
    return "中国 U17";
  }
  return "中国队";
}

function summarizeChinaRecord(matches) {
  const items = Array.isArray(matches) ? matches : [];
  if (items.length === 0) {
    return "";
  }

  const counts = { W: 0, D: 0, L: 0 };
  for (const match of items) {
    if (counts[match.result] !== undefined) {
      counts[match.result] += 1;
    }
  }

  const playedMatches = counts.W + counts.D + counts.L;

  return t("home.focus.record", {
    matches: playedMatches || items.length,
    wins: counts.W,
    draws: counts.D,
    losses: counts.L
  });
}

function renderHomeFocusEvent(tournament) {
  if (!tournament) {
    return `<div class="empty-inline">${escapeHtml(t("common.loading"))}</div>`;
  }

  const teamLabel = getChinaTeamLabel(tournament.level);
  const recordText =
    summarizeChinaRecord(tournament.china_matches) ||
    t("home.focus.recordFallback", {
      team: teamLabel,
      summary: localizeText(tournament.china_summary)
    });

  return `
    <p class="eyebrow">${escapeHtml(t("home.nextEvent.eyebrow"))}</p>
    <h2>${escapeHtml(tournament.competition_name)}</h2>
    <p class="hero-side-note">${escapeHtml(formatRange(tournament.date_range))}</p>
    <div class="chip-row">
      <span class="chip">${formatLevelTag(tournament.level)}</span>
      <span class="chip">${formatStatus(tournament.status)}</span>
      <span class="chip">${formatChinaStatus(tournament.china_status)}</span>
    </div>
    <p class="focus-team-label">${escapeHtml(teamLabel)}</p>
    <p class="focus-team-record">${escapeHtml(recordText)}</p>
    <a class="primary-link primary-link-inline" href="${buildTournamentDetailUrl(tournament.id)}">${escapeHtml(t("tournaments.card.open"))}</a>
  `;
}

function renderHomeOverseasSummaryRow(entry) {
  return `
    <article class="summary-row">
      <div>
        <strong>${escapeHtml(getCountryPlayerLabel(entry.country))}</strong>
      </div>
      <div class="summary-stat">
        <span class="summary-stat-value">${escapeHtml(String(entry.currentCount))}</span>
        <span class="summary-stat-label">${escapeHtml(t("home.overseasSummary.currentShort"))}</span>
      </div>
      <div class="summary-stat">
        <span class="summary-stat-value">${escapeHtml(String(entry.verifiedRecords))}</span>
        <span class="summary-stat-label">${escapeHtml(t("home.overseasSummary.historyShort"))}</span>
      </div>
    </article>
  `;
}

function renderHomeTopicOverview(project, dossier, taggedPlayers) {
  if (!project || !dossier) {
    return `<div class="empty-inline">${escapeHtml(t("home.topic.empty"))}</div>`;
  }

  const roleLines = dossier.role_model ?? [];
  const batchCount = dossier.batch_roster_outline?.length ?? 0;
  const timelineCount = dossier.timeline?.length ?? 0;

  return `
    <div class="section-head">
      <div>
        <p class="eyebrow">${escapeHtml(t("home.topic.eyebrow"))}</p>
        <h2>${escapeHtml(t("home.topic.title"))}</h2>
      </div>
      <a class="inline-link" href="${buildPlayerTagUrl("donglu-football-boys")}">${escapeHtml(t("home.topic.link"))}</a>
    </div>
    <div class="chip-row">
      <span class="chip">${escapeHtml(formatTag("donglu-football-boys"))}</span>
      <span class="chip">${escapeHtml(t("home.topic.taggedPlayers", { count: taggedPlayers.length }))}</span>
      <span class="chip">${escapeHtml(t("home.topic.batchCount", { count: batchCount }))}</span>
      <span class="chip">${escapeHtml(t("home.topic.timelineCount", { count: timelineCount }))}</span>
    </div>
    <p class="topic-lead">${escapeHtml(localizeText(dossier.summary))}</p>
    <div class="topic-card-grid">
      <article class="story-card">
        <p class="eyebrow">${escapeHtml(t("home.topic.roleTitle"))}</p>
        <p>${escapeHtml(localizeText(roleLines[0], localizeText(dossier.summary)))}</p>
        ${roleLines[1] ? `<p class="small-note">${escapeHtml(localizeText(roleLines[1]))}</p>` : ""}
      </article>
      <article class="story-card">
        <p class="eyebrow">${escapeHtml(t("home.topic.scopeTitle"))}</p>
        <p>${escapeHtml(localizeText(dossier.scope_note))}</p>
      </article>
      <article class="story-card">
        <p class="eyebrow">${escapeHtml(t("home.topic.completedTitle"))}</p>
        <p>${escapeHtml(localizeText(project.completed, localizeText(project.summary)))}</p>
      </article>
      <article class="story-card">
        <p class="eyebrow">${escapeHtml(t("home.topic.nextTitle"))}</p>
        <p>${escapeHtml(localizeText(project.next_step))}</p>
      </article>
    </div>
  `;
}

function renderHomeTopicTimeline(dossier) {
  if (!dossier) {
    return `<div class="empty-inline">${escapeHtml(t("home.topic.empty"))}</div>`;
  }

  const timelineItems = (dossier.timeline ?? []).slice(0, 6);

  return `
    <div class="section-head">
      <div>
        <p class="eyebrow">${escapeHtml(t("home.topic.eyebrow"))}</p>
        <h2>${escapeHtml(t("home.topic.timelineTitle"))}</h2>
      </div>
      <a class="inline-link" href="${buildPlayerTagUrl("donglu-football-boys")}">${escapeHtml(t("home.topic.timelineLink"))}</a>
    </div>
    <div class="timeline-list">
      ${timelineItems
        .map(
          (item) => `
            <article class="timeline-item">
              <p class="timeline-label">${escapeHtml(item.date)}</p>
              <h3>${escapeHtml(localizeText(item.label))}</h3>
              <p>${escapeHtml(localizeText(item.detail))}</p>
            </article>
          `
        )
        .join("")}
    </div>
  `;
}

function renderHomeTopicBatchCard(batch) {
  const verifiedPlayers = batch.verified_players ?? [];
  const sampleNames = verifiedPlayers.slice(0, 6).join("、");

  return `
    <article class="story-card topic-batch-card">
      <div class="chip-row">
        <span class="chip">${escapeHtml(batch.confidence ?? "-")}</span>
        <span class="chip">${escapeHtml(t("home.topic.batchPlayers", { count: verifiedPlayers.length }))}</span>
      </div>
      <h3>${escapeHtml(localizeText(batch.label))}</h3>
      <p>${escapeHtml(localizeText(batch.note))}</p>
      <p class="small-note">${escapeHtml(t("home.topic.batchWindow", { value: localizeText(batch.time_window) }))}</p>
      ${sampleNames ? `<p class="topic-batch-meta">${escapeHtml(t("home.topic.batchSample", { value: sampleNames }))}</p>` : ""}
    </article>
  `;
}

function renderHomeTopicBatches(dossier) {
  if (!dossier) {
    return `<div class="empty-inline">${escapeHtml(t("home.topic.empty"))}</div>`;
  }

  const batches = dossier.batch_roster_outline ?? [];
  if (!batches.length) {
    return `<div class="empty-inline">${escapeHtml(t("home.topic.batchesEmpty"))}</div>`;
  }

  return `
    <div class="section-head">
      <div>
        <p class="eyebrow">${escapeHtml(t("home.topic.eyebrow"))}</p>
        <h2>${escapeHtml(t("home.topic.batchesTitle"))}</h2>
      </div>
      <a class="inline-link" href="${buildPlayerTagUrl("donglu-football-boys")}">${escapeHtml(t("home.topic.link"))}</a>
    </div>
    <div class="topic-batch-grid">
      ${batches.map(renderHomeTopicBatchCard).join("")}
    </div>
  `;
}

function renderHomePage() {
  const homePlayerCount = document.querySelector("#homePlayerCount");
  const homeOverseasCount = document.querySelector("#homeOverseasCount");
  const homeArchiveCount = document.querySelector("#homeArchiveCount");
  const homeUpdatedDate = document.querySelector("#homeUpdatedDate");
  const homeNextEventHero = document.querySelector("#homeNextEventHero");
  const homeRecentMatches = document.querySelector("#homeRecentMatches");
  const homeOverseasSummary = document.querySelector("#homeOverseasSummary");
  const homeFeatureTopic = document.querySelector("#homeFeatureTopic");
  const homeFeatureTopicTimeline = document.querySelector("#homeFeatureTopicTimeline");
  const homeFootballBoysBatches = document.querySelector("#homeFootballBoysBatches");

  const overseasPlayers = getCurrentOverseasItems();
  const heroEvent = getHomeFocusTournament();
  const footballBoysProject = getProjectById("donglu-football-boys");
  const footballBoysDossier = getDossierById("donglu-football-boys");
  const footballBoysPlayers = getPlayersByTag("donglu-football-boys");

  homePlayerCount.textContent = String(state.enrichedPlayers.length);
  homeOverseasCount.textContent = String(overseasPlayers.length);
  homeArchiveCount.textContent = String(state.overview.tournament_archive.length);
  homeUpdatedDate.textContent = formatDate(state.overview.generated_at);

  homeNextEventHero.innerHTML = renderHomeFocusEvent(heroEvent);

  homeRecentMatches.innerHTML = getRecentChinaMatches().map(renderRecentMatchCard).join("");

  homeOverseasSummary.innerHTML = getOverseasCountryMap().map(renderHomeOverseasSummaryRow).join("");

  if (homeFeatureTopic) {
    homeFeatureTopic.innerHTML = renderHomeTopicOverview(
      footballBoysProject,
      footballBoysDossier,
      footballBoysPlayers
    );
  }

  if (homeFeatureTopicTimeline) {
    homeFeatureTopicTimeline.innerHTML = renderHomeTopicTimeline(footballBoysDossier);
  }

  if (homeFootballBoysBatches) {
    homeFootballBoysBatches.innerHTML = renderHomeTopicBatches(footballBoysDossier);
  }
}

function renderRecentMatchCard(item) {
  return `
    <article class="match-row">
      <div class="chip-row">
        <span class="chip">${formatLevelTag(item.level)}</span>
        <span class="chip">${escapeHtml(getLabel(MATCH_RESULT_LABELS, item.result, item.result))}</span>
      </div>
      <h3><a class="inline-link" href="${buildTournamentDetailUrl(item.tournamentId)}">${escapeHtml(item.tournament)}</a></h3>
      <p class="match-row-score">${escapeHtml(`${getChinaTeamLabel(item.level)} ${item.score} ${formatCountryName(item.opponent)}`)}</p>
      <p class="small-note">${escapeHtml(formatDate(item.date))}</p>
    </article>
  `;
}

function renderFocusTournamentCard(tournament) {
  const latest = getFocusTournamentLatestNote(tournament);
  return `
    <article class="story-card">
      <div class="chip-row">
        <span class="chip">${escapeHtml(tournament.short_name)}</span>
        <span class="chip">${formatStatus(tournament.status)}</span>
      </div>
      <h3>${escapeHtml(tournament.name)}</h3>
      <p>${escapeHtml(t("home.focus.status", { value: formatStatus(tournament.status) }))}</p>
      <p>${escapeHtml(t("home.focus.period", { value: formatRange(tournament.date_range) }))}</p>
      <p>${escapeHtml(t("home.focus.scope", { value: localizeText(tournament.headline) }))}</p>
      <p>${escapeHtml(t("home.focus.latest", { value: localizeText(latest) }))}</p>
      <p class="small-note">${escapeHtml(t("home.focus.sources", { count: (tournament.sources ?? []).length }))}</p>
      <a class="primary-link primary-link-inline" href="${buildTournamentDetailUrl(tournament.id)}">${escapeHtml(t("tournaments.card.open"))}</a>
    </article>
  `;
}

function renderProjectCard(project) {
  const goal = project.goal ? localizeText(project.goal) : localizeText(project.summary);
  const completed = project.completed ? localizeText(project.completed) : "";
  const tagChips = (project.focus_tags ?? [])
    .map((tag) => `<span class="chip">${escapeHtml(formatTag(tag))}</span>`)
    .join("");
  return `
    <article class="stack-card">
      <div class="chip-row">
        <span class="chip">${escapeHtml(getLabel(PROJECT_PRIORITY_LABELS, project.priority, project.priority))}</span>
        <span class="chip">${formatStatus(project.status)}</span>
        ${tagChips}
      </div>
      <h3>${escapeHtml(project.name)}</h3>
      <p>${escapeHtml(t("home.project.goal", { value: goal }))}</p>
      ${completed ? `<p>${escapeHtml(t("home.project.completed", { value: completed }))}</p>` : ""}
      <p class="small-note">${escapeHtml(t("home.project.nextStep", { value: localizeText(project.next_step) }))}</p>
    </article>
  `;
}

function initializePlayerFilters() {
  const params = new URLSearchParams(window.location.search);
  const supportedSorts = new Set(["age-asc", "age-desc", "market-value-desc", "market-value-asc"]);
  state.playerFilters.query = params.get("query") ?? "";
  state.playerFilters.country = params.get("country") ?? "all";
  state.playerFilters.ageBand = params.get("ageBand") ?? "all";
  state.playerFilters.competition = params.get("competition") ?? "all";
  state.playerFilters.leagueSystem = params.get("league") ?? "all";
  state.playerFilters.organizationType = params.get("organizationType") ?? "all";
  state.playerFilters.tag = params.get("tag") ?? "all";
  state.playerFilters.sort = supportedSorts.has(params.get("sort")) ? params.get("sort") : "default";
  state.playerFilters.view = params.get("view") === "table" ? "table" : "cards";

  const countryOptions = uniqueValues(state.enrichedPlayers.map((player) => player.country)).map(
    (value) => ({
      value,
      label: formatCountryName(value)
    })
  );
  const ageOptions = uniqueValues(state.enrichedPlayers.map((player) => player.age_band)).map((value) => ({
    value,
    label: formatAgeBand(value)
  }));
  const competitionOptions = uniqueValues(
    state.enrichedPlayers.flatMap((player) =>
      (player.tournament_participation ?? []).map((entry) => entry.competition_id).filter(Boolean)
    )
  ).map((value) => ({
    value,
    label: getTournamentDisplayName(value)
  }));
  const leagueOptions = uniqueValues(state.enrichedPlayers.map((player) => player.currentLeagueSystem)).map(
    (value) => ({
      value,
      label: formatLeagueSystem(value)
    })
  );
  const organizationTypeOptions = uniqueValues(
    state.enrichedPlayers.map((player) => player.organizationType)
  ).map((value) => ({
    value,
    label: getLabel(ORGANIZATION_TYPE_LABELS, value, value)
  }));
  const tagOptions = uniqueValues(state.enrichedPlayers.flatMap((player) => player.focus_tags ?? [])).map(
    (value) => ({
      value,
      label: formatTag(value)
    })
  );

  buildOptions(
    document.querySelector("#playerCountryFilter"),
    countryOptions,
    state.playerFilters.country,
    t("players.filters.allCountry")
  );
  buildOptions(
    document.querySelector("#playerAgeFilter"),
    ageOptions,
    state.playerFilters.ageBand,
    t("players.filters.allAgeBand")
  );
  buildOptions(
    document.querySelector("#playerCompetitionFilter"),
    competitionOptions,
    state.playerFilters.competition,
    t("players.filters.allCompetition")
  );
  buildOptions(
    document.querySelector("#playerLeagueFilter"),
    leagueOptions,
    state.playerFilters.leagueSystem,
    t("players.filters.allLeague")
  );
  buildOptions(
    document.querySelector("#playerOrganizationTypeFilter"),
    organizationTypeOptions,
    state.playerFilters.organizationType,
    t("players.filters.allOrganizationType")
  );
  buildOptions(
    document.querySelector("#playerTagFilter"),
    tagOptions,
    state.playerFilters.tag,
    t("players.filters.allTag")
  );
  const scoutingCountries = uniqueValues(
    (state.overview?.scouting_watchlist?.records ?? []).map((record) => record.country)
  ).map((value) => ({ value, label: formatCountryName(value) }));
  buildOptions(
    document.querySelector("#scoutingWatchCountryFilter"),
    scoutingCountries,
    state.scoutingCountry,
    t("players.scouting.allCountry")
  );
  const sortSelect = document.querySelector("#playerSortSelect");
  if (sortSelect) {
    const sortOptions = [
      { value: "default", label: t("players.sort.default") },
      { value: "age-asc", label: t("players.sort.ageAsc") },
      { value: "age-desc", label: t("players.sort.ageDesc") },
      { value: "market-value-desc", label: t("players.sort.marketValueDesc") },
      { value: "market-value-asc", label: t("players.sort.marketValueAsc") }
    ];
    sortSelect.innerHTML = sortOptions
      .map(
        (option) =>
          `<option value="${escapeHtml(option.value)}" ${option.value === state.playerFilters.sort ? "selected" : ""}>${escapeHtml(option.label)}</option>`
      )
      .join("");
  }
  setControlValue("#playerSearchInput", state.playerFilters.query);

  document.querySelector("#playerSearchInput")?.addEventListener("input", (event) => {
    state.playerFilters.query = event.target.value;
    renderPlayersPage();
  });
  document.querySelector("#playerCountryFilter")?.addEventListener("change", (event) => {
    state.playerFilters.country = event.target.value;
    renderPlayersPage();
  });
  document.querySelector("#playerAgeFilter")?.addEventListener("change", (event) => {
    state.playerFilters.ageBand = event.target.value;
    renderPlayersPage();
  });
  document.querySelector("#playerCompetitionFilter")?.addEventListener("change", (event) => {
    state.playerFilters.competition = event.target.value;
    renderPlayersPage();
  });
  document.querySelector("#playerLeagueFilter")?.addEventListener("change", (event) => {
    state.playerFilters.leagueSystem = event.target.value;
    renderPlayersPage();
  });
  document.querySelector("#playerOrganizationTypeFilter")?.addEventListener("change", (event) => {
    state.playerFilters.organizationType = event.target.value;
    renderPlayersPage();
  });
  document.querySelector("#playerTagFilter")?.addEventListener("change", (event) => {
    state.playerFilters.tag = event.target.value;
    renderPlayersPage();
  });
  document.querySelector("#playerSortSelect")?.addEventListener("change", (event) => {
    state.playerFilters.sort = event.target.value;
    renderPlayersPage();
  });
  document.querySelector("#viewCardsButton")?.addEventListener("click", () => {
    state.playerFilters.view = "cards";
    renderPlayersPage();
  });
  document.querySelector("#viewTableButton")?.addEventListener("click", () => {
    state.playerFilters.view = "table";
    renderPlayersPage();
  });
  document.querySelector("#playerResetButton")?.addEventListener("click", () => {
    state.playerFilters.query = "";
    state.playerFilters.country = "all";
    state.playerFilters.ageBand = "all";
    state.playerFilters.competition = "all";
    state.playerFilters.leagueSystem = "all";
    state.playerFilters.organizationType = "all";
    state.playerFilters.tag = "all";
    state.playerFilters.sort = "default";
    state.playerFilters.view = "cards";
    renderPlayersPage();
  });
  document.querySelector("#scoutingWatchCountryFilter")?.addEventListener("change", (event) => {
    state.scoutingCountry = event.target.value;
    renderPlayersPage();
  });
}

function renderScoutingWatchlist() {
  const watchlist = state.overview?.scouting_watchlist;
  const grid = document.querySelector("#scoutingWatchGrid");
  const meta = document.querySelector("#scoutingWatchMeta");
  const caveat = document.querySelector("#scoutingWatchCaveat");
  const collections = document.querySelector("#scoutingWatchCollections");
  if (!watchlist || !grid || !meta) {
    return;
  }

  const records = (watchlist.records ?? []).filter(
    (record) => state.scoutingCountry === "all" || record.country === state.scoutingCountry
  );
  setControlValue("#scoutingWatchCountryFilter", state.scoutingCountry);
  meta.textContent = t("players.scouting.meta", {
    count: records.length,
    total: watchlist.records.length,
    countries: watchlist.scope.country_count
  });
  if (caveat) {
    caveat.textContent = localizeText(watchlist.source.caveat);
  }
  grid.innerHTML = records
    .map((record) => {
      const rating = record.potential_rating === null
        ? t("players.scouting.unrated")
        : t("players.scouting.rating", { value: record.potential_rating });
      return `
        <article class="player-card">
          <div class="chip-row">
            <span class="chip">${escapeHtml(formatCountryName(record.country))}</span>
            <span class="chip">${escapeHtml(String(record.birth_year))}</span>
            <span class="chip">${escapeHtml(t(`players.scouting.type.${record.report_type}`))}</span>
          </div>
          <h3>${escapeHtml(record.local_name || record.name)}</h3>
          ${record.local_name ? `<p class="small-note">${escapeHtml(record.name)}</p>` : ""}
          <p>${escapeHtml(rating)}</p>
          <p class="small-note">${escapeHtml(localizeText(record.summary))}</p>
          <p class="small-note">${escapeHtml(t("players.scouting.checked", { date: formatDate(record.source_checked_at) }))}</p>
          <div class="chip-row">
            ${record.player_id ? `<a class="primary-link primary-link-inline" href="${buildPlayerDetailUrl(record.player_id)}">${escapeHtml(t("players.scouting.profile"))}</a>` : ""}
            <a class="primary-link primary-link-inline" href="${escapeHtml(record.source_url)}" target="_blank" rel="noreferrer">${escapeHtml(t("players.scouting.original"))}</a>
          </div>
        </article>
      `;
    })
    .join("");
  if (collections) {
    collections.innerHTML = (watchlist.related_collections ?? [])
      .map(
        (collection) => `
          <a class="primary-link primary-link-inline" href="${escapeHtml(collection.url)}" target="_blank" rel="noreferrer">
            ${escapeHtml(localizeText(collection.name))} · ${escapeHtml(formatCountryName(collection.country))}
          </a>
        `
      )
      .join("");
  }
}

function getFilteredPlayers() {
  return state.enrichedPlayers
    .filter((player) => {
      const matchesQuery =
        state.playerFilters.query === "" ||
        normalize(player.searchBlob).includes(normalize(state.playerFilters.query));
      const matchesCountry =
        state.playerFilters.country === "all" || player.country === state.playerFilters.country;
      const matchesAge =
        state.playerFilters.ageBand === "all" || player.age_band === state.playerFilters.ageBand;
      const matchesCompetition =
        state.playerFilters.competition === "all" ||
        (player.tournament_participation ?? []).some(
          (entry) => entry.competition_id === state.playerFilters.competition
        );
      const matchesLeague =
        state.playerFilters.leagueSystem === "all" ||
        player.currentLeagueSystem === state.playerFilters.leagueSystem;
      const matchesOrganizationType =
        state.playerFilters.organizationType === "all" ||
        player.organizationType === state.playerFilters.organizationType;
      const matchesTag =
        state.playerFilters.tag === "all" ||
        (player.focus_tags ?? []).includes(state.playerFilters.tag);

      return matchesQuery && matchesCountry && matchesAge && matchesCompetition && matchesLeague && matchesOrganizationType && matchesTag;
    })
    .sort(getPlayerSortComparator(state.playerFilters.sort));
}

function comparePlayersByAge(direction) {
  return (left, right) => {
    if (left.age !== right.age) {
      return direction === "asc" ? left.age - right.age : right.age - left.age;
    }

    if (left.birth_date !== right.birth_date) {
      return direction === "asc"
        ? right.birth_date.localeCompare(left.birth_date)
        : left.birth_date.localeCompare(right.birth_date);
    }

    return getPlayerPrimaryName(left).localeCompare(getPlayerPrimaryName(right), getSortLocale());
  };
}

function comparePlayersByCurrentMarketValue(direction) {
  return (left, right) => {
    const leftHasValue = left.marketValueCurrentEur > 0;
    const rightHasValue = right.marketValueCurrentEur > 0;
    if (leftHasValue !== rightHasValue) {
      return leftHasValue ? -1 : 1;
    }

    if (leftHasValue && left.marketValueCurrentEur !== right.marketValueCurrentEur) {
      return direction === "asc"
        ? left.marketValueCurrentEur - right.marketValueCurrentEur
        : right.marketValueCurrentEur - left.marketValueCurrentEur;
    }

    return getPlayerPrimaryName(left).localeCompare(getPlayerPrimaryName(right), getSortLocale());
  };
}

function getPlayerSortComparator(sort) {
  if (sort === "age-asc") {
    return comparePlayersByAge("asc");
  }
  if (sort === "age-desc") {
    return comparePlayersByAge("desc");
  }
  if (sort === "market-value-desc") {
    return comparePlayersByCurrentMarketValue("desc");
  }
  if (sort === "market-value-asc") {
    return comparePlayersByCurrentMarketValue("asc");
  }
  return sortPlayers;
}

function comparePlayersByMarketValue(field) {
  return (left, right) => {
    if (right[field] !== left[field]) {
      return right[field] - left[field];
    }

    const rightDate =
      field === "marketValuePeakEur"
        ? right.market_value?.peak?.date ?? ""
        : right.market_value?.current?.date ?? "";
    const leftDate =
      field === "marketValuePeakEur"
        ? left.market_value?.peak?.date ?? ""
        : left.market_value?.current?.date ?? "";

    if (rightDate !== leftDate) {
      return rightDate.localeCompare(leftDate);
    }

    return getPlayerPrimaryName(left).localeCompare(getPlayerPrimaryName(right), getSortLocale());
  };
}

function buildCurrentMarketValueRankingMeta(player) {
  const peakDate = player.market_value?.peak?.date ? formatDate(player.market_value.peak.date) : t("common.pending");
  return t("players.rankings.currentMeta", {
    value: formatMarketValuePoint(player.market_value?.peak),
    date: peakDate
  });
}

function buildPeakMarketValueRankingMeta(player) {
  const peakDate = player.market_value?.peak?.date ? formatDate(player.market_value.peak.date) : t("common.pending");
  if (player.market_value?.current) {
    return t("players.rankings.peakMeta", {
      value: formatMarketValuePoint(player.market_value.current),
      date: peakDate
    });
  }

  return t("players.rankings.peakMetaNoCurrent", {
    date: peakDate
  });
}

function renderPlayerMarketValueRankingPanel(title, coverageLabel, players, amountKey, metaBuilder, emptyKey) {
  return `
    <div class="section-head compact-head">
      <div>
        <p class="eyebrow">${escapeHtml(t("players.rankings.eyebrow"))}</p>
        <h2>${escapeHtml(title)}</h2>
      </div>
    </div>
    <p class="section-note">${escapeHtml(coverageLabel)}</p>
    ${
      players.length > 0
        ? `
          <div class="market-ranking-list">
            ${players
              .map(
                (player, index) => `
                  <article class="market-ranking-row">
                    <span class="market-ranking-rank">${String(index + 1).padStart(2, "0")}</span>
                    <div class="market-ranking-body">
                      <a class="market-ranking-link" href="${buildPlayerDetailUrl(player.id)}">${escapeHtml(getPlayerPrimaryName(player))}</a>
                      <p class="small-note">${escapeHtml(formatCountryName(player.country))} · ${escapeHtml(formatAgeBand(player.age_band))} · ${escapeHtml(getPlayerAffiliation(player).directoryTeam)}</p>
                      <p class="small-note">${escapeHtml(metaBuilder(player))}</p>
                    </div>
                    <div class="market-ranking-value">
                      <strong>${escapeHtml(formatMarketValuePoint(player.market_value?.[amountKey]))}</strong>
                      <span class="small-note">${escapeHtml(formatDate(player.market_value?.[amountKey]?.date ?? getPlayerLastMarketValueCheck(player)))}</span>
                    </div>
                  </article>
                `
              )
              .join("")}
          </div>
        `
        : `<div class="empty-inline">${escapeHtml(t(emptyKey))}</div>`
    }
    <p class="small-note market-ranking-note">${escapeHtml(t("players.rankings.note"))}</p>
  `;
}

function renderHistoricalMarketValueRankingPanel() {
  const ranking = state.overview?.overseas_history?.market_value_peak_ranking;
  const entries = [...(ranking?.entries ?? [])].sort((left, right) => {
    if (right.peak.eur !== left.peak.eur) {
      return right.peak.eur - left.peak.eur;
    }
    return left.name.localeCompare(right.name, getSortLocale());
  });

  return `
    <div class="section-head compact-head">
      <div>
        <p class="eyebrow">${escapeHtml(t("players.rankings.eyebrow"))}</p>
        <h2>${escapeHtml(t("players.rankings.historyTitle"))}</h2>
      </div>
    </div>
    <p class="section-note">${escapeHtml(t("players.rankings.historyCoverage", { count: entries.length }))}</p>
    ${
      entries.length > 0
        ? `<div class="market-ranking-list market-ranking-history-list">
            ${entries
              .map((entry, index) => {
                const previousEntry = entries[index - 1];
                const rank = previousEntry?.peak.eur === entry.peak.eur
                  ? entries.findIndex((candidate) => candidate.peak.eur === entry.peak.eur) + 1
                  : index + 1;
                const primaryName = state.language === "en" ? entry.name : entry.local_name;
                const secondaryName = state.language === "en" ? entry.local_name : entry.name;
                const status = entry.retired
                  ? t("players.rankings.historyRetired")
                  : t("players.rankings.historyCurrent", { value: formatMarketValuePoint(entry.current) });

                return `
                  <article class="market-ranking-row">
                    <span class="market-ranking-rank">${String(rank).padStart(2, "0")}</span>
                    <div class="market-ranking-body">
                      <a class="market-ranking-link" href="${escapeHtml(entry.transfermarkt.market_value_url)}" target="_blank" rel="noreferrer">${escapeHtml(primaryName)}</a>
                      <p class="small-note">${escapeHtml(secondaryName)} · ${escapeHtml(formatCountryName(entry.country))}</p>
                      <p class="small-note">${escapeHtml(t("players.rankings.historyMeta", {
                        club: formatClubName(entry.peak.club),
                        date: formatDate(entry.peak.date),
                        age: entry.peak.age
                      }))}</p>
                    </div>
                    <div class="market-ranking-value">
                      <strong>${escapeHtml(formatMarketValuePoint(entry.peak))}</strong>
                      <span class="small-note">${escapeHtml(status)}</span>
                    </div>
                  </article>
                `;
              })
              .join("")}
          </div>`
        : `<div class="empty-inline">${escapeHtml(t("players.rankings.historyEmpty"))}</div>`
    }
    <p class="small-note market-ranking-note">${escapeHtml(t("players.rankings.historyNote"))}</p>
  `;
}

function renderPlayersPage() {
  const cardGrid = document.querySelector("#playerCardGrid");
  const tableWrap = document.querySelector("#playerTableWrap");
  const tableBody = document.querySelector("#playerTableBody");
  const emptyState = document.querySelector("#playerListEmptyState");
  const meta = document.querySelector("#playerResultsMeta");
  const cardsButton = document.querySelector("#viewCardsButton");
  const tableButton = document.querySelector("#viewTableButton");
  const currentRankingPanel = document.querySelector("#playerMarketValueCurrent");
  const peakRankingPanel = document.querySelector("#playerMarketValuePeak");
  const historicalRankingPanel = document.querySelector("#playerMarketValueHistorical");

  const players = getFilteredPlayers();
  const allCurrentMarketValuePlayers = players
    .filter((player) => player.marketValueCurrentEur > 0)
    .sort(comparePlayersByMarketValue("marketValueCurrentEur"));
  const currentMarketValuePlayers = allCurrentMarketValuePlayers.slice(0, PLAYER_MARKET_VALUE_RANK_LIMIT);
  const allPeakMarketValuePlayers = players
    .filter((player) => player.marketValuePeakEur > 0)
    .sort(comparePlayersByMarketValue("marketValuePeakEur"));
  const peakMarketValuePlayers = allPeakMarketValuePlayers.slice(0, PLAYER_MARKET_VALUE_RANK_LIMIT);

  setControlValue("#playerSearchInput", state.playerFilters.query);
  setControlValue("#playerCountryFilter", state.playerFilters.country);
  setControlValue("#playerAgeFilter", state.playerFilters.ageBand);
  setControlValue("#playerCompetitionFilter", state.playerFilters.competition);
  setControlValue("#playerLeagueFilter", state.playerFilters.leagueSystem);
  setControlValue("#playerOrganizationTypeFilter", state.playerFilters.organizationType);
  setControlValue("#playerTagFilter", state.playerFilters.tag);
  setControlValue("#playerSortSelect", state.playerFilters.sort);
  replaceQueryParams({
    query: state.playerFilters.query,
    country: state.playerFilters.country,
    ageBand: state.playerFilters.ageBand,
    competition: state.playerFilters.competition,
    league: state.playerFilters.leagueSystem,
    organizationType: state.playerFilters.organizationType,
    tag: state.playerFilters.tag,
    sort: state.playerFilters.sort,
    view: state.playerFilters.view
  });

  meta.textContent = t("players.meta.results", {
    count: players.length,
    total: state.enrichedPlayers.length
  });
  cardsButton.classList.toggle("is-active", state.playerFilters.view === "cards");
  tableButton.classList.toggle("is-active", state.playerFilters.view === "table");
  cardGrid.hidden = state.playerFilters.view !== "cards";
  tableWrap.hidden = state.playerFilters.view !== "table";
  if (currentRankingPanel) {
    currentRankingPanel.innerHTML = renderPlayerMarketValueRankingPanel(
      t("players.rankings.currentTitle"),
      t("players.rankings.coverageCurrent", {
        count: allCurrentMarketValuePlayers.length,
        total: players.length
      }),
      currentMarketValuePlayers,
      "current",
      buildCurrentMarketValueRankingMeta,
      "players.rankings.currentEmpty"
    );
  }
  if (peakRankingPanel) {
    peakRankingPanel.innerHTML = renderPlayerMarketValueRankingPanel(
      t("players.rankings.peakTitle"),
      t("players.rankings.coveragePeak", {
        count: allPeakMarketValuePlayers.length,
        total: players.length
      }),
      peakMarketValuePlayers,
      "peak",
      buildPeakMarketValueRankingMeta,
      "players.rankings.peakEmpty"
    );
  }
  if (historicalRankingPanel) {
    historicalRankingPanel.innerHTML = renderHistoricalMarketValueRankingPanel();
  }
  renderScoutingWatchlist();

  cardGrid.innerHTML = players.map((player) => renderPlayerCard(player, false)).join("");
  tableBody.innerHTML = players.map(renderPlayerTableRow).join("");
  emptyState.hidden = players.length > 0;
}

function renderPlayerCard(player, compact) {
  const primaryName = getPlayerPrimaryName(player);
  const secondaryNames = getPlayerSecondaryNames(player).join(" / ");
  const affiliation = getPlayerAffiliation(player);
  const marketValueSummary = buildPlayerCardMarketValueSummary(player);
  return `
    <article class="player-card ${compact ? "player-card-compact" : ""}">
      <div class="chip-row">
        <span class="chip">${escapeHtml(formatCountryName(player.country))}</span>
        <span class="chip">${formatAgeBand(player.age_band)}</span>
        ${player.foreignRegistration ? `<span class="chip accent-chip">${formatBucket(player.overseasBucket)}</span>` : ""}
      </div>
      <h3>${escapeHtml(primaryName)}</h3>
      ${secondaryNames ? `<p class="small-note">${escapeHtml(secondaryNames)}</p>` : ""}
      <p>${escapeHtml(formatPosition(player.primary_position))} · ${escapeHtml(formatAge(player.age))}</p>
      <p class="small-note">${escapeHtml(affiliation.directoryTeam || t("players.card.clubPending"))} · ${escapeHtml(formatLeagueSystem(player.currentLeagueSystem))}</p>
      ${marketValueSummary ? `<p class="small-note">${escapeHtml(marketValueSummary)}</p>` : ""}
      <p class="small-note">${escapeHtml(summarizePathway(player.training_pathway))}</p>
      <div class="chip-row">${renderTagChips((player.focus_tags ?? []).slice(0, compact ? 2 : 4))}</div>
      <a class="primary-link primary-link-inline" href="${buildPlayerDetailUrl(player.id)}">${escapeHtml(t("players.card.viewProfile"))}</a>
    </article>
  `;
}

function renderCurrentOverseasItem(item, compact) {
  if (item.sourceType === "history") {
    const primaryName =
      item.local_name && normalize(item.local_name) !== normalize(item.name)
        ? `${item.local_name} / ${item.name}`
        : item.local_name || item.name;

    return `
      <article class="player-card ${compact ? "player-card-compact" : ""}">
        <div class="chip-row">
          <span class="chip">${escapeHtml(formatCountryName(item.country))}</span>
          <span class="chip accent-chip">${formatBucket(item.bucket)}</span>
          <span class="chip team-level-chip team-level-${escapeHtml(item.overseasTeamLevel)}">${escapeHtml(formatOverseasTeamLevel(item.overseasTeamLevel))}</span>
          <span class="chip">${escapeHtml(item.season)}</span>
        </div>
        <h3>${escapeHtml(primaryName)}</h3>
        <p>${escapeHtml(t("home.overseasCard.current", { value: formatClubName(item.club) }))}</p>
        <p>${escapeHtml(t("home.overseasCard.league", { value: item.league }))}</p>
        <p class="small-note">${escapeHtml(t("home.overseasCard.sample", { value: localizeText(item.appearance_label ?? item.summary ?? t("common.pending")) }))}</p>
        ${compact ? "" : `<p class="small-note">${escapeHtml(localizeText(item.summary))}</p>`}
      </article>
    `;
  }

  const primaryName = getPlayerPrimaryName(item);
  const secondaryNames = getPlayerSecondaryNames(item).join(" / ");
  const originStep = getDomesticOriginStep(item.training_pathway, item.country);
  const foreignStep = getLatestForeignPathwayStep(item.training_pathway, item.country);
  const region = formatCountryName(item.registration_club?.country);
  const affiliation = getPlayerAffiliation(item);

  return `
    <article class="player-card ${compact ? "player-card-compact" : ""}">
      <div class="chip-row">
        <span class="chip">${escapeHtml(formatCountryName(item.country))}</span>
        <span class="chip accent-chip">${formatBucket(item.overseasBucket)}</span>
        <span class="chip team-level-chip team-level-${escapeHtml(item.overseasTeamLevel)}">${escapeHtml(formatOverseasTeamLevel(item.overseasTeamLevel))}</span>
        <span class="chip">${formatAgeBand(item.age_band)}</span>
      </div>
      <h3>${escapeHtml(primaryName)}</h3>
      ${secondaryNames ? `<p class="small-note">${escapeHtml(secondaryNames)}</p>` : ""}
      <p>${escapeHtml(formatPosition(item.primary_position))} · ${escapeHtml(formatAge(item.age))}</p>
      <p>${escapeHtml(t("home.overseasCard.current", { value: affiliation.currentTeam || t("players.card.clubPending") }))}</p>
      <p>${escapeHtml(t("home.overseasCard.region", { value: region }))}</p>
      <p class="small-note">${escapeHtml(t("home.overseasCard.origin", { value: formatClubName(originStep?.organization ?? t("common.pending")) }))}</p>
      <p class="small-note">${escapeHtml(t("home.overseasCard.path", { value: formatOverseasPathSummary(foreignStep) }))}</p>
      <a class="primary-link primary-link-inline" href="${buildPlayerDetailUrl(item.id)}">${escapeHtml(t("players.card.viewProfile"))}</a>
    </article>
  `;
}

function renderPlayerTableRow(player) {
  const primaryName = getPlayerPrimaryName(player);
  const secondaryNames = getPlayerSecondaryNames(player).join(" / ");
  const affiliation = getPlayerAffiliation(player);
  return `
    <tr>
      <td>
        <strong>${escapeHtml(primaryName)}</strong>
        <div class="small-note">${escapeHtml(secondaryNames || "-")}</div>
      </td>
      <td>${escapeHtml(formatCountryName(player.country))}</td>
      <td>${escapeHtml(formatAge(player.age))}</td>
      <td>${renderPlayerTableMarketValue(player)}</td>
      <td>${escapeHtml(affiliation.directoryTeam || "-")}</td>
      <td>${escapeHtml(formatLeagueSystem(player.currentLeagueSystem))}</td>
      <td>${escapeHtml((player.focus_tags ?? []).slice(0, 3).map(formatTag).join(" / ") || "-")}</td>
      <td><a class="inline-link" href="${buildPlayerDetailUrl(player.id)}">${escapeHtml(t("players.card.details"))}</a></td>
    </tr>
  `;
}

function renderPlayerTableMarketValue(player) {
  const current = player.market_value?.current;
  const peak = player.market_value?.peak;
  if (!current && !peak) {
    return "-";
  }

  return `
    ${current ? `<strong>${escapeHtml(formatMarketValuePoint(current))}</strong>` : `<span>${escapeHtml(t("playerDetail.status.marketValueUnavailable"))}</span>`}
    ${peak ? `<div class="small-note">${escapeHtml(t("players.table.marketValuePeak", { value: formatMarketValuePoint(peak) }))}</div>` : ""}
  `;
}

function renderDetailInfoCard(eyebrow, title, items) {
  return `
    <article class="stack-card info-card">
      <p class="eyebrow">${escapeHtml(eyebrow)}</p>
      <h3>${escapeHtml(title)}</h3>
      <dl class="info-list">
        ${items
          .map(
            (item) => `
              <div class="info-row">
                <dt>${escapeHtml(item.label)}</dt>
                <dd>${escapeHtml(item.value)}</dd>
              </div>
            `
          )
          .join("")}
      </dl>
    </article>
  `;
}

function renderStatusItem(label, value) {
  return `
    <div class="status-row">
      <dt>${escapeHtml(label)}</dt>
      <dd>${escapeHtml(value)}</dd>
    </div>
  `;
}

function getYouthSystemsPayload() {
  return state.overview?.youth_development_systems ?? { checked_at: null, systems: [] };
}

function getYouthCompetitionMap() {
  return new Map(
    getYouthSystemsPayload().systems.flatMap((system) =>
      (system.competitions ?? []).map((competition) => [competition.id, { ...competition, country: system.country }])
    )
  );
}

function buildPathwaysUrl(country, competitionId = "") {
  const params = new URLSearchParams();
  if (country) params.set("country", country);
  const suffix = competitionId ? `#${encodeURIComponent(competitionId)}` : "";
  return `./pathways.html?${params.toString()}${suffix}`;
}

function renderPlayerSourceLayers(player) {
  const layers = player.source_layers ?? [];
  if (layers.length === 0) {
    return `<div class="empty-inline">${escapeHtml(t("playerDetail.sources.empty"))}</div>`;
  }

  const order = [
    "afc-registration",
    "national-fa-profile",
    "school-profile",
    "university-profile",
    "club-academy-profile",
    "club-profile",
    "league-registration"
  ];
  const groups = new Map();
  for (const layer of layers) {
    if (!groups.has(layer.type)) groups.set(layer.type, []);
    groups.get(layer.type).push(layer);
  }

  return [...groups.entries()]
    .sort((left, right) => order.indexOf(left[0]) - order.indexOf(right[0]))
    .map(
      ([type, entries]) => `
        <section class="source-layer-group">
          <h3>${escapeHtml(getLabel(SOURCE_LAYER_TYPE_LABELS, type, type))}</h3>
          <div class="story-grid">
            ${entries
              .map(
                (layer) => `
                  <article class="stack-card source-layer-card">
                    <h4>${escapeHtml(layer.label)}</h4>
                    <p>${escapeHtml(localizeText(layer.claim))}</p>
                    <p class="small-note">${escapeHtml(t("playerDetail.sources.fields", { fields: layer.fields.join(", ") }))}</p>
                    <p class="small-note">${escapeHtml(t("playerDetail.sources.checked", {
                      date: formatDate(layer.checked_at),
                      confidence: getLabel(SOURCE_LAYER_CONFIDENCE_LABELS, layer.confidence, layer.confidence)
                    }))}</p>
                    <a class="inline-link" href="${escapeHtml(layer.url)}" target="_blank" rel="noreferrer">${escapeHtml(layer.url)}</a>
                  </article>
                `
              )
              .join("")}
          </div>
        </section>
      `
    )
    .join("");
}

function renderPlayerDetailPage() {
  const hero = document.querySelector("#playerDetailHero");
  const body = document.querySelector("#playerDetailBody");
  const stats = document.querySelector("#playerDetailStats");
  const marketValueHistory = document.querySelector("#playerMarketValueHistory");
  const pathwayTimeline = document.querySelector("#playerPathwayTimeline");
  const sourceLayers = document.querySelector("#playerSourceLayers");
  const participationList = document.querySelector("#playerParticipationList");
  const recentContributions = document.querySelector("#playerRecentContributions");
  const externalLinks = document.querySelector("#playerExternalLinks");

  const params = new URLSearchParams(window.location.search);
  const playerId = params.get("id");
  const player = state.enrichedPlayers.find((item) => item.id === playerId);

  if (!player) {
    document.title = t("page.player-detail.title");
    hero.innerHTML = `
      <div class="hero-copy">
        <p class="eyebrow">${escapeHtml(t("playerDetail.breadcrumb.detail"))}</p>
        <h1>${escapeHtml(t("playerDetail.notFound.title"))}</h1>
        <p class="hero-text">${escapeHtml(t("playerDetail.notFound.text"))}</p>
        <div class="hero-actions">
          <a class="primary-link" href="./players.html">${escapeHtml(t("playerDetail.notFound.back"))}</a>
        </div>
      </div>
    `;
    return;
  }

  const displayName = getPlayerPrimaryName(player);
  const nameMeta = getPlayerNameMeta(player);
  const names = getPlayerNames(player);
  const affiliation = getPlayerAffiliation(player);
  const birthYear = getBirthYear(player.birth_date);
  const marketValue = getPlayerMarketValueRecord(player);
  const transfermarktStatus = getTransfermarktStatusLabel(player);
  const currentMarketValue = marketValue?.current ? formatMarketValuePoint(marketValue.current) : null;
  const peakMarketValue = marketValue?.peak ? formatMarketValuePoint(marketValue.peak) : null;
  const verificationLabel = getLabel(
    VERIFICATION_STATUS_LABELS,
    player.verification?.status,
    player.verification?.status ?? "unverified"
  );

  document.title =
    state.language === "en" ? `${displayName} | Player Detail` : `${displayName} | 球员详情`;

  hero.innerHTML = `
    <div class="hero-copy">
      <p class="eyebrow">${escapeHtml(t("playerDetail.breadcrumb.detail"))}</p>
      <h1>${escapeHtml(displayName)}</h1>
      ${nameMeta ? `<p class="hero-side-note">${escapeHtml(nameMeta)}</p>` : ""}
      <p class="hero-text">${escapeHtml(buildPlayerHeroSummary(player, affiliation))}</p>
      <div class="chip-row">
        <span class="chip">${escapeHtml(formatCountryName(player.country))}</span>
        <span class="chip">${formatAgeBand(player.age_band)}</span>
        <span class="chip">${escapeHtml(affiliation.system)}</span>
        ${(player.focus_tags ?? []).slice(0, 5).map((tag) => `<span class="chip">${escapeHtml(formatTag(tag))}</span>`).join("")}
      </div>
      <div class="hero-actions detail-action-row">
        <a class="primary-link" href="#playerLinksSection">${escapeHtml(t("playerDetail.actions.links"))}</a>
        <a class="secondary-link" href="#playerCompetitionSection">${escapeHtml(t("playerDetail.actions.competition"))}</a>
      </div>
    </div>
    <aside class="hero-spotlight status-spotlight">
      <p class="eyebrow">${escapeHtml(t("playerDetail.status.eyebrow"))}</p>
      <h2>${escapeHtml(t("playerDetail.status.title"))}</h2>
      <dl class="status-list">
        ${renderStatusItem(t(affiliation.isTournamentSnapshot ? "playerDetail.status.registrationSnapshot" : "playerDetail.status.currentTeam"), affiliation.currentTeam)}
        ${renderStatusItem(t("playerDetail.status.transfermarkt"), transfermarktStatus)}
        ${renderStatusItem(
          t("playerDetail.status.marketValueCurrent"),
          currentMarketValue ??
            (hasTransfermarktLink(player)
              ? t("playerDetail.status.marketValueUnavailable")
              : t("playerDetail.status.marketValueMissing"))
        )}
        ${renderStatusItem(
          t("playerDetail.status.marketValuePeak"),
          peakMarketValue ??
            (hasTransfermarktLink(player)
              ? t("playerDetail.status.marketValueUnavailable")
              : t("playerDetail.status.marketValueMissing"))
        )}
        ${renderStatusItem(t("playerDetail.status.externalLinks"), String((player.external_links ?? []).length))}
        ${renderStatusItem(t("playerDetail.status.recentContributions"), String(player.recentContributions.length))}
        ${renderStatusItem(t("playerDetail.status.verification"), verificationLabel)}
      </dl>
      <p class="hero-side-note">${escapeHtml(t("playerDetail.status.lastChecked", { date: formatDate(getPlayerLastMarketValueCheck(player)) }))}</p>
      <p class="small-note">${escapeHtml(localizeText(player.verification?.notes, t("playerDetail.verification.noNote")))}</p>
      <p class="hero-side-note">${escapeHtml(t("playerDetail.marketValue.note"))}</p>
    </aside>
  `;

  const basicItems = [
    { label: t("playerDetail.stats.nameZh"), value: names.zh || t("common.pending") },
    ...(normalize(names.native) !== normalize(names.zh)
      ? [{ label: t("playerDetail.stats.nameNative"), value: names.native || t("common.pending") }]
      : []),
    { label: t("playerDetail.stats.nameEn"), value: names.en || t("common.pending") },
    { label: t("playerDetail.stats.birthYear"), value: birthYear },
    { label: t("playerDetail.stats.country"), value: formatCountryName(player.country) },
    { label: t("playerDetail.stats.position"), value: formatPosition(player.primary_position) },
    { label: t("playerDetail.stats.tags"), value: formatTagList((player.focus_tags ?? []).slice(0, 5)) }
  ];

  const affiliationItems = [
    { label: t(affiliation.isTournamentSnapshot ? "playerDetail.stats.registrationSnapshot" : "playerDetail.stats.currentTeam"), value: affiliation.currentTeam },
    { label: t("playerDetail.stats.parentClub"), value: affiliation.parentClub },
    { label: t("playerDetail.stats.currentSquad"), value: affiliation.squadLabel },
    { label: t("playerDetail.stats.currentLeague"), value: affiliation.system },
    { label: t("playerDetail.stats.organizationType"), value: affiliation.organizationTypeLabel },
    ...(affiliation.explicitParent
      ? [{ label: t("playerDetail.stats.parentOrganization"), value: affiliation.explicitParent }]
      : []),
    ...(affiliation.educationPartner
      ? [{ label: t("playerDetail.stats.educationPartner"), value: affiliation.educationPartner }]
      : [])
  ];

  const marketValueItems = [
    { label: t("playerDetail.stats.transfermarktStatus"), value: transfermarktStatus },
    {
      label: t("playerDetail.stats.marketValueCurrent"),
      value:
        currentMarketValue ??
        (hasTransfermarktLink(player)
          ? t("playerDetail.status.marketValueUnavailable")
          : t("playerDetail.status.marketValueMissing"))
    },
    {
      label: t("playerDetail.stats.marketValuePeak"),
      value:
        peakMarketValue ??
        (hasTransfermarktLink(player)
          ? t("playerDetail.status.marketValueUnavailable")
          : t("playerDetail.status.marketValueMissing"))
    },
    {
      label: t("playerDetail.stats.marketValueCurrentDate"),
      value: marketValue?.current?.date ? formatDate(marketValue.current.date) : t("common.pending")
    },
    {
      label: t("playerDetail.stats.marketValuePeakDate"),
      value: marketValue?.peak?.date ? formatDate(marketValue.peak.date) : t("common.pending")
    }
  ];

  stats.innerHTML = [
    renderDetailInfoCard(t("playerDetail.profile.eyebrow"), t("playerDetail.profile.title"), basicItems),
    renderDetailInfoCard(t("playerDetail.affiliation.eyebrow"), t("playerDetail.affiliation.title"), affiliationItems),
    renderDetailInfoCard(t("playerDetail.marketValue.eyebrow"), t("playerDetail.marketValue.title"), marketValueItems)
  ].join("");

  marketValueHistory.innerHTML = renderPlayerMarketValueHistory(player);

  sourceLayers.innerHTML = renderPlayerSourceLayers(player);

  const youthCompetitionMap = getYouthCompetitionMap();
  pathwayTimeline.innerHTML =
    (player.training_pathway ?? []).length > 0
      ? player.training_pathway
          .map(
            (step) => {
              const metaLabels = buildPathwayMetaLabels(step);
              if (step.organization_type) {
                metaLabels.push(getLabel(ORGANIZATION_TYPE_LABELS, step.organization_type, step.organization_type));
              }
              const competitionContexts = (step.competition_context_ids ?? [])
                .map((id) => youthCompetitionMap.get(id))
                .filter(Boolean);
              return `
              <article class="timeline-item">
                <p class="timeline-label">${escapeHtml(localizeText(step.stage_label))}</p>
                <h3>${escapeHtml(formatClubName(step.organization))}</h3>
                ${
                  metaLabels.length > 0
                    ? `
                      <div class="chip-row pathway-meta-row">
                        ${metaLabels.map((label) => `<span class="chip muted-chip">${escapeHtml(label)}</span>`).join("")}
                      </div>
                    `
                    : ""
                }
                ${
                  competitionContexts.length > 0
                    ? `<p class="small-note pathway-context-links"><strong>${escapeHtml(t("playerDetail.pathway.context"))}：</strong>${competitionContexts
                        .map(
                          (competition) => `<a class="inline-link" href="${buildPathwaysUrl(competition.country, competition.id)}">${escapeHtml(localizeText(competition.name))}</a>`
                        )
                        .join(" · ")}</p>`
                    : ""
                }
                ${step.note ? `<p class="small-note">${escapeHtml(localizeText(step.note))}</p>` : ""}
              </article>
            `;
            }
          )
          .join("")
      : `<div class="empty-inline">${escapeHtml(t("playerDetail.pathway.empty"))}</div>`;

  participationList.innerHTML =
    (player.tournament_participation ?? []).length > 0
      ? player.tournament_participation
          .map(
            (entry) => `
              <article class="stack-card">
                <h3>${
                  entry.competition_id && hasArchiveTournament(entry.competition_id)
                    ? `<a class="inline-link" href="${buildTournamentDetailUrl(entry.competition_id)}">${escapeHtml(localizeText(entry.label))}</a>`
                    : escapeHtml(localizeText(entry.label))
                }</h3>
                <p>${escapeHtml(entry.team ?? "-")} · ${escapeHtml(getLabel(SQUAD_STATUS_LABELS, entry.squad_status, entry.squad_status ?? "-"))}</p>
                ${
                  entry.competition_level
                    ? `<p class="small-note">${escapeHtml(t("playerDetail.participation.scope", {
                        level: formatCompetitionLevel(entry.competition_level),
                        date: formatDate(entry.stats_as_of)
                      }))}${entry.statistics_status === "partial" ? ` · ${escapeHtml(t("playerDetail.participation.partial"))}` : ""}</p>`
                    : ""
                }
                <p class="small-note">${escapeHtml(formatParticipationStatLine(entry))}</p>
                ${entry.source_checked_at ? `<p class="small-note">${escapeHtml(t("playerDetail.participation.sourceChecked", { date: formatDate(entry.source_checked_at) }))}</p>` : ""}
                ${entry.note ? `<p class="small-note">${escapeHtml(localizeText(entry.note))}</p>` : ""}
              </article>
            `
          )
          .join("")
      : `<div class="empty-inline">${escapeHtml(t("playerDetail.participation.empty"))}</div>`;

  recentContributions.innerHTML =
    player.recentContributions.length > 0
      ? player.recentContributions
          .map(
            (item) => `
              <article class="stack-card">
                <h3>${
                  item.tournamentId && hasArchiveTournament(item.tournamentId)
                    ? `<a class="inline-link" href="${buildTournamentDetailUrl(item.tournamentId)}">${escapeHtml(item.tournament)}</a>`
                    : escapeHtml(item.tournament)
                }</h3>
                <p>${escapeHtml(t("home.recent.matchLabel", { stage: localizeText(item.stage), date: formatDate(item.date), opponent: formatCountryName(item.opponent), score: item.score }))}</p>
                <p class="small-note">${formatContributionType(item.type)} · ${renderPlayerReference(item)}${item.minute ? ` ${escapeHtml(item.minute)}'` : ""} · ${formatContributionRole(item.role)}</p>
              </article>
            `
          )
          .join("")
      : `<div class="empty-inline">${escapeHtml(t("playerDetail.recent.empty"))}</div>`;

  externalLinks.innerHTML =
    (player.external_links ?? []).length > 0
      ? player.external_links
          .map(
            (link) => `
              <article class="stack-card">
                <h3>${escapeHtml(link.label)}</h3>
                <p class="small-note">${escapeHtml(getLabel(LINK_TYPE_LABELS, link.type ?? "external", link.type ?? "external"))}</p>
                ${link.note ? `<p class="small-note">${escapeHtml(localizeText(link.note))}</p>` : ""}
                <a class="inline-link" href="${link.url}" target="_blank" rel="noreferrer">${escapeHtml(link.url)}</a>
              </article>
            `
          )
          .join("")
      : `<div class="empty-inline">${escapeHtml(t("playerDetail.links.empty"))}</div>`;

  body.hidden = false;
}

function formatTournamentGroupName(name) {
  if (name === "Final round") {
    return t("tournamentDetail.field.group.finalRound");
  }
  const match = String(name ?? "").match(/^Group\s+(.+)$/i);
  return match
    ? t("tournamentDetail.field.group.group", { name: match[1] })
    : localizeText(name);
}

function getTournamentParticipantStatusLabel(status) {
  const keys = {
    complete: "tournamentDetail.field.participantsComplete",
    partial: "tournamentDetail.field.participantsPartial",
    "cancelled-snapshot": "tournamentDetail.field.participantsCancelled"
  };
  return t(keys[status] ?? "tournamentDetail.field.participantsPartial");
}

function getTournamentEntryStatusLabel(status) {
  return t(`tournamentDetail.field.entry.${status}`);
}

function formatTournamentQualifierPhase(phase) {
  const key = phase === "Development Phase" ? "development" : "qualification";
  return t(`tournamentDetail.field.phase.${key}`);
}

function renderTournamentGroupCard(group) {
  return `
    <article class="tournament-group-card">
      <h3>${escapeHtml(formatTournamentGroupName(group.name))}</h3>
      ${group.host ? `<p class="small-note">${escapeHtml(t("tournamentDetail.field.groupHost", { host: formatCountryName(group.host) }))}</p>` : ""}
      <div class="chip-row">
        ${(group.teams ?? []).map((team) => `<span class="chip">${escapeHtml(formatCountryName(team))}</span>`).join("")}
      </div>
    </article>
  `;
}

function renderTournamentField(tournament, elements) {
  const { section, meta, participants, finalDraw, qualifiers } = elements;
  if (!section || !tournament?.participants || !tournament?.final_draw) {
    if (section) section.hidden = true;
    return;
  }

  const participantRows = tournament.participants.teams ?? [];
  meta.textContent = t("tournamentDetail.field.meta", {
    count: participantRows.length,
    date: tournament.source_checked_at ? formatDate(tournament.source_checked_at) : t("common.pending")
  });

  participants.innerHTML = `
    <article class="stack-card tournament-field-block">
      <div class="section-head compact-head">
        <h3>${escapeHtml(t("tournamentDetail.field.participants"))}</h3>
        <span class="chip">${escapeHtml(getTournamentParticipantStatusLabel(tournament.participants.status))}</span>
      </div>
      <div class="chip-row">
        ${participantRows
          .map(
            (entry) => `
              <span class="chip tournament-team-chip">
                ${escapeHtml(formatCountryName(entry.team))}
                <small>${escapeHtml(getTournamentEntryStatusLabel(entry.entry_status))}</small>
              </span>
            `
          )
          .join("")}
      </div>
    </article>
  `;

  const draw = tournament.final_draw;
  const drawHeading = `<div class="section-head compact-head tournament-field-heading tournament-field-span"><h3>${escapeHtml(t("tournamentDetail.field.finalDraw"))}</h3></div>`;
  if (draw.groups?.length) {
    const note = draw.status === "cancelled"
      ? `<p class="small-note tournament-field-note">${escapeHtml(t("tournamentDetail.field.drawCancelled"))}</p>`
      : "";
    finalDraw.innerHTML = `${drawHeading}${note}${draw.groups.map(renderTournamentGroupCard).join("")}`;
  } else {
    finalDraw.innerHTML = `${drawHeading}<div class="empty-inline tournament-field-span">${escapeHtml(t("tournamentDetail.field.drawPending"))}</div>`;
  }

  const qualifierPhases = tournament.qualifiers ?? [];
  qualifiers.innerHTML = qualifierPhases.length
    ? `
      <div class="section-head compact-head tournament-field-heading">
        <h3>${escapeHtml(t("tournamentDetail.field.qualifiers"))}</h3>
      </div>
      ${qualifierPhases
        .map(
          (phase) => `
            <article class="stack-card tournament-field-block">
              <div class="section-head compact-head">
                <h3>${escapeHtml(formatTournamentQualifierPhase(phase.phase))}</h3>
                <span class="chip">${escapeHtml(t("tournamentDetail.field.phaseDates", {
                  start: formatDate(phase.date_range.start),
                  end: formatDate(phase.date_range.end)
                }))}</span>
              </div>
              <div class="tournament-group-grid">
                ${phase.groups.map(renderTournamentGroupCard).join("")}
              </div>
            </article>
          `
        )
        .join("")}
    `
    : "";

  section.hidden = false;
}

function renderTournamentDetailPage() {
  const hero = document.querySelector("#tournamentDetailHero");
  const body = document.querySelector("#tournamentDetailBody");
  const stats = document.querySelector("#tournamentDetailStats");
  const context = document.querySelector("#tournamentDetailContext");
  const fieldSection = document.querySelector("#tournamentDetailFieldSection");
  const fieldMeta = document.querySelector("#tournamentDetailFieldMeta");
  const participants = document.querySelector("#tournamentDetailParticipants");
  const finalDraw = document.querySelector("#tournamentDetailFinalDraw");
  const qualifiers = document.querySelector("#tournamentDetailQualifiers");
  const regionalHistorySection = document.querySelector("#tournamentDetailRegionalHistorySection");
  const regionalHistoryScope = document.querySelector("#tournamentDetailRegionalHistoryScope");
  const regionalHistorySummary = document.querySelector("#tournamentDetailRegionalHistorySummary");
  const regionalHistoryTable = document.querySelector("#tournamentDetailRegionalHistoryTable");
  const regionalWatchSection = document.querySelector("#tournamentDetailRegionalWatchSection");
  const regionalWatchTitle = document.querySelector("#tournamentDetailRegionalWatchTitle");
  const regionalWatchScope = document.querySelector("#tournamentDetailRegionalWatchScope");
  const regionalWatchGrid = document.querySelector("#tournamentDetailRegionalWatchGrid");
  const squad = document.querySelector("#tournamentDetailSquad");
  const matches = document.querySelector("#tournamentDetailMatches");
  const keyPlayers = document.querySelector("#tournamentDetailKeyPlayers");
  const sources = document.querySelector("#tournamentDetailSources");

  const params = new URLSearchParams(window.location.search);
  const tournamentId = params.get("id");
  const archiveTournament = getArchiveTournamentById(tournamentId);
  const focusTournament = getFocusTournamentById(tournamentId);

  if (!archiveTournament && !focusTournament) {
    document.title = t("page.tournament-detail.title");
    hero.innerHTML = `
      <div class="hero-copy">
        <p class="eyebrow">${escapeHtml(t("tournamentDetail.breadcrumb.detail"))}</p>
        <h1>${escapeHtml(t("tournamentDetail.notFound.title"))}</h1>
        <p class="hero-text">${escapeHtml(t("tournamentDetail.notFound.text"))}</p>
        <div class="hero-actions">
          <a class="primary-link" href="./tournaments.html">${escapeHtml(t("tournamentDetail.notFound.back"))}</a>
        </div>
      </div>
    `;
    return;
  }

  const displayName = archiveTournament?.competition_name ?? focusTournament?.name ?? t("common.pending");
  const displayRange = archiveTournament?.date_range ?? focusTournament?.date_range ?? null;
  const displayStatus = archiveTournament?.status ?? focusTournament?.status ?? "";
  const resultSummary = archiveTournament
    ? getTournamentResultSummary(archiveTournament)
    : formatStatus(displayStatus);
  const heroSummary = focusTournament?.headline ?? archiveTournament?.china_summary ?? t("common.pending");
  const heroMeta = [
    displayRange ? formatRange(displayRange) : "",
    archiveTournament?.host ? formatCountryName(archiveTournament.host) : ""
  ]
    .filter(Boolean)
    .join(" · ");

  document.title =
    state.language === "en" ? `${displayName} | Tournament Detail` : `${displayName} | 赛事详情`;

  hero.innerHTML = `
    <div class="hero-copy">
      <p class="eyebrow">${escapeHtml(t("tournamentDetail.hero.eyebrow"))}</p>
      <h1>${escapeHtml(displayName)}</h1>
      <p class="hero-text">${escapeHtml(localizeText(heroSummary))}</p>
      <div class="chip-row">
        ${archiveTournament?.level ? `<span class="chip">${formatLevelTag(archiveTournament.level)}</span>` : ""}
        ${displayStatus ? `<span class="chip">${formatStatus(displayStatus)}</span>` : ""}
        ${archiveTournament?.china_status ? `<span class="chip">${formatChinaStatus(archiveTournament.china_status)}</span>` : ""}
      </div>
    </div>
    <aside class="hero-spotlight">
      <p class="eyebrow">${escapeHtml(t("tournamentDetail.result.eyebrow"))}</p>
      <h2>${escapeHtml(resultSummary)}</h2>
      ${heroMeta ? `<p class="hero-side-note">${escapeHtml(heroMeta)}</p>` : ""}
    </aside>
  `;

  const statsItems = [
    { label: t("tournamentDetail.stats.result"), value: resultSummary },
    { label: t("tournamentDetail.stats.confederation"), value: archiveTournament?.confederation ?? "" },
    {
      label: t("tournamentDetail.stats.level"),
      value: archiveTournament?.level ? formatLevelTag(archiveTournament.level) : ""
    },
    {
      label: t("tournamentDetail.stats.dateRange"),
      value: displayRange ? formatRange(displayRange) : ""
    },
    {
      label: t("tournamentDetail.stats.host"),
      value: archiveTournament?.host ? formatCountryName(archiveTournament.host) : ""
    },
    {
      label: t("tournamentDetail.stats.status"),
      value: displayStatus ? formatStatus(displayStatus) : ""
    },
    {
      label: t("tournamentDetail.stats.chinaStage"),
      value: archiveTournament?.china_status ? formatChinaStatus(archiveTournament.china_status) : ""
    }
  ].filter((item) => item.value);

  stats.innerHTML = statsItems
    .map(
      (item) => `
        <article class="stat-card">
          <p class="stat-label">${escapeHtml(item.label)}</p>
          <p class="stat-value stat-value-small">${escapeHtml(item.value)}</p>
        </article>
      `
    )
    .join("");

  const focusTeams = focusTournament?.focus_teams ?? [];
  const focusNotes = focusTournament?.notes ?? [];
  context.innerHTML =
    focusTournament || archiveTournament
      ? `
        <article class="stack-card">
          <p class="timeline-label">${escapeHtml(t("tournamentDetail.context.headline"))}</p>
          <p>${escapeHtml(localizeText(focusTournament?.headline ?? archiveTournament?.china_summary ?? t("tournamentDetail.context.empty")))}</p>
          ${
            focusTeams.length > 0
              ? `
                <p class="timeline-label">${escapeHtml(t("tournamentDetail.context.focusTeams"))}</p>
                <div class="chip-row">
                  ${focusTeams.map((team) => `<span class="chip">${escapeHtml(formatCountryName(team))}</span>`).join("")}
                </div>
              `
              : ""
          }
          ${
            focusNotes.length > 0
              ? `
                <ul class="mini-bullet-list">
                  ${focusNotes.map((note) => `<li>${escapeHtml(localizeText(note))}</li>`).join("")}
                </ul>
              `
              : ""
          }
        </article>
      `
      : `<div class="empty-inline">${escapeHtml(t("tournamentDetail.context.empty"))}</div>`;

  renderTournamentField(archiveTournament, {
    section: fieldSection,
    meta: fieldMeta,
    participants,
    finalDraw,
    qualifiers
  });

  const regionalHistory = archiveTournament?.regional_history;
  regionalHistorySection.hidden = !regionalHistory;
  if (regionalHistory) {
    regionalHistoryScope.textContent = localizeText(regionalHistory.scope_note, t("common.pending"));
    regionalHistorySummary.innerHTML = (regionalHistory.team_summaries ?? [])
      .map(renderRegionalHistorySummaryCard)
      .join("");
    regionalHistoryTable.innerHTML = renderRegionalHistoryTable(regionalHistory);
  } else {
    regionalHistoryScope.textContent = "";
    regionalHistorySummary.innerHTML = "";
    regionalHistoryTable.innerHTML = "";
  }

  const regionalWatch = archiveTournament?.regional_watch;
  regionalWatchSection.hidden = !regionalWatch;
  if (regionalWatch) {
    if (regionalWatchTitle) {
      regionalWatchTitle.textContent = localizeText(regionalWatch.title, t("tournamentDetail.watch.title"));
    }
    regionalWatchScope.textContent = localizeText(regionalWatch.scope_note, t("common.pending"));
    regionalWatchGrid.innerHTML =
      (regionalWatch.team_groups ?? []).length > 0
        ? regionalWatch.team_groups.map((group) => renderRegionalWatchGroupCard(group, regionalWatch)).join("")
        : `<div class="empty-inline">${escapeHtml(t("tournamentDetail.watch.empty"))}</div>`;
  } else {
    if (regionalWatchTitle) {
      regionalWatchTitle.textContent = t("tournamentDetail.watch.title");
    }
    regionalWatchScope.textContent = "";
    regionalWatchGrid.innerHTML = "";
  }

  const displayMatches = getDisplayChinaMatches(archiveTournament?.china_matches);
  const squadEntries = archiveTournament ? getTournamentSquadEntries(archiveTournament) : [];
  const latestRosterView = archiveTournament?.latest_public_roster_view ?? null;
  squad.innerHTML =
    latestRosterView
      ? renderTournamentLatestRosterView(latestRosterView, squadEntries)
      : squadEntries.length > 0
        ? squadEntries.map(renderTournamentSquadCard).join("")
        : `<div class="empty-inline">${escapeHtml(t("tournamentDetail.squad.empty"))}</div>`;

  matches.innerHTML =
    displayMatches.length > 0
      ? displayMatches.map(renderTournamentDetailMatchCard).join("")
      : `<div class="empty-inline">${escapeHtml(t("tournaments.archive.noChinaMatches"))}</div>`;

  keyPlayers.innerHTML =
    (archiveTournament?.china_key_players ?? []).length > 0
      ? archiveTournament.china_key_players.map(renderTournamentKeyPlayerCard).join("")
      : `<div class="empty-inline">${escapeHtml(t("tournamentDetail.keyPlayers.empty"))}</div>`;

  const mergedLinks = mergeTournamentLinks(archiveTournament, focusTournament);
  sources.innerHTML =
    mergedLinks.length > 0
      ? `
        <article class="stack-card">
          <div class="pill-row">${renderLinkPills(mergedLinks)}</div>
        </article>
      `
      : `<div class="empty-inline">${escapeHtml(t("common.noLinks"))}</div>`;

  body.hidden = false;
}

function getTransfermarktLink(player) {
  return (
    (player.external_links ?? []).find(
      (link) =>
        normalize(link.label).includes("transfermarkt") || normalize(link.url).includes("transfermarkt")
    ) ?? null
  );
}

function extractTransfermarktPlayerId(url) {
  return String(url ?? "").match(/spieler\/(\d+)/i)?.[1] ?? "";
}

function hasTransfermarktLink(player) {
  return Boolean(getTransfermarktLink(player));
}

function hasTransfermarktPlayerLink(player) {
  return Boolean(extractTransfermarktPlayerId(getTransfermarktLink(player)?.url));
}

function getPlayerMarketValueRecord(player) {
  return player.market_value && typeof player.market_value === "object" ? player.market_value : null;
}

function getPlayerMarketValueDisplaySeries(player) {
  const record = getPlayerMarketValueRecord(player);
  if (Array.isArray(record?.history) && record.history.length > 0) {
    return {
      provider: record.source?.provider ?? "Transfermarkt",
      sourceUrl: record.source?.market_value_url ?? record.source?.profile_url ?? "",
      checkedAt: record.checked_at,
      history: record.history,
      isAlternative: false
    };
  }

  const alternative = (record?.alternatives ?? []).find(
    (item) => Array.isArray(item?.history) && item.history.length > 0
  );
  if (!alternative) {
    return null;
  }

  return {
    provider: alternative.source?.provider ?? "Alternative provider",
    sourceUrl: alternative.source?.profile_url ?? "",
    checkedAt: alternative.checked_at,
    history: alternative.history,
    isAlternative: true
  };
}

function buildMarketValueChartPoints(history, width, height, padding) {
  const timestamps = history.map((point) => Date.parse(point.date));
  const values = history.map((point) => point.eur);
  const minTime = Math.min(...timestamps);
  const maxTime = Math.max(...timestamps);
  const maxValue = Math.max(...values);
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  return history.map((point, index) => {
    const x =
      minTime === maxTime
        ? width / 2
        : padding + ((timestamps[index] - minTime) / (maxTime - minTime)) * chartWidth;
    const y = height - padding - (point.eur / maxValue) * chartHeight;
    return { ...point, x, y };
  });
}

function renderPlayerMarketValueHistory(player) {
  const series = getPlayerMarketValueDisplaySeries(player);
  if (!series) {
    return `<div class="empty-inline">${escapeHtml(t("playerDetail.marketHistory.empty"))}</div>`;
  }

  const width = 720;
  const height = 260;
  const padding = 34;
  const points = buildMarketValueChartPoints(series.history, width, height, padding);
  const linePoints = points.map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(" ");
  const providerLabel = t("playerDetail.marketHistory.source", { provider: series.provider });
  const providerMarkup = series.sourceUrl
    ? `<a class="inline-link" href="${escapeHtml(series.sourceUrl)}" target="_blank" rel="noreferrer">${escapeHtml(providerLabel)}</a>`
    : `<span>${escapeHtml(providerLabel)}</span>`;

  return `
    <div class="market-history-meta">
      ${providerMarkup}
      <span>${escapeHtml(t("playerDetail.marketHistory.updated", { date: formatDate(series.checkedAt) }))}</span>
    </div>
    <div class="market-history-chart-wrap">
      <svg class="market-history-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(t("playerDetail.marketHistory.title"))}">
        <line class="market-history-axis" x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}"></line>
        <line class="market-history-axis" x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}"></line>
        ${points.length > 1 ? `<polyline class="market-history-line" points="${linePoints}"></polyline>` : ""}
        ${points
          .map(
            (point) => `
              <g>
                <circle class="market-history-point" cx="${point.x.toFixed(1)}" cy="${point.y.toFixed(1)}" r="5"></circle>
                <title>${escapeHtml(`${formatDate(point.date)} · ${formatMarketValuePoint(point)}`)}</title>
              </g>
            `
          )
          .join("")}
      </svg>
    </div>
    <div class="market-history-table-wrap">
      <table class="market-history-table">
        <thead><tr><th>${escapeHtml(t("playerDetail.marketHistory.date"))}</th><th>${escapeHtml(t("playerDetail.marketHistory.value"))}</th></tr></thead>
        <tbody>
          ${[...series.history]
            .reverse()
            .map(
              (point) => `<tr><td>${escapeHtml(formatDate(point.date))}</td><td>${escapeHtml(formatMarketValuePoint(point))}</td></tr>`
            )
            .join("")}
        </tbody>
      </table>
    </div>
    ${series.isAlternative ? `<p class="small-note">${escapeHtml(t("playerDetail.marketHistory.providerNote"))}</p>` : ""}
  `;
}

function formatMarketValueAmount(value) {
  if (typeof value !== "number" || value <= 0) {
    return t("playerDetail.status.marketValueUnavailable");
  }

  if (value >= 1_000_000) {
    return `€${(value / 1_000_000).toFixed(2)}m`;
  }

  return `€${(value / 1_000).toFixed(2)}k`;
}

function formatMarketValuePoint(point) {
  if (!point) {
    return t("playerDetail.status.marketValueUnavailable");
  }

  return formatMarketValueAmount(point.eur);
}

function getTransfermarktStatusLabel(player) {
  if (!hasTransfermarktLink(player)) {
    return t("playerDetail.status.transfermarktMissing");
  }

  if (!hasTransfermarktPlayerLink(player)) {
    return t("playerDetail.status.transfermarktRosterOnly");
  }

  return t("playerDetail.status.transfermarktLinked");
}

function getPlayerLastMarketValueCheck(player) {
  return getPlayerMarketValueRecord(player)?.checked_at ?? player.verification?.last_checked ?? pageDate;
}

function buildPlayerCardMarketValueSummary(player) {
  const record = getPlayerMarketValueRecord(player);
  const currentValue = record?.current ? formatMarketValuePoint(record.current) : "";
  const peakValue = record?.peak ? formatMarketValuePoint(record.peak) : "";

  if (currentValue && peakValue) {
    return t("players.card.marketValueBoth", {
      current: currentValue,
      peak: peakValue
    });
  }

  if (currentValue) {
    return t("players.card.marketValueCurrentOnly", { current: currentValue });
  }

  if (peakValue) {
    return t("players.card.marketValuePeakOnly", { peak: peakValue });
  }

  return "";
}

function getPathwaysSystem(country = state.pathwaysCountry) {
  return getYouthSystemsPayload().systems.find((system) => system.country === country) ?? null;
}

function getCompetitionSamplePlayers(system, competition) {
  return state.enrichedPlayers.filter(
    (player) =>
      player.country === system.country &&
      competition.organization_types.includes(player.organizationType) &&
      (player.tournament_participation ?? []).some((entry) =>
        ["afc-u17-2026", "afc-u23-2026"].includes(entry.competition_id)
      )
  );
}

function buildCompetitionSampleUrl(system, competition) {
  const params = new URLSearchParams({ country: system.country });
  if (competition.organization_types.length === 1) {
    params.set("organizationType", competition.organization_types[0]);
  }
  return `./players.html?${params.toString()}`;
}

function formatYouthCoachOrganizationType(value) {
  const labels = {
    "campus-school": { zh: "校园足球", en: "School football" },
    "football-school": { zh: "足球学校", en: "Football school" },
    "independent-base": { zh: "独立基地", en: "Independent academy" },
    "independent-project": { zh: "民间青训项目", en: "Independent youth project" },
    "private-academy": { zh: "民办青训机构", en: "Private academy" },
    "professional-academy": { zh: "职业俱乐部青训", en: "Professional club academy" },
    "sports-school": { zh: "体育学校", en: "Sports school" },
    "academy-mixed": { zh: "综合青训机构", en: "Mixed academy" }
  };
  return getLabel(labels, value, value);
}

function formatYouthCoachAgeBand(value) {
  const labels = {
    "primary-school": { zh: "小学", en: "Primary school" },
    "high-school": { zh: "高中", en: "High school" },
    "youth-mixed": { zh: "多年龄段青训", en: "Mixed youth ages" },
    "middle-school": { zh: "初中", en: "Middle school" },
    youth: { zh: "青少年", en: "Youth" },
    u12: { zh: "U12", en: "U12" },
    u9: { zh: "U9", en: "U9" },
    u13: { zh: "U13", en: "U13" },
    u14: { zh: "U14", en: "U14" },
    u15: { zh: "U15", en: "U15" },
    u16: { zh: "U16", en: "U16" },
    u17: { zh: "U17", en: "U17" },
    u19: { zh: "U19", en: "U19" }
  };
  return getLabel(labels, value, value);
}

function formatYouthCoachPeriod(period) {
  if (!period?.start) {
    return t("common.pending");
  }
  const end = period.end ?? (state.language === "en" ? "present" : "至今");
  return `${period.start}–${end}`;
}

function renderDevelopmentCoachCard(coach) {
  const sources = coach.source_links ?? [];
  const location = [coach.organization?.province, coach.organization?.city].filter(Boolean).join(" · ");
  return `
    <article class="player-card coach-card">
      <div class="chip-row">
        <span class="chip">${escapeHtml(formatYouthCoachOrganizationType(coach.organization?.type))}</span>
        ${(coach.age_bands ?? []).map((ageBand) => `<span class="chip">${escapeHtml(formatYouthCoachAgeBand(ageBand))}</span>`).join("")}
      </div>
      <h3>${escapeHtml(localizeText(coach.name))}</h3>
      <p>${escapeHtml(coach.role)}</p>
      <p class="small-note">${escapeHtml(coach.organization?.name ?? t("common.pending"))}${location ? ` · ${escapeHtml(location)}` : ""}</p>
      <p>${escapeHtml(coach.profile_summary)}</p>
      <p class="small-note">${escapeHtml(t("coaches.development.period", { value: formatYouthCoachPeriod(coach.period) }))} · ${escapeHtml(t("coaches.development.sources", { count: sources.length }))}</p>
      <div class="chip-row">${(coach.methodology_tags ?? []).map((tag) => `<span class="chip">${escapeHtml(tag)}</span>`).join("")}</div>
      <div class="source-link-grid">
        ${sources.map((source) => `<a href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer"><span>${escapeHtml(source.label)}</span><strong>↗</strong></a>`).join("")}
      </div>
    </article>
  `;
}

function renderNationalYouthCoachCycle(cycle) {
  const headCoach = state.language === "en"
    ? cycle.head_coach?.name
    : cycle.head_coach?.local_name || cycle.head_coach?.name;
  return `
    <article class="story-card">
      <div class="chip-row"><span class="chip">${escapeHtml(cycle.team_label)}</span><span class="chip">${escapeHtml(cycle.age_line)}</span></div>
      <h3>${escapeHtml(t("coaches.national.coach", { value: headCoach }))}</h3>
      <p>${escapeHtml(cycle.current_stage)}</p>
      ${cycle.latest_camp ? `<p class="small-note">${escapeHtml(t("coaches.national.latest", { value: cycle.latest_camp.label }))}<br>${escapeHtml(t("coaches.national.window", { value: cycle.latest_camp.window }))}<br>${escapeHtml(cycle.latest_camp.purpose)}</p>` : ""}
      <p class="timeline-label">${escapeHtml(t("coaches.national.staff"))}</p>
      <ul class="mini-bullet-list">${(cycle.staff ?? []).map((group) => `<li><strong>${escapeHtml(group.role)}</strong>：${escapeHtml(group.members.join("、"))}</li>`).join("")}</ul>
      <p class="timeline-label">${escapeHtml(t("coaches.national.sources"))}</p>
      <div class="source-link-grid">${(cycle.source_links ?? []).map((source) => `<a href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer"><span>${escapeHtml(source.label)}</span><strong>↗</strong></a>`).join("")}</div>
    </article>
  `;
}

function renderCoachesPage() {
  const development = state.overview?.china_youth_development_coaches;
  const national = state.overview?.china_men_youth_coaches;
  const developmentCoaches = development?.coaches ?? [];
  const nationalCycles = national?.team_cycles ?? [];
  const coverage = document.querySelector("#coachesCoverage");
  const checkedAt = document.querySelector("#coachesCheckedAt");
  const developmentGrid = document.querySelector("#developmentCoachGrid");
  const nationalGrid = document.querySelector("#nationalCoachGrid");
  const nationalNote = document.querySelector("#nationalCoachNote");
  const watchlist = document.querySelector("#coachWatchlist");

  coverage.textContent = t("coaches.coverage.value", {
    development: developmentCoaches.length,
    national: nationalCycles.length
  });
  checkedAt.textContent = t("coaches.coverage.checked", {
    development: formatDate(development?.last_checked),
    national: formatDate(national?.last_checked)
  });
  developmentGrid.innerHTML = developmentCoaches.map(renderDevelopmentCoachCard).join("");
  nationalNote.textContent = national?.scope_note ?? "";
  nationalGrid.innerHTML = nationalCycles.map(renderNationalYouthCoachCycle).join("");
  watchlist.innerHTML = (development?.watchlist ?? []).map((item) => `
    <article class="stack-card">
      <h3>${escapeHtml(item.organization)}</h3>
      <p>${escapeHtml(t("coaches.watchlist.need", { value: item.need }))}</p>
    </article>
  `).join("");
}

function initializePathwaysPage() {
  const params = new URLSearchParams(window.location.search);
  const requestedCountry = params.get("country");
  const countries = getYouthSystemsPayload().systems.map((system) => system.country);
  if (countries.includes(requestedCountry)) {
    state.pathwaysCountry = requestedCountry;
  }

  document.querySelector("#pathwaysCountryTabs")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-country]");
    if (!button) return;
    state.pathwaysCountry = button.dataset.country;
    replaceQueryParams({ country: state.pathwaysCountry });
    renderPathwaysPage();
  });
}

function renderPathwaysPage() {
  const payload = getYouthSystemsPayload();
  const system = getPathwaysSystem();
  const tabs = document.querySelectorAll("#pathwaysCountryTabs [data-country]");
  const intro = document.querySelector("#pathwaysSystemIntro");
  const competitionGrid = document.querySelector("#pathwaysCompetitionGrid");
  const sources = document.querySelector("#pathwaysSources");
  const coverage = document.querySelector("#pathwaysCoverage");
  const checkedAt = document.querySelector("#pathwaysCheckedAt");
  if (!system || !intro || !competitionGrid || !sources) return;

  tabs.forEach((button) => button.classList.toggle("is-active", button.dataset.country === system.country));
  const systemNodeCount = payload.systems.reduce((total, item) => total + item.competitions.length, 0);
  coverage.textContent = t("pathways.meta.coverage", {
    countries: payload.systems.length,
    count: systemNodeCount
  });
  checkedAt.textContent = t("pathways.meta.checked", { date: formatDate(payload.checked_at) });

  intro.innerHTML = `
    <div>
      <p class="eyebrow">${escapeHtml(formatCountryName(system.country))}</p>
      <h2>${escapeHtml(localizeText(system.name))}</h2>
      <p>${escapeHtml(localizeText(system.summary))}</p>
    </div>
    <div class="registration-card-grid">
      ${system.registration_categories
        .map(
          (category) => `
            <article class="stack-card">
              <h3>${escapeHtml(localizeText(category.label))}</h3>
              <p class="small-note">${escapeHtml(t("pathways.organizationTypes", {
                value: category.organization_types
                  .map((type) => getLabel(ORGANIZATION_TYPE_LABELS, type, type))
                  .join(" / ")
              }))}</p>
              <a class="inline-link" href="${escapeHtml(category.source_url)}" target="_blank" rel="noreferrer">${escapeHtml(t("pathways.registration", { value: localizeText(category.label) }))}</a>
            </article>
          `
        )
        .join("")}
    </div>
  `;

  const competitions = [...system.competitions].sort((left, right) => {
    const leftTier = left.tier ?? 99;
    const rightTier = right.tier ?? 99;
    return leftTier - rightTier || left.competition_type.localeCompare(right.competition_type);
  });
  competitionGrid.innerHTML = competitions
    .map((competition) => {
      const samplePlayers = getCompetitionSamplePlayers(system, competition);
      return `
        <article id="${escapeHtml(competition.id)}" class="system-card">
          <div class="chip-row">
            <span class="chip">${escapeHtml(getLabel(YOUTH_COMPETITION_TYPE_LABELS, competition.competition_type, competition.competition_type))}</span>
            ${competition.tier !== undefined ? `<span class="chip">Tier ${escapeHtml(String(competition.tier))}</span>` : ""}
          </div>
          <h3>${escapeHtml(localizeText(competition.name))}</h3>
          <p>${escapeHtml(localizeText(competition.stable_structure))}</p>
          <p class="small-note">${escapeHtml(t("pathways.organizationTypes", {
            value: competition.organization_types.map((type) => getLabel(ORGANIZATION_TYPE_LABELS, type, type)).join(" / ")
          }))}</p>
          ${
            competition.annual_snapshot
              ? `<p class="small-note snapshot-note">${escapeHtml(t("pathways.snapshot", {
                  season: competition.annual_snapshot.season,
                  note: localizeText(competition.annual_snapshot.note)
                }))}</p>`
              : ""
          }
          <div class="system-card-actions">
            <a class="inline-link" href="${escapeHtml(competition.source_url)}" target="_blank" rel="noreferrer">${escapeHtml(t("pathways.sources.title"))}</a>
            ${
              samplePlayers.length > 0
                ? `<a class="primary-link primary-link-inline" href="${buildCompetitionSampleUrl(system, competition)}">${escapeHtml(t("pathways.viewPlayers", { count: samplePlayers.length }))}</a>`
                : `<span class="small-note">${escapeHtml(t("pathways.noPlayers"))}</span>`
            }
          </div>
        </article>
      `;
    })
    .join("");

  sources.innerHTML = system.source_links
    .map(
      (source) => `
        <article class="stack-card">
          <h3>${escapeHtml(source.label)}</h3>
          <p class="small-note">${escapeHtml(t("pathways.sourceChecked", { date: formatDate(source.checked_at) }))}</p>
          <a class="inline-link" href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">${escapeHtml(source.url)}</a>
        </article>
      `
    )
    .join("");

  const hashTarget = window.location.hash ? document.getElementById(decodeURIComponent(window.location.hash.slice(1))) : null;
  hashTarget?.scrollIntoView({ block: "center" });
}

function getCatalogQuality(kind, entry) {
  const published = state.meta?.catalog_quality?.[kind]?.[entry.id];
  if (published) return published;
  const sourceTiers = (entry.sources ?? []).map(getSourceTier).filter(Number.isInteger);
  return {
    id: entry.id,
    status: deriveQualityStatus({
      verificationStatus: entry.verification_status,
      confidence: entry.confidence,
      missingFields: entry.missing_fields ?? [],
      sources: entry.sources ?? []
    }),
    source_tier: sourceTiers.length > 0 ? Math.min(...sourceTiers) : null,
    checked_at: entry.checked_at ?? null,
    missing_fields: entry.missing_fields ?? []
  };
}

function initializeDataCenterPage() {
  const params = new URLSearchParams(window.location.search);
  const allowedViews = new Set(["quality", "countries", "projects", "coaches"]);
  state.dataCenter.view = allowedViews.has(params.get("view")) ? params.get("view") : "quality";
  state.dataCenter.projectQuery = params.get("pq") ?? "";
  state.dataCenter.projectCountry = params.get("pcountry") ?? "all";
  state.dataCenter.projectCategory = params.get("pcategory") ?? "all";
  state.dataCenter.projectStatus = params.get("pstatus") ?? "all";
  state.dataCenter.coachQuery = params.get("cq") ?? "";
  state.dataCenter.coachCategory = params.get("ccategory") ?? "all";
  state.dataCenter.coachCountry = params.get("ccountry") ?? "all";
  state.dataCenter.coachStatus = params.get("cstatus") ?? "all";

  document.querySelector("#dataViewTabs")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-view]");
    if (!button) return;
    state.dataCenter.view = button.dataset.view;
    replaceQueryParams({ view: state.dataCenter.view });
    renderDataCenterView();
  });

  const controls = [
    ["#dataProjectQuery", "input", "projectQuery", "pq"],
    ["#dataProjectCountry", "change", "projectCountry", "pcountry"],
    ["#dataProjectCategory", "change", "projectCategory", "pcategory"],
    ["#dataProjectStatus", "change", "projectStatus", "pstatus"],
    ["#dataCoachQuery", "input", "coachQuery", "cq"],
    ["#dataCoachCategory", "change", "coachCategory", "ccategory"],
    ["#dataCoachCountry", "change", "coachCountry", "ccountry"],
    ["#dataCoachStatus", "change", "coachStatus", "cstatus"]
  ];
  for (const [selector, eventName, stateKey, queryKey] of controls) {
    document.querySelector(selector)?.addEventListener(eventName, (event) => {
      state.dataCenter[stateKey] = event.target.value;
      replaceQueryParams({ [queryKey]: event.target.value });
      if (stateKey.startsWith("project")) renderProjectDirectory();
      else renderCoachDirectory();
    });
  }
}

function renderDataCenterPage() {
  renderDataBuildMeta();
  renderDataQuality();
  renderDataCountryComparison();
  renderDataDirectoryControls();
  renderProjectDirectory();
  renderCoachDirectory();
  renderDataCenterView();
}

function renderDataCenterView() {
  document.querySelectorAll("#dataViewTabs [data-view]").forEach((button) => {
    const active = button.dataset.view === state.dataCenter.view;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", String(active));
  });
  document.querySelectorAll("[data-panel]").forEach((panel) => {
    panel.hidden = panel.dataset.panel !== state.dataCenter.view;
  });
}

function renderDataBuildMeta() {
  const node = document.querySelector("#dataBuildMeta");
  const notice = document.querySelector("#dataSampleNotice");
  if (!node) return;
  if (!state.meta) {
    node.innerHTML = `
      <p class="eyebrow">${escapeHtml(t("dataCenter.meta.eyebrow"))}</p>
      <p class="hero-side-note">${escapeHtml(t("dataCenter.meta.unavailable"))}</p>
    `;
    return;
  }
  if (notice) notice.textContent = localizeText(state.meta.sample_notice, t("dataCenter.sampleNotice"));
  const commit = state.meta.build?.commit ? state.meta.build.commit.slice(0, 10) : t("dataCenter.meta.unstamped");
  node.innerHTML = `
    <p class="eyebrow">${escapeHtml(t("dataCenter.meta.eyebrow"))}</p>
    <h2>${escapeHtml(state.meta.build?.status === "deployed" ? t("dataCenter.meta.deployed") : t("dataCenter.meta.unstamped"))}</h2>
    <p class="hero-side-note">${escapeHtml(t("dataCenter.meta.generated", { date: formatDate(state.meta.generated_at) }))}</p>
    <p class="hero-side-note">${escapeHtml(t("dataCenter.meta.commit", { value: commit }))}</p>
  `;
}

function renderDataQuality() {
  const summary = document.querySelector("#dataQualitySummary");
  const grid = document.querySelector("#dataQualityDatasets");
  const empty = document.querySelector("#dataQualityEmpty");
  const meta = state.meta;
  if (!summary || !grid || !empty) return;
  if (!meta) {
    summary.innerHTML = "";
    grid.innerHTML = "";
    empty.textContent = t(state.dataCenter.metaError ? "dataCenter.quality.loadError" : "dataCenter.quality.empty");
    empty.hidden = false;
    return;
  }
  empty.hidden = true;
  const metrics = [
    [meta.coverage_summary.dataset_count, t("dataCenter.quality.datasets")],
    [meta.coverage_summary.record_count, t("dataCenter.quality.records")],
    [meta.coverage_summary.stale_records, t("dataCenter.quality.stale")],
    [meta.coverage_summary.needs_review_records, t("dataCenter.quality.review")]
  ];
  summary.innerHTML = metrics
    .map(([value, label]) => `<div class="overview-item"><strong class="overview-value">${escapeHtml(value)}</strong><span class="overview-label">${escapeHtml(label)}</span></div>`)
    .join("");
  grid.innerHTML = meta.datasets.map(renderDatasetQualityCard).join("");
}

function renderDatasetQualityCard(dataset) {
  const statusChips = Object.entries(dataset.quality)
    .filter(([, count]) => count > 0)
    .map(([status, count]) => `<span class="chip quality-chip quality-${escapeHtml(status)}">${escapeHtml(getLabel(DATA_QUALITY_STATUS_LABELS, status, status))} ${escapeHtml(count)}</span>`)
    .join("");
  const sourceTiers = Object.entries(dataset.source_tiers)
    .filter(([, count]) => count > 0)
    .map(([tier, count]) => `${getLabel(DATA_SOURCE_TIER_LABELS, tier, tier)}: ${count}`)
    .join(" · ");
  const missing = dataset.missing_fields.length > 0
    ? dataset.missing_fields.slice(0, 5).map((entry) => `${humanizeTag(entry.field)} (${entry.count})`).join(" · ")
    : t("dataCenter.quality.noMissing");
  return `
    <article class="data-quality-card">
      <div class="section-head compact-head">
        <h3>${escapeHtml(localizeText(dataset.label, dataset.id))}</h3>
        <strong>${escapeHtml(dataset.record_count)}</strong>
      </div>
      <div class="chip-row">${statusChips}</div>
      <p class="small-note">${escapeHtml(t("dataCenter.quality.checked", {
        oldest: dataset.checked_at.oldest ? formatDate(dataset.checked_at.oldest) : t("common.pending"),
        newest: dataset.checked_at.newest ? formatDate(dataset.checked_at.newest) : t("common.pending")
      }))}</p>
      <p><strong>${escapeHtml(t("dataCenter.quality.sourceTier"))}</strong><br><span class="small-note">${escapeHtml(sourceTiers)}</span></p>
      <p><strong>${escapeHtml(t("dataCenter.quality.missing"))}</strong><br><span class="small-note">${escapeHtml(missing)}</span></p>
    </article>
  `;
}

function renderDataCountryComparison() {
  const matrix = document.querySelector("#dataPathwayComparison");
  const matrixEmpty = document.querySelector("#dataCountriesEmpty");
  const honoursNode = document.querySelector("#dataHonoursTables");
  const honoursEmpty = document.querySelector("#dataHonoursEmpty");
  if (!matrix || !matrixEmpty || !honoursNode || !honoursEmpty) return;
  const rows = buildYouthSystemComparison(state.overview ?? {});
  matrixEmpty.textContent = t(state.dataCenter.overviewError ? "dataCenter.countries.loadError" : "dataCenter.countries.empty");
  matrixEmpty.hidden = rows.length > 0;
  matrix.innerHTML = rows.length === 0 ? "" : `
    <table class="data-table">
      <thead><tr>
        <th>${escapeHtml(t("dataCenter.countries.country"))}</th>
        <th>${escapeHtml(t("dataCenter.countries.nodes"))}</th>
        <th>${escapeHtml(t("dataCenter.countries.categories"))}</th>
        <th>${escapeHtml(t("dataCenter.countries.ages"))}</th>
        <th>${escapeHtml(t("dataCenter.countries.organizations"))}</th>
        <th>${escapeHtml(t("dataCenter.countries.types"))}</th>
        <th>${escapeHtml(t("dataCenter.countries.sources"))}</th>
      </tr></thead>
      <tbody>${rows.map((row) => `
        <tr>
          <th>${escapeHtml(formatCountryName(row.country))}</th>
          <td>${escapeHtml(row.system_nodes)}</td>
          <td>${escapeHtml(row.registration_categories)}</td>
          <td>${escapeHtml(row.age_bands.join(" / "))}</td>
          <td>${escapeHtml(row.organization_types.map((type) => getLabel(ORGANIZATION_TYPE_LABELS, type, type)).join(" / "))}</td>
          <td>${escapeHtml(row.programme_types.map((type) => getLabel(YOUTH_COMPETITION_TYPE_LABELS, type, type)).join(" / "))}</td>
          <td>${escapeHtml(row.source_count)}<br><span class="small-note">${escapeHtml(formatDate(row.checked_at))}</span></td>
        </tr>
      `).join("")}</tbody>
    </table>
  `;
  const honours = buildU20Honours(state.overview ?? {});
  const hasHonours = honours.fifa.editions > 0 || honours.afc.editions > 0;
  honoursEmpty.textContent = t(state.dataCenter.overviewError ? "dataCenter.honours.loadError" : "dataCenter.honours.empty");
  honoursEmpty.hidden = hasHonours;
  honoursNode.innerHTML = hasHonours ? [
    ["FIFA U20", honours.fifa],
    ["AFC U20", honours.afc]
  ].map(([label, group]) => renderHonoursTable(label, group)).join("") : "";
}

function renderHonoursTable(label, group) {
  return `
    <article class="data-honours-card">
      <div class="section-head compact-head"><h3>${escapeHtml(label)}</h3><span class="small-note">${escapeHtml(t("dataCenter.honours.editions", { count: group.editions }))}</span></div>
      <div class="table-shell">
        <table class="data-table compact-table">
          <thead><tr><th>${escapeHtml(t("dataCenter.honours.team"))}</th><th>${escapeHtml(t("dataCenter.honours.titles"))}</th><th>${escapeHtml(t("dataCenter.honours.runners"))}</th><th>${escapeHtml(t("dataCenter.honours.finals"))}</th></tr></thead>
          <tbody>${group.rows.map((row) => `<tr><th>${escapeHtml(row.team)}</th><td>${row.titles}</td><td>${row.runner_ups}</td><td>${row.finals}</td></tr>`).join("")}</tbody>
        </table>
      </div>
    </article>
  `;
}

function renderDataDirectoryControls() {
  const projects = buildProjectCatalog(state.overview ?? {});
  const coaches = buildCoachCatalog(state.overview ?? {});
  const qualityOptions = Object.keys(DATA_QUALITY_STATUS_LABELS).map((value) => ({ value, label: getLabel(DATA_QUALITY_STATUS_LABELS, value, value) }));
  const projectCountries = [...new Set(projects.map((entry) => entry.country))].sort().map((value) => ({ value, label: formatCountryName(value) }));
  const projectCategories = [...new Set(projects.map((entry) => entry.category))].map((value) => ({ value, label: getLabel(DATA_PROJECT_CATEGORY_LABELS, value, value) }));
  const coachCategories = [...new Set(coaches.flatMap((entry) => entry.categories))].map((value) => ({ value, label: getLabel(DATA_COACH_CATEGORY_LABELS, value, value) }));
  const coachCountries = [...new Set(coaches.map((entry) => entry.nationality).filter(Boolean))].sort().map((value) => ({ value, label: formatCountryName(value) }));
  buildOptions(document.querySelector("#dataProjectCountry"), projectCountries, state.dataCenter.projectCountry, t("dataCenter.filters.all"));
  buildOptions(document.querySelector("#dataProjectCategory"), projectCategories, state.dataCenter.projectCategory, t("dataCenter.filters.all"));
  buildOptions(document.querySelector("#dataProjectStatus"), qualityOptions, state.dataCenter.projectStatus, t("dataCenter.filters.all"));
  buildOptions(document.querySelector("#dataCoachCategory"), coachCategories, state.dataCenter.coachCategory, t("dataCenter.filters.all"));
  buildOptions(document.querySelector("#dataCoachCountry"), coachCountries, state.dataCenter.coachCountry, t("dataCenter.filters.all"));
  buildOptions(document.querySelector("#dataCoachStatus"), qualityOptions, state.dataCenter.coachStatus, t("dataCenter.filters.all"));
  setControlValue("#dataProjectQuery", state.dataCenter.projectQuery);
  setControlValue("#dataCoachQuery", state.dataCenter.coachQuery);
}

function renderProjectDirectory() {
  const grid = document.querySelector("#dataProjectGrid");
  const empty = document.querySelector("#dataProjectEmpty");
  const count = document.querySelector("#dataProjectCount");
  if (!grid || !empty || !count) return;
  const projects = buildProjectCatalog(state.overview ?? {}).map((entry) => ({ ...entry, quality: getCatalogQuality("projects", entry) }));
  const query = normalize(state.dataCenter.projectQuery);
  const filtered = projects.filter((entry) => {
    const blob = normalize([
      ...(entry.name && typeof entry.name === "object" ? Object.values(entry.name) : [entry.name]),
      entry.country,
      formatCountryName(entry.country),
      COUNTRY_LABELS.zh[entry.country],
      COUNTRY_LABELS.en[entry.country],
      entry.project_type,
      getLabel(DATA_PROJECT_CATEGORY_LABELS, entry.category, entry.category),
      ...(entry.summary && typeof entry.summary === "object" ? Object.values(entry.summary) : [entry.summary])
    ].join(" "));
    return (!query || blob.includes(query)) &&
      (state.dataCenter.projectCountry === "all" || entry.country === state.dataCenter.projectCountry) &&
      (state.dataCenter.projectCategory === "all" || entry.category === state.dataCenter.projectCategory) &&
      (state.dataCenter.projectStatus === "all" || entry.quality.status === state.dataCenter.projectStatus);
  });
  count.textContent = t("dataCenter.results", { count: filtered.length, total: projects.length });
  grid.innerHTML = filtered.map(renderProjectDirectoryCard).join("");
  empty.textContent = t(state.dataCenter.overviewError ? "dataCenter.projects.loadError" : "dataCenter.projects.empty");
  empty.hidden = filtered.length > 0;
}

function renderProjectDirectoryCard(entry) {
  const tier = entry.quality.source_tier ?? "unclassified";
  return `
    <article class="system-card data-directory-card">
      <div class="chip-row">
        <span class="chip">${escapeHtml(getLabel(DATA_PROJECT_CATEGORY_LABELS, entry.category, entry.category))}</span>
        <span class="chip quality-chip quality-${escapeHtml(entry.quality.status)}">${escapeHtml(getLabel(DATA_QUALITY_STATUS_LABELS, entry.quality.status, entry.quality.status))}</span>
      </div>
      <h3>${escapeHtml(localizeText(entry.name))}</h3>
      <p class="small-note">${escapeHtml(formatCountryName(entry.country))} · ${escapeHtml(getLabel(YOUTH_COMPETITION_TYPE_LABELS, entry.project_type, humanizeTag(entry.project_type)))}</p>
      <p>${escapeHtml(localizeText(entry.summary))}</p>
      <p class="small-note">${escapeHtml(t("dataCenter.card.sources", { count: entry.sources.length, tier: getLabel(DATA_SOURCE_TIER_LABELS, tier, tier) }))}</p>
      <p class="small-note">${escapeHtml(t("dataCenter.card.checked", { date: entry.quality.checked_at ? formatDate(entry.quality.checked_at) : t("common.pending") }))}</p>
      ${entry.quality.missing_fields.length > 0 ? `<p class="data-missing-note">${escapeHtml(t("dataCenter.card.missing", { fields: entry.quality.missing_fields.map(humanizeTag).join(" / ") }))}</p>` : ""}
      ${entry.detail_url ? `<a class="inline-link" href="${escapeHtml(entry.detail_url)}"${entry.detail_url.startsWith("http") ? ' target="_blank" rel="noreferrer"' : ""}>${escapeHtml(t("dataCenter.card.open"))}</a>` : ""}
    </article>
  `;
}

function renderCoachDirectory() {
  const grid = document.querySelector("#dataCoachGrid");
  const empty = document.querySelector("#dataCoachEmpty");
  const count = document.querySelector("#dataCoachCount");
  if (!grid || !empty || !count) return;
  const coaches = buildCoachCatalog(state.overview ?? {}).map((entry) => ({ ...entry, quality: getCatalogQuality("coaches", entry) }));
  const query = normalize(state.dataCenter.coachQuery);
  const filtered = coaches.filter((entry) => {
    const blob = normalize([
      ...(entry.name && typeof entry.name === "object" ? Object.values(entry.name) : [entry.name]),
      entry.local_name,
      entry.nationality,
      entry.nationality ? formatCountryName(entry.nationality) : "",
      COUNTRY_LABELS.zh[entry.nationality],
      COUNTRY_LABELS.en[entry.nationality],
      ...entry.roles,
      ...entry.organizations
    ].join(" "));
    return (!query || blob.includes(query)) &&
      (state.dataCenter.coachCategory === "all" || entry.categories.includes(state.dataCenter.coachCategory)) &&
      (state.dataCenter.coachCountry === "all" || entry.nationality === state.dataCenter.coachCountry) &&
      (state.dataCenter.coachStatus === "all" || entry.quality.status === state.dataCenter.coachStatus);
  });
  count.textContent = t("dataCenter.results", { count: filtered.length, total: coaches.length });
  grid.innerHTML = filtered.map(renderCoachDirectoryCard).join("");
  empty.textContent = t(state.dataCenter.overviewError ? "dataCenter.coaches.loadError" : "dataCenter.coaches.empty");
  empty.hidden = filtered.length > 0;
}

function renderCoachDirectoryCard(entry) {
  const tier = entry.quality.source_tier ?? "unclassified";
  const displayName = entry.local_name && entry.local_name !== localizeText(entry.name)
    ? `${entry.local_name} / ${localizeText(entry.name)}`
    : localizeText(entry.name);
  return `
    <article class="system-card data-directory-card">
      <div class="chip-row">
        ${entry.categories.map((category) => `<span class="chip">${escapeHtml(getLabel(DATA_COACH_CATEGORY_LABELS, category, category))}</span>`).join("")}
        <span class="chip quality-chip quality-${escapeHtml(entry.quality.status)}">${escapeHtml(getLabel(DATA_QUALITY_STATUS_LABELS, entry.quality.status, entry.quality.status))}</span>
      </div>
      <h3>${escapeHtml(displayName)}</h3>
      <p class="small-note">${escapeHtml(entry.nationality ? formatCountryName(entry.nationality) : t("common.pending"))}</p>
      <p>${escapeHtml(entry.roles.join(" / ") || t("common.pending"))}</p>
      <p class="small-note">${escapeHtml(entry.organizations.join(" · ") || t("common.pending"))}</p>
      <p class="small-note">${escapeHtml(t("dataCenter.card.sources", { count: entry.sources.length, tier: getLabel(DATA_SOURCE_TIER_LABELS, tier, tier) }))}</p>
      <p class="small-note">${escapeHtml(t("dataCenter.card.checked", { date: entry.quality.checked_at ? formatDate(entry.quality.checked_at) : t("common.pending") }))}</p>
      ${entry.quality.missing_fields.length > 0 ? `<p class="data-missing-note">${escapeHtml(t("dataCenter.card.missing", { fields: entry.quality.missing_fields.map(humanizeTag).join(" / ") }))}</p>` : ""}
      ${entry.sources[0] ? `<a class="inline-link" href="${escapeHtml(entry.sources[0].url)}" target="_blank" rel="noreferrer">${escapeHtml(t("dataCenter.card.open"))}</a>` : ""}
    </article>
  `;
}

function initializeTournamentFilters() {
  const params = new URLSearchParams(window.location.search);
  const requestedLevel = params.get("level");
  if (requestedLevel) {
    state.tournamentFilters.level = requestedLevel;
  }

  const container = document.querySelector("#tournamentLevelTabs");
  container?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-level]");
    if (!button) {
      return;
    }
    state.tournamentFilters.level = button.dataset.level;
    renderTournamentsPage();
  });
}

function renderTournamentLevelTabs() {
  const container = document.querySelector("#tournamentLevelTabs");
  const levels = [
    { value: "all", label: t("tournaments.tabs.all") },
    { value: "senior", label: formatLevelTag("senior") },
    { value: "u23", label: "U23" },
    { value: "u20", label: "U20" },
    { value: "u17", label: "U17" },
    { value: "senior-world-cup", label: formatLevelTag("senior-world-cup") },
    { value: "u20-world-cup", label: formatLevelTag("u20-world-cup") },
    { value: "u17-world-cup", label: formatLevelTag("u17-world-cup") }
  ];

  container.innerHTML = levels
    .map(
      (item) => `
        <button class="tab-button ${item.value === state.tournamentFilters.level ? "is-active" : ""}" data-level="${item.value}" type="button">
          ${escapeHtml(item.label)}
        </button>
      `
    )
    .join("");
}

function getFilteredTournaments() {
  return state.overview.tournament_archive
    .filter((tournament) => {
      if (state.tournamentFilters.level === "all") {
        return true;
      }
      return tournament.level === state.tournamentFilters.level;
    })
    .sort((left, right) =>
      Number(right.edition_label ?? 0) - Number(left.edition_label ?? 0) ||
      left.competition_name.localeCompare(right.competition_name)
    );
}

function getFilteredFocusTournaments() {
  const archiveLevelById = new Map(
    state.overview.tournament_archive.map((tournament) => [tournament.id, tournament.level])
  );

  return state.overview.tournaments.filter((tournament) => {
    const archiveLevel = archiveLevelById.get(tournament.id);
    if (!archiveLevel) {
      return false;
    }

    if (state.tournamentFilters.level === "all") {
      return true;
    }

    return archiveLevel === state.tournamentFilters.level;
  });
}

function renderTournamentsPage() {
  const focusGrid = document.querySelector("#focusTournamentGrid");
  const archiveGrid = document.querySelector("#tournamentArchiveGrid");
  const meta = document.querySelector("#tournamentArchiveMeta");
  const emptyState = document.querySelector("#tournamentArchiveEmptyState");

  renderTournamentLevelTabs();
  replaceQueryParams({
    level: state.tournamentFilters.level
  });
  const focusTournaments = getFilteredFocusTournaments();
  focusGrid.innerHTML =
    focusTournaments.length > 0
      ? focusTournaments.map(renderFocusTournamentCard).join("")
      : `<div class="empty-inline">${escapeHtml(t("tournaments.empty"))}</div>`;

  const tournaments = getFilteredTournaments();
  meta.textContent = t("tournaments.meta.count", { count: tournaments.length });
  archiveGrid.innerHTML = tournaments.map(renderArchiveTournamentCard).join("");
  emptyState.hidden = tournaments.length > 0;
}

function renderArchiveTournamentCard(tournament) {
  const titleResult = getTournamentResultSummary(tournament);
  const displayMatches = getDisplayChinaMatches(tournament.china_matches);
  const matches =
    displayMatches.length > 0
      ? displayMatches
          .map(
            (match) => `
              <article class="archive-match">
                <strong>${escapeHtml(localizeText(match.stage))} · ${formatDate(match.date)}</strong>
                ${renderTournamentMatchContent(match, { includeSubstitutes: true })}
              </article>
            `
          )
          .join("")
      : `<p class="small-note">${escapeHtml(t("tournaments.archive.noChinaMatches"))}</p>`;
  const participantCount = tournament.participants?.teams?.length ?? 0;
  const drawLabel = tournament.final_draw?.status === "complete"
    ? t("tournaments.archive.drawComplete")
    : tournament.final_draw?.status === "cancelled"
      ? t("tournaments.archive.drawCancelled")
      : t("tournaments.archive.drawPending");
  const fieldSummary = tournament.participants
    ? `<p class="small-note">${escapeHtml(t("tournaments.archive.fieldSummary", { count: participantCount, draw: drawLabel }))}</p>`
    : "";

  return `
    <article class="archive-card">
      <div class="section-head compact-head">
        <div>
          <p class="eyebrow">${escapeHtml(tournament.confederation)}</p>
          <h3><a class="inline-link" href="${buildTournamentDetailUrl(tournament.id)}">${escapeHtml(tournament.competition_name)}</a></h3>
        </div>
        <div class="chip-row">
          <span class="chip">${formatLevelTag(tournament.level)}</span>
          <span class="chip">${formatStatus(tournament.status)}</span>
        </div>
      </div>
      <p>${formatRange(tournament.date_range)} · ${escapeHtml(formatCountryName(tournament.host))}</p>
      <p>${escapeHtml(titleResult)}</p>
      ${fieldSummary}
      <p class="small-note">${escapeHtml(t("tournaments.archive.chinaSummary", { summary: localizeText(tournament.china_summary) }))}</p>
      <p class="small-note">${escapeHtml(t("tournaments.archive.chinaStage", { stage: formatChinaStatus(tournament.china_status) }))}</p>
      <div class="archive-match-list">${matches}</div>
      <div class="pill-row">${renderLinkPills(tournament.source_links)}</div>
      <a class="primary-link primary-link-inline" href="${buildTournamentDetailUrl(tournament.id)}">${escapeHtml(t("tournaments.card.open"))}</a>
    </article>
  `;
}

function initializeYouthLeagueFilters() {
  const params = new URLSearchParams(window.location.search);
  for (const key of ["season", "country", "status"]) {
    if (params.get(key)) {
      state.youthLeagueFilters[key] = params.get(key);
    }
  }

  document.querySelector("#youthLeagueFilters")?.addEventListener("change", (event) => {
    const control = event.target.closest("[data-youth-filter]");
    if (!control) {
      return;
    }
    state.youthLeagueFilters[control.dataset.youthFilter] = control.value;
    renderYouthLeaguePlayers();
  });
}

function getYouthLeagueData() {
  return state.overview?.uefa_youth_league ?? null;
}

function renderYouthLeagueHero(topic) {
  const entrantTotal = topic.seasons.reduce((total, season) => total + season.entrant_count, 0);
  const node = document.querySelector("#youthLeagueHeroStats");
  node.innerHTML = `
    <p class="eyebrow">${escapeHtml(yt("currentRules"))}</p>
    <div class="youth-hero-metrics">
      <div><strong>${topic.seasons.length}</strong><span>${escapeHtml(yt("seasonCount"))}</span></div>
      <div><strong>${entrantTotal}</strong><span>${escapeHtml(yt("entrantTotal"))}</span></div>
      <div><strong>${topic.cjk_players.length}</strong><span>${escapeHtml(yt("cjkCount"))}</span></div>
    </div>
  `;
}

function renderYouthLeagueQualification(topic) {
  const node = document.querySelector("#youthLeagueQualification");
  const qualification = topic.qualification;
  const rules = topic.player_eligibility.rules;
  node.innerHTML = `
    <div class="youth-rule-paths">
      ${qualification.paths
        .map(
          (path) => `
            <article class="youth-rule-card">
              <h3>${escapeHtml(localizeText(path.title))}</h3>
              <p>${escapeHtml(localizeText(path.description))}</p>
            </article>
          `
        )
        .join("")}
    </div>
    <article class="youth-rule-note">
      <strong>${escapeHtml(yt("routeNote"))}</strong>
      <p>${escapeHtml(localizeText(qualification.holder_rule))}</p>
      <p>${escapeHtml(localizeText(qualification.duplicate_rule))}</p>
    </article>
    <div class="section-head compact-head"><h3>${escapeHtml(yt("playerRules"))}</h3></div>
    <div class="youth-eligibility-grid">
      ${rules
        .map(
          (rule) => `
            <article class="youth-eligibility-card">
              <h4>${escapeHtml(localizeText(rule.title))}</h4>
              <p>${escapeHtml(localizeText(rule.description))}</p>
            </article>
          `
        )
        .join("")}
    </div>
    <article class="youth-methodology-note">
      <strong>${escapeHtml(yt("methodology"))}</strong>
      <p>${escapeHtml(yt("methodologyText"))}</p>
    </article>
  `;
}

function formatYouthRound(round) {
  return {
    "quarter-final": yt("quarterFinal"),
    "semi-final": yt("semiFinal"),
    final: yt("final")
  }[round] ?? round;
}

function renderYouthLeagueKnockout(season) {
  const grouped = ["quarter-final", "semi-final", "final"];
  return grouped
    .map((round) => {
      const matches = season.knockout.filter((match) => match.round === round);
      return `
        <div class="youth-knockout-round">
          <h4>${escapeHtml(formatYouthRound(round))}</h4>
          ${matches
            .map(
              (match) => `
                <div class="youth-score-row">
                  <time datetime="${escapeHtml(match.date)}">${escapeHtml(formatDate(match.date))}</time>
                  <span>${escapeHtml(formatClubName(match.home))}</span>
                  <strong>${escapeHtml(match.score)}${match.penalties ? ` <small>${escapeHtml(yt("penalties", { score: match.penalties }))}</small>` : ""}</strong>
                  <span>${escapeHtml(formatClubName(match.away))}</span>
                </div>
              `
            )
            .join("")}
        </div>
      `;
    })
    .join("");
}

function renderYouthLeagueSeasonCard(season) {
  const teams = Object.values(season.teams_by_path).flat();
  const scorerText = season.top_scorers
    .map((scorer) => `${scorer.name} (${formatClubName(scorer.club)}, ${scorer.goals})`)
    .join(" · ");
  const eraLabel = season.format.era === "old" ? yt("oldFormat") : yt("newFormat");
  return `
    <article class="youth-season-card">
      <div class="section-head compact-head">
        <div><p class="eyebrow">${escapeHtml(eraLabel)}</p><h3>${escapeHtml(season.label)}</h3></div>
        <span class="chip">${escapeHtml(yt("entrants", { count: season.entrant_count }))}</span>
      </div>
      <p>${escapeHtml(localizeText(season.format.description))}</p>
      <dl class="youth-season-summary">
        <div><dt>${escapeHtml(yt("champion"))}</dt><dd>${escapeHtml(formatClubName(season.champion))}</dd></div>
        <div><dt>${escapeHtml(yt("runnerUp"))}</dt><dd>${escapeHtml(formatClubName(season.runner_up))}</dd></div>
        <div><dt>${escapeHtml(yt("semiFinalists"))}</dt><dd>${escapeHtml(season.semi_finalists.map(formatClubName).join(" · "))}</dd></div>
        <div><dt>${escapeHtml(yt("topScorers"))}</dt><dd>${escapeHtml(scorerText)}</dd></div>
      </dl>
      <div class="youth-knockout"><h4>${escapeHtml(yt("knockout"))}</h4>${renderYouthLeagueKnockout(season)}</div>
      <details class="youth-team-details">
        <summary>${escapeHtml(yt("teams", { count: teams.length }))}</summary>
        <div class="youth-team-columns">
          <div><h4>${escapeHtml(yt("championsLeaguePath"))}</h4><p>${season.teams_by_path.champions_league.map(formatClubName).map(escapeHtml).join(" · ")}</p></div>
          <div><h4>${escapeHtml(yt("domesticPath"))}</h4><p>${season.teams_by_path.domestic_champions.map(formatClubName).map(escapeHtml).join(" · ")}</p></div>
        </div>
      </details>
    </article>
  `;
}

function getYouthCountryLabel(code) {
  return { CHN: yt("china"), JPN: yt("japan"), KOR: yt("korea") }[code] ?? code;
}

function renderYouthLeagueFilterSelect(key, label, options) {
  const selected = state.youthLeagueFilters[key];
  return `
    <label><span>${escapeHtml(label)}</span>
      <select data-youth-filter="${escapeHtml(key)}">
        ${options.map((option) => `<option value="${escapeHtml(option.value)}"${option.value === selected ? " selected" : ""}>${escapeHtml(option.label)}</option>`).join("")}
      </select>
    </label>
  `;
}

function getFilteredYouthLeaguePlayers(topic) {
  return topic.cjk_players.filter((player) => {
    const filters = state.youthLeagueFilters;
    return (filters.season === "all" || player.season_id === filters.season) &&
      (filters.country === "all" || player.country_code === filters.country) &&
      (filters.status === "all" || player.status === filters.status);
  });
}

function renderYouthLeaguePlayers() {
  const topic = getYouthLeagueData();
  const filters = document.querySelector("#youthLeagueFilters");
  const seasons = topic.seasons.map((season) => ({ value: season.id, label: season.label }));
  filters.innerHTML = [
    renderYouthLeagueFilterSelect("season", yt("filtersSeason"), [{ value: "all", label: yt("all") }, ...seasons]),
    renderYouthLeagueFilterSelect("country", yt("filtersCountry"), [
      { value: "all", label: yt("all") }, { value: "CHN", label: yt("china") }, { value: "JPN", label: yt("japan") }, { value: "KOR", label: yt("korea") }
    ]),
    renderYouthLeagueFilterSelect("status", yt("filtersStatus"), [
      { value: "all", label: yt("all") }, { value: "appeared", label: yt("appeared") }, { value: "registered-only", label: yt("registeredOnly") }
    ])
  ].join("");

  replaceQueryParams(state.youthLeagueFilters);
  const players = getFilteredYouthLeaguePlayers(topic);
  document.querySelector("#youthLeagueCjkMeta").textContent = yt("resultCount", { count: players.length, total: topic.cjk_players.length });
  document.querySelector("#youthLeaguePlayerHead").innerHTML = `<tr><th>${escapeHtml(yt("player"))}</th><th>${escapeHtml(yt("filtersSeason"))}</th><th>${escapeHtml(yt("uefaNationality"))}</th><th>${escapeHtml(yt("club"))}</th><th>${escapeHtml(yt("status"))}</th><th>${escapeHtml(yt("apps"))}</th><th>${escapeHtml(yt("starts"))}</th><th>${escapeHtml(yt("minutes"))}</th><th>${escapeHtml(yt("goals"))}</th><th>${escapeHtml(yt("assists"))}</th></tr>`;
  document.querySelector("#youthLeaguePlayerBody").innerHTML = players
    .map((player) => {
      const displayName = state.language === "en" ? player.names.en : player.names.zh;
      const nameMarkup = player.player_id
        ? `<a class="inline-link" href="${buildPlayerDetailUrl(player.player_id)}">${escapeHtml(displayName)}</a>`
        : `<strong>${escapeHtml(displayName)}</strong>`;
      const nativeName = player.names.native && player.names.native !== displayName ? `<small>${escapeHtml(player.names.native)}</small>` : "";
      return `<tr><td>${nameMarkup}${nativeName}</td><td>${escapeHtml(topic.seasons.find((season) => season.id === player.season_id)?.label ?? player.season_id)}</td><td>${escapeHtml(getYouthCountryLabel(player.country_code))}</td><td>${escapeHtml(formatClubName(player.club))}</td><td><span class="chip">${escapeHtml(player.status === "appeared" ? yt("appeared") : yt("registeredOnly"))}</span></td><td>${player.appearances}</td><td>${player.starts}</td><td>${player.minutes}</td><td>${player.goals}</td><td>${player.assists}</td></tr>`;
    })
    .join("");
  const empty = document.querySelector("#youthLeaguePlayerEmpty");
  empty.textContent = yt("noPlayers");
  empty.hidden = players.length > 0;
  document.querySelector(".youth-player-table-shell").hidden = players.length === 0;
}

function renderYouthLeagueSpotlights(topic) {
  const container = document.querySelector("#youthLeagueSpotlights");
  container.innerHTML = topic.seasons
    .map((season) => {
      const players = topic.other_player_spotlights.filter((player) => player.season_id === season.id);
      return `
        <article class="youth-spotlight-season">
          <h3>${escapeHtml(yt("spotlightSeason", { season: season.label }))}</h3>
          <div>${players.map((player) => `<p><strong>${escapeHtml(player.name)}</strong><span>${escapeHtml(formatClubName(player.club))}</span><small>${escapeHtml(localizeText(player.reason))}</small></p>`).join("")}</div>
        </article>
      `;
    })
    .join("");
}

function renderYouthLeagueSources(topic) {
  document.querySelector("#youthLeagueSources").innerHTML = `
    <p class="section-note">${escapeHtml(yt("sourceNote"))}</p>
    <div class="source-link-grid">
      ${topic.sources.map((source) => `<a href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer"><span>${escapeHtml(source.label)}</span><strong>↗</strong></a>`).join("")}
    </div>
  `;
}

function renderYouthLeaguePage() {
  const topic = getYouthLeagueData();
  if (!topic) {
    throw new Error("UEFA Youth League data is unavailable.");
  }
  renderYouthLeagueHero(topic);
  renderYouthLeagueQualification(topic);
  document.querySelector("#youthLeagueSeasonCards").innerHTML = topic.seasons.map(renderYouthLeagueSeasonCard).join("");
  renderYouthLeaguePlayers();
  renderYouthLeagueSpotlights(topic);
  renderYouthLeagueSources(topic);
}

function initializeOverseasFilters() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("country")) {
    state.overseasFilters.country = params.get("country");
  }
  if (params.get("bucket")) {
    state.overseasFilters.bucket = params.get("bucket");
  }
  if (params.get("level")) {
    state.overseasFilters.teamLevel = params.get("level");
  }
  if (params.get("year")) {
    state.overseasFilters.year = params.get("year");
  }

  const countryOptions = getOverseasCountryMap().map((item) => ({
    value: item.country,
    label: formatCountryName(item.country)
  }));
  const bucketOptions = state.overview.overseas_history.bucket_definition.map((bucket) => ({
    value: bucket,
    label: formatBucket(bucket)
  }));
  const teamLevelOptions = OVERSEAS_TEAM_LEVEL_ORDER.map((teamLevel) => ({
    value: teamLevel,
    label: formatOverseasTeamLevel(teamLevel)
  }));
  const yearOptions = getHistoricalYearOptions();
  state.overseasFilters.country = normalizeFilterValue(state.overseasFilters.country, countryOptions);
  state.overseasFilters.bucket = normalizeFilterValue(state.overseasFilters.bucket, bucketOptions);
  state.overseasFilters.teamLevel = normalizeFilterValue(
    state.overseasFilters.teamLevel,
    teamLevelOptions
  );
  state.overseasFilters.year = normalizeFilterValue(state.overseasFilters.year, yearOptions);

  buildOptions(
    document.querySelector("#overseasCountryFilter"),
    countryOptions,
    state.overseasFilters.country,
    t("overseas.filters.allCountry")
  );
  buildOptions(
    document.querySelector("#overseasBucketFilter"),
    bucketOptions,
    state.overseasFilters.bucket,
    t("overseas.filters.allBucket")
  );
  buildOptions(
    document.querySelector("#overseasTeamLevelFilter"),
    teamLevelOptions,
    state.overseasFilters.teamLevel,
    t("overseas.filters.allTeamLevel")
  );
  buildOptions(
    document.querySelector("#overseasYearFilter"),
    yearOptions,
    state.overseasFilters.year,
    t("overseas.filters.allYear")
  );
  buildOptions(
    document.querySelector("#overseasHeroYearFilter"),
    yearOptions,
    state.overseasFilters.year,
    t("overseas.filters.allYear")
  );

  document.querySelector("#overseasCountryFilter")?.addEventListener("change", (event) => {
    state.overseasFilters.country = event.target.value;
    renderOverseasPage();
  });
  document.querySelector("#overseasBucketFilter")?.addEventListener("change", (event) => {
    state.overseasFilters.bucket = event.target.value;
    renderOverseasPage();
  });
  document.querySelector("#overseasTeamLevelFilter")?.addEventListener("change", (event) => {
    state.overseasFilters.teamLevel = event.target.value;
    renderOverseasPage();
  });
  document.querySelector("#overseasYearFilter")?.addEventListener("change", (event) => {
    state.overseasFilters.year = event.target.value;
    renderOverseasPage();
  });
  document.querySelector("#overseasHeroYearFilter")?.addEventListener("change", (event) => {
    state.overseasFilters.year = event.target.value;
    renderOverseasPage();
  });
  document.querySelector("#overseasResetButton")?.addEventListener("click", () => {
    state.overseasFilters.country = "all";
    state.overseasFilters.bucket = "all";
    state.overseasFilters.teamLevel = "all";
    state.overseasFilters.year = "all";
    renderOverseasPage();
  });
}

function getFilteredCurrentOverseasItems() {
  return getCurrentOverseasItems().filter((item) => {
    const matchesCountry =
      state.overseasFilters.country === "all" || item.country === state.overseasFilters.country;
    const matchesBucket =
      state.overseasFilters.bucket === "all" || item.overseasBucket === state.overseasFilters.bucket;
    const matchesTeamLevel =
      state.overseasFilters.teamLevel === "all" ||
      item.overseasTeamLevel === state.overseasFilters.teamLevel;
    return matchesCountry && matchesBucket && matchesTeamLevel;
  });
}

function isHistoricalYearMode() {
  return state.overseasFilters.year !== "all";
}

function getFilteredHistoricalRecords() {
  const currentlyAbroad = getCurrentlyAbroadIdentitySet();
  return flattenHistoricalOverseasRecords().filter((record) => {
    const matchesCountry =
      state.overseasFilters.country === "all" || record.country === state.overseasFilters.country;
    const matchesBucket =
      state.overseasFilters.bucket === "all" || record.bucket === state.overseasFilters.bucket;
    const matchesYear =
      state.overseasFilters.year === "all"
        ? !currentlyAbroad.has(getHistoricalRecordIdentity(record))
        : seasonIncludesYear(record, Number(state.overseasFilters.year));
    return matchesCountry && matchesBucket && matchesYear;
  });
}

function getVisibleOverseasSummaryItems() {
  if (!isHistoricalYearMode()) {
    return getFilteredCurrentOverseasItems();
  }

  return getFilteredHistoricalRecords().map(toCurrentHistoricalOverseasItem);
}

function renderOverseasPage() {
  const comparisonStats = document.querySelector("#overseasComparisonStats");
  const currentEyebrow = document.querySelector("#overseasCurrentEyebrow");
  const currentTitle = document.querySelector("#overseasCurrentTitle");
  const currentMeta = document.querySelector("#overseasCurrentMeta");
  const teamLevelNotice = document.querySelector("#overseasTeamLevelNotice");
  const teamLevelFilter = document.querySelector("#overseasTeamLevelFilter");
  const currentPlayers = document.querySelector("#overseasCurrentPlayers");
  const currentEmptyState = document.querySelector("#overseasCurrentEmptyState");
  const countryNotes = document.querySelector("#overseasCountryNotes");
  const historySection = document.querySelector("#overseasHistorySection");
  const historyMeta = document.querySelector("#overseasHistoryMeta");
  const historyCards = document.querySelector("#overseasHistoryCards");
  const historyEmptyState = document.querySelector("#overseasHistoryEmptyState");

  const countryMap = getOverseasCountryMap();
  const filteredCurrent = getVisibleOverseasSummaryItems();
  const filteredHistory = getFilteredHistoricalRecords();
  const historicalYearMode = isHistoricalYearMode();

  setControlValue("#overseasCountryFilter", state.overseasFilters.country);
  setControlValue("#overseasBucketFilter", state.overseasFilters.bucket);
  setControlValue("#overseasTeamLevelFilter", state.overseasFilters.teamLevel);
  setControlValue("#overseasYearFilter", state.overseasFilters.year);
  setControlValue("#overseasHeroYearFilter", state.overseasFilters.year);
  if (teamLevelFilter) {
    teamLevelFilter.disabled = historicalYearMode;
  }
  if (teamLevelNotice) {
    teamLevelNotice.textContent = t("overseas.current.teamLevelHistoryNote");
    teamLevelNotice.hidden = !historicalYearMode;
  }
  replaceQueryParams({
    country: state.overseasFilters.country,
    bucket: state.overseasFilters.bucket,
    level: state.overseasFilters.teamLevel,
    year: state.overseasFilters.year
  });

  comparisonStats.innerHTML = countryMap
    .map(
      (entry) => `
        <article class="stat-card">
          <p class="stat-label">${escapeHtml(formatCountryName(entry.country))}</p>
          <p class="stat-value">${entry.currentCount}</p>
          <p class="small-note">${escapeHtml(t("overseas.comparison.current"))}</p>
          <p class="small-note">${escapeHtml(t("overseas.comparison.history", { count: entry.verifiedRecords }))}</p>
          <div class="stat-breakdown">
            <p class="stat-breakdown-item">
              <span>${escapeHtml(formatBucket("big-five"))}</span>
              <strong>${entry.bigFiveFirstTeamCount}</strong>
            </p>
            ${OVERSEAS_TEAM_LEVEL_SUMMARY_ORDER.map(
              (teamLevel) => `
                <p class="stat-breakdown-item">
                  <span>${escapeHtml(formatOverseasTeamLevel(teamLevel))}</span>
                  <strong>${entry.teamLevelCounts[teamLevel]}</strong>
                </p>
              `
            ).join("")}
          </div>
        </article>
      `
    )
    .join("");

  if (currentEyebrow) {
    currentEyebrow.textContent = historicalYearMode
      ? t("overseas.current.eyebrow.year")
      : t("overseas.current.eyebrow");
  }
  if (currentTitle) {
    currentTitle.textContent = historicalYearMode
      ? t("overseas.current.title.year")
      : t("overseas.current.title");
  }

  currentMeta.textContent = historicalYearMode
    ? t("overseas.current.meta.year", {
        count: filteredCurrent.length,
        year: state.overseasFilters.year
      })
    : t("overseas.current.meta", { count: filteredCurrent.length });
  currentPlayers.classList.remove("player-card-grid", "story-grid");
  currentPlayers.classList.add(historicalYearMode ? "story-grid" : "player-card-grid");
  currentPlayers.innerHTML = filteredCurrent
    .map((item) =>
      historicalYearMode ? renderHistoricalRecordCard(item) : renderCurrentOverseasItem(item, false)
    )
    .join("");
  currentEmptyState.textContent = historicalYearMode
    ? t("overseas.current.empty.year", { year: state.overseasFilters.year })
    : t("overseas.current.empty");
  currentEmptyState.hidden = filteredCurrent.length > 0;

  const selectedCountry =
    state.overseasFilters.country === "all"
      ? countryMap[0]
      : countryMap.find((entry) => entry.country === state.overseasFilters.country);
  countryNotes.innerHTML = selectedCountry
    ? `
        <article class="stack-card">
          <h3>${escapeHtml(formatCountryName(selectedCountry.country))}</h3>
          <p class="small-note">${escapeHtml(localizeText(selectedCountry.notes, t("overseas.countryNotes.noNote")))}</p>
        </article>
        ${
          selectedCountry.overseasStatusCounts
            ? `
              <article class="stack-card">
                <h3>${escapeHtml(t("overseas.status.title"))}</h3>
                <div class="stat-breakdown">
                  ${OVERSEAS_STATUS_ORDER.map(
                    (status) => `
                      <p class="stat-breakdown-item">
                        <span>${escapeHtml(formatOverseasStatus(status))}</span>
                        <strong>${selectedCountry.overseasStatusCounts[status] ?? 0}</strong>
                      </p>
                    `
                  ).join("")}
                </div>
                <p class="small-note">${escapeHtml(t("overseas.status.note"))}</p>
              </article>
            `
            : ""
        }
        ${(selectedCountry.bucketFocus ?? [])
          .map(
            (note) => `
              <article class="stack-card">
                <p>${escapeHtml(localizeText(note))}</p>
              </article>
            `
          )
          .join("")}
        ${(selectedCountry.specialLists ?? []).map(renderOverseasSpecialListCard).join("")}
      `
    : `<div class="empty-inline">${escapeHtml(t("overseas.countryNotes.empty"))}</div>`;

  historyMeta.textContent =
    state.overseasFilters.year === "all"
      ? t("overseas.history.meta.default", { count: filteredHistory.length })
      : t("overseas.history.meta.year", {
          count: filteredHistory.length,
          year: state.overseasFilters.year
        });
  if (historySection) {
    historySection.hidden = historicalYearMode;
  }
  historyCards.innerHTML = filteredHistory.map(renderHistoricalRecordCard).join("");
  historyEmptyState.hidden = filteredHistory.length > 0;

  renderBigFiveAsianCoaches();
}

function renderHistoricalRecordCard(record) {
  return `
    <article class="story-card">
      <div class="chip-row">
        <span class="chip">${escapeHtml(formatCountryName(record.country))}</span>
        <span class="chip">${formatBucket(record.bucket)}</span>
        <span class="chip">${escapeHtml(record.season)}</span>
      </div>
      <h3>${escapeHtml(record.local_name && record.local_name !== record.name ? `${record.local_name} / ${record.name}` : record.name)}</h3>
      <p>${escapeHtml(formatClubName(record.club))} · ${escapeHtml(record.league)}</p>
      <p class="small-note">${escapeHtml(localizeText(record.appearance_label ?? ""))}</p>
      <p>${escapeHtml(localizeText(record.summary))}</p>
      <ul class="mini-bullet-list coach-record-list">
        ${(record.notes ?? []).map((note) => `<li>${escapeHtml(localizeText(note))}</li>`).join("")}
      </ul>
    </article>
  `;
}

function formatCoachRecord(record) {
  return t("overseas.coaches.recordLine", {
    matches: record?.matches ?? 0,
    wins: record?.wins ?? 0,
    draws: record?.draws ?? 0,
    losses: record?.losses ?? 0
  });
}

function getCoachScopeLabel(coach) {
  return (coach.counted_in ?? []).includes("afc_member_association")
    ? t("overseas.coaches.scope.afc")
    : t("overseas.coaches.scope.broad");
}

function renderCoachRecordStat(label, value, note = "") {
  return `
    <article class="stat-card">
      <p class="stat-label">${escapeHtml(label)}</p>
      <p class="stat-value stat-value-small">${escapeHtml(value)}</p>
      ${note ? `<p class="small-note">${escapeHtml(note)}</p>` : ""}
    </article>
  `;
}

function renderCoachClubRecord(stint) {
  return `
    <li>
      <strong>${escapeHtml(t("overseas.coaches.clubRecord", {
        league: stint.league,
        club: formatClubName(stint.club),
        season: stint.season
      }))}</strong>
      <span class="small-note">${escapeHtml(formatCoachRecord(stint))} · ${escapeHtml(t("overseas.coaches.points", { points: stint.points }))}</span>
      ${stint.period ? `<span class="small-note">${escapeHtml(t("overseas.coaches.period", { value: stint.period }))}</span>` : ""}
      ${stint.outcome ? `<span class="small-note">${escapeHtml(localizeText(stint.outcome))}</span>` : ""}
    </li>
  `;
}

function renderBigFiveAsianCoachCard(coach) {
  const displayName =
    coach.local_name && coach.local_name !== coach.name
      ? `${coach.local_name} / ${coach.name}`
      : coach.name;
  const recordLine = `${formatCoachRecord(coach.top_flight_record)} · ${t("overseas.coaches.points", {
    points: coach.top_flight_record?.points ?? 0
  })}`;
  const sourceLinks = coach.source_links ?? [];

  return `
    <article class="story-card">
      <div class="chip-row">
        <span class="chip">${escapeHtml(formatCountryName(coach.nationality))}</span>
        <span class="chip">${escapeHtml(getCoachScopeLabel(coach))}</span>
        <span class="chip">${escapeHtml(coach.first_big_five_spell ?? "")}</span>
      </div>
      <h3>${escapeHtml(displayName)}</h3>
      <p>${escapeHtml(recordLine)}</p>
      <p class="small-note">${escapeHtml(t("overseas.coaches.scope", { value: coach.record_scope ?? "top-flight league only" }))}</p>
      <p>${escapeHtml(localizeText(coach.summary))}</p>
      <ul class="mini-bullet-list">
        ${(coach.club_records ?? []).map(renderCoachClubRecord).join("")}
      </ul>
      ${(coach.notes ?? []).length > 0 ? `
        <ul class="mini-bullet-list">
          ${(coach.notes ?? []).map((note) => `<li>${escapeHtml(localizeText(note))}</li>`).join("")}
        </ul>
      ` : ""}
      <p class="small-note">${escapeHtml(t("overseas.coaches.confidence", { value: coach.confidence ?? "-" }))}</p>
      ${
        sourceLinks.length > 0
          ? `
            <p class="timeline-label">${escapeHtml(t("overseas.coaches.sources"))}</p>
            <div class="pill-row">${renderLinkPills(sourceLinks)}</div>
          `
          : ""
      }
    </article>
  `;
}

function renderBigFiveAsianCoaches() {
  const archive = state.overview?.big_five_asian_coaches;
  const statsNode = document.querySelector("#bigFiveAsianCoachStats");
  const sectionNode = document.querySelector("#bigFiveAsianCoachesSection");
  const metaNode = document.querySelector("#bigFiveAsianCoachesMeta");
  const scopeNode = document.querySelector("#bigFiveAsianCoachesScope");
  const cardsNode = document.querySelector("#bigFiveAsianCoachesCards");
  const emptyNode = document.querySelector("#bigFiveAsianCoachesEmptyState");

  if (!statsNode || !sectionNode || !metaNode || !scopeNode || !cardsNode || !emptyNode) {
    return;
  }

  if (!archive) {
    statsNode.hidden = true;
    sectionNode.hidden = true;
    return;
  }

  const coaches = archive.coaches ?? [];
  const sourceCount =
    (archive.source_links ?? []).length +
    coaches.reduce((total, coach) => total + (coach.source_links ?? []).length, 0);

  statsNode.hidden = false;
  sectionNode.hidden = false;
  statsNode.innerHTML = [
    renderCoachRecordStat(
      t("overseas.coaches.afcCount"),
      String(archive.scope_counts?.afc_member_association ?? 0),
      t("overseas.coaches.scope.afc")
    ),
    renderCoachRecordStat(
      t("overseas.coaches.broadCount"),
      String(archive.scope_counts?.geographic_broad ?? coaches.length),
      t("overseas.coaches.scope.broad")
    ),
    renderCoachRecordStat(
      t("overseas.coaches.primaryRecord"),
      formatCoachRecord(archive.primary_scope_record),
      t("overseas.coaches.points", { points: archive.primary_scope_record?.points ?? 0 })
    ),
    renderCoachRecordStat(
      t("overseas.coaches.sourceCount"),
      String(sourceCount),
      formatDate(archive.last_checked)
    )
  ].join("");

  metaNode.textContent = t("overseas.coaches.meta", { date: formatDate(archive.last_checked) });
  scopeNode.textContent = [
    t("overseas.coaches.primaryScope", { count: archive.scope_counts?.afc_member_association ?? 0 }),
    t("overseas.coaches.broadScope", { count: archive.scope_counts?.geographic_broad ?? coaches.length })
  ].join(" ");
  cardsNode.innerHTML = coaches.map(renderBigFiveAsianCoachCard).join("");
  emptyNode.hidden = coaches.length > 0;
}

function renderOverseasSpecialListCard(list) {
  const meta = [
    localizeText(list.period),
    Number.isInteger(list.player_count)
      ? t("overseas.countryNotes.playerCount", { count: list.player_count })
      : ""
  ]
    .filter(Boolean)
    .join(" · ");

  return `
    <article class="stack-card">
      <h3>${escapeHtml(localizeText(list.name))}</h3>
      ${meta ? `<p class="small-note">${escapeHtml(meta)}</p>` : ""}
      <p>${escapeHtml(localizeText(list.summary))}</p>
      ${(list.groups ?? [])
        .map(
          (group) => `
            <div class="special-list-group">
              <p class="timeline-label">${escapeHtml(localizeText(group.label))}</p>
              ${group.note ? `<p class="small-note">${escapeHtml(localizeText(group.note))}</p>` : ""}
              <p class="small-note">${escapeHtml(t("overseas.countryNotes.playerCount", { count: (group.players ?? []).length }))}</p>
              <p>${escapeHtml((group.players ?? []).join("、"))}</p>
            </div>
          `
        )
        .join("")}
      ${
        (list.notes ?? []).length > 0
          ? `
            <ul class="mini-bullet-list">
              ${(list.notes ?? []).map((note) => `<li>${escapeHtml(localizeText(note))}</li>`).join("")}
            </ul>
          `
          : ""
      }
      ${
        (list.source_links ?? []).length > 0
          ? `
            <p class="timeline-label">${escapeHtml(t("overseas.countryNotes.sources"))}</p>
            <div class="pill-row">${renderLinkPills(list.source_links)}</div>
          `
          : ""
      }
    </article>
  `;
}
