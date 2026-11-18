// Permanent negative controls: these runs MUST FAIL the existing edge assertion.
// Run explicitly (outside checks/): --set page=<FO-235 page> --set sandbox=0|1.
import { tests as switcher } from '../checks/switcher-carry-steps.check.mjs';
const run = Object.values(switcher)[0];
export const tests = Object.fromEntries(['a', 'b'].map(half => [`negative control: one painted frame with ${half === 'a' ? 'left' : 'right'} half corner/rim corruption (must FAIL)`, async t => {
 Object.assign(t.args, { looks: 'friendly-light', groups: 'home', modes: 'motion' });
 const open = t.app.open.bind(t.app);
 t.app.open = async (...args) => {
  const f = await open(...args);
  await f.evaluate(half => {
   window.__chipNegativeHits = [];
   new MutationObserver(rs => { for (const r of rs) for (const n of r.addedNodes) if (n.nodeType === 1 && n.matches('.lg-carry')) {
    requestAnimationFrame(() => {
     const skin = n.querySelector(`[data-half=${half}] .lg-carry-skin`); if (!skin) return;
     const radius = skin.style.borderRadius, shadow = skin.style.boxShadow;
     skin.style.borderRadius = '0px'; skin.style.boxShadow = 'inset 0 0 0 7px rgb(255, 0, 0)';
     window.__chipNegativeHits.push({ half, at: performance.now() });
     requestAnimationFrame(() => { skin.style.borderRadius = radius; skin.style.boxShadow = shadow; });
    });
   } }).observe(document.body, { subtree: true, childList: true });
  }, half);
  return f;
 };
 try { await run(t); await t.check('negative control actually injected painted parts', await t.root.evaluate(() => window.__chipNegativeHits.length > 0)); }
 finally { t.app.open = open; }
}]));
