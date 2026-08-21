/* suite-search.js — universal search exactness, through the PAGE UI.
 *
 * Per concept: find the search input ([data-pm2-search-input], then
 * input[type=search], then the topmost visible text input in the stage —
 * strategy recorded), type a fixed query battery, collect the rendered
 * [data-rid] results, then drive a routing subset by clicking elements BY
 * data-rid (never nth-child) and asserting the landing: data-pm2-route carries
 * the dest, the exact target owns .pm2-located, sits inside the viewport and
 * holds focus; history.back() must restore the query text AND the results.
 */
"use strict";

function distinct(arr) { return Array.from(new Set(arr)); }

function flatRids(results) { return results.map((r) => r.rid); }

function destTokens(dest, rid) {
  if (dest && dest.route) {
    switch (dest.route) {
      case "setting": return dest.settingId ? [dest.settingId] : ["setting"];
      case "manager": return dest.managerId ? [dest.managerId] : ["manager"];
      case "dest": return dest.cat ? ["dest", dest.cat] : ["dest"];
      case "all": return ["all"];
      case "copy": return ["copy"];
      case "home": return ["home"];
    }
  }
  const m = /^([smoawduh]):(.+)$/.exec(rid || "");
  if (!m) return [];
  if (m[1] === "o") return [m[2].split("/")[0]];
  if (m[1] === "s" || m[1] === "m") return [m[2]];
  return [];
}

async function uiQuery(ctx, page, q, opts) {
  const L = ctx.lib;
  const expectNone = opts && opts.expectNone;
  await L.hashRoute(page, "home", {}, 180);
  page.clearDiagnostics();
  // Re-resolve the input FRESH before every query (concepts may re-render it;
  // CONTRACT2 now requires [data-pm2-search-input], which the finder prefers).
  let input = await L.findSearchInput(page);
  if (!input.found) return { ok: false, why: "no search input found", results: [] };
  // Clear FIRST (real key events), let the dropdown react, then snapshot the
  // rendered result set. Typing the same query twice in a row now produces a
  // real change from the post-clear state instead of a false stale verdict; a
  // dropdown that keeps showing the previous query's results is caught below.
  let cleared = await L.clearSearchViaKeys(page);
  if (!cleared) {
    input = await L.findSearchInput(page);
    cleared = input.found && (await L.clearSearchViaKeys(page));
    if (!cleared) return { ok: false, why: "could not focus/clear the search input", results: [] };
  }
  await L.settle(page, 140);
  const prev = await L.collectRids(page);
  let typed = await L.typeCharsViaKeys(page, q);
  if (!typed.ok) {
    input = await L.findSearchInput(page);
    typed = input.found ? await L.typeQueryKeys(page, q) : { ok: false, method: null };
    if (!typed.ok) return { ok: false, why: "could not type into the search input", results: [] };
  }
  const outcome = await L.waitResultsChanged(page, prev.map((r) => r.rid), expectNone ? 2200 : 3500);
  if (!outcome) {
    if (prev.length) {
      return {
        ok: false, stale: true, results: prev,
        why: "stale-dropdown: rendered [data-rid] set never changed from the previous query",
        strategy: input.strategy || null, method: typed.method
      };
    }
    return { ok: true, results: [], strategy: input.strategy || null, method: typed.method };
  }
  return {
    ok: true, results: outcome.results, marker: outcome.marker || null,
    strategy: input.strategy || null, method: typed.method
  };
}

function summarize(results) {
  return { count: results.length, rids: flatRids(results).slice(0, 12) };
}

async function noResultsUi(ctx, page) {
  return page.evaluate(function () {
    var drawers = document.querySelectorAll(".pm2-drawer-panel, .pm2-drawer-btn, [data-pm2-drawer]");
    var prev = [];
    for (var i = 0; i < drawers.length; i++) { prev.push(drawers[i].style.display); drawers[i].style.display = "none"; }
    var t = (document.body.innerText || "").replace(/\s+/g, " ");
    for (var j = 0; j < drawers.length; j++) { drawers[j].style.display = prev[j]; }
    var m = /no (results?|matches?|settings?[^.]{0,30}(match|found))|nothing (found|matched|matches)|couldn.t find|didn.t (find|match)|can.t find|not find(ing)? anything|0 results/i.exec(t);
    return m ? m[0].slice(0, 80) : null;
  });
}

/* ---------------- battery ---------------- */

async function runBattery(ctx, page, label, stash) {
  const L = ctx.lib;

  const cases = [
    {
      q: "theme", name: "q-theme",
      judge(results) {
        const has = flatRids(results).includes("s:general.visual.theme");
        return { pass: results.length > 0 && has, note: has ? "s:general.visual.theme present" : "s:general.visual.theme missing" };
      }
    },
    {
      q: "rate limits", name: "q-rate-limits",
      judge(results) {
        const hits = results.filter((r) => /rate ?limit/i.test(r.text) || /rate-?limit/i.test(r.rid));
        const rids = distinct(hits.map((r) => r.rid));
        return { pass: results.length > 0 && rids.length >= 2, note: rids.length + " distinct rate-limit results (duplicate-label pages expected)" };
      }
    },
    {
      q: "api key", name: "q-api-key",
      judge(results) {
        const hits = results.filter((r) => /api ?key/i.test(r.text));
        const rids = distinct(hits.map((r) => r.rid));
        const texts = distinct(hits.map((r) => r.text));
        const pass = rids.length >= 3 && texts.length >= 3;
        return { pass, note: rids.length + " distinct api-key rids, " + texts.length + " distinct rendered texts (path must distinguish duplicates)" };
      }
    },
    {
      q: "notifcations", name: "q-typo-notifcations",
      judge(results) {
        const pass = results.some((r) => /notif/i.test(r.text) || /notif/i.test(r.rid));
        return { pass, note: pass ? "typo tolerated" : "no notification-ish result for the typo" };
      }
    },
    {
      q: "apperance", name: "q-typo-apperance",
      judge(results) {
        const pass = results.some((r) => /appear/i.test(r.text) || /appearance/i.test(r.rid));
        return { pass, note: pass ? "typo tolerated" : "no appearance-ish result for the typo" };
      }
    },
    {
      q: "flux capacitor", name: "q-no-results", expectNone: true,
      async judgeAsync(results) {
        if (results.length) return { pass: false, note: "expected zero results, got " + results.length };
        const phrase = await noResultsUi(ctx, page);
        return { pass: !!phrase, note: phrase ? "explicit no-results UI: " + JSON.stringify(phrase) : "no visible no-results message (dead dropdown)" };
      }
    },
    {
      q: "cursor cli", name: "q-workflow-cursor-cli",
      judge(results) {
        const pass = flatRids(results).includes("w:setup.cursor-cli");
        return { pass, note: pass ? "w:setup.cursor-cli present" : "w:setup.cursor-cli missing from rendered results" };
      }
    },
    {
      q: "import", name: "q-grouped-import",
      judge(results) {
        const kinds = distinct(flatRids(results).map((r) => (r || "").split(":")[0]).filter(Boolean));
        return { pass: kinds.length >= 2, note: "rid kinds rendered: " + kinds.join(",") };
      }
    }
  ];

  for (const c of cases) {
    const run = await uiQuery(ctx, page, c.q, { expectNone: c.expectNone });
    if (!run.ok) {
      ctx.record(label, c.name, false, run.stale ? {
        kind: "stale-dropdown", why: run.why,
        staleResults: summarize(run.results), method: run.method, strategy: run.strategy
      } : run.why);
      continue;
    }
    stash[c.q] = run.results;
    const verdict = c.judgeAsync ? await c.judgeAsync(run.results) : c.judge(run.results);
    const diag = ctx.lib.snapDiagnostics(page);
    const errs = diag.errors.concat(diag.pageErrors);
    ctx.record(label, c.name, verdict.pass && errs.length === 0, {
      note: verdict.note,
      typedVia: run.method,
      consoleErrors: errs.slice(0, 3),
      results: summarize(run.results)
    });
  }
  void L;
}

/* ---------------- routing subset ---------------- */

async function routeCase(ctx, page, label, name, query, rid, opts) {
  const L = ctx.lib;
  const relaxed = opts && opts.relaxed; // unavailable results may honestly refuse to navigate
  const run = await uiQuery(ctx, page, query);
  if (!run.ok) {
    ctx.record(label, name, false, run.stale ? {
      kind: "stale-dropdown", why: run.why, query,
      staleResults: summarize(run.results), method: run.method
    } : run.why);
    return;
  }
  if (!flatRids(run.results).includes(rid)) {
    ctx.record(label, name, false, { why: "target rid not rendered for query", query, rid, results: summarize(run.results) });
    return;
  }

  const resolved = await page.evaluate(function (rid) {
    try {
      var r = window.PM2 && PM2.search && PM2.search.resolveRid ? PM2.search.resolveRid(rid) : null;
      return r ? { dest: r.dest || null, availability: r.availability || null, label: r.label || null, path: r.path || null } : null;
    } catch (e) { return null; }
  }, rid);
  const tokens = destTokens(resolved && resolved.dest, rid);

  page.clearDiagnostics();
  const click = await L.clickRid(page, rid);
  if (!click.clicked) { ctx.record(label, name, false, { why: "could not click result", rid }); return; }

  if (relaxed) {
    const probe = { availability: resolved && resolved.availability };
    let state = await L.pollInPage(page, function (info) {
      var a = document.documentElement.getAttribute("data-pm2-route") || "";
      var loc = document.querySelector(".pm2-located");
      var t = (document.body.innerText || "").toLowerCase();
      var reasonShown = false;
      if (info && info.availability) {
        reasonShown = t.indexOf(String(info.availability).toLowerCase().slice(0, 40)) !== -1;
      }
      if (!reasonShown) {
        reasonShown = /unavailable|not available|isn.t available|requires|needs|cannot|can.t|no connected|no provider|not offered|doesn.t (offer|support)|unsupported/.test(t);
      }
      if (!loc && !reasonShown) return null;
      return { attr: a, located: !!loc, reasonShown: reasonShown };
    }, probe, 2500, 120);
    if (!state) {
      state = await page.evaluate(function () {
        return {
          attr: document.documentElement.getAttribute("data-pm2-route") || "",
          located: !!document.querySelector(".pm2-located"),
          reasonShown: false
        };
      });
    }
    const diag = L.snapDiagnostics(page);
    const errs = diag.errors.concat(diag.pageErrors);
    ctx.record(label, name, errs.length === 0 && (state.located || state.reasonShown), {
      rid, query, clickMethod: click.method,
      availability: resolved && resolved.availability,
      landing: state, consoleErrors: errs.slice(0, 3)
    });
    return; // no Back assertion for a result that may honestly not navigate
  }

  const landed = await L.pollInPage(page, function (tokens) {
    var a = document.documentElement.getAttribute("data-pm2-route") || "";
    for (var i = 0; i < tokens.length; i++) { if (a.indexOf(tokens[i]) === -1) return null; }
    return document.querySelector(".pm2-located") ? { attr: a } : null;
  }, tokens, 4500, 80);

  if (landed) {
    // the locator class lands before a smooth scroll settles; give the reveal
    // up to 2s to bring the row into the viewport before measuring
    await L.pollInPage(page, function () {
      var loc = document.querySelector(".pm2-located");
      if (!loc) return null;
      var r = loc.getBoundingClientRect();
      var vh = window.innerHeight, vw = window.innerWidth;
      return (r.top >= -2 && r.left >= -2 && r.right <= vw + 2 &&
        (r.bottom <= vh + 2 || (r.top < vh * 0.5 && r.height > vh * 0.6))) ? true : null;
    }, null, 2000, 100);
  }

  const detail = await page.evaluate(function () {
    var loc = document.querySelector(".pm2-located");
    if (!loc) {
      return {
        located: false,
        attr: document.documentElement.getAttribute("data-pm2-route") || ""
      };
    }
    var r = loc.getBoundingClientRect();
    var vh = window.innerHeight, vw = window.innerWidth;
    var inViewport = r.top >= -2 && r.left >= -2 && r.right <= vw + 2 &&
      (r.bottom <= vh + 2 || (r.top < vh * 0.5 && r.height > vh * 0.6));
    var active = document.activeElement;
    return {
      located: true,
      inViewport: inViewport,
      focusOk: !!active && (active === loc || loc.contains(active)),
      rect: { top: Math.round(r.top), bottom: Math.round(r.bottom), left: Math.round(r.left), right: Math.round(r.right) },
      hook: loc.getAttribute("data-setting-id") || loc.getAttribute("data-object-id") ||
        loc.getAttribute("data-manager") || loc.getAttribute("data-rid") || null,
      attr: document.documentElement.getAttribute("data-pm2-route") || ""
    };
  });
  const diag = L.snapDiagnostics(page);
  const errs = diag.errors.concat(diag.pageErrors);
  const pass = !!landed && detail.located && detail.inViewport && detail.focusOk && errs.length === 0;
  ctx.record(label, name, pass, {
    rid, query, expectTokens: tokens, clickMethod: click.method,
    dest: resolved && resolved.dest, landing: detail,
    routeStamp: landed ? landed.attr : (detail.attr || null),
    consoleErrors: errs.slice(0, 3)
  });

  // Back must restore the query AND its results.
  await page.evaluate(function () { history.back(); });
  const restored = await L.pollInPage(page, function (q) {
    var inputs = document.querySelectorAll("input, textarea");
    var hit = false;
    for (var i = 0; i < inputs.length; i++) {
      var el = inputs[i];
      var r = el.getBoundingClientRect();
      if (r.width < 30 || r.height < 8) continue;
      if ((el.value || "") === q) { hit = true; break; }
    }
    if (!hit) return null;
    var els = document.querySelectorAll("[data-rid]");
    for (var j = 0; j < els.length; j++) {
      var rr = els[j].getBoundingClientRect();
      if (rr.width > 2 && rr.height > 2) return true;
    }
    return null;
  }, query, 4500, 100);
  ctx.record(label, name + "-back-restores", !!restored,
    restored ? "query text + results restored after history.back()" :
      "history.back() did not restore the query and its results");
}

async function run(ctx) {
  const L = ctx.lib;
  await L.forEachConcept(ctx, 8 * 60 * 1000, async (page, concept, label) => {
    const ready = await L.bootConcept(page, concept, "home", {}, { width: 1280, height: 900 });
    if (!ready) { ctx.record(label, "boot", false, "data-pm-state=ready never appeared"); return; }
    ctx.record(label, "boot", true, "ready");

    const input = await L.findSearchInput(page);
    ctx.record(label, "search-input", input.found, input.found ? { strategy: input.strategy } : "no search input discoverable on Home");
    if (!input.found) return;

    const stash = {};
    await runBattery(ctx, page, label, stash);

    // --- routing subset, all by data-rid ---
    await routeCase(ctx, page, label, "route-setting-theme", "theme", "s:general.visual.theme");

    const apiKeyRids = distinct((stash["api key"] || []).filter((r) => /api ?key/i.test(r.text)).map((r) => r.rid));
    if (apiKeyRids.length >= 2) {
      await routeCase(ctx, page, label, "route-duplicate-api-key", "api key", apiKeyRids[1]);
    } else {
      ctx.record(label, "route-duplicate-api-key", false, "fewer than 2 distinct api-key rids rendered: " + JSON.stringify(apiKeyRids));
    }

    const objectRid = flatRids(stash["rate limits"] || []).find((r) => /^o:/.test(r));
    if (objectRid) {
      await routeCase(ctx, page, label, "route-object-rate-limits", "rate limits", objectRid);
    } else {
      ctx.record(label, "route-object-rate-limits", false, "no o:<manager>/<object> rid among 'rate limits' results");
    }

    const mgrProbe = await uiQuery(ctx, page, "providers");
    const mgrRid = mgrProbe.ok ? flatRids(mgrProbe.results).find((r) => /^m:/.test(r) && /providers/i.test(r)) : null;
    if (mgrRid) {
      await routeCase(ctx, page, label, "route-manager-providers", "providers", mgrRid);
    } else {
      ctx.record(label, "route-manager-providers", false, "no m:…providers rid among 'providers' results");
    }

    const deferred = await page.evaluate(function () {
      try {
        var defs = PM2.managers.deferred ? PM2.managers.deferred() : [];
        for (var i = 0; i < defs.length; i++) {
          var d = defs[i];
          var res = PM2.search.query(d.title, { limit: 30 });
          var want = "m:" + d.id;
          var groups = res.groups || [];
          for (var g = 0; g < groups.length; g++) {
            var rs = groups[g].results || [];
            for (var r = 0; r < rs.length; r++) {
              if (rs[r].rid === want) return { query: d.title, rid: want };
            }
          }
        }
      } catch (e) { /* fall through */ }
      return null;
    });
    if (deferred) {
      await routeCase(ctx, page, label, "route-deferred-manager", deferred.query, deferred.rid);
    } else {
      ctx.record(label, "route-deferred-manager", false, "no deferred manager reachable through PM2.search (index gap)");
    }

    const unavailable = await page.evaluate(function () {
      var qs = ["remote", "sync", "server", "hosting", "updates", "deploy", "claim", "video", "unavailable"];
      try {
        for (var i = 0; i < qs.length; i++) {
          var res = PM2.search.query(qs[i], { limit: 40 });
          var groups = res.groups || [];
          for (var g = 0; g < groups.length; g++) {
            var rs = groups[g].results || [];
            for (var r = 0; r < rs.length; r++) {
              if (/^u:/.test(rs[r].rid)) return { query: qs[i], rid: rs[r].rid };
            }
          }
        }
      } catch (e) { /* fall through */ }
      return null;
    });
    if (unavailable) {
      const shown = await uiQuery(ctx, page, unavailable.query);
      if (shown.ok && flatRids(shown.results).includes(unavailable.rid)) {
        await routeCase(ctx, page, label, "route-unavailable", unavailable.query, unavailable.rid, { relaxed: true });
      } else {
        ctx.record(label, "route-unavailable", false, {
          why: "u: rid exists in PM2.search but the concept UI never rendered it",
          probe: unavailable, rendered: shown.ok ? summarize(shown.results) : shown.why
        });
      }
    } else {
      ctx.record(label, "route-unavailable", false, "no u:<capability> results discoverable in PM2.search corpus");
    }
  });
}

module.exports = { name: "search", run };
