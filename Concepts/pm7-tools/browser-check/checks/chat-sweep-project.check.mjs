import {pathToFileURL,fileURLToPath} from 'node:url';
import {LOOKS} from '../browser-check.config.mjs';
import {onboardingApp} from '../helpers/onboarding-fields.mjs';
export const tests={
 'SW02 no connected AI composer':async t=>{
  await t.viewport(1390,900);const a=onboardingApp(t);await a.boot();await a.toSafe('Chat without AI');
  await a.click('next');
  const f=a.frame();
  for(let i=0;i<8;i++){
   const s=await a.snap();t.log('route '+s.screen);
   if(s.screen==='ai')break;
   await t.page.waitForTimeout(900);const next=f.locator('.o55-foot .o55-primary').filter({visible:true}).last();
   await next.click();await t.page.waitForTimeout(1800);
  }
  await a.screen('ai');await a.click('skip');
  await t.page.waitForTimeout(500);
  t.log('after skip '+JSON.stringify(await a.snap()));
  await a.click('next');await a.screen('ready');await a.click('enter');
  await t.page.waitForTimeout(800);
  await t.check('actual handoff has zero connected accounts',await f.evaluate(()=>PM_ONBOARDING_RESULT.accounts.length===0));
  const r=await f.evaluate(()=>({model:PM56_APP.ctx().model,ai:O55.S.sess?.ai,composer:document.querySelector('#pmRoot .composer')?.textContent}));
  t.log(JSON.stringify(r));await t.check('no unconnected fixture model',!!r.composer&&!r.composer.includes('Claude Sonnet 4.6'));
  await f.locator('#pmRoot [data-menu="model"]').click();
  await t.check('no fixture account rows',await f.locator('.model-scroll [data-action="set-model"]').count()===0);
 },
 'SW35 standalone renderer':async t=>{
  const file=t.args.standalone||fileURLToPath(new URL('../../../chat-assistant-concepts/5.6 Pro/PM_Chat_Assistant_5.6_Pro_Standalone.html',import.meta.url));
  const url=pathToFileURL(file).href+'?o55=off';
  let f;if(t.app.sandboxed(false)) f=await t.openInSandbox(url);else{await t.page.goto(url);f=t.page.mainFrame();}
  await f.waitForFunction(()=>window.__PM56_BOOT_OK);
  for(const look of LOOKS){
  await f.evaluate(name=>{PM56_DEMO.setTheme(name);PM56_DEMO.openActivity('subagents');},look);
  await t.page.waitForTimeout(300);
  const r=await f.evaluate(()=>({theme:PM56_EXT.ctx().state.theme,rows:[...document.querySelectorAll('.pmap-agent-mark .pmx-pip')].map(e=>e.children.length),kit:!!window.PMLogo,marks:[...document.querySelectorAll('.pmx-mark')].map(e=>e.querySelectorAll('path,rect,circle').length),pip:PM56_SHELL.pmxPip({mood:'idle',size:22})}));
  t.log(look+' '+JSON.stringify(r));await t.check(look+' standalone Pip kit and nonempty mark',r.theme===look&&r.kit&&r.pip.length>0&&r.rows.length>0&&r.rows.every(n=>n>0));
  }
 }
};
