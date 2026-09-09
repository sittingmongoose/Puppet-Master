/* Deterministic PMConcept7 T47 hover-tag census and browser fixture.
 *
 * Certifying execution is launcher-only through
 * browser_verifier_provenance_launcher.py run. Direct Node execution rejects
 * because it cannot supply the independently issued launch/network receipt.
 *
 * The generated PMConcept7 artifact must already include T47.  The runner
 * exercises the public PM_HOVER_TAG_CONTROLLER and adds a bounded fixture to
 * prove both the positive contract and that each fail-closed census category
 * is actually detected.  It does not mutate repository files.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import {
  BROWSER_ONLY_BOUNDARY,
  REQUIRED_POLICY_PROBES,
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
  'expected-helper-sha256': { required: true, validate: digest },
  'provenance-launch-receipt': { required: true },
  'expected-launch-receipt-sha256': { required: true, validate: digest }
});
const args = cli.parsed_args;

const artifactPath = resolve(args.file);
const outdir = resolve(args.outdir);
mkdirSync(outdir, { recursive: true });
const reportPath = join(outdir, 'hover-tags-results.json');
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
      verifier: 'hover_tags', artifact_path: artifactPath, outdir,
      context_profile: '1120x760,dpr1,en-US,UTC,full-motion',
      timeout_ms: 120000, service_workers: 'block', certification_mode: true
    }
  });
  const { chromium } = provenanceRun.loadPlaywright();
  if (!chromium) throw new Error('bound Playwright Chromium implementation is unavailable');
  ({ browser } = await provenanceRun.launchChromium());
} catch (error) {
  let failureProvenance = provenanceRun?.envelope || null;
  if (provenanceRun) {
    try { failureProvenance = await provenanceRun.fail('bootstrap', error); }
    catch (_failureError) {}
  }
  const failure = {
    schema_id: 'pm.hover_tag.browser_provenance_failure.v2',
    disposition: 'provenance_preparation_failed',
    generated_at_utc: new Date().toISOString(),
    execution_boundary: { ...BROWSER_ONLY_BOUNDARY },
    command: cli,
    error: { kind: 'provenance-preparation', text: String(error?.stack || error) },
    provenance: failureProvenance
  };
  writeFileSync(reportPath, JSON.stringify(failure, null, 2) + '\n');
  console.log(JSON.stringify({ disposition: failure.disposition, result: reportPath }));
  process.exit(1);
}

const report = {
  schema_id: 'pm.hover_tag.browser_verification.v2',
  generated_at_utc: new Date().toISOString(),
  artifact: artifactPath,
  artifact_sha256: provenanceRun.envelope.artifact.sha256,
  verifier_sha256: provenanceRun.envelope.verifier.sha256,
  url: provenanceRun.artifactUrl(),
  command: provenanceRun.envelope.command,
  provenance: provenanceRun.envelope,
  execution_boundary: { ...BROWSER_ONLY_BOUNDARY },
  deterministic_context: {
    viewport: { width: 1120, height: 760 },
    device_scale_factor: 1,
    locale: 'en-US',
    timezone_id: 'UTC',
    external_requests_blocked: true
  },
  checks: {},
  runtime_errors: [],
  census: null
};
function check(name, pass, evidence) {
  report.checks[name] = { pass: Boolean(pass), evidence };
}
function allCodes(census) {
  return new Set((census && census.failures || []).map(row => row.code));
}

const contextConfig = {
  viewport: report.deterministic_context.viewport,
  deviceScaleFactor: 1,
  locale: 'en-US',
  timezoneId: 'UTC',
  reducedMotion: 'no-preference',
  serviceWorkers: 'block',
  acceptDownloads: false
};
const { context, guard } = await provenanceRun.createBoundContext(browser, {
  case_id: 'hover-tags',
  context_config: contextConfig
});
const page = await context.newPage();
await guard.instrumentPage(page);
page.on('console', message => {
  if (message.type() === 'error') report.runtime_errors.push({ kind: 'console', text: message.text().slice(0, 500) });
});
page.on('pageerror', error => report.runtime_errors.push({ kind: 'pageerror', text: String(error).slice(0, 500) }));

try {
  const navigationStarted = performance.now();
  await guard.gotoBound(page, {
    navigation_id: 'hover-tags:initial',
    url: provenanceRun.artifactUrl({ case: 'hover-tags' }),
    wait_until: 'load', timeout_ms: 120000
  });
  report.startup = { navigation_to_load_ms: performance.now() - navigationStarted };
  await page.waitForFunction(() => Boolean(window.PM_HOVER_TAG_CONTROLLER), null, { timeout: 30000 });
  report.startup.controller_available_ms = performance.now() - navigationStarted;
  const startupProbe = await page.evaluate(() => {
    const ctl = window.PM_HOVER_TAG_CONTROLLER;
    const button = document.querySelector('#pm7-onboarding[data-open="true"] button[data-ui-action-id]') ||
      document.getElementById('tab-settings') || document.querySelector('button,[role="button"],[tabindex]');
    if (!button) throw new Error('startup hover probe target missing');
    const started = performance.now();
    const model = ctl.refresh(button);
    return {
      acknowledgement_ms: performance.now() - started,
      bound: button.getAttribute('data-pm-hover-bound'),
      description_present: Boolean(document.getElementById(button.getAttribute('aria-describedby') || '')),
      model_key: model?.key || null,
      scan_complete_at_probe: ctl.scanComplete
    };
  });
  report.startup.same_task_input_probe = startupProbe;
  check('startup_binding_acknowledges_same_frame_without_forcing_visual_open', startupProbe.acknowledgement_ms <= 16.7 && startupProbe.bound === 'true' && startupProbe.description_present && Boolean(startupProbe.model_key), startupProbe);
  await page.waitForFunction(() => window.PM_HOVER_TAG_CONTROLLER?.scanComplete === true, null, { timeout: 30000 });
  const initialScan = await page.evaluate(() => ({
    ...window.PM_HOVER_TAG_CONTROLLER.lastScan,
    bootstrap_pass: window.PM_HOVER_TAG_CONTROLLER.bootstrapPass
  }));
  report.startup.initial_scan = initialScan;
  check('initial_scan_frame_bounded_and_complete', initialScan.candidates > 20 && initialScan.bound === initialScan.candidates && initialScan.batches > 1 && initialScan.duration_ms < 30000 && initialScan.bootstrap_pass === 0, initialScan);
  await page.evaluate(() => document.fonts && document.fonts.ready);

  report.census = await page.evaluate(async () => window.PM_HOVER_TAG_CONTROLLER.settle(document));
  check('artifact_census', report.census.pass, report.census);

  await page.evaluate(async () => {
    const api = window.PM7_ONBOARDING_CINEMATIC;
    if (!api?.snapshot?.().open) api?.replay?.({ source_surface: 'settings_rerun' });
    await window.PM_HOVER_TAG_CONTROLLER.settle(document);
    window.PM_HOVER_TAG_CONTROLLER.syncOverlayState();
  });
  const onboardingModalTarget = page.locator('#pm7-onboarding [data-ui-action-id="ui.onboarding.defer"]:visible');
  await onboardingModalTarget.hover();
  await page.waitForTimeout(900);
  const onboardingHover = await onboardingModalTarget.evaluate(target => {
    const ctl = window.PM_HOVER_TAG_CONTROLLER, visual = document.getElementById('pm-hover-tag-visual');
    const description = document.getElementById(target.getAttribute('aria-describedby') || '');
    const underlay = document.getElementById('tab-settings') || document.querySelector('[data-pm-home-action="reset-layout"]');
    const underlayDescription = underlay && document.getElementById(underlay.getAttribute('aria-describedby') || '');
    return {
      modal_open: document.getElementById('pm7-onboarding')?.dataset.open,
      target_bound: target.getAttribute('data-pm-hover-bound'),
      target_is_active: ctl.active === target,
      visual_open: visual?.dataset.open || null,
      visual_primary: visual?.querySelector('strong')?.textContent || '',
      visual_detail: visual?.querySelector('p')?.textContent || '',
      description: description?.textContent || '',
      description_role: description?.getAttribute('role') || null,
      underlay_description_role: underlayDescription?.getAttribute('role') || null,
      underlay_description_hidden: underlayDescription?.getAttribute('aria-hidden') || null
    };
  });
  check('onboarding_modal_contains_visual_tags_and_suppresses_underlay', onboardingHover.modal_open === 'true' && onboardingHover.target_bound === 'true' && onboardingHover.target_is_active && onboardingHover.visual_open === 'true' && onboardingHover.visual_primary === 'Do this later' && onboardingHover.visual_detail === 'Save your place and return later.' && onboardingHover.description === 'Do this later Save your place and return later.' && onboardingHover.description_role === 'tooltip' && onboardingHover.underlay_description_role === 'presentation' && onboardingHover.underlay_description_hidden === 'true', onboardingHover);
  const onboardingReleased = await page.evaluate(async () => {
    window.PM_HOVER_TAG_CONTROLLER?.close(true);
    const api = window.PM7_ONBOARDING_CINEMATIC;
    if (api?.snapshot?.().open) {
      await Promise.resolve(api.close('close'));
      await Promise.resolve();
    }
    const root = document.getElementById('pm7-onboarding');
    window.PM_HOVER_TAG_CONTROLLER?.syncOverlayState();
    const underlay = document.getElementById('tab-settings') || document.querySelector('[data-pm-home-action="reset-layout"]');
    const description = underlay && document.getElementById(underlay.getAttribute('aria-describedby') || '');
    return { hidden: Boolean(root?.hidden), open: root?.dataset.open || null, underlay_role: description?.getAttribute('role') || null, underlay_hidden: description?.getAttribute('aria-hidden') || null };
  });
  check('onboarding_modal_release_restores_underlay_descriptions', onboardingReleased.hidden && onboardingReleased.open === 'false' && onboardingReleased.underlay_role === 'tooltip' && onboardingReleased.underlay_hidden === null, onboardingReleased);

  const homeAndChromeCopy = await page.evaluate(async () => {
    const ctl = window.PM_HOVER_TAG_CONTROLLER;
    await ctl.settle(document);
    const reset = document.querySelector('[data-pm-home-action="reset-layout"]');
    const setup = document.querySelector('[data-pm-home-action="run-onboarding"]');
    const theme = document.getElementById('themeSelect');
    const describe = element => element ? document.getElementById(element.getAttribute('aria-describedby') || '')?.textContent || '' : '';
    const allDescriptions = [...document.querySelectorAll('#pm-hover-tag-descriptions .pm-hover-description')].map(node => node.textContent || '');
    return {
      setup_present: Boolean(setup),
      reset_present: Boolean(reset),
      setup_directly_after_reset: Boolean(setup && reset && setup.previousElementSibling === reset),
      setup_source: setup?.getAttribute('data-source-surface') || null,
      setup_action: setup?.getAttribute('data-ui-action-id') || null,
      setup_description: describe(setup),
      reset_description: describe(reset),
      theme_description: describe(theme),
      raw_action_description_samples: allDescriptions.filter(value => /(?:cmd|ui)\.[a-z0-9_.:-]+/i.test(value)).slice(0, 20)
    };
  });
  check('home_setup_launcher_is_below_reset_and_human_described', homeAndChromeCopy.setup_present && homeAndChromeCopy.reset_present && homeAndChromeCopy.setup_directly_after_reset && homeAndChromeCopy.setup_source === 'home_menu' && homeAndChromeCopy.setup_action === 'ui.onboarding.start' && homeAndChromeCopy.setup_description === 'Run setup again Review your setup choices from the beginning.' && homeAndChromeCopy.reset_description === 'Reset Layout Return panels and cards to their original places.' && /Change how Puppet Master looks\./.test(homeAndChromeCopy.theme_description), homeAndChromeCopy);
  check('persistent_hover_copy_never_exposes_raw_action_ids', homeAndChromeCopy.raw_action_description_samples.length === 0, homeAndChromeCopy.raw_action_description_samples);

  const guidedTourContainment = await page.evaluate(async () => {
    const ctl = window.PM_HOVER_TAG_CONTROLLER, tour = document.getElementById('pm7-guided-tour');
    const underlay = document.getElementById('tab-settings') || document.querySelector('[data-pm-home-action="reset-layout"]');
    if (!tour || !underlay) return { available: false };
    tour.dataset.open = 'true'; tour.hidden = false; ctl.syncOverlayState();
    const hiddenDesc = document.getElementById(underlay.getAttribute('aria-describedby') || '');
    const during = { role: hiddenDesc?.getAttribute('role') || null, hidden: hiddenDesc?.getAttribute('aria-hidden') || null, describedby: underlay.getAttribute('aria-describedby') || null };
    tour.dataset.open = 'false'; tour.hidden = true; ctl.syncOverlayState();
    const restoredDesc = document.getElementById(underlay.getAttribute('aria-describedby') || '');
    return { available: true, during, after: { role: restoredDesc?.getAttribute('role') || null, hidden: restoredDesc?.getAttribute('aria-hidden') || null, describedby: underlay.getAttribute('aria-describedby') || null } };
  });
  check('guided_tour_suppresses_outside_visual_semantics_and_restores_them', guidedTourContainment.available && guidedTourContainment.during.role === 'presentation' && guidedTourContainment.during.hidden === 'true' && Boolean(guidedTourContainment.during.describedby) && guidedTourContainment.after.role === 'tooltip' && guidedTourContainment.after.hidden === null && guidedTourContainment.after.describedby === guidedTourContainment.during.describedby, guidedTourContainment);

  await page.evaluate(() => {
    const old = document.getElementById('pm-hover-verification-fixture');
    if (old) old.remove();
    const fixture = document.createElement('section');
    fixture.id = 'pm-hover-verification-fixture';
    fixture.setAttribute('aria-label', 'Hover tag verification fixture');
    fixture.innerHTML = `
      <button id="pmhv-title" title="Pin item" aria-pressed="false"><svg aria-hidden="true" width="12" height="12"><path d="M1 1h10v10H1z"/></svg></button>
      <button id="pmhv-disabled" disabled title="Unavailable export">Export</button>
      <span id="pmhv-truncated" data-truncated="true">A deliberately truncated value with its complete source text</span>
      <code id="pmhv-id" data-technical-id="run:01J-EXACT">run:01J-EXACT</code>
      <span id="pmhv-status" class="runtime-status" data-status="degraded">Degraded</span>
      <span id="pmhv-badge" class="count-badge">12 queued</span>
      <svg id="pmhv-chart" aria-label="Usage chart" viewBox="0 0 100 40"><circle data-chart-mark="usage" data-value="64" aria-label="Context used, 64 percent" cx="64" cy="20" r="4"/></svg>
      <button id="pmhv-detail" data-pm-hover-label="Provider route" data-pm-hover-detail="Anthropic account · ready">Route</button>
      <button id="pmhv-corner-tl" aria-label="Top left anchor">TL</button>
      <button id="pmhv-corner-tr" aria-label="Top right anchor">TR</button>
      <button id="pmhv-corner-bl" aria-label="Bottom left anchor">BL</button>
      <button id="pmhv-corner-br" aria-label="Bottom right anchor">BR</button>
      <div id="pmhv-blank" data-pm-hover-exempt="decorative" aria-hidden="true"></div>`;
    fixture.style.cssText = 'position:fixed;inset:0;z-index:2147482500;pointer-events:none;color:inherit';
    const positions = { 'pmhv-title':'left:24px;top:90px', 'pmhv-disabled':'left:120px;top:90px',
      'pmhv-truncated':'left:230px;top:90px;width:90px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis',
      'pmhv-id':'left:350px;top:90px', 'pmhv-status':'left:500px;top:90px', 'pmhv-badge':'left:610px;top:90px',
      'pmhv-chart':'left:720px;top:70px;width:100px;height:40px', 'pmhv-detail':'left:850px;top:90px',
      'pmhv-corner-tl':'left:1px;top:1px', 'pmhv-corner-tr':'right:1px;top:1px',
      'pmhv-corner-bl':'left:1px;bottom:1px', 'pmhv-corner-br':'right:1px;bottom:1px',
      'pmhv-blank':'left:535px;top:335px;width:50px;height:50px' };
    for (const [id, css] of Object.entries(positions)) {
      const node = fixture.querySelector('#' + id);
      node.style.cssText += ';position:absolute;pointer-events:auto;' + css;
    }
    fixture.querySelector('#pmhv-title').addEventListener('click', event => {
      const button = event.currentTarget;
      button.setAttribute('aria-pressed', button.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
    });
    document.body.appendChild(fixture);
  });
  const fixtureCensus = await page.evaluate(async () => window.PM_HOVER_TAG_CONTROLLER.settle(document.getElementById('pm-hover-verification-fixture')));
  check('fixture_census', fixtureCensus.pass, fixtureCensus);

  const migrated = await page.evaluate(() => {
    const title = document.getElementById('pmhv-title');
    const disabled = document.getElementById('pmhv-disabled');
    const descId = title.getAttribute('aria-describedby');
    return {
      title_removed: !title.hasAttribute('title'),
      accessible_name: title.getAttribute('aria-label'),
      description_role: document.getElementById(descId)?.getAttribute('role'),
      disabled_native_removed: !disabled.disabled,
      disabled_aria: disabled.getAttribute('aria-disabled'),
      disabled_tab_index: disabled.tabIndex
    };
  });
  check('title_migration_and_accessible_disabled', migrated.title_removed && migrated.accessible_name === 'Pin item' && migrated.description_role === 'tooltip' && migrated.disabled_native_removed && migrated.disabled_aria === 'true' && migrated.disabled_tab_index >= 0, migrated);

  await page.locator('#pmhv-title').hover();
  await page.waitForTimeout(1000);
  const pointerBeforeDwell = await page.evaluate(() => {
    const ctl = window.PM_HOVER_TAG_CONTROLLER, tag = document.getElementById('pm-hover-tag-visual');
    return { open: tag.dataset.open, hidden: tag.hidden, active: ctl.active?.id || null, pending: ctl.pendingOpenTarget?.id || null, pending_source: ctl.pendingOpenSource };
  });
  await page.waitForTimeout(150);
  const pointerAfterDwell = await page.evaluate(() => {
    const ctl = window.PM_HOVER_TAG_CONTROLLER, tag = document.getElementById('pm-hover-tag-visual');
    return { open: tag.dataset.open, label: tag.querySelector('strong').textContent, hidden: tag.hidden, active: ctl.active?.id || null, pending: ctl.pendingOpenTarget?.id || null };
  });
  check('pointer_requires_1050ms_deliberate_dwell', pointerBeforeDwell.open !== 'true' && pointerBeforeDwell.active === null && pointerBeforeDwell.pending === 'pmhv-title' && pointerBeforeDwell.pending_source === 'pointer' && pointerAfterDwell.open === 'true' && pointerAfterDwell.label.startsWith('Pin') && !pointerAfterDwell.hidden && pointerAfterDwell.active === 'pmhv-title' && pointerAfterDwell.pending === null, { before_1000ms: pointerBeforeDwell, after_1150ms: pointerAfterDwell });

  await page.evaluate(() => window.PM_HOVER_TAG_CONTROLLER.close(true));
  const intentBox = await page.locator('#pmhv-detail').boundingBox();
  if (!intentBox) throw new Error('pointer-intent fixture has no geometry');
  const intentX = intentBox.x + intentBox.width / 2, intentY = intentBox.y + intentBox.height / 2;
  await page.mouse.move(intentX, intentY);
  await page.waitForTimeout(400);
  await page.mouse.move(intentX + 7, intentY);
  await page.waitForTimeout(650);
  const resetBeforeStationary = await page.evaluate(() => {
    const ctl = window.PM_HOVER_TAG_CONTROLLER, tag = document.getElementById('pm-hover-tag-visual');
    return { open: tag.dataset.open, active: ctl.active?.id || null, pending: ctl.pendingOpenTarget?.id || null,
      stationary_ms: ctl.pendingPointerIntent ? performance.now() - ctl.pendingPointerIntent.stationary_at : null };
  });
  await page.waitForTimeout(200);
  const resetAfterStationary = await page.evaluate(() => {
    const ctl = window.PM_HOVER_TAG_CONTROLLER, tag = document.getElementById('pm-hover-tag-visual');
    return { open: tag.dataset.open, active: ctl.active?.id || null, pending: ctl.pendingOpenTarget?.id || null };
  });
  check('pointer_motion_beyond_5px_resets_750ms_stationary_intent', resetBeforeStationary.open !== 'true' && resetBeforeStationary.active === null && resetBeforeStationary.pending === 'pmhv-detail' && resetBeforeStationary.stationary_ms >= 600 && resetAfterStationary.open === 'true' && resetAfterStationary.active === 'pmhv-detail' && resetAfterStationary.pending === null, { before: resetBeforeStationary, after: resetAfterStationary });

  await page.evaluate(() => window.PM_HOVER_TAG_CONTROLLER.close(true));
  await page.mouse.move(intentX - 48, intentY);
  await page.mouse.move(intentX, intentY);
  await page.waitForTimeout(350);
  await page.mouse.down();
  await page.waitForTimeout(20);
  await page.mouse.up();
  await page.waitForTimeout(900);
  const pressCanceled = await page.evaluate(() => {
    const ctl = window.PM_HOVER_TAG_CONTROLLER, tag = document.getElementById('pm-hover-tag-visual');
    return { open: tag.dataset.open, active: ctl.active?.id || null, pending: ctl.pendingOpenTarget?.id || null };
  });
  check('pointer_press_cancels_pending_help_until_fresh_motion', pressCanceled.open !== 'true' && pressCanceled.active === null && pressCanceled.pending === null, pressCanceled);

  await page.mouse.move(intentX - 12, intentY);
  await page.mouse.move(intentX, intentY);
  await page.waitForTimeout(300);
  await page.evaluate(() => window.dispatchEvent(new Event('scroll')));
  await page.waitForTimeout(900);
  const scrollCanceled = await page.evaluate(() => {
    const ctl = window.PM_HOVER_TAG_CONTROLLER, tag = document.getElementById('pm-hover-tag-visual');
    return { open: tag.dataset.open, active: ctl.active?.id || null, pending: ctl.pendingOpenTarget?.id || null };
  });
  check('scroll_cancels_pending_pointer_help', scrollCanceled.open !== 'true' && scrollCanceled.active === null && scrollCanceled.pending === null, scrollCanceled);

  await page.mouse.move(intentX - 12, intentY);
  await page.mouse.move(intentX, intentY);
  await page.waitForTimeout(400);
  await page.locator('#pmhv-detail').evaluate(target => { target.style.left = `${parseFloat(target.style.left) + 2}px`; });
  await page.waitForTimeout(500);
  const geometryBeforeStationary = await page.evaluate(() => {
    const ctl = window.PM_HOVER_TAG_CONTROLLER, tag = document.getElementById('pm-hover-tag-visual');
    return { open: tag.dataset.open, active: ctl.active?.id || null, pending: ctl.pendingOpenTarget?.id || null,
      stationary_ms: ctl.pendingPointerIntent ? performance.now() - ctl.pendingPointerIntent.stationary_at : null };
  });
  await page.waitForTimeout(700);
  const geometryAfterStationary = await page.evaluate(() => {
    const ctl = window.PM_HOVER_TAG_CONTROLLER, tag = document.getElementById('pm-hover-tag-visual');
    return { open: tag.dataset.open, active: ctl.active?.id || null, pending: ctl.pendingOpenTarget?.id || null };
  });
  check('anchor_geometry_change_resets_stationary_intent', geometryBeforeStationary.open !== 'true' && geometryBeforeStationary.active === null && geometryBeforeStationary.pending === 'pmhv-detail' && geometryBeforeStationary.stationary_ms < 150 && geometryAfterStationary.open === 'true' && geometryAfterStationary.active === 'pmhv-detail', { before: geometryBeforeStationary, after: geometryAfterStationary });

  await page.locator('#pmhv-detail').hover();
  await page.waitForTimeout(200);
  await page.locator('#pmhv-blank').hover();
  await page.waitForTimeout(900);
  const canceledPointer = await page.evaluate(() => {
    const ctl = window.PM_HOVER_TAG_CONTROLLER, tag = document.getElementById('pm-hover-tag-visual');
    return { open: tag.dataset.open, active: ctl.active?.id || null, pending: ctl.pendingOpenTarget?.id || null, hidden: tag.hidden };
  });
  check('pointer_departure_cancels_pending_open', canceledPointer.open === 'false' && canceledPointer.active === null && canceledPointer.pending === null && canceledPointer.hidden, canceledPointer);

  await page.locator('#pmhv-title').hover();
  await page.waitForTimeout(900);

  const pinCopy = await page.evaluate(() => {
    const ctl = window.PM_HOVER_TAG_CONTROLLER, anchor = document.getElementById('pmhv-title');
    const snapshot = () => {
      ctl.refresh(anchor);
      return {
        pressed: anchor.getAttribute('aria-pressed'),
        model_primary: ctl.activeModel?.primary || null,
        visual_label: document.querySelector('#pm-hover-tag-visual strong').textContent,
        description: document.getElementById(anchor.getAttribute('aria-describedby'))?.textContent || null
      };
    };
    const unpinnedBefore = snapshot();
    anchor.click();
    const pinned = snapshot();
    anchor.click();
    const unpinnedAfter = snapshot();
    return { unpinned_before: unpinnedBefore, pinned, unpinned_after: unpinnedAfter };
  });
  const pinStateMatches = (state, pressed, prefix) => state.pressed === pressed && state.model_primary.startsWith(prefix) &&
    state.visual_label.startsWith(prefix) && state.description.startsWith(prefix);
  check('dynamic_pin_false_true_false_refresh',
    pinStateMatches(pinCopy.unpinned_before, 'false', 'Pin') && pinStateMatches(pinCopy.pinned, 'true', 'Unpin') &&
      pinStateMatches(pinCopy.unpinned_after, 'false', 'Pin'), pinCopy);

  await page.locator('#pmhv-blank').hover();
  await page.waitForTimeout(100);
  await page.locator('#pmhv-title').hover();
  await page.waitForTimeout(90);
  const reentry = await page.evaluate(() => {
    const anchor = document.getElementById('pmhv-title'), tag = document.getElementById('pm-hover-tag-visual'), ctl = window.PM_HOVER_TAG_CONTROLLER;
    return { open: tag.dataset.open, active_key: ctl.activeModel?.key || null, anchor_key: anchor.getAttribute('data-pm-hover-key') };
  });
  check('pointer_reentry_cancels_departure', reentry.open === 'true' && reentry.active_key === reentry.anchor_key, reentry);

  await page.locator('#pmhv-detail').hover();
  await page.waitForTimeout(900);
  const anchorTransfer = await page.evaluate(() => {
    const to = document.getElementById('pmhv-detail'), tag = document.getElementById('pm-hover-tag-visual'), ctl = window.PM_HOVER_TAG_CONTROLLER;
    return { open: tag.dataset.open, active_key: ctl.activeModel?.key || null, target_key: to.getAttribute('data-pm-hover-key'), visual_label: tag.querySelector('strong').textContent };
  });
  check('pointer_a_to_b_settles_on_new_anchor_after_dwell', anchorTransfer.open === 'true' && anchorTransfer.active_key === anchorTransfer.target_key &&
    anchorTransfer.visual_label === 'Provider route', anchorTransfer);

  await page.evaluate(() => window.PM_HOVER_TAG_CONTROLLER.close(true));
  await page.locator('#pmhv-disabled').focus();
  const focusImmediate = await page.evaluate(() => {
    const anchor = document.getElementById('pmhv-disabled');
    const description = document.getElementById(anchor.getAttribute('aria-describedby') || '');
    return { active: document.activeElement?.id || null, description: description?.textContent || '',
      description_role: description?.getAttribute('role') || null,
      open: document.getElementById('pm-hover-tag-visual').dataset.open };
  });
  await page.waitForTimeout(800);
  const focusBeforeDwell = await page.evaluate(() => ({
    active: document.activeElement && document.activeElement.id,
    open: document.getElementById('pm-hover-tag-visual').dataset.open,
    pending: window.PM_HOVER_TAG_CONTROLLER.pendingOpenTarget?.id || null,
    pending_source: window.PM_HOVER_TAG_CONTROLLER.pendingOpenSource
  }));
  await page.waitForTimeout(200);
  const focusOpen = await page.evaluate(() => ({
    active: document.activeElement && document.activeElement.id,
    open: document.getElementById('pm-hover-tag-visual').dataset.open,
    label: document.querySelector('#pm-hover-tag-visual strong').textContent,
    pending: window.PM_HOVER_TAG_CONTROLLER.pendingOpenTarget?.id || null
  }));
  check('keyboard_focus_requires_900ms_calm_dwell_with_immediate_description', focusImmediate.active === 'pmhv-disabled' && focusImmediate.description === 'Unavailable export' && focusImmediate.description_role === 'tooltip' && focusImmediate.open !== 'true' && focusBeforeDwell.active === 'pmhv-disabled' && focusBeforeDwell.open !== 'true' && focusBeforeDwell.pending === 'pmhv-disabled' && focusBeforeDwell.pending_source === 'focus' && focusOpen.active === 'pmhv-disabled' && focusOpen.open === 'true' && focusOpen.label === 'Unavailable export' && focusOpen.pending === null, { immediate: focusImmediate, before_800ms: focusBeforeDwell, after_1000ms: focusOpen });

  await page.locator('#pmhv-disabled').hover();
  await page.evaluate(() => {
    const anchor = document.getElementById('pmhv-disabled'), tag = document.getElementById('pm-hover-tag-visual');
    window.__pmhvFocusDeparture = new Promise(resolve => anchor.addEventListener('pointerout', () => {
      setTimeout(() => resolve({ active: document.activeElement?.id || null, open: tag.dataset.open,
        active_key: window.PM_HOVER_TAG_CONTROLLER.activeModel?.key || null,
        anchor_key: anchor.getAttribute('data-pm-hover-key') }), 190);
    }, { once: true }));
  });
  await page.locator('#pmhv-blank').hover();
  const focusDeparture = await page.evaluate(() => window.__pmhvFocusDeparture);
  check('keyboard_focus_retained_after_pointer_leave', focusDeparture.active === 'pmhv-disabled' && focusDeparture.open === 'true' &&
    focusDeparture.active_key === focusDeparture.anchor_key, focusDeparture);

  await page.keyboard.press('Escape');
  const escaped = await page.evaluate(() => ({ open: document.getElementById('pm-hover-tag-visual').dataset.open,
    active_key: window.PM_HOVER_TAG_CONTROLLER.activeModel?.key || null }));
  check('escape_closes', escaped.open === 'false' && escaped.active_key === null, escaped);

  await page.evaluate(() => document.activeElement?.blur?.());
  await page.locator('#pmhv-detail').hover();
  await page.waitForTimeout(900);
  const typography = await page.evaluate(() => {
    const tag = document.getElementById('pm-hover-tag-visual'), strong = tag.querySelector('strong'), detail = tag.querySelector('p');
    return { min_height: parseFloat(getComputedStyle(tag).minHeight), max_width: parseFloat(getComputedStyle(tag).maxWidth),
      padding_left: parseFloat(getComputedStyle(tag).paddingLeft), primary_px: parseFloat(getComputedStyle(strong).fontSize),
      detail_px: parseFloat(getComputedStyle(detail).fontSize), detail: detail.textContent };
  });
  check('typography_and_bounds', typography.min_height >= 24 && typography.max_width <= 280 && typography.padding_left === 8 && typography.primary_px === 12 && typography.detail_px === 11 && typography.detail.length > 0, typography);

  const geometry = [];
  for (const id of ['pmhv-corner-tl', 'pmhv-corner-tr', 'pmhv-corner-bl', 'pmhv-corner-br']) {
    await page.locator('#' + id).hover();
    await page.waitForTimeout(900);
    geometry.push(await page.evaluate(anchorId => {
      const ctl = window.PM_HOVER_TAG_CONTROLLER, tag = document.getElementById('pm-hover-tag-visual');
      ctl.position();
      const r = tag.getBoundingClientRect(), a = document.getElementById(anchorId).getBoundingClientRect();
      return { id: anchorId, left: r.left, top: r.top, right: r.right, bottom: r.bottom, placement: tag.dataset.placement,
        viewport_width: innerWidth, viewport_height: innerHeight, anchor_top: a.top, anchor_bottom: a.bottom,
        inside: r.left >= 7.5 && r.top >= 7.5 && r.right <= innerWidth - 7.5 && r.bottom <= innerHeight - 7.5 };
    }, id));
  }
  check('position_flip_and_clamp', geometry.every(row => row.inside) && geometry.some(row => row.placement === 'below') && geometry.some(row => row.placement === 'above'), geometry);

  await page.locator('#pmhv-detail').hover();
  await page.waitForTimeout(900);
  await page.evaluate(() => {
    const anchor = document.getElementById('pmhv-detail'), tag = document.getElementById('pm-hover-tag-visual');
    window.__pmhvGraceProbe = new Promise(resolve => anchor.addEventListener('pointerout', event => {
      const departedAt = event.timeStamp;
      const samples = { pointerout_event_timestamp: departedAt };
      setTimeout(() => { samples.at_150ms = tag.dataset.open; }, 150);
      setTimeout(() => { samples.at_250ms = tag.dataset.open; resolve(samples); }, 250);
    }, { once: true }));
  });
  await page.locator('#pmhv-blank').hover();
  const graceSamples = await page.evaluate(() => window.__pmhvGraceProbe);
  check('departure_grace_220ms', graceSamples.at_150ms === 'true' && graceSamples.at_250ms === 'false', graceSamples);

  const visualSetting = await page.evaluate(() => {
    const ctl = window.PM_HOVER_TAG_CONTROLLER, anchor = document.getElementById('pmhv-detail');
    ctl.open(anchor, 'focus');ctl.setVisualEnabled(false);
    const tag = document.getElementById('pm-hover-tag-visual'), desc = document.getElementById(anchor.getAttribute('aria-describedby'));
    const off = { visual_enabled: ctl.visualEnabled, tag_hidden: tag.hidden, description_present: Boolean(desc && desc.textContent) };
    ctl.setVisualEnabled(true);ctl.close(true);
    return off;
  });
  check('show_tooltips_visual_only', visualSetting.visual_enabled === false && visualSetting.tag_hidden && visualSetting.description_present, visualSetting);

  const themes = await page.evaluate(() => {
    const ctl = window.PM_HOVER_TAG_CONTROLLER, anchor = document.getElementById('pmhv-detail'), out = {};
    const forceActive = () => {
      ctl.cancelPendingOpen();const model = ctl.refresh(anchor);ctl.active = anchor;ctl.activeModel = model;
      ctl.render(model);ctl.tag.hidden = false;ctl.tag.dataset.open = 'true';ctl.position();
    };
    for (const theme of ['basic-dark','basic-light','friendly-dark','friendly-light','glass-dark','glass-light','retro-dark','retro-light']) {
      document.documentElement.dataset.theme = theme;forceActive();
      const tag = document.getElementById('pm-hover-tag-visual'), style = getComputedStyle(tag);
      out[theme] = { background: style.backgroundColor, color: style.color, radius: style.borderRadius,
        transition_duration: style.transitionDuration, transform: style.transform };
      tag.style.transition = 'none';tag.dataset.open = 'false';
      out[theme].closed_transform = getComputedStyle(tag).transform;
      tag.dataset.open = 'true';tag.style.transition = '';
    }
    document.documentElement.dataset.theme = 'friendly-dark';ctl.close(true);return out;
  });
  const everyThemePainted = Object.values(themes).every(row => row.background !== 'rgba(0, 0, 0, 0)' && row.color !== 'rgba(0, 0, 0, 0)');
  const retroSteppedNoScale = ['retro-dark','retro-light'].every(theme => themes[theme].transition_duration.split(',')[0].trim() === '0.14s');
  const standard240 = ['basic-dark','basic-light','friendly-dark','friendly-light','glass-dark','glass-light'].every(theme => themes[theme].transition_duration.split(',')[0].trim() === '0.24s');
  const scaleOf = transform => transform === 'none' ? 1 : Number((/^matrix\(([^,]+)/.exec(transform) || [null, NaN])[1]);
  const retroClosedScaleOne = ['retro-dark','retro-light'].every(theme => Math.abs(scaleOf(themes[theme].closed_transform) - 1) < 0.001);
  const standardClosedScale = ['basic-dark','basic-light','friendly-dark','friendly-light','glass-dark','glass-light'].every(theme => Math.abs(scaleOf(themes[theme].closed_transform) - 0.98) < 0.001);
  check('eight_theme_pairs_and_motion', everyThemePainted && retroSteppedNoScale && standard240 && retroClosedScaleOne && standardClosedScale, themes);

  await page.emulateMedia({ reducedMotion: 'reduce' });
  const reducedMotion = await page.evaluate(async () => {
    const ctl = window.PM_HOVER_TAG_CONTROLLER, anchor = document.getElementById('pmhv-detail'), tag = document.getElementById('pm-hover-tag-visual');
    const model=ctl.refresh(anchor);ctl.active=anchor;ctl.activeModel=model;ctl.render(model);tag.hidden=false;tag.dataset.open='true';ctl.position();
    const transition = getComputedStyle(tag).transitionDuration;ctl.close(false);
    await new Promise(resolve => setTimeout(resolve, 0));
    return { controller_reduced: ctl.reduced, motion_ms: ctl.motionMs(), transition_duration: transition, hidden_after_zero_tick: tag.hidden };
  });
  check('reduced_motion_immediate', reducedMotion.controller_reduced && reducedMotion.motion_ms === 0 && reducedMotion.transition_duration.split(',').every(value => parseFloat(value) === 0) && reducedMotion.hidden_after_zero_tick, reducedMotion);
  await page.emulateMedia({ reducedMotion: 'no-preference' });

  const glassAlpha = await page.evaluate(() => {
    const ctl = window.PM_HOVER_TAG_CONTROLLER, html = document.documentElement;
    html.dataset.theme = 'glass-dark';html.style.setProperty('--glass-alpha', '.35');
    const low = getComputedStyle(document.getElementById('pm-hover-tag-visual')).backgroundColor;
    html.style.setProperty('--glass-alpha', '.88');const high = getComputedStyle(document.getElementById('pm-hover-tag-visual')).backgroundColor;
    html.style.removeProperty('--glass-alpha');html.dataset.theme = 'friendly-dark';ctl.close(true);return { low, high };
  });
  check('glass_live_transparency', glassAlpha.low !== glassAlpha.high, glassAlpha);

  const liveAdversary = await page.evaluate(async () => {
    const ctl = window.PM_HOVER_TAG_CONTROLLER;
    const fixture = document.getElementById('pm-hover-verification-fixture');
    const host = document.createElement('section');
    host.id = 'pmhv-live-adversary';
    host.style.cssText = 'position:absolute;left:20px;top:180px;pointer-events:auto';
    host.innerHTML = '<button id="pmhv-live-a" aria-label="Live A">A</button><button id="pmhv-live-b" aria-label="Live B">B</button>';
    fixture.appendChild(host);
    await ctl.settle(host);
    const waitFor = async (predicate, timeoutMs = 8000) => {
      const deadline = performance.now() + timeoutMs;
      while (!predicate()) {
        if (performance.now() > deadline) return false;
        await new Promise(resolve => requestAnimationFrame(resolve));
      }
      return true;
    };
    const description = element => document.getElementById(element.getAttribute('aria-describedby'))?.textContent || null;
    const a = document.getElementById('pmhv-live-a'), b = document.getElementById('pmhv-live-b');

    a.setAttribute('aria-label', 'Live A changed');
    b.setAttribute('aria-label', 'Live B changed');
    const disjointUpdated = await waitFor(() => description(a) === 'Live A changed' && description(b) === 'Live B changed');

    a.setAttribute('title', 'Native title migrated again');
    await Promise.resolve();
    const titleMigrated = await waitFor(() => !a.hasAttribute('title') && description(a) === 'Native title migrated again');

    let semanticNoopEnqueues = 0, semanticNoopBinds = 0;
    const originalEnqueueLive = ctl.enqueueLive, originalBindForNoop = ctl.bind;
    ctl.enqueueLive = function (element, ...values) {
      if (element === b) semanticNoopEnqueues++;
      return originalEnqueueLive.call(this, element, ...values);
    };
    ctl.bind = function (element, ...values) {
      if (element === b) semanticNoopBinds++;
      return originalBindForNoop.call(this, element, ...values);
    };
    const stableLabel = b.getAttribute('aria-label');
    for (let index = 0; index < 24; index++) b.setAttribute('aria-label', stableLabel);
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    ctl.enqueueLive = originalEnqueueLive;ctl.bind = originalBindForNoop;

    const bDescription = document.getElementById(b.getAttribute('aria-describedby'));
    let idempotentWrites = 0;
    const countWrites = records => { idempotentWrites += records.length; };
    const anchorObserver = new MutationObserver(countWrites), descriptionObserver = new MutationObserver(countWrites);
    anchorObserver.observe(b, { attributes: true, childList: true, characterData: true, subtree: true });
    descriptionObserver.observe(bDescription, { attributes: true, childList: true, characterData: true, subtree: true });
    for (let index = 0; index < 8; index++) ctl.refresh(b);
    await new Promise(resolve => setTimeout(resolve, 0));
    anchorObserver.disconnect();descriptionObserver.disconnect();

    let collectCalls = 0;
    const originalCollect = ctl.collect;
    ctl.collect = function (...values) { collectCalls++;return originalCollect.apply(this, values); };
    let churn = true, churnFrames = 0;
    const churnLoop = () => {
      if (!churn) return;
      churnFrames++;
      a.style.opacity = churnFrames % 2 ? '.99' : '1';
      a.setAttribute('aria-selected', churnFrames % 2 ? 'true' : 'false');
      if (a.firstChild) a.firstChild.data = churnFrames % 2 ? 'A' : 'A.';
      requestAnimationFrame(churnLoop);
    };
    requestAnimationFrame(churnLoop);
    await new Promise(resolve => {
      const start = churnFrames;
      const inspect = () => churnFrames - start >= 12 ? resolve() : requestAnimationFrame(inspect);
      inspect();
    });
    const collectCallsFromLiveChurn = collectCalls;

    const deep = document.createElement('div');
    deep.id = 'pmhv-live-deep';
    deep.innerHTML = '<button id="pmhv-live-disabled" disabled title="Blocked live control">Blocked</button>' +
      '<code id="pmhv-live-technical" data-technical-id="run:live-adversary">run:live-adversary</code>' +
      '<span id="pmhv-live-status" data-status="degraded">Degraded</span>' +
      '<svg aria-label="Live chart"><circle id="pmhv-live-chart" data-chart-mark="live" data-value="7" aria-label="Seven" cx="7" cy="7" r="2"/></svg>';
    const settleStarted = performance.now();
    const settledPromise = Promise.race([
      ctl.settle(document).then(census => ({ timed_out: false, census })),
      new Promise(resolve => setTimeout(() => resolve({ timed_out: true, census: null }), 15000))
    ]);
    setTimeout(() => host.appendChild(deep), 0);
    const settled = await settledPromise;
    const settleDurationMs = performance.now() - settleStarted;
    churn = false;
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const deepNodes = ['pmhv-live-disabled','pmhv-live-technical','pmhv-live-status','pmhv-live-chart'].map(id => document.getElementById(id));
    const deepBound = deepNodes.every(node => node?.getAttribute('data-pm-hover-bound') === 'true' && description(node));
    const disabledAccessible = deepNodes[0]?.getAttribute('aria-disabled') === 'true' && !deepNodes[0]?.disabled && deepNodes[0]?.tabIndex >= 0;
    const removedDescriptionIds = deepNodes.map(node => node?.getAttribute('aria-describedby')).filter(Boolean);
    deep.remove();
    const removedClean = await waitFor(() => removedDescriptionIds.every(id => !document.getElementById(id)));
    ctl.collect = originalCollect;
    host.remove();
    return {
      disjoint_updated: disjointUpdated,
      title_migrated: titleMigrated,
      semantic_noop_enqueues: semanticNoopEnqueues,
      semantic_noop_binds: semanticNoopBinds,
      idempotent_refresh_writes: idempotentWrites,
      collect_calls_from_live_churn: collectCallsFromLiveChurn,
      churn_frames: churnFrames,
      settle_timed_out: settled.timed_out,
      settle_duration_ms: settleDurationMs,
      settle_pass: settled.census?.pass || false,
      deep_bound: deepBound,
      disabled_accessible: disabledAccessible,
      removed_descriptions_clean: removedClean,
      last_live: ctl.lastLive
    };
  });
  check('live_disjoint_and_native_title_updates', liveAdversary.disjoint_updated && liveAdversary.title_migrated, liveAdversary);
  check('semantic_noop_attributes_do_not_invalidate', liveAdversary.semantic_noop_enqueues === 0 && liveAdversary.semantic_noop_binds === 0, liveAdversary);
  check('idempotent_refresh_has_zero_hover_writes', liveAdversary.idempotent_refresh_writes === 0, liveAdversary);
  check('live_churn_never_requests_full_census', liveAdversary.collect_calls_from_live_churn === 0 && liveAdversary.churn_frames >= 12, liveAdversary);
  check('settle_completes_during_continuous_churn', !liveAdversary.settle_timed_out && liveAdversary.settle_pass && liveAdversary.settle_duration_ms < 15000, liveAdversary);
  check('insert_remove_subtree_incremental_cleanup', liveAdversary.deep_bound && liveAdversary.disabled_accessible && liveAdversary.removed_descriptions_clean, liveAdversary);

  const negative = await page.evaluate(async () => {
    const ctl = window.PM_HOVER_TAG_CONTROLLER, fixture = document.getElementById('pm-hover-verification-fixture');
    ctl.disconnect();
    const holder = document.createElement('div');holder.id = 'pmhv-negative';
    holder.innerHTML = '<button id="pmhv-missing">Missing</button>' +
      '<button data-pm-hover-key="pmhv:duplicate">Duplicate A</button><button data-pm-hover-key="pmhv:duplicate">Duplicate B</button>' +
      '<button data-pm-hover-exempt="made-up-reason">Unknown exemption</button>' +
      '<button id="pmhv-inaccessible" aria-disabled="true" tabindex="-1">Blocked</button>' +
      '<span id="pmhv-native" title="Native only">N</span>';
    fixture.appendChild(holder);
    const missing = ctl.audit(holder);
    ctl.scan(holder);
    const staleAnchor = holder.querySelector('[data-pm-hover-bound="true"]');
    document.getElementById(staleAnchor.getAttribute('aria-describedby')).textContent = 'stale';
    const guarded = ctl.audit(holder);
    holder.remove();ctl.observe();await ctl.settle(fixture);
    return { missing: missing.failures, guarded: guarded.failures };
  });
  const negativeCodes = new Set([...negative.missing, ...negative.guarded].map(row => row.code));
  const requiredNegative = ['missing_binding','undocumented_exemption','actionable_exemption','duplicate_key','stale_text','inaccessible_disabled_control','native_title_only'];
  check('fail_closed_census_probes', requiredNegative.every(code => negativeCodes.has(code)), { required: requiredNegative, observed: [...negativeCodes].sort(), evidence: negative });

  const finalCensus = await page.evaluate(async () => window.PM_HOVER_TAG_CONTROLLER.settle(document.getElementById('pm-hover-verification-fixture')));
  check('fixture_recovers_after_negative_probes', finalCensus.pass, finalCensus);

  const contract = await page.evaluate(() => window.PM_HOVER_TAG_CONTROLLER.slint_projection);
  check('typed_slint_projection', contract?.schema_id === 'pm.hover_tag.slint_projection.v1' && contract.anchor_geometry.includes('AnchorGeometry') && contract.overlay_geometry.includes('OverlayGeometry') && contract.timers.pointer_open_ms === 1050 && contract.timers.pointer_stationary_ms === 750 && contract.timers.pointer_radius_px === 5 && contract.timers.focus_open_ms === 900 && contract.timers.departure_grace_ms === 220 && contract.timers.standard_motion_ms === 240 && contract.timers.retro_motion_ms === 140 && contract.timers.reduced_motion_ms === 0 && /no Canvas/.test(contract.portability), contract);
} catch (error) {
  report.runtime_errors.push({ kind: 'runner', text: String(error && error.stack || error).slice(0, 2000) });
} finally {
  try { await context.close(); }
  catch (error) { report.runtime_errors.push({ kind: 'context-close', text: String(error && error.stack || error).slice(0, 2000) }); }
  try { await provenanceRun.finalizeBeforeBrowserClose(browser); }
  catch (error) { report.runtime_errors.push({ kind: 'provenance-pre-close', text: String(error && error.stack || error).slice(0, 2000) }); }
  try { await browser.close(); }
  catch (error) { report.runtime_errors.push({ kind: 'browser-close', text: String(error && error.stack || error).slice(0, 2000) }); }
  try { report.provenance = await provenanceRun.finalizeAfterBrowserClose(); }
  catch (error) {
    report.runtime_errors.push({ kind: 'provenance-post-close', text: String(error && error.stack || error).slice(0, 2000) });
    report.provenance = provenanceRun.envelope;
  }
}

let provenanceAdmissionError = null;
try { assertProvenanceAdmission(report.provenance); }
catch (error) { provenanceAdmissionError = String(error && error.stack || error); }
check('shared_browser_provenance_admission', provenanceAdmissionError === null && report.provenance.admission?.pass === true, {
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
const policyProbeNames = report.provenance.network?.policy_probe?.receipts?.map(row => row.name) || [];
check('strict_provenance_v2_policy_denominator', report.provenance.schema_id === 'pm.browser_verifier_provenance.v2' && report.provenance.schema_version === '2.0.0' && policyProbeNames.length === REQUIRED_POLICY_PROBES.length && JSON.stringify(policyProbeNames.slice().sort()) === JSON.stringify(REQUIRED_POLICY_PROBES.slice().sort()) && report.provenance.network?.os_egress?.enforced === true && report.provenance.network?.os_egress?.loopback_only === true && report.provenance.network?.os_egress?.non_loopback_egress_denied === true, {
  schema_id: report.provenance.schema_id,
  schema_version: report.provenance.schema_version,
  expected_policy_probes: REQUIRED_POLICY_PROBES,
  observed_policy_probes: policyProbeNames,
  os_egress: report.provenance.network?.os_egress
});
check('exact_browser_only_certification_boundary', JSON.stringify(report.execution_boundary) === JSON.stringify(BROWSER_ONLY_BOUNDARY) && JSON.stringify(report.provenance.certification_boundary) === JSON.stringify(BROWSER_ONLY_BOUNDARY), { verifier: report.execution_boundary, provenance: report.provenance.certification_boundary });
check('runtime_errors', report.runtime_errors.length === 0 && report.provenance.runtime_errors.count === 0, {
  verifier: report.runtime_errors,
  provenance: report.provenance.runtime_errors
});
report.pass = Object.values(report.checks).every(row => row.pass);
writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');
if (!report.pass) {
  console.error(JSON.stringify({ pass: false, report: reportPath, failed: Object.entries(report.checks).filter(([, row]) => !row.pass).map(([name]) => name) }));
  process.exit(1);
}
console.log(JSON.stringify({ pass: true, report: reportPath, checks: Object.keys(report.checks).length, census: report.census?.counts || null }));
