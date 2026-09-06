# Shard 074: Puppet Master Assistant Redesign GUI Specification - 2026-09-03

Source: `Plans/FinalGUISpec.md`

Source lines: L35840-L36135

Source SHA256: `342462919f6e41f5f85d7c9e4eaf265d109a277d8ac29b0b7343a69abd20694c`

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

The wand keeps its existing capability entries and adds `Goal`, `BSD ▶`, `ELI5`, `Schedule Message…`, `Teach…` where discoverability helps, and `Revert Last Agent Edit` when eligible. A `Multi-Agent ▶` entry sidecars to `Crew…`, `Chat Room…`, a divider, `✓ Crew Auto`, and `Manage Defaults…`. The BSD sidecar offers `Off`, `Auto · Default`, `On`, a divider, and `Configure…`, and its check state comes from the owner projection rather than a local-only checkbox.

Review stays in the primary mode selector and BrainStorm stays under Deep Plan; neither is duplicated as a first-class wand entry, though context actions may route to them. Schedule Message belongs in the wand, not in an Assistant overflow menu outside it.

### 4. Composer

Baseline chrome is unchanged: Attach and active capability glyphs stay bottom-left inside the text field, Send and Stop stay bottom-right, and Persona, Model, Mode, Permissions and the wand stay centered below the static divider. **The optional restore-draft control and all user-visible Draft terminology are removed**; unsent text and attachments persist invisibly per thread instead.

When attachments exist the composer expands upward into an attachment tray above the text entry. Each thumbnail is a compact rounded surface consistent with the orbit-node and composer tokens, showing an image preview or a file-type SVG, an optional ellipsized name, a thin animated top-edge tracer while processing, a hover X in the upper right, and a click target on the body that opens or previews. Name, type, size, source, state and actions come from the hover card or the hidden message chrome rather than permanent text. A failed attachment stays removable and retryable. The tray coexists with selector collapse and the destination ribbon without clipping.

A targeted composer adds a narrow ribbon inside the composer's top edge and tints the outer border and background. It stays theme-aware and subtle — not a broad colored stripe and not a left accent bar. The ribbon reads, for example, `To: BrainStorm · Provider Architecture · 4 participants ×`, and the matching small destination glyph near Attach illuminates; clicking that glyph opens the eligible destinations. Pressing Revise shows `Revising Plan · V5 ×` and submits feedback to the revision agent rather than opening a document editor.

When a provider quota wait is active, a compact in-flow strip sits below the activity and follow-up queue and above the composer, reading the paused reason, the reset time and its source, and an opt-in `Resume automatically` checkbox. It is in flow, not a full-width overlay, and must not collide with the activity bar or the decision host.

### 5. Transcript attachments

Attachments render inside their associated turn as compact visual objects and participate in the existing message-hover chrome: metadata and actions are hidden at rest on pointer-capable widths and always available at phone widths under the existing rule. There is no permanent `PNG · 2.8 MB` clutter. A project reference that changed since the message shows a compact stale badge on the object rather than a warning paragraph, with the historical revision explained on hover and both live and materialized versions in Details. Generated artifacts use the same card grammar and disclose version and producing workflow in Details.

### 6. Plan card

The Plan is a transcript card because it is a human-readable deliverable. Its header carries the Plan title, a `Plan · V5` badge, and a `Rich Text` / `Markdown` toggle with Rich Text selected by default. The body renders headings, paragraphs, tables, lists, code, Mermaid, charts, images, diagrams and supported artifacts with stable scroll and selection, **no editable caret**, an optional step-status gutter while building, and embedded artifacts that open in the normal artifact viewer. The Markdown view is read-only and preserves block identity.

The footer carries exactly one primary status control that changes label rather than being replaced by a separate badge. Before build the actions are `[Build] [Build With Crew] [Build At…] [Revise] [Send To Planning Wizard] [Export] [Cancel]`. During execution the primary control reads `Building…` alongside `Open To-Dos` and `Cancel`. After a terminal result it reads `Completed` or `Canceled`. A pause, quota wait or window boundary may appear as small support copy such as `Building… · paused until 10:00 PM`, but the button itself still reads `Building…`.

Historical Completed and Canceled cards stay in place and default to compact. A later Plan appears lower in the transcript. There is no Plan picker and no `Superseded` label.

### 7. Goal Activity UI

Goal appears in the Activity bar only for the current thread and only when an active or retained Goal record exists. Its hover preview is interactive: `Goal · Running`, a two-line objective preview, and `[Pause] [Cancel] [edit icon]`, with Resume replacing Pause when eligible. The edit icon opens Activity Detail in edit mode; clicking the Goal item itself opens the normal detail view.

Activity Detail shows a text-only objective area with `[Save] [Cancel edit]`, then `[Pause/Resume] [Cancel Goal]` and a `History ▾` revision list. It must not show a title, phases, child Goals, budgets, a current action, a next action, or separate scope and done-when fields. Agent-proposed changes use the existing approval host showing only the current objective, the proposed objective, `Approve Change` and `Cancel`. **There is no Goal transcript card.**

### 8. To-Dos Activity UI

The hover preview shows compact current work — a completed-over-total count and the current items, with several current rows allowed and a blocked count only when nonzero. Activity Detail shows one hierarchical tree using distinct pending, current, completed, blocked and skipped marks in the existing visual language. Completed entries stay inline with a filled dot and strike-through. There is no Done heading, no source chip, no verification badge, no Goal grouping and no cross-thread row. Parent rows expand and collapse and show derived counts, and clicking an active item may open its associated work, agent or artifact. **There is no To-Do transcript card.**

### 9. Activity bar domains

Dynamic domains become `Goal · To-Dos · Subagents · Crew · BrainStorm · Review · Chat Room · Changes · Artifacts`, preserving per-thread presence, omission of empty domains, responsive compaction tiers, hover-card dwell, and Activity Detail routing. The four collaborative domains may show active and completed run counts and the latest status, and their rows open the corresponding card, panel or participant transcript. Subagents remains distinct from Crew and from collaborative participant groups.

### 10. Multi-agent modals, cards and panels

One shared modal shell and participant-row grammar serves all four kinds, with workflow-specific sections added rather than forked. A participant row exposes the role, the model, the Persona, and the requested-versus-effective disclosure when they differ. Wonderer and Grill Me appear as additive rows rather than replacing a core participant.

Each run renders one transcript card that expands inline for recent transcript and details and pops out to a full panel showing the same run. Participants are clickable and open their own transcripts. The BrainStorm modal shows the effective question maximum including the Grill extension; the Review modal shows the reviewer count control across one to eight with repeated model choices permitted; the Chat Room modal shows turn policy and rounds; the Crew modal shows coordinator, roles, assignment strategy and parallelism.

### 11. BSD GUI

The wand shows Off, Auto and On check state plus Configure, driven by the owner projection. Silent, duplicate and cleared evaluations create no transcript noise. Emitted advice appears as an attributable BSD card or inline advisory near the relevant working activity or safe boundary. Held findings appear only in Context Details and the BSD detail, possibly as a small held count, and are never shown as confirmed warnings. Unreconfirmed terminal critical advice is explicitly labelled stale or unreconfirmed.

The compact Context menu carries a BSD row showing mode, Persona and liveness, for example `BSD  Auto · Critical Advisor` over `Caught up · checked 18s ago`, across the states Off, Idle, Reviewing, Catching up, Finding held, Advice delivered, Quota paused, Failed and Unavailable. Context Details gains a BSD section with policy, identity, stage, cursor, triggers, findings, context, Usage, failure and watch guidance, reusing the existing detail-card grammar and Raw redaction rules. The Usage page gains a BSD purpose filter and rows for calls, no-calls, held, cleared, emitted and suppressed findings, timeout, quota and failure counts, cost by model, account and stage, and catch-up latency, added through the existing widget system without altering the accepted Usage layout.

### 12. Browser capture GUI

The browser toolbar and context menu expose `Full Screenshot ▶ Visible Browser | Full Scrollable Page`, `Region Screenshot`, and `Select Component`. Region mode draws a selection overlay and sends on completion. Component mode highlights the hovered and clicked component and places a compact instruction bar beside the selected target without clipping the viewport, carrying a text input, Send, and a menu offering `Send Now`, `Add To Composer List` and `Insert Component At Cursor`, with the last choice marked and remembered. Escape cancels selection. A selected component chip renders as a highlighted `<div>`, `<Button>` or framework name. Numbered queue items in the composer are plain readable text plus an embedded hidden reference, and are distinct from the live follow-up queue.

### 13. Scheduling GUI

`Schedule Message` opens a modal carrying date and time, timezone, destination, message preview, attachments, missed-time behavior, the selected model and account summary, and a Schedule action. The composer stays populated until the schedule commits, and on success only the scheduled snapshot clears from the buffer.

`Build At…` opens a Plan modal carrying one-time start or recurring window, the exact Plan version disclosure, timezone and days, start and pause time, wind-down, auto-resume next window, and a provider usage or reset hint where available. A version change places a small `Schedule needs update` notice on the Plan card and disables automatic dispatch until it is resolved.

The quota wait strip described in section 4 links to Usage detail from its reset and source text, and its checkbox controls only that run's consent unless Settings defines a default.

### 14. Teach, Teacher, memory, ELI5, Debug and Revert

`/teach` or natural language opens an explicit capture card showing the proposed knowledge and its scope. **It never changes the Persona to Teacher.** Teacher remains in the Persona picker as the Puppet-Master-explanation Persona. Ordinary automatic memory produces no constant pop-up; memory detail and history show source and verification under the existing owner behavior.

ELI5 is a wand check with a conversation override while Settings owns the application default; it is not a one-shot "simplify this output" action. Selecting Debug mode must open and demonstrate the full Investigation Context and its eight-phase progression rather than merely changing the selected mode, with fixtures for target binding, evidence, repair, verification, cleanup, attention required and failed cleanup recovery. `Revert Last Agent Edit` appears in the wand, Changes and the message overflow when eligible, previews the exact files before dispatching the canonical whole-turn revert, and stays distinct from Rewind in the thread and message overflow.

### 15. Thread history and status

Thread status continues to derive from owner projections. Review, multi-agent, scheduled and quota-wait statuses are added only through the shared status vocabulary; Plan Build-button labels are never overloaded into thread status. A title-generation failure leaves `New chat` and is reported in Details and Usage rather than in an intrusive modal.

### 16. Responsive and theme behavior

All eight themes and every width in the concept's existing verification apply, plus the narrow 390–590px states. Under width pressure the priority order is: preserve Send and Stop; preserve destination identity and its close control; preserve Attach and the active capability glyphs; collapse the participant cluster and the attachment overflow; use the existing selector icon mode; keep the Plan primary status control visible and overflow its secondary actions; and preserve Activity icon access even when labels and counts collapse.

Do not add left accent bars, excessive padding, permanent bright status surfaces, or white-until-hover defects.

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

### F3-533 - Plan Card, Goal And To-Do Activity Surfaces, And Activity Domains

```yaml
plan_unit_id: F3-533
unit_type: gui_requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The Plan is a transcript card with a title, a Plan Vn badge, and a Rich Text / Markdown toggle defaulting to Rich Text; its body renders full document content with no editable caret and its footer carries exactly one primary status control reading Build, Building…, Completed, or Canceled alongside Build With Crew, Build At, Revise, Send To Planning Wizard, Export, Cancel and Open To-Dos as applicable. A pause or quota wait appears as small support copy while the button still reads Building…. Historical Completed and Canceled cards stay in place and default compact, with no Plan picker and no Superseded label. Goal and To-Dos are Activity domains and have no transcript card: the Goal hover offers Pause, Cancel and an edit icon opening Activity Detail in edit mode, and Goal detail shows only the objective, Save and Cancel edit, lifecycle controls and a revision History. The To-Do hover shows a completed-over-total count with several current rows allowed, and To-Do detail shows one hierarchical tree with completed items inline with a filled dot and strike-through and no Done heading, source chip, verification badge, Goal grouping, or cross-thread row. Activity domains become Goal, To-Dos, Subagents, Crew, BrainStorm, Review, Chat Room, Changes and Artifacts, preserving per-thread presence, empty-domain omission, compaction tiers, hover dwell and detail routing, with Subagents distinct from Crew.
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
