import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { paths } from "../scripts/lib/data-loader.mjs";
import { validatePlayerCompetitionReference } from "../scripts/validate-data.mjs";
import { formatErrors, validateJsonSchemas } from "../scripts/validate-json-schemas.mjs";

test("validates every manifest entry including generated site data", async () => {
  const result = await validateJsonSchemas();
  assert.ok(result.validatedFiles >= 35);
});

test("reports file and record paths for schema failures", async () => {
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  for (const name of ["common.schema.json", "players.schema.json"]) {
    ajv.addSchema(JSON.parse(await fs.readFile(path.join(paths.root, "data/schema", name), "utf8")));
  }
  const validate = ajv.getSchema("https://football-research.local/schema/players.schema.json");
  const players = JSON.parse(await fs.readFile(path.join(paths.raw, "players/china-u23-2026.json"), "utf8"));
  delete players[0].birth_date;
  assert.equal(validate(players), false);
  const message = formatErrors(path.join(paths.raw, "players/china-u23-2026.json"), validate.errors);
  assert.match(message, /data\/raw\/players\/china-u23-2026\.json\/0/);
  assert.match(message, /birth_date/);
});

test("reports invalid dates and enum values with file paths", async () => {
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  for (const name of ["common.schema.json", "players.schema.json"]) {
    ajv.addSchema(JSON.parse(await fs.readFile(path.join(paths.root, "data/schema", name), "utf8")));
  }
  const validate = ajv.getSchema("https://football-research.local/schema/players.schema.json");
  const filePath = path.join(paths.raw, "players/china-u23-2026.json");
  const players = JSON.parse(await fs.readFile(filePath, "utf8"));
  players[0].birth_date = "2026-02-30";
  players[0].verification.status = "certain";
  assert.equal(validate(players), false);
  const message = formatErrors(filePath, validate.errors);
  assert.match(message, /data\/raw\/players\/china-u23-2026\.json\/0\/birth_date/);
  assert.match(message, /data\/raw\/players\/china-u23-2026\.json\/0\/verification\/status/);
});

test("reports invalid cross-record references with their source file", () => {
  assert.throws(
    () => validatePlayerCompetitionReference(
      { id: "sample-player" },
      { competition_id: "missing-competition" },
      new Set(["known-competition"]),
      { "sample-player": "data/raw/players/sample.json" }
    ),
    /missing-competition.*data\/raw\/players\/sample\.json/
  );
});
