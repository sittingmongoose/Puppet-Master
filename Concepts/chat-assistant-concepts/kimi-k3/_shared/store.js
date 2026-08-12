/* ============================================================================
   Kimi K3 — observable state store.

   Two slices:
   - semantic: survives docked<->pop-out remount and simulated restart.
     (active thread, scroll anchors, collapsed ids, drafts, search state,
     Context Lens state, questionnaire state, goal/surface expansion,
     selectors, thread-history view, long-message expansion)
   - view: ephemeral (hover, focus, open popups, in-flight animation).

   Persistence: semantic slice is debounce-written to localStorage under
   'k3.sem.<sess>' (drafts included — there is no separate 'k3.drafts' key).
   All storage access is guarded (file:// / privacy modes may throw).
   ========================================================================== */
(function () {
  'use strict';

  const subs = {}; // path-prefix -> [fn]

  function blankSemantic() {
    return {
      activeThreadId: null,
      scrollAnchors: {},        // threadId -> {msgId, offsetRatio}
      collapsedMessages: {},    // messageId -> true (manually collapsed)
      expandedMessages: {},     // messageId -> true (manually expanded)
      drafts: {},               // threadId -> {text, attachments[], revisions[{savedAt,text}]}
      search: { query: '', scope: 'current', selectedResult: null, focusTarget: null },
      lens: {},                 // threadId -> {mode:null|'mute'|'focus'|'subcompact'|'off', selecting:false, selectedIds:[], applied:{muted:[],focused:[],subcompacted:[{ids:[],summary}]}}
      questionnaires: {},       // threadId -> {queue snapshots: answers, skips, currentIndex, status}
      goalView: {},             // threadId -> {expanded, section}
      surfaceView: {},          // threadId -> {todoOpen, subagentsOpen, diffOpen, activityOpen}
      selectors: { persona: null, model: null, mode: null, effort: null, worktree: null },
      history: { query: '', showArchived: false },
      thoughtPref: { keepActiveExpanded: false },
      openTabs: [],             // fake editor tabs from artifact/browser handoffs

      // --- final cumulative packet (2026-08-08) -----------------------------
      routeDefaults: { providerId: null, accountId: null, connectionId: null, modelId: null, effort: null, speed: null }, // project default; FUTURE threads only
      threadLocal: {},          // threadId -> {route, access, bsd, persona, mode, effort, speed, worktree, crew} (nulls = inherit)
      routeFavorites: [],       // routeKey strings `${providerId}/${accountId}/${modelId}`
      routeRecents: [],         // routeKey, most-recent-first, cap 8
      bsdState: {},             // threadId -> {mode:'off'|'auto'|'on', scope:'turn'|'thread', autoActive:false, lastResult:null|{kind, summary, at}}
      outbox: {},               // threadId -> [{opId, text, attachments, routeSnapshot, queuedAt, status:'queued'|'sent'}]
      appliedOps: {},           // opId -> true (idempotent replay fence)
      sync: { state: 'live', domainNotes: [], serverContinuing: false },
      artifactWs: {},           // threadId -> {open:false, activeId:null, order:[], docked:false}
      approvals: {},            // approvalId -> {decision:null|'deny'|'once'|'session', at}
      notifications: [],        // [{id, kind, title, body, at, read:false}]
      spell: { personal: [], project: [], ignoredDraft: {}, threadDisabled: {}, grammar: false },
      settingsReturn: null      // provider-setup return context {threadId, routeKey}
    };
  }

  const store = {
    semantic: blankSemantic(),
    view: {},

    get(path, fallback) {
      const parts = path.split('.');
      let node = store.semantic;
      for (const p of parts) {
        if (node == null || typeof node !== 'object') return fallback;
        node = node[p];
      }
      return node === undefined ? fallback : node;
    },

    set(path, value) {
      const parts = path.split('.');
      let node = store.semantic;
      for (let i = 0; i < parts.length - 1; i++) {
        if (typeof node[parts[i]] !== 'object' || node[parts[i]] == null) node[parts[i]] = {};
        node = node[parts[i]];
      }
      node[parts[parts.length - 1]] = value;
      notify(path, value);
      schedulePersist();
    },

    patch(path, obj) {
      const cur = store.get(path, {});
      store.set(path, Object.assign({}, cur, obj));
    },

    subscribe(prefix, fn) {
      (subs[prefix] = subs[prefix] || []).push(fn);
      return function unsubscribe() {
        const l = subs[prefix] || [];
        const i = l.indexOf(fn);
        if (i >= 0) l.splice(i, 1);
      };
    },

    snapshot() {
      return JSON.parse(JSON.stringify(store.semantic));
    },
    restore(snap) {
      if (!snap) return;
      store.semantic = Object.assign(blankSemantic(), JSON.parse(JSON.stringify(snap)));
      notify('', store.semantic);
    },

    resetSemantic() {
      store.semantic = blankSemantic();
      notify('', store.semantic);
    },

    // --- persistence -------------------------------------------------------
    persistNow() {
      safeSet('k3.sem.' + window.K3.env.sess, JSON.stringify(store.semantic));
    },
    loadPersisted() {
      const raw = safeGet('k3.sem.' + window.K3.env.sess);
      if (!raw) return false;
      try {
        store.restore(JSON.parse(raw));
        return true;
      } catch (e) { return false; }
    },
    clearPersisted() {
      safeRemove('k3.sem.' + window.K3.env.sess);
    },

    // Simulated crash/restart: wipe in-memory view state, re-read only what a
    // durable store would have (semantic slice), notify everyone to re-render.
    simulateRestart() {
      const snap = store.snapshot();
      store.view = {};
      store.restore(snap);
      return snap;
    }
  };

  function notify(path, value) {
    Object.keys(subs).forEach((prefix) => {
      if (path === '' || prefix === '' || path.startsWith(prefix) || prefix.startsWith(path)) {
        subs[prefix].slice().forEach((fn) => fn(path, value));
      }
    });
  }

  let persistTimer = null;
  function schedulePersist() {
    clearTimeout(persistTimer);
    persistTimer = setTimeout(() => store.persistNow(), 250);
  }

  function safeGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function safeSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage unavailable */ } }
  function safeRemove(k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } }

  window.K3Store = store;
})();
