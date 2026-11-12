// FO-158: choose a destination in Details, then change a value with the inline picker.
export default async function(t) {
 await t.viewport(1920,1080); const f=await t.app.open();
 await f.waitForFunction(()=>!!window.PSX);
 await f.evaluate(()=>PM51.revealSetting('ai.models.default-model',{detail:true}));
 await t.page.waitForTimeout(1600);
 t.log(JSON.stringify(await f.evaluate(()=>({target:document.querySelector('.psx-target-btn')?.textContent,choices:[...document.querySelectorAll('.detail-inspector h4')].map(e=>e.textContent)}))));
 await f.locator('.psx-target-btn').click();
 await f.getByText('This project (tastebook)',{exact:true}).click();
 await f.locator('.detail-inspector [data-action="o55-insp-pick"]').click();
 const option=f.locator('.o55-pick-inline [role="option"]').filter({hasText:'GPT-5'}).first();
 await option.click(); await t.page.waitForTimeout(1500);
 const got=await f.evaluate(()=>({resolved:PSX.resolve('ai.models.default-model',PSX.S.ctx),history:PSX.W.history.slice(0,3),text:document.querySelector('.detail-inspector').innerText}));
 t.log(JSON.stringify(got));
 await t.check('picker choice reaches the selected project feed',got.resolved.from.level==='project'&&got.resolved.from.key==='tastebook'&&/gpt-5/i.test(JSON.stringify(got.resolved)),JSON.stringify(got));
 await t.shot('fo158-feed','Details picker and selected project result');
}
