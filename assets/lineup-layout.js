const LEFT = -1;
const CENTRE = 0;
const RIGHT = 1;

export function roleLane(role = "") {
  if (role.includes("左")) return LEFT;
  if (role.includes("右")) return RIGHT;
  if (role.includes("边")) return null;
  return CENTRE;
}

export function arrangePitchGroup(players) {
  const laneCounts = { [LEFT]: 0, [RIGHT]: 0 };
  const arranged = players.map((player, index) => {
    const lane = roleLane(player.role);
    if (lane === LEFT || lane === RIGHT) laneCounts[lane] += 1;
    return { player, lane, index };
  });

  arranged.forEach((entry) => {
    if (entry.lane !== null) return;
    entry.lane = laneCounts[LEFT] <= laneCounts[RIGHT] ? LEFT : RIGHT;
    laneCounts[entry.lane] += 1;
  });

  return arranged.sort((a, b) => a.lane - b.lane || a.index - b.index);
}

export function assignedRoleLabel(role, lane) {
  if (role.includes("左") || role.includes("右") || !role.includes("边")) return role;
  return `${lane === LEFT ? "左" : "右"}${role}`;
}
