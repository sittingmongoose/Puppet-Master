# Shard 041: Ledger Compile Addendum - pldg-20260614-001

Source: `Plans/FinalGUISpec.md`

Source lines: L24623-L24747

Source SHA256: `b1dd98a4b9ca651a23dd8a4a5ed7591facbe2202f2d1d9ef554dc4c0852bc074`

---

## Ledger Compile Addendum - pldg-20260614-001

### F3-387 - View Anchor And Numbering Recovery Compile Addendum

```yaml
plan_unit_id: F3-387
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  FinalGUISpec owns user-visible view anchors and must resolve the missing Dashboard section, missing Views anchors 7.6 through 7.15,
  duplicate 7.4 sections, and duplicate chapter 15 ambiguity by source-first recovery. Existing references to Dashboard, Wizard,
  Projects, Usage, History, Ledger, Evidence, browser, terminal, and promoted widget catalog sections must land on a stable owner
  anchor or an explicit compatibility/source-lineage disposition instead of an empty or ambiguous heading.
gui_related: true
gui_classification_reason: This unit governs GUI views, pages, anchors, layout, and user-visible navigation sections.
depends_on: [PDS-003]
unblocks: [F-067, OP-020]
acceptance_criteria:
  - References to Section 7.2 Dashboard and Sections 7.6 through 7.15 resolve to live view anchors or explicit compatibility dispositions.
  - Duplicate 7.4 and duplicate chapter 15 references no longer make cross-references such as Section 15.3 ambiguous.
  - FinalGUISpec consumer references do not re-own FileManager browser/terminal/hot-reload behavior.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - manual markdown anchor/cross-reference review
risk_class: gui_anchor_drift
reasoning_tier: standard
context_scope: final_gui_view_map
implementation_surfaces: [Plans/FinalGUISpec.md, Plans/FileManager.md, Plans/UI_Command_Catalog.md]
node_compile_hint: {mode: gui_view_anchor_recovery, create_worknodes: false}
source_lineage:
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0015
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0044
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0045
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0046
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0047
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0074
  - source_ref:chat:next-gui-filemanager-cluster
preserved_exact_tokens: ["§7.2", "Dashboard", "§7.6", "§7.15", "Wizard", "Projects", "Usage", "History", "Ledger", "Evidence", "§7.4", "## 15", "§15.3", "Promoted widget catalog"]
negative_constraints:
  - Do not invent new views beyond live source references during anchor recovery.
  - Do not leave duplicate section numbering as the only live target for cross-references.
owner_hints: [Plans/FinalGUISpec.md, Plans/Widget_System.md, Plans/Orchestrator_Page.md, Plans/UI_Command_Catalog.md]
```

### F3-388 - Persona And Advanced Subagent Control Presentation

```yaml
plan_unit_id: F3-388
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Final GUI presents Persona controls as the ordinary user-facing flow and keeps raw subagent_registry controls advanced-only.
  Settings and Agent Config surfaces must distinguish protected platform Personas, tweakable built-ins, and user-created Personas;
  Simple v1 tier override controls may select Personas for phase, task, subtask, and iteration while preserving requested and
  effective Persona disclosure.
gui_related: true
gui_classification_reason: This unit owns visible settings and Agent Config presentation for Personas and subagent controls.
depends_on: [P-053, OSI-425, OSI-426]
unblocks: []
acceptance_criteria:
  - Protected Personas appear locked and explain why they cannot be edited.
  - Tweakable built-ins expose reset/restore semantics against shipped defaults.
  - Advanced raw subagent registry controls are visually separated from ordinary Persona selection.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future Settings/Agent Config UI review
risk_class: user_visible_config_drift
reasoning_tier: standard
context_scope: persona_settings_ui
implementation_surfaces: [Plans/FinalGUISpec.md, Plans/Personas.md, Plans/orchestrator-subagent-integration.md]
node_compile_hint: {mode: gui_persona_settings_contract, create_worknodes: false}
source_lineage:
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0025
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0026
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0028
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0029
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0030
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0031
  - source_ref:chat:persona-simple-v1-advanced-mutability
preserved_exact_tokens: ["Simple Persona-aware overrides", "advanced-only", "protected", "tweakable", "user-created", "phase", "task", "subtask", "iteration", "requested_persona", "effective_persona"]
negative_constraints:
  - Do not require the user to understand raw subagent launch internals for ordinary Persona selection.
  - Do not let advanced registry controls mutate protected Persona bodies.
owner_hints: [Plans/FinalGUISpec.md, Plans/Personas.md, Plans/orchestrator-subagent-integration.md]
```

### F3-389 - FinalGUISpec Numbering Deconfliction

```yaml
plan_unit_id: F3-389
unit_type: constraint
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  FinalGUISpec numbering cleanup is structural only. The live Persistence chapter keeps the Section 15 persistence anchor and
  Section 15.3 Tantivy Indices reference; promoted-widget catalog material must use a non-conflicting addendum anchor or an
  explicitly named promoted-widget section. Terminal Settings Ownership and Agent Config Skills are nested under Settings and
  inspectors rather than remaining competing Section 7.4 headings.
gui_related: true
gui_classification_reason: Numbering deconfliction affects user-visible GUI spec sections, settings sections, and cross-reference anchors.
depends_on: [F3-387]
unblocks: []
acceptance_criteria:
  - Section 15.3 resolves to Persistence/Tantivy rather than an ambiguous promoted-widget chapter.
  - Terminal Settings Ownership and Agent Config Skills tab are subordinate Settings anchors.
  - Structural renumbering does not change GUI behavior or widget ownership.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - manual FinalGUISpec heading review
risk_class: gui_cross_reference_ambiguity
reasoning_tier: standard
context_scope: final_gui_numbering_cleanup
implementation_surfaces: [Plans/FinalGUISpec.md]
node_compile_hint: {mode: numbering_deconfliction, create_worknodes: false}
source_lineage:
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0047
  - source_ref:chat:next-gui-filemanager-cluster
preserved_exact_tokens: ["## 15. Persistence", "### 15.3 Tantivy Indices", "## 15. Promoted widget catalog", "### 7.4 Terminal Settings Ownership", "### 7.4A Agent Config Skills tab", "§15.3"]
negative_constraints:
  - Do not change persistence, Tantivy, settings, or promoted-widget behavior while repairing numbering.
  - Do not leave Section 15.3 ambiguous.
owner_hints: [Plans/FinalGUISpec.md]
```
