/* w3 — Strip Console: dense TOP instrument strip; history as horizontal pills. */
(function () {
  'use strict';

  var ID = 'w3';
  var LABEL = 'Strip Console';
  var Kit = function () {
    return window.PMChatWindowKit;
  };



  function activeMeta(store, kit) {
    var active = store && store.session && store.session.activeThreadKey;
    var thread = active && store.threads[active];
    return {
      title: (thread && thread.title) || kit.activeTitle(store, LABEL),
      state: thread ? kit.formatThreadState(thread.state) || 'Idle' : 'Idle',
      count: store && store.threads ? Object.keys(store.threads).length : 0
    };
  }

  function lampClass(state) {
    var s = String(state || '').toLowerCase();
    if (/run|stream|busy|active/.test(s)) return 'is-live';
    if (/err|fail|block/.test(s)) return 'is-warn';
    return 'is-idle';
  }

  function renderPills(store, kit) {
    var active = (store && store.session && store.session.activeThreadKey) || '';
    var items = kit.threadEntries(store, 24);
    var pills = items
      .map(function (t) {
        var selected = t.id === active;
        var pin = t.pinned ? kit.icon('pin', 'w3-pill-pin') : '';
        var state = kit.formatThreadState(t.state);
        return (
          '<div class="w3-pill-wrap pm-thread-row">' +
          '<button type="button" role="option" class="w3-pill' +
          (selected ? ' is-selected' : '') +
          '" data-thread-id="' +
          kit.escapeHtml(t.id) +
          '" aria-selected="' +
          (selected ? 'true' : 'false') +
          '" title="' +
          kit.escapeHtml((t.title || t.id) + (state ? ' · ' + state : '')) +
          '">' +
          '<span class="w3-pill-dot" aria-hidden="true"></span>' +
          pin +
          '<span class="w3-pill-label">' +
          kit.escapeHtml(t.title || t.id) +
          '</span>' +
          '</button>' +
          kit.threadRowMetaHtml(t.id, t) +
          '</div>'
        );
      })
      .join('');
    return (
      '<div class="w3-pills pm-scroll pm-stagger" role="listbox" aria-label="Chats" data-chats-rail>' +
      (pills || '<span class="w3-pills-empty">No chats</span>') +
      '</div>'
    );
  }

  function mount(hostEl, props) {
    props = props || {};
    var env = props.env || {};
    var store = env.store;
    var kit = Kit();
    if (!kit) throw new Error('PMChatWindowKit required for w3');

    var slot = props.threadSlotEl || document.createElement('div');
    slot.classList.add('pm-thread-slot');

    var root = document.createElement('div');
    root.className = 'pm-chat-root w3-root';
    root.setAttribute('data-window-id', ID);

    var cleanups = [];

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

      kit.syncChatTier(root, env);
      var histMode =
        kit.effectiveHistoryMode
          ? kit.effectiveHistoryMode(store, ID, env.chatWidthPx)
          : kit.isHistoryPinned(store)
            ? 'pinned_full'
            : 'closed';
      var peeking =
        histMode === 'peek' || (kit.isHistoryPeek && kit.isHistoryPeek(store));
      root.classList.toggle('is-history-pinned', kit.isHistoryPinned(store));
      root.classList.toggle('is-history-peek', peeking);
      root.classList.toggle('is-history-compact', histMode === 'pinned_compact');
      root.classList.toggle('is-pills-collapsed', histMode === 'closed' && !kit.isHistoryPinned(store));
      root.classList.toggle('is-pills-expanded', peeking || kit.isHistoryPinned(store));
      root.setAttribute('data-history-mode', histMode);
      var meta = activeMeta(store, kit);
      var mountMode = env.mountMode || 'docked';
      var popLabel = mountMode === 'popout' ? 'Dock' : 'Pop out';
      var popAction = mountMode === 'popout' ? 'dock' : 'popout';
      var model = env.modelLabel || kit.MODEL;

      root.innerHTML =
        '<div class="w3-console" data-strip>' +
        '<div class="w3-strip">' +
        '<div class="w3-strip-brand">' +
        '<span class="w3-strip-mark" aria-hidden="true"></span>' +
        '<div class="w3-strip-id">' +
        '<span class="w3-strip-name">Strip</span>' +
        '<span class="w3-strip-model" data-model-badge title="' +
        kit.escapeHtml(model) +
        '">' +
        kit.escapeHtml(model) +
        '</span>' +
        '</div>' +
        '</div>' +
        '<div class="w3-strip-thread" title="' +
        kit.escapeHtml(meta.title) +
        '">' +
        '<span class="w3-strip-thread-lbl">Active</span>' +
        '<span class="w3-strip-thread-val" data-thread-title>' +
        kit.escapeHtml(meta.title) +
        '</span>' +
        '</div>' +
        '<div class="w3-lamps" aria-label="Status lamps">' +
        '<span class="w3-bsd-lamp-host">' +
        kit.bsdSlotHtml('lamp') +
        '</span>' +
        '<span class="w3-lamp ' +
        lampClass(meta.state) +
        '" data-lamp="run" title="' +
        kit.escapeHtml(meta.state) +
        '"><i></i><span data-thread-state>' +
        kit.statusMarkHtml((store && store.threads && store.threads[store.session && store.session.activeThreadKey] || {}).state) +
        '</span></span>' +
        '<span class="w3-lamp is-idle" data-lamp="chats" title="Chat count"><i></i><em data-thread-count>' +
        meta.count +
        '</em></span>' +
        '</div>' +
        '<div class="w3-instruments">' +
        '<input type="search" class="w3-search pm-chat-search-input" data-chat-search placeholder="Find" value="' +
        kit.escapeHtml((store && store.search && store.search.query) || '') +
        '" aria-label="Search chats" />' +
        kit.searchScopeButtonsHtml('w3-ico') +
        kit.historyPinButtonHtml(store, 'w3-ico') +
        '<button type="button" class="w3-ico" data-action="lens" title="Context Lens" aria-label="Context Lens">' +
        kit.icon('eye', 'pm-btn-icon') +
        '</button>' +
      kit.ringButtonHtml('w3-ico') +
        '<div class="w3-selectors">' +
        kit.selectorsHtml(store) +
        '</div>' +
        '<button type="button" class="w3-ico" data-action="new-chat" title="New chat" aria-label="New chat">' +
        kit.icon('plus', 'pm-btn-icon') +
        '</button>' +
        '<div class="pm6-tb-menu-wrap" data-more-menu>' +
        '<button type="button" class="pm6-tb-menu-trigger w3-ico" aria-haspopup="menu" aria-expanded="false" aria-label="More" title="More">' +
        kit.icon('more', 'pm-btn-icon') +
        '</button>' +
        '<div class="pm6-tb-menu" role="menu">' +
        kit.moreMenuItemsHtml(store) +
        '</div>' +
        '</div>' +
        '<button type="button" class="w3-ico" data-action="' +
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
        renderPills(store, kit) +
        '</div>' +
        '<div class="pm-chat-body w3-body"><div class="w3-prose" data-stage></div></div>';

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
        }, env)
      );
      cleanups.push(
        kit.bindHeaderChrome(root, {
          env: env,
          onRequestPopout: props.onRequestPopout,
          onRequestDock: props.onRequestDock
        })
      );
      if (window.PMMenu && typeof window.PMMenu.init === 'function') window.PMMenu.init(root);
    }

    hostEl.innerHTML = '';
    hostEl.appendChild(root);
    paint();

    return {
      update: function (next) {
        if (next && next.env) env = next.env;
        store = env.store;
        paint();
      },
      unmount: function () {
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
