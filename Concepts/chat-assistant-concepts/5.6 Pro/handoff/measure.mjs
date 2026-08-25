import {chromium} from 'playwright';
import {pathToFileURL} from 'url';
const target="/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro/PM_Chat_Assistant_5.6_Pro_Standalone.html";
const b=await chromium.launch({headless:true,args:['--disable-gpu','--allow-file-access-from-files','--no-sandbox']});
const p=await b.newPage({viewport:{width:1440,height:900}});
await p.goto(pathToFileURL(target).href,{waitUntil:'load'});
await p.waitForFunction(()=>window.__PM56_BOOT_OK===true);
await p.evaluate(()=>{window.PM56_DEMO.pinActivity();window.PM56_DEMO.openActivity('goal');});
await p.waitForTimeout(400);
console.log(JSON.stringify(await p.evaluate(()=>{
  const li=document.querySelector('.activity-panel .goal-phase.is-current');
  const q=s=>{const e=li.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();return {w:Math.round(r.width),h:Math.round(r.height),d:getComputedStyle(e).display};};
  const body=document.querySelector('.activity-panel .activity-section-body');
  const block=document.querySelector('.activity-panel .goal-block');
  return {panel:Math.round(document.querySelector('.activity-panel').getBoundingClientRect().width),
    body:Math.round(body.getBoundingClientRect().width),
    block:Math.round(block.getBoundingClientRect().width),
    row:q('.goal-phase-row'),num:q('.goal-phase-num'),glyph:q('.goal-phase-glyph'),
    copy:q('.goal-phase-copy'),title:q('.goal-phase-title'),sub:q('.goal-phase-sub'),
    state:q('.goal-phase-state'),badge:q('.goal-phase-badge'),
    subLines:getComputedStyle(li.querySelector('.goal-phase-sub')).webkitLineClamp,
    cols:getComputedStyle(li.querySelector('.goal-phase-row')).gridTemplateColumns,
    sectionH:Math.round(document.querySelector('.activity-panel [data-domain-section="goal"]').getBoundingClientRect().height)};
}),null,1));
await b.close();
