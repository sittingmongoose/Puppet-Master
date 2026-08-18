import { chromium } from '/mnt/Cursor/PuppetMaster/Concepts/usage-concepts/QwenUsageConcept/.verify/node_modules/playwright-core/index.mjs';
import { writeFileSync } from 'node:fs'; import os from 'node:os'; import path from 'node:path';
const R=[]; const rec=(id,n,p,d)=>{R.push({id,n,p,d});console.log(`${p?'PASS':'FAIL'}  ${id}  ${n}\n      ${d}`);};
const ctx=await chromium.launchPersistentContext(path.join(os.tmpdir(),'w6-'+process.pid),
 {executablePath:'/home/sittingmongoose/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome',
  headless:true,args:['--no-sandbox','--disable-gpu'],viewport:{width:1600,height:1000}});
const p=await ctx.newPage(); const errs=[];
p.on('pageerror',e=>errs.push(String(e))); p.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
await p.goto('file:///mnt/Cursor/PuppetMaster/Concepts/usage-concepts/QwenUsageConcept/u11-prism.html',{waitUntil:'load',timeout:30000});
await p.waitForTimeout(1000);

const linkage=await p.evaluate(()=>{
  const tabs=[...document.querySelectorAll('.u11-item[data-tab]')];
  const bad=tabs.filter(t=>{const c=t.getAttribute('aria-controls');return !c||!document.getElementById(c);});
  const panes=[...document.querySelectorAll('.u11-pane[data-pane]')];
  const badP=panes.filter(s=>{const l=s.getAttribute('aria-labelledby');return !s.id||!l||!document.getElementById(l);});
  return {tabs:tabs.length,badTabs:bad.length,panes:panes.length,badPanes:badP.length};
});
rec('A12-01a','every room button points at a pane that exists',linkage.badTabs===0&&linkage.badPanes===0,
  `tabs=${linkage.tabs} broken=${linkage.badTabs} | panes=${linkage.panes} broken=${linkage.badPanes}`);

const nav=await p.evaluate(async()=>{
  const before=document.querySelector('.u11-item[aria-current="page"]');
  const b=document.querySelector('.u11-item[data-tab="costs"]'); b.click();
  await new Promise(r=>setTimeout(r,700));
  const after=document.querySelector('.u11-item[aria-current="page"]');
  const live=document.getElementById('u11RoomAnnounce');
  return {beforeTab:before&&before.getAttribute('data-tab'),afterTab:after&&after.getAttribute('data-tab'),
          announced:live?live.textContent:null};
});
rec('A12-01b','a room change moves aria-current and is announced',
  nav.afterTab==='costs'&&!!nav.announced&&/costs/i.test(nav.announced),
  `aria-current ${nav.beforeTab} -> ${nav.afterTab} | announced="${nav.announced}"`);

const disc=await p.evaluate(async()=>{
  const b=document.querySelector('[data-disc="advanced"]'); b.click();
  await new Promise(r=>setTimeout(r,400));
  return [...document.querySelectorAll('#u11Disc [data-disc]')].map(x=>({l:x.getAttribute('data-disc'),c:x.getAttribute('aria-checked'),r:x.getAttribute('role')}));
});
rec('A12-01c','disclosure exposes its selected level',
  disc.filter(d=>d.c==='true').length===1&&disc.every(d=>d.r==='radio'),
  JSON.stringify(disc));

const closed=await p.evaluate(()=>{
  const pop=document.getElementById('u11Pop');
  const cs=getComputedStyle(pop);
  const opts=document.querySelectorAll('#u11PopList [role="option"]').length;
  const focusable=[...pop.querySelectorAll('button,[tabindex]:not([tabindex="-1"])')].filter(e=>e.checkVisibility?e.checkVisibility({visibilityProperty:true,contentVisibilityAuto:true}):getComputedStyle(e).visibility!=='hidden').length;
  return {visibility:cs.visibility,options:opts,focusableWhenClosed:focusable,
          expanded:document.querySelector('[data-scope-open]').getAttribute('aria-expanded')};
});
rec('A12-03a','closed scope picker is out of the tab order and the a11y tree',
  closed.visibility==='hidden'&&closed.focusableWhenClosed===0,
  `visibility=${closed.visibility} focusableWhenClosed=${closed.focusableWhenClosed} phantomOptions=${closed.options} (hidden by visibility)`);

const openState=await p.evaluate(async()=>{
  const t=document.querySelector('[data-scope-open]'); t.focus(); t.click();
  await new Promise(r=>setTimeout(r,500));
  const pop=document.getElementById('u11Pop');
  return {expanded:document.querySelector('[data-scope-open]').getAttribute('aria-expanded'),
          modal:pop.getAttribute('aria-modal'),visibility:getComputedStyle(pop).visibility,
          focused:document.activeElement&&document.activeElement.className};
});
rec('A12-03b','open scope picker declares expanded and modal, and takes focus',
  openState.expanded==='true'&&openState.modal==='true'&&/u11-pop-row/.test(openState.focused||''),
  JSON.stringify(openState));

const trap=await p.evaluate(async()=>{
  const before=document.activeElement;
  for(let i=0;i<40;i++){ const ev=new KeyboardEvent('keydown',{key:'Tab',bubbles:true}); document.activeElement.dispatchEvent(ev); }
  return {stillInside:!!document.getElementById('u11Pop').contains(document.activeElement)};
});
rec('A12-03c','focus does not escape the open dialog',trap.stillInside,`activeElement inside popover=${trap.stillInside}`);

await p.keyboard.press('Escape'); await p.waitForTimeout(300);
const esc=await p.evaluate(()=>({returned:document.activeElement&&document.activeElement.hasAttribute('data-scope-open')}));
rec('A12-03d','Escape returns focus to the trigger',esc.returned,`focus back on trigger=${esc.returned}`);

const dead=await p.evaluate(async()=>{
  const btns=[...document.querySelectorAll('[data-u11-act="opensettings"]')];
  if(!btns.length) return {found:0};
  const sp=document.getElementById('u11SheetSprout');
  if(sp){sp.hidden=true;sp.classList.remove('is-open');}
  btns[0].click(); await new Promise(r=>setTimeout(r,400));
  const sp2=document.getElementById('u11SheetSprout');
  return {found:btns.length,opened:sp2&&!sp2.hidden};
});
rec('A12-02','the widget "Open Usage settings" buttons now do something',
  dead.found>0&&dead.opened,`buttons=${dead.found} sheetOpened=${dead.opened}`);

rec('ERR','no page errors',errs.length===0,`errors=${errs.length} ${JSON.stringify(errs.slice(0,3))}`);
await ctx.close();
const pass=R.filter(x=>x.p).length;
writeFileSync('/tmp/claude-1000/-mnt-Cursor-PuppetMaster/7e74d8f5-7c2a-4eeb-8947-13056b4b2e5f/scratchpad/w6-a11y-results.json',JSON.stringify({pass,total:R.length,R},null,1));
console.log(`\n${pass}/${R.length} a11y checks pass`);
process.exit(pass===R.length?0:1);
