/* suite-scroll.js — scroll integrity.
 *
 * Every visual audit before this one judged static screenshots taken at
 * scroll-top, so nothing was ever scrolled and a whole class of defect was
 * invisible: concept 09 at 760 grew `#/all` to a ~46,000px scrollHeight while
 * painting only 63 rows, so everything past the first window was a blank
 * sheet. This suite drives the real scrolling element and asserts that content
 * is actually painted at every offset, and that the row window survives a
 * viewport change.
 *
 * Per concept x width x route (widths 760 and 1280 for every route, plus 900
 * for the routes that have a narrow mode — #/all, #/all?stress=1, #/dest/ai,
 * #/manager/m.providers; the concepts switch layout on stage.clientWidth at
 * 860-1020px, so 900 is a distinct band from both 760 and 1280):
 *
 *   <w>-<route>-scroller          which element actually scrolls. Concepts
 *                                 differ (#pmStage for some, an inner pane for
 *                                 others) and several keep a taller pane alive
 *                                 BEHIND a full-stage overlay, so the scroller
 *                                 is resolved from what the user can see:
 *                                 elementFromPoint over a grid across the
 *                                 stage, then the nearest scrollable ancestor
 *                                 of each hit. Every scrollable box found is
 *                                 recorded, flagged user-facing or background.
 *                                 FAILS only when nothing the user sees
 *                                 scrolls yet unclipped stage content runs past
 *                                 the viewport (clipped and unreachable).
 *   <w>-<route>-bounded-scroller  the box is not wildly taller than the content
 *                                 can honestly be. The ceiling is DERIVED, not
 *                                 hard-coded: painted-row height x the honest
 *                                 item total for the route (inventory count,
 *                                 +2,000 when the stress overlay is on; the
 *                                 painted row count for non-index routes),
 *                                 with slack. A tall spacer over a correctly
 *                                 windowed list is honest virtualization and
 *                                 passes; a box no real corpus could fill does
 *                                 not. The brief's blunt tripwire (<200 painted
 *                                 rows + >20,000px box) is recorded as a signal
 *                                 in the detail either way.
 *   <w>-<route>-no-blank-region   THE important one. The scroller is stepped
 *                                 through 9 offsets from 0 to the exact end
 *                                 (scrollTop = scrollHeight, browser-clamped).
 *                                 At each offset: count elements inside the
 *                                 scroller whose rect intersects the visible
 *                                 band and that carry real content (own text,
 *                                 media, or a painted box), and sample
 *                                 elementFromPoint at 12 points inside the
 *                                 band. Zero content elements, or zero content
 *                                 point-hits, is a blank viewport = FAIL, with
 *                                 the offset recorded. The States drawer is
 *                                 hidden for this sweep so a harness affordance
 *                                 can never stand in for page content. When a
 *                                 second deep scroller exists (nested panes) it
 *                                 gets its own shorter sweep, folded into the
 *                                 same verdict.
 *   <w>-<route>-virtualization-advances
 *                                 the painted row-id set must change as the box
 *                                 scrolls, but only where the box really is
 *                                 windowed: an empty spacer block at least half
 *                                 a viewport tall inside the scroller, or an
 *                                 index route painting far fewer rows than the
 *                                 corpus holds. A short, fully painted list
 *                                 legitimately never changes and passes with
 *                                 that note.
 *   <w>-<route>-end-content-reachable
 *                                 at maximum scroll the last row/section is in
 *                                 the band, fully visible, and not covered by a
 *                                 fixed/sticky affordance; and the gap between
 *                                 the deepest painted content and the bottom of
 *                                 the box stays inside the ~64px trailing pad
 *                                 CONTRACT2 asks for (slack: max(140px, 30% of
 *                                 the viewport band)). Run with the drawer
 *                                 VISIBLE, because "clipped under a fixed
 *                                 affordance" is exactly what it must catch.
 *   <w>-<route>-console-clean     zero console errors / page exceptions raised
 *                                 during the scrolling itself (diagnostics are
 *                                 cleared after the route settles, so render
 *                                 noise belongs to the other suites).
 *
 * Then once per concept, on #/all and #/all?stress=1 (the routes that window):
 *
 *   <route>-resize-repaint        a virtualizer that only repaints on scroll
 *                                 keeps the row count it computed for the OLD
 *                                 viewport. Measured across 1280x900 -> 760x900
 *                                 -> 1280x900 (width, crossing the narrow
 *                                 breakpoint) and then 1280x560 -> 1280x1200
 *                                 (HEIGHT ONLY, same width, so no narrow flip
 *                                 re-renders the surface and repaints the
 *                                 window as a side effect). The painted row
 *                                 count must respond to the viewport, or the
 *                                 painted rows must still hold the band — no
 *                                 blank strip along its bottom edge beyond
 *                                 max(120px, two rows).
 *   <route>-resize-stale-window   the same trap with scroll depth: scroll deep
 *                                 (up to 20,000px) at one size, resize, and the
 *                                 band must still be held — shrinking
 *                                 (1280x900 -> 760x900), growing and widening
 *                                 (760x620 -> 1280x900), and growing in height
 *                                 alone (1280x560 -> 1280x1200).
 *
 * Conventions kept: one long-lived browser from run-suite.js, one page per
 * concept via lib.forEachConcept (which records and continues past a concept
 * that will not boot, and enforces the per-concept budget), file:// only,
 * results as {concept, suite, case, pass, detail} written to
 * <out>/scroll-results.json by the runner.
 */
"use strict";

const HEIGHT = 900;
const STEPS = 9;                    /* >= 8 offsets; first is 0, last is the exact end */
const SECONDARY_STEPS = 5;
const SECONDARY_MIN_SCROLL = 2000;  /* a second scroller this deep gets its own sweep */
const DEFAULT_WIDTHS = [760, 900, 1280];
const NARROW_WIDTH = 900;
const DEEP_SCROLL = 20000;
const COVERAGE_FLOOR = 0.6;         /* painted rows must hold this much of the band */

const ROUTES = [
  { route: "home", params: {}, slug: "home", narrow: false, index: false },
  { route: "dest/ai", params: {}, slug: "dest-ai", narrow: true, index: false },
  { route: "manager/m.providers", params: {}, slug: "manager-m.providers", narrow: true, index: false },
  { route: "copy", params: {}, slug: "copy", narrow: false, index: false },
  /* the index routes go last at every width: ?stress=1 is applied without
   * pin=1 so pm2-route sets it persist:false, and the per-width reboot clears
   * the in-memory flag before the next pass. */
  { route: "all", params: {}, slug: "all", narrow: true, index: true },
  { route: "all", params: { stress: 1 }, slug: "all-stress", narrow: true, index: true }
];

const INDEX_ROUTES = ROUTES.filter((r) => r.index);

/* ===================================================================== */
/* in-page probes — each one is serialised by cdp.evaluate and must be     */
/* completely self-contained (no closure references).                      */
/* ===================================================================== */

/* Find the element that actually scrolls under what the user can SEE, plus
 * every other scrollable box for the record. Several concepts keep a taller
 * pane alive behind a full-stage overlay (c05 #/copy), so ranking by raw
 * scrollHeight alone picks a box nobody is looking at. */
function P_discover() {
  function selOf(el) {
    if (!el) return null;
    if (el === document.documentElement) return "html";
    if (el === document.body) return "body";
    var s = el.tagName.toLowerCase();
    if (el.id) s += "#" + el.id;
    var cn = String((el.getAttribute && el.getAttribute("class")) || "").trim();
    if (cn) s += "." + cn.split(/\s+/).slice(0, 3).join(".");
    return s.slice(0, 120);
  }
  function pathOf(el) {
    var parts = [], n = el, guard = 0;
    while (n && n.nodeType === 1 && guard++ < 5) {
      parts.unshift(selOf(n));
      if (n === document.documentElement || n === document.body) break;
      n = n.parentElement;
    }
    return parts.join(" > ").slice(0, 260);
  }
  function depthOf(el) { var d = 0, n = el; while (n && n.parentElement) { d++; n = n.parentElement; } return d; }
  function ownText(n) {
    for (var c = n.firstChild; c; c = c.nextSibling) {
      if (c.nodeType === 3 && /\S/.test(c.nodeValue)) return true;
    }
    return false;
  }
  function scrollable(n) {
    if (!n || n.nodeType !== 1) return false;
    if (n.scrollHeight - n.clientHeight <= 8) return false;
    var oy = getComputedStyle(n).overflowY;
    return oy === "auto" || oy === "scroll" || oy === "overlay";
  }

  var vw = window.innerWidth, vh = window.innerHeight;
  var EXCL = ".pm2-drawer-panel,.pm2-drawer-btn,[data-pm2-drawer],.pm-theme-menu";
  var de = document.scrollingElement || document.documentElement;
  var stage = document.getElementById("pmStage") || document.querySelector(".pm-stage") || document.body;

  /* ---- every scrollable box ---- */
  var cands = [];
  function push(el, kind) {
    var sh = el.scrollHeight, ch = el.clientHeight, max = sh - ch;
    if (!(max > 8)) return;
    var rect;
    if (kind === "document") {
      rect = { top: 0, left: 0, right: vw, bottom: vh, width: vw, height: vh };
    } else {
      var r = el.getBoundingClientRect();
      if (r.width < 60 || r.height < 60) return;
      if (r.bottom <= 2 || r.top >= vh - 2 || r.right <= 2 || r.left >= vw - 2) return;
      var cs = getComputedStyle(el);
      if (cs.display === "none" || cs.visibility === "hidden") return;
      rect = {
        top: Math.round(r.top), left: Math.round(r.left),
        right: Math.round(r.right), bottom: Math.round(r.bottom),
        width: Math.round(r.width), height: Math.round(r.height)
      };
    }
    cands.push({
      kind: kind, sel: selOf(el), path: pathOf(el),
      depth: kind === "document" ? 0 : depthOf(el),
      scrollHeight: sh, clientHeight: ch, maxScroll: max, rect: rect,
      userFacing: false, hitPoints: 0, el: el
    });
  }
  if (de && de.scrollHeight - de.clientHeight > 8) push(de, "document");
  var all = document.querySelectorAll("body *");
  var lim = Math.min(all.length, 14000);
  for (var i = 0; i < lim; i++) {
    var el = all[i];
    if (el === de || el === document.body) continue;
    if (el.scrollHeight - el.clientHeight <= 8) continue;   /* cheap gate before style reads */
    var oy = getComputedStyle(el).overflowY;
    if (oy !== "auto" && oy !== "scroll" && oy !== "overlay") continue;
    if (el.closest && el.closest(EXCL)) continue;
    push(el, "element");
  }

  /* ---- which of them is under the pixels the user sees ---- */
  var sr = stage.getBoundingClientRect();
  var sBand = {
    left: Math.max(0, sr.left), top: Math.max(0, sr.top),
    right: Math.min(vw, sr.right), bottom: Math.min(vh, sr.bottom)
  };
  var cols = [0.2, 0.5, 0.8], rows = [0.15, 0.4, 0.65, 0.88];
  var probedPoints = 0;
  for (var ci = 0; ci < cols.length; ci++) {
    for (var ri = 0; ri < rows.length; ri++) {
      var x = Math.round(sBand.left + (sBand.right - sBand.left) * cols[ci]);
      var y = Math.round(sBand.top + (sBand.bottom - sBand.top) * rows[ri]);
      if (x <= 0 || y <= 0 || x >= vw || y >= vh) continue;
      probedPoints++;
      var hit = document.elementFromPoint(x, y);
      if (!hit) continue;
      var n = hit, found = null;
      while (n && n.nodeType === 1) {
        if (scrollable(n) && !(n.closest && n.closest(EXCL))) { found = n; break; }
        if (n === document.body || n === document.documentElement) break;
        n = n.parentElement;
      }
      if (!found && de && de.scrollHeight - de.clientHeight > 8) found = de;
      if (!found) continue;
      for (var k = 0; k < cands.length; k++) {
        if (cands[k].el === found) { cands[k].userFacing = true; cands[k].hitPoints++; break; }
      }
    }
  }

  /* user-facing boxes first (deepest scroll first); near-equal boxes resolve
   * to the OUTER one, which is what a wheel over the pane ends up driving. */
  cands.sort(function (a, b) {
    if (a.userFacing !== b.userFacing) return a.userFacing ? -1 : 1;
    var big = Math.max(a.maxScroll, b.maxScroll);
    if (Math.abs(a.maxScroll - b.maxScroll) > big * 0.05) return b.maxScroll - a.maxScroll;
    return a.depth - b.depth;
  });

  var userFacing = cands.filter(function (c) { return c.userFacing; });
  window.__pmScrollTargets = cands.map(function (c) { return c.el; });
  window.__pmScrollEl = userFacing.length ? userFacing[0].el : null;

  /* Nothing the user sees scrolls: everything fits, or content is clipped and
   * unreachable? Content that a scrollable/clipping ancestor already contains
   * inside the viewport does not count as unreachable. */
  var noScroll = null;
  if (!userFacing.length) {
    var deepest = -1e9, deepestSel = null;
    var kids = stage.querySelectorAll("*");
    var klim = Math.min(kids.length, 9000);
    for (var q = 0; q < klim; q++) {
      var kn = kids[q];
      var kr = kn.getBoundingClientRect();
      if (kr.height < 3 || kr.width < 3) continue;
      if (!ownText(kn)) continue;
      var kcs = getComputedStyle(kn);
      if (kcs.display === "none" || kcs.visibility === "hidden" || parseFloat(kcs.opacity) === 0) continue;
      var clipped = false, a = kn.parentElement;
      while (a && a !== stage.parentElement) {
        var acs = getComputedStyle(a);
        if (/^(auto|scroll|overlay|hidden|clip)$/.test(acs.overflowY)) {
          if (a.getBoundingClientRect().bottom <= vh + 2) { clipped = true; break; }
        }
        a = a.parentElement;
      }
      if (clipped) continue;
      if (kr.bottom > deepest) { deepest = kr.bottom; deepestSel = selOf(kn); }
    }
    noScroll = {
      stage: selOf(stage),
      stageBottom: Math.round(sr.bottom),
      deepestUnclippedContentBottom: deepest > -1e9 ? Math.round(deepest) : null,
      deepestUnclippedContentSel: deepestSel,
      overflowPx: deepest > -1e9 ? Math.round(Math.max(0, deepest - Math.min(sr.bottom, vh))) : 0
    };
  }

  function strip(c) {
    return {
      kind: c.kind, sel: c.sel, path: c.path, depth: c.depth,
      scrollHeight: c.scrollHeight, clientHeight: c.clientHeight,
      maxScroll: c.maxScroll, rect: c.rect,
      userFacing: c.userFacing, hitPoints: c.hitPoints
    };
  }
  var stripped = cands.slice(0, 6).map(strip);
  var rootEl = document.querySelector("#pmStage > *") || null;
  var rootClass = rootEl ? String(rootEl.getAttribute("class") || "") : "";
  return {
    count: cands.length,
    userFacingCount: userFacing.length,
    primary: userFacing.length ? strip(userFacing[0]) : null,
    primaryIndex: userFacing.length ? cands.indexOf(userFacing[0]) : -1,
    secondary: (userFacing.length > 1 && userFacing[1].maxScroll >= 2000) ? strip(userFacing[1]) : null,
    secondaryIndex: (userFacing.length > 1 && userFacing[1].maxScroll >= 2000) ? cands.indexOf(userFacing[1]) : -1,
    candidates: stripped,
    noScroll: noScroll,
    pointsProbed: probedPoints,
    viewport: { vw: vw, vh: vh },
    conceptRootClass: rootClass.slice(0, 160),
    narrowActive: /narrow/.test(rootClass),
    route: document.documentElement.getAttribute("data-pm2-route") || ""
  };
}

/* Point __pmScrollEl at candidate <i> (used for the secondary sweep). */
function P_selectTarget(i) {
  var list = window.__pmScrollTargets || [];
  if (!list[i] || !document.contains(list[i])) return false;
  window.__pmScrollEl = list[i];
  return true;
}

/* Move the cached scroller. toEnd asks for scrollHeight so the browser clamps
 * to the exact maximum. Returns what actually happened. */
function P_scroll(cfg) {
  var el = window.__pmScrollEl;
  if (!el || !document.contains(el)) return { detached: true };
  if (cfg.toEnd) el.scrollTop = el.scrollHeight + 10000;
  else el.scrollTop = cfg.top;
  return {
    requested: cfg.toEnd ? "end" : cfg.top,
    actual: Math.round(el.scrollTop),
    scrollHeight: el.scrollHeight,
    clientHeight: el.clientHeight,
    maxScroll: el.scrollHeight - el.clientHeight
  };
}

/* Measure what is painted inside the visible band of the cached scroller. */
function P_band() {
  var el = window.__pmScrollEl;
  if (!el || !document.contains(el)) return { detached: true };

  function selOf(n) {
    if (!n) return null;
    if (n === document.documentElement) return "html";
    if (n === document.body) return "body";
    var s = n.tagName ? n.tagName.toLowerCase() : String(n.nodeName);
    if (n.id) s += "#" + n.id;
    var cn = String((n.getAttribute && n.getAttribute("class")) || "").trim();
    if (cn) s += "." + cn.split(/\s+/).slice(0, 2).join(".");
    return s.slice(0, 100);
  }
  function ownTextLen(n) {
    var t = 0;
    for (var c = n.firstChild; c; c = c.nextSibling) {
      if (c.nodeType === 3) t += c.nodeValue.replace(/\s+/g, " ").trim().length;
    }
    return t;
  }
  var MEDIA = { IMG: 1, SVG: 1, CANVAS: 1, VIDEO: 1, INPUT: 1, SELECT: 1, TEXTAREA: 1, BUTTON: 1, PROGRESS: 1, METER: 1 };
  function paintedBox(cs, rect, bandH) {
    var bg = cs.backgroundColor || "";
    var opaque = bg && bg !== "transparent" && !/rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*0\s*\)/.test(bg);
    var bordered = parseFloat(cs.borderTopWidth) > 0 || parseFloat(cs.borderBottomWidth) > 0 ||
      parseFloat(cs.borderLeftWidth) > 0 || parseFloat(cs.borderRightWidth) > 0;
    /* a full-height painted pane is the background, not content */
    return (opaque || bordered) && rect.height < bandH * 0.95;
  }

  var vw = window.innerWidth, vh = window.innerHeight;
  var isDoc = (el === document.documentElement || el === document.body || el === document.scrollingElement);
  var band;
  if (isDoc) {
    band = { left: 0, top: 0, right: vw, bottom: vh };
  } else {
    var r = el.getBoundingClientRect();
    band = {
      left: Math.max(0, r.left), top: Math.max(0, r.top),
      right: Math.min(vw, r.right), bottom: Math.min(vh, r.bottom)
    };
  }
  var bandW = band.right - band.left, bandH = band.bottom - band.top;

  /* ---- elements painted inside the band + virtualization spacers ---- */
  var nodes = el.querySelectorAll("*");
  var nlim = Math.min(nodes.length, 9000);
  var contentEls = 0, textLen = 0;
  var deepest = -1e9, deepestSel = null;
  var emptyBlockPx = 0, emptyBlockSel = null;
  var contentSample = [];
  for (var i = 0; i < nlim; i++) {
    var n = nodes[i];
    var rr = n.getBoundingClientRect();
    if (rr.height < 3 || rr.width < 3) continue;
    /* a tall element holding nothing at all is a virtualization spacer */
    if (rr.height >= bandH * 0.5 && !(n.textContent || "").trim() &&
        !n.querySelector("img,svg,canvas,video,input,select,textarea,button")) {
      if (rr.height > emptyBlockPx) { emptyBlockPx = rr.height; emptyBlockSel = selOf(n); }
    }
    var tl = ownTextLen(n);
    var isMedia = MEDIA[String(n.tagName).toUpperCase()] === 1;
    if (!tl && !isMedia) continue;
    var cs = getComputedStyle(n);
    if (cs.display === "none" || cs.visibility === "hidden" || parseFloat(cs.opacity) === 0) continue;
    if (rr.bottom > deepest) { deepest = rr.bottom; deepestSel = selOf(n); }
    var vOverlap = Math.min(rr.bottom, band.bottom) - Math.max(rr.top, band.top);
    var hOverlap = Math.min(rr.right, band.right) - Math.max(rr.left, band.left);
    if (vOverlap >= 4 && hOverlap >= 4) {
      contentEls++;
      textLen += tl;
      if (contentSample.length < 3 && tl > 2) contentSample.push(selOf(n));
    }
  }

  /* ---- elementFromPoint grid inside the band ----
   * A point that lands on a row's padding still hit content, so the hit is
   * climbed towards the scroller: the first ancestor-or-self short enough to
   * be a content block (under 95% of the band) and carrying text/media counts.
   * A virtualization spacer has no text at all, and its parents are taller
   * than the band, so the climb stops without finding content. */
  function hitIsContent(hit, bandHeight, root) {
    var node = hit, guard = 0;
    while (node && node !== root && node.nodeType === 1 && guard++ < 8) {
      var nr = node.getBoundingClientRect();
      if (nr.height >= bandHeight * 0.95) return false;   /* a container/spacer, not a content block */
      if (MEDIA[String(node.tagName).toUpperCase()] === 1) return true;
      if ((node.textContent || "").trim().length > 0) return true;
      if (node.hasAttribute && (node.hasAttribute("data-setting-id") || node.hasAttribute("data-rid") ||
        node.hasAttribute("data-object-id") || node.hasAttribute("data-section"))) return true;
      if (paintedBox(getComputedStyle(node), nr, bandHeight)) return true;
      node = node.parentElement;
    }
    return false;
  }
  var cols = [0.18, 0.5, 0.82];
  var rows = [0.08, 0.24, 0.4, 0.56, 0.72, 0.9];
  var pts = { total: 0, content: 0, blank: 0, external: 0, detail: [] };
  for (var ci = 0; ci < cols.length; ci++) {
    for (var ri = 0; ri < rows.length; ri++) {
      var x = Math.round(band.left + bandW * cols[ci]);
      var y = Math.round(band.top + bandH * rows[ri]);
      if (x <= 0 || y <= 0 || x >= vw || y >= vh) continue;
      pts.total++;
      var hit = document.elementFromPoint(x, y);
      var verdict = "blank", hs = hit ? selOf(hit) : null;
      if (!hit) {
        verdict = "blank";
      } else if (hit !== el && el.contains(hit)) {
        verdict = hitIsContent(hit, bandH, el) ? "content" : "blank";
      } else if (hit === el) {
        verdict = "blank";                       /* bare scroller surface */
      } else {
        verdict = "external";                    /* something outside the scroller overlays it */
      }
      if (verdict === "content") pts.content++;
      else if (verdict === "external") pts.external++;
      else pts.blank++;
      if (verdict !== "content" && pts.detail.length < 6) pts.detail.push({ x: x, y: y, v: verdict, hit: hs });
    }
  }

  /* ---- painted rows (stable ids only; never nth-child) + band coverage ---- */
  var rowEls = el.querySelectorAll("[data-setting-id],[data-rid],[data-object-id]");
  var ids = [], heights = [], inBand = 0, spans = [];
  var rlim = Math.min(rowEls.length, 4000);
  for (var j = 0; j < rlim; j++) {
    var re = rowEls[j];
    var rrr = re.getBoundingClientRect();
    if (rrr.height < 2) continue;
    var id = re.getAttribute("data-setting-id") || re.getAttribute("data-rid") || re.getAttribute("data-object-id");
    if (ids.length < 600) ids.push(String(id));
    heights.push(rrr.height);
    if (rrr.bottom > band.top && rrr.top < band.bottom) {
      inBand++;
      spans.push([Math.max(band.top, rrr.top), Math.min(band.bottom, rrr.bottom)]);
    }
  }
  spans.sort(function (a, b) { return a[0] - b[0]; });
  var rowTop = null, rowBottom = null;
  for (var t = 0; t < spans.length; t++) {
    if (rowTop === null || spans[t][0] < rowTop) rowTop = spans[t][0];
    if (rowBottom === null || spans[t][1] > rowBottom) rowBottom = spans[t][1];
  }
  var covered = 0, curA = null, curB = null;
  for (var s = 0; s < spans.length; s++) {
    if (curA === null) { curA = spans[s][0]; curB = spans[s][1]; continue; }
    if (spans[s][0] <= curB) { if (spans[s][1] > curB) curB = spans[s][1]; }
    else { covered += curB - curA; curA = spans[s][0]; curB = spans[s][1]; }
  }
  if (curA !== null) covered += curB - curA;
  heights.sort(function (a, b) { return a - b; });
  var medianH = heights.length ? heights[Math.floor(heights.length / 2)] : 0;
  var p90H = heights.length ? heights[Math.min(heights.length - 1, Math.floor(heights.length * 0.9))] : 0;

  return {
    ok: true,
    scrollTop: Math.round(el.scrollTop),
    scrollHeight: el.scrollHeight,
    clientHeight: el.clientHeight,
    band: {
      top: Math.round(band.top), left: Math.round(band.left),
      bottom: Math.round(band.bottom), right: Math.round(band.right),
      w: Math.round(bandW), h: Math.round(bandH)
    },
    contentEls: contentEls,
    textLen: textLen,
    contentSample: contentSample,
    deepestContentBottom: deepest > -1e9 ? Math.round(deepest) : null,
    deepestContentSel: deepestSel,
    emptyBlockPx: Math.round(emptyBlockPx),
    emptyBlockSel: emptyBlockSel,
    points: pts,
    rows: {
      painted: heights.length, inBand: inBand,
      medianH: Math.round(medianH), p90H: Math.round(p90H),
      bandCoverage: bandH > 0 ? Math.round((covered / bandH) * 100) / 100 : null,
      /* empty strip between the last painted row and the bottom of the band —
       * the shape a stale row window leaves behind */
      topGapPx: rowTop === null ? null : Math.round(rowTop - band.top),
      bottomGapPx: rowBottom === null ? null : Math.round(band.bottom - rowBottom),
      ids: ids
    },
    atEnd: el.scrollTop >= el.scrollHeight - el.clientHeight - 4,
    sections: el.querySelectorAll("[data-section]").length
  };
}

/* At maximum scroll: is the last row/section reachable, whole, and unoccluded,
 * and does painted content actually reach the bottom of the box? */
function P_end() {
  var el = window.__pmScrollEl;
  if (!el || !document.contains(el)) return { detached: true };

  function selOf(n) {
    if (!n) return null;
    if (n === document.documentElement) return "html";
    if (n === document.body) return "body";
    var s = n.tagName ? n.tagName.toLowerCase() : String(n.nodeName);
    if (n.id) s += "#" + n.id;
    var cn = String((n.getAttribute && n.getAttribute("class")) || "").trim();
    if (cn) s += "." + cn.split(/\s+/).slice(0, 2).join(".");
    return s.slice(0, 100);
  }
  function ownTextLen(n) {
    var t = 0;
    for (var c = n.firstChild; c; c = c.nextSibling) {
      if (c.nodeType === 3) t += c.nodeValue.replace(/\s+/g, " ").trim().length;
    }
    return t;
  }
  var MEDIA = { IMG: 1, SVG: 1, CANVAS: 1, VIDEO: 1, INPUT: 1, SELECT: 1, TEXTAREA: 1, BUTTON: 1 };

  var vw = window.innerWidth, vh = window.innerHeight;
  var isDoc = (el === document.documentElement || el === document.body || el === document.scrollingElement);
  var band;
  if (isDoc) band = { left: 0, top: 0, right: vw, bottom: vh };
  else {
    var r0 = el.getBoundingClientRect();
    band = {
      left: Math.max(0, r0.left), top: Math.max(0, r0.top),
      right: Math.min(vw, r0.right), bottom: Math.min(vh, r0.bottom)
    };
  }
  var bandH = band.bottom - band.top;

  /* last addressable row/section in DOM order; else deepest content element */
  var marks = el.querySelectorAll("[data-setting-id],[data-rid],[data-object-id],[data-section]");
  var last = null, lastKind = null;
  for (var i = marks.length - 1; i >= 0; i--) {
    var mr = marks[i].getBoundingClientRect();
    if (mr.height >= 2 && mr.width >= 2) { last = marks[i]; lastKind = "marked"; break; }
  }
  var deepest = -1e9, deepestSel = null, deepestEl = null;
  var nodes = el.querySelectorAll("*");
  var nlim = Math.min(nodes.length, 9000);
  for (var k = 0; k < nlim; k++) {
    var n = nodes[k];
    var rr = n.getBoundingClientRect();
    if (rr.height < 3 || rr.width < 3) continue;
    if (!ownTextLen(n) && MEDIA[String(n.tagName).toUpperCase()] !== 1) continue;
    var cs = getComputedStyle(n);
    if (cs.display === "none" || cs.visibility === "hidden" || parseFloat(cs.opacity) === 0) continue;
    if (rr.bottom > deepest) { deepest = rr.bottom; deepestSel = selOf(n); deepestEl = n; }
  }
  if (!last) { last = deepestEl; lastKind = "deepest-content"; }
  if (!last) {
    return {
      ok: true, found: false,
      band: { top: Math.round(band.top), bottom: Math.round(band.bottom), h: Math.round(bandH) },
      deepestContentBottom: null, trailingGap: null,
      scrollTop: Math.round(el.scrollTop), scrollHeight: el.scrollHeight, clientHeight: el.clientHeight
    };
  }

  /* Does the scroll viewport itself fit the window? A pane taller than the
   * space it was given paints its own last rows off-window, which no amount of
   * scrolling INSIDE it can fix. Record the nearest scrollable ancestor too,
   * so the report can say whether an outer box could still reach them. */
  var selfRect = isDoc ? { top: 0, bottom: vh } : el.getBoundingClientRect();
  var belowWindowPx = Math.max(0, Math.round(selfRect.bottom - vh));
  var ancInfo = null, anc = isDoc ? null : el.parentElement;
  while (anc && anc.nodeType === 1) {
    if (anc.scrollHeight - anc.clientHeight > 8) {
      var aoy = getComputedStyle(anc).overflowY;
      if (aoy === "auto" || aoy === "scroll" || aoy === "overlay") {
        ancInfo = {
          sel: selOf(anc), maxScroll: anc.scrollHeight - anc.clientHeight,
          scrollTop: Math.round(anc.scrollTop)
        };
        break;
      }
    }
    if (anc === document.body || anc === document.documentElement) break;
    anc = anc.parentElement;
  }

  var lr = last.getBoundingClientRect();
  var occluders = [];
  var xs = [lr.left + lr.width * 0.2, lr.left + lr.width * 0.5, lr.left + lr.width * 0.8];
  var yc = lr.top + lr.height / 2;
  var covered = 0, sampled = 0;
  for (var xi = 0; xi < xs.length; xi++) {
    var x = Math.round(xs[xi]), y = Math.round(yc);
    if (x <= 0 || y <= 0 || x >= vw || y >= vh) continue;
    sampled++;
    var hit = document.elementFromPoint(x, y);
    if (!hit) { covered++; occluders.push({ x: x, y: y, sel: null, position: null }); continue; }
    if (hit === last || last.contains(hit) || hit.contains(last)) continue;
    covered++;
    occluders.push({ x: x, y: y, sel: selOf(hit), position: getComputedStyle(hit).position });
  }

  return {
    ok: true,
    found: true,
    kind: lastKind,
    sel: selOf(last),
    id: last.getAttribute("data-setting-id") || last.getAttribute("data-rid") ||
      last.getAttribute("data-object-id") || last.getAttribute("data-section") || null,
    rect: { top: Math.round(lr.top), bottom: Math.round(lr.bottom), left: Math.round(lr.left), right: Math.round(lr.right), h: Math.round(lr.height) },
    band: { top: Math.round(band.top), bottom: Math.round(band.bottom), h: Math.round(bandH) },
    inBand: lr.bottom > band.top + 2 && lr.top < band.bottom - 2,
    fullyVisible: lr.top >= band.top - 2 && lr.bottom <= band.bottom + 2,
    tallerThanBand: lr.height > bandH,
    occluders: occluders,
    occludedPoints: covered,
    sampledPoints: sampled,
    fixedOccluder: occluders.some(function (o) { return o.position === "fixed" || o.position === "sticky"; }),
    scrollerRect: { top: Math.round(selfRect.top), bottom: Math.round(selfRect.bottom) },
    scrollerBelowWindowPx: belowWindowPx,
    windowHeight: vh,
    nearestScrollableAncestor: ancInfo,
    deepestContentBottom: deepest > -1e9 ? Math.round(deepest) : null,
    deepestContentSel: deepestSel,
    trailingGap: deepest > -1e9 ? Math.round(band.bottom - deepest) : null,
    scrollTop: Math.round(el.scrollTop),
    scrollHeight: el.scrollHeight,
    clientHeight: el.clientHeight
  };
}

/* Hide / restore the floating States drawer (a harness affordance, not
 * Settings UI) so it can neither stand in for page content nor be miscounted
 * as an occluder during the blank sweep. */
function P_drawer(hide) {
  var els = document.querySelectorAll(".pm2-drawer-panel,.pm2-drawer-btn,[data-pm2-drawer]");
  if (hide) {
    window.__pmDrawerPrev = [];
    for (var i = 0; i < els.length; i++) {
      window.__pmDrawerPrev.push(els[i].style.display);
      els[i].style.display = "none";
    }
    return els.length;
  }
  var prev = window.__pmDrawerPrev || [];
  for (var j = 0; j < els.length; j++) els[j].style.display = prev[j] === undefined ? "" : prev[j];
  window.__pmDrawerPrev = null;
  return els.length;
}

/* Honest corpus size for the route: inventory total (+ the stress overlay's
 * 2,000 synthetic records when it is active). Used to DERIVE the bounded-box
 * ceiling instead of hard-coding a pixel number. */
function P_corpus() {
  var inv = 0, stress = 0, stressActive = false;
  try { inv = Number(window.PM2_INVENTORY && window.PM2_INVENTORY.settingsCount) || 0; } catch (e) { inv = 0; }
  try {
    var data = (window.PM2 && window.PM2.store && window.PM2.store.data) || null;
    if (data && data.stress) { stressActive = !!data.stress.active; stress = Number(data.stress.count) || 0; }
  } catch (e) { /* optional */ }
  if (!stressActive) {
    try { stressActive = /[?&]stress=1(&|$)/.test(String(window.location.hash || "")); } catch (e) { /* ignore */ }
    if (stressActive && !stress) stress = 2000;
  }
  return { inventory: inv, stressActive: stressActive, stressCount: stressActive ? stress : 0 };
}

/* Count resize events the page actually received (proves setViewport fires a
 * real resize, so a stale window is the concept's, not the harness's). */
function P_resizeCounter() {
  if (window.__pmResizeCount === undefined) {
    window.__pmResizeCount = 0;
    window.addEventListener("resize", function () { window.__pmResizeCount++; }, { passive: true });
  }
  return { count: window.__pmResizeCount, innerWidth: window.innerWidth, innerHeight: window.innerHeight };
}

/* ===================================================================== */
/* node side                                                              */
/* ===================================================================== */

function widthsFor(ctx) {
  /* run-suite defaults ctx.widths to lib.WIDTHS (all six); only an explicit
   * --widths= subset overrides this suite's own width policy. */
  const explicit = Array.isArray(ctx.widths) && ctx.widths.length !== ctx.lib.WIDTHS.length;
  const w = explicit ? ctx.widths.slice() : DEFAULT_WIDTHS.slice();
  w.sort((a, b) => a - b);
  return w;
}

function routesFor(width) {
  if (width === NARROW_WIDTH) return ROUTES.filter((r) => r.narrow);
  return ROUTES;
}

/* Step one scroller from 0 to the exact end, measuring at each offset. */
async function sweep(page, L, steps, maxScroll) {
  const frames = [];
  for (let i = 0; i < steps; i++) {
    const toEnd = (i === steps - 1);
    const top = toEnd ? 0 : Math.round((maxScroll * i) / (steps - 1));
    const set = await page.evaluate(P_scroll, { top, toEnd });
    if (set && set.detached) { frames.push({ requested: toEnd ? "end" : top, detached: true }); break; }
    await L.settle(page, 150);
    const band = await page.evaluate(P_band);
    frames.push({ requested: toEnd ? "end" : top, set, band });
  }
  return frames;
}

function blankVerdict(frame) {
  if (!frame || frame.detached) return { blank: true, why: "scroller detached mid-scroll" };
  const b = frame.band || frame;
  if (!b || b.detached) return { blank: true, why: "scroller detached before measurement" };
  const p = b.points || { total: 0, content: 0, external: 0 };
  if (b.contentEls === 0) {
    return { blank: true, why: "no painted content element intersects the visible band" };
  }
  if (p.total > 0 && p.content === 0) {
    return {
      blank: true,
      why: "every elementFromPoint sample in the band hit blank surface" +
        (p.external ? " or chrome outside the scroller" : "")
    };
  }
  if (b.contentEls <= 2 && b.textLen < 40 && p.content <= 1) {
    return { blank: true, why: "near-blank band (" + b.contentEls + " content els, " + b.textLen + " chars, " + p.content + "/" + p.total + " point hits)" };
  }
  return { blank: false };
}

function frameSummary(f) {
  if (!f || f.detached) return { at: f ? f.requested : null, detached: true };
  const b = f.band || {};
  return {
    at: f.requested,
    scrollTop: b.scrollTop,
    scrollHeight: b.scrollHeight,
    contentEls: b.contentEls,
    textLen: b.textLen,
    pointHits: b.points ? (b.points.content + "/" + b.points.total) : null,
    rowsPainted: b.rows ? b.rows.painted : null,
    rowsInBand: b.rows ? b.rows.inBand : null,
    rowBandCoverage: b.rows ? b.rows.bandCoverage : null
  };
}

async function runCell(ctx, page, label, width, spec) {
  const L = ctx.lib;
  const kase = (name) => width + "-" + spec.slug + "-" + name;

  await L.hashRoute(page, spec.route, spec.params, 420);
  await L.settle(page, 240);

  /* diagnostics from here on belong to the scrolling itself */
  page.clearDiagnostics();

  /* the States drawer is a harness affordance: hidden for discovery and the
   * blank sweep, restored before the end-of-scroll occlusion check */
  await page.evaluate(P_drawer, true);

  const disc = await page.evaluate(P_discover);
  const corpus = await page.evaluate(P_corpus);

  const scrollerDetail = {
    route: disc.route,
    narrowActive: disc.narrowActive,
    conceptRootClass: disc.conceptRootClass,
    scrollableBoxes: disc.count,
    userFacingScrollers: disc.userFacingCount,
    primary: disc.primary,
    otherCandidates: disc.candidates.filter((c) => !disc.primary || c.path !== disc.primary.path),
    corpus
  };

  if (!disc.primary) {
    await page.evaluate(P_drawer, false);
    const clippedPx = (disc.noScroll && disc.noScroll.overflowPx) || 0;
    const clipped = clippedPx > 40;
    ctx.record(label, kase("scroller"), !clipped, Object.assign({
      found: false,
      verdict: clipped
        ? "nothing the user sees scrolls, yet unclipped stage content runs " + clippedPx + "px past the viewport (unreachable)"
        : "no user-facing scrolling element; the visible surface fits the viewport",
      noScroll: disc.noScroll
    }, scrollerDetail));
    const na = { skipped: "n/a — nothing the user sees scrolls on this route/width", scroller: null };
    ctx.record(label, kase("bounded-scroller"), true, na);
    ctx.record(label, kase("no-blank-region"), true, na);
    ctx.record(label, kase("virtualization-advances"), true, na);
    ctx.record(label, kase("end-content-reachable"), true, na);
    const diag0 = L.snapDiagnostics(page);
    ctx.record(label, kase("console-clean"), diag0.errors.length === 0 && diag0.pageErrors.length === 0, {
      errors: diag0.errors.slice(0, 4), pageErrors: diag0.pageErrors.slice(0, 4), warnings: diag0.warnings.slice(0, 4)
    });
    return;
  }

  ctx.record(label, kase("scroller"), true, Object.assign({ found: true }, scrollerDetail));

  /* ---------------- blank-region sweep (drawer hidden) ---------------- */
  if (disc.primaryIndex >= 0) await page.evaluate(P_selectTarget, disc.primaryIndex);
  const frames = await sweep(page, L, STEPS, disc.primary.maxScroll);
  const blanks = [];
  frames.forEach((f) => {
    const v = blankVerdict(f);
    if (v.blank) blanks.push({ offset: f.requested, actual: f.band ? f.band.scrollTop : null, why: v.why, frame: frameSummary(f) });
  });

  /* a second deep user-facing scroller (nested panes) gets its own sweep */
  let secondary = null;
  if (disc.secondary && disc.secondary.maxScroll >= SECONDARY_MIN_SCROLL && disc.secondaryIndex >= 0) {
    const picked = await page.evaluate(P_selectTarget, disc.secondaryIndex);
    if (picked) {
      const f2 = await sweep(page, L, SECONDARY_STEPS, disc.secondary.maxScroll);
      const b2 = [];
      f2.forEach((f) => { const v = blankVerdict(f); if (v.blank) b2.push({ offset: f.requested, why: v.why, frame: frameSummary(f) }); });
      secondary = { scroller: disc.secondary.path, maxScroll: disc.secondary.maxScroll, offsets: f2.map(frameSummary), blankOffsets: b2 };
      await page.evaluate(P_scroll, { top: 0, toEnd: false });
      await page.evaluate(P_selectTarget, disc.primaryIndex);
      await page.evaluate(P_scroll, { top: 0, toEnd: true });   /* back to the primary's end */
      await L.settle(page, 150);
    }
  }
  await page.evaluate(P_drawer, false);

  const secondaryBlank = !!(secondary && secondary.blankOffsets.length);
  ctx.record(label, kase("no-blank-region"), blanks.length === 0 && !secondaryBlank, {
    scroller: disc.primary.path,
    scrollHeight: disc.primary.scrollHeight,
    clientHeight: disc.primary.clientHeight,
    maxScroll: disc.primary.maxScroll,
    offsetsProbed: frames.length,
    blankOffsets: blanks,
    offsets: frames.map(frameSummary),
    secondaryScroller: secondary
  });

  /* ---------------- bounded scroller ---------------- */
  const withRows = frames.filter((f) => f.band && f.band.rows && f.band.rows.painted > 0);
  const maxPainted = withRows.reduce((m, f) => Math.max(m, f.band.rows.painted), 0);
  const rowH = withRows.reduce((m, f) => Math.max(m, f.band.rows.p90H || 0), 0);
  const liveScrollHeight = frames.reduce((m, f) => Math.max(m, (f.band && f.band.scrollHeight) || 0), disc.primary.scrollHeight);
  const clientHeight = disc.primary.clientHeight;
  const spacerPx = frames.reduce((m, f) => Math.max(m, (f.band && f.band.emptyBlockPx) || 0), 0);
  const paintedExtent = maxPainted * rowH;
  const honestItems = spec.index
    ? (corpus.inventory || 828) + (corpus.stressActive ? (corpus.stressCount || 2000) : 0)
    : Math.max(maxPainted, 400);
  const derivedCeiling = clientHeight + 1500 + honestItems * (rowH || 56) * 1.6;
  const matchesPainted = paintedExtent + clientHeight + 2000 >= liveScrollHeight;
  const boundedPass = maxPainted === 0
    ? true                                        /* no row-bearing list: no derivable ceiling here */
    : (matchesPainted || liveScrollHeight <= derivedCeiling);
  ctx.record(label, kase("bounded-scroller"), boundedPass, {
    scroller: disc.primary.path,
    scrollHeight: liveScrollHeight,
    clientHeight,
    paintedRowsMax: maxPainted,
    rowHeightP90: rowH,
    paintedExtentPx: Math.round(paintedExtent),
    honestItemCeiling: honestItems,
    derivedCeilingPx: Math.round(derivedCeiling),
    basis: maxPainted === 0
      ? "no [data-setting-id]/[data-rid]/[data-object-id] rows on this route — box bounds are covered by no-blank-region + end-content-reachable"
      : (matchesPainted
        ? "box matches the painted content (not virtualized, or spacer within a viewport of the content)"
        : "box implies virtualization; ceiling = clientHeight + 1500 + honestItems x p90RowHeight x 1.6"),
    /* the brief's blunt tripwire, recorded either way so a human sees it */
    signal_lt200rows_over20kBox: maxPainted > 0 && maxPainted < 200 && liveScrollHeight > 20000
  });

  /* ---------------- virtualization advances ---------------- */
  const idSets = frames.filter((f) => f.band && f.band.rows).map((f) => f.band.rows.ids || []);
  if (!idSets.length || maxPainted === 0) {
    ctx.record(label, kase("virtualization-advances"), true, {
      skipped: "n/a — no row-bearing list on this route",
      scroller: disc.primary.path
    });
  } else {
    const first = new Set(idSets[0]);
    const union = new Set();
    idSets.forEach((s) => s.forEach((id) => union.add(id)));
    const firstSig = idSets[0].join("");
    let distinctFrames = 0;
    idSets.forEach((s) => { if (s.join("") !== firstSig) distinctFrames++; });
    /* the box is only WINDOWED when there is real evidence of it: an empty
     * spacer block at least half a viewport tall, or an index route painting
     * far fewer rows than the corpus holds inside a much taller box. A manager
     * page with nine rows and a lot of prose is not a windowed list. */
    const spacerEvidence = spacerPx >= clientHeight * 0.5;
    const indexEvidence = spec.index && maxPainted < honestItems * 0.5 && liveScrollHeight > paintedExtent * 2;
    const looksWindowed = spacerEvidence || indexEvidence;
    const advanced = union.size > first.size || distinctFrames > 0;
    ctx.record(label, kase("virtualization-advances"), !looksWindowed || advanced, {
      scroller: disc.primary.path,
      paintedRowsAtTop: idSets[0].length,
      paintedRowsMax: maxPainted,
      uniqueRowIdsAcrossOffsets: union.size,
      framesWithADifferentWindow: distinctFrames,
      offsetsProbed: idSets.length,
      looksWindowed,
      windowingEvidence: { spacerPx: Math.round(spacerPx), spacerEvidence, indexEvidence, honestItems },
      verdict: looksWindowed
        ? (advanced
          ? "windowed list advanced its painted window while scrolling"
          : "BOX IS WINDOWED (" + Math.round(paintedExtent) + "px of painted rows plus a " + Math.round(spacerPx) +
            "px empty spacer in a " + liveScrollHeight + "px box) BUT the painted row set never changed across " +
            idSets.length + " offsets — everything past the first window is blank")
        : "list is fully painted (painted extent " + Math.round(paintedExtent) + "px of a " + liveScrollHeight +
          "px box, largest empty block " + Math.round(spacerPx) + "px); an unchanging row set is correct here"
    });
  }

  /* ---------------- end of scroll: nothing lost ---------------- */
  await page.evaluate(P_scroll, { top: 0, toEnd: true });
  await L.settle(page, 180);
  const end = await page.evaluate(P_end);
  if (end.detached) {
    ctx.record(label, kase("end-content-reachable"), false, { verdict: "scroller detached before the end-of-scroll check" });
  } else {
    const slack = Math.max(140, Math.round((end.clientHeight || clientHeight) * 0.3));
    const gapOk = end.trailingGap === null ? false : end.trailingGap <= slack;
    const lastOk = end.found && end.inBand && (end.fullyVisible || end.tallerThanBand) && !end.fixedOccluder;
    ctx.record(label, kase("end-content-reachable"), gapOk && lastOk, {
      scroller: disc.primary.path,
      atScrollTop: end.scrollTop,
      scrollHeight: end.scrollHeight,
      lastMark: end.found ? { kind: end.kind, sel: end.sel, id: end.id, rect: end.rect } : null,
      band: end.band,
      inBand: end.inBand,
      fullyVisible: end.fullyVisible,
      tallerThanBand: end.tallerThanBand,
      occluders: end.occluders,
      fixedOccluder: end.fixedOccluder,
      scrollerRect: end.scrollerRect,
      scrollerBelowWindowPx: end.scrollerBelowWindowPx,
      windowHeight: end.windowHeight,
      nearestScrollableAncestor: end.nearestScrollableAncestor,
      deepestContentBottom: end.deepestContentBottom,
      deepestContentSel: end.deepestContentSel,
      trailingGapPx: end.trailingGap,
      trailingGapSlackPx: slack,
      verdict: (gapOk && lastOk)
        ? "last row/section reachable and whole at maximum scroll"
        : [
          gapOk ? null : (end.trailingGap === null
            ? "no painted content found anywhere inside the scroller at maximum scroll"
            : "painted content stops " + end.trailingGap + "px above the bottom of the box (slack " + slack + "px)"),
          end.found ? null : "no addressable last row/section found",
          (end.found && !end.inBand) ? "last row/section is outside the visible band at maximum scroll" : null,
          (end.found && end.inBand && !end.fullyVisible && !end.tallerThanBand) ? "last row/section is clipped by the band edge" : null,
          end.fixedOccluder ? "last row/section is covered by a fixed/sticky affordance" : null,
          end.scrollerBelowWindowPx > 8
            ? "root cause: the scroll viewport is itself " + end.scrollerBelowWindowPx +
              "px taller than the space below it, so its own last rows paint off-window" +
              (end.nearestScrollableAncestor
                ? " (an ancestor " + end.nearestScrollableAncestor.sel + " can still scroll " +
                  end.nearestScrollableAncestor.maxScroll + "px, so the rows are recoverable but not where the list says they are)"
                : " and no ancestor can scroll them into view")
            : null
        ].filter(Boolean).join("; ")
    });
  }

  /* ---------------- console ---------------- */
  const diag = L.snapDiagnostics(page);
  ctx.record(label, kase("console-clean"), diag.errors.length === 0 && diag.pageErrors.length === 0, {
    errors: diag.errors.slice(0, 4),
    pageErrors: diag.pageErrors.slice(0, 4),
    warnings: diag.warnings.slice(0, 4)
  });

  /* leave the scroller at rest so the next route starts clean */
  await page.evaluate(P_scroll, { top: 0, toEnd: false });
}

/* Re-resolve the scroller after a viewport change (the pane may have been
 * rebuilt) and measure the band. */
async function remeasure(page, L, settleMs) {
  await L.settle(page, settleMs || 420);
  const disc = await page.evaluate(P_discover);
  if (!disc.primary || disc.primaryIndex < 0) return { disc, band: null };
  await page.evaluate(P_selectTarget, disc.primaryIndex);
  const band = await page.evaluate(P_band);
  return { disc, band };
}

function sizeSummary(step) {
  const b = step.band;
  const pc = (b && b.points && b.points.total) ? b.points.content / b.points.total : null;
  return {
    at: step.at,
    scroller: step.disc.primary ? step.disc.primary.path : null,
    scrollTop: b ? b.scrollTop : null,
    scrollHeight: b ? b.scrollHeight : null,
    clientHeight: b ? b.clientHeight : null,
    rowsPainted: b && b.rows ? b.rows.painted : null,
    rowsInBand: b && b.rows ? b.rows.inBand : null,
    rowBandCoverage: b && b.rows ? b.rows.bandCoverage : null,
    rowBottomGapPx: b && b.rows ? b.rows.bottomGapPx : null,
    rowMedianH: b && b.rows ? b.rows.medianH : null,
    atEnd: b ? !!b.atEnd : null,
    contentEls: b ? b.contentEls : null,
    pointHits: b && b.points ? (b.points.content + "/" + b.points.total) : null,
    pointCoverage: pc === null ? null : Math.round(pc * 100) / 100,
    blank: b ? blankVerdict({ band: b }) : { blank: true, why: "no user-facing scroller at this size" }
  };
}

/* A row window sized for a SMALLER viewport leaves an empty strip along the
 * bottom of the band. Trailing padding at the very end of the scroll is
 * legitimate (CONTRACT2 asks for ~64px), so this only applies mid-scroll. */
function staleBottomStrip(s) {
  if (!s.rowsPainted || s.rowBottomGapPx === null || s.atEnd) return null;
  const limit = Math.max(120, 2 * (s.rowMedianH || 56));
  return s.rowBottomGapPx > limit
    ? { bottomGapPx: s.rowBottomGapPx, limitPx: limit, at: s.at }
    : null;
}

/* Is the visible band actually held by painted content at this size? Rows are
 * the sharpest signal when the surface has addressable rows at all — the
 * stress overlay's zz-stress.* records are not settings and carry no
 * [data-setting-id], so a row count of zero means "no row metric here", not
 * "nothing painted". The elementFromPoint grid is the general fallback. */
function bandHeld(s) {
  if (s.blank.blank) return false;
  if (s.pointCoverage !== null && s.pointCoverage < COVERAGE_FLOOR) return false;
  if (staleBottomStrip(s)) return false;
  if (s.rowsPainted) return s.rowBandCoverage === null || s.rowBandCoverage >= COVERAGE_FLOOR;
  return true;
}

/* The trap the c09 fix exposed: paintWindow() sizes the row window from the
 * viewport but only ever runs on scroll, so after a resize the window keeps
 * the count computed for the OLD viewport. Looks fine at scroll-top, blank as
 * soon as the band grows or the rows change height. */
async function runResizePass(ctx, page, concept, label) {
  const L = ctx.lib;
  for (const spec of INDEX_ROUTES) {
    /* ---- (a) 1280 -> (b) 760 -> (c) 1280, mid-scroll ---- */
    await page.setViewport(1280, HEIGHT);
    const ready = await L.bootConcept(page, concept, spec.route, spec.params, { width: 1280, height: HEIGHT });
    if (!ready) {
      ctx.record(label, spec.slug + "-resize-repaint", false, "data-pm-state=ready never appeared at 1280 for " + spec.slug);
      ctx.record(label, spec.slug + "-resize-stale-window", false, "boot failed; not measured");
      continue;
    }
    await page.evaluate(P_resizeCounter);
    await page.evaluate(P_drawer, true);

    let step = await remeasure(page, L, 300);
    if (!step.disc.primary) {
      ctx.record(label, spec.slug + "-resize-repaint", true, {
        skipped: "n/a — nothing the user sees scrolls on " + spec.slug + " at 1280",
        candidates: step.disc.candidates
      });
      ctx.record(label, spec.slug + "-resize-stale-window", true, { skipped: "n/a — no user-facing scroller at 1280" });
      await page.evaluate(P_drawer, false);
      continue;
    }
    const mid = Math.round(step.disc.primary.maxScroll * 0.5);
    await page.evaluate(P_scroll, { top: mid, toEnd: false });
    await L.settle(page, 200);
    const seq = [{ at: "1280x900", disc: step.disc, band: await page.evaluate(P_band) }];

    /* width sweep — crosses the concepts' narrow breakpoint */
    await page.setViewport(760, HEIGHT);
    step = await remeasure(page, L, 520);
    seq.push({ at: "760x900", disc: step.disc, band: step.band });
    await page.setViewport(1280, HEIGHT);
    step = await remeasure(page, L, 520);
    seq.push({ at: "1280x900 (back)", disc: step.disc, band: step.band });

    /* height sweep at a FIXED width — a narrow/wide flip re-renders the whole
     * surface and would repaint the window as a side effect, hiding a
     * virtualizer that never listens for resize. Changing only the height
     * leaves the layout alone, so the row window must respond on its own. */
    await page.setViewport(1280, 560);
    step = await remeasure(page, L, 520);
    seq.push({ at: "1280x560 (height only)", disc: step.disc, band: step.band });
    await page.setViewport(1280, 1200);
    step = await remeasure(page, L, 520);
    seq.push({ at: "1280x1200 (height only)", disc: step.disc, band: step.band });

    const resizeEvents = await page.evaluate(P_resizeCounter);
    const sizes = seq.map(sizeSummary);
    const counts = sizes.map((s) => s.rowsPainted);
    const countChanged = new Set(counts.filter((n) => n)).size > 1;
    const coveredEverywhere = sizes.every(bandHeld);
    ctx.record(label, spec.slug + "-resize-repaint", countChanged || coveredEverywhere, {
      sequence: sizes,
      paintedRowCounts: counts,
      rowCountRespondedToViewport: countChanged,
      bandCoveredAtEverySize: coveredEverywhere,
      staleBottomStrips: sizes.map(staleBottomStrip).filter(Boolean),
      coverageFloor: COVERAGE_FLOOR,
      resizeEventsSeenByPage: resizeEvents,
      verdict: (countChanged || coveredEverywhere)
        ? (countChanged
          ? "row window recomputed across the viewport change"
          : "row window count is viewport-independent here, but the painted rows still cover the band at every size")
        : (counts.some((n) => n)
          ? "row window kept the count computed for the OLD viewport across " + resizeEvents.count +
            " real resize events AND left the band uncovered — the virtualizer repaints on scroll only"
          : "the band was left uncovered after " + resizeEvents.count +
            " real resize events (no addressable rows on this surface, so the verdict rests on band coverage)")
    });

    /* ---- stale-window trap: scroll deep, THEN resize ---- */
    const traps = [];
    const runs = [
      { from: [1280, 900], to: [760, 900], name: "deep at 1280x900 then narrow to 760x900" },
      { from: [760, 620], to: [1280, 900], name: "deep at 760x620 then grow to 1280x900" },
      /* the sharp one: same width, so nothing re-renders as a side effect —
       * only a virtualizer that watches its own viewport survives it */
      { from: [1280, 560], to: [1280, 1200], name: "deep at 1280x560 then grow height only to 1280x1200" }
    ];
    for (let ri = 0; ri < runs.length; ri++) {
      const r = runs[ri];
      await page.setViewport(r.from[0], r.from[1]);
      let s = await remeasure(page, L, 520);
      if (!s.disc.primary) { traps.push({ run: r.name, skipped: "no user-facing scroller at " + r.from.join("x") }); continue; }
      /* Two hops to a per-run offset. A windowed list typically skips the
       * repaint when the first index and the row count both match the last
       * paint, so landing on the same offset every run would leave the window
       * sized for whatever viewport painted it earlier — the trap has to make
       * the list paint a window for THIS viewport before the resize. */
      const deep = Math.min(DEEP_SCROLL + ri * 1700, s.disc.primary.maxScroll);
      await page.evaluate(P_scroll, { top: Math.max(0, deep - 900), toEnd: false });
      await L.settle(page, 180);
      await page.evaluate(P_scroll, { top: deep, toEnd: false });
      await L.settle(page, 220);
      const before = { at: r.from.join("x") + " @ " + deep, disc: s.disc, band: await page.evaluate(P_band) };
      await page.setViewport(r.to[0], r.to[1]);
      s = await remeasure(page, L, 560);
      const after = { at: r.to.join("x") + " (after resize)", disc: s.disc, band: s.band };
      const aS = sizeSummary(before), bS = sizeSummary(after);
      traps.push({ run: r.name, deepScrollTo: deep, before: aS, after: bS, pass: bandHeld(bS) });
    }
    const trapPass = traps.every((t) => t.skipped || t.pass);
    ctx.record(label, spec.slug + "-resize-stale-window", trapPass, {
      runs: traps,
      coverageFloor: COVERAGE_FLOOR,
      verdict: trapPass
        ? "visible band stayed covered after resizing at depth"
        : "the band went blank/uncovered after a resize at scroll depth — the painted window is stale"
    });

    await page.evaluate(P_drawer, false);
  }
  await page.setViewport(1280, HEIGHT);
}

async function run(ctx) {
  const L = ctx.lib;
  const widths = widthsFor(ctx);
  ctx.log("widths " + widths.join(",") + " (900 = narrow-mode routes only), routes " +
    ROUTES.map((r) => r.slug).join(",") + ", plus a resize-repaint pass on " +
    INDEX_ROUTES.map((r) => r.slug).join(","));

  await L.forEachConcept(ctx, 20 * 60 * 1000, async (page, concept, label) => {
    for (const width of widths) {
      /* a fresh document per width: it re-evaluates the concept's narrow
       * watcher from scratch and clears the in-memory (persist:false) stress
       * flag left by the previous width's #/all?stress=1 pass. */
      const ready = await L.bootConcept(page, concept, "home", {}, { width, height: HEIGHT });
      if (!ready) {
        ctx.record(label, width + "-boot", false, "data-pm-state=ready never appeared at width " + width);
        continue;
      }
      ctx.record(label, width + "-boot", true, "ready at " + width + "x" + HEIGHT);
      for (const spec of routesFor(width)) {
        await runCell(ctx, page, label, width, spec);
      }
    }
    await runResizePass(ctx, page, concept, label);
  });
}

module.exports = { name: "scroll", run };
