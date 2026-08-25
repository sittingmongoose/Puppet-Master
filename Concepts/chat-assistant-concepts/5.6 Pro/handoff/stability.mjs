import {chromium} from 'playwright';
import {pathToFileURL} from 'url';
const target="/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro/PM_Chat_Assistant_5.6_Pro_Standalone.html";
const b=await chromium.launch({headless:true,args:['--disable-gpu','--allow-file-access-from-files','--no-sandbox']});
const p=await b.newPage({viewport:{width:1440,height:900}});
const errs=[];p.on('console',m=>{if(m.type()==='error'||m.type()==='warning')errs.push(m.type()+':'+m.text())});p.on('pageerror',e=>errs.push(''+e));
await p.goto(pathToFileURL(target).href,{waitUntil:'load'});
await p.waitForFunction(()=>window.__PM56_BOOT_OK===true);
await p.evaluate(()=>{window.PM56_DEMO.pinActivity();window.PM56_DEMO.openActivity('goal');window.PM56_DEMO.startWorking();});
await p.waitForTimeout(700);
// tag the live nodes, then let >=3 work ticks pass; a remount loses the tag
await p.evaluate(()=>{
  window.__tag=0;
  document.querySelectorAll('.goal-block, .goal-phase, .goal-counter, .goal-budget, .goal-blocker, .goal-actions, .goal-chip, .goal-sidebar')
    .forEach(e=>{e.__pmTag=++window.__tag;});
  window.__tagCount=window.__tag;
});
await p.waitForTimeout(7000);
console.log(JSON.stringify(await p.evaluate(()=>{
  const live=[...document.querySelectorAll('.goal-block, .goal-phase, .goal-counter, .goal-budget, .goal-blocker, .goal-actions, .goal-chip, .goal-sidebar')];
  const kept=live.filter(e=>e.__pmTag).length;
  return {taggedAtStart:window.__tagCount, liveNow:live.length, survivedTicks:kept,
    remounted:live.filter(e=>!e.__pmTag).map(e=>String(e.className).split(' ')[0]),
    animRunningNow:live.filter(e=>getComputedStyle(e).animationName!=='none'&&getComputedStyle(e).animationPlayState==='running'
      &&getComputedStyle(e).animationIterationCount!=='infinite').map(e=>String(e.className).split(' ')[0])};
}),null,1));
console.log('console errors/warnings:',errs);
await b.close();
