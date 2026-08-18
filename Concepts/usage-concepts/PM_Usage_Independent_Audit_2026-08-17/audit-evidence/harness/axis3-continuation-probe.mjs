import { chromium } from '/mnt/Cursor/PuppetMaster/Concepts/usage-concepts/QwenUsageConcept/.verify/node_modules/playwright-core/index.mjs';
import fs from 'node:fs';
const CONCEPT = '/mnt/Cursor/PuppetMaster/Concepts/usage-concepts/QwenUsageConcept/u11-prism.html';
const EXEC = '/home/sittingmongoose/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';
const OUT = '/tmp/claude-1000/-mnt-Cursor-PuppetMaster/7e74d8f5-7c2a-4eeb-8947-13056b4b2e5f/scratchpad/axis3-sheet-all12.json';
const b = await chromium.launch({ executablePath: EXEC, args: ['--headless','--disable-gpu','--no-sandbox','--allow-file-access-from-files'] });
const p = await (await b.newContext({ viewport:{width:1700,height:1100} })).newPage();
const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type()==='error') errs.push(m.text()); });
await p.goto('file://' + CONCEPT, { waitUntil: 'load' });
await p.waitForTimeout(1800);
await p.click('#u11Settings');
await p.waitForTimeout(500);
const pids = await p.evaluate(() => Array.from(document.querySelectorAll('#u11SheetSprout select[data-u11set="product"] option')).map(o=>o.value));
const rows = [];
for (const pid of pids) {
  await p.selectOption('#u11SheetSprout select[data-u11set="product"]', pid);
  await p.waitForTimeout(320);
  rows.push(await p.evaluate((pid) => {
    const s = document.getElementById('u11SheetSprout');
    const ps = s.querySelector('select[data-u11set="product"]');
    const as = s.querySelector('select[data-u11set="after"]');
    const stored = (JSON.parse(localStorage.getItem('u11:settings')||'{}').afterIncludedByProduct||{})[pid]
      || (window.U11.settingsDefaults.afterIncludedByProduct||{})[pid] || null;
    const opts = Array.from(as.options).map(o=>({value:o.value,text:o.text,selected:o.selected}));
    return {
      productId: pid,
      productLabel: window.U11.productById[pid].label,
      productKind: window.U11.productById[pid].kind,
      dataOrder: window.U11.continuation[pid].order,
      orderSteps: window.U11.continuation[pid].order.length,
      whatHappensNext: window.U11.continuation[pid].whatHappensNext,
      renderedOptions: opts,
      renderedOptionCount: opts.length,
      droppedSteps: window.U11.continuation[pid].order.length - opts.length,
      shownSelectedText: as.options[as.selectedIndex] ? as.options[as.selectedIndex].text : null,
      shownSelectedValue: as.value,
      storedPreference: stored,
      storedPreferenceIsAnOption: opts.some(o=>o.value===stored),
      productSelectHonoured: ps.value === pid,
      rawTokenOptionTexts: opts.filter(o=>o.value===o.text).map(o=>o.text)
    };
  }, pid));
}
const sheetText = await p.evaluate(() => document.getElementById('u11SheetSprout').innerText);
// extra usage block + read-only allowance block
const roBlock = await p.evaluate(() => {
  const s = document.getElementById('u11SheetSprout');
  const ro = s.querySelector('.u11-sheet-ro');
  return ro ? ro.innerText : null;
});
fs.writeFileSync(OUT, JSON.stringify({ rows, sheetText, roBlock, pageErrors: errs }, null, 2));
console.log('WROTE', OUT, 'errs', errs.length);
await b.close();
