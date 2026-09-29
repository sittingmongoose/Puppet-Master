/* Back Seat Driver surfaces for tests/pmx-verify.mjs (package BSD, DESIGN-SPEC 8.6).
   SHEETS (step 1) then CHAT (step 2, further down): the margin note and its lines in the chat, Context Details, the
   two raw-data sheets and the recorded example's workspace.
   wand.mjs already opens the sheet in its default state (wand:bsd). These are the other states the blueprint
   draws: Off (dimmed columns, closed eye, no cues), On, Auto + Frequent (the drift cue), the Advanced page (Where
   it watches, a run in progress, tidying its notes) plain and with changed rows, the advisor model unavailable
   (the no-substitute sentence), a partial Save refused (A1-37: "Mode saved; the rest didn't."), and the sheet over
   an active assignment ("Save and refresh advisor").
   `canon` (A2-27a): the principle-10 names each state shows. The Advanced page also shows the ten canonical stage
   names in fine print (8.6). States whose open() changes the engine or the threads (the refusal seeds a
   concurrent change; the refresh state starts a recorded example) opt out of the effects ledger: their setup is
   the durable change, not the sheet. */
const OPEN = { group: 'assist', sel: '[data-action="bsd-configure-stages"]', hover: '[data-submenu="bsd-v2"]' };
const CANON = ['Back Seat Driver', 'Off', 'Auto', 'On'];
const STAGES = ['PRD Builder', 'Planning Wizard', 'Plan Drafting', 'PlanUnit Compilation', 'WorkNode Generation', 'Code Generation', 'Verification Run', 'Gate Evaluation', 'Audit Review', 'Certification'];
async function openSheet(h) {
  const ok = await h.wandDialog(OPEN.group, OPEN.sel, OPEN.hover);
  if (!ok) throw new Error('wand row not found: ' + OPEN.sel);
  await h.page.mouse.move(4, 4);
}
/* the foot's read-back and estimate are never clamped or cut (review cycle 1: the Save and refresh advisor foot cut
   both in retro and friendly); `want` is a pattern the read-back must match */
async function footWhole(h, want) {
  const r = await h.ev(() => {
    const say = document.querySelector('#pmOverlayRoot .pmx-sheet .pmx-foot-say'); if (!say) return { missing: true };
    const cut = [...say.querySelectorAll('*')].filter(e => e.getClientRects().length && ((e.scrollHeight > e.clientHeight + 1 && getComputedStyle(e).overflowY !== 'visible') || (e.scrollWidth > e.clientWidth && getComputedStyle(e).overflowX !== 'visible')))
      .map(e => e.className + ': ' + e.textContent.trim().slice(0, 60));
    return { cut, readback: (say.querySelector('.pmx-readback') || {}).textContent || '' };
  });
  if (r.missing) throw new Error('no sheet foot');
  if (r.cut.length) throw new Error('the foot cuts its words: ' + r.cut.join(' | '));
  if (want && !want.test(r.readback)) throw new Error(`the read-back should match ${want}, got "${r.readback}"`);
}
async function click(h, sel) { if (!(await h.clickVisible(sel))) throw new Error('not found: ' + sel); await h.wait(250); await h.settle(); }
async function pickChoice(h, field, value) {
  await click(h, `#pmOverlayRoot .pmx-sheet [data-action="bsd-choice"][data-field="${field}"]`);
  await click(h, `.overlay-menu [data-action="shared-choice-pick"][data-value="${value}"]`);
  await h.page.mouse.move(4, 4);
}
/* the reduced-motion census's state change: one in-sheet change that opens no dropdown (the preserved menus keep
   their own motion, DON'T 12, so a census that opened one would measure menus.js, not the sheet) */
const QUIET_STEP = async h => { await h.clickVisible('#pmOverlayRoot .pmx-sheet .pmx-bsd-col [data-action="pmx-step"][data-delta="1"]'); };
const TIDY_STEP = async h => { await h.clickVisible('#pmOverlayRoot .pmx-sheet .pmx-set [data-action="pmx-step"][data-delta="5"], #pmOverlayRoot .pmx-sheet .pmx-set [data-action="pmx-step"][data-delta="-5"]'); };
const MODE = v => async h => { await h.clickVisible(`#pmOverlayRoot [data-action="bsd-config-mode"][data-value="${v}"]`); };
function sheet(id, title, then, extra = {}) {
  return Object.assign({
    id, title, kind: 'sheet', tags: ['app', 'bsd'], common: true, canon: CANON, change: QUIET_STEP,
    async open(h) { await openSheet(h); if (then) await then(h); await h.settle(); },
    async after(h) { await h.closeAll(); }
  }, extra);
}

/* ---------------------------------------------------------------- CHAT (step 2)
   Every in-chat state is reached through the recorded example (bsd12-start survives | resolves) and its own
   controls (bsd12-work ops, the lab's "what the next check does", Dismiss, Why?), never by writing state. setup()
   builds the state once per page; open() only closes overlays and scrolls the chat to its end, so every theme and
   layout looks at the same state. A catch-up wait is held still (PM56_BSD_DEMOS.still(): the example's own timer
   would end it) so it can be looked at.
   A1-27 status check, as the owner answered E-10 (B, 2026-09-27: plain words only): for every state it renders, the
   eye's hover card, the Context row and the Details status line each read as one row of the one plain-words table in
   bsd.js (matched whole, below), none of them prints a canon state word ("Caught up", "Finding held", "Quota
   paused"...), and the eye never says "Double-checking" (BSD-04: a held finding is never in the chat). */
const PLAIN = {
  off: /^Off$/, caughtUp: /^Up to date · checked \S.*$/, idle: /^Watching · nothing to check yet$/,
  reviewing: /^Checking the latest work…$/, behind: /^\d+ updates? behind$/, priming: /^Getting up to speed$/,
  waiting: /^Holding a moment for your advisor · up to \d+ s$/, held: /^Double-checking \d+ things?$/,
  delivered: /^\d+ notes? in this chat$/, quota: /^Paused: usage limit reached · your main work continues$/,
  failed: /^Couldn’t check this time \(.+\)$/, safety: /^Paused for safety · its last two answers weren’t usable$/,
  unreachable: /^Couldn’t reach its model this time$/, noModel: /^.+ isn’t available right now$/,
  paused: /^Paused by you$/, stopped: /^Stopped for this run$/
};
const EYE_NAME = 'Back Seat Driver · ';
const CANON_WORDS = /\b(Caught up|Finding held|Quota paused|Advice delivered|Idle|Reviewing|Catching up|Failed|Unavailable|Stale)\b/;
const CATCHING = ['behind', 'priming', 'waiting'], FAILED = ['failed', 'safety'];
const op = (h, o) => h.ev(o => { const c = window.PM56_EXT.ctx(); const b = document.createElement('button'); b.dataset.thread = c.thread.id; b.dataset.op = o; window.PM56_EXT._actions['bsd12-work'](c, b); }, o);
const run = async (h, ...ops) => { for (const o of ops) { await op(h, o); await h.wait(o === 'review' || o === 'start' ? 900 : 350); } };
const fault = (h, f) => h.ev(f => window.PM56_BSD_DEMOS.fault(window.PM56_EXT.ctx().thread.id, f), f);
const bsdAct = (h, name, data = {}) => h.ev(([n, d]) => { const c = window.PM56_EXT.ctx(); const b = document.createElement('button'); b.dataset.thread = c.thread.id; Object.assign(b.dataset, d); window.PM56_EXT._actions[n](c, b); c.renderApp(); }, [name, data]);
async function example(h, flow) { await h.closeAll(); await h.action('bsd12-start', { flow }); await h.wait(900); }
async function emitted(h) { await example(h, 'survives'); await run(h, 'start', 'advance', 'review'); }
async function tokens(h, want) {
  const got = await h.ev(async () => {
    const c = window.PM56_EXT.ctx(), dot = document.querySelector('.capability-dot.bsd');
    const eye = dot ? dot.getAttribute('data-hover-tip') : null;
    c.state.context.details = true; c.state.context.drawerView = 'curated'; c.renderApp();
    const details = (document.querySelector('#ctx-bsd .pmx-bsd-status') || {}).textContent || null;
    c.state.context.details = false; c.state.menu = null; c.renderApp();
    const ring = document.querySelector('[data-action="context-menu"]'); if (ring) ring.click();
    await new Promise(r => setTimeout(r, 350));
    const row = (document.querySelector('.bsd-ctx-row .bsd-live') || {}).textContent || null;
    c.state.menu = null; c.renderApp();
    return { eye, row, details, notes: document.querySelectorAll('.transcript .bsd-card').length };
  });
  /* the eye's hover names what it is first (principle 10, review cycle 1): "Back Seat Driver · <status>" */
  if (got.eye != null) {
    if (!got.eye.startsWith(EYE_NAME)) throw new Error(`the eye's hover does not name Back Seat Driver first: "${got.eye}"`);
    got.eye = got.eye.slice(EYE_NAME.length);
  }
  for (const where of ['eye', 'row', 'details']) {
    const text = got[where];
    if (want[where] === null) { if (text) throw new Error(`A1-27: expected no ${where}, got "${text}"`); continue; }
    if (CANON_WORDS.test(text || '')) throw new Error(`E-10: the ${where} prints a canon state word: "${text}"`);
    const key = Object.keys(PLAIN).find(k => PLAIN[k].test(text || ''));
    if (!key) throw new Error(`A1-27: the ${where} is not a row of the plain-words table: "${text}"`);
    const ok = [].concat(want[where] || []);
    if (ok.length && !ok.includes(key)) throw new Error(`A1-27: the ${where} reads as ${key}, expected ${ok.join(' or ')} ("${text}")`);
  }
  if (/^Double-checking/.test(got.eye || '')) throw new Error('BSD-04: the eye by the composer says "Double-checking"');
  if (want.notes != null && got.notes !== want.notes) throw new Error(`expected ${want.notes} BSD items in the chat, found ${got.notes}`);
  return got;
}
/* every open() starts from the same state whichever theme ran first: the pointer parked, focus dropped, the raw-data
   disclosures folded (bsd.js remembers disclosures, so an edit step that opened one would leak into the next theme) */
async function neutral(h) { await h.page.mouse.move(4, 4); await h.ev(() => { if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur(); if (window.PM56_BSD.foldRaw) window.PM56_BSD.foldRaw(); }); }
async function scrollEnd(h) { await h.ev(() => { const t = document.querySelector('.transcript'); if (t) { t.style.scrollBehavior = 'auto'; t.scrollTop = t.scrollHeight; t.style.scrollBehavior = ''; } }); await h.wait(200); }
const SEV = ['Concern'];
function chat(id, title, build, extra = {}) {
  return Object.assign({
    id, title, kind: 'chat', tags: ['app', 'bsd', 'chat'], canon: SEV,
    async setup(h) { await build(h); await h.settle(); },
    /* the example opens its workspace in the editor; a narrow window then shows the editor instead of the chat, so the
       chat surfaces close that document first (the app's own state at boot: no editor revealed) */
    async open(h) { await h.closeAll(); await h.ev(() => { const c = window.PM56_EXT.ctx(), id = 'bsd12:' + c.thread.id; if (c.state.editorTabs.includes(id)) c.closeEditor(id); c.state.editorRevealed = false; if (window.PM56_BSD.foldAsides) window.PM56_BSD.foldAsides(); c.renderApp(); }); await neutral(h); await scrollEnd(h); await h.settle(); },
    async after(h) { await h.closeAll(); await neutral(h); }
  }, extra);
}
const CHAT = [
  chat('bsd:chat-note', 'Advisor note in the chat (C21): Concern, checked against the latest work (v2)', async h => {
    await emitted(h); await tokens(h, { eye: 'delivered', row: 'delivered', details: 'delivered', notes: 1 });
  }, {
    /* streaming realism: the advisor answers with a 1,500-word markdown detail (code, a table); the note keeps its
       clamps in the chat and Details renders the whole answer, code in <pre> */
    async stream(h, md) {
      await h.ev(md => { const B = window.PM56_BSD, a = B.engine.current(window.PM56_EXT.ctx().thread.id), f = a.findings.find(x => x.status === 'emitted'); window.__bsdOrig = { f, title: f.title, detail: f.detail }; f.title = 'The export keeps the whole file in memory before it writes a single row, so large collections run out of memory'; f.detail = md; B.refresh(); }, md);
      await h.wait(400); await scrollEnd(h);
      return {};
    },
    async after(h) { await h.ev(() => { const o = window.__bsdOrig; if (o) { o.f.title = o.title; o.f.detail = o.detail; window.__bsdOrig = null; window.PM56_BSD.refresh(); } }); await h.closeAll(); }
  }),
  chat('bsd:chat-aside', 'An aside: a Critical that arrived in the quiet period (G-30, A1-45); change = Why? opens it in place', async h => {
    await emitted(h); await run(h, 'exceed', 'review', 'advance', 'review');
    const w = await h.ev(() => [...document.querySelectorAll('.transcript .bsd-card')].map(n => n.getAttribute('data-weight') + ':' + n.getAttribute('data-state')));
    if (!w.includes('aside:aside')) throw new Error('expected an aside line, got ' + w.join(','));
    await tokens(h, { eye: 'delivered', details: 'delivered', notes: 2 });
  }, { canon: ['Concern', 'Critical'], change: async h => { await h.clickVisible('.transcript .pmx-note[data-state="aside"] [data-action="bsd-open-finding"][data-in-place]'); await h.page.mouse.move(4, 4); } }),
  chat('bsd:chat-dismissed', 'A dismissed note: one line "Dismissed · title"', async h => {
    await emitted(h);
    const f = await h.ev(() => { const a = window.PM56_BSD.snapshot(); const x = a.findings.find(f => f.status === 'emitted'); return { id: x.id, epoch: String(a.epoch) }; });
    await bsdAct(h, 'bsd-dismiss', f); await h.wait(500);
    const t = await h.ev(() => (document.querySelector('.transcript .pmx-note[data-state="dismissed"]') || {}).textContent || '');
    if (!/^Dismissed · /.test(t)) throw new Error('expected "Dismissed · title", got ' + t);
  }, { canon: [] }),
  chat('bsd:chat-earlier', 'A note from an earlier advisor session: "From earlier in this chat"', async h => {
    await emitted(h); await run(h, 'compact');
    await tokens(h, { eye: CATCHING, row: CATCHING, details: CATCHING, notes: 1 });
    /* review cycle 1: the earlier note keeps its full form (title, words, Why?) and no Dismiss */
    const n = await h.ev(() => { const x = document.querySelector('.transcript .pmx-note[data-state="earlier"]'); return x ? { fine: (x.querySelector('.pmx-fine') || {}).textContent || '', title: !!x.querySelector('.pmx-note-title'), dismiss: !!x.querySelector('[data-action="bsd-dismiss"]') } : null; });
    if (!n || !/^From earlier in this chat/.test(n.fine) || !n.title || n.dismiss) throw new Error('expected the full earlier note without Dismiss, got ' + JSON.stringify(n));
  }, { canon: ['Concern'] }),
  chat('bsd:chat-catchup', 'The catch-up line with its ring and Don’t wait (held still)', async h => {
    await emitted(h); await run(h, 'frozen', 'review'); await op(h, 'catchup'); await h.wait(300); await h.ev(() => window.PM56_BSD_DEMOS.still());
    const t = await h.ev(() => (document.querySelector('.transcript .pmx-note[data-state="catchup"]') || {}).textContent || '');
    if (!/Holding a moment for your advisor/.test(t) || !/Don’t wait/.test(t)) throw new Error('expected the catch-up line, got ' + t);
    await tokens(h, { eye: CATCHING, row: CATCHING, details: CATCHING });
  }),
  chat('bsd:chat-stale', 'A stale critical: the assistant finished before it was re-checked (BSD-05)', async h => {
    await emitted(h); await run(h, 'exceed', 'review', 'measure', 'finish');
    await h.ev(() => { const B = window.PM56_BSD, c = window.PM56_EXT.ctx(), b = document.createElement('button'); b.dataset.thread = c.thread.id; b.dataset.op = 'catchup'; window.PM56_EXT._actions['bsd12-work'](c, b); window.PM56_BSD_DEMOS.still(); const a = B.snapshot(), clock = B.engine.clock; B.engine.clock = () => Date.now() + 3600000; B.engine.endCatchup(c.thread.id, a.epoch, false); B.engine.clock = clock; B.refresh(); });
    await h.wait(600);
    const t = await h.ev(() => (document.querySelector('.transcript .pmx-note[data-state="stale"]') || {}).textContent || '');
    if (!/About an earlier version \(v\d+\): not re-checked/.test(t)) throw new Error('expected the stale critical, got ' + t);
  }, { canon: ['Concern', 'Critical'] }),
  chat('bsd:chat-failure', 'Three checks that took too long: one quiet line, ×3', async h => {
    await emitted(h); for (let i = 0; i < 3; i++) { await fault(h, 'timed_out'); await run(h, 'advance', 'review'); }
    const t = await h.ev(() => (document.querySelector('.transcript .pmx-note[data-line="failure"]') || {}).textContent || '');
    if (!/couldn’t check this step/.test(t) || !/×3/.test(t)) throw new Error('expected one failure line with ×3, got ' + t);
    await tokens(h, { eye: FAILED, row: FAILED, details: FAILED });
  }),
  chat('bsd:chat-safety', 'Paused for safety after two unusable answers: Resume · Change model', async h => {
    await emitted(h); for (let i = 0; i < 2; i++) { await fault(h, 'unsafe'); await run(h, 'advance', 'review'); }
    await tokens(h, { eye: FAILED, row: FAILED, details: FAILED });
  }, { canon: [] }),
  chat('bsd:chat-held', 'A finding held: nothing in the chat (BSD-04); the Context row and Details say Double-checking 1 thing', async h => {
    await example(h, 'survives'); await run(h, 'start');
    await tokens(h, { eye: 'caughtUp', row: 'held', details: 'held', notes: 0 });
  }, { canon: [] }),
  chat('bsd:chat-resolves', 'Resolved before it reached you: nothing in the chat; Off hides the eye', async h => {
    await example(h, 'resolves'); await run(h, 'start', 'measure', 'review');
    await tokens(h, { eye: 'caughtUp', row: 'caughtUp', details: 'caughtUp', notes: 0 });
    await bsdAct(h, 'bsd-set-mode', { value: 'off' }); await h.wait(300);
    await tokens(h, { eye: null, row: 'off', details: 'off' });
    await bsdAct(h, 'bsd-set-mode', { value: 'auto' }); await h.wait(300);
  }, { canon: [] }),
  chat('bsd:details', 'Context More Details: Advisor notes, Session, Usage, a note’s Why? open (G-26)', async h => {
    await emitted(h);
    const f = await h.ev(() => window.PM56_BSD.snapshot().findings[0].id);
    await bsdAct(h, 'bsd-open-finding', { id: f }); await h.wait(500);
  }, {
    roots: '#ctx-bsd', layouts: ['pinned'], canon: ['Back Seat Driver', 'Concern'],
    async open(h) { await h.closeAll(); await neutral(h); await h.ev(() => { const c = window.PM56_EXT.ctx(); c.state.context.details = true; c.state.context.drawerView = 'curated'; c.renderApp(); for (const d of document.querySelectorAll('#ctx-bsd details.pmx-bsd-disc')) d.open = true; document.getElementById('ctx-bsd').scrollIntoView({ block: 'start' }); }); await h.settle(); },
    async after(h) { await h.ev(() => { const c = window.PM56_EXT.ctx(); c.state.context.details = false; c.renderApp(); }); await h.closeAll(); await neutral(h); }
  }),
  { id: 'bsd:raw-usage', title: 'Advisor usage sheet (bsd-usage, compact)', kind: 'sheet', tags: ['app', 'bsd'], common: true, canon: [], ledgerWays: ['escape', 'scrim', 'close'],
    async setup(h) { await emitted(h); },
    async open(h) { await h.closeAll(); await neutral(h); await bsdAct(h, 'bsd-open-usage'); await h.wait(300); await h.settle(); },
    async edit(h) { await h.clickVisible('#pmOverlayRoot .pmx-bsd-raw > summary'); await h.page.mouse.move(4, 4); return ['opened Show raw data']; },
    async after(h) { await h.closeAll(); await neutral(h); } },
  { id: 'bsd:raw-transcript', title: 'Advisor transcript sheet (bsd-transcript, compact; the list scrolls inside)', kind: 'sheet', tags: ['app', 'bsd'], common: false, canon: [], ledgerWays: ['escape', 'scrim', 'close'],
    async setup(h) { await emitted(h); },
    async open(h) { await h.closeAll(); await neutral(h); await bsdAct(h, 'bsd-open-transcript'); await h.wait(300); await h.settle(); },
    async edit(h) { await h.clickVisible('#pmOverlayRoot .pmx-bsd-tx > summary'); await h.page.mouse.move(4, 4); return ['opened one check']; },
    async after(h) { await h.closeAll(); await neutral(h); } },
  /* review cycle 1: the raw JSON open (not the common state, so the sheet body may scroll: one scroller, the pre is not
     one); J-2 room under the open block before the next hairline */
  ...[['bsd:raw-usage-open', 'bsd-open-usage', '.pmx-bsd-raw > summary', 'Advisor usage sheet with Show raw data open'],
    ['bsd:raw-transcript-open', 'bsd-open-transcript', '.pmx-bsd-tx > summary', 'Advisor transcript sheet with one check open']].map(([id, act, sum, title]) => ({
    id, title, kind: 'sheet', tags: ['app', 'bsd'], common: false, canon: [], ledger: false,
    async setup(h) { await emitted(h); },
    async open(h) { await h.closeAll(); await neutral(h); await bsdAct(h, act); await h.wait(300); await h.clickVisible('#pmOverlayRoot ' + sum); await h.page.mouse.move(4, 4); await h.wait(200); await h.settle(); },
    async after(h) { await h.closeAll(); await neutral(h); } })),
  { id: 'bsd:view-work', title: 'The recorded example’s workspace (G-26: The work, The advisor, Try a situation)', kind: 'view', tags: ['app', 'bsd', 'view'], canon: ['Back Seat Driver'],
    async setup(h) { await emitted(h); },
    async open(h) { await h.closeAll(); await h.ev(() => { const c = window.PM56_EXT.ctx(); c.openEditor('bsd12:' + c.thread.id); for (const d of document.querySelectorAll('.bsd12-work details')) d.open = true; }); await h.settle(); },
    async after(h) { await h.closeAll(); } }
];

export default () => [
  sheet('bsd:sheet-off', 'Back Seat Driver sheet, Off (8.6 G-37)', async h => { await click(h, '#pmOverlayRoot [data-action="bsd-config-mode"][data-value="off"]'); await h.page.mouse.move(4, 4); }, { change: MODE('auto') }),
  sheet('bsd:sheet-on', 'Back Seat Driver sheet, On (a cue after every step)', async h => { await click(h, '#pmOverlayRoot [data-action="bsd-config-mode"][data-value="on"]'); await h.page.mouse.move(4, 4); }, { change: MODE('off') }),
  sheet('bsd:sheet-frequent', 'Back Seat Driver sheet, Auto + Frequent (the drift cue)', async h => { await pickChoice(h, 'sensitivity', 'frequent'); }),
  sheet('bsd:sheet-advanced', 'Back Seat Driver Advanced page (Where it watches)', async h => { await click(h, '#pmOverlayRoot .pmx-sheet [data-action="pmx-advanced"][data-value="1"]'); await h.page.mouse.move(4, 4); },
    { canon: ['Back Seat Driver', ...STAGES], change: TIDY_STEP }),
  sheet('bsd:sheet-advanced-changed', 'Back Seat Driver Advanced page, two rows changed', async h => {
    await click(h, '#pmOverlayRoot .pmx-sheet [data-action="pmx-advanced"][data-value="1"]');
    for (const [stage, value] of [['worknode_execution', 'on'], ['certification', 'off']]) {
      await click(h, `#pmOverlayRoot .pmx-sheet [data-action="bsd-stage-choice"][data-stage="${stage}"]`);
      await click(h, `.overlay-menu [data-action="shared-choice-pick"][data-value="${value}"]`);
    }
    await h.page.mouse.move(4, 4);
    await footWhole(h, /Writing code is On and Final sign-off is Off\./);
  }, { canon: ['Back Seat Driver', ...STAGES], change: async h => { await h.clickVisible('#pmOverlayRoot .pmx-sheet [data-action="bsd-stage-reset"]'); } }),
  sheet('bsd:sheet-standin', 'Back Seat Driver sheet, the advisor model unavailable (G-30 BSD-09)', async h => {
    await click(h, '#pmOverlayRoot .pmx-sheet [data-action="bsd-pick-model"]');
    await h.ev(() => { const r = document.querySelector('.overlay-menu [data-action="set-model"][data-value="opus5-personal"]'); if (!r) throw new Error('no opus5-personal row'); r.click(); });
    await h.page.keyboard.press('Escape'); await h.wait(300); await h.settle(); await h.page.mouse.move(4, 4);
    const route = await h.ev(() => (document.querySelector('#pmOverlayRoot .pmx-bsd-route') || {}).textContent || '');
    if (!/Nothing can stand in/.test(route)) throw new Error('expected the no-substitute sentence, got: ' + route);
    /* the read-back agrees with it: the advisor won't run, it never "checks at key moments" */
    await footWhole(h, /It won’t run until .+ is available or you pick another model\./);
  }, { common: false }),
  sheet('bsd:sheet-refused', 'Back Seat Driver sheet, a partial Save refused (IMPACT A1-37)', async h => {
    /* the mode changes in the sheet (to whichever of On / Auto is not committed: an earlier theme's run saved its mode);
       then someone else changes the policy, so the second dispatch is refused */
    const to = await h.ev(() => window.PM56_BSD.view().mode === 'on' ? 'auto' : 'on');
    await click(h, `#pmOverlayRoot [data-action="bsd-config-mode"][data-value="${to}"]`);
    await h.ev(() => {
      const B = window.PM56_BSD, v = B.view(), K = window.PM56_BSD_ENGINE;
      const orig = B.engine.configure.bind(B.engine); let n = 0;
      /* after the sheet's first dispatch lands, a concurrent writer bumps the revision once */
      B.engine.configure = function (req) { const r = orig(req); if (++n === 1 && r.ok) { const p = B.engine.policy(v.projectId); p.sensitivity = 'frequent'; orig({ projectId: v.projectId, threadId: v.thread.id, expectedRevision: p.revision, values: p, identity: B.identity(p) }); B.engine.configure = orig; } return r; };
      void K;
    });
    await click(h, '#pmOverlayRoot .pmx-sheet .pmx-primary');
    await h.page.mouse.move(4, 4);
    const r = await h.ev(() => ({ refusal: (document.querySelector('#pmOverlayRoot .pmx-refusal') || {}).textContent || '', save: window.PM56_BSD.lastSave() }));
    if (!/Mode saved; the rest didn/.test(r.refusal)) throw new Error('expected the partial refusal, got: ' + JSON.stringify(r));
  }, { ledger: false, change: MODE('auto') }),
  sheet('bsd:sheet-refresh', 'Back Seat Driver sheet over an active advisor (Save and refresh advisor)', null, {
    ledger: false,
    async open(h) {
      await h.closeAll();
      await h.action('bsd12-start', { flow: 'survives' }); await h.wait(700);
      await h.ev(() => { const id = window.PM56_EXT.ctx().thread.id; const b = document.createElement('button'); b.dataset.thread = id; b.dataset.op = 'start'; window.PM56_EXT._actions['bsd12-work'](window.PM56_EXT.ctx(), b); });
      await h.wait(900);
      await openSheet(h); await h.settle();
      const label = await h.ev(() => (document.querySelector('#pmOverlayRoot .pmx-sheet .pmx-primary') || {}).textContent || '');
      if (!/Save and refresh advisor/.test(label)) throw new Error('expected "Save and refresh advisor", got ' + label);
      await footWhole(h, /after a warning\.$/);
    }
  })
  ,...CHAT
];
