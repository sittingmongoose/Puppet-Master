/* pm2-states.js — PM2.states
   Shared-v2 state engine for fable Settings concepts 05-11 (CONTRACT2).
   Scenarios, fixture overlays, trigger registry with truthful staged op
   events, simulated receipts, stress overlay, and the floating States
   drawer (pm2-drawer- prefix). Plain ES5 IIFE on window.PM2; only the
   drawer touches the DOM and it is guarded so node smoke tests can load
   this file headlessly. No emoji anywhere.
   Slint note: op events map to an ObservableWork bus; the drawer maps to
   a debug overlay window. */
(function () {
  'use strict';

  if (typeof window === 'undefined') { return; }
  window.PM2 = window.PM2 || {};

  /* ---------------- small utilities ---------------- */

  function arr(x) { return Array.isArray(x) ? x : []; }
  function obj(x) { return (x && typeof x === 'object') ? x : {}; }
  function str(x) { return (typeof x === 'string') ? x : ''; }
  function deepClone(x) {
    try { return JSON.parse(JSON.stringify(x)); } catch (e) { return {}; }
  }
  function icon(name) {
    try {
      if (window.PMIcons && typeof window.PMIcons.get === 'function') {
        return window.PMIcons.get(name) || '';
      }
    } catch (e) { /* icons are optional chrome */ }
    return '';
  }

  /* ---------------- demo clock ----------------
     Demo "now" is fixed at 2026-08-05. PM2.now() may already be defined
     by pm2-store; define the fallback only when absent. The fallback
     advances one second per call so ordered events keep distinct,
     deterministic timestamps within a session. */

  var FIXED_BASE_MS = Date.parse('2026-08-05T14:30:00-07:00');
  var clockTicks = 0;
  if (typeof window.PM2.now !== 'function') {
    window.PM2.now = function () {
      clockTicks += 1;
      return new Date(FIXED_BASE_MS + clockTicks * 1000);
    };
  }
  function nowIso() {
    try {
      var n = window.PM2.now();
      if (n instanceof Date) return n.toISOString();
      if (typeof n === 'number') return new Date(n).toISOString();
      var s = str(n);
      if (s) return s;
    } catch (e) { /* fall through to fixed base */ }
    return new Date(FIXED_BASE_MS).toISOString();
  }

  /* ---------------- store attachment ---------------- */

  var currentStore = null;
  var pristineDataJson = null;   // snapshot taken at attach time
  var pristineValuesJson = null;

  function resolveStore() {
    if (currentStore) return currentStore;
    try {
      var st = window.PM2.store;
      if (st && typeof st.current === 'function') {
        var got = st.current();
        if (got) { attach(got); return currentStore; }
      }
    } catch (e) { /* store not ready yet */ }
    return null;
  }

  function snapshot(store) {
    try { normalizeSharedData(store.data); } catch (e) { /* defensive */ }
    try { pristineDataJson = JSON.stringify(store.data || {}); }
    catch (e) { pristineDataJson = '{}'; }
    try { pristineValuesJson = JSON.stringify(store.values || {}); }
    catch (e) { pristineValuesJson = '{}'; }
  }

  /* Restore a target object IN PLACE from a JSON snapshot so any live
     references to store.data / store.values stay valid. */
  function restoreInPlace(target, json) {
    if (!target || typeof target !== 'object') return target;
    var fresh;
    try { fresh = JSON.parse(json || '{}'); } catch (e) { fresh = {}; }
    Object.keys(target).forEach(function (k) { delete target[k]; });
    Object.keys(fresh).forEach(function (k) { target[k] = fresh[k]; });
    return target;
  }

  /* The shared demo data (untouchable in _shared/) predates the v2
     inventory and its staged import preview names two settings by ids
     that are not inventory rows. Remap them onto real, routable rows so
     every surface (fixture, trigger, dormant render) lands on settings
     that resolve via search. Idempotent; counts and shape unchanged. */
  function normalizeSharedData(data) {
    var pv = data && data.settingsLifecycle && data.settingsLifecycle.importPreview;
    if (!pv) return;
    arr(pv.conflicts).forEach(function (c) {
      if (!c) return;
      if (c.settingId === 'permissions.approvals.rule-count') {
        c.settingId = 'safety.approvals.doom-loop-threshold';
        c.local = '3 attempts';
        c.incoming = '5 attempts';
        /* note kept: managed rows stay excluded from import */
      } else if (c.settingId === 'general.sounds.master-volume') {
        c.settingId = 'general.interaction.sound-effects';
        c.local = 'On';
        c.incoming = 'Off';
      }
    });
  }

  function attach(store) {
    if (!store || currentStore === store) return currentStore;
    currentStore = store;
    if (pristineDataJson === null) snapshot(store);
    return currentStore;
  }

  /* ---------------- inventory helpers ---------------- */

  var invById = null;
  function inventoryById() {
    if (invById) return invById;
    invById = {};
    try {
      arr(obj(window.PM2_INVENTORY).settings).forEach(function (s) {
        if (s && s.id) invById[s.id] = s;
      });
    } catch (e) { /* inventory optional in headless smoke */ }
    return invById;
  }
  function inventorySettings() {
    try { return arr(obj(window.PM2_INVENTORY).settings); } catch (e) { return []; }
  }
  /* ---------------- values map helpers ----------------
     store.values entries are shape-detected: either a record object
     ({value, changedFromDefault, changedAt, by}) or a raw value. */

  function isRecord(entry) {
    return entry && typeof entry === 'object' && !Array.isArray(entry) &&
      Object.prototype.hasOwnProperty.call(entry, 'value');
  }
  function readValue(values, id) {
    var e = obj(values)[id];
    return isRecord(e) ? e.value : e;
  }
  function writeValue(values, id, value, meta) {
    if (!values) return;
    var e = values[id];
    if (isRecord(e)) {
      e.value = value;
      e.changedFromDefault = !!(meta && meta.changedFromDefault);
      if (meta && meta.by) { e.by = meta.by; e.changedAt = nowIso(); }
      else if (meta && meta.changedFromDefault === false) { delete e.by; delete e.changedAt; }
    } else if (values[id] !== undefined || (meta && meta.create)) {
      values[id] = value;
    }
  }

  /* ---------------- op events (ObservableWork) ----------------
     PM2.states.op(name, ref) returns a staged handle. Emission contract:
     queued -> running(phase[, progress]) ... -> exactly one terminal
     status: done | failed | degraded | retryable | canceled |
     recovery-required. Determinate progress exists ONLY with a real
     denominator ({completed, total>0}); bare percentages never appear. */

  var opSeq = 0;

  function emitOp(payload) {
    var store = resolveStore();
    if (store && typeof store.emit === 'function') {
      try { store.emit('op', payload); } catch (e) { /* listeners stay local */ }
    }
  }

  var TERMINAL_STATUSES = {
    done: 1, failed: 1, degraded: 1, retryable: 1,
    canceled: 1, 'recovery-required': 1
  };

  function op(name, ref) {
    opSeq += 1;
    var opId = 'op.' + opSeq;
    var terminal = false;
    function emit(status, phase, extra) {
      if (terminal) return handle;
      var payload = {
        opId: opId, name: str(name),
        ref: ref == null ? null : String(ref),
        status: status, at: nowIso()
      };
      if (phase != null) payload.phase = String(phase);
      if (extra) {
        Object.keys(extra).forEach(function (k) { payload[k] = extra[k]; });
      }
      if (typeof payload.completed === 'number' &&
          typeof payload.total === 'number' && payload.total > 0) {
        payload.progressKind = 'determinate';
        payload.source = payload.source || 'measured';
      } else {
        payload.progressKind = 'indeterminate';
        payload.source = payload.source || 'derived';
        delete payload.pct;
        delete payload.completed;
        delete payload.total;
      }
      if (TERMINAL_STATUSES[status]) terminal = true;
      emitOp(payload);
      return handle;
    }
    var handle = {
      id: opId, name: str(name), ref: ref == null ? null : String(ref),
      queued: function (extra) { return emit('queued', null, extra); },
      running: function (phase, extra) { return emit('running', phase || 'working', extra); },
      done: function (extra) { return emit('done', null, extra); },
      failed: function (extra) { return emit('failed', null, extra); },
      degraded: function (extra) { return emit('degraded', null, extra); },
      retryable: function (extra) { return emit('retryable', null, extra); },
      canceled: function (extra) { return emit('canceled', null, extra); },
      recoveryRequired: function (extra) { return emit('recovery-required', null, extra); },
      isTerminal: function () { return terminal; }
    };
    return handle;
  }

  /* Probe timescale: setTimescale(0) settles every staged transition
     instantly (also reachable via the instant=1 route param). */
  var timeScale = 1;
  function setTimescale(n) { timeScale = (typeof n === 'number' && n >= 0) ? n : 1; }
  function delay(ms) {
    return new Promise(function (resolve) {
      var t = Math.round((typeof ms === 'number' ? ms : 0) * timeScale);
      if (t <= 0 || typeof window.setTimeout !== 'function') { resolve(); return; }
      window.setTimeout(resolve, t);
    });
  }

  /* ---------------- simulated receipts ---------------- */

  function receipt(actionLabel, detail) {
    var message = 'Simulated: ' + str(actionLabel);
    if (detail) message += ' — ' + str(detail);
    var out = { simulated: true, message: message, at: nowIso() };
    var store = resolveStore();
    if (store && typeof store.emit === 'function') {
      try { store.emit('receipt', out); } catch (e) { /* local */ }
    }
    return out;
  }

  /* ---------------- row states ----------------
     Plain map { settingId: {state, stateNote} } mirrored at
     store.data.rowStates so store.resolveRow can reflect the active
     scenario/fixtures. States: managed | unavailable | restart-required |
     reconnect-required | changed-elsewhere | error. */

  function rowStatesOf(data) {
    if (!data.rowStates || typeof data.rowStates !== 'object') data.rowStates = {};
    return data.rowStates;
  }
  function setRowState(data, id, state, note) {
    if (!id) return;
    rowStatesOf(data)[id] = { state: state, stateNote: str(note) };
  }

  /* ---------------- notices ---------------- */

  function pushNotice(data, notice) {
    if (!Array.isArray(data.notices)) data.notices = [];
    if (data.notices.some(function (n) { return n && n.id === notice.id; })) return;
    data.notices.unshift(deepClone(notice));
  }

  var NOTICE_POOL = {
    attention: [
      { id: 'pm2-syn-att-1', kind: 'attention', statusWord: 'Needs attention',
        headline: 'Claude session expired',
        consequence: 'Runs that route to Claude will pause until you sign in again.',
        primary: { label: 'Sign in again', act: 'reconnect' },
        target: { cat: 'ai' } },
      { id: 'pm2-syn-att-2', kind: 'attention', statusWord: 'Needs attention',
        headline: 'A connected server stopped responding',
        consequence: 'Tools from that server are unavailable until it reconnects.',
        primary: { label: 'Reconnect server', act: 'reconnect' },
        target: { cat: 'system' } },
      { id: 'pm2-syn-att-3', kind: 'attention', statusWord: 'Needs attention',
        headline: 'Included usage is nearly exhausted',
        consequence: 'New runs may queue or switch routes when the balance reaches zero.',
        primary: { label: 'Review usage', act: 'open-usage' },
        target: { cat: 'ai' } }
    ],
    setup: [
      { id: 'pm2-syn-set-1', kind: 'setup', statusWord: 'Setup',
        headline: 'Finish connecting GitHub Copilot',
        consequence: 'Sign-in completed, but no model has been activated yet.',
        primary: { label: 'Choose models', act: 'open-provider' },
        target: { cat: 'ai' } },
      { id: 'pm2-syn-set-2', kind: 'setup', statusWord: 'Setup',
        headline: 'A language server is available for this project',
        consequence: 'Code navigation stays basic until it is installed.',
        primary: { label: 'Install now', act: 'install-lsp' },
        target: { cat: 'code' } }
    ],
    recommended: [
      { id: 'pm2-syn-rec-1', kind: 'recommended', statusWord: 'Recommended',
        headline: 'Pin a faster model for quick edits',
        consequence: 'Short edits currently use the same route as deep work.',
        primary: { label: 'Review suggestion', act: 'open-roles' },
        target: { cat: 'ai' } },
      { id: 'pm2-syn-rec-2', kind: 'recommended', statusWord: 'Recommended',
        headline: 'Enable memory review before saving',
        consequence: 'New gists are saved without review in this project.',
        primary: { label: 'Turn on review', act: 'open-memory' },
        target: { cat: 'memory' } }
    ]
  };

  function ensureNoticeCounts(data, wanted) {
    if (!Array.isArray(data.notices)) data.notices = [];
    Object.keys(wanted).forEach(function (kind) {
      var have = data.notices.filter(function (n) { return n && n.kind === kind; }).length;
      var pool = arr(NOTICE_POOL[kind]);
      var i = 0;
      while (have < wanted[kind] && i < pool.length) {
        var cand = pool[i];
        if (!data.notices.some(function (n) { return n && n.id === cand.id; })) {
          data.notices.push(deepClone(cand));
          have++;
        }
        i++;
      }
    });
  }

  function eachProvider(data, fn) {
    arr(data.providers).forEach(function (p) { if (p) fn(p); });
  }
  function eachAccount(data, fn) {
    eachProvider(data, function (p) {
      arr(p.accounts).forEach(function (a) { if (a) fn(a, p); });
    });
  }

  /* ---------------- scenarios (8) ----------------
     Each mutation runs on a freshly restored clone of the pristine store
     data AND values, so results are deterministic. Baseline co-exhibits
     every co-existable state (the shared demo data already carries the
     provider-side required states permanently). */

  var SCENARIOS = [
    { id: 'baseline', label: 'Baseline (mixed states)' },
    { id: 'calm', label: 'Calm' },
    { id: 'attention-heavy', label: 'Attention heavy' },
    { id: 'usage-exhausted', label: 'Usage exhausted' },
    { id: 'invocation-failed', label: 'Invocation failed' },
    { id: 'managed-workspace', label: 'Managed workspace' },
    { id: 'first-run', label: 'First run (nothing set up)' },
    { id: 'offline', label: 'Offline (air-gapped)' }
  ];

  var SCENARIO_MUTATIONS = {

    'baseline': function (data) {
      /* The pristine clone already exhibits mixed provider states
         (usage-unavailable-but-ready, selected/shadowed installations,
         unknown-owner manual-only, update-available-ask-first,
         verification-failed-and-rolled-back). Add the row states that
         honestly co-exist in an ordinary week — this set is mirrored by
         pm2-store's standalone fallback, so both modes agree. */
      setRowState(data, 'code.terminal.theme', 'restart-required',
        'The terminal re-renders with the new theme after a restart. Everything else applied immediately.');
      setRowState(data, 'ai.accounts.provider-connections', 'reconnect-required',
        'One connected account signed out on the provider side. Reconnect to resume its routes.');
      setRowState(data, 'safety.protection.bash-guard', 'managed',
        'An organization policy on this workspace keeps the shell guard on. Details show the origin.');
      setRowState(data, 'code.editing.formatters-enabled', 'changed-elsewhere',
        'Turned off on MacBook Air earlier today. This window still shows your local value.');
      setRowState(data, 'general.visual.glass-transparency', 'unavailable',
        'Applies only while a Glass theme is active. Switch the theme to Glass to adjust it.');
    },

    'calm': function (data) {
      data.notices = [];
      eachProvider(data, function (p) {
        p.status = 'ready';
        p.statusNote = 'Connected and responding normally.';
        if (p.defaultAnswerBlock) p.defaultAnswerBlock.attention = false;
        if (p.catalog) { p.catalog.state = 'fresh'; p.catalog.lastKnownGood = true; }
      });
      eachAccount(data, function (a) {
        a.health = 'ok';
        if (a.usage) a.usage.pressure = 'low';
      });
      data.rowStates = {};
    },

    'attention-heavy': function (data) {
      SCENARIO_MUTATIONS['baseline'](data);
      ensureNoticeCounts(data, { attention: 3, setup: 2, recommended: 2 });
      var flipped = 0;
      eachProvider(data, function (p) {
        if (flipped === 0 && p.status === 'ready') {
          p.status = 'degraded';
          p.statusNote = 'Responses are slower than usual.';
          flipped++;
        } else if (flipped === 1 && p.status === 'ready') {
          p.status = 'signed-out';
          p.statusNote = 'Signed out. Sign in to resume.';
          flipped++;
        }
      });
      eachProvider(data, function (p) {
        arr(p.installations).forEach(function (inst) {
          if (inst && inst.id === 'inst.codex.npm' && inst.update) {
            inst.update.state = 'needs-repair';
            inst.update.repairNote = 'The launcher shim points at a missing path after an npm prefix change.';
          }
        });
      });
      arr(data.freeRoutes).forEach(function (r) {
        if (r && r.id === 'fr-deepseek-free') {
          r.state = 'cooling-down';
          r.stateNote = 'Rate-limited at 1:58 PM. Requests resume automatically at 2:28 PM.';
        }
      });
      if (data.storage && data.storage.pressure) {
        data.storage.pressure.state = 'critical';
        data.storage.pressure.freeGB = 2.1;
        data.storage.pressure.note = 'The vault dataset is nearly full. Cleanup or compaction is strongly recommended.';
      }
    },

    'usage-exhausted': function (data) {
      SCENARIO_MUTATIONS['baseline'](data);
      eachAccount(data, function (a) {
        if (!a.usage) a.usage = {};
        a.usage.includedRemaining =
          (typeof a.usage.includedRemaining === 'number') ? 0 : 'None remaining';
        a.usage.pressure = 'exhausted';
      });
      eachProvider(data, function (p) {
        if (p.defaultAnswerBlock) {
          p.defaultAnswerBlock.remaining = 'No included usage remaining';
          p.defaultAnswerBlock.attention = true;
        }
      });
      if (data.usageSnapshot && typeof data.usageSnapshot === 'object') {
        Object.keys(data.usageSnapshot).forEach(function (k) {
          var row = data.usageSnapshot[k];
          if (row && typeof row === 'object' && !Array.isArray(row) &&
              ('pressure' in row || 'includedRemaining' in row)) {
            row.pressure = 'exhausted';
            row.includedRemaining =
              (typeof row.includedRemaining === 'number') ? 0 : 'None remaining';
          }
        });
      }
      pushNotice(data, {
        id: 'pm2-scn-usage', kind: 'attention', statusWord: 'Needs attention',
        headline: 'Included usage is exhausted on every connected account',
        consequence: 'New runs wait for the next reset unless another route is chosen.',
        primary: { label: 'Choose what happens next', act: 'open-usage' },
        target: { cat: 'ai', sub: 'usage' }
      });
    },

    'invocation-failed': function (data) {
      SCENARIO_MUTATIONS['baseline'](data);
      var marked = false;
      eachProvider(data, function (p) {
        if (!marked && arr(p.accounts).length > 0) {
          p.status = 'auth-no-invoke';
          p.statusNote = 'Signed in, but the last invocation was rejected. The session may lack API access.';
          if (p.defaultAnswerBlock) p.defaultAnswerBlock.attention = true;
          marked = true;
        }
      });
      pushNotice(data, {
        id: 'pm2-scn-invoke', kind: 'attention', statusWord: 'Needs attention',
        headline: 'Signed in, but invocations are failing',
        consequence: 'The account authenticates, yet model calls are rejected. Runs on this route will not start.',
        primary: { label: 'Run invocation test', act: 'invoke-test' },
        secondary: { label: 'Switch account', act: 'switch-account' },
        target: { cat: 'ai', sub: 'accounts' }
      });
    },

    'managed-workspace': function (data) {
      SCENARIO_MUTATIONS['baseline'](data);
      data.managedWorkspace = {
        active: true,
        label: 'Managed workspace',
        note: 'Your workspace administrator manages some settings. Managed rows show why and cannot be changed here.'
      };
      inventorySettings().forEach(function (s) {
        if (s && s.cat === 'safety') {
          setRowState(data, s.id, 'managed', 'Managed by workspace policy.');
        }
      });
      if (data.permissionsModel) {
        arr(data.permissionsModel.rules).forEach(function (r) {
          if (r && (r.origin === 'preset: safety' || r.managed)) {
            r.managed = true;
            r.managedReason = r.managedReason || 'Managed by workspace policy';
          }
        });
      }
      if (data.storage) {
        arr(data.storage.retention).forEach(function (r) {
          if (r && r.classId === 'run-evidence') {
            r.managed = true;
            r.managedReason = 'Retention for run evidence is set by workspace policy.';
          }
        });
      }
      pushNotice(data, {
        id: 'pm2-scn-managed', kind: 'setup', statusWord: 'Setup',
        headline: 'This workspace applies a managed policy',
        consequence: 'Permission and safety settings follow the workspace policy and are read-only here.',
        primary: { label: 'View policy summary', act: 'open-policy' },
        target: { cat: 'safety' }
      });
    },

    /* Systematic EMPTY: the honest first-open state. Every manager
       renders its real empty state; the value map returns to defaults. */
    'first-run': function (data, values) {
      data.firstRun = true;
      data.rowStates = {};
      data.notices = [{
        id: 'pm2-scn-firstrun', kind: 'setup', statusWord: 'Setup',
        headline: 'Nothing is set up yet',
        consequence: 'Connect a provider to start working. Everything else can wait.',
        primary: { label: 'Set up a provider', act: 'open-provider' },
        target: { cat: 'ai' }
      }];
      data.recents = [];
      eachProvider(data, function (p) {
        p.accounts = [];
        p.models = [];
        p.installations = [];
        if (p.groupKind === 'server') {
          p.status = 'not-configured';
          p.statusNote = 'No server connection has been added.';
        } else if (p.id === 'free-community') {
          p.status = 'ready';
          p.statusNote = 'Available once an underlying route exists.';
        } else {
          p.status = p.setupOffer ? 'not-installed' : 'signed-out';
          p.statusNote = 'Not set up yet.';
        }
        if (p.defaultAnswerBlock) {
          p.defaultAnswerBlock.connected = false;
          p.defaultAnswerBlock.accountInUse = 'None yet';
          p.defaultAnswerBlock.attention = null;
        }
      });
      data.memory = [];
      data.personas = arr(data.personas).filter(function (p) { return p && p.core === true; });
      data.crew = [];
      data.mcp = [];
      data.skills = [];
      data.plugins = [];
      arr(data.tools).forEach(function (t) {
        if (t) {
          t.installed = false; t.projectEnabled = false; t.available = false;
          t.selectedThisTurn = false; t.invokedRecently = false;
        }
      });
      arr(data.lsp).forEach(function (l) {
        if (l && l.state === 'installed') l.state = 'detected';
      });
      if (data.notifications) {
        data.notifications.destinations = arr(data.notifications.destinations)
          .filter(function (d) { return d && d.builtIn; });
        if (data.notifications.sounds) {
          data.notifications.sounds.library = arr(data.notifications.sounds.library)
            .filter(function (s) { return s && s.source === 'built-in'; });
          data.notifications.sounds.packs = [];
        }
      }
      if (data.appearance) data.appearance.customThemes = [];
      if (data.backups) {
        data.backups.restorePoints = [];
        data.backups.testRestore = { last: null };
      }
      if (data.settingsLifecycle) {
        data.settingsLifecycle.lastExport = null;
        if (data.settingsLifecycle.importPreview) {
          data.settingsLifecycle.importPreview.state = 'dormant';
        }
        data.settingsLifecycle.history = [];
      }
      if (data.sessionsHistory) data.sessionsHistory.sessions = [];
      if (data.artifacts) data.artifacts.entries = [];
      if (data.sourceControl) {
        arr(data.sourceControl.forges).forEach(function (f) {
          if (f) { f.state = 'not-connected'; f.account = null; }
        });
        if (data.sourceControl.worktrees) data.sourceControl.worktrees.active = [];
        if (data.sourceControl.ssh) {
          data.sourceControl.ssh.keys = [];
          data.sourceControl.ssh.state = 'none';
        }
      }
      if (data.githubActions) { data.githubActions.pinned = []; data.githubActions.runs = []; }
      if (data.searchIndex) {
        data.searchIndex.enabled = false; data.searchIndex.phase = 'disabled';
        data.searchIndex.files = 0; data.searchIndex.diskMB = 0;
        data.searchIndex.failures = []; data.searchIndex.lastBuild = null;
      }
      if (data.cleanup) {
        arr(data.cleanup.categories).forEach(function (c) {
          if (c) { c.count = 0; c.sizeMB = 0; c.safety = null; }
        });
        if (data.cleanup.dryRun) data.cleanup.dryRun.last = null;
      }
      if (data.storage) data.storage.quarantine = [];
      if (data.teacher) data.teacher.lastSession = null;
      if (data.permissionsModel) {
        data.permissionsModel.rules = arr(data.permissionsModel.rules)
          .filter(function (r) { return r && (r.locked || r.origin === 'global default'); });
        data.permissionsModel.perPersona = [];
        if (data.permissionsModel.doomLoop) data.permissionsModel.doomLoop.lastTrip = null;
      }
      /* Values: every setting returns to its default; no divergences yet. */
      if (values) {
        var byId = inventoryById();
        Object.keys(values).forEach(function (id) {
          var inv = byId[id];
          writeValue(values, id, inv ? inv['default'] : readValue(values, id),
            { changedFromDefault: false });
        });
      }
    },

    /* Systematic UNAVAILABLE: air-gapped. Remote things fail with honest
       reasons; last-known-good catalogs stay usable for reading. */
    'offline': function (data) {
      SCENARIO_MUTATIONS['baseline'](data);
      data.offline = true;
      eachProvider(data, function (p) {
        if (p.id === 'local-ollama') return; /* local server keeps working */
        if (p.groupKind === 'server') {
          p.status = 'unreachable';
          p.statusNote = 'The network is unavailable. Reconnects automatically when it returns.';
          if (p.serverInfo) p.serverInfo.reachability = 'unreachable';
        } else if (p.status === 'ready' || p.status === 'refreshing' || p.status === 'degraded') {
          p.status = 'unreachable';
          p.statusNote = 'Offline. The last-known-good catalog stays available for reading; requests will queue or fail honestly.';
        }
        if (p.catalog) { p.catalog.state = 'stale'; p.catalog.lastKnownGood = true; }
      });
      if (data.freeCatalog) {
        arr(data.freeCatalog.sources).forEach(function (s) {
          if (s) { s.validation = 'stale'; s.lastKnownGood = true; }
        });
      }
      if (data.sourceControl) {
        arr(data.sourceControl.forges).forEach(function (f) {
          if (f && f.state === 'connected') {
            f.state = 'unreachable';
            f.stateNote = 'Offline. Local repositories keep working.';
          }
        });
      }
      if (data.githubActions) {
        data.githubActions.refreshDisabled = 'Offline. Showing the last fetched runs.';
      }
      if (data.webResearch) {
        arr(data.webResearch.providers).forEach(function (w) {
          if (w && !w.builtIn) {
            w.state = 'unavailable';
            w.stateNote = 'Offline. This route needs the network.';
          }
        });
        data.webResearch.airgap = 'detected';
      }
      if (data.serverTopology) {
        arr(data.serverTopology.hosts).forEach(function (h) {
          if (h && h.id !== 'host.win-desktop') h.state = 'offline';
        });
      }
      if (data.notifications) {
        arr(data.notifications.destinations).forEach(function (d) {
          if (d && !d.builtIn && d.state === 'ready') {
            d.state = 'unavailable';
            d.stateNote = 'Offline. Deliveries queue and send when the network returns.';
          }
        });
      }
      /* Network-dependent rows go honestly unavailable — this set is
         mirrored by pm2-store's standalone fallback, so both modes
         agree: every web.providers.* and web.fetch.* row, plus provider
         connections and app-update checks. */
      inventorySettings().forEach(function (s) {
        if (!s || !s.id) return;
        if (s.id.indexOf('web.providers.') === 0 || s.id.indexOf('web.fetch.') === 0) {
          setRowState(data, s.id, 'unavailable',
            'Offline. This needs the network; it resumes with the connection.');
        }
      });
      setRowState(data, 'ai.accounts.provider-connections', 'unavailable',
        'Offline. Provider sign-in needs the network; it resumes with the connection.');
      setRowState(data, 'system.advanced.auto-update', 'unavailable',
        'Offline. Update checks need the network; they resume with the connection.');
      pushNotice(data, {
        id: 'pm2-scn-offline', kind: 'attention', statusWord: 'Needs attention',
        headline: 'Working offline',
        consequence: 'Remote providers, forges, and delivery destinations are unavailable. Local models and repositories keep working; catalogs show their last-known-good state.',
        primary: { label: 'Review what still works', act: 'open-provider' },
        target: { cat: 'ai' }
      });
    }
  };

  /* ---------------- fixture overlays (13) ----------------
     Additive, idempotent, applied AFTER the scenario on the same rebuilt
     clone; persisted under the store key "fixtures". */

  var LONG_TEXT_OVERRIDES = {
    'general.visual.ui-scale': {
      label: 'Overall User Interface Scale Including Text, Controls, Iconography, and Layout Density Across Every Panel',
      desc: 'Adjusts the rendered size of every interface element in this window, including editor chrome, dialog controls, list rows, breadcrumbs, and status indicators. Values above 150 percent are intended for high-density displays viewed at a distance; some embedded surfaces re-render only after the application restarts, and the restart requirement is shown on the row whenever it applies.'
    },
    'general.startup.restore-panel': {
      label: 'Which Workspace Panel Should Be Opened Automatically Every Time The Application Launches Or Recovers',
      desc: 'Chooses the panel that greets you on launch: the last panel you used, the chat conversation, the file manager, the goal board, or the settings surface itself. Crash recovery honors this preference too, after any unsaved-work protection has finished restoring editors and terminals to their previous state.'
    },
    'code.terminal.scrollback-limit': {
      label: 'Maximum Number Of Terminal Scrollback Lines Retained In Memory Per Terminal Session Before Truncation',
      desc: 'Caps how many lines each built-in terminal keeps in memory for scrolling and searching. Larger values make long build logs fully searchable at the cost of memory per open terminal; the oldest lines are discarded first once the cap is reached, and the cap applies independently to every terminal tab in this project.'
    },
    'ai.models.default-model': {
      label: 'Default Model Used For Ordinary Conversational Work When No Role, Persona, Or Command Override Applies',
      desc: 'Sets the model that answers when nothing more specific has claimed the request: no role routing, no persona pin, no per-command override, and no fallback in effect. Changing it never touches the routing table; it only changes the final default that the routing table falls through to when every other rule has declined.'
    },
    'safety.approvals.autonomy-mode': {
      label: 'How Much The Assistant May Do On Its Own Before Pausing To Ask You For An Explicit Approval',
      desc: 'Balances speed against oversight for this project. Stricter levels pause before edits, shell commands, and network access; looser levels only pause at the gates you have kept mandatory. Every pause names the exact operation, the rule that required asking, and what will happen if you approve or decline.'
    },
    'web.fetch.cost-hard-cap': {
      label: 'Absolute Monthly Credit Ceiling For Web Search, Fetch, Crawl, And Extraction Providers Combined',
      desc: 'A hard stop for combined web provider spending in one calendar month. When the cap is reached, crawls and extractions pause immediately and honestly report the guard as their reason; plain page fetches that cost nothing keep working. Raising the cap takes effect at once and is recorded in the receipts list.'
    },
    'memory.retention.gist-review-filter': {
      label: 'Which Saved Memory Entries The Review Queue Shows First When You Open The Memory Manager',
      desc: 'Chooses the default filter for the memory review queue: unverified entries awaiting your first look, entries that failed verification, or the full list. The queue itself never changes what is stored; it only changes what you see first when deciding what stays, what gets corrected, and what gets removed.'
    },
    'system.mcp.transport': {
      label: 'Connection Transport Preference For This Tool Server Including Standard Input, Server-Sent Events, And HTTP',
      desc: 'Selects how the application talks to this connected tool server. Standard input suits locally launched servers; server-sent events and HTTP suit remote ones. Changing the preference takes effect at the next reconnect, and the row shows a reconnect-required state until that reconnect has actually happened.'
    }
  };

  var FIXTURES = [
    {
      id: 'fx.loading-cached', label: 'Loading with cached content',
      apply: function (data) {
        data.loadingCached = {
          active: true,
          note: 'Cached values stay visible while fresh ones load. Nothing blocks on the refresh.'
        };
        eachProvider(data, function (p) {
          if (p.catalog) {
            p.catalog.state = 'refreshing';
            p.catalog.lastKnownGood = true;
          }
        });
        if (data.usageSnapshot && typeof data.usageSnapshot === 'object') {
          data.usageSnapshot.refreshing = true;
          data.usageSnapshot.refreshNote = 'Showing the last fetched numbers while the usage pages refresh.';
        }
      }
    },
    {
      id: 'fx.import-conflict', label: 'Settings import: conflicts staged',
      apply: function (data) {
        if (data.settingsLifecycle && data.settingsLifecycle.importPreview) {
          data.settingsLifecycle.importPreview.state = 'staged';
        }
        pushNotice(data, {
          id: 'pm2-fx-import', kind: 'setup', statusWord: 'Setup',
          headline: 'A settings import is waiting for review',
          consequence: '3 conflicts need a decision before anything is applied. A restore point is already staged.',
          primary: { label: 'Review the preview', act: 'open-lifecycle' },
          target: { cat: 'system' }
        });
      }
    },
    {
      id: 'fx.rollback-complete', label: 'Settings import: rollback complete',
      apply: function (data) {
        if (data.settingsLifecycle) {
          if (data.settingsLifecycle.importPreview) {
            data.settingsLifecycle.importPreview.state = 'rolled-back';
          }
          data.settingsLifecycle.rollbackJustCompleted = {
            when: '2026-08-05T14:26:00-07:00',
            receiptId: 'rcpt.settings.rollback.0805',
            detail: 'All 9 imported changes reverted from the pre-import snapshot. The receipt records both directions.'
          };
        }
        pushNotice(data, {
          id: 'pm2-fx-rollback', kind: 'recommended', statusWord: 'Done',
          headline: 'Rollback complete',
          consequence: 'Settings match the pre-import snapshot again. Nothing else changed.',
          primary: { label: 'Open the receipt', act: 'open-lifecycle' },
          target: { cat: 'system' }
        });
      }
    },
    {
      id: 'fx.changed-elsewhere', label: 'Setting changed on another device',
      apply: function (data) {
        setRowState(data, 'general.startup.restore-panel', 'changed-elsewhere',
          'Changed to "File Manager" on MacBook Air a few minutes ago. This window still shows your local value; reload the row or keep yours.');
        pushNotice(data, {
          id: 'pm2-fx-elsewhere', kind: 'attention', statusWord: 'Needs attention',
          headline: 'A setting changed on MacBook Air',
          consequence: 'Panel To Open On Launch now differs from what this window shows. The row is marked.',
          primary: { label: 'Show the changed row', act: 'open-changed' },
          target: { cat: 'general', sub: 'startup', settingId: 'general.startup.restore-panel' }
        });
      }
    },
    {
      id: 'fx.restart-required', label: 'Restart required',
      apply: function (data) {
        setRowState(data, 'general.visual.ui-scale', 'restart-required',
          'The new scale takes full effect after a restart. Everything else applied immediately.');
        if (data.appearance && data.appearance.uiScale) {
          data.appearance.uiScale.pendingRestart = true;
        }
        data.restartBanner = {
          active: true,
          reason: 'UI scale and one imported theme take effect after a restart.',
          items: ['UI scale', 'Paper Print theme fonts']
        };
      }
    },
    {
      id: 'fx.reconnect-required', label: 'Reconnect required',
      apply: function (data) {
        var first = arr(data.mcp)[0];
        if (first) {
          first.state = 'disconnected';
          first.reconnectRequired = true;
          first.stateNote = 'The transport preference changed. Reconnect to apply it.';
        }
        setRowState(data, 'system.mcp.transport', 'reconnect-required',
          'The transport preference changed. The server stays on the old transport until it reconnects.');
        pushNotice(data, {
          id: 'pm2-fx-reconnect', kind: 'attention', statusWord: 'Needs attention',
          headline: 'A connected server needs to reconnect',
          consequence: 'The preferred transport changed; the server stays down until it reconnects.',
          primary: { label: 'Reconnect now', act: 'reconnect' },
          target: { cat: 'system', sub: 'mcp' }
        });
      }
    },
    {
      id: 'fx.validation-error', label: 'Validation errors visible',
      apply: function (data) {
        setRowState(data, 'web.fetch.cost-hard-cap', 'error',
          'Must be a whole number between 0 and 10,000 credits. The last saved value is still in effect.');
        setRowState(data, 'system.mcp.remote-url', 'error',
          'Not a valid server address. Use https:// followed by a host name. The last saved value is still in effect.');
        pushNotice(data, {
          id: 'pm2-fx-validation', kind: 'attention', statusWord: 'Needs attention',
          headline: 'Two values fail validation',
          consequence: 'The credit hard cap is out of range, and a remote server address is malformed. Both rows show field-level errors.',
          primary: { label: 'Go to the first error', act: 'open-validation' },
          target: { cat: 'web', sub: 'fetch', settingId: 'web.fetch.cost-hard-cap' }
        });
      }
    },
    {
      id: 'fx.theme-fallback', label: 'Custom theme invalid, fallback active',
      apply: function (data) {
        if (data.appearance) {
          var themes = arr(data.appearance.customThemes);
          var bad = null;
          themes.forEach(function (t) { if (!bad && t && t.state === 'invalid') bad = t; });
          if (!bad && themes.length) {
            bad = themes[0];
            bad.state = 'invalid';
            bad.errors = arr(bad.errors);
            if (!bad.errors.length) {
              bad.errors.push({ line: 41, message: 'Invalid color value "#GG7700".' });
            }
          }
        }
        pushNotice(data, {
          id: 'pm2-fx-theme', kind: 'attention', statusWord: 'Needs attention',
          headline: 'Cobalt Mono failed validation',
          consequence: 'Line 41 has an invalid color, so its base theme is in effect until the file is fixed.',
          primary: { label: 'Open the diagnosis', act: 'open-appearance' },
          target: { cat: 'general', sub: 'visual' }
        });
      }
    },
    {
      id: 'fx.storage-pressure', label: 'Storage pressure critical',
      apply: function (data) {
        if (data.storage && data.storage.pressure) {
          data.storage.pressure.state = 'critical';
          data.storage.pressure.freeGB = 2.1;
          data.storage.pressure.note = 'The vault dataset is nearly full. New artifact writes pause at 1 GB free.';
        }
        pushNotice(data, {
          id: 'pm2-fx-storage', kind: 'attention', statusWord: 'Needs attention',
          headline: 'Storage is nearly full',
          consequence: '2.1 GB free on the vault dataset. Cleanup can reclaim about 2.1 GB safely.',
          primary: { label: 'Run a cleanup dry run', act: 'cleanup-dry-run' },
          secondary: { label: 'Open storage', act: 'open-storage' },
          target: { cat: 'system' }
        });
      }
    },
    {
      id: 'fx.credit-guard', label: 'Web credit guard tripped',
      apply: function (data) {
        if (data.webResearch) {
          arr(data.webResearch.providers).forEach(function (w) {
            if (w && w.id === 'web.firecrawl') {
              if (w.credits) w.credits.used = w.credits.total;
              if (w.guard) {
                w.guard.state = 'stop';
                w.guard.note = '100% of monthly credits used. Crawls are paused by the guard; fetch keeps working.';
              }
              w.state = 'unavailable';
              w.stateNote = 'Paused by the credit guard until the month resets or the cap is raised.';
            }
          });
        }
        pushNotice(data, {
          id: 'pm2-fx-credit', kind: 'attention', statusWord: 'Needs attention',
          headline: 'Firecrawl hit its credit cap',
          consequence: 'Crawl and extract are paused by the guard. Search and fetch still work.',
          primary: { label: 'Review web providers', act: 'open-web' },
          target: { cat: 'web', sub: 'providers' }
        });
      }
    },
    {
      id: 'fx.index-failed', label: 'Search index failed',
      apply: function (data) {
        if (data.searchIndex) {
          data.searchIndex.phase = 'failed';
          data.searchIndex.failures = [
            { path: 'assets/font-pack.bin', reason: 'Binary detection failed; skipped.' },
            { path: 'target/release/pm.pdb', reason: 'File exceeded the 8 MB large-file limit.' },
            { path: '.pm-worktrees/old-spike', reason: 'Symlink loop detected; subtree skipped.' }
          ];
        }
        pushNotice(data, {
          id: 'pm2-fx-index', kind: 'attention', statusWord: 'Needs attention',
          headline: 'The project index stopped with errors',
          consequence: 'Three paths failed. Search still works from the last good index.',
          primary: { label: 'Rebuild the index', act: 'index-rebuild' },
          target: { cat: 'system' }
        });
      }
    },
    {
      id: 'fx.long-text', label: 'Long labels and explanations',
      apply: function (data) {
        data.longTextMode = true;
        data.longTextOverrides = deepClone(LONG_TEXT_OVERRIDES);
      }
    },
    {
      id: 'fx.doom-loop-tripped', label: 'Doom-loop guard tripped',
      apply: function (data) {
        if (data.permissionsModel && data.permissionsModel.doomLoop) {
          data.permissionsModel.doomLoop.lastTrip = {
            when: '2026-08-05T13:47:00-07:00',
            operation: 'shell.exec: rm -rf node_modules',
            attempts: 3,
            outcome: 'Run paused; waiting for your decision.'
          };
        }
        pushNotice(data, {
          id: 'pm2-fx-doom', kind: 'attention', statusWord: 'Needs attention',
          headline: 'A run is paused by the doom-loop guard',
          consequence: 'The same denied operation was retried three times. The run waits for you.',
          primary: { label: 'Review the trace', act: 'open-permissions' },
          target: { cat: 'safety', sub: 'approvals' }
        });
      }
    }
  ];

  function fixtureById(id) {
    for (var i = 0; i < FIXTURES.length; i++) {
      if (FIXTURES[i].id === id) return FIXTURES[i];
    }
    return null;
  }

  /* ---------------- stress overlay ----------------
     2,000 clearly-synthetic records, namespaced zz-stress.* and flagged
     synthetic:true. They are exposed ONLY through stressRecords();
     PM2_INVENTORY.settings is never touched. */

  var STRESS_COUNT = 2000;
  var stressCache = null;

  function stressRecordsList() {
    if (stressCache) return stressCache;
    var cats = ['general', 'ai', 'safety', 'code', 'memory', 'planning',
      'branching', 'media', 'web', 'personas', 'extensions', 'system'];
    var out = [];
    for (var i = 0; i < STRESS_COUNT; i++) {
      var n = i + 1;
      var pad = (n < 10 ? '000' : n < 100 ? '00' : n < 1000 ? '0' : '') + n;
      var cat = cats[i % cats.length];
      out.push({
        id: 'zz-stress.' + cat + '.' + pad,
        synthetic: true,
        kind: 'stress-record',
        cat: cat,
        label: 'Synthetic stress record ' + pad,
        desc: 'Scale-test record ' + pad + ' generated by the stress overlay. It is not a real setting and never mixes into the inventory.',
        search: ['stress', 'synthetic', 'zz-stress', 'scale test', pad]
      });
    }
    stressCache = out;
    return stressCache;
  }

  var stressOn = false;

  function setStress(on, opts) {
    stressOn = !!on;
    var store = resolveStore();
    if (store) {
      if (!opts || opts.persist !== false) {
        try { store.set('stress', stressOn); } catch (e) { /* storage optional */ }
      }
      if (store.data) {
        store.data.stress = stressOn
          ? { active: true, count: STRESS_COUNT, namespace: 'zz-stress.' }
          : { active: false, count: 0, namespace: 'zz-stress.' };
      }
      try { store.emit('stress', { active: stressOn, count: stressOn ? STRESS_COUNT : 0 }); }
      catch (e) { /* local */ }
    }
  }

  /* ---------------- rebuild pipeline ----------------
     fresh restore of pristine data+values (in place) -> scenario
     mutation -> fixture overlays in order -> stress marker -> emit. */

  var activeScenario = 'baseline';
  var activeFixtures = [];

  function applyFixturesTo(data, values, ids) {
    arr(ids).forEach(function (id) {
      var fx = fixtureById(id);
      if (!fx) return;
      try { fx.apply(data, values); }
      catch (e) { /* a broken overlay never breaks the page */ }
    });
  }

  function rebuild(scenarioId, opts) {
    var store = resolveStore();
    if (!store) { activeScenario = scenarioId; return; }
    if (pristineDataJson === null) snapshot(store);
    restoreInPlace(store.data, pristineDataJson);
    restoreInPlace(store.values, pristineValuesJson);
    var mutate = SCENARIO_MUTATIONS[scenarioId] || SCENARIO_MUTATIONS['baseline'];
    if (!SCENARIO_MUTATIONS[scenarioId]) scenarioId = 'baseline';
    try { mutate(store.data, store.values); }
    catch (e) { /* keep whatever mutated cleanly */ }
    applyFixturesTo(store.data, store.values, activeFixtures);
    if (store.data) {
      store.data.stress = stressOn
        ? { active: true, count: STRESS_COUNT, namespace: 'zz-stress.' }
        : { active: false, count: 0, namespace: 'zz-stress.' };
    }
    activeScenario = scenarioId;
    if (!opts || opts.persist !== false) {
      try { store.set('scenario', scenarioId); } catch (e) { /* storage optional */ }
    }
    try {
      store.emit('scenario', {
        id: scenarioId,
        fixtures: activeFixtures.slice(),
        stress: stressOn
      });
    } catch (e) { /* local */ }
  }

  function applyScenario(id, opts) { rebuild(id, opts); }

  function setFixtures(ids, opts) {
    activeFixtures = arr(ids).filter(function (id) { return !!fixtureById(id); });
    var store = resolveStore();
    if (store && (!opts || opts.persist !== false)) {
      try { store.set('fixtures', activeFixtures.slice()); } catch (e) { /* optional */ }
    }
    rebuild(activeScenario, { persist: false });
  }

  /* Called by PM2.store.init (or lazily on first use): reapplies the
     persisted scenario, fixtures, and stress; honors instant=1 in the
     URL so probes settle without wall-clock waits. */
  function onStoreInit(store) {
    attach(store);
    var url = '';
    try { url = String(window.location.href || ''); } catch (e) { url = ''; }
    if (/[?&#](instant=1)(&|$)/.test(url)) setTimescale(0);
    var savedScenario = 'baseline';
    var savedFixtures = [];
    var savedStress = false;
    try { savedScenario = str(store.get('scenario')) || 'baseline'; } catch (e) { /* optional */ }
    try { savedFixtures = arr(store.get('fixtures')); } catch (e) { /* optional */ }
    try { savedStress = store.get('stress') === true; } catch (e) { /* optional */ }
    activeFixtures = savedFixtures.filter(function (id) { return !!fixtureById(id); });
    stressOn = savedStress;
    if (savedScenario !== 'baseline' || activeFixtures.length || stressOn) {
      rebuild(savedScenario, { persist: false });
    } else {
      /* Baseline still gets its co-existable row states. */
      rebuild('baseline', { persist: false });
    }
    return store;
  }

  /* ---------------- trigger helpers ---------------- */

  function findProvider(data, ref) {
    var list = arr(data.providers);
    if (ref != null) {
      for (var i = 0; i < list.length; i++) {
        if (list[i] && (list[i].id === ref || list[i].name === ref)) return list[i];
      }
    }
    return list[0] || null;
  }

  function findInstallation(data, ref) {
    var want = str(ref);
    var provId = null;
    if (want.indexOf('/') > 0) {
      provId = want.split('/')[0];
      want = want.split('/')[1];
    }
    var found = null;
    arr(data.providers).forEach(function (p) {
      if (!p || (provId && p.id !== provId)) return;
      arr(p.installations).forEach(function (inst) {
        if (inst && (inst.id === want || (!want && inst.selected))) {
          found = { provider: p, inst: inst };
        }
      });
    });
    if (!found && !want) {
      arr(data.providers).forEach(function (p) {
        if (found || !p) return;
        var withUpdate = arr(p.installations).filter(function (i) {
          return i && i.update && i.update.state === 'update-available';
        })[0];
        if (withUpdate) found = { provider: p, inst: withUpdate };
      });
    }
    return found;
  }

  var lastTestSend = 0;

  /* ---------------- trigger registry ----------------
     Rev-2 names carried forward plus copy-preview / copy-apply /
     copy-rollback / stress-load. Every long-running trigger emits a
     truthful staged op: queued -> running (named phase; determinate
     progress only with a real denominator) -> terminal / degraded /
     retryable / canceled. */

  var TRIGGERS = {

    'provider-refresh': function (store, data, ref) {
      var p = findProvider(data, ref);
      if (!p) return Promise.resolve(null);
      var h = op('provider-refresh', p.id).queued();
      if (!p.catalog) p.catalog = {};
      p.catalog.state = 'refreshing';
      p.catalog.lastKnownGood = true; /* cached rows stay usable */
      h.running('contacting-provider');
      store.emit('provider', { id: p.id, phase: 'refreshing' });
      store.emit('catalog', { providerId: p.id, state: 'refreshing' });
      return delay(700).then(function () {
        h.running('reading-catalog');
        return delay(500);
      }).then(function () {
        p.catalog.state = 'fresh';
        p.catalog.lastChecked = nowIso();
        p.catalog.lastKnownGood = true;
        h.done();
        store.emit('provider', { id: p.id, phase: 'done' });
        store.emit('catalog', { providerId: p.id, state: 'fresh' });
        receipt('Catalog refreshed', (str(p.name) || p.id) + ' re-read its model catalog.');
        return { ok: true, providerId: p.id };
      });
    },

    'reconnect': function (store, data, ref) {
      /* An MCP server id reconnects that server; anything else keeps the
         provider behavior. */
      var want = str(ref);
      var mcpHit = null;
      if (want) {
        arr(data.mcp).forEach(function (s) {
          if (!mcpHit && s && (s.id === want || s.name === want)) mcpHit = s;
        });
        var providerExact = arr(data.providers).some(function (p) {
          return p && (p.id === want || p.name === want);
        });
        if (mcpHit && !providerExact) {
          var hm = op('reconnect', mcpHit.id).queued();
          mcpHit.state = 'reconnecting';
          hm.running('negotiating-transport');
          store.emit('mcp', { id: mcpHit.id, phase: 'reconnecting' });
          return delay(1200).then(function () {
            mcpHit.state = 'connected';
            delete mcpHit.reconnectRequired;
            mcpHit.stateNote = 'Reconnected. Tools rediscovered and the discovery cache is fresh.';
            delete rowStatesOf(data)['system.mcp.transport'];
            hm.done();
            store.emit('mcp', { id: mcpHit.id, phase: 'done' });
            receipt('Server reconnected', (str(mcpHit.name) || mcpHit.id) + ' negotiated its transport and rediscovered tools.');
            return { ok: true, mcpId: mcpHit.id };
          });
        }
      }
      var pr = findProvider(data, ref);
      if (!pr) return Promise.resolve(null);
      var h = op('reconnect', pr.id).queued();
      var previous = pr.status;
      pr.status = 'refreshing';
      pr.statusNote = 'Reconnecting…';
      h.running('signing-in');
      store.emit('provider', { id: pr.id, phase: 'reconnecting' });
      return delay(1400).then(function () {
        pr.status = 'ready';
        pr.statusNote = 'Connected and responding normally.';
        h.done();
        store.emit('provider', { id: pr.id, phase: 'done', previous: previous });
        receipt('Provider reconnected', (str(pr.name) || pr.id) + ' is connected and responding normally.');
        return { ok: true, providerId: pr.id };
      });
    },

    'invoke-test': function (store, data, ref) {
      var pi = findProvider(data, ref);
      if (!pi) return Promise.resolve(null);
      var h = op('invoke-test', pi.id).queued();
      h.running('sending-test-call');
      store.emit('provider', { id: pi.id, phase: 'invoke-running' });
      return delay(1000).then(function () {
        var ok = pi.status === 'ready' || pi.status === 'degraded';
        if (ok) h.done(); else h.retryable({ reason: 'invocation-rejected' });
        store.emit('provider', { id: pi.id, phase: 'invoke-done', ok: ok });
        receipt('Invocation test', ok
          ? 'A short test call succeeded on ' + (str(pi.name) || 'the provider') + '.'
          : 'The test call was rejected. The account signs in but cannot invoke models.');
        return { ok: ok, providerId: pi.id };
      });
    },

    /* -- installation lifecycle -- */

    'install-scan': function (store, data, ref) {
      var h = op('install-scan', ref).queued();
      h.running('tracing-launchers');
      return delay(500).then(function () {
        h.running('querying-package-databases');
        return delay(400);
      }).then(function () {
        h.done({ found: 0 });
        receipt('Installation scan', 'No new candidates. Wrappers, symlinks, and shims traced; package databases queried.');
        return { ok: true };
      });
    },

    'install-select': function (store, data, ref) {
      var hit = findInstallation(data, ref);
      if (!hit) return Promise.resolve(null);
      arr(hit.provider.installations).forEach(function (i) {
        if (!i) return;
        var same = i.id === hit.inst.id;
        i.selected = same;
        i.shadowed = !same && i.hostId === hit.inst.hostId;
        i.shadowedBy = i.shadowed ? hit.inst.id : undefined;
      });
      op('install-select', ref).queued().running('recomputing-shadowing').done();
      receipt('Installation selected', (str(hit.inst.label) || hit.inst.id) + ' now resolves first. Shadowing recomputed.');
      store.emit('change', { key: 'installations', value: hit.inst.id });
      return Promise.resolve({ ok: true });
    },

    'install-update': function (store, data, ref) {
      var hit = findInstallation(data, ref);
      if (!hit || !hit.inst.update) return Promise.resolve(null);
      var u = hit.inst.update;
      var target = u.available ? u.available.version : hit.inst.version;
      var h = op('install-update', ref).queued();
      u.state = 'updating';
      h.running('updating');
      return delay(1000).then(function () {
        u.state = 'verifying';
        h.running('verifying', {
          checklist: window.PMProvider ? window.PMProvider.VERIFY_CHECKLIST : []
        });
        return delay(1100);
      }).then(function () {
        u.state = 'ready';
        h.running('finalizing');
        return delay(500);
      }).then(function () {
        var from = hit.inst.version;
        hit.inst.version = target;
        u.state = 'up-to-date';
        u.available = null;
        u.history = arr(u.history);
        u.history.unshift({
          when: nowIso(), from: from, to: target, result: 'verified',
          detail: 'Launch health, auth identity, catalog, adapter handshake, and dependent routes all verified.'
        });
        h.done();
        receipt('Update installed', (str(hit.inst.label) || hit.inst.id) + ' updated ' + from + ' to ' + target + ' and verified. Dependent routes refreshed.');
        store.emit('change', { key: 'installations', value: hit.inst.id });
        return { ok: true };
      });
    },

    'install-update-fail': function (store, data, ref) {
      var hit = findInstallation(data, ref);
      if (!hit || !hit.inst.update) return Promise.resolve(null);
      var u = hit.inst.update;
      var target = u.available ? u.available.version : '(staged)';
      var from = hit.inst.version;
      var h = op('install-update-fail', ref).queued();
      u.state = 'updating';
      h.running('updating');
      return delay(1000).then(function () {
        u.state = 'verifying';
        h.running('verifying');
        return delay(1100);
      }).then(function () {
        u.state = 'verification-failed';
        h.running('rolling-back', { reason: 'adapter handshake rejected' });
        u.history = arr(u.history);
        u.history.unshift({
          when: nowIso(), from: from, to: target, result: 'verification-failed',
          detail: 'Install succeeded (exit code 0), but the adapter handshake failed. Exit code alone is never success.'
        });
        return delay(700);
      }).then(function () {
        u.state = 'rolled-back';
        u.rollbackNote = 'Version ' + target + ' failed verification; ' + from + ' was restored and re-verified automatically.';
        u.history.unshift({
          when: nowIso(), from: target, to: from, result: 'rolled-back',
          detail: 'Previous generation restored and re-verified. Dependent routes refreshed.'
        });
        h.degraded({ reason: 'verification-failed-rolled-back' });
        receipt('Update rolled back', 'Verification failed after a clean install, so the previous generation was restored. Both steps are in the history.');
        store.emit('change', { key: 'installations', value: hit.inst.id });
        return { ok: true, rolledBack: true };
      });
    },

    'install-repair': function (store, data, ref) {
      var hit = findInstallation(data, ref);
      if (!hit || !hit.inst.update) return Promise.resolve(null);
      var u = hit.inst.update;
      var h = op('install-repair', ref).queued();
      u.state = 'updating';
      h.running('re-linking');
      return delay(1200).then(function () {
        u.state = 'up-to-date';
        delete u.repairNote;
        h.done();
        receipt('Repair complete', (str(hit.inst.label) || hit.inst.id) + ' re-linked and verified.');
        store.emit('change', { key: 'installations', value: hit.inst.id });
        return { ok: true };
      });
    },

    /* -- settings lifecycle -- */

    'import-preview': function (store, data) {
      if (!data.settingsLifecycle) return Promise.resolve(null);
      var h = op('import-preview', null).queued();
      h.running('reading-file');
      return delay(700).then(function () {
        data.settingsLifecycle.importPreview.state = 'staged';
        h.done();
        store.emit('lifecycle', { phase: 'staged' });
        receipt('Import preview staged', 'The file was read and classified. Nothing is applied until you confirm.');
        return { ok: true };
      });
    },

    'import-cancel': function (store, data) {
      if (!data.settingsLifecycle) return Promise.resolve(null);
      data.settingsLifecycle.importPreview.state = 'dormant';
      op('import-cancel', null).queued().canceled({ reason: 'user-canceled' });
      store.emit('lifecycle', { phase: 'cancelled' });
      receipt('Import cancelled', 'Nothing was applied. The staged restore point was discarded.');
      return Promise.resolve({ ok: true });
    },

    'import-apply': function (store, data) {
      if (!data.settingsLifecycle) return Promise.resolve(null);
      var lc = data.settingsLifecycle;
      var h = op('import-apply', null).queued();
      h.running('creating-restore-point');
      return delay(600).then(function () {
        h.running('applying', { completed: 0, total: 21 });
        return delay(900);
      }).then(function () {
        h.running('verifying', { completed: 21, total: 21 });
        return delay(600);
      }).then(function () {
        lc.importPreview.state = 'applied';
        lc.history = arr(lc.history);
        lc.history.unshift({
          when: nowIso(), action: 'import-applied', receiptId: 'rcpt.settings.import.live',
          detail: '21 changes applied atomically from ' + str(lc.importPreview.source) +
            '. Restore point ' + str(lc.importPreview.restorePointId) + ' created first.'
        });
        h.done({ completed: 21, total: 21 });
        store.emit('lifecycle', { phase: 'applied' });
        receipt('Import applied', '21 changes applied atomically. Rollback stays one click away.');
        return { ok: true };
      });
    },

    'import-rollback': function (store, data) {
      if (!data.settingsLifecycle) return Promise.resolve(null);
      var lc = data.settingsLifecycle;
      var h = op('import-rollback', null).queued();
      h.running('restoring-snapshot');
      return delay(900).then(function () {
        lc.importPreview.state = 'rolled-back';
        lc.rollbackJustCompleted = {
          when: nowIso(), receiptId: 'rcpt.settings.rollback.live',
          detail: 'All imported changes reverted from the pre-import snapshot.'
        };
        lc.history = arr(lc.history);
        lc.history.unshift({
          when: nowIso(), action: 'rollback-complete', receiptId: 'rcpt.settings.rollback.live',
          detail: 'Rolled back to the pre-import snapshot. The receipt records both directions.'
        });
        h.done();
        store.emit('lifecycle', { phase: 'rolled-back' });
        receipt('Rollback complete', 'Settings match the pre-import snapshot again.');
        return { ok: true };
      });
    },

    /* -- sounds and notification destinations -- */

    'sound-preview': function (store, data, ref) {
      /* Local-only by canon: an op event for the UI, deliberately NO receipt. */
      var h = op('sound-preview', ref).queued();
      h.running('playing');
      return delay(600).then(function () {
        h.done();
        return { ok: true, localOnly: true };
      });
    },

    'sound-upload': function (store, data) {
      if (!data.notifications || !data.notifications.sounds) return Promise.resolve(null);
      var lib = data.notifications.sounds.library;
      var h = op('sound-upload', null).queued();
      h.running('checking-format-and-license');
      return delay(800).then(function () {
        if (!lib.some(function (s) { return s && s.id === 'snd.upload-fixture'; })) {
          lib.push({
            id: 'snd.upload-fixture', name: 'gentle-bell.ogg', source: 'upload',
            format: 'ogg', sampleRate: 48000, duration: 1.0, hash: 'sha256:fixt-demo',
            license: 'User provided', uploadedAt: nowIso(), defaultFor: []
          });
        }
        h.done();
        store.emit('sounds', { phase: 'uploaded', id: 'snd.upload-fixture' });
        receipt('Sound uploaded', 'gentle-bell.ogg checked (format, duration, hash) and added to the library.');
        return { ok: true, id: 'snd.upload-fixture' };
      });
    },

    'pack-import': function (store, data, ref) {
      if (!data.notifications || !data.notifications.sounds) return Promise.resolve(null);
      var pack = arr(data.notifications.sounds.packs).filter(function (p) {
        return p && p.id === str(ref);
      })[0] || arr(data.notifications.sounds.packs).filter(function (p) {
        return p && p.state !== 'imported';
      })[0];
      if (!pack) return Promise.resolve(null);
      var h = op('pack-import', pack.id).queued();
      h.running('format-check');
      return delay(700).then(function () {
        h.running('license-check');
        return delay(700);
      }).then(function () {
        if (pack.formatCheck && pack.formatCheck.result === 'failed') {
          h.failed({ reason: 'format' });
          receipt('Pack rejected', str(pack.name) + ': ' + str(pack.formatCheck.detail));
          return { ok: false, reason: 'format' };
        }
        if (pack.licenseCheck && pack.licenseCheck.result !== 'verified') {
          h.failed({ reason: 'license' });
          receipt('Import blocked', str(pack.name) + ' has no verifiable license. Unverified packs are never enabled.');
          return { ok: false, reason: 'license' };
        }
        pack.state = 'imported';
        pack.importedAt = nowIso();
        h.done();
        receipt('Pack imported', str(pack.name) + ' imported with verified license and format.');
        return { ok: true };
      });
    },

    'dest-test': function (store, data, ref) {
      if (!data.notifications) return Promise.resolve(null);
      var now = Date.now();
      if (timeScale > 0 && now - lastTestSend < 30000 && lastTestSend !== 0) {
        op('dest-test', ref).queued({ waitReason: 'waiting_resource' })
          .retryable({ reason: 'rate-limited' });
        receipt('Test held', 'Test sends are limited to one per 30 seconds per destination.');
        return Promise.resolve({ ok: false, rateLimited: true });
      }
      lastTestSend = now;
      var dest = arr(data.notifications.destinations).filter(function (d) {
        return d && d.id === str(ref);
      })[0] || arr(data.notifications.destinations).filter(function (d) {
        return d && d.state === 'ready' && !d.builtIn;
      })[0];
      if (!dest) return Promise.resolve(null);
      var h = op('dest-test', dest.id).queued();
      h.running('sending');
      return delay(900).then(function () {
        var ok = dest.state === 'ready';
        dest.lastTest = { when: nowIso(), ok: ok, receiptId: 'rcpt.test.' + dest.id + '.live', masked: true };
        if (ok) h.done(); else h.failed({ reason: 'destination-not-ready' });
        receipt('Destination test', (ok ? 'Delivered to ' : 'Failed for ') + str(dest.label) + '. Payload masked; receipt kept.');
        store.emit('notifications', { phase: 'tested', id: dest.id, ok: ok });
        return { ok: ok, destId: dest.id };
      });
    },

    /* -- appearance -- */

    'theme-reload': function (store, data, ref) {
      if (!data.appearance) return Promise.resolve(null);
      var t = arr(data.appearance.customThemes).filter(function (x) {
        return x && x.id === str(ref);
      })[0] || arr(data.appearance.customThemes).filter(function (x) {
        return x && x.state === 'invalid';
      })[0];
      if (!t) return Promise.resolve(null);
      var h = op('theme-reload', t.id).queued();
      h.running('validating');
      return delay(800).then(function () {
        if (arr(t.errors).length > 0) {
          h.failed({ reason: 'invalid', errors: t.errors });
          receipt('Theme still invalid', str(t.name) + ': line ' + t.errors[0].line + ' — ' + str(t.errors[0].message) + ' The base theme stays in effect.');
          return { ok: false };
        }
        t.lastLoaded = nowIso();
        h.done();
        receipt('Theme reloaded', str(t.name) + ' validated and applied live.');
        return { ok: true };
      });
    },

    /* -- storage, backup, index, cleanup -- */

    'backup-now': function (store, data, ref) {
      if (!data.backups) return Promise.resolve(null);
      var kind = str(ref) || 'bk.settings';
      var h = op('backup-now', kind).queued();
      h.running('snapshotting');
      return delay(900).then(function () {
        h.running('verifying');
        return delay(600);
      }).then(function () {
        if (!arr(data.backups.restorePoints).some(function (rp) {
          return rp && rp.id === 'rp.manual-demo';
        })) {
          data.backups.restorePoints.unshift({
            id: 'rp.manual-demo', kind: kind, label: 'Manual backup (just now)',
            when: nowIso(), origin: 'manual', verified: true,
            sizeMB: kind === 'bk.settings' ? 2 : 1840
          });
        }
        h.done();
        store.emit('backup', { phase: 'done', kind: kind });
        receipt('Backup complete', 'A verified restore point was created and listed.');
        return { ok: true };
      });
    },

    'test-restore': function (store, data) {
      if (!data.backups) return Promise.resolve(null);
      var h = op('test-restore', null).queued();
      h.running('restoring-to-scratch');
      return delay(1100).then(function () {
        h.running('verifying-hashes');
        return delay(700);
      }).then(function () {
        data.backups.testRestore.last = {
          when: nowIso(),
          point: (arr(data.backups.restorePoints)[0] || {}).id || 'rp.settings.auto-0805',
          result: 'passed', target: 'scratch dataset',
          note: 'Restored to a scratch dataset and verified hashes; the live project was never touched.'
        };
        h.done();
        store.emit('backup', { phase: 'test-restore-passed' });
        receipt('Test restore passed', 'The newest restore point restored cleanly to scratch. Hashes verified.');
        return { ok: true };
      });
    },

    'index-rebuild': function (store, data) {
      if (!data.searchIndex) return Promise.resolve(null);
      var ix = data.searchIndex;
      var total = 14382; /* known only once the scan completes */
      var h = op('index-rebuild', null).queued();
      ix.enabled = true;
      /* Scanning has no denominator yet: honest indeterminate phase. */
      ix.phase = 'scanning';
      ix.progress = { note: 'Scanning the tree', source: 'unknown' };
      h.running('scanning');
      store.emit('searchIndex', { phase: 'scanning' });
      return delay(800).then(function () {
        /* The scan produced a real file count: determinate from here on. */
        ix.phase = 'indexing';
        ix.progress = { completed: 6470, total: total, note: 'Indexing files', source: 'measured' };
        h.running('indexing', { completed: 6470, total: total });
        store.emit('searchIndex', { phase: 'indexing' });
        return delay(1000);
      }).then(function () {
        ix.phase = 'ready';
        ix.progress = null;
        ix.files = total;
        ix.lastBuild = nowIso();
        ix.failures = [{ path: 'assets/font-pack.bin', reason: 'Binary detection failed; skipped.' }];
        delete rowStatesOf(data)['system.searchIndex'];
        h.done({ completed: total, total: total });
        store.emit('searchIndex', { phase: 'ready' });
        receipt('Index rebuilt', '14,382 files indexed. One path skipped, listed under failures.');
        return { ok: true };
      });
    },

    'cleanup-dry-run': function (store, data) {
      if (!data.cleanup) return Promise.resolve(null);
      var h = op('cleanup-dry-run', null).queued();
      h.running('estimating');
      return delay(900).then(function () {
        data.cleanup.dryRun.last = {
          when: nowIso(),
          wouldFreeMB: 2100,
          skipped: [{ ref: 'wt.goal-142', reason: 'Leased by Goal #142; never touched by cleanup.' }],
          receiptId: 'rcpt.cleanup.dry.live'
        };
        h.done({ wouldFreeMB: 2100 });
        store.emit('cleanup', { phase: 'dry-run-done' });
        receipt('Dry run complete', 'About 2.1 GB reclaimable. One leased worktree skipped. Nothing was deleted.');
        return { ok: true };
      });
    },

    /* -- developer tooling -- */

    'formatter-test': function (store, data, ref) {
      if (!data.formatters) return Promise.resolve(null);
      var f = arr(data.formatters.entries).filter(function (x) {
        return x && x.id === str(ref);
      })[0] || arr(data.formatters.entries).filter(function (x) {
        return x && x.state === 'detected';
      })[0];
      if (!f) return Promise.resolve(null);
      var h = op('formatter-test', f.id).queued();
      h.running('formatting-sample');
      return delay(800).then(function () {
        if (f.state !== 'detected') {
          h.failed({ reason: f.state });
          receipt('Formatter test failed', str(f.name) + ' is ' + f.state + '; nothing ran.');
          return { ok: false };
        }
        f.lastTest = {
          when: nowIso(), ok: true,
          sample: { before: 'const x={a:1,b:2}', after: 'const x = { a: 1, b: 2 };' }
        };
        h.done();
        store.emit('formatters', { phase: 'tested', id: f.id });
        receipt('Formatter test', str(f.name) + ' formatted the sample. Before and after are shown on the row.');
        return { ok: true };
      });
    },

    'lsp-restart': function (store, data, ref) {
      var l = arr(data.lsp).filter(function (x) {
        return x && (x.id === str(ref) || x.name === str(ref));
      })[0] || arr(data.lsp).filter(function (x) {
        return x && x.state === 'installed';
      })[0];
      if (!l) return Promise.resolve(null);
      var h = op('lsp-restart', l.id).queued();
      h.running('stopping');
      return delay(500).then(function () {
        h.running('starting');
        return delay(700);
      }).then(function () {
        l.lastRestart = nowIso();
        h.done();
        store.emit('lsp', { phase: 'restarted', id: l.id });
        receipt('Language server restarted', (str(l.name) || l.id) + ' reattached to its open documents.');
        return { ok: true };
      });
    },

    'actions-refresh': function (store, data) {
      if (!data.githubActions) return Promise.resolve(null);
      if (data.githubActions.refreshDisabled) {
        op('actions-refresh', null).queued({ waitReason: 'waiting_network' })
          .retryable({ reason: 'offline' });
        receipt('Refresh unavailable', str(data.githubActions.refreshDisabled));
        return Promise.resolve({ ok: false });
      }
      var h = op('actions-refresh', null).queued();
      h.running('fetching-runs');
      return delay(1000).then(function () {
        data.githubActions.refreshedAt = nowIso();
        h.done();
        store.emit('actions', { phase: 'refreshed' });
        receipt('Workflows refreshed', 'Pinned workflow readiness and the latest runs were re-fetched.');
        return { ok: true };
      });
    },

    /* -- permissions, sync, teacher -- */

    'permission-test': function (store, data, ref) {
      if (!data.permissionsModel) return Promise.resolve(null);
      var input = str(ref) || 'shell.exec: git push --force origin main';
      var h = op('permission-test', input).queued();
      h.running('evaluating');
      return delay(500).then(function () {
        var trace = deepClone(data.permissionsModel.evaluationTrace);
        trace.input = input;
        h.done({ trace: trace });
        store.emit('permissions', { phase: 'trace', trace: trace });
        receipt('Rule test', str(trace.explanation));
        return { ok: true, trace: trace };
      });
    },

    'changed-elsewhere': function (store, data) {
      var id = 'general.startup.restore-panel';
      var cur = readValue(store.values, id);
      var next = cur === 'Chat' ? 'File Manager' : 'Chat';
      writeValue(store.values, id, next, { changedFromDefault: true, by: 'MacBook Air' });
      setRowState(data, id, 'changed-elsewhere',
        'Changed to "' + next + '" on MacBook Air just now.');
      pushNotice(data, {
        id: 'pm2-trg-elsewhere', kind: 'attention', statusWord: 'Needs attention',
        headline: 'A setting just changed on MacBook Air',
        consequence: 'Panel To Open On Launch now differs from what this window showed.',
        primary: { label: 'Show the row', act: 'open-changed' },
        target: { cat: 'general', sub: 'startup', settingId: id }
      });
      op('changed-elsewhere', id).queued().done();
      store.emit('value', { id: id, source: 'elsewhere' });
      store.emit('notices', { phase: 'added' });
      return Promise.resolve({ ok: true });
    },

    'teacher-explain': function (store, data, ref) {
      if (!data.teacher) return Promise.resolve(null);
      var topic = arr(data.teacher.topics).filter(function (t) {
        return t && t.id === str(ref);
      })[0] || arr(data.teacher.topics)[0];
      if (!topic) return Promise.resolve(null);
      data.teacher.lastSession = nowIso();
      op('teacher-explain', topic.id).queued().done({ topic: deepClone(topic) });
      store.emit('teacher', { phase: 'open', topic: deepClone(topic) });
      return Promise.resolve({ ok: true, topicId: topic.id });
    },

    /* -- copy transaction (engine lives in pm2-copy.js) -- */

    'copy-preview': function (store, data, ref) {
      var copy = window.PM2.copy;
      if (!copy || typeof copy.preview !== 'function') {
        receipt('Copy unavailable', 'The copy engine has not loaded.');
        return Promise.resolve(null);
      }
      var sources = copy.sources();
      var source = null;
      arr(sources).forEach(function (s) { if (!source && s && s.id === str(ref)) source = s; });
      if (!source) source = arr(sources)[0];
      if (!source) return Promise.resolve(null);
      var cats = arr(source.categorySummaries).map(function (c) { return c.cat; });
      var pv = copy.preview(source.id, cats);
      receipt('Copy preview staged', 'From ' + source.name + ': ' +
        pv.counts.add + ' to add, ' + pv.counts.replace + ' to replace, ' +
        pv.counts.unchanged + ' unchanged, ' + pv.counts.unavailable + ' unavailable, ' +
        pv.counts.conflict + ' conflicts. Nothing is applied until you confirm.');
      store.emit('copy', { phase: 'preview', token: pv.token, sourceId: source.id });
      return Promise.resolve({ ok: true, token: pv.token });
    },

    'copy-apply': function (store, data, ref) {
      var copy = window.PM2.copy;
      if (!copy || typeof copy.apply !== 'function') {
        receipt('Copy unavailable', 'The copy engine has not loaded.');
        return Promise.resolve(null);
      }
      var token = str(ref) || (typeof copy.lastToken === 'function' ? str(copy.lastToken()) : '');
      var start = Promise.resolve(token);
      if (!token) {
        start = TRIGGERS['copy-preview'](store, data, null).then(function (r) {
          return r && r.token ? r.token : '';
        });
      }
      return start.then(function (tk) {
        if (!tk) return null;
        return copy.apply(tk);
      });
    },

    'copy-rollback': function (store, data, ref) {
      var copy = window.PM2.copy;
      if (!copy || typeof copy.rollback !== 'function') {
        receipt('Copy unavailable', 'The copy engine has not loaded.');
        return Promise.resolve(null);
      }
      var rid = str(ref) || (typeof copy.lastReceiptId === 'function' ? str(copy.lastReceiptId()) : '');
      if (!rid) {
        receipt('Nothing to roll back', 'No copy transaction has been applied in this session.');
        return Promise.resolve({ ok: false });
      }
      return Promise.resolve(copy.rollback(rid));
    },

    /* -- stress -- */

    'stress-load': function (store) {
      var h = op('stress-load', null).queued();
      h.running('generating', { completed: 0, total: STRESS_COUNT });
      return delay(400).then(function () {
        h.running('generating', { completed: 1000, total: STRESS_COUNT });
        stressRecordsList(); /* build and cache */
        return delay(400);
      }).then(function () {
        setStress(true);
        h.done({ completed: STRESS_COUNT, total: STRESS_COUNT });
        receipt('Stress data loaded', STRESS_COUNT + ' clearly-synthetic zz-stress records are now visible to search and the compendium. The real inventory is untouched.');
        return { ok: true, count: STRESS_COUNT };
      });
    }
  };
  TRIGGERS['catalog-refresh'] = TRIGGERS['provider-refresh'];
  TRIGGERS['sound-test'] = TRIGGERS['dest-test'];

  function trigger(name, ref) {
    var store = resolveStore();
    if (!store) return Promise.resolve(null);
    var fn = TRIGGERS[name];
    if (!fn) return Promise.resolve(null);
    try { return Promise.resolve(fn(store, store.data, ref)); }
    catch (e) { return Promise.resolve(null); }
  }

  /* ---------------- floating States drawer ----------------
     Test-harness affordance, not Settings UI. New code, pm2-drawer-
     class prefix. Keyboard reachable, Esc closes, guarded for headless
     (node smoke) loads. */

  var DRAWER_CSS = [
    '.pm2-drawer-btn{position:fixed;right:16px;bottom:34px;z-index:9000;',
    'display:inline-flex;align-items:center;gap:6px;padding:7px 12px;',
    'background:var(--surface-elevated,#26262b);color:var(--text-primary,#e8e8ec);',
    'border:1px solid var(--border,#3a3a42);border-radius:var(--radius-pill,999px);',
    'font-family:var(--body-font,inherit);font-size:var(--fs-sm,13px);cursor:pointer;',
    'box-shadow:var(--elev-2,0 6px 20px rgba(0,0,0,.3));}',
    '.pm2-drawer-btn:focus-visible{outline:2px solid var(--accent-primary,#7aa2f7);outline-offset:2px;}',
    '.pm2-drawer-btn i{display:inline-flex;width:16px;height:16px;}',
    '.pm2-drawer-btn i svg{width:100%;height:100%;}',
    /* Audit fix: at narrow widths the pill occluded page content (audited on
       three concepts). Shrink to a translucent icon dot that solidifies on
       hover/focus; the label is still exposed to the accessibility tree. */
    '@media (max-width:920px){',
    '.pm2-drawer-btn{padding:7px;opacity:.55;}',
    '.pm2-drawer-btn .pm2-drawer-btn-label{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;}',
    '.pm2-drawer-btn:hover,.pm2-drawer-btn:focus-visible,.pm2-drawer-btn[aria-expanded="true"]{opacity:1;}',
    '}',
    '.pm2-drawer-panel{position:fixed;right:16px;bottom:78px;z-index:9001;width:292px;',
    'max-height:min(70vh,540px);overflow:auto;padding:14px;',
    'background:var(--surface-elevated,#26262b);color:var(--text-primary,#e8e8ec);',
    'border:1px solid var(--border,#3a3a42);border-radius:var(--radius-lg,12px);',
    'box-shadow:var(--elev-3,0 12px 36px rgba(0,0,0,.4));',
    'font-family:var(--body-font,inherit);font-size:var(--fs-sm,13px);}',
    '.pm2-drawer-panel h3{margin:0 0 8px;font-size:var(--fs-sm,13px);font-weight:700;',
    'color:var(--text-secondary,#b8b8c0);text-transform:none;}',
    '.pm2-drawer-panel h3 + h3{margin-top:14px;}',
    '.pm2-drawer-panel [role="radio"],.pm2-drawer-panel [role="checkbox"],',
    '.pm2-drawer-item{display:flex;align-items:center;gap:8px;width:100%;text-align:left;',
    'padding:7px 9px;margin:2px 0;background:none;border:1px solid transparent;',
    'border-radius:var(--radius-sm,7px);color:inherit;font:inherit;cursor:pointer;}',
    '.pm2-drawer-panel [role="radio"][aria-checked="true"]{',
    'background:var(--accent-soft,rgba(122,162,247,.14));',
    'border-color:var(--border-light,#4a4a52);font-weight:600;}',
    '.pm2-drawer-panel [role="radio"]:hover,.pm2-drawer-panel [role="checkbox"]:hover,',
    '.pm2-drawer-item:hover{background:var(--surface-alt,#2e2e34);}',
    '.pm2-drawer-panel [role="radio"]:focus-visible,',
    '.pm2-drawer-panel [role="checkbox"]:focus-visible,',
    '.pm2-drawer-item:focus-visible{outline:2px solid var(--accent-primary,#7aa2f7);outline-offset:1px;}',
    '.pm2-drawer-dot{width:8px;height:8px;border-radius:50%;flex:none;',
    'border:1.5px solid var(--text-muted,#8a8a92);}',
    '[role="radio"][aria-checked="true"] .pm2-drawer-dot,',
    '[role="checkbox"][aria-checked="true"] .pm2-drawer-dot{',
    'background:var(--accent-primary,#7aa2f7);border-color:var(--accent-primary,#7aa2f7);}',
    '.pm2-drawer-note{margin:12px 0 0;color:var(--text-muted,#8a8a92);',
    'font-size:var(--fs-xs,12px);line-height:1.45;}'
  ].join('');

  var TRIGGER_GROUPS = [
    { title: 'Providers', items: [
      { name: 'provider-refresh', label: 'Refresh provider catalog', ico: 'refresh' },
      { name: 'catalog-refresh', label: 'Refresh model catalog', ico: 'layers' },
      { name: 'reconnect', label: 'Reconnect provider', ico: 'plug' },
      { name: 'invoke-test', label: 'Run invocation test', ico: 'play' }
    ] },
    { title: 'Installations', items: [
      { name: 'install-scan', label: 'Scan for installations', ico: 'search' },
      { name: 'install-select', label: 'Select an installation', ico: 'check' },
      { name: 'install-update', label: 'Install update (verifies)', ico: 'download' },
      { name: 'install-update-fail', label: 'Update fails, rolls back', ico: 'warning' },
      { name: 'install-repair', label: 'Repair installation', ico: 'wrench' }
    ] },
    { title: 'Settings lifecycle', items: [
      { name: 'import-preview', label: 'Stage import preview', ico: 'doc' },
      { name: 'import-apply', label: 'Apply staged import', ico: 'check' },
      { name: 'import-rollback', label: 'Roll back import', ico: 'history' },
      { name: 'import-cancel', label: 'Cancel import', ico: 'close' }
    ] },
    { title: 'Copy settings', items: [
      { name: 'copy-preview', label: 'Preview a copy (first source)', ico: 'doc' },
      { name: 'copy-apply', label: 'Apply the staged copy', ico: 'copy' },
      { name: 'copy-rollback', label: 'Roll back the last copy', ico: 'history' }
    ] },
    { title: 'Sounds & notifications', items: [
      { name: 'sound-upload', label: 'Upload a sound (fixture)', ico: 'upload' },
      { name: 'sound-preview', label: 'Preview a sound (local only)', ico: 'play' },
      { name: 'dest-test', label: 'Test a destination (receipted)', ico: 'chat' },
      { name: 'sound-test', label: 'Test a sound destination', ico: 'bell' },
      { name: 'pack-import', label: 'Import a sound pack', ico: 'folder' }
    ] },
    { title: 'Appearance', items: [
      { name: 'theme-reload', label: 'Reload custom theme', ico: 'palette' }
    ] },
    { title: 'Storage & index', items: [
      { name: 'backup-now', label: 'Back up now', ico: 'copy' },
      { name: 'test-restore', label: 'Test restore (to scratch)', ico: 'checkCircle' },
      { name: 'index-rebuild', label: 'Rebuild search index', ico: 'refresh' },
      { name: 'cleanup-dry-run', label: 'Cleanup dry run', ico: 'trash' }
    ] },
    { title: 'Tools', items: [
      { name: 'formatter-test', label: 'Test a formatter', ico: 'edit' },
      { name: 'lsp-restart', label: 'Restart a language server', ico: 'bolt' },
      { name: 'actions-refresh', label: 'Refresh GitHub Actions', ico: 'branch' }
    ] },
    { title: 'Safety & help', items: [
      { name: 'permission-test', label: 'Test a permission rule', ico: 'shield' },
      { name: 'changed-elsewhere', label: 'Change a setting elsewhere', ico: 'users' },
      { name: 'teacher-explain', label: 'Open Teacher on this screen', ico: 'info' }
    ] }
  ];

  function injectDrawerCss() {
    try {
      if (document.getElementById('pm2-drawer-css')) return;
      var el = document.createElement('style');
      el.id = 'pm2-drawer-css';
      el.textContent = DRAWER_CSS;
      document.head.appendChild(el);
    } catch (e) { /* headless */ }
  }

  function mountDrawer(store) {
    if (typeof document === 'undefined' || !document.body) return null;
    if (store) attach(store);
    if (!resolveStore()) return null;
    if (document.querySelector('.pm2-drawer-btn')) return null; /* mount once */
    injectDrawerCss();

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pm2-drawer-btn';
    btn.setAttribute('aria-haspopup', 'dialog');
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = '<i aria-hidden="true">' + icon('layers') + '</i><span class="pm2-drawer-btn-label">States</span>';

    var panel = document.createElement('div');
    panel.className = 'pm2-drawer-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Demo states');
    panel.hidden = true;

    /* -- scenarios -- */
    var hScn = document.createElement('h3');
    hScn.textContent = 'Scenario';
    panel.appendChild(hScn);

    var group = document.createElement('div');
    group.setAttribute('role', 'radiogroup');
    group.setAttribute('aria-label', 'Scenario');
    panel.appendChild(group);

    var radios = [];
    SCENARIOS.forEach(function (scn) {
      var r = document.createElement('button');
      r.type = 'button';
      r.setAttribute('role', 'radio');
      var on = scn.id === activeScenario;
      r.setAttribute('aria-checked', on ? 'true' : 'false');
      r.dataset.scenario = scn.id;
      r.tabIndex = on ? 0 : -1;
      r.innerHTML = '<span class="pm2-drawer-dot" aria-hidden="true"></span><span>' +
        (scn.label || scn.id) + '</span>';
      r.addEventListener('click', function () {
        radios.forEach(function (x) {
          var sel = x === r;
          x.setAttribute('aria-checked', sel ? 'true' : 'false');
          x.tabIndex = sel ? 0 : -1;
        });
        applyScenario(scn.id);
      });
      group.appendChild(r);
      radios.push(r);
    });

    group.addEventListener('keydown', function (e) {
      var idx = radios.indexOf(document.activeElement);
      if (idx < 0) return;
      var next = -1;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = (idx + 1) % radios.length;
      else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = (idx - 1 + radios.length) % radios.length;
      else if (e.key === ' ' || e.key === 'Enter') { radios[idx].click(); e.preventDefault(); return; }
      if (next >= 0) {
        e.preventDefault();
        radios[next].focus();
        radios[next].click();
      }
    });

    /* -- fixtures -- */
    var hFx = document.createElement('h3');
    hFx.textContent = 'Fixture overlays';
    panel.appendChild(hFx);

    FIXTURES.forEach(function (fx) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('role', 'checkbox');
      var on = activeFixtures.indexOf(fx.id) >= 0;
      b.setAttribute('aria-checked', on ? 'true' : 'false');
      b.dataset.fixture = fx.id;
      b.innerHTML = '<span class="pm2-drawer-dot" aria-hidden="true"></span><span>' +
        fx.label + '</span>';
      b.addEventListener('click', function () {
        var now = b.getAttribute('aria-checked') !== 'true';
        b.setAttribute('aria-checked', now ? 'true' : 'false');
        var ids = [];
        panel.querySelectorAll('[data-fixture][aria-checked="true"]').forEach(function (el) {
          ids.push(el.dataset.fixture);
        });
        setFixtures(ids);
      });
      panel.appendChild(b);
    });

    /* -- stress -- */
    var hSt = document.createElement('h3');
    hSt.textContent = 'Stress';
    panel.appendChild(hSt);

    var stressBtn = document.createElement('button');
    stressBtn.type = 'button';
    stressBtn.setAttribute('role', 'checkbox');
    stressBtn.setAttribute('aria-checked', stressOn ? 'true' : 'false');
    stressBtn.dataset.stress = '1';
    stressBtn.innerHTML = '<span class="pm2-drawer-dot" aria-hidden="true"></span><span>' +
      'Stress data (2,000 synthetic records)</span>';
    stressBtn.addEventListener('click', function () {
      var now = stressBtn.getAttribute('aria-checked') !== 'true';
      stressBtn.setAttribute('aria-checked', now ? 'true' : 'false');
      setStress(now);
    });
    panel.appendChild(stressBtn);

    var stressLoad = document.createElement('button');
    stressLoad.type = 'button';
    stressLoad.className = 'pm2-drawer-item';
    stressLoad.dataset.trigger = 'stress-load';
    stressLoad.innerHTML = '<i aria-hidden="true" style="display:inline-flex;width:14px;height:14px;">' +
      icon('gauge') + '</i><span>Load stress data (staged)</span>';
    stressLoad.addEventListener('click', function () {
      trigger('stress-load').then(function () {
        stressBtn.setAttribute('aria-checked', stressOn ? 'true' : 'false');
      });
    });
    panel.appendChild(stressLoad);

    /* -- trigger families -- */
    TRIGGER_GROUPS.forEach(function (grp) {
      var h = document.createElement('h3');
      h.textContent = grp.title;
      panel.appendChild(h);
      grp.items.forEach(function (t) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'pm2-drawer-item';
        b.dataset.trigger = t.name;
        b.innerHTML = '<i aria-hidden="true" style="display:inline-flex;width:14px;height:14px;">' +
          icon(t.ico) + '</i><span>' + t.label + '</span>';
        b.addEventListener('click', function () { trigger(t.name); });
        panel.appendChild(b);
      });
    });

    var note = document.createElement('p');
    note.className = 'pm2-drawer-note';
    note.textContent = 'Scenario and fixtures persist per concept. Preview widths are controlled from the Concept Hub, not from this drawer.';
    panel.appendChild(note);

    function openPanel() {
      panel.hidden = false;
      btn.setAttribute('aria-expanded', 'true');
      var checked = radios.filter(function (r) {
        return r.getAttribute('aria-checked') === 'true';
      })[0];
      (checked || radios[0] || panel).focus();
      document.addEventListener('mousedown', onOutside, true);
    }
    function closePanel(refocus) {
      panel.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
      document.removeEventListener('mousedown', onOutside, true);
      if (refocus) btn.focus();
    }
    function onOutside(e) {
      if (!panel.contains(e.target) && e.target !== btn && !btn.contains(e.target)) {
        closePanel(false);
      }
    }

    btn.addEventListener('click', function () {
      if (panel.hidden) openPanel(); else closePanel(true);
    });
    panel.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.stopPropagation(); closePanel(true); }
    });

    try {
      document.body.appendChild(btn);
      document.body.appendChild(panel);
    } catch (e) { return null; }
    return { button: btn, drawer: panel, close: closePanel };
  }

  /* ---------------- public API ---------------- */

  window.PM2.states = {
    onStoreInit: onStoreInit,
    attach: attach,
    store: function () { return resolveStore(); },

    scenarios: SCENARIOS,
    applyScenario: applyScenario,
    activeScenario: function () { return activeScenario; },

    fixtures: FIXTURES.map(function (fx) { return { id: fx.id, label: fx.label }; }),
    setFixtures: setFixtures,
    activeFixtures: function () { return activeFixtures.slice(); },

    setStress: setStress,
    stressActive: function () { return stressOn; },
    stressRecords: stressRecordsList,

    rowState: function (id) {
      var store = resolveStore();
      if (!store || !store.data) return null;
      return obj(store.data.rowStates)[id] || null;
    },
    rowStates: function () {
      var store = resolveStore();
      if (!store || !store.data) return {};
      return obj(store.data.rowStates);
    },

    op: op,
    setTimescale: setTimescale,
    timescale: function () { return timeScale; },
    delay: delay,
    receipt: receipt,

    trigger: trigger,
    triggerNames: function () { return Object.keys(TRIGGERS); },

    mountDrawer: mountDrawer
  };

})();
