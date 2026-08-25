/* question-submitting is a 950ms transient with no demo opener; drive it
   through the live state object the extension registry hands to modules. */
import { chromium } from 'playwright';
import path from 'path';
import { pathToFileURL } from 'url';
const ROOT = '/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro';
const b = await chromium.launch({ headless: true, args: ['--disable-gpu', '--allow-file-access-from-files', '--no-sandbox'] });
const page = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errs = [];
page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
page.on('pageerror', e => errs.push(String(e)));
await page.goto(pathToFileURL(path.join(ROOT, 'index.html')).href, { waitUntil: 'load' });
await page.waitForFunction(() => window.__PM56_BOOT_OK === true);
const rows = [];
for (let v = 0; v < 8; v++) {
  await page.evaluate(v => PM56_DEMO.setVariant(6, v), v);
  await page.evaluate(() => { const c = PM56_EXT.ctx({}); c.state.decision = { type: 'question-submitting' }; c.renderApp(); });
  await page.waitForTimeout(380);
  rows.push(await page.evaluate(() => {
    const h = document.querySelector('.decision-host');
    const bar = h.querySelector('.qs-progress-track i');
    return { qs: h.querySelector('[data-qs]')?.getAttribute('data-qs'),
      chars: h.textContent.replace(/\s+/g, ' ').trim().length,
      height: Math.round(h.getBoundingClientRect().height),
      closes: h.querySelectorAll('[data-action="close-decision"]').length,
      barPainted: !!(bar && bar.getBoundingClientRect().width > 1) };
  }));
}
console.log(JSON.stringify({ rows, errs }));
await b.close();
