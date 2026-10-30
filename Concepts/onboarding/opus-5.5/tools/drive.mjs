/* Driver toolkit for onboarding scenarios: real CDP mouse clicks and typing against the built concept.
 * Pass --page <path> on the command line to drive a private build instead of the built concept.
 * import { open } from './drive.mjs'; const d = await open({ scenario: 'fresh', theme: 'basic-dark' });
 * d.primary(), d.act('pick', 'this'), d.type('name', 'Book club website'), d.screen(), d.until(fn), d.snap(), d.close()
 * Every step waits for the screen to settle and records page errors, so a scenario reads like the person's clicks. */
import { launch, sleep } from './chrome.mjs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const pageIdx = process.argv.indexOf('--page');
export const PAGE = pageIdx >= 0 && process.argv[pageIdx + 1] ? resolve(process.argv[pageIdx + 1]) : resolve(here, '../../../PMConcept7.html');
const LAYER = '#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out)';
const attr = (s) => String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"');

export async function open({ scenario = 'fresh', theme = 'basic-dark', width = 1440, height = 900, query = '', snapDir = null, snapPrefix = '', coverageFile = null } = {}) {
  const { page, close } = await launch({ width, height, coverageFile });
  const context = () => page.evaluate(() => {
    const S = window.O55 && window.O55.S, r = document.getElementById('pm-o55-onboarding');
    const l = r && r.querySelector('.o55-pane > .o55-layer:not(.o55-out)');
    const b = l && l.querySelector('.o55-primary');
    return `screen=${S && S.sess && S.sess.screen}, open=${!!(S && S.open)}, rendered=${l && l.getAttribute('data-screen')}, root=${r ? r.className : 'absent'}, layer=${l ? l.className : 'absent'}, disabledReason=${b && b.getAttribute('data-disabled-reason')}`;
  });
  const wait = async (fn, { timeout = 12000, every = 150, what = 'condition', args = [] } = {}) => {
    const t0 = Date.now();
    do {
      if (await page.evaluate(fn, ...args)) return true;
      await sleep(every); // Poll interval; readiness is determined by the observable condition.
    } while (Date.now() - t0 < timeout);
    throw new Error(`timeout after ${timeout}ms waiting for ${what} (${await context()})`);
  };
  try {
    const [fam, mode] = theme.split('-');
    await page.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: mode }] });
    await page.goto(pathToFileURL(PAGE).href + `?o55=off&o55scenario=${encodeURIComponent(scenario)}${query}`);
    await wait(() => !!(window.PM_THEME && window.PM_THEME.setFamily && window.PM_THEME.setMode && window.O55 && window.O55.ui && window.O55.ui.open && window.PM7_ONBOARDING_CINEMATIC), { what: 'theme and onboarding APIs ready' });
    await page.evaluate((f, m) => { window.PM_THEME.setFamily(f, { persist: false }); window.PM_THEME.setMode(m, { persist: false }); localStorage.removeItem('pm.o55.onboarding.v1'); }, fam, mode);
  } catch (err) { await close(); throw err; }
  const log = [];
  let lastSnapScreen = null, snapN = 0;
  /* with snapDir, every newly reached screen is photographed once it has settled (a walk-through of the flow) */
  const autoSnap = async () => {
    if (!snapDir) return;
    const sc = await page.evaluate(() => window.O55.S.sess && window.O55.S.sess.screen);
    if (!sc || sc === lastSnapScreen) return;
    await d.settle();
    lastSnapScreen = sc;
    const r = await page.evaluate(() => { const b = document.querySelector('#pm-o55-onboarding .o55-win'); if (!b || !b.getClientRects().length) return null; const q = b.getBoundingClientRect(); return { x: q.left - 12, y: q.top - 12, width: q.width + 24, height: q.height + 24 }; });
    if (r) await page.screenshot(`${snapDir}/${snapPrefix}${String(++snapN).padStart(2, '0')}-${sc}.png`, { clip: r });
  };
  const d = {
    page, log, errors: page.errors,
    async settle(opts = {}) {
      // Older illustration tools pass a number here. It now requests state settlement, with no timed pause.
      return wait(() => {
        const S = window.O55 && window.O55.S, r = document.getElementById('pm-o55-onboarding');
        if (!S) return false;
        if (!S.open) return (!r || r.hidden) && !document.getElementById('o55-open-scrim');
        const l = r && r.querySelector('.o55-pane > .o55-layer:not(.o55-out)');
        if (!S.sess || !r || r.hidden || !l || l.getAttribute('data-screen') !== S.sess.screen) return false;
        if (S.vt || document.documentElement.hasAttribute('data-o55-vt') || r.matches('.o55-hold, .o55-opening, .o55-closing') || l.matches('.o55-hold, .o55-entering') || r.querySelector('.o55-pane > .o55-out')) return false;
        // Wait for the layer transition, not descendant hover feedback that can retarget every frame.
        // The next control has its own visibility, hit-test, and geometry wait in click().
        return !l.getAnimations({ subtree: false }).some((a) => a.playState === 'running' && Number.isFinite(a.effect.getComputedTiming().endTime));
      }, { what: 'onboarding screen and transitions settled', ...(typeof opts === 'object' ? opts : {}) });
    },
    async screen() { return page.evaluate(() => window.O55.S.sess && window.O55.S.sess.screen); },
    async state(fn) { return page.evaluate(fn); },
    async openOnboarding(opts) {
      await page.evaluate((o) => window.O55.ui.open(o || { fresh: true }), opts || null);
      await d.until(() => !!(window.O55.S.open && window.O55.S.sess && document.querySelector('#pm-o55-onboarding .o55-layer[data-screen]')), { what: 'onboarding window mounted' });
      await d.settle(); await autoSnap();
    },
    autoSnap,
    async untilElement(sel, what = sel, timeout = 12000) {
      return wait((s) => [...document.querySelectorAll(s)].some((e) => e.getClientRects().length && !e.closest('[inert]')), { args: [sel], timeout, what: 'visible ' + what });
    },
    /* Wait for an uncovered, stationary control, then use real CDP mouse input. Also used for shell menus. */
    async click(sel, what = sel) {
      await d.settle();
      let last = null, prev = null;
      const t0 = Date.now(), timeout = 12000;
      do {
        last = await page.evaluate((s) => {
          const el = [...document.querySelectorAll(s)].find((e) => e.getClientRects().length && !e.closest('[inert]'));
          if (!el) return null;
          el.scrollIntoView({ block: 'nearest' });
          const r = el.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, top = document.elementFromPoint(x, y);
          /* a finite animation still to run on the target or a box around it (a menu opening from a small frame) moves
             it after the probes: an opening held for its first shown frame measured the same twice, the click went in,
             and the menu grew under the pointer (x1: pointerdown on a section label, pointerup on another row) */
          const moving = document.getAnimations().some((a) => { const t = a.effect && a.effect.target; return t && t.contains && t.contains(el) && (a.playState === 'running' || a.pending) && Number.isFinite(a.effect.getComputedTiming().endTime); });
          return { x, y, w: r.width, h: r.height, hit: !!top && (top === el || el.contains(top)), disabled: el.disabled || el.getAttribute('aria-disabled') === 'true', over: top && (top.id || top.tagName), moving };
        }, sel);
        if (last && prev && last.w > 0 && last.h > 0 && last.hit && !last.disabled && !last.moving && ['x', 'y', 'w', 'h'].every((k) => Math.abs(last[k] - prev[k]) < 0.5)) {
          await page.mouse(last.x, last.y); return;
        }
        prev = last; await sleep(60); // Separate geometry probes; elapsed time alone never permits a click.
      } while (Date.now() - t0 < timeout);
      const why = !last ? 'absent or inert' : last.disabled ? 'disabled' : !last.hit ? 'covered by ' + last.over : last.moving ? 'still animating' : 'still moving';
      throw new Error(`timeout after ${timeout}ms waiting for ${what}: ${why} (${await context()})`);
    },
    /* click a control in the current layer by action (and arg) with a real mouse event */
    async act(action, arg, { settle = true } = {}) {
      const sel = `${LAYER} [data-o55-do="${attr(action)}"]` + (arg != null ? `[data-arg="${attr(arg)}"]` : '');
      await d.click(sel, `control ${action}${arg != null ? ' ' + arg : ''}`);
      log.push({ act: action, arg, screen: await d.screen() });
      if (settle !== false) { await d.settle(); await autoSnap(); }
    },
    async primary({ settle = true } = {}) {
      await d.settle(); await d.untilElement(`${LAYER} .o55-primary`, 'primary control');
      await wait((s) => { const b = document.querySelector(s); return b && !b.disabled && b.getAttribute('aria-disabled') !== 'true'; }, { args: [`${LAYER} .o55-primary`], what: 'primary control enabled' });
      const info = await page.evaluate(() => { const b = document.querySelector('#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out) .o55-primary'); return b ? { label: b.textContent.trim(), disabled: b.getAttribute('aria-disabled') === 'true', reason: b.getAttribute('data-disabled-reason') } : null; });
      if (!info) throw new Error('no primary on ' + await d.screen());
      if (info.disabled) throw new Error(`primary "${info.label}" disabled on ${await d.screen()}: ${info.reason}`);
      await d.click(`${LAYER} .o55-primary`, 'primary control');
      log.push({ primary: info.label });
      if (settle !== false) { await d.settle(); await autoSnap(); }
      return info.label;
    },
    async primaryInfo() { await d.settle(); return page.evaluate(() => { const b = document.querySelector('#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out) .o55-primary'); return b ? { label: b.textContent.trim(), disabled: b.getAttribute('aria-disabled') === 'true', reason: b.getAttribute('data-disabled-reason') } : null; }); },
    async back() { await d.click(`${LAYER} .o55-back`, 'Back control'); log.push({ back: true }); await d.settle(); await autoSnap(); },
    /* type into a bound field (real key input via insertText) */
    async type(bind, text, { clear = true, settle = true } = {}) {
      if (settle !== false) await d.settle();
      const sel = `${LAYER} [data-o55-bind="${attr(bind)}"]`;
      await d.untilElement(sel, 'field ' + bind);
      const before = await page.evaluate((s, c) => { const el = document.querySelector(s); el.focus(); if (c) { el.select && el.select(); } return el.value; }, sel, clear);
      if (clear) await page.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Backspace', code: 'Backspace', windowsVirtualKeyCode: 8 }), await page.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Backspace', code: 'Backspace', windowsVirtualKeyCode: 8 });
      await page.send('Input.insertText', { text });
      log.push({ type: bind, text: /pw|pass|token|key|phrase/.test(bind) ? '•••' : text });
      await wait((s, value) => { const el = document.querySelector(s); return el && el.value === value; }, { args: [sel, (clear ? '' : before) + text], what: 'field ' + bind + ' to accept input' });
      if (settle !== false) await d.settle();
    },
    until: (fn, opts = {}) => wait(fn, { timeout: 15000, ...opts }),
    async untilScreen(id, timeout = 12000) {
      await wait((sc) => { const S = window.O55.S, l = document.querySelector('#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out)'); return S.open && S.sess && S.sess.screen === sc && l && l.getAttribute('data-screen') === sc; }, { args: [id], timeout, what: 'screen ' + id + ' rendered' });
      return d.settle({ timeout, what: 'screen ' + id + ' settled' });
    },
    async draft(which) { return page.evaluate((w) => window.O55.draft.exportPlan(window.O55.S.sess.drafts[w || window.O55.S.sess.active]), which || null); },
    async refusals() { return page.evaluate(() => window.O55.owners.log.filter((e) => !e.ok)); },
    async commands() { return page.evaluate(() => window.O55.owners.log.map((e) => e.id + ':' + e.phase + (e.ok ? '' : ':REFUSED'))); },
    async snap(path) { await d.settle(); const r = await page.evaluate(() => { const b = document.querySelector('#pm-o55-onboarding .o55-win').getBoundingClientRect(); return { x: b.left - 12, y: b.top - 12, width: b.width + 24, height: b.height + 24 }; }); await page.screenshot(path, { clip: r }); },
    close
  };
  return d;
}
export { sleep };
