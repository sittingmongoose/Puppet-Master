// FO-91: the background-activity concept's standalone page shows exactly one Processes in the chat. Build the page with
// `python3 -I -B background-activity/opus-5.5/tools/build_standalone.py background-activity/opus-5.5 <PMConcept7 build>
// <out>.html` (from Concepts/) and pass it with --set page=. The chat has had its own Processes domain since
// 2026-10-29; the concept's injected button and Activity Detail tab must stand down where the chat shows it and stay
// where it does not. On a page without the concept's layer this check records a skip.
import pod from './pod-clearance.check.mjs';
import { installOracle, readFit, valid, strip } from './activity-fit-visible.check.mjs';

const WIDTHS = [900, 860, 820, 800, 780, 760, 740, 720, 700, 680, 660, 640, 620, 600, 580, 560, 540, 520, 500, 480, 460, 440, 420, 400,
  440, 480, 520, 560, 600, 640, 680, 720, 760, 800, 860, 900];

// Processes items in the live strip (the chat's carry data-domain, the concept's data-rw-domain) or in a filter.
function census(sel) {
  const box = document.querySelector(sel);
  if (!box) return null;
  const kids = [...box.children];
  const isProc = e => e.getAttribute('data-domain') === 'processes' || e.getAttribute('data-rw-domain') === 'processes' ||
    e.getAttribute('data-rw-tab') === 'processes' || /^processes$/i.test((e.querySelector('.label, span')?.textContent || '').trim());
  const proc = kids.filter(isProc);
  return { items: kids.map(e => e.getAttribute('data-rw-domain') || e.getAttribute('data-rw-tab') ? 'rw:processes' : e.getAttribute('data-domain')),
    processes: proc.length, chat: proc.filter(e => e.getAttribute('data-domain') === 'processes').length, injected: proc.filter(e => e.hasAttribute('data-rw-domain') || e.hasAttribute('data-rw-tab')).length };
}
const STRIP = '#pmRoot .activity-wrap > :is(.activity-bar, .pm56-activity-bar)';

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
  if (!await f.evaluate(() => !!document.getElementById('rw-boot'))) { t.log('not the background-activity page (no #rw-boot): skipped'); return; }
  await f.waitForFunction(() => window.RW_THREAD && document.getElementById('rw-css'), null, { timeout: 20000 });
  await f.evaluate(installOracle);
  const setWidth = async w => { await f.evaluate(w => PMW.chatCol.setWidth(w), w); await t.settle(); };

  // Query: the chat shows its own Processes, so the concept's button stands down, at every width of the sweep.
  await t.viewport(1920, 1100); await t.settle();
  const rows = [], bad = [];
  for (const w of WIDTHS) {
    await setWidth(w); await f.waitForTimeout(300);
    const c = await f.evaluate(census, STRIP), r = await readFit(f);
    rows.push({ w, ...c, tier: r.tier, client: r.width, scroll: r.scroll });
    if (!c || c.processes !== 1 || !valid(r)) bad.push({ w, ...c, fit: JSON.parse(strip(r)) });
  }
  t.log(JSON.stringify({ query: rows }));
  await t.check('Query: exactly one Processes in the strip at 36 widths, and it fits', bad.length === 0, JSON.stringify({ n: bad.length, first: bad.slice(0, 3) }));

  // The chat's own Activity Detail, opened from its Processes item: one Processes tab in its filter.
  const own = f.locator(`${STRIP} > [data-domain="processes"]`).first();
  if (await own.count()) {
    await own.click();
    await f.waitForSelector('#pmRoot .activity-panel .activity-filter', { state: 'attached', timeout: 5000 });
    await t.settle(); await f.waitForTimeout(400);
    const filt = await f.evaluate(census, '#pmRoot .activity-panel .activity-filter');
    t.log(JSON.stringify({ filter: filt }));
    await t.check('Activity Detail: exactly one Processes tab', filt && filt.processes === 1, JSON.stringify(filt));
    await f.evaluate(() => document.querySelector('#pmRoot .activity-panel [data-action="close-activity"]')?.click());
    await t.settle();
  } else await t.check('Query shows the chat\'s own Processes item', false, JSON.stringify(await f.evaluate(census, STRIP)));

  // A thread where the chat has no Processes: the concept's button is injected, once.
  const ids = await f.evaluate(() => [...document.querySelectorAll('.thread-row[data-id]')].map(e => e.dataset.id));
  let found = null;
  for (const id of ids) {
    if (id === 'query') continue;
    await f.evaluate(id => PM56_DEMO.selectThread(id), id); await t.settle(); await f.waitForTimeout(400);
    const c = await f.evaluate(census, STRIP);
    if (c && c.chat === 0) { found = { id, ...c }; break; }
  }
  t.log(JSON.stringify({ withoutChatProcesses: found }));
  await t.check('a thread without the chat\'s Processes shows the concept\'s injected one, once', !!found && found.processes === 1 && found.injected === 1, JSON.stringify(found));
  await f.evaluate(() => PM56_DEMO.selectThread('query')); await t.settle();
}
