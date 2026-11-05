// FO-56: a retained header note must survive every stage's layout rebuild.
import {reachableMenuLines} from '../helpers/look-menu-lines.mjs';
const allLooks = ['basic','friendly','retro','glass','nier'].flatMap(f => [`${f}-dark`,`${f}-light`]);
export default async function(t) {
  const looks = t.args.resizeLooks ? String(t.args.resizeLooks).split(',') : allLooks;
  const motions = t.args.resizeMotion ? String(t.args.resizeMotion).split(',') : ['reduce','no-preference'];
  const wordings = t.args.resizeWordings ? String(t.args.resizeWordings).split(',') : ['ELI5','Expert'];
  const id = 'lookFamily:nier';
  for (const motion of motions) for (const look of looks) {
    await t.emulate({reducedMotion:motion});
    await t.viewport(1920,1080); // each route must genuinely start wide
    const f = await t.app.open({onboarding:true,query:'o55=screen=look'});
    const [family,mode] = look.split('-');
    await f.locator(`[data-o55-do="pickFamily"][data-arg="${family}"]`).last().click();
    await f.locator(`[data-o55-do="pickMode"][data-arg="${mode}"]`).last().click();
    await f.waitForFunction(([family,mode]) => O55.theme().chosen === family && O55.theme().mode === mode,[family,mode]);
    await t.check(`FO-56 resize ${look}/${motion}: actual motion preference`, await f.evaluate(() => O55.motion.reduced()) === (motion === 'reduce'));
    for (const wording of wordings) {
      await f.evaluate(m => O55.talk.set(m,'open-resize-check'),wording);
      await f.locator('.o55-lookbtn').focus();
      await t.page.keyboard.press('Enter');
      const q = f.locator(`.o55-lookslot .o55-tipq[data-arg="${id}"]`);
      await q.click();
      const expected = await f.evaluate(id => O55.tips.of(id,'chrome').text,id);
      await f.waitForFunction(expected => {
        const el=document.querySelector('.o55-stage .pst-tip-t');
        return el?.textContent === expected && !el.closest('.typing');
      },expected,{timeout:15000});
      const label = `${look}/${wording}/${motion}`;
      if (look === 'basic-dark' && wording === 'ELI5') await t.shot(`resize-before-${motion}`, 'Complete wide stage note before resizing');
      let survived = true;
      for (const [width,height] of [[1280,500],[740,768],[1920,1080]]) {
        await t.viewport(width,height);
        // Wait only for the expected presentation, never trigger a redraw or reopen.
        const ready = await f.waitForFunction(expected => {
          const inline=document.querySelector('.o55-lookslot .o55-explainer-w');
          const body=inline || document.querySelector('.o55-stage .pst-tip-t');
          return body?.textContent === expected && (O55.tips.onStage() ? !body.closest('.typing') : !!inline);
        },expected,{timeout:5000}).then(() => true, () => false);
        const state = await f.evaluate(id => {
          const q=document.querySelector(`.o55-lookslot .o55-tipq[data-arg="${id}"]`);
          const head=document.querySelector('.o55-stage svg g.pst-pip g.pst-head');
          const r=head?.getBoundingClientRect();
          return {retained:O55.S.tip?.id === id,expanded:q?.getAttribute('aria-expanded'),menu:!!document.querySelector('.o55-lookmenu'),
            pip:!!r && r.width>1 && r.height>1 && Number.isFinite(r.x) && Number.isFinite(r.y)};
        },id);
        const reach = ready ? await reachableMenuLines(t,f,id) : {ok:false};
        t.log(JSON.stringify({look,wording,motion,width,height,ready,state,reach}));
        await t.check(`FO-56 retained note ${label} -> ${width}x${height}`,ready && state.retained && state.expanded === 'true' && state.menu && state.pip && reach.ok);
        if (ready && state.pip) await t.painted('.o55-stage svg g.pst-pip g.pst-head');
        if (width === 1280 && look === 'basic-dark' && wording === 'ELI5') await t.shot(`resize-after-${motion}`, 'Retained note visible and Pip painted after wide-to-short resize');
        if (!ready) { survived = false; break; } // the negative control must not conceal the initial failure by reopening
      }
      // Fresh navigation recovers a crashing control; no product state is repaired.
      if (!survived) break;
      await q.click();
      await t.page.keyboard.press('Escape');
    }
  }
}
