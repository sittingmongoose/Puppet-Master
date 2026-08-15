/* pm-state.js — window.PMState
   fable Settings bakeoff shared state engine.
   Single semantics resolver + scenarios + transient triggers + receipts +
   States drawer + shared fuzzy search. Plain JS, no dependencies.
   Slint note: store events map to a Model change-notification bus; the
   drawer maps to a debug overlay window. No emoji anywhere. */
(function () {
  'use strict';

  var NS_ROOT = 'pm.settingsConcepts.fable.';
  var currentStore = null;
  var pristineJson = null; // snapshot of PM_DATA for scenario resets

  /* ---------------- utilities ---------------- */

  function deepClone(obj) {
    try { return JSON.parse(JSON.stringify(obj)); } catch (e) { return {}; }
  }

  function baseData() {
    if (pristineJson === null) {
      try { pristineJson = JSON.stringify(window.PM_DATA || {}); }
      catch (e) { pristineJson = '{}'; }
    }
    try { return JSON.parse(pristineJson); } catch (e) { return {}; }
  }

  function arr(x) { return Array.isArray(x) ? x : []; }
  function obj(x) { return (x && typeof x === 'object') ? x : {}; }
  function str(x) { return (typeof x === 'string') ? x : ''; }

  function icon(name) {
    try {
      if (window.PMIcons && typeof window.PMIcons.get === 'function') {
        return window.PMIcons.get(name) || '';
      }
    } catch (e) { /* ignore */ }
    return '';
  }

  /* Build settingId -> {domainId, subId, domainTitle, subTitle} from taxonomy. */
  function buildSettingIndex(data) {
    var index = {};
    arr(obj(data).taxonomy).forEach(function (dom) {
      arr(dom.subs).forEach(function (sub) {
        arr(sub.settingIds).forEach(function (sid) {
          index[sid] = {
            domainId: dom.id, subId: sub.id,
            domainTitle: str(dom.title), subTitle: str(sub.title)
          };
        });
      });
    });
    return index;
  }

  /* ---------------- store ---------------- */

  function createStore(conceptId) {
    var ns = NS_ROOT + (conceptId || 'concept') + '.';
    var listeners = {};
    var mem = {};

    var store = {
      data: baseData(),
      conceptId: conceptId || 'concept',
      get: function (key) {
        if (Object.prototype.hasOwnProperty.call(mem, key)) return mem[key];
        try {
          var raw = window.localStorage.getItem(ns + key);
          if (raw == null) return undefined;
          var val = JSON.parse(raw);
          mem[key] = val;
          return val;
        } catch (e) { return undefined; }
      },
      set: function (key, value) {
        mem[key] = value;
        try { window.localStorage.setItem(ns + key, JSON.stringify(value)); }
        catch (e) { /* storage may be unavailable; in-memory still works */ }
        store.emit('change', { key: key, value: value });
      },
      on: function (evt, fn) {
        if (typeof fn !== 'function') return function () {};
        (listeners[evt] || (listeners[evt] = [])).push(fn);
        return function () {
          var list = listeners[evt] || [];
          var i = list.indexOf(fn);
          if (i >= 0) list.splice(i, 1);
        };
      },
      emit: function (evt, payload) {
        arr(listeners[evt]).slice().forEach(function (fn) {
          try { fn(payload); } catch (e) { /* listener errors stay local */ }
        });
      }
    };
    return store;
  }

  /* ---------------- value formatting ---------------- */

  function optionLabel(setting, value) {
    var opts = arr(setting.options);
    for (var i = 0; i < opts.length; i++) {
      var o = opts[i];
      if (o && typeof o === 'object') {
        if (o.value === value || o.id === value) return str(o.label) || String(value);
      } else if (o === value) {
        return String(o);
      }
    }
    return value == null ? '' : String(value);
  }

  function isBlank(v) {
    return v === undefined || v === null || v === '' ||
      (Array.isArray(v) && v.length === 0) ||
      (typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0);
  }

  function formatValue(setting, v) {
    var type = str(setting.type);
    if (type === 'toggle') return v ? 'On' : 'Off';
    if (type === 'select' || type === 'radio') return optionLabel(setting, v);
    if (type === 'number' || type === 'slider') return v == null ? '' : String(v);
    if (type === 'list' || type === 'multiselect') {
      var n = Array.isArray(v) ? v.length : 0;
      if (type === 'multiselect') return n === 1 ? '1 selected' : n + ' selected';
      return n === 1 ? '1 item' : n + ' items';
    }
    if (type === 'keyvalue') {
      var k = (v && typeof v === 'object') ? Object.keys(v).length : 0;
      return k === 1 ? '1 entry' : k + ' entries';
    }
    if (type === 'action') return str(v) || 'Open';
    // text / path / anything else
    return v == null ? '' : String(v);
  }

  var SOURCE_LABELS = {
    'default': 'Default',
    'custom': 'Set here',
    'inherited': 'Inherited',
    'auto': 'Chosen automatically',
    'managed': 'Managed by workspace policy',
    'recommended': 'Recommended',
    'not-configured': 'Not configured'
  };

  var FLAG_META = {
    restart: { icon: 'refresh', label: 'Restart required' },
    reconnect: { icon: 'plug', label: 'Reconnect required' },
    cost: { icon: 'gauge', label: 'Affects cost' },
    privacy: { icon: 'lock', label: 'Privacy impact' },
    safety: { icon: 'shield', label: 'Safety relevant' },
    perf: { icon: 'bolt', label: 'Performance impact' }
  };

  /* THE single semantics resolver. All concepts render rows from this. */
  function resolveRowState(setting) {
    var s = obj(setting);
    var source = str(s.valueSource) || 'default';
    var exposure = str(s.exposure) || 'standard';
    var chips = [];
    var flags = [];
    var valueLabel = '';
    var valueKind = 'custom';
    var statusTone = 'ok';
    var editable = true;

    // Flags first (independent of value semantics).
    var f = obj(s.flags);
    Object.keys(FLAG_META).forEach(function (key) {
      if (f[key]) {
        flags.push({ icon: FLAG_META[key].icon, label: FLAG_META[key].label });
      }
    });

    var blank = isBlank(s.value);

    if (exposure === 'unavailable') {
      valueKind = 'unavailable';
      valueLabel = 'Unavailable';
      chips.push({ kind: 'unavailable', label: 'Unavailable' });
      editable = false;
      statusTone = 'muted';
    } else if (source === 'managed' || exposure === 'managed') {
      valueKind = 'managed';
      valueLabel = blank ? 'Managed' : formatValue(s, s.value);
      chips.push({ kind: 'managed', label: 'Managed' });
      editable = false;
      statusTone = 'muted';
    } else if (source === 'auto') {
      valueKind = 'auto';
      valueLabel = blank ? 'Automatic' : formatValue(s, s.value);
      chips.push({ kind: 'auto', label: 'Automatic' });
      statusTone = 'ok';
    } else if (source === 'inherited') {
      valueKind = 'inherited';
      valueLabel = blank ? 'Inherited' : formatValue(s, s.value);
      chips.push({ kind: 'inherited', label: 'Inherited' });
      statusTone = 'ok';
    } else if (source === 'not-configured') {
      valueKind = 'not-configured';
      valueLabel = 'Not configured';
      chips.push({ kind: 'not-configured', label: 'Not configured' });
      statusTone = 'setup';
    } else if (source === 'recommended') {
      valueKind = 'recommended';
      valueLabel = blank ? 'Recommended' : formatValue(s, s.value);
      chips.push({ kind: 'recommended', label: 'Recommended' });
      statusTone = 'ok';
    } else if (source === 'default') {
      valueKind = 'default';
      valueLabel = formatValue(s, s.value !== undefined ? s.value : s['default']);
      if (valueLabel === '') valueLabel = 'Default';
      chips.push({ kind: 'default', label: 'Default' });
      statusTone = 'ok';
    } else { // custom
      valueKind = 'custom';
      valueLabel = formatValue(s, s.value);
      if (valueLabel === '') valueLabel = 'Custom';
      chips.push({ kind: 'custom', label: 'Custom' });
      statusTone = 'ok';
    }

    // Effective value differs from the configured value.
    if (s.effective !== undefined && !isBlank(s.effective) &&
        JSON.stringify(s.effective) !== JSON.stringify(s.value)) {
      chips.push({ kind: 'differs', label: 'Effective: ' + formatValue(s, s.effective) });
      if (statusTone === 'ok') statusTone = 'attention';
    }

    // A recommendation the user has not adopted.
    if (s.recommended !== undefined && editable &&
        JSON.stringify(s.recommended) !== JSON.stringify(s.value) &&
        source !== 'recommended') {
      if (statusTone === 'ok') statusTone = 'recommended';
    }

    if (s.riskNote) statusTone = 'attention';

    var sourceLabel = SOURCE_LABELS[source] || 'Default';
    if (source === 'managed' && s.managedReason) sourceLabel = str(s.managedReason);
    if (exposure === 'unavailable' && s.unavailableReason) sourceLabel = str(s.unavailableReason);
    if (s.scopeNote) sourceLabel = sourceLabel + ' · ' + str(s.scopeNote);

    return {
      valueLabel: valueLabel,
      valueKind: valueKind,
      sourceLabel: sourceLabel,
      chips: chips,
      flags: flags,
      exposure: exposure,
      editable: editable,
      statusTone: statusTone
    };
  }

  var NOTICE_WORDS = {
    attention: 'Needs attention',
    setup: 'Setup',
    recommended: 'Recommended'
  };

  function resolveNotice(notice) {
    var n = obj(notice);
    var kind = str(n.kind) || 'recommended';
    return {
      tone: kind,
      statusWord: str(n.statusWord) || NOTICE_WORDS[kind] || 'Notice',
      headline: str(n.headline),
      consequence: str(n.consequence),
      primary: obj(n.primary),
      secondary: n.secondary ? obj(n.secondary) : null
    };
  }

  /* ---------------- scenarios ---------------- */

  var scenarios = [
    { id: 'baseline', label: 'Baseline (mixed states)' },
    { id: 'calm', label: 'Calm' },
    { id: 'attention-heavy', label: 'Attention heavy' },
    { id: 'usage-exhausted', label: 'Usage exhausted' },
    { id: 'invocation-failed', label: 'Invocation failed' },
    { id: 'managed-workspace', label: 'Managed workspace' },
    { id: 'first-run', label: 'First run (nothing set up)' },
    { id: 'offline', label: 'Offline (air-gapped)' }
  ];

  /* Synthetic notices pool used only when the demo data does not already
     carry enough notices for the attention-heavy scenario. */
  var NOTICE_POOL = {
    attention: [
      { id: 'pm-syn-att-1', kind: 'attention', statusWord: 'Needs attention',
        headline: 'Claude session expired',
        consequence: 'Runs that route to Claude will pause until you sign in again.',
        primary: { label: 'Sign in again', act: 'reconnect' },
        target: { domain: 'system' } },
      { id: 'pm-syn-att-2', kind: 'attention', statusWord: 'Needs attention',
        headline: 'A connected server stopped responding',
        consequence: 'Tools from that server are unavailable until it reconnects.',
        primary: { label: 'Reconnect server', act: 'reconnect' },
        target: { domain: 'extensions' } },
      { id: 'pm-syn-att-3', kind: 'attention', statusWord: 'Needs attention',
        headline: 'Included usage is nearly exhausted',
        consequence: 'New runs may queue or switch routes when the balance reaches zero.',
        primary: { label: 'Review usage', act: 'open-usage' },
        target: { domain: 'system' } }
    ],
    setup: [
      { id: 'pm-syn-set-1', kind: 'setup', statusWord: 'Setup',
        headline: 'Finish connecting GitHub Copilot',
        consequence: 'Sign-in completed, but no model has been activated yet.',
        primary: { label: 'Choose models', act: 'open-provider' },
        target: { domain: 'agents' } },
      { id: 'pm-syn-set-2', kind: 'setup', statusWord: 'Setup',
        headline: 'A language server is available for this project',
        consequence: 'Code navigation stays basic until it is installed.',
        primary: { label: 'Install now', act: 'install-lsp' },
        target: { domain: 'code' } }
    ],
    recommended: [
      { id: 'pm-syn-rec-1', kind: 'recommended', statusWord: 'Recommended',
        headline: 'Pin a faster model for quick edits',
        consequence: 'Short edits currently use the same route as deep work.',
        primary: { label: 'Review suggestion', act: 'open-roles' },
        target: { domain: 'agents' } },
      { id: 'pm-syn-rec-2', kind: 'recommended', statusWord: 'Recommended',
        headline: 'Enable memory review before saving',
        consequence: 'New gists are saved without review in this project.',
        primary: { label: 'Turn on review', act: 'open-memory' },
        target: { domain: 'context' } }
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
        var exists = data.notices.some(function (n) { return n && n.id === cand.id; });
        if (!exists) { data.notices.push(deepClone(cand)); have++; }
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

  var SCENARIO_MUTATIONS = {
    'baseline': function () { /* pristine clone already exhibits mixed states */ },

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
    },

    'attention-heavy': function (data) {
      ensureNoticeCounts(data, { attention: 3, setup: 2, recommended: 2 });
      var flipped = 0;
      eachProvider(data, function (p) {
        if (flipped === 0 && p.status === 'ready') { p.status = 'degraded'; p.statusNote = 'Responses are slower than usual.'; flipped++; }
        else if (flipped === 1 && p.status === 'ready') { p.status = 'signed-out'; p.statusNote = 'Signed out. Sign in to resume.'; flipped++; }
      });
      /* New manager families join the pressure: one installation needs repair,
         one free route cools down, storage pressure rises a notch. */
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
      eachAccount(data, function (a) {
        if (!a.usage) a.usage = {};
        a.usage.includedRemaining = (typeof a.usage.includedRemaining === 'number') ? 0 : 'None remaining';
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
          if (row && typeof row === 'object' && !Array.isArray(row) && ('pressure' in row || 'includedRemaining' in row)) {
            row.pressure = 'exhausted';
            row.includedRemaining = (typeof row.includedRemaining === 'number') ? 0 : 'None remaining';
          }
        });
      }
      if (!Array.isArray(data.notices)) data.notices = [];
      data.notices.unshift({
        id: 'pm-scn-usage', kind: 'attention', statusWord: 'Needs attention',
        headline: 'Included usage is exhausted on every connected account',
        consequence: 'New runs wait for the next reset unless another route is chosen.',
        primary: { label: 'Choose what happens next', act: 'open-usage' },
        target: { domain: 'system' }
      });
    },

    'invocation-failed': function (data) {
      var marked = false;
      eachProvider(data, function (p) {
        if (!marked && arr(p.accounts).length > 0) {
          p.status = 'auth-no-invoke';
          p.statusNote = 'Signed in, but the last invocation was rejected. The session may lack API access.';
          if (p.defaultAnswerBlock) p.defaultAnswerBlock.attention = true;
          marked = true;
        }
      });
      if (!Array.isArray(data.notices)) data.notices = [];
      data.notices.unshift({
        id: 'pm-scn-invoke', kind: 'attention', statusWord: 'Needs attention',
        headline: 'Signed in, but invocations are failing',
        consequence: 'The account authenticates, yet model calls are rejected. Runs on this route will not start.',
        primary: { label: 'Run invocation test', act: 'invoke-test' },
        secondary: { label: 'Switch account', act: 'switch-account' },
        target: { domain: 'agents' }
      });
    },

    'managed-workspace': function (data) {
      data.managedWorkspace = {
        active: true,
        label: 'Managed workspace',
        note: 'Your workspace administrator manages some settings. Managed rows show why and cannot be changed here.'
      };
      var settings = obj(data.settings);
      var index = buildSettingIndex(data);
      Object.keys(settings).forEach(function (id) {
        var s = settings[id];
        if (!s) return;
        var inPermissions = (index[id] && index[id].domainId === 'permissions') ||
          String(id).indexOf('permissions.') === 0;
        var safetyFlagged = obj(s.flags).safety === true;
        if (inPermissions || safetyFlagged) {
          s.exposure = 'managed';
          s.valueSource = 'managed';
          if (!s.managedReason) s.managedReason = 'Managed by workspace policy';
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
      if (!Array.isArray(data.notices)) data.notices = [];
      data.notices.unshift({
        id: 'pm-scn-managed', kind: 'setup', statusWord: 'Setup',
        headline: 'This workspace applies a managed policy',
        consequence: 'Permission and safety settings follow the workspace policy and are read-only here.',
        primary: { label: 'View policy summary', act: 'open-policy' },
        target: { domain: 'permissions' }
      });
    },

    /* Systematic EMPTY: the honest first-open state. Every manager renders
       its real empty state; nothing is configured, nothing is fake. */
    'first-run': function (data) {
      data.firstRun = true;
      data.notices = [{
        id: 'pm-scn-firstrun', kind: 'setup', statusWord: 'Setup',
        headline: 'Nothing is set up yet',
        consequence: 'Connect a provider to start working. Everything else can wait.',
        primary: { label: 'Set up a provider', act: 'open-provider' },
        target: { domain: 'agents' }
      }];
      data.recents = [];
      eachProvider(data, function (p) {
        p.accounts = [];
        p.models = [];
        p.installations = [];
        if (p.groupKind === 'server') { p.status = 'not-configured'; p.statusNote = 'No server connection has been added.'; }
        else if (p.id === 'free-community') { p.status = 'ready'; p.statusNote = 'Available once an underlying route exists.'; }
        else { p.status = p.setupOffer ? 'not-installed' : 'signed-out'; p.statusNote = 'Not set up yet.'; }
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
        if (t) { t.installed = false; t.projectEnabled = false; t.available = false; t.selectedThisTurn = false; t.invokedRecently = false; }
      });
      arr(data.lsp).forEach(function (l) { if (l && l.state === 'installed') { l.state = 'detected'; } });
      if (data.notifications) {
        data.notifications.destinations = arr(data.notifications.destinations)
          .filter(function (d) { return d && d.builtIn; });
        if (data.notifications.sounds) {
          data.notifications.sounds.library = arr(data.notifications.sounds.library)
            .filter(function (s) { return s && s.source === 'built-in'; });
          data.notifications.sounds.packs = [];
        }
      }
      if (data.appearance) { data.appearance.customThemes = []; }
      if (data.backups) { data.backups.restorePoints = []; data.backups.testRestore = { last: null }; }
      if (data.settingsLifecycle) {
        data.settingsLifecycle.lastExport = null;
        data.settingsLifecycle.importPreview.state = 'dormant';
        data.settingsLifecycle.history = [];
      }
      if (data.sessionsHistory) { data.sessionsHistory.sessions = []; }
      if (data.artifacts) { data.artifacts.entries = []; }
      if (data.sourceControl) {
        arr(data.sourceControl.forges).forEach(function (f) {
          if (f) { f.state = 'not-connected'; f.account = null; }
        });
        if (data.sourceControl.worktrees) { data.sourceControl.worktrees.active = []; }
        if (data.sourceControl.ssh) { data.sourceControl.ssh.keys = []; data.sourceControl.ssh.state = 'none'; }
      }
      if (data.githubActions) { data.githubActions.pinned = []; data.githubActions.runs = []; }
      if (data.searchIndex) {
        data.searchIndex.enabled = false; data.searchIndex.phase = 'disabled';
        data.searchIndex.files = 0; data.searchIndex.diskMB = 0; data.searchIndex.failures = [];
        data.searchIndex.lastBuild = null;
      }
      if (data.cleanup) {
        arr(data.cleanup.categories).forEach(function (c) { if (c) { c.count = 0; c.sizeMB = 0; c.safety = null; } });
        data.cleanup.dryRun.last = null;
      }
      if (data.storage) { data.storage.quarantine = []; }
      if (data.teacher) { data.teacher.lastSession = null; }
      if (data.permissionsModel) {
        data.permissionsModel.rules = arr(data.permissionsModel.rules)
          .filter(function (r) { return r && (r.locked || r.origin === 'global default'); });
        data.permissionsModel.perPersona = [];
        data.permissionsModel.doomLoop.lastTrip = null;
      }
    },

    /* Systematic UNAVAILABLE: the air-gapped state. Remote things fail with
       honest reasons; last-known-good catalogs stay usable. */
    'offline': function (data) {
      data.offline = true;
      eachProvider(data, function (p) {
        if (p.id === 'local-ollama') { return; /* local server keeps working */ }
        if (p.groupKind === 'server') {
          p.status = 'unreachable';
          p.statusNote = 'The network is unavailable. Reconnects automatically when it returns.';
          if (p.serverInfo) { p.serverInfo.reachability = 'unreachable'; }
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
          if (f && f.state === 'connected') { f.state = 'unreachable'; f.stateNote = 'Offline. Local repositories keep working.'; }
        });
      }
      if (data.githubActions) {
        data.githubActions.refreshDisabled = 'Offline. Showing the last fetched runs.';
      }
      if (data.webResearch) {
        arr(data.webResearch.providers).forEach(function (w) {
          if (w && !w.builtIn) { w.state = 'unavailable'; w.stateNote = 'Offline. This route needs the network.'; }
        });
        data.webResearch.airgap = 'detected';
      }
      if (data.serverTopology) {
        arr(data.serverTopology.hosts).forEach(function (h) {
          if (h && h.id !== 'host.win-desktop') { h.state = 'offline'; }
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
      if (!Array.isArray(data.notices)) data.notices = [];
      data.notices.unshift({
        id: 'pm-scn-offline', kind: 'attention', statusWord: 'Needs attention',
        headline: 'Working offline',
        consequence: 'Remote providers, forges, and delivery destinations are unavailable. Local models and repositories keep working; catalogs show their last-known-good state.',
        primary: { label: 'Review what still works', act: 'open-provider' },
        target: { domain: 'agents' }
      });
    }
  };

  /* ---------------- fixture overlays ----------------
     Composable, additive mutations applied AFTER the scenario on the same
     fresh clone. Orthogonal axes: scenario x fixtures x route. Each overlay
     is idempotent. */

  function pushNotice(data, notice) {
    if (!Array.isArray(data.notices)) data.notices = [];
    if (data.notices.some(function (n) { return n && n.id === notice.id; })) return;
    data.notices.unshift(deepClone(notice));
  }

  var FIXTURES = [
    {
      id: 'fx.import-conflict', label: 'Settings import: conflicts staged',
      apply: function (data) {
        if (data.settingsLifecycle) { data.settingsLifecycle.importPreview.state = 'staged'; }
        pushNotice(data, {
          id: 'pm-fx-import', kind: 'setup', statusWord: 'Setup',
          headline: 'A settings import is waiting for review',
          consequence: '3 conflicts need a decision before anything is applied. A restore point is already staged.',
          primary: { label: 'Review the preview', act: 'open-lifecycle' },
          target: { domain: 'system', sub: 'settings-lifecycle' }
        });
      }
    },
    {
      id: 'fx.rollback-complete', label: 'Settings import: rollback complete',
      apply: function (data) {
        if (data.settingsLifecycle) {
          data.settingsLifecycle.importPreview.state = 'rolled-back';
          data.settingsLifecycle.rollbackJustCompleted = {
            when: '2026-08-05T14:26:00-07:00', receiptId: 'rcpt.settings.rollback.0805',
            detail: 'All 9 imported changes reverted from the pre-import snapshot. The receipt records both directions.'
          };
        }
        pushNotice(data, {
          id: 'pm-fx-rollback', kind: 'recommended', statusWord: 'Done',
          headline: 'Rollback complete',
          consequence: 'Settings match the pre-import snapshot again. Nothing else changed.',
          primary: { label: 'Open the receipt', act: 'open-lifecycle' },
          target: { domain: 'system', sub: 'settings-lifecycle' }
        });
      }
    },
    {
      id: 'fx.changed-elsewhere', label: 'Setting changed on another device',
      apply: function (data) {
        pushNotice(data, {
          id: 'pm-fx-elsewhere', kind: 'attention', statusWord: 'Needs attention',
          headline: 'Two settings changed on MacBook Air',
          consequence: 'This window still showed the old values. The rows are marked; reload them or keep your local value.',
          primary: { label: 'Show the changed rows', act: 'open-changed' },
          target: { domain: 'general', sub: 'startup' }
        });
      }
    },
    {
      id: 'fx.restart-required', label: 'Restart required',
      apply: function (data) {
        if (data.appearance && data.appearance.uiScale) { data.appearance.uiScale.pendingRestart = true; }
        var row = obj(data.settings)['general.visual.ui-scale'];
        if (row) { row.restartPending = true; if (row.flags) { row.flags.restart = true; } }
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
        pushNotice(data, {
          id: 'pm-fx-reconnect', kind: 'attention', statusWord: 'Needs attention',
          headline: 'A connected server needs to reconnect',
          consequence: 'The preferred transport changed; the server stays down until it reconnects.',
          primary: { label: 'Reconnect now', act: 'reconnect' },
          target: { domain: 'extensions', sub: 'mcp' }
        });
      }
    },
    {
      id: 'fx.validation-error', label: 'Validation errors visible',
      apply: function (data) {
        pushNotice(data, {
          id: 'pm-fx-validation', kind: 'attention', statusWord: 'Needs attention',
          headline: 'Two values fail validation',
          consequence: 'The webhook success predicate has a typo, and the fetch size limit is out of range. Both rows show field-level errors.',
          primary: { label: 'Go to the first error', act: 'open-webhook' },
          target: { domain: 'general', sub: 'notifications' }
        });
      }
    },
    {
      id: 'fx.theme-fallback', label: 'Custom theme invalid, fallback active',
      apply: function (data) {
        pushNotice(data, {
          id: 'pm-fx-theme', kind: 'attention', statusWord: 'Needs attention',
          headline: 'Cobalt Mono failed validation',
          consequence: 'Line 41 has an invalid color, so its base theme is in effect until the file is fixed.',
          primary: { label: 'Open the diagnosis', act: 'open-appearance' },
          target: { domain: 'appearance', sub: 'theme' }
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
          id: 'pm-fx-storage', kind: 'attention', statusWord: 'Needs attention',
          headline: 'Storage is nearly full',
          consequence: '2.1 GB free on the vault dataset. Cleanup can reclaim about 2.1 GB safely.',
          primary: { label: 'Run a cleanup dry run', act: 'cleanup-dry-run' },
          secondary: { label: 'Open storage', act: 'open-storage' },
          target: { domain: 'system', sub: 'storage' }
        });
      }
    },
    {
      id: 'fx.credit-guard', label: 'Web credit guard tripped',
      apply: function (data) {
        if (data.webResearch) {
          arr(data.webResearch.providers).forEach(function (w) {
            if (w && w.id === 'web.firecrawl') {
              w.credits.used = w.credits.total;
              w.guard.state = 'stop';
              w.guard.note = '100% of monthly credits used. Crawls are paused by the guard; fetch keeps working.';
              w.state = 'unavailable';
              w.stateNote = 'Paused by the credit guard until the month resets or the cap is raised.';
            }
          });
        }
        pushNotice(data, {
          id: 'pm-fx-credit', kind: 'attention', statusWord: 'Needs attention',
          headline: 'Firecrawl hit its credit cap',
          consequence: 'Crawl and extract are paused by the guard. Search and fetch still work.',
          primary: { label: 'Review web providers', act: 'open-web' },
          target: { domain: 'extensions', sub: 'web' }
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
          id: 'pm-fx-index', kind: 'attention', statusWord: 'Needs attention',
          headline: 'The project index stopped with errors',
          consequence: 'Three paths failed. Search still works from the last good index.',
          primary: { label: 'Rebuild the index', act: 'index-rebuild' },
          target: { domain: 'system', sub: 'search-index' }
        });
      }
    },
    {
      id: 'fx.long-text', label: 'Long labels and explanations',
      apply: function (data) {
        Object.keys(obj(data.settings)).forEach(function (id) {
          var row = data.settings[id];
          if (row && row.labelLocalized && row.labelLocalized.de) {
            row.label = row.labelLocalized.de;
          }
        });
        data.longTextMode = true;
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
          id: 'pm-fx-doom', kind: 'attention', statusWord: 'Needs attention',
          headline: 'A run is paused by the doom-loop guard',
          consequence: 'The same denied operation was retried three times. The run waits for you.',
          primary: { label: 'Review the trace', act: 'open-permissions' },
          target: { domain: 'permissions', sub: 'approvals' }
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

  var activeFixtures = []; // ids, applied in order after every scenario rebuild

  function applyFixturesTo(data, ids) {
    arr(ids).forEach(function (id) {
      var fx = fixtureById(id);
      if (!fx) return;
      try { fx.apply(data); } catch (e) { /* a broken overlay never breaks the page */ }
    });
  }

  function setFixtures(ids, opts) {
    var store = currentStore;
    activeFixtures = arr(ids).filter(function (id) { return !!fixtureById(id); });
    if (!store) return;
    if (!opts || opts.persist !== false) { store.set('fixtures', activeFixtures); }
    rebuild(str(store.get('scenario')) || 'baseline', { persist: false });
  }

  /* Rebuild = fresh clone -> scenario mutation -> fixture overlays. */
  function rebuild(scenarioId, opts) {
    var store = currentStore;
    if (!store) return;
    var fresh = baseData();
    var mutate = SCENARIO_MUTATIONS[scenarioId] || SCENARIO_MUTATIONS['baseline'];
    try { mutate(fresh); } catch (e) { /* keep whatever mutated cleanly */ }
    applyFixturesTo(fresh, activeFixtures);
    store.data = fresh;
    if (!opts || opts.persist !== false) { store.set('scenario', scenarioId); }
    store.emit('scenario', { id: scenarioId, fixtures: activeFixtures.slice() });
  }

  function applyScenario(id, opts) {
    rebuild(id, opts);
  }

  /* ---------------- transient triggers ---------------- */

  function findProvider(data, ref) {
    var list = arr(data.providers);
    if (ref != null) {
      for (var i = 0; i < list.length; i++) {
        if (list[i] && (list[i].id === ref || list[i].name === ref)) return list[i];
      }
    }
    return list[0] || null;
  }

  /* Probe timescale: route param instant=1 sets it to 0 so every staged
     transition settles deterministically without wall-clock waits. */
  var timeScale = 1;
  function setTimescale(n) { timeScale = (typeof n === 'number' && n >= 0) ? n : 1; }

  function delay(ms) {
    return new Promise(function (resolve) { window.setTimeout(resolve, Math.round(ms * timeScale)); });
  }

  /* Truthful ObservableWork-style phase event. Concepts render these; they
     are never skipped in reduced motion (state changes are not animation).
     Decision-register alignment (§11, §16.6): every event declares its
     progress kind and source; determinate progress exists ONLY when a real
     denominator is present, and a bare percentage is never emitted. */
  function op(name, ref, phase, extra) {
    var store = currentStore;
    if (!store) return;
    var payload = { name: name, ref: ref == null ? null : String(ref), phase: phase };
    if (extra) { Object.keys(extra).forEach(function (k) { payload[k] = extra[k]; }); }
    if (typeof payload.completed === 'number' && typeof payload.total === 'number' && payload.total > 0) {
      payload.progressKind = 'determinate';
      payload.source = payload.source || 'measured';
    } else {
      payload.progressKind = 'indeterminate';
      payload.source = payload.source || 'derived';
      delete payload.pct; // no denominator, no percentage
    }
    store.emit('op', payload);
  }

  function notifyStack(title, detail) {
    try {
      if (window.PMShell && typeof window.PMShell.notify === 'function') {
        window.PMShell.notify({ title: title, detail: detail });
      }
    } catch (e) { /* the stack is shell chrome; never fail a trigger over it */ }
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
        if (inst && (inst.id === want || (!want && inst.selected))) { found = { provider: p, inst: inst }; }
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

  /* ---- trigger registry -------------------------------------------- */

  var TRIGGERS = {

    'provider-refresh': function (store, data, ref) {
      var p = findProvider(data, ref);
      if (!p) return Promise.resolve(null);
      if (!p.catalog) p.catalog = {};
      p.catalog.state = 'refreshing';
      p.catalog.lastKnownGood = true; // existing rows stay usable while refreshing
      store.emit('provider', { id: p.id, phase: 'refreshing' });
      store.emit('catalog', { providerId: p.id, state: 'refreshing' });
      return delay(1200).then(function () {
        p.catalog.state = 'fresh';
        p.catalog.lastChecked = new Date().toISOString();
        p.catalog.lastKnownGood = true;
        store.emit('provider', { id: p.id, phase: 'done' });
        store.emit('catalog', { providerId: p.id, state: 'fresh' });
        return { ok: true, providerId: p.id };
      });
    },

    'reconnect': function (store, data, ref) {
      /* An MCP server id reconnects that server; anything else keeps the
         provider behavior (exact provider id, or first provider when the
         drawer fires it with no ref). */
      var want = str(ref);
      var mcpHit = null;
      if (want) {
        arr(data.mcp).forEach(function (s) {
          if (!mcpHit && s && (s.id === want || s.name === want)) { mcpHit = s; }
        });
        var providerExact = arr(data.providers).some(function (p) {
          return p && (p.id === want || p.name === want);
        });
        if (mcpHit && !providerExact) {
          mcpHit.state = 'reconnecting';
          store.emit('mcp', { id: mcpHit.id, phase: 'reconnecting' });
          return delay(1200).then(function () {
            mcpHit.state = 'connected';
            delete mcpHit.reconnectRequired;
            mcpHit.stateNote = 'Reconnected. Tools rediscovered and the discovery cache is fresh.';
            store.emit('mcp', { id: mcpHit.id, phase: 'done' });
            receipt('Server reconnected', (str(mcpHit.name) || mcpHit.id) + ' negotiated its transport and rediscovered tools.');
            return { ok: true, mcpId: mcpHit.id };
          });
        }
      }
      var pr = findProvider(data, ref);
      if (!pr) return Promise.resolve(null);
      var previous = pr.status;
      pr.status = 'refreshing';
      pr.statusNote = 'Reconnecting…';
      store.emit('provider', { id: pr.id, phase: 'reconnecting' });
      return delay(1400).then(function () {
        pr.status = 'ready';
        pr.statusNote = 'Connected and responding normally.';
        store.emit('provider', { id: pr.id, phase: 'done', previous: previous });
        return { ok: true, providerId: pr.id };
      });
    },

    'invoke-test': function (store, data, ref) {
      var pi = findProvider(data, ref);
      if (!pi) return Promise.resolve(null);
      store.emit('provider', { id: pi.id, phase: 'invoke-running' });
      return delay(1000).then(function () {
        var ok = pi.status === 'ready' || pi.status === 'degraded';
        store.emit('provider', { id: pi.id, phase: 'invoke-done', ok: ok });
        receipt('Invocation test', ok
          ? 'A short test call succeeded on ' + (str(pi.name) || 'the provider') + '.'
          : 'The test call was rejected. The account signs in but cannot invoke models.');
        return { ok: ok, providerId: pi.id };
      });
    },

    /* -- installation lifecycle -- */

    'install-scan': function (store, data, ref) {
      op('install-scan', ref, 'scanning');
      return delay(900).then(function () {
        op('install-scan', ref, 'done', { found: 0 });
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
      op('install-select', ref, 'done');
      receipt('Installation selected', (str(hit.inst.label) || hit.inst.id) + ' now resolves first. Shadowing recomputed.');
      store.emit('change', { key: 'installations', value: hit.inst.id });
      return Promise.resolve({ ok: true });
    },

    'install-update': function (store, data, ref) {
      var hit = findInstallation(data, ref);
      if (!hit || !hit.inst.update) return Promise.resolve(null);
      var u = hit.inst.update;
      var target = u.available ? u.available.version : hit.inst.version;
      u.state = 'updating'; op('install-update', ref, 'updating');
      return delay(1000).then(function () {
        u.state = 'verifying'; op('install-update', ref, 'verifying', { checklist: window.PMProvider ? window.PMProvider.VERIFY_CHECKLIST : [] });
        return delay(1100);
      }).then(function () {
        u.state = 'ready'; op('install-update', ref, 'ready');
        return delay(500);
      }).then(function () {
        var from = hit.inst.version;
        hit.inst.version = target;
        u.state = 'up-to-date';
        u.available = null;
        u.history = arr(u.history);
        u.history.unshift({ when: new Date().toISOString(), from: from, to: target, result: 'verified', detail: 'Launch health, auth identity, catalog, adapter handshake, and dependent routes all verified.' });
        op('install-update', ref, 'done');
        receipt('Update installed', (str(hit.inst.label) || hit.inst.id) + ' updated ' + from + ' → ' + target + ' and verified. Dependent routes refreshed.');
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
      u.state = 'updating'; op('install-update-fail', ref, 'updating');
      return delay(1000).then(function () {
        u.state = 'verifying'; op('install-update-fail', ref, 'verifying');
        return delay(1100);
      }).then(function () {
        u.state = 'verification-failed';
        op('install-update-fail', ref, 'verification-failed', { reason: 'adapter handshake rejected' });
        u.history = arr(u.history);
        u.history.unshift({ when: new Date().toISOString(), from: from, to: target, result: 'verification-failed', detail: 'Install succeeded (exit code 0), but the adapter handshake failed. Exit code alone is never success.' });
        return delay(700);
      }).then(function () {
        u.state = 'rolled-back';
        u.rollbackNote = 'Version ' + target + ' failed verification; ' + from + ' was restored and re-verified automatically.';
        u.history.unshift({ when: new Date().toISOString(), from: target, to: from, result: 'rolled-back', detail: 'Previous generation restored and re-verified. Dependent routes refreshed.' });
        op('install-update-fail', ref, 'rolled-back');
        receipt('Update rolled back', 'Verification failed after a clean install, so the previous generation was restored. Both steps are in the history.');
        store.emit('change', { key: 'installations', value: hit.inst.id });
        return { ok: true, rolledBack: true };
      });
    },

    'install-repair': function (store, data, ref) {
      var hit = findInstallation(data, ref);
      if (!hit || !hit.inst.update) return Promise.resolve(null);
      var u = hit.inst.update;
      u.state = 'updating'; op('install-repair', ref, 'repairing');
      return delay(1200).then(function () {
        u.state = 'up-to-date';
        delete u.repairNote;
        op('install-repair', ref, 'done');
        receipt('Repair complete', (str(hit.inst.label) || hit.inst.id) + ' re-linked and verified.');
        store.emit('change', { key: 'installations', value: hit.inst.id });
        return { ok: true };
      });
    },

    /* -- settings lifecycle -- */

    'import-preview': function (store, data) {
      if (!data.settingsLifecycle) return Promise.resolve(null);
      op('import-preview', null, 'reading');
      return delay(700).then(function () {
        data.settingsLifecycle.importPreview.state = 'staged';
        op('import-preview', null, 'staged');
        store.emit('lifecycle', { phase: 'staged' });
        return { ok: true };
      });
    },

    'import-cancel': function (store, data) {
      if (!data.settingsLifecycle) return Promise.resolve(null);
      data.settingsLifecycle.importPreview.state = 'dormant';
      op('import-cancel', null, 'done');
      store.emit('lifecycle', { phase: 'cancelled' });
      receipt('Import cancelled', 'Nothing was applied. The staged restore point was discarded.');
      return Promise.resolve({ ok: true });
    },

    'import-apply': function (store, data) {
      if (!data.settingsLifecycle) return Promise.resolve(null);
      var lc = data.settingsLifecycle;
      op('import-apply', null, 'restore-point');
      return delay(600).then(function () {
        op('import-apply', null, 'applying');
        return delay(900);
      }).then(function () {
        op('import-apply', null, 'verifying');
        return delay(600);
      }).then(function () {
        lc.importPreview.state = 'applied';
        lc.history = arr(lc.history);
        lc.history.unshift({ when: new Date().toISOString(), action: 'import-applied', receiptId: 'rcpt.settings.import.live', detail: '21 changes applied atomically from ' + str(lc.importPreview.source) + '. Restore point ' + str(lc.importPreview.restorePointId) + ' created first.' });
        op('import-apply', null, 'done');
        store.emit('lifecycle', { phase: 'applied' });
        receipt('Import applied', '21 changes applied atomically. Rollback stays one click away.');
        return { ok: true };
      });
    },

    'import-rollback': function (store, data) {
      if (!data.settingsLifecycle) return Promise.resolve(null);
      var lc = data.settingsLifecycle;
      op('import-rollback', null, 'rolling-back');
      return delay(900).then(function () {
        lc.importPreview.state = 'rolled-back';
        lc.rollbackJustCompleted = {
          when: new Date().toISOString(), receiptId: 'rcpt.settings.rollback.live',
          detail: 'All imported changes reverted from the pre-import snapshot.'
        };
        lc.history = arr(lc.history);
        lc.history.unshift({ when: new Date().toISOString(), action: 'rollback-complete', receiptId: 'rcpt.settings.rollback.live', detail: 'Rolled back to the pre-import snapshot. The receipt records both directions.' });
        op('import-rollback', null, 'done');
        store.emit('lifecycle', { phase: 'rolled-back' });
        receipt('Rollback complete', 'Settings match the pre-import snapshot again.');
        return { ok: true };
      });
    },

    /* -- sounds and notification destinations -- */

    'sound-preview': function (store, data, ref) {
      /* Local-only by canon: an op event for the UI, deliberately NO receipt. */
      op('sound-preview', ref, 'playing');
      return delay(600).then(function () {
        op('sound-preview', ref, 'done');
        return { ok: true, localOnly: true };
      });
    },

    'sound-upload': function (store, data) {
      if (!data.notifications || !data.notifications.sounds) return Promise.resolve(null);
      var lib = data.notifications.sounds.library;
      op('sound-upload', null, 'checking');
      return delay(800).then(function () {
        if (!lib.some(function (s) { return s && s.id === 'snd.upload-fixture'; })) {
          lib.push({
            id: 'snd.upload-fixture', name: 'gentle-bell.ogg', source: 'upload',
            format: 'ogg', sampleRate: 48000, duration: 1.0, hash: 'sha256:fixt…demo',
            license: 'User provided', uploadedAt: new Date().toISOString(), defaultFor: []
          });
        }
        op('sound-upload', null, 'done');
        store.emit('sounds', { phase: 'uploaded', id: 'snd.upload-fixture' });
        receipt('Sound uploaded', 'gentle-bell.ogg checked (format, duration, hash) and added to the library.');
        return { ok: true, id: 'snd.upload-fixture' };
      });
    },

    'pack-import': function (store, data, ref) {
      if (!data.notifications || !data.notifications.sounds) return Promise.resolve(null);
      var pack = arr(data.notifications.sounds.packs).filter(function (p) { return p && p.id === str(ref); })[0]
        || arr(data.notifications.sounds.packs).filter(function (p) { return p && p.state !== 'imported'; })[0];
      if (!pack) return Promise.resolve(null);
      op('pack-import', pack.id, 'format-check');
      return delay(700).then(function () {
        op('pack-import', pack.id, 'license-check');
        return delay(700);
      }).then(function () {
        if (pack.formatCheck && pack.formatCheck.result === 'failed') {
          op('pack-import', pack.id, 'rejected', { reason: 'format' });
          receipt('Pack rejected', str(pack.name) + ': ' + str(pack.formatCheck.detail));
          return { ok: false, reason: 'format' };
        }
        if (pack.licenseCheck && pack.licenseCheck.result !== 'verified') {
          op('pack-import', pack.id, 'blocked', { reason: 'license' });
          receipt('Import blocked', str(pack.name) + ' has no verifiable license. Unverified packs are never enabled.');
          return { ok: false, reason: 'license' };
        }
        pack.state = 'imported';
        pack.importedAt = new Date().toISOString();
        op('pack-import', pack.id, 'done');
        receipt('Pack imported', str(pack.name) + ' imported with verified license and format.');
        return { ok: true };
      });
    },

    'dest-test': function (store, data, ref) {
      if (!data.notifications) return Promise.resolve(null);
      var now = Date.now();
      if (timeScale > 0 && now - lastTestSend < 30000 && lastTestSend !== 0) {
        op('dest-test', ref, 'rate-limited', { waitReason: 'waiting_resource' });
        receipt('Test held', 'Test sends are limited to one per 30 seconds per destination.');
        return Promise.resolve({ ok: false, rateLimited: true });
      }
      lastTestSend = now;
      var dest = arr(data.notifications.destinations).filter(function (d) { return d && d.id === str(ref); })[0]
        || arr(data.notifications.destinations).filter(function (d) { return d && d.state === 'ready' && !d.builtIn; })[0];
      if (!dest) return Promise.resolve(null);
      op('dest-test', dest.id, 'sending');
      return delay(900).then(function () {
        var ok = dest.state === 'ready';
        dest.lastTest = { when: new Date().toISOString(), ok: ok, receiptId: 'rcpt.test.' + dest.id + '.live', masked: true };
        op('dest-test', dest.id, ok ? 'done' : 'failed');
        notifyStack('Test notification', ok
          ? 'A masked test message went to ' + str(dest.label) + '.'
          : 'The test to ' + str(dest.label) + ' failed; the destination reports its reason.');
        receipt('Destination test', (ok ? 'Delivered to ' : 'Failed for ') + str(dest.label) + '. Payload masked; receipt kept.');
        store.emit('notifications', { phase: 'tested', id: dest.id, ok: ok });
        return { ok: ok, destId: dest.id };
      });
    },

    /* -- appearance -- */

    'theme-reload': function (store, data, ref) {
      if (!data.appearance) return Promise.resolve(null);
      var t = arr(data.appearance.customThemes).filter(function (x) { return x && x.id === str(ref); })[0]
        || arr(data.appearance.customThemes).filter(function (x) { return x && x.state === 'invalid'; })[0];
      if (!t) return Promise.resolve(null);
      op('theme-reload', t.id, 'validating');
      return delay(800).then(function () {
        if (arr(t.errors).length > 0) {
          op('theme-reload', t.id, 'invalid', { errors: t.errors });
          receipt('Theme still invalid', str(t.name) + ': line ' + t.errors[0].line + ' — ' + str(t.errors[0].message) + ' The base theme stays in effect.');
          return { ok: false };
        }
        t.lastLoaded = new Date().toISOString();
        op('theme-reload', t.id, 'done');
        receipt('Theme reloaded', str(t.name) + ' validated and applied live.');
        return { ok: true };
      });
    },

    /* -- storage, backup, index, cleanup -- */

    'backup-now': function (store, data, ref) {
      if (!data.backups) return Promise.resolve(null);
      var kind = str(ref) || 'bk.settings';
      op('backup-now', kind, 'snapshotting');
      return delay(900).then(function () {
        op('backup-now', kind, 'verifying');
        return delay(600);
      }).then(function () {
        if (!arr(data.backups.restorePoints).some(function (rp) { return rp && rp.id === 'rp.manual-demo'; })) {
          data.backups.restorePoints.unshift({
            id: 'rp.manual-demo', kind: kind, label: 'Manual backup (just now)',
            when: new Date().toISOString(), origin: 'manual', verified: true, sizeMB: kind === 'bk.settings' ? 2 : 1840
          });
        }
        op('backup-now', kind, 'done');
        store.emit('backup', { phase: 'done', kind: kind });
        receipt('Backup complete', 'A verified restore point was created and listed.');
        return { ok: true };
      });
    },

    'test-restore': function (store, data) {
      if (!data.backups) return Promise.resolve(null);
      op('test-restore', null, 'restoring-to-scratch');
      return delay(1100).then(function () {
        op('test-restore', null, 'verifying-hashes');
        return delay(700);
      }).then(function () {
        data.backups.testRestore.last = {
          when: new Date().toISOString(), point: (arr(data.backups.restorePoints)[0] || {}).id || 'rp.settings.auto-0805',
          result: 'passed', target: 'scratch dataset',
          note: 'Restored to a scratch dataset and verified hashes; the live project was never touched.'
        };
        op('test-restore', null, 'done');
        store.emit('backup', { phase: 'test-restore-passed' });
        receipt('Test restore passed', 'The newest restore point restored cleanly to scratch. Hashes verified.');
        return { ok: true };
      });
    },

    'index-rebuild': function (store, data) {
      if (!data.searchIndex) return Promise.resolve(null);
      var ix = data.searchIndex;
      var total = 14382; // known only once the scan completes
      ix.enabled = true;
      /* Scanning has no denominator yet: honest indeterminate phase. */
      ix.phase = 'scanning';
      ix.progress = { note: 'Scanning the tree', source: 'unknown' };
      op('index-rebuild', null, 'scanning');
      store.emit('searchIndex', { phase: 'scanning' });
      return delay(800).then(function () {
        /* The scan produced a real file count: determinate from here on. */
        ix.phase = 'indexing';
        ix.progress = { completed: 6470, total: total, note: 'Indexing files', source: 'measured' };
        op('index-rebuild', null, 'indexing', { completed: 6470, total: total });
        store.emit('searchIndex', { phase: 'indexing' });
        return delay(1000);
      }).then(function () {
        ix.phase = 'ready'; ix.progress = null;
        ix.files = total;
        ix.lastBuild = new Date().toISOString();
        ix.failures = [{ path: 'assets/font-pack.bin', reason: 'Binary detection failed; skipped.' }];
        op('index-rebuild', null, 'done', { completed: total, total: total });
        store.emit('searchIndex', { phase: 'ready' });
        receipt('Index rebuilt', '14,382 files indexed. One path skipped, listed under failures.');
        return { ok: true };
      });
    },

    'cleanup-dry-run': function (store, data) {
      if (!data.cleanup) return Promise.resolve(null);
      op('cleanup-dry-run', null, 'estimating');
      return delay(900).then(function () {
        data.cleanup.dryRun.last = {
          when: new Date().toISOString(),
          wouldFreeMB: 2100,
          skipped: [{ ref: 'wt.goal-142', reason: 'Leased by Goal #142; never touched by cleanup.' }],
          receiptId: 'rcpt.cleanup.dry.live'
        };
        op('cleanup-dry-run', null, 'done', { wouldFreeMB: 2100 });
        store.emit('cleanup', { phase: 'dry-run-done' });
        receipt('Dry run complete', 'About 2.1 GB reclaimable. One leased worktree skipped. Nothing was deleted.');
        return { ok: true };
      });
    },

    /* -- developer tooling -- */

    'formatter-test': function (store, data, ref) {
      if (!data.formatters) return Promise.resolve(null);
      var f = arr(data.formatters.entries).filter(function (x) { return x && x.id === str(ref); })[0]
        || arr(data.formatters.entries).filter(function (x) { return x && x.state === 'detected'; })[0];
      if (!f) return Promise.resolve(null);
      op('formatter-test', f.id, 'running');
      return delay(800).then(function () {
        if (f.state !== 'detected') {
          op('formatter-test', f.id, 'failed', { reason: f.state });
          receipt('Formatter test failed', str(f.name) + ' is ' + f.state + '; nothing ran.');
          return { ok: false };
        }
        f.lastTest = { when: new Date().toISOString(), ok: true, sample: { before: 'const x={a:1,b:2}', after: 'const x = { a: 1, b: 2 };' } };
        op('formatter-test', f.id, 'done');
        store.emit('formatters', { phase: 'tested', id: f.id });
        receipt('Formatter test', str(f.name) + ' formatted the sample. Before and after are shown on the row.');
        return { ok: true };
      });
    },

    'lsp-restart': function (store, data, ref) {
      var l = arr(data.lsp).filter(function (x) { return x && (x.id === str(ref) || x.name === str(ref)); })[0]
        || arr(data.lsp).filter(function (x) { return x && x.state === 'installed'; })[0];
      if (!l) return Promise.resolve(null);
      op('lsp-restart', l.id, 'stopping');
      return delay(500).then(function () {
        op('lsp-restart', l.id, 'starting');
        return delay(700);
      }).then(function () {
        l.lastRestart = new Date().toISOString();
        op('lsp-restart', l.id, 'done');
        store.emit('lsp', { phase: 'restarted', id: l.id });
        receipt('Language server restarted', (str(l.name) || l.id) + ' reattached to its open documents.');
        return { ok: true };
      });
    },

    'actions-refresh': function (store, data) {
      if (!data.githubActions) return Promise.resolve(null);
      if (data.githubActions.refreshDisabled) {
        receipt('Refresh unavailable', str(data.githubActions.refreshDisabled));
        return Promise.resolve({ ok: false });
      }
      op('actions-refresh', null, 'fetching');
      return delay(1000).then(function () {
        data.githubActions.refreshedAt = new Date().toISOString();
        op('actions-refresh', null, 'done');
        store.emit('actions', { phase: 'refreshed' });
        receipt('Workflows refreshed', 'Pinned workflow readiness and the latest runs were re-fetched.');
        return { ok: true };
      });
    },

    /* -- permissions, context, teacher -- */

    'permission-test': function (store, data, ref) {
      if (!data.permissionsModel) return Promise.resolve(null);
      var input = str(ref) || 'shell.exec: git push --force origin main';
      op('permission-test', input, 'evaluating');
      return delay(500).then(function () {
        var trace = deepClone(data.permissionsModel.evaluationTrace);
        trace.input = input;
        op('permission-test', input, 'done', { trace: trace });
        store.emit('permissions', { phase: 'trace', trace: trace });
        receipt('Rule test', trace.explanation);
        return { ok: true, trace: trace };
      });
    },

    'changed-elsewhere': function (store, data) {
      var row = obj(data.settings)['general.startup.restore-panel'];
      if (row) {
        row.value = row.value === 'Chat' ? 'File Manager' : 'Chat';
        row.valueSource = 'custom';
        row.changedElsewhere = { by: 'MacBook Air', when: new Date().toISOString() };
      }
      pushNotice(data, {
        id: 'pm-trg-elsewhere', kind: 'attention', statusWord: 'Needs attention',
        headline: 'A setting just changed on MacBook Air',
        consequence: 'Panel To Open On Launch now differs from what this window showed.',
        primary: { label: 'Show the row', act: 'open-changed' },
        target: { domain: 'general', sub: 'startup' }
      });
      store.emit('change', { key: 'settings', value: 'general.startup.restore-panel' });
      store.emit('notices', { phase: 'added' });
      return Promise.resolve({ ok: true });
    },

    'teacher-explain': function (store, data, ref) {
      if (!data.teacher) return Promise.resolve(null);
      var topic = arr(data.teacher.topics).filter(function (t) { return t && t.id === str(ref); })[0]
        || arr(data.teacher.topics)[0];
      if (!topic) return Promise.resolve(null);
      data.teacher.lastSession = new Date().toISOString();
      op('teacher-explain', topic.id, 'open', { topic: deepClone(topic) });
      store.emit('teacher', { phase: 'open', topic: deepClone(topic) });
      return Promise.resolve({ ok: true, topicId: topic.id });
    }
  };
  TRIGGERS['catalog-refresh'] = TRIGGERS['provider-refresh'];
  TRIGGERS['sound-test'] = TRIGGERS['dest-test'];

  function trigger(name, ref) {
    var store = currentStore;
    if (!store) return Promise.resolve(null);
    var fn = TRIGGERS[name];
    if (!fn) return Promise.resolve(null);
    try { return Promise.resolve(fn(store, store.data, ref)); }
    catch (e) { return Promise.resolve(null); }
  }

  /* ---------------- receipts ---------------- */

  function receipt(actionLabel, detail) {
    var message = 'Simulated: ' + str(actionLabel);
    if (detail) message += ' — ' + str(detail);
    var out = { simulated: true, message: message };
    if (currentStore) currentStore.emit('receipt', out);
    return out;
  }

  /* ---------------- States drawer ---------------- */

  var DRAWER_CSS = [
    '.pm-states-btn{position:fixed;right:16px;bottom:34px;z-index:9000;',
    'display:inline-flex;align-items:center;gap:6px;padding:7px 12px;',
    'background:var(--surface-elevated,#26262b);color:var(--text-primary,#e8e8ec);',
    'border:1px solid var(--border,#3a3a42);border-radius:var(--radius-pill,999px);',
    'font-family:var(--body-font,inherit);font-size:var(--fs-sm,13px);cursor:pointer;',
    'box-shadow:var(--elev-2,0 6px 20px rgba(0,0,0,.3));}',
    '.pm-states-btn:focus-visible{outline:2px solid var(--accent-primary,#7aa2f7);outline-offset:2px;}',
    '.pm-states-btn i{display:inline-flex;width:16px;height:16px;}',
    '.pm-states-btn i svg{width:100%;height:100%;}',
    '.pm-states-drawer{position:fixed;right:16px;bottom:78px;z-index:9001;width:280px;',
    'max-height:min(70vh,520px);overflow:auto;padding:14px;',
    'background:var(--surface-elevated,#26262b);color:var(--text-primary,#e8e8ec);',
    'border:1px solid var(--border,#3a3a42);border-radius:var(--radius-lg,12px);',
    'box-shadow:var(--elev-3,0 12px 36px rgba(0,0,0,.4));',
    'font-family:var(--body-font,inherit);font-size:var(--fs-sm,13px);}',
    '.pm-states-drawer h3{margin:0 0 8px;font-size:var(--fs-sm,13px);font-weight:700;',
    'color:var(--text-secondary,#b8b8c0);text-transform:none;}',
    '.pm-states-drawer h3 + h3{margin-top:14px;}',
    '.pm-states-drawer [role="radio"],.pm-states-drawer .pm-states-trigger{',
    'display:flex;align-items:center;gap:8px;width:100%;text-align:left;',
    'padding:7px 9px;margin:2px 0;background:none;border:1px solid transparent;',
    'border-radius:var(--radius-sm,7px);color:inherit;font:inherit;cursor:pointer;}',
    '.pm-states-drawer [role="radio"][aria-checked="true"]{',
    'background:var(--accent-soft,rgba(122,162,247,.14));',
    'border-color:var(--border-light,#4a4a52);font-weight:600;}',
    '.pm-states-drawer [role="radio"]:hover,.pm-states-drawer .pm-states-trigger:hover{',
    'background:var(--surface-alt,#2e2e34);}',
    '.pm-states-drawer [role="radio"]:focus-visible,.pm-states-drawer .pm-states-trigger:focus-visible{',
    'outline:2px solid var(--accent-primary,#7aa2f7);outline-offset:1px;}',
    '.pm-states-dot{width:8px;height:8px;border-radius:50%;flex:none;',
    'border:1.5px solid var(--text-muted,#8a8a92);}',
    '[role="radio"][aria-checked="true"] .pm-states-dot{',
    'background:var(--accent-primary,#7aa2f7);border-color:var(--accent-primary,#7aa2f7);}',
    '.pm-states-note{margin:12px 0 0;color:var(--text-muted,#8a8a92);',
    'font-size:var(--fs-xs,12px);line-height:1.45;}'
  ].join('');

  function injectOnce(id, css) {
    try {
      if (document.getElementById(id)) return;
      var el = document.createElement('style');
      el.id = id;
      el.textContent = css;
      document.head.appendChild(el);
    } catch (e) { /* ignore */ }
  }

  function mountStatesDrawer(store) {
    if (store) currentStore = store;
    if (!currentStore) return null;
    if (document.querySelector('.pm-states-btn')) return null; // mount once
    injectOnce('pm-states-drawer-css', DRAWER_CSS);

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pm-states-btn';
    btn.setAttribute('aria-haspopup', 'dialog');
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = '<i aria-hidden="true">' + icon('layers') + '</i><span>States</span>';

    var drawer = document.createElement('div');
    drawer.className = 'pm-states-drawer';
    drawer.setAttribute('role', 'dialog');
    drawer.setAttribute('aria-label', 'Demo states');
    drawer.hidden = true;

    var activeScenario = str(currentStore.get('scenario')) || 'baseline';

    var hScn = document.createElement('h3');
    hScn.textContent = 'Scenario';
    drawer.appendChild(hScn);

    var group = document.createElement('div');
    group.setAttribute('role', 'radiogroup');
    group.setAttribute('aria-label', 'Scenario');
    drawer.appendChild(group);

    var radios = [];
    scenarios.forEach(function (scn) {
      var r = document.createElement('button');
      r.type = 'button';
      r.setAttribute('role', 'radio');
      r.setAttribute('aria-checked', scn.id === activeScenario ? 'true' : 'false');
      r.dataset.scenario = scn.id;
      r.tabIndex = scn.id === activeScenario ? 0 : -1;
      r.innerHTML = '<span class="pm-states-dot" aria-hidden="true"></span><span>' +
        (scn.label || scn.id) + '</span>';
      r.addEventListener('click', function () { selectScenario(scn.id, r); });
      group.appendChild(r);
      radios.push(r);
    });

    function selectScenario(id, radioEl) {
      radios.forEach(function (x) {
        var on = x === radioEl;
        x.setAttribute('aria-checked', on ? 'true' : 'false');
        x.tabIndex = on ? 0 : -1;
      });
      applyScenario(id);
    }

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

    /* Fixture overlays: additive, composable, persisted; re-applied after
       every scenario change. */
    var hFx = document.createElement('h3');
    hFx.textContent = 'Fixture overlays';
    drawer.appendChild(hFx);

    var savedFixtures = arr(currentStore.get('fixtures'));
    FIXTURES.forEach(function (fx) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'pm-states-trigger';
      b.setAttribute('role', 'checkbox');
      var on = savedFixtures.indexOf(fx.id) >= 0;
      b.setAttribute('aria-checked', on ? 'true' : 'false');
      b.dataset.fixture = fx.id;
      b.innerHTML = '<span class="pm-states-dot" aria-hidden="true"' +
        (on ? ' style="background:currentColor;"' : '') + '></span><span>' + fx.label + '</span>';
      b.addEventListener('click', function () {
        var now = b.getAttribute('aria-checked') !== 'true';
        b.setAttribute('aria-checked', now ? 'true' : 'false');
        var dot = b.querySelector('.pm-states-dot');
        if (dot) { dot.style.background = now ? 'currentColor' : ''; }
        var ids = [];
        drawer.querySelectorAll('[data-fixture][aria-checked="true"]').forEach(function (el) {
          ids.push(el.dataset.fixture);
        });
        setFixtures(ids);
      });
      drawer.appendChild(b);
    });

    var TRIGGER_GROUPS = [
      { title: 'Providers', items: [
        { name: 'provider-refresh', label: 'Refresh provider catalog', ico: 'refresh' },
        { name: 'catalog-refresh', label: 'Refresh model catalog', ico: 'layers' },
        { name: 'reconnect', label: 'Reconnect provider', ico: 'plug' },
        { name: 'invoke-test', label: 'Run invocation test', ico: 'play' }
      ] },
      { title: 'Installations', items: [
        { name: 'install-scan', label: 'Scan for installations', ico: 'search' },
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
      { title: 'Sounds & notifications', items: [
        { name: 'sound-upload', label: 'Upload a sound (fixture)', ico: 'upload' },
        { name: 'sound-preview', label: 'Preview a sound (local only)', ico: 'play' },
        { name: 'dest-test', label: 'Test a destination (receipted)', ico: 'chat' },
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

    TRIGGER_GROUPS.forEach(function (group) {
      var h = document.createElement('h3');
      h.textContent = group.title;
      drawer.appendChild(h);
      group.items.forEach(function (t) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'pm-states-trigger';
        b.innerHTML = '<i aria-hidden="true" style="display:inline-flex;width:14px;height:14px;">' +
          icon(t.ico) + '</i><span>' + t.label + '</span>';
        b.addEventListener('click', function () { trigger(t.name); });
        drawer.appendChild(b);
      });
    });

    var note = document.createElement('p');
    note.className = 'pm-states-note';
    note.textContent = 'Preview widths are controlled from the Concept Hub, not from this drawer.';
    drawer.appendChild(note);

    function open() {
      drawer.hidden = false;
      btn.setAttribute('aria-expanded', 'true');
      var checked = radios.filter(function (r) { return r.getAttribute('aria-checked') === 'true'; })[0];
      (checked || radios[0] || drawer).focus();
      document.addEventListener('mousedown', onOutside, true);
    }
    function close(refocus) {
      drawer.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
      document.removeEventListener('mousedown', onOutside, true);
      if (refocus) btn.focus();
    }
    function onOutside(e) {
      if (!drawer.contains(e.target) && e.target !== btn && !btn.contains(e.target)) close(false);
    }

    btn.addEventListener('click', function () {
      if (drawer.hidden) open(); else close(true);
    });
    drawer.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.stopPropagation(); close(true); }
    });

    try {
      document.body.appendChild(btn);
      document.body.appendChild(drawer);
    } catch (e) { return null; }
    return { button: btn, drawer: drawer, close: close };
  }

  /* ---------------- deterministic deep links ----------------
     <page>.html[?hub=1]#/<route>?<params>
       route  := home | dest/<domainId>[/<subId>] | manager/<managerId>
               | setting/<settingId> | search/<query>
       params := scenario=<id> & fixture=<id>[,<id>...] & trigger=<name>[:<ref>][,...]
               & focus=<id> & instant=1 & pin=1 & theme=<themeId> & motion=reduced
     The hash owns data and navigation; the hub's ?hub=1 query and postMessage
     state own presentation. URL-applied state is EPHEMERAL unless pin=1, so
     probe links never pollute the persisted demo state. */

  var routerOpenFn = null;
  var suppressNextHash = false;

  function parseDeepLink(loc) {
    var hash = str((loc || window.location).hash);
    if (hash.indexOf('#/') !== 0) return null;
    var body = hash.slice(2);
    var qi = body.indexOf('?');
    var routePart = qi >= 0 ? body.slice(0, qi) : body;
    var paramPart = qi >= 0 ? body.slice(qi + 1) : '';

    var segs = routePart.split('/').filter(Boolean).map(function (s) {
      try { return decodeURIComponent(s); } catch (e) { return s; }
    });
    var route = { kind: segs[0] || 'home' };
    if (route.kind === 'dest') { route.domainId = segs[1] || null; route.subId = segs[2] || null; }
    else if (route.kind === 'manager') { route.managerId = segs[1] || null; }
    else if (route.kind === 'setting') { route.settingId = segs[1] || null; }
    else if (route.kind === 'search') { route.query = segs.slice(1).join('/'); }
    else if (route.kind !== 'home') { route = { kind: 'home' }; }

    var params = {};
    paramPart.split('&').forEach(function (pair) {
      if (!pair) return;
      var eq = pair.indexOf('=');
      var k = eq >= 0 ? pair.slice(0, eq) : pair;
      var v = eq >= 0 ? pair.slice(eq + 1) : '1';
      try { params[decodeURIComponent(k)] = decodeURIComponent(v); } catch (e) { params[k] = v; }
    });

    return {
      route: route,
      scenario: params.scenario || null,
      fixtures: params.fixture ? params.fixture.split(',').filter(Boolean) : [],
      triggers: params.trigger ? params.trigger.split(',').filter(Boolean).map(function (t) {
        var ci = t.indexOf(':');
        return ci >= 0 ? { name: t.slice(0, ci), ref: t.slice(ci + 1) } : { name: t, ref: null };
      }) : [],
      focus: params.focus || null,
      instant: params.instant === '1',
      pin: params.pin === '1',
      theme: params.theme || null,
      motion: params.motion || null
    };
  }

  function buildHash(route, params) {
    var r = obj(route);
    var segs = [];
    if (r.kind === 'dest') { segs = ['dest', r.domainId, r.subId]; }
    else if (r.kind === 'manager') { segs = ['manager', r.managerId]; }
    else if (r.kind === 'setting') { segs = ['setting', r.settingId]; }
    else if (r.kind === 'search') { segs = ['search', r.query]; }
    else { segs = ['home']; }
    var path = segs.filter(function (s) { return s != null && s !== ''; })
      .map(encodeURIComponent).join('/');
    var pairs = [];
    obj(params) && Object.keys(obj(params)).forEach(function (k) {
      var v = params[k];
      if (v == null || v === '' || v === false) return;
      pairs.push(encodeURIComponent(k) + '=' + encodeURIComponent(v === true ? '1' : String(v)));
    });
    return '#/' + path + (pairs.length ? '?' + pairs.join('&') : '');
  }

  /* Concepts call this on every internal navigation so browser Back/forward
     traverses real history. replace:true for scrollspy-driven updates. */
  function writeRoute(route, opts) {
    var o = obj(opts);
    var hash = typeof route === 'string' ? route : buildHash(route, o.params);
    if (window.location.hash === hash) return;
    suppressNextHash = true;
    try {
      if (o.replace && window.history && window.history.replaceState) {
        window.history.replaceState(null, '', hash);
        suppressNextHash = false; // replaceState fires no hashchange
      } else {
        window.location.hash = hash;
      }
    } catch (e) { suppressNextHash = false; }
  }

  function markReady(applied) {
    try { document.documentElement.setAttribute('data-pm-state', 'ready'); } catch (e) { /* no DOM */ }
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ source: 'pm-concept', type: 'pm-concept-applied', applied: applied || null }, '*');
      }
    } catch (e) { /* cross-origin parent */ }
  }

  function applyDeepLink(dl, opts) {
    var store = currentStore;
    if (!dl) {
      markReady(null);
      return Promise.resolve(null);
    }
    if (dl.instant) setTimescale(0);
    try {
      if ((dl.theme || dl.motion) && window.PMShell && typeof window.PMShell.applyView === 'function') {
        window.PMShell.applyView({ theme: dl.theme, reducedMotion: dl.motion === 'reduced' });
      }
    } catch (e) { /* presentation is optional */ }

    var wantScenario = dl.scenario || (store ? str(store.get('scenario')) : '') || 'baseline';
    var wantFixtures = dl.fixtures.filter(function (id) { return !!fixtureById(id); });
    if (dl.scenario || wantFixtures.length) {
      activeFixtures = wantFixtures;
      if (dl.pin && store) { store.set('fixtures', activeFixtures); }
      rebuild(wantScenario, { persist: !!dl.pin });
    }

    var openResult = null;
    if (typeof routerOpenFn === 'function') {
      try { openResult = routerOpenFn(dl.route, dl); } catch (e) { /* concept router errors stay local */ }
    }

    return Promise.resolve(openResult).then(function () {
      var chain = Promise.resolve();
      dl.triggers.forEach(function (t) {
        chain = chain.then(function () { return trigger(t.name, t.ref); });
      });
      return chain;
    }).then(function () {
      markReady({
        route: dl.route, scenario: dl.scenario, fixtures: dl.fixtures,
        triggers: dl.triggers.map(function (t) { return t.name; })
      });
      return dl;
    });
  }

  function bindRouter(opts) {
    var o = obj(opts);
    routerOpenFn = typeof o.open === 'function' ? o.open : null;
    window.addEventListener('hashchange', function () {
      if (suppressNextHash) { suppressNextHash = false; return; }
      applyDeepLink(parseDeepLink(window.location), { fromHashChange: true });
    });
    return applyDeepLink(parseDeepLink(window.location), { initial: true });
  }

  /* ---------------- search ---------------- */

  function isSubsequence(needle, hay) {
    var i = 0;
    for (var j = 0; j < hay.length && i < needle.length; j++) {
      if (hay.charCodeAt(j) === needle.charCodeAt(i)) i++;
    }
    return i === needle.length;
  }

  /* Ladder per contract: label substring > label subsequence > synonym exact >
     synonym substring > category title > desc. Every token must match. */
  function scoreToken(token, cand) {
    var label = cand._label;
    if (label.indexOf(token) === 0) return 110;      // prefix: strongest substring
    if (label.indexOf(token) >= 0) return 100;       // label substring
    if (isSubsequence(token, label)) return 80;      // label subsequence
    var syns = cand._synonyms;
    for (var i = 0; i < syns.length; i++) {
      if (syns[i] === token) return 70;              // synonym exact
    }
    for (var k = 0; k < syns.length; k++) {
      if (syns[k].indexOf(token) >= 0) return 55;    // synonym substring
    }
    if (cand._category.indexOf(token) >= 0) return 40; // category title
    if (cand._desc.indexOf(token) >= 0) return 25;     // description
    return 0;
  }

  var MANAGER_DEFS = [
    { id: 'manager.providers', label: 'Model providers and accounts', domainId: 'agents', pull: 'providers' },
    { id: 'manager.roles', label: 'Model roles', domainId: 'agents', pull: 'roles' },
    { id: 'manager.personas', label: 'Personas', domainId: 'agents', pull: 'personas' },
    { id: 'manager.crew', label: 'Crew templates', domainId: 'collaboration', pull: 'crew' },
    { id: 'manager.memory', label: 'Memory', domainId: 'context', pull: 'memory' },
    { id: 'manager.contextSources', label: 'Context sources', domainId: 'context', pull: null },
    { id: 'manager.mcp', label: 'Connected servers', domainId: 'extensions', pull: 'mcp' },
    { id: 'manager.lsp', label: 'Language servers', domainId: 'code', pull: 'lsp' },
    { id: 'manager.skills', label: 'Skills', domainId: 'extensions', pull: 'skills' },
    { id: 'manager.plugins', label: 'Plugins', domainId: 'extensions', pull: 'plugins' },
    { id: 'manager.tools', label: 'Tools', domainId: 'extensions', pull: 'tools' },
    { id: 'manager.terminalProfiles', label: 'Terminal profiles', domainId: 'system', pull: 'terminalProfiles' },
    { id: 'manager.media', label: 'Media routes', domainId: 'media', pull: 'media' },
    { id: 'manager.freeRoutes', label: 'Free and community routes', domainId: 'agents', pull: 'freeRoutes' },
    { id: 'manager.dictionary', label: 'Personal and project dictionaries', domainId: 'general', pull: null },
    { id: 'manager.commands', label: 'Commands & shortcuts', domainId: 'extensions', pull: null },
    /* Final cumulative packet families (2026-08-08). pullPath reaches into
       nested collections for name synonyms. */
    { id: 'manager.notifications', label: 'Notifications & sounds', domainId: 'general', pull: null, pullPath: ['notifications', 'destinations'] },
    { id: 'manager.sounds', label: 'Sound library', domainId: 'general', pull: null, pullPath: ['notifications', 'sounds', 'library'] },
    { id: 'manager.appearance', label: 'Appearance & themes', domainId: 'appearance', pull: null, pullPath: ['appearance', 'customThemes'] },
    { id: 'manager.desktop', label: 'Desktop, tray & windows', domainId: 'general', pull: null },
    { id: 'manager.teacher', label: 'Teacher & guided help', domainId: 'general', pull: null, pullPath: ['teacher', 'topics'] },
    { id: 'manager.permissions', label: 'Permissions & FileSafe', domainId: 'permissions', pull: null },
    { id: 'manager.bsd', label: 'Back Seat Driver', domainId: 'planning', pull: null },
    { id: 'manager.goal', label: 'Goal & automation defaults', domainId: 'planning', pull: null },
    { id: 'manager.testing', label: 'Testing & debug', domainId: 'planning', pull: null, pullPath: ['testingDebug', 'capabilities'] },
    { id: 'manager.fileManager', label: 'Files & editor', domainId: 'code', pull: null },
    { id: 'manager.formatters', label: 'Formatters', domainId: 'code', pull: null, pullPath: ['formatters', 'entries'] },
    { id: 'manager.sourceControl', label: 'Source control & worktrees', domainId: 'collaboration', pull: null, pullPath: ['sourceControl', 'tools'] },
    { id: 'manager.actions', label: 'GitHub Actions', domainId: 'collaboration', pull: null, pullPath: ['githubActions', 'pinned'] },
    { id: 'manager.containers', label: 'Containers & registries', domainId: 'extensions', pull: null, pullPath: ['containers', 'resources'] },
    { id: 'manager.web', label: 'Web, search & fetch', domainId: 'extensions', pull: null, pullPath: ['webResearch', 'providers'] },
    { id: 'manager.storage', label: 'Storage & retention', domainId: 'system', pull: null },
    { id: 'manager.backup', label: 'Backup & restore', domainId: 'system', pull: null },
    { id: 'manager.lifecycle', label: 'Settings import, export & reset', domainId: 'system', pull: null },
    { id: 'manager.history', label: 'History & sessions', domainId: 'system', pull: null, pullPath: ['sessionsHistory', 'sessions'] },
    { id: 'manager.artifacts', label: 'Runtime artifacts', domainId: 'system', pull: null, pullPath: ['artifacts', 'entries'] },
    { id: 'manager.searchIndex', label: 'Project search index', domainId: 'system', pull: null },
    { id: 'manager.cleanup', label: 'Workspace cleanup', domainId: 'system', pull: null },
    { id: 'manager.servers', label: 'Servers & execution hosts', domainId: 'system', pull: null, pullPath: ['serverTopology', 'hosts'] }
  ];

  var MANAGER_SYNONYMS = {
    'manager.notifications': ['notifications', 'alerts', 'slack', 'discord', 'webhook', 'ntfy', 'pushover', 'telegram', 'notifcations'],
    'manager.sounds': ['sounds', 'audio', 'chime', 'pack', 'peonping', 'openpeon', 'upload', 'volume'],
    'manager.appearance': ['appearance', 'theme', 'themes', 'toml', 'fonts', 'scale', 'apperance'],
    'manager.desktop': ['tray', 'window', 'minimize', 'launch', 'crash', 'recovery', 'tabs'],
    'manager.teacher': ['teacher', 'help', 'explain', 'guide', 'learn'],
    'manager.permissions': ['permissions', 'rules', 'filesafe', 'access', 'allowlist', 'approval', 'wildcard', 'permisions'],
    'manager.bsd': ['bsd', 'back seat driver', 'reviewer', 'watchdog'],
    'manager.goal': ['goal', 'automation', 'fan-out', 'checkpoint', 'ceiling', 'reserve'],
    'manager.testing': ['testing', 'debug', 'debugger', 'dap', 'eval', 'capture'],
    'manager.fileManager': ['file manager', 'files', 'editor', 'tree', 'tabs', 'drag'],
    'manager.formatters': ['formatter', 'formatters', 'prettier', 'rustfmt', 'black', 'format on save'],
    'manager.sourceControl': ['git', 'jujutsu', 'worktree', 'worktrees', 'ssh', 'forge', 'lfs', 'branch'],
    'manager.actions': ['github actions', 'workflow', 'workflows', 'ci', 'runs'],
    'manager.containers': ['docker', 'podman', 'kubernetes', 'kubectl', 'helm', 'registry', 'registries', 'unraid'],
    'manager.web': ['web', 'search', 'fetch', 'crawl', 'brave', 'kagi', 'firecrawl', 'credits'],
    'manager.storage': ['storage', 'retention', 'vault', 'disk', 'quarantine', 'legal hold'],
    'manager.backup': ['backup', 'restore', 'restore point', 'snapshot', 'test restore'],
    'manager.lifecycle': ['import', 'export', 'reset', 'settings file', 'rollback', 'migrate'],
    'manager.history': ['history', 'sessions', 'archive', 'compare'],
    'manager.artifacts': ['artifacts', 'outputs', 'reports', 'captures', 'redaction'],
    'manager.searchIndex': ['index', 'search index', 'rebuild', 'exclusions'],
    'manager.cleanup': ['cleanup', 'clean', 'reclaim', 'dry run'],
    'manager.servers': ['server', 'servers', 'truenas', 'execution host', 'wsl', 'clients', 'remote']
  };

  /* Per-concept manager manifest. Concepts declare which manager ids they
     render natively; every other manager id surfaces in search as an honest
     cross-concept receipt naming the concept that proves it. */
  var managerManifest = null; // { conceptId, native: [ids], coveredIn: { id: {concept, page, label} } }

  function registerManagers(manifest) {
    managerManifest = manifest && typeof manifest === 'object' ? manifest : null;
  }

  function managerAvailability(id) {
    if (!managerManifest) return { native: true, coveredIn: null };
    var native = arr(managerManifest.native).indexOf(id) >= 0;
    if (native) return { native: true, coveredIn: null };
    var covered = obj(managerManifest.coveredIn)[id] || null;
    return { native: false, coveredIn: covered };
  }

  function itemNames(collection) {
    var out = [];
    arr(collection).forEach(function (it) {
      if (!it) return;
      var n = str(it.name) || str(it.label);
      if (n) {
        out.push(n.toLowerCase());
        n.toLowerCase().split(/\s+/).forEach(function (w) { if (w.length > 2) out.push(w); });
      }
    });
    return out;
  }

  function buildCandidates(data) {
    var cands = [];
    var index = buildSettingIndex(data);

    // Settings.
    var settings = obj(data.settings);
    Object.keys(settings).forEach(function (id) {
      var s = settings[id];
      if (!s) return;
      var loc = index[id] || {};
      var syns = arr(s.search).map(function (x) { return String(x).toLowerCase(); });
      cands.push({
        kind: 'setting', id: id, label: str(s.label) || id,
        domainId: loc.domainId || null, subId: loc.subId || null,
        exposure: str(s.exposure) || 'standard',
        _label: (str(s.label) || id).toLowerCase(),
        _synonyms: syns,
        _category: ((loc.domainTitle || '') + ' ' + (loc.subTitle || '')).toLowerCase(),
        _desc: str(s.desc).toLowerCase()
      });
    });

    // Managers (item names become synonyms so "claude" finds providers).
    MANAGER_DEFS.forEach(function (m) {
      var syns = [];
      if (m.pull && data[m.pull]) syns = itemNames(data[m.pull]);
      if (m.pullPath) {
        var node = data;
        for (var pi = 0; pi < m.pullPath.length && node; pi++) { node = node[m.pullPath[pi]]; }
        if (Array.isArray(node)) syns = syns.concat(itemNames(node));
      }
      if (MANAGER_SYNONYMS[m.id]) syns = syns.concat(MANAGER_SYNONYMS[m.id]);
      if (m.id === 'manager.dictionary') syns = ['spellcheck', 'spelling', 'dictionary', 'words'];
      if (m.id === 'manager.commands') syns = ['commands', 'shortcuts', 'keyboard', 'shortcut', 'keybinding', 'keybindings', 'remap', 'hotkey', 'command palette'];
      var avail = managerAvailability(m.id);
      cands.push({
        kind: avail.native ? 'manager' : 'manager-receipt',
        id: m.id, label: m.label,
        domainId: m.domainId, subId: null, exposure: 'standard',
        coveredIn: avail.coveredIn,
        _label: m.label.toLowerCase(),
        _synonyms: syns,
        _category: '',
        _desc: ''
      });
    });

    // Notice actions.
    arr(data.notices).forEach(function (n) {
      if (!n || !n.primary || !n.primary.label) return;
      var target = obj(n.target);
      cands.push({
        kind: 'action', id: str(n.id) || ('notice-' + cands.length),
        label: str(n.primary.label),
        domainId: str(target.domain) || null, subId: str(target.sub) || null,
        exposure: 'standard',
        _label: str(n.primary.label).toLowerCase(),
        _synonyms: [str(n.headline).toLowerCase()],
        _category: '',
        _desc: str(n.consequence).toLowerCase()
      });
    });

    return cands;
  }

  function search(query, data) {
    var q = str(query).trim().toLowerCase();
    if (!q) return [];
    var tokens = q.split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return [];
    var d = obj(data) === data ? data : (currentStore ? currentStore.data : {});
    var cands = buildCandidates(obj(d));
    var results = [];

    for (var i = 0; i < cands.length; i++) {
      var c = cands[i];
      var total = 0;
      var all = true;
      for (var t = 0; t < tokens.length; t++) {
        var sc = scoreToken(tokens[t], c);
        if (sc === 0) { all = false; break; }
        total += sc;
      }
      if (!all) continue;
      if (c.exposure === 'standard') total += 15; // curated/simple bonus
      if (c.kind === 'setting') total += 5;       // settings slightly ahead of peers on ties
      if (c.kind === 'manager-receipt') total -= 10; // native surfaces outrank receipts
      results.push({
        kind: c.kind, id: c.id, label: c.label,
        domainId: c.domainId, subId: c.subId,
        score: total, exposure: c.exposure,
        coveredIn: c.coveredIn || null
      });
    }

    results.sort(function (a, b) {
      if (b.score !== a.score) return b.score - a.score;
      return a.label < b.label ? -1 : (a.label > b.label ? 1 : 0);
    });
    return results.slice(0, 60);
  }

  /* ---------------- public API ---------------- */

  window.PMState = {
    init: function (conceptId) {
      currentStore = createStore(conceptId);
      var saved = str(currentStore.get('scenario')) || 'baseline';
      activeFixtures = arr(currentStore.get('fixtures')).filter(function (id) { return !!fixtureById(id); });
      if (saved !== 'baseline' || activeFixtures.length) {
        try {
          var fresh = baseData();
          (SCENARIO_MUTATIONS[saved] || SCENARIO_MUTATIONS['baseline'])(fresh);
          applyFixturesTo(fresh, activeFixtures);
          currentStore.data = fresh;
        } catch (e) { /* fall back to baseline clone */ }
      }
      return currentStore;
    },
    /* Probe/debug accessor: the live store (null before init). */
    store: function () { return currentStore; },
    resolveRowState: resolveRowState,
    resolveNotice: resolveNotice,
    scenarios: scenarios,
    applyScenario: applyScenario,
    fixtures: FIXTURES,
    setFixtures: setFixtures,
    activeFixtures: function () { return activeFixtures.slice(); },
    trigger: trigger,
    triggerNames: function () { return Object.keys(TRIGGERS); },
    setTimescale: setTimescale,
    receipt: receipt,
    mountStatesDrawer: mountStatesDrawer,
    search: search,
    registerManagers: registerManagers,
    managerAvailability: managerAvailability,
    managerDefs: MANAGER_DEFS,
    parseDeepLink: parseDeepLink,
    buildHash: buildHash,
    writeRoute: writeRoute,
    bindRouter: bindRouter
  };
})();
