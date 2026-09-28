/* REVERT surfaces (DESIGN-SPEC 8.12, 7.11) for tests/pmx-verify.mjs. Every state is reached through the recorded
   example (revert-demo-start whole | conflict) and the real actions, never by writing state:
   - the confirm sheet, opened from the wand (Workflows): ready, with more than five files (the list shows four and a
     half rows and scrolls), blocked (a file changed before the check), back (every file is already as it was:
     confirming records restore_skipped), refused (the confirm check found a later edit) and ineligible;
   - in chat: the files row under the reply (eligible, older, reverted, already back; an outcome that directly
     follows its row folds into it), the refused outcome line with Retry, and a longer chat with older outcomes;
   - the Revert document after a revert, and opened at a file by "See what's blocking it".
   The core wand:revert entry (wand.mjs) opens the wand row with no change in the chat, where the row is disabled;
   these entries give it one. A sheet's setup() makes the change once (the effects ledger measures from after it),
   and open() only opens the sheet; the refused face exists only after a committed confirm, so it skips the ledger. */
const CANON = ['Revert Last Agent Edit'];
const tag = t => ['app', 'revert'].concat(t || []);
const turnId = h => h.ev(() => (window.PM56_REVERT_DEMOS.snapshot() || {}).turnId || null);
async function start(h, flow, apply = true) {
  await h.closeAll();
  await h.demo('revert-demo-start', flow);
  if (apply) { await h.action('revert-demo-apply'); await h.wait(250); }
}
async function openSheet(h) { const id = await turnId(h); await h.action('af-revert-preview', { value: id }); await h.wait(300); await h.settle(); }
async function clickIn(h, sel) { const ok = await h.ev(s => { const b = document.querySelector(s); if (!b) return false; b.click(); return true; }, sel); if (!ok) throw new Error('not found: ' + sel); await h.wait(250); }
const change = h => clickIn(h, '#pmOverlayRoot [data-action="revert-demo-change"]');
const confirm = h => clickIn(h, '#pmOverlayRoot .pmx-primary[data-action="af-revert-confirm"]:not([disabled])');
/* the effects-ledger edit step: show or hide the last row's mini diff ("Show the change"; on three files or fewer the
   first row's starts open, and a row remembers its choice between openings, so the step toggles) */
async function edit(h) { await clickIn(h, '#pmOverlayRoot .pmx-revert-file:last-child > summary'); return ['toggled the last file’s mini diff']; }
/* 7.10: the files row under the reply is one 32 px line in every state and layout (design review cycle 2: the
   already-back row wrapped to two and three lines at 391 and 311), and it never runs wider than its card (review
   cycle 3: at 230 and 204 px the one-line row pushed "Revert" past the pane edge and scrolled the transcript) */
async function rowsFit(h, where) {
  await h.settle();
  const bad = await h.ev(() => {
    const out = [];
    for (const r of document.querySelectorAll('.transcript .pmx-revert-row')) {
      if (!r.getClientRects().length) continue;
      const box = r.getBoundingClientRect(), text = r.innerText.replace(/\s+/g, ' ').trim();
      if (box.height > 32.5) out.push({ why: 'taller than 32 px', h: box.height, text });
      if (r.scrollWidth > r.clientWidth + 1) out.push({ why: 'wider than the row', scroll: r.scrollWidth, client: r.clientWidth, text });
      for (const b of r.querySelectorAll('button')) { const bb = b.getBoundingClientRect(); if (bb.width && (bb.right > box.right + 0.5 || bb.left < box.left - 0.5)) out.push({ why: 'action outside the row', text }); }
    }
    const t = document.querySelector('.transcript');
    if (t && t.scrollWidth > t.clientWidth + 1) out.push({ why: 'transcript scrolls sideways', scroll: t.scrollWidth, client: t.clientWidth });
    return out;
  });
  if (bad.length) throw new Error('files row does not fit' + (where && where.layout ? ' in ' + where.layout : '') + ': ' + JSON.stringify(bad));
}
async function chatOpen(h, where) { await h.closeAll(); await rowsFit(h, where); }
async function closeViews(h) { await h.ev(() => { const c = window.PM56_EXT.ctx(); c.state.editorTabs = []; c.state.activeEditor = null; c.state.editorRevealed = false; c.renderApp(); }); await h.closeAll(); }
async function reverted(h) { await start(h, 'whole'); await openSheet(h); await confirm(h); await h.wait(1400); await h.settle(); }
/* the reader puts every file back by hand (the example's own edit boundary), so nothing is left to revert */
async function allBack(h) { await start(h, 'whole'); await h.ev(() => { const s = window.PM56_REVERT_DEMOS.snapshot(), r = window.PM56_REVERT.get(s.turnId); r.manifest.forEach(f => window.PM56_REVERT.example.edit(s.workspaceId, f.path, f.before.body)); }); await h.wait(200); }
/* a longer chat: an older change, a refused revert whose file the reader keeps, a reverted change and a new one */
async function history(h) {
  await start(h, 'whole');
  const say = (role, body) => h.ev(([role, body]) => { const c = window.PM56_EXT.ctx(); c.appendMessage({ id: 'rv-hist-' + Math.random().toString(36).slice(2), role, type: 'text', body, time: new Date().toISOString() }); c.renderApp(); }, [role, body]);
  const apply = (changes, summary) => h.ev(([changes, summary]) => { const s = window.PM56_REVERT_DEMOS.snapshot(); return window.PM56_REVERT.applyTurn(s.workspaceId, changes, summary).id; }, [changes, summary]);
  await say('user', 'Rename it to “Proceed” in the label file and the checklist.');
  const c = await apply([{ path: 'src/checkout-label.js', body: 'export const buttonLabel = "Proceed";\n' }, { path: 'notes/launch.txt', body: 'User note: keep the launch checklist.\nButton label is now “Proceed”.\n' }], 'Renamed the label to “Proceed” in the label file and the checklist.');
  await h.action('af-revert-preview', { value: c }); await h.wait(300);
  await h.ev(() => { const s = window.PM56_REVERT_DEMOS.snapshot(); window.PM56_REVERT.example.edit(s.workspaceId, 'notes/launch.txt', 'User note: keep the launch checklist.\nQA: check the label on mobile.\n'); });
  await confirm(h); await h.wait(300); await clickIn(h, '#pmOverlayRoot .pmx-close');
  await say('user', 'Keep my QA note. Make the button wider instead.');
  const d = await apply([{ path: 'src/checkout.css', body: '.checkout-button {\n  min-width: 12rem;\n}\n' }], 'Gave the checkout button a minimum width.');
  await say('user', 'That looks odd on desktop. Revert that one.');
  await h.action('af-revert-preview', { value: d }); await h.wait(300); await confirm(h); await h.wait(1400);
  await say('user', 'Thanks. Now drop “Pay now” from the receipt email.');
  await apply([{ path: 'src/receipt/email.ts', body: 'export const subject = (order) => `Your order ${order.id}`;\n' }], 'Updated the receipt subject.');
  await h.settle();
}
async function refused(h) { await start(h, 'conflict'); await openSheet(h); await change(h); await confirm(h); await h.wait(300); await h.settle(); }
/* six files: a live change made through the protocol's own boundary, so the list must scroll past five */
const SIX = [
  { path: 'src/checkout.js', body: '// Display currency: USD\nimport { buttonLabel } from "./checkout-label.js";\nexport { buttonLabel };\n' },
  { path: 'src/checkout-label.js', body: 'export const buttonLabel = "Continue";\n' },
  { path: 'src/legacy-label.js', body: null },
  { path: 'src/checkout/summary-panel.tsx', body: 'export function SummaryPanel() {\n  return null;\n}\n' },
  { path: 'src/checkout/summary-panel.test.tsx', body: 'test("renders", () => {});\n' },
  { path: 'notes/launch.txt', body: 'User note: keep the launch checklist.\nAssistant: label renamed to Continue.\n' }];

export default () => [
  { id: 'revert:sheet', title: 'Revert sheet, ready (8.12), opened from the wand', kind: 'sheet', tags: tag(['wand']), common: true, canon: CANON, edit,
    async setup(h) { await start(h, 'whole'); },
    async open(h) { const ok = await h.wandDialog('work', '[data-action="af-revert-preview"]:not([disabled])'); if (!ok) throw new Error('wand row not found'); },
    async after(h) { await h.closeAll(); } },
  { id: 'revert:sheet-six', title: 'Revert sheet with six files (the list scrolls past five)', kind: 'sheet', tags: tag(), common: false, canon: CANON, edit,
    async setup(h) {
      await start(h, 'whole', false);
      await h.ev(six => { const s = window.PM56_REVERT_DEMOS.snapshot(); window.PM56_REVERT.applyTurn(s.workspaceId, six, 'Split the checkout summary into its own panel and renamed the button. Six files changed.'); }, SIX);
      await h.wait(250);
    },
    async open(h) { const id = await h.ev(() => window.PM56_REVERT.latest().id); await h.action('af-revert-preview', { value: id }); await h.wait(300); await h.settle(); },
    async after(h) { await h.closeAll(); } },
  { id: 'revert:sheet-blocked', title: 'Revert sheet, blocked: a file changed before the check', kind: 'sheet', tags: tag(), common: true, canon: [], edit,
    async setup(h) { await start(h, 'conflict'); await openSheet(h); await change(h); await clickIn(h, '#pmOverlayRoot .pmx-cancel'); await h.settle(); },
    async open(h) { await openSheet(h); },
    async after(h) { await h.closeAll(); } },
  { id: 'revert:sheet-back', title: 'Revert sheet, already back: every file is as it was, Done records restore_skipped', kind: 'sheet', tags: tag(), common: false, canon: [], edit,
    async setup(h) { await allBack(h); },
    async open(h) { await openSheet(h); },
    async after(h) { await h.closeAll(); } },
  { id: 'revert:sheet-refused', title: 'Revert sheet, refused: the confirm check found a later edit (no shake)', kind: 'sheet', tags: tag(), common: true, canon: [], edit, ledger: false,
    async open(h) { await refused(h); },
    async after(h) { await h.closeAll(); } },
  { id: 'revert:sheet-none', title: 'Revert sheet, ineligible: the reason and no primary', kind: 'sheet', tags: tag(), common: true, canon: [], edit: async () => [],
    async setup(h) { await reverted(h); },
    async open(h) { const id = await turnId(h); await h.action('af-revert-preview', { value: id }); await h.wait(300); await h.settle(); },
    async after(h) { await h.closeAll(); } },
  { id: 'revert:chat-files', title: 'Files row under the reply: "Changed 3 files +3 −2 · Revert"', kind: 'chat', tags: tag(['chat']), canon: [],
    async setup(h) { await start(h, 'whole'); }, async open(h, w) { await chatOpen(h, w); }, async after(h) { await h.closeAll(); } },
  { id: 'revert:chat-older', title: 'An older change: the reason replaces Revert', kind: 'chat', tags: tag(['chat']), canon: [],
    async setup(h) {
      await start(h, 'whole');
      await h.ev(() => { const s = window.PM56_REVERT_DEMOS.snapshot(); window.PM56_REVERT.applyTurn(s.workspaceId, [{ path: 'notes/launch.txt', body: 'User note: keep the launch checklist.\nLabel is now Continue.\n' }], 'Noted the new label in the launch checklist.'); });
      await h.wait(250);
    }, async open(h, w) { await chatOpen(h, w); }, async after(h) { await h.closeAll(); } },
  { id: 'revert:chat-reverted', title: 'After a revert: "Reverted · 3 files put back · See what happened" (the outcome folds into the row)', kind: 'chat', tags: tag(['chat']), canon: [],
    async setup(h) { await reverted(h); }, async open(h, w) { await chatOpen(h, w); }, async after(h) { await h.closeAll(); } },
  { id: 'revert:chat-back', title: 'Already back: "Already back to before · nothing to revert" after Done', kind: 'chat', tags: tag(['chat']), canon: [],
    async setup(h) { await allBack(h); await openSheet(h); await confirm(h); await h.wait(400); await h.settle(); }, async open(h, w) { await chatOpen(h, w); }, async after(h) { await h.closeAll(); } },
  { id: 'revert:chat-history', title: 'A longer chat: older changes, a refused outcome line, a reverted change and the latest row', kind: 'chat', tags: tag(['chat']), canon: [],
    async setup(h) { await history(h); }, async open(h, w) { await chatOpen(h, w); }, async after(h) { await h.closeAll(); } },
  { id: 'revert:chat-conflict', title: 'After a refused revert: the outcome line with Retry (the row above offers no second Revert)', kind: 'chat', tags: tag(['chat']), canon: [],
    async setup(h) { await refused(h); await clickIn(h, '#pmOverlayRoot .pmx-close'); await h.settle(); }, async open(h, w) { await chatOpen(h, w); }, async after(h) { await h.closeAll(); } },
  { id: 'revert:view', title: 'Revert document after a revert (See what happened)', kind: 'view', tags: tag(['view']), canon: CANON,
    async setup(h) { await reverted(h); },
    async open(h) { const id = await turnId(h); await h.action('revert-open', { value: id }); await h.wait(400); await h.settle(); },
    async after(h) { await closeViews(h); } },
  { id: 'revert:view-blocking', title: 'Revert document opened at the file by "See what’s blocking it"', kind: 'view', tags: tag(['view']), canon: CANON,
    async open(h) { await refused(h); await clickIn(h, '#pmOverlayRoot .pmx-revert-block'); await h.wait(400); await h.settle(); },
    async after(h) { await closeViews(h); } }
];
