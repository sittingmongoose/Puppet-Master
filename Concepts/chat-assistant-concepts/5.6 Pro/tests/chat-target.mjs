/* Host differences only. Assertions stay in their original verifiers. */
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { launchGpuBrowser } from './gpu-browser.mjs';

export const CHAT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const LOOKS = ['basic-dark', 'basic-light', 'glass-dark', 'glass-light', 'friendly-dark', 'friendly-light', 'retro-dark', 'retro-light', 'nier-dark', 'nier-light'];
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
  }
  return { kind, file, url: url.href, ready, resize, theme,
    async load(page) { await page.goto(url.href); await ready(page); await page.waitForTimeout(1500); },
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
    };
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
          if (kind === 'standalone') return { id: PM56_EXT.ctx().state.activeEditor, body: document.querySelector('.editor-body'), tab: document.querySelector('.editor-tab.active') };
          const a = PM_HOME.active(), id = a?.tabId;
          return { id, body: id ? document.querySelector('.pmw-tabbody[data-pmw-tab="' + CSS.escape(id) + '"]') : null, tab: id ? document.querySelector('.pmw-tab[data-tab-id="' + CSS.escape(id) + '"]') : null };
        };
    };

    await page.addInitScript(init, target.kind);
    const goto = page.goto.bind(page);
    page.goto = async (_url, options) => {
      const response = await goto(target.url, options);
      await target.ready(page);
      await page.evaluate(init, target.kind);
      if (target.kind === 'pm7') await page.setViewportSize(page.viewportSize() || { width: 1440, height: 900 });
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
