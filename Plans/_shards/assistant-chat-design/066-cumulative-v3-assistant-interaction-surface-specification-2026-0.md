# Shard 066: Cumulative v3 Assistant Interaction & Surface Specification (2026-09-07)

Source: `Plans/assistant-chat-design.md`

Source lines: L24771-L25119

Source SHA256: `6bf649c57bc055f62507d520d529fd20c1e44c0f06e314fb8380880ca167f593`

---

## Cumulative v3 Assistant Interaction & Surface Specification (2026-09-07)

This section incorporates the cumulative v3 repairs and supersessions from the Assistant/Settings Plans Repair Packet (`APR-001` through `APR-070`), as selectively amended by the reference-layout supersession under `USER-REFERENCE-LAYOUT-ROLLBACK-20260908`. It supersedes contradictory earlier v1/v2 text and reference-video flat-row prescriptions while preserving all retained v2/correction-v4 contracts:

1. **Floating Chat Activity Bar (`APR-004`)**: The styled inner Chat Activity Bar pill is restored and floats over the transcript with transparent side flanks and a transparent bottom area. Pointer pass-through (`pointer-events: none` on the transparent host container with `pointer-events: auto` on the interactive pill itself) ensures transcript items beneath the flanks remain clickable. The transcript maintains sufficient positive bottom scroll padding such that at settled bottom scroll (`scrollTop === scrollHeight - clientHeight`), the actual last child element (whether message text, rich card, decision host, or status receipt) clears the top of the floating bar completely with zero occlusion. The bar is never replaced by plain text or placed in an opaque in-flow footer strip.
2. **Activity Detail Default Pinned Geometry (`APR-001`)**: Opening Activity Detail defaults to a pinned panel on the left. An explicit Unpin action transitions the currently open panel to a floating modal/popover. When the user subsequently clicks any activity-preview item in the Activity Bar, it opens its record PINNED by default on the left, superseding any prior unpinned/floating state. Prior unpinned state is ephemeral and never persists over the default entry rule.
3. **History and Activity Coexistence (`APR-002`)**: Pinned History (left rail) and pinned Activity Detail must share the available viewport width dynamically rather than reserving overlapping or competing gutters. When both are open, the layout uses contiguous non-overlapping columns, preserving readable minimum widths or cleanly transitioning to occlusion with a prominent Return to chat navigation under extreme width pressure.
4. **Transcript Zero Horizontal Overflow (`APR-003`)**: The chat transcript container strictly enforces `scrollWidth <= clientWidth` (within rounding tolerance). Intrinsic-width content—including attachment chips, folder manifests, hidden preview containers, rich-plan tables, code blocks, diff hunks, and structured cards—must wrap, ellipsize, or reflow. Inaccessible content must never be concealed by horizontal clipping alone.
5. **Activity Previews and Navigation (`APR-005`, `APR-006`, `APR-007`)**: All Activity Bar hover panels are bounded previews with zero internal scrolling (`overflow: hidden`). Each preview presents a concise, high-value summary (e.g. To-Dos show completed-over-total count and several current tasks; Goal shows objective snippet and immediate lifecycle controls). Separate "Open Activity" launch buttons are removed from every preview; clicking any preview item or row directly navigates to its corresponding Activity Detail record using canonical routing. A count or overflow summary row may navigate to the full list, but must not masquerade as a duplicate launch button.
6. **Concise Detail and Accent Stripe Elimination (`APR-008`, `APR-009`, `APR-034`)**: Decorative left-edge accent bars, inset box accent lines, and pseudo-element colored stripes are prohibited across all Assistant surfaces—including transcript records, BSD, To-Dos, schedules, decisions, activity panels, and popup menus. Subtle gray recoloring does not satisfy this prohibition. Clean uniform perimeter borders, genuine diff indicators (+/- gutters), and functional tree-hierarchy connectors are permitted. To-Do detail prioritizes task title, state, ownership when relevant, and next action, placing secondary technical metadata behind intentional disclosure. Context More Details provides a compact first view with deeper BSD metrics behind deliberate disclosure.
7. **Composer Browser Launcher Exclusion (`APR-010`)**: The chat composer does not contain an internal-browser launcher button. Product browser navigation belongs to Puppet Master's Browser Program surface. Screenshot capture, component picking, and attachment workflows remain fully supported without creating a competing browser authority.
8. **Transcript Card Grammar (`APR-011`)**: Non-working transcript cards adhere to a unified presentation grammar: consistent header hierarchy, deliberate group spacing, quiet trailing action rows, and progressive disclosure for technical telemetry. Repetitive nesting and redundant outer cards are eliminated.
9. **Protected Working Activity (`APR-012`, `APR-046`, `APR-050`, `APR-068`)**: The perfected working activity components (Orbit and Step Rail Simple) and their choreographed animations are protected. Orbit (family 2, variant 1) is the default; Step Rail Simple (family 2, variant 8) is selectable under `general.interaction.working-activity-style`. Reset hook chaining executes each owner handler exactly once without duplicate invocation or late collision. Working DOM identity and timer ownership are preserved across ticks.
10. **Wand Compact Hierarchy and Demo Separation (`APR-013`, `APR-014`)**: Product actions in the wand are grouped into compact submenus to fit the viewport cleanly. Concept demo loaders, fixture replays, simulations, and test harnesses are moved out of the wand into a dedicated Demo Gallery and are never registered in the product command catalog.
11. **Reset and Asynchronous Callback Hygiene (`APR-020`)**: Thread reset, switch, or new conversation invalidates all pending asynchronous callbacks (including delayed title completion, streaming completions, and background analysis). Owner reset chains follow declared chaining where each registered owner executes exactly once.
12. **Scheduled Message Cards and Receipts (`APR-028`)**: Pending scheduled messages render editable cards in the thread with exact trigger time, timezone, destination, and message preview. Once sent, canceled, or expired, they transition to quiet receipts. Editing reopens the bound message form rather than a generic scheduling dialog. Sent receipts navigate directly to the emitted chat turn.
13. **Context Lens In-Flow Layout Row (`APR-033`)**: The Context Lens dropdown occupies a layout-participating row between the chat header and the transcript. Expanding the Lens pushes the transcript top downward, preventing top-message occlusion; collapsing the Lens releases the space smoothly. Lens selection, Focus, Mute, and Subcompact semantics remain intact.
14. **History Responsive Icon Behavior (`APR-035`)**: Thread-history item SVG icons display when the sidebar width is sufficient and suppress cleanly at narrow widths. This responsive behavior is intentional and preserved.
15. **Plan Tab Editor Navigation and Deduplication (`APR-036`, `APR-037`, `APR-038`)**: Clicking a plan title, Details, Expand, or Open Plan in transcript opens the exact plan revision in the left editor/document tab system. The legacy artifact alias and plan identity reuse one unified tab, preventing duplicate open tabs. The plan tab exposes owner-backed controls (Rich Text/Markdown, Build, Revise, More, Build With Crew, Build At, Send to Planning Wizard, Export). Under narrow viewport widths (e.g. 390px, 768px), the editor displays full width with tab controls above content and a persistent "Return to chat" affordance, temporarily occluding History without mutating saved preferences.
16. **Typed Work Records and Diff Counts (`APR-039`, `APR-040`, `APR-041`, `APR-055`)**: Agent work items render with explicit semantic kinds: File change, File inspection, Activity, Plan, Artifact, or Work note. Change records display genuine file identity, line numbers, and hunks with green (+) additions and red (-) deletions. Obsolete editorial migration comments (e.g. "0043 supersedes 0039...") are excised. Inline code and emphasis format safely; unlinked content remains a Work note.
17. **Internal Work-Note Boundary (`APR-056`)**: Internal work notes (scratch notes, reasoning fragments, diagnostic traces) are behind-the-scenes diagnostic state. They must never appear as ordinary transcript message cards or standalone user artifacts. Concise user-facing progress summaries are distinct, typed projections.
18. **History Thread Currentness and Normal Workflows (`APR-057`, `APR-058`, `APR-067`)**: All 30 fixture threads in History are inventoried and aligned to current specifications. Everyday threads predominantly show running, completed, or successful work. Failure, blocked, or recovery states are segregated into an intentional, clearly labeled recovery minority (`recovery-scheduling`, `recovery-attachments`, `recovery-collaboration`). Unfinished work is not labeled "Needs attention" unless explicitly blocked or faulted. Read-only review fixtures demonstrate inspection and findings without mutating workspace files.
19. **Responsive Editor/Chat Split (`APR-066`)**: Opening a plan or document and resizing the split container enforces explicit grid placement and min-size rules (`min-width: 320px` for chat), preventing the transcript from being squeezed into the resize handle track.
20. **Reference-Layout Supersession (`USER-REFERENCE-LAYOUT-ROLLBACK-20260908`)**: The visual prescription derived from the reference video (`ScreenRecording_08-11-2026 19-26-05_1(1).mov`) mandating flattened row layouts and forced single-column presentations across Activity Detail (Goal, To-Dos, and all Activity families) and Context More Details is selectively superseded. Assistant surfaces restore prior native card, panel, and grid presentation by removing reference-derived CSS overrides (`narrow-review.css`). Independent requirements—including pinned Activity Detail defaults, floating Chat Activity Bar with pointer pass-through, transcript zero horizontal scrolling (`scrollWidth <= clientWidth`), in-flow Context Lens, single bounded hover previews, concise disclosures, elimination of decorative left stripes, and separate Simple Goal vs To-Do semantics—remain strictly preserved.

```yaml
plan_unit_id: ACD-452
unit_type: gui_requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  The styled inner Chat Activity Bar floats over the transcript with transparent side flanks and transparent bottom spacing, using pointer pass-through around the central pill so underlying transcript content remains clickable. The chat transcript maintains positive bottom padding ensuring that at settled bottom scroll (scrollTop === scrollHeight - clientHeight), the final transcript child element is completely visible above the pill. The chat transcript strictly enforces scrollWidth <= clientWidth with zero horizontal scrolling; rich cards, attachments, tables, and hidden previews wrap or reflow.
gui_related: true
gui_classification_reason: Floating activity bar geometry, pointer pass-through, and transcript horizontal extent.
depends_on: [ACD-448]
unblocks: [ACD-453, ACD-454]
acceptance_criteria:
  - The Activity Bar pill floats over the transcript with transparent surrounding area and pointer pass-through.
  - The last transcript child is fully visible above the pill at settled bottom scroll.
  - The transcript has zero horizontal scrolling across all cards, tables, and attachments.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - python3 scripts/pm-plans-verify.py lint-contractrefs
risk_class: visual_occlusion_and_scroll_defect
reasoning_tier: high
context_scope: assistant_chat_chrome
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Concepts/chat-assistant-concepts/5.6 Pro/app.js
  - Concepts/chat-assistant-concepts/5.6 Pro/styles.css
node_compile_hint:
  mode: gui_surface_spec
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - source_packet:pm-assistant-plans-v3-restored:REQUIREMENTS.csv:APR-003
  - source_packet:pm-assistant-plans-v3-restored:REQUIREMENTS.csv:APR-004
preserved_exact_tokens:
  - "Chat Activity Bar"
  - "scrollWidth <= clientWidth"
  - "settled bottom scroll"
negative_constraints:
  - Do not replace the floating activity bar with plain text or an opaque in-flow footer strip.
  - Do not allow horizontal scrollbars in the transcript.
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md

```yaml
plan_unit_id: ACD-453
unit_type: gui_requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Opening Activity Detail defaults to a pinned left panel. An explicit Unpin action converts the active panel to floating, but clicking any activity-preview item opens its record PINNED by default, superseding earlier unpinned state. Pinned History and pinned Activity Detail share the available width without overlapping gutters. Activity previews are bounded non-scrolling previews; separate Open Activity buttons are removed and clicking a preview item navigates directly to its corresponding detail view.
gui_related: true
gui_classification_reason: Activity Detail panel docking, preview navigation, and sidebar coexistence.
depends_on: [ACD-452]
unblocks: [ACD-454]
acceptance_criteria:
  - Activity Detail opens pinned on the left by default; unpin makes it float; subsequent preview clicks open pinned.
  - Pinned History and pinned Activity share available width cleanly.
  - Hover previews do not scroll internally; clicking preview rows opens corresponding detail.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: panel_docking_and_navigation_defect
reasoning_tier: high
context_scope: assistant_chat_activity
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Concepts/chat-assistant-concepts/5.6 Pro/app.js
node_compile_hint:
  mode: gui_surface_spec
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - source_packet:pm-assistant-plans-v3-restored:REQUIREMENTS.csv:APR-001
  - source_packet:pm-assistant-plans-v3-restored:REQUIREMENTS.csv:APR-002
  - source_packet:pm-assistant-plans-v3-restored:REQUIREMENTS.csv:APR-006
  - source_packet:pm-assistant-plans-v3-restored:REQUIREMENTS.csv:APR-007
preserved_exact_tokens:
  - "pinned by default"
  - "share available width"
  - "bounded previews"
negative_constraints:
  - Do not persist prior unpinned state over the default pinned navigation rule.
  - Do not keep separate Open Activity buttons in activity previews.
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md

```yaml
plan_unit_id: ACD-454
unit_type: gui_requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Context Lens occupies an in-flow layout row between the chat header and the transcript; expanding the Lens moves the transcript top downward to eliminate message occlusion, and collapsing it releases space. Decorative left-edge box accents, inset shadow stripes, and pseudo-element accent lines are prohibited across transcript records, BSD, To-Dos, schedules, decisions, activity, and menus; uniform perimeter borders and functional connectors are permitted. The composer excludes an internal-browser launcher.
gui_related: true
gui_classification_reason: Context Lens layout row, accent stripe elimination, and composer tool cleanliness.
depends_on: [ACD-452]
unblocks: [ACD-455]
acceptance_criteria:
  - Context Lens expansion pushes transcript down smoothly without occluding messages.
  - Zero decorative left accent stripes or gray substitutes exist across Assistant surfaces.
  - Composer has no internal browser launcher.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: layout_occlusion_and_visual_styling
reasoning_tier: high
context_scope: assistant_chat_layout
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/Back_Seat_Driver.md
node_compile_hint:
  mode: gui_surface_spec
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - source_packet:pm-assistant-plans-v3-restored:REQUIREMENTS.csv:APR-009
  - source_packet:pm-assistant-plans-v3-restored:REQUIREMENTS.csv:APR-010
  - source_packet:pm-assistant-plans-v3-restored:REQUIREMENTS.csv:APR-033
  - source_packet:pm-assistant-plans-v3-restored:REQUIREMENTS.csv:APR-034
preserved_exact_tokens:
  - "Context Lens dropdown occupies a real layout row"
  - "decorative left-edge box accents"
negative_constraints:
  - Do not recolor left stripes gray as a substitute for removing them.
  - Do not place an internal-browser launcher in the chat composer.
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Back_Seat_Driver.md

```yaml
plan_unit_id: ACD-455
unit_type: gui_requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Clicking a plan title, Details, Expand, or Open Plan in transcript navigates to the exact plan in the left editor/document tab system, deduplicating the legacy artifact alias and plan identity into one shared tab. The plan tab exposes rich text/Markdown toggle, Build, Revise, More, Build With Crew, Build At, Export, and Send to Planning Wizard. Under narrow widths (390px-768px), the editor displays full-width with tabs above content and a persistent Return to chat control, temporarily occluding History without altering saved preferences.
gui_related: true
gui_classification_reason: Plan document tab navigation, controls, and responsive presentation.
depends_on: [ACD-452]
unblocks: [ACD-456]
acceptance_criteria:
  - Plan navigation opens a single deduplicated left editor tab rather than modal or duplicate tabs.
  - The plan tab exposes the full suite of owner-backed plan controls.
  - Narrow viewport shows full-width editor with Return to chat affordance.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: plan_navigation_and_tab_defect
reasoning_tier: high
context_scope: assistant_chat_plan_integration
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Assistant_Plan_Runtime.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: gui_surface_spec
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - source_packet:pm-assistant-plans-v3-restored:REQUIREMENTS.csv:APR-036
  - source_packet:pm-assistant-plans-v3-restored:REQUIREMENTS.csv:APR-037
  - source_packet:pm-assistant-plans-v3-restored:REQUIREMENTS.csv:APR-038
preserved_exact_tokens:
  - "left editor/document tab system"
  - "Return to chat"
negative_constraints:
  - Do not treat Plan Details as a modal dialog or open duplicate tabs for plan and artifact alias.
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Assistant_Plan_Runtime.md
```

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Assistant_Plan_Runtime.md, ContractName:Plans/FinalGUISpec.md

```yaml
plan_unit_id: ACD-456
unit_type: gui_requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Agent work items render through typed record grammar with explicit semantic kind: File change, File inspection, Activity, Plan, Artifact, or Work note. Change records display authentic file paths, line numbers, and recorded diff hunks with green (+) additions and red (-) deletions, omitting obsolete editorial prose. Safe inline code formatting and emphasis are supported without raw template leaks. Activity-preview actions preserve domain and target identity (Changes routes to record ID; collaborative previews preserve kind and run ID).
gui_related: true
gui_classification_reason: Typed work records, diff rendering, and preview destination routing.
depends_on: [ACD-452]
unblocks: [ACD-457]
acceptance_criteria:
  - Work records render explicit semantic kind with valid identity and destination.
  - Change records show green additions and red deletions with recorded diff hunks.
  - Obsolete migration prose is absent from live records and fixtures.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: untruthful_work_records_and_diff_formatting
reasoning_tier: high
context_scope: assistant_chat_records
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Concepts/chat-assistant-concepts/5.6 Pro/transcript-records.js
node_compile_hint:
  mode: gui_surface_spec
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - source_packet:pm-assistant-plans-v3-restored:REQUIREMENTS.csv:APR-039
  - source_packet:pm-assistant-plans-v3-restored:REQUIREMENTS.csv:APR-040
  - source_packet:pm-assistant-plans-v3-restored:REQUIREMENTS.csv:APR-041
  - source_packet:pm-assistant-plans-v3-restored:REQUIREMENTS.csv:APR-042
  - source_packet:pm-assistant-plans-v3-restored:REQUIREMENTS.csv:APR-055
preserved_exact_tokens:
  - "File change"
  - "File inspection"
  - "Work note"
  - "green additions and red deletions"
negative_constraints:
  - Do not treat generic agent work boxes as file changes or artifacts without recorded evidence.
  - Do not include obsolete migration comments in live fixtures.
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md

```yaml
plan_unit_id: ACD-457
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Internal work notes are diagnostic behind-the-scenes state and must not appear as ordinary transcript message cards or standalone user artifacts. They remain inspectable in authorized internal/debug surfaces. A concise user-facing progress summary is a distinct typed projection, keeping user conversation clean and actionable.
gui_related: true
gui_classification_reason: Separation of internal work notes from visible transcript message cards.
depends_on: [ACD-456]
unblocks: [ACD-458]
acceptance_criteria:
  - All History threads have zero internal work-note cards in the ordinary user transcript.
  - Diagnostic data is preserved in debug/internal owner and not deleted.
  - User-facing progress summaries remain distinct and readable.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: internal_telemetry_leak_into_transcript
reasoning_tier: high
context_scope: assistant_chat_transcript_boundary
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: gui_surface_spec
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - source_packet:pm-assistant-plans-v3-restored:REQUIREMENTS.csv:APR-056
preserved_exact_tokens:
  - "internal work notes"
  - "behind-the-scenes state"
  - "user-facing progress summary"
negative_constraints:
  - Do not render internal work notes as transcript cards or user artifacts.
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md

```yaml
plan_unit_id: ACD-458
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  History threads and components are fully inventoried to reflect current behavior. Ordinary everyday threads predominantly show running, completed, or successful workflows; unfinished work is not marked Needs attention unless an active fault exists. Recovery and failure examples are clearly partitioned into an intentional, labeled recovery minority. Read-only review fixtures demonstrate findings and inspection without source mutation. The responsive editor/chat split enforces min-size rules so chat is never crushed into the resize handle.
gui_related: true
gui_classification_reason: History thread currentness, normal workflow proportion, and responsive split behavior.
depends_on: [ACD-452, ACD-457]
unblocks: []
acceptance_criteria:
  - Every History thread has an inventoried disposition and before/after component mapping.
  - Ordinary workflows show running/completed/successful work without false Needs attention labels.
  - Failures and recoveries are confined to explicit labeled recovery threads.
  - Read-only review shows findings, not file mutation.
  - Resizing editor/chat split preserves chat visibility above minimum threshold.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: misleading_thread_telemetry_and_layout_crush
reasoning_tier: high
context_scope: assistant_chat_history_and_layout
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/Automated_Testing_System.md
node_compile_hint:
  mode: gui_surface_spec
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - source_packet:pm-assistant-plans-v3-restored:REQUIREMENTS.csv:APR-057
  - source_packet:pm-assistant-plans-v3-restored:REQUIREMENTS.csv:APR-058
  - source_packet:pm-assistant-plans-v3-restored:REQUIREMENTS.csv:APR-066
  - source_packet:pm-assistant-plans-v3-restored:REQUIREMENTS.csv:APR-067
preserved_exact_tokens:
  - "predominantly running/completed/successful"
  - "labeled recovery minority"
  - "inspection and findings"
negative_constraints:
  - Do not mark unfinished work as Needs attention without an actual error or block.
  - Do not squeeze chat into the resize handle track.
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Automated_Testing_System.md
