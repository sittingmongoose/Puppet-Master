/* AXIS 1 read-only probe: ownership of settings/routing/policy in u11-prism.html.
   Never writes to the concept tree. Uses playwright-core from the concept's
   pre-existing .verify/node_modules (read-only require). */
import { chromium } from '/mnt/Cursor/PuppetMaster/Concepts/usage-concepts/QwenUsageConcept/.verify/node_modules/playwright-core/index.mjs';
import fs from 'node:fs';

const CONCEPT = '/mnt/Cursor/PuppetMaster/Concepts/usage-concepts/QwenUsageConcept/u11-prism.html';
const OUT = '/tmp/claude-1000/-mnt-Cursor-PuppetMaster/7e74d8f5-7c2a-4eeb-8947-13056b4b2e5f/scratchpad/axis1-probe-result.json';
const EXE = '/home/sittingmongoose/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';

const R = { steps: [], errors: [] };
function rec(k, v) { R.steps.push({ k, v }); console.log('### ' + k + '\n' + JSON.stringify(v, null, 2)); }

const browser = await chromium.launch({ executablePath: EXE, headless: true,
  args: ['--no-sandbox', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--allow-file-access-from-files'] });
const ctx = await browser.newContext({ viewport: { width: 1700, height: 1000 } });
const page = await ctx.newPage();
page.on('pageerror', e => R.errors.push('pageerror: ' + e.message));
page.on('console', m => { if (m.type() === 'error') R.errors.push('console: ' + m.text()); });

await page.goto('file://' + CONCEPT, { waitUntil: 'load' });
await page.evaluate(() => { try { localStorage.clear(); } catch (e) {} });
await page.goto('file://' + CONCEPT, { waitUntil: 'load' });
await page.waitForTimeout(1800);

// go to Advanced so nothing is hidden by disclosure
await page.evaluate(() => { const b = document.querySelector('#u11Disc [data-disc="advanced"]'); if (b) b.click(); });
await page.waitForTimeout(900);

async function gotoRoom(tab) {
  await page.evaluate(t => {
    const g = document.getElementById('u11MoreGrp'); if (g) g.classList.remove('closed');
    const b = document.querySelector('.u11-item[data-tab="' + t + '"]'); if (b) b.click();
  }, tab);
  await page.waitForTimeout(900);
}

async function plansSnapshot() {
  await gotoRoom('plans');
  return page.evaluate(() => {
    const pane = document.querySelector('[data-pane="plans"]');
    const nexts = [...pane.querySelectorAll('.u11w-next')].map(e => e.innerText.trim());
    const rows = [...pane.querySelectorAll('.u11w-prow')].map(e => e.innerText.replace(/\s+/g, ' ').trim());
    return { nexts, rows, paneVisible: !pane.classList.contains('pm-hidden') };
  });
}

const before = await plansSnapshot();
rec('plans-BEFORE', before);

// ---- open the quick-controls sheet and enumerate every control
await page.evaluate(() => document.getElementById('u11Settings').click());
await page.waitForTimeout(700);
const sheet = await page.evaluate(() => {
  const s = document.getElementById('u11SheetSprout');
  const ctrls = [...s.querySelectorAll('input,select,button')].map(el => ({
    tag: el.tagName.toLowerCase(),
    type: el.type || null,
    attrs: ['data-u11set', 'data-u11extra', 'data-u11limit', 'data-u11link'].reduce((o, a) => {
      if (el.hasAttribute(a)) o[a] = el.getAttribute(a); return o; }, {}),
    label: (el.closest('.u11-sheet-row') || el).innerText.replace(/\s+/g, ' ').trim().slice(0, 90),
    value: el.tagName === 'SELECT' ? el.value : (el.type === 'checkbox' ? el.checked : el.value),
    options: el.tagName === 'SELECT' ? [...el.options].map(o => ({ v: o.value, t: o.text })) : null
  }));
  return { open: s.classList.contains('is-open') && !s.hidden, subtitle: (s.querySelector('.u11-sheet-sub') || {}).innerText,
    sections: [...s.querySelectorAll('.u11-sheet-sec')].map(e => e.innerText.trim()),
    note: (s.querySelector('.u11-sheet-note') || {}).innerText, ctrls,
    text: s.innerText.replace(/\s+/g, ' ').trim() };
});
rec('sheet-controls', sheet);

const cmdLogBefore = await page.evaluate(() => JSON.parse(JSON.stringify(window.U11.cmdLog)));
const lsBefore = await page.evaluate(() => localStorage.getItem('u11:settings'));
rec('cmdLog-len-before', { len: cmdLogBefore.length, ls: lsBefore });

// ---- MUTATE 1: autoSwitch off (routing/fallback policy)
await page.evaluate(() => {
  const cb = document.querySelector('#u11SheetSprout [data-u11set="autoSwitch"]');
  cb.checked = false; cb.dispatchEvent(new Event('change', { bubbles: true }));
});
await page.waitForTimeout(300);
rec('after-autoSwitch-off', await page.evaluate(() => ({ ls: localStorage.getItem('u11:settings'),
  cmdLogLen: window.U11.cmdLog.length })));

// ---- MUTATE 2: product -> prod:claude-max, then change "Then"
await page.evaluate(() => {
  const s = document.querySelector('#u11SheetSprout [data-u11set="product"]');
  s.value = 'prod:claude-max'; s.dispatchEvent(new Event('change', { bubbles: true }));
});
await page.waitForTimeout(400);
const thenOpts = await page.evaluate(() => {
  const s = document.querySelector('#u11SheetSprout [data-u11set="after"]');
  return { value: s.value, options: [...s.options].map(o => ({ v: o.value, t: o.text })) };
});
rec('then-options-for-claude-max', thenOpts);

await page.evaluate(() => {
  const s = document.querySelector('#u11SheetSprout [data-u11set="after"]');
  const alt = [...s.options].find(o => o.value !== s.value);
  if (alt) { s.value = alt.value; s.dispatchEvent(new Event('change', { bubbles: true })); }
});
await page.waitForTimeout(300);
rec('after-then-change', await page.evaluate(() => ({ ls: localStorage.getItem('u11:settings'),
  cmdLogLen: window.U11.cmdLog.length })));

// ---- MUTATE 3: spending limit for prod:claude-extra -> 20
const limCtrl = await page.evaluate(() => {
  const el = document.querySelector('#u11SheetSprout [data-u11limit]');
  return el ? { id: el.getAttribute('data-u11limit'), value: el.value } : null;
});
rec('spending-limit-control-present', limCtrl);
if (limCtrl) {
  await page.evaluate(() => {
    const el = document.querySelector('#u11SheetSprout [data-u11limit]');
    el.value = '20'; el.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await page.waitForTimeout(300);
  rec('after-limit-20', await page.evaluate(() => ({ ls: localStorage.getItem('u11:settings'),
    cmdLogLen: window.U11.cmdLog.length })));
}

// ---- MUTATE 4: enable an extra paid usage product that fixture says is OFF
const extraList = await page.evaluate(() => [...document.querySelectorAll('#u11SheetSprout [data-u11extra]')]
  .map(el => ({ id: el.getAttribute('data-u11extra'), checked: el.checked,
    label: el.closest('.u11-sheet-row').innerText.replace(/\s+/g, ' ').trim() })));
rec('extra-usage-toggles', extraList);
await page.evaluate(() => {
  const off = [...document.querySelectorAll('#u11SheetSprout [data-u11extra]')].find(el => !el.checked);
  if (off) { off.checked = true; off.dispatchEvent(new Event('change', { bubbles: true })); }
});
await page.waitForTimeout(400);
rec('after-extra-enable', await page.evaluate(() => ({ ls: localStorage.getItem('u11:settings'),
  cmdLogLen: window.U11.cmdLog.length,
  newLimitCtrl: !!document.querySelector('#u11SheetSprout [data-u11limit="prod:antigravity-overage"]') })));

const cmdLogAfter = await page.evaluate(() => JSON.parse(JSON.stringify(window.U11.cmdLog)));
rec('cmdLog-delta-across-all-policy-mutations',
  { before: cmdLogBefore.length, after: cmdLogAfter.length,
    added: cmdLogAfter.slice(cmdLogBefore.length) });

// ---- did the reporting surface follow the policy change?
await page.evaluate(() => { const b = document.getElementById('u11Settings'); if (b) b.click(); });
await page.waitForTimeout(300);
const after = await plansSnapshot();
rec('plans-AFTER-same-session', after);
rec('plans-diff-same-session', {
  identical: JSON.stringify(before) === JSON.stringify(after),
  nextsIdentical: JSON.stringify(before.nexts) === JSON.stringify(after.nexts) });

// ---- and after a full reload (settings are persisted)
await page.reload({ waitUntil: 'load' });
await page.waitForTimeout(1800);
await page.evaluate(() => { const b = document.querySelector('#u11Disc [data-disc="advanced"]'); if (b) b.click(); });
await page.waitForTimeout(800);
const afterReload = await plansSnapshot();
rec('plans-AFTER-reload', afterReload);
rec('plans-diff-after-reload', {
  identical: JSON.stringify(before) === JSON.stringify(afterReload),
  nextsIdentical: JSON.stringify(before.nexts) === JSON.stringify(afterReload.nexts),
  persistedSettings: await page.evaluate(() => localStorage.getItem('u11:settings')) });

// ---- does the persisted policy reach ANY renderer / any data object?
rec('policy-consumers', await page.evaluate(() => {
  const s = JSON.parse(localStorage.getItem('u11:settings'));
  return {
    persisted: s,
    fixture_claude_extra_spendingLimitMicro: window.U11.productById['prod:claude-extra'].spendingLimitMicro,
    fixture_antigravity_overage_enabled: window.U11.productById['prod:antigravity-overage'].enabled,
    fixture_meter_claude_extra: window.U11.meterById['meter:claude-extra'],
    fixture_continuation_claude_max: window.U11.continuation['prod:claude-max'],
    fixture_continuation_antigravity: window.U11.continuation['prod:antigravity-baseline'],
    U11_has_settings_key: Object.keys(window.U11).filter(k => /setting/i.test(k))
  };
}));

// ---- footer "Open Usage settings" buttons: do they reach the owner?
rec('opensettings-buttons', await page.evaluate(() => {
  const btns = [...document.querySelectorAll('[data-u11-act="opensettings"]')];
  const visible = btns.filter(b => b.offsetParent !== null);
  const listeners = (typeof window.getEventListeners === 'function') ? 'n/a' : 'no-devtools-api';
  const before = window.U11.cmdLog.length;
  let fired = 0;
  const h = () => fired++;
  document.addEventListener('u11:opensettings', h);
  if (visible[0]) visible[0].click();
  document.removeEventListener('u11:opensettings', h);
  const sheetOpen = (() => { const s = document.getElementById('u11SheetSprout');
    return !!s && !s.hidden && s.classList.contains('is-open'); })();
  return { total: btns.length, visibleNow: visible.length, label: visible[0] ? visible[0].innerText.trim() : null,
    eventFired: fired, cmdLogDelta: window.U11.cmdLog.length - before, sheetOpenedAfterClick: sheetOpen, listeners };
}));

// ---- confirm the packet's required continuation heading string
rec('continuation-heading-search', await page.evaluate(() => {
  const html = document.documentElement.outerHTML;
  const txt = document.body.innerText;
  return {
    packetHeadingInHTML: /What happens when included usage runs out\?/i.test(html),
    packetHeadingInText: /What happens when included usage runs out\?/i.test(txt),
    sheetSectionHeadings: [...document.querySelectorAll('.u11-sheet-sec')].map(e => e.innerText.trim())
  };
}));

// ---- does the fixture carry an adapter-supported-choice list at all?
rec('adapter-choice-fields', await page.evaluate(() => {
  const c = window.U11.continuation;
  const keys = new Set();
  Object.values(c).forEach(v => Object.keys(v).forEach(k => keys.add(k)));
  return { continuationFieldNames: [...keys], productFieldNames: [...new Set(window.U11.products.flatMap(p => Object.keys(p)))] };
}));

fs.writeFileSync(OUT, JSON.stringify(R, null, 2));
console.log('\nERRORS: ' + JSON.stringify(R.errors));
await browser.close();
