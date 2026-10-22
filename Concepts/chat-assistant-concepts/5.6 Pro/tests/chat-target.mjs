/* Host differences only. Assertions stay in their original verifiers. */
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { launchGpuBrowser } from './gpu-browser.mjs';

export const CHAT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const LOOKS = ['basic-dark', 'basic-light', 'glass-dark', 'glass-light', 'friendly-dark', 'friendly-light', 'retro-dark', 'retro-light', 'nier-dark', 'nier-light'];
const sizeContexts = new Map();
// Synchronous assertion writers attach the latest measured sizing context.
// It is refreshed after load, theme, viewport/column changes and pointer release.
export function testGeometry() { return [...sizeContexts.values()].at(-1) || null; }
async function captureSize(page, requested) {
  const measured = await page.evaluate(() => {
    const box = el => { const r = el?.getBoundingClientRect(); return r ? { width: r.width, height: r.height } : null; };
    const root = document.querySelector('#pmRoot') || document.body;
    return { measuredAt: performance.now(), viewport: { width: innerWidth, height: innerHeight },
      column: box(document.querySelector('#chatPanel > #pmw-chat56')), stage: box(root?.querySelector('.chat-stage')), transcript: box(root?.querySelector('.transcript')) };
  });
  measured.requested = requested || sizeContexts.get(page)?.requested || null;
  if (!sizeContexts.has(page)) page.once('close', () => sizeContexts.delete(page));
  sizeContexts.delete(page); sizeContexts.set(page, measured);
  return measured;
}
export function chatTarget(argv = process.argv.slice(2)) {
  const opt = (key, fallback) => { const i = argv.indexOf(key); return i < 0 ? fallback : argv[i + 1]; };
  const kind = opt('--page', 'standalone');
  if (!['standalone', 'pm7'].includes(kind)) throw new Error('--page must be standalone or pm7');
  const file = path.resolve(opt('--file', kind === 'pm7' ? '/tmp/c56port-tests/PMConcept7.html' : path.join(CHAT_ROOT, 'index.html')));
  const url = new URL(pathToFileURL(file));
  if (kind === 'pm7') { url.searchParams.set('o55', 'off'); url.searchParams.set('pm56test', '1'); }
  async function ready(page) {
    await page.waitForFunction(() => window.__PM56_BOOT_OK === true, null, { timeout: 60000 });
    if (kind === 'pm7') {
      await page.waitForFunction(() => window.PM56_PORT?.ready && window.PM56_APP && window.PMW?.chatCol, null, { timeout: 60000 });
      await page.evaluate(() => { PMW.chatCol.setHistoryPinned(false); PMW.chatCol.setKeepOpen(true); PMW.chatCol.show(); });
      await page.waitForFunction(() => document.querySelector('#chatPanel > #pmw-chat56.pm56-frame > #pmRoot.pm56-host')?.getBoundingClientRect().width > 0);
    }
  }
  async function resize(page, size, surface = 'column') {
    // Sheets are window overlays. Chat breakpoints read the column, independently of the window.
    await page.setViewportSize(kind === 'pm7' && surface === 'column' ? { width: Math.max(2400, size.width), height: size.height } : size);
    if (kind === 'pm7') {
      await page.evaluate(width => { if (window.PMW?.chatCol) { PMW.chatCol.setWidth(Math.min(760, Math.max(400, width))); PMW.chatCol.show(); } }, size.width);
    }
    await page.waitForTimeout(400);
    if (kind === 'pm7' && surface === 'column') {
      const expected = Math.min(760, Math.max(400, size.width));
      await page.waitForFunction(expected => {
        const frame = document.querySelector('#chatPanel > #pmw-chat56');
        return frame && Math.abs(frame.getBoundingClientRect().width - expected) <= 1;
      }, expected, { timeout: 5000 });
    }
    await captureSize(page, { ...size, surface });
  }
  async function theme(page, look) {
    await page.evaluate(({ look, kind }) => {
      if (kind === 'standalone') return PM56_DEMO.setTheme(look);
      const [family, mode] = look.split('-');
      PM_THEME.setFamily(family === 'nier' ? 'basic' : family, { persist: false });
      PM_THEME.setMode(mode, { persist: false });
      PM_NIER.preview({ on: family === 'nier' }, { within: null, instant: true, sound: false });
    }, { look, kind });
    const painted = look.replace(/^nier-/, 'basic-');
    if (kind === 'pm7') await page.waitForFunction(({ painted, nier }) => document.documentElement.dataset.theme === painted && (document.documentElement.dataset.o55Nier === 'on') === nier && [...document.querySelectorAll('.pm56-host')].every(h => h.dataset.theme === painted), { painted, nier: look.startsWith('nier-') });
    await page.evaluate(() => document.fonts.ready.then(() => true));
    await page.waitForTimeout(400);
    await captureSize(page);
  }
  async function panelSize(page, size) {
    if (kind === 'standalone') return resize(page, size, 'window');
    // A run view is a Home tab, not the chat column. Expose its real panel and
    // size the window until that panel's container has the requested width.
    await page.evaluate(() => { PMW.chatCol.setVisible(false); const a = PM_HOME.active(); if (a) PM_HOME.reveal(a.tabId); });
    let width = 1000, measured = null;
    for (let i = 0; i < 8; i++) {
      await page.setViewportSize({ width, height: size.height }); await page.waitForTimeout(350);
      measured = await page.evaluate(() => {
        const a = PM_HOME.active(), body = a && document.querySelector('.pmw-tabbody[data-pmw-tab="' + CSS.escape(a.tabId) + '"] .pm56-frame');
        return body ? { width: body.getBoundingClientRect().width, height: body.getBoundingClientRect().height, tabId: a.tabId } : null;
      });
      if (!measured) throw new Error('The active Home tab has no chat-owned panel body');
      if (Math.abs(measured.width - size.width) < 1) { await captureSize(page, { ...size, surface: 'panel' }); return measured; }
      width = Math.max(400, Math.min(4000, Math.round(width + size.width - measured.width)));
    }
    throw new Error(`Cannot size Home panel to ${size.width}px: ${JSON.stringify(measured)}`);
  }
  return { kind, file, url: url.href, ready, resize, theme, panelSize,
    async load(page) { await page.goto(url.href); await ready(page); await page.waitForTimeout(1500); await captureSize(page); },
    async demoTrigger(page, action, flow) {
      if (kind === 'pm7') {
        await page.evaluate(() => { if (!window.O55?.demo?.open) throw new Error('PM7 Demo Studio is unavailable'); O55.demo.open('chat'); });
        await page.waitForTimeout(350);
        return page.locator(`[data-chat-action="${action}"][data-chat-flow="${flow}"]`).filter({ visible: true }).first();
      }
      await page.evaluate(() => { const b = document.createElement('button'); b.dataset.action = 'open-demo'; document.body.appendChild(b); b.click(); b.remove(); });
      await page.waitForTimeout(300);
      return page.locator(`.demo-dialog .demo-trigger[data-action="${action}"][data-flow="${flow}"]`).first();
    },
    async editor(page) { return page.evaluate(kind => {
      if (kind === 'pm7') return PM_HOME.active();
      return { tabId: PM56_EXT.ctx().state.activeEditor, kind: 'standalone' };
    }, kind); }
  };
}

// Older verifiers use the same target through these small page lifecycle bridges.
// The browser remains a real Playwright Browser; no assertion result is intercepted.
export async function launchChatBrowser(chromium, argv = process.argv.slice(2)) {
  const target = chatTarget(argv), browser = await launchGpuBrowser(chromium, argv), installed = new WeakSet();
  async function install(page) {
    if (installed.has(page)) return page;
    installed.add(page);
    const setViewport = page.setViewportSize.bind(page);
    page.setViewportSize = async size => {
      await setViewport(target.kind === 'pm7' ? { ...size, width: Math.max(2400, size.width) } : size);
      if (target.kind === 'pm7') await page.evaluate(width => {
        if (window.PMW?.chatCol) { PMW.chatCol.setWidth(Math.min(760, Math.max(400, width))); PMW.chatCol.show(); }
      }, size.width);
      await captureSize(page, { ...size, surface: 'column' });
    };
    const release = page.mouse.up.bind(page.mouse);
    page.mouse.up = async options => { const result = await release(options); await captureSize(page); return result; };
    const init = kind => {
        const T = window.PM56_TEST = { kind };
        Object.defineProperty(T, 'host', { get: () => kind === 'pm7' ? document.querySelector('#pmRoot') : document.body });
        T.setTheme = look => {
          if (kind === 'standalone') return PM56_DEMO.setTheme(look);
          const [family, mode] = look.split('-');
          PM_THEME.setFamily(family === 'nier' ? 'basic' : family, { persist: false }); PM_THEME.setMode(mode, { persist: false });
          PM_NIER.preview({ on: family === 'nier' }, { within: null, instant: true, sound: false });
        };
        T.editor = () => {
          const stateId = kind === 'standalone' ? PM56_EXT.ctx().state.activeEditor : PM_HOME.active()?.tabId;
          const tab = kind === 'standalone' ? document.querySelector('.editor-tab.active') : stateId ? document.querySelector('.pmw-tab[aria-selected="true"][data-tab-id="' + CSS.escape(stateId) + '"]') : null;
          const renderedId = kind === 'standalone' ? tab?.dataset.id : tab?.dataset.tabId;
          const visible = !!tab && tab.getBoundingClientRect().width > 0 && tab.getBoundingClientRect().height > 0 && getComputedStyle(tab).visibility !== 'hidden';
          const body = kind === 'standalone' ? document.querySelector('.editor-body') : stateId ? document.querySelector('.pmw-tabbody[data-pmw-tab="' + CSS.escape(stateId) + '"]') : null;
          return { id: visible && renderedId === stateId ? renderedId : null, stateId, renderedId, visible, body, tab };
        };
    };

    await page.addInitScript(init, target.kind);
    const goto = page.goto.bind(page);
    page.goto = async (_url, options) => {
      const response = await goto(target.url, options);
      await target.ready(page);
      await page.evaluate(init, target.kind);
      if (target.kind === 'pm7') await page.setViewportSize(page.viewportSize() || { width: 1440, height: 900 });
      await captureSize(page);
      return response;
    };
    return page;
  }
  const newContext = browser.newContext.bind(browser), newPage = browser.newPage.bind(browser);
  browser.newContext = async options => {
    const context = await newContext(options), create = context.newPage.bind(context);
    context.newPage = async () => install(await create());
    return context;
  };
  browser.newPage = async options => install(await newPage(options));
  return browser;
}
