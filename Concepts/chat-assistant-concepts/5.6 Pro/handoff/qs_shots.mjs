/* Screenshot every take, cropped to the decision host, for eye review.
   node qs_shots.mjs <theme> <decisionOpener> [outdir] */
import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { pathToFileURL } from 'url';

const ROOT = '/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro';
const url = pathToFileURL(path.join(ROOT, 'index.html')).href;
const theme = process.argv[2] || 'basic-dark';
const kind = process.argv[3] || 'question';
const outDir = process.argv[4] || '/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro/handoff/w6/waves/qsshots';
fs.mkdirSync(outDir, { recursive: true });

const OPEN = {
  question: () => PM56_DEMO.openQuestionnaire(),
  plan: () => PM56_DEMO.openPlan(),
  permission: () => { PM56_DEMO.trigger('Permission request'); },
  conflict: () => { PM56_DEMO.trigger('Conflict resolution'); }
};

const browser = await chromium.launch({ headless: true, args: ['--disable-gpu', '--allow-file-access-from-files', '--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: 'load' });
await page.waitForFunction(() => window.__PM56_BOOT_OK === true);
await page.evaluate(t => PM56_DEMO.setTheme(t), theme);
await page.waitForTimeout(300);

for (let v = 0; v < 8; v++) {
  await page.evaluate(v => PM56_DEMO.setVariant(6, v), v);
  await page.evaluate(k => {
    if (k === 'question') PM56_DEMO.openQuestionnaire();
    else if (k === 'plan') PM56_DEMO.openPlan();
    else if (k === 'permission') PM56_DEMO.openPermission();
    else PM56_DEMO.trigger('Conflict resolution');
  }, kind);
  await page.waitForTimeout(900);
  const el = await page.$('.decision-host');
  const box = await el.boundingBox();
  if (!box || box.height < 4) { console.log(`take ${v}: host height ${box && box.height}`); continue; }
  await page.screenshot({
    path: path.join(outDir, `${theme}-${kind}-t${v}.png`),
    clip: { x: Math.max(0, box.x - 6), y: Math.max(0, box.y - 6), width: Math.min(box.width + 12, 1440), height: Math.min(box.height + 12, 900) }
  });
}
console.log('shots in', outDir);
await browser.close();
