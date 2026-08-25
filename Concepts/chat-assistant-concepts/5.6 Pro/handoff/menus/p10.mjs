import { chromium } from 'playwright-core';
const EXE='/home/sittingmongoose/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';
const URL='file:///mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6%20Pro/index.html';
const b=await chromium.launch({executablePath:EXE});
const p=await b.newPage({viewport:{width:1440,height:900}});
await p.goto(URL,{waitUntil:'load'}); await p.waitForTimeout(500);
const out = await p.evaluate(async ()=>{
  const rows=[];
  for(let i=0;i<14;i++){
    const kind = ['permissions','mode','persona'][i%3];
    const btn=document.querySelector(`.selector-button[data-kind="${kind}"]`);
    btn.click();
    await new Promise(x=>setTimeout(x,520));
    const m=document.querySelector('#pmOverlayRoot .overlay-menu[data-overlay="root-menu"]');
    const a=btn.getBoundingClientRect(), q=m.getBoundingClientRect();
    const impliedH = a.top - 7 - q.top;
    rows.push({i,kind, top:+q.top.toFixed(1), h:+q.height.toFixed(1), w:+q.width.toFixed(1),
      impliedH:+impliedH.toFixed(1), delta:+(impliedH-q.height).toFixed(1),
      sw:m.scrollWidth, cw:m.clientWidth, sh:m.scrollHeight, ch:m.clientHeight});
    document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
    await new Promise(x=>setTimeout(x,420));
  }
  return rows;
});
for(const r of out) console.log(JSON.stringify(r));
await b.close();
