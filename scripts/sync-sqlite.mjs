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
      league_system_override TEXT,
      overseas_bucket_override TEXT,
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
      note TEXT NOT NULL,
      FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
    );

    CREATE TABLE player_competitions (
      player_id TEXT NOT NULL,
      competition_id TEXT,
      label TEXT NOT NULL,
      team_name TEXT NOT NULL,
      squad_status TEXT NOT NULL,
      appearances INTEGER,
      goals INTEGER,
      minutes INTEGER,
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

    CREATE TABLE tournaments (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      short_name TEXT NOT NULL,
      focus_level TEXT NOT NULL,
      status TEXT NOT NULL,
      last_checked TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
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

    CREATE TABLE tournament_archive (
      id TEXT PRIMARY KEY,
      confederation TEXT NOT NULL,
      competition_name TEXT NOT NULL,
      level TEXT NOT NULL,
      edition_label TEXT NOT NULL,
      host TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      status TEXT NOT NULL,
      champion TEXT NOT NULL,
      runner_up TEXT NOT NULL,
      china_status TEXT NOT NULL,
      china_summary TEXT NOT NULL,
      china_detail_scope TEXT NOT NULL,
      china_squad_json TEXT NOT NULL,
      source_links_json TEXT NOT NULL,
      china_matches_json TEXT NOT NULL,
      china_key_players_json TEXT NOT NULL
    );
  `);

  const insertPlayer = db.prepare(`
    INSERT INTO players (
      id, name, local_name, name_zh, name_en, name_native, name_ja, name_ko, names_json,
      country, birth_date, age_band, primary_position,
      height_cm, weight_kg, registration_club_name, registration_club_country,
      league_system_override, overseas_bucket_override, focus_tags_json,
      verification_status, verification_last_checked, verification_notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertPathway = db.prepare(`
    INSERT INTO player_pathways (
      player_id, stage_order, stage_label, organization, country, note
    ) VALUES (?, ?, ?, ?, ?, ?)
  `);
  const insertCompetition = db.prepare(`
    INSERT INTO player_competitions (
      player_id, competition_id, label, team_name, squad_status, appearances, goals, minutes, note
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertLink = db.prepare(`
    INSERT INTO player_links (
      player_id, link_order, link_type, label, url
    ) VALUES (?, ?, ?, ?, ?)
  `);
  const insertTournament = db.prepare(`
    INSERT INTO tournaments (
      id, name, short_name, focus_level, status, last_checked, start_date, end_date,
      focus_teams_json, headline, notes_json, sources_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
  const insertDossier = db.prepare(`
    INSERT INTO dossiers (
      id, name, status, last_reviewed, focus_tags_json, summary, source_title, source_path,
      supporting_documents_json, scope_note, role_model_json, timeline_json, roster_views_json,
      link_audit_json, search_disambiguation_json, controversies_json, open_questions_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertArchiveTournament = db.prepare(`
    INSERT INTO tournament_archive (
      id, confederation, competition_name, level, edition_label, host, start_date, end_date,
      status, champion, runner_up, china_status, china_summary, china_detail_scope, china_squad_json,
      source_links_json, china_matches_json, china_key_players_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      player.league_system_override ?? null,
      player.overseas_bucket_override ?? null,
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
        entry.appearances,
        entry.goals,
        entry.minutes,
        entry.note
      );
    });

    player.external_links.forEach((link, index) => {
      insertLink.run(player.id, index, link.type, link.label, link.url);
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
  }

  for (const tournament of dataset.tournamentArchive) {
    insertArchiveTournament.run(
      tournament.id,
      tournament.confederation,
      tournament.competition_name,
      tournament.level,
      tournament.edition_label,
      tournament.host,
      tournament.date_range.start,
      tournament.date_range.end,
      tournament.status,
      tournament.champion ?? "",
      tournament.runner_up ?? "",
      tournament.china_status,
      tournament.china_summary,
      tournament.china_detail_scope,
      toJson(tournament.china_squad ?? []),
      toJson(tournament.source_links),
      toJson(tournament.china_matches),
      toJson(tournament.china_key_players)
    );
  }

  db.close();

  return databasePath;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const databasePath = await syncSqlite();
  console.log(`SQLite synced to ${databasePath}`);
}
