import {chromium} from 'playwright';import {pathToFileURL} from 'url';import fs from 'fs';
const OUT=process.env.SHOTS||'/tmp/claude-1000/-mnt-Cursor-PuppetMaster/6b56d129-8eab-4a4f-bf02-133b45afc809/scratchpad/waves/shots';
fs.mkdirSync(OUT,{recursive:true});
const b=await chromium.launch({headless:true,args:['--disable-gpu','--allow-file-access-from-files','--no-sandbox']});
const p=await b.newPage({viewport:{width:1600,height:1000}});
const errs=[];p.on('console',m=>{if(m.type()==='error'||m.type()==='warning')errs.push(m.type()+':'+m.text())});p.on('pageerror',e=>errs.push('PE '+e));
await p.goto(pathToFileURL("/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro/PM_Chat_Assistant_5.6_Pro_Standalone.html").href,{waitUntil:'load'});
await p.waitForFunction(()=>window.__PM56_BOOT_OK===true&&window.PM56_DEMO);
const R={paths:{}};
const paths=await p.evaluate(()=>PM56_DATA.changes.map(c=>c.path));
R.pathCount=paths.length;
for(const path of paths){
  await p.evaluate(x=>PM56_DEMO.openArtifact('file:'+x),path);
  await p.waitForTimeout(160);
  R.paths[path]=await p.evaluate(x=>{
    const c=PM56_DATA.changes.find(y=>y.path===x);
    const doc=document.querySelector('.editor-doc[data-k="file:'+CSS.escape(x).replace(/\\/g,'\\')+'"]')||document.querySelector('.editor-doc');
    const rows=[...document.querySelectorAll('.code-block .diff-line')];
    const txt=rows.map(r=>r.textContent);
    const expected=(c.hunks||[]).reduce((n,h)=>n+h.lines.length+1,0); // +1 per @@ header
    return {
      h1:doc.querySelector('h1').textContent,
      pills:[...doc.querySelectorAll('.meta-pill')].map(e=>e.textContent),
      blocks:document.querySelectorAll('.code-block').length,
      rows:rows.length, expectedRows:expected,
      add:rows.filter(r=>r.classList.contains('add')).length,
      del:rows.filter(r=>r.classList.contains('del')).length,
      focus:rows.filter(r=>r.classList.contains('focus')).length,
      hasCannedSQL:txt.some(t=>/CREATE INDEX CONCURRENTLY idx_events_tenant_created/.test(t)),
      hasFiller:txt.some(t=>/surrounding source and migration context/.test(t)),
      firstReal:txt.find(t=>t.trim().length>6)?.slice(0,70),
      whiteSpace:getComputedStyle(document.querySelector('.code-block')).whiteSpace
    };
  },path);
}
// cross-file uniqueness: no two files may render the same body
const bodies={};
for(const path of paths){
  await p.evaluate(x=>PM56_DEMO.openArtifact('file:'+x),path);
  await p.waitForTimeout(120);
  bodies[path]=await p.evaluate(()=>[...document.querySelectorAll('.code-block')].map(b=>b.textContent).join('|').length+':'+[...document.querySelectorAll('.code-block .diff-line')].map(r=>r.textContent).join('\n').slice(0,4000));
}
const uniq=new Set(Object.values(bodies));
R.distinctBodies=uniq.size;
// the three manifest counts
R.manifest=await p.evaluate(()=>['threads/provider-selector.js','threads/access-controls.css','verification/interaction-probes.mjs'].map(pp=>{const c=PM56_DATA.changes.find(x=>x.path===pp);const add=c.hunks.flatMap(h=>h.lines).filter(l=>l.kind==='add').length;const del=c.hunks.flatMap(h=>h.lines).filter(l=>l.kind==='del').length;return {path:pp,declared:`+${c.add}/-${c.del}`,fromHunks:`+${add}/-${del}`,match:add===c.add&&del===c.del};}));
// pixel proof on one file: the +/- rows really paint in different colours
await p.evaluate(()=>PM56_DEMO.openArtifact('file:threads/provider-selector.js'));
await p.waitForTimeout(300);
R.colours=await p.evaluate(()=>{
  const pick=cls=>{const r=document.querySelector('.code-block .diff-line.'+cls);if(!r)return null;const rc=r.getBoundingClientRect();const t=document.elementFromPoint(rc.left+6,rc.top+rc.height/2);return {colour:getComputedStyle(r).color,isTop:!!(t&&(t===r||r.contains(t))),text:r.textContent.slice(0,40)};};
  return {add:pick('add'),del:pick('del'),focus:pick('focus')};
});
await p.screenshot({path:`${OUT}/file-editor-hunks.png`});
R.errors=errs;
console.log(JSON.stringify(R,null,1).slice(0,6000));
await b.close();
