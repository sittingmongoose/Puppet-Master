/* Final PM7 product rules: isolated source functions, no browser/native/rendering proof. */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const fixture = JSON.parse(read('Plans/pm7_qa2_alignment.fixtures.json'));
const failures = [], counts = {};
const requireThat = (ok, message) => { if (!ok) failures.push(message); };
function section(source, from, to) {
  const a = source.indexOf(from), b = source.indexOf(to, a + from.length);
  if (a < 0 || b < 0) throw new Error('Missing source boundary: ' + from);
  return source.slice(a, b);
}
function control(value, protectedValue, typed, focused) {
  const attrs = new Map();
  if (protectedValue) attrs.set('data-o55-protected', 'true');
  if (typed != null) attrs.set('data-o55-typed', String(typed));
  return { tagName: 'INPUT', type: protectedValue ? 'password' : 'text', value, focused,
    get attributes() { return [...attrs].map(([name, val]) => ({ name, value: val })); },
    hasAttribute: name => attrs.has(name), getAttribute: name => attrs.get(name) ?? null,
    setAttribute: (name, val) => attrs.set(name, val), removeAttribute: name => attrs.delete(name) };
}
async function main() {
  const util = read('Concepts/onboarding/opus-5.5/src/js/05-util.js');
  const morph = section(util, 'function patchAttributes(a, b)', 'function patchNode(a, b)');
  for (const test of fixture.protected_redraw_cases) {
    const a = control(test.value, test.protected, test.typed, test.focused);
    const b = control(test.template, test.protected, test.typed, false);
    const ctx = vm.createContext({ document: { activeElement: test.focused ? a : null } });
    vm.runInContext(morph, ctx, { timeout: 1000 });
    ctx.patchAttributes(a, b);
    requireThat(a.value === test.expected, 'FO-6 protected redraw ' + test.name);
  }
  counts.protected_redraw_cases = fixture.protected_redraw_cases.length;

  const server = read('Concepts/onboarding/opus-5.5/src/js/68-screens-server.js');
  const poll = section(server, 'function endGuestRun(S, gen, how)', 'const inviteOpen =');
  for (const test of fixture.answered_pairing_cases) {
    const S = { sess: { server: { pairGen: test.current_generation, runErr: 'old_warning', candidates: [] } }, save() {} };
    let reads = 0;
    const ctx = vm.createContext({ S, inviteOpen: () => true,
      ensureRunReq: () => ({ id: 'request' }), OR: () => ({ take() { reads++; return null; } }),
      tryAdopt: () => ({ ok: false, reason: test.expected_error }),
      guestCandidateId: () => 'candidate', EPH: () => null, showing: () => false });
    vm.runInContext(poll, ctx, { timeout: 1000 });
    if (test.done) ctx.endGuestRun(S, test.done_generation, test.done);
    ctx.pollGuestRun(S);
    requireThat(reads === test.expected_owner_reads && S.sess.server.runErr === test.expected_error,
      'FO-7 answered/replay handling ' + test.name);
  }
  counts.answered_pairing_cases = fixture.answered_pairing_cases.length;

  const flow = read('Concepts/onboarding/opus-5.5/src/js/62-flow.js');
  const copy = section(flow, 'const COPIED =', '\n})();');
  let copyOK = true;
  const timers = [], buttons = [];
  const button = () => ({ textContent: 'Copy', getAttribute: () => 'copy-control' });
  const ctx = vm.createContext({ F: {}, U: { slug: s => s, esc: s => s, copyText: async () => copyOK },
    T: key => key === 'chrome.copied' ? 'Copied' : 'Copy',
    O55: { actions: {}, tips: { opt: (_key, html) => html }, sound: { play() {} },
      motion: { after: (ms, fn) => timers.push({ ms, fn }) } },
    document: { contains: el => buttons.includes(el), querySelectorAll: () => buttons } });
  vm.runInContext(copy, ctx, { timeout: 1000 });
  buttons.push(button());
  ctx.O55.actions.copyText({}, 'public_text', buttons[0]);
  await Promise.resolve(); await Promise.resolve();
  requireThat(buttons[0].textContent === 'Copied' && timers.length === 1 && timers[0].ms > 0,
    'FO-8 success starts a complete acknowledgment interval');
  requireThat(ctx.F.copyBtn('public_text', 'control').includes('>Copied<'),
    'FO-8 same-control redraw preserves acknowledgment');
  buttons[0] = button(); // Same control identity, replaced presentation node.
  ctx.O55.actions.copyText({}, 'public_text', buttons[0]);
  await Promise.resolve(); await Promise.resolve();
  requireThat(timers.length === 2 && timers[1].ms === timers[0].ms, 'FO-8 repeat starts a fresh full interval');
  timers[0].fn();
  requireThat(buttons[0].textContent === 'Copied' && ctx.F.copyBtn('public_text', 'control').includes('>Copied<'),
    'FO-8 old timeout cannot clear a newer acknowledgment');
  timers[1].fn();
  requireThat(buttons[0].textContent === 'Copy' && ctx.F.copyBtn('public_text', 'control').includes('>Copy<'),
    'FO-8 current deadline clears acknowledgment');
  copyOK = false;
  ctx.O55.actions.copyText({}, 'public_text', buttons[0]);
  await Promise.resolve(); await Promise.resolve();
  requireThat(buttons[0].textContent === 'Copy' && timers.length === 2,
    'FO-8 failed copy creates no success acknowledgment');
  counts.copy_feedback_checks = 6;

  const system = read('Concepts/chat-assistant-concepts/5.6 Pro/pmx-system.js');
  const shared = section(system, 'var PARTS =', '(function injectGenerated()');
  const sc = vm.createContext({}); vm.runInContext(shared, sc, { timeout: 1000 });
  const css = sc.generatedCss();
  const focusRules = css.split('\n').filter(line => line.includes('[data-pmx-focus'));
  requireThat(focusRules.length > 0 && focusRules.some(rule => rule.includes('filter:var(--pmx-lit-outline)')),
    'FS-1 shared generator supplies the affected-mark ring');
  requireThat(focusRules.every(rule => !/opacity\s*:|--pmx-seat(?:-fill)?\s*:|(?:^|[;{])(?:fill|color)\s*:/.test(rule)),
    'FS-1 hover generator must not dim or recolour cast bodies/labels');
  const baseCSS = read('Concepts/chat-assistant-concepts/5.6 Pro/pmx-system.css');
  const hoverCSS = section(baseCSS, '6.6 hover-to-light', '7.10 living beside ordinary replies');
  requireThat(!/opacity\s*:\s*\.35/.test(hoverCSS) && hoverCSS.includes('--pmx-lit-outline'),
    'FS-1 shared hover base cannot dim unlit cast parts');
  const schedule = read('Concepts/chat-assistant-concepts/5.6 Pro/scheduling.js');
  const link = section(schedule, 'function linkStyle(ids, plate)', '\n  /*');
  const lc = vm.createContext({}); vm.runInContext(link, lc, { timeout: 1000 });
  const linked = lc.linkStyle(['paired', 'absent'], '<g data-sched-mark="paired"></g>');
  requireThat(!/opacity\s*:/.test(linked) && linked.includes('--pmx-lit-outline') && !linked.includes('"absent"'),
    'FS-1 Scheduled accents only actual partners and never dims');
  counts.cast_emphasis_checks = 4;

  const copyData = JSON.parse(read('Concepts/onboarding/opus-5.5/src/copy.json')).ai;
  requireThat(copyData.bill.use === '{product}' && !/billed|credit you buy|extra usage/i.test(copyData.pairs['opencode-zen']),
    'FO-4 connected-row/product identity has no payment suffix');
  const nier = read('Concepts/onboarding/opus-5.5/src/css/11-window-nier.css');
  requireThat(/:is\(\.o55-card, \.o55-toggle\)\[data-o55fx-cursor\][^{]*\{[^}]*background-size:\s*calc\(100% - [^)]+\) 100% !important/.test(nier),
    'FO-5 selected/hovered NieR question retains its protected contrast region');
  counts.copy_help_source_checks = 2;

  // FO-9: execute the merged checklist projection and its actual stage block/count consumer.
  // The fixture's accepted-owner effects are inputs, never invented by the presentation.
  const reviewSource = read('Concepts/onboarding/opus-5.5/src/js/72-screens-review.js');
  const phases = section(reviewSource, 'function phasesFor(S)', 'const PH_MS =');
  const scenes = read('Concepts/onboarding/opus-5.5/src/js/55-scenes.js');
  const creating = section(scenes, '    creating: {', '    protect:');
  for (const test of fixture.Creating_phase_cases) {
    const S = { draft: { project_mode: test.project_mode || 'new', project_transport: 'nas',
      history_backend: 'git', online_mode: 'new',
      settings_transfer: { mode: test.settings_copy ? 'copy_from_project' : 'fresh' } },
      sess: { commit: { key: 'operation', state: test.owner_done ? 'done' : 'failed', transportDone: true,
        recovery: { settled_effects: test.settled_effects, remote_effect_state: test.remote_effect_state } } },
      env: { here: { git: test.history_installed !== false, jj: false } } };
    const transport = { phases: test.empty_transport ? [] : Object.keys(test.expected).map(key => ({ key, status: 'done' })) };
    const phaseContext = vm.createContext({ S, md: s => s.draft,
      F: { state: () => transport }, PR: () => ({ isGithubRemoteChain: () => true }),
      O55: {}, phaseNow: () => null, forgeName: () => 'GitHub' });
    vm.runInContext(phases, phaseContext, { timeout: 1000 });
    phaseContext.O55.review = { phasesFor: phaseContext.phasesFor, shownPhases: phaseContext.shownPhases,
      shownDone: s => s.sess.commit.state === 'done' };
    vm.runInContext('globalThis.creatingScene = ({' + creating + '}).creating;', phaseContext, { timeout: 1000 });
    const actual = phaseContext.shownPhases(S);
    requireThat(JSON.stringify(Object.fromEntries(actual.map(p => [p.key, p.status]))) === JSON.stringify(test.expected),
      'FO-9 accepted phase projection ' + test.name);
    const blocks = phaseContext.creatingScene.props(S);
    requireThat(JSON.stringify(blocks.map(b => b.id.replace(/^b-/, ''))) === JSON.stringify(test.done_keys),
      'FO-9 block set matches settled phases ' + test.name);
    const progress = phaseContext.creatingScene.vars(S);
    requireThat(progress.done === test.done_keys.length && progress.total === actual.length,
      'FO-9 progress agrees with checks and blocks ' + test.name);
    if (test.resume) {
      S.sess.commit.recovery.settled_effects = { source_preparation: true, remote_repository_create: true,
        history_init: true, registry_publication: true };
      S.sess.commit.state = 'done'; // Explicitly accepted complete owner result in this vector.
      const next = phaseContext.creatingScene.props(S);
      requireThat(next.length === actual.length && blocks.every(old => next.some(b => b.id === old.id)) &&
        phaseContext.creatingScene.vars(S).done === actual.length,
        'FO-9 later accepted resume preserves settled block identities');
    }
  }
  counts.Creating_phase_cases = fixture.Creating_phase_cases.length;
  counts.Creating_resume_checks = fixture.Creating_phase_cases.filter(test => test.resume).length;
  return { status: failures.length ? 'fail' : 'pass', counts, failures,
    claim_boundary: 'static_and_isolated_source_functions_only_no_browser_native_pixel_or_runtime_acceptance',
    pending_final_sources: [],
    resolved_final_source: { 'FX-1_PDF': 'd8df03ac1820a7cb68d0d1b4897eeb03fa228a6b',
      'FO-9': '503368802df57c9d35660d0a89dea15df01afc53' } };
}
main().then(result => {
  process.stdout.write(JSON.stringify(result, null, 2));
  process.exitCode = failures.length ? 1 : 0;
}).catch(error => { process.stderr.write(error.stack + '\n'); process.exitCode = 1; });
