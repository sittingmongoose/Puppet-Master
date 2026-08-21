/* pm2-store.js — PM2.store + PM2.now + PM2.util
   Shared-v2 value store for fable concepts 05-11 (CONTRACT2.md, "pm2-store.js").
   Plain data over the 828-row PM2_INVENTORY: current-Project values, row view
   models, per-category counts, recents feed, attention list. No DOM access;
   window.localStorage only (namespaced pm.settingsConcepts.fable.<conceptId>.*).
   User value changes persist under <ns>values and rehydrate on init, so
   edits survive a reload; the first-run scenario clears them. Scenario and
   fixture state stays ephemeral (owned by pm2-states).
   Slint note: the store maps to a model bus; resolveRow output is a pure
   struct a Slint component can render without further lookups. No emoji. */
(function () {
  'use strict';

  window.PM2 = window.PM2 || {};

  var NS_ROOT = 'pm.settingsConcepts.fable.';
  var DEMO_BASE_MS = Date.parse('2026-08-05T16:20:00Z');

  /* ---------------- PM2.now: fixed demo clock ----------------
     Every call advances one second from the 2026-08-05T16:20:00Z base so
     ordering is monotonic but the demo never leaves its anchored day. */
  var nowTicks = 0;
  function now() {
    nowTicks += 1;
    return new Date(DEMO_BASE_MS + nowTicks * 1000);
  }
  window.PM2.now = now;

  /* ---------------- PM2.util ---------------- */

  function clone(x) {
    try { return JSON.parse(JSON.stringify(x)); }
    catch (e) { return Array.isArray(x) ? [] : {}; }
  }

  function debounce(fn, ms) {
    var t = null;
    var wait = typeof ms === 'number' ? ms : 150;
    function debounced() {
      var args = arguments, self = this;
      if (t !== null) { clearTimeout(t); }
      t = setTimeout(function () { t = null; fn.apply(self, args); }, wait);
    }
    debounced.cancel = function () { if (t !== null) { clearTimeout(t); t = null; } };
    return debounced;
  }

  function slug(s) {
    return String(s == null ? '' : s).toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function fmtInt(n) {
    var v = Math.round(Number(n) || 0);
    var neg = v < 0;
    var digits = String(Math.abs(v));
    var out = '';
    for (var i = 0; i < digits.length; i++) {
      var fromEnd = digits.length - i;
      out += digits.charAt(i);
      if (fromEnd > 1 && (fromEnd - 1) % 3 === 0) out += ',';
    }
    return (neg ? '-' : '') + out;
  }

  function fmtBytes(n) {
    var v = Number(n) || 0;
    if (v < 0) v = 0;
    var units = ['B', 'KB', 'MB', 'GB', 'TB'];
    var u = 0;
    while (v >= 1024 && u < units.length - 1) { v = v / 1024; u += 1; }
    var shown = (u === 0 || v >= 10) ? String(Math.round(v)) : String(Math.round(v * 10) / 10);
    return shown + ' ' + units[u];
  }

  /* Relative time against the fixed demo clock (not wall time). */
  function fmtAgo(when) {
    var t = (when instanceof Date) ? when.getTime() : Date.parse(when);
    if (!isFinite(t)) return '';
    var diff = DEMO_BASE_MS - t;
    if (diff < 0) diff = 0;
    var mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return mins + (mins === 1 ? ' min ago' : ' mins ago');
    var hours = Math.floor(mins / 60);
    if (hours < 24) return hours + (hours === 1 ? ' hour ago' : ' hours ago');
    var days = Math.floor(hours / 24);
    if (days === 1) return 'yesterday';
    if (days <= 7) return days + ' days ago';
    var d = new Date(t);
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[d.getUTCMonth()] + ' ' + d.getUTCDate();
  }

  window.PM2.util = {
    clone: clone, debounce: debounce, slug: slug,
    fmtInt: fmtInt, fmtBytes: fmtBytes, fmtAgo: fmtAgo
  };

  /* ---------------- small helpers ---------------- */

  function arr(x) { return Array.isArray(x) ? x : []; }
  function obj(x) { return (x && typeof x === 'object' && !Array.isArray(x)) ? x : {}; }
  function str(x) { return typeof x === 'string' ? x : ''; }
  function sameJson(a, b) {
    try { return JSON.stringify(a) === JSON.stringify(b); } catch (e) { return a === b; }
  }
  function isOn(v) { return v === true || v === 'on'; }

  /* ---------------- curated divergences ----------------
     Realistic current-Project changes (>=25, >=8 categories). Timestamps sit
     before the demo now of 2026-08-05T16:20:00Z. */
  var DIVERGENCES = [
    { id: 'general.visual.font-size', value: 15, at: '2026-07-28T19:04:00Z' },
    { id: 'general.interaction.submit-key', value: 'Enter', at: '2026-07-22T15:41:00Z' },
    { id: 'general.startup.restore-panel', value: 'Chat', at: '2026-07-22T15:43:00Z' },
    { id: 'general.interaction.mode', value: 'Expert', at: '2026-07-30T13:12:00Z' },
    { id: 'ai.models.default-model', value: 'anthropic/claude-opus-4', at: '2026-08-05T16:12:00Z' },
    { id: 'ai.usage.max-tool-rounds', value: 120, at: '2026-08-01T10:26:00Z' },
    { id: 'ai.usage.usage-windows', value: '5h', at: '2026-07-29T09:58:00Z' },
    { id: 'ai.usage.ledger-page-size', value: 50, at: '2026-07-29T10:01:00Z' },
    { id: 'safety.rules.permission-preset', value: 'custom', at: '2026-08-05T15:47:00Z' },
    { id: 'safety.approvals.alert-channel', value: 'all', at: '2026-07-25T18:22:00Z' },
    { id: 'safety.approvals.approval-ladder-default', value: 'for_session', at: '2026-07-25T18:25:00Z' },
    { id: 'code.terminal.font-size', value: 13, at: '2026-07-24T20:34:00Z' },
    { id: 'code.terminal.theme', value: 'Solarized', at: '2026-08-04T21:18:00Z' },
    { id: 'code.execution.run-mode', value: 'Ask', at: '2026-08-02T14:09:00Z' },
    { id: 'code.editing.word-wrap', value: true, at: '2026-07-24T20:37:00Z' },
    { id: 'memory.limits.run-token-budget', value: 120000, at: '2026-08-03T11:44:00Z' },
    { id: 'memory.assembly.max-injected-memories', value: 8, at: '2026-08-03T11:47:00Z' },
    { id: 'memory.retention.history-retention', value: 'recent', at: '2026-07-27T16:30:00Z' },
    { id: 'planning.interview.max-questions-per-topic', value: 5, at: '2026-07-31T09:15:00Z' },
    { id: 'planning.verification.heartbeat-interval', value: 15, at: '2026-07-31T09:19:00Z' },
    { id: 'branching.subagents.max-parallel', value: 6, at: '2026-08-01T17:52:00Z' },
    { id: 'branching.crew.crew-enabled', value: true, at: '2026-08-01T17:49:00Z' },
    { id: 'media.io.voice-input', value: true, at: '2026-07-26T12:08:00Z' },
    { id: 'web.fetch.search-max-results', value: 12, at: '2026-08-02T10:33:00Z' },
    { id: 'web.fetch.crawl-max-pages', value: 40, at: '2026-08-02T10:36:00Z' },
    { id: 'personas.tuning.response-style', value: 'concise', at: '2026-07-23T14:55:00Z' },
    { id: 'personas.tuning.verbosity', value: 'terse', at: '2026-07-23T14:57:00Z' },
    { id: 'extensions.skills.registry-view', value: 'All', at: '2026-07-28T08:20:00Z' },
    { id: 'extensions.skills.context-budget-percent', value: 3, at: '2026-07-28T08:23:00Z' },
    { id: 'system.advanced.release-channel', value: 'Canary', at: '2026-07-21T19:02:00Z' },
    { id: 'system.advanced.update-frequency', value: 'Daily', at: '2026-07-21T19:05:00Z' }
  ];

  /* Seeded recent-change feed, newest first (live setValue calls prepend). */
  var SEEDED_RECENTS = [
    { settingId: 'ai.models.default-model', fromLabel: 'Claude Sonnet 4', toLabel: 'Claude Opus 4', when: '2026-08-05T16:12:00Z', by: 'You' },
    { settingId: 'safety.rules.permission-preset', fromLabel: 'Regular', toLabel: 'Custom', when: '2026-08-05T15:47:00Z', by: 'You' },
    { settingId: 'code.terminal.theme', fromLabel: 'Match App Theme', toLabel: 'Solarized', when: '2026-08-04T21:18:00Z', by: 'You', note: 'Applies after restart' },
    { settingId: 'memory.limits.run-token-budget', fromLabel: '80,000 tokens', toLabel: '120,000 tokens', when: '2026-08-03T11:44:00Z', by: 'You' },
    { settingId: 'web.fetch.search-max-results', fromLabel: '8 results', toLabel: '12 results', when: '2026-08-02T10:33:00Z', by: 'You' },
    { settingId: 'branching.subagents.max-parallel', fromLabel: '4 agents', toLabel: '6 agents', when: '2026-08-01T17:52:00Z', by: 'You' },
    { settingId: 'general.interaction.mode', fromLabel: 'ELI5', toLabel: 'Expert', when: '2026-07-30T13:12:00Z', by: 'You' }
  ];

  /* Baseline attention list (2-4 items) plus attention-heavy extras. */
  var BASE_ATTENTION = [
    {
      id: 'att.usage-window', statusWord: 'Watch',
      headline: 'Claude 5-hour usage window is 82 percent spent',
      consequence: 'Deep-work runs may queue until the window resets at 6:00 PM.',
      dest: { route: 'dest', cat: 'ai', sub: 'usage' }
    },
    {
      id: 'att.terminal-restart', statusWord: 'Restart',
      headline: 'Terminal theme change is waiting for a restart',
      consequence: 'Open terminals keep the old colors until Puppet Master restarts.',
      dest: { route: 'setting', settingId: 'code.terminal.theme' }
    },
    {
      id: 'att.opencode-signin', statusWord: 'Sign in',
      headline: 'OpenCode session expired on this machine',
      consequence: 'Runs routed to OpenCode will pause until you sign in again.',
      dest: { route: 'dest', cat: 'ai', sub: 'accounts' }
    }
  ];

  var HEAVY_ATTENTION = [
    {
      id: 'att.storage', statusWord: 'Cleanup',
      headline: 'Project storage is at 91 percent of its budget',
      consequence: 'History snapshots stop saving once storage is full.',
      dest: { route: 'manager', managerId: 'm.storage' }
    },
    {
      id: 'att.index', statusWord: 'Failed',
      headline: 'Project search index stopped partway through a rebuild',
      consequence: 'Search results may miss files changed since Monday.',
      dest: { route: 'manager', managerId: 'm.searchIndex' }
    },
    {
      id: 'att.update', statusWord: 'Update',
      headline: 'Cursor CLI 2.4 is ready to install',
      consequence: 'The current install keeps working; the update waits for your go-ahead.',
      dest: { route: 'manager', managerId: 'm.providers' }
    },
    {
      id: 'att.formatter', statusWord: 'Check',
      headline: 'Prettier failed its last three format-on-save runs',
      consequence: 'Saves still succeed, but files keep their unformatted style.',
      dest: { route: 'manager', managerId: 'm.formatters' }
    }
  ];

  /* ---------------- row state rules ----------------
     resolveRow state reflects the active scenario + fixture overlays.
     Order of application: baseline, then scenario, then fixtures (last wins). */

  var BASELINE_RULES = [
    { id: 'code.terminal.theme', state: 'restart-required',
      note: 'Changed yesterday. The new terminal colors apply after Puppet Master restarts.' },
    { id: 'ai.accounts.provider-connections', state: 'reconnect-required',
      note: 'The OpenCode session on this machine expired. Reconnect to resume runs on that route.' },
    { id: 'safety.protection.bash-guard', state: 'managed',
      note: 'Kept on by the Acme Robotics workspace policy. Origin details are in the row drawer.' },
    { id: 'code.editing.formatters-enabled', state: 'changed-elsewhere',
      note: 'Changed from the command line 20 minutes ago. Review before editing here.' }
  ];

  var SCENARIO_RULES = {
    'managed-workspace': [
      { id: 'safety.rules.permission-preset', state: 'managed', note: 'Set by the Acme Robotics workspace policy.' },
      { id: 'safety.rules.default-tool-permission', state: 'managed', note: 'Set by the Acme Robotics workspace policy.' },
      { id: 'safety.approvals.autonomy-mode', state: 'managed', note: 'Set by the Acme Robotics workspace policy.' },
      { id: 'system.advanced.auto-update', state: 'managed', note: 'Update policy is controlled by your workspace.' },
      { id: 'system.advanced.release-channel', state: 'managed', note: 'Update policy is controlled by your workspace.' }
    ],
    'offline': [
      { prefix: 'web.providers.', state: 'unavailable', note: 'Offline. Web providers need a network connection.' },
      { prefix: 'web.fetch.', state: 'unavailable', note: 'Offline. Fetch and crawl settings resume with the connection.' },
      { id: 'ai.accounts.provider-connections', state: 'unavailable', note: 'Offline. Sign-in and account checks resume with the connection.' },
      { id: 'system.advanced.auto-update', state: 'unavailable', note: 'Offline. Update checks resume with the connection.' }
    ]
  };

  var FIXTURE_RULES = {
    'fx.restart-required': [
      { id: 'general.visual.app-font', state: 'restart-required', note: 'The new app font applies after Puppet Master restarts.' },
      { id: 'code.terminal.font-family', state: 'restart-required', note: 'Open terminals pick up the new font after a restart.' },
      { id: 'system.advanced.renderer', state: 'restart-required', note: 'The renderer switch applies after Puppet Master restarts.' }
    ],
    'fx.reconnect-required': [
      { id: 'ai.accounts.provider-connections', state: 'reconnect-required', note: 'The OpenCode session on this machine expired. Reconnect to resume runs on that route.' },
      { id: 'system.mcp.server-list', state: 'reconnect-required', note: 'The GitHub server lost its session. Reconnect to restore repository tools.' }
    ],
    'fx.changed-elsewhere': [
      { id: 'safety.rules.permission-preset', state: 'changed-elsewhere', note: 'Changed from the command line a few minutes ago. Review before editing here.' },
      { id: 'memory.retention.enabled', state: 'changed-elsewhere', note: 'Changed from another window a few minutes ago. Review before editing here.' }
    ],
    'fx.validation-error': [
      { id: 'memory.limits.run-token-budget', state: 'error', note: 'Enter a whole number of tokens - at least 1,000.' },
      { id: 'web.fetch.crawl-max-pages', state: 'error', note: 'Enter a whole number of pages between 1 and 500.' }
    ],
    'fx.theme-fallback': [
      { id: 'general.visual.theme', state: 'error', note: 'The custom theme file failed to parse. Showing Friendly Dark until it is fixed.' }
    ]
  };

  /* Per-id numeric bounds used for control.min/max and validation. */
  var BOUNDS = {
    'general.visual.font-size': { min: 8, max: 32 },
    'code.terminal.font-size': { min: 8, max: 32 },
    'ai.usage.max-tool-rounds': { min: 1, max: 1000 },
    'ai.usage.ledger-page-size': { min: 10, max: 200 },
    'memory.limits.run-token-budget': { min: 1000, max: 2000000 },
    'memory.assembly.max-injected-memories': { min: 0, max: 50 },
    'branching.subagents.max-parallel': { min: 1, max: 16 },
    'planning.interview.max-questions-per-topic': { min: 1, max: 20 },
    'planning.verification.heartbeat-interval': { min: 5, max: 600 },
    'web.fetch.search-max-results': { min: 1, max: 50 },
    'web.fetch.crawl-max-pages': { min: 1, max: 500 },
    'extensions.skills.context-budget-percent': { min: 0, max: 20 }
  };

  /* ---------------- inventory access ---------------- */

  function inventory() { return obj(window.PM2_INVENTORY); }

  function buildIndex() {
    var inv = inventory();
    var byId = {};
    arr(inv.settings).forEach(function (s) { byId[s.id] = s; });
    return byId;
  }

  /* ---------------- value formatting ---------------- */

  function optionLabelFor(id, value) {
    /* Options are plain strings in pm2-inventory; humanize enum-ish ones. */
    var v = value == null ? '' : String(value);
    if (!v) return '';
    if (/^[a-z0-9]+(?:[_-][a-z0-9]+)+$/.test(v)) {
      return v.replace(/[_-]+/g, ' ').replace(/(^|\s)([a-z])/g, function (m, sp, ch) {
        return sp + ch.toUpperCase();
      });
    }
    return v;
  }

  function formatValue(setting, v) {
    var type = str(setting.type);
    if (type === 'toggle') return isOn(v) ? 'On' : 'Off';
    if (type === 'select' || type === 'radio') return optionLabelFor(setting.id, v);
    if (type === 'number') return (typeof v === 'number') ? fmtInt(v) : (v == null ? '' : String(v));
    if (type === 'slider') return v == null ? '' : String(v);
    if (type === 'list') {
      var n = Array.isArray(v) ? v.length : 0;
      return n === 1 ? '1 item' : n + ' items';
    }
    if (type === 'multiselect') {
      var m = Array.isArray(v) ? v.length : 0;
      return m === 1 ? '1 selected' : m + ' selected';
    }
    if (type === 'keyvalue') {
      var k = (v && typeof v === 'object' && !Array.isArray(v)) ? Object.keys(v).length : 0;
      return k === 1 ? '1 entry' : k + ' entries';
    }
    if (type === 'action') return str(setting.default).replace(/…/g, '').replace(/\.\.\.$/, '') || 'Open';
    return v == null ? '' : String(v);
  }

  function isBlank(v) {
    return v === undefined || v === null || v === '' ||
      (Array.isArray(v) && v.length === 0) ||
      (v && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0);
  }

  /* ---------------- validation ---------------- */

  function validate(setting, value) {
    var type = str(setting.type);
    var opts = arr(setting.options);
    var label = str(setting.label) || setting.id;

    if (type === 'action') {
      return { ok: false, error: label + ' is an action, not a stored value.' };
    }
    if (type === 'toggle') {
      if (value === true || value === false || value === 'on' || value === 'off') return { ok: true, value: isOn(value) };
      return { ok: false, error: 'Choose on or off for ' + label + '.' };
    }
    if (type === 'select' || type === 'radio') {
      if (opts.length && opts.indexOf(value) === -1) {
        return { ok: false, error: '"' + String(value) + '" is not one of the available choices for ' + label + '.' };
      }
      if (typeof value !== 'string') return { ok: false, error: 'Pick one of the listed choices for ' + label + '.' };
      return { ok: true, value: value };
    }
    if (type === 'multiselect') {
      if (!Array.isArray(value)) return { ok: false, error: 'Pick zero or more of the listed choices for ' + label + '.' };
      for (var i = 0; i < value.length; i++) {
        if (opts.length && opts.indexOf(value[i]) === -1) {
          return { ok: false, error: '"' + String(value[i]) + '" is not one of the available choices for ' + label + '.' };
        }
      }
      return { ok: true, value: value };
    }
    if (type === 'list') {
      if (!Array.isArray(value)) return { ok: false, error: label + ' expects a list.' };
      return { ok: true, value: value };
    }
    if (type === 'keyvalue') {
      if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return { ok: false, error: label + ' expects name and value pairs.' };
      }
      return { ok: true, value: value };
    }
    if (type === 'number' || type === 'slider') {
      var numericDefault = typeof setting.default === 'number';
      if (typeof value === 'number' && isFinite(value)) {
        var b = BOUNDS[setting.id] ||
          ((type === 'slider' && numericDefault && setting.default >= 0 && setting.default <= 1) ? { min: 0, max: 1 } : null);
        if (b) {
          if (value < b.min) return { ok: false, error: label + ' must be at least ' + fmtInt(b.min) + '.' };
          if (value > b.max) return { ok: false, error: label + ' can be at most ' + fmtInt(b.max) + '.' };
        }
        return { ok: true, value: value };
      }
      if (!numericDefault && typeof value === 'string' && value !== '') {
        /* Some sliders store display strings like "100%" or "model default". */
        return { ok: true, value: value };
      }
      return { ok: false, error: 'Enter a number for ' + label + '.' };
    }
    if (type === 'text' || type === 'path') {
      if (typeof value !== 'string') return { ok: false, error: label + ' expects text.' };
      if (value.length > 2000) return { ok: false, error: label + ' is limited to 2,000 characters.' };
      return { ok: true, value: value };
    }
    return { ok: true, value: value };
  }

  /* ---------------- store singleton ---------------- */

  var singleton = null;

  function init(conceptId) {
    if (singleton) return singleton;

    var cid = str(conceptId) || 'concept';
    var ns = NS_ROOT + cid + '.';
    var listeners = {};
    var mem = {};        /* session cache; also holds ephemeral (non-persisted) keys */
    var ephemeral = {};  /* keys applied from URLs without pin=1 */
    var byId = buildIndex();
    var inv = inventory();
    var countsCache = null;

    /* Deep-cloned object world + current project identity. */
    var data = clone(obj(window.PM_DATA));
    data.project = { id: 'proj.puppet-master', name: 'Puppet Master', role: 'Project Admin' };

    /* values map over all inventory ids, default-seeded. */
    var values = {};
    arr(inv.settings).forEach(function (s) {
      values[s.id] = {
        value: (s.default === undefined) ? null : clone(s.default),
        changedFromDefault: false
      };
    });
    DIVERGENCES.forEach(function (d) {
      if (!values[d.id]) return;
      values[d.id] = {
        value: clone(d.value),
        changedFromDefault: true,
        changedAt: d.at,
        by: 'You'
      };
    });

    /* ---- persisted user value changes (survive reload) ----
       Every successful setValue is recorded under <ns>values as
       {id: {value, changedAt, by}} and rehydrated here, after default +
       divergence seeding, so user edits win over seeded demo data. Only
       user value changes persist - scenarios/fixtures stay ephemeral
       (pm2-states owns its own keys). */
    var persistedMap = {};
    function writePersisted() {
      try {
        if (Object.keys(persistedMap).length === 0) {
          window.localStorage.removeItem(ns + 'values');
        } else {
          window.localStorage.setItem(ns + 'values', JSON.stringify(persistedMap));
        }
      } catch (e) { /* storage unavailable; in-memory values still work */ }
    }
    (function rehydrate() {
      var raw = null;
      try { raw = window.localStorage.getItem(ns + 'values'); } catch (e) { return; }
      if (!raw) return;
      var saved;
      try { saved = JSON.parse(raw); } catch (e) { return; }
      if (!saved || typeof saved !== 'object') return;
      Object.keys(saved).forEach(function (id) {
        var setting = byId[id];
        var rec = saved[id];
        if (!setting || !rec || typeof rec !== 'object' || !('value' in rec)) return;
        var res = validate(setting, rec.value);
        if (!res.ok) return; /* stale or malformed entries are dropped */
        values[id] = {
          value: res.value,
          changedFromDefault: !sameJson(res.value, setting.default === undefined ? null : setting.default),
          changedAt: str(rec.changedAt) || undefined,
          by: str(rec.by) || 'You',
          source: 'persisted'
        };
        persistedMap[id] = { value: clone(res.value), changedAt: values[id].changedAt, by: values[id].by };
      });
    })();

    /* Recent-change feed. Seeded demo entries and live setValue entries are
       kept apart so scenario resets stay honest: first-run (or any scenario
       rebuild that empties data.recents) hides the seeded feed, and a
       states-driven rebuild clears the live feed because the value changes
       it described were rolled back with the rebuild. */
    var seededRecents = SEEDED_RECENTS.map(function (r) {
      var s = byId[r.settingId] || {};
      return {
        settingId: r.settingId,
        label: str(s.label) || r.settingId,
        cat: str(s.cat), sub: str(s.sub),
        fromLabel: r.fromLabel, toLabel: r.toLabel,
        when: r.when, by: r.by, note: r.note || null
      };
    });
    var liveRecents = [];

    var store = {
      conceptId: cid,
      data: data,
      values: values,

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
        delete ephemeral[key];
        try { window.localStorage.setItem(ns + key, JSON.stringify(value)); }
        catch (e) { /* storage unavailable; in-memory still works */ }
        store.emit('change', { key: key, value: value });
      },
      /* Internal: apply URL state without persisting (pin=1 uses set()). */
      _setSession: function (key, value) {
        mem[key] = value;
        ephemeral[key] = true;
        store.emit('change', { key: key, value: value });
      },
      on: function (evt, fn) {
        if (typeof fn !== 'function') return function () {};
        (listeners[evt] || (listeners[evt] = [])).push(fn);
        return function () { store.off(evt, fn); };
      },
      off: function (evt, fn) {
        var list = listeners[evt] || [];
        var i = list.indexOf(fn);
        if (i >= 0) list.splice(i, 1);
      },
      emit: function (evt, payload) {
        arr(listeners[evt]).slice().forEach(function (fn) {
          try { fn(payload); } catch (e) { /* listener errors stay local */ }
        });
      },

      getValue: function (id) {
        var entry = values[id];
        return entry ? entry.value : undefined;
      },

      setValue: function (id, v, opts) {
        var setting = byId[id];
        if (!setting) return { ok: false, error: 'Unknown setting id.' };
        var res = validate(setting, v);
        if (!res.ok) {
          store.emit('value-error', { id: id, value: v, error: res.error });
          return res;
        }
        var entry = values[id];
        var previous = entry.value;
        var when = now().toISOString();
        var source = str(obj(opts).source) || 'settings';
        entry.value = res.value;
        entry.changedFromDefault = !sameJson(res.value, setting.default === undefined ? null : setting.default);
        entry.changedAt = when;
        entry.by = 'You';
        entry.source = source;
        countsCache = null;

        /* Persist the user's change so it survives a reload. Reverts of
           seeded demo divergences are stored too - the record, not the
           changedFromDefault flag, is what must survive. */
        persistedMap[id] = { value: clone(res.value), changedAt: when, by: 'You' };
        writePersisted();

        liveRecents.unshift({
          settingId: id,
          label: str(setting.label) || id,
          cat: str(setting.cat), sub: str(setting.sub),
          fromLabel: formatValue(setting, previous),
          toLabel: formatValue(setting, res.value),
          when: when, by: 'You', note: null
        });
        if (liveRecents.length > 40) liveRecents.length = 40;

        store.emit('value', {
          id: id, value: res.value, previous: previous,
          changedFromDefault: entry.changedFromDefault, source: source
        });
        try {
          if (window.PM2.states && typeof window.PM2.states.receipt === 'function') {
            window.PM2.states.receipt('Setting updated',
              (str(setting.label) || id) + ' is now ' + (formatValue(setting, res.value) || 'set') + '.');
          }
        } catch (e) { /* receipts are optional */ }
        return { ok: true, value: res.value, previous: previous };
      },

      resolveRow: function (id) {
        var s = byId[id];
        if (!s) return null;
        var entry = values[id] || { value: null, changedFromDefault: false };
        var value = entry.value;
        var valueLabel = formatValue(s, value);

        /* fx.long-text: pm2-states publishes curated long label/desc overrides. */
        var label = str(s.label);
        var desc = str(s.desc);
        if (store.data.longTextMode && store.data.longTextOverrides) {
          var over = obj(store.data.longTextOverrides)[id];
          if (over) {
            if (over.label) label = str(over.label);
            if (over.desc) desc = str(over.desc);
          }
        }

        var control = { type: s.type };
        if (s.options) control.options = s.options.slice();
        var b = BOUNDS[id];
        if (!b && s.type === 'slider' && typeof s.default === 'number' && s.default >= 0 && s.default <= 1) {
          b = { min: 0, max: 1 };
        }
        if (b) { control.min = b.min; control.max = b.max; }

        /* pm2-states owns row states when loaded (store.data.rowStates,
           rebuilt on every scenario/fixture change); the internal rule
           tables below are the standalone fallback. */
        var st;
        var rowStates = store.data.rowStates;
        if (rowStates && typeof rowStates === 'object') {
          var rs = rowStates[id];
          st = rs ? { state: rs.state || 'normal', note: rs.stateNote || null }
                  : { state: 'normal', note: null };
        } else {
          st = activeRowState(store, id, s);
        }

        var chips = [];
        if (st.state === 'managed') {
          chips.push({ kind: 'managed', label: valueLabel || 'Managed' });
        } else if (st.state === 'unavailable') {
          chips.push({ kind: 'unavailable', label: valueLabel || 'Unavailable' });
        } else if (s.type === 'action') {
          /* actions carry no value chip */
        } else if (isBlank(value)) {
          chips.push({ kind: 'not-configured', label: 'Not set' });
        } else if (entry.changedFromDefault) {
          chips.push({ kind: 'custom', label: valueLabel });
        } else {
          chips.push({ kind: 'default', label: valueLabel || 'Default' });
        }
        if (st.state === 'changed-elsewhere') {
          chips.push({ kind: 'differs', label: 'Changed elsewhere' });
        } else if (s.recommended !== undefined && !entry.changedFromDefault &&
                   sameJson(value, s.recommended) && st.state === 'normal') {
          chips.push({ kind: 'recommended', label: 'Recommended' });
        }

        var legacy = arr(s.legacyScope);
        var legacyScopeNote = legacy.length
          ? 'Before the project-only model this lived at ' + legacy.join(' and ') +
            ' scope. Shown for impact analysis only - everything here applies to Puppet Master.'
          : 'This setting has always been per-project.';

        var row = {
          id: s.id,
          label: label,
          desc: desc,
          control: control,
          value: value,
          valueLabel: valueLabel,
          changedFromDefault: !!entry.changedFromDefault,
          badges: arr(s.badges).slice(),
          chips: chips,
          state: st.state,
          tier: str(s.tier),
          detail: {
            legacyScopeNote: legacyScopeNote,
            related: arr(s.related_features).slice(),
            searchTerms: arr(s.search).slice()
          }
        };
        if (s.recommended !== undefined) row.recommended = clone(s.recommended);
        if (st.note) row.stateNote = st.note;
        return row;
      },

      rowsFor: function (cat, sub) {
        var rows = [];
        arr(inv.settings).forEach(function (s) {
          if (s.cat !== cat) return;
          if (sub && s.sub !== sub) return;
          rows.push(s);
        });
        /* Curated first, then simple, then advanced; stable inventory order. */
        var bucket = function (s) { return s.curated ? 0 : (s.tier === 'simple' ? 1 : 2); };
        var indexed = rows.map(function (s, i) { return { s: s, i: i }; });
        indexed.sort(function (a, b) {
          var d = bucket(a.s) - bucket(b.s);
          return d !== 0 ? d : a.i - b.i;
        });
        return indexed.map(function (x) { return store.resolveRow(x.s.id); });
      },

      counts: function () {
        if (countsCache) return countsCache;
        var changedTotal = 0;
        var perCat = {};
        arr(inv.categories).forEach(function (c) {
          perCat[c.id] = {
            id: c.id, title: c.title, icon: c.icon, desc: c.desc,
            total: 0, changed: 0, simple: 0, advanced: 0,
            subgroups: arr(c.subgroups).map(function (g) {
              return { id: g.id, title: g.title, total: 0 };
            })
          };
        });
        arr(inv.settings).forEach(function (s) {
          var c = perCat[s.cat];
          if (!c) return;
          c.total += 1;
          if (s.tier === 'simple') c.simple += 1; else c.advanced += 1;
          for (var i = 0; i < c.subgroups.length; i++) {
            if (c.subgroups[i].id === s.sub) { c.subgroups[i].total += 1; break; }
          }
          var entry = values[s.id];
          if (entry && entry.changedFromDefault) { c.changed += 1; changedTotal += 1; }
        });
        var list = arr(inv.categories).map(function (c) { return perCat[c.id]; });
        countsCache = {
          total: arr(inv.settings).length,
          changed: changedTotal,
          attention: store.attention().length,
          byCategory: list
        };
        return countsCache;
      },

      recents: function () {
        /* Scenario-honest feed: first-run is a clean workspace, and a
           scenario rebuild that emptied data.recents is a systematic empty -
           in both cases only changes made after that point (live entries)
           may appear. Live entries themselves are cleared whenever a
           states-driven rebuild rolls the values back (see the 'scenario'
           listener below). */
        var sc = currentScenario(store);
        var systematicEmpty = sc === 'first-run' ||
          (Array.isArray(store.data.recents) && store.data.recents.length === 0);
        if (systematicEmpty) return liveRecents.slice();
        return liveRecents.concat(seededRecents).slice(0, 40);
      },

      /* Drops the persisted user value changes (localStorage only - the
         current in-memory values are untouched). Used by the States drawer,
         tests, and the first-run scenario reset. */
      clearPersistedValues: function () {
        persistedMap = {};
        try { window.localStorage.removeItem(ns + 'values'); } catch (e) { /* ignore */ }
      },

      attention: function () {
        var scenario = currentScenario(store);
        if (scenario === 'calm' || scenario === 'first-run') return [];
        var items = BASE_ATTENTION.map(clone);
        if (scenario === 'usage-exhausted') {
          items[0] = {
            id: 'att.usage-window', statusWord: 'Waiting',
            headline: 'Claude usage window is exhausted',
            consequence: 'New runs queue or fall back to the secondary route until the 6:00 PM reset.',
            dest: { route: 'dest', cat: 'ai', sub: 'usage' }
          };
        }
        if (scenario === 'offline') {
          items.unshift({
            id: 'att.offline', statusWord: 'Offline',
            headline: 'No network connection detected',
            consequence: 'Provider status, web search, and update checks are paused until the connection returns.',
            dest: { route: 'dest', cat: 'web', sub: 'providers' }
          });
          items = items.slice(0, 4);
        }
        if (scenario === 'attention-heavy' || scenario === 'invocation-failed') {
          items = items.concat(HEAVY_ATTENTION.map(clone));
        }
        return items;
      }
    };

    /* ---- session mirror ----
       store.session = {scenario, fixtures, stress} is the ALWAYS-CURRENT view
       of applied test state, updated on every scenario/fixtures/stress
       application regardless of persistence - including URL-applied state
       running with persist:false, where store.get('scenario') would go
       stale. Concepts should read store.session (or listen to the events);
       the persisted keys keep their existing meaning (pinned state only)
       and are not written here. */
    store.session = {
      scenario: str(store.get('scenario')) || 'baseline',
      fixtures: arr(store.get('fixtures')).slice(),
      stress: store.get('stress') === true
    };

    /* keep counts honest when values or scenario state change; the first-run
       scenario is a clean-workspace reset, so it also drops the persisted
       user value changes (coordinated with pm2-states' applyScenario). */
    function onScenarioChanged(id, rebuilt) {
      countsCache = null;
      if (typeof id === 'string' && id) store.session.scenario = id;
      /* A states-driven rebuild rolled values back to the scenario baseline,
         so the live recents describing rolled-back changes must go too. */
      if (rebuilt) liveRecents.length = 0;
      if (id === 'first-run') store.clearPersistedValues();
    }
    store.on('value', function () { countsCache = null; });
    store.on('scenario', function (p) {
      onScenarioChanged(typeof p === 'string' ? p : str(obj(p).id) || str(obj(p).scenario), true);
    });
    store.on('fixtures', function (p) {
      countsCache = null;
      var ids = Array.isArray(p) ? p : arr(obj(p).ids);
      store.session.fixtures = ids.slice();
    });
    store.on('change', function (p) {
      if (!p) return;
      if (p.key === 'scenario') onScenarioChanged(str(p.value), false);
      else if (p.key === 'fixtures') { countsCache = null; store.session.fixtures = arr(p.value).slice(); }
      else if (p.key === 'stress') { countsCache = null; store.session.stress = p.value === true; }
    });

    singleton = store;

    /* Hand the singleton to pm2-states so it can take its pristine snapshot
       and reapply any persisted scenario/fixtures/stress. Guarded: the store
       works standalone when pm2-states is not loaded. */
    try {
      if (window.PM2.states && typeof window.PM2.states.onStoreInit === 'function') {
        window.PM2.states.onStoreInit(store);
      }
    } catch (e) { /* states drawer is optional */ }

    return store;
  }

  /* ---- current test-state resolution (read-through) ----
     Order of truth: PM2.states.activeScenario()/activeFixtures() when the
     states module is loaded (always current, including URL-applied
     persist:false state), else the store.session mirror, else the persisted
     store key. Everything in this file that branches on scenario/fixtures
     resolves through these two helpers. */
  function currentScenario(store) {
    try {
      var S = window.PM2.states;
      if (S && typeof S.activeScenario === 'function') {
        var sc = S.activeScenario();
        if (typeof sc === 'string' && sc) return sc;
        if (sc && typeof sc === 'object' && sc.id) return String(sc.id);
      }
    } catch (e) { /* states optional */ }
    if (store.session && store.session.scenario) return store.session.scenario;
    return str(store.get('scenario')) || 'baseline';
  }
  function currentFixtures(store) {
    try {
      var S = window.PM2.states;
      if (S && typeof S.activeFixtures === 'function') {
        var fx = S.activeFixtures();
        if (Array.isArray(fx)) return fx;
      }
    } catch (e) { /* states optional */ }
    if (store.session && Array.isArray(store.session.fixtures)) return store.session.fixtures;
    return arr(store.get('fixtures'));
  }

  /* Active row state from baseline rules + scenario + fixtures (last wins). */
  function activeRowState(store, id, setting) {
    var state = 'normal';
    var note = null;

    function apply(rule) {
      if (rule.id && rule.id !== id) return;
      if (rule.prefix && id.indexOf(rule.prefix) !== 0) return;
      if (!rule.id && !rule.prefix) return;
      state = rule.state;
      note = rule.note || null;
    }

    /* Baseline co-exhibits: glass transparency follows the live theme value. */
    if (id === 'general.visual.glass-transparency') {
      var theme = store.getValue('general.visual.theme');
      if (String(theme || '').indexOf('Glass') !== 0) {
        state = 'unavailable';
        note = 'Available while a Glass theme is active. The current theme is ' + (theme || 'Friendly Dark') + '.';
      }
    }
    BASELINE_RULES.forEach(apply);

    var scenario = currentScenario(store);
    if (scenario === 'calm' || scenario === 'first-run') {
      /* calm and first-run present a clean workspace: no pending states */
      if (state !== 'unavailable') { state = 'normal'; note = null; }
    }
    arr(SCENARIO_RULES[scenario]).forEach(apply);

    arr(currentFixtures(store)).forEach(function (fid) {
      arr(FIXTURE_RULES[fid]).forEach(apply);
    });

    return { state: state, note: note };
  }

  window.PM2.store = {
    init: init,
    /* test hook: current singleton without creating one */
    current: function () { return singleton; }
  };
})();
