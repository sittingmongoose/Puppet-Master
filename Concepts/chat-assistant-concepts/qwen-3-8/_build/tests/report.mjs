// Shared report aggregator for the Phase-8 probe suites.
// Suites call record(...) to append run rows; `node report.mjs` finalizes
// interaction-test-report.json at the concept folder root from the slices.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const testsDir = fileURLToPath(new URL(".", import.meta.url));
const conceptRoot = path.resolve(testsDir, "..", "..");
const SLICES = path.join(testsDir, "report-slices.jsonl");
const REPORT = path.join(conceptRoot, "interaction-test-report.json");

export function record(suite, concept, width, theme, motion, checks) {
  const row = { suite, concept: concept || "shared", width: width || null, theme: theme || null, motion: motion || "full", checks };
  fs.appendFileSync(SLICES, JSON.stringify(row) + "\n");
  const fail = checks.filter(c => !c.pass).length;
  return fail;
}

export function check(name, pass, detail) {
  return { name: String(name), pass: !!pass, detail: detail == null ? "" : String(detail) };
}

export function finalize(remainingDefects) {
  let runs = [];
  if (fs.existsSync(SLICES)) {
    runs = fs.readFileSync(SLICES, "utf8").split("\n").filter(Boolean).map(l => JSON.parse(l));
  }
  let pass = 0, fail = 0;
  runs.forEach(r => r.checks.forEach(c => { if (c.pass) pass++; else fail++; }));
  const out = {
    schema_id: "pm.chat_interaction_test_report.v1",
    model: "Qwen 3.8",
    generated_at: new Date().toISOString(),
    runs,
    totals: { pass, fail },
    remaining_defects: remainingDefects || []
  };
  fs.writeFileSync(REPORT, JSON.stringify(out, null, 2));
  return out;
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const out = finalize();
  console.log(JSON.stringify({ totals: out.totals, runs: out.runs.length, report: REPORT }));
}
