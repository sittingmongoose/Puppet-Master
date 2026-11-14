/* The app's loops under the onboarding window (FO-181 part 1). The window holds the app beneath still while it is open
   (10-window.css), and the hold used to be one rule on every element of the app (`html[data-o55-open] body >
   [data-o55-held] *`): it paused and resumed the loops in the same frame as the window's heaviest work, the mount
   (build, inert app, look) and the close's wake (inert off), about 240 ms of style for that rule alone. Chrome takes a
   CSS pause's hold time, and a resume's start time, from that frame's own time, which is from before the work; the
   compositor meanwhile went on moving every loop by the wall clock. So when the late frame was shown, every held loop
   on the page jumped by about the frame's length: 230 ms (0.10 of a loop) in Basic Dark, 377 ms (0.17) in NieR (pm7-perf
   lane S, S-REPORT.md, "a page-wide jump").
   Now the loops are held in light frames instead, by marks:
   - at the open, in the frame that draws the click's dim (#o55-open-scrim, put up in the click's own task;
     60-ui-core.js open() builds the window a frame later), every CSS animation running on an element of the app is
     marked data-o55-loop in that frame's own callback, and the rule keyed on that mark (10-window.css) pauses it at
     once (one restyle of the marked elements); the mount's heavy frame then finds them held already. That frame starts
     late by the click's own task (the menu, the tour's reset, the open: 25-40 ms), so its time, which the pause
     takes, is that much behind the wall clock the compositor moves the loops by: each held loop the compositor runs
     (transform, opacity, filter; most of the app's) is then placed where it is on screen now (currentTime from its own
     start time and performance.now(), after the pause's restyle), so it holds the place it was shown at, to within the
     rest of that frame's work; a loop the main thread draws was shown at the frame's own time and stays there;
   - at the close, the marks stay through the frame that wakes the app (data-o55-open goes, inert comes off) and are
     taken off in the frame after it, which starts on time, so each loop goes on from exactly where it stopped;
   - a loop that starts while the window is open (a look applied as the window opens, a row the app redraws beneath) is
     marked when it starts (animationstart, listened to only while the hold is on), and a mark a renderer takes away is
     put back before the next frame (as the still page does, 14-shell-still.js);
   - a path that opens the window without the click's dim (a window already on screen) is held when html gets
     data-o55-open, as before.
   Only the marked elements are restyled (tens, not the whole ~17k-node page). Not the Web Animations API's pause() and
   play(): after them Chrome lets no animation-play-state rule reach that animation again (measured on 157), and the
   page's other holds (the still page, drags, hidden rows) are such rules. Same reach as the old rule: the elements of
   every part of <body> the window holds (not the window, its demo panel or the hover tag), not their pseudo-elements
   or a shadow root's insides, finite animations too; transitions never take a play state. Nothing differs under Reduced
   Motion: the window holds what runs there as it did. NieR's loaders keep their by-name rule (10-window.css) for a
   loader that first appears under the window.
   Checks only: window.PM_WINDOW_HOLD = { on(), marked(): elements marked }.
   Kit check: pm7-tools/browser-check/checks/window-hold-jump.check.mjs. */
(function () {
  'use strict';
  const MARK = 'data-o55-loop', SCRIM = 'o55-open-scrim', OPEN = 'data-o55-open';
  /* body children the window never holds (60-ui-core.js setInert) */
  const FREE = new Set(['pm-o55-onboarding', 'pm-hover-tag-root', 'o55-demo', SCRIM]);
  const html = document.documentElement;
  const raf = (fn) => ((window.O55 && window.O55.motion && window.O55.motion.real && window.O55.motion.real.raf) || window.requestAnimationFrame.bind(window))(fn);
  const marked = new Set();
  let on = false, releasing = 0, taking = 0;

  const isCss = (a) => !!(window.CSSAnimation && a instanceof window.CSSAnimation);
  /* an element of a part of the page the window holds (light DOM, under a body child that is not the window's own) */
  const heldElement = (el) => {
    if (!el || el.nodeType !== 1 || !document.body || el.getRootNode() !== document) return false;
    let top = el;
    while (top.parentElement && top.parentElement !== document.body) top = top.parentElement;
    return top.parentElement === document.body && !FREE.has(top.id) && top.tagName !== 'SCRIPT';
  };
  const mark = (el) => { marked.add(el); if (!el.hasAttribute(MARK)) el.setAttribute(MARK, ''); };

  const keeper = typeof MutationObserver === 'function' ? new MutationObserver((records) => {
    if (!on) return;
    for (const r of records) if (marked.has(r.target) && !r.target.hasAttribute(MARK)) r.target.setAttribute(MARK, '');
  }) : null;
  function started(e) {
    if (!on || e.pseudoElement || !heldElement(e.target)) return;
    mark(e.target);
  }

  /* Only a loop the compositor can run (transform, opacity, filter alone) moved on by the wall clock while the frame
     waited; one that animates anything else is drawn by the main thread, at the frame's own time, which is where its
     pause leaves it, so it is not placed. Known per @keyframes name, once. */
  const COMPOSITED = new Set(['transform', 'translate', 'rotate', 'scale', 'opacity', 'filter']);
  const NOT_PROPS = new Set(['offset', 'computedOffset', 'easing', 'composite']);
  const kinds = new Map();
  const onCompositor = (a) => {
    const name = a.animationName;
    if (kinds.has(name)) return kinds.get(name);
    let ok = false;
    try { const props = new Set(); for (const k of a.effect.getKeyframes()) for (const p of Object.keys(k)) if (!NOT_PROPS.has(p)) props.add(p); ok = props.size > 0 && [...props].every((p) => COMPOSITED.has(p)); } catch (_) { ok = false; }
    kinds.set(name, ok);
    return ok;
  };
  /* mark every CSS animation of the app that runs (or is paused by another rule) and place each running one where the
     compositor shows it now: in a frame that starts late, the frame's own time (which the pause takes) is behind */
  function take() {
    taking = 0;
    if (!on) return;
    let list; try { list = document.getAnimations(); } catch (_) { return; }
    /* every read first, then the marks, then one restyle that pauses them all (the costly part: ~15 ms for ~130 loops in
       NieR Dark), and only then the time they are placed at, so that cost is behind it; a paused loop's placement
       restyles only its own element. (Reads between the writes would restyle once per loop.) */
    const els = [], place = [];
    for (const a of list) {
      if (!isCss(a)) continue;
      const st = a.playState; if (st !== 'running' && st !== 'paused') continue;
      const fx = a.effect; if (!fx || fx.pseudoElement || !heldElement(fx.target)) continue;
      els.push(fx.target);
      if (st === 'running' && onCompositor(a)) { const s0 = a.startTime, k = a.playbackRate; if (s0 != null && Number.isFinite(k)) place.push([a, s0, k]); }
    }
    for (const el of els) mark(el);
    if (place.length) void place[0][0].playState;   // the one restyle: the marks pause the loops now
    const now = performance.now();
    for (const [a, s0, k] of place) { try { a.currentTime = (now - s0) * k; } catch (_) { /* left as it is */ } }
  }
  /* at the click: held from the frame that draws its dim; when the window is already being shown, at once */
  function hold(atOnce) {
    if (releasing) { releasing = 0; }
    if (!on) {
      on = true;
      window.addEventListener('animationstart', started, true);
      if (keeper) keeper.observe(html, { attributes: true, attributeFilter: [MARK], subtree: true });
    }
    if (atOnce) take();
    else if (!taking) { const id = taking = {}; raf(() => { if (taking === id) take(); }); }
  }
  function release() {
    releasing = 0;
    if (!on || html.hasAttribute(OPEN) || document.getElementById(SCRIM)) return;
    on = false; taking = 0;
    window.removeEventListener('animationstart', started, true);
    if (keeper) { keeper.disconnect(); keeper.takeRecords(); }
    for (const el of marked) el.removeAttribute(MARK);
    marked.clear();
    /* a copy made of a marked element while the window was open (a clone keeps its attributes) is let go once the
       page has a moment */
    const sweep = () => { if (!on) document.querySelectorAll('[' + MARK + ']').forEach((n) => n.removeAttribute(MARK)); };
    if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(sweep, { timeout: 3000 }); else setTimeout(sweep, 1000);
  }
  /* let go in the frame after the next one: the next frame is the one that wakes the app (its long style); the one
     after it starts on time */
  function releaseSoon() {
    if (!on || releasing) return;
    const id = releasing = {};
    raf(() => { if (releasing === id) raf(() => { if (releasing === id) release(); }); });
  }

  if (typeof MutationObserver === 'function') {
    const watch = () => {
      if (!document.body) return false;
      new MutationObserver((records) => {
        for (const r of records) {
          for (const n of r.addedNodes) if (n.id === SCRIM) { hold(); return; }
          /* an open given up before its window was built (a close while it waited for its frame) */
          for (const n of r.removedNodes) if (n.id === SCRIM && !html.hasAttribute(OPEN)) { releaseSoon(); return; }
        }
      }).observe(document.body, { childList: true });
      return true;
    };
    if (!watch()) document.addEventListener('DOMContentLoaded', watch, { once: true });
    new MutationObserver(() => {
      if (html.hasAttribute(OPEN)) { if (!on || releasing || taking) hold(true); }
      else releaseSoon();
    }).observe(html, { attributes: true, attributeFilter: [OPEN] });
  }

  window.PM_WINDOW_HOLD = { on: () => on, marked: () => marked.size };
})();
