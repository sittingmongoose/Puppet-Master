import {chromium} from 'playwright';import {pathToFileURL} from 'url';
const b=await chromium.launch({headless:true,args:['--disable-gpu','--allow-file-access-from-files','--no-sandbox']});
const p=await b.newPage({viewport:{width:1600,height:1000}});
const errs=[];p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});p.on('pageerror',e=>errs.push('PE '+e));
await p.goto(pathToFileURL("/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro/PM_Chat_Assistant_5.6_Pro_Standalone.html").href,{waitUntil:'load'});
await p.waitForFunction(()=>window.__PM56_BOOT_OK===true&&window.PM56_DEMO);
await p.evaluate(()=>PM56_DEMO.selectThread('route'));
await p.waitForTimeout(400);
// open the details panel on the two turns the fixture says ran on different providers
const read=async id=>{
  await p.evaluate(x=>{const b=document.querySelector(`[data-message-id="${x}"] [data-action="message-details"]`);b&&b.click();},id);
  await p.waitForTimeout(250);
  return p.evaluate(x=>{
    const art=document.querySelector(`[data-message-id="${x}"]`);
    const kv={};
    art.querySelectorAll('.message-details .detail-kv').forEach(d=>{kv[d.querySelector('label').textContent]=d.querySelector('strong').textContent;});
    return kv;
  },id);
};
const a=await read('route-06'), c=await read('route-08');
const fixture=await p.evaluate(()=>{
  const t=PM56_DATA.threads.find(x=>x.id==='route');
  const g=id=>{const m=t.messages.find(y=>y.id===id);return {model:m.runtime.model,provider:m.runtime.provider,account:m.runtime.account,input:m.runtime.tokens.input,cost:m.runtime.cost.apiUsd,sentAt:m.sentAt};};
  return {'route-06':g('route-06'),'route-08':g('route-08')};
});
const keys=[...new Set([...Object.keys(a),...Object.keys(c)])];
const identical=keys.filter(k=>a[k]===c[k]);
console.log('PANEL AS RENDERED (the two turns the fixture puts on different providers)\n');
console.log('field'.padEnd(17),'route-06'.padEnd(26),'route-08');
for(const k of keys) console.log(k.padEnd(17),String(a[k]).padEnd(26),String(c[k]),(a[k]===c[k]?'   <- identical':''));
console.log('\nidentical fields:',identical.length,'of',keys.length);
console.log('\nFIXTURE SAYS:');
console.log('  route-06:',JSON.stringify(fixture['route-06']));
console.log('  route-08:',JSON.stringify(fixture['route-08']));
console.log('\nMISATTRIBUTION: panel prints Model="'+c['Model']+'" / Provider="'+c['Provider']+'" for route-08,');
console.log('                fixture says it ran on "'+fixture['route-08'].model+'" / "'+fixture['route-08'].provider+'"');
console.log('\nconsole errors:',errs);
await b.close();
