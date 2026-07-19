import { auditFreshness } from "./freshness-audit.mjs";
import {
  buildCoachCatalog,
  buildProjectCatalog,
  deriveQualityStatus,
  getSourceTier
} from "../../assets/data-insights.js";

const QUALITY_STATUSES = ["complete", "mixed", "partial", "needs-review", "stale", "excluded"];

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeSources(sources, { checkedAt = null, tier = null } = {}) {
  return asArray(sources)
    .map((source) => {
      const url = source?.url ?? source?.path ?? "";
      if (!/^https?:\/\//.test(url)) return null;
      return {
        label: source.label ?? source.title ?? url,
        url,
        type: source.type ?? null,
        checked_at: source.checked_at ?? checkedAt,
        source_tier: source.source_tier ?? tier
      };
    })
    .filter(Boolean);
}

function latestDate(values) {
  return values.filter((value) => /^\d{4}-\d{2}-\d{2}$/.test(String(value ?? ""))).sort().at(-1) ?? null;
}

function earliestDate(values) {
  return values.filter((value) => /^\d{4}-\d{2}-\d{2}$/.test(String(value ?? ""))).sort().at(0) ?? null;
}

function qualityEntry({ id, verificationStatus, confidence, stale, missingFields, sources, checkedAt }) {
  const sourceTiers = sources.map(getSourceTier).filter(Number.isInteger);
  return {
    id,
    status: deriveQualityStatus({
      verificationStatus,
      confidence,
      stale,
      missingFields,
      sources
    }),
    source_tier: sourceTiers.length > 0 ? Math.min(...sourceTiers) : null,
    checked_at: checkedAt ?? latestDate(sources.map((source) => source.checked_at)),
    missing_fields: [...new Set(missingFields)].sort()
  };
}

function summarizeDataset(id, label, entries) {
  const qualityCounts = Object.fromEntries(QUALITY_STATUSES.map((status) => [status, 0]));
  const sourceTierCounts = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0, "6": 0, unclassified: 0 };
  const missingCounts = new Map();
  for (const entry of entries) {
    qualityCounts[entry.status] += 1;
    sourceTierCounts[entry.source_tier === null ? "unclassified" : String(entry.source_tier)] += 1;
    for (const field of entry.missing_fields) missingCounts.set(field, (missingCounts.get(field) ?? 0) + 1);
  }
  const dates = entries.map((entry) => entry.checked_at);
  return {
    id,
    label,
    record_count: entries.length,
    quality: qualityCounts,
    source_tiers: sourceTierCounts,
    checked_at: {
      oldest: earliestDate(dates),
      newest: latestDate(dates)
    },
    overdue_records: qualityCounts.stale,
    missing_fields: [...missingCounts.entries()]
      .map(([field, count]) => ({ field, count }))
      .sort((left, right) => right.count - left.count || left.field.localeCompare(right.field))
  };
}

function sourceTierForPublisher(publisher) {
  return /^(AFC|FIFA|CFA|UEFA|JFA|KFA)$/i.test(String(publisher ?? "")) ? 1 : null;
}

function playerQualityEntries(dataset, staleIds) {
  return dataset.players.map((player) => {
    const missing = [];
    if (player.name_verification?.status === "unresolved") missing.push("names.native_verified");
    if (asArray(player.source_layers).length === 0) missing.push("source_layers");
    const sources = [
      ...normalizeSources(player.source_layers, { checkedAt: player.verification?.last_checked }),
      ...normalizeSources(player.external_links, { checkedAt: player.verification?.last_checked })
    ];
    return qualityEntry({
      id: player.id,
      verificationStatus: player.verification?.status,
      stale: staleIds.has(player.id),
      missingFields: missing,
      sources,
      checkedAt: player.verification?.last_checked
    });
  });
}

function tournamentQualityEntries(dataset, staleIds) {
  return dataset.tournaments.map((tournament) => {
    const missing = [];
    if (asArray(tournament.sources).length === 0) missing.push("sources");
    const sources = asArray(tournament.sources).flatMap((source) =>
      normalizeSources([source], {
        checkedAt: tournament.last_checked,
        tier: sourceTierForPublisher(source.publisher)
      })
    );
    return qualityEntry({
      id: tournament.id,
      stale: staleIds.has(tournament.id),
      missingFields: missing,
      sources,
      checkedAt: tournament.last_checked
    });
  });
}

function archiveQualityEntries(dataset, staleIds) {
  return dataset.tournamentArchive.map((tournament) => {
    const missing = [];
    if (!tournament.source_checked_at) missing.push("source_checked_at");
    if (asArray(tournament.source_version).length === 0) missing.push("source_version");
    if (tournament.status === "completed" && !tournament.final_draw) missing.push("final_draw");
    const sources = normalizeSources(
      [...asArray(tournament.source_links), ...asArray(tournament.source_version)],
      { checkedAt: tournament.source_checked_at }
    );
    return qualityEntry({
      id: tournament.id,
      stale: staleIds.has(tournament.id),
      missingFields: missing,
      sources,
      checkedAt: tournament.source_checked_at
    });
  });
}

function projectQualityEntries(catalog) {
  return catalog.map((entry) =>
    qualityEntry({
      id: entry.id,
      verificationStatus: entry.status === "needs-review" ? "needs-review" : "verified",
      missingFields: entry.missing_fields,
      sources: entry.sources,
      checkedAt: entry.checked_at
    })
  );
}

function coachQualityEntries(catalog, staleIds, staleArchives) {
  return catalog.map((entry) =>
    qualityEntry({
      id: entry.id,
      verificationStatus: entry.verification_status,
      confidence: entry.confidence,
      stale:
        staleIds.has(entry.record_id) ||
        (entry.categories.includes("big-five") && staleArchives.has("big-five-asian-coaches")) ||
        (entry.categories.includes("china-national-youth") && staleArchives.has("china-men-youth-coaches")),
      missingFields: entry.missing_fields,
      sources: entry.sources,
      checkedAt: entry.checked_at
    })
  );
}

function dossierQualityEntries(dataset) {
  return dataset.dossiers.map((dossier) => {
    const sources = normalizeSources(dossier.supporting_documents, { checkedAt: dossier.last_reviewed });
    return qualityEntry({
      id: dossier.id,
      verificationStatus: dossier.status === "needs-review" ? "needs-review" : "verified",
      missingFields: [
        ...(sources.length > 0 ? [] : ["supporting_documents"]),
        ...(dossier.last_reviewed ? [] : ["last_reviewed"])
      ],
      sources,
      checkedAt: dossier.last_reviewed
    });
  });
}

function scoutingQualityEntries(dataset) {
  const watchlist = dataset.scoutingWatchlist;
  return asArray(watchlist?.records).map((record) => {
    const sources = normalizeSources([{
      label: watchlist.source?.name ?? "Football Talent Scout",
      url: record.source_url,
      checked_at: record.source_checked_at
    }]);
    return qualityEntry({
      id: record.id,
      verificationStatus: "needs-review",
      missingFields: [],
      sources,
      checkedAt: record.source_checked_at
    });
  });
}

function overseasQualityEntries(dataset) {
  return asArray(dataset.overseasHistory?.countries).flatMap((country) =>
    asArray(country.featured_records).map((record) => {
      const sources = normalizeSources(record.source_links);
      return qualityEntry({
        id: record.id,
        verificationStatus: record.status === "needs-review" ? "needs-review" : "verified",
        missingFields: [
          ...(sources.length > 0 ? [] : ["source_links"]),
          ...(record.appearances === null ? ["appearances"] : [])
        ],
        sources,
        checkedAt: latestDate(sources.map((source) => source.checked_at))
      });
    })
  );
}

function systemQualityEntries(dataset) {
  return asArray(dataset.youthDevelopmentSystems?.systems).flatMap((system) =>
    asArray(system.competitions).map((competition) =>
      qualityEntry({
        id: competition.id,
        missingFields: [],
        sources: normalizeSources([{ label: competition.name?.en, url: competition.source_url }], {
          checkedAt: dataset.youthDevelopmentSystems.checked_at,
          tier: 1
        }),
        checkedAt: dataset.youthDevelopmentSystems.checked_at
      })
    )
  );
}

function uefaQualityEntries(dataset) {
  return asArray(dataset.uefaYouthLeague?.historical_season_index).map((season) =>
    qualityEntry({
      id: season.season,
      missingFields: [
        ...(season.source_checked_at ? [] : ["source_checked_at"]),
        ...(asArray(season.source_links).length > 0 ? [] : ["source_links"])
      ],
      sources: normalizeSources(season.source_links, { checkedAt: season.source_checked_at }),
      checkedAt: season.source_checked_at
    })
  );
}

export function buildSiteMeta({ dataset, overview, generatedAt, schemaManifest }) {
  const freshness = auditFreshness(dataset, dataset.playerMarketValues ?? { players: {} }, generatedAt);
  const stalePlayerIds = new Set();
  const staleTournamentIds = new Set();
  const staleArchiveIds = new Set();
  const staleCoachIds = new Set();
  const staleCoachArchives = new Set();
  for (const finding of freshness.findings) {
    if (finding.entity_type === "player") stalePlayerIds.add(finding.entity_id);
    if (finding.entity_type === "player-participation") stalePlayerIds.add(finding.entity_id.split(":")[0]);
    if (finding.entity_type === "tournament") staleTournamentIds.add(finding.entity_id);
    if (finding.entity_type === "tournament-archive") staleArchiveIds.add(finding.entity_id);
    if (finding.entity_type === "coach") staleCoachIds.add(finding.entity_id);
    if (finding.entity_type === "coach-stint") staleCoachIds.add(finding.entity_id.split(":")[0]);
    if (finding.entity_type === "coach-archive") staleCoachArchives.add(finding.entity_id);
  }

  const projects = buildProjectCatalog(overview);
  const coaches = buildCoachCatalog(overview);
  const quality = {
    players: playerQualityEntries(dataset, stalePlayerIds),
    tournaments: tournamentQualityEntries(dataset, staleTournamentIds),
    tournament_archive: archiveQualityEntries(dataset, staleArchiveIds),
    projects: projectQualityEntries(projects),
    dossiers: dossierQualityEntries(dataset),
    scouting_watchlist: scoutingQualityEntries(dataset),
    youth_systems: systemQualityEntries(dataset),
    coaches: coachQualityEntries(coaches, staleCoachIds, staleCoachArchives),
    overseas_history: overseasQualityEntries(dataset),
    uefa_youth_league: uefaQualityEntries(dataset)
  };

  const labels = {
    players: { zh: "球员", en: "Players" },
    tournaments: { zh: "当前赛事", en: "Current tournaments" },
    tournament_archive: { zh: "赛事档案", en: "Tournament archive" },
    projects: { zh: "青训项目", en: "Youth programmes" },
    dossiers: { zh: "专题档案", en: "Research dossiers" },
    scouting_watchlist: { zh: "球探观察池", en: "Scouting watchlist" },
    youth_systems: { zh: "国家青训节点", en: "National pathway nodes" },
    coaches: { zh: "教练", en: "Coaches" },
    overseas_history: { zh: "留洋历史", en: "Overseas history" },
    uefa_youth_league: { zh: "欧洲青年联赛赛季", en: "UEFA Youth League seasons" }
  };

  const datasets = Object.entries(quality).map(([id, entries]) => summarizeDataset(id, labels[id], entries));
  const qualityIndex = (entries) => Object.fromEntries(entries.map((entry) => [entry.id, entry]));

  return {
    $schema: "../schema/site-meta.schema.json",
    schema_version: 1,
    generated_at: generatedAt,
    build: {
      status: "unstamped",
      commit: null,
      built_at: null
    },
    sample_notice: {
      zh: "本站统计仅代表仓库已结构化并通过当前口径纳入的研究样本，不代表足协、赛事或现实世界官方全量。",
      en: "Statistics describe only research samples structured under this repository's current rules; they are not official or complete real-world totals."
    },
    coverage_summary: {
      dataset_count: datasets.length,
      record_count: datasets.reduce((total, entry) => total + entry.record_count, 0),
      stale_records: datasets.reduce((total, entry) => total + entry.quality.stale, 0),
      needs_review_records: datasets.reduce((total, entry) => total + entry.quality["needs-review"], 0)
    },
    freshness: {
      as_of: freshness.as_of,
      audited_records: freshness.audited_records,
      overdue: freshness.summary.overdue,
      by_window: freshness.summary.by_window
    },
    datasets,
    schemas: asArray(schemaManifest?.entries).map((entry) => ({
      path: entry.path,
      schema: entry.schema
    })),
    catalog_quality: {
      projects: qualityIndex(quality.projects),
      coaches: qualityIndex(quality.coaches)
    }
  };
}
