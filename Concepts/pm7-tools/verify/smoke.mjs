/* smoke.mjs -- functional smoke checklist for PM6-vs-PM7 behavior parity.
 *
 * Runs one scripted session against a served file and emits JSON:
 *   { url, parity: {...}, info: {...}, errors: [...] }
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
 * Usage: node smoke.mjs --file <served name> --out <json> --modules <dir>
 */

import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const args = {};
for (let i = 2; i < process.argv.length; i += 2) {
  args[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
}
for (const k of ['file', 'out', 'modules']) {
  if (!args[k]) { console.error('missing --' + k); process.exit(2); }
}
const require2 = createRequire(join(args.modules, 'noop.js'));
const { chromium } = require2('playwright-core');

const SERVER = 'http://127.0.0.1:8741/';
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
const errors = [];
page.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)); });
page.on('pageerror', e => errors.push('pageerror: ' + String(e).slice(0, 200)));

await page.addInitScript(() => {
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

const out = { url: SERVER + args.file, parity: {}, info: {} };
const P = out.parity;

await page.goto(SERVER + args.file, { waitUntil: 'load', timeout: 60000 });
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
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'load', timeout: 30000 }),
    reset.click()
  ]);
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

out.errors = errors;
P.totalConsoleErrors = errors.length;
writeFileSync(args.out, JSON.stringify(out, null, 2));
console.error(args.file + ': smoke done, consoleErrors=' + errors.length);
await browser.close();
