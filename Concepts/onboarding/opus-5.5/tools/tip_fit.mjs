/* Every ? note against the window: for each look, window size and version (Plain English, Expert), every screen is
 * opened and each ? it shows is opened in turn; the note on Pip's stage (a wide window) must stay whole on the stage, and
 * the check records whether its words fit or have to scroll inside it. A note in the form (a short or narrow window)
 * scrolls with the pane, so only its width is checked there.
 *   node tools/tip_fit.mjs <out.json> [--page <path>] [--looks basic,friendly,glass,retro,nier] [--sizes 1100x760,1280x720]
 * Exit 1 when a note leaves the stage. (The pattern review, 2026-10-30: an Expert note ran off a 1080 by 720 window.) */
import { launch, sleep } from './chrome.mjs';
import { writeFileSync } from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const raw = process.argv.slice(2);
const opt = (k, d) => { const i = raw.indexOf('--' + k); return i >= 0 ? raw[i + 1] : d; };
const pageFile = resolve(opt('page', resolve(here, '../../../PMConcept7.html')));
const out = resolve(raw[0] && !raw[0].startsWith('--') ? raw[0] : '/tmp/o55/tip_fit.json');
const looks = opt('looks', 'basic,friendly,glass,retro,nier').split(',');
const sizes = opt('sizes', '1100x760,1280x720').split(',').map((s) => s.split('x').map(Number));
const rows = [];
let leaves = 0;
for (const [w, h] of sizes) {
  const { page, close } = await launch({ width: w, height: h });
  try {
    for (const look of looks) {
      await page.goto(pathToFileURL(pageFile).href + '?o55=off&o55scenario=fresh&cb=' + Date.now());
      await sleep(1200);
      await page.evaluate(async (l) => {
        const nier = l === 'nier', fam = nier ? 'basic' : l;
        window.PM_THEME.setFamily(fam, { persist: false }); window.PM_THEME.setMode('dark', { persist: false });
        try { window.PM7_SETTINGS_TOME.setChromeThemeFamily(fam); window.PM7_SETTINGS_TOME.setChromeThemeMode('dark'); } catch (_) {}
        if (window.PM_NIER) { const on = window.PM_NIER.on() || window.PM_NIER.wanted(); if (nier !== on) { window.PM_NIER.set(nier, { sound: false }); await new Promise((r) => setTimeout(r, 3200)); } }
      }, look);
      await sleep(500);
      const screens = await page.evaluate(() => Object.keys(window.O55.screens.defs));
      for (const mode of ['ELI5', 'Expert']) {
        await page.evaluate((m) => window.O55.talk.set(m, 'tip_fit'), mode);
        for (const screen of screens) {
          await page.evaluate((s) => window.O55.ui.open({ fresh: true, screen: s }), screen);
          await sleep(1300);
          const res = await page.evaluate(async (s) => {
            const sleep2 = (ms) => new Promise((r) => setTimeout(r, ms));
            const root = document.getElementById('pm-o55-onboarding'), layout = root.getAttribute('data-o55-layout');
            const L = root.querySelector(`.o55-pane > .o55-layer[data-screen="${s}"]:not(.o55-out)`);
            if (!L) return { missing: true };
            const ids = Array.from(new Set(Array.from(L.querySelectorAll('[data-o55-do="tip"]')).filter((b) => b.offsetParent).map((b) => b.getAttribute('data-arg'))));
            const got = [];
            for (const id of ids) {
              window.O55.ui.tip(id); await sleep2(160);
              const stage = root.querySelector('.o55-stage'), note = root.querySelector('.o55-stage .pst-tip.on, .o55-stage .pst-ntip.on');
              if (note && stage) {
                const sr = stage.getBoundingClientRect(), nr = note.getBoundingClientRect(), t = note.querySelector('.pst-tip-t');
                got.push({ id, where: 'stage', h: Math.round(nr.height), room: Math.round(sr.height), out: nr.top < sr.top - 1 || nr.bottom > sr.bottom + 1 || nr.left < sr.left - 1 || nr.right > sr.right + 1, scrolls: !!(t && t.scrollHeight > t.clientHeight + 1) });
              } else {
                const ex = L.querySelector('#pm7ob-explainer'), pr = L.getBoundingClientRect(), er = ex && ex.getBoundingClientRect();
                got.push({ id, where: 'form', out: !!(er && (er.left < pr.left - 1 || er.right > pr.right + 1)) });
              }
              window.O55.ui.closeTip(false); await sleep2(60);
            }
            return { layout, got };
          }, screen);
          if (res.missing) { rows.push({ look, size: `${w}x${h}`, mode, screen, missing: true }); continue; }
          for (const g of res.got) { rows.push(Object.assign({ look, size: `${w}x${h}`, mode, screen, layout: res.layout }, g)); if (g.out) leaves++; }
        }
      }
    }
  } finally { await close(); }
}
const scrolls = rows.filter((r) => r.scrolls), outs = rows.filter((r) => r.out);
writeFileSync(out, JSON.stringify({ notes: rows.length, leaves: outs.length, scrolls: scrolls.length, outs, scrolls_list: scrolls, rows }, null, 1));
console.log(JSON.stringify({ out, notes: rows.length, leave_the_window: outs.length, scroll_inside: scrolls.length, missing: rows.filter((r) => r.missing).length }));
process.exit(leaves ? 1 : 0);
