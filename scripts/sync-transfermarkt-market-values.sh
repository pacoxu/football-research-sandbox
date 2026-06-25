#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TMP_DIR="$(mktemp -d /private/tmp/tm-market-values.XXXXXX)"
MAP_FILE="$TMP_DIR/transfermarkt-players.tsv"

cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

cd "$ROOT"

node --input-type=module <<'NODE' > "$MAP_FILE"
import fs from "node:fs";
import path from "node:path";

const rawPlayersDir = path.resolve("data/raw/players");
const files = fs.readdirSync(rawPlayersDir).filter((name) => name.endsWith(".json")).sort();

for (const file of files) {
  const players = JSON.parse(fs.readFileSync(path.join(rawPlayersDir, file), "utf8"));
  for (const player of players) {
    const link = (player.external_links ?? []).find(
      (item) =>
        /transfermarkt/i.test(String(item.label ?? "")) || /transfermarkt/i.test(String(item.url ?? ""))
    );
    if (!link) {
      continue;
    }

    const tmPlayerId = String(link.url ?? "").match(/spieler\/(\d+)/i)?.[1] ?? "";
    process.stdout.write([player.id, tmPlayerId].join("\t") + "\n");
  }
}
NODE

while IFS=$'\t' read -r player_id tm_player_id; do
  if [[ -z "$tm_player_id" ]]; then
    continue
  fi

  if ! curl -sL \
    --retry 2 \
    --retry-all-errors \
    --connect-timeout 10 \
    -H 'Accept: application/json' \
    -H 'Accept-Language: en-US' \
    "https://tmapi-alpha.transfermarkt.technology/player/${tm_player_id}/market-value-history?_x_preferred_context=com" \
    > "$TMP_DIR/${player_id}.json"; then
    rm -f "$TMP_DIR/${player_id}.json"
  fi
done < "$MAP_FILE"

node "$ROOT/scripts/build-transfermarkt-market-values.mjs" "$TMP_DIR" "$ROOT/data/raw/player-market-values.json"
