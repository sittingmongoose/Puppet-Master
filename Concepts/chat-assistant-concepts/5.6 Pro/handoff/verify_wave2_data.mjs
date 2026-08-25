/* Wave 2 Demo Data — pixel verification.
   Every visibility claim is elementFromPoint at the target centre PLUS a real
   painted-pixel read: screenshot the crop, hand the PNG back to the page as a
   data URL, draw it to a canvas, getImageData. Never getBoundingClientRect alone.
   Run: node verify_wave2_data.mjs                                            */
import pw from '/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro/node_modules/playwright-core/index.js';
const { chromium } = pw;
import fs from 'fs';
import path from 'path';

const ROOT = '/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro';
const OUT  = '/tmp/claude-1000/-mnt-Cursor-PuppetMaster/6b56d129-8eab-4a4f-bf02-133b45afc809/scratchpad/waves/shots2';
fs.mkdirSync(OUT, { recursive: true });
const URL = 'file://' + path.join(ROOT, 'PM_Chat_Assistant_5.6_Pro_Standalone.html');

const results = [];
const ok = (label, pass, detail) => { results.push({ label, pass: !!pass, detail }); console.log(`${pass ? 'PASS' : 'FAIL'}  ${label}${detail ? '  ' + JSON.stringify(detail) : ''}`); };

const browser = await chromium.launch({ headless: true, executablePath: process.env.HOME + '/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome', args: ['--no-sandbox', '--allow-file-access-from-files', '--disable-gpu'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const consoleErrors = [], pageErrors = [];
page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
page.on('pageerror', e => pageErrors.push(String(e)));

await page.goto(URL, { waitUntil: 'load', timeout: 30000 });
await page.waitForFunction(() => window.__PM56_BOOT_OK === true && window.PM56_DEMO, { timeout: 15000 });

/* ---- painted-pixel helper -------------------------------------------- */
async function painted(sel, name, nth = 0) {
  try { await page.locator(sel).nth(nth).scrollIntoViewIfNeeded({ timeout: 2000 }); } catch (e) { /* fixed overlays cannot scroll */ }
  await page.waitForTimeout(80);
  const box = await page.locator(sel).nth(nth).boundingBox();
  if (!box || box.width <= 0 || box.height <= 0) return { ok: false, why: 'no box' };
  const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
  const hit = await page.evaluate(([x, y, s]) => {
    const el = document.elementFromPoint(x, y);
    return el ? { selfOrInside: !!el.closest(s), tag: el.tagName, cls: (el.className || '').toString().slice(0, 60) } : { selfOrInside: false };
  }, [cx, cy, sel]);
  const vp = page.viewportSize();
  const x0 = Math.max(0, Math.min(box.x, vp.width - 1)), y0 = Math.max(0, Math.min(box.y, vp.height - 1));
  const clip = { x: x0, y: y0,
                 width: Math.max(1, Math.min(box.x + box.width, vp.width) - x0),
                 height: Math.max(1, Math.min(box.y + box.height, vp.height) - y0) };
  if (clip.width < 2 || clip.height < 2) return { ok: false, why: 'off-screen', box };
  const png = await page.screenshot({ clip });
  if (name) fs.writeFileSync(path.join(OUT, name + '.png'), png);
  const colours = await page.evaluate(async (b64) => {
    const img = new Image();
    await new Promise(r => { img.onload = r; img.src = 'data:image/png;base64,' + b64; });
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
    c.getContext('2d').drawImage(img, 0, 0);
    const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
    const set = new Set(); let r = 0, g = 0, bl = 0, n = 0;
    for (let i = 0; i < d.length; i += 4) { set.add((d[i] << 16) | (d[i + 1] << 8) | d[i + 2]); r += d[i]; g += d[i + 1]; bl += d[i + 2]; n++; }
    return { distinct: set.size, mean: [Math.round(r / n), Math.round(g / n), Math.round(bl / n)] };
  }, png.toString('base64'));
  return { ok: hit.selfOrInside && colours.distinct > 3, hit, colours, box };
}

/* ===== 1. every thread renders at least 12 messages ==================== */
const threadIds = await page.evaluate(() => window.PM56_DATA.threads.map(t => t.id));
const perThread = [];
for (const id of threadIds) {
  await page.evaluate(t => window.PM56_DEMO.selectThread(t), id);
  await page.waitForTimeout(60);
  const n = await page.locator('.transcript-inner > *').count();
  perThread.push([id, n]);
}
const minRendered = Math.min(...perThread.map(x => x[1]));
ok('No thread renders fewer than 12 messages', minRendered >= 12, { min: minRendered, perThread });

/* ===== 2. mid-thread model change ====================================== */
await page.evaluate(() => window.PM56_DEMO.selectThread('route'));
await page.waitForTimeout(80);
const routeModels = await page.evaluate(() => {
  const t = window.PM56_DATA.threads.find(x => x.id === 'route');
  return [...new Set(t.messages.filter(m => m.runtime).map(m => m.runtime.model))];
});
/* Is any renderer painting a per-message model yet? */
const modelOnScreen = await page.evaluate(() => {
  const txt = document.querySelector('.transcript').innerText;
  /* per-message metadata, not the route-change receipt text */
  const meta = [...document.querySelectorAll('.message .message-meta, .message .message-details, .message [data-model]')]
    .map(e => e.innerText).join(' ');
  return { anywhereSonnet: txt.includes('Claude Sonnet 4.6'), anywhereQwen: txt.includes('Qwen 3.8'),
           perMessageSonnet: meta.includes('Claude Sonnet 4.6'), perMessageQwen: meta.includes('Qwen 3.8'),
           metaNodes: document.querySelectorAll('.message .message-meta, .message [data-model]').length };
});
ok('Fixture carries two models in one thread', routeModels.length === 2, { routeModels });
ok('Two different models are visible in the route transcript', modelOnScreen.anywhereSonnet && modelOnScreen.anywhereQwen, modelOnScreen);

/* The previous version of the next assertion counted `.message-meta` /
   `[data-model]` nodes and reported `metaNodes: 0` through four reports. Those
   selectors are emitted NOWHERE, and it never clicked "More details", so the
   panel it was looking for could not have been in the DOM. It was an assertion
   STRUCTURALLY INCAPABLE of passing -- the same defect class as
   PM56_RUNTIME.snapshot()'s three permanently-zero metrics, which is this
   concept's documented sin. It reported a real defect for a fake reason.

   Replaced with the measurement that can actually pass or fail: open the
   details panel on two turns in the SAME thread that the fixture says ran on
   different providers/models/accounts/clocks, and compare field by field. */
async function detailsFor(mid) {
  await page.evaluate(id => { const b = document.querySelector(`.message[data-message-id="${id}"] [data-action="message-details"]`); if (b) b.click(); }, mid);
  await page.waitForTimeout(160);
  return page.evaluate(id => {
    const el = document.querySelector(`.message[data-message-id="${id}"] .message-details`);
    if (!el) return null;
    const kv = {}; for (const d of el.querySelectorAll('.detail-kv')) kv[d.querySelector('label').innerText.trim()] = d.querySelector('strong').innerText.trim();
    return kv;
  }, mid);
}
const twoTurns = await page.evaluate(() => {
  const t = window.PM56_DATA.threads.find(x => x.id === 'route');
  const a = t.messages.filter(m => m.runtime);
  const s = a.filter(m => m.runtime.model === 'Claude Sonnet 4.6').pop();
  const q = a.filter(m => m.runtime.model === 'Qwen 3.8')[0];
  return { sId: s.id, sModel: s.runtime.model, qId: q.id, qModel: q.runtime.model };
});
const dS = await detailsFor(twoTurns.sId), dQ = await detailsFor(twoTurns.qId);
const detailKeys = dS ? Object.keys(dS) : [];
ok('Message details panel renders at all', !!dS && detailKeys.length > 10, { fields: detailKeys.length });

/* SECOND PROXY CAUGHT, IN MY OWN INSTRUMENT. The version before this asserted
   that fields DIFFER between two turns. Differing is not correct: a panel can
   differ per turn and still print wrong values, and two hardcoded fields would
   agree across turns while contradicting each other inside one panel (which is
   exactly the dual-cost defect Wave1A found mid-fix). "Differs" was a proxy for
   "is right", the same way advance width was a proxy for a glyph and a bounding
   box is a proxy for visibility.
   This asserts the thing itself: every field equals the value the FIXTURE holds
   for THAT turn. */
const verdict = await page.evaluate(({ sId, qId }) => {
  const t = window.PM56_DATA.threads.find(x => x.id === 'route');
  const pick = id => { const m = t.messages.find(x => x.id === id); const r = m.runtime;
    const hhmmss = iso => iso.slice(11, 19);
    return {
      PROVIDER: r.provider, ACCOUNT: r.account, MODEL: r.model,
      'INPUT TOKENS': r.tokens.input.toLocaleString('en-US'),
      'OUTPUT TOKENS': r.tokens.output.toLocaleString('en-US'),
      'CACHED TOKENS': r.tokens.cached.toLocaleString('en-US'),
      'CACHE HIT': r.context.cacheHitPct + '%',
      'TURN ID': id,
      _startedHHMMSS: hhmmss(m.sentAt), _completedHHMMSS: hhmmss(r.completedAt),
      _ctxUsed: r.context.used.toLocaleString('en-US'), _ctxLimit: r.context.limit.toLocaleString('en-US'),
      _worked: r.workedSeconds, _elapsed: r.totalElapsedSeconds,
      _api: r.cost.apiUsd, _plan: r.cost.planUsd,
      _modeLabel: window.PM56_DATA.labels.mode[r.mode],
      _terminalLabel: window.PM56_DATA.labels.terminal[r.terminal],
      _ctxPct: Math.round(r.context.used / r.context.limit * 100),
      _total: r.cost.totalUsd,
      /* every enum KEY for which labels.* defines a display label */
      _enumKeys: [...Object.keys(window.PM56_DATA.labels.mode), ...Object.keys(window.PM56_DATA.labels.terminal),
                  ...Object.keys(window.PM56_DATA.labels.effort)]
    }; };
  return { s: pick(sId), q: pick(qId) };
}, { sId: twoTurns.sId, qId: twoTurns.qId });

/* THIRD PROXY OF MINE, caught by the panel changing shape under me.
   The previous version asserted the exact 21-field layout I happened to observe
   (CACHED TOKENS, WORKED FOR, TOTAL ELAPSED, raw token counts inside CONTEXT
   USED). The panel legitimately reverted to a 16-field layout and six of my
   checks went red for fields that no longer exist -- I had asserted the SHAPE I
   saw rather than the PROPERTY that must hold. Same family as the others: a
   snapshot standing in for a rule.
   Shape-independent now: whatever fields the panel emits must each trace to a
   fixture value for THAT turn, a small required set must exist, and no field may
   print a raw enum key when labels.* defines a display label for it. */
function auditPanel(panel, exp, who) {
  const bad = [];
  for (const k of ['PROVIDER', 'ACCOUNT', 'MODEL', 'TURN ID'])
    if (!(k in panel)) bad.push(`${who}.${k}: required field missing from the panel`);
  const eq = (k, v) => { if (k in panel && panel[k] !== v) bad.push(`${who}.${k}: panel="${panel[k]}" fixture="${v}"`); };
  const has = (k, needle) => { if (k in panel && !String(panel[k]).includes(needle)) bad.push(`${who}.${k}: panel="${panel[k]}" must contain "${needle}"`); };
  eq('PROVIDER', exp.PROVIDER); eq('ACCOUNT', exp.ACCOUNT); eq('MODEL', exp.MODEL); eq('TURN ID', exp['TURN ID']);
  eq('INPUT TOKENS', exp['INPUT TOKENS']); eq('OUTPUT TOKENS', exp['OUTPUT TOKENS']);
  eq('CACHED TOKENS', exp['CACHED TOKENS']); eq('CACHE HIT', exp['CACHE HIT']);
  has('STARTED', exp._startedHHMMSS); has('COMPLETED', exp._completedHHMMSS);
  has('MODE', exp._modeLabel);
  /* CONTEXT USED may be "N / LIMIT · P%" or just "P%" -- either is honest, so
     assert whichever form is on screen against the fixture. */
  if ('CONTEXT USED' in panel) {
    const v = String(panel['CONTEXT USED']);
    if (v.includes('/')) { has('CONTEXT USED', exp._ctxUsed); has('CONTEXT USED', exp._ctxLimit); }
    else if (!v.includes(exp._ctxPct + '%')) bad.push(`${who}.CONTEXT USED: panel="${v}" fixture pct="${exp._ctxPct}%"`);
  }
  /* Display-label rule, generalised: if labels.* defines a label for a value,
     the panel must print the LABEL, never the enum key. Catches `complete`
     where `Completed` is defined, not only underscored values. */
  for (const [k, v] of Object.entries(panel)) {
    if (exp._enumKeys.includes(String(v))) bad.push(`${who}.${k}: prints raw enum "${v}" where labels.* defines a display label`);
    if (/^[a-z]+_[a-z]+$/.test(String(v))) bad.push(`${who}.${k}: raw underscored enum "${v}" is user-facing`);
  }
  /* Every money field must trace to a fixture cost -- api, plan OR total.
     The narrow api-or-plan version went red on a legitimate `Total estimated`
     row, which was my bug, not the panel's. */
  for (const [k, v] of Object.entries(panel)) {
    if (!/^\$/.test(String(v))) continue;
    const n = parseFloat(String(v).replace('$', ''));
    if (![exp._api, exp._plan, exp._total].some(x => Math.abs(n - x) <= 0.001))
      bad.push(`${who}.${k}: "${v}" traces to no fixture cost (api ${exp._api}, plan ${exp._plan}, total ${exp._total}) -- an invented number`);
  }
  return bad;
}
const mismatches = [...auditPanel(dS, verdict.s, twoTurns.sId), ...auditPanel(dQ, verdict.q, twoTurns.qId)];
ok('Every field the details panel emits traces to the FIXTURE value for that turn (shape-independent)',
  mismatches.length === 0,
  { fields: detailKeys.length, mismatches,
    modelRow: { [twoTurns.sId]: dS && dS.MODEL, [twoTurns.qId]: dQ && dQ.MODEL },
    moneyFields: Object.entries(dQ || {}).filter(([, v]) => /^\$/.test(String(v))).map(([k, v]) => `${k}=${v}`) });

/* FIXTURE INVARIANT GUARD -- the trap Wave1A's sweep exposed.
   `renderMessageDetails` has an `if(!runtime)` fallback that sources Model /
   Provider / Account from selectedModel(), i.e. the GLOBALLY selected model.
   That path is dead today ONLY because every assistant text message in this
   fixture carries a runtime block -- an accidental property of my data that
   nothing enforced. Ship one assistant turn without runtime and the original
   misattribution defect silently returns, on that turn only, where nobody is
   looking for it. This makes the accident a contract. */
const runtimeGap = await page.evaluate(() => {
  const D = window.PM56_DATA;
  const bad = [];
  for (const th of D.threads) for (const m of th.messages)
    if (m.type === 'text' && m.role === 'assistant' && !m.runtime) bad.push(`${th.id}/${m.id}`);
  for (const a of D.subagents) for (const m of a.messages)
    if (m.type === 'text' && m.role === 'assistant' && !m.runtime) bad.push(`${a.id}/${m.id}`);
  const text = D.threads.flatMap(t => t.messages).filter(m => m.type === 'text');
  return { bad, total: text.length, withRuntime: text.filter(m => m.runtime).length,
           withoutAllUser: text.filter(m => !m.runtime).every(m => m.role === 'user') };
});
ok('Every assistant text message carries a runtime block (keeps the selectedModel() misattribution path dead)',
  runtimeGap.bad.length === 0 && runtimeGap.withoutAllUser, runtimeGap);

/* The details panel's FALLBACK path (user turns, no runtime) must obey the
   same display-label rule as the runtime path -- it is a separate branch and
   was fixed separately. */
const userPanel = await page.evaluate(async () => {
  const t = window.PM56_DATA.threads.find(x => x.id === 'route');
  const u = t.messages.find(m => m.role === 'user' && m.type === 'text');
  const btn = document.querySelector(`.message[data-message-id="${u.id}"] [data-action="message-details"]`);
  if (btn) btn.click();
  return u.id;
});
await page.waitForTimeout(180);
const userRaw = await page.evaluate(id => {
  const el = document.querySelector(`.message[data-message-id="${id}"] .message-details`);
  if (!el) return { missing: true };
  const L = window.PM56_DATA.labels;
  const keys = [...Object.keys(L.terminal), ...Object.keys(L.mode), ...Object.keys(L.effort)];
  const out = { raw: [], terminal: null };
  for (const d of el.querySelectorAll('.detail-kv')) {
    const k = d.querySelector('label').innerText.trim(), v = d.querySelector('strong').innerText.trim();
    if (k === 'TERMINAL REASON') out.terminal = v;
    if (keys.includes(v) || /^[a-z]+_[a-z]+$/.test(v)) out.raw.push(`${k}="${v}"`);
  }
  return out;
}, userPanel);
ok('Details fallback path (user turns) prints display labels, not enum keys',
  !userRaw.missing && userRaw.raw.length === 0, { turn: userPanel, ...userRaw });

/* FIXTURE INVARIANT GUARD #2 -- the mirror of the runtime guard above.
   Retry message (cmd.chat.retry_message) is only eligible on a failed or
   cancelled assistant turn. Every one of the 190 assistant turns shipped
   terminal:'complete', so the ENABLED branch of a required operation had no
   data to exercise it -- correct code, unreachable by fixture. "Unreachable
   today" is a property of the DATA, not of the code, so it belongs in an
   assertion here rather than in a note. Remove these turns and Retry silently
   goes back to being demonstrable only by injection. */
const terminals = await page.evaluate(() => {
  const D = window.PM56_DATA;
  const rt = D.threads.flatMap(t => t.messages).filter(m => m.runtime);
  const by = {};
  for (const m of rt) (by[m.runtime.terminal] = by[m.runtime.terminal] || []).push(m.id);
  return { by: Object.fromEntries(Object.entries(by).map(([k, v]) => [k, v.length])),
           errorTurns: by.error || [], stoppedTurns: by.stopped || [],
           errorHasReason: (by.error || []).every(id => {
             const m = D.threads.flatMap(t => t.messages).find(x => x.id === id);
             return typeof m.runtime.error === 'string' && m.runtime.error.length > 10; }),
           labelled: ['error', 'stopped'].every(k => !!D.labels.terminal[k]) };
});
ok('At least one assistant turn ends in error and one is stopped (keeps Retry message reachable)',
  terminals.errorTurns.length >= 1 && terminals.stoppedTurns.length >= 1 &&
  terminals.errorHasReason && terminals.labelled, terminals);

/* ...and the non-complete terminals must PAINT their display label, not the key. */
const terminalPaint = {};
for (const [tid, mid] of [['tool-failure', terminals.errorTurns[0]], ['debug', terminals.stoppedTurns[0]]]) {
  if (!mid) continue;
  await page.evaluate(t => window.PM56_DEMO.selectThread(t), tid);
  await page.waitForTimeout(140);
  await page.evaluate(id => { const b = document.querySelector(`.message[data-message-id="${id}"] [data-action="message-details"]`); if (b) b.click(); }, mid);
  await page.waitForTimeout(160);
  terminalPaint[mid] = await page.evaluate(id => {
    const el = document.querySelector(`.message[data-message-id="${id}"] .message-details`);
    if (!el) return null;
    for (const d of el.querySelectorAll('.detail-kv'))
      if (d.querySelector('label').innerText.trim() === 'TERMINAL REASON') return d.querySelector('strong').innerText.trim();
    return null;
  }, mid);
}
ok('Error and stopped turns paint their display label, not the enum key',
  terminalPaint[terminals.errorTurns[0]] === 'Ended in error' &&
  terminalPaint[terminals.stoppedTurns[0]] === 'Stopped by user', terminalPaint);
await page.evaluate(() => window.PM56_DEMO.selectThread('route'));
await page.waitForTimeout(120);

/* ===== 3. subagent list renders more than 5, with varied statuses ====== */
await page.evaluate(() => window.PM56_DEMO.selectThread('query'));
await page.evaluate(() => window.PM56_DEMO.pinActivity());
await page.evaluate(() => window.PM56_DEMO.openActivity('subagents'));
await page.waitForTimeout(200);
const agentRows = await page.evaluate(() => {
  const rows = [...document.querySelectorAll('.activity-panel [data-action="open-agent"]')];
  return rows.map(r => ({ id: r.dataset.id, text: r.innerText.replace(/\s+/g, ' ').slice(0, 90) }));
});
const statusesShown = await page.evaluate(() => {
  const txt = [...document.querySelectorAll('.activity-panel')].map(e => e.innerText).join(' ').toLowerCase();
  return ['working', 'stalled', 'blocked', 'waiting', 'complete', 'failed', 'queued', 'retrying', 'fallback'].filter(s => txt.includes(s));
});
ok('Subagent list renders more than 5 rows', agentRows.length > 5, { count: agentRows.length, first: agentRows.slice(0, 3) });
ok('Subagent list shows varied statuses', statusesShown.length >= 4, { statusesShown });
const agentPaint = agentRows.length ? await painted('.activity-panel [data-action="open-agent"]', 'subagent-row', 0) : { ok: false };
ok('First subagent row is hit-testable and painted', agentPaint.ok, { hit: agentPaint.hit, colours: agentPaint.colours });

/* a subagent row click actually changes the editor */
if (agentRows.length) {
  await page.locator('.activity-panel [data-action="open-agent"]').nth(6).click();
  await page.waitForTimeout(200);
  const ed = await page.evaluate(() => { const h = document.querySelector('.editor-doc h1'); return h ? h.innerText : null; });
  ok('Clicking a subagent row opens THAT agent', !!ed && ed.length > 0, { editorTitle: ed });
}

/* ===== 4. changed-file row opens THAT file =========================== */
await page.evaluate(() => window.PM56_DEMO.openActivity('changes'));
await page.waitForTimeout(200);
const changeRows = await page.evaluate(() => [...document.querySelectorAll('.activity-panel [data-action="open-change"]')].map(r => r.dataset.path));
ok('Changed-file rows render for all 12 files', changeRows.length === 12, { count: changeRows.length });

const probes = [];
for (const want of ['threads/provider-selector.js', 'threads/access-controls.css', 'verification/interaction-probes.mjs']) {
  await page.evaluate(() => window.PM56_DEMO.openActivity('changes'));
  await page.waitForTimeout(150);
  await page.locator(`.activity-panel [data-action="open-change"][data-path="${want}"]`).first().click();
  await page.waitForTimeout(260);
  const doc = await page.evaluate(() => {
    const d = document.querySelector('.editor-doc');
    if (!d) return null;
    const h1 = d.querySelector('h1')?.innerText || '';
    const meta = [...d.querySelectorAll('.editor-meta .meta-pill')].map(x => x.innerText);
    const code = d.querySelector('.code-block')?.innerText || '';
    return { h1, meta, codeHead: code.split('\n').slice(0, 3).join(' | '), hasCannedSql: code.includes('CREATE INDEX CONCURRENTLY idx_events_tenant_created'), lines: code.split('\n').length };
  });
  probes.push(doc);
}
const paths = probes.map(p => p && p.h1);
ok('Each changed-file row opens its own path', new Set(paths).size === 3, { paths });
ok('Each editor shows that file\'s own +N −M totals', probes.every(p => p && p.meta.some(m => /[+]\d+/.test(m))) && new Set(probes.map(p => p.meta.join())).size === 3, { meta: probes.map(p => p.meta) });
const anyCanned = probes.some(p => p && p.hasCannedSql);
ok('Editor shows the file\'s REAL diff (not the canned CREATE INDEX SQL)', !anyCanned, { codeHeads: probes.map(p => p && p.codeHead) });
const codePaint = await painted('.editor-doc .code-block', 'file-editor-code');
ok('File editor code block is painted', codePaint.ok, { colours: codePaint.colours });
/* REGRESSION GUARD (Wave1A's observation, worth keeping): the canned filler was
   uniform enough to be detectable by entropy alone. Real syntax-varied diff text
   measured 967 distinct colours in this crop; the fabricated `-- surrounding
   source and migration context` block measured 739. If this collapses back toward
   739, something has started GENERATING source again instead of reading `hunks`. */
ok('Diff crop entropy is above the canned-filler floor (>850 distinct colours)',
  codePaint.colours && codePaint.colours.distinct > 850,
  { distinct: codePaint.colours && codePaint.colours.distinct, cannedBaseline: 739, realBaseline: 967 });

/* ===== 5. expand-state does NOT leak between threads ================== */
await page.evaluate(() => window.PM56_DEMO.selectThread('plain'));
await page.waitForTimeout(120);
const expandBtn = page.locator('[data-action="toggle-message"]').first();
const firstId = await expandBtn.getAttribute('data-id');
await expandBtn.click();
await page.waitForTimeout(120);
const expandedInPlain = await page.evaluate(id => !!window.PM56_DEMO.getState().messageExpanded[id], firstId);
await page.evaluate(() => window.PM56_DEMO.selectThread('new-message'));
await page.waitForTimeout(120);
const leak = await page.evaluate(() => {
  const st = window.PM56_DEMO.getState();
  const t = st.threads.find(x => x.id === 'new-message');
  const expandedIds = Object.keys(st.messageExpanded).filter(k => st.messageExpanded[k]);
  const collide = t.messages.filter(m => expandedIds.includes(m.id)).map(m => m.id);
  const faded = [...document.querySelectorAll('.message-body')].filter(e => !e.classList.contains('long-fade')).length;
  const longOnes = [...document.querySelectorAll('.message-body.long-fade')].length;
  return { expandedIds, collide, faded, longOnes };
});
ok('Expanding in `plain` marks exactly that id', expandedInPlain, { firstId });
ok('Expand state does NOT leak into `new-message`', leak.collide.length === 0, leak);
const idOverlap = await page.evaluate(() => {
  const D = window.PM56_DATA;
  const a = new Set(D.threads.find(t => t.id === 'plain').messages.map(m => m.id));
  const b = D.threads.find(t => t.id === 'new-message').messages.map(m => m.id);
  return b.filter(x => a.has(x));
});
ok('`plain` and `new-message` share zero message ids', idOverlap.length === 0, { overlap: idOverlap });

/* ===== 6. model menu paints the new 14 models across 9 accounts ======= */
await page.evaluate(() => window.PM56_DEMO.selectThread('query'));
await page.waitForTimeout(100);
await page.locator('[data-menu-anchor="model"]').click();
await page.waitForTimeout(250);
const menu = await page.evaluate(() => {
  const m = document.querySelector('.overlay-menu.model-menu');
  if (!m) return null;
  const rows = [...m.querySelectorAll('.model-row')];
  const sc = m.querySelector('.model-scroll');
  return { rows: rows.length, groups: m.querySelectorAll('.menu-section-label').length,
    scrollable: sc ? sc.scrollHeight > sc.clientHeight + 1 : false,
    clientH: sc ? sc.clientHeight : 0, scrollH: sc ? sc.scrollHeight : 0,
    dupNames: (() => { const n = rows.map(r => r.querySelector('.model-copy strong')?.innerText.trim()); return n.filter((x, i) => n.indexOf(x) !== i); })() };
});
ok('Model menu renders all 14 models', menu && menu.rows === 14, menu);
ok('Model menu groups by provider (5 groups)', menu && menu.groups === 5, { groups: menu && menu.groups });
ok('Same model appears on two accounts (duplicate display names present)', menu && menu.dupNames.length >= 2, { dupNames: menu && menu.dupNames });
const rowPaint = await painted('.overlay-menu.model-menu .model-row', 'model-row-13', 13);
ok('The 14th model row is hit-testable and painted', rowPaint.ok, { hit: rowPaint.hit, colours: rowPaint.colours });
await page.keyboard.press('Escape');
await page.waitForTimeout(120);

/* ===== 7. activity bar counts derive from the grown fixtures ========== */
const bar = await page.evaluate(() => {
  const out = {};
  for (const b of document.querySelectorAll('.activity-item[data-hover-domain]')) {
    out[b.dataset.hoverDomain] = b.querySelector('.count')?.innerText.trim();
  }
  return out;
});
ok('Activity bar counts derive from the fixtures', bar.subagents === '14' && bar.changes === '12' && bar.artifacts === '18', bar);

/* ===== 8. search reaches text hidden behind the collapse fade ========= */
const searchResults = {};
for (const phrase of ['retention window nine days', 'blue lantern checkpoint', 'canonical source history']) {
  const input = page.locator('[data-input="history-search"]').first();
  if (!(await input.count())) {
    await page.locator('[data-action="toggle-history"], [data-action="open-history"], [data-action="show-archived"]').first().click().catch(() => {});
    await page.waitForTimeout(200);
  }
  const inp = page.locator('[data-input="history-search"]').first();
  if (!(await inp.count())) { searchResults[phrase] = { rows: 0, titles: [], why: 'no history search input' }; continue; }
  await inp.fill(phrase);
  await page.waitForTimeout(260);
  const rows = await page.locator('.history-scroll .thread-row').count();
  const titles = await page.evaluate(() => [...document.querySelectorAll('.history-scroll .thread-row .thread-title span')].map(e => e.innerText));
  searchResults[phrase] = { rows, titles };
  await inp.fill('');
  await page.waitForTimeout(150);
}
ok('All three planted phrases are findable via history search',
  Object.keys(searchResults).length === 3 && Object.values(searchResults).every(r => r && r.rows >= 1), searchResults);

/* the phrase really is behind the fade, not in plain view */
await page.evaluate(() => window.PM56_DEMO.selectThread('offline'));
await page.waitForTimeout(150);
const hidden = await page.evaluate(() => {
  const arts = [...document.querySelectorAll('.message')];
  for (const a of arts) {
    const body = a.querySelector('.message-body');
    if (body && body.innerText.includes('blue lantern checkpoint')) {
      return { faded: body.classList.contains('long-fade'), clipped: body.scrollHeight > body.clientHeight + 1, h: body.clientHeight, sh: body.scrollHeight };
    }
  }
  return null;
});
ok('`blue lantern checkpoint` sits inside collapsed content', hidden && hidden.faded, hidden);

/* ===== 9. two themes, no overflow, renderers still render ============ */
for (const theme of ['basic-dark', 'friendly-light']) {
  await page.evaluate(t => window.PM56_DEMO.setTheme(t), theme);
  await page.evaluate(() => window.PM56_DEMO.selectThread('query'));
  await page.evaluate(() => window.PM56_DEMO.pinActivity());
  await page.waitForTimeout(300);
  const o = await page.evaluate(() => ({
    sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth,
    activityRows: document.querySelectorAll('.activity-panel .activity-line, .activity-panel [data-action]').length,
    transcript: document.querySelectorAll('.transcript-inner > *').length,
    workingCard: !!document.querySelector('.working-card'),
    bar: document.querySelectorAll('.activity-item[data-hover-domain]').length
  }));
  ok(`Theme ${theme}: no horizontal overflow`, o.sw <= o.cw + 1, o);
  ok(`Theme ${theme}: activity panel, transcript, working card and bar all render`, o.activityRows > 5 && o.transcript >= 12 && o.workingCard && o.bar === 5, o);
  await page.screenshot({ path: path.join(OUT, `theme-${theme}.png`) });
}

/* ===== 9b. every non-ASCII character data.js emits has a real glyph, in
   BOTH font stacks, in all eight themes.

   PIXELS, NOT ADVANCE WIDTH. The obvious version of this test compares each
   glyph's rendered width against a tofu box. That is only valid in a
   PROPORTIONAL font: in a monospace font every glyph shares one advance width
   by definition, tofu included, so the width test reports 100% missing and
   reads exactly like a content failure. `body[data-theme^="retro"]` sets
   --font-ui: var(--font-mono), and the file-editor diff blocks use --font-mono
   in ALL eight themes -- so the width version is wrong in more than half the
   surface. Render to canvas, count ink, compare the bitmap against a
   private-use codepoint no font maps. (Caught by Wave1A-Platform; the same
   trap as getBoundingClientRect standing in for visibility.)

   This matters because `·` is load-bearing in this fixture, not decoration:
   every account label, every route.label, every worktree state label and the
   subagent group summaries are built on it. */
const glyphMissing = {};
for (const theme of ['basic-dark','basic-light','friendly-dark','friendly-light','glass-dark','glass-light','retro-dark','retro-light']) {
  await page.evaluate(t => window.PM56_DEMO.setTheme(t), theme);
  await page.waitForTimeout(90);
  const miss = await page.evaluate(() => {
    const CH = { middot:'·', emdash:'—', minus:'−', arrow:'→', rsquo:'’', ellipsis:'…' };
    const TOFU = String.fromCodePoint(0xF0000);
    const c = document.createElement('canvas'); c.width = 64; c.height = 64;
    const g = c.getContext('2d', { willReadFrequently: true });
    const bm = (ch, fam) => { g.clearRect(0,0,64,64); g.fillStyle='#000'; g.font=`36px ${fam}`;
      g.textBaseline='middle'; g.fillText(ch,8,32);
      const d = g.getImageData(0,0,64,64).data; let ink=0, sig='';
      for (let i=3;i<d.length;i+=4) if (d[i]>16) { ink++; sig += ((i/4)|0).toString(36); }
      return sig.length ? sig.slice(0,80)+':'+sig.length : 'blank'; };
    const cs = getComputedStyle(document.body);
    const out = [];
    for (const fam of [cs.getPropertyValue('--font-ui').trim(), cs.getPropertyValue('--font-mono').trim()]) {
      const tofu = bm(TOFU, fam);
      for (const [n, ch] of Object.entries(CH)) { const h = bm(ch, fam); if (h === tofu || h === 'blank') out.push(`${n}@${fam.split(',')[0]}`); }
    }
    return out;
  });
  if (miss.length) glyphMissing[theme] = miss;
}
await page.evaluate(() => window.PM56_DEMO.setTheme('basic-dark'));
ok('Every non-ASCII character in data.js has a real glyph in all 8 themes, both font stacks',
  Object.keys(glyphMissing).length === 0, glyphMissing);

/* ===== 10. working takes still render with the grown phaseRows ======= */
await page.evaluate(() => window.PM56_DEMO.setTheme('basic-dark'));
let takeFails = [];
for (const v of [0, 1, 2, 6, 8, 11, 15, 19, 23]) {
  await page.evaluate(o => window.PM56_DEMO.setVariant(2, o), v);
  await page.evaluate(() => window.PM56_DEMO.setWorkStep(8));
  await page.waitForTimeout(120);
  const c = await page.evaluate(() => {
    const el = document.querySelector('.working-card');
    return el ? { h: el.getBoundingClientRect().height, text: el.innerText.length } : null;
  });
  if (!c || c.h < 40 || c.text < 20) takeFails.push([v, c]);
}
ok('Working takes still render with the 14-phase phaseRows', takeFails.length === 0, { takeFails });

/* ===== wrap ========================================================== */
ok('Zero console errors', consoleErrors.length === 0, consoleErrors.slice(0, 5));
ok('Zero page errors', pageErrors.length === 0, pageErrors.slice(0, 5));

fs.writeFileSync(path.join(OUT, 'results.json'), JSON.stringify({ results, consoleErrors, pageErrors }, null, 2));
console.log('\n--- ' + results.filter(r => r.pass).length + ' pass / ' + results.filter(r => !r.pass).length + ' fail ---');
await browser.close();
