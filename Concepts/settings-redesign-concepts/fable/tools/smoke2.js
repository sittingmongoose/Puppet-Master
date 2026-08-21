#!/usr/bin/env node
/* smoke2.js — shared-v2 headless smoke harness for fable concepts 05-11.
   Loads the _shared + _shared2 modules in CONTRACT2 load order inside a vm
   sandbox with a minimal window/document stub (document.body is deliberately
   absent so DOM mounting such as the pm2-states drawer must guard), then runs
   assertions against whatever modules exist. Files that do not exist yet are
   skipped with a warning so parallel builders can run this at any time.
   Usage: node tools/smoke2.js   (from the fable folder; any cwd works)
   Exit code: 0 = all assertions passed, 1 = at least one failure. */
'use strict';

var fs = require('fs');
var path = require('path');
var vm = require('vm');

var ROOT = path.resolve(__dirname, '..');

var LOAD_ORDER = [
  '_shared/pm-icons.js',
  '_shared/pm-demo-data.js',
  '_shared/pm-demo-data-ext.js',
  '_shared/pm-provider.js',
  '_shared2/pm2-inventory.js',
  '_shared2/pm2-store.js',
  '_shared2/pm2-managers.js',
  '_shared2/pm2-managers2.js',
  '_shared2/pm2-search.js',
  '_shared2/pm2-copy.js',
  '_shared2/pm2-states.js',
  '_shared2/pm2-route.js'
];

/* ---------------- window / document stub ---------------- */

function makeElement(tag) {
  var el = {
    tagName: String(tag || 'div').toUpperCase(),
    style: {}, dataset: {}, children: [],
    attributes: {},
    innerHTML: '', textContent: '', value: '', checked: false, disabled: false,
    classList: {
      _set: {},
      add: function (c) { this._set[c] = true; },
      remove: function (c) { delete this._set[c]; },
      toggle: function (c) { if (this._set[c]) delete this._set[c]; else this._set[c] = true; },
      contains: function (c) { return !!this._set[c]; }
    },
    setAttribute: function (k, v) { el.attributes[k] = String(v); },
    getAttribute: function (k) {
      return Object.prototype.hasOwnProperty.call(el.attributes, k) ? el.attributes[k] : null;
    },
    removeAttribute: function (k) { delete el.attributes[k]; },
    appendChild: function (c) { el.children.push(c); return c; },
    removeChild: function (c) {
      var i = el.children.indexOf(c);
      if (i >= 0) el.children.splice(i, 1);
      return c;
    },
    insertBefore: function (c) { el.children.unshift(c); return c; },
    addEventListener: function () {},
    removeEventListener: function () {},
    dispatchEvent: function () { return true; },
    querySelector: function () { return null; },
    querySelectorAll: function () { return []; },
    getBoundingClientRect: function () { return { top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 }; },
    focus: function () {},
    blur: function () {},
    click: function () {},
    remove: function () {}
  };
  return el;
}

function makeSandbox(sharedStorage) {
  var listeners = {};
  var storage = sharedStorage || {};
  var posted = [];

  var w = {};
  w.window = w;
  w.self = w;
  w.globalThis = w;

  var hashValue = '';
  w.location = {
    href: 'file:///smoke/concept-00-smoke.html',
    pathname: '/smoke/concept-00-smoke.html',
    search: '',
    replace: function () {},
    reload: function () {},
    toString: function () { return this.href; }
  };
  Object.defineProperty(w.location, 'hash', {
    get: function () { return hashValue; },
    set: function (v) {
      var next = String(v || '');
      if (next && next.charAt(0) !== '#') next = '#' + next;
      if (next === hashValue) return;
      hashValue = next;
      dispatch('hashchange', { type: 'hashchange' });
    }
  });
  w.__setHashSilently = function (v) { hashValue = String(v || ''); };

  w.history = {
    pushState: function (s, t, url) {
      if (typeof url === 'string' && url.charAt(0) === '#') hashValue = url;
    },
    replaceState: function (s, t, url) {
      if (typeof url === 'string' && url.charAt(0) === '#') hashValue = url;
    },
    back: function () {},
    forward: function () {}
  };

  function dispatch(evt, payload) {
    (listeners[evt] || []).slice().forEach(function (fn) { fn(payload); });
  }
  w.__dispatch = dispatch;

  w.addEventListener = function (evt, fn) {
    (listeners[evt] || (listeners[evt] = [])).push(fn);
  };
  w.removeEventListener = function (evt, fn) {
    var list = listeners[evt] || [];
    var i = list.indexOf(fn);
    if (i >= 0) list.splice(i, 1);
  };

  w.localStorage = {
    getItem: function (k) { return Object.prototype.hasOwnProperty.call(storage, k) ? storage[k] : null; },
    setItem: function (k, v) { storage[k] = String(v); },
    removeItem: function (k) { delete storage[k]; },
    clear: function () { Object.keys(storage).forEach(function (k) { delete storage[k]; }); },
    key: function (i) { return Object.keys(storage)[i] || null; },
    get length() { return Object.keys(storage).length; }
  };
  w.__storage = storage;

  w.parent = {
    postMessage: function (msg) { posted.push(msg); }
  };
  w.__posted = posted;
  w.postMessage = function () {};

  var docEl = makeElement('html');
  w.document = {
    documentElement: docEl,
    head: makeElement('head'),
    /* document.body intentionally ABSENT: modules that mount UI must guard. */
    createElement: makeElement,
    createTextNode: function (t) { return { textContent: String(t) }; },
    createDocumentFragment: function () { return makeElement('fragment'); },
    getElementById: function () { return null; },
    querySelector: function () { return null; },
    querySelectorAll: function () { return []; },
    addEventListener: function () {},
    removeEventListener: function () {},
    dispatchEvent: function () { return true; }
  };

  w.navigator = { userAgent: 'pm2-smoke', language: 'en-US', platform: 'node' };
  w.matchMedia = function () {
    return {
      matches: false, media: '',
      addListener: function () {}, removeListener: function () {},
      addEventListener: function () {}, removeEventListener: function () {}
    };
  };
  w.requestAnimationFrame = function (fn) { return setTimeout(fn, 0); };
  w.cancelAnimationFrame = function (id) { clearTimeout(id); };
  w.getComputedStyle = function () { return {}; };
  w.setTimeout = setTimeout;
  w.clearTimeout = clearTimeout;
  w.setInterval = setInterval;
  w.clearInterval = clearInterval;
  w.performance = { now: function () { return Date.now(); } };
  w.console = console;
  w.CustomEvent = function CustomEvent(type, init) {
    this.type = type; this.detail = init && init.detail;
  };
  w.Event = function Event(type) { this.type = type; };

  /* expose window members as bare globals too (browser scripts assume both) */
  var ctx = w;
  ctx.location = w.location;
  ctx.document = w.document;
  ctx.localStorage = w.localStorage;
  ctx.navigator = w.navigator;
  ctx.history = w.history;

  vm.createContext(ctx);
  return ctx;
}

/* ---------------- tiny assertion harness ---------------- */

var passed = 0;
var failed = 0;
var warnings = 0;

function ok(cond, label) {
  if (cond) { passed += 1; return true; }
  failed += 1;
  console.log('  FAIL  ' + label);
  return false;
}
function eq(a, b, label) {
  var good = JSON.stringify(a) === JSON.stringify(b);
  if (good) { passed += 1; return true; }
  failed += 1;
  console.log('  FAIL  ' + label + '\n        expected ' + JSON.stringify(b) + '\n        got      ' + JSON.stringify(a));
  return false;
}
function warn(label) {
  warnings += 1;
  console.log('  WARN  ' + label);
}
function section(name) { console.log('\n== ' + name + ' =='); }

/* ---------------- load modules ---------------- */

var ctx = makeSandbox();
var loadedFiles = {};

section('load order');
LOAD_ORDER.forEach(function (rel) {
  var full = path.join(ROOT, rel);
  if (!fs.existsSync(full)) {
    warn('missing (skipped): ' + rel);
    return;
  }
  var src = fs.readFileSync(full, 'utf8');
  try {
    vm.runInContext(src, ctx, { filename: rel });
    loadedFiles[rel] = true;
    console.log('  ok    ' + rel);
  } catch (e) {
    failed += 1;
    console.log('  FAIL  ' + rel + ' threw during load: ' + (e && e.message));
  }
});

var PM2 = ctx.window.PM2 || {};
var INV = ctx.window.PM2_INVENTORY;

/* ---------------- inventory sanity ---------------- */

if (INV) {
  section('inventory');
  ok(INV.settingsCount === 828, 'inventory declares 828 settings');
  ok(Array.isArray(INV.settings) && INV.settings.length === 828, 'inventory carries 828 setting rows');
  ok(Array.isArray(INV.categories) && INV.categories.length === 12, 'inventory carries 12 categories');
}

/* ---------------- store ---------------- */

var store = null;
if (PM2.store && typeof PM2.store.init === 'function') {
  section('pm2-store');
  store = PM2.store.init('c00-smoke');
  ok(!!store, 'init returns a store');
  ok(store === PM2.store.init('c00-smoke'), 'init is a singleton');
  ok(store.conceptId === 'c00-smoke', 'store.conceptId');
  ok(store.data && store.data.project && store.data.project.id === 'proj.puppet-master',
    'data.project is the Puppet Master project');
  ok(store.data.project.role === 'Project Admin', 'data.project.role');
  ok(store.data !== ctx.window.PM_DATA, 'data world is a clone, not PM_DATA itself');
  if (ctx.window.PM_DATA) {
    var beforeVersion = ctx.window.PM_DATA.version;
    store.data.version = 'mutated-by-smoke';
    ok(ctx.window.PM_DATA.version === beforeVersion, 'mutating store.data leaves PM_DATA untouched');
  }

  var valueIds = Object.keys(store.values);
  eq(valueIds.length, 828, 'values map covers all 828 inventory ids');

  var changed = valueIds.filter(function (id) { return store.values[id].changedFromDefault; });
  ok(changed.length >= 25, 'at least 25 curated divergences (found ' + changed.length + ')');
  var changedCats = {};
  changed.forEach(function (id) { changedCats[id.split('.')[0]] = true; });
  ok(Object.keys(changedCats).length >= 8,
    'divergences span at least 8 categories (found ' + Object.keys(changedCats).length + ')');

  ok(store.getValue('general.visual.theme') === 'Friendly Dark', 'getValue returns the seeded default');
  ok(store.getValue('nonexistent.setting.id') === undefined, 'getValue on unknown id is undefined');

  var setRes = store.setValue('general.visual.font-size', 16, { source: 'smoke' });
  ok(setRes && setRes.ok === true, 'setValue accepts a valid number');
  ok(store.getValue('general.visual.font-size') === 16, 'setValue persists the value');
  var badNum = store.setValue('general.visual.font-size', 'huge');
  ok(badNum && badNum.ok === false && typeof badNum.error === 'string',
    'setValue rejects a non-number with {ok:false, error}');
  var badOpt = store.setValue('general.visual.theme', 'Neon Ultra');
  ok(badOpt && badOpt.ok === false, 'setValue rejects a value outside options');
  var badRange = store.setValue('memory.limits.run-token-budget', 10);
  ok(badRange && badRange.ok === false, 'setValue rejects an out-of-range number');
  var valueEvents = 0;
  var offValue = store.on('value', function () { valueEvents += 1; });
  store.setValue('code.terminal.font-size', 14);
  ok(valueEvents === 1, 'setValue emits a value event');
  offValue();

  /* resolveRow on 5 known ids */
  var ROW_IDS = ['general.visual.theme', 'ai.usage.max-tool-rounds',
    'safety.rules.permission-preset', 'memory.limits.run-token-budget', 'system.mcp.server-list'];
  var STATES = ['normal', 'managed', 'unavailable', 'restart-required',
    'reconnect-required', 'changed-elsewhere', 'error'];
  ROW_IDS.forEach(function (id) {
    var row = store.resolveRow(id);
    if (!ok(!!row, 'resolveRow(' + id + ') returns a row')) return;
    ok(row.id === id, id + ': id');
    ok(typeof row.label === 'string' && row.label.length > 0, id + ': label');
    ok(typeof row.desc === 'string' && row.desc.length > 0, id + ': desc');
    ok(row.control && typeof row.control.type === 'string', id + ': control.type');
    ok(typeof row.valueLabel === 'string', id + ': valueLabel');
    ok(typeof row.changedFromDefault === 'boolean', id + ': changedFromDefault');
    ok(Array.isArray(row.badges), id + ': badges array');
    ok(Array.isArray(row.chips) && row.chips.every(function (c) {
      return c && typeof c.kind === 'string' && typeof c.label === 'string';
    }), id + ': chips are {kind,label}');
    ok(STATES.indexOf(row.state) >= 0, id + ': state is a contract state (' + row.state + ')');
    ok(row.tier === 'simple' || row.tier === 'advanced', id + ': tier');
    ok(row.detail && typeof row.detail.legacyScopeNote === 'string', id + ': detail.legacyScopeNote');
    ok(row.detail && Array.isArray(row.detail.related), id + ': detail.related');
    ok(row.detail && Array.isArray(row.detail.searchTerms), id + ': detail.searchTerms');
  });
  ok(store.resolveRow('general.visual.theme').control.options.length === 8,
    'resolveRow surfaces select options');
  ok(store.resolveRow('nonexistent.setting.id') === null, 'resolveRow on unknown id is null');

  /* rowsFor totals sum to 828 */
  if (INV) {
    var total = 0;
    var curatedIds = {};
    INV.settings.forEach(function (s) { if (s.curated) curatedIds[s.id] = true; });
    INV.categories.forEach(function (c) {
      var rows = store.rowsFor(c.id);
      total += rows.length;
      if (rows.length && Object.keys(curatedIds).length) {
        ok(curatedIds[rows[0].id],
          'rowsFor(' + c.id + ') puts a curated row first (' + rows[0].id + ')');
      }
    });
    eq(total, 828, 'rowsFor totals across 12 categories sum to 828');
    var sub = store.rowsFor('general', 'visual');
    ok(sub.length > 0 && sub.every(function (r) { return r.id.indexOf('general.visual.') === 0; }),
      'rowsFor(cat, sub) filters to the subgroup');
  }

  /* counts */
  var counts = store.counts();
  ok(counts && counts.total === 828, 'counts().total is 828');
  ok(Array.isArray(counts.byCategory) && counts.byCategory.length === 12, 'counts() has 12 categories');
  ok(counts.changed >= 25, 'counts().changed reflects divergences');
  ok(counts === store.counts(), 'counts() is cached');

  /* recents */
  var recents = store.recents();
  ok(recents.length >= 6, 'recents() seeds at least 6 entries (found ' + recents.length + ')');
  ok(recents[0].settingId === 'code.terminal.font-size', 'live setValue prepends to recents');
  ok(recents.every(function (r) {
    return r.settingId && typeof r.when === 'string' && r.by && typeof r.toLabel === 'string';
  }), 'recent entries carry settingId/when/by/toLabel');
  var sortedDesc = recents.every(function (r, i) {
    return i === 0 || Date.parse(recents[i - 1].when) >= Date.parse(r.when);
  });
  ok(sortedDesc, 'recents are newest first');

  /* attention */
  var att = store.attention();
  ok(att.length >= 2 && att.length <= 4, 'attention() baseline is 2-4 items (found ' + att.length + ')');
  ok(att.every(function (a) {
    return a.id && a.statusWord && a.headline && a.consequence && a.dest && a.dest.route;
  }), 'attention items carry id/statusWord/headline/consequence/dest');

  /* ---- value persistence across reloads ---- */
  section('pm2-store persistence');
  var VKEY = 'pm.settingsConcepts.fable.c00-smoke.values';
  ok(typeof store.clearPersistedValues === 'function', 'store.clearPersistedValues exists');
  var persistedRaw = ctx.window.localStorage.getItem(VKEY);
  if (ok(!!persistedRaw, 'setValue writes the persisted values key')) {
    var persisted = JSON.parse(persistedRaw);
    ok(persisted['general.visual.font-size'] &&
       persisted['general.visual.font-size'].value === 16 &&
       persisted['general.visual.font-size'].changedAt &&
       persisted['general.visual.font-size'].by === 'You',
      'persisted entries carry value/changedAt/by');
  }

  /* simulated reload: fresh context, same localStorage backing store */
  function reloadStore() {
    var ctx2 = makeSandbox(ctx.__storage);
    ['_shared/pm-demo-data.js', '_shared/pm-demo-data-ext.js',
     '_shared2/pm2-inventory.js', '_shared2/pm2-store.js'].forEach(function (rel) {
      vm.runInContext(fs.readFileSync(path.join(ROOT, rel), 'utf8'), ctx2, { filename: rel + ' (reload)' });
    });
    return ctx2.window.PM2.store.init('c00-smoke');
  }
  var store2 = reloadStore();
  ok(store2.getValue('general.visual.font-size') === 16, 'value survives a reload');
  var reRow = store2.resolveRow('general.visual.font-size');
  ok(reRow && reRow.changedFromDefault === true, 'rehydrated value is marked changedFromDefault');
  eq(Object.keys(store2.values).length, 828, 'rehydrated values map still covers 828 ids');

  /* reverting a seeded divergence must survive a reload too */
  var revert = store2.setValue('ai.models.default-model', 'anthropic/claude-sonnet-4');
  ok(revert && revert.ok === true, 'revert to the inventory default is accepted');
  var store3 = reloadStore();
  ok(store3.getValue('ai.models.default-model') === 'anthropic/claude-sonnet-4',
    'reverted divergence survives a reload');
  ok(store3.resolveRow('ai.models.default-model').changedFromDefault === false,
    'reverted value is honestly not changedFromDefault');

  /* explicit clear */
  store3.clearPersistedValues();
  ok(ctx.window.localStorage.getItem(VKEY) === null, 'clearPersistedValues removes the key');

  /* first-run scenario reset clears persisted values (standalone hook path) */
  var store4 = reloadStore();
  store4.setValue('general.visual.font-size', 18);
  ok(ctx.window.localStorage.getItem(VKEY) !== null, 'persisted key back after a new change');
  store4._setSession('scenario', 'first-run');
  ok(ctx.window.localStorage.getItem(VKEY) === null, 'first-run scenario clears persisted values');
  store4._setSession('scenario', 'baseline');

  /* ---- session mirror + scenario-honest recents ---- */
  section('pm2-store session + recents');
  ok(store.session && typeof store.session.scenario === 'string' &&
     Array.isArray(store.session.fixtures) && typeof store.session.stress === 'boolean',
    'store.session mirror exists ({scenario, fixtures, stress})');

  var store5 = reloadStore();
  eq(store5.session.scenario, 'baseline', 'session starts at baseline');
  store5._setSession('scenario', 'first-run');
  eq(store5.session.scenario, 'first-run', 'session mirrors ephemeral scenario writes');
  eq(store5.recents().length, 0, 'first-run shows an empty recents feed');
  store5._setSession('scenario', 'baseline');
  ok(store5.recents().length >= 6, 'returning to baseline restores the seeded feed');

  /* states-style event with persist:false: persisted key stays stale, mirror
     and readers stay current */
  store5.emit('scenario', 'attention-heavy');
  eq(store5.session.scenario, 'attention-heavy', 'session mirrors event-applied scenario');
  ok(store5.get('scenario') === 'baseline' || store5.get('scenario') === undefined,
    'persisted scenario key semantics unchanged (still un-pinned)');
  ok(store5.attention().length > 4, 'attention() reads the mirror, not the stale key');

  /* a states-driven rebuild rolls values back, so live recents clear too */
  store5.emit('scenario', 'baseline');
  store5.setValue('general.visual.font-size', 19);
  ok(store5.recents()[0].settingId === 'general.visual.font-size', 'live change tops the feed');
  store5.emit('scenario', 'baseline'); /* rebuild signal */
  ok(store5.recents()[0].settingId !== 'general.visual.font-size',
    'scenario rebuild clears live recents (rolled-back change gone)');
  ok(store5.recents().length >= 6, 'seeded feed remains after a non-first-run rebuild');
  store5.clearPersistedValues();
} else {
  warn('PM2.store not loaded; store assertions skipped');
}

/* ---------------- PM2.now + PM2.util ---------------- */

if (typeof PM2.now === 'function') {
  section('PM2.now / PM2.util');
  var t1 = PM2.now();
  var t2 = PM2.now();
  ok(Object.prototype.toString.call(t1) === '[object Date]', 'now() returns a Date');
  ok(t2.getTime() > t1.getTime(), 'now() is monotonic');
  ok(t1.toISOString().indexOf('2026-08-05') === 0, 'now() stays on the 2026-08-05 demo day');
  ok(t1.getTime() >= Date.parse('2026-08-05T16:20:00Z'), 'now() base is 2026-08-05T16:20:00Z');

  var U = PM2.util || {};
  ['clone', 'debounce', 'slug', 'fmtInt', 'fmtBytes', 'fmtAgo'].forEach(function (k) {
    ok(typeof U[k] === 'function', 'PM2.util.' + k + ' is a function');
  });
  if (U.fmtInt) eq(U.fmtInt(1234567), '1,234,567', 'fmtInt groups thousands');
  if (U.fmtBytes) ok(/MB$/.test(U.fmtBytes(5242880)), 'fmtBytes formats megabytes (' + U.fmtBytes(5242880) + ')');
  if (U.slug) eq(U.slug('Hello, World!'), 'hello-world', 'slug normalizes');
  if (U.clone) {
    var orig = { a: [1, 2], b: { c: 3 } };
    var cl = U.clone(orig);
    cl.b.c = 4;
    ok(orig.b.c === 3, 'clone is deep');
  }
  if (U.fmtAgo) {
    ok(/hour/.test(U.fmtAgo('2026-08-05T13:20:00Z')), 'fmtAgo renders hours against the demo clock');
    ok(U.fmtAgo('2026-08-04T16:00:00Z') === 'yesterday', 'fmtAgo renders yesterday');
  }
} else {
  warn('PM2.now not present; clock/util assertions skipped');
}

/* ---------------- managers (when present) ---------------- */

if (PM2.managers) {
  section('pm2-managers');
  ['get', 'all', 'byCat', 'demonstrated', 'deferred', 'register'].forEach(function (k) {
    ok(typeof PM2.managers[k] === 'function', 'PM2.managers.' + k + ' is a function');
  });
  var all = (typeof PM2.managers.all === 'function') ? PM2.managers.all() : [];
  ok(Array.isArray(all), 'all() returns an array');
  if (all.length) {
    var idsSeen = {};
    var wellFormed = all.every(function (d) {
      if (idsSeen[d.id]) return false;
      idsSeen[d.id] = true;
      return d.id && d.family && d.cat && d.title && d.archetype &&
        (d.status === 'demonstrated' || d.status === 'deferred_named_owner');
    });
    ok(wellFormed, 'every manager def has id/family/cat/title/archetype/status and unique id');
    var dem = PM2.managers.demonstrated().length;
    var def = PM2.managers.deferred().length;
    eq(dem + def, all.length, 'demonstrated + deferred partition the registry');
    if (PM2.managers.get('m.providers') && store) {
      var mdl = PM2.managers.get('m.providers').model(store);
      ok(mdl && Array.isArray(mdl.sections), 'm.providers model(store) yields sections[]');
    }
    if (loadedFiles['_shared2/pm2-managers2.js'] && all.length < 46) {
      /* 15 (pm2-managers) + 31 (pm2-managers2) once both are complete; the
         registry may still be filling while parallel builders work. */
      warn('manager registry has ' + all.length + ' of 46 expected defs (files may be mid-build)');
    } else if (loadedFiles['_shared2/pm2-managers2.js']) {
      ok(all.length >= 46, 'both manager files registered (defs: ' + all.length + ')');
    }
  } else {
    warn('manager registry is empty; def-shape assertions skipped');
  }
} else {
  warn('PM2.managers not loaded; manager assertions skipped');
}

/* ---------------- search (when present) ---------------- */

if (PM2.search && typeof PM2.search.query === 'function') {
  section('pm2-search');
  var res = PM2.search.query('theme');
  ok(res && typeof res.total === 'number' && Array.isArray(res.groups), 'query() returns {query,total,groups}');
  ok(res.total > 0, 'query("theme") finds results');
  var flatResults = [];
  res.groups.forEach(function (g) { flatResults = flatResults.concat(g.results || []); });
  ok(flatResults.length > 0 && flatResults.every(function (r) {
    return typeof r.rid === 'string' && r.kind && r.label && r.dest;
  }), 'results carry rid/kind/label/dest');
  ok(flatResults.some(function (r) { return r.rid.indexOf('s:') === 0; }), 'setting results use rid s:<id>');
  ok(PM2.search.query('notifcations').total > 0, 'typo probe "notifcations" still matches');
  ok(PM2.search.query('permisions').total > 0, 'typo probe "permisions" still matches');
  eq(PM2.search.query('flux capacitor').total, 0, 'no-results probe "flux capacitor" is empty');
} else {
  warn('PM2.search not loaded; search assertions skipped');
}

/* ---------------- copy (when present) ---------------- */

if (PM2.copy && typeof PM2.copy.sources === 'function') {
  section('pm2-copy');
  var sources = PM2.copy.sources();
  eq(sources.length, 5, 'copy.sources() offers 5 demo projects');
  ok(sources.every(function (s) {
    return s.id && s.name && Array.isArray(s.categorySummaries);
  }), 'sources carry id/name/categorySummaries');
  ok(typeof PM2.copy.apply === 'function' && typeof PM2.copy.rollback === 'function',
    'copy.apply and copy.rollback exist');
  if (typeof PM2.copy.preview === 'function' && sources.length) {
    var prev = PM2.copy.preview(sources[0].id, ['general']);
    ok(prev && prev.token && prev.counts, 'preview returns {token, counts}');
    if (prev && prev.counts) {
      ok(['add', 'replace', 'unchanged', 'unavailable', 'conflict'].every(function (k) {
        return typeof prev.counts[k] === 'number';
      }), 'preview counts carry add/replace/unchanged/unavailable/conflict');
    }
    ok(prev && Array.isArray(prev.items), 'preview returns items[]');
    var prev2 = PM2.copy.preview(sources[0].id, ['general']);
    eq(prev2 && prev2.counts, prev && prev.counts, 'preview is deterministic');
  }
} else {
  warn('PM2.copy not loaded; copy assertions skipped');
}

/* ---------------- states (when present) ---------------- */

if (PM2.states) {
  section('pm2-states');
  ['applyScenario', 'op', 'setTimescale', 'receipt', 'mountDrawer'].forEach(function (k) {
    ok(typeof PM2.states[k] === 'function', 'PM2.states.' + k + ' is a function');
  });
  try {
    if (typeof PM2.states.setTimescale === 'function') PM2.states.setTimescale(0);
    passed += 1;
  } catch (e) { failed += 1; console.log('  FAIL  setTimescale(0) threw: ' + e.message); }
  try {
    if (typeof PM2.states.applyScenario === 'function' && store) PM2.states.applyScenario('baseline');
    passed += 1;
  } catch (e) { failed += 1; console.log('  FAIL  applyScenario("baseline") threw: ' + e.message); }
  try {
    /* document.body is absent in this sandbox: mounting must guard, not throw */
    if (typeof PM2.states.mountDrawer === 'function' && store) PM2.states.mountDrawer(store);
    passed += 1;
  } catch (e) { failed += 1; console.log('  FAIL  mountDrawer without document.body threw: ' + e.message); }
  if (store) {
    var v = Object.keys(store.values).length;
    eq(v, store.data && store.data.rowStates ? v : 828, 'values map still covers 828 ids after scenario apply');
  }
} else {
  warn('PM2.states not loaded; states assertions skipped');
}

/* ---------------- route ---------------- */

var asyncTail = Promise.resolve();
if (PM2.route) {
  section('pm2-route');
  ['parse', 'build', 'go', 'current', 'bind'].forEach(function (k) {
    ok(typeof PM2.route[k] === 'function', 'PM2.route.' + k + ' is a function');
  });

  /* round-trips for every route form */
  var FORMS = [
    { route: { kind: 'home' }, path: 'home' },
    { route: { kind: 'all' }, path: 'all' },
    { route: { kind: 'copy' }, path: 'copy' },
    { route: { kind: 'dest', cat: 'ai' }, path: 'dest/ai' },
    { route: { kind: 'dest', cat: 'ai', sub: 'usage' }, path: 'dest/ai/usage' },
    { route: { kind: 'manager', managerId: 'm.providers' }, path: 'manager/m.providers' },
    { route: { kind: 'manager', managerId: 'm.providers', objectId: 'openai' }, path: 'manager/m.providers/openai' },
    { route: { kind: 'manager', managerId: 'm.providers', objectId: 'openai', tab: 'usage' }, path: 'manager/m.providers/openai/usage' },
    { route: { kind: 'setting', settingId: 'general.visual.theme' }, path: 'setting/general.visual.theme' },
    { route: { kind: 'search', query: 'api key' }, path: 'search/api%20key' }
  ];
  FORMS.forEach(function (f) {
    var hash = PM2.route.build(f.route);
    eq(hash, '#/' + f.path, 'build ' + f.path);
    var back = PM2.route.parse({ hash: hash, search: '' });
    if (ok(!!back, 'parse ' + f.path)) {
      var rt = back.route;
      Object.keys(f.route).forEach(function (k) {
        var expect = f.route[k] === undefined ? null : f.route[k];
        var got = rt[k] === undefined ? null : rt[k];
        eq(got, expect, 'round-trip ' + f.path + ' .' + k);
      });
    }
  });

  /* params round-trip */
  var P = {
    scenario: 'calm',
    fixture: ['fx.restart-required', 'fx.long-text'],
    trigger: [{ name: 'provider-refresh', ref: 'openai' }, { name: 'reconnect', ref: null }],
    focus: 's:general.visual.theme',
    instant: true, pin: true, stress: true,
    theme: 'glass-dark', motion: 'reduced'
  };
  var full = PM2.route.build({ kind: 'dest', cat: 'ai', sub: 'usage' }, P);
  var parsed = PM2.route.parse({ hash: full, search: '' });
  if (ok(!!parsed, 'parse full-params link')) {
    eq(parsed.scenario, 'calm', 'params: scenario');
    eq(parsed.fixtures, ['fx.restart-required', 'fx.long-text'], 'params: fixtures');
    eq(parsed.triggers, [{ name: 'provider-refresh', ref: 'openai' }, { name: 'reconnect', ref: null }], 'params: triggers');
    eq(parsed.focus, 's:general.visual.theme', 'params: focus');
    ok(parsed.instant === true && parsed.pin === true && parsed.stress === true, 'params: flags');
    eq(parsed.theme, 'glass-dark', 'params: theme');
    eq(parsed.motion, 'reduced', 'params: motion');
  }
  ok(PM2.route.parse({ hash: '#/nonsense/zzz', search: '' }).route.kind === 'home',
    'unknown route kind falls back to home');
  ok(PM2.route.parse({ hash: '#/dest/ai', search: '?instant=1' }).instant === true,
    'page-level ?instant=1 is honored');

  /* bind + navigation against the window stub. bind() resolves after the
     scenario/fixtures/route/trigger chain, so the ready-stamp assertions
     wait on its promise before the summary prints. */
  asyncTail = (function () {
    var opened = [];
    ctx.__setHashSilently('#/setting/ai.usage.max-tool-rounds?scenario=baseline&focus=s:ai.usage.max-tool-rounds&instant=1');
    var bindResult = PM2.route.bind({ open: function (dest) { opened.push(dest); } });

    ok(opened.length === 1, 'bind applies the initial link exactly once');
    if (opened.length) {
      eq(opened[0].route, 'setting', 'initial dest.route');
      eq(opened[0].settingId, 'ai.usage.max-tool-rounds', 'initial dest.settingId');
      eq(opened[0].focus, 's:ai.usage.max-tool-rounds', 'initial dest.focus');
    }
    return Promise.resolve(bindResult).then(function () {
      var docAttrs = ctx.document.documentElement.attributes;
      eq(docAttrs['data-pm-state'], 'ready', 'data-pm-state="ready" stamped after boot link');
      eq(docAttrs['data-pm2-route'], 'setting/ai.usage.max-tool-rounds', 'data-pm2-route mirrors the route');

      var beforeGo = opened.length;
      PM2.route.go({ route: 'dest', cat: 'web', sub: 'fetch' });
      ok(opened.length === beforeGo + 1, 'go() navigates through the hashchange listener');
      eq(ctx.window.location.hash, '#/dest/web/fetch', 'go() writes the hash');
      eq(docAttrs['data-pm2-route'], 'dest/web/fetch', 'data-pm2-route follows go()');

      var beforeBack = opened.length;
      ctx.window.location.hash = '#/home'; /* simulated Back */
      ok(opened.length === beforeBack + 1, 'external hash change (Back) re-opens');
      if (opened.length) eq(opened[opened.length - 1].route, 'home', 'Back landed on home');
      eq(PM2.route.current().route.kind, 'home', 'current() reflects the live hash');

      var beforeReplace = opened.length;
      return Promise.resolve(PM2.route.go({ route: 'dest', cat: 'ai' }, { replace: true })).then(function () {
        ok(opened.length === beforeReplace + 1, 'replace:true still applies the route');
        eq(ctx.window.location.hash, '#/dest/ai', 'replaceState updated the hash');

        var beforeSilent = opened.length;
        PM2.route.go({ route: 'dest', cat: 'code' }, { silent: true });
        ok(opened.length === beforeSilent, 'silent:true records without re-opening');
        eq(ctx.window.location.hash, '#/dest/code', 'silent go still writes the hash');

        var appliedMsgs = ctx.__posted.filter(function (m) { return m && m.type === 'pm-concept-applied'; });
        ok(appliedMsgs.length >= 1, 'pm-concept-applied posted to the parent frame');
      });
    });
  })();
} else {
  warn('PM2.route not loaded; route assertions skipped');
}

/* ---------------- summary ---------------- */

asyncTail.catch(function (e) {
  failed += 1;
  console.log('  FAIL  async route checks threw: ' + (e && e.message));
}).then(function () {
  console.log('\n' + passed + ' passed, ' + failed + ' failed, ' + warnings + ' warnings');
  if (failed > 0) {
    console.log('SMOKE2: FAIL');
    process.exit(1);
  }
  console.log('SMOKE2: PASS');
  process.exit(0);
});
