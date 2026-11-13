// PERF-R5: all three pickers are opened, including a folder created by NAS's real action.
// --set builds=main6,m-6,m-7 --set witness=m-6 --set rules=<pre-restore JSON> --set out=<JSON>
import {readFileSync,writeFileSync} from 'node:fs';
import {installOriginalSelectorProbe} from './rail_expanded_states.mjs';
import {pickerLook,visitCursorPickers} from './cursor_picker_states.mjs';
import {muteSound} from '../../../pm7-tools/browser-check/helpers/quiet-page.mjs';
const current=JSON.parse(readFileSync(new URL('./active_descendant_rules.json',import.meta.url),'utf8')).rules;
export default async function(t){
 await t.viewport(1920,1080);await muteSound(t.page);await t.emulate({reducedMotion:'no-preference'});
 const page=await t.app.open({query:'pm-warm=0',sandbox:false}),out={cases:[],errors:[]};
 const rules=t.args.rules?JSON.parse(readFileSync(String(t.args.rules),'utf8')).rules:current;
 try{for(const build of String(t.args.builds||'main6,m-6,m-7').split(',')){
  if(!String(page.url()).includes('/'+build+'.html'))await page.goto('http://192.168.50.179:18644/'+build+'.html?o55=off&pm-warm=0',{waitUntil:'load',timeout:240000});
  await page.waitForFunction(()=>window.PM51&&window.PM_NIER&&window.O55&&window.PM_PAGES,null,{timeout:120000});await page.evaluate(installOriginalSelectorProbe);
  for(const look of ['nier-dark','nier-light']){
   await pickerLook(page,look);
   await visitCursorPickers(page,async state=>{
    const row=page.locator(state.target).first();await row.waitFor({state:'visible'});
    const result=await row.evaluate((el,rules)=>{
     const carrier=el.closest('[role="option"],[role="menuitem"]');if(!carrier)throw Error('picker carrier absent');
     const finish=()=>{for(const a of document.getAnimations())if(a.effect?.getTiming().iterations!==Infinity)try{a.finish();}catch{}};
     carrier.classList.add('o55np-cur-over');carrier.classList.remove('is-active');carrier.setAttribute('aria-selected','false');finish();
     const read=()=>({element:getComputedStyle(el).color,row:getComputedStyle(carrier).color,fill:getComputedStyle(el).webkitTextFillColor});
     const actual=read(),probe=window.__pmrOriginalSelectorProbe(rules.find(r=>r.rule===0));let original;try{finish();original=read();}finally{probe.restore();finish();}
     const census=[];for(const id of [0,6]){const r=rules.find(r=>r.rule===id);if(id===6){carrier.classList.add('is-active');carrier.setAttribute('aria-selected','true');}
      const old=[...document.querySelectorAll(r.original)].filter(e=>carrier.contains(e)),next=new Set(document.querySelectorAll(r.replacement));census.push({rule:id,original:old.length,replacement:old.filter(e=>next.has(e)).length,missing:old.filter(e=>!next.has(e)).map(e=>({tag:e.tagName,classes:[...e.classList],text:e.textContent.slice(0,60)}))});
     }
     return {actual,original,census,text:el.textContent,theme:document.documentElement.dataset.theme,parts:document.documentElement.dataset.o55NierParts};
    },rules);
    out.cases.push({build,look,...state,...result});t.log('PICKER '+JSON.stringify(out.cases.at(-1)));
    const equal=JSON.stringify(result.actual)===JSON.stringify(result.original);
    await t.check(build+' '+look+' '+state.kind+' colour '+(build===t.args.witness?'witness differs':'equals original'),build===t.args.witness?!equal:equal,JSON.stringify(result));
    if(String(t.args.census||'0')==='1')await t.check(build+' '+look+' '+state.kind+' descendant arms retained',result.census.every(r=>!r.missing.length),JSON.stringify(result.census));
   });
  }
 }}catch(e){out.errors.push(String(e.stack||e));throw e;}finally{writeFileSync(String(t.args.out),JSON.stringify(out,null,2)+'\n');}
}
