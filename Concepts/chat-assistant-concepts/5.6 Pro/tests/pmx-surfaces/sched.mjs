/* SCHED package surfaces for tests/pmx-verify.mjs (DESIGN-SPEC 8.7, 8.8; 10.4).
   The Schedule Message sheet in the states a reader meets (a real message in the box, "Skip it if..." with its
   minutes, a refused Schedule, the confirmation after a commit) and the Build At sheet (nightly, one time, the
   confirmation), opened through the real controls: the wand row, and PM56_SCHED.openBuildAt, which the Plan card's
   More > Build At... calls. The wand's plain Schedule Message entry stays in wand.mjs.
   Step 2 adds the Scheduled manager (8.9: each tab, a focused record, a build slot that needs an update) and the
   in-chat presences (8.7 "In chat", 7.14): the future bubble, Held (and missed) decision bubbles, the four one-line
   receipts, a bubble's Details, and the "Coming up" dock line. sched:chat-states is the six-state check of IMPACT
   A1-26: every .sched-card-{state} begins its visible sentence with its canon word. */
const MESSAGE = 'Summarise the benchmark results in benchmarks/2026-09-27.md: which queries got slower, by how much, and the likely cause.';

async function prefill(h) {
  await h.closeAll();
  await h.selectThread('query');
  const box = await h.page.$('textarea[data-input="composer"]');
  if (box) { await box.fill(MESSAGE); await h.wait(120); }
}
async function openMessage(h) {
  await prefill(h);
  const ok = await h.wandDialog('schedule', '[data-action="sched-open-message"]');
  if (!ok) throw new Error('wand row not found: sched-open-message');
  await h.settle();
}
async function pick(h, family, value) {
  await h.clickVisible(`[data-action="sched-pick-${family}"]`); await h.wait(320);
  await h.clickVisible(`.overlay-menu [data-action="shared-choice-pick"][data-value="${value}"]`); await h.wait(320);
  await h.settle();
}
async function openBuild(h, kind) {
  await h.closeAll();
  const r = await h.ev(() => {
    const c = window.PM56_EXT.ctx(), all = Object.values(window.PM56_PLANS.all()), p = all.find(x => x.plan_id === 'ap-index' && x.status === 'ready') || all.find(x => x.status === 'ready');
    if (!p) return 'no ready plan';
    window.PM56_SCHED.openBuildAt(c, p.plan_id, p.version); return 'ok';
  });
  if (r !== 'ok') throw new Error('Build At: ' + r);
  await h.wait(300);
  if (kind === 'once') { await h.clickVisible('[data-action="sched-set-build-kind"][data-value="one_time"]'); await h.wait(250); }
  await h.settle();
}
const sheet = (id, title, open, extra) => Object.assign({ id, title, kind: 'sheet', tags: ['app', 'sched'], common: true, canon: [], open, async after(h) { await h.closeAll(); } }, extra || {});

/* ------------------------------------------------------------------ the Scheduled manager (8.9) */
const TABS = ['Scheduled Messages', 'Execution & Build Windows', 'Resume & Safety Policy', 'Events & Automation'];
async function openManager(h, tab) {
  const ok = await h.wandDialog('schedule', '[data-action="sched-open-manage"]');
  if (!ok) throw new Error('wand row not found: sched-open-manage');
  /* the requested tab is always clicked (the manager opens on Scheduled Messages, but a surface never relies on it) */
  if (tab) {
    if (!(await h.clickVisible(`.sched-tabs [data-action="sched-manage-tab"][data-tab="${tab}"]`))) throw new Error('manager tab not found: ' + tab);
    await h.wait(300);
    const on = await h.ev(() => (document.querySelector('.sched-tabs [data-action="sched-manage-tab"][aria-selected="true"]') || {}).dataset?.tab);
    if (on !== tab) throw new Error('manager tab ' + tab + ' did not open (on: ' + on + ')');
  }
  await h.settle();
}
const manager = (id, title, open, extra) => sheet(id, title, open, Object.assign({ tags: ['app', 'sched', 'manager'], canon: TABS, ledger: false }, extra || {}));

/* ------------------------------------------------------------------ in chat (8.7 "In chat", 7.14) */
const CANON_WORD = { scheduled: 'Scheduled', held: 'Held', sent: 'Sent', canceled: 'Canceled', failed: 'Failed', expired: 'Expired' };
async function scrollCard(h, sel, block) {
  await h.ev(([sel, block]) => { const e = document.querySelector('.transcript ' + sel); if (e) e.scrollIntoView({ block: block || 'center' }); }, [sel, block]);
  await h.wait(250);
}
/* the visible sentence of a card: the bubble's dateline or decision sentence, or the receipt's headline */
async function sentences(h) {
  return h.ev(() => [...document.querySelectorAll('.transcript .sched-card[data-schedule-state]')].map(el => {
    const say = el.querySelector('.pmx-bubble-say, .pmx-decision-say, .pmx-decision-sentence, .pmx-receipt-headline') || el;
    return { id: el.getAttribute('data-schedule-id'), state: el.getAttribute('data-schedule-state'), cls: el.className, family: (el.closest('[data-family]') || {}).dataset?.family || null, text: (say.innerText || '').trim() };
  }));
}
/* IMPACT A1-26 and 7.14: the canon word leads, the class and the state agree, and the family is the owner's answer */
function checkStates(rows, want) {
  const bad = [];
  for (const r of rows) {
    const word = CANON_WORD[r.state];
    if (!word) { bad.push(r.id + ': unknown state ' + r.state); continue; }
    if (!r.cls.split(/\s+/).includes('sched-card-' + r.state)) bad.push(r.id + ': class ' + r.cls);
    if (!new RegExp('^' + word + '\\b').test(r.text)) bad.push(r.id + ': "' + r.text.slice(0, 60) + '" does not begin with ' + word);
    const fam = r.state === 'scheduled' || r.state === 'held' ? 'time' : 'ledger';
    if (r.family !== fam) bad.push(r.id + ': family ' + r.family + ', want ' + fam);
  }
  for (const st of want) if (!rows.some(r => r.state === st)) bad.push('no ' + st + ' card');
  return bad;
}
const chat = (id, title, thread, open, extra) => Object.assign({
  id, title, kind: 'chat', tags: ['app', 'sched', 'chat'], canon: [],
  async setup(h) { await h.closeAll(); await h.selectThread(thread); await h.settle(); },
  async open(h) { await h.closeAll(); await h.selectThread(thread); await open(h); await h.settle(); },
  async after(h) { await h.closeAll(); }
}, extra || {});

/* J-2 at the narrow cards (311 in the user's rule, 234 for the narrow pane): a receipt never cuts its canon word or its
   time (only Canceled's quote may end in an ellipsis), a Failed / Expired reason is read whole (it wraps), and
   Held's reason is never clamped. The column is narrowed by a style rule (a re-render keeps it; an inline style would
   be patched away). */
async function narrowCheck(h, width) {
  await h.ev(w => { let st = document.getElementById('sched-narrow-probe'); if (!st) { st = document.createElement('style'); st.id = 'sched-narrow-probe'; document.head.appendChild(st); }
    st.textContent = '.transcript-inner{width:' + w + 'px !important;max-width:' + w + 'px !important;margin-left:auto !important;margin-right:auto !important;}'; }, width);
  await h.wait(350);
  const bad = await h.ev(w => {
    const out = [];
    for (const el of document.querySelectorAll('.transcript .sched-card[data-schedule-state]')) {
      const st = el.dataset.scheduleState, box = el.getBoundingClientRect();
      if (box.width > w + 1) out.push(st + ': card ' + Math.round(box.width) + ' px wide in a ' + w + ' px column');
      const hl = el.querySelector('.pmx-receipt-headline');
      if (hl) {
        const cs = getComputedStyle(hl), word = hl.querySelector('.pmx-sched-word');
        if (st !== 'canceled') {
          if (hl.scrollWidth > hl.clientWidth + 1) out.push(st + ': headline overflows (' + hl.scrollWidth + ' > ' + hl.clientWidth + ')');
          if (cs.textOverflow === 'ellipsis') out.push(st + ': headline ellipsizes');
          if (hl.scrollHeight > hl.clientHeight + 1) out.push(st + ': headline cut vertically');
        }
        const r = (word || hl).getBoundingClientRect(), say = el.querySelector('.pmx-receipt-say').getBoundingClientRect();
        if (r.right > say.right + 1 || r.bottom > box.bottom + 1) out.push(st + ': canon word outside its line');
        if (st === 'sent' && !/^Sent · \S.*\d(:\d\d)?\s?[AP]M$/.test(hl.innerText.replace(/\s+/g, ' ').trim())) out.push('sent: time not whole: "' + hl.innerText.slice(0, 60) + '"');
      }

      const dec = el.querySelector('.pmx-decision-say > span');
      if (dec && dec.scrollHeight > dec.clientHeight + 1) out.push('held: reason clamped (' + dec.scrollHeight + ' > ' + dec.clientHeight + ')');
    }
    return out;
  }, width);
  await h.ev(() => { const st = document.getElementById('sched-narrow-probe'); if (st) st.remove(); });
  await h.wait(200);
  return bad.map(b => width + ' px · ' + b);
}

export default () => [
  sheet('sched:message', 'Schedule Message sheet with a real message (8.7)', openMessage),
  /* change: five more minutes on the real grace input (reopening would replay the preserved dropdown's own motion,
     which is menus.js's, not the sheet's) */
  sheet('sched:message-skip', 'Schedule Message: "Skip it if it is more than 30 min late" and its minutes (8.7)', async h => { await openMessage(h); await pick(h, 'msg-missed', 'cancel_after_grace'); },
    { change: h => h.clickVisible('.pmx-sched-missrow [data-action="pmx-step"][data-delta="5"]') }),
  sheet('sched:message-refused', 'Schedule Message: Schedule refused for a time in the past (8.7, 9.3)', async h => {
    await openMessage(h);
    await h.page.fill('[data-sched-input="msg-date"]', '2020-01-06'); await h.page.press('[data-sched-input="msg-date"]', 'Tab'); await h.wait(200);
    await h.clickVisible('[data-action="sched-create-message"]'); await h.wait(300); await h.settle();
  }, { ledger: false }),
  sheet('sched:message-confirm', 'Schedule Message: the confirmation after a commit (8.7)', async h => {
    await openMessage(h); await h.clickVisible('[data-action="sched-create-message"]'); await h.wait(400); await h.settle();
  }, { ledger: false, canon: ['Scheduled'] }),
  sheet('sched:build-nightly', 'Build At sheet: nightly time slot (8.8)', h => openBuild(h, 'night')),
  sheet('sched:build-skip', 'Build At: "Skip it if..." with its real minutes input (8.8, IMPACT A1-42)', async h => { await openBuild(h, 'night'); await pick(h, 'build-missed', 'cancel_after_grace'); },
    { change: h => h.clickVisible('.pmx-sched-missrow [data-action="pmx-step"][data-delta="5"]') }),
  sheet('sched:build-once', 'Build At sheet: one time (8.8)', h => openBuild(h, 'once')),
  sheet('sched:build-crew', 'Build At: Who builds it = A Crew, before the Crew is set up (8.8)', async h => { await openBuild(h, 'night'); await pick(h, 'build-topology', 'crew'); },
    { change: h => h.clickVisible('[data-action="sched-toggle-day"][data-day="6"]') }),
  sheet('sched:build-confirm', 'Build At: the confirmation after a commit (8.8)', async h => {
    await openBuild(h, 'night'); await h.clickVisible('[data-action="sched-create-build"]'); await h.wait(400); await h.settle();
  }, { ledger: false }),

  manager('sched:manager-messages', 'Scheduled manager: Scheduled Messages, the agenda (8.9)', h => openManager(h, 'messages'),
    { change: async h => { await h.page.fill('[data-sched-input="manager-query"]', 'tenant'); await h.page.press('[data-sched-input="manager-query"]', 'Tab'); await h.wait(250); } }),
  manager('sched:manager-focused', 'Scheduled manager: one record focused beside the agenda (8.9)', async h => {
    await openManager(h, 'messages');
    if (!(await h.clickVisible('[data-schedule-id="sm-nightly-digest"] [data-action="sched-focus-record"]'))) throw new Error('sched-focus-record not found for sm-nightly-digest');
    await h.wait(350); await h.settle();
  }),
  manager('sched:manager-builds', 'Scheduled manager: Execution & Build Windows (8.9)', h => openManager(h, 'builds')),
  manager('sched:manager-builds-update', 'Scheduled manager: a build slot whose plan changed (Needs update, Use V6) (8.9, G-30)', async h => {
    await h.closeAll(); await h.selectThread('query');
    await h.ev(() => { if (window.PM56_PLANS.get('ap-index').version === 5) window.PM56_PLANS.revise('ap-index', 'Also cover the p50 path in the fixture.'); });
    await openManager(h, 'builds');
  }, { async after(h) { await h.closeAll(); await h.ev(() => { window.PM56_SCHED.restore(); }); } }),
  manager('sched:manager-safety', 'Scheduled manager: Resume & Safety Policy, paused by you (8.9, IMPACT A1-44)', async h => {
    /* latched through PM56_SCHED (the demo action also raises the app's toast, whose motion is not this sheet's) */
    await openManager(h, 'quota'); await h.ev(() => { window.PM56_SCHED.latchStop('Paused from the Scheduled manager.'); window.PM56_EXT.ctx().renderOverlays(); }); await h.wait(300); await h.settle();
    /* A1-30 / 8.8: with Pause all automations on, the Plan card's schedule line leads with Paused, never "next: …" */
    const line = await h.ev(() => { const d = document.createElement('div'); d.innerHTML = window.PM56_SCHED.planSummary('ap-index'); return (d.querySelector('.plan-sched-say') || d).textContent.trim(); });
    if (!/^Paused · Pause all automations is on/.test(line)) throw new Error('Plan schedule line while paused: "' + line + '"');
  }, { async after(h) { await h.ev(() => { window.PM56_SCHED.restore(); }); await h.closeAll(); } }),
  manager('sched:manager-events', 'Scheduled manager: Events & Automation as sentences (8.9)', h => openManager(h, 'events')),

  chat('sched:chat-scheduled', 'In chat: the future bubble and a Sent receipt (8.7)', 'query', h => scrollCard(h, '.sched-card-scheduled'), {
    change: h => h.clickVisible('.transcript .sched-card-scheduled [data-action="sched-card-details"]'),
    async after(h) { await h.ev(() => { const b = document.querySelector('.transcript .sched-card-scheduled [data-action="sched-card-details"][aria-expanded="true"]'); if (b) b.click(); }); await h.closeAll(); }
  }),
  chat('sched:chat-details', 'In chat: a bubble with its Details open (8.7 G-21)', 'query', async h => {
    await h.ev(() => { const b = document.querySelector('.transcript .sched-card-scheduled [data-action="sched-card-details"][aria-expanded="false"]'); if (b) b.click(); });
    await h.wait(300); await scrollCard(h, '.sched-card-scheduled', 'start');
  }, { async after(h) { await h.ev(() => { const b = document.querySelector('.transcript .sched-card-scheduled [data-action="sched-card-details"][aria-expanded="true"]'); if (b) b.click(); }); await h.closeAll(); } }),
  chat('sched:chat-states', 'In chat: Held, Failed, Canceled and Expired, each led by its canon word (IMPACT A1-26, 7.14)', 'recovery-scheduling', async h => {
    await scrollCard(h, '.sched-card-held', 'start');
  }, {
    async setup(h) {
      await h.closeAll();
      const rows = [];
      for (const t of ['query', 'recovery-scheduling']) { await h.selectThread(t); await h.settle(); rows.push(...await sentences(h)); }
      const bad = checkStates(rows, Object.keys(CANON_WORD));
      if (bad.length) throw new Error('six-state check (A1-26): ' + bad.join('; '));
    }
  }),
  chat('sched:chat-narrow', 'In chat at 311 and 234 px: receipts keep the canon word and time, reasons are whole (J-2, 8.7)', 'recovery-scheduling', async h => {
    await scrollCard(h, '.sched-card-failed', 'center');
  }, {
    async setup(h) {
      await h.closeAll();
      const bad = [];
      for (const t of ['query', 'recovery-scheduling']) { await h.selectThread(t); await h.settle(); for (const w of [311, 234]) bad.push(...(await narrowCheck(h, w))); }
      if (bad.length) throw new Error('narrow receipts: ' + bad.join('; '));
    }
  }),
  chat('sched:chat-missed', 'In chat: Held after a missed time (Send now, Reschedule, Cancel) (8.7 G-30)', 'query', h => scrollCard(h, '.sched-card-held'), {
    /* a message scheduled through the real sheet (an exact copy, "Ask me first" by default), then delivered an hour
       past its grace: the owner holds it as missed (the seed's own message predates exact copies and would be held
       for that reason instead) */
    async setup(h) {
      await openMessage(h);
      await h.clickVisible('[data-action="sched-create-message"]'); await h.wait(400);
      await h.closeAll(); await h.selectThread('query');
      const r = await h.ev(() => { const S = window.PM56_SCHED, m = S.list().messages.filter(x => x.thread_id === 'query' && x.binding_kind === 'scheduled_message_v2').at(-1);
        if (!m) return { err: 'no committed message' };
        S.dispatchMessageAt(m.scheduled_dispatch_id, Date.parse(m.scheduled_at_utc) + (m.grace_seconds + 3600) * 1000); window.PM56_EXT.ctx().renderApp();
        const n = S.list().messages.find(x => x.scheduled_dispatch_id === m.scheduled_dispatch_id);
        return { st: n.state, say: (document.querySelector('.transcript .sched-card-held[data-schedule-id="' + m.scheduled_dispatch_id + '"]') || {}).innerText || '' }; });
      if (r.err) throw new Error(r.err);
      if (r.st !== 'held' || !/missed at/.test(r.say)) throw new Error('expected a Held "missed at" bubble, got ' + r.st + ': ' + String(r.say).slice(0, 120));
      await h.settle();
    },
    async after(h) { await h.closeAll(); }
  }),
  chat('sched:chat-dock', 'In chat: the "Coming up" dock line while the bubble is out of view (8.7, 7.8)', 'query', async h => {
    /* the reader scrolls up with the wheel (a programmatic scrollTop is not a reader's scroll: the transcript
       keeps following the bottom), then the bubble has been out of view for the dock's 400 ms */
    let lines = [];
    for (let i = 0; i < 3 && !lines.some(l => /Coming up/.test(l)); i++) {
      const box = await h.ev(() => { const t = document.querySelector('.transcript'); if (!t) return null; const r = t.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
      if (box) { await h.page.mouse.move(box.x, box.y); for (let k = 0; k < 6; k++) { await h.page.mouse.wheel(0, -900); await h.wait(60); } }
      await h.wait(1200);
      lines = await h.ev(() => [...document.querySelectorAll('.pmx-sched-dock')].map(e => e.innerText));
    }
    if (!lines.some(l => /Coming up/.test(l))) throw new Error('no Coming up dock line: ' + JSON.stringify(lines) + ' ' + JSON.stringify(await h.ev(() => { const t = document.querySelector('.transcript'), b = document.querySelector('.transcript .sched-card-scheduled'); return { theme: document.body.dataset.theme, w: innerWidth, st: t && t.scrollTop, sh: t && t.scrollHeight, ch: t && t.clientHeight, b: b && Math.round(b.getBoundingClientRect().top), st2: window.PM56_SCHED.list().messages.map(m => m.state).join(',') }; })));
  })
];
