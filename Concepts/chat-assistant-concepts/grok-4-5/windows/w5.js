/* w5 — Dual Band: top meta band; mid = pure thread; bottom = real thread dock. */
(function () {
  'use strict';

  var ID = 'w5';
  var LABEL = 'Dual Band';
  var NARROW = 520;
  var Kit = function () {
    return window.PMChatWindowKit;
  };

  function chatWidth(env, hostEl) {
    if (env && env.chatWidthPx != null && isFinite(Number(env.chatWidthPx))) {
      return Number(env.chatWidthPx);
    }
    return (hostEl && hostEl.clientWidth) || 0;
  }

  function statusBits(store, kit) {
    var active = store && store.session && store.session.activeThreadKey;
    var thread = active && store.threads[active];
    return {
      title: (thread && thread.title) || kit.activeTitle(store, LABEL),
      state: thread ? kit.formatThreadState(thread.state) || 'Idle' : 'Idle',
      count: store && store.threads ? Object.keys(store.threads).length : 0
    };
  }

  function renderRailList(store, kit) {
    var active = (store && store.session && store.session.activeThreadKey) || '';
    var rows = kit
      .threadEntries(store, 20)
      .map(function (t) {
        var selected = t.id === active;
        var stateLabel = kit.formatThreadState(t.state);
        return (
          '<div class="w5-rail-row-wrap pm-thread-row">' +
          '<button type="button" role="option" class="w5-rail-row' +
          (selected ? ' is-selected' : '') +
          '" data-thread-id="' +
          kit.escapeHtml(t.id) +
          '" aria-selected="' +
          (selected ? 'true' : 'false') +
          '" title="' +
          kit.escapeHtml((t.title || t.id) + (stateLabel ? ' · ' + stateLabel : '')) +
          '">' +
          '<span class="w5-rail-dot" aria-hidden="true"></span>' +
          '<span class="w5-rail-text">' +
          '<span class="w5-rail-title">' +
          kit.escapeHtml(t.title || t.id) +
          '</span>' +
          '</span>' +
          '</button>' +
          kit.threadRowMetaHtml(t.id, t) +
          '</div>'
        );
      })
      .join('');
    return (
      '<div class="w5-rail-list pm-scroll pm-stagger" role="listbox" aria-label="Chats">' +
      (rows || kit.emptyChatsHtml({ title: 'No chats' })) +
      '</div>'
    );
  }

  function mount(hostEl, props) {
    props = props || {};
    var env = props.env || {};
    var store = env.store;
    var kit = Kit();
    if (!kit) throw new Error('PMChatWindowKit required for w5');

    var slot = props.threadSlotEl || document.createElement('div');
    slot.classList.add('pm-thread-slot');

    var railOpen = false;
    var narrow = false;
    var root = document.createElement('div');
    root.className = 'pm-chat-root w5-root';
    root.setAttribute('data-window-id', ID);

    var cleanups = [];
    var ro = null;

    function measure() {
      var w = chatWidth(env, hostEl);
      if (!(w > 0)) {
        narrow = (document.documentElement.getAttribute('data-chat-tier') || '') === 'min';
      } else {
        narrow = w <= NARROW;
      }
      root.setAttribute('data-chat-tier', narrow ? 'min' : 'mid');
      root.classList.toggle('is-narrow', narrow);
      if (env.chatWidthPx != null) {
        root.setAttribute('data-chat-width', String(Math.round(Number(env.chatWidthPx))));
      }
    }

    var motionBusy = false;

    function closeRailThenPaint() {
      if (kit.shouldBlockHistoryClose && kit.shouldBlockHistoryClose(store)) {
        if (env && env.toast) env.toast('History is pinned');
        return;
      }
      if (!railOpen || motionBusy) {
        railOpen = false;
        paint();
        return;
      }
      var panel = root.querySelector('[data-chats-rail]');
      var scrim = root.querySelector('.w5-scrim');
      if (!panel || !panel.classList.contains('is-open')) {
        railOpen = false;
        paint();
        return;
      }
      panel.removeAttribute('hidden');
      motionBusy = true;
      kit.closeSurfaceWithMotion({
        panel: panel,
        scrim: scrim,
        outClass: 'pm-panel-out',
        onDone: function () {
          motionBusy = false;
          railOpen = false;
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

      measure();
      if (kit.isHistoryPinned(store)) railOpen = true;
      var histMode =
        kit.effectiveHistoryMode
          ? kit.effectiveHistoryMode(store, ID, env.chatWidthPx)
          : kit.isHistoryPinned(store)
            ? 'pinned_full'
            : 'closed';
      root.classList.toggle('is-history-pinned', kit.isHistoryPinned(store));
      root.classList.toggle('is-history-compact', histMode === 'pinned_compact');
      root.setAttribute('data-history-mode', histMode);
      var bits = statusBits(store, kit);
      var mountMode = env.mountMode || 'docked';
      var popLabel = mountMode === 'popout' ? 'Dock' : 'Pop out';
      var popAction = mountMode === 'popout' ? 'dock' : 'popout';

      /* Dual Band: TOP meta only. Composer/Q live in thread dock — no fake bottom frame. */
      root.innerHTML =
        '<div class="w5-band w5-band-top" data-top-band>' +
        '<div class="w5-band-lead">' +
        '<button type="button" class="w5-rail-btn" data-action="toggle-rail" aria-expanded="' +
        (railOpen ? 'true' : 'false') +
        '" title="Chats" aria-label="Toggle chats">' +
        kit.icon('chat', 'pm-btn-icon') +
        '</button>' +
        '<div class="w5-band-titles">' +
        '<span class="w5-band-label">Dual Band</span>' +
        '<span class="w5-band-thread" data-thread-title>' +
        kit.escapeHtml(bits.title) +
        '</span>' +
        '</div>' +
        '<span class="w5-band-state" data-thread-state title="' +
        kit.statusMarkHtml((store && store.threads && store.threads[store.session && store.session.activeThreadKey] || {}).state) +
        '">' +
        kit.escapeHtml(bits.state) +
        '</span>' +
        '</div>' +
        '<div class="w5-band-actions">' +
        '<input type="search" class="w5-search pm-chat-search-input" data-chat-search placeholder="Search" value="' +
        kit.escapeHtml((store && store.search && store.search.query) || '') +
        '" aria-label="Search chats" />' +
        kit.searchScopeButtonsHtml('w5-ico') +
        kit.historyPinButtonHtml(store, 'w5-ico') +
        
        '<button type="button" class="w5-ico" data-action="lens" title="Context Lens" aria-label="Context Lens">' +
        kit.icon('eye', 'pm-btn-icon') +
        '</button>' +
      kit.ringButtonHtml('w5-ico') +
        '<div class="w5-band-selectors">' +
        kit.selectorsHtml(store) +
        kit.bsdSlotHtml('trailing') +
        '</div>' +
        '<button type="button" class="w5-ico" data-action="new-chat" title="New chat" aria-label="New chat">' +
        kit.icon('plus', 'pm-btn-icon') +
        '</button>' +
        '<div class="pm6-tb-menu-wrap" data-more-menu>' +
        '<button type="button" class="pm6-tb-menu-trigger w5-ico" aria-haspopup="menu" aria-expanded="false" aria-label="More">' +
        kit.icon('more', 'pm-btn-icon') +
        '</button>' +
        '<div class="pm6-tb-menu" role="menu">' +
        kit.moreMenuItemsHtml(store) +
        '</div>' +
        '</div>' +
        '<button type="button" class="w5-ico" data-action="' +
        popAction +
        '" title="' +
        kit.escapeHtml(popLabel) +
        '" aria-label="' +
        kit.escapeHtml(popLabel) +
        '">' +
        kit.icon('external', 'pm-btn-icon') +
        '</button>' +
        '</div>' +
        '</div>' +
        '<div class="pm-chat-body w5-body">' +
        '<aside class="w5-rail' +
        (railOpen ? ' is-open pm-panel-in' : '') +
        '" data-chats-rail' +
        (railOpen ? '' : ' hidden') +
        '>' +
        '<div class="w5-rail-head">' +
        '<span>Chats</span>' +
        '<span class="w5-rail-count" data-thread-count>' +
        bits.count +
        '</span>' +
        '<button type="button" class="w5-ico" data-action="toggle-rail" title="Close chats" aria-label="Close chats">' +
        kit.icon('x', 'pm-btn-icon') +
        '</button>' +
        '</div>' +
        renderRailList(store, kit) +
        '</aside>' +
        (railOpen && narrow
          ? '<div class="w5-scrim pm-scrim-anim" data-action="toggle-rail" aria-hidden="true"></div>'
          : '') +
        '<div class="w5-stage" data-stage></div>' +
        '</div>';

      root.querySelector('[data-stage]').appendChild(slot);

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
          if (narrow && railOpen) {
            closeRailThenPaint();
          }
        }, env)
      );
      cleanups.push(
        kit.bindHeaderChrome(root, {
          env: env,
          onRequestPopout: props.onRequestPopout,
          onRequestDock: props.onRequestDock,
          onToggleRail: function () {
            if (railOpen) closeRailThenPaint();
            else {
              railOpen = true;
              paint();
            }
          }
        })
      );
      if (window.PMMenu && typeof window.PMMenu.init === 'function') window.PMMenu.init(root);
    }

    function onRootClick(ev) {
      var pin = ev.target && ev.target.closest && ev.target.closest('[data-action="toggle-history-pin"]');
      if (pin && root.contains(pin)) setTimeout(paint, 0);
    }

    hostEl.innerHTML = '';
    hostEl.appendChild(root);
    root.addEventListener('click', onRootClick);
    paint();

    if (typeof ResizeObserver === 'function') {
      ro = new ResizeObserver(function () {
        var was = narrow;
        measure();
        if (was !== narrow) paint();
      });
      ro.observe(hostEl);
    }

    return {
      update: function (next) {
        if (next && next.env) env = next.env;
        store = env.store;
        measure();
        paint();
      },
      unmount: function () {
        if (ro) {
          try {
            ro.disconnect();
          } catch (_) {}
          ro = null;
        }
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
