import {chromium} from 'playwright';import {pathToFileURL} from 'url';
const b=await chromium.launch({headless:true,args:['--disable-gpu','--allow-file-access-from-files','--no-sandbox']});
const p=await b.newPage({viewport:{width:1600,height:1000}});
const errs=[];p.on('pageerror',e=>errs.push('PE '+e));
await p.goto(pathToFileURL("/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro/PM_Chat_Assistant_5.6_Pro_Standalone.html").href,{waitUntil:'load'});
await p.waitForFunction(()=>window.__PM56_BOOT_OK===true&&window.PM56_DEMO);
const step=async fn=>{await p.evaluate(fn);await p.waitForTimeout(350);};
await step(()=>PM56_DEMO.selectThread('route'));
await step(()=>document.querySelectorAll('[data-action="message-details"]').forEach(b=>b.click()));
await step(()=>PM56_DEMO.openActivity('todo'));
await step(()=>{const s=PM56_DEMO.getState();['goal','todo','subagents','changes','artifacts'].forEach(d=>{const b=document.querySelector(`[data-action="toggle-activity-section"][data-domain="${d}"]`);if(b&&!s.activity.expanded.includes(d))b.click();});});

const out=await p.evaluate(()=>{
  const L=PM56_DATA.labels||{};
  // only leaf elements whose ENTIRE visible text is the value -- a field value,
  // not a word inside prose. That is the property; substring matching was a proxy.
  const leaves=[];
  for(const el of document.querySelectorAll('*')){
    if(el.children.length) continue;
    const cs=getComputedStyle(el);
    if(cs.display==='none'||cs.visibility==='hidden'||cs.opacity==='0') continue;
    const t=(el.textContent||'').trim();
    if(!t||t.length>28) continue;
    leaves.push({t,cls:String(el.className)||el.tagName,label:(el.closest('.detail-kv')?.querySelector('label')?.textContent)||null});
  }
  const exact=[];      // rendered value === a raw key, verbatim
  for(const [map,pairs] of Object.entries(L)){
    for(const [key,lab] of Object.entries(pairs)){
      if(key===lab) continue;
      for(const lf of leaves){
        if(lf.t===key) exact.push({map,key,shouldBe:lab,where:lf.cls,field:lf.label,cls:'raw-key'});
        else if(lf.t.toLowerCase()===key.toLowerCase()&&lf.t!==lab) exact.push({map,key,shouldBe:lab,rendered:lf.t,where:lf.cls,field:lf.label,cls:'cased-not-labelled'});
      }
    }
  }
  const seen=new Set();
  return exact.filter(h=>{const k=h.map+h.key+h.where+h.cls;if(seen.has(k))return false;seen.add(k);return true;});
});
const raw=out.filter(h=>h.cls==='raw-key'), cased=out.filter(h=>h.cls==='cased-not-labelled');
console.log('A. RAW KEY rendered verbatim as a field value ('+raw.length+')');
for(const h of raw) console.log(`   labels.${h.map}: "${h.key}" -> should be "${h.shouldBe}"   field=${h.field||'-'}  in .${h.where}`);
console.log('\nB. Cased but not the label ('+cased.length+') -- may be intentional display casing, verify each');
for(const h of cased) console.log(`   labels.${h.map}: renders "${h.rendered}" -> label says "${h.shouldBe}"   field=${h.field||'-'}  in .${h.where}`);
console.log('\npage errors:',errs);
await b.close();
