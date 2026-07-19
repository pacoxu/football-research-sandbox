#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

node "$ROOT/scripts/sync-transfermarkt-market-values.mjs" "$@"
