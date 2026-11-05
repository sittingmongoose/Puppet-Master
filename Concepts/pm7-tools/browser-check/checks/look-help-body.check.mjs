const FAMILIES = ['basic', 'friendly', 'retro', 'glass', 'nier'];
const SIZES = [[1280,900],[860,768],[1024,768],[1390,900],[1920,1080],[740,768],[1280,500]];
const PLAIN = 'Auto follows your computer’s light or dark appearance, including changes while setup is open. Pick Light or Dark to keep that appearance instead.';
const EXPERT = 'Auto retains theme mode auto and resolves the system colour scheme live.';
const OLD = 'Every look has a light and a dark version. First-time setup starts in Basic Dark; choose whichever is easier for you to read.';
export default async function(t) {
  const f = await t.app.open();
  await t.page.emulateMedia({colorScheme:'dark', reducedMotion:'reduce'});
  await f.evaluate(() => { PM7_SETTINGS_TOME.setChromeThemeMode('auto'); O55.ui.open({fresh:true}); });
  const ready = async () => f.waitForFunction(() => !document.querySelector('.o55-layer.o55-out,.o55-layer.o55-hold') && !window.PM_LOOK_COVERED?.() && !window.PM_THEME_TRANSITION?.busy());
  const click = async (act,arg) => { await f.locator(`[data-o55-do="${act}"]${arg ? `[data-arg="${arg}"]` : ''}`).filter({visible:true}).first().click(); await ready(); };
  await click('start');
  const checkTip = async (id, expected, title, shot) => {
    if (id.startsWith('lookMode')) await click('lookMenu');
    const [action,mode]=id.split(':');
    await click(action,mode);
    const help = f.locator(`[data-o55-do="tip"][data-arg="${id}"]`).filter({visible:true}).first();
    await t.visible(help, `${id}: help reachable`);
    await t.equal(`${id}: accessible name`, await help.getAttribute('aria-label'), `About ${title}`);
    await help.click();
    const note = f.locator('#pm7ob-explainer');
    await note.waitFor({state:'visible'});
    await t.equal(`${id}: heading`, await note.getAttribute('aria-label'),title);
    await t.equal(`${id}: full accessible copy`, await note.locator('.o55-sr').textContent(),expected);
    // Under Reduced Motion the writer populates a visible note immediately. A soft assertion keeps later cases independent.
    await t.equal(`${id}: visible copy`,await note.locator('.o55-explainer-w,.pst-tip-t').textContent(),expected);
    const fit=await note.evaluate(n=>{const r=n.getBoundingClientRect(), w=n.querySelector('.o55-explainer-w,.pst-tip-t'), s=getComputedStyle(w);return {width:r.width,height:r.height,scroll:w.scrollWidth,client:w.clientWidth,visibility:s.visibility,opacity:s.opacity};});
    await t.check(`${id}: note has painted bounds`,fit.width>0 && fit.height>0 && fit.visibility!=='hidden' && Number(fit.opacity)>0);
    await t.check(`${id}: copy has no horizontal scroll`,fit.scroll <= fit.client+1);
    await t.noOverflow(`${id}: note text not clipped`,{scope:'#pm7ob-explainer'});
    if(shot) await t.crop(shot,note,'Auto help: readable heading and system-following copy in the active look');
    await f.locator('#pm7ob-explainer [data-o55-do="tip"]').click();
    if (await f.evaluate(() => O55.S.lookOpen)) await click('lookMenu');
  };
  for (const family of FAMILIES) {
    await click('pickFamily',family);
    for (const os of ['dark','light']) {
      await t.page.emulateMedia({colorScheme:os,reducedMotion:'reduce'});
      await f.waitForFunction(look=>PMLogo.look()===look,`${family}-${os}`);
      const sizes = t.args.narrow ? [[740,768],[1280,500]] : t.args.quick ? SIZES.slice(0,1) : SIZES;
      for (const [w,h] of sizes) {
        await t.viewport(w,h); await ready();
        await t.step(`${family}-${os} ${w}x${h}`,async()=>{
          for (const wording of ['ELI5','Expert']) {
            await f.evaluate(wording=>O55.talk.set(wording),wording);
            const text=wording==='ELI5'?PLAIN:EXPERT;
            for(const id of (t.args.headerOnly ? ['lookMode:auto'] : ['pickMode:auto','lookMode:auto'])) {
              const shot = id==='pickMode:auto' && ((w===1280 && h===900 && os==='dark' && wording==='ELI5') || (family==='basic' && os==='light' && wording==='Expert' && [740,1920].includes(w))) ? `${family}-${os}-${w}-${wording}` : undefined;
              await checkTip(id,text,'Follow your computer',shot);
            }
            if(w===1280 && h===900 && !t.args.headerOnly) {
              for(const id of ['pickMode:light','pickMode:dark','lookMode:light','lookMode:dark']) await checkTip(id,OLD,'Light or dark');
            }
          }
          await click('pickMode','auto');
          await t.equal('selected Auto after help matrix',await f.evaluate(()=>O55.S.sess.drafts.main.theme_mode),'auto');
        });
      }
    }
  }
  // Adjacent screen and Back: both wordings still route to Auto after leaving the look step.
  await click('next'); await t.equal('adjacent screen',await f.evaluate(()=>O55.S.sess.screen),'where');
  await click('back'); await t.equal('Back returns look',await f.evaluate(()=>O55.S.sess.screen),'look');
  await checkTip('pickMode:auto',EXPERT,'Follow your computer');
  await t.equal('Back keeps Auto',await f.evaluate(()=>O55.S.sess.drafts.main.theme_mode),'auto');
}
