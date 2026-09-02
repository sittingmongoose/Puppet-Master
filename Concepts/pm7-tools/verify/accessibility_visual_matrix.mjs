/* Deterministic PMConcept7 accessibility and visual browser matrix.
 *
 * Browser-concept evidence only. This verifier does not certify native Slint,
 * native assistive-technology integration, production wiring, or runtime
 * readiness.
 *
 * Usage:
 *   node accessibility_visual_matrix.mjs \
 *     --file /absolute/path/to/PMConcept7.html \
 *     --outdir /absolute/path/to/evidence-directory \
 *     --modules /path/containing/node_modules/playwright-core \
 *     --chromium /usr/bin/google-chrome \
 *     --expected-artifact-sha256 <sha256> --expected-verifier-sha256 <sha256> \
 *     --expected-helper-sha256 <sha256>
 */

import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import {
  closeSync,
  constants as fsConstants,
  fstatSync,
  lstatSync,
  mkdirSync,
  openSync,
  readFileSync,
  realpathSync,
  writeFileSync
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
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
const evidencePath = join(resolve(args.outdir), 'accessibility-visual-matrix.json');
mkdirSync(args.outdir, { recursive: true });
const scriptDir = dirname(fileURLToPath(import.meta.url));
const geometryManifestPath = resolve(scriptDir, '..', 'k3_geometry_manifest.json');

function supplementalStat(stat) {
  return {
    device: Number(stat.dev),
    inode: Number(stat.ino),
    mode: Number(stat.mode),
    size_bytes: Number(stat.size),
    mtime_ns: String(stat.mtimeNs)
  };
}

function sameSupplementalStat(left, right) {
  return ['device', 'inode', 'mode', 'size_bytes', 'mtime_ns'].every(key => left?.[key] === right?.[key]);
}

function readSupplementalBinding(path) {
  const absolutePath = resolve(path);
  const leaf = lstatSync(absolutePath, { bigint: true });
  if (leaf.isSymbolicLink()) throw new Error(`K3 geometry manifest must not be a symlink: ${absolutePath}`);
  const realPath = realpathSync(absolutePath);
  if (realPath !== absolutePath) throw new Error(`K3 geometry manifest must not traverse a symlink: ${absolutePath}`);
  const fd = openSync(absolutePath, fsConstants.O_RDONLY | (fsConstants.O_NOFOLLOW || 0));
  try {
    const before = fstatSync(fd, { bigint: true });
    if (!before.isFile()) throw new Error(`K3 geometry manifest must be a regular file: ${absolutePath}`);
    const bytes = readFileSync(fd);
    const after = fstatSync(fd, { bigint: true });
    const initialStat = supplementalStat(before);
    if (bytes.length !== Number(before.size) || !sameSupplementalStat(initialStat, supplementalStat(after))) {
      throw new Error('K3 geometry manifest changed while being read');
    }
    return {
      bytes,
      record: {
        label: 'k3_geometry_manifest',
        absolute_requested_path: absolutePath,
        real_path: realPath,
        sha256: createHash('sha256').update(bytes).digest('hex'),
        expected_sha256: createHash('sha256').update(bytes).digest('hex'),
        post_use_sha256: null,
        is_regular_file: true,
        is_leaf_symlink: false,
        initial_stat: initialStat,
        pre_use_stat: initialStat,
        post_use_stat: null,
        unchanged: null
      }
    };
  } finally {
    closeSync(fd);
  }
}

function revalidateSupplementalBinding(binding) {
  const current = readSupplementalBinding(binding.record.absolute_requested_path);
  binding.record.post_use_sha256 = current.record.sha256;
  binding.record.post_use_stat = current.record.initial_stat;
  binding.record.unchanged = binding.record.real_path === current.record.real_path &&
    binding.record.sha256 === current.record.sha256 &&
    sameSupplementalStat(binding.record.initial_stat, current.record.initial_stat);
  return binding.record.unchanged;
}

const geometryBinding = readSupplementalBinding(geometryManifestPath);
const geometryManifestBytes = geometryBinding.bytes;
const geometryManifest = JSON.parse(geometryManifestBytes.toString('utf8'));
if (geometryManifest.schema_id !== 'pm.pmconcept7.k3_geometry_manifest.v1') throw new Error(`unsupported K3 geometry manifest: ${geometryManifest.schema_id}`);
const widths = geometryManifest.required_widths_px;
if (!Array.isArray(widths) || widths.length === 0 || widths.some(width => !Number.isInteger(width) || width <= 0) || new Set(widths).size !== widths.length) throw new Error('K3 geometry manifest required_widths_px must be a non-empty array of unique positive integers');
const geometryTolerance = geometryManifest.verification?.wide_measurement_tolerance_px;
if (!Number.isFinite(geometryTolerance) || geometryTolerance < 0) throw new Error('K3 geometry manifest verification.wide_measurement_tolerance_px must be a non-negative number');
const geometryRows = [geometryManifest.wide_geometry, ...(geometryManifest.responsive_geometry || [])];
if (!geometryManifest.wide_geometry || !Array.isArray(geometryManifest.responsive_geometry) || geometryManifest.responsive_geometry.length === 0 || geometryRows.some(row => !row || !Number.isFinite(row.rail_width_px) || !Number.isFinite(row.topbar_height_px))) throw new Error('K3 geometry manifest must define finite rail/topbar tokens for wide and responsive geometry');
if (!geometryManifest.continuous_structure || Object.values(geometryManifest.continuous_structure).some(selector => typeof selector !== 'string' || !selector.trim())) throw new Error('K3 geometry manifest continuous_structure must contain non-empty selectors');
const themes = ['friendly-dark', 'friendly-light', 'retro-dark', 'retro-light', 'basic-light', 'basic-dark', 'glass-dark', 'glass-light'];
const motionModes = [
  { id: 'full', reduced: false },
  { id: 'reduced', reduced: true }
];
const viewportHeight = 900;
const shortHeights = [480, 600];
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
    verifier: 'accessibility_visual_matrix',
    artifact_path: artifactPath,
    outdir: resolve(args.outdir),
    geometry_manifest_path: geometryManifestPath,
    geometry_manifest_sha256: geometryBinding.record.sha256,
    context_profiles: [
      'manifest-widthsx900,dpr1,en-US,UTC,dark',
      'manifest-widthsx900,dpr1,en-US,UTC,dark,reduced-motion',
      'short-window-matrix,dpr1,en-US,UTC,dark'
    ],
    timeout_ms: 180000,
    service_workers: 'block',
    accept_downloads: false,
    certification_mode: true
  }
});
provenanceRun.envelope.supplemental_inputs = { geometry_manifest: geometryBinding.record };
const target = provenanceRun.artifactUrl();

function expectedK3Geometry(hostWidth) {
  if (!Number.isFinite(hostWidth) || hostWidth < 0) throw new Error(`invalid Settings host width: ${hostWidth}`);
  const wide = geometryManifest.wide_geometry;
  if (hostWidth >= wide.minimum_host_width_px) {
    return { rail_width_px: wide.rail_width_px, topbar_height_px: wide.topbar_height_px, band: 'wide', mobile_off_canvas: false };
  }
  const band = geometryManifest.responsive_geometry.find(row => hostWidth >= row.minimum_host_width_px && hostWidth <= row.maximum_host_width_px);
  if (!band) throw new Error(`K3 geometry manifest does not cover Settings host width ${hostWidth}`);
  return {
    rail_width_px: band.rail_width_px,
    topbar_height_px: band.topbar_height_px,
    band: `${band.minimum_host_width_px}-${band.maximum_host_width_px}`,
    mobile_off_canvas: band.rail_width_px === 0
  };
}

mkdirSync(dirname(evidencePath), { recursive: true });
const report = {
  schema_id: 'pm.pmconcept7.accessibility_visual_browser_matrix.v1',
  generated_at_utc: new Date().toISOString(),
  disposition: 'fail',
  certification_boundary: { ...BROWSER_ONLY_BOUNDARY },
  execution_boundary: { ...BROWSER_ONLY_BOUNDARY },
  artifact: input,
  artifact_sha256: provenanceRun.envelope.artifact.sha256,
  geometry_manifest: geometryManifestPath,
  geometry_manifest_sha256: geometryBinding.record.sha256,
  supplemental_provenance: { geometry_manifest: geometryBinding.record },
  target,
  provenance: provenanceRun.envelope,
  deterministic_context: {
    browser_engine: 'system Chromium through playwright-core',
    device_scale_factor: 1,
    locale: 'en-US',
    timezone_id: 'UTC',
    color_scheme: 'dark',
    viewport_height: viewportHeight,
    widths,
    short_window_heights: shortHeights,
    themes,
    motion_modes: motionModes.map(row => row.id),
    stable_geometry_settle_ms_by_motion: { full: 520, reduced: 20 },
    external_requests_blocked: true,
    k3_geometry: {
      schema_id: geometryManifest.schema_id,
      measurement_tolerance_px: geometryTolerance,
      wide_geometry: geometryManifest.wide_geometry,
      responsive_geometry: geometryManifest.responsive_geometry
    }
  },
  assumptions: [
    'The generated artifact exposes window.PM12_KIMI and the Settings tab #tab-settings.',
    'The K3 Settings root is #pm-settings-root, its wide rail is .domain-rail, and its top bar is .topbar.',
    'Themes are the canonical data-theme values on document.documentElement.',
    'The T47 hover controller, when present, owns tooltip census and accessible descriptions.',
    'DOM roles, names, focus, and descriptions are browser proxies; a native screen-reader pass remains separate.'
  ],
  checks: [],
  matrix: [],
  short_window_matrix: [],
  keyboard_trace: [],
  screen_reader_structure: null,
  tooltip_accessibility: null,
  disabled_controls: null,
  runtime_errors: [],
  network_errors: [],
  findings: []
};

function addCheck(id, pass, evidence, severity = 'error') {
  const row = { id, pass: Boolean(pass), evidence };
  report.checks.push(row);
  if (!row.pass) report.findings.push({ id, severity, evidence });
  return row.pass;
}

let browser = null;

async function createHarness(motion, caseId) {
  if (!browser) throw new Error('bound browser is unavailable');
  const contextConfig = {
    viewport: { width: 1440, height: viewportHeight },
    deviceScaleFactor: 1,
    locale: 'en-US',
    timezoneId: 'UTC',
    colorScheme: 'dark',
    reducedMotion: motion.reduced ? 'reduce' : 'no-preference',
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
    window.__pmA11yLayoutShifts = [];
    try {
      new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) window.__pmA11yLayoutShifts.push({ value: entry.value, time: entry.startTime });
        }
      }).observe({ type: 'layout-shift', buffered: true });
    } catch (_error) {}
  });
  const guard = await provenanceRun.attachContext(context, { case_id: caseId, context_config: contextConfig });
  const page = await context.newPage();
  guard.instrumentPage(page);
  page.on('console', message => {
    if (message.type() === 'error') report.runtime_errors.push({ motion: motion.id, kind: 'console', text: message.text().slice(0, 1000) });
  });
  page.on('pageerror', error => report.runtime_errors.push({ motion: motion.id, kind: 'pageerror', text: String(error).slice(0, 1000) }));
  page.on('requestfailed', request => report.network_errors.push({ motion: motion.id, kind: 'requestfailed', method: request.method(), url: request.url(), error: request.failure()?.errorText || 'unknown' }));
  page.on('response', response => {
    if (response.status() >= 400) report.network_errors.push({ motion: motion.id, kind: 'http', status: response.status(), url: response.url() });
  });
  await guard.gotoBound(page, {
    navigation_id: `${caseId}:initial`,
    url: provenanceRun.artifactUrl({ case: caseId }),
    wait_until: 'load',
    timeout_ms: 180000
  });
  await page.waitForFunction(() => Boolean(window.PM12_KIMI), null, { timeout: 120000 });
  await page.evaluate(() => window.PM7_ONBOARDING_CINEMATIC?.skip?.());
  await page.evaluate(() => document.fonts?.ready);
  const opened = await page.evaluate(() => {
    if (window.PM7_SETTINGS_COMMANDS?.open) {
      window.PM7_SETTINGS_COMMANDS.open({ domain: 'general', workspace: 'appearance' });
      return 'PM7_SETTINGS_COMMANDS.open';
    }
    const tab = document.getElementById('tab-settings');
    if (tab) { tab.click(); return '#tab-settings'; }
    return null;
  });
  if (!opened) throw new Error('Settings route could not be opened through a public concept surface.');
  await page.waitForSelector('#pm-settings-root', { state: 'visible', timeout: 30000 });
  await page.waitForTimeout(120);
  return { context, page };
}

async function matrixSnapshot(page, theme, width, motion) {
  /* Stable-geometry evidence is sampled only after theme, responsive-host,
     and presentation motion have settled. This is deliberately preparation
     for a static geometry assertion, not an animation-duration test; motion
     behavior remains the responsibility of its dedicated verifier. */
  await page.evaluate(async ({ selectedTheme, settleMs }) => {
    const nextFrame = () => new Promise(resolveFrame => requestAnimationFrame(resolveFrame));
    document.documentElement.setAttribute('data-theme', selectedTheme);
    try { localStorage.setItem('pm.theme', selectedTheme); } catch (_error) {}
    await nextFrame();
    await nextFrame();
    if (window.PM7_SYSTEMS_INTEGRATION?.sync_host) {
      await window.PM7_SYSTEMS_INTEGRATION.sync_host();
    }
    await nextFrame();
    await nextFrame();
    await new Promise(resolveTimer => setTimeout(resolveTimer, settleMs));
    if (window.PM7_SYSTEMS_INTEGRATION?.sync_host) {
      await window.PM7_SYSTEMS_INTEGRATION.sync_host();
    }
    await nextFrame();
    await nextFrame();
  }, { selectedTheme: theme, settleMs: motion.reduced ? 20 : 520 });

  return page.evaluate(async ({ selectedTheme, selectedWidth, motionId, structureSelectors }) => {
    const serializedRectFields = ['x', 'y', 'width', 'height', 'left', 'right', 'top', 'bottom'];
    const assertSerializedRect = (value, label) => {
      const missing = serializedRectFields.filter(field => !Object.hasOwn(value, field) || !Number.isFinite(value[field]));
      if (missing.length) throw new Error(`${label} serialized rectangle is missing finite fields: ${missing.join(', ')}`);
      return value;
    };
    const rectangleContractSelfCheck = (() => {
      try {
        assertSerializedRect({ x: 0, y: 0, width: 1, height: 1, right: 1, top: 0, bottom: 1 }, 'self-check fixture');
        return false;
      } catch (error) {
        return String(error).includes('left');
      }
    })();
    if (!rectangleContractSelfCheck) throw new Error('serialized rectangle field-mismatch self-check did not reject a missing left field');
    const rect = node => {
      if (!node) return null;
      const value = node.getBoundingClientRect();
      return assertSerializedRect({ x: value.x, y: value.y, width: value.width, height: value.height, left: value.left, right: value.right, top: value.top, bottom: value.bottom }, 'DOM');
    };
    const finiteRect = value => Boolean(value && serializedRectFields.every(field => Number.isFinite(value[field])));
    const cssPixels = value => {
      const parsed = Number.parseFloat(String(value || '').trim());
      return Number.isFinite(parsed) ? parsed : null;
    };
    const root = document.getElementById('pm-settings-root');
    const panel = document.getElementById('panel-settings');
    const rail = panel?.querySelector('.domain-rail') || null;
    const topbar = panel?.querySelector('.topbar') || null;
    const shell = root?.querySelector('.pm-shell') || null;
    const workspaceShell = root?.querySelector('.workspace-shell') || null;
    const mobileMenu = root?.querySelector('.mobile-menu') || null;
    const before = { panel: rect(panel), root: rect(root), rail: rect(rail), topbar: rect(topbar) };
    await new Promise(resolveFrame => requestAnimationFrame(() => requestAnimationFrame(resolveFrame)));
    const after = { panel: rect(panel), root: rect(root), rail: rect(rail), topbar: rect(topbar) };
    const delta = (a, b) => !a || !b ? null : Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y), Math.abs(a.width - b.width), Math.abs(a.height - b.height));
    const panelRect = after.panel;
    const railRect = after.rail;
    const topbarRect = after.topbar;
    const rootStyle = root ? getComputedStyle(root) : null;
    const railStyle = rail ? getComputedStyle(rail) : null;
    const shellStyle = shell ? getComputedStyle(shell) : null;
    const mobileMenuStyle = mobileMenu ? getComputedStyle(mobileMenu) : null;
    const panelWidth = panelRect?.width ?? null;
    /* Scope the repeated census to the delivered Settings surface. The host
       contains many intentionally dormant demo panels; traversing those at
       every matrix point adds no Settings evidence and needlessly forces
       layout across the entire generated artifact. */
    const visibleFocusable = [...(root || document).querySelectorAll('a[href],button,input,select,textarea,[tabindex]')]
      .filter(node => node.tabIndex >= 0 && getComputedStyle(node).visibility !== 'hidden' && getComputedStyle(node).display !== 'none' && node.getClientRects().length > 0);
    return {
      theme: document.documentElement.getAttribute('data-theme'),
      width: selectedWidth,
      viewport_width: innerWidth,
      motion: motionId,
      reduced_motion_media: matchMedia('(prefers-reduced-motion: reduce)').matches,
      rectangle_contract_self_check: rectangleContractSelfCheck,
      root_visible: Boolean(root && getComputedStyle(root).visibility !== 'hidden' && root.getBoundingClientRect().width > 0),
      panel_width: panelWidth,
      host_geometry: panelRect,
      host_geometry_finite: finiteRect(panelRect) && panelRect.width > 0 && panelRect.height > 0,
      topbar_geometry: topbarRect,
      topbar_geometry_finite: finiteRect(topbarRect) && topbarRect.width > 0 && topbarRect.height > 0,
      rail_width: railRect?.width ?? null,
      topbar_height: topbarRect?.height ?? null,
      rail_width_token_px: cssPixels(rootStyle?.getPropertyValue('--k3-rail-w')),
      topbar_height_token_px: cssPixels(rootStyle?.getPropertyValue('--k3-topbar-h')),
      structure_presence: Object.fromEntries(Object.entries(structureSelectors).map(([key, selector]) => [key, Boolean(document.querySelector(selector))])),
      mobile_structure: {
        shell_present: Boolean(shell),
        rail_in_shell: Boolean(rail && shell && rail.parentElement === shell),
        workspace_in_shell: Boolean(workspaceShell && shell && workspaceShell.parentElement === shell),
        shell_grid_template_columns: shellStyle?.gridTemplateColumns || null,
        rail_position: railStyle?.position || null,
        rail_transform: railStyle?.transform || null,
        rail_geometry: railRect,
        rail_geometry_finite: finiteRect(railRect),
        rail_entirely_off_canvas: Boolean(finiteRect(railRect) && finiteRect(panelRect) && railRect.right <= panelRect.left + 0.5),
        mobile_menu_visible: Boolean(mobileMenu && mobileMenuStyle?.display !== 'none' && mobileMenuStyle?.visibility !== 'hidden' && mobileMenu.getClientRects().length > 0)
      },
      document_client_width: document.documentElement.clientWidth,
      document_scroll_width: document.documentElement.scrollWidth,
      body_client_width: document.body.clientWidth,
      body_scroll_width: document.body.scrollWidth,
      document_horizontal_overflow_px: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
      body_horizontal_overflow_px: Math.max(0, document.body.scrollWidth - document.body.clientWidth),
      focusable_visible_count: visibleFocusable.length,
      stable_geometry_max_delta_px: Math.max(delta(before.panel, after.panel) || 0, delta(before.root, after.root) || 0, delta(before.rail, after.rail) || 0, delta(before.topbar, after.topbar) || 0),
      layout_shift_sum: (window.__pmA11yLayoutShifts || []).reduce((sum, item) => sum + item.value, 0)
    };
  }, { selectedTheme: theme, selectedWidth: width, motionId: motion.id, structureSelectors: geometryManifest.continuous_structure });
}

async function semanticSnapshot(page) {
  return page.evaluate(async () => {
    if (window.PM_HOVER_TAG_CONTROLLER?.settle) await window.PM_HOVER_TAG_CONTROLLER.settle(document);
    const visible = node => {
      const style = getComputedStyle(node);
      return style.display !== 'none' && style.visibility !== 'hidden' && node.getClientRects().length > 0;
    };
    const name = node => {
      const labelledBy = (node.getAttribute('aria-labelledby') || '').split(/\s+/).filter(Boolean).map(id => document.getElementById(id)?.textContent || '').join(' ');
      const labels = node.labels ? [...node.labels].map(label => label.textContent || '').join(' ') : '';
      return (node.getAttribute('aria-label') || labelledBy || labels || node.getAttribute('alt') || node.textContent || '').replace(/\s+/g, ' ').trim();
    };
    const landmarkSelector = 'main,nav,aside,header,footer,[role="main"],[role="navigation"],[role="complementary"],[role="banner"],[role="contentinfo"],[role="region"]';
    const landmarks = [...document.querySelectorAll(landmarkSelector)].filter(visible).map(node => ({ tag: node.tagName.toLowerCase(), role: node.getAttribute('role'), name: name(node).slice(0, 160) }));
    const headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6,[role="heading"]')].filter(visible).map(node => ({ level: Number(node.getAttribute('aria-level')) || Number(node.tagName.slice(1)) || null, name: name(node).slice(0, 160) }));
    const controls = [...document.querySelectorAll('button,a[href],input,select,textarea,[role="button"],[role="link"],[role="tab"],[role="switch"],[role="checkbox"],[role="radio"],[role="slider"]')].filter(visible);
    const unnamed = controls.filter(node => !name(node) && !node.getAttribute('aria-labelledby')).map(node => ({ tag: node.tagName.toLowerCase(), id: node.id || null, action: node.getAttribute('data-action') || node.getAttribute('data-command-id') || node.getAttribute('data-ui-action-id') || null }));
    const duplicateIds = [...document.querySelectorAll('[id]')].map(node => node.id).filter((id, index, all) => id && all.indexOf(id) !== index).filter((id, index, all) => all.indexOf(id) === index);
    const invalidDescribedBy = [];
    const described = [...document.querySelectorAll('[aria-describedby]')];
    for (const node of described) {
      const missing = node.getAttribute('aria-describedby').split(/\s+/).filter(Boolean).filter(id => !document.getElementById(id));
      if (missing.length) invalidDescribedBy.push({ id: node.id || null, missing });
    }
    return { landmarks, headings, control_count: controls.length, unnamed_controls: unnamed, duplicate_ids: duplicateIds, describedby_count: described.length, invalid_describedby: invalidDescribedBy };
  });
}

async function tooltipSnapshot(page) {
  return page.evaluate(async () => {
    const census = window.PM_HOVER_TAG_CONTROLLER?.settle ? await window.PM_HOVER_TAG_CONTROLLER.settle(document) : null;
    const candidates = [...document.querySelectorAll('[data-pm-hover-bound="true"]')];
    const broken = [];
    for (const node of candidates) {
      const ids = (node.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean);
      const tooltip = ids.map(id => document.getElementById(id)).find(desc => desc?.getAttribute('role') === 'tooltip');
      if (!tooltip || !tooltip.textContent.trim()) broken.push({ key: node.getAttribute('data-pm-hover-key'), id: node.id || null });
    }
    return {
      controller_present: Boolean(window.PM_HOVER_TAG_CONTROLLER),
      census,
      bound_count: candidates.length,
      broken_descriptions: broken,
      native_title_count: document.querySelectorAll('[title]').length,
      visual_tooltip_role: document.getElementById('pm-hover-tag-visual')?.getAttribute('role') || null
    };
  });
}

async function disabledSnapshot(page, { activateDoctorCheck = false } = {}) {
  return page.evaluate(({ shouldActivateDoctorCheck }) => {
    let doctorCheckTriggered = false;
    if (shouldActivateDoctorCheck) {
      const trigger = document.querySelector('[data-action="doctor-check-scope"]');
      if (trigger && !trigger.disabled && trigger.getAttribute('aria-disabled') !== 'true') {
        trigger.click();
        doctorCheckTriggered = true;
      }
    }
    const visible = node => getComputedStyle(node).display !== 'none' && getComputedStyle(node).visibility !== 'hidden' && node.getClientRects().length > 0;
    const nodes = [...document.querySelectorAll('button:disabled,input:disabled,select:disabled,textarea:disabled,[aria-disabled="true"],[data-disabled="true"]')].filter(visible);
    const rows = nodes.map(node => {
      const descIds = (node.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean);
      const description = descIds.map(id => document.getElementById(id)?.textContent || '').join(' ').trim();
      const reason = node.getAttribute('data-disabled-reason') || node.getAttribute('aria-description') || description;
      return { id: node.id || null, tag: node.tagName.toLowerCase(), action: node.getAttribute('data-action') || node.getAttribute('data-command-id') || node.getAttribute('data-ui-action-id') || null, tabindex: node.tabIndex, aria_disabled: node.getAttribute('aria-disabled'), has_reason: Boolean(reason), reason: String(reason || '').slice(0, 240) };
    });
    return {
      sampled_state: shouldActivateDoctorCheck ? 'doctor_check_in_progress' : 'current',
      doctor_check_triggered: doctorCheckTriggered,
      doctor_checking: Boolean(window.PM12_KIMI?.getState?.().doctorChecking),
      count: rows.length,
      rows,
      failures: rows.filter(row => !row.has_reason || row.tabindex < 0 || row.aria_disabled !== 'true')
    };
  }, { shouldActivateDoctorCheck: activateDoctorCheck });
}

async function keyboardSnapshot(page) {
  await page.evaluate(() => { document.activeElement?.blur?.(); window.scrollTo(0, 0); });
  const trace = [];
  for (let index = 0; index < 32; index += 1) {
    await page.keyboard.press('Tab');
    const row = await page.evaluate(() => {
      const node = document.activeElement;
      if (!node || node === document.body) return { tag: null, focus_visible: false };
      const style = getComputedStyle(node);
      let pseudo = false;
      try { pseudo = node.matches(':focus-visible'); } catch (_error) {}
      const outlineVisible = style.outlineStyle !== 'none' && parseFloat(style.outlineWidth || '0') > 0 && style.outlineColor !== 'transparent';
      const shadowVisible = style.boxShadow !== 'none';
      return {
        tag: node.tagName.toLowerCase(),
        id: node.id || null,
        action: node.getAttribute('data-action') || node.getAttribute('data-command-id') || node.getAttribute('data-ui-action-id') || null,
        name: (node.getAttribute('aria-label') || node.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 160),
        focus_visible: pseudo && (outlineVisible || shadowVisible),
        pseudo_focus_visible: pseudo,
        outline: `${style.outlineStyle} ${style.outlineWidth} ${style.outlineColor}`,
        box_shadow: style.boxShadow
      };
    });
    trace.push(row);
  }
  await page.keyboard.press('Shift+Tab');
  const reverse = await page.evaluate(() => ({ tag: document.activeElement?.tagName?.toLowerCase() || null, id: document.activeElement?.id || null }));
  return { trace, reverse, unique_focus_targets: new Set(trace.map(row => `${row.tag}:${row.id}:${row.action}`)).size };
}

try {
  ({ browser } = await provenanceRun.launchChromium(chromium));
  for (const motion of motionModes) {
    const { context, page } = await createHarness(motion, `accessibility-${motion.id}`);
    /* Width is the outer loop so each manifest-required width is one physical
       resize per motion mode. Theme assertions remain independent at every
       width and motion mode. */
    for (const width of widths) {
      await page.setViewportSize({ width, height: viewportHeight });
      for (const theme of themes) {
        const row = await matrixSnapshot(page, theme, width, motion);
        const expected = Number.isFinite(row.panel_width) ? expectedK3Geometry(row.panel_width) : null;
        const coreStructure = Boolean(
          row.structure_presence.root && row.structure_presence.rail && row.structure_presence.topbar &&
          row.structure_presence.workspace_tabs && row.structure_presence.portal_root &&
          (row.structure_presence.document || row.structure_presence.manager)
        );
        const tokenPass = Boolean(expected &&
          row.rail_width_token_px !== null && Math.abs(row.rail_width_token_px - expected.rail_width_px) <= geometryTolerance &&
          row.topbar_height_token_px !== null && Math.abs(row.topbar_height_token_px - expected.topbar_height_px) <= geometryTolerance
        );
        const topbarPass = Boolean(expected && row.topbar_geometry_finite && row.topbar_height !== null && Math.abs(row.topbar_height - expected.topbar_height_px) <= geometryTolerance);
        const mobileOffCanvasPass = Boolean(expected?.mobile_off_canvas && coreStructure &&
          row.mobile_structure.shell_present && row.mobile_structure.rail_in_shell && row.mobile_structure.workspace_in_shell &&
          row.mobile_structure.rail_geometry_finite && row.mobile_structure.rail_geometry.width > 0 &&
          ['absolute', 'fixed'].includes(row.mobile_structure.rail_position) &&
          row.mobile_structure.rail_transform && row.mobile_structure.rail_transform !== 'none' &&
          row.mobile_structure.rail_entirely_off_canvas && row.mobile_structure.mobile_menu_visible
        );
        const railPass = Boolean(expected && (expected.mobile_off_canvas
          ? mobileOffCanvasPass
          : row.rail_width !== null && Math.abs(row.rail_width - expected.rail_width_px) <= geometryTolerance));
        const geometryPass = Boolean(expected && tokenPass && topbarPass && railPass && row.host_geometry_finite && coreStructure);
        row.expected_geometry = expected;
        row.pass = row.theme === theme && row.viewport_width === width && row.root_visible &&
          row.rectangle_contract_self_check &&
          row.document_horizontal_overflow_px === 0 && row.body_horizontal_overflow_px === 0 &&
          row.focusable_visible_count > 0 && row.stable_geometry_max_delta_px <= geometryTolerance &&
          geometryPass && row.reduced_motion_media === motion.reduced;
        row.assertions = {
          theme: row.theme === theme,
          physical_viewport_width: row.viewport_width === width,
          root_visible: row.root_visible,
          serialized_rectangle_field_mismatch_rejected: row.rectangle_contract_self_check,
          no_document_horizontal_overflow: row.document_horizontal_overflow_px === 0,
          no_body_horizontal_overflow: row.body_horizontal_overflow_px === 0,
          focusables_present: row.focusable_visible_count > 0,
          stable_geometry: row.stable_geometry_max_delta_px <= geometryTolerance,
          host_and_topbar_geometry_finite: row.host_geometry_finite && row.topbar_geometry_finite,
          continuous_core_structure: coreStructure,
          exact_responsive_tokens: tokenPass,
          rendered_topbar_geometry: topbarPass,
          rendered_rail_or_mobile_off_canvas: railPass,
          mobile_off_canvas_structure: expected?.mobile_off_canvas ? mobileOffCanvasPass : null,
          motion_media: row.reduced_motion_media === motion.reduced
        };
        report.matrix.push(row);
      }
    }
    await context.close();
  }
  const failedMatrix = report.matrix.filter(row => !row.pass);
  const expectedMatrixCases = widths.length * themes.length * motionModes.length;
  addCheck('matrix.all_themes_motion_widths', report.matrix.length === expectedMatrixCases && failedMatrix.length === 0, { cases: report.matrix.length, expected_cases: expectedMatrixCases, failures: failedMatrix });

  const shortHarness = await createHarness(motionModes[0], 'accessibility-short-window');
  for (const height of shortHeights) {
    for (const width of [320, 760, 1440]) {
      await shortHarness.page.setViewportSize({ width, height });
      const row = await shortHarness.page.evaluate(({ widthValue, heightValue }) => {
        const root = document.getElementById('pm-settings-root');
        const focusables = [...document.querySelectorAll('#pm-settings-root a[href],#pm-settings-root button,#pm-settings-root input,#pm-settings-root select,#pm-settings-root textarea,#pm-settings-root [tabindex]')].filter(node => node.tabIndex >= 0 && node.getClientRects().length > 0);
        return {
          width: widthValue,
          height: heightValue,
          root_visible: Boolean(root && root.getClientRects().length),
          document_horizontal_overflow_px: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
          body_horizontal_overflow_px: Math.max(0, document.body.scrollWidth - document.body.clientWidth),
          focusables: focusables.length,
          root_bottom: root?.getBoundingClientRect().bottom ?? null,
          viewport_height: innerHeight
        };
      }, { widthValue: width, heightValue: height });
      row.pass = row.root_visible && row.document_horizontal_overflow_px === 0 && row.body_horizontal_overflow_px === 0 && row.focusables > 0;
      report.short_window_matrix.push(row);
    }
  }
  addCheck('short_windows.usable', report.short_window_matrix.every(row => row.pass), report.short_window_matrix);

  await shortHarness.page.setViewportSize({ width: 1440, height: 900 });
  report.screen_reader_structure = await semanticSnapshot(shortHarness.page);
  addCheck('screen_reader_structure.named_controls', report.screen_reader_structure.control_count > 0 && report.screen_reader_structure.unnamed_controls.length === 0, report.screen_reader_structure.unnamed_controls);
  addCheck('screen_reader_structure.references_and_ids', report.screen_reader_structure.invalid_describedby.length === 0 && report.screen_reader_structure.duplicate_ids.length === 0, { invalid_describedby: report.screen_reader_structure.invalid_describedby, duplicate_ids: report.screen_reader_structure.duplicate_ids });
  addCheck('screen_reader_structure.landmarks_and_headings', report.screen_reader_structure.landmarks.length > 0 && report.screen_reader_structure.headings.length > 0, { landmarks: report.screen_reader_structure.landmarks, headings: report.screen_reader_structure.headings.slice(0, 50) });

  report.tooltip_accessibility = await tooltipSnapshot(shortHarness.page);
  addCheck('tooltips.controller_and_descriptions', report.tooltip_accessibility.controller_present && report.tooltip_accessibility.bound_count > 0 && report.tooltip_accessibility.broken_descriptions.length === 0 && report.tooltip_accessibility.visual_tooltip_role === 'tooltip' && (!report.tooltip_accessibility.census || report.tooltip_accessibility.census.pass), report.tooltip_accessibility);
  addCheck('tooltips.no_native_title', report.tooltip_accessibility.native_title_count === 0, { native_title_count: report.tooltip_accessibility.native_title_count });

  await shortHarness.page.evaluate(() => window.PM12_KIMI?.navigate?.('system', 'doctor'));
  await shortHarness.page.waitForTimeout(150);
  report.disabled_controls = await disabledSnapshot(shortHarness.page, { activateDoctorCheck: true });
  const doctorBusyControl = report.disabled_controls.rows.find(row => row.action === 'doctor-check-scope');
  addCheck('disabled_controls.reasons_and_keyboard_access', report.disabled_controls.doctor_check_triggered && report.disabled_controls.doctor_checking && Boolean(doctorBusyControl) && report.disabled_controls.count > 0 && report.disabled_controls.failures.length === 0, report.disabled_controls);
  await shortHarness.page.waitForFunction(() => !window.PM12_KIMI?.getState?.().doctorChecking, null, { timeout: 5000 });

  const keyboard = await keyboardSnapshot(shortHarness.page);
  report.keyboard_trace = keyboard.trace;
  addCheck('keyboard.forward_reverse_and_visible_focus', keyboard.unique_focus_targets >= 3 && keyboard.trace.filter(row => row.tag).every(row => row.focus_visible) && Boolean(keyboard.reverse.tag), keyboard);
  await shortHarness.context.close();

  addCheck('runtime.console_and_page_errors', report.runtime_errors.length === 0, report.runtime_errors);
  addCheck('runtime.network_errors', report.network_errors.length === 0, report.network_errors);
} catch (error) {
  report.runtime_errors.push({ kind: 'harness', text: String(error?.stack || error) });
  addCheck('harness.completed', false, { error: String(error?.stack || error) });
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
}

let geometryBindingUnchanged = false;
try { geometryBindingUnchanged = revalidateSupplementalBinding(geometryBinding); }
catch (error) { report.runtime_errors.push({ kind: 'geometry-manifest-revalidation', text: String(error?.stack || error) }); }
addCheck('supplemental_geometry_manifest_provenance', geometryBindingUnchanged &&
  geometryBinding.record.sha256 === report.geometry_manifest_sha256 &&
  geometryManifest.schema_id === 'pm.pmconcept7.k3_geometry_manifest.v1', {
  geometry_manifest: geometryBinding.record,
  schema_id: geometryManifest.schema_id
});
let provenanceAdmissionError = null;
try { assertProvenanceAdmission(report.provenance); }
catch (error) { provenanceAdmissionError = String(error?.stack || error); }
addCheck('shared_browser_provenance_admission', provenanceAdmissionError === null && report.provenance.admission?.pass === true, {
  admission: report.provenance.admission,
  error: provenanceAdmissionError,
  artifact: report.provenance.artifact,
  verifier: report.provenance.verifier,
  helper: report.provenance.helper,
  browser: report.provenance.browser,
  command: report.provenance.command,
  navigation_count: report.provenance.navigations?.length,
  network: report.provenance.network,
  certification_boundary: report.provenance.certification_boundary,
  supplemental_inputs: report.provenance.supplemental_inputs
});
addCheck('evidence_identity_and_browser_native_boundary',
  JSON.stringify(report.provenance.certification_boundary) === JSON.stringify(BROWSER_ONLY_BOUNDARY) &&
    JSON.stringify(report.certification_boundary) === JSON.stringify(BROWSER_ONLY_BOUNDARY) &&
    JSON.stringify(report.execution_boundary) === JSON.stringify(BROWSER_ONLY_BOUNDARY), {
  provenance_boundary: report.provenance.certification_boundary,
  certification_boundary: report.certification_boundary,
  execution_boundary: report.execution_boundary
});

report.summary = {
  check_count: report.checks.length,
  passed: report.checks.filter(row => row.pass).length,
  failed: report.checks.filter(row => !row.pass).length,
  matrix_cases: report.matrix.length,
  matrix_failures: report.matrix.filter(row => !row.pass).length,
  findings: report.findings.length,
  runtime_errors: report.runtime_errors.length,
  network_errors: report.network_errors.length
};
report.disposition = report.summary.failed === 0 && report.summary.runtime_errors === 0 && report.summary.network_errors === 0 ? 'pass' : 'fail';
writeFileSync(evidencePath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ disposition: report.disposition, report: evidencePath, summary: report.summary }));
if (report.disposition !== 'pass') process.exitCode = 1;
