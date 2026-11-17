// Native closed-trigger traversal is the oracle. Never duplicate the product focus selector here.
export async function popupTab(t, f, trigger, where, back, depth = false) {
 const key = back ? 'Shift+Tab' : 'Tab';
 await trigger.focus(); await t.page.keyboard.press(key);
 const oracle = await f.evaluate(() => {
  window.__fo225RowTarget = document.activeElement;
  return { tag: document.activeElement.tagName, text: (document.activeElement.textContent || '').trim().slice(0,80) };
 });
 await trigger.click(); await t.page.waitForTimeout(450);
 if (depth) {
   // A selected model's depth is already open; otherwise use ArrowRight on the first model with levels.
  if (!(await f.locator('.o55-depth [role="listbox"]').count())) {
   const index = await f.evaluate(() => [...document.querySelectorAll('.o55-pick-pop .o55-pick-item')].find(n => /depth/i.test(n.textContent))?.dataset.index);
   if (index !== undefined) await f.locator(`.o55-pick-pop .o55-pick-item[data-index="${index}"]`).click();
  }
  await f.locator('.o55-depth [role="listbox"]').focus();
 } else await f.locator('.o55-pick-pop.is-open').evaluate((box, back) => {
  const stops = [...box.querySelectorAll('button,input')].filter(n => !n.disabled && n.getClientRects().length);
  stops[back ? 0 : stops.length-1].focus();
 }, back);
 await t.page.keyboard.press(key); await t.page.waitForTimeout(450);
 const result = await f.evaluate(() => {
  const el = document.activeElement;
  window.__fo225RowEnter = false; window.__fo225RowClick = false;
  el.addEventListener('keydown', e => {if (e.isTrusted && e.key === 'Enter') window.__fo225RowEnter = true;}, {once:true});
  el.addEventListener('click', e => {if(e.isTrusted) window.__fo225RowClick=true;}, {once:true});
  return {same: el === window.__fo225RowTarget, tag:el.tagName, open:!!document.querySelector('.o55-pick-pop.is-open'), details:el.tagName==='SUMMARY'?el.parentElement.open:null};
 });
 await t.check(`${where} ${key}${depth?' depth':''}: popup closes on native destination`, result.same && result.tag!=='BODY' && !result.open, JSON.stringify({oracle,result}));
 await t.page.keyboard.press('Enter'); await t.page.waitForTimeout(350);
 const acted = await f.evaluate(() => ({enter:window.__fo225RowEnter, click:window.__fo225RowClick, details:window.__fo225RowTarget?.tagName==='SUMMARY'?window.__fo225RowTarget.parentElement.open:null}));
 await t.check(`${where} ${key}${depth?' depth':''}: Enter acts on destination`, result.same && acted.enter && (!['BUTTON','SUMMARY','A'].includes(result.tag)||acted.click) && (result.details===null||result.details!==acted.details), JSON.stringify(acted));
 await t.page.keyboard.press('Escape');
}
