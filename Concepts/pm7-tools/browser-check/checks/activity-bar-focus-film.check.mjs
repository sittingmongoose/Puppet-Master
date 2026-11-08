// FO-96 / F96b-1, F96b-2: a film of the key focus mark on the open panel's icon in Glass Dark and Glass Light, where
// Liquid Glass's lens carries it. Tab to Files (the open panel), Enter (at 1920 it closes the panel), Enter again (it
// opens), a real click on the focused icon (it closes), Enter (it opens), Tab to Search, Enter (the panel changes to
// Search). Each step is marked on the film, and three things are asserted after it (F96-1 round 6, astra-review-g8 A):
// the key focus is on the step's icon (it is the active element and matches :focus-visible); that icon carries a mark,
// its own (a 3 px accent outline on its tile) or the lens's (data-lg-focus on a lens painted at rest on it), never
// neither; and the panels are as the step says (Files open or shut, Search open or not). A Tab that can't reach its icon
// stops the test at once. No step here means to lose the key focus: a click on the key-focused icon keeps it, so a
// press that drops it fails. Record with --record /abs/file.mp4 (GPU, 1920x1080); `browser-check frames <film> --run
// <folder>` gives the frames after each mark. --set looks=glass-dark limits the looks.
const LOOKS_FILM = ['glass-dark', 'glass-light'];

function markState(k) {
  const el = document.querySelector(`#activityBar .icon[data-ab-id="${k}"]`), sym = el && el.querySelector('.symbol');
  const slot = document.getElementById('sidePanelSlot');
  const isOpen = id => { const i = document.querySelector(`#activityBar .icon[data-ab-id="${id}"]`), v = i && document.getElementById(i.getAttribute('data-target') || '');
    return !!slot && !slot.classList.contains('hidden') && !!v && v.classList.contains('active'); };
  const a = document.activeElement;
  const active = !a || a === document.body ? 'body' : (a.getAttribute('data-ab-id') || a.id || a.tagName.toLowerCase());
  if (!el || !sym) return { missing: true, active, files: isOpen('files'), search: isOpen('search') };
  const cs = getComputedStyle(sym), lens = document.querySelector('#lg-lenses .lg-lens[data-lg-for="rail-icons"]');
  const keyFocus = a === el && el.matches(':focus-visible');
  const ink = cs.outlineColor.match(/[\d.]+/g) || [];
  const own = cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 2 && (ink.length < 4 || parseFloat(ink[3]) > 0);
  let onLens = false;
  if (lens && lens.hasAttribute('data-lg-focus') && parseFloat(getComputedStyle(lens).opacity) > 0.5) {
    const l = lens.getBoundingClientRect(), b = sym.getBoundingClientRect();
    onLens = Math.abs((l.left + l.right) / 2 - (b.left + b.right) / 2) <= 3 && Math.abs((l.top + l.bottom) / 2 - (b.top + b.bottom) / 2) <= 3;
  }
  return { active, keyFocus, own, onLens, iconFlag: el.hasAttribute('data-lg-focus'), lensFlag: !!lens && lens.hasAttribute('data-lg-focus'), files: isOpen('files'), search: isOpen('search') };
}

export default async function (t) {
  await t.viewport(1920, 1080);
  const f = await t.app.open();
  const kb = t.page.keyboard;
  await f.evaluate(() => { try { PMW.chatCol.show(); } catch (e) { /* none */ } });
  await t.page.mouse.move(1880, 1040);
  const looks = t.args.looks ? String(t.args.looks).split(',') : LOOKS_FILM;
  const state = k => f.evaluate(markState, k);
  const sentinel = () => f.evaluate(() => { document.getElementById('fo96-film-s')?.remove(); const b = document.createElement('button'); b.id = 'fo96-film-s'; b.type = 'button'; b.setAttribute('aria-label', 'film sentinel');
    Object.assign(b.style, { position: 'fixed', left: '0', top: '0', width: '1px', height: '1px', opacity: '0', padding: '0', border: '0' }); const bar = document.getElementById('activityBar'); bar.parentNode.insertBefore(b, bar); b.focus(); });
  const tabTo = async k => { await sentinel(); for (let i = 0; i < 16; i++) { await kb.press('Tab'); if (await f.evaluate(k => document.activeElement?.getAttribute('data-ab-id') === k, k)) return true; } return false; };
  // A Tab walk from just before the bar must reach the icon, or the test stops here: the steps after it would act elsewhere.
  const reach = async (look, k, why) => {
    const ok = await tabTo(k);
    await t.check(`${look}: Tab from the bar's start reaches ${k} (${why})`, ok, ok ? 'reached' : `16 Tabs never focused ${k}; the focus is on ${JSON.stringify((await state(k)).active)}`, { hard: true });
  };
  const step = async (look, label, k, want, act) => {
    await act();
    await f.waitForTimeout(1200);
    const s = await state(k);
    t.log(`${look} ${label}: ${JSON.stringify(s)}`);
    await t.check(`${look} ${label}: the key focus is on ${k}`, s.active === k && s.keyFocus === true, JSON.stringify(s));
    await t.check(`${look} ${label}: the key-focused ${k} carries a mark, its own or the lens's`, s.keyFocus === true && (s.own || s.onLens),
      s.keyFocus ? JSON.stringify(s) : `no key focus on ${k} to carry a mark: ${JSON.stringify(s)}`);
    await t.check(`${look} ${label}: Files is ${want.files ? 'open' : 'shut'} and Search ${want.search ? 'open' : 'not open'}`, s.files === want.files && s.search === want.search,
      `files ${s.files}, search ${s.search}; wanted files ${want.files}, search ${want.search}`);
  };
  const filesOpen = { files: true, search: false }, shut = { files: false, search: false }, searchOpen = { files: false, search: true };
  for (const look of looks) {
    await t.app.look(look);
    await f.waitForFunction(() => !window.PM_THEME_TRANSITION?.busy?.() && !window.PM_LOOK_COVERED?.(), null, { timeout: 20000 }).catch(() => {});
    await f.waitForTimeout(800);
    if (!(await state('files')).files) { await reach(look, 'files', 'to open Files first'); await kb.press('Enter'); await f.waitForTimeout(800); }
    await t.check(`${look}: Files is open before the film's steps`, (await state('files')).files, JSON.stringify(await state('files')), { hard: true });
    await step(look, 'Tab to Files (open)', 'files', filesOpen, async () => { await reach(look, 'files', 'the film\'s first step'); await t.mark(`${look}: Tab to Files`); });
    await step(look, 'Enter closes the panel', 'files', shut, async () => { await t.mark(`${look}: Enter on open Files`); await kb.press('Enter'); });
    await step(look, 'Enter opens it again', 'files', filesOpen, async () => { await t.mark(`${look}: Enter on shut Files`); await kb.press('Enter'); });
    await step(look, 'a click on the focused icon closes it', 'files', shut, async () => { await t.mark(`${look}: click on focused Files`); await f.locator('#activityBar .icon[data-ab-id="files"]').click(); await t.page.mouse.move(1880, 1040); });
    await step(look, 'Enter opens it again', 'files', filesOpen, async () => { await t.mark(`${look}: Enter on shut Files (after click)`); await kb.press('Enter'); });
    await step(look, 'Tab to Search', 'search', filesOpen, async () => { await kb.press('Tab'); await t.mark(`${look}: Tab to Search`); });
    await step(look, 'Enter changes the panel to Search', 'search', searchOpen, async () => { await t.mark(`${look}: Enter on Search`); await kb.press('Enter'); });
    await reach(look, 'files', 'to open Files again for the next look'); await kb.press('Enter'); await f.waitForTimeout(800);
  }
  await f.evaluate(() => document.getElementById('fo96-film-s')?.remove());
}
