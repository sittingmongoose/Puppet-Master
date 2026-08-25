/* Orphan gate for orbit.css: every selector this file declares must match at
   least one element in some reachable state, and every class orbit.js emits
   must be styled by something. Both directions, because the defect this plan
   fights is a rule pointing at a name nothing emits. */
import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
const css = fs.readFileSync('orbit.css','utf8');
// strip comments, then collect selectors
const clean = css.replace(/\/\*[\s\S]*?\*\//g,'');
const sels = new Set();
for (const m of clean.matchAll(/(^|\}|\{)\s*([^{}@][^{}]*?)\s*\{/g)) {
  for (const s of m[2].split(',')) {
    const t = s.trim();
    if (!t || t.startsWith('@') || /^\d/.test(t) || /^(from|to)$/.test(t) || /%$/.test(t)) continue;
    sels.add(t);
  }
}
const list=[...sels];
const b = await chromium.launch();
const p = await b.newPage({ viewport:{width:1600,height:900}, deviceScaleFactor:1 });
await p.goto('file://'+path.resolve(process.cwd(),'index.html'));
await p.waitForFunction(()=>window.PM56_DEMO);
const seen = new Set();
async function sweep(){
  const hit = await p.evaluate(sl => sl.filter(s => { try { return document.querySelector(s.replace(/::?(before|after|hover|focus-visible|focus|active)\b/g,'')) != null; } catch(e){ return false; } }), list);
  hit.forEach(x=>seen.add(x));
}
async function drag(pct){ const h=await p.locator('[data-resize="editor"]').first().boundingBox();
  await p.mouse.move(h.x+h.width/2,h.y+h.height/2); await p.mouse.down();
  await p.mouse.move(1600*(pct/100), h.y+h.height/2,{steps:10}); await p.mouse.up(); await p.waitForTimeout(350); }
for (const take of [0,1,3,8]) {
  await p.evaluate(v=>{window.PM56_DEMO.setVariant(2,v); window.PM56_DEMO.setWorkStep(7);}, take);
  await p.waitForTimeout(500); await sweep();
  if (take===1){
    for (const pct of [26,70]) {
      await drag(pct); await p.waitForTimeout(400); await sweep();
      await p.evaluate(()=>{const n=document.querySelector('.orbit-node[data-value="7"]'); if(n)n.click();});
      await p.waitForTimeout(500); await sweep();
      await p.evaluate(()=>{const n=document.querySelector('.orbit-node[data-value="0"]'); if(n)n.click();});
      await p.waitForTimeout(400); await sweep();
      await p.evaluate(()=>{const b=document.querySelector('[data-action="orbit-collapse"]'); if(b)b.click();});
      await p.waitForTimeout(400); await sweep();
    }
    await drag(40);
    /* running state (.orbit-chip.run), other threads (other status tones,
       and a thread with no children at all -> .orbit-empty) */
    await p.evaluate(()=>window.PM56_DEMO.startWorking()); await p.waitForTimeout(700);
    await p.evaluate(()=>{const b=document.querySelector('.orbit-core'); if(b)b.click();});
    await p.waitForTimeout(400); await sweep();
    await p.evaluate(()=>window.PM56_DEMO.pauseWorking());
    for (const th of (await p.evaluate(()=>window.PM56_DATA.threads.map(t=>t.id))).slice(0,12)) {
      await p.evaluate(t=>window.PM56_DEMO.selectThread(t), th);
      await p.evaluate(()=>window.PM56_DEMO.setWorkStep(7)); await p.waitForTimeout(180);
      await p.evaluate(()=>{const n=document.querySelector('.orbit-node[data-value="7"]'); if(n)n.click();});
      await p.waitForTimeout(200); await sweep();
    }
    await p.evaluate(()=>{ window.PM56_DATA.subagents.length=0; window.PM56_DEMO.setWorkStep(7); });
    await p.waitForTimeout(300);
    await p.evaluate(()=>{const n=document.querySelector('.orbit-node[data-value="7"]'); if(n)n.click();});
    await p.waitForTimeout(350); await sweep();
    await p.reload(); await p.waitForFunction(()=>window.PM56_DEMO);
    await p.evaluate(()=>{window.PM56_DEMO.setVariant(2,1); window.PM56_DEMO.setWorkStep(7);}); await p.waitForTimeout(400);
    await p.evaluate(()=>window.PM56_DEMO.selectThread('query'));
    await p.evaluate(()=>window.PM56_DEMO.completeWorking()); await p.waitForTimeout(600); await sweep();
    await p.evaluate(()=>{const n=document.querySelector('.orbit-node[data-value="7"]'); if(n)n.click();});
    await p.waitForTimeout(500); await sweep();
  }
  // trail: completed state adds data-action on the discs
  await p.evaluate(()=>window.PM56_DEMO.completeWorking()); await p.waitForTimeout(500); await sweep();
  await p.evaluate(()=>window.PM56_DEMO.resetWorking()); await p.waitForTimeout(400); await sweep();
}
const orphans = list.filter(s=>!seen.has(s));
console.log('orbit.css selectors:', list.length, ' matched:', seen.size, ' ORPHANS:', orphans.length);
if (orphans.length) console.log(orphans.join('\n'));
// reverse direction: classes emitted by orbit.js that no rule mentions
const emitted = [...fs.readFileSync('orbit.js','utf8').matchAll(/class="([a-z0-9 _-]+)/gi)].flatMap(m=>m[1].split(/\s+/)).filter(x=>/^[a-z][a-z0-9-]*$/.test(x));
const unstyled = [...new Set(emitted)].filter(c=>!clean.includes('.'+c) && !fs.readFileSync('styles.css','utf8').includes('.'+c) && !fs.readFileSync('motion.css','utf8').includes('.'+c));
console.log('classes emitted by orbit.js with no rule anywhere:', unstyled.length ? unstyled.join(', ') : 'none');
await b.close();
