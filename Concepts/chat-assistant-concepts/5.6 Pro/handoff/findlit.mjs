import {chromium} from 'playwright';
import {pathToFileURL} from 'url';
const target="/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro/PM_Chat_Assistant_5.6_Pro_Standalone.html";
const b=await chromium.launch({headless:true,args:['--disable-gpu','--allow-file-access-from-files','--no-sandbox']});
const p=await b.newPage({viewport:{width:1440,height:900}});
await p.goto(pathToFileURL(target).href,{waitUntil:'load'});
await p.waitForFunction(()=>window.__PM56_BOOT_OK===true);
await p.evaluate(()=>{window.PM56_DEMO.pinActivity();window.PM56_DEMO.openActivity('goal');});
await p.waitForTimeout(600);
await p.evaluate(()=>document.querySelector('.chat-header .goal-chip').click());
await p.waitForTimeout(600);
console.log(JSON.stringify(await p.evaluate(()=>{
  const LIT=['Phase 2/4','68%','Revision 4','Goal Mode','Exact blocker','Evaluating composite index column order','1. Measure the current path.'];
  const out={};
  for(const l of LIT){
    const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
    const hits=[];
    let n; while((n=w.nextNode())){ if(n.nodeValue&&n.nodeValue.includes(l)){
      let e=n.parentElement, path=[];
      while(e&&path.length<5){path.push(e.tagName+(e.className?'.'+String(e.className).split(' ').filter(Boolean).slice(0,2).join('.'):''));e=e.parentElement;}
      hits.push(path.join(' < '));
    }}
    out[l]=hits.slice(0,3);
  }
  return out;
}),null,1));
await b.close();
