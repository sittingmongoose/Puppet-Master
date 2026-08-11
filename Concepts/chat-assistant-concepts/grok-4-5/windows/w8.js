/* w8 — Ribbon Dock: thin status ribbon + vertical icon rail + slide-over history. */
(function () {
  'use strict';

  var ID = 'w8';
  var LABEL = 'Ribbon Dock';
  var Kit = function () {
    return window.PMChatWindowKit;
  };


  /* Effort nests under Model (handoff) — Worktree is a required peer. */
  var RAIL_KINDS = [
    { kind: 'persona', key: 'personaId', icon: 'user', label: 'Persona' },
    { kind: 'model', key: 'modelId', icon: 'spark', label: 'Model', nestEffort: true },
    { kind: 'mode', key: 'modeId', icon: 'layers', label: 'Mode' },
    { kind: 'worktree', key: 'worktreeId', icon: 'branch', label: 'Worktree' }
  ];


  function activeMeta(store, kit) {
    var active = store && store.session && store.session.activeThreadKey;
    var thread = active && store.threads[active];
    return {
      title: (thread && thread.title) || LABEL,
      state: thread ? kit.formatThreadState(thread.state) || 'Ready' : 'Ready'
    };
  }

  function stateTone(state) {
    var s = String(state || '').toLowerCase();
    if (/run|stream|busy|active/.test(s)) return 'is-live';
    if (/err|fail|block/.test(s)) return 'is-warn';
    return 'is-ready';
  }

  function renderList(store, kit) {
    var active = (store && store.session && store.session.activeThreadKey) || '';
    var rows = kit.threadEntries(store, 20)
      .map(function (t) {
        var selected = t.id === active;
        var stateLabel = kit.formatThreadState(t.state);
        return (
          '<div class="w8-row-wrap pm-thread-row">' +
          '<button type="button" role="option" class="w8-row' +
          (selected ? ' is-selected' : '') +
          '" data-thread-id="' +
          kit.escapeHtml(t.id) +
          '" aria-selected="' +
          (selected ? 'true' : 'false') +
          '" title="' +
          kit.escapeHtml((t.title || t.id) + (stateLabel ? ' · ' + stateLabel : '')) +
          '">' +
          '<span class="w8-row-ink" aria-hidden="true"></span>' +
          '<span class="w8-row-title">' +
          kit.escapeHtml(t.title || t.id) +
          '</span>' +
          '</button>' +
          kit.threadRowMetaHtml(t.id, t) +
          '</div>'
        );
      })
      .join('');
    return (
      '<div class="w8-list pm-scroll pm-stagger" role="listbox" aria-label="Chats">' +
      (rows || kit.emptyChatsHtml({ title: 'No chats' })) +
      '</div>'
    );
  }

  function mount(hostEl, props) {
    props = props || {};
    var env = props.env || {};
    var store = env.store;
    var kit = Kit();
    if (!kit) throw new Error('PMChatWindowKit required for w8');

    var slot = props.threadSlotEl || document.createElement('div');
    slot.classList.add('pm-thread-slot');

    var chatsOpen = false; /* slide-over optional; default closed for stage room */
    var root = document.createElement('div');
    root.className = 'pm-chat-root w8-root';
    root.setAttribute('data-window-id', ID);

    var cleanups = [];

    function syncTier() {
      var tier = document.documentElement.getAttribute('data-chat-tier') || 'mid';
      if (env.chatWidthPx != null && Number(env.chatWidthPx) <= 560) tier = 'min';
      root.setAttribute('data-chat-tier', tier);
    }

    function ribbonHtml() {
      var meta = activeMeta(store, kit);
      var mountMode = env.mountMode || 'docked';
      return (
        '<div class="w8-ribbon" data-ribbon>' +
        '<div class="w8-ribbon-left">' +
        '<span class="w8-ribbon-mark">' +
        kit.icon('pm', 'w8-mark-icon') +
        '</span>' +
        '<span class="w8-ribbon-product">Ribbon Dock</span>' +
        '<span class="w8-run ' +
        stateTone(meta.state) +
        '" data-run-pill>' +
        '<i aria-hidden="true"></i>' +
        '<span data-thread-state>' +
        kit.statusMarkHtml((store && store.threads && store.threads[store.session && store.session.activeThreadKey] || {}).state) +
        '</span>' +
        '</span>' +
        '<span class="w8-ribbon-model" data-model-badge>' +
        kit.escapeHtml(env.modelLabel || kit.MODEL) +
        '</span>' +
        '</div>' +
        '<div class="w8-ribbon-center">' +
        '<span class="w8-ribbon-thread" data-thread-title>' +
        kit.escapeHtml(meta.title) +
        '</span>' +
        '</div>' +
        '<div class="w8-ribbon-right">' +
        '<button type="button" class="w8-ribbon-btn' +
        (chatsOpen ? ' is-active' : '') +
        '" data-action="toggle-chats" title="Toggle chats" aria-label="Toggle chats" aria-expanded="' +
        (chatsOpen ? 'true' : 'false') +
        '">' +
        kit.icon('chat', 'pm-btn-icon') +
        '</button>' +
        kit.historyPinButtonHtml(store, 'w8-ribbon-btn') +
        '<button type="button" class="w8-ribbon-btn" data-action="lens" title="Context Lens" aria-label="Context Lens">' +
        kit.icon('eye', 'pm-btn-icon') +
        '</button>' +
        kit.ringButtonHtml('w8-ribbon-btn') +
        '<button type="button" class="w8-ribbon-btn" data-action="new-chat" title="New chat" aria-label="New chat">' +
        kit.icon('plus', 'pm-btn-icon') +
        '</button>' +
        '<div class="pm6-tb-menu-wrap" data-more-menu>' +
        '<button type="button" class="pm6-tb-menu-trigger w8-ribbon-btn" aria-haspopup="menu" aria-expanded="false" aria-label="More">' +
        kit.icon('more', 'pm-btn-icon') +
        '</button>' +
        '<div class="pm6-tb-menu" role="menu">' +
        kit.moreMenuItemsHtml(store) +
        '</div>' +
        '</div>' +
        '<button type="button" class="w8-ribbon-btn" data-action="' +
        (mountMode === 'popout' ? 'dock' : 'popout') +
        '" title="' +
        (mountMode === 'popout' ? 'Dock' : 'Pop out') +
        '">' +
        kit.icon('external', 'pm-btn-icon') +
        '</button>' +
        '</div>' +
        '</div>'
      );
    }

    function iconRailHtml() {
      var session = (store && store.session) || {};
      var items = RAIL_KINDS.map(function (spec) {
        var menu = '';
        if (window.PMChatPopups && typeof window.PMChatPopups.buildMenuHtml === 'function') {
          menu = window.PMChatPopups.buildMenuHtml(spec.kind, session[spec.key], {
            nestEffort: !!spec.nestEffort,
            effortValue: session.effortId,
            searchable: spec.kind === 'persona' || spec.kind === 'model'
          });
        }
        return (
          '<div class="w8-rail-item" data-rail-kind="' +
          kit.escapeHtml(spec.kind) +
          '">' +
          '<span class="w8-rail-ico" title="' +
          kit.escapeHtml(spec.label) +
          '" aria-hidden="true">' +
          kit.icon(spec.icon, 'w8-rail-svg') +
          '</span>' +
          '<span class="w8-rail-tip">' +
          kit.escapeHtml(spec.label) +
          '</span>' +
          '<div class="w8-rail-menu">' +
          menu +
          '</div>' +
          '</div>'
        );
      }).join('');
      return (
        '<nav class="w8-icon-rail" data-icon-rail aria-label="Selectors">' +
        '<div class="w8-rail-cap">Ctl</div>' +
        items +
        '<div class="w8-rail-spacer"></div>' +
        '<div class="w8-rail-foot">' +
        '<span class="w8-rail-foot-model" data-model-badge>' +
        kit.escapeHtml(env.modelLabel || kit.MODEL) +
        '</span>' +
        '</div>' +
        '</nav>'
      );
    }

    var motionBusy = false;

    function closeChatsThenPaint() {
      if (kit.shouldBlockHistoryClose && kit.shouldBlockHistoryClose(store)) {
        if (env && env.toast) env.toast('History is pinned');
        return;
      }
      if (!chatsOpen || motionBusy) {
        chatsOpen = false;
        paint();
        return;
      }
      var panel = root.querySelector('[data-chats-rail]');
      var scrim = root.querySelector('.w8-scrim');
      if (!panel || !panel.classList.contains('is-open')) {
        chatsOpen = false;
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
          chatsOpen = false;
          paint();
        }
      });
    }

    function paint() {
      store = env.store;
      syncTier();
      if (kit.isHistoryPinned(store)) chatsOpen = true;
      var histMode =
        kit.effectiveHistoryMode
          ? kit.effectiveHistoryMode(store, ID, env.chatWidthPx)
          : kit.isHistoryPinned(store)
            ? 'pinned_full'
            : 'closed';
      root.classList.toggle('is-history-pinned', kit.isHistoryPinned(store));
      root.classList.toggle('is-history-compact', histMode === 'pinned_compact');
      root.setAttribute('data-history-mode', histMode);
      root.classList.toggle('is-chats-open', chatsOpen);

      root.innerHTML =
        ribbonHtml() +
        '<div class="pm-chat-body w8-body">' +
        iconRailHtml() +
        '<aside class="w8-chats' +
        (chatsOpen ? ' is-open pm-panel-in' : '') +
        '" data-chats-rail' +
        (chatsOpen ? '' : ' hidden') +
        '>' +
        '<div class="w8-chats-head">' +
        '<div class="w8-chats-titles">' +
        '<span class="w8-chats-kicker">History</span>' +
        '<span class="w8-chats-sub">Slide-over</span>' +
        '</div>' +
        '<button type="button" class="w8-ribbon-btn" data-action="toggle-chats" aria-label="Close chats">' +
        kit.icon('x', 'pm-btn-icon') +
        '</button>' +
        '</div>' +
        '<div class="w8-chats-search">' +
        '<input type="search" class="pm-chat-search-input w8-search" data-chat-search placeholder="Search" value="' +
        kit.escapeHtml((store && store.search && store.search.query) || '') +
        '" aria-label="Search chats" />' +
        kit.searchScopeButtonsHtml('w8-search-go') +
        '</div>' +
        renderList(store, kit) +
        '</aside>' +
        (chatsOpen && root.getAttribute('data-chat-tier') === 'min'
          ? '<div class="w8-scrim pm-scrim-anim" data-action="toggle-chats" aria-hidden="true"></div>'
          : '') +
        '<div class="w8-stage" data-stage></div>' +
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
          if (root.getAttribute('data-chat-tier') === 'min' && chatsOpen) {
            closeChatsThenPaint();
          }
        }, env)
      );
      cleanups.push(
        kit.bindHeaderChrome(root, {
          env: env,
          onRequestPopout: props.onRequestPopout,
          onRequestDock: props.onRequestDock,
          onToggleRail: function () {
            if (chatsOpen) closeChatsThenPaint();
            else {
              chatsOpen = true;
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
      var btn = ev.target && ev.target.closest && ev.target.closest('[data-action="toggle-chats"]');
      if (!btn || !root.contains(btn)) return;
      if (chatsOpen) closeChatsThenPaint();
      else {
        chatsOpen = true;
        paint();
      }
    }

    hostEl.innerHTML = '';
    hostEl.appendChild(root);
    root.addEventListener('click', onRootClick);
    paint();

    return {
      update: function (next) {
        if (next && next.env) env = next.env;
        store = env.store;
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
