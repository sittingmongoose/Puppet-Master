// FO-85: a screen change made while the previous change is still held must not strand the screen before it.
// A new onboarding screen is built held and released two frames later (60-ui-core.js transition, O55.motion.release);
// a change made inside that hold removes the held screen, and the screen before it must still leave. Two pairs, each
// on a fresh window: "same task" (two O55.ui.go calls back to back) and "next frame" (the second call one animation
// frame later, still inside the first change's hold, as a person's quick second press lands on a loaded machine).
// After each pair: the owner's settle signal arrives, exactly one screen layer is left, it is the last screen asked
// for, and no layer is still leaving (o55-out) or held (o55-hold). --set from=, mid=, to= pick the screens.
export default async function (t) {
  const from = String(t.args.from || 'welcome'), mid = String(t.args.mid || 'where'), to = String(t.args.to || 'look');
  for (const pair of ['same task', 'next frame']) {
    const f = await t.app.open({ onboarding: true, query: 'o55=fresh' });
    await f.waitForFunction(() => window.O55?.S?.open && O55.S.root?.isConnected);
    await f.evaluate(s => O55.ui.go(s, { noHistory: true }), from);
    const calm = () => {
      const r = document.getElementById('pm-o55-onboarding'), ls = [...r.querySelectorAll('.o55-pane > .o55-layer')];
      return ls.length === 1 && !ls[0].matches('.o55-out, .o55-hold, .o55-entering') && !r.classList.contains('o55-hold');
    };
    await t.check(`${pair}: the window starts settled on ${from}`, await f.waitForFunction(calm, null, { timeout: 15000 }).then(() => true, () => false), '', { hard: true });
    await t.mark(`${pair} pair`);
    const held = await f.evaluate(([mid, to, pair]) => new Promise(res => {
      O55.ui.go(mid, { noHistory: true });
      const second = () => {
        const first = document.querySelector('#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out)');
        const wasHeld = !!first && first.classList.contains('o55-hold') && first.dataset.screen === mid;
        O55.ui.go(to, { noHistory: true });
        res(wasHeld);
      };
      if (pair === 'same task') second(); else requestAnimationFrame(second);
    }), [mid, to, pair]);
    await t.check(`${pair}: the second change landed inside the first one's hold`, held, '', { hard: true });
    const settled = await f.waitForFunction(calm, null, { timeout: 6000 }).then(() => true, () => false);
    await t.mark(`${pair} ${settled ? 'settled' : 'not settled'}`);
    const state = await f.evaluate(() => [...document.querySelectorAll('#pm-o55-onboarding .o55-pane > .o55-layer')].map(l => ({ screen: l.dataset.screen, classes: [...l.classList].filter(c => c !== 'o55-layer') })));
    await t.check(`${pair}: the settle signal arrives (one layer, nothing leaving or held)`, settled, JSON.stringify(state));
    await t.check(`${pair}: exactly one screen layer is left`, state.length === 1, JSON.stringify(state));
    await t.check(`${pair}: the layer left is ${to}`, state.length >= 1 && state[state.length - 1].screen === to && !state[state.length - 1].classes.includes('o55-out'), JSON.stringify(state));
    await t.check(`${pair}: no layer is still leaving or held`, !state.some(l => l.classes.includes('o55-out') || l.classes.includes('o55-hold')), JSON.stringify(state));
    if (t.args.shots) await t.shot(`${pair} after`, `${pair}: the window 6 s after the pair (base strands ${from} under ${to})`);
    await t.page.waitForTimeout(Number(t.args.hold || 0));
  }
}
