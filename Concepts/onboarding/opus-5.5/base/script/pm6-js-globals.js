
/* PMConcept6 globals (production): PM_ICONS hoist + window.toast + PM_PAGES router
   + a minimal PM_DEMO guard-shim. The pm6-js-demo-engine block (assembled
   immediately after this one, before every page block) REPLACES window.PM_DEMO
   with the full engine; the shim here only protects against an engine parse
   failure so page blocks never hit undefined APIs. */
(function () {
  'use strict';
  const PM_ICONS = (() => {
    const w = (body) => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + body + '</svg>';
    return {
      // ---- category icons (keys match PM_SETTINGS_DATA categories[].icon) ----
      palette: w('<path d="M12 3a9 9 0 1 0 0 18h1.2a2 2 0 0 0 1.5-3.3c-.9-1-.2-2.7 1.2-2.7H18a3 3 0 0 0 3-3c0-5-4-9-9-9z"/><circle cx="7.5" cy="11" r="0.6" fill="currentColor"/><circle cx="10.5" cy="7" r="0.6" fill="currentColor"/><circle cx="15" cy="7.5" r="0.6" fill="currentColor"/>'),
      brain: w('<path d="M11 5.5A2.5 2.5 0 0 0 8.5 3 2.5 2.5 0 0 0 6 5.5v.6A3.4 3.4 0 0 0 3.6 9.4c0 .7.2 1.3.6 1.9A3.6 3.6 0 0 0 3 14c0 1.7 1.2 3.2 2.9 3.5A2.9 2.9 0 0 0 8.8 21c1.2 0 2.2-.7 2.2-1.8V5.5z"/><path d="M13 5.5A2.5 2.5 0 0 1 15.5 3 2.5 2.5 0 0 1 18 5.5v.6a3.4 3.4 0 0 1 2.4 3.3c0 .7-.2 1.3-.6 1.9A3.6 3.6 0 0 1 21 14c0 1.7-1.2 3.2-2.9 3.5A2.9 2.9 0 0 1 15.2 21c-1.2 0-2.2-.7-2.2-1.8V5.5z"/>'),
      shield: w('<path d="M12 3l7 3v5.2c0 4.4-2.9 7.8-7 9.8-4.1-2-7-5.4-7-9.8V6l7-3z"/>'),
      terminal: w('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9l3 3-3 3"/><path d="M13 15h4"/>'),
      puzzle: w('<path d="M4 7h4V5.6A1.6 1.6 0 0 1 9.6 4c.9 0 1.6.7 1.6 1.6V7H15v4h1.4a1.6 1.6 0 0 1 0 3.2H15V18h-3.8v-1.4a1.6 1.6 0 0 0-3.2 0V18H4v-3.8h1.4a1.6 1.6 0 0 0 0-3.2H4V7z"/>'),
      clipboard: w('<rect x="6" y="5" width="12" height="16" rx="2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 11h6M9 15h4"/>'),
      branch: w('<circle cx="6" cy="6" r="2.2"/><circle cx="6" cy="18" r="2.2"/><circle cx="18" cy="8" r="2.2"/><path d="M6 8.2v7.6"/><path d="M18 10.2c0 3-2.5 4.3-5.5 4.6-2 .2-3.5.7-4.3 1.9"/>'),
      film: w('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M8 5v14M16 5v14M3 9.5h5M3 14.5h5M16 9.5h5M16 14.5h5"/>'),
      globe: w('<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3.6 9h16.8M3.6 15h16.8"/>'),
      masks: w('<path d="M4 4.5c2.3.8 4.7.8 7 0v5.3c0 2.6-1.6 4.7-3.5 4.7S4 12.4 4 9.8V4.5z"/><path d="M6 7.5h.01M9 7.5h.01" stroke-width="2.2"/><path d="M6 11c.9.8 2.1.8 3 0"/><path d="M13 9.7c2.3.8 4.7.8 7 0V15c0 2.6-1.6 4.7-3.5 4.7S13 17.6 13 15V9.7z"/><path d="M15 12.5h.01M18 12.5h.01" stroke-width="2.2"/><path d="M18 16.5c-.9-.8-2.1-.8-3 0"/>'),
      toolbox: w('<rect x="3" y="8" width="18" height="11" rx="2"/><path d="M9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><path d="M3 13h7m4 0h7"/><path d="M10 11.5h4v3h-4z"/>'),
      gear: w('<circle cx="12" cy="12" r="3.2"/><path d="M12 2.8l1.2 2.4 2.6-.5 .6 2.6 2.6.6-.5 2.6 2.4 1.2-1.6 2.1 1.6 2.1-2.4 1.2.5 2.6-2.6.6-.6 2.6-2.6-.5L12 21.2l-1.2-2.4-2.6.5-.6-2.6-2.6-.6.5-2.6L3.1 12l1.6-2.1L3.1 7.8l2.4-1.2-.5-2.6 2.6-.6.6-2.6 2.6.5L12 2.8z"/>'),
      // ---- utility icons ----
      wave: w('<path d="M7.5 11.5V5.8a1.3 1.3 0 0 1 2.6 0v4.4V4.3a1.3 1.3 0 0 1 2.6 0v5.9V5.3a1.3 1.3 0 0 1 2.6 0v5.9-3.9a1.3 1.3 0 0 1 2.6 0v7.2c0 3.6-2.4 6.5-6 6.5-2.8 0-4.4-1.2-5.8-3.6L4 13.6a1.4 1.4 0 0 1 2.4-1.4l1.1 1.8"/>'),
      search: w('<circle cx="11" cy="11" r="7"/><path d="M20.2 20.2L16 16"/>'),
      star: w('<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.9L12 16.9l-5.2 2.8 1-5.9-4.3-4.1 5.9-.9L12 3.5z"/>'),
      scales: w('<path d="M12 4v16"/><path d="M5.5 6.5h13"/><path d="M5.5 6.5L3 12.5a2.8 2.8 0 0 0 5 0L5.5 6.5z"/><path d="M18.5 6.5L16 12.5a2.8 2.8 0 0 0 5 0l-2.5-6z"/><path d="M8.5 20h7"/>'),
      sparkle: w('<path d="M11 4l1.5 4.2L16.7 9.7l-4.2 1.5L11 15.4 9.5 11.2 5.3 9.7l4.2-1.5L11 4z"/><path d="M18 14l.8 2.2L21 17l-2.2.8L18 20l-.8-2.2L15 17l2.2-.8L18 14z"/>'),
      restart: w('<path d="M20 12a8 8 0 1 1-2.4-5.7"/><path d="M20 3.5V8h-4.5"/>'),
      check: w('<path d="M4.5 12.5l5 5 10-11"/>'),
      checkCircle: w('<circle cx="12" cy="12" r="9"/><path d="M8 12.2l2.8 2.8L16.4 9"/>'),
      close: w('<path d="M6 6l12 12M18 6L6 18"/>'),
      soundOn: w('<path d="M4 10v4h3.5L12 17.5v-11L7.5 10H4z"/><path d="M15 9.5a3.6 3.6 0 0 1 0 5"/><path d="M17.5 7a7 7 0 0 1 0 10"/>'),
      soundOff: w('<path d="M4 10v4h3.5L12 17.5v-11L7.5 10H4z"/><path d="M16 10l4 4M20 10l-4 4"/>'),
      folder: w('<path d="M3 7a2 2 0 0 1 2-2h4l2 2.2h8a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/>'),
      home: w('<path d="M3.5 11L12 4l8.5 7"/><path d="M6 9.8V20h12V9.8"/>'),
      robot: w('<rect x="5" y="8" width="14" height="11" rx="2.5"/><path d="M12 8V5"/><circle cx="12" cy="4" r="1"/><path d="M9 12.5h.01M15 12.5h.01" stroke-width="2.4"/><path d="M9.5 16h5"/><path d="M3 12v4M21 12v4"/>'),
      wand: w('<path d="M5 19L15.5 8.5"/><path d="M17.5 4v2.6M16.2 5.3h2.6"/><path d="M20 9.5v1.8M19.1 10.4h1.8"/><path d="M14 3.5v1.4M13.3 4.2h1.4"/>'),
      plant: w('<path d="M12 21v-8"/><path d="M12 13C12 8.6 8.8 6 4.5 6c0 4.4 3.2 7 7.5 7z"/><path d="M12 10.5c0-3.3 2.4-5.3 5.6-5.3 0 3.3-2.4 5.3-5.6 5.3z"/>'),
      party: w('<path d="M6.5 11.5L3 21l9.5-3.5-6-6z"/><path d="M9 9.5c1.5-3 5-4 8-2.5"/><path d="M13 13c3-1.5 6.5-.5 7.5 2.5" /><circle cx="15" cy="4.5" r="0.7" fill="currentColor"/><circle cx="20" cy="9" r="0.7" fill="currentColor"/><circle cx="11" cy="5.5" r="0.7" fill="currentColor"/>'),
      plug: w('<path d="M9 7V3M15 7V3"/><path d="M7 7h10v3.5a5 5 0 0 1-10 0V7z"/><path d="M12 15.5V21"/>'),
      bolt: w('<path d="M13 2.5L5 13.5h5.5L10 21.5l8-11h-5.5L13 2.5z"/>'),
      telescope: w('<path d="M3.5 12.2L17 5.5l2.5 5L6 17.2l-2.5-5z"/><path d="M17 5.5l2.5 5"/><circle cx="11.5" cy="14.8" r="1.2"/><path d="M10.5 16.5L7.5 21.5M12.5 16.5l3 5"/>'),
      dial: w('<circle cx="12" cy="12" r="8.5"/><path d="M12 12l4.2-4.2"/><path d="M12 4.5v1.5M19.5 12H18M12 19.5V18M4.5 12H6"/>'),
      swirl: w('<path d="M12 3a9 9 0 1 1-9 9"/><path d="M12 7a5 5 0 1 1-5 5"/><circle cx="12" cy="12" r="1" fill="currentColor"/>'),
      warning: w('<path d="M12 4L2.8 19.5h18.4L12 4z"/><path d="M12 10v4.5"/><path d="M12 17.2h.01" stroke-width="2.4"/>'),
      rocket: w('<path d="M12 3c3.5 2.8 5 6.5 5 10.5l-2.6 2.6H9.6L7 13.5C7 9.5 8.5 5.8 12 3z"/><circle cx="12" cy="9.5" r="1.6"/><path d="M9.6 16l-1 4 3.4-2 3.4 2-1-4"/><path d="M7 13.5l-3 2 2.5 1"/><path d="M17 13.5l3 2-2.5 1"/>'),
      info: w('<circle cx="12" cy="12" r="9"/><path d="M12 10.8V16"/><path d="M12 7.8h.01" stroke-width="2.4"/>'),
      layers: w('<path d="M12 3l9 4.5-9 4.5-9-4.5L12 3z"/><path d="M3.5 12.5L12 16.7l8.5-4.2"/><path d="M3.5 16.5L12 20.7l8.5-4.2"/>'),
      bell: w('<path d="M12 3.5a5.5 5.5 0 0 0-5.5 5.5c0 4.2-1.2 5.6-2.3 6.7-.4.4-.1 1.3.6 1.3h14.4c.7 0 1-.9.6-1.3-1.1-1.1-2.3-2.5-2.3-6.7A5.5 5.5 0 0 0 12 3.5z"/><path d="M9.8 20a2.3 2.3 0 0 0 4.4 0"/>'),
      lock: w('<rect x="5" y="10.5" width="14" height="9.5" rx="2"/><path d="M8.2 10.5V7.7a3.8 3.8 0 0 1 7.6 0v2.8"/><path d="M12 14.2v2.4"/>'),
      expand: w('<path d="M13.5 4H20v6.5"/><path d="M20 4l-7 7"/><path d="M10.5 20H4v-6.5"/><path d="M4 20l7-7"/>'),
      pen: w('<path d="M4.5 19.5l.9-3.6L16.6 4.7a2 2 0 0 1 2.8 2.8L8.2 18.6l-3.7.9z"/><path d="M14.6 6.7l2.8 2.8"/>'),
      comment: w('<path d="M20 13.5a2.5 2.5 0 0 1-2.5 2.5H9.5L4.5 20V6.5A2.5 2.5 0 0 1 7 4h10.5A2.5 2.5 0 0 1 20 6.5v7z"/><path d="M8.5 9h7M8.5 12.2h4.5"/>'),
    };
  })();
  window.PM_ICONS = PM_ICONS;

  /* ---- Title-bar notifications (port of notify-protos/01) ----
     window.toast(msg) string → ephemeral stage fade (no archive).
     toast.important / toast.push / options object → durable stack.
     Status-bar bell retired; badge unread lives on the stack. */
  (function () {
    var ACTION_LABELS = {
      approve: 'Approve', decline: 'Decline', open_details: 'Details', explain: 'Explain',
      retry_safe: 'Retry from safe point', fresh_attempt: 'Start fresh attempt',
      open_orch: 'Open Orchestrator', deny: 'Deny', once: 'Once', for_session: 'For Session',
      always: 'Always', filesafe_once: 'Approve once', filesafe_add: 'Approve & add',
      cancel: 'Cancel', acknowledge: 'Acknowledge', dismiss: 'Dismiss', resolve: 'Resolve',
      open_usage: 'Open Usage', resume_wizard: 'Resume Wizard', view_report: 'View report',
      continue_assistant: 'Continue in Assistant', open: 'Open'
    };
    var eid = 0;
    function uid() { return 'n' + (++eid) + '-' + Date.now().toString(36); }
    function actionLabel(id) { return ACTION_LABELS[id] || id; }
    function reduced() {
      try {
        var root = document.documentElement;
        return (root && root.getAttribute('data-motion') === 'reduced') ||
          (document.body && document.body.getAttribute('data-reduced') === '1') ||
          (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
      } catch (e) { return false; }
    }
    function ms(n) { return reduced() ? 10 : n; }

    var PEEK = 18, MAX_STACK = 4, MAX_ITEMS = 12;
    var items = [];
    var expanded = false;
    var explainOpen = {};
    var patternEdit = {};
    var ttlTimers = {};
    var stackTimers = [];
    var clearingAll = false;
    var stackDirty = false;
    var booted = false;

    var stackEl, clipEl, badgeEl, stageEl, panelEl, listEl, headLabel;

    function sevClass(s) { return 'n-sev-' + (s || 'info'); }
    function clearStackTimers() {
      stackTimers.forEach(function (t) { clearTimeout(t); });
      stackTimers = [];
    }

    function navigate(route, opts) {
      opts = opts || {};
      if (!route) return;
      var page = route.page;
      if (page && window.PM_PAGES && typeof window.PM_PAGES.go === 'function') {
        try { window.PM_PAGES.go(page, route.subTab || null); } catch (e0) {}
      }
      if (route.focus) {
        var focusEl = document.querySelector('[data-focus="' + route.focus + '"]');
        if (!focusEl && route.focus === 'chat') {
          focusEl = document.querySelector('.chat-page, #chatPage, [data-page="chat"]') ||
            document.querySelector('.composer, .chat-composer');
        }
        if (focusEl) {
          focusEl.classList.add('focus-ring');
          var t = setTimeout(function () { focusEl.classList.remove('focus-ring'); }, ms(1600));
          stackTimers.push(t);
        }
      }
      if (!opts.keepOpen) setExpanded(false);
    }

    function scheduleStack() {
      if (stackDirty) return;
      stackDirty = true;
      requestAnimationFrame(function () {
        stackDirty = false;
        renderStackNow();
      });
    }

    function renderStackNow() {
      if (!stackEl) return;
      var n = items.length;
      stackEl.classList.toggle('empty', n === 0);
      if (badgeEl) {
        badgeEl.textContent = n > 99 ? '99+' : String(n);
        badgeEl.classList.toggle('on', n > 0);
      }
      if (headLabel) headLabel.textContent = n ? ('Inbox · ' + n) : 'Inbox';
      if (!clipEl) return;
      clipEl.innerHTML = '';
      var visible = items.slice(0, MAX_STACK);
      var hovering = stackEl.matches(':hover') && n > 0 && !expanded;
      visible.forEach(function (it, i) {
        var card = document.createElement('div');
        card.className = 'rs-card n-card ' + sevClass(it.severity);
        card.style.zIndex = String(10 - i);
        var scale = 1 - i * 0.055;
        var x = i * PEEK;
        var y = hovering ? i * 2 : i * 1;
        if (hovering) x = i * (PEEK + 4);
        /* Front card at rest: no transform — translate3d/scale promotes a
           soft GPU layer under glass backdrop-filter until user interaction. */
        if (i === 0 && x === 0 && y === 0 && scale === 1) {
          card.style.transform = 'none';
        } else {
          card.style.transform = 'translate(' + x + 'px,' + y + 'px) scale(' + scale + ')';
        }
        card.style.opacity = String(1 - i * 0.16);
        card.innerHTML =
          '<span class="n-sev-dot" aria-hidden="true"></span>' +
          '<span class="n-title"></span>' +
          '<button type="button" class="n-x" aria-label="Dismiss">×</button>';
        card.querySelector('.n-title').textContent = it.title;
        card.querySelector('.n-x').addEventListener('click', function (e) {
          e.stopPropagation();
          dismiss(it.id);
        });
        clipEl.appendChild(card);
      });
    }

    function jiggle() {
      if (!stackEl || reduced()) return;
      stackEl.classList.remove('jiggle');
      void stackEl.offsetWidth;
      stackEl.classList.add('jiggle');
      var t = setTimeout(function () {
        stackEl.classList.remove('jiggle');
        stackEl.style.transform = 'none';
        /* Force a clean paint so glyphs aren't stuck soft after the anim layer */
        void stackEl.offsetWidth;
        scheduleStack();
      }, 450);
      stackTimers.push(t);
    }

    function primaryAction(id) {
      return id === 'approve' || id === 'filesafe_once' || id === 'filesafe_add' ||
        id === 'for_session' || id === 'always' || id === 'once' || id === 'resolve' ||
        id === 'open_usage' || id === 'resume_wizard' || id === 'retry_safe' || id === 'open_orch';
    }
    function dangerAction(id) {
      return id === 'deny' || id === 'decline' || id === 'cancel' || id === 'dismiss';
    }
    function navigates(id) {
      return id === 'open_details' || id === 'open' || id === 'open_usage' ||
        id === 'open_orch' || id === 'resume_wizard' || id === 'view_report' ||
        id === 'continue_assistant';
    }

    /* the inbox's sprout (open, close, height spring) is PM6_SPROUT's, the one menu sprout (base/script/pm7-sprout.js).
       PMConcept7 replaces this engine's stack and inbox with src/js/19-notify.js, which removes #rsStack and #rsPanel
       before this boot runs, so none of it binds there. */
    function portalIsOpen() {
      return !!panelEl && window.PM6_SPROUT.isOpen(panelEl);
    }

    function portalAnimateHeight(mutateFn) {
      window.PM6_SPROUT.resize(panelEl, mutateFn);
    }

    function fillPanelContent() {
      if (!panelEl || !listEl) return;
      panelEl.classList.toggle('is-empty', items.length === 0);
      listEl.innerHTML = '';
      if (!items.length) {
        var empty = document.createElement('div');
        empty.className = 'rs-empty-msg';
        empty.textContent = 'No notifications';
        listEl.appendChild(empty);
        if (headLabel) headLabel.textContent = 'Inbox';
        return;
      }
      if (headLabel) headLabel.textContent = 'Inbox · ' + items.length;
      items.forEach(function (it, i) {
        var row = document.createElement('div');
        row.className = 'rs-item n-card kind-' + (it.kind || 'advisory') + ' ' + sevClass(it.severity);
        row.style.setProperty('--d', (i * 35) + 'ms');
        row.setAttribute('data-id', it.id);
        var top = document.createElement('div');
        top.className = 'rs-item-top';
        top.innerHTML =
          '<span class="n-sev-dot" aria-hidden="true"></span>' +
          '<div class="meta">' +
            '<div class="kind-tag"></div>' +
            '<div class="t"></div>' +
            '<div class="b"></div>' +
          '</div>' +
          '<button type="button" class="n-x" aria-label="Dismiss">×</button>';
        top.querySelector('.kind-tag').textContent = it.kind || 'advisory';
        top.querySelector('.t').textContent = it.title;
        top.querySelector('.b').textContent = it.body || '';
        top.querySelector('.n-x').addEventListener('click', function (e) {
          e.stopPropagation();
          dismiss(it.id);
        });
        row.appendChild(top);
        if (it.ttlMs) {
          var ttl = document.createElement('div');
          ttl.className = 'n-ttl';
          ttl.setAttribute('data-ttl', it.id);
          ttl.textContent = 'TTL ' + Math.ceil(remainingTtl(it) / 1000) + 's';
          row.appendChild(ttl);
        }
        if (it.allowed_action_ids && it.allowed_action_ids.length) {
          var actions = document.createElement('div');
          actions.className = 'n-actions';
          it.allowed_action_ids.forEach(function (aid) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'n-btn' +
              (primaryAction(aid) ? ' primary' : '') +
              (dangerAction(aid) ? ' danger' : '') +
              (!primaryAction(aid) && !dangerAction(aid) ? ' ghost' : '');
            btn.textContent = actionLabel(aid);
            btn.addEventListener('click', function (e) {
              e.stopPropagation();
              runAction(it, aid, row);
            });
            actions.appendChild(btn);
          });
          row.appendChild(actions);
        }
        if (explainOpen[it.id] && it.explain) {
          var ex = document.createElement('div');
          ex.className = 'n-explain';
          ex.textContent = it.explain;
          row.appendChild(ex);
        }
        if (patternEdit[it.id] && it.patternSuggest) {
          var pat = document.createElement('div');
          pat.className = 'n-pattern';
          pat.innerHTML = '<label>Pattern</label><input type="text" />';
          pat.querySelector('input').value = it.patternSuggest;
          pat.addEventListener('click', function (e) { e.stopPropagation(); });
          row.appendChild(pat);
        }
        if (it.needsRationale && row.querySelector('.n-actions')) {
          var rat = document.createElement('textarea');
          rat.className = 'n-rationale';
          rat.placeholder = it.rationalePlaceholder || 'Required rationale…';
          rat.addEventListener('click', function (e) { e.stopPropagation(); });
          row.insertBefore(rat, row.querySelector('.n-actions'));
        }
        row.addEventListener('click', function (e) {
          if (e.target.closest && (e.target.closest('.n-x') || e.target.closest('.n-btn') ||
              e.target.closest('.n-rationale') || e.target.closest('.n-pattern'))) return;
          if (it.routePayload) navigate(it.routePayload);
        });
        listEl.appendChild(row);
      });
    }

    function renderPanel(opts) {
      opts = opts || {};
      if (opts.animateHeight && portalIsOpen() && !reduced()) {
        portalAnimateHeight(fillPanelContent);
      } else {
        fillPanelContent();
      }
    }

    function remainingTtl(it) {
      if (!it.ttlMs || !it.createdAt) return 0;
      return Math.max(0, it.ttlMs - (Date.now() - it.createdAt));
    }

    function tickTtls() {
      items.forEach(function (it) {
        if (!it.ttlMs) return;
        var el = listEl && listEl.querySelector('[data-ttl="' + it.id + '"]');
        var left = remainingTtl(it);
        if (el) el.textContent = 'TTL ' + Math.ceil(left / 1000) + 's';
        if (left <= 0) dismiss(it.id);
      });
    }

    function runAction(it, aid, row) {
      if (it.needsRationale && (aid === 'dismiss' || aid === 'resolve' || aid === 'acknowledge')) {
        var rat = row.querySelector('.n-rationale');
        if (!rat || !rat.value.trim()) {
          if (rat) {
            rat.focus();
            rat.style.outlineColor = 'var(--accent-error)';
          }
          return;
        }
      }
      if (aid === 'explain') {
        explainOpen[it.id] = !explainOpen[it.id];
        renderPanel({ animateHeight: true });
        return;
      }
      if (aid === 'always') {
        patternEdit[it.id] = true;
        renderPanel({ animateHeight: true });
        return;
      }
      if (aid === 'decline') {
        dismiss(it.id);
        pushMsg({
          id: uid(), title: 'Declined — node blocked', body: 'Parked at safe point. Choose a recovery action.',
          severity: 'error', important: true, kind: 'hitl',
          allowed_action_ids: ['retry_safe', 'fresh_attempt', 'open_orch'],
          routePayload: it.routePayload || { page: 'orchestrator' },
          createdAt: Date.now()
        }, { skipStage: false });
        return;
      }
      if (navigates(aid) && it.routePayload) {
        navigate(it.routePayload);
      } else if (aid === 'open_usage') {
        navigate({ page: 'usage', label: 'Usage' });
      } else if (aid === 'open_orch' || aid === 'retry_safe' || aid === 'fresh_attempt') {
        navigate(it.routePayload || { page: 'orchestrator', label: 'Orchestrator' });
      } else if (aid === 'resume_wizard' || aid === 'view_report') {
        navigate(it.routePayload || { page: 'planning', label: 'Planning' });
      }
      if (aid !== 'explain' && aid !== 'always') {
        if (aid !== 'open_details' && aid !== 'open' && aid !== 'open_usage' &&
            aid !== 'open_orch' && aid !== 'view_report') {
          dismiss(it.id);
        }
      }
    }

    function setExpanded(on) {
      if (!panelEl) return;
      if (on) {
        expanded = true;
        window.PM6_SPROUT.open(panelEl);
        panelEl.style.height = '';
        panelEl.style.overflow = '';
        renderPanel({ animateHeight: false });
        return;
      }
      if (!expanded && !panelEl.classList.contains('is-open')) return;
      expanded = false;
      window.PM6_SPROUT.close(panelEl);
    }

    function dismiss(id) {
      items = items.filter(function (x) { return x.id !== id; });
      delete explainOpen[id];
      delete patternEdit[id];
      if (ttlTimers[id]) { clearTimeout(ttlTimers[id]); delete ttlTimers[id]; }
      scheduleStack();
      if (expanded) renderPanel({ animateHeight: true });
    }

    function wipeNotifyStore() {
      Object.keys(ttlTimers).forEach(function (k) { clearTimeout(ttlTimers[k]); });
      ttlTimers = {};
      items = [];
      explainOpen = {};
      patternEdit = {};
    }

    function clearAll() {
      if (clearingAll) return;
      if (!portalIsOpen() || reduced()) {
        wipeNotifyStore();
        scheduleStack();
        setExpanded(false);
        return;
      }
      clearingAll = true;
      var rows = listEl.querySelectorAll('.rs-item');
      var n = rows.length;
      rows.forEach(function (row, i) {
        row.style.setProperty('--leave-d', ((n - 1 - i) * 55) + 'ms');
        row.classList.add('is-leaving');
      });
      var leaveMs = 420;
      var staggerTotal = n > 0 ? (n - 1) * 55 : 0;
      var t = setTimeout(function () {
        wipeNotifyStore();
        scheduleStack();
        setExpanded(false);
        var t2 = setTimeout(function () { clearingAll = false; }, 280);
        stackTimers.push(t2);
      }, staggerTotal + leaveMs + 100);
      stackTimers.push(t);
    }

    function stageToast(msg, then) {
      if (!stageEl) { then(msg.important ? 'join' : 'fade'); return; }
      var card = document.createElement('div');
      card.className = 'rs-card n-card ' + sevClass(msg.severity);
      card.innerHTML =
        '<div class="n-row">' +
          '<span class="n-sev-dot" aria-hidden="true"></span>' +
          '<span class="n-title"></span>' +
          '<button type="button" class="n-x" aria-label="Dismiss">×</button>' +
        '</div><div class="n-body"></div>';
      card.querySelector('.n-title').textContent = msg.title;
      card.querySelector('.n-body').textContent = msg.body || '';
      stageEl.appendChild(card);
      var done = false;
      function finish(action) {
        if (done) return;
        done = true;
        then(action, card);
      }
      card.querySelector('.n-x').addEventListener('click', function (e) {
        e.stopPropagation();
        card.classList.add('leaving');
        setTimeout(function () { card.remove(); finish('dismiss'); }, ms(220));
      });
      var ttl = msg.important ? 850 : 2100;
      setTimeout(function () {
        if (done) return;
        if (msg.important) {
          card.classList.add('joining');
          setTimeout(function () { card.remove(); finish('join'); }, ms(380));
        } else {
          card.classList.add('leaving');
          setTimeout(function () { card.remove(); finish('fade'); }, ms(220));
        }
      }, ms(ttl));
    }

    function normalizeMsg(input, forceImportant) {
      if (input && typeof input === 'object') {
        var o = input;
        return {
          id: o.id || uid(),
          title: o.title || String(o.msg || o.text || 'Notification'),
          body: o.body || o.meta || '',
          severity: o.severity || (o.warn ? 'warn' : 'info'),
          important: forceImportant != null ? !!forceImportant : (o.important !== false),
          kind: o.kind || 'advisory',
          blocked_reason_code: o.blocked_reason_code || null,
          allowed_action_ids: o.allowed_action_ids || (o.page ? ['open', 'acknowledge'] : ['acknowledge']),
          needsRationale: !!o.needsRationale,
          rationalePlaceholder: o.rationalePlaceholder || 'Required rationale…',
          explain: o.explain || null,
          ttlMs: o.ttlMs || null,
          routePayload: o.routePayload || (o.page ? { page: o.page, subTab: o.subTab || null } : null),
          patternSuggest: o.patternSuggest || null,
          createdAt: o.createdAt || Date.now()
        };
      }
      var text = String(input == null ? '' : input);
      var parts = text.split(' - ');
      var title = parts[0] || text;
      var body = parts.length > 1 ? parts.slice(1).join(' - ') : '';
      if (title.length > 48) { body = title; title = 'Notice'; }
      return {
        id: uid(),
        title: title,
        body: body,
        severity: 'info',
        important: !!forceImportant,
        kind: forceImportant ? 'advisory' : 'ephemeral',
        allowed_action_ids: forceImportant ? ['acknowledge'] : [],
        createdAt: Date.now()
      };
    }

    function pushMsg(msg, opts) {
      opts = opts || {};
      function join() {
        items.unshift(msg);
        if (items.length > MAX_ITEMS) items.length = MAX_ITEMS;
        scheduleStack();
        jiggle();
        if (expanded) renderPanel({ animateHeight: true });
        if (msg.ttlMs) {
          ttlTimers[msg.id] = setTimeout(function () { dismiss(msg.id); }, msg.ttlMs);
        }
      }
      if (opts.skipStage) { join(); return; }
      stageToast(msg, function (action) {
        if (action === 'join') join();
      });
    }

    function toastApi(msg, opts) {
      opts = opts || {};
      try {
        if (!booted) boot();
        var important = !!(opts.important || opts.durable || (msg && typeof msg === 'object' && msg.important));
        if (typeof msg === 'string' && !opts.important && !opts.durable) {
          pushMsg(normalizeMsg(msg, false), {});
          return;
        }
        if (typeof msg === 'string' && important) {
          pushMsg(normalizeMsg(msg, true), {});
          return;
        }
        pushMsg(normalizeMsg(msg, important || undefined), opts);
      } catch (e) {
        try { console.log('[toast]', msg); } catch (e1) {}
      }
    }
    toastApi.important = function (msg, opts) {
      opts = opts || {};
      opts.important = true;
      toastApi(msg, opts);
    };
    toastApi.push = function (msg, opts) { toastApi(msg, opts || {}); };
    toastApi.clear = clearAll;
    toastApi.expand = function () { setExpanded(true); };
    toastApi.collapse = function () { setExpanded(false); };

    function boot() {
      if (booted) return;
      stackEl = document.getElementById('rsStack');
      clipEl = document.getElementById('rsClip');
      badgeEl = document.getElementById('rsBadge');
      stageEl = document.getElementById('rsStage');
      panelEl = document.getElementById('rsPanel');
      listEl = document.getElementById('rsList');
      headLabel = document.getElementById('rsHeadLabel');
      if (!stackEl || !panelEl) {
        /* Host not ready — keep API, console fallback until DOM exists */
        return;
      }
      booted = true;
      stackEl.addEventListener('mouseenter', function () { if (items.length) scheduleStack(); });
      stackEl.addEventListener('mouseleave', function () { scheduleStack(); });
      stackEl.addEventListener('click', function () {
        if (portalIsOpen()) setExpanded(false);
        else setExpanded(true);
      });
      stackEl.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (portalIsOpen()) setExpanded(false);
          else setExpanded(true);
        }
      });
      document.addEventListener('click', function (e) {
        if (!portalIsOpen()) return;
        if (e.target.closest && (e.target.closest('#rsPanel') || e.target.closest('#rsStack') || e.target.closest('#notifySlot'))) return;
        setExpanded(false);
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && portalIsOpen()) setExpanded(false);
      });
      var clearBtn = document.getElementById('rsClear');
      if (clearBtn) clearBtn.addEventListener('click', function (e) { e.stopPropagation(); clearAll(); });
      setInterval(tickTtls, 1000);
      scheduleStack();
    }

    window.toast = toastApi;
    window.PM_TITLEBAR_NOTIFY = {
      boot: boot,
      push: pushMsg,
      clearAll: clearAll,
      dismiss: dismiss
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', boot);
    } else {
      boot();
    }
  })();


  /* ---- PM_PAGES: page switching extracted from the legacy .page-tab handler
     (js-terminal-demo). Mirrors its behaviors exactly: .active toggling on tabs
     and .primary-content > .page roots, plus aria-selected on every tab. No
     breadcrumb exists in the legacy handler. Sub-tab routing is pluggable via
     registerSubtab(pageId, fn); without a registration we fall back to clicking
     a [data-tab="<subTab>"] control inside the target page root. ---- */
  window.PM_PAGES = {
    _subtabs: {},
    current: null,
    registerSubtab: function (pageId, fn) { this._subtabs[pageId] = fn; },
    go: function (pageId, subTab) {
      if (!pageId) return;
      try {
        document.querySelectorAll('.page-tab').forEach(function (t) {
          var on = t.getAttribute('data-page') === pageId;
          t.classList.toggle('active', on);
          t.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        document.querySelectorAll('.primary-content > .page').forEach(function (p) {
          p.classList.toggle('active', p.classList.contains('page-' + pageId));
        });
      } catch (e) { try { console.error('[PM_PAGES.go]', e); } catch (e0) {} }
      this.current = pageId;
      if (subTab) {
        var fn = this._subtabs[pageId];
        if (fn) {
          try { fn(subTab); } catch (e1) { try { console.error('[PM_PAGES subtab]', e1); } catch (e2) {} }
        } else {
          try {
            var root = document.querySelector('.primary-content > .page.page-' + pageId);
            var ctl = root && root.querySelector('[data-tab="' + subTab + '"]');
            if (ctl && ctl.click) ctl.click();
          } catch (e3) {}
        }
      }
      try {
        if (window.PM_DEMO && window.PM_DEMO.emit) window.PM_DEMO.emit('page.changed', { page: pageId, subTab: subTab || null });
      } catch (e4) {}
    }
  };

  /* ---- Shared spring + glass liquid ink (page tabs, segtabs, Usage nav) ---- */
  window.PM6_LIQUID_INK = (function () {
    var SPRING = { stiffness: 500, damping: 35 };
    var LIQUID_V_REF = 280;
    var LIQUID_DIST_REF = 70;
    var LIQUID_STRETCH_MAX = 0.20;
    var LIQUID_JIGGLE_MS = 300;
    var LIQUID_JIGGLE_AMP = 0.08;
    var LIQUID_BLEND_MS = 70;
    var LIQUID_MIN_TRAVEL = 28;

    function reduced() {
      try {
        if (document.documentElement.getAttribute('data-motion') === 'reduced') return true;
        return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
      } catch (e) { return false; }
    }
    function isGlassTheme() {
      var t = document.documentElement.getAttribute('data-theme') || '';
      return t.indexOf('glass') === 0;
    }
    function smoothstep(t) {
      t = Math.max(0, Math.min(1, t));
      return t * t * (3 - 2 * t);
    }

    /* opts: { strip, ink, getActive, axis: 'h'|'v' }
       axis h = horizontal pill (left/width); v = vertical (top/height). */
    function attach(opts) {
      var strip = opts.strip, ink = opts.ink, getActive = opts.getActive;
      var axis = opts.axis === 'v' ? 'v' : 'h';
      if (!strip || !ink || typeof getActive !== 'function') return null;
      var inkShown = true;   /* O55 (B1): drawn? read after layout, at load and on each look change; hidden, it snaps */
      var readShown = function () { var was = inkShown; try { inkShown = getComputedStyle(ink).opacity !== '0'; } catch (eI) { inkShown = true; }
        if (inkShown && !was) { var at = getActive(); if (at) snap(at); } };   /* shown again: on the active item exactly */
      var shownSoon = function () { if (!ink.isConnected) return; if (typeof window.PM_AFTER_LAYOUT === 'function') window.PM_AFTER_LAYOUT(readShown); else requestAnimationFrame(readShown); };
      shownSoon();
      /* one observer for every attached ink (a segment strip made again attaches again): an ink no longer in the page
         is dropped from it at the next look change, so nothing keeps its closure alive (landing review SH8-1) */
      var shownReg = attach._o55Shown || (attach._o55Shown = { list: [], mo: null });
      shownReg.list.push({ ink: ink, soon: shownSoon });
      if (!shownReg.mo) try {
        shownReg.mo = new MutationObserver(function () { shownReg.list = shownReg.list.filter(function (r) { return r.ink.isConnected; }); for (var si = 0; si < shownReg.list.length; si++) shownReg.list[si].soon(); });
        shownReg.mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-lg', 'data-o55-nier'] });
      } catch (eM) {}
      var pos = {
        a: null, s: null, va: 0, vs: 0, raf: 0,
        jiggleT: 0, blendT: 0, lastStretch: 0,
        hopArmed: false, travelOrigin: null, lead: 1, _ta: 0, _ts: 0
      };

      function metrics(el) {
        /* getBoundingClientRect so nested Usage “More” rooms still measure
           against the ink strip, not a nested offsetParent. */
        var sr = strip.getBoundingClientRect();
        var er = el.getBoundingClientRect();
        if (axis === 'v') {
          return {
            a: er.top - sr.top + strip.scrollTop,
            s: er.height,
            cross: er.width,
            crossOff: er.left - sr.left + strip.scrollLeft
          };
        }
        return {
          a: er.left - sr.left + strip.scrollLeft,
          s: er.width,
          cross: er.height,
          crossOff: er.top - sr.top + strip.scrollTop
        };
      }
      function paint(m, paintS, paintA, sx, sy) {
        if (axis === 'v') {
          ink.style.width = m.cross + 'px';
          ink.style.height = paintS + 'px';
          if (sx !== 1 || sy !== 1) {
            ink.style.transform = 'translate3d(' + m.crossOff + 'px,' + paintA + 'px,0) scale(' +
              sx.toFixed(4) + ',' + sy.toFixed(4) + ')';
          } else {
            ink.style.transform = 'translate3d(' + m.crossOff + 'px,' + paintA + 'px,0)';
          }
        } else {
          ink.style.width = paintS + 'px';
          ink.style.height = m.cross + 'px';
          if (sx !== 1 || sy !== 1) {
            ink.style.transform = 'translate3d(' + paintA + 'px,' + m.crossOff + 'px,0) scale(' +
              sx.toFixed(4) + ',' + sy.toFixed(4) + ')';
          } else {
            ink.style.transform = 'translate3d(' + paintA + 'px,' + m.crossOff + 'px,0)';
          }
        }
      }
      function liquidScales(mode) {
        var stretch = 0, sx = 1, sy = 1;
        if (!isGlassTheme() || reduced()) return { stretch: 0, sx: 1, sy: 1 };
        if (mode === 'fly') {
          var av = Math.abs(pos.va);
          var dist = Math.abs(pos._ta - pos.a);
          var fromVel = smoothstep(Math.min(1, av / LIQUID_V_REF)) * LIQUID_STRETCH_MAX;
          var fromDist = smoothstep(Math.min(1, dist / LIQUID_DIST_REF)) * LIQUID_STRETCH_MAX * 0.85;
          stretch = Math.max(fromVel, fromDist);
          if (av > 0.5) pos.lead = pos.va >= 0 ? 1 : -1;
          sx = 1 + stretch * 0.55;
          sy = 1 - stretch * 0.28;
          pos.lastStretch = stretch;
        } else if (mode === 'jiggle' && pos.jiggleT > 0) {
          var u = 1 - (pos.jiggleT / LIQUID_JIGGLE_MS);
          var env = Math.exp(-3.6 * u);
          var wave = Math.sin(u * Math.PI * 2);
          var crown = LIQUID_JIGGLE_AMP * env * wave;
          sx = 1 + crown * 0.7;
          sy = 1 - crown * 0.85;
        } else if (mode === 'blend' && pos.blendT > 0) {
          var bu = 1 - (pos.blendT / LIQUID_BLEND_MS);
          var be = smoothstep(bu);
          stretch = (pos.lastStretch || 0) * (1 - be);
          sx = 1 + stretch * 0.55;
          sy = 1 - stretch * 0.28;
          if (pos.jiggleT > 0) {
            var ju = 1 - (pos.jiggleT / LIQUID_JIGGLE_MS);
            var jenv = Math.exp(-3.6 * ju);
            var jwave = Math.sin(ju * Math.PI * 2);
            var jp = LIQUID_JIGGLE_AMP * jenv * jwave * be;
            sx += jp * 0.7;
            sy -= jp * 0.85;
          }
        }
        return { stretch: stretch, sx: sx, sy: sy };
      }
      function snap(el) {
        if (!el) { ink.style.width = '0px'; ink.style.height = '0px'; return; }
        cancelAnimationFrame(pos.raf);
        pos.va = 0; pos.vs = 0;
        pos.jiggleT = 0; pos.blendT = 0; pos.lastStretch = 0;
        pos.hopArmed = false; pos.travelOrigin = null;
        var m = metrics(el);
        pos.a = m.a; pos.s = m.s;
        paint(m, pos.s, pos.a, 1, 1);
      }
      function springTo(el) {
        if (!el) return;
        if (pos.a === null || reduced() || !inkShown) { snap(el); return; }   /* O55 (B1): a hidden ink is placed at once */
        cancelAnimationFrame(pos.raf);
        var m0 = metrics(el);
        var ta = m0.a, ts = m0.s;
        pos._ta = ta; pos._ts = ts;
        pos.travelOrigin = pos.a;
        pos.travelAccum = 0;
        pos.hopArmed = false;
        pos.jiggleT = 0;
        pos.blendT = 0;
        var last = performance.now();
        function step(now) {
          var dt = Math.min((now - last) / 1000, 1 / 30);
          last = now;
          var m = metrics(el);
          ta = m.a; ts = m.s; pos._ta = ta; pos._ts = ts;
          for (var i = 0; i < 2; i++) {
            var h = dt / 2;
            pos.va += (-SPRING.stiffness * (pos.a - ta) - SPRING.damping * pos.va) * h;
            pos.vs += (-SPRING.stiffness * (pos.s - ts) - SPRING.damping * pos.vs) * h;
            pos.a += pos.va * h;
            pos.s += pos.vs * h;
          }
          var glassLiquid = isGlassTheme() && !reduced();
          if (glassLiquid) {
            pos.travelAccum = Math.max(pos.travelAccum || 0, Math.abs(ta - (pos.travelOrigin != null ? pos.travelOrigin : pos.a)));
            if (pos.travelAccum >= LIQUID_MIN_TRAVEL) pos.hopArmed = true;
          }
          var nearRest = Math.abs(pos.a - ta) < 2.5 && Math.abs(pos.va) < 40 &&
                         Math.abs(pos.s - ts) < 2.5 && Math.abs(pos.vs) < 40;
          var done = Math.abs(pos.va) < 0.5 && Math.abs(pos.vs) < 0.5 &&
                     Math.abs(pos.a - ta) < 0.25 && Math.abs(pos.s - ts) < 0.25;
          if (done) { pos.a = ta; pos.s = ts; pos.va = 0; pos.vs = 0; }
          if (glassLiquid && nearRest && pos.jiggleT <= 0 && pos.blendT <= 0 && pos.hopArmed) {
            pos.blendT = LIQUID_BLEND_MS;
            pos.jiggleT = LIQUID_JIGGLE_MS;
            pos.hopArmed = false;
          }
          if (pos.blendT > 0) pos.blendT = Math.max(0, pos.blendT - dt * 1000);
          if (pos.jiggleT > 0) {
            pos.jiggleT = Math.max(0, pos.jiggleT - dt * 1000);
            if (pos.jiggleT <= 0) pos.lastStretch = 0;
          }
          var liq = { stretch: 0, sx: 1, sy: 1 };
          if (glassLiquid) {
            if (pos.blendT > 0) liq = liquidScales('blend');
            else if (!done && !nearRest) liq = liquidScales('fly');
            else if (pos.jiggleT > 0) liq = liquidScales('jiggle');
            else if (!done) liq = liquidScales('fly');
          }
          var paintS = pos.s, paintA = pos.a;
          if (liq.stretch > 0.001) {
            var inflate = pos.s * liq.stretch * 0.7;
            paintS = pos.s + inflate;
            paintA = pos.a - inflate * 0.5;
          }
          paint(m, paintS, paintA, liq.sx, liq.sy);
          if (!done || pos.jiggleT > 0 || pos.blendT > 0) pos.raf = requestAnimationFrame(step);
        }
        pos.raf = requestAnimationFrame(step);
      }
      function resync(animate) {
        var el = getActive();
        if (!el) { snap(null); return; }
        if (animate && pos.a !== null && !reduced()) springTo(el);
        else snap(el);
      }
      return { snap: snap, springTo: springTo, resync: resync, getActive: getActive };
    }
    return { attach: attach, reduced: reduced, isGlassTheme: isGlassTheme };
  })();
  try {
    if (window.PM7_USAGE && typeof window.PM7_USAGE.syncNavInk === 'function') {
      window.PM7_USAGE.syncNavInk(false);
    }
  } catch (eNavInk) {}

  /* ---- PM8 smooth page tabs: sliding selector ink + directional page
     transitions, reproducing motion.dev/examples/react-smooth-tabs.
     Indicator: one shared .page-tab-ink pill springing between tabs
     (stiffness 500 / damping 35, the example's indicatorSpring).
     Content: ±50px directional crossfade — 150ms exit under a 300ms
     enter, no blank gap, no full-page blur (see the CSS block).
     Wraps PM_PAGES.go so
     every navigation path (top tabs, keyboard, activity bar, demo
     engine, settings) animates identically; the .active toggling and
     page.changed emit semantics inside go() are untouched — the ink
     and panel animations are pure visual overlays added afterwards.
     Reduced motion (data-motion="reduced" or OS preference) snaps. ---- */
  (function () {
    var strip = document.querySelector('.title-bar .page-tabs');
    var ink = strip && strip.querySelector('.page-tab-ink');
    var inkShown = true;   /* O55 (B1): drawn? read after layout, at load and on each look change */
    function readInkShown() { var was = inkShown; try { inkShown = !!ink && getComputedStyle(ink).opacity !== '0'; } catch (eI) { inkShown = true; }
      if (inkShown && !was) { var at = strip.querySelector('.page-tab.active'); if (at) snap(at); } }   /* shown again: on the tab exactly */
    function inkSoon() { if (typeof window.PM_AFTER_LAYOUT === 'function') window.PM_AFTER_LAYOUT(readInkShown); else requestAnimationFrame(readInkShown); }
    if (ink) { inkSoon(); try { new MutationObserver(inkSoon).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-lg', 'data-o55-nier'] }); } catch (eM) {} }
    if (!strip || !ink || !window.PM_PAGES || !window.PM_PAGES.go) return;

    var SPRING = { stiffness: 500, damping: 35 };
    /* Glass-only liquid extras (same portable model as editor-tab jiggle). */
    var LIQUID_V_REF = 280;
    var LIQUID_DIST_REF = 70;
    var LIQUID_STRETCH_MAX = 0.20;
    var LIQUID_JIGGLE_MS = 300;
    var LIQUID_JIGGLE_AMP = 0.08;
    var LIQUID_BLEND_MS = 70;
    var LIQUID_MIN_TRAVEL = 28;
    var pos = {
      x: null, w: null, vx: 0, vw: 0, raf: 0,
      jiggleT: 0, blendT: 0, lastStretch: 0,
      hopArmed: false, travelOriginX: null, lead: 1
    };
    /* Skip panel crossfades until after first paint — a boot-time go()
       (or current=null → first nav) fading from opacity 0 reads as a
       white flash over the still-settling canvas. */
    var bootPaintDone = false;
    try {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { bootPaintDone = true; });
      });
    } catch (e0) { bootPaintDone = true; }

    function reduced() {
      try {
        if (document.documentElement.getAttribute('data-motion') === 'reduced') return true;
        return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
      } catch (e) { return false; }
    }
    function isGlassTheme() {
      var t = document.documentElement.getAttribute('data-theme') || '';
      return t.indexOf('glass') === 0;
    }
    function smoothstep(t) {
      t = Math.max(0, Math.min(1, t));
      return t * t * (3 - 2 * t);
    }
    function tabFor(pageId) {
      return strip.querySelector('.page-tab[data-page="' + pageId + '"]');
    }
    function tabIndex(pageId) {
      var tabs = strip.querySelectorAll('.page-tab[data-page]');
      for (var i = 0; i < tabs.length; i++) {
        if (tabs[i].getAttribute('data-page') === pageId) return i;
      }
      return -1;
    }
    var pageTabMetrics = new WeakMap();
    function readTabMetrics(tab) {
      return { x: tab.offsetLeft, w: tab.offsetWidth, top: tab.offsetTop, h: tab.offsetHeight };
    }
    function cacheTabMetrics() {
      var tabs = Array.prototype.slice.call(strip.querySelectorAll('.page-tab[data-page]'));
      var rows = tabs.map(function(tab) { return { tab: tab, metrics: readTabMetrics(tab) }; });
      rows.forEach(function(row) { pageTabMetrics.set(row.tab, row.metrics); });
    }
    function measureTab(tab) {
      return pageTabMetrics.get(tab) || readTabMetrics(tab);
    }
    function paintInk(tab, paintW, paintX, sx, sy, metrics) {
      var geometry = metrics || measureTab(tab);
      var top = geometry.top;
      ink.style.width = paintW + 'px';
      ink.style.height = geometry.h + 'px';
      if (sx !== 1 || sy !== 1) {
        ink.style.transform =
          'translate3d(' + paintX + 'px,' + top + 'px,0) scale(' +
          sx.toFixed(4) + ',' + sy.toFixed(4) + ')';
      } else {
        ink.style.transform = 'translate3d(' + paintX + 'px,' + top + 'px,0)';
      }
    }
    function liquidScales(mode) {
      var stretch = 0, crown = 0, sx = 1, sy = 1;
      if (!isGlassTheme() || reduced()) return { stretch: 0, sx: 1, sy: 1 };
      if (mode === 'fly') {
        var avx = Math.abs(pos.vx);
        var dist = Math.abs(pos._tx - pos.x);
        var fromVel = smoothstep(Math.min(1, avx / LIQUID_V_REF)) * LIQUID_STRETCH_MAX;
        var fromDist = smoothstep(Math.min(1, dist / LIQUID_DIST_REF)) * LIQUID_STRETCH_MAX * 0.85;
        stretch = Math.max(fromVel, fromDist);
        if (avx > 0.5) pos.lead = pos.vx >= 0 ? 1 : -1;
        else if (dist > 0.5) pos.lead = (pos._tx - pos.x) >= 0 ? 1 : -1;
        sx = 1 + stretch * 0.55;
        sy = 1 - stretch * 0.28;
        pos.lastStretch = stretch;
      } else if (mode === 'jiggle' && pos.jiggleT > 0) {
        var u = 1 - (pos.jiggleT / LIQUID_JIGGLE_MS);
        var env = Math.exp(-3.6 * u);
        var wave = Math.sin(u * Math.PI * 2);
        crown = LIQUID_JIGGLE_AMP * env * wave;
        sx = 1 + crown * 0.7;
        sy = 1 - crown * 0.85;
      } else if (mode === 'blend' && pos.blendT > 0) {
        var bu = 1 - (pos.blendT / LIQUID_BLEND_MS);
        var be = smoothstep(bu);
        stretch = (pos.lastStretch || 0) * (1 - be);
        sx = 1 + stretch * 0.55;
        sy = 1 - stretch * 0.28;
        if (pos.jiggleT > 0) {
          var ju = 1 - (pos.jiggleT / LIQUID_JIGGLE_MS);
          var jenv = Math.exp(-3.6 * ju);
          var jwave = Math.sin(ju * Math.PI * 2);
          var jp = LIQUID_JIGGLE_AMP * jenv * jwave * be;
          sx += jp * 0.7;
          sy -= jp * 0.85;
        }
      }
      return { stretch: stretch, sx: sx, sy: sy };
    }
    function snap(tab, metrics) {
      var geometry = metrics || measureTab(tab);
      cancelAnimationFrame(pos.raf);
      pos.vx = 0; pos.vw = 0;
      pos.jiggleT = 0; pos.blendT = 0; pos.lastStretch = 0;
      pos.hopArmed = false; pos.travelOriginX = null;
      pos.x = geometry.x; pos.w = geometry.w;
      paintInk(tab, pos.w, pos.x, 1, 1, geometry);
    }
    function springTo(tab, metrics) {
      var geometry = metrics || measureTab(tab), tx = geometry.x, tw = geometry.w;
      ink.style.height = geometry.h + 'px';
      if (pos.x === null || reduced() || !inkShown) { snap(tab, geometry); return; }   /* O55 (B1): a hidden ink is placed at once */
      cancelAnimationFrame(pos.raf);
      pos._tx = tx; pos._tw = tw;
      pos.travelOriginX = pos.x;
      pos.travelAccum = 0;
      pos.hopArmed = false;
      pos.jiggleT = 0;
      pos.blendT = 0;
      var last = performance.now();
      function step(now) {
        var dt = Math.min((now - last) / 1000, 1 / 30);
        last = now;
        for (var s = 0; s < 2; s++) {
          var h = dt / 2;
          pos.vx += (-SPRING.stiffness * (pos.x - tx) - SPRING.damping * pos.vx) * h;
          pos.vw += (-SPRING.stiffness * (pos.w - tw) - SPRING.damping * pos.vw) * h;
          pos.x += pos.vx * h;
          pos.w += pos.vw * h;
        }
        var glassLiquid = isGlassTheme() && !reduced();
        if (glassLiquid) {
          pos.travelAccum = Math.max(pos.travelAccum || 0, Math.abs(tx - (pos.travelOriginX != null ? pos.travelOriginX : pos.x)));
          if (pos.travelAccum >= LIQUID_MIN_TRAVEL) pos.hopArmed = true;
        }
        var nearRest = Math.abs(pos.x - tx) < 2.5 && Math.abs(pos.vx) < 40 &&
                       Math.abs(pos.w - tw) < 2.5 && Math.abs(pos.vw) < 40;
        var done = Math.abs(pos.vx) < 0.5 && Math.abs(pos.vw) < 0.5 &&
                   Math.abs(pos.x - tx) < 0.25 && Math.abs(pos.w - tw) < 0.25;
        if (done) {
          pos.x = tx; pos.w = tw; pos.vx = 0; pos.vw = 0;
        }
        if (glassLiquid && nearRest && pos.jiggleT <= 0 && pos.blendT <= 0 && pos.hopArmed) {
          pos.blendT = LIQUID_BLEND_MS;
          pos.jiggleT = LIQUID_JIGGLE_MS;
          pos.hopArmed = false;
        }
        if (pos.blendT > 0) pos.blendT = Math.max(0, pos.blendT - dt * 1000);
        if (pos.jiggleT > 0) {
          pos.jiggleT = Math.max(0, pos.jiggleT - dt * 1000);
          if (pos.jiggleT <= 0) pos.lastStretch = 0;
        }
        var liq = { stretch: 0, sx: 1, sy: 1 };
        if (glassLiquid) {
          if (pos.blendT > 0) liq = liquidScales('blend');
          else if (!done && !nearRest) liq = liquidScales('fly');
          else if (pos.jiggleT > 0) liq = liquidScales('jiggle');
          else if (!done) liq = liquidScales('fly');
        }
        var paintW = pos.w;
        var paintX = pos.x;
        if (liq.stretch > 0.001) {
          var inflate = pos.w * liq.stretch * 0.7;
          paintW = pos.w + inflate;
          paintX = pos.x - inflate * 0.5;
        }
        paintInk(tab, paintW, paintX, liq.sx, liq.sy, geometry);
        if (!done || pos.jiggleT > 0 || pos.blendT > 0) {
          pos.raf = requestAnimationFrame(step);
        }
      }
      pos.raf = requestAnimationFrame(step);
    }
    function panelFor(pageId) {
      return document.querySelector('.primary-content > .page.page-' + pageId);
    }
    var pageRects = new WeakMap();
    function readPanelRect(panel) {
      var host = panel.parentElement;
      var hr = host.getBoundingClientRect();
      var r = panel.getBoundingClientRect();
      return { top: r.top - hr.top, left: r.left - hr.left, width: r.width, height: r.height };
    }
    function cachePanelRect(panel) {
      if (!panel || !panel.classList.contains('active')) return null;
      var rect = readPanelRect(panel); pageRects.set(panel, rect); return rect;
    }
    function cacheActiveRect() { return cachePanelRect(panelFor(window.PM_PAGES.current)); }
    function measureActive(panel) { return pageRects.get(panel) || cachePanelRect(panel); }
    function clearPageAnimation(panel) {
      if (!panel) return;
      var cleanup = panel.__pm8PageCleanup;
      if (typeof cleanup === 'function') cleanup();
      panel.classList.remove('pm8-page-in', 'pm8-page-out');
      panel.style.top = panel.style.left = panel.style.width = panel.style.height = '';
    }
    function animatePages(oldP, newP, dir, rect) {
      var restarting = oldP.classList.contains('pm8-page-in') || oldP.classList.contains('pm8-page-out') ||
        newP.classList.contains('pm8-page-in') || newP.classList.contains('pm8-page-out');
      if (restarting) {
        clearPageAnimation(oldP); clearPageAnimation(newP);
        document.documentElement.removeAttribute('data-pm-page-transition');
        requestAnimationFrame(function () { cachePanelRect(newP); cacheTabMetrics(); });
        return;
      }
      document.documentElement.setAttribute('data-pm-page-transition', 'running');
      oldP.style.top = rect.top + 'px';
      oldP.style.left = rect.left + 'px';
      oldP.style.width = rect.width + 'px';
      oldP.style.height = rect.height + 'px';
      oldP.style.setProperty('--pm-dir', String(dir));
      newP.style.setProperty('--pm-dir', String(dir));
      oldP.classList.add('pm8-page-out');
      newP.classList.add('pm8-page-in');
      var pageMoves = function () {   /* O55: the moves play on frames that are shown (src/js/11-motion-start.js) */
        var out = [];
        [oldP, newP].forEach(function (p) { p.getAnimations().forEach(function (a) { if (a.animationName === 'pm8-page-in' || a.animationName === 'pm8-page-out') out.push(a); }); });
        return out;
      };
      /* O55: the click's fade (goSoon) keeps running, on the compositor, through this change's long frame; the
         exit takes over from the opacity it has reached in the frame the moves start */
      var lift = window.PM_PAGES.__lift; window.PM_PAGES.__lift = null;
      var handoff = function () {
        if (!lift || lift.el !== oldP || !oldP.classList.contains('pm8-page-out')) { if (lift) try { lift.anim.cancel(); } catch (e) {} return; }   /* a change made over it has cleaned up */
        try {
          /* still pending here, it reads as its start while the compositor has been running it since its first frame */
          var a = lift.anim, ran = document.timeline.currentTime - lift.at;
          if ((a.pending || !(a.currentTime > 0)) && ran > 0) a.currentTime = Math.min(ran, a.__pmLiftMs || 140);
          oldP.style.setProperty('--pm8-out-from', getComputedStyle(oldP).opacity); a.cancel();
        } catch (e) {}
      };
      /* O55: an arriving page still drawing its content in slices says so (data-pm-entrance-wait): the moves stay held
         until it is drawn (1.5 s from the click at most), the click's fade still going meanwhile (F6 Usage entry freeze) */
      var stillDrawing = function () { return newP.hasAttribute('data-pm-entrance-wait'); };
      /* 1.5 s from the click's frame (goSoon's, every look: NieR and Reduce Animations make no fade), inside its fade */
      var waitFrom = window.PM_PAGES.__clickAt; window.PM_PAGES.__clickAt = null;
      /* the hold, for the other moves of this change that should start with the page's (NieR's page wipe) */
      window.PM_PAGES.__entrance = { el: newP, wait: stillDrawing, waitCap: 1500, waitFrom: waitFrom };
      if (window.PM_START_ON_SHOWN) window.PM_START_ON_SHOWN(pageMoves, { release: handoff, wait: stillDrawing, waitCap: 1500, waitFrom: waitFrom }); else handoff();
      var stopEntrance = null, finished = false;
      function cleanupOut() {
        oldP.classList.remove('pm8-page-out');
        oldP.style.removeProperty('--pm8-out-from');   /* O55: the answered fade's start is this exit's only */
        oldP.classList.remove('pm-page-layer');   /* O55: its layer for the answer (src/js/13-page-layer.js) */
        oldP.style.top = oldP.style.left = oldP.style.width = oldP.style.height = '';
        if (oldP.__pm8PageCleanup === cleanupOut) oldP.__pm8PageCleanup = null;
      }
      function cleanupIn() {
        if (finished) return;
        finished = true;
        if (stopEntrance) stopEntrance();
        newP.classList.remove('pm8-page-in');
        if (newP.__pm8PageCleanup === cleanupIn) newP.__pm8PageCleanup = null;
        cleanupOut();
        document.documentElement.removeAttribute('data-pm-page-transition');
        requestAnimationFrame(function () { cachePanelRect(newP); cacheTabMetrics(); });
      }
      oldP.__pm8PageCleanup = cleanupOut; newP.__pm8PageCleanup = cleanupIn;
      /* Keep the existing 80 ms post-end hold: Settings still enters for
         340 ms while the faded outgoing subtree stays inert. */
      stopEntrance = window.PM7_MOTION_FINISH(newP, 'animation', 'pm8-page-in', cleanupIn, 80);
    }
    /* O55 (motion QA A1, A2): a page that arrives at once shows its end state on its first frame */
    function finishEntrances(panel) {
      if (!panel || !panel.classList.contains('active') || !panel.getAnimations) return;
      panel.getAnimations({ subtree: true }).forEach(function (a) {
        try { var t = a.effect && a.effect.getComputedTiming(); if (t && isFinite(t.endTime) && a.playState !== 'finished') a.finish(); } catch (e) {}
      });
    }
    var origGo = window.PM_PAGES.go;
    window.PM_PAGES.go = function (pageId, subTab) {
      var prev = window.PM_PAGES.current;
      var changed = !!(prev && prev !== pageId);
      var oldP = changed ? panelFor(prev) : null;
      var newP = changed ? panelFor(pageId) : null;
      var rect = null;
      if (changed && bootPaintDone && !reduced() && !window.PM_PAGES.instant && oldP && newP && oldP !== newP) {   /* O55: instant under a cover */
        rect = measureActive(oldP);
      }
      var tab = tabFor(pageId);
      var tabMetrics = tab ? measureTab(tab) : null;
      var whole = changed && newP && oldP !== newP && (reduced() || window.PM_PAGES.instant) && /^(wizard|orchestrator)$/.test(pageId);   /* O55 */
      origGo.call(window.PM_PAGES, pageId, subTab);
      if (whole) requestAnimationFrame(function () { finishEntrances(newP); });
      if (tab && window.PM_PAGES.__answered !== pageId) (changed ? springTo : snap)(tab, tabMetrics);   /* O55: the answer already started it */
      window.PM_PAGES.__answered = null;
      if (!rect) { requestAnimationFrame(cacheActiveRect); return; }
      animatePages(oldP, newP, tabIndex(pageId) >= tabIndex(prev) ? 1 : -1, rect);
    };

    /* O55: the answer on the click's own frame (see ANSWER_FIRST in tools/shell_motion.py) */
    var soon = null;
    window.PM_PAGES.goSoon = function (pageId) {
      var P = window.PM_PAGES, prev = P.current;
      if (soon) { soon.page = pageId; }
      else if (!pageId || pageId === prev || !bootPaintDone || document.hidden || !panelFor(pageId)) { P.go(pageId); return; }
      var tab = tabFor(pageId), oldP = prev ? panelFor(prev) : null;
      document.querySelectorAll('.page-tab').forEach(function (t) { var on = t.getAttribute('data-page') === pageId; t.classList.toggle('active', on); t.setAttribute('aria-selected', on ? 'true' : 'false'); });
      if (tab) { springTo(tab, measureTab(tab)); P.__answered = pageId; }
      if (soon) return;
      var html = document.documentElement, nier = html.getAttribute('data-o55-nier') === 'on', retro = /^retro/.test(html.getAttribute('data-theme') || '');
      /* NieR answers with its wipe and the ink; the other looks start the leaving page's fade (Retro in 70 ms steps,
         two to 0.86). The fade keeps going while the change's long frames run (0.86 at 140 ms, then on to
         0.72 by 740 ms, on the compositor), so a wait for the arriving page (the P1000's Settings entry: Home sat at
         0.86 to ~583 ms) reads as the page leaving; the exit takes over from wherever it has reached. It goes on, slower,
         to 0.6 by 1.6 s, past the longest an arriving page may hold its entrance while it draws (data-pm-entrance-wait:
         1.5 s from this frame), so a long hold never stands on a still frame; it passes 0.72 at about the speed it goes on
         at (0.15 a second), with no stop there. Retro keeps its 70 ms step through the same segments */
      var LIFT_MS = 1600;
      var lift = !nier && !reduced() && oldP && oldP.animate && !oldP.classList.contains('pm8-page-out') ? oldP.animate(retro
        ? [{ opacity: 1, easing: 'steps(2, end)' }, { opacity: 0.86, offset: 140 / 1600, easing: 'steps(8, end)' }, { opacity: 0.72, offset: 740 / 1600, easing: 'steps(12, end)' }, { opacity: 0.6 }]
        : [{ opacity: 1, easing: 'cubic-bezier(.2, 0, 0, 1)' }, { opacity: 0.86, offset: 140 / 1600, easing: 'cubic-bezier(.3, 0, .45, .65)' }, { opacity: 0.72, offset: 740 / 1600, easing: 'cubic-bezier(.3, .32, .5, 1)' }, { opacity: 0.6 }],
        { duration: LIFT_MS, easing: 'linear', fill: 'forwards' }) : null;
      if (lift) lift.__pmLiftMs = LIFT_MS;
      soon = { page: pageId };
      requestAnimationFrame(function (shown) { setTimeout(function () {
        var to = soon.page; soon = null;
        /* the fade is not read here: a move begun a frame ago still reads as its start on this thread */
        P.__lift = lift ? { el: oldP, anim: lift, at: shown } : null;
        P.__clickAt = shown;   /* the entrance wait's cap counts from here (PAGES) */
        if (P.__answered !== to) P.__answered = null;
        P.go(to);
        if (P.__lift) { try { P.__lift.anim.cancel(); } catch (e) {} P.__lift = null; }   /* no exit took it over */
        P.__clickAt = null; P.__entrance = null;
      }, 0); });
    };
    function resync() {
      cacheTabMetrics();
      cacheActiveRect();
      var tab = strip.querySelector('.page-tab.active') || tabFor(window.PM_PAGES.current);
      if (!tab) tab = strip.querySelector('.page-tab[data-page]');
      if (tab) snap(tab);
    }
    /* T36: the responsive title-bar density owner needs one visual-only
       resync after an overflow-only page becomes the visible active tab. */
    window.PM7_PAGE_TAB_INK = { resync: resync };
    var resyncFrame = 0;
    function resyncNextFrame() {
      if (resyncFrame) return;
      if (typeof window.PM_AFTER_LAYOUT === 'function') { resyncFrame = 1; window.PM_AFTER_LAYOUT(function () { resyncFrame = 0; resync(); }); return; }   /* O55: after layout (B5) */
      resyncFrame = requestAnimationFrame(function () { resyncFrame = 0; resync(); });
    }
    try {
      new MutationObserver(resyncNextFrame).observe(document.documentElement, {
        attributes: true, attributeFilter: ['data-theme', 'data-motion']
      });
    } catch (e) {}
    window.addEventListener('resize', resync);
    try {
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(resync);
    } catch (e) {}

    var first = strip.querySelector('.page-tab.active') || strip.querySelector('.page-tab[data-page]');
    if (first) {
      cacheTabMetrics();
      snap(first);
      /* Seed current from the markup-active tab so the first real navigation
         is not treated as prev=null (and so boot go('dashboard') is a no-op). */
      try {
        var seed = first.getAttribute('data-page');
        if (seed && !window.PM_PAGES.current) window.PM_PAGES.current = seed;
      } catch (e1) {}
      requestAnimationFrame(cacheActiveRect);
    }
  })();


  /* ---- PM7 T10: page-gate for snapshot-idempotent bus subscribers. While
     the page is inactive the latest payload is retained and replayed once
     when page.changed activates the page (PM_PAGES.go toggles the .active
     class BEFORE it emits page.changed, so the flush already sees an active
     page). Event-semantic handlers (toasts, CTA raises, appends) must NOT
     be wrapped. ---- */
  window.pm7PageGate = function (pageId, handler) {
    var pending = false, lastP = null, lastT = null;
    function isActive() {
      var el = document.querySelector('.primary-content > .page.page-' + pageId);
      return !!(el && el.classList.contains('active'));
    }
    try {
      if (window.PM_DEMO && window.PM_DEMO.on) {
        window.PM_DEMO.on('page.changed', function (pp) {
          if (!pp || pp.page !== pageId || !pending) return;
          pending = false;
          var p = lastP, t = lastT;
          lastP = null; lastT = null;
          handler(p, t);
        });
      }
    } catch (e) {}
    return function (p, t) {
      if (isActive()) { pending = false; handler(p, t); return; }
      pending = true; lastP = p; lastT = t;
    };
  };

  /* ---- PM_DEMO guard-shim: replaced wholesale by pm6-js-demo-engine, which is
     assembled immediately after this block. Deliberately tiny; it does NOT
     attach a [data-demo-action] click router (the engine owns the single
     delegated router). ---- */
  if (!window.PM_DEMO) {
    var listeners = {};
    window.PM_DEMO = {
      _shim: true,
      state: { clock: { t: 0, playing: false, speed: 1 }, wizard: { topics: {} }, run: { nodes: {}, lanes: [], gates: {}, history: [] },
               chat: { threads: {}, queue: [], busy: false, context: { used: 42000, max: 128000 } },
               git: {}, docker: {}, usage: {}, files: { openTabs: [] } },
      log: [],
      on: function (topic, fn) { (listeners[topic] = listeners[topic] || []).push(fn); return this; },
      emit: function (topic, payload) {
        (listeners[topic] || []).concat(listeners['*'] || []).forEach(function (fn) {
          try { fn(payload, topic); } catch (e) { console.error('[PM_DEMO shim]', topic, e); }
        });
      },
      actions: {
        _reg: {},
        register: function (id, fn) { this._reg[id] = fn; },
        get: function (id) { return this._reg[id]; }
      },
      guard: {
        attempt: function (actionId, ctx) {
          var fn = window.PM_DEMO.actions._reg[actionId];
          if (fn) { try { return fn(ctx) || { ok: true }; } catch (e) { console.error(e); return { toast: 'Something hiccuped — try again.' }; } }
          return { toast: 'Demo engine is still loading — try that again in a second.' };
        },
        reason: function (code) { return 'Unavailable: ' + (code || 'demo_scope'); }
      },
      stream: {
        start: function (sink, text) {
          try {
            var s = typeof text === 'string' ? text : (text || []).join(' ');
            if (sink && sink.nodeType === 1) sink.textContent = s;
            else if (typeof sink === 'function') sink(s, { done: true });
          } catch (e) {}
          return { cancel: function () {}, finish: function () {} };
        }
      },
      director: { ensure: function () {}, release: function () {} },
      dev: {}
    };
  }

  /* Shared pointermove dispatcher (F3-446). PMH (src/js/18-hover.js) owns hover. */
  (function () {
    window.PM7_PMOVE = window.PM7_PMOVE || [];
    document.addEventListener('pointermove', function (e) {
      var hooks = window.PM7_PMOVE;
      for (var i = 0; i < hooks.length; i++) { try { hooks[i](e); } catch (err) {} }
    });
  })();

  /* Scroll-idle scrollbar reveal: thumbs show while scrolling / hover, fade
     ~2s after the last scroll event. Auto-hide is now universal (css-tokens
     applies it to the whole opt-in list), so this no longer carries a copy of
     that list: a scroll event's target IS the scroller that moved, so arming
     e.target is both exact and list-free. Arming a pane that never opted in
     is inert — the reveal rules only bite where a bar has a nonzero width —
     so the whole cost of the open arming is one timer per live scroller. */
  (function initScrollIdleBars() {
    var IDLE_MS = 2000;
    var timers = new WeakMap();
    function arm(el) {
      el.classList.add('pm6-sb-active');
      var prev = timers.get(el);
      if (prev) clearTimeout(prev);
      timers.set(el, setTimeout(function () {
        el.classList.remove('pm6-sb-active');
        timers.delete(el);
      }, IDLE_MS));
    }
    function onScroll(e) {
      var t = e.target;
      /* document-level scrolls target the document node itself */
      if (t === document) t = document.scrollingElement || document.documentElement;
      if (t && t.nodeType === 1 && t.classList) arm(t);
    }
    document.addEventListener('scroll', onScroll, true);
  })();

  /* ---- PM_EDGE: soft scroll-edge dissolve (Task 4). Content that is
     about to scroll out of a panel viewport edge dissolves into a
     low-contrast haze instead of hard-clipping: a four-layer CSS mask
     (part 10x EDGE DISSOLVE section) ramps opacity on the scroller
     itself via .pm-edge-t/-b/-l/-r classes, and .pm-edge-band
     backdrop-filter siblings add a progressive defocus ramp on the
     flagship scrollers. One passive capture scroll listener
     covers every enrolled scroller (~60); all work is rAF-coalesced
     with a strict read-then-write split (scroll metrics in one pass,
     class writes in another — no per-scroller listeners, no timers).
     Unknown scrollers (JS-built terminal panes, chat streams,
     popouts) are discovered on their first scroll event via
     closest(). Masks and bands are scroll-position driven — nothing
     here animates — so they stay under reduced motion by design (no
     transitions, no kill switch needed). ---- */
  (function () {
    var THRESH = 2;
    /* Band depth. Briefly 44 while chasing a "too faint" complaint that was
       actually about the scroll-under, not this; back to 30. Feeds four
       layoutBands geometry writes — all four scale off this one constant. */
    var BAND = 30;
    /* Terminal surfaces are deliberately NOT enrolled (.terminal-output,
       .terminal-pane-body, .terminal-tabstrip, .pm-editor-term-stack,
       .pm-term-center-wrap): a terminal is a console, and a dissolving
       edge on console text reads as corrupted output, not as depth. Do
       not re-add them. The mirrored :is() enrolment list in part 10x
       (EDGE DISSOLVE) must stay in sync with the three lists below.
       Note .pm6-bottom-* ARE enrolled — those are the bottom debug/output
       panes, not the terminal. */
    var CONFIG = {
      /* vertical scrollers: the part-02 opt-in scroll-pane list
         (minus the bothAxes members below) */
      vertical: '.primary-content, .page-projects, .panel-content, .message-stream, .messageStream, .chat-thread-list, .file-tree, .s4-shell, .s4-stage, .s4-panel-body, .s4-psm-body, .s4-rail, .pm6-usage-wrap [class*="scroll"], .dashboard-grid, .bento-card, .chat-dropdown-list, textarea, .browser-permissions-panel, .browser-console-pane, .browser-network-pane, .browser-evidence-pane, .wizard-step-panel, .wizard-annotation-drawer, .wizard-activity-log, .pm6-wiz-intake-scroll, .pm6-wiz-topic-list, .pm6-wiz-thread-body, .pm6-wiz-doc, .orch-tab-content, .orch-evidence-detail-body, .orch-rungraph-canvas, .orch-rungraph-table-wrap, .orch-rungraph-detail-body, .pm6-orch-w-body, .pm6-orch-pc-feed, .pm6-orch-pc-sidecol, .pm6-orch-seams, .pm6-orch-inspector-body, .pm6-orch-evlist, .pm6-orch-history, .interview-sidebar, .interview-messages, .pm-debug-cell, .pm6-dash-scroll, .pm6-dash-catalog-panel, .pm6-proj-sheet, .pm6-sp-content, .pm6-bottom-empty, .context-detail-pane, .cdp-raw-view, .wt-test-output, .sa-work-stream, .sc-accordion-body, .sh-scroll',
      /* DELIBERATE DIVERGENCE from the CSS :is() mirror: .sh-scroll is enrolled
         HERE (so it gets edge classes and Stage-B bands) but is deliberately
         ABSENT from the mask list in pm6-css-global. A mask-image makes its
         element a containing block for position:fixed descendants, and the
         file-manager context menu (.fm-ctx, position:fixed z-index:300) lives
         inside .sh-scroll — masking the scroller re-parented it and its
         "Open with"/"Copy path" submenus got clipped by overflow-x:hidden.
         Same hazard the panel chain already avoids by keeping overflow:visible
         so sprout menus can escape. The band is an absolutely-positioned
         SIBLING, so it carries the frost without touching containing blocks.
         If you ever add .sh-scroll to the mask list, re-test that menu. */
      /* horizontal-only strips: the six tabstrips + chip/message rails
         (the terminal tabstrip is excluded — see the note above) */
      horizontalOnly: '.page-tabs, .orch-tabs, .editor-tabs, .sc-subview-tabs, .cdp-tab-bar, .dashboard-tabs, .msg-body, .sh-wtchips, .debug-thread-header, .sa-crew-board, .sa-crew-msg, .pm6-route-tree',
      /* .editor-code is deliberately absent: its frost comes from the
         .editor-tabs plate it scrolls behind, which is a separate mechanism.
         Enrolling it here additionally dissolved and blurred the LEFT, RIGHT
         and BOTTOM edges of the code pane, which is not wanted. */
      bothAxes: '.pm6-bottom-scroll, .pm6-bottom-pre, .browser-viewport, .pm6-orch-ledger-wrap, .pm6-usage-tblwrap',
      /* sticky chrome pinned at the top of these scrollers must stay
         sharp: never dissolve their top edge (sticky theads). Chat
         streams are skipped too: the frosted scroll-under chat header
         (Task 5) now owns their top transition.
         The tail of the list is the rest of the Task 5 frosted headers —
         same rule, one entry per scroller that now runs behind a plate.
         .page-projects is the one whose chrome is position:sticky INSIDE
         the scroller rather than a sibling above it: there the skip is
         load-bearing, not cosmetic, because a sticky row parked at a masked
         edge fades with the mask.
         Turning a bandTargets top OFF is NOT enough on its own: that drops
         the Stage-B blur but leaves the Stage-A MASK still dissolving the
         edge, which under a plate reads as a faded-but-unblurred sliver.
         Any scroller with a plate above it belongs in BOTH places. */
      skipTop: '.pm6-usage-tblwrap, .pm6-orch-ledger-wrap, .message-stream, .messageStream, ' +
               '.orch-tab-content, .pm6-orch-w-body, .pm6-usage-scroll, ' +
               '.s4-panel-body, .s4-psm-body, ' +
               '.chat-thread-list, .page-projects, ' +
               '.pm6-wiz-doc, .pm6-wiz-topic-list, .sh-scroll, .browser-viewport, ' +
               /* the four sites frosted before this list existed: same
                  contract, they were simply never enrolled */
               '.pm6-dash-scroll, .pm6-orch-pc-feed, .pm6-orch-inspector-body, ' +
               '.pm6-wiz-thread-body',
      /* Stage B defocus bands: flagship scrollers only. Chat-stream top
         bands are skipped on purpose — the frosted scroll-under chat
         header (later wave) owns that edge. The sticky-thead table
         wraps get no bands at all (dissolve-only, top edge skipped). */
      bandTargets: {
        '.message-stream':     { top: false, bottom: true, left: false, right: false },
        '.messageStream':      { top: false, bottom: true, left: false, right: false },
        /* no '.editor-code' entry: it is off the dissolve entirely (see
           bothAxes above). Its frost is the .editor-tabs plate; the four
           bands it used to carry showed up as blur down the sides and along
           the bottom of the code pane. */
        /* no '.terminal-pane-body' entry: the terminal is off the dissolve
           entirely (see the note above CONFIG) — it used to carry the
           heaviest treatment in the app, all four sides banded. */
        /* top band off wherever a frosted header already owns that edge */
        '.pm6-dash-scroll':    { top: false, bottom: true, left: false, right: false },
        '.s4-shell':           { top: true,  bottom: true, left: false, right: false },
        '.pm6-bottom-pre':     { top: true,  bottom: true, left: true,  right: true  },
        '.pm6-bottom-scroll':  { top: true,  bottom: true, left: true,  right: true  },
        '.pm6-orch-pc-feed':   { top: false, bottom: true, left: false, right: false },
        '.file-tree':          { top: true,  bottom: true, left: false, right: false },
        /* top:false on all four — each now has a frosted plate owning its top
           edge (the doc card's sticky ::before, the topic-map column head, the
           rail chrome, the browser toolbar). Leaving the band on stacked a
           SECOND backdrop layer over the same strip and read as a double blur
           in the plan preview. Same contract as the chat streams above. */
        '.pm6-wiz-doc':        { top: false, bottom: true, left: false, right: false },
        /* No '.sh-scroll' entry. Its bottom band was landing IN FLOW at the end
           of the panel's flex column — computed position:relative, not
           absolute — and ate a 30px dead box under .sh-foot that would not
           scroll away. Measured against the pre-rev-8 artifact: gap 0 there,
           30 here, so it was introduced with the band, not inherited. The rail
           does not need it: its frost is the chrome plate above the scroller. */
        '.pm6-wiz-topic-list': { top: false, bottom: true, left: false, right: false },
        '.browser-viewport':   { top: false, bottom: true, left: true,  right: true  },
        /* top band off: the thread sidebar's own frosted .sidebar-title
           (Task 5) owns that edge now, exactly as on the chat streams */
        '.chat-thread-list':   { top: false, bottom: true, left: false, right: false }
      }
    };
    var ALL_SEL = CONFIG.vertical + ', ' + CONFIG.horizontalOnly + ', ' + CONFIG.bothAxes;
    var SIDES = { top: 't', bottom: 'b', left: 'l', right: 'r' };
    var enrolled = new Set();
    var dirty = new Set();
    var rafId = 0, geomDirty = false, geomDeferred = false, ro = null, geometryScope = null, edgeGeometryTimer = 0;

    function isVisible(el) {
      try {
        if (!el || el.hidden || el.closest('[hidden],[aria-hidden="true"]')) return false;
        var page = el.closest('.primary-content > .page');
        return !page || page.classList.contains('active') || page.classList.contains('pm8-page-out');
      } catch (e) { return false; }
    }

    function bandCfg(el) {
      for (var sel in CONFIG.bandTargets) {
        try { if (el.matches(sel)) return CONFIG.bandTargets[sel]; } catch (e) {}
      }
      return null;
    }

    /* O55: a band's scroller geometry, read apart from its writes (B5) */
    function bandGeom(el) {
      var cs = window.getComputedStyle(el);
      return { x: el.offsetLeft + (parseFloat(cs.borderLeftWidth) || 0), y: el.offsetTop + (parseFloat(cs.borderTopWidth) || 0), w: el.clientWidth, h: el.clientHeight };
    }
    function layoutBands(el, st, g) {
      if (!st.bands) return;
      try {
        if (!g) g = bandGeom(el);
        var x = g.x, y = g.y, w = g.w, h = g.h, s;
        /* zero-extent scrollports (an EMPTY workspace dock is an 8px-or-less
           box on a 0px grid track) must not park 30px bands past their
           parent's edge -- those bands were 22px of phantom horizontal
           overflow on the Home grid. Hide all four and bail; the per-element
           ResizeObserver re-runs this the moment the dock gains real size. */
        var dead = (w <= 0 || h <= 0), sideKey;
        for (sideKey in st.bands) {
          if ((s = st.bands[sideKey]) && s.style.display !== (dead ? 'none' : '')) s.style.display = dead ? 'none' : '';
        }
        if (dead) return;
        if ((s = st.bands.top))    { s.style.left = x + 'px'; s.style.top = y + 'px'; s.style.width = w + 'px'; s.style.height = BAND + 'px'; }
        if ((s = st.bands.bottom)) { s.style.left = x + 'px'; s.style.top = (y + h - BAND) + 'px'; s.style.width = w + 'px'; s.style.height = BAND + 'px'; }
        if ((s = st.bands.left))   { s.style.left = x + 'px'; s.style.top = y + 'px'; s.style.width = BAND + 'px'; s.style.height = h + 'px'; }
        if ((s = st.bands.right))  { s.style.left = (x + w - BAND) + 'px'; s.style.top = y + 'px'; s.style.width = BAND + 'px'; s.style.height = h + 'px'; }
      } catch (e) {}
    }

    function buildBands(el, st) {
      var cfg = bandCfg(el);
      if (!cfg || st.bands) return;
      var parent = el.parentElement;
      if (!parent || parent === document.body || parent === document.documentElement) return;
      var pos;
      try { pos = window.getComputedStyle(parent).position; } catch (e) { return; }
      if (pos === 'static') parent.classList.add('pm-edge-pos');
      else if (pos !== 'relative' && pos !== 'absolute' && pos !== 'fixed' && pos !== 'sticky') return;
      var bands = {}, made = false;
      for (var side in SIDES) {
        if (!cfg[side]) continue;
        if (side === 'top' && st.noTop) continue;
        try {
          var d = document.createElement('div');
          d.className = 'pm-edge-band pm-edge-band-' + SIDES[side];
          d.setAttribute('aria-hidden', 'true');
          parent.appendChild(d);
          bands[side] = d;
          made = true;
        } catch (e) {}
      }
      if (made) { st.bands = bands; layoutBands(el, st); }
    }

    function enroll(el) {
      if (!el || el.nodeType !== 1 || enrolled.has(el)) return el;
      try {
        var v = el.matches(CONFIG.vertical + ', ' + CONFIG.bothAxes);
        var h = el.matches(CONFIG.horizontalOnly + ', ' + CONFIG.bothAxes);
        if (!v && !h) return el;
        var st = { v: v, h: h, noTop: false, t: false, b: false, l: false, r: false, bands: null };
        try { st.noTop = el.matches(CONFIG.skipTop); } catch (e) {}
        el.__pmEdge = st;
        enrolled.add(el);
        if (ro) { try { ro.observe(el); } catch (e) {} }
        buildBands(el, st);
        dirty.add(el);
        schedule();
      } catch (e) {}
      return el;
    }

    function pageScope(payload) {
      var page = payload && payload.detail ? payload.detail.page : payload && payload.page;
      if (page) {
        var safe = String(page).replace(/[^a-z0-9_-]/gi, '');
        var exact = document.querySelector('.primary-content > .page.page-' + safe);
        if (exact) return exact;
      }
      return document.querySelector('.primary-content > .page.active') || document.body;
    }

    function seed(scope) {
      try {
        var host = scope && scope.querySelectorAll ? scope : document;
        if (host.nodeType === 1 && host.matches && host.matches(ALL_SEL)) enroll(host);
        var els = host.querySelectorAll(ALL_SEL);
        for (var i = 0; i < els.length; i++) enroll(els[i]);
      } catch (e) {}
    }

    /* O55: the flush runs after the frame's layout; under a look's or the boot's cover it waits, a frame at a time,
       with the dirty scrollers kept (B5) */
    function edgesHeld() {
      var f = window.PM_BUSY, why = '';
      try { why = typeof f === 'function' ? f() : ''; } catch (e) { why = ''; }
      return why === 'reboot' || why === 'calm' || why === 'theme' || why === 'boot' || why === 'nier';
    }
    function flushAfterLayout() {
      if (!document.hidden && edgesHeld()) { rafId = window.requestAnimationFrame(flushAfterLayout); return; }
      if (typeof window.PM_AFTER_LAYOUT === 'function') window.PM_AFTER_LAYOUT(flush); else flush();
    }
    function schedule() {
      if (!rafId) {
        try { rafId = window.requestAnimationFrame(flushAfterLayout); }
        catch (e) { rafId = 0; flush(); }
      }
    }

    function markAll() {
      enrolled.forEach(function (el) { dirty.add(el); });
      schedule();
    }

    function markScope(scope) {
      if (!scope || !scope.contains) { markAll(); return; }
      enrolled.forEach(function (el) {
        if (el === scope || scope.contains(el)) dirty.add(el);
      });
      schedule();
    }

    /* read step: one metrics pass per dirty scroller */
    function readState(el, st) {
      var s = { t: false, b: false, l: false, r: false };
      if (st.v) {
        var top = el.scrollTop;
        s.t = !st.noTop && top > THRESH;
        s.b = el.scrollHeight - top - el.clientHeight > THRESH;
      }
      if (st.h) {
        var left = el.scrollLeft;
        s.l = left > THRESH;
        s.r = el.scrollWidth - left - el.clientWidth > THRESH;
      }
      return s;
    }

    /* write step: classes only, and only when state changed */
    function writeState(el, st, s) {
      var cls = el.classList;
      if (s.t !== st.t) { cls.toggle('pm-edge-t', s.t); st.t = s.t; if (st.bands && st.bands.top) st.bands.top.classList.toggle('pm-edge-band-on', s.t); }
      if (s.b !== st.b) { cls.toggle('pm-edge-b', s.b); st.b = s.b; if (st.bands && st.bands.bottom) st.bands.bottom.classList.toggle('pm-edge-band-on', s.b); }
      if (s.l !== st.l) { cls.toggle('pm-edge-l', s.l); st.l = s.l; if (st.bands && st.bands.left) st.bands.left.classList.toggle('pm-edge-band-on', s.l); }
      if (s.r !== st.r) { cls.toggle('pm-edge-r', s.r); st.r = s.r; if (st.bands && st.bands.right) st.bands.right.classList.toggle('pm-edge-band-on', s.r); }
    }

    /* O55: every visible band's geometry read first, then every band placed (B5) */
    function readVisibleGeometry() {
      var scope = geometryScope || pageScope(), out = [];
      enrolled.forEach(function (el) {
        var st = el.__pmEdge, page = el.closest && el.closest('.primary-content > .page');
        if (page && scope && !scope.contains(el)) return;
        if (st && st.bands && isVisible(el)) { try { out.push({ el: el, st: st, g: bandGeom(el) }); } catch (e) {} }
      });
      return out;
    }
    function relayoutVisible(geom) {
      (geom || readVisibleGeometry()).forEach(function (o) { layoutBands(o.el, o.st, o.g); });
    }

    function flush() {
      rafId = 0;
      try {
        if (document.hidden) { dirty.clear(); geomDirty = false; return; }
        var ops = [];
        dirty.forEach(function (el) {
          try {
            var st = el.__pmEdge;
            if (!st || !isVisible(el)) return;
            ops.push({ el: el, st: st, s: readState(el, st) });
          } catch (e) {}
        });
        /* O55: the bands' geometry is read with the scroll metrics, before any class is written (B5) */
        var geom = null;
        if (geomDirty && !document.body.classList.contains('pm-resizing')) { geomDirty = false; geom = readVisibleGeometry(); }
        for (var i = 0; i < ops.length; i++) {
          try { writeState(ops[i].el, ops[i].st, ops[i].s); } catch (e) {}
        }
        if (geom) relayoutVisible(geom);
        /* Band geometry only. relayoutAll walks every enrolled scroller
           (~60), not just the dirty ones, with a getComputedStyle and four
           layout reads each — far too much for a drag frame. The edge
           CLASSES above are cheap scroll-metric reads and stay live, so the
           dissolve never goes stale mid-drag; the bands catch up on release
           (see the PM_ON_DRAGEND hook in boot). */
        if (geomDirty && document.body.classList.contains('pm-resizing')) {
          geomDirty = false;
          geomDeferred = true;
        }
        if (geomDirty) { geomDirty = false; relayoutVisible(); }
      } finally {
        dirty.clear();
      }
    }

    function onScroll(e) {
      var t = e.target;
      if (!t) return;
      if (t === document || t.nodeType === 9) { markAll(); return; }
      if (t.nodeType !== 1) return;
      var host = enrolled.has(t) ? t : null;
      if (!host && t.closest) {
        try { host = t.closest(ALL_SEL); } catch (e) {}
      }
      if (host) {
        if (!enrolled.has(host)) enroll(host);
        dirty.add(host);
        schedule();
      }
    }

    function onResize() {
      clearTimeout(edgeGeometryTimer);
      geometryScope = pageScope();
      geomDirty = true;
      markAll();
    }

    /* page.changed rides the PM_DEMO bus (emitted by PM_PAGES.go); the
       document-level listener is a fallback in case a DOM event is
       emitted instead */
    function onPageChanged(payload) {
      var scope = pageScope(payload);
      geometryScope = scope;
      clearTimeout(edgeGeometryTimer);
      edgeGeometryTimer = setTimeout(function () {
        if (pageScope() !== scope) return;
        seed(scope); geomDirty = true; markScope(scope);
      }, 420);
    }

    function refresh(scopeOrPayload) {
      try {
        if (scopeOrPayload && scopeOrPayload.nodeType === 1) {
          clearTimeout(edgeGeometryTimer); geometryScope = scopeOrPayload; seed(scopeOrPayload); geomDirty = true; markScope(scopeOrPayload);
        } else onPageChanged(scopeOrPayload);
      } catch (e) {}
    }

    function boot() {
      if (!document.body) return;
      if (typeof ResizeObserver === 'function') {
        ro = new ResizeObserver(function (entries) {
          if (document.documentElement.getAttribute('data-pm-page-transition') === 'running') return;
          try {
            for (var i = 0; i < entries.length; i++) {
              var el = entries[i].target;
              if (!el || !el.__pmEdge) continue;
              dirty.add(el);
            }
          } catch (e) {}
          geomDirty = true;
          schedule();
        });
        enrolled.forEach(function (el) { try { ro.observe(el); } catch (e) {} });
      }
      document.addEventListener('scroll', onScroll, { capture: true, passive: true });
      window.addEventListener('resize', onResize, { passive: true });
      /* markAll as well as geomDirty: a band parked at the pre-drag width
         is a 30px defocus strip sitting in the wrong place, and its on/off
         class was decided against the old client box too. */
      if (window.PM_ON_DRAGEND) window.PM_ON_DRAGEND(function () {
        if (!geomDeferred) return;
        geomDeferred = false; geomDirty = true; markAll();
      });
      try {
        if (window.PM_DEMO && typeof window.PM_DEMO.on === 'function') {
          window.PM_DEMO.on('page.changed', onPageChanged);
        }
      } catch (e) {}
      document.addEventListener('page.changed', onPageChanged);
      var initialScope = pageScope();
      geometryScope = initialScope;
      seed(initialScope);
      markScope(initialScope);
    }

    window.PM_EDGE = { refresh: refresh, enroll: enroll };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
  })();

  /* ---- PM_HWHEEL: a plain vertical mouse wheel scrolls horizontal-only
     strips (.s4-rail on Settings, tab strips, any future one). Without this
     they can only be moved by dragging the scrollbar or with a trackpad's
     horizontal gesture, which a mouse cannot produce.

     Rules that keep it from hijacking normal scrolling:
       - only fires on a vertical wheel (deltaY); native horizontal wheel and
         trackpad swipes pass straight through
       - only on elements that scroll horizontally and NOT vertically, so a
         normal scrollport is never touched
       - releases at either end, so reaching the edge resumes page scrolling
         instead of trapping the wheel
       - ignores ctrl+wheel (browser zoom)
       - suspends scroll snapping only for the length of the gesture, so a
         snapping strip still settles on a card once the wheel stops
     One delegated non-passive listener; nothing per-element to enroll. ---- */
  (function () {
    'use strict';
    var SNAP_IDLE_MS = 220;
    var snapTimers = new WeakMap();
    /* A strip that reserves a horizontal scrollbar loses that much
       clientHeight, which used to read as "this also scrolls vertically" and
       disqualified .s4-rail outright. Measure the bar instead of guessing at
       its thickness (offsetHeight - clientHeight is borders + the horizontal
       bar) and discount it, so the test survives any --pm6-sb-size. */
    function realVOverflow(el, cs) {
      var chrome = el.offsetHeight - el.clientHeight -
        (parseFloat(cs.borderTopWidth) || 0) - (parseFloat(cs.borderBottomWidth) || 0);
      return el.scrollHeight - el.clientHeight - Math.max(0, chrome);
    }
    function hScroller(start) {
      for (var el = start; el && el !== document.body && el.nodeType === 1; el = el.parentElement) {
        var max = el.scrollWidth - el.clientWidth;
        if (max <= 2) continue;
        var cs = getComputedStyle(el);
        if (!/auto|scroll/.test(cs.overflowX)) continue;
        /* a pane that also scrolls vertically keeps the normal wheel behaviour */
        if (realVOverflow(el, cs) > 2 && /auto|scroll/.test(cs.overflowY)) continue;
        return { el: el, max: max };
      }
      return null;
    }
    /* scroll snapping fights a wheel notch: a 100-120px step on a rail with a
       248px card pitch lands inside `x proximity` range and Chromium snaps
       right back, so the strip never moves. Suspend snapping while the wheel
       is turning and restore it once it stops, so the gesture still settles
       on a card. */
    function suspendSnap(el) {
      el.classList.add('pm-hwheel-nosnap');
      var prev = snapTimers.get(el);
      if (prev) clearTimeout(prev);
      snapTimers.set(el, setTimeout(function () {
        el.classList.remove('pm-hwheel-nosnap');
        snapTimers.delete(el);
      }, SNAP_IDLE_MS));
    }
    document.addEventListener('wheel', function (e) {
      if (e.ctrlKey || e.defaultPrevented) return;
      if (!e.deltaY || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      var hit = hScroller(e.target);
      if (!hit) return;
      var step = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;   /* LINE -> px */
      var from = hit.el.scrollLeft;
      var to = Math.max(0, Math.min(hit.max, from + step));
      if (to === from) return;    /* at an end — let the page have the wheel */
      suspendSnap(hit.el);
      hit.el.scrollLeft = to;
      e.preventDefault();
    }, { passive: false });
  })();

  /* ---- PM_FROST: header-height measurement for the frosted scroll-under
     surfaces (Task 5). Every one of those sites lifts its scroller behind a
     frosted header with margin-top: calc(-1 * H) and pads it straight back
     down; H is the header's RENDERED height, which on most of them moves
     with the theme or the content — .orch-header is a 32px bar under retro
     and auto-height everywhere else, .s4-panel-head grows when its
     description wraps, .projects-header-bento wraps its action row at
     narrow widths. A constant would desync the overlap from the plate on
     the first theme switch, so one ResizeObserver per header publishes the
     measured height as a custom property on that site's host element and
     the CSS calc()s do the rest.

     Registry entry: { host, head, v, stack }.
       host  - seed selector AND the element the property is written to
       head  - resolved with host.querySelector, so it is scoped per host
       v     - custom property name
       stack - measure host-top -> head-bottom instead of the head's own
               box, for sites whose chrome is several rows (orchestrator:
               title row + optional banners + tab strip). Rows above the
               head move it without resizing it, so in stack mode every
               preceding sibling is observed too — an un-hiding banner is
               a 0 -> H resize on that banner and re-measures the stack.

     Null-safe and idempotent throughout: a head already wired for a
     property is never observed twice, a host whose head does not exist yet
     (the settings detail modal builds .s4-panel-head on open) gets one
     childList watch that wires it on arrival, and the seed re-runs on
     page.changed off the same PM_DEMO-bus + DOM-event fallback pair PM_EDGE
     uses. A head inside a hidden page measures 0 and is NOT written, so the
     CSS constant holds until the surface is shown — and the observer fires
     on that 0 -> real transition. EVERY property here also has a static
     fallback in CSS: nothing in this module is required for a correct first
     paint, it only keeps the overlap honest afterwards. ---- */
  (function () {
    'use strict';
    var REG = [
      /* orchestrator page chrome, measured twice: the whole stack (retro
         frosts the title row and the tab strip as one plate) and the tab
         strip alone (basic frosts only the strip — see part 08) */
      { host: '.page-orchestrator',         head: '.orch-tabs',                v: '--pm6-orch-chrome-h', stack: true },
      { host: '.page-orchestrator',         head: '.orch-tabs',                v: '--pm6-orch-tabs-h' },
      { host: '.pm6-orch-widget',           head: '.pm6-orch-w-head',          v: '--pm6-orch-whead-h' },
      { host: '.pm6-usage-wrap',            head: '.pm6-usage-head',           v: '--pm6-usage-head-h' },
      { host: '.s4-panel',                  head: '.s4-panel-head',            v: '--pm6-s4-panel-head-h' },
      { host: '.s4-psm',                    head: '.s4-psm-tabs',              v: '--pm6-s4-psm-tabs-h' },
      { host: '.pm6-wiz-doc-overlay-panel', head: '.pm6-wiz-doc-overlay-head', v: '--pm6-wiz-docov-head-h' },
      { host: '.pm6-wiz-topics', head: '.pm6-wiz-col-head', v: '--pm6-wiz-colhead-h' },
      /* the plan preview header owns the frost and publishes the measured
         height used to lift the document behind it. */
      { host: '.pm6-wiz-preview', head: '.pm6-wiz-col-head', v: '--pm6-wiz-previewhead-h' },
      { host: '.chat-thread-sidebar',       head: '.sidebar-title',            v: '--pm6-chat-sidehead-h' },
      { host: '.page-projects',             head: '.projects-header-bento',    v: '--pm6-proj-head-h' },
      /* editor tab bar: themed height (friendly turns these into top-rounded
         folder tabs with their own padding), so measure rather than assume */
      { host: '.editor-pane', head: '.editor-tabs', v: '--pm6-editor-tabs-h' },
      /* dashboard header: the silhouette rail fixes the strip at 36px but the
         header still flexes with density/font themes, so measure it too */
      { host: '.dashboard-view', head: '.dashboard-header', v: '--pm6-dash-head-h' },
      /* All nine rail panels in ONE entry, #panel-files included. gap:true
         measures to whatever chrome actually sits above .sh-scroll, so the
         shape differences stop mattering: one row (run/testing/agents), two
         (search/source/git/docker/artifacts) or five (files, two of them
         conditional). Earlier attempts keyed on the banner alone, which
         dragged the scroller over the tab strips and ate their clicks. */
      { host: '#panel-files, #panel-search, #panel-run, #panel-source, #panel-git,' +
              ' #panel-docker, #panel-artifacts, #panel-testing, #panel-agents',
        head: '.sh-scroll', v: '--pm6-shrun-banner-h', gap: true }
    ];
    if (typeof ResizeObserver !== 'function' || typeof WeakMap !== 'function') return;
    /* head -> { propertyName: true }; one head can back two properties
       (the orchestrator tab strip backs both the stack and its own box) */
    var wired = new WeakMap();
    var waiting = new WeakMap();

    /* Three modes:
         (default)   head's own height
         stack:true  host top -> head bottom (head is the LAST chrome row)
         gap:true    host top -> bottom of the last VISIBLE row before head
                     (head is the SCROLLER itself)
       `gap` is the robust one: it walks back from the scroller to whatever
       chrome actually precedes it, so it does not care how many rows there are
       or which are currently shown. That is what makes #panel-files tractable —
       it stacks five rows and two of them (.fm-selbar, .fm-filter) come and go.
       It measures the row's BOTTOM, never the scroller's top: the scroller
       carries the negative margin this value produces, so measuring it would
       feed back on itself and oscillate. Zero-height rows are skipped because
       a display:none sibling still answers previousElementSibling. */
    function measure(host, head, entry) {
      var h = 0;
      try {
        var top = host.getBoundingClientRect().top;
        if (entry.gap) {
          for (var s = head.previousElementSibling; s; s = s.previousElementSibling) {
            var sr = s.getBoundingClientRect();
            if (sr.height > 0) { h = Math.ceil(sr.bottom - top); break; }
          }
        } else {
          var r = head.getBoundingClientRect();
          h = entry.stack ? Math.ceil(r.bottom - top) : Math.ceil(r.height);
        }
      } catch (e) {}
      if (h > 0) { try { host.style.setProperty(entry.v, h + 'px'); } catch (e2) {} }
    }

    function observe(host, head, entry) {
      var slot = wired.get(head);
      if (!slot) { slot = {}; wired.set(head, slot); }
      if (slot[entry.v]) return;
      slot[entry.v] = true;
      try {
        var ro = new ResizeObserver(function () { measure(host, head, entry); });
        ro.observe(head);
        /* stack and gap both depend on everything ABOVE the head, so a row
           appearing, disappearing or changing height has to re-measure */
        if (entry.stack || entry.gap) {
          for (var s = head.previousElementSibling; s; s = s.previousElementSibling) ro.observe(s);
        }
        return;   /* O55: the observer's first callback measures, after layout */
      } catch (e) {}
      measure(host, head, entry);
    }

    /* JS-built chrome is not there to observe at seed time; one childList
       watch per host costs nothing until that panel fills itself in */
    function waitFor(host, entry) {
      if (typeof MutationObserver !== 'function') return;
      var slot = waiting.get(host);
      if (!slot) { slot = {}; waiting.set(host, slot); }
      if (slot[entry.v]) return;
      try {
        var mo = new MutationObserver(function () {
          var head = host.querySelector(entry.head);
          if (!head) return;
          mo.disconnect();
          slot[entry.v] = false;
          observe(host, head, entry);
        });
        mo.observe(host, { childList: true });
        slot[entry.v] = true;
      } catch (e) {}
    }

    function activePageScope(payload) {
      var page = payload && payload.detail ? payload.detail.page : payload && payload.page;
      if (page) {
        var safe = String(page).replace(/[^a-z0-9_-]/gi, '');
        var exact = document.querySelector('.primary-content > .page.page-' + safe);
        if (exact) return exact;
      }
      return document.querySelector('.primary-content > .page.active') || document.body;
    }

    function wireHost(host, entry) {
      var head = null;
      try { head = host.querySelector(entry.head); } catch (e) {}
      if (head) observe(host, head, entry);
      else waitFor(host, entry);
    }

    function wire(entry, scope) {
      var base = scope && scope.querySelectorAll ? scope : document, hosts = [];
      try {
        if (base.nodeType === 1 && base.matches && base.matches(entry.host)) hosts.push(base);
        var found = base.querySelectorAll(entry.host);
        for (var j = 0; j < found.length; j++) hosts.push(found[j]);
      } catch (e) { return; }
      for (var i = 0; i < hosts.length; i++) wireHost(hosts[i], entry);
    }

    function refresh(payload) {
      var scope = payload && payload.nodeType === 1 ? payload : activePageScope(payload);
      var base = scope && scope.querySelectorAll ? scope : document, selector = REG.map(function(entry) { return entry.host; }).join(','), hosts = [];
      try {
        if (base.nodeType === 1 && base.matches && base.matches(selector)) hosts.push(base);
        var found = base.querySelectorAll(selector);
        for (var i = 0; i < found.length; i++) hosts.push(found[i]);
      } catch (error) {
        for (var fallback = 0; fallback < REG.length; fallback++) { try { wire(REG[fallback], scope); } catch (e) {} }
        return;
      }
      for (var hostIndex = 0; hostIndex < hosts.length; hostIndex++) {
        for (var entryIndex = 0; entryIndex < REG.length; entryIndex++) {
          try { if (hosts[hostIndex].matches(REG[entryIndex].host)) wireHost(hosts[hostIndex], REG[entryIndex]); } catch (e2) {}
        }
      }
    }

    function boot() {
      if (!document.body) return;
      /* page.changed rides the PM_DEMO bus (emitted by PM_PAGES.go); the
         document-level listener is a fallback in case a DOM event is
         emitted instead — same pair PM_EDGE boots with */
      try {
        if (window.PM_DEMO && typeof window.PM_DEMO.on === 'function') {
          window.PM_DEMO.on('page.changed', refresh);
        }
      } catch (e) {}
      document.addEventListener('page.changed', refresh);
      refresh();
    }

    window.PM_FROST = { refresh: refresh };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
  })();
})();
