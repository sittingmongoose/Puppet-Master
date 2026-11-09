// A head-clearance repair must preserve the art: V8's whole-column reservation made
// Retro Dark's 860px Name sign about58x37px instead of137x87px. The lead's floor is
// .66 of the prop's assigned scale, after the unavoidable fit to the pane's width.
// Read the painted SVG matrix independently; a product fit.f/g flag cannot pass it.
import fs from 'node:fs';
import path from 'node:path';

const LOOKS = ['basic', 'friendly', 'retro', 'glass', 'nier'].flatMap(f => [`${f}-light`, `${f}-dark`]);
export default async function (t) {
 const looks = String(t.args.looks || LOOKS.join(',')).split(',');
 const size = String(t.args.size || '860x768').split('x').map(Number), cells = [];
 for (const mode of t.app.surfaces()) for (const look of looks) {
  if (t.recording) { await t.viewport(); await t.goto('about:blank'); }
  await t.viewport(...size);
  const f = await t.app.open({onboarding:true,query:'o55=screen=name',sandbox:mode==='sandbox'});
  await t.emulate({reducedMotion:'no-preference'});
  await f.waitForFunction(() => !!document.querySelector('#pm-o55-onboarding .o55-stage')?.__pipStage?.gHead, null, {timeout:15000});
  await f.evaluate(([family,mode])=>O55.ui.applyLook(family,mode),look.split('-'));
  const applied=await f.waitForFunction(l=>document.querySelector('#pm-o55-onboarding .o55-stage')?.__pipStage?.theme===l&&!O55.S.vt&&!document.documentElement.hasAttribute('data-o55-vt')&&!(O55.nierLook?.busy?.()),look,{timeout:30000}).then(()=>true,()=>false);
  await t.check(`${mode} ${look}: onboarding look applied`,applied,'stage theme or look cover did not settle',{hard:true});
  const input = f.locator('#pm-o55-onboarding .o55-layer:not(.o55-out) [data-o55-bind="name"]').first();
  await input.click(); await input.fill('Book club website');
  await t.page.mouse.move(4,4);
  await f.waitForTimeout(3500);
  t.mark(`${mode} ${look} ${size.join('x')} resting art scale`);
  const rows = await f.evaluate(() => new Promise(resolve => {
   const rows=[], start=performance.now();
   function read() {
    const st=document.querySelector('#pm-o55-onboarding .o55-stage')?.__pipStage;
    if(st) for(const [id,p] of st.props) {
     if(p.state==='out'||!p.settled||p.op<.95||p.spec.ground) continue;
     const tg=st.propTarget(p);
     if(Math.max(Math.abs(p.ax-tg.ax),Math.abs(p.len-tg.len))>2.51) continue;
     const b=p.el.getBBox(), m=p.el.parentNode.getCTM().inverse().multiply(p.el.getCTM());
     const scale=Math.hypot(m.a,m.b), nominal=Math.min(tg.sc,(st.vis.x1-st.vis.x0-16)/b.width);
     const r=p.el.getBoundingClientRect(), text=p.el.querySelector('text');
     const font=text ? parseFloat(getComputedStyle(text).fontSize)*Math.hypot(text.getScreenCTM().a,text.getScreenCTM().b) : null;
     rows.push({theme:st.theme,id,kind:p.spec.kind,scale,nominal,ratio:scale/nominal,rounding:.005/nominal+1e-6,
      box:[r.left,r.top,r.width,r.height],restBox:p.restBox,head:st.pipHead(0,null,true),captionFontPixels:font});
    }
    if(performance.now()-start<2000) requestAnimationFrame(read); else resolve(rows);
   }
   requestAnimationFrame(read);
  }));
  const tag=`${mode} ${look} ${size.join('x')}`, signs=rows.filter(r=>r.kind==='sign');
  await t.check(`${tag}: positive resting sign coverage`, signs.length>=30, `${signs.length} resting sign samples`);
  const bad=rows.filter(r=>r.ratio+r.rounding<.66);
  await t.check(`${tag}: painted resting art keeps at least .66 of its pane-fitted nominal scale`, rows.length>0&&!bad.length,
   `${bad.length}/${rows.length} undersized; ${JSON.stringify((bad[0]||signs[0]||{}))}`);
  cells.push({mode,look,size,rows});fs.writeFileSync(path.join(t.run.dir,'prop-scale.json'),JSON.stringify(cells));
  await t.app.resetLayout(t);
 }
}
