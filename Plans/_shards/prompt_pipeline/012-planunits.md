# Shard 012: PlanUnits

Source: `Plans/Prompt_Pipeline.md`

Source lines: L675-L3489

Source SHA256: `3f9935cd79f5973c014f4cea35fbad846c6f83b724e0da357b0c653b5b1dfa80`

---

## PlanUnits

### PP-002 - Prompt Pipeline SSOT Document Identity

```yaml
plan_unit_id: PP-002
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Prompt Pipeline is the canonical SSOT owner document for prompt pipeline behavior.
gui_related: false
gui_classification_reason: This unit preserves document identity rather than UI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - "Prompt Pipeline SSOT Document Identity remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0001
preserved_exact_tokens:
  - "Prompt Pipeline (Canonical SSOT)"
negative_constraints: []
preserved_contractrefs: []
owner_hints:
  - "Plans/Prompt_Pipeline.md"
```

### PP-003 - Canonical Owner-Section Requirement Banner

```yaml
plan_unit_id: PP-003
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Prompt Pipeline owner-section requirements preserve product, runtime, storage, UI, and governance details in owner-section form.
gui_related: true
gui_classification_reason: The source span explicitly names UI details as preserved owner-section requirements.
split_recommended: false
depends_on:
  - "PP-002"
unblocks: []
acceptance_criteria:
  - "Canonical Owner-Section Requirement Banner remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0002
preserved_exact_tokens:
  - "Canonical owner-section requirements"
  - "product, runtime, storage, UI, and governance details"
negative_constraints: []
preserved_contractrefs: []
owner_hints:
  - "Plans/Prompt_Pipeline.md"
```

### PP-004 - Requested Effective Compatibility Vocabulary

```yaml
plan_unit_id: PP-004
unit_type: constraint
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Compatibility-only source vocabulary is noncanonical; live Prompt Pipeline wording uses the requested/effective owner terminology and the Puppet Master compliance baseline.
gui_related: false
gui_classification_reason: This unit defines terminology and compliance rather than visual presentation.
split_recommended: false
depends_on:
  - "PP-002"
unblocks: []
acceptance_criteria:
  - "Requested Effective Compatibility Vocabulary remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0003
preserved_exact_tokens:
  - "Requested/effective account identity contract"
  - "Compatibility-only source vocabulary is noncanonical"
  - "Puppet Master"
  - "Plans/DRY_Rules.md"
  - "Plans/Contracts_V0.md"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes:
  - "Compatibility-only source vocabulary is noncanonical; live wording uses the owner terminology below."
owner_hints:
  - "Plans/Prompt_Pipeline.md"
```

### PP-005 - Prompt Pipeline Scope And SSOT Boundary

```yaml
plan_unit_id: PP-005
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Prompt Pipeline owns prompt assembly stages, context compiler output incorporation, context compilation algorithms, compaction/pruning, rotation boundaries, and plugin prompt hook points, while other plans may consume outputs without redefining these algorithms.
gui_related: false
gui_classification_reason: This unit defines ownership and prompt/context compilation policy rather than visual presentation.
split_recommended: false
depends_on:
  - "PP-002"
unblocks: []
acceptance_criteria:
  - "Prompt Pipeline Scope And SSOT Boundary remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0004
preserved_exact_tokens:
  - "prompt assembly stages"
  - "context compiler output"
  - "context-selection"
  - "delta-context"
  - "cache heuristics"
  - "marker files"
  - "skill bundling"
  - "compaction/pruning"
  - "rotation boundaries"
  - "plugin hook points"
negative_constraints:
  - "Other plans MAY describe how they consume compiled output, but they MUST NOT redefine context-selection, delta-context, cache, marker-file, skill-bundling, or compaction algorithms as separate SSOTs."
  - "Plans/FileSafe.md owns safety checks over compiled output; it does not own prompt/context compilation policy, and rewrite-era fallback wording must not turn FileSafe into a second context-compilation SSOT."
preserved_contractrefs:
  - "ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md, ContractName:Plans/Contracts_V0.md"
  - "ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/Architecture_Invariants.md"
owner_hints:
  - "Plans/Prompt_Pipeline.md"
  - "Plans/FileSafe.md"
  - "Plans/Run_Modes.md"
  - "Plans/Architecture_Invariants.md"
```

### PP-006 - Prompt Pipeline DRY Reference Map

```yaml
plan_unit_id: PP-006
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Prompt Pipeline preserves its DRY reference map to locked decisions, canonical contracts, terms, deterministic decisions, FileSafe checks, run-mode context, Personas, Tools, Plugins, GUI/context consumers, and OpenCode baseline extraction.
gui_related: true
gui_classification_reason: This unit includes GUI/context consumer references.
split_recommended: false
depends_on:
  - "PP-005"
unblocks: []
acceptance_criteria:
  - "Prompt Pipeline DRY Reference Map remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0005
preserved_exact_tokens:
  - "Plans/Spec_Lock.json"
  - "Plans/Contracts_V0.md"
  - "Plans/DRY_Rules.md"
  - "Plans/Glossary.md"
  - "Plans/Decision_Policy.md"
  - "Plans/auto_decisions.jsonl"
  - "Plans/FileSafe.md"
  - "Plans/Run_Modes.md"
  - "Plans/Personas.md#PERSONA-INJECTION"
  - "Plans/Tools.md"
  - "Plans/Plugins_System.md"
  - "Plans/FinalGUISpec.md"
  - "Plans/assistant-chat-design.md"
  - "Plans/OpenCode_Deep_Extraction.md §7B"
negative_constraints: []
preserved_contractrefs: []
owner_hints:
  - "Plans/Prompt_Pipeline.md"
```

### PP-007 - Assembly Inputs And Run Envelope

```yaml
plan_unit_id: PP-007
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  The assembly pipeline consumes deterministic inputs and canonical run envelope fields, with node/package/lane/seam identity as canonical execution context and tier labels only derived grouping metadata.
gui_related: false
gui_classification_reason: This unit defines runtime input identity rather than visual presentation.
split_recommended: false
depends_on:
  - "PP-005"
unblocks: []
acceptance_criteria:
  - "Assembly Inputs And Run Envelope remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0006
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0007
preserved_exact_tokens:
  - "ASSEMBLY"
  - "Run envelope"
  - "session_id"
  - "timestamp"
  - "thread_id"
  - "run_id"
  - "node_id: string"
  - "package_id: string"
  - "lane_id: string?"
  - "seam_id: string?"
  - "requested/effective model and variant refs"
  - "active surface"
  - "Node/package/lane/seam identity"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Contracts_V0.md"
owner_hints:
  - "Plans/Prompt_Pipeline.md"
```

### PP-008 - Canonical Prompt Assembly Stage Ordering

```yaml
plan_unit_id: PP-008
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Prompt assembly follows deterministic stages 1 through 9, applies mode-specific overlays during context compilation, applies plugin transforms and tool schemas, and carries the canonical orchestration flow contract for Orchestrator or delegated child runs.
gui_related: false
gui_classification_reason: This unit defines prompt assembly ordering and orchestration metadata rather than visual presentation.
split_recommended: false
depends_on:
  - "PP-007"
unblocks: []
acceptance_criteria:
  - "Canonical Prompt Assembly Stage Ordering remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0008
preserved_exact_tokens:
  - "ASSEMBLY-PIPELINE"
  - "Resolve run config and surface context"
  - "Resolve Persona selection inputs"
  - "Resolve effective Persona and runtime state"
  - "Resolve skills"
  - "Compile context"
  - "Normalize structured attachments"
  - "Assemble Instruction Bundle"
  - "Apply plugin transforms and attach tool schemas"
  - "Finalize"
  - "read_only"
  - "plan_output_scaffold_v1"
  - "full_execution"
  - "assess -> understand -> decompose -> act -> verify"
negative_constraints:
  - "Child/subagent/rotated runs may narrow an inherited overlay, but they MUST NOT widen a read-only overlay into full_execution."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Tools.md, ContractName:Plans/Plugins_System.md"
  - "ContractRef: ContractName:Plans/Plugins_System.md, ContractName:Plans/Tools.md, PolicyRule:Decision_Policy.md§3"
  - "ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/assistant-chat-design.md"
owner_hints:
  - "Plans/Prompt_Pipeline.md"
```

### PP-009 - Skill Resolution Runtime Delivery

```yaml
plan_unit_id: PP-009
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Skill runtime delivery resolves requested skill refs from the PM registry, filters by permissions, de-duplicates by canonical skill id, bundles selected skill content when needed, and preserves on-demand access through the skill tool; provider-native skill directories are discovery/import/export/interoperability inputs only.
gui_related: false
gui_classification_reason: This unit defines skill delivery and registry behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PP-008"
unblocks: []
acceptance_criteria:
  - "Skill Resolution Runtime Delivery remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0009
preserved_exact_tokens:
  - "default_skill_refs"
  - "skill"
  - "canonical skill id"
  - "provider-native skill directories"
  - "discovery/import/export/interoperability inputs only"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Skills_System.md, ContractName:Plans/FileSafe.md, ContractName:Plans/Tools.md"
owner_hints:
  - "Plans/Prompt_Pipeline.md"
  - "Plans/Skills_System.md"
  - "Plans/Tools.md"
  - "Plans/FileSafe.md"
```

### PP-010 - Browser Element Attachment Normalization

```yaml
plan_unit_id: PP-010
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Browser element attachments serialize after context compilation and before final conversation payload emission, preserving chip-based element context distinctions, bounded fields, truncation metadata, and DOM/page-body exclusion.
gui_related: true
gui_classification_reason: This unit concerns browser/composer UI attachment behavior.
split_recommended: false
depends_on:
  - "PP-008"
unblocks: []
acceptance_criteria:
  - "Browser Element Attachment Normalization remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0010
preserved_exact_tokens:
  - "browser_element_context"
  - "Text-selection chips"
  - "element-pick chips"
  - "tag_name"
  - "element_ref?"
  - "text_content?"
  - "role?"
  - "rect"
  - "parent_path?"
  - "truncation occurred"
negative_constraints:
  - "Raw unbounded DOM dumps or page bodies MUST NOT be injected into the prompt through this attachment path."
  - "Blocked or expired chips MUST NOT be serialized as successful user attachments."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FileSafe.md"
owner_hints:
  - "Plans/Prompt_Pipeline.md"
  - "Plans/assistant-chat-design.md"
  - "Plans/storage-plan.md"
  - "Plans/FileSafe.md"
```

### PP-011 - Browser Selection Attachment Normalization

```yaml
plan_unit_id: PP-011
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Browser selection attachments serialize after context compilation in stable thread-prep order before the user freeform message, preserving bounded browser selection fields and rejecting raw page bodies or blocked/expired chips.
gui_related: true
gui_classification_reason: This unit concerns browser selection UI attachment behavior.
split_recommended: false
depends_on:
  - "PP-010"
unblocks: []
acceptance_criteria:
  - "Browser Selection Attachment Normalization remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0010
preserved_exact_tokens:
  - "browser_selection_context"
  - "stable thread-prep order"
  - "browser_session_id"
  - "session_class"
  - "page_url"
  - "selected_text"
  - "selection_anchor?"
  - "requested_target"
  - "effective_target?"
  - "truncation_state"
negative_constraints:
  - "Raw unbounded DOM dumps or page bodies MUST NOT be injected into the prompt through this attachment path."
  - "Blocked or expired chips MUST NOT be serialized as successful user attachments."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md"
owner_hints:
  - "Plans/Prompt_Pipeline.md"
```

### PP-012 - Document Selection Structured Revision Payloads

```yaml
plan_unit_id: PP-012
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Document selection attachments serialize in stable order with bounded selection, routing, sensitivity, truncation, and revision payload metadata; structured revision providers use schema-enforced or locally validated revision shapes.
gui_related: true
gui_classification_reason: This unit concerns document review UI selection and revision prompt behavior.
split_recommended: false
depends_on:
  - "PP-010"
unblocks: []
acceptance_criteria:
  - "Document Selection Structured Revision Payloads remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0010
preserved_exact_tokens:
  - "document_selection_context"
  - "source_surface"
  - "bundle_id?"
  - "doc_id"
  - "doc_path/display_name"
  - "selected_text"
  - "requested_target"
  - "effective_target?"
  - "sensitivity_state"
  - "truncation_state"
  - "annotation_id"
  - "operation"
  - "intent_kind"
  - "operation_payload"
  - "anchor"
  - "schema_enforced_structured_revision"
  - "validated_structured_revision"
  - "/order/shape"
negative_constraints:
  - "Raw unbounded document bodies MUST NOT be injected into the prompt through this attachment path."
  - "Blocked or expired chips MUST NOT be serialized as successful user attachments."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FileSafe.md"
  - "ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md"
owner_hints:
  - "Plans/Prompt_Pipeline.md"
```

### PP-013 - Debug Investigation Context Normalization

```yaml
plan_unit_id: PP-013
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Active Debug investigation context is normalized after context compilation and before final conversation serialization, with deterministic evidence ordering, source grouping identities, bounded summaries/refs, and explicit redaction/truncation state.
gui_related: false
gui_classification_reason: This unit defines debug prompt context normalization rather than visual presentation.
split_recommended: false
depends_on:
  - "PP-008"
unblocks: []
acceptance_criteria:
  - "Debug Investigation Context Normalization remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0011
preserved_exact_tokens:
  - "investigation_id"
  - "bundle_id?"
  - "terminal_session_id"
  - "dev_session_id"
  - "browser_session_id"
  - "debug_target_kind"
  - "primary_target_summary"
  - "current_phase"
  - "state"
  - "verification_strength?"
  - "artifact_refs?"
  - "redaction_state"
  - "truncation_state"
negative_constraints:
  - "Revoked, blocked, expired, and omitted items must not be serialized as successful prompt content."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md"
  - "ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/assistant-chat-design.md"
owner_hints:
  - "Plans/Prompt_Pipeline.md"
```

### PP-014 - Instruction Bundle Minimum Fields

```yaml
plan_unit_id: PP-014
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  The compiled prompt includes an Instruction Bundle with active execution context, requested/effective overlay, Persona IDs, rules context, tool policy, Injected Context breakdown, and active Investigation Context summary when applicable.
gui_related: true
gui_classification_reason: This unit includes user-visible Injected Context and Debug investigation bundle surfaces.
split_recommended: false
depends_on:
  - "PP-008"
  - "PP-013"
unblocks: []
acceptance_criteria:
  - "Instruction Bundle Minimum Fields remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0012
preserved_exact_tokens:
  - "INSTRUCTION-BUNDLE"
  - "InstructionBundleAssembly"
  - "node_id"
  - "package_id"
  - "lane_id?"
  - "seam_id?"
  - "requested and effective workflow overlay"
  - "active Persona identifier(s)"
  - "rules context"
  - "tool-policy snapshot"
  - "Injected Context breakdown"
  - "active Investigation Context summary"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Contracts_V0.md#InstructionBundleAssembly, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/assistant-chat-design.md"
owner_hints:
  - "Plans/Prompt_Pipeline.md"
```

### PP-015 - Instruction Source Budgeting And Projection Boundary

```yaml
plan_unit_id: PP-015
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Instruction Bundle rules keep Investigation Context additive, bound debug summaries, preserve revoked/blocked/expired/omitted visibility without serialization success, budget external instruction sources, treat PM-owned AGENTS.md as canonical, and keep provider-native instruction files as generated/import/export projections.
gui_related: false
gui_classification_reason: This unit defines instruction source authority and budgeting rather than visual presentation.
split_recommended: false
depends_on:
  - "PP-014"
unblocks: []
acceptance_criteria:
  - "Instruction Source Budgeting And Projection Boundary remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0012
preserved_exact_tokens:
  - "Investigation Context"
  - "AGENTS.md"
  - "CLAUDE.md"
  - "bounded instruction-source budget"
  - "path"
  - "byte count"
  - "truncation reason"
  - "system prompt"
  - "persona instructions"
  - "active tool schemas"
  - "untouchable set"
negative_constraints:
  - "Provider-native instruction files are generated/import/export projections, not peer authorities."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Contracts_V0.md"
owner_hints:
  - "Plans/Prompt_Pipeline.md"
```

### PP-016 - Compaction Immune Content Cap

```yaml
plan_unit_id: PP-016
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Compaction and pruning preserve system, persona, instruction-source commitments, active tool schemas, user-pinned context, compaction_immune blocks, and required reasoning blocks while enforcing max_compaction_immune_pct default 30 for the total immune set.
gui_related: false
gui_classification_reason: This unit defines compaction policy rather than visual presentation.
split_recommended: false
depends_on:
  - "PP-015"
unblocks: []
acceptance_criteria:
  - "Compaction Immune Content Cap remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0013
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0014
preserved_exact_tokens:
  - "Compaction and pruning"
  - "compaction_immune: true"
  - "max_compaction_immune_pct"
  - "default: 30"
  - "system prompt"
  - "persona instructions"
  - "active tool schemas"
  - "user-pinned context"
negative_constraints:
  - "A compaction LLM or summary pass must never replace those commitments with an empty or weakened system prompt."
  - "The total immune set MUST NOT exceed max_compaction_immune_pct default 30 percent of the effective context window."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Contracts_V0.md"
  - "ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/Architecture_Invariants.md"
owner_hints:
  - "Plans/Prompt_Pipeline.md"
```

### PP-017 - Compaction Overflow Algorithm

```yaml
plan_unit_id: PP-017
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  The compaction-immune set is partitioned into untouchable and truncatable tiers; only truncatable content is trimmed when over cap, and untouchable overflow emits diag.compaction_immune_overflow while execution continues.
gui_related: false
gui_classification_reason: This unit defines overflow handling rather than visual presentation.
split_recommended: false
depends_on:
  - "PP-016"
unblocks: []
acceptance_criteria:
  - "Compaction Overflow Algorithm remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0015
preserved_exact_tokens:
  - "Untouchable set"
  - "/truncatable"
  - "/compaction-immune"
  - "diag.compaction_immune_overflow"
  - "system prompt"
  - "persona instructions"
  - "active tool schemas"
  - "FIFO"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/Contracts_V0.md"
  - "ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/Architecture_Invariants.md"
  - "ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md"
owner_hints:
  - "Plans/Prompt_Pipeline.md"
```

### PP-018 - Context Assembly Cache Strategies

```yaml
plan_unit_id: PP-018
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Context assembly preserves cache-friendly stable prefixes and applies explicit provider cache strategies for Anthropic, Google/Gemini, OpenAI, and unsupported surfaces without PM managing provider-owned cache state where not applicable.
gui_related: false
gui_classification_reason: This unit defines provider cache strategy rather than visual presentation.
split_recommended: false
depends_on:
  - "PP-007"
unblocks: []
acceptance_criteria:
  - "Context Assembly Cache Strategies remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0016
preserved_exact_tokens:
  - "cache_control"
  - "type: \"ephemeral\""
  - "cachedContent"
  - "Gemini Caching API"
  - "default: 5 minutes"
  - "cachedContentTokenCount"
  - "cache_with_oauth"
  - "OpenAI"
  - "Unsupported surfaces"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/Tools.md"
  - "ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/CLI_Bridged_Providers.md"
owner_hints:
  - "Plans/Prompt_Pipeline.md"
```

### PP-019 - Reasoning Replay Preservation

```yaml
plan_unit_id: PP-019
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Reasoning-block payloads are replay-safe state: PM preserves or converts them before compaction, maps provider-native reasoning_tokens into the UF-085 JSON-safe reasoning bucket / reasoning/thoughts display bucket with counting_semantics and no-double-count rules, tolerates out-of-order proxy delivery, and does not silently strip reasoning content due to adapter limitations.
gui_related: false
gui_classification_reason: This unit defines replay and usage preservation rather than visual presentation.
split_recommended: false
depends_on:
  - "PP-016"
unblocks: []
acceptance_criteria:
  - "Reasoning Replay Preservation remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0016
preserved_exact_tokens:
  - "/reasoning"
  - "/replay"
  - "reasoning_tokens"
  - "UsageEvent"
  - "LiteLLM/Bedrock-style proxies"
negative_constraints:
  - "PM MUST NOT silently strip thinking/reasoning content merely because an adapter lacks a native replay field."
  - "Provider-native reasoning_tokens must not remain an independent active UsageEvent accounting field after UF-085 normalization."
  - "PM must not add reasoning/thoughts to output_total when provider counting_semantics says output_total is already inclusive."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Architecture_Invariants.md"
compatibility_only_notes:
  - "reasoning_tokens is a provider-native raw/compatibility token name in Prompt Pipeline usage mapping; active UsageRecord accounting uses the JSON-safe reasoning bucket with the reasoning/thoughts display alias and counting_semantics."
owner_hints:
  - "Plans/Prompt_Pipeline.md"
```

### PP-020 - Tool Result Compression And Replay Compatibility

```yaml
plan_unit_id: PP-020
unit_type: constraint
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Tool-result compression is evaluated incrementally at every tool-call boundary with causal replay metadata, and OpenCode synthetic compaction text is treated as compatibility hazard rather than user-authored instruction.
gui_related: false
gui_classification_reason: This unit defines replay compatibility and compression semantics rather than visual presentation.
split_recommended: false
depends_on:
  - "PP-019"
unblocks: []
acceptance_criteria:
  - "Tool Result Compression And Replay Compatibility remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0016
preserved_exact_tokens:
  - "_context_updates"
  - "incremental per-tool-call tool-result compression"
  - "message-v2"
  - "message-v2.ts"
  - "What did we do so far?"
  - "synthetic continuation"
  - "compaction metadata"
  - "/assistant/system/synthetic"
negative_constraints:
  - "Synthetic compaction text must not replay as a user-authored instruction."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Run_Modes.md"
compatibility_only_notes:
  - "OpenCode replay evidence from message-v2 / message-v2.ts is a compatibility hazard, not PM canon."
  - "Message boundaries remain explicit across user, assistant, system, and synthetic-continue turns."
stale_retired_dispositions:
  - "The compatibility marker /assistant/system/synthetic resolves to boundary markers only."
owner_hints:
  - "Plans/Prompt_Pipeline.md"
```

### PP-021 - Synthetic Continue Eligibility And State

```yaml
plan_unit_id: PP-021
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Synthetic continue is a bounded fallback for incomplete provider output in regular and yolo runs after compaction/cache reassembly, with state tracked by continue count, assistant tail hash, continue prompt hash, and reason.
gui_related: false
gui_classification_reason: This unit defines runtime continuation state rather than visual presentation.
split_recommended: false
depends_on:
  - "PP-020"
unblocks: []
acceptance_criteria:
  - "Synthetic Continue Eligibility And State remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0017
preserved_exact_tokens:
  - "Synthetic continue"
  - "regular"
  - "yolo"
  - "HITL pause"
  - "synthetic_continue_count"
  - "last_assistant_tail_hash"
  - "last_continue_prompt_hash"
  - "last_continue_reason"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/storage-plan.md"
  - "ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/assistant-chat-design.md"
  - "ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md"
owner_hints:
  - "Plans/Prompt_Pipeline.md"
```

### PP-022 - Synthetic Continue State Machine And Loop Prevention

```yaml
plan_unit_id: PP-022
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Synthetic continue transitions through Idle, Eligible, ContinueInjected, ContinueObserved, and Suppressed, caps automatic attempts at 2, compares tail and prompt hashes, and emits diag.synthetic_continue_loop_prevented instead of retrying forever.
gui_related: false
gui_classification_reason: This unit defines continuation state machine behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PP-021"
unblocks: []
acceptance_criteria:
  - "Synthetic Continue State Machine And Loop Prevention remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0017
preserved_exact_tokens:
  - "Idle"
  - "Eligible"
  - "ContinueInjected"
  - "ContinueObserved"
  - "Suppressed"
  - "2 attempts"
  - "diag.synthetic_continue_loop_prevented"
  - "Task-based checkpoint markers"
  - "seglog"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Run_Modes.md"
  - "ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/Executor_Protocol.md"
owner_hints:
  - "Plans/Prompt_Pipeline.md"
```

### PP-023 - Dynamic Context Thresholds And Low Context Warning

```yaml
plan_unit_id: PP-023
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Dynamic context shrinking uses model-owned thresholds and emits low-context diagnostics when remaining context falls below 15 percent after tool output or injected context, with large tool-output markers using the 512 KiB policy boundary.
gui_related: false
gui_classification_reason: This unit defines context pressure thresholds rather than visual presentation.
split_recommended: false
depends_on:
  - "PP-016"
unblocks: []
acceptance_criteria:
  - "Dynamic Context Thresholds And Low Context Warning remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0018
preserved_exact_tokens:
  - "pressure_start_pct = 70"
  - "pressure_aggressive_pct = 85"
  - "large_block_threshold = 1200"
  - "below 15%"
  - "512 KiB"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/storage-plan.md"
  - "ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md"
owner_hints:
  - "Plans/Prompt_Pipeline.md"
```

### PP-024 - Context Budget Snapshot And Allocation

```yaml
plan_unit_id: PP-024
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  The agent-visible context-budget snapshot exposes effective window, used tokens/bytes, remaining percent, pressure state, previous compaction, tool-result shaping policy, deterministic budget allocation buckets, and priority classes.
gui_related: false
gui_classification_reason: This unit defines runtime budget metadata rather than visual presentation.
split_recommended: false
depends_on:
  - "PP-023"
unblocks: []
acceptance_criteria:
  - "Context Budget Snapshot And Allocation remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0018
preserved_exact_tokens:
  - "full"
  - "summarize"
  - "meta_only"
  - "exclude"
  - "immune(30%)"
  - "history(30%)"
  - "current_turn(15%)"
  - "tool_results(20%)"
  - "contingency(5%)"
  - "P0"
  - "P1"
  - "P2"
  - "P3"
negative_constraints:
  - "Required identity and safety state cannot be silently dropped."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Architecture_Invariants.md"
stale_retired_dispositions:
  - "The budget snapshot is advisory rather than a perfect preflight predictor, but it MUST reflect the latest post-assembly estimate rather than a stale earlier value."
owner_hints:
  - "Plans/Prompt_Pipeline.md"
```

### PP-025 - Post Filter Integrity And Warn Repair

```yaml
plan_unit_id: PP-025
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  After filtering, pruning, or compaction, PM validates role alternation and message boundaries, prevents plugin transforms from deleting or reordering protected content, and either repairs malformed history with audited structural placeholders or aborts serialization.
gui_related: false
gui_classification_reason: This unit defines message integrity validation and repair behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PP-020"
unblocks: []
acceptance_criteria:
  - "Post Filter Integrity And Warn Repair remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0019
preserved_exact_tokens:
  - "plugin-transform"
  - "role alternation"
  - "message-boundary correctness"
  - "warn-and-repair"
  - "placeholder"
  - "structural no-op"
negative_constraints:
  - "Plugin transforms MUST NOT delete system or persona content, reorder messages in a way that breaks alternation, or modify immune content."
  - "Placeholder repair preserves structure only; it MUST NOT invent substantive user intent, assistant claims, tool calls, or hidden policy content."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Plugins_System.md, ContractName:Plans/Architecture_Invariants.md"
  - "ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Architecture_Invariants.md"
owner_hints:
  - "Plans/Prompt_Pipeline.md"
```

### PP-026 - Rotation Follow-Up Run Boundary

```yaml
plan_unit_id: PP-026
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Rotation terminates a run and spawns a follow-up only after deterministic compaction/pruning fails against the final assembled payload; ask and plan are rotation-ineligible, regular and yolo are eligible, and rotated runs inherit continuity state and finish with done.rotated.
gui_related: false
gui_classification_reason: This unit defines follow-up run spawning behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PP-022"
  - "PP-024"
unblocks: []
acceptance_criteria:
  - "Rotation Follow-Up Run Boundary remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0020
preserved_exact_tokens:
  - "ROTATION"
  - "final assembled payload"
  - "ask"
  - "plan"
  - "regular"
  - "yolo"
  - "thread_id"
  - "mode"
  - "strategy"
  - "effective Persona/runtime state"
  - "tool-policy snapshot"
  - "done.rotated"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Run_Modes.md"
owner_hints:
  - "Plans/Prompt_Pipeline.md"
```

### PP-027 - GUI Injected Context Transparency

```yaml
plan_unit_id: PP-027
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  The GUI exposes an Injected Context breakdown per run or turn, including paths, byte counts, truncation reason, and a safe preview of compiled prompt sections for transparency and debugging.
gui_related: true
gui_classification_reason: This unit defines GUI inspection and user-visible prompt transparency behavior.
split_recommended: false
depends_on:
  - "PP-014"
  - "PP-024"
unblocks: []
acceptance_criteria:
  - "GUI Injected Context Transparency remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - "Plans/Prompt_Pipeline.md"
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0021"
preserved_exact_tokens:
  - "GUI"
  - "Injected Context"
  - "paths + byte counts"
  - "truncation reason"
  - "safe preview"
  - "compiled prompt"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/FinalGUISpec.md"
owner_hints:
  - "Plans/Prompt_Pipeline.md"
  - "Plans/FinalGUISpec.md"
```

### PP-028 - Prompt Pipeline Acceptance Gates

```yaml
plan_unit_id: PP-028
unit_type: acceptance_criteria
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Prompt assembly must follow the canonical stage ordering, and compaction must preserve protected tool outputs so skill outputs are not pruned.
gui_related: false
gui_classification_reason: This unit preserves prompt assembly and compaction acceptance criteria rather than visual presentation.
split_recommended: false
depends_on:
  - "PP-008"
  - "PP-009"
  - "PP-016"
  - "PP-020"
unblocks: []
acceptance_criteria:
  - "Prompt Pipeline Acceptance Gates remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - "Plans/Prompt_Pipeline.md"
node_compile_hint:
  mode: acceptance_criteria
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0022"
preserved_exact_tokens:
  - "AC-PP01"
  - "AC-PP02"
  - "canonical stage ordering"
  - "protected tool outputs"
  - "skill"
negative_constraints:
  - "Compaction MUST preserve protected tool outputs; skill outputs MUST NOT be pruned."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Prompt_Pipeline.md#ASSEMBLY-PIPELINE"
  - "ContractRef: ContractName:Plans/Prompt_Pipeline.md#COMPACTION, ContractName:Plans/Run_Modes.md"
owner_hints:
  - "Plans/Prompt_Pipeline.md"
```

### PP-029 - Effective Runtime Resolution Pipeline Boundary

```yaml
plan_unit_id: PP-029
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  The requested/effective runtime pipeline is locked for provider family selection, account or server-profile resolution, billing or entity attribution, and PM-native skills/MCP assembly before provider handoff.
gui_related: false
gui_classification_reason: This unit defines runtime resolver ownership rather than visual presentation.
split_recommended: false
depends_on:
  - "PP-008"
unblocks: []
acceptance_criteria:
  - "Effective Runtime Resolution Pipeline Boundary remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - "Plans/Prompt_Pipeline.md"
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0023"
preserved_exact_tokens:
  - "Effective Persona and Runtime Resolution Pipeline"
  - "provider family selection"
  - "account or server-profile resolution"
  - "billing/entity attribution"
  - "PM-native skills/MCP assembly"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/Models_System.md"
owner_hints:
  - "Plans/Prompt_Pipeline.md"
  - "Plans/Contracts_V0.md"
  - "Plans/Multi-Account.md"
  - "Plans/Models_System.md"
```

### PP-030 - Pre-Prompt Resolution And Skill Readiness Order

```yaml
plan_unit_id: PP-030
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Before final prompt payload emission, runtime resolution follows the ordered surface, provider, account/profile, entitlement, effective runtime, skill readiness, MCP/tool availability, instruction bundle, and frozen snapshot stages, with PM-native skill/tool readiness derived from explicit dependency metadata and transported through normal prompt/context assembly.
gui_related: false
gui_classification_reason: This unit defines pre-prompt resolver and skill readiness ordering rather than visual presentation.
split_recommended: false
depends_on:
  - "PP-029"
  - "PP-009"
unblocks: []
acceptance_criteria:
  - "Pre-Prompt Resolution And Skill Readiness Order remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - "Plans/Prompt_Pipeline.md"
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0024"
preserved_exact_tokens:
  - "surface context and workflow overlay"
  - "requested provider entry"
  - "provider family"
  - "eligible account rows"
  - "server-profile rows"
  - "entitlement or billing-entity selection"
  - "PM-native skill readiness"
  - "required_tool_refs"
  - "optional_tool_refs"
  - "list_skills_for_agent(project_root, permissions)"
  - "prompt_parts"
  - "tool_policy"
  - "transport-agnostic"
negative_constraints:
  - "PM skill context is delivered through compiled prompt/context assembly, not through a mandatory provider-native install path or raw skill names/paths."
preserved_contractrefs: []
owner_hints:
  - "Plans/Prompt_Pipeline.md"
```

### PP-031 - Selection Source And Reason Enumeration

```yaml
plan_unit_id: PP-031
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Prompt Pipeline preserves persona_selection_source as the canonical requested-Persona source enum and adds runtime_selection_source plus a human-readable selection_reason for inspectors and audit history.
gui_related: false
gui_classification_reason: This unit defines resolver source metadata rather than visual presentation.
split_recommended: false
depends_on:
  - "PP-029"
unblocks: []
acceptance_criteria:
  - "Selection Source And Reason Enumeration remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - "Plans/Prompt_Pipeline.md"
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0025"
preserved_exact_tokens:
  - "persona_selection_source"
  - "runtime_selection_source"
  - "manual_ui"
  - "surface_default"
  - "config_default"
  - "persona_preference"
  - "auto_family_pool"
  - "fallback"
  - "selection_reason"
negative_constraints: []
preserved_contractrefs: []
owner_hints:
  - "Plans/Prompt_Pipeline.md"
```

### PP-032 - Requested Persona Precedence Non-Rewrite

```yaml
plan_unit_id: PP-032
unit_type: constraint
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Requested Persona precedence remains explicit override, scoped natural-language override, surface mapping, surface auto resolver candidate, config default, then canonical fallback; runtime/provider selection happens afterward and cannot rewrite the winning requested-Persona source.
gui_related: false
gui_classification_reason: This unit defines Persona resolver precedence and non-rewrite rules rather than visual presentation.
split_recommended: false
depends_on:
  - "PP-031"
unblocks: []
acceptance_criteria:
  - "Requested Persona Precedence Non-Rewrite remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - "Plans/Prompt_Pipeline.md"
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0026"
preserved_exact_tokens:
  - "Canonical requested-Persona precedence"
  - "explicit run-envelope or manual surface override"
  - "active scoped natural-language override"
  - "surface-specific explicit mapping"
  - "surface auto resolver candidate"
  - "config default"
  - "canonical fallback"
negative_constraints:
  - "Runtime/provider selection occurs after requested Persona resolution and MUST NOT rewrite the winning requested-Persona source."
preserved_contractrefs: []
owner_hints:
  - "Plans/Prompt_Pipeline.md"
```

### PP-033 - Runtime Account Profile Resolution Rules

```yaml
plan_unit_id: PP-033
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Provider/runtime resolution preserves requested_platform, effective_platform, provider_family_id, effective account rows, effective connection_profile_id, and billing/entity bucket semantics while keeping provider examples distinct by runtime surface and auth family.
gui_related: false
gui_classification_reason: This unit defines runtime/account/profile resolver fields rather than visual presentation.
split_recommended: false
depends_on:
  - "PP-031"
  - "PP-032"
unblocks: []
acceptance_criteria:
  - "Runtime Account Profile Resolution Rules remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - "Plans/Prompt_Pipeline.md"
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0027"
preserved_exact_tokens:
  - "requested_platform"
  - "effective_platform"
  - "provider_family_id"
  - "effective account row"
  - "connection_profile_id"
  - "billing/entity bucket"
  - "Gemini CLI"
  - "ChatGPT"
  - "API key"
  - "GitHub Copilot"
  - "OpenCode"
negative_constraints: []
preserved_contractrefs: []
owner_hints:
  - "Plans/Prompt_Pipeline.md"
```

### PP-034 - Requested Effective Account Identity Fields

```yaml
plan_unit_id: PP-034
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  The shared requested/effective account identity contract adds requested_account_id beside requested_account_policy, models requested_account_binding independently, carries effective account identity through runtime envelopes, and treats provider_account_id only as subordinate provider-native echo metadata.
gui_related: false
gui_classification_reason: This unit defines account identity schema fields rather than visual presentation.
split_recommended: false
depends_on:
  - "PP-033"
unblocks: []
acceptance_criteria:
  - "Requested Effective Account Identity Fields remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - "Plans/Prompt_Pipeline.md"
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0028"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0029"
preserved_exact_tokens:
  - "requested_account_id"
  - "requested_account_policy"
  - "requested_account_binding"
  - "provider_account_id"
  - "none | preferred | required"
  - "effective_account_id"
  - "effective_provider_identity"
  - "execution_role"
  - "operational_identity"
  - "account_switch_reason"
negative_constraints:
  - "Account choice and policy posture never collapse into one field."
preserved_contractrefs: []
stale_retired_dispositions:
  - "provider_account_id is retired from canonical account-identity naming and remains provider-native echo metadata only."
owner_hints:
  - "Plans/Prompt_Pipeline.md"
```

### PP-035 - Account Identity Display Grammar

```yaml
plan_unit_id: PP-035
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Requested/effective account identity must be visible with Requested account, Requested binding, Effective account, Switch reason, named display grammar, and worker-policy display under the same requested/effective grammar.
gui_related: true
gui_classification_reason: This unit preserves user-visible runtime identity display grammar and switch reason labels.
split_recommended: false
depends_on:
  - "PP-034"
unblocks: []
acceptance_criteria:
  - "Account Identity Display Grammar remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - "Plans/Prompt_Pipeline.md"
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0029"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0030"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0031"
preserved_exact_tokens:
  - "Requested account"
  - "Requested binding"
  - "Effective account"
  - "Switch reason"
  - "Inherited from"
  - "Overridden by"
  - "Requested"
  - "Effective"
  - "Reason"
  - "Support"
  - "worker-policy display"
negative_constraints: []
preserved_contractrefs: []
owner_hints:
  - "Plans/Prompt_Pipeline.md"
  - "Plans/FinalGUISpec.md"
  - "Plans/Orchestrator_Page.md"
```

### PP-036 - Three Axis Resolver Emit Shape

```yaml
plan_unit_id: PP-036
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  The resolver uses the source/request/execution settings model, preserves requested versus effective display values, accepts Persona, override, default, policy, capability, account/profile, worktree, and execution-role inputs, follows the deterministic resolver matrix, and emits requested/effective platform, model, variant, auth mode, account, role, reason, matrix entry, and worker policy fields.
gui_related: false
gui_classification_reason: This unit defines resolver mechanics and emitted fields rather than visual presentation.
split_recommended: false
depends_on:
  - "PP-034"
unblocks: []
acceptance_criteria:
  - "Three Axis Resolver Emit Shape remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - "Plans/Prompt_Pipeline.md"
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0028"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0030"
preserved_exact_tokens:
  - "source"
  - "request"
  - "execution"
  - "working_directory"
  - "FileSafe"
  - "tool cwd"
  - "explicit override -> scoped owner policy -> Persona preference -> surface/stage default -> project/global default -> last-used state when permitted -> provider default"
  - "requested_platform"
  - "effective_platform"
  - "requested_model"
  - "effective_model"
  - "requested_variant"
  - "effective_variant"
  - "requested_auth_mode"
  - "effective_auth_mode"
  - "resolver_matrix_entry"
  - "worker_policy_display"
negative_constraints:
  - "Prompt assembly may reference execution_unit_context but does not inject a separate worktree prompt block merely to make tools operate in the worktree."
preserved_contractrefs: []
owner_hints:
  - "Plans/Prompt_Pipeline.md"
  - "Plans/FileSafe.md"
```

### PP-037 - P5 Export Resolver Gap Packet

```yaml
plan_unit_id: PP-037
unit_type: source_lineage_reconciliation
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  The P5 recovery packet is source-lineage-only reconciliation evidence for export taxonomy, export-family distinctions, source-layer enumeration, resolver actor inputs, deterministic resolver matrix, ranked candidates, winner, and fallback reason. It is not implementation canon for the current runtime/compiler packet and does not block accepted runtime flow.
gui_related: true
gui_classification_reason: The preserved recovery packet includes GUI/export/Orchestrator display grammar and cross-surface inspection gaps.
split_recommended: false
depends_on:
  - "PP-035"
  - "PP-036"
unblocks: []
acceptance_criteria:
  - "P5 Export Resolver Gap Packet remains addressable as source-lineage-only reconciliation evidence."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: source_lineage_reconciliation_not_current_blocker
reasoning_tier: standard
context_scope: prompt_pipeline_reconciliation_gap
implementation_surfaces:
  - "Plans/Prompt_Pipeline.md"
node_compile_hint:
  mode: source_lineage_only_not_required_for_current_runtime
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0031"
preserved_exact_tokens:
  - "record"
  - "bundle"
  - "view"
  - "Evidence / Artifact / Ledger / Run / Record"
  - "source-layer enumeration"
  - "actor-type"
  - "operation-type"
  - "ranked candidates"
  - "winner"
  - "fallback reason"
negative_constraints: []
preserved_contractrefs: []
owner_hints:
  - "Plans/Prompt_Pipeline.md"
  - "Plans/Orchestrator_Page.md"
  - "Plans/storage-plan.md"
  - "Plans/FinalGUISpec.md"
  - "Plans/Models_System.md"
  - "Plans/Multi-Account.md"
  - "Plans/Contracts_V0.md"
```

### PP-038 - Provider Attempt Snapshot Requirements

```yaml
plan_unit_id: PP-038
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Every provider-executed attempt requires requested/effective persona, model, and permission snapshot refs plus requested/effective auth/account policy and account-switch fields so runtime evidence can show requested and effective truth.
gui_related: false
gui_classification_reason: This unit defines provider attempt evidence fields rather than visual presentation.
split_recommended: false
depends_on:
  - "PP-034"
  - "PP-036"
unblocks: []
acceptance_criteria:
  - "Provider Attempt Snapshot Requirements remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - "Plans/Prompt_Pipeline.md"
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0031"
preserved_exact_tokens:
  - "requested/effective persona snapshot ref"
  - "requested/effective model snapshot ref"
  - "requested/effective permission snapshot ref"
  - "requested_auth_mode?"
  - "effective_auth_mode?"
  - "requested_account_policy?"
  - "effective_account_id?"
  - "account_switch_reason?"
negative_constraints: []
preserved_contractrefs: []
owner_hints:
  - "Plans/Prompt_Pipeline.md"
```

### PP-039 - Tier Compatibility And Runtime Identity Owner Boundary

```yaml
plan_unit_id: PP-039
unit_type: constraint
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Prompt Pipeline owns prompt-assembly handoff shape, storage owns durable records, and tier context survives only as compatibility or derived grouping; stale tier-era scope vocabulary must not become a third runtime identity authority.
gui_related: false
gui_classification_reason: This unit constrains runtime identity ownership and compatibility vocabulary rather than visual presentation.
split_recommended: false
depends_on:
  - "PP-007"
  - "PP-034"
unblocks: []
acceptance_criteria:
  - "Tier Compatibility And Runtime Identity Owner Boundary remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - "Plans/Prompt_Pipeline.md"
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0031"
preserved_exact_tokens:
  - "tier context"
  - "compatibility/derived grouping"
  - "requested/effective runtime identity duplication"
  - "tier"
  - "tier/mode/platform/model"
  - "stage/tier/task context"
  - "persona_override_owner_id"
  - "tier_id"
  - "node-identity"
  - "package-identity"
  - "lane-identity"
negative_constraints:
  - "Tier context must not become a third runtime identity authority."
preserved_contractrefs: []
compatibility_only_notes:
  - "Surviving tier labels are compatibility or derived grouping metadata only."
stale_retired_dispositions:
  - "Run envelope, active mode/tier, plan_or_tier_default, Orchestrator tier override, stage/tier/task/repo context, and persona_override_owner_id tier_id are stale scope vocabulary."
owner_hints:
  - "Plans/Prompt_Pipeline.md"
  - "Plans/storage-plan.md"
  - "Plans/Widget_System.md"
```

### PP-040 - Prompt Widget UI Non Ownership Constraint

```yaml
plan_unit_id: PP-040
unit_type: constraint
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Prompt Pipeline must not teach tier-tree or active-tier widget semantics as reusable widget SSOT; prompt examples and context bundles may reference derived tier labels only as compatibility display metadata while Widget_System owns widget taxonomy.
gui_related: true
gui_classification_reason: This unit constrains GUI/widget ownership and display metadata.
split_recommended: false
depends_on:
  - "PP-039"
unblocks: []
acceptance_criteria:
  - "Prompt Widget UI Non Ownership Constraint remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: widget_owner_boundary_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - "Plans/Prompt_Pipeline.md"
node_compile_hint:
  mode: blocked_cross_owner_reconciliation
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0031"
preserved_exact_tokens:
  - "tier-tree"
  - "active-tier"
  - "widget SSOT"
  - "compatibility display metadata"
  - "Widget_System"
  - "Orchestrator_Page.md"
  - "FinalGUISpec.md"
negative_constraints:
  - "Prompt Pipeline MUST NOT teach tier-tree or active-tier widget semantics as reusable widget SSOT."
preserved_contractrefs: []
owner_hints:
  - "Plans/Prompt_Pipeline.md"
  - "Plans/Widget_System.md"
  - "Plans/FinalGUISpec.md"
  - "Plans/Orchestrator_Page.md"
```

### PP-041 - Cross Doc Operational Gap Register

```yaml
plan_unit_id: PP-041
unit_type: source_lineage_reconciliation
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Prompt Pipeline preserves operational gap evidence for newtools, Contracts, Permissions, Personas, storage/usage, tool/runtime surfaces, Source Control, and rewrite-era operational nouns as source-lineage-only reconciliation input. Ownership for current runtime/compiler implementation readiness is resolved by the active owner docs named by each current PlanUnit, not by this historical register.
gui_related: false
gui_classification_reason: This unit preserves cross-document owner gaps rather than visual presentation.
split_recommended: false
depends_on:
  - "PP-039"
unblocks: []
acceptance_criteria:
  - "Cross Doc Operational Gap Register remains addressable as source-lineage-only reconciliation evidence."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: source_lineage_owner_gap_not_current_blocker
reasoning_tier: standard
context_scope: prompt_pipeline_reconciliation_gap
implementation_surfaces:
  - "Plans/Prompt_Pipeline.md"
node_compile_hint:
  mode: source_lineage_only_not_required_for_current_runtime
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0031"
preserved_exact_tokens:
  - "newtools.md"
  - "doctor-ID"
  - "CustomHeadlessTool"
  - "live.*"
  - "memory.gist.*"
  - "AutoRunBoundary/AutoMilestone"
  - "attention_required"
  - "Permissions_System.md"
  - "Contracts_V0.md"
  - "Personas.md"
  - "storage-plan.md"
  - "usage-feature.md"
  - "Formatters_System.md"
  - "LSPSupport.md"
  - "Plugins_System.md"
  - "Skills_System.md"
  - "agent-rules-context.md"
  - "Overseer"
  - "attempt"
  - "Seglog"
negative_constraints: []
preserved_contractrefs: []
owner_hints:
  - "Plans/Prompt_Pipeline.md"
  - "Plans/Contracts_V0.md"
  - "Plans/Permissions_System.md"
  - "Plans/Personas.md"
  - "Plans/storage-plan.md"
  - "Plans/usage-feature.md"
  - "Plans/Tools.md"
  - "Plans/Plugins_System.md"
  - "Plans/Skills_System.md"
  - "Plans/LSPSupport.md"
```

### PP-042 - Dispatch Boundary And Blocked Attempt Integrity

```yaml
plan_unit_id: PP-042
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Prompt Pipeline preserves the dispatch-boundary fracture as a reconciliation target and requires runtime snapshot refs or canonical runtime bundles, first-class blocked/degraded reason ownership, blocked_reason_code as SSOT, and unique attempt_id values across retry or resume.
gui_related: false
gui_classification_reason: This unit defines dispatch and blocked-attempt integrity fields rather than visual presentation.
split_recommended: false
depends_on:
  - "PP-038"
  - "PP-041"
unblocks: []
acceptance_criteria:
  - "Dispatch Boundary And Blocked Attempt Integrity remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: runtime_identity_ssot_fracture
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - "Plans/Prompt_Pipeline.md"
node_compile_hint:
  mode: blocked_cross_owner_reconciliation
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0031"
preserved_exact_tokens:
  - "dispatch boundary"
  - "runtime snapshot refs"
  - "inline canonical runtime bundles"
  - "requested-vs-effective truth"
  - "requested_account_policy"
  - "effective_account_id"
  - "requested concrete account"
  - "blocked/degraded reason family"
  - "account_switch_reason?"
  - "blocked_reason_code"
  - "attempt_id"
negative_constraints:
  - "Retry/resume should not reuse old attempt ids."
preserved_contractrefs: []
owner_hints:
  - "Plans/Prompt_Pipeline.md"
  - "Plans/Contracts_V0.md"
  - "Plans/Multi-Account.md"
  - "Plans/assistant-chat-design.md"
```

### PP-043 - Pathing Migration And Source Lineage Tail

```yaml
plan_unit_id: PP-043
unit_type: source_lineage_residual_disposition
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Pathing migration candidates and source-lineage tail tokens are preserved as source-lineage-only residuals, including package/node, seam/package/node, content-addressed candidates, topic initialization context, and model-tail notes, without converting them into implementation requirements or current runtime/compiler dependencies.
gui_related: false
gui_classification_reason: This unit preserves pathing and lineage notes rather than visual presentation.
split_recommended: false
depends_on:
  - "PP-039"
unblocks: []
acceptance_criteria:
  - "Pathing Migration And Source Lineage Tail remains addressable as source-lineage-only residual evidence."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: source_lineage_pathing_residual_not_current_blocker
reasoning_tier: standard
context_scope: prompt_pipeline_reconciliation_gap
implementation_surfaces:
  - "Plans/Prompt_Pipeline.md"
node_compile_hint:
  mode: source_lineage_residual_not_required_for_current_runtime
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0031"
preserved_exact_tokens:
  - "<phase>/<task>/<subtask>"
  - "<package_id>/<node_id>"
  - "<seam_id>/<package_id>/<node_id>"
  - "content-addressed"
  - "Orchestrator"
  - "source_ref"
  - "Gemini + Opus + Sonnet + GPT-5.4"
  - "Gemini + Opus + Sonnet + GPT-5.4 + GPT-5.2"
negative_constraints: []
preserved_contractrefs: []
owner_hints:
  - "Plans/Prompt_Pipeline.md"
```

### PP-044 - Natural Language Persona Invocation Guardrails

```yaml
plan_unit_id: PP-044
unit_type: constraint
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Natural-language Persona invocation remains conservative and applies only to Persona resolution; it must not silently rewrite requested provider entry, requested auth family, selected billing entity, or selected server profile.
gui_related: false
gui_classification_reason: This unit defines Persona invocation guardrails rather than visual presentation.
split_recommended: false
depends_on:
  - "PP-032"
  - "PP-036"
unblocks: []
acceptance_criteria:
  - "Natural Language Persona Invocation Guardrails remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - "Plans/Prompt_Pipeline.md"
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0032"
preserved_exact_tokens:
  - "Natural-language Persona invocation"
  - "execution_unit_context"
  - "working_directory"
  - "FileSafe"
  - "tool cwd"
  - "Agent-Config"
  - "requested provider entry"
  - "requested auth family"
  - "selected billing entity"
  - "selected server profile"
negative_constraints:
  - "Natural-language Persona invocation MUST NOT silently rewrite provider, auth, billing entity, or server profile selections."
preserved_contractrefs: []
owner_hints:
  - "Plans/Prompt_Pipeline.md"
  - "Plans/FileSafe.md"
```

### PP-045 - Effective Resolution Record Identity Fields

```yaml
plan_unit_id: PP-045
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  The effective-resolution record carries execution role, requested/effective account identity, requested/effective operational identity, account switch lineage, account pressure owner, blocked sequence, optional approval, and DAE jail posture across attempt, usage, inspector, recovery, remediation, and consumer docs.
gui_related: false
gui_classification_reason: This unit defines effective-resolution identity fields rather than visual presentation.
split_recommended: false
depends_on:
  - "PP-034"
  - "PP-038"
unblocks: []
acceptance_criteria:
  - "Effective Resolution Record Identity Fields remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - "Plans/Prompt_Pipeline.md"
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0033"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0034"
preserved_exact_tokens:
  - "execution_role"
  - "requested_account_id"
  - "effective_account_id"
  - "requested_operational_identity"
  - "effective_operational_identity"
  - "account_switch_lineage[]"
  - "account_pressure_owner"
  - "blocked_sequence"
  - "approval_id?"
  - "dae_jail_posture"
negative_constraints: []
preserved_contractrefs: []
owner_hints:
  - "Plans/Prompt_Pipeline.md"
```

### PP-046 - Execution Unit Context Runtime Record

```yaml
plan_unit_id: PP-046
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Prompt Pipeline consumes the Executor-owned execution_unit_context contract and schema for prompt handoff, attempt snapshots, worker spawn inputs, recovery, remediation, and coordination; TierContext is compatibility/decomposition metadata, tier_id is retired, and canonical selection keys from schema-owned execution_unit_type plus execution_unit_id.
gui_related: false
gui_classification_reason: This unit defines runtime context identity rather than visual presentation.
split_recommended: false
depends_on:
  - "PP-045"
unblocks: []
acceptance_criteria:
  - "Execution Unit Context Runtime Record remains addressable as a fine-grained Prompt Pipeline consumer PlanUnit."
  - "Prompt Pipeline references Plans/Executor_Protocol.md and Plans/execution_unit_context.schema.json instead of redefining execution_unit_context fields."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - "Plans/Prompt_Pipeline.md"
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0035"
preserved_exact_tokens:
  - "execution_unit_context"
  - "TierContext"
  - "tier_id"
  - "execution_unit_id"
  - "execution_unit_type"
  - "schema_version"
  - "run"
  - "seam"
  - "package"
  - "node"
  - "overseer"
  - "delegated_subagent"
  - "parent_execution_unit_id"
  - "execution_role"
  - "worktree_id"
negative_constraints:
  - "Prompt Pipeline must not redefine execution_unit_context required fields, optional fields, enum values, or nullability."
  - "Persisted prompt handoff or attempt snapshot payloads must not store execution_unit_context without schema_version."
  - "execution_unit_context payloads must not persist secrets, tokens, passwords, credentials, API keys, provider auth values, or local machine secrets."
preserved_contractrefs: []
compatibility_only_notes:
  - "TierContext is a derived or compatibility-only selection/decomposition helper."
stale_retired_dispositions:
  - "tier_id is retired as canonical selection identity."
owner_hints:
  - "Plans/Prompt_Pipeline.md"
  - "Plans/Executor_Protocol.md"
  - "Plans/execution_unit_context.schema.json"
```

### PP-047 - Execution Unit Context UI Inspection Hook

```yaml
plan_unit_id: PP-047
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  UI inspection consumes execution_unit_context for runtime inspection without owning or redefining the runtime-facing context record.
gui_related: true
gui_classification_reason: This unit preserves UI inspection as a visible consumer of execution_unit_context.
split_recommended: false
depends_on:
  - "PP-046"
unblocks: []
acceptance_criteria:
  - "Execution Unit Context UI Inspection Hook remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - "Plans/Prompt_Pipeline.md"
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0035"
preserved_exact_tokens:
  - "UI inspection"
  - "execution_unit_context"
  - "runtime-facing context object"
negative_constraints: []
preserved_contractrefs: []
owner_hints:
  - "Plans/Prompt_Pipeline.md"
  - "Plans/FinalGUISpec.md"
```

### PP-048 - Blocked Policy And Usage Transfer

```yaml
plan_unit_id: PP-048
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Blocked policy and usage transfer reuse blocked_sequence for blocked episode lineage, rebind execution_unit_context, runtime identity, and blocked_sequence during startup recovery, keep DAE jail and approval posture on the same effective-resolution record, and preserve execution role, account identity, and switch history in usage surfaces.
gui_related: false
gui_classification_reason: This unit defines blocked-policy, recovery, and usage behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PP-045"
  - "PP-046"
unblocks: []
acceptance_criteria:
  - "Blocked Policy And Usage Transfer remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - "Plans/Prompt_Pipeline.md"
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0036"
preserved_exact_tokens:
  - "blocked_sequence"
  - "Startup recovery handshake"
  - "execution_unit_context"
  - "runtime identity"
  - "DAE jail posture"
  - "approval posture"
  - "effective-resolution record"
  - "execution role"
  - "requested/effective account identity"
  - "switch history"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Multi-Account.md"
owner_hints:
  - "Plans/Prompt_Pipeline.md"
  - "Plans/Contracts_V0.md"
  - "Plans/Multi-Account.md"
  - "Plans/Models_System.md"
```

### PP-049 - PM Native Skills MCP Assembly Boundary

```yaml
plan_unit_id: PP-049
unit_type: constraint
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Skill/tool/MCP resolution is part of the prompt pipeline; PM resolves and bundles skills from the PM registry and compatibility roots before provider execution, computes readiness from required and optional tool refs plus permission state, and treats provider-native files, /systems trees, and other external surfaces as optional projections rather than canonical runtime sources.
gui_related: false
gui_classification_reason: This unit defines skill/MCP assembly ownership rather than visual presentation.
split_recommended: false
depends_on:
  - "PP-030"
  - "PP-009"
unblocks: []
acceptance_criteria:
  - "PM Native Skills MCP Assembly Boundary remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - "Plans/Prompt_Pipeline.md"
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0037"
preserved_exact_tokens:
  - "Skill/tool/MCP resolution"
  - "/web/skills/runtime packets"
  - "SSOT"
  - "required_tool_refs"
  - "optional_tool_refs"
  - "PM-owned MCP availability"
  - "provider-native skill files"
  - "/systems"
  - "/projection"
  - "PM registry/bundling/skill /tool delivery"
negative_constraints:
  - "Provider-native skill or MCP files are optional projections and are never the canonical runtime source of truth."
preserved_contractrefs: []
compatibility_only_notes:
  - "Provider-native skill files, /systems-style compatibility trees, and other external surfaces are optional /projection layers for interoperability."
owner_hints:
  - "Plans/Prompt_Pipeline.md"
  - "Plans/Skills_System.md"
  - "Plans/Tools.md"
```

### PP-050 - Runtime Resolution UI Transparency

```yaml
plan_unit_id: PP-050
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Agent-Config and other detailed inspectors must predict likely effective runtime from the same resolution pipeline before a run starts, then show the frozen snapshot and observed provider deviations after the run starts without heuristically recomputing the original decision.
gui_related: true
gui_classification_reason: This unit defines visible runtime inspector transparency before and after a run.
split_recommended: false
depends_on:
  - "PP-029"
  - "PP-035"
  - "PP-045"
unblocks: []
acceptance_criteria:
  - "Runtime Resolution UI Transparency remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - "Plans/Prompt_Pipeline.md"
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0038"
preserved_exact_tokens:
  - "UI transparency requirement"
  - "Agent-Config"
  - "detailed inspectors"
  - "likely effective runtime"
  - "frozen snapshot"
  - "observed provider deviations"
  - "heuristically recomputing"
negative_constraints: []
preserved_contractrefs: []
owner_hints:
  - "Plans/Prompt_Pipeline.md"
  - "Plans/FinalGUISpec.md"
```

### PP-051 - Runtime Attempt Snapshot Handoff Bundle

```yaml
plan_unit_id: PP-051
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Every attempt snapshot preserves project, thread, wizard, resolution, execution_unit_context, requested/effective account identity, execution role, operational identity, blocked sequence, approval scope, and launched run request references as the canonical bridge from planning-time wizard state to the executing run.
gui_related: false
gui_classification_reason: This unit defines attempt snapshot handoff fields rather than visual presentation.
split_recommended: false
depends_on:
  - "PP-045"
  - "PP-046"
unblocks: []
acceptance_criteria:
  - "Runtime Attempt Snapshot Handoff Bundle remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - "Plans/Prompt_Pipeline.md"
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0039"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0040"
preserved_exact_tokens:
  - "Runtime Attempt Snapshot and Handoff Bundle"
  - "project_id"
  - "thread_id"
  - "wizard_id"
  - "resolution_id"
  - "execution_unit_context"
  - "requested/effective account identity"
  - "execution_role"
  - "operational_identity"
  - "blocked_sequence"
  - "approval_scope_key"
  - "launched_run_request_ref"
negative_constraints: []
preserved_contractrefs: []
owner_hints:
  - "Plans/Prompt_Pipeline.md"
```

### PP-052 - Wizard Interview Lineage Bridge

```yaml
plan_unit_id: PP-052
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  auditor_cycle_report preserves planning/governance lineage and an explicit launched-run bridge so review, preview, resume, and drill-through surfaces follow launched_run_id or launched_run_ref rather than timestamps, filenames, or ad hoc provider metadata. Legacy validation_pass_report mirrors may expose the same bridge only with compatibility_only true and cycle_report_ref.
gui_related: false
gui_classification_reason: This unit defines wizard/interview lineage fields rather than visual presentation.
split_recommended: false
depends_on:
  - "PP-051"
unblocks: []
acceptance_criteria:
  - "Wizard Interview Lineage Bridge remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - "Plans/Prompt_Pipeline.md"
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0041"
preserved_exact_tokens:
  - "auditor_cycle_report"
  - "validation_pass_report"
  - "cycle_report_ref"
  - "compatibility_only"
  - "phase_plan_ref"
  - "requirements_quality_report_ref"
  - "workflow_run_id"
  - "pass_verdict"
  - "wizard_snapshot_ref"
  - "launched_run_id"
  - "launched_run_ref"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/interview-subagent-integration.md, ContractName:Plans/Contracts_V0.md"
owner_hints:
  - "Plans/Prompt_Pipeline.md"
  - "Plans/interview-subagent-integration.md"
  - "Plans/Contracts_V0.md"
```

### PP-053 - Historical Runtime Handoff Addendum Disposition

```yaml
plan_unit_id: PP-053
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  The Runtime Attempt Snapshot and Handoff Consolidation Addendum is retained as historical reconciliation context only; canonical runtime handoff fields and rules live in section 6 and this historical note may not override the owner section.
gui_related: false
gui_classification_reason: This unit preserves historical reconciliation context rather than visual presentation.
split_recommended: false
depends_on:
  - "PP-051"
  - "PP-052"
unblocks: []
acceptance_criteria:
  - "Historical Runtime Handoff Addendum Disposition remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: historical_handoff_drift
reasoning_tier: standard
context_scope: prompt_pipeline_historical_disposition
implementation_surfaces:
  - "Plans/Prompt_Pipeline.md"
node_compile_hint:
  mode: compatibility_disposition
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0042"
preserved_exact_tokens:
  - "Runtime Attempt Snapshot and Handoff Consolidation Addendum (2026-03-09)"
  - "historical reconciliation context only"
  - "Runtime Attempt Snapshot and Handoff Bundle"
  - "Nothing in this historical note may override the owner section"
negative_constraints:
  - "The historical addendum must not override the owner section in section 6."
preserved_contractrefs: []
compatibility_only_notes:
  - "Historical runtime handoff note is retained for reconciliation context only."
owner_hints:
  - "Plans/Prompt_Pipeline.md"
```

### PP-001 - Prompt Pipeline Retired Source-Preserving Bridge

```yaml
plan_unit_id: PP-001
unit_type: compatibility_disposition
status: retired
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  PP-001 is retired to migration-lineage-only compatibility disposition after Phase 2B batch 155. Prompt_Pipeline-S0001 through Prompt_Pipeline-S0020 are covered by PP-002 through PP-026, Prompt_Pipeline-S0021 through Prompt_Pipeline-S0042 are covered by PP-027 through PP-053, and Prompt_Pipeline-S0043 through Prompt_Pipeline-S0046 are generated structural/audit dispositions. PP-001 must not re-own or override implementation-facing PlanUnits and must not use source_preserving_planunit compile mode.
gui_related: false
gui_classification_reason: The live retired bridge is migration/audit metadata only; historical GUI-related bridge tokens remain preserved by span_map and coverage_map.
split_recommended: false
depends_on:
  - "PP-002"
  - "PP-003"
  - "PP-004"
  - "PP-005"
  - "PP-006"
  - "PP-007"
  - "PP-008"
  - "PP-009"
  - "PP-010"
  - "PP-011"
  - "PP-012"
  - "PP-013"
  - "PP-014"
  - "PP-015"
  - "PP-016"
  - "PP-017"
  - "PP-018"
  - "PP-019"
  - "PP-020"
  - "PP-021"
  - "PP-022"
  - "PP-023"
  - "PP-024"
  - "PP-025"
  - "PP-026"
  - "PP-027"
  - "PP-028"
  - "PP-029"
  - "PP-030"
  - "PP-031"
  - "PP-032"
  - "PP-033"
  - "PP-034"
  - "PP-035"
  - "PP-036"
  - "PP-037"
  - "PP-038"
  - "PP-039"
  - "PP-040"
  - "PP-041"
  - "PP-042"
  - "PP-043"
  - "PP-044"
  - "PP-045"
  - "PP-046"
  - "PP-047"
  - "PP-048"
  - "PP-049"
  - "PP-050"
  - "PP-051"
  - "PP-052"
  - "PP-053"
unblocks: []
acceptance_criteria:
  - "PP-001 does not override PP-002 through PP-053 for Prompt_Pipeline-S0001 through Prompt_Pipeline-S0042."
  - "Generated Owner / Consumer Map, PlanUnits heading, retired bridge, and Migration Coverage spans remain available for exact-text audit."
  - "Plans/Prompt_Pipeline.md has no residual source_preserving_planunit product coverage after this bridge retirement."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this disposition."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: residual_bridge_overreach
reasoning_tier: standard
context_scope: prompt_pipeline_residual_bridge
implementation_surfaces:
  - "Plans/Prompt_Pipeline.md"
node_compile_hint:
  mode: retired_source_preserving_bridge
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0043"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0044"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0045"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0046"
preserved_exact_tokens:
  - "PP-001"
  - "Prompt Pipeline Residual Source-Preserving Bridge"
  - "Prompt Pipeline Retired Source-Preserving Bridge"
  - "Prompt Pipeline (Canonical SSOT) Source-Preserving PlanUnit"
  - "source_preserving_planunit"
  - "retired_source_preserving_bridge"
  - "source_preserving_bridge_retired"
  - "Owner / Consumer Map"
  - "PlanUnits"
  - "Migration Coverage"
  - "PP-002"
  - "PP-053"
  - "Prompt_Pipeline-S0043"
  - "Prompt_Pipeline-S0044"
  - "Prompt_Pipeline-S0045"
  - "Prompt_Pipeline-S0046"
negative_constraints:
  - "PP-001 must not be used as implementation-ready product coverage for spans now mapped to PP-002 through PP-053."
  - "PP-001 must not use source_preserving_planunit compile mode after Phase 2B batch 155."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md"
compatibility_only_notes:
  - "The retired bridge remains only as migration-lineage compatibility metadata."
stale_retired_dispositions:
  - "source_preserving_bridge_retired"
owner_hints:
  - "Plans/Prompt_Pipeline.md"
```
