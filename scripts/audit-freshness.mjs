import fs from "node:fs/promises";
import path from "node:path";
import { loadDataset, paths } from "./lib/data-loader.mjs";
import { auditFreshness, exitCodeForReport, parseIsoDate } from "./lib/freshness-audit.mjs";

function optionValue(name) {
  const direct = process.argv.find((argument) => argument.startsWith(`${name}=`));
  if (direct) return direct.slice(name.length + 1);
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

const asOf = optionValue("--as-of") ?? new Date().toISOString().slice(0, 10);
const format = optionValue("--format") ?? "table";
const strict = process.argv.includes("--strict");
parseIsoDate(asOf, "as-of date");
if (!new Set(["table", "json"]).has(format)) throw new Error(`Invalid format: ${format}`);

const [dataset, marketValues] = await Promise.all([
  loadDataset(),
  fs.readFile(path.join(paths.raw, "player-market-values.json"), "utf8").then(JSON.parse)
]);
const report = auditFreshness(dataset, marketValues, asOf);

if (format === "json") {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(
    `Freshness audit as of ${report.as_of}: ${report.audited_records} records checked, ${report.findings.length} overdue.`
  );
  console.log(
    `Overdue by window: 30d=${report.summary.by_window["30"]}, 90d=${report.summary.by_window["90"]}, 180d=${report.summary.by_window["180"]}`
  );
  for (const finding of report.findings) {
    console.log(
      `${finding.entity_type}\t${finding.entity_id}\t${finding.field}\t${finding.last_checked}\t${finding.review_window_days}d\t+${finding.overdue_days}d\t${finding.reason}`
    );
  }
}

process.exitCode = exitCodeForReport(report, strict);
