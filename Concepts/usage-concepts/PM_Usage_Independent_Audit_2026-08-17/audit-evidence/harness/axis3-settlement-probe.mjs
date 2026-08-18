/* AXIS 3 probe — settlement / product-kind / continuation conflation.
   READ-ONLY against the concept. Writes only into the scratchpad. */
import { chromium } from '/mnt/Cursor/PuppetMaster/Concepts/usage-concepts/QwenUsageConcept/.verify/node_modules/playwright-core/index.mjs';
import fs from 'node:fs';

const CONCEPT = '/mnt/Cursor/PuppetMaster/Concepts/usage-concepts/QwenUsageConcept/u11-prism.html';
const OUT = '/tmp/claude-1000/-mnt-Cursor-PuppetMaster/7e74d8f5-7c2a-4eeb-8947-13056b4b2e5f/scratchpad/axis3-results.json';
const EXEC = '/home/sittingmongoose/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';

const res = { generatedAt: new Date().toISOString(), groups: {} };

const b = await chromium.launch({
  executablePath: EXEC,
  args: ['--headless', '--disable-gpu', '--no-sandbox', '--no-first-run', '--no-default-browser-check',
         '--allow-file-access-from-files']
});
const ctx = await b.newContext({ viewport: { width: 1700, height: 1100 } });
const page = await ctx.newPage();
const consoleErrs = [];
page.on('console', m => { if (m.type() === 'error') consoleErrs.push(m.text()); });
page.on('pageerror', e => consoleErrs.push('PAGEERROR ' + e.message));
await page.goto('file://' + CONCEPT, { waitUntil: 'load' });
await page.waitForTimeout(1800);

// force Advanced disclosure
await page.evaluate(() => {
  const b = document.querySelector('#u11Disc [data-disc="advanced"]');
  if (b) b.click();
});
await page.waitForTimeout(1200);

async function room(name) {
  await page.evaluate((n) => {
    const b = document.querySelector('.u11-item[data-tab="' + n + '"]');
    if (b) b.click();
  }, name);
  await page.waitForTimeout(900);
}

/* ---------- G1: Plans room — how each product row renders ---------- */
await room('plans');
res.groups.plansRows = await page.evaluate(() => {
  const out = [];
  document.querySelectorAll('.u11-pane[data-pane="plans"] .u11w-prow').forEach(p => {
    const lab = p.querySelector('.u11w-mlab, .u11w-vlab');
    const val = p.querySelector('.u11w-vval');
    out.push({
      label: lab ? lab.innerText.trim() : null,
      value: val ? val.innerText.replace(/\s+/g, ' ').trim() : null,
      unitEl: val && val.querySelector('.u11w-unit') ? val.querySelector('.u11w-unit').textContent : null,
      sub: Array.from(p.querySelectorAll('.u11w-sub')).map(s => s.innerText.replace(/\s+/g, ' ').trim()),
      next: p.querySelector('.u11w-next') ? p.querySelector('.u11w-next').innerText.replace(/\s+/g, ' ').trim() : null
    });
  });
  // also the collapsed "other products" list
  const more = document.querySelector('.u11-pane[data-pane="plans"] [data-u11-more="plans"] .u11w-more-b');
  const moreRows = [];
  if (more) more.querySelectorAll('.u11w-vrow').forEach(r => {
    moreRows.push({ label: r.querySelector('.u11w-vlab') ? r.querySelector('.u11w-vlab').innerText.trim() : null,
                    value: r.querySelector('.u11w-vval') ? r.querySelector('.u11w-vval').innerText.replace(/\s+/g,' ').trim() : null,
                    unitEl: r.querySelector('.u11w-unit') ? r.querySelector('.u11w-unit').textContent : null });
  });
  return { shown: out, other: moreRows, moreHiddenByDefault: more ? more.hasAttribute('hidden') : null };
});

/* ---------- G2: unit/percent cross-check per meter as the UI would show it ---------- */
res.groups.meterUnitMatrix = await page.evaluate(() => {
  const D = window.U11;
  return D.meters.map(m => ({
    id: m.id, product: (D.productById[m.productId] || {}).label,
    kind: (D.productById[m.productId] || {}).kind,
    unit: m.unit, windowKind: m.windowKind, used: m.used, limit: m.limit, usedPct: m.usedPct,
    resetAt: m.resetAt, expiresAt: m.expiresAt || null, vs: m.vs, settlement: m.settlement
  }));
});

/* ---------- G3: settings sheet — the 12 continuation policies ---------- */
res.groups.continuationSheet = await page.evaluate(async () => {
  const out = [];
  document.getElementById('u11Settings').click();
  await new Promise(r => setTimeout(r, 500));
  const sheet = document.getElementById('u11SheetSprout');
  const prodSel = sheet.querySelector('select[data-u11set="product"]');
  const pids = Array.from(prodSel.options).map(o => o.value);
  for (const pid of pids) {
    prodSel.value = pid;
    prodSel.dispatchEvent(new Event('change', { bubbles: true }));
    await new Promise(r => setTimeout(r, 220));
    const s2 = document.getElementById('u11SheetSprout');
    const ps = s2.querySelector('select[data-u11set="product"]');
    const as = s2.querySelector('select[data-u11set="after"]');
    out.push({
      productId: pid,
      productLabel: window.U11.productById[pid] ? window.U11.productById[pid].label : null,
      dataOrder: window.U11.continuation[pid].order,
      whatHappensNext: window.U11.continuation[pid].whatHappensNext,
      renderedOptions: Array.from(as.options).map(o => ({ value: o.value, text: o.text, selected: o.selected })),
      selectValueShown: as.value,
      selectedIndex: as.selectedIndex,
      storedPreference: (JSON.parse(localStorage.getItem('u11:settings') || '{}').afterIncludedByProduct || {})[pid]
        || (window.U11.settingsDefaults.afterIncludedByProduct || {})[pid] || null,
      productSelectStillCorrect: ps.value === pid
    });
  }
  return out;
});

/* ---------- G3b: sheet read-only allowance block + extra-usage block ---------- */
res.groups.sheetText = await page.evaluate(() => {
  const s = document.getElementById('u11SheetSprout');
  return {
    fullText: s.innerText.replace(/\n{2,}/g, '\n').trim(),
    visible: !s.hidden && s.offsetHeight > 0,
    afterOptionTexts: Array.from(s.querySelectorAll('select[data-u11set="after"] option')).map(o => o.text)
  };
});
await page.evaluate(() => { const s = document.getElementById('u11SheetSprout'); if (s) { s.hidden = true; s.classList.remove('is-open'); } });

/* ---------- G4: costs room text ---------- */
await room('costs');
res.groups.costsRoom = await page.evaluate(() => {
  const p = document.querySelector('.u11-pane[data-pane="costs"]');
  const c = window.U11.costs;
  return {
    identityHolds: c.apiBilledMicro + c.planIncludedMicro === c.spentMonthMicro,
    figures: { spentMonthMicro: c.spentMonthMicro, apiBilledMicro: c.apiBilledMicro,
               planIncludedMicro: c.planIncludedMicro, spendingLimitMicro: c.spendingLimitMicro },
    renderedText: p ? p.innerText.replace(/\n{2,}/g, '\n').trim() : null
  };
});

/* ---------- G5: KPI strip + overview ---------- */
res.groups.kpiStrip = await page.evaluate(() => {
  const el = document.getElementById('u11Kpis');
  return el ? el.innerText.replace(/\n{2,}/g, '\n').trim() : null;
});

/* ---------- G6: reference / catalog price anywhere in the DOM ---------- */
res.groups.referencePrice = await page.evaluate(() => {
  const rooms = ['overview','plans','costs','accounts','free','context','analytics','ledger','attention','cache','tools','signals','authority'];
  const html = document.documentElement.outerHTML;
  const rx = {
    referenceApiPrice: /reference\s+api/i.test(html),
    referencePrice: /reference\s+price/i.test(html),
    catalogPrice: /catalog\s+price/i.test(html),
    listPrice: /list\s+price/i.test(html),
    perMillionTokens: /per\s*(1\s*)?m(illion)?\s*tokens/i.test(html),
    priceVersion: /price\s+version/i.test(html),
    dollarPerMtok: /\$[\d.]+\s*\/\s*M/i.test(html)
  };
  return { rx, roomsChecked: rooms.length };
});

/* ---------- G7: authority room + ledger attempt inspector: billingRoute / settlement labels ---------- */
await room('authority');
res.groups.authorityRoom = await page.evaluate(() => {
  const p = document.querySelector('.u11-pane[data-pane="authority"]');
  return p ? p.innerText.replace(/\n{2,}/g, '\n').trim().slice(0, 6000) : null;
});

await room('ledger');
res.groups.ledgerAttemptInspector = await page.evaluate(async () => {
  const p = document.querySelector('.u11-pane[data-pane="ledger"]');
  // click the first attempt row we can find
  const cand = p.querySelector('[data-att]');
  const out = { clicked: cand ? cand.getAttribute('data-att') : null };
  if (cand) { cand.click(); await new Promise(r => setTimeout(r, 700)); }
  const rd = document.querySelector('.u11rd');
  out.rundetailPresent = !!rd;
  if (rd) {
    out.text = rd.innerText.replace(/\n{2,}/g, '\n').trim();
    out.kvPairs = Array.from(rd.querySelectorAll('.u11rd-kv, .u11rd-k, .u11rd-row')).map(e => e.innerText.replace(/\s+/g,' ').trim()).slice(0, 200);
  }
  return out;
});

/* ---------- G8: every attempt's billingRoute label as rendered by R.human ---------- */
res.groups.routeLabelMap = await page.evaluate(() => {
  const R = window.USrender;
  const vals = ['plan_included','api_billed','free','usage_pack','extra_balance','no_charge_observed','unknown'];
  const present = {};
  window.U11.attempts.forEach(a => { present[a.billingRoute] = (present[a.billingRoute] || 0) + 1; });
  const settle = {};
  window.U11.attempts.forEach(a => { settle[a.settlement] = (settle[a.settlement] || 0) + 1; });
  return {
    schemaClaimedValues: vals,
    humanLabels: vals.reduce((o, v) => (o[v] = R.human(v), o), {}),
    presentInAttempts: present,
    settlementPresentInAttempts: settle,
    attemptCount: window.U11.attempts.length
  };
});

/* ---------- G9: product-kind visibility — is each of the 10 kinds distinguishable in UI text? ---------- */
res.groups.productKindVisibility = await page.evaluate(async () => {
  const kinds = {};
  window.U11.products.forEach(p => { kinds[p.kind] = kinds[p.kind] || []; kinds[p.kind].push(p.label); });
  const rooms = ['overview','plans','costs','accounts','free','context','analytics','ledger','attention','cache','tools','signals','authority'];
  const seen = {};
  for (const r of rooms) {
    const btn = document.querySelector('.u11-item[data-tab="' + r + '"]');
    if (btn) btn.click();
    await new Promise(x => setTimeout(x, 450));
    const pane = document.querySelector('.u11-pane[data-pane="' + r + '"]');
    if (!pane) continue;
    const t = pane.innerText;
    Object.keys(kinds).forEach(k => {
      const words = k.replace(/_/g, ' ');
      if (!seen[k]) seen[k] = { rawTokenRooms: [], humanRooms: [] };
      if (t.indexOf(k) >= 0) seen[k].rawTokenRooms.push(r);
      if (new RegExp(words, 'i').test(t)) seen[k].humanRooms.push(r);
    });
  }
  return { kinds, seen };
});

/* ---------- G10: product label presence per room (are all 27 products reachable?) ---------- */
res.groups.productLabelReach = await page.evaluate(async () => {
  const rooms = ['overview','plans','costs','accounts','free','context','analytics','ledger','attention','cache','tools','signals','authority'];
  const prods = window.U11.products.map(p => ({ id: p.id, label: p.label, kind: p.kind }));
  const hit = {};
  prods.forEach(p => hit[p.id] = []);
  for (const r of rooms) {
    const btn = document.querySelector('.u11-item[data-tab="' + r + '"]');
    if (btn) btn.click();
    await new Promise(x => setTimeout(x, 450));
    const pane = document.querySelector('.u11-pane[data-pane="' + r + '"]');
    if (!pane) continue;
    const t = pane.innerText;
    prods.forEach(p => { if (t.indexOf(p.label) >= 0) hit[p.id].push(r); });
  }
  return { prods, hit };
});

res.consoleErrors = consoleErrs;
fs.writeFileSync(OUT, JSON.stringify(res, null, 2));
console.log('WROTE', OUT, 'consoleErrors=', consoleErrs.length);
await b.close();
