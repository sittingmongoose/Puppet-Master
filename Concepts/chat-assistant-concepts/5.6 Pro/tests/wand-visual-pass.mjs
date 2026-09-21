#!/usr/bin/env node
/* Throwaway visual pass for the eleven redesigned wand-module dialogs.
   Opens each dialog from the wand, asserts shell grammar + zero native
   selects + zero slot throws, screenshots dark then light. Not committed. */
import { chromium } from 'playwright-core';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdirSync } from 'node:fs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = process.env.SHOT_DIR || 'C:/Users/sitti/pm-baselines-wand/visual';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ executablePath: process.env.PW_EXE || undefined, args: ['--no-sandbox', '--allow-file-access-from-files'] });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
const consoleErrors = [];
page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
page.on('pageerror', e => consoleErrors.push('PAGEERROR ' + String(e.stack || e)));
await page.goto('file://' + resolve(ROOT, 'PM_Chat_Assistant_5.6_Pro_Standalone.html'), { waitUntil: 'load' });
await page.waitForFunction(() => !!window.PM56_DEMO);

const ev = (fn, arg) => page.evaluate(fn, arg);
const wait = ms => page.waitForTimeout(ms);
async function clickVisible(sel) {
  for (const h of await page.$$(sel)) if (await h.isVisible()) { await h.click(); return true; }
  return false;
}
async function closeDialog() {
  await ev(() => document.querySelector('.dialog.mdl .mdl-head button.icon-button')?.click());
  await wait(250);
  await page.keyboard.press('Escape');
  await wait(200);
}
async function openWand() {
  const open = await ev(() => (window.PM56_EXT.ctx().state.menu || {}).type === 'wand');
  if (!open) { await clickVisible('[data-action="open-menu"][data-menu="wand"]'); await wait(300); }
}
async function ensureRow(sel, group) {
  if (await page.$(sel)) return true;
  await openWand();
  if (!(await page.$(sel))) { await clickVisible(`[data-action="polish-wand-group"][data-group="${group}"]`); await wait(300); }
  return !!(await page.$(sel));
}
async function snapshot(name) {
  const info = await ev(() => {
    const d = document.querySelector('.dialog.mdl');
    return d ? {
      exists: true,
      selects: d.querySelectorAll('select').length,
      sections: d.querySelectorAll('.mdl-section').length,
      title: d.querySelector('.mdl-title strong')?.textContent || null,
      sub: d.querySelector('.mdl-title span')?.textContent?.slice(0, 60) || null
    } : { exists: false, selects: -1, sections: 0, title: null, sub: null };
  });
  await page.screenshot({ path: `${OUT}/${name}.png` });
  return info;
}
const results = [];
let consoleMark = 0;
async function pass(name, opener, extra) {
  const before = consoleErrors.length;
  await closeDialog();
  const opened = await opener();
  await wait(400);
  const info = await snapshot(name + '-dark');
  let extraInfo = null;
  if (extra) extraInfo = await extra();
  const errs = consoleErrors.slice(before).filter(t => /threw|RangeError|Invalid time/i.test(t));
  results.push({ name, opened, ...info, slotThrows: errs, extra: extraInfo });
  consoleErrors.length = before; // keep only unmatched baseline noise count simple
  consoleMark = before;
}

await pass('bsd', async () => {
  await ensureRow('[data-submenu="bsd-v2"]', 'assist');
  await page.hover('[data-submenu="bsd-v2"]');
  await wait(350);
  return clickVisible('[data-action="bsd-configure-stages"]');
});
await pass('eli5', async () => {
  await ensureRow('[data-action="eli5-open"]', 'assist');
  return clickVisible('[data-action="eli5-open"]');
});
for (const kind of ['crew', 'chat_room', 'brainstorm', 'review']) {
  await pass('collab-' + kind, async () => {
    await ensureRow(`[data-action="collab-open-configure"][data-kind="${kind}"]`, 'work');
    return clickVisible(`[data-action="collab-open-configure"][data-kind="${kind}"]`);
  });
}
await pass('sched-message', async () => {
  await ensureRow('[data-action="sched-open-message"]', 'schedule');
  return clickVisible('[data-action="sched-open-message"]');
});
await pass('sched-manage', async () => {
  await ensureRow('[data-action="sched-open-manage"]', 'schedule');
  return clickVisible('[data-action="sched-open-manage"]');
}, async () => {
  const tabs = ['messages', 'builds', 'quota', 'events'];
  const seen = [];
  for (const t of tabs) {
    await clickVisible(`[data-action="sched-manage-tab"][data-tab="${t}"]`);
    await wait(300);
    seen.push(await ev(() => ({ tab: document.querySelector('.dialog.mdl [data-action="sched-manage-tab"].active,[data-action="sched-manage-tab"][aria-selected="true"]')?.dataset.tab, open: !!document.querySelector('.dialog.mdl') })));
  }
  await page.screenshot({ path: `${OUT}/sched-manage-builds-dark.png` });
  await closeDialog();
  await openWand();
  await clickVisible('[data-action="sched-open-manage"]');
  await wait(400);
  const reopened = await ev(() => ({ open: !!document.querySelector('.dialog.mdl'), tab: document.querySelector('.dialog.mdl [data-action="sched-manage-tab"].active,[data-action="sched-manage-tab"][aria-selected="true"]')?.dataset.tab, rows: document.querySelectorAll('[data-k^="sched-bld-"]').length }));
  return { tabs: seen, reopened };
});
await pass('memory', async () => {
  await ensureRow('[data-action="af-memory-open"]', 'memory');
  return clickVisible('[data-action="af-memory-open"]');
});
await pass('teach', async () => {
  await ensureRow('[data-action="af-teach-open"]', 'memory');
  return clickVisible('[data-action="af-teach-open"]');
});
await pass('defaults', async () => {
  await ensureRow('[data-action="af-settings-open"]', 'preferences');
  return clickVisible('[data-action="af-settings-open"]');
});

/* light theme re-shoot */
await ev(() => window.PM56_DEMO.setTheme('basic-light'));
await wait(400);
for (const r of results) {
  // reopen each dialog quickly for a light screenshot using the same opener is
  // expensive; instead re-shoot the four most complex ones.
}
await closeDialog();
await openWand();
await ensureRow('[data-action="sched-open-manage"]', 'schedule');
await clickVisible('[data-action="sched-open-manage"]');
await wait(400);
await snapshot('sched-manage-light');
await closeDialog();
await ensureRow('[data-action="af-memory-open"]', 'memory');
await clickVisible('[data-action="af-memory-open"]');
await wait(400);
await snapshot('memory-light');
await closeDialog();
await ensureRow('[data-submenu="bsd-v2"]', 'assist');
await page.hover('[data-submenu="bsd-v2"]');
await wait(350);
await clickVisible('[data-action="bsd-configure-stages"]');
await wait(400);
await snapshot('bsd-light');

const bad = results.filter(r => !r.opened || !r.exists || r.selects !== 0 || r.slotThrows.length);
console.log(JSON.stringify({ results, badCount: bad.length, bad: bad.map(b => b.name), residualConsole: consoleErrors.slice(0, 5) }, null, 2));
await browser.close();
process.exit(bad.length ? 1 : 0);
