// FO-96: the Activity bar (the left rail, #activityBar) is worked by keys. Every Activity item and More is a button in
// the tab order, as in the product's other bars (the chat's Activity strip, its Activity domains toolbar, the title bar,
// the Debug transport): none of them roves with arrow keys. Each is named, shows a focus ring on a key focus in every
// look (NieR: its target brackets), and Enter and Space work it; More also opens on ArrowDown, its menu takes the focus, and Escape gives it back to
// More. The chat strip's FO-76 sizer copies stay inert and out of the tab order. Both surfaces (`--set sandbox=0|1`).
// `--set looks=basic-dark,nier-light` limits the focus-ring pass (all ten by default); `--set crops=1` crops the bar
// with More focused in each look.
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

// The focus ring: an outline on the control or on its symbol tile, or a box shadow that the rest state does not have.
function ringOf(key) {
  const el = key === 'activityBarToggle' ? document.getElementById(key) : document.querySelector(`#activityBar .icon[data-ab-id="${key}"]`);
  if (!el) return null;
  const parts = [el, el.querySelector(':scope > .symbol')].filter(Boolean);
  const alpha = c => { const m = /rgba?\(([^)]+)\)/.exec(c); if (!m) return c === 'transparent' ? 0 : 1; const v = m[1].split(/[ ,/]+/).filter(Boolean); return v.length > 3 ? parseFloat(v[3]) : 1; };
  // NieR marks a key focus with its target brackets (19-nier-parts.js: four corners 3 px outside the box)
  const ret = document.querySelector('#o55np-reticle[data-on]');
  let reticle = false;
  if (ret && ret.children.length === 4) {
    const r = el.getBoundingClientRect(), c = [...ret.children].map(i => i.getBoundingClientRect());
    const box = [Math.min(...c.map(b => b.left)), Math.min(...c.map(b => b.top)), Math.max(...c.map(b => b.right)), Math.max(...c.map(b => b.bottom))];
    reticle = [r.left - 3, r.top - 3, r.right + 3, r.bottom + 3].every((v, i) => Math.abs(v - box[i]) <= 8);
  }
  return { focusVisible: el.matches(':focus-visible'), reticle, parts: parts.map(e => { const cs = getComputedStyle(e);
    return { outline: cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 1.5 && alpha(cs.outlineColor) > 0.5 ? `${cs.outlineWidth} ${cs.outlineStyle} ${cs.outlineColor}` : null, shadow: cs.boxShadow }; }) };
}
const ringShown = (focus, rest) => !!focus && focus.focusVisible && (focus.reticle || focus.parts.some((p, i) => p.outline || (p.shadow !== 'none' && rest && p.shadow !== rest.parts[i]?.shadow)));

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
  const forward = [], rings = {};
  for (let i = 0; i < controls.length; i++) {
    await kb.press('Tab');
    await f.waitForTimeout(250);
    const k = await key();
    forward.push(k.key);
    if (k.bar) rings[k.key] = await f.evaluate(ringOf, k.key);
  }
  await kb.press('Tab');
  const after = await key();
  await t.check('Tab reaches every Activity item and More in order', JSON.stringify(forward) === JSON.stringify(controls.map(c => c.key)),
    `expected ${controls.map(c => c.key).join(' ')}; got ${forward.join(' ')}`);
  await t.check('Tab leaves the bar after its last control', !after.bar && !after.sizer, JSON.stringify(after));
  const back = [];
  for (let i = 0; i < controls.length; i++) { await kb.press('Shift+Tab'); back.push((await key()).key); }
  await t.check('Shift+Tab walks the bar back', JSON.stringify(back) === JSON.stringify(controls.map(c => c.key).reverse()), back.join(' '));
  await f.locator('#fo96-sentinel').focus();
  const restRings = {};
  for (const c of controls) restRings[c.key] = await f.evaluate(ringOf, c.key);
  const noRing = controls.filter(c => !ringShown(rings[c.key], restRings[c.key])).map(c => c.key);
  await t.check('each control shows a focus ring on a key focus', noRing.length === 0, noRing.length ? 'no ring: ' + noRing.join(' ') + ' ' + JSON.stringify(noRing.map(k => rings[k] || null)) : 'all ' + controls.length);

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

  // 6. The focus ring in every look: the first item by Tab, More by Shift+Tab from the toggle.
  const looks = t.args.looks ? String(t.args.looks).split(',') : LOOKS;
  for (const look of looks) {
    await t.app.look(look);
    // a look change plays under a cover (NieR's switch-on reboots the screen), and NieR's brackets wait for it to lift
    await f.waitForFunction(() => !window.PM_THEME_TRANSITION?.busy?.() && !window.PM_LOOK_COVERED?.() &&
      window.PM_NIER?.wanted?.() === window.PM_NIER?.on?.(), null, { timeout: 20000 }).catch(() => {});
    await frames(f, 4);
    await sentinel('#activityBar');
    await kb.press('Tab');
    await f.waitForTimeout(250);
    const first = await key();
    const firstRing = first.bar ? await f.evaluate(ringOf, first.key) : null;
    await f.locator('#activityBarToggle').focus();
    await kb.press('Shift+Tab');
    await f.waitForTimeout(250);
    const more = await key();
    const moreRing = more.key === 'more' ? await f.evaluate(ringOf, 'more') : null;
    await f.locator('#fo96-sentinel').focus();
    const firstRest = first.bar ? await f.evaluate(ringOf, first.key) : null, moreRest = await f.evaluate(ringOf, 'more');
    t.log(`${look} rings: ${first.key} ${JSON.stringify(firstRing)}; more ${JSON.stringify(moreRing)}`);
    await t.check(`${look}: key focus ring on the first item and on More`, first.bar && ringShown(firstRing, firstRest) && more.key === 'more' && ringShown(moreRing, moreRest),
      JSON.stringify({ first: first.key, firstRing, more: more.key, moreRing }));
    if (more.key === 'more' && t.args.crops) {
      await f.locator('#activityBarToggle').focus(); await kb.press('Shift+Tab');
      await t.crop(`more-focus-${surface}-${look}`, f.locator('#activityBar'), `${look}: More with the key focus ring`);
    }
  }
  await f.evaluate(() => document.getElementById('fo96-sentinel')?.remove());
}
