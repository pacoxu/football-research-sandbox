const QUALITY_STATUS_ORDER = ["excluded", "stale", "needs-review", "partial", "mixed", "complete"];

const SOURCE_TYPE_TIERS = new Map([
  ["official", 1],
  ["government", 1],
  ["association-announcement", 1],
  ["league-profile", 1],
  ["afc-registration", 1],
  ["national-fa-profile", 1],
  ["league-registration", 1],
  ["club", 2],
  ["school", 2],
  ["club-announcement", 2],
  ["club-academy-profile", 2],
  ["club-profile", 2],
  ["school-profile", 2],
  ["university-profile", 2],
  ["stats", 3],
  ["match", 3],
  ["state-media", 4],
  ["news", 4],
  ["wikipedia", 5],
  ["transfermarkt", 5],
  ["reference", 5],
  ["secondary-stats", 5],
  ["news-secondary", 5],
  ["social", 6],
  ["video", 6]
]);

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function unique(values) {
  return [...new Set(asArray(values).filter((value) => value !== undefined && value !== null && value !== ""))];
}

function uniqueObjects(values) {
  const byValue = new Map();
  for (const value of asArray(values).filter(Boolean)) {
    const key = JSON.stringify(value);
    if (!byValue.has(key)) byValue.set(key, value);
  }
  return [...byValue.values()];
}

function latestDate(values) {
  return unique(values).filter((value) => /^\d{4}-\d{2}-\d{2}$/.test(value)).sort().at(-1) ?? null;
}

function localName(value) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value.zh ?? value.en ?? value.native ?? "";
  }
  return String(value ?? "");
}

function normalizeSource(source, defaults = {}) {
  if (!source) return null;
  const url = source.url ?? source.path ?? source.source_url ?? "";
  if (!/^https?:\/\//.test(url)) return null;
  return {
    label: source.label ?? source.title ?? url,
    url,
    type: source.type ?? defaults.type ?? null,
    checked_at: source.checked_at ?? defaults.checkedAt ?? null,
    source_tier: source.source_tier ?? defaults.tier ?? null
  };
}

function normalizeSources(sources, defaults = {}) {
  const byUrl = new Map();
  for (const source of asArray(sources)) {
    const normalized = normalizeSource(source, defaults);
    if (normalized && !byUrl.has(normalized.url)) byUrl.set(normalized.url, normalized);
  }
  return [...byUrl.values()];
}

export function getSourceTier(source) {
  const explicit = Number(source?.source_tier);
  if (Number.isInteger(explicit) && explicit >= 1 && explicit <= 6) return explicit;
  const mapped = SOURCE_TYPE_TIERS.get(source?.type);
  if (mapped) return mapped;
  const url = String(source?.url ?? "").toLowerCase();
  if (url.includes("wikipedia.org")) return 5;
  if (url.includes("transfermarkt.")) return 5;
  return null;
}

export function deriveQualityStatus({
  verificationStatus,
  confidence,
  stale = false,
  missingFields = [],
  sources = []
} = {}) {
  if (verificationStatus === "rejected") return "excluded";
  if (stale || verificationStatus === "stale") return "stale";
  const tiers = sources.map(getSourceTier).filter(Number.isInteger);
  const bestTier = tiers.length > 0 ? Math.min(...tiers) : null;
  if (
    ["needs-review", "conflict", "provisional"].includes(verificationStatus) ||
    confidence === "low" ||
    bestTier === 6
  ) {
    return "needs-review";
  }
  if (missingFields.length > 0 || bestTier === null || bestTier === 5) return "partial";
  if (verificationStatus === "mixed-source" || confidence === "medium") return "mixed";
  return "complete";
}

export function compareQualityStatuses(left, right) {
  return QUALITY_STATUS_ORDER.indexOf(left) - QUALITY_STATUS_ORDER.indexOf(right);
}

function dossierSources(dossier) {
  return normalizeSources(dossier?.supporting_documents, { checkedAt: dossier?.last_reviewed });
}

export function buildProjectCatalog(overview = {}) {
  const dossiers = new Map(asArray(overview.dossiers).map((entry) => [entry.id, entry]));
  const researchProjects = asArray(overview.projects)
    .filter((project) => project.id !== "east-asia-overseas-history")
    .map((project) => {
      const dossier = dossiers.get(project.id);
      const sources = dossierSources(dossier);
      return {
        id: `research:${project.id}`,
        record_id: project.id,
        category: "research-project",
        name: { zh: project.name, en: project.name },
        country: "China PR",
        status: project.status,
        priority: project.priority,
        project_type: "research-tracker",
        age_band: null,
        organization_types: [],
        summary: { zh: project.summary ?? "", en: project.summary ?? "" },
        detail_url: dossier ? `./dossier.html?id=${encodeURIComponent(project.id)}` : null,
        sources,
        checked_at: dossier?.last_reviewed ?? null,
        missing_fields: [
          ...(dossier ? [] : ["dossier"]),
          ...(sources.length > 0 ? [] : ["source_links"]),
          ...(dossier?.last_reviewed ? [] : ["last_checked"])
        ]
      };
    });

  const systemProjects = asArray(overview.youth_development_systems?.systems).flatMap((system) =>
    asArray(system.competitions).map((competition) => ({
      id: `system:${competition.id}`,
      record_id: competition.id,
      category: "national-programme",
      name: competition.name,
      country: system.country,
      status: "documented",
      priority: null,
      project_type: competition.competition_type,
      age_band: competition.age_band,
      organization_types: asArray(competition.organization_types),
      summary: competition.stable_structure,
      detail_url: competition.source_url,
      sources: normalizeSources([{ label: localName(competition.name), url: competition.source_url }], {
        checkedAt: system.checked_at ?? overview.youth_development_systems?.checked_at,
        tier: 1
      }),
      checked_at: system.checked_at ?? overview.youth_development_systems?.checked_at ?? null,
      missing_fields: []
    }))
  );

  return [...researchProjects, ...systemProjects].sort((left, right) =>
    left.category.localeCompare(right.category) || localName(left.name).localeCompare(localName(right.name), "zh-CN")
  );
}

function coachEntry(base) {
  return {
    id: `coach:${base.record_id}`,
    record_id: base.record_id,
    name: base.name,
    local_name: base.local_name ?? "",
    nationality: base.nationality ?? "",
    categories: unique(base.categories),
    roles: unique(base.roles),
    organizations: unique(base.organizations),
    age_bands: unique(base.age_bands),
    periods: asArray(base.periods),
    sources: normalizeSources(base.sources, { checkedAt: base.checked_at }),
    checked_at: base.checked_at ?? null,
    verification_status: base.verification_status ?? "verified",
    confidence: base.confidence ?? null,
    missing_fields: unique(base.missing_fields)
  };
}

function mergeCoach(target, incoming) {
  target.categories = unique([...target.categories, ...incoming.categories]);
  target.roles = unique([...target.roles, ...incoming.roles]);
  target.organizations = unique([...target.organizations, ...incoming.organizations]);
  target.age_bands = unique([...target.age_bands, ...incoming.age_bands]);
  target.periods = uniqueObjects([...target.periods, ...incoming.periods]);
  target.sources = normalizeSources([...target.sources, ...incoming.sources]);
  target.checked_at = latestDate([target.checked_at, incoming.checked_at]);
  target.missing_fields = unique([...target.missing_fields, ...incoming.missing_fields]);
  const verificationOrder = ["rejected", "stale", "conflict", "needs-review", "provisional", "mixed-source", "verified"];
  if (verificationOrder.indexOf(incoming.verification_status) < verificationOrder.indexOf(target.verification_status)) {
    target.verification_status = incoming.verification_status;
  }
  const confidenceOrder = ["low", "medium", "high"];
  if (confidenceOrder.indexOf(incoming.confidence) >= 0 && (
    confidenceOrder.indexOf(target.confidence) < 0 || confidenceOrder.indexOf(incoming.confidence) < confidenceOrder.indexOf(target.confidence)
  )) {
    target.confidence = incoming.confidence;
  }
  if (!target.local_name) target.local_name = incoming.local_name;
  return target;
}

export function buildCoachCatalog(overview = {}) {
  const entries = [];
  const youthArchive = overview.china_youth_development_coaches;
  for (const coach of asArray(youthArchive?.coaches)) {
    entries.push(
      coachEntry({
        record_id: coach.id,
        name: coach.name,
        nationality: coach.nationality,
        categories: ["youth-development"],
        roles: [coach.role],
        organizations: [coach.organization?.name],
        age_bands: coach.age_bands,
        periods: [coach.period],
        sources: coach.source_links,
        checked_at: coach.verification?.last_checked ?? youthArchive.last_checked,
        verification_status: coach.verification?.status,
        missing_fields: []
      })
    );
  }

  const nationalArchive = overview.china_men_youth_coaches;
  for (const cycle of asArray(nationalArchive?.team_cycles)) {
    entries.push(
      coachEntry({
        record_id: cycle.head_coach?.id,
        name: cycle.head_coach?.name,
        local_name: cycle.head_coach?.local_name,
        nationality: "",
        categories: ["china-national-youth"],
        roles: [cycle.team_label],
        organizations: ["China PR"],
        age_bands: [cycle.age_line],
        periods: cycle.latest_camp ? [cycle.latest_camp] : [],
        sources: normalizeSources(cycle.source_links, { checkedAt: nationalArchive.last_checked, tier: 1 }),
        checked_at: nationalArchive.last_checked,
        verification_status: "verified",
        missing_fields: cycle.head_coach?.id ? [] : ["head_coach.id"]
      })
    );
  }

  const bigFiveArchive = overview.big_five_asian_coaches;
  for (const coach of asArray(bigFiveArchive?.coaches)) {
    entries.push(
      coachEntry({
        record_id: coach.id,
        name: coach.name,
        local_name: coach.local_name,
        nationality: coach.nationality,
        categories: ["big-five"],
        roles: [coach.record_scope],
        organizations: asArray(coach.club_records).map((record) => record.club),
        periods: coach.club_records,
        sources: coach.source_links,
        checked_at: bigFiveArchive.last_checked,
        verification_status: coach.confidence === "low" ? "needs-review" : "verified",
        confidence: coach.confidence,
        missing_fields: []
      })
    );
  }

  const asianArchive = overview.asian_coaches;
  for (const coach of asArray(asianArchive?.coaches)) {
    const stints = asArray(coach.stints);
    entries.push(
      coachEntry({
        record_id: coach.id,
        name: coach.name,
        local_name: coach.local_name,
        nationality: coach.nationality,
        categories: ["asia-expanded"],
        roles: stints.map((stint) => stint.role_scope),
        organizations: stints.map((stint) => stint.team),
        periods: stints.map((stint) => stint.period),
        sources: [...asArray(coach.source_links), ...stints.flatMap((stint) => asArray(stint.source_links))],
        checked_at: latestDate(stints.map((stint) => stint.verification?.last_checked)) ?? asianArchive.last_checked,
        verification_status: stints.some((stint) => stint.verification?.status === "needs-review") ? "needs-review" : "verified",
        confidence: coach.confidence,
        missing_fields: stints.some((stint) => stint.record === null) ? ["record"] : []
      })
    );
  }

  const byId = new Map();
  for (const entry of entries.filter((item) => item.record_id)) {
    if (byId.has(entry.record_id)) mergeCoach(byId.get(entry.record_id), entry);
    else byId.set(entry.record_id, entry);
  }
  return [...byId.values()].sort((left, right) =>
    localName(left.name).localeCompare(localName(right.name), "zh-CN")
  );
}

export function buildYouthSystemComparison(overview = {}) {
  const payload = overview.youth_development_systems ?? {};
  return asArray(payload.systems).map((system) => {
    const competitions = asArray(system.competitions);
    const categories = asArray(system.registration_categories);
    return {
      country: system.country,
      name: system.name,
      registration_categories: categories.length,
      system_nodes: competitions.length,
      age_bands: unique([...categories, ...competitions].map((entry) => entry.age_band)),
      organization_types: unique(
        [...categories, ...competitions].flatMap((entry) => asArray(entry.organization_types))
      ),
      programme_types: unique(competitions.map((entry) => entry.competition_type)),
      source_count: asArray(system.source_links).length,
      checked_at: latestDate(asArray(system.source_links).map((source) => source.checked_at)) ?? payload.checked_at ?? null
    };
  });
}

function honoursRows(tournaments) {
  const teams = new Map();
  for (const tournament of tournaments) {
    for (const [field, counter] of [["champion", "titles"], ["runner_up", "runner_ups"]]) {
      const team = tournament[field];
      if (!team) continue;
      const row = teams.get(team) ?? { team, titles: 0, runner_ups: 0, finals: 0, editions: [] };
      row[counter] += 1;
      row.finals += 1;
      row.editions.push(tournament.edition_label);
      teams.set(team, row);
    }
  }
  return [...teams.values()].sort(
    (left, right) =>
      right.titles - left.titles ||
      right.runner_ups - left.runner_ups ||
      left.team.localeCompare(right.team, "en")
  );
}

export function buildU20Honours(overview = {}) {
  const completed = asArray(overview.tournament_archive).filter((tournament) => {
    const year = Number.parseInt(tournament.edition_label, 10);
    return tournament.status === "completed" && year >= 1985 && year <= 2025;
  });
  const fifa = completed.filter((tournament) => tournament.level === "u20-world-cup");
  const afc = completed.filter((tournament) => tournament.level === "u20");
  return {
    fifa: { editions: fifa.length, rows: honoursRows(fifa) },
    afc: { editions: afc.length, rows: honoursRows(afc) }
  };
}
