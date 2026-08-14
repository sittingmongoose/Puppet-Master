/* PMConcept7 Home Workspace post-audit browser matrix.
 *
 * This runner intentionally operates production controls for Home actions.
 * Page evaluation is reserved for deterministic setup, fault injection, and
 * read-only inspection of the public concept model.
 *
 * Usage:
 *   node home_workspace_matrix.mjs --file PMConcept7.html \
 *     --outdir <evidence-dir> --modules <dir-with-playwright-core> \
 *     --server http://127.0.0.1:8765/
 *
 * The default transport is an http server, but --server also accepts a
 * file:// base (e.g. --server file:///abs/path/to/Concepts) for sandboxes
 * where Chromium's network service cannot run. Optional launch overrides:
 *   --chromium <path>   explicit Chromium executable; when given, the
 *                       sandbox-safe flags (--no-sandbox --disable-gpu
 *                       --disable-dev-shm-usage) are passed automatically.
 *   --video off         skip per-case video recording and tracing (the
 *                       ffmpeg encoders are the largest optional memory
 *                       consumers; use on memory-constrained runners).
 */

import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const args = {};
for (let index = 2; index < process.argv.length; index += 2) {
  args[process.argv[index].replace(/^--/, '')] = process.argv[index + 1];
}
for (const required of ['file', 'outdir', 'modules']) {
  if (!args[required]) {
    console.error('missing --' + required);
    process.exit(2);
  }
}

const requireFromRuntime = createRequire(join(args.modules, 'noop.js'));
const { chromium } = requireFromRuntime('playwright-core');
const server = (args.server || 'http://127.0.0.1:8765/').replace(/\/$/, '');
const url = server + '/' + args.file.replace(/^\//, '');
const screenshotsDir = join(args.outdir, 'screenshots');
const tracesDir = join(args.outdir, 'traces');
const recordingsDir = join(args.outdir, 'recordings');
mkdirSync(screenshotsDir, { recursive: true });
mkdirSync(tracesDir, { recursive: true });
mkdirSync(recordingsDir, { recursive: true });

const result = {
  schema_id: 'pm.home_workspace_live_matrix.v1',
  generated_at_utc: new Date().toISOString(),
  url,
  generated_artifact: args.file,
  deterministic_context: {
    device_scale_factor: 1,
    locale: 'en-US',
    timezone_id: 'America/New_York',
    color_scheme_seed: 'dark',
    external_requests_blocked: true,
    clean_storage_per_case: true
  },
  checks: {},
  matrix: [],
  runtime_errors: [],
  visual_observations: []
};

function recordCheck(name, pass, evidence) {
  result.checks[name] = { pass: Boolean(pass), evidence };
}

function same(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function safeName(value) {
  return String(value).replace(/[^a-z0-9_-]+/gi, '-').toLowerCase();
}

const launchOptions = { headless: true };
if (args.chromium) {
  launchOptions.executablePath = args.chromium;
  launchOptions.args = ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'];
}
const videoDisabled = args.video === 'off';
const browser = await chromium.launch(launchOptions);

async function newCase(name, options = {}) {
  const contextErrors = [];
  const context = await browser.newContext({
    viewport: options.viewport || { width: 1280, height: 800 },
    deviceScaleFactor: 1,
    locale: 'en-US',
    timezoneId: 'America/New_York',
    colorScheme: options.colorScheme || 'dark',
    reducedMotion: options.reducedMotion ? 'reduce' : 'no-preference',
    recordVideo: options.recordVideo ? { dir: recordingsDir, size: options.viewport || { width: 1280, height: 800 } } : undefined
  });
  await context.route('**/*', async route => {
    const requestUrl = route.request().url();
    if (requestUrl.startsWith(server) || requestUrl.startsWith('data:') || requestUrl.startsWith('blob:') || requestUrl === 'about:blank') {
      await route.continue();
    } else {
      await route.fulfill({ status: 204, contentType: 'text/plain', body: '' });
    }
  });
  const page = await context.newPage();
  page.on('console', message => {
    if (message.type() === 'error') contextErrors.push({ kind: 'console', text: message.text().slice(0, 500) });
  });
  page.on('pageerror', error => {
    contextErrors.push({ kind: 'pageerror', text: String(error).slice(0, 500) });
  });
  await page.addInitScript(seed => {
    try {
      if (sessionStorage.getItem('__pm_home_case_seeded') !== '1') {
        localStorage.clear();
        localStorage.setItem('pm.theme', seed.theme);
        localStorage.setItem('pm.themeMode', seed.themeMode || 'Auto');
        if (seed.layout) localStorage.setItem('pm.homeWorkspaceLayout:v1:tastebook:home', JSON.stringify(seed.layout));
        if (seed.legacyLayout) localStorage.setItem('home_workspace_layout.v1:tastebook:home', JSON.stringify(seed.legacyLayout));
        sessionStorage.setItem('__pm_home_case_seeded', '1');
      }
    } catch (error) {}
  }, {
    theme: options.theme || 'friendly-dark',
    themeMode: options.themeMode || 'Auto',
    layout: options.layout || null,
    legacyLayout: options.legacyLayout || null
  });
  /* 180s: the artifact loads in ~1s normally, but memory-contended runners
     (concurrent harness runs + the long-lived driver) can stall first paint
     far past 60s; a taller cap turns a fatal crash into a slow case */
  await page.goto(url + '?pm-home-case=' + encodeURIComponent(name), { waitUntil: 'load', timeout: 180000 });
  await page.waitForFunction(() => Boolean(window.PM_HOME_WORKSPACE), null, { timeout: 120000 });
  await page.waitForTimeout(350);
  return { context, page, errors: contextErrors };
}

async function closeCase(caseState, name) {
  if (caseState.errors.length) {
    result.runtime_errors.push({ case: name, errors: caseState.errors });
  }
  await caseState.context.close();
}

async function state(page) {
  return page.evaluate(() => {
    const home = window.PM_HOME_WORKSPACE;
    return {
      schema_id: home.schema_id,
      storage_key: home.storage_key,
      layout: home.layout,
      commands: home.command_log,
      events: home.event_log,
      receipts: home.receipt_log,
      metrics: home.metrics,
      browser: home.browser,
      identities: home.identities,
      identity_integrity: home.identityIntegrity(),
      active_terminal_section_id: home.active_terminal_section_id,
      terminal_workgroups: home.terminal_workgroups
    };
  });
}

async function clickTopSubmenuLeaf(page, submenuId, action, surfaceId) {
  await page.locator('#pm-home-more-btn').click();
  await page.waitForTimeout(360);
  const topRow = page.locator('#pm-home-more-menu [data-pm-home-submenu="' + submenuId + '"]');
  await topRow.click();
  await page.waitForTimeout(300);
  const selector = '#' + submenuId + ' [data-pm-home-action="' + action + '"][data-pm-home-surface-id="' + surfaceId + '"]';
  await page.locator(selector).click();
  await page.waitForTimeout(90);
}

async function openPanel(page, number) {
  await clickTopSubmenuLeaf(page, 'pm-home-open-panel-flyout', 'open-panel', 'editor_panel_' + number);
}

async function openBrowserInPanel(page, number) {
  await clickTopSubmenuLeaf(page, 'pm-home-open-browser-flyout', 'open-browser', 'editor_panel_' + number);
}

async function surfaceAction(page, surfaceId, action, targetHost = null) {
  const options = page.locator('[data-pm-home-surface-options="' + surfaceId + '"]');
  await options.scrollIntoViewIfNeeded();
  await options.click();
  await page.waitForTimeout(360);
  let selector = '#pm-home-surface-menu [data-pm-home-action="' + action + '"][data-pm-home-surface-id="' + surfaceId + '"]';
  if (targetHost) selector += '[data-pm-home-target-host="' + targetHost + '"]';
  await page.locator(selector).click();
  await page.waitForTimeout(90);
}

async function clickTerminalAction(page, action) {
  const active = await page.evaluate(() => window.PM_HOME_WORKSPACE.active_terminal_section_id);
  const selector = '[data-pm-home-surface="' + active + '"] [data-pm-home-action="' + action + '"]:not([disabled])';
  await page.locator(selector).first().click();
  await page.waitForTimeout(110);
}

async function ensureAllOpen(page) {
  await openPanel(page, 3);
  await openPanel(page, 4);
  const chatVisible = await page.evaluate(() => window.PM_HOME_WORKSPACE.layout.surfaces.find(surface => surface.surface_instance_id === 'chat').visible);
  if (!chatVisible) await page.locator('.activity-bar .icon[title="Chat"]').click();
  await page.waitForTimeout(100);
}

async function configureLayout(page, layoutName) {
  if (layoutName === 'all-open') {
    await ensureAllOpen(page);
    return;
  }
  if (layoutName === 'default') return;
  if (layoutName === 'edge-docked') {
    await ensureAllOpen(page);
    await moveSurfaceTo(page, 'dashboard', 'dock_left');
    await moveSurfaceTo(page, 'editor_panel_2', 'dock_right');
    await moveSurfaceTo(page, 'terminal_section:terminal_section_1', 'dock_top');
    return;
  }
  if (layoutName === 'floating') {
    await ensureAllOpen(page);
    await moveSurfaceTo(page, 'editor_panel_1', 'floating');
    await moveSurfaceTo(page, 'dashboard', 'floating');
    await moveSurfaceTo(page, 'chat', 'floating');
    return;
  }
  if (layoutName === 'terminal-max') {
    await ensureAllOpen(page);
    await clickTerminalAction(page, 'split-terminal-pane');
    await clickTerminalAction(page, 'split-terminal-pane');
    for (let index = 0; index < 3; index += 1) {
      await clickTerminalAction(page, 'move-workgroup-new-section');
    }
  }
}

/* Start pointer gestures in the upper-right quadrant of the handle: the grip
   is an 18px top-RIGHT triangle (clip polygon(0 0,100% 0,100% 100%)) whose
   bounding-box centre sits on the hypotenuse, and clip-path participates in
   hit-testing. (72%,28%) is safely inside the triangle and equally valid for
   rectangular resizer strips. */
function handleStartPoint(box) {
  return { x: box.x + box.width * 0.72, y: box.y + box.height * 0.28 };
}

async function pointerGesture(page, selector, target, finish = 'up') {
  const box = await page.locator(selector).first().boundingBox();
  if (!box) throw new Error('missing pointer target ' + selector);
  const start = handleStartPoint(box);
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(target.x, target.y, { steps: 8 });
  if (finish === 'escape') {
    await page.keyboard.press('Escape');
    await page.mouse.up();
  } else if (finish === 'pointercancel') {
    await page.locator(selector).first().dispatchEvent('pointercancel', { pointerId: 1, pointerType: 'mouse', bubbles: true });
    await page.mouse.up();
  } else if (finish === 'lostcapture') {
    await page.locator(selector).first().dispatchEvent('lostpointercapture', { pointerId: 1, pointerType: 'mouse', bubbles: false });
    await page.mouse.up();
  } else if (finish === 'blur') {
    await page.evaluate(() => window.dispatchEvent(new Event('blur')));
    await page.mouse.up();
  } else {
    await page.mouse.up();
  }
  await page.waitForTimeout(130);
}

/* Drag onto the LIVE layout. The centre-screen drop-target rail is retired --
   it sat on top of the canvas and swallowed the hit-test that positional drops
   depend on -- so a drop target is a real point in the workspace: the edge
   band for a dock, the middle for home_main. There is NO pointer route to
   floating any more (leaving the window is an invalid target, not a float);
   floating is an explicit action only -- the keyboard F path used by
   moveSurfaceTo/configureLayout, or the surface menu's Pop Out row. */
async function dropPointForHost(page, host) {
  const bounds = await page.evaluate(() => {
    const r = document.getElementById('pm-home-workspace').getBoundingClientRect();
    return { x: r.left, y: r.top, w: r.width, h: r.height };
  });
  const edge = 10; // inside the 28px dock band, well clear of positional drops
  if (host === 'dock_left') return { x: bounds.x + edge, y: bounds.y + bounds.h / 2 };
  if (host === 'dock_right') return { x: bounds.x + bounds.w - edge, y: bounds.y + bounds.h / 2 };
  if (host === 'dock_top') return { x: bounds.x + bounds.w / 2, y: bounds.y + edge };
  if (host === 'dock_bottom') return { x: bounds.x + bounds.w / 2, y: bounds.y + bounds.h - edge };
  if (host === 'floating') throw new Error('floating has no pointer drop point; use the keyboard F path (moveSurfaceTo) or the Pop Out menu row');
  return { x: bounds.x + bounds.w / 2, y: bounds.y + bounds.h / 2 };
}

async function pointerGestureToDropTarget(page, selector, host) {
  const box = await page.locator(selector).first().boundingBox();
  if (!box) throw new Error('missing pointer target ' + selector);
  const start = handleStartPoint(box);
  const drop = await dropPointForHost(page, host);
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(start.x + 2, start.y + 2);
  await page.mouse.move(drop.x, drop.y, { steps: 10 });
  /* wave 3: target adoption has 2-frame hysteresis -- jitter once more at the
     target so the preview commits to it before the drop */
  await page.mouse.move(drop.x + 1, drop.y);
  await page.waitForTimeout(160);
  await page.mouse.up();
  await page.waitForTimeout(150);
}

/* Deterministic layout setup drives the grip's KEYBOARD path. That path is now
   the accessible movement contract (the per-host "Move or dock" menu rows are
   retired), so using it here keeps setup reproducible and exercises the
   contract at the same time. */
async function moveSurfaceTo(page, surfaceId, host) {
  const grip = page.locator('[data-pm-home-handle][data-pm-home-surface-id="' + surfaceId + '"]').first();
  await grip.scrollIntoViewIfNeeded();
  await grip.focus();
  await grip.press('Enter');
  await page.waitForTimeout(70);
  const hostOf = () => page.evaluate(id => {
    const layout = window.PM_HOME_WORKSPACE.draft_layout || window.PM_HOME_WORKSPACE.layout;
    const surface = layout.surfaces.find(s => s.surface_instance_id === id);
    return surface ? surface.host : null;
  }, surfaceId);
  if (host === 'floating') {
    await grip.press('f');
  } else {
    /* Keyboard host adjacency is dock <-> home_main, so a dock-to-dock move is
       two hops: back to main first, then out to the target dock. */
    const TOWARDS = { dock_left: 'ArrowLeft', dock_right: 'ArrowRight', dock_top: 'ArrowUp', dock_bottom: 'ArrowDown' };
    const BACK_TO_MAIN = { dock_left: 'ArrowRight', dock_right: 'ArrowLeft', dock_top: 'ArrowDown', dock_bottom: 'ArrowUp', floating: 'ArrowRight' };
    for (let step = 0; step < 24; step += 1) {
      const current = await hostOf();
      if (current === host) break;
      let key;
      if (host === 'home_main') key = BACK_TO_MAIN[current] || 'ArrowRight';
      else if (current === 'home_main') key = TOWARDS[host];
      else key = BACK_TO_MAIN[current] || 'ArrowRight';
      await grip.press(key);
      await page.waitForTimeout(60);
    }
  }
  await grip.press('Enter');
  await page.waitForTimeout(130);
}

async function runInteraction(name, body, options = {}) {
  const wantVideo = Boolean(options.recordVideo) && !videoDisabled;
  const caseState = await newCase('interaction-' + name, Object.assign({}, options, { recordVideo: wantVideo }));
  let pass = false;
  let evidence = null;
  let tracePath = null;
  if (wantVideo) {
    tracePath = join(tracesDir, safeName(name) + '.zip');
    await caseState.context.tracing.start({ screenshots: true, snapshots: true, sources: true });
  }
  try {
    evidence = await body(caseState.page, caseState);
    pass = Boolean(evidence && evidence.pass);
  } catch (error) {
    evidence = { pass: false, error: String(error && error.stack || error) };
  }
  if (tracePath) {
    try {
      await caseState.context.tracing.stop({ path: tracePath });
    } catch (error) {
      caseState.errors.push({ kind: 'trace', text: String(error).slice(0, 500) });
    }
  }
  recordCheck(name, pass && caseState.errors.length === 0, Object.assign({}, evidence || {}, {
    runtime_errors: caseState.errors,
    trace: tracePath
  }));
  await closeCase(caseState, name);
}

await runInteraction('compact_menu_exact_inventory_and_geometry', async page => {
  const trigger = page.locator('#pm-home-more-btn');
  const theme = page.locator('#themeMenuWrap');
  const triggerBox = await trigger.boundingBox();
  const themeBox = await theme.boundingBox();
  await trigger.click();
  await page.waitForTimeout(360);
  const menu = page.locator('#pm-home-more-menu');
  const menuBox = await menu.boundingBox();
  const rows = await menu.locator(':scope > [data-pm-home-top-action]').allTextContents();
  const separators = await menu.locator(':scope > [role="separator"]').count();
  /* "Reset" left the forbidden list on purpose: the 2026-08-13 wave added the
     Reset Layout row (user decision 3 -- clear layout + reload). */
  const forbidden = await menu.getByText(/File Manager|Move|Dock|Pop Out|Close|Revision|Recovery|Count/i).count();
  const attrs = await trigger.evaluate(element => ({
    aria_label: element.getAttribute('aria-label'),
    aria_haspopup: element.getAttribute('aria-haspopup'),
    aria_controls: element.getAttribute('aria-controls')
  }));
  const triggerRight = triggerBox.x + triggerBox.width;
  return {
    pass: Math.round(triggerBox.width) === 28 && Math.round(triggerBox.height) === 28 &&
      triggerRight <= themeBox.x + 1 && themeBox.x - triggerRight <= 12.1 &&
      menuBox.width <= 300 && menuBox.height <= 230 &&
      same(rows.map(row => row.trim()), ['Open Panel', 'Open Browser in Panel', 'Collapse Bottom Terminal', 'Reset Layout']) &&
      separators === 2 && forbidden === 0 &&
      attrs.aria_label === 'Home more options' && attrs.aria_haspopup === 'menu' && attrs.aria_controls === 'pm-home-more-menu',
    trigger_box: triggerBox,
    theme_box: themeBox,
    menu_box: menuBox,
    rows: rows.map(row => row.trim()),
    separators,
    forbidden_count: forbidden,
    accessibility: attrs
  };
});

await runInteraction('compact_menu_keyboard_hover_bridge_and_focus_restore', async page => {
  const trigger = page.locator('#pm-home-more-btn');
  await trigger.focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(50);
  const firstFocused = await page.evaluate(() => document.activeElement && document.activeElement.textContent.trim());
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(50);
  const flyoutFocused = await page.evaluate(() => document.activeElement && document.activeElement.textContent.trim());
  await page.keyboard.press('ArrowDown');
  const rovingFocused = await page.evaluate(() => document.activeElement && document.activeElement.textContent.trim());
  await page.keyboard.press('ArrowLeft');
  await page.waitForTimeout(40);
  const returned = await page.evaluate(() => document.activeElement && document.activeElement.textContent.trim());
  await page.keyboard.press('Escape');
  await page.waitForTimeout(80);
  const restored = await trigger.evaluate(element => document.activeElement === element);
  await trigger.click();
  await page.waitForTimeout(360);
  await page.locator('[data-pm-home-submenu="pm-home-open-browser-flyout"]').hover();
  await page.waitForTimeout(190);
  const hoverOpen = await page.locator('#pm-home-open-browser-flyout').isVisible();
  await page.mouse.click(2, 2);
  await page.waitForTimeout(320);
  const outsideClosed = !(await page.locator('#pm-home-more-menu').isVisible());
  return {
    pass: firstFocused === 'Open Panel' && flyoutFocused === 'Panel 1' && rovingFocused === 'Panel 2' &&
      returned === 'Open Panel' && restored && hoverOpen && outsideClosed,
    first_focused: firstFocused,
    flyout_focused: flyoutFocused,
    roving_focused: rovingFocused,
    returned,
    restored,
    hover_open: hoverOpen,
    outside_closed: outsideClosed
  };
}, { recordVideo: true });

await runInteraction('four_editor_panels_idempotent_stable_identity', async page => {
  const before = await state(page);
  await openPanel(page, 3);
  await openPanel(page, 4);
  await openPanel(page, 3);
  await surfaceAction(page, 'editor_panel_3', 'close-panel');
  await openPanel(page, 3);
  const after = await state(page);
  const editorIds = after.layout.surfaces.filter(surface => surface.surface_kind === 'editor_panel').map(surface => surface.surface_instance_id).sort();
  return {
    pass: same(editorIds, ['editor_panel_1', 'editor_panel_2', 'editor_panel_3', 'editor_panel_4']) &&
      after.identity_integrity.ok &&
      same(before.identities.editors, after.identities.editors) &&
      after.layout.surfaces.filter(surface => surface.surface_kind === 'editor_panel').every(surface => surface.visible),
    editor_ids: editorIds,
    before_editors: before.identities.editors,
    after_editors: after.identities.editors,
    identity_integrity: after.identity_integrity,
    commands: after.commands.map(command => command.command_id)
  };
});

await runInteraction('browser_visible_routing_all_four_panels_one_session', async page => {
  const targets = [];
  for (let panel = 1; panel <= 4; panel += 1) {
    const before = await state(page);
    await openBrowserInPanel(page, panel);
    const after = await state(page);
    const mounted = await page.evaluate(() => {
      const content = document.getElementById('browserTabContent');
      const owner = content && content.closest('[data-pm-home-surface]');
      return owner && owner.getAttribute('data-pm-home-surface');
    });
    targets.push({
      panel,
      mounted,
      command_delta: after.metrics.commandCount - before.metrics.commandCount,
      persist_delta: after.metrics.persistCount - before.metrics.persistCount,
      event_types: after.events.slice(before.events.length).map(event => event.event_type),
      browser_session_id: after.browser.browser_session_id,
      target_panel: after.browser.target_editor_panel_id
    });
  }
  const finalState = await state(page);
  const createdEvents = targets.flatMap(item => item.event_types).filter(eventType => eventType === 'browser.session.created');
  return {
    pass: targets.every(item => item.mounted === 'editor_panel_' + item.panel &&
      item.target_panel === 'editor_panel_' + item.panel &&
      item.command_delta === 1 && item.persist_delta === 1 &&
      item.event_types.includes('workspace.layout_changed') &&
      item.event_types.includes('browser.session.state_changed') &&
      item.event_types.every(eventType => ['workspace.layout_changed', 'browser.session.created', 'browser.session.state_changed'].includes(eventType))) &&
      createdEvents.length === 1 &&
      new Set(targets.map(item => item.browser_session_id)).size === 1 &&
      finalState.identity_integrity.ok,
    targets,
    browser: finalState.browser,
    identity_integrity: finalState.identity_integrity
  };
});

await runInteraction('file_manager_open_in_panel_visible_submenu_all_four', async page => {
  const srcFolder = page.locator('#panel-files .fm-row[data-path="src"]').first();
  if (!(await srcFolder.isVisible())) {
    await page.locator('.activity-bar .icon[title="File Manager"]').click();
    await page.waitForTimeout(120);
  }
  if ((await srcFolder.getAttribute('aria-expanded')) !== 'true') {
    await srcFolder.click();
    await page.waitForTimeout(120);
  }
  const row = page.locator('#panel-files .fm-row[data-path$=".rs"], #panel-files .fm-openrow[data-path$=".rs"]').first();
  const path = await row.getAttribute('data-path');
  const targets = [];
  for (let panel = 1; panel <= 4; panel += 1) {
    await row.click({ button: 'right' });
    const item = page.locator('#fileContextMenu [data-pm-home-file-submenu]');
    await item.click();
    const count = await page.locator('#pm-home-file-panel-menu [data-pm-home-file-panel]').count();
    const before = await state(page);
    await page.locator('#pm-home-file-panel-menu [data-pm-home-action="file-open-panel"][data-pm-home-surface-id="editor_panel_' + panel + '"]').click();
    await page.waitForTimeout(80);
    const after = await state(page);
    const opened = await page.evaluate(() => window.PM_HOME_LAST_OPEN_FILE || null);
    /* The old revision stopped at window.PM_HOME_LAST_OPEN_FILE, which is why a
       panel that only wrote a debug string into .editor-code (and panels that
       never opened a tab at all) passed. Assert the RENDERED buffer. */
    const rendered = await page.evaluate(n => {
      const el = document.querySelector('[data-pm-home-surface="editor_panel_' + n + '"]');
      const code = el && el.querySelector('.editor-code');
      const text = code ? (code.textContent || '') : '';
      return {
        code_lines: code ? code.querySelectorAll('.code-line').length : 0,
        debug_placeholder: /^OpenFile /.test(text.trim()),
        tab_present: Boolean(el && el.querySelector('.editor-tabs .tab[data-file]'))
      };
    }, panel);
    targets.push({
      panel,
      submenu_count: count,
      command_delta: after.metrics.commandCount - before.metrics.commandCount,
      command_id: after.commands.at(-1) && after.commands.at(-1).command_id,
      opened,
      rendered
    });
  }
  const finalState = await state(page);
  const persistedLayout = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), finalState.storage_key);
  const persistedText = JSON.stringify(persistedLayout);
  const ownerStateExcluded = !/active_buffer_id|buffer_ids|dirty_buffer_ids/.test(persistedText);
  return {
    pass: Boolean(path) && targets.every(item => item.submenu_count === 4 && item.command_delta === 1 &&
      item.command_id === 'cmd.file.open' &&
      item.opened.target_editor_panel_id === 'editor_panel_' + item.panel &&
      item.opened.target_editor_group_id === 'editor_group_' + item.panel &&
      item.rendered.code_lines > 3 && !item.rendered.debug_placeholder && item.rendered.tab_present) && ownerStateExcluded,
    path,
    targets,
    home_record_excludes_editor_owner_state: ownerStateExcluded
  };
});

/* Movement is direct manipulation only. The per-host "Move or dock" menu rows
   are retired, so this case proves two things instead: every eligible surface
   exposes exactly one grab handle carrying the keyboard-move contract, and
   every host is reachable through it with one command and one persist. */
await runInteraction('surface_move_all_hosts_via_grip_keyboard', async page => {
  await ensureAllOpen(page);
  const ids = ['editor_panel_1', 'editor_panel_2', 'editor_panel_3', 'editor_panel_4', 'dashboard', 'chat', 'terminal_section:terminal_section_1'];
  const inventory = [];
  for (const id of ids) {
    const grip = page.locator('[data-pm-home-handle][data-pm-home-surface-id="' + id + '"]');
    const count = await grip.count();
    const menuMoveRows = await page.locator('#pm-home-surface-menu [data-pm-home-action="move-surface"]').count();
    inventory.push({
      id,
      grips: count,
      accessible_name: count ? await grip.first().getAttribute('aria-label') : null,
      grabbed: count ? await grip.first().getAttribute('aria-grabbed') : null,
      retired_menu_rows: menuMoveRows
    });
  }
  const routeTargets = [
    ['editor_panel_1', 'dock_left'],
    ['editor_panel_2', 'dock_right'],
    ['editor_panel_3', 'dock_top'],
    ['editor_panel_4', 'dock_bottom'],
    ['dashboard', 'floating'],
    ['chat', 'home_main'],
    ['terminal_section:terminal_section_1', 'dock_left']
  ];
  const routes = [];
  for (const [id, host] of routeTargets) {
    const before = await state(page);
    await moveSurfaceTo(page, id, host);
    const after = await state(page);
    routes.push({
      id,
      host,
      actual: after.layout.surfaces.find(surface => surface.surface_instance_id === id).host,
      command_delta: after.metrics.commandCount - before.metrics.commandCount,
      persist_delta: after.metrics.persistCount - before.metrics.persistCount,
      command_id: after.commands.at(-1) && after.commands.at(-1).command_id
    });
  }
  const announced = await page.locator('#pm-home-live-region').count();
  /* -- Cap refusal. Docks cap VISIBLE surfaces at 3/3/2/2 and home_main is
     the uncapped spill host. Fill dock_top to its cap of two, then probe all
     three movement routes against the full dock: keyboard (must announce and
     stay), pointer (host_full disposition, refused drop), and the raw API
     (normalization must spill the overflow to home_main, never overfill). */
  await moveSurfaceTo(page, 'dashboard', 'dock_top');
  const topCount = () => page.evaluate(() => window.PM_HOME_WORKSPACE.layout.surfaces.filter(s => s.host === 'dock_top' && s.visible).length);
  const capBaseline = await topCount();
  const chatGrip = page.locator('[data-pm-home-handle][data-pm-home-surface-id="chat"]').first();
  const kbBefore = await state(page);
  await chatGrip.focus();
  await chatGrip.press('Enter');
  await page.waitForTimeout(70);
  await chatGrip.press('ArrowUp');
  await page.waitForTimeout(70);
  const kbAnnouncement = await page.evaluate(() => document.getElementById('pm-home-live-region').textContent);
  await chatGrip.press('Enter');
  await page.waitForTimeout(140);
  const kbAfter = await state(page);
  const keyboardRefusal = {
    announcement: kbAnnouncement,
    chat_host: kbAfter.layout.surfaces.find(s => s.surface_instance_id === 'chat').host,
    dock_top_visible: await topCount(),
    layout_unchanged: same(kbBefore.layout, kbAfter.layout)
  };
  /* keep the probes independent: if the keyboard route wrongly landed chat in
     the full dock, put it back before probing the pointer route */
  await page.evaluate(() => {
    const home = window.PM_HOME_WORKSPACE;
    const chat = home.layout.surfaces.find(s => s.surface_instance_id === 'chat');
    if (chat.host === 'dock_top') home.moveSurface('chat', 'home_main');
  });
  await page.waitForTimeout(120);
  /* Pointer route, probed with editor_panel_4 (docked at dock_bottom by the
     route matrix above). NOT chat: #chatPanel's contain:layout-paint plus its
     20px border-radius clips descendant hit-testing to the rounded border
     box, leaving only a ~2px sliver of chat's top-right grip triangle
     clickable -- reported as a product defect; the pointer cap contract is
     surface-agnostic. */
  await page.evaluate(() => {
    const surface = document.querySelector('[data-pm-home-surface="editor_panel_4"]');
    if (surface) surface.scrollIntoView({ behavior: 'instant', block: 'nearest', inline: 'end' });
  });
  await page.waitForTimeout(120);
  const ptrGrip = page.locator('[data-pm-home-handle][data-pm-home-surface-id="editor_panel_4"]').first();
  const ptrBefore = await state(page);
  const ptrBox = await ptrGrip.boundingBox();
  const topHostBox = await page.locator('[data-pm-home-host="dock_top"]').boundingBox();
  const ptrPick = handleStartPoint(ptrBox);
  await page.mouse.move(ptrPick.x, ptrPick.y);
  await page.mouse.down();
  await page.mouse.move(ptrPick.x + 3, ptrPick.y + 3);
  await page.mouse.move(topHostBox.x + topHostBox.width / 2, topHostBox.y + topHostBox.height / 2, { steps: 8 });
  await page.mouse.move(topHostBox.x + topHostBox.width / 2 + 1, topHostBox.y + topHostBox.height / 2);
  /* the disposition attribute is written by the rAF-throttled drag pipeline;
     poll rather than racing it with a single read */
  let ptrDisposition = null;
  let ptrDragging = false;
  for (let attempt = 0; attempt < 12 && !ptrDisposition; attempt += 1) {
    const sample = await page.evaluate(() => ({
      disposition: document.getElementById('pm-home-workspace').getAttribute('data-pm-home-drop-disposition'),
      dragging: document.body.classList.contains('pm-home-dragging')
    }));
    ptrDisposition = sample.disposition;
    ptrDragging = ptrDragging || sample.dragging;
    if (!ptrDisposition) await page.waitForTimeout(50);
  }
  await page.mouse.up();
  await page.waitForTimeout(150);
  const ptrAfter = await state(page);
  const pointerRefusal = {
    gesture_engaged: ptrDragging,
    mid_drag_disposition: ptrDisposition,
    dragged_surface_host: ptrAfter.layout.surfaces.find(s => s.surface_instance_id === 'editor_panel_4').host,
    dock_top_visible: await topCount(),
    layout_unchanged: same(ptrBefore.layout, ptrAfter.layout)
  };
  const apiNormalization = await page.evaluate(() => {
    const home = window.PM_HOME_WORKSPACE;
    home.moveSurface('editor_panel_2', 'dock_top');
    const moved = home.layout.surfaces.find(s => s.surface_instance_id === 'editor_panel_2');
    return { host: moved.host, dock_top_visible: home.layout.surfaces.filter(s => s.host === 'dock_top' && s.visible).length };
  });
  const capRefusal = {
    dock_top_filled_to_cap: capBaseline,
    keyboard: keyboardRefusal,
    pointer: pointerRefusal,
    api_normalization: apiNormalization
  };
  const capPass = capBaseline === 2 &&
    keyboardRefusal.chat_host !== 'dock_top' && keyboardRefusal.dock_top_visible === 2 &&
    pointerRefusal.gesture_engaged && pointerRefusal.mid_drag_disposition === 'host_full' && pointerRefusal.layout_unchanged &&
    apiNormalization.host === 'home_main' && apiNormalization.dock_top_visible <= 2;
  return {
    pass: inventory.every(item => item.grips === 1 && item.accessible_name && item.retired_menu_rows === 0) &&
      routes.every(item => item.actual === item.host && item.command_delta === 1 && item.persist_delta === 1) &&
      announced === 1 && capPass &&
      (await state(page)).identity_integrity.ok,
    inventory,
    routes,
    cap_refusal: capRefusal,
    live_region_present: announced === 1
  };
});

await runInteraction('drag_one_commit_and_all_cancellation_paths', async page => {
  const handle = '[data-pm-home-handle][data-pm-home-surface-id="dashboard"]';
  const beforeMove = await state(page);
  await pointerGestureToDropTarget(page, handle, 'dock_left');
  const afterMove = await state(page);
  const moveProof = {
    command_delta: afterMove.metrics.commandCount - beforeMove.metrics.commandCount,
    persist_delta: afterMove.metrics.persistCount - beforeMove.metrics.persistCount,
    preview_delta: afterMove.metrics.previewFrameCount - beforeMove.metrics.previewFrameCount,
    host: afterMove.layout.surfaces.find(surface => surface.surface_instance_id === 'dashboard').host
  };
  /* The load-bearing evidence the old harness lacked: mid-drag the board must
     actually reflow. A clone is lifted, the vacated slot becomes a real
     in-flow placeholder inside the target host, and a neighbour's LAYOUT
     position (offsetLeft/offsetTop, transform-free) changes before any drop. */
  const reflow = await (async () => {
    const box = await page.locator(handle).first().boundingBox();
    const pick = handleStartPoint(box);
    await page.mouse.move(pick.x, pick.y);
    await page.mouse.down();
    await page.mouse.move(pick.x + 3, pick.y + 3);
    // Measure EVERY surface, not one chosen panel: a drop at the middle of a
    // host inserts after the leading surfaces, so those legitimately do not
    // move. The board reflowing is the claim; which surface moves is not.
    const readAll = () => page.evaluate(() => {
      const out = {};
      document.querySelectorAll('[data-pm-home-surface]').forEach(el => {
        out[el.getAttribute('data-pm-home-surface')] = { left: el.offsetLeft, top: el.offsetTop };
      });
      return out;
    });
    const neighbourBefore = await readAll();
    const drop = await dropPointForHost(page, 'home_main');
    await page.mouse.move(drop.x, drop.y, { steps: 10 });
    await page.mouse.move(drop.x + 1, drop.y);
    await page.waitForTimeout(220);
    const during = await page.evaluate(() => {
      const ph = document.getElementById('pm-home-drop-placeholder');
      const positions = {};
      let flipped = false;
      document.querySelectorAll('[data-pm-home-surface]').forEach(el => {
        positions[el.getAttribute('data-pm-home-surface')] = { left: el.offsetLeft, top: el.offsetTop };
        if (getComputedStyle(el).transform !== 'none') flipped = true;
      });
      return {
        lifted: document.querySelectorAll('.pm-home-lifted').length,
        placeholder_in_host: Boolean(ph && ph.parentElement && ph.parentElement.hasAttribute('data-pm-home-host')),
        neighbour: positions,
        flip_transform: flipped
      };
    });
    /* Placeholder FOLLOWS the pointer: crossing sibling midlines re-slots the
       placeholder, so its bounding x must move with the pointer. The probe
       points are derived from the LIVE sibling rects -- squarely over the
       first sibling's leading quarter (resolves before-first) and the last
       sibling's trailing quarter (resolves after-last) -- because arbitrary
       workspace fractions can legally resolve to the same slot, and a point
       in the 8px inter-surface gap does not resolve positionally at all.
       (The pre-rebuild defect: pointer at x=1500, placeholder parked at
       x=299.) */
    const followPoints = await page.evaluate(() => {
      const rects = [];
      document.querySelectorAll('[data-pm-home-host="home_main"] > [data-pm-home-surface]').forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.width > 0) rects.push(r);
      });
      rects.sort((a, b) => a.left - b.left);
      const first = rects[0];
      const last = rects[rects.length - 1];
      return {
        before_first: { x: first.left + first.width * 0.2, y: first.top + first.height / 2 },
        after_last: { x: last.left + last.width * 0.85, y: last.top + last.height / 2 }
      };
    });
    const placeholderRect = () => page.evaluate(() => {
      const ph = document.getElementById('pm-home-drop-placeholder');
      return ph ? { x: ph.getBoundingClientRect().x } : null;
    });
    await page.mouse.move(followPoints.after_last.x, followPoints.after_last.y, { steps: 6 });
    await page.mouse.move(followPoints.after_last.x + 1, followPoints.after_last.y);
    await page.waitForTimeout(220);
    const placeholderRight = await placeholderRect();
    await page.mouse.move(followPoints.before_first.x, followPoints.before_first.y, { steps: 6 });
    await page.mouse.move(followPoints.before_first.x + 1, followPoints.before_first.y);
    await page.waitForTimeout(220);
    const placeholderLeft = await placeholderRect();
    const placeholderFollow = {
      right_of_travel: placeholderRight,
      left_of_travel: placeholderLeft,
      followed: Boolean(placeholderRight && placeholderLeft && placeholderLeft.x < placeholderRight.x - 40)
    };
    /* Floating is explicit-action only (Pop Out row / keyboard F): NO pointer
       position may preview a float. The 8px inter-surface gap is the trap --
       with no surface under the pointer, a stack walk that accepts the first
       [data-pm-home-host] finds the float layer overlaying the grid. */
    const gapPoint = await page.evaluate(() => {
      const rects = [];
      document.querySelectorAll('[data-pm-home-host="home_main"] > [data-pm-home-surface]').forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.width > 5) rects.push(r);
      });
      rects.sort((a, b) => a.left - b.left);
      return rects.length >= 2
        ? { x: (rects[0].right + rects[1].left) / 2, y: rects[0].top + rects[0].height / 2 }
        : null;
    });
    let gapNeverFloats = null;
    if (gapPoint) {
      await page.mouse.move(gapPoint.x, gapPoint.y, { steps: 4 });
      await page.mouse.move(gapPoint.x + 1, gapPoint.y);
      await page.waitForTimeout(200);
      gapNeverFloats = await page.evaluate(() => {
        const draft = window.PM_HOME_WORKSPACE.draft_layout;
        const surface = draft && draft.surfaces.find(s => s.surface_instance_id === 'dashboard');
        const ph = document.getElementById('pm-home-drop-placeholder');
        return {
          draft_host: surface ? surface.host : null,
          placeholder_host: ph && ph.parentElement ? ph.parentElement.getAttribute('data-pm-home-host') : null,
          ok: !surface || surface.host !== 'floating'
        };
      });
      /* return to a positional point before the jitter probe */
      await page.mouse.move(followPoints.before_first.x, followPoints.before_first.y, { steps: 4 });
      await page.mouse.move(followPoints.before_first.x + 1, followPoints.before_first.y);
      await page.waitForTimeout(200);
    }
    /* No-jitter: the preview is change-gated, so pointermoves that resolve to
       the SAME (host, slot) must not touch the host's child list at all. The
       pre-rebuild defect restarted every neighbour's FLIP per pointermove.
       Let the reposition from the gap probe fully settle first, or its own
       placeholder re-seat lands inside the observation window. */
    await page.waitForTimeout(350);
    await page.evaluate(() => {
      const ph = document.getElementById('pm-home-drop-placeholder');
      const host = ph && ph.parentElement;
      window.__pmJitterRecords = 0;
      window.__pmJitterObserver = new MutationObserver(records => { window.__pmJitterRecords += records.length; });
      if (host) window.__pmJitterObserver.observe(host, { childList: true });
    });
    const still = followPoints.before_first;
    await page.mouse.move(still.x, still.y);
    await page.mouse.move(still.x, still.y);
    await page.waitForTimeout(160);
    const jitterMutations = await page.evaluate(() => {
      const total = window.__pmJitterRecords;
      if (window.__pmJitterObserver) window.__pmJitterObserver.disconnect();
      return total;
    });
    await page.keyboard.press('Escape');
    await page.mouse.up();
    await page.waitForTimeout(150);
    return {
      lifted: during.lifted,
      placeholder_in_host: during.placeholder_in_host,
      flip_transform: during.flip_transform,
      neighbour_before: neighbourBefore,
      neighbour_during: during.neighbour,
      neighbour_reflowed: Object.keys(during.neighbour || {}).some(id => {
        const a = neighbourBefore[id], b = during.neighbour[id];
        return a && b && (a.left !== b.left || a.top !== b.top);
      }),
      placeholder_follow: placeholderFollow,
      gap_never_floats: gapNeverFloats,
      same_point_childlist_mutations: jitterMutations
    };
  })();

  const beforeUnchanged = await state(page);
  await pointerGestureToDropTarget(page, handle, 'dock_left');
  const afterUnchanged = await state(page);
  const unchangedDrop = {
    exact_layout: same(beforeUnchanged.layout, afterUnchanged.layout),
    command_delta: afterUnchanged.metrics.commandCount - beforeUnchanged.metrics.commandCount,
    persist_delta: afterUnchanged.metrics.persistCount - beforeUnchanged.metrics.persistCount
  };
  const beforeInvalid = await state(page);
  await pointerGesture(page, handle, { x: 500, y: 14 }, 'up');
  const afterInvalid = await state(page);
  const invalidTarget = {
    exact_layout: same(beforeInvalid.layout, afterInvalid.layout),
    command_delta: afterInvalid.metrics.commandCount - beforeInvalid.metrics.commandCount,
    persist_delta: afterInvalid.metrics.persistCount - beforeInvalid.metrics.persistCount
  };
  /* `lostcapture` is deliberately NOT a cancellation vector any more: live
     neighbour reflow re-parents nodes mid-drag, which drops pointer capture, so
     treating capture loss as a cancel killed every drag on its first frame.
     Escape / pointercancel / window blur remain the cancellation contract. */
  const cancellations = [];
  for (const kind of ['escape', 'pointercancel', 'blur']) {
    const before = await state(page);
    await pointerGesture(page, handle, { x: 1240, y: 90 }, kind);
    const after = await state(page);
    cancellations.push({
      kind,
      exact_layout: same(before.layout, after.layout),
      command_delta: after.metrics.commandCount - before.metrics.commandCount,
      persist_delta: after.metrics.persistCount - before.metrics.persistCount,
      cancel_delta: after.metrics.cancelledGestureCount - before.metrics.cancelledGestureCount
    });
  }
  /* D5 regression guard (2026-08-13): a pointer drag begun on a grip that IS
     the focused element must survive. The broken build hid the dragged
     surface, the focused grip became unfocusable, and the relocation blur hit
     the drag's blur-cancellation vector -- the gesture died immediately or
     within ~250ms. The fix scopes that vector to event.target === window. */
  const focusedGrip = page.locator(handle).first();
  await focusedGrip.focus();
  const gripFocused = await page.evaluate(() => Boolean(document.activeElement && document.activeElement.hasAttribute('data-pm-home-handle')));
  const focusedBefore = await state(page);
  const focusedBox = await focusedGrip.boundingBox();
  const focusedPick = handleStartPoint(focusedBox);
  await page.mouse.move(focusedPick.x, focusedPick.y);
  await page.mouse.down();
  await page.mouse.move(focusedPick.x + 24, focusedPick.y + 24, { steps: 3 });
  const holdSamples = [];
  for (let sample = 0; sample < 5; sample += 1) {
    await page.waitForTimeout(100);
    holdSamples.push(await page.evaluate(() => document.body.classList.contains('pm-home-dragging')));
  }
  const focusedDuring = await state(page);
  const focusedDropAt = await dropPointForHost(page, 'home_main');
  await page.mouse.move(focusedDropAt.x, focusedDropAt.y, { steps: 8 });
  await page.mouse.move(focusedDropAt.x + 1, focusedDropAt.y);
  await page.waitForTimeout(220);
  /* 2026-08-13 tweak wave 2: the placeholder previews the PROJECTED target
     geometry (fair share of the target host), so the surface must land where
     the placeholder stood */
  const placeholderPreview = await page.evaluate(() => {
    const ph = document.getElementById('pm-home-drop-placeholder');
    if (!ph) return null;
    const r = ph.getBoundingClientRect();
    return { x: r.x, y: r.y, w: r.width, h: r.height };
  });
  await page.mouse.up();
  await page.waitForTimeout(200);
  const focusedAfter = await state(page);
  const landedRect = await page.evaluate(() => {
    const r = document.querySelector('[data-pm-home-surface="dashboard"]').getBoundingClientRect();
    return { x: r.x, y: r.y, w: r.width, h: r.height };
  });
  const projectionDelta = placeholderPreview ? Math.max(
    Math.abs(placeholderPreview.x - landedRect.x), Math.abs(placeholderPreview.y - landedRect.y),
    Math.abs(placeholderPreview.w - landedRect.w), Math.abs(placeholderPreview.h - landedRect.h)) : null;
  const focusedDrag = {
    grip_focused: gripFocused,
    hold_samples: holdSamples,
    survived_400ms: holdSamples.every(Boolean),
    cancel_delta_during_hold: focusedDuring.metrics.cancelledGestureCount - focusedBefore.metrics.cancelledGestureCount,
    total_cancel_delta: focusedAfter.metrics.cancelledGestureCount - focusedBefore.metrics.cancelledGestureCount,
    committed_host: focusedAfter.layout.surfaces.find(surface => surface.surface_instance_id === 'dashboard').host,
    command_delta: focusedAfter.metrics.commandCount - focusedBefore.metrics.commandCount,
    command_id: focusedAfter.commands.at(-1) && focusedAfter.commands.at(-1).command_id,
    placeholder_preview: placeholderPreview,
    landed_rect: landedRect,
    projection_max_delta_px: projectionDelta === null ? null : Math.round(projectionDelta)
  };
  const focusedDragPass = focusedDrag.grip_focused && focusedDrag.survived_400ms &&
    focusedDrag.cancel_delta_during_hold === 0 && focusedDrag.total_cancel_delta === 0 &&
    focusedDrag.committed_host === 'home_main' && focusedDrag.command_delta === 1 &&
    focusedDrag.command_id === 'cmd.workspace_layout.move_surface' &&
    projectionDelta !== null && projectionDelta <= 24;
  const classesClear = await page.evaluate(() => !document.body.classList.contains('pm-home-dragging') && !document.body.classList.contains('pm-resizing'));
  /* wave 4: the release settle choreography keeps the lifted clone alive for
     ~200-400ms after the drop; poll so a settle in flight is not misread as a
     leak (a real leak still fails after 1.5s) */
  let residue = await page.evaluate(() => document.querySelectorAll('.pm-home-lifted, #pm-home-drop-placeholder').length);
  for (let attempt = 0; attempt < 10 && residue > 0; attempt += 1) {
    await page.waitForTimeout(150);
    residue = await page.evaluate(() => document.querySelectorAll('.pm-home-lifted, #pm-home-drop-placeholder').length);
  }
  return {
    pass: moveProof.host === 'dock_left' && moveProof.command_delta === 1 && moveProof.persist_delta === 1 && moveProof.preview_delta > 0 &&
      focusedDragPass &&
      reflow.lifted === 1 && reflow.placeholder_in_host && reflow.neighbour_reflowed &&
      reflow.placeholder_follow.followed && (!reflow.gap_never_floats || reflow.gap_never_floats.ok) &&
      reflow.same_point_childlist_mutations === 0 &&
      unchangedDrop.exact_layout && unchangedDrop.command_delta === 0 && unchangedDrop.persist_delta === 0 &&
      invalidTarget.exact_layout && invalidTarget.command_delta === 0 && invalidTarget.persist_delta === 0 &&
      cancellations.every(item => item.exact_layout && item.command_delta === 0 && item.persist_delta === 0 && item.cancel_delta === 1) &&
      classesClear && residue === 0,
    move: moveProof,
    live_reflow: reflow,
    unchanged_drop: unchangedDrop,
    invalid_target: invalidTarget,
    cancellations,
    focused_grip_drag: focusedDrag,
    gesture_classes_clear: classesClear,
    drag_residue: residue
  };
}, { recordVideo: true });

await runInteraction('shared_resizers_one_commit_changed_only_and_cancel', async page => {
  /* -- Adjacent-PAIR pixel transfer, on the roomy default layout (three
     home_main surfaces). Dragging the divider between A and B by +200px must
     move exactly that pair (+200/-200), leave the non-adjacent surface where
     it was, and commit ONE skip_render resize naming BOTH pair members. The
     pre-rebuild defect diluted the same drag across every flex sibling
     (+133/-67 with the far dashboard dragged along). */
  const mainWidths = () => page.evaluate(() => {
    const out = {};
    document.querySelectorAll('[data-pm-home-host="home_main"] > [data-pm-home-surface][data-pm-home-visible="true"]').forEach(el => {
      out[el.getAttribute('data-pm-home-surface')] = el.getBoundingClientRect().width;
    });
    return out;
  });
  const pairBefore = await mainWidths();
  const pairState = await state(page);
  const divider = page.locator('[data-pm-home-resizer="editor_panel_1"]:not([data-pm-home-resizer-corner])');
  const dividerBox = await divider.boundingBox();
  await page.mouse.move(dividerBox.x + dividerBox.width / 2, dividerBox.y + dividerBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(dividerBox.x + dividerBox.width / 2 + 200, dividerBox.y + dividerBox.height / 2, { steps: 10 });
  await page.mouse.up();
  const pairAtMouseup = await mainWidths();
  /* skip_render commit: geometry at mouseup must ALREADY be final -- a settle
     flash shows up as movement inside the next 200ms. */
  await page.waitForTimeout(200);
  const pairSettled = await mainWidths();
  const pairAfterState = await state(page);
  const pairCommand = pairAfterState.commands.at(-1);
  const pairCheck = {
    before: pairBefore,
    at_mouseup: pairAtMouseup,
    settled: pairSettled,
    delta_a: pairAtMouseup.editor_panel_1 - pairBefore.editor_panel_1,
    delta_b: pairAtMouseup.editor_panel_2 - pairBefore.editor_panel_2,
    delta_other: pairAtMouseup.dashboard - pairBefore.dashboard,
    command_delta: pairAfterState.metrics.commandCount - pairState.metrics.commandCount,
    command_id: pairCommand && pairCommand.command_id,
    command_affected: pairCommand && pairCommand.affected_surface_instance_ids,
    settle_drift: Math.max(...Object.keys(pairAtMouseup).map(id => Math.abs(pairSettled[id] - pairAtMouseup[id])))
  };
  const pairPass = Math.abs(pairCheck.delta_a - 200) <= 2 && Math.abs(pairCheck.delta_b + 200) <= 2 &&
    Math.abs(pairCheck.delta_other) <= 2 && pairCheck.settle_drift <= 1 &&
    pairCheck.command_delta === 1 && pairCheck.command_id === 'cmd.workspace_layout.resize_surface' &&
    Array.isArray(pairCheck.command_affected) &&
    pairCheck.command_affected.includes('editor_panel_1') && pairCheck.command_affected.includes('editor_panel_2');

  await ensureAllOpen(page);
  const selectors = await page.locator('[data-pm-home-resizer]:visible').evaluateAll(elements => elements.map(element => ({
    surface_id: element.getAttribute('data-pm-home-surface-id'),
    orientation: element.getAttribute('aria-orientation')
  })));
  const checks = [];
  for (const item of selectors) {
    const selector = '[data-pm-home-resizer][data-pm-home-surface-id="' + item.surface_id + '"]';
    await page.locator(selector).first().scrollIntoViewIfNeeded();
    const box = await page.locator(selector).first().boundingBox();
    const before = await state(page);
    /* Geometry, not just dispatch. The previous revision asserted one
       resize_surface command per drag and nothing else, which is exactly how a
       regression that committed a new basis while moving zero pixels shipped
       green. Measure the surface box on both sides of the gesture. */
    const geomBefore = await page.evaluate(id => {
      const el = document.querySelector('[data-pm-home-surface="' + id + '"]');
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { w: Math.round(r.width), h: Math.round(r.height) };
    }, item.surface_id);
    const target = item.orientation === 'horizontal'
      ? { x: box.x + box.width / 2, y: Math.max(20, box.y - 64) }
      : { x: Math.max(20, box.x - 64), y: box.y + box.height / 2 };
    await pointerGesture(page, selector, target, 'up');
    await page.waitForTimeout(120);
    const geomAfter = await page.evaluate(id => {
      const el = document.querySelector('[data-pm-home-surface="' + id + '"]');
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { w: Math.round(r.width), h: Math.round(r.height) };
    }, item.surface_id);
    const after = await state(page);
    const moved = Boolean(geomBefore && geomAfter &&
      (Math.abs(geomAfter.w - geomBefore.w) > 4 || Math.abs(geomAfter.h - geomBefore.h) > 4));
    /* A surface already clamped to its minimum cannot move, and the model is
       right to record the intent anyway (it applies once room returns). Such a
       surface is excused, but at least one surface must demonstrate real
       movement or the case has proved nothing. */
    const atFloor = await page.evaluate(id => {
      const el = document.querySelector('[data-pm-home-surface="' + id + '"]');
      if (!el || !el.parentElement) return false;
      const host = el.parentElement;
      /* An over-subscribed host has no free space to redistribute, so nothing in
         it can grow or shrink no matter what the model records. */
      return host.scrollWidth > host.clientWidth + 2 || host.scrollHeight > host.clientHeight + 2;
    }, item.surface_id);
    checks.push({
      surface_id: item.surface_id,
      orientation: item.orientation,
      command_delta: after.metrics.commandCount - before.metrics.commandCount,
      persist_delta: after.metrics.persistCount - before.metrics.persistCount,
      last_command: after.commands.at(-1) && after.commands.at(-1).command_id,
      geometry_before: geomBefore,
      geometry_after: geomAfter,
      geometry_changed: moved,
      clamped_at_minimum: atFloor
    });
  }
  const firstSelector = selectors.length ? '[data-pm-home-resizer][data-pm-home-surface-id="' + selectors[0].surface_id + '"]' : null;
  let cancellation = null;
  if (firstSelector) {
    const before = await state(page);
    const box = await page.locator(firstSelector).first().boundingBox();
    await pointerGesture(page, firstSelector, { x: box.x + 35, y: box.y + 35 }, 'escape');
    const after = await state(page);
    cancellation = {
      exact_layout: same(before.layout, after.layout),
      command_delta: after.metrics.commandCount - before.metrics.commandCount,
      persist_delta: after.metrics.persistCount - before.metrics.persistCount
    };
  }
  /* -- Row-dock handles (tweak wave 2): dock_top/dock_bottom surfaces carry
     BOTH a col divider (pair width transfer between dock siblings, sum
     conserved) and a [data-pm-home-resizer-track] row handle that drives the
     DOCK track height for every surface in the host (persisted via
     size.cross_basis_px). */
  await moveSurfaceTo(page, 'editor_panel_3', 'dock_top');
  await moveSurfaceTo(page, 'editor_panel_4', 'dock_top');
  const dockRects = () => page.evaluate(() => {
    const out = {};
    document.querySelectorAll('[data-pm-home-host="dock_top"] > [data-pm-home-surface][data-pm-home-visible="true"]').forEach(el => {
      const r = el.getBoundingClientRect();
      out[el.getAttribute('data-pm-home-surface')] = { w: r.width, h: r.height };
    });
    return out;
  });
  const dockBefore = await dockRects();
  const dockDivider = page.locator('[data-pm-home-host="dock_top"] [data-pm-home-resizer]:not([data-pm-home-resizer-track]):not([data-pm-home-resizer-corner])').first();
  const dockDividerId = await dockDivider.getAttribute('data-pm-home-surface-id');
  const dockDividerBox = await dockDivider.boundingBox();
  const dockStateBefore = await state(page);
  await page.mouse.move(dockDividerBox.x + dockDividerBox.width / 2, dockDividerBox.y + dockDividerBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(dockDividerBox.x + dockDividerBox.width / 2 + 80, dockDividerBox.y + dockDividerBox.height / 2, { steps: 6 });
  await page.mouse.up();
  await page.waitForTimeout(150);
  const dockMid = await dockRects();
  const dockIds = Object.keys(dockBefore);
  const dividerDeltas = dockIds.map(id => dockMid[id].w - dockBefore[id].w);
  const dockDividerCheck = {
    divider_surface_id: dockDividerId,
    ids: dockIds,
    width_deltas: dividerDeltas.map(delta => Math.round(delta)),
    sum_conserved: Math.abs(dividerDeltas.reduce((total, delta) => total + delta, 0)) <= 2,
    moved: dividerDeltas.some(delta => Math.abs(delta) >= 60)
  };
  const crossBefore = await page.evaluate(() => {
    const record = JSON.parse(localStorage.getItem(window.PM_HOME_WORKSPACE.storage_key));
    return record.surfaces.find(surface => surface.surface_instance_id === 'editor_panel_3').size.cross_basis_px;
  });
  const trackHandle = page.locator('[data-pm-home-host="dock_top"] [data-pm-home-resizer-track]').first();
  const trackBox = await trackHandle.boundingBox();
  await page.mouse.move(trackBox.x + trackBox.width / 2, trackBox.y + trackBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(trackBox.x + trackBox.width / 2, trackBox.y + trackBox.height / 2 - 60, { steps: 6 });
  await page.mouse.up();
  await page.waitForTimeout(150);
  const dockAfter = await dockRects();
  const dockStateAfter = await state(page);
  const heightDeltas = dockIds.map(id => dockAfter[id].h - dockMid[id].h);
  const crossAfter = await page.evaluate(() => {
    const record = JSON.parse(localStorage.getItem(window.PM_HOME_WORKSPACE.storage_key));
    return record.surfaces.find(surface => surface.surface_instance_id === 'editor_panel_3').size.cross_basis_px;
  });
  const dockTrackCheck = {
    height_deltas: heightDeltas.map(delta => Math.round(delta)),
    all_surfaces_track: Math.abs(heightDeltas[0] - heightDeltas[1]) <= 2,
    track_moved: heightDeltas.every(delta => Math.abs(delta) >= 30),
    cross_basis_before: crossBefore,
    cross_basis_after: crossAfter,
    cross_basis_persisted: Math.abs((crossAfter - crossBefore) - heightDeltas[0]) <= 4,
    commands: dockStateAfter.metrics.commandCount - dockStateBefore.metrics.commandCount
  };
  const dockHandlesPass = dockDividerCheck.sum_conserved && dockDividerCheck.moved &&
    dockTrackCheck.all_surfaces_track && dockTrackCheck.track_moved && dockTrackCheck.cross_basis_persisted &&
    dockTrackCheck.commands === 2;

  /* -- Floating corner handle drives BOTH axes. Float a surface through the
     explicit keyboard path, then drag its bottom-right corner handle. */
  await moveSurfaceTo(page, 'dashboard', 'floating');
  const cornerCount = await page.locator('[data-pm-home-resizer-corner]').count();
  const cornerHandle = page.locator('[data-pm-home-resizer-corner="dashboard"]');
  const floatRect = () => page.evaluate(() => {
    const el = document.querySelector('[data-pm-home-surface="dashboard"]');
    const r = el.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height) };
  });
  const cornerBefore = await floatRect();
  const cornerStateBefore = await state(page);
  const cornerBox = await cornerHandle.boundingBox();
  await page.mouse.move(cornerBox.x + cornerBox.width / 2, cornerBox.y + cornerBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(cornerBox.x + cornerBox.width / 2 - 120, cornerBox.y + cornerBox.height / 2 - 90, { steps: 8 });
  await page.mouse.up();
  await page.waitForTimeout(150);
  const cornerAfter = await floatRect();
  const cornerStateAfter = await state(page);
  const cornerCheck = {
    corner_handle_count: cornerCount,
    before: cornerBefore,
    after: cornerAfter,
    width_changed: Math.abs(cornerAfter.w - cornerBefore.w) > 40,
    height_changed: Math.abs(cornerAfter.h - cornerBefore.h) > 30,
    command_delta: cornerStateAfter.metrics.commandCount - cornerStateBefore.metrics.commandCount,
    command_id: cornerStateAfter.commands.at(-1) && cornerStateAfter.commands.at(-1).command_id
  };
  const cornerPass = cornerCheck.corner_handle_count === 1 && cornerCheck.width_changed && cornerCheck.height_changed &&
    cornerCheck.command_delta === 1 && cornerCheck.command_id === 'cmd.workspace_layout.resize_surface';
  const glowCleanup = await page.evaluate(() => !document.body.classList.contains('pm-resizing') && document.querySelectorAll('.resizer-glow, .is-glowing').length === 0);
  return {
    pass: pairPass && selectors.length >= 4 &&
      checks.every(item => item.command_delta === 1 && item.persist_delta === 1 &&
        item.last_command === 'cmd.workspace_layout.resize_surface' &&
        (item.geometry_changed || item.clamped_at_minimum)) &&
      checks.some(item => item.geometry_changed) &&
      cancellation && cancellation.exact_layout && cancellation.command_delta === 0 && cancellation.persist_delta === 0 &&
      dockHandlesPass && cornerPass && glowCleanup,
    adjacent_pair_transfer: pairCheck,
    enrolled: selectors,
    changed_resize_checks: checks,
    cancellation,
    dock_divider: dockDividerCheck,
    dock_track: dockTrackCheck,
    floating_corner: cornerCheck,
    glow_cleanup: glowCleanup
  };
}, { recordVideo: true, viewport: { width: 2200, height: 1200 } });

/* 2026-08-13 wave: the top-bar more menu gained a Reset Layout row. It commits
   cmd.workspace_layout.reset through the normal command path, persists the
   default layout, then reloads the page (~180ms) -- the only honest demo reset
   (PM_DEMO state is closure-private and unpersisted). */
await runInteraction('topbar_reset_layout_row', async page => {
  await moveSurfaceTo(page, 'dashboard', 'dock_left');
  const beforeReset = await state(page);
  await page.locator('#pm-home-more-btn').click();
  await page.waitForTimeout(360);
  const row = page.locator('#pm-home-more-menu [data-pm-home-top-action="reset-layout"]');
  const rowCount = await row.count();
  const rowLabel = rowCount ? (await row.textContent()).trim() : null;
  /* The reload timer is ~180ms out, so reading the command log after the
     click races navigation. The workspace broadcasts every dispatch as a
     pm:command-dispatch CustomEvent -- bridge it through sessionStorage,
     which survives the reload. */
  await page.evaluate(() => {
    window.__pm_pre_reset = true;
    sessionStorage.removeItem('__pm_reset_case_cmd');
    window.addEventListener('pm:command-dispatch', event => {
      try {
        if (event.detail && event.detail.command_id === 'cmd.workspace_layout.reset') {
          sessionStorage.setItem('__pm_reset_case_cmd', event.detail.command_id);
        }
      } catch (error) {}
    });
  });
  await row.click();
  await page.waitForFunction(() => !window.__pm_pre_reset && Boolean(window.PM_HOME_WORKSPACE), null, { timeout: 20000 });
  await page.waitForTimeout(350);
  const preReload = await page.evaluate(() => ({
    last_command_id: sessionStorage.getItem('__pm_reset_case_cmd')
  }));
  const after = await state(page);
  const dashboardAfter = after.layout.surfaces.find(surface => surface.surface_instance_id === 'dashboard');
  const floatingChatHidden = await page.evaluate(() => {
    const overlay = document.getElementById('floatingChat');
    return !overlay || getComputedStyle(overlay).display === 'none';
  });
  const rowStillPresent = await page.locator('#pm-home-more-menu [data-pm-home-top-action="reset-layout"]').count();
  return {
    pass: rowCount === 1 && rowLabel === 'Reset Layout' &&
      preReload && preReload.last_command_id === 'cmd.workspace_layout.reset' &&
      dashboardAfter.host === 'home_main' &&
      after.layout.surfaces.every(surface => surface.host !== 'floating') &&
      after.layout.validation.status === 'valid' &&
      floatingChatHidden && rowStillPresent === 1,
    row_count: rowCount,
    row_label: rowLabel,
    dashboard_before: beforeReset.layout.surfaces.find(surface => surface.surface_instance_id === 'dashboard').host,
    pre_reload: preReload,
    dashboard_after_reload: dashboardAfter.host,
    floating_chat_hidden: floatingChatHidden
  };
}, { recordVideo: true });

/* 2026-08-13 wave: the base full-screen chat overlay is retired. The docked
   chat kebab's Pop Out row must float chat INSIDE the workspace float layer;
   #floatingChat never displays and a re-render never resurrects a second
   chat. */
await runInteraction('chat_popout_stays_in_canvas', async page => {
  const chatVisible = await page.evaluate(() => window.PM_HOME_WORKSPACE.layout.surfaces.find(surface => surface.surface_instance_id === 'chat').visible);
  if (!chatVisible) {
    await page.locator('.activity-bar .icon[title="Chat"]').click();
    await page.waitForTimeout(250);
  }
  await page.locator('[data-pm-home-surface="chat"] .pm6-chat-more-btn').click();
  await page.waitForTimeout(300);
  const before = await state(page);
  await page.locator('.pm6-chat-more-menu .popOutBtn').click();
  await page.waitForTimeout(400);
  const after = await state(page);
  const domAfterPopout = await page.evaluate(() => {
    const chat = document.querySelector('[data-pm-home-surface="chat"]');
    const overlay = document.getElementById('floatingChat');
    const workspace = document.getElementById('pm-home-workspace').getBoundingClientRect();
    const rect = chat.getBoundingClientRect();
    return {
      parent_is_float_layer: Boolean(chat.parentElement && chat.parentElement.classList.contains('pm-home-float-layer')),
      floating_chat_display: overlay ? getComputedStyle(overlay).display : 'absent',
      overlay_scrim_visible: Boolean(document.querySelector('.pm6-chat-overlay') && document.querySelector('.pm6-chat-overlay').offsetParent),
      chat_nodes: document.querySelectorAll('[data-pm-home-surface="chat"]').length,
      inside_workspace: rect.top >= workspace.top - 1 && rect.left >= workspace.left - 1 && rect.bottom <= workspace.bottom + 1
    };
  });
  /* a workspace re-render must not resurrect the docked chat next to the
     floated one -- force one through a normal command */
  await openPanel(page, 3);
  const domAfterRerender = await page.evaluate(() => ({
    chat_nodes: document.querySelectorAll('[data-pm-home-surface="chat"]').length,
    floating_chat_display: document.getElementById('floatingChat') ? getComputedStyle(document.getElementById('floatingChat')).display : 'absent',
    parent_is_float_layer: Boolean(document.querySelector('[data-pm-home-surface="chat"]').parentElement.classList.contains('pm-home-float-layer'))
  }));
  const chatSurface = after.layout.surfaces.find(surface => surface.surface_instance_id === 'chat');
  return {
    pass: chatSurface.host === 'floating' &&
      after.commands.at(-1) && after.commands.at(-1).command_id === 'cmd.panel.undock' &&
      after.metrics.commandCount - before.metrics.commandCount === 1 &&
      domAfterPopout.parent_is_float_layer && domAfterPopout.floating_chat_display === 'none' &&
      !domAfterPopout.overlay_scrim_visible && domAfterPopout.chat_nodes === 1 && domAfterPopout.inside_workspace &&
      domAfterRerender.chat_nodes === 1 && domAfterRerender.floating_chat_display === 'none' && domAfterRerender.parent_is_float_layer,
    chat_surface: chatSurface,
    dom_after_popout: domAfterPopout,
    dom_after_rerender: domAfterRerender,
    command: after.commands.at(-1)
  };
}, { recordVideo: true });

/* 2026-08-13 tweak wave 2: the grip is an 18px lines-only clip-path triangle
   (polygon(0 0,100% 0,100% 100%)) seated as the surface element's first child
   at its exact top-RIGHT corner, above the resize handles. A point 6px inside
   that corner must hit-test to the grip on EVERY visible surface, chat
   included. */
await runInteraction('grip_corner_hit_target_and_zorder', async page => {
  await ensureAllOpen(page);
  const surfaces = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('[data-pm-home-surface][data-pm-home-visible="true"]')).map(element => {
      const id = element.getAttribute('data-pm-home-surface');
      /* the home_main row legitimately overflows into a scrollport when its
         minimums exceed the container -- a surface scrolled out of view has
         no hittable corner, so bring each one in before testing */
      /* inline:'end' -- the grip sits at the top-RIGHT corner now, so the
         RIGHT edge is what must be inside the scrollport */
      element.scrollIntoView({ behavior: 'instant', block: 'nearest', inline: 'end' });
      const rect = element.getBoundingClientRect();
      const hit = document.elementFromPoint(rect.right - 6, rect.top + 6);
      const hitGrip = hit && hit.closest ? hit.closest('[data-pm-home-handle]') : null;
      const grip = element.querySelector('[data-pm-home-handle="' + id + '"]');
      const gripRect = grip ? grip.getBoundingClientRect() : null;
      const gripStyle = grip ? getComputedStyle(grip) : null;
      return {
        id,
        grip_present: Boolean(grip),
        grip_is_first_child: Boolean(grip && element.firstElementChild === grip),
        hit_resolves_to_own_grip: Boolean(hitGrip && hitGrip.getAttribute('data-pm-home-handle') === id),
        hit_tag: hit ? hit.tagName + (hit.className && typeof hit.className === 'string' ? '.' + hit.className.split(' ')[0] : '') : null,
        grip_size: gripRect ? { w: Math.round(gripRect.width), h: Math.round(gripRect.height) } : null,
        grip_at_corner: gripRect ? Math.abs(gripRect.right - rect.right) <= 1.5 && Math.abs(gripRect.top - rect.top) <= 1.5 : false,
        z_index: gripStyle ? gripStyle.zIndex : null,
        clip_path_triangle: gripStyle ? gripStyle.clipPath.indexOf('polygon') === 0 : false
      };
    });
  });
  const ids = surfaces.map(item => item.id);
  /* Chat pointer-drag ENGAGE probe (regression guard for the corner-arc
     clipping defect): #chatPanel used to carry a 20px top-right radius under
     contain:layout-paint, which clipped all but a ~2px sliver of the grip's
     hit region; with the radius reduced the standard pickup point must begin
     a real drag. Escape cancels it -- no layout change. */
  await page.evaluate(() => {
    const chat = document.querySelector('[data-pm-home-surface="chat"]');
    if (chat) chat.scrollIntoView({ behavior: 'instant', block: 'nearest', inline: 'end' });
  });
  await page.waitForTimeout(100);
  const chatGripEl = page.locator('[data-pm-home-handle][data-pm-home-surface-id="chat"]').first();
  const chatGripBox = await chatGripEl.boundingBox();
  const chatPick = handleStartPoint(chatGripBox);
  const engageBefore = await state(page);
  await page.mouse.move(chatPick.x, chatPick.y);
  await page.mouse.down();
  await page.mouse.move(chatPick.x + 6, chatPick.y + 6, { steps: 2 });
  await page.waitForTimeout(120);
  const chatEngaged = await page.evaluate(() => document.body.classList.contains('pm-home-dragging'));
  await page.keyboard.press('Escape');
  await page.mouse.up();
  await page.waitForTimeout(150);
  const engageAfter = await state(page);
  const chatDragProbe = {
    engaged: chatEngaged,
    layout_unchanged: same(engageBefore.layout, engageAfter.layout),
    cancel_delta: engageAfter.metrics.cancelledGestureCount - engageBefore.metrics.cancelledGestureCount
  };
  /* z-index floor, not an exact pin: the corner hit-test is the substantive
     assertion. The 2026-08-13 fix wave raised the grip from 40 to 110 so it
     wins over the full-width row resize handles (z 100) at dock_top/bottom
     surfaces' corners; any value that keeps the grip on top satisfies the
     contract. */
  return {
    pass: surfaces.length >= 7 && ids.includes('chat') &&
      surfaces.every(item => item.grip_present && item.grip_is_first_child && item.hit_resolves_to_own_grip &&
        item.grip_size && Math.abs(item.grip_size.w - 18) <= 1 && Math.abs(item.grip_size.h - 18) <= 1 &&
        item.grip_at_corner && Number.parseInt(item.z_index, 10) >= 40 && item.clip_path_triangle) &&
      chatDragProbe.engaged && chatDragProbe.layout_unchanged && chatDragProbe.cancel_delta === 1,
    surfaces,
    chat_pointer_drag: chatDragProbe
  };
});

/* 2026-08-13 wave: floating is a within-session state, never a boot state.
   Persisted floating surfaces demote to their last docked host at boot with a
   storage.boot_demote_floating receipt, and boot renders once -- no 250ms /
   1000ms catch-up renders reparenting surfaces after first paint. */
await runInteraction('boot_never_floating', async page => {
  await moveSurfaceTo(page, 'editor_panel_1', 'floating');
  await moveSurfaceTo(page, 'dashboard', 'floating');
  const persistedBefore = await page.evaluate(() => {
    const record = JSON.parse(localStorage.getItem(window.PM_HOME_WORKSPACE.storage_key));
    return record.surfaces.filter(surface => surface.host === 'floating').map(surface => surface.surface_instance_id);
  });
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(() => Boolean(window.PM_HOME_WORKSPACE), null, { timeout: 120000 });
  await page.waitForTimeout(350);
  const after = await state(page);
  const demoteReceipt = after.receipts.find(record => record.command_id === 'storage.boot_demote_floating');
  const persistedAfter = await page.evaluate(() => {
    const record = JSON.parse(localStorage.getItem(window.PM_HOME_WORKSPACE.storage_key));
    return record.surfaces.filter(surface => surface.host === 'floating').map(surface => surface.surface_instance_id);
  });
  const floatLayerChildren = await page.evaluate(() => document.querySelectorAll('.pm-home-float-layer [data-pm-home-surface]').length);
  /* Render-once probe: watch the HOST containers' direct child lists over the
     window where the retired 250ms/1000ms catch-up renders used to fire. A
     late renderLayout reparents surface elements between hosts; content
     engines (terminal ticks, chat) only mutate INSIDE surfaces, so host-level
     childList records isolate layout churn. */
  await page.evaluate(() => {
    window.__pmBootChurn = 0;
    window.__pmBootObserver = new MutationObserver(records => { window.__pmBootChurn += records.length; });
    document.querySelectorAll('[data-pm-home-host]').forEach(host => {
      window.__pmBootObserver.observe(host, { childList: true });
    });
  });
  await page.waitForTimeout(1100);
  const lateChurn = await page.evaluate(() => {
    window.__pmBootObserver.disconnect();
    return window.__pmBootChurn;
  });
  return {
    pass: persistedBefore.length === 2 &&
      after.layout.surfaces.every(surface => surface.host !== 'floating') &&
      Boolean(demoteReceipt) && demoteReceipt.outcome === 'applied' &&
      same(demoteReceipt.details.demoted_surface_instance_ids.slice().sort(), persistedBefore.slice().sort()) &&
      persistedAfter.length === 0 && floatLayerChildren === 0 && lateChurn === 0,
    persisted_floating_before_reload: persistedBefore,
    demote_receipt: demoteReceipt || null,
    persisted_floating_after_reload: persistedAfter,
    float_layer_children: floatLayerChildren,
    late_boot_host_childlist_mutations: lateChurn
  };
});

/* 2026-08-13 wave: no dead space. A stray placeholder outside a gesture is
   swept by any render, and normalizeMainRowBases re-sums a degenerate
   persisted layout (tiny committed bases) to the container at boot -- the row
   self-heals instead of rendering an unclaimable void. */
await runInteraction('dead_space_self_heal', async page => {
  await page.evaluate(() => {
    const home = window.PM_HOME_WORKSPACE;
    const record = JSON.parse(localStorage.getItem(home.storage_key)) || home.layout;
    record.surfaces.forEach(surface => {
      if (surface.host === 'home_main') surface.size.basis_px = 60;
    });
    localStorage.setItem(home.storage_key, JSON.stringify(record));
  });
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(() => Boolean(window.PM_HOME_WORKSPACE), null, { timeout: 120000 });
  await page.waitForTimeout(350);
  const geometry = await page.evaluate(() => {
    const host = document.querySelector('[data-pm-home-host="home_main"]');
    const hostStyle = getComputedStyle(host);
    /* clientWidth includes the host's own padding (4px each side); the row
       can only ever fill the CONTENT box */
    const contentWidth = host.clientWidth - parseFloat(hostStyle.paddingLeft) - parseFloat(hostStyle.paddingRight);
    const surfaces = Array.from(host.querySelectorAll(':scope > [data-pm-home-surface][data-pm-home-visible="true"]'))
      .filter(element => !element.hasAttribute('data-pm-home-collapsed') || element.getAttribute('data-pm-home-collapsed') !== 'true');
    const widths = surfaces.map(element => element.getBoundingClientRect().width);
    /* --pm-home-gap is 4px as of tweak wave 2; read it live so the fixture
       tracks the token */
    const gapPx = parseFloat(hostStyle.gap) || 4;
    const gaps = gapPx * Math.max(0, surfaces.length - 1);
    const sum = widths.reduce((total, width) => total + width, 0) + gaps;
    return {
      host_client_width: host.clientWidth,
      host_content_width: Math.round(contentWidth),
      surface_count: surfaces.length,
      widths: widths.map(width => Math.round(width)),
      sum_with_gaps: Math.round(sum),
      dead_space: Math.round(contentWidth - sum)
    };
  });
  const validation = await page.evaluate(() => window.PM_HOME_WORKSPACE.layout.validation.status);
  /* stray-placeholder sweep: plant one outside any gesture, then trigger a
     normal render through a real command */
  await page.evaluate(() => {
    const stray = document.createElement('div');
    stray.id = 'pm-home-drop-placeholder';
    stray.className = 'pm-home-drop-placeholder';
    document.querySelector('[data-pm-home-host="home_main"]').appendChild(stray);
  });
  const strayPlanted = await page.evaluate(() => Boolean(document.getElementById('pm-home-drop-placeholder')));
  await openPanel(page, 3);
  const straySwept = await page.evaluate(() => !document.getElementById('pm-home-drop-placeholder'));
  return {
    pass: geometry.surface_count >= 3 && Math.abs(geometry.dead_space) <= 4 &&
      geometry.widths.every(width => width >= 80) &&
      validation === 'valid' && strayPlanted && straySwept,
    geometry,
    validation_status: validation,
    stray_planted: strayPlanted,
    stray_swept_by_render: straySwept
  };
});

/* 2026-08-13 tweak wave 2: chat's dock_right spans the full workspace height
   (grid areas "top top right" / "left main right" / "bottom bottom right");
   the top and bottom docks end left of the right column. */
await runInteraction('chat_full_height', async page => {
  const chatVisible = await page.evaluate(() => window.PM_HOME_WORKSPACE.layout.surfaces.find(surface => surface.surface_instance_id === 'chat').visible);
  if (!chatVisible) {
    await page.locator('.activity-bar .icon[title="Chat"]').click();
    await page.waitForTimeout(250);
  }
  await moveSurfaceTo(page, 'editor_panel_2', 'dock_top');
  const geometry = await page.evaluate(() => {
    const ws = document.getElementById('pm-home-workspace').getBoundingClientRect();
    const chat = document.querySelector('[data-pm-home-surface="chat"]').getBoundingClientRect();
    const right = document.querySelector('[data-pm-home-host="dock_right"]').getBoundingClientRect();
    const top = document.querySelector('[data-pm-home-host="dock_top"]').getBoundingClientRect();
    const bottom = document.querySelector('[data-pm-home-host="dock_bottom"]').getBoundingClientRect();
    return {
      ws: { top: ws.top, bottom: ws.bottom },
      chat: { top: chat.top, bottom: chat.bottom },
      top_dock_right_edge: top.right,
      bottom_dock_right_edge: bottom.right,
      right_col_left: right.left
    };
  });
  return {
    pass: geometry.chat.top <= geometry.ws.top + 12 && geometry.chat.bottom >= geometry.ws.bottom - 12 &&
      geometry.top_dock_right_edge <= geometry.right_col_left + 1 &&
      geometry.bottom_dock_right_edge <= geometry.right_col_left + 1,
    geometry
  };
});

/* 2026-08-13 tweak wave 2: panels opened from the top-bar menu render REAL
   code (the shipped rev could leave a panel empty), and clicking a file tab
   switches the rendered buffer. */
await runInteraction('panel34_open_renders_content', async page => {
  await openPanel(page, 3);
  await openPanel(page, 4);
  const panels = await page.evaluate(() => [3, 4].map(number => {
    const element = document.querySelector('[data-pm-home-surface="editor_panel_' + number + '"]');
    const code = element && element.querySelector('.editor-code');
    return {
      panel: number,
      code_children: code ? code.childElementCount : 0,
      tabs: element ? Array.from(element.querySelectorAll('.editor-tabs .tab[data-file]')).map(tab => tab.getAttribute('data-file')) : [],
      active_tab: element && element.querySelector('.editor-tabs .tab.active') ? element.querySelector('.editor-tabs .tab.active').getAttribute('data-file') : null
    };
  }));
  /* Tab switch on a multi-tab panel: rendered buffer must change. At quad
     width the corrected fitter canonically lays ONLY the active tab plus the
     +N chip, so widen pane 1 first (deterministic API setup) and wait for
     real laid tabs. */
  await page.evaluate(() => {
    const home = window.PM_HOME_WORKSPACE;
    home.setSurfaceVisible('editor_panel_2', false);
    home.setSurfaceVisible('editor_panel_3', false);
    home.setSurfaceVisible('editor_panel_4', false);
    home.setSurfaceVisible('dashboard', false);
  });
  await page.waitForFunction(() => {
    const pane = document.querySelector('#editorPane1');
    if (!pane) return false;
    const laid = Array.from(pane.querySelectorAll('.editor-tabs .tab[data-file]')).filter(tab => tab.style.display !== 'none' && tab.getBoundingClientRect().width > 0);
    return laid.length >= 2;
  }, null, { timeout: 10000 });
  const beforeSwitch = await page.evaluate(() => {
    const pane = document.querySelector('#editorPane1');
    const active = pane.querySelector('.editor-tabs .tab.active');
    return { file: active && active.getAttribute('data-file'), text: (pane.querySelector('.editor-code') || {}).textContent ? pane.querySelector('.editor-code').textContent.slice(0, 120) : '' };
  });
  await page.evaluate(() => {
    const pane = document.querySelector('#editorPane1');
    const target = Array.from(pane.querySelectorAll('.editor-tabs .tab[data-file]')).find(tab => !tab.classList.contains('active') && tab.getBoundingClientRect().width > 0);
    target.click();
  });
  await page.waitForTimeout(300);
  const afterSwitch = await page.evaluate(() => {
    const pane = document.querySelector('#editorPane1');
    const active = pane.querySelector('.editor-tabs .tab.active');
    return { file: active && active.getAttribute('data-file'), text: (pane.querySelector('.editor-code') || {}).textContent ? pane.querySelector('.editor-code').textContent.slice(0, 120) : '' };
  });
  return {
    pass: panels.every(item => item.code_children > 3) &&
      panels.find(item => item.panel === 4).active_tab === 'src/routes/auth.rs' &&
      afterSwitch.file !== beforeSwitch.file && afterSwitch.text !== beforeSwitch.text,
    panels,
    tab_switch: { before: beforeSwitch, after: afterSwitch }
  };
});

/* 2026-08-13 tweak wave 2: "New Section" is move-and-reseed -- the source
   section keeps a live workgroup instead of stranding an EMPTY strip -- and a
   layout reset recovers to exactly one live section that still renders. */
await runInteraction('terminal_new_section_recoverable', async page => {
  const before = await page.evaluate(() => Object.values(window.PM_HOME_WORKSPACE.terminal_workgroups).map(owner => owner.terminal_workgroup_id || null));
  await page.locator('[data-pm-home-action="move-workgroup-new-section"]:visible').first().click();
  await page.waitForTimeout(350);
  const noteState = () => page.evaluate(() => {
    const panel = document.getElementById('bottomPanel');
    const notes = Array.from(document.querySelectorAll('.pm-home-terminal-empty-state'));
    return {
      attr: panel ? panel.getAttribute('data-pm-term-empty') : null,
      note_visible: notes.some(el => getComputedStyle(el).display !== 'none' && el.getBoundingClientRect().height > 0)
    };
  });
  const after = await page.evaluate(() => ({
    workgroups: Object.values(window.PM_HOME_WORKSPACE.terminal_workgroups).map(owner => owner.terminal_workgroup_id || null),
    sections: window.PM_HOME_WORKSPACE.layout.surfaces.filter(surface => surface.surface_kind === 'terminal_section' && surface.visible).length
  }));
  const noteAfterNewSection = await noteState();
  await page.evaluate(() => window.PM_HOME_WORKSPACE.reset());
  await page.waitForTimeout(350);
  const recovered = await page.evaluate(() => ({
    workgroups: Object.values(window.PM_HOME_WORKSPACE.terminal_workgroups).map(owner => owner.terminal_workgroup_id || null),
    live: Object.values(window.PM_HOME_WORKSPACE.terminal_workgroups).filter(owner => owner.terminal_workgroup_id).length,
    host_rendering: Boolean(document.querySelector('#bottomTerminalHost .terminal-pane')),
    validation: window.PM_HOME_WORKSPACE.layout.validation.status
  }));
  const noteAfterReset = await noteState();
  return {
    pass: before.length === 1 && Boolean(before[0]) &&
      after.workgroups.length === 2 && after.workgroups.every(Boolean) && after.sections === 2 &&
      recovered.live === 1 && recovered.host_rendering && recovered.validation === 'valid' &&
      /* wave 3: the truth-gated empty note never shows while a workgroup is
         live -- neither with both sections live nor after the reset */
      !noteAfterNewSection.note_visible && !noteAfterReset.note_visible,
    before,
    after_new_section: after,
    empty_note_after_new_section: noteAfterNewSection,
    after_reset: recovered,
    empty_note_after_reset: noteAfterReset
  };
});

/* 2026-08-13 wave 3 follow-up: fitters fit against the CONTENT box with a
   44px reserve floor, so the overflow chip must never rest inside the kebab
   lane -- probed at the narrow (~260px) pane width the quad layout
   produces. */
await runInteraction('chip_clearance_narrow_pane', async page => {
  await ensureAllOpen(page);
  const panes = await page.evaluate(() => {
    return [1, 2, 3, 4].map(number => {
      const pane = document.querySelector('[data-pm-home-surface="editor_panel_' + number + '"]');
      if (!pane) return { pane: number, present: false };
      const chip = pane.querySelector('.pm-ed-overflow');
      const kebab = pane.querySelector('[data-pm-home-surface-options]');
      const chipRect = chip && chip.getBoundingClientRect().width > 0 ? chip.getBoundingClientRect() : null;
      const kebabRect = kebab ? kebab.getBoundingClientRect() : null;
      return {
        pane: number,
        present: true,
        width: Math.round(pane.getBoundingClientRect().width),
        chip_right: chipRect ? Math.round(chipRect.right) : null,
        kebab_left: kebabRect ? Math.round(kebabRect.left) : null,
        clearance: chipRect && kebabRect ? Math.round(kebabRect.left - chipRect.right) : null
      };
    });
  });
  const withChips = panes.filter(item => item.chip_right !== null && item.kebab_left !== null);
  return {
    pass: withChips.length >= 1 && withChips.every(item => item.chip_right + 4 <= item.kebab_left),
    panes
  };
});

/* 2026-08-13 wave 3 follow-up: restoreOwnerRefs reconstitutes a minimal pane
   (tp-repair-N) for ANY paneless live-workgroup ref -- a corrupted persisted
   layout must reload to a WORKING terminal, never the empty block. */
await runInteraction('terminal_repair_corrupt_paneless_ref', async page => {
  await page.evaluate(() => {
    const home = window.PM_HOME_WORKSPACE;
    const record = JSON.parse(localStorage.getItem(home.storage_key)) || home.layout;
    const terminal = record.surfaces.find(surface => surface.surface_kind === 'terminal_section');
    terminal.domain_ref.pane_ids = '';
    terminal.domain_ref.terminal_session_ids = '';
    localStorage.setItem(home.storage_key, JSON.stringify(record));
  });
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(() => Boolean(window.PM_HOME_WORKSPACE), null, { timeout: 120000 });
  await page.waitForTimeout(400);
  const repaired = await page.evaluate(() => {
    const home = window.PM_HOME_WORKSPACE;
    const owners = Object.values(home.terminal_workgroups);
    const notes = Array.from(document.querySelectorAll('.pm-home-terminal-empty-state'));
    return {
      owners: owners.map(owner => ({ workgroup: owner.terminal_workgroup_id, panes: owner.pane_ids })),
      live_with_panes: owners.filter(owner => owner.terminal_workgroup_id && owner.pane_ids.length >= 1).length,
      host_rendering: Boolean(document.querySelector('#bottomTerminalHost .terminal-pane')),
      note_visible: notes.some(el => getComputedStyle(el).display !== 'none' && el.getBoundingClientRect().height > 0),
      validation: home.layout.validation.status
    };
  });
  return {
    pass: repaired.live_with_panes >= 1 && repaired.host_rendering && !repaired.note_visible &&
      repaired.validation === 'valid',
    repaired
  };
});

await runInteraction('terminal_four_section_four_pane_caps_and_identity', async page => {
  const initial = await state(page);
  await clickTerminalAction(page, 'split-terminal-pane');
  await clickTerminalAction(page, 'split-terminal-pane');
  const atPaneCap = await state(page);
  const visiblePaneButton = page.locator('[data-pm-home-action="split-terminal-pane"]:visible').first();
  const paneDisabled = await visiblePaneButton.isDisabled();
  const paneReason = await visiblePaneButton.getAttribute('data-disabled-reason');
  const beforeFifthPane = await state(page);
  await visiblePaneButton.click({ force: true }).catch(() => {});
  const afterFifthPane = await state(page);
  for (let index = 0; index < 3; index += 1) await clickTerminalAction(page, 'move-workgroup-new-section');
  const atSectionCap = await state(page);
  const sectionButton = page.locator('[data-pm-home-surface="' + atSectionCap.active_terminal_section_id + '"] [data-pm-home-action="move-workgroup-new-section"]').first();
  const sectionDisabled = await sectionButton.isDisabled();
  const sectionReason = await sectionButton.getAttribute('data-disabled-reason');
  const beforeFifthSection = await state(page);
  await sectionButton.click({ force: true }).catch(() => {});
  const afterFifthSection = await state(page);
  const sections = atSectionCap.layout.surfaces.filter(surface => surface.surface_kind === 'terminal_section');
  const owners = Object.values(atSectionCap.terminal_workgroups);
  const nonempty = owners.filter(owner => owner.terminal_workgroup_id);
  return {
    pass: initial.identities.terminals[0].pane_ids.length === 2 &&
      atPaneCap.identities.terminals.reduce((sum, owner) => sum + owner.pane_ids.length, 0) === 4 &&
      paneDisabled && paneReason === 'Maximum four visible terminal panes' &&
      same(beforeFifthPane.layout, afterFifthPane.layout) && beforeFifthPane.metrics.commandCount === afterFifthPane.metrics.commandCount &&
      /* tweak wave 2: New Section is move-and-RESEED, but the reseed is pane
         -budget gated ("At the pane cap the source stays empty") -- this case
         runs at the 4-pane cap, so every vacated source legitimately stays
         empty and exactly one live workgroup remains. The budget-allowing
         path is covered by terminal_new_section_recoverable. */
      sections.length === 4 && nonempty.length === 1 &&
      sectionDisabled && sectionReason === 'Maximum four terminal sections' &&
      same(beforeFifthSection.layout, afterFifthSection.layout) && beforeFifthSection.metrics.commandCount === afterFifthSection.metrics.commandCount &&
      atSectionCap.identity_integrity.ok,
    initial_identities: initial.identities.terminals,
    pane_count: atPaneCap.identities.terminals.reduce((sum, owner) => sum + owner.pane_ids.length, 0),
    pane_disabled: paneDisabled,
    pane_reason: paneReason,
    terminal_sections: sections.map(surface => ({ id: surface.surface_instance_id, slot: surface.slot_index, host: surface.host })),
    nonempty_workgroups: nonempty,
    section_disabled: sectionDisabled,
    section_reason: sectionReason,
    identity_integrity: atSectionCap.identity_integrity
  };
}, { recordVideo: true });

await runInteraction('transactional_persistence_failure_exact_rollback', async page => {
  const before = await state(page);
  const beforeStored = await page.evaluate(key => localStorage.getItem(key), before.storage_key);
  await page.evaluate(() => window.PM_HOME_WORKSPACE.failNextPersistenceWrite());
  await moveSurfaceTo(page, 'dashboard', 'dock_left');
  const after = await state(page);
  const afterStored = await page.evaluate(key => localStorage.getItem(key), after.storage_key);
  const latestReceipt = after.receipts.at(-1);
  return {
    pass: same(before.layout, after.layout) &&
      beforeStored === afterStored &&
      after.metrics.commandCount === before.metrics.commandCount + 1 &&
      after.metrics.persistCount === before.metrics.persistCount &&
      after.metrics.failedPersistenceCount === before.metrics.failedPersistenceCount + 1 &&
      after.events.length === before.events.length &&
      latestReceipt && latestReceipt.outcome === 'failed' && latestReceipt.details.rolled_back === true &&
      await page.locator('#pm-home-recovery-toast').isVisible(),
    before_revision: before.layout.layout_revision,
    after_revision: after.layout.layout_revision,
    durable_record_exact_rollback: beforeStored === afterStored,
    before_metrics: before.metrics,
    after_metrics: after.metrics,
    receipt: latestReceipt,
    event_delta: after.events.length - before.events.length
  };
}, { recordVideo: true });

async function recoveryProbe(name, mutation) {
  await runInteraction(name, async page => {
    const key = await page.evaluate(() => window.PM_HOME_WORKSPACE.storage_key);
    const before = await state(page);
    await page.evaluate(({ storageKey, kind }) => {
      if (kind === 'corrupt') {
        localStorage.setItem(storageKey, '{not-json');
        return;
      }
      const value = window.PM_HOME_WORKSPACE.layout;
      if (kind === 'duplicate') value.surfaces.push(JSON.parse(JSON.stringify(value.surfaces[0])));
      if (kind === 'future') value.schema_version = '99.0.0';
      if (kind === 'offscreen') {
        const surface = value.surfaces.find(candidate => candidate.surface_instance_id === 'editor_panel_1');
        surface.host = 'floating';
        surface.floating_bounds = { x: -900, y: -700, width: 420, height: 300 };
      }
      localStorage.setItem(storageKey, JSON.stringify(value));
    }, { storageKey: key, kind: mutation });
    await page.reload({ waitUntil: 'load' });
    await page.waitForFunction(() => Boolean(window.PM_HOME_WORKSPACE), null, { timeout: 120000 });
    await page.waitForTimeout(100);
    const recovered = await state(page);
    const toastVisible = await page.locator('#pm-home-recovery-toast').isVisible();
    const quarantineKeys = await page.evaluate(() => Object.keys(localStorage).filter(keyName => keyName.indexOf('pm.homeWorkspaceLayout:quarantine:v1:') === 0));
    const persisted = await page.evaluate(storageKey => JSON.parse(localStorage.getItem(storageKey)), key);
    await page.reload({ waitUntil: 'load' });
    await page.waitForFunction(() => Boolean(window.PM_HOME_WORKSPACE), null, { timeout: 120000 });
    const clean = await state(page);
    return {
      pass: recovered.layout.schema_id === 'pm.home_workspace_layout.v1' &&
        recovered.layout.schema_version === '1.0.0' &&
        recovered.layout.validation.last_validation_errors.length > 0 &&
        toastVisible && quarantineKeys.length >= 1 &&
        persisted.schema_id === 'pm.home_workspace_layout.v1' &&
        clean.layout.validation.status === 'valid' &&
        clean.layout.validation.last_validation_errors.length === 0,
      initial_revision: before.layout.layout_revision,
      recovered_validation: recovered.layout.validation,
      recovered_migration: recovered.layout.migration,
      recovery_reason: recovered.metrics.lastRecoveryReason,
      toast_visible: toastVisible,
      quarantine_keys: quarantineKeys,
      persisted_schema: { schema_id: persisted.schema_id, schema_version: persisted.schema_version },
      second_reload_validation: clean.layout.validation
    };
  });
}

await recoveryProbe('corrupt_record_quarantine_recovery_second_reload_clean', 'corrupt');
await recoveryProbe('duplicate_record_quarantine_recovery_second_reload_clean', 'duplicate');
await recoveryProbe('future_record_quarantine_recovery_second_reload_clean', 'future');
await recoveryProbe('offscreen_record_quarantine_recovery_second_reload_clean', 'offscreen');

await runInteraction('legacy_storage_key_copy_forward_migration', async page => {
  const current = await state(page);
  const legacy = current.layout;
  legacy.schema_version = '0.9.0';
  await page.evaluate(value => {
    localStorage.clear();
    localStorage.setItem('home_workspace_layout.v1:tastebook:home', JSON.stringify(value));
  }, legacy);
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(() => Boolean(window.PM_HOME_WORKSPACE), null, { timeout: 120000 });
  const migrated = await state(page);
  const storage = await page.evaluate(() => ({
    canonical: localStorage.getItem('pm.homeWorkspaceLayout:v1:tastebook:home'),
    legacy: localStorage.getItem('home_workspace_layout.v1:tastebook:home')
  }));
  return {
    pass: migrated.layout.migration.disposition === 'copy_forward' &&
      migrated.layout.migration.from_schema_version === '0.9.0' &&
      Boolean(storage.canonical) && storage.legacy === null,
    migration: migrated.layout.migration,
    canonical_written: Boolean(storage.canonical),
    legacy_removed: storage.legacy === null
  };
});

/* 2026-08-13 tweak wave 2: the top-bar menu row TOGGLES -- after a collapse it
   relabels at runtime to "Expand Bottom Terminal" and stays enabled; it is
   disabled only when no terminal is docked at the bottom. The terminal's own
   chevron toggles too. */
await runInteraction('collapse_bottom_terminal_menu_one_way_and_chevron_toggle', async page => {
  const panelHeight = () => page.evaluate(() => {
    const el = document.getElementById('bottomPanel');
    return el ? Math.round(el.getBoundingClientRect().height) : null;
  });
  const heightOpen = await panelHeight();
  const collapse = page.locator('#pm-home-more-menu [data-pm-home-action="collapse-terminal"]');
  /* wave 3: the terminal empty-state note is truth-gated via
     #bottomPanel[data-pm-term-empty]; with a live workgroup it must NEVER
     show, including through collapse/expand cycles */
  const emptyNote = () => page.evaluate(() => {
    const panel = document.getElementById('bottomPanel');
    const notes = Array.from(document.querySelectorAll('.pm-home-terminal-empty-state'));
    return {
      attr: panel ? panel.getAttribute('data-pm-term-empty') : null,
      note_visible: notes.some(el => getComputedStyle(el).display !== 'none' && el.getBoundingClientRect().height > 0)
    };
  });

  /* menu collapse */
  await page.locator('#pm-home-more-btn').click();
  await page.waitForTimeout(300);
  const labelBefore = (await collapse.textContent()).trim();
  const before = await state(page);
  await collapse.click();
  await page.waitForTimeout(160);
  const after = await state(page);
  const heightCollapsed = await panelHeight();

  /* menu row now reads Expand and stays ENABLED */
  await page.locator('#pm-home-more-btn').click();
  await page.waitForTimeout(300);
  const labelCollapsed = (await collapse.textContent()).trim();
  const disabledCollapsed = await collapse.isDisabled();
  const beforeMenuExpand = await state(page);
  await collapse.click();
  await page.waitForTimeout(160);
  const afterMenuExpand = await state(page);
  const heightMenuExpanded = await panelHeight();
  const noteAfterMenuExpand = await emptyNote();
  await page.locator('#pm-home-more-btn').click();
  await page.waitForTimeout(300);
  const labelReset = (await collapse.textContent()).trim();
  await page.keyboard.press('Escape');
  await page.waitForTimeout(120);

  /* the terminal's own chevron toggles both ways: inline SVG, POST-commit
     aria state, visible on the collapsed strip */
  const chevron = page.locator('#collapseBottom, [data-pm-home-collapse-toggle]').first();
  const isInlineSvg = await chevron.evaluate(el => Boolean(el.querySelector('svg')) && !/[\u2190-\u2BFF]/.test(el.textContent || ''));
  const beforeChevron = await state(page);
  await chevron.click();
  await page.waitForTimeout(180);
  const afterChevronCollapse = await state(page);
  const heightChevronCollapsed = await panelHeight();
  const chevronVisibleWhileCollapsed = await chevron.isVisible();
  const ariaCollapsed = await chevron.getAttribute('aria-expanded');
  await chevron.click();
  await page.waitForTimeout(180);
  const afterChevronExpand = await state(page);
  const heightChevronExpanded = await panelHeight();
  const ariaExpanded = await chevron.getAttribute('aria-expanded');
  const noteAfterChevronExpand = await emptyNote();

  /* disabled ONLY when no bottom terminal: move the terminal out and check */
  await moveSurfaceTo(page, 'terminal_section:terminal_section_1', 'dock_left');
  await page.locator('#pm-home-more-btn').click();
  await page.waitForTimeout(300);
  const disabledNoTerminal = await collapse.isDisabled();
  const reasonNoTerminal = await collapse.getAttribute('data-disabled-reason');
  await page.keyboard.press('Escape');

  const collapsedOf = snapshot => snapshot.layout.surfaces.find(surface => surface.surface_kind === 'terminal_section').collapsed;
  return {
    pass: labelBefore === 'Collapse Bottom Terminal' &&
      after.metrics.commandCount === before.metrics.commandCount + 1 &&
      after.metrics.persistCount === before.metrics.persistCount + 1 &&
      collapsedOf(after) === true &&
      heightCollapsed !== null && heightOpen !== null && heightCollapsed < heightOpen - 40 &&
      labelCollapsed === 'Expand Bottom Terminal' && !disabledCollapsed &&
      afterMenuExpand.metrics.commandCount === beforeMenuExpand.metrics.commandCount + 1 &&
      collapsedOf(afterMenuExpand) === false && heightMenuExpanded > heightCollapsed + 40 &&
      labelReset === 'Collapse Bottom Terminal' &&
      isInlineSvg &&
      afterChevronCollapse.metrics.commandCount === beforeChevron.metrics.commandCount + 1 &&
      collapsedOf(afterChevronCollapse) === true && heightChevronCollapsed < heightMenuExpanded - 40 &&
      chevronVisibleWhileCollapsed && ariaCollapsed === 'false' &&
      collapsedOf(afterChevronExpand) === false && ariaExpanded === 'true' &&
      heightChevronExpanded > heightChevronCollapsed + 40 &&
      !noteAfterMenuExpand.note_visible && !noteAfterChevronExpand.note_visible &&
      disabledNoTerminal && reasonNoTerminal === 'No terminal is docked at the bottom',
    label_before: labelBefore,
    empty_note_after_menu_expand: noteAfterMenuExpand,
    empty_note_after_chevron_expand: noteAfterChevronExpand,
    label_collapsed: labelCollapsed,
    label_after_expand: labelReset,
    menu_enabled_while_collapsed: !disabledCollapsed,
    heights: { open: heightOpen, collapsed: heightCollapsed, menu_expanded: heightMenuExpanded, chevron_collapsed: heightChevronCollapsed, chevron_expanded: heightChevronExpanded },
    chevron_visible_while_collapsed: chevronVisibleWhileCollapsed,
    chevron_is_inline_svg: isInlineSvg,
    aria_collapsed: ariaCollapsed,
    aria_expanded: ariaExpanded,
    disabled_when_no_bottom_terminal: disabledNoTerminal,
    no_terminal_reason: reasonNoTerminal
  };
});

await runInteraction('popup_blocked_honest_in_canvas_fallback', async page => {
  await page.evaluate(() => {
    window.PM_HOME_ENABLE_OPTIONAL_POPUPS = true;
    window.open = () => null;
  });
  await surfaceAction(page, 'editor_panel_1', 'popout-panel');
  const current = await state(page);
  const disposition = await page.locator('#pm-home-workspace').getAttribute('data-pm-home-popup-disposition');
  const surface = current.layout.surfaces.find(item => item.surface_instance_id === 'editor_panel_1');
  return {
    pass: surface.host === 'floating' &&
      (disposition === 'popup_blocked_in_canvas_fallback' || disposition === 'in_canvas_float') &&
      !current.commands.some(command => String(command.command_id).indexOf('cmd.widget.') === 0),
    disposition,
    surface,
    command: current.commands.at(-1)
  };
}, { recordVideo: true });

await runInteraction('settings_reset_visible_location_and_identity_preservation', async page => {
  await moveSurfaceTo(page, 'dashboard', 'dock_left');
  const beforeReset = await state(page);
  await page.locator('#tab-settings').click();
  await page.waitForTimeout(180);
  await page.locator('#s4-chips .s4-chip').filter({ hasText: 'General & Appearance' }).click();
  await page.waitForTimeout(500);
  const row = page.locator('.s4-row[data-sid="general.startup.reset-home-layout"]');
  const label = (await row.locator('.s4-label, .s4-name, [class*="label"]').first().textContent().catch(() => row.textContent())).trim();
  await row.locator('.s4-action').click();
  await page.waitForTimeout(100);
  const after = await state(page);
  return {
    pass: await row.count() === 1 && label.indexOf('Reset Home Layout') !== -1 &&
      after.layout.surfaces.find(surface => surface.surface_instance_id === 'dashboard').host === 'home_main' &&
      same(beforeReset.identities.editors, after.identities.editors) &&
      beforeReset.identities.browser.browser_session_id === after.identities.browser.browser_session_id,
    row_label: label,
    before_dashboard: beforeReset.layout.surfaces.find(surface => surface.surface_instance_id === 'dashboard'),
    after_dashboard: after.layout.surfaces.find(surface => surface.surface_instance_id === 'dashboard'),
    identity_integrity: after.identity_integrity
  };
});

await runInteraction('theme_auto_reduced_motion_and_four_edge_dissolve', async page => {
  const themes = ['friendly-dark', 'friendly-light', 'retro-dark', 'retro-light', 'basic-dark', 'basic-light', 'glass-dark', 'glass-light'];
  const themeResults = [];
  for (const theme of themes) {
    const entry = await page.evaluate(nextTheme => {
      document.documentElement.setAttribute('data-theme', nextTheme);
      return {
        theme: document.documentElement.getAttribute('data-theme'),
        background: getComputedStyle(document.documentElement).getPropertyValue('--bg-primary').trim() || getComputedStyle(document.body).backgroundColor,
        text: getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim()
      };
    }, theme);
    themeResults.push(entry);
  }
  await page.emulateMedia({ reducedMotion: 'no-preference', colorScheme: 'dark' });
  await page.locator('#themeSelect').click();
  await page.locator('#themeMenu [data-mode-value="auto"]').click();
  await page.waitForTimeout(80);
  const autoDark = await page.evaluate(() => ({
    mode: window.PM_THEME.getMode(),
    theme: document.documentElement.getAttribute('data-theme'),
    stored_mode: localStorage.getItem('pm.themeMode'),
    stored_family: localStorage.getItem('pm.themeFamily'),
    stored_slug: localStorage.getItem('pm.theme')
  }));
  await page.emulateMedia({ reducedMotion: 'no-preference', colorScheme: 'light' });
  /* the auto-mode flip reliably lands but takes 100-400ms after this case's
     manual data-theme writes -- poll for it instead of racing a fixed wait */
  await page.waitForFunction(() => (document.documentElement.getAttribute('data-theme') || '').endsWith('-light'), null, { timeout: 5000 }).catch(() => {});
  const autoLight = await page.evaluate(() => ({
    mode: window.PM_THEME.getMode(),
    theme: document.documentElement.getAttribute('data-theme')
  }));
  await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'light' });
  const motion = await page.evaluate(() => {
    document.documentElement.setAttribute('data-motion', 'reduced');
    const portal = document.getElementById('pm-home-more-menu');
    return {
      media: matchMedia('(prefers-reduced-motion: reduce)').matches,
      duration: getComputedStyle(portal).transitionDuration,
      color_scheme_light: matchMedia('(prefers-color-scheme: light)').matches
    };
  });
  const edge = await page.evaluate(() => ({
    enrolled: document.querySelectorAll('[data-pm-scroll-dissolve="four-edge"].pm6-bottom-scroll').length,
    total: document.querySelectorAll('[data-pm-scroll-dissolve="four-edge"]').length,
    controller: Boolean(window.PM_EDGE && typeof window.PM_EDGE.enroll === 'function')
  }));
  return {
    pass: themeResults.every(item => item.theme && item.background && item.text) &&
      new Set(themeResults.map(item => item.background + '|' + item.text)).size === 8 &&
      autoDark.mode === 'auto' && autoDark.theme.endsWith('-dark') && autoDark.stored_mode === 'auto' &&
      Boolean(autoDark.stored_family) && autoDark.stored_slug === autoDark.theme &&
      autoLight.mode === 'auto' && autoLight.theme.endsWith('-light') &&
      motion.media && (motion.duration === '0s' || motion.duration === '0ms') &&
      motion.color_scheme_light && edge.controller && edge.enrolled === edge.total && edge.total >= 5,
    themes: themeResults,
    theme_auto_dark: autoDark,
    theme_auto_light: autoLight,
    reduced_motion: motion,
    four_edge_dissolve: edge
  };
});

const viewports = [
  { id: '1024x768', width: 1024, height: 768 },
  { id: '1280x800', width: 1280, height: 800 },
  { id: '1600x900', width: 1600, height: 900 },
  { id: '2200x1200', width: 2200, height: 1200 }
];
const themes = ['friendly-dark', 'friendly-light', 'retro-dark', 'retro-light', 'basic-dark', 'basic-light', 'glass-dark', 'glass-light'];

async function captureCase(id, theme, layoutName, viewport, reducedMotion) {
  const caseState = await newCase('capture-' + id, {
    viewport: { width: viewport.width, height: viewport.height },
    theme,
    reducedMotion,
    colorScheme: theme.endsWith('-light') ? 'light' : 'dark'
  });
  let matrixRow;
  try {
    await configureLayout(caseState.page, layoutName);
    await caseState.page.evaluate(({ nextTheme, reduced }) => {
      document.documentElement.setAttribute('data-theme', nextTheme);
      if (reduced) document.documentElement.setAttribute('data-motion', 'reduced');
      else document.documentElement.removeAttribute('data-motion');
    }, { nextTheme: theme, reduced: reducedMotion });
    await caseState.page.waitForTimeout(90);
    const screenshotPath = join(screenshotsDir, safeName(id) + '.png');
    await caseState.page.screenshot({ path: screenshotPath, fullPage: false, animations: 'disabled' });
    const current = await state(caseState.page);
    const visual = await caseState.page.evaluate(() => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const surfaces = Array.from(document.querySelectorAll('[data-pm-home-surface][data-pm-home-visible="true"]')).map(element => {
        const rect = element.getBoundingClientRect();
        const hostElement = element.closest('[data-pm-home-host]');
        const hostRect = hostElement ? hostElement.getBoundingClientRect() : { left: 0, top: 0, right: viewportWidth, bottom: viewportHeight };
        const visibleLeft = Math.max(0, rect.left, hostRect.left);
        const visibleTop = Math.max(0, rect.top, hostRect.top);
        const visibleRight = Math.min(viewportWidth, rect.right, hostRect.right);
        const visibleBottom = Math.min(viewportHeight, rect.bottom, hostRect.bottom);
        return {
          id: element.getAttribute('data-pm-home-surface'),
          host: element.getAttribute('data-pm-home-current-host'),
          rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height, right: rect.right, bottom: rect.bottom },
          visible_rect: { x: visibleLeft, y: visibleTop, width: Math.max(0, visibleRight - visibleLeft), height: Math.max(0, visibleBottom - visibleTop), right: visibleRight, bottom: visibleBottom },
          scroll_reachable: Boolean(hostElement && (hostElement.scrollWidth > hostElement.clientWidth + 1 || hostElement.scrollHeight > hostElement.clientHeight + 1))
        };
      });
      const floating = surfaces.filter(surface => surface.host === 'floating');
      const overlapPairs = [];
      const crossHostOverlapPairs = [];
      for (let a = 0; a < floating.length; a += 1) {
        for (let b = a + 1; b < floating.length; b += 1) {
          const left = Math.max(floating[a].rect.x, floating[b].rect.x);
          const top = Math.max(floating[a].rect.y, floating[b].rect.y);
          const right = Math.min(floating[a].rect.right, floating[b].rect.right);
          const bottom = Math.min(floating[a].rect.bottom, floating[b].rect.bottom);
          const area = Math.max(0, right - left) * Math.max(0, bottom - top);
          if (area > 100) overlapPairs.push({ a: floating[a].id, b: floating[b].id, area });
        }
      }
      for (let a = 0; a < surfaces.length; a += 1) {
        for (let b = a + 1; b < surfaces.length; b += 1) {
          if (!surfaces[a].host || !surfaces[b].host || surfaces[a].host === surfaces[b].host || surfaces[a].host === 'floating' || surfaces[b].host === 'floating') continue;
          const left = Math.max(surfaces[a].visible_rect.x, surfaces[b].visible_rect.x);
          const top = Math.max(surfaces[a].visible_rect.y, surfaces[b].visible_rect.y);
          const right = Math.min(surfaces[a].visible_rect.right, surfaces[b].visible_rect.right);
          const bottom = Math.min(surfaces[a].visible_rect.bottom, surfaces[b].visible_rect.bottom);
          const area = Math.max(0, right - left) * Math.max(0, bottom - top);
          if (area > 100) crossHostOverlapPairs.push({ a: surfaces[a].id, b: surfaces[b].id, area });
        }
      }
      const invalid = surfaces.filter(surface => surface.rect.width < 40 || surface.rect.height < 30 || !Number.isFinite(surface.rect.x) || !Number.isFinite(surface.rect.y));
      return {
        viewport: { width: viewportWidth, height: viewportHeight },
        surfaces,
        floating_overlap_pairs: overlapPairs,
        cross_host_overlap_pairs: crossHostOverlapPairs,
        invalid_rectangles: invalid,
        body_cursor: getComputedStyle(document.body).cursor,
        active_element: document.activeElement && (document.activeElement.id || document.activeElement.getAttribute('aria-label') || document.activeElement.tagName)
      };
    });
    matrixRow = {
      id,
      theme,
      layout: layoutName,
      viewport,
      reduced_motion: Boolean(reducedMotion),
      screenshot: screenshotPath,
      layout_revision: current.layout.layout_revision,
      visible_surface_count: current.layout.surfaces.filter(surface => surface.visible).length,
      identity_integrity: current.identity_integrity,
      visual,
      runtime_errors: caseState.errors.slice()
    };
  } catch (error) {
    matrixRow = {
      id,
      theme,
      layout: layoutName,
      viewport,
      reduced_motion: Boolean(reducedMotion),
      error: String(error && error.stack || error),
      runtime_errors: caseState.errors.slice()
    };
  }
  result.matrix.push(matrixRow);
  await closeCase(caseState, id);
}

/* 32: all eight themes at all four viewports, all surfaces open. */
for (const theme of themes) {
  for (const viewport of viewports) {
    await captureCase('all-open-' + theme + '-' + viewport.id, theme, 'all-open', viewport, false);
  }
}

/* 32: two anchor themes x four additional layouts x four viewports. */
for (const theme of ['friendly-dark', 'glass-light']) {
  for (const layoutName of ['default', 'edge-docked', 'floating', 'terminal-max']) {
    for (const viewport of viewports) {
      await captureCase(theme + '-' + layoutName + '-' + viewport.id, theme, layoutName, viewport, false);
    }
  }
}

/* 8: both anchor themes x reduced motion x all four viewports. */
for (const theme of ['friendly-dark', 'glass-light']) {
  for (const viewport of viewports) {
    await captureCase('reduced-' + theme + '-' + viewport.id, theme, 'all-open', viewport, true);
  }
}

const matrixFailures = result.matrix.filter(row =>
  row.error || row.runtime_errors.length ||
  !row.identity_integrity || !row.identity_integrity.ok ||
  row.visual.invalid_rectangles.length ||
  row.visual.floating_overlap_pairs.length ||
  row.visual.cross_host_overlap_pairs.length
);
recordCheck('visual_matrix_exact_72_cases', result.matrix.length === 72, { actual: result.matrix.length, expected: 72 });
recordCheck('visual_matrix_no_runtime_or_geometry_failures', matrixFailures.length === 0, {
  failure_count: matrixFailures.length,
  failures: matrixFailures.map(row => ({
    id: row.id,
    error: row.error || null,
    runtime_errors: row.runtime_errors,
    invalid_rectangles: row.visual && row.visual.invalid_rectangles,
    floating_overlap_pairs: row.visual && row.visual.floating_overlap_pairs,
    cross_host_overlap_pairs: row.visual && row.visual.cross_host_overlap_pairs,
    identity_integrity: row.identity_integrity
  }))
});
recordCheck('no_home_widget_commands', Object.values(result.checks).every(check => {
  const encoded = JSON.stringify(check.evidence || {});
  return encoded.indexOf('cmd.widget.') === -1;
}), { prohibited_prefix: 'cmd.widget.' });

result.summary = {
  check_count: Object.keys(result.checks).length,
  passed_checks: Object.values(result.checks).filter(check => check.pass).length,
  failed_checks: Object.entries(result.checks).filter(([, check]) => !check.pass).map(([name]) => name),
  matrix_count: result.matrix.length,
  matrix_failures: matrixFailures.length,
  runtime_error_case_count: result.runtime_errors.length,
  status: Object.values(result.checks).every(check => check.pass) && result.runtime_errors.length === 0 ? 'PASS' : 'FAIL'
};

writeFileSync(join(args.outdir, 'home_workspace_matrix.json'), JSON.stringify(result, null, 2) + '\n');
await browser.close();
if (result.summary.status !== 'PASS') process.exitCode = 1;
