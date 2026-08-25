/* What does "More details" ACTUALLY show, on two messages in the same thread
   that the fixture says ran on different models? */
import pw from '/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro/node_modules/playwright-core/index.js';
const { chromium } = pw;
import path from 'path';
const ROOT='/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro';
const b=await chromium.launch({headless:true,executablePath:process.env.HOME+'/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome',args:['--no-sandbox','--allow-file-access-from-files','--disable-gpu']});
const p=await b.newPage({viewport:{width:1440,height:1200},deviceScaleFactor:1});
const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
await p.goto('file://'+path.join(ROOT,'PM_Chat_Assistant_5.6_Pro_Standalone.html'),{waitUntil:'load'});
await p.waitForFunction(()=>window.__PM56_BOOT_OK===true&&window.PM56_DEMO);
await p.evaluate(()=>PM56_DEMO.selectThread('route'));
await p.waitForTimeout(200);

// fixture truth: pick the last Sonnet turn and the first Qwen turn
const truth=await p.evaluate(()=>{
  const t=window.PM56_DATA.threads.find(x=>x.id==='route');
  const a=t.messages.filter(m=>m.runtime);
  const sonnet=a.filter(m=>m.runtime.model==='Claude Sonnet 4.6').pop();
  const qwen=a.filter(m=>m.runtime.model==='Qwen 3.8')[0];
  const pick=m=>({id:m.id,model:m.runtime.model,account:m.runtime.account,provider:m.runtime.provider,
    sentAt:m.sentAt,inTok:m.runtime.tokens.input,ctxUsed:m.runtime.context.used,cost:m.runtime.cost.apiUsd,
    mode:m.runtime.mode,effort:m.runtime.effort});
  return {sonnet:pick(sonnet),qwen:pick(qwen),globalModel:PM56_DEMO.getState().model};
});

async function openDetails(id){
  await p.evaluate(mid=>{const b=document.querySelector(`.message[data-message-id="${mid}"] [data-action="message-details"]`); if(b) b.click();}, id);
  await p.waitForTimeout(180);
  return p.evaluate(mid=>{
    const el=document.querySelector(`.message[data-message-id="${mid}"] .message-details`);
    if(!el) return null;
    const kv={}; for(const d of el.querySelectorAll('.detail-kv')) kv[d.querySelector('label').innerText]=d.querySelector('strong').innerText;
    return kv;
  }, id);
}
const dS=await openDetails(truth.sonnet.id);
const dQ=await openDetails(truth.qwen.id);

console.log('globally selected model id:', truth.globalModel);
console.log('\nFIXTURE says these two turns differ:');
console.log('  ', truth.sonnet.id, '->', truth.sonnet.model, '/', truth.sonnet.account, '/ ctx', truth.sonnet.ctxUsed, '/ sentAt', truth.sonnet.sentAt);
console.log('  ', truth.qwen.id,   '->', truth.qwen.model,   '/', truth.qwen.account,   '/ ctx', truth.qwen.ctxUsed,   '/ sentAt', truth.qwen.sentAt);
console.log('\nPANEL renders:');
if(!dS||!dQ){ console.log('  details panel not found'); }
else {
  const keys=Object.keys(dS);
  console.log('  (actual labels emitted by the panel:', keys.length, 'fields)');
  for(const k of keys) console.log(`  ${k.padEnd(16)} sonnet-turn: ${String(dS[k]).padEnd(26)} qwen-turn: ${dQ[k]}`);
  const differing=keys.filter(k=>dS[k]!==dQ[k]);
  console.log('\n  fields that DIFFER between the two turns:', differing.length?differing.join(', '):'NONE (every field identical)');
  const mk=keys.find(k=>/model/i.test(k));
  console.log('  panel Model field:', JSON.stringify(mk), '->', JSON.stringify(dS[mk]), '/', JSON.stringify(dQ[mk]));
  console.log('  matches fixture?  sonnet:', dS[mk]===truth.sonnet.model, ' qwen:', dQ[mk]===truth.qwen.model);
}
console.log('\npage errors:', errs.length?errs:'none');
await b.close();
