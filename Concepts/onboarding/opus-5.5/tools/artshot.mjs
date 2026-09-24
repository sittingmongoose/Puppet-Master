/* Screenshot the art lab pages (settled frames) for vision review.
 * Usage: node tools/artshot.mjs <artlab-dir> <out-dir> [families=basic,friendly,glass,retro] [cellWidth=390] [waitMs=3800] */
import { launch, sleep } from '../../../pm7-tools/verify/pm_cdp.mjs';
import { mkdirSync, readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve, join } from 'node:path';

const lab = resolve(process.argv[2] || '/tmp/o55/artlab');
const out = resolve(process.argv[3] || '/tmp/o55/artshots');
const fams = (process.argv[4] || 'basic,friendly,glass,retro').split(',');
const cw = Number(process.argv[5] || 390), wait = Number(process.argv[6] || 3800);
mkdirSync(out, { recursive: true });
for (const fam of fams) {
  const html = readFileSync(join(lab, `${fam}.html`), 'utf8');
  const rows = (html.match(/rows=(\[[^\]]*\])/) || [])[1];
  const n = rows ? JSON.parse(rows).length : 8;
  const cols = fam === 'all' ? 8 : 2;
  const width = cols * cw + (cols + 1) * 10, height = n * Math.round(cw * 1.54) + (n + 1) * 10;
  const { page, close } = await launch({ width, height });
  try {
    await page.goto(pathToFileURL(join(lab, `${fam}.html`)).href + `?cw=${cw}`);
    await page.evaluate((w) => document.documentElement.style.setProperty('--cw', w + 'px'), cw);
    await sleep(wait);
    await page.evaluate(() => document.body.setAttribute('data-o55-ambient', 'off'));
    await sleep(200);
    const file = join(out, `${fam}.png`);
    await page.screenshot(file);
    console.log(file, page.errors.length ? page.errors.slice(0, 3) : 'ok');
  } finally { await close(); }
}
