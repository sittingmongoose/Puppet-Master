/* V2 session contracts: history modes, artifact workspace, access, triggers. */
(function () {
  'use strict';

  var HISTORY_MODES = ['closed', 'peek', 'pinned_compact', 'pinned_full'];
  var ACCESS_PROFILES = [
    { value: 'ask', label: 'Ask for approval' },
    { value: 'auto-edits', label: 'Auto accept edits' },
    { value: 'auto', label: 'Auto' },
    { value: 'full', label: 'Full Access' }
  ];
  var SPEED_OPTIONS = [
    { value: 'normal', label: 'Normal' },
    { value: 'fast', label: 'Fast' }
  ];
  var MIN_CHAT_FLOOR = {
    w1: 280,
    w2: 280,
    w3: 300,
    w4: 280,
    w5: 280,
    w6: 300,
    w7: 280,
    w8: 280
  };

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }


  var SYNC_CHIP_LABELS = {
    cached: 'Cached',
    synchronizing: 'Synchronizing',
    live: 'Live',
    offline: 'Offline',
    reconnecting: 'Reconnect',
    replay: 'Replay',
    snapshot: 'Snapshot catch-up',
    'server-work-continuing': 'Server work continuing'
  };

  function syncChipLabel(state, store) {
    if (window.PMChatShell && typeof window.PMChatShell.syncChipLabel === 'function') {
      return window.PMChatShell.syncChipLabel(state, store);
    }
    if (state === 'offline' && store && store.session && Array.isArray(store.session.outbox)) {
      var queued = store.session.outbox.some(function (row) {
        return row && row.status === 'queued';
      });
      if (queued) return 'Queued to send';
    }
    return SYNC_CHIP_LABELS[state] || String(state || 'Live');
  }

  function renderAttachmentResolverCard(store) {
    var res = store && store.session && store.session.attachmentResolver;
    if (!res) return '';
    var choices = (res.choices || [])
      .map(function (c) {
        return (
          '<button type="button" class="pm-btn pm-btn-secondary" data-attach-resolve="' +
          escapeHtml(c.id) +
          '">' +
          escapeHtml(c.label) +
          '</button>'
        );
      })
      .join('');
    var klass = res.class || 'unsupported';
    var title =
      klass === 'native'
        ? 'Native'
        : klass === 'pm-transformed'
          ? 'PM transformed'
          : klass === 'alternate'
            ? 'Alternate'
            : 'Unsupported';
    return (
      '<div class="pm-attach-resolver" data-attach-resolver-card data-attach-class="' +
      escapeHtml(klass) +
      '">' +
      '<div class="pm-attach-resolver-title">Attachment · ' +
      escapeHtml(title) +
      '</div>' +
      '<div class="pm-attach-resolver-lineage">' +
      escapeHtml((res.lineage || []).join(' → ')) +
      '</div>' +
      '<div class="pm-attach-resolver-actions">' +
      choices +
      '</div></div>'
    );
  }

  function renderCapacityForecast(store, thread) {
    var line =
      (thread && thread.capacityForecast) ||
      (store && store.session && store.session.capacityForecast) ||
      '';
    if (!line) return '';
    return (
      '<div class="pm-capacity-forecast" data-capacity-forecast>' +
      escapeHtml(line) +
      '</div>'
    );
  }

  /** Shared pin invariant helper for windows/wN update paths (Step5). */
  function assertPinInvariants(store, windowId, chatWidthPx, opts) {
    opts = opts || {};
    var mode = historyMode(store);
    var floor = MIN_CHAT_FLOOR[windowId] || 280;
    var width = Number(chatWidthPx) || 0;
    var issues = [];
    if ((mode === 'pinned_full' || mode === 'pinned_compact') && opts.overlayScrim) {
      issues.push('pinned-must-not-overlay-scrim');
    }
    if (mode === 'pinned_full' && width && width < floor + 200) {
      issues.push('auto-compact-required');
      if (store && typeof store.setHistoryMode === 'function') {
        store.setHistoryMode('pinned_compact');
      }
    }
    if (opts.artifactOpen && mode === 'closed' && opts.requireHistoryWithArtifact) {
      issues.push('history-artifact-should-coexist-when-pinned');
    }
    return { ok: !issues.length, issues: issues, mode: historyMode(store), floor: floor };
  }

  function confirmBulkPersonaApply(personaLabel) {
    var label = personaLabel || 'Researcher';
    var copy = 'Apply ' + label + ' to all threads in this PlanningRun?';
    if (typeof window.confirm === 'function') {
      return window.confirm(copy);
    }
    return false;
  }

  function historyMode(store) {
    var s = store && store.session;
    if (!s) return 'closed';
    if (s.historyMode && HISTORY_MODES.indexOf(s.historyMode) >= 0) return s.historyMode;
    return s.historyPinned ? 'pinned_full' : 'closed';
  }

  function isHistoryPinned(store) {
    var m = historyMode(store);
    return m === 'pinned_compact' || m === 'pinned_full';
  }

  function isHistoryOpen(store) {
    var m = historyMode(store);
    return m !== 'closed';
  }

  function isHistoryPeek(store) {
    return historyMode(store) === 'peek';
  }

  function resolveHistoryModeForWidth(store, windowId, chatWidthPx) {
    var mode = historyMode(store);
    if (mode !== 'pinned_full') return mode;
    var floor = MIN_CHAT_FLOOR[windowId] || 280;
    var w = Number(chatWidthPx) || 750;
    /* Full pin + readable chat: need room for history (~200) + floor */
    if (w < floor + 200) return 'pinned_compact';
    return 'pinned_full';
  }

  function setHistoryMode(store, mode) {
    if (!store || typeof store.setHistoryMode !== 'function') {
      if (store && store.setSelector) {
        var pinned = mode === 'pinned_compact' || mode === 'pinned_full';
        store.setSelector('historyPinned', pinned);
        if (store.session) store.session.historyMode = mode;
      }
      return;
    }
    store.setHistoryMode(mode);
  }

  function cyclePin(store, chatWidthPx, windowId) {
    var cur = historyMode(store);
    var next;
    if (cur === 'closed' || cur === 'peek') {
      next = resolveHistoryModeForWidth(
        { session: { historyMode: 'pinned_full', historyPinned: true } },
        windowId,
        chatWidthPx
      );
      if (next !== 'pinned_compact' && next !== 'pinned_full') next = 'pinned_full';
      /* Prefer full when space allows */
      var floor = MIN_CHAT_FLOOR[windowId] || 280;
      next = Number(chatWidthPx) >= floor + 200 ? 'pinned_full' : 'pinned_compact';
    } else {
      next = 'closed';
    }
    setHistoryMode(store, next);
    return next;
  }

  function defaultArtifactWorkspace() {
    return {
      open: false,
      artifactId: null,
      status: 'ready',
      queue: [],
      scrollTop: 0,
      errorMessage: null
    };
  }

  function getArtifactWorkspace(store) {
    var s = store && store.session;
    if (!s) return defaultArtifactWorkspace();
    if (!s.artifactWorkspace) s.artifactWorkspace = defaultArtifactWorkspace();
    return s.artifactWorkspace;
  }

  function artifactScrollEl(root) {
    if (!root) return null;
    if (root.matches && root.matches('[data-artifact-scroll], .pm-art-scroll, .pm-artifact-body')) {
      return root;
    }
    return (
      root.querySelector('[data-artifact-scroll]') ||
      root.querySelector('.pm-art-scroll') ||
      root.querySelector('.pm-artifact-body')
    );
  }

  function captureArtifactScroll(store, root) {
    var aw = getArtifactWorkspace(store);
    var el = artifactScrollEl(root);
    if (!el) {
      el = document.querySelector(
        '[data-artifact-workspace] [data-artifact-scroll], [data-artifact-workspace] .pm-art-scroll, [data-artifact-workspace] .pm-artifact-body'
      );
    }
    if (el) aw.scrollTop = el.scrollTop || 0;
    return aw.scrollTop || 0;
  }

  function restoreArtifactScroll(store, root) {
    var aw = getArtifactWorkspace(store);
    var el = artifactScrollEl(root);
    if (!el || aw.scrollTop == null) return;
    var top = aw.scrollTop || 0;
    el.scrollTop = top;
    /* Re-apply after layout/replace settles */
    window.requestAnimationFrame(function () {
      if (el.isConnected) el.scrollTop = top;
    });
  }

  function findArtifact(store, threadId, artifactId) {
    var thread = store && store.threads && store.threads[threadId];
    var list = (thread && thread.artifacts) || [];
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === artifactId) return list[i];
    }
    /* Fall back to session catalog */
    var cat = (store && store.session && store.session.artifactCatalog) || [];
    for (var j = 0; j < cat.length; j++) {
      if (cat[j].id === artifactId) return cat[j];
    }
    return null;
  }

  function openArtifactWorkspace(store, threadId, artifactId, opts) {
    /* Opening an artifact must not auto-admit passages into Context Lens. */
    opts = opts || {};
    if (!store) return;
    var aw = getArtifactWorkspace(store);
    captureArtifactScroll(store);
    var art = findArtifact(store, threadId, artifactId);
    if (!art && artifactId) {
      art = {
        id: artifactId,
        title: artifactId,
        type: 'document',
        kind: 'document'
      };
    }
    if (!art) return;
    var scrollAnchor = null;
    var tid = threadId || (store.session && store.session.activeThreadKey);
    if (tid && store.ui && store.ui.perThread && store.ui.perThread[tid]) {
      scrollAnchor = store.ui.perThread[tid].scrollAnchor;
    }
    aw.open = true;
    aw.artifactId = art.id;
    aw.status = opts.status || 'loading';
    aw.errorMessage = null;
    aw._preserveScroll = scrollAnchor;
    if (aw.queue.indexOf(art.id) < 0) aw.queue.push(art.id);
    if (typeof store._emit === 'function') store._emit();
    else if (store.emit) store.emit();
    /* Resolve loading → ready/error; update → updated when settleToUpdated. */
    if (aw.status === 'loading') {
      window.setTimeout(function () {
        if (aw.artifactId !== art.id) return;
        aw.status = opts.error ? 'error' : 'ready';
        if (opts.error) aw.errorMessage = opts.errorMessage || 'Failed to load artifact';
        if (typeof store._emit === 'function') store._emit();
        else if (store.notify) store.notify();
        try {
          window.dispatchEvent(new CustomEvent('pm-artifact-workspace', { detail: { aw: aw } }));
        } catch (_) {}
      }, opts.instant ? 0 : 420);
    } else if (aw.status === 'update' && opts.settleToUpdated) {
      window.setTimeout(function () {
        if (aw.artifactId !== art.id) return;
        aw.status = 'updated';
        if (typeof store._emit === 'function') store._emit();
        else if (store.notify) store.notify();
        try {
          window.dispatchEvent(new CustomEvent('pm-artifact-workspace', { detail: { aw: aw } }));
        } catch (_) {}
      }, opts.instant ? 0 : 420);
    }
    try {
      window.dispatchEvent(
        new CustomEvent('pm-artifact-workspace', { detail: { open: true, id: art.id } })
      );
    } catch (_) {}
  }

  function closeArtifactWorkspace(store) {
    var aw = getArtifactWorkspace(store);
    if (!aw.open) return;
    var reduced =
      window.PMChatMotion && typeof window.PMChatMotion.isReduced === 'function'
        ? window.PMChatMotion.isReduced()
        : false;
    if (reduced) {
      aw.open = false;
      aw.closing = false;
      aw.artifactId = null;
      aw.status = 'ready';
      aw.errorMessage = null;
      if (typeof store._emit === 'function') store._emit();
      return;
    }
    aw.closing = true;
    if (typeof store._emit === 'function') store._emit();
    window.setTimeout(function () {
      aw.open = false;
      aw.closing = false;
      aw.artifactId = null;
      aw.status = 'ready';
      aw.errorMessage = null;
      if (typeof store._emit === 'function') store._emit();
    }, 280);
  }

  function switchArtifact(store, threadId, artifactId) {
    captureArtifactScroll(store);
    openArtifactWorkspace(store, threadId, artifactId, { status: 'update' });
    var aw = getArtifactWorkspace(store);
    window.setTimeout(function () {
      if (aw.artifactId === artifactId) {
        aw.status = 'ready';
        if (typeof store._emit === 'function') store._emit();
      }
    }, 280);
  }

  function renderArtifactWorkspaceHtml(store, threadId, windowId) {
    var aw = getArtifactWorkspace(store);
    if (!aw.open && !aw.closing) return '';
    var art = findArtifact(store, threadId, aw.artifactId) || {
      id: aw.artifactId,
      title: aw.artifactId || 'Artifact',
      type: 'document'
    };
    var status = aw.status || 'ready';
    var tabs = (aw.queue || [])
      .map(function (id) {
        var a = findArtifact(store, threadId, id) || { id: id, title: id };
        return (
          '<button type="button" class="pm-art-tab' +
          (id === aw.artifactId ? ' is-active' : '') +
          '" data-artifact-switch="' +
          escapeHtml(id) +
          '">' +
          escapeHtml(a.title || id) +
          '</button>'
        );
      })
      .join('');
    var body = '';
    if (status === 'loading' || status === 'update') {
      /* `update` is the transient switch path only; `updated` is the completed receipt. */
      body =
        '<div class="pm-art-status" data-art-status="' +
        escapeHtml(status) +
        '">' +
        (status === 'loading' ? 'Loading artifact…' : 'Updating…') +
        '<span class="pm-q-dots" aria-hidden="true"><i></i><i></i><i></i><i></i></span></div>';
    } else if (status === 'updated') {
      body =
        '<div class="pm-art-status is-updated" data-art-status="updated">' +
        '<p class="pm-art-updated-receipt">Artifact updated</p>' +
        '<p class="pm-art-meta">' +
        escapeHtml(art.title || art.id || 'Artifact') +
        ' · content refreshed · ready to inspect</p></div>';
      var typUpdated = art.type || art.kind || 'document';
      if (typUpdated === 'multi_file_diff' || typUpdated === 'diff') {
        body +=
          '<div class="pm-art-diff" data-art-body>' +
          '<pre class="pm-art-pre">--- threads/provider-selector.js\n+++ threads/provider-selector.js\n@@ updated @@\n+export function accessProfile() { /* refreshed */ }</pre>' +
          '<p class="pm-art-meta">Updated diff · +12 −3</p></div>';
      } else if (typUpdated === 'visual_preview' || typUpdated === 'image') {
        body +=
          '<div class="pm-art-preview" data-art-body>' +
          '<div class="pm-art-preview-frame" role="img" aria-label="Updated preview"></div>' +
          '<p class="pm-art-meta">Preview refreshed</p></div>';
      } else if (typUpdated === 'test_report') {
        body +=
          '<div class="pm-art-report" data-art-body>' +
          '<ul><li>Pinned-history probe — pass</li><li>Updated interaction probe — pass</li></ul>' +
          '<p class="pm-art-meta">Report updated</p></div>';
      } else {
        body +=
          '<div class="pm-art-doc" data-art-body>' +
          '<h3>' +
          escapeHtml(art.title || 'Handoff') +
          '</h3>' +
          '<p>Latest revision applied. Thread-local state preserved; artifact queue unchanged.</p>' +
          '<p class="pm-art-meta">Updated handoff receipt</p></div>';
      }
    } else if (status === 'error') {
      body =
        '<div class="pm-art-status is-error" data-art-status="error">' +
        '<p>' +
        escapeHtml(aw.errorMessage || 'Failed to load artifact') +
        '</p>' +
        '<button type="button" class="pm-btn" data-artifact-retry="' +
        escapeHtml(art.id) +
        '">Retry</button></div>';
    } else {
      var typ = art.type || art.kind || 'document';
      if (typ === 'multi_file_diff' || typ === 'diff') {
        body =
          '<div class="pm-art-diff" data-art-body>' +
          '<pre class="pm-art-pre">--- threads/provider-selector.js\n+++ threads/provider-selector.js\n@@ -1,8 +1,18 @@\n+export function providerRail() { /* favorites + accounts */ }\n-export function yoloAccess() {}\n+export function accessProfile() { /* Ask / Auto edits / Auto / Full */ }</pre>' +
          '<p class="pm-art-meta">+92 −18 · threads/provider-selector.js</p></div>';
      } else if (typ === 'visual_preview' || typ === 'image') {
        body =
          '<div class="pm-art-preview" data-art-body>' +
          '<div class="pm-art-preview-frame" role="img" aria-label="Provider selector preview"></div>' +
          '<p class="pm-art-meta">Provider selector preview · visual</p></div>';
      } else if (typ === 'test_report') {
        body =
          '<div class="pm-art-report" data-art-body>' +
          '<ul><li>Pinned-history probe — pass</li><li>Question-flow probe — pass</li><li>Reduced motion — pass</li></ul>' +
          '<p class="pm-art-meta">Interaction verification report</p></div>';
      } else {
        body =
          '<div class="pm-art-doc" data-art-body>' +
          '<h3>' +
          escapeHtml(art.title || 'Handoff') +
          '</h3>' +
          '<p>Updated the provider selector and access flow, preserved thread-local state, verified responsive pinning, and produced four inspectable artifacts.</p>' +
          '<p class="pm-art-meta">Implementation impact handoff</p></div>';
      }
    }
    return (
      '<aside class="pm-artifact-workspace is-open' +
      (aw.closing ? ' is-closing' : '') +
      ' w-' +
      escapeHtml(windowId || 'w') +
      '" data-artifact-workspace data-art-status="' +
      escapeHtml(status) +
      '" aria-label="Artifact workspace">' +
      '<div class="pm-art-head">' +
      '<span class="pm-art-kicker">Artifacts</span>' +
      '<button type="button" class="pm-btn pm-btn-ghost pm-art-close" data-artifact-close aria-label="Close artifact">' +
      '×</button></div>' +
      '<div class="pm-art-tabs">' +
      tabs +
      '</div>' +
      '<div class="pm-art-scroll" data-artifact-scroll>' +
      body +
      '</div></aside>'
    );
  }

  function bindArtifactWorkspace(root, store, threadId, onChange) {
    if (!root || !store) return function () {};
    var scrollEl = artifactScrollEl(root);
    function onScroll() {
      var aw = getArtifactWorkspace(store);
      if (scrollEl) aw.scrollTop = scrollEl.scrollTop || 0;
    }
    if (scrollEl) {
      scrollEl.addEventListener('scroll', onScroll, { passive: true });
      restoreArtifactScroll(store, root);
    }
    function handler(ev) {
      var t = ev.target && ev.target.closest && ev.target.closest('[data-artifact-close], [data-artifact-switch], [data-artifact-retry]');
      if (!t || !root.contains(t)) return;
      if (t.hasAttribute('data-artifact-close')) {
        captureArtifactScroll(store, root);
        closeArtifactWorkspace(store);
        if (onChange) onChange();
        return;
      }
      var sw = t.getAttribute('data-artifact-switch');
      if (sw) {
        captureArtifactScroll(store, root);
        switchArtifact(store, threadId, sw);
        if (onChange) onChange();
        return;
      }
      var retry = t.getAttribute('data-artifact-retry');
      if (retry) {
        captureArtifactScroll(store, root);
        openArtifactWorkspace(store, threadId, retry, { status: 'loading' });
        if (onChange) onChange();
      }
    }
    root.addEventListener('click', handler);
    return function () {
      root.removeEventListener('click', handler);
      if (scrollEl) scrollEl.removeEventListener('scroll', onScroll);
    };
  }

  function compactWorkSummary(thread) {
    if (!thread) return null;
    var goal = thread.goal;
    var todos = thread.todos;
    var subs = thread.subagentGroups || [];
    var diffs = thread.diffGroups || [];
    var activity = thread.activity || [];
    var todoDone = 0;
    var todoTotal = 0;
    if (todos && Array.isArray(todos.items)) {
      todoTotal = todos.items.length;
      todos.items.forEach(function (it) {
        if (it && (it.status === 'completed' || it.done)) todoDone += 1;
      });
    }
    var agentsActive = 0;
    var agentsQueued = 0;
    var agentsBlocked = 0;
    subs.forEach(function (g) {
      (g.children || g.agents || []).forEach(function (a) {
        var st = (a && a.status) || '';
        if (st === 'running' || st === 'active') agentsActive += 1;
        else if (st === 'queued') agentsQueued += 1;
        else if (st === 'blocked' || st === 'failed') agentsBlocked += 1;
      });
    });
    var fileCount = 0;
    var add = 0;
    var del = 0;
    diffs.forEach(function (g) {
      (g.files || []).forEach(function (f) {
        fileCount += 1;
        add += Number(f.added != null ? f.added : f.additions || 0);
        del += Number(f.removed != null ? f.removed : f.deletions || 0);
      });
    });
    var phase =
      (goal && (goal.phase || goal.currentPhase || goal.status)) ||
      (activity.length ? activity[activity.length - 1].summary || activity[activity.length - 1].kind : '') ||
      '';
    return {
      goalPhase: phase,
      goalStatus: goal && goal.status,
      todoDone: todoDone,
      todoTotal: todoTotal,
      agentsActive: agentsActive,
      agentsQueued: agentsQueued,
      agentsBlocked: agentsBlocked,
      diffFiles: fileCount,
      diffAdd: add,
      diffDel: del,
      activityPhase: phase
    };
  }

  function renderCompactWorkBand(thread, paradigm) {
    var s = compactWorkSummary(thread);
    if (!s) return '';
    var has =
      (thread && thread.goal) ||
      (thread && thread.todos) ||
      (thread && thread.subagentGroups && thread.subagentGroups.length) ||
      (thread && thread.diffGroups && thread.diffGroups.length) ||
      (thread && thread.activity && thread.activity.length);
    if (!has) return '';
    paradigm = paradigm || 'default';

    /* Shared kind inventory — each paradigm forks presentation structure. */
    var kinds = [];
    if (thread.goal) {
      kinds.push({
        kind: 'goal',
        label: 'Goal',
        short: 'G',
        meta: String(s.goalPhase || s.goalStatus || 'Goal')
      });
    }
    if (s.todoTotal) {
      kinds.push({
        kind: 'todo',
        label: 'Todo',
        short: 'T',
        meta: s.todoDone + '/' + s.todoTotal
      });
    }
    if (s.agentsActive || s.agentsQueued || s.agentsBlocked) {
      kinds.push({
        kind: 'subagent',
        label: 'Agents',
        short: 'A',
        meta:
          s.agentsActive +
          ' run · ' +
          s.agentsQueued +
          ' q' +
          (s.agentsBlocked ? ' · ' + s.agentsBlocked + ' blk' : '')
      });
    }
    if (s.diffFiles) {
      kinds.push({
        kind: 'diff',
        label: 'Diff',
        short: '±',
        meta: s.diffFiles + ' · +' + s.diffAdd + ' −' + s.diffDel
      });
    }
    if (thread.activity && thread.activity.length) {
      kinds.push({
        kind: 'activity',
        label: 'Activity',
        short: 'Act',
        meta: String(s.activityPhase || thread.activity.length + ' tools')
      });
    }
    if (!kinds.length) return '';

    function wrap(inner, extraClass) {
      return (
        '<div class="pm-compact-work pm-cw-' +
        escapeHtml(paradigm) +
        (extraClass ? ' ' + extraClass : '') +
        '" data-compact-work data-cw-paradigm="' +
        escapeHtml(paradigm) +
        '" data-cw-single="' +
        (singleDetailParadigm(paradigm) ? '1' : '0') +
        '">' +
        inner +
        '<div class="pm-cw-detail" data-cw-detail hidden></div>' +
        '</div>'
      );
    }

    /* folio — roman leaf tabs (not pill chips) */
    if (paradigm === 'folio') {
      var leaves = kinds
        .map(function (k, i) {
          return (
            '<button type="button" class="pm-cw-leaf" data-cw-expand="' +
            escapeHtml(k.kind) +
            '" aria-pressed="false" title="' +
            escapeHtml(k.label) +
            '">' +
            '<span class="pm-cw-leaf-roman" aria-hidden="true">' +
            String(i + 1) +
            '</span>' +
            '<span class="pm-cw-leaf-title">' +
            escapeHtml(k.label) +
            '</span>' +
            '<span class="pm-cw-leaf-meta">' +
            escapeHtml(k.meta) +
            '</span>' +
            '</button>'
          );
        })
        .join('');
      return wrap(
        '<div class="pm-cw-folio-spine" data-cw-band aria-label="Folio index">' +
          '<span class="pm-cw-folio-kicker">Leaves</span>' +
          leaves +
          '</div>'
      );
    }

    /* beats — beat-attached numbered index chips along a mini spine */
    if (paradigm === 'beats') {
      var beatChips = kinds
        .map(function (k, i) {
          return (
            '<li class="pm-cw-beat-item">' +
            '<span class="pm-cw-beat-tick" aria-hidden="true">' +
            String(i + 1) +
            '</span>' +
            '<button type="button" class="pm-cw-beat-chip" data-cw-expand="' +
            escapeHtml(k.kind) +
            '" aria-pressed="false" title="' +
            escapeHtml(k.label + ' · ' + k.meta) +
            '">' +
            '<span class="pm-cw-beat-label">' +
            escapeHtml(k.label) +
            '</span>' +
            '<span class="pm-cw-beat-meta">' +
            escapeHtml(k.meta) +
            '</span>' +
            '</button>' +
            '</li>'
          );
        })
        .join('');
      return wrap(
        '<div class="pm-cw-beat-rail" data-cw-band aria-label="Beat-attached work">' +
          '<div class="pm-cw-beat-rail-label">On beat</div>' +
          '<ol class="pm-cw-beat-index">' +
          beatChips +
          '</ol>' +
          '</div>',
        'pm-cw-struct-beats'
      );
    }

    /* shelves — stub lips with reopen affordance */
    if (paradigm === 'shelves') {
      var stubs = kinds
        .map(function (k) {
          return (
            '<div class="pm-cw-shelf-stub" data-cw-stub="' +
            escapeHtml(k.kind) +
            '">' +
            '<span class="pm-cw-shelf-lip">' +
            '<span class="pm-cw-shelf-role">' +
            escapeHtml(k.label) +
            '</span>' +
            '<span class="pm-cw-shelf-meta">' +
            escapeHtml(k.meta) +
            '</span>' +
            '</span>' +
            '<button type="button" class="pm-cw-shelf-reopen" data-cw-expand="' +
            escapeHtml(k.kind) +
            '" aria-pressed="false">Reopen</button>' +
            '</div>'
          );
        })
        .join('');
      return wrap(
        '<div class="pm-cw-shelf-row" data-cw-band aria-label="Work shelf stubs">' +
          stubs +
          '</div>',
        'pm-cw-struct-shelves'
      );
    }

    /* yield — stacked yield tabs (restore-style) */
    if (paradigm === 'yield') {
      var ychips = kinds
        .map(function (k) {
          return (
            '<button type="button" class="pm-cw-yield-tab" data-cw-expand="' +
            escapeHtml(k.kind) +
            '" aria-pressed="false">' +
            '<span class="pm-cw-yield-title">' +
            escapeHtml(k.label) +
            '</span>' +
            '<span class="pm-cw-yield-meta">' +
            escapeHtml(k.meta) +
            '</span>' +
            '</button>'
          );
        })
        .join('');
      return wrap(
        '<div class="pm-cw-yield-rail" data-cw-band aria-label="Yielded work">' +
          ychips +
          '</div>',
        'pm-cw-struct-yield'
      );
    }

    /* condenser — vertical phase nodes (evolve-in-place index) */
    if (paradigm === 'condenser') {
      var nodes = kinds
        .map(function (k, i) {
          return (
            '<button type="button" class="pm-cw-condense-node" data-cw-expand="' +
            escapeHtml(k.kind) +
            '" data-cw-node-i="' +
            i +
            '" aria-pressed="false">' +
            '<span class="pm-cw-condense-dot" aria-hidden="true"></span>' +
            '<span class="pm-cw-condense-label">' +
            escapeHtml(k.label) +
            '</span>' +
            '<span class="pm-cw-condense-meta">' +
            escapeHtml(k.meta) +
            '</span>' +
            '</button>'
          );
        })
        .join('');
      return wrap(
        '<div class="pm-cw-condense-spine" data-cw-band aria-label="Condensed work index">' +
          '<div class="pm-cw-condense-track" aria-hidden="true"></div>' +
          nodes +
          '</div>',
        'pm-cw-struct-condenser'
      );
    }

    /* margin — lettered sidecar ticks */
    if (paradigm === 'margin') {
      var LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      var ticks = kinds
        .map(function (k, i) {
          var letter = LETTERS.charAt(i % 26);
          return (
            '<button type="button" class="pm-cw-margin-tick" data-cw-expand="' +
            escapeHtml(k.kind) +
            '" aria-pressed="false" title="' +
            escapeHtml(k.label + ' · ' + k.meta) +
            '">' +
            '<span class="pm-cw-margin-letter">' +
            letter +
            '</span>' +
            '<span class="pm-cw-margin-kind">' +
            escapeHtml(k.short) +
            '</span>' +
            '<span class="pm-cw-margin-snip">' +
            escapeHtml(k.meta) +
            '</span>' +
            '</button>'
          );
        })
        .join('');
      return wrap(
        '<nav class="pm-cw-margin-sidecar" data-cw-band aria-label="Work margin index">' +
          '<div class="pm-cw-margin-head"><span>Mark</span><span>Work</span></div>' +
          ticks +
          '</nav>',
        'pm-cw-struct-margin'
      );
    }

    /* focus — filmstrip thumbs */
    if (paradigm === 'focus') {
      var thumbs = kinds
        .map(function (k, i) {
          return (
            '<button type="button" class="pm-cw-focus-thumb" data-cw-expand="' +
            escapeHtml(k.kind) +
            '" aria-pressed="false">' +
            '<span class="pm-cw-focus-n">' +
            String(i + 1) +
            '</span>' +
            '<span class="pm-cw-focus-title">' +
            escapeHtml(k.label) +
            '</span>' +
            '<span class="pm-cw-focus-meta">' +
            escapeHtml(k.meta) +
            '</span>' +
            '</button>'
          );
        })
        .join('');
      return wrap(
        '<div class="pm-cw-focus-film" data-cw-band aria-label="Work filmstrip">' +
          '<div class="pm-cw-focus-film-label">Work focus</div>' +
          '<div class="pm-cw-focus-row">' +
          thumbs +
          '</div>' +
          '</div>',
        'pm-cw-struct-focus'
      );
    }

    /* breath — inhale (plan) / exhale (output) paired lanes */
    if (paradigm === 'breath') {
      var inhaleKinds = kinds.filter(function (k) {
        return k.kind === 'goal' || k.kind === 'todo';
      });
      var exhaleKinds = kinds.filter(function (k) {
        return k.kind !== 'goal' && k.kind !== 'todo';
      });
      function breathBtns(list, side) {
        if (!list.length) {
          return (
            '<div class="pm-cw-breath-empty">No ' +
            (side === 'inhale' ? 'plan' : 'output') +
            ' work</div>'
          );
        }
        return list
          .map(function (k) {
            return (
              '<button type="button" class="pm-cw-breath-chip pm-cw-breath-' +
              side +
              '-chip" data-cw-expand="' +
              escapeHtml(k.kind) +
              '" aria-pressed="false">' +
              '<span class="pm-cw-breath-label">' +
              escapeHtml(k.label) +
              '</span>' +
              '<span class="pm-cw-breath-meta">' +
              escapeHtml(k.meta) +
              '</span>' +
              '</button>'
            );
          })
          .join('');
      }
      return wrap(
        '<div class="pm-cw-breath-pair" data-cw-band aria-label="Paired work lanes">' +
          '<div class="pm-cw-breath-inhale" data-side="inhale">' +
          '<div class="pm-cw-breath-tag">Inhale · Plan</div>' +
          breathBtns(inhaleKinds, 'inhale') +
          '</div>' +
          '<div class="pm-cw-breath-gutter" aria-hidden="true"></div>' +
          '<div class="pm-cw-breath-exhale" data-side="exhale">' +
          '<div class="pm-cw-breath-tag">Exhale · Output</div>' +
          breathBtns(exhaleKinds, 'exhale') +
          '</div>' +
          '</div>',
        'pm-cw-struct-breath'
      );
    }

    /* default — generic chip band (fallback only) */
    var chips = kinds
      .map(function (k) {
        return (
          '<button type="button" class="pm-cw-chip" data-cw-expand="' +
          escapeHtml(k.kind) +
          '" title="' +
          escapeHtml(k.label) +
          '">' +
          escapeHtml(k.short) +
          ' · ' +
          escapeHtml(k.meta) +
          '</button>'
        );
      })
      .join('');
    return wrap('<div class="pm-cw-band" data-cw-band>' + chips + '</div>');
  }

function singleDetailParadigm(paradigm) {
    return /^(folio|yield|condenser|breath)$/.test(String(paradigm || ''));
  }

  var CONCEPT_PARADIGMS = {
    t1: 'folio',
    t2: 'beats',
    t3: 'shelves',
    t4: 'yield',
    t5: 'condenser',
    t6: 'margin',
    t7: 'focus',
    t8: 'breath'
  };

  function paradigmForConcept(conceptId) {
    var cid =
      conceptId ||
      (typeof document !== 'undefined' &&
        document.documentElement.getAttribute('data-concept-thread')) ||
      't1';
    return CONCEPT_PARADIGMS[cid] || 'default';
  }

  /** Expand/collapse compact-work chip → work-detail stack + inline detail pane. */
  function activateCompactWorkChip(root, chip) {
    if (!root || !chip) return false;
    var kind = chip.getAttribute('data-cw-expand');
    var band = chip.closest('[data-compact-work]');
    if (!band || !kind) return false;
    var detail = band.querySelector('[data-cw-detail]');
    var stack = root.querySelector('[data-work-detail-stack]');
    var single = band.getAttribute('data-cw-single') === '1';
    var wasActive = chip.classList.contains('is-active');
    Array.prototype.forEach.call(band.querySelectorAll('[data-cw-expand]'), function (c) {
      c.classList.remove('is-active');
      c.setAttribute('aria-pressed', 'false');
    });
    function kindMatches(elKind) {
      if (!elKind) return false;
      if (elKind === kind) return true;
      if (kind === 'subagent' && (elKind === 'subagents' || elKind === 'subagent')) return true;
      if (kind === 'diff' && (elKind === 'diffs' || elKind === 'diff')) return true;
      if (kind === 'activity' && elKind === 'activity') return true;
      return false;
    }
    function toggleDetails(container) {
      var matched = [];
      if (!container) return matched;
      Array.prototype.forEach.call(
        container.querySelectorAll('details[data-kind], details[data-folio-key]'),
        function (d) {
          var dk = d.getAttribute('data-kind') || d.getAttribute('data-folio-key');
          var match = kindMatches(dk);
          if (single) {
            d.open = match;
          } else if (match) {
            d.open = true;
          }
          if (match) matched.push(d);
        }
      );
      return matched;
    }
    if (wasActive) {
      if (detail && !detail.hasAttribute('hidden')) {
        var reduced =
          window.PMChatMotion && typeof window.PMChatMotion.isReduced === 'function'
            ? window.PMChatMotion.isReduced()
            : false;
        if (reduced) {
          detail.classList.remove('is-collapsing');
          detail.innerHTML = '';
          detail.setAttribute('hidden', '');
        } else {
          detail.classList.add('is-collapsing');
          window.setTimeout(function () {
            if (!detail.isConnected) return;
            detail.classList.remove('is-collapsing');
            detail.innerHTML = '';
            detail.setAttribute('hidden', '');
          }, 180);
        }
      } else if (detail) {
        detail.innerHTML = '';
        detail.setAttribute('hidden', '');
      }
      toggleDetails(stack);
      toggleDetails(root.querySelector('[data-surfaces]'));
      Array.prototype.forEach.call(
        root.querySelectorAll('details[data-kind], details[data-folio-key]'),
        function (d) {
          d.open = false;
        }
      );
      return true;
    }
    chip.classList.add('is-active');
    chip.setAttribute('aria-pressed', 'true');
    var matched = toggleDetails(stack);
    if (!matched.length) matched = toggleDetails(root.querySelector('[data-surfaces]'));
    if (!matched.length) {
      matched = [];
      Array.prototype.forEach.call(
        root.querySelectorAll('details[data-kind], details[data-folio-key]'),
        function (d) {
          var dk = d.getAttribute('data-kind') || d.getAttribute('data-folio-key');
          if (kindMatches(dk)) {
            d.open = true;
            matched.push(d);
          } else if (single) {
            d.open = false;
          }
        }
      );
    }
    if (matched[0] && typeof matched[0].scrollIntoView === 'function') {
      matched[0].scrollIntoView({ block: 'nearest', behavior: 'auto' });
    }
    if (detail) {
      if (matched[0]) {
        var body =
          matched[0].querySelector('.pm-work-surface-body, .t1-folio-page, .t4-sheet-body') ||
          matched[0];
        var title =
          matched[0].querySelector('.pm-work-surface-title, .t1-folio-title, .t4-sheet-title') ||
          matched[0];
        detail.innerHTML =
          '<div class="pm-cw-detail-head">' +
          escapeHtml((title && title.textContent) || kind) +
          '</div>' +
          (body ? body.innerHTML : matched[0].innerHTML);
        detail.removeAttribute('hidden');
      } else {
        detail.innerHTML =
          '<div class="pm-cw-detail-empty">No ' + escapeHtml(kind) + ' surface on this thread.</div>';
        detail.removeAttribute('hidden');
      }
    }
    return true;
  }

  /* Passive spellcheck: underline + context menu, no toolbar button */
  var SPELL_DEMO = {
    tehre: 'there',
    recieve: 'receive',
    seperate: 'separate',
    occured: 'occurred',
    definately: 'definitely'
  };
  var spellIgnoreOnce = Object.create(null);
  var spellIgnoreDraft = Object.create(null);
  var spellDictPersonal = Object.create(null);
  var spellDictProject = Object.create(null);

  function spellIsSuppressed(key) {
    return Boolean(
      spellIgnoreOnce[key] ||
      spellIgnoreDraft[key] ||
      spellDictPersonal[key] ||
      spellDictProject[key]
    );
  }

  function applyPassiveSpellcheck(textarea) {
    if (!textarea || textarea.getAttribute('data-spell-bound')) return;
    textarea.setAttribute('data-spell-bound', '1');
    textarea.setAttribute('spellcheck', 'true');
    /* Browser underline simulates Slint-portable service */
    textarea.addEventListener('contextmenu', function (ev) {
      var val = textarea.value || '';
      var start = textarea.selectionStart | 0;
      var end = textarea.selectionEnd | 0;
      var word = '';
      if (start !== end) {
        word = val.slice(start, end);
      } else {
        var left = val.slice(0, start).search(/\S+$/);
        var right = val.slice(start).search(/\s/);
        if (left < 0) left = start;
        if (right < 0) right = val.length - start;
        word = val.slice(left, start + right);
        start = left;
        end = start + word.length;
      }
      /* Skip code-ish tokens / paths */
      if (/[/\\.`]|^\w+\.\w+/.test(word) || word.indexOf('_') >= 0) return;
      var key = String(word).toLowerCase().replace(/[^a-z']/g, '');
      if (!SPELL_DEMO[key] || spellIsSuppressed(key)) return;
      ev.preventDefault();
      var menu = document.createElement('div');
      menu.className = 'pm-spell-menu';
      menu.setAttribute('role', 'menu');
      menu.innerHTML =
        '<button type="button" role="menuitem" data-spell-act="replace">' +
        escapeHtml(SPELL_DEMO[key]) +
        '</button>' +
        '<button type="button" role="menuitem" data-spell-act="ignore">Ignore once</button>' +
        '<button type="button" role="menuitem" data-spell-act="ignore-draft">Ignore for draft</button>' +
        '<button type="button" role="menuitem" data-spell-act="dict-personal">Add to personal dictionary</button>' +
        '<button type="button" role="menuitem" data-spell-act="dict-project">Add to project dictionary</button>';
      menu.style.left = ev.clientX + 'px';
      menu.style.top = ev.clientY + 'px';
      document.body.appendChild(menu);
      function close() {
        if (menu.parentNode) menu.remove();
        document.removeEventListener('click', close);
      }
      menu.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-spell-act]');
        if (!btn) return;
        var act = btn.getAttribute('data-spell-act');
        if (act === 'replace') {
          textarea.value = val.slice(0, start) + SPELL_DEMO[key] + val.slice(end);
          textarea.dispatchEvent(new Event('input', { bubbles: true }));
        } else if (act === 'ignore') {
          spellIgnoreOnce[key] = true;
        } else if (act === 'ignore-draft') {
          spellIgnoreDraft[key] = true;
        } else if (act === 'dict-personal') {
          spellDictPersonal[key] = true;
        } else if (act === 'dict-project') {
          spellDictProject[key] = true;
        }
        close();
      });
      setTimeout(function () {
        document.addEventListener('click', close);
      }, 0);
    });
    textarea.addEventListener('input', function () {
      /* Draft clear resets ignore-for-draft when empty */
      if (!(textarea.value || '').trim()) {
        Object.keys(spellIgnoreDraft).forEach(function (k) {
          delete spellIgnoreDraft[k];
        });
      }
    });
  }

  function liveChromeSession(store) {
    var session = (store && store.session) || {};
    var local = store && typeof store.getActiveLocal === 'function' ? store.getActiveLocal() : null;
    if (!local) return session;
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
      bsd: local.bsd || session.bsd,
      effectiveModelId: session.effectiveModelId != null ? session.effectiveModelId : null,
      accessLimitedBy: session.accessLimitedBy != null ? session.accessLimitedBy : null
    });
  }

  function accessTriggerLabel(store) {
    var session = liveChromeSession(store);
    var value = session.accessProfile || 'ask';
    var label = value;
    for (var i = 0; i < ACCESS_PROFILES.length; i++) {
      if (ACCESS_PROFILES[i].value === value) {
        label = ACCESS_PROFILES[i].label;
        break;
      }
    }
    if (session.accessLimitedBy) {
      return label + ' · Limited by ' + String(session.accessLimitedBy);
    }
    return label;
  }

  window.PMChatV2 = {
    HISTORY_MODES: HISTORY_MODES,
    ACCESS_PROFILES: ACCESS_PROFILES,
    liveChromeSession: liveChromeSession,
    accessTriggerLabel: accessTriggerLabel,
    SPEED_OPTIONS: SPEED_OPTIONS,
    MIN_CHAT_FLOOR: MIN_CHAT_FLOOR,
    CONCEPT_PARADIGMS: CONCEPT_PARADIGMS,
    historyMode: historyMode,
    isHistoryPinned: isHistoryPinned,
    isHistoryOpen: isHistoryOpen,
    isHistoryPeek: isHistoryPeek,
    resolveHistoryModeForWidth: resolveHistoryModeForWidth,
    setHistoryMode: setHistoryMode,
    cyclePin: cyclePin,
    getArtifactWorkspace: getArtifactWorkspace,
    captureArtifactScroll: captureArtifactScroll,
    restoreArtifactScroll: restoreArtifactScroll,
    openArtifactWorkspace: openArtifactWorkspace,
    closeArtifactWorkspace: closeArtifactWorkspace,
    switchArtifact: switchArtifact,
    renderArtifactWorkspaceHtml: renderArtifactWorkspaceHtml,
    bindArtifactWorkspace: bindArtifactWorkspace,
    compactWorkSummary: compactWorkSummary,
    renderCompactWorkBand: renderCompactWorkBand,
    activateCompactWorkChip: activateCompactWorkChip,
    paradigmForConcept: paradigmForConcept,
    applyPassiveSpellcheck: applyPassiveSpellcheck,
    syncChipLabel: syncChipLabel,
    SYNC_CHIP_LABELS: SYNC_CHIP_LABELS,
    renderAttachmentResolverCard: renderAttachmentResolverCard,
    renderCapacityForecast: renderCapacityForecast,
    assertPinInvariants: assertPinInvariants,
    confirmBulkPersonaApply: confirmBulkPersonaApply,
    escapeHtml: escapeHtml
  };
})();
