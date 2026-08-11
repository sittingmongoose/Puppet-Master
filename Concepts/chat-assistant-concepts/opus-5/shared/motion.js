/* PMX motion — Opus 5
 *
 * Reduced motion is TWO-PART and both parts are mandatory:
 *   1. the blanket CSS duration override in motion.css
 *   2. an explicit early return in every JS-driven animation below
 * The CSS rule cannot stop a requestAnimationFrame loop or a staged JS sequence, so any
 * function that animates must check reduced() first and apply the final state synchronously.
 * Reduced motion must reach the SAME complete state with no partial transitions.
 */
(function (global) {
  'use strict';

  var SUPPORTS_INTERPOLATE_SIZE = (function () {
    try { return !!(global.CSS && CSS.supports && CSS.supports('interpolate-size', 'allow-keywords')); }
    catch (e) { return false; }
  })();

  var mql = null;
  function media() {
    if (mql === null) {
      try { mql = global.matchMedia ? global.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false, addEventListener: null }; }
      catch (e) { mql = { matches: false, addEventListener: null }; }
    }
    return mql;
  }

  /* Themes and motion are STAGE-scoped, not on documentElement, so walk up from the element.
   * Falling back to the first stage in the document keeps callers that have no element working. */
  function stageOf(el) {
    var n = el;
    while (n && n.nodeType === 1) {
      if (n.hasAttribute && n.hasAttribute('data-motion')) return n;
      n = n.parentNode;
    }
    return document.querySelector('[data-motion]');
  }

  function reduced(el) {
    var st = stageOf(el);
    if (st && st.getAttribute('data-motion') === 'reduced') return true;
    if (st && st.getAttribute('data-motion') === 'full') return false;
    return !!media().matches;
  }

  var changeSubs = [];
  function onChange(fn) {
    changeSubs.push(fn);
    return function () {
      var i = changeSubs.indexOf(fn);
      if (i >= 0) changeSubs.splice(i, 1);
    };
  }
  function fireChange() {
    var list = changeSubs.slice();
    for (var i = 0; i < list.length; i++) { try { list[i](); } catch (e) {} }
  }
  (function wireChangeSignals() {
    var m = media();
    if (m && m.addEventListener) { try { m.addEventListener('change', fireChange); } catch (e) {} }
    if (global.MutationObserver) {
      try {
        new MutationObserver(fireChange).observe(document.documentElement, {
          attributes: true, subtree: true, attributeFilter: ['data-motion']
        });
      } catch (e) {}
    }
  })();

  /* Cancel anything in flight and leave the element at its committed final state. */
  function snapToEnd(el) {
    if (!el || !el.getAnimations) return;
    try {
      var anims = el.getAnimations({ subtree: true });
      for (var i = 0; i < anims.length; i++) {
        try { anims[i].finish(); } catch (e) { try { anims[i].cancel(); } catch (e2) {} }
      }
    } catch (e) {}
    el.style.transition = '';
  }

  function afterTransition(el, prop, fn, maxMs) {
    var done = false;
    function finish() {
      if (done) return;
      done = true;
      el.removeEventListener('transitionend', onEnd);
      clearTimeout(timer);
      fn();
    }
    function onEnd(ev) { if (ev.target === el && (!prop || ev.propertyName === prop)) finish(); }
    el.addEventListener('transitionend', onEnd);
    /* transitionend genuinely does not always fire (interrupted, zero-delta, display change).
     * The timer is not belt-and-braces paranoia here, it is required for correctness. */
    var timer = setTimeout(finish, maxMs || 480);
    return finish;
  }

  /* Animate height to/from auto. Uses interpolate-size where available, otherwise the
   * measured scrollHeight pattern. opts.collapsedHeight clamps to N lines instead of 0. */
  function collapseTo(el, open, opts) {
    opts = opts || {};
    var collapsed = opts.collapsedHeight != null ? opts.collapsedHeight : 0;
    var dur = opts.duration || 260;
    var onDone = opts.onDone;

    if (!el) { if (onDone) onDone(); return; }

    if (reduced(el)) {
      el.style.transition = 'none';
      el.style.overflow = open ? '' : 'hidden';
      el.style.height = open ? '' : (typeof collapsed === 'number' ? collapsed + 'px' : collapsed);
      /* Force the style to commit before clearing the transition override. */
      void el.offsetHeight;
      el.style.transition = '';
      if (onDone) onDone();
      return;
    }

    el.style.overflow = 'hidden';

    if (SUPPORTS_INTERPOLATE_SIZE) {
      el.style.transition = 'height ' + dur + 'ms var(--ease-default, ease)';
      el.style.height = open ? 'auto' : (typeof collapsed === 'number' ? collapsed + 'px' : collapsed);
      afterTransition(el, 'height', function () {
        el.style.transition = '';
        if (open) { el.style.height = ''; el.style.overflow = ''; }
        if (onDone) onDone();
      }, dur + 200);
      return;
    }

    var from = el.getBoundingClientRect().height;
    el.style.transition = 'none';
    el.style.height = from + 'px';
    void el.offsetHeight;
    var to;
    if (open) {
      el.style.height = 'auto';
      to = el.getBoundingClientRect().height;
      el.style.height = from + 'px';
      void el.offsetHeight;
    } else {
      to = typeof collapsed === 'number' ? collapsed : parseFloat(collapsed) || 0;
    }
    el.style.transition = 'height ' + dur + 'ms var(--ease-default, ease)';
    el.style.height = to + 'px';
    afterTransition(el, 'height', function () {
      el.style.transition = '';
      if (open) { el.style.height = ''; el.style.overflow = ''; }
      if (onDone) onDone();
    }, dur + 200);
  }

  /* Multi-stage activity group -> single summary row. Height plus content morph. */
  function condense(el, buildSummary, opts) {
    opts = opts || {};
    var dur = opts.duration || 260;
    var onDone = opts.onDone;
    if (!el) { if (onDone) onDone(); return; }

    if (reduced(el)) {
      while (el.firstChild) el.removeChild(el.firstChild);
      buildSummary(el);
      if (onDone) onDone();
      return;
    }

    var from = el.getBoundingClientRect().height;
    el.style.overflow = 'hidden';
    el.style.transition = 'none';
    el.style.height = from + 'px';
    void el.offsetHeight;

    var kids = [];
    for (var i = 0; i < el.children.length; i++) kids.push(el.children[i]);
    for (var j = 0; j < kids.length; j++) {
      kids[j].style.transition = 'opacity 120ms ease';
      kids[j].style.opacity = '0';
    }

    setTimeout(function () {
      while (el.firstChild) el.removeChild(el.firstChild);
      buildSummary(el);
      el.style.height = 'auto';
      var to = el.getBoundingClientRect().height;
      el.style.height = from + 'px';
      void el.offsetHeight;
      el.style.transition = 'height ' + dur + 'ms var(--ease-default, ease)';
      el.style.height = to + 'px';
      afterTransition(el, 'height', function () {
        el.style.transition = '';
        el.style.height = '';
        el.style.overflow = '';
        if (onDone) onDone();
      }, dur + 200);
    }, 130);
  }

  /* In-place text replacement that never moves the container. */
  function swapText(el, text) {
    if (!el) return;
    if (reduced(el)) { el.textContent = text; return; }
    el.style.transition = 'opacity 110ms ease';
    el.style.opacity = '0';
    global.requestAnimationFrame(function () {
      global.requestAnimationFrame(function () {
        el.textContent = text;
        el.style.opacity = '1';
      });
    });
  }

  /* High-frequency callers (elapsed timers) must not fade — it reads as flicker. */
  function swapTextInstant(el, text) {
    if (el && el.textContent !== text) el.textContent = text;
  }

  function enter(el) {
    if (!el) return;
    if (reduced(el)) return;
    el.classList.add('pmx-enter');
    afterTransition(el, null, function () { el.classList.remove('pmx-enter'); }, 420);
  }

  function exit(el, onDone) {
    if (!el) { if (onDone) onDone(); return; }
    if (reduced(el)) { if (onDone) onDone(); return; }
    el.classList.add('pmx-exit');
    afterTransition(el, null, function () {
      el.classList.remove('pmx-exit');
      if (onDone) onDone();
    }, 320);
  }

  global.PMXMotion = {
    reduced: reduced,
    onChange: onChange,
    snapToEnd: snapToEnd,
    collapseTo: collapseTo,
    condense: condense,
    swapText: swapText,
    swapTextInstant: swapTextInstant,
    enter: enter,
    exit: exit,
    afterTransition: afterTransition,
    supportsInterpolateSize: SUPPORTS_INTERPOLATE_SIZE
  };
})(window);
