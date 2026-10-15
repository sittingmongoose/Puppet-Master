/* The settings model (CONTRACT section 12). Every choice a user will later make in Settings reads from here, with a
   default, so the Settings port only binds controls to it. Stored in pm.home.settings:v1 (one record). */

var SETTINGS_KEY = 'pm.home.settings:v1';
var settingsSchema = {};
var settingsDefaults = {};
var settingsValues = store.get(SETTINGS_KEY) || {};
var settingsBus = emitter();

function registerSettings(namespace, schema, defaults) {
  for (var k in (defaults || {})) {
    var key = k.indexOf(namespace + '.') === 0 ? k : namespace + '.' + k;
    settingsDefaults[key] = defaults[k];
    settingsSchema[key] = (schema && (schema[k] || schema[key])) || { type: typeof defaults[k] };
  }
}

registerSettings('panels', {
  'layout.named': { type: 'enum', values: ['home', 'build', 'terminals', 'focus'], label: 'Layout' },
  'tabs.preview': { type: 'boolean', label: 'Preview tabs' },
  'tabs.sizing': { type: 'enum', values: ['shrink', 'fixed'], label: 'Tab sizing' },
  'tabs.closeOnLeft': { type: 'boolean', label: 'Close button on the left' },
  'plus.default': { type: 'enum', values: ['menu'], label: 'The "+" button' },
  'files.revealIfOpen': { type: 'boolean', label: 'Reveal a file that is already open' },
  'empty.closePanel': { type: 'boolean', label: 'Close a panel when its last tab closes' },
  'tabs.maxEditors': { type: 'number', min: 1, max: 100, label: 'Max open editor tabs' },
  'tabs.maxPersisted': { type: 'number', min: 1, max: 100, label: 'Tabs remembered between sessions' }
}, {
  'layout.named': 'home',
  'tabs.preview': true,
  'tabs.sizing': 'shrink',
  'tabs.closeOnLeft': false,
  'plus.default': 'menu',
  'files.revealIfOpen': true,
  'empty.closePanel': true,
  'tabs.maxEditors': 25,
  'tabs.maxPersisted': 50
});
registerSettings('editor', {
  'font.family': { type: 'string', label: 'Editor font' },
  'font.size': { type: 'number', min: 10, max: 22, label: 'Editor font size' },
  'lineHeight': { type: 'number', min: 1.2, max: 2, label: 'Line height' },
  'minimap': { type: 'boolean', label: 'Minimap scrollbar' },
  'stickyScroll': { type: 'boolean', label: 'Sticky scroll' },
  'diff.layout': { type: 'enum', values: ['auto', 'side', 'inline'], label: 'Diff layout' },
  'wordWrap': { type: 'boolean', label: 'Word wrap' }
}, {
  'font.family': 'JetBrains Mono',
  'font.size': 13,
  'lineHeight': 1.55,
  'minimap': true,
  'stickyScroll': true,
  'diff.layout': 'auto',
  'wordWrap': false
});
/* The chat column registers no settings (the Plans canon lead's rulings of 2026-10-10 and 2026-10-11: canon's v2
   chat_column keeps width_px, history_pinned and keep_open, SP-330 and DL-180, and none of them is a Settings value,
   SSYS-050). They live in the layout record's chat column (10-model.js, 46-chat.js), so no Settings row can show them.
   The stored 'chat.width', 'chat.history' and 'chat.pinOpen' from before are carried into the record once and dropped
   (persist.migrateChatColumn, 16-persist.js). */

/* The panels' own Settings rows (Plans/Settings_System.md SSYS-050): a row a person changed in the Project's Settings
   (window.PM_PANEL_SETTINGS, onboarding src/settings/kit.d/27-panel-rows.js) answers before this model's own value, and
   a save that changes one tells this model's listeners, so the panels and Settings never disagree. Each entry: the
   Settings row and its stored words to this model's value (undefined: not readable, the model's own value stands). */
function intIn(min, max) { return function (v) { var n = Math.round(+v); return isFinite(n) && n >= min ? Math.min(max, n) : undefined; }; }
var SETTINGS_ROWS = {
  'panels.tabs.preview': ['general.interaction.preview-tabs', function (v) { return v === true || v === 'On' ? true : v === false || v === 'Off' ? false : undefined; }],
  'panels.tabs.sizing': ['general.interaction.tab-sizing', function (v) { return /fixed/i.test(String(v)) ? 'fixed' : /shrink/i.test(String(v)) ? 'shrink' : undefined; }],
  'panels.tabs.maxEditors': ['general.interaction.max-editor-tabs', intIn(1, 100)],
  'panels.tabs.maxPersisted': ['general.startup.max-persisted-tabs', intIn(1, 100)],
  'panels.layout.named': ['general.startup.starting-layout', function (v) {
    var w = String(v || '').toLowerCase();
    return /^home/.test(w) ? 'home' : /^build/.test(w) ? 'build' : /^terminals/.test(w) ? 'terminals' : /^focus/.test(w) ? 'focus' : undefined;
  }]
};
var rowsSeen = null;
function rowValue(key) {
  var row = SETTINGS_ROWS[key], b = window.PM_PANEL_SETTINGS;
  if (!row || !b || typeof b.values !== 'function') return undefined;
  if (!rowsSeen) watchRows();
  var vals; try { vals = b.values() || {}; } catch (_) { return undefined; }
  if (!Object.prototype.hasOwnProperty.call(vals, row[0])) return undefined;
  return row[1](vals[row[0]]);
}
function watchRows() {
  var b = window.PM_PANEL_SETTINGS;
  if (!b || typeof b.onChange !== 'function' || rowsSeen) return;
  rowsSeen = {};
  Object.keys(SETTINGS_ROWS).forEach(function (k) { rowsSeen[k] = JSON.stringify(settings.get(k)); });
  b.onChange(function () {
    Object.keys(SETTINGS_ROWS).forEach(function (k) {
      var now = JSON.stringify(settings.get(k));
      if (now === rowsSeen[k]) return;
      var old = rowsSeen[k] === undefined ? undefined : JSON.parse(rowsSeen[k]);
      rowsSeen[k] = now;
      settingsBus.emit(k, { key: k, value: settings.get(k), old: old });
      settingsBus.emit('*', { key: k, value: settings.get(k), old: old });
    });
  });
}

var settings = PMW.settings = PM_HOME.settings = {
  get: function (key) {
    var r = rowValue(key); if (r !== undefined) return r;
    return Object.prototype.hasOwnProperty.call(settingsValues, key) ? settingsValues[key] : settingsDefaults[key];
  },
  set: function (key, value) {
    var old = settings.get(key);
    if (value === null || value === undefined) delete settingsValues[key];
    else settingsValues[key] = value;
    store.set(SETTINGS_KEY, settingsValues);
    if (JSON.stringify(old) !== JSON.stringify(settings.get(key))) {
      settingsBus.emit(key, { key: key, value: settings.get(key), old: old });
      settingsBus.emit('*', { key: key, value: settings.get(key), old: old });
    }
  },
  reset: function (key) { settings.set(key, null); },
  on: function (key, fn) { return settingsBus.on(key, fn); },
  defaults: function () { return Object.assign({}, settingsDefaults); },
  schema: function () { return JSON.parse(JSON.stringify(settingsSchema)); },
  register: function (namespace, schema, defaults) { registerSettings(namespace, schema, defaults); },
  /* the Settings rows bridge loads with Settings, before the panels: listen once it is there */
  watchRows: watchRows
};
watchRows();
