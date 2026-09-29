/* Shared helpers for tests/pmx-verify.mjs, tests/pmx-gallery.mjs and the surface
   files. The `_` prefix keeps the surface loader from reading it as a surface file. */

import { pathToFileURL } from 'node:url';

/* Open the built app on a fresh page: file:// only (http hangs in this sandbox),
   brought to front so timers and rAF run, the first demo work run completed. */
export async function openApp(browser, file, size = { width: 1440, height: 900 }) {
  const page = await browser.newPage({ viewport: size });
  const errors = [];
  page.on('pageerror', e => errors.push('PAGEERROR ' + String(e && e.message || e)));
  page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE ' + m.text()); });
  await page.goto(pathToFileURL(file).href);
  await page.bringToFront();
  await page.waitForFunction(() => window.PM56_DEMO && window.PM56_EXT && window.PM56_SHELL && window.__PM56_BOOT_OK !== false, null, { timeout: 20000 });
  await page.waitForTimeout(900);
  await page.evaluate(() => { try { window.PM56_DEMO.completeWorking(); } catch (e) { } });
  return { page, errors, h: makeHelpers(page) };
}

/* wait until nothing finite is moving inside pmx surfaces and no ghost is left */
export function inPageBusy() {
  const isPmxEl = el => !!(el && el.classList && [...el.classList].some(c => c.indexOf('pmx-') === 0));
  const inPmx = el => { for (let p = el; p; p = p.parentElement) if (isPmxEl(p)) return true; return false; };
  const moving = document.getAnimations().filter(a => a.playState === 'running' && a.effect && a.effect.target && a.effect.getTiming().iterations !== Infinity && inPmx(a.effect.target)).length;
  return moving + document.querySelectorAll('.pmx-ghost, .pmx-flight').length;
}

export function makeHelpers(page) {
  const ev = (fn, arg) => page.evaluate(fn, arg);
  const wait = ms => page.waitForTimeout(ms);
  async function clickVisible(sel) { for (const hd of await page.$$(sel)) if (await hd.isVisible() && await hd.isEnabled()) { await hd.click(); return true; } return false; }
  /* settle() waits out finite pmx motion; the reduced-motion census turns it off
     (helpers.noSettle) so a surface's own open() cannot wait the motion away */
  async function settle(max = 3000) {
    if (helpers.noSettle) return;
    const t0 = Date.now();
    await wait(80);
    while (Date.now() - t0 < max) { if (!(await ev(inPageBusy))) break; await wait(100); }
    await wait(60);
  }
  async function closeAll() {
    await ev(() => { const c = window.PM56_EXT && window.PM56_EXT.ctx(); if (!c) return; c.state.menu = null; c.state.dialog = null; c.renderOverlays(); c.renderApp(); });
    await settle(1500);
  }
  async function openWand() { const open = await ev(() => (window.PM56_EXT.ctx().state.menu || {}).type === 'wand'); if (!open) { await clickVisible('[data-action="open-menu"][data-menu="wand"]'); await wait(350); } }
  async function wandGroup(g) { await openWand(); const isOn = await ev(g => window.PM56_EXT.ctx().state.polishWandGroup === g, g); if (!isOn) { await clickVisible(`[data-action="polish-wand-group"][data-group="${g}"]`); await wait(350); } }
  async function wandDialog(group, sel, hoverSel) { await closeAll(); await wandGroup(group); if (hoverSel) { await page.hover(hoverSel); await wait(400); } const ok = await clickVisible(sel); await wait(300); await settle(); return ok; }
  async function action(name, data = {}) {
    return ev(([name, data]) => { const b = document.createElement('button'); b.dataset.action = name; Object.assign(b.dataset, data); const f = window.PM56_EXT._actions[name]; if (!f) return 'no-action'; f(window.PM56_EXT.ctx(), b, new Event('click')); window.PM56_EXT.ctx().renderApp(); return 'ok'; }, [name, data]);
  }
  async function demo(act, flow) { const r = await action(act, { flow }); await wait(900); return r; }
  async function drive(n = 5, gap = 2200) {
    const log = [];
    for (let i = 0; i < n; i++) {
      log.push(await ev(() => { const d = document.querySelector('#pmOverlayRoot .dialog'); if (d) { const bs = [...d.querySelectorAll('.primary-button')].filter(b => !b.disabled && b.offsetParent); const b = bs.at(-1); if (b) { const t = b.textContent.trim(); b.click(); return 'dialog:' + t; } return 'dialog:none'; } const g = document.querySelector('[class*="demo-guide"]'); const bs = g ? [...g.querySelectorAll('button')].filter(b => !b.disabled && !/replay|close/i.test((b.dataset.action || '') + b.title) && b.offsetParent) : []; if (bs[0]) { const t = bs[0].textContent.trim(); bs[0].click(); return 'guide:' + t; } return 'idle'; }));
      await wait(gap);
    }
    return log;
  }
  async function theme(name) { await ev(n => window.PM56_DEMO.setTheme(n), name); await wait(360); }
  async function setSize(w, h) { await page.setViewportSize({ width: w, height: h }); await wait(320); }
  /* transcript layouts at 1440 wide: pinned history (417 px cards), closed (591), Activity pinned (~337);
     `pinned-WxH`: pinned history in a WxH window (see chatLayout);
     `wNNN` (w391, w311): history pinned, in the window width (height kept) that gives an NNN px card,
     found by bisection on the real layout (IMPACT A2-25: the canon 390-590 px narrow chat states and the
     391 / 591 / 311 card widths of 10.4). helpers.cardFit = {target, w, cw} tells the caller where it landed. */
  const fitCache = new Map();
  async function cardWidth() {
    return ev(() => {
      /* a run card or receipt, else an assistant-side transcript item (the spine gutter indents those, never the
         user's own messages, which span the full column), else a bare probe (the full column: the last resort) */
      const c = [...document.querySelectorAll('.transcript .pmx-run')].find(x => x.getClientRects().length) ||
        [...document.querySelectorAll('.transcript-inner > [data-family]:not([data-family="user"])')].find(x => x.getClientRects().length);
      if (c) return c.getBoundingClientRect().width;
      const inner = document.querySelector('.transcript-inner'); if (!inner) return 0;
      const d = document.createElement('div'); d.setAttribute('data-family', 'ledger'); d.style.cssText = 'height:0;margin-top:0;margin-bottom:0;padding:0';
      inner.appendChild(d); const w = d.getBoundingClientRect().width; d.remove(); return w;
    });
  }
  async function fitCardWidth(target) {
    const vh = page.viewportSize().height;
    let best = null;
    const at = async w => { await page.setViewportSize({ width: w, height: vh }); await wait(90); const cw = await cardWidth(); if (!best || Math.abs(cw - target) < Math.abs(best.cw - target)) best = { w, cw }; return cw; };
    const known = fitCache.get(target);
    if (known) { const cw = await at(known); if (Math.abs(cw - target) <= 1) { await wait(160); helpers.cardFit = { target, w: known, cw: Math.round(cw * 10) / 10 }; return helpers.cardFit; } }
    let lo = 960, hi = 1440;
    while (hi - lo > 1) { const mid = Math.round((lo + hi) / 2); if (await at(mid) < target) lo = mid; else hi = mid; }
    await at(lo); await at(hi);
    await page.setViewportSize({ width: best.w, height: vh }); await wait(250);
    fitCache.set(target, best.w);
    helpers.cardFit = { target, w: best.w, cw: Math.round(best.cw * 10) / 10 };
    return helpers.cardFit;
  }
  /* `pinned-WxH` (pinned-1024x768, pinned-900x800): history pinned in a WxH window, the S-tier cards of 7.2
     (230 and 204 px; F0 review cycle 2: the spec's "211 (1024 wide)" example, which no other layout reached).
     helpers.cardFit = {w, h, cw} says what card width it gave. */
  async function chatLayout(name) {
    const fit = /^w(\d+)$/.exec(name || ''), win = /^pinned-(\d+)x(\d+)$/.exec(name || '');
    if (win) await setSize(+win[1], +win[2]);
    await ev(name => {
      const c = window.PM56_EXT.ctx();
      c.state.historyMode = name === 'closed' || name === 'activity' ? 'closed' : 'pinned';
      c.state.activity.open = name === 'activity'; c.state.activity.pinned = name === 'activity';
      c.renderApp();
    }, name);
    await wait(250);
    helpers.cardFit = null;
    if (fit) await fitCardWidth(+fit[1]);
    if (win) { const cw = await cardWidth(); helpers.cardFit = { w: +win[1], h: +win[2], cw: Math.round(cw * 10) / 10 }; }
  }
  async function selectThread(id) { await ev(id => window.PM56_DEMO.selectThread(id), id); await wait(300); }
  async function openEditor(id) { await ev(id => window.PM56_EXT.ctx().openEditor(id), id); await wait(300); }
  async function closeEditor(id) { await ev(id => window.PM56_EXT.ctx().closeEditor(id), id); await wait(200); }
  async function tickOnce() { await ev(() => window.PM56_DEMO.tickOnce && window.PM56_DEMO.tickOnce()); }
  async function addScript(content) { await page.addScriptTag({ content }); }
  const helpers = { page, ev, wait, clickVisible, settle, closeAll, openWand, wandGroup, wandDialog, action, demo, drive, theme, setSize, chatLayout, fitCardWidth, cardWidth, selectThread, openEditor, closeEditor, tickOnce, addScript, noSettle: false, cardFit: null };
  return helpers;
}

/* Streaming realism (10.1 step 7): a deterministic 1,500-word markdown message with
   headings, emphasis, a list, a fenced code block with one very long line and a
   six-column table with an unbroken 48-character token. */
export function longMarkdown() {
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const W = ('the export page reads rows from the collection and writes them out as quoted fields so titles with commas quotes and line breaks survive a round trip ' +
    'through a spreadsheet without losing their order while memory stays flat because each page of five hundred rows is released before the next one is read ' +
    'reviewers asked whether the header row should follow the visible columns or the stored schema and the answer depends on what people expect to paste').split(' ');
  const sentence = n => { const w = []; for (let i = 0; i < n; i++) w.push(W[Math.floor(rnd() * W.length)]); w[0] = w[0][0].toUpperCase() + w[0].slice(1); return w.join(' ') + '.'; };
  const para = () => { const s = []; for (let i = 0; i < 5; i++) s.push(sentence(12 + Math.floor(rnd() * 8))); s[1] = s[1].replace(/(\w+)/, '**$1**'); s[2] = s[2].replace(/ (\w+)/, ' *$1*'); s[3] = s[3].replace(/ (\w+)/, ' `$1`'); return s.join(' '); };
  const out = ['# Plan for streaming the collection export', '', para(), '', '## What changes', '', para(), '', para(), '',
    '- Read rows in pages of 500 so memory stays flat', '- Quote every field that holds a comma, a quote or a line break', '- Keep the order exactly as it appears on screen',
    '- Write the header from the visible columns', '- Stream the file instead of building one 40 MB string', '- Log how many rows were written', '',
    '```ts', 'export async function* exportCollection(query: Query, pageSize = 500): AsyncGenerator<string> {', '  yield header(query.visibleColumns).join(",") + "\\n";',
    '  for await (const page of pages(query, pageSize)) {', '    for (const row of page) {', '      const cells = query.visibleColumns.map((c) => quote(row[c.key]));',
    '      yield cells.join(",") + "\\n"; // a deliberately long comment that runs well past the width of any card or view column so the block must scroll inside its own box and never widen the page around it',
    '    }', '  }', '}', '', 'function quote(value: unknown): string {', '  const s = value == null ? "" : String(value);', '  return /[",\\n]/.test(s) ? `"${s.replace(/"/g, \'""\')}"` : s;', '}', '```', '',
    para(), '', '| Rows | Before | After | Peak memory | Notes | Identifier |', '|---|---|---|---|---|---|'];
  for (let i = 1; i <= 10; i++) out.push(`| ${i * 5000} | ${i * 40} MB | 1.2 MB | ${i * 3} MB | ${sentence(9)} | sha256-${'0123456789abcdef'.repeat(4).slice(i, i + 48)} |`);
  out.push('', '> Keep the order exactly as it appears on screen, even when a title starts with a quote.', '', '---', '');
  while (out.join(' ').split(/\s+/).length < 1500) { out.push(para(), ''); }
  out.push('See [the export notes](https://example.com/docs/export) for the full list.');
  return out.join('\n');
}
