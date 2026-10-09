# Shard 082: Wand Modules Redesign Addendum (2026-09-27)

Source: `Plans/FinalGUISpec.md`

Source lines: L38723-L39931

Source SHA256: `58941d4ebe9ae7d599f3e617ef8f5dca6182162d0a28d17cb4f4a0d576df6dac`

---

## Wand Modules Redesign Addendum (2026-09-27)

This addendum is the GUI contract for the redesigned Assistant wand popups and their in-chat presence, under Jared's instruction of 2026-09-27 and his amendments J-1 and J-2 (DL-109). Its source is the frozen design specification `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md` (SHA-256 `dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de`); the 5.6 Pro concept is source lineage only, and its class names, keys and harness hooks are not canon. Behaviour stays with its owners: `Plans/assistant-chat-design.md` ACD-476 through ACD-480, `Plans/Collaborative_Workflows.md`, `Plans/Back_Seat_Driver.md`, `Plans/Scheduling_and_Quota_Resume.md` and `Plans/assistant-memory-subsystem.md`. The transcript family map and the accent budget stay with ACD-469 and F3-562 (DR-043), and DR-044 names this addendum as the single owner of the wand modules' presentation grammar. Anything the units below leave unstated waits for Jared's answer and is not implied. F3-578 to F3-580 and the later amendments to F3-566, F3-567, F3-569, F3-571 and F3-575 compile the answers Jared gave on the decision cards (DL-110, DL-111, DL-114, DL-119, DL-122, DL-123, DL-127, DL-129 and DL-134), and F3-566 also states the per-family motion principle of DL-113 as the lead's ruling applied it. The lead's rulings on DL-120 and DL-116 are compiled too: F3-578, F3-531's amendment line, section 3 and the v4 MODAL paragraph make a chat's Crew Auto check the only per-chat Crew permission control, and F3-570 and F3-579 carry the reply's rule note (Followed, or Missed when a check failed). ELI5 is compiled as Jared confirmed it on 2026-09-27 (DL-126): F3-581 is its sheet, quick dot, reply tick and per-reply "Explain this reply simply" action, and F3-566, F3-570, F3-572, F3-531's and F3-532's amendment lines and sections 3, 4, 5 and 14 say the same in place. DL-138 settles the theme typography (F3-430) and the minimum chat width (F3-569).

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
  first and focused. Then a plate, a flat drawing of who is involved and where the result goes (in
  the four collaboration kinds, the cast plate of F3-595, DL-149), over the roster or the module's
  equivalent; then the questions, numbered only where the order is real (1 to 4 in the four
  collaboration kinds, 1 to 3 in Crew Auto), each number drawn as a step tile (F3-592, DL-148), and
  unnumbered elsewhere; the promise lines saying what won't happen, where the module has any (the
  Schedule Message sheet has none, DL-148); and one Advanced entry that opens as a page inside the
  same sheet. Every
  control has a visible label and one helper line; options with descriptions use the preserved
  dropdown trigger, and each description names the real difference between the options (for
  example Single Agent against Multi-Pass Review, or the Deep Plan strategies Thorough, Exhaustive
  and BrainStorm; BrainStorm has no Quick strategy); a disabled control prints its reason in words. The foot holds the read-back
  sentence, always true for the current settings, the estimate line (never $0.00), Cancel and one
  primary naming a verb, the canonical name and a count; a disabled primary prints its reason, and
  a refused Start replaces the read-back with the refusal and a route to the control that fixes it.
  A sheet whose changes apply at once shows only Done. Every sheet sits over a flat scrim. On the Skia GPU path a sheet is frosted glass, the extra blur of DL-114 drawn by the Skia renderer extensions (DL-139, F3-582); on the Skia CPU raster it is a solid surface, and Glass keeps its near-opaque glass-coloured panel. The scrim is never blurred, and
  F3-431's blur budget admits this sheet blur and nothing more (DL-139). Motion (DL-113, DL-115): each theme family moves with
  its own motion personality, aligned with the transcript's motion voices of ACD-475
  (Basic: ink; Friendly: hop; Glass: depth; Retro: type), so a sheet's opening and closing and an
  in-chat card's changes take their family's personality. Where a card takes part in a transcript
  beat (its family entrance, the fold), ACD-475 governs and the voice changes only path, easing and
  texture, never timing or order. This contract states the principle only: the per-family duration
  and easing values are the design foundation's tokens, recorded at the concept's closing step, and
  are not canon values. Reduce Motion lands every change at its end state instantly in every family.
  Sizes are fixed per sheet: wide 1120 x 780
  (the collaboration kinds, the Scheduled and Automations manager, Memory), standard 900 x 720 (Back
  Seat Driver, Schedule Message, Build At, Teach) and compact 720 wide at a fixed height per sheet
  (Revert, ELI5 and the small raw-data and evidence dialogs; F3-581 gives ELI5's), always clamped inside the window (at most
  its width less 48 px and its height less 40 px). A sheet never resizes or re-centres while open.
  The common case never scrolls at 1440 x 900 or 1280 x 800: the plate yields first as the roster
  grows, showing its richest mode that fits and never scaled to fit (F3-595, DL-149), and grows
  into spare height when the column is short; the roster scrolls in its own region only at 7 or 8
  helpers with Add a helper kept visible; the side column scrolls only below 1280 x 800; the hero
  field scrolls inside itself past three lines; below a 900 px sheet width the body becomes one
  column that scrolls inside the sheet with head and foot fixed; nothing overflows sideways.
  Hovering or focusing a control lights the plate parts and read-back phrases it affects and dims
  the others, with no re-render. Kinds are told apart by a kind mark drawn by shape, and each
  participant by its puppet, which replaced the cast mark (F3-594, DL-149): a role prop, the theme
  family's material and a puppet-drawn state, never initials or letters. Nothing draws pills or capsules, side strips or vertical rules beside a
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
  DL-138 confirms this scope: theme durations govern sheets and a card's own changes; transcript
  entrances retain ACD-475's shared timing and order. Wand cards that opt out of the family entrance
  do not acquire a second entrance animation.
gui_related: true
gui_classification_reason: "Defines the grammar, sizes, typography and spacing of every wand module sheet."
split_recommended: false
depends_on: [DL-109, DL-113, DL-114, DL-115, DL-139, DL-148, DL-149, ACD-475, F3-431, F3-531, F3-534, F3-582]
unblocks: [F3-567, F3-568, F3-569, F3-570, F3-573, F3-574, F3-576, F3-579, DR-044]
acceptance_criteria:
  - "Theme timing never overrides the shared timing or order of a transcript entrance."
  - "Every wand configuration popup with a committing primary renders the head, hero, plate, questions and foot anatomy with one primary; a sheet whose changes apply at once (the ELI5 sheet, F3-581) keeps the head, plate and foot, may have no hero or questions, and its foot shows only Done."
  - "No sheet scrolls in its common case at 1440 x 900 or 1280 x 800, and no sheet changes size while open."
  - "No kind or participant is drawn with initials or letters."
  - "Every wand-module surface uses the theme's own font and no separate display face."
  - "Every surface meets the J-2 minimums in all eight themes."
  - "A sheet uses a backdrop blur only on the Skia GPU path and is a solid surface on the Skia CPU raster; no scrim uses a backdrop blur in any theme."
  - "Each theme family's sheets and in-chat cards move with that family's motion personality, and a card's transcript beats keep ACD-475's shared timing and order."
  - "With Reduce Motion on, every sheet and card change lands at its end state instantly in every family."
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
  - "Plans/Decision_Log.md#DL-138 (owner answers, 2026-09-29)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md (SHA-256 dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de) owner amendments J-1 and J-2, sections 2.2, 3.2, 3.5, 6.1-6.6"
  - "IMPACT-REGISTER B-FGS-01, B-FGS-05 (NOW part)"
  - "Plans/Decision_Log.md#DL-109"
  - "Plans/Decision_Log.md#DL-114 (the solid surface, compiled 2026-09-27; IMPACT-REGISTER B-FGS-17, card n05, E-24)"
  - "Plans/Decision_Log.md#DL-139 (sheet frosted on the Skia GPU path, solid on the CPU raster; owner confirmation 2026-10-01)"
  - "Plans/Decision_Log.md#DL-113 (the per-family motion principle, the lead's ruling of 2026-09-27 on card n04, E-22; the token values stay out of canon, IMPACT-REGISTER B-FGS-19 OUT)"
preserved_exact_tokens:
  - "DL-138"
  - "configuration sheet"
  - "flat scrim"
  - "plate"
  - "kind mark"
  - "cast mark"
  - "1120 x 780"
  - "900 x 720"
  - "J-1"
  - "J-2"
  - "MODAL, PART, SMSG, QMAX, PPROG, PFAIL, PSCHED and CDRY"
  - "BrainStorm has no Quick strategy"
  - "motion personality"
  - "Basic: ink; Friendly: hop; Glass: depth; Retro: type"
negative_constraints:
  - "Do not change a behaviour clause of v4 through a presentation change."
  - "Do not draw initials, letters or photo avatars for participants."
  - "Do not add a display face or italic voice face."
  - "Do not compress padding or gaps below the J-2 minimums."
  - "Do not change the canon theme font tokens through this unit."
  - "Do not raise F3-431's blur budget beyond the sheet blur DL-139 admits, and never blur the scrim."
  - "Do not write per-family motion durations or easing values into canon; they are the design foundation's tokens."
  - "Do not change a transcript beat's timing or order per family (ACD-475)."
stale_retired_dispositions:
  - "2026-09-03 redesign section 10 'one shared modal shell' and 'pops out to a full panel' are superseded for presentation by this unit, F3-569 and ACD-480; the participant-row and per-kind behaviour sentences stay."
  - "Additive Correction v4 'Nothing here authorises a broad restyle' is superseded for the wand modules' surfaces by DL-109 and this unit."
  - "DL-139 replaces the solid-sheet outcome of DL-114's 2026-09-27 check on the Skia GPU path: once the Skia renderer extensions draw backdrop blur, sheets are frosted there and stay solid on the CPU raster."
  - "The cast mark drawn from silhouette, spike and hue with its state as a ring is replaced by the agent puppet of F3-594, and the plate's row-count thresholds (full at 1 to 3 rows, compact at 4, a strip at 5 or 6, one sentence at 7 or 8) by F3-595's fit rule (DL-149)."
  - "The promise lines are drawn only where a module has any; the Schedule Message sheet has none (DL-148)."
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
  The ELI5 quick dot is the ELI5 kind mark among these glyphs, present lit or muted (F3-581, DL-126).
  The dock and the per-reply files row replace the stream footer pill's helpers and files chips
  (ACD-482, DL-129); no summary of helpers or file changes stacks above the composer beside the dock.
gui_related: true
gui_classification_reason: "Places the dock and the new capability glyphs in the composer stack."
split_recommended: false
depends_on: [F3-532, ACD-476, ACD-482, F3-566]
unblocks: []
acceptance_criteria:
  - "No helpers or file-changes chip renders above the composer."
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
  - "IMPACT-REGISTER B-FGS-03 (NOW part; the footer pill part compiled 2026-09-27 from DL-129), B-FGS-12 (APR-004 part)"
preserved_exact_tokens:
  - "dock"
  - "files chips"
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
  Cancel, while the close button and the scrim close both; the registry help says Escape goes back one step. A dropdown opened from a sheet paints above it and returns focus to its trigger; clicking its own trigger again closes it, clicking another dropdown's trigger in the same sheet switches to that dropdown, and each trigger reports whether its list is open (amended 2026-10-08, DL-145).
gui_related: true
gui_classification_reason: "Defines sheet keyboard behaviour and the scoped shortcut registry rules."
split_recommended: false
depends_on: [F3-566, UIW-025, DL-145]
unblocks: []
acceptance_criteria:
  - "Ctrl/Cmd+Enter in a sheet dispatches exactly the command of the primary it activates and never a warm primary without focus."
  - "An Escape consumed by a menu or dialog never stops an agent."
  - "The shortcut registry lists Confirm dialog (primary action) as reserved and dialog-scoped and Tab as composer-scoped."
  - "A second click on a sheet dropdown's own trigger closes it (DL-145)."
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
  this unit fixes its geometry. The card is its own width container with three tiers: S below 360 px, M from 360 to 519 px, L from 520 px. Height budgets: live at most 340 px and needs-you,
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
  run title shows only at L. When a card is collapsed, or narrower than 520 px (the S and M tiers),
  Open Panel, Message and More may sit behind Expand, and below 520 px the helper count may move into
  the card's hover card (DL-123). On a result face or a receipt, Message moves into More as a
  disabled item with its reason printed ("This {Kind} has finished, so it can't take messages. Ask
  the assistant instead."), never only in a tooltip. The Coordinator's puppet (the crowned one,
  F3-594) uses the text colour or its seat colour, never the accent (DL-111). Open Panel opens the run view, the editor document of ACD-480, which
  holds the full record. The run view is headed by the run's cast plate in live states (F3-595), and
  neither a run card nor a run view shows Technical details (DL-149). While a run's view is the active editor tab, the card's follow-on controls
  give way to one line saying where to decide, at the same height, so a control that changes the run
  is in one place at a time; decisions from an approval owner stay in the card. The collaboration
  hover cards show at most four run rows plus one overflow line (APR-007).
  The chat pane beside an open plan or document has a minimum width of 360 px (DL-138;
  Assistant_Plan_Runtime APR-014). The card's S tier measures its own content box after padding and
  remains available below 360 px; it does not lower the chat pane minimum.
gui_related: true
gui_classification_reason: "Fixes run card geometry, receipts and the run view hand-off."
split_recommended: false
depends_on: [F3-566, ACD-480, DL-111, DL-123, DL-149]
unblocks: []
acceptance_criteria:
  - "The editor/chat split preserves a 360 px minimum chat pane while card tiers continue to measure card content width."
  - "A collapsed or sub-520 px card reaches Open Panel, Message and More through Expand; a finished run's Message prints why it is disabled."
  - "The Coordinator's mark never paints the accent."
  - "No run card or run view shows Technical details (DL-149)."
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
  - "Plans/Decision_Log.md#DL-138 (owner answers, 2026-09-29)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md (SHA-256 dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de) sections 7.1-7.2, 7.5, 7.8-7.10, 7.12-7.13"
  - "IMPACT-REGISTER B-FGS-05 (NOW part; the density facts compiled 2026-09-27 from DL-123, card p05, E-05), B-FGS-10 (NOW part), B-FGS-12 (APR-007 part)"
  - "Plans/Decision_Log.md#DL-111 (card n02, E-17: the Coordinator's colour)"
preserved_exact_tokens:
  - "360 px"
  - "S below 360 px"
  - "behind Expand"
  - "never the accent"
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
  seconds) and verified once a check proves it; the rule note for taught rules; Sent on schedule
  on the user message a schedule sent; and Simple explanation on a reply written in Simple (F3-581, DL-126). The rule note follows DL-116 as the design lead's ruling of
  2026-09-27 applied it and assistant-memory-subsystem AMS-053 defines following. It reads
  "Followed 1 of your rules" for the included rules whose check the finished reply passed (the
  number is how many); inclusion alone never earns it, and a rule whose check could not run earns
  no tick. When any included rule failed its check the reply shows "Missed 1 of your rules" (the
  number is how many failed), never hidden behind a Followed count, with a way to see which rule
  was missed and a way to ask for a fix, which starts only when the user asks. A reply with no
  passed or failed check shows no rule note. Each tick's and note's detail is in the app hover
  card, never a native tooltip. A reply that changed files, took a note and carries a rule note
  grows by at most 40 px.
gui_related: true
gui_classification_reason: "Defines the one-line traces the wand modules leave on ordinary replies."
split_recommended: false
depends_on: [F3-566, ACD-478, DL-116, AMS-053]
unblocks: []
acceptance_criteria:
  - "The files row is visible without hover; ticks follow the meta row's visibility."
  - "The traces on one reply add at most 40 px."
  - "The rule note counts only included rules whose check the finished reply passed; a rule whose check could not run earns no tick."
  - "A failed check shows \"Missed 1 of your rules\" with a way to see which rule and a way to ask for a fix, and is never hidden behind a Followed count."
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
  - "Plans/Decision_Log.md#DL-116 (card n07, E-36; the design lead's ruling of 2026-09-27)"
  - "Plans/assistant-memory-subsystem.md#AMS-053"
preserved_exact_tokens:
  - "files row"
  - "Sent on schedule"
  - "40 px"
  - "Followed 1 of your rules"
  - "Missed 1 of your rules"
  - "AMS-053"
  - "Simple explanation"
negative_constraints:
  - "Do not render a reply trace as a card."
  - "Do not hide the files row behind hover."
  - "Do not show a rule as followed because it was included, or because its check could not run."
  - "Do not show Used in place of the rule note."
owner_hints:
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/assistant-chat-design.md#ACD-478, ContractName:Plans/assistant-memory-subsystem.md#AMS-053, ContractName:Plans/Decision_Log.md#DL-116, ContractName:Plans/Scheduling_and_Quota_Resume.md

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
  Back_Seat_Driver BSD-030 owns the note's content and attribution; this unit places it. Back Seat
  Driver shows the plain status words (DL-110): Up to date where canon said Caught up,
  Double-checking for Finding held, and Paused: usage limit reached for Quota paused; the official
  word is not printed beside the plain one. Double-checking is limited to the Context row and Context
  Details. While finding_held, the composer instead prints Reviewing by selecting the reviewing entry
  of the same owner table without changing context_state or revealing a held finding (DL-138).
  Back_Seat_Driver BSD-035 owns that table and its surface selection.
gui_related: true
gui_classification_reason: "Places Back Seat Driver advice in the transcript."
split_recommended: false
depends_on: [F3-566, DL-110]
unblocks: []
acceptance_criteria:
  - "No Back Seat Driver advice renders as a card, with a roster or with a track."
  - "The Context row shows Up to date, Double-checking and Paused: usage limit reached, not the official words."
  - "While finding_held, the composer prints Reviewing; Double-checking remains only in Context and its details."
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
  - "IMPACT-REGISTER B-FGS-06 (NOW part; the status list compiled 2026-09-27 from DL-110, card n01, E-10)"
preserved_exact_tokens:
  - "advisor note"
  - "Up to date"
  - "Double-checking"
  - "Paused: usage limit reached"
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
  variant fails the checklist. This unit does not widen the in-scope set. The plain helper lines
  under and beside controls are outside the checklist: among the copy of controls, only tooltips and help carry the Expert and ELI5 pair (DL-126).
gui_related: true
gui_classification_reason: "Gives the dual-copy rule its checklist home."
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - "Every in-scope authored copy item has a key, an Expert variant and an ELI5 variant."
  - "References to FinalGUISpec section 7.4.0 resolve to this unit."
  - "No helper line under or beside a control is listed with an Expert and an ELI5 variant."
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
  - "Plans/Decision_Log.md#DL-126 (card p08, E-11, part 3: dual copy only for tooltips and help; Jared's confirmation of 2026-09-27)"
preserved_exact_tokens:
  - "dual-copy checklist"
  - "7.4.0"
  - "Expert"
  - "ELI5"
  - "only tooltips and help carry the Expert and ELI5 pair"
negative_constraints:
  - "Do not widen the dual-copy rule's scope through this checklist."
  - "Do not give helper lines under controls an Expert and an ELI5 variant."
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
  its attachments; a plate of the next 48 hours shows existing schedules, presets that write the
  real date and time inputs, and the send marker, which is also the send-time control (drag, press or
  keys, never in the past; F3-592, DL-148); one sentence states the resolved time in the schedule's own time zone,
  and a second when a daylight-saving change falls before it; the route row names who will answer
  and says the model is never swapped silently; the missed-time behaviour; and a primary that names
  the time. The composer keeps its text until the schedule commits (section 13). A link opens the
  Scheduled and Automations manager. The Schedule Message sheet has no promise lines and no Technical
  details (DL-148). Build At: a week plate of the build slots; one time or a
  nightly time slot; the days in words; whether to keep going next time; the wrap-up time; who
  builds it; what happens if the slot is missed; and the exact Plan version it binds, named in the
  sheet's lead, with the Plan's id, version and hash in the Plan's Details (PDET-001) and no Technical
  details on the sheet (DL-148).
  The Plan card's Schedule needs update notice stays, and the Plan card's schedule line belongs to
  Assistant_Plan_Runtime APR-071. Scheduling_and_Quota_Resume SQR-012 owns the scheduled message's
  transcript card and its state words.
gui_related: true
gui_classification_reason: "Defines what the two scheduling sheets show."
split_recommended: false
depends_on: [F3-566, DL-148]
unblocks: []
acceptance_criteria:
  - "The Schedule Message sheet states the resolved time in the schedule's own time zone before commit."
  - "Build At names the exact Plan version it binds, and the Plan's id, version and hash are reachable through the Plan's Details."
  - "The Schedule Message sheet shows no promise lines and no Technical details."
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
  failure still leaves New chat and is reported in Details and Usage (section 15). The regenerate
  action reads Name it for me wherever it is shown, in place of Regenerate Title (DL-134).
gui_related: true
gui_classification_reason: "Defines how the chat header shows naming state."
split_recommended: false
depends_on: [ACD-479, DL-134]
unblocks: []
acceptance_criteria:
  - "The header shows the naming, locked and unavailable states with a hover reason and no pill or modal."
  - "The regenerate action is labelled Name it for me."
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
  - "IMPACT-REGISTER B-FGS-09 (NOW part; the label compiled 2026-09-27 from DL-134, card p19)"
preserved_exact_tokens:
  - "New chat"
  - "Name it for me"
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

### F3-578 - Wand Multi-Agent Sidecar Gains Crew Auto Settings

```yaml
plan_unit_id: F3-578
unit_type: gui_requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The wand's Multi-Agent sidecar lists Crew…, Chat Room…, a divider, the checkable Crew Auto, Crew
  Auto settings… and Manage Defaults… (DL-119). Crew Auto settings… dispatches the existing
  cmd.chat.crew_auto.open_config and opens the Crew Auto configuration sheet whether or not Crew Auto
  is checked; opening it changes nothing (UIW-025), and only the sheet's primary commits the
  project's Crew Auto rules and team, through cmd.chat.crew_auto.set with scope project (CWR-038).
  Manage Defaults… keeps its name and its route. The rest of F3-531 stands: Review keeps its entry
  point in the primary mode menu and BrainStorm stays under Deep Plan, and neither becomes a wand
  row. The checkable Crew Auto is the assistant's permission to start a Crew by itself when it
  needs one, on by default for a project (DL-120, 2026-09-27), and it is the chat's only Crew
  permission control. The check shows the value in force for this chat: the chat's own override
  when it has one, otherwise the project value. Checking or unchecking it dispatches
  cmd.chat.crew_auto.set with scope thread, which sets only this chat's override; the override is
  committed before the check changes, it never changes the project value or another chat, and the
  check does not open the sheet first. The check never starts a Crew itself: a Crew starts only
  when the assistant asks for one, Crew Auto is on for the chat and the Collaborative Workflows
  evaluator (CWR-021) admits the request. Build With Crew on a Plan stays the user's own choice
  and does not depend on the check. The wand has no separate Allow Crews in this chat row: the
  redesign concept's per-chat switch is retired into the Crew Auto check. Turning the project
  default on is a change to the Crew Auto settings key's default, which Settings owns.
gui_related: true
gui_classification_reason: "Adds one row to the wand's Multi-Agent sidecar and states what the chat's Crew Auto check does."
split_recommended: false
depends_on: [F3-531, DL-119, DL-120, UIW-025]
unblocks: []
acceptance_criteria:
  - "The Multi-Agent sidecar shows Crew Auto settings… beside Manage Defaults…, and both keep their own routes."
  - "Crew Auto settings… opens the configuration sheet without checking or unchecking Crew Auto."
  - "The wand has no Review or BrainStorm row."
  - "The Crew Auto check shows the chat's own override when it has one, otherwise the project value."
  - "Checking or unchecking Crew Auto in a chat sends scope thread, changes the check only after the override is committed, and never changes the project value or opens the sheet."
  - "The wand has no Allow Crews in this chat row."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: wand_row_state_drift
reasoning_tier: standard
context_scope: assistant_redesign_menus
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/Collaborative_Workflows.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: gui_surface_spec
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md (SHA-256 dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de) section 8.2 (D-3)"
  - "IMPACT-REGISTER B-FGS-02 and B-ACD-04 (E-01 part); card p01, E-01"
  - "Plans/Decision_Log.md#DL-119"
  - "Plans/Decision_Log.md#DL-120 (card p02, E-02; the design lead's ruling of 2026-09-27)"
  - "Plans/Collaborative_Workflows.md#CWR-004, CWR-021 and CWR-038 (the Crew Auto permission, its evaluator and CrewAutoSetRequest scope)"
preserved_exact_tokens:
  - "Crew Auto settings…"
  - "Manage Defaults…"
  - "cmd.chat.crew_auto.open_config"
  - "Allow Crews in this chat"
  - "scope thread"
  - "CWR-021"
negative_constraints:
  - "Do not rename the Manage Defaults… row."
  - "Do not add Review or BrainStorm rows to the wand."
  - "Do not toggle Crew Auto from Crew Auto settings… without a committed configuration."
  - "Do not add a separate per-chat Allow Crews in this chat row."
  - "Do not let a chat's Crew Auto check change the project value or start a Crew by itself."
  - "Do not make Build With Crew depend on the Crew Auto check."
owner_hints:
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-119, ContractName:Plans/Decision_Log.md#DL-120, ContractName:Plans/FinalGUISpec.md#F3-531, ContractName:Plans/Collaborative_Workflows.md, ContractName:Plans/UI_Wiring_Rules.md#UIW-025

### F3-579 - Teach Sheet And Your Rules Document

```yaml
plan_unit_id: F3-579
unit_type: gui_requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Teach is a standard sheet of F3-566 and the only capture form: the wand's Teach…, /teach,
  natural-language intent and Save as a rule… all open it, prefilled with the rule text and its
  source, and there is no inline capture card in the chat (DL-127, ACD-477). Head: the Teach mark,
  Teach Puppet Master a rule and one lead sentence; in correct mode, Edit your rule. The hero is the
  rule field, with example rules that fill it. Under it one safety line says either that no password
  or key was spotted or, in the warm tone, that the text looks like a password or key and must be
  removed to save. The plate is three nested rings, This thread inside This project inside Every project, each a button with a helper; Every project stays disabled with its reason until the tick
  "It's safe to use in my other projects" is set, and in correct mode the wider rings are disabled
  because an edit cannot widen a rule. A Locked tick says only the user can change the rule
  (ACD-481). Beside them, the rule card shows the rule exactly as it will be saved, with its scope,
  lock and source message; when a similar rule exists, the old and new wording are shown side by
  side with a choice between Replace the old rule and Keep both, and saving waits for it. The foot
  holds Cancel and one primary, Save rule, Save and replace or Save as version 2. In the chat each
  change is one receipt line of F3-569's grammar: Rule saved, Rule updated to a new version, Rule
  turned off, with several saves in a row coalesced into one line. Your rules is an editor document
  (the taught memory document): one row per rule with its words, its scope, lock and version, a
  state word (In use, In use · locked, Replaced by v2, Turned off) and the actions Edit, Lock or
  Unlock, Turn off and From your message; Turn off asks inline (ACD-481), never in a modal. Teacher
  stays a Persona, and the sheet says Teach isn't the Teacher Persona. The note a reply carries for
  its taught rules is F3-570's rule note under DL-116 as AMS-053 defines following: it counts only
  rules whose check the finished reply passed, a failed check reads "Missed 1 of your rules" with a
  way to see which rule and a way to ask for a fix, and a check that could not run earns no tick.
  DL-138 confirms the final wording. Persisted AMS-053 check results drive the note on reopen: passed
  counts as Followed, failed counts as Missed and could_not_run earns no tick. A mixed result is one
  line, Missed first, for example "Missed 1 of your rules · followed 2". See which rule opens the
  saved check evidence as view state. Ask for a fix reuses cmd.review.send_findings_to_agent with
  the taught_rule_check source variant (UCC-172): it fills the source thread's empty composer, returns
  ComposerBufferResult, refuses composer_not_empty, and never sends or executes a fix. The user sends it.
gui_related: true
gui_classification_reason: "Defines the Teach sheet, its chat receipts and the Your rules document."
split_recommended: false
depends_on: [F3-566, ACD-477, ACD-481, DL-127, DL-116, F3-570]
unblocks: []
acceptance_criteria:
  - "Reopening retains the saved rule-check result, mixed results show one Missed-first line, and Ask for a fix only fills an empty composer until the user sends."
  - "Every Teach entry point opens the Teach sheet; no inline capture card renders in the chat."
  - "A reply's rule note never counts a rule as followed unless its check passed."
  - "Every project cannot be chosen without the safe-for-other-projects tick, and correct mode cannot widen the scope."
  - "A similar rule blocks saving until Replace the old rule or Keep both is chosen."
  - "Turn off in Your rules asks inline and never opens a modal."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: taught_memory_scope_or_secret_leak
reasoning_tier: standard
context_scope: teach_gui
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/assistant-chat-design.md
  - Plans/assistant-memory-subsystem.md
node_compile_hint:
  mode: gui_surface_spec
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-138 (owner answers, 2026-09-29)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md (SHA-256 dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de) section 8.11 (G-26, G-33, G-38)"
  - "IMPACT-REGISTER B-FGS-08 (Teach part); cards p09 (E-12) and p15 (E-32)"
  - "Plans/Decision_Log.md#DL-127"
  - "Plans/Decision_Log.md#DL-130"
  - "Plans/Decision_Log.md#DL-116 (card n07, E-36; the design lead's ruling of 2026-09-27)"
preserved_exact_tokens:
  - "composer_not_empty"
  - "ComposerBufferResult"
  - "taught_rule_check"
  - "cmd.review.send_findings_to_agent"
  - "Missed 1 of your rules · followed 2"
  - "could_not_run"
  - "failed"
  - "passed"
  - "Teach Puppet Master a rule"
  - "This thread"
  - "Every project"
  - "Keep both"
  - "Your rules"
  - "no inline capture card"
  - "Missed 1 of your rules"
negative_constraints:
  - "Do not render an inline capture card."
  - "Do not change the Persona to Teacher when Teach opens."
  - "Do not save while a similar rule's choice is unmade or the text looks like a secret."
owner_hints:
  - Plans/FinalGUISpec.md
  - Plans/assistant-chat-design.md
```

ContractRef: ContractName:Plans/assistant-chat-design.md#ACD-477, ContractName:Plans/assistant-chat-design.md#ACD-481, ContractName:Plans/Decision_Log.md#DL-127, ContractName:Plans/Decision_Log.md#DL-116, ContractName:Plans/assistant-memory-subsystem.md#AMS-053

### F3-580 - Compact Activity Detail For Collaboration Runs And Back Seat Driver Context

```yaml
plan_unit_id: F3-580
unit_type: gui_requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  A scoped exception to Jared's 2026-09-08 rollback (USER-REFERENCE-LAYOUT-ROLLBACK-20260908; APR-060,
  APR-061 and assistant-chat-design v3 item 20), allowed on 2026-09-27 for five surfaces only
  (DL-122), because each run's full detail lives in its run view (ACD-480). For Crew, BrainStorm,
  Review and Chat Room, the Activity Detail body is a short team list: the run title, the run's one
  true sentence, where the run is now, one 36 px row per helper (its puppet, F3-594, name and one state
  word, and no stand-in sentence, because no model stands in for a chosen helper, DL-121), then Open
  Panel and Message. It never repeats the run card or the kind's board. A click on
  one of these four domains' chip in the Activity bar reveals the newest card of that kind in the
  thread and marks it once; the rows of those domains' hover cards keep APR-006's routing into
  Activity Detail, pinned per APR-001, so Activity Detail stays reachable. Back Seat Driver's section
  of Context Details has a head (Back Seat Driver and Configure), three plain facts (the mode, the
  advisor model and Persona, and how watchful it is) and three native disclosures (Advisor notes,
  Session, Usage), with evidence as sentences and raw data behind Show raw data, and no metric-card
  grid and no pills. Every other Activity Detail family (Goal, To-Dos, Subagents, Changes, Artifacts)
  and every other Context Details section keeps the restored native card, panel and grid
  presentation, apart from the To-Do rows, which are DL-147's second scoped exception (F3-593).
gui_related: true
gui_classification_reason: "Defines the compact Activity Detail and Back Seat Driver Context Details surfaces."
split_recommended: false
depends_on: [ACD-480, F3-569, DL-121, DL-122]
unblocks: []
acceptance_criteria:
  - "The four collaboration kinds' Activity Detail shows the short team list and never the kind's board."
  - "No helper row in the short team list carries a stand-in sentence (DL-121)."
  - "A collaboration domain chip click reveals the newest card; its hover rows still open Activity Detail."
  - "Back Seat Driver's Context Details section has no metric-card grid and no pills."
  - "Goal, To-Dos, Subagents, Changes and Artifacts keep the native card and grid presentation, apart from the To-Do rows of F3-593 (DL-147)."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: rollback_exception_scope_creep
reasoning_tier: standard
context_scope: activity_detail
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/Collaborative_Workflows.md
  - Plans/Back_Seat_Driver.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: gui_surface_spec
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md (SHA-256 dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de) sections 7.13 (G-24), 8.6 (G-26)"
  - "IMPACT-REGISTER B-FGS-13 (APR-060), B-FGS-12 (chip click), B-ACD-05 (item 20); card p04, E-04"
  - "Plans/Decision_Log.md#DL-122"
  - "Plans/Decision_Log.md#DL-121 (no stand-in for a chosen helper; the design's stand-in sentence is not carried)"
preserved_exact_tokens:
  - "USER-REFERENCE-LAYOUT-ROLLBACK-20260908"
  - "APR-060"
  - "APR-061"
  - "short team list"
  - "no metric-card grid"
negative_constraints:
  - "Do not extend the exception beyond the four collaboration kinds and Back Seat Driver's Context Details; the To-Do rows' exception is DL-147's, stated in F3-593, not this unit's."
  - "Do not remove the hover-row route into Activity Detail."
owner_hints:
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-122, ContractName:Plans/assistant-chat-design.md#ACD-480, ContractName:Plans/Collaborative_Workflows.md, ContractName:Plans/Back_Seat_Driver.md

### F3-581 - ELI5 Sheet Quick Dot Reply Tick And Explain This Reply Simply

```yaml
plan_unit_id: F3-581
unit_type: gui_requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  ELI5's GUI, as Jared confirmed it on 2026-09-27 (DL-126); the behaviour is assistant-chat-design
  ACD-484. The wand's ELI5 row opens the ELI5 sheet and is not a check. The sheet is a compact sheet of F3-566 at 720 x 560 and never changes height while open (opening its disclosure fits
  inside the 560). Its choices apply at once, so its foot shows only Done. Head: the ELI5 kind mark
  (a speech bubble holding one short line), the title Explain things simply in this chat? and the
  lead sentence "Answers use everyday words and explain terms as they go. Your code, plans and files
  never change." The plate shows two voices side by side, Standard and Simple, each a short specimen
  of the same answer, over one shared code line that spans both and never moves; choosing a voice
  dispatches cmd.chat.eli5.set with off or on for this chat. Under the plate, Follow my usual setting dispatches cmd.chat.eli5.set with inherit, which deletes this chat's override. The one
  disclosure, How it's decided, draws the resolution order as a trace, All chats, then Chats in this
  project, then This chat, with the level that decides lit. The All chats node is the Explain Terms Everywhere setting and the Chats in this project node is that setting at project scope;
  both require Settings-owned commits, never a chat command, and the This chat node is the same
  cmd.chat.eli5.set as the plate. The project transaction is defined by SSYS-028. The retained All chats
  edit remains disabled with the Settings owner's reason while its app-wide persistence route conflicts
  with SSYS-002 and awaits pldg-20260927-001-wand-collab-workflows q-035; no global writer is inferred
  from this GUI requirement. The foot reads "Takes effect from your next message. Answers already here keep their wording." and, while a reply streams, says that reply keeps its current
  style. If the active chat changes while the sheet is open, the sheet changes nothing and reads
  "You switched chats. Open this again from the chat you want to change." Closing it returns focus
  to the wand trigger (UIW-025). The quick dot is the ELI5 kind mark among the composer's capability
  glyphs inside the text field, present in both of its states: lit while Simple explanations are in
  effect for the chat and muted while they are not. One click on it dispatches cmd.chat.eli5.set
  with on or off for this chat and never opens the sheet, and its app hover card says whether
  Simple explanations are on in this chat. In the transcript, a reply written in Simple carries the quiet Simple explanation tick in its meta row (F3-570), and a change-point divider reads
  Simple explanations from here or Back to standard explanations between the last reply in the old
  style and the first reply in the new one; no earlier reply changes. Each finished assistant reply's message actions may offer Explain this reply simply, which dispatches
  cmd.chat.eli5.explain_reply with that reply's message id; while the reply is still streaming the
  action is disabled and prints its reason. The one extra reply it writes lands at the end of the
  thread as an ordinary assistant reply, carries the Simple explanation tick, names and links the
  reply it explains, and adds no divider. The concept's fine print calling project defaults a
  preview feature is not canon. The command catalog's surface id for the sheet is eli5_sheet.
  The project-level general.interaction.eli5-default is persisted through Settings SSYS-028
  (DL-138), so Chats in this project is a real editable level, resolved below This chat and above All chats.
gui_related: true
gui_classification_reason: "Defines the ELI5 sheet, the quick dot and ELI5's traces in the chat."
split_recommended: false
depends_on: [F3-566, F3-567, F3-570, F3-572, ACD-484, DL-126, UIW-025]
unblocks: [ATS-065]
acceptance_criteria:
  - "The wand's ELI5 row opens a 720 x 560 compact sheet whose height never changes while open."
  - "Standard, Simple and Follow my usual setting dispatch cmd.chat.eli5.set with off, on and inherit for the active chat."
  - "The project node commits through Settings; the retained All chats edit requires its Settings-owned commit contract and stays disabled while ledger001 q-035 is open. Neither uses a chat command."
  - "The quick dot is present lit or muted, and one click switches this chat's ELI5 without opening the sheet."
  - "After any switch, every earlier reply's text is unchanged; only the divider and later replies show the new style."
  - "Explain this reply simply is disabled while the reply streams, and on a finished reply adds exactly one reply at the end of the thread."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: eli5_surface_drift
reasoning_tier: standard
context_scope: wand_modules_gui
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/assistant-chat-design.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: gui_surface_spec
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-138 (owner answers, 2026-09-29)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md (SHA-256 dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de) sections 3.2 (the ELI5 compact height), 4.3 C23, 7.10, 8.13 and its amendments G-21 and G-34, 10.1 item f"
  - "IMPACT-REGISTER B-FGS-02 (the ELI5 mark), B-FGS-03 (the ELI5 mark), B-FGS-08 (ELI5); card p08, E-11"
  - "Plans/Decision_Log.md#DL-126 (Owner resolution, Jared, 2026-09-27, confirmed in chat)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS-20260927-final.json (SHA-256 33d13386f28fc5f667fd1df85ba9cb70eefff7eb43c92723e14cefa08237aaf5) answer record p08"
preserved_exact_tokens:
  - "DL-138"
  - "general.interaction.eli5-default"
  - "720 x 560"
  - "Explain things simply in this chat?"
  - "Follow my usual setting"
  - "How it's decided"
  - "Explain Terms Everywhere"
  - "Takes effect from your next message. Answers already here keep their wording."
  - "quick dot"
  - "Simple explanation"
  - "Simple explanations from here"
  - "Back to standard explanations"
  - "Explain this reply simply"
  - "cmd.chat.eli5.set"
  - "cmd.chat.eli5.explain_reply"
  - "eli5_sheet"
negative_constraints:
  - "Do not render ELI5 as a wand check."
  - "Do not change the ELI5 sheet's height while it is open."
  - "Do not let the quick dot open the sheet or hide while ELI5 is off."
  - "Do not restyle, re-send or rewrite an earlier reply when the style changes."
  - "Do not offer Explain this reply simply as enabled on a reply that is still streaming."
  - "Do not commit the All chats or project level through a chat command."
stale_retired_dispositions:
  - "2026-09-03 redesign section 14's 'ELI5 is a wand check' is superseded by this unit and ACD-484."
owner_hints:
  - Plans/FinalGUISpec.md
  - Plans/assistant-chat-design.md
```

ContractRef: ContractName:Plans/assistant-chat-design.md#ACD-484, ContractName:Plans/Decision_Log.md#DL-126, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/UI_Wiring_Rules.md#UIW-025
