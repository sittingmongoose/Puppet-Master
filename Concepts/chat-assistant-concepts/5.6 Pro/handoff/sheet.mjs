import {chromium} from 'playwright';
import {pathToFileURL} from 'url';
import fs from 'fs';
const OUT='/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro/handoff/w6/waves/shots-goals';
const target="/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro/PM_Chat_Assistant_5.6_Pro_Standalone.html";
const b=await chromium.launch({headless:true,args:['--disable-gpu','--allow-file-access-from-files','--no-sandbox']});
const p=await b.newPage({viewport:{width:1440,height:900},deviceScaleFactor:2});
await p.goto(pathToFileURL(target).href,{waitUntil:'load'});
await p.waitForFunction(()=>window.__PM56_BOOT_OK===true);
await p.evaluate(()=>document.querySelector('.chat-header .goal-chip').click());
await p.waitForTimeout(600);
await p.evaluate(()=>document.querySelector('.goal-doc .goal-phase.is-current').scrollIntoView({block:'center'}));
await p.waitForTimeout(300);
const clip=await p.evaluate(()=>{const li=document.querySelector('.goal-doc .goal-phase.is-current');const r=li.getBoundingClientRect();return {x:Math.round(r.left),y:Math.round(r.top),width:Math.round(r.width),height:Math.round(r.height)};});
const cdp=await p.context().newCDPSession(p);
const frames=[];
cdp.on('Page.screencastFrame',async ({data,sessionId})=>{frames.push({data,at:Date.now()});try{await cdp.send('Page.screencastFrameAck',{sessionId});}catch(e){}});
await cdp.send('Page.startScreencast',{format:'png',maxWidth:2880,maxHeight:1800,everyNthFrame:1});
await p.waitForTimeout(200);
const clickAt=Date.now();
await p.evaluate(()=>document.querySelector('[data-action="goal-agent-step"]').click());
await p.waitForTimeout(700);
await cdp.send('Page.stopScreencast');
const post=frames.filter(f=>f.at>=clickAt);
console.log('post-click frames:',post.length,'offsets',post.map(f=>f.at-clickAt).join(','));
const wipe=post.slice(5,13).map(f=>f.data);
console.log('total',frames.length,'wipe frames',wipe.length);
const dataUrl=await p.evaluate(async ([list,clip])=>{
  const imgs=[];
  for(const b64 of list){const i=new Image();i.src='data:image/png;base64,'+b64;await i.decode();imgs.push(i);}
  // the screencast frame is in CSS px of the viewport, whatever deviceScaleFactor says
  const S = imgs[0].width / innerWidth;
  const Z = 2.4;                      // magnify so a 1.4px strike is visible
  const W = clip.width*S, H = clip.height*S;
  const dw = Math.round(clip.width*Z), dh = Math.round(clip.height*Z);
  const c=document.createElement('canvas'); c.width=dw; c.height=(dh+10)*imgs.length;
  const g=c.getContext('2d'); g.imageSmoothingEnabled=false;
  g.fillStyle='#3a3a4a'; g.fillRect(0,0,c.width,c.height);
  imgs.forEach((im,k)=>{ g.drawImage(im, clip.x*S, clip.y*S, W, H, 0, k*(dh+10), dw, dh); });
  return {url:c.toDataURL('image/png'), S, frameW:imgs[0].width};
},[wipe,clip]);
console.log('scale',dataUrl.S,'frameW',dataUrl.frameW);
fs.writeFileSync(`${OUT}/wipe-contact-sheet.png`, Buffer.from(dataUrl.url.split(',')[1],'base64'));
// resting state, re-measured after everything settles
await p.waitForTimeout(1500);
console.log(JSON.stringify(await p.evaluate(()=>{
  const li=[...document.querySelectorAll('.goal-doc .goal-phase')].filter(x=>x.querySelector('.goal-phase-text').textContent==='Implement')[0];
  const s=li.querySelector('.goal-strike'), r=s.getBoundingClientRect();
  return {restingTransform:getComputedStyle(s).transform, animName:getComputedStyle(s).animationName,
          strikeWidthPx:Math.round(r.width), titleWidthPx:Math.round(li.querySelector('.goal-phase-title').getBoundingClientRect().width),
          rowClass:li.className, badge:li.querySelector('.goal-phase-badge').textContent};
})));
await b.close();
