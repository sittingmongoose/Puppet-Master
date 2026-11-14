// Reach the real PM51, Inspector and NAS builders; no hand-written replacement markup.
export async function pickerLook(page,look){
 const [family,mode]=look.split('-');
 await page.evaluate(()=>PM_PAGES.go('settings'));
 await page.locator('#pm-settings-root [data-action="navigate-domain"][data-domain="general"]').first().evaluate(e=>e.click());
 for(const [id,value]of [['general.visual.theme',family==='nier'?'NieR':family[0].toUpperCase()+family.slice(1)],['general.visual.theme-mode',mode==='light'?'Light':'Dark']]){
  const select=page.locator('select[data-setting="'+id+'"]').first();
  await select.evaluate((e,value)=>{const o=[...e.options].find(o=>o.textContent.trim()===value);if(!o)throw Error('missing look choice '+value);e.value=o.value;e.dispatchEvent(new Event('change',{bubbles:true}));},value);
  await page.waitForTimeout(350);
 }
 await page.waitForFunction(mode=>PM_NIER.on()&&document.documentElement.dataset.theme.endsWith('-'+mode),mode,{timeout:20000});
 await page.evaluate(()=>PM_NIER.setParts(PM_NIER.PARTS.map(p=>p.key)));
}
export async function visitCursorPickers(page,visit){
 await page.evaluate(()=>{
  PM51.pick(document.querySelector('#pm-settings-root .domain-link'),{title:'Attach to which profile?',search:false,current:'one',items:[{value:'one',label:'This project',meta:'2 rules'},{value:'two',label:'Plan only',meta:'1 rule'}]});
 });
 await page.waitForSelector('.pm51-dd-list .pm51-popout-meta');
 await visit({kind:'PM51 pick with side text',builder:'kit.js PM51.pick/openListPopout',target:'.pm51-dd-list [data-index="1"] .pm51-popout-meta'});
 await page.evaluate(()=>{PM51.closePopouts();PM51.menu(document.querySelector('#pm-settings-root .domain-link'),[{label:'Move to this project’s rules',icon:'arrowRight',meta:'Applies with every profile'}],'Rule actions');});
 await page.waitForSelector('.pm51-menu .pm51-popout-meta');
 await visit({kind:'PM51 menu with side text',builder:'kit.js PM51.menu/openMenu',target:'.pm51-menu .pm51-popout-meta'});
 await page.evaluate(()=>PM51.closePopouts());
 const id='ai.models.default-model',pl=await page.evaluate(id=>PM51.placement.byId[id],id);
 if(!pl)throw Error('model setting has no placement');
 await page.locator('#pm-settings-root [data-action="navigate-domain"][data-domain="'+pl.domain+'"]').first().evaluate(e=>e.click());
 if(pl.tab)await page.locator('#pm-settings-root [data-tab="'+pl.tab+'"]').first().evaluate(e=>e.click());
 const about=page.locator('#pm-settings-root .o55-about[data-setting="'+id+'"]').first();await about.waitFor({state:'visible'});await about.evaluate(e=>e.click());
 const trigger=page.locator('#panel-settings .detail-inspector [data-action="o55-insp-pick"]').first();await trigger.waitFor({state:'visible'});await trigger.evaluate(e=>e.click());
 await page.waitForSelector('.o55-pick-list .o55-pick-item small');
 await visit({kind:'Settings Inspector model picker',builder:'kit.d/30-inspector.js o55InlineOpen/o55PickItems',target:'.o55-pick-list .o55-pick-item:not([aria-disabled="true"]):not([aria-selected="true"]) small'});
 await page.evaluate(()=>{document.querySelector('#panel-settings [data-action="close-details"]')?.click();O55.ui.open({fresh:true,screen:'nas-folder'});});
 await page.waitForFunction(()=>O55.S.open&&O55.S.sess.screen==='nas-folder'&&!!document.querySelector('.o55-layer:not(.o55-out) [data-o55-do="adding"]'),null,{timeout:20000});
 const parent=await page.evaluate(()=>O55.S.sess.nas.at||O55.S.env.devices.find(d=>d.id===O55.S.sess.nas.device).roots[0]);
 await page.locator('.o55-layer:not(.o55-out) [data-o55-do="adding"]').evaluate(e=>e.click());
 const input=page.locator('.o55-layer:not(.o55-out) #o55f-newName');await input.waitFor({state:'visible'});await input.fill('Cursor colour proof');
 await page.locator('.o55-layer:not(.o55-out) [data-o55-do="addFolder"]').evaluate(e=>e.click());
 // addFolder navigates into the new folder. Its real cd handler returns to the parent where the New tag lives.
 await page.waitForFunction(()=>O55.S.sess.nas.newFolders?.some(f=>f.name==='Cursor colour proof'));
 await page.evaluate(parent=>{const e=[...document.querySelectorAll('.o55-layer:not(.o55-out) [data-o55-do="cd"]')].find(e=>e.dataset.arg===parent);if(!e)throw Error('parent crumb missing '+parent);e.click();},parent);
 await page.waitForSelector('.o55-layer:not(.o55-out) .o55-new .o55-tag');
 await visit({kind:'NAS folder picker after creating folder',builder:'70-screens-nas.js nas-folder adding/bind.newName/addFolder/cd/body',target:'.o55-layer:not(.o55-out) .o55-new .o55-tag'});
 await page.evaluate(()=>O55.ui.close());
}
