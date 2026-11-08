// QA-7: the covered hosted demo must spend no work ticks patching the invisible transcript.
export default async function(t) {
  const f=await t.app.open();
  await f.waitForFunction(()=>!!window.PM56_DEMO);
  await f.evaluate(()=>PM56_DEMO.startWorking());
  const stage=f.locator('.working-card:not(.is-done) .orbit-stage.is-open').first();
  await stage.waitFor({state:'visible'});
  await stage.locator('.orbit-node').first().click();
  await f.waitForFunction(()=>!!document.querySelector('.working-card .orbit-node.open[aria-pressed="true"]'));
  await f.evaluate(()=>{
    window.__qa7ChatState=()=>{
      const s=document.querySelector('.working-card:not(.is-done) .orbit-stage.is-open');
      const state=PM56_DEMO.getState();
      return {work:state.work,subject:s?.getAttribute('data-orbit-focus'),pin:s?.querySelector('.orbit-node.open[aria-pressed="true"]')?.getAttribute('data-k'),panel:s?.querySelector('.orbit-panel-in')?.getAttribute('data-k')};
    };
  });
  await f.evaluate(()=>O55.ui.open({fresh:true,screen:'r-pick'}));
  await f.waitForFunction(()=>document.documentElement.hasAttribute('data-o55-open')&&O55.S.open);
  const before=await f.evaluate(()=>window.__qa7ChatState());
  await f.evaluate(()=>{for(let i=0;i<3;i++)PM56_DEMO.tickOnce();});
  await f.waitForTimeout(1100);
  const held=await f.evaluate(()=>window.__qa7ChatState());
  await t.equal('covered demo keeps clock, subject and pin (explicit and scheduled ticks)',JSON.stringify(held),JSON.stringify(before));
  await t.check('a real FO-104 subject pin is exercised',!!before.subject&&before.pin==='node:'+before.subject,JSON.stringify(before));
  await f.evaluate(()=>{
    const observer=new MutationObserver(()=>{
      if(!document.documentElement.hasAttribute('data-o55-open')){window.__qa7CloseReceipt=window.__qa7ChatState();observer.disconnect();}
    });observer.observe(document.documentElement,{attributes:true,attributeFilter:['data-o55-open']});
  });
  await f.locator('#pm-o55-onboarding .o55-head [data-o55-do="close"]').click();
  await f.waitForFunction(()=>!document.documentElement.hasAttribute('data-o55-open'));
  const closed=await f.evaluate(()=>window.__qa7CloseReceipt);
  await t.equal('Close hands back the exact clock, subject and pin',JSON.stringify(closed),JSON.stringify(before));
  const resumes=await f.waitForFunction(v=>(PM56_DEMO.getState().work.clock||0)>v,before.work.clock||0,{timeout:2500}).then(()=>true,()=>false);
  await t.check('existing demo interval resumes after Close',resumes);
  const after=await f.evaluate(()=>window.__qa7ChatState());
  await t.check('the resumed render keeps the pinned subject',after.subject===before.subject&&after.pin===before.pin&&after.panel===before.panel,JSON.stringify(after));
}
