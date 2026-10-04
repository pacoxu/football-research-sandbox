const allowedSpainContractTypes = new Set(["professional", "youth-formation", "unknown"]);
const allowedSpainAppearanceStatuses = new Set([
  "appeared",
  "registered-no-appearance",
  "contract-only",
  "observation"
]);
const allowedVerificationStatuses = new Set([
  "verified",
  "mixed-source",
  "provisional",
  "needs-review",
  "conflict",
  "stale",
  "rejected"
]);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function isIsoDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function validateLocalizedText(value, label) {
  assert(typeof value === "object" && value !== null, `Invalid localized text on ${label}`);
  assert(typeof value.zh === "string" && value.zh.length > 0, `Missing Chinese text on ${label}`);
  assert(typeof value.en === "string" && value.en.length > 0, `Missing English text on ${label}`);
}

export function validateSpainFootballSystem(payload, playerIds, featuredRecordIds) {
  assert(payload?.schema_version === 1, "Unsupported spain-football-system schema version");
  assert(isIsoDate(payload.checked_at), "Invalid spain-football-system checked_at");
  validateLocalizedText(payload.summary, "spain-football-system.summary");
  validateLocalizedText(payload.scope_note, "spain-football-system.scope_note");
  assert(Array.isArray(payload.pyramids) && payload.pyramids.length === 3, "Expected three Spain pyramids");
  assert(
    JSON.stringify(payload.pyramids.map((pyramid) => pyramid.id)) === JSON.stringify(["senior", "u19", "u16"]),
    "Spain pyramids must be senior, u19 and u16"
  );

  const layerIds = new Set();
  for (const pyramid of payload.pyramids) {
    validateLocalizedText(pyramid.name, `${pyramid.id}.name`);
    validateLocalizedText(pyramid.summary, `${pyramid.id}.summary`);
    assert(Array.isArray(pyramid.layers) && pyramid.layers.length > 0, `Missing layers on ${pyramid.id}`);
    for (const layer of pyramid.layers) {
      assert(!layerIds.has(layer.id), `Duplicate Spain layer id: ${layer.id}`);
      layerIds.add(layer.id);
      assert(Number.isInteger(layer.tier) && layer.tier >= 1, `Invalid tier on ${layer.id}`);
      validateLocalizedText(layer.name, `${layer.id}.name`);
      validateLocalizedText(layer.stable_structure, `${layer.id}.stable_structure`);
      assert(/^https?:\/\//.test(layer.source_url), `Invalid source URL on ${layer.id}`);
    }
  }

  const expectedLayerIds = [
    "laliga",
    "segunda",
    "primera-federacion",
    "segunda-federacion",
    "tercera-federacion",
    "regional-senior",
    "division-honor-juvenil",
    "liga-nacional-juvenil",
    "preferente-juvenil",
    "cadete-honor",
    "cadete-other",
    "club-academy-unspecified"
  ];
  assert(
    JSON.stringify([...layerIds]) === JSON.stringify(expectedLayerIds),
    "Spain layer ids drifted from the expected pyramid"
  );

  const contractTypeIds = new Set();
  for (const contractType of payload.contract_types ?? []) {
    assert(allowedSpainContractTypes.has(contractType.id), `Invalid Spain contract type: ${contractType.id}`);
    contractTypeIds.add(contractType.id);
    validateLocalizedText(contractType.label, `${contractType.id}.label`);
    validateLocalizedText(contractType.detail, `${contractType.id}.detail`);
  }
  assert(contractTypeIds.size === 3, "Expected three Spain contract types");

  const placementIds = new Set();
  const requiredPlayers = [
    "cn-li-hao-2004",
    "cn-yang-alex-2005",
    "cn-lyu-mengyang-2009",
    "cn-liu-kaiyuan-2010",
    "cn-du-yuezheng-2005"
  ];
  const requiredRecords = ["wu-lei-espanyol-2019", "zhang-chengdong-rayo-2015"];
  for (const placement of payload.placements ?? []) {
    assert(!placementIds.has(placement.id), `Duplicate Spain placement id: ${placement.id}`);
    placementIds.add(placement.id);
    assert(layerIds.has(placement.layer_id), `Unknown Spain layer on ${placement.id}`);
    assert(allowedSpainContractTypes.has(placement.contract_type), `Invalid contract type on ${placement.id}`);
    assert(
      allowedSpainAppearanceStatuses.has(placement.appearance_status),
      `Invalid appearance status on ${placement.id}`
    );
    assert(allowedVerificationStatuses.has(placement.verification_status), `Invalid verification on ${placement.id}`);
    assert(typeof placement.club === "string" && placement.club.length > 0, `Missing club on ${placement.id}`);
    assert(typeof placement.season === "string" && placement.season.length > 0, `Missing season on ${placement.id}`);
    validateLocalizedText(placement.note, `${placement.id}.note`);
    assert(
      Boolean(placement.player_id) || Boolean(placement.featured_record_id),
      `Spain placement ${placement.id} needs a player_id or featured_record_id`
    );
    if (placement.player_id) {
      assert(playerIds.has(placement.player_id), `Unknown player on Spain placement ${placement.id}`);
    }
    if (placement.featured_record_id) {
      assert(
        featuredRecordIds.has(placement.featured_record_id),
        `Unknown featured record on Spain placement ${placement.id}`
      );
    }
  }
  for (const playerId of requiredPlayers) {
    assert(
      payload.placements.some((placement) => placement.player_id === playerId),
      `Missing required Spain placement for ${playerId}`
    );
  }
  for (const recordId of requiredRecords) {
    assert(
      payload.placements.some((placement) => placement.featured_record_id === recordId),
      `Missing required Spain placement for ${recordId}`
    );
  }
  assert(
    payload.placements.some(
      (placement) => placement.player_id === "cn-yang-alex-2005" && placement.layer_id === "division-honor-juvenil"
    ),
    "Yang Xi must remain linked to División de Honor Juvenil"
  );
  assert(
    payload.placements.some(
      (placement) => placement.player_id === "cn-lyu-mengyang-2009" && placement.layer_id === "liga-nacional-juvenil"
    ),
    "Lyu Mengyang must remain linked to Liga Nacional Juvenil, not División de Honor"
  );
  assert(
    !payload.placements.some(
      (placement) => placement.player_id === "cn-lyu-mengyang-2009" && placement.layer_id === "laliga"
    ),
    "Lyu Mengyang must not be placed on LaLiga"
  );

  for (const source of payload.source_links ?? []) {
    assert(source.label && /^https?:\/\//.test(source.url), "Invalid Spain system source");
    assert(isIsoDate(source.checked_at), "Invalid Spain system source date");
  }
}
