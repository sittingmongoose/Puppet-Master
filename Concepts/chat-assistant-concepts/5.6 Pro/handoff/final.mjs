import {chromium} from 'playwright';import {pathToFileURL} from 'url';import fs from 'fs';
const OUT='/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro/handoff/w6/waves/shots';
const b=await chromium.launch({headless:true,args:['--disable-gpu','--allow-file-access-from-files','--no-sandbox']});
const p=await b.newPage({viewport:{width:1440,height:900}});
const errs=[];p.on('console',m=>{if(m.type()==='error'||m.type()==='warning')errs.push(m.type()+':'+m.text())});p.on('pageerror',e=>errs.push('PE '+e));
await p.goto(pathToFileURL("/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro/PM_Chat_Assistant_5.6_Pro_Standalone.html").href,{waitUntil:'load'});
await p.waitForFunction(()=>window.__PM56_BOOT_OK===true&&window.PM56_DEMO);
const R={};
R.activityBar=await p.evaluate(()=>[...document.querySelectorAll('.activity-item')].map(e=>e.textContent.replace(/\s+/g,' ').trim()));
await p.locator('[data-hover-domain="subagents"]').hover(); await p.waitForTimeout(500);
R.hoverCard=await p.evaluate(()=>{const h=document.querySelector('.hover-card');return h?{text:h.textContent.replace(/\s+/g,' ').trim(),chips:[...h.querySelectorAll('.hover-stat')].map(x=>x.textContent)}:null;});
await p.evaluate(()=>PM56_DEMO.openActivity('subagents')); await p.waitForTimeout(400);
R.panelHeads=await p.evaluate(()=>[...document.querySelectorAll('.activity-section-head')].map(e=>e.textContent.replace(/\s+/g,' ').trim()));
R.summaryCard=await p.evaluate(()=>document.querySelector('.activity-summary-card')?.textContent.replace(/\s+/g,' ').trim().slice(0,110));
// composer draft affordance appears only after a send
R.draftsBefore=await p.evaluate(()=>!!document.querySelector('[data-action="restore-draft"]'));
await p.evaluate(()=>{const t=document.querySelector('[data-input="composer"]');t.value='a test draft';t.dispatchEvent(new Event('input',{bubbles:true}));});
await p.locator('[data-action="send"]').click(); await p.waitForTimeout(500);
R.draftsAfter=await p.evaluate(()=>document.querySelector('[data-action="restore-draft"]')?.textContent.trim());
await p.locator('[data-action="restore-draft"]').click(); await p.waitForTimeout(300);
R.draftRestored=await p.evaluate(()=>document.querySelector('[data-input="composer"]').value);
// 8 themes: no console errors, no horizontal overflow
R.themes=[];
for(const th of await p.evaluate(()=>PM56_DATA.themes.map(t=>t.id))){
  await p.evaluate(t=>PM56_DEMO.setTheme(t),th); await p.waitForTimeout(220);
  const o=await p.evaluate(()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth}));
  R.themes.push({th,overflow:o.sw-o.cw});
}
await p.evaluate(()=>PM56_DEMO.setTheme('basic-dark'));
await p.waitForTimeout(200);
await p.screenshot({path:`${OUT}/final-dark.png`});
await p.evaluate(()=>PM56_DEMO.setTheme(PM56_DATA.themes.find(t=>/light/i.test(t.id))?.id||'basic-dark'));
await p.waitForTimeout(300);
await p.screenshot({path:`${OUT}/final-light.png`});
R.errors=errs;
console.log(JSON.stringify(R,null,1));
await b.close();
