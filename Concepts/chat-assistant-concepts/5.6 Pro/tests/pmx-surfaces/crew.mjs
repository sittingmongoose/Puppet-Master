/* CREW surfaces for tests/pmx-verify.mjs (package CREW, half A: DESIGN-SPEC 8.1, 8.2, 7; crew-protocol.js).
   wand.mjs opens the Crew and Crew Auto sheets in their default states and the delegation demo; collab.mjs covers
   the shared frame's Crew states. These are the Crew's own:
   - Crew Auto refusing a team over its cap (IMPACT A1-32): five helpers, "Save Crew Auto rules" (Crew Auto is on by
     default, owner answer E-02), the refusal names
     the cap and the row that pushes the team over it turns warm;
   - the recorded example's Crew sheet (the delegation demo's configure step: a recorded draft, "Recorded
     example · no AI cost", specialists disabled with "This recorded example uses its own team.");
   - the Crew Auto receipt (IMPACT A4-03), which exists only after the rules are saved;
   - the Crew card at starting, live, result and receipt (COLLAB's card frame composing PM56_CREW.cardParts on a
     real run of the recorded example; the live and result states are reached through the protocol's own claim /
     deliver / finalize, the calls the demo makes, deterministically and without its timer), with the parent
     summary's recorded tick under the finished card (IMPACT A1-46);
   - the Coordinator-failure face (IMPACT A1-28/A1-34) of the seed Crew whose Coordinator failed, shown alone on the
     'plain' thread through the ordinary collab-run transcript item and expanded (in its own thread newer live runs
     collapse it, 7.8), and the same card after Retry: the waiting face, "not started" in the clock slot (7.6/7.7).
     The Retry surface puts the seed run back as it was afterwards, so the order of surfaces never matters.
   `canon` (A2-27a): the principle-10 names each state shows. */
const SHEET = '#pmOverlayRoot .pmx-sheet';
const S360 = n => ({ name: n, minCard: 360 });
async function click(h, sel) { if (!(await h.clickVisible(sel))) throw new Error('not found: ' + sel); await h.wait(250); await h.settle(); }

/* ------------------------------------------------------------------ node side */
/* the recorded example's run, admitted through its own sheet, then moved to `stage` by the protocol calls the demo
   makes (claim, deliver, finalize), deterministically and without its timer */
async function recordedRun(h, stage) {
  await h.closeAll();
  await h.demo('crew-demo-start', 'delegation');
  await click(h, `${SHEET} [data-action="collab-modal-commit"]`);
  return h.ev(stage => {
    const W = window.PM56_CREW, C = window.PM56_COLLAB;
    const r = C.runs().filter(r => W.owns(r.id)).at(-1);
    const env = () => ({ epoch: r.stopEpoch, sourceHash: r.crew.input.sourceHash });
    const claim = id => W.claim(r.id, id, env()), deliver = id => W.deliver(r.id, id, W.payload(r.id, id));
    const steps = { starting: [], live: [() => claim('normalize'), () => claim('quoting'), () => deliver('normalize')],
      result: [() => claim('normalize'), () => claim('quoting'), () => deliver('normalize'), () => deliver('quoting'), () => claim('export'), () => deliver('export'), () => W.finalize(r.id, env())] }[stage] || [];
    const out = steps.map(f => f());
    const bad = out.find(x => !x.ok); if (bad) throw new Error('protocol step refused: ' + bad.error);
    return r.id;
  }, stage);
}
/* one collaboration run alone on the 'plain' thread, through the ordinary collab-run transcript item */
async function showAlone(h, runId) {
  await h.ev(runId => {
    const c = window.PM56_EXT.ctx(); c.state.dialog = null; c.state.menu = null;
    const t = c.state.threads.find(x => x.id === 'plain');
    t.messages = [{ id: 'crewa-u', type: 'text', role: 'user', body: 'Extract the report renderer into its own module, with tests.' }, { id: 'crewa-run:' + runId, type: 'collab-run', role: 'assistant', runId }];
    if (c.state.selectedThread !== 'plain') c.switchThread('plain'); else c.renderApp();
    const tr = document.querySelector('.transcript'); if (tr) { tr.style.scrollBehavior = 'auto'; tr.scrollTop = 0; }
  }, runId);
  await h.settle();
}
const rerender = async h => { await h.ev(() => window.PM56_EXT.ctx().renderApp()); };

function cardSurface(id, title, stage, o = {}) {
  return {
    id, title, kind: 'chat', tags: ['app', 'crew', 'card'], canon: o.canon || [S360('Crew'), S360('Open Panel')],
    async open(h, where) {
      if (o.seed) {
        /* a checker may open this surface again without after() (reduced census: close and open again), so a
           retried seed is put back first */
        if (o.retry) await restoreSeed(h);
        await h.closeAll();
        const rid = await h.ev(() => window.PM56_COLLAB.runs().find(r => /extract the report renderer/.test(r.title || '')).id);
        await showAlone(h, rid);
        /* the full face: Expand (G-19), as a reader does with a collapsed needs-you card */
        await h.ev(id => document.querySelector('.transcript [data-action="collab-toggle-expand"][data-run="' + id + '"][aria-expanded="false"]')?.click(), rid); await h.settle();
        if (o.retry) {
          seedSnap = await h.ev(id => { const r = window.PM56_COLLAB.run(id); window.__crewaSeed = { id, run: JSON.parse(JSON.stringify(r)) }; return id; }, rid);
          await click(h, `.transcript [data-action="crew-retry"][data-run="${rid}"]`);
        }
        await h.page.mouse.move(4, 4); await h.settle();
        return;
      }
      const runId = await recordedRun(h, stage);
      /* the demo resets the layout (history closed, Activity shut): put back the one the lint asked for */
      if (where && where.layout) await h.chatLayout(where.layout);
      /* the receipt: Expand, then Collapse (G-19: open -> closed gives a finished run its receipt) */
      if (o.receipt) for (let i = 0; i < 2; i++) await h.ev(id => { const b = document.querySelector('.transcript [data-action="collab-toggle-expand"][data-run="' + id + '"]'); if (b) b.click(); }, runId);
      await h.page.mouse.move(4, 4); await h.settle();
      await h.ev(() => { const t = document.querySelector('.transcript'); if (t) { t.style.scrollBehavior = 'auto'; t.scrollTop = 0; } });
    },
    tick: o.tick,
    change: o.change,
    async after(h) {
      /* put the seed run back as it was before Retry (the same object, its own properties) */
      if (o.retry) await restoreSeed(h);
      await h.closeAll();
    }
  };
}
let seedSnap = null;
async function restoreSeed(h) {
  if (!seedSnap) return;
  await h.ev(() => { const s = window.__crewaSeed, r = s && window.PM56_COLLAB.run(s.id); if (!r) return; Object.keys(r).forEach(k => { if (!(k in s.run)) delete r[k]; }); Object.assign(r, JSON.parse(JSON.stringify(s.run))); window.__crewaSeed = null; window.PM56_EXT.ctx().renderApp(); });
  seedSnap = null;
}

export default () => [
  {
    id: 'crew:auto-over-cap', title: 'Crew Auto refusing a team over its cap: five helpers (IMPACT A1-32)', kind: 'sheet', tags: ['app', 'crew'], common: false, canon: ['Crew Auto'], ledger: false,
    rosterScrollAfterYield: ['1280x800'],
    async open(h) {
      await h.closeAll(); await h.action('collab-open-configure', { kind: 'crew', auto: '1' }); await h.wait(400); await h.settle();
      for (let i = 0; i < 2; i++) await click(h, `${SHEET} [data-action="collab-modal-add-participant"]`);
      await click(h, `${SHEET} [data-action="collab-modal-commit"]`); await h.page.mouse.move(4, 4);
    },
    change: async h => { await h.clickVisible(`${SHEET} [data-action="pmx-step"][data-delta="1"]`); },
    async after(h) { await h.closeAll(); }
  },
  {
    id: 'crew:recorded-sheet', title: 'The recorded example’s Crew sheet (a recorded draft: no AI cost, its own team)', kind: 'sheet', tags: ['app', 'crew'], canon: ['Crew', 'Wonderer', 'Grill Me'], ledger: false,
    /* a 6.3 common case (three helpers, no specialists): the recorded example's guide stays out of the sheet, so the
       plate keeps its labelled mode and the side column fits at 1440x900 and 1280x800 (no-scroll guards it) */
    common: true,
    async open(h) { await h.closeAll(); await h.demo('crew-demo-start', 'delegation'); await h.settle(); await h.page.mouse.move(4, 4); },
    change: async h => { await h.clickVisible(`${SHEET} [data-action="pmx-step"][data-delta="-1"]`); },
    async after(h) { await h.closeAll(); }
  },
  {
    id: 'crew:auto-receipt', title: 'The Crew Auto receipt, after the Crew Auto rules are saved (IMPACT A4-03)', kind: 'chat', tags: ['app', 'crew'], canon: [],
    async open(h) {
      await h.closeAll(); await h.selectThread('plain');
      await h.ev(() => { const c = window.PM56_EXT.ctx(), t = c.state.threads.find(x => x.id === 'plain'); t.messages = [{ id: 'crewa-u2', type: 'text', role: 'user', body: 'Use a Crew only when a job really splits into parts.' }]; c.renderApp(); });
      await h.action('collab-open-configure', { kind: 'crew', auto: '1' }); await h.wait(400); await h.settle();
      await click(h, `${SHEET} [data-action="collab-modal-commit"]`); await h.wait(400); await h.settle();
      if (!(await h.ev(() => !!document.querySelector('.transcript .crew-auto-receipt')))) throw new Error('no Crew Auto receipt after commit');
    },
    tick: rerender, change: rerender,
    async after(h) { await h.closeAll(); }
  },
  cardSurface('crew:card-starting', 'Crew card, starting (a recorded run before the Coordinator hands out a part)', 'starting'),
  cardSurface('crew:card-live', 'Crew card, live: two parts running, one checked, the last waits for both', 'live', {
    canon: [S360('Crew'), S360('Open Panel'), { name: 'Message', minCard: 260 }],
    /* one real protocol step: the second part is delivered and checked */
    change: async h => { await h.ev(() => { const W = window.PM56_CREW, r = window.PM56_COLLAB.runs().filter(r => W.owns(r.id)).at(-1); W.deliver(r.id, 'quoting', W.payload(r.id, 'quoting')); window.PM56_EXT.ctx().renderApp(); }); }
  }),
  cardSurface('crew:card-result', 'Crew card, finished: the checked export, who did what', 'result'),
  cardSurface('crew:card-receipt', 'Crew receipt: the finished run, collapsed to its one line', 'result', { receipt: true, canon: [S360('Crew')] }),
  cardSurface('crew:card-coordfail', 'Crew card, the Coordinator failed: Needs attention, with Retry · Pick a new Coordinator · Cancel Crew… (7.6, IMPACT A1-28, A1-34)', null, { seed: true, canon: [S360('Crew'), S360('Open Panel')] }),
  cardSurface('crew:card-retry-waiting', 'Crew card after Retry: the second try waits (waiting face, "not started" in the clock slot)', null, { seed: true, retry: true, canon: [S360('Crew'), S360('Open Panel')] })
];
