import pw from '/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro/node_modules/playwright-core/index.js';
const { chromium } = pw;
import fs from 'fs'; import path from 'path';
const ROOT='/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro';
const OUT='/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro/handoff/w6/waves/shots2';
const b=await chromium.launch({headless:true,executablePath:process.env.HOME+'/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome',args:['--no-sandbox','--allow-file-access-from-files','--disable-gpu']});
const p=await b.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
const errs=[]; p.on('pageerror',e=>errs.push(String(e))); p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.goto('file://'+path.join(ROOT,'PM_Chat_Assistant_5.6_Pro_Standalone.html'),{waitUntil:'load'});
await p.waitForFunction(()=>window.__PM56_BOOT_OK===true&&window.PM56_DEMO);
await p.evaluate(()=>{PM56_DEMO.selectThread('query');PM56_DEMO.pinActivity();});

const edges=['src/analytics/legacy_rollup.rs','docs/query-performance.md','migrations/0043_tenant_created_index.sql','src/analytics/schema.rs'];
for(const want of edges){
  await p.evaluate(()=>PM56_DEMO.openActivity('changes'));
  await p.waitForTimeout(180);
  await p.locator(`.activity-panel [data-action="open-change"][data-path="${want}"]`).first().click();
  await p.waitForTimeout(260);
  const r=await p.evaluate(()=>{
    const d=document.querySelector('.editor-doc'); if(!d) return null;
    const rows=[...d.querySelectorAll('.diff-line')];
    const cls=n=>rows.filter(r=>r.classList.contains(n)).length;
    const gut=rows.slice(0,60).map(r=>r.innerText.slice(0,7).trimEnd());
    const colour=n=>{const el=rows.find(r=>r.classList.contains(n));return el?getComputedStyle(el).color:null;};
    return {h1:d.querySelector('h1')?.innerText, pills:[...d.querySelectorAll('.editor-meta .meta-pill')].map(x=>x.innerText),
      blocks:d.querySelectorAll('.code-block').length, rows:rows.length,
      add:cls('add'), del:cls('del'), focus:cls('focus'),
      addColour:colour('add'), delColour:colour('del'),
      ws:getComputedStyle(d.querySelector('.code-block')||d).whiteSpace,
      firstGutters:gut.slice(0,6)};
  });
  // fixture truth
  const truth=await p.evaluate(w=>{const c=window.PM56_DATA.changes.find(x=>x.path===w);
    return {add:c.add,del:c.del,rows:c.lineCount,hunks:c.hunks.length,status:c.status,oldPath:c.oldPath,line:c.line};},want);
  const rowsExpected=truth.rows+truth.hunks; // one @@ header row per hunk
  const okRows=r.rows===rowsExpected||r.rows===truth.rows;
  console.log(`\n${want}`);
  console.log(`  fixture  status=${truth.status} +${truth.add} -${truth.del} rows=${truth.rows} hunks=${truth.hunks} line=${truth.line}${truth.oldPath?' oldPath='+truth.oldPath:''}`);
  console.log(`  rendered pills=${JSON.stringify(r.pills)} blocks=${r.blocks} rows=${r.rows} add=${r.add} del=${r.del} focus=${r.focus} ws=${r.ws}`);
  console.log(`  MATCH add=${r.add===truth.add} del=${r.del===truth.del} rowcount=${okRows} oneFocus=${r.focus===1}`);
  console.log(`  colours add=${r.addColour} del=${r.delColour}`);
  if(want.endsWith('.md')) console.log(`  rename shows oldPath in pills: ${r.pills.some(x=>x.includes('perf-notes'))}`);
  await p.screenshot({path:path.join(OUT,'edge-'+want.replace(/[\/.]/g,'_')+'.png'),clip:{x:0,y:40,width:660,height:820}});
}
console.log('\npage/console errors:',errs.length?errs:'none');
await b.close();
