import {chromium} from 'playwright';
import {pathToFileURL} from 'url';
import fs from 'fs';
const OUT='/tmp/claude-1000/-mnt-Cursor-PuppetMaster/6b56d129-8eab-4a4f-bf02-133b45afc809/scratchpad/waves/shots-goals';
fs.mkdirSync(OUT,{recursive:true});
const target="/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro/PM_Chat_Assistant_5.6_Pro_Standalone.html";
const b=await chromium.launch({headless:true,args:['--disable-gpu','--allow-file-access-from-files','--no-sandbox']});
const p=await b.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
const errs=[];p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});p.on('pageerror',e=>errs.push(''+e));
await p.goto(pathToFileURL(target).href,{waitUntil:'load'});
await p.waitForFunction(()=>window.__PM56_BOOT_OK===true);
// open the goal in the editor pane (bigger type => a cleaner pixel read)
await p.evaluate(()=>{document.querySelector('.chat-header .goal-chip').click();});
await p.waitForTimeout(600);
await p.evaluate(()=>document.querySelector('.goal-doc .goal-phase.is-current').scrollIntoView({block:'center'}));
await p.waitForTimeout(300);

const before=await p.evaluate(()=>{
  const li=document.querySelector('.goal-doc .goal-phase.is-current');
  const t=li.querySelector('.goal-phase-title'), s=li.querySelector('.goal-strike');
  const rt=t.getBoundingClientRect(), rs=s.getBoundingClientRect();
  return {title:li.querySelector('.goal-phase-text').textContent,
    band:{x:Math.round(rt.left)-2,y:Math.round(rs.top)-2,w:Math.round(rt.width)+6,h:6},
    strikeCss:{name:getComputedStyle(s).animationName,dur:getComputedStyle(s).animationDuration,
               ease:getComputedStyle(s).animationTimingFunction,fill:getComputedStyle(s).animationFillMode,
               tf:getComputedStyle(s).transform},
    rowKey:li.getAttribute('data-k')};
});
console.log('BEFORE',JSON.stringify(before));

// ---- CDP screencast: real frames, not synthesised ones ----
const cdp=await p.context().newCDPSession(p);
const frames=[];
cdp.on('Page.screencastFrame',async ({data,sessionId,metadata})=>{
  frames.push({t:metadata.timestamp,data});
  try{ await cdp.send('Page.screencastFrameAck',{sessionId}); }catch(e){}
});
await cdp.send('Page.startScreencast',{format:'jpeg',quality:92,maxWidth:1440,maxHeight:900,everyNthFrame:1});
await p.waitForTimeout(250);
const t0=Date.now();
await p.evaluate(()=>document.querySelector('[data-action="goal-agent-step"]').click());
const during=await p.evaluate(()=>{
  const li=[...document.querySelectorAll('.goal-doc .goal-phase')].filter(x=>x.querySelector('.goal-phase-text').textContent==='Implement')[0];
  const s=li.querySelector('.goal-strike'), cs=getComputedStyle(s), rs=getComputedStyle(li);
  return {wipeAttr:li.getAttribute('data-wipe'), cls:li.className,
    strike:{name:cs.animationName,dur:cs.animationDuration,ease:cs.animationTimingFunction,fill:cs.animationFillMode},
    row:{name:rs.animationName,dur:rs.animationDuration}};
});
console.log('DURING',JSON.stringify(during));
await p.waitForTimeout(900);
await cdp.send('Page.stopScreencast');
console.log('frames captured:',frames.length);

const after=await p.evaluate(()=>{
  const li=[...document.querySelectorAll('.goal-doc .goal-phase')].filter(x=>x.querySelector('.goal-phase-text').textContent==='Implement')[0];
  const s=li.querySelector('.goal-strike');
  return {cls:li.className,wipe:li.getAttribute('data-wipe'),key:li.getAttribute('data-k'),
    strikeCss:{name:getComputedStyle(s).animationName,dur:getComputedStyle(s).animationDuration,
               ease:getComputedStyle(s).animationTimingFunction,fill:getComputedStyle(s).animationFillMode,
               tf:getComputedStyle(s).transform}};
});
console.log('AFTER',JSON.stringify(after));

/* Measure the PAINTED strike front. The text glyphs also sit in this band, so
   "any non-background pixel" would count letters. The strike is the only
   CONTIGUOUS horizontal run: letters have gaps between them. So scan the exact
   strike row and take the longest unbroken run starting at x=0. Pre-wipe that is
   one glyph stroke (~1-3px); a snap-on strikethrough would jump straight to full
   width between two consecutive frames; a wipe climbs. */
const band=before.band;
const widths=[];
for(let i=0;i<frames.length;i++){
  const w=await p.evaluate(async ([b64,band])=>{
    const img=new Image(); img.src='data:image/jpeg;base64,'+b64; await img.decode();
    const c=document.createElement('canvas'); c.width=img.width; c.height=img.height;
    const g=c.getContext('2d'); g.drawImage(img,0,0);
    const d=g.getImageData(band.x,band.y,band.w,band.h).data;
    const at=(x,y)=>{const o=(y*band.w+x)*4;return [d[o],d[o+1],d[o+2]];};
    const bg=at(band.w-1,band.h-1);
    const diff=q=>Math.abs(q[0]-bg[0])+Math.abs(q[1]-bg[1])+Math.abs(q[2]-bg[2]);
    let best=0;
    for(let y=0;y<band.h;y++){
      let run=0;
      for(let x=2;x<band.w;x++){ if(diff(at(x,y))>30) run++; else break; }
      if(run>best) best=run;
    }
    return {run:best, width:band.w-2};
  },[frames[i].data,band]);
  widths.push({i,t:frames[i].t,...w});
}
const base=widths[0].t;
const rel=widths.map(w=>({ms:Math.round((w.t-base)*1000),strikeRunPx:w.run,ofPx:w.width}));
console.log('STRIKE FRONT PER FRAME:'); console.log(JSON.stringify(rel));
fs.writeFileSync(`${OUT}/../film-goal-transition.json`,JSON.stringify({before,during,after,rel,errs},null,1));
// contact sheet: save 8 evenly spaced frames of the band, magnified
const pick=[...Array(Math.min(10,frames.length)).keys()].map(k=>Math.round(k*(frames.length-1)/Math.max(1,Math.min(9,frames.length-1))));
for(const k of [...new Set(pick)]) fs.writeFileSync(`${OUT}/frame-${String(k).padStart(2,'0')}.jpg`,Buffer.from(frames[k].data,'base64'));
console.log('console errors:',errs);
await b.close();
