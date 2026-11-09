// SEL forced-colours: neutral segment carries have Canvas beneath CanvasText, through the actual move.
// Pause the product's carry animations and extend only their 3 s cleanup while four positions are painted.
// This changes the sampling clock, never the material, ink, opacity, clipping or transforms being judged.
// Lead ruling 1109041622-be1a: judge words on the Canvas body. At 20%, a letter crossing the 2 px Highlight rim read
// 1.67:1 (ink 17,15,33 on 55,51,109); this ordinary edge crossing is outside the body-white-on-white finding.
import { paintedText } from '../helpers/painted-text.mjs';

export default async function(t) {
  await t.viewport(1920, 1080);
  for (const scheme of t.args.schemes ? String(t.args.schemes).split(',') : ['light', 'dark']) for (const look of t.args.looks ? String(t.args.looks).split(',') : ['friendly-light', 'friendly-dark', 'basic-light', 'basic-dark']) {
    await t.emulate({ colorScheme: scheme, forcedColors: 'active', reducedMotion: 'no-preference' });
    const f = await t.app.open({ onboarding: true, query: 'o55=fresh' });
    await f.waitForFunction(() => !!window.O55?.S?.open && !!window.O55?.ui);
    await f.evaluate(([family, mode]) => { O55.ui.applyLook(family, mode); O55.ui.go('nas-find', { noHistory: true }); }, look.split('-'));
    const strip = '#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out) .o55-seg';
    await f.locator(`${strip} button`).first().waitFor({ state: 'visible' });
    await f.waitForTimeout(1700);
    await f.evaluate(() => {
      const animate = Element.prototype.animate;
      window.__neutralAnimate = animate;
      const timeout = window.setTimeout;
      window.__neutralTimeout = timeout;
      window.setTimeout = function(fn, ms, ...args) { return timeout(fn, ms === 3000 && String(fn).includes('endHop(L)') ? 300000 : ms, ...args); };
      Element.prototype.animate = function(...args) {
        const a = animate.apply(this, args);
        if (this.matches('.lg-carry,.lg-carry-twins')) { a.pause(); a.currentTime = 0; }
        return a;
      };
    });
    const choice = f.locator(`${strip} button`).filter({ hasText: 'SMB' }).first();
    const box = await choice.boundingBox();
    await t.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await t.page.mouse.down();
    try {
      const carry = f.locator(`${strip} > lg-over .lg-carry`);
      await carry.waitFor({ state: 'visible' });
      const copies = await carry.evaluate(e => { const roots = [...e.querySelectorAll('.lg-twin')]; return { count: roots.length, hooks: roots.flatMap(c => [c, ...c.querySelectorAll('*')].flatMap(n => [...n.attributes].filter(a => a.name.startsWith('data-')).map(a => a.name))) }; });
      await t.check(`${look} forced ${scheme}: nonempty visual copies have no data hooks`, copies.count > 0 && copies.hooks.length === 0, JSON.stringify(copies), { hard: true });
      const media = await f.evaluate(() => { const p = document.createElement('i'); p.style.cssText = 'color:Canvas;forced-color-adjust:none'; document.body.append(p);
        const canvas = getComputedStyle(p).color.match(/[\d.]+/g).slice(0,3).map(Number); p.remove();
        return { canvas, forced: matchMedia('(forced-colors: active)').matches, scheme: matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light' }; });
      await t.check(`${look} forced ${scheme}: requested forced-colour surface active`, media.forced && media.scheme === scheme, JSON.stringify(media), { hard: true });
      for (const fraction of [.2, .4, .6, .8]) {
        const timing = await carry.evaluate((e, fraction) => { const as = e.getAnimations({ subtree: true });
          for (const a of as) { a.pause(); a.currentTime = +a.effect.getTiming().duration * fraction; }
          return as.map(a => ({ state: a.playState, at: a.currentTime, duration: a.effect.getTiming().duration }));
        }, fraction);
        await f.waitForTimeout(50);
        const ink = await paintedText(carry, { coverage: 180, onBackground: media.canvas });
        t.log(`${look} forced ${scheme} at ${fraction}: ${JSON.stringify({ timing, ink })}`);
        await t.check(`${look} forced ${scheme} at ${fraction}: carried words paint at 4.5:1`, timing.length >= 2 && ink.count >= 8 && ink.minimum >= 4.5, JSON.stringify({ timing, ink }));
        await t.crop(`neutral-${look}-${scheme}-${fraction}`, carry, 'Native carried-label paint at this point of the move');
      }
    } finally {
      await t.page.mouse.up();
      await f.evaluate(() => { Element.prototype.animate = window.__neutralAnimate; window.setTimeout = window.__neutralTimeout; delete window.__neutralAnimate; delete window.__neutralTimeout; });
    }
  }
}
