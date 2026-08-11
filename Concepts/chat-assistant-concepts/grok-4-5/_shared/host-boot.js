/* Composition host boot — mounts shell + WindowModule + ThreadModule. */
(function () {
  'use strict';

  var MODEL =
    (window.PMChatLabels && window.PMChatLabels.MODEL) || 'Grok 4.5';
  var WINDOW_IDS = ['w1', 'w2', 'w3', 'w4', 'w5', 'w6', 'w7', 'w8'];
  var THREAD_IDS = ['t1', 't2', 't3', 't4', 't5', 't6', 't7', 't8'];
  var THEMES = [
    'friendly-dark',
    'friendly-light',
    'retro-dark',
    'retro-light',
    'basic-light',
    'basic-dark',
    'glass-dark',
    'glass-light'
  ];
  var STORE_PERSIST_KEY = 'pm.chat.grok45.store';
  var PERSIST_INTERVAL_MS = 2500;

  var state = {
    booted: false,
    windowId: 'w6',
    threadId: 't1',
    mountMode: 'docked',
    theme: 'friendly-dark',
    chatWidthPx: 750,
    railOpen: true,
    reducedMotion: false,
    store: null,
    shell: null,
    windowHandle: null,
    threadHandle: null,
    unsub: null,
    toastEl: null,
    persistTimer: null
  };

  function qs() {
    try {
      return new URLSearchParams(window.location.search || '');
    } catch (_) {
      return new URLSearchParams();
    }
  }

  function parseQuery(opts) {
    var q = qs();
    var o = opts || {};
    var w = o.windowId || q.get('w') || 'w6';
    var t = o.threadId || q.get('t') || 't1';
    var mount = o.mountMode || q.get('mount') || 'docked';
    var theme = q.get('theme');
    if (!theme) {
      try {
        theme = localStorage.getItem('pm.theme');
      } catch (_) {
        theme = null;
      }
    }
    if (!theme) theme = 'friendly-dark';
    var width = q.get('width');
    var rail = q.get('rail');
    var rm = q.get('rm');

    /* Alias bare digits: w=1 → w1, t=2 → t2 (avoid silent fallback to w6). */
    if (WINDOW_IDS.indexOf(w) < 0 && /^\d+$/.test(String(w))) w = 'w' + w;
    if (THREAD_IDS.indexOf(t) < 0 && /^\d+$/.test(String(t))) t = 't' + t;
    if (WINDOW_IDS.indexOf(w) < 0) w = 'w6';
    if (THREAD_IDS.indexOf(t) < 0) t = 't1';
    if (mount !== 'popout') mount = 'docked';
    if (THEMES.indexOf(theme) < 0) theme = 'friendly-dark';

    var chatWidthPx = 750;
    if (width != null && width !== '') {
      var n = Number(width);
      if (isFinite(n)) chatWidthPx = Math.max(520, Math.min(1200, n));
    }

    var railOpen = rail == null || rail === '' ? true : rail === '1' || rail === 'open' || rail === 'true';
    var reducedMotion =
      rm === '1' ||
      rm === 'true' ||
      (function () {
        try {
          return localStorage.getItem('pm.reducedMotion') === '1';
        } catch (_) {
          return false;
        }
      })() ||
      (window.PMChatMotion && window.PMChatMotion.isReduced && window.PMChatMotion.isReduced());

    return {
      windowId: w,
      threadId: t,
      mountMode: mount,
      theme: theme,
      chatWidthPx: chatWidthPx,
      railOpen: railOpen,
      reducedMotion: !!reducedMotion,
      restore: q.get('restore') === '1'
    };
  }

  function dismissMenus() {
    if (window.PMMenu && typeof window.PMMenu.closeAll === 'function') {
      try {
        window.PMMenu.closeAll(true);
      } catch (err) {
        console.error('PMMenu.closeAll', err);
      }
    }
  }

  function chatTier(px) {
    var n = Number(px) || 750;
    if (n <= 560) return 'min';
    if (n <= 800) return 'mid';
    if (n <= 1000) return 'wider';
    return 'wide';
  }

  function applyChatTier(px) {
    var tier = chatTier(px);
    document.documentElement.setAttribute('data-chat-tier', tier);
    document.documentElement.setAttribute('data-chat-width', String(Math.round(px)));
    var shell = document.querySelector('.pm-shell');
    if (shell) {
      shell.setAttribute('data-chat-tier', tier);
      shell.setAttribute('data-chat-width', String(Math.round(px)));
    }
  }

  function persistStore() {
    try {
      if (!state.store || typeof state.store.serializeState !== 'function') return;
      sessionStorage.setItem(STORE_PERSIST_KEY, JSON.stringify(state.store.serializeState()));
    } catch (_) {
      /* quota / private mode */
    }
  }

  function tryRestorePersisted(store, wantRestore) {
    if (!wantRestore || !store || typeof store.restoreState !== 'function') return false;
    try {
      var raw = sessionStorage.getItem(STORE_PERSIST_KEY);
      if (!raw) return false;
      var snap = JSON.parse(raw);
      return !!store.restoreState(snap);
    } catch (err) {
      console.warn('PMChatHost: restore failed', err);
      return false;
    }
  }

  function ensureToastHost() {
    if (state.toastEl) return state.toastEl;
    var el = document.createElement('div');
    el.className = 'pm-host-toast';
    el.setAttribute('aria-live', 'polite');
    el.hidden = true;
    document.body.appendChild(el);
    state.toastEl = el;
    return el;
  }

  function toast(msg) {
    if (!msg) {
      if (state.toastEl) {
        state.toastEl.hidden = true;
        state.toastEl.textContent = '';
      }
      return;
    }
    if (window.PMChatMotion && typeof window.PMChatMotion.toast === 'function') {
      window.PMChatMotion.toast(msg, 2400);
      return;
    }
    var el = ensureToastHost();
    el.textContent = String(msg || '');
    el.hidden = false;
    el.classList.remove('is-leaving');
    void el.offsetWidth;
    el.classList.add('pm-toast-in');
    clearTimeout(el._pmToastTimer);
    el._pmToastTimer = setTimeout(function () {
      el.classList.add('is-leaving');
      setTimeout(function () {
        el.hidden = true;
        el.textContent = '';
        el.classList.remove('is-leaving', 'pm-toast-in');
      }, 180);
    }, 2400);
  }

  function crewHumanLabel(id) {
    var key = String(id == null ? '' : id);
    if (!key) return 'No Crew';
    if (key === 'review-wave') return 'Review wave';
    if (key === 'research-pair') return 'Research pair';
    if (key === 'synth-only') return 'Synthesis only';
    return key
      .split(/[-_]+/)
      .filter(Boolean)
      .map(function (p) {
        return p.charAt(0).toUpperCase() + p.slice(1);
      })
      .join(' ');
  }

  function seedCrewWaves(crewId) {
    if (!crewId) return [];
    if (crewId === 'review-wave') {
      return [
        { id: 'w1', label: 'Review', state: 'queued' },
        { id: 'w2', label: 'Pair research', state: 'queued' }
      ];
    }
    if (crewId === 'research-pair') {
      return [
        { id: 'w1', label: 'Research A', state: 'running' },
        { id: 'w2', label: 'Research B', state: 'queued' }
      ];
    }
    if (crewId === 'synth-only') {
      return [{ id: 'w1', label: 'Synthesis', state: 'queued' }];
    }
    return [{ id: 'w1', label: crewHumanLabel(crewId), state: 'queued' }];
  }

  function applyCrewSelection(store, val, toastFn) {
    if (!store || !store.session) return;
    if (!val) {
      store.session.crew = {
        requested: null,
        effective: null,
        reason: null,
        waves: []
      };
      store.session.crewConfirmOpen = false;
      store.session.crewPendingConfirm = null;
      if (store._emit) store._emit();
      return;
    }
    var effective = val === 'review-wave' ? 'research-pair' : val;
    var reason =
      val === 'review-wave'
        ? 'Adaptive route · capacity prefers Research pair for this turn'
        : null;
    store.session.crew = {
      requested: val,
      effective: effective,
      reason: reason,
      waves: seedCrewWaves(val)
    };
    store.session.crewConfirmOpen = false;
    store.session.crewPendingConfirm = null;
    if (store._emit) store._emit();
  }

  function requestCrewConfirmOrApply(store, val, toastFn) {
    if (!store || !store.session) return;
    if (!val) {
      store.setSelector('crewId', null);
      applyCrewSelection(store, null, toastFn);
      return;
    }
    if (!store.session.crewDefaultPrompted) {
      store.session.crewPendingConfirm = val;
      store.session.crewConfirmOpen = true;
      /* Keep prior crewId until confirmed */
      if (store._emit) store._emit();
      return;
    }
    store.setSelector('crewId', val);
    applyCrewSelection(store, val, toastFn);
  }

  function resolveCrewConfirm(store, accepted, toastFn) {
    if (!store || !store.session) return;
    var pending = store.session.crewPendingConfirm;
    store.session.crewDefaultPrompted = true;
    store.session.crewConfirmOpen = false;
    store.session.crewPendingConfirm = null;
    if (accepted && pending) {
      store.setSelector('crewId', pending);
      applyCrewSelection(store, pending, toastFn);
      if (typeof toastFn === 'function') toastFn('Default Crew · enabled for this session');
    } else {
      if (typeof toastFn === 'function') toastFn('Default Crew · cancelled');
      if (store._emit) store._emit();
    }
  }

  function buildEnv() {
    return {
      modelLabel: MODEL,
      theme: state.theme,
      reducedMotion: state.reducedMotion,
      chatWidthPx: state.chatWidthPx,
      railOpen: state.railOpen,
      mountMode: state.mountMode,
      windowId: state.windowId,
      threadId: state.threadId,
      store: state.store,
      emit: emit,
      toast: toast
    };
  }

  function activeStage() {
    if (!state.shell) return null;
    return state.mountMode === 'popout'
      ? state.shell.getPopoutStage()
      : state.shell.getDockedStage();
  }

  function unmountPair() {
    dismissMenus();
    if (state.threadHandle && typeof state.threadHandle.unmount === 'function') {
      try {
        state.threadHandle.unmount();
      } catch (err) {
        console.error('thread unmount', err);
      }
    }
    state.threadHandle = null;
    if (state.windowHandle && typeof state.windowHandle.unmount === 'function') {
      try {
        state.windowHandle.unmount();
      } catch (err) {
        console.error('window unmount', err);
      }
    }
    state.windowHandle = null;
    var stage = activeStage();
    if (stage) stage.innerHTML = '';
  }

  function mountPair() {
    var stage = activeStage();
    if (!stage) throw new Error('PMChatHost: no stage');
    var winMod =
      (window.PMChatRegistry && window.PMChatRegistry.getWindow(state.windowId)) ||
      (window.PMChatWindows && window.PMChatWindows[state.windowId]);
    var thrMod =
      (window.PMChatRegistry && window.PMChatRegistry.getThread(state.threadId)) ||
      (window.PMChatThreads && window.PMChatThreads[state.threadId]);
    if (!winMod || typeof winMod.mount !== 'function') {
      throw new Error('Missing window module: ' + state.windowId);
    }
    if (!thrMod || typeof thrMod.mount !== 'function') {
      throw new Error('Missing thread module: ' + state.threadId);
    }

    document.documentElement.setAttribute('data-concept-thread', state.threadId);
    document.documentElement.setAttribute('data-concept-window', state.windowId);

    var env = buildEnv();
    var threadSlotEl = document.createElement('div');
    threadSlotEl.className = 'pm-thread-slot';

    state.windowHandle = winMod.mount(stage, {
      env: env,
      threadSlotEl: threadSlotEl,
      onRequestPopout: function () {
        setMountMode('popout');
      },
      onRequestDock: function () {
        setMountMode('docked');
      },
      onRequestClose: function () {
        if (state.mountMode === 'popout') {
          setMountMode('docked');
          toast('Docked · popout closed');
        } else {
          toast('Close is demo-only in docked mode');
        }
      }
    });

    if (!threadSlotEl.isConnected) {
      /* Window must place threadSlotEl; fall back if it forgot. */
      var root = stage.querySelector('.pm-chat-root') || stage;
      root.appendChild(threadSlotEl);
    }

    state.threadHandle = thrMod.mount(threadSlotEl, {
      env: env,
      contentWidthPx: state.chatWidthPx
    });

    requestAnimationFrame(function () {
      if (window.PMChatMotion && typeof window.PMChatMotion.refresh === 'function') {
        window.PMChatMotion.refresh(stage);
      }
    });
  }

  function remountPair(opts) {
    opts = opts || {};
    dismissMenus();
    var snap =
      opts.serialize && state.store && typeof state.store.serializeState === 'function'
        ? state.store.serializeState()
        : null;
    unmountPair();
    if (snap && state.store && typeof state.store.restoreState === 'function') {
      state.store.restoreState(snap);
    }
    mountPair();
    if (state.threadHandle && typeof state.threadHandle.restoreScrollAnchor === 'function') {
      state.threadHandle.restoreScrollAnchor();
    }
  }

  function softRefresh() {
    var env = buildEnv();
    if (state.windowHandle && typeof state.windowHandle.update === 'function') {
      state.windowHandle.update({ env: env });
    }
    if (state.threadHandle && typeof state.threadHandle.update === 'function') {
      state.threadHandle.update({ env: env, contentWidthPx: state.chatWidthPx });
    }
    var store = state.store;
    if (
      store &&
      window.PMChatWindowKit &&
      typeof window.PMChatWindowKit.syncArtifactIntoBody === 'function'
    ) {
      var artRoot =
        (state.windowHandle &&
          typeof state.windowHandle.getOverlayRoot === 'function' &&
          state.windowHandle.getOverlayRoot()) ||
        document.querySelector('.pm-chat-root');
      if (artRoot) window.PMChatWindowKit.syncArtifactIntoBody(artRoot, store, env);
    }
    /* Session approval / warning cards */
    (function syncDecisionCards() {
      var stage = document.querySelector('[data-stage]') || document.querySelector('.pm-transcript');
      var host = stage && (stage.closest('.pm-chat-root') || document.querySelector('.pm-chat-root'));
      if (!host || !store || !store.session) return;
      var slot = host.querySelector('[data-session-cards]');
      if (!slot) {
        slot = document.createElement('div');
        slot.setAttribute('data-session-cards', '');
        slot.className = 'pm-session-cards';
        var dock = host.querySelector('[data-thread-dock]');
        if (dock && dock.parentNode) dock.parentNode.insertBefore(slot, dock);
        else host.appendChild(slot);
      }
      var html = '';
      var ap = store.session.approval;
      if (ap) {
        html +=
          '<div class="pm-approval-card" data-approval-card><div><strong>' +
          String(ap.question || 'Approve?') +
          '</strong></div><div>' +
          String(ap.reason || '') +
          '</div><div class="pm-appr-actions">' +
          '<button type="button" class="pm-btn" data-demo-family="decision" data-demo-event="deny">Deny</button>' +
          '<button type="button" class="pm-btn" data-demo-family="decision" data-demo-event="approve">Allow once</button>' +
          '<button type="button" class="pm-btn" data-appr-session>Allow for session</button>' +
          '</div><details><summary>Details</summary><pre>' +
          String(ap.details || '') +
          '</pre></details></div>';
      }
      var wn = store.session.warning;
      if (wn) {
        html +=
          '<div class="pm-warning-card" data-warning-card data-warn-tier="' +
          String(wn.tier || 'compact') +
          '"><div>' +
          String(wn.text || '') +
          '</div><div class="pm-warn-actions">' +
          (wn.choices || [])
            .map(function (c) {
              return '<button type="button" class="pm-btn pm-btn-ghost" data-warn-choice="' + String(c) + '">' + String(c) + '</button>';
            })
            .join('') +
          '</div></div>';
      }
      var cn = store.session.compactNow;
      if (cn && cn.status && cn.status !== 'idle') {
        html +=
          '<div class="pm-warning-card" data-compact-now><div><strong>Compact Now · ' +
          String(cn.status) +
          '</strong>' +
          (cn.status === 'running' ? '…' : '') +
          '</div>';
        if (cn.included || cn.leftOut) {
          html +=
            '<div class="pm-lens-breakdown" data-lens-breakdown>' +
            '<div class="pm-lens-included"><span class="pm-lens-kicker">Included</span><ul>' +
            (cn.included || [])
              .map(function (x) {
                return '<li>' + String(x).replace(/</g, '&lt;') + '</li>';
              })
              .join('') +
            '</ul></div>' +
            '<div class="pm-lens-leftout"><span class="pm-lens-kicker">Left out</span><ul>' +
            (cn.leftOut || [])
              .map(function (x) {
                return '<li>' + String(x).replace(/</g, '&lt;') + '</li>';
              })
              .join('') +
            '</ul></div></div>';
        }
        html += '</div>';
      }
      var crew = store.session.crew;
      if (store.session.crewConfirmOpen && store.session.crewPendingConfirm) {
        html +=
          '<div class="pm-crew-confirm" data-crew-confirm role="dialog" aria-label="Use default Crew">' +
          '<div><strong>Use default Crew?</strong></div>' +
          '<p class="pm-crew-confirm-copy">Enable ' +
          crewHumanLabel(store.session.crewPendingConfirm) +
          ' for this session.</p>' +
          '<div class="pm-crew-confirm-actions">' +
          '<button type="button" class="pm-btn pm-btn-ghost" data-crew-confirm-no>Not now</button>' +
          '<button type="button" class="pm-btn" data-crew-confirm-yes>Use</button>' +
          '</div></div>';
      }
      if (crew && (crew.requested || crew.effective || (crew.waves && crew.waves.length) || store.session.crewId)) {
        var reqLabel = crewHumanLabel(crew.requested || store.session.crewId);
        var effLabel = crewHumanLabel(crew.effective || crew.requested || store.session.crewId);
        var mismatch = !!(crew.requested && crew.effective && crew.requested !== crew.effective);
        html +=
          '<div class="pm-crew-card" data-crew-card' +
          (mismatch ? ' data-crew-mismatch="1"' : '') +
          '><div class="pm-crew-card-head"><strong>Crew</strong>' +
          '<span class="pm-crew-meta">requested ' +
          reqLabel +
          ' · effective ' +
          effLabel +
          '</span></div>' +
          (mismatch && crew.reason
            ? '<p class="pm-crew-reason" data-crew-reason>' +
              String(crew.reason).replace(/</g, '&lt;') +
              '</p>'
            : '') +
          (crew.waves && crew.waves.length
            ? '<ul class="pm-crew-waves">' +
              crew.waves
                .map(function (w) {
                  return (
                    '<li><span class="pm-crew-wave-label">' +
                    String(w.label || w.id) +
                    '</span><span class="pm-crew-wave-state">' +
                    String(w.state || '') +
                    '</span></li>'
                  );
                })
                .join('') +
              '</ul>'
            : '<p class="pm-crew-empty">No active waves</p>') +
          '</div>';
      }
      if (store.session.threadModelOverride) {
        var ovLabel =
          (window.PMChatPopups &&
            typeof window.PMChatPopups.findLabel === 'function' &&
            window.PMChatPopups.findLabel('model', store.session.threadModelOverride)) ||
          String(store.session.threadModelOverride);
        html +=
          '<div class="pm-override-pill" data-override="thread-model-override" title="Thread model differs from session default">' +
          '<span class="pm-override-kicker">thread-model-override</span>' +
          '<span class="pm-override-value">' +
          String(ovLabel).replace(/</g, '&lt;') +
          '</span></div>';
      }
      var access = store.session.accessProfile;
      var mode = store.session.modeId;
      if (access === 'full' && (mode === 'review' || mode === 'plan')) {
        html +=
          '<div class="pm-warning-card" data-access-note>Full Access · Limited by ' +
          (mode === 'review' ? 'Review' : 'Plan') +
          ' mode</div>';
      }
      slot.innerHTML = html;
      slot.onclick = function (ev) {
        var confirmBtn = ev.target.closest('[data-crew-confirm-yes], [data-crew-confirm-no]');
        if (confirmBtn) {
          resolveCrewConfirm(store, confirmBtn.hasAttribute('data-crew-confirm-yes'), toast);
          softRefresh();
          return;
        }
        var b = ev.target.closest('[data-demo-family], [data-appr-session], [data-warn-choice]');
        if (!b) return;
        if (b.hasAttribute('data-appr-session') || b.getAttribute('data-demo-event') === 'approve') {
          store.session.approval = null;
          if (store._emit) store._emit();
          return;
        }
        if (b.getAttribute('data-demo-event') === 'deny') {
          store.session.approval = null;
          if (store._emit) store._emit();
          return;
        }
        if (b.hasAttribute('data-warn-choice')) {
          var choice = b.getAttribute('data-warn-choice') || '';
          if (/branch/i.test(choice) && store.branchThread) {
            store.branchThread(store.session.activeThreadKey);
          }
          store.session.warning = null;
          if (store._emit) store._emit();
        }
      };
    })();

    if (
      store &&
      store.search &&
      store.search.panelOpen &&
      window.PMChatWindowKit &&
      typeof window.PMChatWindowKit.syncSearchPanel === 'function'
    ) {
      var root =
        (state.windowHandle &&
          typeof state.windowHandle.getOverlayRoot === 'function' &&
          state.windowHandle.getOverlayRoot()) ||
        document.querySelector('.pm-chat-root');
      if (root) {
        window.PMChatWindowKit.syncSearchPanel(root, store, { open: true });
      }
    }
    requestAnimationFrame(function () {
      if (window.PMChatMotion && typeof window.PMChatMotion.refresh === 'function') {
        var stage = activeStage();
        window.PMChatMotion.refresh(stage || document);
      }
    });
  }

  function demoCreateThread() {
    var store = state.store;
    if (!store) return;
    var keys = Object.keys(store.threads || {});
    var id = 'thread-new-' + Date.now().toString(36);
    var now = new Date().toISOString();
    store.threads[id] = {
      id: id,
      title: 'New chat',
      pinned: false,
      archived: false,
      state: null,
      tags: [],
      project: null,
      updatedAt: now,
      messages: [],
      draft: { text: '', attachments: [], updatedAt: null },
      draftRevisions: [],
      lens: {
        mode: 'off',
        selectionIds: [],
        mutedIds: [],
        focusedIds: [],
        subcompacts: []
      },
      goal: null,
      todos: null,
      subagentGroups: [],
      diffGroups: [],
      activity: [],
      questionnaires: [],
      artifacts: [],
      browserSessions: [],
      scriptedReplyIds: [],
      scriptedReplyCursor: 0,
      initialVisibleMessageCount: 0
    };
    if (store.ui && store.ui.perThread) {
      store.ui.perThread[id] = {
        scrollAnchor: null,
        stickToBottom: true,
        expandedMessageIds: Object.create(null),
        expandedThoughtIds: Object.create(null),
        expandedSubagentIds: Object.create(null),
        goalExpanded: false,
        todoCollapsed: false,
        activityExpanded: false,
        threadHistoryQuery: ''
      };
    }
    if (store.demo) {
      store.demo.replyCursorByThread[id] = 0;
      store.demo.runningByThread[id] = null;
    }
    store.selectThread(id);
    persistStore();
    if (!keys.length) softRefresh();
  }

  function emit(event) {
    if (!event || !event.type || !state.store) return;
    var store = state.store;
    var tid = store.session && store.session.activeThreadKey;
    var type = event.type;

    switch (type) {
      case 'thread.select':
        if (event.threadKey) store.selectThread(event.threadKey);
        break;
      case 'thread.create':
        demoCreateThread();
        break;
      case 'composer.send':
        if (tid && window.PMChatComposer) {
          if (event.text != null) store.setDraft(tid, { text: String(event.text) });
          window.PMChatComposer.send(store, tid);
        }
        break;
      case 'composer.stop':
        if (tid && window.PMChatComposer) window.PMChatComposer.stop(store, tid);
        break;
      case 'search.query':
        if (window.PMChatSearch) {
          var scope = event.scope === 'all' ? 'all' : 'current';
          var results =
            event._fromUi && Array.isArray(event.results)
              ? event.results
              : window.PMChatSearch.run(store, event.query, scope);
          if (store.search) {
            store.search.results = results;
            store.search.panelOpen = true;
          }
          /* Prefer first hit as selection when UI didn't already set one. */
          if (
            results &&
            results.length &&
            store.search &&
            !store.search.selectedResultId
          ) {
            store.setSearch({
              selectedResultId: results[0].threadId + ':' + results[0].messageId
            });
          }
          var stageRoot =
            (state.windowHandle &&
              typeof state.windowHandle.getOverlayRoot === 'function' &&
              state.windowHandle.getOverlayRoot()) ||
            document.querySelector('.pm-chat-root');
          if (
            stageRoot &&
            window.PMChatWindowKit &&
            typeof window.PMChatWindowKit.syncSearchPanel === 'function'
          ) {
            window.PMChatWindowKit.syncSearchPanel(stageRoot, store, {
              open: true,
              results: results,
              query: event.query,
              scope: scope
            });
          }
        }
        break;
      case 'search.jump':
        if (window.PMChatSearch) {
          window.PMChatSearch.jumpTo(store, event.threadKey, event.messageId);
          if (store.search) store.search.panelOpen = false;
          var jumpRoot =
            (state.windowHandle &&
              typeof state.windowHandle.getOverlayRoot === 'function' &&
              state.windowHandle.getOverlayRoot()) ||
            document.querySelector('.pm-chat-root');
          if (
            jumpRoot &&
            window.PMChatWindowKit &&
            typeof window.PMChatWindowKit.closeSearchPanel === 'function'
          ) {
            window.PMChatWindowKit.closeSearchPanel(jumpRoot, store);
          }
        }
        break;
      case 'selector.change': {
        var map = {
          persona: 'personaId',
          model: 'modelId',
          mode: 'modeId',
          access: 'accessProfile',
          effort: 'effortId',
          speed: 'speedMode',
          crew: 'crewId',
          worktree: 'worktreeId'
        };
        var sk = map[event.key];
        if (sk) {
          var val = event.key === 'worktree' && event.value === '' ? null : event.value;
          if (event.key === 'crew') {
            requestCrewConfirmOrApply(store, val, toast);
            break;
          }
          store.setSelector(sk, val);
          if (event.key === 'model' && window.PMChatPopups && typeof window.PMChatPopups.bindModelRoute === 'function') {
            window.PMChatPopups.bindModelRoute(store, val);
            if (!store.session.defaultModelId) {
              store.session.defaultModelId = 'grok-4-5';
            }
            if (val && val !== store.session.defaultModelId) {
              store.session.threadModelOverride = val;
            } else {
              store.session.threadModelOverride = null;
            }
            if (store._emit) store._emit();
          }
        }
        break;
      }
      case 'lens.apply': {
        if (!tid || !event.op) break;
        /* Thread kit already applied Mute/Focus/Subcompact locally. */
        if (event._fromUi) break;
        var op = event.op;
        if (op.kind === 'mute' && window.PMChatLens) {
          if (op.ids) store.setLens(tid, { selectionIds: op.ids });
          var muteRes = window.PMChatLens.applyMute(store, tid);
          if (muteRes && muteRes.note && typeof toast === 'function') toast(muteRes.note);
        } else if (op.kind === 'focus' && window.PMChatLens) {
          if (op.ids) store.setLens(tid, { selectionIds: op.ids });
          var focusRes = window.PMChatLens.applyFocus(store, tid);
          if (focusRes && focusRes.note && typeof toast === 'function') toast(focusRes.note);
        } else if (op.kind === 'subcompact' && window.PMChatLens) {
          if (op.ids) store.setLens(tid, { selectionIds: op.ids });
          var subRes = window.PMChatLens.applySubcompact(store, tid, op.summary);
          if (subRes && subRes.note && typeof toast === 'function') toast(subRes.note);
          else if (subRes && !subRes.ok && typeof toast === 'function') {
            toast('Select messages before Subcompact');
          }
        } else if (op.kind === 'clear' && window.PMChatLens) {
          window.PMChatLens.turnOff(store, tid);
        } else if (op.kind === 'enter' && window.PMChatLens) {
          window.PMChatLens.enterSelection(store, tid);
        }
        break;
      }
      case 'mount.toggle':
        setMountMode(event.mode === 'popout' ? 'popout' : 'docked');
        break;
      case 'shell.rail':
        state.railOpen = !!event.open;
        if (state.shell) state.shell.setRailOpen(state.railOpen);
        softRefresh();
        break;
      case 'ui.local':
        if (event.kind === 'set-theme' && event.theme && state.shell) {
          state.theme = state.shell.updateTheme(event.theme);
        } else if (event.kind === 'reduced-motion' && state.shell) {
          state.reducedMotion = !!event.value;
          state.shell.setReducedMotion(state.reducedMotion);
        } else if (event.kind === 'open-editor-tab' && event.tab && state.shell && state.shell.openEditorTab) {
          state.shell.openEditorTab(event.tab);
        }
        softRefresh();
        break;
      default:
        break;
    }
  }

  function setPair(windowId, threadId) {
    var w = WINDOW_IDS.indexOf(windowId) >= 0 ? windowId : state.windowId;
    var t = THREAD_IDS.indexOf(threadId) >= 0 ? threadId : state.threadId;
    if (w === state.windowId && t === state.threadId && state.windowHandle) {
      softRefresh();
      return;
    }
    state.windowId = w;
    state.threadId = t;
    remountPair({ serialize: true });
  }

  function setMountMode(mode) {
    var next = mode === 'popout' ? 'popout' : 'docked';
    if (next === state.mountMode && state.windowHandle) {
      if (state.shell) state.shell.setMountMode(next);
      return;
    }
    dismissMenus();
    var snap =
      state.store && typeof state.store.serializeState === 'function'
        ? state.store.serializeState()
        : null;
    /* Unmount from the current stage before flipping mount mode
       (activeStage depends on state.mountMode). */
    unmountPair();
    state.mountMode = next;
    if (state.shell) state.shell.setMountMode(next);
    if (snap && state.store && typeof state.store.restoreState === 'function') {
      state.store.restoreState(snap);
    }
    mountPair();
    if (state.threadHandle && typeof state.threadHandle.restoreScrollAnchor === 'function') {
      state.threadHandle.restoreScrollAnchor();
    }
    softRefresh();
  }

  function getStore() {
    return state.store;
  }

  function getEnv() {
    return buildEnv();
  }

  function boot(opts) {
    if (state.booted) return;
    var parsed = parseQuery(opts || {});
    state.windowId = parsed.windowId;
    state.threadId = parsed.threadId;
    state.mountMode = parsed.mountMode;
    state.theme = parsed.theme;
    state.chatWidthPx = parsed.chatWidthPx;
    state.railOpen = parsed.railOpen;
    state.reducedMotion = parsed.reducedMotion;
    applyChatTier(state.chatWidthPx);

    var root = document.getElementById('shell-root');
    if (!root) throw new Error('PMChatHost.boot: #shell-root missing');

    if (window.PMChatMotion && typeof window.PMChatMotion.setReduced === 'function') {
      window.PMChatMotion.setReduced(state.reducedMotion);
    }

    return window.PMChatDemoLoader.load()
      .then(function (data) {
        state.store = window.PMChatStore.create(data);
        tryRestorePersisted(state.store, parsed.restore);

        state.shell = window.PMChatShell.mount(root, {
          env: {
            theme: state.theme,
            reducedMotion: state.reducedMotion,
            chatWidthPx: state.chatWidthPx,
            railOpen: state.railOpen,
            mountMode: state.mountMode,
            modelLabel: MODEL,
            toast: toast
          }
        });
        window.__pmShellHandle = state.shell;
        if (state.shell && typeof state.shell.setToast === 'function') {
          state.shell.setToast(toast);
        }
        if (state.shell && typeof state.shell.onThemeChange === 'function') {
          state.shell.onThemeChange(function (t) {
            state.theme = t;
          });
        }
        window.addEventListener('pm-set-theme', function (ev) {
          var t = ev && ev.detail && ev.detail.theme;
          if (t && state.shell) {
            state.theme = state.shell.updateTheme(t);
          }
        });

        mountPair();

        if (state.unsub) state.unsub();
        state.unsub = state.store.subscribe(function () {
          softRefresh();
          persistStore();
        });

        window.addEventListener('pm-request-window-paint', function () {
          softRefresh();
        });
        window.addEventListener('pm-artifact-workspace', function () {
          softRefresh();
        });

        if (window.PMChatDemoHarness && typeof window.PMChatDemoHarness.mount === 'function') {
          window.PMChatDemoHarness.mount({
            getStore: function () {
              return state.store;
            },
            getEnv: buildEnv,
            softRefresh: softRefresh,
            toast: toast
          });
        }

        if (state.persistTimer) clearInterval(state.persistTimer);
        state.persistTimer = setInterval(persistStore, PERSIST_INTERVAL_MS);
        persistStore();

        window.addEventListener('pagehide', persistStore);
        window.addEventListener('beforeunload', persistStore);

        window.__pmChatState = function () {
          return state.store && typeof state.store.getTestState === 'function'
            ? state.store.getTestState()
            : state.store && state.store.getSnapshot
              ? state.store.getSnapshot()
              : null;
        };

        if (window.PMChatBridge) {
          window.PMChatBridge.init({
            onTheme: function (p) {
              if (!p || !p.theme) return;
              state.theme = String(p.theme);
              if (state.shell) state.shell.updateTheme(state.theme);
              softRefresh();
            },
            onReducedMotion: function (p) {
              state.reducedMotion = !!(p && p.on);
              if (window.PMChatMotion && typeof window.PMChatMotion.setReduced === 'function') {
                window.PMChatMotion.setReduced(state.reducedMotion);
              }
              if (state.shell) state.shell.setReducedMotion(state.reducedMotion);
              softRefresh();
            },
            onChatWidth: function (p) {
              var px = p && p.px != null ? Number(p.px) : NaN;
              if (!isFinite(px)) return;
              state.chatWidthPx = Math.max(520, Math.min(1200, px));
              if (state.shell) state.shell.setChatWidth(state.chatWidthPx);
              applyChatTier(state.chatWidthPx);
              softRefresh();
            },
            onRail: function (p) {
              state.railOpen = !!(p && p.open);
              if (state.shell) state.shell.setRailOpen(state.railOpen);
              softRefresh();
            },
            onWindow: function (p) {
              if (p && p.id) setPair(p.id, state.threadId);
            },
            onThread: function (p) {
              if (p && p.id) setPair(state.windowId, p.id);
            },
            onMount: function (p) {
              if (p && p.mode) setMountMode(p.mode);
            },
            onPair: function (p) {
              if (!p) return;
              var w = p.windowId || state.windowId;
              var t = p.threadId || state.threadId;
              setPair(w, t);
            }
          });
          window.PMChatBridge.notifyReady();
        }

        state.booted = true;
      })
      .catch(function (err) {
        console.error('PMChatHost.boot failed', err);
        root.innerHTML =
          '<div class="pm-host-error">Failed to load demo data. Serve over http and retry.</div>';
        throw err;
      });
  }

  window.PMChatHost = {
    boot: boot,
    setPair: setPair,
    setMountMode: setMountMode,
    getStore: getStore,
    getEnv: getEnv,
    persistStore: persistStore
  };
})();
