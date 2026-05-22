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
      country TEXT NOT NULL,
      birth_date TEXT NOT NULL,
      age_band TEXT NOT NULL,
      primary_position TEXT NOT NULL,
      height_cm INTEGER,
      weight_kg INTEGER,
      registration_club_name TEXT NOT NULL,
      registration_club_country TEXT NOT NULL,
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
      competition_id TEXT NOT NULL,
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
      appearances INTEGER NOT NULL,
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
  `);

  const insertPlayer = db.prepare(`
    INSERT INTO players (
      id, name, local_name, country, birth_date, age_band, primary_position,
      height_cm, weight_kg, registration_club_name, registration_club_country,
      focus_tags_json, verification_status, verification_last_checked, verification_notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      id, name, status, priority, summary, next_step, watch_items_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const insertOverseas = db.prepare(`
    INSERT INTO overseas_buckets (
      country, status, verified_records, bucket_focus_json, seed_examples_json, notes
    ) VALUES (?, ?, ?, ?, ?, ?)
  `);
  const insertOverseasRecord = db.prepare(`
    INSERT INTO overseas_records (
      id, country, name, local_name, bucket, league, club, season, status,
      appearances, competitive_debut, summary, notes_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertDossier = db.prepare(`
    INSERT INTO dossiers (
      id, name, status, last_reviewed, summary, source_title, source_path, supporting_documents_json,
      scope_note, role_model_json, timeline_json, roster_views_json, link_audit_json,
      search_disambiguation_json, controversies_json, open_questions_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const player of dataset.players) {
    insertPlayer.run(
      player.id,
      player.name,
      player.local_name,
      player.country,
      player.birth_date,
      player.age_band,
      player.primary_position,
      player.height_cm,
      player.weight_kg,
      player.registration_club.name,
      player.registration_club.country,
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
        entry.competition_id,
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
        record.appearances,
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

  db.close();

  return databasePath;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const databasePath = await syncSqlite();
  console.log(`SQLite synced to ${databasePath}`);
}
