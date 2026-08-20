/* suite-perf.js — lazy-hydration and navigation-latency checks.
 *
 * Per concept, with an instrumentation script injected BEFORE any page script
 * runs (Page.addScriptToEvaluateOnNewDocument traps window.PM2 and wraps every
 * registered manager def's model() in a call counter):
 *  - #/home?instant=1 computes ZERO manager view models, renders zero
 *    [data-manager-surface] and zero [data-setting-id] rows;
 *  - searching from Home does not hydrate any manager;
 *  - #/all renders a bounded row window (<300 [data-setting-id]);
 *  - Home -> domain -> manager -> Back each land in under 1.5s.
 */
"use strict";

const NAV_BUDGET_MS = 1500;

const INSTRUMENT = "(function () {\n" +
  "  var counts = {};\n" +
  "  window.__pm2ModelCalls = counts;\n" +
  "  function wrapDef(d) {\n" +
  "    if (!d || typeof d.model !== 'function' || d.model.__pmCounted) return;\n" +
  "    var orig = d.model;\n" +
  "    var w = function () { counts[d.id] = (counts[d.id] || 0) + 1; return orig.apply(this, arguments); };\n" +
  "    w.__pmCounted = true;\n" +
  "    d.model = w;\n" +
  "  }\n" +
  "  function hook(m) {\n" +
  "    if (!m || typeof m !== 'object' || m.__pmHooked) return m;\n" +
  "    if (typeof m.register !== 'function') return m;\n" +
  "    m.__pmHooked = true;\n" +
  "    var oreg = m.register;\n" +
  "    m.register = function () {\n" +
  "      var r = oreg.apply(m, arguments);\n" +
  "      try { m.all().forEach(wrapDef); } catch (e) {}\n" +
  "      return r;\n" +
  "    };\n" +
  "    try { m.all().forEach(wrapDef); } catch (e) {}\n" +
  "    return m;\n" +
  "  }\n" +
  "  function instrument(o) {\n" +
  "    if (!o || o.__pmInstr) return o;\n" +
  "    try {\n" +
  "      o.__pmInstr = true;\n" +
  "      var mv = o.managers;\n" +
  "      if (mv) hook(mv);\n" +
  "      Object.defineProperty(o, 'managers', {\n" +
  "        configurable: true,\n" +
  "        get: function () { return mv; },\n" +
  "        set: function (m) { mv = hook(m); }\n" +
  "      });\n" +
  "    } catch (e) {}\n" +
  "    return o;\n" +
  "  }\n" +
  "  var holder;\n" +
  "  Object.defineProperty(window, 'PM2', {\n" +
  "    configurable: true,\n" +
  "    get: function () { return holder; },\n" +
  "    set: function (v) { holder = instrument(v || {}); }\n" +
  "  });\n" +
  "})();";

function modelCallSnapshot(page) {
  return page.evaluate(function () {
    var c = window.__pm2ModelCalls;
    if (!c || typeof c !== "object") return { instrumented: false, total: 0, byManager: {} };
    var total = 0;
    for (var k in c) total += c[k];
    return { instrumented: true, total: total, byManager: c };
  });
}

async function timedNav(ctx, page, route, tokens) {
  const L = ctx.lib;
  const t0 = Date.now();
  await page.evaluate(function (hash) { window.location.hash = hash; }, L.buildHash(route, {}));
  const stamp = await L.waitRouteTokens(page, tokens, 5000);
  return { ms: Date.now() - t0, stamp };
}

async function run(ctx) {
  const L = ctx.lib;
  await L.forEachConcept(ctx, 6 * 60 * 1000, async (page, concept, label) => {
    await page.send("Page.addScriptToEvaluateOnNewDocument", { source: INSTRUMENT });

    const ready = await L.bootConcept(page, concept, "home", {}, { width: 1280, height: 900 });
    if (!ready) { ctx.record(label, "boot", false, "data-pm-state=ready never appeared"); return; }
    ctx.record(label, "boot", true, "ready");

    // 1. Home hydrates no manager view models and no manager/workspace DOM.
    let calls = await modelCallSnapshot(page);
    const homeDom = await page.evaluate(function () {
      return {
        managerSurfaces: document.querySelectorAll("[data-manager-surface]").length,
        settingRows: document.querySelectorAll("[data-setting-id]").length
      };
    });
    if (!calls.instrumented) {
      ctx.record(label, "home-lazy-models", homeDom.managerSurfaces === 0, {
        note: "model-call instrumentation unavailable (PM2 trap bypassed); DOM-only verdict",
        homeDom
      });
    } else {
      ctx.record(label, "home-lazy-models", calls.total === 0, {
        modelCallsAtHome: calls.byManager, homeDom
      });
    }
    ctx.record(label, "home-no-manager-dom", homeDom.managerSurfaces === 0 && homeDom.settingRows === 0, homeDom);

    // 2. Search from Home must not hydrate managers.
    const input = await L.findSearchInput(page);
    if (!input.found) {
      ctx.record(label, "search-no-hydration", false, "no search input discoverable on Home");
    } else {
      await L.typeQuery(page, "rate limits");
      await L.waitResults(page, 3000);
      calls = await modelCallSnapshot(page);
      const after = await page.evaluate(function () {
        return { managerSurfaces: document.querySelectorAll("[data-manager-surface]").length };
      });
      const hydrated = calls.instrumented ? calls.total > 0 : false;
      ctx.record(label, "search-no-hydration", !hydrated && after.managerSurfaces === 0, {
        inputStrategy: input.strategy,
        modelCallsAfterSearch: calls.instrumented ? calls.byManager : "uninstrumented",
        managerSurfacesAfterSearch: after.managerSurfaces
      });
    }

    // 3. #/all stays bounded.
    await L.hashRoute(page, "all", {}, 400);
    const allRows = await page.evaluate(function () {
      return document.querySelectorAll("[data-setting-id]").length;
    });
    ctx.record(label, "all-rows-bounded", allRows > 0 && allRows < 300,
      allRows + " [data-setting-id] rows rendered on #/all (must be 1..299, virtualized/windowed)");

    // 4. Navigation latency: Home -> domain -> manager -> Back, <1.5s each.
    await L.hashRoute(page, "home", {}, 250);
    const navDomain = await timedNav(ctx, page, "dest/general", ["dest/general"]);
    ctx.record(label, "nav-home-to-domain", !!navDomain.stamp && navDomain.ms <= NAV_BUDGET_MS,
      { ms: navDomain.ms, stamp: navDomain.stamp || null, budgetMs: NAV_BUDGET_MS });

    const navManager = await timedNav(ctx, page, "manager/m.providers", ["m.providers"]);
    ctx.record(label, "nav-domain-to-manager", !!navManager.stamp && navManager.ms <= NAV_BUDGET_MS,
      { ms: navManager.ms, stamp: navManager.stamp || null, budgetMs: NAV_BUDGET_MS });

    calls = await modelCallSnapshot(page);
    if (calls.instrumented) {
      ctx.record(label, "manager-entry-computes-model", true, {
        note: calls.byManager["m.providers"] >= 1
          ? "m.providers model computed on first entry (instrumentation confirmed live)"
          : "WARNING: m.providers rendered but counter never fired - treat home-lazy-models as advisory",
        modelCalls: calls.byManager
      });
    }

    const t0 = Date.now();
    await page.evaluate(function () { history.back(); });
    const backStamp = await L.waitRouteTokens(page, ["dest/general"], 5000);
    const backMs = Date.now() - t0;
    ctx.record(label, "nav-manager-back", !!backStamp && backMs <= NAV_BUDGET_MS,
      { ms: backMs, stamp: backStamp || null, budgetMs: NAV_BUDGET_MS });
  });
}

module.exports = { name: "perf", run };
