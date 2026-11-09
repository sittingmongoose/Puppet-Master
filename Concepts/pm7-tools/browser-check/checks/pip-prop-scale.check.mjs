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
  await input.click();
  if(t.args.typing) await f.waitForTimeout(4500);
  else { await input.fill('Book club website'); await t.page.mouse.move(4,4); await f.waitForTimeout(3500); }
  t.mark(`${mode} ${look} ${size.join('x')} resting art scale`);
  const reading = f.evaluate(() => new Promise(resolve => {
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
     const bbl=st.bubble, br=bbl.getBoundingClientRect(), hr=st.gHead.getBoundingClientRect(), side=bbl.dataset.side;
     const arrow=st.famName!=='nier'&&bbl.classList.contains('on')&&+getComputedStyle(bbl).opacity>.5;
     const tail=getComputedStyle(bbl,'::after'), polygon=/^polygon\((.*)\)$/.exec(tail.clipPath);
     const pts=polygon?polygon[1].split(',').map(v=>v.trim().split(/\s+/).map(parseFloat)):[],ys=pts.map(p=>p[1]),xs=pts.map(p=>p[0]);
     const direction=ys.length===3&&ys[0]===ys[1]?Math.sign(ys[2]-ys[0]):0;
     const horizontal=xs.length===3&&xs[0]===xs[1]?Math.sign(xs[2]-xs[0]):0;
     const distance=(v,n=bbl.clientHeight)=>v.endsWith('%')?parseFloat(v)*n/100:parseFloat(v);
     const painted=tail.content!=='none'&&tail.display!=='none'&&parseFloat(tail.width)>0&&parseFloat(tail.height)>0;
     const cx=(hr.left+hr.right)/2,cy=(hr.top+hr.bottom)/2;
     const toward=(direction===-1&&cy<br.top+2&&distance(tail.bottom)>=bbl.clientHeight-2)||(direction===1&&cy>br.bottom-2&&distance(tail.top)>=bbl.clientHeight-2)||(horizontal===-1&&cx<br.left+2&&distance(tail.right,bbl.clientWidth)>=bbl.clientWidth-2)||(horizontal===1&&cx>br.right-2&&distance(tail.left,bbl.clientWidth)>=bbl.clientWidth-2);
     const away=arrow&&(!painted||!toward);
     rows.push({theme:st.theme,id,kind:p.spec.kind,scale,nominal,ratio:scale/nominal,rounding:.005/nominal+1e-6,
      box:[r.left,r.top,r.width,r.height],restBox:p.restBox,head:st.pipHead(0,null,true),captionFontPixels:font,
      arrow,tailAway:away,tailSide:side,tailPaint:{direction,horizontal,top:tail.top,bottom:tail.bottom,clip:tail.clipPath},bubbleBox:[br.left,br.top,br.right,br.bottom],headBox:[hr.left,hr.top,hr.right,hr.bottom]});
    }
    if(performance.now()-start<2000) requestAnimationFrame(read); else resolve(rows);
   }
   requestAnimationFrame(read);
  }));
  if(t.args.typing) { await t.page.keyboard.press('Control+A'); await t.page.keyboard.type('Book club',{delay:25}); await t.page.mouse.move(4,4); }
  const rows=await reading;
  const tag=`${mode} ${look} ${size.join('x')}`, signs=rows.filter(r=>r.kind==='sign');
  await t.check(`${tag}: positive resting sign coverage`, signs.length>=30, `${signs.length} resting sign samples`);
  const bad=rows.filter(r=>r.ratio+r.rounding<.66);
  await t.check(`${tag}: painted resting art keeps at least .66 of its pane-fitted nominal scale`, rows.length>0&&!bad.length,
   `${bad.length}/${rows.length} undersized; ${JSON.stringify((bad[0]||signs[0]||{}))}`);
  const arrows=rows.filter(r=>r.arrow), away=arrows.filter(r=>r.tailAway);
  await t.check(`${tag}: the speech tail faces Pip`, !away.length&&(look.startsWith('nier-')||arrows.length>=30),
   `${away.length}/${arrows.length} tails face away; ${JSON.stringify(away[0]||arrows[0]||{})}`);
  cells.push({mode,look,size,rows});fs.writeFileSync(path.join(t.run.dir,'prop-scale.json'),JSON.stringify(cells));
  await t.app.resetLayout(t);
 }
}
