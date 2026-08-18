/* In-page probes shared by every suite.
 *
 * This file is injected into the page as a script and published as
 * `window.__pmProbe`; the harness then evaluates one-line calls against it. It is
 * browser code, not Node code: no require, no module scope, same ES5 dialect as the
 * pages so a syntax error can never be blamed on the harness.
 *
 * Everything here asserts what is ON SCREEN — geometry, focus, attributes — rather
 * than counting calls. A probe that trusts a dispatch count will happily pass while
 * the reader stares at a blank pane.
 */
(function () {
"use strict";

/* Wait for the concept to finish whatever it was doing. Two animation frames plus a
 * short tail covers a render scheduled from a rAF, which is how every concept here
 * batches its work. */
function settle(ms) {
  return new Promise(function (resolve) {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        setTimeout(resolve, ms || 60);
      });
    });
  });
}

function surface() {
  var el = document.querySelector("[data-pm-surface]");
  var crumb = document.querySelector("[data-pm-breadcrumb]");
  var back = document.querySelector("[data-pm-back]");
  var close = document.querySelector("[data-pm-close]");
  var project = document.querySelector("[data-pm-project]");
  var manager = document.querySelector("[data-pm-manager][data-pm-surface], [data-pm-surface=\"manager\"][data-pm-manager]");
  return {
    hash: location.hash,
    surface: el ? el.getAttribute("data-pm-surface") : null,
    managerId: manager ? manager.getAttribute("data-pm-manager") : null,
    objectId: (function () {
      var o = document.querySelector("[data-pm-object][aria-selected=\"true\"], [data-pm-object].is-selected, [data-pm-object][data-selected=\"true\"]");
      return o ? o.getAttribute("data-pm-object") : null;
    })(),
    breadcrumb: crumb ? crumb.textContent.replace(/\s+/g, " ").trim() : null,
    hasBack: !!back,
    backLabel: back ? back.textContent.replace(/\s+/g, " ").trim() : null,
    hasClose: !!close,
    project: project ? project.textContent.replace(/\s+/g, " ").trim() : null,
    title: (function () {
      var h = document.querySelector("[data-pm-surface] h1, [data-pm-surface] h2");
      return h ? h.textContent.replace(/\s+/g, " ").trim() : null;
    })()
  };
}

function goHash(hash) {
  location.hash = hash;
  return settle(90).then(surface);
}

/* True horizontal overflow, plus any element whose box escapes the app frame. A
 * concept that overflows by a pixel because of a scrollbar reservation is not a
 * failure; anything past a two-pixel tolerance is. */
function overflow() {
  var doc = document.documentElement;
  var frame = document.querySelector(".pm-app") || doc;
  var frameBox = frame.getBoundingClientRect();
  var escaped = [];
  var nodes = document.querySelectorAll("[data-pm-surface] *");
  for (var i = 0; i < nodes.length && escaped.length < 12; i++) {
    var n = nodes[i];
    if (!n.getClientRects().length) continue;
    var style = getComputedStyle(n);
    if (style.position === "fixed") continue;
    var b = n.getBoundingClientRect();
    if (b.width === 0 || b.height === 0) continue;
    if (b.right > frameBox.right + 2 || b.left < frameBox.left - 2) {
      escaped.push({
        tag: n.tagName.toLowerCase(),
        cls: (n.className && n.className.baseVal !== undefined ? n.className.baseVal : String(n.className || "")).slice(0, 60),
        left: Math.round(b.left), right: Math.round(b.right),
        text: (n.textContent || "").replace(/\s+/g, " ").trim().slice(0, 40)
      });
    }
  }
  return {
    scrollWidth: doc.scrollWidth,
    clientWidth: doc.clientWidth,
    innerWidth: window.innerWidth,
    overflowing: doc.scrollWidth > doc.clientWidth + 2,
    escaped: escaped
  };
}

/* Text that is cut off rather than wrapped or ellipsised. `overflow: hidden` with no
 * ellipsis and a scrollWidth past the client width is a clipped label. */
function clipped() {
  var out = [];
  var nodes = document.querySelectorAll("[data-pm-surface] h1, [data-pm-surface] h2, [data-pm-surface] h3, [data-pm-surface] button, [data-pm-surface] label, [data-pm-surface] [data-pm-row] *");
  for (var i = 0; i < nodes.length && out.length < 12; i++) {
    var n = nodes[i];
    if (!n.getClientRects().length) continue;
    var s = getComputedStyle(n);
    if (s.overflow === "visible" && s.overflowX === "visible") continue;
    if (s.textOverflow === "ellipsis") continue;
    if (s.overflowX === "auto" || s.overflowX === "scroll") continue;
    if (n.scrollWidth > n.clientWidth + 2 && n.clientWidth > 0) {
      out.push({
        tag: n.tagName.toLowerCase(),
        scrollWidth: n.scrollWidth, clientWidth: n.clientWidth,
        text: (n.textContent || "").replace(/\s+/g, " ").trim().slice(0, 50)
      });
    }
  }
  return out;
}

/* The activity rail must never sit on top of Settings content. Compare the rail's
 * right edge against the left edge of the Settings surface. */
function railOverlap() {
  var rail = document.querySelector(".pm-rail");
  var main = document.querySelector("[data-pm-surface]");
  if (!rail || !main || !rail.getClientRects().length) return { overlap: 0, rail: false };
  var r = rail.getBoundingClientRect();
  var m = main.getBoundingClientRect();
  return { overlap: Math.max(0, Math.round(r.right - m.left)), rail: true, railWidth: Math.round(r.width) };
}

function typeSearch(text) {
  var field = document.querySelector("[data-pm-search-field]");
  if (!field) return Promise.resolve({ error: "no search field" });
  field.focus();
  field.value = text;
  field.dispatchEvent(new Event("input", { bubbles: true }));
  return settle(140).then(function () {
    var drop = document.querySelector("[data-pm-search-dropdown]");
    var results = [];
    var nodes = document.querySelectorAll("[data-pm-result]");
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      var box = n.getBoundingClientRect();
      results.push({
        resultId: n.getAttribute("data-pm-result"),
        label: (n.textContent || "").replace(/\s+/g, " ").trim().slice(0, 120),
        visible: box.width > 0 && box.height > 0
      });
    }
    var dropBox = drop ? drop.getBoundingClientRect() : null;
    var fieldBox = field.getBoundingClientRect();
    return {
      open: !!drop && !!dropBox && dropBox.height > 0,
      count: results.length,
      results: results,
      /* The dropdown must hang directly beneath the field and stay in the viewport. */
      anchored: dropBox ? Math.abs(dropBox.top - fieldBox.bottom) < 24 : false,
      inViewport: dropBox ? (dropBox.left >= -2 && dropBox.right <= window.innerWidth + 2) : false
    };
  });
}

function openResult(resultId) {
  var node = document.querySelector('[data-pm-result="' + (window.CSS && CSS.escape ? CSS.escape(resultId) : resultId) + '"]');
  if (!node) {
    var all = document.querySelectorAll("[data-pm-result]");
    for (var i = 0; i < all.length; i++) {
      if (all[i].getAttribute("data-pm-result") === resultId) { node = all[i]; break; }
    }
  }
  if (!node) return Promise.resolve({ error: "result not rendered: " + resultId });
  var clickable = node.matches("a,button") ? node : (node.querySelector("a,button") || node);
  clickable.click();
  return settle(200).then(function () {
    var s = surface();
    var locator = document.querySelector("[data-pm-locator]");
    var focused = document.activeElement;
    var box = locator ? locator.getBoundingClientRect() : null;
    return {
      landing: s,
      locator: locator ? {
        row: locator.getAttribute("data-pm-row") || (locator.closest && locator.closest("[data-pm-row]") ? locator.closest("[data-pm-row]").getAttribute("data-pm-row") : null),
        object: locator.getAttribute("data-pm-object"),
        manager: locator.getAttribute("data-pm-manager"),
        inViewport: !!box && box.top >= -2 && box.bottom <= window.innerHeight + 2,
        top: box ? Math.round(box.top) : null
      } : null,
      focus: focused ? {
        tag: focused.tagName.toLowerCase(),
        row: focused.getAttribute && (focused.getAttribute("data-pm-control") ||
          (focused.closest && focused.closest("[data-pm-row]") ? focused.closest("[data-pm-row]").getAttribute("data-pm-row") : null)),
        isBody: focused === document.body
      } : null
    };
  });
}

function rowVisible(settingId) {
  var nodes = document.querySelectorAll("[data-pm-row]");
  for (var i = 0; i < nodes.length; i++) {
    if (nodes[i].getAttribute("data-pm-row") === settingId) {
      var b = nodes[i].getBoundingClientRect();
      return {
        found: true,
        inViewport: b.top >= -4 && b.bottom <= window.innerHeight + 4,
        top: Math.round(b.top), height: Math.round(b.height),
        hasControl: !!nodes[i].querySelector("[data-pm-control]")
      };
    }
  }
  return { found: false };
}

function hydrated() {
  var v = document.documentElement.getAttribute("data-pm-hydrated") || "";
  return v.split(/\s+/).filter(function (x) { return !!x; });
}

function domNodeCount() {
  return {
    total: document.getElementsByTagName("*").length,
    rows: document.querySelectorAll("[data-pm-row]").length,
    results: document.querySelectorAll("[data-pm-result]").length
  };
}

function counts() {
  return {
    settings: window.PM2Model ? window.PM2Model.counts.settings : null,
    families: window.PM2Model ? window.PM2Model.FAMILIES.length : null,
    extras: window.PM2Model ? window.PM2Model.EXTRA_MANAGERS.length : null,
    deferred: window.PM2Model ? window.PM2Model.DEFERRED.length : null,
    indexRecords: window.PM2Index && window.PM2Index.stats ? window.PM2Index.stats().records : null
  };
}

window.__pmProbe = {
  settle: settle,
  surface: surface,
  goHash: goHash,
  overflow: overflow,
  clipped: clipped,
  railOverlap: railOverlap,
  typeSearch: typeSearch,
  openResult: openResult,
  rowVisible: rowVisible,
  hydrated: hydrated,
  domNodeCount: domNodeCount,
  counts: counts
};
})();
