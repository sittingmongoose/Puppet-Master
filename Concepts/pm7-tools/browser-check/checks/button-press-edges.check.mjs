// FO-73: real held presses at each button edge; sample hit bounds every frame.
import { appendFile } from 'node:fs/promises';
import { LOOKS } from '../browser-check.config.mjs';
const L='#pm-o55-onboarding ';
// A carry is a visual copy, never a press target, even when cloneNode preserves our data-* marker.
const LIVE=':not(lg-over *,lg-under *,.lg-twin,.lg-twin *,[aria-hidden="true"],[aria-hidden="true"] *,[inert],[inert] *)';
// Authored no-press inventories: main78a1fd64cd/build5be0ddad1344df89 and headfec7be5e39/build63fae67e882a078b,
// all ten looks, 22 screens, normal surface. Minimum is the lower valid-pane count across both inventories.
// Main Basic Dark look had an unrendered pane (4 chrome controls); excluded from minima and retained as
// TOOLS-KIT-20261109-29 false-pass evidence. JSON rows and the per-source table are in the lane evidence analysis/.
const SCREEN_MIN = {"look":15,"where":11,"nas-find":14,"begin":11,"name":12,"safe":14,"away":9,"review":12,"ai-none":9,"ready":9,"look-menu":29,"backup-sheet":22,"ex-folder":9,"nas-smb":10,"tree-sheet":15,"away-proxy":18,"safe-details":16,"rail-history":14,"tip-open":15,"away-download":15,"server-self":13,"server-guest":18};
const ACTUAL_SCREEN={'look-menu':'look','backup-sheet':'safe','tree-sheet':'ex-folder','away-proxy':'away','safe-details':'safe','rail-history':'review','tip-open':'name','away-download':'away-setup','server-self':'s-confirm','server-guest':'s-ready'};
const changedPose=(a,b)=>Object.keys(a).some(k=>a[k].some((v,i)=>v!==b[k][i]));
const poseDelta=(a,b)=>Object.fromEntries(Object.keys(a).map(k=>[k,b[k].map((v,i)=>v-a[k][i])]));
export default async function(t) {
 const f=await t.app.open({onboarding:true,query:'o55=fresh'});
 await f.waitForFunction(()=>window.O55?.S?.open);
 if(t.args.width)await t.viewport(Number(t.args.width),Number(t.args.height||1080));
 const hold=Number(t.args.hold||350);
 const fe=f===t.page.mainFrame()?null:await f.frameElement(),off=fe?await fe.boundingBox():{x:0,y:0};
 await f.evaluate(live=>{
  window.__press={clicks:[],downs:[],ups:[],cancels:[],trial:'',live,clones:[],cloneSeen:new WeakSet()};
  window.__pressFamily=e=>{const cls=[...e.classList].filter(c=>!['o55-on','pmh-on','o55-lookbtn','o55-talk','o55-close','o55-previewing'].includes(c)).sort().join('.')||e.parentElement.className;return e.tagName+':'+(e.matches('[role=checkbox]')?e.dataset.o55Do+':':'')+cls+(e.matches('.o55-btn')?':'+(e.closest('.o55-foot')?'footer':e.closest('.o55-sheet')?'sheet':'inline'):'')+(e.closest('.o55-lookmenu')?':look-menu':'');};
  window.__pressPose=e=>{const read=n=>{if(!n)return {transform:[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],scale:[1,1,1],translate:[0,0,0]};const c=getComputedStyle(n),sc=c.scale==='none'?[1]:c.scale.split(/\s+/).map(Number),tr=c.translate==='none'?[]:c.translate.split(/\s+/);return {transform:[...new DOMMatrixReadOnly(c.transform==='none'?undefined:c.transform).toFloat64Array()],scale:[sc[0],sc[1]??sc[0],sc[2]??1],translate:[0,1,2].map(i=>{const v=tr[i]||'0px';return v.endsWith('%')?parseFloat(v)*(i===0?n.offsetWidth:i===1?n.offsetHeight:0)/100:parseFloat(v);})};};return {root:read(e),kid:read(e.firstElementChild)};};
  const id=e=>{const c=e.target.closest&&e.target.closest('button,a[href].o55-btn');return c?c.__pressId??'other-choice':null;};
  window.addEventListener('pointerdown',e=>{
   const p=window.__press;p.downs.push({trial:p.trial,id:id(e)});p.holding=true;p.metrics={worst:0,frames:0};
   const sample=()=>{if(!p.holding||!p.node)return;const r=p.node.getBoundingClientRect(),b=p.rest;p.metrics.frames++;if(!p.metrics.sawClone){const copies=document.querySelectorAll('.lg-twin[data-press-test],.lg-twin [data-press-test]');if(copies.length)p.metrics.sawClone=true;copies.forEach(n=>{if(n.matches(p.live)||p.cloneSeen.has(n))return;p.cloneSeen.add(n);p.clones.push({hidden:!!n.closest('[aria-hidden="true"]'),inert:!!n.closest('[inert]'),carry:!!n.closest('lg-over,lg-under,.lg-twin'),classes:n.className});});}p.metrics.worst=Math.max(p.metrics.worst,Math.abs(r.x-b.x),Math.abs(r.y-b.y),Math.abs(r.width-b.w),Math.abs(r.height-b.h));requestAnimationFrame(sample);};sample();
  },true);
  window.addEventListener('pointerup',e=>{window.__press.ups.push({trial:window.__press.trial,id:id(e)});window.__press.holding=false;},true);
  window.addEventListener('pointercancel',e=>{window.__press.cancels.push({trial:window.__press.trial,id:id(e)});window.__press.holding=false;},true);
  window.addEventListener('click',e=>{window.__press.clicks.push({trial:window.__press.trial,id:id(e),trusted:e.isTrusted});e.stopImmediatePropagation();e.preventDefault();},true);
 },LIVE);
 if(t.args.selftest&&t.args.selftest!=='unrendered-pane')await f.evaluate(kind=>{const s=document.createElement('style');s.id='fo73-negative';s.textContent=kind==='move-root'?'#pm-o55-onboarding [data-press-test]:active {translate:0 2px !important;transition:none !important}':kind==='child-scale'?'#pm-o55-onboarding [data-press-test]:active > :first-child {scale:.9 !important;transition:none !important}':kind==='child-translate'?'#pm-o55-onboarding [data-press-test]:active > :first-child {translate:0 2px !important;transition:none !important}':'';if(!s.textContent)throw Error('unknown FO-73 selftest '+kind);document.head.append(s);},String(t.args.selftest));
 const motions=t.args.motion?String(t.args.motion).split(','):['no-preference','reduce','attribute'];
 const looks=t.args.look?String(t.args.look).split(','):LOOKS;
 const screens=t.args.screen?String(t.args.screen).split(','):['look','where','nas-find','begin','name','safe','away','review','ai-none','ready','look-menu','backup-sheet','ex-folder','nas-smb','tree-sheet','away-proxy','safe-details','rail-history','tip-open','away-download','server-self','server-guest'];
 // The open look popup intentionally covers its page. Always exercise that page first, with the menu closed.
 if(screens.includes('look-menu')){const at=screens.indexOf('look');if(at<0)screens.unshift('look');else if(at>screens.indexOf('look-menu')){screens.splice(at,1);screens.unshift('look');}}
 for(const motion of motions) {
  await t.emulate({reducedMotion:motion==='attribute'?'no-preference':motion});
  for(const look of looks) {
   await f.evaluate(([fam,mode])=>O55.ui.applyLook(fam,mode),look.split('-'));await f.waitForTimeout(1600);
   await f.evaluate(m=>document.documentElement.setAttribute('data-motion',m==='attribute'?'reduced':'full'),motion);
   await f.evaluate(()=>{window.__pressSeen=new Set();window.__pressInventory=[];window.__pressClosedLook=null;O55.S.sess.ui['details:hist']=false;O55.S.sess.history=[];});
   for(const screen of screens) {
    await t.page.mouse.move(2,2);await f.evaluate(s=>{O55.S.lookOpen=false;O55.S.sess.ui.sheet=null;if(s==='safe-details')O55.S.sess.ui['details:hist']=true;if(s==='rail-history')O55.S.sess.history=['welcome','where','begin','name'];if(s==='away-proxy'){O55.S.draft().remote_mode='reverse_proxy';O55.S.draft().proxy_hostname='https://pm.example.net';}if(s==='server-self')Object.assign(O55.S.sess.server,{claimed:false,orClaimReq:true,orClaimOk:true,orBootOk:true,orRunOk:true,selfConfirmed:false});if(s==='away-download'){const S=O55.S;O55.away.seedServer(S,'reverse_proxy');Object.assign(S.draft(),{remote_mode:'reverse_proxy',proxy_hosting:'generate_only',proxy_kind:'caddy',proxy_hostname:'https://pm.example.net',review_confirmed:true});S.sess.awaySetup={id:'press-anchor',mode:'reverse_proxy',rev:S.draft().project_draft_revision,then:'ready',confirmed:true,step:1,done:['config'],state:'waiting',people:{},link:''};}O55.ui.go(s==='server-self'?'s-confirm':s==='server-guest'?'s-ready':s==='away-download'?'away-setup':s==='look-menu'?'look':s==='backup-sheet'?'safe':s==='tree-sheet'?'ex-folder':s==='away-proxy'?'away':s==='safe-details'?'safe':s==='rail-history'?'review':s==='tip-open'?'name':s,{noHistory:true});if(s==='server-guest'){const sv=O55.S.sess.server;sv.candidates=[{id:'press-guest',name:'Press phone',gen:sv.pairGen,state:'waiting',confirmed:false}];sv.runOk={'press-guest':true};sv.pairUntil=Date.now()+300000;O55.ui.refresh();}if(s==='look-menu')O55.ui.act('lookMenu');if(s==='tip-open'){const q=O55.S.root.querySelector('.o55-layer:not(.o55-out) .o55-tipq');if(q)O55.ui.act('tip',q.getAttribute('data-arg'));}if(s==='backup-sheet'||s==='tree-sheet'){O55.S.sess.ui.sheet=s==='backup-sheet'?'backup':'tree';O55.ui.refresh();}},screen);await f.waitForTimeout(1800);
    const expected=ACTUAL_SCREEN[screen]||screen,action=screen==='server-self'?'selfMatch':screen==='server-guest'?'match':null;
    await f.waitForFunction(id=>{const l=document.querySelector('#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out)'),m=l?.querySelector('.o55-main');return l?.dataset.screen===id&&!!m&&m.checkVisibility({opacityProperty:true,visibilityProperty:true});},expected,{timeout:15000}).catch(()=>{});
    if(t.args.selftest==='unrendered-pane')await f.evaluate(()=>{document.querySelector('#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out)').style.visibility='hidden';});
    const fixture=await f.evaluate(({expected,live,action,screen})=>{
     const layer=document.querySelector('#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out)'),main=layer?.querySelector('.o55-main');
     const shown=e=>!!e&&e.checkVisibility({opacityProperty:true,visibilityProperty:true})&&e.getBoundingClientRect().width>0;
     const candidates=[...document.querySelectorAll('#pm-o55-onboarding :is(button:not(.o55-card,.o55-tile),a[href].o55-btn):not([aria-disabled="true"]):not(:disabled)')].filter(e=>e.matches(live)&&shown(e));
     window.__pressScope=screen==='look-menu'?'.o55-lookmenu':null;
     const represented=action?candidates.filter(e=>e.matches('button[data-o55-do="'+action+'"]')):window.__pressScope?candidates.filter(e=>e.closest(window.__pressScope)):candidates;
     return {expected,actual:layer?.dataset.screen,state:O55.S.sess.screen,visible:shown(layer)&&shown(main),count:candidates.length,families:[...new Set(represented.map(window.__pressFamily))],modeButtons:candidates.filter(e=>e.matches('button[data-o55-do="pickMode"]')).length,modeHelp:candidates.some(e=>e.matches('.o55-tipq')&&e.closest('[data-o55-seg="pickMode"]')),footer:candidates.some(e=>e.closest('.o55-foot')),authoredCheckbox:represented.length,popupVisible:shown(document.querySelector('#pm-o55-onboarding .o55-lookmenu'))};
    },{expected,live:LIVE,action,screen});
    const minimum=SCREEN_MIN[screen];
    await t.check(`FO-73 screen reached with live controls ${look} ${motion} ${screen}`,Number.isFinite(minimum)&&fixture.visible&&fixture.actual===expected&&fixture.state===expected&&fixture.count>=minimum&&(!action||fixture.authoredCheckbox>=1),JSON.stringify({...fixture,minimum}),{hard:true});
    if(screen==='look')await t.check(`FO-73 Pick a look mode, help and footer present ${look} ${motion}`,fixture.modeButtons>=3&&fixture.modeHelp&&fixture.footer,JSON.stringify(fixture),{hard:true});
    if(screen==='look-menu'){const background=await f.evaluate(()=>window.__pressClosedLook);await t.check('FO-73 look popup has closed-page coverage '+look+' '+motion,fixture.popupVisible&&!!background?.passed,JSON.stringify({popup:fixture.popupVisible,background}),{hard:true});}
    if(t.args.screen)await f.evaluate(()=>window.__pressSeen=new Set());
    await f.evaluate(()=>{document.querySelectorAll('[data-press-test]').forEach(e=>e.removeAttribute('data-press-test'));document.querySelectorAll('#pm-o55-onboarding :is(button:not(.o55-card, .o55-tile),a[href].o55-btn):not([aria-disabled="true"]):not(:disabled)').forEach(e=>{if(!e.matches(window.__press.live)||(window.__pressScope&&!e.closest(window.__pressScope)))return;if(['s-confirm','s-ready'].includes(O55.S.sess.screen)&&!e.matches('[role="checkbox"]'))return;if(e.checkVisibility({opacityProperty:true,visibilityProperty:true})&&e.getBoundingClientRect().width){const key=window.__pressFamily(e);if(!window.__pressSeen.has(key)){window.__pressSeen.add(key);window.__pressInventory.push({key,screen:O55.S.sess.screen,classes:e.className,action:e.getAttribute('data-o55-do'),label:e.textContent.trim(),width:e.getBoundingClientRect().width});e.setAttribute('data-press-test','');}}});});
    // Server polling morphs temporary test attributes away. Its checkbox producer
    // has an authored action selector that survives those normal refreshes.
    const sel=L+(action?`button[data-o55-do="${action}"]`:'[data-press-test]')+LIVE+(t.args.button&&!(screen==='look'&&screens.includes('look-menu'))?String(t.args.button):''),count=await f.locator(sel).count(),tag=`${look} ${motion} ${screen}`;
    if(t.args.selectorRace&&screen==='look'){
     const first=f.locator('#pm-o55-onboarding [data-o55-seg="pickMode"] .o55-seg > button[data-arg="light"]'+LIVE),b=await first.boundingBox();
     await t.page.mouse.move(b.x+b.width/2,b.y+b.height/2);await t.page.mouse.down();
     try{
      await f.waitForFunction(()=>document.querySelector('#pm-o55-onboarding .lg-twin[data-press-test]'),null,{timeout:3000});
      const race=await f.evaluate(({live})=>{const old=[...document.querySelectorAll('#pm-o55-onboarding [data-press-test]')],real=[...document.querySelectorAll('#pm-o55-onboarding [data-press-test]'+live)],describe=e=>{const b=e.getBoundingClientRect();return {classes:e.className,action:e.dataset.o55Do,arg:e.dataset.arg,hidden:!!e.closest('[aria-hidden="true"]'),inert:!!e.closest('[inert]'),copy:!!e.closest('.lg-twin'),box:{x:b.x,y:b.y,w:b.width,h:b.height},hit:document.elementsFromPoint(b.x+b.width/2,b.y+b.height/2).slice(0,3).map(n=>n.className?.baseVal??n.className)};};return {old:describe(old[3]),live:describe(real[3]),oldOwnsHelp:old[3].matches('.o55-tipq')&&!old[3].closest('.lg-twin'),liveOwnsHelp:real[3].matches('.o55-tipq')&&!real[3].closest('.lg-twin')};},{live:LIVE});
      t.log('FO-73 actual held carry resolver witness '+JSON.stringify(race));
      await t.crop('carry-selector-race',f.locator('#pm-o55-onboarding .o55-lookmode'),'Actual held carry; legacy nth(3) is a visual copy, live nth(3) is the mode help dot.');
      await t.check('FO-73 selector resolves the live mode help dot during a real carry',String(t.args.selectorRace)==='old'?race.oldOwnsHelp:race.liveOwnsHelp,JSON.stringify(race));
     }finally{await t.page.mouse.up();await t.page.mouse.move(2,2);}
     await f.waitForFunction(()=>!document.querySelector('#pm-o55-onboarding .lg-twin[data-press-test]'),null,{timeout:5000});
    }
    if(action)await t.check('FO-73 authored Server checkbox fixture '+tag,count===1);
    if(t.args.screen){const marked=await f.evaluate(sel=>[...document.querySelectorAll(sel)].map(window.__pressFamily),L+'[data-press-test]'+LIVE);await t.check('FO-73 filtered screen family coverage '+tag,fixture.families.every(k=>marked.includes(k)),JSON.stringify({expected:fixture.families,marked}),{hard:true});}
    if(t.args.screen||t.args.button)await t.check('FO-73 filtered targets present '+tag,count>0,JSON.stringify({count,sel}),{hard:true});
    await f.evaluate(()=>{window.__press.clicks=[];window.__press.downs=[];window.__press.ups=[];window.__press.cancels=[];});
    const misses=[],moved=[],scaled=[],covered=[],coveredTargets=[],undecorated=[],tweened=[],ambient=[],tipOwn=[];let presses=0;
    for(let i=0;i<count;i++) {
     const c=f.locator(sel).nth(i);await c.scrollIntoViewIfNeeded();await t.page.mouse.move(2,2);
     const isLink=await c.evaluate(e=>e.matches('.o55-link')),isTip=await c.evaluate(e=>e.matches('.pst-tip-x'));
     const ambientStart=isTip?await c.evaluate(e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y};}):null;
     if(isLink&&t.args.inventoryOut&&motion==='no-preference')await t.crop(`${look}-${screen}-link-rest`,c,'Native underline at rest after moving text into its visual layer.');
     const points=['corner top-left','corner top-right','corner bottom-left','corner bottom-right'];
     for(const d of (t.args.twoPx?[1,2]:[1]))for(const edge of ['top','bottom','left','right'])points.push(`${edge}-${d}`);
     for(const name of (t.args.point?points.filter(p=>p===t.args.point):points)) {
      const trial=`${tag} ${i} ${name}`;
      await t.page.mouse.move(2,2);
      // Explanations follow Pip until hovered. Pin the current visual naturally, then
      // measure this hold's box: moving away between trials must not stale its baseline.
      const center=await c.boundingBox();await t.page.mouse.move(center.x+center.width/2,center.y+center.height/2);
      const rest=await f.evaluate(async({sel,i,trial})=>{
       const e=document.querySelectorAll(sel)[i];e.__pressId=i;getComputedStyle(e).transform;
       const ancestors=[];for(let n=e;n&&n!==document.body;n=n.parentElement)ancestors.push(n);
       await Promise.all(ancestors.flatMap(n=>n.getAnimations()).filter(a=>a.playState==='running'&&Number.isFinite(a.effect.getComputedTiming().endTime)).map(a=>a.finished.catch(()=>{})));
       const r=e.getBoundingClientRect(),style=getComputedStyle(e);
       const rad=Math.min(r.width/2,r.height/2,Math.max(...['TopLeft','TopRight','BottomLeft','BottomRight'].map(k=>parseFloat(style['border'+k+'Radius'])||0)));
       const kid=e.firstElementChild,ks=kid?getComputedStyle(kid):null;const b={x:r.x,y:r.y,w:r.width,h:r.height,rad,pose:window.__pressPose(e),kidTranslate:ks?.translate||'none'};window.__press.trial=trial;window.__press.node=e;window.__press.rest=b;return b;
      },{sel,i,trial});
      const k=Math.ceil(rest.rad*.293)+2,d=Number(name.split('-').pop())||1,corner=name.startsWith('corner');
      const x=corner?(name.includes('left')?rest.x+k:rest.x+rest.w-k):name.startsWith('left')?rest.x+d:name.startsWith('right')?rest.x+rest.w-d:rest.x+rest.w/2;
      const y=corner?(name.includes('top')?rest.y+k:rest.y+rest.h-k):name.startsWith('top')?rest.y+d:name.startsWith('bottom')?rest.y+rest.h-d:rest.y+rest.h/2;
      const exposed=await f.evaluate(({sel,i,x,y})=>{const e=document.querySelectorAll(sel)[i],p=document.elementFromPoint(x,y);return p===e||e.contains(p);},{sel,i,x,y});
      if(!exposed){const allowed=await c.evaluate((e,{x,y,name})=>{
       window.__lastClipProof=null;
       // Fractional scroll rounding can map bottom-1 to the footer just below it.
       // These exact control/family cuts are witnessed on the pinned control too.
       // The covering element must be the footer itself, with no own pseudo.
       // NieR button decorations inside it cannot cover this boundary.
       // A footer-button top cover, a sibling control, or any unknown cut fails.
       if(!e.matches('.o55-toggle[data-o55-do="filesafe"],.o55-sheet .o55-primary[data-o55-do="sheet-close"]'))return false;
       const sc=e.closest('.o55-scroll'),foot=e.closest('.o55-layer')?.querySelector('.o55-foot'),hit=document.elementFromPoint(x,y);
       if(!sc||!foot||name!=='bottom-1'||hit!==foot)return false;
       const r=e.getBoundingClientRect(),sr=sc.getBoundingClientRect(),fr=foot.getBoundingClientRect();
       const boundary=sr.top+sc.clientTop+sc.clientHeight,clip=r.bottom-boundary,family=(window.PM_NIER&&PM_NIER.on())?'nier':O55.S.root.dataset.family;
       const expected=e.matches('.o55-toggle')?({friendly:.4375,nier:.359375})[family]:({basic:.25,friendly:.1875,retro:.40625})[family];
       window.__lastClipProof={family,theme:document.documentElement.dataset.theme,nier:window.PM_NIER?.on(),expected,clip,boundary,footerTop:fr.top,hitTag:hit?.tagName,pointY:y,bottom2Owned:e.contains(document.elementFromPoint(x,r.bottom-2)),scrollTop:sc.scrollTop,scrollMax:sc.scrollHeight-sc.clientHeight,pseudos:[foot,...foot.querySelectorAll('*')].flatMap(n=>['::before','::after'].map(ps=>({tag:n.tagName,cls:n.className,ps,content:getComputedStyle(n,ps).content}))).filter(p=>!['none','normal'].includes(p.content))};
       return expected!==undefined&&Math.abs(clip-expected)<.001&&Math.abs(fr.top-boundary)<.01
        &&y>=boundary-1&&y<boundary&&e.contains(document.elementFromPoint(x,r.bottom-2))
        &&x>=sr.left&&x<=sr.right&&sc.scrollHeight>sc.clientHeight&&sc.scrollTop<sc.scrollHeight-sc.clientHeight
        &&['::before','::after'].every(ps=>['none','normal'].includes(getComputedStyle(foot,ps).content));
      },{x,y,name});await t.check('FO-73 only proven fractional own-scroller clip '+trial,allowed,'Unknown cover is a failure');covered.push(trial);coveredTargets.push(await f.evaluate(({sel,i,x,y,trial})=>{
       const e=document.querySelectorAll(sel)[i],describe=n=>{const r=n.getBoundingClientRect(),s=getComputedStyle(n);return {tag:n.tagName,classes:n.className?.baseVal??n.className,x:r.x,y:r.y,w:r.width,h:r.height,pointerEvents:s.pointerEvents,overflow:s.overflow,clientTop:n.clientTop,clientHeight:n.clientHeight,scrollTop:n.scrollTop,scrollHeight:n.scrollHeight,position:s.position,before:{content:getComputedStyle(n,'::before').content,inset:getComputedStyle(n,'::before').inset},after:{content:getComputedStyle(n,'::after').content,inset:getComputedStyle(n,'::after').inset}};};
       const ancestors=[];for(let n=e.parentElement;n&&n!==document.body;n=n.parentElement)ancestors.push(describe(n));
       return {trial,x,y,proof:window.__lastClipProof,target:describe(e),ancestors,stack:document.elementsFromPoint(x,y).slice(0,6).map(describe)};
      },{sel,i,x,y,trial}));if(t.args.occlusionShots)await t.shot(`pre-down-occluded-${trial.replaceAll(' ','-')}`,'Before pointer-down; native covering-element geometry is in coveredTargets.');continue;}
      await t.page.mouse.move(off.x+x,off.y+y);if(t.args.marks)await t.mark(`down ${trial}`);await t.page.mouse.down();
      // Sampling starts in pointerdown capture, before owner press handlers and the first painted frame.
      await f.waitForTimeout(hold);
      const read=()=>f.evaluate(({sel,i})=>{const e=document.querySelectorAll(sel)[i],r=e.getBoundingClientRect(),kid=e.firstElementChild,ks=kid?getComputedStyle(kid):null;
       return {pose:window.__pressPose(e),x:r.x,y:r.y,w:r.width,h:r.height,rootScale:getComputedStyle(e).scale,rootTranslate:getComputedStyle(e).translate,transform:getComputedStyle(e).transform,active:e.matches(':active'),linkUnderline:!e.matches('.o55-link')||!kid||ks.textDecorationLine===getComputedStyle(e).textDecorationLine,kidDuration:ks?ks.transitionDuration:'0s',kidTranslate:ks?ks.translate:'none',kidScale:ks?ks.scale:'none',kidTransform:ks?ks.transform:'none'};},{sel,i});
      let h=await read();
      const drift=await f.evaluate(()=>({...window.__press.metrics}));
      if(t.args.marks)await t.mark(`up ${trial}`);await t.page.mouse.up();presses++;
      await f.waitForFunction(trial=>window.__press.clicks.some(e=>e.trial===trial),trial,{timeout:1000}).catch(()=>{});
      const got=await f.evaluate(trial=>({c:window.__press.clicks.filter(x=>x.trial===trial),d:window.__press.downs.filter(x=>x.trial===trial),u:window.__press.ups.filter(x=>x.trial===trial),cancel:window.__press.cancels.filter(x=>x.trial===trial)}),trial);
      if(!(got.d.length===1&&got.d[0].id===i&&got.c.length===1&&got.c[0].id===i&&got.c[0].trusted))misses.push({trial,down:got.d.map(x=>x.id),click:got.c.map(x=>x.id),up:got.u,cancel:got.cancel,held:h.transform});
      if(isTip){ambient.push({kind:'ambient, not press',trial,betweenTrialsX:rest.x-ambientStart.x,betweenTrialsY:rest.y-ambientStart.y,holdDrift:drift.worst});if(h.transform!=='none'||!['none','1'].includes(h.rootScale)||!['none','0px','0px 0px'].includes(h.rootTranslate))tipOwn.push({trial,transform:h.transform,scale:h.rootScale,translate:h.rootTranslate});}
      if(drift.frames<2||drift.worst>.01||Math.abs(h.x-rest.x)>.01||Math.abs(h.y-rest.y)>.01||Math.abs(h.w-rest.w)>.01||Math.abs(h.h-rest.h)>.01)moved.push({trial,drift,rest,held:h});
      const rootChanged=changedPose(rest.pose.root,h.pose.root),childChanged=changedPose(rest.pose.kid,h.pose.kid);
      if(look.startsWith('retro')&&h.kidDuration.split(',').some(v=>parseFloat(v)!==0))tweened.push({trial,duration:h.kidDuration});
      if(!h.linkUnderline)undecorated.push(trial);
      if(motion!=='no-preference'&&(rootChanged||childChanged))scaled.push({trial,transform:h.transform,kidScale:h.kidScale,kidTransform:h.kidTransform,kidTranslate:h.kidTranslate,restKidTranslate:rest.kidTranslate,rootDelta:poseDelta(rest.pose.root,h.pose.root),kidDelta:poseDelta(rest.pose.kid,h.pose.kid)});
     }
     if(t.args.selftest&&t.args.selftest!=='unrendered-pane'&&i===0){
      await t.page.mouse.move(2,2);const b=await c.boundingBox(),clip={x:Math.max(0,b.x-8),y:Math.max(0,b.y-8),width:b.width+16,height:b.height+16};
      await t.crop('negative-rest-'+tag.replaceAll(' ','-'),clip,'Injected press fault: native control at rest.');
      await f.evaluate(()=>window.__press.trial='visual-only');await t.page.mouse.move(b.x+b.width/2,b.y+b.height/2);await t.page.mouse.down();
      try{await f.waitForTimeout(hold);await t.crop('negative-held-'+tag.replaceAll(' ','-'),clip,'Injected press fault: same native pixels during a separate held press.');}finally{await t.page.mouse.up();}
     }
     // Capture press appearance separately. Screenshot/compositor work must not
     // extend or interfere with the eight native activation trials above.
     if(isLink&&t.args.inventoryOut&&motion==='no-preference') {
      await t.page.mouse.move(2,2);const b=await c.boundingBox();
      await f.evaluate(({sel,i})=>{const e=document.querySelectorAll(sel)[i],r=e.getBoundingClientRect();window.__press.trial='visual-only';window.__press.node=e;window.__press.rest={x:r.x,y:r.y,w:r.width,h:r.height};},{sel,i});
      await t.page.mouse.move(b.x+b.width/2,b.y+b.height/2);await t.page.mouse.down();await f.waitForTimeout(hold);
      await t.crop(`${look}-${screen}-link-held`,{x:b.x,y:b.y,width:b.width,height:b.height},'Separate visual press: underline moves with content inside the stationary link.');
      await t.page.mouse.up();
     }
    }
    await t.page.mouse.move(2,2);
    if(screen==='look')await f.evaluate(({passed,families})=>window.__pressClosedLook={passed,families},{passed:count===fixture.families.length&&!misses.length&&!moved.length&&!scaled.length&&!undecorated.length&&!tipOwn.length&&!tweened.length&&!covered.length,families:fixture.families});
    if(t.args.inventoryOut)await appendFile(String(t.args.inventoryOut)+'.trials.jsonl',JSON.stringify({look,motion,screen,count,presses,covered,coveredTargets,misses,moved,scaled,ambient,tipOwn})+'\n');
    await t.check(`FO-73 press activates at every edge ${tag}`,!misses.length,`${count} representative button families,  ${presses} held presses (${covered.length} points occluded before press); misses ${JSON.stringify(misses.slice(0,6))}${misses.length>6?` (+${misses.length-6})`:''}`);
    if(ambient.length)await t.check(`FO-73 Pip close adds no own transform ${tag}`,!tipOwn.length,JSON.stringify(tipOwn));
    if(look.startsWith('retro'))await t.check(`FO-73 Retro press is a hard cut ${tag}`,!tweened.length,JSON.stringify(tweened));
    await t.check(`FO-73 link underline retained ${tag}`,!undecorated.length,JSON.stringify(undecorated));
    await t.check(`FO-73 pressed target stays at rest box ${tag}`,!moved.length,JSON.stringify(moved.slice(0,3)));
    if(motion!=='no-preference')await t.check(`FO-73 no press scale with Reduced Motion ${tag}`,!scaled.length,JSON.stringify(scaled.slice(0,3)));

   }
   const inventory=await f.evaluate(()=>window.__pressInventory);
   await t.check(`FO-73 representative inventory ${look} ${motion}`,inventory.length>0);
   if(!t.args.screen||t.args.requireFamilies){const required=['o55-iconbtn','o55-btn','o55-link','o55-suggestchip','o55-detbtn','o55-morebtn','o55-lookopt','o55-treeitem','o55-check','o55-toggle','o55-railjump'];const missing=required.filter(c=>!inventory.some(e=>e.classes.split(' ').includes(c)));await t.check(`FO-73 complete family coverage ${look} ${motion}`,!missing.length,JSON.stringify(missing));const absent=['consent','selfMatch','match'].filter(action=>!inventory.some(e=>e.action===action));await t.check(`FO-73 each checkbox producer inventoried ${look} ${motion}`,!absent.length,JSON.stringify(absent));await t.check(`FO-73 anchor producer inventoried ${look} ${motion}`,inventory.some(e=>e.key.startsWith('A:')));}
   if(t.args.inventoryOut)await appendFile(String(t.args.inventoryOut),JSON.stringify({look,motion,inventory})+'\n');
  }
 }
 const clones=await f.evaluate(()=>window.__press.clones);t.log('FO-73 observed visual clones '+JSON.stringify(clones));await t.check('FO-73 visual press copies stay aria-hidden and inert',clones.every(c=>c.carry&&c.hidden&&c.inert),JSON.stringify(clones));if(t.args.requireClones)await t.check('FO-73 real carry copies observed',clones.length>0,JSON.stringify({count:clones.length}),{hard:true});
 await f.evaluate(()=>document.documentElement.setAttribute('data-motion','full'));
 await t.emulate({reducedMotion:'no-preference'});
}
