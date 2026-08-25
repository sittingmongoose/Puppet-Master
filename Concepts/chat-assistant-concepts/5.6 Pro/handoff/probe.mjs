import {chromium} from 'playwright';import {pathToFileURL} from 'url';
const b=await chromium.launch({headless:true,args:['--disable-gpu','--allow-file-access-from-files','--no-sandbox']});
const p=await b.newPage({viewport:{width:1440,height:900}});
const errs=[];p.on('console',m=>{if(m.type()==='error'||m.type()==='warning')errs.push(m.type()+':'+m.text())});p.on('pageerror',e=>errs.push('PE '+e));
await p.goto(pathToFileURL("/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro/PM_Chat_Assistant_5.6_Pro_Standalone.html").href,{waitUntil:'load'});
await p.waitForFunction(()=>window.__PM56_BOOT_OK===true&&window.PM56_DEMO);
const R={};
R.registeredBeforeBoot=await p.evaluate(()=>({slots:Object.keys(window.PM56_EXT._slots),actions:Object.keys(window.PM56_EXT._actions),version:window.PM56_EXT.version}));
// slot rendered on the FIRST paint (no re-render needed)
R.headerSlot=await p.evaluate(()=>{const e=document.querySelector('.chat-header [data-action="ext-probe"]');if(!e)return null;const r=e.getBoundingClientRect();const t=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return {present:true,isTop:!!(t&&e.contains(t)),k:e.dataset.k};});
R.messageMeta=await p.evaluate(()=>document.querySelectorAll('[data-k="extmeta"]').length);
// action dispatch
await p.locator('[data-action="ext-probe"]').click();await p.waitForTimeout(200);
R.actionFired=await p.evaluate(()=>!!window.__EXT_PROBE_FIRED);
// panel replacement
await p.evaluate(()=>PM56_DEMO.openActivity('goal'));await p.waitForTimeout(300);
R.panelReplaced=await p.evaluate(()=>{const e=document.querySelector('[data-k="extpanel"]');return e?{text:e.textContent,siblingSections:document.querySelectorAll('.activity-section').length}:null;});
// goal-lifecycle override
await p.evaluate(()=>{const b=document.querySelector('[data-action="pause-goal"]');if(b)b.click();});
await p.waitForTimeout(200);
R.goalOverride=await p.evaluate(()=>!!window.__EXT_GOAL_OVERRIDE);
// data-k survival across the 2s work tick: the node must NOT be remounted
await p.evaluate(()=>{PM56_DEMO.startWorking();});
const id1=await p.evaluate(()=>{const e=document.querySelector('[data-k="extmeta"]');if(!e)return null;e.__mark=Math.random();return e.__mark;});
await p.waitForTimeout(4500);
R.dataKSurvivedTicks=await p.evaluate(m=>{const e=document.querySelector('[data-k="extmeta"]');return e?e.__mark===m:null;},id1);
R.errors=errs;
console.log(JSON.stringify(R,null,1));
await b.close();
