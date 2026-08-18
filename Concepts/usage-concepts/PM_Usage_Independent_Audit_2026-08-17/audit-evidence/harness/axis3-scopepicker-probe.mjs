import { chromium } from '/mnt/Cursor/PuppetMaster/Concepts/usage-concepts/QwenUsageConcept/.verify/node_modules/playwright-core/index.mjs';
import fs from 'node:fs';
const CONCEPT='/mnt/Cursor/PuppetMaster/Concepts/usage-concepts/QwenUsageConcept/u11-prism.html';
const EXEC='/home/sittingmongoose/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';
const SP='/tmp/claude-1000/-mnt-Cursor-PuppetMaster/7e74d8f5-7c2a-4eeb-8947-13056b4b2e5f/scratchpad/';
const b=await chromium.launch({executablePath:EXEC,args:['--headless','--disable-gpu','--no-sandbox','--allow-file-access-from-files']});
const p=await (await b.newContext({viewport:{width:1700,height:1500}})).newPage();
await p.goto('file://'+CONCEPT,{waitUntil:'load'});await p.waitForTimeout(1800);
// open the scope picker
await p.evaluate(()=>{const b=document.getElementById('u11Scope')||document.querySelector('[data-scope]');if(b)b.click();});
await p.waitForTimeout(700);
let rows = await p.evaluate(()=>{
  const l=document.getElementById('u11PopList');
  if(!l) return {noList:true};
  return { open: l.offsetHeight>0,
    rows: Array.from(l.querySelectorAll('.u11-pop-row')).map(r=>({
      id:r.getAttribute('data-scopeid'),
      name:r.querySelector('.u11-pop-name')?r.querySelector('.u11-pop-name').innerText.trim():null,
      val:r.querySelector('.u11-pop-val')?r.querySelector('.u11-pop-val').innerText.trim():null,
      meta:r.querySelector('.u11-pop-meta')?r.querySelector('.u11-pop-meta').innerText.trim():null,
      dotCls:r.querySelector('.u11-pop-dot')?r.querySelector('.u11-pop-dot').className:null,
      level:(r.className.match(/lv(\d)/)||[])[1]
    })) };
});
if (rows.noList || !rows.rows || !rows.rows.length) {
  // try the rail scope chip
  await p.evaluate(()=>{ const els=document.querySelectorAll('[data-scope], #u11Scope, .u11-scope'); els.forEach(e=>{ try{e.click();}catch(x){} }); });
  await p.waitForTimeout(800);
  rows = await p.evaluate(()=>{
    const l=document.getElementById('u11PopList');
    return { open: l? l.offsetHeight>0 : null, rows: l? Array.from(l.querySelectorAll('.u11-pop-row')).map(r=>({
      id:r.getAttribute('data-scopeid'),
      name:r.querySelector('.u11-pop-name')?r.querySelector('.u11-pop-name').innerText.trim():null,
      val:r.querySelector('.u11-pop-val')?r.querySelector('.u11-pop-val').innerText.trim():null,
      meta:r.querySelector('.u11-pop-meta')?r.querySelector('.u11-pop-meta').innerText.trim():null,
      dotCls:r.querySelector('.u11-pop-dot')?r.querySelector('.u11-pop-dot').className:null,
      level:(r.className.match(/lv(\d)/)||[])[1]
    })):[] };
  });
}
fs.writeFileSync(SP+'axis3-scopepicker.json',JSON.stringify(rows,null,2));
await p.screenshot({path:SP+'axis3-scopepicker.png'});
console.log('open',rows.open,'rows',(rows.rows||[]).length);
console.log('negative percents:',JSON.stringify((rows.rows||[]).filter(r=>r.val && r.val.indexOf('-')===0),null,1));
await b.close();
