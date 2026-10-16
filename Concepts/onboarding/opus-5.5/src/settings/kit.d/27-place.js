/* O55 · the reader's place in Settings (M4, 2026-10-14). An update that is not a navigation never moves what the reader
   is looking at (M4-DESIGN-DECISION.md, share/puppet-master/2026-10-13-perf-fixes). Three things used to be decided by
   whichever code ran last in a re-render, and each now has one owner, this file:
   - the anchor: the row at the reading line (96 px below the top of the page, the line the section tracker reads), or
     the row of the control just used. While the reader is not scrolling and no jump is under way the page holds it:
     a layout change above it (an update in place, a late row, a font, a dependent row opening, a manager redrawing its
     body) is taken back in a ResizeObserver, after layout and before that frame is painted. The anchor is found by
     hit-testing the line, so a row clipped by its own scroller or covered by a sticky strip is never chosen, and rows
     inside sticky parts (a manager's roster, its tab strip) are skipped: they do not move with the page. It is held by
     node while the node lives and found again by its path (ids, then keyed children) when a redraw replaced it; if it
     is gone (a dependent row hidden), the nearest surviving row above it holds instead. Positions are layout positions,
     never drawn ones (a reveal slide or the hover magnet would otherwise be held). At the top of the page the page
     stays at the top, except under the control just used: that row holds there too, on a top reserve if need be.
   - the end space under the chapter's last section: sized from that section (the engine sized it from whichever
     section happened to be mounted last, so a redraw at the bottom of General shrank it from 686 to 395 px and pulled
     the page up), and never shrunk by more than the room left below the screen, so it can never move the reader. The
     rest of a shrink waits until the reader scrolls up.
   - the active section: the section tracker judges it while the reader scrolls or a jump lands, and is quiet while the
     page holds, so an update in place never changes it.
   A navigation (a chapter, a page tab, a section, a search hit, a Details link) owns the scroll until its landing has
   come to rest; then the place takes the row at the reading line of the settled view. The reader's own wheel, touch,
   keys or scroll bar hand the page to the reader in the same way. The in-place redraw itself is 28-in-place.js. */

const O55P_LINE = 96;
const O55P_STICKY = '.manager-tabs, .pm51-roster, .resource-roster, .pm51-facets, .pm51-popout-search, .workspace-tabs';
const O55P_SCROLL_KEYS = new Set(['PageUp', 'PageDown', 'Home', 'End', 'ArrowUp', 'ArrowDown', ' ', 'Spacebar']);
const o55pScroller = () => root.querySelector('#settings-document');
const o55pShown = sc => !!(sc && sc.isConnected && sc.clientHeight > 0 && sc.getClientRects().length);
const o55pZoom = () => parseFloat(getComputedStyle(document.body).zoom) || 1;
/* Where a node sits in the page's layout, in scroll pixels from the top of the view. Transforms are left out on purpose:
   a section still sliding in (its reveal), a row under the hover magnet or a NieR glitch are drawn moved but have not
   moved, and holding a drawn position would hold an animation's frame and jump when it ends. */
const o55pDocY = n => { let y = 0; for (; n; n = n.offsetParent) y += n.offsetTop; return y; };
const o55pTop = (el, sc) => o55pDocY(el) - o55pDocY(sc) - sc.scrollTop;

const PLACE = PM51.place = {
  mode: 'free',     // free (nothing settled yet) · nav (a jump owns the scroll) · user (the reader scrolls) · hold
  anchor: null,
  inPlace: false,   // an in-place redraw is being committed (28-in-place.js)
  own: null,        // the last scrollTop the place wrote, to tell its own scroll events from anyone else's
  navAt: 0,
  spyMay() { return this.mode !== 'hold'; }
};

/* ---------- finding the row at the reading line --------------------------------------------------------------------- */
function o55pFixed(el, sc) {
  for (let n = el; n && n !== sc; n = n.parentElement) {
    if (n.matches(O55P_STICKY)) return true;
    const p = getComputedStyle(n).position;
    if (p === 'sticky' || p === 'fixed') return true;
  }
  return false;
}
/* the largest box around a point that is still row-sized: a setting row, a manager row or card, a section heading */
function o55pUnitOf(el, sc) {
  const cap = Math.min(240, sc.clientHeight * .4);
  let unit = null;
  for (let n = el; n && n !== sc; n = n.parentElement) {
    if (n.nodeType !== 1 || n.matches('[data-workspace-block], [data-continuous-workspace-body], .domain-document')) break;
    const h = n.offsetHeight;
    if (h > cap) { if (unit) break; continue; }
    if (h > 0 && getComputedStyle(n).display.indexOf('inline') !== 0) unit = n;
  }
  return unit;
}
function o55pUnitAt(sc, y) {
  const doc = sc.querySelector('.domain-document') || sc, r = doc.getBoundingClientRect();
  for (const f of [.5, .3, .7, .14, .86]) {
    const x = r.left + r.width * f;
    for (const el of document.elementsFromPoint(x, y)) {
      if (el === sc || !sc.contains(el)) continue;
      const unit = o55pUnitOf(el, sc);
      if (unit && !o55pFixed(unit, sc) && unit.getBoundingClientRect().bottom > y) return unit;
      break;
    }
  }
  return null;
}
function o55pPick(sc, from) {
  const top = sc.getBoundingClientRect().top, z = o55pZoom(), y0 = from == null ? top + O55P_LINE * z : from;
  for (let dy = 0; dy <= 220; dy += 8) { const u = o55pUnitAt(sc, y0 + dy * z); if (u) return u; }
  return null;
}
/* a node's path from the nearest id: [tag+key, index among same-key siblings] steps, to find it again after a redraw */
function o55pKey(n) {
  for (const k of ['data-section-id', 'data-workspace-block', 'data-continuous-workspace-body', 'data-setting', 'data-id', 'data-action'])
    if (n.hasAttribute(k)) return n.tagName + '[' + k + '=' + n.getAttribute(k) + ']';
  const c = n.getAttribute('class'); return n.tagName + '.' + (c ? c.trim().split(/\s+/)[0] : '');
}
function o55pPath(el, sc) {
  const steps = [];
  for (let n = el; n && n !== sc; n = n.parentElement) {
    if (n.id) { steps.push({ id: n.id }); break; }
    const k = o55pKey(n); let i = 0;
    for (let s = n.previousElementSibling; s; s = s.previousElementSibling) if (o55pKey(s) === k) i++;
    steps.push({ k, i });
  }
  return steps.reverse();
}
function o55pFind(path, sc) {
  let n = sc;
  for (const st of path) {
    if (st.id) { n = document.getElementById(st.id); if (!n || !sc.contains(n)) return null; continue; }
    let i = st.i, hit = null;
    for (let c = n.firstElementChild; c; c = c.nextElementSibling) if (o55pKey(c) === st.k && i-- === 0) { hit = c; break; }
    if (!hit) return null;
    n = hit;
  }
  return n === sc ? null : n;
}
function o55pResolve(a, sc) {
  if (a.el && a.el.isConnected && sc.contains(a.el) && a.el.getClientRects().length) return a.el;
  const again = o55pFind(a.path, sc);
  if (again && again.getClientRects().length) { a.el = again; return again; }
  return null;
}

/* ---------- capture, hold, release --------------------------------------------------------------------------------- */
PLACE.capture = function (kind, from) {
  const sc = o55pScroller();
  if (!o55pShown(sc)) { this.anchor = null; return null; }
  const st = sc.getBoundingClientRect().top, z = o55pZoom();
  /* the control just used holds even at the top of the page: it never moves out from under the pointer or focus */
  let unit = from && sc.contains(from) && from !== sc ? o55pUnitOf(from, sc) : null;
  if (unit && (o55pFixed(unit, sc) || unit.getBoundingClientRect().bottom <= st || unit.getBoundingClientRect().top >= sc.getBoundingClientRect().bottom)) unit = null;
  if (!unit && sc.scrollTop < 1) { this.anchor = { top: true, kind }; this.own = 0; o55pWatch(sc, null); return this.anchor; }
  if (!unit) unit = o55pPick(sc);
  if (!unit) unit = [...sc.querySelectorAll('[data-workspace-block]')].reverse().find(b => b.getBoundingClientRect().top <= st + O55P_LINE * z) || null;
  if (!unit) { this.anchor = null; return null; }
  const top = unit.getBoundingClientRect().top;
  /* rows above it, nearest first, in case it disappears */
  const near = [];
  for (let y = top - 6, seen = new Set([unit]); near.length < 3 && y > st - 300 * z; y -= 40 * z) {
    const u = o55pUnitAt(sc, y);
    if (u && !seen.has(u) && u.getBoundingClientRect().top < top) { seen.add(u); near.push({ el: u, path: o55pPath(u, sc), offset: o55pTop(u, sc) }); }
  }
  this.anchor = { kind, el: unit, path: o55pPath(unit, sc), offset: o55pTop(unit, sc), near };
  this.own = sc.scrollTop;
  o55pWatch(sc, unit);
  return this.anchor;
};
/* While the page holds, the place is the scroller's only anchoring: the browser's own scroll anchoring picks its own
   node (the first one at the top of the view, never the reading line) and, the moment the page left 0, undid the
   place's correction. It is the browser's again while the reader scrolls or a jump lands. */
const o55pNative = on => { const sc = o55pScroller(); if (sc && (sc.style.overflowAnchor === 'none') === on) sc.style.overflowAnchor = on ? '' : 'none'; };
/* capture reads before the browser's anchoring is switched off: a read after that style write forced a second pass */
PLACE.hold = function (kind, from) { this.mode = 'hold'; o55pStopSettle(); this.capture(kind || 'read', from); o55pNative(false); };
PLACE.user = function () {
  if (this.mode === 'user' && o55pSettle) return;
  this.mode = 'user'; this.anchor = null; suppressScrollSpyUntil = 0; o55pNative(true); o55pSettleSoon();
};
PLACE.nav = function () { this.mode = 'nav'; this.anchor = null; this.navAt = performance.now(); o55pNative(true); o55pSettleSoon(); };

function o55pWrite(sc, top) {
  sc.scrollTo({ top, behavior: 'instant' });
  PLACE.own = sc.scrollTop;
}
/* The top reserve. At the top of the page a change that makes the rows above the control shorter cannot be taken back by
   scrolling (there is nothing above 0): Spacing set to Compact at the top of General pulled its own row up 86 px under
   the pointer. The shortfall becomes blank space above the chapter's title instead; content above that grows again uses
   it up first, and once the reader has scrolled it out of view it goes (the browser's own anchoring keeps the page still
   then). A new page never has one. */
const o55pReserveEl = sc => sc.querySelector(':scope > .domain-document > .o55-top-reserve');
const o55pReserveH = sc => { const r = o55pReserveEl(sc); return r ? parseFloat(r.style.height) || 0 : 0; };
function o55pSetReserve(sc, h) {
  const doc = sc.querySelector(':scope > .domain-document'); if (!doc) return;
  let r = o55pReserveEl(sc);
  if (h < .5) { if (r) r.remove(); return; }
  if (!r) { r = document.createElement('div'); r.className = 'o55-top-reserve'; r.setAttribute('aria-hidden', 'true'); doc.insertBefore(r, doc.firstChild); }
  r.style.height = Math.round(h * 100) / 100 + 'px';
}
/* take back whatever moved the anchor; runs in the ResizeObserver (layout done, frame not yet painted) */
PLACE.correct = function () {
  const a = this.anchor, sc = o55pScroller();
  if (this.mode !== 'hold' || !a || !o55pShown(sc)) return;
  if (a.top) { if (sc.scrollTop !== 0 && this.own === 0) o55pWrite(sc, 0); return; }
  let el = o55pResolve(a, sc), want = a.offset;
  if (!el) {
    const n = a.near.find(r => o55pResolve(r, sc));
    if (!n) return;
    el = n.el; want = n.offset;
    this.anchor = { kind: a.kind, el, path: n.path, offset: n.offset, near: a.near.slice(a.near.indexOf(n) + 1) };
    o55pWatch(sc, el);
  }
  let d = o55pTop(el, sc) - want;
  if (Math.abs(d) < .5) return;
  const reserve = o55pReserveH(sc);
  if (d > 0 && reserve > 0) { const take = Math.min(reserve, d); o55pSetReserve(sc, reserve - take); d -= take; }
  if (sc.scrollTop + d < 0) { o55pSetReserve(sc, o55pReserveH(sc) - (sc.scrollTop + d)); if (sc.scrollTop) o55pWrite(sc, 0); return; }
  if (Math.abs(d) >= .5) o55pWrite(sc, sc.scrollTop + d);   /* at the bottom the rest cannot be taken back */
};

/* ---------- the end space -------------------------------------------------------------------------------------------- */
function o55pLastSection(sc) {
  const blocks = sc.querySelectorAll('[data-workspace-block]'), block = blocks[blocks.length - 1];
  const body = block && block.querySelector('[data-continuous-workspace-body]');
  if (!body) return null;
  if (body.dataset.workspaceMounted === 'false') return body;
  const own = [...body.querySelectorAll('[data-section-id]')].filter(s => s.parentElement.closest('[data-section-id]') === null && s.offsetHeight > 0);
  return own[own.length - 1] || body;
}
PLACE.sizeEnd = function (sc, end) {
  sc = sc || o55pScroller(); end = end || (sc && sc.querySelector(':scope > .domain-document > .settings-end-space, .settings-end-space'));
  if (!sc || !end || !sc.clientHeight) return;
  const ch = sc.clientHeight, last = o55pLastSection(sc);
  const want = Math.max(140, ch - Math.min(last ? last.offsetHeight : 0, ch * .62) + 48);
  const set = parseFloat(end.style.height), cur = Number.isFinite(set) ? set : 0;
  let next = want;
  /* shrinking by more than the room below the screen would pull the page up under the reader */
  if (want < cur) next = Math.max(want, cur - Math.max(0, sc.scrollHeight - ch - sc.scrollTop));
  end.__o55Want = want;
  if (!Number.isFinite(set) || Math.abs(next - cur) >= .5) end.style.height = Math.round(next * 100) / 100 + 'px';
};
let o55pEndReady = null;
sizeSettingsEndSpace = function (scroller, end) {
  if (o55pEndReady) { o55pEndReady.disconnect(); o55pEndReady = null; }
  if (typeof ResizeObserver !== 'function') { requestAnimationFrame(() => PLACE.sizeEnd(scroller, end)); return; }
  /* A chapter's new DOM has not had layout yet. Size its end space on the first delivered layout, not in the
     render callback between writes. Replaced chapters cancel their pending measurement. */
  const ready = new ResizeObserver(() => {
    ready.disconnect(); o55pEndReady = null;
    if (scroller.isConnected && end.isConnected) PLACE.sizeEnd(scroller, end);
  });
  o55pEndReady = ready; ready.observe(scroller);
};

/* ---------- watching layout: one observer for the page's blocks, sections, the anchor's ancestors ------------------- */
let o55pObserver = null, o55pWatched = null;
/* Layout is done when this runs, so reading it costs nothing. The end space is sized here too: nothing the observer
   watches changes size when it does (the document column and the end space itself are left out on purpose). */
function o55pOnResize() {
  if (PLACE.mode !== 'hold' && !o55pSettle) o55pSettleSoon();   /* e.g. Settings shown again while a landing was pending */
  PLACE.correct();
  PLACE.sizeEnd();
}
function o55pWatch(sc, anchorEl) {
  if (typeof ResizeObserver !== 'function' || !sc) return;
  if (!o55pObserver) o55pObserver = new ResizeObserver(o55pOnResize);
  const want = new Set([sc]);
  sc.querySelectorAll('[data-workspace-block], [data-section-id]').forEach(n => want.add(n));
  /* the anchor's ancestors and everything beside them: any size change above the anchor is one of these */
  for (let n = anchorEl; n && n !== sc; n = n.parentElement) {
    if (n.classList.contains('domain-document')) break;   /* the place resizes the reserve and the end space in here */
    want.add(n); for (let c = n.parentElement && n.parentElement.firstElementChild; c; c = c.nextElementSibling) if (!c.matches('.settings-end-space, .o55-top-reserve')) want.add(c);
  }
  if (o55pWatched && want.size === o55pWatched.size && [...want].every(n => o55pWatched.has(n))) return;
  o55pObserver.disconnect();
  want.forEach(n => o55pObserver.observe(n));
  o55pWatched = want;
}
PLACE.watch = function () { const sc = o55pScroller(); if (sc) o55pWatch(sc, this.anchor && this.anchor.el); };

/* ---------- settling: a jump or the reader's scroll has come to rest -------------------------------------------------- */
/* Judged from the scroller's own scroll events and a timer, never by reading layout in each frame: on a look whose
   background animates (Glass, NieR) every frame has fresh style to compute, and polling the scroll position in each one
   forced an extra style pass per frame for the length of a landing. */
let o55pSettle = 0, o55pBar = false, o55pScrollAt = 0;
function o55pStopSettle() { clearTimeout(o55pSettle); o55pSettle = 0; }
const o55pBusy = () => { const now = performance.now(); return pendingScroll || o55pBar || o55Landing || now - PLACE.navAt < 260 || now - o55pScrollAt < 160; };
/* The settled view is read right after the next frame's layout, where reading it costs nothing. Read from the timer, it
   forced a style pass of its own on NieR's and Glass's animated backgrounds. A node newly observed by a ResizeObserver
   reports once, after layout; a hidden one never does, and the observer on the scroller restarts the settle when
   Settings shows again. */
let o55pAfter = null;
function o55pReadSettled(sc) {
  if (typeof ResizeObserver !== 'function') { if (o55pShown(sc)) PLACE.hold('read'); return; }
  if (!o55pAfter) o55pAfter = new ResizeObserver(() => {
    o55pAfter.disconnect();
    if (PLACE.mode === 'hold' || o55pSettle) return;   /* a hold, or a new jump or scroll, came first */
    if (o55pBusy()) { o55pSettleSoon(); return; }
    const s = o55pScroller();
    if (s && s.isConnected && o55pShown(s)) PLACE.hold('read');
  });
  o55pAfter.disconnect();
  o55pAfter.observe(sc);
}
function o55pSettleSoon() {
  if (o55pSettle) return;
  const step = () => {
    o55pSettle = 0;
    if (PLACE.mode === 'hold') return;
    const sc = o55pScroller();
    if (!sc || !sc.isConnected) return;   /* no document page (Settings Home): the next arrival starts this again */
    if (o55pBusy()) { o55pSettle = setTimeout(step, 80); return; }
    o55pReadSettled(sc);
  };
  o55pSettle = setTimeout(step, 80);
}

/* ---------- who is moving the page --------------------------------------------------------------------------------- */
const o55pInDoc = t => { const sc = o55pScroller(); return !!(sc && t && t.nodeType === 1 && sc.contains(t)); };
root.addEventListener('wheel', e => { if (o55pInDoc(e.target)) PLACE.user(); }, { capture: true, passive: true });
root.addEventListener('touchstart', e => { if (o55pInDoc(e.target)) PLACE.user(); }, { capture: true, passive: true });
root.addEventListener('pointerdown', e => {
  const sc = o55pScroller();
  if (!sc || !e.target || e.target.nodeType !== 1) return;
  if (e.target === sc) { o55pBar = true; PLACE.user(); return; }   /* its scroll bar */
  if (sc.contains(e.target) && PLACE.mode !== 'nav') PLACE.hold('control', e.target);
}, { capture: true, passive: true });
window.addEventListener('pointerup', () => { o55pBar = false; }, { capture: true, passive: true });
window.addEventListener('pointercancel', () => { o55pBar = false; }, { capture: true, passive: true });
root.addEventListener('keydown', e => {
  const t = e.target, sc = o55pScroller();
  if (!sc || !t || t.nodeType !== 1) return;
  const typing = t.matches('input, textarea, select, [contenteditable=""], [contenteditable="true"]');
  if (O55P_SCROLL_KEYS.has(e.key) && !typing && (t === sc || !sc.contains(t) || !t.closest('[role="radiogroup"], [role="tablist"], [role="listbox"], [role="menu"]'))) {
    if (t === sc || sc.contains(t) || t === document.body) PLACE.user();
    return;
  }
  if (sc.contains(t) && PLACE.mode !== 'nav') PLACE.hold('control', t);
}, { capture: true });
/* a scroll the place did not cause while it holds: someone else moved the page (focus, find in page, a script) */
root.addEventListener('scroll', e => {
  const sc = o55pScroller();
  if (!sc || e.target !== sc) return;
  o55pScrollAt = performance.now();
  const end = sc.querySelector('.settings-end-space');
  if (end && end.__o55Want != null && parseFloat(end.style.height) > end.__o55Want + .5) PLACE.sizeEnd(sc, end);
  /* the reader has scrolled the top reserve out of view: it goes, and the browser's anchoring keeps the page still */
  const reserve = PLACE.mode !== 'hold' && o55pReserveEl(sc);
  if (reserve && reserve.getBoundingClientRect().bottom < sc.getBoundingClientRect().top - 1) reserve.remove();
  if (PLACE.mode !== 'hold' || !PLACE.anchor || Math.abs(sc.scrollTop - (PLACE.own == null ? sc.scrollTop : PLACE.own)) < 1) return;
  const a = PLACE.anchor, el = a.top ? null : o55pResolve(a, sc);
  if (a.top ? sc.scrollTop < 1 : el && Math.abs(o55pTop(el, sc) - a.offset) < 1) { PLACE.own = sc.scrollTop; return; }
  PLACE.user();
}, { capture: true, passive: true });

/* ---------- navigation owns the scroll ----------------------------------------------------------------------------- */
const o55pJump = jumpToWorkspace;
jumpToWorkspace = function (wsId, behavior) {
  PLACE.nav();
  return o55pJump.call(this, wsId, behavior || (o55Still() ? 'auto' : behavior));
};
const o55pToSection = scrollToSection;
scrollToSection = function (sectionId, smooth = true) {
  PLACE.nav();
  return o55pToSection.call(this, sectionId, smooth && !o55Still());
};
const o55pLand = o55Land;
o55Land = function () { PLACE.nav(); return o55pLand.apply(this, arguments); };
/* The section tracker (22-index.js) asks PLACE.spyMay() first: it is quiet while the page holds. */
