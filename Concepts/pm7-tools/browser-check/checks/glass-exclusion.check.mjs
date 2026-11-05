// FO-62: exercise the actual sampler with known own ink and a deliberately corrupted outside-only shot.
import { readThrough } from './glass-backing.check.mjs';
export default async function(t) {
 const f = await t.app.open();
 await f.evaluate(() => {
  const p = document.createElement('div'); p.id = 'exclusion-fixture';
  p.style.cssText = 'position:fixed;inset:100px auto auto 100px;width:420px;height:200px;z-index:2147483647;background:#fff;color:#111;font:24px monospace;';
  p.textContent = 'Agents own text exclusion reference. Every row must retain its ink.';
  const bg = document.createElement('div'); bg.id = 'exclusion-background';
  bg.style.cssText = 'position:fixed;left:100px;top:220px;width:420px;height:80px;z-index:2147483646;color:#111;font:30px monospace;background:#fff';
  bg.textContent = 'OUTSIDE TEXT READING THROUGH THE PANEL';
  document.body.append(bg, p);
 });
 try {
  const valid = await readThrough(t, f, '#exclusion-fixture');
  await t.check('intact own text gives a valid opaque sample', valid && !valid.invalid && valid.share <= .002, JSON.stringify(valid));
  const invalid = await readThrough(t, f, '#exclusion-fixture', { loseOwnInk: true });
  await t.check('lost own ink is invalid, never a backing verdict', invalid?.invalid === true && invalid.share === undefined, JSON.stringify(invalid));
  await f.evaluate(() => document.getElementById('exclusion-fixture').style.background = 'transparent');
  const leaking = await readThrough(t, f, '#exclusion-fixture');
  await t.check('real outside ink still fails the backing limit', leaking && !leaking.invalid && leaking.share > .002, JSON.stringify(leaking));
  await t.check('capture styles restored', await f.evaluate(() => !document.querySelector('#bc-through, #bc-own-reference, [data-bc-in]')));
 } finally { await f.evaluate(() => { document.getElementById('exclusion-fixture')?.remove(); document.getElementById('exclusion-background')?.remove(); }); }
}
