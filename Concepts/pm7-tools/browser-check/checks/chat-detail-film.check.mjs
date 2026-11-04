import {pathToFileURL} from 'node:url';
export default async function(t){
 await t.emulate({reducedMotion:'no-preference'});
 await t.page.context().addInitScript(()=>{
  window.__shortClicks=[];
  for(const type of ['pointerdown','click'])window.addEventListener(type,e=>{
   const b=e.target.closest?.('[data-action]');
   const record={type,trusted:e.isTrusted,action:b?.dataset.action,domain:b?.dataset.domain,time:e.timeStamp,wall:performance.timeOrigin+e.timeStamp};
   window.__shortClicks.push(record);
   if(type==='click'&&e.isTrusted&&b?.dataset.action==='open-activity'){
    const probe=()=>{
     const p=document.querySelector('#pmRoot .activity-panel.cover');
     if(p&&p.getBoundingClientRect().width>0)requestAnimationFrame(()=>{record.coverFrameMs=performance.now()-e.timeStamp;});
     else if(performance.now()-e.timeStamp<2000)requestAnimationFrame(probe);
    };requestAnimationFrame(probe);
   }
  },true);
 });
 const base=/^https?:/.test(t.args.page)?t.args.page:pathToFileURL(t.args.page).href;
 const [f]=await t.openSideBySide([{url:base+'?o55=off',width:1024,height:480}],{height:480,settleMs:0});
 t.log('native film iframe bounds '+JSON.stringify(await (await f.frameElement()).boundingBox()));
 if(Number(t.args.sandbox)===1){const el=await f.frameElement();await el.evaluate(e=>e.setAttribute('sandbox','allow-scripts allow-forms allow-popups allow-downloads'));}
 for(let i=0;i<Number(t.args.reps||3);i++){
  await f.goto(base+'?o55=off&review='+i,{timeout:30000});
  await f.waitForFunction(()=>window.__PM56_BOOT_OK&&window.PM56_PORT?.ready);
  const size=await f.evaluate(()=>[innerWidth,innerHeight]);await t.equal('actual short viewport '+i,JSON.stringify(size),'[1024,480]');
  await f.locator('#o55np-reboot').waitFor({state:'detached',timeout:15000});
  const b=f.locator('#pmRoot [data-action="open-activity"]').first();await b.waitFor({state:'visible'});
  const info=await b.evaluate(e=>({html:e.outerHTML,theme:document.documentElement.dataset.theme,nier:PM_NIER.on(),reduced:matchMedia('(prefers-reduced-motion: reduce)').matches,rootClass:document.querySelector('#pmRoot').className,htmlMotion:document.documentElement.getAttribute('data-motion')}));t.log('click target '+i+' '+JSON.stringify(info));await t.check('full motion at first click '+i,!info.reduced);
  const box=await b.boundingBox();t.log('click native bounds '+i+' '+JSON.stringify(box));await t.page.mouse.move(box.x+box.width/2,box.y+box.height/2);
  t.log('input-clock anchor '+i+' '+JSON.stringify(await f.evaluate(()=>({wall:performance.timeOrigin+performance.now()}))));await t.mark('first click '+i);await t.page.mouse.click(box.x+box.width/2,box.y+box.height/2);
  // Event timestamps below locate the input independently of awaited click completion.
  await t.page.waitForTimeout(1200);await t.mark('cover settled '+i);
  const got=await f.evaluate(()=>({events:window.__shortClicks,open:PM56_APP.state.activity.open,cover:!!document.querySelector('#pmRoot .activity-panel.cover'),rect:document.querySelector('#pmRoot .activity-panel.cover')?.getBoundingClientRect().toJSON()}));
  t.log('paint region '+i+' '+JSON.stringify(got));
  await t.check('one click opens cover '+i,got.open&&got.cover,JSON.stringify(got));
  const click=got.events.find(e=>e.type==='click'&&e.action==='open-activity');
  await t.check('input-clock cover frame <=500ms '+i,click?.coverFrameMs<=500,JSON.stringify(click));
  await t.page.waitForTimeout(150);
 }

 if(t.args.latencyOnly)return;
 const filmFrame=await f.frameElement();
 await filmFrame.evaluate(e=>{Object.assign(e.style,{width:'1390px',minWidth:'1390px',maxWidth:'none',height:'900px'});});
 await f.goto(base+'?o55=off&review=detail-boundary');
 await f.waitForFunction(()=>window.__PM56_BOOT_OK&&window.PM56_PORT?.ready);
 await f.locator('#o55np-reboot').waitFor({state:'detached',timeout:15000});
 const detailId=await f.evaluate(()=>{PMW.chatCol.setWidth(760);PMW.chatCol.show();const a=PM_WORK.items({thread:PM56_APP.state.selectedThread,kind:'agent'}).filter(x=>x.role!=='main');const id=(a[1]||a[0]).id;PM56_DEMO.openActivity('subagents',id);return id;});
 for(const width of [1390,1177,1178]){
  await t.mark('selected Detail resize '+width);
  await filmFrame.evaluate((e,w)=>{e.style.width=w+'px';e.style.minWidth=w+'px';},width);
  await t.page.waitForTimeout(1000);
  await t.mark('selected Detail settled '+width);
  const r=await f.evaluate(()=>({viewport:innerWidth,selected:PM56_APP.state.activity.selected,host:PM56_HOST.width(),column:document.querySelector('#chatPanel').getBoundingClientRect().width,stage:document.querySelector('#pmRoot .chat-stage').getBoundingClientRect().toJSON(),panel:document.querySelector('#pmRoot .activity-panel')?.getBoundingClientRect().toJSON(),cover:!!document.querySelector('#pmRoot .activity-panel.cover'),reboot:!!document.querySelector('#o55np-reboot')}));
  t.log('filmed selected Detail '+JSON.stringify(r));
  await t.check(width+' actual selected Detail visible',r.viewport===width&&r.selected?.id===detailId&&!r.reboot,JSON.stringify(r));
  await t.check(width+' painted Detail allowance',r.cover||r.stage.width>=360,JSON.stringify(r));
 }
}
