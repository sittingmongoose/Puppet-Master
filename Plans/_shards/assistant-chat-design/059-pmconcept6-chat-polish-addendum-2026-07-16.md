# Shard 059: PMConcept6 Chat Polish Addendum - 2026-07-16

Source: `Plans/assistant-chat-design.md`

Source lines: L23798-L24017

Source SHA256: `22a536be201afa59dbfb36d2f5c8a08b5c69a0fb9a7b6c45f93d3b1aacc9de9c`

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
  The collapsed chat stream footer pill shows a subagent chip (status dot plus label) that
  opens the footer fan-out, and a files chip summarizing the thread's touched files: a single
  file renders as its path with +N added and -N removed line totals, and multiple files render
  as "N file changes" with aggregate totals. A middle-dot separator renders between the chips
  when both are visible, and chips shrink with label ellipsis on long content. Threads with
  diagnostics also render a problems row that links to the Problems bottom tab. Rewind
  actions live in the composer rewind FAB and never render in the stream footer.
gui_related: true
gui_classification_reason: Defines visible chat footer chip content and routing behavior.
depends_on: [ACD-013, ACD-058, ACD-059, ACD-216, ACD-217]
unblocks: []
acceptance_criteria:
  - "The subagent chip renders a status dot plus label, shrinks with ellipsis, and opens the footer fan-out on activation."
  - "The files chip renders one file as path with +N and -N totals and multiple files as N file changes with aggregate totals, with added totals styled distinctly from removed totals."
  - "A middle-dot separator renders only when both chips are visible."
  - "Threads with diagnostics render a problems row that opens the Problems bottom tab scoped to the thread's diagnostics."
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
stale_retired_dispositions: []
owner_boundary_notes:
  - "Plans/FinalGUISpec.md owns the footer pill geometry (F3-422); this unit records footer content and routing semantics."
owner_hints:
  - Plans/assistant-chat-design.md
```

### ACD-436 - Footer FAB Fan-Out Behavior

```yaml
plan_unit_id: ACD-436
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Activating a footer chip expands an upward fan-out menu anchored to the footer pill. File
  items open the corresponding editor diff tabs. Subagent items scroll the stream to the
  matching subagent card and flash-highlight it. Only one fan-out is open at a time, and the
  fan-out participates in the chat single-overlay invariant.
gui_related: true
gui_classification_reason: Defines visible footer fan-out menu behavior.
depends_on: [ACD-435, ACD-151, ACD-152, ACD-155]
unblocks: []
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
stale_retired_dispositions: []
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

### ACD-438 - Model To Effort Popout Chaining And Single-Overlay Invariant

```yaml
plan_unit_id: ACD-438
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Selecting a model closes the model mini-popout and automatically opens the reasoning-effort
  popout above the model button, offering High, Medium, and Low; selecting an effort closes
  the popout. At most one of the thoroughness popout, mode popout, model popout, effort
  popout, or the footer fan-out stack is open at a time. The effort labels High, Medium, and
  Low are a distinct control from Plan Thoroughness and its Light, Balanced, and Comprehensive
  labels.
gui_related: true
gui_classification_reason: Defines visible model and effort popout chaining behavior.
depends_on: [ACD-424, ACD-035, F3-400, F3-318]
unblocks: []
acceptance_criteria:
  - "Model selection closes the model popout and opens the effort popout above the model button."
  - "The effort popout offers High, Medium, and Low; selection closes the popout and applies on the next turn."
  - "At most one of thoroughness, mode, model, effort popouts or the footer fan-out is open at a time."
  - "Effort High/Medium/Low and Plan Thoroughness Light/Balanced/Comprehensive remain distinct controls with distinct labels."
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
  mode: chat_model_to_effort_popout_chaining
  create_worknodes: false
source_lineage:
  - "Plans/assistant-chat-design.md:2806"
  - "Plans/assistant-chat-design.md:5112"
  - "Plans/FinalGUISpec.md:20696"
  - "Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)"
preserved_exact_tokens:
  - "High"
  - "Medium"
  - "Low"
negative_constraints:
  - "Effort High/Medium/Low labels must not be merged with Plan Thoroughness Light/Balanced/Comprehensive."
compatibility_only_notes:
  - "Slint portability: chained popouts map to sequential native popup surfaces anchored to the model button; no arbitrary-content backdrop blur, no SVG filters, precomputed color math."
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
  - Plans/assistant-chat-design.md
```
