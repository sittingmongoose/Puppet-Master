/* Final verification probe 2 — corrected selectors + self-inflicted ledger. */
import { chromium } from '/mnt/Cursor/PuppetMaster/Concepts/usage-concepts/QwenUsageConcept/.verify/node_modules/playwright-core/index.mjs';
import { writeFileSync } from 'node:fs';
import os from 'node:os'; import path from 'node:path';
const CHROME = '/home/sittingmongoose/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';
const PAGE = 'file:///mnt/Cursor/PuppetMaster/Concepts/usage-concepts/QwenUsageConcept/u11-prism.html';
const SP = '/tmp/claude-1000/-mnt-Cursor-PuppetMaster/7e74d8f5-7c2a-4eeb-8947-13056b4b2e5f/scratchpad';

const ctx = await chromium.launchPersistentContext(path.join(os.tmpdir(), 'fp2-' + process.pid),
  { executablePath: CHROME, headless: true, args: ['--no-sandbox', '--disable-gpu'], viewport: { width: 1900, height: 1200 } });
const p = await ctx.newPage();
const errs = []; p.on('pageerror', e => errs.push(String(e)));
await p.goto(PAGE, { waitUntil: 'load', timeout: 60000 }); await p.waitForTimeout(1200);
await p.evaluate(() => { const b = document.querySelector('[data-disc="advanced"]'); if (b) b.click(); });
await p.waitForTimeout(900);

const R = await p.evaluate(async () => {
  const out = {};
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const C = x => { try { return JSON.parse(JSON.stringify(x === undefined ? null : x)); } catch (e) { return 'CLONE_ERR ' + e.message; } };
  const U = window.U11;
  const goRoom = async (r) => {
    const b = document.querySelector(`.u11-item[data-tab="${r}"]`);
    if (!b) return false;
    b.click(); await sleep(560);
    document.querySelectorAll('.u11w-more-t').forEach(x => { try { x.click(); } catch (e) { } });
    await sleep(340); return true;
  };
  const paneText = r => { const el = document.querySelector(`[data-pane="${r}"]`); return el ? el.innerText : ''; };
  const openPicker = async () => { const b = document.querySelector('[data-scope-open]'); if (b) b.click(); await sleep(650); };
  const pickerRows = () => Array.from(document.querySelectorAll('#u11PopList .u11-pop-row'));

  /* ---- A02-10 / A02-11 / A03-22 — the scope picker ---- */
  {
    await openPicker();
    const rows = pickerRows();
    const kinds = {}; const padByKind = {}; const lvByKind = {};
    rows.forEach(r => {
      const id = r.getAttribute('data-scopeid') || '';
      const k = id.split(':')[0] || 'other';
      kinds[k] = (kinds[k] || 0) + 1;
      (padByKind[k] = padByKind[k] || new Set()).add(getComputedStyle(r).paddingLeft);
      (lvByKind[k] = lvByKind[k] || new Set()).add((r.className.match(/lv\d/) || [''])[0]);
    });
    const txt = (document.querySelector('#u11PopList') || {}).innerText || '';
    out['A02-10'] = { rows: rows.length, kinds, model_rows: kinds['model'] || 0 };
    out['A02-11'] = {
      padding_by_kind: Object.fromEntries(Object.entries(padByKind).map(([k, v]) => [k, [...v]])),
      lv_by_kind: Object.fromEntries(Object.entries(lvByKind).map(([k, v]) => [k, [...v]]))
    };
    out['A03-22'] = { neg_percent_hits: (txt.match(/-\d+%/g) || []), rows: rows.length };

    /* ---- A11-02 — page-scope change dispatch ---- */
    const acct = rows.find(r => (r.getAttribute('data-scopeid') || '').startsWith('acct:'));
    U.cmdLog.length = 0;
    if (acct) { acct.click(); await sleep(700); }
    out['A11-02'] = { target: acct && acct.getAttribute('data-scopeid'), dispatched: C(U.cmdLog) };
    /* restore */
    await openPicker();
    const all = pickerRows().find(r => (r.getAttribute('data-scopeid') || '') === 'scope:all');
    if (all) { all.click(); await sleep(650); }
  }

  /* ---- SELF-8 — historical group must respect page scope ---- */
  {
    await openPicker();
    const claude = pickerRows().find(r => (r.getAttribute('data-scopeid') || '') === 'fam:claude');
    out['SELF-8'] = { picked: claude && claude.getAttribute('data-scopeid') };
    if (claude) { claude.click(); await sleep(750); }
    await goRoom('ledger');
    const t = paneText('ledger');
    out['SELF-8'].historical_block_present = /Historical/.test(t);
    out['SELF-8'].openai_removed_row = /Old OpenAI/.test(t);
    out['SELF-8'].hist_rows = document.querySelectorAll('[data-pane="ledger"] .u11w-histwork .u11w-prow').length;
    out['SELF-8'].hist_groups = document.querySelectorAll('[data-pane="ledger"] .u11w-histwork').length;
    out['SELF-8'].slice = (t.match(/Historical[\s\S]{0,300}/) || [''])[0];
    /* SELF-10 double count: total attempt rows vs unique */
    const rows = Array.from(document.querySelectorAll('[data-pane="ledger"] [data-u11-att]'));
    const ids = rows.map(r => r.getAttribute('data-u11-att'));
    out['SELF-10'] = { scoped_rows: ids.length, unique: new Set(ids).size, dupes: ids.filter((v, i) => ids.indexOf(v) !== i) };
    /* restore to all */
    await openPicker();
    const all = pickerRows().find(r => (r.getAttribute('data-scopeid') || '') === 'scope:all');
    if (all) { all.click(); await sleep(700); }
    await goRoom('ledger');
    const t2 = paneText('ledger');
    out['SELF-8'].after_restore_hist = /Old OpenAI/.test(t2);
    const rows2 = Array.from(document.querySelectorAll('[data-pane="ledger"] [data-u11-att]'));
    const ids2 = rows2.map(r => r.getAttribute('data-u11-att'));
    out['SELF-10'].all_rows = ids2.length; out['SELF-10'].all_unique = new Set(ids2).size;
    out['SELF-10'].all_dupes = ids2.filter((v, i) => ids2.indexOf(v) !== i);
  }

  /* ---- A06-09 — time kind coverage ---- */
  {
    const runs = (U.runs || []).map(r => r.id);
    const cov = {};
    for (const id of runs) {
      try { cov[id] = C(typeof U.timeKindCoverage === 'function' ? U.timeKindCoverage(id) : U.timeKindCoverage); }
      catch (e) { cov[id] = 'ERR ' + e.message; }
    }
    out['A06-09'] = { coverage: cov, type: typeof U.timeKindCoverage };
    window.U11RunDetail.open('run:goal-47'); await sleep(800);
    const el = document.querySelector('aside.u11rd');
    const t = el ? el.innerText : '';
    out['A06-09'].rd_goal47 = {
      time_kinds_line: (t.match(/Time kinds[^\n]*/) || [''])[0],
      maintenance: (t.match(/Maintenance[^\n]*/) || [''])[0],
      local_compute: (t.match(/Local[^\n]*/g) || []).slice(0, 4),
      tool_runtime: (t.match(/Tool[^\n]*/g) || []).slice(0, 4)
    };
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); await sleep(300);
  }

  /* ---- A08-03 — ops-8 badge vs state ---- */
  {
    await goRoom('operations');
    const btn = document.querySelector('[data-u11-act="setuplink"][data-ops="ops-8"]');
    let card = btn; for (let i = 0; i < 8 && card; i++) { if (/u11w-(op|card|rec|row)/.test(card.className || '')) break; card = card.parentElement; }
    out['A08-03'] = {
      btn_found: !!btn,
      card_class: card ? card.className : null,
      card_text: card ? (card.innerText || '').slice(0, 900) : null,
      badges: card ? Array.from(card.querySelectorAll('[class*=kind],[class*=badge],[class*=pill]')).map(b => ({ cls: b.className, txt: (b.textContent || '').trim() })) : []
    };
  }

  /* ---- A08-08 / A10-11 — ops-2 CTA ---- */
  {
    await goRoom('operations');
    const acts = Array.from(document.querySelectorAll('[data-u11-act]'));
    const cta = acts.find(a => /replayed provider attempt/i.test(a.textContent || ''));
    out['A08-08/A10-11'] = {
      cta_found: !!cta,
      cta_label: cta ? cta.textContent.trim() : null,
      cta_attrs: cta ? { act: cta.getAttribute('data-u11-act'), ue: cta.getAttribute('data-ue'), ops: cta.getAttribute('data-ops') } : null
    };
    if (cta) {
      U.cmdLog.length = 0; cta.click(); await sleep(700);
      out['A08-08/A10-11'].dispatch = C(U.cmdLog);
      out['A08-08/A10-11'].inspector_open = !!document.querySelector('aside.u11rd');
      out['A08-08/A10-11'].inspector_head = (document.querySelector('aside.u11rd') || {}).innerText ? document.querySelector('aside.u11rd').innerText.slice(0, 200) : null;
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); await sleep(300);
    }
    const t = paneText('operations');
    out['A08-08/A10-11'].raw_id_still_in_prose = /see ue-610/.test(t);
  }

  /* ---- A08-11 — ue-609 in the authority room ---- */
  {
    await goRoom('authority');
    const t = paneText('authority');
    out['A08-11'] = {
      slice: (t.match(/Catalog[\s\S]{0,1200}/) || [''])[0],
      active_probe_rows: (t.match(/Active probe[^\n]*/g) || []),
      catalog_validation_rows: (t.match(/Catalog validation[^\n]*/g) || []),
      mentions_ops1: /Codex CLI update|maintenance operation|ops-1/i.test(t)
    };
  }

  /* ---- A06-13 — reserve quantity ---- */
  {
    const s = JSON.stringify(U.runs || []);
    out['A06-13'] = {
      reserve_keys_in_runs: [...new Set((s.match(/"[a-zA-Z]*[Rr]eserve[a-zA-Z]*"/g) || []))],
      sample: C((U.runs || []).map(r => ({ id: r.id, reserve: r.reserve || (r.capacity && r.capacity.reserve) || null, cap: r.capacity })))
    };
    await goRoom('plans');
    const t = paneText('plans');
    out['A06-13'].rendered = (t.match(/[^\n]*reserv[^\n]*/gi) || []).slice(0, 8);
  }

  /* ---- A09-09 — chart surfaces ---- */
  {
    out['A09-09'] = {
      tables: document.querySelectorAll('table').length,
      canvases: document.querySelectorAll('canvas').length,
      svgs: document.querySelectorAll('svg[class*=chart],svg[data-chart]').length,
      chartish: document.querySelectorAll('[class*=chart]').length,
      range_control: !!document.querySelector('#u11Range'),
      range_options: Array.from(document.querySelectorAll('#u11Range [data-range],#u11Range option')).map(o => (o.textContent || '').trim())
    };
  }

  /* ---- A07-09 — lineage exposure by disclosure level ---- */
  {
    const res = {};
    for (const lv of ['essentials', 'standard', 'advanced']) {
      const b = document.querySelector(`[data-disc="${lv}"]`); if (b) b.click();
      await sleep(750);
      await goRoom('ledger');
      const rows = Array.from(document.querySelectorAll('[data-pane="ledger"] [data-u11-att]'));
      const ids = rows.map(r => r.getAttribute('data-u11-att'));
      const hostBearing = ids.filter(id => { const a = U.attemptById && U.attemptById[id]; return a && (a.hostId || a.executionHostId); });
      res[lv] = { rows: ids.length, host_bearing_rows: hostBearing.length };
    }
    const b = document.querySelector('[data-disc="advanced"]'); if (b) b.click(); await sleep(750);
    /* lineage section presence on inspectors */
    let withLineage = 0, opened = 0;
    for (const id of ['ue-501', 'ue-520', 'ue-580', 'ue-610', 'ue-609']) {
      try { window.U11RunDetail.openAttempt(id); } catch (e) { continue; }
      await sleep(520); opened++;
      const el = document.querySelector('aside.u11rd');
      if (el && /execution host|Execution host|Home server|home server|not recorded for this event/i.test(el.innerText)) withLineage++;
    }
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); await sleep(300);
    out['A07-09'] = { by_level: res, inspectors_opened: opened, with_lineage_section: withLineage };
  }

  /* ---- SELF-9 — Reserved spend clip + title ---- */
  {
    const hunt = async (room) => {
      await goRoom(room);
      const nodes = Array.from(document.querySelectorAll(`[data-pane="${room}"] *`))
        .filter(n => n.children.length === 0 && /Reserved spend/i.test(n.textContent || ''));
      return nodes.map(n => {
        let a = n, tt = null, depth = 0;
        while (a && !tt && depth < 6) { tt = a.getAttribute && a.getAttribute('title'); a = a.parentElement; depth++; }
        const cs = getComputedStyle(n);
        return { room, text: n.textContent.trim(), cls: n.className, own_title: n.getAttribute('title'),
          nearest_title: tt, scrollW: n.scrollWidth, clientW: n.clientWidth,
          clipped: n.scrollWidth - n.clientWidth, overflow: cs.overflow + '/' + cs.textOverflow };
      });
    };
    const found = [];
    for (const r of ['costs', 'plans', 'overview', 'attention', 'analytics']) found.push(...await hunt(r));
    out['SELF-9'] = { nodes: found };
  }

  /* ---- SELF-11 — priced calls line must not count reported zeros ---- */
  {
    await goRoom('ledger');
    const t = paneText('ledger');
    out['SELF-11'] = {
      priced_lines: (t.match(/[^\n]*priced call[^\n]*/gi) || []).slice(0, 12),
      zero_reported_lines: (t.match(/[^\n]*\$0\.00 reported[^\n]*/gi) || []).slice(0, 6),
      cost_lines: (t.match(/^Cost ·[^\n]*/gim) || []).slice(0, 12)
    };
    /* ground truth */
    const atts = U.attempts || [];
    const priced = atts.filter(a => a.cost && a.cost.micro > 0).length;
    const reportedZero = atts.filter(a => a.cost && a.cost.micro === 0 && (a.cost_status === 'reported' || a.costStatus === 'reported' || a.cost.state === 'reported')).length;
    out['SELF-11'].data = { priced_gt_zero: priced, reported_zero: reportedZero, total: atts.length };
  }

  /* ---- SELF-7 — raw enum tokens in any user-visible title ---- */
  {
    const bad = [];
    document.querySelectorAll('[title]').forEach(n => {
      const t = (n.getAttribute('title') || '').trim();
      const toks = t.match(/\b[a-z0-9]+(?:_[a-z0-9]+)+\b/g);
      if (toks && toks.length) bad.push({ title: t.slice(0, 120), tokens: [...new Set(toks)] });
    });
    out['SELF-7'] = { titles_with_snake_case: bad.length, total_titles: document.querySelectorAll('[title]').length, sample: bad.slice(0, 20) };
  }

  /* ---- SELF-2 — spending limit ---- */
  {
    try { document.getElementById('u11Settings').click(); } catch (e) { }
    await sleep(650);
    const sh = document.getElementById('u11SheetSprout');
    const t = sh ? sh.innerText : '';
    out['SELF-2'] = { line: (t.match(/Spending limit[\s\S]{0,60}/) || [''])[0] };
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); await sleep(320);
  }

  /* ---- A03-10 — attention burn attribution, expanded ---- */
  {
    await goRoom('attention');
    document.querySelectorAll('[data-pane="attention"] .u11w-more-t').forEach(b => { try { b.click(); } catch (e) { } });
    await sleep(500);
    const t = paneText('attention');
    const i = t.indexOf('Spend rate elevated');
    out['A03-10'] = { card: i >= 0 ? t.slice(i, i + 900) : 'absent' };
  }

  /* ---- A08-06 — cross-provider verify explanation (recheck on ue-609) ---- */
  {
    const a = U.attemptById && U.attemptById['ue-609'];
    out['A08-06'] = { attempt: C(a ? { id: a.eventId || a.id, purpose: a.purpose, workId: a.workId, model: a.effectiveModelId, conn: a.connectionId, acct: a.accountId, prod: a.productId, fam: a.familyId } : null) };
    window.U11RunDetail.openAttempt('ue-609'); await sleep(700);
    const el = document.querySelector('aside.u11rd');
    out['A08-06'].inspector = el ? el.innerText.slice(0, 1400) : null;
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); await sleep(300);
  }

  return out;
});
R.page_errors = errs;
writeFileSync(SP + '/final-probe2-results.json', JSON.stringify(R, null, 1));
console.log('page_errors', errs.length, 'written');
await ctx.close();
