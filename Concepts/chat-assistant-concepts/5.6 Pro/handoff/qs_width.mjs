/* Measure the real .decision-host width across viewports and editor splits —
   the container the tiers must key on, which no viewport query can see. */
import { chromium } from 'playwright';
import path from 'path';
import { pathToFileURL } from 'url';
const ROOT = '/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro';
const url = pathToFileURL(path.join(ROOT, 'index.html')).href;
const browser = await chromium.launch({ headless: true, args: ['--disable-gpu', '--allow-file-access-from-files', '--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
await page.goto(url, { waitUntil: 'load' });
await page.waitForFunction(() => window.__PM56_BOOT_OK === true);
await page.evaluate(() => PM56_DEMO.openQuestionnaire());
const rows = [];
for (const w of [1600, 1440, 1280, 1100, 980, 900, 760, 620, 500, 430]) {
  await page.setViewportSize({ width: w, height: 900 });
  for (const ed of [30, 54, 72]) {
    await page.evaluate(e => { document.documentElement.style.setProperty('--editor-w', e + '%'); }, ed);
    await page.waitForTimeout(120);
    const m = await page.evaluate(() => {
      const h = document.querySelector('.decision-host');
      const st = document.querySelector('.chat-stage');
      return h ? { host: Math.round(h.getBoundingClientRect().width), stage: st ? Math.round(st.getBoundingClientRect().width) : null } : null;
    });
    rows.push({ vw: w, ed, ...m });
  }
}
console.log(JSON.stringify(rows));
await browser.close();
