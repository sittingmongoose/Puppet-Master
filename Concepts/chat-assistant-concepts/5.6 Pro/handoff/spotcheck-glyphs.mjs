/* Glyph-presence check for the non-ASCII characters `data.js` emits.
 *
 * WHY THIS IS NOT AN ADVANCE-WIDTH COMPARISON.
 * The first version of this file compared each glyph's rendered WIDTH against a
 * tofu box and called them missing when the widths matched. That heuristic is
 * only valid in a PROPORTIONAL font. In a monospace font every glyph has the
 * same advance width by definition -- including the tofu box -- so the test
 * reports 100% missing and looks exactly like a content failure.
 *
 * That matters here because `body[data-theme^="retro"]` sets
 * `--font-ui: var(--font-mono)` (styles.css:42-43), so two of the eight themes
 * render the ENTIRE UI in the mono stack, and the file-editor diff blocks use
 * --font-mono in all eight. Advance width is not a glyph. Assert the pixels:
 * render to canvas, count ink, and compare the bitmap against a private-use
 * codepoint no font maps.
 *
 * Caught by Wave1A-Platform. Do not "simplify" this back to measuring widths.
 */
import pw from '/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro/node_modules/playwright-core/index.js';
const { chromium } = pw;
import path from 'path';
const ROOT = '/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro';
const b = await chromium.launch({ headless: true, executablePath: process.env.HOME + '/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome', args: ['--no-sandbox', '--allow-file-access-from-files', '--disable-gpu'] });
const p = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto('file://' + path.join(ROOT, 'PM_Chat_Assistant_5.6_Pro_Standalone.html'), { waitUntil: 'load' });
await p.waitForFunction(() => window.__PM56_BOOT_OK === true && window.PM56_DEMO);

/* only the characters data.js actually emits */
const MINE = { middot: '·', emdash: '—', minus: '−', arrow: '→', rsquo: '’', ellipsis: '…' };

async function probe(theme) {
  await p.evaluate(t => window.PM56_DEMO.setTheme(t), theme);
  await p.waitForTimeout(200);
  return p.evaluate(chars => {
    const TOFU = String.fromCodePoint(0xF0000);           // Plane 15 private use
    const c = document.createElement('canvas'); c.width = 64; c.height = 64;
    const g = c.getContext('2d', { willReadFrequently: true });
    const bitmap = (ch, fam) => {
      g.clearRect(0, 0, 64, 64); g.fillStyle = '#000'; g.font = `36px ${fam}`;
      g.textBaseline = 'middle'; g.fillText(ch, 8, 32);
      const d = g.getImageData(0, 0, 64, 64).data;
      let ink = 0, sig = '';
      for (let i = 3; i < d.length; i += 4) if (d[i] > 16) { ink++; sig += ((i / 4) | 0).toString(36); }
      return { ink, hash: sig.length ? sig.slice(0, 80) + ':' + sig.length : 'blank' };
    };
    const width = (ch, fam) => {
      const s = document.createElement('span'); s.textContent = ch;
      s.style.cssText = `position:fixed;left:-9999px;white-space:pre;font:12px ${fam}`;
      document.body.appendChild(s); const w = s.getBoundingClientRect().width; s.remove(); return w;
    };
    const cs = getComputedStyle(document.body);
    const stacks = { ui: cs.getPropertyValue('--font-ui').trim(), mono: cs.getPropertyValue('--font-mono').trim() };
    const out = {};
    for (const [fname, fam] of Object.entries(stacks)) {
      const tofuBm = bitmap(TOFU, fam), tofuW = width(TOFU, fam);
      const pixMissing = [], widthMissing = [];
      const rows = {};
      for (const [n, ch] of Object.entries(chars)) {
        const bm = bitmap(ch, fam), w = width(ch, fam);
        const missPix = bm.hash === tofuBm.hash || bm.hash === 'blank';
        const missWidth = Math.abs(w - tofuW) < 0.01;      // the OLD, broken heuristic
        rows[n] = { ink: bm.ink, w: +w.toFixed(2) };
        if (missPix) pixMissing.push(n);
        if (missWidth) widthMissing.push(n);
      }
      out[fname] = { family: fam.split(',')[0], tofuInk: tofuBm.ink, tofuW: +tofuW.toFixed(2), rows, pixMissing, widthMissing };
    }
    return out;
  }, MINE);
}

let bad = 0;
for (const theme of ['basic-dark', 'friendly-light', 'retro-dark', 'retro-light']) {
  const r = await probe(theme);
  console.log(`\n=== ${theme} ===`);
  for (const [stack, v] of Object.entries(r)) {
    const inks = Object.entries(v.rows).map(([n, x]) => `${n}:${x.ink}`).join(' ');
    console.log(`  ${stack.padEnd(4)} ${v.family.padEnd(28)} tofu ink=${v.tofuInk} w=${v.tofuW}`);
    console.log(`       ink   ${inks}`);
    console.log(`       PIXEL method  -> missing: ${v.pixMissing.length ? v.pixMissing.join(', ') : 'NONE'}`);
    console.log(`       WIDTH method  -> missing: ${v.widthMissing.length ? v.widthMissing.join(', ') : 'NONE'}${v.widthMissing.length ? '   <-- FALSE, monospace advance widths are all equal' : ''}`);
    if (v.pixMissing.length) bad++;
  }
}
console.log(`\nglyphs genuinely missing anywhere: ${bad === 0 ? 'NONE' : bad + ' stacks affected'}`);
console.log('page/console errors:', errs.length ? errs : 'none');
await b.close();
