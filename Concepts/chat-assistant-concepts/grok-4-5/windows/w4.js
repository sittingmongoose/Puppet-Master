/* w4 — Pocket Index: collapsed edge tab; expandable searchable index. */
(function () {
  'use strict';

  var ID = 'w4';
  var LABEL = 'Pocket Index';
  var Kit = function () {
    return window.PMChatWindowKit;
  };



  function renderIndex(store, kit, filterQuery) {
    var active = (store && store.session && store.session.activeThreadKey) || '';
    var q = (filterQuery || '').toLowerCase().trim();
    var items = kit.threadEntries(store, 40).filter(function (t) {
      if (!q) return true;
      var hay = ((t.title || '') + ' ' + (t.state || '') + ' ' + (t.id || '')).toLowerCase();
      return hay.indexOf(q) !== -1;
    });
    var rows = items
      .map(function (t) {
        var selected = t.id === active;
        var stateLabel = kit.formatThreadState(t.state);
        var tip = (t.title || t.id) + (stateLabel ? ' · ' + stateLabel : '');
        var pin = t.pinned
          ? '<span class="w4-idx-pin" aria-label="Pinned">' + kit.icon('pin', 'w4-idx-pin-ico') + '</span>'
          : '';
        return (
          '<div class="w4-idx-row-wrap pm-thread-row">' +
          '<button type="button" role="option" class="w4-idx-row' +
          (selected ? ' is-selected' : '') +
          '" data-thread-id="' +
          kit.escapeHtml(t.id) +
          '" aria-selected="' +
          (selected ? 'true' : 'false') +
          '" title="' +
          kit.escapeHtml(tip) +
          '">' +
          '<span class="w4-idx-mark" aria-hidden="true"></span>' +
          '<span class="w4-idx-main">' +
          '<span class="w4-idx-title">' +
          pin +
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
      '<div class="w4-idx-list pm-scroll pm-stagger" role="listbox" aria-label="Pocket index">' +
      (rows || kit.emptyChatsHtml({ title: 'No matches', body: 'Nothing in this pocket filter.', withNewChat: false })) +
      '</div>'
    );
  }

  function mount(hostEl, props) {
    props = props || {};
    var env = props.env || {};
    var store = env.store;
    var kit = Kit();
    if (!kit) throw new Error('PMChatWindowKit required for w4');

    var slot = props.threadSlotEl || document.createElement('div');
    slot.classList.add('pm-thread-slot');

    var pocketOpen = false; /* default closed = max prose */
    var filterQuery = '';
    var root = document.createElement('div');
    root.className = 'pm-chat-root w4-root';
    root.setAttribute('data-window-id', ID);

    var cleanups = [];

    var motionBusy = false;

    function closePocketThenPaint() {
      if (kit.shouldBlockHistoryClose && kit.shouldBlockHistoryClose(store)) {
        if (env && env.toast) env.toast('History is pinned');
        return;
      }
      if (kit.dismissHistoryPeek) kit.dismissHistoryPeek(store);
      if (!pocketOpen || motionBusy) {
        pocketOpen = false;
        paint();
        return;
      }
      var panel = root.querySelector('[data-pocket]');
      var scrim = root.querySelector('.w4-scrim');
      if (!panel || !panel.classList.contains('is-open')) {
        pocketOpen = false;
        paint();
        return;
      }
      motionBusy = true;
      kit.closeSurfaceWithMotion({
        panel: panel,
        scrim: scrim,
        mode: 'transition',
        onDone: function () {
          motionBusy = false;
          pocketOpen = false;
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
      if (kit.isHistoryOpen ? kit.isHistoryOpen(store) : kit.isHistoryPinned(store) || (kit.isHistoryPeek && kit.isHistoryPeek(store))) pocketOpen = true;
      var histMode =
        kit.effectiveHistoryMode
          ? kit.effectiveHistoryMode(store, ID, env.chatWidthPx)
          : kit.isHistoryPinned(store)
            ? 'pinned_full'
            : 'closed';
      root.classList.toggle('is-history-pinned', kit.isHistoryPinned(store));
      root.classList.toggle(
        'is-history-peek',
        histMode === 'peek' || (kit.isHistoryPeek && kit.isHistoryPeek(store))
      );
      root.classList.toggle('is-history-compact', histMode === 'pinned_compact');
      root.setAttribute('data-history-mode', histMode);
      root.classList.toggle('is-narrow', tier === 'min');
      root.classList.toggle('is-pocket-open', pocketOpen);
      var title = kit.activeTitle(store, LABEL);
      var mountMode = env.mountMode || 'docked';
      var popLabel = mountMode === 'popout' ? 'Dock' : 'Pop out';
      var popAction = mountMode === 'popout' ? 'dock' : 'popout';
      var count = store && store.threads ? Object.keys(store.threads).length : 0;
      var model = env.modelLabel || kit.MODEL;
      var min = tier === 'min';

      root.innerHTML =
        '<header class="w4-chrome">' +
        '<div class="w4-chrome-lead">' +
        '<span class="w4-chrome-kicker">Pocket</span>' +
        kit.bsdSlotHtml('chip') +
        '<span class="w4-chrome-thread" data-thread-title title="' +
        kit.escapeHtml(title) +
        '">' +
        kit.escapeHtml(title) +
        '</span>' +
        '<span class="w4-chrome-model" data-model-badge title="' +
        kit.escapeHtml(model) +
        '">' +
        kit.escapeHtml(model) +
        '</span>' +
        '</div>' +
        '<div class="w4-chrome-tools">' +
        '<input type="search" class="w4-chrome-search pm-chat-search-input" data-chat-search placeholder="Search" value="' +
        kit.escapeHtml((store && store.search && store.search.query) || '') +
        '" aria-label="Search chats" />' +
        kit.searchScopeButtonsHtml('w4-ico') +
        kit.historyPinButtonHtml(store, 'w4-ico') +
        
        '<button type="button" class="w4-ico" data-action="lens" title="Context Lens" aria-label="Context Lens">' +
        kit.icon('eye', 'pm-btn-icon') +
        '</button>' +
      kit.newChatButtonHtml('w4-ico') +
      kit.ringButtonHtml('w4-ico') +
        '<div class="w4-chrome-selectors">' +
        kit.selectorsHtml(store) +
        '</div>' +
        '<div class="pm6-tb-menu-wrap" data-more-menu>' +
        '<button type="button" class="pm6-tb-menu-trigger w4-ico" aria-haspopup="menu" aria-expanded="false" aria-label="More" title="More">' +
        kit.icon('more', 'pm-btn-icon') +
        '</button>' +
        '<div class="pm6-tb-menu" role="menu">' +
        kit.moreMenuItemsHtml(store) +
        '</div>' +
        '</div>' +
        '<button type="button" class="w4-ico" data-action="' +
        popAction +
        '" title="' +
        kit.escapeHtml(popLabel) +
        '" aria-label="' +
        kit.escapeHtml(popLabel) +
        '">' +
        kit.icon('external', 'pm-btn-icon') +
        '</button>' +
        '</div>' +
        '</header>' +
        '<div class="pm-chat-body w4-body">' +
        '<aside class="w4-pocket' +
        (pocketOpen ? ' is-open pm-panel-in' : '') +
        '" data-chats-rail data-pocket>' +
        '<div class="w4-pocket-tab">' +
        '<button type="button" class="w4-pocket-toggle" data-action="toggle-pocket" aria-expanded="' +
        (pocketOpen ? 'true' : 'false') +
        '" title="' +
        (pocketOpen ? 'Collapse index' : 'Open index') +
        '" aria-label="' +
        (pocketOpen ? 'Collapse index' : 'Open index') +
        '">' +
        '<span class="w4-pocket-ico">' +
        kit.icon(pocketOpen ? 'chevL' : 'search', 'pm-btn-icon') +
        '</span>' +
        '<span class="w4-pocket-toggle-label">' +
        (pocketOpen ? 'Index' : 'Idx') +
        '</span>' +
        '<span class="w4-pocket-count" data-pocket-count>' +
        count +
        '</span>' +
        '</button>' +
        '</div>' +
        '<div class="w4-pocket-panel">' +
        '<div class="w4-pocket-banner">' +
        '<span class="w4-pocket-banner-kicker">Searchable index</span>' +
        '<span class="w4-pocket-banner-note">Yields width when closed</span>' +
        '</div>' +
        '<div class="w4-pocket-search">' +
        '<input type="search" class="w4-pocket-input" data-pocket-filter placeholder="Filter pocket…" value="' +
        kit.escapeHtml(filterQuery) +
        '" aria-label="Filter chats in pocket" />' +
        '</div>' +
        '<div class="w4-pocket-list-host" data-index-host>' +
        renderIndex(store, kit, filterQuery) +
        '</div>' +
        '</div>' +
        '</aside>' +
        (pocketOpen && min
          ? '<div class="w4-scrim pm-scrim-anim" data-action="toggle-pocket" aria-hidden="true"></div>'
          : '') +
        '<div class="w4-stage" data-stage></div>' +
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
          if (root.getAttribute('data-chat-tier') === 'min' && pocketOpen) {
            closePocketThenPaint();
          }
        }, env)
      );
      cleanups.push(
        kit.bindHeaderChrome(root, {
          env: env,
          onRequestPopout: props.onRequestPopout,
          onRequestDock: props.onRequestDock,
          onToggleRail: function () {
            if (pocketOpen) closePocketThenPaint();
            else {
              pocketOpen = true;
              paint();
            }
          }
        })
      );
      if (window.PMMenu && typeof window.PMMenu.init === 'function') window.PMMenu.init(root);
    }

    function onRootClick(ev) {
      var pin = ev.target && ev.target.closest && ev.target.closest('[data-action="toggle-history-pin"]');
      if (pin && root.contains(pin)) {
        setTimeout(paint, 0);
        return;
      }
      var btn = ev.target && ev.target.closest && ev.target.closest('[data-action="toggle-pocket"]');
      if (!btn || !root.contains(btn)) return;
      if (pocketOpen) closePocketThenPaint();
      else {
        pocketOpen = true;
        paint();
      }
    }

    function onRootInput(ev) {
      var input = ev.target;
      if (!input || !input.matches || !input.matches('[data-pocket-filter]')) return;
      filterQuery = input.value || '';
      var host = root.querySelector('[data-index-host]');
      if (host) host.innerHTML = renderIndex(store, kit, filterQuery);
    }

    hostEl.innerHTML = '';
    hostEl.appendChild(root);
    root.addEventListener('click', onRootClick);
    root.addEventListener('input', onRootInput);
    paint();

    return {
      update: function (next) {
        if (next && next.env) env = next.env;
        store = env.store;
        paint();
      },
      unmount: function () {
        root.removeEventListener('click', onRootClick);
        root.removeEventListener('input', onRootInput);
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
