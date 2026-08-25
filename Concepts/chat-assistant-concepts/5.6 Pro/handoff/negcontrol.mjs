/* Negative control: can the new assertion go RED on purpose?
   Injects three faults into the LIVE page and re-runs the same audit logic. */
import pw from '/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro/node_modules/playwright-core/index.js';
const { chromium } = pw; import path from 'path';
const ROOT='/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro';
const b=await chromium.launch({headless:true,executablePath:process.env.HOME+'/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome',args:['--no-sandbox','--allow-file-access-from-files','--disable-gpu']});
const p=await b.newPage({viewport:{width:1440,height:1200}});
await p.goto('file://'+path.join(ROOT,'PM_Chat_Assistant_5.6_Pro_Standalone.html'),{waitUntil:'load'});
await p.waitForFunction(()=>window.__PM56_BOOT_OK===true&&window.PM56_DEMO);

const faults = [
  ['regression: panel reverts to the globally selected model', p=>p.evaluate(()=>{
      const el=[...document.querySelectorAll('.message[data-message-id="route-08"] .detail-kv')].find(d=>d.querySelector('label').innerText.trim()==='MODEL');
      if(el) el.querySelector('strong').textContent='Claude Sonnet 4.6';})],
  ['regression: an invented cost row reappears beside the real one', p=>p.evaluate(()=>{
      const host=document.querySelector('.message[data-message-id="route-08"] .message-details');
      const d=document.createElement('div'); d.className='detail-kv';
      d.innerHTML='<label>ESTIMATED COST</label><strong>$0.084</strong>'; host.appendChild(d);})],
  ['regression: a raw underscored enum reaches the screen', p=>p.evaluate(()=>{
      const el=[...document.querySelectorAll('.message[data-message-id="route-08"] .detail-kv')].find(d=>d.querySelector('label').innerText.trim()==='MODE');
      if(el) el.querySelector('strong').textContent='deep_plan';})]
];

async function audit(){
  return p.evaluate(()=>{
    const t=window.PM56_DATA.threads.find(x=>x.id==='route'); const m=t.messages.find(x=>x.id==='route-08'); const r=m.runtime;
    const el=document.querySelector('.message[data-message-id="route-08"] .message-details');
    const panel={}; for(const d of el.querySelectorAll('.detail-kv')) panel[d.querySelector('label').innerText.trim()]=d.querySelector('strong').innerText.trim();
    const bad=[];
    if(panel.MODEL!==r.model) bad.push(`MODEL panel="${panel.MODEL}" fixture="${r.model}"`);
    for(const [k,v] of Object.entries(panel)) if(/^[a-z]+_[a-z]+$/.test(String(v))) bad.push(`${k}: raw enum "${v}"`);
    for(const [k,v] of Object.entries(panel)) if(/^\$/.test(String(v))){ const n=parseFloat(v.replace('$',''));
      if(Math.abs(n-r.cost.apiUsd)>0.001 && Math.abs(n-r.cost.planUsd)>0.001) bad.push(`${k}="${v}" matches no fixture cost`); }
    return bad;
  });
}
await p.evaluate(()=>PM56_DEMO.selectThread('route')); await p.waitForTimeout(200);
await p.evaluate(()=>{const b=document.querySelector('.message[data-message-id="route-08"] [data-action="message-details"]'); if(b)b.click();});
await p.waitForTimeout(200);
console.log('baseline (unmodified page)          ->', JSON.stringify(await audit()));
for(const [name,inject] of faults){
  await p.evaluate(()=>{const b=document.querySelector('.message[data-message-id="route-08"] [data-action="message-details"]'); if(b&&!document.querySelector('.message[data-message-id="route-08"] .message-details'))b.click();});
  await inject(p); await p.waitForTimeout(60);
  const r=await audit();
  console.log(`${(name+' ').padEnd(52,'.')} ${r.length?'CAUGHT  '+JSON.stringify(r):'*** MISSED ***'}`);
  await p.reload({waitUntil:'load'}); await p.waitForFunction(()=>window.__PM56_BOOT_OK===true&&window.PM56_DEMO);
  await p.evaluate(()=>PM56_DEMO.selectThread('route')); await p.waitForTimeout(200);
  await p.evaluate(()=>{const b=document.querySelector('.message[data-message-id="route-08"] [data-action="message-details"]'); if(b)b.click();}); await p.waitForTimeout(180);
}
await b.close();
