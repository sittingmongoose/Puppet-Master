/* settings_nopills_accept.mjs — functional acceptance of the approved no-pills Settings patterns (NP-SWITCH, NP-CHOICE,
 * NP-BARS, NP-STATUS; Jared 2026-10-10/11) in every look, light and dark, with and without Reduced Motion, at several
 * viewports. Shapes are pill_check.mjs's job; this checks behaviour and the approved copy. Headless and read-only on the
 * repository; on the P1000 it drives an agent-browser session over --cdp and reports the WebGL renderer it ran on.
 *
 * Per look, motion mode and viewport:
 *   switch    Settings › App & Input › "Preview a theme before switching": a click flips aria-checked and the redrawn
 *             switch moves as drawn. Normal motion: the first painted frame is the state it left (pm-switch-from or the
 *             old key position), the key passes at least one position between its ends, and it lands on the new end.
 *             Reduced Motion: the key never stops between its ends and the lit layer fades (an opacity strictly
 *             between 0 and 1 on some frame). A second click restores the setting and is checked the same way.
 *   thememenu the title-bar theme menu opens; Light / Dark / Auto is one radiogroup of three radios with exactly one
 *             checked, and neither the group nor a cell has a corner of half its height or more; Escape closes it.
 *   status    on AI & Providers every visible .pm-status-mark is a 1em square slot with no fill and no border, and its
 *             data-status is a key of the shared status vocabulary.
 *   copy      the Claude roster row reads "3 of 4 accounts" (in use of total, the approved wording).
 *   bars      every visible usage meter track has square ends (corner 1px or less).
 * Screenshots of the switch rows, the roster and the open theme menu are kept per combination.
 *
 * Usage: node settings_nopills_accept.mjs <page.html> --out <dir> [--cdp <endpoint>] [--viewports 1920x1080,1600x1000]
 *          [--motion normal,reduced] [--looks basic-light,...]
 * Exits 0 when every check passes, 1 when any fails, 2 on a crash or a view that could not open. */
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { coverPage, takeCoverageFlag } from './coverage_union.mjs';

const require = createRequire(join(process.env.PM_PLAYWRIGHT_DIR || '/home/sittingmongoose/pmt-dev/pw/', 'noop.js'));
const CHROME = process.env.PM_CHROME || '/usr/bin/google-chrome';
const { chromium } = require('playwright-core');

const raw = process.argv.slice(2);
const coverageFile = takeCoverageFlag(raw);
const argOf = (n) => { const i = raw.indexOf(n); return i >= 0 && i + 1 < raw.length ? raw[i + 1] : null; };
const VALUED = new Set(['--out', '--cdp', '--viewports', '--motion', '--looks']);
let pageArg = null;
for (let i = 0; i < raw.length; i++) { if (VALUED.has(raw[i])) { i++; continue; } if (!raw[i].startsWith('--')) { pageArg = raw[i]; break; } }
if (!pageArg || !argOf('--out')) { console.error('usage: settings_nopills_accept.mjs <page.html> --out <dir> [--cdp ep] [--viewports ..] [--motion ..] [--looks ..]'); process.exit(2); }
const pagePath = resolve(pageArg), outDir = resolve(argOf('--out')), cdp = argOf('--cdp');
const LOOKS = ['basic-light', 'basic-dark', 'friendly-light', 'friendly-dark', 'glass-light', 'glass-dark', 'retro-light', 'retro-dark', 'nier-light', 'nier-dark'];
const looks = argOf('--looks') ? argOf('--looks').split(',') : LOOKS;
const viewports = (argOf('--viewports') || '1920x1080').split(',').map((v) => { const m = /^(\d{3,4})x(\d{3,4})$/.exec(v); if (!m) { console.error('bad viewport ' + v); process.exit(2); } return { width: +m[1], height: +m[2] }; });
const motions = (argOf('--motion') || 'normal,reduced').split(',');
/* the shared status vocabulary (Concepts/glyph-system status.json keys) */
const STATUS_KEYS = new Set(['complete', 'failed', 'mixed', 'blocked', 'info', 'working', 'idle', 'pending', 'skipped', 'warning', 'paused', 'waiting', 'reviewing', 'recovering', 'change-modified', 'change-added', 'change-deleted', 'offline', 'waiting-dep', 'off']);
const SWITCH = '#pm-settings-root .toggle[data-setting="general.visual.theme-preview"]';
mkdirSync(join(outDir, 'shots'), { recursive: true });

const results = [], pageErrors = [];
let browser = null, failedViews = 0;
const coverageStops = new Map();
async function finishCoverage(page = null) {
  for (const [p, stop] of [...coverageStops]) {
    if (page && p !== page) continue;
    coverageStops.delete(p);
    await stop();
  }
}
const pageSha = createHash('sha256').update(readFileSync(pagePath)).digest('hex');
const log = (m) => console.error('[accept] ' + m);

async function openPage(vp, motion) {
  let page;
  if (cdp) { if (!browser) browser = await chromium.connectOverCDP(cdp); const ctx = browser.contexts()[0] || await browser.newContext(); page = await ctx.newPage(); await page.setViewportSize(vp); }
  else { if (!browser) browser = await chromium.launch({ executablePath: CHROME, headless: true }); page = await browser.newPage({ viewport: vp }); }
  page.setDefaultTimeout(30000);
  if (coverageFile) coverageStops.set(page, await coverPage(page, coverageFile));
  page.on('pageerror', (e) => pageErrors.push({ vp: vp.width + 'x' + vp.height, motion, message: String((e && e.message) || e) }));
  /* offline without request interception (interception over CDP sends every inline asset through Node): Chrome blocks the network itself */
  { const s = await page.context().newCDPSession(page); await s.send('Network.enable'); await s.send('Network.setBlockedURLs', { urls: ['http://*', 'https://*', 'ws://*', 'wss://*'] }); }
  await page.emulateMedia({ reducedMotion: motion === 'reduced' ? 'reduce' : 'no-preference' });
  await page.goto(pathToFileURL(pagePath).href + '?o55=off', { waitUntil: 'load', timeout: 180000 });
  await page.waitForFunction(() => window.PM12_KIMI && window.PM_PAGES && window.PM_THEME, null, { timeout: 180000 });
  await page.waitForTimeout(1500);
  await page.evaluate(() => window.PM_PAGES.go('settings'));
  await page.waitForTimeout(900);
  const renderer = await page.evaluate(() => { const g = document.createElement('canvas').getContext('webgl'); const x = g && g.getExtension('WEBGL_debug_renderer_info'); return x ? g.getParameter(x.UNMASKED_RENDERER_WEBGL) : 'none'; });
  return { page, renderer };
}

async function setLook(page, look) {
  const nier = look.startsWith('nier'), mode = look.split('-')[1], fam = nier ? 'basic' : look.split('-')[0];
  await page.evaluate(([fam, mode, nier]) => {
    window.PM12_KIMI.setSettingFromHost('general.visual.theme', fam[0].toUpperCase() + fam.slice(1) + ' ' + mode[0].toUpperCase() + mode.slice(1));
    if (window.PM_NIER && typeof window.PM_NIER.set === 'function') window.PM_NIER.set(nier);
  }, [fam, mode, nier]);
  await page.waitForFunction(([want, nier]) => document.documentElement.dataset.theme === want && (document.documentElement.getAttribute('data-o55-nier') === 'on') === nier,
    [fam + '-' + mode, nier], { timeout: 30000 });
  await page.waitForTimeout(nier ? 3200 : 1200);
}

/* one click on the switch, sampled every painted frame for 700 ms */
async function switchClick(page) {
  return page.evaluate(async (sel) => {
    const t0 = performance.now(), el = document.querySelector(sel);
    if (!el) return { error: 'switch not found' };
    const was = el.getAttribute('aria-checked') === 'true', frames = [];
    el.click();
    await new Promise((res) => {
      const tick = () => {
        const n = document.querySelector(sel);
        if (n) {
          const a = getComputedStyle(n, '::after'), b = getComputedStyle(n, '::before');
          const m = /matrix\([^,]+,[^,]+,[^,]+,[^,]+,\s*([-\d.e]+)/.exec(a.transform);
          frames.push({ t: Math.round(performance.now() - t0), from: n.classList.contains('pm-switch-from'), x: m ? +m[1] : 0, op: +b.opacity });
        }
        if (performance.now() - t0 < 700) requestAnimationFrame(tick); else res();
      };
      requestAnimationFrame(tick);
    });
    const now = document.querySelector(sel).getAttribute('aria-checked') === 'true';
    return { was, now, frames };
  }, SWITCH);
}
function judgeSwitch(r, motion) {
  if (r.error) return { pass: false, why: r.error };
  if (r.now === r.was) return { pass: false, why: 'aria-checked did not flip' };
  const start = r.was ? 18 : 0, end = r.now ? 18 : 0, moving = r.frames.filter((f) => !f.from);
  const between = moving.filter((f) => Math.abs(f.x - 0) > 0.5 && Math.abs(f.x - 18) > 0.5).length;
  const last = r.frames[r.frames.length - 1] || { x: NaN, op: NaN };
  const landed = Math.abs(last.x - end) <= 0.5;
  if (motion === 'normal') {
    const first = r.frames[0] || {};
    const startsOld = first.from || Math.abs(first.x - start) <= 0.5;
    const pass = startsOld && between >= 1 && landed;
    return { pass, why: pass ? '' : `startsOld=${startsOld} between=${between} landed=${landed}`, between, frames: r.frames.length };
  }
  const fades = r.frames.filter((f) => f.op > 0.02 && f.op < 0.98).length;
  const finalOp = r.now ? 1 : 0;
  const opLanded = Math.abs(last.op - finalOp) <= 0.02;
  const pass = between === 0 && fades >= 1 && landed && opLanded;
  return { pass, why: pass ? '' : `between=${between} fades=${fades} landed=${landed} opLanded=${opLanded}`, fades, frames: r.frames.length };
}

async function shot(page, sel, name, pad = 10) {
  const box = await page.evaluate(([s, p]) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); if (!r.width || !r.height) return null;
    return { x: Math.max(0, r.x - p), y: Math.max(0, r.y - p), width: Math.min(innerWidth - Math.max(0, r.x - p), r.width + 2 * p), height: Math.min(innerHeight - Math.max(0, r.y - p), r.height + 2 * p) }; }, [sel, pad]);
  if (!box || box.width < 2 || box.height < 2) return null;
  const f = join(outDir, 'shots', name + '.png');
  await page.screenshot({ path: f, clip: box });
  return 'shots/' + name + '.png';
}

async function combo(page, look, vp, motion) {
  const id = `${look}-${motion}-${vp.width}x${vp.height}`, checks = {}, shots = {};
  await setLook(page, look);
  /* switch */
  await page.evaluate(() => window.PM12_KIMI.navigate('general', 'app-input'));
  await page.waitForSelector(SWITCH, { state: 'visible', timeout: 30000 });
  await page.evaluate((s) => document.querySelector(s).scrollIntoView({ block: 'center' }), SWITCH);
  await page.waitForTimeout(500);
  const a = judgeSwitch(await switchClick(page), motion);
  await page.waitForTimeout(300);
  const b = judgeSwitch(await switchClick(page), motion);
  checks.switch = { pass: a.pass && b.pass, first: a, second: b };
  await page.mouse.move(2, 2);
  shots.switch = await page.evaluate((s) => { const t = document.querySelector(s); const row = t && t.closest('.setting-row'); if (row) row.setAttribute('data-np-shot', '1'); return !!row; }, SWITCH)
    ? await shot(page, '[data-np-shot="1"]', id + '-switch', 6) : null;
  await page.evaluate(() => { const r = document.querySelector('[data-np-shot]'); if (r) r.removeAttribute('data-np-shot'); });
  /* theme menu */
  await page.click('#themeSelect', { force: true });
  await page.waitForSelector('.pm6-tt-modes', { state: 'visible', timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(450);
  const tm = await page.evaluate(() => {
    const g = document.querySelector('.pm6-tt-modes'); if (!g) return { error: 'theme menu modes not found' };
    const half = (e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return { h: r.height, r: parseFloat(cs.borderTopLeftRadius) || 0 }; };
    const radios = [...g.querySelectorAll('.pm6-tt-mode[role="radio"]')];
    const gg = half(g), cells = radios.map(half);
    return { role: g.getAttribute('role'), radios: radios.length, checked: radios.filter((r) => r.getAttribute('aria-checked') === 'true').length,
      groupOk: gg.r < gg.h / 2 - 0.5, cellsOk: cells.every((c) => c.r < c.h / 2 - 0.5), group: gg, cells };
  });
  shots.thememenu = await shot(page, '.pm6-tt-modes', id + '-thememenu', 8);
  checks.thememenu = { pass: !tm.error && tm.role === 'radiogroup' && tm.radios === 3 && tm.checked === 1 && tm.groupOk && tm.cellsOk, ...tm };
  await page.keyboard.press('Escape'); await page.waitForTimeout(350);
  checks.thememenu.closed = await page.evaluate(() => { const g = document.querySelector('.pm6-tt-modes'); if (!g) return true; const r = g.getBoundingClientRect(); return !(r.width && r.height) || getComputedStyle(g).visibility === 'hidden'; });
  if (!checks.thememenu.closed) { checks.thememenu.pass = false; await page.mouse.click(5, vp.height - 5); }
  /* providers: status slots, copy, bars */
  await page.evaluate(() => window.PM12_KIMI.navigate('ai', 'providers'));
  await page.waitForTimeout(1100);
  const pv = await page.evaluate((keys) => {
    const vis = (e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    const marks = [...document.querySelectorAll('#panel-settings .pm-status-mark')].filter(vis);
    const bad = [];
    for (const m of marks) {
      const r = m.getBoundingClientRect(), cs = getComputedStyle(m), fs = parseFloat(cs.fontSize);
      const key = m.getAttribute('data-status');
      const boxless = (cs.backgroundColor === 'rgba(0, 0, 0, 0)' || cs.backgroundColor === 'transparent') && cs.backgroundImage === 'none' && parseFloat(cs.borderTopWidth) === 0;
      const square = Math.abs(r.width - r.height) <= 1 && Math.abs(r.width - fs) <= 1.5;
      if (!keys.includes(key) || !boxless || !square) bad.push({ key, w: r.width, h: r.height, fs, bg: cs.backgroundColor });
    }
    const rows = [...document.querySelectorAll('#panel-settings .resource-row')].filter(vis).map((e) => e.innerText.replace(/\s+/g, ' ').trim());
    const claude = rows.find((t) => /\bClaude\b/.test(t) && !/Code|API/.test(t.split('·')[0])) || rows.find((t) => /\bClaude\b/.test(t)) || '';
    const tracks = [...document.querySelectorAll('#panel-settings .pm51-meter-track')].filter(vis).map((e) => parseFloat(getComputedStyle(e).borderTopLeftRadius) || 0);
    return { marks: marks.length, bad, claude, tracks: tracks.length, trackMax: tracks.length ? Math.max(...tracks) : 0 };
  }, [...STATUS_KEYS]);
  checks.status = { pass: pv.marks > 0 && pv.bad.length === 0, marks: pv.marks, bad: pv.bad.slice(0, 5) };
  checks.copy = { pass: /3 of 4 accounts/.test(pv.claude), claude: pv.claude };
  checks.bars = { pass: pv.tracks > 0 && pv.trackMax <= 1.01, tracks: pv.tracks, trackMax: pv.trackMax };
  shots.providers = await shot(page, '#provider-roster', id + '-providers', 4) || await shot(page, '#panel-settings .resource-list', id + '-providers', 4);
  const pass = Object.values(checks).every((c) => c.pass);
  return { id, look, motion, viewport: vp, pass, checks, shots };
}

async function main() {
  const t0 = Date.now(), renderers = new Set();
  for (const vp of viewports) for (const motion of motions) {
    const { page, renderer } = await openPage(vp, motion);
    renderers.add(renderer);
    log(`viewport ${vp.width}x${vp.height} motion ${motion} renderer ${renderer}`);
    for (const look of looks) {
      try { const r = await combo(page, look, vp, motion); r.renderer = renderer; results.push(r); log(`${r.id} ${r.pass ? 'PASS' : 'FAIL ' + Object.entries(r.checks).filter(([, c]) => !c.pass).map(([k, c]) => k + (c.why ? '(' + c.why + ')' : '')).join(' ')}`); }
      catch (e) { failedViews++; results.push({ id: `${look}-${motion}-${vp.width}x${vp.height}`, pass: false, error: String((e && e.message) || e).split('\n')[0] }); log('ERROR ' + look + ' ' + e.message.split('\n')[0]); }
    }
    try { await finishCoverage(page); }
    finally { await page.close().catch(() => {}); }
  }
  if (browser) { await browser.close().catch(() => {}); browser = null; }
  const failed = results.filter((r) => !r.pass);
  const report = { tool: 'settings_nopills_accept.mjs', generated_at: new Date().toISOString(), page: pagePath, page_sha256: pageSha,
    renderers: [...renderers], cdp: !!cdp, looks, viewports, motions, combinations: results.length, passed: results.length - failed.length,
    failed: failed.map((r) => r.id), failed_views: failedViews, page_errors: pageErrors, seconds: Math.round((Date.now() - t0) / 1000), results };
  writeFileSync(join(outDir, 'results.json'), JSON.stringify(report, null, 2));
  console.log(`RESULT combinations=${results.length} passed=${results.length - failed.length} failed=${failed.length} failed_views=${failedViews} page_errors=${pageErrors.length} seconds=${report.seconds} renderers=${JSON.stringify([...renderers])}`);
  process.exitCode = failedViews ? 2 : failed.length ? 1 : 0;
}
for (const sig of ['SIGINT', 'SIGTERM']) process.once(sig, async () => { try { await finishCoverage(); } catch (_) {} try { if (browser) await browser.close(); } catch (_) {} process.exit(sig === 'SIGINT' ? 130 : 143); });
main().catch(async (e) => { console.error('FATAL ' + ((e && e.stack) || e)); try { await finishCoverage(); } catch (_) {} try { if (browser) await browser.close(); } catch (_) {} process.exit(2); });
