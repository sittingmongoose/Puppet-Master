// FO-68/74: real failure routes, every requested look/size, painted ink and non-overlapping recovery.
import {paintedText} from '../helpers/painted-text.mjs';
const LOOKS=['basic','friendly','retro','glass','nier'].flatMap(x=>[x+'-light',x+'-dark']);
const SIZES=[[740,900],[860,900],[1024,900],[1280,900],[1280,500],[1390,900],[1920,900]];
const REASONS=['permission','offline','unsupported','verify','expired','signin','signinOffline','connection','installed'];
const HINTS=['works','offline','unsupported','permission','verify'];
const list=(v,all)=>v?String(v).split(','):all;

const scenario=code=>code==='installed'?'fresh':code==='expired'?'claudeExpired':code==='signinOffline'?'signedOut+aiOffline':code==='signin'?'signedOut':'cliMissing';
async function freshRoute(t,f,code){
 await f.evaluate(fixture=>O55.studio.onboarding.screen('ai-all',fixture),scenario(code));
 await f.waitForFunction(()=>O55.S.sess&&O55.S.sess.screen==='ai-all');await t.settle();
}
async function copiedRoute(t,f,code){
 await f.evaluate(fixture=>O55.studio.onboarding.screen('name','returning+'+fixture),scenario(code));
 const screen=async id=>{await f.waitForFunction(id=>O55.S.sess&&O55.S.sess.screen===id,id);await t.settle();};
 const next=async()=>f.locator('#pm-o55-onboarding [data-o55-do="next"]:visible').last().click();
 await screen('name');await f.locator('[data-o55-bind="name"]').fill('Failed status contrast check');await next();
 await screen('like');await f.locator('[data-o55-do="pick"][data-arg="tastebook"]').click();await next();
 await screen('safe');await next();await screen('review');await f.locator('[data-o55-do="commit"]').click();await screen('creating');
 await f.waitForSelector('[data-o55-do="next"]:not([disabled]):not([aria-disabled="true"])',{timeout:30000});await next();await screen('ai');
 await t.check('copied route copies Tastebook settings',await f.evaluate(()=>{const d=O55.S.sess.drafts.main;return d.settings_transfer.mode==='copy_from_project'&&d.settings_transfer.source_project_id==='tastebook';}));
}
async function fail(t,f,code){
 if(code==='expired'||code==='installed')return;
 if(code==='signin'||code==='signinOffline'){
  const id='claude';
  if(code==='signin')await f.evaluate(()=>O55.S.env.failures.signin_once=Object.assign({},O55.S.env.failures.signin_once,{claude:true}));
  await f.locator(`[data-o55-do="signin"][data-arg="${id}"]`).click();
  await f.waitForFunction(id=>O55.S.sess.ai.accounts[id]?.state==='signinFailed',id);await t.settle();return;
 }
 if(code==='connection'){
  await f.locator('[data-o55-do="server"][data-arg="opencode-runtime"]').click();
  await f.locator('[data-o55-do="ocMode"][data-arg="attached"]').click();
  await f.locator('#o55f-ocaddr').fill('http://192.168.1.99:4096');
  await f.locator('[data-o55-do="ocConnect"]').click();
  await f.waitForFunction(()=>O55.S.sess.ai.accounts['opencode-runtime']?.state==='connectFailed');await t.settle();return;
 }
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
 // Reduce Motion by default (the kit's rule), set here explicitly; --set motion=on measures with motion on
 const on=t.args.motion==='on';
 await t.emulate({reducedMotion:on?'no-preference':'reduce'});await f.evaluate(on=>O55.studio.looks.setReduced(!on),on);
 await t.check(`motion ${on?'on':'reduced'} as asked`,await f.evaluate(on=>O55.motion.reduced()!==on,on));
 const looks=list(t.args.looks,LOOKS),routes=list(t.args.routes,['fresh','copied']),reasons=list(t.args.reasons,REASONS);
 const sizes=SIZES.filter(([w,h])=>!t.args.widths||String(t.args.widths).split(',').includes(String(w)));
 await t.check('valid nonempty selection',sizes.length>0&&looks.length>0&&reasons.length>0&&reasons.every(x=>REASONS.includes(x))&&looks.every(x=>LOOKS.includes(x)));
 let lowest={contrast:Infinity};
 for(const route of routes)for(const code of reasons){
  await t.viewport(1390,900);
  if(route==='fresh')await freshRoute(t,f,code);else await copiedRoute(t,f,code);
  await fail(t,f,code);
  await f.evaluate(on=>O55.studio.looks.setReduced(!on),on);
  await t.check(`${route} ${code} motion still ${on?'on':'reduced'}`,await f.evaluate(on=>O55.motion.reduced()!==on,on));
  const id=code==='connection'?'opencode-runtime':'claude';
  const row=f.locator(`#pm-o55-onboarding [data-key="pv-${id}"]`),pill=row.locator(code==='installed'?'.o55-pill-ready':'.o55-pill-fail');
  const expected=code==='installed'?'ready':code==='expired'?'expired':code.startsWith('signin')?'signinFailed':code==='connection'?'connectFailed':'installFailed';
  await pill.waitFor({state:'visible'});
  await t.check(`${route} ${code} row shows one failure status`,await pill.count()===1);
  const reason=await f.evaluate(code=>O55.t(code==='installed'?'ai.ready':code==='expired'?'ai.expired.title':code.startsWith('signin')?'ai.signinFail.title':code==='connection'?'ai.oc.failTitle':'ai.installFailure.'+code),code);
  await t.check(`${route} ${code} row keeps its reason`,(await row.innerText()).replace(/\s+/g,' ').includes(reason.replace(/\s+/g,' ')));
  if(await pill.count()!==1)continue;
  for(const look of looks){
   await applyLook(t,f,look);
   await t.check(`${route} ${code} ${look} install still failed`,await row.getAttribute('data-state')===expected);
   const glass=look.startsWith('glass');
   for(const [w,h] of sizes){
    let measured=0;
    await t.viewport(w,h);await t.page.mouse.move(1,1);await t.settle();
    await row.locator('.o55-row').scrollIntoViewIfNeeded();await t.settle();
    const {scroller,range}=await scrollRange(row.locator('.o55-row'));
    await t.check(`${route} ${code} ${look} ${w}x${h} status visible scroll range`,range.hi>=range.lo,JSON.stringify(range));
    const positions=glass?[...new Set([range.lo,Math.min(range.hi,range.lo+80),Math.round((range.lo+range.hi)/2),range.hi])]:[Math.round((range.lo+range.hi)/2)];
    for(const pos of positions){
     await scroller.evaluate((s,n)=>s.scrollTop=n,pos);
     for(const state of ['rest','hover','focus']){
      await t.page.mouse.move(1,1);await f.evaluate(()=>document.activeElement&&document.activeElement.blur&&document.activeElement.blur());
      if(state==='hover'){const b=await row.boundingBox();await t.page.mouse.move(b.x+b.width*0.5,b.y+b.height/2);}
      if(state==='focus'){const btn=row.locator('.o55-row > button:not(.o55-tipq)');await t.page.keyboard.press('Tab');await btn.focus();
       await t.check(`${route} ${code} ${look} ${w}x${h} Try again keyboard focus`,await btn.evaluate(e=>e.matches(':focus-visible')));}
      await scroller.evaluate((s,n)=>s.scrollTop=n,pos);await t.settle();
      await t.check(`${look} ${code} ${w} ${state} requested scroll restored`,Math.abs(await scroller.evaluate(s=>s.scrollTop)-pos)<=1);
      if(state==='focus')await t.visible(row.locator('.o55-row > button:not(.o55-tipq)'), 'focused recovery action remains visible');
      const boxes=await row.evaluate(e=>{
       const parts=[...e.querySelector('.o55-row').children];
       const rects=parts.map(n=>{const r=document.createRange();r.selectNodeContents(n);return {name:n.className,rects:[...r.getClientRects()].map(b=>({x:b.x,y:b.y,r:b.right,b:b.bottom}))};});
       const collisions=[];
       for(let i=0;i<rects.length;i++)for(let j=i+1;j<rects.length;j++)for(const a of rects[i].rects)for(const b of rects[j].rects)
        if(Math.min(a.r,b.r)-Math.max(a.x,b.x)>1&&Math.min(a.b,b.b)-Math.max(a.y,b.y)>1)collisions.push([rects[i].name,rects[j].name]);
       return collisions;
      });
      await t.check(`${route} ${code} ${look} ${w}x${h} ${state} recovery has separate text boxes`,boxes.length===0,JSON.stringify(boxes));
      if(t.args.sabotage==='ink')await pill.evaluate(e=>e.style.setProperty('color','transparent','important'));
      const before=await scroller.evaluate(s=>s.scrollTop),p=await paintedText(pill),after=await scroller.evaluate(s=>s.scrollTop);
      measured++;
      const label=`${route} ${code} ${look} ${w}x${h} scroll ${before}/${range.max} ${state}`;
      t.log(JSON.stringify({label,count:p.count,minimum:p.minimum,brightest:p.brightest}));
      await t.check(label+' retains scroll',before===after,`${before} -> ${after}`);
      await t.check(label+' failure status ink >=4.5',p.count>=3&&p.minimum>=4.5,`${p.minimum.toFixed(3)}:1 (${p.count} stems)`);
      if(p.minimum<lowest.contrast)lowest={contrast:p.minimum,label};
      if(route==='copied'&&code==='permission'&&look==='glass-dark'&&w===1024&&h===900&&state==='rest'&&pos===range.lo)
       await t.crop('glass-dark-copied-permission-failure',row,'Glass Dark keeps its tinted material behind a legible Install failed status');
     }
    }
    await t.check(`${route} ${code} ${look} ${w}x${h} measured painted cells`,measured>0);
   }
  }
 }
 await t.check('selection measured at least one painted cell',Number.isFinite(lowest.contrast));
 t.log('LOWEST '+JSON.stringify(lowest));
}
