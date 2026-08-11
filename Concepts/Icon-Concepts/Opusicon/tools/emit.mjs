/* ============================================================================
   Opusicon / tools/emit.mjs
   Writes every SVG asset to disk from pm-core.js.

   pm-core.js is a CLASSIC script (so index.html can load it under file://),
   so it is evaluated here with node:vm rather than imported. That keeps ONE
   generator for both the dashboard preview and the files on disk.

     node tools/emit.mjs
   ============================================================================ */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');

vm.runInThisContext(readFileSync(join(ROOT, 'pm-core.js'), 'utf8'), { filename: 'pm-core.js' });
const PM = globalThis.PMCore;

let count = 0;
const put = (rel, text) => {
  const p = join(ROOT, rel);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, text, 'utf8');
  count++;
};

/* -- 1. static: 8 themes x 2 polarities x 3 tiers ------------------------- */
for (const t of PM.THEMES) {
  for (const pol of ['ground', 'flood']) {
    for (const tier of ['micro', 'small', 'full']) {
      put(`static/pm-${t.slug}-${pol}-${tier}.svg`,
        PM.buildSVG({ theme: t.slug, form: 'tile', polarity: pol, tier, size: 512 }));
    }
  }
  // title-bar mark: no tile, accent ink, small tier (the 24-48px slot)
  put(`static/mark-${t.slug}.svg`,
    PM.buildSVG({ theme: t.slug, form: 'mark', tier: 'small', size: 128 }));
  // lockup
  put(`static/lockup-${t.slug}.svg`, PM.buildLockup({ theme: t.slug, size: 64 }));
}

/* -- 2. animated: 8 motions x 8 themes ------------------------------------ */
for (const m of PM.MOTIONS) {
  for (const t of PM.THEMES) {
    put(`animated/loading-${m.id}-${t.slug}.svg`,
      PM.buildSVG({ theme: t.slug, form: 'tile', polarity: 'ground', tier: 'full', size: 256, motion: m.id }));
  }
}

/* -- 3. mono masters (alpha masks -- Slint colorize tints these) ---------- */
put('mono/mark-full.svg',  PM.buildSVG({ form: 'mono', tier: 'full',  size: 256 }));
put('mono/mark-small.svg', PM.buildSVG({ form: 'mono', tier: 'small', size: 128 }));
put('mono/tray.svg',       PM.buildSVG({ form: 'mono', tier: 'micro', size: 64 }));

/* -- 4. rig parts for Slint composition ----------------------------------- */
for (const part of PM.PARTS) {
  put(`parts/${part}.svg`, PM.buildPart(part, 'full'));
  put(`parts/${part}-small.svg`, PM.buildPart(part, 'small'));
}

/* -- 5. contrast gate ------------------------------------------------------ */
let worst = { ratio: Infinity };
const rows = [];
for (const t of PM.THEMES) {
  for (const pol of ['ground', 'flood']) {
    const c = PM.colorsFor(t.slug, pol);
    rows.push(`  ${t.slug.padEnd(15)} ${pol.padEnd(7)} tile ${c.tile}  mark ${c.mark}  ${c.ratio.toFixed(2)}:1 ${c.ratio >= 3 ? 'ok' : 'FAIL'}`);
    if (c.ratio < worst.ratio) worst = { ...c, slug: t.slug, pol };
  }
}
console.log(`wrote ${count} files\n`);
console.log('contrast (WCAG 1.4.11 non-text floor 3:1):');
console.log(rows.join('\n'));
console.log(`\nworst: ${worst.slug} / ${worst.pol} at ${worst.ratio.toFixed(2)}:1`);
if (worst.ratio < 3) {
  console.error('\nCONTRAST GATE FAILED');
  process.exit(1);
}
console.log('contrast gate passed');
