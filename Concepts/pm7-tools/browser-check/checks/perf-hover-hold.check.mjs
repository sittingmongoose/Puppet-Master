// Witness for perf-hover-restyle's actual CDP hold/counting path. --set unheld=1 reproduces the former noisy clock.
import { withAnimationHold } from '../helpers/animation-hold.mjs';
import { trace, restyled } from './perf-hover-restyle.check.mjs';

export default async function (t) {
 const f = await t.app.open({ query: 'pm-warm=0' });
 await t.viewport(1920, 1080);
 await f.evaluate(() => {
  const style = document.createElement('style');
  style.textContent = `#m-hold-proof{position:fixed;z-index:2147483646;left:300px;top:200px;width:160px;height:100px;background:white}
   #m-hold-loop{width:20px;height:20px;animation:m-hold-loop 900ms linear infinite}
   @keyframes m-hold-loop{to{transform:rotate(360deg)}}
   #m-hold-input{display:block;width:120px;height:60px;background-color:rgb(0,0,0);transition:background-color 900ms linear}
   #m-hold-input:hover{background-color:rgb(240,240,240)}
   [data-m-css-held] #m-hold-loop{animation-play-state:paused!important}`;
  const box = document.createElement('div'); box.id = 'm-hold-proof';
  box.innerHTML = '<div id="m-hold-loop"></div><button id="m-hold-input">input</button>';
  document.head.append(style); document.body.append(box);
  window.__mHoldProof = { style, box, transitions: [] };
  box.addEventListener('transitionrun', (e) => window.__mHoldProof.transitions.push(e.propertyName));
 });
 const cdp = await t.page.context().newCDPSession(t.page);
 const animationCdp = await t.page.context().newCDPSession(f);
 const read = () => f.evaluate(() => ({ time: document.getElementById('m-hold-loop').getAnimations()[0]?.currentTime, transitions: window.__mHoldProof.transitions }));
 try {
  // Arm after placing the pointer outside: only the real input into the button is marked.
  await t.page.mouse.move(1200, 900);
  await f.evaluate(() => {
   document.addEventListener('pointermove', (e) => { if (e.target.id === 'm-hold-input') performance.mark('jr:hold:1'); }, { capture: true, once: true });
  });
  await t.page.waitForTimeout(150);
  let before, after;
  const measure = async () => {
   before = await read();
   const events = await trace(cdp, async () => { await t.page.mouse.move(360, 250); await t.page.waitForTimeout(180); });
   after = await read();
   return restyled(events, 'jr:hold:');
  };
  const counts = String(t.args.unheld || '0') === '1' ? await measure() : await withAnimationHold(animationCdp, f, measure);
  await t.check('existing animation clock is held throughout the input trace', Number.isFinite(before.time) && Math.abs(after.time - before.time) < 0.1, JSON.stringify({ before, after }));
  await t.check('the input starts a transition and its first restyle is measured while held', after.transitions.includes('background-color') && counts.length === 1 && counts[0] > 0, JSON.stringify({ transitions: after.transitions, counts }));
  const a = await read(); await t.page.waitForTimeout(100); const b = await read();
  await t.check('DevTools hold restores animation-clock progress', b.time - a.time > 20, `${a.time} -> ${b.time}`);
  await f.evaluate(() => document.documentElement.setAttribute('data-m-css-held', ''));
  await t.page.waitForTimeout(80);
  const paused = await f.evaluate(() => { const a = document.getElementById('m-hold-loop').getAnimations()[0]; return { state: a.playState, time: a.currentTime }; });
  await t.page.waitForTimeout(100);
  const held = await read();
  await t.check('CSS animation-play-state still controls the animation after restoration', paused.state === 'paused' && Math.abs(paused.time - held.time) < 0.1, JSON.stringify({ paused, held }));
 } finally {
  await cdp.detach();
  await animationCdp.detach();
  await f.evaluate(() => { document.documentElement.removeAttribute('data-m-css-held'); window.__mHoldProof.style.remove(); window.__mHoldProof.box.remove(); delete window.__mHoldProof; });
 }
}
