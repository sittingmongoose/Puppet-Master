// SW22 control: real Studio loader gallery across repeated look switches.
export default async function(t){
 const f=await t.app.open();
 await t.page.emulateMedia({reducedMotion:'no-preference'});
 await f.evaluate(()=>{O55.studio.looks.setReduced(false);O55.studio.open('pip');});
 const rows=[];
 for(const look of ['basic-dark','retro-dark','friendly-dark','retro-light','glass-dark','retro-dark','basic-light','retro-light']){
  await t.mark(look);
  await t.app.look(look);
  await t.visible('#pmds-sheet .pmds-ldwall','gallery visible');
  await t.painted('#pmds-sheet .pmds-ldwall','gallery paints');
  await t.mark('steady '+look);
  await t.page.waitForTimeout(2400);
  const data=await f.locator('#pmds-sheet .pmds-ldwall [data-pip-loader]').evaluateAll(es=>es.map(e=>{const b=e.getBoundingClientRect();return {x:b.x,y:b.y,w:b.width,h:b.height,run:e.dataset.pmlRun,motion:e.dataset.pmlMotion,frames:[...e.querySelectorAll('.pml-fr')].map(n=>+getComputedStyle(n).opacity)};}));
  rows.push({look,data});t.log(JSON.stringify({look,data}));
  await t.check(look+' gallery has at least three armed loaders',data.length>=3&&data.every(e=>e.run==='on'||e.run==='still'));
 }
 t.log(JSON.stringify(rows));
}
