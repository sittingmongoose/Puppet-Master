import {chromium} from 'playwright';
import {pathToFileURL} from 'url';
const target="/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro/PM_Chat_Assistant_5.6_Pro_Standalone.html";
const b=await chromium.launch({headless:true,args:['--disable-gpu','--allow-file-access-from-files','--no-sandbox']});
const p=await b.newPage({viewport:{width:1440,height:900}});
const errs=[];p.on('pageerror',e=>errs.push(''+e));
await p.goto(pathToFileURL(target).href,{waitUntil:'load'});
await p.waitForFunction(()=>window.__PM56_BOOT_OK===true);
await p.evaluate(()=>{window.PM56_DEMO.pinActivity();window.PM56_DEMO.openActivity('goal');});
await p.waitForTimeout(500);
const snap=()=>p.evaluate(()=>({s:window.PM56_DATA.goal.status,budget:window.PM56_DATA.goal.budget&&window.PM56_DATA.goal.budget.used,
  replans:window.PM56_DATA.goal.replans.length, cur:window.PM56_DATA.goal.currentPhaseId,
  done:window.PM56_DATA.goal.phases.filter(x=>x.status==='completed').length,
  barCount:(document.querySelector('.activity-item[data-hover-domain="goal"] .count')||{}).textContent}));
console.log('stock      ',JSON.stringify(await snap()));
// mutate hard: clear the goal entirely
await p.evaluate(()=>document.querySelector('.activity-panel [data-action="clear-goal"]').click());
await p.waitForTimeout(200);
await p.evaluate(()=>document.querySelector('.activity-panel [data-action="goal-clear-confirm"]').click());
await p.waitForTimeout(300);
console.log('cleared    ',JSON.stringify(await snap()));
// the header Reset button, exactly as a user would press it
await p.evaluate(()=>document.querySelector('[data-action="reset-all"]').click());
await p.waitForTimeout(700);
await p.evaluate(()=>{window.PM56_DEMO.pinActivity();window.PM56_DEMO.openActivity('goal');});
await p.waitForTimeout(400);
console.log('after Reset',JSON.stringify(await snap()));
console.log('reset toast shown:', await p.evaluate(()=>[...document.querySelectorAll('.toast strong')].map(x=>x.textContent)));
console.log('page errors:',errs);
await b.close();
