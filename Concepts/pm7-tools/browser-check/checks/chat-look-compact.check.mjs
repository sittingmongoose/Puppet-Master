// FO-156: keep the 400px width fixed while look and motion change, in both directions.
export default async function(t) {
 for (const [from,to] of [['basic-light','friendly-dark'],['glass-dark','nier-light'],['friendly-light','basic-dark']]) for(const reduced of [true,false]) {
  await t.viewport(1920,1080); const f=await t.app.open();
  await t.emulate({reducedMotion:reduced?'reduce':'no-preference'}); await t.app.look(from);
  const accepted=await f.evaluate(()=>PMW.chatCol.setWidth(400)); await t.check('400px width accepted',accepted.ok,JSON.stringify(accepted));
  await f.waitForFunction(()=>Math.round(document.querySelector('#chatPanel').getBoundingClientRect().width)===400);
  await t.emulate({reducedMotion:reduced?'no-preference':'reduce'}); await t.app.look(to);
  await t.settle(); await f.evaluate(()=>document.fonts.ready); await t.page.waitForTimeout(600);
  const got=await f.evaluate(()=>{const b=document.querySelector('#pmRoot .composer-box[data-k="composer-box"]'),r=b.getBoundingClientRect();return {compact:b.classList.contains('is-compact'),width:r.width,controls:[...b.querySelectorAll('.composer-tools button')].map(e=>{const q=e.getBoundingClientRect();return {text:e.textContent.trim(),left:q.left-r.left,right:q.right-r.left}})}});
  const name=`${from} → ${to}, ${reduced?'reduced → normal':'normal → reduced'}`;
  t.log(JSON.stringify({name,...got}));
  await t.check(name+' compact',got.compact,JSON.stringify(got));
  await t.check(name+' controls inside composer',got.controls.every(c=>c.left>=-1&&c.right<=got.width+1),JSON.stringify(got));
  if(!got.compact||got.controls.some(c=>c.left < -1||c.right>got.width+1)) await t.shot('fo156-overhang',name);
 }
}
