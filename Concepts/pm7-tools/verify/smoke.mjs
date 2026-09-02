/* smoke.mjs -- functional smoke checklist for PM6-vs-PM7 behavior parity.
 *
 * Runs one scripted session against one immutable generated artifact and emits
 * certifying browser-concept JSON with product and provenance checks.
 * `parity` must deep-equal between the PM6 base run and the PM7 run
 * (compare with diff_parity.mjs); `info` is file-specific evidence (e.g.
 * the PM7 baked-wallpaper background-image) and is not compared.
 *
 * Checklist (from the verification design): load + page-sweep console
 * errors; theme switch all 8; glass slider min/mid/max + 3 bg modes;
 * settings search/bloom/deep-link; chat thread switch + model popout + FAB
 * fan-out; floating chat layout cycle; wizard stage advance; orchestrator
 * tabs + node inspector; terminal split to 2x2 + max-4 guard; dashboard
 * editor +N-more chip + widget drag; dev panel toggle/play/pause/chapter;
 * reduced-motion toggle.
 *
 * Determinism: seeded Math.random, frozen Date, demo clock paused at engine
 * assignment, preset localStorage -- identical for both files.
 *
 * Usage:
 *   node smoke.mjs --file <generated.html> --outdir <evidence-dir> \
 *     --modules <dir> --chromium <direct-executable> \
 *     --expected-artifact-sha256 <sha256> --expected-verifier-sha256 <sha256> \
 *     --expected-helper-sha256 <sha256>
 */

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
  'expected-helper-sha256': { required: true, validate: digest },
  'provenance-launch-receipt': { required: true },
  'expected-launch-receipt-sha256': { required: true, validate: digest }
});
const args = cli.parsed_args;
const artifactPath = resolve(args.file);
const outputDir = resolve(args.outdir);
const outputPath = join(outputDir, 'smoke-results.json');
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
      verifier: 'smoke',
      artifact_path: artifactPath,
      outdir: outputDir,
      context_profile: '1920x1080,dpr1,en-US,UTC,dark',
      timeout_ms: 60000,
      service_workers: 'block',
      certification_mode: true
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
    schema_id: 'pm.pmconcept7.smoke_provenance_failure.v1',
    disposition: 'provenance_preparation_or_launch_failed',
    generated_at_utc: new Date().toISOString(),
    certification_boundary: { ...BROWSER_ONLY_BOUNDARY },
    execution_boundary: { ...BROWSER_ONLY_BOUNDARY },
    command: cli,
    error: { kind: 'bootstrap', text: String(error?.stack || error) },
    provenance: failureProvenance
  };
  writeFileSync(outputPath, JSON.stringify(failure, null, 2) + '\n');
  console.log(JSON.stringify({ disposition: failure.disposition, result: outputPath }));
  process.exit(1);
}

const out = {
  schema_id: 'pm.pmconcept7.smoke_browser_verification.v2',
  disposition: 'fail',
  generated_at_utc: new Date().toISOString(),
  url: provenanceRun.artifactUrl(),
  certification_boundary: { ...BROWSER_ONLY_BOUNDARY },
  execution_boundary: { ...BROWSER_ONLY_BOUNDARY },
  provenance: provenanceRun.envelope,
  parity: {},
  info: {},
  checks: {},
  errors: [],
  runtime_errors: []
};
const P = out.parity;
const errors = [];
function recordCheck(name, pass, evidence) {
  out.checks[name] = { pass: Boolean(pass), evidence: evidence === undefined ? null : evidence };
}

let context;
let page;
let guard;
try {
const contextConfig = {
  viewport: { width: 1920, height: 1080 },
  deviceScaleFactor: 1,
  locale: 'en-US',
  timezoneId: 'UTC',
  colorScheme: 'dark',
  serviceWorkers: 'block',
  acceptDownloads: false
};
({ context, guard } = await provenanceRun.createBoundContext(browser, { case_id: 'smoke', context_config: contextConfig }));
await context.addInitScript(() => {
  (() => {
    let s = 0x9E3779B9 | 0;
    Math.random = function () {
      s = (Math.imul(s, 1664525) + 1013904223) | 0;
      return (s >>> 0) / 4294967296;
    };
  })();
  (() => {
    const FIXED = 1789000000000;
    const RealDate = Date;
    function FDate(...a) {
      if (!(this instanceof FDate)) return new RealDate(FIXED).toString();
      return a.length ? new RealDate(...a) : new RealDate(FIXED);
    }
    FDate.prototype = RealDate.prototype;
    FDate.now = () => FIXED;
    FDate.parse = RealDate.parse.bind(RealDate);
    FDate.UTC = RealDate.UTC.bind(RealDate);
    window.Date = FDate;
  })();
  (() => {
    let pd;
    Object.defineProperty(window, 'PM_DEMO', {
      configurable: true,
      get() { return pd; },
      set(v) {
        pd = v;
        try { if (v && v.clock && v.clock.pause && !v._shim) v.clock.pause(); } catch (e) {}
      },
    });
  })();
  try {
    localStorage.clear();
    localStorage.setItem('pm.theme', 'friendly-dark');
  } catch (e) {}
});
page = await context.newPage();
await guard.instrumentPage(page);
page.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)); });
page.on('pageerror', e => errors.push('pageerror: ' + String(e).slice(0, 200)));

await guard.gotoBound(page, {
  navigation_id: 'smoke:initial',
  url: provenanceRun.artifactUrl({ case: 'smoke' }),
  wait_until: 'load',
  timeout_ms: 60000
});
await page.waitForFunction(
  () => window.PM_DEMO && !window.PM_DEMO._shim && window.PM_PAGES,
  null, { timeout: 30000 });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(1200);
P.loadErrors = errors.slice();

/* ---- 1. page sweep ---- */
{
  const mark = errors.length;
  for (const p of ['projects', 'wizard', 'orchestrator', 'usage', 'settings',
                   'dashboard']) {
    await page.evaluate(id => window.PM_PAGES.go(id), p);
    await page.waitForTimeout(400);
  }
  P.sweepNewErrors = errors.slice(mark);
}

/* ---- 2. theme switch all 8 ---- */
P.themes = await page.evaluate(async () => {
  const res = {};
  const themes = ['friendly-dark', 'friendly-light', 'retro-dark',
    'retro-light', 'basic-light', 'basic-dark', 'glass-dark', 'glass-light'];
  for (const t of themes) {
    document.documentElement.setAttribute('data-theme', t);
    await new Promise(r => requestAnimationFrame(r));
    res[t] = {
      bodyBg: getComputedStyle(document.body).backgroundColor,
      glassBgShown: getComputedStyle(
        document.getElementById('glass-bg')).display,
    };
  }
  document.documentElement.setAttribute('data-theme', 'friendly-dark');
  return res;
});

/* ---- 3. glass bg modes + alpha slider ---- */
P.glass = await page.evaluate(async () => {
  const docEl = document.documentElement;
  docEl.setAttribute('data-theme', 'glass-dark');
  const res = { modes: {}, alpha: {} };
  for (const m of ['mesh', 'depth', 'minimal']) {
    docEl.setAttribute('data-glass-bg', m);
    await new Promise(r => requestAnimationFrame(r));
    res.modes[m] = {
      mesh: getComputedStyle(document.querySelector('.pm6-gbg-mesh')).display,
      depth: getComputedStyle(document.querySelector('.pm6-gbg-depth')).display,
      minimal: getComputedStyle(
        document.querySelector('.pm6-gbg-minimal')).display,
    };
  }
  const shell = document.querySelector('.app-shell');
  for (const [k, v] of [['min', '0.35'], ['mid', '0.60'], ['max', '0.85']]) {
    docEl.style.setProperty('--glass-alpha', v);
    await new Promise(r => requestAnimationFrame(r));
    res.alpha[k] = getComputedStyle(shell).backgroundColor;
  }
  docEl.style.removeProperty('--glass-alpha');
  docEl.setAttribute('data-glass-bg', 'mesh');
  docEl.setAttribute('data-theme', 'friendly-dark');
  return res;
});
out.info.bakedWallpaper = await page.evaluate(() => {
  const el = document.querySelector('.pm6-gbg-mesh .pm6-gbg-mesh-layer');
  const bg = el ? getComputedStyle(el).backgroundImage : '';
  return { meshLayerUsesWebpData: bg.indexOf('data:image/webp') !== -1,
           gradientCount: (bg.match(/gradient\(/g) || []).length };
});

/* ---- 4. settings: search / bloom / deep-link ---- */
await page.evaluate(() => window.PM_PAGES.go('settings'));
await page.waitForTimeout(400);
await page.click('#s4-search');
await page.keyboard.type('glass', { delay: 25 });
await page.waitForTimeout(500);
P.settingsSearch = await page.evaluate(() => ({
  rows: document.querySelectorAll('.s4-row').length,
  first: (document.querySelector('.s4-row') || { textContent: '' })
    .textContent.replace(/\s+/g, ' ').slice(0, 80),
}));
await page.keyboard.press('Escape');
await page.waitForTimeout(250);
P.settingsBloom = await page.evaluate(async () => {
  const chip = document.querySelector('#s4-chips .s4-chip');
  if (!chip) return { error: 'no chip' };
  chip.click();
  await new Promise(r => setTimeout(r, 800));
  const panel = document.getElementById('s4-panel');
  const rows = panel ? panel.querySelectorAll('.s4-row').length : 0;
  const open = !!(panel && (panel.classList.contains('open')
    || panel.childElementCount > 0));
  const backdrop = document.getElementById('s4-bloomBackdrop');
  if (backdrop) backdrop.click();
  await new Promise(r => setTimeout(r, 400));
  return { open, rows };
});
/* deep-link path: search + keyboard-open the first hit */
await page.click('#s4-search');
await page.keyboard.type('theme', { delay: 25 });
await page.waitForTimeout(500);
await page.keyboard.press('ArrowDown');
await page.keyboard.press('Enter');
await page.waitForTimeout(800);
P.settingsDeepLink = await page.evaluate(async () => {
  const panel = document.getElementById('s4-panel');
  const open = !!(panel && (panel.classList.contains('open')
    || panel.childElementCount > 0));
  const flashed = document.querySelectorAll(
    '.s4-row.flash, .s4-row.s4-flash, [class*="flash"]').length;
  const backdrop = document.getElementById('s4-bloomBackdrop');
  if (backdrop) backdrop.click();
  await new Promise(r => setTimeout(r, 400));
  return { open, flashed };
});

/* ---- 5. chat: thread switch, model popout, FAB fan-out ---- */
P.chatThreadSwitch = await page.evaluate(async () => {
  const items = document.querySelectorAll('.chat-thread-item');
  if (items.length < 2) return { error: 'items=' + items.length };
  items[1].click();
  await new Promise(r => setTimeout(r, 500));
  const active = document.querySelector('.chat-thread-item.active');
  const stream = document.querySelector('.chat-stream');
  const r = {
    items: items.length,
    activeIdx: Array.prototype.indexOf.call(items, active),
    streamChildren: stream ? stream.childElementCount : null,
  };
  items[0].click();
  await new Promise(r2 => setTimeout(r2, 500));
  return r;
});
P.chatModelPopout = await page.evaluate(async () => {
  const btns = document.querySelectorAll('.pm6-chat-selbtn');
  let btn = null;
  for (const b of btns) if (b.querySelector('.model-label')) { btn = b; break; }
  if (!btn) return { error: 'no model button' };
  btn.click();
  await new Promise(r => setTimeout(r, 500));
  const pops = document.querySelectorAll(
    'body > .pm6-chat-pop, body > [class*="popout"], .pm6-chat-selpop');
  const res = { popouts: pops.length,
    firstText: pops.length ? pops[0].textContent.replace(/\s+/g, ' ')
      .slice(0, 60) : null };
  document.dispatchEvent(new KeyboardEvent('keydown',
    { key: 'Escape', bubbles: true }));
  document.body.click();
  await new Promise(r => setTimeout(r, 300));
  return res;
});
P.chatFab = await page.evaluate(async () => {
  const anchor = document.querySelector('.pm6-footer-fab-anchor');
  if (!anchor) return { error: 'no fab anchor' };
  anchor.click();
  await new Promise(r => setTimeout(r, 500));
  const portal = document.querySelector('.pm6-fab-portal');
  const res = {
    portal: !!portal,
    active: !!(portal && portal.classList.contains('is-active')),
    items: portal ? portal.querySelectorAll('.pm6-fab-item').length : 0,
  };
  document.body.click();
  await new Promise(r => setTimeout(r, 300));
  return res;
});

/* ---- 6. floating chat layout cycle ---- */
P.floatingChat = await page.evaluate(async () => {
  const res = {};
  const float0 = document.getElementById('floatingChat');
  const panel = document.getElementById('chatPanel');
  const pop = document.querySelector('.popOutBtn');
  if (!pop || !float0) return { error: 'missing popOutBtn/floatingChat' };
  pop.click();
  await new Promise(r => setTimeout(r, 500));
  res.afterPopOut = { floatShown: float0.style.display,
    overlay: float0.classList.contains('pm6-chat-overlay'),
    panelHidden: panel ? panel.classList.contains('hidden') : null };
  const cyc = document.querySelector('.pm6-chat-layout-cycle');
  if (cyc) {
    cyc.click();
    await new Promise(r => setTimeout(r, 500));
    res.afterCycle = { floatShown: float0.style.display,
      overlay: float0.classList.contains('pm6-chat-overlay'),
      panelHidden: panel ? panel.classList.contains('hidden') : null };
  }
  return res;
});

/* ---- 7. wizard stage advance ---- */
P.wizard = await page.evaluate(async () => {
  window.PM_DEMO.director.ensure('c1_wizard_done');
  await new Promise(r => setTimeout(r, 900));
  window.PM_PAGES.go('wizard');
  await new Promise(r => setTimeout(r, 600));
  const active = document.querySelector('.pm6-wiz-stage.active');
  return { stage: active ? active.getAttribute('data-wiz-stage') : null,
    engineStage: window.PM_DEMO.state.wizard.stage };
});

/* ---- 8. orchestrator tabs + node inspector ---- */
P.orchestrator = await page.evaluate(async () => {
  window.PM_PAGES.go('orchestrator');
  await new Promise(r => setTimeout(r, 500));
  const res = { tabs: {} };
  for (const t of ['progress', 'plan_compile', 'seams', 'node_graph',
                   'evidence', 'history', 'ledger']) {
    const el = document.getElementById('orch-tab-' + t);
    if (!el) { res.tabs[t] = 'missing'; continue; }
    el.click();
    await new Promise(r => setTimeout(r, 350));
    res.tabs[t] = el.getAttribute('aria-selected');
  }
  document.getElementById('orch-tab-node_graph').click();
  await new Promise(r => setTimeout(r, 400));
  const node = document.querySelector(
    '#orch-panel-node_graph [data-node-id]');
  if (node) {
    node.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 500));
    const insp = document.querySelector(
      '.pm6-orch-inspector, [class*="inspector"]');
    res.inspector = insp ? {
      visible: getComputedStyle(insp).display !== 'none',
      head: insp.textContent.replace(/\s+/g, ' ').slice(0, 60),
    } : null;
    res.nodeClicked = node.getAttribute('data-node-id');
  } else res.inspector = 'no node';
  return res;
});

/* ---- 9. terminal split to 2x2 + guard ---- */
P.terminal = await page.evaluate(async () => {
  window.PM_PAGES.go('dashboard');
  await new Promise(r => setTimeout(r, 400));
  const v = document.querySelector(
    'button[title="Split Active Tab Vertically"]');
  const h = document.querySelector(
    'button[title="Split Active Tab Horizontally"]');
  if (!v || !h) return { error: 'split buttons missing' };
  const lastToast = () => {
    const els = document.querySelectorAll('[class*="toast"]');
    const texts = Array.prototype.map.call(els,
      e => e.textContent.replace(/\s+/g, ' ').trim()).filter(Boolean);
    return texts.length ? texts[texts.length - 1].slice(0, 80) : null;
  };
  v.click(); await new Promise(r => setTimeout(r, 350));
  h.click(); await new Promise(r => setTimeout(r, 350));
  h.click(); await new Promise(r => setTimeout(r, 350));
  const panes4 = document.querySelectorAll('.terminal-pane').length;
  v.click(); await new Promise(r => setTimeout(r, 350));
  return { panesAfter3Splits: panes4,
    panesAfterGuard: document.querySelectorAll('.terminal-pane').length,
    guardToast: lastToast() };
});

/* ---- 10. dashboard: +N-more chip + widget drag ---- */
P.editorOverflow = await page.evaluate(async () => {
  window.PM_PAGES.go('dashboard');
  await new Promise(r => setTimeout(r, 400));
  const files = document.querySelectorAll(
    '[data-demo-action="files.open"]');
  let opened = 0;
  for (let i = 0; i < files.length && opened < 8; i++, opened++) {
    files[i].click();
    await new Promise(r => setTimeout(r, 200));
  }
  await new Promise(r => setTimeout(r, 500));
  const chips = Array.prototype.filter.call(
    document.querySelectorAll('#panel-dashboard *'),
    e => e.childElementCount === 0 && /^\+\d+ more$/.test(
      e.textContent.trim()));
  const tabs = document.querySelectorAll(
    '#panel-dashboard [class*="ed-tab"], #panel-dashboard [data-ed-tab]');
  return { filesOpened: opened, moreChips: chips.length,
    chipText: chips.length ? chips[0].textContent.trim() : null,
    editorTabs: tabs.length };
});
{
  const mark = errors.length;
  const drag = await page.evaluate(() => {
    const card = document.querySelector('.pm6-dash-card');
    if (!card) return null;
    const r = card.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + 14 };
  });
  if (drag) {
    await page.mouse.move(drag.x, drag.y);
    await page.mouse.down();
    await page.mouse.move(drag.x + 160, drag.y + 10, { steps: 8 });
    await page.waitForTimeout(250);
    await page.mouse.up();
    await page.waitForTimeout(400);
  }
  P.widgetDrag = {
    attempted: !!drag,
    newErrors: errors.slice(mark),
    order: await page.evaluate(() => Array.prototype.map.call(
      document.querySelectorAll('.pm6-dash-card[data-widget-kind]'),
      e => e.getAttribute('data-widget-kind')).slice(0, 8)),
  };
}

/* ---- 11. dev panel ---- */
P.devPanel = await page.evaluate(async () => {
  window.PM_DEMO.dev.toggle();
  await new Promise(r => setTimeout(r, 500));
  const panel = document.querySelector(
    '[class*="dev-panel"], [id*="devPanel"], [class*="pm6-dev"]');
  const res = { open: !!panel };
  if (panel) {
    const btns = Array.prototype.slice.call(
      panel.querySelectorAll('button, [role="button"]'));
    const find = re => btns.find(b => re.test(b.textContent.trim()));
    const play = find(/^(play|pause|resume)$/i);
    if (play) {
      const before = window.PM_DEMO.state.clock.playing;
      play.click();
      await new Promise(r => setTimeout(r, 250));
      res.playToggle = { before,
        after: window.PM_DEMO.state.clock.playing };
      if (window.PM_DEMO.state.clock.playing) window.PM_DEMO.clock.pause();
    } else res.playToggle = 'no button';
    window.PM_DEMO.director.ensure('c2_compiled');
    await new Promise(r => setTimeout(r, 400));
    res.chapterJump = window.PM_DEMO.state.story.c2_compiled;
    const reset = find(/reset/i);
    res.resetAvailable = !!reset;
    if (!reset) res.reset = 'no button';
  }
  if (!res.resetAvailable) {
    window.PM_DEMO.dev.toggle();
    await new Promise(r => setTimeout(r, 300));
  }
  return res;
});
if (P.devPanel.resetAvailable) {
  const reset = page.locator(
    '[class*="dev-panel"] button, [id*="devPanel"] button, [class*="pm6-dev"] button'
  ).filter({ hasText: /reset/i }).first();
  await guard.triggerBoundNavigation(page, {
    navigation_id: 'smoke:dev-panel-reset',
    target_url: provenanceRun.artifactUrl({ case: 'smoke' }),
    trigger: () => reset.click(),
    wait_until: 'load',
    timeout_ms: 30000
  });
  await page.waitForFunction(() => Boolean(window.PM_DEMO && window.PM_DEMO.state), null, { timeout: 30000 });
  P.devPanel.resetStory = await page.evaluate(() => {
    if (window.PM_DEMO.state.clock.playing) window.PM_DEMO.clock.pause();
    return Object.assign({}, window.PM_DEMO.state.story);
  });
}

/* ---- 12. reduced-motion toggle ---- */
P.reducedMotion = await page.evaluate(async () => {
  const docEl = document.documentElement;
  docEl.setAttribute('data-motion', 'reduced');
  await new Promise(r => requestAnimationFrame(r));
  const res = { attr: docEl.getAttribute('data-motion') };
  docEl.removeAttribute('data-motion');
  await new Promise(r => requestAnimationFrame(r));
  res.cleared = docEl.getAttribute('data-motion');
  return res;
});

recordCheck('load_and_page_sweep_error_free',
  Array.isArray(P.loadErrors) && P.loadErrors.length === 0 &&
    Array.isArray(P.sweepNewErrors) && P.sweepNewErrors.length === 0,
  { load_errors: P.loadErrors, sweep_new_errors: P.sweepNewErrors });
const expectedThemes = ['friendly-dark', 'friendly-light', 'retro-dark', 'retro-light',
  'basic-light', 'basic-dark', 'glass-dark', 'glass-light'];
recordCheck('all_eight_themes_switch',
  JSON.stringify(Object.keys(P.themes || {})) === JSON.stringify(expectedThemes) &&
    expectedThemes.every(theme => typeof P.themes[theme]?.bodyBg === 'string' && P.themes[theme].bodyBg.length > 0 &&
      typeof P.themes[theme]?.glassBgShown === 'string' && P.themes[theme].glassBgShown.length > 0),
  P.themes);
recordCheck('glass_modes_and_alpha_matrix',
  ['mesh', 'depth', 'minimal'].every(mode => P.glass?.modes?.[mode]?.[mode] !== 'none') &&
    ['min', 'mid', 'max'].every(level => typeof P.glass?.alpha?.[level] === 'string') &&
    new Set(Object.values(P.glass?.alpha || {})).size === 3,
  P.glass);
recordCheck('baked_wallpaper_uses_embedded_webp', out.info.bakedWallpaper?.meshLayerUsesWebpData === true,
  out.info.bakedWallpaper);
recordCheck('settings_search_bloom_and_deep_link',
  P.settingsSearch?.rows > 0 && !P.settingsBloom?.error && P.settingsBloom?.open === true && P.settingsBloom?.rows > 0 &&
    !P.settingsDeepLink?.error && (P.settingsDeepLink?.open === true || P.settingsDeepLink?.flashed > 0),
  { search: P.settingsSearch, bloom: P.settingsBloom, deep_link: P.settingsDeepLink });
recordCheck('chat_thread_model_and_fab',
  !P.chatThreadSwitch?.error && P.chatThreadSwitch?.items >= 2 && P.chatThreadSwitch?.activeIdx === 1 &&
    !P.chatModelPopout?.error && P.chatModelPopout?.popouts > 0 &&
    !P.chatFab?.error && P.chatFab?.portal === true && P.chatFab?.active === true && P.chatFab?.items > 0,
  { thread: P.chatThreadSwitch, model: P.chatModelPopout, fab: P.chatFab });
recordCheck('floating_chat_layout_cycle',
  !P.floatingChat?.error && P.floatingChat?.afterPopOut && P.floatingChat?.afterCycle,
  P.floatingChat);
recordCheck('wizard_stage_advance',
  !P.wizard?.error && P.wizard?.stage != null && P.wizard?.engineStage != null &&
    String(P.wizard.stage) === String(P.wizard.engineStage),
  P.wizard);
const expectedOrchestratorTabs = ['progress', 'plan_compile', 'seams', 'node_graph', 'evidence', 'history', 'ledger'];
recordCheck('orchestrator_tabs_and_node_inspector',
  expectedOrchestratorTabs.every(tab => P.orchestrator?.tabs?.[tab] === 'true') &&
    Boolean(P.orchestrator?.nodeClicked) && P.orchestrator?.inspector?.visible === true,
  P.orchestrator);
recordCheck('terminal_split_2x2_and_max_guard',
  !P.terminal?.error && P.terminal?.panesAfter3Splits === 4 && P.terminal?.panesAfterGuard === 4,
  P.terminal);
recordCheck('dashboard_editor_overflow_and_widget_drag',
  P.editorOverflow?.filesOpened > 0 && P.editorOverflow?.moreChips > 0 &&
    P.widgetDrag?.attempted === true && Array.isArray(P.widgetDrag?.newErrors) && P.widgetDrag.newErrors.length === 0 &&
    Array.isArray(P.widgetDrag?.order) && P.widgetDrag.order.length > 0,
  { editor_overflow: P.editorOverflow, widget_drag: P.widgetDrag });
recordCheck('dev_panel_toggle_play_chapter_and_reset',
  P.devPanel?.open === true && P.devPanel?.playToggle !== 'no button' && P.devPanel?.chapterJump === true &&
    P.devPanel?.resetAvailable === true && P.devPanel?.resetStory && typeof P.devPanel.resetStory === 'object',
  P.devPanel);
recordCheck('reduced_motion_toggle', P.reducedMotion?.attr === 'reduced' && P.reducedMotion?.cleared === null,
  P.reducedMotion);
} catch (error) {
  const text = String(error?.stack || error);
  out.runtime_errors.push({ kind: 'product-or-harness', text });
  errors.push('harness: ' + text.slice(0, 600));
} finally {
  if (context) {
    try { await context.close(); }
    catch (error) {
      out.runtime_errors.push({ kind: 'context-close', text: String(error?.stack || error) });
    }
  }
  try {
    await provenanceRun.finalizeBeforeBrowserClose(browser);
    await browser.close();
    out.provenance = await provenanceRun.finalizeAfterBrowserClose();
  } catch (error) {
    out.runtime_errors.push({ kind: 'provenance-finalize', text: String(error?.stack || error) });
    try { out.provenance = await provenanceRun.fail('finalize', error); }
    catch (failureError) {
      out.runtime_errors.push({ kind: 'provenance-fail', text: String(failureError?.stack || failureError) });
      out.provenance = provenanceRun.envelope;
    }
  }

  P.totalConsoleErrors = errors.length;
  out.errors = errors.slice();
  let provenanceAdmissionError = null;
  try { assertProvenanceAdmission(out.provenance); }
  catch (error) { provenanceAdmissionError = String(error?.stack || error); }
  recordCheck('shared_browser_provenance_admission',
    provenanceAdmissionError === null && out.provenance?.admission?.pass === true,
    {
      admission: out.provenance?.admission,
      error: provenanceAdmissionError,
      artifact: out.provenance?.artifact,
      verifier: out.provenance?.verifier,
      helper: out.provenance?.helper,
      browser: out.provenance?.browser,
      command: out.provenance?.command,
      navigation_count: out.provenance?.navigations?.length,
      network: out.provenance?.network,
      certification_boundary: out.provenance?.certification_boundary
    });
  recordCheck('exact_browser_only_certification_boundary',
    JSON.stringify(out.provenance?.certification_boundary) === JSON.stringify(BROWSER_ONLY_BOUNDARY) &&
      JSON.stringify(out.certification_boundary) === JSON.stringify(BROWSER_ONLY_BOUNDARY) &&
      JSON.stringify(out.execution_boundary) === JSON.stringify(BROWSER_ONLY_BOUNDARY),
    {
      provenance_boundary: out.provenance?.certification_boundary,
      certification_boundary: out.certification_boundary,
      execution_boundary: out.execution_boundary
    });
  recordCheck('shared_provenance_runtime_clean',
    errors.length === 0 && out.runtime_errors.length === 0 && out.provenance?.runtime_errors?.count === 0,
    { console_and_page_errors: errors, verifier: out.runtime_errors, provenance: out.provenance?.runtime_errors });

  const failedChecks = Object.entries(out.checks).filter(([, check]) => !check.pass).map(([name]) => name);
  out.summary = {
    check_count: Object.keys(out.checks).length,
    passed_checks: Object.keys(out.checks).length - failedChecks.length,
    failed_checks: failedChecks,
    console_and_page_error_count: errors.length,
    runtime_error_count: out.runtime_errors.length,
    status: failedChecks.length === 0 && errors.length === 0 && out.runtime_errors.length === 0 ? 'PASS' : 'FAIL'
  };
  out.disposition = out.summary.status === 'PASS' ? 'pass' : 'fail';
  writeFileSync(outputPath, JSON.stringify(out, null, 2) + '\n');
  console.log(JSON.stringify({ result: outputPath, summary: out.summary }));
  if (out.summary.status !== 'PASS') process.exitCode = 1;
}
