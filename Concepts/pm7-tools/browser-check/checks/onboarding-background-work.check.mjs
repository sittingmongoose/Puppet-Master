// QA-7: the covered hosted demo must spend no work ticks patching the invisible transcript.
export default async function(t) {
  const f=await t.app.open();
  await f.waitForFunction(()=>!!window.PM56_DEMO);
  await f.evaluate(()=>PM56_DEMO.startWorking());
  await f.evaluate(()=>O55.ui.open({fresh:true,screen:'r-pick'}));
  await f.waitForFunction(()=>document.documentElement.hasAttribute('data-o55-open')&&O55.S.open);
  const before=await f.evaluate(()=>PM56_DEMO.getState().work.clock||0);
  await f.evaluate(()=>{for(let i=0;i<3;i++)PM56_DEMO.tickOnce();});
  await f.waitForTimeout(1100);
  const held=await f.evaluate(()=>PM56_DEMO.getState().work.clock||0);
  await t.equal('covered demo keeps its clock (explicit and scheduled ticks)',held,before);
  await f.locator('#pm-o55-onboarding .o55-head [data-o55-do="close"]').click();
  await f.waitForFunction(()=>!document.documentElement.hasAttribute('data-o55-open'));
  const resumes=await f.waitForFunction(v=>(PM56_DEMO.getState().work.clock||0)>v,held,{timeout:2500}).then(()=>true,()=>false);
  await t.check('existing demo interval resumes after Close',resumes);
}
