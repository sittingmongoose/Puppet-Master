/* Projects concepts (Opus 5.5): Split v3, "easier to read". The switch.

   Split v3 is not a second concept with its own renderer: it is Split (concept C, concepts/c.js) shown with
   concepts/c-v3.css. So everything Split does, and everything fixed in it later, is in v3 too, and switching between v2
   and v3 keeps the chosen Project, an open New Project and every answer exactly where they were.

   This file turns the stylesheet on and off: it sets data-pjx-read="v3" on <html>, which every rule in c-v3.css is
   anchored on. The review strip asks for it by message ({ source: 'pjx-host', cmd: 'read', read: 'v3' | 'v2' }); key 4
   shows v3 and key 3 goes back to v2, as 1, 2, 3 and 0 pick the concepts. It tells the strip which one shows
   ({ source: 'pjx', type: 'read', read }).

   One thing a stylesheet cannot know is how long a value is. While v3 shows, each plate's facts are measured against
   the plate's own width, and marked for c-v3.css:
   - data-v3-stack on the facts: most of this plate's values would not fit on one line beside their labels (Backup,
     Where work runs in a half-width plate), so every label goes above its value and the plate reads one way;
   - data-v3-long on a fact: this one value would need more than two lines beside its label (a sentence, a long path),
     so it alone goes under its label, the plate wide.
   Nothing else in Split's markup is touched, and the marks go when v2 comes back. */
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
      const need = rows.map((f) => widthOf(f.querySelector('.pmu-factv')));
      const stack = rows.length >= 3 && need.filter((n) => n > col).length * 2 > rows.length;
      flag(g, 'data-v3-stack', stack);
      rows.forEach((f, i) => flag(f, 'data-v3-long', !stack && need[i] > col * LINES * FILL));
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
