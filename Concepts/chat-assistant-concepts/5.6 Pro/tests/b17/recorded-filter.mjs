/* Actual B17 playback + sandbox bridge boundaries. Run from the GPU-shim scratch
 * copy described in HARNESS.md; --outdir is outside the repository. */
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import { chromium } from 'playwright';

const arg = process.argv.indexOf('--outdir');
assert(arg >= 0 && process.argv[arg + 1], '--outdir is required');
const out = path.resolve(process.argv[arg + 1]);
await mkdir(out, { recursive: true });
const root = fileURLToPath(new URL('../../', import.meta.url));
const report = { checks: [], screenshots: [], errors: [] };
const check = (name, pass) => { report.checks.push({ name, pass: !!pass }); assert(pass, name); };
const browser = await chromium.launch({ args: ['--no-sandbox'] });
let page;
const selector = '.editor-body iframe.ar-interactive';
const sample = 'A-002 2 10';
const send = (op, value, extra = {}) => page.evaluate(({ op, value, extra, selector }) => {
  const m = { pm: 'filter_table', op, id: 'boundary-request', ...extra };
  if (op === 'set') m.value = value;
  document.querySelector(selector).contentWindow.postMessage(m, '*');
}, { op, value, extra, selector });
try {
  for (const width of [1440, 480]) for (const theme of ['basic-dark', 'retro-light']) {
    const cx = await browser.newContext({ viewport: { width, height: 1000 } });
    page = await cx.newPage(); page.on('pageerror', e => report.errors.push(String(e)));
    await page.goto(pathToFileURL(path.join(root, 'index.html')).href);
    await page.waitForFunction(() => window.__PM56_BOOT_OK);
    await page.evaluate(theme => { PM56_DEMO.setTheme(theme); PM56_CLOCK.setScale(3); }, theme);
    await page.locator('[data-action="open-demo"]').first().click();
    await page.locator('.demo-dialog [data-action="b17-start"][data-flow="documents"]').click();
    const frame = page.frameLocator(selector), filter = frame.locator('#filter');
    await filter.waitFor({ timeout: 15000 });
    await page.evaluate(() => PM56_CLOCK.setScale(1));
    await page.waitForFunction(() => {
      const p = PM56_RECPLAY.snapshot().b17; return p && p.current === 'b17:3';
    }, null, { timeout: 30000 });
    // Slow enough to capture a real partial word after it has isolated A-002.
    await page.evaluate(() => PM56_CLOCK.setScale(0.5));
    await filter.evaluate(el => new Promise(resolve => {
      const until = Date.now() + 10000;
      const id = setInterval(() => { if (el.value.startsWith('A-002 ') && el.value.length < 10 || Date.now() > until) { clearInterval(id); resolve(); } }, 10);
    }));
    const ring = page.locator('.rec-tap'), rb = await ring.boundingBox(), fb = await filter.boundingBox();
    const value = await filter.inputValue();
    check(`${width} ${theme}: partial filter isolates the retained second row`, value.startsWith('A-002 ') && value.length < sample.length && await frame.locator('#rows tr').count() === 1 && (await frame.locator('#rows').innerText()).startsWith('A-002'));
    check(`${width} ${theme}: lit ring follows field, inside frame and viewport`, await ring.getAttribute('data-state') === 'aim' && rb && fb && Math.abs(rb.x - fb.x + 4) < 2 && Math.abs(rb.y - fb.y + 4) < 2 && Math.abs(rb.width - fb.width - 8) < 2 && rb.x >= 0 && rb.x + rb.width <= width);
    check(`${width} ${theme}: guide narrates the filter and Next`, /Next: type A-002/.test(await page.locator('.pmx-guide:visible .pmx-guide-step').innerText()));
    const name = `mid-typing-${width}-${theme}.png`;
    await page.screenshot({ path: path.join(out, name) });
    report.screenshots.push({ name, value, ring: rb, field: fb });
    await page.evaluate(() => PM56_CLOCK.setScale(3));
    await filter.evaluate(el => new Promise(resolve => { const until = Date.now() + 10000; const id = setInterval(() => { if (el.value === 'A-002 2 10' || Date.now() > until) { clearInterval(id); resolve(); } }, 10); }));
    check(`${width} ${theme}: typing completes without a click`, await filter.inputValue() === sample);
    await page.evaluate(() => PM56_RECPLAY.stopAll());

    // Run the adversarial/lifecycle checks once; the four proofs use the actual
    // example, without injecting a value or calling the helper ourselves.
    if (width === 1440 && theme === 'basic-dark') {
      check('sandbox still grants only scripts', await page.locator(selector).getAttribute('sandbox') === 'allow-scripts');
      const src = await page.locator(selector).getAttribute('srcdoc');
      check('CSP still denies network and arbitrary scripts', src.includes("default-src 'none'; script-src 'nonce-pm-table'") && src.includes("connect-src 'none'; form-action 'none'; base-uri 'none'"));
      check('parent DOM access remains denied', await page.evaluate(selector => { try { return document.querySelector(selector).contentWindow.document === null; } catch (e) { return e.name === 'SecurityError'; } }, selector));
      await send('set', 'A-003'); await page.waitForTimeout(100);
      check('explicit bridge set dispatches live filtering', await filter.inputValue() === 'A-003' && await frame.locator('#rows tr').count() === 1);
      for (const [op, text, extra] of [['eval', 'A-001', {}], ['set', 'A-001', { selector: 'body' }], ['set', 'x'.repeat(257), {}], ['set', 5, {}]]) {
        await send(op, text, extra); await page.waitForTimeout(80);
        check(`bridge refuses ${op} ${typeof text} ${Object.keys(extra).join(',')} ${String(text).length}`, await filter.inputValue() === 'A-003');
      }
      await filter.evaluate(() => window.postMessage({ pm: 'filter_table', op: 'set', id: 'self', value: 'A-001' }, '*'));
      await page.waitForTimeout(100);
      check('messages from a window other than parent are ignored', await filter.inputValue() === 'A-003');
      await filter.fill('A-001');
      check('a person can still type directly into the field', await frame.locator('#rows tr').count() === 1 && (await frame.locator('#rows').innerText()).startsWith('A-001'));
      await send('set', ''); await page.waitForTimeout(100);

      await page.evaluate(selector => {
        window.__filterTest = PM56_RECPLAY.play({ key: 'filter-boundary', threads: () => [PM56_EXT.ctx().thread.id], live: () => true,
          next: () => ({ id: 'filter', wait: 0, run: () => PM56_RECPLAY.typeInFrame(selector, 'A-002 2 10', { cps: 2 }) }) });
      }, selector);
      await page.waitForFunction(selector => document.querySelector('.rec-tap')?.dataset.state === 'aim' && PM56_RECPLAY.players['filter-boundary']?.busy, selector);
      await page.waitForTimeout(200); // first characters arrive before the hold
      await page.evaluate(() => { PM56_EXT.ctx().state.menu = { type: 'filter-test-hold' }; });
      await page.waitForTimeout(250);
      const paused = await filter.inputValue(); await page.waitForTimeout(450);
      check('an unexpected menu holds mid-word', await filter.inputValue() === paused && paused.length < sample.length);
      await page.evaluate(() => { PM56_EXT.ctx().state.menu = null; });
      await page.waitForTimeout(100);
      check('resume leaves a reading beat before more letters', await filter.inputValue() === paused);
      await page.waitForTimeout(900);
      check('typing resumes after the hold', (await filter.inputValue()).length > paused.length);
      await page.evaluate(() => PM56_RECPLAY.stopAll());
      const stopped = await filter.inputValue(); await page.waitForTimeout(450);
      check('Stop prevents all remaining writes and hides the ring', await filter.inputValue() === stopped && await ring.getAttribute('data-state') === 'off');
      await page.emulateMedia({ reducedMotion: 'reduce' });
      check('reduced motion applies one complete value', await page.evaluate(selector => PM56_RECPLAY.typeInFrame(selector, 'A-002'), selector));
      check('reduced-motion filtering works', await filter.inputValue() === 'A-002' && await frame.locator('#rows tr').count() === 1);
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await page.evaluate(selector => { window.__removedTyping = PM56_RECPLAY.typeInFrame(selector, 'A-003 7 425', { cps: 2 }); setTimeout(() => document.querySelector(selector)?.remove(), 100); }, selector);
      check('removing the original frame aborts typing', await page.evaluate(() => window.__removedTyping) === false);
      check('missing frames fail without throwing', await page.evaluate(() => PM56_RECPLAY.typeInFrame('#not-a-frame', 'x')) === false);
    }
    await cx.close();
  }
  check('no page errors', !report.errors.length);
  report.status = 'pass';
} catch (e) {
  report.status = 'fail'; report.failure = String(e.stack || e);
  if (page && !page.isClosed()) await page.screenshot({ path: path.join(out, 'failure.png') }).catch(() => {});
  process.exitCode = 1;
} finally {
  await browser.close();
  await writeFile(path.join(out, 'RESULT.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report));
}
