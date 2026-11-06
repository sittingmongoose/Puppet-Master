// FO-76 film companion, for 60 fps GPU recordings (`--record`): the reported route (NieR Dark, 1512×982, six hidden-
// render/reveal cycles at column 560) and, in every look, a real drag of the column handle across the Activity strip's
// label boundary and back, with a mark at each sampled tier change so the frames around every painted change can be
// pulled. Same oracle and drag as activity-fit-visible. `--set looks=a,b` films a subset.
import pod from './pod-clearance.check.mjs';
import { LOOKS } from '../browser-check.config.mjs';
import { installOracle, readFit, boundaryDrag, valid, strip } from './activity-fit-visible.check.mjs';

export default async function(t) {
  const previous = { width: t.args.width, only: t.args.only };
  t.args.width = 1512; t.args.only = 'query';
  try { await pod(t); } finally {
    for (const key of ['width', 'only']) {
      if (previous[key] === undefined) delete t.args[key];
      else t.args[key] = previous[key];
    }
  }
  const f = t.root;

  await t.viewport(1512, 982);
  await f.evaluate(() => PMW.chatCol.setWidth(560));
  await t.settle();
  const reveals = [];
  for (let i = 0; i < 6; i++) {
    await f.evaluate(() => PMW.chatCol.setVisible(false));
    await f.waitForFunction(() => document.querySelector('#chatPanel').getBoundingClientRect().width === 0);
    await f.evaluate(() => { PM56_DEMO.setVariant(3, 1); PM56_DEMO.setVariant(3, 0); });
    await t.mark(`reveal ${i}`);
    await f.evaluate(() => PMW.chatCol.setVisible(true));
    await f.waitForTimeout(1000);
    const r = await readFit(f);
    reveals.push(r);
    await t.mark(`revealed ${i} ${r.scroll - r.width > 1 ? 'overflow' : 'fits'} client ${r.width} scroll ${r.scroll}`);
  }
  await t.check('film: every reveal fits', reveals.every(r => r.scroll - r.width <= 1 && valid(r)), JSON.stringify(reveals.map(r => JSON.parse(strip(r)))));

  await t.viewport(1920, 1050);
  for (const look of t.args.looks ? String(t.args.looks).split(',') : LOOKS) {
    await t.app.look(look);
    await f.evaluate(installOracle);
    await f.evaluate(() => PMW.chatCol.setWidth(800));
    await t.settle();
    await t.mark(`${look} drag start`);
    await boundaryDrag(t, f, `${look} film`, async (s, prev) => {
      if (prev && s.tier !== prev.tier) await t.mark(`${look} tier ${prev.tier}->${s.tier} available ${s.available.toFixed(1)} need ${s.need.toFixed(1)}`);
    });
    await t.mark(`${look} drag end`);
  }
  await t.app.look('nier-dark');
}
