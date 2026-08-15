/* Grok 4.5 chat motion layer — causal continuity (videos 01–04).
   CSS: motion.css. Reduced-motion preserves meaning; no indefinite fake glow.

   Video map → hooks:
   01 message arrival  → .pm-msg-arrive + playEnterFromComposer / playEnter /
                         armElement / --pm-enter-ox|oy (composer→bubble settle)
   02 paged questionnaire → .pm-q-stage shell stable; .pm-q-carousel-pane cross-fade/slide;
                            morphQuestionnairePageHeight for page height morph
   03 compact activity → .pm-activity-evolve condense/reopen; .pm-activity-index-detail
                         is-expanding|is-collapsing; index DOM preserved
   04 Q morph          → prepare(is-pill/is-preparing)→expand(pm-q-height-morph)→
                         submit(is-submitting)→compress(pm-q-settle)
*/
(function () {
  'use strict';

  var observer = null;
  var revealedIds = Object.create(null);
  var SELECTOR = '.pm-msg[data-message-id], .pm-q-card, .pm-q-stage';

  function isReduced() {
    return (
      document.documentElement.getAttribute('data-reduced-motion') === '1' ||
      document.documentElement.getAttribute('data-motion') === 'reduced' ||
      (typeof matchMedia === 'function' &&
        matchMedia('(prefers-reduced-motion: reduce)').matches)
    );
  }

  function setReduced(on) {
    var reduced = !!on;
    document.documentElement.setAttribute('data-reduced-motion', reduced ? '1' : '0');
    document.documentElement.setAttribute('data-motion', reduced ? 'reduced' : 'full');
    if (reduced && window.PMMenu && typeof window.PMMenu.closeAll === 'function') {
      window.PMMenu.closeAll(true);
    }
    if (reduced) {
      document.querySelectorAll('.pm-motion-enter, .pm-motion-pending, .pm-motion-exit').forEach(function (el) {
        el.classList.remove('pm-motion-enter', 'pm-motion-pending', 'pm-motion-exit');
        el.classList.add('pm-motion-revealed');
      });
    }
  }

  function msgKey(el) {
    return (
      el.getAttribute('data-message-id') ||
      el.getAttribute('data-questionnaire-id') ||
      el.getAttribute('data-motion-key') ||
      null
    );
  }

  function markImmediate(el) {
    el.classList.remove('pm-motion-pending', 'pm-motion-enter', 'pm-motion-exit');
    el.classList.add('pm-motion-revealed');
    var key = msgKey(el);
    if (key) revealedIds[key] = 1;
  }

  /**
   * Video 01 — spatial continuity enter (origin → settle), not an abrupt snap.
   * Respects revealed-ids without blocking first arrival of a new key.
   * opts.origin: {x,y} pixel delta from intended origin (e.g. composer).
   */
  function playEnter(el, className, opts) {
    if (isReduced()) {
      markImmediate(el);
      return;
    }
    var key = msgKey(el);
    if (key && revealedIds[key]) {
      markImmediate(el);
      return;
    }
    opts = opts || {};
    var cls = className || 'pm-motion-enter';
    el.classList.remove(
      'pm-motion-pending',
      'pm-motion-exit',
      'pm-motion-enter-spatial',
      'pm-msg-arrive'
    );
    if (opts.origin && (opts.origin.x != null || opts.origin.y != null)) {
      var ox = Number(opts.origin.x) || 0;
      var oy = Number(opts.origin.y) || 0;
      el.style.setProperty('--pm-enter-ox', ox + 'px');
      el.style.setProperty('--pm-enter-oy', oy + 'px');
      cls = 'pm-motion-enter-spatial';
    }
    void el.offsetWidth;
    el.classList.add(cls);
    /* Video 01 marker — composer→bubble settle (alias of spatial enter). */
    if (cls === 'pm-motion-enter-spatial' || opts.msgArrive) {
      el.classList.add('pm-msg-arrive');
    }
    if (key) revealedIds[key] = 1;
    var done = function () {
      el.classList.remove(cls, 'pm-msg-arrive');
      el.classList.add('pm-motion-revealed');
      el.style.removeProperty('--pm-enter-ox');
      el.style.removeProperty('--pm-enter-oy');
      el.removeEventListener('animationend', done);
    };
    el.addEventListener('animationend', done);
    setTimeout(done, 700);
  }

  /** Video 01 helper: enter from composer (or fallback bottom) toward settle. */
  function playEnterFromComposer(el, composerEl) {
    if (!el) return;
    if (isReduced()) {
      markImmediate(el);
      return;
    }
    var origin = { x: 0, y: 28 };
    try {
      var er = el.getBoundingClientRect();
      var cr = composerEl && composerEl.getBoundingClientRect
        ? composerEl.getBoundingClientRect()
        : null;
      if (cr && er) {
        origin.x = Math.round(cr.left + cr.width * 0.5 - (er.left + er.width * 0.5));
        origin.y = Math.round(cr.top - er.top);
      }
    } catch (_) {}
    playEnter(el, 'pm-motion-enter-spatial', { origin: origin, msgArrive: true });
  }

  /**
   * Video 02 — page height morph inside a stable outer .pm-q-stage shell.
   * Content cross-fade/slide is owned by .pm-q-carousel-pane classes.
   */
  function morphQuestionnairePageHeight(stage) {
    if (!stage || isReduced()) return;
    if (!stage.classList.contains('is-expanded')) return;
    var fromH = stage.getBoundingClientRect().height || 0;
    stage.classList.add('pm-q-height-morph', 'pm-q-page-morph');
    stage.style.overflow = 'hidden';
    stage.style.height = 'auto';
    var toH = Math.min(stage.scrollHeight || fromH, Math.floor(window.innerHeight * 0.52) || 480);
    stage.style.height = fromH + 'px';
    void stage.offsetHeight;
    requestAnimationFrame(function () {
      if (!stage.isConnected) return;
      stage.style.height = toH + 'px';
    });
    var finished = false;
    var finish = function () {
      if (finished) return;
      finished = true;
      stage.removeEventListener('transitionend', onEnd);
      if (!stage.isConnected) return;
      stage.style.height = '';
      stage.style.overflow = '';
      stage.classList.remove('pm-q-height-morph', 'pm-q-page-morph');
    };
    var onEnd = function (ev) {
      if (ev.target !== stage || (ev.propertyName && ev.propertyName !== 'height')) return;
      finish();
    };
    stage.addEventListener('transitionend', onEnd);
    setTimeout(finish, 480);
  }

  /** Video 03 — expand/collapse activity index item without destroying the index. */
  function toggleActivityIndexItem(btn) {
    if (!btn) return false;
    var item = btn.closest('.pm-activity-index-item');
    var detail = item && item.querySelector('[data-activity-stage-detail]');
    if (!detail) return false;
    var open = btn.getAttribute('aria-expanded') === 'true';
    if (open) {
      if (!isReduced()) detail.classList.add('is-collapsing');
      btn.setAttribute('aria-expanded', 'false');
      if (item) item.classList.remove('is-open');
      var hide = function () {
        detail.classList.remove('is-collapsing');
        detail.setAttribute('hidden', '');
      };
      if (isReduced()) hide();
      else setTimeout(hide, 160);
    } else {
      detail.removeAttribute('hidden');
      detail.classList.remove('is-collapsing');
      if (!isReduced()) detail.classList.add('is-expanding');
      btn.setAttribute('aria-expanded', 'true');
      if (item) item.classList.add('is-open');
      setTimeout(function () {
        detail.classList.remove('is-expanding');
      }, 220);
    }
    return true;
  }

  function playExit(el, className, onDone) {
    if (!el) {
      if (onDone) onDone();
      return;
    }
    if (isReduced()) {
      if (onDone) onDone();
      return;
    }
    var cls = className || 'pm-motion-exit';
    el.classList.add(cls, 'is-leaving');
    var finished = false;
    var done = function () {
      if (finished) return;
      finished = true;
      el.classList.remove(cls, 'is-leaving');
      el.removeEventListener('animationend', done);
      if (onDone) onDone();
    };
    el.addEventListener('animationend', done);
    setTimeout(done, 420);
  }

  function leaveThenRemove(el, className, onDone) {
    playExit(el, className, function () {
      if (el && el.parentNode) el.parentNode.removeChild(el);
      if (onDone) onDone();
    });
  }

  function leaveThenHide(el, className, onDone) {
    playExit(el, className, function () {
      if (el) {
        el.hidden = true;
        el.setAttribute('aria-hidden', 'true');
      }
      if (onDone) onDone();
    });
  }

  function ensureObserver() {
    if (observer || typeof IntersectionObserver !== 'function') return observer;
    observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          observer.unobserve(el);
          playEnter(el);
        });
      },
      { root: null, rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
    );
    return observer;
  }

  function armElement(el) {
    if (!el || el.classList.contains('pm-motion-revealed')) return;
    var key = msgKey(el);
    if (key && revealedIds[key]) {
      markImmediate(el);
      return;
    }
    if (isReduced()) {
      markImmediate(el);
      return;
    }
    el.classList.add('pm-motion-pending');
    var io = ensureObserver();
    if (io) {
      io.observe(el);
    } else {
      requestAnimationFrame(function () {
        playEnter(el);
      });
    }
  }

  function observeReveals(root) {
    var scope = root && root.querySelectorAll ? root : document;
    var nodes = scope.querySelectorAll ? scope.querySelectorAll(SELECTOR) : [];
    for (var i = 0; i < nodes.length; i++) armElement(nodes[i]);
  }

  function refresh(root) {
    observeReveals(root || document);
  }

  function resetSeen() {
    revealedIds = Object.create(null);
  }

  function stagger(root, childSelector) {
    if (!root || isReduced()) return;
    root.classList.add('pm-stagger');
    var kids = childSelector ? root.querySelectorAll(childSelector) : root.children;
    for (var i = 0; i < kids.length; i++) {
      kids[i].style.setProperty('--stagger-i', String(i));
    }
  }

  function toast(message, ms) {
    var existing = document.querySelector('.pm-host-toast');
    if (existing && existing.parentNode) existing.parentNode.removeChild(existing);
    var el = document.createElement('div');
    el.className = 'pm-host-toast';
    el.setAttribute('role', 'status');
    el.textContent = String(message || '');
    document.body.appendChild(el);
    var hold = typeof ms === 'number' ? ms : 2200;
    setTimeout(function () {
      leaveThenRemove(el, 'pm-toast-out');
    }, hold);
    return el;
  }

  function statusKind(status) {
    var s = String(status || 'idle').toLowerCase();
    if (s === 'working' || s === 'running' || s === 'in_progress') return 'working';
    if (s === 'needs_attention' || s === 'attention' || s === 'waiting') return 'attention';
    if (s === 'blocked' || s === 'error' || s === 'failed') return 'blocked';
    if (s === 'done' || s === 'complete' || s === 'completed' || s === 'finished') return 'done';
    return 'idle';
  }

  function statusMark(status, label) {
    var kind = statusKind(status);
    var wrap = document.createElement('span');
    wrap.className = 'pm-thread-status is-' + kind;
    wrap.setAttribute('aria-label', label || status || 'idle');
    wrap.title = label || status || 'Idle';
    var mark = document.createElement('span');
    mark.className = 'pm-thread-status-mark';
    mark.setAttribute('aria-hidden', 'true');
    wrap.appendChild(mark);
    return wrap;
  }

  window.PMChatMotion = {
    isReduced: isReduced,
    setReduced: setReduced,
    observeReveals: observeReveals,
    refresh: refresh,
    resetSeen: resetSeen,
    playEnter: playEnter,
    playEnterFromComposer: playEnterFromComposer,
    morphQuestionnairePageHeight: morphQuestionnairePageHeight,
    toggleActivityIndexItem: toggleActivityIndexItem,
    playExit: playExit,
    leaveThenRemove: leaveThenRemove,
    leaveThenHide: leaveThenHide,
    stagger: stagger,
    toast: toast,
    statusKind: statusKind,
    statusMark: statusMark
  };
})();
