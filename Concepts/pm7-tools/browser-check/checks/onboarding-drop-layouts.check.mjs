import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { beginDropCapture, analyzeDrop } from './onboarding-drop.check.mjs';

// QA-7 layout and Reduced Motion matrix. Owner fixtures put the real Recovery Kit controls on screen;
// source, kit and Continue are real clicks. The full from-Welcome route is in onboarding-drop.
export default async function(t) {
  const looks=String(t.args.looks||'glass-dark,glass-light,basic-dark,basic-light,friendly-dark,friendly-light,retro-dark,retro-light,nier-dark,nier-light').split(',');
  const sizes=String(t.args.sizes||'860x900,1024x768,1280x900,1390x900,1920x1080,740x900,1280x500').split(',').map(v=>v.split('x').map(Number));
  const all=[];
  for(const [width,height]of sizes) {
    await t.viewport(width,height);
    const f=await t.app.open({onboarding:true,query:'o55=fresh&o55scenario=fresh'});await f.waitForFunction(()=>O55.S?.open);
    for(const look of looks) {
      const label=look+'-'+width+'x'+height;
      await t.emulate({reducedMotion:t.args.reduced?'reduce':'no-preference'});
      await f.evaluate(l=>O55.ui.applyLook(...l.split('-')),look);await f.waitForTimeout(1500);
      // Leave the prior clipboard first; reusing its identity on the next r-pick would only test its resting pose.
      await f.evaluate(()=>O55.studio.onboarding.screen('where','fresh'));await f.waitForTimeout(900);
      await f.evaluate(()=>O55.studio.onboarding.screen('r-source','fresh'));await f.waitForTimeout(900);
      const layer=f.locator('.o55-pane > .o55-layer:not(.o55-out)');
      await layer.locator('[data-o55-do="source"][data-arg="kit"]').click();
      await layer.locator('[data-o55-do="kit"][data-arg="kit-loom"]').click();
      await f.waitForTimeout(500);await beginDropCapture(f);
      await layer.locator('.o55-foot .o55-primary').click();await f.waitForTimeout(3700);
      const rows=await f.evaluate(()=>window.__dropFrames);writeFileSync(join(t.run.dir,label+'.json'),JSON.stringify(rows));
      const result=analyzeDrop(rows);all.push({look,width,height,...result});t.log(JSON.stringify(all.at(-1)));
      await t.check(label+': backup list reached',rows.some(r=>r.screen==='r-pick'));
      const shown=rows.filter(r=>r.screen==='r-pick'&&r.stage);
      await t.check(label+': requested look actually painted',shown.length>10&&shown.every(r=>r.stage.theme===look),JSON.stringify([...new Set(shown.map(r=>r.stage.theme))]));
      if(t.args.reduced) {
        const props=rows.flatMap(r=>r.stage?.props.filter(p=>p.kind==='clipboard'&&p.state!=='out'&&p.op>.95)||[]);
        await t.check(label+': Reduced Motion places the prop immediately',props.length>10&&props.every(p=>Math.abs(p.len-p.target.len)<.01),String(props.length));
      } else {
        await t.check(label+': visible descent covered',result.covered,JSON.stringify(result));
        await t.check(label+': no midpoint stall or jump',result.covered&&result.maxSpeed<15&&result.maxStall<60,JSON.stringify(result));
      }
    }
  }
  writeFileSync(join(t.run.dir,'layout-summary.json'),JSON.stringify(all,null,2));
}
