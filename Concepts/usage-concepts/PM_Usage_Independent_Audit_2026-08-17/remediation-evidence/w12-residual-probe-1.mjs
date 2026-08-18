/* Final verification probe — residual findings, measured live.
   Writes /scratchpad/final-probe-results.json */
import { chromium } from '/mnt/Cursor/PuppetMaster/Concepts/usage-concepts/QwenUsageConcept/.verify/node_modules/playwright-core/index.mjs';
import { writeFileSync } from 'node:fs';
import os from 'node:os'; import path from 'node:path';
const CHROME = '/home/sittingmongoose/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';
const PAGE = 'file:///mnt/Cursor/PuppetMaster/Concepts/usage-concepts/QwenUsageConcept/u11-prism.html';
const SP = '/tmp/claude-1000/-mnt-Cursor-PuppetMaster/7e74d8f5-7c2a-4eeb-8947-13056b4b2e5f/scratchpad';

const ctx = await chromium.launchPersistentContext(path.join(os.tmpdir(), 'fp-' + process.pid),
  { executablePath: CHROME, headless: true, args: ['--no-sandbox', '--disable-gpu'], viewport: { width: 1900, height: 1200 } });
const p = await ctx.newPage();
const errs = []; p.on('pageerror', e => errs.push(String(e)));
const consoleErrs = []; p.on('console', m => { if (m.type() === 'error') consoleErrs.push(m.text()); });
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
  const rooms = Array.from(document.querySelectorAll('.u11-item[data-tab]')).map(b => b.dataset.tab);
  out.rooms = rooms;

  /* ---------- collect all rooms text + html once ---------- */
  const roomText = {}, roomHTML = {};
  for (const r of rooms) { await goRoom(r); roomText[r] = paneText(r); const el = document.querySelector(`[data-pane="${r}"]`); roomHTML[r] = el ? el.outerHTML : ''; }
  const allText = Object.values(roomText).join('\n');
  const allHTML = Object.values(roomHTML).join('\n');
  out.corpus = { text_chars: allText.length, html_chars: allHTML.length };

  /* =============== A01-06 / A10-01 / A08-04 — provider setup deep link ============ */
  {
    const m = {};
    m.setupLink = C((U.operational.find(o => o.id === 'ops-8') || {}).setupLink || null);
    const op = U.operational.find(o => o.id === 'ops-8');
    m.ops8_keys = op ? Object.keys(op) : [];
    m.ops8_hostId = op && op.hostId; m.ops8_envId = op && op.envId;
    await goRoom('operations');
    const acts = Array.from(document.querySelectorAll('[data-u11-act]'));
    m.actions_in_operations = acts.map(a => (a.textContent || '').trim()).slice(0, 40);
    const btn = acts.find(a => /provider setup/i.test(a.textContent || ''));
    m.found_setup_button = !!btn;
    if (btn) { U.cmdLog.length = 0; btn.click(); await sleep(500); m.dispatched = C(U.cmdLog); }
    m.cont8841_in_html = allHTML.includes('cont-8841');
    m.cont8841_in_text = allText.includes('cont-8841');
    m.continuation_words_in_text = /continuation/i.test(allText);
    out['A01-06/A10-01/A08-04'] = m;
  }

  /* =============== A01-07 — provider_family_id on deep links ============ */
  {
    const m = { dispatches: [] };
    const tryClick = async (roomName, rx, label) => {
      await goRoom(roomName);
      const a = Array.from(document.querySelectorAll('[data-u11-act],[data-u11link],[data-u11-link]')).find(x => rx.test(x.textContent || ''));
      if (!a) { m.dispatches.push({ label, found: false }); return; }
      U.cmdLog.length = 0; a.click(); await sleep(450);
      m.dispatches.push({ label, found: true, log: C(U.cmdLog) });
    };
    await tryClick('accounts', /reconnect/i, 'reconnect');
    await tryClick('accounts', /console/i, 'provider console');
    await tryClick('accounts', /use next|use the next/i, 'use next');
    out['A01-07'] = m;
  }

  /* =============== A08-01 — affectedConnections / labels ============ */
  {
    const op = U.operational.find(o => o.id === 'ops-1');
    out['A08-01'] = {
      ops1_keys: op ? Object.keys(op) : [],
      failureClass: op && op.failureClass, outcome: op && op.outcome,
      affectedConnections: op ? (op.affectedConnections || null) : null,
      affected_like_keys: op ? Object.keys(op).filter(k => /affect/i.test(k)) : [],
      label_failure_class: /Failure class/i.test(allText),
      label_outcome: /\bOutcome\b/.test(allText),
      label_affected: /\bAffected\b/.test(allText)
    };
  }

  /* =============== A08-03 — ops-8 badge vs state ============ */
  {
    await goRoom('operations');
    const cards = Array.from(document.querySelectorAll('[data-ops]'));
    const c = cards.find(x => x.getAttribute('data-ops') === 'ops-8') ||
      cards.find(x => /provider setup required/i.test(x.textContent || ''));
    out['A08-03'] = {
      found: !!c,
      kind_badges: c ? Array.from(c.querySelectorAll('.u11w-kind')).map(b => ({ cls: b.className, txt: (b.textContent || '').trim() })) : [],
      text: c ? (c.innerText || '').slice(0, 700) : ''
    };
  }

  /* =============== A08-05 — ue-609 workId ============ */
  {
    const a = U.attemptById && U.attemptById['ue-609'];
    await goRoom('ledger');
    const lt = roomText['ledger'] || '';
    const idx = lt.indexOf('Run integration tests');
    out['A08-05'] = {
      ue609_workId: a ? a.workId : 'MISSING', ue609_purpose: a ? a.purpose : null,
      ledger_context: idx >= 0 ? lt.slice(Math.max(0, idx - 200), idx + 400) : 'not found'
    };
  }

  /* =============== A08-06 — ue-609 cross-provider explanation ============ */
  {
    const a = U.attemptById && U.attemptById['ue-609'];
    const hay = allText;
    const i = hay.indexOf('ue-609');
    out['A08-06'] = {
      route: a ? { model: a.effectiveModelId, conn: a.connectionId, acct: a.accountId, product: a.productId } : null,
      explains_why: /why a codex|codex cli verific|verification (call )?(ran|billed|consumed)|consumed opencode|billed opencode/i.test(hay),
      matches: (hay.match(/[^\n]*OpenCode[^\n]*verif[^\n]*/gi) || []).slice(0, 5),
      verify_sentences: (hay.match(/[^\n]*verif[^\n]*allowance[^\n]*/gi) || []).slice(0, 5)
    };
  }

  /* =============== A08-07 — ops-2 providerUsage vs ue-610 purpose ============ */
  {
    const op = U.operational.find(o => o.id === 'ops-2');
    const a = U.attemptById && U.attemptById['ue-610'];
    out['A08-07'] = { ops2_providerUsage: op && op.providerUsage, ue610_purpose: a && a.purpose };
  }

  /* =============== A08-08 / A10-11 — ops-2 CTA ============ */
  {
    await goRoom('operations');
    const cards = Array.from(document.querySelectorAll('[data-ops]'));
    const c = cards.find(x => x.getAttribute('data-ops') === 'ops-2');
    const acts = c ? Array.from(c.querySelectorAll('[data-u11-act]')) : [];
    out['A08-08/A10-11'] = {
      found: !!c,
      raw_id_in_prose: c ? /see ue-610/.test(c.innerText || '') : null,
      act_count: acts.length,
      act_labels: acts.map(a => (a.textContent || '').trim()),
      act_attrs: acts.map(a => a.getAttribute('data-u11-act'))
    };
    if (acts.length) { U.cmdLog.length = 0; acts[0].click(); await sleep(500); out['A08-08/A10-11'].dispatch = C(U.cmdLog); out['A08-08/A10-11'].rd_open = !!document.querySelector('aside.u11rd'); }
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); await sleep(300);
  }

  /* =============== A08-10 — catalog join field ============ */
  {
    const ev = (U.catalogEvents || []);
    const keys = new Set(); ev.forEach(e => Object.keys(e).forEach(k => keys.add(k)));
    out['A08-10'] = {
      count: ev.length, keys: [...keys],
      join_like: [...keys].filter(k => /event|attempt|probe|ue|ref|id/i.test(k)),
      sample: ev.length ? C(ev[0]) : null
    };
  }

  /* =============== A08-11 — ue-609 rendering in authority room ============ */
  {
    await goRoom('authority');
    const t = paneText('authority');
    const i = t.indexOf('ue-609');
    out['A08-11'] = {
      active_probe_qwen: /Active probe\s*[·-]?\s*Qwen3 Coder Plus/i.test(t),
      catalog_validation_row: /Catalog validation call/i.test(t),
      mentions_maintenance_op: /maintenance/i.test(t),
      ue609_ctx: i >= 0 ? t.slice(Math.max(0, i - 300), i + 300) : null,
      probe_group_slice: (t.match(/Catalog & probes[\s\S]{0,900}/) || [''])[0]
    };
  }

  /* =============== A02-01 — scope footer arithmetic ============ */
  {
    const m = {};
    const openPicker = async () => { const b = document.querySelector('[data-scope-open]'); if (b) b.click(); await sleep(620); };
    await openPicker();
    m.footer_all = (document.querySelector('#u11PopFoot') || {}).innerText || '';
    const rows = Array.from(document.querySelectorAll('#u11PopList [data-scope]'));
    m.row_count = rows.length;
    m.kinds = {};
    rows.forEach(r => { const k = r.getAttribute('data-kind') || (r.getAttribute('data-scope') || '').split(':')[0]; m.kinds[k] = (m.kinds[k] || 0) + 1; });
    const openaiRow = rows.find(r => (r.getAttribute('data-scope') || '') === 'fam:openai');
    if (openaiRow) { openaiRow.click(); await sleep(650); await openPicker(); m.footer_openai = (document.querySelector('#u11PopFoot') || {}).innerText || ''; }
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); await sleep(320);
    /* ground truth from data */
    const removed = new Set((U.accounts || []).filter(a => a.state === 'removed' || a.removed).map(a => a.id));
    m.removed_accounts = [...removed];
    const atts = U.attempts || [];
    m.total_attempts = atts.length;
    m.attempts_on_removed = atts.filter(a => removed.has(a.accountId)).length;
    out['A02-01'] = m;
  }

  /* =============== A02-02 / A04-08 — mixed-route work card ============ */
  {
    await goRoom('ledger');
    const t = paneText('ledger');
    const i = t.indexOf('Critique round 1');
    out['A02-02/A04-08'] = { card_ctx: i >= 0 ? t.slice(Math.max(0, i - 120), i + 900) : 'not found' };
    const work = (U.works || []).find(w => /Critique round 1/i.test(w.label || w.title || ''));
    if (work) {
      const ids = (U.attempts || []).filter(a => a.workId === work.id);
      out['A02-02/A04-08'].work_families = [...new Set(ids.map(a => a.familyId))];
      out['A02-02/A04-08'].work_attempts = ids.length;
    }
  }

  /* =============== A02-09 — historical group under a bucket filter ============ */
  {
    await goRoom('ledger');
    const cfg = document.querySelector('[data-pane="ledger"] [data-u11w-config],[data-pane="ledger"] .u11w-cfg,[data-pane="ledger"] [data-cfg]');
    out['A02-09'] = {
      config_selector_found: !!cfg,
      historical_present_unfiltered: /Historical\s*[·-]\s*removed sources/i.test(paneText('ledger'))
    };
  }

  /* =============== A02-10 — model rows in the picker ============ */
  {
    const b = document.querySelector('[data-scope-open]'); if (b) b.click(); await sleep(620);
    const rows = Array.from(document.querySelectorAll('#u11PopList [data-scope]'));
    const kinds = {}; rows.forEach(r => { const k = (r.getAttribute('data-scope') || '').split(':')[0]; kinds[k] = (kinds[k] || 0) + 1; });
    out['A02-10'] = { rows: rows.length, kinds, model_rows: kinds['model'] || 0 };
    /* =============== A02-11 — indent of product vs meter =========== */
    const pad = {};
    for (const r of rows) {
      const s = (r.getAttribute('data-scope') || '');
      const kind = s.split(':')[0];
      if (!pad[kind]) pad[kind] = new Set();
      pad[kind].add(getComputedStyle(r).paddingLeft);
    }
    out['A02-11'] = { padding_by_kind: Object.fromEntries(Object.entries(pad).map(([k, v]) => [k, [...v]])) };
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); await sleep(320);
  }

  /* =============== A02-13 / A04-12 — access profile coverage ============ */
  {
    const atts = U.attempts || [];
    const cnt = f => atts.filter(a => a[f] != null).length;
    out['A02-13/A04-12'] = {
      total: atts.length,
      requestedAccessProfile: cnt('requestedAccessProfile'), effectiveAccessProfile: cnt('effectiveAccessProfile'),
      reasoningEffort: cnt('reasoningEffort'), speedMode: cnt('speedMode'),
      conversationMode: cnt('conversationMode'), sessionId: cnt('sessionId')
    };
  }

  /* =============== A06-09 — time kind coverage ============ */
  {
    out['A06-09'] = { coverage: U.timeKindCoverage ? C(U.timeKindCoverage) : 'MISSING' };
  }

  /* =============== A06-10 — admission reasons ============ */
  {
    const s = JSON.stringify(U.runs || []);
    const canon = ['port_conflict', 'file_writer_conflict', 'host_resource_pressure', 'waiting_for_update_repair',
      'waiting_for_reset', 'provider_permit', 'approval_wait', 'dependency_wait'];
    const hit = {}; canon.forEach(c => hit[c] = (s.match(new RegExp(c, 'g')) || []).length);
    const s2 = JSON.stringify(U.attempts || []);
    canon.forEach(c => hit[c] += (s2.match(new RegExp(c, 'g')) || []).length);
    out['A06-10'] = { occurrences: hit };
  }

  /* =============== A06-13 — capacity reserve ============ */
  {
    const rows = (U.runs || []).map(r => ({
      id: r.id, advertised: r.capacity && r.capacity.providerAdvertised,
      sustainable: r.capacity && r.capacity.predictedSustainable,
      reserveKeys: r.capacity ? Object.keys(r.capacity).filter(k => /reserve/i.test(k)) : [],
      capKeys: r.capacity ? Object.keys(r.capacity) : []
    }));
    out['A06-13'] = { rows };
  }

  /* =============== A06-15 — hard max framing ============ */
  {
    const i = allText.indexOf('hard max');
    out['A06-15'] = {
      ctx: i >= 0 ? allText.slice(Math.max(0, i - 400), i + 400) : 'absent',
      forecast_words_near: i >= 0 ? /forecast/i.test(allText.slice(Math.max(0, i - 600), i + 600)) : null
    };
  }

  /* =============== A06-16 — actual peak ============ */
  {
    const s = JSON.stringify(U.runs || []);
    out['A06-16'] = {
      actualPeak_in_data: /actualPeak/.test(s),
      peak_values: (U.runs || []).map(r => r.capacity && r.capacity.actualPeak),
      rendered_phrase: /Most that ran at once/i.test(allText) || /actual peak/i.test(allText),
      peak_concurrency_literal: /peak concurrency/i.test(allText)
    };
  }

  /* =============== A09-06 — reasoning bucket ============ */
  {
    const atts = U.attempts || [];
    out['A09-06'] = {
      with_reasoning: atts.filter(a => a.tokens && a.tokens.reasoning != null).length,
      total: atts.length
    };
  }

  /* =============== A09-09 — tables / charts ============ */
  {
    out['A09-09'] = {
      tables: document.querySelectorAll('table').length,
      canvases: document.querySelectorAll('canvas').length,
      range_control: !!document.querySelector('#u11Range')
    };
  }

  /* =============== A10-17 — vision model ============ */
  {
    const a = U.attemptById && U.attemptById['ue-551'];
    const mid = a && a.effectiveModelId;
    const model = (U.models || []).find(m => m.id === mid) || (U.modelById && U.modelById[mid]);
    out['A10-17'] = { purpose: a && a.purpose, modelId: mid, model_vision: model ? model.vision : 'model-not-found' };
  }

  /* =============== A05-19 — cache sparkline bar heights ============ */
  {
    await goRoom('cache');
    const bars = Array.from(document.querySelectorAll('[data-h]'));
    out['A05-19'] = {
      bars: bars.slice(0, 20).map(b => ({ h: b.getAttribute('data-h'), height: getComputedStyle(b).height, title: b.getAttribute('title'), cls: b.className })),
      count: bars.length
    };
  }

  /* =============== A11-02 — scope change dispatch ============ */
  {
    const b = document.querySelector('[data-scope-open]'); if (b) b.click(); await sleep(600);
    const rows = Array.from(document.querySelectorAll('#u11PopList [data-scope]'));
    const target = rows.find(r => (r.getAttribute('data-scope') || '').startsWith('acct:')) || rows[3];
    U.cmdLog.length = 0;
    if (target) { target.click(); await sleep(650); }
    out['A11-02'] = { target: target && target.getAttribute('data-scope'), dispatched: C(U.cmdLog) };
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); await sleep(300);
  }

  /* =============== A11-05 — run inspector dispatch ============ */
  {
    U.cmdLog.length = 0;
    window.U11RunDetail.open('run:plan-12'); await sleep(700);
    out['A11-05'] = { run_open: C(U.cmdLog) };
    U.cmdLog.length = 0;
    window.U11RunDetail.openAttempt('ue-501'); await sleep(650);
    out['A11-05'].attempt_open = C(U.cmdLog);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); await sleep(300);
  }

  /* =============== A03-08 — cost-state fields ============ */
  {
    const atts = U.attempts || [];
    const has = f => atts.filter(a => a[f] != null).length;
    const s = JSON.stringify(U).length;
    out['A03-08'] = {
      total: atts.length,
      cost_status: has('cost_status') || has('costStatus'),
      display_cost_policy: has('display_cost_policy') || has('displayCostPolicy'),
      hidden_byok: has('hidden_byok') || has('hiddenByok'),
      hidden_subscription: has('hidden_subscription') || has('hiddenSubscription'),
      pricing_tokens_in_U11: ['pricing_snapshot_id', 'pricingSnapshotId', 'pricing_source', 'pricingSource',
        'pricing_effective_at', 'pricingEffectiveAt', 'pricing_version', 'pricingVersion']
        .filter(k => JSON.stringify(U).includes(k))
    };
  }

  /* =============== A03-10 — attention burn ============ */
  {
    await goRoom('attention');
    const t = paneText('attention');
    const i = t.search(/burn/i);
    out['A03-10'] = { ctx: i >= 0 ? t.slice(Math.max(0, i - 400), i + 700) : 'absent' };
    await goRoom('costs');
    const c = paneText('costs');
    const j = c.search(/\/h\b/);
    out['A03-10'].costs_ctx = j >= 0 ? c.slice(Math.max(0, j - 300), j + 300) : 'absent';
  }

  /* =============== A03-16 — spending limit gauge ============ */
  {
    await goRoom('costs');
    const t = paneText('costs');
    const i = t.indexOf('Spending limit');
    out['A03-16'] = { ctx: i >= 0 ? t.slice(Math.max(0, i - 300), i + 800) : 'absent' };
  }

  /* =============== A03-17 — allowance block ============ */
  {
    try { document.getElementById('u11Settings').click(); } catch (e) { }
    await sleep(650);
    const sh = document.getElementById('u11SheetSprout');
    out['A03-17'] = { sheet_text: sh ? sh.innerText.slice(0, 2500) : 'no sheet' };
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); await sleep(320);
  }

  /* =============== A03-19 — pool window reset claim ============ */
  {
    const m = (U.meters || []).find(x => x.id === 'meter:kimi-pool');
    out['A03-19'] = {
      meter: m ? { id: m.id, windowKind: m.windowKind, resetAt: m.resetAt, vs: m.vs } : 'missing',
      resetState: (m && U.meterResetState) ? C(U.meterResetState(m)) : 'no accessor',
      windowHasReset_pool: U.windowHasReset ? U.windowHasReset('pool') : 'missing'
    };
  }

  /* =============== A03-22 — scope picker negative percent ============ */
  {
    const b = document.querySelector('[data-scope-open]'); if (b) b.click(); await sleep(620);
    const txt = (document.querySelector('#u11PopList') || {}).innerText || '';
    out['A03-22'] = { neg_percent_hits: (txt.match(/-\d+%/g) || []), rows: document.querySelectorAll('#u11PopList [data-scope]').length };
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); await sleep(320);
  }

  /* =============== A07-07 — CBP-027 vocabulary ============ */
  {
    const toks = ['/stats', '/usage', '/quota', '/credits', 'G1 credits', 'Models & Quota', 'statusline',
      'not exposed', 'unknown', 'broken', 'disabled'];
    const hits = {}; toks.forEach(t => hits[t] = allText.toLowerCase().split(t.toLowerCase()).length - 1);
    out['A07-07'] = { hits };
  }

  /* =============== A07-09 — lineage at Essentials/Standard ============ */
  {
    const levels = ['essentials', 'standard', 'advanced'];
    const res = {};
    for (const lv of levels) {
      const b = document.querySelector(`[data-disc="${lv}"]`); if (!b) { res[lv] = 'no control'; continue; }
      b.click(); await sleep(700);
      await goRoom('ledger');
      const rows = document.querySelectorAll('[data-pane="ledger"] [data-u11-att],[data-pane="ledger"] [data-att]');
      res[lv] = { ledger_attempt_rows: rows.length };
    }
    const b = document.querySelector('[data-disc="advanced"]'); if (b) b.click(); await sleep(700);
    out['A07-09'] = res;
  }

  /* =============== A04-04 / A04-05 — turn card totals ============ */
  {
    await goRoom('ledger');
    const t = paneText('ledger');
    const i = t.indexOf('Redirect: rewrite rate limiter');
    out['A04-04/A04-05'] = { card_ctx: i >= 0 ? t.slice(Math.max(0, i - 100), i + 700) : 'not found' };
    const w = (U.works || []).find(x => /Redirect: rewrite rate limiter/i.test(x.label || x.title || ''));
    if (w) {
      const as = (U.attempts || []).filter(a => a.workId === w.id);
      out['A04-04/A04-05'].work_id = w.id;
      out['A04-04/A04-05'].attempts = as.map(a => ({ id: a.eventId || a.id, purpose: a.purpose, input: a.tokens && a.tokens.input, output: a.tokens && a.tokens.output }));
      out['A04-04/A04-05'].input_total = as.reduce((s, a) => s + ((a.tokens && a.tokens.input) || 0), 0);
      out['A04-04/A04-05'].primaries = as.filter(a => a.purpose === 'user_work').length;
    }
  }

  /* =============== SELF-* ledger verification ============ */
  {
    const ids = Array.from(document.querySelectorAll('[id]')).map(e => e.id);
    const dup = {}; ids.forEach(i => dup[i] = (dup[i] || 0) + 1);
    out['SELF-1'] = { duplicate_ids: Object.entries(dup).filter(([, n]) => n > 1).map(([i, n]) => i + ' x' + n) };
    const i2 = allText.indexOf('per month');
    out['SELF-2'] = { spend_limit_ctx: i2 >= 0 ? allText.slice(Math.max(0, i2 - 120), i2 + 60) : 'absent' };
  }

  /* SELF-7: raw-enum tooltips visible to users. Every title attribute that is a
     bare snake_case enum token rather than prose. */
  {
    const bad = [];
    document.querySelectorAll('[title]').forEach(n => {
      const t = (n.getAttribute('title') || '').trim();
      if (!t) return;
      if (/^[a-z0-9]+(_[a-z0-9]+)+$/.test(t)) bad.push(t);
      else if (/(^|[\s·|])[a-z0-9]+(_[a-z0-9]+){1,}([\s·|]|$)/.test(t) && !/[A-Z]/.test(t.replace(/[a-z0-9_\s·|.,-]/g, ''))) {
        /* token embedded in an otherwise-lowercase string */
        const m = t.match(/[a-z0-9]+(_[a-z0-9]+)+/g) || [];
        m.forEach(x => bad.push(t.slice(0, 90)));
      }
    });
    out['SELF-7_raw_enum_titles'] = { count: bad.length, sample: bad.slice(0, 25) };
  }

  /* SELF-8: historical group must respect page scope. */
  {
    const b = document.querySelector('[data-scope-open]'); if (b) b.click(); await sleep(620);
    const rows = Array.from(document.querySelectorAll('#u11PopList [data-scope]'));
    const claude = rows.find(r => (r.getAttribute('data-scope') || '') === 'fam:claude');
    if (claude) { claude.click(); await sleep(700); }
    await goRoom('ledger');
    const t = paneText('ledger');
    out['SELF-8'] = {
      scope: U.state ? U.state.scope : (U.scope || 'unknown'),
      historical_block_present: /Historical\s*[·-]\s*removed sources/i.test(t),
      openai_in_ledger: /Old OpenAI|OpenAI/i.test(t),
      slice: (t.match(/Historical[\s\S]{0,400}/) || [''])[0]
    };
    /* restore */
    const b2 = document.querySelector('[data-scope-open]'); if (b2) b2.click(); await sleep(600);
    const all = Array.from(document.querySelectorAll('#u11PopList [data-scope]')).find(r => (r.getAttribute('data-scope') || '') === 'scope:all');
    if (all) { all.click(); await sleep(650); }
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); await sleep(300);
  }

  /* SELF-9: reserved spend clipping + title. SELF-11: priced calls counting zeros. */
  {
    await goRoom('costs');
    const t = paneText('costs');
    const i = t.search(/Reserved spend/i);
    out['SELF-9'] = { reserved_ctx: i >= 0 ? t.slice(Math.max(0, i - 150), i + 250) : 'absent' };
    const el = Array.from(document.querySelectorAll('[data-pane="costs"] *')).find(n => /Reserved spend/i.test(n.textContent || '') && n.children.length === 0);
    if (el) {
      const r = el.getBoundingClientRect();
      out['SELF-9'].node = { text: el.textContent.trim(), title: el.getAttribute('title'), scrollW: el.scrollWidth, clientW: el.clientWidth, w: r.width, ellipsis: getComputedStyle(el).textOverflow };
      let a = el, tt = null; while (a && !tt) { tt = a.getAttribute && a.getAttribute('title'); a = a.parentElement; }
      out['SELF-9'].ancestor_title = tt;
    }
    const j = t.search(/priced call/i);
    out['SELF-11'] = { priced_ctx: j >= 0 ? t.slice(Math.max(0, j - 350), j + 350) : 'absent' };
  }

  out.console_error_count = 0;
  return out;
});

R.page_errors = errs; R.console_errors = consoleErrs;
writeFileSync(SP + '/final-probe-results.json', JSON.stringify(R, null, 1));
console.log('page_errors', errs.length, 'console_errors', consoleErrs.length);
console.log('written');
await ctx.close();
