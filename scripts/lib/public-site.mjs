const PUBLIC_PLAYER_FIELDS = [
  "id",
  "name",
  "local_name",
  "names",
  "country",
  "birth_date",
  "birth_place",
  "age_band",
  "primary_position",
  "height_cm",
  "weight_kg",
  "registration_club",
  "training_pathway",
  "focus_tags",
  "tournament_participation",
  "external_links",
  "source_layers",
  "verification",
  "league_system_override",
  "overseas_bucket_override",
  "overseas_status",
  "market_value"
];

const PUBLIC_MARKET_VALUE_FIELDS = [
  "checked_at",
  "status",
  "current",
  "peak",
  "history",
  "source",
  "alternatives"
];

const PUBLIC_MARKET_VALUE_POINT_FIELDS = ["eur", "currency", "display", "date", "age"];
const PUBLIC_MARKET_VALUE_SOURCE_FIELDS = ["provider", "profile_url", "market_value_url"];

function pickDefined(source, fields) {
  const allowed = new Set(fields);
  return Object.fromEntries(
    Object.entries(source ?? {}).filter(([field, value]) => allowed.has(field) && value !== undefined)
  );
}

function sanitizeMarketValuePoint(point) {
  return point ? pickDefined(point, PUBLIC_MARKET_VALUE_POINT_FIELDS) : point;
}

function sanitizeMarketValueSource(source) {
  return source ? pickDefined(source, PUBLIC_MARKET_VALUE_SOURCE_FIELDS) : source;
}

function sanitizeMarketValueAlternative(alternative) {
  if (!alternative) return alternative;
  return {
    ...pickDefined(alternative, ["checked_at", "status"]),
    ...(Array.isArray(alternative.history)
      ? { history: alternative.history.map(sanitizeMarketValuePoint) }
      : {}),
    ...(alternative.source ? { source: sanitizeMarketValueSource(alternative.source) } : {})
  };
}

function sanitizeMarketValue(record) {
  if (!record) return record;
  const publicRecord = pickDefined(record, PUBLIC_MARKET_VALUE_FIELDS);
  if (publicRecord.current) publicRecord.current = sanitizeMarketValuePoint(publicRecord.current);
  if (publicRecord.peak) publicRecord.peak = sanitizeMarketValuePoint(publicRecord.peak);
  if (Array.isArray(publicRecord.history)) {
    publicRecord.history = publicRecord.history.map(sanitizeMarketValuePoint);
  }
  if (publicRecord.source) publicRecord.source = sanitizeMarketValueSource(publicRecord.source);
  if (Array.isArray(publicRecord.alternatives)) {
    publicRecord.alternatives = publicRecord.alternatives.map(sanitizeMarketValueAlternative);
  }
  return publicRecord;
}

export function toPublicPlayer(player) {
  const publicPlayer = pickDefined(player, PUBLIC_PLAYER_FIELDS);
  if (publicPlayer.market_value) {
    publicPlayer.market_value = sanitizeMarketValue(publicPlayer.market_value);
  }
  return publicPlayer;
}

export const publicPlayerContract = Object.freeze({
  topLevelFields: Object.freeze([...PUBLIC_PLAYER_FIELDS]),
  marketValueFields: Object.freeze([...PUBLIC_MARKET_VALUE_FIELDS]),
  marketValuePointFields: Object.freeze([...PUBLIC_MARKET_VALUE_POINT_FIELDS]),
  marketValueSourceFields: Object.freeze([...PUBLIC_MARKET_VALUE_SOURCE_FIELDS])
});
