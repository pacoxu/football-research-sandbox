import fs from "node:fs/promises";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { ensureDirectory, loadDataset, paths } from "./lib/data-loader.mjs";

function toJson(value) {
  return JSON.stringify(value);
}

export async function syncSqlite() {
  const dataset = await loadDataset();
  const databasePath = path.join(paths.storage, "youth-football.sqlite");

  await ensureDirectory(paths.storage);
  await fs.rm(databasePath, { force: true });

  const db = new DatabaseSync(databasePath);

  db.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE players (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      local_name TEXT NOT NULL,
      name_zh TEXT NOT NULL,
      name_en TEXT NOT NULL,
      name_native TEXT NOT NULL,
      name_ja TEXT NOT NULL,
      name_ko TEXT NOT NULL,
      names_json TEXT NOT NULL,
      country TEXT NOT NULL,
      birth_date TEXT NOT NULL,
      age_band TEXT NOT NULL,
      primary_position TEXT NOT NULL,
      height_cm INTEGER,
      weight_kg INTEGER,
      registration_club_name TEXT NOT NULL,
      registration_club_country TEXT NOT NULL,
      registration_organization_type TEXT,
      parent_organization_json TEXT,
      education_partner_json TEXT,
      league_system_override TEXT,
      overseas_bucket_override TEXT,
      overseas_status TEXT,
      focus_tags_json TEXT NOT NULL,
      verification_status TEXT NOT NULL,
      verification_last_checked TEXT NOT NULL,
      verification_notes TEXT NOT NULL
    );

    CREATE TABLE player_pathways (
      player_id TEXT NOT NULL,
      stage_order INTEGER NOT NULL,
      stage_label TEXT NOT NULL,
      organization TEXT NOT NULL,
      country TEXT NOT NULL,
      organization_type TEXT,
      parent_organization_json TEXT,
      education_partner_json TEXT,
      competition_context_ids_json TEXT NOT NULL,
      note TEXT NOT NULL,
      FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
    );

    CREATE TABLE player_competitions (
      player_id TEXT NOT NULL,
      competition_id TEXT,
      label TEXT NOT NULL,
      team_name TEXT NOT NULL,
      squad_status TEXT NOT NULL,
      season TEXT,
      competition_level TEXT,
      appearances INTEGER,
      starts INTEGER,
      substitute_appearances INTEGER,
      goals INTEGER,
      minutes INTEGER,
      stats_as_of TEXT,
      statistics_status TEXT,
      source_checked_at TEXT,
      statistics_sources_json TEXT NOT NULL,
      note TEXT NOT NULL,
      FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
    );

    CREATE TABLE player_links (
      player_id TEXT NOT NULL,
      link_order INTEGER NOT NULL,
      link_type TEXT NOT NULL,
      label TEXT NOT NULL,
      url TEXT NOT NULL,
      FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
    );

    CREATE TABLE player_source_layers (
      player_id TEXT NOT NULL,
      layer_order INTEGER NOT NULL,
      layer_type TEXT NOT NULL,
      label TEXT NOT NULL,
      url TEXT NOT NULL,
      checked_at TEXT NOT NULL,
      confidence TEXT NOT NULL,
      fields_json TEXT NOT NULL,
      claim TEXT NOT NULL,
      FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
    );

    CREATE TABLE tournaments (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      short_name TEXT NOT NULL,
      focus_level TEXT NOT NULL,
      status TEXT NOT NULL,
      last_checked TEXT NOT NULL,
      start_date TEXT,
      end_date TEXT,
      date_precision TEXT NOT NULL,
      focus_teams_json TEXT NOT NULL,
      headline TEXT NOT NULL,
      notes_json TEXT NOT NULL,
      sources_json TEXT NOT NULL
    );

    CREATE TABLE projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      status TEXT NOT NULL,
      priority TEXT NOT NULL,
      focus_tags_json TEXT NOT NULL,
      summary TEXT NOT NULL,
      next_step TEXT NOT NULL,
      watch_items_json TEXT NOT NULL
    );

    CREATE TABLE overseas_buckets (
      country TEXT PRIMARY KEY,
      status TEXT NOT NULL,
      verified_records INTEGER NOT NULL,
      bucket_focus_json TEXT NOT NULL,
      seed_examples_json TEXT NOT NULL,
      big_five_appearance_checklist_json TEXT NOT NULL,
      notes TEXT NOT NULL
    );

    CREATE TABLE overseas_records (
      id TEXT PRIMARY KEY,
      country TEXT NOT NULL,
      name TEXT NOT NULL,
      local_name TEXT NOT NULL,
      bucket TEXT NOT NULL,
      league TEXT NOT NULL,
      club TEXT NOT NULL,
      season TEXT NOT NULL,
      status TEXT NOT NULL,
      history_year_range TEXT,
      appearances INTEGER NOT NULL,
      appearance_label TEXT NOT NULL,
      active_abroad INTEGER NOT NULL,
      competitive_debut INTEGER NOT NULL,
      summary TEXT NOT NULL,
      notes_json TEXT NOT NULL,
      FOREIGN KEY (country) REFERENCES overseas_buckets(country) ON DELETE CASCADE
    );

    CREATE TABLE china_naturalized_players (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      china_name TEXT NOT NULL,
      former_registration_names_json TEXT NOT NULL,
      birth_country TEXT NOT NULL,
      position TEXT NOT NULL,
      naturalization_path TEXT NOT NULL,
      china_team_status TEXT NOT NULL,
      summary_json TEXT NOT NULL,
      related_featured_record_ids_json TEXT NOT NULL,
      source_links_json TEXT NOT NULL,
      checked_at TEXT NOT NULL
    );

    CREATE TABLE china_naturalized_career_segments (
      player_id TEXT NOT NULL,
      segment_order INTEGER NOT NULL,
      period TEXT NOT NULL,
      phase TEXT NOT NULL,
      country TEXT NOT NULL,
      clubs_json TEXT NOT NULL,
      summary_json TEXT NOT NULL,
      PRIMARY KEY (player_id, segment_order),
      FOREIGN KEY (player_id) REFERENCES china_naturalized_players(id) ON DELETE CASCADE
    );

    CREATE TABLE chinese_heritage_players (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      local_name TEXT NOT NULL,
      group_id TEXT NOT NULL,
      represented_team TEXT,
      target_team TEXT,
      representation_status TEXT NOT NULL,
      heritage_summary_json TEXT NOT NULL,
      football_summary_json TEXT NOT NULL,
      world_cup_2026_json TEXT,
      source_links_json TEXT NOT NULL,
      checked_at TEXT NOT NULL
    );

    CREATE TABLE dossiers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      status TEXT NOT NULL,
      last_reviewed TEXT NOT NULL,
      focus_tags_json TEXT NOT NULL,
      summary TEXT NOT NULL,
      source_title TEXT NOT NULL,
      source_path TEXT NOT NULL,
      supporting_documents_json TEXT NOT NULL,
      scope_note TEXT NOT NULL,
      role_model_json TEXT NOT NULL,
      timeline_json TEXT NOT NULL,
      roster_views_json TEXT NOT NULL,
      link_audit_json TEXT NOT NULL,
      search_disambiguation_json TEXT NOT NULL,
      controversies_json TEXT NOT NULL,
      open_questions_json TEXT NOT NULL
    );

    CREATE TABLE dossier_people (
      dossier_id TEXT NOT NULL,
      person_id TEXT NOT NULL,
      player_id TEXT,
      name TEXT NOT NULL,
      local_name TEXT NOT NULL,
      role TEXT NOT NULL,
      note TEXT NOT NULL,
      current_status_category TEXT NOT NULL,
      current_organization TEXT NOT NULL,
      current_role TEXT NOT NULL,
      status_as_of TEXT NOT NULL,
      status_confidence TEXT NOT NULL,
      status_source_label TEXT NOT NULL,
      status_source_url TEXT NOT NULL,
      PRIMARY KEY (dossier_id, person_id),
      FOREIGN KEY (dossier_id) REFERENCES dossiers(id) ON DELETE CASCADE,
      FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE SET NULL
    );

    CREATE TABLE dossier_roster_members (
      dossier_id TEXT NOT NULL,
      roster_view_id TEXT NOT NULL,
      person_id TEXT NOT NULL,
      member_order INTEGER NOT NULL,
      relationship TEXT NOT NULL,
      verification_status TEXT NOT NULL,
      historical_organization TEXT,
      note TEXT,
      PRIMARY KEY (dossier_id, roster_view_id, person_id),
      FOREIGN KEY (dossier_id, person_id) REFERENCES dossier_people(dossier_id, person_id) ON DELETE CASCADE
    );

    CREATE TABLE scouting_watchlist_meta (
      id TEXT PRIMARY KEY,
      source_json TEXT NOT NULL,
      scope_json TEXT NOT NULL
    );

    CREATE TABLE scouting_watchlist_records (
      id TEXT PRIMARY KEY,
      player_id TEXT,
      name TEXT NOT NULL,
      local_name TEXT,
      country TEXT NOT NULL,
      birth_year INTEGER NOT NULL,
      report_type TEXT NOT NULL,
      source_scope TEXT NOT NULL,
      potential_rating REAL,
      summary_json TEXT NOT NULL,
      source_url TEXT NOT NULL,
      source_checked_at TEXT NOT NULL,
      FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE SET NULL
    );

    CREATE TABLE scouting_watchlist_collections (
      id TEXT PRIMARY KEY,
      name_json TEXT NOT NULL,
      country TEXT NOT NULL,
      url TEXT NOT NULL
    );

    CREATE TABLE tournament_archive (
      id TEXT PRIMARY KEY,
      confederation TEXT NOT NULL,
      competition_name TEXT NOT NULL,
      level TEXT NOT NULL,
      edition_label TEXT NOT NULL,
      source_version_json TEXT NOT NULL,
      source_checked_at TEXT,
      source_conflict_note TEXT NOT NULL,
      competition_name_history_json TEXT NOT NULL,
      host TEXT NOT NULL,
      start_date TEXT,
      end_date TEXT,
      date_precision TEXT NOT NULL,
      status TEXT NOT NULL,
      champion TEXT NOT NULL,
      runner_up TEXT NOT NULL,
      china_status TEXT NOT NULL,
      china_summary TEXT NOT NULL,
      china_detail_scope TEXT NOT NULL,
      china_squad_json TEXT NOT NULL,
      participants_json TEXT NOT NULL,
      final_draw_json TEXT NOT NULL,
      qualifiers_json TEXT NOT NULL,
      source_links_json TEXT NOT NULL,
      china_matches_json TEXT NOT NULL,
      china_key_players_json TEXT NOT NULL
    );

    CREATE TABLE youth_development_systems (
      id TEXT PRIMARY KEY,
      country TEXT NOT NULL,
      name_json TEXT NOT NULL,
      summary_json TEXT NOT NULL,
      checked_at TEXT NOT NULL,
      registration_categories_json TEXT NOT NULL,
      competitions_json TEXT NOT NULL,
      source_links_json TEXT NOT NULL
    );

    CREATE TABLE china_youth_development_coaches (
      id TEXT PRIMARY KEY,
      name_zh TEXT NOT NULL,
      name_en TEXT NOT NULL,
      name_native TEXT NOT NULL,
      nationality TEXT NOT NULL,
      organization_name TEXT NOT NULL,
      organization_short_name TEXT NOT NULL,
      organization_type TEXT NOT NULL,
      province TEXT NOT NULL,
      city TEXT NOT NULL,
      role TEXT NOT NULL,
      age_bands_json TEXT NOT NULL,
      period_json TEXT NOT NULL,
      profile_summary TEXT NOT NULL,
      methodology_tags_json TEXT NOT NULL,
      source_links_json TEXT NOT NULL,
      verification_json TEXT NOT NULL
    );
  `);

  const insertPlayer = db.prepare(`
    INSERT INTO players (
      id, name, local_name, name_zh, name_en, name_native, name_ja, name_ko, names_json,
      country, birth_date, age_band, primary_position,
      height_cm, weight_kg, registration_club_name, registration_club_country,
      registration_organization_type, parent_organization_json, education_partner_json,
      league_system_override, overseas_bucket_override, overseas_status, focus_tags_json,
      verification_status, verification_last_checked, verification_notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertPathway = db.prepare(`
    INSERT INTO player_pathways (
      player_id, stage_order, stage_label, organization, country, organization_type,
      parent_organization_json, education_partner_json, competition_context_ids_json, note
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertCompetition = db.prepare(`
    INSERT INTO player_competitions (
      player_id, competition_id, label, team_name, squad_status, season, competition_level,
      appearances, starts, substitute_appearances, goals, minutes, stats_as_of,
      statistics_status, source_checked_at, statistics_sources_json, note
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertLink = db.prepare(`
    INSERT INTO player_links (
      player_id, link_order, link_type, label, url
    ) VALUES (?, ?, ?, ?, ?)
  `);
  const insertSourceLayer = db.prepare(`
    INSERT INTO player_source_layers (
      player_id, layer_order, layer_type, label, url, checked_at, confidence, fields_json, claim
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertTournament = db.prepare(`
    INSERT INTO tournaments (
      id, name, short_name, focus_level, status, last_checked, start_date, end_date, date_precision,
      focus_teams_json, headline, notes_json, sources_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertProject = db.prepare(`
    INSERT INTO projects (
      id, name, status, priority, focus_tags_json, summary, next_step, watch_items_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertOverseas = db.prepare(`
    INSERT INTO overseas_buckets (
      country, status, verified_records, bucket_focus_json, seed_examples_json,
      big_five_appearance_checklist_json, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const insertOverseasRecord = db.prepare(`
    INSERT INTO overseas_records (
      id, country, name, local_name, bucket, league, club, season, status,
      history_year_range, appearances, appearance_label, active_abroad,
      competitive_debut, summary, notes_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertChinaNaturalizedPlayer = db.prepare(`
    INSERT INTO china_naturalized_players (
      id, name, china_name, former_registration_names_json, birth_country, position,
      naturalization_path, china_team_status, summary_json,
      related_featured_record_ids_json, source_links_json, checked_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertChinaNaturalizedCareerSegment = db.prepare(`
    INSERT INTO china_naturalized_career_segments (
      player_id, segment_order, period, phase, country, clubs_json, summary_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const insertChineseHeritagePlayer = db.prepare(`
    INSERT INTO chinese_heritage_players (
      id, name, local_name, group_id, represented_team, target_team,
      representation_status, heritage_summary_json, football_summary_json,
      world_cup_2026_json, source_links_json, checked_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertDossier = db.prepare(`
    INSERT INTO dossiers (
      id, name, status, last_reviewed, focus_tags_json, summary, source_title, source_path,
      supporting_documents_json, scope_note, role_model_json, timeline_json, roster_views_json,
      link_audit_json, search_disambiguation_json, controversies_json, open_questions_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertDossierPerson = db.prepare(`
    INSERT INTO dossier_people (
      dossier_id, person_id, player_id, name, local_name, role, note,
      current_status_category, current_organization, current_role, status_as_of,
      status_confidence, status_source_label, status_source_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertDossierRosterMember = db.prepare(`
    INSERT INTO dossier_roster_members (
      dossier_id, roster_view_id, person_id, member_order, relationship,
      verification_status, historical_organization, note
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertScoutingWatchlistMeta = db.prepare(`
    INSERT INTO scouting_watchlist_meta (id, source_json, scope_json)
    VALUES (?, ?, ?)
  `);
  const insertScoutingWatchlistRecord = db.prepare(`
    INSERT INTO scouting_watchlist_records (
      id, player_id, name, local_name, country, birth_year, report_type, source_scope,
      potential_rating, summary_json, source_url, source_checked_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertScoutingWatchlistCollection = db.prepare(`
    INSERT INTO scouting_watchlist_collections (id, name_json, country, url)
    VALUES (?, ?, ?, ?)
  `);
  const insertArchiveTournament = db.prepare(`
    INSERT INTO tournament_archive (
      id, confederation, competition_name, level, edition_label,
      source_version_json, source_checked_at, source_conflict_note, competition_name_history_json,
      host, start_date, end_date, date_precision,
      status, champion, runner_up, china_status, china_summary, china_detail_scope, china_squad_json,
      participants_json, final_draw_json, qualifiers_json,
      source_links_json, china_matches_json, china_key_players_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertYouthDevelopmentSystem = db.prepare(`
    INSERT INTO youth_development_systems (
      id, country, name_json, summary_json, checked_at, registration_categories_json,
      competitions_json, source_links_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertChinaYouthDevelopmentCoach = db.prepare(`
    INSERT INTO china_youth_development_coaches (
      id, name_zh, name_en, name_native, nationality,
      organization_name, organization_short_name, organization_type, province, city,
      role, age_bands_json, period_json, profile_summary, methodology_tags_json,
      source_links_json, verification_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const player of dataset.players) {
    insertPlayer.run(
      player.id,
      player.name,
      player.local_name,
      player.names.zh,
      player.names.en,
      player.names.native,
      player.names.ja ?? "",
      player.names.ko ?? "",
      toJson(player.names),
      player.country,
      player.birth_date,
      player.age_band,
      player.primary_position,
      player.height_cm,
      player.weight_kg,
      player.registration_club.name,
      player.registration_club.country,
      player.registration_club.organization_type ?? null,
      player.registration_club.parent_organization
        ? toJson(player.registration_club.parent_organization)
        : null,
      player.registration_club.education_partner
        ? toJson(player.registration_club.education_partner)
        : null,
      player.league_system_override ?? null,
      player.overseas_bucket_override ?? null,
      player.overseas_status ?? null,
      toJson(player.focus_tags),
      player.verification.status,
      player.verification.last_checked,
      player.verification.notes
    );

    player.training_pathway.forEach((step, index) => {
      insertPathway.run(
        player.id,
        index,
        step.stage_label,
        step.organization,
        step.country,
        step.organization_type ?? null,
        step.parent_organization ? toJson(step.parent_organization) : null,
        step.education_partner ? toJson(step.education_partner) : null,
        toJson(step.competition_context_ids ?? []),
        step.note
      );
    });

    player.tournament_participation.forEach((entry) => {
      insertCompetition.run(
        player.id,
        entry.competition_id ?? null,
        entry.label,
        entry.team,
        entry.squad_status,
        entry.season ?? null,
        entry.competition_level ?? null,
        entry.appearances,
        entry.starts ?? null,
        entry.substitute_appearances ?? null,
        entry.goals,
        entry.minutes,
        entry.stats_as_of ?? null,
        entry.statistics_status ?? null,
        entry.source_checked_at ?? null,
        toJson(entry.statistics_sources ?? []),
        entry.note
      );
    });

    player.external_links.forEach((link, index) => {
      insertLink.run(player.id, index, link.type, link.label, link.url);
    });

    (player.source_layers ?? []).forEach((layer, index) => {
      insertSourceLayer.run(
        player.id,
        index,
        layer.type,
        layer.label,
        layer.url,
        layer.checked_at,
        layer.confidence,
        toJson(layer.fields),
        layer.claim
      );
    });
  }

  for (const tournament of dataset.tournaments) {
    insertTournament.run(
      tournament.id,
      tournament.name,
      tournament.short_name,
      tournament.focus_level,
      tournament.status,
      tournament.last_checked,
      tournament.date_range.start,
      tournament.date_range.end,
      tournament.date_precision ?? "exact",
      toJson(tournament.focus_teams),
      tournament.headline,
      toJson(tournament.notes),
      toJson(tournament.sources)
    );
  }

  for (const project of dataset.projects) {
    insertProject.run(
      project.id,
      project.name,
      project.status,
      project.priority,
      toJson(project.focus_tags ?? []),
      project.summary,
      project.next_step,
      toJson(project.watch_items)
    );
  }

  for (const country of dataset.overseasHistory.countries) {
    insertOverseas.run(
      country.country,
      country.status,
      country.verified_records,
      toJson(country.bucket_focus),
      toJson(country.seed_examples),
      toJson(country.big_five_appearance_checklist ?? null),
      country.notes
    );

    for (const record of country.featured_records ?? []) {
      insertOverseasRecord.run(
        record.id,
        country.country,
        record.name,
        record.local_name,
        record.bucket,
        record.league,
        record.club,
        record.season,
        record.status,
        record.history_year_range ?? null,
        record.appearances,
        record.appearance_label,
        record.active_abroad ? 1 : 0,
        record.competitive_debut ? 1 : 0,
        record.summary,
        toJson(record.notes)
      );
    }

    if (country.country === "China PR" && country.naturalized_players) {
      for (const profile of country.naturalized_players.profiles ?? []) {
        insertChinaNaturalizedPlayer.run(
          profile.id,
          profile.name,
          profile.china_name,
          toJson(profile.former_registration_names ?? []),
          profile.birth_country,
          profile.position,
          profile.naturalization_path,
          profile.china_team_status,
          toJson(profile.summary),
          toJson(profile.related_featured_record_ids ?? []),
          toJson(profile.source_links ?? []),
          country.naturalized_players.checked_at
        );
        for (const [index, segment] of (profile.career_segments ?? []).entries()) {
          insertChinaNaturalizedCareerSegment.run(
            profile.id,
            index,
            segment.period,
            segment.phase,
            segment.country,
            toJson(segment.clubs ?? []),
            toJson(segment.summary)
          );
        }
      }
    }
  }

  const chineseHeritagePlayers = dataset.overseasHistory.chinese_heritage_players;
  for (const profile of chineseHeritagePlayers.profiles ?? []) {
    insertChineseHeritagePlayer.run(
      profile.id,
      profile.name,
      profile.local_name,
      profile.group,
      profile.represented_team ?? null,
      profile.target_team ?? null,
      profile.representation_status,
      toJson(profile.heritage_summary),
      toJson(profile.football_summary),
      profile.world_cup_2026 ? toJson(profile.world_cup_2026) : null,
      toJson(profile.source_links ?? []),
      chineseHeritagePlayers.checked_at
    );
  }

  for (const dossier of dataset.dossiers) {
    insertDossier.run(
      dossier.id,
      dossier.name,
      dossier.status,
      dossier.last_reviewed,
      toJson(dossier.focus_tags ?? []),
      dossier.summary,
      dossier.source_document.title,
      dossier.source_document.path,
      toJson(dossier.supporting_documents ?? []),
      dossier.scope_note,
      toJson(dossier.role_model),
      toJson(dossier.timeline),
      toJson(dossier.roster_views),
      toJson(dossier.link_audit ?? null),
      toJson(dossier.search_disambiguation ?? null),
      toJson(dossier.controversies),
      toJson(dossier.open_questions)
    );
    for (const person of dossier.people ?? []) {
      const status = person.current_status;
      insertDossierPerson.run(
        dossier.id, person.id, person.player_id ?? null, person.name, person.local_name,
        person.role, person.note ?? "", status.category, status.organization, status.role,
        status.as_of, status.confidence, status.source_label, status.source_url
      );
    }
    for (const view of dossier.roster_views ?? []) {
      (view.members ?? []).forEach((member, index) => {
        insertDossierRosterMember.run(
          dossier.id, view.id, member.person_id, index, member.relationship,
          member.verification_status, member.historical_organization ?? null, member.note ?? null
        );
      });
    }
  }

  insertScoutingWatchlistMeta.run(
    "football-talent-scout",
    toJson(dataset.scoutingWatchlist.source),
    toJson(dataset.scoutingWatchlist.scope)
  );
  for (const record of dataset.scoutingWatchlist.records) {
    insertScoutingWatchlistRecord.run(
      record.id,
      record.player_id ?? null,
      record.name,
      record.local_name ?? null,
      record.country,
      record.birth_year,
      record.report_type,
      record.source_scope,
      record.potential_rating ?? null,
      toJson(record.summary),
      record.source_url,
      record.source_checked_at
    );
  }
  for (const collection of dataset.scoutingWatchlist.related_collections) {
    insertScoutingWatchlistCollection.run(
      collection.id,
      toJson(collection.name),
      collection.country,
      collection.url
    );
  }

  for (const tournament of dataset.tournamentArchive) {
    insertArchiveTournament.run(
      tournament.id,
      tournament.confederation,
      tournament.competition_name,
      tournament.level,
      tournament.edition_label,
      toJson(tournament.source_version ?? []),
      tournament.source_checked_at ?? null,
      tournament.source_conflict_note ?? "",
      toJson(tournament.competition_name_history ?? []),
      tournament.host,
      tournament.date_range.start,
      tournament.date_range.end,
      tournament.date_precision ?? "exact",
      tournament.status,
      tournament.champion ?? "",
      tournament.runner_up ?? "",
      tournament.china_status,
      tournament.china_summary,
      tournament.china_detail_scope,
      toJson(tournament.china_squad ?? []),
      toJson(tournament.participants ?? null),
      toJson(tournament.final_draw ?? null),
      toJson(tournament.qualifiers ?? []),
      toJson(tournament.source_links),
      toJson(tournament.china_matches),
      toJson(tournament.china_key_players)
    );
  }

  for (const system of dataset.youthDevelopmentSystems.systems) {
    insertYouthDevelopmentSystem.run(
      system.id,
      system.country,
      toJson(system.name),
      toJson(system.summary),
      dataset.youthDevelopmentSystems.checked_at,
      toJson(system.registration_categories),
      toJson(system.competitions),
      toJson(system.source_links)
    );
  }

  for (const coach of dataset.chinaYouthDevelopmentCoaches?.coaches ?? []) {
    insertChinaYouthDevelopmentCoach.run(
      coach.id,
      coach.name.zh,
      coach.name.en,
      coach.name.native,
      coach.nationality,
      coach.organization.name,
      coach.organization.short_name,
      coach.organization.type,
      coach.organization.province,
      coach.organization.city,
      coach.role,
      toJson(coach.age_bands),
      toJson(coach.period),
      coach.profile_summary,
      toJson(coach.methodology_tags),
      toJson(coach.source_links),
      toJson(coach.verification)
    );
  }

  db.close();

  return databasePath;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const databasePath = await syncSqlite();
  console.log(`SQLite synced to ${databasePath}`);
}
