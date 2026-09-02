/* PMConcept7 Server / Remote / Backup / Browser / Capture / SCM matrix.
 *
 * Browser-concept evidence only. A passing row never certifies native Slint,
 * production handlers, owner receipts, networking, backup media, or SCM state.
 * Missing native wiring is emitted as a finding instead of being inferred from
 * an animated concept preview.
 *
 * Usage:
 *   node backup_browser_scm_matrix.mjs \
 *     --file /absolute/path/to/PMConcept7.html \
 *     --outdir /absolute/path/to/evidence-directory \
 *     --modules /path/containing/node_modules/playwright-core \
 *     --chromium /usr/bin/google-chrome \
 *     --expected-artifact-sha256 <sha256> --expected-verifier-sha256 <sha256> \
 *     --expected-helper-sha256 <sha256>
 */

import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import {
  BROWSER_ONLY_BOUNDARY,
  assertProvenanceAdmission,
  parseStrictVerifierArgs,
  prepareProvenanceRun
} from './browser_verifier_provenance.mjs';

const digest = value => /^[0-9a-f]{64}$/.test(value);
const cli = parseStrictVerifierArgs(process.argv, {
  file: { required: true },
  outdir: { required: true },
  modules: { required: true },
  chromium: { required: true },
  'expected-artifact-sha256': { required: true, validate: digest },
  'expected-verifier-sha256': { required: true, validate: digest },
  'expected-helper-sha256': { required: true, validate: digest }
});
const args = cli.parsed_args;
const input = args.file;
const artifactPath = resolve(args.file);
const evidencePath = join(resolve(args.outdir), 'backup-browser-scm-matrix-results.json');
mkdirSync(args.outdir, { recursive: true });

let chromium;
let provenanceRun;
try {
  const requireFromRuntime = createRequire(join(args.modules, 'noop.js'));
  ({ chromium } = requireFromRuntime('playwright-core'));
  provenanceRun = await prepareProvenanceRun({
    verifierUrl: import.meta.url,
    artifactPath,
    expectedArtifactSha256: args['expected-artifact-sha256'],
    expectedVerifierSha256: args['expected-verifier-sha256'],
    expectedHelperSha256: args['expected-helper-sha256'],
    modulesPath: args.modules,
    chromiumPath: args.chromium,
    command: cli,
    effectiveConfig: {
      verifier: 'backup_browser_scm_matrix',
      artifact_path: artifactPath,
      outdir: resolve(args.outdir),
      context_profile: '1440x960,dpr1,en-US,UTC,dark,reduced-motion',
      timeout_ms: 180000,
      service_workers: 'block',
      certification_mode: true
    }
  });
} catch (error) {
  const failure = {
    schema_id: 'pm.pmconcept7.backup_browser_scm_matrix_provenance_failure.v1',
    disposition: 'provenance_preparation_failed',
    generated_at_utc: new Date().toISOString(),
    certification_boundary: { ...BROWSER_ONLY_BOUNDARY },
    execution_boundary: { ...BROWSER_ONLY_BOUNDARY },
    command: cli,
    error: { kind: 'provenance-preparation', text: String(error?.stack || error) },
    provenance: provenanceRun?.envelope || null
  };
  writeFileSync(evidencePath, `${JSON.stringify(failure, null, 2)}\n`);
  console.log(JSON.stringify({ disposition: failure.disposition, evidence: evidencePath }));
  process.exit(1);
}
const target = provenanceRun.artifactUrl();

const report = {
  schema_id: 'pm.pmconcept7.backup_browser_scm_matrix.v1',
  disposition: 'fail',
  certification_boundary: { ...BROWSER_ONLY_BOUNDARY },
  execution_boundary: { ...BROWSER_ONLY_BOUNDARY },
  target: input,
  target_url: target,
  target_sha256: provenanceRun.envelope.artifact.sha256,
  provenance: provenanceRun.envelope,
  deterministic_context: {
    viewport: { width: 1440, height: 960 },
    device_scale_factor: 1,
    locale: 'en-US',
    timezone_id: 'UTC',
    external_requests_blocked: true
  },
  checks: [],
  control_census: [],
  scenario_receipts: [],
  findings: [],
  runtime_errors: []
};

function stable(value) { return value === undefined ? null : value; }
function record(id, pass, evidence, options = {}) {
  const row = { id, pass: Boolean(pass), evidence: stable(evidence) };
  report.checks.push(row);
  if (!row.pass) {
    report.findings.push({
      id,
      severity: options.severity || 'error',
      summary: options.summary || `Verification failed: ${id}`,
      reproduction: options.reproduction || `Open ${input} and repeat ${id}.`,
      evidence: stable(evidence)
    });
  }
  return row;
}

function exactJson(value) { return JSON.stringify(value); }

let browser;
try {
  ({ browser } = await provenanceRun.launchChromium(chromium));
} catch (error) {
  report.runtime_errors.push({ kind: 'browser-launch', text: String(error?.stack || error) });
  try { report.provenance = await provenanceRun.finalizeAfterBrowserClose(); }
  catch (finalizeError) {
    report.runtime_errors.push({ kind: 'provenance-post-launch-failure', text: String(finalizeError?.stack || finalizeError) });
    report.provenance = provenanceRun.envelope;
  }
  report.summary = { checks: 0, passed: 0, failed: 0, runtime_errors: report.runtime_errors.length, findings: 1 };
  report.disposition = 'browser_findings_present';
  report.findings.push({ id: 'browser.launch', severity: 'error', summary: 'The bound browser could not be launched.', evidence: report.runtime_errors });
  writeFileSync(evidencePath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify({ disposition: report.disposition, evidence: evidencePath, summary: report.summary }, null, 2));
  process.exit(1);
}
let context;
let page;

async function closeTransient() {
  for (let index = 0; index < 3; index += 1) {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(20);
  }
}

async function openRoute(domain, workspace) {
  await closeTransient();
  await page.locator('#tab-settings').click({ force: true });
  await page.waitForTimeout(80);
  await page.evaluate(({ domain, workspace }) => window.PM12_KIMI.navigate(domain, workspace), { domain, workspace });
  await page.waitForFunction(({ domain, workspace }) => {
    const state = window.PM12_KIMI?.getState?.();
    return document.getElementById('panel-settings')?.classList.contains('active')
      && state?.domain === domain && state?.workspace === workspace;
  }, { domain, workspace }, { timeout: 20000 });
  await page.waitForTimeout(60);
}

async function dispatch(action, payload = {}) {
  return page.evaluate(({ action, payload }) => window.PM12_KIMI.dispatchAction(action, payload), { action, payload });
}

async function relevantState() {
  return page.evaluate(() => {
    const source = window.PM12_KIMI.getState();
    return JSON.parse(JSON.stringify({
      backup: source.backup,
      projectSync: source.projectSync,
      serverTab: source.serverTab,
      backupTab: source.backupTab,
      browserScmTab: source.browserScmTab
    }));
  });
}

async function portalText() {
  return page.locator('#pm-settings-portals').innerText().catch(() => '');
}

async function selectTab(action, tab, stateKey, rootSelector) {
  await dispatch(action, { tab });
  await page.waitForFunction(({ tab, stateKey, rootSelector }) => {
    const state = window.PM12_KIMI.getState();
    const active = document.querySelector(`${rootSelector} [data-action][data-tab="${tab}"].active`);
    return state?.[stateKey] === tab && Boolean(active);
  }, { tab, stateKey, rootSelector }, { timeout: 5000 });
  await page.waitForTimeout(30);
}

async function census(routeId, rootSelector, boundary) {
  const rows = await page.locator(rootSelector).evaluate((root, supplied) => {
    const selector = 'button,a[href],input,select,textarea,[role="button"],[tabindex]:not([tabindex="-1"])';
    const visible = node => {
      const style = getComputedStyle(node);
      const rect = node.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
    };
    return [...root.querySelectorAll(selector)].filter(visible).map((node, index) => {
      const commandId = node.dataset.commandId || null;
      const uiActionId = node.dataset.uiActionId || null;
      const typed = [commandId, uiActionId].filter(Boolean);
      const disabled = node.matches(':disabled,[aria-disabled="true"]');
      const explicitAvailability = node.dataset.availability || null;
      const availability = explicitAvailability || (disabled ? 'unavailable' : null);
      const destination = node.dataset.domain && node.dataset.workspace
        ? { domain: node.dataset.domain, workspace: node.dataset.workspace }
        : null;
      return {
        index,
        tag: node.tagName.toLowerCase(),
        text: (node.getAttribute('aria-label') || node.textContent || node.value || '').trim().replace(/\s+/g, ' ').slice(0, 180),
        action: node.dataset.action || null,
        command_id: commandId,
        ui_action_id: uiActionId,
        owner_command_id: node.dataset.ownerCommandId || null,
        typed_id_count: typed.length,
        typed_id: typed[0] || null,
        availability,
        availability_source: explicitAvailability ? 'control' : (disabled ? 'disabled_state' : 'missing'),
        disabled,
        disabled_reason: node.dataset.disabledReason || null,
        destination,
        reverse_visible_route: supplied.route,
        boundary: supplied.boundary
      };
    });
  }, { route: routeId, boundary });
  report.control_census.push({ route: routeId, root: rootSelector, boundary, controls: rows });
  const failures = rows.filter(row => row.typed_id_count !== 1 || row.availability_source !== 'control' || (row.disabled && !row.disabled_reason) || !row.boundary?.owner || !row.boundary?.simulation || !row.reverse_visible_route);
  record(`controls.${routeId}.touch_closure`, rows.length > 0 && failures.length === 0, {
    total: rows.length,
    failing: failures,
    rule: 'Every visible actionable control has exactly one command/UI action, explicit data-availability, disabled reason when disabled, owner/simulation boundary, and reverse visible route.'
  }, {
    summary: `${routeId} has visible controls with incomplete typed action, availability, disabled-reason, owner/simulation, or reverse-route metadata.`
  });
  return rows;
}

async function statePreservingScenario(id, action, payload, requiredText = []) {
  await closeTransient();
  const before = await relevantState();
  await dispatch(action, payload);
  await page.waitForTimeout(80);
  const text = await portalText();
  const after = await relevantState();
  const receipt = {
    id,
    action,
    payload,
    state_unchanged: exactJson(before) === exactJson(after),
    required_text: requiredText,
    required_text_present: requiredText.every(term => text.includes(term)),
    portal_text: text.slice(0, 3000),
    native_execution: 'not_performed'
  };
  report.scenario_receipts.push(receipt);
  record(id, receipt.state_unchanged && receipt.required_text_present, receipt, {
    summary: `${id} mutated concept owner state or omitted its preview/native-boundary disclosure.`
  });
  return receipt;
}

async function formPreviewScenario(id, action, dialogLabel, submitLabel, requiredText = []) {
  await closeTransient();
  const before = await relevantState();
  await dispatch(action, {});
  const dialog = page.locator('#pm-settings-portals').getByRole('dialog', { name: dialogLabel, exact: true });
  await dialog.getByRole('button', { name: submitLabel, exact: true }).click({ force: true });
  await page.waitForTimeout(50);
  const pageText = await page.locator('body').innerText();
  const after = await relevantState();
  const receipt = {
    id,
    action,
    dialog_label: dialogLabel,
    submit_label: submitLabel,
    state_unchanged: exactJson(before) === exactJson(after),
    required_text: requiredText,
    required_text_present: requiredText.every(term => pageText.includes(term)),
    body_excerpt: pageText.slice(-2500),
    native_execution: 'not_performed'
  };
  report.scenario_receipts.push(receipt);
  record(id, receipt.state_unchanged && receipt.required_text_present, receipt, {
    summary: `${id} mutated concept owner state or omitted its no-mutation acknowledgement.`
  });
  return receipt;
}

try {
  const contextConfig = {
    viewport: report.deterministic_context.viewport,
    deviceScaleFactor: 1,
    locale: 'en-US',
    timezoneId: 'UTC',
    colorScheme: 'dark',
    reducedMotion: 'reduce',
    serviceWorkers: 'block',
    acceptDownloads: false
  };
  context = await browser.newContext(contextConfig);
  await context.addInitScript(() => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      localStorage.setItem('pm.theme', 'friendly-dark');
    } catch (_error) {}
  });
  const guard = await provenanceRun.attachContext(context, { case_id: 'backup-browser-scm', context_config: contextConfig });
  page = await context.newPage();
  guard.instrumentPage(page);
  page.on('console', message => {
    if (message.type() === 'error') report.runtime_errors.push({ kind: 'console', text: message.text().slice(0, 1000) });
  });
  page.on('pageerror', error => report.runtime_errors.push({ kind: 'pageerror', text: String(error).slice(0, 1000) }));
  await guard.gotoBound(page, {
    navigation_id: 'backup-browser-scm:initial',
    url: provenanceRun.artifactUrl({ case: 'backup-browser-scm' }),
    wait_until: 'load',
    timeout_ms: 180000
  });
  await page.waitForFunction(() => Boolean(window.PM12_KIMI && window.PM7_SYSTEMS_INTEGRATION), null, { timeout: 120000 });
  await page.evaluate(() => window.PM7_ONBOARDING_CINEMATIC?.skip?.());
  await page.evaluate(() => document.fonts.ready);

  const boot = await page.evaluate(() => ({
    api: window.PM7_SYSTEMS_INTEGRATION,
    settings: window.PM12_KIMI?.version || null
  }));
  record('boot.simulation_boundary', boot.api?.schema_id === 'pm.pmconcept7.systems_projection.v1' && boot.api?.simulation_only === true, boot, {
    summary: 'The systems projection is absent or does not declare simulation_only=true.'
  });

  const serverBoundary = { owner: 'Server System / Remote Access System', simulation: 'concept fixture; owner feed not attached' };
  await openRoute('system', 'servers');
  for (const tab of ['claim', 'hosts', 'clients', 'deploy', 'backup', 'diagnostics']) {
    await selectTab('server-tab', tab, 'serverTab', '#workspace-servers');
    const text = await page.locator('#workspace-servers').innerText();
    record(`server.${tab}.visible_route`, text.length > 40, { route: 'system/servers', tab, text: text.slice(0, 1000) });
    await census(`system.servers.${tab}`, '#workspace-servers', serverBoundary);
  }
  await selectTab('server-tab', 'claim', 'serverTab', '#workspace-servers');
  await formPreviewScenario('server.claim.preview_no_mutation', 'open-server-claim', 'Claim existing server', 'Preview claim', ['Claim preview ready', 'No ownership changed']);
  await openRoute('system', 'servers');
  await formPreviewScenario('server.bootstrap.preview_no_mutation', 'open-server-bootstrap', 'Bootstrap server', 'Preview bootstrap', ['Bootstrap preview ready', 'No download, install, sync, or authority switch occurred']);

  const remoteBoundary = { owner: 'Project Sync and Remote Access owners', simulation: 'concept fixture; owner feed not attached' };
  await openRoute('projects', 'project-sync');
  await selectTab('project-sync-tab', 'remote', 'projectSyncTab', '#workspace-project-sync');
  const remoteBefore = await page.evaluate(() => JSON.stringify(window.PM12_KIMI.getState().projectSync.remotes));
  for (const [action, payload] of [
    ['add-ssh-remote', {}],
    ['import-remote-project', {}],
    ['edit-ssh-remote', { id: 'nas' }],
    ['test-ssh-remote', { id: 'nas' }],
    ['toggle-ssh-remote', { id: 'nas' }],
    ['remove-ssh-remote', { id: 'nas' }]
  ]) {
    await closeTransient();
    await dispatch(action, payload);
    await page.waitForTimeout(35);
  }
  const remoteAfter = await page.evaluate(() => JSON.stringify(window.PM12_KIMI.getState().projectSync.remotes));
  record('remote.ssh_crud_preview_no_mutation', remoteBefore === remoteAfter, { before: remoteBefore, after: remoteAfter, exercised: ['add', 'import', 'edit', 'test', 'toggle', 'remove'], native_execution: 'not_performed' }, {
    summary: 'A remote-project preview mutated the concept fixture instead of remaining owner-routed.'
  });
  await closeTransient();
  await census('projects.project_sync.remote', '#workspace-project-sync', remoteBoundary);

  const backupBoundary = { owner: 'Backup/Restore System', simulation: 'concept fixture; owner feed and production receipts not attached' };
  await openRoute('system', 'backup');
  for (const tab of ['overview', 'destinations', 'schedules', 'retention', 'restore', 'history']) {
    await selectTab('backup-tab', tab, 'backupTab', '#workspace-backup');
    const text = await page.locator('#workspace-backup').innerText();
    record(`backup.${tab}.visible_route`, text.length > 40, { route: 'system/backup', tab, text: text.slice(0, 1200) });
    await census(`system.backup.${tab}`, '#workspace-backup', backupBoundary);
  }
  await openRoute('system', 'backup');
  await statePreservingScenario('backup.full_server.preview', 'run-backup', {}, ['Full Server', 'Preview', 'No production receipt']);
  await openRoute('system', 'backup');
  await statePreservingScenario('backup.test_restore.preview', 'verify-latest-backup', {}, ['isolated restore', 'Preview', 'No production receipt']);

  const restoreCases = [
    ['full', 'Full Server', 'Isolated verification location'],
    ['project', 'Project and Vault metadata', 'Isolated verification location'],
    ['selected', 'Selected data families', 'Isolated verification location'],
    ['replacement', 'Full Server', 'Replacement server staging']
  ];
  for (const [caseId, scope, destination] of restoreCases) {
    await openRoute('system', 'backup');
    await selectTab('backup-tab', 'restore', 'backupTab', '#workspace-backup');
    const before = await relevantState();
    await dispatch('start-restore', {});
    await page.waitForSelector('#pm-settings-portals select[name="scope"]');
    await page.locator('#pm-settings-portals select[name="scope"]').selectOption({ label: scope });
    await page.locator('#pm-settings-portals input[name="destination"]').fill(destination);
    await page.getByRole('button', { name: 'Review preview', exact: true }).click({ force: true });
    await page.waitForTimeout(60);
    const text = await portalText();
    const after = await relevantState();
    const terms = [scope, destination, 'safety backup', 'Switch or roll back', 'No owner receipt', 'No data changed'];
    const row = {
      id: `backup.restore.${caseId}_preview`,
      scope,
      destination,
      state_unchanged: exactJson(before) === exactJson(after),
      required_text: terms,
      required_text_present: terms.every(term => text.includes(term)),
      portal_text: text.slice(0, 3000),
      native_execution: 'not_performed'
    };
    report.scenario_receipts.push(row);
    record(row.id, row.state_unchanged && row.required_text_present, row, {
      summary: `${caseId} restore preview changed concept state or omitted replace/rollback safety disclosure.`
    });
  }

  const consumerBoundary = { owner: 'Section 15 Browser / Test Capture / Source Control / Named Plan owners', simulation: 'PMConcept7 consumer projection only' };
  await openRoute('source', 'browser-scm');
  const tabs = ['browser', 'capture', 'scm', 'origin', 'plans', 'performance'];
  for (const tab of tabs) {
    await selectTab('browser-scm-tab', tab, 'browserScmTab', '#workspace-browser-scm');
    await census(`source.browser_scm.${tab}`, '#workspace-browser-scm', consumerBoundary);
  }

  await selectTab('browser-scm-tab', 'browser', 'browserScmTab', '#workspace-browser-scm');
  const browserText = await page.locator('#workspace-browser-scm').innerText();
  const authNegatives = ['human-only', 'non-recordable', 'non-inspectable', 'unavailable to agents and adapters', 'Ephemeral', 'Capture and replay', 'Automation', 'Export and restore'];
  record('browser.authbrowser_security_negatives', authNegatives.every(term => browserText.toLowerCase().includes(term.toLowerCase())), { required: authNegatives, text: browserText.slice(0, 2500) }, {
    summary: 'Protected AuthBrowser boundaries are missing from the visible browser route.'
  });
  const authControlCount = await page.locator('#workspace-browser-scm .systems-contract-card').filter({ hasText: 'AuthBrowserSession' }).locator('button,a,input,select,textarea,[role="button"]').count();
  record('browser.authbrowser_no_agent_or_capture_control', authControlCount === 0, { actionable_controls: authControlCount }, {
    summary: 'The protected AuthBrowser card exposes an actionable automation/capture surface.'
  });
  const webRoute = await page.locator('#workspace-browser-scm [data-action="navigate"][data-domain="ai"][data-workspace="web"]').evaluate(node => ({ action: node.dataset.action, ui_action_id: node.dataset.uiActionId, destination: [node.dataset.domain, node.dataset.workspace] }));
  await page.locator('#workspace-browser-scm [data-action="navigate"][data-domain="ai"][data-workspace="web"]').click({ force: true });
  await page.waitForFunction(() => { const state = window.PM12_KIMI.getState(); return state.domain === 'ai' && state.workspace === 'web'; });
  record('browser.handoff_reverse_visible_route', webRoute.ui_action_id === 'ui.settings.route.open' && webRoute.destination.join('/') === 'ai/web', webRoute, {
    summary: 'The PM-native Browser handoff lacks its typed action or reverse visible route.'
  });

  await openRoute('source', 'browser-scm');
  await selectTab('browser-scm-tab', 'capture', 'browserScmTab', '#workspace-browser-scm');
  await dispatch('open-capture-policy');
  const captureText = await portalText();
  const captureTerms = ['explicit', 'bounded', 'redacted', 'AuthBrowserSession', 'Never captured', 'Native certification', 'Not established'];
  record('capture.exclusions_and_certification_boundary', captureTerms.every(term => captureText.toLowerCase().includes(term.toLowerCase())), { required: captureTerms, text: captureText.slice(0, 2500) }, {
    summary: 'Capture policy omitted AuthBrowser exclusion, bounded/redacted collection, or native-certification separation.'
  });

  await openRoute('source', 'browser-scm');
  await selectTab('browser-scm-tab', 'scm', 'browserScmTab', '#workspace-browser-scm');
  const scmText = await page.locator('#workspace-browser-scm').innerText();
  const scmTerms = ['Git', 'Jujutsu', 'GitHub', 'GitLab', 'Azure DevOps', 'Bitbucket', 'Human AuthBrowser handoff', 'Disconnect', 'local history'];
  record('scm.git_jj_forge_owner_projection', scmTerms.every(term => scmText.includes(term)), { required: scmTerms, text: scmText.slice(0, 2500) }, {
    summary: 'SCM/Jujutsu/forge route omitted an owner, authentication, or local-history safety boundary.'
  });
  const scmRoute = await page.locator('#workspace-browser-scm [data-action="navigate"][data-domain="source"][data-workspace="source-manager"]').evaluate(node => ({ ui_action_id: node.dataset.uiActionId, destination: [node.dataset.domain, node.dataset.workspace] }));
  await page.locator('#workspace-browser-scm [data-action="navigate"][data-domain="source"][data-workspace="source-manager"]').click({ force: true });
  await page.waitForFunction(() => { const state = window.PM12_KIMI.getState(); return state.domain === 'source' && state.workspace === 'source-manager'; });
  record('scm.reverse_visible_owner_route', scmRoute.ui_action_id === 'ui.settings.route.open' && scmRoute.destination.join('/') === 'source/source-manager', scmRoute);

  await openRoute('source', 'browser-scm');
  await selectTab('browser-scm-tab', 'origin', 'browserScmTab', '#workspace-browser-scm');
  const originBefore = await relevantState();
  await dispatch('preview-origin');
  const originText = await portalText();
  const originAfter = await relevantState();
  const originTerms = ['Preview only', 'Optional', 'Local history', 'Preserved', 'Mirror', 'Not created', 'No production receipt'];
  record('origin.preview_no_mutation', exactJson(originBefore) === exactJson(originAfter) && originTerms.every(term => originText.includes(term)), { state_unchanged: exactJson(originBefore) === exactJson(originAfter), required: originTerms, text: originText.slice(0, 2500), native_execution: 'not_performed' }, {
    summary: 'Cursor Origin preview mutated SCM state or omitted its optional/no-mutation boundary.'
  });

  await openRoute('source', 'browser-scm');
  await selectTab('browser-scm-tab', 'plans', 'browserScmTab', '#workspace-browser-scm');
  await dispatch('open-named-plan');
  const planText = await portalText();
  const planTerms = ['Named Plan System', 'Owner feed', 'Not attached', 'Mutation', 'Unavailable'];
  record('named_plan.owner_route_and_unavailable_native_mutation', planTerms.every(term => planText.includes(term)), { required: planTerms, text: planText.slice(0, 2200) }, {
    summary: 'Named Plans does not expose a truthful owner/unavailable-native boundary.'
  });
  await closeTransient();
  await dispatch('open-planning-wizard');
  const planningRoute = await page.evaluate(() => ({ active: document.getElementById('tab-wizard')?.classList.contains('active') || false, page: window.PM_PAGES?.current || null }));
  record('named_plan.planning_wizard_reverse_route', planningRoute.active && planningRoute.page === 'wizard', planningRoute, {
    summary: 'Named Plans consumer did not retain its visible Planning Wizard return route.'
  });

  await openRoute('source', 'browser-scm');
  await selectTab('browser-scm-tab', 'performance', 'browserScmTab', '#workspace-browser-scm');
  const continuityText = await page.locator('#workspace-browser-scm').innerText();
  const continuityTerms = ['Reconnect', 'restart', 'sleep', 'external return', 'operation', 'session', 'stream', 'upload identity', 'stale generations'];
  record('remote.continuity_reconnect_restart_sleep', continuityTerms.every(term => continuityText.toLowerCase().includes(term.toLowerCase())), { required: continuityTerms, text: continuityText.slice(0, 2200), native_execution: 'not_performed' }, {
    summary: 'Reconnect/restart/sleep/external-return continuity identities are not visible in the concept route.'
  });

  const nativeGaps = report.control_census.flatMap(route => route.controls
    .filter(control => control.typed_id_count !== 1 || control.availability_source !== 'control')
    .map(control => ({ route: route.route, action: control.action, text: control.text, typed_id_count: control.typed_id_count, availability: control.availability, availability_source: control.availability_source })));
  record('aggregate.native_and_touch_closure_gaps_reported', nativeGaps.length === 0, { gap_count: nativeGaps.length, gaps: nativeGaps }, {
    severity: 'warning',
    summary: 'Visible concept controls still lack complete typed-action/availability metadata; no native handler success is claimed.'
  });
} catch (error) {
  report.runtime_errors.push({ kind: 'harness', text: error?.stack || String(error) });
  report.findings.push({ id: 'harness.unhandled_error', severity: 'error', summary: 'The deterministic verifier did not finish.', reproduction: `Run this verifier against ${input}.`, evidence: String(error?.stack || error) });
} finally {
  if (context) {
    try { await context.close(); }
    catch (error) { report.runtime_errors.push({ kind: 'context-close', text: String(error?.stack || error) }); }
  }
  try { await provenanceRun.finalizeBeforeBrowserClose(browser); }
  catch (error) { report.runtime_errors.push({ kind: 'provenance-pre-close', text: String(error?.stack || error) }); }
  try { await browser.close(); }
  catch (error) { report.runtime_errors.push({ kind: 'browser-close', text: String(error?.stack || error) }); }
  try { report.provenance = await provenanceRun.finalizeAfterBrowserClose(); }
  catch (error) {
    report.runtime_errors.push({ kind: 'provenance-post-close', text: String(error?.stack || error) });
    report.provenance = provenanceRun.envelope;
  }

  let provenanceAdmissionError = null;
  try { assertProvenanceAdmission(report.provenance); }
  catch (error) { provenanceAdmissionError = String(error?.stack || error); }
  record('shared_browser_provenance_admission', provenanceAdmissionError === null && report.provenance.admission?.pass === true, {
    admission: report.provenance.admission,
    error: provenanceAdmissionError,
    artifact: report.provenance.artifact,
    verifier: report.provenance.verifier,
    helper: report.provenance.helper,
    browser: report.provenance.browser,
    command: report.provenance.command,
    navigation_count: report.provenance.navigations?.length,
    network: report.provenance.network,
    certification_boundary: report.provenance.certification_boundary
  }, {
    summary: 'The shared immutable browser-provenance envelope was not admitted.'
  });
  record('evidence.exact_browser_only_boundary',
    JSON.stringify(report.provenance.certification_boundary) === JSON.stringify(BROWSER_ONLY_BOUNDARY) &&
      JSON.stringify(report.certification_boundary) === JSON.stringify(BROWSER_ONLY_BOUNDARY) &&
      JSON.stringify(report.execution_boundary) === JSON.stringify(BROWSER_ONLY_BOUNDARY),
    {
      provenance_boundary: report.provenance.certification_boundary,
      certification_boundary: report.certification_boundary,
      execution_boundary: report.execution_boundary
    }, {
      summary: 'The report boundary differs from the exact shared browser-concept-only boundary.'
    });
  record('shared_provenance_runtime_clean', report.runtime_errors.length === 0 && report.provenance.runtime_errors.count === 0, {
    verifier: report.runtime_errors,
    provenance: report.provenance.runtime_errors
  }, {
    summary: 'The verifier or shared provenance envelope observed runtime errors.'
  });
  const failed = report.checks.filter(row => !row.pass).length;
  report.summary = {
    checks: report.checks.length,
    passed: report.checks.length - failed,
    failed,
    control_routes: report.control_census.length,
    controls: report.control_census.reduce((sum, route) => sum + route.controls.length, 0),
    scenarios: report.scenario_receipts.length,
    runtime_errors: report.runtime_errors.length,
    findings: report.findings.length
  };
  report.disposition = failed === 0 && report.runtime_errors.length === 0 ? 'browser_checks_passed' : 'browser_findings_present';
  writeFileSync(evidencePath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify({ disposition: report.disposition, evidence: evidencePath, summary: report.summary }, null, 2));
  process.exitCode = report.disposition === 'browser_checks_passed' ? 0 : 1;
}
