import { chromium } from '/mnt/Cursor/PuppetMaster/Concepts/usage-concepts/QwenUsageConcept/.verify/node_modules/playwright-core/index.mjs';
import { writeFileSync } from 'node:fs';
import os from 'node:os'; import path from 'node:path';
const ctx = await chromium.launchPersistentContext(path.join(os.tmpdir(), 'bl-' + process.pid),
  { executablePath: '/home/sittingmongoose/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome', headless: true, args: ['--no-sandbox', '--disable-gpu'], viewport: { width: 1900, height: 1200 } });
const p = await ctx.newPage();
await p.goto('file:///mnt/Cursor/PuppetMaster/Concepts/usage-concepts/QwenUsageConcept/u11-prism.html', { waitUntil: 'load', timeout: 60000 });
await p.waitForTimeout(1200);
await p.evaluate(() => { const b = document.querySelector('[data-disc="advanced"]'); if (b) b.click(); });
await p.waitForTimeout(900);
const R = await p.evaluate(async () => {
  const sleep = ms => new Promise(r => setTimeout(r, ms)); const U = window.U11; const out = {};
  const goRoom = async r => { const b = document.querySelector(`.u11-item[data-tab="${r}"]`); if (b) { b.click(); await sleep(560); document.querySelectorAll('.u11w-more-t').forEach(x => { try { x.click(); } catch (e) { } }); await sleep(340); } };
  const pt = r => { const e = document.querySelector(`[data-pane="${r}"]`); return e ? e.innerText : ''; };
  /* A04-01 counting semantics */
  const s = JSON.stringify(U);
  out['A04-01'] = { counting_semantics: /counting_semantics|countingSemantics/.test(s),
    input_total_includes_cache: /input_total_includes_cache|inputTotalIncludesCache/.test(s),
    provider_total_semantics: /provider_total_semantics|providerTotalSemantics/.test(s) };
  await goRoom('analytics'); const at = pt('analytics');
  out['A04-01'].analytics_note = (at.match(/[^\n]*Column totals[^\n]*/) || [''])[0];
  /* A07-01 free rows route */
  await goRoom('free'); const ft = pt('free');
  out['A07-01'] = { free_slice: ft.slice(0, 1400), rows: document.querySelectorAll('[data-pane="free"] .u11w-prow').length,
    freeModels: (U.freeModels || []).map(f => ({ id: f.id, model: f.modelId, conn: f.connectionId, meter: f.meterId })) };
  /* A01-01 sheet write path */
  document.getElementById('u11Settings').click(); await sleep(700);
  const sh = document.getElementById('u11SheetSprout');
  out['A01-01'] = { editable_inputs: sh ? sh.querySelectorAll('input:not([disabled]),select:not([disabled]),textarea:not([disabled])').length : -1,
    header: sh ? sh.innerText.slice(0, 220) : null,
    localstorage_keys: Object.keys(localStorage) };
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); await sleep(300);
  /* A03-02 after-included list */
  out['A03-02'] = { sheet_has_all_products: sh ? /Extra Bundle|pack|Zen balance/.test(sh.innerText) : null };
  return out;
});
writeFileSync('/tmp/claude-1000/-mnt-Cursor-PuppetMaster/7e74d8f5-7c2a-4eeb-8947-13056b4b2e5f/scratchpad/blockers.json', JSON.stringify(R, null, 1));
console.log(JSON.stringify(R, null, 1).slice(0, 3000));
await ctx.close();
