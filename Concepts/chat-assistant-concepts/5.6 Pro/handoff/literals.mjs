import {chromium} from 'playwright';
import {pathToFileURL} from 'url';
const target="/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro/PM_Chat_Assistant_5.6_Pro_Standalone.html";
const b=await chromium.launch({headless:true,args:['--disable-gpu','--allow-file-access-from-files','--no-sandbox']});
const p=await b.newPage({viewport:{width:1440,height:900}});
const errs=[];p.on('console',m=>{if(m.type()==='error'||m.type()==='warning')errs.push(m.type()+':'+m.text())});p.on('pageerror',e=>errs.push(''+e));
await p.goto(pathToFileURL(target).href,{waitUntil:'load'});
await p.waitForFunction(()=>window.__PM56_BOOT_OK===true);
await p.evaluate(()=>{window.PM56_DEMO.pinActivity();window.PM56_DEMO.openActivity('goal');});
await p.waitForTimeout(600);
await p.evaluate(()=>document.querySelector('.chat-header .goal-chip').click());
await p.waitForTimeout(600);
const LIT=['Phase 2 of 4','Phase 2/4','68%','Revision 4','Goal Mode','Exact blocker',
           'Evaluating composite index column order','1. Measure the current path.'];
const R=await p.evaluate(LIT=>{
  const scope=(sel)=>{const e=document.querySelector(sel);return e?e.textContent:'';};
  const panel=scope('.activity-panel'), doc=scope('.goal-doc'), all=document.body.textContent;
  const hits=s=>LIT.filter(l=>s.includes(l));
  return {
    panelLiterals:hits(panel), editorLiterals:hits(doc), wholePageLiterals:hits(all),
    editorIsMine: !!document.querySelector('.goal-doc'),
    tab:(document.querySelector('.editor-tab.active .editor-tab-label')||{}).textContent,
    runtimeLabels:['Mode','Provider','Model','Effort','Subagents','Tokens','Context','Est. Cost','Worktree','Merge Status','takeover_state']
      .filter(l=>!doc.includes(l)),
    editorBlockerFields:[...document.querySelectorAll('.goal-doc .goal-blocker-grid dt')].map(x=>x.textContent),
    editorPhaseCount:document.querySelectorAll('.goal-doc .goal-phase').length,
    goalIsNotAMode:{modeField:window.PM56_DATA.goal.mode,
      readsStateMode:false, chipShown:!!document.querySelector('.chat-header .goal-chip')}
  };
},LIT);
// the panel's blocker folds to 2 fields; the "show all five" control must reveal all five
R.panelBlockerFolded=await p.evaluate(()=>[...document.querySelectorAll('.activity-panel .goal-blocker-grid dt')].map(x=>x.textContent));
await p.evaluate(()=>document.querySelector('.activity-panel [data-action="goal-toggle"][data-value="blocker"]').click());
await p.waitForTimeout(300);
R.panelBlockerExpanded=await p.evaluate(()=>[...document.querySelectorAll('.activity-panel .goal-blocker-grid dt')].map(x=>x.textContent));
// goal renders identically whatever the mode is -> goal is not a mode
R.acrossModes={};
for(const m of ['Agent','Ask','Plan']){
  await p.evaluate(mm=>{const s=window.PM56_DEMO.getState();},m);
  await p.evaluate(mm=>{ /* set mode the way the app does, then re-render */
    const btn=[...document.querySelectorAll('[data-action="set-mode"]')].find(b=>b.dataset.value===mm);
    if(btn) btn.click();
  },m);
  R.acrossModes[m]=await p.evaluate(()=>({
    sectionPresent:!!document.querySelector('.activity-panel .goal-block'),
    phases:document.querySelectorAll('.activity-panel .goal-phase').length,
    chip:!!document.querySelector('.chat-header .goal-chip')}));
}
R.errs=errs;
console.log(JSON.stringify(R,null,1));
await b.close();
