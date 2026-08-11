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
    opts = opts || {};
    if (!store) return;
    var aw = getArtifactWorkspace(store);
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
    /* Resolve loading → ready unless forced */
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
      body =
        '<div class="pm-art-status" data-art-status="' +
        escapeHtml(status) +
        '">' +
        (status === 'loading' ? 'Loading artifact…' : 'Updating…') +
        '<span class="pm-q-dots" aria-hidden="true"><i></i><i></i><i></i><i></i></span></div>';
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
    function handler(ev) {
      var t = ev.target && ev.target.closest && ev.target.closest('[data-artifact-close], [data-artifact-switch], [data-artifact-retry]');
      if (!t || !root.contains(t)) return;
      if (t.hasAttribute('data-artifact-close')) {
        closeArtifactWorkspace(store);
        if (onChange) onChange();
        return;
      }
      var sw = t.getAttribute('data-artifact-switch');
      if (sw) {
        switchArtifact(store, threadId, sw);
        if (onChange) onChange();
        return;
      }
      var retry = t.getAttribute('data-artifact-retry');
      if (retry) {
        openArtifactWorkspace(store, threadId, retry, { status: 'loading' });
        if (onChange) onChange();
      }
    }
    root.addEventListener('click', handler);
    return function () {
      root.removeEventListener('click', handler);
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
    var chips = [];
    if (thread.goal) {
      chips.push(
        '<button type="button" class="pm-cw-chip" data-cw-expand="goal" title="Goal">' +
          'G · ' +
          escapeHtml(String(s.goalPhase || s.goalStatus || 'Goal')) +
          '</button>'
      );
    }
    if (s.todoTotal) {
      chips.push(
        '<button type="button" class="pm-cw-chip" data-cw-expand="todo" title="Todos">' +
          'T · ' +
          s.todoDone +
          '/' +
          s.todoTotal +
          '</button>'
      );
    }
    if (s.agentsActive || s.agentsQueued || s.agentsBlocked) {
      chips.push(
        '<button type="button" class="pm-cw-chip" data-cw-expand="subagent" title="Subagents">' +
          'A · ' +
          s.agentsActive +
          ' run · ' +
          s.agentsQueued +
          ' q' +
          (s.agentsBlocked ? ' · ' + s.agentsBlocked + ' blk' : '') +
          '</button>'
      );
    }
    if (s.diffFiles) {
      chips.push(
        '<button type="button" class="pm-cw-chip" data-cw-expand="diff" title="Diff">' +
          '± · ' +
          s.diffFiles +
          ' · +' +
          s.diffAdd +
          ' −' +
          s.diffDel +
          '</button>'
      );
    }
    if (thread.activity && thread.activity.length) {
      chips.push(
        '<button type="button" class="pm-cw-chip" data-cw-expand="activity" title="Activity">' +
          'Act · ' +
          escapeHtml(String(s.activityPhase || thread.activity.length + ' tools')) +
          '</button>'
      );
    }
    return (
      '<div class="pm-compact-work pm-cw-' +
      escapeHtml(paradigm) +
      '" data-compact-work data-cw-paradigm="' +
      escapeHtml(paradigm) +
      '" data-cw-single="' +
      (singleDetailParadigm(paradigm) ? '1' : '0') +
      '">' +
      '<div class="pm-cw-band" data-cw-band>' +
      chips.join('') +
      '</div>' +
      '<div class="pm-cw-detail" data-cw-detail hidden></div>' +
      '</div>'
    );
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
    Array.prototype.forEach.call(band.querySelectorAll('.pm-cw-chip'), function (c) {
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
    return !!(
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

  window.PMChatV2 = {
    HISTORY_MODES: HISTORY_MODES,
    ACCESS_PROFILES: ACCESS_PROFILES,
    SPEED_OPTIONS: SPEED_OPTIONS,
    MIN_CHAT_FLOOR: MIN_CHAT_FLOOR,
    CONCEPT_PARADIGMS: CONCEPT_PARADIGMS,
    historyMode: historyMode,
    isHistoryPinned: isHistoryPinned,
    isHistoryOpen: isHistoryOpen,
    resolveHistoryModeForWidth: resolveHistoryModeForWidth,
    setHistoryMode: setHistoryMode,
    cyclePin: cyclePin,
    getArtifactWorkspace: getArtifactWorkspace,
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
    escapeHtml: escapeHtml
  };
})();
