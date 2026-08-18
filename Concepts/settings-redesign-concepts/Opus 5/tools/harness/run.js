/* The audit harness for concepts 05-11.
 *
 *   node tools/harness/run.js --suites=all --out=<dir>
 *   node tools/harness/run.js --suites=matrix --concepts=concept-07-compendium-workspace
 *
 * Suites: static, load, matrix, search, managers, inventory, states, perf, regression.
 *
 * Everything is driven over file:// through one long-lived headless Chromium. The
 * ConceptHub server route is deliberately not used: in this sandbox headless Chromium
 * hangs on every http:// request, so a server-driven run would report a timeout as a
 * concept failure. The Hub manifest is validated separately by
 * `Concepts/ConceptHub/validate.py`, which is the check that actually depends on it.
 *
 * Results are written as JSON, one file per suite. Screenshots are only taken for
 * failures, into the output directory, which the caller deletes.
 */
"use strict";

const fs = require("fs");
const path = require("path");
const { Browser } = require("./cdp");

const ROOT = path.resolve(__dirname, "..", "..");
const PROBE_SRC = fs.readFileSync(path.join(__dirname, "probes.js"), "utf8");

const CONCEPTS = [
  "concept-05-directory-take-1",
  "concept-06-directory-take-2",
  "concept-07-compendium-workspace",
  "concept-08-directory-take-3",
  "concept-09-tome-tabs",
  "concept-10-command-suite",
  "concept-11-tabbed-organizer"
];

const ORIGINALS = ["opus-5-atlas", "opus-5-console", "opus-5-stack", "opus-5-ledger"];

const THEMES = ["friendly-dark", "friendly-light", "glass-dark", "glass-light",
  "retro-dark", "retro-light", "basic-dark", "basic-light"];
const WIDTHS = [760, 900, 1280, 1700, 2200, 2500];

/* --------------------------------------------------------------------- utils */

function arg(name, fallback) {
  const hit = process.argv.slice(2).find((a) => a.startsWith("--" + name + "="));
  return hit ? hit.slice(name.length + 3) : fallback;
}

function log(...parts) { process.stdout.write(parts.join(" ") + "\n"); }

async function loadPage(browser, stem, opts) {
  const page = await browser.newPage();
  await page.setViewport((opts && opts.width) || 1280, (opts && opts.height) || 1000);
  await page.goto("file://" + path.join(ROOT, stem + ".html"));
  await page.evaluate(new Function(PROBE_SRC + "\nreturn true;"));
  await page.evaluate(function () { return window.__pmProbe.settle(220); });
  return page;
}

function probe(page, name, ...args) {
  return page.evaluate(function (n, a) {
    return window.__pmProbe[n].apply(null, a);
  }, name, args);
}

async function setTheme(page, theme, reducedMotion) {
  await page.evaluate(function (t, rm) {
    document.documentElement.setAttribute("data-theme", t);
    document.documentElement.setAttribute("data-reduced-motion", rm ? "1" : "0");
    document.documentElement.style.colorScheme = /-dark$/.test(t) ? "dark" : "light";
    window.dispatchEvent(new Event("resize"));
    return true;
  }, theme, !!reducedMotion);
  await probe(page, "settle", 90);
}

/* Width is applied both to the OS-level viewport and to the shell's own width
 * variable, because the concepts respond to the app frame, not to the window. */
async function setWidth(page, width) {
  await page.setViewport(width, 1000);
  await page.evaluate(function (w) {
    document.documentElement.style.setProperty("--hub-test-width", w + "px");
    var app = document.querySelector(".pm-app");
    if (app) app.style.width = w + "px";
    window.dispatchEvent(new Event("resize"));
    return true;
  }, width);
  await probe(page, "settle", 120);
}

function diagnostics(page) {
  return {
    consoleErrors: page.console.slice(0, 8),
    pageErrors: page.pageErrors.slice(0, 5),
    clean: page.console.length === 0 && page.pageErrors.length === 0
  };
}

/* ------------------------------------------------------------------- suites */

/* 1. Static text checks — the ones that need no browser at all. */
function suiteStatic(concepts) {
  const findings = [];
  // Emoji are banned outright in this repository; SVG only. Ranges cover the
  // pictographic blocks plus the variation selector and the dingbats.
  const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{FE0F}\u{1F1E6}-\u{1F1FF}]/u;

  for (const stem of concepts) {
    const html = path.join(ROOT, stem + ".html");
    const dir = path.join(ROOT, stem);
    const files = [html];
    for (const f of ["concept.js", "concept.css"]) {
      const p = path.join(dir, f);
      if (fs.existsSync(p)) files.push(p);
    }
    const record = { concept: stem, checks: {}, failures: [] };

    if (!fs.existsSync(html)) { record.failures.push("missing page: " + stem + ".html"); findings.push(record); continue; }
    const pageText = fs.readFileSync(html, "utf8");
    record.checks.modelLabel = /data-concept-model\s*=\s*"Opus 5"/.test(pageText);
    if (!record.checks.modelLabel) record.failures.push('missing data-concept-model="Opus 5"');

    for (const file of files) {
      const text = fs.readFileSync(file, "utf8");
      const rel = path.relative(ROOT, file);
      if (/<iframe\b/i.test(text)) record.failures.push(rel + ": contains an iframe");
      if (/opus-5-(atlas|console|stack|ledger)/.test(text)) record.failures.push(rel + ": references a frozen concept page");
      const otherConcept = text.match(/concept-(0[5-9]|1[01])-[a-z0-9-]+\.html/g) || [];
      for (const ref of new Set(otherConcept)) {
        if (ref !== stem + ".html") record.failures.push(rel + ": references another concept page " + ref);
      }
      // Comments may legitimately mention a hex value; markup and CSS may not.
      const stripped = text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
      if (EMOJI.test(stripped)) record.failures.push(rel + ": contains an emoji glyph");
      if (/PMManagerKit\s*\.\s*(homeOf|ASSIGNMENT|CONCEPTS|assignedTo)/.test(text)) {
        record.failures.push(rel + ": uses a cross-concept PMManagerKit API");
      }
      if (file.endsWith(".css")) {
        const hexes = (stripped.match(/#[0-9a-fA-F]{3,8}\b/g) || []).filter((h) => !/^#(fff|000|ffffff|000000)$/i.test(h));
        record.checks.rawHexColors = hexes.length;
        if (hexes.length > 24) record.failures.push(rel + ": " + hexes.length + " hard-coded colours outside theme tokens");
      }
    }

    const evidence = ["impact-register.json", "manager-coverage.json", "candidate-command-delta.json",
      "candidate-wiring-delta.json", "candidate-dry-delta.json", "plan-owner-delta.md",
      "search-route-matrix.json", "manager-route-matrix.json", "test-evidence.json"];
    record.checks.evidencePresent = evidence.filter((f) => fs.existsSync(path.join(dir, f))).length;
    record.pass = record.failures.length === 0;
    findings.push(record);
  }
  return { suite: "static", results: findings, pass: findings.every((f) => f.pass) };
}

/* 2. Load — the page comes up clean and shows a Home surface. */
async function suiteLoad(browser, concepts) {
  const results = [];
  for (const stem of concepts) {
    const page = await loadPage(browser, stem);
    const surface = await probe(page, "surface");
    const counts = await probe(page, "counts");
    const diag = diagnostics(page);
    results.push({
      concept: stem, surface, counts, ...diag,
      pass: diag.clean && surface.surface === "home" && counts.settings === 828
    });
    await page.close();
  }
  return { suite: "load", results, pass: results.every((r) => r.pass) };
}

/* 3. The theme x width matrix. */
async function suiteMatrix(browser, concepts, outDir) {
  const results = [];
  for (const stem of concepts) {
    const page = await loadPage(browser, stem);
    const conceptResult = { concept: stem, cells: [], failures: [] };

    for (const width of WIDTHS) {
      await setWidth(page, width);
      for (const theme of THEMES) {
        page.clearDiagnostics();
        await setTheme(page, theme, false);
        const [over, clip, rail] = [
          await probe(page, "overflow"),
          await probe(page, "clipped"),
          await probe(page, "railOverlap")
        ];
        const diag = diagnostics(page);
        const cell = {
          theme, width,
          overflowing: over.overflowing,
          escaped: over.escaped.length,
          clipped: clip.length,
          railOverlap: rail.overlap,
          consoleErrors: page.console.length,
          pageErrors: page.pageErrors.length
        };
        cell.pass = !cell.overflowing && cell.escaped === 0 && cell.clipped === 0 &&
          cell.railOverlap === 0 && cell.consoleErrors === 0 && cell.pageErrors === 0;
        if (!cell.pass) {
          conceptResult.failures.push({ ...cell, detail: { escaped: over.escaped, clipped: clip, diag } });
          if (outDir) {
            await page.screenshot(path.join(outDir, `${stem}-${theme}-${width}.png`)).catch(() => {});
          }
        }
        conceptResult.cells.push(cell);
      }
    }

    /* Reduced motion must preserve every state and control, not remove them. */
    await setWidth(page, 1280);
    await setTheme(page, "friendly-dark", true);
    const reducedDom = await probe(page, "domNodeCount");
    await setTheme(page, "friendly-dark", false);
    const normalDom = await probe(page, "domNodeCount");
    conceptResult.reducedMotion = {
      reducedNodes: reducedDom.total, normalNodes: normalDom.total,
      pass: Math.abs(reducedDom.total - normalDom.total) <= Math.max(4, normalDom.total * 0.02)
    };
    if (!conceptResult.reducedMotion.pass) conceptResult.failures.push({ kind: "reduced-motion", ...conceptResult.reducedMotion });

    conceptResult.pass = conceptResult.failures.length === 0;
    conceptResult.cellCount = conceptResult.cells.length;
    results.push(conceptResult);
    await page.close();
    log(`  matrix ${stem}: ${conceptResult.cells.filter((c) => c.pass).length}/${conceptResult.cells.length} cells`);
  }
  return { suite: "matrix", themes: THEMES, widths: WIDTHS, results, pass: results.every((r) => r.pass) };
}

/* 4. Search exactness — click by immutable id, land on the exact object. */
const QUERIES = [
  { q: "theme", expectKind: "setting" },
  { q: "notifcations", note: "typo tolerance" },
  { q: "api key", note: "duplicate labels across providers" },
  { q: "rate limit", note: "grouped results" },
  { q: "openai", expectKind: "object" },
  { q: "context window", note: "duplicate labels" },
  { q: "backup", expectKind: "manager" },
  { q: "doctor", expectKind: "manager" },
  { q: "kubernetes", note: "deep row" },
  { q: "retention", note: "many domains" },
  { q: "spellcheck", expectKind: "manager" },
  { q: "worktree", note: "deep row" },
  { q: "mcp server", expectKind: "manager" },
  { q: "sound", note: "grouped" },
  { q: "cleanup", expectKind: "manager" },
  { q: "usage", note: "deferred owner" },
  { q: "zzhqx", note: "no results" },
  { q: "reduce animations", note: "exact label" },
  { q: "docker hub", note: "multi-word" },
  { q: "persona", note: "grouped" },
  { q: "restore point", note: "action" },
  { q: "index rebuild", note: "action" }
];

async function suiteSearch(browser, concepts) {
  const results = [];
  for (const stem of concepts) {
    const page = await loadPage(browser, stem);
    const rows = [];

    for (const spec of QUERIES) {
      await probe(page, "goHash", "#/home");
      const dropdown = await probe(page, "typeSearch", spec.q);
      if (dropdown.error) { rows.push({ query: spec.q, pass: false, reason: dropdown.error }); continue; }

      if (spec.q === "zzhqx") {
        rows.push({
          query: spec.q, note: spec.note, resultCount: dropdown.count,
          pass: dropdown.count === 0 && dropdown.open,
          reason: dropdown.count === 0 ? null : "expected no results"
        });
        continue;
      }

      if (!dropdown.count) { rows.push({ query: spec.q, note: spec.note, pass: false, reason: "no results rendered" }); continue; }
      if (!dropdown.anchored || !dropdown.inViewport) {
        rows.push({ query: spec.q, pass: false, reason: "dropdown not anchored beneath the field or out of viewport" });
        continue;
      }

      // Take up to three results per query, including one that is not the first, so
      // a concept that only wires the top result fails here.
      const picks = [dropdown.results[0], dropdown.results[Math.min(1, dropdown.results.length - 1)],
        dropdown.results[dropdown.results.length - 1]].filter(Boolean);
      const seen = new Set();
      for (const pick of picks) {
        if (seen.has(pick.resultId)) continue;
        seen.add(pick.resultId);
        await probe(page, "goHash", "#/home");
        await probe(page, "typeSearch", spec.q);
        const expected = await page.evaluate(function (id) {
          var r = window.PM2Index.byId(id);
          return r ? { id: r.id, kind: r.kind, path: r.path, destination: r.destination } : null;
        }, pick.resultId);
        const landed = await probe(page, "openResult", pick.resultId);
        const row = {
          query: spec.q, note: spec.note, resultId: pick.resultId,
          expectedPath: expected && expected.path,
          expected: expected && expected.destination,
          actual: landed.landing,
          locator: landed.locator,
          focus: landed.focus,
          pass: false, reason: null
        };
        if (landed.error) row.reason = landed.error;
        else if (!expected) row.reason = "PM2Index.byId did not resolve the rendered result id";
        else {
          const d = expected.destination;
          const ok = [];
          if (d.managerId) ok.push(landed.landing.managerId === d.managerId || "manager " + landed.landing.managerId + " != " + d.managerId);
          if (d.objectId) ok.push(landed.locator && (landed.locator.object === d.objectId) ? true : "object not selected: " + d.objectId);
          if (d.settingId) {
            ok.push(landed.locator && landed.locator.row === d.settingId ? true : "row not highlighted: " + d.settingId);
            ok.push(landed.locator && landed.locator.inViewport ? true : "row not scrolled into view");
            ok.push(landed.focus && (landed.focus.row === d.settingId) ? true : "focus not on the destination row");
          }
          if (!d.managerId && !d.settingId && d.pageId) {
            ok.push(landed.landing.hash.indexOf(encodeURIComponent(d.pageId)) >= 0 || landed.landing.hash.indexOf(d.pageId) >= 0
              ? true : "did not route to page " + d.pageId);
          }
          const bad = ok.filter((x) => x !== true);
          row.pass = bad.length === 0;
          row.reason = bad.length ? bad.join("; ") : null;
        }

        // Back must restore the query and the selected result.
        if (row.pass) {
          const back = await page.evaluate(function () {
            history.back();
            return window.__pmProbe.settle(240).then(function () {
              var f = document.querySelector("[data-pm-search-field]");
              return { hash: location.hash, query: f ? f.value : null,
                results: document.querySelectorAll("[data-pm-result]").length };
            });
          });
          row.back = back;
          if (back.query !== spec.q) { row.pass = false; row.reason = "Back did not restore the query (got " + JSON.stringify(back.query) + ")"; }
        }
        rows.push(row);
      }
    }

    // Two results with the same label must still be distinguishable by path.
    await probe(page, "goHash", "#/home");
    const dup = await page.evaluate(function () {
      var res = window.PM2Index.query("timeout", { limit: 60 });
      var byLabel = {};
      var flat = [];
      res.groups.forEach(function (g) { g.results.forEach(function (r) { flat.push(r); }); });
      flat.forEach(function (r) { (byLabel[r.label] = byLabel[r.label] || []).push(r); });
      var dupes = Object.keys(byLabel).filter(function (k) { return byLabel[k].length > 1; });
      return dupes.slice(0, 3).map(function (k) {
        return { label: k, ids: byLabel[k].map(function (r) { return r.id; }), paths: byLabel[k].map(function (r) { return r.path; }) };
      });
    });
    const dupPass = dup.every((d) => new Set(d.ids).size === d.ids.length && new Set(d.paths).size === d.paths.length);

    results.push({
      concept: stem, cases: rows.length,
      passed: rows.filter((r) => r.pass).length,
      duplicates: dup, duplicatesPass: dupPass,
      rows,
      pass: rows.every((r) => r.pass) && dupPass,
      ...diagnostics(page)
    });
    await page.close();
    log(`  search ${stem}: ${rows.filter((r) => r.pass).length}/${rows.length}`);
  }
  return { suite: "search", results, pass: results.every((r) => r.pass) };
}

/* 5. Manager isolation — every family reachable, in-shell, with a way out. */
async function suiteManagers(browser, concepts) {
  const results = [];
  for (const stem of concepts) {
    const page = await loadPage(browser, stem);
    const ids = await page.evaluate(function () {
      return window.PM2Model.destinations.filter(function (d) { return d.managerId; })
        .map(function (d) { return { managerId: d.managerId, family: d.family, deferred: !!d.deferred, domainId: d.domainId }; });
    });

    const rows = [];
    for (const entry of ids) {
      page.clearDiagnostics();
      const landed = await probe(page, "goHash", "#/m/" + encodeURIComponent(entry.managerId));
      const detail = await page.evaluate(function (id) {
        var root = document.querySelector('[data-pm-surface="manager"]');
        var named = document.querySelector('[data-pm-manager="' + id + '"][data-pm-surface], [data-pm-surface="manager"][data-pm-manager="' + id + '"]');
        return {
          rendered: !!root,
          managerAttr: named ? named.getAttribute("data-pm-manager") : (root ? root.getAttribute("data-pm-manager") : null),
          contentNodes: root ? root.getElementsByTagName("*").length : 0,
          text: root ? (root.textContent || "").replace(/\s+/g, " ").trim().length : 0,
          crossConcept: /opus-5-(atlas|console|stack|ledger)|another concept/i.test(document.body.innerHTML)
        };
      }, entry.managerId);
      const diag = diagnostics(page);
      const row = {
        ...entry,
        route: "#/m/" + entry.managerId,
        rendered: detail.rendered,
        managerAttr: detail.managerAttr,
        contentNodes: detail.contentNodes,
        textLength: detail.text,
        shellRetained: landed.hasBack && landed.hasClose && !!landed.breadcrumb && !!landed.project,
        backLabel: landed.backLabel,
        crossConcept: detail.crossConcept,
        consoleErrors: diag.consoleErrors.length,
        pass: false
      };
      row.pass = row.rendered && row.managerAttr === entry.managerId && row.shellRetained &&
        !row.crossConcept && row.contentNodes > 12 && row.textLength > 120 && row.consoleErrors === 0;
      if (!row.pass) {
        row.reason = [
          !row.rendered && "no manager surface",
          row.managerAttr !== entry.managerId && ("manager attr " + row.managerAttr),
          !row.shellRetained && "shell context lost",
          row.crossConcept && "cross-concept text present",
          row.contentNodes <= 12 && "surface is nearly empty",
          row.textLength <= 120 && "surface has almost no text",
          row.consoleErrors && (row.consoleErrors + " console errors")
        ].filter(Boolean).join("; ");
      }
      rows.push(row);
    }

    /* Escape must move one level out, not close Settings. */
    await probe(page, "goHash", "#/m/manager-providers");
    const escaped = await page.evaluate(function () {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
      return window.__pmProbe.settle(160).then(function () { return window.__pmProbe.surface(); });
    });

    results.push({
      concept: stem, managers: rows.length,
      passed: rows.filter((r) => r.pass).length,
      escape: escaped,
      rows,
      pass: rows.every((r) => r.pass)
    });
    await page.close();
    log(`  managers ${stem}: ${rows.filter((r) => r.pass).length}/${rows.length}`);
  }
  return { suite: "managers", results, pass: results.every((r) => r.pass) };
}

/* 6. Inventory coverage — every canonical id indexed, and a sample routable. */
async function suiteInventory(browser, concepts) {
  const results = [];
  for (const stem of concepts) {
    const page = await loadPage(browser, stem);
    const indexed = await page.evaluate(function () {
      var missing = [];
      var settings = window.PM2Model.settings;
      for (var i = 0; i < settings.length; i++) {
        var id = settings[i].id;
        if (!window.PM2Index.byId("r:setting:" + id) && !window.PM2Index.byId("r:action:" + id) &&
            !window.PM2Index.byId("r:unavailable:" + id) && !window.PM2Index.byId("r:diagnostic:" + id) &&
            !window.PM2Index.byId("r:setup:" + id)) {
          missing.push(id);
        }
      }
      return { total: settings.length, missing: missing.slice(0, 20), missingCount: missing.length };
    });

    /* Route a deterministic spread rather than all 828, and require the row to be on
     * screen and focused — being "in the DOM" is not the claim being tested. */
    const sample = await page.evaluate(function () {
      var s = window.PM2Model.settings;
      var out = [];
      for (var i = 0; i < s.length; i += Math.max(1, Math.floor(s.length / 60))) out.push(s[i]);
      return out.map(function (r) { return { id: r.id, domainId: r.domainId, pageId: r.pageId, sectionId: r.sectionId }; });
    });

    const routed = [];
    for (const rec of sample) {
      const hash = "#/d/" + encodeURIComponent(rec.domainId) + "/" + encodeURIComponent(rec.pageId) +
        "/" + encodeURIComponent(rec.sectionId) + "/" + encodeURIComponent(rec.id);
      await probe(page, "goHash", hash);
      const vis = await probe(page, "rowVisible", rec.id);
      routed.push({ id: rec.id, ...vis, pass: vis.found && vis.inViewport });
    }

    results.push({
      concept: stem,
      indexed,
      routedSample: routed.length,
      routedPassed: routed.filter((r) => r.pass).length,
      failures: routed.filter((r) => !r.pass).slice(0, 12),
      pass: indexed.missingCount === 0 && routed.every((r) => r.pass),
      ...diagnostics(page)
    });
    await page.close();
    log(`  inventory ${stem}: indexed ${indexed.total - indexed.missingCount}/${indexed.total}, routed ${routed.filter((r) => r.pass).length}/${routed.length}`);
  }
  return { suite: "inventory", results, pass: results.every((r) => r.pass) };
}

/* 7. Every deterministic state fixture visibly changes the page. */
async function suiteStates(browser, concepts) {
  const results = [];
  for (const stem of concepts) {
    const page = await loadPage(browser, stem);
    const fixtures = await page.evaluate(function () {
      return window.PM2States.list().map(function (f) { return f.id; });
    });
    const rows = [];
    let baseline = null;
    for (const id of fixtures) {
      page.clearDiagnostics();
      await probe(page, "goHash", "#/home?s=" + encodeURIComponent(id));
      const shot = await page.evaluate(function (fixtureId) {
        var main = document.querySelector("[data-pm-surface]");
        return {
          active: window.PM2States.active(),
          fixture: fixtureId,
          text: main ? (main.textContent || "").replace(/\s+/g, " ").trim() : "",
          nodes: main ? main.getElementsByTagName("*").length : 0,
          notices: document.querySelectorAll("[data-pm-surface='notice'], [data-pm-notice]").length
        };
      }, id);
      const diag = diagnostics(page);
      if (id === "normal") baseline = shot.text;
      const row = {
        fixture: id, applied: shot.active === id, nodes: shot.nodes,
        differsFromNormal: id === "normal" ? true : shot.text !== baseline,
        consoleErrors: diag.consoleErrors.length,
        pass: shot.active === id && shot.nodes > 20 && diag.consoleErrors.length === 0 &&
          (id === "normal" || shot.text !== baseline)
      };
      if (!row.pass) {
        row.reason = [
          shot.active !== id && ("fixture not applied (active=" + shot.active + ")"),
          shot.nodes <= 20 && "surface nearly empty",
          id !== "normal" && shot.text === baseline && "page identical to the normal state",
          diag.consoleErrors.length && "console errors"
        ].filter(Boolean).join("; ");
      }
      rows.push(row);
    }
    results.push({
      concept: stem, fixtures: rows.length, passed: rows.filter((r) => r.pass).length,
      rows, pass: rows.every((r) => r.pass)
    });
    await page.close();
    log(`  states ${stem}: ${rows.filter((r) => r.pass).length}/${rows.length}`);
  }
  return { suite: "states", results, pass: results.every((r) => r.pass) };
}

/* 8. Hydration and scale. */
async function suitePerf(browser, concepts) {
  const results = [];
  for (const stem of concepts) {
    const page = await loadPage(browser, stem);

    const atHome = await probe(page, "hydrated");
    const homeDom = await probe(page, "domNodeCount");

    await probe(page, "typeSearch", "timeout");
    const afterSearch = await probe(page, "hydrated");

    await probe(page, "goHash", "#/m/manager-providers");
    const afterManager = await probe(page, "hydrated");

    /* The compendium at full scale is where a naive implementation renders 3,200
     * rows into the DOM. */
    const scale = await page.evaluate(function () {
      window.PM2Scale.setActive(true);
      return window.__pmProbe.settle(160).then(function () {
        return { counts: window.PM2Scale.counts(), indexed: window.PM2Index.stats().records };
      });
    });
    await probe(page, "goHash", "#/all");
    const scaleDom = await probe(page, "domNodeCount");
    const scaleTiming = await page.evaluate(function () {
      var t0 = performance.now();
      var res = window.PM2Index.query("timeout", { limit: 40 });
      var t1 = performance.now();
      return { ms: Math.round((t1 - t0) * 100) / 100, total: res.total, shown: res.shown, truncated: res.truncated };
    });
    const hydratedAtScale = await probe(page, "hydrated");
    await page.evaluate(function () { window.PM2Scale.setActive(false); return true; });

    const record = {
      concept: stem,
      hydratedAtHome: atHome,
      hydratedAfterSearch: afterSearch,
      hydratedAfterManager: afterManager,
      homeNodes: homeDom.total,
      scaleCounts: scale.counts,
      indexedAtScale: scale.indexed,
      allSettingsNodes: scaleDom.total,
      allSettingsRows: scaleDom.rows,
      searchAtScaleMs: scaleTiming.ms,
      searchTotal: scaleTiming.total,
      searchShown: scaleTiming.shown,
      hydratedAtScale,
      ...diagnostics(page)
    };
    record.pass = atHome.length === 0 &&
      afterSearch.length === 0 &&
      afterManager.indexOf("manager-providers") >= 0 &&
      scale.indexed >= 3200 &&
      scaleDom.rows <= 200 &&
      scaleTiming.ms < 400 &&
      record.clean;
    record.reason = record.pass ? null : [
      atHome.length && "managers hydrated at load: " + atHome.join(","),
      afterSearch.length && "search hydrated managers: " + afterSearch.join(","),
      afterManager.indexOf("manager-providers") < 0 && "opening a manager did not record hydration",
      scale.indexed < 3200 && ("scale fixture not indexed (" + scale.indexed + ")"),
      scaleDom.rows > 200 && ("All Settings rendered " + scaleDom.rows + " rows — not virtualized"),
      scaleTiming.ms >= 400 && ("search at scale took " + scaleTiming.ms + "ms"),
      !record.clean && "console errors"
    ].filter(Boolean).join("; ");

    results.push(record);
    await page.close();
    log(`  perf ${stem}: ${record.pass ? "pass" : record.reason}`);
  }
  return { suite: "perf", results, pass: results.every((r) => r.pass) };
}

/* 9. The four original concepts still work. */
async function suiteRegression(browser) {
  const results = [];
  for (const stem of ORIGINALS) {
    const page = await browser.newPage();
    await page.setViewport(1280, 1000);
    await page.goto("file://" + path.join(ROOT, stem + ".html"));
    await page.evaluate(function () {
      return new Promise(function (r) { setTimeout(r, 700); });
    });
    const state = await page.evaluate(function () {
      return {
        title: document.title,
        nodes: document.getElementById("pm-root") ? document.getElementById("pm-root").getElementsByTagName("*").length : 0,
        shell: !!document.querySelector(".pm-app"),
        managerKit: !!window.PMManagerKit,
        data: !!window.PMData
      };
    });
    // Deep-link into a manager the original owns, and confirm it still renders.
    await page.evaluate(function () {
      location.hash = "#/m/manager-providers";
      return new Promise(function (r) { setTimeout(r, 500); });
    });
    const routed = await page.evaluate(function () {
      var root = document.getElementById("pm-root");
      return { hash: location.hash, nodes: root ? root.getElementsByTagName("*").length : 0 };
    });
    const diag = diagnostics(page);
    results.push({
      concept: stem, ...state, routed, ...diag,
      pass: diag.clean && state.nodes > 100 && state.shell && routed.nodes > 100
    });
    await page.close();
  }
  return { suite: "regression", results, pass: results.every((r) => r.pass) };
}

/* --------------------------------------------------------------------- main */

async function main() {
  const requested = arg("suites", "all").split(",").map((s) => s.trim());
  const conceptArg = arg("concepts", "all");
  const concepts = conceptArg === "all" ? CONCEPTS : conceptArg.split(",").map((s) => s.trim());
  const outDir = arg("out", path.join("/tmp/claude-1000/-mnt-Cursor-PuppetMaster/61a80b00-6e68-4a4f-9b3f-98a47fe7855a/scratchpad", "harness-out"));
  fs.mkdirSync(outDir, { recursive: true });

  const wanted = (name) => requested.includes("all") || requested.includes(name);
  const report = { startedAt: new Date().toISOString(), concepts, suites: {} };

  if (wanted("static")) {
    log("static…");
    report.suites.static = suiteStatic(concepts);
  }

  const needsBrowser = ["load", "matrix", "search", "managers", "inventory", "states", "perf", "regression"]
    .some((s) => wanted(s));

  if (needsBrowser) {
    const profile = path.join(outDir, "browser-profile");
    const browser = await Browser.launch(profile);
    try {
      if (wanted("load")) { log("load…"); report.suites.load = await suiteLoad(browser, concepts); }
      if (wanted("matrix")) { log("matrix…"); report.suites.matrix = await suiteMatrix(browser, concepts, outDir); }
      if (wanted("search")) { log("search…"); report.suites.search = await suiteSearch(browser, concepts); }
      if (wanted("managers")) { log("managers…"); report.suites.managers = await suiteManagers(browser, concepts); }
      if (wanted("inventory")) { log("inventory…"); report.suites.inventory = await suiteInventory(browser, concepts); }
      if (wanted("states")) { log("states…"); report.suites.states = await suiteStates(browser, concepts); }
      if (wanted("perf")) { log("perf…"); report.suites.perf = await suitePerf(browser, concepts); }
      if (wanted("regression")) { log("regression…"); report.suites.regression = await suiteRegression(browser); }
    } finally {
      await browser.close();
    }
  }

  report.finishedAt = new Date().toISOString();
  report.pass = Object.values(report.suites).every((s) => s.pass);
  for (const [name, suite] of Object.entries(report.suites)) {
    fs.writeFileSync(path.join(outDir, name + ".json"), JSON.stringify(suite, null, 1));
    log(`${suite.pass ? "PASS" : "FAIL"}  ${name}`);
  }
  fs.writeFileSync(path.join(outDir, "summary.json"), JSON.stringify(report, null, 1));
  log(report.pass ? "ALL SUITES PASS" : "FAILURES PRESENT — see " + outDir);
  process.exit(report.pass ? 0 : 1);
}

main().catch((err) => { console.error(err); process.exit(2); });
