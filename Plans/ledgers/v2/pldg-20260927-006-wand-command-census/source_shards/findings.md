# Findings compiled by this ledger

Group G6 of the wand-modules canon compile. Each record is one register line of the impact register snapshot (`/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md`, SHA-256 `71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493`), compiled only in the part `CANON-PLAN.md` (SHA-256 `55989ef2eedc74983b86c36f6b7cf74400e208ead67982f110532cb5917f4464`) triages NOW. The behaviour comes from the frozen design spec (`DESIGN-SPEC.md`, SHA-256 `dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de`) and the commands audit (`commands.md`, SHA-256 `1f1544580d18467a03931d8e208fbe24a253e3c4b97f14cdcd5b4f1acf7e2c6f`), both in the same evidence folder. WAIT parts are open questions q-001 to q-003; the WAIT lines B-CMD-01, B-CMD-02, B-CMD-05 and B-CMP-02 are q-004 to q-007. OUT parts are not compiled.

## Record 1 — CMD-03 (source surfaces): The redesign's new source surfaces have no catalog home

The redesigned sheets, cards, dock lines, run view and header dispatch existing rows, but none of their surfaces is named in any family's source-surface line, and several existing surfaces (`mode_menu`, `natural_language`, `plan_schedule`, `wand`, `workflow_card`, the review and room cards and panels, `brainstorm_card`) do not reach the rows they now produce. A surface a row does not name cannot carry the shared availability and disabled-reason obligation.

Repairs UCC-169 and WM-062. The catalog addendum names the eleven NOW surfaces and the existing surfaces that join more rows, and binds each to the UCC-156 obligation; the wiring unit states that the production surface lists gain exactly those surfaces. Held for cards p08, p09 and p11: `eli5_sheet`, `teach_document`, `teach_receipt`, `crew_auto_receipt`. Out of scope: `new_chat_defaults_sheet` (Settings).

## Record 2 — CMD-04 (row revisions): Existing catalog rows lack the redesign's producers and contract notes

Build With Crew's producer was not named, so a port could decompose it into a collaboration start; the revert row did not say that the confirm sheet is its only dispatcher, that its token is the manifest hash shown, or that no kept outcome exists; the title row had no header surface; Teach capture had no edit mode; the memory route, capsule preview, To-Do open and the approve and decline rows lacked their new producers.

Repairs UCC-169 and WM-062. The Build With Crew row itself also gains an in-place producer note in the Assistant Plan Runtime table. Held for cards p01, p11, p19 and p15: the Crew Auto open-config surfaces and set payload, the Regenerate Title label, and the Teach locked field.

## Record 3 — ACD-12 (Answer now): BrainStorm Answer now is not a named questionnaire resume producer

BrainStorm's "Answer now" opens the existing questionnaire from the dock and the BrainStorm card, but the questionnaire resume row named no such producer, and the family is still `candidate_not_registered`, so the control's disabled state was unstated.

Repairs UCC-169 and WM-062. The questionnaire resume row in the decision-review profile table also gains an in-place note that, outside that profile, the ordinary questionnaire lifecycle has this producer and that it renders disabled with `command_not_registered` until admission.

## Record 4 — CMD-07 (non-command list): The redesign's non-command controls are not listed for the commands owner

The commands audit's "deliberately not requested" list and the spec's view-state list existed only in scratch sources, so nothing in canon stopped a port from minting a recipe, Bring back, dock show, Send now, jump-to-message, Revert preview or keep, view-mode or per-kind alias command.

Repairs CDRY-021. The unit lists the view-state and draft-state controls and the reuse that replaces each alias, without the Settings members (Save as my default, the ELI5 project level, Thought Stream) and without the demo list. Held for card p15: the central contract records for the new command IDs, for which CS-085 is kept free.

## Record 5 — CMD-08 (Plan view): The Plan view toggle is both a registered row and a local action

The catalog registers `cmd.chat.plan.view.set` as a `shell_view` row with production wiring, while the view-state rule called the Plan Rich/Markdown toggle local and named a separate local action for it. The same held for To-Do parent expansion. The redesign's Review and BrainStorm view toggles needed a disposition.

Repairs CDRY-006 and CDRY-021. The view-state rule now says that two view actions are registered as `shell_view` rows, view-state commands that are never domain commands, that there is no separate local Plan view action, and that the Review and BrainStorm toggles are local with no row. The Plan view row in the catalog gains the matching in-place note.

## Record 6 — CMD-09 (text-editing keys): Text-editing keys clash with the palette and close-tab chords in every sheet field

The text-editing-keys defaults bind Ctrl+K and Ctrl+W inside a text field, the same chords as the command palette and close tab. The clash predates the redesign, but each redesigned sheet's main text field now carries it.

Repairs CS-086. The unit records the clash for the Commands and Shortcuts owner without resolving it or changing a default, and Commands_System section 1.3 gains a pointer paragraph.
