import { chromium } from 'playwright-core';
const EXE='/home/sittingmongoose/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';
const URL='file:///mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6%20Pro/index.html';
const b=await chromium.launch({executablePath:EXE});
const themes=['basic-dark','basic-light','friendly-dark','friendly-light','glass-dark','glass-light','retro-dark','retro-light'];
let bad=0;
for(const w of [390,430,560,700,760,900,1024,1440]){
  const p=await b.newPage({viewport:{width:w,height:900}});
  await p.goto(URL,{waitUntil:'load'}); await p.waitForTimeout(400);
  const rows=[];
  for(const t of themes){
    await p.evaluate(id=>window.PM56_DEMO.setTheme(id), t);
    await p.waitForTimeout(160);
    const r=await p.evaluate(()=>{
      const wt=document.querySelector('.chat-header .worktree-button');
      const q=wt?wt.getBoundingClientRect():null;
      const hit=q?document.elementFromPoint(q.left+q.width/2,q.top+q.height/2):null;
      return {bw:document.body.scrollWidth, cw:document.documentElement.clientWidth,
        sw:document.documentElement.scrollWidth,
        wtW:q?+q.width.toFixed(1):null, wtH:q?+q.height.toFixed(1):null,
        owns: !!(hit && wt && wt.contains(hit))};
    });
    const ok = r.bw<=r.cw+1 && r.sw<=r.cw+1 && r.wtW>=29 && r.owns;
    if(!ok){bad++; rows.push([t,r]);}
  }
  console.log(w, rows.length? JSON.stringify(rows): 'all 8 themes OK');
  await p.close();
}
console.log('BAD =', bad);
await b.close();
