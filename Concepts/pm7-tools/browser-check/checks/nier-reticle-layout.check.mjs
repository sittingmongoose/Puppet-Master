// FO-96: focus already cut, names/layout changes, and the same reticle in Files and More scrollers.
import { decodePng } from '../helpers/activity-cover-pixels.mjs';
const pause = f => f.waitForTimeout(700);
const files = '#activityBar [data-ab-id="files"]';
async function quiet(f) { await f.evaluate(() => { const s = document.createElement('style'); s.textContent = '#pm-hover-tag-root,#o55np-cursor {visibility:hidden !important}'; document.head.append(s); }); }

async function focus(t, f, sel) {
  // One trusted key establishes keyboard modality; preventScroll preserves the deliberately cut target.
  await t.page.keyboard.press('Shift');
  await f.locator(sel).evaluate(e => e.focus({ preventScroll: true }));
  await pause(f);
}
async function pixels(t, f, scroller, target, label) {
  await pause(f);
  const g = await f.evaluate(([ss, ts]) => {
    const s = document.querySelector(ss), e = document.querySelector(ts), b = s.getBoundingClientRect(), r = e.getBoundingClientRect();
    const ret = document.getElementById('o55np-reticle');
    return { box: { left: b.left + s.clientLeft, top: b.top + s.clientTop, right: b.left + s.clientLeft + s.clientWidth, bottom: b.top + s.clientTop + s.clientHeight },
      item: { left: r.left, top: r.top, right: r.right, bottom: r.bottom },
      focused: e === document.activeElement && e.matches(':focus-visible'), on: ret?.hasAttribute('data-on'), clip: ret?.style.clipPath, scroll: s.scrollTop, max: s.scrollHeight - s.clientHeight };
  }, [scroller, target]);
  const fe = f === t.page.mainFrame() ? null : await f.frameElement(), off = fe ? await fe.boundingBox() : { x: 0, y: 0 };
  for (const rect of [g.box, g.item]) for (const k of Object.keys(rect)) rect[k] += /left|right/.test(k) ? off.x : off.y;
  const a = decodePng(await t.page.screenshot());
  await f.locator('#o55np-reticle').evaluate(e => { e.style.visibility = 'hidden'; });
  const b = decodePng(await t.page.screenshot());
  await f.locator('#o55np-reticle').evaluate(e => { e.style.visibility = ''; });
  let inside = 0, outside = 0;
  for (let y = Math.max(0, Math.floor(g.item.top - 24)); y < Math.min(a.height, Math.ceil(g.item.bottom + 24)); y++)
    for (let x = Math.max(0, Math.floor(g.item.left - 24)); x < Math.min(a.width, Math.ceil(g.item.right + 24)); x++) {
      const i = (y * a.width + x) * 4;
      if (![0, 1, 2].some(k => Math.abs(a.data[i + k] - b.data[i + k]) > 40)) continue;
      if (x < g.box.left || x >= g.box.right || y < g.box.top || y >= g.box.bottom) outside++; else inside++;
    }
  t.log(`${label}: ${JSON.stringify({ ...g, inside, outside })}`);
  await t.check(`${label}: focused reticle paints inside and nowhere outside the scroller's client box`, g.focused && g.on && inside >= 6 && outside <= 3, JSON.stringify({ ...g, inside, outside }));
  return g;
}

async function cut(t, f, scroller, target) {
  const d = await f.evaluate(([ss, ts]) => { const s = document.querySelector(ss), e = document.querySelector(ts), b = s.getBoundingClientRect(), r = e.getBoundingClientRect(); return r.top - b.top - s.clientTop + r.height / 3; }, [scroller, target]);
  const box = await f.locator(scroller).boundingBox();
  await t.page.mouse.move(box.x + box.width * .7, box.y + box.height * .6);
  await t.page.mouse.wheel(0, Math.round(d)); await pause(f);
  await t.page.mouse.move(1200, 450);
  const g = await pixels(t, f, scroller, target, 'wheel-cut target');
  await t.check('wheel really cuts the focused target at the client top', g.scroll > 0 && g.item.top < g.box.top - 2 && g.item.bottom > g.box.top + 2, JSON.stringify(g), { hard: true });
}

export const tests = {
  async 'Activity layout'(t) {
    for (const look of ['nier-light', 'nier-dark']) {
      await t.viewport(1280, 500); const f = await t.app.open(); await t.app.look(look);
      await quiet(f);
      await f.waitForFunction(() => !window.PM_THEME_TRANSITION?.busy?.() && !window.PM_LOOK_COVERED?.()); await pause(f);
      if (await f.locator('#activityBar').evaluate(e => e.classList.contains('collapsed'))) await f.locator('#activityBarToggle').evaluate(e => e.click());
      await pause(f);
      await t.check(`${look}: names shown`, !await f.locator('#activityBar').evaluate(e => e.classList.contains('collapsed')), '', { hard: true });
      await f.locator('#activityBar').evaluate(e => { e.scrollTop = 0; });
      await focus(t, f, files); await cut(t, f, '#activityBar', files);
      await f.locator('#activityBarToggle').evaluate(e => e.focus({ preventScroll: true })); await focus(t, f, files);
      await pixels(t, f, '#activityBar', files, `${look}: focus onto already-cut Files`);
      // Invoke the actual toggle without moving the key focus off the icon, as an external names change does.
      await f.locator('#activityBarToggle').evaluate(e => e.click());
      await pixels(t, f, '#activityBar', files, `${look}: names collapsed with focus kept`);
      await f.locator('#activityBarToggle').evaluate(e => e.click());
      await pixels(t, f, '#activityBar', files, `${look}: names restored with focus kept`);
      await t.viewport(1024, 500); await pixels(t, f, '#activityBar', files, `${look}: window resize to 1024x500`);
      await t.viewport(1280, 500); await pixels(t, f, '#activityBar', files, `${look}: window resize back`);
    }
  },
  async 'Files and More scrollers'(t) {
    for (const look of ['nier-light', 'nier-dark']) {
      await t.viewport(1280, 500); const f = await t.app.open(); await t.app.look(look);
      await quiet(f);
      await f.waitForFunction(() => !window.PM_THEME_TRANSITION?.busy?.() && !window.PM_LOOK_COVERED?.()); await pause(f);
      await f.locator(files).click(); await pause(f);
      const chosen = await f.evaluate(() => {
        const scrollers = [...document.querySelectorAll('#sidePanelSlot .sh-scroll')];
        const s = scrollers.find(e => e.clientHeight > 60 && e.scrollHeight > e.clientHeight + 40);
        if (!s) return false;
        s.setAttribute('data-fo96-scroller', 'files'); s.scrollTop = 0;
        const e = [...s.querySelectorAll('button,[tabindex="0"],input,a[href]')].find(e => { const r = e.getBoundingClientRect(); return r.height > 12 && r.width > 10 && r.top >= s.getBoundingClientRect().top; });
        if (!e) return false; e.setAttribute('data-fo96-target', 'files'); return true;
      });
      await t.check(`${look}: Files has a real scrollable focus target`, chosen, '', { hard: true });
      const s = '[data-fo96-scroller="files"]', e = '[data-fo96-target="files"]';
      await focus(t, f, e); await cut(t, f, s, e);
      await t.viewport(1920, 500); await pause(f); await focus(t, f, e);
      const handle = await f.locator('#leftPanelResizer').boundingBox();
      await t.check(`${look}: docked rail has its resize handle`, !!handle, '', { hard: true });
      await t.page.mouse.move(handle.x + handle.width / 2, handle.y + handle.height / 2); await t.page.mouse.down();
      try { await t.page.mouse.move(handle.x + 120, handle.y + handle.height / 2, { steps: 20 }); } finally { await t.page.mouse.up(); }
      await focus(t, f, e); await pixels(t, f, s, e, `${look}: resized Files rail`);
      // Hide the actual icons through their own menu, so More contains real restore rows, not a fabricated fixture.
      const ids = await f.locator('#activityBar > .icon[data-ab-id]:not([data-ab-id="chat"]):not([data-ab-id="more"])').evaluateAll(es => es.map(e => e.dataset.abId));
      for (const id of ids) {
        await f.locator(`#activityBar > .icon[data-ab-id="${id}"]`).focus();
        await t.page.keyboard.press('Shift+F10');
        await f.locator('.pmr-menu[data-pmr-menu="d-ab-icon"]:not(.is-closing)').waitFor({ state: 'visible' });
        await t.page.keyboard.press('End'); await t.page.keyboard.press('Enter');
        await f.locator('.pmr-menu[data-pmr-menu="d-ab-icon"]').waitFor({ state: 'detached' });
      }
      await t.viewport(1280, 300); await focus(t, f, '#abMoreBtn'); await t.page.keyboard.press('ArrowDown');
      const menu = '.pmr-menu[data-pmr-menu="d-ab-more"]';
      await f.locator(menu).waitFor({ state: 'visible' }); await pause(f);
      const row = `${menu} .pmr-mi:first-of-type`;
      const more = await f.locator(menu).evaluate(e => ({ height: e.clientHeight, max: e.scrollHeight - e.clientHeight, rows: e.querySelectorAll('.pmr-mi').length }));
      await t.check(`${look}: More is a genuine overflowing tray with hidden icons`, more.max > 20 && more.rows >= 8, JSON.stringify(more), { hard: true });
      await focus(t, f, row); await cut(t, f, menu, row);
      await t.page.keyboard.press('Escape');
    }
  }
};
