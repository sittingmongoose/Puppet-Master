/* Wave 2 Activity Panel — quick boot + panel probe. */
import { chromium } from 'playwright';
import path from 'path';
import { pathToFileURL } from 'url';

const ROOT = '/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro';
const url = pathToFileURL(path.join(ROOT, 'index.html')).href;

const browser = await chromium.launch({ headless: true, args: ['--disable-gpu', '--allow-file-access-from-files', '--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const errs = [], warns = [], pageErrs = [];
page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); if (m.type() === 'warning') warns.push(m.text()); });
page.on('pageerror', e => pageErrs.push(String(e)));

await page.goto(url, { waitUntil: 'load', timeout: 20000 });
await page.waitForFunction(() => window.__PM56_BOOT_OK === true && window.PM56_DEMO, { timeout: 15000 });

const out = { boot: true, errs, warns, pageErrs };
out.extSlots = await page.evaluate(() => Object.keys(window.PM56_EXT._slots));
out.extActions = await page.evaluate(() => Object.keys(window.PM56_EXT._actions));

// open the activity panel
await page.click('[data-hover-domain="todo"]');
await page.waitForSelector('.activity-panel', { state: 'visible' });
out.sections = await page.locator('.activity-section').count();
out.pmapRoot = await page.locator('.pmap').count();
out.rows = await page.locator('.pmap-row').count();
out.hasScope = await page.locator('.pmap-scope').count();

// per-concept structural fingerprint
out.concepts = [];
for (let v = 0; v < 8; v++) {
  await page.evaluate(v => PM56_DEMO.setVariant(4, v), v);
  await page.waitForTimeout(60);
  const f = await page.evaluate(() => {
    const p = document.querySelector('.activity-panel .activity-scroll');
    if (!p) return null;
    const tags = {}, cls = {};
    p.querySelectorAll('*').forEach(el => {
      tags[el.tagName] = (tags[el.tagName] || 0) + 1;
      el.classList.forEach(c => { cls[c] = (cls[c] || 0) + 1; });
    });
    return { nodes: p.querySelectorAll('*').length, html: p.innerHTML.length, tags, top: [...p.children].map(c => c.className) };
  });
  out.concepts.push({ v, ...f });
}
console.log(JSON.stringify(out, null, 1));
await browser.close();
