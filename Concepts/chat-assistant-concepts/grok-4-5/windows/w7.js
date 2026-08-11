/* w7 — Split Latch: history behind edge latch; ≤520 must overlay. */
(function () {
  'use strict';

  var ID = 'w7';
  var LABEL = 'Split Latch';
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
    var rows = kit.threadEntries(store, 20)
      .map(function (t) {
        var selected = t.id === active;
        var stateLabel = kit.formatThreadState(t.state);
        return (
          '<div class="w7-row-wrap pm-thread-row">' +
          '<button type="button" role="option" class="w7-row' +
          (selected ? ' is-selected' : '') +
          '" data-thread-id="' +
          kit.escapeHtml(t.id) +
          '" aria-selected="' +
          (selected ? 'true' : 'false') +
          '" title="' +
          kit.escapeHtml((t.title || t.id) + (stateLabel ? ' · ' + stateLabel : '')) +
          '">' +
          '<span class="w7-row-dot" aria-hidden="true"></span>' +
          '<span class="w7-row-body">' +
          '<span class="w7-row-title">' +
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
      '<div class="w7-list pm-scroll pm-stagger" role="listbox" aria-label="History">' +
      (rows || kit.emptyChatsHtml({ title: 'No chats' })) +
      '</div>'
    );
  }

  function mount(hostEl, props) {
    props = props || {};
    var env = props.env || {};
    var store = env.store;
    var kit = Kit();
    if (!kit) throw new Error('PMChatWindowKit required for w7');

    var slot = props.threadSlotEl || document.createElement('div');
    slot.classList.add('pm-thread-slot');

    var latchOpen = false;
    var latchSide = 'right';
    var narrow = true;
    var root = document.createElement('div');
    root.className = 'pm-chat-root w7-root';
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
      root.classList.toggle('is-latch-open', latchOpen);
      root.classList.toggle('is-latch-overlay', narrow && latchOpen);
      root.setAttribute('data-latch-side', latchSide);
      root.setAttribute('data-chat-tier', narrow ? 'min' : 'mid');
    }

    var motionBusy = false;

    function closeLatchThenPaint() {
      if (kit.shouldBlockHistoryClose && kit.shouldBlockHistoryClose(store)) {
        if (env && env.toast) env.toast('History is pinned');
        return;
      }
      if (!latchOpen || motionBusy) {
        latchOpen = false;
        paint();
        return;
      }
      var panel = root.querySelector('[data-latch]');
      var scrim = root.querySelector('.w7-scrim');
      if (!panel || !panel.classList.contains('is-open')) {
        latchOpen = false;
        paint();
        return;
      }
      motionBusy = true;
      kit.closeSurfaceWithMotion({
        panel: panel,
        scrim: scrim,
        outClass: 'pm-panel-out-right',
        mode: 'transition',
        onDone: function () {
          motionBusy = false;
          latchOpen = false;
          paint();
        }
      });
    }

    function paint() {
      store = env.store;
      measure();
      if (kit.isHistoryPinned(store)) latchOpen = true;
      var histMode =
        kit.effectiveHistoryMode
          ? kit.effectiveHistoryMode(store, ID, env.chatWidthPx)
          : kit.isHistoryPinned(store)
            ? 'pinned_full'
            : 'closed';
      root.classList.toggle('is-history-pinned', kit.isHistoryPinned(store));
      root.classList.toggle('is-history-compact', histMode === 'pinned_compact');
      root.setAttribute('data-history-mode', histMode);
      var title = kit.activeTitle(store, LABEL);
      var mountMode = env.mountMode || 'docked';
      var popLabel = mountMode === 'popout' ? 'Dock' : 'Pop out';
      var popAction = mountMode === 'popout' ? 'dock' : 'popout';

      root.innerHTML =
        '<header class="w7-chrome">' +
        '<div class="w7-chrome-lead">' +
        '<span class="w7-chrome-kicker">Split Latch</span>' +
        '<span class="w7-chrome-thread" data-thread-title>' +
        kit.escapeHtml(title) +
        '</span>' +
        '</div>' +
        '<div class="w7-chrome-tools">' +
        '<input type="search" class="w7-search pm-chat-search-input" data-chat-search placeholder="Search" value="' +
        kit.escapeHtml((store && store.search && store.search.query) || '') +
        '" aria-label="Search chats" />' +
        kit.searchScopeButtonsHtml('w7-ico') +
        kit.historyPinButtonHtml(store, 'w7-ico') +
        
        '<button type="button" class="w7-ico" data-action="lens" title="Context Lens" aria-label="Context Lens">' +
        kit.icon('eye', 'pm-btn-icon') +
        '</button>' +
      kit.ringButtonHtml('w7-ico') +
        '<div class="w7-selectors">' +
        kit.selectorsHtml(store) +
        '</div>' +
        '<button type="button" class="w7-ico" data-action="new-chat" title="New chat" aria-label="New chat">' +
        kit.icon('plus', 'pm-btn-icon') +
        '</button>' +
        '<div class="pm6-tb-menu-wrap" data-more-menu>' +
        '<button type="button" class="pm6-tb-menu-trigger w7-ico" aria-haspopup="menu" aria-expanded="false" aria-label="More">' +
        kit.icon('more', 'pm-btn-icon') +
        '</button>' +
        '<div class="pm6-tb-menu" role="menu">' +
        kit.moreMenuItemsHtml(store) +
        '</div>' +
        '</div>' +
        '<button type="button" class="w7-ico" data-action="' +
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
        '<div class="pm-chat-body w7-body">' +
        '<div class="w7-prose" data-prose></div>' +
        '<div class="w7-latch' +
        (latchOpen ? ' is-open pm-panel-in-right' : '') +
        (narrow ? ' is-overlay' : '') +
        '" data-latch data-chats-rail>' +
        '<button type="button" class="w7-latch-handle" data-action="toggle-latch" aria-expanded="' +
        (latchOpen ? 'true' : 'false') +
        '" title="' +
        (latchOpen ? 'Close latch' : 'Open chat latch') +
        '" aria-label="' +
        (latchOpen ? 'Close latch' : 'Open chat latch') +
        '">' +
        '<span class="w7-latch-grip">' +
        kit.icon('grip', 'w7-grip-icon') +
        '</span>' +
        '<span class="w7-latch-label">Latch</span>' +
        '</button>' +
        '<div class="w7-latch-panel">' +
        '<div class="w7-latch-head">' +
        '<div class="w7-latch-titles">' +
        '<span class="w7-latch-kicker">History</span>' +
        '<span class="w7-latch-mode">' +
        (narrow ? 'overlay' : 'docked') +
        '</span>' +
        '</div>' +
        '<button type="button" class="w7-ico" data-action="toggle-latch" aria-label="Close latch">' +
        kit.icon('x', 'pm-btn-icon') +
        '</button>' +
        '</div>' +
        renderList(store, kit) +
        '</div>' +
        '</div>' +
        (narrow && latchOpen
          ? '<div class="w7-scrim pm-scrim-anim" data-action="toggle-latch" aria-hidden="true"></div>'
          : '') +
        '</div>';

      root.querySelector('[data-prose]').appendChild(slot);

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
          if (narrow && latchOpen) {
            closeLatchThenPaint();
          }
        }, env)
      );
      cleanups.push(
        kit.bindHeaderChrome(root, {
          env: env,
          onRequestPopout: props.onRequestPopout,
          onRequestDock: props.onRequestDock,
          onToggleRail: function () {
            if (latchOpen) closeLatchThenPaint();
            else {
              latchOpen = true;
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
      var btn = ev.target && ev.target.closest && ev.target.closest('[data-action="toggle-latch"]');
      if (!btn || !root.contains(btn)) return;
      if (latchOpen) closeLatchThenPaint();
      else {
        latchOpen = true;
        paint();
      }
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
        else {
          root.classList.toggle('is-narrow', narrow);
          root.classList.toggle('is-wide', !narrow);
          root.classList.toggle('is-latch-open', latchOpen);
          root.classList.toggle('is-latch-overlay', narrow && latchOpen);
        }
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
