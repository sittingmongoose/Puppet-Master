#!/usr/bin/env node
/* pmx-gallery.mjs -- every pmx primitive, rendered in a scratch overlay of the real
 * app from the PM56_SHELL builders, screenshotted in all eight themes (DESIGN-SPEC 10.1
 * step 7 as amended by IMPACT A2-25: the screenshot matrix covers every theme; the design
 * lead's review may stay on the four test themes, which come first).
 *
 *   node tests/pmx-gallery.mjs --out <dir> [--file index.html] [--themes all|test|a,b]
 *        [--only sheets,chat,cards,view] [--layouts pinned,closed,activity,w391,w311,pinned-1024x768,pinned-900x800]
 *
 * The content lives in tests/pmx-surfaces/gallery.mjs (the same one pmx-verify
 * lints). Shots: every gallery sheet at 1440x900; the Crew sheet at 1280x800,
 * 1024x768, 900x800 and 700x800 and with a control hovered (hover-to-light); the
 * long-chat stack in seven transcript layouts (history pinned: 417 px cards, closed: 591,
 * Activity pinned: ~337, w391 / w311: history pinned in the window width that gives a
 * 391 / 311 px card, the canon 390-590 px narrow chat states, and pinned-1024x768 /
 * pinned-900x800: history pinned in those windows, the 230 / 204 px S-tier cards) at four
 * scroll positions; a
 * crop of every run card, the dock and the in-reply rows per layout; the run view, its
 * streaming state and the participant view. Writes <out>/gallery.json and a contact sheet
 * <out>/index.html.
 * Fails (exit 1) when a builder was never rendered (coverage), when any dashed
 * unknown-glyph square appears (G-11), or on a console or page error.
 * Never writes inside a git working tree or next to the sources.
 */
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { openApp } from './pmx-surfaces/_lib.mjs';
import { installGallery, openSheet, openChat, openView, setGallery, SHEETS } from './pmx-surfaces/gallery.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : d; };
const OUT_ARG = opt('out', null);
if (!OUT_ARG) { console.error('usage: node tests/pmx-gallery.mjs --out <dir> [--file index.html] [--themes all|test|a,b] [--only sheets,chat,cards,view] [--layouts pinned,closed,activity,w391,w311,pinned-1024x768,pinned-900x800]'); process.exit(2); }
const FILE = path.resolve(opt('file', path.join(ROOT, 'index.html')));
const ALL = ['basic-dark', 'basic-light', 'glass-dark', 'glass-light', 'retro-dark', 'retro-light', 'friendly-dark', 'friendly-light'];
/* IMPACT A2-25: all eight themes by default, the four test themes first */
const TEST = ['basic-dark', 'basic-light', 'glass-light', 'retro-dark'];
const ORDER = [...TEST, 'friendly-dark', 'friendly-light', 'glass-dark', 'retro-light'];
const THEMES = (t => t === 'all' ? ORDER : t === 'test' ? TEST : t.split(','))(opt('themes', 'all'));
for (const t of THEMES) if (!ALL.includes(t)) { console.error('pmx-gallery: unknown theme ' + t); process.exit(2); }
const ONLY = new Set((opt('only', 'sheets,chat,cards,view')).split(','));

/* never write into sources */
function nearestExisting(p) { let d = path.resolve(p); while (!fs.existsSync(d)) { const up = path.dirname(d); if (up === d) break; d = up; } return d; }
function guardOut(p) {
  const abs = path.resolve(p);
  for (let d = fs.realpathSync(nearestExisting(abs)); ; d = path.dirname(d)) { if (fs.existsSync(path.join(d, '.git'))) throw new Error('refusing to write ' + abs + ': inside the git working tree ' + d); if (path.dirname(d) === d) break; }
  const real = path.join(fs.realpathSync(nearestExisting(abs)), path.relative(nearestExisting(abs), abs));
  for (const n of ['module-shell.js', 'app.js', 'build.py']) { try { const d = path.dirname(fs.realpathSync(path.join(ROOT, n))); if (real === d || real.startsWith(d + path.sep)) throw new Error('refusing to write ' + abs + ': inside the source folder ' + d); } catch (e) { if (/refusing/.test(e.message)) throw e; } }
  return abs;
}
let OUT;
try { OUT = guardOut(OUT_ARG); } catch (e) { console.error('pmx-gallery: ' + e.message); process.exit(2); }
fs.mkdirSync(OUT, { recursive: true });

const shots = [], problems = [];
const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--allow-file-access-from-files'] });
const { page, h, errors } = await openApp(browser, FILE);
await installGallery(h);

async function missing(where) {
  const n = await h.ev(() => [...document.querySelectorAll('.pmx-glyph-missing')].filter(e => !e.closest('.pmx-ghost')).map(e => e.getAttribute('data-glyph')));
  if (n.length) problems.push({ where, missingGlyphs: n });
}
async function shot(file, meta, locator, clip) {
  const p = path.join(OUT, file);
  if (locator) await locator.screenshot({ path: p, timeout: 8000 }); else await page.screenshot(clip ? { path: p, clip } : { path: p });
  shots.push(Object.assign({ file }, meta));
  await missing(file);
}
const LAYOUT_LABEL = { pinned: 'history pinned (417 px card)', closed: 'history closed (591 px card)', activity: 'Activity pinned (~337 px card)',
  w391: 'history pinned, window sized for a 391 px card', w311: 'history pinned, window sized for a 311 px card',
  'pinned-1024x768': 'history pinned at 1024x768 (S tier, ~230 px card)', 'pinned-900x800': 'history pinned at 900x800 (S tier, ~204 px card)' };
const LAYOUTS = opt('layouts', 'pinned,closed,activity,w391,w311,pinned-1024x768,pinned-900x800').split(',').map(l => [l, LAYOUT_LABEL[l] || l]);
const vpSize = () => { const v = page.viewportSize(); return v.width + 'x' + v.height; };

for (const theme of THEMES) {
  await h.theme(theme);
  if (ONLY.has('sheets')) {
    for (const sd of SHEETS) {
      await h.setSize(1440, 900);
      await openSheet(h, sd);
      await shot(`g-${sd.id}-${theme}.png`, { group: 'sheets', theme, what: sd.title, size: '1440x900' });
      if (sd.id === 'sheet-specimens') {
        /* every plate the specimens draw, one crop each: the atoms and each Crew plate mode on its own (a sheet's
           fit slot shows only the mode that fits, so these are the only shots of the others) */
        const keys = await h.ev(() => [...document.querySelectorAll('#pmOverlayRoot figure.pmx-plate[data-k]')].map(f => f.getAttribute('data-k')));
        for (const k of keys) {
          try {
            const loc = page.locator(`#pmOverlayRoot figure.pmx-plate[data-k="${k}"]`).first();
            await loc.scrollIntoViewIfNeeded({ timeout: 5000 }); await h.wait(200);
            await shot(`g-${sd.id}-plate-${k}-${theme}.png`, { group: 'sheets', theme, what: 'plate ' + k, size: 'crop' }, loc);
          } catch (e) { problems.push({ where: 'plate ' + k + ' ' + theme, harness: String(e.message || e).split('\n')[0] }); }
        }
      }
      if (sd.id === 'sheet-crew-3') {
        await page.hover('#pmOverlayRoot .pmx-stepper .pmx-step[data-delta="1"]'); await h.wait(320);
        await shot(`g-${sd.id}-hover-parallel-${theme}.png`, { group: 'sheets', theme, what: sd.title + ' · hovering "Working at the same time" (hover-to-light)', size: '1440x900' });
        await page.mouse.move(4, 4); await h.wait(200);
        for (const [w, hh] of [[1280, 800], [1024, 768], [900, 800], [700, 800]]) {
          await h.setSize(w, hh); await h.settle();
          await shot(`g-${sd.id}-${theme}-${w}x${hh}.png`, { group: 'sheets', theme, what: sd.title, size: w + 'x' + hh });
        }
        await h.setSize(1440, 900);
      }
      await h.closeAll();
    }
  }
  if (ONLY.has('chat') || ONLY.has('cards')) {
    for (const [layout, label] of LAYOUTS) {
      await h.setSize(1440, 900);
      await h.chatLayout(layout);
      await openChat(h, { items: 'stack', dock: true, guide: true });
      if (ONLY.has('chat')) {
        for (const [i, frac] of [[0, 0], [1, 1 / 3], [2, 2 / 3], [3, 1]].map(([i, f]) => [String.fromCharCode(97 + i), f])) {
          await h.ev(f => { const t = document.querySelector('.transcript'); t.style.scrollBehavior = 'auto'; t.scrollTop = Math.round((t.scrollHeight - t.clientHeight) * f); }, frac);
          await h.wait(700); /* the dock shows a run's line 400 ms after its card leaves view (G-10) */
          await shot(`g-chat-${layout}-${theme}-${i}.png`, { group: 'chat', theme, layout, what: 'long-chat stack · ' + label + (h.cardFit ? ' (' + h.cardFit.cw + ' px)' : '') + ' · scroll ' + Math.round(frac * 100) + '%', size: vpSize() });
        }
      }
      if (ONLY.has('cards')) {
        /* crops by position in a fixed selector list (the engine re-syncs attributes, so nothing is tagged). The dock and
           the guide are off while the items are cropped (review cycle 2: with both on, the transcript is 412 px tall at
           1440x900 and 188 px at 900x800, so a 379 px card could not be shown whole and its crop took in the thread
           header or the composer); the dock gets its own crop after, with both back on. */
        await setGallery(h, { dock: false, guide: false }); await h.settle();
        const SEL = '.transcript .pmx-run, .transcript .pmx-note, .transcript .pmx-gallery-row, .transcript .pmx-divider, .transcript .pmx-gallery-md';
        const items = await h.ev(sel => [...document.querySelectorAll(sel)].map((e, i) => ({ i, k: e.getAttribute('data-k') || e.className.split(' ')[0], d: e.getAttribute('data-density') || e.className.split(' ')[0].replace('pmx-', ''), w: Math.round(e.getBoundingClientRect().width), h: Math.round(e.getBoundingClientRect().height) })), SEL);
        for (const it of items) {
          const loc = page.locator(SEL).nth(it.i);
          try {
            /* centred in the transcript, not merely in view: a card at the top edge sat under the thread header
               in the crop (review cycle 2) */
            await loc.evaluate(e => e.scrollIntoView({ block: 'center', behavior: 'instant' })); await h.wait(160);
            /* an item taller than the transcript's visible box is cropped to that box and labelled partial (a plain
               element shot would take in whatever lies over the rest of it) */
            const vis = await loc.evaluate(e => {
              const r = e.getBoundingClientRect(), t = e.closest('.transcript'), tr = t ? t.getBoundingClientRect() : { top: 0, bottom: innerHeight };
              const top = Math.max(r.top, tr.top, 0), bottom = Math.min(r.bottom, tr.bottom, innerHeight), left = Math.max(0, r.left);
              return { full: r.top >= tr.top - 0.5 && r.bottom <= tr.bottom + 0.5, clip: { x: left, y: top, width: Math.max(1, Math.min(r.right, innerWidth) - left), height: Math.max(1, bottom - top) } };
            });
            const meta = { group: 'cards', theme, layout, what: it.d + ' · ' + it.k + ' · ' + it.w + ' x ' + it.h + (vis.full ? '' : ' (partial: taller than the transcript here)'), size: it.w + 'x' + it.h };
            const file = `g-card-${layout}-${theme}-${String(it.i).padStart(2, '0')}-${it.d}.png`;
            if (vis.full) await shot(file, meta, loc); else await shot(file, meta, null, vis.clip);
          } catch (e) { problems.push({ where: 'crop ' + it.k + ' ' + layout + ' ' + theme, harness: String(e.message || e).split('\n')[0] }); }
        }
        await setGallery(h, { dock: true, guide: true }); await h.settle();
        const hasDock = await h.ev(() => !!document.querySelector('.pmx-dock'));
        if (hasDock) {
          await h.ev(() => { const t = document.querySelector('.transcript'); t.scrollTop = 0; }); await h.wait(700);
          const dock = page.locator('.pmx-dock').first();
          if (await dock.isVisible()) await shot(`g-dock-${layout}-${theme}.png`, { group: 'cards', theme, layout, what: 'dock (needs you first, three lines + overflow)' }, dock);
        }
      }
    }
  }
  if (ONLY.has('view')) {
    await h.setSize(1440, 900);
    await h.chatLayout('pinned');
    await openView(h, 'pmx-gallery-view');
    await shot(`g-view-${theme}.png`, { group: 'view', theme, what: 'run view: plate, tabs, timeline, team', size: '1440x900' });
    await h.ev(() => { const v = document.querySelector('.pmx-view'); const sc = v && (v.closest('.editor-body') || v.parentElement); if (sc) sc.scrollTop = sc.scrollHeight; }); await h.wait(250);
    await shot(`g-view-end-${theme}.png`, { group: 'view', theme, what: 'run view scrolled to its end', size: '1440x900' });
    await openView(h, 'pmx-gallery-participant');
    await shot(`g-view-participant-${theme}.png`, { group: 'view', theme, what: 'participant view (D5)', size: '1440x900' });
    await h.ev(() => { const c = window.PM56_EXT.ctx(); c.closeEditor('pmx-gallery-participant'); c.closeEditor('pmx-gallery-view'); });
    await h.wait(250);
  }
}
/* the streaming state once, in the first theme */
if (ONLY.has('view') || ONLY.has('chat')) {
  await h.theme(THEMES[0]);
  await h.setSize(1440, 900); await h.chatLayout('pinned');
  const { longMarkdown } = await import('./pmx-surfaces/_lib.mjs');
  await openChat(h, { items: 'stack' });
  await setGallery(h, { stream: longMarkdown() }); await h.settle();
  await h.ev(() => { const c = document.querySelector('[data-k="collab-card-g3"]'); if (c) c.scrollIntoView({ block: 'center', behavior: 'instant' }); }); await h.wait(300);
  await shot(`g-stream-card-${THEMES[0]}.png`, { group: 'view', theme: THEMES[0], what: 'streaming realism: 1,500-word message in a live lane and a result card', size: '1440x900' });
  await openView(h, 'pmx-gallery-view');
  await h.ev(() => { const p = document.querySelector('.pmx-view pre'); if (p) p.scrollIntoView({ block: 'center', behavior: 'instant' }); }); await h.wait(250);
  await shot(`g-stream-view-${THEMES[0]}.png`, { group: 'view', theme: THEMES[0], what: 'streaming realism: the run view renders the code in <pre> and the table in its own scroller', size: '1440x900' });
}

const uncovered = await h.ev(() => window.__PMXG.uncovered());
await browser.close();
const report = { tool: 'pmx-gallery', file: FILE, themes: THEMES, shots, uncovered, problems, errors };
fs.writeFileSync(path.join(OUT, 'gallery.json'), JSON.stringify(report, null, 1));

/* contact sheet */
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const groups = {};
for (const s of shots) (groups[s.group + ' · ' + s.theme] = groups[s.group + ' · ' + s.theme] || []).push(s);
fs.writeFileSync(path.join(OUT, 'index.html'), `<!doctype html><meta charset="utf-8"><title>pmx gallery</title>
<style>body{margin:0;padding:24px;background:#111114;color:#ddd;font:13px/1.4 system-ui,sans-serif}h2{font-weight:600;margin:28px 0 10px}figure{display:inline-block;vertical-align:top;margin:0 14px 18px 0;max-width:720px}figure img{max-width:720px;border:1px solid #333}figcaption{color:#999;margin-top:4px}</style>
<h1>pmx gallery</h1><p>${esc(FILE)} · ${shots.length} shots · uncovered builders: ${esc(uncovered.join(', ') || 'none')} · problems: ${problems.length} · errors: ${errors.length}</p>
${Object.entries(groups).map(([g, list]) => `<h2>${esc(g)}</h2>` + list.map(s => `<figure><a href="${esc(s.file)}"><img loading="lazy" src="${esc(s.file)}"></a><figcaption>${esc(s.what)}${s.size ? ' · ' + esc(s.size) : ''}</figcaption></figure>`).join('')).join('\n')}`);

console.log(`pmx-gallery: ${shots.length} shots in ${OUT}`);
console.log('coverage: ' + (uncovered.length ? 'NOT rendered: ' + uncovered.join(', ') : 'every pmx builder rendered'));
if (problems.length) console.log('problems: ' + JSON.stringify(problems).slice(0, 800));
if (errors.length) console.log('errors: ' + JSON.stringify(errors).slice(0, 800));
process.exit(uncovered.length || problems.length || errors.length ? 1 : 0);
