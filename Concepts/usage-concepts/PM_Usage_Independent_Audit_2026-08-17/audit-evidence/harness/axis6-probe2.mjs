import { chromium } from '/tmp/claude-1000/-mnt-Cursor-PuppetMaster/7e74d8f5-7c2a-4eeb-8947-13056b4b2e5f/scratchpad/replay-sandbox/.verify/node_modules/playwright-core/index.mjs';
import fs from 'node:fs';
const CHROME = '/home/sittingmongoose/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';
const URL = 'file:///mnt/Cursor/PuppetMaster/Concepts/usage-concepts/QwenUsageConcept/u11-prism.html';
const OUT = '/tmp/claude-1000/-mnt-Cursor-PuppetMaster/7e74d8f5-7c2a-4eeb-8947-13056b4b2e5f/scratchpad/axis6';
const out = {};
const browser = await chromium.launch({ executablePath: CHROME, args: ['--headless=new', '--disable-gpu', '--no-sandbox', '--allow-file-access-from-files'] });
const ctx = await browser.newContext({ viewport: { width: 1700, height: 1200 } });
const page = await ctx.newPage();
const msgs = []; page.on('console', m => msgs.push(m.type() + ':' + m.text())); page.on('pageerror', e => msgs.push('pageerror:' + e.message));
await page.goto(URL, { waitUntil: 'load' });
await page.waitForSelector('article.uw');
await page.waitForTimeout(800);

async function goTab(name) {
  await page.evaluate(() => { const g = document.querySelector('#u11MoreGrp'); if (g && g.classList.contains('closed')) document.querySelector('[data-more-toggle]').click(); });
  await page.waitForTimeout(200);
  await page.click(`.u11-rail .u11-item[data-tab="${name}"]`, { timeout: 8000 });
  await page.waitForTimeout(600);
}

/* ledger room structure */
await goTab('ledger');
out.ledgerRoom = await page.evaluate(() => {
  const pane = document.querySelector('.u11-pane:not(.pm-hidden)');
  const cards = Array.from(pane.querySelectorAll('article.uw'));
  return {
    paneName: pane.getAttribute('data-pane'),
    paneTextLen: pane.innerText.length,
    canvases: Array.from(pane.querySelectorAll('[data-u11-page]')).map(c => ({ page: c.getAttribute('data-u11-page'), types: c.getAttribute('data-u11-types'), kids: c.children.length })),
    cards: cards.map(c => ({
      title: (c.querySelector('.uw-tt') || {}).textContent,
      h: c.offsetHeight, disp: getComputedStyle(c).display,
      bodyLen: (c.querySelector('.uw-body') || {}).innerText ? c.querySelector('.uw-body').innerText.length : 0,
      innerTextLen: c.innerText.length
    }))
  };
});

/* runs + operations widget text via textContent (robust to innerText quirks) */
out.runsOps = await page.evaluate(() => {
  const pane = document.querySelector('.u11-pane:not(.pm-hidden)');
  const cards = Array.from(pane.querySelectorAll('article.uw'));
  const pick = (needle) => {
    const c = cards.find(x => ((x.querySelector('.uw-tt') || {}).textContent || '').indexOf(needle) === 0);
    if (!c) return null;
    const body = c.querySelector('.uw-body');
    return { titleFound: (c.querySelector('.uw-tt') || {}).textContent, textContent: body.textContent.replace(/\s+/g, ' ').trim(), innerText: body.innerText, offsetH: c.offsetHeight, bodyScrollH: body.scrollHeight, bodyClientH: body.clientHeight };
  };
  return { runs: pick('Runs'), operations: pick('Maintenance') };
});

/* attempt inspector time rendering (ue-560) */
out.attempt = await page.evaluate(() => {
  window.U11RunDetail.openAttempt('ue-560');
  const p = document.querySelector('.u11rd');
  return { text: p.innerText, kvs: Array.from(p.querySelectorAll('.u11rd-kv')).map(k => k.innerText.replace(/\n/g, ' = ')) };
});
await page.evaluate(() => window.U11RunDetail.close());

/* tools widget latency (tool/runtime execution time) */
await goTab('tools');
out.tools = await page.evaluate(() => {
  const pane = document.querySelector('.u11-pane:not(.pm-hidden)');
  const c = Array.from(pane.querySelectorAll('article.uw'))[0];
  return { title: (c.querySelector('.uw-tt') || {}).textContent, text: c.querySelector('.uw-body').textContent.replace(/\s+/g, ' ').trim().slice(0, 1200) };
});

/* forecast refresh CTA behaviour */
await goTab('overview');
out.refresh = await page.evaluate(async () => {
  const before = document.querySelector('.u11-pane:not(.pm-hidden)').innerText;
  const btn = Array.from(document.querySelectorAll('[data-u11-act="reqforecast"]'))[0];
  const info = { found: !!btn, run: btn ? btn.getAttribute('data-run') : null };
  if (btn) { btn.scrollIntoView({ block: 'center' }); btn.click(); }
  await new Promise(r => setTimeout(r, 700));
  const after = document.querySelector('.u11-pane:not(.pm-hidden)').innerText;
  info.textChanged = before !== after;
  info.toast = (document.querySelector('.rail-toast') || {}).innerText || null;
  info.generatedLine = (after.match(/generated [^\n]+/g) || []);
  return info;
});

/* timezone behaviour under an explicit IANA zone, for contrast */
out.zoneUTC = await page.evaluate(() => ({ resolved: Intl.DateTimeFormat().resolvedOptions().timeZone, used: window.U11time.zone, fallback: window.U11time.zoneIsFallback, clockOfNow: window.U11time.clock(Date.parse(window.U11.meta.now)), full: window.U11time.full(window.U11.meta.now) }));

const ctx2 = await browser.newContext({ viewport: { width: 1700, height: 1200 }, timezoneId: 'Asia/Tokyo' });
const p2 = await ctx2.newPage();
await p2.goto(URL, { waitUntil: 'load' });
await p2.waitForSelector('article.uw');
await p2.waitForTimeout(700);
out.zoneTokyo = await p2.evaluate(() => ({ resolved: Intl.DateTimeFormat().resolvedOptions().timeZone, used: window.U11time.zone, fallback: window.U11time.zoneIsFallback, clockOfNow: window.U11time.clock(Date.parse(window.U11.meta.now)), full: window.U11time.full(window.U11.meta.now), paneSample: document.querySelector('.u11-pane:not(.pm-hidden)').innerText.match(/\d{1,2}:\d{2}\s+[A-Z]{2,5}/g) }));

const ctx3 = await browser.newContext({ viewport: { width: 1700, height: 1200 }, timezoneId: 'UTC' });
const p3 = await ctx3.newPage();
await p3.goto(URL, { waitUntil: 'load' });
await p3.waitForSelector('article.uw');
await p3.waitForTimeout(700);
out.zoneUTCexplicit = await p3.evaluate(() => ({ resolved: Intl.DateTimeFormat().resolvedOptions().timeZone, used: window.U11time.zone, fallback: window.U11time.zoneIsFallback, clockOfNow: window.U11time.clock(Date.parse(window.U11.meta.now)), full: window.U11time.full(window.U11.meta.now), paneSample: document.querySelector('.u11-pane:not(.pm-hidden)').innerText.match(/\d{1,2}:\d{2}\s+[A-Z]{2,5}/g) }));

out.msgs = msgs;
fs.writeFileSync(OUT + '/probe6b.json', JSON.stringify(out, null, 1));
console.log('ok');
await browser.close();
