import path from 'path';
import { pathToFileURL } from 'url';
const { chromium } = await import('playwright');
const url = pathToFileURL(path.resolve(process.argv[2])).href;
const browser = await chromium.launch({ headless: true, args: ['--disable-gpu', '--allow-file-access-from-files', '--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
page.on('pageerror', e => console.log('PAGEERROR', String(e)));
await page.goto(url, { waitUntil: 'load' });
await page.waitForFunction(() => window.__PM56_BOOT_OK === true);

const probe = () => page.evaluate(() => {
  const bar = document.querySelector('.activity-bar');
  const wrap = document.querySelector('.activity-wrap');
  const item = document.querySelector('.activity-item[data-hover-domain="goal"]');
  const svg = item.querySelector('svg');
  const mark = item.querySelector('.state-mark');
  const cs = getComputedStyle(svg), cm = mark ? getComputedStyle(mark) : null;
  const g = el => { const r = el.getBoundingClientRect(); return { w: +r.width.toFixed(1), h: +r.height.toFixed(1) }; };
  return {
    ready: document.documentElement.getAttribute('data-ab-ready'),
    wrap: g(wrap), bar: g(bar), barScroll: bar.scrollWidth, item: g(item),
    svg: g(svg), svgCss: { w: cs.width, h: cs.height, minW: cs.minWidth, flex: cs.flex, display: cs.display, overflow: cs.overflow },
    mark: mark ? g(mark) : null,
    markCss: cm ? { display: cm.display, w: cm.width, minW: cm.minWidth, flex: cm.flex } : null,
    itemCss: (c => ({ display: c.display, gap: c.gap, padding: c.padding, minW: c.minWidth }))(getComputedStyle(item)),
    barCss: (c => ({ display: c.display, width: c.width, maxW: c.maxWidth, overflowX: c.overflowX, flex: c.flex }))(getComputedStyle(bar)),
    stage: (() => { const s = document.querySelector('.chat-stage'); const r = s.getBoundingClientRect(); return { w: +r.width.toFixed(1) }; })(),
    editorTabs: window.PM56_DEMO.getState().editorTabs
  };
});
console.log('WITH MODULE ', JSON.stringify(await probe(), null, 1));
await page.evaluate(() => document.documentElement.removeAttribute('data-ab-ready'));
await page.waitForTimeout(150);
console.log('MODULE CSS OFF', JSON.stringify(await probe(), null, 1));
await browser.close();
