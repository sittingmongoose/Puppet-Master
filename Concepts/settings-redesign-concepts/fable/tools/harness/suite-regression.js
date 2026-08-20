/* suite-regression.js — the four frozen originals + hub must stay untouched.
 *
 * Loads c1-atlas, c2-mission-control, c3-focus-stack, c4-ledger and index.html
 * plain (no hash) at 1280x900 friendly-dark (their committed default), and
 * asserts: data-pm-state=ready (index has no stamp by design), zero console
 * errors/warnings, zero page exceptions, no document-level horizontal
 * overflow, and body innerText length within +/-15% of the recorded baseline.
 * Screenshots land in <out>/shots/regression/ for the visual auditors.
 *
 * Also asserts via git that _shared/ and every c1-c4 file (including their
 * register folders) are untouched. This repo sits on NFS with a known
 * phantom-CRLF hazard, so a dirty `status --porcelain` is re-checked with
 * `git diff --ignore-cr-at-eol --stat` before it is called a failure.
 */
"use strict";

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const DEFAULT_BASELINE =
  "/tmp/claude-1000/-mnt-Cursor-PuppetMaster/40f7a964-57bd-4480-bde3-5d37059b034a/scratchpad/baseline/report.json";

const PAGES = [
  { file: "c1-atlas.html", label: "c1-atlas", expectReady: true },
  { file: "c2-mission-control.html", label: "c2-mission-control", expectReady: true },
  { file: "c3-focus-stack.html", label: "c3-focus-stack", expectReady: true },
  { file: "c4-ledger.html", label: "c4-ledger", expectReady: true },
  { file: "index.html", label: "index", expectReady: false }
];

const PROTECTED_PATHSPECS = [
  "_shared", "c1-atlas", "c1-atlas.*", "c2-mission-control", "c2-mission-control.*",
  "c3-focus-stack", "c3-focus-stack.*", "c4-ledger", "c4-ledger.*"
];

function gitCheck(ctx) {
  const L = ctx.lib;
  const repo = ctx.repoRoot;
  if (!repo) {
    ctx.record("git", "protected-files-untouched", false, "could not locate the git repo root");
    return;
  }
  const rel = path.relative(repo, L.FABLE_DIR);
  const specs = PROTECTED_PATHSPECS.map((p) => path.join(rel, p));
  let statusOut = "";
  try {
    statusOut = execFileSync("git", ["-C", repo, "status", "--porcelain", "--"].concat(specs),
      { encoding: "utf8", timeout: 60000 });
  } catch (e) {
    ctx.record("git", "protected-files-untouched", false, "git status failed: " + String(e.message).slice(0, 300));
    return;
  }
  const lines = statusOut.split("\n").map((s) => s.trimEnd()).filter(Boolean);
  if (!lines.length) {
    ctx.record("git", "protected-files-untouched", true, "git status --porcelain clean for _shared/ + c1-c4");
    return;
  }
  // NFS phantom-CRLF re-check: only ' M' rows may be excused, and only when the
  // CRLF-insensitive diff is empty too.
  const onlyModified = lines.every((l) => /^\s?M\s/.test(l));
  if (onlyModified) {
    let diffOut = "not-run";
    try {
      diffOut = execFileSync("git", ["-C", repo, "diff", "--ignore-cr-at-eol", "--stat", "--"].concat(specs),
        { encoding: "utf8", timeout: 60000 }).trim();
    } catch (e) { diffOut = "git diff failed: " + String(e.message).slice(0, 200); }
    if (diffOut === "") {
      ctx.record("git", "protected-files-untouched", true, {
        note: "status showed modifications but the CRLF-insensitive diff is empty (known NFS phantom-CRLF hazard)",
        statusLines: lines.slice(0, 20)
      });
      return;
    }
    ctx.record("git", "protected-files-untouched", false, {
      note: "real content changes in protected files (survives --ignore-cr-at-eol)",
      statusLines: lines.slice(0, 20),
      diffStat: String(diffOut).slice(0, 800)
    });
    return;
  }
  ctx.record("git", "protected-files-untouched", false, {
    note: "untracked/renamed/deleted entries under protected paths",
    statusLines: lines.slice(0, 20)
  });
}

async function run(ctx) {
  const L = ctx.lib;
  const baselinePath = ctx.baseline || DEFAULT_BASELINE;
  let baseline = null;
  try {
    baseline = JSON.parse(fs.readFileSync(baselinePath, "utf8"));
  } catch (e) {
    ctx.record("baseline", "baseline-available", false,
      "cannot read baseline " + baselinePath + ": " + String(e.message).slice(0, 200));
  }
  if (baseline) ctx.record("baseline", "baseline-available", true, baselinePath);

  const shotDir = path.join(ctx.out, "shots", "regression");
  fs.mkdirSync(shotDir, { recursive: true });

  let page = null;
  try {
    page = await ctx.browser.newPage();
    await page.send("Network.setBlockedURLs", { urls: L.FONT_BLOCKS });
    await page.setViewport(1280, 900);

    for (const p of PAGES) {
      const full = path.join(L.FABLE_DIR, p.file);
      if (!fs.existsSync(full)) {
        ctx.record(p.label, "load", false, "file missing: " + p.file);
        continue;
      }
      page.clearDiagnostics();
      await page.goto(L.fileUrl(p.file));
      let ready = true;
      if (p.expectReady) ready = !!(await L.waitReady(page, 15000));
      await L.settle(page, 400);

      const state = await page.evaluate(function () {
        return {
          ready: document.documentElement.getAttribute("data-pm-state"),
          theme: document.documentElement.getAttribute("data-theme"),
          len: (document.body.innerText || "").length,
          overflow: document.documentElement.scrollWidth > window.innerWidth + 1 ||
            document.body.scrollWidth > window.innerWidth + 1
        };
      });
      const diag = L.snapDiagnostics(page);
      const errs = diag.errors.concat(diag.warnings).concat(diag.pageErrors);
      await L.screenshotSafe(page, path.join(shotDir, p.label + "-1280.png"));

      const problems = [];
      if (p.expectReady && !ready) problems.push("data-pm-state=ready never appeared");
      if (errs.length) problems.push("console/page errors: " + errs.slice(0, 3).join(" | "));
      if (state.overflow) problems.push("document-level horizontal overflow");
      let baseLen = null;
      if (baseline && baseline[p.file] && baseline[p.file].state) {
        baseLen = baseline[p.file].state.len;
        const lo = baseLen * 0.85, hi = baseLen * 1.15;
        if (!(state.len >= lo && state.len <= hi)) {
          problems.push("innerText length " + state.len + " outside +/-15% of baseline " + baseLen);
        }
      } else if (baseline) {
        problems.push("no baseline entry for " + p.file);
      }

      ctx.record(p.label, "visual-behavior-unchanged", problems.length === 0, {
        problems,
        len: state.len,
        baselineLen: baseLen,
        theme: state.theme,
        shot: path.join("shots", "regression", p.label + "-1280.png")
      });
    }
  } finally {
    await L.safeClosePage(page);
  }

  gitCheck(ctx);
}

module.exports = { name: "regression", run };
