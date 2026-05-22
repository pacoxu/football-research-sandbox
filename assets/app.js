const page = document.body.dataset.page;
const pageDate = document.body.dataset.date || "2026-05-22";
const LANGUAGE_STORAGE_KEY = "youth-tracker-language";
const SITE_DATA_VERSION = "20260522-overseas-filter-fix";

const state = {
  language: "zh",
  players: [],
  overview: null,
  enrichedPlayers: [],
  playerFilters: {
    query: "",
    country: "all",
    ageBand: "all",
    leagueSystem: "all",
    tag: "all",
    view: "cards"
  },
  tournamentFilters: {
    level: "all"
  },
  overseasFilters: {
    country: "all",
    bucket: "all",
    year: "all"
  }
};

const UI_COPY = {
  zh: {
    "page.home.title": "青训球员追踪站",
    "page.home.description": "聚焦中国青训、亚洲青年赛事与中日韩留洋样本的静态数据站。",
    "page.players.title": "球员列表 | 青训球员追踪站",
    "page.players.description": "按国籍、年龄段、当前联赛或体系、标签筛选青训与青年球员样本。",
    "page.player-detail.title": "球员详情 | 青训球员追踪站",
    "page.player-detail.description": "查看球员青训路径、赛事经历、当前归属、最近贡献与外部资料链接。",
    "page.tournaments.title": "赛事列表 | 青训球员追踪站",
    "page.tournaments.description": "按赛事层级查看亚洲杯、世界杯、世青赛、世少赛的比赛时间、结果、中国战绩与来源链接。",
    "page.tournament-detail.title": "赛事详情 | 青训球员追踪站",
    "page.tournament-detail.description": "查看单项赛事的时间范围、中国战绩、比赛明细、关键球员与来源链接。",
    "page.overseas.title": "留洋专页 | 青训球员追踪站",
    "page.overseas.description": "查看中日韩当前留洋样本、联赛层级对比与历史记录。",
    "site.kicker": "青训追踪台",
    "site.brand": "青训球员追踪站",
    "nav.aria": "主导航",
    "nav.home": "首页",
    "nav.players": "球员",
    "nav.tournaments": "赛事",
    "nav.overseas": "留洋",
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
    "home.quickLinks.playersText": "按国籍、年龄段和标签筛选球员样本。",
    "home.quickLinks.tournamentsTitle": "赛事",
    "home.quickLinks.tournamentsText": "查看赛事时间、结果和中国队比赛明细。",
    "home.quickLinks.overseasTitle": "留洋",
    "home.quickLinks.overseasText": "区分当前留洋样本与历史记录。",
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
    "home.overseasCard.current": "当前：{value}",
    "home.overseasCard.region": "地区：{value}",
    "home.overseasCard.origin": "来源：{value}",
    "home.overseasCard.path": "留洋经历：{value}",
    "home.overseasCard.sample": "样本：{value}",
    "home.overseasCard.league": "赛事或联赛：{value}",
    "players.hero.eyebrow": "Player Directory",
    "players.hero.title": "球员列表",
    "players.hero.text": "这里是总入口。支持按国籍、年龄段、当前联赛或体系、专题标签过滤，并在卡片视图和列表视图之间切换。",
    "players.view.eyebrow": "View Modes",
    "players.view.aria": "视图切换",
    "players.view.cards": "卡片",
    "players.view.table": "列表",
    "players.filters.search": "搜索",
    "players.filters.searchPlaceholder": "中文名、原文名、英文名、俱乐部、标签",
    "players.filters.country": "国籍",
    "players.filters.ageBand": "年龄段",
    "players.filters.league": "当前联赛 / 体系",
    "players.filters.tag": "标签",
    "players.filters.actions": "操作",
    "players.filters.reset": "重置筛选",
    "players.filters.allCountry": "全部国籍",
    "players.filters.allAgeBand": "全部年龄段",
    "players.filters.allLeague": "全部联赛 / 体系",
    "players.filters.allTag": "全部标签",
    "players.table.player": "球员",
    "players.table.country": "国籍",
    "players.table.age": "年龄",
    "players.table.club": "当前球队",
    "players.table.league": "当前联赛 / 体系",
    "players.table.tag": "标签",
    "players.table.detail": "查看",
    "players.empty": "当前筛选条件下没有匹配球员。",
    "players.meta.results": "当前命中 {count} / {total} 名球员",
    "players.card.positionPending": "位置待补",
    "players.card.clubPending": "当前球队待补",
    "players.card.viewProfile": "查看球员档案",
    "players.card.details": "查看",
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
    "tournamentDetail.squad.eyebrow": "Squad List",
    "tournamentDetail.squad.title": "中国完整名单",
    "tournamentDetail.squad.empty": "当前还没有录入中国完整名单。",
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
    "playerDetail.marketValue.withLink": "Transfermarkt 外链已关联",
    "playerDetail.marketValue.withoutLink": "暂无稳定身价来源",
    "playerDetail.marketValue.note": "身价字段暂不参与球员排序，待外部数据稳定后补全。",
    "playerDetail.hero.summary": "{country} · {birthYear} 年生 · {position}。现属 {club}。",
    "playerDetail.actions.links": "查看外部资料",
    "playerDetail.actions.competition": "查看赛事记录",
    "playerDetail.status.eyebrow": "Data Status",
    "playerDetail.status.title": "资料状态",
    "playerDetail.status.currentTeam": "当前球队",
    "playerDetail.status.transfermarkt": "Transfermarkt",
    "playerDetail.status.transfermarktLinked": "已关联",
    "playerDetail.status.transfermarktMissing": "未关联",
    "playerDetail.status.marketValue": "身价数据",
    "playerDetail.status.marketValuePending": "待补充",
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
    "playerDetail.stats.parentClub": "俱乐部",
    "playerDetail.stats.currentSquad": "梯队",
    "playerDetail.stats.currentLeague": "参赛体系",
    "playerDetail.nameMeta.zh": "中文：{value}",
    "playerDetail.nameMeta.native": "原文：{value}",
    "playerDetail.nameMeta.en": "英文：{value}",
    "playerDetail.pathway.countryPending": "国家待补",
    "playerDetail.pathway.empty": "当前样本尚未补到可用的青训路径。",
    "playerDetail.participation.empty": "当前样本还没有赛事参与记录。",
    "playerDetail.participation.statLine": "{appearances} 场 · {goals} 球 · {minutes} 分钟",
    "playerDetail.participation.statsPending": "详细出场数据待补",
    "playerDetail.verification.lastChecked": "最后校验：{date}",
    "playerDetail.verification.noNote": "暂无补充说明",
    "playerDetail.recent.empty": "当前还没有匹配到这名球员的结构化比赛贡献。",
    "playerDetail.links.empty": "当前样本没有外部链接。",
    "tournaments.hero.eyebrow": "Tournament Directory",
    "tournaments.hero.title": "赛事列表",
    "tournaments.hero.text": "这里汇总 2020 年之后的亚洲杯各年龄段、世界杯、世青赛、世少赛，并单独展开中国战绩与比赛明细。",
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
    "tournaments.archive.matchLabel": "中国 vs {opponent} {score} ({result})",
    "tournaments.archive.noContrib": "本场暂无已录入的进球 / 助攻事件。",
    "tournaments.archive.noChinaMatches": "中国队在该赛事无已录入比赛，或未参赛。",
    "tournaments.archive.chinaSummary": "中国战绩：{summary}",
    "tournaments.archive.chinaStage": "中国阶段：{stage}",
    "tournaments.archive.lineupTitle": "中国首发{formation}",
    "tournaments.archive.benchTitle": "中国替补名单",
    "tournaments.card.open": "查看赛事",
    "overseas.hero.eyebrow": "Overseas Tracker",
    "overseas.hero.title": "留洋专页",
    "overseas.hero.text": "当前页把“现役海外样本”和“历史记录”拆开。现役部分默认显示当前仍在海外的球员，历史部分默认显示当前已不在海外的样本；切换年份后，可回看当年仍在海外的球员列表。",
    "overseas.note.eyebrow": "Note",
    "overseas.note.text": "这里展示的是当前已建档样本，不是官方全量留洋人数。",
    "overseas.filters.country": "国别",
    "overseas.filters.bucket": "联赛桶",
    "overseas.filters.year": "历史年份",
    "overseas.filters.actions": "操作",
    "overseas.filters.reset": "重置筛选",
    "overseas.filters.allCountry": "全部国别",
    "overseas.filters.allBucket": "全部联赛桶",
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
    "overseas.history.meta.default": "当前筛选下 {count} 条当前已不在海外的历史样本",
    "overseas.history.meta.year": "{year} 年命中 {count} 条当年在海外的样本",
    "overseas.countryNotes.noNote": "暂无说明",
    "overseas.countryNotes.empty": "当前没有可展示的国别说明。"
  },
  en: {
    "page.home.title": "Youth Player Tracking Desk",
    "page.home.description": "A static data site focused on Chinese youth development, Asian youth tournaments, and overseas player samples across China, Japan, and South Korea.",
    "page.players.title": "Player Directory | Youth Player Tracking Desk",
    "page.players.description": "Filter youth and young player samples by nationality, age band, current league system, and tags.",
    "page.player-detail.title": "Player Detail | Youth Player Tracking Desk",
    "page.player-detail.description": "View player pathways, tournament logs, current club, recent contributions, and external references.",
    "page.tournaments.title": "Tournament Directory | Youth Player Tracking Desk",
    "page.tournaments.description": "Browse Asian Cups, World Cups, U-20 World Cups, and U-17 World Cups by level with China results and source links.",
    "page.tournament-detail.title": "Tournament Detail | Youth Player Tracking Desk",
    "page.tournament-detail.description": "View one tournament at a time with date range, China results, match detail, key players, and source links.",
    "page.overseas.title": "Overseas Tracker | Youth Player Tracking Desk",
    "page.overseas.description": "Compare current overseas samples and historical records for China, Japan, and South Korea.",
    "site.kicker": "Youth Tracking Desk",
    "site.brand": "Youth Player Tracking Desk",
    "nav.aria": "Main navigation",
    "nav.home": "Home",
    "nav.players": "Players",
    "nav.tournaments": "Tournaments",
    "nav.overseas": "Overseas",
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
    "home.quickLinks.playersText": "Filter player samples by country, age band, and tags.",
    "home.quickLinks.tournamentsTitle": "Tournaments",
    "home.quickLinks.tournamentsText": "Check tournament dates, results, and China match detail.",
    "home.quickLinks.overseasTitle": "Overseas",
    "home.quickLinks.overseasText": "Separate current overseas samples from historical records.",
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
    "home.overseasCard.current": "Current: {value}",
    "home.overseasCard.region": "Region: {value}",
    "home.overseasCard.origin": "Origin: {value}",
    "home.overseasCard.path": "Overseas path: {value}",
    "home.overseasCard.sample": "Sample: {value}",
    "home.overseasCard.league": "League: {value}",
    "players.hero.eyebrow": "Player Directory",
    "players.hero.title": "Player directory",
    "players.hero.text": "This is the main entry point. Filter by nationality, age band, current league system, and topical tags, and switch between card view and table view.",
    "players.view.eyebrow": "View Modes",
    "players.view.aria": "View switch",
    "players.view.cards": "Cards",
    "players.view.table": "Table",
    "players.filters.search": "Search",
    "players.filters.searchPlaceholder": "Chinese name, native name, English name, club, tag",
    "players.filters.country": "Country",
    "players.filters.ageBand": "Age band",
    "players.filters.league": "League / system",
    "players.filters.tag": "Tag",
    "players.filters.actions": "Actions",
    "players.filters.reset": "Reset filters",
    "players.filters.allCountry": "All countries",
    "players.filters.allAgeBand": "All age bands",
    "players.filters.allLeague": "All leagues / systems",
    "players.filters.allTag": "All tags",
    "players.table.player": "Player",
    "players.table.country": "Country",
    "players.table.age": "Age",
    "players.table.club": "Current club",
    "players.table.league": "League / system",
    "players.table.tag": "Tag",
    "players.table.detail": "View",
    "players.empty": "No players match the current filters.",
    "players.meta.results": "{count} / {total} players in this filter",
    "players.card.positionPending": "Position TBD",
    "players.card.clubPending": "Club TBD",
    "players.card.viewProfile": "View player file",
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
    "tournamentDetail.squad.eyebrow": "Squad List",
    "tournamentDetail.squad.title": "China full squad",
    "tournamentDetail.squad.empty": "No China full-squad record has been added for this tournament yet.",
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
    "playerDetail.marketValue.withLink": "Transfermarkt linked",
    "playerDetail.marketValue.withoutLink": "No stable market value source yet",
    "playerDetail.marketValue.note": "Market value is not used for sorting yet. The field will be filled once the external data is stable.",
    "playerDetail.hero.summary": "{country} · born {birthYear} · {position}. Currently with {club}.",
    "playerDetail.actions.links": "View external sources",
    "playerDetail.actions.competition": "View competition log",
    "playerDetail.status.eyebrow": "Data Status",
    "playerDetail.status.title": "Data status",
    "playerDetail.status.currentTeam": "Current team",
    "playerDetail.status.transfermarkt": "Transfermarkt",
    "playerDetail.status.transfermarktLinked": "Linked",
    "playerDetail.status.transfermarktMissing": "Missing",
    "playerDetail.status.marketValue": "Market value",
    "playerDetail.status.marketValuePending": "Pending",
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
    "playerDetail.stats.parentClub": "Club",
    "playerDetail.stats.currentSquad": "Squad",
    "playerDetail.stats.currentLeague": "Competition system",
    "playerDetail.nameMeta.zh": "Chinese: {value}",
    "playerDetail.nameMeta.native": "Native: {value}",
    "playerDetail.nameMeta.en": "English: {value}",
    "playerDetail.pathway.countryPending": "Country TBD",
    "playerDetail.pathway.empty": "No usable pathway has been added for this sample yet.",
    "playerDetail.participation.empty": "No tournament participation record has been added for this sample yet.",
    "playerDetail.participation.statLine": "{appearances} apps · {goals} goals · {minutes} mins",
    "playerDetail.participation.statsPending": "Detailed appearance data pending",
    "playerDetail.verification.lastChecked": "Last checked: {date}",
    "playerDetail.verification.noNote": "No additional note",
    "playerDetail.recent.empty": "No structured match contribution has been matched to this player yet.",
    "playerDetail.links.empty": "No external links for this sample yet.",
    "tournaments.hero.eyebrow": "Tournament Directory",
    "tournaments.hero.title": "Tournament directory",
    "tournaments.hero.text": "This page consolidates post-2020 Asian Cups by age group, the World Cup, the U-20 World Cup, and the U-17 World Cup, with separate China results and match detail.",
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
    "tournaments.archive.matchLabel": "China vs {opponent} {score} ({result})",
    "tournaments.archive.noContrib": "No recorded goal or assist event for this match yet.",
    "tournaments.archive.noChinaMatches": "No China match has been recorded for this tournament, or China did not qualify.",
    "tournaments.archive.chinaSummary": "China summary: {summary}",
    "tournaments.archive.chinaStage": "China stage: {stage}",
    "tournaments.archive.lineupTitle": "China starting XI{formation}",
    "tournaments.archive.benchTitle": "China bench",
    "tournaments.card.open": "View tournament",
    "overseas.hero.eyebrow": "Overseas Tracker",
    "overseas.hero.title": "Overseas tracker",
    "overseas.hero.text": "This page separates active overseas samples from historical records. The active section defaults to players who are still abroad right now, while the history section defaults to players who are no longer abroad; once you switch the year filter, it becomes a year-by-year view of who was abroad in that season window.",
    "overseas.note.eyebrow": "Note",
    "overseas.note.text": "This page shows currently archived samples, not an official full headcount of all overseas players.",
    "overseas.filters.country": "Country",
    "overseas.filters.bucket": "League bucket",
    "overseas.filters.year": "History year",
    "overseas.filters.actions": "Actions",
    "overseas.filters.reset": "Reset filters",
    "overseas.filters.allCountry": "All countries",
    "overseas.filters.allBucket": "All league buckets",
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
    "overseas.history.meta.default": "{count} historical records currently no longer abroad in this filter",
    "overseas.history.meta.year": "{count} records abroad in {year}",
    "overseas.countryNotes.noNote": "No note yet",
    "overseas.countryNotes.empty": "No country note is available for display."
  }
};

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
  "tournament-detail": {
    title: "page.tournament-detail.title",
    description: "page.tournament-detail.description"
  },
  overseas: { title: "page.overseas.title", description: "page.overseas.description" }
};

const COUNTRY_LABELS = {
  zh: {
    Argentina: "阿根廷",
    Belgium: "比利时",
    Canada: "加拿大",
    Chile: "智利",
    China: "中国",
    "China PR": "中国",
    Croatia: "克罗地亚",
    England: "英格兰",
    France: "法国",
    Germany: "德国",
    Indonesia: "印度尼西亚",
    Italy: "意大利",
    Japan: "日本",
    "Korea Republic": "韩国",
    Mexico: "墨西哥",
    Netherlands: "荷兰",
    Portugal: "葡萄牙",
    Qatar: "卡塔尔",
    "Saudi Arabia": "沙特阿拉伯",
    Serbia: "塞尔维亚",
    Spain: "西班牙",
    Thailand: "泰国",
    "United Arab Emirates": "阿联酋",
    "United States": "美国",
    Uzbekistan: "乌兹别克斯坦",
    "Canada / Mexico / United States": "加拿大 / 墨西哥 / 美国"
  },
  en: {
    China: "China",
    "China PR": "China PR",
    "Korea Republic": "South Korea",
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
    "Right Winger": "右边锋"
  },
  en: {}
};

const STATUS_LABELS = {
  completed: { zh: "已结束", en: "Completed" },
  ongoing: { zh: "进行中", en: "Ongoing" },
  upcoming: { zh: "未开始", en: "Upcoming" },
  "in-progress": { zh: "进行中", en: "In progress" }
};

const CHINA_STATUS_LABELS = {
  "group-stage": { zh: "小组赛", en: "Group stage" },
  "quarter-final": { zh: "八强", en: "Quarter-final" },
  "semi-final": { zh: "四强", en: "Semi-final" },
  champion: { zh: "冠军", en: "Champions" },
  "runner-up": { zh: "亚军", en: "Runners-up" },
  "finalist-ongoing": { zh: "决赛进行中", en: "Final in progress" },
  qualified: { zh: "已晋级", en: "Qualified" },
  "did-not-qualify": { zh: "未晋级", en: "Did not qualify" },
  "did-not-participate": { zh: "未参赛", en: "Did not participate" }
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
  "americas-other": { zh: "美洲其他", en: "Other Americas" }
};

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

const MATCH_RESULT_LABELS = {
  W: { zh: "胜", en: "W" },
  D: { zh: "平", en: "D" },
  L: { zh: "负", en: "L" },
  TBD: { zh: "待定", en: "TBD" }
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

document.addEventListener("DOMContentLoaded", () => {
  initializeLanguage();
  void boot();
});

async function boot() {
  try {
    const [players, overview] = await Promise.all([
      fetchJson("./data/site/players.json"),
      fetchJson("./data/site/overview.json")
    ]);

    state.players = players;
    state.overview = overview;
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

    if (page === "tournament-detail") {
      renderTournamentDetailPage();
      return;
    }

    if (page === "tournaments") {
      initializeTournamentFilters();
      renderTournamentsPage();
      return;
    }

    if (page === "overseas") {
      initializeOverseasFilters();
      renderOverseasPage();
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
      (page === "tournament-detail" && link.dataset.nav === "tournaments")
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

  return {
    currentTeamRaw,
    currentTeam: formatClubName(currentTeamRaw || t("common.pending")),
    parentClubRaw,
    parentClub: formatClubName(parentClubRaw || t("common.pending")),
    squadLabel: squadLabel || t("common.pending"),
    system: formatLeagueSystem(player.currentLeagueSystem)
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

  const tail =
    state.language === "en"
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
  if (entry.goals !== null && entry.goals !== undefined) {
    parts.push(state.language === "en" ? `${entry.goals} goals` : `${entry.goals} 球`);
  }
  if (entry.minutes !== null && entry.minutes !== undefined) {
    parts.push(state.language === "en" ? `${entry.minutes} mins` : `${entry.minutes} 分钟`);
  }
  return parts.join(" · ") || t("playerDetail.participation.statsPending");
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

function getTournamentDisplayName(id) {
  const archive = getArchiveTournamentById(id);
  if (archive) {
    return archive.competition_name;
  }

  return getFocusTournamentById(id)?.name ?? id;
}

function getTournamentResultSummary(tournament) {
  return tournament.status === "completed"
    ? t("tournaments.archive.completedResult", {
        champion: tournament.champion || "-",
        runnerUp: tournament.runner_up || "-"
      })
    : tournament.status === "ongoing"
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

function renderContributionItem(entry) {
  return `<li>${formatContributionType(entry.type)}: ${renderPlayerReference(entry)}${entry.minute ? ` ${escapeHtml(entry.minute)}'` : ""}${entry.role ? ` · ${formatContributionRole(entry.role)}` : ""}</li>`;
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
    <div class="archive-lineup">
      <p class="small-note">${escapeHtml(t("tournaments.archive.lineupTitle", { formation: formationLabel }))}</p>
      <ul class="mini-bullet-list">
        ${starters.map((item) => `<li>${renderPlayerReference(item)}</li>`).join("")}
      </ul>
      ${
        substitutes.length > 0
          ? `
            <p class="small-note">${escapeHtml(t("tournaments.archive.benchTitle"))}</p>
            <ul class="mini-bullet-list">
              ${substitutes.map((item) => `<li>${renderPlayerReference(item)}</li>`).join("")}
            </ul>
          `
          : ""
      }
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
  if (explicitSquad.length > 0) {
    return [...explicitSquad].sort((left, right) => (left.squad_number ?? 999) - (right.squad_number ?? 999));
  }

  return state.enrichedPlayers
    .filter(
      (player) =>
        player.country === "China PR" &&
        (player.tournament_participation ?? []).some((entry) => entry.competition_id === tournament?.id)
    )
    .map((player) => ({ player_id: player.id, player: player.name }))
    .sort((left, right) => getPlayerReferenceLabel(left).localeCompare(getPlayerReferenceLabel(right), getSortLocale()));
}

function renderTournamentSquadCard(entry) {
  const player = resolvePlayerReference(entry);
  const label = getPlayerReferenceLabel(entry);
  const club = player?.registration_club?.name ?? t("common.pending");
  const position = player ? formatPosition(player.primary_position) : t("players.card.positionPending");

  return `
    <article class="player-card player-card-compact">
      <div class="chip-row">
        ${entry.squad_number ? `<span class="chip">#${escapeHtml(entry.squad_number)}</span>` : ""}
        ${player?.age_band ? `<span class="chip">${formatAgeBand(player.age_band)}</span>` : ""}
      </div>
      <h3>${renderPlayerReference(entry)}</h3>
      <p>${escapeHtml(position)}</p>
      <p class="small-note">${escapeHtml(formatClubName(club))}</p>
    </article>
  `;
}

function enrichPlayer(player, overview) {
  return {
    ...player,
    age: getAge(player.birth_date, overview.generated_at),
    currentLeagueSystem: inferLeagueSystem(player),
    overseasBucket: inferOverseasBucket(player),
    foreignRegistration: isForeignRegistration(player),
    recentContributions: collectPlayerContributions(player, overview),
    searchBlob: buildPlayerSearchBlob(player)
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
  return state.enrichedPlayers.filter((player) => player.foreignRegistration).sort(sortPlayers);
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
      verifiedRecords: entry.verified_records,
      notes: entry.notes,
      bucketFocus: entry.bucket_focus
    });
  }

  for (const item of getCurrentOverseasItems()) {
    if (!map.has(item.country)) {
      map.set(item.country, {
        country: item.country,
        currentCount: 0,
        verifiedRecords: 0,
        notes: "",
        bucketFocus: []
      });
    }
    map.get(item.country).currentCount += 1;
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
    overseasBucket: record.bucket
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
    ...getActiveHistoricalOverseasRecords().map(toCurrentHistoricalOverseasItem)
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

function renderHomePage() {
  const homePlayerCount = document.querySelector("#homePlayerCount");
  const homeOverseasCount = document.querySelector("#homeOverseasCount");
  const homeArchiveCount = document.querySelector("#homeArchiveCount");
  const homeUpdatedDate = document.querySelector("#homeUpdatedDate");
  const homeNextEventHero = document.querySelector("#homeNextEventHero");
  const homeRecentMatches = document.querySelector("#homeRecentMatches");
  const homeOverseasSummary = document.querySelector("#homeOverseasSummary");

  const overseasPlayers = getCurrentOverseasItems();
  const heroEvent = getHomeFocusTournament();

  homePlayerCount.textContent = String(state.enrichedPlayers.length);
  homeOverseasCount.textContent = String(overseasPlayers.length);
  homeArchiveCount.textContent = String(state.overview.tournament_archive.length);
  homeUpdatedDate.textContent = formatDate(state.overview.generated_at);

  homeNextEventHero.innerHTML = renderHomeFocusEvent(heroEvent);

  homeRecentMatches.innerHTML = getRecentChinaMatches().map(renderRecentMatchCard).join("");

  homeOverseasSummary.innerHTML = getOverseasCountryMap().map(renderHomeOverseasSummaryRow).join("");
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
  state.playerFilters.query = params.get("query") ?? "";
  state.playerFilters.country = params.get("country") ?? "all";
  state.playerFilters.ageBand = params.get("ageBand") ?? "all";
  state.playerFilters.leagueSystem = params.get("league") ?? "all";
  state.playerFilters.tag = params.get("tag") ?? "all";
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
  const leagueOptions = uniqueValues(state.enrichedPlayers.map((player) => player.currentLeagueSystem)).map(
    (value) => ({
      value,
      label: formatLeagueSystem(value)
    })
  );
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
    document.querySelector("#playerLeagueFilter"),
    leagueOptions,
    state.playerFilters.leagueSystem,
    t("players.filters.allLeague")
  );
  buildOptions(
    document.querySelector("#playerTagFilter"),
    tagOptions,
    state.playerFilters.tag,
    t("players.filters.allTag")
  );
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
  document.querySelector("#playerLeagueFilter")?.addEventListener("change", (event) => {
    state.playerFilters.leagueSystem = event.target.value;
    renderPlayersPage();
  });
  document.querySelector("#playerTagFilter")?.addEventListener("change", (event) => {
    state.playerFilters.tag = event.target.value;
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
    state.playerFilters.leagueSystem = "all";
    state.playerFilters.tag = "all";
    state.playerFilters.view = "cards";
    renderPlayersPage();
  });
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
      const matchesLeague =
        state.playerFilters.leagueSystem === "all" ||
        player.currentLeagueSystem === state.playerFilters.leagueSystem;
      const matchesTag =
        state.playerFilters.tag === "all" ||
        (player.focus_tags ?? []).includes(state.playerFilters.tag);

      return matchesQuery && matchesCountry && matchesAge && matchesLeague && matchesTag;
    })
    .sort(sortPlayers);
}

function renderPlayersPage() {
  const cardGrid = document.querySelector("#playerCardGrid");
  const tableWrap = document.querySelector("#playerTableWrap");
  const tableBody = document.querySelector("#playerTableBody");
  const emptyState = document.querySelector("#playerListEmptyState");
  const meta = document.querySelector("#playerResultsMeta");
  const cardsButton = document.querySelector("#viewCardsButton");
  const tableButton = document.querySelector("#viewTableButton");

  const players = getFilteredPlayers();

  setControlValue("#playerSearchInput", state.playerFilters.query);
  setControlValue("#playerCountryFilter", state.playerFilters.country);
  setControlValue("#playerAgeFilter", state.playerFilters.ageBand);
  setControlValue("#playerLeagueFilter", state.playerFilters.leagueSystem);
  setControlValue("#playerTagFilter", state.playerFilters.tag);
  replaceQueryParams({
    query: state.playerFilters.query,
    country: state.playerFilters.country,
    ageBand: state.playerFilters.ageBand,
    league: state.playerFilters.leagueSystem,
    tag: state.playerFilters.tag,
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

  cardGrid.innerHTML = players.map((player) => renderPlayerCard(player, false)).join("");
  tableBody.innerHTML = players.map(renderPlayerTableRow).join("");
  emptyState.hidden = players.length > 0;
}

function renderPlayerCard(player, compact) {
  const primaryName = getPlayerPrimaryName(player);
  const secondaryNames = getPlayerSecondaryNames(player).join(" / ");
  const affiliation = getPlayerAffiliation(player);
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
      <p class="small-note">${escapeHtml(affiliation.currentTeam || t("players.card.clubPending"))} · ${escapeHtml(formatLeagueSystem(player.currentLeagueSystem))}</p>
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
      <td>${escapeHtml(affiliation.currentTeam || "-")}</td>
      <td>${escapeHtml(formatLeagueSystem(player.currentLeagueSystem))}</td>
      <td>${escapeHtml((player.focus_tags ?? []).slice(0, 3).map(formatTag).join(" / ") || "-")}</td>
      <td><a class="inline-link" href="${buildPlayerDetailUrl(player.id)}">${escapeHtml(t("players.card.details"))}</a></td>
    </tr>
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

function renderPlayerDetailPage() {
  const hero = document.querySelector("#playerDetailHero");
  const body = document.querySelector("#playerDetailBody");
  const stats = document.querySelector("#playerDetailStats");
  const pathwayTimeline = document.querySelector("#playerPathwayTimeline");
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
  const transfermarktLinked = hasTransfermarktLink(player);
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
        ${renderStatusItem(t("playerDetail.status.currentTeam"), affiliation.currentTeam)}
        ${renderStatusItem(
          t("playerDetail.status.transfermarkt"),
          transfermarktLinked ? t("playerDetail.status.transfermarktLinked") : t("playerDetail.status.transfermarktMissing")
        )}
        ${renderStatusItem(
          t("playerDetail.status.marketValue"),
          transfermarktLinked ? t("playerDetail.status.marketValuePending") : t("playerDetail.status.marketValueMissing")
        )}
        ${renderStatusItem(t("playerDetail.status.externalLinks"), String((player.external_links ?? []).length))}
        ${renderStatusItem(t("playerDetail.status.recentContributions"), String(player.recentContributions.length))}
        ${renderStatusItem(t("playerDetail.status.verification"), verificationLabel)}
      </dl>
      <p class="hero-side-note">${escapeHtml(t("playerDetail.status.lastChecked", { date: formatDate(player.verification?.last_checked ?? pageDate) }))}</p>
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
    { label: t("playerDetail.stats.currentTeam"), value: affiliation.currentTeam },
    { label: t("playerDetail.stats.parentClub"), value: affiliation.parentClub },
    { label: t("playerDetail.stats.currentSquad"), value: affiliation.squadLabel },
    { label: t("playerDetail.stats.currentLeague"), value: affiliation.system }
  ];

  stats.innerHTML = [
    renderDetailInfoCard(t("playerDetail.profile.eyebrow"), t("playerDetail.profile.title"), basicItems),
    renderDetailInfoCard(t("playerDetail.affiliation.eyebrow"), t("playerDetail.affiliation.title"), affiliationItems)
  ].join("");

  pathwayTimeline.innerHTML =
    (player.training_pathway ?? []).length > 0
      ? player.training_pathway
          .map(
            (step) => `
              <article class="timeline-item">
                <p class="timeline-label">${escapeHtml(localizeText(step.stage_label))}</p>
                <h3>${escapeHtml(formatClubName(step.organization))}</h3>
                <p>${escapeHtml(formatCountryName(step.country ?? t("playerDetail.pathway.countryPending")))}</p>
                ${step.note ? `<p class="small-note">${escapeHtml(localizeText(step.note))}</p>` : ""}
              </article>
            `
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
                <p class="small-note">${escapeHtml(formatParticipationStatLine(entry))}</p>
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

function renderTournamentDetailPage() {
  const hero = document.querySelector("#tournamentDetailHero");
  const body = document.querySelector("#tournamentDetailBody");
  const stats = document.querySelector("#tournamentDetailStats");
  const context = document.querySelector("#tournamentDetailContext");
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

  const squadEntries = archiveTournament ? getTournamentSquadEntries(archiveTournament) : [];
  squad.innerHTML =
    squadEntries.length > 0
      ? squadEntries.map(renderTournamentSquadCard).join("")
      : `<div class="empty-inline">${escapeHtml(t("tournamentDetail.squad.empty"))}</div>`;

  matches.innerHTML =
    (archiveTournament?.china_matches ?? []).length > 0
      ? archiveTournament.china_matches.map(renderTournamentDetailMatchCard).join("")
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

function hasTransfermarktLink(player) {
  return (player.external_links ?? []).some((link) => normalize(link.label).includes("transfermarkt"));
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
  return state.overview.tournament_archive.filter((tournament) => {
    if (state.tournamentFilters.level === "all") {
      return true;
    }
    return tournament.level === state.tournamentFilters.level;
  });
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
  const matches =
    (tournament.china_matches ?? []).length > 0
      ? tournament.china_matches
          .map(
            (match) => `
              <article class="archive-match">
                <strong>${escapeHtml(localizeText(match.stage))} · ${formatDate(match.date)}</strong>
                ${renderTournamentMatchContent(match)}
              </article>
            `
          )
          .join("")
      : `<p class="small-note">${escapeHtml(t("tournaments.archive.noChinaMatches"))}</p>`;

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
      <p class="small-note">${escapeHtml(t("tournaments.archive.chinaSummary", { summary: localizeText(tournament.china_summary) }))}</p>
      <p class="small-note">${escapeHtml(t("tournaments.archive.chinaStage", { stage: formatChinaStatus(tournament.china_status) }))}</p>
      <div class="archive-match-list">${matches}</div>
      <div class="pill-row">${renderLinkPills(tournament.source_links)}</div>
      <a class="primary-link primary-link-inline" href="${buildTournamentDetailUrl(tournament.id)}">${escapeHtml(t("tournaments.card.open"))}</a>
    </article>
  `;
}

function initializeOverseasFilters() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("country")) {
    state.overseasFilters.country = params.get("country");
  }
  if (params.get("bucket")) {
    state.overseasFilters.bucket = params.get("bucket");
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
  const yearOptions = getHistoricalYearOptions();

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
    document.querySelector("#overseasYearFilter"),
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
  document.querySelector("#overseasYearFilter")?.addEventListener("change", (event) => {
    state.overseasFilters.year = event.target.value;
    renderOverseasPage();
  });
  document.querySelector("#overseasResetButton")?.addEventListener("click", () => {
    state.overseasFilters.country = "all";
    state.overseasFilters.bucket = "all";
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
    return matchesCountry && matchesBucket;
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
  setControlValue("#overseasYearFilter", state.overseasFilters.year);
  replaceQueryParams({
    country: state.overseasFilters.country,
    bucket: state.overseasFilters.bucket,
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
        ${(selectedCountry.bucketFocus ?? [])
          .map(
            (note) => `
              <article class="stack-card">
                <p>${escapeHtml(localizeText(note))}</p>
              </article>
            `
          )
          .join("")}
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
      <ul class="mini-bullet-list">
        ${(record.notes ?? []).map((note) => `<li>${escapeHtml(localizeText(note))}</li>`).join("")}
      </ul>
    </article>
  `;
}
