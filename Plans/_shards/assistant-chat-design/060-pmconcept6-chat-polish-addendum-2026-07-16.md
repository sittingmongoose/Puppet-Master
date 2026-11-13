# Shard 060: PMConcept6 Chat Polish Addendum - 2026-07-16

Source: `Plans/assistant-chat-design.md`

Source lines: L24819-L25054

Source SHA256: `d6a0adb2d473eee030abd7e011b477a4066eeb8754c44d9f942999781fcdb608`

---

## PMConcept6 Chat Polish Addendum - 2026-07-16

This addendum promotes user-approved PMConcept6 chat polish behaviors into canonical PlanUnits. `Concepts/pm6-build/**` remains illustrative source-lineage only per `Plans/usage-feature.md`. This addendum creates no WorkNodes, NodeSeeds, executable queues, implementation files, runtime artifacts, generated wiring rows, production build tasks, final manifests, or PNC-019 receipts.

### ACD-435 - Stream Footer Pill Content Contract

```yaml
plan_unit_id: ACD-435
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Amended 2026-09-27 (DL-129, ACD-482): the collapsed chat stream footer pill no longer shows
  the subagent chip (status dot plus label) that opened the footer fan-out, the files chip that
  summarized the thread's touched files (one file as its path with +N added and -N removed line
  totals, several as "N file changes" with aggregate totals), or the middle-dot separator between
  them. Live runs are dock lines (ACD-476), each reply that changed files has its own files row
  (ACD-478), and the thread's total file count is in Activity's Changes domain. Threads with
  diagnostics render a problems row that links to the Problems bottom tab. Rewind
  actions live in the composer rewind FAB and never render in the stream footer.
  Amended 2026-10-09 (DL-184): the footer keeps this content and routing, but it is no longer a pill:
  Plans/FinalGUISpec.md#F3-422 now draws it as a content-sized rectangle with the look's inner radius
  (Plans/DRY_Rules.md#DR-069, Plans/FinalGUISpec.md#F3-648).
  Amended 2026-10-09 (DL-180): there is no bottom panel; the problems row opens or reveals the Problems tab, one per
  workspace, a tool tab kind of the home panels (Plans/FinalGUISpec.md#F3-635) placed by the tool-kind affinity of
  Plans/FinalGUISpec.md#F3-634. Read "the Problems bottom tab" in this unit as that Problems tab.
gui_related: true
gui_classification_reason: Defines visible chat footer content and routing behavior.
depends_on: [ACD-013, ACD-058, ACD-059, ACD-216, ACD-217, DL-180, DL-184]
unblocks: [ACD-482]
acceptance_criteria:
  - "No subagent chip, files chip or middle-dot separator renders in the footer pill or above the composer (DL-129, ACD-482)."
  - "Threads with diagnostics render a problems row that opens or reveals the Problems tab (one per workspace, placed by F3-634) scoped to the thread's diagnostics (DL-180)."
  - "No rewind affordance renders in the footer."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
risk_class: chat_footer_projection_drift
reasoning_tier: standard
context_scope: assistant_chat_footer
implementation_surfaces:
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: chat_stream_footer_pill_content_contract
  create_worknodes: false
source_lineage:
  - "Plans/assistant-chat-design.md:4086"
  - "Plans/assistant-chat-design.md:6147"
  - "Plans/assistant-chat-design.md:13480"
  - "Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)"
preserved_exact_tokens:
  - "+N"
  - "N file changes"
  - "Problems"
negative_constraints:
  - "Rewind actions must not render in the stream footer."
  - "Footer content contracts must not hardcode demo thread names."
compatibility_only_notes:
  - "Slint portability: chips are opaque precomputed surfaces; diff totals use precomputed per-theme colors; no arbitrary-content backdrop blur and no SVG filters."
stale_retired_dispositions:
  - "Superseded 2026-09-27 by ACD-482 (DL-129): the subagent chip, the files chip and their separator no longer render above the composer; live runs are dock lines (ACD-476), each reply that changed files has its own files row (ACD-478), and the thread's total file count is in Activity's Changes domain. The problems row and its route to the Problems bottom tab are not part of that decision and are unchanged."
  - "Amended 2026-10-09 (DL-180): the problems row routes to the Problems tab of the home panels (F3-635, F3-634), not a bottom tab."
  - "Amended 2026-10-09 (DL-184): the footer is no longer a pill; F3-422 draws it as a content-sized rectangle."
owner_boundary_notes:
  - "Plans/FinalGUISpec.md owns the footer pill geometry (F3-422; a content-sized rectangle, no longer a pill, since 2026-10-09, DL-184); this unit records footer content and routing semantics."
owner_hints:
  - Plans/assistant-chat-design.md
```

### ACD-436 - Footer FAB Fan-Out Behavior

```yaml
plan_unit_id: ACD-436
unit_type: requirement
status: superseded
owner_doc: Plans/assistant-chat-design.md
superseded_by: ACD-482
canonical_text: >-
  COMPATIBILITY AND SOURCE-LINEAGE ONLY -- NOT ACTIVE CURRENT-PRODUCT TRUTH. Superseded
  2026-09-27 by ACD-482 (DL-129): the footer chips are gone, so their fan-out is retired, and none
  of the acceptance criteria below binds a build. The text below is retained for lineage only.
  Activating a footer chip expands an upward fan-out menu anchored to the footer pill. File
  items open the corresponding editor diff tabs. Subagent items scroll the stream to the
  matching subagent card and flash-highlight it. Only one fan-out is open at a time, and the
  fan-out participates in the chat single-overlay invariant.
gui_related: true
gui_classification_reason: Defines visible footer fan-out menu behavior.
depends_on: [ACD-435, ACD-151, ACD-152, ACD-155]
unblocks: [ACD-482]
acceptance_criteria:
  - "Footer chips expand an upward fan-out menu anchored to the pill."
  - "File items open editor diff tabs for the selected file."
  - "Subagent items scroll to and flash-highlight the matching subagent card in the stream."
  - "The fan-out respects the single-overlay invariant."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
risk_class: chat_footer_projection_drift
reasoning_tier: standard
context_scope: assistant_chat_footer
implementation_surfaces:
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: chat_footer_fab_fan_out_behavior
  create_worknodes: false
source_lineage:
  - "Plans/assistant-chat-design.md:10566"
  - "Plans/assistant-chat-design.md:10739"
  - "Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)"
preserved_exact_tokens:
  - "fan-out"
negative_constraints:
  - "The fan-out must not dispatch rewind actions."
compatibility_only_notes:
  - "Slint portability: the fan-out is a native popup surface; stagger motion is optional and disabled under reduced motion; no arbitrary-content backdrop blur and no SVG filters."
stale_retired_dispositions:
  - "Superseded 2026-09-27 by ACD-482 (DL-129): with the footer chips gone, their fan-out is retired; a dock line reveals its run card (ACD-476), a reply's files row states that turn's file changes (ACD-478), and each file's diff stays reachable from Activity's Changes domain."
owner_boundary_notes: []
owner_hints:
  - Plans/assistant-chat-design.md
```

### ACD-437 - Selector Row Persona Model Mode Contract

```yaml
plan_unit_id: ACD-437
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  The chat header selector row renders exactly three equal-shrink slots in the order Persona,
  Model, Mode, with label ellipsis when narrow. The persona selector is the chat entrypoint
  to the Personas system. Provider/platform selection is owned by the assistant chat surface
  and keeps applies-next-turn semantics and the account-bound Provider -> models registry
  data contract; there is no status-bar platform chip. Reasoning/effort is reached through
  model-selection chaining. The worktree icon button is appended after the selector row.
gui_related: true
gui_classification_reason: Defines visible chat header selector row order and control relocation.
depends_on: [ACD-270, ACD-424, F3-400]
unblocks: []
acceptance_criteria:
  - "The selector row renders Persona, Model, Mode in that order as equal-shrink slots with label ellipsis when narrow."
  - "The persona slot opens the Personas selection surface governed by the persona control canon."
  - "Platform selection is available from the assistant chat surface with applies-next-turn semantics and registry-driven data; there is no status-bar platform chip and the chat header has no standalone platform dropdown."
  - "The worktree icon button renders after the selector row."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
risk_class: chat_header_contract_drift
reasoning_tier: standard
context_scope: assistant_chat_header
implementation_surfaces:
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: chat_selector_row_persona_model_mode_contract
  create_worknodes: false
source_lineage:
  - "Plans/assistant-chat-design.md:186"
  - "Plans/assistant-chat-design.md:2859"
  - "Plans/assistant-chat-design.md:15723"
  - "Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)"
preserved_exact_tokens:
  - "Persona"
  - "Model"
  - "Mode"
negative_constraints:
  - "The chat header must not re-introduce a standalone Platform dropdown."
compatibility_only_notes:
  - "Slint portability: selector slots are opaque widgets with text ellipsis; popouts map to native popup surfaces; no arbitrary-content backdrop blur, no SVG filters, precomputed color math."
stale_retired_dispositions:
  - "Status-bar platform chip relocation retired per the PMConcept7 status-bar trim (Plans/FinalGUISpec.md F3-448 dispositions); requested platform ownership stays on the assistant chat surface with applies-next-turn semantics."
owner_boundary_notes:
  - "Plans/FinalGUISpec.md owns selector-row layout geometry (F3-423); this unit records ordering, relocation, and behavior semantics."
owner_hints:
  - Plans/assistant-chat-design.md
```

### ACD-438 - One Model And Depth Picker And Single-Overlay Invariant

```yaml
plan_unit_id: ACD-438
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: |-
  The chat composer uses one open model/depth picker. Selecting a model keeps its list open and shows that concrete route’s supported depth levels beside the list on desktop and inside the same picker on phone. Model and depth are committed together as one atomic value and apply on the next turn; a model without supported levels commits with no depth. The options come from Models §7.3/§10.4.1, ACD-424 and F3-400 capability truth. High, Medium and Low appear only when supported by that route; no proven levels means no depth choices or empty depth panel, and Unknown support is not inferred as Unsupported. At most one of the combined model/depth picker, mode, thoroughness or persona popouts, or the footer fan-out stack is open. Plan Thoroughness keeps its separate Light, Balanced and Comprehensive control. Every Settings model picker reuses this same interaction, with depth inside the one open picker, while saving the whole pair in its own declared scope.
gui_related: true
gui_classification_reason: Defines the visible shared model/depth picker and single-overlay behavior.
depends_on:
- ACD-424
- ACD-035
- F3-400
- F3-318
- MS-115
unblocks: []
acceptance_criteria:
- The model list stays open while supported depth levels appear beside it on desktop and inside the same picker on phone; depth stays in this same open picker.
- Only route-proven depth choices are offered; High/Medium/Low are not a universal enum. A model without proven levels shows no depth choices, and Unknown remains Unknown.
- Model and depth commit atomically and apply on the next turn; Settings saves the whole pair in the selected row’s declared scope.
- At most one combined model/depth picker, mode, thoroughness or persona popout, or footer fan-out is open at a time.
- Effort and Plan Thoroughness Light/Balanced/Comprehensive remain distinct controls with distinct labels.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
risk_class: chat_header_contract_drift
reasoning_tier: standard
context_scope: assistant_chat_header
implementation_surfaces:
- Plans/assistant-chat-design.md
node_compile_hint:
  mode: chat_model_depth_picker
  create_worknodes: false
source_lineage:
- Plans/assistant-chat-design.md:2806
- Plans/assistant-chat-design.md:5112
- Plans/FinalGUISpec.md:20696
- Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)
- DL-476; settings batch3 fix round r1, 2026-11-12
preserved_exact_tokens:
- High
- Medium
- Low
negative_constraints:
- Effort High/Medium/Low labels must not be merged with Plan Thoroughness Light/Balanced/Comprehensive.
compatibility_only_notes:
- 'Slint portability: one native popup anchored to the model button contains both the model list and its supported depth choices; no arbitrary-content backdrop blur, no SVG filters, precomputed color math.'
- The old fixed High/Medium/Low wording is limited by Models §7.3 and F3-400 route-supported capability truth. Jared’s approved v2 screenshots and the lead’s r2 correction define the current combined model/depth interaction.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/assistant-chat-design.md
```
