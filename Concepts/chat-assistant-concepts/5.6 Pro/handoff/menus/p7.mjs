import { chromium } from 'playwright-core';
const EXE='/home/sittingmongoose/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';
const URL='file:///mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6%20Pro/index.html';
const b=await chromium.launch({executablePath:EXE});
for(const w of [430,1024]){
  const p=await b.newPage({viewport:{width:w,height:900}});
  await p.goto(URL,{waitUntil:'load'}); await p.waitForTimeout(500);
  const r = await p.evaluate(()=>{
    const scan=()=>{
      const out=[];
      document.querySelectorAll('body *').forEach(el=>{
        const q=el.getBoundingClientRect();
        if(q.width>0 && q.right>innerWidth+0.5) out.push({cls:(el.className||el.tagName).toString().slice(0,44), right:+q.right.toFixed(1), w:+q.width.toFixed(1)});
      });
      return {scrollW:document.documentElement.scrollWidth, bodyW:document.body.scrollWidth, inner:innerWidth, offenders:out.slice(0,8), count:out.length};
    };
    const before=scan();
    // header content width vs its box
    const h=document.querySelector('.chat-header');
    const kids=[...h.children].map(k=>({c:(k.className||k.tagName).toString().slice(0,30),w:+k.getBoundingClientRect().width.toFixed(1)}));
    const sum=kids.reduce((a,k)=>a+k.w,0)+7*(kids.length-1)+20;
    const hdr={boxW:+h.getBoundingClientRect().width.toFixed(1), contentSum:+sum.toFixed(1), scrollW:h.scrollWidth, kids};
    // isolation: remove ONLY the worktree button
    const wt=document.querySelector('.chat-header .worktree-button'); if(wt) wt.style.display='none';
    const withoutWt=scan();
    if(wt) wt.style.display='';
    // isolation: remove all three headerExtras additions
    ['.chat-header .worktree-button','.chat-header .goal-chip','.chat-header .pm-lens-trigger'].forEach(s=>{const e=document.querySelector(s); if(e) e.style.display='none';});
    const withoutAll=scan();
    return {before, hdr, withoutWt, withoutAll};
  });
  console.log(w, JSON.stringify(r,null,1));
  await p.close();
}
await b.close();
