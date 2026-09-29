/* The real app's surfaces, as the module packages will rebuild them: the eleven
   wand sheets (the same entry points tests/wand-visual-pass.mjs opens) plus Revert
   and Crew Auto, and the recorded demos that put run cards in the chat. Until a
   package lands its pmx sheet, its entry fails `present` (no #pmOverlayRoot .pmx-sheet):
   that is the target, not a harness fault. A package that needs a more specific state
   (a card density, a refusal, a confirmation) adds its own file next to this one, e.g.
   tests/pmx-surfaces/collab.mjs, instead of editing this one or the core.

   `canon` (canon-names, IMPACT A2-27a): the principle-10 names the blueprint shows on the
   sheet (section 8 and the 9.2 sheet index). A package that draws more of them (a
   severity word, a state word) extends the list in its own surface file.
   `ledgerSpy` (effects-ledger, IMPACT A2-26): Crew Auto's "How it would decide" list is
   re-evaluated through PM56_CREW.evaluate, which must stay fixture-static: the ledger
   requires that it was reached and that nothing durable moved. */
const SPECIALISTS = ['Wonderer', 'Grill Me'];
/* closing (COLLAB request): the wand rows only. The unscoped selector also matched a finished or cancelled card's
   "Run again with changes…" (data-reconfigure), as collab.mjs and collaboration-verify already avoid. */
const ROW = (kind, auto) => 'button.menu-item[data-action="collab-open-configure"][data-kind="' + kind + '"]' + (auto ? '[data-auto="1"]' : ':not([data-auto])') + ':not([data-reconfigure])';
export default ({ wand, demo }) => [
  wand('wand:crew', { group: 'work', sel: ROW('crew'), title: 'Crew setup sheet (8.1)', canon: ['Crew', ...SPECIALISTS] }),
  wand('wand:crew-auto', { group: 'work', sel: ROW('crew', true), title: 'Crew Auto sheet (8.2)', canon: ['Crew Auto'],
    ledgerSpy: { 'PM56_CREW.evaluate': 1 } }),
  /* lead ruling 2026-09-28 (COLLAB FR 6): Chat Room's 4 helpers + Moderator (MUST-KEEP) still overflow at 1280 x 800 after
     the sheet has fully yielded (two-line job box included), so its roster may scroll inside its own region there
     (the Crew 4-5 precedent) */
  wand('wand:chat_room', { group: 'work', sel: ROW('chat_room'), title: 'Chat Room setup sheet (8.3)', canon: ['Chat Room', ...SPECIALISTS], rosterScrollAfterYield: ['1280x800'] }),
  wand('wand:brainstorm', { group: 'work', sel: ROW('brainstorm'), title: 'BrainStorm setup sheet (8.4)', canon: ['BrainStorm', ...SPECIALISTS] }),
  wand('wand:review', { group: 'work', sel: ROW('review'), title: 'Review setup sheet (8.5)', canon: ['Review', 'Multi-Pass Review'] }),
  /* closing: the wand's Revert row is disabled until the chat holds an agent edit it can undo, so the surface first
     runs the recorded Revert example to that point (as revert:sheet does); `setup` passes through the wand factory */
  wand('wand:revert', { group: 'work', sel: '[data-action="af-revert-preview"]:not([disabled])', title: 'Revert Last Agent Edit sheet (8.12)', canon: [],
    async setup(h) { await h.closeAll(); await h.demo('revert-demo-start', 'whole'); await h.action('revert-demo-apply'); await h.wait(250); },
    /* the effects-ledger edit is Revert's own (revert.mjs): the generic step typed into Cancel and closed the sheet */
    async edit(h) { await h.ev(() => { const s = document.querySelector('#pmOverlayRoot .pmx-revert-file:last-child > summary'); if (s) s.click(); }); await h.wait(200); return ['toggled the last file’s mini diff']; } }),
  wand('wand:bsd', { group: 'assist', hover: '[data-submenu="bsd-v2"]', sel: '[data-action="bsd-configure-stages"]', title: 'Back Seat Driver sheet (8.6)', canon: ['Back Seat Driver', 'Off', 'Auto', 'On'] }),
  wand('wand:eli5', { group: 'assist', sel: '[data-action="eli5-open"]', title: 'ELI5 sheet (8.13)', canon: [] }),
  wand('wand:schedule-message', { group: 'schedule', sel: '[data-action="sched-open-message"]', title: 'Schedule Message sheet (8.7)', canon: [] }),
  wand('wand:scheduled', { group: 'schedule', sel: '[data-action="sched-open-manage"]', title: 'Scheduled and Automations manager (8.9)',
    canon: ['Scheduled', 'Scheduled Messages', 'Execution & Build Windows', 'Resume & Safety Policy', 'Events & Automation'] }),
  wand('wand:memory', { group: 'memory', sel: '[data-action="af-memory-open"]', title: 'Memory sheet (8.10)', canon: [] }),
  wand('wand:teach', { group: 'memory', sel: '[data-action="af-teach-open"]', title: 'Teach sheet (8.11)', canon: ['Teach'] }),
  wand('wand:defaults', { group: 'preferences', sel: '[data-action="af-settings-open"]', title: 'New chat defaults sheet (8.14)', canon: [] }),
  demo('demo:crew-delegation', { action: 'crew-demo-start', flow: 'delegation', drive: 4, title: 'Crew recorded example, a few steps in', canon: ['Crew'] }),
  demo('demo:review-multi', { action: 'review-demo-start', flow: 'multi', drive: 4, title: 'Multi-Pass Review recorded example, a few steps in', canon: ['Review'] }),
  demo('demo:brainstorm-synthesis', { action: 'brainstorm-demo-start', flow: 'synthesis', drive: 4, title: 'BrainStorm recorded example, a few steps in', canon: ['BrainStorm'] }),
  demo('demo:room-discussion', { action: 'room-demo-start', flow: 'discussion', drive: 3, title: 'Chat Room recorded example, a few steps in', canon: ['Chat Room'] })
];
