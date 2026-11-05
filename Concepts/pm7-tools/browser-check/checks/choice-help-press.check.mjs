// FO-49: the in-tile question mark cannot steal the painted bottom-right corner.
export default async function(t) {
 for(const [width,height] of [[740,1000],[1280,500]]) {
  await t.viewport(width,height);
  const f=await t.app.open({onboarding:true,query:'o55=fresh'});
  await f.waitForFunction(()=>window.O55?.S?.open);
  await t.emulate({reducedMotion:'no-preference'});
  await f.evaluate(()=>O55.ui.applyLook('glass','light'));await f.waitForTimeout(1600);
  await f.evaluate(()=>{O55.ui.go('look',{noHistory:true});window.__tileHelp=[];window.addEventListener('click',e=>{window.__tileHelp.push({trusted:e.isTrusted,choice:!!e.target.closest?.('.o55-tile'),help:!!e.target.closest?.('.o55-tipq')});e.stopImmediatePropagation();e.preventDefault();},true);});await f.waitForTimeout(1800);
  const tile=f.locator('.o55-pane>.o55-layer:not(.o55-out) .o55-tile').first();await tile.scrollIntoViewIfNeeded();await t.page.mouse.move(2,2);
  const b=await tile.evaluate(async e=>{await Promise.all(e.getAnimations({subtree:true}).filter(a=>Number.isFinite(a.effect.getComputedTiming().endTime)).map(a=>a.finished.catch(()=>{})));const r=e.getBoundingClientRect(),s=getComputedStyle(e),rad=parseFloat(s.borderBottomRightRadius)||0,k=Math.ceil(rad*.293)+2,q=e.parentElement.querySelector('.o55-tipq'),p=getComputedStyle(q,'::before');return {x:r.x,y:r.y,w:r.width,h:r.height,k,padding:[p.top,p.right,p.bottom,p.left]};});
  await t.crop(`glass-light-${width}-${height}-tile`,tile,'Native resting tile and help mark; compare control/fix without resizing.');
  const fe=f===t.page.mainFrame()?null:await f.frameElement(),off=fe?await fe.boundingBox():{x:0,y:0};
  await t.page.mouse.move(off.x+b.x+b.w-b.k,off.y+b.y+b.h-b.k);await t.mark(`down tile ${width}x${height}`);await t.page.mouse.down();await f.waitForTimeout(350);await t.page.mouse.up();
  const events=await f.evaluate(()=>window.__tileHelp);
  await t.check(`FO-49 Glass Look painted corner owns hold ${width}x${height}`,events.length===1&&events[0].trusted&&events[0].choice,JSON.stringify({b,events}));
  await t.check(`FO-49 in-tile help has no invisible target over tile ${width}x${height}`,b.padding.every(v=>parseFloat(v)>=0),JSON.stringify(b.padding));
  const q=tile.locator('..').locator(':scope > .o55-tipq'),qb=await q.boundingBox();await f.evaluate(()=>window.__tileHelp=[]);
  await t.page.mouse.move(qb.x+qb.width/2,qb.y+qb.height/2);await t.page.mouse.down();await f.waitForTimeout(350);await t.page.mouse.up();
  const help=await f.evaluate(()=>window.__tileHelp);await t.check(`FO-49 visible help remains usable ${width}x${height}`,qb.width>=19&&qb.height>=19&&help.length===1&&help[0].trusted&&help[0].help,JSON.stringify(help));
 }
}
