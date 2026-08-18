/* Final verification probe 3 — remaining items with corrected selectors. */
import { chromium } from '/mnt/Cursor/PuppetMaster/Concepts/usage-concepts/QwenUsageConcept/.verify/node_modules/playwright-core/index.mjs';
import { writeFileSync } from 'node:fs';
import os from 'node:os'; import path from 'node:path';
const CHROME = '/home/sittingmongoose/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';
const PAGE = 'file:///mnt/Cursor/PuppetMaster/Concepts/usage-concepts/QwenUsageConcept/u11-prism.html';
const SP = '/tmp/claude-1000/-mnt-Cursor-PuppetMaster/7e74d8f5-7c2a-4eeb-8947-13056b4b2e5f/scratchpad';
const ctx = await chromium.launchPersistentContext(path.join(os.tmpdir(), 'fp3-' + process.pid),
  { executablePath: CHROME, headless: true, args: ['--no-sandbox', '--disable-gpu'], viewport: { width: 1900, height: 1200 } });
const p = await ctx.newPage();
const errs = []; p.on('pageerror', e => errs.push(String(e)));
await p.goto(PAGE, { waitUntil: 'load', timeout: 60000 }); await p.waitForTimeout(1200);

const R = await p.evaluate(async () => {
  const out = {}; const sleep = ms => new Promise(r => setTimeout(r, ms));
  const C = x => { try { return JSON.parse(JSON.stringify(x === undefined ? null : x)); } catch (e) { return 'CLONE_ERR'; } };
  const U = window.U11;
  const goRoom = async (r) => { const b = document.querySelector(`.u11-item[data-tab="${r}"]`); if (!b) return false; b.click(); await sleep(560); document.querySelectorAll('.u11w-more-t').forEach(x => { try { x.click(); } catch (e) { } }); await sleep(340); return true; };
  const paneText = r => { const el = document.querySelector(`[data-pane="${r}"]`); return el ? el.innerText : ''; };

  /* A07-09 — attempt rows and host-bearing lineage by disclosure level */
  {
    const res = {};
    for (const lv of ['essentials', 'standard', 'advanced']) {
      const b = document.querySelector(`[data-disc="${lv}"]`); if (b) b.click();
      await sleep(800);
      await goRoom('ledger');
      const pane = document.querySelector('[data-pane="ledger"]');
      const insp = Array.from(pane.querySelectorAll('[data-u11-act="openattempt"]'));
      const ids = insp.map(n => n.getAttribute('data-ue') || n.getAttribute('data-att') || n.getAttribute('data-id'));
      const hostBearing = ids.filter(id => { const a = id && U.attemptById && U.attemptById[id]; return a && (a.hostId || a.executionHostId || a.execHostId); });
      res[lv] = { prows: pane.querySelectorAll('.u11w-prow').length, inspect_ctas: insp.length,
        ids_sample: ids.slice(0, 6), host_bearing: hostBearing.length };
    }
    const b = document.querySelector('[data-disc="advanced"]'); if (b) b.click(); await sleep(800);
    out['A07-09'] = res;
    const withHost = (U.attempts || []).filter(a => a.hostId || a.executionHostId).length;
    out['A07-09'].data_attempts_with_host = withHost;
    out['A07-09'].total_attempts = (U.attempts || []).length;
  }

  /* A09-06 — reasoning band reconciliation, bucket by bucket */
  {
    await goRoom('analytics');
    const t = paneText('analytics');
    const atts = U.attempts || [];
    const rsum = atts.reduce((s, a) => s + ((a.tokens && a.tokens.reasoning) || 0), 0);
    out['A09-06'] = {
      attempts_with_reasoning: atts.filter(a => a.tokens && a.tokens.reasoning != null).length,
      total: atts.length, ledger_reasoning_sum: rsum,
      chart_has_reasoning_series: /Reasoning/.test(t),
      analytics_slice: (t.match(/Reasoning[\s\S]{0,250}/) || [''])[0]
    };
  }

  /* A02-09 — historical group under a bucket filter, driven */
  {
    await goRoom('ledger');
    const setup = (() => {
      const cv = document.querySelector('.u11-pane[data-pane="ledger"] .uw-canvas[data-u11-page]');
      const it = cv && cv._pmw ? cv._pmw.items.filter(i => i.type === 'ledger')[0] : null;
      const hist = U.attempts.filter(a => a.historicalIdentity);
      const own = []; hist.forEach(a => { if (own.indexOf(a.bucket) < 0) own.push(a.bucket); });
      const other = Object.keys(U.buckets).filter(b => own.indexOf(b) < 0)[0];
      return { uid: it ? it.uid : null, ownBuckets: own, otherBucket: other, histRows: hist.length };
    })();
    out['A02-09'] = { setup };
  }

  /* A09-09 — chart surfaces, precise */
  {
    out['A09-09'] = {
      tables: document.querySelectorAll('table').length,
      chart_nodes: Array.from(document.querySelectorAll('[class*=chart]')).map(n => n.className).slice(0, 10),
      spark_nodes: document.querySelectorAll('[class*=spark]').length,
      range_control_present: !!document.querySelector('#u11Range'),
      range_html: (document.querySelector('#u11Range') || {}).innerHTML ? document.querySelector('#u11Range').innerHTML.slice(0, 300) : null
    };
  }

  /* A08-08 — raw id in prose, in the room that actually holds ops cards */
  {
    const rooms = Array.from(document.querySelectorAll('.u11-item[data-tab]')).map(b => b.dataset.tab);
    let hit = null;
    for (const r of rooms) { await goRoom(r); const t = paneText(r); if (/see ue-610/.test(t)) { hit = { room: r, slice: (t.match(/[^\n]*see ue-610[^\n]*\n?[^\n]*/) || [''])[0] }; break; } }
    out['A08-08_prose'] = hit || { room: null, slice: 'not found in any room' };
  }

  /* A06-13 rendered reserve copy */
  {
    const rooms = ['overview', 'plans'];
    const res = {};
    for (const r of rooms) { await goRoom(r); const t = paneText(r); res[r] = (t.match(/[^\n]*[Rr]eserv[^\n]*/g) || []).slice(0, 6); }
    out['A06-13_rendered'] = res;
  }

  /* A10-08 — settings affordances: do they route? */
  {
    await goRoom('costs');
    const acts = Array.from(document.querySelectorAll('[data-u11-act]')).filter(a => /Usage settings|provider settings|See all/i.test(a.textContent || ''));
    out['A10-08'] = { affordance_count: acts.length, labels: [...new Set(acts.map(a => a.textContent.trim()))] };
    if (acts.length) {
      U.cmdLog.length = 0; acts[0].click(); await sleep(700);
      out['A10-08'].opens_sheet = !!document.getElementById('u11SheetSprout');
      out['A10-08'].dispatch_on_open = C(U.cmdLog);
      const link = Array.from(document.querySelectorAll('#u11SheetSprout [data-u11link],#u11SheetSprout [data-u11-act]'))[0];
      if (link) { U.cmdLog.length = 0; link.click(); await sleep(600); out['A10-08'].sheet_row_dispatch = C(U.cmdLog); }
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); await sleep(300);
    }
  }

  return out;
});
R.page_errors = errs;
writeFileSync(SP + '/final-probe3-results.json', JSON.stringify(R, null, 1));
console.log('written', errs.length);
await ctx.close();
