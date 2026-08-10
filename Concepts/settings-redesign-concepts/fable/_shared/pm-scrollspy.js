/* pm-scrollspy.js — window.PMSpy
   fable Settings bakeoff shared scrollspy.
   Cached-offset scroll math (IntersectionObserver is deliberately NOT the
   primary mechanism), 28%-viewport activation line with deadband hysteresis,
   programmatic-scroll suppression, reveal pipeline with focus flash.
   Slint note: maps to a Flickable viewport-position binding with an offset
   table recomputed on relayout. No emoji anywhere. */
(function () {
  'use strict';

  var ACTIVATION_FRACTION = 0.28; // activation line: 28% down the viewport
  var DEADBAND_PX = 32;           // hysteresis so slow scrolling cannot oscillate
  var SCROLL_IDLE_MS = 140;       // fallback settle: no scroll events for this long
  var SETTLE_CAP_MS = 1400;       // absolute cap on waiting for a smooth scroll

  function motionReduced() {
    // The three equivalent signals from the shell contract.
    try {
      var html = document.documentElement;
      if (html.getAttribute('data-motion') === 'reduced') return true;
      if (html.getAttribute('data-reduced-motion') === '1') return true;
      if (window.matchMedia &&
          window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true;
    } catch (e) { /* ignore */ }
    return false;
  }

  function attach(opts) {
    opts = opts || {};
    var scroller = opts.scroller;
    var getSections = (typeof opts.getSections === 'function') ? opts.getSections : function () { return []; };
    var onChange = (typeof opts.onChange === 'function') ? opts.onChange : function () {};
    var topOffset = (typeof opts.topOffset === 'number') ? opts.topOffset : 0;

    var state = {
      sections: [],      // [{id, offset, height}]
      activeId: null,
      scrollFraction: 0,
      isProgrammaticScroll: false
    };

    var controller = {
      state: state,
      topOffset: topOffset,
      refresh: refresh,
      jumpTo: jumpTo,
      dispose: dispose
    };

    if (!scroller || typeof scroller.addEventListener !== 'function') {
      // No scroller: return an inert controller rather than throwing.
      controller.refresh = function () {};
      controller.jumpTo = function () { return Promise.resolve(false); };
      controller.dispose = function () {};
      return controller;
    }

    var elements = [];        // parallel to state.sections
    var ro = null;
    var rafPending = false;
    var disposed = false;
    var settleTimer = 0;
    var settleCapTimer = 0;
    var settleScrollListener = null;
    var settled = true;

    function normalizeSections(list) {
      var out = [];
      var els = [];
      (Array.isArray(list) ? list : []).forEach(function (item) {
        var el = null;
        var id = null;
        if (item && item.nodeType === 1) {
          el = item;
          id = item.id || item.getAttribute('data-section') || null;
        } else if (item && typeof item === 'object' && item.el && item.el.nodeType === 1) {
          el = item.el;
          id = item.id || item.el.id || null;
        }
        if (!el || !id) return;
        out.push({ id: id, el: el });
        els.push(el);
      });
      elements = els;
      return out;
    }

    function computeOffsets() {
      var pairs = normalizeSections(getSections());
      var scRect;
      try { scRect = scroller.getBoundingClientRect(); } catch (e) { return; }
      var scTop = scroller.scrollTop;
      state.sections = pairs.map(function (p) {
        var r = p.el.getBoundingClientRect();
        return {
          id: p.id,
          offset: Math.max(0, Math.round(r.top - scRect.top + scTop)),
          height: Math.round(r.height)
        };
      });
      state.sections.sort(function (a, b) { return a.offset - b.offset; });
    }

    function observeAll() {
      if (!window.ResizeObserver) return;
      if (ro) ro.disconnect();
      ro = new ResizeObserver(function () { scheduleRefresh(); });
      try { ro.observe(scroller); } catch (e) { /* ignore */ }
      elements.forEach(function (el) {
        try { ro.observe(el); } catch (e) { /* ignore */ }
      });
    }

    function scheduleRefresh() {
      if (rafPending || disposed) return;
      rafPending = true;
      window.requestAnimationFrame(function () {
        rafPending = false;
        if (disposed) return;
        computeOffsets();
        updateActive(!state.isProgrammaticScroll);
      });
    }

    function refresh() {
      if (disposed) return;
      computeOffsets();
      observeAll();
      updateActive(!state.isProgrammaticScroll);
    }

    function activationLine() {
      return scroller.scrollTop + scroller.clientHeight * ACTIVATION_FRACTION;
    }

    function rawCandidateIndex(line) {
      var idx = -1;
      for (var i = 0; i < state.sections.length; i++) {
        if (state.sections[i].offset <= line) idx = i; else break;
      }
      return idx;
    }

    function indexOfId(id) {
      for (var i = 0; i < state.sections.length; i++) {
        if (state.sections[i].id === id) return i;
      }
      return -1;
    }

    function updateFraction() {
      var range = scroller.scrollHeight - scroller.clientHeight;
      state.scrollFraction = range > 0 ? Math.min(1, Math.max(0, scroller.scrollTop / range)) : 0;
    }

    function updateActive(fire) {
      updateFraction();
      if (state.sections.length === 0) return;

      var line = activationLine();
      var candIdx = rawCandidateIndex(line);
      var curIdx = indexOfId(state.activeId);

      // Pin the edges: hard top -> first section, hard bottom -> last section.
      var atBottom = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 2;
      if (atBottom) candIdx = state.sections.length - 1;
      if (candIdx < 0) candIdx = 0;

      var nextIdx = curIdx;
      if (curIdx < 0) {
        nextIdx = candIdx; // nothing active yet: adopt directly
      } else if (candIdx > curIdx) {
        // Moving down: only advance once the line is DEADBAND past the boundary.
        if (atBottom || line - state.sections[candIdx].offset >= DEADBAND_PX) nextIdx = candIdx;
      } else if (candIdx < curIdx) {
        // Moving up: only retreat once the line is DEADBAND above the current start.
        if (state.sections[curIdx].offset - line >= DEADBAND_PX) nextIdx = candIdx;
      }

      if (nextIdx !== curIdx && nextIdx >= 0) {
        state.activeId = state.sections[nextIdx].id;
        if (fire) {
          try { onChange(state.activeId, state); } catch (e) { /* listener error stays local */ }
        }
      }
    }

    function onScroll() {
      if (disposed) return;
      if (state.isProgrammaticScroll) { updateFraction(); return; }
      updateActive(true);
    }

    function clearSettleWatchers() {
      if (settleTimer) { window.clearTimeout(settleTimer); settleTimer = 0; }
      if (settleCapTimer) { window.clearTimeout(settleCapTimer); settleCapTimer = 0; }
      if (settleScrollListener) {
        scroller.removeEventListener('scroll', settleScrollListener);
        settleScrollListener = null;
      }
      try { scroller.removeEventListener('scrollend', onScrollEnd); } catch (e) { /* ignore */ }
    }

    var pendingResolve = null;
    function onScrollEnd() { finishSettle(); }

    function finishSettle() {
      if (settled) return;
      settled = true;
      clearSettleWatchers();
      // Double-rAF settle before re-enabling spy updates (layout has landed).
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(function () {
          state.isProgrammaticScroll = false;
          updateActive(false); // realign silently; the jump already announced its target
          if (pendingResolve) { var r = pendingResolve; pendingResolve = null; r(); }
        });
      });
    }

    function jumpTo(id, jumpOpts) {
      jumpOpts = jumpOpts || {};
      var idx = indexOfId(id);
      if (idx < 0) { computeOffsets(); idx = indexOfId(id); }
      if (idx < 0) return Promise.resolve(false);

      var extra = (typeof jumpOpts.topOffset === 'number') ? jumpOpts.topOffset : controller.topOffset;
      var maxTop = Math.max(0, scroller.scrollHeight - scroller.clientHeight);
      var top = Math.min(maxTop, Math.max(0, state.sections[idx].offset - extra));

      // Announce the destination immediately so nav highlights without flicker,
      // then suppress spy churn until the scroll settles.
      state.isProgrammaticScroll = true;
      settled = false;
      if (state.activeId !== id) {
        state.activeId = id;
        try { onChange(id, state); } catch (e) { /* ignore */ }
      }

      return new Promise(function (resolve) {
        pendingResolve = resolve;
        clearSettleWatchers();

        // scrollend accelerates settling where supported; the idle timer is
        // the universal fallback (also covers "already at target" no-op scrolls).
        if ('onscrollend' in window) {
          scroller.addEventListener('scrollend', onScrollEnd, { once: true });
        }
        settleScrollListener = function () {
          if (settleTimer) window.clearTimeout(settleTimer);
          settleTimer = window.setTimeout(finishSettle, SCROLL_IDLE_MS);
        };
        scroller.addEventListener('scroll', settleScrollListener, { passive: true });
        settleTimer = window.setTimeout(finishSettle, SCROLL_IDLE_MS + 60);
        settleCapTimer = window.setTimeout(finishSettle, SETTLE_CAP_MS);

        try {
          scroller.scrollTo({ top: top, behavior: motionReduced() ? 'auto' : 'smooth' });
        } catch (e) {
          try { scroller.scrollTop = top; } catch (e2) { /* ignore */ }
        }

        var focusEl = jumpOpts.focusEl;
        if (focusEl) focusFlash(focusEl);
      });
    }

    function dispose() {
      disposed = true;
      clearSettleWatchers();
      try { scroller.removeEventListener('scroll', onScroll); } catch (e) { /* ignore */ }
      if (ro) { ro.disconnect(); ro = null; }
      state.sections = [];
    }

    scroller.addEventListener('scroll', onScroll, { passive: true });
    refresh();
    return controller;
  }

  /* Focus flash: adds .pm-focus-flash (background tint decay defined by the
     shell CSS), removes it after decay. Reduced motion collapses to one short
     opacity step with no animation. */
  var flashTimers = (typeof WeakMap === 'function') ? new WeakMap() : null;

  function focusFlash(el) {
    if (!el || el.nodeType !== 1) return;
    try {
      var prev = flashTimers && flashTimers.get(el);
      if (prev) window.clearTimeout(prev);
      el.classList.remove('pm-focus-flash');
      // Force restart so repeated reveals re-flash.
      void el.offsetWidth; // eslint-disable-line no-void
      el.classList.add('pm-focus-flash');
      var hold = motionReduced() ? 400 : 1200;
      var t = window.setTimeout(function () {
        el.classList.remove('pm-focus-flash');
      }, hold);
      if (flashTimers) flashTimers.set(el, t);
    } catch (e) { /* ignore */ }
  }

  /* Reveal pipeline: run each ensure step (category load, disclosure
     expansion), let layout settle across two frames, refresh offsets,
     jump, then flash the target row. Returns a promise. */
  function reveal(opts) {
    opts = opts || {};
    var controller = opts.controller;
    var ensures = Array.isArray(opts.ensure) ? opts.ensure : [];
    var targetId = opts.targetId;
    var focusEl = opts.focusEl;

    var chain = Promise.resolve();
    ensures.forEach(function (fn) {
      chain = chain.then(function () {
        if (typeof fn === 'function') return fn();
        return null;
      });
    });

    return chain.then(function () {
      return new Promise(function (resolve) {
        window.requestAnimationFrame(function () {
          window.requestAnimationFrame(resolve);
        });
      });
    }).then(function () {
      if (!controller || typeof controller.refresh !== 'function') return false;
      controller.refresh();
      return controller.jumpTo(targetId, {});
    }).then(function (ok) {
      var el = focusEl;
      if (!el && typeof targetId === 'string') {
        try { el = document.getElementById(targetId); } catch (e) { el = null; }
      }
      if (el) focusFlash(el);
      return ok;
    }).catch(function () {
      return false;
    });
  }

  window.PMSpy = {
    attach: attach,
    reveal: reveal,
    focusFlash: focusFlash
  };
})();
