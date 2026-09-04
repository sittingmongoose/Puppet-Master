# Shard 075: Additive Correction v4 — Assistant Correction Surfaces (2026-09-03)

Source: `Plans/FinalGUISpec.md`

Source lines: L36122-L36294

Source SHA256: `d5dd0b8f0f130cf3a4834576d4ac87136d579819ec48bf6b3f165ac4874adc2b`

---

## Additive Correction v4 — Assistant Correction Surfaces (2026-09-03)

This section applies the GUI-related clauses of `PM_Assistant_v2_Additive_Correction_v4`. It is
additive: every v2 Assistant surface above — the primary mode menu and its sidecars, the wand,
Context Lens at the top of the chat, the context ring and details, thread history, the
questionnaire host, Orbit and Step Rail, the activity bar, Send/Stop, the follow-up queue, the
attachment tray, the composer selectors and indicators, and the eight themes — stays exactly as
specified. Nothing here authorises a broad restyle.

### QMAX-017 — Where the question numbers appear

The BrainStorm configuration modal shows `Maximum questions: 20` and, with Grill Me enabled,
`Maximum questions: 45 (20 + Grill Me 25)`. The other five planning choices show their effective
limits in Details or in modal help: Quick 3/28, Standard 6/31, Thorough 8/33, Deep Thorough
10/35, Deep Exhaustive 15/40. When Settings configure different values the displayed arithmetic
uses the configured numbers.

No `15`, `+10`, or `25`-as-BrainStorm-total example survives in any menu, tooltip, modal, or
help string. The question count does not become a permanent crowded composer control.

### PPROG-009..012 — Progress on the Plan document and card

Rich Text shows a subtle status marker beside each Plan step. It never strikes through, rewrites,
re-wraps, or reorders approved Plan prose, and a status change animates without changing document
bytes.

Markdown stays read-only and shows status in a separate gutter or adjacent rail keyed to stable
block IDs. No checkbox and no status word is injected into the Markdown text.

The Plan card may show a compact To-Do completion summary. The Build control is the only display
of Build/Building…/Completed/Canceled, the two never disagree once the current projection has
arrived, and no second Plan lifecycle chip is added.

A delayed or stale projection reads `Updating progress…` or shows an explicit stale marker rather
than presenting old data as current, and a stale projection cannot enable a mutation control.

### PFAIL-001..002, PFAIL-005, PFAIL-009 — Four labels, and secondary truth

The primary Build control has exactly four labels: `Build`, `Building…`, `Completed`, `Canceled`.
While the Plan is unfinished it reads `Building…` even when the run is paused, waiting on a
window or a Usage reset, holding a failed attempt, needing attention, or needing recovery.
`Failed` is not a fourth label.

Nonterminal trouble appears as secondary truth beside the control — `Paused`, `Waiting for
Usage`, `Outside execution window`, `Needs attention`, `Build failed`, `Recovery required` — with
the exact owner reason and only the owner-admitted actions. A generic `Working` label that hides
a failure is prohibited.

After restart the surface restores `Building…` plus the exact secondary reason and allowed
actions from owner state, with no transient false `Build` or `Completed` frame.

### PDET-001..003, PDET-009, PDET-012 — Plan Details

Details show Plan identity, version and hash, backend, creation and revision sources, source
messages, attachments, research, exports, run history, and currentness.

A Regular Plan states `Direct planning` and `No ledger, no PlanUnits`. A Deep Plan additionally
shows ledger summary and currentness, scoped PlanUnit count and validation, and the
PlanUnit-to-To-Do mapping. Scoped PlanUnits are hidden by default, inspectable in Details, and
never rendered as To-Do items or as an Activity domain. Technical detail is not shown by default.

Mermaid, graph, chart, image, diagram, table, code, checklist, video, and interactive blocks all
render through the shared artifact renderer. A missing, stale, denied, or unsupported embed shows
an explicit unavailable block with its reason and a repair or re-export route.

### PGOAL-001, PGOAL-007..008, PGOAL-013..014 — Build as Goal in the GUI

`Build as Goal` lives in the Plan secondary/overflow action menu and responds to an explicit
natural-language request. The primary control stays `Build`; no second large button is added.

While a bound Goal is paused, the Plan control still reads `Building…` and the pause state and
reason appear separately. Goal Cancel sets the control to `Canceled`.

Goal Activity links to the bound Plan and Plan Details links back to the Goal. No Goal thread card
is created, and the objective text is not duplicated as a Plan card section. Goal and To-Dos
remain in Activity, not on thread cards, and the Goal keeps its hover Pause/Resume/Cancel/edit
controls.

### PSCHED-011, PSCHED-013 — Schedule state is secondary

Before a scheduled start the Plan card keeps `Build` as its primary label and shows schedule and
window state as secondary information. `Scheduled` is never a primary Plan status label, and
`Building…` is not shown before run admission. A failed schedule admission shows the schedule and
its reason with repair or cancel actions and no partial runtime card.

### MODAL-001, MODAL-004..008, MODAL-010..012, MODAL-014, MODAL-018 — Modals as transactions

Opening or editing a Crew, Crew Auto, BrainStorm, Review, Chat Room, BSD-workflow, or
Build-With-Crew modal creates only local draft state. No placeholder card, no Activity entry, and
no `Running` state appears during configuration, and cancel leaves no transcript trace.

A failed Start keeps the modal values and shows the typed failure; it never clears the user's
configuration and never renders a fake card.

`Crew Auto`'s checkmark reflects effective stored state and appears only after configuration
confirmation and a successful Settings commit; cancel restores the prior state.

If a Review target changed while the modal was open, the modal offers refresh-to-current or the
explicitly identified old immutable target. There is no silent swap.

A held natural-language BrainStorm request is restored intact to the composer on cancel, with its
text and attachments. Build With Crew refuses a Plan that changed while its modal was open and
tells the user to reopen against the new version.

Modal selection, expand/collapse, hover, tabs, and close use shared view-state primitives, not
domain commands.

### PART-001, PART-003, PART-007..008, PART-010..012, PART-017..018, PART-023..024 — Participants

A participant row shows role, model, Persona, the requested-versus-effective disclosure when they
differ, and one explicit terminal outcome: completed, failed, timed out, unavailable, canceled, or
explicitly waived. A row never simply disappears.

A one-reviewer Multi-Pass Review labels itself a single-pass result and shows no agreement or
consensus section. A partial Review shows requested, completed, and failed counts and stays
attention-required until retry, reconfiguration, or explicit acceptance.

An active Wonderer row shows `Abstained` and is excluded from the support and oppose denominators
without depressing the support percentage. Unresolved disagreement stays visible; a lack of quorum
is never rendered as consensus.

A failed Crew coordinator shows `Needs attention` with its allowed actions; no other participant
silently becomes coordinator. A Chat Room with failed members keeps a truthful roster and shows no
fabricated messages.

Cards, Activity, and full panels expose partial, failed, and waived counts and currentness with
details reachable from participant rows, without flooding the main transcript. A constrained
provider discloses its control tier before Start and in the final artifact.

### SMSG-001..003, SMSG-012..013, SMSG-018 — The scheduled-message card

A scheduled message renders one card in its source thread after a durable commit — never before,
and never as a toast alone. Its visible states are `Scheduled`, `Held`, `Sent`, `Canceled`,
`Failed`, and `Expired`, each with truthful actions and reasons.

The card shows the exact time, IANA timezone, destination, a short text preview, the attachment
count, the requested model or route, and whether Edit and Cancel are available. Hashes stay in
Details and secret attachment paths are never shown.

A `Sent` card links to the dispatched message. Cancelled, expired, and failed cards keep their
records. `Schedule Message` stays in the wand; the card is the lifecycle projection, not a second
creation entry point.

### BSTALE-003, BSTALE-005 — Stale capture in the composer

A stale component returns an explicit `stale_capture` state with a recapture action and blocks the
send until it is resolved. Nothing is guessed and nothing is silently dropped.

In a numbered composer list, one stale item stays visible and blocks only itself; the other items
are untouched, and the composer's other content is unchanged.

### FOLDER-001, FOLDER-006..007 — Folders in the shared tray

A folder attaches through the same tray, picker, and drag-and-drop path as a file, shown with its
bounded manifest rather than an expanded file list. A folder that changed after send is disclosed
as changed or stale with captured-versus-current identity in Details. Open, reveal, export, and
download reuse File Manager and artifact capabilities, and an unsupported action is disabled with
its reason.

### CDRY-006 — Visual toggles are view state, not commands

Modal open and close, the Plan Rich/Markdown toggle, card expand and collapse, hover,
local tabs, and To-Do parent expansion all use local or shared view-state primitives
and emit no domain event. Where a preference persists it uses the shared UI state
owner. No domain command is registered for a visual action, and the command census in
`Plans/Commands_System.md` records each of these as local or shared view-state reuse.

### TDG-006, TDG-013..014 — To-Do list surfaces

Reordering changes display order only. Large hierarchies use the existing virtualization and
preserve every item: the compact hover may summarise, full Activity may not truncate. Validation
appears as an ordinary To-Do with no verification field, status, badge, group, or separate Done
section.
