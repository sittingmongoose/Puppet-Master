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

  // FO-10: current validation still owns eligibility. Select its reason for the field/list on screen.
  const connectSource = read('Concepts/onboarding/opus-5.5/src/js/67-screens-connect.js');
  const draftSource = read('Concepts/onboarding/opus-5.5/src/js/35-draft.js');
  const missingHelpers = section(draftSource, 'function missing(d)', '  O55.draft =');
  const reasonHelper = section(connectSource, 'function routeReason(S)', '  /* A different Server');
  const routeDefinition = section(connectSource, "def('c-route', {", "def('c-review', {");
  const foot = section(routeDefinition, '    foot(S) {', '    do: {');
  const commonCopy = JSON.parse(read('Concepts/onboarding/opus-5.5/src/copy.json'));
  const pipCopy = JSON.parse(read('Concepts/onboarding/opus-5.5/src/copy.d/48-pip.json')).pip.oops;
  const lookup = (data, key) => key.split('.').reduce((value, part) => value && value[part], data);
  const translate = key => {
    const value = lookup(commonCopy, key);
    if (typeof value !== 'string') throw new Error('Missing common screen copy: ' + key);
    return value;
  };
  for (const test of fixture.Connect_route_reason_cases) {
    const S = { sess: { drafts: { connect: { journey: 'connect_existing', server_mode: 'existing_server',
      remote_mode: test.route, server_ref: test.selected ? 'verified_Server' : '',
      proxy_hostname: test.nonempty ? 'typed_input' : '', remote_endpoint: test.nonempty ? 'typed_input' : '' } },
      connect: { manual: !!test.manual, addr: test.address || '' } } };
    // The accepted validator result is supplied. This tests its presentation, not address/code syntax.
    const endpointResult = test.endpoint_error ? { ok: false, error: test.endpoint_error } : { ok: true };
    const routeContext = vm.createContext({ S, cd: s => s.sess.drafts.connect, T: translate,
      O55: { endpoint: { check: () => endpointResult, checkLink: () => endpointResult } } });
    vm.runInContext(missingHelpers, routeContext, { timeout: 1000 });
    routeContext.O55.draft = { missing: routeContext.missing };
    vm.runInContext(reasonHelper + '\nglobalThis.routeFoot = ({' + foot + '}).foot;', routeContext, { timeout: 1000 });
    const expected = test.expected_key ? translate(test.expected_key) : '';
    requireThat(routeContext.routeReason(S) === expected, 'FO-10 current-route reason ' + test.name);
    const result = routeContext.routeFoot(S).primary;
    requireThat(result.reason === expected && result.disabled === !!expected,
      'FO-10 Continue reason/availability agree ' + test.name);
    if (test.expected_key) requireThat(typeof lookup(pipCopy, test.expected_key) === 'string',
      'FO-10 matching Pip cause copy ' + test.name);
  }
  counts.Connect_route_reason_cases = fixture.Connect_route_reason_cases.length;

  // DL-271: server-password hints preserve the actual credential realm and selected execution-host custody.
  const aiSource = read('Concepts/onboarding/opus-5.5/src/js/73-screens-ai.js');
  const hostHelpers = section(aiSource, 'function host(S)', 'const pname =');
  const serverForm = section(aiSource, 'function serverHtml(S, p, r)', "def('ai', {");
  const text = (key, values = {}) => {
    const value = lookup(commonCopy, key);
    if (typeof value !== 'string') throw new Error('Missing screen string ' + key);
    return value.replace(/\{([^}]+)\}/g, (_m, name) => values[name] == null ? '' : String(values[name]));
  };
  for (const role of ['this_device', 'existing_server']) {
    const fields = [], executionHost = { id: 'execution-host', name: 'Execution host', role };
    const authContext = vm.createContext({ T: text, U: { slug: value => value, esc: value => value },
      md: s => s.draft, installed: () => true, hostName: () => executionHost.name,
      F: { isHttps: () => true }, btnIn: () => '', hint: () => '', pname: p => p.name,
      C: { field: f => { fields.push(f); return ''; }, cards: () => '' },
      O55: { handoff: { host: () => executionHost } } });
    vm.runInContext(hostHelpers + '\n' + serverForm, authContext, { timeout: 1000 });
    authContext.serverHtml({ draft: {} }, { id: 'server-entry', name: 'OpenCode server' },
      { mode: 'attached', endpoint: 'accepted_endpoint', secretTyped: true });
    const password = fields.find(f => f.bind.startsWith('ocPass:'));
    requireThat(password && password.type === 'password' && password.protected && password.value === '' &&
      password.hint.includes("server's own password") && password.hint.includes('not a key from an AI company'),
      'DL-271 OpenCode server-auth hint/protected entry ' + role);
    requireThat(role === 'this_device' ? password.hint.includes(commonCopy.ai.keychainHere) :
      password.hint.includes(executionHost.name), 'DL-271 selected execution-host custody ' + role);
  }
  counts.OpenCode_server_password_cases = 2;
  const accessLine = lookup(JSON.parse(read('Concepts/onboarding/opus-5.5/src/copy.d/48-pip.json')), 'pip.oops.protect.accessMissing');
  const unlockLine = lookup(JSON.parse(read('Concepts/onboarding/opus-5.5/src/copy.d/48-pip.json')), 'pip.say.r-unlock.enter');
  requireThat(typeof accessLine === 'string' && /access details/i.test(accessLine) &&
    !/\b(?:one|two|three|four|five|six|\d+)\b/i.test(accessLine), 'DL-271 Protect access guidance is count-neutral');
  requireThat(typeof unlockLine === 'string' && /your recovery phrase/i.test(unlockLine) &&
    !/\b(?:six|6)\b/.test(unlockLine), 'DL-271 recovery phrase prompt has no six-word format');
  counts.Backup_recovery_copy_checks = 2;

  const nasSource = read('Concepts/onboarding/opus-5.5/src/js/70-screens-nas.js');
  const keyHelpers = section(nasSource, '  const WEAK =', "def('nas-key', {");
  const keyDefinition = section(nasSource, "def('nas-key', {", "def('nas-signin', {");
  const keyBody = section(keyDefinition, '    body(S) {', '    mounted(S)');
  const keyActions = section(keyDefinition, '    do: {', '    bind: {');
  for (const test of fixture.weak_SSH_key_cases) {
    const key = { id: 'candidate', type: test.type, passphrase: !!test.passphrase,
      where: 'file', file: 'key-ref', comment: 'Existing key' };
    const draft = { key: null, unlocked: test.unlocked ? key.id : null };
    let choices = [];
    const kc = vm.createContext({ T: text, N: () => draft, dev: () => ({ name: 'Target' }),
      authorizedFor: () => test.authorized, keyring: () => [key], keysKey: () => 'keys', sshUser: () => 'actor',
      machine: () => 'Execution host', hostId: () => 'target', U: { esc: value => value },
      F: { state: () => ({ state: 'done' }) }, O55: { ui: { refresh() {} } },
      C: { small: () => '', link: () => '', field: () => '', note: () => '',
        cards: (_action, rows) => { choices = rows; return ''; } } });
    vm.runInContext(keyHelpers + '\nglobalThis.keyBody = ({' + keyBody + '}).body;' +
      '\nglobalThis.keyActions = ({' + keyActions + '}).do;', kc, { timeout: 1000 });
    requireThat(kc.keyStatus({}, key) === test.expected, 'DL-271 weak eligibility before authorization ' + test.name);
    kc.keyBody({ sess: { ui: {} } });
    draft.key = 'new';
    kc.keyActions.pick({ save() {} }, key.id);
    requireThat(draft.key === (test.expected === 'old' ? 'new' : key.id),
      'DL-271 actual picker refuses weak key ' + test.name);
    const row = choices.find(r => r.v === key.id);
    requireThat(row && row.disabled === (test.expected === 'old'), 'DL-271 chooser availability ' + test.name);
    if (test.expected === 'old') {
      requireThat(row.tag === 'Too weak to use' && row.reason === 'Older key type — too weak to use' &&
        kc.defaultKey({}) !== key.id, 'DL-271 weak label/reason/default ' + test.name);
    }
  }
  counts.weak_SSH_key_cases = fixture.weak_SSH_key_cases.length;
  counts.weak_SSH_picker_cases = fixture.weak_SSH_key_cases.length;
  const signInDefinition = section(nasSource, "def('nas-signin', {", "def('nas-install', {");
  const signInActions = section(signInDefinition, '    do: {', '    mounted(S, layer, fresh)');
  const installRun = section(nasSource, 'function run(S) {',
    "  /* ------------------------------------------------------------------ where the device's steps lead */");
  let retainedCases = 0, installCases = 0;
  for (const type of ['dsa', 'rsa-1024']) {
    for (const posture of ['authorized', 'locked', 'locked_authorized']) {
      const key = { id: 'retained', type, passphrase: posture !== 'authorized', where: 'file', file: 'key-ref' };
      const draft = { key: key.id, installed: true, opKey: 'prior-operation', unlocked: key.id };
      const routes = [];
      let shownSelection = null;
      const S = { sess: { ui: {} }, save() {} };
      const rc = vm.createContext({ T: text, N: () => draft, dev: () => ({ name: 'Target' }),
        authorizedFor: (_s, _d, id) => id === key.id && posture !== 'locked', keyring: () => [key],
        sshUser: () => 'actor', keysKey: () => 'keys', machine: () => 'Execution host', hostId: () => 'target',
        U: { esc: value => value }, seeSheet() {}, F: { state: () => ({ state: 'done' }) },
        C: { small: () => '', link: () => '', field: () => '', note: () => '',
          cards: (_action, _rows, selected) => { shownSelection = selected; return ''; } },
        O55: { ui: { go: route => routes.push({ route, key: draft.key }), refresh() {}, shake() {} },
          sound: { play() {} } } });
      vm.runInContext(keyHelpers + '\nglobalThis.keyActions = ({' + keyActions + '}).do;' +
        '\nglobalThis.keyBody = ({' + keyBody + '}).body; globalThis.eligible = usableKey;', rc, { timeout: 1000 });
      rc.keyBody(S);
      rc.keyActions.next(S);
      // The weak selection itself cannot advance. The eligible replacement already
      // shown by the chooser may advance, matching DL-271's replacement requirement.
      requireThat(shownSelection !== key.id && draft.key === shownSelection && rc.eligible(S, draft.key) &&
        routes.every(r => r.key !== key.id) && S.sess.ui.sheet !== 'passphrase' &&
        !draft.installed && draft.opKey === null && draft.unlocked === null,
        'DL-271 retained weak key replaced before advance/unlock/install ' + type + '/' + posture);
      retainedCases++;
    }
    for (const entry of ['selfCheck', 'add', 'run']) {
      const key = { id: 'retained', type, passphrase: true };
      const draft = { key: key.id, installed: true, opKey: 'prior-operation', unlocked: key.id };
      const routes = [];
      let effects = 0, secretReads = 0;
      const S = { sess: { ui: {} }, save() {}, root: { querySelector() { secretReads++; return null; } } };
      const ic = vm.createContext({ N: () => draft, dev: () => ({ name: 'Target' }), keyring: () => [key],
        authorizedFor: () => true, authorize: () => effects++, phaseOrder: () => { effects++; return []; },
        F: { op() { effects++; } }, O55: { ui: { go: route => routes.push(route) } } });
      vm.runInContext(keyHelpers + installRun + '\nglobalThis.signInActions = ({' + signInActions + '}).do;',
        ic, { timeout: 1000 });
      if (entry === 'run') ic.run(S); else ic.signInActions[entry](S);
      requireThat(routes.length === 1 && routes[0] === 'nas-key' && !effects && !secretReads &&
        draft.key !== key.id && !draft.installed && draft.opKey === null && draft.unlocked === null,
        'DL-271 weak install entry returns before effects ' + type + '/' + entry);
      installCases++;
    }
  }
  counts.retained_weak_key_action_cases = retainedCases;
  counts.weak_key_install_entry_cases = installCases;
  for (const type of ['ed25519', 'rsa-4096']) {
    const key = { id: 'eligible', type }, draft = { key: key.id, installed: true, opKey: 'current', unlocked: key.id };
    const gc = vm.createContext({ N: () => draft, keyring: () => [key] });
    vm.runInContext(keyHelpers, gc, { timeout: 1000 });
    requireThat(gc.keyGate({ save() { throw new Error('Eligible state must not be reset'); } }) &&
      draft.key === key.id && draft.installed && draft.opKey === 'current' && draft.unlocked === key.id,
      'DL-271 eligible key gate preserves owner state ' + type);
  }
  counts.eligible_key_gate_cases = 2;

  const waitingSource = section(server, 'if (!shownWaiting && inviteOpen(S) && runDone(S))', 'if (!inviteOpen(S))');
  for (const test of fixture.initial_pairing_wait_cases) {
    const S = { sess: { server: { runErr: test.owner_pending ? 'pending_no_result' : null } } };
    const wc = vm.createContext({ T: text, U: { esc: value => value },
      C: { link: (label, action) => label + '[' + action + ']', note: value => value },
      inviteOpen: () => test.invite_live, runDone: () => test.answered, pendingCopy: value => value });
    vm.runInContext('function waitingView(S, shownWaiting) { let card = ""; const sv = S.sess.server; ' +
      waitingSource + ' return card; }', wc, { timeout: 1000 });
    const result = wc.waitingView(S, test.shown_waiting);
    if (test.expected === 'initial') requireThat(result.includes('No requests yet') && result.includes('Check again') &&
      !result.includes(text('server.ready.runDone')), 'DL-271 neutral initial request wait ' + test.name);
    else if (test.expected === 'answered') requireThat(result.includes(text('server.ready.runDone')) &&
      !result.includes('Check again') && !result.includes('No requests yet'), 'DL-271 answered request remains terminal ' + test.name);
    else requireThat(result === '', 'DL-271 no initial-wait fiction ' + test.name);
  }
  counts.initial_pairing_wait_cases = fixture.initial_pairing_wait_cases.length;
  return { status: failures.length ? 'fail' : 'pass', counts, failures,
    claim_boundary: 'static_and_isolated_source_functions_only_no_browser_native_pixel_or_runtime_acceptance',
    pending_final_sources: [],
    resolved_final_source: { 'FX-1_PDF': 'd8df03ac1820a7cb68d0d1b4897eeb03fa228a6b',
      'FO-9': '503368802df57c9d35660d0a89dea15df01afc53',
      'FO-10': '03a02a178b1c386488b4a6f7865f9172cca7990c',
      'WEAK-SSH-KEY': 'd1abe18d58b0a8e8b8fdec7cd9f4525101f48895' } };
}
main().then(result => {
  process.stdout.write(JSON.stringify(result, null, 2));
  process.exitCode = failures.length ? 1 : 0;
}).catch(error => { process.stderr.write(error.stack + '\n'); process.exitCode = 1; });
