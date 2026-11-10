/* Projects concepts (Opus 5.5): Split v3, "easier to read". The switch.

   Split v3 is not a second concept with its own renderer: it is Split (concept C, concepts/c.js) shown with
   concepts/c-v3.css. So everything Split does, and everything fixed in it later, is in v3 too, and switching between v2
   and v3 keeps the chosen Project, an open New Project and every answer exactly where they were.

   This file turns the stylesheet on and off: it sets data-pjx-read="v3" on <html>, which every rule in c-v3.css is
   anchored on. The review strip asks for it by message ({ source: 'pjx-host', cmd: 'read', read: 'v3' | 'v2' }); key 4
   shows v3 and key 3 goes back to v2, as 1, 2, 3 and 0 pick the concepts. It tells the strip which one shows
   ({ source: 'pjx', type: 'read', read }).

   One thing a stylesheet cannot know is how long a value is. While v3 shows, a fact whose value would not fit in two
   lines of its plate's value column (a sentence, a long path) is marked data-v3-long, and c-v3.css sets that value
   under its label, the plate wide, instead of wrapping it into a narrow column. Nothing else in Split's markup is
   touched, and the marks go when v2 comes back. */
(function (W) {
  'use strict';
  const PJX = W.PJX;
  if (!PJX || PJX.read) return;
  const D = W.document, H = D.documentElement;
  const ATTR = 'data-pjx-read';

  /* what a value column holds: about 54% of the plate's facts, two lines, at about 7.2 px a character of 13 px text.
     The measure is the plate's own width, which stacking does not change, so a mark never flips back and forth. */
  const SHARE = 0.54, LINES = 2, CHAR = 7.2, UNMEASURED = 60;
  const get = () => (H.getAttribute(ATTR) === 'v3' ? 'v3' : 'v2');

  /* mark the facts whose value is long. Split draws its plates again on every change, so the marks follow the page:
     a MutationObserver on the Projects panel. Its callback runs before the next paint, so a plate is never shown first
     one way and then the other; it writes an attribute only where it differs, and attributes are not observed. The
     pane changing width (the chat dragged wider) moves no markup, so a ResizeObserver asks again. */
  let mo = null, ro = null;
  const facts = () => D.querySelectorAll('#pjxc .pjxc-facts > .pmu-fact');
  function mark() {
    D.querySelectorAll('#pjxc .pjxc-facts').forEach((g) => {
      const w = g.clientWidth;
      const room = w > 0 ? (w * SHARE * LINES) / CHAR : UNMEASURED;
      Array.prototype.forEach.call(g.children, (f) => {
        if (!f.classList.contains('pmu-fact')) return;
        const v = f.querySelector('.pmu-factv');
        const long = !!v && v.textContent.trim().length > room;
        if (long !== f.hasAttribute('data-v3-long')) f.toggleAttribute('data-v3-long', long);
      });
    });
  }
  function watch(on) {
    if (mo) { mo.disconnect(); mo = null; }
    if (ro) { ro.disconnect(); ro = null; }
    const pnl = D.getElementById('panel-projects');
    if (on && pnl && W.MutationObserver) {
      mo = new W.MutationObserver(mark); mo.observe(pnl, { childList: true, subtree: true, characterData: true });
      if (W.ResizeObserver) { ro = new W.ResizeObserver(mark); ro.observe(pnl); }
      mark();
    } else if (!on) facts().forEach((f) => f.removeAttribute('data-v3-long'));
  }
  function report() { if (W.parent !== W) { try { W.parent.postMessage({ source: 'pjx', type: 'read', read: get() }, '*'); } catch (e) { /* no parent */ } } }
  function set(v) {
    const next = v === 'v3' ? 'v3' : 'v2';
    if (next !== get()) {
      if (next === 'v3') H.setAttribute(ATTR, 'v3'); else H.removeAttribute(ATTR);
      watch(next === 'v3');
      // the page lays itself out by measuring (the head's fit, the notes' place): draw it again at the new sizes
      try { PJX.rerender(); } catch (e) { /* nothing mounted yet */ }
    }
    report();
  }

  W.addEventListener('message', (ev) => {
    const m = ev.data;
    if (!m || m.source !== 'pjx-host' || ev.source !== W.parent) return;
    if (m.cmd === 'read') set(m.read);
    else if (m.cmd === 'hello') report();
  });

  // 4 shows Split v3, 3 goes back to Split v2 (never while typing, never with a modifier, never in a dialog)
  D.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey || e.defaultPrevented || D.querySelector('.pjx-dlg-back')) return;
    const t = e.target, tag = (t && t.tagName) || '';
    if (/input|select|textarea/i.test(tag) || (t && t.isContentEditable)) return;
    if (!(W.PM_PAGES && W.PM_PAGES.current === 'projects')) return;
    if (e.key === '4') { set('v3'); PJX.config({ opt: 'c' }); } else if (e.key === '3') set('v2');
  });

  PJX.read = { get, set };
})(window);
