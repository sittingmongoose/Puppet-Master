/* AXIS 8 PROBE 2 — note text, full-document scan incl. overlays, widget heading. READ-ONLY. */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const CONCEPT = '/mnt/Cursor/PuppetMaster/Concepts/usage-concepts/QwenUsageConcept';
const SCRATCH = '/tmp/claude-1000/-mnt-Cursor-PuppetMaster/7e74d8f5-7c2a-4eeb-8947-13056b4b2e5f/scratchpad';
const OUT = path.join(SCRATCH, 'axis8-probe2-results.json');
const PROFILE = path.join(SCRATCH, 'axis8-profile2');
const CHROME = '/home/sittingmongoose/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';
const URL = 'file://' + CONCEPT + '/u11-prism.html';
const req = createRequire(path.join(CONCEPT, '.verify', 'node_modules', '__probe.js'));
const { chromium } = req('playwright-core');
fs.mkdirSync(PROFILE, { recursive: true });
const R = {};
const ctx = await chromium.launchPersistentContext(PROFILE, {
  executablePath: CHROME, headless: true,
  args: ['--headless', '--disable-gpu', '--no-sandbox', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=9414'],
  viewport: { width: 1500, height: 1000 }
});
const page = ctx.pages()[0] || await ctx.newPage();
await page.goto(URL, { waitUntil: 'load', timeout: 25000 });
await page.waitForTimeout(1400);

async function room(n) { await page.evaluate(x => { const b = document.querySelector('.u11-rail .u11-item[data-tab="' + x + '"]'); if (b) b.click(); }, n); await page.waitForTimeout(700); }
async function disc(l) { await page.evaluate(x => { const b = document.querySelector('[data-disc="' + x + '"]'); if (b) b.click(); }, l); await page.waitForTimeout(800); }

await disc('advanced');
await room('ledger');

R.opsWidget = await page.evaluate(() => {
  const pane = document.querySelector('.u11-pane[data-pane="ledger"]');
  const cards = pane.querySelectorAll('.u11w-opcard');
  const host = cards.length ? cards[0].closest('.uw, .pmw-item, [class*="uw-"]') : null;
  const notes = Array.from(pane.querySelectorAll('.u11w-note')).map(n => n.innerText.replace(/\s+/g, ' ').trim());
  const heads = Array.from(pane.querySelectorAll('.uw-head, .uw-title, [class*="head"]')).map(h => h.innerText.replace(/\s+/g, ' ').trim()).filter(Boolean);
  return {
    hostClass: host ? host.className : null,
    hostText: host ? host.innerText.replace(/\s+/g, ' ').trim().slice(0, 1600) : null,
    notesInPane: notes,
    headsSample: heads.slice(0, 12)
  };
});

/* full document scan, with the ue-609 inspector OPEN, over the whole documentElement */
R.fullScan = await page.evaluate(async () => {
  const btn = Array.from(document.querySelectorAll('button')).find(b => /View the verification call/i.test(b.textContent));
  if (btn) { btn.scrollIntoView({ block: 'center' }); btn.click(); await new Promise(r => setTimeout(r, 900)); }
  const needles = ['0.43.1', 'verify_failed', 'Verify failed', 'x64', 'Failure class', 'failure',
    'Outcome', 'Affected', 'cont-8841', 'Target version', 'publisher-signed', 'rolled back', 'Rollback'];
  const txt = document.body.innerText;
  const html = document.documentElement.outerHTML;
  const out = {};
  needles.forEach(n => { out[n] = { inBodyText: txt.indexOf(n) >= 0, inOuterHtml: html.indexOf(n) >= 0 }; });
  out.__inspectorOpen = !!document.querySelector('.u11rd');
  return out;
});

/* widget picker description text for 'operations' */
R.picker = await page.evaluate(async () => {
  const add = document.querySelector('[data-pmw-add], [data-act="addwidget"], .uw-add, [title*="Add"]');
  let opened = false;
  if (add) { add.click(); opened = true; await new Promise(r => setTimeout(r, 600)); }
  const rows = Array.from(document.querySelectorAll('[data-pmw-addtype]')).map(r => ({
    type: r.getAttribute('data-pmw-addtype'), text: r.innerText.replace(/\s+/g, ' ').trim()
  }));
  return { opened, addSel: add ? add.className || add.tagName : null, rows: rows.filter(r => /operations|maintenance/i.test(r.type + r.text)) };
});

fs.writeFileSync(OUT, JSON.stringify(R, null, 1));
console.log('wrote', OUT);
await ctx.close();
