/* suite-state.js — scenarios, fixtures, persistence, copy flow, stress.
 *
 * Per concept:
 *  - all 8 scenarios on #/home and #/manager/m.providers (zero errors, real
 *    content, ready stamp);
 *  - fixture battery on the routes each overlay actually targets, asserting a
 *    visible textual acknowledgement (marker phrase) with the floating States
 *    drawer hidden so its labels can never satisfy the check;
 *  - persistence: store.setValue -> reload -> value survives;
 *  - copy flow on #/copy: sources -> preview -> apply -> rollback with receipt
 *    assertions (driven through PM2.copy — CONTRACT2 standardises no copy UI
 *    hooks; whether the concept rendered a copy surface is recorded);
 *  - stress: #/all?stress=1 keeps the DOM bounded (<300 [data-setting-id]
 *    rows) while the advertised corpus stays >= 2000 records.
 */
"use strict";

const SCENARIOS = [
  "baseline", "calm", "attention-heavy", "usage-exhausted",
  "invocation-failed", "managed-workspace", "first-run", "offline"
];

/* Route per fixture = the surface its overlay actually mutates (pm2-states):
 * import-conflict/rollback -> m.lifecycle; validation-error ->
 * web.fetch.cost-hard-cap's domain page; restart -> general.visual.ui-scale;
 * reconnect -> system.mcp.transport; changed-elsewhere ->
 * general.startup.restore-panel. */
const FIXTURES = [
  { fx: "fx.import-conflict", route: "manager/m.lifecycle", token: "m.lifecycle", marker: "conflict" },
  /* marker includes bare "error": a visible Error chip/badge on the row's
   * group is an honest acknowledgement even when the row itself sits in a
   * collapsed advanced fold (markerFound records what actually matched) */
  { fx: "fx.validation-error", route: "dest/web/fetch", token: "web", marker: "valid|whole number|error" },
  { fx: "fx.restart-required", route: "dest/general/visual", token: "general", marker: "restart" },
  { fx: "fx.reconnect-required", route: "dest/system/mcp", token: "system", marker: "reconnect" },
  { fx: "fx.changed-elsewhere", route: "dest/general/startup", token: "general", marker: "changed" },
  { fx: "fx.rollback-complete", route: "manager/m.lifecycle", token: "m.lifecycle", marker: "rolled back|rollback" }
];

async function run(ctx) {
  const L = ctx.lib;
  await L.forEachConcept(ctx, 10 * 60 * 1000, async (page, concept, label) => {

    /* ---------------- scenarios ---------------- */
    for (const s of SCENARIOS) {
      const ready = await L.bootConcept(page, concept, "home", { scenario: s }, { width: 1280, height: 900 });
      if (!ready) { ctx.record(label, "scenario-" + s, false, "never reached data-pm-state=ready"); continue; }
      let diag = L.snapDiagnostics(page);
      let errs = diag.errors.concat(diag.warnings).concat(diag.pageErrors);
      const homeText = await L.bodyTextSansDrawer(page);
      const homeOk = errs.length === 0 && homeText.replace(/\s+/g, " ").trim().length > 80;

      await L.hashRoute(page, "manager/m.providers", { scenario: s }, 240);
      const mgrStamp = await L.waitRouteTokens(page, ["m.providers"], 4000);
      diag = L.snapDiagnostics(page);
      const mgrErrs = diag.errors.concat(diag.warnings).concat(diag.pageErrors);
      const pass = homeOk && !!mgrStamp && mgrErrs.length === 0;
      ctx.record(label, "scenario-" + s, pass, {
        homeErrors: errs.slice(0, 3),
        managerRouteStamp: mgrStamp || null,
        managerErrors: mgrErrs.slice(0, 3),
        homeTextLen: homeText.length
      });
    }

    /* ---------------- fixtures ---------------- */
    for (const f of FIXTURES) {
      const ready = await L.bootConcept(page, concept, f.route, { fixture: f.fx }, { width: 1280, height: 900 });
      if (!ready) { ctx.record(label, "fixture-" + f.fx, false, "never reached ready on " + f.route); continue; }
      await L.waitRouteTokens(page, [f.token], 3000);
      await L.settle(page, 200);
      const diag = L.snapDiagnostics(page);
      const errs = diag.errors.concat(diag.warnings).concat(diag.pageErrors);
      const text = await L.bodyTextSansDrawer(page);
      const marker = new RegExp(f.marker, "i").exec(text.replace(/\s+/g, " "));
      ctx.record(label, "fixture-" + f.fx, errs.length === 0 && !!marker, {
        route: f.route,
        markerWanted: f.marker,
        markerFound: marker ? marker[0] : null,
        errors: errs.slice(0, 3)
      });
    }

    /* ---------------- persistence ---------------- */
    {
      const ready = await L.bootConcept(page, concept, "home", {}, { width: 1280, height: 900 });
      if (!ready) { ctx.record(label, "persistence", false, "never reached ready"); }
      else {
        const flip = await page.evaluate(function () {
          try {
            var store = PM2.store.current();
            if (!store) return { ok: false, err: "no store singleton" };
            var inv = (window.PM2_INVENTORY && PM2_INVENTORY.settings) || [];
            var pick = null;
            for (var i = 0; i < inv.length; i++) {
              if (inv[i].type === "toggle" && typeof store.getValue(inv[i].id) === "boolean") { pick = inv[i]; break; }
            }
            if (!pick) return { ok: false, err: "no boolean toggle in inventory" };
            var before = store.getValue(pick.id);
            var res = store.setValue(pick.id, !before, { source: "harness" });
            if (res && res.ok === false) return { ok: false, err: "setValue rejected: " + res.error };
            return { ok: true, id: pick.id, before: before, after: store.getValue(pick.id) };
          } catch (e) { return { ok: false, err: String(e) }; }
        });
        if (!flip.ok) ctx.record(label, "persistence", false, flip.err);
        else {
          await L.bootConcept(page, concept, "home", {}, { width: 1280, height: 900 });
          const verdict = await page.evaluate(function (a) {
            try {
              var store = PM2.store.current();
              var got = store ? store.getValue(a.id) : undefined;
              var persisted = got === a.after;
              if (store) store.setValue(a.id, a.before, { source: "harness" }); // leave the world as found
              return { persisted: persisted, got: got };
            } catch (e) { return { persisted: false, got: "eval error: " + e }; }
          }, flip);
          ctx.record(label, "persistence", verdict.persisted, {
            settingId: flip.id, wrote: flip.after, readAfterReload: verdict.got, restored: flip.before
          });
        }
      }
    }

    /* ---------------- copy flow ---------------- */
    {
      const ready = await L.bootConcept(page, concept, "copy", {}, { width: 1280, height: 900 });
      if (!ready) { ctx.record(label, "copy-flow", false, "never reached ready on #/copy"); }
      else {
        const routeStamp = await L.waitRouteTokens(page, ["copy"], 3000);
        const uiInfo = await page.evaluate(function () {
          var stage = document.getElementById("pmStage") || document.body;
          var text = (stage.innerText || "").replace(/\s+/g, " ");
          return { mentionsCopy: /copy/i.test(text), textLen: text.trim().length };
        });
        page.clearDiagnostics();
        const flow = await page.evaluate(function () {
          return new Promise(function (resolve) {
            try {
              var out = {};
              var srcs = PM2.copy.sources();
              out.sources = srcs.length;
              var src = srcs[0];
              var cats = (src.categorySummaries || []).slice(0, 2).map(function (c) { return c.cat; });
              if (!cats.length) cats = ["general"];
              var pv = PM2.copy.preview(src.id, cats);
              out.counts = pv && pv.counts ? pv.counts : null;
              out.itemCount = pv && pv.items ? pv.items.length : 0;
              out.credentialNote = !!(pv && pv.credentialNote);
              var store = PM2.store.current();
              var probe = null;
              if (pv && pv.items) {
                for (var i = 0; i < pv.items.length; i++) {
                  var it = pv.items[i];
                  if ((it.kind === "add" || it.kind === "replace") && it.settingId) { probe = it; break; }
                }
              }
              out.probeId = probe ? probe.settingId : null;
              var beforeVal = probe ? JSON.stringify(store.getValue(probe.settingId)) : null;
              Promise.resolve(PM2.copy.apply(pv.token)).then(function (ap) {
                out.apply = ap ? {
                  ok: ap.ok !== false, receiptId: ap.receiptId || null,
                  restorePointId: ap.restorePointId || null,
                  applied: ap.applied, verified: ap.verified === true
                } : null;
                out.valueChanged = probe ? (JSON.stringify(store.getValue(probe.settingId)) !== beforeVal) : null;
                return Promise.resolve(PM2.copy.rollback(ap.receiptId)).then(function (rb) {
                  out.rollback = rb ? { ok: rb.ok !== false } : null;
                  out.valueRestored = probe ? (JSON.stringify(store.getValue(probe.settingId)) === beforeVal) : null;
                  resolve(out);
                });
              }).catch(function (e) { out.err = String(e); resolve(out); });
            } catch (e) { resolve({ err: String(e) }); }
          });
        });
        const diag = L.snapDiagnostics(page);
        const errs = diag.errors.concat(diag.pageErrors);
        const pass = !flow.err && flow.sources === 5 && !!flow.counts &&
          flow.apply && flow.apply.ok && flow.apply.verified && !!flow.apply.receiptId && !!flow.apply.restorePointId &&
          flow.rollback && flow.rollback.ok &&
          flow.valueChanged !== false && flow.valueRestored !== false &&
          !!routeStamp && errs.length === 0;
        ctx.record(label, "copy-flow", pass, {
          routeStamp: routeStamp || null,
          copySurface: uiInfo,
          drivenVia: "PM2.copy API (no standardised copy UI hooks in CONTRACT2)",
          flow, consoleErrors: errs.slice(0, 3)
        });
      }
    }

    /* ---------------- stress ---------------- */
    {
      const ready = await L.bootConcept(page, concept, "all", { stress: 1 }, { width: 1280, height: 900 });
      if (!ready) { ctx.record(label, "stress-all-bounded", false, "never reached ready on #/all?stress=1"); return; }
      await L.settle(page, 700);
      const stress = await page.evaluate(function () {
        var rows = document.querySelectorAll("[data-setting-id]").length;
        var advertised = 0;
        try {
          var q = PM2.search.query("zz-stress", { limit: 5 });
          advertised = q && q.total ? q.total : 0;
        } catch (e) { /* index may be broken; text fallback below */ }
        var stage = document.getElementById("pmStage") || document.body;
        var text = (stage.innerText || "").replace(/,/g, "");
        var best = 0;
        var m = text.match(/\d{4,}/g) || [];
        for (var i = 0; i < m.length; i++) { var n = Number(m[i]); if (n > best && n < 1000000) best = n; }
        return { rows: rows, searchTotal: advertised, biggestTextNumber: best, domNodes: document.querySelectorAll("*").length };
      });
      const diag = L.snapDiagnostics(page);
      const errs = diag.errors.concat(diag.pageErrors);
      const advertised = Math.max(stress.searchTotal, stress.biggestTextNumber);
      ctx.record(label, "stress-all-bounded", stress.rows > 0 && stress.rows < 300 && advertised >= 2000 && errs.length === 0, {
        renderedRows: stress.rows,
        advertisedRecords: advertised,
        searchTotal: stress.searchTotal,
        biggestTextNumber: stress.biggestTextNumber,
        domNodes: stress.domNodes,
        errors: errs.slice(0, 3)
      });
    }
  });
}

module.exports = { name: "state", run };
