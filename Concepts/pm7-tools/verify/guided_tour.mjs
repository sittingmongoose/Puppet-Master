/* PM7 directed Guided Tour browser-concept verification.
 * The verifier follows the beginner film through real PM7 controls: Usage,
 * Planning, then Assistant Chat and the deterministic Teacher. Browser concept
 * evidence is not native Slint or production-runtime certification.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import {
  BROWSER_ONLY_BOUNDARY, REQUIRED_POLICY_PROBES, assertProvenanceAdmission,
  parseStrictVerifierArgs, prepareProvenanceRun
} from './browser_verifier_provenance.mjs';

const digest = value => /^[0-9a-f]{64}$/.test(value);
const cli = parseStrictVerifierArgs(process.argv, {
  file: { required: true }, outdir: { required: true }, modules: { required: true }, chromium: { required: true },
  'expected-artifact-sha256': { required: true, validate: digest },
  'expected-verifier-sha256': { required: true, validate: digest },
  'expected-helper-sha256': { required: true, validate: digest },
  'provenance-launch-receipt': { required: true },
  'expected-launch-receipt-sha256': { required: true, validate: digest }
});
const args = cli.parsed_args;
const artifactPath = resolve(args.file), outputDir = resolve(args.outdir), outputPath = join(outputDir, 'guided-tour-results.json');
mkdirSync(outputDir, { recursive: true });

let provenanceRun, browser;
try {
  provenanceRun = await prepareProvenanceRun({
    verifierUrl: import.meta.url, artifactPath,
    expectedArtifactSha256: args['expected-artifact-sha256'], expectedVerifierSha256: args['expected-verifier-sha256'],
    expectedHelperSha256: args['expected-helper-sha256'], launchReceiptPath: args['provenance-launch-receipt'],
    expectedLaunchReceiptSha256: args['expected-launch-receipt-sha256'], modulesPath: args.modules,
    chromiumPath: args.chromium, command: cli,
    effectiveConfig: { verifier: 'guided_tour', artifact_path: artifactPath, outdir: outputDir,
      journey: 'usage,planning_wizard,chat_teacher', teaching_model: 'directed_beginner_film',
      context_profile: '1280x800-and-320x560,dpr1,en-US,UTC,dark', timeout_ms: 120000,
      service_workers: 'block', certification_mode: true }
  });
  const { chromium } = provenanceRun.loadPlaywright();
  if (!chromium) throw new Error('bound Playwright Chromium implementation is unavailable');
  ({ browser } = await provenanceRun.launchChromium());
} catch (error) {
  let failureProvenance = provenanceRun?.envelope || null;
  if (provenanceRun) try { failureProvenance = await provenanceRun.fail('bootstrap', error); } catch (_failureError) {}
  const failure = { schema_id: 'pm.guided_tour_provenance_failure.v2', disposition: 'provenance_preparation_or_launch_failed',
    generated_at_utc: new Date().toISOString(), certification_boundary: { ...BROWSER_ONLY_BOUNDARY },
    execution_boundary: { ...BROWSER_ONLY_BOUNDARY }, command: cli,
    error: { kind: 'bootstrap', text: String(error?.stack || error) }, provenance: failureProvenance };
  writeFileSync(outputPath, JSON.stringify(failure, null, 2) + '\n');
  console.log(JSON.stringify({ disposition: failure.disposition, result: outputPath }));
  process.exit(1);
}

const artifactSource = provenanceRun.artifactText();
const result = { schema_id: 'pm.guided_tour_directed_matrix.v3', disposition: 'fail',
  evidence_scope: 'deterministic browser concept; not native Slint or production runtime certification',
  generated_at_utc: new Date().toISOString(), url: provenanceRun.artifactUrl(), provenance: provenanceRun.envelope,
  certification_boundary: { ...BROWSER_ONLY_BOUNDARY }, execution_boundary: { ...BROWSER_ONLY_BOUNDARY },
  checks: {}, scenarios: [], themes: [], placements: [], runtime_errors: [] };
function check(name, pass, evidence) {
  if (Object.hasOwn(result.checks, name)) throw new Error(`duplicate check name: ${name}`);
  result.checks[name] = { pass: Boolean(pass), evidence: evidence === undefined ? null : evidence };
}
function equal(left, right) { return JSON.stringify(left) === JSON.stringify(right); }
function assert(condition, message) { if (!condition) throw new Error(message); }
function boundedId(name) { return (String(name).toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '') || 'guided-tour-case').slice(0, 80); }
function overlap(a, b) { return !a || !b ? 0 : Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)); }
function noDeveloperJargon(text) { return !/\bshell\b|\bprovider\b|\btoken\b|\bruntime\b|\bcommand id\b|\bcmd\.[a-z_]/i.test(String(text || '')); }

const requiredSourceTokens = [
  "order:['usage','planning_wizard','chat_teacher']", 'orientation-panel-usage-planning-teacher-2026-09-01',
  'ui.guided_tour.toggle_eli5', 'ELI5 stays in the top bar for the whole tour',
  "routeButton('usage','Open Usage')", "via:'exact_usage_card_options'", "via:'exact_planning_choice'",
  "via:'exact_teacher_picker'", "'dock_right'", 'teacher_persona_selected', 'teacher_message_sent',
  'Ask Teacher anything about Puppet Master…', 'focus=heading||primary',
  'TEACHER_ANSWERS', 'TEACHER_FALLBACK', 'Safe History creates recoverable versions on this computer',
  'Git or Jujutsu can organize that local timeline', 'GitHub or GitLab can hold an optional online copy',
  'FileSafe protects files alongside it', 'data-pm7gt-teacher-response', 'overlapArea(box,visible)',
  '.pm7gt[data-step="usage"][data-phase="2"]', '@media (max-width: 420px)',
  '#pm7-onboarding-resume:not([hidden]) ~ #pm7-guided-tour-resume'
];
check('authored_directed_contract_present', requiredSourceTokens.every(token => artifactSource.includes(token)), { required_tokens: requiredSourceTokens });

async function newCase(name, options = {}) {
  const caseId = boundedId(name), contextConfig = { viewport: options.viewport || { width: 1280, height: 800 },
    deviceScaleFactor: 1, locale: 'en-US', timezoneId: 'UTC', colorScheme: options.colorScheme || 'dark',
    reducedMotion: options.reducedMotion ? 'reduce' : 'no-preference', serviceWorkers: 'block', acceptDownloads: false };
  const { context, guard } = await provenanceRun.createBoundContext(browser, { case_id: caseId, context_config: contextConfig });
  await context.addInitScript(() => { try { localStorage.clear(); localStorage.setItem('pm.themeFamily', 'friendly'); localStorage.setItem('pm.themeMode', 'dark'); localStorage.setItem('pm.theme', 'friendly-dark'); } catch (_error) {} });
  const page = await context.newPage(); await guard.instrumentPage(page); page.setDefaultTimeout(120000);
  const errors = [];
  page.on('console', message => { if (message.type() === 'error') errors.push({ kind: 'console', text: message.text().slice(0, 600) }); });
  page.on('pageerror', error => errors.push({ kind: 'pageerror', text: String(error).slice(0, 600) }));
  page.on('requestfailed', request => errors.push({ kind: 'requestfailed', url: request.url().slice(0, 500), text: String(request.failure()?.errorText || '').slice(0, 300) }));
  await guard.gotoBound(page, { navigation_id: `${caseId}:initial`, url: provenanceRun.artifactUrl({ case: caseId }), wait_until: 'load', timeout_ms: 120000 });
  await page.waitForFunction(() => Boolean(window.PM7_GUIDED_TOUR && window.PM_HOME_WORKSPACE && window.PM7_USAGE && window.PM_PAGES && window.PM_DEMO?.chat), null, { timeout: 30000 });
  await page.evaluate(() => { if (window.PM7_ONBOARDING_CINEMATIC?.snapshot().open) window.PM7_ONBOARDING_CINEMATIC.close('skip', { restoreFocus: false }); });
  return { name, caseId, context, guard, page, errors };
}
async function closeCase(testCase) {
  if (testCase.errors.length) result.runtime_errors.push({ case: testCase.name, errors: testCase.errors.slice() });
  try { await testCase.context.close(); } catch (error) { result.runtime_errors.push({ case: testCase.name, errors: [{ kind: 'context-close', text: String(error?.stack || error) }] }); }
}
async function scenario(name, callback, options = {}) {
  let testCase = null;
  try { testCase = await newCase(name, options); await callback(testCase); result.scenarios.push({ id: name, pass: true }); check(`scenario_${boundedId(name).replace(/-/g, '_')}`, true, { completed: true }); }
  catch (error) { const text = String(error?.stack || error); result.runtime_errors.push({ case: name, errors: [{ kind: 'scenario', text }] }); result.scenarios.push({ id: name, pass: false, error: text }); check(`scenario_${boundedId(name).replace(/-/g, '_')}`, false, { error: text }); }
  finally { if (testCase) await closeCase(testCase); }
}
async function snap(page) { return page.evaluate(() => window.PM7_GUIDED_TOUR.snapshot()); }
async function start(page, options = {}) { return page.evaluate(value => window.PM7_GUIDED_TOUR.start(value), options); }
async function next(page) { await page.locator('#pm7-guided-tour [data-ui-action-id="ui.guided_tour.next"]').click(); }
async function waitPhase(page, step, phase) { await page.waitForFunction(([s, p]) => { const row = window.PM7_GUIDED_TOUR.snapshot(); return row.step === s && row.phase === p && !row.demo_name; }, [step, phase]); return snap(page); }
async function normalPhaseFocus(page) {
  const row = await page.evaluate(() => {
    const state = window.PM7_GUIDED_TOUR.snapshot(), hover = window.PM_HOVER_TAG_CONTROLLER;
    const visual = document.getElementById('pm-hover-tag-visual');
    const exact = (state.step === 'usage' && state.phase === 2) || (state.step === 'planning_wizard' && state.phase === 0) ||
      (state.step === 'chat_teacher' && (state.phase === 1 || state.phase === 2));
    return { step: state.step, phase: state.phase, exact, active_id: document.activeElement?.id || null,
      visual_open: visual?.dataset.open || null, pending_target: hover?.pendingOpenTarget?.id || null,
      pending_source: hover?.pendingOpenSource || null };
  });
  assert(!row.exact && row.active_id === 'pm7gt-title' && row.visual_open !== 'true' && row.pending_target === null,
    `${row.step}:${row.phase} did not keep non-exact focus on the tour title without auto-opening hover help`);
  return row;
}
async function geometry(page) {
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  return page.evaluate(() => {
    const root = document.getElementById('pm7-guided-tour'), state = window.PM7_GUIDED_TOUR.snapshot();
    const target = window.PM7_GUIDED_TOUR.target_adapter.resolve(state.step, state.phase);
    const callout = root.querySelector('.pm7gt-callout'), c = callout.getBoundingClientRect(), t = target?.getBoundingClientRect();
    const rect = row => row && ({ left: row.left, top: row.top, right: row.right, bottom: row.bottom, width: row.width, height: row.height });
    return { step: state.step, phase: state.phase, target_key: state.target.target_key, target_available: state.target.available,
      target_inside: Boolean(target && callout.contains(target)), callout: rect(c), target: rect(t), viewport: [innerWidth, innerHeight],
      text: root.textContent.replace(/\s+/g, ' ').trim(), active: document.activeElement?.getAttribute('data-ui-action-id') || document.activeElement?.className || document.activeElement?.tagName };
  });
}
function assertPlacement(row) {
  const [width, height] = row.viewport;
  assert(row.callout.left >= 5 && row.callout.top >= 5 && row.callout.right <= width - 5 && row.callout.bottom <= height - 5, `${row.step}:${row.phase} escaped ${width}x${height}`);
  if (row.target && !row.target_inside) assert(overlap(row.callout, row.target) === 0, `${row.step}:${row.phase} callout covered its taught control`);
  assert(noDeveloperJargon(row.text), `${row.step}:${row.phase} exposed developer language`);
}
async function clickExactUsage(page) {
  const state = await snap(page); await page.locator(`#pm7uBoard .pm7u-card[data-widget="${state.active_widget_id}"] .pm7u-cardmenu`).click();
  return waitPhase(page, 'usage', 3);
}
async function reachTeacherComposer(page) {
  await page.locator('#chatPanel .pm6-chat-personabtn').click();
  await page.waitForFunction(() => window.PM7_GUIDED_TOUR.snapshot().phase === 1 && Boolean(document.querySelector('.pm6-chat-personaitem[data-persona="Teacher"]')));
  await page.locator('.pm6-chat-personaitem[data-persona="Teacher"]').click(); return waitPhase(page, 'chat_teacher', 2);
}

await scenario('directed-story-exact-controls-and-terminal-chat', async ({ page }) => {
  const started = await start(page, { source: 'verify-directed-story' });
  const normalFocus = [await normalPhaseFocus(page)];
  const opening = await page.evaluate(() => ({ top: document.querySelector('.pm7gt-head').textContent.replace(/\s+/g, ' ').trim(),
    actions: [...document.querySelectorAll('.pm7gt-actions button')].map(node => ({ id: node.dataset.uiActionId, text: node.textContent.trim() })),
    eli5: { text: document.getElementById('pm7gt-eli5').textContent.trim(), pressed: document.getElementById('pm7gt-eli5').getAttribute('aria-pressed') } }));
  assert(equal(started.story_order, ['usage', 'planning_wizard', 'chat_teacher']) && started.step === 'usage' && started.phase === 0, 'story does not begin Usage -> Planning -> Assistant Chat');
  assert(opening.eli5.text === 'ELI5: Off' && opening.eli5.pressed === 'false' && /Pause/.test(opening.top) && /Skip Tour/.test(opening.top), 'persistent ELI5, Pause, or Skip control is missing');
  assert(equal(opening.actions, [{ id: 'ui.guided_tour.focus_route', text: 'Open Usage' }]), 'opening has a dead or redundant confirmation');
  await page.locator('#pm7gt-eli5').click(); let state = await snap(page);
  assert(state.eli5_enabled && state.phase === 0 && (await page.locator('#pm7gt-eli5').textContent()).trim() === 'ELI5: On', 'ELI5 did not persist in the tour top controls');
  await page.locator('[data-ui-action-id="ui.guided_tour.focus_route"][data-route-page="usage"]').click(); await waitPhase(page, 'usage', 1); normalFocus.push(await normalPhaseFocus(page));
  await next(page); await waitPhase(page, 'usage', 2); assertPlacement(await geometry(page));
  state = await clickExactUsage(page); normalFocus.push(await normalPhaseFocus(page)); assert(state.ui_action_log.some(item => item.payload?.via === 'exact_usage_card_options'), 'the exact Usage options click did not advance automatically');
  await next(page); await waitPhase(page, 'planning_wizard', 0); assertPlacement(await geometry(page));
  await page.locator('#panel-wizard .pm6-wiz-intent-chip.sel').click(); state = await waitPhase(page, 'planning_wizard', 1); normalFocus.push(await normalPhaseFocus(page));
  assert(state.ui_action_log.some(item => item.payload?.via === 'exact_planning_choice'), 'the exact Planning choice did not advance automatically');
  await next(page); await waitPhase(page, 'chat_teacher', 0); normalFocus.push(await normalPhaseFocus(page));
  const chatOpening = await page.evaluate(() => ({ page: window.PM_PAGES.current, chat: window.PM_HOME_WORKSPACE.layout.surfaces.find(item => item.surface_instance_id === 'chat') }));
  assert(chatOpening.chat?.host === 'dock_right' && chatOpening.chat.visible && chatOpening.page === 'wizard', 'Assistant Chat did not open on the far right over Planning');
  await reachTeacherComposer(page); state = await snap(page);
  assert(state.teacher_persona_selected && state.ui_action_log.some(item => item.payload?.via === 'exact_teacher_picker'), 'the real guide and Teacher clicks did not advance automatically');
  const input = page.locator('#chatPanel .pm6-chat-input').first();
  const teacherPlaceholder = await input.getAttribute('placeholder');
  assert(teacherPlaceholder === 'Ask Teacher anything about Puppet Master…', 'Teacher phase 2 lost its exact placeholder after persona selection and rerender');
  await input.fill('Can I use Safe History with GitHub?'); await input.press('Enter');
  await page.waitForFunction(() => { const row = window.PM7_GUIDED_TOUR.snapshot(); return row.phase === 3 && row.teacher_message_sent && row.teacher_answer_id === 'history'; });
  const answer = await page.evaluate(() => ({ state: window.PM7_GUIDED_TOUR.snapshot(), text: [...document.querySelectorAll('[data-pm7gt-teacher-response="true"]')].at(-1)?.textContent.replace(/\s+/g, ' ').trim() || '' }));
  normalFocus.push(await normalPhaseFocus(page));
  assert(answer.state.teacher_copy_mode === 'eli5' && /kept on this computer/i.test(answer.text) && /Git or Jujutsu labels and arranges that local stack/i.test(answer.text) && /GitHub or GitLab can keep an optional copy online/i.test(answer.text), 'persistent ELI5 did not reach a materially explanatory Teacher reply');
  await page.locator('[data-ui-action-id="ui.guided_tour.finish"]').click(); state = await snap(page);
  const terminal = await page.evaluate(() => ({ page: window.PM_PAGES.current, chat: window.PM_HOME_WORKSPACE.layout.surfaces.find(item => item.surface_instance_id === 'chat'), visible: !document.getElementById('chatPanel').classList.contains('hidden') }));
  assert(state.completed && !state.open && state.layout_disposition === 'keep' && state.journal_depth === 0 && terminal.page === 'wizard' && terminal.chat?.host === 'dock_right' && terminal.visible, 'Finish did not leave the user in far-right Assistant Chat with a closed undo journal');
  check('directed_story_order_and_exact_click_advancement', true, { opening, teacher_placeholder: teacherPlaceholder, normal_phase_focus: normalFocus, answer, terminal, actions: state.ui_action_log });
});

await scenario('mobile-320-film-fits-targets-and-focus', async ({ page }) => {
  await start(page, { source: 'verify-mobile-directed' }); const rows = [await geometry(page)];
  await page.locator('[data-ui-action-id="ui.guided_tour.focus_route"]').click(); await waitPhase(page, 'usage', 1); rows.push(await geometry(page));
  await next(page); await waitPhase(page, 'usage', 2); rows.push(await geometry(page));
  const targetBeforeTab = (await snap(page)).target.target_key; await page.keyboard.press('Tab');
  const focused = await page.evaluate(() => ({ target: window.PM7_GUIDED_TOUR.snapshot().target.target_key,
    in_callout: document.querySelector('.pm7gt-callout').contains(document.activeElement), in_watched_card: Boolean(document.activeElement.closest?.('.pm7u-card')) }));
  assert(focused.target === targetBeforeTab && (focused.in_callout || focused.in_watched_card), 'focus escaped the director card and exact watched control');
  await clickExactUsage(page); rows.push(await geometry(page)); await next(page); await waitPhase(page, 'planning_wizard', 0); rows.push(await geometry(page));
  await page.locator('#panel-wizard .pm6-wiz-intent-chip.sel').click(); await waitPhase(page, 'planning_wizard', 1); rows.push(await geometry(page));
  await next(page); await waitPhase(page, 'chat_teacher', 0); rows.push(await geometry(page));
  await page.locator('#chatPanel .pm6-chat-personabtn').click(); await page.waitForFunction(() => window.PM7_GUIDED_TOUR.snapshot().phase === 1 && Boolean(document.querySelector('.pm6-chat-personaitem[data-persona="Teacher"]'))); rows.push(await geometry(page));
  await page.locator('.pm6-chat-personaitem[data-persona="Teacher"]').click(); await waitPhase(page, 'chat_teacher', 2); rows.push(await geometry(page));
  rows.forEach(assertPlacement); assert(rows.every(item => item.callout.height <= 300), '320 px director card exceeded its compact height');
  result.placements.push(...rows); check('mobile_320_clamp_target_separation_and_focus_containment', true, { rows, focused });
}, { viewport: { width: 320, height: 560 }, reducedMotion: true });

await scenario('teacher-facts-normal-eli5-and-supported-fallback', async ({ page }) => {
  async function ask(question, eli5) {
    await start(page, { source: `verify-teacher-${eli5 ? 'eli5' : 'normal'}`, step: 'chat_teacher' });
    if (eli5 !== (await snap(page)).eli5_enabled) await page.locator('#pm7gt-eli5').click();
    await reachTeacherComposer(page); const input = page.locator('#chatPanel .pm6-chat-input').first(); await input.fill(question); await input.press('Enter');
    await page.waitForFunction(() => window.PM7_GUIDED_TOUR.snapshot().phase === 3);
    return page.evaluate(() => ({ state: window.PM7_GUIDED_TOUR.snapshot(), text: [...document.querySelectorAll('[data-pm7gt-teacher-response="true"]')].at(-1)?.textContent.replace(/\s+/g, ' ').trim() || '' }));
  }
  const normal = await ask('Can I use Safe History with GitHub?', false), eli5 = await ask('Can I use Safe History with GitHub?', true), fallback = await ask('Why do whales sing?', false), filesafe = await ask('What is FileSafe?', false);
  assert(normal.state.teacher_answer_id === 'history' && /recoverable versions on this computer/i.test(normal.text) && /Git or Jujutsu can organize that local timeline/i.test(normal.text) && /GitHub or GitLab can hold an optional online copy/i.test(normal.text) && /Keep Safe History on first/i.test(normal.text), 'normal history answer lost definition, relationship, or safe next action');
  assert(eli5.state.teacher_copy_mode === 'eli5' && eli5.text !== normal.text && /stack of save points kept on this computer/i.test(eli5.text) && /optional copy online/i.test(eli5.text) && /Start with the local save points/i.test(eli5.text), 'ELI5 answer is not a materially different analogy and safe action');
  assert(fallback.state.teacher_answer_id === 'supported_topics' && /projects/i.test(fallback.text) && /Safe History/i.test(fallback.text) && /remote access/i.test(fallback.text) && /Try [“"]What is Safe History\?/i.test(fallback.text) && !/^Remote access is/i.test(fallback.text), 'unknown question silently defaulted instead of describing supported topics');
  assert(filesafe.state.teacher_answer_id === 'filesafe' && /complements recoverable history/i.test(filesafe.text) && /does not replace Safe History, Git, or Jujutsu/i.test(filesafe.text) && /check FileSafe’s location in Settings/i.test(filesafe.text), 'FileSafe answer lost its complementary boundary');
  assert([normal, eli5, fallback, filesafe].every(item => item.state.provider_use_count === 0), 'deterministic Teacher crossed its zero-provider boundary');
  check('teacher_fact_boundaries_and_distinct_explanation_depth', true, { normal, eli5, fallback, filesafe });
});

await scenario('skip-restores-captured-page-and-arrangement', async ({ page }) => {
  const before = await page.evaluate(() => ({ page: window.PM_PAGES.current, layout: window.PM7_GUIDED_TOUR.target_adapter.layoutSnapshot() }));
  await start(page, { source: 'verify-skip-restore' });
  await page.locator('[data-ui-action-id="ui.guided_tour.focus_route"]').click(); await waitPhase(page, 'usage', 1);
  const during = await page.evaluate(() => ({ page: window.PM_PAGES.current, layout: window.PM7_GUIDED_TOUR.target_adapter.layoutSnapshot() }));
  const skipped = await page.evaluate(() => window.PM7_GUIDED_TOUR.skip());
  const after = await page.evaluate(() => ({ page: window.PM_PAGES.current, layout: window.PM7_GUIDED_TOUR.target_adapter.layoutSnapshot() }));
  assert(skipped.skipped && !skipped.open && skipped.layout_disposition === 'restore' && skipped.journal_depth === 0, 'Skip did not close with a completed restore journal');
  assert(during.page === 'usage' && after.page === before.page && equal(after.layout, before.layout), 'Skip did not restore the captured page and exact semantic arrangement');
  check('skip_restore_and_completion_keep_are_exact', true, { before, during, after, skipped });
});

await scenario('pause-resume-reduced-motion-and-theme-contract', async ({ page }) => {
  await start(page, { source: 'verify-interruption' }); await page.locator('[data-ui-action-id="ui.guided_tour.pause"]').focus(); await page.keyboard.press('Enter');
  const paused = await snap(page); await page.evaluate(() => { document.getElementById('pm7-onboarding-resume').hidden = false; });
  const resumes = await page.evaluate(() => { const rect = id => { const row = document.getElementById(id).getBoundingClientRect(); return { left: row.left, top: row.top, right: row.right, bottom: row.bottom }; }; return { setup: rect('pm7-onboarding-resume'), tour: rect('pm7-guided-tour-resume') }; });
  assert(paused.status === 'paused' && overlap(resumes.setup, resumes.tour) === 0, 'the two paused setup/tour return controls overlap');
  await page.evaluate(() => { document.getElementById('pm7-onboarding-resume').hidden = true; }); await page.locator('#pm7-guided-tour-resume').focus(); await page.keyboard.press('Enter');
  const resumed = await snap(page); await page.keyboard.press('Escape'); const escaped = await snap(page);
  assert(resumed.open && escaped.status === 'paused', 'keyboard pause, resume, or Escape failed');
  await page.evaluate(() => window.PM7_GUIDED_TOUR.resume());
  const motion = await page.evaluate(() => { const root = document.getElementById('pm7-guided-tour'), nodes = [root, ...root.querySelectorAll('*')]; return nodes.flatMap(node => [getComputedStyle(node), getComputedStyle(node, '::before'), getComputedStyle(node, '::after')].flatMap(style => `${style.animationDuration},${style.animationDelay},${style.transitionDuration}`.split(',').map(value => value.trim()).filter(value => value && value !== '0s' && value !== '0ms'))); });
  assert(motion.length === 0, 'reduced-motion context retained guided-tour animation');
  const themes = ['friendly-dark','friendly-light','glass-dark','glass-light','retro-dark','retro-light','basic-dark','basic-light'];
  for (const theme of themes) {
    const row = await page.evaluate(value => { document.documentElement.setAttribute('data-motion', 'normal'); document.documentElement.setAttribute('data-theme', value); window.PM7_GUIDED_TOUR.start({ source: `theme-${value}` }); document.documentElement.setAttribute('data-theme', value); const style = getComputedStyle(document.querySelector('.pm7gt-callout')); return { theme: value, background: style.backgroundColor, color: style.color, radius: style.borderRadius, duration: style.animationDuration, timing: style.animationTimingFunction }; }, theme);
    row.pass = row.background !== 'rgba(0, 0, 0, 0)' && row.color !== 'rgba(0, 0, 0, 0)' && (!theme.startsWith('retro') || (row.radius === '0px' && row.duration === '0.14s' && row.timing.includes('steps('))); result.themes.push(row);
  }
  assert(result.themes.every(row => row.pass), 'one or more theme variants lost readable or Retro-native presentation');
  check('interruption_resume_separation_reduced_motion_and_themes', true, { paused, resumed, escaped, resumes, themes: result.themes });
}, { viewport: { width: 320, height: 560 }, reducedMotion: true });

try { await provenanceRun.finalizeBeforeBrowserClose(browser); }
catch (error) { result.runtime_errors.push({ case: 'provenance-pre-close', errors: [{ kind: 'finalize', text: String(error?.stack || error) }] }); }
try { await browser.close(); }
catch (error) { result.runtime_errors.push({ case: 'browser-close', errors: [{ kind: 'close', text: String(error?.stack || error) }] }); }
try { result.provenance = await provenanceRun.finalizeAfterBrowserClose(); }
catch (error) { result.runtime_errors.push({ case: 'provenance-post-close', errors: [{ kind: 'finalize', text: String(error?.stack || error) }] }); result.provenance = provenanceRun.envelope; }

let provenanceAdmissionError = null;
try { assertProvenanceAdmission(result.provenance); } catch (error) { provenanceAdmissionError = String(error?.stack || error); }
const probeNames = (result.provenance.network?.policy_probe?.receipts || []).map(row => row.name);
check('strict_browser_provenance_v2_admission', provenanceAdmissionError === null && result.provenance.schema_id === 'pm.browser_verifier_provenance.v2' && result.provenance.admission?.pass === true &&
  result.provenance.network?.policy_probe?.attempted === REQUIRED_POLICY_PROBES.length && equal(probeNames, REQUIRED_POLICY_PROBES), {
  admission: result.provenance.admission, error: provenanceAdmissionError, schema_id: result.provenance.schema_id,
  artifact: result.provenance.artifact, verifier: result.provenance.verifier, helper: result.provenance.helper,
  launcher: result.provenance.launcher, browser: result.provenance.browser, command: result.provenance.command,
  navigation_count: result.provenance.navigations?.length, policy_probe_names: probeNames, os_egress: result.provenance.network?.os_egress,
  certification_boundary: result.provenance.certification_boundary
});
check('console_page_and_provenance_runtime_errors_clean', result.runtime_errors.length === 0 && result.provenance.runtime_errors?.count === 0, { verifier: result.runtime_errors, provenance: result.provenance.runtime_errors });
const failed = Object.entries(result.checks).filter(([, value]) => !value.pass).map(([name]) => name);
result.disposition = failed.length ? 'fail' : 'pass';
result.summary = { passed: Object.keys(result.checks).length - failed.length, failed: failed.length, failed_checks: failed,
  scenario_denominator: result.scenarios.length, placement_denominator: result.placements.length,
  theme_denominator: result.themes.length, policy_probe_denominator: REQUIRED_POLICY_PROBES.length,
  native_slint_certified: false, production_runtime_certified: false };
writeFileSync(outputPath, JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({ disposition: result.disposition, result: outputPath, summary: result.summary }));
if (failed.length) process.exitCode = 1;
