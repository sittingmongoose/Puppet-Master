// FO-62: exercise the actual sampler with known own ink and a deliberately corrupted outside-only shot.
import { readThrough, capturePaint } from './glass-backing.check.mjs';
async function once(t) {
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
  const measured=await f.evaluate(()=>{const e=document.getElementById('exclusion-fixture'),b=e.getBoundingClientRect();return {sourceRect:JSON.stringify(b.toJSON()),dpr:devicePixelRatio,rect:{x:Math.round(b.x)+2,y:Math.round(b.y)+2,width:Math.round(b.width)-4,height:Math.round(b.height)-4}};});
  const plain=await capturePaint(t,measured.rect,measured);
  await f.evaluate(()=>{const e=document.getElementById('exclusion-fixture');e.style.setProperty('outline','2px solid rgb(1, 253, 97)','important');e.style.setProperty('outline-offset','-2px','important');});
  await f.waitForTimeout(250);
  const marked=await capturePaint(t,measured.rect,measured);
  let outside=0;
  for(let i=0,p=0;i<plain.data.length;i+=4,p++) if(!marked.outlineMask[p]&&[0,1,2,3].some(k=>plain.data[i+k]!==marked.data[i+k])) outside++;
  await t.check('outline reaches paint and changes zero measured pixels outside its two-pixel mask', marked.capture.valid&&outside===0,JSON.stringify({capture:marked.capture,outside}));
  await f.evaluate(()=>{const e=document.getElementById('exclusion-fixture');e.style.removeProperty('outline');e.style.removeProperty('outline-offset');});
  const valid = await readThrough(t, f, '#exclusion-fixture');
  await t.check('intact own text gives a valid opaque sample', valid && !valid.invalid && valid.share <= .002, JSON.stringify(valid));
  const invalid = await readThrough(t, f, '#exclusion-fixture', { loseOwnInk: true });
  await t.check('lost-ink fault reached the captured paint', invalid?.faults?.ownInkLoss === true, JSON.stringify(invalid));
  await t.check('lost own ink is invalid, never a backing verdict', invalid?.invalid === true && invalid.share === undefined, JSON.stringify(invalid));
  const drift = await readThrough(t, f, '#exclusion-fixture', { resizeAfterMeasure: true });
  await t.check('clip geometry cannot be replaced by a later setup read', drift?.invalid === true && drift.share === undefined && drift.reason.includes('geometry stable=false'), JSON.stringify(drift));
  const moved = await readThrough(t, f, '#exclusion-fixture', { moveDuringCaptures: true });
  await t.check('move-and-return fault reached all five PNGs', moved?.captures?.length===5 && moved.captures.every(c=>c.bounds?.left===140) && moved.geometry.sourceRect===moved.geometry.setupRect && moved.geometry.sourceRect===moved.geometry.endRect, JSON.stringify(moved));
  await t.check('move-and-return is invalid, never a backing pass', moved?.invalid===true && moved.share===undefined, JSON.stringify(moved));
  await f.evaluate(() => document.getElementById('exclusion-fixture').style.background = 'transparent');
  const leaking = await readThrough(t, f, '#exclusion-fixture');
  await t.check('real outside ink still fails the backing limit', leaking && !leaking.invalid && leaking.share > .002, JSON.stringify(leaking));
  await t.check('capture styles restored', await f.evaluate(() => !document.querySelector('#bc-through, #bc-own-reference, [data-bc-in]')));
 } finally { await f.evaluate(() => { document.getElementById('exclusion-fixture')?.remove(); document.getElementById('exclusion-background')?.remove(); }); }
}

export default async function(t) { for(let rep=0;rep<+(t.args.exclusionReps||1);rep++) await t.step(`exclusion repeat ${rep+1}`,()=>once(t)); }
