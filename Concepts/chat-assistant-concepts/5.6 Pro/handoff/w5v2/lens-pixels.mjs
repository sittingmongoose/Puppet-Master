/* WAVE 5 SECOND VERIFIER — item 9 Context Lens, re-verified by PAINTED PIXELS ONLY.
   Deliberately reads NEITHER PM56_LENS NOR data-lens-state/data-lens-sel: the claim
   "the cap accumulates" and "Turn Off really turns it off" are re-tested as
   per-message painted luminance measured against each message's OWN baseline.
   Positive control is built in: the baseline->muted delta IS the proof the
   instrument can see the effect, per message. */
import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import fs from 'fs';
const S='/tmp/claude-1000/-mnt-Cursor-PuppetMaster/6b56d129-8eab-4a4f-bf02-133b45afc809/scratchpad/w5v2';
const FILE = process.argv.includes('--file') ? process.argv[process.argv.indexOf('--file')+1] : (S+'/snap/index.html');
const res=[]; const ok=(n,c,d)=>{res.push({n,pass:!!c,d}); console.log((c?'PASS  ':'FAIL  ')+n+(c?'':'  '+JSON.stringify(d).slice(0,300)));};

const b=await chromium.launch({headless:true,args:['--disable-gpu','--allow-file-access-from-files','--no-sandbox']});
const p=await b.newPage({viewport:{width:1440,height:900}});
const cerr=[],perr=[];
p.on('console',m=>{if(m.type()==='error')cerr.push(m.text());});
p.on('pageerror',e=>perr.push(String(e)));
await p.goto(pathToFileURL(FILE).href,{waitUntil:'load'});
await p.waitForFunction(()=>window.__PM56_BOOT_OK===true);
await p.evaluate(()=>{PM56_DEMO.selectThread('plain');});
await p.waitForTimeout(400);
/* kill everything that repaints on its own, so an A/A run is a true zero */
await p.addStyleTag({content:'*,*::before,*::after{animation:none!important;transition:none!important}'});
await p.waitForTimeout(300);

/* ---- the instrument: per-message painted mean luminance, multi-pass scroll --- */
async function paintMap(tag){
  const map={};
  await p.evaluate(()=>{const t=document.querySelector('.transcript'); t.scrollTop=0;});
  await p.waitForTimeout(150);
  const maxScroll=await p.evaluate(()=>{const t=document.querySelector('.transcript');return t.scrollHeight-t.clientHeight;});
  const step=await p.evaluate(()=>Math.round(document.querySelector('.transcript').clientHeight*0.75));
  for(let sc=0; ; sc+=step){
    await p.evaluate(v=>{document.querySelector('.transcript').scrollTop=v;},Math.min(sc,maxScroll));
    await p.waitForTimeout(120);
    const png=(await p.screenshot()).toString('base64');
    const got=await p.evaluate(async ([d])=>{
      const im=new Image(); im.src='data:image/png;base64,'+d; await im.decode();
      const c=document.createElement('canvas'); c.width=im.width; c.height=im.height;
      const g=c.getContext('2d',{willReadFrequently:true}); g.drawImage(im,0,0);
      const sc=im.width/innerWidth;
      const tr=document.querySelector('.transcript').getBoundingClientRect();
      const out={};
      for(const a of document.querySelectorAll('.transcript .message[data-message-id]')){
        const surf=a.querySelector('.message-surface'); if(!surf) continue;
        const r=surf.getBoundingClientRect();
        if(r.top < tr.top+2 || r.bottom > tr.bottom-2) continue;   // must be WHOLLY visible
        if(r.width<20||r.height<10) continue;
        const px=g.getImageData(Math.round(r.left*sc),Math.round(r.top*sc),Math.round(r.width*sc),Math.round(r.height*sc)).data;
        let s=0,n=0; for(let i=0;i<px.length;i+=4){s+=0.2126*px[i]+0.7152*px[i+1]+0.0722*px[i+2];n++;}
        out[a.dataset.messageId]={lum:+(s/n).toFixed(4), h:+r.height.toFixed(1)};
      }
      return out;
    },[png]);
    Object.assign(map,got);
    if(sc>=maxScroll) break;
  }
  return map;
}
const setMode=async m=>{
  await p.evaluate(()=>document.querySelector('[data-action="lens-open"]')?.click()); await p.waitForTimeout(200);
  await p.evaluate(v=>document.querySelector(`[data-action="lens-mode"][data-value="${v}"]`)?.click(),m); await p.waitForTimeout(200);
  await p.keyboard.press('Escape'); await p.waitForTimeout(180);
};
const dimmed=(A,B,thr=0.06)=>Object.keys(A).filter(k=>B[k]!==undefined && B[k].lum < A[k].lum*(1-thr));
const brighter=(A,B,thr=0.06)=>Object.keys(A).filter(k=>B[k]!==undefined && B[k].lum > A[k].lum*(1+thr));

/* ---------------- baseline + A/A NOISE FLOOR (the greens must count) ------- */
const base1=await paintMap('base1');
const base2=await paintMap('base2');
const aaDeltas=Object.keys(base1).filter(k=>base2[k]).map(k=>Math.abs(base2[k].lum-base1[k].lum));
const aaMax=Math.max(...aaDeltas), aaRel=Math.max(...Object.keys(base1).filter(k=>base2[k]).map(k=>Math.abs(base2[k].lum-base1[k].lum)/Math.max(0.5,base1[k].lum)));
ok('A/A NOISE FLOOR: two baseline paint maps of the same state agree per message',
   aaRel < 0.02, {messages:Object.keys(base1).length, maxAbsDelta:+aaMax.toFixed(4), maxRelDelta:+aaRel.toFixed(4)});
ok('the paint map actually sees every message of the 26-message thread',
   Object.keys(base1).length >= 24, {measured:Object.keys(base1).length});
ok('NEGATIVE CONTROL: nothing is dimmed relative to baseline at rest',
   dimmed(base1,base2).length===0 && brighter(base1,base2).length===0, {d:dimmed(base1,base2),b:brighter(base1,base2)});

/* ---------------- drive 25 selections + seal, purely through the DOM ------- */
await setMode('mute');
await p.waitForTimeout(200);
const ids=await p.evaluate(()=>[...document.querySelectorAll('[data-action="lens-toggle"]')].map(b=>b.dataset.id));
ok('gutter controls appear for the whole thread when Mute is entered', ids.length>=26, {controls:ids.length});
for(let i=0;i<25;i++){ await p.evaluate(id=>document.querySelector(`[data-action="lens-toggle"][data-id="${id}"]`)?.click(),ids[i]); await p.waitForTimeout(20); }
await p.evaluate(()=>document.querySelector('[data-action="lens-seal"]')?.click());
await p.waitForTimeout(450);
const sealed=await paintMap('sealed');
const dim25=dimmed(base1,sealed);
ok('POSITIVE CONTROL: after sealing 25, exactly 25 messages are painted DIMMER than their own baseline',
   dim25.length===25, {dimmed:dim25.length, ids:dim25.slice(0,3)});
const ratios=dim25.map(k=>+(sealed[k].lum/base1[k].lum).toFixed(3));
ok('the dimming is a real paint change, not noise (every dimmed turn is well past the A/A floor)',
   Math.max(...ratios) < 0.9, {maxRatio:Math.max(...ratios), minRatio:Math.min(...ratios), aaRel:+aaRel.toFixed(4)});

/* ---------------- THE ACCUMULATION CLAIM, in pixels ----------------------- */
const ids2=await p.evaluate(()=>[...document.querySelectorAll('[data-action="lens-toggle"]')].map(b=>b.dataset.id));
const fresh=ids2.find(x=>!dim25.includes(x)&&ids.includes(x));
await p.evaluate(id=>document.querySelector(`[data-action="lens-toggle"][data-id="${id}"]`)?.click(),fresh);
await p.waitForTimeout(300);
const after26=await paintMap('after26');
const dim26=dimmed(base1,after26);
ok('THE CAP ACCUMULATES (pixel proof): a 26th turn shapes in a SECOND operation — 26 painted dim, not 25',
   dim26.length===26 && dim25.every(k=>dim26.includes(k)),
   {before:dim25.length, after:dim26.length, keptAll25:dim25.every(k=>dim26.includes(k)), newOne:fresh});
ok('the 25 already-sealed turns did NOT brighten back when the 26th was added',
   dim25.filter(k=>!dim26.includes(k)).length===0, {lost:dim25.filter(k=>!dim26.includes(k))});

/* ---------------- TURN OFF, per-message identity -------------------------- */
await p.evaluate(()=>document.querySelector('[data-action="lens-open"]')?.click()); await p.waitForTimeout(200);
const offBtn=await p.evaluate(()=>{const b=[...document.querySelectorAll('[data-action="lens-mode"],[data-action="lens-release"],[data-action="lens-clear"]')]
  .find(x=>/turn off|^off$/i.test((x.textContent||'').trim())||x.dataset.value==='off');
  if(b){b.click();return b.dataset.action+'|'+b.dataset.value+'|'+(b.textContent||'').trim().slice(0,40);} return null;});
await p.waitForTimeout(300); await p.keyboard.press('Escape'); await p.waitForTimeout(400);
ok('a "Turn Off" control exists and was clicked', !!offBtn, {offBtn});
const off=await paintMap('off');
const stillDim=dimmed(base1,off);
const restored=Object.keys(base1).filter(k=>off[k]!==undefined).map(k=>({k,r:off[k].lum/Math.max(0.001,base1[k].lum)}));
const worst=restored.reduce((a,x)=>Math.abs(x.r-1)>Math.abs(a.r-1)?x:a,{k:null,r:1});
ok('TURN OFF restores EVERY message to within the noise floor of its OWN baseline luminance',
   stillDim.length===0 && Math.abs(worst.r-1)<0.03,
   {stillDim:stillDim.length, worstMessage:worst.k, worstRatio:+worst.r.toFixed(4), compared:restored.length});
ok('"nothing is selected" and "selection is broken" are distinguished: the gutter controls are GONE, not empty',
   (await p.evaluate(()=>document.querySelectorAll('[data-action="lens-toggle"]').length))===0,
   {controls: await p.evaluate(()=>document.querySelectorAll('[data-action="lens-toggle"]').length)});
ok('Turn Off did not delete anything: every measured message is still painted',
   Object.keys(off).length>=Object.keys(base1).length, {before:Object.keys(base1).length, after:Object.keys(off).length});

/* ---------------- SELFTEST: the pixel detector CAN go red ------------------ */
await p.evaluate(()=>{const s=document.createElement('style');s.id='__w5tamper';
  s.textContent='.transcript .message .message-surface{opacity:.42!important}';document.head.appendChild(s);});
await p.waitForTimeout(250);
const tampered=await paintMap('tampered');
const tDim=dimmed(base1,tampered);
ok('SELFTEST: forcing every surface to opacity .42 makes the detector report EVERY message dim',
   tDim.length>=Object.keys(base1).length-1, {reported:tDim.length, of:Object.keys(base1).length});
await p.evaluate(()=>document.getElementById('__w5tamper')?.remove());

ok('zero console errors', cerr.length===0, cerr.slice(0,3));
ok('zero page errors', perr.length===0, perr.slice(0,3));
const pass=res.filter(r=>r.pass).length;
console.log(`\n${pass} pass / ${res.length-pass} fail`);
fs.writeFileSync(S+'/lens-pixels.json',JSON.stringify(res,null,1));
await b.close();
