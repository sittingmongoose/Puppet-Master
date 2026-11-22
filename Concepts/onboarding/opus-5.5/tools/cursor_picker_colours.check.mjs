// PERF-R5: all three pickers are opened, including a folder created by NAS's real action.
// --set builds=main6,m-6,m-7 --set witness=m-6 --set rules=<pre-restore JSON> --set out=<JSON>
// --set server=<base URL the builds are served from> (default the stream's www server)
// --set expect=<build>:<sha256 or a prefix of it>,...  each judged page must be the one named (PM7PERF-PICKER-PAGE-HASH,
// R26 F4: the pages came from a hard-coded server and no record said which bytes were judged; now every build's URL,
// size and SHA-256 are logged and written to out.pages, and a page that is not the expected one fails before it is judged).
// Hash the same bytes that fulfill the intended navigation, including when Chrome would evict the 40 MB body.
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {installOriginalSelectorProbe} from './rail_expanded_states.mjs';
import {pickerLook,visitCursorPickers} from './cursor_picker_states.mjs';
import {muteSound} from '../../../pm7-tools/browser-check/helpers/quiet-page.mjs';
const current=JSON.parse(readFileSync(new URL('./active_descendant_rules.json',import.meta.url),'utf8')).rules;
// The bytes a URL serves: { url, bytes, sha256 } (file:// read from disk). Exported for cursor_picker_colours.selftest.mjs.
export async function pageDigest(url){
 const u=new URL(url);let buf;
 if(u.protocol==='file:')buf=readFileSync(u);
 else{const r=await fetch(u);if(!r.ok)throw Error(url+': HTTP '+r.status);buf=Buffer.from(await r.arrayBuffer());}
 return {url:u.href,bytes:buf.length,sha256:createHash('sha256').update(buf).digest('hex')};
}
// --set expect's verdict for one build: null when nothing is expected for it, else whether the digest matches
export const expected=(spec,build,digest)=>{
 const want=String(spec||'').split(',').map(x=>x.split(':')).find(([b])=>b===build)?.[1];
 return want?digest.sha256.startsWith(want.toLowerCase()):null;
};
// The document the check judges: origin, path and the query it navigates with. A basename match is not enough.
export function intendedPageUrl(server,build){
 const base=String(server||'http://192.168.50.179:18644/').replace(/\/?$/,'/');
 const u=new URL(build+'.html',base);
 u.searchParams.set('o55','off');u.searchParams.set('pm-warm','0');
 return u.href;
}
export function sameIntendedPage(opened,intended){
 try{const a=new URL(String(opened)),b=new URL(String(intended));a.hash='';b.hash='';return a.href===b.href;}
 catch{return false;}
}
export async function loadJudgedPage(frame,server,build){
 const intended=intendedPageUrl(server,build);
 const protocol=new URL(intended).protocol;
 const couldNotJudge=(why)=>Error('could not judge '+intended+': '+why);
 if(!['http:','https:','file:'].includes(protocol))throw couldNotJudge('unsupported navigation protocol '+protocol);

 const page=frame.page();
 const matches=(url)=>sameIntendedPage(url,intended);
 const wait=240000;
 let digest, failure;
 const capture=async(route)=>{
  const request=route.request();
  if(!request.isNavigationRequest()||request.frame()!==frame)return route.fallback();
  try{
   let status=200,headers={'content-type':'text/html'},body;
   if(protocol==='file:'){
    body=readFileSync(new URL(intended));
   }else{
    // One request. Feed its decoded body into the intercepted navigation and hash those exact bytes.
    const response=await route.fetch({maxRedirects:0,timeout:wait});
    try{
     status=response.status();
     headers=response.headers();
     if(status===304)throw couldNotJudge('HTTP 304 refers to a cached navigation body');
     if(status>=300&&status<400)throw couldNotJudge('HTTP '+status+' redirect to '+(headers.location||'(missing location)'));
     if(!response.ok()||status===204||status===205||status===206)throw couldNotJudge('HTTP '+status+' did not supply a whole document');
     body=await response.body();
    }finally{await response.dispose();}
    // Playwright has decoded the body. Let fulfillment supply its length for the browser.
    delete headers['content-encoding'];
    delete headers['content-length'];
    delete headers['transfer-encoding'];
   }
   digest={url:intended,bytes:body.length,sha256:createHash('sha256').update(body).digest('hex'),from:'intercepted navigation body'};
   await route.fulfill({status,headers,body});
  }catch(error){
   failure=error;
   await route.abort().catch(()=>{});
  }
 };
 await page.route(matches,capture);
 try{
  await frame.goto(intended,{waitUntil:'load',timeout:wait}).catch((error)=>{
   throw failure||couldNotJudge(protocol+' navigation failed: '+error.message.split('\n')[0]);
  });
 }finally{
  await page.unroute(matches,capture);
 }
 if(failure)throw failure;
 const loaded=String(frame.url());
 if(!sameIntendedPage(loaded,intended))throw couldNotJudge('navigation redirected or changed location to '+loaded);
 if(!digest)throw couldNotJudge(protocol+' navigation did not supply an intercepted response');
 return {intended,digest};
}
export default async function(t){
 await t.viewport(1920,1080);await muteSound(t.page);await t.emulate({reducedMotion:'no-preference'});
 const page=await t.app.open({query:'pm-warm=0',sandbox:false}),out={cases:[],errors:[]};
 const rules=t.args.rules?JSON.parse(readFileSync(String(t.args.rules),'utf8')).rules:current;
 try{for(const build of String(t.args.builds||'main6,m-6,m-7').split(',')){
  const server=String(t.args.server||'http://192.168.50.179:18644/').replace(/\/?$/,'/');
  const loaded=await loadJudgedPage(page,server,build),digest=loaded.digest;(out.pages||(out.pages={}))[build]=digest;t.log('PICKER PAGE '+build+' '+JSON.stringify(digest));
  const match=expected(t.args.expect,build,digest);
  if(match!==null)await t.check(build+' is the expected page ('+String(t.args.expect).split(',').find(x=>x.startsWith(build+':'))+')',match,JSON.stringify(digest));
  if(match===false)continue;
  await page.waitForFunction(()=>window.PM51&&window.PM_NIER&&window.O55&&window.PM_PAGES,null,{timeout:120000});await page.evaluate(installOriginalSelectorProbe);
  for(const look of ['nier-dark','nier-light']){
   await pickerLook(page,look);
   await visitCursorPickers(page,async state=>{
    const row=page.locator(state.target).first();await row.waitFor({state:'visible'});await row.hover();
    await page.waitForTimeout(300);
    const result=await row.evaluate((el,rules)=>{
     const carrier=el.closest('[role="option"],[role="menuitem"]');if(!carrier)throw Error('picker carrier absent');
     const finish=()=>{for(const a of document.getAnimations())if(a.effect?.getTiming().iterations!==Infinity)try{a.finish();}catch{}};
     carrier.classList.add('o55np-cur-over');carrier.classList.remove('is-active');carrier.setAttribute('aria-selected','false');finish();
     const read=()=>({element:getComputedStyle(el).color,row:getComputedStyle(carrier).color,fill:getComputedStyle(el).webkitTextFillColor});
     const actual=read(),probe=window.__pmrOriginalSelectorProbe(rules.find(r=>r.rule===0));let original;try{finish();original=read();}finally{probe.restore();finish();}
     const census=[];for(const id of [0,6]){const r=rules.find(r=>r.rule===id);if(id===6){carrier.classList.add('is-active');carrier.setAttribute('aria-selected','true');}
      const old=[...document.querySelectorAll(r.original)].filter(e=>carrier.contains(e)),next=new Set(document.querySelectorAll(r.replacement));census.push({rule:id,original:old.length,replacement:old.filter(e=>next.has(e)).length,missing:old.filter(e=>!next.has(e)).map(e=>({tag:e.tagName,classes:[...e.classList],text:e.textContent.slice(0,60)}))});
     }
     return {actual,original,census,text:el.textContent,hover:carrier.matches(':hover'),nier:PM_NIER.on(),theme:document.documentElement.dataset.theme,parts:document.documentElement.dataset.o55NierParts};
    },rules);
    out.cases.push({build,look,...state,...result});t.log('PICKER '+JSON.stringify(out.cases.at(-1)));
    const equal=JSON.stringify(result.actual)===JSON.stringify(result.original);
    await t.check(build+' '+look+' '+state.kind+' real NieR cursor state',result.hover&&result.nier&&result.theme.endsWith(look.endsWith('light')?'-light':'-dark')&&result.parts.split(/\s+/).includes('cursor'));
    await t.check(build+' '+look+' '+state.kind+' colour '+(build===t.args.witness?'witness differs':'equals original'),build===t.args.witness?!equal:equal,JSON.stringify(result));
    if(String(t.args.census||'0')==='1')await t.check(build+' '+look+' '+state.kind+' descendant arms retained',result.census.every(r=>!r.missing.length),JSON.stringify(result.census));
   });
  }
 }}catch(e){out.errors.push(String(e.stack||e));throw e;}finally{writeFileSync(String(t.args.out),JSON.stringify(out,null,2)+'\n');}
}
