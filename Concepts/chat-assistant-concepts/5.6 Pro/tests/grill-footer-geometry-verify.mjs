#!/usr/bin/env node
/* Real painted UI plus forced wrap and half-button stagger, both pages.
 * --page both|standalone|pm7 --pm7-file <html> --out /tmp/footer-controls
 */
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { chatTarget, testGeometry } from './chat-target.mjs';
import { launchGpuBrowser, gpuPage } from './gpu-browser.mjs';
import { grillFooterGeometry } from './grill-footer-geometry.mjs';
const argv = process.argv.slice(2), opt = (key, fallback) => { const i = argv.indexOf(key); return i < 0 ? fallback : argv[i + 1]; };
const kind = opt('--page', 'both'), pages = kind === 'both' ? ['standalone', 'pm7'] : [kind];
const out = path.resolve(opt('--out', '/tmp/c56port-tests/footer-controls')); mkdirSync(out, { recursive: true });
const results = [];
for (const pageKind of pages) {
  const file = opt(pageKind === 'pm7' ? '--pm7-file' : '--standalone-file', pageKind === 'pm7' ? '/tmp/c56port-tests/PMConcept7.html' : 'index.html');
  const target = chatTarget(['--page', pageKind, '--file', file]);
  const browser = await launchGpuBrowser(chromium), page = gpuPage(browser);
  const check = (id, pass, measured) => { results.push({ id, page: pageKind, pass, measured, sizeContext: testGeometry() }); console.log(`${pass ? 'PASS' : 'FAIL'} ${pageKind} ${id}`); };
  try {
    await target.load(page); await target.resize(page, { width: 400, height: 860 }); await target.theme(page, 'basic-dark');
    await page.evaluate(() => PM56_WG_DEMOS.start('deepplan'));
    await page.waitForFunction(() => !!document.querySelector('#pmRoot .qs-grill [data-action="qs-accept-round"]'));
    await page.waitForTimeout(700);
    const normal = await page.evaluate(grillFooterGeometry);
    check('R2-9-normal', normal.note && !normal.tally && normal.accept === 'Accept all' && normal.rows === 1, normal);
    await page.locator('#pmRoot .qs-grill').screenshot({ path: path.join(out, `${pageKind}-normal.png`) });
    const wrap = await page.addStyleTag({ content: '.qs-grill-foot{display:grid!important;grid-template-columns:1fr!important;gap:6px!important}' });
    await page.waitForTimeout(300);
    const wrapped = await page.evaluate(grillFooterGeometry);
    check('R2-9-wrap-rejected', wrapped.rows >= 2, wrapped);
    await page.locator('#pmRoot .qs-grill').screenshot({ path: path.join(out, `${pageKind}-wrapped.png`) });
    await wrap.evaluate(el => el.remove());
    await page.evaluate(offset => { const b = document.querySelector('#pmRoot .qs-grill-foot > button'); if (b) b.style.transform = `translateY(${offset}px)`; }, Math.min(...normal.rects.map(r => r.height)) / 2);
    await page.waitForTimeout(300);
    const staggered = await page.evaluate(grillFooterGeometry);
    check('R2-9-half-stagger-rejected', staggered.rows >= 2, staggered);
    await page.locator('#pmRoot .qs-grill').screenshot({ path: path.join(out, `${pageKind}-staggered.png`) });
  } catch (e) { check('R2-9-harness', false, e.stack); }
  finally { await browser.close(); writeFileSync(path.join(out, 'results.json'), JSON.stringify(results, null, 2)); }
}
process.exitCode = results.every(r => r.pass) ? 0 : 1;
