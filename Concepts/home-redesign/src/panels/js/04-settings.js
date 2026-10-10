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
  'empty.closePanel': { type: 'boolean', label: 'Close a panel when its last tab closes' }
}, {
  'layout.named': 'home',
  'tabs.preview': true,
  'tabs.sizing': 'shrink',
  'tabs.closeOnLeft': false,
  'plus.default': 'menu',
  'files.revealIfOpen': true,
  'empty.closePanel': true
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
registerSettings('chat', {
  'width': { type: 'number', min: 400, max: 760, label: 'Chat width' },
  'history': { type: 'enum', values: ['flyout', 'pinned'], label: 'Thread history' },
  'pinOpen': { type: 'boolean', label: 'Keep the chat open in narrow windows' }
}, { 'width': null, 'history': 'flyout', 'pinOpen': false });

var settings = PMW.settings = PM_HOME.settings = {
  get: function (key) {
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
  register: function (namespace, schema, defaults) { registerSettings(namespace, schema, defaults); }
};
