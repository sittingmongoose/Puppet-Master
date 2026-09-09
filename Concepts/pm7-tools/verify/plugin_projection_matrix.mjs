/* PMConcept7 Plugins System projection matrix.
 *
 * Browser-concept evidence only. Passing this verifier does not certify a
 * native Slint implementation, Plugins System runtime, production handlers,
 * durable receipts, EventRecord persistence, package mutation, or Doctor
 * repair behavior.
 *
 * Usage:
 *   node plugin_projection_matrix.mjs \
 *     --file /absolute/path/to/PMConcept7.html \
 *     --outdir /absolute/path/to/evidence-directory \
 *     --modules /path/containing/node_modules/playwright-core \
 *     --chromium /usr/bin/google-chrome \
 *     --expected-artifact-sha256 <sha256> --expected-verifier-sha256 <sha256> \
 *     --expected-helper-sha256 <sha256>
 */

import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import {
  BROWSER_ONLY_BOUNDARY,
  assertProvenanceAdmission,
  parseStrictVerifierArgs,
  prepareProvenanceRun
} from './browser_verifier_provenance.mjs';
const expectedCommands = [
  'cmd.agent_plugin.scan',
  'cmd.agent_plugin.install',
  'cmd.agent_plugin.update',
  'cmd.agent_plugin.enable',
  'cmd.agent_plugin.disable',
  'cmd.agent_plugin.reload',
  'cmd.agent_plugin.remove',
  'cmd.agent_plugin.validate',
  'cmd.agent_plugin.review_changes',
  'cmd.agent_plugin.rollback',
  'cmd.agent_plugin.open_details',
  'cmd.agent_plugin.open_logs'
].sort();
const expectedDoctorChecks = [
  'doctor.plugin.manifest_resolution',
  'doctor.plugin.conformance',
  'doctor.plugin.containment',
  'doctor.plugin.supply_chain',
  'doctor.plugin.permission_update_review',
  'doctor.plugin.runtime_bounds',
  'doctor.plugin.rollback_health',
  'doctor.plugin.promoted_routine_freshness'
].sort();
const detailTabs = ['overview', 'updates', 'access', 'evidence'];
const themes = ['friendly-dark', 'friendly-light', 'retro-dark', 'retro-light', 'basic-light', 'basic-dark', 'glass-dark', 'glass-light'];
const widths = [320, 520, 720, 980, 1440, 2200];

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
const artifactPath = resolve(args.file);
const evidencePath = join(resolve(args.outdir), 'plugin-projection.json');
const input = args.file;
mkdirSync(args.outdir, { recursive: true });
const requireFromRuntime = createRequire(join(args.modules, 'noop.js'));
const { chromium } = requireFromRuntime('playwright-core');
const provenanceRun = await prepareProvenanceRun({
  verifierUrl: import.meta.url,
  artifactPath,
  expectedArtifactSha256: args['expected-artifact-sha256'],
  expectedVerifierSha256: args['expected-verifier-sha256'],
  expectedHelperSha256: args['expected-helper-sha256'],
  modulesPath: args.modules,
  chromiumPath: args.chromium,
  command: cli,
  effectiveConfig: {
    verifier: 'plugin_projection_matrix',
    artifact_path: artifactPath,
    outdir: resolve(args.outdir),
    context_profiles: [
      'variable-widthx900,dpr1,en-US,UTC,dark',
      '1440x900,dpr1,en-US,UTC,dark,reduced-motion'
    ],
    timeout_ms: 180000,
    service_workers: 'block',
    accept_downloads: false,
    certification_mode: true
  }
});
const target = provenanceRun.artifactUrl();

mkdirSync(dirname(evidencePath), { recursive: true });
const screenshotDir = join(dirname(evidencePath), 'failure-screenshots');
const report = {
  schema_id: 'pm.pmconcept7.plugin_projection_browser_verification.v1',
  disposition: 'fail',
  certification_boundary: { ...BROWSER_ONLY_BOUNDARY },
  execution_boundary: { ...BROWSER_ONLY_BOUNDARY },
  target: input,
  target_url: target,
  target_sha256: provenanceRun.envelope.artifact.sha256,
  provenance: provenanceRun.envelope,
  deterministic_context: {
    widths,
    themes,
    viewport_height: 900,
    device_scale_factor: 1,
    locale: 'en-US',
    timezone_id: 'UTC',
    external_requests_blocked: true
  },
  checks: [],
  command_census: [],
  doctor_routes: [],
  geometry_rows: [],
  theme_rows: [],
  findings: [],
  runtime_errors: [],
  failure_screenshots: []
};

let page;
let screenshotSequence = 0;
function stable(value) { return value === undefined ? null : value; }
async function check(id, pass, evidence, summary) {
  const row = { id, pass: Boolean(pass), evidence: stable(evidence) };
  report.checks.push(row);
  if (row.pass) return row;
  const finding = { id, severity: 'error', summary: summary || `Verification failed: ${id}`, evidence: stable(evidence) };
  if (page && !page.isClosed()) {
    mkdirSync(screenshotDir, { recursive: true });
    const path = join(screenshotDir, `${String(++screenshotSequence).padStart(2, '0')}-${id.replace(/[^a-z0-9_-]+/gi, '-').toLowerCase()}.png`);
    try {
      await page.screenshot({ path, fullPage: false });
      finding.screenshot = path;
      report.failure_screenshots.push(path);
    } catch (error) {
      finding.screenshot_error = String(error);
    }
  }
  report.findings.push(finding);
  return row;
}

function sameJson(left, right) { return JSON.stringify(left) === JSON.stringify(right); }
function durationsImmediate(value) {
  if (!value) return true;
  return value.split(',').every(part => {
    const text = part.trim();
    const number = Number.parseFloat(text);
    return Number.isFinite(number) && number * (text.endsWith('ms') ? 1 : 1000) <= 1;
  });
}

let browser = null;

async function newCase({ caseId, width = 1440, reducedMotion = false } = {}) {
  if (!browser) throw new Error('bound browser is unavailable');
  const contextConfig = {
    viewport: { width, height: 900 },
    deviceScaleFactor: 1,
    locale: 'en-US',
    timezoneId: 'UTC',
    colorScheme: 'dark',
    reducedMotion: reducedMotion ? 'reduce' : 'no-preference',
    serviceWorkers: 'block',
    acceptDownloads: false
  };
  const context = await browser.newContext(contextConfig);
  await context.addInitScript(() => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      localStorage.setItem('pm.theme', 'friendly-dark');
    } catch (_error) {}
  });
  const guard = await provenanceRun.attachContext(context, { case_id: caseId, context_config: contextConfig });
  const current = await context.newPage();
  guard.instrumentPage(current);
  current.on('console', message => {
    if (message.type() === 'error') report.runtime_errors.push({ case_id: caseId, kind: 'console', text: message.text().slice(0, 1200) });
  });
  current.on('pageerror', error => report.runtime_errors.push({ case_id: caseId, kind: 'pageerror', text: String(error).slice(0, 1200) }));
  await guard.gotoBound(current, {
    navigation_id: `${caseId}:initial`,
    url: provenanceRun.artifactUrl({ case: caseId }),
    wait_until: 'load',
    timeout_ms: 180000
  });
  await current.waitForFunction(() => Boolean(window.PM12_KIMI && window.PM7_SYSTEMS_INTEGRATION && window.PM7_PLUGIN_COMMANDS), null, { timeout: 120000 });
  await current.evaluate(() => window.PM7_ONBOARDING_CINEMATIC?.skip?.());
  await current.evaluate(() => document.fonts.ready);
  await current.waitForTimeout(220);
  return { context, page: current };
}

async function openSettingsRoute(domain, workspace) {
  await page.locator('#tab-settings').click({ force: true });
  await page.waitForTimeout(90);
  await page.evaluate(({ domain, workspace }) => window.PM12_KIMI.navigate(domain, workspace), { domain, workspace });
  await page.waitForFunction(({ domain, workspace }) => {
    const state = window.PM12_KIMI?.getState?.();
    return document.getElementById('panel-settings')?.classList.contains('active') && state?.domain === domain && state?.workspace === workspace;
  }, { domain, workspace }, { timeout: 20000 });
  await page.waitForTimeout(80);
}

async function openPlugins(tab = 'overview') {
  await openSettingsRoute('code', 'toolchain');
  await page.evaluate(selectedTab => {
    window.PM12_KIMI.dispatchAction('tool-tab', { tab: 'plugins' });
    window.PM12_KIMI.dispatchAction('tool-detail-tab', { kind: 'plugins', tab: selectedTab });
  }, tab);
  await page.waitForFunction(selectedTab => {
    const state = window.PM12_KIMI?.getState?.();
    return state?.toolTab === 'plugins' && state?.toolDetailTab?.plugins === selectedTab
      && Boolean(document.querySelector('[data-plugin-owner-projection="true"]'));
  }, tab, { timeout: 10000 });
  await page.waitForTimeout(50);
}

async function closeTransient() {
  for (let index = 0; index < 3; index += 1) {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(20);
  }
}

async function pluginMutationSnapshot() {
  return page.evaluate(() => {
    const state = window.PM12_KIMI.getState();
    const storage = {};
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      const lower = key.toLowerCase();
      if (lower.includes('plugin') || lower.includes('receipt') || lower.includes('event')) storage[key] = localStorage.getItem(key);
    }
    return {
      plugins: state.toolchain?.plugins || null,
      selected_plugin: state.selectedTool?.plugins || null,
      production_receipt_dom_count: document.querySelectorAll('[data-production-receipt], [data-receipt-status="produced"], [data-event-record="emitted"]').length,
      storage
    };
  });
}

try {
  ({ browser } = await provenanceRun.launchChromium(chromium));
  const main = await newCase({ caseId: 'plugin-projection-main' });
  page = main.page;

  const declared = await page.evaluate(() => window.PM7_PLUGIN_COMMANDS.map(row => row.id).sort());
  await check('plugin.command_registry_exact_12', sameJson(declared, expectedCommands), { expected: expectedCommands, actual: declared }, 'The browser projection command registry is not the exact twelve canonical Plugins System commands.');

  const allControls = [];
  for (const tab of detailTabs) {
    await openPlugins(tab);
    const tabEvidence = await page.evaluate(expectedTab => ({
      state_tab: window.PM12_KIMI.getState().toolDetailTab?.plugins,
      active_tab: document.querySelector('.manager-tab.active[data-action="tool-detail-tab"]')?.dataset.tab || null,
      labels: [...document.querySelectorAll('.manager-tab[data-action="tool-detail-tab"]')].map(node => node.textContent.trim()),
      owner_projection: document.querySelector('[data-plugin-owner-projection="true"]')?.dataset.productionRuntimeState || null,
      document_overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      expected_tab: expectedTab
    }), tab);
    await check(`plugin.tab.${tab}.route_and_owner_projection`, tabEvidence.state_tab === tab && tabEvidence.active_tab === tab && tabEvidence.owner_projection === 'unavailable' && tabEvidence.document_overflow <= 0, tabEvidence, `Plugin detail tab ${tab} did not preserve its route or truthful owner boundary.`);
    const controls = await page.locator('[data-command-id^="cmd.agent_plugin."]').evaluateAll(nodes => nodes.map(node => ({
      command_id: node.dataset.commandId || null,
      text: (node.textContent || '').trim().replace(/\s+/g, ' '),
      availability: node.dataset.availability || null,
      disabled_reason: node.dataset.disabledReason || null,
      aria_disabled: node.getAttribute('aria-disabled'),
      hover_label: node.dataset.pmHoverLabel || null,
      hover_detail: node.dataset.pmHoverDetail || null,
      result_contract: node.dataset.commandResult || null,
      receipt_mode: node.dataset.receiptMode || null,
      event_record: node.dataset.eventRecord || null,
      mutation_dispatched: node.dataset.productionMutationDispatched || null,
      native_disabled_attribute: node.matches(':disabled'),
      tab_index: node.tabIndex
    })));
    allControls.push(...controls.map(row => ({ ...row, tab })));
  }
  report.command_census = allControls;
  const observed = [...new Set(allControls.map(row => row.command_id))].sort();
  await check('plugin.controls.exact_12_visible_across_routes', sameJson(observed, expectedCommands), { expected: expectedCommands, actual: observed, rows: allControls }, 'The visible Plugins workspace does not expose all and only the exact twelve canonical command controls.');
  const metadataFailures = allControls.filter(row => !row.command_id || row.availability !== 'handler_unavailable' || row.disabled_reason !== 'handler_unavailable' || row.aria_disabled !== 'true' || !row.hover_label || !row.hover_detail || row.result_contract !== 'PluginCommandResult' || row.receipt_mode !== 'owner_receipt_only' || row.event_record !== 'not_emitted' || row.mutation_dispatched !== 'false' || row.native_disabled_attribute || row.tab_index < 0);
  await check('plugin.controls.fail_closed_metadata', allControls.length > 0 && metadataFailures.length === 0, { total: allControls.length, failures: metadataFailures }, 'A Plugins command control lacks truthful handler-unavailable, hover, accessibility, result, receipt, EventRecord, or mutation metadata.');

  const interactionRows = [];
  for (const commandId of expectedCommands) {
    for (const tab of detailTabs) {
      await openPlugins(tab);
      if (await page.locator(`[data-command-id="${commandId}"]`).count()) break;
    }
    const control = page.locator(`[data-command-id="${commandId}"]`).first();
    const before = await pluginMutationSnapshot();
    await control.focus();
    const focus = await page.evaluate(expected => ({
      active_command: document.activeElement?.dataset?.commandId || null,
      aria_describedby: document.activeElement?.getAttribute('aria-describedby') || null,
      expected
    }), commandId);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(70);
    const drawer = await page.locator('#pm-settings-portals').evaluate(root => ({
      text: root.innerText || '',
      production_receipts: root.querySelectorAll('[data-production-receipt], [data-receipt-status="produced"]').length,
      emitted_events: root.querySelectorAll('[data-event-record="emitted"]').length
    }));
    const after = await pluginMutationSnapshot();
    const truthful = drawer.text.includes(commandId)
      && /handler_unavailable/i.test(drawer.text)
      && /no native Plugins System handler is attached/i.test(drawer.text)
      && /EventRecord not emitted/i.test(drawer.text)
      && /Not dispatched/i.test(drawer.text);
    const row = {
      command_id: commandId,
      focus,
      truthful,
      plugin_state_equal: sameJson(before.plugins, after.plugins) && before.selected_plugin === after.selected_plugin,
      plugin_storage_equal: sameJson(before.storage, after.storage),
      production_receipt_dom_delta: after.production_receipt_dom_count - before.production_receipt_dom_count,
      drawer_production_receipts: drawer.production_receipts,
      drawer_emitted_events: drawer.emitted_events,
      drawer_text: drawer.text.slice(0, 1400)
    };
    interactionRows.push(row);
    await closeTransient();
  }
  await check('plugin.controls.keyboard_focus_and_truthful_noop', interactionRows.every(row => row.focus.active_command === row.command_id && row.truthful && row.plugin_state_equal && row.plugin_storage_equal && row.production_receipt_dom_delta === 0 && row.drawer_production_receipts === 0 && row.drawer_emitted_events === 0), interactionRows, 'A keyboard-activated Plugins control mutated plugin state, fabricated production evidence, or failed to explain handler unavailability truthfully.');

  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    await openPlugins('overview');
    const geometry = await page.evaluate(widthValue => new Promise(resolveFrame => requestAnimationFrame(() => requestAnimationFrame(() => {
      const panel = document.getElementById('panel-settings');
      const root = panel?.querySelector('#pm-settings-root') || null;
      const rail = root?.querySelector('.domain-rail') || null;
      const topbar = root?.querySelector('.topbar') || null;
      const tabs = root?.querySelector('.workspace-tabs') || null;
      const manager = root?.querySelector('.manager-page') || null;
      const detail = root?.querySelector('.resource-detail') || null;
      const css = root ? getComputedStyle(root) : null;
      const rect = node => node ? node.getBoundingClientRect() : null;
      resolveFrame({
        width: widthValue, host: rect(panel),
        root: rect(root), rail: rect(rail), topbar: rect(topbar), tabs: rect(tabs), manager: rect(manager), detail: rect(detail),
        root_rail_token: css ? Number.parseFloat(css.getPropertyValue('--k3-rail-w')) : null,
        root_topbar_token: css ? Number.parseFloat(css.getPropertyValue('--k3-topbar-h')) : null,
        rail_position: rail ? getComputedStyle(rail).position : null,
        rail_transform: rail ? getComputedStyle(rail).transform : null,
        rail_open: root?.classList.contains('rail-open') || false,
        document_overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        body_overflow: document.body.scrollWidth - document.body.clientWidth,
        plugin_projection_visible: Boolean(document.querySelector('[data-plugin-owner-projection="true"]')),
        manager_tabs: [...(root?.querySelectorAll('.manager-tabs .manager-tab') || [])].map(node => node.textContent.trim())
      });
    }))));
    const hostWidth = geometry.host?.width;
    const expectedRail = hostWidth >= 1181 ? 250 : hostWidth >= 961 ? 215 : hostWidth >= 721 ? 76 : 0;
    const expectedTopbar = hostWidth <= 720 ? 55 : 62;
    const persistentRail = expectedRail > 0 && Math.abs(geometry.rail.width - expectedRail) <= 0.5 && !['absolute', 'fixed'].includes(geometry.rail_position);
    const mobileRail = expectedRail === 0 && geometry.rail.width > 0 && ['absolute', 'fixed'].includes(geometry.rail_position) && !geometry.rail_open && geometry.rail_transform !== 'none' && geometry.rail.right <= geometry.root.left + 0.5;
    const pass = geometry.root && geometry.topbar && geometry.tabs && geometry.manager && geometry.detail
      && Number.isFinite(hostWidth) && hostWidth > 0
      && Math.abs(geometry.root.width - hostWidth) <= 0.5
      && Math.abs(geometry.root_rail_token - expectedRail) <= 0.5
      && Math.abs(geometry.root_topbar_token - expectedTopbar) <= 0.5
      && Math.abs(geometry.topbar.height - expectedTopbar) <= 0.5
      && (persistentRail || mobileRail)
      && geometry.document_overflow <= 0 && geometry.body_overflow <= 0
      && geometry.plugin_projection_visible;
    const row = { ...geometry, expected: { host_width: hostWidth, rail: expectedRail, topbar: expectedTopbar }, persistent_rail: persistentRail, mobile_rail: mobileRail };
    report.geometry_rows.push(row);
    await check(`plugin.geometry.width_${width}`, pass, row, `The Plugins projection violated K3 shell geometry or overflow constraints at ${width}px.`);
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  await openPlugins('evidence');
  for (const theme of themes) {
    const row = await page.evaluate(selected => new Promise(resolveFrame => {
      document.documentElement.setAttribute('data-theme', selected);
      localStorage.setItem('pm.theme', selected);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        const banner = document.querySelector('[data-plugin-owner-projection="true"]');
        const button = document.querySelector('[data-command-id^="cmd.agent_plugin."]');
        resolveFrame({
          requested: selected,
          applied: document.documentElement.dataset.theme || null,
          banner_visible: Boolean(banner && banner.getBoundingClientRect().width > 0 && banner.getBoundingClientRect().height > 0),
          banner_background: banner ? getComputedStyle(banner).backgroundColor : null,
          button_color: button ? getComputedStyle(button).color : null,
          document_overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
        });
      }));
    }), theme);
    report.theme_rows.push(row);
    await check(`plugin.theme.${theme}`, row.applied === theme && row.banner_visible && row.document_overflow <= 0 && Boolean(row.banner_background) && Boolean(row.button_color), row, `The Plugins projection was not visible and overflow-free in ${theme}.`);
  }

  await openSettingsRoute('system', 'doctor');
  const doctorRows = await page.locator('[data-doctor-item]').evaluateAll(nodes => nodes.filter(node => node.querySelector('[data-check-id^="doctor.plugin."]')).map(node => {
    const control = node.querySelector('[data-action="doctor-open-owner"]');
    return {
      item_id: node.dataset.doctorItem || null,
      check_id: control?.dataset.checkId || null,
      command_id: control?.dataset.ownerCommandId || null,
      owner_route: control?.dataset.ownerRoute || null,
      availability: control?.dataset.availability || null,
      disabled: control?.matches(':disabled,[aria-disabled="true"]') || false,
      mutation_dispatched: node.dataset.productionMutationDispatched || control?.dataset.productionMutationDispatched || null
    };
  }));
  const observedDoctor = doctorRows.map(row => row.check_id).sort();
  await check('doctor.plugin_checks_exact_8', sameJson(observedDoctor, expectedDoctorChecks) && doctorRows.every(row => row.owner_route === 'code/toolchain' && row.command_id?.startsWith('cmd.agent_plugin.') && row.availability === 'available' && !row.disabled), { expected: expectedDoctorChecks, actual: observedDoctor, rows: doctorRows }, 'Doctor does not expose exactly eight enabled owner routes to the Plugins workspace.');

  for (const doctorRow of doctorRows) {
    await openSettingsRoute('system', 'doctor');
    const before = await page.evaluate(() => {
      const state = window.PM12_KIMI.getState();
      return { checked_at: state.doctorCheckedAt || null, checking: Boolean(state.doctorChecking), receipt: state.doctorReturnReceipt || null, plugins: state.toolchain?.plugins || null };
    });
    await page.locator(`[data-check-id="${doctorRow.check_id}"]`).click();
    await page.waitForFunction(() => {
      const state = window.PM12_KIMI.getState();
      return state.domain === 'code' && state.workspace === 'toolchain' && state.toolTab === 'plugins';
    }, null, { timeout: 10000 });
    const after = await page.evaluate(() => {
      const state = window.PM12_KIMI.getState();
      return {
        route: [state.domain, state.workspace],
        tool_tab: state.toolTab,
        detail_tab: state.toolDetailTab?.plugins || null,
        checked_at: state.doctorCheckedAt || null,
        checking: Boolean(state.doctorChecking),
        receipt: state.doctorReturnReceipt || null,
        context: state.doctorReturnContext || null,
        plugins: state.toolchain?.plugins || null,
        owner_projection: document.querySelector('[data-plugin-owner-projection="true"]')?.dataset.productionRuntimeState || null
      };
    });
    const routeRow = {
      ...doctorRow,
      before,
      after,
      no_doctor_result_mutation: before.checked_at === after.checked_at && before.checking === after.checking && sameJson(before.receipt, after.receipt),
      no_plugin_mutation: sameJson(before.plugins, after.plugins)
    };
    report.doctor_routes.push(routeRow);
    await check(`doctor.route.${doctorRow.check_id}`, sameJson(after.route, ['code', 'toolchain']) && after.tool_tab === 'plugins' && detailTabs.includes(after.detail_tab) && after.owner_projection === 'unavailable' && routeRow.no_doctor_result_mutation && routeRow.no_plugin_mutation && after.context?.checkId === doctorRow.check_id && after.context?.ownerActionId === doctorRow.command_id && after.context?.productionMutationDispatched === false && after.context?.browserProjectionOnly === true && after.context?.ownerResultRequired === true, routeRow, `${doctorRow.check_id} did not route truthfully to Plugins without Doctor or plugin mutation.`);
  }

  const reduced = await newCase({ caseId: 'plugin-projection-reduced', reducedMotion: true });
  page = reduced.page;
  await openPlugins('overview');
  const reducedEvidence = await page.evaluate(() => {
    document.documentElement.dataset.motion = 'reduced';
    const nodes = [document.querySelector('[data-plugin-owner-projection="true"]'), document.querySelector('.plugin-fact-card'), document.querySelector('[data-command-id^="cmd.agent_plugin."]')].filter(Boolean);
    return {
      media: matchMedia('(prefers-reduced-motion: reduce)').matches,
      motion: document.documentElement.dataset.motion,
      nodes: nodes.map(node => ({
        tag: node.tagName.toLowerCase(),
        animation_name: getComputedStyle(node).animationName,
        animation_duration: getComputedStyle(node).animationDuration,
        transition_duration: getComputedStyle(node).transitionDuration
      }))
    };
  });
  await check('plugin.reduced_motion_immediate', reducedEvidence.media && reducedEvidence.motion === 'reduced' && reducedEvidence.nodes.length === 3 && reducedEvidence.nodes.every(row => (row.animation_name === 'none' || durationsImmediate(row.animation_duration)) && durationsImmediate(row.transition_duration)), reducedEvidence, 'Plugins surfaces retain non-immediate animation or transition timing under reduced motion.');
  await reduced.context.close();
  page = main.page;

  await check('runtime.console_and_page_errors', report.runtime_errors.length === 0, report.runtime_errors, 'Console or page errors occurred during the Plugins projection matrix.');
  await main.context.close();
} catch (error) {
  report.runtime_errors.push({ kind: 'harness', text: String(error?.stack || error) });
  await check('harness.completed', false, { error: String(error?.stack || error) }, 'The Plugins projection verifier did not complete.');
} finally {
  try { await provenanceRun.finalizeBeforeBrowserClose(browser); }
  catch (error) { report.runtime_errors.push({ kind: 'provenance-pre-close', text: String(error?.stack || error) }); }
  if (browser) {
    try { await browser.close(); }
    catch (error) { report.runtime_errors.push({ kind: 'browser-close', text: String(error?.stack || error) }); }
  }
  try { report.provenance = await provenanceRun.finalizeAfterBrowserClose(); }
  catch (error) {
    report.runtime_errors.push({ kind: 'provenance-post-close', text: String(error?.stack || error) });
    report.provenance = provenanceRun.envelope;
  }
  let provenanceAdmissionError = null;
  try { assertProvenanceAdmission(report.provenance); }
  catch (error) { provenanceAdmissionError = String(error?.stack || error); }
  await check('shared_browser_provenance_admission', provenanceAdmissionError === null && report.provenance.admission?.pass === true, {
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
  }, 'The shared immutable browser-provenance envelope was not admitted.');
  await check('evidence_identity_and_browser_native_boundary',
    JSON.stringify(report.provenance.certification_boundary) === JSON.stringify(BROWSER_ONLY_BOUNDARY) &&
      JSON.stringify(report.certification_boundary) === JSON.stringify(BROWSER_ONLY_BOUNDARY) &&
      JSON.stringify(report.execution_boundary) === JSON.stringify(BROWSER_ONLY_BOUNDARY),
    {
      provenance_boundary: report.provenance.certification_boundary,
      certification_boundary: report.certification_boundary,
      execution_boundary: report.execution_boundary
    }, 'Browser-only certification boundary drifted or implied native/production evidence.');
  const failed = report.checks.filter(row => !row.pass).length;
  report.summary = { total: report.checks.length, passed: report.checks.length - failed, failed, runtime_errors: report.runtime_errors.length };
  report.disposition = failed === 0 && report.runtime_errors.length === 0 ? 'browser_checks_passed' : 'browser_findings_present';
  report.completed_at = new Date().toISOString();
  writeFileSync(evidencePath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify({ disposition: report.disposition, evidence: evidencePath, summary: report.summary }, null, 2));
  process.exitCode = report.disposition === 'browser_checks_passed' ? 0 : 1;
}
