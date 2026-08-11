/* compare_shots.mjs -- pixel comparison for the PM7 verification matrix.
 *
 * Usage:
 *   node compare_shots.mjs --a <dirA> --b <dirB> --out <report.json>
 *        --modules <dir with node_modules: pixelmatch, pngjs>
 *        [--diffdir <dir for diff images of failing strict shots>]
 *
 * Shot classes (by filename):
 *   e-*-full.png  -> LOOSE: pass when mean absolute RGB channel delta < 5
 *   everything else -> STRICT: pass when raw differing pixels == 0.
 * For strict failures the report also carries pixelmatch's anti-aliasing
 * aware count (threshold 0.1, AA ignored) so a <=0.05% AA flake can be
 * documented against the PM6-vs-PM6 control run.
 */

import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { join, basename } from 'node:path';

const args = {};
for (let i = 2; i < process.argv.length; i += 2) {
  args[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
}
for (const k of ['a', 'b', 'out', 'modules']) {
  if (!args[k]) { console.error('missing --' + k); process.exit(2); }
}
const require2 = createRequire(join(args.modules, 'noop.js'));
const { PNG } = require2('pngjs');
const _pm = require2('pixelmatch');
const pixelmatch = _pm.default || _pm;

const names = readdirSync(args.a).filter(f => f.endsWith('.png')).sort();
const report = { a: args.a, b: args.b, shots: {}, summary: {} };
let strictFail = 0, looseFail = 0, strictPass = 0, loosePass = 0;

for (const name of names) {
  const id = basename(name, '.png');
  const loose = /^e-.*-full$/.test(id);
  const bufA = readFileSync(join(args.a, name));
  let bufB;
  try { bufB = readFileSync(join(args.b, name)); }
  catch (e) {
    report.shots[id] = { class: loose ? 'loose' : 'strict', pass: false,
                         error: 'missing in b' };
    if (loose) looseFail++; else strictFail++;
    continue;
  }
  if (bufA.equals(bufB)) {
    report.shots[id] = { class: loose ? 'loose' : 'strict', pass: true,
                         identicalBytes: true, rawDiffPixels: 0,
                         meanChannelDelta: 0 };
    if (loose) loosePass++; else strictPass++;
    continue;
  }
  const a = PNG.sync.read(bufA);
  const b = PNG.sync.read(bufB);
  if (a.width !== b.width || a.height !== b.height) {
    report.shots[id] = { class: loose ? 'loose' : 'strict', pass: false,
                         error: 'dimension mismatch' };
    if (loose) looseFail++; else strictFail++;
    continue;
  }
  const n = a.width * a.height;
  let raw = 0;
  let sum = 0;
  for (let i = 0; i < n * 4; i += 4) {
    const dr = Math.abs(a.data[i] - b.data[i]);
    const dg = Math.abs(a.data[i + 1] - b.data[i + 1]);
    const db = Math.abs(a.data[i + 2] - b.data[i + 2]);
    const da = Math.abs(a.data[i + 3] - b.data[i + 3]);
    if (dr || dg || db || da) raw++;
    sum += dr + dg + db;
  }
  const meanDelta = sum / (3 * n);
  const rec = {
    class: loose ? 'loose' : 'strict',
    rawDiffPixels: raw,
    rawDiffPct: +(100 * raw / n).toFixed(4),
    meanChannelDelta: +meanDelta.toFixed(4),
  };
  if (loose) {
    rec.pass = meanDelta < 5;
    if (rec.pass) loosePass++; else looseFail++;
  } else {
    rec.pass = raw === 0;
    if (!rec.pass) {
      /* AA-aware count for flake documentation */
      const diff = new PNG({ width: a.width, height: a.height });
      rec.aaAwareDiffPixels = pixelmatch(a.data, b.data, diff.data,
        a.width, a.height, { threshold: 0.1, includeAA: false });
      rec.aaAwareDiffPct = +(100 * rec.aaAwareDiffPixels / n).toFixed(4);
      if (args.diffdir) {
        mkdirSync(args.diffdir, { recursive: true });
        writeFileSync(join(args.diffdir, id + '.diff.png'),
          PNG.sync.write(diff));
      }
      strictFail++;
    } else strictPass++;
  }
  report.shots[id] = rec;
}

report.summary = {
  strictPass, strictFail, loosePass, looseFail, total: names.length };
writeFileSync(args.out, JSON.stringify(report, null, 2));
console.error(JSON.stringify(report.summary));
for (const [id, r] of Object.entries(report.shots)) {
  if (!r.pass) console.error('FAIL ' + id + ' ' + JSON.stringify(r));
}
process.exit(strictFail + looseFail ? 1 : 0);
