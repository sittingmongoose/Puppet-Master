# Shard 082: Wand Modules Redesign Addendum (2026-09-27)

Source: `Plans/FinalGUISpec.md`

Source lines: L38537-L39303

Source SHA256: `9e116c56cf58230049cc5d6be27a21bcb35b9f4e28e58ec6ca101c21ecf279bb`

---

## Wand Modules Redesign Addendum (2026-09-27)

This addendum is the GUI contract for the redesigned Assistant wand popups and their in-chat presence, under Jared's instruction of 2026-09-27 and his amendments J-1 and J-2 (DL-109). Its source is the frozen design specification `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md` (SHA-256 `dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de`); the 5.6 Pro concept is source lineage only, and its class names, keys and harness hooks are not canon. Behaviour stays with its owners: `Plans/assistant-chat-design.md` ACD-476 through ACD-480, `Plans/Collaborative_Workflows.md`, `Plans/Back_Seat_Driver.md`, `Plans/Scheduling_and_Quota_Resume.md` and `Plans/assistant-memory-subsystem.md`. The transcript family map and the accent budget stay with ACD-469 and F3-562 (DR-043), and DR-044 names this addendum as the single owner of the wand modules' presentation grammar. Anything the units below leave unstated waits for Jared's answer and is not implied.

### F3-566 - Wand Modules Redesign GUI Contract And Sheet Grammar

```yaml
plan_unit_id: F3-566
unit_type: gui_requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Wand modules redesign, 2026-09-27 (lineage J-1 and J-2, DL-109). For the wand modules' surfaces
  only, this contract supersedes the presentation clauses of the 2026-09-03 redesign section's
  section 10 (one shared modal shell, the card that pops out to a full panel) and section 13 (the
  Schedule Message and Build At modals' layout), and Additive Correction v4's statement that
  nothing authorises a broad restyle. Every behaviour clause stays and applies to these surfaces
  unchanged: MODAL, PART, SMSG, QMAX, PPROG, PFAIL, PSCHED and CDRY, the current themes and their
  tokens. Every configuration popup is a configuration sheet with one anatomy. The head has the
  module's kind mark (no tile, no box), a sentence-case title with the canonical name inside, one
  lead sentence and the close control, and no header pill. The hero is the most important input,
  first and focused. Then a plate, a flat drawing of who is involved and where the result goes,
  over the roster or the module's equivalent; then the questions, numbered 1 to 4 only in the four
  collaboration kinds, where the order is real, and unnumbered elsewhere; the promise lines saying
  what won't happen; and one Advanced entry that opens as a page inside the same sheet. Every
  control has a visible label and one helper line; options with descriptions use the preserved
  dropdown trigger, and each description names the real difference between the options (for
  example Single Agent against Multi-Pass Review, or the Deep Plan strategies Thorough, Exhaustive
  and BrainStorm; BrainStorm has no Quick strategy); a disabled control prints its reason in words. The foot holds the read-back
  sentence, always true for the current settings, the estimate line (never $0.00), Cancel and one
  primary naming a verb, the canonical name and a count; a disabled primary prints its reason, and
  a refused Start replaces the read-back with the refusal and a route to the control that fixes it.
  A sheet whose changes apply at once shows only Done. Sizes are fixed per sheet: wide 1120 x 780
  (the collaboration kinds, the Scheduled and Automations manager, Memory), standard 900 x 720 (Back
  Seat Driver, Schedule Message, Build At, Teach) and compact 720 wide at a fixed height per sheet
  (Revert and the small raw-data and evidence dialogs), always clamped inside the window (at most
  its width less 48 px and its height less 40 px). A sheet never resizes or re-centres while open.
  The common case never scrolls at 1440 x 900 or 1280 x 800: the plate yields first as the roster
  grows (full at 1 to 3 rows, compact at 4, a strip at 5 or 6, one sentence at 7 or 8) and grows
  into spare height when the column is short; the roster scrolls in its own region only at 7 or 8
  helpers with Add a helper kept visible; the side column scrolls only below 1280 x 800; the hero
  field scrolls inside itself past three lines; below a 900 px sheet width the body becomes one
  column that scrolls inside the sheet with head and foot fixed; nothing overflows sideways.
  Hovering or focusing a control lights the plate parts and read-back phrases it affects and dims
  the others, with no re-render. Kinds are told apart by a kind mark drawn by shape, and each
  participant by a cast mark drawn from silhouette, spike and hue with its state as a ring, never
  by initials or letters. Nothing draws pills or capsules, side strips or vertical rules beside a
  block (columns are separated by space only), nested boxes, uppercase micro-labels or emoji.
  Typography (J-1): every wand-module surface uses the theme's own font with no separate display
  face; the voice roles (read-backs, result and receipt headlines, pull-quotes, run-view headings)
  differ only by size, weight and colour, and a quote is marked by quotation marks and the muted
  colour, never a different face. Spacing (J-2) is a floor in every theme: text sits at least 8 px
  from a hairline, divider or border above or below it (6 px inside a 40 px in-chat lane, whose
  height grows instead) and at least 12 px from a container's side edge; controls keep at least
  10 px horizontal and 7 px vertical padding and sheet buttons are at least 32 px tall; adjacent
  controls sit at least 10 px apart, stacked controls 12 px, and a control 16 px from unrelated text
  on its line; a secondary line under a row sits at least 6 px below it and 12 px above what
  follows; roster rows are at least 52 px tall; body and helper text keep a line height of at
  least 1.45 and headlines 1.25. When space runs short, text wraps or ellipsizes or a secondary
  element drops; padding and gaps never compress.
gui_related: true
gui_classification_reason: "Defines the grammar, sizes, typography and spacing of every wand module sheet."
split_recommended: false
depends_on: [DL-109, F3-531, F3-534]
unblocks: [F3-567, F3-568, F3-569, F3-570, F3-573, F3-574, F3-576, DR-044]
acceptance_criteria:
  - "Every wand configuration popup renders the head, hero, plate, questions and foot anatomy with one primary."
  - "No sheet scrolls in its common case at 1440 x 900 or 1280 x 800, and no sheet changes size while open."
  - "No kind or participant is drawn with initials or letters."
  - "Every wand-module surface uses the theme's own font and no separate display face."
  - "Every surface meets the J-2 minimums in all eight themes."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: wand_sheet_presentation_drift
reasoning_tier: high
context_scope: wand_modules_gui
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/assistant-chat-design.md
  - Plans/Collaborative_Workflows.md
node_compile_hint:
  mode: gui_surface_spec
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md (SHA-256 dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de) owner amendments J-1 and J-2, sections 2.2, 3.2, 3.5, 6.1-6.6"
  - "IMPACT-REGISTER B-FGS-01, B-FGS-05 (NOW part)"
  - "Plans/Decision_Log.md#DL-109"
preserved_exact_tokens:
  - "configuration sheet"
  - "plate"
  - "kind mark"
  - "cast mark"
  - "1120 x 780"
  - "900 x 720"
  - "J-1"
  - "J-2"
  - "MODAL, PART, SMSG, QMAX, PPROG, PFAIL, PSCHED and CDRY"
  - "BrainStorm has no Quick strategy"
negative_constraints:
  - "Do not change a behaviour clause of v4 through a presentation change."
  - "Do not draw initials, letters or photo avatars for participants."
  - "Do not add a display face or italic voice face."
  - "Do not compress padding or gaps below the J-2 minimums."
  - "Do not change the canon theme font tokens through this unit."
stale_retired_dispositions:
  - "2026-09-03 redesign section 10 'one shared modal shell' and 'pops out to a full panel' are superseded for presentation by this unit, F3-569 and ACD-480; the participant-row and per-kind behaviour sentences stay."
  - "Additive Correction v4 'Nothing here authorises a broad restyle' is superseded for the wand modules' surfaces by DL-109 and this unit."
owner_hints:
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-109, ContractName:Plans/DRY_Rules.md#DR-044, ContractName:Plans/assistant-chat-design.md#ACD-469

### F3-567 - Composer Stack With The Dock And Capability Marks

```yaml
plan_unit_id: F3-567
unit_type: gui_requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The composer stack, from the transcript down, is the floating Activity bar pill, the follow-up
  queue, the provider quota-wait strip, the dock (ACD-476), then the composer. The dock is at most
  three 34 px one-line items plus one overflow line; each line has the source's mark, its kind word
  and the owner's sentence, a clock when the owner gives one, and one action. It is transient: it
  shows only while it has items and takes no space otherwise. It reserves its own height in flow,
  never floats over the transcript, and never collides with the floating Activity bar pill or the
  decision host. The transcript's bottom padding (APR-004) is measured with the dock present, so the
  last transcript item is never under the pill. Under width pressure a dock line ellipsizes its
  sentence and keeps its action; the F3-534 priority order is unchanged. Among the active capability
  glyphs inside the text field, Back Seat Driver shows an ambient eye that reads the owner
  projection and is absent when Back Seat Driver is off, and the Crew glyph is the Crew kind mark.
  This unit does not change the stream footer pill.
gui_related: true
gui_classification_reason: "Places the dock and the new capability glyphs in the composer stack."
split_recommended: false
depends_on: [F3-532, ACD-476, F3-566]
unblocks: []
acceptance_criteria:
  - "The dock sits between the quota-wait strip and the composer and never overlaps the transcript, the Activity bar pill or the decision host."
  - "With the dock showing, the last transcript item clears the Activity bar pill at settled bottom scroll."
  - "The Back Seat Driver eye reflects the owner projection and is absent when Back Seat Driver is off."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: composer_stack_collision
reasoning_tier: high
context_scope: chat_composer_stack
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/assistant-chat-design.md
  - Plans/Back_Seat_Driver.md
node_compile_hint:
  mode: gui_surface_spec
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md (SHA-256 dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de) sections 3.2, 4.3 C14-C15, 7.8, 8.6, 10.1 item f"
  - "IMPACT-REGISTER B-FGS-03 (NOW part), B-FGS-12 (APR-004 part)"
preserved_exact_tokens:
  - "dock"
  - "quota-wait strip"
  - "decision host"
  - "APR-004"
  - "ambient eye"
negative_constraints:
  - "Do not float the dock over the transcript."
  - "Do not keep the dock's space when it has no items."
  - "Do not measure the transcript's bottom padding without the dock."
owner_hints:
  - Plans/FinalGUISpec.md
  - Plans/assistant-chat-design.md
```

ContractRef: ContractName:Plans/assistant-chat-design.md#ACD-476, ContractName:Plans/FinalGUISpec.md#F3-532, ContractName:Plans/Back_Seat_Driver.md

### F3-568 - Dialog Keyboard Scope And Escape Precedence

```yaml
plan_unit_id: F3-568
unit_type: gui_requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Keyboard in configuration sheets and the registry rules it needs (section 4.4). A sheet opens with
  focus in its hero field, the caret at the end; Tab follows the reading order from the hero through
  the roster and the questions to the foot, ending on Cancel and the primary. Enter in a multi-line
  field inserts a newline, and the composer's submit-key choice never applies inside a sheet.
  Confirm dialog (primary action) is one reserved, dialog-scoped binding on Ctrl+Enter (Cmd+Enter on
  macOS): it activates the sheet's one enabled primary and dispatches that button's own command, so
  it mints no command; it does nothing while a menu is open; and a warm (destructive) primary, such
  as a Revert, fires only when that button itself has focus. The same chord keeps meaning Send
  message in the composer, because the scopes differ, and Tab keeps its composer-scoped queue
  meaning. Escape closes one layer per press in the order menu, dialog, panel, then stop agent; a
  press consumed by a menu or a dialog never falls through to stopping an agent. Escape on a sheet
  runs the sheet's cancel path (UIW-025). In one place Escape is not the close button: a Crew Auto
  sheet opened from a Crew sheet goes back one step to the Crew sheet with its draft on Escape or
  Cancel, while the close button and the scrim close both; the registry help says Escape goes back
  one step. A dropdown opened from a sheet paints above it and returns focus to its trigger.
gui_related: true
gui_classification_reason: "Defines sheet keyboard behaviour and the scoped shortcut registry rules."
split_recommended: false
depends_on: [F3-566, UIW-025]
unblocks: []
acceptance_criteria:
  - "Ctrl/Cmd+Enter in a sheet dispatches exactly the command of the primary it activates and never a warm primary without focus."
  - "An Escape consumed by a menu or dialog never stops an agent."
  - "The shortcut registry lists Confirm dialog (primary action) as reserved and dialog-scoped and Tab as composer-scoped."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: shortcut_scope_collision
reasoning_tier: high
context_scope: keyboard_shortcuts
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/UI_Wiring_Rules.md
  - Plans/Commands_System.md
node_compile_hint:
  mode: gui_surface_spec
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md (SHA-256 dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de) sections 6.7, 8.2 (G-27), 8.15"
  - "IMPACT-REGISTER B-FGS-18"
preserved_exact_tokens:
  - "Confirm dialog (primary action)"
  - "Escape goes back one step"
  - "menu, dialog, panel, then stop agent"
negative_constraints:
  - "Do not register a new command for the confirm chord."
  - "Do not let a consumed Escape stop an agent."
  - "Do not fire a warm primary from the chord unless it has focus."
owner_hints:
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/UI_Wiring_Rules.md#UIW-025, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Commands_System.md

### F3-569 - Run Card Budgets Width Tiers Receipts And Run Views

```yaml
plan_unit_id: F3-569
unit_type: gui_requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  A collaboration run card is a system surface at the transcript's full content width, never inside
  an assistant bubble, and no transcript variant adds a side strip to it. One card per run changes
  density in place (Collaborative_Workflows CWR-019 owns the densities and their state mapping);
  this unit fixes its geometry. The card is its own width container with three tiers: S below
  360 px, M from 360 to 519 px, L from 520 px. Height budgets: live at most 340 px and needs-you,
  failed or finished at most 360 px at M and L; 360 px and 400 px at S; a receipt is one 44 px line.
  At every tier a card shows at most three lane rows (the rest summarised in one row that opens the
  full list), and every region has a fixed box and a line clamp, so a periodic tick changes only
  text; heights change only at state boundaries, with the reader's scroll anchor held. The S tier
  is a card inside a narrow chat (for example beside a pinned Activity Detail) and is not a
  minimum chat width. Only the newest live run in a thread shows its live face; older live runs
  are collapsed, and a needs-you decision survives the collapse. A finished run keeps its result
  face until the user's next message and then becomes a receipt. The one-line receipt is one
  grammar for every module (collaboration runs, Teach, Revert, a sent scheduled message, a
  dismissed advisor note): mark, headline, time and cost where they apply, and an open action; the
  run title shows only at L. Open Panel opens the run view, the editor document of ACD-480, which
  holds the full record. While a run's view is the active editor tab, the card's follow-on controls
  give way to one line saying where to decide, at the same height, so a control that changes the run
  is in one place at a time; decisions from an approval owner stay in the card. The collaboration
  hover cards show at most four run rows plus one overflow line (APR-007).
gui_related: true
gui_classification_reason: "Fixes run card geometry, receipts and the run view hand-off."
split_recommended: false
depends_on: [F3-566, ACD-480]
unblocks: []
acceptance_criteria:
  - "Card heights stay within the tier budgets under the periodic tick in all eight themes."
  - "No card shows more than three lane rows without its summary row."
  - "Every module's finished trace uses the one 44 px receipt grammar."
  - "A run-changing control is rendered in one place at a time while the run view is active."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: run_card_height_drift
reasoning_tier: high
context_scope: wand_modules_gui
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/Collaborative_Workflows.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: gui_surface_spec
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md (SHA-256 dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de) sections 7.1-7.2, 7.5, 7.8-7.10, 7.12-7.13"
  - "IMPACT-REGISTER B-FGS-05 (NOW part), B-FGS-10 (NOW part), B-FGS-12 (APR-007 part)"
preserved_exact_tokens:
  - "S below 360 px"
  - "44 px"
  - "run view"
  - "receipt"
  - "APR-007"
negative_constraints:
  - "Do not grow a card on a tick."
  - "Do not treat the S tier as a minimum chat width."
  - "Do not render a run-changing control in both the card and the run view at once."
owner_hints:
  - Plans/FinalGUISpec.md
  - Plans/Collaborative_Workflows.md
```

ContractRef: ContractName:Plans/Collaborative_Workflows.md, ContractName:Plans/assistant-chat-design.md#ACD-480

### F3-570 - Reply One-Line Attachments From The Wand Modules

```yaml
plan_unit_id: F3-570
unit_type: gui_requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  What a wand module attaches to an ordinary reply is one line each, never a card. The files row
  under a reply whose turn changed files ("Changed 3 files +5 −3 · Revert") is visible at rest and
  offers Revert per ACD-478. The quiet ticks live in the reply's meta row and follow that row's
  existing message-chrome visibility: a memory note taken (relaxing to its glyph alone after a few
  seconds) and verified once a check proves it, a tick when taught rules were included in the
  reply's context, and Sent on schedule on the user message a schedule sent. Each tick's detail is
  in the app hover card, never a native tooltip. A reply that changed files, took a note and used a
  rule grows by at most 40 px.
gui_related: true
gui_classification_reason: "Defines the one-line traces the wand modules leave on ordinary replies."
split_recommended: false
depends_on: [F3-566, ACD-478]
unblocks: []
acceptance_criteria:
  - "The files row is visible without hover; ticks follow the meta row's visibility."
  - "The traces on one reply add at most 40 px."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: reply_clutter
reasoning_tier: standard
context_scope: wand_modules_gui
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/assistant-chat-design.md
  - Plans/assistant-memory-subsystem.md
  - Plans/Scheduling_and_Quota_Resume.md
node_compile_hint:
  mode: gui_surface_spec
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md (SHA-256 dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de) sections 4.3 C22 and C24, 7.10, 8.7, 8.10"
  - "IMPACT-REGISTER B-FGS-04"
preserved_exact_tokens:
  - "files row"
  - "Sent on schedule"
  - "40 px"
negative_constraints:
  - "Do not render a reply trace as a card."
  - "Do not hide the files row behind hover."
owner_hints:
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/assistant-chat-design.md#ACD-478, ContractName:Plans/assistant-memory-subsystem.md, ContractName:Plans/Scheduling_and_Quota_Resume.md

### F3-571 - Back Seat Driver Advisor Note Placement

```yaml
plan_unit_id: F3-571
unit_type: gui_requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Emitted Back Seat Driver advice is an advisor note in the transcript, never a card: it sits at the
  step boundary between assistant messages and tool cards, hangs from the Back Seat Driver eye in
  the gutter with no surface fill, and has no roster and no track. It shows the severity glyph with
  its canonical word, a short title, one to four sentences, the line saying what it was checked
  against, and the owner's actions. A note's weight (a full note or a one-line aside) is stamped by
  the owner when the note is emitted (BSD-031) and never recomputed by the GUI. Terminal critical
  advice that was not reconfirmed keeps its stale and unreconfirmed labelling with its generation
  and a dashed full perimeter, never a side stripe; a dismissed note becomes one line. Back Seat
  Driver's catch-up, failure and safety-pause lines are single in-flow lines at the same boundary.
  Back_Seat_Driver BSD-030 owns the note's content and attribution; this unit places it. The
  Context status words are unchanged here.
gui_related: true
gui_classification_reason: "Places Back Seat Driver advice in the transcript."
split_recommended: false
depends_on: [F3-566]
unblocks: []
acceptance_criteria:
  - "No Back Seat Driver advice renders as a card, with a roster or with a track."
  - "Stale critical advice keeps its stale and unreconfirmed labelling."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: advice_presented_as_card
reasoning_tier: standard
context_scope: back_seat_driver_gui
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/Back_Seat_Driver.md
node_compile_hint:
  mode: gui_surface_spec
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md (SHA-256 dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de) sections 4.3 C21, 7.11, 8.6"
  - "IMPACT-REGISTER B-FGS-06 (NOW part)"
preserved_exact_tokens:
  - "advisor note"
  - "BSD-030"
  - "BSD-031"
  - "unreconfirmed"
negative_constraints:
  - "Do not render advice as a card."
  - "Do not recompute a note's weight in the GUI."
owner_hints:
  - Plans/FinalGUISpec.md
  - Plans/Back_Seat_Driver.md
```

ContractRef: ContractName:Plans/Back_Seat_Driver.md

### F3-572 - Dual-Copy Checklist For Expert And ELI5 Authored Copy

```yaml
plan_unit_id: F3-572
unit_type: gui_requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  This unit is the dual-copy checklist that assistant-chat-design section 2 and other owner
  documents cite as FinalGUISpec section 7.4.0; FinalGUISpec has no section 7.4.0, and that
  reference means this unit. For each in-scope authored copy item under the dual-copy rule of
  assistant-chat-design section 2.2 (tooltips and help, interviewer Q&A copy, and chat style
  instruction copy), the owning document records a stable copy key, an Expert variant and an ELI5
  variant. The two are behaviourally equivalent: Expert uses precise, compact system-model
  language and ELI5 uses plain language plus one concrete example. The app-level Interaction Mode
  (Expert/ELI5) selects the variant; chat-level ELI5 is separate. Dynamic external payloads, such as
  live LSP hover text or provider output, are not authored copy. An in-scope item missing either
  variant fails the checklist. This unit does not widen the in-scope set.
gui_related: true
gui_classification_reason: "Gives the dual-copy rule its checklist home."
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - "Every in-scope authored copy item has a key, an Expert variant and an ELI5 variant."
  - "References to FinalGUISpec section 7.4.0 resolve to this unit."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: dangling_reference
reasoning_tier: standard
context_scope: copy_variants
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: gui_surface_spec
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/canon-plans.md item C19 (hashes in SHA256SUMS beside it)"
  - "IMPACT-REGISTER B-ACD-13"
preserved_exact_tokens:
  - "dual-copy checklist"
  - "7.4.0"
  - "Expert"
  - "ELI5"
negative_constraints:
  - "Do not widen the dual-copy rule's scope through this checklist."
owner_hints:
  - Plans/FinalGUISpec.md
  - Plans/assistant-chat-design.md
```

ContractRef: ContractName:Plans/assistant-chat-design.md

### F3-573 - Schedule Message And Build At Sheets

```yaml
plan_unit_id: F3-573
unit_type: gui_requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Schedule Message and Build At are standard sheets of F3-566 and keep every field of section 13.
  Schedule Message: the hero is the message itself, shown as the future bubble it will become, with
  its attachments; a plate of the next 48 hours shows existing schedules and presets that write the
  real date and time inputs; one sentence states the resolved time in the schedule's own time zone,
  and a second when a daylight-saving change falls before it; the route row names who will answer
  and says the model is never swapped silently; the missed-time behaviour; and a primary that names
  the time. The composer keeps its text until the schedule commits (section 13). A link opens the
  Scheduled and Automations manager. Build At: a week plate of the build slots; one time or a
  nightly time slot; the days in words; whether to keep going next time; the wrap-up time; who
  builds it; what happens if the slot is missed; and the exact Plan version in Technical details.
  The Plan card's Schedule needs update notice stays, and the Plan card's schedule line belongs to
  Assistant_Plan_Runtime APR-071. Scheduling_and_Quota_Resume SQR-012 owns the scheduled message's
  transcript card and its state words.
gui_related: true
gui_classification_reason: "Defines what the two scheduling sheets show."
split_recommended: false
depends_on: [F3-566]
unblocks: []
acceptance_criteria:
  - "The Schedule Message sheet states the resolved time in the schedule's own time zone before commit."
  - "Build At keeps the exact Plan version reachable in Technical details."
  - "A Plan version change still shows Schedule needs update."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: schedule_time_ambiguity
reasoning_tier: standard
context_scope: scheduling_gui
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/Scheduling_and_Quota_Resume.md
  - Plans/Assistant_Plan_Runtime.md
node_compile_hint:
  mode: gui_surface_spec
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md (SHA-256 dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de) sections 8.7, 8.8"
  - "IMPACT-REGISTER B-FGS-07"
preserved_exact_tokens:
  - "Schedule needs update"
  - "future bubble"
  - "SQR-012"
negative_constraints:
  - "Do not show a scheduled time without its time zone."
  - "Do not drop the Schedule needs update notice."
owner_hints:
  - Plans/FinalGUISpec.md
  - Plans/Scheduling_and_Quota_Resume.md
```

ContractRef: ContractName:Plans/Scheduling_and_Quota_Resume.md, ContractName:Plans/Assistant_Plan_Runtime.md

### F3-574 - Revert Confirm Sheet And Memory Chat Traces

```yaml
plan_unit_id: F3-574
unit_type: gui_requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Revert Last Agent Edit has four entry points: the wand row, Changes, the message overflow and the
  files row under the reply that changed files. All open one compact confirm sheet (F3-566) over
  the turn's change manifest, whose file list scrolls inside itself past five files. Each row names
  the file, a plain verb and its counts; a file the user changed since is marked on its row with a
  route that only looks; the sheet promises one more check right before reverting. The foot holds
  Cancel and a warm primary naming the count, which the confirm chord fires only when it has focus
  (F3-568). An ineligible target shows its reason and no primary. The outcome follows ACD-478: the
  files row's rewind motion plays only after a durable restored_clean, a conflict gets no shake and
  says nothing was touched, and each outcome leaves one receipt line (F3-569). The word is always
  Revert, never Undo, Rollback or Rewind. Memory in the chat is never a card and never a pop-up: a
  quiet tick in the reply's meta row when a note is taken, one verified tick when a check proves it,
  and no noise when a note goes out of date (F3-570); assistant-memory-subsystem AMS-047 owns the
  one memory line that asks the user to review a proposal. This satisfies section 14's rule that
  ordinary automatic memory produces no constant pop-up.
gui_related: true
gui_classification_reason: "Defines the Revert confirm sheet and the memory traces in the chat."
split_recommended: false
depends_on: [ACD-478, F3-566, F3-570]
unblocks: []
acceptance_criteria:
  - "Every Revert entry point opens the same confirm sheet and none dispatches a revert by itself."
  - "The rewind plays only after a durable restored_clean."
  - "Automatic memory adds no card and no pop-up to the chat."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: premature_revert_feedback
reasoning_tier: high
context_scope: revert_and_memory_gui
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/assistant-chat-design.md
  - Plans/assistant-memory-subsystem.md
node_compile_hint:
  mode: gui_surface_spec
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md (SHA-256 dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de) sections 8.10, 8.12"
  - "IMPACT-REGISTER B-FGS-08 (NOW part)"
preserved_exact_tokens:
  - "Revert Last Agent Edit"
  - "restored_clean"
  - "never Undo, Rollback or Rewind"
  - "AMS-047"
negative_constraints:
  - "Do not revert from an entry point without the confirm sheet."
  - "Do not show a memory card or pop-up in the chat."
owner_hints:
  - Plans/FinalGUISpec.md
  - Plans/assistant-chat-design.md
```

ContractRef: ContractName:Plans/assistant-chat-design.md#ACD-478, ContractName:Plans/assistant-memory-subsystem.md

### F3-575 - Chat Header Title States

```yaml
plan_unit_id: F3-575
unit_type: gui_requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The chat header title shows the naming states of ACD-479 without pills or a modal: New chat with a
  shimmer on the words while naming is pending, the title once named (it replaces New chat in place,
  without a layout jump), a lock glyph while the user-named lock holds, and a warning glyph when
  naming is unavailable. Each glyph's hover says why in the naming outcome's plain sentence and
  offers the next step: the regenerate action for a locked title, and the title policy for an
  unavailable model. In the thread menu the regenerate action sits directly under Rename and is
  disabled with its reason when the policy is off or the model is unavailable. A title-generation
  failure still leaves New chat and is reported in Details and Usage (section 15). This unit does
  not change the regenerate action's label.
gui_related: true
gui_classification_reason: "Defines how the chat header shows naming state."
split_recommended: false
depends_on: [ACD-479]
unblocks: []
acceptance_criteria:
  - "The header shows the naming, locked and unavailable states with a hover reason and no pill or modal."
  - "The regenerate action sits directly under Rename and is disabled with its reason when naming cannot run."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: silent_title_state
reasoning_tier: standard
context_scope: chat_titles
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: gui_surface_spec
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md (SHA-256 dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de) section 8.14 (G-33, G-34)"
  - "IMPACT-REGISTER B-FGS-09 (NOW part)"
preserved_exact_tokens:
  - "New chat"
  - "directly under Rename"
  - "ACD-479"
negative_constraints:
  - "Do not report a naming failure in a modal or a pill."
owner_hints:
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/assistant-chat-design.md#ACD-479

### F3-576 - Additive Correction v4 Wording For The Wand Module Surfaces

```yaml
plan_unit_id: F3-576
unit_type: gui_requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Additive Correction v4's MODAL, PART, SMSG and CDRY-006 rules apply to the redesigned surfaces
  with these readings. MODAL: the modals are the configuration sheets of F3-566, and committing
  Crew Auto changes a project rule, not a run, so it creates no run card. PART: the full panel is
  the run view, the editor document of ACD-480; run cards, Activity and the run view expose partial,
  failed and waived counts. SMSG: each transcript presentation of a scheduled message prints its
  state word (Scheduled, Held, Sent, Canceled, Failed or Expired) first, then the time and the
  rest. CDRY-006: the redesign's visual actions are view state with no domain command: a run card's
  density and expand state and its More row, a sheet's Advanced page and hover-to-light, a run
  view's tab and selected participant, the Revert document's comparison switch, dock visibility and
  reveal, and Cancel, close and Escape on a collaboration sheet.
gui_related: true
gui_classification_reason: "Carries the v4 transaction and view-state rules onto the redesigned surfaces."
split_recommended: false
depends_on: [F3-566, ACD-480]
unblocks: []
acceptance_criteria:
  - "Committing Crew Auto creates no run card."
  - "A scheduled message's transcript presentations lead with the state word."
  - "None of the listed visual actions registers a domain command."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: presentation_action_becomes_command
reasoning_tier: standard
context_scope: wand_modules_gui
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/Commands_System.md
node_compile_hint:
  mode: gui_surface_spec
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md (SHA-256 dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de) sections 7.9, 8.2, 8.7, 8.15"
  - "IMPACT-REGISTER B-FGS-11"
preserved_exact_tokens:
  - "MODAL"
  - "PART"
  - "SMSG"
  - "CDRY-006"
  - "Scheduled"
  - "Held"
negative_constraints:
  - "Do not register a domain command for a listed view-state action."
owner_hints:
  - Plans/FinalGUISpec.md
  - Plans/Commands_System.md
```

ContractRef: ContractName:Plans/FinalGUISpec.md#CDRY-006, ContractName:Plans/Commands_System.md

### F3-577 - Wand Rows For Back Seat Driver And Revert

```yaml
plan_unit_id: F3-577
unit_type: gui_requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  In the wand, the Back Seat Driver row shows the committed mode from the owner projection as its
  shortcut text in title case (Off, Auto or On, never lowercase) and carries a chevron, because it
  opens its sidecar; it is never a local checkbox. The Revert Last Agent Edit row carries a helper
  line that states its eligibility in words, for example Nothing to revert yet or Already reverted,
  read from the same eligibility the files row uses (ACD-478). The rest of the wand's contents are
  unchanged by this unit.
gui_related: true
gui_classification_reason: "Defines two wand rows' visible state."
split_recommended: false
depends_on: [F3-531, ACD-478]
unblocks: []
acceptance_criteria:
  - "The Back Seat Driver row's shortcut text matches the committed mode in title case."
  - "The Revert row's helper states eligibility from the same source as the files row."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: wand_row_state_drift
reasoning_tier: standard
context_scope: assistant_redesign_menus
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/Back_Seat_Driver.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: gui_surface_spec
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md (SHA-256 dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de) sections 8.6 (G-21), 8.12"
  - "IMPACT-REGISTER B-FGS-02 (NOW part)"
preserved_exact_tokens:
  - "Off, Auto or On"
  - "Nothing to revert yet"
negative_constraints:
  - "Do not render the Back Seat Driver mode as a local checkbox."
owner_hints:
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-531, ContractName:Plans/Back_Seat_Driver.md, ContractName:Plans/assistant-chat-design.md#ACD-478
