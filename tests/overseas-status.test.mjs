import test from "node:test";
import assert from "node:assert/strict";
import {
  countOverseasStatuses,
  getChinaOverseasStatusErrors,
  hasForeignRegistration,
  OVERSEAS_STATUSES
} from "../scripts/lib/overseas-status.mjs";
import { loadDataset } from "../scripts/lib/data-loader.mjs";

test("counts every overseas status without mixing countries", () => {
  const players = OVERSEAS_STATUSES.map((overseas_status, index) => ({
    country: "China PR",
    overseas_status,
    registration_club: {
      name: `Club ${index}`,
      country: overseas_status === "active-registered" ? "Spain" : "China"
    }
  }));
  players.push({
    country: "Japan",
    overseas_status: "active-registered",
    registration_club: { name: "Brighton", country: "England" }
  });

  assert.deepEqual(countOverseasStatuses(players), {
    "active-registered": 1,
    "pending-effective": 1,
    "trial-watch": 1,
    returned: 1,
    "historical-only": 1
  });
});

test("normalizes country aliases when checking foreign registration", () => {
  assert.equal(
    hasForeignRegistration({
      country: "China PR",
      registration_club: { country: "China" }
    }),
    false
  );
  assert.equal(
    hasForeignRegistration({
      country: "China PR",
      registration_club: { country: "France" }
    }),
    true
  );
});

test("rejects missing or inconsistent China overseas statuses", () => {
  const base = {
    country: "China PR",
    registration_club: { name: "Domestic FC", country: "China" },
    training_pathway: [],
    tournament_participation: []
  };

  assert.deepEqual(
    getChinaOverseasStatusErrors({
      ...base,
      registration_club: { name: "Foreign FC", country: "Spain" }
    }),
    ["foreign registration must be active-registered"]
  );
  assert.deepEqual(
    getChinaOverseasStatusErrors({ ...base, overseas_status: "active-registered" }),
    ["active-registered requires foreign registration"]
  );
  assert.deepEqual(
    getChinaOverseasStatusErrors({ ...base, overseas_status: "returned" }),
    ["returned requires a foreign training pathway"]
  );
  assert.deepEqual(
    getChinaOverseasStatusErrors({ ...base, overseas_status: "trial-watch" }),
    ["trial-watch requires a tracked record"]
  );
  assert.deepEqual(
    getChinaOverseasStatusErrors({ ...base, overseas_status: "pending-effective" }),
    ["pending-effective requires a pending-transfer record"]
  );
});

test("accepts returned, trial-watch, and pending-effective evidence", () => {
  const base = {
    country: "China PR",
    registration_club: { name: "Domestic FC", country: "China" },
    training_pathway: [],
    tournament_participation: []
  };

  assert.deepEqual(
    getChinaOverseasStatusErrors({
      ...base,
      overseas_status: "returned",
      training_pathway: [{ organization: "Foreign FC", country: "Spain" }]
    }),
    []
  );
  assert.deepEqual(
    getChinaOverseasStatusErrors({
      ...base,
      overseas_status: "trial-watch",
      tournament_participation: [{ squad_status: "tracked" }]
    }),
    []
  );
  assert.deepEqual(
    getChinaOverseasStatusErrors({
      ...base,
      overseas_status: "pending-effective",
      tournament_participation: [{ squad_status: "pending-transfer" }]
    }),
    []
  );
});

test("keeps the China overseas dataset at 17 active registrations and 3 returned players", async () => {
  const dataset = await loadDataset();
  assert.deepEqual(countOverseasStatuses(dataset.players), {
    "active-registered": 17,
    "pending-effective": 0,
    "trial-watch": 0,
    returned: 3,
    "historical-only": 0
  });
});
