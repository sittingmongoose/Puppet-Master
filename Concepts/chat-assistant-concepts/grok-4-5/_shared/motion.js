/* Grok 4.5 chat motion layer — enter/reveal, exit helpers, stagger,
   panel leave, toast, reduced-motion flag. CSS in motion.css. */
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

  function playEnter(el, className) {
    if (isReduced()) {
      markImmediate(el);
      return;
    }
    var key = msgKey(el);
    if (key && revealedIds[key]) {
      markImmediate(el);
      return;
    }
    var cls = className || 'pm-motion-enter';
    el.classList.remove('pm-motion-pending', 'pm-motion-exit');
    void el.offsetWidth;
    el.classList.add(cls);
    if (key) revealedIds[key] = 1;
    var done = function () {
      el.classList.remove(cls);
      el.classList.add('pm-motion-revealed');
      el.removeEventListener('animationend', done);
    };
    el.addEventListener('animationend', done);
    setTimeout(done, 700);
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
    playExit: playExit,
    leaveThenRemove: leaveThenRemove,
    leaveThenHide: leaveThenHide,
    stagger: stagger,
    toast: toast,
    statusKind: statusKind,
    statusMark: statusMark
  };
})();
