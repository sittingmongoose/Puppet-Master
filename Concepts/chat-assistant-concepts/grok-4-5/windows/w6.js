/* w6 — Focus Stage: reading-first; chats via header icon; no dead edge strip. */
(function () {
  'use strict';

  var ID = 'w6';
  var LABEL = 'Focus Stage';
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

  function renderList(store, kit) {
    var active = (store && store.session && store.session.activeThreadKey) || '';
    var rows = kit
      .threadEntries(store, 20)
      .map(function (t) {
        var selected = t.id === active;
        var stateLabel = kit.formatThreadState(t.state);
        return (
          '<div class="w6-row-wrap pm-thread-row">' +
          '<button type="button" role="option" class="w6-row' +
          (selected ? ' is-selected' : '') +
          '" data-thread-id="' +
          kit.escapeHtml(t.id) +
          '" aria-selected="' +
          (selected ? 'true' : 'false') +
          '" title="' +
          kit.escapeHtml((t.title || t.id) + (stateLabel ? ' · ' + stateLabel : '')) +
          '">' +
          '<span class="w6-row-bar" aria-hidden="true"></span>' +
          '<span class="w6-row-title">' +
          kit.escapeHtml(t.title || t.id) +
          '</span>' +
          '</button>' +
          kit.threadRowMetaHtml(t.id, t) +
          '</div>'
        );
      })
      .join('');
    return (
      '<div class="w6-list pm-scroll pm-stagger" role="listbox" aria-label="Chats">' +
      (rows || kit.emptyChatsHtml({ title: 'No chats', body: 'Start a new thread from the header.' })) +
      '</div>'
    );
  }

  function mount(hostEl, props) {
    props = props || {};
    var env = props.env || {};
    var store = env.store;
    var kit = Kit();
    if (!kit) throw new Error('PMChatWindowKit required for w6');

    var slot = props.threadSlotEl || document.createElement('div');
    slot.classList.add('pm-thread-slot');

    /* Default: no edge. History opens on demand from header icon. */
    var railOpen = false;
    var headerCompact = false;
    var narrow = false;
    var root = document.createElement('div');
    root.className = 'pm-chat-root w6-root';
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
      var scrim = root.querySelector('.w6-scrim');
      if (!panel) {
        railOpen = false;
        paint();
        return;
      }
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
      root.classList.toggle('is-rail-open', railOpen);
      root.classList.toggle('is-header-compact', headerCompact);
      var title = kit.activeTitle(store, LABEL);
      var mountMode = env.mountMode || 'docked';
      var popLabel = mountMode === 'popout' ? 'Dock' : 'Pop out';
      var popAction = mountMode === 'popout' ? 'dock' : 'popout';
      var count = store && store.threads ? Object.keys(store.threads).length : 0;

      root.innerHTML =
        '<header class="w6-chrome' +
        (headerCompact ? ' is-compact' : '') +
        '" data-focus-chrome>' +
        '<div class="w6-chrome-primary">' +
        '<button type="button" class="w6-ico w6-chats-toggle' +
        (railOpen ? ' is-active' : '') +
        '" data-action="toggle-rail" aria-expanded="' +
        (railOpen ? 'true' : 'false') +
        '" title="Chats" aria-label="Toggle chats">' +
        kit.icon('chat', 'pm-btn-icon') +
        '</button>' +
        '<div class="w6-chrome-titles">' +
        '<span class="w6-chrome-kicker">Focus Stage</span>' +
        '<span class="w6-chrome-thread" data-thread-title>' +
        kit.escapeHtml(title) +
        '</span>' +
        '</div>' +
        '</div>' +
        '<div class="w6-chrome-secondary" data-secondary>' +
        '<input type="search" class="w6-search pm-chat-search-input" data-chat-search placeholder="Search" value="' +
        kit.escapeHtml((store && store.search && store.search.query) || '') +
        '" aria-label="Search chats" />' +
        kit.searchScopeButtonsHtml('w6-ico') +
        kit.historyPinButtonHtml(store, 'w6-ico') +
        
        '<button type="button" class="w6-ico" data-action="lens" title="Context Lens" aria-label="Context Lens">' +
        kit.icon('eye', 'pm-btn-icon') +
        '</button>' +
        '<div class="w6-selectors">' +
        kit.selectorsHtml(store) +
        kit.bsdSlotHtml('trailing') +
        '</div>' +
        '<button type="button" class="w6-ico" data-action="new-chat" title="New chat" aria-label="New chat">' +
        kit.icon('plus', 'pm-btn-icon') +
        '</button>' +
        '<div class="pm6-tb-menu-wrap" data-more-menu>' +
        '<button type="button" class="pm6-tb-menu-trigger w6-ico" aria-haspopup="menu" aria-expanded="false" aria-label="More">' +
        kit.icon('more', 'pm-btn-icon') +
        '</button>' +
        '<div class="pm6-tb-menu" role="menu">' +
        kit.moreMenuItemsHtml(store) +
        '</div>' +
        '</div>' +
        kit.ringButtonHtml('w6-ico') +
        '<button type="button" class="w6-ico" data-action="' +
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
        '<div class="pm-chat-body w6-body">' +
        (railOpen
          ? '<aside class="w6-rail is-open pm-panel-in" data-chats-rail>' +
            '<div class="w6-rail-head">' +
            '<span>Chats</span>' +
            '<span class="w6-rail-count">' +
            count +
            '</span>' +
            '<button type="button" class="w6-ico" data-action="toggle-rail" title="Close chats" aria-label="Close chats">' +
            kit.icon('x', 'pm-btn-icon') +
            '</button>' +
            '</div>' +
            renderList(store, kit) +
            '</aside>' +
            (narrow
              ? '<div class="w6-scrim pm-scrim-anim" data-action="toggle-rail" aria-hidden="true"></div>'
              : '')
          : '') +
        '<div class="w6-stage" data-stage></div>' +
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
          if (railOpen) closeRailThenPaint();
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

    function onScrollCapture(ev) {
      var t = ev.target;
      if (!t || !t.classList || !t.classList.contains('pm-transcript')) return;
      var nextCompact = t.scrollTop > 28;
      if (nextCompact !== headerCompact) {
        headerCompact = nextCompact;
        root.classList.toggle('is-header-compact', headerCompact);
        var chrome = root.querySelector('[data-focus-chrome]');
        if (chrome) chrome.classList.toggle('is-compact', headerCompact);
      }
      if (railOpen && t.scrollTop > 24) {
        if (!(kit.shouldBlockHistoryClose && kit.shouldBlockHistoryClose(store))) {
          closeRailThenPaint();
        }
      }
    }

    function onRootClick(ev) {
      var pin = ev.target && ev.target.closest && ev.target.closest('[data-action="toggle-history-pin"]');
      if (pin && root.contains(pin)) setTimeout(paint, 0);
    }

    hostEl.innerHTML = '';
    hostEl.appendChild(root);
    root.addEventListener('click', onRootClick);
    hostEl.addEventListener('scroll', onScrollCapture, true);
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
        hostEl.removeEventListener('scroll', onScrollCapture, true);
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
