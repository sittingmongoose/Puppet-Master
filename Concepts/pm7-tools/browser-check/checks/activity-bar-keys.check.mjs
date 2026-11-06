// FO-96: the Activity bar (the left rail, #activityBar) is worked by keys. Every Activity item and More is a button in
// the tab order, as in the product's other bars (the chat's Activity strip, its Activity domains toolbar, the title bar,
// the Debug transport): none of them roves with arrow keys. Each is named, shows a painted focus ring of 3:1 on a key
// focus in every look, lit or not (NieR: its target brackets; Friendly Light held back for FO-99), and Enter and Space work it; More also opens on ArrowDown, its menu takes the focus, and Escape gives it back to
// More. The chat strip's FO-76 sizer copies stay inert and out of the tab order. Both surfaces (`--set sandbox=0|1`).
// `--set looks=basic-dark,nier-light` limits the focus-ring pass (all ten by default); `--set crops=1` crops the bar
// with More and with lit Chat focused in each look; `--set fo99=1` holds Friendly Light to 3:1 as well.
import { LOOKS } from '../browser-check.config.mjs';

const frames = (f, n = 3) => f.evaluate(async n => { for (let i = 0; i < n; i++) await new Promise(requestAnimationFrame); }, n);

// What has the focus, in the app's frame.
function focused() {
  const a = document.activeElement;
  if (!a || a === document.body) return { key: 'body' };
  const sizer = !!a.closest('.activity-sizer'), menu = a.closest('.pmr-menu');
  return { key: a.getAttribute('data-ab-id') || a.getAttribute('data-domain') || a.id || a.tagName.toLowerCase(), bar: !!a.closest('#activityBar'),
    sizer, menu: menu ? menu.getAttribute('data-pmr-menu') : null, wrap: !!a.closest('.activity-wrap'), label: a.getAttribute('aria-label') || a.textContent.trim().slice(0, 40) };
}

// A focusable 1 px button placed just before `sel`, out of flow, so one Tab from it is the first control after it.
function placeSentinel([sel, where]) {
  document.getElementById('fo96-sentinel')?.remove();
  const b = document.createElement('button');
  b.id = 'fo96-sentinel'; b.type = 'button'; b.setAttribute('aria-label', 'FO-96 sentinel');
  Object.assign(b.style, { position: 'fixed', left: '0', top: '0', width: '1px', height: '1px', opacity: '0', padding: '0', border: '0', margin: '0', pointerEvents: 'none' });
  const ref = document.querySelector(sel);
  if (!ref) return false;
  ref.parentNode.insertBefore(b, where === 'after' ? ref.nextSibling : ref);
  return true;
}

// The rail's controls as a person sees them, in DOM order (the toggle is the bar's last control).
function railControls() {
  const shown = e => e.getClientRects().length > 0 && getComputedStyle(e).visibility !== 'hidden';
  return [...document.querySelectorAll('#activityBar .icon[data-ab-id], #activityBar > .activity-bar-toggle')].filter(shown)
    .map(e => ({ key: e.getAttribute('data-ab-id') || e.id, target: e.getAttribute('data-target') }));
}

// The focus ring, judged from painted pixels as back-focus-ring does (F96-1: a computed outline passed an accent ring on
// an accent tile that cannot be seen): the control's box and 9 px round it are captured with the focus off the bar and
// again 450 ms after a real key puts the focus on it. At least 40 pixels must change by more than 40 luminance levels,
// at a median contrast of 3:1 or more against what was painted there before (WCAG 1.4.11). NieR's mark is its own
// target brackets (#o55np-reticle), which the same capture sees.
const lum = (r, g, b) => { const c = [r, g, b].map(v => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
function boxOf(key) {
  const el = key === 'activityBarToggle' ? document.getElementById(key) : document.querySelector(`#activityBar .icon[data-ab-id="${key}"]`);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { x: r.x, y: r.y, w: r.width, h: r.height, lit: el.classList.contains('active') };
}
function paintDiff(rest, focus) {
  let changed = 0; const ratios = [];
  for (let i = 0; i < rest.data.length; i += 4) {
    const d = 0.2126 * (focus.data[i] - rest.data[i]) + 0.7152 * (focus.data[i + 1] - rest.data[i + 1]) + 0.0722 * (focus.data[i + 2] - rest.data[i + 2]);
    if (Math.abs(d) <= 40) continue;
    const a = lum(rest.data[i], rest.data[i + 1], rest.data[i + 2]), c = lum(focus.data[i], focus.data[i + 1], focus.data[i + 2]);
    changed++; ratios.push((Math.max(a, c) + 0.05) / (Math.min(a, c) + 0.05));
  }
  ratios.sort((p, q) => p - q);
  return { changed, median: ratios.length ? +ratios[Math.floor(ratios.length / 2)].toFixed(2) : 0 };
}
const ringPainted = r => !!r && r.focused && r.changed >= 40 && r.median >= 3;

function panelState(key) {
  const ic = document.querySelector(`#activityBar .icon[data-ab-id="${key}"]`), slot = document.getElementById('sidePanelSlot');
  const view = ic && ic.getAttribute('data-target') && document.getElementById(ic.getAttribute('data-target'));
  return { active: !!ic && ic.classList.contains('active'), open: !!slot && !slot.classList.contains('hidden') && !!view && view.classList.contains('active') };
}
function moreState() {
  const m = document.querySelector('.pmr-menu[data-pmr-menu="d-ab-more"]'), btn = document.getElementById('abMoreBtn');
  const shown = !!m && m.isConnected && getComputedStyle(m).display !== 'none' && m.getClientRects().length > 0;
  return { open: shown, expanded: btn && btn.getAttribute('aria-expanded'), items: shown ? [...m.querySelectorAll('.pmr-mi')].map(b => b.textContent.trim()) : [],
    focusIn: shown && m.contains(document.activeElement), focusOnMore: document.activeElement === btn };
}

export default async function (t) {
  await t.viewport(1920, 1100);
  const f = await t.app.open();
  const kb = t.page.keyboard;
  const surface = (await f.evaluate(() => window.top !== window)) ? 'sandbox' : 'normal';
  t.log(`surface ${surface}`);
  await f.waitForFunction(() => !!document.getElementById('abMoreBtn') && !!document.querySelector('#activityBar .icon[data-ab-id]'), null, { timeout: 20000 });
  await frames(f);
  const key = () => f.evaluate(focused);
  const sentinel = async (sel, where = 'before') => { await f.evaluate(placeSentinel, [sel, where]); await f.locator('#fo96-sentinel').focus(); };

  // 1. Tab from just before the bar walks every visible control in order, then leaves; Shift+Tab walks back.
  const controls = await f.evaluate(railControls);
  t.log('rail controls ' + controls.map(c => c.key).join(' '));
  await sentinel('#activityBar');
  const forward = [];
  for (let i = 0; i < controls.length; i++) {
    await kb.press('Tab');
    const k = await key();
    forward.push(k.key);
  }
  await kb.press('Tab');
  const after = await key();
  await t.check('Tab reaches every Activity item and More in order', JSON.stringify(forward) === JSON.stringify(controls.map(c => c.key)),
    `expected ${controls.map(c => c.key).join(' ')}; got ${forward.join(' ')}`);
  await t.check('Tab leaves the bar after its last control', !after.bar && !after.sizer, JSON.stringify(after));
  const back = [];
  for (let i = 0; i < controls.length; i++) { await kb.press('Shift+Tab'); back.push((await key()).key); }
  await t.check('Shift+Tab walks the bar back', JSON.stringify(back) === JSON.stringify(controls.map(c => c.key).reverse()), back.join(' '));
  // the painted ring on every control, each reached by Tab from the sentinel
  const fe = surface === 'sandbox' ? await f.frameElement() : null, off = fe ? await fe.boundingBox() : { x: 0, y: 0 };
  const painted = async (target, reach) => {
    await sentinel('#activityBar');
    await f.waitForTimeout(300);
    const b = await f.evaluate(boxOf, target);
    if (!b) return null;
    const P = 9, x = Math.max(0, Math.floor(off.x + b.x) - P), y = Math.max(0, Math.floor(off.y + b.y) - P);
    const region = { x, y, width: Math.ceil(off.x + b.x + b.w) + P + 1 - x, height: Math.ceil(off.y + b.y + b.h) + P + 1 - y };
    const rest = await t.pixels(region);
    await reach();
    await f.waitForTimeout(450);
    const now = await key();
    const focus = await t.pixels(region);
    return { key: target, lit: b.lit, focused: now.key === target, ...paintDiff(rest, focus) };
  };
  const byTab = target => async () => { for (let i = 0; i < controls.length; i++) { await kb.press('Tab'); if ((await key()).key === target) return; } };
  await t.page.mouse.move(off.x + 1200, off.y + 600);
  const paint1 = [];
  for (const c of controls) paint1.push(await painted(c.key, byTab(c.key)));
  t.log('painted rings ' + JSON.stringify(paint1));
  const faint = paint1.filter(r => !ringPainted(r));
  await t.check('each control shows a painted focus ring of 3:1 or more on a key focus', faint.length === 0, faint.length ? JSON.stringify(faint) : 'all ' + paint1.length);

  // 2. Each control is a named button (Playwright's own accessibility tree, as a screen reader gets it).
  const named = [];
  for (const c of controls) {
    const loc = c.key === 'activityBarToggle' ? f.locator('#activityBarToggle') : f.locator(`#activityBar .icon[data-ab-id="${c.key}"]`);
    const snap = (await loc.ariaSnapshot()).split('\n')[0];
    named.push({ key: c.key, snap, ok: /^- button "[^"]*[A-Za-z][^"]*"/.test(snap) });   // a word, not ">" 
  }
  t.log('names ' + named.map(n => n.snap.replace(/^- /, '')).join(', '));
  const unnamed = named.filter(n => !n.ok);
  await t.check('each control is a button with a name', unnamed.length === 0, unnamed.length ? JSON.stringify(unnamed) : named.map(n => n.snap.replace(/^- /, '')).join(', '));

  // 3. Enter and Space work every panel item and Chat (focused by the keyboard: Tab from the sentinel).
  const tabTo = async target => {
    await sentinel('#activityBar');
    for (let i = 0; i < controls.length; i++) { await kb.press('Tab'); if ((await key()).key === target) return true; }
    return false;
  };
  for (const c of controls.filter(c => c.target)) {
    const reached = await tabTo(c.key);
    const s0 = await f.evaluate(panelState, c.key);
    if (reached) { await kb.press('Enter'); await frames(f, 4); }
    const s1 = await f.evaluate(panelState, c.key);
    const enterOk = reached && (s0.active && s0.open ? !s1.active && !s1.open : s1.active && s1.open);
    if (reached) { await kb.press(' '); await frames(f, 4); }
    const s2 = await f.evaluate(panelState, c.key);
    const spaceOk = reached && s2.active === s0.active && s2.open === s0.open;
    const still = await key();
    await t.check(`${c.key}: Enter and Space work its panel`, enterOk && spaceOk && still.key === c.key,
      JSON.stringify({ reached, before: s0, enter: s1, space: s2, focus: still.key }));
  }
  // leave Files open, as the page starts
  if (controls.some(c => c.key === 'files') && !(await f.evaluate(panelState, 'files')).open && await tabTo('files')) { await kb.press('Enter'); await frames(f, 4); }
  if (controls.some(c => c.key === 'chat')) {
    const chatState = () => f.evaluate(() => ({ lit: document.querySelector('#activityBar .icon[data-ab-id="chat"]').classList.contains('active'), width: Math.round(document.getElementById('chatPanel')?.getBoundingClientRect().width || 0) }));
    const reached = await tabTo('chat');
    const c0 = await chatState();
    if (reached) { await kb.press('Enter'); await f.waitForTimeout(900); }
    const c1 = await chatState();
    if (reached) { await kb.press(' '); await f.waitForTimeout(900); }
    const c2 = await chatState();
    await t.check('chat: Enter and Space switch the chat column', reached && c1.lit !== c0.lit && (c1.width > 0) === c1.lit && c2.lit === c0.lit && (c2.width > 0) === c2.lit,
      JSON.stringify({ reached, before: c0, enter: c1, space: c2 }));
  }

  // 4. More opens its menu on Enter, Space and ArrowDown, the focus goes into it, Escape returns it to More. First with
  // nothing hidden (the menu says how to hide an icon), then with Docker dragged onto More by the real pointer, where
  // the focus lands on the hidden icon's row and Enter on it puts the icon back.
  // the menu closes through its exit motion: judge it once that has run
  const menuGone = () => f.waitForFunction(() => { const m = document.querySelector('.pmr-menu[data-pmr-menu="d-ab-more"]'); return !m || !m.isConnected || !m.getClientRects().length || getComputedStyle(m).display === 'none'; }, null, { timeout: 2000 }).catch(() => {});
  const moreCase = async label => {
    for (const k of ['Enter', ' ', 'ArrowDown']) {
      const reached = await tabTo('more');
      if (reached) { await kb.press(k); await f.waitForFunction(() => { const m = document.querySelector('.pmr-menu[data-pmr-menu="d-ab-more"]'); return !!m && m.getClientRects().length > 0 && m.contains(document.activeElement); }, null, { timeout: 2000 }).catch(() => {}); }
      const open = await f.evaluate(moreState);
      if (reached) { await kb.press('Escape'); await menuGone(); }
      const closed = await f.evaluate(moreState);
      await t.check(`More ${label}: ${k === ' ' ? 'Space' : k} opens its menu with the focus in it, Escape returns the focus to More`,
        reached && open.open && open.focusIn && open.expanded === 'true' && !closed.open && closed.focusOnMore && closed.expanded !== 'true',
        JSON.stringify({ reached, open, closed }));
      if (open.open && !closed.open) continue;
      await f.evaluate(() => { try { PMR.menu.closeAll(); } catch (e) { /* none */ } });
    }
  };
  await moreCase('with nothing hidden');
  const box = async sel => { const b = await f.locator(sel).boundingBox(); return b && { x: b.x + b.width / 2, y: b.y + b.height / 2 }; };
  const docker = await box('#activityBar .icon[data-ab-id="docker"]'), moreAt = await box('#abMoreBtn');
  if (docker && moreAt) {
    await t.page.mouse.move(docker.x, docker.y); await t.page.mouse.down();
    for (let i = 1; i <= 12; i++) await t.page.mouse.move(docker.x + (moreAt.x - docker.x) * i / 12, docker.y + (moreAt.y - docker.y) * i / 12);
    await t.page.mouse.up();
    await t.page.mouse.move(1900, 1080);
    await frames(f, 4);
    const hidden = await f.evaluate(() => !document.querySelector('#activityBar .icon[data-ab-id="docker"]') && document.getElementById('abMoreBtn').getAttribute('data-empty') === '0');
    await t.check('Docker dragged onto More is hidden', hidden, hidden ? 'hidden' : 'still on the bar');
    if (hidden) {
      await moreCase('with Docker hidden');
      const reached = await tabTo('more');
      if (reached) { await kb.press('ArrowDown'); await f.waitForTimeout(400); }
      const open = await f.evaluate(moreState);
      const onRow = await key();
      if (reached && open.open) { await kb.press('Enter'); await menuGone(); await frames(f, 4); }
      t.log('More menu with Docker hidden: rows ' + JSON.stringify(open.items) + ', focus on ' + JSON.stringify(onRow));
      const back = await f.evaluate(() => !!document.querySelector('#activityBar .icon[data-ab-id="docker"]'));
      const end = await f.evaluate(moreState);
      await t.check('More: the hidden icon\'s row, named and not its raw id, takes the focus and Enter puts Docker back, the focus on More',
        reached && open.open && open.items.length === 1 && /docker/i.test(open.items[0]) && open.items[0] !== 'docker' && onRow.menu === 'd-ab-more' && back && !end.open && end.focusOnMore,
        JSON.stringify({ reached, open, onRow, back, end }));
    }
  } else await t.check('Docker and More on the bar for the drag', false, JSON.stringify({ docker, moreAt }));

  // 5. The chat's Activity strip: its items are buttons in the tab order, in order, and the FO-76 sizer copies are
  // inert, unfocusable and never reached by Tab or Shift+Tab.
  await f.evaluate(() => { try { PMW.chatCol.setKeepOpen(true); } catch (e) { /* older page */ } PMW.chatCol.show(); PM56_DEMO.selectThread('query'); });
  await f.waitForFunction(() => !!document.querySelector('#pmRoot :is(.activity-bar, .pm56-activity-bar) .activity-item') && document.getElementById('chatPanel').getBoundingClientRect().width > 0, null, { timeout: 15000 });
  await t.settle(); await frames(f, 4);
  const strip = await f.evaluate(() => {
    const live = [...document.querySelectorAll('#pmRoot :is(.activity-bar, .pm56-activity-bar)')].find(b => !b.closest('.activity-sizer'));
    const sizer = live.parentElement.querySelector(':scope > .activity-sizer');
    const items = [...live.querySelectorAll(':scope > .activity-item')].filter(e => e.getClientRects().length).map(e => e.getAttribute('data-domain'));
    if (!sizer) return { items, sizer: null };
    const focusables = [...sizer.querySelectorAll('button, a[href], input, select, textarea, [tabindex]')];
    const took = focusables.filter(e => { e.focus(); return document.activeElement === e; }).length;
    return { items, sizer: { inert: sizer.inert, ariaHidden: sizer.getAttribute('aria-hidden'), copies: sizer.querySelectorAll('.activity-item').length, focusables: focusables.length, negative: focusables.every(e => e.tabIndex < 0), took, more: sizer.querySelectorAll('[data-ab-id="more"], #abMoreBtn').length } };
  });
  t.log('chat strip ' + JSON.stringify(strip));
  if (strip.sizer) await t.check('chat strip sizer copies are inert and take no focus', strip.sizer.inert && strip.sizer.ariaHidden === 'true' && strip.sizer.copies > 0 && strip.sizer.negative && strip.sizer.took === 0 && strip.sizer.more === 0, JSON.stringify(strip.sizer));
  else t.log('chat strip has no FO-76 sizer on this page (main before FO-76): copies not checked');
  await f.evaluate(placeSentinel, ['#pmRoot .activity-wrap', 'before']);
  await f.locator('#fo96-sentinel').focus();
  const sForward = [];
  for (let i = 0; i <= strip.items.length; i++) { await kb.press('Tab'); sForward.push(await key()); }
  const sBack = [];
  for (let i = 0; i <= strip.items.length; i++) { await kb.press('Shift+Tab'); sBack.push(await key()); }
  const inSizer = [...sForward, ...sBack].filter(k => k.sizer);
  await t.check('chat strip: Tab walks its items in order, then leaves it, never into the sizer',
    JSON.stringify(sForward.slice(0, strip.items.length).map(k => k.key)) === JSON.stringify(strip.items) && !sForward[strip.items.length].wrap && inSizer.length === 0,
    JSON.stringify({ items: strip.items, forward: sForward.map(k => k.key + (k.sizer ? '(sizer)' : '')) }));
  await t.check('chat strip: Shift+Tab walks it back and out, never into the sizer',
    JSON.stringify(sBack.slice(0, strip.items.length).map(k => k.key)) === JSON.stringify([...strip.items].reverse()) && !sBack[strip.items.length].wrap,
    JSON.stringify(sBack.map(k => k.key + (k.sizer ? '(sizer)' : ''))));
  await f.evaluate(() => document.getElementById('fo96-sentinel')?.remove());

  // 6. The painted focus ring in every look, on the two items lit by default (Chat, while the chat column shows, and
  // Files, the open panel; F96-1), an unlit item (Search) and More. Friendly Light's accent ring is under 3:1 everywhere,
  // FO-99 (logged for batch 8): there the ring must paint, and its contrast is logged, unless --set fo99=1 holds it to 3:1.
  const looks = t.args.looks ? String(t.args.looks).split(',') : LOOKS;
  const moreReach = async () => { await f.locator('#activityBarToggle').focus(); await kb.press('Shift+Tab'); };
  for (const look of looks) {
    await t.app.look(look);
    // a look change plays under a cover (NieR's switch-on reboots the screen), and NieR's brackets hold off until that
    // cover has gone, which is after it reports itself uncovered at the reveal (19-nier-parts.js rbRelease)
    await f.waitForFunction(() => !window.PM_THEME_TRANSITION?.busy?.() && !window.PM_LOOK_COVERED?.() &&
      window.PM_NIER?.wanted?.() === window.PM_NIER?.on?.() && !document.getElementById('o55np-reboot'), null, { timeout: 20000 }).catch(() => {});
    await frames(f, 4);
    await t.page.mouse.move(off.x + 1200, off.y + 600);
    const rows = [await painted('chat', byTab('chat')), await painted('files', byTab('files')), await painted('search', byTab('search')), await painted('more', moreReach)];
    t.log(`${look} painted rings ${JSON.stringify(rows)}`);
    const known = look === 'friendly-light' && !t.args.fo99;
    const ok = r => known ? !!r && r.focused && r.changed >= 40 : ringPainted(r);
    await t.check(`${look}: Chat and Files are lit, Search and More are not`, rows[0]?.lit && rows[1]?.lit && rows[2] && !rows[2].lit && rows[3] && !rows[3].lit, JSON.stringify(rows.map(r => r && [r.key, r.lit])));
    await t.check(`${look}: a painted key focus ring of ${known ? 'some contrast (3:1 held back for FO-99)' : '3:1 or more'} on lit Chat and Files, on Search and on More`, rows.every(ok), JSON.stringify(rows));
    if (known) t.log(`${look}: FO-99 ring contrast (not enforced here) ${rows.map(r => r && `${r.key} ${r.median}:1`).join(', ')}`);
    if (t.args.crops) {
      await moreReach();
      await t.crop(`more-focus-${surface}-${look}`, f.locator('#activityBar'), `${look}: More with the key focus ring`);
      await sentinel('#activityBar'); await kb.press('Tab'); await f.waitForTimeout(450);
      await t.crop(`chat-focus-${surface}-${look}`, f.locator('#activityBar'), `${look}: lit Chat with the key focus ring`);
    }
  }
  await f.evaluate(() => document.getElementById('fo96-sentinel')?.remove());
}
