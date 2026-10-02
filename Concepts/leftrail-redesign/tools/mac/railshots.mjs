/* railshots.mjs — settled screenshots of the rail on the Mac GPU, for review.
 *   node railshots.mjs --html index.html --out shots [--concepts a,b,c,current] [--themes basic-dark,...|all]
 *        [--panels files,source,docker] [--size 1440x900] [--nier] [--expanded] [--scene scene.mjs]
 * One PNG per concept x theme x panel: <concept>-<theme>-<panel>.png, clipped to the activity bar + side panel (+ the
 * Lens when one is open). --nier adds NieR Mode light and dark. --expanded also shoots the expanded activity bar.
 * --scene runs a module's `steps` ([{ name, run: async (pm, ctx) => {} }]) after each panel opens and shoots each step
 * as <concept>-<theme>-<panel>-<step>.png. Media is review evidence only: delete it when finished. */
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { openPage } from './railkit.mjs';

const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : d; };
const has = (k) => argv.includes('--' + k);
const HTML = path.resolve(opt('html', 'index.html'));
const OUT = path.resolve(opt('out', 'shots'));
const ALL = ['basic-dark', 'basic-light', 'friendly-dark', 'friendly-light', 'glass-dark', 'glass-light', 'retro-dark', 'retro-light'];
const THEMES = opt('themes', 'all') === 'all' ? ALL : opt('themes').split(',');
const CONCEPTS = opt('concepts', 'a,b,c').split(',');
const PANELS = opt('panels', 'files,source,docker').split(',');
const [W, H] = opt('size', '1440x900').split('x').map(Number);
const scene = opt('scene') ? (await import(pathToFileURL(path.resolve(opt('scene'))).href)).default : null;
fs.mkdirSync(OUT, { recursive: true });

const pm = await openPage(HTML, { width: W, height: H });
const runs = THEMES.map((t) => ({ t, nier: false })).concat(has('nier') ? [{ t: 'basic-dark', nier: true }, { t: 'basic-light', nier: true }] : []);
let n = 0;
try {
  for (const c of CONCEPTS) {
    await pm.concept(c);
    for (const { t, nier } of runs) {
      await pm.theme(t, nier);
      const tk = t + (nier ? '-nier' : '');
      for (const p of PANELS) {
        await pm.panel(p);
        await pm.page.screenshot({ path: path.join(OUT, `${c}-${tk}-${p}.png`), clip: await pm.railClip(0) }); n++;
        if (scene && scene.steps) {
          for (const st of scene.steps) {
            try { await st.run(pm, { concept: c, theme: tk, panel: p }); } catch (e) { pm.errors.push('scene ' + st.name + ': ' + String(e).slice(0, 200)); }
            await pm.wait(st.settle || 700);
            await pm.page.screenshot({ path: path.join(OUT, `${c}-${tk}-${p}-${st.name}.png`), clip: await pm.railClip(st.extra || 0) }); n++;
          }
          await pm.ev(() => { window.PMR.menu.closeAll(); window.PMR.host.setConcept(window.PMR.concepts.current(), { force: true }); });
          await pm.wait(500);
        }
      }
      if (has('expanded')) {
        await pm.expandBar(true);
        await pm.page.screenshot({ path: path.join(OUT, `${c}-${tk}-bar-expanded.png`), clip: await pm.railClip(0) }); n++;
        await pm.expandBar(false);
      }
    }
  }
} finally {
  console.log(JSON.stringify({ out: OUT, shots: n, errors: pm.errors.slice(0, 8) }));
  await pm.browser.close();
}
