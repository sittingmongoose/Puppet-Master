/* suite-matrix.js — responsive/theme matrix.
 *
 * Per concept x theme x width: #/home?instant=1 must render with zero console
 * errors/warnings, zero page exceptions, no document-level horizontal
 * overflow, no visible element past the viewport right edge (>2px, clip-aware,
 * [data-allow-hscroll] respected), pm-shell titlebar + statusbar visible, and
 * real body text. At 760 and 1280 the same checks also run on #/dest/ai,
 * #/manager/m.providers, #/all and #/copy.
 *
 * Screenshots (the visual auditors read these — names are the contract):
 *   <out>/shots/concept-NN/<theme>-<width>-<route>.png
 *   route slug: home | dest-ai | manager-m.providers | all | copy
 */
"use strict";

const path = require("path");
const fs = require("fs");

const EXTRA_ROUTES = [
  ["dest/ai", "dest-ai"],
  ["manager/m.providers", "manager-m.providers"],
  ["all", "all"],
  ["copy", "copy"]
];
const EXTRA_WIDTHS = [760, 1280];
const HEIGHT = 900;

async function runCell(ctx, page, label, theme, width, route, slug, shotDir) {
  const L = ctx.lib;
  page.clearDiagnostics();
  await L.hashRoute(page, route, { theme }, 260);

  // The route module applies ?theme= via PMShell.applyView; if a concept broke
  // that path, stamp the theme directly (matrix measures layout, not the
  // param plumbing) and remember the slip in the cell detail.
  const themeApplied = await page.evaluate(function (theme) {
    var got = document.documentElement.getAttribute("data-theme");
    if (got === theme) return true;
    try {
      if (window.PMShell && typeof window.PMShell.applyView === "function") {
        window.PMShell.applyView({ theme: theme });
      } else {
        document.documentElement.setAttribute("data-theme", theme);
      }
    } catch (e) { document.documentElement.setAttribute("data-theme", theme); }
    return false;
  }, theme);
  if (!themeApplied) await L.settle(page, 160);

  const routeOk = await L.waitRouteTokens(page, [route.split("?")[0].split("/")[0]], 2500);
  const diag = L.snapDiagnostics(page);
  const overflow = await L.scanOverflow(page);
  const shell = await L.shellCheck(page);

  const shot = path.join(shotDir, theme + "-" + width + "-" + slug + ".png");
  const shotOk = await L.screenshotSafe(page, shot);

  const problems = [];
  if (!routeOk) problems.push("route stamp missing/mismatched");
  if (diag.errors.length) problems.push("console errors: " + diag.errors.slice(0, 2).join(" | "));
  if (diag.warnings.length) problems.push("console warnings: " + diag.warnings.slice(0, 2).join(" | "));
  if (diag.pageErrors.length) problems.push("page exceptions: " + diag.pageErrors.slice(0, 2).join(" | "));
  if (overflow.docOverflow) problems.push("document-level horizontal overflow");
  if (overflow.offenders.length) problems.push("overflow offenders: " + JSON.stringify(overflow.offenders.slice(0, 3)));
  if (!shell.titlebar) problems.push("titlebar not visible");
  if (!shell.statusbar) problems.push("statusbar not visible");
  if (shell.textLen < 60) problems.push("body text nearly empty (" + shell.textLen + " chars)");
  if (!shotOk) problems.push("screenshot failed");

  ctx.record(label, theme + "-" + width + "-" + slug, problems.length === 0, {
    problems,
    themeParamApplied: themeApplied,
    textLen: shell.textLen,
    shot: path.relative(ctx.out, shot)
  });
}

async function run(ctx) {
  const L = ctx.lib;
  await L.forEachConcept(ctx, 18 * 60 * 1000, async (page, concept, label) => {
    const shotDir = path.join(ctx.out, "shots", label);
    fs.mkdirSync(shotDir, { recursive: true });

    let booted = false;
    for (const theme of ctx.themes) {
      for (const width of ctx.widths) {
        await page.setViewport(width, HEIGHT);
        if (!booted) {
          const ready = await L.bootConcept(page, concept, "home", { theme }, { width, height: HEIGHT });
          if (!ready) {
            ctx.record(label, "boot", false, "data-pm-state=ready never appeared");
            await L.screenshotSafe(page, path.join(shotDir, "boot-failed.png"));
            return;
          }
          ctx.record(label, "boot", true, "ready");
          booted = true;
        }
        await runCell(ctx, page, label, theme, width, "home", "home", shotDir);
        if (EXTRA_WIDTHS.includes(width)) {
          for (const [route, slug] of EXTRA_ROUTES) {
            await runCell(ctx, page, label, theme, width, route, slug, shotDir);
          }
          await L.hashRoute(page, "home", { theme }, 200);
        }
      }
    }
  });
}

module.exports = { name: "matrix", run };
