// TASK 1b — History flyout clip-path insets: independent A/B with a NOISE FLOOR
// and two positive controls, because "3.2 luminance units" means nothing without one.
import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import fs from 'fs';
const S = '/tmp/claude-1000/-mnt-Cursor-PuppetMaster/6b56d129-8eab-4a4f-bf02-133b45afc809/scratchpad/w5v2';
const TARGET = process.argv[2] || (S + '/snap/index.html');
const b = await chromium.launch({ headless: true, args: ['--disable-gpu','--allow-file-access-from-files','--no-sandbox'] });
const p = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
await p.goto(pathToFileURL(TARGET).href, { waitUntil: 'load' });
await p.waitForFunction(() => window.__PM56_BOOT_OK === true);

// open the drawer UNPINNED (pinned sets box-shadow:none, so pinned cannot test the claim)
let st = '';
for (let i = 0; i < 4; i++) {
  st = await p.evaluate(() => document.body.dataset.phDrawer || '');
  if (st === 'open') break;
  if (st === 'pinned') { await p.evaluate(() => window.PM56_EXT._actions['unpin-history']({}, null, null)); }
  else { await p.evaluate(() => window.PM56_EXT._actions['toggle-history']({}, null, null)); }
  await p.waitForTimeout(700);
}
st = await p.evaluate(() => document.body.dataset.phDrawer || '');
console.log('drawer state:', st);
if (st !== 'open') { console.log('FATAL: could not reach unpinned open state'); await b.close(); process.exit(1); }

// freeze transitions for EVERY condition, including the shipped one
await p.addStyleTag({ content: '.history-flyout{transition:none!important;animation:none!important}' });
await p.waitForTimeout(200);

const geom = await p.evaluate(() => {
  const f = document.querySelector('.history-flyout'); const r = f.getBoundingClientRect();
  const cs = getComputedStyle(f);
  return { x: r.x, y: r.y, w: r.width, h: r.height, clip: cs.clipPath, shadow: cs.boxShadow };
});
console.log('geom', JSON.stringify(geom));

const RIGHT = Math.round(geom.x + geom.w);
// near strip: 0..70px right of the drawer edge.  far strip: 300..370px right (no shadow can reach)
const clipNear = { x: RIGHT + 1, y: Math.round(geom.y + 120), width: 70, height: 400 };
const clipFar  = { x: RIGHT + 300, y: Math.round(geom.y + 120), width: 70, height: 400 };

let styleHandle = null;
async function condition(name, css) {
  if (styleHandle) { await p.evaluate((h) => { const e = document.getElementById(h); if (e) e.remove(); }, 'w5v2cond'); styleHandle = null; }
  if (css) { await p.evaluate((c) => { const s = document.createElement('style'); s.id = 'w5v2cond'; s.textContent = c; document.head.appendChild(s); }, css); styleHandle = 'w5v2cond'; }
  await p.waitForTimeout(350);
  const g2 = await p.evaluate(() => { const f = document.querySelector('.history-flyout'); const r = f.getBoundingClientRect(); const cs = getComputedStyle(f); return { x: +r.x.toFixed(2), w: +r.width.toFixed(2), clip: cs.clipPath, shadow: cs.boxShadow }; });
  const near = await p.screenshot({ clip: clipNear });
  const far = await p.screenshot({ clip: clipFar });
  return { name, g2, near: near.toString('base64'), far: far.toString('base64') };
}

const conds = [];
conds.push(await condition('A_shipped', null));
conds.push(await condition('A2_shipped_again', null));
conds.push(await condition('B_inset0', '.history-flyout{clip-path:inset(0px)!important}'));
conds.push(await condition('C_clip_none', '.history-flyout{clip-path:none!important}'));
conds.push(await condition('D_shipped_noshadow', '.history-flyout{box-shadow:none!important}'));
conds.push(await condition('A3_shipped_again', null));

// decode all strips in-page: per-column mean luminance
const cols = await p.evaluate(async ([items]) => {
  const out = {};
  for (const it of items) {
    out[it.name] = {};
    for (const k of ['near','far']) {
      const im = new Image(); im.src = 'data:image/png;base64,' + it[k]; await im.decode();
      const c = document.createElement('canvas'); c.width = im.width; c.height = im.height;
      const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(im, 0, 0);
      const d = g.getImageData(0, 0, im.width, im.height).data;
      const per = [];
      for (let x = 0; x < im.width; x++) {
        let s = 0;
        for (let y = 0; y < im.height; y++) { const i = (y * im.width + x) * 4; s += 0.2126*d[i] + 0.7152*d[i+1] + 0.0722*d[i+2]; }
        per.push(+(s / im.height).toFixed(3));
      }
      out[it.name][k] = per;
    }
  }
  return out;
}, [conds]);

const mean = a => a.reduce((x,y)=>x+y,0)/a.length;
const rep = { geom, clipNear, clipFar, conditions: {} };
for (const c of conds) rep.conditions[c.name] = { g2: c.g2, nearMean: +mean(cols[c.name].near).toFixed(3), farMean: +mean(cols[c.name].far).toFixed(3), nearCols: cols[c.name].near };
const N = n => rep.conditions[n].nearMean, F = n => rep.conditions[n].farMean;
rep.deltas = {
  'NOISE FLOOR A vs A2 (near)': +(N('A2_shipped_again') - N('A_shipped')).toFixed(3),
  'NOISE FLOOR A vs A3 (near)': +(N('A3_shipped_again') - N('A_shipped')).toFixed(3),
  'B inset(0) vs A (near)': +(N('B_inset0') - N('A_shipped')).toFixed(3),
  'C clip:none vs A (near)': +(N('C_clip_none') - N('A_shipped')).toFixed(3),
  'D no-shadow vs A (near)': +(N('D_shipped_noshadow') - N('A_shipped')).toFixed(3),
  'B vs D (near) — should be ~0 if the delta IS the shadow': +(N('B_inset0') - N('D_shipped_noshadow')).toFixed(3),
  'FAR CONTROL B vs A': +(F('B_inset0') - F('A_shipped')).toFixed(3),
  'FAR CONTROL D vs A': +(F('D_shipped_noshadow') - F('A_shipped')).toFixed(3),
};
rep.perColumnDelta_B_minus_A = cols['B_inset0'].near.map((v,i)=>+(v - cols['A_shipped'].near[i]).toFixed(2));
rep.perColumnDelta_D_minus_A = cols['D_shipped_noshadow'].near.map((v,i)=>+(v - cols['A_shipped'].near[i]).toFixed(2));
rep.perColumnDelta_A2_minus_A = cols['A2_shipped_again'].near.map((v,i)=>+(v - cols['A_shipped'].near[i]).toFixed(2));
fs.writeFileSync(S + '/clipab.json', JSON.stringify(rep, null, 1));
console.log(JSON.stringify({ deltas: rep.deltas, means: Object.fromEntries(conds.map(c=>[c.name,[rep.conditions[c.name].nearMean, rep.conditions[c.name].farMean, rep.conditions[c.name].g2.clip.slice(0,40), rep.conditions[c.name].g2.shadow.slice(0,30)]])) }, null, 1));
console.log('per-col B-A :', rep.perColumnDelta_B_minus_A.filter((_,i)=>i%5===0).join(' '));
console.log('per-col D-A :', rep.perColumnDelta_D_minus_A.filter((_,i)=>i%5===0).join(' '));
console.log('per-col A2-A:', rep.perColumnDelta_A2_minus_A.filter((_,i)=>i%5===0).join(' '));
await b.close();
