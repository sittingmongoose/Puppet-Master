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
export default ({ wand, demo }) => [
  wand('wand:crew', { group: 'work', sel: '[data-action="collab-open-configure"][data-kind="crew"]:not([data-auto])', title: 'Crew setup sheet (8.1)', canon: ['Crew', ...SPECIALISTS] }),
  wand('wand:crew-auto', { group: 'work', sel: '[data-action="collab-open-configure"][data-kind="crew"][data-auto="1"]', title: 'Crew Auto sheet (8.2)', canon: ['Crew Auto'],
    ledgerSpy: { 'PM56_CREW.evaluate': 1 } }),
  wand('wand:chat_room', { group: 'work', sel: '[data-action="collab-open-configure"][data-kind="chat_room"]', title: 'Chat Room setup sheet (8.3)', canon: ['Chat Room', ...SPECIALISTS] }),
  wand('wand:brainstorm', { group: 'work', sel: '[data-action="collab-open-configure"][data-kind="brainstorm"]', title: 'BrainStorm setup sheet (8.4)', canon: ['BrainStorm', ...SPECIALISTS] }),
  wand('wand:review', { group: 'work', sel: '[data-action="collab-open-configure"][data-kind="review"]', title: 'Review setup sheet (8.5)', canon: ['Review', 'Multi-Pass Review'] }),
  wand('wand:revert', { group: 'work', sel: '[data-action="af-revert-preview"]', title: 'Revert Last Agent Edit sheet (8.12)', canon: [] }),
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
