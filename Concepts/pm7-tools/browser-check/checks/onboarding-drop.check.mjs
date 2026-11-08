import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { onboardingApp } from '../helpers/onboarding-fields.mjs';

const percentile = (xs, q) => [...xs].sort((a,b)=>a-b)[Math.min(xs.length-1,Math.floor(xs.length*q))] || 0;
function motion(rows, kind = 'clipboard') {
  const samples = rows.flatMap(r => {
    const p = r.stage?.props.find(p=>p.kind===kind && p.state!=='out');
    return p && p.op > .1 ? [{ ...p, ts:r.ts, dt:r.dt, render:r.stage.render, y:p.rect.y+p.rect.height/2, k:r.stage.map.k }] : [];
  });
  if (samples.length < 12) return { covered:false, samples:samples.length };
  const first=samples[0], end=percentile(samples.slice(-12).map(p=>p.y),.5), span=end-first.y;
  const moving=samples.filter(p=>(p.y-first.y)/span>.15 && (p.y-first.y)/span<.85);
  let maxSpeed=0, maxJump=0, stall=0, maxStall=0;
  for (let i=1;i<samples.length;i++) {
    const a=samples[i-1],b=samples[i],dt=b.ts-a.ts,dy=b.y-a.y,progress=(a.y-first.y)/span;
    if (dt<=0 || progress<.15 || progress>.85 || a.render===b.render) continue;
    maxSpeed=Math.max(maxSpeed,Math.abs(dy)/Math.abs(span)*1000/dt);
    maxJump=Math.max(maxJump,Math.abs(dy));
    if (Math.abs(dy)<Math.max(.3,Math.abs(span)*.002)) stall+=dt; else stall=0;
    maxStall=Math.max(maxStall,stall);
  }
  const surround=samples.filter(p=>!moving.includes(p));
  return { covered:span>40 && moving.length>=4, samples:samples.length, span, maxSpeed, maxJump, maxStall,
    middleFrameP95:percentile(moving.map(p=>p.dt),.95), surroundFrameP95:percentile(surround.map(p=>p.dt),.95), maxFrame:Math.max(...samples.map(p=>p.dt)) };
}

// QA-7: real Recovery Kit route, with per-frame physics and painted transform witnesses.
// --set looks=glass-dark --set trace=1 narrows the diagnostic film. Default: all ten looks.
export default async function(t) {
  const A = onboardingApp(t), looks = String(t.args.looks || 'glass-dark,glass-light,basic-dark,basic-light,friendly-dark,friendly-light,retro-dark,retro-light,nier-dark,nier-light').split(',');
  const out = [];
  for (const look of looks) {
    await t.emulate({ reducedMotion: 'no-preference' });
    await A.boot({ look: look.split('-') });
    await A.click('pick', 'this'); await A.click('next', undefined, 'begin');
    await A.click('pick', 'restore'); await A.click('next', undefined, 'r-source');
    await A.click('source', 'kit'); await A.click('kit', 'kit-loom'); await A.sleep(1200);
    const f = A.frame(), cdp = await t.page.context().newCDPSession(t.page);
    if (t.args.trace) await cdp.send('Tracing.start', { categories: 'devtools.timeline,v8.execute,blink.user_timing,cc,gpu,disabled-by-default-devtools.timeline.stack', transferMode: 'ReturnAsStream' });
    await f.evaluate(() => {
      const rows = window.__dropFrames = [], t0 = performance.now();
      const tick = ts => {
        const host = document.querySelector('#pm-o55-onboarding .pst'), s = host?.__pipStage;
        rows.push({ ts, wall: performance.timeOrigin + ts, dt: rows.length ? ts - rows.at(-1).ts : 0, screen: O55.S.sess.screen,
          stage: s ? { t: s.t, render: s.renderN, box: s.box, map: s.map, keepOff: s.keepOff, pipKeep: s.pipKeep,
            props: [...s.props].map(([id,p]) => ({ id, kind:p.spec.kind, state:p.state, len:p.len, lenv:p.lenv, op:p.op, a:p.a, box:p.box, pos:p.pos, off:p.restOff, target:s.propTarget(p), transform:p.el.getAttribute('transform'), rect:(()=>{const r=p.el.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};})() })) } : null });
        if (ts - t0 < 3500) requestAnimationFrame(tick);
      }; requestAnimationFrame(tick);
      performance.mark('qa7-drop-before');
    });
    await t.mark(look + ' recovery kit Continue');
    await f.locator('.o55-layer:not(.o55-out) .o55-foot .o55-primary').click();
    await A.sleep(3700);
    const rows = await f.evaluate(() => window.__dropFrames);
    const file = join(t.run.dir, look + '-progress.json'); writeFileSync(file, JSON.stringify(rows));
    const result=motion(rows);
    out.push({ look, frames:rows.length, screens:[...new Set(rows.map(x=>x.screen))], ...result });
    t.log(JSON.stringify(out.at(-1)));
    await t.check(look + ': Continue reaches backup list', rows.some(x=>x.screen === 'r-pick'), JSON.stringify(out.at(-1)));
    await t.check(look + ': measured visible middle of clipboard descent', result.covered, JSON.stringify(result));
    await t.check(look + ': no midpoint jump or stall', result.covered && result.maxSpeed<15 && result.maxStall<60, JSON.stringify(result));
    await t.check(look + ': middle has no frame-time spike over surrounding animation', result.covered && result.middleFrameP95<=Math.max(33.5,result.surroundFrameP95*1.75),JSON.stringify(result));
    if (t.args.trace) {
      const done = new Promise(r=>cdp.once('Tracing.tracingComplete',r)); await cdp.send('Tracing.end'); const { stream } = await done;
      let data=''; for (;;) { const ch=await cdp.send('IO.read',{handle:stream}); data+=ch.data; if(ch.eof)break; }
      await cdp.send('IO.close',{handle:stream}); writeFileSync(join(t.run.dir,look+'-trace.json'),data);
    }
    await cdp.detach();
  }
  writeFileSync(join(t.run.dir,'drop-summary.json'),JSON.stringify(out,null,2));
}
