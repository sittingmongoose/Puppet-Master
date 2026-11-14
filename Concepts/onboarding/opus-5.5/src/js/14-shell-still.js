/* The still page (PERF-3, the owner's choice B, 2026-11-11: "pause the icons after a while without input"). The page's
   endless decorative loops (breathing marks, spinning rings, loaders, working pulses) kept the compositor drawing a
   frame on every refresh with nobody at the page, about 119 a second at 120 Hz in every look: Glass Dark Home cost 450
   ms a second of GPU-thread time against 62 with them paused (pm7-perf lane E's P1). After STILL_AFTER with no pointer
   move, press, wheel, key, touch, focus, input, composition, resize or return to a visible tab the page goes still (data-pm-still on <html>) and every one of them holds where it
   is; the next input lets them go on from there in that same event, so nothing restarts or jumps.
   How: going still, the script asks the page for its animations once and marks the element of each CSS animation that
   runs endlessly (data-pm-held="self", or "before"/"after"/"marker" for a pseudo-element's), and four rules
   (css/21-shell-still.css) hold what is marked with animation-play-state. Only those elements are restyled, about 40
   on Home, a millisecond or two; rules keyed by the loops' own selectors restyled 650-730 elements in a frame on the
   3090 (17-32 ms), because the same tags and glyph classes are everywhere. Not the Web Animations API's pause() and
   play(): after them Chrome lets no animation-play-state rule reach that animation again (measured on 157), and the
   page's own holds (the onboarding window, drags, hidden rows) are such rules. A loop that starts while the page is still
   (a row turns to working, a loader appears) is marked when it starts (animationstart, which reaches every start once;
   never animationiteration, which wakes the main thread at every loop boundary) or at the next look, every 4 s; an
   element that also runs a finite animation waits for it to end, so an entrance or a one-shot is never held; a mark a
   renderer takes away while still is put back before the next frame.
   Not held: anything finite, what script draws (clocks, the terminal's cursor, live numbers), a closed shadow root's
   caret, and nothing at all under Reduced Motion, while the onboarding window is open (the app beneath is held by the
   window already, 10-window.css, and the window's stage keeps its own loop) or during the Guided Tour (the app is what
   the tour shows, and its words describe marks that move).
   The idle warm queue (PM_WARM, 11-motion-start.js) keeps its own clock of the same inputs: being still is not one of
   its gates, and a held loop sends no animation event, so it neither waits for nor wakes this.
   Checks only: ?pm-still=<ms> sets the wait (read once; ?pm-still=off never goes still). window.PM_STILL tells a check
   the state: { still(), after, since(): ms since the last input, held(): elements marked }.
   Kit check: pm7-tools/browser-check/checks/perf-still-page.check.mjs. */
(function () {
  'use strict';
  const STILL_AFTER = 20000, LOOK_AGAIN = 4000;
  const ATTR = 'data-pm-still', HELD = 'data-pm-held';
  const SKIP = '#pm-o55-onboarding, #pm-o55-tour';
  const html = document.documentElement;
  let after = STILL_AFTER;
  try {
    const m = /(?:^|[?&])pm-still=(off|\d+)(?:&|$)/.exec(location.search);
    if (m) after = m[1] === 'off' ? Infinity : Math.max(200, Number(m[1]));
  } catch (_) { /* no location */ }
  let lastInput = performance.now(), timer = 0, again = 0, sweep = 0, still = false;
  const marked = new Map(); // element -> the parts marked on it ("self before")

  const reduced = () => {
    try { return !!(window.O55 && window.O55.motion && window.O55.motion.reduced && window.O55.motion.reduced()); } catch (_) { return false; }
  };
  /* states in which the page never goes still (and which wake it if they begin while it is) */
  const heldBack = () => reduced() || html.hasAttribute('data-o55-open') || html.hasAttribute('data-o55-tour') ||
    !!(window.PM_BUSY && window.PM_BUSY.drag && window.PM_BUSY.drag());

  const part = (pseudo) => (pseudo ? String(pseudo).replace(/^::?/, '') : 'self');
  const endless = (a) => { try { return a.effect.getTiming().iterations === Infinity; } catch (_) { return false; } };
  const ownElement = (el) => !!el && el.nodeType === 1 && el.getRootNode() === document && !(el.closest && el.closest(SKIP));
  const tokens = (el) => { const v = marked.get(el); return v ? v.split(' ') : []; };
  const mark = (el, p) => { const t = tokens(el); if (t.includes(p) && el.getAttribute(HELD) === marked.get(el)) return; if (!t.includes(p)) t.push(p); marked.set(el, t.join(' ')); el.setAttribute(HELD, t.join(' ')); };
  const unmark = (el, p) => {
    const t = tokens(el).filter((x) => x !== p);
    if (t.length) { marked.set(el, t.join(' ')); el.setAttribute(HELD, t.join(' ')); } else { marked.delete(el); el.removeAttribute(HELD); }
  };
  /* A renderer that patches its elements in place (the chat's: the orbit ring, the Activity bar's glyphs) drops
     attributes it did not write, the mark among them, and the loop runs on with no event to say so (measured: 17 loops
     running 3 s after going still, in Usage). While still, a mark taken away is put back in the same turn, before the
     next frame draws. */
  const keeper = typeof MutationObserver === 'function' ? new MutationObserver((records) => {
    if (!still) return;
    for (const r of records) {
      const want = marked.get(r.target);
      if (want && r.target.getAttribute(HELD) !== want) r.target.setAttribute(HELD, want);
    }
  }) : null;
  /* the CSS animations of one element (or one of its pseudo-elements); transitions are not among them: the play state
     never reaches a transition, so one running is no reason to wait */
  const isCss = (a) => !!(window.CSSAnimation && a instanceof window.CSSAnimation);
  const animsOf = (el, p) => { try { return el.getAnimations({ subtree: true }).filter((a) => isCss(a) && a.effect && a.effect.target === el && part(a.effect.pseudoElement) === p); } catch (_) { return []; } };

  /* mark every element whose CSS animation runs endlessly, unless it also runs a finite one (it is marked once that
     has ended, at the next look) */
  function look() {
    let list; try { list = document.getAnimations(); } catch (_) { return; }
    const busy = new Set(), want = [];
    for (const a of list) {
      if (!isCss(a) || a.playState !== 'running') continue;
      const el = a.effect && a.effect.target; if (!ownElement(el)) continue;
      const key = part(a.effect.pseudoElement);
      if (endless(a)) want.push([el, key]); else busy.add(el);
    }
    for (const [el, key] of want) if (!busy.has(el)) mark(el, key);
  }
  /* while still: a loop that starts is marked; a finite animation starting on a marked element lets it go (the loop is
     looked at again once the one-shot has ended); a marked element whose loop is gone is let go */
  function started(e) {
    if (!still || !ownElement(e.target)) return;
    const el = e.target, p = part(e.pseudoElement), a = animsOf(el, p).find((x) => x.animationName === e.animationName);
    if (!a) return;
    if (endless(a)) { if (!animsOf(el, p).some((x) => !endless(x) && x.playState === 'running')) mark(el, p); }
    else if (tokens(el).includes(p)) unmark(el, p);
  }
  function stopped(e) {
    if (!still || !marked.has(e.target)) return;
    const el = e.target, p = part(e.pseudoElement);
    if (!animsOf(el, p).some((x) => endless(x) && x.playState !== 'idle' && x.playState !== 'finished')) unmark(el, p);
  }
  ['animationstart'].forEach((t) => window.addEventListener(t, started, true));
  ['animationcancel', 'animationend'].forEach((t) => window.addEventListener(t, stopped, true));

  const goStill = () => {
    if (still) return;
    still = true;
    html.setAttribute(ATTR, '');
    if (keeper) keeper.observe(document.documentElement, { attributes: true, attributeFilter: [HELD], subtree: true });
    look();
    again = setTimeout(function lookAgain() { if (!still) return; look(); again = setTimeout(lookAgain, LOOK_AGAIN); }, LOOK_AGAIN);
  };
  const wake = () => {
    if (!still) return;
    still = false;
    clearTimeout(again); again = 0;
    html.removeAttribute(ATTR);
    if (keeper) { keeper.disconnect(); keeper.takeRecords(); }
    for (const el of marked.keys()) el.removeAttribute(HELD);
    marked.clear();
    /* a copy made of a marked element while the page was still (a clone keeps its attributes) is let go once the page
       has a moment */
    if (!sweep) {
      const clear = () => { sweep = 0; if (!still) document.querySelectorAll('[' + HELD + ']').forEach((n) => n.removeAttribute(HELD)); };
      sweep = typeof window.requestIdleCallback === 'function' ? (window.requestIdleCallback(clear, { timeout: 3000 }), 1) : (setTimeout(clear, 1000), 1);
    }
  };

  /* one timer at a time: an input only notes its time; the timer, when it comes, waits again for whatever is left */
  const arm = (ms) => { clearTimeout(timer); timer = setTimeout(check, Math.max(16, ms)); };
  function check() {
    timer = 0;
    if (after === Infinity) return;
    const left = after - (performance.now() - lastInput);
    if (left > 0) { arm(left); return; }
    if (heldBack()) { arm(after); return; }
    goStill();
  }
  const input = (e) => {
    if (!e.isTrusted) return;
    lastInput = performance.now();
    wake();
    if (!timer) arm(after);
  };
  ['pointermove', 'pointerdown', 'wheel', 'keydown', 'touchstart', 'resize', 'focusin', 'input', 'compositionstart', 'compositionupdate'].forEach((t) => window.addEventListener(t, input, { capture: true, passive: true }));
  window.addEventListener('focus', (e) => { if (e.target === window) input(e); }, true);
  document.addEventListener('visibilitychange', (e) => { if (document.visibilityState === 'visible') input(e); });
  /* scroll is deliberately absent: the chat's own follow glide is not input. A script's .focus() produces trusted
     focusin too; the browser check verifies that every visited view settles and stays still with this wake enabled. */
  /* Reduced Motion, the onboarding window or the tour beginning while still: let the loops go */
  try {
    new MutationObserver(() => { if (still && heldBack()) { wake(); arm(after); } })
      .observe(html, { attributes: true, attributeFilter: ['data-motion', 'data-o55-open', 'data-o55-tour'] });
  } catch (_) { /* none */ }
  try {
    const mq = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq && mq.addEventListener) mq.addEventListener('change', () => {
      if (mq.matches) wake();
      // A preference change is not input: keep the last-input clock and any pending deadline, but replace a spent check.
      if (!timer && after !== Infinity) arm(after);
    });
  } catch (_) { /* none */ }
  if (after !== Infinity) arm(after);
  window.PM_STILL = {
    still: () => still,
    after,
    since: () => performance.now() - lastInput,
    held: () => marked.size
  };
})();
