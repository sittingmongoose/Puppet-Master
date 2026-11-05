// SW-44: interleaved old/new budget diagnostics on identical product bytes (kit-only change).
// rAF timing only; no claim about painted motion. A=startup idle floor, B=local idle floor.
import fs from 'node:fs';
const py = fs.readFileSync(new URL('../../../onboarding/opus-5.5/tools/perf/resize_perf.py',import.meta.url),'utf8');
const sampler=py.match(/SAMPLER = r"""([\s\S]*?)"""/)[1];
const target=Function('return '+py.match(/TARGET = r"""([\s\S]*?)"""/)[1].trim())();
if(typeof target!=='function')throw Error('Resize target extraction did not yield a function');
const q=a=>a.sort((x,y)=>x-y)[Math.min(a.length-1,Math.floor(a.length*.95))]||0;
const gaps=a=>a.slice(1).map((x,i)=>x[0]-a[i][0]);
export default async function(t){
  await t.viewport(1920,1080); const rows=[]; let startup;
  for(const [surface,dx,dy] of [['left',200,0],['chat',150,0],['home',200,0],['homecol',0,140]]) {
  for(const [i,kind] of ['A','B','B','A'].entries()){
    const f=await t.app.open(); await t.app.resetLayout(); await f.locator('#tab-dashboard').click(); await t.app.look('friendly-dark');
    await f.evaluate(sampler);
    if(!await f.locator('#leftPanelResizer').isVisible())await f.locator('#activityBar .icon[data-target="panel-files"]').click();
    await f.locator('#leftPanelResizer').waitFor({state:'visible'});
    const p=await f.evaluate(target,surface);
    if(!p)throw Error(surface+' divider not reachable');
    await f.waitForTimeout(2500);
    if(startup===undefined){const raw=await f.evaluate(()=>window.__rz.stop());startup=q(gaps(raw.frames));await f.evaluate(target,surface);await f.waitForTimeout(2500);}
    if(kind==='A'){await f.evaluate(()=>window.__rz.stop());await f.evaluate(target,surface);}
    await t.page.mouse.move(p.x,p.y);await t.page.mouse.down();
    try {
      await f.waitForTimeout(250);
      for (const [start,end] of [[0,1],[1,0]]) {
        const began=Date.now();
        while (true) {
          const progress=Math.min(1,(Date.now()-began)/1500), k=start+(end-start)*progress;
          await t.page.mouse.move(p.x+dx*k,p.y+dy*k);
          if(progress===1) break;
          await f.waitForTimeout(8);
        }
        await f.waitForTimeout(end===1?250:400);
      }
    }
    finally{await t.page.mouse.up();}
    await f.waitForTimeout(kind==='A'?700:2000);
    const raw=await f.evaluate(()=>window.__rz.stop());
    await t.check(surface+' '+kind+i+' one sample per frame',new Set(raw.frames.map(x=>x[0])).size===raw.frames.length,'',{hard:true});
    const down=raw.marks.find(x=>x[0]==='down')?.[1],up=raw.marks.find(x=>x[0]==='up')?.[1];
    const drag=raw.frames.filter(x=>x[0]>=down&&x[0]<=up);
    const idle=[...gaps(raw.frames.filter(x=>x[0]<down-50)),...gaps(raw.frames.filter(x=>x[0]>up+800))];
    const floor=kind==='A'?startup:q(idle),gap=q(gaps(kind==='A'?raw.frames:drag)),budget=Math.max(50,floor*2+34);
    const edges=drag.map(x=>x[2]).filter(x=>x!==null), range=Math.max(...edges)-Math.min(...edges);
    const row={range,surface,i,kind,startup,floor,gap,budget,pass:gap<=budget,frames:drag.length,idle:idle.length,moves:raw.moves.length};rows.push(row);t.log(JSON.stringify(row));
    await t.check(surface+' '+kind+i+' measurement valid',drag.length>=8&&(kind==='A'||idle.length>=30)&&raw.moves.length>=30&&range>=50,JSON.stringify(row));
  }
  await t.check(surface+' interleaved budget verdicts agree',new Set(rows.filter(x=>x.surface===surface).map(x=>x.pass)).size===1,JSON.stringify(rows.filter(x=>x.surface===surface)));
  }
  if(t.args.metrics)fs.writeFileSync(String(t.args.metrics),JSON.stringify(rows,null,2));
  await t.check('all four gestures measured',rows.length===16,JSON.stringify(rows));
}
