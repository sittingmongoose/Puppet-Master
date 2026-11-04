import {paintedText} from '../helpers/painted-text.mjs';
const sizes=[[740,900],[860,900],[900,900],[1024,900],[1280,900],[1280,500],[1390,900],[1920,900]];
export default async function(t){
 const f=await t.app.open();
 for(const look of String(t.args.looks||'glass-dark,glass-light').split(','))for(const [w,h] of sizes.filter(([w])=>!t.args.widths||String(t.args.widths).split(',').includes(String(w)))){
  await t.viewport(w,h);
  for(const screen of (t.args.repro==='1'?['where']:['where','ai-all','ai-install'])){
   const id=screen==='ai-install'?'ai-all':screen;
   await f.evaluate(id=>O55.studio.onboarding.screen(id,'fresh'),id);
   await f.waitForFunction(id=>O55.S.sess&&O55.S.sess.screen===id,id);
   await f.waitForFunction(()=>{const e=document.querySelector('#pm-o55-onboarding .o55-layer:not(.o55-out)');return e&&!e.matches('.o55-hold,.o55-entering');});
   // The reported reproduction starts with a settled Light -> Dark switch.
   await f.evaluate(()=>O55.ui.applyLook('glass','light'));await t.settle();
   await f.evaluate(mode=>O55.ui.applyLook('glass',mode),look.split('-')[1]);await t.settle();
   await f.waitForFunction(look=>PMLogo.look()===look,look);
   if(screen==='where') await f.locator('#pm-o55-onboarding .o55-layer:not(.o55-out) [role="radio"]').first().click();
   if(screen==='ai-install') await f.locator('#pm-o55-onboarding [data-o55-do="install"][data-arg="claude"]').click();
   const targets=screen==='where'?[['Recommended',f.locator('#pm-o55-onboarding .o55-tag:visible').first()],['Continue',f.locator('#pm-o55-onboarding .o55-foot .o55-primary:visible').first()]]:[[screen==='ai-install'?'Install':'Done',f.locator(screen==='ai-install'?'#pm-o55-onboarding [data-o55-do="installGo"][data-arg="claude"]':'#pm-o55-onboarding .o55-foot .o55-primary:visible').first()]];
   for(const [name,el] of targets){
    await el.scrollIntoViewIfNeeded();await t.settle();
    // Use the pane for fixed footer labels; otherwise use the label's scrolling ancestor.
    const scroller=await el.evaluateHandle(e=>{for(let p=e.parentElement;p;p=p.parentElement){const s=getComputedStyle(p);if(/auto|scroll/.test(s.overflowY)&&p.scrollHeight>p.clientHeight+1)return p;}return document.querySelector('#pm-o55-onboarding .o55-pane');});
    const range=await scroller.evaluate((s,e)=>{const max=s.scrollHeight-s.clientHeight;if(!s.contains(e))return{lo:0,hi:max,max};const b=e.getBoundingClientRect(),a=s.getBoundingClientRect();return{lo:Math.max(0,Math.ceil(b.bottom-a.top+s.scrollTop-s.clientHeight+4)),hi:Math.min(max,Math.floor(b.top-a.top+s.scrollTop-4)),max};},await el.elementHandle());
    await t.check(`${look} ${w}x${h} ${name} visible scroll range`,range.hi>=range.lo,JSON.stringify(range));
    for(const pos of [...new Set([range.lo,Math.min(range.hi,range.lo+80),Math.round((range.lo+range.hi)/2),range.hi])]){
     await scroller.evaluate((s,n)=>s.scrollTop=n,pos);
     // Move the pointer without locator.hover(), which could silently scroll the target.
     const hover=name==='Recommended'?el.locator('xpath=ancestor::*[@role="radio"][1]'):el;
     const b=await hover.boundingBox();await t.page.mouse.move(b.x+b.width/2,b.y+b.height/2);await t.settle();
     const before=await scroller.evaluate(s=>s.scrollTop),p=await paintedText(el),after=await scroller.evaluate(s=>s.scrollTop);
     const label=`${look} ${w}x${h} ${name} scroll ${before}/${range.max}`;
     t.log(JSON.stringify({label,...p}));
     await t.check(label+' retains scroll',before===after,`${before} -> ${after}`);
     await t.check(label+' local ink >=4.5',p.count>=3&&p.minimum>=4.5,`${p.minimum.toFixed(3)}:1 (${p.count} stems)`);
     if(w===860&&h===900&&name==='Recommended'&&pos===range.hi){
      await el.hover();await t.settle();const badge=await paintedText(el);
      await t.check(label+' badge hover >=4.5',badge.count>=3&&badge.minimum>=4.5,JSON.stringify(badge));
      await t.crop(look+'-scrolled-badge',hover,'Selected Glass card retains legible Recommended ink over the brightest scrolled backing');
     }
    }
   }
  }
 }
}
