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
    { id: 'managed-workspace', label: 'Managed workspace' }
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
      if (!Array.isArray(data.notices)) data.notices = [];
      data.notices.unshift({
        id: 'pm-scn-managed', kind: 'setup', statusWord: 'Setup',
        headline: 'This workspace applies a managed policy',
        consequence: 'Permission and safety settings follow the workspace policy and are read-only here.',
        primary: { label: 'View policy summary', act: 'open-policy' },
        target: { domain: 'permissions' }
      });
    }
  };

  function applyScenario(id) {
    var store = currentStore;
    if (!store) return;
    var fresh = baseData();
    var mutate = SCENARIO_MUTATIONS[id] || SCENARIO_MUTATIONS['baseline'];
    try { mutate(fresh); } catch (e) { /* keep whatever mutated cleanly */ }
    store.data = fresh;
    store.set('scenario', id);
    store.emit('scenario', { id: id });
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

  function delay(ms) {
    return new Promise(function (resolve) { window.setTimeout(resolve, ms); });
  }

  /* Staged async transitions. Last-known-good rows are preserved: we only
     flip small status fields, never clear collections mid-flight. */
  function trigger(name, ref) {
    var store = currentStore;
    if (!store) return Promise.resolve(null);
    var data = store.data;

    if (name === 'provider-refresh' || name === 'catalog-refresh') {
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
    }

    if (name === 'reconnect') {
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
    }

    if (name === 'invoke-test') {
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
    }

    return Promise.resolve(null);
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

    var hTrg = document.createElement('h3');
    hTrg.textContent = 'Transient triggers';
    drawer.appendChild(hTrg);

    var triggers = [
      { name: 'provider-refresh', label: 'Refresh provider catalog', ico: 'refresh' },
      { name: 'catalog-refresh', label: 'Refresh model catalog', ico: 'layers' },
      { name: 'reconnect', label: 'Reconnect provider', ico: 'plug' },
      { name: 'invoke-test', label: 'Run invocation test', ico: 'play' }
    ];
    triggers.forEach(function (t) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'pm-states-trigger';
      b.innerHTML = '<i aria-hidden="true" style="display:inline-flex;width:14px;height:14px;">' +
        icon(t.ico) + '</i><span>' + t.label + '</span>';
      b.addEventListener('click', function () { trigger(t.name); });
      drawer.appendChild(b);
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
    { id: 'manager.commands', label: 'Commands & shortcuts', domainId: 'extensions', pull: null }
  ];

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
      if (m.id === 'manager.dictionary') syns = ['spellcheck', 'spelling', 'dictionary', 'words'];
      if (m.id === 'manager.commands') syns = ['commands', 'shortcuts', 'keyboard', 'shortcut', 'keybinding', 'keybindings', 'remap', 'hotkey', 'command palette'];
      cands.push({
        kind: 'manager', id: m.id, label: m.label,
        domainId: m.domainId, subId: null, exposure: 'standard',
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
      results.push({
        kind: c.kind, id: c.id, label: c.label,
        domainId: c.domainId, subId: c.subId,
        score: total, exposure: c.exposure
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
      var saved = currentStore.get('scenario');
      if (saved && saved !== 'baseline' && SCENARIO_MUTATIONS[saved]) {
        try {
          var fresh = baseData();
          SCENARIO_MUTATIONS[saved](fresh);
          currentStore.data = fresh;
        } catch (e) { /* fall back to baseline clone */ }
      }
      return currentStore;
    },
    resolveRowState: resolveRowState,
    resolveNotice: resolveNotice,
    scenarios: scenarios,
    applyScenario: applyScenario,
    trigger: trigger,
    receipt: receipt,
    mountStatesDrawer: mountStatesDrawer,
    search: search
  };
})();
