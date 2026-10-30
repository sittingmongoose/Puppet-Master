/* Isolated QA2 source helpers with fixture DOM/storage. Not a browser or native proof. */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const fixture = JSON.parse(read('Plans/pm7_qa2_alignment.fixtures.json'));
const failures = [], counts = {};
function requireThat(ok, message) { if (!ok) failures.push(message); }
function section(source, from, to) {
  const a = source.indexOf(from), b = source.indexOf(to, a + from.length);
  if (a < 0 || b < 0) throw new Error('Missing source boundary: ' + from);
  return source.slice(a, b);
}
function context(extra = {}) { return vm.createContext({ console, ...extra }); }

// CC5 uses its real provider and run/thread clock, not a parallel TTL implementation.
const activity = read('Concepts/chat-assistant-concepts/5.6 Pro/activity-panel.js');
const dockSource = section(activity, 'var DOCK_MS =', 'var dockOn =');
let dockSteps = 0;
for (const scenario of fixture.dock_scenarios) {
  let now = 0, items = [], pending = null;
  const W = { items: () => items, sort: a => a, needsYou: x => !!x.needs,
    isLive: x => ['working', 'checking', 'retrying'].includes(x.state), word: x => x.state, time: () => '1s' };
  const c = context({ window: { PM_WORK: W, PM56_SHELL: { pmxDockLine: () => '' } },
    Date: { now: () => now }, esc: (_c, s) => s, wt: s => s,
    setTimeout: (_fn, ms) => (pending = ms), clearTimeout: () => { pending = null; } });
  vm.runInContext(dockSource, c, { timeout: 1000 });
  for (const step of scenario.steps) {
    now = step.now; items = step.items;
    const actual = c.workDock({ state: { selectedThread: step.thread }, icon: () => '', renderApp() {} })
      .map(x => ({ key: x.key, tone: x.tone }));
    requireThat(JSON.stringify(actual) === JSON.stringify(step.expected), 'dock ' + scenario.name + ' at ' + now);
    if (!actual.some(x => x.tone !== 'needs')) requireThat(pending === null, 'expired dock retained a timer');
    dockSteps++;
  }
}
counts.dock_provider_steps = dockSteps;

// Scope is the actual Resources predicate: another Project's rows stay excluded.
const work = read('Concepts/onboarding/opus-5.5/src/js/48-work.js');
const resources = section(work, 'function resItems()', 'function resBody()');
for (const test of fixture.resource_cases) {
  const c = context({ project: () => test.project, items: () => test.items });
  vm.runInContext(resources, c, { timeout: 1000 });
  const actual = c.resItems();
  requireThat(JSON.stringify(actual.map(x => x.id)) === JSON.stringify(test.expected), 'Resources ' + test.name);
  requireThat(actual.every(x => x.project == null) === test.idle, 'Resources idle line ' + test.name);
}
counts.resource_cases = fixture.resource_cases.length;

const system = read('Concepts/chat-assistant-concepts/5.6 Pro/pmx-system.js');
const affectsSource = section(system, 'var LIGHT_CONTROL =', '/* closing (COLLAB FR 8)');
const kinds = new Set(['button', 'input', 'select', 'textarea', 'label', 'a[href]', 'role:switch', 'role:radio',
  'role:checkbox', 'role:tab', 'role:slider', 'role:spinbutton', 'role:combobox', 'contenteditable']);
for (const test of fixture.feedback_cases) {
  const control = {}, affects = { closest: () => test.inside_sheet ? {} : null,
    contains: () => test.inside_affects, getAttribute: () => 'team' };
  const el = { closest: selector => selector === '[data-pmx-affects]' ? affects : kinds.has(test.kind) ? control : null };
  const c = context({ partsOf: value => value });
  vm.runInContext(affectsSource, c, { timeout: 1000 });
  requireThat(c.affectsOf(el) === test.expected, 'control feedback ' + test.name);
}
counts.control_feedback_cases = fixture.feedback_cases.length;
const schedule = read('Concepts/chat-assistant-concepts/5.6 Pro/scheduling.js');
const links = section(schedule, 'function linkStyle(ids, plate)', '\n  /*');
for (const test of fixture.schedule_pair_cases) {
  const c = context(); vm.runInContext(links, c, { timeout: 1000 });
  const result = c.linkStyle(test.ids, test.drawn.map(x => '<g data-sched-mark="' + x + '"></g>').join(''));
  const actual = test.ids.filter(id => result.includes('[data-sched-row="' + id + '"]'));
  requireThat(JSON.stringify(actual) === JSON.stringify(test.expected), 'schedule pair ' + test.name);
}
counts.schedule_pair_cases = fixture.schedule_pair_cases.length;

// Replace-open shares the first inert basis, preserving nodes that were already inert.
const ui = read('Concepts/onboarding/opus-5.5/src/js/60-ui-core.js');
const inertSource = section(ui, 'function setInert(on)', '/* Run Onboarding Again');
function node(id, inert = false) {
  const attrs = new Set(inert ? ['inert'] : []);
  return { id, tagName: 'DIV', setAttribute: key => attrs.add(key), removeAttribute: key => attrs.delete(key),
    hasAttribute: key => attrs.has(key) };
}
const a = node('app'), preheld = node('preexisting', true), b = node('new-node'), modal = node('modal');
const doc = { body: { children: [a, preheld, modal, node('o55-demo')] } };
const ic = context({ document: doc, S: { root: modal }, held: [], inerted: [] });
vm.runInContext(inertSource, ic, { timeout: 1000 });
ic.setInert(true); doc.body.children.push(b); ic.setInert(true); ic.setInert(false);
requireThat(!a.hasAttribute('inert') && !b.hasAttribute('inert') && preheld.hasAttribute('inert'), 'modal replace lost original inert basis');
requireThat(doc.body.children.every(n => !n.hasAttribute('data-o55-held')), 'modal holds leaked after close');
counts.modal_lifetime_cases = 2;

// Solve the existing centre-width ladder. H6 adds clean strip suppression, not a new saved layout.
const narrow = read('Concepts/home-redesign/src/panels/js/44-narrow.js');
const nc = context({ PMW: {}, window: { innerWidth: 900 }, clamp: (v, lo, hi) => Math.min(hi, Math.max(lo, v)) });
vm.runInContext(section(narrow, 'var LADDER =', '/* does el take room'), nc, { timeout: 1000 });
for (const test of fixture.narrow_cases) {
  const chat = Math.round(Math.max(400, Math.min(640, test.width * .26667 + 88)));
  const actual = nc.narrow.solve(test.width - 57, 300, chat, true, test.keep_open, {}, 0, false, false, 0);
  requireThat(actual.chatStrip === test.strip, 'narrow default ' + test.width + ' keep=' + test.keep_open);
  if (actual.chatStrip) requireThat(actual.chat === 32, 'strip width changed');
}
counts.narrow_cases = fixture.narrow_cases.length;
const shellCss = read('Concepts/home-redesign/src/panels/css/20-shell.css');
requireThat(/\[data-pmw-chat="strip"\][^{]*> \*\s*\{[^}]*content-visibility:\s*hidden/.test(shellCss), 'folded descendants paint');
requireThat(/\[data-pmw-chat-peek\][^{]*> \*\s*\{[^}]*content-visibility:\s*visible/.test(shellCss), 'peek does not restore subtree');

function storageWindow(mode) {
  const values = new Map(); let wrote = false;
  const ls = { getItem: key => mode === 'readback_mismatch' && wrote ? 'different' : values.has(key) ? values.get(key) : null,
    setItem(key, value) { if (mode === 'write_throws') throw new Error('quota'); wrote = true; values.set(key, String(value)); },
    removeItem: key => values.delete(key), key: i => [...values.keys()][i] ?? null,
    get length() { return values.size; } };
  const w = {}; Object.defineProperty(w, 'localStorage', { get() { if (mode === 'unavailable') throw new Error('SecurityError'); return ls; } });
  return w;
}
const home = read('Concepts/home-redesign/src/panels/js/00-core.js');
const homeStore = section(home, 'var LS =', '/* a project');
const onbStore = read('Concepts/onboarding/opus-5.5/src/js/20-store.js');
let storeCases = 0;
for (const mode of fixture.memory_store_modes) {
  const w = storageWindow(mode), c = context({ window: w, PMW: {} });
  vm.runInContext(homeStore, c, { timeout: 1000 });
  const store = c.PMW.store, result = store.set('project:A', { value: 1 });
  requireThat(store.persistent === (mode !== 'unavailable'), 'Home persistent ' + mode);
  requireThat(result === ['unavailable', 'available'].includes(mode), 'Home failed write fell back ' + mode);
  if (result) {
    requireThat(store.get('project:A').value === 1 && store.get('project:B') === null, 'Home key isolation ' + mode);
    c.PMW.faults.failNextWrite = true;
    requireThat(store.set('project:A', { value: 2 }) === false && store.get('project:A').value === 1, 'Home injected failure ' + mode);
    store.remove('project:A'); requireThat(store.raw('project:A') === null, 'Home remove ' + mode);
  }
  storeCases++;
  if (mode === 'readback_mismatch') continue; // O55's pre-existing adapter has no readback promise.
  const ow = storageWindow(mode); ow.O55 = {}; const oc = context({ window: ow });
  vm.runInContext(onbStore, oc, { timeout: 1000 });
  const os = ow.O55.store, saved = os.set('onboarding', { keep: 1, password: 'do-not-store', nested: { privateKey: 'never' } });
  requireThat(os.persistent === (mode !== 'unavailable'), 'Onboarding persistent ' + mode);
  requireThat(saved === (mode !== 'write_throws'), 'Onboarding failed write ' + mode);
  if (saved) { const value = os.get('onboarding', null); requireThat(value.keep === 1 && !('password' in value) && !('privateKey' in value.nested), 'Onboarding scrub'); os.clear('onboarding'); requireThat(os.get('onboarding', null) === null, 'Onboarding clear'); }
  storeCases++;
}
counts.owner_store_cases = storeCases;

// Settings shares its real store with restore/wallpaper. Available-but-failing
// storage must refuse; only an unavailable storage object gets visit memory.
const settings = read('Concepts/onboarding/opus-5.5/base/script/pm4-settings-js.js');
const settingsStore = section(settings, 'var projectStore=', 'var bridgeDepth=');
const settingsSnapshot = section(settings, 'function projectSnapshot(projectId)', 'function commandId(');
const settingsRestore = read('Concepts/onboarding/opus-5.5/tools/settings_restore.js');
const projectPrefix = 'pm7:settings:tome-tabs:v1:';
function settingsContext(mode) {
  const w = storageWindow(mode);
  const c = context({ window: w, PREFIX: projectPrefix, CONCEPT_FIXTURE_MODE: true,
    projectRecord: () => ({ id: 'A' }), key: () => projectPrefix + 'A',
    clone: v => JSON.parse(JSON.stringify(v)), scrubCredentialSettings: v => JSON.parse(JSON.stringify(v)),
    crypto: { randomUUID: () => 'qa2-fixture-receipt' } });
  vm.runInContext(settingsStore + settingsSnapshot + settingsRestore, c, { timeout: 1000 });
  return c;
}
let settingsCases = 0;
for (const mode of fixture.memory_store_modes) {
  const c = settingsContext(mode), store = c.window.PM7_SETTINGS_STORE;
  requireThat(store === c.projectStore && store.persistent === (mode !== 'unavailable'), 'Settings store identity ' + mode);
  let refused = false;
  try { store.setItem('A', 'first'); } catch (_) { refused = true; }
  requireThat(refused === (mode === 'write_throws'), 'Settings write did not propagate failure ' + mode);
  if (mode === 'available' || mode === 'unavailable') {
    store.setItem('B', 'second');
    requireThat(store.getItem('A') === 'first' && store.getItem('B') === 'second'
      && store.length === 2 && store.key(0) === 'A' && store.key(1) === 'B', 'Settings key isolation/enumeration ' + mode);
    store.removeItem('A');
    requireThat(store.getItem('A') === null && store.length === 1, 'Settings remove ' + mode);
  }
  settingsCases++;
  const restore = settingsContext(mode);
  const restored = restore.restoreProjectDefaults({ project_id: 'A' });
  requireThat(restored.ok === ['available', 'unavailable'].includes(mode), 'Settings Restore Defaults readback ' + mode);
  if (restored.ok) {
    const value = restore.projectSnapshot('A');
    requireThat(Object.keys(value.settings).length === 0 && value.settingsTransferHistory[0].fixture_mode === true
      && value.settingsTransferHistory[0].rollback_ref === restored.rollback_ref
      && restore.projectSnapshot('B') === null, 'Settings restore fixture receipt or Project isolation ' + mode);
  }
  settingsCases++;
  const wallpaper = settingsContext(mode);
  const changed = wallpaper.writeProjectWallpaper({ project_id: 'A', value: 'look' });
  requireThat(changed.ok === ['available', 'unavailable'].includes(mode), 'Settings wallpaper readback ' + mode);
  if (changed.ok) requireThat(wallpaper.projectSnapshot('A').settings['general.visual.wallpaper'] === 'look'
    && wallpaper.projectSnapshot('B') === null, 'Settings wallpaper crossed Project ' + mode);
  settingsCases++;
}
const settingsGuard = settingsContext('unavailable');
settingsGuard.window.PM_SETTINGS_REGISTRY = {};
requireThat(!settingsGuard.restoreProjectDefaults({ project_id: 'A' }).ok, 'Concept restore bypassed attached owner');
requireThat(!settingsGuard.writeProjectWallpaper({ project_id: 'A', value: 'look' }).ok, 'Concept wallpaper bypassed attached owner');
delete settingsGuard.window.PM_SETTINGS_REGISTRY;
requireThat(!settingsGuard.writeProjectWallpaper({ project_id: 'B', value: 'look' }).ok, 'Wallpaper accepted a stale Project');
requireThat(!settingsGuard.writeProjectWallpaper({ project_id: 'A', value: 'not-in-the-catalog' }).ok, 'Wallpaper accepted an unknown choice');
counts.settings_store_cases = settingsCases;
counts.settings_owner_refusal_cases = 4;
requireThat(read('Concepts/onboarding/opus-5.5/src/settings/kit.d/28-toolchain-flags.js').includes('window.PM7_SETTINGS_STORE || localStorage')
  && settings.includes('const store=window.PM7_SETTINGS_STORE||localStorage;for(let index=0;index<store.length;index++)'),
  'Settings kit/copy-source enumeration bypasses the shared store');

const sound = read('Concepts/onboarding/opus-5.5/src/js/15-sound.js');
const soundBinding = section(sound, "const SETTING_ID =", '/* ---- synth primitives');
for (const test of fixture.sound_cases) {
  const c = context({ S: { muted: !test.preview_enabled },
    window: { PM7_SETTINGS_TOME: { project: () => ({ id: 'A' }),
      projectSnapshot: () => test.snapshot == null ? null : { settings: test.snapshot } }, dispatchEvent() {} },
    document: { querySelectorAll: () => [], documentElement: { toggleAttribute() {} } },
    CustomEvent: function () {}, queueMicrotask() {}, performance: { now: () => 1 } });
  vm.runInContext(soundBinding, c, { timeout: 1000 });
  // The factory assignment runs once at bootstrap; a visit choice happens after it.
  c.S.muted = !test.preview_enabled;
  c.S.refresh('load');
  requireThat(!c.S.muted === test.expected, 'sound binding ' + test.name);
}
counts.sound_binding_cases = fixture.sound_cases.length;

// Readable policy source and finite geometry declarations; visuals remain the GUI lanes' proof.
requireThat(ui.includes('opts.seed !== false') && ui.includes('SCREENS.defs[S.sess.screen].seed'), 'direct screen bypasses owner seed');
const cards = read('Concepts/onboarding/opus-5.5/src/js/61-components.js');
requireThat(cards.includes('opt1.under') && cards.includes('o55-card-parent') && cards.includes('class="o55-under"'), 'joined choices forked from C.cards');
const glyph = read('Concepts/chat-assistant-concepts/5.6 Pro/module-shell.js');
const you = section(glyph, 'function ppYou(M)', '/* NieR');
requireThat(you.includes("pp('body'") && you.includes('ppHead(Y.head') && !/cross|strings|control|arm/.test(you), 'You is not person-only');
requireThat(glyph.includes('var PX_YOU =') && glyph.includes('function pnYou(M)'), 'You lost family/small maps');
for (const source of [read('Concepts/chat-assistant-concepts/5.6 Pro/app.js'), read('Concepts/chat-assistant-concepts/5.6 Pro/delivery-polish.js')]) {
  requireThat(!source.includes('class="menu-head-wand"'), 'wand wrapper discards glyph ink roles');
}
const slots = 'Concepts/liquid-glass/opus-5.5/src/slots/onboarding/opus-5.5/src/css/22-hover/';
requireThat(/--pmf-sheen:\s*rgb\(255 255 255 \/ \.045\)/.test(read(slots + 'G0596.css')), 'Glass Dark sheen differs');
requireThat(/--pmf-sheen:[^;]*4\.5%/.test(read(slots + 'G0597.css')), 'Glass Light sheen differs');
const glass = read('Concepts/liquid-glass/opus-5.5/src/glass.js');
requireThat(!/function onPtr\(/.test(glass), 'independent Glass sheet pointer light remains');
counts.source_boundary_checks = 12;

process.stdout.write(JSON.stringify({ status: failures.length ? 'fail' : 'pass',
  claim_boundary: 'isolated_source_helpers_with_fixture_DOM_storage_not_browser_or_native_proof', counts, failures }, null, 2));
process.exitCode = failures.length ? 1 : 0;
