/* Wave 4 Decisions — fast boot + eight-take structural fingerprint. */
import { chromium } from 'playwright';
import path from 'path';
import { pathToFileURL } from 'url';

const ROOT = process.env.PM56_ROOT || '/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro';
const FILE = process.env.PM56_FILE || path.join(ROOT, 'index.html');
const url = pathToFileURL(FILE).href;

const browser = await chromium.launch({ headless: true, args: ['--disable-gpu', '--allow-file-access-from-files', '--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const errs = [], warns = [], pageErrs = [];
page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); if (m.type() === 'warning') warns.push(m.text()); });
page.on('pageerror', e => pageErrs.push(String(e)));

await page.goto(url, { waitUntil: 'load', timeout: 20000 });
await page.waitForFunction(() => window.__PM56_BOOT_OK === true && window.PM56_DEMO, { timeout: 15000 });

const out = { boot: true, file: FILE };
out.slotRegistered = await page.evaluate(() => !!(window.PM56_EXT._slots.questionSurface || []).length);
out.actions = await page.evaluate(() => Object.keys(window.PM56_EXT._actions).filter(k => k.startsWith('qs-')));

await page.evaluate(() => PM56_DEMO.openQuestionnaire());
await page.waitForTimeout(500);

out.hostWidth = await page.evaluate(() => {
  const h = document.querySelector('.decision-host');
  return h ? Math.round(h.getBoundingClientRect().width) : null;
});
out.exactTitle = await page.getByText('Deployment questionnaire', { exact: true }).count();

out.takes = [];
for (let v = 0; v < 8; v++) {
  await page.evaluate(v => PM56_DEMO.setVariant(6, v), v);
  await page.waitForTimeout(420);
  const f = await page.evaluate(() => {
    const host = document.querySelector('.decision-host');
    if (!host) return null;
    const cls = new Set(); let nodes = 0; const tags = {};
    host.querySelectorAll('*').forEach(el => {
      nodes++; tags[el.tagName] = (tags[el.tagName] || 0) + 1;
      el.classList.forEach(c => cls.add(c));
    });
    const r = host.getBoundingClientRect();
    return {
      nodes, tags,
      classes: [...cls].sort().join(' '),
      root: (host.firstElementChild && host.firstElementChild.className) || '',
      height: Math.round(r.height),
      evidence: host.querySelectorAll('.decision-evidence, .qs-evidence').length,
      paintedEvidence: [...host.querySelectorAll('.decision-evidence, .qs-evidence')]
        .filter(e => e.getClientRects().length && getComputedStyle(e).display !== 'none').length,
      close: host.querySelectorAll('[data-action="close-decision"]').length,
      text: (host.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 120)
    };
  });
  out.takes.push(f);
}

out.model = await page.evaluate(() => window.PM56_QUESTIONS && window.PM56_QUESTIONS.model());
out.activeFlow = await page.evaluate(() => window.PM56_QUESTIONS && window.PM56_QUESTIONS.activeFlowId());
out.errs = errs; out.warns = warns; out.pageErrs = pageErrs;
console.log(JSON.stringify(out, null, 1));
await browser.close();
