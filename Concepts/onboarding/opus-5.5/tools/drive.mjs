/* Driver toolkit for onboarding scenarios: real CDP mouse clicks and typing against the built concept.
 * import { open } from './drive.mjs'; const d = await open({ scenario: 'fresh', theme: 'basic-dark' });
 * d.primary(), d.act('pick', 'this'), d.type('name', 'Book club website'), d.screen(), d.until(fn), d.snap(), d.close()
 * Every step waits for the screen to settle and records page errors, so a scenario reads like the person's clicks. */
import { launch, sleep } from '../../../pm7-tools/verify/pm_cdp.mjs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
export const PAGE = resolve(here, '../../../TestOpus5.5PmConcept.html');

export async function open({ scenario = 'fresh', theme = 'basic-dark', width = 1440, height = 900, query = '', snapDir = null, snapPrefix = '' } = {}) {
  const { page, close } = await launch({ width, height });
  const [fam, mode] = theme.split('-');
  await page.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: mode }] });
  await page.goto(pathToFileURL(PAGE).href + `?o55=off&o55scenario=${encodeURIComponent(scenario)}${query}`);
  await sleep(1100);
  await page.evaluate((f, m) => { window.PM_THEME.setFamily(f, { persist: false }); window.PM_THEME.setMode(m, { persist: false }); localStorage.removeItem('pm.o55.onboarding.v1'); }, fam, mode);
  const log = [];
  let lastSnapScreen = null, snapN = 0;
  /* with snapDir, every newly reached screen is photographed once it has settled (a walk-through of the flow) */
  const autoSnap = async () => {
    if (!snapDir) return;
    const sc = await page.evaluate(() => window.O55.S.sess && window.O55.S.sess.screen);
    if (!sc || sc === lastSnapScreen) return;
    lastSnapScreen = sc; await sleep(900);
    const r = await page.evaluate(() => { const b = document.querySelector('#pm-o55-onboarding .o55-win'); if (!b || !b.getClientRects().length) return null; const q = b.getBoundingClientRect(); return { x: q.left - 12, y: q.top - 12, width: q.width + 24, height: q.height + 24 }; });
    if (r) await page.screenshot(`${snapDir}/${snapPrefix}${String(++snapN).padStart(2, '0')}-${sc}.png`, { clip: r });
  };
  const d = {
    page, log, errors: page.errors,
    async settle(ms = 650) { await sleep(ms); },
    async screen() { return page.evaluate(() => window.O55.S.sess && window.O55.S.sess.screen); },
    async state(fn) { return page.evaluate(fn); },
    async openOnboarding(opts) { await page.evaluate((o) => window.O55.ui.open(o || { fresh: true }), opts || null); await sleep(900); await autoSnap(); },
    autoSnap,
    /* click a control in the current layer by action (and arg) with a real mouse event */
    async act(action, arg, { settle = 700 } = {}) {
      const sel = `#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out) [data-o55-do="${action}"]` + (arg != null ? `[data-arg="${String(arg).replace(/"/g, '\\"')}"]` : '');
      const ok = await page.evaluate((s) => { const el = [...document.querySelectorAll(s)].find((e) => e.getClientRects().length); if (!el) return false; el.scrollIntoView({ block: 'center' }); return true; }, sel);
      if (!ok) throw new Error(`no control ${action}${arg != null ? ' ' + arg : ''} on ${await d.screen()}`);
      await page.click(sel);
      log.push({ act: action, arg, screen: await d.screen() });
      await sleep(settle); await autoSnap();
    },
    async primary({ settle = 900 } = {}) {
      const info = await page.evaluate(() => { const b = document.querySelector('#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out) .o55-primary'); return b ? { label: b.textContent.trim(), disabled: b.getAttribute('aria-disabled') === 'true', reason: b.getAttribute('data-disabled-reason') } : null; });
      if (!info) throw new Error('no primary on ' + await d.screen());
      if (info.disabled) throw new Error(`primary "${info.label}" disabled on ${await d.screen()}: ${info.reason}`);
      await page.click('#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out) .o55-primary');
      log.push({ primary: info.label });
      await sleep(settle); await autoSnap();
      return info.label;
    },
    async primaryInfo() { return page.evaluate(() => { const b = document.querySelector('#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out) .o55-primary'); return b ? { label: b.textContent.trim(), disabled: b.getAttribute('aria-disabled') === 'true', reason: b.getAttribute('data-disabled-reason') } : null; }); },
    async back() { await page.click('#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out) .o55-back'); log.push({ back: true }); await sleep(800); },
    /* type into a bound field (real key input via insertText) */
    async type(bind, text, { clear = true, settle = 400 } = {}) {
      const sel = `#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out) [data-o55-bind="${bind}"]`;
      const ok = await page.evaluate((s, c) => { const el = document.querySelector(s); if (!el) return false; el.focus(); if (c) { el.select && el.select(); } return true; }, sel, clear);
      if (!ok) throw new Error('no field ' + bind + ' on ' + await d.screen());
      if (clear) await page.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Backspace', code: 'Backspace', windowsVirtualKeyCode: 8 }), await page.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Backspace', code: 'Backspace', windowsVirtualKeyCode: 8 });
      await page.send('Input.insertText', { text });
      log.push({ type: bind, text: /pw|pass|token|key|phrase/.test(bind) ? '•••' : text });
      await sleep(settle);
    },
    async until(fn, { timeout = 15000, every = 200, what = 'condition' } = {}) {
      const t0 = Date.now();
      while (Date.now() - t0 < timeout) { if (await page.evaluate(fn)) return true; await sleep(every); }
      throw new Error('timeout waiting for ' + what + ' on ' + await d.screen());
    },
    async untilScreen(id, timeout = 12000) { return d.until(new Function(`return window.O55.S.sess && window.O55.S.sess.screen === ${JSON.stringify(id)}`), { timeout, what: 'screen ' + id }); },
    async draft(which) { return page.evaluate((w) => window.O55.draft.exportPlan(window.O55.S.sess.drafts[w || window.O55.S.sess.active]), which || null); },
    async refusals() { return page.evaluate(() => window.O55.owners.log.filter((e) => !e.ok)); },
    async commands() { return page.evaluate(() => window.O55.owners.log.map((e) => e.id + ':' + e.phase + (e.ok ? '' : ':REFUSED'))); },
    async snap(path) { const r = await page.evaluate(() => { const b = document.querySelector('#pm-o55-onboarding .o55-win').getBoundingClientRect(); return { x: b.left - 12, y: b.top - 12, width: b.width + 24, height: b.height + 24 }; }); await page.screenshot(path, { clip: r }); },
    close
  };
  return d;
}
export { sleep };
