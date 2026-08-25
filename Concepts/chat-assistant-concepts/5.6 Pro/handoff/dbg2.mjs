import {chromium} from 'playwright';import {pathToFileURL} from 'url';
const T="/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro/PM_Chat_Assistant_5.6_Pro_Standalone.html";
const b=await chromium.launch({headless:true,args:['--disable-gpu','--allow-file-access-from-files','--no-sandbox']});
const p=await b.newPage({viewport:{width:1440,height:900}});
await p.goto(pathToFileURL(T).href,{waitUntil:'load'});
await p.waitForFunction(()=>window.__PM56_BOOT_OK===true&&window.PM56_DEMO);
await p.evaluate(()=>window.PM56_DEMO.openActivity('todo')); await p.waitForTimeout(500);
console.log(await p.evaluate(()=>{
  const pn=document.querySelector('.activity-panel.transient'); const st=document.querySelector('.chat-stage');
  const cs=getComputedStyle(pn), ss=getComputedStyle(st);
  const tr=document.querySelector('.transcript').getBoundingClientRect();
  return {gridRow:cs.gridRow,gridColumn:cs.gridColumn,pos:cs.position,bottom:cs.bottom,maxH:cs.maxHeight,width:cs.width,
    stagePos:ss.position, stageRect:st.getBoundingClientRect().toJSON(), panelRect:pn.getBoundingClientRect().toJSON(),
    transcript:tr.toJSON(), parent:pn.parentElement.className,
    stageRows:ss.gridTemplateRows};
}));
// experiment: what does a probe abspos child with grid-row:2 resolve to?
console.log('probe', await p.evaluate(()=>{
  const st=document.querySelector('.chat-stage');
  const d=document.createElement('div');
  d.style.cssText='position:absolute;grid-row:2;grid-column:1;inset:0;background:red';
  st.appendChild(d); const r=d.getBoundingClientRect().toJSON(); d.remove(); return r;}));
await b.close();
