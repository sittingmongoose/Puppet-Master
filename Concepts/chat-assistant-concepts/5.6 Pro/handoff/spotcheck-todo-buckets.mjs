import pw from '/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro/node_modules/playwright-core/index.js';
const { chromium } = pw;
import path from 'path';
const ROOT='/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro';
const b=await chromium.launch({headless:true,executablePath:process.env.HOME+'/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome',args:['--no-sandbox','--allow-file-access-from-files','--disable-gpu']});
const p=await b.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
const errs=[]; p.on('pageerror',e=>errs.push(String(e))); p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.goto('file://'+path.join(ROOT,'PM_Chat_Assistant_5.6_Pro_Standalone.html'),{waitUntil:'load'});
await p.waitForFunction(()=>window.__PM56_BOOT_OK===true&&window.PM56_DEMO);

const r=await p.evaluate(()=>{
  const D=window.PM56_DATA;
  const counts={}; for(const t of D.todos) counts[t.status]=(counts[t.status]||0)+1;
  const btn=[...document.querySelectorAll('.activity-item[data-hover-domain]')].find(b=>b.dataset.hoverDomain==='todo');
  return { counts, total:D.todos.length,
    paintedCount: btn?.querySelector('.count')?.innerText.trim(),
    barLabel: btn?.innerText.replace(/\s+/g,' ').trim() };
});
// hover card carries the derived detail line
await p.locator('[data-hover-domain="todo"]').hover();
await p.waitForTimeout(400);
const hover=await p.evaluate(()=>{
  const c=document.querySelector('.hover-card'); if(!c) return null;
  return c.innerText.replace(/\s+/g,' ').trim();
});
const {counts,total}=r;
const done=counts.completed||0;
const open=(counts.in_progress||0)+(counts.pending||0)+(counts.verifying||0)+(counts.replanned||0);
const active=(counts.in_progress||0)+(counts.verifying||0);
const blocked=counts.blocked||0, skipped=counts.skipped||0;
console.log('fixture statuses     ', JSON.stringify(counts), 'total', total);
console.log('bucket sum           ', `${done} done + ${open} open + ${blocked} blocked + ${skipped} skipped = ${done+open+blocked+skipped}`);
console.log('every todo bucketed  ', done+open+blocked+skipped===total);
console.log('painted count pill   ', r.paintedCount, ' expected', `${done}/${total}`);
console.log('activity bar label   ', r.barLabel);
console.log('hover card           ', hover);
console.log('page/console errors  ', errs.length?errs:'none');
await b.close();
