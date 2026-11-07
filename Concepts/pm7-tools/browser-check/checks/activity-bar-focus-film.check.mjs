// FO-96 / F96b-1, F96b-2: a film of the key focus mark on the open panel's icon in Glass Dark and Glass Light, where
// Liquid Glass's lens carries it. Tab to Files (the open panel), Enter (at 1920 it closes the panel), Enter again (it
// opens), a real click on the focused icon (it closes), Enter (it opens), Tab to Search, Enter (the panel changes to
// Search). Each step is marked on the film, and the mark's state is asserted after it: a key-focused icon carries a mark,
// its own (a 3 px accent outline on its tile) or the lens's (data-lg-focus on a lens painted at rest on it), never
// neither. Record with --record /abs/file.mp4 (GPU, 1920x1080); `browser-check frames <film> --run <folder>` gives the
// frames after each mark. --set looks=glass-dark limits the looks.
const LOOKS_FILM = ['glass-dark', 'glass-light'];

function markState(k) {
  const el = document.querySelector(`#activityBar .icon[data-ab-id="${k}"]`), sym = el && el.querySelector('.symbol');
  if (!el || !sym) return { missing: true };
  const cs = getComputedStyle(sym), lens = document.querySelector('#lg-lenses .lg-lens[data-lg-for="rail-icons"]');
  const keyFocus = document.activeElement === el && el.matches(':focus-visible');
  const own = cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 2;
  let onLens = false;
  if (lens && lens.hasAttribute('data-lg-focus') && parseFloat(getComputedStyle(lens).opacity) > 0.5) {
    const a = lens.getBoundingClientRect(), b = sym.getBoundingClientRect();
    onLens = Math.abs((a.left + a.right) / 2 - (b.left + b.right) / 2) <= 3 && Math.abs((a.top + a.bottom) / 2 - (b.top + b.bottom) / 2) <= 3;
  }
  const slot = document.getElementById('sidePanelSlot'), view = document.getElementById(el.getAttribute('data-target') || '');
  return { keyFocus, own, onLens, iconFlag: el.hasAttribute('data-lg-focus'), lensFlag: !!lens && lens.hasAttribute('data-lg-focus'), open: !!slot && !slot.classList.contains('hidden') && !!view && view.classList.contains('active') };
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
  const step = async (look, label, k, act) => {
    await act();
    await f.waitForTimeout(1200);
    const s = await state(k);
    t.log(`${look} ${label}: ${JSON.stringify(s)}`);
    await t.check(`${look} ${label}: the key-focused ${k} carries a mark, its own or the lens's`, !s.keyFocus || s.own || s.onLens, JSON.stringify(s));
  };
  for (const look of looks) {
    await t.app.look(look);
    await f.waitForFunction(() => !window.PM_THEME_TRANSITION?.busy?.() && !window.PM_LOOK_COVERED?.(), null, { timeout: 20000 }).catch(() => {});
    await f.waitForTimeout(800);
    if (!(await state('files')).open) { await tabTo('files'); await kb.press('Enter'); await f.waitForTimeout(800); }
    await step(look, 'Tab to Files (open)', 'files', async () => { await tabTo('files'); await t.mark(`${look}: Tab to Files`); });
    await step(look, 'Enter closes the panel', 'files', async () => { await t.mark(`${look}: Enter on open Files`); await kb.press('Enter'); });
    await step(look, 'Enter opens it again', 'files', async () => { await t.mark(`${look}: Enter on shut Files`); await kb.press('Enter'); });
    await step(look, 'a click on the focused icon closes it', 'files', async () => { await t.mark(`${look}: click on focused Files`); await f.locator('#activityBar .icon[data-ab-id="files"]').click(); await t.page.mouse.move(1880, 1040); });
    await step(look, 'Enter opens it again', 'files', async () => { await t.mark(`${look}: Enter on shut Files (after click)`); await kb.press('Enter'); });
    await step(look, 'Tab to Search', 'search', async () => { await kb.press('Tab'); await t.mark(`${look}: Tab to Search`); });
    await step(look, 'Enter changes the panel to Search', 'search', async () => { await t.mark(`${look}: Enter on Search`); await kb.press('Enter'); });
    await tabTo('files'); await kb.press('Enter'); await f.waitForTimeout(800);
  }
  await f.evaluate(() => document.getElementById('fo96-film-s')?.remove());
}
