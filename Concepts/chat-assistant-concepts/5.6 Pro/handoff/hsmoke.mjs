import {chromium} from 'playwright';import {pathToFileURL} from 'url';
const FILE="/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro/PM_Chat_Assistant_5.6_Pro_Standalone.html";
const b=await chromium.launch({headless:true,args:['--disable-gpu','--allow-file-access-from-files','--no-sandbox']});
const p=await b.newPage({viewport:{width:1440,height:900}});
const errs=[];p.on('console',m=>{if(m.type()==='error'||m.type()==='warning')errs.push(m.type()+':'+m.text())});p.on('pageerror',e=>errs.push('PE '+e));
await p.goto(pathToFileURL(FILE).href,{waitUntil:'load'});
await p.waitForFunction(()=>window.__PM56_BOOT_OK===true&&window.PM56_DEMO);
await p.waitForTimeout(600);
const R={};
R.boot=await p.evaluate(()=>({
  phDrawer:document.body.dataset.phDrawer,
  historyMode:PM56_DEMO.getState().historyMode,
  flyout:!!document.querySelector('.history-flyout'),
  panel:!!document.querySelector('.history-panel'),
  chrome:!!document.querySelector('.ph-chrome'),
  vars:{x:getComputedStyle(document.documentElement).getPropertyValue('--ph-x'),pane:getComputedStyle(document.documentElement).getPropertyValue('--ph-pane')},
}));
R.geom=await p.evaluate(()=>{
  const f=document.querySelector('.history-flyout'), pane=document.querySelector('.assistant-pane');
  if(!f||!pane) return null;
  const fr=f.getBoundingClientRect(), pr=pane.getBoundingClientRect();
  const g=document.querySelector('.assistant-grid');
  return {fl:fr.left,fw:fr.width,ft:fr.top,fh:fr.height,paneLeft:pr.left,paneW:pr.width,
          gridPadLeft:getComputedStyle(g).paddingLeft, transform:getComputedStyle(f).transform};
});
// switch to take 6 (variants[1]=5)
await p.evaluate(()=>PM56_DEMO.setVariant(1,5));await p.waitForTimeout(400);
R.take6=await p.evaluate(()=>{
  const st=[...document.querySelectorAll('.history-flyout .ph-status')];
  const seen={};st.forEach(e=>{seen[e.dataset.status]=(seen[e.dataset.status]||0)+1});
  const row=document.querySelector('.history-flyout .thread-row');
  return {count:st.length,statuses:seen,rowPad:row?getComputedStyle(row).padding:null,rowH:row?row.getBoundingClientRect().height:null,
    variantAttr:document.querySelector('.history-flyout')?.dataset.historyVariant};
});
R.errors=errs;
console.log(JSON.stringify(R,null,1));
await b.close();
