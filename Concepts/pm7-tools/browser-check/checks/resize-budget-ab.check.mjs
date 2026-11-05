// SW-44: interleaved old/new budget diagnostics on identical product bytes (kit-only change).
// rAF timing only; no claim about painted motion. A=startup idle floor, B=local idle floor.
import fs from 'node:fs';
const py = fs.readFileSync(new URL('../../../onboarding/opus-5.5/tools/perf/resize_perf.py',import.meta.url),'utf8');
const sampler=py.match(/SAMPLER = r"""([\s\S]*?)"""/)[1];
const target=Function('return '+py.match(/TARGET = r"""([\s\S]*?)"""/)[1])();
const q=a=>a.sort((x,y)=>x-y)[Math.min(a.length-1,Math.floor(a.length*.95))]||0;
const gaps=a=>a.slice(1).map((x,i)=>x[0]-a[i][0]);
export default async function(t){
  await t.viewport(1920,1080); const rows=[]; let startup;
  for(const [i,kind] of ['A','B','B','A'].entries()){
    const f=await t.app.open(); await t.app.look('friendly-dark');
    await f.evaluate(sampler); const p=await f.evaluate(target,'home');
    if(!p)throw Error('Home divider not reachable');
    await f.waitForTimeout(2500);
    if(startup===undefined){const raw=await f.evaluate(()=>window.__rz.stop());startup=q(gaps(raw.frames));await f.evaluate(target,'home');await f.waitForTimeout(2500);}
    if(kind==='A')await f.evaluate(target,'home');
    await t.page.mouse.move(p.x,p.y);await t.page.mouse.down();
    try{for(const end of [200,0]){const start=end===200?0:200;for(let n=1;n<=60;n++){await t.page.mouse.move(p.x+start+(end-start)*n/60,p.y);await f.waitForTimeout(25);}}}
    finally{await t.page.mouse.up();}
    await f.waitForTimeout(kind==='A'?700:2000);
    const raw=await f.evaluate(()=>window.__rz.stop());
    const down=raw.marks.find(x=>x[0]==='down')?.[1],up=raw.marks.find(x=>x[0]==='up')?.[1];
    const drag=raw.frames.filter(x=>x[0]>=down&&x[0]<=up);
    const idle=[...gaps(raw.frames.filter(x=>x[0]<down-50)),...gaps(raw.frames.filter(x=>x[0]>up+800))];
    const floor=kind==='A'?startup:q(idle),gap=q(gaps(kind==='A'?raw.frames:drag)),budget=Math.max(50,floor*2+34);
    const row={i,kind,startup,floor,gap,budget,pass:gap<=budget,frames:drag.length,idle:idle.length,moves:raw.moves.length};rows.push(row);t.log(JSON.stringify(row));
    await t.check(kind+i+' measurement valid',drag.length>=8&&(kind==='A'||idle.length>=30)&&raw.moves.length>=100,JSON.stringify(row));
  }
  if(t.args.metrics)fs.writeFileSync(String(t.args.metrics),JSON.stringify(rows,null,2));
  await t.check('interleaved budget verdicts agree',new Set(rows.map(x=>x.pass)).size===1,JSON.stringify(rows));
}
