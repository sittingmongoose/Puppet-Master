// FO-68: the red failure status word on a real failed-install row ("Install failed") reads 4.5:1 or more
// against the ground painted under its own stems, in all ten looks. Rows are reached by real clicks on two
// routes (the fresh AI screen, and Name -> Copy Tastebook settings -> Safe -> Review/Create -> AI), once per
// failure reason. Glass is measured at every size, every visible pane scroll position (top/+80/middle/bottom),
// with the pointer away, on the row and with keyboard focus on the row's Try again (the pointer and focus
// states on the Permission row; the other reasons at rest); the other looks at a wide and a narrow size. Four-paint opaque glyph mask (helpers/painted-text.mjs), so only fully covered stems count.
import {paintedText} from '../helpers/painted-text.mjs';
const LOOKS=['basic','friendly','retro','glass','nier'].flatMap(x=>[x+'-light',x+'-dark']);
const SIZES=[[740,900],[860,900],[1024,900],[1280,900],[1280,500],[1390,900],[1920,900]];
const REASONS=['permission','offline','unsupported','verify'];
const HINTS=['works','offline','unsupported','permission','verify'];
const list=(v,all)=>v?String(v).split(','):all;

async function freshRoute(t,f){
 await f.evaluate(()=>O55.studio.onboarding.screen('ai-all','fresh'));
 await f.waitForFunction(()=>O55.S.sess&&O55.S.sess.screen==='ai-all');await t.settle();
}
async function copiedRoute(t,f){
 await f.evaluate(()=>O55.studio.onboarding.screen('name','returning+cliMissing'));
 const screen=async id=>{await f.waitForFunction(id=>O55.S.sess&&O55.S.sess.screen===id,id);await t.settle();};
 const next=async()=>f.locator('#pm-o55-onboarding [data-o55-do="next"]:visible').last().click();
 await screen('name');await f.locator('[data-o55-bind="name"]').fill('Failed status contrast check');await next();
 await screen('like');await f.locator('[data-o55-do="pick"][data-arg="tastebook"]').click();await next();
 await screen('safe');await next();await screen('review');await f.locator('[data-o55-do="commit"]').click();await screen('creating');
 await f.waitForSelector('[data-o55-do="next"]:not([disabled]):not([aria-disabled="true"])',{timeout:30000});await next();await screen('ai');
 await t.check('copied route copies Tastebook settings',await f.evaluate(()=>{const d=O55.S.sess.drafts.main;return d.settings_transfer.mode==='copy_from_project'&&d.settings_transfer.source_project_id==='tastebook';}));
}
async function fail(t,f,code){
 await f.locator('#pm-o55-onboarding [data-o55-do="install"][data-arg="claude"]').click();
 const hints=f.locator('[data-key="dh-install:claude"] button');
 await hints.nth(HINTS.indexOf(code)).click();
 await f.locator('#pm-o55-onboarding [data-o55-do="installGo"][data-arg="claude"]').click();
 await f.waitForFunction(code=>{const r=O55.S.sess.ai.accounts.claude;return r.state==='installFailed'&&r.installFailCode===code;},code);
 await t.settle();
}
async function applyLook(t,f,look){
 const [family,mode]=look.split('-');
 // the review reproduction is a settled Light -> Dark switch
 if(mode==='dark'){await f.evaluate(([fa])=>O55.ui.applyLook(fa,'light'),[family]);await t.settle();}
 await f.evaluate(([fa,mo])=>O55.ui.applyLook(fa,mo),[family,mode]);await t.settle();
 await f.waitForFunction(look=>PMLogo.look()===look,look);
 await f.locator('#o55np-reboot').waitFor({state:'hidden'});await t.settle();
}
async function scrollRange(el){
 const scroller=await el.evaluateHandle(e=>{for(let p=e.parentElement;p;p=p.parentElement){const s=getComputedStyle(p);if(/auto|scroll/.test(s.overflowY)&&p.scrollHeight>p.clientHeight+1)return p;}return document.querySelector('#pm-o55-onboarding .o55-pane');});
 const range=await scroller.evaluate((s,e)=>{const max=s.scrollHeight-s.clientHeight;if(!s.contains(e))return{lo:0,hi:0,max};const b=e.getBoundingClientRect(),a=s.getBoundingClientRect();
  return{lo:Math.max(0,Math.ceil(b.bottom-a.top+s.scrollTop-s.clientHeight+4)),hi:Math.min(max,Math.floor(b.top-a.top+s.scrollTop-4)),max};},await el.elementHandle());
 return {scroller,range};
}

export default async function(t){
 const f=await t.app.open();
 // Reduce Motion by default (the kit's rule); --set motion=on measures with motion on too
 if(t.args.motion==='on'){await t.emulate({reducedMotion:'no-preference'});await f.evaluate(()=>O55.studio.looks.setReduced(false));}
 const looks=list(t.args.looks,LOOKS),routes=list(t.args.routes,['fresh','copied']),reasons=list(t.args.reasons,REASONS);
 const sizes=SIZES.filter(([w,h])=>!t.args.widths||String(t.args.widths).split(',').includes(String(w)));
 let lowest={contrast:Infinity};
 for(const route of routes)for(const code of reasons){
  await t.viewport(1390,900);
  if(route==='fresh')await freshRoute(t,f);else await copiedRoute(t,f);
  await fail(t,f,code);
  const row=f.locator('#pm-o55-onboarding [data-key="pv-claude"]'),pill=row.locator('.o55-pill-fail');
  await t.check(`${route} ${code} row shows one failure status`,await pill.count()===1);
  const reason=await f.evaluate(code=>O55.t('ai.installFailure.'+code),code);
  await t.check(`${route} ${code} row keeps its reason`,(await row.innerText()).replace(/\s+/g,' ').includes(reason.replace(/\s+/g,' ')));
  if(await pill.count()!==1)continue;
  for(const look of looks){
   await applyLook(t,f,look);
   await t.check(`${route} ${code} ${look} install still failed`,await f.evaluate(()=>O55.S.sess.ai.accounts.claude.state==='installFailed'));
   const glass=look.startsWith('glass');
   for(const [w,h] of (glass?sizes:sizes.filter(([w,h])=>(w===1390||w===740)&&h===900))){
    await t.viewport(w,h);await t.page.mouse.move(1,1);await t.settle();
    await pill.scrollIntoViewIfNeeded();await t.settle();
    const {scroller,range}=await scrollRange(pill);
    await t.check(`${route} ${code} ${look} ${w}x${h} status visible scroll range`,range.hi>=range.lo,JSON.stringify(range));
    const positions=glass?[...new Set([range.lo,Math.min(range.hi,range.lo+80),Math.round((range.lo+range.hi)/2),range.hi])]:[Math.round((range.lo+range.hi)/2)];
    for(const pos of positions){
     await scroller.evaluate((s,n)=>s.scrollTop=n,pos);
     for(const state of (code!=='permission'?['rest']:glass?['rest','hover','focus']:['rest','hover'])){
      await t.page.mouse.move(1,1);await f.evaluate(()=>document.activeElement&&document.activeElement.blur&&document.activeElement.blur());
      if(state==='hover'){const b=await row.boundingBox();await t.page.mouse.move(b.x+b.width*0.5,b.y+b.height/2);}
      if(state==='focus'){const btn=row.locator('[data-o55-do="install"][data-arg="claude"]');await t.page.keyboard.press('Tab');await btn.focus();
       await t.check(`${route} ${code} ${look} ${w}x${h} Try again keyboard focus`,await btn.evaluate(e=>e.matches(':focus-visible')));}
      await t.settle();
      const before=await scroller.evaluate(s=>s.scrollTop),p=await paintedText(pill),after=await scroller.evaluate(s=>s.scrollTop);
      const label=`${route} ${code} ${look} ${w}x${h} scroll ${before}/${range.max} ${state}`;
      t.log(JSON.stringify({label,count:p.count,minimum:p.minimum,brightest:p.brightest}));
      await t.check(label+' retains scroll',before===after,`${before} -> ${after}`);
      await t.check(label+' failure status ink >=4.5',p.count>=3&&p.minimum>=4.5,`${p.minimum.toFixed(3)}:1 (${p.count} stems)`);
      if(p.minimum<lowest.contrast)lowest={contrast:p.minimum,label};
      if(route==='copied'&&code==='permission'&&look==='glass-dark'&&w===1024&&h===900&&state==='rest'&&pos===range.lo)
       await t.crop('glass-dark-copied-permission-failure',row,'Glass Dark keeps its tinted material behind a legible Install failed status');
     }
    }
   }
  }
 }
 t.log('LOWEST '+JSON.stringify(lowest));
}
