/* =====================================================================
   Puppet Master Assistant — motion helpers
   ---------------------------------------------------------------------
   Pure-string builders plus two runtime helpers, shared by app.js and by
   every working-animation take. Loaded before app.js.

   Why string builders: renderApp() produces HTML and hands it to
   pmPatch(), which reconciles it into the living DOM. A node only gets
   created when it is genuinely new, so a CSS entrance animation on that
   node fires exactly once, when the thing it represents first appears.
   That means the cascade needs no JS orchestration at all -- give a row
   a data-k that encodes its identity and the motion follows for free.
   ===================================================================== */
(() => {
  'use strict';

  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));

  /* Split text into per-word spans so prose resolves a word at a time,
     the way the reference streams it (~1 word per 45-65ms). `from` lets
     a caller continue a cascade that started in an earlier block. */
  function words(text, from = 0, cap = 120) {
    const parts = String(text ?? '').split(/(\s+)/);
    let i = from, out = '';
    for (const p of parts) {
      if (!p) continue;
      if (/^\s+$/.test(p)) { out += p; continue; }
      out += `<span class="pm-word" style="--pm-stagger:${Math.min(i, cap)}">${esc(p)}</span>`;
      i++;
    }
    return out;
  }
  const wordCount = (text) => String(text ?? '').trim().split(/\s+/).filter(Boolean).length;

  /* A number that rolls when it changes. The data-k carries the value,
     so pmPatch replaces the inner node only on a real change -- which is
     precisely when the roll should play. */
  function roll(value, cls = '') {
    const v = esc(value);
    return `<span class="pm-roll ${cls}"><i data-k="roll:${v}">${v}</i></span>`;
  }

  /* First-Last-Invert-Play. Used for height and rail-position changes,
     which cannot be transitioned directly (height:auto, flex reflow). */
  function flip(nodes, mutate, opts = {}) {
    const list = Array.isArray(nodes) ? nodes : [nodes];
    const live = list.filter(Boolean);
    const first = new Map();
    live.forEach((n) => first.set(n, n.getBoundingClientRect()));
    mutate();
    const dur = opts.duration ?? 320;
    const ease = opts.easing ?? 'cubic-bezier(.22,.80,.28,1)';
    live.forEach((n) => {
      const a = first.get(n), b = n.getBoundingClientRect();
      if (!a || !b.width || !b.height) return;
      const dx = a.left - b.left, dy = a.top - b.top;
      const sx = a.width / b.width, sy = a.height / b.height;
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5 &&
          Math.abs(sx - 1) < 0.01 && Math.abs(sy - 1) < 0.01) return;
      n.animate(
        [{ transformOrigin: 'top left', transform: `translate(${dx}px,${dy}px) scale(${sx},${sy})` },
         { transformOrigin: 'top left', transform: 'none' }],
        { duration: dur, easing: ease, composite: 'replace' }
      );
    });
  }

  /* Animate a container between its current height and whatever it
     becomes after `mutate` -- the expand/collapse the reference uses
     when a past step is re-opened. */
  function flipHeight(el, mutate, opts = {}) {
    if (!el) { mutate(); return; }
    const from = el.getBoundingClientRect().height;
    mutate();
    const to = el.getBoundingClientRect().height;
    if (Math.abs(from - to) < 1) return;
    el.animate(
      [{ height: `${from}px` }, { height: `${to}px` }],
      { duration: opts.duration ?? 320, easing: opts.easing ?? 'cubic-bezier(.22,.80,.28,1)' }
    );
  }

  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  window.PM56_MOTION = { words, wordCount, roll, flip, flipHeight, reduced, esc };

  /* Registry for working-animation takes that live outside app.js.
     A take is `(ctx) => htmlString`; see makeWorkCtx() in app.js for the
     shape of ctx. Registering index N makes it option N in the mixer. */
  window.PM56_WORKING = window.PM56_WORKING || {};
})();
