import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
const S='/tmp/claude-1000/-mnt-Cursor-PuppetMaster/6b56d129-8eab-4a4f-bf02-133b45afc809/scratchpad/w5v2';
const b=await chromium.launch({headless:true,args:['--disable-gpu','--allow-file-access-from-files','--no-sandbox']});
const p=await b.newPage({viewport:{width:1440,height:900}});
const info=[];p.on('console',m=>{if(m.type()!=='log')info.push(m.type()+': '+m.text());});
await p.goto(pathToFileURL(S+'/snap/index.html').href,{waitUntil:'load'});
await p.waitForFunction(()=>window.__PM56_BOOT_OK===true);
await p.waitForTimeout(500);
console.log(JSON.stringify(await p.evaluate(()=>({
  collisions: window.PM56_EXT.collisions,
  actionCount: Object.keys(window.PM56_EXT._actions).length,
  afterKeys: Object.keys(window.PM56_EXT._after),
  slots: Object.fromEntries(Object.entries(window.PM56_EXT._slots).map(([k,v])=>[k,v.length])),
  lens: window.PM56_LENS?Object.keys(window.PM56_LENS):null,
  orbit: window.PM56_WORKING?Object.keys(window.PM56_WORKING):null,
  questions: window.PM56_QUESTIONS?Object.keys(window.PM56_QUESTIONS):null,
  threadops: window.PM56_THREADOPS?Object.keys(window.PM56_THREADOPS):null,
  goal: window.PM56_GOAL?Object.keys(window.PM56_GOAL):null,
  demo: window.PM56_DEMO?Object.keys(window.PM56_DEMO):null,
  runtime: window.PM56_RUNTIME?Object.keys(window.PM56_RUNTIME):null,
  threads: (window.PM56_DATA&&window.PM56_DATA.threads)?window.PM56_DATA.threads.map(t=>t.id):null,
  takes: window.PM56_DATA&&window.PM56_DATA.workingTakes?window.PM56_DATA.workingTakes.length:null,
}),{}),null,1));
console.log('console non-log:', JSON.stringify(info.slice(0,20),null,1));
await b.close();
