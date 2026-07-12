import assert from "node:assert/strict";
import test from "node:test";

import { resolveSnapshotIdentity } from "../scripts/create-snapshot-manifest.mjs";

test("builds a monthly snapshot tag", () => {
  assert.deepEqual(
    resolveSnapshotIdentity({ kind: "monthly", date: "2026-07-12" }),
    { kind: "monthly", slug: null, date: "2026-07-12", tag: "snapshot-2026-07" }
  );
});

test("builds event and scope snapshot tags", () => {
  assert.equal(
    resolveSnapshotIdentity({ kind: "event", slug: "afc-u20-2027", date: "2026-08-25" }).tag,
    "snapshot-afc-u20-2027-2026-08-25"
  );
  assert.equal(
    resolveSnapshotIdentity({ kind: "scope", slug: "source-layers", date: "2026-07-12" }).tag,
    "snapshot-scope-source-layers-2026-07-12"
  );
});

test("rejects ambiguous snapshot identifiers", () => {
  assert.throws(
    () => resolveSnapshotIdentity({ kind: "event", slug: "AFC U20", date: "2026-08-25" }),
    /lowercase kebab-case/
  );
  assert.throws(
    () => resolveSnapshotIdentity({ kind: "monthly", slug: "extra", date: "2026-07-12" }),
    /must not include a slug/
  );
  assert.throws(
    () => resolveSnapshotIdentity({ kind: "monthly", date: "2026-02-31" }),
    /Invalid snapshot date/
  );
});
