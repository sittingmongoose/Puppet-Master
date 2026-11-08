import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

// QA-7 owner-scene audit. Demo Studio opens every registered screen with its normal fixture seed.
// The real Recovery Kit route is separately exercised by onboarding-drop.check.mjs.
// --set looks=, --set screens= narrow it; --set dwell= defaults to 1800 ms per screen.
export default async function(t) {
  const looks=String(t.args.looks||'glass-dark,glass-light,basic-dark,basic-light,friendly-dark,friendly-light,retro-dark,retro-light,nier-dark,nier-light').split(',');
  const f=await t.app.open({onboarding:true,query:'o55=fresh&o55scenario=fresh'});
  await f.waitForFunction(()=>O55.S?.open);
  const screens=await f.evaluate(()=>Object.keys(O55.pipScenes.SCREENS));
  const selected=t.args.screens?String(t.args.screens).split(','):screens;
  const cases=selected.map(screen=>({screen,label:screen}));
  if(!t.args.screens)cases.push(
    {screen:'where',label:'where-connect',click:'[data-o55-do="pick"][data-arg="connect"]'},
    {screen:'s-kind',label:'server-cloud',click:'[data-o55-do="kind"][data-arg="cloud"]'},
    {screen:'r-source',label:'backup-folder',click:'[data-o55-do="source"][data-arg="folder"]'},
    {screen:'r-source',label:'backup-cloud',click:'[data-o55-do="source"][data-arg="cloud"]'},
    {screen:'like',label:'copy-settings',scenario:'returning',click:'[data-o55-do="pick"]:not([data-arg="fresh"])'},
    {screen:'safe',label:'preview-online',hover:'[data-o55-do="online"]'},
    {screen:'safe',label:'preview-backup',hover:'[data-o55-do="backup"]'},
    {screen:'ready',label:'ready-confetti',effect:'ready'},
    {screen:'r-pick',label:'choice-cheer',effect:'cheer'});
  const inventory=[];
  for(const look of looks) {
    await t.emulate({reducedMotion:t.args.reduced?'reduce':'no-preference'});
    await f.evaluate(l=>O55.ui.applyLook(...l.split('-')),look);await f.waitForTimeout(1500);
    for(const entry of cases) {
      const {screen,label}=entry;
      await t.mark(look+' '+label+' entry');
      await f.evaluate(([id,scenario])=>O55.studio.onboarding.screen(id,scenario),[screen,entry.scenario||'fresh']);
      await f.waitForFunction(id=>O55.S.sess.screen===id,screen);
      if(entry.click)await f.locator('.o55-pane > .o55-layer:not(.o55-out) '+entry.click).first().click();
      if(entry.hover){await f.locator('.o55-pane > .o55-layer:not(.o55-out) '+entry.hover).first().hover();await f.waitForTimeout(450);}
      // Positive effect owner fixtures complement the default Ready fixture, which is intentionally calm without AI.
      if(entry.effect)await f.evaluate(effect=>{const s=document.querySelector('#pm-o55-onboarding .pst').__pipStage;if(effect==='ready')s.ready();else s.cheer('clipboard',{sound:false});},entry.effect);
      const result=await f.evaluate(async duration=>{
        const rows=[],until=performance.now()+duration,ids=new WeakMap();let nextId=0;
        await new Promise(resolve=>{
          const tick=ts=>{
            const s=document.querySelector('#pm-o55-onboarding .pst')?.__pipStage;
            if(s)rows.push({ts,t:s.t,theme:s.theme,render:s.renderN,stage:s.id,live:s.live(),fps:s.frameRate(),pip:{head:s.H,dy:s.ps.dy},props:[...s.props].map(([id,p])=>({id,kind:p.spec.kind,state:p.state,op:p.op,settled:p.settled,len:p.len,target:s.propTarget(p).len,box:p.box,pos:p.pos,rest:p.restBox,ground:!!p.spec.ground,stack:p.spec.stack})),fx:s.fx.map(p=>{if(!ids.has(p))ids.set(p,++nextId);return {id:ids.get(p),kind:p.kind,x:p.x,y:p.y,life:p.life};})});
            if(ts<until)requestAnimationFrame(tick);else resolve();
          };requestAnimationFrame(tick);
        });
        return {screen:O55.S.sess.screen,rows};
      },Number(t.args.dwell||(screen==='creating'?7000:screen==='ready'?6500:1800)));
      writeFileSync(join(t.run.dir,look+'-'+label+'.json'),JSON.stringify(result));
      const groups=new Map();
      for(const r of result.rows)for(const p of r.props){const key=r.stage+':'+p.id;if(!groups.has(key))groups.set(key,[]);groups.get(key).push({...p,ts:r.ts,render:r.render,fps:r.fps});}
      const props=[];
      for(const [id,all]of groups) {
        const visible=all.filter(p=>p.op>.1&&p.state!=='out'&&p.box);
        const a=visible.filter((p,i)=>i===0||p.render!==visible[i-1].render);
        if(a.length<4){props.push({id,kind:all[0]?.kind,covered:false,samples:a.length});continue;}
        const y=p=>(p.box[1]+p.box[3])/2,start=y(a[0]),end=y(a.at(-1)),span=end-start;
        let worst=0,stall=0,maxStall=0;
        for(let i=1;i<a.length;i++){
          const p=a[i-1],q=a[i],dt=q.ts-p.ts,progress=(y(p)-start)/span;
          if(dt<=0||p.render===q.render||progress<.15||progress>.85)continue;
          const dy=y(q)-y(p);worst=Math.max(worst,Math.abs(dy)/Math.abs(span)*1000/dt);
          if(Math.abs(dy)<Math.max(.25,Math.abs(span)*.002))stall+=dt;else stall=0;
          maxStall=Math.max(maxStall,stall);
        }
        props.push({id,kind:a[0].kind,ground:a[0].ground,span,samples:a.length,covered:span>20,worst,maxStall});
      }
      const effects=new Map();
      for(const r of result.rows)for(const p of r.fx){const key=r.stage+':'+p.id;if(!effects.has(key))effects.set(key,[]);effects.get(key).push({...p,ts:r.ts,render:r.render});}
      const bursts=[];
      for(const all of effects.values()){
        const a=all.filter((p,i)=>i===0||p.render!==all[i-1].render);let speed=0;
        for(let i=1;i<a.length;i++){const dt=(a[i].ts-a[i-1].ts)/1000;if(dt>0)speed=Math.max(speed,Math.hypot(a[i].x-a[i-1].x,a[i].y-a[i-1].y)/dt);}
        bursts.push({kind:a[0]?.kind,samples:a.length,maxSpeed:speed});
      }
      const cell={look,screen:result.screen,label,props,effects:bursts};inventory.push(cell);t.log(JSON.stringify(cell));
      await t.equal(look+' '+label+': owner fixture opened',result.screen,screen);
      await t.check(look+' '+label+': requested rig look painted',result.rows.length>10&&result.rows.every(r=>r.theme===look),JSON.stringify([...new Set(result.rows.map(r=>r.theme))]));
      const bad=props.filter(p=>p.covered&&(p.worst>15||p.maxStall>Math.max(60,300/(look==='retro-light'?10:look==='retro-dark'?20:120))));
      await t.check(look+' '+label+': falls have continuous middle progress',bad.length===0,JSON.stringify(bad));
      await t.check(look+' '+label+': particles have no position jumps',bursts.every(p=>p.maxSpeed<1600),JSON.stringify(bursts.filter(p=>p.maxSpeed>=1600)));
      if(entry.effect==='ready'&&!t.args.reduced)await t.check(look+': confetti owner exercised',bursts.filter(p=>p.kind==='conf').length===60,String(bursts.length));
      // A fresh Creating fixture starts real owner work. The next Studio open respects that running commit.
      if(screen==='creating') await f.waitForFunction(()=>O55.S.sess.commit?.state!=='running',null,{timeout:30000});
    }
  }
  writeFileSync(join(t.run.dir,'fall-inventory.json'),JSON.stringify(inventory,null,2));
  await t.check('every requested scene was exercised',inventory.length===looks.length*cases.length,String(inventory.length));
}
