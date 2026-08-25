/* Wave 2 Activity Panel — screenshot the 8 concepts in a light and a dark theme.
   Panel is PINNED so it renders at full height, and shot as an element crop. */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

const ROOT = '/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro';
const OUT = '/tmp/claude-1000/-mnt-Cursor-PuppetMaster/6b56d129-8eab-4a4f-bf02-133b45afc809/scratchpad/waves/apshots';
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true, args: ['--disable-gpu', '--allow-file-access-from-files', '--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1600, height: 980 }, deviceScaleFactor: 1 });
const errs = [];
page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
page.on('pageerror', e => errs.push(String(e)));
await page.goto(pathToFileURL(path.join(ROOT, 'index.html')).href, { waitUntil: 'load' });
await page.waitForFunction(() => window.__PM56_BOOT_OK === true);

await page.evaluate(() => { PM56_DEMO.pinActivity(); });
await page.waitForTimeout(200);

const themes = process.argv[2] ? [process.argv[2]] : ['basic-dark', 'basic-light'];
for (const theme of themes) {
  await page.evaluate(t => PM56_DEMO.setTheme(t), theme);
  await page.waitForTimeout(150);
  for (let v = 0; v < 8; v++) {
    await page.evaluate(v => PM56_DEMO.setVariant(4, v), v);
    await page.waitForTimeout(900);
    const el = await page.$('.activity-panel');
    await el.screenshot({ path: path.join(OUT, `${theme}-c${v}.png`) });
  }
}
console.log(JSON.stringify({ ok: true, errs }));
await browser.close();
