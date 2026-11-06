// SW-49: execute the Project locator retained by the committed Glass backing check.
import fs from 'node:fs';
const source=fs.readFileSync(new URL('./glass-backing.check.mjs',import.meta.url),'utf8');
export default async function(t){
  await t.check('Glass backing retains current Project button locator',source.includes('#projectMenuBtn')&&!source.includes('#railJump'),'',{hard:true});
  for(const width of [1390,1920]){
    await t.viewport(width,900);const f=await t.app.open();await t.app.look('glass-dark');
    await f.locator('#projectMenuBtn').click();
    await t.visible('#projectMenu.is-open',width+' Project menu opened by committed locator');
    await t.page.keyboard.press('Escape');
  }
}
