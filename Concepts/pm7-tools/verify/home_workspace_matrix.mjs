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

const browser = await chromium.launch({ headless: true });

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
  await page.goto(url + '?pm-home-case=' + encodeURIComponent(name), { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() => Boolean(window.PM_HOME_WORKSPACE), null, { timeout: 30000 });
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
    await surfaceAction(page, 'dashboard', 'move-surface', 'dock_left');
    await surfaceAction(page, 'editor_panel_2', 'move-surface', 'dock_right');
    await surfaceAction(page, 'terminal_section:terminal_section_1', 'move-surface', 'dock_top');
    return;
  }
  if (layoutName === 'floating') {
    await ensureAllOpen(page);
    await surfaceAction(page, 'editor_panel_1', 'move-surface', 'floating');
    await surfaceAction(page, 'dashboard', 'move-surface', 'floating');
    await surfaceAction(page, 'chat', 'move-surface', 'floating');
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

async function pointerGesture(page, selector, target, finish = 'up') {
  const box = await page.locator(selector).first().boundingBox();
  if (!box) throw new Error('missing pointer target ' + selector);
  const start = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
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

async function pointerGestureToDropTarget(page, selector, host) {
  const box = await page.locator(selector).first().boundingBox();
  if (!box) throw new Error('missing pointer target ' + selector);
  const start = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(start.x + 2, start.y + 2);
  const drop = page.locator('[data-pm-home-drop-host="' + host + '"]');
  await drop.waitFor({ state: 'visible' });
  const dropBox = await drop.boundingBox();
  await page.mouse.move(dropBox.x + dropBox.width / 2, dropBox.y + dropBox.height / 2, { steps: 10 });
  await page.mouse.up();
  await page.waitForTimeout(130);
}

async function runInteraction(name, body, options = {}) {
  const caseState = await newCase('interaction-' + name, Object.assign({ recordVideo: Boolean(options.recordVideo) }, options));
  let pass = false;
  let evidence = null;
  let tracePath = null;
  if (options.recordVideo) {
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
  const forbidden = await menu.getByText(/Reset|File Manager|Move|Dock|Pop Out|Close|Revision|Recovery|Count/i).count();
  const attrs = await trigger.evaluate(element => ({
    aria_label: element.getAttribute('aria-label'),
    aria_haspopup: element.getAttribute('aria-haspopup'),
    aria_controls: element.getAttribute('aria-controls')
  }));
  const triggerRight = triggerBox.x + triggerBox.width;
  return {
    pass: Math.round(triggerBox.width) === 28 && Math.round(triggerBox.height) === 28 &&
      triggerRight <= themeBox.x + 1 && themeBox.x - triggerRight <= 12.1 &&
      menuBox.width <= 300 && menuBox.height <= 180 &&
      same(rows.map(row => row.trim()), ['Open Panel', 'Open Browser in Panel', 'Collapse Bottom Terminal']) &&
      separators === 1 && forbidden === 0 &&
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
    targets.push({
      panel,
      submenu_count: count,
      command_delta: after.metrics.commandCount - before.metrics.commandCount,
      command_id: after.commands.at(-1) && after.commands.at(-1).command_id,
      opened
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
      item.opened.target_editor_group_id === 'editor_group_' + item.panel) && ownerStateExcluded,
    path,
    targets,
    home_record_excludes_editor_owner_state: ownerStateExcluded
  };
});

await runInteraction('surface_move_dock_float_inventory_and_commands', async page => {
  await ensureAllOpen(page);
  const ids = ['editor_panel_1', 'editor_panel_2', 'editor_panel_3', 'editor_panel_4', 'dashboard', 'chat', 'terminal_section:terminal_section_1'];
  const inventory = [];
  for (const id of ids) {
    const options = page.locator('[data-pm-home-surface-options="' + id + '"]');
    await options.scrollIntoViewIfNeeded();
    await options.click();
    await page.waitForTimeout(360);
    const rows = await page.locator('#pm-home-surface-menu [data-pm-home-action="move-surface"]').allTextContents();
    inventory.push({ id, rows: rows.map(value => value.trim()) });
    await page.keyboard.press('Escape');
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
    await surfaceAction(page, id, 'move-surface', host);
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
  const expectedRows = ['Main', 'Dock Left', 'Dock Right', 'Dock Top', 'Dock Bottom', 'Float'];
  return {
    pass: inventory.every(item => same(item.rows, expectedRows)) &&
      routes.every(item => item.actual === item.host && item.command_delta === 1 && item.persist_delta === 1) &&
      (await state(page)).identity_integrity.ok,
    inventory,
    routes
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
  const cancellations = [];
  for (const kind of ['escape', 'pointercancel', 'lostcapture', 'blur']) {
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
  const classesClear = await page.evaluate(() => !document.body.classList.contains('pm-home-dragging') && !document.body.classList.contains('pm-resizing'));
  return {
    pass: moveProof.host === 'dock_left' && moveProof.command_delta === 1 && moveProof.persist_delta === 1 && moveProof.preview_delta > 0 &&
      unchangedDrop.exact_layout && unchangedDrop.command_delta === 0 && unchangedDrop.persist_delta === 0 &&
      invalidTarget.exact_layout && invalidTarget.command_delta === 0 && invalidTarget.persist_delta === 0 &&
      cancellations.every(item => item.exact_layout && item.command_delta === 0 && item.persist_delta === 0 && item.cancel_delta === 1) &&
      classesClear,
    move: moveProof,
    unchanged_drop: unchangedDrop,
    invalid_target: invalidTarget,
    cancellations,
    gesture_classes_clear: classesClear
  };
}, { recordVideo: true });

await runInteraction('shared_resizers_one_commit_changed_only_and_cancel', async page => {
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
    const target = item.orientation === 'horizontal'
      ? { x: box.x + box.width / 2, y: Math.max(20, box.y - 24) }
      : { x: Math.max(20, box.x - 24), y: box.y + box.height / 2 };
    await pointerGesture(page, selector, target, 'up');
    const after = await state(page);
    checks.push({
      surface_id: item.surface_id,
      orientation: item.orientation,
      command_delta: after.metrics.commandCount - before.metrics.commandCount,
      persist_delta: after.metrics.persistCount - before.metrics.persistCount,
      last_command: after.commands.at(-1) && after.commands.at(-1).command_id
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
  const glowCleanup = await page.evaluate(() => !document.body.classList.contains('pm-resizing') && document.querySelectorAll('.resizer-glow, .is-glowing').length === 0);
  return {
    pass: selectors.length >= 4 &&
      checks.every(item => item.command_delta === 1 && item.persist_delta === 1 && item.last_command === 'cmd.workspace_layout.resize_surface') &&
      cancellation && cancellation.exact_layout && cancellation.command_delta === 0 && cancellation.persist_delta === 0 && glowCleanup,
    enrolled: selectors,
    changed_resize_checks: checks,
    cancellation,
    glow_cleanup: glowCleanup
  };
}, { recordVideo: true });

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
  await surfaceAction(page, 'dashboard', 'move-surface', 'dock_left');
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
    await page.waitForFunction(() => Boolean(window.PM_HOME_WORKSPACE), null, { timeout: 30000 });
    await page.waitForTimeout(100);
    const recovered = await state(page);
    const toastVisible = await page.locator('#pm-home-recovery-toast').isVisible();
    const quarantineKeys = await page.evaluate(() => Object.keys(localStorage).filter(keyName => keyName.indexOf('pm.homeWorkspaceLayout:quarantine:v1:') === 0));
    const persisted = await page.evaluate(storageKey => JSON.parse(localStorage.getItem(storageKey)), key);
    await page.reload({ waitUntil: 'load' });
    await page.waitForFunction(() => Boolean(window.PM_HOME_WORKSPACE), null, { timeout: 30000 });
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
  await page.waitForFunction(() => Boolean(window.PM_HOME_WORKSPACE), null, { timeout: 30000 });
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

await runInteraction('collapse_bottom_terminal_disabled_reason_and_no_expand_alias', async page => {
  await page.locator('#pm-home-more-btn').click();
  const collapse = page.locator('#pm-home-more-menu [data-pm-home-action="collapse-terminal"]');
  const labelBefore = (await collapse.textContent()).trim();
  const before = await state(page);
  await collapse.click();
  const after = await state(page);
  await page.locator('#pm-home-more-btn').click();
  const disabled = await collapse.isDisabled();
  const reason = await collapse.getAttribute('data-disabled-reason');
  const labelAfter = (await collapse.textContent()).trim();
  return {
    pass: labelBefore === 'Collapse Bottom Terminal' && labelAfter === 'Collapse Bottom Terminal' &&
      after.metrics.commandCount === before.metrics.commandCount + 1 &&
      after.metrics.persistCount === before.metrics.persistCount + 1 &&
      after.layout.surfaces.find(surface => surface.surface_kind === 'terminal_section').collapsed === true &&
      disabled && reason === 'Bottom terminal is already collapsed',
    label_before: labelBefore,
    label_after: labelAfter,
    disabled,
    reason,
    command: after.commands.at(-1)
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
  await surfaceAction(page, 'dashboard', 'move-surface', 'dock_left');
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
  await page.waitForTimeout(80);
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
