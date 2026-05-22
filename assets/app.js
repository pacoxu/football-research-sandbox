const state = {
  players: [],
  overview: null,
  filters: {
    query: "",
    ageBand: "all",
    country: "all",
    tag: "all"
  }
};

const nodes = {
  playerCount: document.querySelector("#playerCount"),
  focusEdition: document.querySelector("#focusEdition"),
  foreignPathCount: document.querySelector("#foreignPathCount"),
  countryCount: document.querySelector("#countryCount"),
  updatedLabel: document.querySelector("#updatedLabel"),
  playerRows: document.querySelector("#playerRows"),
  tournamentCards: document.querySelector("#tournamentCards"),
  dossierCards: document.querySelector("#dossierCards"),
  projectCards: document.querySelector("#projectCards"),
  overseasCards: document.querySelector("#overseasCards"),
  emptyState: document.querySelector("#emptyState"),
  searchInput: document.querySelector("#searchInput"),
  ageFilter: document.querySelector("#ageFilter"),
  countryFilter: document.querySelector("#countryFilter"),
  tagFilter: document.querySelector("#tagFilter")
};

function normalize(value) {
  return String(value ?? "").trim().toLowerCase();
}

function normalizeCountry(value) {
  const normalized = normalize(value);
  const aliases = {
    "china pr": "china",
    "people's republic of china": "china",
    "korea republic": "south korea",
    "republic of korea": "south korea"
  };

  return aliases[normalized] ?? normalized;
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date(`${value}T00:00:00Z`));
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
    left.localeCompare(right, "zh-CN")
  );
}

function isForeignRegistration(player) {
  const registrationCountry = normalizeCountry(player.registration_club?.country);
  const nationalCountry = normalizeCountry(player.country);
  return registrationCountry && nationalCountry && registrationCountry !== nationalCountry;
}

function summarizePathway(pathway) {
  return pathway
    .map((step) => `${step.stage_label}: ${step.organization}`)
    .join(" / ");
}

function summarizeParticipation(participation) {
  return participation
    .map((entry) => {
      const numbers = [];
      if (entry.appearances !== null && entry.appearances !== undefined) {
        numbers.push(`${entry.appearances} 场`);
      }
      if (entry.goals !== null && entry.goals !== undefined) {
        numbers.push(`${entry.goals} 球`);
      }
      if (entry.minutes !== null && entry.minutes !== undefined) {
        numbers.push(`${entry.minutes} 分钟`);
      }
      const suffix = numbers.length > 0 ? ` · ${numbers.join(" / ")}` : "";
      return `${entry.label}${suffix}`;
    })
    .join("；");
}

function buildOptions(target, options, selectedValue, label) {
  const allOption = [{ value: "all", label }];
  target.innerHTML = [...allOption, ...options]
    .map(
      (option) =>
        `<option value="${option.value}" ${option.value === selectedValue ? "selected" : ""}>${option.label}</option>`
    )
    .join("");
}

function renderStats() {
  const players = state.players;
  const overview = state.overview;
  const focus = overview.tournaments.find((item) => item.focus_level === "primary");
  const countryCount = new Set(players.map((player) => player.country)).size;
  const foreignPathCount = players.filter(isForeignRegistration).length;

  nodes.playerCount.textContent = String(players.length);
  nodes.focusEdition.textContent = focus ? focus.short_name : "-";
  nodes.foreignPathCount.textContent = String(foreignPathCount);
  nodes.countryCount.textContent = String(countryCount);
  nodes.updatedLabel.textContent = `聚合生成：${formatDate(overview.generated_at)}`;
}

function renderTournamentCards() {
  nodes.tournamentCards.innerHTML = state.overview.tournaments
    .map((tournament) => {
      const notes = tournament.notes.map((note) => `<li>${note}</li>`).join("");
      const sources = tournament.sources
        .map(
          (source) =>
            `<a href="${source.url}" target="_blank" rel="noreferrer">${source.label}</a>`
        )
        .join(" · ");

      return `
        <article class="tournament-card">
          <h3>${tournament.name}</h3>
          <p>${tournament.headline}</p>
          <p class="small-note">${formatDate(tournament.date_range.start)} - ${formatDate(
            tournament.date_range.end
          )}</p>
          <ul>${notes}</ul>
          <p class="small-note">来源：${sources}</p>
        </article>
      `;
    })
    .join("");
}

function renderDossiers() {
  nodes.dossierCards.innerHTML = state.overview.dossiers
    .map((dossier) => {
      const sourceDocuments = [dossier.source_document, ...(dossier.supporting_documents ?? [])]
        .map(
          (document) => `
            <li>
              <strong>${document.title}</strong>
              <span>${document.path}</span>
              ${document.summary ? `<p>${document.summary}</p>` : ""}
            </li>
          `
        )
        .join("");
      const roleModel = dossier.role_model.map((item) => `<li>${item}</li>`).join("");
      const controversies = dossier.controversies.map((item) => `<li>${item}</li>`).join("");
      const openQuestions = dossier.open_questions.map((item) => `<li>${item}</li>`).join("");
      const timeline = dossier.timeline
        .map(
          (entry) => `
            <li>
              <span class="timeline-date">${entry.date}</span>
              <strong>${entry.label}</strong>
              <p>${entry.detail}</p>
            </li>
          `
        )
        .join("");
      const rosterViews = dossier.roster_views
        .map((view) => {
          const players = view.players
            .map(
              (player) => `
                <li>
                  <strong>${player.local_name}</strong>
                  <span>${player.role}</span>
                  <span>${player.club}</span>
                </li>
              `
            )
            .join("");

          return `
            <article class="stack-card roster-view">
              <div class="mini-list">
                <span class="status-chip status-${dossier.status}">${view.confidence}</span>
                <span class="chip">${view.players.length} 人</span>
              </div>
              <h3>${view.name}</h3>
              <p>${view.description}</p>
              <ul class="roster-player-list">${players}</ul>
            </article>
          `;
        })
        .join("");
      const linkAuditSummary = dossier.link_audit
        ? `
          <div class="audit-stat-grid">
            <article class="audit-stat">
              <span class="stat-label">TM 条目</span>
              <strong>${dossier.link_audit.stats.transfermarkt_profiles}/9</strong>
            </article>
            <article class="audit-stat">
              <span class="stat-label">官网具名页</span>
              <strong>${dossier.link_audit.stats.official_named_pages}/9</strong>
            </article>
            <article class="audit-stat">
              <span class="stat-label">Wiki 条目</span>
              <strong>${dossier.link_audit.stats.wikipedia_profiles}/9</strong>
            </article>
          </div>
        `
        : "";
      const linkAuditNotes = dossier.link_audit
        ? dossier.link_audit.caveats.map((item) => `<li>${item}</li>`).join("")
        : "";
      const linkAuditPlayers = dossier.link_audit
        ? dossier.link_audit.players
            .map((player) => {
              const tm =
                player.transfermarkt.status === "verified"
                  ? `<a href="${player.transfermarkt.url}" target="_blank" rel="noreferrer">TM</a>`
                  : `<span>TM 缺失</span>`;
              const official =
                player.official_page.status === "verified"
                  ? `<a href="${player.official_page.url}" target="_blank" rel="noreferrer">官网</a>`
                  : `<span>官网缺失</span>`;
              const wiki =
                player.wikipedia.status === "verified"
                  ? `<a href="${player.wikipedia.url}" target="_blank" rel="noreferrer">Wiki</a>`
                  : `<span>Wiki 缺失</span>`;

              return `
                <tr>
                  <td>
                    <strong>${player.local_name}</strong>
                    <div class="small-note">${player.name}</div>
                  </td>
                  <td>${tm}</td>
                  <td>${official}</td>
                  <td>${wiki}</td>
                  <td>
                    <div>${player.ambiguity}</div>
                    <div class="small-note">${player.missing_note}</div>
                  </td>
                </tr>
              `;
            })
            .join("")
        : "";
      const disambiguationSummary = dossier.search_disambiguation
        ? `
          <div class="audit-stat-grid">
            <article class="audit-stat">
              <span class="stat-label">精确匹配</span>
              <strong>${dossier.search_disambiguation.exact_match_count}</strong>
            </article>
            <article class="audit-stat">
              <span class="stat-label">检索对象</span>
              <strong>${dossier.search_disambiguation.confusing_entities.length}</strong>
            </article>
            <article class="audit-stat">
              <span class="stat-label">核验日期</span>
              <strong>${formatDate(dossier.search_disambiguation.checked_at)}</strong>
            </article>
          </div>
        `
        : "";
      const searchHygiene = dossier.search_disambiguation
        ? dossier.search_disambiguation.search_hygiene.map((item) => `<li>${item}</li>`).join("")
        : "";
      const confusingEntities = dossier.search_disambiguation
        ? dossier.search_disambiguation.confusing_entities
            .map(
              (entity) => `
                <article class="stack-card confusion-card">
                  <div class="mini-list">
                    <span class="chip">${entity.type}</span>
                  </div>
                  <h3>${entity.label}</h3>
                  <p>${entity.description}</p>
                  <p class="small-note">为什么会混淆：${entity.why_confusing}</p>
                  <p class="small-note">结论：${entity.verdict}</p>
                </article>
              `
            )
            .join("")
        : "";

      return `
        <article class="dossier-card">
          <div class="dossier-layout">
            <div class="stack-card dossier-summary">
              <div class="mini-list">
                <span class="status-chip status-${dossier.status}">${dossier.status}</span>
                <span class="chip">更新 ${formatDate(dossier.last_reviewed)}</span>
              </div>
              <h3>${dossier.name}</h3>
              <p>${dossier.summary}</p>
              <p class="small-note">${dossier.scope_note}</p>
              <ul class="source-doc-list">${sourceDocuments}</ul>
              <ul>${roleModel}</ul>
            </div>
            <div class="stack-card">
              <h3>关键时间线</h3>
              <ol class="timeline-list">${timeline}</ol>
            </div>
          </div>
          <div class="roster-grid">${rosterViews}</div>
          ${
            dossier.link_audit
              ? `
                <div class="dossier-layout">
                  <div class="stack-card">
                    <h3>三站链接核验</h3>
                    <p>${dossier.link_audit.summary}</p>
                    ${linkAuditSummary}
                    <ul>${linkAuditNotes}</ul>
                  </div>
                  <div class="stack-card">
                    <h3>核验口径提醒</h3>
                    <p>2024 年“当时所属”仍以足协训练营、拉练与集训通知为准；Transfermarkt 主要用于确认个人条目是否存在，不直接替代 2024 归属。</p>
                  </div>
                </div>
                <div class="stack-card">
                  <h3>9 人链接明细</h3>
                  <div class="table-shell">
                    <table class="audit-table">
                      <thead>
                        <tr>
                          <th>球员</th>
                          <th>TM</th>
                          <th>官网</th>
                          <th>Wiki</th>
                          <th>备注</th>
                        </tr>
                      </thead>
                      <tbody>${linkAuditPlayers}</tbody>
                    </table>
                  </div>
                </div>
              `
              : ""
          }
          ${
            dossier.search_disambiguation
              ? `
                <div class="dossier-layout">
                  <div class="stack-card">
                    <h3>检索去歧义</h3>
                    <p>${dossier.search_disambiguation.summary}</p>
                    ${disambiguationSummary}
                    <p class="small-note">${dossier.search_disambiguation.conclusion}</p>
                  </div>
                  <div class="stack-card">
                    <h3>检索建议</h3>
                    <ul>${searchHygiene}</ul>
                  </div>
                </div>
                <div class="roster-grid">${confusingEntities}</div>
              `
              : ""
          }
          <div class="dossier-layout">
            <div class="stack-card">
              <h3>争议与边界</h3>
              <ul>${controversies}</ul>
            </div>
            <div class="stack-card">
              <h3>待补问题</h3>
              <ul>${openQuestions}</ul>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderProjects() {
  nodes.projectCards.innerHTML = state.overview.projects
    .map((project) => {
      const watchItems = project.watch_items.map((item) => `<li>${item}</li>`).join("");

      return `
        <article class="stack-card">
          <div class="mini-list">
            <span class="status-chip status-${project.status}">${project.status}</span>
            <span class="chip">${project.priority}</span>
          </div>
          <h3>${project.name}</h3>
          <p>${project.summary}</p>
          <p class="small-note">下一步：${project.next_step}</p>
          <ul>${watchItems}</ul>
        </article>
      `;
    })
    .join("");
}

function renderOverseas() {
  nodes.overseasCards.innerHTML = state.overview.overseas_history.countries
    .map((country) => {
      const buckets = country.bucket_focus.map((item) => `<li>${item}</li>`).join("");
      const examples =
        country.seed_examples.length > 0
          ? `<p class="small-note">种子样本：${country.seed_examples.join("、")}</p>`
          : `<p class="small-note">种子样本：待补</p>`;
      const featuredRecords =
        country.featured_records && country.featured_records.length > 0
          ? `
              <div class="overseas-record-list">
                ${country.featured_records
                  .map((record) => {
                    const notes = record.notes.map((item) => `<li>${item}</li>`).join("");
                    const appearancesLabel =
                      record.appearances > 0
                        ? `联赛 ${record.appearances} 场`
                        : "联赛未登场";

                    return `
                      <article class="overseas-record">
                        <div class="mini-list">
                          <span class="status-chip status-${record.status}">${record.status}</span>
                          <span class="chip">${record.league}</span>
                          <span class="chip">${record.season}</span>
                        </div>
                        <h4>${record.local_name}<span>${record.name}</span></h4>
                        <p class="small-note">${record.club} · ${appearancesLabel}</p>
                        <p>${record.summary}</p>
                        <ul>${notes}</ul>
                      </article>
                    `;
                  })
                  .join("")}
              </div>
            `
          : "";

      return `
        <article class="stack-card">
          <div class="mini-list">
            <span class="status-chip status-${country.status}">${country.status}</span>
            <span class="chip">已核  ${country.verified_records}</span>
          </div>
          <h3>${country.country}</h3>
          <p>${country.notes}</p>
          <ul>${buckets}</ul>
          ${examples}
          ${featuredRecords}
        </article>
      `;
    })
    .join("");
}

function buildPlayerSearchText(player) {
  return normalize([
    player.name,
    player.local_name,
    player.country,
    player.primary_position,
    player.registration_club?.name,
    player.registration_club?.country,
    summarizePathway(player.training_pathway),
    player.focus_tags.join(" ")
  ].join(" "));
}

function getFilteredPlayers() {
  return state.players.filter((player) => {
    if (
      state.filters.ageBand !== "all" &&
      normalize(player.age_band) !== normalize(state.filters.ageBand)
    ) {
      return false;
    }

    if (
      state.filters.country !== "all" &&
      normalize(player.country) !== normalize(state.filters.country)
    ) {
      return false;
    }

    if (
      state.filters.tag !== "all" &&
      !player.focus_tags.map(normalize).includes(normalize(state.filters.tag))
    ) {
      return false;
    }

    if (state.filters.query && !buildPlayerSearchText(player).includes(normalize(state.filters.query))) {
      return false;
    }

    return true;
  });
}

function renderPlayers() {
  const filtered = getFilteredPlayers();
  const asOfDate = state.overview.generated_at;

  nodes.emptyState.hidden = filtered.length > 0;
  nodes.playerRows.innerHTML = filtered
    .map((player) => {
      const links = player.external_links
        .map(
          (link) =>
            `<a href="${link.url}" target="_blank" rel="noreferrer">${link.label}</a>`
        )
        .join(" · ");

      const pathway = player.training_pathway
        .map((step) => `<span class="chip">${step.stage_label}: ${step.organization}</span>`)
        .join("");

      const tags = player.focus_tags.map((tag) => `<span class="chip">${tag}</span>`).join("");

      return `
        <tr>
          <td>
            <div class="player-name">
              <strong>${player.name}</strong>
              <span class="player-meta">${player.local_name} · ${player.primary_position}</span>
              <div class="chip-row">${tags}</div>
            </div>
          </td>
          <td>
            <strong>${getAge(player.birth_date, asOfDate)}</strong>
            <div class="small-note">${formatDate(player.birth_date)}</div>
            <div class="small-note">${player.age_band.toUpperCase()}</div>
          </td>
          <td>
            <strong>${player.country}</strong>
            <div class="small-note">${player.registration_club.name}</div>
            <div class="small-note">${player.registration_club.country}</div>
          </td>
          <td>
            <div class="chip-row">${pathway}</div>
          </td>
          <td>
            <div>${summarizeParticipation(player.tournament_participation)}</div>
          </td>
          <td>
            <div class="link-list">${links}</div>
          </td>
          <td>
            <span class="status-chip status-${player.verification.status}">
              ${player.verification.status}
            </span>
            <div class="small-note">${player.verification.notes}</div>
          </td>
        </tr>
      `;
    })
    .join("");
}

function renderFilters() {
  const ageOptions = uniqueValues(state.players.map((player) => player.age_band)).map((value) => ({
    value,
    label: value.toUpperCase()
  }));
  const countryOptions = uniqueValues(state.players.map((player) => player.country)).map((value) => ({
    value,
    label: value
  }));
  const tagOptions = uniqueValues(state.players.flatMap((player) => player.focus_tags)).map((value) => ({
    value,
    label: value
  }));

  buildOptions(nodes.ageFilter, ageOptions, state.filters.ageBand, "全部年龄段");
  buildOptions(nodes.countryFilter, countryOptions, state.filters.country, "全部国家");
  buildOptions(nodes.tagFilter, tagOptions, state.filters.tag, "全部标签");
}

function bindFilters() {
  nodes.searchInput.addEventListener("input", (event) => {
    state.filters.query = event.target.value;
    renderPlayers();
  });

  nodes.ageFilter.addEventListener("change", (event) => {
    state.filters.ageBand = event.target.value;
    renderPlayers();
  });

  nodes.countryFilter.addEventListener("change", (event) => {
    state.filters.country = event.target.value;
    renderPlayers();
  });

  nodes.tagFilter.addEventListener("change", (event) => {
    state.filters.tag = event.target.value;
    renderPlayers();
  });
}

async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load ${path}: ${response.status}`);
  }
  return response.json();
}

async function boot() {
  try {
    const [players, overview] = await Promise.all([
      loadJson("./data/site/players.json"),
      loadJson("./data/site/overview.json")
    ]);

    state.players = players;
    state.overview = overview;

    renderStats();
    renderTournamentCards();
    renderDossiers();
    renderProjects();
    renderOverseas();
    renderFilters();
    renderPlayers();
    bindFilters();
  } catch (error) {
    nodes.emptyState.hidden = false;
    nodes.emptyState.textContent = `页面初始化失败：${error.message}`;
  }
}

boot();
