import {chromium} from 'playwright';
import {pathToFileURL} from 'url';
const target="/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro/PM_Chat_Assistant_5.6_Pro_Standalone.html";
const b=await chromium.launch({headless:true,args:['--disable-gpu','--allow-file-access-from-files','--no-sandbox']});
const p=await b.newPage({viewport:{width:1440,height:900}});
const errs=[];p.on('console',m=>{if(m.type()==='error'||m.type()==='warning')errs.push(m.type()+':'+m.text())});p.on('pageerror',e=>errs.push('PE '+e));
await p.goto(pathToFileURL(target).href,{waitUntil:'load'});
await p.waitForFunction(()=>window.__PM56_BOOT_OK===true&&window.PM56_DEMO);
await p.locator('[data-action="open-menu"][data-menu="model"]').click();
await p.waitForTimeout(400);
console.log('BASE',JSON.stringify(await p.evaluate(()=>{
  const rows=[...document.querySelectorAll('.model-row')].map(r=>r.getBoundingClientRect().height);
  const labels=[...document.querySelectorAll('.menu-section-label')].map(r=>r.getBoundingClientRect().height);
  const search=document.querySelector('.menu-search').getBoundingClientRect().height;
  const scroll=document.querySelector('.model-scroll');
  const cs=getComputedStyle(scroll);
  const pitch=(()=>{const r=[...document.querySelectorAll('.model-row')];return r.length>1?r[1].getBoundingClientRect().top-r[0].getBoundingClientRect().top:null;})();
  return {rows,labels,search,pitch,scrollH:scroll.scrollHeight,clientH:scroll.clientHeight,pad:cs.padding,menuH:document.querySelector('.model-menu').getBoundingClientRect().height,layoutH:document.querySelector('.model-layout').getBoundingClientRect().height};
})));
await p.keyboard.press('Escape');
// now blow the list up to force overflow
await p.evaluate(()=>{
  const base=PM56_DATA.models.slice();
  for(let i=0;i<4;i++) for(const m of base) PM56_DATA.models.push({...m,id:m.id+'-x'+i,name:m.name+' x'+i});
});
await p.locator('[data-action="open-menu"][data-menu="model"]').click();
await p.waitForTimeout(400);
console.log('BIG',JSON.stringify(await p.evaluate(()=>{
  const s=document.querySelector('.model-scroll');
  const cs=getComputedStyle(s);
  const before=s.scrollTop; s.scrollTop=99999; const after=s.scrollTop;
  const rows=[...document.querySelectorAll('.model-row')];
  const sr=s.getBoundingClientRect();
  let painted=0; for(const r of rows){const rr=r.getBoundingClientRect();const cy=rr.top+rr.height/2;if(cy<sr.top||cy>sr.bottom)continue;const t=document.elementFromPoint(rr.left+rr.width/2,cy);if(t&&r.contains(t))painted++;}
  return {overflowY:cs.overflowY,rows:rows.length,painted,clientH:s.clientHeight,scrollH:s.scrollHeight,didScroll:after>before,scrolledTo:after,menuH:document.querySelector('.model-menu').getBoundingClientRect().height,menuBottom:document.querySelector('.model-menu').getBoundingClientRect().bottom,vpH:innerHeight};
})));
// after scrolling to the bottom, is the LAST row painted?
console.log('LASTROW',JSON.stringify(await p.evaluate(()=>{
  const rows=[...document.querySelectorAll('.model-row')];const last=rows[rows.length-1];const r=last.getBoundingClientRect();
  const t=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);
  return {text:last.textContent.trim().slice(0,40),isTop:!!(t&&last.contains(t)),top:r.top,bottom:r.bottom};
})));
await p.screenshot({path:'/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro/handoff/w6/waves/shots/model-scrolled.png'});
console.log('ERRS',JSON.stringify(errs));
await b.close();
