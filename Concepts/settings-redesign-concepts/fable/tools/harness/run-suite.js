#!/usr/bin/env node
/* run-suite.js — Phase-C suite runner for the seven new fable Settings
 * concepts (05-11) plus the c1-c4/index regression guard.
 *
 * Usage (from the fable folder):
 *   node tools/harness/run-suite.js <suite> --out=<dir OUTSIDE the repo>
 *        [--concepts=05,06,...] [--themes=all|friendly-dark,...]
 *        [--widths=all|760,1280,...]
 *
 * Suites: matrix | search | managers | state | perf | regression
 *
 * One long-lived headless Chromium over file:// (http hangs in this sandbox),
 * one page per concept sequentially, per-check JSON records
 * {concept, suite, case, pass, detail}, written to <out>/<suite>-results.json
 * with screenshots under <out>/shots/. Exit 0 = all green, 1 = failures
 * recorded, 2 = harness-level crash / bad invocation.
 */
"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");
const { Browser } = require(path.join(__dirname, "cdp.js"));
const lib = require(path.join(__dirname, "suite-lib.js"));

const SUITES = {
  matrix: () => require(path.join(__dirname, "suite-matrix.js")),
  search: () => require(path.join(__dirname, "suite-search.js")),
  managers: () => require(path.join(__dirname, "suite-managers.js")),
  state: () => require(path.join(__dirname, "suite-state.js")),
  perf: () => require(path.join(__dirname, "suite-perf.js")),
  regression: () => require(path.join(__dirname, "suite-regression.js"))
};

function usage(msg) {
  if (msg) console.error("run-suite: " + msg);
  console.error("usage: node tools/harness/run-suite.js <" + Object.keys(SUITES).join("|") + ">" +
    " --out=<dir outside repo> [--concepts=05,..] [--themes=all|list] [--widths=all|list] [--baseline=<report.json>]");
  process.exit(2);
}

function findRepoRoot(from) {
  let dir = from;
  for (let i = 0; i < 12; i++) {
    if (fs.existsSync(path.join(dir, ".git"))) return dir;
    const up = path.dirname(dir);
    if (up === dir) break;
    dir = up;
  }
  return null;
}

function parseArgs(argv) {
  const args = { suite: null, out: null, concepts: null, themes: null, widths: null, baseline: null };
  for (const a of argv) {
    const m = /^--([a-z]+)=(.*)$/.exec(a);
    if (m) args[m[1]] = m[2];
    else if (!args.suite) args.suite = a;
    else usage("unexpected argument " + a);
  }
  if (!args.suite || !SUITES[args.suite]) usage("missing or unknown suite " + JSON.stringify(args.suite));
  if (!args.out) usage("--out=<dir> is required and must live OUTSIDE the repo");

  args.out = path.resolve(args.out);
  const repoRoot = findRepoRoot(lib.FABLE_DIR);
  if (repoRoot && (args.out === repoRoot || args.out.startsWith(repoRoot + path.sep))) {
    usage("--out must be outside the repo (" + repoRoot + "); got " + args.out);
  }

  // concepts subset
  let concepts = lib.CONCEPTS;
  if (args.concepts && args.concepts !== "all") {
    const wanted = args.concepts.split(",").map((s) => s.trim().padStart(2, "0")).filter(Boolean);
    concepts = lib.CONCEPTS.filter((c) => wanted.includes(c.num));
    if (!concepts.length) usage("no known concepts in --concepts=" + args.concepts);
  }

  let themes = lib.THEMES;
  if (args.themes && args.themes !== "all") {
    const wanted = args.themes.split(",").map((s) => s.trim()).filter(Boolean);
    for (const t of wanted) if (!lib.THEMES.includes(t)) usage("unknown theme " + t);
    themes = wanted;
  }

  let widths = lib.WIDTHS;
  if (args.widths && args.widths !== "all") {
    widths = args.widths.split(",").map((s) => Number(s.trim())).filter((n) => Number.isFinite(n) && n >= 320);
    if (!widths.length) usage("no usable widths in --widths=" + args.widths);
  }

  return { suite: args.suite, out: args.out, concepts, themes, widths, baseline: args.baseline, repoRoot };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  fs.mkdirSync(args.out, { recursive: true });

  const records = [];
  const startedAt = new Date().toISOString();
  const t0 = Date.now();

  const ctx = {
    suiteName: args.suite,
    browser: null,
    out: args.out,
    concepts: args.concepts,
    themes: args.themes,
    widths: args.widths,
    baseline: args.baseline,
    repoRoot: args.repoRoot,
    lib,
    record(concept, kase, pass, detail) {
      records.push({ concept, suite: args.suite, case: kase, pass: !!pass, detail: detail === undefined ? null : detail });
      if (!pass) {
        const d = typeof detail === "string" ? detail : JSON.stringify(detail);
        console.log("  FAIL " + concept + " :: " + kase + " — " + String(d).slice(0, 220));
      }
    },
    log(msg) { console.log("[" + args.suite + "] " + msg); }
  };

  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "pm-suite-" + args.suite + "-"));
  let exitCode = 0;
  let crashed = null;
  try {
    ctx.browser = await Browser.launch(profile);
    ctx.log("chromium up (profile " + profile + "), concepts: " +
      args.concepts.map((c) => c.num).join(",") + ", out: " + args.out);
    const suiteModule = SUITES[args.suite]();
    await suiteModule.run(ctx);
  } catch (e) {
    crashed = String((e && e.stack) || e).slice(0, 1200);
    console.error("run-suite crashed: " + crashed);
    exitCode = 2;
  } finally {
    try { if (ctx.browser) await ctx.browser.close(); } catch (e) { /* already down */ }
    try { fs.rmSync(profile, { recursive: true, force: true }); } catch (e) { /* temp reaper */ }
  }

  const byConcept = {};
  let failed = 0;
  for (const r of records) {
    byConcept[r.concept] = byConcept[r.concept] || { total: 0, passed: 0, failed: 0 };
    byConcept[r.concept].total++;
    if (r.pass) byConcept[r.concept].passed++;
    else { byConcept[r.concept].failed++; failed++; }
  }
  const summary = {
    total: records.length,
    passed: records.length - failed,
    failed,
    byConcept
  };

  const payload = {
    schema: "pm2.harness.results.v1",
    suite: args.suite,
    startedAt,
    finishedAt: new Date().toISOString(),
    durationMs: Date.now() - t0,
    args: {
      concepts: args.concepts.map((c) => c.num),
      themes: args.themes,
      widths: args.widths,
      out: args.out
    },
    crashed,
    summary,
    records
  };
  const resultFile = path.join(args.out, args.suite + "-results.json");
  fs.writeFileSync(resultFile, JSON.stringify(payload, null, 1));

  console.log("\n" + args.suite.toUpperCase() + ": " + summary.passed + "/" + summary.total +
    " checks passed" + (failed ? " (" + failed + " FAILED)" : "") + " -> " + resultFile);
  for (const k of Object.keys(byConcept)) {
    const b = byConcept[k];
    console.log("  " + k + ": " + b.passed + "/" + b.total + (b.failed ? "  FAIL:" + b.failed : ""));
  }
  if (exitCode === 0 && failed) exitCode = 1;
  process.exit(exitCode);
}

main().catch((e) => {
  console.error("run-suite fatal: " + ((e && e.stack) || e));
  process.exit(2);
});
