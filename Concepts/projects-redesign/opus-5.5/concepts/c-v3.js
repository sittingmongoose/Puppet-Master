/* Projects concepts (Opus 5.5): Split v3, "easier to read". What the stylesheet cannot do by itself.

   Split v3 is the Split concept (concept C, concepts/c.js) shown with concepts/c-v3.css. It replaced Split v2 on
   2026-11-11 (Jared: "We are replacing v2 with v3"), so there is no switch: this file sets data-pjx-read="v3" on <html>
   when it loads, and every rule in c-v3.css is anchored on that attribute. Nothing of c.js or c.css is changed, so
   everything Split does, and everything fixed in it later, is in v3.

   One thing a stylesheet cannot know is how long a value is. Each plate's facts are measured against the plate's own
   width, and marked for c-v3.css:
   - data-v3-stack on the facts: most of this plate's values would not fit on one line beside their labels (Backup,
     Where work runs in a half-width plate), so every label goes above its value and the plate reads one way;
   - data-v3-long on a fact: this one value would need more than two lines beside its label (a sentence), or is one
     line that cannot wrap and does not fit there (a folder path, which Split shortens in the middle only when it must),
     so it alone goes under its label, the plate wide.
   Nothing else in Split's markup is touched.

   PJX.read.set('v2') takes the attribute and the marks off again, which leaves Split's base layout (c.css alone). No
   control reaches it: it is there for tools/checks/split-v3.check.mjs, which measures v3 against that layout on the
   same state (nothing more cut off, the same widths). PJX.read.set('v3') puts v3 back. */
(function (W) {
  'use strict';
  const PJX = W.PJX;
  if (!PJX || PJX.read) return;
  const D = W.document, H = D.documentElement;
  const ATTR = 'data-pjx-read';

  /* c-v3.css gives the labels a column no wider than LABEL of the facts and a GAP before the values. The measure is
     the plate's own width, which stacking does not change, so a mark never flips back and forth. Text breaks at
     words, so a line holds a little less than its width: FILL of it. */
  const LABEL = 0.46, GAP = 18, LINES = 2, FILL = 0.92;
  const get = () => (H.getAttribute(ATTR) === 'v3' ? 'v3' : 'v2');

  /* how wide a piece of text is in an element's own face (each look has its own), without touching the layout */
  let ctx = null;
  function widthOf(el) {
    if (!el) return 0;
    const text = el.textContent.trim(); if (!text) return 0;
    const cs = W.getComputedStyle(el);
    if (!ctx) ctx = D.createElement('canvas').getContext('2d');
    if (!ctx) return text.length * 7.2;
    ctx.font = cs.fontStyle + ' ' + cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;
    return ctx.measureText(text).width + (parseFloat(cs.letterSpacing) || 0) * text.length;
  }

  /* mark the plates and facts. Split draws its plates again on every change, so the marks follow the page:
     a MutationObserver on the Projects panel. Its callback runs before the next paint, so a plate is never shown first
     one way and then the other; it writes an attribute only where it differs, and attributes are not observed. The
     pane changing width (the chat dragged wider, the library folding into its drawer) moves no markup, so a
     ResizeObserver on the panel and on the page's scroller asks again. */
  let mo = null, ro = null, watched = null;
  const facts = () => D.querySelectorAll('#pjxc .pjxc-facts > .pmu-fact');
  const flag = (el, name, on) => { if (on !== el.hasAttribute(name)) el.toggleAttribute(name, on); };
  function mark() {
    D.querySelectorAll('#pjxc .pjxc-facts').forEach((g) => {
      const w = g.clientWidth;
      const rows = Array.prototype.filter.call(g.children, (f) => f.classList.contains('pmu-fact'));
      if (!w || !rows.length) return;   // not laid out (hidden): leave it as it is
      const label = Math.min(w * LABEL, Math.max.apply(null, rows.map((f) => widthOf(f.querySelector('.pmu-factl')))));
      const col = Math.max(40, w - label - GAP);
      // a path is one line that never wraps (.pjxc-mid, in the code face): it needs its whole width, not two lines' worth
      const path = rows.map((f) => f.querySelector('.pmu-factv .pjxc-mid'));
      const need = rows.map((f, i) => (path[i] ? Math.ceil(widthOf(path[i])) + 1 : widthOf(f.querySelector('.pmu-factv'))));
      const stack = rows.length >= 3 && need.filter((n) => n > col).length * 2 > rows.length;
      flag(g, 'data-v3-stack', stack);
      rows.forEach((f, i) => flag(f, 'data-v3-long', !stack && need[i] > (path[i] ? col : col * LINES * FILL)));
    });
    // the page's own box: its width is what the plates follow, and nothing marked here changes it
    const page = D.querySelector('#pjxc .pjxc-scroll');
    if (ro && page !== watched) { if (watched) ro.unobserve(watched); if (page) ro.observe(page); watched = page; }
  }
  function watch(on) {
    if (mo) { mo.disconnect(); mo = null; }
    if (ro) { ro.disconnect(); ro = null; }
    watched = null;
    const pnl = D.getElementById('panel-projects');
    // loaded before PMConcept7 has its Projects panel: look again shortly
    if (on && !pnl) { W.setTimeout(() => { if (get() === 'v3' && !mo) watch(true); }, 250); return; }
    if (on && pnl && W.MutationObserver) {
      mo = new W.MutationObserver(mark); mo.observe(pnl, { childList: true, subtree: true, characterData: true });
      if (W.ResizeObserver) { ro = new W.ResizeObserver(mark); ro.observe(pnl); }
      mark();
      // a look's own face may arrive after the first measure
      if (D.fonts && D.fonts.ready) D.fonts.ready.then(() => { if (mo) mark(); });
    } else if (!on) {
      facts().forEach((f) => f.removeAttribute('data-v3-long'));
      D.querySelectorAll('#pjxc .pjxc-facts[data-v3-stack]').forEach((g) => g.removeAttribute('data-v3-stack'));
    }
  }
  function set(v) {
    const next = v === 'v3' ? 'v3' : 'v2';
    if (next !== get()) {
      if (next === 'v3') H.setAttribute(ATTR, 'v3'); else H.removeAttribute(ATTR);
      watch(next === 'v3');
      // the page lays itself out by measuring (the head's fit, the notes' place): draw it again at the new sizes
      try { PJX.rerender(); } catch (e) { /* nothing mounted yet */ }
    }
  }

  PJX.read = { get, set };
  set('v3');
})(window);
