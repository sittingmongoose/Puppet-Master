// Shared Playwright bootstrap: system Chrome + playwright-core from the user-local
// test dir (%LOCALAPPDATA%/pm-concept-tests), fresh profile per run, evidence outside
// the concept folder.
import { spawn } from "node:child_process";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const testsDir = fileURLToPath(new URL(".", import.meta.url));
const conceptRoot = path.resolve(testsDir, "..", "..");
const pwTestsDir = process.env.PM_CONCEPT_TESTS_DIR || path.join(os.homedir(), "AppData", "Local", "pm-concept-tests");
const require2 = createRequire(path.join(pwTestsDir, "node_modules", "playwright-core") + path.sep);
export const pw = require2("playwright-core");

export const ROOT = conceptRoot;
export const CHROME = process.env.PM_CHROME || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const RUN_STAMP = process.env.PM_RUN_STAMP || new Date().toISOString().replace(/[:.]/g, "-");
export const EVIDENCE_DIR = path.join(os.homedir(), "AppData", "Local", "pm-concept-evidence", "qwen-3-8", RUN_STAMP);
fs.mkdirSync(EVIDENCE_DIR, { recursive: true });

export function startServer() {
  return new Promise((resolve, reject) => {
    const proc = spawn(process.execPath, [path.join(testsDir, "static-server.mjs")], { stdio: ["ignore", "pipe", "pipe"] });
    let buf = "";
    const timer = setTimeout(() => reject(new Error("static server did not print PORT in 15s")), 15000);
    proc.stdout.on("data", d => {
      buf += d.toString();
      const m = buf.match(/PORT=(\d+)/);
      if (m) { clearTimeout(timer); resolve({ proc, port: Number(m[1]) }); }
    });
    proc.stderr.on("data", d => process.stderr.write(d));
    proc.on("exit", code => reject(new Error("static server exited early: " + code)));
  });
}

let launchSeq = 0;
export async function launch(opts) {
  opts = opts || {};
  const profileDir = path.join(os.homedir(), "AppData", "Local", "pm-concept-evidence", "qwen-3-8", "profile-" + RUN_STAMP + "-" + (++launchSeq));
  fs.mkdirSync(profileDir, { recursive: true });
  const ctx = await pw.chromium.launchPersistentContext(profileDir, {
    executablePath: CHROME,
    headless: process.env.PM_HEADLESS !== "0",
    viewport: { width: opts.width || 1280, height: opts.height || 900 },
    args: ["--no-first-run", "--no-default-browser-check", "--font-render-hinting=none"]
  });
  // Persistent context doubles as browser handle for our callers.
  return ctx;
}

export function pageErrors(page) {
  const errors = [];
  page.on("pageerror", e => errors.push("pageerror: " + (e.message || String(e))));
  page.on("console", m => {
    if (m.type() !== "error") return;
    const text = m.text();
    // External CDN (fonts) load failures are network noise, not product bugs.
    if (text.indexOf("Failed to load resource") >= 0) {
      const loc = m.location() || {};
      const url = loc.url || "";
      if (!url || url.indexOf("127.0.0.1") < 0 && url.indexOf("localhost") < 0) return;
    }
    errors.push("console: " + text);
  });
  return errors;
}

export function shot(page, name) {
  const file = path.join(EVIDENCE_DIR, name.replace(/[^\w.\-]+/g, "_") + ".png");
  return page.screenshot({ path: file }).then(() => file);
}

export async function openHost(port, query, opts) {
  opts = opts || {};
  const ctx = await launch(opts);
  const page = ctx.pages()[0] || await ctx.newPage();
  const errors = pageErrors(page);
  const url = "http://127.0.0.1:" + port + "/host.html?" + query;
  await page.goto(url, { waitUntil: "load", timeout: 30000 });
  await page.waitForSelector(".pmq-msg", { timeout: 15000 });
  return { browser: ctx, ctx, page, errors, url };
}

export async function settle(page, ms) { await page.waitForTimeout(ms || 400); }

let reportAgg = null;
export function results(suite) {
  reportAgg = { suite, checks: [] };
  return {
    check(name, pass, detail) {
      reportAgg.checks.push({ name: String(name), pass: !!pass, detail: detail == null ? "" : String(detail) });
      if (!pass) console.error("FAIL " + suite + " :: " + name + (detail ? " — " + detail : ""));
      return !!pass;
    },
    summary() {
      const pass = reportAgg.checks.filter(c => c.pass).length;
      return { suite, checks: reportAgg.checks.length, pass, fail: reportAgg.checks.length - pass };
    }
  };
}

export function writeReportSlice(suiteName, concept, width, theme, motion, checks) {
  // Phase-7 aggregator contract: append run rows; final merge done by report.mjs.
  const file = path.join(EVIDENCE_DIR, "report-slices.jsonl");
  const row = { suite: suiteName, concept, width, theme, motion, checks };
  fs.appendFileSync(file, JSON.stringify(row) + "\n");
}
