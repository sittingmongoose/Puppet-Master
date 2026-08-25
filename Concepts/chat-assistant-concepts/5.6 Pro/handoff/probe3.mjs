import path from 'path'; import { pathToFileURL } from 'url';
const { chromium } = await import('playwright');
const b = await chromium.launch({ headless:true, args:['--disable-gpu','--allow-file-access-from-files','--no-sandbox'] });
const p = await b.newPage({ viewport:{width:1440,height:900} });
await p.goto(pathToFileURL(path.resolve(process.argv[2])).href,{waitUntil:'load'});
await p.waitForFunction(()=>window.__PM56_BOOT_OK===true);
console.log(JSON.stringify(await p.evaluate(()=>{
  const D=window.PM56_DATA, cnt=(a,k)=>{const m={};(a||[]).forEach(x=>m[x[k]]=(m[x[k]]||0)+1);return m;};
  return {todos:(D.todos||[]).length, todoStatus:cnt(D.todos,'status'),
    agents:(D.subagents||[]).length, agentStatus:cnt(D.subagents,'status'),
    changes:(D.changes||[]).length, changeStatus:cnt(D.changes,'status'),
    artifacts:(D.artifacts||[]).length, artStatus:cnt(D.artifacts,'status'),
    keys:Object.keys(D).sort()};
}),null,1));
await b.close();
