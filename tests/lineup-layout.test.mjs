import test from "node:test";
import assert from "node:assert/strict";

import { arrangePitchGroup, assignedRoleLabel, roleLane } from "../assets/lineup-layout.js";

test("explicit left and right roles are placed on their matching sides", () => {
  const players = [
    { id: "rb", role: "右后卫" },
    { id: "cb-1", role: "中后卫" },
    { id: "lb", role: "左后卫" },
    { id: "cb-2", role: "中后卫" }
  ];

  assert.deepEqual(
    arrangePitchGroup(players).map(({ player, lane }) => [player.id, lane]),
    [["lb", -1], ["cb-1", 0], ["cb-2", 0], ["rb", 1]]
  );
});

test("unspecified flank players fill opposite sides", () => {
  const players = [
    { id: "wing-1", role: "边锋" },
    { id: "striker", role: "中锋" },
    { id: "wing-2", role: "边锋" }
  ];

  const arranged = arrangePitchGroup(players);
  assert.deepEqual(
    arranged.map(({ player, lane }) => [player.id, lane]),
    [["wing-1", -1], ["striker", 0], ["wing-2", 1]]
  );
  assert.equal(assignedRoleLabel("边锋", arranged[0].lane), "左边锋");
  assert.equal(assignedRoleLabel("边锋", arranged[2].lane), "右边锋");
});

test("an unspecified flank balances an existing explicit side", () => {
  const players = [
    { id: "left", role: "左边锋" },
    { id: "other", role: "边锋" }
  ];

  assert.deepEqual(
    arrangePitchGroup(players).map(({ player, lane }) => [player.id, lane]),
    [["left", -1], ["other", 1]]
  );
  assert.equal(roleLane("前腰"), 0);
});
