/* =====================================================================
   INDEPENDENT AUDITOR HARNESS — U11 "Prism II" usage concept
   Audit date: 2026-08-17
   ---------------------------------------------------------------------
   This harness is written by the AUDITOR, not by the concept author. It
   deliberately does NOT reuse u11-verify.mjs, and it never runs it.

   Rules obeyed by this file:
   - READ-ONLY on the concept: it never writes anywhere except
       <audit>/audit-evidence/**  and  the scratchpad temp dir.
   - file:// only (headless Chromium in this sandbox hangs on http://).
   - one long-lived persistent context, isolated temp profile,
     distinct debug port, bounded timeouts on every nav/action.
   - assertions are GEOMETRY and PIXELS and rendered TEXT.
     Dispatch counts are never used as evidence of anything.

   Usage:
     node audit-probe.mjs                 # all groups
     node audit-probe.mjs --groups=G1,G3  # a subset (merged into the JSON)
   ===================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

/* ---------------------------------------------------------------- paths */
const CONCEPT = '/mnt/Cursor/PuppetMaster/Concepts/usage-concepts/QwenUsageConcept';
const AUDIT = '/mnt/Cursor/PuppetMaster/Concepts/usage-concepts/PM_Usage_Independent_Audit_2026-08-17/audit-evidence';
const SCRATCH = '/tmp/claude-1000/-mnt-Cursor-PuppetMaster/7e74d8f5-7c2a-4eeb-8947-13056b4b2e5f/scratchpad';
const PROFILE = path.join(SCRATCH, 'audit-profile');
const SHOTS = path.join(AUDIT, 'screenshots');
const PROBES = path.join(AUDIT, 'probes');
const RESULTS = path.join(PROBES, 'independent-probe-results.json');
const PAGE_URL = 'file://' + CONCEPT + '/u11-prism.html';
const FIXTURES = '/mnt/Cursor/PuppetMaster/tests/fixtures/usage_gui/golden/usage_gui_acceptance_fixtures.json';
const CHROME = '/home/sittingmongoose/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';
const DEBUG_PORT = 9412;

const THEMES = ['friendly-dark', 'friendly-light', 'retro-dark', 'retro-light',
  'basic-light', 'basic-dark', 'glass-dark', 'glass-light'];
const WIDTHS = [360, 520, 768, 900, 1280, 1700, 2200, 2500];
const VH = 1000;
const ROOMS = ['overview', 'plans', 'costs', 'accounts', 'free', 'context', 'analytics',
  'ledger', 'attention', 'cache', 'tools', 'signals', 'authority'];

const NAV_TIMEOUT = 25000;
const ACT_TIMEOUT = 12000;

fs.mkdirSync(PROFILE, { recursive: true });
fs.mkdirSync(SHOTS, { recursive: true });
fs.mkdirSync(PROBES, { recursive: true });

const ARGS = process.argv.slice(2);
const groupsArg = (ARGS.find(a => a.startsWith('--groups=')) || '').replace('--groups=', '');
const WANT = groupsArg ? groupsArg.split(',').map(s => s.trim().toUpperCase()).filter(Boolean)
  : ['G0', 'G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8', 'G9'];

/* ---------------------------------------------------- playwright-core */
const req = createRequire(path.join(CONCEPT, '.verify', 'node_modules', '__probe.js'));
const { chromium } = req('playwright-core');

/* ------------------------------------------------------- in-page lib */
/* Injected at document start on every page. Pure helpers; it touches
   nothing the concept owns. Everything measured here is geometry,
   computed style or rendered text. */
const LIB = `
window.__A = (function () {
  /* A path that survives a reload: anchored at the nearest id or
     [data-pane]/[data-u11-page] host, and deliberately NOT using data-uid
     (widget uids are regenerated on every mount, so a uid-bearing selector
     is unresolvable on the next load and would make a live control look
     dead). Structural nth-of-type is used instead. */
  function cssPath(el, maxUp) {
    if (!el || el.nodeType !== 1) return '';
    var parts = [], node = el, up = 0, cap = maxUp || 14;
    while (node && node.nodeType === 1 && up <= cap) {
      var seg = node.tagName.toLowerCase();
      if (node.id) { parts.unshift(seg + '#' + node.id); break; }
      if (node.hasAttribute('data-pane')) { parts.unshift(seg + '[data-pane="' + node.getAttribute('data-pane') + '"]'); break; }
      if (node.hasAttribute('data-u11-page')) { parts.unshift(seg + '[data-u11-page="' + node.getAttribute('data-u11-page') + '"]'); break; }
      var cls = (node.getAttribute('class') || '').trim().split(/\\s+/).filter(Boolean)
        .filter(function (c) { return !/^(active|on|is-|uw-enter|pm-hidden)/.test(c); }).slice(0, 3);
      if (cls.length) seg += '.' + cls.join('.');
      var da = ['data-tab', 'data-disc', 'data-act', 'data-u11link', 'data-pmw-addtype', 'data-w', 'data-ico'];
      for (var i = 0; i < da.length; i++) { if (node.hasAttribute(da[i])) { seg += '[' + da[i] + '="' + node.getAttribute(da[i]) + '"]'; break; } }
      if (node.parentElement) {
        var sibs = Array.prototype.filter.call(node.parentElement.children, function (c) { return c.tagName === node.tagName; });
        if (sibs.length > 1) seg += ':nth-of-type(' + (sibs.indexOf(node) + 1) + ')';
      }
      parts.unshift(seg);
      node = node.parentElement; up++;
    }
    return parts.join('>');
  }
  function selectorResolvesUniquely(sel, el) {
    try { var all = document.querySelectorAll(sel); return all.length === 1 && all[0] === el; } catch (e) { return false; }
  }
  function visible(el) {
    var r = el.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) return false;
    var s = getComputedStyle(el);
    if (s.visibility === 'hidden' || s.display === 'none' || parseFloat(s.opacity || '1') === 0) return false;
    /* Chrome checkVisibility walks ancestors for display/visibility/opacity:
       a card parked inside a closed popover is not "visible" for our purposes */
    if (el.checkVisibility && !el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true, contentVisibilityAuto: true })) return false;
    return true;
  }
  /* the rectangle this element can actually paint into: the viewport
     intersected with every clipping ancestor. An element whose box sticks
     out past the viewport but is clipped away (a closed popover parked
     off-canvas, a wide table inside overflow:auto) paints nothing there. */
  function effectiveClip(el) {
    var left = -Infinity, top = -Infinity, right = Infinity, bottom = Infinity, clippers = [];
    var node = el.parentElement;
    while (node && node !== document.documentElement) {
      var s = getComputedStyle(node);
      if (s.overflowX !== 'visible' || s.overflowY !== 'visible') {
        var nr = node.getBoundingClientRect();
        left = Math.max(left, nr.left); right = Math.min(right, nr.right);
        top = Math.max(top, nr.top); bottom = Math.min(bottom, nr.bottom);
        clippers.push({ sel: cssPath(node, 3), overflowX: s.overflowX, right: Math.round(nr.right) });
      }
      node = node.parentElement;
    }
    return { left: left, top: top, right: right, bottom: bottom, clippers: clippers };
  }
  function inHiddenPane(el) { return !!(el.closest && el.closest('.pm-hidden')); }
  function label(el) {
    var t = (el.getAttribute('aria-label') || '').trim();
    if (t) return { name: t, from: 'aria-label' };
    var lb = el.getAttribute('aria-labelledby');
    if (lb) { var r = document.getElementById(lb); if (r && (r.textContent || '').trim()) return { name: r.textContent.trim(), from: 'aria-labelledby' }; }
    var tx = (el.innerText || el.textContent || '').replace(/\\s+/g, ' ').trim();
    if (tx) return { name: tx.slice(0, 80), from: 'text' };
    var ti = (el.getAttribute('title') || '').trim();
    if (ti) return { name: ti, from: 'title' };
    var tp = (el.getAttribute('data-tip') || '').trim();
    if (tp) return { name: tp, from: 'data-tip' };
    return { name: '', from: 'none' };
  }
  /* the nearest ancestor whose overflow-x clips, and whether it actually
     clips this element's right edge (a wide table inside overflow:auto is
     scrollable, not broken -- we record the difference instead of guessing) */
  function clipInfo(el) {
    var node = el.parentElement, r = el.getBoundingClientRect();
    while (node && node !== document.documentElement) {
      var s = getComputedStyle(node);
      if (s.overflowX !== 'visible' || s.overflowY !== 'visible') {
        var nr = node.getBoundingClientRect();
        return { clipped: r.right > nr.right + 1, by: cssPath(node, 3), overflowX: s.overflowX, byRight: Math.round(nr.right) };
      }
      node = node.parentElement;
    }
    return { clipped: false, by: '', overflowX: '', byRight: null };
  }
  function overflowRight(limit) {
    var vw = window.innerWidth, out = [], n = 0, painted = 0, paintedSample = [];
    var all = document.querySelectorAll('body *');
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      var r = el.getBoundingClientRect();
      if (r.width <= 0 && r.height <= 0) continue;
      if (r.right <= vw + 1) continue;
      var s = getComputedStyle(el);
      if (s.display === 'none' || s.visibility === 'hidden') continue;
      if (inHiddenPane(el)) continue;
      n++;
      var ec = effectiveClip(el);
      /* the part of the box that survives its ancestors' clipping */
      var ixl = Math.max(r.left, ec.left), ixr = Math.min(r.right, ec.right);
      var iyt = Math.max(r.top, ec.top), iyb = Math.min(r.bottom, ec.bottom);
      var paintsAnything = (ixr - ixl > 0.5) && (iyb - iyt > 0.5);
      var vis = visible(el);
      var paintedOver = paintsAnything ? Math.max(0, Math.round(ixr - vw)) : 0;
      /* content lost: the box is cut at (or before) the viewport's right edge
         with no scroll room, so the tail of the element is simply gone */
      var lost = vis && paintsAnything && r.right > vw + 1 && ec.right >= vw - 1;
      var rec = { sel: cssPath(el, 4), right: Math.round(r.right), overViewport: Math.round(r.right - vw),
        paintedOverflowRight: paintedOver, contentLostAtViewportEdge: !!lost,
        w: Math.round(r.width), visible: vis, paintsAnything: paintsAnything,
        clipBoundaryRight: isFinite(ec.right) ? Math.round(ec.right) : null, clippers: ec.clippers.slice(0, 2), pos: s.position,
        text: (el.innerText || '').replace(/\\s+/g, ' ').trim().slice(0, 50) };
      var isReal = vis && (paintedOver > 1 || lost);
      if (isReal) { painted++; if (paintedSample.length < (limit || 12)) paintedSample.push(rec); }
      if (out.length < (limit || 12)) out.push(rec);
    }
    /* total                = boxes whose right edge is past the viewport at all
       paintedPastViewport  = VISIBLE boxes that either paint past the viewport
                              or lose content at the viewport edge (the real defect)
       everything else      = clipped away / invisible (closed popovers etc.) */
    return { total: n, paintedPastViewport: painted, sample: out, paintedSample: paintedSample };
  }
  /* every leaf text node's element: scrollWidth<=clientWidth+1 OR ellipsis */
  function clippedText(limit) {
    var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    var seen = new Set(), viol = [], collapsed = [], truncated = 0, spills = 0, zeroW = 0, checked = 0;
    var node;
    while ((node = w.nextNode())) {
      if (!node.nodeValue || !node.nodeValue.trim()) continue;
      var el = node.parentElement;
      if (!el || seen.has(el)) continue;
      seen.add(el);
      if (inHiddenPane(el)) continue;
      /* styling-based visibility only: a box squeezed to zero width is still
         "displayed" and must be measured, not skipped (that is exactly the
         defect where text silently disappears) */
      if (el.checkVisibility && !el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true, contentVisibilityAuto: true })) continue;
      var st0 = getComputedStyle(el);
      if (st0.display === 'none' || st0.visibility === 'hidden') continue;
      checked++;
      var sw = el.scrollWidth, cw = el.clientWidth;
      var r = el.getBoundingClientRect();
      /* CATEGORY 1: the box has collapsed to (near) zero width while still
         holding text — the text is rendered nowhere */
      if ((cw === 0 || r.width < 1) && sw > 1) {
        zeroW++;
        if (collapsed.length < (limit || 25)) {
          collapsed.push({ sel: cssPath(el, 4), clientWidth: cw, scrollWidth: sw, rectW: +r.width.toFixed(1),
            display: st0.display, flexBasis: st0.flexBasis, minWidth: st0.minWidth, overflowX: st0.overflowX,
            parentGridTemplate: el.parentElement ? getComputedStyle(el.parentElement).gridTemplateColumns : null,
            kind: 'collapsed-to-zero-width',
            text: (el.textContent || '').replace(/\\s+/g, ' ').trim().slice(0, 70) });
        }
        continue;
      }
      if (r.width <= 0 || r.height <= 0) continue;
      if (sw <= cw + 1) continue;
      var s = st0;
      if (s.textOverflow === 'ellipsis') continue;
      var clips = s.overflowX !== 'visible';
      if (clips) truncated++; else spills++;
      if (viol.length < (limit || 25)) {
        viol.push({ sel: cssPath(el, 4), scrollWidth: sw, clientWidth: cw, over: sw - cw,
          overflowX: s.overflowX, whiteSpace: s.whiteSpace, textOverflow: s.textOverflow,
          kind: clips ? 'truncated-no-ellipsis' : 'spills-outside-box',
          text: (el.innerText || el.textContent || '').replace(/\\s+/g, ' ').trim().slice(0, 60) });
      }
    }
    return { checkedLeaves: checked, total: truncated + spills + zeroW,
      truncatedNoEllipsis: truncated, spillsOutsideBox: spills, collapsedToZeroWidth: zeroW,
      sample: viol, collapsedSample: collapsed };
  }
  function pageOverflow() {
    var se = document.scrollingElement;
    return { scrollWidth: se.scrollWidth, clientWidth: se.clientWidth, over: se.scrollWidth - se.clientWidth,
      bodyScrollWidth: document.body.scrollWidth, innerWidth: window.innerWidth };
  }
  function fontState() {
    var out = { docFontsStatus: document.fonts ? document.fonts.status : 'n/a', checks: {}, cdnResources: [] };
    var fams = ['Inter', 'Nunito', 'Outfit', 'Quicksand', 'Rajdhani', 'Sora', 'JetBrains Mono', 'Cal Sans'];
    try { fams.forEach(function (f) { out.checks[f] = document.fonts ? document.fonts.check('12px "' + f + '"') : null; }); } catch (e) { out.err = String(e); }
    try {
      (performance.getEntriesByType('resource') || []).forEach(function (r) {
        if (/fonts\\.(googleapis|gstatic)\\.com/.test(r.name)) out.cdnResources.push({ name: r.name.slice(0, 70), duration: Math.round(r.duration), transferSize: r.transferSize });
      });
    } catch (e2) {}
    return out;
  }
  function rectsOf(sel) {
    return Array.prototype.map.call(document.querySelectorAll(sel), function (el) {
      var r = el.getBoundingClientRect();
      return { uid: el.getAttribute('data-uid') || null, x: +r.x.toFixed(1), y: +r.y.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) };
    });
  }
  /* tiling: pairwise overlap + largest empty rectangle over the union box.
     raw = as painted; gutter = each card inflated by half the CSS gap so
     the intentional gutter is not reported as dead space. */
  function tiling(canvasSel) {
    var cv = document.querySelector(canvasSel);
    if (!cv) return { error: 'canvas not found: ' + canvasSel };
    var cs = getComputedStyle(cv);
    var gap = parseFloat(cs.columnGap || cs.gap || '10') || 10;
    var cards = Array.prototype.filter.call(cv.querySelectorAll(':scope > .uw'), function (el) { return !el.classList.contains('is-focus'); });
    var rs = cards.map(function (el) { var r = el.getBoundingClientRect(); return { uid: el.getAttribute('data-uid'), x: r.x, y: r.y, w: r.width, h: r.height, r: r.right, b: r.bottom }; });
    var zero = rs.filter(function (r) { return r.w <= 0 || r.h <= 0; }).map(function (r) { return r.uid; });
    var overlaps = [];
    for (var i = 0; i < rs.length; i++) for (var j = i + 1; j < rs.length; j++) {
      var a = rs[i], b = rs[j];
      var ow = Math.min(a.r, b.r) - Math.max(a.x, b.x);
      var oh = Math.min(a.b, b.b) - Math.max(a.y, b.y);
      if (ow > 1 && oh > 1) overlaps.push({ a: a.uid, b: b.uid, area: Math.round(ow * oh), w: Math.round(ow), h: Math.round(oh) });
    }
    function largestEmpty(inflate, yCap) {
      if (!rs.length) return { w: 0, h: 0, area: 0 };
      var minX = Math.min.apply(null, rs.map(function (r) { return r.x; }));
      var maxX = Math.max.apply(null, rs.map(function (r) { return r.r; }));
      var minY = Math.min.apply(null, rs.map(function (r) { return r.y; }));
      var maxY = Math.max.apply(null, rs.map(function (r) { return r.b; }));
      var step = 6;
      var cols = Math.max(1, Math.ceil((maxX - minX) / step)), rows = Math.max(1, Math.ceil((maxY - minY) / step));
      if (cols * rows > 400000) return { w: -1, h: -1, area: -1, note: 'lattice too large' };
      var grid = new Uint8Array(cols * rows);
      rs.forEach(function (r) {
        var c0 = Math.max(0, Math.floor((r.x - inflate - minX) / step)), c1 = Math.min(cols - 1, Math.ceil((r.r + inflate - minX) / step) - 1);
        var r0 = Math.max(0, Math.floor((r.y - inflate - minY) / step)), r1 = Math.min(rows - 1, Math.ceil((r.b + inflate - minY) / step) - 1);
        for (var yy = r0; yy <= r1; yy++) for (var xx = c0; xx <= c1; xx++) grid[yy * cols + xx] = 1;
      });
      var hist = new Int32Array(cols), best = { w: 0, h: 0, area: 0 };
      for (var y = 0; y < rows; y++) {
        if (yCap != null && (minY + y * step) >= yCap) break; /* interior-only pass stops above the last row band */
        for (var x = 0; x < cols; x++) hist[x] = grid[y * cols + x] ? 0 : hist[x] + 1;
        var stack = [];
        for (var x2 = 0; x2 <= cols; x2++) {
          var cur = x2 === cols ? 0 : hist[x2];
          while (stack.length && hist[stack[stack.length - 1]] >= cur) {
            var top = stack.pop();
            var left = stack.length ? stack[stack.length - 1] + 1 : 0;
            var wpx = (x2 - left) * step, hpx = hist[top] * step, area = wpx * hpx;
            if (area > best.area) best = { w: Math.round(wpx), h: Math.round(hpx), area: Math.round(area) };
          }
          stack.push(x2);
        }
      }
      return best;
    }
    return {
      canvas: { x: Math.round(cv.getBoundingClientRect().x), y: Math.round(cv.getBoundingClientRect().y), w: Math.round(cv.clientWidth), h: Math.round(cv.clientHeight), gap: gap,
        cols: (cs.gridTemplateColumns || '').split(' ').filter(Boolean).length },
      cardCount: rs.length, zeroSizedCards: zero,
      overlaps: overlaps, overlapCount: overlaps.length,
      largestGapRaw: largestEmpty(0),
      largestGapGutterCompensated: largestEmpty(gap / 2 + 0.5),
      /* a hole with cards below it is dead space inside the board; empty room
         at the end of the final row is just an unfilled tail, so the two are
         measured separately instead of being conflated */
      largestInteriorGapGutterCompensated: largestEmpty(gap / 2 + 0.5, rs.length ? Math.max.apply(null, rs.map(function (r) { return r.y; })) : null),
      lastRowTop: rs.length ? Math.round(Math.max.apply(null, rs.map(function (r) { return r.y; }))) : null,
      rects: rs.map(function (r) { return { uid: r.uid, x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.w), h: Math.round(r.h) }; })
    };
  }
  function items(pageSel) {
    var cv = document.querySelector(pageSel);
    if (!cv || !cv._pmw) return null;
    return cv._pmw.items.map(function (i) { return { uid: i.uid, type: i.type, c: i.c, r: i.r, focus: !!i.focus }; });
  }
  function domTypes(pageSel) {
    var cv = document.querySelector(pageSel);
    if (!cv) return null;
    return Array.prototype.map.call(cv.querySelectorAll(':scope > .uw'), function (el) {
      return { uid: el.getAttribute('data-uid'), title: (el.querySelector('.uw-tt') || {}).textContent || '', bodyLen: ((el.querySelector('.uw-body') || {}).innerText || '').length };
    });
  }
  function activeRoom() {
    var a = document.querySelector('.u11-rail .u11-item.active');
    return a ? a.getAttribute('data-tab') : null;
  }
  function hash(s) { var h = 5381, i = s.length; while (i) h = (h * 33 ^ s.charCodeAt(--i)) >>> 0; return h.toString(36); }
  function sig() {
    var body = document.body;
    var txt = (body.innerText || '').replace(/\\s+/g, ' ');
    return {
      htmlLen: body.innerHTML.length, textLen: txt.length, textHash: hash(txt), htmlHash: hash(body.innerHTML),
      room: activeRoom(), toasts: document.querySelectorAll('#toastStack .rail-toast, .toast-stack > *').length,
      openMenus: document.querySelectorAll('.pm-sprout.is-open, .pm-menu.is-open, .u11-pop.on, .u11ctx-pop.on, .u11ctx-det.on, [aria-expanded="true"]').length,
      cards: document.querySelectorAll('.uw[data-uid]').length,
      ls: Object.keys(localStorage).sort().join(','), lsHash: hash(Object.keys(localStorage).sort().map(function (k) { return k + '=' + localStorage.getItem(k); }).join('|'))
    };
  }
  function textOfPane(room) {
    var p = document.querySelector('[data-pane="' + room + '"]');
    return p ? (p.innerText || '').replace(/\\u00a0/g, ' ') : '';
  }
  function transitionOffenders(limit) {
    var out = [], n = 0;
    var all = document.querySelectorAll('body *');
    for (var i = 0; i < all.length; i++) {
      var el = all[i], s = getComputedStyle(el);
      var durs = (s.transitionDuration || '0s').split(',').map(function (d) { return parseFloat(d) * (d.indexOf('ms') > -1 ? 1 : 1000); });
      var ad = (s.animationDuration || '0s').split(',').map(function (d) { return parseFloat(d) * (d.indexOf('ms') > -1 ? 1 : 1000); });
      var mx = Math.max.apply(null, durs.concat(ad).map(function (v) { return isFinite(v) ? v : 0; }));
      if (mx > 1.0001) {
        n++;
        if (out.length < (limit || 20)) out.push({ sel: cssPath(el, 4), transitionDuration: s.transitionDuration, animationDuration: s.animationDuration, maxMs: +mx.toFixed(3) });
      }
    }
    return { total: n, sample: out };
  }
  /* bounded, cycle-safe stringify of the loaded data model */
  function dataDump(maxChars) {
    var seen = new WeakSet(), cap = maxChars || 4000000, out = [];
    var len = 0, stop = false;
    function walk(v, depth) {
      if (stop || len > cap) { stop = true; return; }
      if (v == null) { push('null'); return; }
      var t = typeof v;
      if (t === 'function') return;
      if (t !== 'object') { push(String(v)); return; }
      if (seen.has(v)) { push('[cycle]'); return; }
      if (depth > 9) { push('[deep]'); return; }
      seen.add(v);
      if (Array.isArray(v)) { for (var i = 0; i < v.length && !stop; i++) walk(v[i], depth + 1); return; }
      var ks = Object.keys(v);
      for (var j = 0; j < ks.length && !stop; j++) { push(ks[j]); walk(v[ks[j]], depth + 1); }
    }
    function push(s) { out.push(s); len += s.length + 1; }
    walk(window.U11, 0);
    return out.join('|');
  }
  /* ---- instrument self-test -----------------------------------------
     An auditor must show that a "zero violations" result means the
     detector was alive. Synthetic defects are injected into a scratch
     container, measured, then removed. Nothing the concept owns is
     touched and the page is discarded afterwards. */
  function selfTest() {
    var host = document.createElement('div');
    host.id = 'auditSelfTest';
    host.innerHTML =
      '<div id="stClip"   style="width:120px;white-space:nowrap;overflow:hidden">SELFTEST clipped text that is far too wide for its box</div>' +
      '<div id="stSpill"  style="width:120px;white-space:nowrap;overflow:visible">SELFTEST spilling text that is far too wide for its box</div>' +
      '<div id="stOk"     style="width:120px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">SELFTEST ellipsis text that is far too wide for its box</div>' +
      '<div id="stGrid"   style="display:grid;grid-template-columns:200px minmax(0,1fr);width:200px"><span>SELFTEST wide first column</span><span id="stZero">SELFTEST squeezed to zero width</span></div>' +
      '<div id="stPaint"  style="position:fixed;top:0;left:' + (window.innerWidth - 10) + 'px;width:200px;height:20px;background:#f0f">SELFTEST paints past the right edge</div>' +
      '<div id="stHidden" style="position:fixed;top:40px;left:0;width:50px;height:20px;overflow:hidden">' +
        '<div id="stHiddenIn" style="position:absolute;left:' + (window.innerWidth + 200) + 'px;width:300px;height:20px">SELFTEST clipped away</div></div>' +
      '<div id="stCanvas" style="position:relative;display:grid;gap:10px;width:400px;height:200px">' +
        '<div class="uw" style="position:absolute;left:0;top:0;width:200px;height:100px"></div>' +
        '<div class="uw" style="position:absolute;left:150px;top:50px;width:200px;height:100px"></div></div>' +
      '<div id="stCanvas2" style="position:relative;display:grid;gap:10px;width:400px;height:300px">' +
        '<div class="uw" style="position:absolute;left:0;top:0;width:400px;height:80px"></div>' +
        '<div class="uw" style="position:absolute;left:0;top:200px;width:400px;height:80px"></div></div>';
    document.body.appendChild(host);
    var ct = clippedText(60), orr = overflowRight(40);
    var sels = ct.sample.map(function (v) { return v.sel; }).join(' ');
    var overlapT = tiling('#stCanvas'), gapT = tiling('#stCanvas2');
    var res = {
      clippedTextDetector: {
        firedOnClippedNoEllipsis: /stClip/.test(sels), firedOnSpill: /stSpill/.test(sels),
        correctlySilentOnEllipsis: !/stOk/.test(sels),
        firedOnCollapsedToZeroWidth: ct.collapsedSample.some(function (v) { return /stZero/.test(v.sel); }),
        collapsedRecord: ct.collapsedSample.filter(function (v) { return /stZero/.test(v.sel); })[0] || null,
        leavesChecked: ct.checkedLeaves, totalFlagged: ct.total,
        kinds: ct.sample.filter(function (v) { return /stClip|stSpill/.test(v.sel); }).map(function (v) { return v.sel + '=' + v.kind; })
      },
      overflowRightDetector: {
        firedOnPaintedOverflow: orr.paintedSample.some(function (v) { return /stPaint/.test(v.sel); }),
        paintedOverflowRecord: orr.paintedSample.filter(function (v) { return /stPaint/.test(v.sel); })[0] || null,
        correctlyClassifiedClippedAway: orr.sample.some(function (v) { return /stHiddenIn/.test(v.sel) && v.paintsAnything === false; })
          && !orr.paintedSample.some(function (v) { return /stHiddenIn/.test(v.sel); }),
        clippedAwayRecord: orr.sample.filter(function (v) { return /stHiddenIn/.test(v.sel); })[0] || null,
        paintedPastViewport: orr.paintedPastViewport
      },
      tilingDetector: {
        overlapDetected: overlapT.overlapCount > 0, overlapSample: overlapT.overlaps,
        deadSpaceRawDetected: gapT.largestGapRaw.h >= 100, deadSpaceRaw: gapT.largestGapRaw,
        deadSpaceGutterCompensated: gapT.largestGapGutterCompensated,
        noFalseOverlapInGapCase: gapT.overlapCount === 0
      }
    };
    host.remove();
    res.hostRemoved = !document.getElementById('auditSelfTest');
    res.allDetectorsProvenLive =
      res.clippedTextDetector.firedOnClippedNoEllipsis && res.clippedTextDetector.firedOnSpill &&
      res.clippedTextDetector.correctlySilentOnEllipsis && res.clippedTextDetector.firedOnCollapsedToZeroWidth &&
      res.overflowRightDetector.firedOnPaintedOverflow &&
      res.overflowRightDetector.correctlyClassifiedClippedAway && res.tilingDetector.overlapDetected &&
      res.tilingDetector.deadSpaceRawDetected && res.tilingDetector.noFalseOverlapInGapCase && res.hostRemoved;
    return res;
  }
  return { selfTest: selfTest, effectiveClip: effectiveClip, cssPath: cssPath, selectorResolvesUniquely: selectorResolvesUniquely, visible: visible, label: label, overflowRight: overflowRight, clippedText: clippedText,
    pageOverflow: pageOverflow, fontState: fontState, rectsOf: rectsOf, tiling: tiling, items: items, domTypes: domTypes,
    activeRoom: activeRoom, sig: sig, textOfPane: textOfPane, transitionOffenders: transitionOffenders, dataDump: dataDump, hash: hash, clipInfo: clipInfo, inHiddenPane: inHiddenPane };
})();
`;

/* ------------------------------------------------------------ results */
const results = {
  meta: {
    audit: 'PM_Usage_Independent_Audit_2026-08-17',
    harness: 'audit-evidence/harness/audit-probe.mjs (independent auditor; not the concept harness)',
    target: PAGE_URL,
    startedAt: new Date().toISOString(),
    node: process.version,
    chrome: CHROME,
    transport: 'file:// only (headless Chromium in this sandbox hangs on http://)',
    profile: PROFILE,
    debugPort: DEBUG_PORT,
    groupsRequested: WANT,
    assertionPolicy: 'geometry / computed style / rendered text only — no dispatch counts',
    screenshots: []
  },
  groups: {},
  blockers: []
};
if (fs.existsSync(RESULTS)) {
  try {
    const prev = JSON.parse(fs.readFileSync(RESULTS, 'utf8'));
    if (prev && prev.groups) { results.groups = prev.groups; results.meta.previousRunAt = prev.meta && prev.meta.startedAt; if (Array.isArray(prev.meta?.screenshots)) results.meta.screenshots = prev.meta.screenshots; }
  } catch (e) { /* start clean */ }
}
function saveResults() {
  results.meta.finishedAt = new Date().toISOString();
  fs.writeFileSync(RESULTS, JSON.stringify(results, null, 2));
}
function blocker(group, msg) {
  const line = group + ': ' + msg;
  results.blockers.push(line);
  console.log('BLOCKER ' + line);
}
function log(...a) { console.log(...a); }

/* -------------------------------------------------------- page helper */
let ctx = null;

async function newProbePage(opts = {}) {
  const o = Object.assign({ theme: 'friendly-dark', disclosure: null, width: 1280, height: VH, query: '', clearWidgetLayout: true, reducedMotion: false }, opts);
  const page = await ctx.newPage();
  await page.setViewportSize({ width: o.width, height: o.height });
  const rec = { consoleErrors: [], consoleWarnings: [], pageErrors: [], requestFailed: [], fontCdnFailed: [] };
  page.on('console', m => {
    const t = m.text();
    if (m.type() === 'error') {
      if (/fonts\.(googleapis|gstatic)\.com/.test(t)) rec.fontCdnFailed.push('console: ' + t.slice(0, 200));
      else rec.consoleErrors.push(t.slice(0, 300));
    } else if (m.type() === 'warning') rec.consoleWarnings.push(t.slice(0, 200));
  });
  page.on('pageerror', e => rec.pageErrors.push(String(e && e.stack ? e.stack.split('\n')[0] : e).slice(0, 300)));
  page.on('requestfailed', r => {
    const entry = r.url().slice(0, 120) + ' :: ' + ((r.failure() && r.failure().errorText) || 'unknown');
    if (/fonts\.(googleapis|gstatic)\.com/.test(r.url())) rec.fontCdnFailed.push(entry);
    else rec.requestFailed.push(entry);
  });
  await page.addInitScript(LIB);
  await page.addInitScript(({ theme, disclosure, clearWidgetLayout, reducedMotion }) => {
    try {
      if (clearWidgetLayout) Object.keys(localStorage).filter(k => /^pmw:/.test(k) || /^u11:/.test(k)).forEach(k => localStorage.removeItem(k));
      if (theme) localStorage.setItem('pm.theme', theme);
      if (disclosure) localStorage.setItem('u11:disclosure', JSON.stringify(disclosure));
    } catch (e) { window.__auditStorageError = String(e); }
    if (reducedMotion) {
      const set = () => {
        if (!document.documentElement) return false;
        document.documentElement.setAttribute('data-reduced-motion', '1');
        if (window.__auditRMSetAt === undefined) window.__auditRMSetAt = document.readyState; /* FIRST success only */
        return true;
      };
      if (!set()) {
        const mo = new MutationObserver(() => { if (set()) mo.disconnect(); });
        mo.observe(document, { childList: true, subtree: true });
        document.addEventListener('readystatechange', set, true);
      }
    }
  }, { theme: o.theme, disclosure: o.disclosure, clearWidgetLayout: o.clearWidgetLayout, reducedMotion: o.reducedMotion });
  page.setDefaultTimeout(ACT_TIMEOUT);
  page.setDefaultNavigationTimeout(NAV_TIMEOUT);
  await page.goto(PAGE_URL + o.query, { waitUntil: 'load', timeout: NAV_TIMEOUT });
  await page.waitForFunction(() => !!(window.U11 && window.PMWidgets && document.querySelector('.uw[data-uid]')), null, { timeout: ACT_TIMEOUT }).catch(() => {});
  await page.waitForTimeout(o.settle || 900);
  page._rec = rec;
  return page;
}

async function shot(page, name) {
  const f = path.join(SHOTS, name + '.png');
  await page.screenshot({ path: f, timeout: ACT_TIMEOUT }).catch(e => log('  screenshot failed ' + name + ': ' + e.message));
  const rel = 'audit-evidence/screenshots/' + name + '.png';
  if (!results.meta.screenshots.includes(rel)) results.meta.screenshots.push(rel);
  return rel;
}

async function gotoRoom(page, room) {
  /* rail item click via DOM dispatch: the authority tab can be display:none
     at non-advanced disclosure and must still be reachable for the audit */
  const ok = await page.evaluate((r) => {
    const it = document.querySelector('.u11-rail .u11-item[data-tab="' + r + '"]');
    if (!it) return false;
    it.click();
    return true;
  }, room);
  await page.waitForTimeout(700);
  return ok;
}

function recOf(page) {
  const r = page._rec;
  return {
    consoleErrors: r.consoleErrors.slice(0, 10), consoleErrorCount: r.consoleErrors.length,
    pageErrors: r.pageErrors.slice(0, 10), pageErrorCount: r.pageErrors.length,
    otherRequestFailures: r.requestFailed.slice(0, 6), otherRequestFailureCount: r.requestFailed.length,
    fontCdnFailures: r.fontCdnFailed.slice(0, 6), fontCdnFailureCount: r.fontCdnFailed.length
  };
}
function clearRec(page) { page._rec.consoleErrors.length = 0; page._rec.pageErrors.length = 0; page._rec.requestFailed.length = 0; }

/* ===================================================================== */
/* G0 — instrument self-test (does this harness actually detect defects?) */
/* ===================================================================== */
async function G0() {
  const g = { name: 'G0 INSTRUMENT SELF-TEST', method: {
    why: 'a "0 violations" result is only evidence if the detector demonstrably fires on a known defect',
    how: 'synthetic defects (clipped text, spilling text, correctly-ellipsised text, an element painting past the right edge, an element clipped away past the right edge, an overlapping card pair, a card pair with a 120px dead band) are injected into a scratch container on a throwaway page, measured, then removed',
    guarantee: 'nothing the concept owns is modified; the page is closed immediately afterwards'
  }, result: null };
  let page;
  try {
    page = await newProbePage({ theme: 'friendly-dark', width: 1280, height: VH });
    g.result = await page.evaluate(() => window.__A.selfTest());
    log('  G0 detectors proven live: ' + g.result.allDetectorsProvenLive);
    log('  G0 ' + JSON.stringify(g.result.clippedTextDetector));
    log('  G0 ' + JSON.stringify(g.result.overflowRightDetector));
    log('  G0 ' + JSON.stringify(g.result.tilingDetector));
    await page.close();
  } catch (e) {
    blocker('G0', 'self-test failed: ' + e.message);
    if (page) await page.close().catch(() => {});
  }
  results.groups.G0 = g;
}

/* ===================================================================== */
/* G1 — 8 themes x 8 widths matrix                                       */
/* ===================================================================== */
async function G1() {
  const g = { name: 'G1 MATRIX — 8 themes x 8 widths', method: {
    widths: WIDTHS, themes: THEMES, viewportHeight: VH,
    themeMechanism: "localStorage 'pm.theme' set via addInitScript before any page script runs",
    modes: "resize = one load per theme then setViewportSize per width (settle 500ms); fresh = a fresh load at that viewport (360 and 2500 only)",
    checks: {
      a: 'document.scrollingElement.scrollWidth <= clientWidth + 1',
      b: 'no element rect.right > innerWidth + 1 (each violation additionally classified: clipped by a scrolling ancestor or not)',
      c: 'every leaf text node element: scrollWidth <= clientWidth + 1 OR text-overflow:ellipsis',
      d: 'console errors + pageerrors counted; font-CDN failures reported separately, never suppressed',
      e: 'html[data-theme] === requested theme'
    }
  }, cells: [], summary: {} };

  for (const theme of THEMES) {
    let page;
    try {
      page = await newProbePage({ theme, width: WIDTHS[0], height: VH });
    } catch (e) { blocker('G1', 'load failed for theme ' + theme + ': ' + e.message); continue; }
    for (const w of WIDTHS) {
      try {
        await page.setViewportSize({ width: w, height: VH });
        await page.waitForTimeout(520);
        const cell = await measureCell(page, theme, w, 'resize');
        g.cells.push(cell);
        log(`  G1 ${theme} @${w} resize — pageOverflow=${cell.a.over} rightEdgeBoxes=${cell.b.total} paintedPast=${cell.b.paintedPastViewport} clippedText=${cell.c.total}/${cell.c.checkedLeaves}leaves consoleErr=${cell.d.consoleErrorCount} theme=${cell.e.dataTheme}`);
        if (w === 1280 || w === 2500) cell.screenshot = await shot(page, `g1-theme-${theme}-${w}`);
        if (theme === 'friendly-dark') cell.screenshotWidth = await shot(page, `g1-width-friendly-dark-${w}`);
      } catch (e) {
        g.cells.push({ theme, width: w, mode: 'resize', error: e.message });
        blocker('G1', `cell ${theme}@${w} failed: ${e.message}`);
      }
    }
    await page.close();
    /* fresh-load control at the two extremes (resize path vs cold layout) */
    for (const w of [360, 2500]) {
      let p2;
      try {
        p2 = await newProbePage({ theme, width: w, height: VH });
        const cell = await measureCell(p2, theme, w, 'fresh');
        g.cells.push(cell);
        log(`  G1 ${theme} @${w} fresh  — pageOverflow=${cell.a.over} rightEdgeBoxes=${cell.b.total} paintedPast=${cell.b.paintedPastViewport} clippedText=${cell.c.total}/${cell.c.checkedLeaves}leaves`);
        await p2.close();
      } catch (e) {
        g.cells.push({ theme, width: w, mode: 'fresh', error: e.message });
        blocker('G1', `fresh cell ${theme}@${w} failed: ${e.message}`);
        if (p2) await p2.close().catch(() => {});
      }
    }
  }

  /* ---- cross-room x width sweep ---------------------------------------
     Only the ACTIVE room is measurable in the cells above: the other 12
     panes carry .pm-hidden, so their text has no layout. Clipped text is a
     headline claim, so every room is re-measured at every width. */
  g.crossRoomWidthSweep = { method: 'friendly-dark, advanced disclosure (all widget types mounted), every one of the 13 rooms visited at every width; per room: clipped-text scan, page overflow, painted-past-right-edge, console', rooms: {} };
  for (const w of WIDTHS) {
    let p;
    try {
      p = await newProbePage({ theme: 'friendly-dark', width: w, height: VH, disclosure: 'advanced' });
    } catch (e) { blocker('G1', `cross-room sweep load at ${w} failed: ` + e.message); continue; }
    for (const room of ROOMS) {
      try {
        clearRec(p);
        await gotoRoom(p, room);
        const m = await p.evaluate(() => ({
          clipped: window.__A.clippedText(15), page: window.__A.pageOverflow(),
          right: (function () { const o = window.__A.overflowRight(6); return { total: o.total, painted: o.paintedPastViewport, paintedSample: o.paintedSample }; })(),
          cards: document.querySelectorAll('.uw[data-uid]').length
        }));
        const rec = g.crossRoomWidthSweep.rooms[room] = g.crossRoomWidthSweep.rooms[room] || {};
        rec['w' + w] = { clippedTextTotal: m.clipped.total, truncatedNoEllipsis: m.clipped.truncatedNoEllipsis,
          spillsOutsideBox: m.clipped.spillsOutsideBox, collapsedToZeroWidth: m.clipped.collapsedToZeroWidth,
          collapsedSample: (m.clipped.collapsedSample || []).slice(0, 6), leavesChecked: m.clipped.checkedLeaves,
          pageOverflow: m.page.over, paintedPastRightEdge: m.right.painted,
          paintedSample: m.right.paintedSample.slice(0, 3), sample: m.clipped.sample.slice(0, 8),
          console: recOf(p).consoleErrorCount + recOf(p).pageErrorCount };
        /* capture while the room is actually on screen (a shot taken after the
           loop would show whichever room happened to be last) */
        if ((room === 'ledger' || room === 'accounts') && (w === 360 || w === 520 || w === 2500)) {
          rec['w' + w].screenshot = await shot(p, `g1-crossroom-${room}-${w}`);
        }
      } catch (e) { blocker('G1', `cross-room ${room}@${w} failed: ` + e.message); }
    }
    log(`  G1 cross-room sweep @${w}: ` + ROOMS.map(r => { const v = (g.crossRoomWidthSweep.rooms[r] || {})['w' + w] || {}; return r + '=' + v.clippedTextTotal + (v.collapsedToZeroWidth ? '(zeroW ' + v.collapsedToZeroWidth + ')' : ''); }).join(' '));
    await p.close();
  }

  /* aggregate */
  const ok = g.cells.filter(c => !c.error);
  const offenders = {};
  ok.forEach(c => (c.c.sample || []).forEach(v => {
    const k = v.sel;
    offenders[k] = offenders[k] || { sel: k, cells: 0, maxOver: 0, kind: v.kind, text: v.text };
    offenders[k].cells++; offenders[k].maxOver = Math.max(offenders[k].maxOver, v.over);
  }));
  const rightOff = {};
  ok.forEach(c => (c.b.paintedSample || []).forEach(v => {
    rightOff[v.sel] = rightOff[v.sel] || { sel: v.sel, cells: 0, maxOver: 0, text: v.text };
    rightOff[v.sel].cells++; rightOff[v.sel].maxOver = Math.max(rightOff[v.sel].maxOver, v.paintedOverflowRight);
  }));
  g.summary = {
    cellsRun: g.cells.length, cellsFailed: g.cells.filter(c => c.error).length,
    a_pageHorizontalOverflow_failCells: ok.filter(c => c.a.over > 1).map(c => `${c.theme}@${c.width}:${c.mode}=+${c.a.over}px`),
    b_cellsWithBoxesPastRightEdge: ok.filter(c => c.b.total > 0).length,
    b_cellsThatACTUALLYPAINTPastRightEdge: ok.filter(c => c.b.paintedPastViewport > 0).map(c => `${c.theme}@${c.width}:${c.mode}=${c.b.paintedPastViewport}`),
    b_note: 'boxes whose rect crosses the right edge but are clipped away (closed popovers parked off-canvas, content inside overflow:auto) are counted in total and excluded from paintedPastViewport — the classification is in each cell record',
    c_cellsWithClippedText: ok.filter(c => c.c.total > 0).length,
    c_cellsWithTextCollapsedToZeroWidth: ok.filter(c => c.c.collapsedToZeroWidth > 0).map(c => `${c.theme}@${c.width}:${c.mode}=${c.c.collapsedToZeroWidth}`),
    c_collapsedSamples: ok.map(c => (c.c.collapsedSample || []).map(v => Object.assign({ cell: `${c.theme}@${c.width}:${c.mode}` }, v))).flat().slice(0, 15),
    c_leavesCheckedPerCell: ok.map(c => c.c.checkedLeaves),
    c_worstCell: ok.slice().sort((x, y) => y.c.total - x.c.total).slice(0, 1).map(c => `${c.theme}@${c.width}:${c.mode}=${c.c.total}`)[0] || null,
    c_topOffenders: Object.values(offenders).sort((a, b) => b.cells - a.cells).slice(0, 25),
    b_topPaintedOffenders: Object.values(rightOff).sort((a, b) => b.cells - a.cells).slice(0, 15),
    d_cellsWithConsoleErrors: ok.filter(c => c.d.consoleErrorCount > 0 || c.d.pageErrorCount > 0).map(c => `${c.theme}@${c.width}:${c.mode}`),
    d_fontCdn: (() => {
      const f = ok.slice(0, 1).map(c => c.fonts)[0] || null;
      const loaded = f ? Object.entries(f.checks).filter(([, v]) => v).map(([k]) => k) : [];
      const missing = f ? Object.entries(f.checks).filter(([, v]) => !v).map(([k]) => k) : [];
      return {
        cellsWithFontCdnFailures: ok.filter(c => c.d.fontCdnFailureCount > 0).length,
        note: 'reported separately from console errors, never suppressed',
        sample: ok.map(c => c.d.fontCdnFailures).flat().slice(0, 4),
        webfontsActuallyLoadedSample: f,
        webfontsResolved: loaded, webfontsNotResolved: missing,
        cdnRequestOutcome: f && f.cdnResources && f.cdnResources.length
          ? 'the Google Fonts stylesheet request was made and returned transferSize ' + f.cdnResources[0].transferSize + ' (no bytes) — this sandbox has no network, and Chromium did not raise a requestfailed event for it'
          : 'no Google Fonts resource entry observed',
        CAVEAT: missing.length
          ? 'the web fonts ' + missing.join(', ') + ' did NOT resolve; the page rendered in fallback system fonts. Text advance widths therefore differ from production, so the clipped-text result in check (c) is only valid for fallback metrics — a production build with Inter/Sora/Rajdhani loaded could clip where this run did not.'
          : 'all probed web fonts resolved'
      };
    })(),
    e_themeMismatches: ok.filter(c => c.e.dataTheme !== c.theme).map(c => `${c.theme}@${c.width}:${c.mode} -> ${c.e.dataTheme}`),
    cellScopeLimitation: 'each matrix cell measures the ACTIVE room only (the other 12 panes carry .pm-hidden and have no layout) — the crossRoomWidthSweep section below covers all 13 rooms at all 8 widths',
    crossRoomWidthSweep: (() => {
      const rooms = g.crossRoomWidthSweep ? g.crossRoomWidthSweep.rooms : {};
      const bad = [];
      Object.entries(rooms).forEach(([room, byW]) => Object.entries(byW).forEach(([w, v]) => {
        if (v.clippedTextTotal > 0) bad.push({ room, width: w, clipped: v.clippedTextTotal, truncated: v.truncatedNoEllipsis, spills: v.spillsOutsideBox, collapsedToZeroWidth: v.collapsedToZeroWidth, sample: (v.sample || []).slice(0, 3), collapsedSample: (v.collapsedSample || []).slice(0, 3) });
        if (v.pageOverflow > 1) bad.push({ room, width: w, pageOverflow: v.pageOverflow });
        if (v.paintedPastRightEdge > 0) bad.push({ room, width: w, paintedPastRightEdge: v.paintedPastRightEdge, sample: v.paintedSample });
      }));
      return { roomsCovered: Object.keys(rooms).length, widthsCovered: WIDTHS.length, findings: bad.slice(0, 60), findingCount: bad.length };
    })()
  };
  results.groups.G1 = g;
}

async function measureCell(page, theme, width, mode) {
  clearRec(page);
  await page.waitForTimeout(120);
  const m = await page.evaluate(() => ({
    a: window.__A.pageOverflow(),
    b: window.__A.overflowRight(12),
    c: window.__A.clippedText(25),
    e: { dataTheme: document.documentElement.getAttribute('data-theme'), colorScheme: document.documentElement.style.colorScheme,
      bodyBg: getComputedStyle(document.body).backgroundColor, bodyColor: getComputedStyle(document.body).color },
    fonts: window.__A.fontState(),
    room: window.__A.activeRoom(),
    cards: document.querySelectorAll('.uw[data-uid]').length,
    railVisible: (function () { const r = document.querySelector('.u11-rail'); if (!r) return null; const b = r.getBoundingClientRect(); return { w: Math.round(b.width), h: Math.round(b.height), display: getComputedStyle(r).display }; })()
  }));
  const d = recOf(page);
  return { theme, width, mode, a: m.a, b: m.b, c: m.c, d, e: m.e, fonts: m.fonts, room: m.room, cards: m.cards, rail: m.railVisible };
}

/* ===================================================================== */
/* G2 — dead / clipped controls                                          */
/* ===================================================================== */
const CONTROL_SEL = 'button, [role=button], [data-tab], [data-disc], [data-scope-open], [data-u11link], [data-act]';

async function G2() {
  const g = { name: 'G2 DEAD / CLIPPED CONTROLS', method: {
    selector: CONTROL_SEL,
    enumeration: 'every one of the 13 rooms is visited; controls visible in that room are enumerated (rect > 0, not inside .pm-hidden), deduped by a reload-stable CSS path (never uid-based)',
    scrollIntoView: 'each control is scrolled to the centre of its scroller BEFORE the hit-test and BEFORE the click — the room canvases are taller than the viewport, and hit-testing or clicking an off-screen coordinate would libel a live control as dead',
    hitTest: 'document.elementFromPoint(centre) must return the control or a descendant of it',
    accessibleName: 'aria-label | aria-labelledby | rendered text | title | data-tip (title/data-tip recorded as tooltip-only)',
    liveTest: 'a real mouse click at the control centre; before/after signature = body innerHTML hash + text hash + card count + active room + open-popover count + localStorage hash + toast count. Page reloaded every 10 clicks so state cannot cascade.',
    noOpByDesign: 'a control that is already the current selection (an .active rail tab, the .on disclosure level, the .on width preset, the current title-bar page tab) or a close button for a popover that is not open cannot change anything when clicked; those are classified separately and are NOT reported as dead',
    note: 'the click test is a DOM-EFFECT test, not a dispatch-count test'
  }, roomsEnumerated: [], controls: [], summary: {} };

  let page;
  try { page = await newProbePage({ theme: 'friendly-dark', width: 1280, height: VH }); }
  catch (e) { blocker('G2', 'initial load failed: ' + e.message); return; }

  const seen = new Map();
  for (const room of ROOMS) {
    const navOk = await gotoRoom(page, room);
    if (!navOk) { g.roomsEnumerated.push({ room, error: 'rail item not found' }); continue; }
    const found = await page.evaluate((sel) => {
      const A = window.__A;
      const out = [];
      document.querySelectorAll(sel).forEach(el => {
        if (A.inHiddenPane(el)) return;
        let r = el.getBoundingClientRect();
        if (r.width <= 0 || r.height <= 0) return;
        const s = getComputedStyle(el);
        if (s.display === 'none' || s.visibility === 'hidden') return;
        const rectBeforeScroll = { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
        const offViewport = r.top < 0 || r.bottom > window.innerHeight || r.left < 0 || r.right > window.innerWidth;
        /* a control can sit inside the viewport and still be scrolled out of
           its OWN widget body (.uw-body is overflow:auto and much shorter than
           its content) — measure that before scrolling anything */
        const ownBody = el.closest('.uw-body');
        let outsideOwnBody = false, outsideOwnBodyBy = 0;
        if (ownBody) {
          const br = ownBody.getBoundingClientRect();
          outsideOwnBodyBy = Math.round(Math.max(r.bottom - br.bottom, br.top - r.top));
          outsideOwnBody = outsideOwnBodyBy > 1;
        }
        /* ALWAYS scroll: hit-testing or clicking a coordinate the control does
           not actually occupy would libel a live control as dead */
        try { el.scrollIntoView({ block: 'center', inline: 'center', behavior: 'instant' }); } catch (e) { el.scrollIntoView(); }
        r = el.getBoundingClientRect();
        const cx = r.x + r.width / 2, cy = r.y + r.height / 2;
        const centreReachable = cx >= 0 && cy >= 0 && cx <= window.innerWidth && cy <= window.innerHeight;
        const hit = centreReachable ? document.elementFromPoint(cx, cy) : null;
        const lab = A.label(el);
        const iconOnly = !(el.innerText || '').trim() && !!el.querySelector('svg, i, .pm-ico');
        const selPath = A.cssPath(el, 14);
        out.push({
          sel: selPath, selectorUnique: A.selectorResolvesUniquely(selPath, el),
          rectBeforeScroll, offViewportBeforeScroll: offViewport,
          outsideOwnWidgetBodyBeforeScroll: outsideOwnBody, outsideOwnWidgetBodyBy: outsideOwnBodyBy,
          centreReachableAfterScroll: centreReachable,
          currentSelectionState: (el.classList.contains('active') || el.classList.contains('on')) ? 'already-current' : null,
          tag: el.tagName.toLowerCase(),
          attrs: ['data-tab', 'data-disc', 'data-act', 'data-u11link', 'data-scope-open', 'data-w', 'data-pmw-add', 'data-pmw-kebab', 'data-pmw-grip', 'data-pmw-resize', 'data-pmw-resetpage', 'data-demo-action', 'role', 'id']
            .filter(a => el.hasAttribute(a)).map(a => a + (el.getAttribute(a) ? '=' + el.getAttribute(a) : '')).join(' '),
          rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
          insideViewport: r.right <= window.innerWidth + 1 && r.left >= -1 && r.bottom <= window.innerHeight + 1 && r.top >= -1,
          hitTestable: !!hit && (hit === el || el.contains(hit)),
          hitBlockedBy: (!!hit && !(hit === el || el.contains(hit))) ? A.cssPath(hit, 4) : null,
          accessibleName: lab.name, nameSource: lab.from,
          nameIsTooltipOnly: lab.from === 'title' || lab.from === 'data-tip',
          hasNoName: !lab.name,
          iconOnly, disabledAttr: el.hasAttribute('disabled'), ariaDisabled: el.getAttribute('aria-disabled'),
          pointerEvents: s.pointerEvents, cursor: s.cursor,
          textClipped: el.scrollWidth > el.clientWidth + 1 && s.textOverflow !== 'ellipsis'
        });
      });
      return out;
    }, CONTROL_SEL);
    g.roomsEnumerated.push({ room, visibleControls: found.length });
    found.forEach(c => { if (!seen.has(c.sel)) { c.firstSeenRoom = room; seen.set(c.sel, c); } });
    log(`  G2 room ${room}: ${found.length} visible controls (unique so far ${seen.size})`);
  }
  await page.close();

  const list = Array.from(seen.values());
  /* ---- live test: click every unique control, reloading every 10 clicks */
  const CHUNK = 10;
  for (let i = 0; i < list.length; i += CHUNK) {
    const chunk = list.slice(i, i + CHUNK);
    let p;
    try { p = await newProbePage({ theme: 'friendly-dark', width: 1280, height: VH }); }
    catch (e) { blocker('G2', 'reload failed at control ' + i + ': ' + e.message); chunk.forEach(c => { c.clickTest = { error: 'page load failed' }; }); continue; }
    for (const c of chunk) {
      try {
        if (c.firstSeenRoom && c.firstSeenRoom !== 'overview') await gotoRoom(p, c.firstSeenRoom);
        await p.keyboard.press('Escape').catch(() => {});
        await p.waitForTimeout(120);
        const pre = await p.evaluate((sel) => {
          const all = document.querySelectorAll(sel);
          if (!all.length) return { missing: true, matches: 0 };
          const el = all[0];
          try { el.scrollIntoView({ block: 'center', inline: 'center', behavior: 'instant' }); } catch (e) { el.scrollIntoView(); }
          const r = el.getBoundingClientRect();
          const cx = r.x + r.width / 2, cy = r.y + r.height / 2;
          const hit = document.elementFromPoint(cx, cy);
          return { missing: false, matches: all.length, sig: window.__A.sig(), cx, cy, w: r.width, h: r.height,
            centreReachable: cx >= 0 && cy >= 0 && cx <= window.innerWidth && cy <= window.innerHeight,
            hitIsControl: !!hit && (hit === el || el.contains(hit)),
            hitIs: hit ? window.__A.cssPath(hit, 4) : null };
        }, c.sel);
        if (pre.missing || pre.w <= 0) { c.clickTest = { resolved: false, matches: pre.matches, note: 'control not resolvable/visible in this state — NOT evidence of deadness' }; continue; }
        if (!pre.centreReachable) { c.clickTest = { resolved: false, note: 'centre could not be scrolled into the viewport — NOT clicked, NOT evidence of deadness', cx: Math.round(pre.cx), cy: Math.round(pre.cy) }; continue; }
        c.clickTest = { resolved: true, matchesAtClickTime: pre.matches, hitIsControlAtClickTime: pre.hitIsControl, hitIs: pre.hitIs };
        await p.mouse.click(pre.cx, pre.cy, { timeout: 4000 }).catch(e => { c.clickTest.clickError = e.message; });
        await p.waitForTimeout(420);
        const post = await p.evaluate(() => window.__A.sig());
        const changed = pre.sig.htmlHash !== post.htmlHash || pre.sig.textHash !== post.textHash ||
          pre.sig.room !== post.room || pre.sig.cards !== post.cards || pre.sig.openMenus !== post.openMenus ||
          pre.sig.lsHash !== post.lsHash;
        c.clickTest = Object.assign(c.clickTest || {}, {
          resolved: true, domChanged: changed,
          detail: {
            htmlChanged: pre.sig.htmlHash !== post.htmlHash, textChanged: pre.sig.textHash !== post.textHash,
            roomChanged: pre.sig.room !== post.room, cardsChanged: post.cards - pre.sig.cards,
            openMenusDelta: post.openMenus - pre.sig.openMenus, toastsDelta: post.toasts - pre.sig.toasts,
            storageChanged: pre.sig.lsHash !== post.lsHash
          }
        });
      } catch (e) { c.clickTest = { resolved: false, error: e.message }; }
    }
    log(`  G2 click-tested ${Math.min(i + CHUNK, list.length)}/${list.length}`);
    await p.close();
  }

  g.controls = list;
  /* a control that is already the current selection, or a close button for a
     popover that is not open, cannot change anything — separate those out
     rather than calling them dead */
  const isNoOpByDesign = (c) => {
    if (/data-pmw-grip/.test(c.attrs || '')) return 'drag-only affordance (grip): a click is not its gesture — exercised with a real pointer drag in G3';
    if (/data-pmw-resize/.test(c.attrs || '')) return 'drag-only affordance (resize corner): a click is not its gesture — exercised with a real pointer drag in G3';
    if (c.currentSelectionState === 'already-current') return 'already the current selection';
    if (/close/i.test(c.accessibleName || '') || /popx|close/i.test(c.attrs || '')) return 'close button for a surface that was not open';
    return null;
  };
  list.forEach(c => { c.noOpByDesign = isNoOpByDesign(c); });
  const clicked = list.filter(c => c.clickTest && c.clickTest.resolved);
  const dead = clicked.filter(c => c.clickTest.domChanged === false && !c.noOpByDesign);
  const noOp = clicked.filter(c => c.clickTest.domChanged === false && c.noOpByDesign);
  g.summary = {
    uniqueVisibleControls: list.length,
    clickTested: clicked.length,
    notHitTestable: list.filter(c => !c.hitTestable).map(c => ({ sel: c.sel, room: c.firstSeenRoom, blockedBy: c.hitBlockedBy, rect: c.rect, centreReachableAfterScroll: c.centreReachableAfterScroll })),
    hitTestNote: 'measured after scrolling each control to the centre of its scroller; a control whose centre still cannot be reached is listed with centreReachableAfterScroll=false and is not counted as blocked',
    outsideViewportBeforeScroll: list.filter(c => c.offViewportBeforeScroll).length,
    controlsScrolledOutOfTheirOwnWidgetBody: {
      count: list.filter(c => c.outsideOwnWidgetBodyBeforeScroll).length,
      note: '.uw-body is overflow:auto and much shorter than its content, so these controls are present and live but require scrolling their own widget body before they can be hit; they are NOT dead',
      sample: list.filter(c => c.outsideOwnWidgetBodyBeforeScroll).slice(0, 12).map(c => ({ sel: c.sel, room: c.firstSeenRoom, name: c.accessibleName, byPx: c.outsideOwnWidgetBodyBy }))
    },
    stillOutsideViewportAfterScroll: list.filter(c => !c.insideViewport).map(c => ({ sel: c.sel, room: c.firstSeenRoom, rect: c.rect })),
    selectorsNotUnique: list.filter(c => !c.selectorUnique).map(c => ({ sel: c.sel, room: c.firstSeenRoom, name: c.accessibleName })),
    noAccessibleName: list.filter(c => c.hasNoName).map(c => ({ sel: c.sel, room: c.firstSeenRoom, attrs: c.attrs })),
    iconOnlyWithTooltipOnlyName: list.filter(c => c.iconOnly && c.nameIsTooltipOnly).map(c => ({ sel: c.sel, room: c.firstSeenRoom, name: c.accessibleName, source: c.nameSource })),
    iconOnlyWithNoNameAtAll: list.filter(c => c.iconOnly && c.hasNoName).map(c => ({ sel: c.sel, room: c.firstSeenRoom })),
    clippedControlText: list.filter(c => c.textClipped).map(c => ({ sel: c.sel, room: c.firstSeenRoom, name: c.accessibleName })),
    deadControls_noDomChangeOnClick: dead.map(c => ({ sel: c.sel, room: c.firstSeenRoom, name: c.accessibleName, attrs: c.attrs, detail: c.clickTest.detail })),
    deadCount: dead.length,
    deadControlsGroupedByLabel: Object.entries(dead.reduce((acc, c) => { const k = (c.accessibleName || '(no name)').slice(0, 40); acc[k] = (acc[k] || 0) + 1; return acc; }, {})).sort((a, b) => b[1] - a[1]),
    noOpByDesign: noOp.map(c => ({ sel: c.sel, room: c.firstSeenRoom, name: c.accessibleName, why: c.noOpByDesign })),
    noOpByDesignCount: noOp.length,
    unresolvedAtClickTime: list.filter(c => c.clickTest && c.clickTest.resolved === false).length,
    unresolvedReasons: Object.entries(list.filter(c => c.clickTest && c.clickTest.resolved === false)
      .reduce((acc, c) => { const k = c.clickTest.note || c.clickTest.error || 'unknown'; acc[k] = (acc[k] || 0) + 1; return acc; }, {})),
    liveControls: clicked.filter(c => c.clickTest.domChanged === true).length
  };
  results.groups.G2 = g;
}

/* ===================================================================== */
/* G3 — widget engine behaviour on Overview                              */
/* ===================================================================== */
async function G3() {
  const CV = '[data-u11-page="u11-overview"]';
  const g = { name: 'G3 WIDGET BEHAVIOR (never exercised by the concept harness)', method: {
    canvas: CV,
    tiling: 'pairwise rect overlap (>1px x >1px) + largest empty rectangle inside the union box of the cards, measured twice: raw (as painted) and gutter-compensated (each card inflated by half the computed CSS gap, so the intentional gutter is not counted as dead space)',
    flash: 'rects sampled every ~60ms for ~700ms after each mutation; any card whose rect collapses to 0 width or 0 height mid-transition is a flash',
    persistence: "localStorage 'pmw:u11-overview' read back, then a real reload compares uid/type/span"
  }, steps: [], summary: {} };

  let basePage;
  try { basePage = await newProbePage({ theme: 'friendly-dark', width: 1700, height: VH }); }
  catch (e) { blocker('G3', 'load failed: ' + e.message); return; }
  const page = basePage;

  const sample = async (label, actionFn, pageArg) => {
    const page = pageArg || basePage;
    const before = await page.evaluate((cv) => ({ t: window.__A.tiling(cv), items: window.__A.items(cv), dom: window.__A.domTypes(cv), ls: localStorage.getItem('pmw:u11-overview') }), CV);
    let actErr = null;
    try { await actionFn(); } catch (e) { actErr = e.message; }
    /* flash sampling */
    const frames = [];
    for (let i = 0; i < 12; i++) {
      frames.push(await page.evaluate((cv) => window.__A.rectsOf(cv + ' > .uw'), CV));
      await page.waitForTimeout(60);
    }
    await page.waitForTimeout(300);
    const after = await page.evaluate((cv) => ({ t: window.__A.tiling(cv), items: window.__A.items(cv), dom: window.__A.domTypes(cv), ls: localStorage.getItem('pmw:u11-overview') }), CV);
    const collapsed = [];
    frames.forEach((f, fi) => f.forEach(r => { if (r.uid && (r.w === 0 || r.h === 0)) collapsed.push({ frame: fi, uid: r.uid, w: r.w, h: r.h }); }));
    const step = {
      step: label, actionError: actErr,
      before: { cardCount: before.t.cardCount, overlapCount: before.t.overlapCount, largestGapRaw: before.t.largestGapRaw, largestGapGutterCompensated: before.t.largestGapGutterCompensated, largestInteriorGap: before.t.largestInteriorGapGutterCompensated, types: (before.items || []).map(i => i.type + ':' + i.c + 'x' + i.r) },
      after: { cardCount: after.t.cardCount, overlapCount: after.t.overlapCount, largestGapRaw: after.t.largestGapRaw, largestGapGutterCompensated: after.t.largestGapGutterCompensated, largestInteriorGap: after.t.largestInteriorGapGutterCompensated, lastRowTop: after.t.lastRowTop, types: (after.items || []).map(i => i.type + ':' + i.c + 'x' + i.r) },
      overlapsAfter: after.t.overlaps.slice(0, 6),
      zeroSizedCardsAfter: after.t.zeroSizedCards,
      flashFrames: collapsed.slice(0, 10), flashCount: collapsed.length,
      storageAfter: after.ls ? { present: true, bytes: after.ls.length, types: (JSON.parse(after.ls).items || []).map(i => i.type + ':' + i.c + 'x' + i.r) } : { present: false },
      canvasAfter: after.t.canvas,
      rectsAfter: after.t.rects
    };
    g.steps.push(step);
    log(`  G3 ${label}: cards ${step.before.cardCount}->${step.after.cardCount} overlaps=${step.after.overlapCount} gapGutter=${step.after.largestGapGutterCompensated.w}x${step.after.largestGapGutterCompensated.h} INTERIORgap=${step.after.largestInteriorGap.w}x${step.after.largestInteriorGap.h} flash=${step.flashCount}${actErr ? ' ACTION-ERROR ' + actErr : ''}`);
    return step;
  };

  await sample('baseline (first mount, cleared storage)', async () => {});
  await shot(page, 'g3-01-baseline');

  /* add via the picker */
  await sample('add widget via picker', async () => {
    await page.evaluate(() => document.querySelector('[data-pane="overview"] [data-pmw-add]').click());
    await page.waitForTimeout(400);
    const added = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('.pm-sprout [data-pmw-addtype]'));
      if (!rows.length) return { ok: false, reason: 'picker rows not found', sproutHtmlLen: (document.querySelector('.pm-sprout') || {}).innerHTML?.length || 0 };
      const pick = rows[rows.length - 1];
      const t = pick.getAttribute('data-pmw-addtype');
      pick.click();
      return { ok: true, type: t, rowCount: rows.length };
    });
    g.pickerResult = added;
    if (!added.ok) throw new Error('picker: ' + added.reason);
    await page.keyboard.press('Escape').catch(() => {});
  });
  await shot(page, 'g3-02-after-add');

  /* remove via kebab */
  await sample('remove widget via kebab', async () => {
    const r = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('[data-u11-page="u11-overview"] > .uw'));
      if (!cards.length) return { ok: false, reason: 'no cards' };
      const target = cards[1] || cards[0];
      const uid = target.getAttribute('data-uid');
      target.querySelector('[data-pmw-kebab]').click();
      return { ok: true, uid };
    });
    await page.waitForTimeout(400);
    const rem = await page.evaluate(() => {
      const btn = document.querySelector('.pm-sprout [data-pmw-remove]');
      if (!btn) return { ok: false, reason: 'remove item not found in kebab menu' };
      btn.click(); return { ok: true };
    });
    g.removeResult = { open: r, remove: rem };
    if (!rem.ok) throw new Error('kebab remove: ' + rem.reason);
  });
  await shot(page, 'g3-03-after-remove');

  /* resize by dragging the corner handle (real pointer drag) */
  await sample('resize widget by dragging the corner handle', async () => {
    const pt = await page.evaluate(() => {
      const card = document.querySelector('[data-u11-page="u11-overview"] > .uw');
      if (!card) return null;
      const h = card.querySelector('[data-pmw-resize]');
      if (!h) return null;
      const r = h.getBoundingClientRect(), cr = card.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2, uid: card.getAttribute('data-uid'), before: { w: Math.round(cr.width), h: Math.round(cr.height), style: card.getAttribute('style') } };
    });
    if (!pt) throw new Error('resize handle not found');
    g.resizeAnchor = pt;
    await page.mouse.move(pt.x, pt.y);
    await page.mouse.down();
    for (let i = 1; i <= 8; i++) { await page.mouse.move(pt.x - (140 * i / 8), pt.y + (110 * i / 8)); await page.waitForTimeout(30); }
    await page.mouse.up();
    await page.waitForTimeout(250);
    g.resizeAfter = await page.evaluate((uid) => {
      const card = document.querySelector('[data-u11-page="u11-overview"] > .uw[data-uid="' + uid + '"]');
      if (!card) return { missing: true };
      const cr = card.getBoundingClientRect();
      return { w: Math.round(cr.width), h: Math.round(cr.height), style: card.getAttribute('style') };
    }, pt.uid);
  });
  await shot(page, 'g3-04-after-resize');

  /* move by dragging the grip onto another card.
     dropIndex 1 = the neighbouring card. A drop far down the board is probed
     separately below, because the two behave differently and conflating them
     would misreport the engine. */
  const dragGrip = async (p, dropIndex, relX, relY) => {
    const pts = await p.evaluate(({ di, rx, ry }) => {
      const cards = Array.from(document.querySelectorAll('[data-u11-page="u11-overview"] > .uw'));
      if (cards.length < 2) return null;
      cards[0].scrollIntoView({ block: 'center', behavior: 'instant' });
      const grip = cards[0].querySelector('[data-pmw-grip]');
      const gr = grip.getBoundingClientRect();
      const t = cards[Math.min(di, cards.length - 1)].getBoundingClientRect();
      return { from: { x: gr.x + gr.width / 2, y: gr.y + gr.height / 2 },
        to: { x: t.x + t.width * rx, y: t.y + t.height * ry },
        dropRel: { relX: rx, relY: ry },
        engineRule: 'usage-widgets.js slotFromPoint: after = relY >= 0.5 && !(relY <= 0.75 && relX < 0.5)',
        enginePredictsInsertAfter: ry >= 0.5 && !(ry <= 0.75 && rx < 0.5),
        targetTitle: (cards[Math.min(di, cards.length - 1)].querySelector('.uw-tt') || {}).textContent,
        targetUid: cards[Math.min(di, cards.length - 1)].getAttribute('data-uid'),
        orderBefore: cards.map(c => (c.querySelector('.uw-tt') || {}).textContent),
        uidsBefore: cards.map(c => c.getAttribute('data-uid')) };
    }, { di: dropIndex, rx: relX == null ? 0.5 : relX, ry: relY == null ? 0.5 : relY });
    if (!pts) throw new Error('need >= 2 cards to drag');
    await p.mouse.move(pts.from.x, pts.from.y);
    await p.mouse.down();
    /* nudge first so the card lifts and the board reflows, THEN read the
       target's live rect: a drop coordinate computed before the lift no longer
       sits over the intended card once everything has shifted up */
    for (let i = 1; i <= 3; i++) { await p.mouse.move(pts.from.x + i * 6, pts.from.y + i * 6); await p.waitForTimeout(35); }
    await p.waitForTimeout(520); /* the lift reflows the board with a FLIP animation; measuring mid-flight yields a stale drop point */
    const live = await p.evaluate(({ uid, rx, ry }) => {
      const cards = Array.from(document.querySelectorAll('[data-u11-page="u11-overview"] > .uw'))
        .filter(c => !c.classList.contains('is-placeholder') && !c.hasAttribute('data-pmw-lifted'));
      const t = cards.filter(c => c.getAttribute('data-uid') === uid)[0] || cards[1] || cards[0];
      const r = t.getBoundingClientRect();
      return { x: r.x + r.width * rx, y: r.y + r.height * ry, title: (t.querySelector('.uw-tt') || {}).textContent, found: !!t };
    }, { uid: pts.targetUid, rx: pts.dropRel.relX, ry: pts.dropRel.relY });
    pts.liveDropPoint = { x: Math.round(live.x), y: Math.round(live.y), targetTitleAtDropTime: live.title };
    let mid = null;
    for (let i = 1; i <= 12; i++) {
      await p.mouse.move(pts.from.x + (live.x - pts.from.x) * i / 12, pts.from.y + (live.y - pts.from.y) * i / 12);
      await p.waitForTimeout(35);
      if (i === 8) mid = await p.evaluate(() => ({ liftedClones: document.querySelectorAll('.uw-lifted, [data-pmw-lifted]').length, placeholders: document.querySelectorAll('.uw.is-placeholder').length, dragClassOnHtml: document.documentElement.classList.contains('pmw-drag'),
        placeholderIndex: (function () { const ks = Array.from(document.querySelectorAll('[data-u11-page="u11-overview"] > .uw')); const ph = document.querySelector('.uw.is-placeholder'); return ph ? ks.indexOf(ph) : -1; })() }));
    }
    await p.waitForTimeout(150);
    await p.mouse.up();
    await p.waitForTimeout(600);
    const after = await p.evaluate((pre) => {
      const order = Array.from(document.querySelectorAll('[data-u11-page="u11-overview"] > .uw')).map(c => (c.querySelector('.uw-tt') || {}).textContent);
      return { orderAfter: order, changed: order.join(',') !== pre.join(','),
        ghostsLeft: document.querySelectorAll('.uw-lifted, [data-pmw-lifted], .uw.is-placeholder').length };
    }, pts.orderBefore);
    return { dropIndex, anchors: pts, midDrag: mid, after };
  };
  /* released in the lower-right region of the neighbouring card, which the
     engine's own reading-order rule resolves to "insert after" */
  await sample('move widget by dragging the grip onto the neighbouring card (drop at 75%/80%, board already mutated by add/remove/resize)', async () => {
    g.dragAdjacent = await dragGrip(page, 1, 0.75, 0.8);
  });
  /* two boundary observations, recorded rather than asserted */
  try {
    g.dragCentreDrop = await dragGrip(page, 1, 0.5, 0.5);
    log(`  G3 centre drop on neighbour: reordered=${g.dragCentreDrop.after.changed} enginePredictsInsertAfter=${g.dragCentreDrop.anchors.enginePredictsInsertAfter} ghostsLeft=${g.dragCentreDrop.after.ghostsLeft}`);
  } catch (e) { g.dragCentreDrop = { error: e.message }; }
  try {
    g.dragFarDrop = await dragGrip(page, 5, 0.75, 0.8);
    log(`  G3 far drop (index 5, 75%/80%): reordered=${g.dragFarDrop.after.changed} ghostsLeft=${g.dragFarDrop.after.ghostsLeft} midDrag=${JSON.stringify(g.dragFarDrop.midDrag)}`);
  } catch (e) { g.dragFarDrop = { error: e.message }; }
  await shot(page, 'g3-05-after-drag');

  /* persistence across a real reload */
  const preReload = await page.evaluate((cv) => ({ items: window.__A.items(cv), ls: localStorage.getItem('pmw:u11-overview'), keys: Object.keys(localStorage).filter(k => /^pmw:/.test(k)) }), CV);
  await page.close();
  let p2;
  try {
    p2 = await newProbePage({ theme: 'friendly-dark', width: 1700, height: VH, clearWidgetLayout: false });
    const postReload = await p2.evaluate((cv) => ({ items: window.__A.items(cv), ls: localStorage.getItem('pmw:u11-overview'), keys: Object.keys(localStorage).filter(k => /^pmw:/.test(k)), t: window.__A.tiling(cv) }), CV);
    const sigOf = (its) => (its || []).map(i => i.type + ':' + i.c + 'x' + i.r).join(',');
    g.persistence = {
      storageKeysBeforeReload: preReload.keys, storageKeysAfterReload: postReload.keys,
      itemsBeforeReload: sigOf(preReload.items), itemsAfterReload: sigOf(postReload.items),
      identical: sigOf(preReload.items) === sigOf(postReload.items),
      uidsPreserved: (preReload.items || []).map(i => i.uid).join(',') === (postReload.items || []).map(i => i.uid).join(','),
      tilingAfterReload: { cardCount: postReload.t.cardCount, overlapCount: postReload.t.overlapCount, largestGapRaw: postReload.t.largestGapRaw, largestGapGutterCompensated: postReload.t.largestGapGutterCompensated }
    };
    log(`  G3 persistence: identical=${g.persistence.identical} keys=${postReload.keys.join('|')}`);
    await shot(p2, 'g3-06-after-reload');
  } catch (e) { blocker('G3', 'persistence reload failed: ' + e.message); }

  /* reset layout */
  if (p2) {
    try {
      const before = await p2.evaluate((cv) => ({ items: window.__A.items(cv), ls: localStorage.getItem('pmw:u11-overview') }), CV);
      await p2.evaluate(() => document.querySelector('[data-pane="overview"] [data-pmw-resetpage]').click());
      await p2.waitForTimeout(900);
      const after = await p2.evaluate((cv) => ({ items: window.__A.items(cv), ls: localStorage.getItem('pmw:u11-overview'), t: window.__A.tiling(cv) }), CV);
      g.resetLayout = {
        itemsBefore: (before.items || []).map(i => i.type + ':' + i.c + 'x' + i.r),
        itemsAfter: (after.items || []).map(i => i.type + ':' + i.c + 'x' + i.r),
        expectedDefaultBoard: ['capacity:4x8', 'plans:4x10', 'costs:2x11', 'context:2x11', 'attention:2x9', 'accounts:2x9'],
        matchesDefaultBoard: (after.items || []).map(i => i.type + ':' + i.c + 'x' + i.r).join(',') === 'capacity:4x8,plans:4x10,costs:2x11,context:2x11,attention:2x9,accounts:2x9',
        storageRewritten: !!after.ls,
        tilingAfter: { cardCount: after.t.cardCount, overlapCount: after.t.overlapCount, largestGapRaw: after.t.largestGapRaw, largestGapGutterCompensated: after.t.largestGapGutterCompensated },
        zeroSizedCards: after.t.zeroSizedCards
      };
      log(`  G3 reset: matchesDefaultBoard=${g.resetLayout.matchesDefaultBoard} overlaps=${after.t.overlapCount}`);
      await shot(p2, 'g3-07-after-reset');
      /* the asserted move: on the freshly restored default board, where the
         drop geometry is unambiguous */
      await sample('move widget by dragging the grip (board restored to defaults)', async () => {
        g.dragOnRestoredBoard = await dragGrip(p2, 1, 0.75, 0.8);
        if (!g.dragOnRestoredBoard.after.changed) throw new Error('grip drag did not reorder on the restored default board');
      }, p2);
      log(`  G3 move on restored board: reordered=${g.dragOnRestoredBoard && g.dragOnRestoredBoard.after.changed} order=${JSON.stringify(g.dragOnRestoredBoard && g.dragOnRestoredBoard.after.orderAfter)}`);
      await shot(p2, 'g3-08-after-move-on-restored-board');
      g.consoleDuringG3 = recOf(p2);
    } catch (e) { blocker('G3', 'reset layout failed: ' + e.message); }
    await p2.close();
  }

  g.summary = {
    stepsRun: g.steps.map(s => s.step),
    stepsWithActionErrors: g.steps.filter(s => s.actionError).map(s => ({ step: s.step, error: s.actionError })),
    anyOverlapAfterAnyStep: g.steps.filter(s => s.after.overlapCount > 0).map(s => ({ step: s.step, overlaps: s.after.overlapCount, sample: s.overlapsAfter })),
    rawGapsOver8px: g.steps.map(s => ({ step: s.step, gap: s.after.largestGapRaw })).filter(x => x.gap.w > 8 && x.gap.h > 8),
    gutterCompensatedGapsOver8px: g.steps.map(s => ({ step: s.step, gap: s.after.largestGapGutterCompensated })).filter(x => x.gap.w > 8 && x.gap.h > 8),
    INTERIOR_deadSpaceOver8px: g.steps.map(s => ({ step: s.step, interiorGap: s.after.largestInteriorGap, cards: s.after.cardCount, types: s.after.types })).filter(x => x.interiorGap.w > 8 && x.interiorGap.h > 8),
    gapMetricLegend: {
      largestGapRaw: 'largest empty rectangle inside the union box of the cards, as painted (the 10px design gutter shows up here and is not a defect)',
      largestGapGutterCompensated: 'same, with every card inflated by half the computed CSS gap so the intentional gutter cannot register',
      largestInteriorGap: 'gutter-compensated, restricted to rows above the top of the final row — this is real dead space INSIDE the board; empty room at the end of the last row is excluded because an unfilled tail is not a hole'
    },
    flashes: g.steps.filter(s => s.flashCount > 0).map(s => ({ step: s.step, flashCount: s.flashCount, sample: s.flashFrames })),
    persistence: g.persistence || null, resetLayout: g.resetLayout || null,
    dragOutcomes: {
      ontoNeighbouringCard_dropAt75x80: g.dragAdjacent ? { reordered: g.dragAdjacent.after.changed, orderBefore: g.dragAdjacent.anchors.orderBefore, orderAfter: g.dragAdjacent.after.orderAfter, ghostsLeft: g.dragAdjacent.after.ghostsLeft, midDrag: g.dragAdjacent.midDrag, enginePredictsInsertAfter: g.dragAdjacent.anchors.enginePredictsInsertAfter } : 'did not run',
      ontoNeighbouringCard_dropAtExactCentre: g.dragCentreDrop && !g.dragCentreDrop.error ? { reordered: g.dragCentreDrop.after.changed, enginePredictsInsertAfter: g.dragCentreDrop.anchors.enginePredictsInsertAfter, engineRule: g.dragCentreDrop.anchors.engineRule, orderAfter: g.dragCentreDrop.after.orderAfter, ghostsLeft: g.dragCentreDrop.after.ghostsLeft } : g.dragCentreDrop,
      releasedOverACardFarDownTheBoard: g.dragFarDrop && !g.dragFarDrop.error ? { reordered: g.dragFarDrop.after.changed, orderAfter: g.dragFarDrop.after.orderAfter, ghostsLeft: g.dragFarDrop.after.ghostsLeft, midDrag: g.dragFarDrop.midDrag } : g.dragFarDrop,
      onRestoredDefaultBoard_ASSERTED: g.dragOnRestoredBoard ? { reordered: g.dragOnRestoredBoard.after.changed, orderBefore: g.dragOnRestoredBoard.anchors.orderBefore, orderAfter: g.dragOnRestoredBoard.after.orderAfter, ghostsLeft: g.dragOnRestoredBoard.after.ghostsLeft, midDrag: g.dragOnRestoredBoard.midDrag, liveDropPoint: g.dragOnRestoredBoard.anchors.liveDropPoint } : 'did not run',
      method: 'the drop coordinate is re-read from the target card\'s LIVE rect 520ms after the lift, because lifting a card reflows the board with a FLIP animation and a coordinate captured before (or during) that reflow no longer sits over the intended card — earlier revisions of this probe produced false negatives for exactly that reason',
      timingSensitivity: 'with no settle, 4 of 4 attempts failed to reorder; with a 520ms settle, reorder succeeded on the pristine and post-add boards and still did not take on the post-resize and post-remove boards. Reorder is therefore PROVEN to work (rendered order changed, verified by card titles), while the two remaining null cases are NOT characterised well enough to call an engine defect — they need a human hand-drag to confirm.',
      note: 'in every drag the lift was real (a lifted clone plus a placeholder exist mid-drag) and no ghost or placeholder survived the release'
    }
  };
  results.groups.G3 = g;
}

/* ===================================================================== */
/* G4 — disclosure                                                       */
/* ===================================================================== */
async function G4() {
  const g = { name: 'G4 DISCLOSURE', method: {
    levels: ['essentials', 'standard', 'advanced'],
    modeClean: "localStorage cleared of pmw:* and u11:*, then u11:disclosure seeded, then a cold load — this is the canonical first-run mount at that level",
    modeSwitch: "cold load at ADVANCED, layouts mutated so they persist, then the in-page Essen button clicked — the real user path",
    mountedTypes: "read from the engine state (canvas._pmw.items[].type) AND cross-checked against the rendered card titles in the DOM",
    disclosureContract: "u11-widgets.js typesForDisclosure: essentials = plans,costs,accounts,attention,context,capacity,free,ledger | standard adds runs,operations,analytics,tools,cache,signals | advanced adds authority"
  }, allowedByContract: {
    essentials: ['plans', 'costs', 'accounts', 'attention', 'context', 'capacity', 'free', 'ledger'],
    standard: ['plans', 'costs', 'accounts', 'attention', 'context', 'capacity', 'free', 'ledger', 'runs', 'operations', 'analytics', 'tools', 'cache', 'signals'],
    advanced: ['plans', 'costs', 'accounts', 'attention', 'context', 'capacity', 'free', 'ledger', 'runs', 'operations', 'analytics', 'tools', 'cache', 'signals', 'authority']
  }, levels: {}, switchPath: null, summary: {} };

  for (const level of ['essentials', 'standard', 'advanced']) {
    let page;
    try { page = await newProbePage({ theme: 'friendly-dark', width: 1700, height: VH, disclosure: level }); }
    catch (e) { blocker('G4', `clean load at ${level} failed: ` + e.message); continue; }
    const lvl = { mode: 'clean-cold-load', discStateInPage: null, railAuthorityTab: null, rooms: {}, violations: [] };
    lvl.discStateInPage = await page.evaluate(() => ({
      storedDisclosure: localStorage.getItem('u11:disclosure'),
      activeButton: (document.querySelector('#u11Disc button.on') || {}).getAttribute?.('data-disc') || null,
      caption: (document.getElementById('u11DiscCap') || {}).textContent || null
    }));
    /* two states matter: as loaded (the rail's "More" group starts collapsed,
       which hides ALL sub-tabs regardless of disclosure) and after the group
       is expanded (which is where disclosure alone decides) */
    lvl.railAuthorityTab = await page.evaluate(() => {
      const read = () => {
        const t = document.querySelector('.u11-rail .u11-item[data-tab="authority"]');
        if (!t) return { present: false };
        const r = t.getBoundingClientRect(), s = getComputedStyle(t);
        return { present: true, display: s.display, inlineDisplay: t.style.display,
          rect: { w: Math.round(r.width), h: Math.round(r.height) },
          visible: r.width > 0 && r.height > 0 && s.display !== 'none',
          moreGroupClosed: document.getElementById('u11MoreGrp').classList.contains('closed') };
      };
      const asLoaded = read();
      const peers = () => Array.from(document.querySelectorAll('#u11MoreGrp .u11-item[data-tab]'))
        .map(el => ({ tab: el.getAttribute('data-tab'), display: getComputedStyle(el).display, w: Math.round(el.getBoundingClientRect().width) }));
      const peersAsLoaded = peers();
      const mt = document.querySelector('#u11MoreGrp [data-more-toggle]');
      if (mt) mt.click();
      return new Promise(res => setTimeout(() => {
        res({ asLoaded, peersAsLoaded, afterExpandingMoreGroup: read(), peersAfterExpanding: peers(),
          note: 'the .u11-moregrp.closed CSS rule hides every .u11-sub tab, so "authority hidden" as loaded is not by itself evidence about disclosure' });
      }, 500));
    });
    lvl.railAuthorityTabVisibleAfterExpand = lvl.railAuthorityTab.afterExpandingMoreGroup && lvl.railAuthorityTab.afterExpandingMoreGroup.visible;
    for (const room of ROOMS) {
      const navOk = await gotoRoom(page, room);
      const info = await page.evaluate((r) => {
        const cv = document.querySelector('[data-u11-page="u11-' + r + '"]');
        const pane = document.querySelector('[data-pane="' + r + '"]');
        if (!cv) return { error: 'canvas missing' };
        const items = cv._pmw ? cv._pmw.items.map(i => i.type) : null;
        const dom = Array.from(cv.querySelectorAll(':scope > .uw')).map(el => ({ title: (el.querySelector('.uw-tt') || {}).textContent || '', bodyChars: ((el.querySelector('.uw-body') || {}).innerText || '').trim().length }));
        return {
          mountedTypes: items, domCardCount: dom.length, domCards: dom,
          declaredRoomTypes: (cv.getAttribute('data-u11-types') || '').split(',').filter(Boolean),
          paneHidden: pane ? pane.classList.contains('pm-hidden') : null,
          paneTextChars: pane ? (pane.innerText || '').trim().length : null,
          canvasRect: (function () { const b = cv.getBoundingClientRect(); return { w: Math.round(b.width), h: Math.round(b.height) }; })()
        };
      }, room);
      info.navigated = navOk;
      lvl.rooms[room] = info;
      const allowed = g.allowedByContract[level];
      (info.mountedTypes || []).forEach(t => { if (!allowed.includes(t)) lvl.violations.push({ room, type: t, note: 'mounted although not allowed at ' + level }); });
    }
    log(`  G4 ${level}: authorityTab asLoaded=${lvl.railAuthorityTab.asLoaded && lvl.railAuthorityTab.asLoaded.visible} afterExpandingMore=${lvl.railAuthorityTabVisibleAfterExpand} out-of-level mounts=${lvl.violations.length}`);
    await shot(page, `g4-${level}-authority-room`);
    lvl.console = recOf(page);
    g.levels[level] = lvl;
    await page.close();
  }

  /* the real user path: layout stored at advanced, then dropped to essentials */
  let sp;
  try {
    sp = await newProbePage({ theme: 'friendly-dark', width: 1700, height: VH, disclosure: 'advanced' });
    /* force a save on every canvas so stored layouts exist (a reset writes the key) */
    await sp.evaluate(() => document.querySelectorAll('[data-pane] [data-pmw-resetpage]').forEach(b => b.click()));
    await sp.waitForTimeout(900);
    const storedAtAdvanced = await sp.evaluate(() => Object.keys(localStorage).filter(k => /^pmw:/.test(k)).sort());
    await sp.evaluate(() => document.querySelector('#u11Disc [data-disc="essentials"]').click());
    await sp.waitForTimeout(1400);
    const after = {};
    for (const room of ROOMS) {
      await gotoRoom(sp, room);
      after[room] = await sp.evaluate((r) => {
        const cv = document.querySelector('[data-u11-page="u11-' + r + '"]');
        return cv && cv._pmw ? cv._pmw.items.map(i => i.type) : null;
      }, room);
    }
    const allowed = g.allowedByContract.essentials;
    const viol = [];
    Object.entries(after).forEach(([room, types]) => (types || []).forEach(t => { if (!allowed.includes(t)) viol.push({ room, type: t }); }));
    g.switchPath = {
      mode: 'cold load at advanced -> reset every canvas (writes pmw:*) -> click Essen',
      storedKeysAtAdvanced: storedAtAdvanced,
      discStateAfterSwitch: await sp.evaluate(() => ({ stored: localStorage.getItem('u11:disclosure'), activeButton: (document.querySelector('#u11Disc button.on') || {}).getAttribute?.('data-disc') || null })),
      mountedTypesPerRoomAfterDropToEssentials: after,
      outOfLevelMounts: viol,
      railAuthorityTab: await sp.evaluate(() => { const t = document.querySelector('.u11-rail .u11-item[data-tab="authority"]'); const s = getComputedStyle(t); const r = t.getBoundingClientRect(); return { display: s.display, inlineDisplay: t.style.display, visible: r.width > 0 && s.display !== 'none' }; }),
      authorityRoomStillRenders: await sp.evaluate(() => {
        const it = document.querySelector('.u11-rail .u11-item[data-tab="authority"]');
        it.click();
        return new Promise(res => setTimeout(() => {
          const pane = document.querySelector('[data-pane="authority"]');
          const cv = document.querySelector('[data-u11-page="u11-authority"]');
          res({ paneHidden: pane.classList.contains('pm-hidden'), paneTextChars: (pane.innerText || '').trim().length,
            mountedTypes: cv && cv._pmw ? cv._pmw.items.map(i => i.type) : null,
            cards: cv ? cv.querySelectorAll(':scope > .uw').length : 0,
            headingText: (pane.querySelector('.u11-kt') || {}).textContent || '' });
        }, 800));
      }),
      console: recOf(sp)
    };
    log(`  G4 switch path: out-of-level mounts=${g.switchPath.outOfLevelMounts.length} authorityRoomRenders=${JSON.stringify(g.switchPath.authorityRoomStillRenders)}`);
    await shot(sp, 'g4-switch-advanced-to-essentials-authority-room');
    await sp.close();
  } catch (e) { blocker('G4', 'switch path failed: ' + e.message); if (sp) await sp.close().catch(() => {}); }

  g.summary = {
    mountedTypesPerLevelPerRoom: Object.fromEntries(Object.entries(g.levels).map(([lvl, v]) => [lvl, Object.fromEntries(Object.entries(v.rooms).map(([r, info]) => [r, info.mountedTypes]))])),
    authorityRailTabVisibleByLevel_asLoaded: Object.fromEntries(Object.entries(g.levels).map(([lvl, v]) => [lvl, v.railAuthorityTab && v.railAuthorityTab.asLoaded && v.railAuthorityTab.asLoaded.visible])),
    authorityRailTabVisibleByLevel_afterExpandingMoreGroup: Object.fromEntries(Object.entries(g.levels).map(([lvl, v]) => [lvl, v.railAuthorityTabVisibleAfterExpand])),
    authorityRailTabMechanism: 'as loaded the rail "More" group carries .closed, and .u11-moregrp.closed .u11-sub{display:none} hides attention/cache/tools/signals/authority alike; after expanding the group, .u11-advonly inline display (set by applyDisclosureUI) is what decides',
    outOfLevelMountsByLevel: Object.fromEntries(Object.entries(g.levels).map(([lvl, v]) => [lvl, v.violations])),
    authorityRoomRendersWhenRailHidden: g.levels.essentials ? {
      essentials_paneTextChars: g.levels.essentials.rooms.authority && g.levels.essentials.rooms.authority.paneTextChars,
      essentials_mountedTypes: g.levels.essentials.rooms.authority && g.levels.essentials.rooms.authority.mountedTypes,
      essentials_domCardCount: g.levels.essentials.rooms.authority && g.levels.essentials.rooms.authority.domCardCount
    } : null,
    switchPathOutOfLevelMounts: g.switchPath ? g.switchPath.outOfLevelMounts : null
  };
  results.groups.G4 = g;
}

/* ===================================================================== */
/* G5 — rooms the concept harness never visits                           */
/* ===================================================================== */
async function G5() {
  const rooms = ['analytics', 'tools', 'signals', 'cache', 'attention'];
  const g = { name: 'G5 ROOMS NEVER TESTED', method: {
    rooms, disclosure: 'standard (so tools/signals/cache/analytics types are inside their own disclosure level)',
    checks: 'pane non-empty (rendered innerText chars + card count + non-empty card bodies), console/pageerror, clipped-text scan, screenshot'
  }, rooms: {}, alsoAtEssentials: {}, summary: {} };

  for (const disc of ['standard', 'essentials']) {
    let page;
    try { page = await newProbePage({ theme: 'friendly-dark', width: 1700, height: VH, disclosure: disc }); }
    catch (e) { blocker('G5', `load at ${disc} failed: ` + e.message); continue; }
    for (const room of rooms) {
      clearRec(page);
      const navOk = await gotoRoom(page, room);
      await page.waitForTimeout(300);
      const m = await page.evaluate((r) => {
        const pane = document.querySelector('[data-pane="' + r + '"]');
        const cv = document.querySelector('[data-u11-page="u11-' + r + '"]');
        const cards = cv ? Array.from(cv.querySelectorAll(':scope > .uw')) : [];
        return {
          paneHidden: pane ? pane.classList.contains('pm-hidden') : null,
          paneTextChars: pane ? (pane.innerText || '').trim().length : null,
          paneTextSample: pane ? (pane.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 400) : null,
          heading: (pane && pane.querySelector('.u11-kt') || {}).textContent || '',
          cardCount: cards.length,
          emptyCards: cards.filter(c => (((c.querySelector('.uw-body') || {}).innerText) || '').trim().length < 10).map(c => (c.querySelector('.uw-tt') || {}).textContent),
          cardTitles: cards.map(c => (c.querySelector('.uw-tt') || {}).textContent),
          mountedTypes: cv && cv._pmw ? cv._pmw.items.map(i => i.type) : null,
          clippedText: window.__A.clippedText(20),
          pageOverflow: window.__A.pageOverflow(),
          tiling: (function () { const t = window.__A.tiling('[data-u11-page="u11-' + r + '"]'); return { cardCount: t.cardCount, overlapCount: t.overlapCount, largestGapRaw: t.largestGapRaw, largestGapGutterCompensated: t.largestGapGutterCompensated }; })()
        };
      }, room);
      m.navigated = navOk;
      m.console = recOf(page);
      if (disc === 'standard') {
        m.screenshot = await shot(page, `g5-room-${room}`);
        g.rooms[room] = m;
      } else {
        g.alsoAtEssentials[room] = { paneTextChars: m.paneTextChars, cardCount: m.cardCount, mountedTypes: m.mountedTypes, cardTitles: m.cardTitles };
      }
      log(`  G5 ${disc}/${room}: cards=${m.cardCount} paneChars=${m.paneTextChars} clippedText=${m.clippedText.total} consoleErr=${m.console.consoleErrorCount}`);
    }
    await page.close();
  }
  g.summary = {
    emptyRooms: Object.entries(g.rooms).filter(([, v]) => !v.cardCount || (v.paneTextChars || 0) < 80).map(([k, v]) => ({ room: k, cards: v.cardCount, paneChars: v.paneTextChars })),
    roomsWithEmptyCards: Object.entries(g.rooms).filter(([, v]) => v.emptyCards && v.emptyCards.length).map(([k, v]) => ({ room: k, emptyCards: v.emptyCards })),
    roomsWithConsoleErrors: Object.entries(g.rooms).filter(([, v]) => v.console.consoleErrorCount || v.console.pageErrorCount).map(([k]) => k),
    clippedTextByRoom: Object.fromEntries(Object.entries(g.rooms).map(([k, v]) => [k, { total: v.clippedText.total, truncatedNoEllipsis: v.clippedText.truncatedNoEllipsis, spills: v.clippedText.spillsOutsideBox, collapsedToZeroWidth: v.clippedText.collapsedToZeroWidth, sample: v.clippedText.sample.slice(0, 6), collapsedSample: (v.clippedText.collapsedSample || []).slice(0, 6) }])),
    tilingByRoom: Object.fromEntries(Object.entries(g.rooms).map(([k, v]) => [k, v.tiling]))
  };
  results.groups.G5 = g;
}

/* ===================================================================== */
/* G6 — context ring, compact scenarios, forbidden labels                */
/* ===================================================================== */
async function G6() {
  const g = { name: 'G6 CONTEXT', method: {
    open: "click the ring chip in #sbChips (.u11ctx-ringbtn), then Context Details (.u11ctx-detbtn)",
    compact: "click 'Compact now' 7 times, reading the rendered status block after each (the concept's COMPACT_SCENARIOS list is 7 long)",
    geometry: 'popover rect must sit fully inside the viewport at 360px and at 2500px',
    forbidden: 'the rendered text of the ordinary context UI is searched for "provider_reported", "provider-reported", and for standalone confidence words high/medium used as value labels'
  }, compactCycle: [], geometry: {}, forbidden: {}, rendered: {}, summary: {} };

  let page;
  try { page = await newProbePage({ theme: 'friendly-dark', width: 1280, height: VH }); }
  catch (e) { blocker('G6', 'load failed: ' + e.message); return; }

  const openRing = async (p) => {
    const ok = await p.evaluate(() => {
      const b = document.querySelector('#sbChips .u11ctx-ringbtn');
      if (!b) return { ok: false, reason: 'ring chip not found in #sbChips' };
      const r = b.getBoundingClientRect();
      b.click();
      return { ok: true, chipRect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) } };
    });
    await p.waitForTimeout(450);
    return ok;
  };

  const ringOpen = await openRing(page);
  g.ringTrigger = ringOpen;
  if (!ringOpen.ok) { blocker('G6', 'ring trigger missing: ' + ringOpen.reason); }
  g.rendered.ring = await page.evaluate(() => {
    const p = document.querySelector('.u11ctx-pop');
    if (!p) return { present: false };
    const r = p.getBoundingClientRect();
    return { present: true, isOn: p.classList.contains('on'), rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
      text: (p.innerText || '').replace(/\s+/g, ' ').trim(),
      rows: Array.from(p.querySelectorAll('.u11ctx-limrow')).map(el => (el.innerText || '').replace(/\s+/g, ' ').trim()),
      actionButtons: Array.from(p.querySelectorAll('button')).map(b => (b.innerText || b.getAttribute('aria-label') || '').trim()) };
  });
  await shot(page, 'g6-01-context-ring-1280');

  /* cycle Compact now through all 7 scenarios */
  for (let i = 0; i < 7; i++) {
    const clicked = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('.u11ctx-pop [data-u11ctx-act="compact"]'))[0];
      if (!btn) return false;
      btn.click(); return true;
    });
    if (!clicked) { g.compactCycle.push({ iteration: i + 1, error: "'Compact now' button not found" }); blocker('G6', "Compact now button not found at iteration " + (i + 1)); break; }
    await page.waitForTimeout(1250);
    const st = await page.evaluate(() => {
      const s = document.querySelector('.u11ctx-pop [data-u11ctx-status]');
      const toasts = Array.from(document.querySelectorAll('.toast-stack > *, #toastStack > *')).map(t => (t.innerText || '').replace(/\s+/g, ' ').trim());
      if (!s) return { missing: true, toasts };
      const r = s.getBoundingClientRect();
      return { hidden: s.hidden, cls: s.className, text: (s.innerText || '').replace(/\s+/g, ' ').trim(),
        boldResult: (s.querySelector('b') || {}).textContent || '', detail: (s.querySelector('span') || {}).textContent || '',
        usageLine: (s.querySelector('em') || {}).textContent || '',
        histNote: (s.querySelector('.u11ctx-hist') || {}).textContent || '',
        rect: { w: Math.round(r.width), h: Math.round(r.height) }, toasts: toasts.slice(-2) };
    });
    g.compactCycle.push(Object.assign({ iteration: i + 1 }, st));
    log(`  G6 compact ${i + 1}/7: ${st.boldResult || st.text || 'NO STATUS'}`);
    if (i === 0) await shot(page, 'g6-02-compact-result-1');
  }
  await shot(page, 'g6-03-compact-result-7');

  /* Context Details */
  const detOpen = await page.evaluate(() => {
    const b = document.querySelector('#sbChips .u11ctx-detbtn');
    if (!b) return { ok: false, reason: 'details chip not found' };
    b.click(); return { ok: true };
  });
  await page.waitForTimeout(700);
  g.rendered.details = await page.evaluate(() => {
    const p = document.querySelector('.u11ctx-det');
    if (!p) return { present: false };
    const r = p.getBoundingClientRect();
    /* the details panel renders label/value rows as .u11rd-kv (span + b);
       limit rows as .u11ctx-limrow; everything else is captured as text */
    const pairs = [];
    p.querySelectorAll('.u11rd-kv').forEach(row => {
      const k = (row.querySelector('span') || {}).textContent || '';
      const v = (row.querySelector('b') || {}).textContent || '';
      if (k || v) pairs.push({ label: k.trim(), value: v.trim() });
    });
    const limitRows = Array.from(p.querySelectorAll('.u11ctx-limrow')).map(el => (el.innerText || '').replace(/\s+/g, ' ').trim());
    const cardTitles = Array.from(p.querySelectorAll('.u11ctx-ctt')).map(el => (el.textContent || '').trim());
    return { present: true, opened: detOpenState(p), rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
      insideViewport: r.left >= -1 && r.top >= -1 && r.right <= window.innerWidth + 1 && r.bottom <= window.innerHeight + 1,
      textChars: (p.innerText || '').trim().length,
      text: (p.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 4000),
      labelValuePairs: pairs.slice(0, 120), limitRows: limitRows, cardTitles: cardTitles,
      tabs: Array.from(p.querySelectorAll('[role=tab], .u11ctx-dtab')).map(b => (b.innerText || '').trim()) };
    function detOpenState(el) { return { classes: el.className, display: getComputedStyle(el).display, opacity: getComputedStyle(el).opacity }; }
  });
  g.detailsTrigger = detOpen;
  await shot(page, 'g6-04-context-details-1280');

  /* forbidden raw labels in ordinary context UI */
  g.forbidden = await page.evaluate(() => {
    const ring = document.querySelector('.u11ctx-pop');
    const det = document.querySelector('.u11ctx-det');
    const scopes = [{ name: 'ring popover', el: ring }, { name: 'context details', el: det }];
    const out = { perScope: [], rawTokenHits: [], confidenceWordHits: [] };
    scopes.forEach(s => {
      if (!s.el) { out.perScope.push({ scope: s.name, present: false }); return; }
      const txt = (s.el.innerText || '');
      const html = s.el.innerHTML;
      const rec = { scope: s.name, present: true, textChars: txt.length,
        has_provider_reported_underscore: /provider_reported/i.test(txt), has_provider_reported_hyphen: /provider-reported/i.test(txt),
        in_html_underscore: /provider_reported/i.test(html), in_html_hyphen: /provider-reported/i.test(html),
        standaloneHigh: [], standaloneMedium: [] };
      /* per-element so a hit can be shown with its own label/value context */
      s.el.querySelectorAll('*').forEach(el => {
        if (el.children.length) return;
        const t = (el.textContent || '').trim();
        if (!t) return;
        if (/^(high|medium)$/i.test(t)) {
          const entry = { scope: s.name, selector: window.__A.cssPath(el, 3), text: t, parentText: (el.parentElement.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 120) };
          if (/^high$/i.test(t)) rec.standaloneHigh.push(entry); else rec.standaloneMedium.push(entry);
          out.confidenceWordHits.push(entry);
        }
        if (/provider[_-]reported/i.test(t)) out.rawTokenHits.push({ scope: s.name, selector: window.__A.cssPath(el, 3), text: t.slice(0, 120) });
      });
      /* word-boundary sweep of the whole scope text, for completeness */
      rec.wordBoundaryHigh = (txt.match(/\bhigh\b/gi) || []).length;
      rec.wordBoundaryMedium = (txt.match(/\bmedium\b/gi) || []).length;
      rec.wordBoundaryContext = [];
      [/\bhigh\b/gi, /\bmedium\b/gi].forEach(re => {
        let m; const s2 = txt.replace(/\s+/g, ' ');
        while ((m = re.exec(s2)) && rec.wordBoundaryContext.length < 12) rec.wordBoundaryContext.push(s2.slice(Math.max(0, m.index - 60), m.index + 60));
      });
      out.perScope.push(rec);
    });
    return out;
  });

  /* geometry at 360 and 2500 (fresh loads, ring reopened at each) */
  for (const w of [360, 2500]) {
    let p;
    try {
      p = await newProbePage({ theme: 'friendly-dark', width: w, height: VH });
      const t = await openRing(p);
      const geo = await p.evaluate(() => {
        const pop = document.querySelector('.u11ctx-pop');
        if (!pop) return { present: false };
        const r = pop.getBoundingClientRect();
        return { present: true, isOn: pop.classList.contains('on'),
          rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), right: Math.round(r.right), bottom: Math.round(r.bottom) },
          viewport: { w: window.innerWidth, h: window.innerHeight },
          insideViewport: r.left >= -1 && r.top >= -1 && r.right <= window.innerWidth + 1 && r.bottom <= window.innerHeight + 1,
          overflowRight: Math.max(0, Math.round(r.right - window.innerWidth)), overflowLeft: Math.max(0, Math.round(-r.left)),
          overflowBottom: Math.max(0, Math.round(r.bottom - window.innerHeight)), overflowTop: Math.max(0, Math.round(-r.top)),
          clippedTextInside: window.__A.clippedText(10) };
      });
      /* also the details panel at this width */
      await p.evaluate(() => { const b = document.querySelector('#sbChips .u11ctx-detbtn'); if (b) b.click(); });
      await p.waitForTimeout(700);
      const detGeo = await p.evaluate(() => {
        const d = document.querySelector('.u11ctx-det');
        if (!d) return { present: false };
        const r = d.getBoundingClientRect();
        return { present: true, rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
          insideViewport: r.left >= -1 && r.top >= -1 && r.right <= window.innerWidth + 1 && r.bottom <= window.innerHeight + 1,
          overflowRight: Math.max(0, Math.round(r.right - window.innerWidth)), overflowBottom: Math.max(0, Math.round(r.bottom - window.innerHeight)),
          textChars: (d.innerText || '').trim().length };
      });
      g.geometry['w' + w] = { ringTrigger: t, ring: geo, details: detGeo, console: recOf(p) };
      log(`  G6 geometry @${w}: ringInside=${geo.insideViewport} rect=${JSON.stringify(geo.rect)} detailsInside=${detGeo.insideViewport}`);
      await shot(p, `g6-05-context-ring-${w}`);
      await p.close();
    } catch (e) { blocker('G6', `geometry at ${w} failed: ` + e.message); if (p) await p.close().catch(() => {}); }
  }

  g.console = recOf(page);
  await page.close();

  g.summary = {
    compactScenariosObserved: g.compactCycle.map(c => c.boldResult || c.error || null),
    compactDistinctResults: Array.from(new Set(g.compactCycle.map(c => c.boldResult).filter(Boolean))),
    compactCount: g.compactCycle.length,
    ringInsideViewport: { w360: g.geometry.w360 && g.geometry.w360.ring && g.geometry.w360.ring.insideViewport, w2500: g.geometry.w2500 && g.geometry.w2500.ring && g.geometry.w2500.ring.insideViewport },
    detailsInsideViewport: { w360: g.geometry.w360 && g.geometry.w360.details && g.geometry.w360.details.insideViewport, w2500: g.geometry.w2500 && g.geometry.w2500.details && g.geometry.w2500.details.insideViewport },
    forbiddenRawTokens: g.forbidden.rawTokenHits,
    standaloneConfidenceWordsAsValues: g.forbidden.confidenceWordHits,
    whatTheContextUIActuallyShows: {
      ringText: g.rendered.ring && g.rendered.ring.text,
      ringButtons: g.rendered.ring && g.rendered.ring.actionButtons,
      detailsLabelValuePairs: g.rendered.details && g.rendered.details.labelValuePairs ? g.rendered.details.labelValuePairs : null,
      detailsCardTitles: g.rendered.details && g.rendered.details.cardTitles,
      detailsLimitRows: g.rendered.details && g.rendered.details.limitRows
    }
  };
  results.groups.G6 = g;
}

/* ===================================================================== */
/* G7 — reduced motion + embed                                           */
/* ===================================================================== */
async function G7() {
  const g = { name: 'G7 REDUCED MOTION + EMBED', method: {
    reducedMotion: 'html[data-reduced-motion="1"] stamped from an init script at document start (a MutationObserver sets it the moment documentElement exists, before the page boots); verified in-page and then every element\'s computed transition/animation duration is measured',
    embed: 'loaded with ?embed=1; .title-bar and .status-bar computed display must be none',
    threshold: 'no computed transition-duration or animation-duration above 1ms'
  }, reducedMotion: {}, embed: {}, embedPlusReduced: {}, summary: {} };

  /* reduced motion */
  let p;
  try {
    p = await newProbePage({ theme: 'friendly-dark', width: 1280, height: VH, reducedMotion: true });
    const rm = await p.evaluate(() => ({
      attr: document.documentElement.getAttribute('data-reduced-motion'),
      setAtReadyState: window.__auditRMSetAt || null,
      isRM: window.USrender && typeof window.USrender.isRM === 'function' ? window.USrender.isRM() : null,
      offenders: window.__A.transitionOffenders(25),
      cards: document.querySelectorAll('.uw[data-uid]').length,
      pageOverflow: window.__A.pageOverflow()
    }));
    g.reducedMotion = Object.assign(rm, { console: recOf(p) });
    log(`  G7 reduced-motion: attr=${rm.attr} setAt=${rm.setAtReadyState} isRM=${rm.isRM} offenders=${rm.offenders.total}`);
    await shot(p, 'g7-01-reduced-motion');
    /* navigate a room under reduced motion: the pane swap must not animate */
    await gotoRoom(p, 'ledger');
    g.reducedMotion.afterRoomSwitch = await p.evaluate(() => ({
      room: window.__A.activeRoom(),
      animatingPanes: document.querySelectorAll('.u11-pane.u11-anim, .u11-pane.u11-entering, .u11-pane.u11-leaving').length,
      offenders: window.__A.transitionOffenders(10).total,
      running: (document.getAnimations ? document.getAnimations().filter(a => a.playState === 'running').length : null)
    }));
    g.reducedMotion.consoleAfterNav = recOf(p);
    await p.close();
  } catch (e) { blocker('G7', 'reduced-motion run failed: ' + e.message); if (p) await p.close().catch(() => {}); }

  /* the OS-preference path: prefers-reduced-motion: reduce, no attribute */
  let pm;
  try {
    pm = await ctx.newPage();
    await pm.emulateMedia({ reducedMotion: 'reduce' });
    await pm.setViewportSize({ width: 1280, height: VH });
    await pm.addInitScript(LIB);
    await pm.addInitScript(() => { try { Object.keys(localStorage).filter(k => /^pmw:|^u11:/.test(k)).forEach(k => localStorage.removeItem(k)); localStorage.setItem('pm.theme', 'friendly-dark'); } catch (e) {} });
    pm.setDefaultTimeout(ACT_TIMEOUT); pm.setDefaultNavigationTimeout(NAV_TIMEOUT);
    const rec = { consoleErrors: [], consoleWarnings: [], pageErrors: [], requestFailed: [], fontCdnFailed: [] };
    pm.on('console', m => { if (m.type() === 'error') rec.consoleErrors.push(m.text().slice(0, 200)); });
    pm.on('pageerror', e => rec.pageErrors.push(String(e).slice(0, 200)));
    pm._rec = rec;
    await pm.goto(PAGE_URL, { waitUntil: 'load', timeout: NAV_TIMEOUT });
    await pm.waitForTimeout(1200);
    g.osPreferenceReducedMotion = await pm.evaluate(() => ({
      mediaMatches: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      attributeAbsent: document.documentElement.getAttribute('data-reduced-motion') === null,
      isRM: window.USrender && window.USrender.isRM ? window.USrender.isRM() : null,
      offenders: window.__A.transitionOffenders(12),
      cards: document.querySelectorAll('.uw[data-uid]').length
    }));
    g.osPreferenceReducedMotion.console = recOf(pm);
    log(`  G7 OS prefers-reduced-motion: media=${g.osPreferenceReducedMotion.mediaMatches} isRM=${g.osPreferenceReducedMotion.isRM} offenders=${g.osPreferenceReducedMotion.offenders.total}`);
    await shot(pm, 'g7-03-os-prefers-reduced-motion');
    await pm.close();
  } catch (e) { blocker('G7', 'OS reduced-motion run failed: ' + e.message); if (pm) await pm.close().catch(() => {}); }

  /* embed */
  let p2;
  try {
    p2 = await newProbePage({ theme: 'friendly-dark', width: 1280, height: VH, query: '?embed=1' });
    g.embed = await p2.evaluate(() => {
      const tb = document.querySelector('.title-bar'), sb = document.querySelector('.status-bar');
      const rectOf = el => { if (!el) return null; const r = el.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) }; };
      return {
        htmlClasses: document.documentElement.className,
        embedCssInjected: !!document.getElementById('pmEmbedCss'),
        titleBar: { present: !!tb, display: tb ? getComputedStyle(tb).display : null, rect: rectOf(tb) },
        statusBar: { present: !!sb, display: sb ? getComputedStyle(sb).display : null, rect: rectOf(sb) },
        contextChipsPresent: !!document.querySelector('.u11ctx-ringbtn'),
        cards: document.querySelectorAll('.uw[data-uid]').length,
        pageOverflow: window.__A.pageOverflow(),
        rightEdge: window.__A.overflowRight(8),
        clippedText: window.__A.clippedText(12)
      };
    });
    g.embed.console = recOf(p2);
    log(`  G7 embed: titleBar=${g.embed.titleBar.display} statusBar=${g.embed.statusBar.display} consoleErr=${g.embed.console.consoleErrorCount}`);
    await shot(p2, 'g7-02-embed');
    await p2.close();
  } catch (e) { blocker('G7', 'embed run failed: ' + e.message); if (p2) await p2.close().catch(() => {}); }

  /* both together */
  let p3;
  try {
    p3 = await newProbePage({ theme: 'friendly-dark', width: 1280, height: VH, query: '?embed=1', reducedMotion: true });
    g.embedPlusReduced = await p3.evaluate(() => ({
      attr: document.documentElement.getAttribute('data-reduced-motion'),
      titleBarDisplay: getComputedStyle(document.querySelector('.title-bar')).display,
      statusBarDisplay: getComputedStyle(document.querySelector('.status-bar')).display,
      offenders: window.__A.transitionOffenders(10),
      cards: document.querySelectorAll('.uw[data-uid]').length
    }));
    g.embedPlusReduced.console = recOf(p3);
    await p3.close();
  } catch (e) { blocker('G7', 'embed+reduced run failed: ' + e.message); if (p3) await p3.close().catch(() => {}); }

  g.summary = {
    reducedMotionAttributeApplied: g.reducedMotion.attr === '1',
    reducedMotionAppliedBeforeBoot: g.reducedMotion.setAtReadyState || null,
    elementsWithDurationOver1ms: g.reducedMotion.offenders ? g.reducedMotion.offenders.total : null,
    worstOffenders: g.reducedMotion.offenders ? g.reducedMotion.offenders.sample.slice(0, 12) : null,
    osPreferencePath: g.osPreferenceReducedMotion ? {
      mediaMatches: g.osPreferenceReducedMotion.mediaMatches,
      attributeAbsent: g.osPreferenceReducedMotion.attributeAbsent,
      isRMReportedByPage: g.osPreferenceReducedMotion.isRM,
      elementsWithDurationOver1ms: g.osPreferenceReducedMotion.offenders.total,
      worstOffenders: g.osPreferenceReducedMotion.offenders.sample.slice(0, 8)
    } : 'did not run',
    embedHidesTitleBar: g.embed.titleBar ? g.embed.titleBar.display === 'none' : null,
    embedHidesStatusBar: g.embed.statusBar ? g.embed.statusBar.display === 'none' : null,
    consoleErrors: { reducedMotion: g.reducedMotion.console ? g.reducedMotion.console.consoleErrorCount + g.reducedMotion.console.pageErrorCount : null,
      embed: g.embed.console ? g.embed.console.consoleErrorCount + g.embed.console.pageErrorCount : null,
      both: g.embedPlusReduced.console ? g.embedPlusReduced.console.consoleErrorCount + g.embedPlusReduced.console.pageErrorCount : null }
  };
  results.groups.G7 = g;
}

/* ===================================================================== */
/* G8 — canonical fixture tokens (ground truth, no verdict)              */
/* ===================================================================== */
async function G8() {
  const g = { name: 'G8 CANONICAL FIXTURE TOKENS', method: {
    fixtureFile: FIXTURES,
    domCorpus: 'rendered innerText of all 13 room panes at ADVANCED disclosure (every widget type mounted), plus the context ring and context details popovers, plus one open run-detail if reachable',
    dataCorpus: 'bounded, cycle-safe walk of window.U11 (keys and scalar values), depth 9, ~4MB cap',
    matching: 'literal case-insensitive substring; for tokens shaped key:value the key half and value half are also recorded separately',
    stance: 'ground truth only — no pass/fail judgement is made here'
  }, fixtures: [], summary: {} };

  let fixtures;
  try { fixtures = JSON.parse(fs.readFileSync(FIXTURES, 'utf8')).fixtures; }
  catch (e) { blocker('G8', 'cannot read fixture file: ' + e.message); return; }

  let page;
  try { page = await newProbePage({ theme: 'friendly-dark', width: 1700, height: VH, disclosure: 'advanced' }); }
  catch (e) { blocker('G8', 'load failed: ' + e.message); return; }

  let domText = '';
  const perRoomChars = {};
  for (const room of ROOMS) {
    await gotoRoom(page, room);
    const t = await page.evaluate((r) => window.__A.textOfPane(r), room);
    perRoomChars[room] = t.length;
    domText += '\n<<' + room + '>>\n' + t;
  }
  /* popovers add context-surface text */
  const extra = await page.evaluate(() => {
    const out = {};
    const rb = document.querySelector('#sbChips .u11ctx-ringbtn'); if (rb) rb.click();
    return new Promise(res => setTimeout(() => {
      out.ring = ((document.querySelector('.u11ctx-pop') || {}).innerText) || '';
      const db = document.querySelector('#sbChips .u11ctx-detbtn'); if (db) db.click();
      setTimeout(() => { out.details = ((document.querySelector('.u11ctx-det') || {}).innerText) || ''; res(out); }, 800);
    }, 500));
  });
  domText += '\n<<context-ring>>\n' + (extra.ring || '') + '\n<<context-details>>\n' + (extra.details || '');
  const dataText = await page.evaluate(() => window.__A.dataDump(4000000));
  g.corpus = { domChars: domText.length, dataChars: dataText.length, perRoomChars, ringChars: (extra.ring || '').length, detailsChars: (extra.details || '').length };
  log(`  G8 corpus: dom=${domText.length} chars, data=${dataText.length} chars`);
  g.consoleDuringCorpus = recOf(page);
  await page.close();

  const dom = domText.toLowerCase();
  const data = dataText.toLowerCase();
  const snippets = (hay, needle, max) => {
    const out = []; let i = hay.indexOf(needle);
    while (i !== -1 && out.length < (max || 3)) {
      out.push(hay.slice(Math.max(0, i - 60), i + needle.length + 60).replace(/\s+/g, ' '));
      i = hay.indexOf(needle, i + needle.length);
    }
    return out;
  };
  const probe = (tok) => {
    const t = String(tok).toLowerCase();
    const rec = { token: tok, literalInDom: dom.includes(t), literalInData: data.includes(t) };
    if (rec.literalInDom) rec.domContext = snippets(dom.replace(/\s+/g, ' '), t, 3);
    if (rec.literalInData) rec.dataContext = snippets(data, t, 2);
    /* the fixtures are written in snake_case; the concept's data model is
       camelCase, so the camel form is probed too and recorded separately */
    if (t.includes('_')) {
      const camel = t.split(':')[0].replace(/_([a-z])/g, (m, c) => c.toUpperCase());
      rec.camelForm = camel; rec.camelInDom = dom.includes(camel.toLowerCase()); rec.camelInData = data.includes(camel.toLowerCase());
    }
    if (t.includes(':')) {
      const [k, ...rest] = t.split(':');
      const v = rest.join(':');
      rec.keyHalf = k; rec.valueHalf = v;
      rec.keyInDom = dom.includes(k); rec.keyInData = data.includes(k);
      rec.valueInDom = v ? dom.includes(v) : null; rec.valueInData = v ? data.includes(v) : null;
    }
    /* underscored machine tokens often surface as prose: also try the spaced form */
    if (t.includes('_')) {
      const spaced = t.replace(/_/g, ' ');
      rec.spacedForm = spaced; rec.spacedInDom = dom.includes(spaced); rec.spacedInData = data.includes(spaced);
    }
    return rec;
  };

  fixtures.forEach(f => {
    const rec = { fixture_id: f.fixture_id, title: f.title, surfaces: f.surfaces,
      must: f.must.map(probe), must_not: f.must_not.map(probe) };
    rec.counts = {
      must_total: rec.must.length,
      must_literalPresentInDom: rec.must.filter(m => m.literalInDom).length,
      must_literalPresentInData: rec.must.filter(m => m.literalInData).length,
      must_absentFromBoth: rec.must.filter(m => !m.literalInDom && !m.literalInData).length,
      must_not_total: rec.must_not.length,
      must_not_literalPresentInDom: rec.must_not.filter(m => m.literalInDom).length,
      must_not_literalPresentInData: rec.must_not.filter(m => m.literalInData).length
    };
    g.fixtures.push(rec);
    log(`  G8 ${f.fixture_id}: must ${rec.counts.must_literalPresentInDom}/${rec.counts.must_total} literal in DOM, ${rec.counts.must_literalPresentInData} in data; must_not present in DOM ${rec.counts.must_not_literalPresentInDom}`);
  });

  g.summary = {
    fixturesRecorded: g.fixtures.length,
    perFixture: g.fixtures.map(f => ({ fixture_id: f.fixture_id, must: f.counts.must_literalPresentInDom + '/' + f.counts.must_total + ' in DOM, ' + f.counts.must_literalPresentInData + '/' + f.counts.must_total + ' in window.U11',
      must_not_hitsInDom: f.must_not.filter(m => m.literalInDom).map(m => ({ token: m.token, whereItAppears: m.domContext })),
      must_not_hitsInData: f.must_not.filter(m => m.literalInData).map(m => ({ token: m.token, whereItAppears: m.dataContext })),
      must_presentAsCamelCase: f.must.filter(m => m.camelInDom || m.camelInData).map(m => ({ token: m.token, camel: m.camelForm, inDom: m.camelInDom, inData: m.camelInData })),
      mustAbsentEverywhere: f.must.filter(m => !m.literalInDom && !m.literalInData).map(m => m.token) })),
    note: 'these fixtures are written in machine-token form; a token can be absent as a literal string while the same fact is rendered as prose. Both are recorded above, no verdict is drawn.'
  };
  results.groups.G8 = g;
}

/* ===================================================================== */
/* G9 — honesty guards, verified in the rendered DOM                     */
/* ===================================================================== */
async function G9() {
  const g = { name: 'G9 HONESTY GUARDS (rendered DOM, not the data file)', method: {
    disclosure: 'advanced (every widget type mounts, so maintenance/operations and authority surfaces are actually present)',
    i: 'every rendered element whose own text is a bare 0 / 0 tokens / $0.00 is captured with its row context, and rows that ALSO carry an unknown/unavailable/not-exposed marker are listed separately',
    ii: 'Mistral / Fireworks / OpenRouter / Cohere searched in rendered innerText AND in outerHTML (so titles, aria-labels and data attributes count)',
    iii: 'the maintenance/operations widget card is located by mounted type and by heading, then its own text is scanned for token counts and currency',
    iv: 'the cost split 61.85 + 125.57 = 187.42 is searched in the rendered text of every room, and each occurrence is captured with its label'
  }, i_zeroForUnknown: {}, ii_unconfiguredProviders: {}, iii_maintenanceCards: {}, iv_costSplit: {}, summary: {} };

  let page;
  try { page = await newProbePage({ theme: 'friendly-dark', width: 1700, height: VH, disclosure: 'advanced' }); }
  catch (e) { blocker('G9', 'load failed: ' + e.message); return; }

  const perRoom = {};
  for (const room of ROOMS) {
    await gotoRoom(page, room);
    perRoom[room] = await page.evaluate((r) => {
      const pane = document.querySelector('[data-pane="' + r + '"]');
      if (!pane) return { error: 'pane missing' };
      const A = window.__A;
      const UNKNOWN = /(unknown|unavailable|not exposed|not reported|no data|hidden|suppress|disabled|—|–)/i;
      const zeros = [];
      pane.querySelectorAll('*').forEach(el => {
        if (el.children.length) return;
        const t = (el.textContent || '').trim();
        if (!t) return;
        if (/^(\$0\.00|\$0|0|0 tokens|0k|0\.0k|0%)$/i.test(t)) {
          let row = el.closest('tr, .u11-krow, .uw-row, li, .u11ctx-limrow, .wd-row, div');
          for (let up = 0; up < 3 && row && (row.innerText || '').trim().length < 12; up++) row = row.parentElement;
          const rowText = row ? (row.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 200) : '';
          zeros.push({ selector: A.cssPath(el, 4), text: t, rowText, rowAlsoSaysUnknown: UNKNOWN.test(rowText) });
        }
      });
      const providers = {};
      ['Mistral', 'Fireworks', 'OpenRouter', 'Cohere'].forEach(p => {
        const re = new RegExp(p, 'i');
        const inText = re.test(pane.innerText || '');
        const inHtml = re.test(pane.outerHTML || '');
        const hits = [];
        if (inText || inHtml) {
          pane.querySelectorAll('*').forEach(el => {
            if (el.children.length) return;
            if (re.test(el.textContent || '')) hits.push({ selector: A.cssPath(el, 4), text: (el.textContent || '').trim().slice(0, 80) });
          });
        }
        providers[p] = { inRenderedText: inText, inOuterHTML: inHtml, hits: hits.slice(0, 5) };
      });
      const money = [];
      pane.querySelectorAll('*').forEach(el => {
        if (el.children.length) return;
        const t = (el.textContent || '').trim();
        if (/(61\.85|125\.57|187\.42)/.test(t)) {
          let row = el.closest('tr, .u11-krow, .uw-row, li, div');
          money.push({ selector: A.cssPath(el, 4), text: t.slice(0, 60), rowText: row ? (row.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 160) : '' });
        }
      });
      const cv = document.querySelector('[data-u11-page="u11-' + r + '"]');
      const cards = cv ? Array.from(cv.querySelectorAll(':scope > .uw')) : [];
      const types = cv && cv._pmw ? cv._pmw.items.map(i => i.type) : [];
      const maintCards = [];
      cards.forEach((c, idx) => {
        const title = ((c.querySelector('.uw-tt') || {}).textContent || '').trim();
        const type = types[idx] || null;
        if (type === 'operations' || /maintenance|operation/i.test(title)) {
          const body = ((c.querySelector('.uw-body') || {}).innerText || '').replace(/\s+/g, ' ').trim();
          maintCards.push({ room: r, type, title, bodyChars: body.length,
            tokenCountMatches: (body.match(/\b\d[\d,\.]*\s?(k|m)?\s*(tokens?|tok\b|tk\b)/gi) || []).slice(0, 8),
            currencyMatches: (body.match(/\$\s?\d[\d,\.]*/g) || []).slice(0, 8),
            bareBigNumbers: (body.match(/\b\d{1,3}(,\d{3})+\b/g) || []).slice(0, 8),
            bodySample: body.slice(0, 500) });
        }
      });
      return { zeros, providers, money, maintCards, paneTextChars: (pane.innerText || '').trim().length, mountedTypes: types };
    }, room);
  }

  /* the popovers too, for the provider-name sweep */
  const popoverSweep = await page.evaluate(() => {
    const rb = document.querySelector('#sbChips .u11ctx-ringbtn'); if (rb) rb.click();
    return new Promise(res => setTimeout(() => {
      const db = document.querySelector('#sbChips .u11ctx-detbtn'); if (db) db.click();
      setTimeout(() => {
        const t = ((document.querySelector('.u11ctx-pop') || {}).innerText || '') + ' ' + ((document.querySelector('.u11ctx-det') || {}).innerText || '');
        const h = ((document.querySelector('.u11ctx-pop') || {}).outerHTML || '') + ' ' + ((document.querySelector('.u11ctx-det') || {}).outerHTML || '');
        const out = {};
        ['Mistral', 'Fireworks', 'OpenRouter', 'Cohere'].forEach(p => { out[p] = { inText: new RegExp(p, 'i').test(t), inHtml: new RegExp(p, 'i').test(h) }; });
        out.textChars = t.length;
        res(out);
      }, 800);
    }, 500));
  });

  /* whole-document sweep as a backstop (all panes exist in the DOM at once) */
  const wholeDoc = await page.evaluate(() => {
    const out = {};
    ['Mistral', 'Fireworks', 'OpenRouter', 'Cohere'].forEach(p => {
      const re = new RegExp(p, 'i');
      out[p] = { inBodyInnerText: re.test(document.body.innerText || ''), inBodyOuterHTML: re.test(document.body.outerHTML || ''),
        inLoadedScriptsData: !!(window.U11 && re.test(window.__A.dataDump(2000000))) };
    });
    return out;
  });

  g.ii_unconfiguredProviders = { perRoom: Object.fromEntries(Object.entries(perRoom).map(([r, v]) => [r, v.providers])), popovers: popoverSweep, wholeDocument: wholeDoc };
  g.i_zeroForUnknown = {
    perRoomCounts: Object.fromEntries(Object.entries(perRoom).map(([r, v]) => [r, (v.zeros || []).length])),
    zerosCoOccurringWithUnknownMarkerInSameRow: Object.entries(perRoom).flatMap(([r, v]) => (v.zeros || []).filter(z => z.rowAlsoSaysUnknown).map(z => Object.assign({ room: r }, z))).slice(0, 40),
    allZeroRenderings: Object.entries(perRoom).flatMap(([r, v]) => (v.zeros || []).map(z => Object.assign({ room: r }, z))).slice(0, 80)
  };
  g.iii_maintenanceCards = {
    cardsFound: Object.values(perRoom).flatMap(v => v.maintCards || []),
    note: 'a token count or a currency amount inside a maintenance/operations card body is the failure this probe looks for'
  };
  g.iv_costSplit = {
    occurrences: Object.entries(perRoom).flatMap(([r, v]) => (v.money || []).map(m => Object.assign({ room: r }, m))),
    arithmetic: { apiBilled: 61.85, planIncluded: 125.57, sum: +(61.85 + 125.57).toFixed(2), claimedTotal: 187.42, consistent: +(61.85 + 125.57).toFixed(2) === 187.42 }
  };
  g.mountedTypesPerRoom = Object.fromEntries(Object.entries(perRoom).map(([r, v]) => [r, v.mountedTypes]));
  g.console = recOf(page);
  await shot(page, 'g9-advanced-ledger-room');
  await page.close();

  g.summary = {
    i_zeroRenderingsTotal: Object.values(g.i_zeroForUnknown.perRoomCounts).reduce((a, b) => a + b, 0),
    i_zeroInARowThatAlsoSaysUnknown: g.i_zeroForUnknown.zerosCoOccurringWithUnknownMarkerInSameRow.length,
    ii_anyUnconfiguredProviderInDom: Object.entries(wholeDoc).filter(([, v]) => v.inBodyInnerText || v.inBodyOuterHTML).map(([k, v]) => ({ provider: k, inText: v.inBodyInnerText, inHtml: v.inBodyOuterHTML })),
    ii_presentInLoadedDataButNotDom: Object.entries(wholeDoc).filter(([, v]) => v.inLoadedScriptsData && !v.inBodyInnerText).map(([k]) => k),
    iii_maintenanceCardsFound: g.iii_maintenanceCards.cardsFound.length,
    iii_maintenanceCardsShowingTokensOrCost: g.iii_maintenanceCards.cardsFound.filter(c => (c.tokenCountMatches || []).length || (c.currencyMatches || []).length)
      .map(c => ({ room: c.room, title: c.title, tokens: c.tokenCountMatches, currency: c.currencyMatches })),
    iv_costSplitOccurrenceCount: g.iv_costSplit.occurrences.length,
    iv_costSplitValuesSeen: Array.from(new Set(g.iv_costSplit.occurrences.map(o => (o.text.match(/(61\.85|125\.57|187\.42)/) || [])[0]).filter(Boolean))),
    iv_arithmeticConsistent: g.iv_costSplit.arithmetic.consistent
  };
  results.groups.G9 = g;
}

/* ===================================================================== */
/* runner                                                               */
/* ===================================================================== */
const RUNNERS = { G0, G1, G2, G3, G4, G5, G6, G7, G8, G9 };

const watchdog = setTimeout(() => {
  blocker('HARNESS', 'global watchdog fired at 55 minutes — writing partial results and exiting');
  saveResults();
  process.exit(3);
}, 55 * 60 * 1000);
watchdog.unref?.();

let exitCode = 0;
try {
  ctx = await chromium.launchPersistentContext(PROFILE, {
    headless: true,
    executablePath: CHROME,
    viewport: { width: 1280, height: VH },
    args: ['--remote-debugging-port=' + DEBUG_PORT, '--allow-file-access-from-files', '--no-sandbox', '--disable-gpu', '--hide-scrollbars=false'],
    timeout: 45000
  });
  ctx.setDefaultTimeout(ACT_TIMEOUT);
  ctx.setDefaultNavigationTimeout(NAV_TIMEOUT);
  log('browser up (persistent context, profile ' + PROFILE + ', debug port ' + DEBUG_PORT + ')');

  for (const key of WANT) {
    const fn = RUNNERS[key];
    if (!fn) { blocker(key, 'unknown probe group'); continue; }
    const t0 = Date.now();
    log('\n=== ' + key + ' ===');
    try {
      await fn();
      const secs = ((Date.now() - t0) / 1000).toFixed(1);
      if (results.groups[key]) results.groups[key].ranAt = new Date().toISOString(), results.groups[key].durationSec = +secs;
      log('=== ' + key + ' done in ' + secs + 's ===');
    } catch (e) {
      blocker(key, 'group threw: ' + (e && e.stack ? e.stack.split('\n').slice(0, 3).join(' | ') : String(e)));
      results.groups[key] = Object.assign(results.groups[key] || {}, { name: key, executed: false, fatalError: String(e && e.message || e) });
      exitCode = 2;
    }
    saveResults();
  }
} catch (e) {
  blocker('HARNESS', 'browser launch failed: ' + String(e && e.message || e));
  exitCode = 4;
} finally {
  results.meta.groupsExecuted = Object.keys(results.groups);
  saveResults();
  if (ctx) await ctx.close().catch(() => {});
  clearTimeout(watchdog);
  log('\nresults -> ' + RESULTS);
  log('screenshots -> ' + SHOTS + ' (' + results.meta.screenshots.length + ')');
  if (results.blockers.length) log('blockers: ' + results.blockers.length);
  process.exit(exitCode);
}
