// FO-171 breadth: the remaining reachable Notifications sheets/menus after the same native route.
import route from './settings-sheet-in-view.check.mjs';
import {guardPaintedLook} from '../helpers/settings-look.mjs';
const live='#pm-settings-portals .drawer-wrap.is-open .drawer, #pm-settings-portals .overlay .dialog, .pm51-popout.is-open';
async function press(t,b){
 for(let i=0;i<5;i++){const summary=b.locator('xpath=ancestor::details[not(@open)]/summary').last();if(!await summary.count())break;await summary.scrollIntoViewIfNeeded();await summary.click();await t.settle();}
 await b.scrollIntoViewIfNeeded();await b.click();await t.settle();
}
async function dropdowns(t,f,scope,label,w,h){
 const triggers=scope.locator('.pm51-dd-trigger');
 for(let i=0;i<await triggers.count();i++){
  const trigger=triggers.nth(i);if(!await trigger.isVisible()||await trigger.isDisabled())continue;
  await press(t,trigger);const list=f.locator('.pm51-dd-list.is-open').last();await list.waitFor({state:'visible'});
  const r=await list.boundingBox();await t.check(`${label} dropdown ${i+1}: fully inside viewport`,!!r&&r.x>=0&&r.y>=0&&r.x+r.width<=w&&r.y+r.height<=h,JSON.stringify(r));
  await t.page.keyboard.press('Escape');await t.settle();await t.check(`${label} dropdown ${i+1}: dismissed`,!await list.isVisible());
 }
}
async function box(t,f,label,w,h,close=true){
 const sheet=f.locator(live).last();await sheet.waitFor({state:'visible'});const r=await sheet.boundingBox();
 await t.check(label+': fully inside viewport',!!r&&r.x>=0&&r.y>=0&&r.x+r.width<=w&&r.y+r.height<=h,JSON.stringify(r));
 const head=sheet.locator('.pm51-panel-head,.dialog-head').first();if(await head.count())await t.visible(head,label+': header exposed');
 await dropdowns(t,f,sheet,label,w,h);
 const x=sheet.locator('.pm51-panel-close,.dialog-head [data-action="close-overlay"]').first();
 if(await x.count()){await t.visible(x,label+': close exposed');if(close){await x.click();await t.settle();}}
 else if(close){await t.page.keyboard.press('Escape');await t.settle();}
 return sheet;
}
async function checkLook(t,look){
  // A stationary pointer can enter a scheme tile when a resize moves Customize under it.
  // Its first Escape then correctly cancels the hover preview. Leave the tiles before testing close.
  const keyboard=new Proxy(t.page.keyboard,{get(o,k){
   if(k==='press')return async(key,...rest)=>{
    if(key==='Escape'){
     const head=t.root.locator('.pmt-cz:not(.pmed-cz):not(.pmt-cz-parked):not([aria-hidden="true"]) .pmt-cz-head').first();
     if(await head.isVisible())await head.hover();
    }
    return o.press(key,...rest);
   };
   const v=Reflect.get(o,k,o);return typeof v==='function'?v.bind(o):v;
  }});
  const page=new Proxy(t.page,{get(o,k){if(k==='keyboard')return keyboard;const v=Reflect.get(o,k,o);return typeof v==='function'?v.bind(o):v;}});
  const args={...t.args,looks:look,bite:'1'};const rt=new Proxy(t,{get(o,k){if(k==='args')return args;if(k==='page')return page;const v=Reflect.get(o,k,o);return typeof v==='function'?v.bind(o):v;}});await route(rt);
  const f=t.root===t.page?t.page.mainFrame():t.root;await f.evaluate(()=>PM51.go('general','notifications'));await f.waitForSelector('[data-continuous-workspace-body="notifications"][data-workspace-mounted="true"]');await t.settle();
  const n=f.locator('[data-continuous-workspace-body="notifications"]');
  const tab=async label=>{await press(t,n.locator('.manager-tab',{hasText:new RegExp('^\\s*'+label+'\\s*$')}).first());};
  const action=name=>n.locator(`[data-action="pm51-notifications-${name}"]`).first();
  const menuItem=label=>f.locator('.pm51-popout.is-open .pm51-menu-item').filter({hasText:label}).first();
  for(const [w,h] of [[1280,900],[1390,900],[1920,1080]]){
   await t.viewport(w,h);
   await guardPaintedLook(rt,f,look,`${look} ${w} breadth start`);
   for(const section of ['Destinations','Events','Quiet hours','History','Sounds']){
    await tab(section);await dropdowns(t,f,n,`${look} ${w} ${section} inline`,w,h);
   }
   for(const [section,name] of [['Destinations','add-dest'],['Events','event'],['Events','group'],['Events','add-event']]){
    await tab(section);await press(t,action(name));await box(t,f,`${look} ${w} ${name} fields`,w,h);
   }
   for(const [section,name] of [['Quiet hours','diagnostics'],['Quiet hours','reset'],['Events','export-events'],['Events','import-events'],['Events','add-agent'],['History','history'],['History','export'],['Sounds','export-pack']]){
    await tab(section);await press(t,action(name));await box(t,f,`${look} ${w} ${name}`,w,h);
   }
   // The Add alert sheet hands off to the custom-alert setup dialog without committing an alert.
   await tab('Events');await press(t,action('add-event'));await box(t,f,`${look} ${w} add-alert parent`,w,h,false);
   await press(t,f.locator('#pm-settings-portals [data-action="pm51-notifications-add-custom"]').first());await box(t,f,`${look} ${w} custom alert setup`,w,h);
   await press(t,action('add-event'));await box(t,f,`${look} ${w} preset parent`,w,h,false);
   const preset=f.locator('#pm-settings-portals [data-action="pm51-notifications-add-catalog"]').first();
   await t.check(`${look} ${w}: an unused preset is reachable`,await preset.count()>0);await press(t,preset);await box(t,f,`${look} ${w} preset alert setup`,w,h);
   await press(t,n.locator('[data-action="pm51-notifications-event"][data-event="nightly-report-ready"]').first());await box(t,f,`${look} ${w} custom event parent`,w,h,false);
   await press(t,f.locator('#pm-settings-portals [data-action="pm51-notifications-event-remove"]').first());await box(t,f,`${look} ${w} remove event confirmation`,w,h);await t.page.keyboard.press('Escape');await t.settle();
   // A seeded agent exposes its removal confirmation; cancel it through the header.
   await press(t,action('group'));await box(t,f,`${look} ${w} agent parent`,w,h,false);
   await press(t,f.locator('#pm-settings-portals [data-action="pm51-notifications-group-remove"]').first());await box(t,f,`${look} ${w} remove agent confirmation`,w,h);await t.page.keyboard.press('Escape');await t.settle();
   await tab('Sounds');
   for(const item of ['Upload file','Import pack']){
    await press(t,n.locator('button',{hasText:/^\s*Add sound\s*$/}).first());await box(t,f,`${look} ${w} add-sound menu`,w,h,false);
    await press(t,menuItem(item));await box(t,f,`${look} ${w} ${item}`,w,h);
   }
   for(const item of ['Use for events','Rename','Replace file','Remove']){
    await press(t,action('sound-menu'));await box(t,f,`${look} ${w} sound menu`,w,h,false);
    await press(t,menuItem(item));await box(t,f,`${look} ${w} sound ${item}`,w,h);
   }
   await tab('Destinations');
   await press(t,n.locator('.resource-row').filter({hasText:'Project Discord'}).first());
   for(const item of ['Edit','Remove']){
    await press(t,n.locator('.pm51-detail-actions button[aria-label="More actions"]').first());await box(t,f,`${look} ${w} destination menu`,w,h,false);
    await press(t,menuItem(item));await box(t,f,`${look} ${w} destination ${item}`,w,h);
   }
   await press(t,action('dest-address'));await box(t,f,`${look} ${w} destination address`,w,h);
   await press(t,action('test'));await box(t,f,`${look} ${w} destination test`,w,h);
   await guardPaintedLook(rt,f,look,`${look} ${w} breadth end`);
  }
  // Breadth actions save the look again; leave a fresh Basic Dark baseline for the next look.
  await t.app.resetLayout();
}
export const tests=Object.fromEntries(['basic-light','friendly-dark','glass-dark','nier-dark'].map(look=>[look,t=>checkLook(t,look)]));
