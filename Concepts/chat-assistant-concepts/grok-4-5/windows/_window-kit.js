/* Shared helpers for all window modules (Grok 4.5). */
(function () {
  'use strict';

  var MODEL =
    (window.PMChatLabels && window.PMChatLabels.MODEL) || 'Grok 4.5';

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function icon(name, cls) {
    if (typeof window.PMIcon === 'function') return window.PMIcon(name, cls || '') || '';
    return '';
  }

  function formatThreadState(state) {
    if (state == null || state === '') return '';
    if (window.PMChatStore && typeof window.PMChatStore.formatStatus === 'function') {
      return window.PMChatStore.formatStatus(state);
    }
    return String(state)
      .replace(/_/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/\b\w/g, function (c) {
        return c.toUpperCase();
      });
  }

  function statusKind(state) {
    if (window.PMChatMotion && typeof window.PMChatMotion.statusKind === 'function') {
      return window.PMChatMotion.statusKind(state);
    }
    var s = String(state || 'idle').toLowerCase();
    if (s === 'working' || s === 'running' || s === 'in_progress') return 'working';
    if (s === 'needs_attention' || s === 'attention' || s === 'waiting') return 'attention';
    if (s === 'blocked' || s === 'error' || s === 'failed') return 'blocked';
    if (s === 'done' || s === 'complete' || s === 'completed' || s === 'finished') return 'done';
    return 'idle';
  }

  /** Animated status mark — text stays in aria-label / title only. */
  function statusMarkHtml(state) {
    var label = formatThreadState(state) || 'Idle';
    var kind = statusKind(state);
    return (
      '<span class="pm-thread-status is-' +
      escapeHtml(kind) +
      '" aria-label="' +
      escapeHtml(label) +
      '" title="' +
      escapeHtml(label) +
      '"><span class="pm-thread-status-mark" aria-hidden="true"></span></span>'
    );
  }

  function threadRowMoreItemsHtml(threadId, thread) {
    var pinned = Boolean(thread && thread.pinned);
    var tid = escapeHtml(threadId || '');
    function item(action, label, iconName, extra) {
      return (
        '<button type="button" role="menuitem" class="pm6-tb-menu-item' +
        (extra ? ' ' + extra : '') +
        '" data-thread-row-action="' +
        escapeHtml(action) +
        '" data-thread-id="' +
        tid +
        '">' +
        (iconName
          ? '<span class="pm-menu-item-ico" aria-hidden="true">' + icon(iconName, 'pm-btn-icon') + '</span>'
          : '') +
        '<span class="pm-menu-item-label">' +
        escapeHtml(label) +
        '</span></button>'
      );
    }
    return (
      item('pin', pinned ? 'Unpin' : 'Pin', 'pin') +
      item('rename', 'Rename', 'pencil') +
      item('archive', 'Archive', 'folder') +
      item('delete', 'Delete', 'trash') +
      item('export', 'Export', 'upload') +
      item('branch', 'Branch from here', 'branch', 'pm-menu-sep')
    );
  }

  /** One ⋯ sprout per history row. */
  function threadRowMoreHtml(threadId, thread) {
    return (
      '<div class="pm6-tb-menu-wrap pm-thread-row-more" data-thread-row-more>' +
      '<button type="button" class="pm6-tb-menu-trigger pm-btn pm-btn-ghost pm-thread-row-more-btn" aria-haspopup="menu" aria-expanded="false" aria-label="Thread actions" title="More" data-thread-id="' +
      escapeHtml(threadId || '') +
      '">' +
      icon('more', 'pm-btn-icon') +
      '</button>' +
      '<div class="pm6-tb-menu" role="menu">' +
      threadRowMoreItemsHtml(threadId, thread) +
      '</div></div>'
    );
  }

  /** Status mark + More on one meta row (not a full-height side column). */
  function threadRowMetaHtml(threadId, thread) {
    return (
      '<div class="pm-thread-row-meta" data-thread-row-meta>' +
      statusMarkHtml(thread && thread.state) +
      threadRowMoreHtml(threadId, thread) +
      '</div>'
    );
  }

  function isHistoryPinned(store) {
    if (window.PMChatV2 && typeof window.PMChatV2.isHistoryPinned === 'function') {
      return window.PMChatV2.isHistoryPinned(store);
    }
    return Boolean(store && store.session && store.session.historyPinned);
  }

  function syncArtifactIntoBody(root, store, env) {
    if (!root || !store) return;
    var body =
      root.querySelector('.pm-chat-body') ||
      root.querySelector('[data-body]') ||
      root;
    if (!body) return;
    var existing = body.querySelector('[data-artifact-workspace]');
    var tid = store.session && store.session.activeThreadKey;
    var wid = (env && env.windowId) || 'w6';
    var html =
      window.PMChatV2 && typeof window.PMChatV2.renderArtifactWorkspaceHtml === 'function'
        ? window.PMChatV2.renderArtifactWorkspaceHtml(store, tid, wid)
        : '';
    if (!html) {
      if (existing) existing.remove();
      body.classList.remove('has-artifact-workspace');
      return;
    }
    body.classList.add('has-artifact-workspace');
    var wrap = document.createElement('div');
    wrap.innerHTML = html;
    var next = wrap.firstElementChild;
    if (existing) {
      existing.replaceWith(next);
    } else {
      var stage =
        body.querySelector('[data-stage]') ||
        body.querySelector('.w6-stage') ||
        body.querySelector('.w2-stage') ||
        body.lastElementChild;
      if (stage) body.insertBefore(next, stage);
      else body.appendChild(next);
    }
    if (window.PMChatV2 && typeof window.PMChatV2.bindArtifactWorkspace === 'function') {
      window.PMChatV2.bindArtifactWorkspace(next, store, tid, function () {
        syncArtifactIntoBody(root, store, env);
      });
    }
  }

  function historyMode(store) {
    if (window.PMChatV2 && typeof window.PMChatV2.historyMode === 'function') {
      return window.PMChatV2.historyMode(store);
    }
    return isHistoryPinned(store) ? 'pinned_full' : 'closed';
  }

  function effectiveHistoryMode(store, windowId, chatWidthPx) {
    if (window.PMChatV2 && typeof window.PMChatV2.resolveHistoryModeForWidth === 'function') {
      return window.PMChatV2.resolveHistoryModeForWidth(store, windowId, chatWidthPx);
    }
    return historyMode(store);
  }

  /** True when close/scrim/scroll must not dismiss history. */
  function shouldBlockHistoryClose(store) {
    return isHistoryPinned(store);
  }

  /**
   * Play matching exit for an open history/rail/drawer before remounting closed.
   * mode: 'animation' (pm-panel-out) | 'transition' (is-open CSS both ways).
   */
  function closeSurfaceWithMotion(opts) {
    opts = opts || {};
    var panel = opts.panel;
    var scrim = opts.scrim;
    var outClass = opts.outClass || 'pm-panel-out';
    var mode = opts.mode || 'animation';
    var onDone = typeof opts.onDone === 'function' ? opts.onDone : function () {};
    var M = window.PMChatMotion;
    var reduced = M && typeof M.isReduced === 'function' && M.isReduced();

    if (reduced || !panel) {
      onDone();
      return;
    }

    var pending = 1 + (scrim ? 1 : 0);
    var settled = false;
    function tick() {
      if (settled) return;
      pending -= 1;
      if (pending > 0) return;
      settled = true;
      onDone();
    }

    panel.classList.remove('is-open', 'pm-panel-in', 'pm-panel-in-right');
    panel.classList.add('is-closing');
    if (mode !== 'transition' && outClass) panel.classList.add(outClass);

    if (mode === 'transition') {
      var pDone = false;
      var onP = function (ev) {
        if (ev && ev.target !== panel) return;
        if (pDone) return;
        pDone = true;
        panel.removeEventListener('transitionend', onP);
        tick();
      };
      panel.addEventListener('transitionend', onP);
      setTimeout(onP, 450);
    } else if (M && typeof M.playExit === 'function') {
      M.playExit(panel, outClass, tick);
    } else {
      setTimeout(tick, 220);
    }

    if (scrim) {
      scrim.classList.remove('is-open');
      scrim.classList.add('is-leaving');
      var sDone = false;
      var onS = function () {
        if (sDone) return;
        sDone = true;
        scrim.removeEventListener('animationend', onS);
        scrim.removeEventListener('transitionend', onS);
        tick();
      };
      scrim.addEventListener('animationend', onS);
      scrim.addEventListener('transitionend', onS);
      setTimeout(onS, 400);
    }
  }

  function historyPinButtonHtml(store, btnClass) {
    var mode = historyMode(store);
    var on = mode === 'pinned_compact' || mode === 'pinned_full';
    var cls = btnClass || 'pm-btn pm-btn-ghost';
    var title =
      mode === 'pinned_full'
        ? 'Unpin chat history (full)'
        : mode === 'pinned_compact'
          ? 'Unpin chat history (compact)'
          : 'Pin chat history';
    return (
      '<button type="button" class="' +
      cls +
      ' pm-history-pin-btn' +
      (on ? ' is-pinned' : '') +
      '" data-action="toggle-history-pin" data-history-mode="' +
      escapeHtml(mode) +
      '" aria-pressed="' +
      (on ? 'true' : 'false') +
      '" title="' +
      title +
      '" aria-label="' +
      title +
      '">' +
      icon('pin', 'pm-btn-icon') +
      '</button>'
    );
  }

  function runThreadRowAction(store, env, action, threadId) {
    if (!store || !threadId || !action) return;
    if (action === 'pin' && store.pinThread) {
      var nowPin = store.pinThread(threadId);
      if (env && env.toast) env.toast(nowPin ? 'Pinned' : 'Unpinned');
      return;
    }
    if (action === 'rename' && store.renameThread) {
      var cur = store.threads[threadId] ? store.threads[threadId].title : '';
      var next = window.prompt('Rename chat', cur || '');
      if (next != null) {
        store.renameThread(threadId, next);
        if (env && env.toast) env.toast('Renamed');
      }
      return;
    }
    if (action === 'archive' && store.archiveThread) {
      var arc = store.archiveThread(threadId);
      if (env && env.toast) env.toast(arc ? 'Archived' : 'Unarchived');
      return;
    }
    if (action === 'delete' && store.deleteThread) {
      if (window.confirm('Delete this chat?')) {
        store.deleteThread(threadId);
        if (env && env.toast) env.toast('Deleted');
      }
      return;
    }
    if (action === 'export') {
      var prev = store.session && store.session.activeThreadKey;
      if (prev !== threadId && store.selectThread) store.selectThread(threadId);
      exportActiveThread(store, env);
      if (prev && prev !== threadId && store.selectThread) store.selectThread(prev);
      return;
    }
    if (action === 'branch' && store.branchThread) {
      var nid = store.branchThread(threadId);
      if (env && env.toast) env.toast('Branched · ' + nid);
      if (env && env.emit) env.emit({ type: 'thread.select', threadKey: nid });
    }
  }

  /** Active thread title for window chrome (shared across w1–w8). */
  function activeTitle(store, fallback) {
    var active = store && store.session && store.session.activeThreadKey;
    var thread = active && store.threads && store.threads[active];
    return (thread && thread.title) || fallback || 'Assistant';
  }

  /**
   * Persona/Model/Mode/Worktree sprout menus.
   * Effort nests under Model (packet §10) — not a peer sprout.
   * @param {object} store
   * @param {string[]=} kinds defaults to persona/model/mode/worktree
   */
  function liveSelectorSession(store) {
    var session = (store && store.session) || {};
    var local =
      store && typeof store.getActiveLocal === 'function' ? store.getActiveLocal() : null;
    if (!local) return session;
    /* Thread-local route wins for live chrome; session keeps catalog/limit flags. */
    return Object.assign({}, session, {
      providerId: local.providerId != null ? local.providerId : session.providerId,
      accountId: local.accountId != null ? local.accountId : session.accountId,
      connectionId: local.connectionId != null ? local.connectionId : session.connectionId,
      modelId: local.modelId != null ? local.modelId : session.modelId,
      personaId: local.personaId != null ? local.personaId : session.personaId,
      effortId: local.effortId != null ? local.effortId : session.effortId,
      speedMode: local.speedMode != null ? local.speedMode : session.speedMode,
      modeId: local.modeId != null ? local.modeId : session.modeId,
      accessProfile: local.accessProfile != null ? local.accessProfile : session.accessProfile,
      crewId: local.crewId != null ? local.crewId : session.crewId,
      worktreeId: local.worktreeId !== undefined ? local.worktreeId : session.worktreeId,
      bsd: local.bsd || session.bsd
    });
  }

  function bsdSlotHtml(variant) {
    if (window.PMChatPopups && typeof window.PMChatPopups.bsdSlotHtml === 'function') {
      return window.PMChatPopups.bsdSlotHtml(variant);
    }
    return (
      '<span class="pm-bsd-slot" data-bsd-slot="' +
      escapeHtml(variant || 'mono') +
      '"></span>'
    );
  }

  function syncBsdSlots(root, store) {
    if (window.PMChatPopups && typeof window.PMChatPopups.mountBsdSlots === 'function') {
      return window.PMChatPopups.mountBsdSlots(root, store);
    }
    return [];
  }

  function selectorsHtml(store, kinds) {
    var session = liveSelectorSession(store);
    var list =
      kinds && kinds.length ? kinds : ['persona', 'model', 'mode', 'access', 'crew', 'worktree'];
    var html = '';
    if (!window.PMChatPopups) {
      return '<span class="pm-chat-selectors-placeholder" data-selectors-slot></span>';
    }
    list.forEach(function (kind) {
      var key =
        kind === 'persona'
          ? 'personaId'
          : kind === 'model'
            ? 'modelId'
            : kind === 'mode'
              ? 'modeId'
              : kind === 'access'
                ? 'accessProfile'
                : kind === 'effort'
                  ? 'effortId'
                  : kind === 'speed'
                    ? 'speedMode'
                    : kind === 'crew'
                      ? 'crewId'
                      : kind === 'worktree'
                        ? 'worktreeId'
                        : null;
      if (!key) return;
      if (kind === 'model') {
        html += window.PMChatPopups.buildMenuHtml(kind, session[key], {
          nestEffort: true,
          effortValue: session.effortId,
          speedValue: session.speedMode || 'normal',
          searchable: true,
          session: session
        });
      } else if (kind === 'persona') {
        html += window.PMChatPopups.buildMenuHtml(kind, session[key], {
          searchable: true,
          session: session
        });
      } else {
        html += window.PMChatPopups.buildMenuHtml(kind, session[key], { session: session });
      }
    });
    return html;
  }

  /**
   * Hidden host so More → overflow-* can open a real menu when chrome sprouts
   * are absent for a required kind (persona/model/mode/worktree).
   */
  function ensureOverflowSelectorHost(root, store) {
    if (!root || !root.querySelector) return null;
    var host = root.querySelector('[data-overflow-selector-host]');
    if (!host) {
      host = document.createElement('div');
      host.setAttribute('data-overflow-selector-host', '');
      host.className = 'pm-overflow-selector-host';
      host.setAttribute('aria-hidden', 'true');
      root.appendChild(host);
    }
    var needed = ['persona', 'model', 'mode', 'crew', 'worktree'];
    var missing = needed.filter(function (kind) {
      return !root.querySelector(
        '.pm-chat-selector[data-selector="' +
          kind +
          '"] .pm6-tb-menu-trigger, [data-selector="' +
          kind +
          '"] .pm6-tb-menu-trigger, [data-rail-kind="' +
          kind +
          '"] .pm6-tb-menu-trigger'
      );
    });
    if (!missing.length) {
      host.innerHTML = '';
      return host;
    }
    host.innerHTML = selectorsHtml(store, missing);
    host.querySelectorAll('.pm6-tb-menu-wrap').forEach(function (wrap) {
      if (window.PMMenu && typeof window.PMMenu.upgradeWrap === 'function') {
        window.PMMenu.upgradeWrap(wrap);
      }
    });
    return host;
  }

  function menuItem(action, label, iconName, extraClass) {
    return (
      '<button type="button" role="menuitem" class="pm6-tb-menu-item' +
      (extraClass ? ' ' + extraClass : '') +
      '" data-action="' +
      escapeHtml(action) +
      '">' +
      (iconName ? '<span class="pm-menu-item-ico" aria-hidden="true">' + icon(iconName, 'pm-btn-icon') + '</span>' : '') +
      '<span class="pm-menu-item-label">' +
      escapeHtml(label) +
      '</span>' +
      '</button>'
    );
  }

  function moreMenuItemsHtml(store) {
    var active =
      store && store.session && store.session.activeThreadKey
        ? store.threads[store.session.activeThreadKey]
        : null;
    var pinned = Boolean(active && active.pinned);
    return (
      menuItem('new-chat', 'New chat', 'plus') +
      menuItem('toggle-rail', 'Toggle chats', 'chat') +
      menuItem('thread-pin', pinned ? 'Unpin' : 'Pin', 'pin', 'pm-menu-sep') +
      menuItem('thread-rename', 'Rename', 'pencil') +
      menuItem('thread-archive', 'Archive', 'folder') +
      menuItem('thread-delete', 'Delete', 'trash') +
      menuItem('thread-export', 'Export', 'upload') +
      menuItem('thread-branch', 'Branch from here', 'branch') +
      menuItem('compact-now', 'Compact Now', 'layers', 'pm-menu-sep') +
      menuItem('crew-summary', 'Crew', 'user') +
      menuItem('context-ring', 'Context Ring', 'ring') +
      menuItem('open-settings', 'Settings', 'cog') +
      menuItem('open-theme', 'Theme…', 'layers') +
      menuItem('overflow-persona', 'Persona', 'user', 'pm-menu-sep pm-overflow-selector') +
      menuItem('overflow-model', 'Model', 'spark', 'pm-overflow-selector') +
      menuItem('overflow-mode', 'Mode', 'cog', 'pm-overflow-selector') +
      menuItem('overflow-crew', 'Crew', 'user', 'pm-overflow-selector') +
      menuItem('overflow-worktree', 'Worktree', 'branch', 'pm-overflow-selector') +
      '<button type="button" role="menuitem" class="pm6-tb-menu-item pm-overflow-only" data-action="overflow-search" data-search-scope="current">' +
      '<span class="pm-menu-item-ico" aria-hidden="true">' +
      icon('scopeCurrent', 'pm-btn-icon') +
      '</span><span class="pm-menu-item-label">Search current</span></button>' +
      '<button type="button" role="menuitem" class="pm6-tb-menu-item pm-overflow-only" data-action="overflow-search" data-search-scope="all">' +
      '<span class="pm-menu-item-ico" aria-hidden="true">' +
      icon('scopeAll', 'pm-btn-icon') +
      '</span><span class="pm-menu-item-label">Search all</span></button>' +
      menuItem('lens', 'Context Lens', 'eye', 'pm-overflow-only')
    );
  }

  /** Segmented Current / All search scope control (icon chips, not "Cur"/"All"). */
  function searchScopeButtonsHtml(btnClass) {
    var cls = btnClass || 'pm-scope-btn';
    return (
      '<div class="pm-search-scope-seg" role="group" aria-label="Search scope">' +
      '<button type="button" class="' +
      cls +
      ' pm-scope-btn" data-search-scope="current" title="Search current thread" aria-label="Search current thread">' +
      icon('scopeCurrent', 'pm-btn-icon') +
      '</button>' +
      '<button type="button" class="' +
      cls +
      ' pm-scope-btn" data-search-scope="all" title="Search all threads" aria-label="Search all threads">' +
      icon('scopeAll', 'pm-btn-icon') +
      '</button>' +
      '</div>'
    );
  }

  function ringButtonHtml(btnClass) {
    var cls = btnClass || 'pm-btn pm-btn-ghost';
    return (
      '<button type="button" class="' +
      cls +
      '" data-action="context-ring" title="Context Ring" aria-label="Context Ring">' +
      icon('ring', 'pm-btn-icon') +
      '</button>'
    );
  }

  function newChatButtonHtml(btnClass) {
    var cls = btnClass || 'pm-btn pm-btn-ghost';
    return (
      '<button type="button" class="' +
      cls +
      '" data-action="new-chat" title="New chat" aria-label="New chat">' +
      icon('plus', 'pm-btn-icon') +
      '</button>'
    );
  }

  function emptyChatsHtml(opts) {
    opts = opts || {};
    return (
      '<div class="pm-chats-empty">' +
      '<div class="pm-chats-empty-title">' +
      escapeHtml(opts.title || 'No chats yet') +
      '</div>' +
      '<div class="pm-chats-empty-body">' +
      escapeHtml(opts.body || 'Start a thread to keep planning work in one place.') +
      '</div>' +
      (opts.withNewChat !== false
        ? '<button type="button" class="pm-btn pm-chats-empty-cta" data-action="new-chat">' +
          icon('plus', 'pm-btn-icon') +
          '<span>New chat</span></button>'
        : '') +
      '</div>'
    );
  }

  /** Mirror host data-chat-tier onto a window root; treat ≤560 as min. */
  function syncChatTier(root, env) {
    if (!root) return 'mid';
    var tier = document.documentElement.getAttribute('data-chat-tier') || 'mid';
    if (env && env.chatWidthPx != null && Number(env.chatWidthPx) <= 560) tier = 'min';
    root.setAttribute('data-chat-tier', tier);
    if (env && env.chatWidthPx != null) {
      root.setAttribute('data-chat-width', String(Math.round(Number(env.chatWidthPx))));
    }
    return tier;
  }

  function threadEntries(store, limit) {
    var threads = (store && store.threads) || {};
    var keys = Object.keys(threads);
    var list = keys.map(function (k) {
      return threads[k];
    });
    list.sort(function (a, b) {
      if (Boolean(a.pinned) !== Boolean(b.pinned)) return a.pinned ? -1 : 1;
      var au = a.updatedAt || '';
      var bu = b.updatedAt || '';
      if (au !== bu) return au < bu ? 1 : -1;
      return String(a.title || '').localeCompare(String(b.title || ''));
    });
    var n = limit == null ? 15 : limit | 0;
    return list.slice(0, n);
  }

  function renderThreadList(store, opts) {
    opts = opts || {};
    var active =
      opts.activeThreadKey ||
      (store && store.session && store.session.activeThreadKey) ||
      '';
    var items = threadEntries(store, opts.limit == null ? 15 : opts.limit);
    var html =
      '<div class="pm-chats-rail-list pm-scroll pm-stagger" role="listbox" aria-label="Chats">' +
      items
        .map(function (t) {
          var selected = t.id === active;
          var stateLabel = formatThreadState(t.state);
          var tip = (t.title || t.id) + (stateLabel ? ' · ' + stateLabel : '');
          var pin =
            t.pinned
              ? '<span class="pm-chat-thread-pin" aria-label="Pinned">' +
                icon('pin', 'pm-chat-thread-pin-icon') +
                '</span>'
              : '';
          return (
            '<div class="pm-chat-thread-row pm-thread-row' +
            (selected ? ' is-selected' : '') +
            '" role="option" aria-selected="' +
            (selected ? 'true' : 'false') +
            '" data-thread-row="' +
            escapeHtml(t.id) +
            '">' +
            '<button type="button" class="pm-chat-thread-item' +
            (selected ? ' is-selected' : '') +
            '" data-thread-id="' +
            escapeHtml(t.id) +
            '" title="' +
            escapeHtml(tip) +
            '">' +
            '<span class="pm-chat-thread-item-body">' +
            '<span class="pm-chat-thread-item-title">' +
            pin +
            escapeHtml(t.title || t.id) +
            '</span>' +
            '</span>' +
            '</button>' +
            threadRowMetaHtml(t.id, t) +
            '</div>'
          );
        })
        .join('') +
      '</div>';
    if (opts.asDom) {
      var wrap = document.createElement('div');
      wrap.innerHTML = html;
      return wrap.firstElementChild;
    }
    return html;
  }

  function bindThreadListClicks(root, store, onSelect, env) {
    if (!root) return function () {};
    function handler(ev) {
      var rowAct =
        ev.target && ev.target.closest && ev.target.closest('[data-thread-row-action]');
      if (rowAct && root.contains(rowAct)) {
        ev.preventDefault();
        ev.stopPropagation();
        runThreadRowAction(
          store,
          env,
          rowAct.getAttribute('data-thread-row-action'),
          rowAct.getAttribute('data-thread-id')
        );
        if (window.PMMenu && typeof window.PMMenu.closeAll === 'function') {
          window.PMMenu.closeAll(true);
        }
        return;
      }
      if (ev.target && ev.target.closest && ev.target.closest('[data-thread-row-more]')) {
        return;
      }
      var btn = ev.target && ev.target.closest && ev.target.closest('[data-thread-id]');
      if (!btn || !root.contains(btn)) return;
      if (btn.classList.contains('pm-thread-row-more-btn')) return;
      var id = btn.getAttribute('data-thread-id');
      if (!id) return;
      if (window.PMMenu && typeof window.PMMenu.closeAll === 'function') {
        window.PMMenu.closeAll(true);
      }
      if (typeof onSelect === 'function') onSelect(id);
      else if (store && typeof store.selectThread === 'function') store.selectThread(id);
    }
    root.addEventListener('click', handler);
    return function () {
      root.removeEventListener('click', handler);
    };
  }

  function renderHeaderChrome(store, opts) {
    opts = opts || {};
    var mountMode = opts.mountMode || 'docked';
    var modelLabel = opts.modelLabel || MODEL;
    var title = opts.title || 'Assistant';
    var searchQuery =
      opts.searchQuery != null
        ? opts.searchQuery
        : store && store.search
          ? store.search.query || ''
          : '';
    var popLabel = mountMode === 'popout' ? 'Dock' : 'Pop out';
    var popAction = mountMode === 'popout' ? 'dock' : 'popout';

    var selectorsBlock =
      opts.includeSelectors !== false
        ? selectorsHtml(store, opts.selectorKinds)
        : '<span class="pm-chat-selectors-placeholder" data-selectors-slot></span>';

    /* Calm two-row hierarchy:
       Row 1 — title | Grok badge | popout | more
       Row 2 — search (flex) | Current/All | Lens | compact selector sprouts */
    var html =
      '<header class="pm-chat-header' +
      (opts.compact ? ' is-compact' : '') +
      '">' +
      '<div class="pm-chat-header-row pm-chat-header-row-primary">' +
      '<div class="pm-chat-header-title">' +
      escapeHtml(title) +
      '</div>' +
      '<div class="pm-chat-header-primary-actions">' +
      '<span class="pm-badge-model" data-model-badge>' +
      escapeHtml(modelLabel) +
      '</span>' +
      '<button type="button" class="pm-btn pm-btn-ghost" data-action="' +
      popAction +
      '" title="' +
      escapeHtml(popLabel) +
      '" aria-label="' +
      escapeHtml(popLabel) +
      '">' +
      icon('external', 'pm-btn-icon') +
      '<span>' +
      escapeHtml(popLabel) +
      '</span>' +
      '</button>' +
      '<div class="pm6-tb-menu-wrap" data-more-menu>' +
      '<button type="button" class="pm6-tb-menu-trigger pm-btn pm-btn-ghost" aria-haspopup="menu" aria-expanded="false" aria-label="More">' +
      icon('more', 'pm-btn-icon') +
      '</button>' +
      '<div class="pm6-tb-menu" role="menu">' +
      moreMenuItemsHtml(store) +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '<div class="pm-chat-header-row pm-chat-header-row-tools">' +
      '<div class="pm-chat-header-search">' +
      '<input type="search" class="pm-chat-search-input" data-chat-search placeholder="Search" value="' +
      escapeHtml(searchQuery) +
      '" aria-label="Search chats" />' +
      searchScopeButtonsHtml('pm-btn pm-btn-ghost') +
      '</div>' +
      '<div class="pm-chat-header-actions">' +
      newChatButtonHtml('pm-btn pm-btn-ghost') +
      '<button type="button" class="pm-btn pm-btn-ghost" data-action="lens" title="Context Lens" aria-label="Context Lens">' +
      icon('eye', 'pm-btn-icon') +
      '</button>' +
      ringButtonHtml('pm-btn pm-btn-ghost') +
      '<div class="pm-chat-header-selectors">' +
      selectorsBlock +
      '</div>' +
      '</div>' +
      '</div>' +
      '</header>';

    if (opts.asDom) {
      var wrap = document.createElement('div');
      wrap.innerHTML = html;
      return wrap.firstElementChild;
    }
    return html;
  }

  function ensureSearchPanel(root) {
    if (!root) return null;
    var panel = root.querySelector('[data-search-panel]');
    if (panel) return panel;
    panel = document.createElement('div');
    panel.className = 'pm-search-panel pm-search-sprout';
    panel.setAttribute('data-search-panel', '');
    panel.hidden = true;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Search results');
    root.appendChild(panel);
    return panel;
  }

  function positionSearchSprout(root, panel) {
    if (!root || !panel) return;
    var anchor =
      root.querySelector('[data-chat-search]') ||
      root.querySelector('.pm-search-scope-seg') ||
      root.querySelector('[data-search-scope]');
    var rr = root.getBoundingClientRect();
    var ar = anchor ? anchor.getBoundingClientRect() : null;
    var left = ar ? Math.max(8, ar.left - rr.left) : 12;
    var top = ar ? ar.bottom - rr.top + 6 : 48;
    var maxW = Math.min(360, Math.max(240, rr.width - 24));
    if (left + maxW > rr.width - 8) left = Math.max(8, rr.width - maxW - 8);
    panel.style.left = Math.round(left) + 'px';
    panel.style.top = Math.round(top) + 'px';
    panel.style.width = Math.round(maxW) + 'px';
    panel.style.setProperty('--pm6-sprout-ox', '12%');
    panel.style.setProperty('--pm6-sprout-oy', '0%');
  }

  function syncSearchPanel(root, store, opts) {
    opts = opts || {};
    if (!root || !window.PMChatSearch) return null;
    var panel = ensureSearchPanel(root);
    if (!panel) return null;
    var forceOpen = Boolean(opts.forceOpen);
    var query =
      opts.query != null
        ? opts.query
        : store && store.search
          ? store.search.query || ''
          : '';
    var scope =
      opts.scope ||
      (store && store.search && store.search.scope) ||
      'current';
    var open = forceOpen || Boolean(opts.open != null ? opts.open : store && store.search && store.search.panelOpen);
    if (!open && !String(query || '').trim()) {
      panel.classList.remove('is-open', 'is-closing');
      panel.hidden = true;
      panel.innerHTML = '';
      return panel;
    }
    if (!open) {
      panel.classList.remove('is-open');
      panel.hidden = true;
      return panel;
    }
    var results =
      opts.results ||
      (store && store.search && Array.isArray(store.search.results)
        ? store.search.results
        : null);
    if (!results && store && typeof store.searchMessages === 'function' && String(query || '').trim()) {
      results = store.searchMessages({ query: query, scope: scope });
    }
    results = results || [];
    if (window.PMMenu && typeof window.PMMenu.closeAll === 'function') {
      window.PMMenu.closeAll(true);
    }
    panel.hidden = false;
    panel.innerHTML = window.PMChatSearch.renderResultsHtml(results, store, {
      scope: scope,
      query: query,
      selectedResultId: store && store.search ? store.search.selectedResultId : null
    });
    positionSearchSprout(root, panel);
    panel.classList.remove('is-closing');
    /* Force reflow so sprout open transition runs */
    void panel.offsetWidth;
    panel.classList.add('is-open');
    return panel;
  }

  function openSearchPanel(root, store, env, query, scope) {
    var q = query != null ? String(query) : '';
    var sc = scope === 'all' ? 'all' : 'current';
    if (store && store.search) store.search.panelOpen = true;
    var results = [];
    if (window.PMChatSearch && store) {
      results = window.PMChatSearch.run(store, q, sc);
    } else if (store && typeof store.setSearch === 'function') {
      store.setSearch({ query: q, scope: sc });
      if (typeof store.searchMessages === 'function') {
        results = store.searchMessages({ query: q, scope: sc });
      }
    }
    if (store && store.search) {
      store.search.results = results;
      store.search.panelOpen = true;
    }
    if (env && typeof env.emit === 'function') {
      env.emit({ type: 'search.query', query: q, scope: sc, _fromUi: true, results: results });
    }
    syncSearchPanel(root, store, {
      forceOpen: true,
      results: results,
      query: q,
      scope: sc,
      open: true
    });
    return results;
  }

  function closeSearchPanel(root, store) {
    if (store && store.search) store.search.panelOpen = false;
    var panel = root && root.querySelector('[data-search-panel]');
    if (!panel) return;
    var reduced =
      document.documentElement.getAttribute('data-reduced-motion') === '1' ||
      document.documentElement.getAttribute('data-motion') === 'reduced' ||
      (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    if (reduced || !panel.classList.contains('is-open')) {
      panel.classList.remove('is-open', 'is-closing');
      panel.hidden = true;
      return;
    }
    panel.classList.add('is-closing');
    panel.classList.remove('is-open');
    window.setTimeout(function () {
      panel.classList.remove('is-closing');
      panel.hidden = true;
    }, 180);
  }

  function estimateUsage(store) {
    var tid = store && store.session && store.session.activeThreadKey;
    var thread = tid && store.threads && store.threads[tid];
    var msgs = (thread && thread.messages) || [];
    var tokens = 0;
    for (var i = 0; i < msgs.length; i++) {
      tokens += Number(msgs[i].tokenCount) || Math.ceil(String(msgs[i].body || '').length / 4);
    }
    var budget = 128000;
    var pct = Math.min(100, Math.round((tokens / budget) * 1000) / 10);
    return {
      tokens: tokens,
      budget: budget,
      pct: pct,
      threadTitle: (thread && thread.title) || 'Current thread',
      msgCount: msgs.length
    };
  }

  function closeRingPopover(root) {
    var pop = root && root.querySelector('[data-ring-popover]');
    if (!pop) return;
    if (window.PMChatMotion && typeof window.PMChatMotion.leaveThenRemove === 'function') {
      window.PMChatMotion.leaveThenRemove(pop, 'pm-motion-exit');
    } else {
      pop.remove();
    }
  }

  function openRingPopover(root, store, env, anchor) {
    if (!root) return;
    closeRingPopover(root);
    closeSettingsPanel(root);
    if (window.PMMenu && typeof window.PMMenu.closeAll === 'function') window.PMMenu.closeAll(true);
    closeSearchPanel(root, store);
    var usage = estimateUsage(store);
    var pop = document.createElement('div');
    pop.className = 'pm-ring-popover';
    pop.setAttribute('data-ring-popover', '');
    pop.setAttribute('role', 'dialog');
    pop.setAttribute('aria-label', 'Context Ring');
    pop.innerHTML =
      '<div class="pm-ring-popover-head">' +
      '<span class="pm-ring-popover-title">Context usage</span>' +
      '<button type="button" class="pm-btn pm-btn-ghost pm-ring-popover-close" data-ring-close aria-label="Close">' +
      icon('x', 'pm-btn-icon') +
      '</button></div>' +
      '<div class="pm-ring-popover-thread">' +
      escapeHtml(usage.threadTitle) +
      '</div>' +
      '<div class="pm-ring-meter" aria-hidden="true">' +
      '<div class="pm-ring-meter-fill" style="width:0%"></div></div>' +
      '<div class="pm-ring-rows pm-stagger">' +
      '<div class="pm-ring-row"><span>Context tokens</span><span>' +
      usage.tokens.toLocaleString() +
      ' / ' +
      usage.budget.toLocaleString() +
      '</span></div>' +
      '<div class="pm-ring-row"><span>Fill</span><span>' +
      usage.pct +
      '%</span></div>' +
      '<div class="pm-ring-row"><span>Messages</span><span>' +
      usage.msgCount +
      '</span></div>' +
      '</div>' +
      '<button type="button" class="pm-btn pm-ring-open-usage" data-ring-open-usage>' +
      'Usage (Settings-owned)</button>' +
      '<div class="pm-ring-footnote">UsageRecord projection · Detail owned by Usage redesign (GAP-006)</div>';
    root.appendChild(pop);
    if (anchor && anchor.getBoundingClientRect) {
      var r = root.getBoundingClientRect();
      var a = anchor.getBoundingClientRect();
      var top = Math.max(8, a.bottom - r.top + 6);
      var left = Math.min(r.width - 288, Math.max(8, a.right - r.left - 280));
      pop.style.top = top + 'px';
      pop.style.left = left + 'px';
    }
    requestAnimationFrame(function () {
      var fill = pop.querySelector('.pm-ring-meter-fill');
      if (fill) fill.style.width = usage.pct + '%';
    });
    pop.querySelector('[data-ring-close]').addEventListener('click', function () {
      closeRingPopover(root);
    });
    var usageBtn = pop.querySelector('[data-ring-open-usage]');
    if (usageBtn) {
      usageBtn.addEventListener('click', function () {
        if (env && env.toast) {
          env.toast('Usage / quota · owned by Settings · deep-link not wired in this concept');
        }
        closeRingPopover(root);
      });
    }
  }

  function closeSettingsPanel(root) {
    var panel = root && root.querySelector('[data-settings-panel]');
    if (!panel) return;
    if (window.PMChatMotion && typeof window.PMChatMotion.leaveThenRemove === 'function') {
      window.PMChatMotion.leaveThenRemove(panel, 'pm-motion-exit');
    } else {
      panel.remove();
    }
  }

  function openSettingsPanel(root, store, env) {
    if (!root) return;
    closeSettingsPanel(root);
    closeRingPopover(root);
    if (window.PMMenu && typeof window.PMMenu.closeAll === 'function') window.PMMenu.closeAll(true);
    closeSearchPanel(root, store);
    var curTheme = document.documentElement.getAttribute('data-theme') || 'friendly-dark';
    var rm =
      document.documentElement.getAttribute('data-reduced-motion') === '1' ||
      document.documentElement.getAttribute('data-motion') === 'reduced';
    var themeItems =
      window.PMChatShell && typeof window.PMChatShell.themeMenuItemsHtml === 'function'
        ? window.PMChatShell.themeMenuItemsHtml(curTheme, { action: 'set-theme' })
        : '';
    var panel = document.createElement('div');
    panel.className = 'pm-settings-panel';
    panel.setAttribute('data-settings-panel', '');
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Chat appearance');
    panel.innerHTML =
      '<div class="pm-settings-head">' +
      '<span class="pm-settings-title">Chat appearance</span>' +
      '<button type="button" class="pm-btn pm-btn-ghost" data-settings-close aria-label="Close">' +
      icon('x', 'pm-btn-icon') +
      '</button></div>' +
      '<div class="pm-settings-section">' +
      '<div class="pm-settings-kicker">Theme</div>' +
      '<div class="pm-settings-theme-list">' +
      themeItems +
      '</div></div>' +
      '<div class="pm-settings-section">' +
      '<label class="pm-settings-toggle">' +
      '<input type="checkbox" data-settings-rm' +
      (rm ? ' checked' : '') +
      ' />' +
      '<span>Reduced motion</span></label></div>' +
      '<div class="pm-settings-note">Concept demo chrome · not product preferences storage.</div>';
    root.appendChild(panel);
    panel.querySelector('[data-settings-close]').addEventListener('click', function () {
      closeSettingsPanel(root);
    });
    var rmInput = panel.querySelector('[data-settings-rm]');
      if (rmInput) {
      rmInput.addEventListener('change', function () {
        var on = Boolean(rmInput.checked);
        if (env && typeof env.emit === 'function') {
          env.emit({ type: 'ui.local', kind: 'reduced-motion', value: on });
        } else {
          document.documentElement.setAttribute('data-reduced-motion', on ? '1' : '0');
          document.documentElement.setAttribute('data-motion', on ? 'reduced' : 'full');
          if (window.PMChatMotion && typeof window.PMChatMotion.setReduced === 'function') {
            window.PMChatMotion.setReduced(on);
          }
          try {
            localStorage.setItem('pm.reducedMotion', on ? '1' : '0');
          } catch (_) {}
        }
        if (env && env.toast) env.toast(on ? 'Reduced motion on' : 'Reduced motion off');
      });
    }
  }

  function exportActiveThread(store, env) {
    var tid = store && store.session && store.session.activeThreadKey;
    var thread = tid && store.threads && store.threads[tid];
    if (!thread) {
      if (env && env.toast) env.toast('Export · no active thread');
      return;
    }
    var payload = {
      exportedAt: new Date().toISOString(),
      concept: 'grok-4-5',
      threadId: tid,
      title: thread.title || tid,
      status: thread.status || null,
      goal: thread.goal || null,
      lens: thread.lens || null,
      messages: (thread.messages || []).map(function (m) {
        return {
          id: m.id,
          role: m.role,
          body: m.body,
          createdAt: m.createdAt,
          tokenCount: m.tokenCount
        };
      })
    };
    var name =
      'tastebook-thread-' +
      String(tid)
        .replace(/[^a-z0-9_-]+/gi, '-')
        .slice(0, 48) +
      '.json';
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 1000);
    if (env && env.toast) env.toast('Exported · ' + name);
  }

  function bindHeaderChrome(root, opts) {
    opts = opts || {};
    var env = opts.env;
    var store = (env && env.store) || opts.store;
    if (!root) return function () {};

    if (window.PMMenu && typeof window.PMMenu.init === 'function') {
      window.PMMenu.init(root);
    }

    syncBsdSlots(root, store);

    ensureSearchPanel(root);
    if (store && store.search && store.search.panelOpen) {
      syncSearchPanel(root, store, { open: true });
    }

    function runChromeAction(action, scopeAttr) {
      if (scopeAttr) {
        var input = root.querySelector('[data-chat-search]');
        var q = input ? input.value : (store && store.search && store.search.query) || '';
        openSearchPanel(root, store, env, q, scopeAttr === 'all' ? 'all' : 'current');
        return;
      }
      if (!action) return;
      if (action === 'popout' && typeof opts.onRequestPopout === 'function') opts.onRequestPopout();
      if (action === 'dock' && typeof opts.onRequestDock === 'function') opts.onRequestDock();
      if (action === 'lens') {
        var activeTid =
          store && store.session && store.session.activeThreadKey
            ? store.session.activeThreadKey
            : null;
        if (activeTid && window.PMChatLens && typeof window.PMChatLens.enterSelection === 'function') {
          window.PMChatLens.enterSelection(store, activeTid);
          if (typeof env.toast === 'function') env.toast('Context Lens · select messages');
        } else if (env && typeof env.emit === 'function') {
          env.emit({ type: 'lens.apply', op: { kind: 'clear' } });
        }
        return;
      }
      if (action === 'compact-now') {
        if (store && store.session) {
          store.session.compactNow = { status: 'running', progress: 0.35 };
          if (store._emit) store._emit();
          if (env && env.toast) env.toast('Compact Now · compressing context');
          setTimeout(function () {
            store.session.compactNow = {
              status: 'done',
              progress: 1,
              included: ['Goal summary', 'Latest 8 turns', 'Open Todos'],
              leftOut: ['Raw tool dumps', 'Older search pages', 'Duplicate diffs']
            };
            if (store._emit) store._emit();
            try {
              window.dispatchEvent(new CustomEvent('pm-request-window-paint'));
            } catch (_) {}
          }, 500);
        }
        return;
      }
      if (action === 'crew-summary') {
        /* Route through confirm/selector path — no silent apply. */
        var pendingCrew =
          (store && store.session && (store.session.crewId || (store.session.crew && store.session.crew.requested))) ||
          'review-wave';
        if (window.PMChatHost && typeof window.PMChatHost.requestCrewConfirmOrApply === 'function') {
          window.PMChatHost.requestCrewConfirmOrApply(store, pendingCrew, env && env.toast);
        } else if (store && store.session) {
          store.session.crewDefaultPrompted = false;
          store.session.crewPendingConfirm = pendingCrew;
          store.session.crewConfirmOpen = true;
          if (store._emit) store._emit();
        }
        return;
      }
      if (action === 'context-ring') {
        var ringBtn = root.querySelector('[data-action="context-ring"]');
        openRingPopover(root, store, env, ringBtn);
        return;
      }
      if (action === 'open-settings') {
        openSettingsPanel(root, store, env);
        return;
      }
      if (action === 'open-theme') {
        var themeTrigger =
          document.querySelector('[data-shell-theme-menu] .pm6-tb-menu-trigger') ||
          document.querySelector('.pm-shell-theme-trigger');
        if (themeTrigger && typeof themeTrigger.click === 'function') {
          if (window.PMMenu && typeof window.PMMenu.closeAll === 'function') {
            window.PMMenu.closeAll();
          }
          window.setTimeout(function () {
            themeTrigger.click();
          }, 30);
        } else if (env && env.toast) {
          env.toast('Theme · open from title bar');
        }
        return;
      }
      if (action === 'set-theme') {
        return;
      }
      if (action === 'overflow-search') return;
      if (
        action === 'overflow-persona' ||
        action === 'overflow-model' ||
        action === 'overflow-mode' ||
        action === 'overflow-crew' ||
        action === 'overflow-worktree'
      ) {
        var kind = action.replace('overflow-', '');
        var trigger =
          root.querySelector(
            '.pm-chat-selector[data-selector="' + kind + '"] .pm6-tb-menu-trigger'
          ) ||
          root.querySelector('[data-selector="' + kind + '"] .pm6-tb-menu-trigger') ||
          root.querySelector(
            '[data-rail-kind="' + kind + '"] .pm6-tb-menu-trigger'
          );
        if (!trigger) {
          ensureOverflowSelectorHost(root, store);
          trigger =
            root.querySelector(
              '[data-overflow-selector-host] [data-selector="' + kind + '"] .pm6-tb-menu-trigger'
            ) ||
            root.querySelector(
              '[data-overflow-selector-host] [data-selector="' + kind + '"] .pm6-tb-menu-trigger'
            );
        }
        if (trigger && typeof trigger.click === 'function') {
          /* Close More first so sprout can open (mutual exclusion). */
          if (window.PMMenu && typeof window.PMMenu.closeAll === 'function') {
            window.PMMenu.closeAll();
          }
          window.setTimeout(function () {
            trigger.click();
          }, 30);
        } else if (env && env.toast) {
          env.toast(kind.charAt(0).toUpperCase() + kind.slice(1) + ' · unavailable');
        }
        return;
      }
      if (action === 'thread-pin') {
        var tidPin = store && store.session && store.session.activeThreadKey;
        if (tidPin && store.pinThread) {
          var nowPin = store.pinThread(tidPin);
          if (env && env.toast) env.toast(nowPin ? 'Pinned' : 'Unpinned');
        }
        return;
      }
      if (action === 'thread-rename') {
        var tidRen = store && store.session && store.session.activeThreadKey;
        var cur = tidRen && store.threads[tidRen] ? store.threads[tidRen].title : '';
        var next = window.prompt('Rename chat', cur || '');
        if (next != null && store.renameThread) {
          store.renameThread(tidRen, next);
          if (env && env.toast) env.toast('Renamed');
        }
        return;
      }
      if (action === 'thread-archive') {
        var tidArc = store && store.session && store.session.activeThreadKey;
        if (tidArc && store.archiveThread) {
          var arc = store.archiveThread(tidArc);
          if (env && env.toast) env.toast(arc ? 'Archived' : 'Unarchived');
        }
        return;
      }
      if (action === 'thread-delete') {
        var tidDel = store && store.session && store.session.activeThreadKey;
        if (tidDel && window.confirm('Delete this chat?') && store.deleteThread) {
          store.deleteThread(tidDel);
          if (env && env.toast) env.toast('Deleted');
        }
        return;
      }
      if (action === 'thread-export') {
        exportActiveThread(store, env);
        return;
      }
      if (action === 'thread-branch') {
        var tidBr = store && store.session && store.session.activeThreadKey;
        if (tidBr && store.branchThread) {
          var nid = store.branchThread(tidBr);
          if (env && env.toast) env.toast('Branched · ' + nid);
          if (env && env.emit) env.emit({ type: 'thread.select', threadKey: nid });
        }
        return;
      }
      if (action === 'toggle-history-pin') {
        if (store) {
          var width = (env && env.chatWidthPx) || 750;
          var wid = (env && env.windowId) || 'w6';
          var next;
          if (window.PMChatV2 && typeof window.PMChatV2.cyclePin === 'function') {
            next = window.PMChatV2.cyclePin(store, width, wid);
          } else if (typeof store.setHistoryMode === 'function') {
            next = isHistoryPinned(store) ? 'closed' : 'pinned_full';
            store.setHistoryMode(next);
          } else if (typeof store.setSelector === 'function') {
            var nextPin = !isHistoryPinned(store);
            store.setSelector('historyPinned', nextPin);
            next = nextPin ? 'pinned_full' : 'closed';
          }
          if (env && env.toast) {
            env.toast(
              next === 'closed'
                ? 'History unpinned'
                : next === 'pinned_compact'
                  ? 'History pinned · compact'
                  : 'History pinned · full'
            );
          }
        }
        return;
      }
      if (action === 'new-chat' && env && typeof env.emit === 'function') {
        env.emit({ type: 'thread.create' });
      }
      if (action === 'toggle-rail' && typeof opts.onToggleRail === 'function') {
        opts.onToggleRail();
      }
    }

    function onClick(ev) {
      var themePick =
        ev.target &&
        ev.target.closest &&
        ev.target.closest('[data-theme-id][data-action="set-theme"], [data-action="set-theme"][data-theme-id]');
      if (themePick && root.contains(themePick)) {
        var tidTheme = themePick.getAttribute('data-theme-id');
        if (tidTheme) {
          if (env && typeof env.emit === 'function') {
            env.emit({ type: 'ui.local', kind: 'set-theme', theme: tidTheme });
          } else {
            window.dispatchEvent(new CustomEvent('pm-set-theme', { detail: { theme: tidTheme } }));
          }
          root.querySelectorAll('[data-theme-id]').forEach(function (btn) {
            var on = btn.getAttribute('data-theme-id') === tidTheme;
            btn.classList.toggle('is-selected', on);
            btn.setAttribute('aria-checked', on ? 'true' : 'false');
          });
          if (env && env.toast) {
            var lbl =
              (window.PMChatShell && window.PMChatShell.themeLabel && window.PMChatShell.themeLabel(tidTheme)) ||
              tidTheme;
            env.toast('Theme · ' + lbl);
          }
        }
        if (window.PMMenu && typeof window.PMMenu.closeAll === 'function') window.PMMenu.closeAll();
        return;
      }

      var el =
        ev.target &&
        ev.target.closest &&
        ev.target.closest(
          '[data-action], [data-search-scope], [data-search-close], .pm-search-result'
        );
      if (!el || !root.contains(el)) return;

      if (el.hasAttribute('data-search-close')) {
        closeSearchPanel(root, store);
        return;
      }

      if (el.classList && el.classList.contains('pm-search-result')) {
        var tid = el.getAttribute('data-thread-id');
        var mid = el.getAttribute('data-message-id');
        if (tid && mid) {
          if (env && typeof env.emit === 'function') {
            env.emit({ type: 'search.jump', threadKey: tid, messageId: mid });
          } else if (window.PMChatSearch && store) {
            window.PMChatSearch.jumpTo(store, tid, mid);
          }
          closeSearchPanel(root, store);
        }
        return;
      }

      var action = el.getAttribute('data-action');
      var scope = el.getAttribute('data-search-scope');
      if (scope && action === 'overflow-search') {
        runChromeAction(null, scope);
        return;
      }
      if (scope) {
        runChromeAction(null, scope);
        return;
      }
      if (action) runChromeAction(action, null);
    }

    function onSearchKey(ev) {
      if (ev.key === 'Escape') {
        var ring = root.querySelector('[data-ring-popover]');
        if (ring) {
          closeRingPopover(root);
          return;
        }
        var settings = root.querySelector('[data-settings-panel]');
        if (settings) {
          closeSettingsPanel(root);
          return;
        }
        var panel = root.querySelector('[data-search-panel]');
        if (panel && !panel.hidden) {
          closeSearchPanel(root, store);
          return;
        }
      }
      if (ev.key !== 'Enter') return;
      var input = ev.target;
      if (!input || !input.matches || !input.matches('[data-chat-search]')) return;
      openSearchPanel(
        root,
        store,
        env,
        input.value,
        (store && store.search && store.search.scope) || 'current'
      );
    }

    function onMenuPick(ev) {
      var wrap = ev.target && ev.target.closest && ev.target.closest('[data-selector]');
      if (!wrap || !root.contains(wrap)) return;
      var item = ev.detail && ev.detail.item;
      var val = ev.detail && ev.detail.value;
      var kind = wrap.getAttribute('data-selector');
      if (item && item.closest && item.closest('[data-effort-nest]')) {
        kind = val === 'normal' || val === 'fast' ? 'speed' : 'effort';
      }
      if (kind && env && typeof env.emit === 'function') {
        env.emit({ type: 'selector.change', key: kind, value: val });
      } else if (kind && store && typeof store.setSelector === 'function') {
        var keyMap = {
          persona: 'personaId',
          model: 'modelId',
          mode: 'modeId',
          access: 'accessProfile',
          effort: 'effortId',
          speed: 'speedMode',
          crew: 'crewId',
          worktree: 'worktreeId'
        };
        var sk = keyMap[kind];
        if (sk) store.setSelector(sk, kind === 'worktree' && val === '' ? null : val);
      }
    }

    function onMenuInit() {
      if (window.PMChatPopups && typeof window.PMChatPopups.wireMenuFilter === 'function') {
        root.querySelectorAll('.pm-chat-selector').forEach(window.PMChatPopups.wireMenuFilter);
      }
    }
    onMenuInit();

    function onMenuAction(ev) {
      var d = ev.detail || {};
      runChromeAction(d.action, d.searchScope);
    }

    root.addEventListener('click', onClick);
    root.addEventListener('keydown', onSearchKey);
    root.addEventListener('pm-menu-pick', onMenuPick);
    root.addEventListener('pm-menu-action', onMenuAction);

    return function () {
      root.removeEventListener('click', onClick);
      root.removeEventListener('keydown', onSearchKey);
      root.removeEventListener('pm-menu-pick', onMenuPick);
      root.removeEventListener('pm-menu-action', onMenuAction);
    };
  }

  /** Minimal labeled window shell used by stub modules. */
  function mountStubWindow(hostEl, props, meta) {
    props = props || {};
    meta = meta || {};
    var env = props.env || {};
    var store = env.store;
    var slot = props.threadSlotEl || document.createElement('div');
    slot.classList.add('pm-thread-slot');

    hostEl.innerHTML = '';
    var root = document.createElement('div');
    root.className = 'pm-chat-root pm-window-stub';
    root.setAttribute('data-window-id', meta.id || '');
    root.innerHTML =
      renderHeaderChrome(store, {
        title: (meta.label || meta.id || 'Window') + ' · Grok 4.5',
        modelLabel: env.modelLabel || MODEL,
        mountMode: env.mountMode,
        compact: Boolean(meta.compact)
      }) +
      '<div class="pm-chat-body">' +
      '<aside class="pm-chats-rail" data-chats-rail>' +
      '<div class="pm-chats-rail-head"><span>Chats</span>' +
      '<span class="pm-badge-model">' +
      escapeHtml(MODEL) +
      '</span></div>' +
      renderThreadList(store) +
      '</aside>' +
      '</div>';
    hostEl.appendChild(root);
    var body = root.querySelector('.pm-chat-body');
    body.appendChild(slot);

    var cleanups = [];
    cleanups.push(
      bindThreadListClicks(root, store, function (id) {
        if (env.emit) env.emit({ type: 'thread.select', threadKey: id });
      })
    );
    cleanups.push(
      bindHeaderChrome(root, {
        env: env,
        onRequestPopout: props.onRequestPopout,
        onRequestDock: props.onRequestDock,
        onToggleRail: function () {
          var rail = root.querySelector('[data-chats-rail]');
          if (rail) rail.hidden = !rail.hidden;
        }
      })
    );

    return {
      update: function (next) {
        if (next && next.env) env = next.env;
        store = env.store;
        var listHost = root.querySelector('.pm-chats-rail-list');
        if (listHost && store) {
          var fresh = renderThreadList(store, { asDom: true });
          listHost.replaceWith(fresh);
        }
        var badge = root.querySelectorAll('[data-model-badge]');
        for (var bi = 0; bi < badge.length; bi++) {
          badge[bi].textContent = (env && env.modelLabel) || MODEL;
        }
        if (store && store.search && store.search.panelOpen) {
          syncSearchPanel(root, store, { open: true });
        }
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

  window.PMChatWindowKit = {
    escapeHtml: escapeHtml,
    icon: icon,
    formatThreadState: formatThreadState,
    statusKind: statusKind,
    statusMarkHtml: statusMarkHtml,
    threadRowMoreHtml: threadRowMoreHtml,
    threadRowMetaHtml: threadRowMetaHtml,
    isHistoryPinned: isHistoryPinned,
    historyMode: historyMode,
    effectiveHistoryMode: effectiveHistoryMode,
    shouldBlockHistoryClose: shouldBlockHistoryClose,
    syncArtifactIntoBody: syncArtifactIntoBody,
    historyPinButtonHtml: historyPinButtonHtml,
    closeSurfaceWithMotion: closeSurfaceWithMotion,
    runThreadRowAction: runThreadRowAction,
    activeTitle: activeTitle,
    selectorsHtml: selectorsHtml,
    liveSelectorSession: liveSelectorSession,
    bsdSlotHtml: bsdSlotHtml,
    syncBsdSlots: syncBsdSlots,
    ensureOverflowSelectorHost: ensureOverflowSelectorHost,
    moreMenuItemsHtml: moreMenuItemsHtml,
    searchScopeButtonsHtml: searchScopeButtonsHtml,
    ringButtonHtml: ringButtonHtml,
    newChatButtonHtml: newChatButtonHtml,
    emptyChatsHtml: emptyChatsHtml,
    syncChatTier: syncChatTier,
    threadEntries: threadEntries,
    renderThreadList: renderThreadList,
    renderHeaderChrome: renderHeaderChrome,
    bindThreadListClicks: bindThreadListClicks,
    bindHeaderChrome: bindHeaderChrome,
    ensureSearchPanel: ensureSearchPanel,
    syncSearchPanel: syncSearchPanel,
    openSearchPanel: openSearchPanel,
    closeSearchPanel: closeSearchPanel,
    mountStubWindow: mountStubWindow,
    MODEL: MODEL
  };
})();
