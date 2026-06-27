# Changelog

All notable project data-model, generation, and documentation changes should be recorded here.

This project tracks research data, so changelog entries should separate code changes, data-scope changes, major data additions, and corrections.

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
