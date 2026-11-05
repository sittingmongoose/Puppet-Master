import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
// FO-62: exercise the actual sampler with known own ink and a deliberately corrupted outside-only shot.
import { readThrough, capturePaint, installCaptureWitness, cleanupCaptureWitness, measureWithRetries } from './glass-backing.check.mjs';
async function actualPlateRow(t) {
 const f=await t.app.open();await t.viewport(1390,900);await t.app.look('glass-dark');
 await f.evaluate(()=>{const b=document.createElement('button');b.dataset.kind='crew';b.dataset.auto='0';PM56_EXT.run('collab-open-configure',b,new Event('click'));const c=PM56_EXT.ctx();if(c.renderOverlays)c.renderOverlays();});
 const sel='figure.pmx-plate';await f.waitForSelector(sel);await f.waitForTimeout(1800);
 const row=await f.evaluate(s=>{const e=document.querySelector(s);e.id='review-real-plate';const q=[...e.querySelectorAll('svg text,svg foreignObject span')].find(n=>n.getBoundingClientRect().width>25);q.id='review-real-row';return {html:q.outerHTML,box:q.getBoundingClientRect().toJSON(),plate:e.getBoundingClientRect().toJSON()};},sel);
 const dir=t.args.inputs?path.join(String(t.args.inputs),'actual-plate-row'):path.join(t.dir||'/home/sittingmongoose/pm-scratch/fo-visual-c4','actual-plate-row');await mkdir(dir,{recursive:true});
 let count=0;const trace=[];
 const page=new Proxy(t.page,{get(target,key){if(key==='screenshot')return async opts=>{const i=count++;
  if(i===2)await f.evaluate(()=>{const e=document.getElementById('review-real-row');e.__reviewStyle=e.getAttribute('style');const scale=(e.getScreenCTM?.()||e.closest('svg')?.getScreenCTM?.())?.a||1;e.style.setProperty('transform','translateX('+(1/(devicePixelRatio*scale))+'px)','important');});
  await f.waitForTimeout(120);trace.push({i,row:await f.evaluate(()=>document.getElementById('review-real-row').getBoundingClientRect().toJSON())});const png=await target.screenshot(opts);return png;
 };const v=target[key];return typeof v==='function'?v.bind(target):v;}});
 const wrapped=new Proxy(t,{get(target,key){return key==='page'?page:target[key];}});
 let m;try{m=await readThrough(wrapped,f,'#review-real-plate',{inputDir:dir});}finally{await f.evaluate(()=>{const e=document.getElementById('review-real-row');if(e.__reviewStyle==null)e.removeAttribute('style');else e.setAttribute('style',e.__reviewStyle);});}
 await writeFile(path.join(dir,'result.json'),JSON.stringify({row,trace,result:m},null,2));
 await t.check('real product plate: internal row moved in reference/outside/all-ink captures',trace.length===5&&trace.slice(2).every(x=>Math.abs(x.row.x-trace[0].row.x-1)<.05),JSON.stringify(trace));
 await t.check('real product plate: moved own row invalidates sample',m?.invalid===true&&m.share===undefined,JSON.stringify({invalid:m?.invalid,reason:m?.reason,share:m?.share,ownStability:m?.ownStability}));
 const measured=await f.evaluate(()=>{const b=document.getElementById('review-real-plate').getBoundingClientRect(),dpr=devicePixelRatio,left=Math.round(b.left*dpr),top=Math.round(b.top*dpr),w=Math.round(b.width*dpr),h=Math.round(b.height*dpr);return {sourceRect:JSON.stringify(b.toJSON()),dpr,rect:{x:(left+2)/dpr,y:(top+2)/dpr,width:(w-4)/dpr,height:(h-4)/dpr}};});
 const plain=await capturePaint(t,measured.rect,measured);measured.points=await installCaptureWitness(f,'#review-real-plate',measured);await f.waitForTimeout(250);const marked=await capturePaint(t,measured.rect,measured);
 let outside=0,inside=0;for(let i=0,p=0;i<plain.data.length;i+=4,p++)if([0,1,2,3].some(k=>plain.data[i+k]!==marked.data[i+k])){if(marked.outlineMask[p])inside++;else outside++;}
 await writeFile(path.join(dir,'isolation-plain.png'),plain.paintPng);await writeFile(path.join(dir,'isolation-marked.png'),marked.paintPng);await writeFile(path.join(dir,'isolation.json'),JSON.stringify({outside,inside,capture:marked.capture},null,2));await cleanupCaptureWitness(f,'#review-real-plate');
 await t.check('real product plate: marker changes no measured pixels outside band',outside===0&&marked.capture.valid&&marked.capture.ownValid,JSON.stringify({outside,inside}));
}

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
  measured.points=await installCaptureWitness(f,'#exclusion-fixture',measured);
  await f.waitForTimeout(250);
  const marked=await capturePaint(t,measured.rect,measured);
  let outside=0;
  for(let i=0,p=0;i<plain.data.length;i+=4,p++) if(!marked.outlineMask[p]&&[0,1,2,3].some(k=>plain.data[i+k]!==marked.data[i+k])) outside++;
  await t.check('outline reaches paint and changes zero measured pixels outside its two-pixel mask', marked.capture.valid&&marked.capture.ownValid&&outside===0,JSON.stringify({capture:marked.capture,outside}));
  await cleanupCaptureWitness(f,'#exclusion-fixture');
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
  const one=await readThrough(t,f,'#exclusion-fixture',{moveOnePixel:true});
  await t.check('one device pixel move during every paint is invalid',one?.invalid===true&&one.share===undefined&&one.captures.every(c=>c.bounds?.left===c.expected.left+1),JSON.stringify(one));
  await f.evaluate(()=>{const e=document.getElementById('exclusion-fixture');e.style.left='100.25px';e.style.top='100.25px';});
  const fractional=await readThrough(t,f,'#exclusion-fixture');
  await t.check('fractional CSS bounds snap to a valid device-pixel sample',fractional&&!fractional.invalid&&fractional.share<=.002,JSON.stringify(fractional));
  await f.evaluate(()=>{const e=document.getElementById('exclusion-fixture');e.style.left='100px';e.style.top='100px';});
  const retried=await measureWithRetries(t,f,'#exclusion-fixture',{maxTries:2,readOptions:{moveOnePixel:true}});
  await t.check('bounded retries never promote an invalid sample',retried.invalid===true&&retried.share===undefined&&retried.tries===2&&retried.attempts.every(a=>!a.valid),JSON.stringify(retried));
  await f.evaluate(()=>{const row=document.createElement('div');row.setAttribute('data-bc-own-row','');row.style.cssText='position:absolute;left:12px;bottom:20px;font:20px monospace';row.textContent='◆ Own moving row';document.getElementById('exclusion-fixture').appendChild(row);});
  const row = await readThrough(t, f, '#exclusion-fixture', { moveOwnRow: true });
  await t.check('own row moved 15px in the captured ink while panel geometry stayed fixed', row?.faults?.ownRowMove===true && row.captures.every(c=>c.valid) && row.geometry.sourceRect===row.geometry.endRect,JSON.stringify(row));
  await t.check('own-row churn is invalid, never a backing verdict', row?.invalid===true && row.share===undefined && row.ownStability?.stable===false,JSON.stringify(row));
  await f.evaluate(()=>document.querySelector('[data-bc-own-row]').remove());
  await f.evaluate(() => document.getElementById('exclusion-fixture').style.background = 'transparent');
  const leaking = await readThrough(t, f, '#exclusion-fixture');
  await t.check('real outside ink still fails the backing limit', leaking && !leaking.invalid && leaking.share > .002, JSON.stringify(leaking));
  await f.evaluate(()=>{const base=document.createElement('div');base.id='exclusion-base';base.style.cssText='position:fixed;left:100px;top:100px;width:420px;height:200px;z-index:2147483645;background:white';document.body.appendChild(base);const e=document.getElementById('exclusion-background');e.style.color='rgb(1,253,97)';e.style.left='112px';e.style.width='396px';e.style.height='68px';e.style.overflow='hidden';});
  const green=await measureWithRetries(t,f,'#exclusion-fixture');
  await t.check('marker-coloured real outside ink is still valid and over limit',green&&!green.invalid&&green.share>.002&&green.tries===1,JSON.stringify(green));
  await f.evaluate(()=>{const e=document.getElementById('exclusion-background');e.style.left='100px';e.style.height='20px';e.style.width='216px';e.style.backgroundImage='linear-gradient(currentColor,currentColor)';e.textContent='';});
  const edgeDir=t.args.inputs?path.join(String(t.args.inputs),'selftest-edge-green'):null;
  const edge=await readThrough(t,f,'#exclusion-fixture',{inputDir:edgeDir});
  if(edgeDir)await writeFile(path.join(edgeDir,'sample.json'),JSON.stringify(edge,null,2));
  await t.check('real marker-green content touching the witness stays backing evidence',edge&&!edge.invalid&&edge.share>.002,JSON.stringify(edge));
  await t.check('capture styles restored', await f.evaluate(() => !document.querySelector('#bc-through, #bc-own-reference, #bc-geometry, #bc-geometry-rules, [data-bc-target], [data-bc-in]')));
 } finally { await f.evaluate(() => { document.getElementById('exclusion-fixture')?.remove(); document.getElementById('exclusion-background')?.remove();document.getElementById('exclusion-base')?.remove(); }); }
}

export default async function(t) { for(let rep=0;rep<+(t.args.exclusionReps||1);rep++) { await t.step(`exclusion repeat ${rep+1}`,()=>once(t)); await t.step('actual Crew plate internal row',()=>actualPlateRow(t)); } }
