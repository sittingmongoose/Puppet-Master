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
  const inventory=[];
  for(const look of looks) {
    await t.emulate({reducedMotion:t.args.reduced?'reduce':'no-preference'});
    await f.evaluate(l=>O55.ui.applyLook(...l.split('-')),look);await f.waitForTimeout(1500);
    for(const screen of selected) {
      await t.mark(look+' '+screen+' entry');
      await f.evaluate(id=>O55.studio.onboarding.screen(id,'fresh'),screen);
      await f.waitForFunction(id=>O55.S.sess.screen===id,screen);
      const result=await f.evaluate(async duration=>{
        const rows=[],until=performance.now()+duration;
        await new Promise(resolve=>{
          const tick=ts=>{
            const s=document.querySelector('#pm-o55-onboarding .pst')?.__pipStage;
            if(s)rows.push({ts,t:s.t,render:s.renderN,stage:s.id,live:s.live(),fps:s.frameRate(),props:[...s.props].map(([id,p])=>({id,kind:p.spec.kind,state:p.state,op:p.op,settled:p.settled,len:p.len,target:s.propTarget(p).len,box:p.box,pos:p.pos,rest:p.restBox,ground:!!p.spec.ground,stack:p.spec.stack})),fx:s.fx.map(p=>({kind:p.kind,x:p.x,y:p.y,life:p.life}))});
            if(ts<until)requestAnimationFrame(tick);else resolve();
          };requestAnimationFrame(tick);
        });
        return {screen:O55.S.sess.screen,rows};
      },Number(t.args.dwell||1800));
      writeFileSync(join(t.run.dir,look+'-'+screen+'.json'),JSON.stringify(result));
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
      const cell={look,screen:result.screen,props};inventory.push(cell);t.log(JSON.stringify(cell));
      await t.equal(look+' '+screen+': owner fixture opened',result.screen,screen);
      const bad=props.filter(p=>p.covered&&(p.worst>15||p.maxStall>Math.max(60,300/(look==='retro-light'?10:look==='retro-dark'?20:120))));
      await t.check(look+' '+screen+': falls have continuous middle progress',bad.length===0,JSON.stringify(bad));
      // A fresh Creating fixture starts real owner work. The next Studio open respects that running commit.
      if(screen==='creating') await f.waitForFunction(()=>O55.S.sess.commit?.state!=='running',null,{timeout:30000});
    }
  }
  writeFileSync(join(t.run.dir,'fall-inventory.json'),JSON.stringify(inventory,null,2));
  await t.check('every requested scene was exercised',inventory.length===looks.length*selected.length,String(inventory.length));
}
