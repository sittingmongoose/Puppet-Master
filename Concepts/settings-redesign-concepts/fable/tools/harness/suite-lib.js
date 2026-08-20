/* suite-lib.js — shared helpers for the Phase-C suite harness (run-suite.js).
 *
 * Everything here drives pages over file:// through tools/harness/cdp.js and
 * asserts against the CONTRACT2.md test hooks:
 *   [data-rid] [data-manager] [data-setting-id] [data-section] [data-object-id]
 *   [data-tab] .pm2-located html[data-pm2-route] html[data-pm-state="ready"]
 *   [data-allow-hscroll]
 * No suite selects anything by nth-child or array position.
 */
"use strict";

const fs = require("fs");
const path = require("path");

const FABLE_DIR = path.resolve(__dirname, "..", "..");

const CONCEPTS = [
  { num: "05", id: "c05", name: "Waypoint", stem: "concept-05-directory-take-1" },
  { num: "06", id: "c06", name: "Longform", stem: "concept-06-directory-take-2" },
  { num: "07", id: "c07", name: "Compendium", stem: "concept-07-compendium-workspace" },
  { num: "08", id: "c08", name: "Beacon", stem: "concept-08-directory-take-3" },
  { num: "09", id: "c09", name: "Chapters", stem: "concept-09-tome-tabs" },
  { num: "10", id: "c10", name: "Conductor", stem: "concept-10-command-suite" },
  { num: "11", id: "c11", name: "Sheaf", stem: "concept-11-tabbed-organizer" }
];

const THEMES = [
  "friendly-dark", "friendly-light", "glass-dark", "glass-light",
  "retro-dark", "retro-light", "basic-dark", "basic-light"
];

const WIDTHS = [760, 900, 1280, 1700, 2200, 2500];

const FONT_BLOCKS = ["*fonts.googleapis.com*", "*fonts.gstatic.com*"];

function fileUrl(name) { return "file://" + path.join(FABLE_DIR, name); }

/* Console noise that the harness itself causes (fonts are blocked because all
 * http traffic hangs in this sandbox). Nothing else is filtered. */
function isHarnessNoise(text) {
  return /ERR_BLOCKED_BY_CLIENT|fonts\.googleapis|fonts\.gstatic/i.test(String(text || ""));
}

/* Snapshot console errors/warnings + page exceptions, then clear. */
function snapDiagnostics(page) {
  const errors = [];
  const warnings = [];
  for (const c of page.console) {
    if (isHarnessNoise(c.text)) continue;
    if (c.type === "warning") warnings.push(String(c.text).slice(0, 300));
    else errors.push(String(c.text).slice(0, 300));
  }
  const pageErrors = page.pageErrors
    .filter((e) => !isHarnessNoise(e))
    .map((e) => String(e).slice(0, 300));
  page.clearDiagnostics();
  return { errors, warnings, pageErrors };
}

/* #/<route>?instant=1&... — instant probe mode is on everywhere. */
function buildHash(route, params) {
  const p = Object.assign({ instant: 1 }, params || {});
  const pairs = [];
  for (const k of Object.keys(p)) {
    const v = p[k];
    if (v === null || v === undefined || v === false) continue;
    pairs.push(encodeURIComponent(k) + "=" + encodeURIComponent(v === true ? "1" : String(v)));
  }
  const routePath = String(route).split("/").map(encodeURIComponent).join("/");
  return "#/" + routePath + (pairs.length ? "?" + pairs.join("&") : "");
}

/* Deterministic in-page poll: evaluates `predicate(arg)` every `intervalMs`
 * until it returns a truthy value (returned) or `timeoutMs` passes (false). */
async function pollInPage(page, predicate, arg, timeoutMs, intervalMs) {
  const expression =
    "(function(pred, arg, timeout, interval){\n" +
    "  return new Promise(function(resolve){\n" +
    "    var t0 = Date.now();\n" +
    "    (function poll(){\n" +
    "      var v = null;\n" +
    "      try { v = pred(arg); } catch (e) { v = null; }\n" +
    "      if (v) return resolve(v);\n" +
    "      if (Date.now() - t0 >= timeout) return resolve(false);\n" +
    "      setTimeout(poll, interval);\n" +
    "    })();\n" +
    "  });\n" +
    "})(" + predicate.toString() + ", " + JSON.stringify(arg === undefined ? null : arg) +
    ", " + (timeoutMs | 0) + ", " + ((intervalMs | 0) || 60) + ")";
  const result = await page.send("Runtime.evaluate", {
    expression, returnByValue: true, awaitPromise: true, userGesture: true
  });
  if (result.exceptionDetails) return false;
  return result.result.value;
}

function waitReady(page, timeoutMs) {
  return pollInPage(page, function () {
    return document.documentElement.getAttribute("data-pm-state") === "ready";
  }, null, timeoutMs || 15000, 100);
}

/* Wait until data-pm2-route contains every token; resolves the attr or false. */
function waitRouteTokens(page, tokens, timeoutMs) {
  return pollInPage(page, function (tokens) {
    var a = document.documentElement.getAttribute("data-pm2-route") || "";
    for (var i = 0; i < tokens.length; i++) {
      if (a.indexOf(tokens[i]) === -1) return null;
    }
    return a || null;
  }, tokens, timeoutMs || 4000, 60);
}

async function settle(page, extraMs) {
  await page.evaluate(function (ms) {
    return new Promise(function (resolve) {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { setTimeout(resolve, ms); });
      });
    });
  }, Math.max(60, extraMs || 220));
}

async function routeAttr(page) {
  return page.evaluate(function () {
    return document.documentElement.getAttribute("data-pm2-route") || "";
  });
}

/* Full page (re)load with a deep link. Returns the ready verdict.
 * Bounces through about:blank first: navigating the same page file with only
 * a different #hash would otherwise be a same-document navigation, for which
 * Page.loadEventFired never fires and cdp.goto stalls on its 20s fallback. */
async function bootConcept(page, concept, route, params, viewport) {
  const v = viewport || { width: 1280, height: 900 };
  await page.setViewport(v.width, v.height);
  await page.goto("about:blank");
  page.clearDiagnostics();
  await page.goto(fileUrl(concept.stem + ".html") + buildHash(route || "home", params));
  const ready = await waitReady(page, 15000);
  if (ready) await settle(page, 180);
  return ready;
}

/* Hash navigation inside a booted page (real history entries). */
async function hashRoute(page, route, params, settleMs) {
  await page.evaluate(function (hash) { window.location.hash = hash; }, buildHash(route, params));
  await settle(page, settleMs || 220);
}

/* Overflow scan: document-level scroll width plus a clip-aware element walk.
 * An element counts as an offender when its right edge passes the viewport by
 * more than 2px, it is visible, it is not inside [data-allow-hscroll], and no
 * ancestor with non-visible overflow-x clips it back inside the viewport. */
function scanOverflow(page) {
  return page.evaluate(function () {
    var vw = window.innerWidth;
    var docOverflow = document.documentElement.scrollWidth > vw + 1 ||
      document.body.scrollWidth > vw + 1;
    var all = document.querySelectorAll("body *");
    var limit = Math.min(all.length, 15000);
    var offenders = [];
    for (var i = 0; i < limit && offenders.length < 8; i++) {
      var el = all[i];
      var r = el.getBoundingClientRect();
      if (!(r.right > vw + 2) || r.width < 2 || r.height < 2) continue;
      var cs = getComputedStyle(el);
      if (cs.visibility === "hidden" || cs.display === "none" || Number(cs.opacity) === 0) continue;
      if (el.closest("[data-allow-hscroll]")) continue;
      var clipped = false;
      var a = el.parentElement;
      while (a && a !== document.body) {
        var ax = getComputedStyle(a).overflowX;
        if (ax === "hidden" || ax === "clip" || ax === "auto" || ax === "scroll") {
          if (a.getBoundingClientRect().right <= vw + 2) { clipped = true; break; }
        }
        a = a.parentElement;
      }
      if (clipped) continue;
      var sel = el.tagName.toLowerCase();
      if (el.id) sel += "#" + el.id;
      else if (typeof el.className === "string" && el.className.trim()) {
        sel += "." + el.className.trim().split(/\s+/).slice(0, 2).join(".");
      }
      offenders.push({ sel: sel.slice(0, 90), right: Math.round(r.right), width: Math.round(r.width) });
    }
    return { vw: vw, docOverflow: docOverflow, offenders: offenders, scanned: limit, totalEls: all.length };
  });
}

/* pm-shell chrome visibility + amount of visible body text. */
function shellCheck(page) {
  return page.evaluate(function () {
    function vis(el) {
      if (!el) return false;
      var r = el.getBoundingClientRect();
      var cs = getComputedStyle(el);
      return r.width > 40 && r.height > 8 && cs.visibility !== "hidden" &&
        cs.display !== "none" && r.top < window.innerHeight && r.bottom > 0;
    }
    return {
      titlebar: vis(document.querySelector(".pm-titlebar")),
      statusbar: vis(document.querySelector(".pm-statusbar")),
      textLen: (document.body.innerText || "").replace(/\s+/g, " ").trim().length
    };
  });
}

/* Body text with the floating States drawer (test affordance) hidden, so its
 * scenario/fixture labels can never satisfy a marker-phrase assertion. */
function bodyTextSansDrawer(page) {
  return page.evaluate(function () {
    var drawers = document.querySelectorAll(".pm2-drawer-panel, .pm2-drawer-btn, [data-pm2-drawer]");
    var prev = [];
    for (var i = 0; i < drawers.length; i++) { prev.push(drawers[i].style.display); drawers[i].style.display = "none"; }
    var t = document.body.innerText || "";
    for (var j = 0; j < drawers.length; j++) { drawers[j].style.display = prev[j]; }
    return t;
  });
}

/* Search input discovery ladder (recorded per concept — CONTRACT2 defines no
 * input hook): [data-pm2-search-input] > input[type=search] > topmost visible
 * text input inside the stage. Caches the element on the page. */
function findSearchInput(page) {
  return page.evaluate(function () {
    function vis(el) {
      if (!el) return false;
      var r = el.getBoundingClientRect();
      var cs = getComputedStyle(el);
      return r.width > 30 && r.height > 8 && cs.visibility !== "hidden" && cs.display !== "none";
    }
    var el = null, strategy = null;
    var hooked = document.querySelectorAll("[data-pm2-search-input]");
    for (var i = 0; i < hooked.length && !el; i++) {
      var c = hooked[i];
      if (c.tagName !== "INPUT" && c.tagName !== "TEXTAREA") {
        c = c.querySelector("input, textarea") || null;
      }
      if (c && vis(c)) { el = c; strategy = "[data-pm2-search-input]"; }
    }
    if (!el) {
      var s = document.querySelectorAll('input[type="search"]');
      for (var j = 0; j < s.length; j++) {
        if (vis(s[j]) && !s[j].closest(".pm2-drawer-panel")) { el = s[j]; strategy = "input[type=search]"; break; }
      }
    }
    if (!el) {
      var t = document.querySelectorAll('#pmStage input[type="text"], #pmStage input:not([type]), .pm-stage input[type="text"], .pm-stage input:not([type])');
      var best = null, bestTop = 1e9;
      for (var k = 0; k < t.length; k++) {
        if (!vis(t[k]) || t[k].closest(".pm2-drawer-panel")) continue;
        var top = t[k].getBoundingClientRect().top;
        if (top < bestTop) { bestTop = top; best = t[k]; }
      }
      if (best) { el = best; strategy = "topmost visible text input in stage (top=" + Math.round(bestTop) + "px)"; }
    }
    if (!el) return { found: false, strategy: null };
    window.__pmHarnessSearchEl = el;
    return { found: true, strategy: strategy };
  });
}

/* Set the query through the page UI: focus + native value setter + input
 * event (deterministic; CONTRACT2 allows either this or key dispatch). */
function typeQuery(page, q) {
  return page.evaluate(function (q) {
    var el = window.__pmHarnessSearchEl;
    if (!el || !document.contains(el)) return false;
    el.focus();
    var proto = el.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    var d = Object.getOwnPropertyDescriptor(proto, "value");
    var set = d && d.set ? d.set : null;
    if (set) set.call(el, ""); else el.value = "";
    el.dispatchEvent(new Event("input", { bubbles: true }));
    if (set) set.call(el, q); else el.value = q;
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new KeyboardEvent("keyup", { bubbles: true, key: q.slice(-1) || "a" }));
    return true;
  }, q);
}

/* Poll for rendered, visible [data-rid] results. Returns [{rid,text}] or false. */
function waitResults(page, timeoutMs) {
  return pollInPage(page, function () {
    var out = [];
    var els = document.querySelectorAll("[data-rid]");
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      var r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) continue;
      var cs = getComputedStyle(el);
      if (cs.visibility === "hidden" || cs.display === "none") continue;
      out.push({
        rid: el.getAttribute("data-rid"),
        text: (el.innerText || "").replace(/\s+/g, " ").trim().slice(0, 160)
      });
      if (out.length >= 60) break;
    }
    return out.length ? out : null;
  }, null, timeoutMs || 3000, 100);
}

/* Click a rendered search result BY data-rid (never nth-child). Real CDP
 * mouse click on the element centre; falls back to element.click() when the
 * centre is covered. Returns {clicked, method} */
async function clickRid(page, rid) {
  const spot = await page.evaluate(function (rid) {
    var els = document.querySelectorAll("[data-rid]");
    var el = null;
    for (var i = 0; i < els.length; i++) {
      if (els[i].getAttribute("data-rid") !== rid) continue;
      var r0 = els[i].getBoundingClientRect();
      var cs = getComputedStyle(els[i]);
      if (r0.width < 2 || r0.height < 2 || cs.visibility === "hidden" || cs.display === "none") continue;
      el = els[i];
      break;
    }
    if (!el) return null;
    el.scrollIntoView({ block: "center", inline: "nearest" });
    var r = el.getBoundingClientRect();
    var x = r.left + Math.min(r.width / 2, 60);
    var y = r.top + r.height / 2;
    var hit = document.elementFromPoint(x, y);
    var covered = !(hit && (hit === el || el.contains(hit) || hit.contains(el)));
    window.__pmHarnessClickEl = el;
    return { x: x, y: y, covered: covered };
  }, rid);
  if (!spot) return { clicked: false, method: null };
  if (!spot.covered) {
    await page.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: spot.x, y: spot.y });
    await page.send("Input.dispatchMouseEvent", { type: "mousePressed", x: spot.x, y: spot.y, button: "left", clickCount: 1 });
    await page.send("Input.dispatchMouseEvent", { type: "mouseReleased", x: spot.x, y: spot.y, button: "left", clickCount: 1 });
    return { clicked: true, method: "cdp-mouse" };
  }
  const ok = await page.evaluate(function () {
    var el = window.__pmHarnessClickEl;
    if (!el || !document.contains(el)) return false;
    el.click();
    return true;
  });
  return { clicked: !!ok, method: "element.click()" };
}

async function screenshotSafe(page, file) {
  try {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    await page.screenshot(file);
    return true;
  } catch (e) {
    return false;
  }
}

async function safeClosePage(page) {
  if (!page) return;
  try {
    await Promise.race([
      page.close(),
      new Promise((resolve) => setTimeout(resolve, 8000))
    ]);
  } catch (e) { /* the browser teardown will reap it */ }
}

/* Sequential per-concept driver with existence checks + a runtime budget.
 * A concept that fails to boot (or crashes the suite body) is recorded and
 * skipped — the run always continues with the next concept. */
async function forEachConcept(ctx, budgetMs, fn) {
  for (const concept of ctx.concepts) {
    const label = "concept-" + concept.num;
    const htmlPath = path.join(FABLE_DIR, concept.stem + ".html");
    const jsPath = path.join(FABLE_DIR, concept.stem + ".js");
    if (!fs.existsSync(htmlPath)) {
      ctx.record(label, "boot", false, "page not present yet: " + concept.stem + ".html");
      continue;
    }
    if (!fs.existsSync(jsPath)) {
      ctx.record(label, "boot", false, "concept script not present yet: " + concept.stem + ".js");
      continue;
    }
    let page = null;
    try {
      page = await ctx.browser.newPage();
      await page.send("Network.setBlockedURLs", { urls: FONT_BLOCKS });
      const work = Promise.resolve().then(() => fn(page, concept, label));
      work.catch(() => { /* raced-out rejections must not crash the process */ });
      let timer = null;
      const budget = new Promise((resolve) => { timer = setTimeout(() => resolve("timeout"), budgetMs); });
      const outcome = await Promise.race([
        work.then(() => "done", (e) => ({ err: e })),
        budget
      ]);
      clearTimeout(timer);
      if (outcome === "timeout") {
        ctx.record(label, "suite-timeout", false, "per-concept budget " + budgetMs + "ms exhausted; remaining checks skipped");
      } else if (outcome && outcome.err) {
        ctx.record(label, "suite-crash", false, String((outcome.err && outcome.err.message) || outcome.err).slice(0, 400));
      }
    } catch (e) {
      ctx.record(label, "suite-crash", false, String((e && e.message) || e).slice(0, 400));
    } finally {
      await safeClosePage(page);
    }
    ctx.log(label + " done (" + ctx.suiteName + ")");
  }
}

module.exports = {
  FABLE_DIR, CONCEPTS, THEMES, WIDTHS, FONT_BLOCKS,
  fileUrl, buildHash, isHarnessNoise, snapDiagnostics,
  pollInPage, waitReady, waitRouteTokens, settle, routeAttr,
  bootConcept, hashRoute, scanOverflow, shellCheck, bodyTextSansDrawer,
  findSearchInput, typeQuery, waitResults, clickRid,
  screenshotSafe, safeClosePage, forEachConcept
};
