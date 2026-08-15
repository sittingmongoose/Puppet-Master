/* w1 — Ledger Spine: chronology rail; yields hard at ≤520 (slim / overlay). */
(function () {
  'use strict';

  var ID = 'w1';
  var LABEL = 'Ledger Spine';
  var Kit = function () {
    return window.PMChatWindowKit;
  };



  function dayKey(iso) {
    return iso ? String(iso).slice(0, 10) : '';
  }

  function dayLabel(iso) {
    var k = dayKey(iso);
    if (!k) return 'Undated';
    try {
      var dt = new Date(iso);
      if (!isNaN(dt.getTime())) {
        var today = new Date();
        var yday = new Date();
        yday.setDate(today.getDate() - 1);
        var sameDay = function (a, b) {
          return (
            a.getFullYear() === b.getFullYear() &&
            a.getMonth() === b.getMonth() &&
            a.getDate() === b.getDate()
          );
        };
        if (sameDay(dt, today)) return 'Today';
        if (sameDay(dt, yday)) return 'Yesterday';
        return dt.toLocaleDateString(undefined, {
          weekday: 'short',
          month: 'short',
          day: 'numeric'
        });
      }
    } catch (_) {}
    return k;
  }

  function timeLabel(iso) {
    if (!iso) return '—';
    try {
      var dt = new Date(iso);
      if (!isNaN(dt.getTime())) {
        return dt.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
      }
    } catch (_) {}
    return String(iso).slice(11, 16) || '—';
  }

  function renderSpine(store, kit, opts) {
    opts = opts || {};
    var active = (store && store.session && store.session.activeThreadKey) || '';
    var items = kit.threadEntries(store, 24);
    var lastDay = null;
    var sections = [];
    var nodes = [];
    var slim = Boolean(opts.slim);

    function flushSection() {
      if (!nodes.length && lastDay === null) return;
      sections.push(
        '<section class="w1-day" data-day="' +
          kit.escapeHtml(lastDay || 'undated') +
          '">' +
          '<header class="w1-day-head">' +
          '<span class="w1-day-mark" aria-hidden="true"></span>' +
          '<span class="w1-day-label">' +
          kit.escapeHtml(dayLabel(lastDay ? lastDay + 'T12:00:00' : '')) +
          '</span>' +
          '<span class="w1-day-count">' +
          nodes.length +
          '</span>' +
          '</header>' +
          '<div class="w1-day-nodes pm-stagger">' +
          nodes.join('') +
          '</div>' +
          '</section>'
      );
      nodes = [];
    }

    items.forEach(function (t) {
      var day = dayKey(t.updatedAt) || 'undated';
      if (lastDay !== null && day !== lastDay) flushSection();
      lastDay = day;
      var selected = t.id === active;
      var stateLabel = kit.formatThreadState(t.state);
      var tip =
        (t.title || t.id) +
        (stateLabel ? ' · ' + stateLabel : '') +
        (t.updatedAt ? ' · ' + timeLabel(t.updatedAt) : '');
      var pin = t.pinned
        ? '<span class="w1-node-pin" aria-label="Pinned">' + kit.icon('pin', 'w1-node-pin-ico') + '</span>'
        : '';
      nodes.push(
        '<div class="w1-node-wrap pm-thread-row">' +
        '<button type="button" role="option" class="w1-node' +
          (selected ? ' is-selected' : '') +
          (t.pinned ? ' is-pinned' : '') +
          '" data-thread-id="' +
          kit.escapeHtml(t.id) +
          '" aria-selected="' +
          (selected ? 'true' : 'false') +
          '" title="' +
          kit.escapeHtml(tip) +
          '">' +
          '<span class="w1-node-rail" aria-hidden="true">' +
          '<span class="w1-node-dot"></span>' +
          '</span>' +
          '<span class="w1-node-plate">' +
          '<span class="w1-node-title">' +
          pin +
          kit.escapeHtml(t.title || t.id) +
          '</span>' +
          '<span class="w1-node-time">' +
          kit.escapeHtml(timeLabel(t.updatedAt)) +
          '</span>' +
          '</span>' +
          '</button>' +
          kit.threadRowMetaHtml(t.id, t) +
          '</div>'
      );
    });
    flushSection();

    return (
      '<aside class="w1-spine pm-scroll' +
      (slim ? ' is-slim' : '') +
      '" data-chats-rail role="listbox" aria-label="Chat ledger">' +
      '<div class="w1-spine-mast">' +
      '<div class="w1-spine-mast-row">' +
      '<span class="w1-spine-kicker" title="Ledger">Ledger</span>' +
      kit.historyPinButtonHtml(store, 'w1-spine-expand') +
      '<button type="button" class="w1-spine-expand" data-action="toggle-rail" title="Expand ledger" aria-label="Expand ledger">' +
      kit.icon('chat', 'pm-btn-icon') +
      '</button>' +
      '</div>' +
      '<div class="w1-spine-sub">Chronology</div>' +
      '</div>' +
      '<div class="w1-spine-line" aria-hidden="true"></div>' +
      '<div class="w1-spine-track">' +
      (sections.length
        ? sections.join('')
        : kit.emptyChatsHtml({ title: 'No ledger entries', body: 'Pinned and recent chats appear here.' })) +
      '</div>' +
      '</aside>'
    );
  }

  function renderChrome(store, kit, env) {
    var title = kit.activeTitle(store, LABEL);
    var mountMode = (env && env.mountMode) || 'docked';
    var popLabel = mountMode === 'popout' ? 'Dock' : 'Pop out';
    var popAction = mountMode === 'popout' ? 'dock' : 'popout';
    return (
      '<header class="w1-chrome" data-w1-chrome>' +
      '<div class="w1-chrome-identity">' +
      '<button type="button" class="w1-chrome-iconbtn" data-action="toggle-rail" title="Toggle ledger" aria-label="Toggle ledger">' +
      kit.icon('chat', 'pm-btn-icon') +
      '</button>' +
      kit.bsdSlotHtml('mono') +
      '<div class="w1-chrome-titles">' +
      '<span class="w1-chrome-brand">Ledger Spine</span>' +
      '<span class="w1-chrome-thread" data-thread-title title="' +
      kit.escapeHtml(title) +
      '">' +
      kit.escapeHtml(title) +
      '</span>' +
      '</div>' +
      '<span class="w1-chrome-badge" data-model-badge title="' +
      kit.escapeHtml((env && env.modelLabel) || kit.MODEL) +
      '">' +
      kit.escapeHtml((env && env.modelLabel) || kit.MODEL) +
      '</span>' +
      '</div>' +
      '<div class="w1-chrome-tools">' +
      '<input type="search" class="w1-chrome-search pm-chat-search-input" data-chat-search placeholder="Search ledger" value="' +
      kit.escapeHtml((store && store.search && store.search.query) || '') +
      '" aria-label="Search chats" />' +
      kit.searchScopeButtonsHtml('w1-chrome-iconbtn') +
      
      '<button type="button" class="w1-chrome-iconbtn" data-action="lens" title="Context Lens" aria-label="Context Lens">' +
      kit.icon('eye', 'pm-btn-icon') +
      '</button>' +
      kit.newChatButtonHtml('w1-chrome-iconbtn') +
      kit.ringButtonHtml('w1-chrome-iconbtn') +
      '<div class="w1-chrome-selectors">' +
      kit.selectorsHtml(store) +
      '</div>' +
      '<div class="pm6-tb-menu-wrap" data-more-menu>' +
      '<button type="button" class="pm6-tb-menu-trigger w1-chrome-iconbtn" aria-haspopup="menu" aria-expanded="false" aria-label="More" title="More">' +
      kit.icon('more', 'pm-btn-icon') +
      '</button>' +
      '<div class="pm6-tb-menu" role="menu">' +
      kit.moreMenuItemsHtml(store) +
      '</div>' +
      '</div>' +
      '<button type="button" class="w1-chrome-iconbtn" data-action="' +
      popAction +
      '" title="' +
      kit.escapeHtml(popLabel) +
      '" aria-label="' +
      kit.escapeHtml(popLabel) +
      '">' +
      kit.icon('external', 'pm-btn-icon') +
      '</button>' +
      '</div>' +
      '</header>'
    );
  }

  function mount(hostEl, props) {
    props = props || {};
    var env = props.env || {};
    var store = env.store;
    var kit = Kit();
    if (!kit) throw new Error('PMChatWindowKit required for w1');

    var slot = props.threadSlotEl || document.createElement('div');
    slot.classList.add('pm-thread-slot');

    /* mid/wide: collapsed hides spine. min: slim rail always; overlay expands. */
    var spineCollapsed = false;
    var overlayOpen = false;
    var root = document.createElement('div');
    root.className = 'pm-chat-root w1-root';
    root.setAttribute('data-window-id', ID);

    var cleanups = [];

    function isMin() {
      return root.getAttribute('data-chat-tier') === 'min';
    }

    var motionBusy = false;

    function closeOverlayThenPaint() {
      if (kit.shouldBlockHistoryClose && kit.shouldBlockHistoryClose(store)) {
        if (env && env.toast) env.toast('History is pinned');
        return;
      }
      if (kit.dismissHistoryPeek) kit.dismissHistoryPeek(store);
      if (!overlayOpen || motionBusy) {
        overlayOpen = false;
        paint();
        return;
      }
      var spine = root.querySelector('[data-chats-rail]');
      var scrim = root.querySelector('.w1-scrim');
      if (!spine || !spine.classList.contains('is-overlay')) {
        overlayOpen = false;
        paint();
        return;
      }
      motionBusy = true;
      kit.closeSurfaceWithMotion({
        panel: spine,
        scrim: scrim,
        outClass: 'pm-panel-out',
        onDone: function () {
          motionBusy = false;
          overlayOpen = false;
          paint();
        }
      });
    }

    function paint() {
      store = env.store;
      if (window.PMChatV2 && typeof window.PMChatV2.assertPinInvariants === 'function') {
        var artOpen = Boolean(
          store &&
            store.session &&
            store.session.artifactWorkspace &&
            store.session.artifactWorkspace.open
        );
        window.PMChatV2.assertPinInvariants(store, ID, env && env.chatWidthPx, {
          overlayScrim: false,
          artifactOpen: artOpen
        });
      }

      var tier = kit.syncChatTier(root, env);
      var min = tier === 'min';
      if (!min) overlayOpen = false;

      var histMode =
        kit.effectiveHistoryMode
          ? kit.effectiveHistoryMode(store, ID, env.chatWidthPx)
          : kit.isHistoryPinned(store)
            ? 'pinned_full'
            : 'closed';
      /* Pin maps onto spine density: compact = slim marks; full = expanded ledger.
         Peek = temporary expanded/overlay; closed = collapsed/slim. */
      var peeking =
        histMode === 'peek' || (kit.isHistoryPeek && kit.isHistoryPeek(store));
      if (kit.isHistoryPinned(store)) {
        if (histMode === 'pinned_compact') {
          spineCollapsed = !min;
          if (min) overlayOpen = false;
        } else {
          spineCollapsed = false;
          if (min) overlayOpen = true;
        }
      } else if (peeking) {
        spineCollapsed = false;
        if (min) overlayOpen = true;
      } else {
        /* closed: collapsed mid/wide; slim marks at min */
        if (min) overlayOpen = false;
        else spineCollapsed = true;
      }

      root.classList.toggle('is-spine-collapsed', !min && spineCollapsed);
      root.classList.toggle('is-spine-slim', min && !overlayOpen);
      root.classList.toggle('is-spine-overlay', min && overlayOpen && !kit.isHistoryPinned(store));
      root.classList.toggle('is-history-pinned', kit.isHistoryPinned(store));
      root.classList.toggle('is-history-peek', peeking);
      root.classList.toggle('is-history-compact', histMode === 'pinned_compact');
      root.setAttribute('data-history-mode', histMode);

      root.innerHTML =
        renderChrome(store, kit, env) +
        '<div class="pm-chat-body w1-body">' +
        (min && overlayOpen
          ? '<div class="w1-scrim pm-scrim-anim" data-action="close-overlay" aria-hidden="true"></div>'
          : '') +
        renderSpine(store, kit, { slim: min && !overlayOpen }) +
        '<div class="w1-stage" data-stage></div>' +
        '</div>';
      root.querySelector('[data-stage]').appendChild(slot);

      var spine = root.querySelector('[data-chats-rail]');
      if (spine) {
        if (!min && spineCollapsed) spine.classList.add('is-collapsed');
        if (min && overlayOpen) spine.classList.add('is-overlay', 'pm-panel-in');
        if (min && !overlayOpen) spine.classList.add('is-slim');
      }

      cleanups.forEach(function (fn) {
        try {
          fn();
        } catch (_) {}
      });
      cleanups = [];
      cleanups.push(
        kit.bindThreadListClicks(root, store, function (id) {
          if (store && typeof store.selectThread === 'function') store.selectThread(id);
          if (env.emit) env.emit({ type: 'thread.select', threadKey: id });
          if (isMin() && overlayOpen) {
            closeOverlayThenPaint();
          }
        }, env)
      );
      cleanups.push(
        kit.bindHeaderChrome(root, {
          env: env,
          onRequestPopout: props.onRequestPopout,
          onRequestDock: props.onRequestDock,
          onToggleRail: function () {
            if (isMin()) {
              if (overlayOpen) closeOverlayThenPaint();
              else {
                overlayOpen = true;
                paint();
              }
            } else {
              spineCollapsed = !spineCollapsed;
              root.classList.toggle('is-spine-collapsed', spineCollapsed);
              var spineEl = root.querySelector('[data-chats-rail]');
              if (spineEl) spineEl.classList.toggle('is-collapsed', spineCollapsed);
            }
          }
        })
      );
      if (window.PMMenu && typeof window.PMMenu.init === 'function') window.PMMenu.init(root);
    }

    function onRootClick(ev) {
      var el = ev.target && ev.target.closest && ev.target.closest('[data-action="close-overlay"]');
      if (!el || !root.contains(el)) return;
      closeOverlayThenPaint();
    }

    hostEl.innerHTML = '';
    hostEl.appendChild(root);
    root.addEventListener('click', onRootClick);
    paint();

    return {
      update: function (next) {
        if (next && next.env) env = next.env;
        store = env.store;
        kit.syncChatTier(root, env);
        paint();
      },
      unmount: function () {
        root.removeEventListener('click', onRootClick);
        cleanups.forEach(function (fn) {
          try {
            fn();
          } catch (_) {}
        });
        hostEl.innerHTML = '';
      },
      getOverlayRoot: function () {
        return root;
      }
    };
  }

  window.PMChatWindows = window.PMChatWindows || {};
  window.PMChatWindows[ID] = { id: ID, label: LABEL, mount: mount };
})();
