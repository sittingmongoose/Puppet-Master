import {chromium} from 'playwright';
import {pathToFileURL} from 'url';
import fs from 'fs';
const target="/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro/PM_Chat_Assistant_5.6_Pro_Standalone.html";
const b=await chromium.launch({headless:true,args:['--disable-gpu','--allow-file-access-from-files','--no-sandbox']});
const p=await b.newPage({viewport:{width:1440,height:900}});
const errs=[];p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});p.on('pageerror',e=>errs.push('PAGEERROR '+e));
await p.goto(pathToFileURL(target).href,{waitUntil:'load',timeout:30000});
await p.waitForFunction(()=>window.__PM56_BOOT_OK===true&&window.PM56_DEMO,{timeout:15000});
await p.addInitScript(()=>{});
// install a MutationObserver-based harvester that never misses a transient node
await p.evaluate(()=>{
  window.__CLS=new Set();
  const eat=(root)=>{ if(!root||!root.querySelectorAll) return;
    const all=[root, ...root.querySelectorAll('*')];
    for(const el of all){ if(!el.classList) continue; for(const c of el.classList) window.__CLS.add(c); }
  };
  window.__eat=eat; eat(document.documentElement);
  new MutationObserver(ms=>{ for(const m of ms){ for(const n of m.addedNodes) eat(n);
     if(m.type==='attributes'&&m.target.classList) for(const c of m.target.classList) window.__CLS.add(c); } })
   .observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
});
const tick=(ms=60)=>p.waitForTimeout(ms);
const ev=(fn,arg)=>p.evaluate(fn,arg).catch(e=>null);

// exercise: every variant family/option
const fams=await p.evaluate(()=>{const s=window.PM56_DEMO.getState();return s.variants.length;});
for(let f=0;f<fams;f++){ for(let o=0;o<26;o++){ await ev(([f,o])=>{try{window.PM56_DEMO.setVariant(f,o)}catch(e){}},[f,o]); } }
await ev(()=>window.PM56_DEMO.reset());
// themes
for(const t of ['basic-dark','basic-light','friendly-dark','friendly-light','retro-dark','retro-light','glass-dark','glass-light'])
  { await ev(t=>window.PM56_DEMO.setTheme(t),t); await tick(20); }
// recipes
for(let i=0;i<24;i++){ await ev(i=>window.PM56_DEMO.setRecipe(i),i); await tick(15); }
await ev(()=>window.PM56_DEMO.reset());
// working states
await ev(()=>window.PM56_DEMO.startWorking()); await tick(400);
for(let i=0;i<12;i++){ await ev(i=>window.PM56_DEMO.setWorkStep(i),i); await tick(60); }
await ev(()=>window.PM56_DEMO.completeWorking()); await tick(200);
// decisions
for(const k of ['openQuestionnaire','openPlan','openPermission']){ await ev(k=>window.PM56_DEMO[k](),k); await tick(80); }
await ev(()=>window.PM56_DEMO.reset());
// activity domains
const doms=await p.evaluate(()=>Object.keys(window.PM56_DEMO.getState().activity.domain?{}:{}) );
for(const d of ['todos','subagents','changes','artifacts','goal','context','tools','files']){ await ev(d=>window.PM56_DEMO.openActivity(d),d); await tick(60); }
await ev(()=>window.PM56_DEMO.pinActivity()); await tick(80);
await ev(()=>window.PM56_DEMO.openContext()); await tick(80);
// threads
const threads=await p.evaluate(()=>window.PM56_DEMO.getState().threads?.map(t=>t.id)||[]);
for(const t of threads){ await ev(t=>window.PM56_DEMO.selectThread(t),t); await tick(40); }
// every menu trigger present in the DOM
const menus=await p.evaluate(()=>[...document.querySelectorAll('[data-action="open-menu"]')].map(e=>e.dataset.menu));
for(const m of menus){ await p.evaluate(m=>{const el=document.querySelector(`[data-action="open-menu"][data-menu="${m}"]`); if(el) el.click();},m); await tick(120);
  // hover every menu item to open sidecars
  await p.evaluate(()=>{ document.querySelectorAll('.overlay-menu .menu-item').forEach(el=>{el.dispatchEvent(new MouseEvent('mouseenter',{bubbles:true}));el.dispatchEvent(new MouseEvent('mouseover',{bubbles:true}));}); });
  await tick(120);
  await p.evaluate(()=>document.body.click()); await tick(60); }
// hover every activity item
await p.evaluate(()=>{ document.querySelectorAll('.activity-item').forEach(el=>{el.dispatchEvent(new MouseEvent('mouseenter',{bubbles:true}));el.dispatchEvent(new MouseEvent('mouseover',{bubbles:true}));}); });
await tick(400);
// all triggers
const trigs=await p.evaluate(()=>{try{const t=window.PM56_DEMO.listTriggers();return Array.isArray(t)?t.map(x=>typeof x==='string'?x:(x.id||x.key||x[0])):Object.keys(t)}catch(e){return []}});
for(const t of trigs){ await ev(t=>{try{window.PM56_DEMO.trigger(t)}catch(e){}},t); await tick(40); }
await tick(600);
// artifacts / editor
const arts=await p.evaluate(()=>[...document.querySelectorAll('[data-artifact-id]')].map(e=>e.dataset.artifactId));
for(const a of [...new Set(arts)]){ await ev(a=>{try{window.PM56_DEMO.openArtifact(a)}catch(e){}},a); await tick(60); }
// narrow viewport + phone
for(const v of [{width:700,height:800},{width:390,height:844},{width:1100,height:800},{width:1440,height:900}]){ await p.setViewportSize(v); await tick(300); }
// toast
await p.evaluate(()=>{ document.querySelectorAll('[data-action="copy-message"],[data-action="export-context"]').forEach(e=>e.click()); });
await tick(500);

const cls=await p.evaluate(()=>[...window.__CLS].sort());
fs.writeFileSync(process.argv[2]||'/tmp/harvest.json', JSON.stringify({classes:cls, errs},null,1));
console.log('classes',cls.length,'errors',errs.length);
if(errs.length) console.log(errs.slice(0,10));
await b.close();
