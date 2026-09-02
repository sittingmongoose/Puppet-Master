/* PM7 Product Onboarding checkpoint verifier.
 *
 * This is intentionally a focused browser checkpoint, not the final visual,
 * accessibility, motion, or native-runtime certification campaign.
 */

import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import {
  BROWSER_ONLY_BOUNDARY,
  REQUIRED_POLICY_PROBES,
  assertProvenanceAdmission,
  parseStrictVerifierArgs,
  prepareProvenanceRun
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
const artifactPath = resolve(args.file);
const outputDir = resolve(args.outdir);
const outputPath = join(outputDir, 'onboarding-cinematic-results.json');
mkdirSync(outputDir, { recursive: true });

let provenanceRun;
let browser;
try {
  provenanceRun = await prepareProvenanceRun({
    verifierUrl: import.meta.url,
    artifactPath,
    expectedArtifactSha256: args['expected-artifact-sha256'],
    expectedVerifierSha256: args['expected-verifier-sha256'],
    expectedHelperSha256: args['expected-helper-sha256'],
    launchReceiptPath: args['provenance-launch-receipt'],
    expectedLaunchReceiptSha256: args['expected-launch-receipt-sha256'],
    modulesPath: args.modules,
    chromiumPath: args.chromium,
    command: cli,
    effectiveConfig: {
      verifier: 'onboarding_cinematic', artifact_path: artifactPath, outdir: outputDir,
      journey: 'welcome,path,project,source,places,access,review,preparing,ready;connect_existing=welcome,path,access,review,preparing,ready',
      viewport_matrix: 'checkpoint-desktop-plus-compact',
      context_profile: 'dpr1,en-US,America/New_York,dark', timeout_ms: 120000,
      service_workers: 'block', certification_mode: true
    }
  });
  const { chromium } = provenanceRun.loadPlaywright();
  if (!chromium) throw new Error('bound Playwright Chromium implementation is unavailable');
  ({ browser } = await provenanceRun.launchChromium());
} catch (error) {
  let failureProvenance = provenanceRun?.envelope || null;
  if (provenanceRun) {
    try { failureProvenance = await provenanceRun.fail('bootstrap', error); } catch (_failureError) {}
  }
  const failure = {
    schema_id: 'pm.onboarding_cinematic_provenance_failure.v2', disposition: 'provenance_preparation_failed',
    generated_at_utc: new Date().toISOString(), certification_boundary: { ...BROWSER_ONLY_BOUNDARY }, command: cli,
    error: { kind: 'provenance-preparation', text: String(error?.stack || error) }, provenance: failureProvenance
  };
  writeFileSync(outputPath, JSON.stringify(failure, null, 2) + '\n');
  console.log(JSON.stringify({ disposition: failure.disposition, result: outputPath }));
  process.exit(1);
}

const artifactSource = provenanceRun.artifactText();
const sha256 = value => createHash('sha256').update(value).digest('hex');
const equal = (left, right) => JSON.stringify(left) === JSON.stringify(right);
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const SCREEN_ORDER = ['welcome', 'path', 'project', 'source', 'places', 'access', 'review', 'preparing', 'ready'];
const CONNECT_ORDER = ['welcome', 'path', 'access', 'review', 'preparing', 'ready'];
const STAGES = Object.freeze({
  welcome: 'welcome', path: 'simple_path', project: 'first_project', source: 'source_control_setup',
  places: 'server_storage_client', access: 'remote_access_setup', review: 'review_setup_plan',
  preparing: 'automatic_preparation', ready: 'ready'
});
const result = {
  schema_id: 'pm.onboarding_cinematic_checkpoint.v3', generated_at_utc: new Date().toISOString(),
  url: provenanceRun.artifactUrl(), provenance: provenanceRun.envelope,
  execution_boundary: { ...BROWSER_ONLY_BOUNDARY }, checks: {}, journeys: [], modal_layouts: [], runtime_errors: []
};
function check(name, pass, evidence) {
  if (Object.hasOwn(result.checks, name)) throw new Error(`duplicate check name: ${name}`);
  result.checks[name] = { pass: Boolean(pass), evidence };
}
function ownerTruth(state) {
  return state?.owner_readiness_claim === false && state?.owner_work_started === false &&
    state?.production_runtime_state === 'unavailable' && state?.production_receipt === null;
}
function boundedCaseId(name) {
  return String(name).toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'case';
}
async function newCase(name, viewport = { width: 1280, height: 800 }) {
  const caseId = boundedCaseId(name);
  const { context, guard } = await provenanceRun.createBoundContext(browser, {
    case_id: caseId,
    context_config: { viewport, deviceScaleFactor: 1, locale: 'en-US', timezoneId: 'America/New_York', colorScheme: 'dark', reducedMotion: 'reduce', serviceWorkers: 'block', acceptDownloads: false }
  });
  const page = await context.newPage();
  await guard.instrumentPage(page);
  page.setDefaultTimeout(120000);
  const errors = [];
  page.on('console', message => { if (message.type() === 'error') errors.push({ kind: 'console', text: message.text().slice(0, 500) }); });
  page.on('pageerror', error => errors.push({ kind: 'pageerror', text: String(error).slice(0, 500) }));
  page.on('requestfailed', request => errors.push({ kind: 'requestfailed', url: request.url().slice(0, 500), text: String(request.failure()?.errorText || '').slice(0, 300) }));
  await guard.gotoBound(page, { navigation_id: `${caseId}:initial`, url: provenanceRun.artifactUrl({ case: caseId }), wait_until: 'load', timeout_ms: 120000 });
  await page.waitForFunction(() => Boolean(window.PM7_ONBOARDING_CINEMATIC));
  return { name, context, page, errors };
}
async function scenario(name, callback, viewport) {
  let testCase;
  try {
    testCase = await newCase(name, viewport);
    await callback(testCase.page);
    check(`scenario_${boundedCaseId(name).replace(/-/g, '_')}`, true, { completed: true });
  } catch (error) {
    result.runtime_errors.push({ case: name, errors: [{ kind: 'scenario', text: String(error?.stack || error) }] });
    check(`scenario_${boundedCaseId(name).replace(/-/g, '_')}`, false, { error: String(error?.stack || error) });
  } finally {
    if (testCase) {
      if (testCase.errors.length) result.runtime_errors.push({ case: name, errors: testCase.errors });
      try { await testCase.context.close(); } catch (error) { result.runtime_errors.push({ case: name, errors: [{ kind: 'context-close', text: String(error) }] }); }
    }
  }
}
async function snapshot(page) { return page.evaluate(() => window.PM7_ONBOARDING_CINEMATIC.snapshot()); }
async function waitScreen(page, screen) {
  await page.waitForFunction(expected => window.PM7_ONBOARDING_CINEMATIC.snapshot().screen === expected, screen);
  return snapshot(page);
}
async function click(page, selector, screen = null) {
  await page.locator(selector).click();
  return screen ? waitScreen(page, screen) : snapshot(page);
}
async function screenEvidence(page, expected) {
  const evidence = await page.evaluate(() => {
    const state = window.PM7_ONBOARDING_CINEMATIC.snapshot();
    const root = document.getElementById('pm7-onboarding');
    const layer = root.querySelector('[data-onboarding-layer="current"]');
    const modal = root.querySelector('.pm7ob-window').getBoundingClientRect();
    return {
      screen: state.screen, stage: state.stage, state, root_screen: root.dataset.screen,
      heading_count: layer.querySelectorAll('h1').length,
      scene: layer.querySelector('.pm7ob-story')?.dataset.scene || null,
      visible_text: layer.innerText.replace(/\s+/g, ' ').trim(),
      modal: { left: modal.left, top: modal.top, right: modal.right, bottom: modal.bottom, width: modal.width, height: modal.height },
      viewport: { width: innerWidth, height: innerHeight },
      horizontal_overflow: layer.scrollWidth > layer.clientWidth + 1
    };
  });
  assert(evidence.screen === expected && evidence.stage === STAGES[expected] && evidence.root_screen === expected, `screen/stage mismatch for ${expected}`);
  assert(evidence.heading_count === 1 && evidence.scene, `${expected} lacks one clear heading and scene`);
  assert(ownerTruth(evidence.state), `${expected} crossed the browser-only owner boundary`);
  assert(!/\bshell\b/i.test(evidence.visible_text), `${expected} exposes developer shell jargon`);
  assert(evidence.modal.left >= -1 && evidence.modal.top >= -1 && evidence.modal.right <= evidence.viewport.width + 1 && evidence.modal.bottom <= evidence.viewport.height + 1 && !evidence.horizontal_overflow, `${expected} escapes modal bounds`);
  result.modal_layouts.push({ screen: expected, ...evidence.modal, viewport: evidence.viewport });
  return evidence;
}
async function chooseNewJourneyToSource(page) {
  await screenEvidence(page, 'welcome');
  await click(page, '[data-plan-action="theme"][data-plan-value="retro"]');
  let state = await snapshot(page);
  assert(state.setup_plan.theme_family === 'retro', 'theme choice did not update the setup plan');
  await click(page, '[data-ui-action-id="ui.onboarding.start"]:visible', 'path');
  await screenEvidence(page, 'path');
  await click(page, '[data-plan-action="journey"][data-plan-value="new_or_local"]', 'project');
  await screenEvidence(page, 'project');
  await click(page, '[data-plan-action="project"][data-plan-value="new"]');
  await click(page, '[data-plan-nav="source"]', 'source');
  return screenEvidence(page, 'source');
}

await scenario('nine-stage-planned-setup', async page => {
  const visited = ['welcome', 'path', 'project', 'source'];
  await chooseNewJourneyToSource(page);
  await click(page, '[data-plan-action="history"][data-plan-value="jujutsu"]');
  await click(page, '[data-plan-action="online"][data-plan-value="new"]');
  await click(page, '[data-plan-action="forge"][data-plan-value="github"]');
  await page.locator('[data-plan-field="repository_visibility"]').selectOption('public');
  await page.locator('[data-plan-field="repository_owner_scope"]').selectOption('organization');
  await page.locator('[data-plan-field="repository_name"]').fill('checkpoint-repository');
  const source = await screenEvidence(page, 'source');
  const providerFields = await page.evaluate(() => ({
    visibility: document.querySelector('[data-plan-field="repository_visibility"]')?.value,
    owner_scope: document.querySelector('[data-plan-field="repository_owner_scope"]')?.value,
    repository_name: document.querySelector('[data-plan-field="repository_name"]')?.value,
    provider_buttons: Array.from(document.querySelectorAll('[data-plan-action="forge"]')).map(node => node.dataset.planValue),
    local_copy: /Safe History is local/i.test(document.querySelector('[data-onboarding-layer="current"]').innerText),
    coexistence: /online copy is separate and optional/i.test(document.querySelector('[data-onboarding-layer="current"]').innerText)
  }));
  assert(source.state.setup_plan.history_backend === 'jujutsu' && source.state.setup_plan.local_history && source.state.setup_plan.online_mode === 'new', 'Safe History and online copy did not coexist');
  assert(providerFields.visibility === 'public' && providerFields.owner_scope === 'organization' && providerFields.repository_name === 'checkpoint-repository', 'provider repository fields did not retain values');
  assert(providerFields.provider_buttons.includes('github') && providerFields.provider_buttons.includes('gitlab') && providerFields.local_copy && providerFields.coexistence, 'source-control beginner contract is incomplete');
  await click(page, '[data-plan-action="source-more"]');
  const extraProviders = await page.locator('[data-plan-action="forge"]').evaluateAll(nodes => nodes.map(node => node.dataset.planValue));
  assert(['azure_devops', 'bitbucket', 'cursor_origin'].every(value => extraProviders.includes(value)), 'other forge/Origin choices are missing');
  await click(page, '[data-plan-nav="places"]', 'places');
  visited.push('places');
  await screenEvidence(page, 'places');
  await page.locator('[data-plan-field="server_mode"]').selectOption('existing_server');
  await page.locator('[data-plan-field="storage_mode"]').selectOption('network_location');
  await page.locator('[data-plan-field="server_ref"]').fill('unraid-server');
  await page.locator('[data-plan-field="storage_location"]').fill('truenas/projects');
  const places = await screenEvidence(page, 'places');
  assert(places.state.setup_plan.server_mode === 'existing_server' && places.state.setup_plan.storage_mode === 'network_location' && places.state.setup_plan.client_mode === 'this_device', 'Server, Storage, and Client are not independent plan fields');
  await click(page, '[data-plan-nav="access"]', 'access');
  visited.push('access');
  await screenEvidence(page, 'access');
  const recommended = await page.locator('[data-plan-action="remote"]').evaluateAll(nodes => nodes.map(node => node.dataset.planValue));
  assert(equal(recommended, ['tailscale', 'vpn', 'reverse_proxy']), `unexpected recommended remote order: ${recommended}`);
  await click(page, '[data-plan-action="remote"][data-plan-value="tailscale"]');
  assert(await page.locator('[data-plan-action="tailscale-control"][data-plan-value="headscale"]').count() === 1, 'Headscale choice is missing');
  await click(page, '[data-plan-action="remote"][data-plan-value="reverse_proxy"]');
  const proxyKinds = await page.locator('[data-plan-field="proxy_kind"] option').evaluateAll(nodes => nodes.map(node => node.value));
  assert(equal(proxyKinds, ['caddy', 'nginx', 'traefik', 'nginx_proxy_manager']), 'reverse-proxy app list drifted');
  await click(page, '[data-plan-action="remote-more"]');
  assert(await page.locator('[data-plan-action="remote"][data-plan-value="remote_link"]').count() === 1, 'Remote Link was not disclosed behind More options');
  const beforeReview = await snapshot(page);
  const preReviewLog = await page.evaluate(() => window.PM7_ONBOARDING_CINEMATIC.event_log);
  assert(!beforeReview.setup_plan.applied && !beforeReview.setup_plan.review_confirmed && ownerTruth(beforeReview), 'choices mutated owner state before Review');
  assert(!preReviewLog.some(row => row.payload?.owner_work_started === true || row.payload?.production_readiness === true), 'pre-Review log claims owner mutation/readiness');
  await click(page, '[data-plan-nav="review"]', 'review');
  visited.push('review');
  const review = await screenEvidence(page, 'review');
  assert(/No project, account, repository, Server, storage, or remote route has been changed yet/i.test(review.visible_text), 'Review does not state the mutation boundary');
  assert(await page.locator('[data-edit-stage]').count() >= 7, 'Review does not offer direct edits');
  await page.evaluate(() => window.PM7_ONBOARDING_CINEMATIC.setOwnerProjectionAdapter(null));
  await click(page, '[data-plan-nav="apply"]', 'preparing');
  visited.push('preparing');
  const preparing = await screenEvidence(page, 'preparing');
  assert(preparing.state.setup_plan.review_confirmed && !preparing.state.setup_plan.applied, 'Apply did not preserve review-before-completion semantics');
  assert(await page.locator('.pm7ob-apply-step').count() >= 3, 'Apply progress does not enumerate queued work');
  const applyAction = await page.evaluate(() => window.PM7_ONBOARDING_CINEMATIC.ui_action_log.filter(row => row.id === 'ui.onboarding.run_automatic_preparation').at(-1));
  assert(applyAction?.payload?.synthetic_onboarding_command === false && Array.isArray(applyAction?.payload?.queued_owner_actions) && applyAction.payload.queued_owner_actions.length >= 3, 'Apply did not expose canonical queued owner actions');
  await page.evaluate(() => {
    const api = window.PM7_ONBOARDING_CINEMATIC;
    api.acceptAutomaticPreparationProjection(api.conceptFixtures.projection({ work_state: 'ready', progress_kind: 'none' }));
    api.settleAutomaticPreparationPresentation();
  });
  await waitScreen(page, 'ready');
  visited.push('ready');
  const ready = await screenEvidence(page, 'ready');
  assert(ready.state.setup_plan.applied, 'accepted ready projection did not mark the reviewed plan applied');
  await click(page, '.pm7ob-back');
  const backAtReview = await waitScreen(page, 'review');
  assert(!backAtReview.setup_plan.applied && !backAtReview.setup_plan.review_confirmed, 'Back from Ready did not return to editable Review');
  assert(equal(visited, SCREEN_ORDER), `full journey drifted: ${visited}`);
  result.journeys.push({ kind: 'new_or_local', screens: visited, provider_fields: providerFields, remote_order: recommended, proxy_kinds: proxyKinds, queued_owner_actions: applyAction.payload.queued_owner_actions });
});

await scenario('connect-existing-skips-project-source-places', async page => {
  const visited = ['welcome'];
  await click(page, '[data-ui-action-id="ui.onboarding.start"]:visible', 'path');
  visited.push('path');
  await click(page, '[data-plan-action="journey"][data-plan-value="connect_existing"]', 'access');
  visited.push('access');
  const access = await screenEvidence(page, 'access');
  assert(access.state.setup_plan.journey === 'connect_existing' && access.state.project_choice === 'later' && access.state.source_choice === 'later', 'existing installation path did not bypass new-project choices');
  await click(page, '[data-plan-action="remote"][data-plan-value="tailscale"]');
  await page.locator('[data-plan-field="remote_endpoint"]').fill('home-pm.tailnet.ts.net');
  await click(page, '[data-plan-nav="review"]', 'review');
  visited.push('review');
  const review = await screenEvidence(page, 'review');
  assert(!/Safe History\s+Git local/i.test(review.visible_text) && /Connect this device/i.test(review.visible_text), 'connect Review reintroduced project-first setup');
  await page.evaluate(() => window.PM7_ONBOARDING_CINEMATIC.setOwnerProjectionAdapter(null));
  await click(page, '[data-plan-nav="apply"]', 'preparing');
  visited.push('preparing');
  await page.evaluate(() => {
    const api = window.PM7_ONBOARDING_CINEMATIC;
    api.acceptAutomaticPreparationProjection(api.conceptFixtures.projection({ work_state: 'ready', progress_kind: 'none' }));
    api.settleAutomaticPreparationPresentation();
  });
  await waitScreen(page, 'ready');
  visited.push('ready');
  await screenEvidence(page, 'ready');
  assert(equal(visited, CONNECT_ORDER), `connect-existing journey did not skip project/source/places: ${visited}`);
  result.journeys.push({ kind: 'connect_existing', screens: visited });
});

await scenario('compact-modal-bounds', async page => {
  await screenEvidence(page, 'welcome');
  await click(page, '[data-ui-action-id="ui.onboarding.start"]:visible', 'path');
  await screenEvidence(page, 'path');
  await click(page, '[data-plan-action="journey"][data-plan-value="connect_existing"]', 'access');
  await screenEvidence(page, 'access');
  await click(page, '[data-plan-nav="review"]', 'review');
  const review = await screenEvidence(page, 'review');
  assert(review.modal.width <= 320 && review.modal.height <= 560, 'compact modal exceeds the viewport');
}, { width: 320, height: 560 });

const onboardingStart = artifactSource.indexOf('<section class="pm7ob"');
const onboardingEnd = artifactSource.indexOf('<script id="pm7-onboarding-js">');
const onboardingStatic = onboardingStart >= 0 ? artifactSource.slice(onboardingStart) : artifactSource;
const visibleStatic = onboardingStart >= 0 && onboardingEnd > onboardingStart ? artifactSource.slice(onboardingStart, onboardingEnd) : onboardingStatic;
const staticEvidence = {
  artifact_sha256: sha256(artifactSource), modal_root: onboardingStart >= 0, api: onboardingEnd >= 0,
  screen_order: SCREEN_ORDER.filter(screen => onboardingStatic.includes(`'${screen}'`)),
  stages: Object.values(STAGES).filter(stage => onboardingStatic.includes(`'${stage}'`)),
  setup_plan: onboardingStatic.includes('pm.product_onboarding.setup_plan.v1') && onboardingStatic.includes('review_confirmed'),
  safe_history_local: onboardingStatic.includes('Safe History is local.') && onboardingStatic.includes("planSegment('Git · recommended','history','git'") && onboardingStatic.includes("planSegment('Jujutsu','history','jujutsu'"),
  online_coexists: onboardingStatic.includes('online copy is separate and optional') && onboardingStatic.includes('Local Safe History stays on even when an online copy is added'),
  provider_fields: ['repository_visibility', 'repository_owner_scope', 'repository_container', 'repository_project', 'repository_default_branch'].every(token => onboardingStatic.includes(token)),
  roles_independent: ['server_mode', 'storage_mode', 'client_mode'].every(token => onboardingStatic.includes(token)) && onboardingStatic.includes('Three independent roles'),
  remote_contract: ['tailscale', 'headscale', 'vpn', 'reverse_proxy', 'remote_link', 'nginx_proxy_manager', 'lets_encrypt'].every(token => onboardingStatic.includes(token)),
  review_before_apply: onboardingStatic.includes('Everything waits for your say-so.') && onboardingStatic.includes('No project, account, repository, Server, storage, or remote route has been changed yet.') && onboardingStatic.includes('setupPlanOwnerActions()'),
  no_fake_command: !/cmd\.onboarding\./.test(onboardingStatic),
  truth_boundary: onboardingStatic.includes('concept_simulation_only:true') && onboardingStatic.includes("production_runtime_state:'unavailable'") && onboardingStatic.includes('native_binding:false'),
  no_shell_jargon: !Array.from(visibleStatic.matchAll(/>([^<>]+)</g), match => match[1]).some(text => /\bshell\b/i.test(text))
};
check('static_nine_stage_setup_plan_contract',
  staticEvidence.artifact_sha256 === provenanceRun.envelope.artifact.sha256 && staticEvidence.modal_root && staticEvidence.api &&
  equal(staticEvidence.screen_order, SCREEN_ORDER) && equal(staticEvidence.stages, Object.values(STAGES)) && staticEvidence.setup_plan &&
  staticEvidence.safe_history_local && staticEvidence.online_coexists && staticEvidence.provider_fields && staticEvidence.roles_independent &&
  staticEvidence.remote_contract && staticEvidence.review_before_apply,
  staticEvidence);
check('browser_concept_truth_boundary', staticEvidence.no_fake_command && staticEvidence.truth_boundary && staticEvidence.no_shell_jargon, staticEvidence);

try { await provenanceRun.finalizeBeforeBrowserClose(browser); }
catch (error) { result.runtime_errors.push({ case: 'provenance-pre-close', errors: [{ kind: 'provenance', text: String(error?.stack || error) }] }); }
try { await browser.close(); }
catch (error) { result.runtime_errors.push({ case: 'browser-close', errors: [{ kind: 'provenance', text: String(error?.stack || error) }] }); }
try { result.provenance = await provenanceRun.finalizeAfterBrowserClose(); }
catch (error) {
  result.runtime_errors.push({ case: 'provenance-post-close', errors: [{ kind: 'provenance', text: String(error?.stack || error) }] });
  try { result.provenance = await provenanceRun.fail('post-close', error); } catch (_failureError) { result.provenance = provenanceRun.envelope; }
}
let provenanceAdmissionError = null;
try { assertProvenanceAdmission(result.provenance); } catch (error) { provenanceAdmissionError = String(error?.stack || error); }
const policyProbeNames = result.provenance.network?.policy_probe?.receipts?.map(row => row.name) || [];
check('shared_browser_provenance_v2_admission', provenanceAdmissionError === null && result.provenance.admission?.pass === true, { admission: result.provenance.admission, error: provenanceAdmissionError });
check('required_network_probe_denominator_exact', equal(policyProbeNames.slice().sort(), REQUIRED_POLICY_PROBES.slice().sort()) && policyProbeNames.length === REQUIRED_POLICY_PROBES.length, { expected: REQUIRED_POLICY_PROBES, actual: policyProbeNames });
check('exact_browser_only_certification_boundary', equal(result.execution_boundary, BROWSER_ONLY_BOUNDARY) && equal(result.provenance.certification_boundary, BROWSER_ONLY_BOUNDARY), { result_boundary: result.execution_boundary, provenance_boundary: result.provenance.certification_boundary });
check('runtime_console_page_and_transport_clean', result.runtime_errors.length === 0 && result.provenance.runtime_errors?.count === 0 && result.provenance.transport?.integrity_failure === null, { verifier: result.runtime_errors, provenance: result.provenance.runtime_errors, transport_integrity_failure: result.provenance.transport?.integrity_failure });

const failedChecks = Object.entries(result.checks).filter(([, value]) => !value.pass).map(([name]) => name);
result.summary = {
  check_count: Object.keys(result.checks).length,
  passed_checks: Object.keys(result.checks).length - failedChecks.length,
  failed_checks: failedChecks,
  scenario_count: Object.keys(result.checks).filter(name => name.startsWith('scenario_')).length,
  journey_count: result.journeys.length,
  modal_layout_count: result.modal_layouts.length,
  runtime_error_case_count: result.runtime_errors.length,
  status: failedChecks.length === 0 && result.runtime_errors.length === 0 ? 'PASS' : 'FAIL'
};
writeFileSync(outputPath, JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({ result: outputPath, summary: result.summary }));
if (result.summary.status !== 'PASS') process.exitCode = 1;
