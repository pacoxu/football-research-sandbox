# Changelog

All notable project data-model, generation, and documentation changes should be recorded here.

This project tracks research data, so changelog entries should separate code changes, data-scope changes, major data additions, and corrections.

## 2026-07-12

### Added

- Added structured Japan/Korea youth-development system data and a bilingual public systems page.
- Added organization types and competition contexts to all 92 Japan/Korea U17/U23 final-squad records.
- Added AFC registration layers to all 92 records and independent official source coverage for 16 deep samples.
- Added player organization filtering, grouped source-layer display, Korea parent-club/education-partner fields, and SQLite system/pathway columns.

### Governance Notes

- School, university and club source layers may no longer reuse an AFC registration PDF as an organization source.
- Stable competition structures and season-specific snapshots are stored separately.
- Gimcheon Sangmu is modeled as a senior military-service club rather than a youth academy.

## 2026-07-11

### Added

- Added README badges for Pages workflow status, generated data date, validation command, and research-sample scope.
- Added `docs/snapshots.md` to define monthly, competition-node, and scope-change data snapshots.
- Added `docs/known-limitations.md` to centralize non-official, non-realtime, source-conflict, and youth-data limitations.
- Added China U20 2025 final-squad coverage: 14 new raw player records plus `afc-u20-2025` participation entries on 9 existing U23/CSL youth records.
- Added China U17 2026 roster-boundary fields: `roster_status` on player participation records and `roster_boundary` on the tournament archive.

### Data Notes

- China U20 2025 now covers the AFC final registration 23/23; goals are filled from the current tournament archive, while appearances and minutes remain marked as pending match-report extraction.
- China U17 2026 now counts final registration by `roster_status=final-squad` instead of raw `afc-u17-2026` participation count; Gu Boyu is marked `withdrawn/unused`, and fourth-camp entries are marked `later-camp-callup`.

### Governance Notes

- Documented that GitHub Pages deployments are not data snapshots; traceable snapshots should bind to a commit, tag, or release.

## 2026-06-28

### Added

- Added contributor workflow documentation in `CONTRIBUTING.md`.
- Added project scope, source policy, and data dictionary documents under `docs/`.
- Added GitHub issue templates for data additions, corrections, broken sources, page bugs, and scope discussions.
- Added a pull request template, CODEOWNERS, and security policy.

### Data Scope Notes

- Documented that current overseas-player samples are research samples, not official exhaustive counts.
- Documented current registration, future-effective transfer, trial-watch, and conflict-handling boundaries.

## 2026-06-27

### Added

- Added technical documentation for the raw JSON to site JSON pipeline in `docs/data-flow.md`.
- Added SQLite ER and table documentation in `docs/sqlite.md`.
- Added local development and GitHub Pages troubleshooting notes in `docs/local-development.md`.
- Added validation script coverage notes in `docs/validation.md`.
- Added Transfermarkt market value refresh guidance in `docs/transfermarkt-market-values.md`.
- Added static JSON API usage boundaries in `docs/api.md`.

### Data Model Notes

- `data/site/**` remains a generated-but-committed review artifact.
- `storage/youth-football.sqlite` remains a local generated database and is not committed or published.
- `generated_at` is currently controlled by `scripts/build-site-data.mjs`, not by wall-clock build time.

### Follow-Up Candidates

- Add JSON Schema files for `data/raw/**` and `data/site/**`.
- Add a generated-output consistency check for CI.
- Add a static JSON metadata file with schema version and commit SHA.
- Add a link checker that reports dead links without blocking routine data work by default.
