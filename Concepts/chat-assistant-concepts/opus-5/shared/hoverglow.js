/* PMX hover engine — Opus 5
 *
 * Writes --pmx-mx/--pmx-my on row surfaces so the wash in materials.css tracks
 * the pointer. Deliberately narrow in scope: PMConcept7 excludes the composer
 * and the model/mode menus from its equivalent engine, and that exclusion is
 * copied here — the transcript is where the user is reading, and a surface
 * that glows under the pointer while they read is a distraction.
 *
 * Cost control: one delegated pointermove per document, coalesced to a single
 * rAF, and it only touches an element while the pointer is actually over one.
 * The CSS carries 50% fallbacks, so with this file absent (or under reduced
 * motion, where it returns early) the effect degrades to a centred glow rather
 * than disappearing.
 */
(function (global) {
  'use strict';

  var SELECTOR = '.pmx-search-hit, .pmx-shell-file-row, .pmx-shell-rail-item,' +
                 '.pmx-chrome-hrow, .pmx-chrome-ctx-row, .pmx-hoverable';

  var bound = [];
  var pending = null;   /* {el, x, y} awaiting a frame */
  var frame = 0;
  var active = null;    /* element currently carrying the custom properties */

  function reduced(el) {
    if (global.PMXMotion && global.PMXMotion.reduced) return global.PMXMotion.reduced(el);
    var stage = el && el.closest ? el.closest('[data-motion]') : null;
    if (stage && stage.getAttribute('data-motion') === 'reduced') return true;
    if (stage && stage.getAttribute('data-motion') === 'full') return false;
    return !!(global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  function clear(el) {
    if (!el) return;
    el.style.removeProperty('--pmx-mx');
    el.style.removeProperty('--pmx-my');
  }

  function apply() {
    frame = 0;
    if (!pending) return;
    var el = pending.el, x = pending.x, y = pending.y;
    pending = null;
    if (active && active !== el) clear(active);
    if (!el) { active = null; return; }
    var r = el.getBoundingClientRect();
    if (!r.width || !r.height) return;
    el.style.setProperty('--pmx-mx', (((x - r.left) / r.width) * 100).toFixed(1) + '%');
    el.style.setProperty('--pmx-my', (((y - r.top) / r.height) * 100).toFixed(1) + '%');
    active = el;
  }

  function onMove(e) {
    var el = e.target && e.target.closest ? e.target.closest(SELECTOR) : null;
    if (el && reduced(el)) { if (active) { clear(active); active = null; } return; }
    if (!el && !active) return;
    pending = { el: el, x: e.clientX, y: e.clientY };
    if (!frame) frame = global.requestAnimationFrame(apply);
  }

  function onLeave() {
    pending = null;
    if (active) { clear(active); active = null; }
  }

  var PMXHover = {
    /* Bind once per document. Idempotent — a second call for the same
       document is a no-op, which matters because every composition mounts
       independently but they all share one document. */
    bind: function (doc) {
      var d = doc || global.document;
      for (var i = 0; i < bound.length; i++) if (bound[i] === d) return;
      bound.push(d);
      d.addEventListener('pointermove', onMove, true);
      d.addEventListener('pointerleave', onLeave, true);
      d.addEventListener('pointercancel', onLeave, true);
    },

    destroy: function (doc) {
      var d = doc || global.document;
      var i = bound.indexOf(d);
      if (i < 0) return;
      bound.splice(i, 1);
      d.removeEventListener('pointermove', onMove, true);
      d.removeEventListener('pointerleave', onLeave, true);
      d.removeEventListener('pointercancel', onLeave, true);
      onLeave();
    }
  };

  global.PMXHover = PMXHover;
})(window);
