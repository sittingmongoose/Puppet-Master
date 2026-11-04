// FO-49: real pointer clicks outside the rest bounds may never activate a choice,
// including an already-selected choice. Observe native click targets as well as state.
import { LOOKS } from '../browser-check.config.mjs';
const L = '.o55-pane > .o55-layer:not(.o55-out) ';
export default async function(t) {
 const f = await t.app.open({onboarding:true, query:'o55=fresh'});
 await f.waitForFunction(() => window.O55?.S?.open && O55.S.sess);
 const fe = f === t.page.mainFrame() ? null : await f.frameElement();
 const off = fe ? await fe.boundingBox() : {x:0,y:0};
 await f.evaluate(() => {
  window.__choiceClicks=[];
  document.addEventListener('click', e => { const c=e.target.closest('.o55-card,.o55-tile'); if(c) window.__choiceClicks.push(c.dataset.arg); }, true);
 });
 const looks = t.args.look ? [t.args.look] : LOOKS;
 if(t.args.width) await t.viewport(Number(t.args.width),Number(t.args.height||1080));
 for (const motion of (t.args.motion?[t.args.motion]:['no-preference','reduce'])) {
  await t.emulate({reducedMotion:motion});
  for (const look of looks) {
   await f.evaluate(([fam,mode]) => O55.ui.applyLook(fam,mode),look.split('-'));
   await f.waitForTimeout(1600);
   for (const screen of (t.args.screen?[t.args.screen]:['where','look','nas-find'])) {
    await t.page.mouse.move(2,2);
    await f.evaluate(s => O55.ui.go(s,{noHistory:true}),screen);
    await f.waitForTimeout(1800);
    const sel=L+(screen==='look'?'.o55-tile':'.o55-card');
    const count=await f.locator(sel).count();
    const bad=[];
    for(let i=0;i<count;i++) {
     const c=f.locator(sel).nth(i);
     await c.scrollIntoViewIfNeeded(); await t.page.mouse.move(2,2); await f.waitForTimeout(250);
     let b=await c.boundingBox(); if(!b) continue;
     for(const hovered of [false,true]) {
      points: for(const d of [1,2,3]) for(const edge of ['bottom','top','left','right']) {
       await t.page.mouse.move(2,2); await f.waitForTimeout(220);
       // Focus/scroll and the stage may have changed the pane since the preceding click.
       // Capture this trial's rest box after leaving hover, then keep it for the entire trial.
       b=await c.boundingBox();
       const x=edge==='left'?b.x-d:edge==='right'?b.x+b.width+d:b.x+b.width/2;
       const y=edge==='top'?b.y-d:edge==='bottom'?b.y+b.height+d:b.y+b.height/2;
       if(hovered) { await t.page.mouse.move(b.x+b.width/2,b.y+b.height/2); await f.waitForTimeout(220); }
       // Bounding boxes already include the frame offset. Hit observations are in frame coordinates.
       const hit=await f.evaluate(([x,y])=>document.elementFromPoint(x,y)?.closest('.o55-card,.o55-tile')?.dataset.arg||null,[x-off.x,y-off.y]);
       // A different real neighbouring choice is allowed only if its own rest box contains the point.
       const neighbour=await f.evaluate(([x,y])=>{const e=document.elementFromPoint(x,y)?.closest('.o55-card,.o55-tile');if(!e)return false;const r=e.getBoundingClientRect();return x>=r.left&&x<r.right&&y>=r.top&&y<r.bottom;},[x-off.x,y-off.y]);
       if(neighbour && hit !== await c.getAttribute('data-arg')) continue;
       if(hit===await c.getAttribute('data-arg')) t.log(JSON.stringify({pre:true,edge,d,hovered,rest:b,now:await c.boundingBox(),css:await c.evaluate(e=>{const p=getComputedStyle(e,'::before'),a=getComputedStyle(e);return {transform:a.transform,pseudo:[p.width,p.height,p.borderWidth,p.transform],hover:e.matches(':hover')};})}));
       await f.evaluate(()=>window.__choiceClicks=[]);
       await t.page.mouse.click(x,y);
       const clicked=await f.evaluate(()=>window.__choiceClicks);
       if(clicked.length) {t.log(JSON.stringify({rest:b, now:await c.boundingBox(), css:await c.evaluate(e=>{const a=getComputedStyle(e),p=getComputedStyle(e,'::before');return {transform:a.transform,border:a.borderWidth,width:a.width,height:a.height,box:a.boxSizing,pseudo:[p.width,p.height,p.borderWidth,p.boxSizing,p.transform,p.transition,p.padding,p.margin]};})}));bad.push(`${i} ${edge}+${d}, hover=${hovered}: clicked ${clicked}`);break points;}
      }
      if(bad.length) break;
     }
     if(bad.length) break;
    }
    await t.check(`FO-49 outside bounds ${look} ${motion} ${screen}`,count>0&&!bad.length,`${count} choices; ${bad.join('; ')}`);
    // Positive controls: a disabled surface must not make all outside trials pass.
    const inside=f.locator(sel+'.o55-on').first();
    const control=await inside.count()?inside:f.locator(sel).first();
    await control.scrollIntoViewIfNeeded(); await t.page.mouse.move(2,2); await f.waitForTimeout(450);
    const rb=await control.boundingBox(); await f.evaluate(()=>window.__choiceClicks=[]);
    await t.page.mouse.click(rb.x+rb.width/2,rb.y+rb.height/2);
    await t.check(`FO-49 inside click ${look} ${motion} ${screen}`,(await f.evaluate(()=>window.__choiceClicks.length))===1);
    await control.focus();
    const focus=await control.evaluate(e=>({focused:document.activeElement===e,outline:getComputedStyle(e).outlineStyle}));
    await t.check(`FO-49 native focus ${look} ${motion} ${screen}`,focus.focused,JSON.stringify(focus));

   }
  }
 }
 await t.emulate({reducedMotion:'no-preference'});
}
