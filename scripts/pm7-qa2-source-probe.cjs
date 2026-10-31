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

// N1: actual restore reach helpers bind the completed operation to its place.
const serverScreens = read('Concepts/onboarding/opus-5.5/src/js/68-screens-server.js');
const restoreHelpers = section(serverScreens, 'const racc =', "def('r-source',");
const safeScreens = read('Concepts/onboarding/opus-5.5/src/js/71-screens-safe.js');
const backupFamilySource = section(safeScreens, 'const SUBS =', 'const subOf =');
function restoreContext(test) {
  const S = { sess: { restore: { scope: 'project', ...test.restore } },
    env: { here: { recoveryKits: test.kit ? [test.kit] : [] }, devices: [] } };
  const resets = [], cancellations = [];
  const c = context({ S, R: s => s.sess.restore,
    O55: { owners: { cancelOp: key => cancellations.push(key) } }, T: key => key,
    F: { reset: (_s, key) => resets.push(key) } });
  vm.runInContext(backupFamilySource + '\nO55.backup = { family };', c, { timeout: 1000 });
  vm.runInContext(restoreHelpers, c, { timeout: 1000 });
  return { c, S, resets, cancellations };
}
for (const test of fixture.restore_reach_cases) {
  const { c, S, resets, cancellations } = restoreContext(test);
  requireThat(c.O55.restore.reachKey(S) === test.expected_key, 'restore reach key ' + test.name);
  requireThat(vm.runInContext('reached(S)', c) === test.reached, 'restore reused another place ' + test.name);
  Object.assign(S.sess.restore, { unlocked: true, pick: 'copy-A', access: { credential_ref: 'fixture' } });
  const generation = S.sess.restore.reachGen || 0;
  vm.runInContext('repoint(S)', c);
  const r = S.sess.restore;
  requireThat(r.reachedFor === null && r.unlocked === false && r.pick === null
    && Object.keys(r.access).length === 0 && resets.join() === 'restore-s3', 'restore repoint leaked state ' + test.name);
  requireThat(r.reachGen === generation + 1 && cancellations.join() === 'restore-s3',
    'restore repoint retained an old check operation ' + test.name);
}
counts.restore_reach_cases = fixture.restore_reach_cases.length;
counts.restore_repoint_cases = fixture.restore_reach_cases.length;
const signInCallback = section(safeScreens, 'O55.official.handlers.restoreCloud =', '\n\n  const SI');
for (const selected of ['gdrive', 'onedrive']) {
  const { c, S } = restoreContext({ restore: { source: 'cloud', cloud: selected } });
  c.O55.official = { handlers: {} }; S.sess.signin = { service: 'gdrive' };
  vm.runInContext(signInCallback, c, { timeout: 1000 });
  c.O55.official.handlers.restoreCloud(S);
  requireThat(S.sess.restore.reachedFor === 'cloud:gdrive'
    && vm.runInContext('reached(S)', c) === (selected === 'gdrive'), 'late sign-in followed selected service');
}
counts.restore_callback_cases = 2;
const nasScreens = read('Concepts/onboarding/opus-5.5/src/js/70-screens-nas.js');
const keyStatusSource = section(nasScreens, 'function keyStatus(S, k)', 'const keyWhere =');
const authorizedSource = section(nasScreens, 'const authorizedFor =', 'const authorize =');
for (const test of fixture.ssh_key_unlock_cases) {
  const c = context({ dev: () => ({ authorized: [], user: 'fixture-account' }),
    sshUser: () => 'fixture-account', N: s => s.nas });
  vm.runInContext(authorizedSource + keyStatusSource, c, { timeout: 1000 });
  requireThat(c.keyStatus({ nas: { unlocked: test.unlocked } }, { id: test.key_id, type: 'ed25519', passphrase: true })
    === test.expected, 'key inherited another passphrase unlock');
}
counts.ssh_key_unlock_cases = fixture.ssh_key_unlock_cases.length;
const draft = read('Concepts/onboarding/opus-5.5/src/js/35-draft.js');
const normalizeSource = section(draft, 'function normalize(d)', 'function allowedVisibility(d)');
for (const test of fixture.remote_route_cases) {
  const c = context(); vm.runInContext(normalizeSource, c, { timeout: 1000 });
  const value = { journey: 'new_or_local', project_mode: 'new', online_mode: 'none',
    settings_transfer: { mode: 'start_fresh' }, remote_mode: test.mode, remote_endpoint: 'pm://signed-endpoint' };
  requireThat(c.normalize(value).remote_endpoint === test.expected, 'Remote Link escaped route ' + test.mode);
}
counts.remote_route_cases = fixture.remote_route_cases.length;

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

const sound = read('Concepts/onboarding/opus-5.5/src/js/15-sound.js');
const soundBinding = section(sound, "const SETTING_ID =", '/* ---- synth primitives');
for (const test of fixture.sound_cases) {
  const c = context({ S: { muted: !test.initial_enabled },
    window: { PM7_SETTINGS_TOME: { project: () => ({ id: 'A' }),
      projectSnapshot: () => test.snapshot == null ? null : { settings: test.snapshot } }, dispatchEvent() {} },
    document: { querySelectorAll: () => [], documentElement: { toggleAttribute() {} } },
    CustomEvent: function () {}, queueMicrotask() {}, performance: { now: () => 1 } });
  vm.runInContext(soundBinding, c, { timeout: 1000 });
  // The factory assignment runs once at bootstrap; a visit choice happens after it.
  c.S.muted = !test.initial_enabled;
  c.S.refresh('load');
  requireThat(!c.S.muted === test.expected, 'sound binding ' + test.name);
}
counts.sound_binding_cases = fixture.sound_cases.length;

// Readable policy source and finite geometry declarations; visuals remain the GUI lanes' proof.
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
counts.source_boundary_checks = 10;

process.stdout.write(JSON.stringify({ status: failures.length ? 'fail' : 'pass',
  claim_boundary: 'isolated_source_helpers_with_fixture_DOM_storage_not_browser_or_native_proof', counts, failures }, null, 2));
process.exitCode = failures.length ? 1 : 0;
