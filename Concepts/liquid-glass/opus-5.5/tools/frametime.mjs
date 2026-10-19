/* frametime.mjs <page.html> <out.json>   CPU-only frame-time check (BRIEF gates). Run on Nas1: headless Chrome there
 * draws with SwiftShader, so this is the machine without a GPU. For each look and configuration it drives the same
 * script (a pointer sweep over the toolbar and cards, four range clicks, four navigation clicks, a menu opened and
 * closed twice) and records every animation-frame interval: the LG-on default baseline, Liquid Glass on its CPU path (the painted
 * frost, what Nas1 detects), and Liquid Glass with the live blur forced on (what the CPU path avoids).
 * AB=1 runs the same script on the P1000's GPU through agent-browser (LG-on automatic tier against the forced GPU path; no old-material comparison).
 */
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const AB = !!process.env.AB;
const require = createRequire(process.env.PW_DIR || '/home/sittingmongoose/pmt-dev/pw/noop.js');
const { chromium } = require('playwright-core');
const [pageFile, outFile] = process.argv.slice(2);
const CONFIGS = AB ? [['liquid-glass-default', ''], ['liquid-glass-gpu-path', 'lgtier=gpu']]
  : [['liquid-glass-default', ''], ['liquid-glass-cpu-path', 'lgtier=cpu'], ['liquid-glass-live-blur-on-cpu', 'lgtier=gpu']];
const results = [];
let ab = null, browser;
if (AB) { ab = JSON.parse(execFileSync('agent-browser', ['start', '--url', 'about:blank']).toString()); browser = await chromium.connectOverCDP(ab.cdp_endpoint); }
else browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true });
for (const look of ['glass-dark', 'glass-light']) for (const [name, qs] of CONFIGS) {
  const page = AB ? await browser.contexts()[0].newPage() : await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  if (AB) await page.setViewportSize({ width: 1920, height: 1080 });   /* no interception over CDP: it stalls this page */
  else await page.route('**/*', r => /^(file:|data:|blob:)/.test(r.request().url()) ? r.continue() : r.abort());
  await page.goto((pageFile.startsWith('file:') ? pageFile : pathToFileURL(resolve(pageFile)).href) + '?o55=off&' + qs, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.locator('#pm-settings-root').waitFor({ state: 'attached', timeout: 90000 });
  await page.waitForTimeout(1500);
  await page.evaluate(n => { window.PM12_KIMI.setSettingFromHost('general.visual.theme', n); window.PM_PAGES.go('usage'); }, look === 'glass-dark' ? 'Glass Dark' : 'Glass Light');
  await page.waitForTimeout(3500);
  const renderer = await page.evaluate(() => { const g = document.createElement('canvas').getContext('webgl'); if (!g) return 'none'; const x = g.getExtension('WEBGL_debug_renderer_info'); return x ? g.getParameter(x.UNMASKED_RENDERER_WEBGL) : '?'; });
  await page.evaluate(() => { window.__ft = []; let last = 0; (function f(t) { if (last) window.__ft.push(t - last); last = t; window.__ftRaf = requestAnimationFrame(f); })(0); });
  for (let i = 0; i <= 40; i++) await page.mouse.move(760 + i * 16, 80 + (i % 2) * 2);
  for (let i = 0; i <= 40; i++) await page.mouse.move(540 + i * 20, 300 + Math.sin(i / 4) * 120);
  for (const k of [4, 1, 3, 2]) { await page.click(`#pmuRange > button:nth-of-type(${k})`); await page.waitForTimeout(700); }
  for (const k of [3, 4, 9, 1]) { await page.click(`#pmuNav .pmu-navbtn:nth-of-type(${k})`); await page.waitForTimeout(800); }
  for (let r = 0; r < 2; r++) { await page.click('#pmuScopeBtn'); await page.waitForTimeout(700); await page.keyboard.press('Escape'); await page.waitForTimeout(500); }
  const ft = await page.evaluate(() => { cancelAnimationFrame(window.__ftRaf); return window.__ft; });
  const s = [...ft].sort((a, b) => a - b), q = p => +s[Math.min(s.length - 1, Math.floor(p * s.length))].toFixed(1);
  const row = { look, config: name, renderer, frames: ft.length, median_ms: q(0.5), p95_ms: q(0.95), over_20ms: ft.filter(x => x > 20).length, over_50ms: ft.filter(x => x > 50).length, tier: await page.evaluate(() => document.documentElement.getAttribute('data-lg-tier')) };
  row.over_20ms_share = +(row.over_20ms / ft.length).toFixed(3);
  results.push(row); console.log(JSON.stringify(row));
  await page.close();
}
await browser.close();
if (ab) execFileSync('agent-browser', ['stop', ab.id]);
writeFileSync(outFile, JSON.stringify({ machine: AB ? 'P1000 VM (Quadro P1000, agent-browser)' : 'Nas1 (no GPU, SwiftShader)', results }, null, 1));
