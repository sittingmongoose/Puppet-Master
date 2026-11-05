// A paired clock/native-film route, only when the paint clock disagrees with
// retained frames. It does not change animation, wait for idle or alter the budget.
import {pathToFileURL} from 'node:url';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {installActivityPaintProbe} from '../helpers/activity-paint.mjs';
const cpu=()=>readFileSync('/proc/stat','utf8').split('\n')[0].trim().split(/\s+/).slice(1).map(Number);
export default async function(t){
 if(!t.args.elementTimingCalibration||!t.args.controlPage){t.log("Element Timing diagnostic is opt-in: --set elementTimingCalibration=1 --set controlPage=<annotated build>");return;}
 await t.emulate({reducedMotion:'no-preference'});
 await t.page.context().addInitScript(installActivityPaintProbe);
 const url=p=>/^https?:/.test(p)?p:pathToFileURL(p).href;
 const [f]=await t.openSideBySide([{url:url(t.args.page)+'?o55=off',width:1024,height:480}],{height:480,settleMs:0});
 const host=await f.frameElement();
 for(const surface of [0,1])for(const [build,path] of [['control',t.args.controlPage],['fix',t.args.page]])for(let i=0;i<Number(t.args.reps||2);i++){
  const label=`${build}-${surface?'opaque':'normal'}-${i}`;
  const before=cpu();
  await host.evaluate((el,s)=>{if(s)el.setAttribute('sandbox','allow-scripts allow-forms allow-popups allow-downloads');else el.removeAttribute('sandbox');},surface);
  await f.goto(url(path)+'?o55=off&paintcase='+label,{timeout:30000});
  await f.waitForFunction(()=>window.__PM56_BOOT_OK&&window.PM56_PORT?.ready);
  await f.locator('#o55np-reboot').waitFor({state:'detached',timeout:15000});
  const button=f.locator('#pmRoot [data-action="open-activity"]').first();
  await button.waitFor({state:'visible'});
  const after=cpu(),delta=after.map((n,j)=>n-before[j]);
  const resources={browsers:JSON.parse(execFileSync('agent-browser',['list'],{encoding:'utf8',timeout:10000})).length,
   load:readFileSync('/proc/loadavg','utf8').trim(),
   availableKB:Number(readFileSync('/proc/meminfo','utf8').match(/^MemAvailable:\s+(\d+)/m)[1]),
   cpuBusyPercent:100*(1-(delta[3]+delta[4])/delta.reduce((a,b)=>a+b,0))};
  const box=await button.boundingBox();
  const state=await f.evaluate(()=>({width:innerWidth,height:innerHeight,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches}));
  t.log(label+' resources '+JSON.stringify(resources));
  await t.check(label+' viewport and full motion',state.width===1024&&state.height===480&&!state.reduced);
  await t.page.mouse.move(box.x+box.width/2,box.y+box.height/2);
  await t.mark(label+' input');
  await t.page.mouse.click(box.x+box.width/2,box.y+box.height/2);
  await t.page.waitForTimeout(1200);
  const timing=await f.evaluate(()=>({input:window.__activityPaintInput,paint:window.__activityPaintResult,entries:window.__activityPaintEntries,
   cover:!!document.querySelector('#pmRoot .activity-panel.cover')}));
  t.log(label+' paint '+JSON.stringify(timing));
  await t.check(label+' first paint within 500 ms',timing.paint&&!timing.paint.error&&timing.paint.elapsed>=0&&timing.paint.elapsed<=500);
  await t.mark(label+' observed');
 }
}
