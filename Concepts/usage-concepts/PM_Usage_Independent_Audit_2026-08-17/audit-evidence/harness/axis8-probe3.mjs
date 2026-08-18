/* AXIS 8 PROBE 3 — ue-610 inspector note, context-maintenance rows. READ-ONLY. */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const CONCEPT = '/mnt/Cursor/PuppetMaster/Concepts/usage-concepts/QwenUsageConcept';
const SCRATCH = '/tmp/claude-1000/-mnt-Cursor-PuppetMaster/7e74d8f5-7c2a-4eeb-8947-13056b4b2e5f/scratchpad';
const OUT = path.join(SCRATCH, 'axis8-probe3-results.json');
const PROFILE = path.join(SCRATCH, 'axis8-profile3');
const CHROME = '/home/sittingmongoose/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';
const URL = 'file://' + CONCEPT + '/u11-prism.html';
const req = createRequire(path.join(CONCEPT, '.verify', 'node_modules', '__probe.js'));
const { chromium } = req('playwright-core');
fs.mkdirSync(PROFILE, { recursive: true });
const R = {};
const ctx = await chromium.launchPersistentContext(PROFILE, {
  executablePath: CHROME, headless: true,
  args: ['--headless', '--disable-gpu', '--no-sandbox', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=9415'],
  viewport: { width: 1500, height: 1000 }
});
const page = ctx.pages()[0] || await ctx.newPage();
await page.goto(URL, { waitUntil: 'load', timeout: 25000 });
await page.waitForTimeout(1400);
async function room(n) { await page.evaluate(x => { const b = document.querySelector('.u11-rail .u11-item[data-tab="' + x + '"]'); if (b) b.click(); }, n); await page.waitForTimeout(700); }
async function disc(l) { await page.evaluate(x => { const b = document.querySelector('[data-disc="' + x + '"]'); if (b) b.click(); }, l); await page.waitForTimeout(800); }

await disc('advanced');
await room('ledger');

/* ue-610 inspector via direct API the page exposes to its own buttons */
R.ue610 = await page.evaluate(async () => {
  const b = document.querySelector('button[data-u11-act="openattempt"][data-att="ue-610"]');
  if (!b) return { found: false, allAtts: Array.from(document.querySelectorAll('[data-att]')).map(x => x.getAttribute('data-att')) };
  b.scrollIntoView({ block: 'center' }); b.click();
  await new Promise(r => setTimeout(r, 900));
  const p = document.querySelector('.u11rd');
  return { found: true, text: p ? p.innerText.replace(/\s+/g, ' ').trim() : null };
});

/* context details: maintenance rows */
R.contextDetails = await page.evaluate(async () => {
  const b = Array.from(document.querySelectorAll('button')).find(x => /Context details|Open context details/i.test(x.textContent));
  if (b) { b.scrollIntoView({ block: 'center' }); b.click(); await new Promise(r => setTimeout(r, 1000)); }
  const panels = Array.from(document.querySelectorAll('.u11ctx, .u11ctx-details, [class*="u11ctx"]'))
    .filter(e => e.getBoundingClientRect().height > 40);
  const txt = panels.length ? panels.map(p => p.innerText.replace(/\s+/g, ' ').trim()).join(' || ') : null;
  return {
    clicked: !!b,
    hasReclaimed: /reclaimed/i.test(document.body.innerText),
    reclaimLines: (document.body.innerText.match(/[^\n]*reclaimed[^\n]*/gi) || []),
    dollarNearMaint: (document.body.innerText.match(/[^\n]*(compact|prune|repack)[^\n]*/gi) || []).slice(0, 12),
    panelSample: txt ? txt.slice(0, 1500) : null
  };
});

fs.writeFileSync(OUT, JSON.stringify(R, null, 1));
console.log('wrote', OUT);
await ctx.close();
