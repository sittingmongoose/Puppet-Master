# Shard 074: Puppet Master Assistant Redesign GUI Specification - 2026-09-03

Source: `Plans/FinalGUISpec.md`

Source lines: L36149-L36456

Source SHA256: `7db637b8c5afddc25d2be612466111b6be5dd52c5d07ae65d356ed80f2ddc075`

---

## Puppet Master Assistant Redesign GUI Specification - 2026-09-03

This section is the canonical GUI contract for the approved Puppet Master Assistant redesign. It preserves the winning 5.6 Pro concept and states only what changes. Everything the concept already does that is not contradicted here remains binding: Layered Studio, Preview Rows, Orbit, Status Board and Ask Card selected defaults; thread history, pinning and menu motion; app-rendered hover cards; message chrome; the Context Lens strip; the context ring, menu, details and compaction behavior; questionnaire choreography; selector collapse; responsive activity-panel behavior; the follow-up queue semantics; the Send-to-Stop morph; and the current themes and visual tokens.

### 1. Header

Header order remains `Context Lens | Thread Search | Worktree | Context Ring`. No Goal chip and no model or mode metadata returns to the header. **Context Lens remains a top-level header control and horizontal strip and is not moved into the wand.** The context-ring compact menu gains a BSD summary row while retaining Compact Now and More Details; that row opens or scrolls Context Details to BSD and does not itself change BSD mode.

### 2. Primary mode menu

Root choices become exactly `Ask`, `Agent`, `Debug`, `Plan ▶`, `Deep Plan ▶`, `Review ▶`. Sidecars keep the existing fixed-width sprout behavior.

The Plan sidecar offers `Quick`, `Standard · Default`, `Thorough`. The Deep Plan sidecar offers `Thorough · Default`, `Exhaustive`, `BrainStorm`, then a divider and a persistent `✓ Grill Me` check row. The Review sidecar offers `Single Agent` and `Multi-Pass Review`.

Selecting BrainStorm or either Review choice opens that workflow's configuration modal. Selecting a Plan or Deep Plan strategy sets the strategy for the next planning request. Grill Me is a persistent check for the next Deep Plan invocation and visually matches the existing auxiliary-row pattern without being confused with model effort.

### 3. Wand menu

The wand keeps its existing capability entries and adds `Goal`, `BSD ▶`, `ELI5`, `Schedule Message…`, `Teach…` where discoverability helps, and `Revert Last Agent Edit` when eligible. A `Multi-Agent ▶` entry sidecars to `Crew…`, `Chat Room…`, a divider, `✓ Crew Auto`, `Crew Auto settings…`, and `Manage Defaults…` (F3-578, DL-119). `✓ Crew Auto` shows the Crew Auto permission in force for the chat and sets only that chat's override of the project value, which is on by default; there is no separate `Allow Crews in this chat` row (F3-578, DL-120). The BSD sidecar offers `Off`, `Auto · Default`, `On`, a divider, and `Configure…`, and its check state comes from the owner projection rather than a local-only checkbox. The BSD row itself shows the committed mode in title case (`Off`, `Auto`, `On`) beside a chevron, because it opens a sidecar, and the `Revert Last Agent Edit` row's helper line states its eligibility in words, for example `Nothing to revert yet` (F3-577). The `ELI5` row opens the ELI5 sheet and carries the ELI5 kind mark as its icon; it is not a check (F3-581, DL-126).

Review stays in the primary mode selector and BrainStorm stays under Deep Plan; neither is duplicated as a first-class wand entry, though context actions may route to them. Schedule Message belongs in the wand, not in an Assistant overflow menu outside it.

### 4. Composer

Baseline chrome is unchanged: Attach and active capability glyphs stay bottom-left inside the text field, Send and Stop stay bottom-right, and Persona, Model, Mode, Permissions and the wand stay centered below the static divider. **The optional restore-draft control and all user-visible Draft terminology are removed**; unsent text and attachments persist invisibly per thread instead.

When attachments exist the composer expands upward into an attachment tray above the text entry. Each thumbnail is a compact rounded surface consistent with the orbit-node and composer tokens, showing an image preview or a file-type SVG, an optional ellipsized name, a thin animated top-edge tracer while processing, a hover X in the upper right, and a click target on the body that opens or previews. Name, type, size, source, state and actions come from the hover card or the hidden message chrome rather than permanent text. A failed attachment stays removable and retryable. The tray coexists with selector collapse and the destination ribbon without clipping.

A targeted composer adds a narrow ribbon inside the composer's top edge and tints the outer border and background. It stays theme-aware and subtle — not a broad colored stripe and not a left accent bar. The ribbon reads, for example, `To: BrainStorm · Provider Architecture · 4 participants ×`, and the matching small destination glyph near Attach illuminates; clicking that glyph opens the eligible destinations. Pressing Revise shows `Revising Plan · V5 ×` and submits feedback to the revision agent rather than opening a document editor.

When a provider quota wait is active, a compact in-flow strip sits below the activity and follow-up queue and above the composer, reading the paused reason, the reset time and its source, and an opt-in `Resume automatically` checkbox. It is in flow, not a full-width overlay, and must not collide with the activity bar or the decision host.

Directly after the quota-wait strip sits the dock (ACD-476): at most three one-line items for runs, scheduled messages and advice whose own transcript item is off-screen, needs-you first. It is transient, reserves its own height in this stack, never floats over the transcript, and never collides with the floating Activity bar pill or the decision host; the transcript's bottom padding is measured with the dock present (F3-567). The dock's live-run lines and the files row under each reply replace the old summary above the composer of a helpers count and `N file changes` (ACD-482, DL-129); the thread's total file count is in Activity's Changes domain. Among the active capability glyphs, Back Seat Driver shows an ambient eye that reads the owner projection, and the Crew glyph is the Crew kind mark (F3-567). The ELI5 quick dot sits with the capability glyphs in both of its states, lit while Simple explanations are in effect for the chat and muted while they are not, and one click turns this chat's ELI5 on or off (F3-581, DL-126).

### 5. Transcript attachments

Attachments render inside their associated turn as compact visual objects and participate in the existing message-hover chrome: metadata and actions are hidden at rest on pointer-capable widths and always available at phone widths under the existing rule. There is no permanent `PNG · 2.8 MB` clutter. A project reference that changed since the message shows a compact stale badge on the object rather than a warning paragraph, with the historical revision explained on hover and both live and materialized versions in Details. Generated artifacts use the same card grammar and disclose version and producing workflow in Details.

What a wand module attaches to an ordinary reply is one line each (F3-570): the files row under a reply that changed files (`Changed 3 files +5 −3 · Revert`), which is visible at rest, and the quiet ticks in the reply's meta row (a memory note taken; the rule note, `Followed 1 of your rules` for rules whose check the reply passed or `Missed 1 of your rules` when a check failed (DL-116); `Sent on schedule` on a message that a schedule sent; `Simple explanation` on a reply written in Simple), which follow that row's existing message-chrome visibility. Each finished reply's message actions may offer `Explain this reply simply`, which adds one simpler reply at the end of the thread and never rewrites the reply it explains (F3-581, DL-126).

### 6. Plan card

The Plan is a transcript card because it is a human-readable deliverable. Its header carries the Plan title, a `Plan · V5` badge, and a `Rich Text` / `Markdown` toggle with Rich Text selected by default. The body renders headings, paragraphs, tables, lists, code, Mermaid, charts, images, diagrams and supported artifacts with stable scroll and selection, **no editable caret**, an optional step-status gutter while building, and embedded artifacts that open in the normal artifact viewer. The Markdown view is read-only and preserves block identity.

The footer carries exactly one primary status control that changes label rather than being replaced by a separate badge. Before build the actions are `[Build] [Build With Crew] [Build At…] [Revise] [Send To Planning Wizard] [Export] [Cancel]`. During execution the primary control reads `Building…` alongside `Open To-Dos` and `Cancel`. After a terminal result it reads `Completed` or `Canceled`. A pause, quota wait or window boundary may appear as small support copy such as `Building… · paused until 10:00 PM`, but the button itself still reads `Building…`.

Historical Completed and Canceled cards stay in place and default to compact. A later Plan appears lower in the transcript. There is no Plan picker and no `Superseded` label.

### 7. Goal Activity UI

Goal appears in the Activity bar only for the current thread and only when an active or retained Goal record exists. Its hover preview is interactive: `Goal · Running`, a two-line objective preview, and `[Pause] [Cancel] [edit icon]`, with Resume replacing Pause when eligible. The edit icon opens Activity Detail in edit mode; clicking the Goal item itself opens the normal detail view.

Activity Detail shows the objective, then one control row `[Pause/Resume] [Edit objective] … [Cancel Goal]` with Cancel Goal alone at the far edge, and an `Objective history ▾` footer that opens the revision list in place; Edit objective shows the text-only objective editor with `[Save] [Cancel edit]`. There is no View Goal route and no Ask for a replacement control (amended 2026-10-08, DL-147, F3-593). It must not show a title, phases, child Goals, budgets, a current action, a next action, or separate scope and done-when fields. Agent-proposed changes use the existing approval host showing only the current objective, the proposed objective, `Approve Change` and `Cancel`. **There is no Goal transcript card.**

### 8. To-Dos Activity UI

The hover preview shows compact current work — a completed-over-total count and the current items, with several current rows allowed and a blocked count only when nonzero. Activity Detail shows one hierarchical tree using distinct pending, current, completed, blocked and skipped marks in the existing visual language. Completed entries stay inline with a filled dot and strike-through. There is no Done heading, no source chip, no verification badge, no Goal grouping and no cross-thread row. Parent rows expand and collapse and show derived counts; each row is one line in the hover preview's checklist form with no buttons, and an item's selected detail offers Open work for its associated work, agent or artifact (amended 2026-10-08, DL-147, F3-593). **There is no To-Do transcript card.**

### 9. Activity bar domains

Dynamic domains become `Goal · To-Dos · Subagents · Crew · BrainStorm · Review · Chat Room · Changes · Artifacts`, preserving per-thread presence, omission of empty domains, responsive compaction tiers, hover-card dwell, and Activity Detail routing. The four collaborative domains may show active and completed run counts and the latest status, and their rows open the corresponding card, panel or participant transcript. Subagents remains distinct from Crew and from collaborative participant groups.

### 10. Multi-agent sheets, run cards and run views

The presentation of these surfaces is the wand modules GUI contract, F3-566 (sheets) and F3-569 (run cards, receipts and run views). One shared configuration sheet grammar and participant-row grammar serves all four kinds, with workflow-specific sections added rather than forked. A participant row exposes the role, the model, the Persona, and the requested-versus-effective disclosure when they differ. Wonderer and Grill Me appear as additive rows rather than replacing a core participant.

Each run renders one transcript card that changes density in place as the run moves (Collaborative_Workflows CWR-019) and opens the run view, an editor document showing the same run (ACD-480). Participants are clickable and open their own transcripts. The BrainStorm sheet shows the effective question maximum including the Grill extension; the Review sheet shows the reviewer count control across one to eight with repeated model choices permitted; the Chat Room sheet shows turn policy and rounds; the Crew sheet shows coordinator, roles, assignment strategy and parallelism.

### 11. BSD GUI

The wand shows Off, Auto and On check state plus Configure, driven by the owner projection. Silent, duplicate and cleared evaluations create no transcript noise. Emitted advice appears as an attributable advisor note at the step boundary near the relevant working activity or safe boundary: a margin note, never a card (Back_Seat_Driver BSD-030, F3-571). Held findings appear only in Context Details and the BSD detail, possibly as a small held count, and are never shown as confirmed warnings. Unreconfirmed terminal critical advice is explicitly labelled stale or unreconfirmed.

The compact Context menu carries a BSD row showing mode, Persona and liveness, for example `BSD  Auto · Critical Advisor` over `Up to date · checked 18s ago`, across the states Off, Idle, Reviewing, Catching up, Finding held, Advice delivered, Quota paused, Failed and Unavailable. The words shown are the plain ones (DL-110, F3-571): `Up to date` where the canon word was `Caught up`, `Double-checking` for `Finding held`, and `Paused: usage limit reached` for `Quota paused`. Context Details gains a BSD section with policy, identity, stage, cursor, triggers, findings, context, Usage, failure and watch guidance, reusing the existing detail-card grammar and Raw redaction rules. The Usage page gains a BSD purpose filter and rows for calls, no-calls, held, cleared, emitted and suppressed findings, timeout, quota and failure counts, cost by model, account and stage, and catch-up latency, added through the existing widget system without altering the accepted Usage layout.

### 12. Browser capture GUI

The browser toolbar and context menu expose `Full Screenshot ▶ Visible Browser | Full Scrollable Page`, `Region Screenshot`, and `Select Component`. Region mode draws a selection overlay and sends on completion. Component mode highlights the hovered and clicked component and places a compact instruction bar beside the selected target without clipping the viewport, carrying a text input, Send, and a menu offering `Send Now`, `Add To Composer List` and `Insert Component At Cursor`, with the last choice marked and remembered. Escape cancels selection. A selected component chip renders as a highlighted `<div>`, `<Button>` or framework name. Numbered queue items in the composer are plain readable text plus an embedded hidden reference, and are distinct from the live follow-up queue.

### 13. Scheduling GUI

`Schedule Message` opens a modal carrying date and time, timezone, destination, message preview, attachments, missed-time behavior, the selected model and account summary, and a Schedule action. The composer stays populated until the schedule commits, and on success only the scheduled snapshot clears from the buffer.

`Build At…` opens a Plan modal carrying one-time start or recurring window, the exact Plan version it binds, named in the sheet (its id and hash are in the Plan's Details, DL-148), timezone and days, start and pause time, wind-down, auto-resume next window, and a provider usage or reset hint where available. A version change places a small `Schedule needs update` notice on the Plan card and disables automatic dispatch until it is resolved.

Both are sheets of the wand modules grammar (F3-566); F3-573 states what each shows beyond the fields above: the message as a future bubble, the resolved time in the schedule's own zone, and a plate of the next 48 hours for Schedule Message that is also its send-time control (F3-592); a week plate of the build slots for Build At.

The quota wait strip described in section 4 links to Usage detail from its reset and source text, and its checkbox controls only that run's consent unless Settings defines a default.

### 14. Teach, Teacher, memory, ELI5, Debug and Revert

`/teach`, natural language, the wand's `Teach…` and `Save as a rule…` all open the Teach sheet, prefilled with the proposed knowledge and its scope; the explicit capture card this sentence used to name is superseded and not planned (DL-127, F3-579). **It never changes the Persona to Teacher.** Teacher remains in the Persona picker as the Puppet-Master-explanation Persona. Ordinary automatic memory produces no constant pop-up; memory detail and history show source and verification under the existing owner behavior. Its only chat traces are a quiet tick in the reply's meta row when a note is taken and one verified tick when a check later proves it; a note going out of date makes no chat noise. These satisfy this rule (F3-574).

ELI5 is its own small sheet, opened from the wand's `ELI5` row, with the quick dot by the message box as the one-click on and off; a chat's own override replaces the project default, which replaces the app default that Settings owns (ACD-484, F3-581, DL-126). Switching ELI5 is not a one-shot "simplify this output" action and never rewrites a reply; the separate `Explain this reply simply` action on a finished reply writes one extra, simpler reply only when the user asks. The wand check this paragraph used to name is superseded. Selecting Debug mode must open and demonstrate the full Investigation Context and its eight-phase progression rather than merely changing the selected mode, with fixtures for target binding, evidence, repair, verification, cleanup, attention required and failed cleanup recovery. `Revert Last Agent Edit` appears in the wand, Changes, the message overflow and the files row under the reply that changed files when eligible, previews the exact files in one compact confirm sheet before dispatching the canonical whole-turn revert, reports each outcome as one receipt line, and stays distinct from Rewind in the thread and message overflow (ACD-478, F3-574).

### 15. Thread history and status

Thread status continues to derive from owner projections. Review, multi-agent, scheduled and quota-wait statuses are added only through the shared status vocabulary; Plan Build-button labels are never overloaded into thread status. A title-generation failure leaves `New chat` and is reported in Details and Usage rather than in an intrusive modal. The header title shows the naming, user-named and naming-unavailable states and the naming outcomes of ACD-479 (F3-575). The regenerate action reads `Name it for me` (DL-134).

### 16. Responsive and theme behavior

All eight themes and every width in the concept's existing verification apply, plus the narrow 390–590px states. Under width pressure the priority order is: preserve Send and Stop; preserve destination identity and its close control; preserve Attach and the active capability glyphs; collapse the participant cluster and the attachment overflow; use the existing selector icon mode; keep the Plan primary status control visible and overflow its secondary actions; and preserve Activity icon access even when labels and counts collapse.

Do not add left accent bars, excessive padding, permanent bright status surfaces, or white-until-hover defects. The J-2 spacing minimums of F3-566 are a floor, not excess padding. A run card narrower than 360 px is a card-inside-a-narrow-chat case (the S card tier of F3-569), not a new minimum chat width; the dock is transient, not a permanent status surface.

### F3-531 - Assistant Redesign Mode Menu, Wand, And Header Placement

```yaml
plan_unit_id: F3-531
unit_type: gui_requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The Assistant primary mode menu offers exactly Ask, Agent, Debug, Plan, Deep Plan, and Review, with sidecars Quick/Standard/Thorough for Plan, Thorough/Exhaustive/BrainStorm plus a persistent Grill Me check for Deep Plan, and Single Agent/Multi-Pass Review for Review, all using the existing fixed-width sprout behavior. The wand keeps its existing capability entries and adds Goal, a BSD sidecar of Off/Auto/On/Configure driven by the owner projection, ELI5, Schedule Message, Teach where discoverability helps, Revert Last Agent Edit when eligible, and a Multi-Agent sidecar of Crew, Chat Room, a checkable Crew Auto, and Manage Defaults. Review stays in the mode selector and BrainStorm stays under Deep Plan; neither is duplicated as a first-class wand entry. Context Lens remains a top-level header control and horizontal strip and is never moved into the wand, and header order remains Context Lens, Thread Search, Worktree, Context Ring with no Goal chip and no model or mode metadata.
gui_related: true
gui_classification_reason: This unit specifies the exact contents and placement of the mode menu, the wand, and the header.
depends_on: [F3-530]
unblocks: [F3-532, F3-533]
acceptance_criteria:
  - The mode menu shows exactly six roots with the three specified sidecars.
  - Grill Me is a persistent check in the Deep Plan sidecar and is not confused with model effort.
  - The BSD wand check state comes from the owner projection, not a local checkbox.
  - Context Lens remains a header control and is absent from the wand.
  - Schedule Message appears in the wand and not in an outer overflow menu.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - node tests/audit.mjs
  - node tests/restored-features-verify.mjs
risk_class: mode_menu_or_lens_placement_drift
reasoning_tier: high
context_scope: assistant_redesign_menus
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/assistant-chat-design.md
  - Plans/Run_Modes.md
  - Concepts/chat-assistant-concepts/5.6 Pro/menus.js
node_compile_hint:
  mode: assistant_menu_specification
  create_worknodes: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:GUI-001
  - pm-assistant-implementation-2026-09-02-recovered:04_GUI_IMPACTS.md#2
  - pm-assistant-implementation-2026-09-02-recovered:04_GUI_IMPACTS.md#3
  - pm-assistant-implementation-2026-09-02-recovered:04_GUI_IMPACTS.md#4
preserved_exact_tokens:
  - "Deep Plan"
  - "Multi-Pass Review"
  - "Grill Me"
  - "Context Lens"
negative_constraints:
  - Do not move Context Lens into the wand.
  - Do not duplicate Review or BrainStorm as first-class wand entries.
  - Do not return a Goal chip or model/mode metadata to the header.
owner_hints:
  - Plans/FinalGUISpec.md
```

Amended 2026-09-27: the BSD row's committed-mode shortcut and the Revert Last Agent Edit row's eligibility helper are specified in F3-577, and the Multi-Agent sidecar gains `Crew Auto settings…` beside an unchanged `Manage Defaults…` (F3-578, DL-119). The checkable Crew Auto is the assistant's permission to start a Crew by itself, on by default for a project; in a chat it shows and sets only that chat's override of the project value, and it is the chat's only Crew permission control, so the wand has no separate `Allow Crews in this chat` row (F3-578, DL-120, 2026-09-27). The wand's `ELI5` entry opens the ELI5 sheet rather than acting as a check (F3-581, DL-126, 2026-09-27). The wand's contents above are otherwise unchanged by the wand modules redesign; Review and BrainStorm keep the entry points stated above.

### F3-532 - Assistant Composer Tray, Destination Ribbon, And Quota Strip

```yaml
plan_unit_id: F3-532
unit_type: gui_requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Baseline composer chrome is preserved: Attach and active capability glyphs bottom-left inside the text field, Send and Stop bottom-right, and Persona, Model, Mode, Permissions and the wand centered below the static divider. The optional restore-draft control and all user-visible Draft terminology are removed because unsent text and attachments persist invisibly per thread. When attachments exist the composer expands upward into a tray of compact rounded thumbnails carrying an image preview or file-type SVG, an optional ellipsized name, a thin animated top-edge tracer while processing, a hover X in the upper right, and a body click that opens or previews, with name, type, size, source, state and actions supplied by the hover card or hidden message chrome rather than permanent text. A targeted composer adds a narrow theme-aware ribbon inside the top edge naming its destination with a close control and illuminates the matching destination glyph near Attach, and Revise shows Revising Plan Vn rather than opening a document editor. An active provider quota wait shows a compact in-flow strip above the composer with the paused reason, the reset time and its source, and an opt-in resume checkbox, never a full-width overlay.
gui_related: true
gui_classification_reason: This is the complete composer rendering contract for the redesign.
depends_on: [F3-531]
unblocks: []
acceptance_criteria:
  - No restore-draft control or Draft terminology is rendered anywhere.
  - The attachment tray coexists with selector collapse and the destination ribbon without clipping.
  - The destination ribbon names the destination, is subtle and theme-aware, and offers a close control.
  - The quota strip is in flow and does not collide with the activity bar or decision host.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - node tests/attachments-composer-verify.mjs
risk_class: draft_ui_reintroduced_or_hidden_send_destination
reasoning_tier: high
context_scope: assistant_redesign_composer
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/assistant-chat-design.md
  - Concepts/chat-assistant-concepts/5.6 Pro/composer.css
  - Concepts/chat-assistant-concepts/5.6 Pro/attachments.js
node_compile_hint:
  mode: assistant_composer_specification
  create_worknodes: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:GUI-002
  - pm-assistant-implementation-2026-09-02-recovered:04_GUI_IMPACTS.md#5
preserved_exact_tokens:
  - "attachment tray"
  - "top-edge tracer"
  - "Revising Plan"
negative_constraints:
  - Do not render a Draft control or Draft terminology.
  - Do not use a broad colored stripe or left accent for the destination ribbon.
  - Do not hide the send destination at any width.
owner_hints:
  - Plans/FinalGUISpec.md
```

Amended 2026-09-27: F3-567 adds the dock (ACD-476) to this composer stack directly after the quota strip, with the same no-collision rule against the activity bar and the decision host, and the Back Seat Driver ambient eye and the Crew kind mark among the active capability glyphs. The ELI5 quick dot is among those glyphs in both of its states, lit or muted (F3-581, DL-126, 2026-09-27).

### F3-533 - Plan Card, Goal And To-Do Activity Surfaces, And Activity Domains

```yaml
plan_unit_id: F3-533
unit_type: gui_requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The Plan is a transcript card with a title, a Plan Vn badge, and a Rich Text / Markdown toggle defaulting to Rich Text; its body renders full document content with no editable caret and its footer carries exactly one primary status control reading Build, Building…, Completed, or Canceled alongside Build With Crew, Build At, Revise, Send To Planning Wizard, Export, Cancel and Open To-Dos as applicable. A pause or quota wait appears as small support copy while the button still reads Building…. Historical Completed and Canceled cards stay in place and default compact, with no Plan picker and no Superseded label. Goal and To-Dos are Activity domains and have no transcript card: the Goal hover offers Pause, Cancel and an edit icon opening Activity Detail in edit mode, and Goal detail shows only the objective, Save and Cancel edit, lifecycle controls and a revision History (since 2026-10-08 one control row with Edit objective and Cancel Goal alone at the far edge, and an Objective history footer; DL-147, F3-593). The To-Do hover shows a completed-over-total count with several current rows allowed, and To-Do detail shows one hierarchical tree with completed items inline with a filled dot and strike-through and no Done heading, source chip, verification badge, Goal grouping, or cross-thread row; its rows are one line each, like the hover preview, with no buttons (DL-147, F3-593). Activity domains become Goal, To-Dos, Subagents, Crew, BrainStorm, Review, Chat Room, Changes and Artifacts, preserving per-thread presence, empty-domain omission, compaction tiers, hover dwell and detail routing, with Subagents distinct from Crew.
gui_related: true
gui_classification_reason: This unit specifies the Plan card and every Activity surface in the redesign.
depends_on: [F3-531]
unblocks: []
acceptance_criteria:
  - The Plan card has exactly one primary status control with four possible labels and no editable caret.
  - No Goal or To-Do transcript card exists.
  - Completed To-Dos stay inline with a filled dot and strike-through and no Done heading.
  - Activity exposes all nine domains with existing compaction and routing behavior.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - node tests/assistant-plan-verify.mjs
  - node tests/todo-verify.mjs
  - node tests/activity-detail-verify.mjs
risk_class: goal_or_todo_transcript_card_or_done_section
reasoning_tier: high
context_scope: assistant_redesign_cards_and_activity
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/Assistant_Plan_Runtime.md
  - Plans/ToDo_Runtime.md
  - Plans/Goal_Runtime_System.md
  - Concepts/chat-assistant-concepts/5.6 Pro/plans.js
  - Concepts/chat-assistant-concepts/5.6 Pro/todos.js
node_compile_hint:
  mode: assistant_card_and_activity_specification
  create_worknodes: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:GUI-003
  - pm-assistant-implementation-2026-09-02-recovered:04_GUI_IMPACTS.md#7
  - pm-assistant-implementation-2026-09-02-recovered:04_GUI_IMPACTS.md#8
  - pm-assistant-implementation-2026-09-02-recovered:04_GUI_IMPACTS.md#9
  - pm-assistant-implementation-2026-09-02-recovered:04_GUI_IMPACTS.md#10
preserved_exact_tokens:
  - "Building…"
  - "Completed"
  - "Canceled"
  - "Plan · V5"
negative_constraints:
  - Do not render Goal or To-Dos as transcript cards.
  - Do not add a Plan picker or a Superseded label.
  - Do not replace the Build control with a separate status badge.
owner_hints:
  - Plans/FinalGUISpec.md
```

### F3-534 - Assistant Redesign Responsive Priority And Visual Prohibitions

```yaml
plan_unit_id: F3-534
unit_type: gui_requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  All eight themes and every width in the concept's existing verification apply to the redesign, plus the narrow 390 to 590 pixel states. Under width pressure the priority order is to preserve Send and Stop, then destination identity and its close control, then Attach and the active capability glyphs, then to collapse the participant cluster and attachment overflow, then to use the existing selector icon mode, then to keep the Plan primary status control visible while overflowing its secondary actions, and finally to preserve Activity icon access even when labels and counts collapse. Left accent bars, excessive padding, permanent bright status surfaces, and white-until-hover defects are prohibited. Accessibility semantics already present must be preserved when a component is touched, and no separate accessibility expansion workstream is in scope for this wave.
gui_related: true
gui_classification_reason: This unit governs responsive collapse order and visual prohibitions across every redesign surface.
depends_on: [F3-532, F3-533]
unblocks: []
acceptance_criteria:
  - Send and Stop survive every supported width.
  - The send destination is never hidden at any width.
  - The Plan primary status control stays visible while secondary actions overflow.
  - No left accent bar, permanent bright status surface, or white-until-hover state is introduced.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - node tests/audit.mjs
risk_class: responsive_collapse_hides_critical_control
reasoning_tier: standard
context_scope: assistant_redesign_responsive
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Concepts/chat-assistant-concepts/5.6 Pro/composer.css
  - Concepts/chat-assistant-concepts/5.6 Pro/styles.css
node_compile_hint:
  mode: assistant_responsive_specification
  create_worknodes: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:GUI-004
  - pm-assistant-implementation-2026-09-02-recovered:04_GUI_IMPACTS.md#18
  - pm-assistant-implementation-2026-09-02-recovered:AUTHORITY_AND_PRECEDENCE.md#6
preserved_exact_tokens:
  - "390"
  - "590"
negative_constraints:
  - Do not hide Send, Stop, or the send destination at any width.
  - Do not add left accent bars or permanent bright status surfaces.
owner_hints:
  - Plans/FinalGUISpec.md
```

Amended 2026-09-27: the J-2 spacing minimums of F3-566 are a floor and do not count as excessive padding; a run card narrower than 360 px is the S card tier inside a narrow chat (F3-569), not a new minimum chat width; the dock (F3-567) is transient and is not a permanent status surface.
