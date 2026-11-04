import {onboardingApp} from '../helpers/onboarding-fields.mjs';
export const tests={
 'SW02 no connected AI composer':async t=>{
  const a=onboardingApp(t);await a.boot(t);await a.toSafe(t,'Chat without AI');
  await a.click(t,'later');await a.click(t,'next');
  const f=a.frame();
  for(let i=0;i<8;i++){
   const s=await a.snap();t.log('route '+s.screen);
   if(s.screen==='ai')break;
   const next=f.locator('.o55-foot .o55-primary');
   await next.click();await t.page.waitForTimeout(1800);
  }
  await a.screen(t,'ai');await a.click(t,'skip');
  await t.page.waitForTimeout(500);
  t.log('after skip '+JSON.stringify(await a.snap()));
  await f.evaluate(()=>O55.ui.close('skip'));
  const r=await f.evaluate(()=>({model:PM56_APP.ctx().model,ai:O55.S.sess.ai,composer:document.querySelector('#pmRoot .composer')?.textContent}));
  t.log(JSON.stringify(r));await t.check('no unconnected fixture model',!r.composer?.includes('Claude Sonnet 4.6'));
 },
 'SW35 standalone renderer':async t=>{
  await t.page.goto('http://192.168.50.179:8774/standalone.html?o55=off');
  await t.page.waitForFunction(()=>window.__PM56_BOOT_OK);
  const r=await t.page.evaluate(()=>({kit:!!window.PMLogo,marks:[...document.querySelectorAll('.pmx-mark')].map(e=>e.querySelectorAll('path,rect,circle').length),pip:PM56_SHELL.pmxPip({mood:'idle',size:22})}));
  t.log(JSON.stringify(r));await t.check('standalone Pip kit and nonempty mark',r.kit&&r.pip.length>0);
 }
};
