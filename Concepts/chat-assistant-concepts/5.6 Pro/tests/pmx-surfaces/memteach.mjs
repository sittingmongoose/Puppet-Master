/* MEMTEACH surfaces (DESIGN-SPEC 8.10 Memory, 8.11 Teach): the states the wand entries alone never reach.
   Memory: the sheet in its demo states (a verified note, a note out of date, a suggested change to a locked rule,
   the rules tab with an inline Turn off, the next-message list), the Gist Review document, and the chat with the
   memory tick and the one memory line (a suggested change to a locked rule).
   Teach: the sheet with a similar rule to choose about, in correct mode (Edit your rule, what changes), refused
   (Every project without the safe tick), the Your rules document (versions, the next-message list, Turn off
   confirmed in place), and the chat (receipts, saves coalescing into one line, and the reply tick of owner answer E-36:
   "Followed 1 of your rules", or "Missed 1 of your rules" with [Ask for a fix], which fills the message box).
   Every Teach state runs inside a recorded example's own chat, whose project holds only that example's rules. */
const MEM_CANON = ['Memory', 'Verified', 'Unverified'];
async function memoryDemo(h, flow, steps) {
  await h.closeAll();
  await h.demo('memory-demo-start', flow);
  if (steps) await h.drive(steps, 1100);
  await h.closeAll();
}
const gistId = h => h.ev(() => (window.PM56_MEMORY_DEMOS.snapshot() || {}).gistId || '');
/* Teach: type into the rule (the sheet listens to input; the field is never re-rendered per keystroke) */
const typeRule = (h, text) => h.ev(t => { const f = document.getElementById('teach-body'); if (!f) return false; f.value = t; f.dispatchEvent(new Event('input', { bubbles: true })); return true; }, text);
async function teachRule(h, text, scope) {
  await h.action('af-teach-open'); await h.wait(250);
  await typeRule(h, text); if (scope) await h.action('af-teach-set-scope', { value: scope });
  await h.action('af-teach-capture'); await h.wait(500);
}
async function teachThread(h) { await h.closeAll(); await h.demo('teach-demo-start', 'capture'); }
function teachSheet(id, title, prepare) {
  return {
    id, title, kind: 'sheet', tags: ['app', 'memteach', 'teach'], common: true, canon: ['Teach'],
    /* open() saves a rule first (durable by design); the open -> edit -> close ledger runs on wand:teach */
    ledger: false,
    async open(h) { await prepare(h); await h.settle(); },
    async after(h) { await h.closeAll(); }
  };
}
async function openMemory(h, id) { await h.action('af-memory-open', id ? { id } : {}); await h.settle(); }
function memorySheet(id, title, prepare, canon) {
  return {
    id, title, kind: 'sheet', tags: ['app', 'memteach', 'memory'], common: true, canon: canon || MEM_CANON,
    /* open() first plays a recorded example (a new thread, its messages, its notes: durable by design), so the
       open -> edit -> close ledger is run on the wand entry (wand:memory), which opens the same sheet with nothing before it */
    ledger: false,
    async open(h) { await prepare(h); },
    async after(h) { await h.closeAll(); }
  };
}
export default ({ demo }) => [
  memorySheet('memteach:memory-verified', 'Memory sheet: a note a passing test verified (8.10)', async h => {
    await memoryDemo(h, 'verified', 2); await openMemory(h, await gistId(h));
  }),
  memorySheet('memteach:memory-stale', 'Memory sheet: the note went out of date, a display group only (8.10, IMPACT A1-31)', async h => {
    await memoryDemo(h, 'verified', 2); await h.action('memory-demo-change'); await openMemory(h, await gistId(h));
  }),
  memorySheet('memteach:memory-decide', 'Memory sheet: a note suggests changing a locked rule (8.10 G-33)', async h => {
    await memoryDemo(h, 'locked', 3); await openMemory(h, await gistId(h));
  }),
  memorySheet('memteach:memory-next', 'Memory sheet: what your next message will include', async h => {
    await memoryDemo(h, 'verified', 2); await openMemory(h, await gistId(h)); await h.action('memory-preview'); await h.settle();
  }),
  memorySheet('memteach:memory-rules', 'Memory sheet: Your rules with Turn off confirmed in place (8.10, 8.11 G-33)', async h => {
    await memoryDemo(h, 'locked', 2);
    await openMemory(h); await h.action('af-memory-section', { value: 'taught' });
    const ds = await h.ev(() => { const b = document.querySelector('#pmOverlayRoot .pmx-mem-rule [data-action="af-teach-revoke"]'); return b ? { value: b.dataset.value, thread: b.dataset.thread } : null; });
    if (ds) await h.action('af-teach-revoke', ds);
    await h.settle();
  }, ['Memory', 'In use']),
  {
    id: 'memteach:gist-review', title: 'Gist Review document: notes, groups, proof, raw data behind a disclosure (8.10 G-26)', kind: 'view', tags: ['app', 'memteach', 'memory'], canon: MEM_CANON,
    async open(h) { await memoryDemo(h, 'verified', 2); await h.action('memory-demo-change'); await h.action('memory-open', { id: await gistId(h) }); await h.settle(); },
    async after(h) { await h.closeAll(); }
  },
  teachSheet('memteach:teach-similar', 'Teach sheet: a similar rule, Replace or Keep both (8.11)', async h => {
    await teachThread(h); await teachRule(h, 'Always use pnpm for installs, never npm, in this project.', 'project');
    await h.action('af-teach-open'); await h.wait(250);
    await typeRule(h, 'Use pnpm for installs in this project, not npm or yarn.'); await h.action('af-teach-set-scope', { value: 'project' });
  }),
  teachSheet('memteach:teach-correct', 'Teach sheet in correct mode: Edit your rule, what changes, wider rings disabled (8.11)', async h => {
    await teachThread(h); await teachRule(h, 'Before changing a generated file, edit its source and rebuild the output.', 'project');
    const id = await h.ev(() => window.PM56_TEACH.all().at(-1).id);
    await h.action('teach-correct', { id }); await h.wait(250);
    await typeRule(h, 'Before changing a generated file, edit its source, rebuild, and compare the generated output.');
  }),
  teachSheet('memteach:teach-refused', 'Teach sheet: Every project without the safe tick, Save refused in place (8.11, 9.3)', async h => {
    await teachThread(h); await h.action('af-teach-open'); await h.wait(250);
    await typeRule(h, 'Keep answers under 200 words.'); await h.action('af-teach-set-scope', { value: 'user' });
    await h.action('af-teach-capture');
  }),
  {
    id: 'memteach:teach-doc', title: 'Your rules document: two versions, the next-message list, Turn off confirmed in place (8.11 G-26, G-33)', kind: 'view', tags: ['app', 'memteach', 'teach'], canon: ['Teach'],
    async open(h) {
      await h.closeAll(); await h.demo('teach-demo-start', 'correct'); await h.drive(5, 1100);
      const tid = await h.ev(() => window.PM56_EXT.ctx().thread.id);
      await h.action('teach-preview', { thread: tid }); await h.settle();
    },
    async after(h) { await h.closeAll(); }
  },
  demo('memteach:teach-chat-capture', { action: 'teach-demo-start', flow: 'capture', drive: 3, gap: 1100, tags: ['memteach', 'teach'], title: 'Chat: "Rule saved" receipt and a reply that followed the rule (8.11, owner answer E-36)', canon: ['Teach'] }),
  demo('memteach:teach-chat-missed', { action: 'teach-demo-start', flow: 'missed', drive: 3, gap: 1100, tags: ['memteach', 'teach'], title: 'Chat: a reply that missed a rule, "Missed 1 of your rules" and [Ask for a fix] (owner answer E-36)', canon: ['Teach'] }),
  demo('memteach:teach-chat-fix', { action: 'teach-demo-start', flow: 'missed', drive: 4, gap: 1100, tags: ['memteach', 'teach'], title: 'Chat: Ask for a fix filled the message box; nothing sent (owner answer E-36)', canon: ['Teach'] }),
  demo('memteach:teach-chat-versions', { action: 'teach-demo-start', flow: 'correct', drive: 5, gap: 1100, tags: ['memteach', 'teach'], title: 'Chat: /teach, "Rule saved", "Rule updated to v2" (8.11)', canon: ['Teach'],
    then: async h => { const tid = await h.ev(() => window.PM56_EXT.ctx().thread.id); await h.action('teach-revoke-confirm', { thread: tid }); await h.ev(() => { const c = window.PM56_EXT.ctx(); c.state.editorRevealed = false; c.renderApp(); }); } }),
  demo('memteach:teach-chat-coalesced', { action: 'teach-demo-start', flow: 'capture', tags: ['memteach', 'teach'], title: 'Chat: three saves in a row read as one line, "3 rules saved" (8.11)', canon: ['Teach'],
    then: async h => { for (const t of ['Always use pnpm, not npm.', 'Keep answers under 200 words.', 'Write tests before changing a public function.']) await teachRule(h, t, 'project'); } }),
  demo('memteach:memory-chat-verified', { action: 'memory-demo-start', flow: 'verified', drive: 2, gap: 1100, tags: ['memteach', 'memory'], title: 'Chat: the reply tick "Verified: label checks pass (3/3)" and the guide', canon: [] }),
  demo('memteach:memory-chat-locked', { action: 'memory-demo-start', flow: 'locked', drive: 3, gap: 1100, tags: ['memteach', 'memory'], title: 'Chat: the one memory line, a suggested change to a locked rule (family ledger)', canon: ['Memory'] })
];
