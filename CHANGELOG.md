# Changelog

All notable project data-model, generation, and documentation changes should be recorded here.

This project tracks research data, so changelog entries should separate code changes, data-scope changes, major data additions, and corrections.

## 2026-07-12

### Added

- Added complete men's U20 tournament cycles for the FIFA World Youth Championship / U-20 World Cup and AFC Youth / U19 / U20 Asian Cup from 1985 through 2025: 21 cycles in each lineage, including the cancelled 2021 and 2020 editions.
- Added complete finalist fields and final-tournament groups for every completed edition, plus host, dates, champion, runner-up, China status, field-level source versions, and source check dates.
- Added 2027 future records for the Azerbaijan/Uzbekistan FIFA co-hosted event and the China-hosted AFC event, with unannounced dates and final draws explicitly pending.
- Added the official 44-team AFC 2027 qualifying draw, keeping Qualification Phase and Development Phase groups separate from the final-tournament participant list.
- Added tournament-detail field/group rendering, archive-card field summaries, cancelled/future labels, and Chinese/English copy.

### Data Model Notes

- Added `participants`, `final_draw`, `qualifiers`, and `date_precision` to tournament archives; SQLite now stores the three nested structures as JSON columns and permits nullable event dates.
- Validation now enforces exact 1985—2025 cycle coverage, cancellation records, complete field/group set equality, qualifier/finals separation, and legal partial future records.

## 2026-07-11

### Added

- Added README badges for Pages workflow status, generated data date, validation command, and research-sample scope.
- Added `docs/snapshots.md` to define monthly, competition-node, and scope-change data snapshots.
- Added `docs/known-limitations.md` to centralize non-official, non-realtime, source-conflict, and youth-data limitations.
- Added China U20 2025 final-squad coverage: 14 new raw player records plus `afc-u20-2025` participation entries on 9 existing U23/CSL youth records.
- Added China U17 2026 roster-boundary fields: `roster_status` on player participation records and `roster_boundary` on the tournament archive.
- Added China U20 2025 appearances and minutes from four official Match Summaries, with archive-to-player loader enrichment and aggregate validation.
- Added Zhang Haoran as the updated tournament-squad goalkeeper while preserving Yuan Jianrui in the original registration boundary.

### Data Notes

- China U20 2025 preserves both 23-player roster versions and their No. 22 goalkeeper change; 20 players logged 61 appearances, 44 starts, 3960 player-minutes and 8 goals across four matches.
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
