/* w2 — Overlay Capsule: floating capsule at narrow; calm split at wide. */
(function () {
  'use strict';

  var ID = 'w2';
  var LABEL = 'Overlay Capsule';
  var NARROW = 560;
  var Kit = function () {
    return window.PMChatWindowKit;
  };


  function chatWidth(env, hostEl) {
    if (env && env.chatWidthPx != null && isFinite(Number(env.chatWidthPx))) {
      return Number(env.chatWidthPx);
    }
    return hostEl.clientWidth || 0;
  }

  function threadRowHtml(t, active, kit) {
    var selected = t.id === active;
    var stateLabel = kit.formatThreadState(t.state);
    var tip = (t.title || t.id) + (stateLabel ? ' · ' + stateLabel : '');
    var pin = t.pinned
      ? '<span class="w2-row-pin" aria-label="Pinned">' + kit.icon('pin', 'w2-row-pin-ico') + '</span>'
      : '';
    return (
      '<div class="w2-row-wrap pm-thread-row">' +
      '<button type="button" role="option" class="w2-row' +
      (selected ? ' is-selected' : '') +
      '" data-thread-id="' +
      kit.escapeHtml(t.id) +
      '" aria-selected="' +
      (selected ? 'true' : 'false') +
      '" title="' +
      kit.escapeHtml(tip) +
      '">' +
      '<span class="w2-row-dot" aria-hidden="true"></span>' +
      '<span class="w2-row-body">' +
      '<span class="w2-row-title">' +
      pin +
      kit.escapeHtml(t.title || t.id) +
      '</span>' +
      '</span>' +
      '</button>' +
      kit.threadRowMetaHtml(t.id, t) +
      '</div>'
    );
  }

  function renderList(store, kit) {
    var list = kit.threadEntries(store, 20);
    var active = (store && store.session && store.session.activeThreadKey) || '';
    return (
      '<div class="w2-list pm-scroll pm-stagger" role="listbox" aria-label="Chats">' +
      (list.length
        ? list
            .map(function (t) {
              return threadRowHtml(t, active, kit);
            })
            .join('')
        : kit.emptyChatsHtml({ title: 'No chats' })) +
      '</div>'
    );
  }

  function mount(hostEl, props) {
    props = props || {};
    var env = props.env || {};
    var store = env.store;
    var kit = Kit();
    if (!kit) throw new Error('PMChatWindowKit required for w2');

    var slot = props.threadSlotEl || document.createElement('div');
    slot.classList.add('pm-thread-slot');

    var chatsOpen = false;
    var toolsOpen = false;
    var narrow = true;
    var root = document.createElement('div');
    root.className = 'pm-chat-root w2-root';
    root.setAttribute('data-window-id', ID);

    var cleanups = [];
    var ro = null;

    function measure() {
      var w = chatWidth(env, hostEl);
      if (!(w > 0)) {
        var tier = document.documentElement.getAttribute('data-chat-tier');
        narrow = tier === 'min';
      } else {
        narrow = w <= NARROW;
      }
      root.classList.toggle('is-narrow', narrow);
      root.classList.toggle('is-wide', !narrow);
      root.setAttribute(
        'data-chat-tier',
        narrow ? 'min' : document.documentElement.getAttribute('data-chat-tier') || 'mid'
      );
      if (env.chatWidthPx != null) {
        root.setAttribute('data-chat-width', String(Math.round(Number(env.chatWidthPx))));
      }
      if (!narrow) {
        chatsOpen = false;
        toolsOpen = false;
      }
    }

    function capsuleHtml() {
      var title = kit.activeTitle(store, LABEL);
      var mountMode = env.mountMode || 'docked';
      var popLabel = mountMode === 'popout' ? 'Dock' : 'Pop out';
      var popAction = mountMode === 'popout' ? 'dock' : 'popout';
      var model = env.modelLabel || kit.MODEL;
      return (
        '<div class="w2-capsule" data-capsule>' +
        '<div class="w2-cap-glow" aria-hidden="true"></div>' +
        '<button type="button" class="w2-cap-btn' +
        (chatsOpen ? ' is-active' : '') +
        '" data-action="toggle-chats" aria-expanded="' +
        (chatsOpen ? 'true' : 'false') +
        '" title="Chats" aria-label="Open chats drawer">' +
        kit.icon('chat', 'pm-btn-icon') +
        '<span class="w2-cap-btn-pulse" aria-hidden="true"></span>' +
        '</button>' +
        kit.historyPinButtonHtml(store, 'w2-cap-btn') +
        '<div class="w2-cap-core">' +
        '<span class="w2-cap-kicker">Capsule</span>' +
        kit.bsdSlotHtml('kicker') +
        '<span class="w2-cap-title" title="' +
        kit.escapeHtml(title) +
        '">' +
        kit.escapeHtml(title) +
        '</span>' +
        '<span class="w2-cap-model" data-model-badge title="' +
        kit.escapeHtml(model) +
        '">' +
        kit.escapeHtml(model) +
        '</span>' +
        '</div>' +
        '<button type="button" class="w2-cap-btn' +
        (toolsOpen ? ' is-active' : '') +
        '" data-action="toggle-tools" aria-expanded="' +
        (toolsOpen ? 'true' : 'false') +
        '" title="Tools" aria-label="Open tools drawer">' +
        kit.icon('more', 'pm-btn-icon') +
        '</button>' +
        '<div class="pm6-tb-menu-wrap" data-more-menu>' +
        '<button type="button" class="pm6-tb-menu-trigger w2-cap-btn" aria-haspopup="menu" aria-expanded="false" aria-label="More" title="More">' +
        kit.icon('layers', 'pm-btn-icon') +
        '</button>' +
        '<div class="pm6-tb-menu" role="menu">' +
        kit.moreMenuItemsHtml(store) +
        '</div>' +
        '</div>' +
        '<button type="button" class="w2-cap-btn" data-action="lens" title="Context Lens" aria-label="Context Lens">' +
        kit.icon('eye', 'pm-btn-icon') +
        '</button>' +
      kit.newChatButtonHtml('w2-mini') +
      kit.ringButtonHtml('w2-mini') +
        '<button type="button" class="w2-cap-btn" data-action="' +
        popAction +
        '" title="' +
        kit.escapeHtml(popLabel) +
        '" aria-label="' +
        kit.escapeHtml(popLabel) +
        '">' +
        kit.icon('external', 'pm-btn-icon') +
        '</button>' +
        '</div>'
      );
    }

    function drawersHtml() {
      return (
        '<div class="w2-drawers" data-drawers>' +
        '<div class="w2-scrim' +
        (chatsOpen || toolsOpen ? ' pm-scrim-anim is-open' : '') +
        '" data-action="close-drawers" aria-hidden="true"></div>' +
        '<aside class="w2-drawer w2-drawer-chats' +
        (chatsOpen ? ' is-open pm-panel-in' : '') +
        '" data-drawer="chats" data-chats-rail>' +
        '<div class="w2-drawer-head">' +
        '<div class="w2-drawer-titles">' +
        '<span class="w2-drawer-kicker">History</span>' +
        '<span class="w2-drawer-title">Chats</span>' +
        '</div>' +
        '<button type="button" class="w2-drawer-x" data-action="close-drawers" aria-label="Close" title="Close">' +
        kit.icon('x', 'pm-btn-icon') +
        '</button>' +
        '</div>' +
        '<div class="w2-drawer-search">' +
        '<input type="search" class="pm-chat-search-input w2-drawer-input" data-chat-search placeholder="Search chats" value="' +
        kit.escapeHtml((store && store.search && store.search.query) || '') +
        '" aria-label="Search chats" />' +
        kit.searchScopeButtonsHtml('w2-mini') +
        kit.historyPinButtonHtml(store, 'w2-mini') +
        
        '</div>' +
        renderList(store, kit) +
        '</aside>' +
        '<aside class="w2-drawer w2-drawer-tools' +
        (toolsOpen ? ' is-open' : '') +
        '" data-drawer="tools">' +
        '<div class="w2-drawer-head">' +
        '<div class="w2-drawer-titles">' +
        '<span class="w2-drawer-kicker">Tools</span>' +
        '<span class="w2-drawer-title">Controls</span>' +
        '</div>' +
        '<button type="button" class="w2-drawer-x" data-action="close-drawers" aria-label="Close" title="Close">' +
        kit.icon('x', 'pm-btn-icon') +
        '</button>' +
        '</div>' +
        '<div class="w2-tools-body">' +
        '<div class="w2-tools-block">' +
        '<span class="w2-tools-label">Selectors</span>' +
        '<div class="w2-tools-selectors">' +
        kit.selectorsHtml(store) +
        '</div>' +
        '</div>' +
        '<div class="w2-tools-block">' +
        '<span class="w2-tools-label">Actions</span>' +
        '<div class="w2-tools-actions">' +
        '<button type="button" class="w2-tool-btn" data-action="new-chat">' +
        kit.icon('plus', 'pm-btn-icon') +
        '<span>New chat</span></button>' +
        '<button type="button" class="w2-tool-btn" data-action="lens" title="Context Lens">' +
        kit.icon('eye', 'pm-btn-icon') +
        '<span>Lens</span></button>' +
        '<button type="button" class="w2-tool-btn" data-search-scope="current" title="Search current">' +
        '<span>Search current</span></button>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</aside>' +
        '</div>'
      );
    }

    function wideChromeHtml() {
      var title = kit.activeTitle(store, LABEL);
      var mountMode = env.mountMode || 'docked';
      var popLabel = mountMode === 'popout' ? 'Dock' : 'Pop out';
      var popAction = mountMode === 'popout' ? 'dock' : 'popout';
      var model = env.modelLabel || kit.MODEL;
      return (
        '<header class="w2-wide-chrome">' +
        '<div class="w2-wide-lead">' +
        '<span class="w2-wide-kicker">Overlay Capsule</span>' +
        kit.bsdSlotHtml('kicker') +
        '<span class="w2-wide-thread" data-thread-title title="' +
        kit.escapeHtml(title) +
        '">' +
        kit.escapeHtml(title) +
        '</span>' +
        '<span class="w2-wide-model" data-model-badge title="' +
        kit.escapeHtml(model) +
        '">' +
        kit.escapeHtml(model) +
        '</span>' +
        '</div>' +
        '<div class="w2-wide-tools">' +
        '<input type="search" class="pm-chat-search-input w2-wide-search" data-chat-search placeholder="Search" value="' +
        kit.escapeHtml((store && store.search && store.search.query) || '') +
        '" aria-label="Search chats" />' +
        kit.searchScopeButtonsHtml('w2-mini') +
        kit.newChatButtonHtml('w2-mini') +
        kit.ringButtonHtml('w2-mini') +
        '<button type="button" class="w2-mini" data-action="lens" title="Context Lens" aria-label="Context Lens">' +
        kit.icon('eye', 'pm-btn-icon') +
        '</button>' +
        '<div class="w2-wide-selectors">' +
        kit.selectorsHtml(store) +
        '</div>' +
        '<div class="pm6-tb-menu-wrap" data-more-menu>' +
        '<button type="button" class="pm6-tb-menu-trigger w2-mini" aria-haspopup="menu" aria-expanded="false" aria-label="More" title="More">' +
        kit.icon('more', 'pm-btn-icon') +
        '</button>' +
        '<div class="pm6-tb-menu" role="menu">' +
        kit.moreMenuItemsHtml(store) +
        '</div>' +
        '</div>' +
        '<button type="button" class="w2-mini" data-action="' +
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

    var motionBusy = false;

    function closeDrawersThenPaint() {
      if (kit.shouldBlockHistoryClose && kit.shouldBlockHistoryClose(store) && chatsOpen) {
        if (env && env.toast) env.toast('History is pinned');
        toolsOpen = false;
        paint();
        return;
      }
      if (kit.dismissHistoryPeek) kit.dismissHistoryPeek(store);
      if ((!chatsOpen && !toolsOpen) || motionBusy) {
        chatsOpen = false;
        toolsOpen = false;
        paint();
        return;
      }
      var panel = root.querySelector('.w2-drawer.is-open');
      var scrim = root.querySelector('.w2-scrim.is-open');
      if (!panel) {
        chatsOpen = false;
        toolsOpen = false;
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
          chatsOpen = false;
          toolsOpen = false;
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
      if (narrow && (kit.isHistoryOpen ? kit.isHistoryOpen(store) : kit.isHistoryPinned(store) || (kit.isHistoryPeek && kit.isHistoryPeek(store)))) chatsOpen = true;
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
      var parts = [];
      if (narrow) {
        parts.push(capsuleHtml());
        parts.push('<div class="pm-chat-body w2-body" data-body><div class="w2-stage" data-stage></div></div>');
        parts.push(drawersHtml());
      } else {
        parts.push(wideChromeHtml());
        parts.push(
          '<div class="pm-chat-body w2-body" data-body>' +
            '<aside class="w2-dock" data-chats-rail>' +
            '<div class="w2-dock-head"><span>Chats</span></div>' +
            renderList(store, kit) +
            '</aside>' +
            '<div class="w2-stage" data-stage></div>' +
            '</div>'
        );
      }
      root.innerHTML = parts.join('');
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
          if (narrow && chatsOpen) {
            closeDrawersThenPaint();
          }
        }, env)
      );
      cleanups.push(
        kit.bindHeaderChrome(root, {
          env: env,
          onRequestPopout: props.onRequestPopout,
          onRequestDock: props.onRequestDock,
          onToggleRail: function () {
            if (chatsOpen) {
              closeDrawersThenPaint();
            } else {
              chatsOpen = true;
              toolsOpen = false;
              paint();
            }
          }
        })
      );
      if (window.PMMenu && typeof window.PMMenu.init === 'function') window.PMMenu.init(root);
    }

    function onRootClick(ev) {
      var btn = ev.target && ev.target.closest && ev.target.closest('[data-action]');
      if (!btn || !root.contains(btn)) return;
      var action = btn.getAttribute('data-action');
      if (action === 'toggle-history-pin') {
        setTimeout(paint, 0);
      } else if (action === 'toggle-chats') {
        if (chatsOpen) closeDrawersThenPaint();
        else {
          chatsOpen = true;
          toolsOpen = false;
          paint();
        }
      } else if (action === 'toggle-tools') {
        if (toolsOpen) closeDrawersThenPaint();
        else if (chatsOpen) {
          kit.closeSurfaceWithMotion({
            panel: root.querySelector('.w2-drawer-chats'),
            scrim: root.querySelector('.w2-scrim.is-open'),
            mode: 'transition',
            onDone: function () {
              chatsOpen = false;
              toolsOpen = true;
              paint();
            }
          });
        } else {
          toolsOpen = true;
          chatsOpen = false;
          paint();
        }
      } else if (action === 'close-drawers') {
        closeDrawersThenPaint();
      }
      /* lens / popout / dock / search → bindHeaderChrome shared path */
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
