/* The audit harness for concepts 05-11.
 *
 *   node tools/harness/run.js --suites=all --out=<dir>
 *   node tools/harness/run.js --suites=matrix --concepts=concept-07-compendium-workspace
 *
 * Suites: static, load, matrix, search, managers, inventory, states, perf, deeplinks,
 * regression.
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
  // Emoji are banned outright in this repository; SVG only. The ranges below are the
  // unambiguous pictographic blocks, the regional indicators and the emoji-presentation
  // variation selector.
  //
  // Deliberately NOT included: the arrows block (U+2190-21FF) and the check and cross
  // marks in Dingbats. An arrow between a previous and a next value, or a tick beside a
  // chosen option, is typography — the rule is about emoji, and flagging "→" as one
  // sends an author hunting for a picture that is not there.
  const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{26FF}\u{FE0F}\u{1F1E6}-\u{1F1FF}]/u;

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
        var shown = root ? (root.textContent || "").replace(/\s+/g, " ") : "";

        /* Node and character counts prove a surface is not blank. They do NOT prove it
         * is the MANAGER: a page showing only the manager's title and purpose clears
         * both thresholds while containing none of what the manager actually holds.
         * So the spec is built here and its own item names are looked for in the
         * rendered text. Item names are data — provider names, installation paths,
         * server names — so a concept is free to phrase its headings however it likes
         * and still be caught if it rendered no content at all. */
        var specItems = [];
        var specLabels = [];
        var richest = [];
        var specSections = 0;
        try {
          var spec = window.PM2Managers.spec(id, {});
          specSections = (spec.sections || []).length;
          (spec.sections || []).forEach(function (s) {
            if (s.label) specLabels.push(String(s.label));
            (s.items || []).forEach(function (it) { if (it.name) specItems.push(String(it.name)); });
          });
          /* Richest section first, so the drill-down opens one that HAS content. The
           * first section of a manager is often a preference block with no items, and
           * clicking that proves nothing about whether the contents open. */
          richest = (spec.sections || []).slice().sort(function (a, b) {
            return ((b.items || []).length) - ((a.items || []).length);
          }).filter(function (s) { return s.label && (s.items || []).length; });
        } catch (e) { /* reported below as zero items */ }

        function seen(list, cap) {
          var n = 0;
          for (var i = 0; i < list.length && n < cap; i++) {
            var v = list[i];
            if (v.length >= 4 && shown.indexOf(v.slice(0, Math.min(48, v.length))) >= 0) n += 1;
          }
          return n;
        }

        /* Two shapes are both honest. A manager may put its content on the landing
         * page, or it may land on the manager's own contents and hold each section one
         * click in — which is what a concept whose sub-navigation nests inside the
         * sheet is supposed to do. So the surface passes if it shows the spec's ITEMS
         * or the spec's own SECTION LABELS. What neither shape allows is a page built
         * from nothing but the manager's title and purpose. */
        var found = seen(specItems, 4);
        var labelsFound = seen(specLabels, 4);

        /* A contents page only counts if its contents open. When the landing showed
         * headings rather than items, follow the first heading the way a reader would —
         * click it — and look again. A manager that lists its sections and then cannot
         * show one is not a demonstrated manager. */
        var drilled = null;
        if (found < 2 && labelsFound >= 2 && specItems.length) {
          var target = null;
          var clickable = root ? root.querySelectorAll("a,button,[role=tab],[role=button]") : [];
          for (var r = 0; r < richest.length && !target; r++) {
            var want = String(richest[r].label).slice(0, 40);
            for (var c = 0; c < clickable.length; c++) {
              var label = (clickable[c].textContent || "").replace(/\s+/g, " ").trim();
              if (label && want.length >= 4 && label.indexOf(want) === 0) { target = clickable[c]; break; }
            }
          }
          if (target) {
            target.click();
            return new Promise(function (resolve) {
              setTimeout(function () {
                var after = document.querySelector('[data-pm-surface="manager"]');
                var afterText = after ? (after.textContent || "").replace(/\s+/g, " ") : "";
                var n = 0;
                for (var i = 0; i < specItems.length && n < 4; i++) {
                  var v = specItems[i];
                  if (v.length >= 4 && afterText.indexOf(v.slice(0, Math.min(48, v.length))) >= 0) n += 1;
                }
                resolve(result(n));
              }, 320);
            });
          }
          drilled = 0;
        }

        function result(afterDrill) {
          return {
            rendered: !!root,
            managerAttr: named ? named.getAttribute("data-pm-manager") : (root ? root.getAttribute("data-pm-manager") : null),
            contentNodes: root ? root.getElementsByTagName("*").length : 0,
            text: shown.trim().length,
            specSections: specSections,
            specItems: specItems.length,
            itemsShown: found,
            sectionLabelsShown: labelsFound,
            itemsAfterDrill: afterDrill,
            crossConcept: /opus-5-(atlas|console|stack|ledger)|another concept/i.test(document.body.innerHTML)
          };
        }
        return result(drilled);

      }, entry.managerId);
      const diag = diagnostics(page);
      const row = {
        ...entry,
        route: "#/m/" + entry.managerId,
        rendered: detail.rendered,
        managerAttr: detail.managerAttr,
        contentNodes: detail.contentNodes,
        textLength: detail.text,
        specSections: detail.specSections,
        specItems: detail.specItems,
        itemsShown: detail.itemsShown,
        sectionLabelsShown: detail.sectionLabelsShown,
        itemsAfterDrill: detail.itemsAfterDrill,
        shellRetained: landed.hasBack && landed.hasClose && !!landed.breadcrumb && !!landed.project,
        backLabel: landed.backLabel,
        crossConcept: detail.crossConcept,
        consoleErrors: diag.consoleErrors.length,
        pass: false
      };
      /* A manager with items in its spec must show some of them. One is enough for a
       * deferred owner shell, which is deliberately thin; a demonstrated manager shows
       * at least two. */
      var needed = detail.specItems === 0 ? 0 : (entry.deferred ? 1 : 2);
      var showsContent = detail.specItems === 0 || detail.itemsShown >= needed ||
        (detail.sectionLabelsShown >= 2 && detail.itemsAfterDrill >= Math.min(needed, 2));
      row.pass = row.rendered && row.managerAttr === entry.managerId && row.shellRetained &&
        !row.crossConcept && row.contentNodes > 12 && row.textLength > 120 &&
        showsContent && row.consoleErrors === 0;
      if (!row.pass) {
        row.reason = [
          !row.rendered && "no manager surface",
          row.managerAttr !== entry.managerId && ("manager attr " + row.managerAttr),
          !row.shellRetained && "shell context lost",
          row.crossConcept && "cross-concept text present",
          row.contentNodes <= 12 && "surface is nearly empty",
          row.textLength <= 120 && "surface has almost no text",
          !showsContent && ("renders " + row.itemsShown + " of " + row.specItems + " spec items, " +
            row.sectionLabelsShown + " of " + detail.specSections + " section headings, and " +
            (detail.itemsAfterDrill === null ? "no section could be opened" : detail.itemsAfterDrill + " items after opening one") +
            " — the manager's own content is not on screen"),
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

    /* Open two managers, not one. The provider surface is the manager every concept is
     * told to build bespoke, so a concept may legitimately compose it from the fixtures
     * rather than from a spec and record no hydration for it. Doctor is nobody's
     * showcase, so it is the honest probe for "opening a manager hydrates it". */
    await probe(page, "goHash", "#/m/manager-providers");
    await probe(page, "goHash", "#/m/manager-doctor");
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
    /* A concept marks compendium rows with data-pm-row or with data-pm-result depending
     * on how it models them, so count both. Counting only one made "rows in the DOM: 0"
     * look like perfect virtualization when it actually meant the probe was looking for
     * the wrong attribute — evidence that proves nothing is worse than none. */
    const listRows = scaleDom.rows + scaleDom.results;
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
      allSettingsRows: listRows,
      allSettingsRowsByAttr: { row: scaleDom.rows, result: scaleDom.results },
      searchAtScaleMs: scaleTiming.ms,
      searchTotal: scaleTiming.total,
      searchShown: scaleTiming.shown,
      hydratedAtScale,
      ...diagnostics(page)
    };
    record.pass = atHome.length === 0 &&
      afterSearch.length === 0 &&
      afterManager.length > 0 &&
      scale.indexed >= 3200 &&
      listRows > 0 && listRows <= 200 &&
      scaleTiming.ms < 400 &&
      record.clean;
    record.reason = record.pass ? null : [
      atHome.length && "managers hydrated at load: " + atHome.join(","),
      afterSearch.length && "search hydrated managers: " + afterSearch.join(","),
      afterManager.length === 0 && "opening a manager did not record hydration",
      scale.indexed < 3200 && ("scale fixture not indexed (" + scale.indexed + ")"),
      listRows > 200 && ("All Settings rendered " + listRows + " rows — not virtualized"),
      listRows === 0 && "All Settings rendered no rows at all — nothing to virtualize means nothing was shown",
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
/* 9. Deep links, scrollspy and the popup family.
 *
 * Every check here exists because the other eight suites were green while the behaviour
 * was broken. They asserted that a page RENDERED; none asserted that the reader arrived
 * where the link said they would, that the highlight followed the scroll, or that a
 * second menu layer existed at all. See SEVEN_NEW_CONCEPTS_FINDINGS.md section 1c. */
async function suiteDeepLinks(browser, concepts) {
  const results = [];
  for (const stem of concepts) {
    const page = await loadPage(browser, stem);
    const checks = [];

    /* 1. Every object a manager actually contains can be named by a link. This is the
     *    one that was 633/786 wrong: the roster and the index called the same provider
     *    two different things, and the router called "not a search result" "does not
     *    exist". */
    const routable = await page.evaluate(function () {
      window.PM2Index.ensure();
      var bad = [], checked = 0;
      window.PM2Model.destinations.filter(function (d) { return d.managerId; }).forEach(function (d) {
        var spec;
        try { spec = window.PM2Managers.spec(d.managerId); } catch (e) { return; }
        (spec.sections || []).forEach(function (sec) {
          (sec.items || sec.cards || []).forEach(function (it) {
            if (!it || !it.id) return;
            checked++;
            if (!window.PM2Index.objectExists(d.managerId, it.id)) bad.push(d.managerId + "/" + it.id);
          });
        });
      });
      return { checked: checked, unroutable: bad.length, sample: bad.slice(0, 8) };
    });
    checks.push({
      check: "every manager object is routable",
      detail: routable.checked + " roster items, " + routable.unroutable + " unroutable",
      sample: routable.sample,
      pass: routable.checked > 400 && routable.unroutable === 0
    });

    /* 2. A section-level link scrolls its group into view and marks it. */
    page.clearDiagnostics();
    await probe(page, "goHash", "#/d/general/general.visual/general.visual.s03");
    const section = await page.evaluate(function () {
      var n = document.querySelector('[data-pm-section="general.visual.s03"]');
      if (!n) return { found: false };
      var r = n.getBoundingClientRect();
      return {
        found: true,
        onScreen: r.top >= 0 && r.top < window.innerHeight && r.height > 0,
        marked: !!document.querySelector("[data-pm-locator]"),
        navSaysSo: Array.prototype.some.call(
          document.querySelectorAll('[aria-current="true"],[aria-current="location"]'),
          function (x) { return /chat layout/i.test(x.textContent || ""); })
      };
    });
    checks.push({
      check: "a section-level deep link lands on its group",
      detail: JSON.stringify(section),
      pass: !!(section.found && section.onScreen && section.marked && section.navSaysSo)
    });

    /* 3. Drilling into a roster object from inside a manager stays in the manager. */
    const drill = [];
    for (const mgr of ["manager-providers", "manager-mcp", "manager-crew"]) {
      await probe(page, "goHash", "#/m/" + mgr);
      const r = await page.evaluate(function () {
        var n = document.querySelector("[data-pm-object]");
        if (!n) return "no-objects";
        var t = n.matches("button,a") ? n : (n.querySelector("button,a") || n.closest("button,a") || n);
        t.click();
        return new Promise(function (resolve) {
          setTimeout(function () {
            var txt = document.body.innerText || "";
            if (/points somewhere this Project does not have|does not contain the item/.test(txt)) {
              return resolve("NOT-FOUND");
            }
            resolve(document.querySelector('[data-pm-surface="manager"]') ? "ok" : "left-manager");
          }, 500);
        });
      });
      drill.push(mgr.replace("manager-", "") + "=" + r);
    }
    checks.push({
      check: "a roster drill-down does not land on a not-found page",
      detail: drill.join(" "),
      pass: drill.every(function (d) { return !/NOT-FOUND|left-manager/.test(d); })
    });

    /* 4. Scrolling moves the navigation highlight, without a click. */
    await probe(page, "goHash", "#/d/ai/ai.models");
    const spy = await page.evaluate(function () {
      function marked() {
        return Array.prototype.map.call(
          document.querySelectorAll('[aria-current="true"],[aria-current="location"]'),
          function (n) { return (n.textContent || "").trim(); }).join("|");
      }
      var marks = document.querySelectorAll("[data-pm-section]");
      if (!marks.length) return { ok: false, why: "no sections" };
      var before = marked();
      /* Concepts carry `data-pm-section` on both their navigation rows and their section
       * headings, and which comes first in the DOM differs between them — so this drives
       * every one of them rather than picking one and hoping. For each: a wheel, because
       * the spy holds the highlight through a PROGRAMMATIC scroll after a controlled jump
       * and only the reader's own input releases it, then a scroll of every scrollable
       * ancestor, because a concept may nest an overflow-x wrapper inside the pane that
       * actually moves. */
      Array.prototype.forEach.call(marks, function (m) {
        m.dispatchEvent(new WheelEvent("wheel", { deltaY: 300, bubbles: true }));
        var s = m.parentElement;
        while (s && s !== document.documentElement) {
          if (s.scrollHeight > s.clientHeight + 24) {
            s.scrollTop = s.scrollHeight * 0.6;
            s.dispatchEvent(new Event("scroll", { bubbles: true }));
          }
          s = s.parentElement;
        }
      });
      document.scrollingElement.scrollTop = document.scrollingElement.scrollHeight * 0.6;
      document.dispatchEvent(new Event("scroll", { bubbles: true }));
      return new Promise(function (resolve) {
        setTimeout(function () { resolve({ ok: marked() !== before, before: before.slice(0, 40), after: marked().slice(0, 40) }); }, 450);
      });
    });
    checks.push({ check: "scrolling moves the navigation highlight", detail: JSON.stringify(spy), pass: !!spy.ok });

    /* 5. The popup family's second layer: beside its parent, in view, Escape closing
     *    one layer at a time. */
    await probe(page, "goHash", "#/d/general/general.visual");
    const menu = await page.evaluate(function () {
      var t = document.querySelector('[data-pm-control="general.visual.theme"]');
      if (!t) return { ok: false, why: "no theme control" };
      t.click();
      return new Promise(function (resolve) {
        setTimeout(function () {
          var panels = Array.prototype.filter.call(document.querySelectorAll('[role="listbox"]'),
            function (p) { return p.getBoundingClientRect().width > 0; });
          var panel = panels[panels.length - 1];
          if (!panel) return resolve({ ok: false, why: "no panel" });
          var parent = panel.querySelector('[aria-haspopup="menu"]');
          if (!parent) return resolve({ ok: false, why: "no submenu parent" });
          parent.click();
          setTimeout(function () {
            var sub = document.querySelectorAll('[class*="submenu"]');
            sub = sub[sub.length - 1];
            if (!sub) return resolve({ ok: false, why: "submenu did not open" });
            var pr = panel.getBoundingClientRect(), sr = sub.getBoundingClientRect();
            var beside = sr.left >= pr.right - 2 || sr.right <= pr.left + 2;
            var inView = sr.left >= 0 && sr.top >= 0 && sr.right <= window.innerWidth && sr.bottom <= window.innerHeight;
            document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
            setTimeout(function () {
              var subGone = !document.querySelector('[class*="submenu"]');
              var panelStands = document.body.contains(panel);
              document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
              setTimeout(function () {
                resolve({ ok: beside && inView && subGone && panelStands && !document.body.contains(panel),
                  beside: beside, inView: inView, subGone: subGone, panelStands: panelStands });
              }, 220);
            }, 220);
          }, 260);
        }, 260);
      });
    });
    checks.push({ check: "a submenu opens beside its parent and Escape closes one layer", detail: JSON.stringify(menu), pass: !!menu.ok });

    /* 6. The retro themes snap — including the menus, which live on document.body and
     *    so sit outside every concept's root-scoped snap rule. */
    await probe(page, "goHash", "#/d/general/general.visual");
    const retro = await page.evaluate(function () {
      document.documentElement.setAttribute("data-theme", "retro-dark");
      var t = document.querySelector('[data-pm-control="general.visual.theme"]');
      if (!t) return { ok: false, why: "no theme control" };
      t.click();
      return new Promise(function (resolve) {
        setTimeout(function () {
          var panels = Array.prototype.filter.call(document.querySelectorAll('[role="listbox"]'),
            function (p) { return p.getBoundingClientRect().width > 0; });
          var panel = panels[panels.length - 1];
          var dur = panel ? getComputedStyle(panel).animationDuration : "n/a";
          window.PM2Menu.closeAll();
          document.documentElement.setAttribute("data-theme", "friendly-dark");
          resolve({ ok: dur === "0s", duration: dur });
        }, 240);
      });
    });
    checks.push({ check: "retro themes snap the popup menus too", detail: JSON.stringify(retro), pass: !!retro.ok });

    /* 7. The Escape order. `03_HOME_SEARCH_AND_NAVIGATION.md` § Location and exit:
     *    close the popup first, then move ONE Settings level outward per press, and stop
     *    at Settings Home rather than closing Settings. Both halves were wrong: the
     *    keypress that closed a menu also stepped the route, because concepts register
     *    their handler on `document` in the same phase as the menu's and `stopPropagation`
     *    does not stop a listener already attached to the same node; and a row-level route
     *    stepped straight to the domain, skipping the page. */
    await probe(page, "goHash", "#/d/general/general.visual/general.visual.s01/general.visual.theme");
    const esc = await page.evaluate(function () {
      function visibleMenus() {
        return Array.prototype.filter.call(document.querySelectorAll('[role="listbox"]'),
          function (n) { return n.getBoundingClientRect().width > 0; }).length;
      }
      function press(target) {
        (target || document.activeElement || document.body)
          .dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
      }
      var t = document.querySelector('[data-pm-control="general.visual.theme"]');
      if (!t) return { ok: false, why: "no theme control" };
      var deep = window.location.hash;
      t.click();
      return new Promise(function (resolve) {
        setTimeout(function () {
          var opened = visibleMenus() > 0;
          press(document.activeElement);
          setTimeout(function () {
            var menuClosed = visibleMenus() === 0;
            var routeHeld = window.location.hash === deep;
            var walk = [];
            var i = 0;
            (function step() {
              if (i++ >= 4) {
                return resolve({
                  ok: opened && menuClosed && routeHeld &&
                    walk.length >= 3 && /general\.visual$/.test(walk[0]) &&
                    /\/d\/general$/.test(walk[1]) && /home/.test(walk[2]) &&
                    /home/.test(walk[walk.length - 1]),
                  opened: opened, menuClosed: menuClosed, routeHeldByMenu: routeHeld, walk: walk
                });
              }
              press(document.body);
              setTimeout(function () { walk.push(window.location.hash); step(); }, 300);
            })();
          }, 300);
        }, 280);
      });
    });
    checks.push({
      check: "Escape closes the menu, then steps one Settings level at a time to Home",
      detail: JSON.stringify(esc), pass: !!esc.ok
    });

    const diag = diagnostics(page);
    checks.push({ check: "no console errors across the suite", detail: String(diag.consoleErrors.length), pass: diag.consoleErrors.length === 0 });

    results.push({ concept: stem, checks, passed: checks.filter((c) => c.pass).length, pass: checks.every((c) => c.pass) });
    await page.close();
    log(`  deeplinks ${stem}: ${checks.filter((c) => c.pass).length}/${checks.length}`);
  }
  return { suite: "deeplinks", results, pass: results.every((r) => r.pass) };
}

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

  const needsBrowser = ["load", "matrix", "search", "managers", "inventory", "states", "perf", "deeplinks", "regression"]
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
      if (wanted("deeplinks")) { log("deeplinks…"); report.suites.deeplinks = await suiteDeepLinks(browser, concepts); }
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
