/* Deterministic PMConcept7 Settings command/transaction browser verification.
 *
 * Usage:
 *   node settings_transactions.mjs --file <generated-PMConcept7.html> \
 *     --outdir <evidence-dir> --modules <dir-containing-node_modules> \
 *     --chromium /usr/bin/google-chrome \
 *     --expected-artifact-sha256 <sha256> --expected-verifier-sha256 <sha256> \
 *     --expected-helper-sha256 <sha256>
 *
 * This runner verifies browser-concept simulation only. It does not certify a
 * native Slint implementation, production Settings owner, or native handler.
 */

import { createRequire } from 'node:module';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
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

const artifactPath = resolve(args.file);
const outputPath = join(resolve(args.outdir), 'settings-transactions-results.json');
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
    verifier: 'settings_transactions',
    artifact_path: artifactPath,
    outdir: resolve(args.outdir),
    context_profile: '1280x900,dpr1,en-US,UTC,dark,reduced-motion',
    timeout_ms: 120000,
    service_workers: 'block',
    certification_mode: true
  }
});
mkdirSync(args.outdir, { recursive: true });
const sourceBytes = readFileSync(artifactPath);
const sourceText = sourceBytes.toString('utf8');
const settingsBridgeExpected = /window\.PM7_SETTINGS_COMMANDS\s*=\s*\{/.test(sourceText);
const deferGlobalHoverCensus = settingsBridgeExpected && /window\.PM_HOVER_TAG_CONTROLLER\s*=\s*controller/.test(sourceText);

const report = {
  schema_id: 'pm.pmconcept7.settings_transaction_browser_verification.v1',
  generated_at_utc: new Date().toISOString(),
  disposition: 'fail',
  certification_boundary: { ...BROWSER_ONLY_BOUNDARY },
  execution_boundary: { ...BROWSER_ONLY_BOUNDARY },
  artifact: args.file,
  artifact_sha256: provenanceRun.envelope.artifact.sha256,
  verifier: {
    path: provenanceRun.envelope.verifier.real_path,
    sha256: provenanceRun.envelope.verifier.sha256
  },
  url: provenanceRun.artifactUrl(),
  provenance: provenanceRun.envelope,
  source_assumptions: [
    settingsBridgeExpected
      ? 'The full generated candidate declares window.PM7_SETTINGS_COMMANDS and must expose it with window.PM7_SETTINGS_TOME and window.PM12_KIMI.'
      : 'The T44-only intermediate precedes the Settings command-bridge transform; it must expose window.PM7_SETTINGS_TOME and window.PM12_KIMI, while bridge-dependent checks remain explicitly not run.',
    deferGlobalHoverCensus
      ? 'The full-candidate Settings suite defers exactly one T47 DOMContentLoaded census listener because the global hover system has an independent verifier; all Settings, command-bridge, and page errors remain observable.'
      : 'No global hover census listener is deferred for this artifact.',
    'The selected project fixture is non-secret concept data; tests use a fresh browser context and do not attach a production Settings owner.',
    'Owner acceptance, rejection, stale revision, receipts, and exact return are deterministic injected browser-host responses, not native runtime evidence.',
    'Import/export UI checks validate route and preview wiring only; they do not write an archive or credential material.',
    'Inventory completeness is compared with the inert canonical PM_SETTINGS_DATA projection and virtualization is asserted from mounted rows versus model rows.'
  ],
  deterministic_context: {
    viewport: { width: 1280, height: 900 },
    device_scale_factor: 1,
    locale: 'en-US',
    timezone_id: 'UTC',
    external_requests_blocked: true,
    reduced_motion_default: true,
    global_hover_census_deferred_for_settings_suite: deferGlobalHoverCensus
  },
  execution_scope: settingsBridgeExpected ? 'full_candidate' : 't44_only_intermediate',
  checks: [],
  runtime_errors: []
};

function record(id, pass, evidence) {
  report.checks.push({ id, pass: Boolean(pass), evidence: evidence === undefined ? null : evidence });
}
function notRun(id, reason) {
  report.checks.push({ id, pass: null, disposition: 'not_run', evidence: { reason, execution_scope: report.execution_scope } });
}
function ids(rows) { return rows.map(row => row.command_id); }

const settingsScriptMatch = sourceText.match(/<script id="pm4-settings-js">([\s\S]*?)<\/script>/);
const settingsScriptSource = settingsScriptMatch?.[1] || '';
record('authored_settings_source_has_no_native_titles', Boolean(settingsScriptSource) && !/\stitle="/.test(settingsScriptSource) && /data-pm-hover-label="Page options"/.test(settingsScriptSource) && /data-pm-hover-detail="Preview this notification sound\."/.test(settingsScriptSource), {
  settings_script_found: Boolean(settingsScriptSource),
  native_title_attribute_count: (settingsScriptSource.match(/\stitle="/g) || []).length,
  shared_hover_label_count: (settingsScriptSource.match(/data-pm-hover-label=/g) || []).length
});
const requiredSearchTokens = [
  'stable_id:setting.id', 'description:setting.description||canonical.desc', 'aliases:[...(canonical.search||[])',
  'destination_metadata:Object.values(destination)', '(canonical.curated===true||setting.curated===true?40:0)',
  "(exposure==='simple'?22:0)", "(ownerStatus!=='ok'?10:0)", 'matches.slice(0,60)',
  'allSettingsQueryTimer=setTimeout', '},80)', 'data-filter="category"', 'data-filter="exposure"',
  'data-filter="control"', 'data-filter="applicability"', 'data-filter="ownerStatus"', 'data-filter="resultType"'
];
record('ssys005_authored_search_contract', requiredSearchTokens.every(token => settingsScriptSource.includes(token)), {
  required_token_count: requiredSearchTokens.length,
  missing: requiredSearchTokens.filter(token => !settingsScriptSource.includes(token))
});

const { browser } = await provenanceRun.launchChromium(chromium);
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
const context = await browser.newContext(contextConfig);
if (deferGlobalHoverCensus) {
  await context.addInitScript(() => {
    const original = Document.prototype.addEventListener;
    window.__PM7_SETTINGS_VERIFIER_DEFERRED_T47_COUNT = 0;
    Document.prototype.addEventListener = function(type, listener, options) {
      const source = typeof listener === 'function' ? Function.prototype.toString.call(listener) : '';
      if (this === document && type === 'DOMContentLoaded' && /controller\.start\(\)/.test(source)) {
        window.__PM7_SETTINGS_VERIFIER_DEFERRED_T47_COUNT += 1;
        return;
      }
      return original.call(this, type, listener, options);
    };
    original.call(document, 'DOMContentLoaded', () => { Document.prototype.addEventListener = original; }, { once: true, capture: true });
  });
}
const guard = await provenanceRun.attachContext(context, { case_id: 'settings-transactions', context_config: contextConfig });
const page = await context.newPage();
guard.instrumentPage(page);
page.on('console', message => {
  if (message.type() === 'error') report.runtime_errors.push({ kind: 'console', text: message.text().slice(0, 600) });
});
page.on('pageerror', error => report.runtime_errors.push({ kind: 'pageerror', text: String(error).slice(0, 600) }));

try {
  await guard.gotoBound(page, {
    navigation_id: 'settings-transactions:initial',
    url: provenanceRun.artifactUrl({ case: 'settings-transactions' }),
    wait_until: 'load',
    timeout_ms: 120000
  });
  await page.waitForFunction(expectBridge => Boolean(window.PM7_SETTINGS_TOME && window.PM12_KIMI && (!expectBridge || window.PM7_SETTINGS_COMMANDS)), settingsBridgeExpected, { timeout: 120000 });

  const boundary = await page.evaluate(() => ({
    systems_schema_id: window.PM7_SYSTEMS_INTEGRATION?.schema_id || null,
    simulation_only: window.PM7_SYSTEMS_INTEGRATION?.simulation_only,
    settings_bridge_schema_id: window.PM7_SETTINGS_COMMANDS?.schema_id || null,
    tome_version: window.PM12_KIMI?.version || null,
    owner_registry_attached: Boolean(window.PM_SETTINGS_REGISTRY),
    deferred_global_hover_start_count: window.__PM7_SETTINGS_VERIFIER_DEFERRED_T47_COUNT || 0
  }));
  record('artifact_scope_preflight', (settingsBridgeExpected ? boundary.settings_bridge_schema_id === 'pm.settings.command_bridge.v1' : boundary.settings_bridge_schema_id === null) && (!deferGlobalHoverCensus || boundary.deferred_global_hover_start_count === 1), {
    execution_scope: report.execution_scope,
    source_declares_settings_bridge: settingsBridgeExpected,
    runtime_settings_bridge_schema_id: boundary.settings_bridge_schema_id,
    global_hover_census_deferred_for_settings_suite: deferGlobalHoverCensus,
    deferred_global_hover_start_count: boundary.deferred_global_hover_start_count
  });
  record('concept_simulation_boundary', (boundary.systems_schema_id === null || boundary.simulation_only === true) && boundary.owner_registry_attached === false && (settingsBridgeExpected ? boundary.settings_bridge_schema_id === 'pm.settings.command_bridge.v1' : boundary.settings_bridge_schema_id === null), boundary);

  const projectThemeDefaults = await page.evaluate(() => {
    delete window.PM_SETTINGS_REGISTRY;
    const hadExplicit = Object.prototype.hasOwnProperty.call(window, 'PM_ACTIVE_PROJECT_ID');
    const originalExplicit = window.PM_ACTIVE_PROJECT_ID;
    const prefix = 'pm7:settings:tome-tabs:v1:';
    const keys = () => Object.keys(localStorage).filter(key => key.startsWith(prefix)).sort();
    const beforeNoProject = keys();
    window.PM_ACTIVE_PROJECT_ID = '';
    window.PM12_KIMI.reloadProject();
    const noProjectState = window.PM12_KIMI.getState();
    const noProjectWrite = window.PM12_KIMI.setSettingFromHost('general.visual.theme', 'Retro Light');
    const noProject = {
      theme: noProjectState.settings['general.visual.theme'],
      mode: noProjectState.settings['general.visual.theme-mode'],
      write_accepted: noProjectWrite,
      storage_keys_unchanged: JSON.stringify(keys()) === JSON.stringify(beforeNoProject)
    };

    const freshId = 'pm7-verifier-fresh-project';
    const freshKey = prefix + encodeURIComponent(freshId);
    localStorage.removeItem(freshKey);
    window.PM_ACTIVE_PROJECT_ID = freshId;
    window.PM12_KIMI.reloadProject();
    const freshState = window.PM12_KIMI.getState();
    const fresh = {
      theme: freshState.settings['general.visual.theme'],
      mode: freshState.settings['general.visual.theme-mode'],
      storage_allocated_by_read: localStorage.getItem(freshKey) !== null
    };

    const savedId = 'pm7-verifier-saved-project';
    const savedKey = prefix + encodeURIComponent(savedId);
    localStorage.setItem(savedKey, JSON.stringify({
      schema_version: 'pm7.settings.project_projection.v1',
      settings: { 'general.visual.theme': 'Retro Light', 'general.visual.glass-transparency': 0.2 },
      changed: { 'general.visual.theme': true }
    }));
    window.PM_ACTIVE_PROJECT_ID = savedId;
    window.PM12_KIMI.reloadProject();
    const savedState = window.PM12_KIMI.getState();
    const repaired = JSON.parse(localStorage.getItem(savedKey) || '{}');
    const saved = {
      theme: savedState.settings['general.visual.theme'],
      mode: savedState.settings['general.visual.theme-mode'],
      alpha: savedState.settings['general.visual.glass-transparency'],
      persisted_theme: repaired.settings?.['general.visual.theme'],
      persisted_alpha: repaired.settings?.['general.visual.glass-transparency']
    };

    localStorage.removeItem(freshKey);
    localStorage.removeItem(savedKey);
    if (hadExplicit) window.PM_ACTIVE_PROJECT_ID = originalExplicit;
    else delete window.PM_ACTIVE_PROJECT_ID;
    window.PM12_KIMI.reloadProject();
    return { no_project: noProject, fresh_project: fresh, saved_project: saved };
  });
  record('no_project_ephemeral_basic_dark', projectThemeDefaults.no_project.theme === 'Basic Dark' && projectThemeDefaults.no_project.mode === 'Dark' && projectThemeDefaults.no_project.write_accepted === false && projectThemeDefaults.no_project.storage_keys_unchanged, projectThemeDefaults.no_project);
  record('fresh_project_basic_dark', projectThemeDefaults.fresh_project.theme === 'Basic Dark' && projectThemeDefaults.fresh_project.mode === 'Dark' && projectThemeDefaults.fresh_project.storage_allocated_by_read === false, projectThemeDefaults.fresh_project);
  record('saved_project_theme_wins_and_repairs_alpha', projectThemeDefaults.saved_project.theme === 'Retro Light' && projectThemeDefaults.saved_project.mode === 'Light' && projectThemeDefaults.saved_project.alpha === 0.45 && projectThemeDefaults.saved_project.persisted_theme === 'Retro Light' && projectThemeDefaults.saved_project.persisted_alpha === 0.45, projectThemeDefaults.saved_project);

  const eightThemeBridge = await page.evaluate(() => {
    const hadExplicit = Object.prototype.hasOwnProperty.call(window, 'PM_ACTIVE_PROJECT_ID');
    const originalExplicit = window.PM_ACTIVE_PROJECT_ID;
    const projectId = 'pm7-verifier-eight-themes';
    const storageKey = 'pm7:settings:tome-tabs:v1:' + encodeURIComponent(projectId);
    localStorage.removeItem(storageKey);
    window.PM_ACTIVE_PROJECT_ID = projectId;
    window.PM12_KIMI.reloadProject();
    const themes = ['Friendly Dark', 'Friendly Light', 'Glass Dark', 'Glass Light', 'Retro Dark', 'Retro Light', 'Basic Dark', 'Basic Light'];
    const variants = themes.map(theme => {
      const accepted = window.PM12_KIMI.setSettingFromHost('general.visual.theme', theme);
      const expectedSlug = theme.toLowerCase().replace(/\s+/g, '-');
      const expectedScheme = / Light$/.test(theme) ? 'light' : 'dark';
      return {
        theme, accepted, expected_slug: expectedSlug, expected_scheme: expectedScheme,
        data_theme: document.documentElement.getAttribute('data-theme'),
        panel_color_scheme: getComputedStyle(document.getElementById('panel-settings')).colorScheme
      };
    });
    window.PM12_KIMI.setSettingFromHost('general.visual.theme', 'Glass Dark');
    const darkLowAccepted = window.PM12_KIMI.setSettingFromHost('general.visual.glass-transparency', 0.1);
    const darkLow = window.PM12_KIMI.getState().settings['general.visual.glass-transparency'];
    const darkHighAccepted = window.PM12_KIMI.setSettingFromHost('general.visual.glass-transparency', 150);
    const darkHigh = window.PM12_KIMI.getState().settings['general.visual.glass-transparency'];
    window.PM12_KIMI.setSettingFromHost('general.visual.theme', 'Glass Light');
    const lightLowAccepted = window.PM12_KIMI.setSettingFromHost('general.visual.glass-transparency', 0.1);
    const lightLow = window.PM12_KIMI.getState().settings['general.visual.glass-transparency'];
    const persisted = JSON.parse(localStorage.getItem(storageKey) || '{}');
    const glass = {
      accepted: darkLowAccepted && darkHighAccepted && lightLowAccepted,
      dark_low: darkLow,
      dark_high: darkHigh,
      light_low: lightLow,
      live_alpha: Number(document.documentElement.style.getPropertyValue('--glass-alpha')),
      persisted_alpha: persisted.settings?.['general.visual.glass-transparency']
    };
    localStorage.removeItem(storageKey);
    if (hadExplicit) window.PM_ACTIVE_PROJECT_ID = originalExplicit;
    else delete window.PM_ACTIVE_PROJECT_ID;
    window.PM12_KIMI.reloadProject();
    return { variants, glass };
  });
  record('all_eight_theme_ua_color_schemes', eightThemeBridge.variants.length === 8 && eightThemeBridge.variants.every(row => row.accepted && row.data_theme === row.expected_slug && row.panel_color_scheme === row.expected_scheme), eightThemeBridge.variants);
  record('glass_alpha_live_and_persisted_clamp', eightThemeBridge.glass.accepted && eightThemeBridge.glass.dark_low === 0.35 && eightThemeBridge.glass.dark_high === 1 && eightThemeBridge.glass.light_low === 0.45 && eightThemeBridge.glass.live_alpha === 0.45 && eightThemeBridge.glass.persisted_alpha === 0.45, eightThemeBridge.glass);

  if (settingsBridgeExpected) {
    const openResult = await page.evaluate(() => {
      const result = window.PM7_SETTINGS_COMMANDS.open({ domain: 'general', workspace: 'app-input', options: { detailSetting: 'general.interaction.show-tooltips' } });
      const state = window.PM12_KIMI.getState();
      return {
        result,
        active: document.getElementById('panel-settings')?.classList.contains('active'),
        domain: state.domain,
        workspace: state.workspace,
        detail_setting: state.detailSetting
      };
    });
    record('cmd_settings_open_exact_route', openResult.result?.command_id === 'cmd.settings.open' && openResult.active && openResult.domain === 'general' && openResult.workspace === 'app-input' && openResult.detail_setting === 'general.interaction.show-tooltips', openResult);

    const blocked = await page.evaluate(() => {
      const prior = window.PM_SETTINGS_RUNTIME_CONTEXT;
      window.PM_SETTINGS_RUNTIME_CONTEXT = {};
      const response = window.PM7_SETTINGS_COMMANDS.preview({ expected_revision: 4, changes: [{ setting_id: 'general.visual.theme', value: 'Glass Dark' }] });
      window.PM_SETTINGS_RUNTIME_CONTEXT = prior;
      return response;
    });
    record('transaction_disabled_reason_missing_context', blocked.mode === 'blocked_runtime_context' && blocked.preview?.request?.command_id === 'cmd.settings.transaction.preview' && ['project_home_server_id', 'execution_host_id', 'execution_environment_id', 'actor_ref', 'permission_snapshot_ref', 'binding_sha256'].every(field => blocked.missing.includes(field)), blocked);

    const commands = await page.evaluate(() => {
      const captured = [];
      window.PM_SETTINGS_RUNTIME_CONTEXT = {
        project_home_server_id: 'server:test-home', execution_host_id: 'host:test', execution_environment_id: 'env:test',
        actor_ref: 'actor:test', permission_snapshot_ref: 'permission:test', topology_generation: 7,
        binding_sha256: 'a'.repeat(64), source_location_id: 'location:test'
      };
      window.PM_DISPATCH_COMMAND = request => {
        captured.push(JSON.parse(JSON.stringify(request)));
        return { ok: true, terminal: true, status: 'accepted', result_receipt_ref: `receipt:${request.command_id}` };
      };
      const bridge = window.PM7_SETTINGS_COMMANDS;
      const responses = [
        bridge.preview({ expected_revision: 10, changes: [{ setting_id: 'general.visual.theme', value: 'Glass Dark' }] }),
        bridge.apply({ expected_revision: 10, preview_receipt_ref: 'preview:10' }),
        bridge.rollback({ transaction_receipt_ref: 'transaction:10', expected_revision: 11 }),
        bridge.export({ format: 'json', redact: true, include_credential_references: false })
      ];
      return { captured, responses };
    });
    const expectedCommands = ['cmd.settings.transaction.preview', 'cmd.settings.transaction.apply', 'cmd.settings.transaction.rollback', 'cmd.settings.export'];
    record('typed_transaction_command_bridge', JSON.stringify(ids(commands.captured)) === JSON.stringify(expectedCommands) && commands.responses.every(row => row.mode === 'host_result'), commands);
    record('command_request_envelope_and_payloads', commands.captured.every(row => row.schema_id === 'pm.shared_runtime.command_request.v1' && row.project_id && row.execution_host_id === 'host:test' && row.execution_environment_id === 'env:test' && row.idempotency?.binding_sha256 === 'a'.repeat(64) && row.idempotency?.idempotency_key) && commands.captured[0].expected_revision === 10 && commands.captured[1].preview_receipt_ref === 'preview:10' && commands.captured[2].transaction_receipt_ref === 'transaction:10' && commands.captured[3].redact === true, commands.captured);

    const stale = await page.evaluate(() => {
      window.PM_DISPATCH_COMMAND = request => ({
        ok: false,
        status: 'rejected',
        error_code: 'settings_revision_stale',
        expected_revision: request.expected_revision,
        effective_revision: 12,
        safe_user_message: 'Settings changed elsewhere. Refresh and preview again.'
      });
      return window.PM7_SETTINGS_COMMANDS.apply({ expected_revision: 9, preview_receipt_ref: 'preview:stale' });
    });
    record('stale_revision_exact_error_projection', stale.mode === 'host_rejected' && stale.request?.command_id === 'cmd.settings.transaction.apply' && stale.result?.error_code === 'settings_revision_stale' && stale.result?.effective_revision === 12 && stale.error === 'Settings changed elsewhere. Refresh and preview again.', stale);
  } else {
    const reason = 'The T44-only intermediate intentionally precedes the transform that authors window.PM7_SETTINGS_COMMANDS; run these cases against a full candidate.';
    for (const id of ['cmd_settings_open_exact_route', 'transaction_disabled_reason_missing_context', 'typed_transaction_command_bridge', 'command_request_envelope_and_payloads', 'stale_revision_exact_error_projection']) notRun(id, reason);
  }

  const exactReturn = await page.evaluate(() => {
    const returned = [];
    const listener = event => returned.push(event.detail);
    window.addEventListener('pm7.settings.command.returned', listener);
    window.PM_SETTINGS_RUNTIME_CONTEXT = {
      project_home_server_id: 'server:test-home', execution_host_id: 'host:test', execution_environment_id: 'env:test',
      actor_ref: 'actor:test', permission_snapshot_ref: 'permission:test', topology_generation: 7,
      binding_sha256: 'a'.repeat(64), source_location_id: 'location:test'
    };
    window.PM_DISPATCH_COMMAND = () => ({ pending: true });
    const dispatched = window.PM7_SETTINGS_TOME.dispatch('cmd.settings.transaction.preview', { expected_revision: 12 }, {
      provider_id: 'anthropic', origin_action: 'configure', return_surface: 'settings', return_route: 'ai/providers/installation'
    });
    const terminal = { terminal: true, status: 'applied', result_receipt_ref: 'settings-result:12' };
    const consumed = window.PM7_SETTINGS_TOME.consumeCommandResult(dispatched.request.command_instance_id, terminal);
    window.removeEventListener('pm7.settings.command.returned', listener);
    const state = window.PM12_KIMI.getState();
    return { dispatched, consumed, returned, state: { domain: state.domain, workspace: state.workspace, provider_tab: state.providerTab, selected_provider: state.selectedProvider } };
  });
  record('exact_return_route_after_terminal_result', exactReturn.dispatched.mode === 'host_pending' && exactReturn.consumed?.routing_disposition === 'returned' && exactReturn.returned.length === 1 && exactReturn.returned[0].return_surface === 'settings' && exactReturn.returned[0].return_route === 'ai/providers/installation' && exactReturn.returned[0].terminal_disposition === 'applied' && exactReturn.state.domain === 'ai' && exactReturn.state.workspace === 'providers' && exactReturn.state.provider_tab === 'installation', exactReturn);

  const preferences = await page.evaluate(() => {
    delete window.PM_SETTINGS_REGISTRY;
    const api = window.PM12_KIMI;
    const results = {
      theme: api.setSettingFromHost('general.visual.theme', 'Glass Dark'),
      alpha: api.setSettingFromHost('general.visual.glass-transparency', 0.61),
      tooltips: api.setSettingFromHost('general.interaction.show-tooltips', false),
      motion: api.setSettingFromHost('general.visual.reduce-animations', true)
    };
    const state = api.getState();
    const key = Object.keys(localStorage).find(name => name.startsWith('pm7:settings:tome-tabs:v1:'));
    if (window.PM_HOVER_TAG_CONTROLLER?.syncVisualSetting) window.PM_HOVER_TAG_CONTROLLER.syncVisualSetting();
    const stored = key ? JSON.parse(localStorage.getItem(key)) : null;
    return {
      results,
      settings: {
        theme: state.settings['general.visual.theme'],
        alpha: state.settings['general.visual.glass-transparency'],
        tooltips: state.settings['general.interaction.show-tooltips'],
        reduced: state.settings['general.visual.reduce-animations']
      },
      paint: {
        theme: document.documentElement.getAttribute('data-theme'),
        alpha: document.documentElement.style.getPropertyValue('--glass-alpha'),
        motion: document.documentElement.getAttribute('data-motion'),
        hover_controller_present: Boolean(window.PM_HOVER_TAG_CONTROLLER),
        hover_visual_enabled: window.PM_HOVER_TAG_CONTROLLER?.visualEnabled
      },
      storage_key: key || null,
      storage: stored ? {
        schema_version: stored.schema_version,
        settings: {
          'general.visual.theme': stored.settings?.['general.visual.theme'],
          'general.visual.glass-transparency': stored.settings?.['general.visual.glass-transparency'],
          'general.interaction.show-tooltips': stored.settings?.['general.interaction.show-tooltips'],
          'general.visual.reduce-animations': stored.settings?.['general.visual.reduce-animations']
        }
      } : null
    };
  });
  record('theme_glass_tooltips_motion_wiring', Object.values(preferences.results).every(Boolean) && preferences.settings.theme === 'Glass Dark' && preferences.settings.alpha === 0.61 && preferences.settings.tooltips === false && preferences.settings.reduced === true && preferences.paint.theme === 'glass-dark' && Number(preferences.paint.alpha) === 0.61 && preferences.paint.motion === 'reduced' && (!preferences.paint.hover_controller_present || preferences.paint.hover_visual_enabled === false), preferences);
  record('project_scoped_persistence', Boolean(preferences.storage_key) && preferences.storage?.schema_version === 'pm7.settings.project_projection.v1' && preferences.storage?.settings?.['general.visual.theme'] === 'Glass Dark' && preferences.storage?.settings?.['general.interaction.show-tooltips'] === false, { storage_key: preferences.storage_key, schema_version: preferences.storage?.schema_version, persisted_settings: preferences.storage?.settings });

  await guard.reloadBound(page, {
    navigation_id: 'settings-transactions:persistence-reload',
    wait_until: 'load',
    timeout_ms: 120000
  });
  await page.waitForFunction(expectBridge => Boolean(window.PM7_SETTINGS_TOME && window.PM12_KIMI && (!expectBridge || window.PM7_SETTINGS_COMMANDS)), settingsBridgeExpected, { timeout: 120000 });
  const reloaded = await page.evaluate(() => {
    const state = window.PM12_KIMI.getState();
    return {
      theme: state.settings['general.visual.theme'], alpha: state.settings['general.visual.glass-transparency'],
      tooltips: state.settings['general.interaction.show-tooltips'], reduced: state.settings['general.visual.reduce-animations'],
      paint_theme: document.documentElement.getAttribute('data-theme'), paint_motion: document.documentElement.getAttribute('data-motion')
    };
  });
  record('persistence_survives_reload', reloaded.theme === 'Glass Dark' && reloaded.alpha === 0.61 && reloaded.tooltips === false && reloaded.reduced === true && reloaded.paint_theme === 'glass-dark' && reloaded.paint_motion === 'reduced', reloaded);

  const reset = await page.evaluate(() => {
    const before = Object.keys(localStorage).find(name => name.startsWith('pm7:settings:tome-tabs:v1:'));
    window.PM12_KIMI.reset();
    const after = Object.keys(localStorage).find(name => name.startsWith('pm7:settings:tome-tabs:v1:'));
    const state = window.PM12_KIMI.getState();
    return { before, after: after || null, theme: state.settings['general.visual.theme'], tooltips: state.settings['general.interaction.show-tooltips'], reduced: state.settings['general.visual.reduce-animations'] };
  });
  record('settings_reset_clears_projection', Boolean(reset.before) && reset.after === null && reset.theme !== 'Glass Dark' && reset.tooltips !== false && reset.reduced !== true, reset);

  const transfer = await page.evaluate(() => {
    document.getElementById('tab-settings')?.click();
    if (window.PM7_SETTINGS_COMMANDS) window.PM7_SETTINGS_COMMANDS.open({ domain: 'system', workspace: 'settings-transfer' });
    else window.PM12_KIMI.navigate('system', 'settings-transfer');
    const tab = document.querySelector('[data-action="settings-transfer-tab"][data-tab="import-export"]');
    tab?.click();
    const exportButton = document.querySelector('#pm-settings-root [data-action="export-settings"]');
    const importButton = document.querySelector('#pm-settings-root [data-action="import-settings"]');
    exportButton?.click();
    const exportDialog = document.querySelector('#pm-settings-portals .dialog-card,#pm-settings-portals [role="dialog"]');
    const exportText = exportDialog?.textContent || '';
    document.querySelector('#pm-settings-portals [data-action="close-dialog"],#pm-settings-portals [data-action="cancel-dialog"]')?.click();
    importButton?.click();
    const importDialog = document.querySelector('#pm-settings-portals .dialog-card,#pm-settings-portals [role="dialog"]');
    const importText = importDialog?.textContent || '';
    return {
      route: (() => { const state = window.PM12_KIMI.getState(); return { domain: state.domain, workspace: state.workspace, tab: state.settingsTransferTab }; })(),
      controls: { export: Boolean(exportButton), import: Boolean(importButton) },
      export_text: exportText.trim().slice(0, 800), import_text: importText.trim().slice(0, 800)
    };
  });
  record('settings_import_export_gui_wiring', transfer.route.domain === 'system' && transfer.route.workspace === 'settings-transfer' && transfer.route.tab === 'import-export' && transfer.controls.export && transfer.controls.import && /credential references|never secrets/i.test(transfer.export_text) && /validate|rollback/i.test(transfer.import_text), transfer);

  const inventory = await page.evaluate(async () => {
    document.querySelector('#pm-settings-portals [data-action="close-dialog"],#pm-settings-portals [data-action="cancel-dialog"]')?.click();
    document.getElementById('tab-settings')?.click();
    if (window.PM7_SETTINGS_COMMANDS) window.PM7_SETTINGS_COMMANDS.open({ domain: 'projects', workspace: 'project-settings' });
    else window.PM12_KIMI.navigate('projects', 'project-settings');
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const inert = document.getElementById('pm7-settings-data');
    const canonicalInventory = inert ? JSON.parse(inert.textContent || '{}') : {};
    const modelCount = Array.isArray(canonicalInventory.settings) ? canonicalInventory.settings.length : 0;
    const viewport = document.querySelector('[data-all-settings-viewport]');
    const firstBefore = document.querySelector('[data-all-setting-id]')?.getAttribute('data-all-setting-id') || null;
    const mountedBefore = document.querySelectorAll('[data-all-setting-id]').length;
    if (viewport) { viewport.scrollTop = Math.max(600, viewport.scrollHeight * 0.55); viewport.dispatchEvent(new Event('scroll')); }
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    return {
      model_count: modelCount,
      summary: document.querySelector('[data-all-settings-count]')?.textContent?.trim() || null,
      virtual_label: document.querySelector('.all-settings-summary')?.textContent?.trim() || null,
      viewport: Boolean(viewport),
      spacer: Boolean(document.querySelector('[data-all-settings-spacer]')),
      mounted_before: mountedBefore,
      mounted_after: document.querySelectorAll('[data-all-setting-id]').length,
      first_before: firstBefore,
      first_after: document.querySelector('[data-all-setting-id]')?.getAttribute('data-all-setting-id') || null,
      scroll_top: viewport?.scrollTop || 0
    };
  });
  record('model_backed_virtualized_inventory', inventory.model_count > 100 && inventory.summary?.startsWith(`${inventory.model_count} of ${inventory.model_count}`) && /Virtualized\s*·\s*project scope/i.test(inventory.virtual_label || '') && inventory.viewport && inventory.spacer && inventory.mounted_before > 0 && inventory.mounted_before < inventory.model_count && inventory.mounted_after < inventory.model_count && inventory.scroll_top > 0 && inventory.first_after !== inventory.first_before, inventory);

  const searchAndFacets = await page.evaluate(async () => {
    const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
    const count = () => document.querySelector('[data-all-settings-count]')?.textContent?.trim() || '';
    const query = () => document.querySelector('[data-action="all-settings-query"]');
    const enter = async value => {
      const input = query();
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await wait(130);
      return {
        count: count(),
        ids: [...document.querySelectorAll('[data-all-setting-id]')].map(node => node.dataset.allSettingId),
        rows: [...document.querySelectorAll('[data-all-setting-id]')].map(node => ({
          id: node.dataset.allSettingId,
          category: node.dataset.allSettingCategory,
          exposure: node.dataset.allSettingExposure,
          control: node.dataset.allSettingControl,
          applicability: node.dataset.allSettingApplicability,
          owner_status: node.dataset.allSettingOwnerStatus,
          result_type: node.dataset.allSettingResultType,
          destination: node.dataset.allSettingDestination
        }))
      };
    };
    const before = count();
    const input = query();
    input.value = 'no-such-setting-token-zzzz';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await wait(35);
    const duringDebounce = count();
    await wait(95);
    const afterDebounce = count();
    const aliasAndSubsequence = await enter('appearance thm');
    const destinationAndCap = await enter('e');

    document.querySelector('[data-action="clear-all-settings-filters"]')?.click();
    await wait(50);
    const facetNodes = [...document.querySelectorAll('[data-action="all-settings-filter"]')];
    const facets = facetNodes.map(node => ({ field: node.dataset.filter, option_count: node.options.length }));
    const category = document.querySelector('[data-action="all-settings-filter"][data-filter="category"]');
    category.value = 'general';
    category.dispatchEvent(new Event('change', { bubbles: true }));
    await wait(50);
    const categoryRows = [...document.querySelectorAll('[data-all-setting-id]')].map(node => node.dataset.allSettingCategory);
    const metadataRows = [...document.querySelectorAll('[data-all-setting-id]')].map(node => ({
      id: node.dataset.allSettingId,
      category: node.dataset.allSettingCategory,
      exposure: node.dataset.allSettingExposure,
      control: node.dataset.allSettingControl,
      applicability: node.dataset.allSettingApplicability,
      owner_status: node.dataset.allSettingOwnerStatus,
      result_type: node.dataset.allSettingResultType,
      destination: node.dataset.allSettingDestination
    }));
    document.querySelector('[data-action="clear-all-settings-filters"]')?.click();
    await wait(50);
    return { before, during_debounce: duringDebounce, after_debounce: afterDebounce, alias_and_subsequence: aliasAndSubsequence, destination_and_cap: destinationAndCap, facets, category_rows: categoryRows, metadata_rows: metadataRows };
  });
  record('all_settings_80ms_debounce', searchAndFacets.before === searchAndFacets.during_debounce && /^0 of \d+ settings$/.test(searchAndFacets.after_debounce), { before: searchAndFacets.before, during_debounce: searchAndFacets.during_debounce, after_debounce: searchAndFacets.after_debounce });
  record('all_settings_multi_token_and_subsequence', searchAndFacets.alias_and_subsequence.ids.includes('general.visual.theme') && searchAndFacets.alias_and_subsequence.ids.length > 0, searchAndFacets.alias_and_subsequence);
  record('all_settings_best_60_cap', searchAndFacets.destination_and_cap.count.startsWith('60 of ') && searchAndFacets.destination_and_cap.ids.length > 0 && searchAndFacets.destination_and_cap.ids.length < 60, searchAndFacets.destination_and_cap);
  const expectedFacetFields = ['category', 'exposure', 'control', 'applicability', 'ownerStatus', 'resultType'];
  record('all_settings_six_facets', JSON.stringify(searchAndFacets.facets.map(row => row.field)) === JSON.stringify(expectedFacetFields) && searchAndFacets.facets.every(row => row.option_count >= 2) && searchAndFacets.category_rows.length > 0 && searchAndFacets.category_rows.every(value => value === 'general'), { facets: searchAndFacets.facets, mounted_category_rows: searchAndFacets.category_rows });
  record('all_settings_index_and_destination_metadata', searchAndFacets.metadata_rows.length > 0 && searchAndFacets.metadata_rows.every(row => row.id && row.category && row.exposure && row.control && row.applicability && row.owner_status && row.result_type === 'ordinary-setting' && /^.+\/.+\/.+$/.test(row.destination)), searchAndFacets.metadata_rows);

  const settingsHoverMetadata = await page.evaluate(() => {
    window.PM12_KIMI.navigate('ai', 'providers');
    const state = window.PM12_KIMI.getState();
    state.providerTab = 'installation';
    window.PM12_KIMI.setState(state);
    const authoredNativeTitles = document.querySelectorAll('#pm-settings-root [title],#pm-settings-portals [title]').length;
    const unavailable = [...document.querySelectorAll('#pm-settings-root [aria-disabled="true"][data-disabled-reason]:not([data-disabled-reason=""])')].map(node => ({
      action: node.dataset.action,
      reason: node.dataset.disabledReason,
      hover_label: node.dataset.pmHoverLabel,
      hover_detail: node.dataset.pmHoverDetail,
      aria_label: node.getAttribute('aria-label')
    }));
    return { authored_native_titles: authoredNativeTitles, unavailable };
  });
  record('settings_shared_hover_metadata_and_disabled_reasons', settingsHoverMetadata.authored_native_titles === 0 && settingsHoverMetadata.unavailable.length > 0 && settingsHoverMetadata.unavailable.every(row => row.reason && row.hover_label && row.hover_detail && row.aria_label), settingsHoverMetadata);

  await page.setViewportSize({ width: 1280, height: 900 });
  await page.evaluate(() => {
    document.getElementById('tab-settings')?.click();
    const panel = document.getElementById('panel-settings');
    if (panel) {
      panel.classList.add('active');
      Object.assign(panel.style, { display: 'block', position: 'fixed', inset: '0', width: 'auto', height: 'auto', zIndex: '2147483000' });
    }
    return window.PM7_SETTINGS_COMMANDS ? window.PM7_SETTINGS_COMMANDS.open({ domain: 'projects', workspace: 'project-settings' }) : window.PM12_KIMI.navigate('projects', 'project-settings');
  });
  const responsive = [];
  for (const width of [320, 420, 520, 720, 760, 960, 1180, 1280, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.waitForTimeout(120);
    responsive.push(await page.evaluate(viewportWidth => {
      const panel = document.getElementById('panel-settings');
      const root = document.getElementById('pm-settings-root');
      const facets = root?.querySelector('.all-settings-facets');
      const hostWidth = panel?.clientWidth || 0;
      const expectedRail = hostWidth <= 720 ? 0 : hostWidth <= 960 ? 76 : hostWidth <= 1180 ? 215 : 250;
      const expectedColumns = hostWidth <= 420 ? 1 : hostWidth <= 760 ? 2 : 4;
      const rail = Number.parseFloat(getComputedStyle(root).getPropertyValue('--k3-rail-w'));
      const columns = facets ? getComputedStyle(facets).gridTemplateColumns.split(/\s+/).filter(Boolean).length : 0;
      const panelRect = panel?.getBoundingClientRect();
      const rootRect = root?.getBoundingClientRect();
      return { viewport_width: viewportWidth, host_mode: 'isolated_t44_panel', host_width: hostWidth, rail, expected_rail: expectedRail, facet_columns: columns, expected_facet_columns: expectedColumns, panel_contains_root: Boolean(panelRect && rootRect && rootRect.left >= panelRect.left - 1 && rootRect.right <= panelRect.right + 1), panel_overflow_x: panel ? panel.scrollWidth - panel.clientWidth : null };
    }, width));
  }
  record('settings_responsive_host_width_contract', responsive.every(row => row.host_width > 0 && row.rail === row.expected_rail && row.facet_columns === row.expected_facet_columns && row.panel_contains_root), responsive);
  await page.setViewportSize({ width: 1280, height: 900 });
} catch (error) {
  report.runtime_errors.push({ kind: 'runner', text: error?.stack || String(error) });
} finally {
  try { await context.close(); }
  catch (error) { report.runtime_errors.push({ kind: 'context-close', text: String(error?.stack || error) }); }
  try { await provenanceRun.finalizeBeforeBrowserClose(browser); }
  catch (error) { report.runtime_errors.push({ kind: 'provenance-pre-close', text: String(error?.stack || error) }); }
  try { await browser.close(); }
  catch (error) { report.runtime_errors.push({ kind: 'browser-close', text: String(error?.stack || error) }); }
  try { report.provenance = await provenanceRun.finalizeAfterBrowserClose(); }
  catch (error) {
    report.runtime_errors.push({ kind: 'provenance-post-close', text: String(error?.stack || error) });
    report.provenance = provenanceRun.envelope;
  }
}

let provenanceAdmissionError = null;
try { assertProvenanceAdmission(report.provenance); }
catch (error) { provenanceAdmissionError = String(error?.stack || error); }
record('certifying_full_candidate_scope', report.execution_scope === 'full_candidate', {
  execution_scope: report.execution_scope,
  source_declares_settings_bridge: settingsBridgeExpected
});
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
});
record('evidence_identity_and_browser_native_boundary',
  JSON.stringify(report.provenance.certification_boundary) === JSON.stringify(BROWSER_ONLY_BOUNDARY) &&
    JSON.stringify(report.certification_boundary) === JSON.stringify(BROWSER_ONLY_BOUNDARY) &&
    JSON.stringify(report.execution_boundary) === JSON.stringify(BROWSER_ONLY_BOUNDARY),
  {
    provenance_boundary: report.provenance.certification_boundary,
    certification_boundary: report.certification_boundary,
    execution_boundary: report.execution_boundary
  });
record('shared_provenance_runtime_clean', report.runtime_errors.length === 0 && report.provenance.runtime_errors.count === 0, {
  verifier: report.runtime_errors,
  provenance: report.provenance.runtime_errors
});
const passed = report.checks.filter(row => row.pass === true).length;
const failed = report.checks.filter(row => row.pass === false).length;
const notRunCount = report.checks.filter(row => row.disposition === 'not_run').length;
report.summary = { total: report.checks.length, passed, failed, not_run: notRunCount, runtime_errors: report.runtime_errors.length };
report.disposition = failed === 0 && report.runtime_errors.length === 0 ? 'pass' : 'fail';
writeFileSync(outputPath, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ disposition: report.disposition, summary: report.summary, out: outputPath }));
process.exitCode = report.disposition === 'pass' ? 0 : 1;
