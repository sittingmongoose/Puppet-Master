/* hover-tip-verify.mjs — hover text tags follow the F3-523 canon timing.
 *
 *   node hover-tip-verify.mjs [--file index.html]
 *
 * WHAT IT CHECKS (all timings measured against in-page performance.now()):
 *   1  cold: pointer residence opens a tag ~1600ms after entry (no early open).
 *   2  drift: pointer jitter >5px keeps the tag closed; stopping opens it ~1100ms later.
 *   3  focus: keyboard focus opens a tag ~1000ms after focusin.
 *   4  press: pointerdown dismisses the tag and suppresses it until the pointer leaves.
 *   5  handoff: moving directly anchor-to-anchor starts a full ~1600ms dwell (no warm
 *      handoff, no stuck-closed); the old tag closes on its normal path.
 *   6  preview: activity previews still dwell 650ms.
 *   7  focus-held: a focus-opened tag survives work ticks while focus holds.
 *
 * Exit 0 all pass, 1 any FAIL, 2 bad invocation. Reads the built page, never edits it.
 */
import { chromium } from 'playwright';
import path from 'path';

const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : d; };
const ROOT = decodeURIComponent(path.dirname(new URL(import.meta.url).pathname));
const FILE = path.resolve(opt('file', path.join(ROOT, 'index.html')));
const results = [];
let failures = 0;
const check = (label, ok, detail) => {
  results.push({ label, pass: !!ok, detail: detail === undefined ? null : detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail !== undefined ? '  ' + JSON.stringify(detail).slice(0, 240) : ''}`);
  if (!ok) failures++;
};
const sleep = ms => new Promise(r => setTimeout(r, ms));
const inBand = (v, lo, hi) => v >= lo && v <= hi;

const browser = await chromium.launch({ headless: true, args: ['--allow-file-access-from-files', '--no-sandbox'] });
let code = 1;
try {
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
  page.on('pageerror', e => console.error('PAGEERROR', e.message));
  await page.goto('file://' + FILE);
  await page.waitForFunction(() => window.__PM56_BOOT_OK === true, null, { timeout: 20000 });
  await page.waitForTimeout(800);

  const sig = () => page.evaluate(() => {
    const el = document.querySelector('#pmOverlayRoot > [data-overlay="hover"]');
    return el ? el.dataset.hoverSig : 'NONE';
  });
  // One-shot entry marker: next pointerover on key records performance.now().
  const armEntry = key => page.evaluate(k => {
    window.__entry = null;
    const h = e => {
      const t = e.target && e.target.closest ? e.target.closest('[data-hover-tip]') : null;
      if (t && t.dataset.hoverKey === k) { window.__entry = performance.now(); document.removeEventListener('pointerover', h); }
    };
    document.addEventListener('pointerover', h);
  }, key);
  const entryAge = () => page.evaluate(() => window.__entry === null ? null : performance.now() - window.__entry);
  async function waitSig(key, timeoutMs, pollMs = 40) {
    const t0 = Date.now();
    for (;;) {
      const s = await sig();
      if (key === null ? s === 'NONE' : (s !== 'NONE' && s.includes(key))) return { s, dt: Date.now() - t0 };
      if (Date.now() - t0 > timeoutMs) return { s, dt: Date.now() - t0, timeout: true };
      await sleep(pollMs);
    }
  }
  // A pointer parking spot with no tip anchor and no hover-domain under it.
  const clear = await page.evaluate(() => {
    for (let y = 300; y < 800; y += 40) for (let x = 200; x < 1600; x += 40) {
      const el = document.elementFromPoint(x, y);
      if (el && !el.closest('[data-hover-tip],[data-hover-domain],button,a,input,select,textarea,[data-action]')) return { x, y };
    }
    return null;
  });
  if (!clear) { console.error('FAIL  setup  no clear parking spot'); process.exit(2); }
  const park = async () => {
    await page.mouse.move(clear.x, clear.y, { steps: 4 });
    await page.evaluate(() => { if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); });
    await waitSig(null, 1200);
  };
  // Neighbouring tip anchors (prefer the composer row), plus a focusable one and a preview domain.
  const spots = await page.evaluate(() => {
    const vis = el => { const r = el.getBoundingClientRect(); return r.width > 4 && r.height > 4 && r.x >= 0 && r.y >= 0 && r.right <= innerWidth && r.bottom <= innerHeight; };
    const ctr = el => { const r = el.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; };
    const tips = [...document.querySelectorAll('[data-hover-tip]')].filter(vis);
    const low = tips.filter(el => el.getBoundingClientRect().y > innerHeight * 0.5);
    const pool = low.length >= 2 ? low : tips;
    let best = null;
    for (let i = 0; i < pool.length; i++) for (let j = i + 1; j < pool.length; j++) {
      const A = ctr(pool[i]), B = ctr(pool[j]);
      const d = Math.hypot(A.x - B.x, A.y - B.y);
      if (d > 4 && (!best || d < best.d)) best = { d, A, B, ka: pool[i].dataset.hoverKey, kb: pool[j].dataset.hoverKey };
    }
    const foc = tips.find(el => /^(BUTTON|A|INPUT|SELECT|TEXTAREA)$/.test(el.tagName) || (el.tabIndex >= 0 && !el.closest('[data-hover-domain]')));
    const dom = [...document.querySelectorAll('[data-hover-domain]')].filter(vis)[0];
    return {
      pair: best ? { ...best, A: { ...best.A }, B: { ...best.B } } : null,
      foc: foc ? { ...ctr(foc), key: foc.dataset.hoverKey, tag: foc.tagName } : null,
      dom: dom ? { ...ctr(dom), key: dom.dataset.hoverDomain } : null,
    };
  });
  if (!spots.pair || !spots.foc || !spots.dom) { console.error('FAIL  setup  missing spots ' + JSON.stringify(spots)); process.exit(2); }
  console.log('spots pair=' + spots.pair.ka + '->' + spots.pair.kb + ' foc=' + spots.foc.key + ' dom=' + spots.dom.key);
  const { pair } = spots;

  // 1. cold: entry -> open ~1600ms.
  await park();
  await armEntry(pair.ka);
  await page.mouse.move(pair.A.x, pair.A.y, { steps: 8 });
  const c1 = await waitSig(pair.ka, 3000);
  const c1age = await entryAge();
  check('cold opens after entry', !c1.timeout && inBand(c1age, 1300, 2200), `open=${Math.round(c1age)}ms sig=${c1.s}`);

  // 5. handoff first while A is open: single-step direct move A -> B.
  const openA = await sig();
  await armEntry(pair.kb);
  await page.mouse.move(pair.B.x, pair.B.y, { steps: 1 });
  const oldGone = await waitSig(null, 800);
  check('handoff closes the old tag', oldGone.s === 'NONE', `oldGoneAfter=${oldGone.dt}ms`);
  await sleep(1000 - Math.min(1000, oldGone.dt)); // sample at ~1s after entry: new tag must NOT be open yet
  const early = await sig();
  check('handoff has no warm early open', early === 'NONE' || !early.includes(pair.kb), `at~1s=${early}`);
  const c5 = await waitSig(pair.kb, 2500);
  const c5age = await entryAge();
  check('handoff opens on a full dwell', !c5.timeout && inBand(c5age, 1300, 2200), `open=${Math.round(c5age)}ms sig=${c5.s} (was ${openA})`);

  // 2. drift: jitter >5px inside A keeps it closed; stopping opens ~1100ms later.
  await park();
  await armEntry(pair.ka);
  await page.mouse.move(pair.A.x, pair.A.y, { steps: 4 });
  await waitSig(pair.ka, 500).catch(() => ({}));
  let drifted = 0;
  const jt0 = Date.now();
  while (Date.now() - jt0 < 2300) {
    const dx = (drifted % 2 === 0 ? 7 : -7), dy = (drifted % 3 === 0 ? 7 : -7);
    await page.mouse.move(pair.A.x + dx, pair.A.y + dy, { steps: 1 });
    await sleep(120);
    drifted++;
  }
  const duringDrift = await sig();
  check('drift keeps the tag closed', duringDrift === 'NONE', `after 2.3s jitter=${duringDrift}`);
  await page.mouse.move(pair.A.x, pair.A.y, { steps: 1 });
  const stopT = Date.now();
  const c2 = await waitSig(pair.ka, 2500);
  check('stillness after drift opens ~1100ms later', !c2.timeout && inBand(Date.now() - stopT, 800, 1800), `open=${Date.now() - stopT}ms`);

  // 3. keyboard focus opens ~1000ms.
  await park();
  const fT = Date.now();
  await page.evaluate(key => {
    document.querySelector(`[data-hover-key="${CSS.escape(key)}"]`).focus();
  }, spots.foc.key);
  const c3 = await waitSig(spots.foc.key, 2500);
  check('focus opens ~1000ms', !c3.timeout && inBand(Date.now() - fT, 700, 1600), `open=${Date.now() - fT}ms sig=${c3.s}`);

  // 7. focus-held tag survives work ticks.
  await sleep(3000);
  const held = await sig();
  check('focus-held tag survives work ticks', held !== 'NONE' && held.includes(spots.foc.key), `after 3s=${held}`);
  await park();

  // 4. press dismisses and suppresses until the pointer leaves.
  await armEntry(pair.ka);
  await page.mouse.move(pair.A.x, pair.A.y, { steps: 4 });
  const c4open = await waitSig(pair.ka, 3000);
  if (c4open.timeout) { check('press setup opens the tag', false, c4open.s); }
  else {
    await page.mouse.down();
    const gone = await waitSig(null, 600);
    check('press dismisses the tag', gone.s === 'NONE', `goneAfter=${gone.dt}ms`);
    await sleep(2000);
    const supp = await sig();
    check('press suppresses while the pointer stays', supp === 'NONE', `after 2s=${supp}`);
    await page.mouse.move(clear.x, clear.y, { steps: 2 });
    await page.mouse.up(); // release away from the anchor: no click, suppression lifts on pointerout
    await sleep(300);
    await armEntry(pair.ka);
    await page.mouse.move(pair.A.x, pair.A.y, { steps: 4 });
    const c4re = await waitSig(pair.ka, 3000);
    const c4age = await entryAge();
    check('tag re-opens after leave and return', !c4re.timeout && inBand(c4age, 1300, 2200), `open=${Math.round(c4age)}ms`);
  }

  // 6. activity preview dwells 650ms.
  await park();
  const pT = Date.now();
  await page.mouse.move(spots.dom.x, spots.dom.y, { steps: 4 });
  const c6 = await waitSig(spots.dom.key, 2000);
  check('activity preview dwells 650ms', !c6.timeout && inBand(Date.now() - pT, 350, 1100), `open=${Date.now() - pT}ms sig=${c6.s}`);

  await park();
  code = failures ? 1 : 0;
  console.log(failures ? `RESULT FAIL (${failures})` : 'RESULT PASS');
} catch (e) { console.error('ERROR', e); code = 2; }
finally { await browser.close().catch(() => {}); }
process.exit(code);
