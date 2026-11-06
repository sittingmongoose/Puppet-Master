// The final display correction belongs only to the opened editor. Core, choice,
// menu and ordinary button fixtures must have no element matching that selector.
import {LOOKS} from '../browser-check.config.mjs';
import {writeFile} from 'node:fs/promises';
export default async function(t) {
 const f=await t.app.open({onboarding:true,query:'o55=fresh'});await f.waitForFunction(()=>window.O55?.S?.open);
 const rows=[];
 async function inspect(tag) {
  const row=await f.evaluate(()=>({screen:O55.S.sess.screen,panelOpen:O55.nierLook.panelOpen(),matches:document.querySelectorAll('#pm-o55-onboarding .o55-nierpanel .btn > span').length}));
  rows.push({tag,...row});await t.check('Editor-only display selector has no target '+tag,!row.panelOpen&&row.matches===0,JSON.stringify(row));
 }
 for(const look of LOOKS){await f.evaluate(v=>O55.ui.applyLook(...v),look.split('-'));await f.waitForTimeout(1600);await f.evaluate(()=>O55.ui.go('look',{noHistory:true}));await inspect(look+' look');}
 for(const screen of ['welcome','where','nas-find','name','safe','away','review','ai-none','ready','ex-folder','nas-smb','s-confirm','s-ready']){await f.evaluate(s=>O55.ui.go(s,{noHistory:true}),screen);await inspect(screen);}
 await f.evaluate(()=>{O55.ui.go('look',{noHistory:true});O55.ui.act('lookMenu');});await inspect('look-menu');
 await f.evaluate(()=>{O55.S.sess.ui['details:hist']=true;O55.ui.go('safe',{noHistory:true});O55.S.sess.ui.sheet='backup';O55.ui.refresh();});await inspect('backup-sheet');
 await f.evaluate(()=>{O55.ui.go('ex-folder',{noHistory:true});O55.S.sess.ui.sheet='tree';O55.ui.refresh();});await inspect('tree-sheet');
 if(t.args.dataOut)await writeFile(String(t.args.dataOut),JSON.stringify(rows,null,2));
}
