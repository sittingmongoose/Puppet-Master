/* suite-managers.js — manager route isolation.
 *
 * Per concept: enumerate PM2.managers.all() (47 defs: 38 demonstrated + 9
 * deferred owner shells) in-page and visit #/manager/<id>?instant=1 for every
 * def. Each route must stamp data-pm2-route with the id, render a real
 * manager surface ([data-manager-surface] or non-trivial content naming the
 * def title), keep the pm-shell titlebar, offer a Back affordance
 * ([data-pm2-back] or an accessible name starting with "Back"), breadcrumb
 * back to Settings, contain NO link to another concept page, no iframes, and
 * log zero console errors. Deferred shells must show the named owner and no
 * buttons pretending to run backend work. Every row is recorded for the
 * manager-route-matrix evidence.
 */
"use strict";

async function run(ctx) {
  const L = ctx.lib;
  await L.forEachConcept(ctx, 12 * 60 * 1000, async (page, concept, label) => {
    const ready = await L.bootConcept(page, concept, "home", {}, { width: 1280, height: 900 });
    if (!ready) { ctx.record(label, "boot", false, "data-pm-state=ready never appeared"); return; }
    ctx.record(label, "boot", true, "ready");

    const defs = await page.evaluate(function () {
      try {
        return PM2.managers.all().map(function (d) {
          var owner = null;
          if (d.owner) {
            owner = typeof d.owner === "string" ? d.owner
              : (d.owner.name || d.owner.owner || d.owner.team || JSON.stringify(d.owner).slice(0, 80));
          }
          return { id: d.id, title: d.title || "", cat: d.cat || "", family: d.family || "", status: d.status || "", owner: owner };
        });
      } catch (e) { return { err: String(e) }; }
    });
    if (!Array.isArray(defs)) {
      ctx.record(label, "enumerate-managers", false, "PM2.managers.all() unusable: " + JSON.stringify(defs));
      return;
    }
    ctx.record(label, "enumerate-managers", defs.length === 47,
      defs.length + " defs (expected 47: 38 demonstrated + 9 deferred)");

    for (const def of defs) {
      page.clearDiagnostics();
      await L.hashRoute(page, "manager/" + def.id, {}, 200);
      const routeStamp = await L.waitRouteTokens(page, [def.id], 4000);

      const checks = await page.evaluate(function (a) {
        function vis(el) {
          if (!el) return false;
          var r = el.getBoundingClientRect();
          var cs = getComputedStyle(el);
          return r.width > 30 && r.height > 8 && cs.visibility !== "hidden" && cs.display !== "none";
        }
        var stage = document.getElementById("pmStage") || document.querySelector(".pm-stage") || document.body;
        var stageText = (stage.innerText || "").replace(/\s+/g, " ").trim();
        var surfaceEl = document.querySelector("[data-manager-surface]");
        var titleMention = a.title ? stageText.toLowerCase().indexOf(a.title.toLowerCase()) !== -1 : false;

        var back = !!document.querySelector("[data-pm2-back]");
        var backName = back ? "[data-pm2-back]" : null;
        if (!back) {
          var btns = document.querySelectorAll("button, a, [role='button']");
          for (var i = 0; i < btns.length && !back; i++) {
            if (!vis(btns[i])) continue;
            /* any accessible-name source counts (aria-label, visible text,
             * title); leading arrow glyphs / punctuation are decoration */
            var sources = [
              ["aria-label", btns[i].getAttribute("aria-label")],
              ["text", btns[i].innerText],
              ["title", btns[i].getAttribute("title")]
            ];
            for (var s = 0; s < sources.length; s++) {
              var name = String(sources[s][1] || "").replace(/^[^a-zA-Z]+/, "").trim();
              if (/^back\b/i.test(name)) {
                back = true;
                backName = name.slice(0, 60) + " (" + sources[s][0] + ")";
                break;
              }
            }
          }
        }

        var crossLinks = [];
        var links = document.querySelectorAll("a[href]");
        for (var j = 0; j < links.length; j++) {
          var h = links[j].getAttribute("href") || "";
          if (/(^|\/)(concept-\d\d[^\s"']*|c[1-4]-[a-z-]+\.(html|js|css))/i.test(h) && h.indexOf(a.selfStem) === -1) {
            crossLinks.push(h.slice(0, 120));
          }
        }

        var actionButtons = [];
        if (a.deferred) {
          var bs = stage.querySelectorAll("button");
          var titleLower = String(a.title || "").toLowerCase().replace(/\s+/g, " ");
          for (var k = 0; k < bs.length; k++) {
            if (!vis(bs[k])) continue;
            var t = (bs[k].innerText || "").replace(/^[^a-zA-Z]+/, "").replace(/\s+/g, " ").trim();
            if (!t) continue;
            var tLower = t.toLowerCase();
            /* navigation entries named after the manager are not actions */
            if (titleLower && (tLower === titleLower || titleLower.indexOf(tLower) !== -1 || tLower.indexOf(titleLower) !== -1)) continue;
            /* imperative claims of backend work only */
            if (/^(deploy|install|sync|claim|provision|migrate|restore|run|start|launch|update|upgrade|back ?up)\b/i.test(t) &&
                !/owner|learn|read|docs|about|open|view|details|back to|plan/i.test(t)) {
              actionButtons.push(t.slice(0, 60));
            }
          }
        }

        return {
          surface: !!surfaceEl,
          titleMention: titleMention,
          stageTextLen: stageText.length,
          titlebar: vis(document.querySelector(".pm-titlebar")),
          back: back,
          backName: backName,
          breadcrumbSettings: stageText.indexOf("Settings") !== -1,
          crossLinks: crossLinks,
          iframes: document.querySelectorAll("iframe").length,
          ownerShown: a.owner ? stageText.toLowerCase().indexOf(String(a.owner).toLowerCase()) !== -1 : null,
          actionButtons: actionButtons
        };
      }, {
        title: def.title,
        owner: def.owner,
        deferred: def.status === "deferred_named_owner",
        selfStem: concept.stem
      });

      const diag = L.snapDiagnostics(page);
      const errs = diag.errors.concat(diag.pageErrors);

      const problems = [];
      if (!routeStamp) problems.push("data-pm2-route never contained " + def.id);
      if (!checks.surface && !(checks.titleMention && checks.stageTextLen > 80)) {
        problems.push("no [data-manager-surface] and no non-trivial content naming " + JSON.stringify(def.title));
      }
      if (!checks.titlebar) problems.push("pm-shell titlebar lost");
      if (!checks.back) problems.push("no Back affordance ([data-pm2-back] or accessible name starting 'Back')");
      if (!checks.breadcrumbSettings) problems.push("breadcrumb/stage never mentions Settings");
      if (checks.crossLinks.length) problems.push("links to other concept pages: " + checks.crossLinks.join(", "));
      if (checks.iframes) problems.push(checks.iframes + " iframe(s) present");
      if (errs.length) problems.push("console errors: " + errs.slice(0, 2).join(" | "));
      if (def.status === "deferred_named_owner") {
        if (checks.ownerShown === false) problems.push("deferred shell does not show owner " + JSON.stringify(def.owner));
        if (checks.actionButtons.length) problems.push("deferred shell offers backend-work buttons: " + checks.actionButtons.join(", "));
      }

      ctx.record(label, "manager:" + def.id, problems.length === 0, {
        managerId: def.id,
        family: def.family,
        cat: def.cat,
        status: def.status,
        route: "manager/" + def.id,
        routeStamp: routeStamp || null,
        shellRetained: checks.titlebar,
        backAffordance: checks.backName,
        surfaceHook: checks.surface,
        owner: def.owner,
        problems
      });
    }
  });
}

module.exports = { name: "managers", run };
