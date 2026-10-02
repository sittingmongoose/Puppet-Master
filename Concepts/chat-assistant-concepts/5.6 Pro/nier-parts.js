/* nier-parts.js — NieR Mode parts for the 5.6 Pro concept, the script half. OWNER: NieR Mode, step N-A (2026-10-02);
 * step N-B adds the Motion, Sound & voice and World parts here. The styles are nier-parts.css; the contract and
 * window.PM_NIER are nier.js. Ported from PMConcept7's kit.d/19-nier-parts.js (the same layer ids, timings and
 * placement rules), with the concept's own selector lists.
 *
 * A part is live while PM_NIER.has(key); each part installs when its key arrives and removes everything it added when
 * the key goes (PM_NIER.onChange), so every part is silent while NieR Mode is off.
 *   square, headers, ground, diamonds, pointer, icons   CSS only (the parts attribute)
 *   cursor     one shared cursor (#o55np-cursor) beside the hovered or keyboard-focused menu item, picker row, thread
 *              row or wand row, placed by transform on pointerover and focusin
 *   brackets   one reticle of four corners (#o55np-reticle) on keyboard focus, and for 1.2 s on a chosen thread or tab
 * Performance (PMConcept7's rules): no requestAnimationFrame loop, no MutationObserver; rects are read only on input
 * events, before any write; motion is CSS or a one-shot Web Animation of transform and opacity.
 */
(function () {
  'use strict';
  var N = function () { return window.PM_NIER || null; };
  var has = function (key) { var n = N(); try { return !!(n && n.has(key)); } catch (e) { return false; } };
  var still = function () {
    return document.documentElement.getAttribute('data-motion') === 'reduced' || (document.body && document.body.classList.contains('pm56-reduced')) ||
      !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  };
  var frames = function (n) { return new Promise(function (res) { var step = function () { if (--n <= 0) res(); else window.requestAnimationFrame(step); }; window.requestAnimationFrame(step); }); };
  function layer(id) {
    var e = document.createElement('div');
    e.id = id; e.setAttribute('aria-hidden', 'true');
    document.body.appendChild(e);
    return e;
  }

  /* ---------- the part registry ------------------------------------------------------------------------------------ */
  var PARTS = {};
  var live = {};
  function sync() {
    if (!document.body) return;
    Object.keys(PARTS).forEach(function (key) {
      var want = has(key);
      if (want === !!live[key]) return;
      live[key] = want;
      try { PARTS[key][want ? 'on' : 'off'](); } catch (e) { /* a part never breaks the app */ }
    });
    listen();
  }

  /* ---------- menu cursor ------------------------------------------------------------------------------------------- */
  /* the rows that become an ink bar (the same list as nier-parts.css) */
  var CURSOR_SEL = ['.menu-item', '.thread-row', '.model-row', '.effort-row', '.pm-tops-item', '.att-source-row', '.qs-mention-item'].join(',');
  /* threads and tabs a click chooses, where the brackets lock on (menu items close with their menu) */
  var CHOSEN_SEL = '.thread-row, .editor-tab, [role="tab"]';
  /* items in a horizontal strip: the cursor sits under them */
  var STRIP_SEL = '.editor-tab, [role="tab"]';
  var targetOf = function (e) { return e && e.target && e.target.closest ? e.target.closest(CURSOR_SEL) : null; };
  var cur = null, curT = null, curHide = 0;
  function curPlace(t) {
    if (!cur) return;
    var r = t.getBoundingClientRect();
    if (r.width < 4 || r.height < 4 || r.bottom < 0 || r.top > window.innerHeight) { curOff(); return; }
    var x = r.left - 12, y = r.top + r.height / 2 - 4.5, side = 'left';
    if (t.matches(STRIP_SEL)) { x = r.left + r.width / 2 - 4.5; y = r.bottom + 3; side = 'below'; } else if (x < 2) { x = r.right + 5; side = 'right'; }
    var wasOn = cur.hasAttribute('data-on');
    if (!wasOn) { cur.setAttribute('data-jump', ''); frames(2).then(function () { if (cur) cur.removeAttribute('data-jump'); }); }
    cur.style.transform = 'translate(' + Math.round(x) + 'px, ' + Math.round(y) + 'px)';
    if (cur.dataset.side !== side) cur.dataset.side = side;
    if (!wasOn) cur.setAttribute('data-on', '');
  }
  function curOff() { curT = null; if (cur && cur.hasAttribute('data-on')) cur.removeAttribute('data-on'); }
  function curOver(e) {
    var t = targetOf(e);
    if (t === curT) { if (curHide) { window.clearTimeout(curHide); curHide = 0; } return; }
    if (!t) { if (!curHide && curT) curHide = window.setTimeout(function () { curHide = 0; curOff(); }, 90); return; }
    if (curHide) { window.clearTimeout(curHide); curHide = 0; }
    curT = t; curPlace(t);
  }
  function curFocus(e) {
    var t = targetOf(e); if (!t) return;
    var fv = false; try { fv = e.target.matches(':focus-visible'); } catch (x) { fv = false; }
    if (fv) { curT = t; curPlace(t); }
  }
  PARTS.cursor = {
    on: function () {
      cur = layer('o55np-cursor'); cur.innerHTML = '<i></i>';
      document.addEventListener('pointerover', curOver, true);
      document.addEventListener('focusin', curFocus, true);
    },
    off: function () {
      document.removeEventListener('pointerover', curOver, true);
      document.removeEventListener('focusin', curFocus, true);
      if (curHide) window.clearTimeout(curHide); curHide = 0; curT = null;
      if (cur) cur.remove(); cur = null;
    }
  };

  /* ---------- target brackets ---------------------------------------------------------------------------------------- */
  var ret = null, retT = null, retLock = 0, retScroll = 0;
  var RET_GAP = 3, RET_S = 10;
  function retPlace(t) {
    if (!ret || !t || !t.isConnected) { retOff(); return; }
    var r = t.getBoundingClientRect();
    if (r.width < 2 || r.height < 2 || r.bottom < 0 || r.top > window.innerHeight) { retOff(); return; }
    var l = r.left - RET_GAP, tp = r.top - RET_GAP, rt = r.right + RET_GAP - RET_S, b = r.bottom + RET_GAP - RET_S;
    var pos = [[l, tp, 1, 1], [rt, tp, -1, 1], [l, b, 1, -1], [rt, b, -1, -1]];
    var wasOn = ret.hasAttribute('data-on'), c = ret.children;
    if (!wasOn) { ret.setAttribute('data-jump', ''); frames(2).then(function () { if (ret) ret.removeAttribute('data-jump'); }); }
    pos.forEach(function (p, i) { c[i].style.transform = 'translate(' + Math.round(p[0]) + 'px, ' + Math.round(p[1]) + 'px) scale(' + p[2] + ', ' + p[3] + ')'; });
    if (!wasOn) {
      ret.setAttribute('data-on', '');
      if (!still()) pos.forEach(function (p, i) { c[i].animate([{ translate: (-p[2] * 9) + 'px ' + (-p[3] * 9) + 'px', opacity: 0 }, { translate: '0px 0px', opacity: 1 }], { duration: 210, easing: 'steps(3, end)' }); });
    }
  }
  function retOff() { retT = null; if (ret && ret.hasAttribute('data-on')) ret.removeAttribute('data-on'); }
  function retFocus(e) {
    var t = e.target; if (!(t instanceof Element)) return;
    var fv = false; try { fv = t.matches(':focus-visible'); } catch (x) { fv = false; }
    if (!fv) return;
    if (retLock) { window.clearTimeout(retLock); retLock = 0; }
    retT = t; retPlace(t);
  }
  function retBlur() {
    window.setTimeout(function () {
      if (retLock) return;
      var a = document.activeElement, fv = false;
      try { fv = !!a && a !== document.body && a.matches(':focus-visible'); } catch (x) { fv = false; }
      if (!fv) retOff(); else if (a !== retT) { retT = a; retPlace(a); }
    }, 0);
  }
  function retChoose(e) {
    var t = e.target && e.target.closest ? e.target.closest(CHOSEN_SEL) : null; if (!t) return;
    if (retLock) window.clearTimeout(retLock);
    /* the click re-renders the list (pmPatch keeps the row node); place after that render */
    window.setTimeout(function () { if (t.isConnected) { retT = t; retPlace(t); } }, 0);
    retLock = window.setTimeout(function () { retLock = 0; retBlur(); }, 1200);
  }
  function retKey(e) { if (retT && (e.key === 'Tab' || /^Arrow/.test(e.key)) && !retT.isConnected) retOff(); }
  PARTS.brackets = {
    on: function () {
      ret = layer('o55np-reticle'); ret.innerHTML = '<i></i><i></i><i></i><i></i>';
      document.addEventListener('focusin', retFocus, true);
      document.addEventListener('focusout', retBlur, true);
      document.addEventListener('click', retChoose, true);
      document.addEventListener('keydown', retKey, true);
    },
    off: function () {
      document.removeEventListener('focusin', retFocus, true);
      document.removeEventListener('focusout', retBlur, true);
      document.removeEventListener('click', retChoose, true);
      document.removeEventListener('keydown', retKey, true);
      if (retLock) window.clearTimeout(retLock); retLock = 0; retT = null;
      if (ret) ret.remove(); ret = null;
    }
  };

  /* scrolling or resizing moves what the cursor and the reticle point at: they step aside and come back after */
  function onScroll() {
    if (!cur && !ret) return;
    if (cur) curOff();
    if (ret && retT) {
      var t = retT; if (ret.hasAttribute('data-on')) ret.removeAttribute('data-on');
      if (retScroll) window.clearTimeout(retScroll);
      retScroll = window.setTimeout(function () { retScroll = 0; if (retT === t && t.isConnected) { retPlace(t); } }, 160);
    }
  }

  /* the scroll and resize listeners exist only while the cursor or the brackets are live */
  var listening = false;
  function listen() {
    var want = !!(live.cursor || live.brackets);
    if (want === listening) return;
    listening = want;
    if (want) { window.addEventListener('scroll', onScroll, { capture: true, passive: true }); window.addEventListener('resize', onScroll, { passive: true }); }
    else { window.removeEventListener('scroll', onScroll, { capture: true }); window.removeEventListener('resize', onScroll); }
  }
  var n = N();
  if (n && typeof n.onChange === 'function') n.onChange(sync);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', sync); else window.setTimeout(sync, 0);
})();
