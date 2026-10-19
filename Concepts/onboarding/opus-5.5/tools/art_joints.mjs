/* The troupe's joints and strings, measured on the live page (2026-10-13, connected-limb rigs).
 *   node tools/art_joints.mjs <page> --cdp <endpoint> [--looks basic,friendly,glass,retro] [--modes dark,light]
 *        [--screens welcome,where,begin,name,ai,free,ready] [--reduced] [--poses 30] [--out <dir>] [--coverage <file>]
 * For every look, mode and screen with a troupe, after the scene settles it takes --poses poses: the troupe moves for a
 * random 180-420 ms, the motion clock is held (O55.motion.setTimeScale(0)) and, two rig frames later, it measures
 *   - every string's two ends against the hook points they hang from (A.rig.gaps, scene units): a hand on a forearm that
 *     bends at the elbow has to keep its string through the bend. (Measuring a moving troupe between two rig frames
 *     reads its travel in one frame as a gap, so each pose is measured held);
 *   - every waving forearm's bend (the .o55-fore's rotation): it moves in normal motion and holds still under Reduced
 *     Motion (no idle motion);
 *   - errors thrown on the page.
 * Pass: every gap at most 0.6 units (Retro 0.75: it rounds both ends of a string to whole pixels), every forearm bending
 * by at least 2 degrees across the poses in normal motion and by at most 0.01 degrees under Reduced Motion, no page
 * error. Writes <out>/joints.json; exits 1 on any failure.
 * --cdp drives an existing GPU browser (a gpu-browser or agent-browser session; this tool never launches one). */
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { coverPage, takeCoverageFlag } from './coverage_union.mjs';

const require = createRequire(join(process.env.PM_PLAYWRIGHT_DIR || '/home/sittingmongoose/pmt-dev/pw/', 'noop.js'));
const { chromium } = require('playwright-core');
const argv = process.argv.slice(2);
const coverageFile = takeCoverageFlag(argv);
const opt = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : d; };
const page0 = argv[0] && !argv[0].startsWith('--') ? argv[0] : null;
const cdp = opt('cdp');
if (!page0 || !cdp) { console.error('usage: art_joints.mjs <page path or url> --cdp <endpoint> [...]'); process.exit(2); }
const url = /^https?:|^file:/.test(page0) ? page0 : pathToFileURL(resolve(page0)).href;
const looks = opt('looks', 'basic,friendly,glass,retro').split(','), modes = opt('modes', 'dark,light').split(',');
const screens = opt('screens', 'welcome,where,begin,name,ai,free,ready').split(',');
const reduced = argv.includes('--reduced'), poses = Number(opt('poses', '30'));
const out = resolve(opt('out', '/tmp/o55/art-joints')); mkdirSync(out, { recursive: true });
const GAP = 0.6, GAP_RETRO = 0.75, BEND_MIN = 2, BEND_STILL = 0.01;

const browser = await chromium.connectOverCDP(cdp);
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: reduced ? 'reduce' : 'no-preference' });
const page = await ctx.newPage();
const finishCoverage = coverageFile ? await coverPage(page, coverageFile) : null;
const errors = [];
page.on('pageerror', (e) => errors.push(String(e && e.message || e).slice(0, 300)));
const rows = [];
let failed = 0;
try {
  for (const look of looks) for (const mode of modes) {
    await page.emulateMedia({ colorScheme: mode, reducedMotion: reduced ? 'reduce' : 'no-preference' });
    await page.goto(url + (url.includes('?') ? '&' : '?') + 'o55=off&o55scenario=fresh', { waitUntil: 'load', timeout: 120000 });
    await page.waitForFunction(() => !!(window.O55 && window.O55.ui && window.PM_THEME), null, { timeout: 120000 });
    await page.evaluate(async ([f, m]) => {
      if (window.PM_NIER && (window.PM_NIER.on() || window.PM_NIER.wanted())) { window.PM_NIER.set(false, { sound: false }); await new Promise((r) => setTimeout(r, 3000)); }
      window.PM_THEME.setFamily(f, { persist: false }); window.PM_THEME.setMode(m, { persist: false });
      localStorage.removeItem('pm.o55.onboarding.v1'); window.O55.ui.open({ fresh: true });
    }, [look, mode]);
    await page.waitForFunction(() => !!(window.O55.S && window.O55.S.sess), null, { timeout: 60000 });
    for (const sc of screens) {
      const row = { look, mode, screen: sc, reduced, maxGap: 0, ties: 0, forearms: [], ok: true, notes: [] };
      try { await page.evaluate((id) => { if (window.O55.S.sess.screen !== id) window.O55.ui.go(id, { silent: true }); }, sc); }
      catch (e) { row.notes.push('unreachable by go(): ' + String(e.message).slice(0, 120)); rows.push(row); continue; }
      /* the scene's entrance and any one-shot performance (the curtain call's bow, a cheer) finish first: holding the motion
         clock pauses a performance's timers while its own animations play on, which would measure a pose no frame shows */
      await page.waitForTimeout(2600);
      await page.waitForFunction(() => { const svg = document.querySelector('#pm-o55-onboarding .o55-stage .o55-scene-wrap:not(.o55-out) svg'); if (!svg) return true;
        return !svg.getAnimations({ subtree: true }).some((a) => a.playState === 'running' && a.effect && a.effect.getTiming().iterations !== Infinity); }, null, { timeout: 12000, polling: 200 }).catch(() => row.notes.push('one-shot animations still running after 12 s'));
      await page.waitForTimeout(1600);
      const samples = await page.evaluate(async (n) => {
        const svg = document.querySelector('#pm-o55-onboarding .o55-stage .o55-scene-wrap:not(.o55-out) svg');
        if (!svg || !window.O55.art.rig) return null;
        const M = window.O55.motion, wait = (ms) => new Promise((r) => M.real.setTimeout(r, ms));
        const rot = (el) => { const m = /rotate\(\s*(-?[\d.]+)/.exec(el.getAttribute('transform') || ''); return m ? +m[1] : 0; };
        const fores = [...svg.querySelectorAll('.o55-fore')], s = [];
        try {
          for (let i = 0; i < n; i++) {
            M.setTimeScale(1); await wait(180 + Math.random() * 240);
            M.setTimeScale(0); await wait(160);
            const g = window.O55.art.rig.gaps(svg) || [];
            s.push({ gaps: g.map((x) => Math.max(x.start, x.end)), hands: g.filter((x) => x.hand).length, fore: fores.map(rot) });
          }
        } finally { M.setTimeScale(1); }
        return { s, fores: fores.length };
      }, poses);
      if (!samples) { row.notes.push('no live scene'); rows.push(row); continue; }
      row.ties = samples.s[0].gaps.length;
      row.maxGap = Math.max(0, ...samples.s.flatMap((x) => x.gaps));
      for (let i = 0; i < samples.fores; i++) { const a = samples.s.map((x) => x.fore[i]); row.forearms.push({ min: Math.min(...a), max: Math.max(...a), range: Math.max(...a) - Math.min(...a) }); }
      if (row.maxGap > (look === 'retro' ? GAP_RETRO : GAP)) { row.ok = false; row.notes.push(`a string end left its hook by ${row.maxGap.toFixed(2)} units`); }
      for (const f of row.forearms) {
        /* (Retro's sprites have no forearm; a scene whose waving helper is not tied has a forearm the rig never drives) */
        if (!reduced && f.range < BEND_MIN && samples.s[0].hands) { row.ok = false; row.notes.push(`a forearm bent only ${f.range.toFixed(2)} degrees`); }
        if (reduced && f.range > BEND_STILL) { row.ok = false; row.notes.push(`a forearm moved ${f.range.toFixed(3)} degrees under Reduced Motion`); }
      }
      if (!row.ok) failed++;
      rows.push(row);
      console.log(`${row.ok ? 'PASS' : 'FAIL'} ${look}-${mode} ${sc}${reduced ? ' (reduced)' : ''}: ties ${row.ties}, max gap ${row.maxGap.toFixed(3)}, forearms ${row.forearms.map((f) => f.range.toFixed(1)).join('/') || '-'}${row.notes.length ? ' | ' + row.notes.join('; ') : ''}`);
    }
  }
} finally {
  const renderer = await page.evaluate(() => { try { const g = document.createElement('canvas').getContext('webgl'); const d = g.getExtension('WEBGL_debug_renderer_info'); return g.getParameter(d.UNMASKED_RENDERER_WEBGL); } catch (_) { return null; } }).catch(() => null);
  if (errors.length) failed++;
  writeFileSync(join(out, 'joints.json'), JSON.stringify({ url, reduced, poses, renderer, thresholds: { gap: GAP, gapRetro: GAP_RETRO, bendMin: BEND_MIN, bendStill: BEND_STILL }, failed, errors, rows }, null, 2));
  try { if (finishCoverage) await finishCoverage(); }
  finally {
    await ctx.close().catch(() => {});
    await browser.close().catch(() => {}); /* over CDP this only disconnects; the session's owner stops it */
  }
}
console.log(JSON.stringify({ rows: rows.length, failed, errors: errors.slice(0, 5) }));
process.exit(failed ? 1 : 0);
