// The terminal's Settings bridge (onboarding/opus-5.5/src/settings/kit.d/24-terminal-look.js, round 5): the retired
// words and rows Jared decided on 2026-10-16 (P10, P14) are read once wherever Settings takes its values. The module
// runs in a sandbox with stand-ins for the Settings functions it wraps: settingValue (every row reads its value
// there), normalizedSettingValue (every commit), ensureStateShape (every load, reset, import and project switch).
// Run: node harness/checks/bridge.test.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs'; import path from 'node:path'; import url from 'node:url'; import vm from 'node:vm';

const here = path.dirname(url.fileURLToPath(import.meta.url));
const SRC = fs.readFileSync(path.join(here, '..', '..', '..', '..', '..', 'onboarding', 'opus-5.5', 'src', 'settings', 'kit.d', '24-terminal-look.js'), 'utf8');
const T = 'code.terminal.';
const DEFAULTS = { [T + 'bell']: 'Follow look', [T + 'flicker']: false, [T + 'theme']: 'Follow look', [T + 'font-family']: 'Follow look' };

/* a Settings page: its state, the functions the module wraps, and the ones it calls */
function page(settings, changed) {
  const ctx = {
    state: { settings: Object.assign({}, settings), changed: Object.assign({}, changed) },
    saves: 0, O55R: {}, PLACEMENT: { sections: {} }, root: { querySelector: () => null }, cssEscape: s => s,
    PM51: { moreChoices() {}, on() {} }, showToast() {}, refreshSettingRow() {}, o55Notify() {},
    findSettingGlobal: id => (Object.prototype.hasOwnProperty.call(DEFAULTS, id) ? { setting: { id, value: DEFAULTS[id] } } : null),
    console
  };
  ctx.window = { PM7_SETTINGS_TOME: { project: () => ({ id: 'p' }) } };
  vm.createContext(ctx);
  vm.runInContext(`
    function saveState() { saves++; }
    function ensureStateShape() { state.settings = state.settings || {}; state.changed = state.changed || {}; }
    function settingValue(setting) { return Object.prototype.hasOwnProperty.call(state.settings, setting.id) ? state.settings[setting.id] : setting.value; }
    function normalizedSettingValue(id, value) { return value; }
    function commitSettingValues(w) { for (const id of Object.keys(w)) { state.settings[id] = normalizedSettingValue(id, w[id]); state.changed[id] = true; } return true; }
    function restoreSettingDefault(id) { state.settings[id] = (findSettingGlobal(id) || { setting: {} }).setting.value; delete state.changed[id]; return true; }
  `, ctx);
  vm.runInContext(SRC, ctx);
  return ctx;
}
const row = id => ({ id, value: DEFAULTS[id] });

let passed = 0;
function test(name, fn) { try { fn(); passed++; } catch (e) { console.error('FAIL ' + name); throw e; } }

test('Bell offers Follow look and Off', () => {
  const c = page({}, {});
  assert.deepEqual([...c.O55R[T + 'bell'].choices], ['Follow look', 'Off']);
});

test('a stored Visual is stored again as Follow look when Settings loads, and stays a choice the person made', () => {
  const c = page({ [T + 'bell']: 'Visual' }, { [T + 'bell']: true });
  assert.equal(c.state.settings[T + 'bell'], 'Follow look');
  assert.equal(c.state.changed[T + 'bell'], true);
  assert.equal(c.saves, 1);
  assert.equal(c.window.PM_TERMINAL_SETTINGS.values()[T + 'bell'], 'Follow look');
});

test('a Visual that arrives later (an import, a project switch, a reset) is migrated by the next load', () => {
  const c = page({}, {});
  c.state = { settings: { [T + 'bell']: 'visual' }, changed: { [T + 'bell']: true } };
  vm.runInContext('ensureStateShape()', c);
  assert.equal(c.state.settings[T + 'bell'], 'Follow look');
});

test('every row read shows Visual as Follow look, so the row offers only Follow look and Off', () => {
  const c = page({}, {});
  c.state.settings[T + 'bell'] = 'Visual';                    /* not loaded again yet */
  assert.equal(vm.runInContext('settingValue', c)(row(T + 'bell')), 'Follow look');
  assert.ok(c.O55R[T + 'bell'].choices.includes(vm.runInContext('settingValue', c)(row(T + 'bell'))));
  c.state.settings[T + 'bell'] = 'Off';
  assert.equal(vm.runInContext('settingValue', c)(row(T + 'bell')), 'Off');
});

test('a write of Visual saves Follow look, through Settings and through the terminal', () => {
  const c = page({}, {});
  vm.runInContext(`commitSettingValues({ '${T}bell': 'Visual' })`, c);
  assert.equal(c.state.settings[T + 'bell'], 'Follow look');
  assert.equal(c.window.PM_TERMINAL_SETTINGS.set({ [T + 'bell']: 'Visual' }), true);
  assert.equal(c.state.settings[T + 'bell'], 'Follow look');
});

test('P10 in Settings: an amount means Flicker on only where no Flicker is stored, and is forgotten either way', () => {
  let c = page({ [T + 'flicker-amount']: 0.02 }, { [T + 'flicker-amount']: true });
  assert.equal(c.state.settings[T + 'flicker'], true);       /* amount alone: on, as a Flicker of its own */
  assert.equal(c.state.changed[T + 'flicker'], true);
  assert.equal(T + 'flicker-amount' in c.window.PM_TERMINAL_SETTINGS.values(), false);

  c = page({ [T + 'flicker-amount']: 0.02, [T + 'flicker']: false }, { [T + 'flicker-amount']: true, [T + 'flicker']: true });
  assert.equal(c.state.settings[T + 'flicker'], false);      /* an Off stays Off */
  assert.equal(T + 'flicker-amount' in c.window.PM_TERMINAL_SETTINGS.values(), false);
  c.window.PM_TERMINAL_SETTINGS.set({ [T + 'flicker']: null }); /* reset: nothing left to bring Flicker on */
  assert.deepEqual(JSON.parse(JSON.stringify(c.window.PM_TERMINAL_SETTINGS.values())), {});

  c = page({ [T + 'flicker-amount']: 0.02, [T + 'flicker']: true }, { [T + 'flicker-amount']: true, [T + 'flicker']: true });
  assert.equal(c.state.settings[T + 'flicker'], true);

  c = page({ [T + 'flicker-amount']: 0 }, { [T + 'flicker-amount']: true });
  assert.equal(c.state.changed[T + 'flicker'], undefined);   /* no amount: forgotten, Flicker untouched */
  assert.equal(T + 'flicker-amount' in c.window.PM_TERMINAL_SETTINGS.values(), false);
});

test('a retired row still stored is forgotten on a null write', () => {
  const c = page({}, {});
  c.state.settings[T + 'flicker-amount'] = 0.02; c.state.changed[T + 'flicker-amount'] = true;   /* arrived after load */
  assert.equal(c.window.PM_TERMINAL_SETTINGS.values()[T + 'flicker-amount'], 0.02);
  assert.equal(c.window.PM_TERMINAL_SETTINGS.set({ [T + 'flicker-amount']: null }), true);
  assert.equal(T + 'flicker-amount' in c.window.PM_TERMINAL_SETTINGS.values(), false);
});

console.log(`bridge.test: ${passed} passed`);
