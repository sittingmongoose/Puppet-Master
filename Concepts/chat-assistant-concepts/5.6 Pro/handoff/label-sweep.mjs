import {chromium} from 'playwright';import {pathToFileURL} from 'url';
const b=await chromium.launch({headless:true,args:['--disable-gpu','--allow-file-access-from-files','--no-sandbox']});
const p=await b.newPage({viewport:{width:1600,height:1000}});
const errs=[];p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});p.on('pageerror',e=>errs.push('PE '+e));
await p.goto(pathToFileURL("/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro/PM_Chat_Assistant_5.6_Pro_Standalone.html").href,{waitUntil:'load'});
await p.waitForFunction(()=>window.__PM56_BOOT_OK===true&&window.PM56_DEMO);

// walk the surfaces where enum-backed values are rendered
const visit=async fn=>{await p.evaluate(fn);await p.waitForTimeout(350);};
await visit(()=>{PM56_DEMO.selectThread('route');});
await visit(()=>{document.querySelectorAll('[data-action="message-details"]').forEach(b=>b.click());});
await visit(()=>{PM56_DEMO.openActivity('todo');});
await visit(()=>{const s=PM56_DEMO.getState();['goal','todo','subagents','changes','artifacts'].forEach(d=>{const b=document.querySelector(`[data-action="toggle-activity-section"][data-domain="${d}"]`);if(b&&!s.activity.expanded.includes(d))b.click();});});

const report=await p.evaluate(()=>{
  const L=PM56_DATA.labels||{};
  // every text node currently painted, trimmed
  const walk=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
  const seen=[];let n;
  while(n=walk.nextNode()){
    const el=n.parentElement;
    if(!el) continue;
    const cs=getComputedStyle(el);
    if(cs.display==='none'||cs.visibility==='hidden'||cs.opacity==='0') continue;
    const t=n.nodeValue.trim();
    if(t) seen.push({t,cls:String(el.className).slice(0,40),tag:el.tagName});
  }
  const out={};
  for(const [map,pairs] of Object.entries(L)){
    const hits=[];
    for(const [key,label] of Object.entries(pairs)){
      if(key===label) continue;                       // nothing to catch
      for(const s of seen){
        // whole-token match: the raw key standing alone as a rendered value
        const re=new RegExp(`(^|[\\s·|(])${key.replace(/[-_]/g,'[-_]')}($|[\\s·|),.])`,'i');
        if(re.test(s.t) && !s.t.includes(label)) hits.push({key,label,rendered:s.t.slice(0,52),where:s.cls||s.tag});
      }
    }
    if(hits.length){
      const uniq=[];const k=new Set();
      for(const h of hits){const id=h.key+'|'+h.where;if(!k.has(id)){k.add(id);uniq.push(h);}}
      out[map]=uniq;
    }
  }
  return {out,mapCount:Object.keys(L).length,textNodes:seen.length};
});
console.log(`Swept ${report.textNodes} painted text nodes against ${report.mapCount} label maps.\n`);
if(!Object.keys(report.out).length) console.log('No raw enum keys reaching the screen.');
for(const [map,hits] of Object.entries(report.out)){
  console.log(`labels.${map}`);
  for(const h of hits) console.log(`   raw "${h.key}"  should print "${h.label}"   rendered: "${h.rendered}"   in .${h.where}`);
  console.log();
}
console.log('console errors:',errs);
await b.close();
