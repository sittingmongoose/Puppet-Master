// FO-73: real held presses at each button edge; sample hit bounds every frame.
import { appendFile } from 'node:fs/promises';
import { LOOKS } from '../browser-check.config.mjs';
const L='#pm-o55-onboarding ';
export default async function(t) {
 const f=await t.app.open({onboarding:true,query:'o55=fresh'});
 await f.waitForFunction(()=>window.O55?.S?.open);
 if(t.args.width)await t.viewport(Number(t.args.width),Number(t.args.height||1080));
 const hold=Number(t.args.hold||350);
 const fe=f===t.page.mainFrame()?null:await f.frameElement(),off=fe?await fe.boundingBox():{x:0,y:0};
 await f.evaluate(()=>{
  window.__press={clicks:[],downs:[],ups:[],cancels:[],trial:''};
  const id=e=>{const c=e.target.closest&&e.target.closest('button,a[href].o55-btn');return c?c.__pressId??'other-choice':null;};
  window.addEventListener('pointerdown',e=>{
   const p=window.__press;p.downs.push({trial:p.trial,id:id(e)});p.holding=true;p.metrics={worst:0,frames:0};
   const sample=()=>{if(!p.holding||!p.node)return;const r=p.node.getBoundingClientRect(),b=p.rest;p.metrics.frames++;p.metrics.worst=Math.max(p.metrics.worst,Math.abs(r.x-b.x),Math.abs(r.y-b.y),Math.abs(r.width-b.w),Math.abs(r.height-b.h));requestAnimationFrame(sample);};sample();
  },true);
  window.addEventListener('pointerup',e=>{window.__press.ups.push({trial:window.__press.trial,id:id(e)});window.__press.holding=false;},true);
  window.addEventListener('pointercancel',e=>{window.__press.cancels.push({trial:window.__press.trial,id:id(e)});window.__press.holding=false;},true);
  window.addEventListener('click',e=>{window.__press.clicks.push({trial:window.__press.trial,id:id(e),trusted:e.isTrusted});e.stopImmediatePropagation();e.preventDefault();},true);
 });
 const motions=t.args.motion?String(t.args.motion).split(','):['no-preference','reduce','attribute'];
 const looks=t.args.look?String(t.args.look).split(','):LOOKS;
 const screens=t.args.screen?String(t.args.screen).split(','):['look','where','nas-find','begin','name','safe','away','review','ai-none','ready','look-menu','backup-sheet','ex-folder','nas-smb','tree-sheet','away-proxy','safe-details','rail-history','tip-open','away-download','server-self','server-guest'];
 for(const motion of motions) {
  await t.emulate({reducedMotion:motion==='attribute'?'no-preference':motion});
  for(const look of looks) {
   await f.evaluate(([fam,mode])=>O55.ui.applyLook(fam,mode),look.split('-'));await f.waitForTimeout(1600);
   await f.evaluate(m=>document.documentElement.setAttribute('data-motion',m==='attribute'?'reduced':'full'),motion);
   await f.evaluate(()=>{window.__pressSeen=new Set();window.__pressInventory=[];O55.S.sess.ui['details:hist']=false;O55.S.sess.history=[];});
   for(const screen of screens) {
    await t.page.mouse.move(2,2);await f.evaluate(s=>{O55.S.lookOpen=false;O55.S.sess.ui.sheet=null;if(s==='safe-details')O55.S.sess.ui['details:hist']=true;if(s==='rail-history')O55.S.sess.history=['welcome','where','begin','name'];if(s==='away-proxy'){O55.S.draft().remote_mode='reverse_proxy';O55.S.draft().proxy_hostname='https://pm.example.net';}if(s==='server-self')Object.assign(O55.S.sess.server,{claimed:false,orClaimReq:true,orClaimOk:true,orBootOk:true,orRunOk:true,selfConfirmed:false});if(s==='away-download'){const S=O55.S;O55.away.seedServer(S,'reverse_proxy');Object.assign(S.draft(),{remote_mode:'reverse_proxy',proxy_hosting:'generate_only',proxy_kind:'caddy',proxy_hostname:'https://pm.example.net',review_confirmed:true});S.sess.awaySetup={id:'press-anchor',mode:'reverse_proxy',rev:S.draft().project_draft_revision,then:'ready',confirmed:true,step:1,done:['config'],state:'waiting',people:{},link:''};}O55.ui.go(s==='server-self'?'s-confirm':s==='server-guest'?'s-ready':s==='away-download'?'away-setup':s==='look-menu'?'look':s==='backup-sheet'?'safe':s==='tree-sheet'?'ex-folder':s==='away-proxy'?'away':s==='safe-details'?'safe':s==='rail-history'?'review':s==='tip-open'?'name':s,{noHistory:true});if(s==='server-guest'){const sv=O55.S.sess.server;sv.candidates=[{id:'press-guest',name:'Press phone',gen:sv.pairGen,state:'waiting',confirmed:false}];sv.runOk={'press-guest':true};sv.pairUntil=Date.now()+300000;O55.ui.refresh();}if(s==='look-menu')O55.ui.act('lookMenu');if(s==='tip-open'){const q=O55.S.root.querySelector('.o55-layer:not(.o55-out) .o55-tipq');if(q)O55.ui.act('tip',q.getAttribute('data-arg'));}if(s==='backup-sheet'||s==='tree-sheet'){O55.S.sess.ui.sheet=s==='backup-sheet'?'backup':'tree';O55.ui.refresh();}},screen);await f.waitForTimeout(1800);
    await f.evaluate(()=>{document.querySelectorAll('[data-press-test]').forEach(e=>e.removeAttribute('data-press-test'));document.querySelectorAll('#pm-o55-onboarding :is(button:not(.o55-card, .o55-tile),a[href].o55-btn):not([aria-disabled="true"]):not(:disabled)').forEach(e=>{if(e.checkVisibility({opacityProperty:true,visibilityProperty:true})&&e.getBoundingClientRect().width){const cls=[...e.classList].filter(c=>!['o55-on','pmh-on','o55-lookbtn','o55-talk','o55-close'].includes(c)).sort().join('.')||e.parentElement.className;const key=e.tagName+':'+(e.matches('[role=checkbox]')?e.dataset.o55Do+':':'')+cls+(e.matches('.o55-btn')?':'+(e.closest('.o55-foot')?'footer':e.closest('.o55-sheet')?'sheet':'inline'):'');if(!window.__pressSeen.has(key)){window.__pressSeen.add(key);window.__pressInventory.push({key,screen:O55.S.sess.screen,classes:e.className,action:e.getAttribute('data-o55-do'),label:e.textContent.trim(),width:e.getBoundingClientRect().width});e.setAttribute('data-press-test','');}}});});
    const sel=L+'[data-press-test]'+(t.args.button?String(t.args.button):''),count=await f.locator(sel).count(),tag=`${look} ${motion} ${screen}`;
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
       const b={x:r.x,y:r.y,w:r.width,h:r.height,rad};window.__press.trial=trial;window.__press.node=e;window.__press.rest=b;return b;
      },{sel,i,trial});
      const k=Math.ceil(rest.rad*.293)+2,d=Number(name.split('-').pop())||1,corner=name.startsWith('corner');
      const x=corner?(name.includes('left')?rest.x+k:rest.x+rest.w-k):name.startsWith('left')?rest.x+d:name.startsWith('right')?rest.x+rest.w-d:rest.x+rest.w/2;
      const y=corner?(name.includes('top')?rest.y+k:rest.y+rest.h-k):name.startsWith('top')?rest.y+d:name.startsWith('bottom')?rest.y+rest.h-d:rest.y+rest.h/2;
      const exposed=await f.evaluate(({sel,i,x,y})=>{const e=document.querySelectorAll(sel)[i],p=document.elementFromPoint(x,y);return p===e||e.contains(p);},{sel,i,x,y});
      if(!exposed){const allowed=await c.evaluate((e,{x,y,name})=>{const sc=e.closest('.o55-scroll'),foot=e.closest('.o55-layer')?.querySelector('.o55-foot'),hit=document.elementFromPoint(x,y);if(!e.matches('.o55-toggle[data-o55-do="filesafe"],.o55-sheet .o55-primary[data-o55-do="sheet-close"]')||!sc||!foot||name!=='bottom-1'||!(hit===foot||foot.contains(hit)))return false;const r=e.getBoundingClientRect(),sr=sc.getBoundingClientRect(),fr=foot.getBoundingClientRect(),boundary=sr.top+sc.clientTop+sc.clientHeight,clip=r.bottom-boundary,family=O55.S.root.dataset.family,expected=e.matches('.o55-toggle')?({friendly:.4375,nier:.359375})[family]:({basic:.25,friendly:.1875,retro:.40625})[family];return expected!==undefined&&Math.abs(clip-expected)<.001&&Math.abs(fr.top-boundary)<.01&&y>=boundary-1&&y<boundary&&e.contains(document.elementFromPoint(x,r.bottom-2))&&x>=sr.left&&x<=sr.right&&sc.scrollHeight>sc.clientHeight&&sc.scrollTop<sc.scrollHeight-sc.clientHeight&&[foot,...foot.querySelectorAll('*')].every(n=>['::before','::after'].every(ps=>['none','normal'].includes(getComputedStyle(n,ps).content)));},{x,y,name});await t.check('FO-73 only proven fractional own-scroller clip '+trial,allowed,'Unknown cover is a failure');covered.push(trial);coveredTargets.push(await f.evaluate(({sel,i,x,y,trial})=>{
       const e=document.querySelectorAll(sel)[i],describe=n=>{const r=n.getBoundingClientRect(),s=getComputedStyle(n);return {tag:n.tagName,classes:n.className?.baseVal??n.className,x:r.x,y:r.y,w:r.width,h:r.height,pointerEvents:s.pointerEvents,overflow:s.overflow,clientTop:n.clientTop,clientHeight:n.clientHeight,scrollTop:n.scrollTop,scrollHeight:n.scrollHeight,position:s.position,before:{content:getComputedStyle(n,'::before').content,inset:getComputedStyle(n,'::before').inset},after:{content:getComputedStyle(n,'::after').content,inset:getComputedStyle(n,'::after').inset}};};
       const ancestors=[];for(let n=e.parentElement;n&&n!==document.body;n=n.parentElement)ancestors.push(describe(n));
       return {trial,x,y,target:describe(e),ancestors,stack:document.elementsFromPoint(x,y).slice(0,6).map(describe)};
      },{sel,i,x,y,trial}));if(t.args.occlusionShots)await t.shot(`pre-down-occluded-${trial.replaceAll(' ','-')}`,'Before pointer-down; native covering-element geometry is in coveredTargets.');continue;}
      await t.page.mouse.move(off.x+x,off.y+y);if(t.args.marks)await t.mark(`down ${trial}`);await t.page.mouse.down();
      // Sampling starts in pointerdown capture, before owner press handlers and the first painted frame.
      await f.waitForTimeout(hold);
      const read=()=>f.evaluate(({sel,i})=>{const e=document.querySelectorAll(sel)[i],r=e.getBoundingClientRect(),kid=e.firstElementChild,ks=kid?getComputedStyle(kid):null;
       return {x:r.x,y:r.y,w:r.width,h:r.height,rootScale:getComputedStyle(e).scale,rootTranslate:getComputedStyle(e).translate,transform:getComputedStyle(e).transform,active:e.matches(':active'),linkUnderline:!e.matches('.o55-link')||!kid||ks.textDecorationLine===getComputedStyle(e).textDecorationLine,kidDuration:ks?ks.transitionDuration:'0s',kidTranslate:ks?ks.translate:'none',kidScale:ks?ks.scale:'none',kidTransform:ks?ks.transform:'none'};},{sel,i});
      let h=await read();
      const drift=await f.evaluate(()=>({...window.__press.metrics}));
      if(t.args.marks)await t.mark(`up ${trial}`);await t.page.mouse.up();presses++;
      await f.waitForFunction(trial=>window.__press.clicks.some(e=>e.trial===trial),trial,{timeout:1000}).catch(()=>{});
      const got=await f.evaluate(trial=>({c:window.__press.clicks.filter(x=>x.trial===trial),d:window.__press.downs.filter(x=>x.trial===trial),u:window.__press.ups.filter(x=>x.trial===trial),cancel:window.__press.cancels.filter(x=>x.trial===trial)}),trial);
      if(!(got.d.length===1&&got.d[0].id===i&&got.c.length===1&&got.c[0].id===i&&got.c[0].trusted))misses.push({trial,down:got.d.map(x=>x.id),click:got.c.map(x=>x.id),up:got.u,cancel:got.cancel,held:h.transform});
      if(isTip){ambient.push({kind:'ambient, not press',trial,betweenTrialsX:rest.x-ambientStart.x,betweenTrialsY:rest.y-ambientStart.y,holdDrift:drift.worst});if(h.transform!=='none'||!['none','1'].includes(h.rootScale)||!['none','0px','0px 0px'].includes(h.rootTranslate))tipOwn.push({trial,transform:h.transform,scale:h.rootScale,translate:h.rootTranslate});}
      if(drift.frames<2||drift.worst>.01||Math.abs(h.x-rest.x)>.01||Math.abs(h.y-rest.y)>.01||Math.abs(h.w-rest.w)>.01||Math.abs(h.h-rest.h)>.01)moved.push({trial,drift,rest,held:h});
      const contentScaled=(h.kidScale!=='none'&&h.kidScale!=='1')||/matrix\((?!1, 0, 0, 1,)/.test(h.kidTransform);
      if(look.startsWith('retro')&&h.kidDuration.split(',').some(v=>parseFloat(v)!==0))tweened.push({trial,duration:h.kidDuration});
      if(!h.linkUnderline)undecorated.push(trial);
      if(motion!=='no-preference'&&(contentScaled||h.transform!=='none'||!['none','0px','0px 0px'].includes(h.kidTranslate)))scaled.push({trial,transform:h.transform,kidScale:h.kidScale,kidTransform:h.kidTransform});
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
 await f.evaluate(()=>document.documentElement.setAttribute('data-motion','full'));
 await t.emulate({reducedMotion:'no-preference'});
}
