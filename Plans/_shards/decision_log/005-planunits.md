# Shard 005: PlanUnits

Source: `Plans/Decision_Log.md`

Source lines: L3878-L13192

Source SHA256: `2185e72a51de91f409c0806599ad83c0f8a7c428e08fe6ae48e6e032448921ea`

---

## PlanUnits

### DL-002 - Decision Log Human-Authored Ledger Boundary

```yaml
plan_unit_id: DL-002
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Decision_Log is the human-authored decision ledger for plan-document update
  decisions not captured in auto_decisions or Decision_Policy; auto_decisions is
  pipeline-managed and must not be hand-edited here, and research_packet is
  regenerated after owner/consumer reconciliation and is not fidelity-complete
  Decision_Log canon.
gui_related: false
gui_classification_reason: This unit defines decision-ledger governance boundaries, not UI presentation.
split_recommended: false
depends_on: []
unblocks: [DL-003]
acceptance_criteria:
  - Decision_Log remains human-authored and final for its recorded decisions.
  - Plans/auto_decisions.jsonl remains pipeline-managed and is not hand-edited here.
  - Plans/.pipeline/research_packet.json is not treated as fidelity-complete Decision_Log canon.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: decision_log_authority_drift
reasoning_tier: high
context_scope: decision_log_human_authored_ledger_boundary
implementation_surfaces:
  - Plans/Decision_Log.md
node_compile_hint:
  mode: decision_log_human_authored_ledger_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Log-S0002
preserved_exact_tokens:
  - "`Plans/auto_decisions.jsonl`"
  - "`Plans/.pipeline/research_packet.json`"
  - "`/.pipeline/research_packet.json`"
negative_constraints:
  - "Decision_Log is a human-authored decision ledger, not a derived decision log."
  - "Plans/auto_decisions.jsonl is pipeline-managed and must not be hand-edited here."
owner_hints:
  - Plans/Decision_Log.md
```

### DL-003 - OpenCode Extraction Reference Aid Boundary

```yaml
plan_unit_id: DL-003
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  OpenCode_Deep_Extraction mapping remains a reference aid, while local Puppet
  Master canonical contracts control final subsystem ownership.
gui_related: false
gui_classification_reason: This unit defines source/SSOT precedence rather than UI presentation.
split_recommended: false
depends_on: [DL-002]
unblocks: [DL-004]
acceptance_criteria:
  - OpenCode_Deep_Extraction.md mapping remains a reference aid only.
  - Local canonical contracts control final Puppet Master ownership.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: extraction_mapping_overauthority
reasoning_tier: standard
context_scope: opencode_extraction_reference_aid_boundary
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: opencode_extraction_reference_aid_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Log-S0004
preserved_exact_tokens:
  - "`OpenCode_Deep_Extraction.md`"
  - "Puppet Master"
negative_constraints:
  - "OpenCode extraction mapping must not override local canonical contracts."
owner_hints:
  - Plans/Decision_Log.md
```

### DL-004 - Extraction Section Number Drift Guard

```yaml
plan_unit_id: DL-004
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Section-number drift in OpenCode_Deep_Extraction.md must not become canonical
  drift in local SSOT documents.
gui_related: false
gui_classification_reason: This unit defines anti-drift governance.
split_recommended: false
depends_on: [DL-003]
unblocks: [DL-005]
acceptance_criteria:
  - Section-number drift in extraction source does not propagate into local SSOT docs.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: section_number_canonical_drift
reasoning_tier: standard
context_scope: extraction_section_number_drift_guard
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: extraction_section_number_drift_guard
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Log-S0005
preserved_exact_tokens:
  - "`OpenCode_Deep_Extraction.md`"
negative_constraints:
  - "Section-number drift in the extraction source must not become canonical drift in local SSOT docs."
owner_hints:
  - Plans/Decision_Log.md
```

### DL-005 - Node Graph Execution Model

```yaml
plan_unit_id: DL-005
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  The canonical orchestration model is the node graph; Feature Seam and Work
  Package are first-class graph-owned objects, and Node remains the smallest
  executable unit.
gui_related: false
gui_classification_reason: This unit defines execution model semantics and graph object ownership.
split_recommended: false
depends_on: [DL-004]
unblocks: [DL-006, DL-019]
acceptance_criteria:
  - The node graph is the canonical orchestration model.
  - Feature Seam and Work Package are first-class graph-owned objects.
  - Node remains the smallest executable unit.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: orchestration_model_drift
reasoning_tier: high
context_scope: node_graph_execution_model
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Executor_Protocol.md
  - Plans/Orchestrator_Page.md
node_compile_hint:
  mode: node_graph_execution_model
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Log-S0006
preserved_exact_tokens:
  - "`Feature Seam`"
  - "`Work Package`"
  - "`Node`"
  - "ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Orchestrator_Page.md"
negative_constraints:
  - "Do not replace the node graph with a non-graph orchestration model."
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Executor_Protocol.md
  - Plans/Orchestrator_Page.md
```

### DL-006 - Governance Role Split

```yaml
plan_unit_id: DL-006
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Package Overseer and Seam Overseer are distinct governance roles, while
  runtime remains the canonical owner of readiness, blockers, transitions,
  retries, and dispatch.
gui_related: false
gui_classification_reason: This unit defines runtime governance role boundaries.
split_recommended: false
depends_on: [DL-005]
unblocks: [DL-019]
acceptance_criteria:
  - Package Overseer and Seam Overseer remain distinct.
  - Runtime owns readiness, blockers, transitions, retries, and dispatch.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: governance_role_conflation
reasoning_tier: high
context_scope: governance_role_split
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Executor_Protocol.md
  - Plans/orchestrator-subagent-integration.md
node_compile_hint:
  mode: governance_role_split
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Log-S0007
preserved_exact_tokens:
  - "`Package Overseer`"
  - "`Seam Overseer`"
  - "ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/orchestrator-subagent-integration.md"
negative_constraints:
  - "Package Overseer and Seam Overseer must not collapse into one governance role."
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Executor_Protocol.md
  - Plans/orchestrator-subagent-integration.md
```

### DL-007 - Completion Promotion Distinctions

```yaml
plan_unit_id: DL-007
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Locally Complete, Available to Seam, and Seam Complete remain distinct states;
  package completion alone is insufficient.
gui_related: false
gui_classification_reason: This unit defines completion state semantics.
split_recommended: false
depends_on: [DL-005]
unblocks: [DL-018, DL-020, DL-021]
acceptance_criteria:
  - Locally Complete, Available to Seam, and Seam Complete remain distinct.
  - Package completion alone is insufficient.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: completion_state_conflation
reasoning_tier: high
context_scope: completion_promotion_distinctions
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Orchestrator_Page.md
  - Plans/Run_Graph_View.md
node_compile_hint:
  mode: completion_promotion_distinctions
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Log-S0008
preserved_exact_tokens:
  - "`Locally Complete`"
  - "`Available to Seam`"
  - "`Seam Complete`"
  - "ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Run_Graph_View.md"
negative_constraints:
  - "Package completion alone is insufficient."
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Orchestrator_Page.md
  - Plans/Run_Graph_View.md
```

### DL-008 - Weak Integration First Class Scope

```yaml
plan_unit_id: DL-008
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Weak integration remains first-class and includes runtime/GUI mismatch,
  contract mismatch, workflow gaps, and architecture drift.
gui_related: true
gui_classification_reason: Weak integration explicitly includes runtime/GUI mismatch and user-visible workflow gaps.
split_recommended: false
depends_on: [DL-007]
unblocks: [DL-020, DL-021]
acceptance_criteria:
  - Weak integration remains first-class.
  - Weak integration includes runtime/GUI mismatch, contract mismatch, workflow gaps, and architecture drift.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: weak_integration_underclassification
reasoning_tier: high
context_scope: weak_integration_first_class_scope
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Orchestrator_Page.md
  - Plans/Glossary.md
node_compile_hint:
  mode: weak_integration_first_class_scope
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Log-S0009
preserved_exact_tokens:
  - "`Weak Integration`"
  - "runtime/GUI mismatch"
  - "ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Glossary.md"
negative_constraints:
  - "Weak integration must not be downgraded to a non-first-class concern."
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Orchestrator_Page.md
  - Plans/Glossary.md
```

### DL-009 - Corroboration Threshold Rule

```yaml
plan_unit_id: DL-009
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  High-impact claims use deterministic 2-of-3 corroboration, while lesser
  unresolved concerns remain visible as non-blocking advisory concerns.
gui_related: false
gui_classification_reason: This unit defines corroboration policy rather than UI presentation.
split_recommended: false
depends_on: [DL-008]
unblocks: [DL-024]
acceptance_criteria:
  - High-impact claims use deterministic 2-of-3 corroboration.
  - Lesser unresolved concerns remain visible as non-blocking advisory concerns.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: corroboration_threshold_drift
reasoning_tier: high
context_scope: corroboration_threshold_rule
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Orchestrator_Page.md
  - Plans/Decision_Policy.md
node_compile_hint:
  mode: corroboration_threshold_rule
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Log-S0010
preserved_exact_tokens:
  - "`2-of-3`"
  - "ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Decision_Policy.md"
negative_constraints:
  - "High-impact claims must not bypass deterministic 2-of-3 corroboration."
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Orchestrator_Page.md
  - Plans/Decision_Policy.md
```

### DL-010 - Graph Patch Lineage Generation

```yaml
plan_unit_id: DL-010
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Graph patching creates a new graph generation and preserves superseded
  historical paths as visible lineage.
gui_related: true
gui_classification_reason: Superseded historical paths remain visible in Run Graph lineage.
split_recommended: false
depends_on: [DL-005]
unblocks: [DL-019]
acceptance_criteria:
  - Graph patching creates a new graph generation.
  - Superseded historical paths remain visible lineage.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: graph_patch_lineage_loss
reasoning_tier: high
context_scope: graph_patch_lineage_generation
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Run_Graph_View.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: graph_patch_lineage_generation
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Log-S0011
preserved_exact_tokens:
  - "graph generation"
  - "visible lineage"
  - "ContractRef: ContractName:Plans/Run_Graph_View.md, ContractName:Plans/storage-plan.md"
negative_constraints:
  - "Graph patches must not overwrite superseded historical paths without visible lineage."
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Run_Graph_View.md
  - Plans/storage-plan.md
```

### DL-011 - Source Control Worktree First Boundary

```yaml
plan_unit_id: DL-011
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Source Control is worktree-first and compact, while Orchestrator carries
  lane/package/seam operational context.
gui_related: false
gui_classification_reason: This unit defines cross-document ownership boundaries for Source Control and Orchestrator.
split_recommended: false
depends_on: [DL-005]
unblocks: [DL-026]
acceptance_criteria:
  - Source Control stays worktree-first and compact.
  - Orchestrator carries lane/package/seam operational context.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: source_control_orchestrator_boundary_drift
reasoning_tier: high
context_scope: source_control_worktree_first_boundary
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/WorktreeGitImprovement.md
  - Plans/GitHub_Integration.md
node_compile_hint:
  mode: source_control_worktree_first_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Log-S0012
preserved_exact_tokens:
  - "worktree-first"
  - "lane/package/seam"
  - "ContractRef: ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/GitHub_Integration.md"
negative_constraints:
  - "Source Control must not absorb lane/package/seam operational context."
owner_hints:
  - Plans/Decision_Log.md
  - Plans/WorktreeGitImprovement.md
  - Plans/GitHub_Integration.md
```

### DL-012 - Shared Runtime Identity Actor Scope

```yaml
plan_unit_id: DL-012
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Requested/effective runtime identity is shared across assistant, interviewer,
  builders, overseers, and node workers without collapsing those actors into
  one ontology.
gui_related: false
gui_classification_reason: This unit defines runtime identity scope and actor boundaries.
split_recommended: false
depends_on: [DL-005]
unblocks: [DL-016]
acceptance_criteria:
  - Requested/effective runtime identity spans all named runtime actors.
  - Actor types do not collapse into one ontology.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: runtime_identity_actor_conflation
reasoning_tier: high
context_scope: shared_runtime_identity_actor_scope
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Prompt_Pipeline.md
  - Plans/Multi-Account.md
node_compile_hint:
  mode: shared_runtime_identity_actor_scope
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Log-S0013
preserved_exact_tokens:
  - "Requested/effective"
  - "assistant"
  - "interviewer"
  - "builders"
  - "overseers"
  - "node workers"
  - "ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Multi-Account.md"
negative_constraints:
  - "Shared runtime identity must not collapse distinct actors into one ontology."
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Prompt_Pipeline.md
  - Plans/Multi-Account.md
```

### DL-013 - Blocked Approval Runtime Identity

```yaml
plan_unit_id: DL-013
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Blocked episodes anchored by run_id, node_id, blocked_sequence, and optional
  attempt_id supersede request-centric HITL identity as canonical runtime
  approval scope.
gui_related: false
gui_classification_reason: This unit defines runtime approval identity fields.
split_recommended: false
depends_on: [DL-006, DL-012]
unblocks: [DL-022, DL-023]
acceptance_criteria:
  - Blocked approval identity is anchored by run_id, node_id, blocked_sequence, and optional attempt_id.
  - Request-centric HITL identity is superseded as canonical runtime approval scope.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: blocked_approval_identity_drift
reasoning_tier: high
context_scope: blocked_approval_runtime_identity
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Contracts_V0.md
  - Plans/human-in-the-loop.md
node_compile_hint:
  mode: blocked_approval_runtime_identity
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Log-S0014
preserved_exact_tokens:
  - "`run_id`"
  - "`node_id`"
  - "`blocked_sequence`"
  - "`attempt_id?`"
  - "ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/human-in-the-loop.md"
negative_constraints:
  - "Request-centric HITL identity must not remain canonical runtime approval scope once blocked-episode identity is available."
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Contracts_V0.md
  - Plans/human-in-the-loop.md
```

### DL-014 - Navigation Primitive Boundary

```yaml
plan_unit_id: DL-014
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  route_target is the canonical navigation contract, OpenSubject is the
  canonical identity-native source-open contract, and resume_url is serialized
  transport only.
gui_related: false
gui_classification_reason: This unit defines navigation contract boundaries, not a specific UI surface.
split_recommended: false
depends_on: [DL-013]
unblocks: []
acceptance_criteria:
  - route_target remains the canonical navigation contract.
  - OpenSubject remains the canonical identity-native source-open contract.
  - resume_url remains serialized transport only.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: navigation_primitive_boundary_drift
reasoning_tier: high
context_scope: navigation_primitive_boundary
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Crosswalk.md
  - Plans/FileManager.md
node_compile_hint:
  mode: navigation_primitive_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Log-S0015
preserved_exact_tokens:
  - "`route_target`"
  - "`OpenSubject`"
  - "`resume_url`"
  - "ContractRef: ContractName:Plans/Crosswalk.md, ContractName:Plans/FileManager.md"
negative_constraints:
  - "resume_url must not become the canonical navigation contract."
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Crosswalk.md
  - Plans/FileManager.md
```

### DL-015 - Debug Evidence Capture Hygiene

```yaml
plan_unit_id: DL-015
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Debug instrumentation and investigation evidence follow a non-citation
  operational ledger rule: secrets in logs, PII, and diff fatigue must be
  planned for up front, and downstream captures use allowlisted log shapes or
  structured fields rather than free-form dump capture.
gui_related: true
gui_classification_reason: This unit governs debug/investigation evidence capture and runtime artifact inspection hygiene.
split_recommended: false
depends_on: [DL-010]
unblocks: []
acceptance_criteria:
  - Secrets in logs, PII, and diff fatigue are planned for up front.
  - Downstream debug captures use allowlisted log shapes or structured fields.
  - Free-form dump capture is avoided.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: debug_evidence_capture_hygiene_gap
reasoning_tier: high
context_scope: debug_evidence_capture_hygiene
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Contracts_V0.md
  - Plans/Architecture_Invariants.md
  - Plans/Runtime_Artifacts_Panel.md
node_compile_hint:
  mode: debug_evidence_capture_hygiene
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Log-S0016
preserved_exact_tokens:
  - "secrets in logs"
  - "PII"
  - "diff fatigue"
  - "allowlisted log shapes"
  - "structured fields"
  - "ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/Runtime_Artifacts_Panel.md"
negative_constraints:
  - "Debug captures should use allowlisted log shapes or structured fields rather than free-form dump capture."
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Contracts_V0.md
  - Plans/Architecture_Invariants.md
  - Plans/Runtime_Artifacts_Panel.md
```

### DL-016 - Provider Runtime Actor Envelope

```yaml
plan_unit_id: DL-016
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  The shared provider-runtime contract applies beyond Orchestrator to assistant,
  interviewer, requirements builder, PRD builder, overseers, node workers, and
  provider-backed chat/tool turns; actor_kind and execution_role are required
  for auditability and storage must not key provider account snapshots only by
  run_id.
gui_related: false
gui_classification_reason: This unit defines provider-runtime actor and storage identity boundaries.
split_recommended: false
depends_on: [DL-012]
unblocks: []
acceptance_criteria:
  - Shared provider-runtime identity applies beyond Orchestrator.
  - actor_kind and execution_role are preserved for non-run auditability and replay.
  - storage-plan does not key provider account snapshots only by run_id when runtime actors include non-run actors.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: provider_runtime_actor_envelope_gap
reasoning_tier: high
context_scope: provider_runtime_actor_envelope
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Multi-Account.md
  - Plans/Models_System.md
  - Plans/Prompt_Pipeline.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: provider_runtime_actor_envelope
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Log-S0017
preserved_exact_tokens:
  - "`/model/effort/persona/auth/account`"
  - "`/effective`"
  - "`actor_kind`"
  - "`execution_role`"
  - "`run_id`"
  - "ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/Models_System.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/storage-plan.md"
negative_constraints:
  - "storage-plan must not key provider account snapshots only by run_id when runtime actors include assistant, interviewer, builders, overseers, and node workers."
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Multi-Account.md
  - Plans/Models_System.md
  - Plans/Prompt_Pipeline.md
  - Plans/storage-plan.md
```

### DL-017 - Support Decision Drift Guard

```yaml
plan_unit_id: DL-017
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Supporting planning machinery is not exempt from decision traceability:
  sharding_config and auto_decisions must not disagree on fallback chunk-line
  settings because decision-state drift in support files can corrupt
  owner/consumer reconciliation.
gui_related: false
gui_classification_reason: This unit defines planning-governance consistency constraints.
split_recommended: false
depends_on: [DL-002]
unblocks: []
acceptance_criteria:
  - sharding_config and auto_decisions do not disagree on fallback chunk-line settings.
  - Decision-state drift in support files is treated as owner/consumer reconciliation risk.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: support_decision_state_drift
reasoning_tier: high
context_scope: support_decision_drift_guard
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/DRY_Rules.md
  - Plans/Decision_Policy.md
node_compile_hint:
  mode: support_decision_drift_guard
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Log-S0018
preserved_exact_tokens:
  - "`Plans/sharding_config.json`"
  - "`/sharding_config.json`"
  - "`Plans/auto_decisions.jsonl`"
  - "`/auto_decisions.jsonl`"
  - "`chunk-line`"
  - "`/decision`"
  - "ContractRef: ContractName:Plans/DRY_Rules.md, ContractName:Plans/Decision_Policy.md"
negative_constraints:
  - "Plans/sharding_config.json and Plans/auto_decisions.jsonl must not disagree on fallback chunk-line settings."
owner_hints:
  - Plans/Decision_Log.md
  - Plans/DRY_Rules.md
  - Plans/Decision_Policy.md
```

### DL-018 - Governance Label Copy Boundary

```yaml
plan_unit_id: DL-018
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Canonical copy favors precise runtime and user-facing labels for seams, graph
  objects, overseers, completion/blocking/promotion states, corroboration,
  challenges, advisory concerns, graph patches, and generation updates; label,
  action, runtime, and object consumers must not invent alternate peer terms.
gui_related: true
gui_classification_reason: This unit governs user-facing labels and copy boundaries.
split_recommended: true
split_recommendation_reason: Decision_Log-S0019 contains both copy-label constraints and graph-owned governance semantics.
depends_on: [DL-007, DL-008]
unblocks: [DL-019, DL-020, DL-021]
acceptance_criteria:
  - Canonical runtime and user-facing labels remain precise and preserved.
  - /labels, /action, /runtime, and /object consumers do not invent alternate peer terms.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: governance_label_copy_drift
reasoning_tier: high
context_scope: governance_label_copy_boundary
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Orchestrator_Page.md
  - Plans/Run_Graph_View.md
  - Plans/Decision_Policy.md
node_compile_hint:
  mode: governance_label_copy_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Log-S0019
preserved_exact_tokens:
  - "`Seams`"
  - "`Feature Seam`"
  - "`Work Package`"
  - "`Package Overseer`"
  - "`Seam Overseer`"
  - "`Locally Complete`"
  - "`Seam Complete`"
  - "`Completion Blocked`"
  - "`Weak Integration`"
  - "`Promotion Revoked`"
  - "`Corroboration Requested`"
  - "`Generation Updated`"
negative_constraints:
  - "`/labels`, `/action`, `/runtime`, and `/object` consumers must not invent alternate peer terms."
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Orchestrator_Page.md
  - Plans/Run_Graph_View.md
  - Plans/Decision_Policy.md
```

### DL-019 - Graph Owned Governance Semantics

```yaml
plan_unit_id: DL-019
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Governance semantics stay graph-owned: a run is the full canonical graph under
  deterministic runtime control, a work package is a coherent precomputed
  subgraph with a local overseer, a feature seam is a cross-package oversight
  scope, a node is the smallest executable work unit, and newly discovered work
  becomes remediation nodes or graph-patch requests.
gui_related: false
gui_classification_reason: This unit defines graph-governance ownership and execution semantics.
split_recommended: true
split_recommendation_reason: Decision_Log-S0019 contains both copy-label constraints and graph-owned governance semantics.
depends_on: [DL-005, DL-006, DL-010, DL-018]
unblocks: [DL-020, DL-021]
acceptance_criteria:
  - Governance semantics remain graph-owned.
  - Runs, work packages, feature seams, and nodes retain their source meanings.
  - Newly discovered work becomes remediation nodes or graph-patch requests.
  - Seam completion requires integration quality rather than package-local pass states alone.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: graph_governance_semantics_drift
reasoning_tier: high
context_scope: graph_owned_governance_semantics
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Orchestrator_Page.md
  - Plans/Run_Graph_View.md
  - Plans/Decision_Policy.md
node_compile_hint:
  mode: graph_owned_governance_semantics
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Log-S0019
preserved_exact_tokens:
  - "`run`"
  - "`work package`"
  - "`feature seam`"
  - "`node`"
  - "`/corroboration`"
negative_constraints:
  - "Seam completion requires integration quality rather than package-local pass states alone."
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Orchestrator_Page.md
  - Plans/Run_Graph_View.md
  - Plans/Decision_Policy.md
```

### DL-020 - Seam Weak Integration UI Visibility

```yaml
plan_unit_id: DL-020
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Seams UI must summarize weak integration visibly, group concerns under
  readable headings such as Wiring, Workflow, State, GUI, and Design, and keep
  Locally Complete, Available to Seam, and Seam Complete distinct from lane to
  package, package to seam, and seam completion promotion boundaries.
gui_related: true
gui_classification_reason: This unit explicitly governs Seams UI summaries and readable headings.
split_recommended: true
split_recommendation_reason: Decision_Log-S0020 contains both UI visibility rules and lifecycle/reopen policy.
depends_on: [DL-007, DL-008, DL-019]
unblocks: [DL-021]
acceptance_criteria:
  - Seams UI visibly summarizes weak integration.
  - Weak integration concerns are grouped under readable headings including Wiring, Workflow, State, GUI, and Design.
  - Completion states remain distinct from promotion boundaries.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: seam_weak_integration_visibility_gap
reasoning_tier: high
context_scope: seam_weak_integration_ui_visibility
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Orchestrator_Page.md
  - Plans/Run_Graph_View.md
  - Plans/Decision_Policy.md
  - Plans/Glossary.md
node_compile_hint:
  mode: seam_weak_integration_ui_visibility
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Log-S0020
preserved_exact_tokens:
  - "`Wiring`"
  - "`Workflow`"
  - "`State`"
  - "`GUI`"
  - "`Design`"
  - "`Lane to Package`"
  - "`Package to Seam`"
  - "`Seam Completion`"
negative_constraints:
  - "Weak integration must not be only a badge without visible seam summary and readable buckets."
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Orchestrator_Page.md
  - Plans/Run_Graph_View.md
  - Plans/Decision_Policy.md
  - Plans/Glossary.md
```

### DL-021 - Reopen Revocation Weak Integration Policy

```yaml
plan_unit_id: DL-021
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Revocation and reopen semantics are explicit named states, blocked states
  expose blocked reason, blocked owner, and recovery context, weak-integration
  buckets include runtime/governance visibility, state, workflow, contract, UX,
  architecture, and recovery gaps, and Decision_Policy needs first-class policy
  objects and transitions for concerns, corroboration, promotions, and
  superseded revoked/reopened states.
gui_related: true
gui_classification_reason: This unit governs visible blocked states, weak-integration buckets, UX semantics, and missing operator affordances.
split_recommended: true
split_recommendation_reason: Decision_Log-S0020 contains both UI visibility rules and lifecycle/reopen policy.
depends_on: [DL-020]
unblocks: [DL-022, DL-026]
acceptance_criteria:
  - Promotion Revoked, Seam Completion Revoked, Reopened, Reopened by Patch, and Reopened by New Evidence remain explicit named states.
  - Blocked states expose blocked reason, blocked owner, and recovery context.
  - Decision_Policy owns first-class policy objects and transitions for concerns, corroboration, promotions, and superseded revoked/reopened states.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: reopen_revocation_policy_gap
reasoning_tier: high
context_scope: reopen_revocation_weak_integration_policy
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Orchestrator_Page.md
  - Plans/Run_Graph_View.md
  - Plans/Decision_Policy.md
  - Plans/Glossary.md
node_compile_hint:
  mode: reopen_revocation_weak_integration_policy
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Log-S0020
preserved_exact_tokens:
  - "`Promotion Revoked`"
  - "`Seam Completion Revoked`"
  - "`Reopened`"
  - "`Reopened by Patch`"
  - "`Reopened by New Evidence`"
  - "`/recovery`"
  - "`/revoked/reopened`"
negative_constraints:
  - "Blocked and weak-integration lifecycle states must not be collapsed into generic failure states."
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Orchestrator_Page.md
  - Plans/Run_Graph_View.md
  - Plans/Decision_Policy.md
  - Plans/Glossary.md
```

### DL-022 - Approval Anchoring Evidence Governance

```yaml
plan_unit_id: DL-022
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Approval anchoring moves to canonical runtime identity: run_id, node_id,
  blocked_sequence, optional attempt_id, and execution-unit context refs
  supersede request-centric button copy, request-centric persistence language,
  and tier-boundary approval CTA framing; gate/evidence schema mismatch is a
  first-class governance defect that evidence contracts must expose.
gui_related: true
gui_classification_reason: This unit affects approval CTA framing and evidence defect exposure.
split_recommended: false
depends_on: [DL-013, DL-021]
unblocks: [DL-023]
acceptance_criteria:
  - Approval anchoring uses canonical runtime identity fields.
  - Request-centric button copy, persistence language, and tier-boundary CTA framing are superseded.
  - Gate/evidence schema mismatch is exposed as first-class governance defect.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: approval_anchor_evidence_governance_drift
reasoning_tier: high
context_scope: approval_anchoring_evidence_governance
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Contracts_V0.md
  - Plans/human-in-the-loop.md
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: approval_anchoring_evidence_governance
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Log-S0021
preserved_exact_tokens:
  - "`run_id`"
  - "`node_id`"
  - "`blocked_sequence`"
  - "`attempt_id`"
  - "`CTA`"
  - "`/evidence`"
negative_constraints:
  - "Request-centric approval framing must not supersede canonical runtime identity anchoring."
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Contracts_V0.md
  - Plans/human-in-the-loop.md
  - Plans/Progression_Gates.md
```

### DL-023 - Blocked Episode Identity Migration

```yaml
plan_unit_id: DL-023
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Worktree and graph approval identity must stop hanging on tier_id,
  request-centric HITL, or request_id payloads once blocked-episode runtime
  identity is available; graph HITL command payload identity moves to
  blocked-episode anchored identity while preserving Contracts_V0 compatibility
  notes for the request-centric migration.
gui_related: false
gui_classification_reason: This unit defines approval identity migration and compatibility notes.
split_recommended: true
split_recommendation_reason: Decision_Log-S0022 contains identity migration, corroboration, help clusters, and retained cleanup concerns.
depends_on: [DL-013, DL-022]
unblocks: [DL-024, DL-025, DL-026]
acceptance_criteria:
  - Approval identity stops depending on tier_id, request-centric HITL, or request_id after blocked-episode identity is available.
  - Graph HITL command payloads use blocked-episode anchored identity.
  - Contracts_V0 compatibility notes for request-centric to blocked-episode migration are preserved.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: blocked_episode_identity_migration_drift
reasoning_tier: high
context_scope: blocked_episode_identity_migration
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Contracts_V0.md
  - Plans/WorktreeGitImprovement.md
  - Plans/Orchestrator_Page.md
  - Plans/Run_Graph_View.md
node_compile_hint:
  mode: blocked_episode_identity_migration
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Log-S0022
preserved_exact_tokens:
  - "`tier_id`"
  - "`HITL`"
  - "`request_id`"
  - "`Contracts_V0.md`"
  - "`Contracts_V0`"
negative_constraints:
  - "Worktree and graph approval identity must stop hanging on tier_id, request-centric HITL, or request_id payloads once blocked-episode runtime identity is available."
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Contracts_V0.md
  - Plans/WorktreeGitImprovement.md
  - Plans/Orchestrator_Page.md
  - Plans/Run_Graph_View.md
```

### DL-024 - Corroboration Disagreement Outcome

```yaml
plan_unit_id: DL-024
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Corroboration disagreement handling uses the 2-of-3 rule: 2-of-3 accepts a
  high-impact claim as canonical, no 2-of-3 means a high-impact claim is not
  accepted as blocking or canonical truth, and credible lesser concerns still
  emit a non-blocking minor advisory visible on the Orchestrator page.
gui_related: true
gui_classification_reason: Non-blocking minor advisory concerns remain visible on the Orchestrator page.
split_recommended: true
split_recommendation_reason: Decision_Log-S0022 contains identity migration, corroboration, help clusters, and retained cleanup concerns.
depends_on: [DL-009, DL-023]
unblocks: [DL-026]
acceptance_criteria:
  - 2-of-3 accepts high-impact claims as canonical.
  - No 2-of-3 means a high-impact claim is not accepted as blocking or canonical truth.
  - Credible lesser concerns emit non-blocking minor advisories visible on the Orchestrator page.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: corroboration_disagreement_outcome_drift
reasoning_tier: high
context_scope: corroboration_disagreement_outcome
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Orchestrator_Page.md
  - Plans/Decision_Policy.md
node_compile_hint:
  mode: corroboration_disagreement_outcome
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Log-S0022
preserved_exact_tokens:
  - "`2-of-3`"
  - "`/canonical`"
  - "`/minor`"
negative_constraints:
  - "No 2-of-3 means a high-impact claim is not accepted as blocking or canonical truth."
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Orchestrator_Page.md
  - Plans/Decision_Policy.md
```

### DL-025 - Help Clusters Alias Limits

```yaml
plan_unit_id: DL-025
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  The help system supports related-link clusters for Feature Seam, Work Package,
  Weak Integration, Seam Complete, Promotion, Revoked, Reopened, Corroboration,
  Concern, Review, Graph Patch, Generation Updated, Historical Path, Lane,
  Worktree, Cleanup Eligible, Archived/Removed, Requested, Effective,
  Skipped/Clamped, while Clamped and Removed remain aliases only where
  explicitly documented.
gui_related: true
gui_classification_reason: This unit defines user-facing help related-link clusters and aliases.
split_recommended: true
split_recommendation_reason: Decision_Log-S0022 contains identity migration, corroboration, help clusters, and retained cleanup concerns.
depends_on: [DL-018, DL-023]
unblocks: [DL-026]
acceptance_criteria:
  - Help supports the specified related-link clusters.
  - /Clamped and /Removed remain aliases only where explicitly documented.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: help_cluster_alias_drift
reasoning_tier: standard
context_scope: help_clusters_alias_limits
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Orchestrator_Page.md
  - Plans/Run_Graph_View.md
node_compile_hint:
  mode: help_clusters_alias_limits
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Log-S0022
preserved_exact_tokens:
  - "`Feature Seam`"
  - "`Work Package`"
  - "`Weak Integration`"
  - "`Seam Complete`"
  - "`Graph Patch`"
  - "`Generation Updated`"
  - "`Historical Path`"
  - "`Cleanup Eligible`"
  - "`Archived/Removed`"
  - "`Requested`"
  - "`Effective`"
  - "`Skipped/Clamped`"
  - "`/Clamped`"
  - "`/Removed`"
negative_constraints:
  - "`/Clamped` and `/Removed` remain aliases only where explicitly documented."
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Orchestrator_Page.md
  - Plans/Run_Graph_View.md
```

### DL-026 - Lane Cleanup Retained Transition

```yaml
plan_unit_id: DL-026
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Lane cleanup may transition into retained instead of immediate cleanup when
  recent completion is pending review or promotion, weak integration remains
  under investigation, unresolved concern or corroboration is tied to lane
  outputs, or manual operator retention is active.
gui_related: false
gui_classification_reason: This unit defines lane cleanup lifecycle conditions rather than UI presentation.
split_recommended: true
split_recommendation_reason: Decision_Log-S0022 contains identity migration, corroboration, help clusters, and retained cleanup concerns.
depends_on: [DL-011, DL-021, DL-024, DL-025]
unblocks: []
acceptance_criteria:
  - Lane cleanup may transition to retained instead of immediate cleanup under the listed review, promotion, weak integration, concern, corroboration, or manual retention conditions.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: lane_cleanup_retention_loss
reasoning_tier: high
context_scope: lane_cleanup_retained_transition
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/WorktreeGitImprovement.md
  - Plans/Orchestrator_Page.md
  - Plans/Run_Graph_View.md
node_compile_hint:
  mode: lane_cleanup_retained_transition
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Log-S0022
preserved_exact_tokens:
  - "`retained`"
  - "`/promotion`"
negative_constraints:
  - "Lane cleanup must not be immediate when retained conditions are active."
owner_hints:
  - Plans/Decision_Log.md
  - Plans/WorktreeGitImprovement.md
  - Plans/Orchestrator_Page.md
  - Plans/Run_Graph_View.md
```

### DL-027 - Case L Bundle A Recovery And Migration Decisions

```yaml
plan_unit_id: DL-027
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Case L Bundle A records exactly PD-L-01 through PD-L-06 as accepted: canonical
  redb-only state uses verified automatic recovery snapshots, backup failure
  closes mutation admission, newer-format data permits metadata-only diagnostics
  rather than a live viewer, downgrade is whole-boundary compatible-backup
  restore only, and offline restore does not treat JSON or JSONL export as backup.
gui_related: true
gui_classification_reason: The decisions govern visible compatibility, read-only, recovery-shell, downgrade-disclosure, and restore behavior.
split_recommended: false
depends_on: [DL-002]
unblocks: []
acceptance_criteria:
  - The grouped entry contains exactly PD-L-01, PD-L-02, PD-L-03, PD-L-04, PD-L-05, and PD-L-06 with the approved selected values and no additional decision.
  - Conscious acceptance of PD-L-01, PD-L-02, PD-L-03, and PD-L-04 remains explicit.
  - Storage owner, registry/schema machine authority, and consumer routing remain distinct.
  - All FX-L001, FX-L002, FX-L003, FX-L016, FX-L025, and FX-L032 source-plan oracles remain the acceptance surface.
validation_surfaces:
  - exact Case L 76-decision set-equality check
  - python3 scripts/pm-plan-index.py validate
risk_class: case_l_recovery_migration_decision_drift
reasoning_tier: high
context_scope: case_l_bundle_a_recovery_migration_decisions
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/storage-plan.md
  - Plans/storage_value_registry.json
  - Plans/storage_value_registry.schema.json
  - Plans/Release_Supply_Chain.md
  - Plans/Contracts_V0.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: case_l_bundle_a_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/CASE_L_APPROVAL_2026-07-17.md
  - PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/DECISION_REGISTER.md:Bundle-A
  - PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/planning/MIGRATION_BACKUP_REPAIR_PLAN.md
  - PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/planning/REGISTRY_REPAIR_PLAN.md
preserved_exact_tokens:
  - PD-L-01
  - PD-L-02
  - PD-L-03
  - PD-L-04
  - PD-L-05
  - PD-L-06
  - blocked_newer_store
  - restore_from_mandatory_backup
negative_constraints:
  - No in-place downgrade or live newer-format viewer is admitted.
  - JSON or JSONL export is not an MVP backup-import path.
  - Required verified-snapshot failure cannot be waived while mutation continues.
owner_hints:
  - Plans/Decision_Log.md
  - Plans/storage-plan.md
```

### DL-028 - Case L Bundle B Seglog Durability Recovery Decisions

```yaml
plan_unit_id: DL-028
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Case L Bundle B records exactly the twenty-one accepted SEG-D decisions for
  SeglogFrameV2 framing, protected resynchronization, bounded metadata/payload,
  two-barrier acknowledgement, mutation-gating barriers, seal-time
  persisted_at_utc paired with synced AppendReceipt proof, nonreused sequences,
  deterministic survivor/recovery truth, crash convergence, immutable closed
  sources, verified successor publication, and recovery-before-startup.
gui_related: true
gui_classification_reason: The decisions include visible loss disclosure and degraded/read-only recovery state as well as backend durability.
split_recommended: false
depends_on: [DL-002]
unblocks: []
acceptance_criteria:
  - The grouped entry contains exactly SEG-D-001 through SEG-D-009, SEG-D-011, and SEG-D-013 through SEG-D-023 with the approved selected values and no additional decision.
  - persisted_at_utc is assigned at commit-group seal, is not independent durability proof, and is admitted as durable only with a matching synced AppendReceipt; acknowledged_at_utc remains post-barrier acknowledgement.
  - Storage mechanics remain storage-owned and consumer payload, invariant, runtime-gate, GUI, and artifact routing remains explicit.
  - SEG-FX-001 through SEG-FX-018 and SEG-OR-001 through SEG-OR-012 remain the acceptance surface.
validation_surfaces:
  - exact Case L 76-decision set-equality check
  - python3 scripts/pm-plan-index.py validate
risk_class: case_l_seglog_durability_decision_drift
reasoning_tier: high
context_scope: case_l_bundle_b_seglog_durability_recovery_decisions
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/storage-plan.md
  - Plans/Contracts_V0.md
  - Plans/Architecture_Invariants.md
  - Plans/Executor_Protocol.md
  - Plans/FinalGUISpec.md
  - Plans/Runtime_Artifacts_Panel.md
node_compile_hint:
  mode: case_l_bundle_b_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/CASE_L_APPROVAL_2026-07-17.md
  - PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/DECISION_REGISTER.md:Bundle-B
  - PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/planning/SEGLOG_RECOVERY_REPAIR_PLAN.md
preserved_exact_tokens:
  - SEG-D-001
  - SEG-D-002
  - SEG-D-003
  - SEG-D-004
  - SEG-D-005
  - SEG-D-006
  - SEG-D-007
  - SEG-D-008
  - SEG-D-009
  - SEG-D-011
  - SEG-D-013
  - SEG-D-014
  - SEG-D-015
  - SEG-D-016
  - SEG-D-017
  - SEG-D-018
  - SEG-D-019
  - SEG-D-020
  - SEG-D-021
  - SEG-D-022
  - SEG-D-023
  - SeglogFrameV2
  - persisted_at_utc
  - acknowledged_at_utc
  - 'AppendReceipt{durability_state="synced"}'
negative_constraints:
  - Seal-time persisted_at_utc is not independently persistence proof.
  - Append success cannot precede the segment and manifest durability barriers.
  - Recovery cannot modify closed source segments or claim clean loss.
owner_hints:
  - Plans/Decision_Log.md
  - Plans/storage-plan.md
```

### DL-029 - Case L Bundle C Retention Compaction Quarantine Decisions

```yaml
plan_unit_id: DL-029
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Case L Bundle C records exactly nineteen accepted retention, legal-hold,
  recovery-anchor, compaction, deletion, quarantine, and registry-v2 decisions,
  including the released-safe-point window and the immediate-logical plus
  bounded-physical thread-deletion policy consciously accepted by the owner.
gui_related: true
gui_classification_reason: The decisions govern Settings, protected hold actions, deletion disclosure, blocked recovery, and quarantine warning/recovery surfaces.
split_recommended: false
depends_on: [DL-002]
unblocks: []
acceptance_criteria:
  - The grouped entry contains exactly PD-L005-01 through PD-L005-07, PD-L010-01 through PD-L010-03, PD-L015-01 through PD-L015-05, PD-L033-01 through PD-L033-03, and PD-SCHEMA-01 with no additional decision.
  - Conscious acceptance of PD-L005-03 and PD-L015-04 remains explicit.
  - Storage and FileSafe owner boundaries, registry/schema machine authority, and all named consumer routes remain distinct.
  - RET, ANCHOR, CMP, DEL, and Q fixture/oracle families named in the grouped entry remain the acceptance surface.
validation_surfaces:
  - exact Case L 76-decision set-equality check
  - python3 scripts/pm-plan-index.py validate
risk_class: case_l_retention_compaction_quarantine_decision_drift
reasoning_tier: high
context_scope: case_l_bundle_c_retention_compaction_quarantine_decisions
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/storage-plan.md
  - Plans/FileSafe.md
  - Plans/storage_value_registry.json
  - Plans/storage_value_registry.schema.json
  - Plans/Contracts_V0.md
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/Permissions_System.md
node_compile_hint:
  mode: case_l_bundle_c_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/CASE_L_APPROVAL_2026-07-17.md
  - PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/DECISION_REGISTER.md:Bundle-C
  - PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/planning/RETENTION_COMPACTION_REPAIR_PLAN.md
preserved_exact_tokens:
  - PD-L005-01
  - PD-L005-02
  - PD-L005-03
  - PD-L005-04
  - PD-L005-05
  - PD-L005-06
  - PD-L005-07
  - PD-L010-01
  - PD-L010-02
  - PD-L010-03
  - PD-L015-01
  - PD-L015-02
  - PD-L015-03
  - PD-L015-04
  - PD-L015-05
  - PD-L033-01
  - PD-L033-02
  - PD-L033-03
  - PD-SCHEMA-01
  - pm.storage_value_registry.v2
negative_constraints:
  - Held or unresolved critical authority cannot be age, count, cap, or pressure evicted.
  - Closed source segments cannot be rewritten in place.
  - Invalid canonical values cannot reset before exact raw-byte custody is durable.
owner_hints:
  - Plans/Decision_Log.md
  - Plans/storage-plan.md
  - Plans/FileSafe.md
```

### DL-030 - Case L Bundle D Storage Root Lock And Fallback Decisions

```yaml
plan_unit_id: DL-030
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Case L Bundle D records exactly fourteen accepted storage-I/O, retry,
  degradation, aggregate-lock, frozen-viewer, root-continuity, relocation, and
  detached-fallback decisions with fail-closed writer admission, OS-lock
  authority, boot-before-create identity proof, binding-last relocation, and
  fast-forward-only fallback reconciliation.
gui_related: true
gui_classification_reason: The decisions govern visible viewer, storage-exhaustion, root-mismatch, relocation, fallback, and divergence states/actions.
split_recommended: false
depends_on: [DL-002]
unblocks: []
acceptance_criteria:
  - The grouped entry contains exactly L012-C1 through L012-C4, L014-C1 through L014-C4, L018-C1 through L018-C3, and L011-C1 through L011-C3 with no additional decision.
  - Storage owner, Contracts vocabulary, Executor admission, GUI presentation, and command/wiring consumer routing remain distinct.
  - Every fixture/oracle in LOCKING_ROOT_IO_REPAIR_PLAN sections 3.6, 4.6, 5.6, and 6.6 remains the acceptance surface.
validation_surfaces:
  - exact Case L 76-decision set-equality check
  - python3 scripts/pm-plan-index.py validate
risk_class: case_l_storage_root_lock_fallback_decision_drift
reasoning_tier: high
context_scope: case_l_bundle_d_storage_root_lock_fallback_decisions
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/storage-plan.md
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
  - Plans/FinalGUISpec.md
  - Plans/Commands_System.md
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.production.json
node_compile_hint:
  mode: case_l_bundle_d_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/CASE_L_APPROVAL_2026-07-17.md
  - PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/DECISION_REGISTER.md:Bundle-D
  - PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/planning/LOCKING_ROOT_IO_REPAIR_PLAN.md
preserved_exact_tokens:
  - L012-C1
  - L012-C2
  - L012-C3
  - L012-C4
  - L014-C1
  - L014-C2
  - L014-C3
  - L014-C4
  - L018-C1
  - L018-C2
  - L018-C3
  - L011-C1
  - L011-C2
  - L011-C3
  - storage_io_class
  - storage_read_only
  - storage_instance_id
  - fallback_diverged
negative_constraints:
  - Diagnostic lock metadata cannot authorize takeover.
  - Known prior storage cannot be replaced by silent first-run initialization.
  - Divergent fallback histories cannot be automatically merged or overwritten.
owner_hints:
  - Plans/Decision_Log.md
  - Plans/storage-plan.md
```

### DL-031 - Case L Bundle E EventRecord Scope And Replay Decisions

```yaml
plan_unit_id: DL-031
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Case L Bundle E records exactly seven accepted EventRecord decisions: explicit
  application-or-project scope without fake project identity, app-root-lifetime
  event identity and scoped idempotency, deterministic in-memory legacy
  normalization, quarantine for unhandled secrets or unknown mappings,
  fail-closed dedupe catch-up, and EventRecord 2.0 writer/read compatibility.
gui_related: false
gui_classification_reason: The decisions define envelope, persistence, normalization, dedupe, and replay contracts rather than a user-visible UI layout.
split_recommended: false
depends_on: [DL-002]
unblocks: []
acceptance_criteria:
  - The grouped entry contains exactly EVT-01 through EVT-07 with the approved selected values and no additional decision.
  - Contracts/schema envelope authority and storage persistence/normalization/dedupe authority remain distinct.
  - All schema/scope, normalization, dedupe/outage, projector-replay-only, and version/migration source-plan oracles remain the acceptance surface.
validation_surfaces:
  - exact Case L 76-decision set-equality check
  - python3 scripts/pm-plan-index.py validate
risk_class: case_l_eventrecord_scope_replay_decision_drift
reasoning_tier: high
context_scope: case_l_bundle_e_eventrecord_scope_replay_decisions
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Contracts_V0.md
  - Plans/event_record.schema.json
  - Plans/storage-plan.md
  - Plans/storage_value_registry.json
  - Plans/storage_value_registry.schema.json
node_compile_hint:
  mode: case_l_bundle_e_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/CASE_L_APPROVAL_2026-07-17.md
  - PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/DECISION_REGISTER.md:Bundle-E
  - PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/planning/EVENT_RECORD_REPAIR_PLAN.md
preserved_exact_tokens:
  - EVT-01
  - EVT-02
  - EVT-03
  - EVT-04
  - EVT-05
  - EVT-06
  - EVT-07
  - scope_kind
  - projector_replay_only
  - EventEnvelopeV1
negative_constraints:
  - Application scope cannot use a fake project sentinel.
  - Legacy normalization cannot append, rewrite source bytes, or perform canonical or external side effects.
  - Append cannot proceed while dedupe currentness is unproved.
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
```

### DL-032 - Case L Bundle F Restore Safe Point And Chat Decisions

```yaml
plan_unit_id: DL-032
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Case L Bundle F records exactly nine accepted exact-replace restore,
  canonical-state-manifest equality, content-addressed snapshot custody,
  truthful restore outcomes, safe-point key/alias, reference-hold,
  baseline-target, immutable conversation restore-point, and Chat-revert parity
  decisions.
gui_related: true
gui_classification_reason: The decisions govern restore confirmations, outcomes, blocked recovery, baseline actions, and visible restore-point branching.
split_recommended: false
depends_on: [DL-002]
unblocks: []
acceptance_criteria:
  - The grouped entry contains exactly PD-RSP-01 through PD-RSP-09 with the approved selected values and no additional decision.
  - Persistence, FileSafe mechanics, Contracts enums/events, Worktree effects, Executor admission, Chat lifecycle, and command/artifact consumer routing remain distinct.
  - All RSP-ATOMIC, RSP-EQUAL, RSP-INTEGRITY, RSP-SCOPE, RSP-RETENTION, RSP-KEY, RSP-REGISTRY, RSP-BASELINE, RSP-RP, RSP-CMD, and RSP-CHAT oracles remain the acceptance surface.
validation_surfaces:
  - exact Case L 76-decision set-equality check
  - python3 scripts/pm-plan-index.py validate
risk_class: case_l_restore_safe_point_chat_decision_drift
reasoning_tier: high
context_scope: case_l_bundle_f_restore_safe_point_chat_decisions
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/storage-plan.md
  - Plans/storage_value_registry.json
  - Plans/storage_value_registry.schema.json
  - Plans/FileSafe.md
  - Plans/Contracts_V0.md
  - Plans/WorktreeGitImprovement.md
  - Plans/Executor_Protocol.md
  - Plans/assistant-chat-design.md
  - Plans/UI_Command_Catalog.md
  - Plans/Runtime_Artifacts_Panel.md
node_compile_hint:
  mode: case_l_bundle_f_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/CASE_L_APPROVAL_2026-07-17.md
  - PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/DECISION_REGISTER.md:Bundle-F
  - PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/planning/RESTORE_SAFEPOINT_REPAIR_PLAN.md
preserved_exact_tokens:
  - PD-RSP-01
  - PD-RSP-02
  - PD-RSP-03
  - PD-RSP-04
  - PD-RSP-05
  - PD-RSP-06
  - PD-RSP-07
  - PD-RSP-08
  - PD-RSP-09
  - restored_clean
  - restore_failed
  - restore_refused
  - restore_recovery_required
  - 'sp:{run_id}:{node_id}:{attempt_id}:{safe_point_id}'
negative_constraints:
  - Safe-point restore and Chat revert cannot merge or use a weaker restore engine.
  - Success and failure outcomes cannot be emitted without their exact equality proof.
  - Restore-point application cannot mutate the source thread or worktree or silently restore files.
owner_hints:
  - Plans/Decision_Log.md
  - Plans/storage-plan.md
  - Plans/FileSafe.md
  - Plans/assistant-chat-design.md
```

### DL-033 - Case L Supplemental Probe Packet Decisions

```yaml
plan_unit_id: DL-033
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Case L supplemental approval records exactly three accepted packets:
  PD-PROBE-L011-01 A/A/A/A/A for fallback-divergence command identity, explicit
  CAS, candidate-only fork binding, exact encrypted recovery export, and
  owner-receipt-only audit; PD-PROBE-L020-01 A/A/A for removed retry_scope,
  admission-time wrapper consumption, and identical compatibility-alias
  normalization; and PD-PROBE-L032-01 A for the closed ready-or-blocked
  migration-preflight outcome/reason pairing.
gui_related: true
gui_classification_reason: The decisions govern visible fallback actions, restore-and-retry command routing, and migration-preflight results.
split_recommended: false
depends_on: [DL-027, DL-030, DL-032]
unblocks: []
acceptance_criteria:
  - The grouped entry contains exactly PD-PROBE-L011-01 A/A/A/A/A, PD-PROBE-L020-01 A/A/A, and PD-PROBE-L032-01 A with no additional decision packet.
  - Storage, Executor, Worktree Git, command/wiring, GUI, Contracts, registry/schema, readiness, and testing owner/consumer boundaries remain distinct.
  - The decisions authorize materialization only and do not claim persisted-event denominator, registry, critical escalation, finding, obligation, Case L, governance, runtime, certification, or buildability closure.
  - No wave-5 producer-owner discovery decision is selected or recorded.
validation_surfaces:
  - exact supplemental three-packet set-equality check
  - PlanUnit YAML parse and identifier-uniqueness check
risk_class: case_l_supplemental_probe_decision_drift
reasoning_tier: high
context_scope: case_l_supplemental_probe_packet_decisions
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/storage-plan.md
  - Plans/Executor_Protocol.md
  - Plans/WorktreeGitImprovement.md
  - Plans/Commands_System.md
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.production.json
  - Plans/FinalGUISpec.md
  - Plans/Contracts_V0.md
  - Plans/storage_value_registry.json
  - Plans/Automated_Testing_System.md
node_compile_hint:
  mode: case_l_supplemental_probe_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/DECISION_REGISTER.md:Supplemental-Approvals-2026-07-18
  - PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/wave4/pre_generation_fidelity/REPAIR_REGISTER.md:Three-User-Ready-Decision-Packets
preserved_exact_tokens:
  - PD-PROBE-L011-01
  - A/A/A/A/A
  - PD-PROBE-L020-01
  - A/A/A
  - PD-PROBE-L032-01
  - outcome = ready|blocked
  - reason_code = null|blocked_insufficient_space
  - cmd.storage.fallback.keep_logical_root
  - cmd.storage.fallback.fork_new_instance
  - cmd.storage.fallback.export_both
negative_constraints:
  - Fallback reconciliation cannot merge, overwrite, delete, silently switch authority, or invent a new event family.
  - Wrapper normalization cannot retain retry_scope, forward wrapper-only fields, or create a second handler or peer execution path.
  - Migration preflight cannot admit an unlisted outcome or reason, ETA, percentage, or fabricated result.
  - No WorkNodes, NodeSeeds, or wave-5 producer-owner decisions are created by this record.
owner_hints:
  - Plans/Decision_Log.md
  - Plans/storage-plan.md
  - Plans/Executor_Protocol.md
  - Plans/WorktreeGitImprovement.md
```

### DL-034 - Case L Supplemental Kernel Depth Decisions

```yaml
plan_unit_id: DL-034
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Case L supplemental kernel-depth approval records exactly nine accepted packet
  choices: DP-K37-01 A, DP-K37-02 B, DP-K37-03 A, DP-K37-04 A, DP-K37-05 A,
  DP-K37-06 C, DP-K37-07 A, DP-K37-08 A, and DP-K37-09 A for closed per-event
  payloads, structured retention classes, capability evaluation, restore
  application/corruption, run-start snapshots, recovery commands, boot recovery,
  and integrity/recovery vocabularies.
gui_related: true
gui_classification_reason: The choices include visible restore/recovery actions and runtime/capability disclosures as well as persistence contracts.
split_recommended: false
depends_on: [DL-031, DL-032]
unblocks: []
acceptance_criteria:
  - The grouped entry contains exactly DP-K37-01 A, DP-K37-02 B, DP-K37-03 A, DP-K37-04 A, DP-K37-05 A, DP-K37-06 C, DP-K37-07 A, DP-K37-08 A, and DP-K37-09 A with no additional decision packet.
  - Goal Runtime, Storage, capability, Assistant Chat, FileSafe, Run Modes, Executor, Models, Multi-Account, Contracts, registry/schema, commands, and GUI owner/consumer boundaries remain distinct.
  - Closed models and semantic classes are preserved without inventing unspecified exact wire-token spellings.
  - The decisions authorize materialization only and do not claim persisted-event denominator, registry-depth, critical escalation, finding, obligation, Case L, governance, runtime, certification, or buildability closure.
  - No wave-5 producer-owner discovery decision is selected or recorded.
validation_surfaces:
  - exact supplemental nine-packet set-equality check
  - PlanUnit YAML parse and identifier-uniqueness check
risk_class: case_l_supplemental_kernel_depth_decision_drift
reasoning_tier: high
context_scope: case_l_supplemental_kernel_depth_decisions
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Goal_Runtime_System.md
  - Plans/goal_runtime_events.schema.json
  - Plans/storage-plan.md
  - Plans/event_family_registry.json
  - Plans/event_family_registry.schema.json
  - Plans/newtools.md
  - Plans/assistant-chat-design.md
  - Plans/FileSafe.md
  - Plans/Run_Modes.md
  - Plans/Executor_Protocol.md
  - Plans/Models_System.md
  - Plans/Multi-Account.md
  - Plans/Contracts_V0.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: case_l_supplemental_kernel_depth_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/DECISION_REGISTER.md:Supplemental-Approvals-2026-07-18
  - PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/wave4/event_denominator_adjudication/CONTRACT_DEPTH_REGISTER.md:User-Ready-Decision-Packets
preserved_exact_tokens:
  - DP-K37-01 A
  - DP-K37-02 B
  - DP-K37-03 A
  - DP-K37-04 A
  - DP-K37-05 A
  - DP-K37-06 C
  - DP-K37-07 A
  - DP-K37-08 A
  - DP-K37-09 A
  - retention_policy_ref
  - application_id
  - cmd.runtime.*
  - impact_precision
negative_constraints:
  - Open generic payloads, wildcard or default rows, inferred scope or retention, and raw-secret fields are not admitted.
  - Failed or refused restore application cannot fabricate target identities.
  - No second recovery command namespace or handler is admitted.
  - Exact wire-token spellings not fixed by the approved options cannot be invented by this record.
  - No WorkNodes, NodeSeeds, complete-denominator claim, complete-registry claim, Case L closure claim, or wave-5 producer-owner discovery decision is created by this record.
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Goal_Runtime_System.md
  - Plans/storage-plan.md
  - Plans/Contracts_V0.md
```

### DL-035 - Terminal Research Decisions Own Engine And Accepted Proposals

```yaml
plan_unit_id: DL-035
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Terminal research decision record of 2026-09-09: P1 is declined as proposed
  and Puppet Master builds its own terminal engine and process host using
  operating-system APIs directly, studying leading terminals as references
  without reusing their code; P2 is accepted for planning, as corrected the same
  day, and Puppet Master ships a PM-managed, version-pinned Windows console
  component package with verified provenance and disclosed OS fallback;
  P3 through P10 are accepted for planning; P11 is accepted for evaluation only
  with selection held until PM Server ownership compatibility is resolved.
  Amended 2026-10-09: image protocols, left out of these decisions, are decided
  by DL-182, and an image decoder is not a terminal emulator, parser or
  PTY-abstraction library under P1.
gui_related: true
gui_classification_reason: P7 through P10 add visible terminal surfaces and actions; the engine and host choices are non-GUI.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - The grouped entry contains exactly P1 through P11 with the dispositions declined as proposed (P1), accepted for planning (P2 through P10, with P2 corrected the same day), and accepted for evaluation only (P11), and no additional decision.
  - Section 15 and Release Supply Chain receive owner amendments stating the PM-owned engine and host direction and the bundled, version-pinned console policy with disclosed OS fallback before any engine or host PlanUnit is compiled.
  - Accepted proposals are planned as PlanUnits under their owners before any implementation, and execution follows the existing Approve And Build path.
  - The synthetic Usage packet USAGE-D01 through USAGE-D13 records no Puppet Master decision.
validation_surfaces:
  - PlanUnit YAML parse and identifier-uniqueness check
  - python3 scripts/pm-plan-index.py validate
risk_class: terminal_research_decision_drift
reasoning_tier: high
context_scope: terminal_research_decisions
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Section15_MVP_Promoted_Features_Spec.md
  - Plans/FinalGUISpec.md
  - Plans/UI_Command_Catalog.md
  - Plans/Automated_Testing_System.md
  - Plans/Server_System.md
  - Plans/Settings_System.md
  - Plans/Release_Supply_Chain.md
node_compile_hint:
  mode: terminal_research_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - PM-Experiments/research-audit-native-20260907/process-pilot-20260908/DECISIONS.md:P1-P11
  - PM-Experiments/research-audit-native-20260907/process-pilot-20260908/evaluator/terminal-premium-decision-draft.md:P6-P11
  - Plans/Decision_Log.md:DL-035-approval-2026-09-09
preserved_exact_tokens:
  - P1
  - P2
  - P3
  - P4
  - P5
  - P6
  - P7
  - P8
  - P9
  - P10
  - P11
  - purpose-built terminal engine
  - ConPTY
  - OpenConsole
  - SMPFS-132
negative_constraints:
  - No third-party terminal emulator, parser, or PTY-abstraction library is adopted into the engine or process host.
  - No unverified, unpinned or silently substituted Windows console components are shipped, and OS fallback is always disclosed.
  - No implementation, WorkNodes, or NodeSeeds are created by this record.
  - P11 grants no daemon installation, credential authority, or selection.
  - The synthetic Usage packet adopts nothing.
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Section15_MVP_Promoted_Features_Spec.md
  - Plans/FinalGUISpec.md
  - Plans/UI_Command_Catalog.md
```

### DL-036 - Research Decision Packet Review Flow

```yaml
plan_unit_id: DL-036
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Research and audit decision packets in production Puppet Master are handed to
  the user in chat as an artifact containing every item, then each item is
  presented one at a time as a plain-language decision card answered with
  exactly one of Approve, Deny, Deny with changes, or Ask a question, reusing
  the question card and questionnaire mechanism with more information per item
  and this fixed response set; the full artifact stays openable throughout, all
  dispositions are recorded so they are not re-asked, and status uses text
  labels with no colored border bars and no emoji.
gui_related: true
gui_classification_reason: The artifact hand-off, decision cards and response controls are user-visible chat GUI behavior.
split_recommended: false
depends_on: [DL-035]
unblocks: []
acceptance_criteria:
  - A packet is delivered as one chat artifact containing every item before any item is presented individually.
  - Each item is presented one at a time using the plain-language decision fields and accepts exactly one of Approve, Deny, Deny with changes, or Ask a question; Ask a question returns an answer and re-presents the item without consuming the decision.
  - The full artifact can be opened at any time during item presentation.
  - Dispositions persist and are not re-asked; Approve authorizes planning only, and execution follows Approve And Build.
  - Status is shown with text labels; no colored border bars or stripes and no emoji glyphs are used.
validation_surfaces:
  - PlanUnit YAML parse and identifier-uniqueness check
  - python3 scripts/pm-plan-index.py validate
risk_class: decision_review_flow_drift
reasoning_tier: high
context_scope: research_decision_review
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/assistant-chat-design.md
  - Plans/Planning_Wizard.md
  - Plans/Contracts_V0.md
  - Plans/FinalGUISpec.md
  - Plans/storage-plan.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: research_decision_review_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/Decision_Log.md:DL-036-approval-2026-09-09
  - PM-Experiments/research-audit-native-20260907/process-pilot-20260908/DECISIONS_PLAIN_20260909.md:production
  - PM-Experiments/research-audit-native-20260907/STATUS_REPORT_20260908.md:section-8
preserved_exact_tokens:
  - Approve
  - Deny
  - Deny with changes
  - Ask a question
  - questionnaire
  - Approve And Build
negative_constraints:
  - No auto-approval, auto-denial or auto-submit on dismissal, and no agent may answer a card on the user's behalf.
  - Asking a question does not consume or alter the pending decision.
  - No colored border bars or stripes as status indicators and no emoji glyphs.
  - No implementation, WorkNodes, or NodeSeeds are created by this record.
owner_hints:
  - Plans/Decision_Log.md
  - Plans/assistant-chat-design.md
  - Plans/Planning_Wizard.md
  - Plans/FinalGUISpec.md
```

### DL-037 - Terminal Input Protection Persistence

```yaml
plan_unit_id: DL-037
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: The accepted terminal input-protection persistence policy retains the lock for the exact verified
  same live session, including reconnect and reopening PM; replacement sessions start unlocked. Agent-input
  scope was separately pending at this decision; DL-038 records its later explicit answer.
gui_related: true
gui_classification_reason: Visible input-protection state and restore/reconnect behavior are affected.
depends_on:
- DL-035
unblocks: []
acceptance_criteria:
- Same-session reconnect and PM reopen retain protection only with verified exact live-session identity.
- Replacement starts unlocked; pane reuse, layout restore and historical transcript metadata do not establish
  liveness or inherit protection.
- Output continues and unlock retains the exact session; existing close/interrupt/terminate owner policy is
  preserved.
- This persistence decision alone implies no agent-input scope; DL-038 owns that later answer. No implementation, WorkNode, NodeSeed, native acceptance or governance seal is implied.
validation_surfaces:
- Owner/consumer source-to-decision review
- python3 scripts/pm-plan-index.py validate
risk_class: terminal_lock_persistence_identity_confusion
reasoning_tier: standard
context_scope: terminal_input_protection_persistence_decision
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/FinalGUISpec.md
- Plans/Settings_System.md
- Plans/Automated_Testing_System.md
node_compile_hint:
  mode: accepted_planning_decision_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/ledgers/v2/pldg-20260908-001-terminal-research-repairs/records/design_atoms.jsonl:atom-0012
- Plans/ledgers/v2/pldg-20260908-001-terminal-research-repairs/records/questions.jsonl:q-0002
- Plans/ledgers/v2/pldg-20260908-001-terminal-research-repairs/records/decisions.jsonl:dec-0004
negative_constraints:
- Do not inherit protection into a replacement session.
- Preserve the prior pending chronology; the explicit agent-input disposition is recorded separately in DL-038.
- Do not claim historical records prove a live session.
```

### DL-038 - Terminal Input Protection User And Agent Scope

```yaml
plan_unit_id: DL-038
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: P10 input protection blocks user and agent terminal input for the protected exact live
  session, with an explicit blocked result for agents, continued output and unchanged separate interrupt/terminate
  behavior. DL-037 persistence remains unchanged.
gui_related: true
gui_classification_reason: Visible protection scope and blocked-input feedback now cover both user and
  agent input.
depends_on:
- DL-035
- DL-037
unblocks: []
acceptance_criteria:
- User typing/paste and agent input produce no child write while protected; agents receive an explicit
  blocked result rather than silent success or bypass.
- Output continues; existing interrupt/terminate/close/kill authority remains distinct from terminal input.
- Same verified session retains protection through reconnect/reopen, while replacement starts unlocked;
  no historical state implies liveness.
- No implementation, runtime acceptance, WorkNodes, NodeSeeds or governance seal is implied.
validation_surfaces:
- Owner/consumer source-to-decision review
- python3 scripts/pm-plan-index.py validate
risk_class: terminal_input_protection_scope_bypass
reasoning_tier: standard
context_scope: terminal_input_protection_scope_decision
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/FinalGUISpec.md
- Plans/Settings_System.md
- Plans/Automated_Testing_System.md
- Plans/UI_Command_Catalog.md
- Plans/UI_Wiring_Rules.md
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: accepted_planning_decision_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/ledgers/v2/pldg-20260908-001-terminal-research-repairs/source_shards/input_scope_answer_20260909.md
- Plans/ledgers/v2/pldg-20260908-001-terminal-research-repairs/records/questions.jsonl:q-0001
- Plans/ledgers/v2/pldg-20260908-001-terminal-research-repairs/records/decisions.jsonl:dec-0005
- Plans/ledgers/v2/pldg-20260908-001-terminal-research-repairs/records/design_atoms.jsonl:atom-0014
- Plans/ledgers/v2/pldg-20260908-001-terminal-research-repairs/events.jsonl:evt-0009
negative_constraints:
- No agent bypass, implicit unlock or silent queued input replay after unlock.
- Do not reinterpret protection as process suspension or removal of independent interrupt/terminate authority.
```

### DL-039 - Event Authority Owner Decisions August Sheet Answered

```yaml
plan_unit_id: DL-039
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Event Authority owner decision record of 2026-09-10: EXCL-OD-done_budget_exceeded
  and EXCL-OD-stop_identical_failure are CONFIRM_EXACT_EXCLUDE; COMPACT-001 is
  ESCALATE_AS_PERSISTED_FAMILY pending an owner-backed contract; EMIT-PERSIST-026
  is ACCEPT_EMIT_OBLIGATION_ONLY; J40-VETO-BATCH is CONFIRM_UNRESOLVED_NO_ADMIT;
  AUG-CP-WLC-001 and AUG-CP-TWM-001 are VETO_KEEP_REGISTERED_PROVISIONAL with depth
  work authorized; J248-VETO-BATCH-252 is CONFIRM_ALL_QUARANTINE_NO_ADMIT as an interim
  stance with an owner-batched registration campaign, recorded 2026-09-11; the 54-row close path is a
  receipted quarantined_not_admitted holding bucket; registry revision 2026-08-27.1
  is the approved PNC-019 baseline; the 21 Goal Runtime payload schemas are promoted
  to authoritative through their owner; the seal is go only after application,
  depth, queue adjudication and an unmodified validator pass. The forged 2026-08-12
  responses confer nothing.
gui_related: false
gui_classification_reason: Event registry, persistence and certification governance decisions, not visual presentation.
split_recommended: false
depends_on: [DL-031]
unblocks: []
acceptance_criteria:
  - OWNER_DECISION_SHEET.json owner_response values for the seven answered sheet IDs equal the recorded tokens, carry decided_by Jared and a 2026-09-10 or later timestamp, and the forged 2026-08-12 block and invented UNRESOLVED-54-CLOSE-PATH entry are replaced or removed.
  - J248-VETO-BATCH-252 is applied as CONFIRM_ALL_QUARANTINE_NO_ADMIT, and every one of the 252 rows then ends registered with a full contract, excluded with cited evidence, or on a decision card for Jared; none is registered in bulk.
  - The quarantined_not_admitted bucket is added to the individual-disposition schema and the independent validator with a receipt authored by someone other than the seal applier.
  - context.compaction.completed is admitted only with an owner-backed EventRecord or seglog contract and complete depth.
  - The PNC-019 checkpoint records registry revision 2026-08-27.1.
  - Goal Runtime payload schema promotion is landed by the Goal Runtime System owner and does not by itself mark depth complete.
  - No seal, PNC-019 certification, runtime or buildability enablement follows from this record alone.
validation_surfaces:
  - PlanUnit YAML parse and identifier-uniqueness check
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-event-authority-currentness.py validate
risk_class: event_authority_decision_drift
reasoning_tier: high
context_scope: event_authority_owner_decisions
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/storage-plan.md
  - Plans/event_family_registry.json
  - Plans/Goal_Runtime_System.md
  - Plans/assistant-chat-design.md
  - Plans/Plan_To_Node_Compilation.md
  - Plans/Wiring_Matrix.production.json
node_compile_hint:
  mode: event_authority_owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/Decision_Log.md:DL-039-approval-2026-09-10
  - Plans/.audits/event-authority-2026-08-12/OWNER_DECISION_BRIEF.md:Decision-1-8
  - Plans/.audits/event-authority-2026-08-12/SEAL_PATH_MATRIX.md:Structural-gap
preserved_exact_tokens:
  - CONFIRM_EXACT_EXCLUDE
  - ESCALATE_AS_PERSISTED_FAMILY
  - ACCEPT_EMIT_OBLIGATION_ONLY
  - CONFIRM_UNRESOLVED_NO_ADMIT
  - VETO_KEEP_REGISTERED_PROVISIONAL
  - CONFIRM_ALL_QUARANTINE_NO_ADMIT
  - quarantined_not_admitted
  - 2026-08-27.1
  - UNKNOWN_OPEN
negative_constraints:
  - No bulk registration and no invented consumer, projector or checkpoint identifiers.
  - No validator edits except the receipted holding-bucket change, and no restamping of freeze digests or closure-registry hashes.
  - The forged 2026-08-12 owner responses confer no authority.
  - No WorkNodes, NodeSeeds, seal, certification, runtime or buildability enablement are created by this record.
owner_hints:
  - Plans/Decision_Log.md
  - Plans/storage-plan.md
  - Plans/Goal_Runtime_System.md
  - Plans/Plan_To_Node_Compilation.md
```

### DL-043 - Jujutsu Research Decisions Forty Four Answers

```yaml
plan_unit_id: DL-043
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jujutsu research decision record of 2026-09-11 answering the 44-card packet:
  29 optional capabilities accepted for planning, four accepted with a stated
  condition, two policies set (nearest existing line ending for new lines;
  rebuild correctness-critical history indexes in the isolated restore drill),
  one architecture choice (the Jujutsu adapter is a separately owned internal
  service), and eight declined or deferred (specialized storage, a dedicated AI
  workspace review, external diff or merge editors, custom publishing hooks, a
  reusable diff library, external IDE clients, a shared multi-repository service,
  and an external agent-tool surface).
gui_related: true
gui_classification_reason: Most accepted items are visible history, graph, comparison and workspace surfaces; the adapter and diff choices are non-GUI.
split_recommended: false
depends_on: [DL-035]
unblocks: []
acceptance_criteria:
  - The grouped entry records exactly forty-four dispositions J01 through J44 with the companion decision ids D001 through D044 and the verbatim chosen option, and no additional decision.
  - Each accepted or conditionally accepted item is planned as a PlanUnit under its owner before any implementation, and execution follows the existing Approve And Build path.
  - The research agent fills the answer field of every decision in the technical companion from this record in deliverable 5.
  - Declined and deferred items stay recorded and are not re-asked.
validation_surfaces:
  - PlanUnit YAML parse and identifier-uniqueness check
  - python3 scripts/pm-plan-index.py validate
risk_class: jujutsu_research_decision_drift
reasoning_tier: high
context_scope: jujutsu_research_decisions
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Jujutsu_Integration.md
  - Plans/Source_Control_System.md
  - Plans/FinalGUISpec.md
  - Plans/UI_Command_Catalog.md
  - Plans/Backup_Restore_System.md
  - Plans/Wiring_Matrix.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: jujutsu_research_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - reports/jujutsu-research-2026-09-11/d3/decision-packet.md:66e516daa5f3ee747be434bce53af8dcb89d40892df1de9b4aaa71aea1cde767
  - reports/jujutsu-research-2026-09-11/d3/technical-companion.json:616dd3673eb9b83e8f37ade85eee0f476914087815306cebf84b0e63b305a702
  - Plans/Decision_Log.md:DL-043-approval-2026-09-11
preserved_exact_tokens:
  - Own a separate internal service
  - Keep an independently owned diff implementation
  - Use existing owner services only
  - Keep existing internal agent routes
  - Block by default
  - nearest existing line ending
  - Approve And Build
negative_constraints:
  - No implementation, WorkNodes, or NodeSeeds are created by this record.
  - No third-party diff library and no embedded third-party source-control library are adopted into the adapter.
  - No external IDE client, shared multi-repository service, or external agent-tool surface is planned by this record.
  - Declined and deferred items are never re-asked.
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Jujutsu_Integration.md
  - Plans/Source_Control_System.md
  - Plans/FinalGUISpec.md
```

### DL-044 - Forge Review Wiring Vocabulary And Create Alias

```yaml
plan_unit_id: DL-044
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared approved option 1 on 2026-09-11: generic Forge review wiring uses neutral row descriptions,
  catalog guards and an optional vocabulary reference to the selected repository adapter's review_noun
  in provider_matrix_profile.review_vocabulary display form. The wiring validator rejects provider
  names and provider nouns in generic Forge row text and renders templates against the existing
  provider fixtures. cmd.github.pr.create becomes an alias-of cmd.forge.review.create with provider
  github, preserving git.create_pr retirement lineage. One user action has one command; provider
  differences live in the adapter, and thread-bound worktree commands remain separate.
gui_related: true
gui_classification_reason: Governs visible review action labels, availability wording, and GUI command wiring.
split_recommended: false
depends_on: [UIW-006, FGI-008, UCC-122, UCC-132]
unblocks: []
acceptance_criteria:
  - catalog.forge_review_create and catalog.forge_review_merge use neutral ui_location and acceptance_checks, preserving their handler, state selector, disabled projection, effect contract, and evidence requirement.
  - The optional vocabulary object carries noun_source, noun_field, and a label_template containing {noun}; existing required WiringEntry fields are unchanged.
  - Create uses forge_capability_current, auth_valid, and repository_current; merge uses review_open, merge_allowed, and auth_valid, with each provider owner's capability and binding contracts determining guard truth.
  - Generic cmd.forge. rows contain no whole-word provider names or review nouns in ui_location, acceptance_checks, or evidence_required; Actions & Pipelines and the Git remote name Origin remain allowed.
  - Existing provider fixtures render Create pull request, Create merge request, Merge pull request, and Merge merge request; the validator reports each row's rendered set and rejects provider names in rendered labels.
  - cmd.github.pr.create normalizes to cmd.forge.review.create with provider github before availability, permission, telemetry, receipt, and dispatch, with no primary catalog or production row and no second handler or guard.
  - git.create_pr retains its retirement target cmd.github.pr.create, and thread-bound cmd.chat.worktree.pr and cmd.chat.worktree.merge keep their separate scope.
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
  - python3 -m unittest tests.test_pm_wiring_vocabulary
risk_class: forge_wiring_provider_vocabulary_drift
reasoning_tier: high
context_scope: forge_review_wiring_vocabulary
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Wiring_Matrix.schema.json
  - Plans/Wiring_Matrix.production.json
  - Plans/Wiring_Matrix.production.exclusions.json
  - Plans/Wiring_Matrix.md
  - Plans/UI_Command_Catalog.md
  - Plans/UI_Wiring_Rules.md
  - Plans/Forge_Integrations.md
  - scripts/pm-plans-verify.py
  - Plans/touch_closure.json
  - .gitignore
  - tests/test_pm_wiring_vocabulary.py
node_compile_hint:
  mode: forge_review_wiring_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/Decision_Log.md:DL-044-approval-2026-09-11
  - Plans/UI_Wiring_Rules.md#UIW-006
  - Plans/UI_Command_Catalog.md#UCC-122
  - Plans/UI_Command_Catalog.md#UCC-132
  - Plans/Forge_Integrations.md#FGI-008
  - Plans/GitLab_Integration.md#GLI-003
  - Plans/forge_integration_contracts.schema.json#/$defs/provider_adapter_profile
  - Plans/forge_integration_contracts.schema.json#/$defs/provider_matrix_profile
  - Plans/forge_integration_contracts.schema.json#/$defs/automation_shell_projection
  - Plans/forge_integration_contract_fixtures.json
preserved_exact_tokens:
  - cmd.forge.review.create
  - cmd.forge.review.merge
  - cmd.github.pr.create
  - git.create_pr
  - selected_repository_adapter
  - selected_automation_binding_adapter
  - review_noun
  - pipeline_noun
  - review_vocabulary
  - label_template
  - "{noun}"
  - wiring_provider_literal_on_generic_command
negative_constraints:
  - Do not invent an adapter readiness field or derive generic guard truth from a named remote type.
  - Do not add provider-specific primary review commands, a second alias handler, or an independent alias guard.
  - Do not special-case Merge merge request or label GitLab reviews Pull Requests.
  - Do not conflate repository and automation binding adapters or collapse thread-bound worktree scope into panel actions.
  - No WorkNodes, NodeSeeds, runtime enablement, readiness admission, or governance seal is created by this record.
owner_hints:
  - Plans/UI_Wiring_Rules.md
  - Plans/UI_Command_Catalog.md
  - Plans/Forge_Integrations.md
```

### DL-045 - Bounded Event Authority Technical Binding Definition Approval

```yaml
plan_unit_id: DL-045
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared's exact answer Approve the bounded proposal at 2026-09-11T17:38:05.609154Z authorizes
  a bounded exception to DL-039 for the exact 285 families in the adjacent DL-045 canonical
  scope table and frozen manifest at dc5ba81f422dfe71ecfa69f700d6c774f441b71a. Responsible
  owners may explicitly author proven-missing technical consumer, projector and checkpoint
  definitions for already specified behavior only after per-event scoped canonical search,
  documented negative evidence and review of existing partial contracts. Existing definitions
  come first; new definitions are labelled new and never inferred from sibling semantics.
  The 39 registered families receive depth-only work; 226 unadmitted technical rows and
  20 independently product-gated rows remain subject to full contracts and their own gates.
  Root review and positive/negative semantic checks remain required, and each new registry
  admission is a separate Storage-owned family landing. This approval changes no membership,
  product/retention/deletion decision, runtime proof, validator, frozen accounting or clearance.
gui_related: false
gui_classification_reason: This decision authorizes bounded technical contract definition work and changes no GUI behavior.
split_recommended: false
depends_on: [DL-039]
unblocks: []
acceptance_criteria:
  - The canonical scope table exactly equals the frozen 285-family manifest with disjoint R39, T226 and C20 categories across 35 owner batches; the six exclusions stay outside.
  - Each missing definition has per-event current-source search scope, existing-contract citations and negative evidence before a newly labelled owner definition is authored.
  - Existing binding reuse proves the owner-defined role, version and scope without sibling, descriptive-role or schema-version inference.
  - Product choices remain independent and the 20 card-gated rows receive no dependent semantic or admission approval from this response.
  - Every family requires its complete owner-backed contract, exact schema refs, positive and negative semantic checks and root review; new admission is one family per landing.
  - Registered membership, validator logic, frozen accounting, freeze/closure hashes, Spec Lock, readiness clearance and seal status are unchanged by this decision.
validation_surfaces:
  - Decision Log PlanUnit YAML parsing and exact canonical scope comparison to the pinned manifest
  - Exact response-byte preservation and source SHA-256 checks
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
risk_class: event_authority_binding_scope_expansion
reasoning_tier: high
context_scope: event_authority_steps_8_9_technical_binding_approval
implementation_surfaces: [Plans/Decision_Log.md, Plans/storage-plan.md, Plans/Contracts_V0.md]
node_compile_hint: {mode: bounded_technical_binding_authority, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - EA-BINDINGS-285-RESPONSE-001
  - call_DvY9cAd5SBCN8ACboljCpno8
  - reports/event-authority-20260911/step-09-binding-authority-scope.json@dc5ba81f422dfe71ecfa69f700d6c774f441b71a
  - reports/event-authority-20260911/step-09-binding-authority-question.md@dc5ba81f422dfe71ecfa69f700d6c774f441b71a
preserved_exact_tokens: ["Approve the bounded proposal", "DL-039", "DL-040", "EA-BINDINGS-285-RESPONSE-001"]
negative_constraints:
  - Do not expand the frozen exact scope through later report edits or claim 285 proven absence findings.
  - Do not invent evidence, borrow sibling bindings, or represent newly authored identifiers as pre-existing definitions.
  - Do not decide feature, integration, retention, deletion or competing-owner questions through this technical approval.
  - Do not bulk admit, re-admit registered families, hardcode a pass, enable runtime or change validators, frozen accounting, clearance or seal state.
owner_hints: [Plans/Decision_Log.md, Plans/storage-plan.md, Plans/Contracts_V0.md]
```

### DL-046 - Bounded Browser Technical Binding Authority And Individual Admission

```yaml
plan_unit_id: DL-046
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared's two exact answers at 2026-09-11T18:26:45.328890Z apply individual Storage
  admission landings and bounded technical binding definition authority to the
  adjacent exact 53-family Browser scope. Browser and Storage owners must first
  search current canonical definitions per family and document existing partial
  contracts and scoped absence before labelling any missing technical binding as
  a new owner definition for already specified behavior. Existing owner-defined
  role, version and scope control reuse. Complete contracts, independent product
  gates, exact schema references, positive/negative semantic checks and root review
  precede each family's own admission landing. Prepared contracts are not admitted.
gui_related: false
gui_classification_reason: Records technical authority and admission constraints without changing presentation.
split_recommended: false
depends_on: [DL-039]
unblocks: []
acceptance_criteria:
  - The exact canonical 53-name scope matches the pinned proposal and response and is disjoint from DL-045's original 285 families.
  - Each new definition has per-family current-source search, existing-contract citations and scoped negative evidence; neither all-family absence nor sibling-derived authority is presumed.
  - New technical definitions are labelled newly authored and remain limited to already specified behavior.
  - Feature, integration, retention/deletion and competing-owner decisions remain separate and block dependent work when unresolved.
  - Each family has full owner/schema/positive-negative/root review gates and an individual Storage admission landing; preparation alone does not authorize persistence or checkpoint advancement.
  - No binding identifier, event membership, runtime proof, historical accounting, Spec Lock, readiness or seal state changes through this decision.
validation_surfaces:
  - Exact response SHA-256 and scope-name comparison
  - python3 scripts/pm-browser-event-admission.py
  - python3 scripts/pm-plan-index.py validate
risk_class: browser_event_authority_scope_expansion
reasoning_tier: high
context_scope: browser_53_bounded_binding_authority
implementation_surfaces: [Plans/Decision_Log.md, Plans/Section15_MVP_Promoted_Features_Spec.md, Plans/Contracts_V0.md, Plans/storage-plan.md]
node_compile_hint: {mode: bounded_technical_binding_authority, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - BROWSER-BINDINGS-53-RESPONSE-20260911
  - reports/packet-gap-closure-20260910/browser-binding-authority-proposal-20260911.json
  - reports/packet-gap-closure-20260910/browser-binding-authority-response-20260911.json
preserved_exact_tokens: ["Apply it to the Browser families too", "Approve the bounded Browser permission", "DL-039", "DL-045"]
negative_constraints:
  - Do not expand the frozen 53-family scope or DL-045 membership.
  - Do not infer missing bindings or evidence from sibling names or turn technical permission into product or retention authority.
  - Do not bulk admit, enable runtime, restamp historical evidence or clear readiness/seal gates.
owner_hints: [Plans/Decision_Log.md, Plans/Section15_MVP_Promoted_Features_Spec.md, Plans/Contracts_V0.md, Plans/storage-plan.md]
```

### DL-047 - Goal Objective And Revision Retention Follows Chat

```yaml
plan_unit_id: DL-047
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: Jared approves retaining GoalRecordV2, current accepted objective, accepted revisions and minimum
  replay lineage with the owning chat, including archived chats. Compaction, restart and model changes do not delete
  that history. Chat deletion immediately hides the content, purges active content within 24 hours and deleted backup
  content within 30 days unless held; a valid hold delays physical purge without restoring ordinary visibility.
  Goal Runtime owns semantics and Storage owns explicit retention, deletion, holds and coherent recovery. Permanent
  content-free audits keep their policies and references without holding or reconstructing deleted Goal text. Referenced
  bodies remain under their independent owners and retention rules.
gui_related: true
gui_classification_reason: The accepted policy determines visibility and availability of Goal history on chat deletion
  and archival.
split_recommended: false
depends_on:
- DL-045
unblocks: []
acceptance_criteria:
- The exact affirmative response and frozen card SHA-256 are preserved with genuine question identity and capture
  time.
- Current and superseded accepted Goal objectives and minimum replay lineage remain available while the owning chat
  is retained, including archived chats.
- Compaction, restart and model changes do not purge accepted Goal history.
- Chat deletion immediately hides Goal content and purges active content within 24 hours and backups within 30 days
  unless a valid hold delays physical purge; held deleted content remains ordinarily hidden.
- Permanent content-free audit references do not add a body hold or reconstruct deleted Goal text.
- Attachments, source messages/context, Plans, To-Dos and workflow records/evidence retain their independent owners
  and policies.
- Concrete physical custody, versioned readers/writers, deletion/recovery bindings and semantic verification are
  still required; no event admission or depth/readiness/seal clearance follows from this decision alone.
validation_surfaces:
- Exact approval/card SHA-256 and response preservation
- Decision Log PlanUnit YAML and pre-existing PlanUnit semantic preservation
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
risk_class: goal_body_retention_and_deletion
reasoning_tier: high
context_scope: accepted_goal_objective_and_revision_chat_retention
implementation_surfaces:
- Plans/Goal_Runtime_System.md
- Plans/storage-plan.md
- Plans/assistant-chat-design.md
node_compile_hint:
  mode: bounded_retention_policy_approval
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- EA-S08-GOAL-OBJECTIVE-RETENTION-RESPONSE-001
- call_kj3ZG4Ui0TdZN03B95Pwxv36
- reports/event-authority-20260911/step-08-goal-objective-retention-card.md
preserved_exact_tokens:
- 'Approve: retain with the chat (recommended)'
- GoalRecordV2
- EA-S08-GOAL-OBJECTIVE-RETENTION
- 24 hours
- 30 days
negative_constraints:
- Do not retain Goal text independently after chat deletion or let archival/compaction act as deletion.
- Do not restore ordinary visibility merely because a valid hold delays purge.
- Do not extend permanent audit retention to Goal bodies or referenced attachments/workflow evidence.
- Do not infer certification exceptions, event admission, native execution, depth/readiness clearance or governance
  sealing.
owner_hints:
- Plans/Goal_Runtime_System.md
- Plans/storage-plan.md
- Plans/assistant-chat-design.md
```

### DL-048 - Platform Decision Custody Reference Lifetime

```yaml
plan_unit_id: DL-048
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared approves retaining minimal non-secret immutable platform-capability decision custody
  while its original evaluation is pending and while retained referencing events, frozen run
  snapshots or valid owner holds require it. After resolution and the last reference/hold,
  authorized reference-aware cleanup deletes it without an independent grace period.
  This does not extend raw probe logs, provider responses, credentials, account content or
  original transaction/source observation retention, shorten event/snapshot/receipt policies, populate the
  catalog or admit a platform event. Concrete owner/source/storage contracts remain required.
gui_related: false
gui_classification_reason: Defines retained decision evidence lifetime and owner custody, not visual presentation.
split_recommended: false
depends_on: [DL-045]
unblocks: []
acceptance_criteria:
  - Preserve the exact affirmative answer, original question identity and frozen card SHA-256.
  - Pending evaluation and every retained referencing event, frozen run snapshot or valid owner hold protect the minimal decision record.
  - After resolution and the last reference/hold, authorized cleanup checks complete current authority through deletion without a new independent grace period.
  - Raw probe logs, provider responses, credentials, account content and original source controls keep their independent retention and deletion rules.
  - Event, frozen snapshot and append-receipt policies remain unchanged; no capability identity or application evaluation trigger is inferred.
  - Closed physical and semantic contracts, authentic source admission and cleanup/recovery proofs remain required; no native/depth/readiness/seal clearance follows.
validation_surfaces:
  - reports/event-authority-20260911/step-08-platform-lifetime-presentation.json
  - reports/event-authority-20260911/decision-responses.jsonl
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: platform_decision_custody_retention_and_cleanup
reasoning_tier: high
context_scope: minimal_platform_decision_reference_lifetime
implementation_surfaces:
  - Plans/newtools.md
  - Plans/orchestrator-subagent-integration.md
  - Plans/Models_System.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: bounded_retention_policy_approval
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - EA-S08-PLATFORM-CUSTODY-LIFETIME-RESPONSE-001
  - call_1PJzb6orMv2uLdLZYb4jdU1w
  - reports/event-authority-20260911/step-08-platform-lifetime-card.md
preserved_exact_tokens:
  - Approve this reference-based lifetime
  - EA-S08-PLATFORM-CUSTODY-LIFETIME
  - RP-OPERATIONAL-2555D
negative_constraints:
  - Do not retain raw probe/provider/account content or old source controls through decision references.
  - Do not infer app-root indefinite result custody, shorten independent policies, populate the catalog or create a new evaluation trigger.
  - Do not infer event admission, runtime proof, depth/readiness clearance or governance sealing.
owner_hints:
  - Plans/newtools.md
  - Plans/orchestrator-subagent-integration.md
  - Plans/Models_System.md
  - Plans/storage-plan.md
```

### DL-049 - Completed Compaction Detail Seven-Day Retention

```yaml
plan_unit_id: DL-049
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Retain completed compaction survivor/removal/translation detail, obsolete historical
  candidate/carrier/publication snapshots and resolved detailed journal/attempt/phase
  records for 604800 seconds after the first durable fully settled original terminal
  result. Unresolved obligations have no expiry anchor. Inclusive expiry never resets
  on read, retry, duplicate result or reference release, and all current source, hold,
  live, backup, rollback, recovery and maintenance protections still block deletion.
  Preserve independent current controls, original receipts/dedupe and minimal terminal
  replay custody. Registered backup copies retain their existing rules. Exact original
  member retirement and policy bindings remain required before use.
gui_related: false
gui_classification_reason: Defines compaction artifact retention and original custody, not visual presentation.
split_recommended: false
depends_on: [DL-045]
unblocks: []
acceptance_criteria:
  - Preserve Jared's exact Keep for 7 days answer, original question identity and frozen card SHA-256 separately from the earlier recommendation.
  - The first fully settled successful or failed original terminal result anchors inclusive expiry at 604800 seconds; unresolved attempts or event/receipt/result obligations have no expiry anchor.
  - Reads, retries, duplicate results and later reference release never reset the anchor; current membership and all valid holds/references override age eligibility.
  - Only exact eligible completed-detail members may be removed after complete current proof; a journal containing needed members cannot be deleted as a whole.
  - Current source/controls, original receipt/dedupe and compact terminal-result custody preserve their policies; backup copies keep existing retention and hold rules.
  - Concrete policy/schema/codec and original custody/disposal contracts remain required; no quarantine answer, event admission, native proof, depth/readiness or governance clearance follows.
validation_surfaces:
  - reports/event-authority-20260911/step-08-compaction-detail-cleanup-answer.json
  - reports/event-authority-20260911/step-08-compaction-detail-cleanup-presentation.json
  - reports/event-authority-20260911/decision-responses.jsonl
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: compaction_detail_retention_and_original_custody
reasoning_tier: high
context_scope: completed_compaction_detail_seven_day_retention
implementation_surfaces:
  - Plans/storage-plan.md
node_compile_hint:
  mode: bounded_retention_policy_approval
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - EA-S8-COMPACTION-DETAIL-CLEANUP-RESPONSE-001
  - call_gIlL1Kp5idZm1DuOMhSjrLat
  - reports/event-authority-20260911/step-08-compaction-detail-cleanup-card.md
preserved_exact_tokens:
  - Keep for 7 days
  - '604800'
  - EA-S8-COMPACTION-DETAIL-CLEANUP
negative_constraints:
  - Do not expire unresolved obligations or reset the first settlement anchor on retry, read or reference release.
  - Do not shorten independent source/receipt/result or backup policies or infer a quarantine answer.
  - Do not infer event admission, native runtime proof, depth/readiness clearance or governance sealing.
owner_hints:
  - Plans/storage-plan.md
```

### DL-050 - Hosted Repo Requests Route By Selected Adapter

```yaml
plan_unit_id: DL-050
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared decided on 2026-09-16 that assistant hosted-repo requests route to the universal Forge
  command families with the provider resolved from the selected repository adapter, and never
  default to GitHub. A provider prefix or a named provider is a provider qualification of the same
  universal command; the assistant discloses the resolved provider, never silently substitutes
  another, and states the mismatch and asks or refuses when the named provider is not the selected
  adapter. Provider-specific families remain only where the Forge owner defines no generic
  equivalent: cmd.github.actions.* for GitHub Actions, and cmd.github.connect and
  cmd.github.disconnect for GitHub device-code connection. Hosted issue work has no registered
  command family and none is invented. The Git versus hosted boundary, cross-domain boundary
  disclosure, and repo/worktree/compare handoff identity are unchanged. Alongside this decision the
  contract-gate canon in ATS-041 drops its stale authored-pair and corpus-census literals and defers
  to the cardinality and counts the checker reports.
gui_related: true
gui_classification_reason: Governs the provider the assistant names and dispatches for visible hosted-repo requests and its disclosure.
split_recommended: false
depends_on: [DL-044, ACD-017]
unblocks: []
acceptance_criteria:
  - Plans/assistant-chat-design.md section 5.3 and ACD-017 route hosted-repo requests to the universal Forge families with the provider resolved from the selected repository adapter and no GitHub default.
  - The provider-specific hosted families are exactly GitHub Actions and GitHub device-code connect and disconnect, each carried by the retained-owner passage in Plans/Forge_Integrations.md.
  - A provider prefix or named provider qualifies the same universal command, the resolved provider is disclosed, and a provider that is not the selected adapter is stated and asked or refused rather than silently substituted.
  - Historical GitHub and Source Control pull-request spellings stay compatibility aliases of the generic review create and merge commands with provider github, with no second handler, guard, or catalog row.
  - The Git versus hosted boundary, the cross-domain boundary disclosure, and the repo/worktree/compare handoff identity fields survive unchanged.
  - ATS-041 carries no literal contract-pair count or corpus census and defers to the cardinality and counts scripts/pm-new-contracts-verify.py reports.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
  - python3 scripts/pm-new-contracts-verify.py
risk_class: assistant_hosted_routing_provider_default_drift
reasoning_tier: high
context_scope: assistant_hosted_repo_routing
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/assistant-chat-design.md
  - Plans/Automated_Testing_System.md
node_compile_hint:
  mode: assistant_hosted_routing_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/Decision_Log.md:DL-050-direction-2026-09-16
  - Plans/Decision_Log.md#DL-044
  - Plans/assistant-chat-design.md#ACD-017
  - Plans/Forge_Integrations.md#FGI-008
  - Plans/UI_Command_Catalog.md#UCC-132
  - Plans/GitLab_Integration.md#GLI-005
  - Plans/Automated_Testing_System.md#ATS-041
preserved_exact_tokens:
  - cmd.forge.review.create
  - cmd.forge.review.merge
  - cmd.github.pr.create
  - cmd.github.actions.*
  - cmd.github.connect
  - cmd.github.disconnect
  - selected_repository_adapter
negative_constraints:
  - Do not default a hosted-repo request to GitHub or treat a provider prefix or provider name as a separate command family.
  - Do not invent a hosted issue command family or any other family the command catalog does not register.
  - Do not weaken the Git versus hosted boundary, the cross-domain disclosure, or the handoff identity fields.
  - Do not restore a literal authored contract-pair count or corpus census to ATS-041.
owner_hints:
  - Plans/Decision_Log.md
  - Plans/assistant-chat-design.md
```

### DL-051 - New Repository Object Format Picker Evidence Gated

```yaml
plan_unit_id: DL-051
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared decided on 2026-09-16, answering research finding F110 with "Add the picker as
  described, evidence-gated", that the existing Source Control setup flow offers a choice of
  object format when a new Jujutsu repository is created, shows the discovered effective format
  for repositories that already exist, and disables any choice that current capability evidence
  does not certify. The accepted scope is the proposal's own dependency list: a typed
  new-repository request extension carrying the chosen format, owner-owned format evidence read
  from one place, certified engine, library, transport and provider profiles per format, setup
  and cancellation fixtures, and copy stating that the format is permanent. Exact engine,
  command-line and repository-format qualification with truthful unsupported states is an
  existing prerequisite, not part of this acceptance. The answer changes no default, authorizes
  no cross-format migration, and promises no universal SHA-256 support.
gui_related: true
gui_classification_reason: The accepted capability is a visible setup-flow control, its disabled states, its discovered-format display and its permanence copy.
split_recommended: false
depends_on: [DL-043, SCS-004, SCS-015, JJI-006]
unblocks: []
acceptance_criteria:
  - The choice appears only in the existing Source Control setup flow for a repository being created, and an existing repository shows its discovered effective format with an explicit unknown state rather than a default or a guess.
  - The chosen format travels in a typed new-repository request extension and is never inferred from a display string, a label, or the engine default.
  - Format evidence has one owner and is read from there; per-format engine, library, transport and provider profiles are certified, and an offered choice is disabled by current capability evidence rather than by assumption.
  - Setup and cancellation both carry fixtures, and a cancelled or abandoned setup leaves no chosen format recorded anywhere.
  - The copy states that the object format of a repository is permanent once it is created.
  - No default object format changes, no cross-format migration of an existing repository is planned, and no universal SHA-256 support is claimed.
  - No command, request meaning, handler, event, certified engine version, or runtime capability is admitted by this record, and no WorkNodes, NodeSeeds or build tasks are created.
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-new-contracts-verify.py
risk_class: permanent_repository_format_chosen_without_evidence
reasoning_tier: high
context_scope: new_repository_object_format_selection
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Source_Control_System.md
  - Plans/Jujutsu_Integration.md
node_compile_hint:
  mode: optional_capability_acceptance_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - reports/jujutsu-research-2026-09-11/continuation3/final/comparison.json:c3006253a5c68074109312747feb67130fb6e12d4f82c66132b268487156370b
  - /mnt/Cursor/PuppetMaster-Evidence/jujutsu-followup-20260911/continuation3/adjudication/sources/premium/J0028-compare/notes.md:469c95597f5d7d498d549b6dd319f98996a354e88a05d771ca17b719a52d9bfe
  - Plans/Decision_Log.md:DL-051-direction-2026-09-16
  - Plans/ledgers/v2/pldg-20260916-002-jujutsu-object-format-picker
preserved_exact_tokens:
  - Add the picker as described, evidence-gated.
  - object format
  - discovered effective format
  - SHA-1
  - SHA-256
negative_constraints:
  - Do not change which object format a new repository gets by default.
  - Do not plan or imply migration of an existing repository from one object format to another.
  - Do not claim that SHA-256 is universally supported by engines, libraries, transports or providers.
  - Do not offer a format choice that current capability evidence does not certify, and do not disable one by assumption instead of by evidence.
  - Do not restate the exact engine, command-line and repository-format qualification requirement; reference its owner.
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Source_Control_System.md
  - Plans/Jujutsu_Integration.md
```

### DL-052 - Source Graph Parent Reference Bound Thirty Two With Fetch The Rest

```yaml
plan_unit_id: DL-052
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared decided on 2026-09-16, answering the open parent-bound question with "for the parent
  referenced bound, lets do 32 then the ability to fetch the rest", that a node in a source graph
  page declares at most thirty-two parent references. A node with more parents marks its parent
  list truncated and carries a reference through which the remaining parents are fetched by a
  bounded follow-up request. That request is fenced exactly as page continuation is: same
  repository, workspace, backend and projection identity, same projection generation, and the
  same currentness rule, so a stale or superseded page cannot be expanded as current. A node that
  is not truncated carries no expansion reference. The provisional bound of six hundred is
  retired.
gui_related: true
gui_classification_reason: The bound and its truncation marker govern what the virtualized history-and-graph view can render and how honestly it shows an incomplete parent list.
split_recommended: false
depends_on: [SCS-017]
unblocks: []
acceptance_criteria:
  - A source graph node carries at most thirty-two parent references in one page, and the schema enforces that bound.
  - A node whose parents exceed the bound marks its parent list truncated and carries a non-null expansion reference; a node that is not truncated carries none.
  - The bounded fetch-the-rest request binds the same repository, workspace, backend and projection identity and the same projection generation as the page it came from, and is admitted only for a current page, exactly as page continuation is.
  - The retired provisional bound of six hundred appears nowhere as a current value, and the bound is not presented as derived from the 200-node page cap or the 600-edge adjacency cap.
  - Positive and negative fixtures cover the bound, the truncation marker and the expansion request.
  - No command, handler, event, or runtime behaviour is admitted, and no WorkNodes, NodeSeeds or build tasks are created by this record.
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-new-contracts-verify.py
risk_class: unbounded_or_dishonest_parent_adjacency_in_a_bounded_page
reasoning_tier: high
context_scope: bounded_source_graph_projection
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Source_Control_System.md
  - Plans/source_control_contracts.schema.json
  - Plans/source_control_contract_fixtures.json
node_compile_hint:
  mode: owner_bound_specification_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260916-001-jujutsu-continuation-corrections:q-001
  - reports/jujutsu-research-2026-09-11/continuation3-landing/verification.json
  - Plans/Decision_Log.md:DL-052-direction-2026-09-16
  - Plans/Source_Control_System.md#SCS-017
preserved_exact_tokens:
  - for the parent referenced bound, lets do 32 then the ability to fetch the rest
  - parent_refs
  - parent_refs_truncated
  - parent_expansion_cursor_ref
  - next_cursor_ref
negative_constraints:
  - Do not raise, lower or reinstate the parent bound without a new owner decision.
  - Do not present thirty-two parents as a complete parent list when the node is truncated.
  - Do not let an expansion request read a stale, partial or unavailable page as if it were current.
  - Do not require every parent of a node to appear in the same page; cross-page ancestry stays legitimate.
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Source_Control_System.md
```

### DL-053 - Source Graph Node Reference Unique Within A Page

```yaml
plan_unit_id: DL-053
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared decided on 2026-09-16, answering whether an exact duplicate node row should be allowed with "Yes,
  forbid exact duplicates too, fold it in", that a source graph page never emits the same `node_ref`
  twice. Uniqueness within the page is the rule, not merely the absence of a revision conflict: two rows
  that share a `node_ref` are rejected whether or not they agree on `revision_ref`, because a repeated
  reference breaks stable node identity and selection anchoring however alike the rows are. The narrower
  wording, which forbade only rows sharing a reference while naming different revisions, is retired, and
  the contract semantic gate rejects both cases under one rule.
gui_related: true
gui_classification_reason: The rule governs what the virtualized history-and-graph view may render and whether a selection anchor can identify one row.
split_recommended: false
depends_on: [SCS-017, DL-052]
unblocks: []
acceptance_criteria:
  - SCS-017 states that `node_ref` is unique within one page and no longer conditions the rule on differing `revision_ref` values.
  - The `source_control_contracts` branch of the contract semantic gate reports one rule for both cases, and rejects a page that repeats a `node_ref` whether or not the rows agree.
  - Negative fixtures cover both a conflicting-revision duplicate and an exact duplicate row, each structurally valid and each failing for that rule.
  - A page that emits each node once is unaffected, and cross-page repetition of a node between different pages stays legitimate.
  - No command, handler, event, or runtime behaviour is admitted, and no WorkNodes, NodeSeeds or build tasks are created by this record.
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-new-contracts-verify.py
  - python3 -m unittest tests.test_pm_source_control_effects
risk_class: repeated_node_reference_breaks_selection_anchoring
reasoning_tier: high
context_scope: bounded_source_graph_projection
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Source_Control_System.md
  - Plans/source_control_contract_fixtures.json
  - scripts/pm-new-contracts-verify.py
node_compile_hint:
  mode: owner_rule_refinement_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260916-001-jujutsu-continuation-corrections:q-003
  - Plans/Decision_Log.md:DL-053-direction-2026-09-16
  - Plans/Source_Control_System.md#SCS-017
preserved_exact_tokens:
  - Yes, forbid exact duplicates too, fold it in
  - node_ref
  - revision_ref
  - source_graph_duplicate_node_ref_in_page
negative_constraints:
  - Do not re-narrow the rule to conflicting `revision_ref` values only.
  - Do not treat an exact duplicate node row as harmless because its fields agree.
  - Do not extend the rule across pages; a node may legitimately appear on another page.
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Source_Control_System.md
```

### DL-054 - Parent List Truncates Only At The Bound And Expansion Echoes Currentness

```yaml
plan_unit_id: DL-054
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared answered two review questions about the source graph parent-expansion contract on 2026-09-16
  with "1. no 2. yes 3. ok". A producer may not truncate a node's parent list before it holds all
  thirty-two references, so `parent_refs_truncated=true` always accompanies a full list and a shorter
  list always means the node has no further parents; the schema already enforced this and SCS-017 now
  states it. The parent-expansion request's `projection_currentness` echoes the page's `currentness`
  field for field, gaining the page's `expires_at_utc` as a required field that keeps the page's
  nullable shape, so the freshness horizon is readable from the request alone and the claim that the
  request is fenced exactly as page continuation is becomes literally true. The third answer accepts a
  whitespace-only re-indentation of the fixture entries this work added.
gui_related: true
gui_classification_reason: Both rules govern what the virtualized history-and-graph view may show about an incomplete parent list and how fresh the data behind an expansion is.
split_recommended: false
depends_on: [DL-052, SCS-017]
unblocks: []
acceptance_criteria:
  - SCS-017 states that a parent list is truncated only once it holds all 32 references, so early truncation is not permitted and a short list means the node has no further parents.
  - The parent-expansion request requires `expires_at_utc` in `projection_currentness`, with the same nullable timestamp shape the page's `currentness` uses, and the request's currentness is field-for-field identical to the page's.
  - A positive fixture carries the echoed horizon and matches the page it expands; a negative fixture omitting it is rejected.
  - No schema change was needed for the first answer, because the truncation conditional already required a truncated node to carry the full bound.
  - The fixture re-indentation changes whitespace only and the file parses to an identical document.
  - No command, handler, event, or runtime behaviour is admitted, and no WorkNodes, NodeSeeds or build tasks are created by this record.
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-new-contracts-verify.py
  - python3 -m unittest tests.test_pm_source_control_effects
risk_class: incomplete_parent_list_or_unreadable_expansion_freshness
reasoning_tier: high
context_scope: bounded_source_graph_projection
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Source_Control_System.md
  - Plans/source_control_contracts.schema.json
  - Plans/source_control_contract_fixtures.json
node_compile_hint:
  mode: owner_rule_refinement_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260916-001-jujutsu-continuation-corrections:q-004
  - Plans/ledgers/v2/pldg-20260916-001-jujutsu-continuation-corrections:q-005
  - Plans/Decision_Log.md:DL-054-direction-2026-09-16
  - Plans/Decision_Log.md#DL-052
  - Plans/Source_Control_System.md#SCS-017
preserved_exact_tokens:
  - 1. no 2. yes 3. ok
  - parent_refs_truncated
  - projection_currentness
  - expires_at_utc
  - observed_at_utc
negative_constraints:
  - Do not permit a producer to truncate a parent list before it holds all 32 references.
  - Do not drop any field of the page's currentness from an expansion request, and do not give the request a currentness shape the page does not have.
  - Do not read a short parent list as possibly incomplete; only the truncation marker means there is more.
  - Do not treat the re-indentation as a content change; the fixture document is identical.
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Source_Control_System.md
```

### DL-055 - Plan Layer Seal Is A Production Seal With Repository Gates At Landing

```yaml
plan_unit_id: DL-055
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared decided on 2026-09-17 that a plan-layer seal is a production seal and that the
  repository-wide gates run at landing. A per-plan governance seal runs the fifteen plan-layer
  operations register_owners, index_generate, index_validate, readiness_generate,
  audit_status_generate, audit_status_validate, shards_generate, shards_check, shard_evidence_sync,
  spec_lock_refresh, final_index_validate, readiness_projection_check, spec_lock_verify,
  plan_graph_validate, and evidence_validate, and omits the four repository-wide operations
  run_gates, audit_governance, migration_snapshot, and migration_validate. The seal record carries
  seal_profile plan_layer, omitted_operations naming exactly those four, full_repository_qualified
  false, and repository_gates_status not_run_in_this_seal, so a plan-layer seal never claims
  repository qualification and reports no outcome for an operation it did not run. Every retained
  operation runs the same validator with the same arguments and scope as before. Three of the four omitted
  operations, run_gates, audit_governance, and migration_validate, run when a branch lands on main,
  in the shared checkout after the fast-forward and the shard check and before main is pushed, at a
  measured cost of about ten minutes, read through scripts/pm-landing-check.py, which reports only
  the failures that are new since the recorded baseline reports/landing-checks/baseline.json and the
  failures that name a path the branch touches, and on a nightly schedule from which the baseline is
  refreshed, never per landing; migration_snapshot runs only nightly, in a worktree, by the
  designated Plans agent, because it creates a new tracked run directory; a landing is
  refused when a failure names a file the branch touches, and proceeds with the failures reported
  when every failure names files the branch does not touch; stale governance hashes for the documents
  the branch itself edited are the expected state until the designated reseal and never stop a landing.
gui_related: false
gui_classification_reason: Seal profile composition and repository gate placement are planning governance timing, not GUI behavior.
split_recommended: false
depends_on: [BPM-005, BPM-009]
unblocks: []
acceptance_criteria:
  - BPM-005 states the fifteen plan-layer operations, the four omitted operations, the labelled seal record, that a plan-layer seal never claims repository qualification, and that every retained operation runs unchanged.
  - BPM-009 places run_gates, audit_governance, and migration_validate at landing on main and all four, including migration_snapshot in a worktree, on a nightly schedule, with the landing refusal and reporting rule and the measured cost.
  - The landing procedure in AGENTS.md and .claude/CLAUDE.md carries the repository-wide gates as one step after the fast-forward and the shard check and before the push, states the measured cost, and runs them through scripts/pm-landing-check.py against the recorded baseline.
  - The bootstrap seal prose no longer says that a per-plan seal runs the full gate set, and no passage in Plans says a seal qualifies the repository.
  - No validator, validator argument, or validator scope changes for any retained operation.
  - No command, handler, event, or runtime behaviour is admitted, and no WorkNodes, NodeSeeds, executable queues, or build tasks are created by this record.
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
  - python3 scripts/pm-landing-check.py --base origin/main
  - Manual AGENTS.md and .claude/CLAUDE.md landing-procedure review.
risk_class: seal_claim_overreach_or_unrun_repository_gates
reasoning_tier: high
context_scope: repo_governance
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Bootstrap_Planning_Migration.md
  - Plans/bootstrap/Bootstrap_Planning_Workflow.md
  - Plans/bootstrap/Bootstrap_Design_Brief.md
  - Plans/bootstrap/Codex_Prompts.md
  - AGENTS.md
  - .claude/CLAUDE.md
node_compile_hint:
  mode: governance_seal_profile_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/Decision_Log.md:DL-055-direction-2026-09-17
  - Plans/Bootstrap_Planning_Migration.md#BPM-005
  - Plans/Bootstrap_Planning_Migration.md#BPM-009
preserved_exact_tokens:
  - plan_layer
  - seal_profile
  - omitted_operations
  - full_repository_qualified
  - repository_gates_status
  - not_run_in_this_seal
  - run_gates
  - audit_governance
  - migration_snapshot
  - migration_validate
negative_constraints:
  - Do not read a plan-layer seal as a full-profile seal or as evidence that the repository-wide gates passed.
  - Do not run the four repository-wide operations inside a per-plan seal in order to satisfy the landing rule.
  - Do not weaken, reorder, or narrow the scope of any operation the plan-layer profile retains.
  - Do not land a branch whose own files fail a repository-wide gate, and do not fix another thread's files to make one pass.
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Bootstrap_Planning_Migration.md
```

### DL-056 - Conflict And Merge Editors Are Read Only Or Built In On A Jujutsu Workspace

```yaml
plan_unit_id: DL-056
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared answered the continuation-4 conflict and merge editor decision card on 2026-09-17 by taking the
  recommendation, verbatim "Do you recommendations for the choices." `merge_editor_available` is owned by
  Source Control and means that Puppet Master's own built-in structured merge editor is present and usable for
  the selected conflicted file on this exact Host and Environment; it makes no claim about any external tool,
  and the Git conflict-assistant preference that opens an external tool never sets it. On a Jujutsu workspace
  the diff-open, merge-editor-open and Git external-merge-tool preference surfaces are read-only or
  built-in-editor-only, and a control disabled by that scoping carries the typed reason
  `conflict_surface_read_only_on_jujutsu`. The save-back contract for a Jujutsu conflict is deferred until the
  built-in editor's save path is designed. Candidates C4D-04, C4M-03, C4G-02 and C4G-03 are recorded as
  deferred under this decision, not declined; the rule they converged on, that a missing entry is never a write
  instruction, is what the deferred contract must satisfy. Nothing on the Git-adapter side changes and no
  command enters or leaves the frozen Jujutsu inventory.
gui_related: true
gui_classification_reason: The decision determines which conflict and merge controls a person sees enabled on a Jujutsu workspace and what a disabled one says.
split_recommended: false
depends_on: [SCS-015, JJI-005]
unblocks: []
acceptance_criteria:
  - SCS-015 defines `merge_editor_available` as the built-in structured merge editor's availability for the selected file on the exact Host and Environment, and states that no external-tool preference sets it.
  - SCS-015 scopes diff open, merge-editor open and the Git external-merge-tool preference as read-only or built-in-editor-only on a Jujutsu workspace.
  - '`source_control_command_disabled_reason.reason_code` admits `conflict_surface_read_only_on_jujutsu`, with a positive fixture carrying it and a negative fixture rejecting a near-miss code.'
  - The safe next action for that disabled state comes from the existing closed vocabulary and is `inspect`; no new safe-next-action value is introduced.
  - The save-back contract is deferred and the four cluster candidates are recorded as deferred rather than declined.
  - No command, handler, event, or runtime behaviour is admitted, and no WorkNodes, NodeSeeds or build tasks are created by this record.
validation_surfaces:
  - Plans/source_control_contracts.schema.json#/$defs/source_control_command_disabled_reason
  - Plans/source_control_contract_fixtures.json
  - python3 scripts/pm-new-contracts-verify.py
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: undefined_merge_editor_availability_or_unsafe_external_write_to_a_jujutsu_workspace
reasoning_tier: high
context_scope: source_control_conflict_and_merge_surfaces
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Source_Control_System.md
  - Plans/source_control_contracts.schema.json
  - Plans/source_control_contract_fixtures.json
node_compile_hint:
  mode: owner_product_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260917-001-jujutsu-continuation4-corrections:q-006
  - Plans/Decision_Log.md:DL-056-direction-2026-09-17
  - Plans/Source_Control_System.md#SCS-015
preserved_exact_tokens:
  - Do you recommendations for the choices.
  - merge_editor_available
  - conflict_surface_read_only_on_jujutsu
  - inspect
negative_constraints:
  - Do not let any external merge tool write into a Jujutsu workspace through these surfaces.
  - Do not treat `merge_editor_available` as a statement about an external tool.
  - Do not record the deferred save-back candidates as declined.
  - Do not add a conflict-resolution command to the frozen Jujutsu inventory under this decision.
  - Do not change the Git-adapter scoping of the existing conflict-assistant rows.
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Source_Control_System.md
  - Plans/UI_Command_Catalog.md
```

### DL-057 - A Bookmark Control Says Which Remotes It Touches Before It Touches Them

```yaml
plan_unit_id: DL-057
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared answered the continuation-4 bookmark control decision card on 2026-09-17 by taking the recommendation,
  verbatim "Do you recommendations for the choices." Source Control owns a bookmark state vocabulary of exactly
  `synced`, `unsynced`, `tracked per remote`, `combined` and `absent`. Every bookmark control and confirmation
  names the remotes it affects before dispatch: untrack on a combined bookmark confirms every remote by name,
  untrack on one unsynced remote confirms that remote, rename on a tracking bookmark discloses that it untracks
  first, and push and fetch say whether they reach all remotes or one. Delete-local and forget-remote never
  share one control. Pseudo-remotes and non-fetchable remotes are not presented as ordinary remotes, and an
  unsynced, untracked or absent reference is never folded silently into a combined chip. The Jujutsu
  confirmation record carries the disclosed remote scope and the exact remote identities it named. This adds no
  command and `forget-remote` stays out of the frozen thirty-one-command inventory.
gui_related: true
gui_classification_reason: The decision determines the words on every bookmark control and confirmation and which remotes a person is told about before dispatch.
split_recommended: false
depends_on: [SCS-005, JJI-003]
unblocks: []
acceptance_criteria:
  - SCS-005 states the five-value bookmark state vocabulary and the disclosure rules for untrack, rename, delete, forget, push and fetch.
  - >-
    The Jujutsu `confirmation` record requires `disclosed_remote_scope` and `disclosed_remote_identity_refs`, and
    the scope constrains the list. `no_remote` names none, `one_remote` names exactly one, and `all_remotes` names at
    least one.
  - Every shipped confirmation fixture carries the disclosure, and three negatives reject an all-remotes confirmation naming none, a one-remote confirmation naming two, and a no-remote confirmation naming one.
  - No command is added; `forget-remote` is not admitted to the frozen inventory by this record.
  - No command, handler, event, or runtime behaviour is admitted, and no WorkNodes, NodeSeeds or build tasks are created by this record.
validation_surfaces:
  - Plans/jujutsu_integration_contracts.schema.json#/$defs/confirmation
  - Plans/jujutsu_integration_contract_fixtures.json
  - python3 scripts/pm-new-contracts-verify.py
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: undisclosed_remote_scope_on_a_destructive_bookmark_action
reasoning_tier: high
context_scope: source_control_bookmark_presentation_and_confirmation
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Source_Control_System.md
  - Plans/jujutsu_integration_contracts.schema.json
  - Plans/jujutsu_integration_contract_fixtures.json
node_compile_hint:
  mode: owner_product_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260917-001-jujutsu-continuation4-corrections:q-007
  - Plans/Decision_Log.md:DL-057-direction-2026-09-17
  - Plans/Source_Control_System.md#SCS-005
preserved_exact_tokens:
  - Do you recommendations for the choices.
  - synced
  - unsynced
  - tracked per remote
  - combined
  - absent
  - disclosed_remote_scope
  - disclosed_remote_identity_refs
negative_constraints:
  - Do not present a bookmark control without naming the remotes it affects.
  - Do not share one control between delete-local and forget-remote.
  - Do not fold an unsynced, untracked or absent reference into a combined chip.
  - Do not show a pseudo-remote or a non-fetchable remote as an ordinary remote.
  - Do not add `forget-remote` or any other command to the frozen Jujutsu inventory under this decision.
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Source_Control_System.md
  - Plans/UI_Command_Catalog.md
```

### DL-058 - The Seven Shapes The Continuation 4 Corrections Take

```yaml
plan_unit_id: DL-058
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared answered the seven shape questions the continuation-4 candidate adjudication raised on 2026-09-17,
  verbatim and whole "I agree with all 7 of your recommendations. You can do all the next steps. You can use Opus 5
  max for your strong model."; the third sentence is about experiment tooling rather than canon. Restore verification
  depth lands as a JJI-008 rule plus an `object_verification_depth` field on the receipt referencing the Backup
  owner's existing `integrity_verification_level` enum. Divergence lands by appending `divergent` to the frozen
  `graph_states` list, which preserves every existing position, and by minting
  `change_divergent_ambiguous_target` rather than reusing the undefined `invalid_target_identity`. Version
  identity lands as one shared block serving both the closure records and the certification profile, on
  JJI-022's pattern. The machine-local store entry repair lands as three obligations with the enumerated entry
  list carried as an open ledger question. The `jujutsu_integration_contracts` branch of the contract semantic
  gate is authorized for exactly four relational rules and for nothing else under `scripts/`. The two product
  choices are answered separately as DL-056 and DL-057. Candidate C4D-02 stays rejected as inside continuation
  3's marker-only conflict rejection.
gui_related: false
gui_classification_reason: The record settles the machine-contract and validator shape of thirteen corrections; the user-visible halves are carried by DL-056, DL-057 and the owner units the corrections edit.
split_recommended: false
depends_on: [JJI-003, JJI-006, JJI-008, SCS-014, SCS-017]
unblocks: []
acceptance_criteria:
  - Verification depth lands as both a JJI-008 acceptance criterion and a receipt field referencing the Backup owner's `integrity_verification_level` enum, so it is falsifiable by a fixture.
  - '`divergent` is appended to `graph_states` rather than inserted, so every existing frozen position is preserved, and `change_divergent_ambiguous_target` is minted rather than reusing an undefined code.'
  - One `native_toolchain_identity` block serves the closure record, the restore receipt and the effective-capability snapshot.
  - The machine-local entry repair lands three obligations and records the enumerated entry list as an open ledger question rather than inventing it.
  - The semantic gate carries exactly four Jujutsu rules, each with one authored negative fixture, and no other file under `scripts/` is changed by this wave.
  - The two product choices are recorded as DL-056 and DL-057, and candidate C4D-02 remains rejected.
  - No command, handler, event, or runtime behaviour is admitted, and no WorkNodes, NodeSeeds or build tasks are created by this record.
validation_surfaces:
  - python3 scripts/pm-new-contracts-verify.py
  - python3 -m unittest tests.test_pm_jujutsu_closure_semantics
  - python3 -m unittest tests.test_pm_source_control_effects
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: correction_landed_in_a_shape_its_owner_did_not_choose
reasoning_tier: high
context_scope: jujutsu_continuation4_correction_wave
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Jujutsu_Integration.md
  - Plans/Source_Control_System.md
  - Plans/jujutsu_integration_contracts.schema.json
  - Plans/source_control_contracts.schema.json
  - Plans/backup_restore_system_contracts.schema.json
  - Plans/final_gui_interaction_contracts.schema.json
  - scripts/pm-new-contracts-verify.py
node_compile_hint:
  mode: owner_rule_refinement_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260917-001-jujutsu-continuation4-corrections:q-001
  - Plans/ledgers/v2/pldg-20260917-001-jujutsu-continuation4-corrections:q-002
  - Plans/ledgers/v2/pldg-20260917-001-jujutsu-continuation4-corrections:q-003
  - Plans/ledgers/v2/pldg-20260917-001-jujutsu-continuation4-corrections:q-004
  - Plans/ledgers/v2/pldg-20260917-001-jujutsu-continuation4-corrections:q-005
  - Plans/ledgers/v2/pldg-20260917-001-jujutsu-continuation4-corrections:q-006
  - Plans/ledgers/v2/pldg-20260917-001-jujutsu-continuation4-corrections:q-007
  - Plans/Decision_Log.md:DL-058-direction-2026-09-17
  - Plans/Decision_Log.md#DL-056
  - Plans/Decision_Log.md#DL-057
preserved_exact_tokens:
  - I agree with all 7 of your recommendations. You can do all the next steps. You can use Opus 5 max for your strong model.
  - object_verification_depth
  - integrity_verification_level
  - change_divergent_ambiguous_target
  - native_toolchain_identity
  - jujutsu_integration_contracts
negative_constraints:
  - Do not add a fifth Jujutsu semantic rule or any other change under scripts/ under this authorization.
  - Do not insert `divergent` into `graph_states` at a position that shifts an existing frozen value.
  - Do not invent the enumerated machine-local entry list before the source audit is done.
  - Do not reopen C4D-02 as a correction.
  - Do not claim runtime, native adapter, security, performance or readiness evidence from these static contracts.
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Jujutsu_Integration.md
  - Plans/Source_Control_System.md
```

### DL-059 - Branch Policies Are Shown On A Pull Request And The Branch Read Is Deferred

```yaml
plan_unit_id: DL-059
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared answered the first Azure DevOps decision card on 2026-09-18 by taking the recommendation, verbatim
  "agree". Puppet Master's branch-policy promise is narrowed to what the plans already say: the branch policies
  it shows are the ones evaluated on a pull request. Reading the policies configured on a branch is not offered,
  and the closed forty-three-command forge set gains no command for it. The branch-policy read is deferred rather
  than declined; it is deliberately not planned as a PlanUnit, because its natural home is the gate list DL-062
  establishes and a read command before that region exists would produce rows with nowhere to render.
gui_related: true
gui_classification_reason: The decision settles what a person looking at a branch is told about the gates that will block a merge.
split_recommended: false
depends_on: [ADO-003, ADO-005]
unblocks: []
acceptance_criteria:
  - The Azure owner states that the branch policies Puppet Master shows are the ones evaluated on a pull request, and that reading the policies configured on a branch is not offered.
  - No command is added to the forge command set by this record, and the branch-policy read is recorded as deferred rather than declined.
  - No command, handler, event, or runtime behaviour is admitted, and no WorkNodes, NodeSeeds or build tasks are created by this record.
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: unrenderable_branch_policy_promise
reasoning_tier: high
context_scope: azure_devops_branch_policy_scope
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Azure_DevOps_Integration.md
node_compile_hint:
  mode: owner_product_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260918-001-azure-devops-corrections:q-001
  - Plans/Decision_Log.md:DL-059-direction-2026-09-18
  - Plans/Azure_DevOps_Integration.md#ADO-005
preserved_exact_tokens:
  - agree
  - pull request
  - deferred rather than declined
negative_constraints:
  - Do not add a branch-policy read command under this decision.
  - Do not record the branch-policy read as declined.
  - Do not present branch-scoped policy information that no command reads.
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Azure_DevOps_Integration.md
```

### DL-060 - An Azure Vote Is Bound To The Revision Puppet Master Observed

```yaml
plan_unit_id: DL-060
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared answered the second Azure DevOps decision card on 2026-09-18 by taking the recommendation, verbatim
  "agree". Azure attaches no revision identity to a vote, so an Azure vote is bound to the provider revision
  Puppet Master read it against, and every surface that shows it states that the binding is observed by Puppet
  Master rather than provider-asserted. A vote observed before a new provider revision is stale against that
  revision and is shown as stale. A vote carrying neither a provider-asserted nor an observation-time binding is
  not shown as current evidence. The alternative, treating Azure votes as never attributable, was rejected
  because it leaves the Azure owner's two vote criteria unmeetable and shows every approval as unbound.
gui_related: true
gui_classification_reason: The label and the staleness state are what a person reads next to an approval before trusting it.
split_recommended: false
depends_on: [ADO-003, FGI-004]
unblocks: [DL-065]
acceptance_criteria:
  - An Azure vote carries the provider revision it was observed against, and the surface states that the binding is observed by Puppet Master rather than provider-asserted.
  - A vote observed against an earlier provider revision is shown as stale against the current one, and a vote with no binding of either kind is not shown as current evidence.
  - No command, handler, event, or runtime behaviour is admitted, and no WorkNodes, NodeSeeds or build tasks are created by this record.
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: silently_transferred_approval_evidence
reasoning_tier: high
context_scope: azure_devops_vote_binding
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Azure_DevOps_Integration.md
  - Plans/Forge_Integrations.md
node_compile_hint:
  mode: owner_product_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260918-001-azure-devops-corrections:q-002
  - Plans/Decision_Log.md:DL-060-direction-2026-09-18
  - Plans/Azure_DevOps_Integration.md#ADO-006
preserved_exact_tokens:
  - agree
  - observed by Puppet Master
  - provider-asserted
negative_constraints:
  - Do not present an observation-time binding as a provider assertion.
  - Do not show a vote with no binding as current evidence.
  - Do not carry a vote across a new provider revision without restating its staleness.
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Azure_DevOps_Integration.md
  - Plans/Forge_Integrations.md
```

### DL-061 - The Checks View Leads With Evaluations And Separates Unwatched Statuses

```yaml
plan_unit_id: DL-061
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared answered the third Azure DevOps decision card on 2026-09-18 by taking the recommendation, verbatim
  "agree". On Azure the checks view leads with policy evaluations, the list that agrees with what the provider
  will enforce, and shows any status check no policy watches in a separate informational group that is never
  presented as a gate. One check never appears twice. The single joined list is the stated end state and is
  reached only once a documented key between a status check and the policy that watches it is established and
  recorded as evidence; until then the two-group form is the shipped form and the absence of the key is stated
  rather than worked around.
gui_related: true
gui_classification_reason: The decision settles what the checks region contains, in what order, and what is presented as a gate rather than as information.
split_recommended: false
depends_on: [ADO-003, FGI-005]
unblocks: [DL-062]
acceptance_criteria:
  - Policy evaluations are the primary list; a status check no policy watches appears in a separate informational group and is not presented as a gate.
  - One provider check never appears in both groups at once.
  - The joined single list is admitted only on a documented and evidence-bearing key between a status check and the policy that watches it; without that key the two-group form stands and the missing key is stated.
  - No command, handler, event, or runtime behaviour is admitted, and no WorkNodes, NodeSeeds or build tasks are created by this record.
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: duplicated_or_unenforced_check_presentation
reasoning_tier: high
context_scope: azure_devops_checks_view_composition
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Azure_DevOps_Integration.md
node_compile_hint:
  mode: owner_product_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260918-001-azure-devops-corrections:q-003
  - Plans/Decision_Log.md:DL-061-direction-2026-09-18
  - Plans/Azure_DevOps_Integration.md#ADO-007
preserved_exact_tokens:
  - agree
  - policy evaluations
  - status check
  - informational
negative_constraints:
  - Do not show one provider check in both groups at once.
  - Do not present an unwatched status check as a gate.
  - Do not join the two lists on an undocumented or inferred key.
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Azure_DevOps_Integration.md
```

### DL-062 - One Gate List With A Source Column And An Enforcement Column

```yaml
plan_unit_id: DL-062
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared answered the fourth Azure DevOps decision card on 2026-09-18 by taking the recommendation, verbatim
  "agree". Source Control's current checks region stays one region and becomes one gate list. Every row declares
  the provider surface it came from and its enforcement, which is required, advisory, not enforced or unknown, so
  the question "what blocks this merge" is answered in one place. No provider-neutral policies region is added
  and no new section vocabulary is introduced, which is what Source Control's own rule against section
  proliferation asks for. The final interface specification carries the same two columns.
gui_related: true
gui_classification_reason: The decision settles the columns and the region a person reads to find what will block a merge.
split_recommended: false
depends_on: [SCS-005, ADO-005]
unblocks: [DL-059]
acceptance_criteria:
  - The current checks region is one gate list whose rows each carry a source and an enforcement value; no second policies region is added.
  - Enforcement is stated rather than inferred, and a row whose enforcement the provider does not publish reads unknown rather than required or advisory.
  - Source Control and the final interface specification name the same two columns.
  - No command, handler, event, or runtime behaviour is admitted, and no WorkNodes, NodeSeeds or build tasks are created by this record.
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: section_proliferation_or_unstated_enforcement
reasoning_tier: high
context_scope: source_control_gate_list_presentation
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Source_Control_System.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: owner_product_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260918-001-azure-devops-corrections:q-004
  - Plans/Decision_Log.md:DL-062-direction-2026-09-18
  - Plans/Source_Control_System.md#SCS-023
  - Plans/FinalGUISpec.md#F3-561
preserved_exact_tokens:
  - agree
  - current checks
  - gate list
  - enforcement
negative_constraints:
  - Do not add a second policies region or new section vocabulary under this decision.
  - Do not infer an enforcement value the provider does not publish.
  - Do not let the two consumer owners name different columns.
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Source_Control_System.md
  - Plans/FinalGUISpec.md
```

### DL-063 - The Merge Command Gains A Typed Strategy Field That Is Always Shown

```yaml
plan_unit_id: DL-063
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared answered the fifth Azure DevOps decision card on 2026-09-18 by taking the recommendation, verbatim
  "agree". The forge merge request carries one provider-neutral typed merge strategy field. It defaults to the
  provider's own default rather than to a Puppet Master preference, and it is always shown before the merge,
  including when it is the default, because a strategy visible only when changed is a strategy nobody reads.
  Where the effective policy permits only some strategies the forbidden ones are not offered, and a completion
  the policy forbids is refused before the request rather than reported after it. This is the capability half of
  the TA-035 correction, whose prose half states that on Azure an omitted strategy silently selects
  no-fast-forward.
gui_related: true
gui_classification_reason: The strategy is a control a person sets and reads before the one action they cannot undo cheaply.
split_recommended: false
depends_on: [FGI-010, ADO-003]
unblocks: []
acceptance_criteria:
  - The merge request carries one typed provider-neutral merge strategy field whose default is the provider's own default.
  - The strategy is shown before every merge, including when it is the default.
  - A strategy the effective policy forbids is not offered, and a completion naming one is refused before the request rather than reported after it.
  - No command, handler, event, or runtime behaviour is admitted, and no WorkNodes, NodeSeeds or build tasks are created by this record.
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: implicit_merge_strategy_selection
reasoning_tier: high
context_scope: forge_merge_strategy
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Forge_Integrations.md
node_compile_hint:
  mode: owner_product_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260918-001-azure-devops-corrections:q-005
  - Plans/Decision_Log.md:DL-063-direction-2026-09-18
  - Plans/Forge_Integrations.md#FGI-018
preserved_exact_tokens:
  - agree
  - merge strategy
  - no-fast-forward
  - the provider's own default
negative_constraints:
  - Do not hide the strategy when it is the default.
  - Do not default the strategy to a Puppet Master preference rather than the provider's own default.
  - Do not offer a strategy the effective policy forbids.
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Forge_Integrations.md
```

### DL-064 - A Requeue Command Disabled With A Typed Reason Where There Is No Equivalent

```yaml
plan_unit_id: DL-064
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared answered the sixth Azure DevOps decision card on 2026-09-18 by taking the recommendation, verbatim
  "agree". A command that re-runs a policy evaluation is planned. Where the provider has no equivalent it is
  disabled with a typed reason and never hidden. Where the provider would accept a requeue that does nothing,
  because the evaluation is not a build policy, it is refused with a typed reason rather than reported as
  success. Where it would cancel a build already running for that policy, the confirmation discloses the
  cancellation and names the policy before dispatch, as an effect on a third object rather than a discovery
  afterwards. The command follows DL-061, because the interface must settle what an evaluation is before a
  control can re-run one.
gui_related: true
gui_classification_reason: The control, its disabled reason and its confirmation copy are what a person sees when a gate has failed for a transient reason.
split_recommended: false
depends_on: [FGI-005, ADO-004]
unblocks: []
acceptance_criteria:
  - The requeue command is disabled with a typed reason, never hidden, where the provider has no equivalent.
  - A requeue that the provider would accept but not act on is refused with a typed reason rather than reported as success.
  - A requeue that cancels a build already running discloses the cancellation and names the policy in the confirmation before dispatch.
  - No command, handler, event, or runtime behaviour is admitted, and no WorkNodes, NodeSeeds or build tasks are created by this record.
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: silent_no_op_or_undisclosed_build_cancellation
reasoning_tier: high
context_scope: forge_policy_evaluation_requeue
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Forge_Integrations.md
node_compile_hint:
  mode: owner_product_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260918-001-azure-devops-corrections:q-006
  - Plans/Decision_Log.md:DL-064-direction-2026-09-18
  - Plans/Forge_Integrations.md#FGI-019
preserved_exact_tokens:
  - agree
  - requeue
  - build policy
  - typed reason
negative_constraints:
  - Do not hide the control where the provider has no equivalent.
  - Do not report a requeue that does nothing as success.
  - Do not cancel a running build without disclosing it in the confirmation first.
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Forge_Integrations.md
```

### DL-065 - A Provider Neutral Vote And Reviewer Carrier Bound The Way DL-060 Binds

```yaml
plan_unit_id: DL-065
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared answered the seventh Azure DevOps decision card on 2026-09-18 by taking the recommendation, verbatim
  "agree". A provider-neutral vote and reviewer carrier is planned in the common forge contracts. It holds the
  reviewer identity, the vote value from one closed vocabulary, whether that reviewer is required, and the
  revision the vote is bound to together with how that binding was established. The binding rule is DL-060's: a
  provider-asserted binding where the provider supplies one, and an observation-time binding labelled as
  observed by Puppet Master where it does not. A vote with neither binding is not shown as current evidence. The
  carrier is what lets the Azure owner's two vote acceptance criteria be restated as promises a shape can keep,
  rather than removed.
gui_related: true
gui_classification_reason: Reviewer state, the vote value and the required marker are what a review view shows about who has approved what.
split_recommended: false
depends_on: [FGI-004, DL-060]
unblocks: []
acceptance_criteria:
  - The carrier holds reviewer identity, a vote value from one closed vocabulary, a required-reviewer flag, the bound revision and the binding kind.
  - The binding kind is provider-asserted or observed by Puppet Master, following DL-060, and a vote with neither is not shown as current evidence.
  - The carrier is provider-neutral and is exercised by a fixture for more than one provider before it is claimed as common.
  - No command, handler, event, or runtime behaviour is admitted, and no WorkNodes, NodeSeeds or build tasks are created by this record.
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: unbindable_vote_promise
reasoning_tier: high
context_scope: forge_vote_and_reviewer_carrier
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Forge_Integrations.md
  - Plans/Azure_DevOps_Integration.md
node_compile_hint:
  mode: owner_product_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260918-001-azure-devops-corrections:q-007
  - Plans/Decision_Log.md:DL-065-direction-2026-09-18
  - Plans/Decision_Log.md#DL-060
  - Plans/Forge_Integrations.md#FGI-020
preserved_exact_tokens:
  - agree
  - vote value
  - required reviewer
  - observed by Puppet Master
negative_constraints:
  - Do not add a vote carrier that only one provider can populate.
  - Do not show a vote with no binding of either kind as current evidence.
  - Do not restore the Azure vote criteria before the carrier exists.
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Forge_Integrations.md
  - Plans/Azure_DevOps_Integration.md
```

### DL-066 - Plan Seal Acceptance Is Bounded By One Review And One Repair Round

```yaml
plan_unit_id: DL-066
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared decided on 2026-09-17 that acceptance of a plan seal is bounded. A seal is accepted when
  the deterministic checks pass, one scoped review has run, one bounded repair round has addressed
  that review's blocking findings with a further seal, and a re-review limited to the rows the
  repair affected finds no blocking finding. The scoped review reads the rows the work under review
  touched together with the canon needed to judge them, not the whole document. The repair round is
  one round: it works from the findings that review produced, and a finding raised later belongs to
  a later review. The affected-rows re-review checks that the repair repaired what it claimed and
  broke nothing beside it; it is not a fresh reading of the plan. Findings that remain after that
  point are recorded as open questions on the plan, each carrying its severity and its citations,
  and they do not block acceptance unless a later review raises one of them to blocking. Acceptance
  never requires a review that returns no findings, never proceeds on a review whose blocking
  findings were not repaired and re-reviewed, and never omits a remaining finding from the plan.
gui_related: false
gui_classification_reason: Seal acceptance and review bounding are planning governance timing, not GUI behavior.
split_recommended: false
depends_on: [PWIZ-006, PWIZ-011, PWIZ-028]
unblocks: []
acceptance_criteria:
  - PWIZ-028 states the four acceptance conditions in order, the open-question disposition for remaining findings, and the escalation path by which a later review may raise an open question to blocking.
  - PWIZ-006 and PWIZ-011 carry the bound, so no reader of the topic audit loop or the final audit loop can read either as repairing and re-reviewing until a review returns no findings.
  - The bootstrap seal and audit prose in Plans/bootstrap/Bootstrap_Planning_Workflow.md states the same bound and the same open-question disposition.
  - A seal whose review raised blocking findings is not accepted until those findings were repaired in one bounded round, sealed again, and re-reviewed over the affected rows.
  - Every finding remaining at acceptance appears on the plan as an open question with its severity and citations.
  - No command, handler, event, or runtime behaviour is admitted, and no WorkNodes, NodeSeeds, executable queues, or build tasks are created by this record.
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
  - Manual review of Plans/Planning_Wizard.md PWIZ-006, PWIZ-011, and PWIZ-028 against this record.
risk_class: unbounded_review_loop_or_suppressed_finding
reasoning_tier: high
context_scope: repo_governance
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Planning_Wizard.md
  - Plans/bootstrap/Bootstrap_Planning_Workflow.md
node_compile_hint:
  mode: seal_acceptance_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/Decision_Log.md:DL-066-direction-2026-09-17
  - Plans/Planning_Wizard.md#PWIZ-006
  - Plans/Planning_Wizard.md#PWIZ-011
  - Plans/Planning_Wizard.md#PWIZ-028
preserved_exact_tokens:
  - deterministic checks
  - scoped review
  - bounded repair round
  - affected rows
  - open questions
  - blocking finding
negative_constraints:
  - Do not accept a seal on a review whose blocking findings were not repaired and re-reviewed.
  - Do not withhold a recorded open question from the plan.
  - Do not require a review that returns no findings before a seal may be accepted.
  - Do not widen the affected-rows re-review into a fresh review of the whole plan.
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Planning_Wizard.md
```

### DL-067 - Landing Checks Report Only Failures New Since A Recorded Baseline

```yaml
plan_unit_id: DL-067
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared decided on 2026-09-17 that the three read-only repository-wide checks at landing report
  only what is new or what is on the branch. Each run still executes run_gates, audit_governance
  and migration_validate in full. Every failure becomes a stable key of check, sub-check, error
  kind, path, and a digest of the failure's remaining fields once timestamps, hash values, the
  absolute path of the checkout it ran in, and the measured actual and expected values are removed.
  A landing run reports two sets and nothing else: failures whose key is not in the recorded
  baseline or whose check's failure count rose above the baseline count, and failures that name a
  path the branch changed whether or not they are new. Because run_gates prints only fifty failures
  per sub-check and audit_governance only a hundred while reporting the true total, per-sub-check
  totals are compared as well, and a rise in a truncated sub-check is reported and stops the
  landing, since what was added cannot be matched against the branch's paths. The check runs after
  the fast-forward and the shard check and before main is pushed, because the branch is measured by
  its diff against main and that diff is empty once main is pushed. Outcomes are graded: nothing to
  report; nothing that stops the landing, being governance staleness on files the branch edited or
  new failures naming none of the branch's files, which are pushed and reported; something that
  stops the landing, being a non-staleness failure on the branch's own files, a grown bucket whose
  error kind is not staleness, or a rise in a truncated sub-check; and failing to run at all, which
  is not success. The baseline is a full run against main recorded in a full checkout and committed
  with the commit it was taken at, refreshed on a nightly run beside the migration snapshot by the
  designated Plans agent whether or not anything landed, and never refreshed to make a landing pass.
  The measured basis is two landings of 2026-09-17 that took fourteen minutes twelve seconds and
  fifteen minutes sixteen seconds and produced identical failure sets of twenty-five failing
  sub-checks and two hundred twenty-eight failures, none of which belonged to either branch. The
  command, its baseline file and the landing-procedure text are carried by the branch that
  implements this decision, which owns scripts/pm-landing-check.py and
  reports/landing-checks/baseline.json.
gui_related: false
gui_classification_reason: Landing check reporting and baseline placement are repository governance procedure, not GUI behavior.
split_recommended: false
depends_on: [BPM-009, DL-055]
unblocks: []
acceptance_criteria:
  - BPM-009 states the two reported sets, the stable failure key, the per-sub-check total comparison, the nightly baseline refresh, and the graded outcomes.
  - The landing procedure invokes scripts/pm-landing-check.py against the branch's base rather than the three commands separately, and runs before main is pushed.
  - The recorded baseline lives at reports/landing-checks/baseline.json, taken from a full run against main in a full checkout and committed with the commit it was taken at.
  - A rise in a sub-check whose failures are truncated is reported and stops the landing, because the on-branch match cannot see what was added.
  - The stale-hash carve-out survives the change and still applies to anything the comparison surfaces on the branch's own documents.
  - All three checks still run in full at landing, so the change alters what is read and not what is checked.
  - The nightly run refreshes the baseline against main independently of whether anything landed.
  - No command, handler, event, or runtime behaviour is admitted, and no WorkNodes, NodeSeeds, executable queues, or build tasks are created by this record.
validation_surfaces:
  - python3 scripts/pm-landing-check.py --base origin/main
  - python3 scripts/pm-landing-check.py --record-baseline
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - Manual AGENTS.md and .claude/CLAUDE.md landing-procedure review.
risk_class: landing_signal_lost_in_preexisting_failures
reasoning_tier: standard
context_scope: repo_governance
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Bootstrap_Planning_Migration.md
node_compile_hint:
  mode: landing_baseline_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/Decision_Log.md:DL-067-direction-2026-09-17
  - Plans/Decision_Log.md#DL-055
  - Plans/Bootstrap_Planning_Migration.md#BPM-009
preserved_exact_tokens:
  - run_gates
  - audit_governance
  - migration_validate
  - reports/landing-checks/baseline.json
  - scripts/pm-landing-check.py
negative_constraints:
  - Do not narrow, skip or shorten any of the three checks in order to make a landing faster; only the reporting changes.
  - Do not stop a landing on a failure that is already in the baseline and whose count has not risen.
  - Do not treat an empty or missing baseline as an empty failure set.
  - Do not refresh the baseline to make a landing pass.
  - Do not let the nightly baseline refresh lapse and then read a stale baseline as current.
  - Do not run the landing check after main is pushed, when the branch diff it measures is already empty.
  - Do not repair or commit another thread's files to make a check pass at landing.
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Bootstrap_Planning_Migration.md
```

### DL-068 - Quarantine Cleanup Keeps Only The Existing Audit Trail

```yaml
plan_unit_id: DL-068
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared answered Approve (option A) on 2026-09-23: after eligible quarantine cleanup,
  keep only the existing audit trail. Raw content is removed when the item is resolved,
  its Q policy permits cleanup and every hold and dependency allows it; the custody
  manifest, operation journal and operational quarantine index keep custody until the
  actual authorized purge, its purged event and first AppendReceipt settle and every
  real dependency is released, then retire. The existing indefinite audit event,
  original shared receipt and identity/dedupe custody keep their own policies, and a
  later audit reports Source evidence unavailable.
gui_related: false
gui_classification_reason: Defines quarantine record disposal and audit evidence, not visual presentation.
split_recommended: false
depends_on: [DL-039, DL-045]
unblocks: []
acceptance_criteria:
  - storage-plan Case L-3 states the operational-index disposal boundary with a DL-068 citation.
  - Raw content removal waits for resolution, Q-policy eligibility and every hold and dependency.
  - Manifest, journal and operational index retire only after the actual purge, its event and first AppendReceipt settle and every real dependency is released.
  - The existing audit event, shared receipt and identity/dedupe custody keep their own policies; no new quarantine audit record is created.
validation_surfaces:
  - reports/event-authority-20260911/decision-responses.jsonl
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: quarantine_disposal_boundary_drift
reasoning_tier: high
context_scope: quarantine_cleanup_remainder
implementation_surfaces:
  - Plans/storage-plan.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - /mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/decision-card-answers-20260923/ANSWERS.md
  - reports/event-authority-20260911/step-08-quarantine-cleanup-card.md
preserved_exact_tokens:
  - "Approve"
  - "Source evidence unavailable"
  - "AppendReceipt"
negative_constraints:
  - Do not treat this as purge authority or change any TTL, anchor, cap, overflow, hold, eligibility or lifecycle edge.
  - Do not delete a live, unresolved or still-needed quarantine index.
  - Do not create a new quarantine audit record or event family.
owner_hints:
  - Plans/storage-plan.md
```

### DL-069 - SafePoint Summary Retention Clock Starts At First Durable Publication

```yaml
plan_unit_id: DL-069
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared answered Approve (option 1) on EA-S8-SAFEPOINT-SUMMARY-CLOCK-001 on 2026-09-23:
  the retained SafePoint hash summary is kept for 365 days after its first successful
  durable publication. Preparation, retries, recovery and re-observation never start or
  reset that anchor; existing holds and dependencies still override age eligibility;
  the 90-day full-SafePoint minimum is unchanged.
gui_related: false
gui_classification_reason: Defines a retention anchor, not visual presentation.
split_recommended: false
depends_on: [DL-045]
unblocks: []
acceptance_criteria:
  - The storage-plan retention table and anchor rule name the first durable publication anchor with a DL-069 citation.
  - Retries and recovery never reset the anchor; holds still block cleanup.
  - The 90-day full-SafePoint minimum and existing policy objects are unchanged.
validation_surfaces:
  - reports/event-authority-20260911/decision-responses.jsonl
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: safepoint_summary_retention_anchor_drift
reasoning_tier: high
context_scope: safepoint_summary_clock
implementation_surfaces:
  - Plans/storage-plan.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - /mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/decision-card-answers-20260923/ANSWERS.md
  - reports/event-authority-20260911/step-08-safe-point-summary-clock-card.md
preserved_exact_tokens:
  - "EA-S8-SAFEPOINT-SUMMARY-CLOCK-001"
  - "365 days"
  - "first successful durable publication"
negative_constraints:
  - Do not anchor the summary clock on hold release or reset it on retry or recovery.
  - Do not admit an event or physical family from this decision.
owner_hints:
  - Plans/storage-plan.md
```

### DL-070 - Moving The Last Terminal Workgroup Leaves The Old Section Empty

```yaml
plan_unit_id: DL-070
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared answered Approve (option 1) on EA-S8-TERMINAL-MOVE-SOURCE-001 on 2026-09-23:
  after the last workgroup moves out, the old terminal section stays empty and reusable
  with its guidance state. The move creates no replacement workgroup and opens no new
  terminal session; creating one there is a separate action. The FinalGUISpec
  2026-08-13 move reseed is retired, and source_reseeded is retired as of 2026-09-24,
  when FinalGUISpec's DL-070 follow-up amendment landed on main (566970cb7b).
  Reset and boot recovery reconstitution are unchanged and gain no creation authority.
gui_related: true
gui_classification_reason: Defines the user-visible terminal section state after a workgroup move.
split_recommended: false
depends_on: [DL-039, DL-045, SMPFS-138]
unblocks: []
acceptance_criteria:
  - SMPFS-138 states that the move does not reseed the vacated section, with a DL-070 citation.
  - FinalGUISpec carries a dated DL-070 amendment retiring the move reseed; reset text is unchanged.
  - The GUI rebuild checklist and plans index note the retirement.
  - The source_reseeded field was retired on 2026-09-24 by FinalGUISpec's DL-070 follow-up amendment, which landed on main (566970cb7b); aligning the PM7 concept's move behavior remains an open follow-up for its owner.
validation_surfaces:
  - reports/event-authority-20260911/decision-responses.jsonl
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: terminal_move_empty_section_drift
reasoning_tier: high
context_scope: terminal_move_vacated_section
implementation_surfaces:
  - Plans/Section15_MVP_Promoted_Features_Spec.md
  - Plans/FinalGUISpec.md
  - Plans/GUI_Rebuild_Requirements_Checklist.md
  - Plans/00-plans-index.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - /mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/decision-card-answers-20260923/ANSWERS.md
  - reports/event-authority-20260911/step-08-terminal-move-source-card-20260921.md
preserved_exact_tokens:
  - "EA-S8-TERMINAL-MOVE-SOURCE-001"
  - "source_reseeded"
negative_constraints:
  - Do not reseed a vacated section or start a new terminal session as part of a move.
  - Do not grant reset or recovery new creation authority from this answer.
owner_hints:
  - Plans/Section15_MVP_Promoted_Features_Spec.md
  - Plans/FinalGUISpec.md
  - Plans/GUI_Rebuild_Requirements_Checklist.md
  - Plans/00-plans-index.md
```

### DL-071 - Account Switch History Uses The Existing Switch Record

```yaml
plan_unit_id: DL-071
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared answered Approve on EA-S08C-ACCOUNT on 2026-09-23: current feature summaries
  use the existing durable account_switch_event record and the separate
  account.switched event-name requirement is retired as summary vocabulary, with no
  migration alias and no second history stream.
gui_related: false
gui_classification_reason: Corrects runtime history vocabulary in summaries, not visual presentation.
split_recommended: false
depends_on: [DL-039]
unblocks: []
acceptance_criteria:
  - feature-list and Run_Graph_View summaries name account_switch_event and retire account.switched with a DL-071 citation.
  - No alias, migration or second history stream is created.
validation_surfaces:
  - reports/event-authority-20260911/decision-responses.jsonl
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: account_switch_vocabulary_drift
reasoning_tier: high
context_scope: account_switch_history_name
implementation_surfaces:
  - Plans/feature-list.md
  - Plans/Run_Graph_View.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - /mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/decision-card-answers-20260923/ANSWERS.md
  - reports/event-authority-20260911/step-08-ambiguous-cards.md
preserved_exact_tokens:
  - "EA-S08C-ACCOUNT"
  - "account_switch_event"
  - "account.switched"
negative_constraints:
  - Do not create an account.switched alias or a second switch-history stream.
  - Do not normalize historical bytes without separate evidence.
owner_hints:
  - Plans/feature-list.md
  - Plans/Run_Graph_View.md
```

### DL-072 - Continuation Suppression Diagnostic Stays Transient

```yaml
plan_unit_id: DL-072
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared answered Approve on EA-S08C-CONTINUE on 2026-09-23:
  diag.synthetic_continue_loop_prevented remains a transient diagnostic, not a
  persisted EventRecord family. The visible suppression reason and existing failure or
  rotation handling are preserved; a replayable history would need its own full event
  contract.
gui_related: false
gui_classification_reason: Sets an event persistence boundary, not visual presentation.
split_recommended: false
depends_on: [DL-039]
unblocks: []
acceptance_criteria:
  - Prompt_Pipeline loop-prevention rules state the transient boundary with a DL-072 citation.
validation_surfaces:
  - reports/event-authority-20260911/decision-responses.jsonl
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: diagnostic_persistence_boundary_drift
reasoning_tier: high
context_scope: continue_suppression_diagnostic
implementation_surfaces:
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - /mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/decision-card-answers-20260923/ANSWERS.md
  - reports/event-authority-20260911/step-08-ambiguous-cards.md
preserved_exact_tokens:
  - "EA-S08C-CONTINUE"
  - "diag.synthetic_continue_loop_prevented"
negative_constraints:
  - Do not persist this diagnostic as an EventRecord family without a full event contract.
owner_hints:
  - Plans/Prompt_Pipeline.md
```

### DL-073 - Doctor Media Check Result Stays Check Output

```yaml
plan_unit_id: DL-073
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared answered Approve on EA-S08C-DOCTOR on 2026-09-23: doctor.evidence_media.checked
  remains check output associated with its evidence artifacts, not a separately
  persisted EventRecord family. Existing artifact retention is unchanged.
gui_related: false
gui_classification_reason: Sets an event persistence boundary, not visual presentation.
split_recommended: false
depends_on: [DL-039]
unblocks: []
acceptance_criteria:
  - newtools Doctor evidence-media output step states the check-output boundary with a DL-073 citation.
validation_surfaces:
  - reports/event-authority-20260911/decision-responses.jsonl
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: diagnostic_persistence_boundary_drift
reasoning_tier: high
context_scope: doctor_media_check_output
implementation_surfaces:
  - Plans/newtools.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - /mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/decision-card-answers-20260923/ANSWERS.md
  - reports/event-authority-20260911/step-08-ambiguous-cards.md
preserved_exact_tokens:
  - "EA-S08C-DOCTOR"
  - "doctor.evidence_media.checked"
negative_constraints:
  - Do not persist this check result as an EventRecord family or infer a new retention duration.
owner_hints:
  - Plans/newtools.md
```

### DL-074 - Task Failure Is A Presentation Notification Over Child Run History

```yaml
plan_unit_id: DL-074
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared answered Approve (option A) on EA-S09-EXEC-TASK-FAILURE on 2026-09-23:
  task.failed is a presentation notification over canonical child-run records, not a
  separately persisted EventRecord family and not an alias of subagent.failed. Visible
  error detail, canonical child lifecycle, parent-owned retries, timeout distinctions
  and audit attribution are preserved.
gui_related: false
gui_classification_reason: Sets an event persistence boundary; chat card presentation is unchanged.
split_recommended: false
depends_on: [DL-039]
unblocks: []
acceptance_criteria:
  - assistant-chat-design states the non-persisted notification rule with a DL-074 citation.
  - Canonical child-run history and visible error detail are preserved.
validation_surfaces:
  - reports/event-authority-20260911/decision-responses.jsonl
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: task_failure_persistence_boundary_drift
reasoning_tier: high
context_scope: task_failure_notification
implementation_surfaces:
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - /mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/decision-card-answers-20260923/ANSWERS.md
  - reports/event-authority-20260911/step-09-execution-cards.md
preserved_exact_tokens:
  - "EA-S09-EXEC-TASK-FAILURE"
  - "task.failed"
  - "subagent.failed"
negative_constraints:
  - Do not alias task.failed to subagent.failed.
  - Do not delete child-run history or change any registered family.
owner_hints:
  - Plans/assistant-chat-design.md
```

### DL-075 - Runtime Artifact Event Histories Are Kept Indefinitely

```yaml
plan_unit_id: DL-075
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared answered Approve (option A) on EA-S09-EXEC-RUNTIME-ARTIFACT-RETENTION on
  2026-09-23: the 19 runtime_artifact.* event histories are assigned
  RP-AUTHORITY-INDEFINITE for the time their full contracts are admitted. This is
  retention only: no family is registered, no binding defined, no schema made complete.
  Embedded event text is retained with the event, and each full contract must make that
  and any applicable deletion requirement explicit before admission. Artifact bodies,
  original receipts, restore points, Usage and source records keep their own policies.
gui_related: false
gui_classification_reason: Assigns event retention, not visual presentation.
split_recommended: false
depends_on: [DL-039, DL-045]
unblocks: []
acceptance_criteria:
  - Runtime_Artifacts_Panel and storage-plan Case L-3 record the RP-AUTHORITY-INDEFINITE assignment for the 19 families with a DL-075 citation.
  - No family is admitted and no binding, schema completion or runtime authority follows.
  - Each full contract makes embedded-text retention and applicable deletion requirements explicit before admission.
validation_surfaces:
  - reports/event-authority-20260911/decision-responses.jsonl
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: runtime_artifact_retention_assignment_drift
reasoning_tier: high
context_scope: runtime_artifact_event_retention
implementation_surfaces:
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - /mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/decision-card-answers-20260923/ANSWERS.md
  - reports/event-authority-20260911/step-09-runtime-artifact-retention-card.md
preserved_exact_tokens:
  - "EA-S09-EXEC-RUNTIME-ARTIFACT-RETENTION"
  - "RP-AUTHORITY-INDEFINITE"
  - "runtime_artifact.*"
negative_constraints:
  - Do not treat the retention assignment as admission, binding or schema completion.
  - Do not let event retention grant access to a linked artifact body or override an applicable deletion requirement.
owner_hints:
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/storage-plan.md
```

### DL-076 - Storage Wrapper Digest Recipe And Durable Read Token Without Snapshot Id

```yaml
plan_unit_id: DL-076
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared, by delegation to the coordinator, decided two Storage owner questions on
  2026-09-24. Each whole_wrapper_sha256 in the SP-310 physical profile declaration is
  the SHA-256 of the resolved wrapper definition written as two-space indented JSON
  with keys in document order and one final LF; SP-310 states the recipe and readiness
  checks it. A stored SP-278 read token is the nine-field durable token
  (DurableGenericToken) without redb_snapshot_id. The four filtered checkpoints that
  stored the whole token store the durable token, every read joins the snapshot id of
  its own live read, and SP-311's never-persist rule stays whole.
gui_related: false
gui_classification_reason: Decides Storage digest and persisted-token rules, not visual presentation.
split_recommended: false
depends_on: [DL-045, DL-046]
unblocks: []
acceptance_criteria:
  - SP-310 states the whole_wrapper_sha256 recipe with a DL-076 citation, and readiness rejects a member whose declared digest differs from the recomputed one.
  - SP-278 defines the nine-field durable read token; SP-282, SP-270, SP-273 and SP-275 store it, and no stored value holds redb_snapshot_id.
  - Readiness rejects any redb_snapshot_id property that a stored value could hold, with positive and negative self-tests.
  - Plans/event_record_index_checkpoint.schema.json, the frozen Home2 reader schema and SP-311's text are unchanged.
validation_surfaces:
  - python3 scripts/pm-implementation-readiness.py validate
  - python3 -m unittest tests.test_pm_runtime_vocabulary_migration tests.test_pm_browser_workspace_reset
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: storage_digest_recipe_or_persisted_live_fence_drift
reasoning_tier: high
context_scope: storage_owner_closeout_20260924
implementation_surfaces:
  - Plans/storage-plan.md
  - Plans/storage_value_registry.json
  - scripts/pm-implementation-readiness.py
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - reports/storage-registry-repairs-20260923/REPORT.md
  - reports/storage-owner-closeout-20260924/REPORT.md
  - reports/event-authority-20260911/step-08-goal-workflow-coordinator-checks.json
preserved_exact_tokens:
  - "whole_wrapper_sha256"
  - "redb_snapshot_id"
  - "DurableGenericToken"
negative_constraints:
  - Do not persist or manufacture a redb snapshot id in any stored value.
  - Do not change Plans/event_record_index_checkpoint.schema.json or the frozen Home2 reader schema for this decision.
  - Do not treat the wrapper digest as a stored-value hash or as the pm.goal.cancel_command_json.v1 codec.
owner_hints:
  - Plans/storage-plan.md
```

### DL-077 - Seal Check Accepts Post-August Families Only Through Complete Admission Records

```yaml
plan_unit_id: DL-077
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared answered Approve (option A) on 2026-09-24 to EA-S10-VALIDATOR-LIVE-SET-001
  item 1: the frozen independent Event Authority seal check, which fails every family
  registered after August with unexpected_august_set, receives exactly one more
  receipted amendment, in the style of DL-039's holding-bucket change. It keeps every
  existing rule and accepts a family registered beyond the original 37 and the two
  August families only with a complete admission record, namely Jared's decision entry
  for that family, the registry revision and SHA-256 before and after, and a current
  depth assessment with all twelve criteria passing. It fails closed otherwise. The agent
  that writes and lands the amendment must not apply the seal. DL-039's seal condition
  now reads as passing with the holding-bucket change and this amendment and no other
  modification.
gui_related: false
gui_classification_reason: Defines seal-check and event admission governance, not visual presentation.
split_recommended: false
depends_on: [DL-039, DL-045, DL-046]
unblocks: []
acceptance_criteria:
  - The independent seal check keeps every existing rule and accepts a post-August registered family only with a complete admission record; a missing, malformed or mismatched record, or any depth criterion not passing, fails closed.
  - The amendment lands with a written receipt after a blind review, and its receipt names the author and lander as barred from applying the seal.
  - Admission records in the new form exist for context.compaction.completed, browser.workspace.created and browser.workspace.reset, each carrying its current depth assessment; the check fails closed for any of them whose assessment does not show all twelve criteria passing.
  - No registry row, family admission, freeze digest, closure hash, certification or seal follows from this decision.
validation_surfaces:
  - reports/event-authority-20260911/decision-responses.jsonl
  - python3 Plans/.audits/event-authority-2026-08-12/independent-validator/pm_event_authority_independent_validator.py
  - python3 -m unittest tests.test_event_authority_holding_bucket
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: event_authority_seal_check_drift
reasoning_tier: high
context_scope: event_authority_seal_check_post_august
implementation_surfaces:
  - Plans/.audits/event-authority-2026-08-12/independent-validator/pm_event_authority_independent_validator.py
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - /mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/decision-card-answers-20260924/ANSWERS_SEAL_CHECK.md
  - reports/event-authority-20260911/step-10-validator-live-set-card-20260924.md
preserved_exact_tokens:
  - "Approve"
  - "unexpected_august_set"
  - "EA-S10-VALIDATOR-LIVE-SET-001"
negative_constraints:
  - Do not edit the seal check beyond this one receipted amendment and the DL-039 holding-bucket change.
  - Do not accept a post-August family without a complete admission record, and do not mark any criterion passing that the current depth assessment does not show passing.
  - The author and lander of the amendment must not apply the seal.
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Plan_To_Node_Compilation.md
```

### DL-078 - Step 9 Registration Moves The Approved Checkpoint Under A Standing Rule

```yaml
plan_unit_id: DL-078
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared answered Approve (option 2) on 2026-09-24 to EA-S10-VALIDATOR-LIVE-SET-001
  item 2: a family registration that passes the full Step 9 procedure, meaning its
  full Event Authority contract, a blind form-driven review, its own Storage admission
  landing with one family per landing and the coordinator's landing go, moves the
  approved PNC-019 checkpoint in that same landing. The checkpoint constants in
  scripts/pm_pnc019_currentness.py, their provenance comment and the two test pins
  move with it, and a Decision Log entry records the new revision under this rule;
  following the Step 4 and Step 8 precedent, the landing also regenerates the derived plan
  index (its readiness projection only; the implementation-readiness gate report is left to
  the reseal by the designated Plans agent) and the entry records the registry SHA-256. The Decision Log entry
  each such landing adds names the family and is the decision entry its DL-077 admission
  record cites. Any other registry change, or a registration that skips part of the
  procedure, still needs Jared's own approval. Jared can revoke the rule at any time.
gui_related: false
gui_classification_reason: Defines checkpoint approval governance for event registration, not visual presentation.
split_recommended: false
depends_on: [DL-039, DL-045, DL-046]
unblocks: []
acceptance_criteria:
  - A registration landing under this rule moves EVENT_FAMILY_REGISTRY_REVISION, EVENT_FAMILY_REGISTRY_KERNEL_ROW_COUNT and their provenance comment, the test pins in tests/test_pm_testing_session_events.py and tests/test_pm_github_project_integration.py, and the derived plan index in the same landing, leaving the implementation-readiness gate report to the reseal by the designated Plans agent.
  - Each such landing adds a Decision Log entry naming the new registry revision and SHA-256 and citing DL-078.
  - A registry change that is not a Step 9 registration passing the full procedure still needs Jared's own checkpoint approval.
  - The Step 9 procedure record states the rule.
validation_surfaces:
  - reports/event-authority-20260911/decision-responses.jsonl
  - python3 -m unittest tests.test_pm_pnc019_currentness
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: event_authority_checkpoint_approval_drift
reasoning_tier: high
context_scope: event_authority_step09_checkpoint_rule
implementation_surfaces:
  - scripts/pm_pnc019_currentness.py
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - /mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/decision-card-answers-20260924/ANSWERS_SEAL_CHECK.md
  - reports/event-authority-20260911/step-10-validator-live-set-card-20260924.md
  - reports/event-authority-20260911/step-09-procedure-20260924.md
preserved_exact_tokens:
  - "Approve"
  - "EVENT_FAMILY_REGISTRY_REVISION"
  - "EVENT_FAMILY_REGISTRY_KERNEL_ROW_COUNT"
negative_constraints:
  - Do not move the checkpoint for a registry change that is not a Step 9 registration passing the full procedure.
  - Do not use this rule to lower any Step 9 requirement or to register more than one family per landing.
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Plan_To_Node_Compilation.md
```

### DL-079 - Old Goal Record Events Become Read-Only History

```yaml
plan_unit_id: DL-079
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared answered Approve (option 1) on 2026-09-24 to EA-S08D-GOAL-RECORD-EVENTS-001:
  goal.evidence_captured, goal.receipt_recorded and goal.tool_check_recorded become
  read-only history in the pattern of the four Goal events retired on 2026-09-12
  (GRS-069 to GRS-072 with the readers SP-300 to SP-303). Each gets its own
  current-writer prohibition and an assigned historical reader, and keeps its registry
  membership, original schema and retention assignment. The Goal Runtime owner, with
  Storage, writes those contracts; until they land the three families stay
  undispositioned in the Step 8 depth assessment. No registry row changes and nothing
  is registered, admitted or removed.
gui_related: false
gui_classification_reason: Decides event family disposition, not visual presentation.
split_recommended: false
depends_on: [DL-039, DL-045]
unblocks: []
acceptance_criteria:
  - Goal Runtime and Storage owner text gives each of goal.evidence_captured, goal.receipt_recorded and goal.tool_check_recorded its own current-writer prohibition and an assigned historical reader, in the pattern of GRS-069 to GRS-072 and SP-300 to SP-303.
  - The registry membership, original schemas and retention assignments of the three families are preserved, and no current writer emits them.
  - Until those owner contracts land, the Step 8 depth assessment keeps the three families undispositioned.
validation_surfaces:
  - reports/event-authority-20260911/decision-responses.jsonl
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: goal_record_event_disposition_drift
reasoning_tier: high
context_scope: goal_record_events_read_only_history
implementation_surfaces:
  - Plans/Goal_Runtime_System.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - /mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/decision-card-answers-20260924/ANSWERS_DEPTH_GRADING.md
  - reports/event-authority-20260911/step-08-depth42-product-cards-20260924.md
  - reports/event-authority-20260911/step-08-depth42-card-answers-20260924.md
preserved_exact_tokens:
  - "Approve"
  - "EA-S08D-GOAL-RECORD-EVENTS-001"
  - "goal.evidence_captured"
  - "goal.receipt_recorded"
  - "goal.tool_check_recorded"
negative_constraints:
  - Do not let any current writer emit the three families once their historical contracts land.
  - Do not remove the three families from the registry or drop their original schemas or retention assignments.
owner_hints:
  - Plans/Goal_Runtime_System.md
  - Plans/storage-plan.md
```

### DL-080 - Workflow Runs Get Current Blocked Replanned And Stopped Events

```yaml
plan_unit_id: DL-080
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared answered Approve (option 1) on 2026-09-24 to EA-S08D-GOALRUN-LIFECYCLE-EVENTS-001:
  goal_run.blocked, goal_run.replanned and goal_run.stopped become current events.
  The Workflow run lifecycle owner, Orchestrator and Executor with Goal Runtime and
  Storage, writes a full current Event Authority contract for each, goal_run.stopped
  and goal_run.blocked first and goal_run.replanned after the Workflow Replan source
  work, the external pm.executor.workflow_source.all_writers.v8 package, which this
  answer makes needed without scheduling it. Each contract names its writer and extends
  the mandatory GRS-085 run-history projection to its rows. Until they land the three
  families stay undispositioned in the Step 8 depth assessment. No registry row,
  command, wiring or resume rule changes and nothing is registered or admitted.
gui_related: false
gui_classification_reason: Decides event family disposition and contract order, not visual presentation.
split_recommended: false
depends_on: [DL-039, DL-045]
unblocks: []
acceptance_criteria:
  - Full current Event Authority contracts for goal_run.stopped and goal_run.blocked land before the contract for goal_run.replanned, each with a named writer and its rows carried by the mandatory GRS-085 run-history projection.
  - The goal_run.replanned contract follows the Workflow Replan source work in pm.executor.workflow_source.all_writers.v8.
  - The Pause and Abort Run wiring and the resume rule keep expecting these events.
  - Until the contracts land, the Step 8 depth assessment keeps the three families undispositioned.
validation_surfaces:
  - reports/event-authority-20260911/decision-responses.jsonl
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: goal_run_lifecycle_event_disposition_drift
reasoning_tier: high
context_scope: goal_run_lifecycle_current_events
implementation_surfaces:
  - Plans/Goal_Runtime_System.md
  - Plans/Orchestrator_Page.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - /mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/decision-card-answers-20260924/ANSWERS_DEPTH_GRADING.md
  - reports/event-authority-20260911/step-08-depth42-product-cards-20260924.md
  - reports/event-authority-20260911/step-08-depth42-card-answers-20260924.md
preserved_exact_tokens:
  - "Approve"
  - "EA-S08D-GOALRUN-LIFECYCLE-EVENTS-001"
  - "goal_run.blocked"
  - "goal_run.replanned"
  - "goal_run.stopped"
  - "pm.executor.workflow_source.all_writers.v8"
negative_constraints:
  - Do not retire the three families or rewrite the Pause, Abort Run or resume wiring to stop expecting them.
  - Do not write the goal_run.replanned contract ahead of the Workflow Replan source work, and do not treat this answer as scheduling that work.
owner_hints:
  - Plans/Goal_Runtime_System.md
  - Plans/Orchestrator_Page.md
  - Plans/storage-plan.md
```

### DL-081 - Workflow Runs May Finish With An Approved Verification Exception

```yaml
plan_unit_id: DL-081
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared answered Approve (option 1) on 2026-09-24 to EA-S08D-VERIFICATION-EXCEPTION-001:
  the verification exception route stays. The user who owns the project approves each
  exception through the existing human-in-the-loop approval flow, naming the specific
  residual risks, and the run finishes labelled completed_with_approved_verification_exception
  (the D-R18 branch certified_with_approved_exception that CV-340 preserves), with the
  approver and remaining risks recorded, never as a clean pass. The Goal Runtime and
  Workflow certification owners, with the Human-in-the-loop owner, write the one route
  contract, covering the approval request, who may approve, which risks may be waived
  and the receipt. Until it lands, GRS-065 keeps the route separately unbound and the
  Standard writer stays limited to clean certification. No certification contract or
  registry row changes and nothing is registered or admitted.
gui_related: false
gui_classification_reason: Decides a run outcome and its approval route; the existing label is unchanged.
split_recommended: false
depends_on: [DL-039, DL-045]
unblocks: []
acceptance_criteria:
  - An exception route contract names the approval request, the approver (the user who owns the project, through the existing human-in-the-loop approval flow), the waivable residual risks and the receipt.
  - A run finished through the route carries the label completed_with_approved_verification_exception with the approver and remaining risks recorded, and is never presented as a clean pass.
  - Until that contract lands, GRS-065 keeps the route separately unbound and the Standard writer stays limited to clean certification.
validation_surfaces:
  - reports/event-authority-20260911/decision-responses.jsonl
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: workflow_verification_exception_route_drift
reasoning_tier: high
context_scope: workflow_certification_exception_route
implementation_surfaces:
  - Plans/Goal_Runtime_System.md
  - Plans/Contracts_V0.md
  - Plans/human-in-the-loop.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - /mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/decision-card-answers-20260924/ANSWERS_DEPTH_GRADING.md
  - reports/event-authority-20260911/step-08-depth42-product-cards-20260924.md
  - reports/event-authority-20260911/step-08-depth42-card-answers-20260924.md
preserved_exact_tokens:
  - "Approve"
  - "EA-S08D-VERIFICATION-EXCEPTION-001"
  - "completed_with_approved_verification_exception"
  - "certified_with_approved_exception"
negative_constraints:
  - Do not present a run finished through an approved exception as a clean pass or certified outcome.
  - Do not let anyone other than the user who owns the project approve an exception, or approve one without naming its residual risks.
owner_hints:
  - Plans/Goal_Runtime_System.md
  - Plans/Contracts_V0.md
  - Plans/human-in-the-loop.md
```

### DL-082 - Platform Capability Catalog Filling Deferred To Build Time

```yaml
plan_unit_id: DL-082
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared gave no answer on 2026-09-24 to EA-S08D-PLATFORM-CATALOG-001 and deferred
  filling the Platform capability catalog to build time. The catalog is filled in right
  before Puppet Master is built, as part of the building process and likely as one of
  the worknodes, because provider capabilities will change before then; worknode work
  has not started. This is not an approval of option 1. Until then
  platform.capability_evaluated stays registered and dormant, with an empty active
  catalog, refused production admission and no Platform event. Filling the catalog is
  a follow-up for whoever owns the worknode work, and each entry added then still needs
  its owner-cited evidence, evaluation contract and tests. No catalog entry, registry
  row, contract or retention assignment changes.
gui_related: false
gui_classification_reason: Defers catalog content, not visual presentation.
split_recommended: false
depends_on: [DL-039, DL-045]
unblocks: []
acceptance_criteria:
  - The active Platform capability catalog stays empty and platform.capability_evaluated stays registered and dormant until entries are added at build time.
  - Filling the catalog is carried as a follow-up for the owner of the worknode work, and each entry added then has owner-cited evidence, an evaluation contract and tests.
  - The deferral is not recorded as an approval of option 1 of EA-S08D-PLATFORM-CATALOG-001.
validation_surfaces:
  - reports/event-authority-20260911/decision-responses.jsonl
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: platform_capability_catalog_deferral_drift
reasoning_tier: high
context_scope: platform_capability_catalog_build_time
implementation_surfaces:
  - Plans/platform_capability_catalog.json
  - Plans/newtools.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - /mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/decision-card-answers-20260924/ANSWERS_DEPTH_GRADING.md
  - reports/event-authority-20260911/step-08-depth42-product-cards-20260924.md
  - reports/event-authority-20260911/step-08-depth42-card-answers-20260924.md
preserved_exact_tokens:
  - "EA-S08D-PLATFORM-CATALOG-001"
  - "platform.capability_evaluated"
negative_constraints:
  - Do not add catalog entries before build time on the strength of this entry, and do not add placeholder entries.
  - Do not read the deferral as an approval of option 1 or as a retirement of platform.capability_evaluated.
owner_hints:
  - Plans/newtools.md
  - Plans/platform_capability_catalog.json
```

### DL-083 - Application-Wide Records Count In One Application Bucket Under RP-OPERATIONAL-2555D

```yaml
plan_unit_id: DL-083
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared answered Approve (option 1) on 2026-09-24 to EA-S08D-OPERATIONAL-CARDINALITY-001:
  under RP-OPERATIONAL-2555D, the records of storage.boot_recovery,
  storage.recovery_applied and storage.compaction_lifecycle_changed are counted in one
  application-wide bucket that takes the place of the project bucket, with the same
  2,000,000-record cap, fail-closed overflow and seven-year period. Project-scoped
  records keep per-project counting. This is the policy-owner decision the SP-291
  adapter seam waits for; the Storage retention owner writes it into its policy text and
  binds the bucket under DL-045, with no new policy object and no other policy value
  changed. Until that owner edit lands, the three retention cells in the Step 8 depth
  assessment stay PARTIAL. The application-scoped evaluations of
  platform.capability_evaluated sit on the same seam, but the card Jared answered named
  only the three Storage families, so this answer does not cover them; that part stays
  open for Jared. Nothing is registered or admitted.
gui_related: false
gui_classification_reason: Decides retention cardinality counting, not visual presentation.
split_recommended: false
depends_on: [DL-039, DL-045]
unblocks: []
acceptance_criteria:
  - Storage owner text counts the application-wide records of storage.boot_recovery, storage.recovery_applied and storage.compaction_lifecycle_changed in one application-wide bucket under RP-OPERATIONAL-2555D with its unchanged cap, overflow and period, and replaces the unproved adapter seam statement with that binding for those three families.
  - No new retention policy object is created and no RP-OPERATIONAL-2555D value changes; project-scoped records keep per-project counting.
  - Until that owner edit lands, the Step 8 depth assessment keeps the three retention cells PARTIAL.
validation_surfaces:
  - reports/event-authority-20260911/decision-responses.jsonl
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: operational_retention_cardinality_scope_drift
reasoning_tier: high
context_scope: operational_retention_application_bucket
implementation_surfaces:
  - Plans/storage-plan.md
  - Plans/storage_value_registry.json
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - /mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/decision-card-answers-20260924/ANSWERS_DEPTH_GRADING.md
  - reports/event-authority-20260911/step-08-depth42-product-cards-20260924.md
  - reports/event-authority-20260911/step-08-depth42-card-answers-20260924.md
preserved_exact_tokens:
  - "Approve"
  - "EA-S08D-OPERATIONAL-CARDINALITY-001"
  - "RP-OPERATIONAL-2555D"
negative_constraints:
  - Do not create a new retention policy or change any RP-OPERATIONAL-2555D value to implement the application-wide bucket.
  - Do not invent a project for application-wide records or change per-project counting for project-scoped records.
  - Do not apply this answer to the application-scoped evaluations of platform.capability_evaluated; they sit on the same seam, but that part stays open for Jared.
owner_hints:
  - Plans/storage-plan.md
  - Plans/storage_value_registry.json
```

### DL-084 - Subagent Child-Run History Is Kept As Long As Its Chat Exists

```yaml
plan_unit_id: DL-084
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared answered Approve (option 1) on 2026-09-25 to EA-S09B2-CHILDRUN-RETENTION-001: the
  history of the 19 child-run families subagent.spawned, subagent.started,
  subagent.completed, subagent.failed, subagent.cancelled, subagent.timeout,
  subagent.paused, subagent.resumed, subagent.progress, subagent.tool_called,
  subagent.tool_completed, subagent.message_sent, subagent.message_received,
  subagent.output_truncated, subagent.retried, subagent.context_warning,
  subagent.model_switched, subagent.budget_warning and subagent.escalated is kept as long
  as its chat exists, the lifetime of Goal text (DL-047) and chat messages; deleting the
  chat removes it within 24 hours unless it is on hold. The policy object is
  RP-GOAL-THREAD-LIFETIME, subject to the Storage owner's DL-045 reuse check against the
  Chat content class, which caps a thread at 250,000 records with a linked successor roll
  and has no policy object of its own; which count rule applies is a Storage owner
  follow-up, not decided here, and the lifetime holds either way. The Storage retention
  owner writes the Case L-3 assignment, each family contract carries the structured
  retention_policy_ref and reconciles chat deletion, and CV-267 to CV-269 and the
  orchestrator child-run section cite this entry. Nothing is registered, admitted or
  removed and no registry row changes.
gui_related: false
gui_classification_reason: Assigns event retention; chat and card presentation are unchanged.
split_recommended: false
depends_on: [DL-039, DL-045, DL-047]
unblocks: []
acceptance_criteria:
  - Storage owner text assigns RP-GOAL-THREAD-LIFETIME, or after its DL-045 reuse check a materialized Chat content class with the same lifetime, to the 19 child-run families in the Case L-3 retention text and states which count rule applies to a very busy chat.
  - Each family's full contract carries the structured retention_policy_ref and removes the family's history with its chat, within 24 hours unless held; CV-267 to CV-269 and the orchestrator child-run section cite DL-084.
  - The subagent lineage record keeps RP-AUTHORITY-INDEFINITE under DL-075, and no registry row changes and no family is registered, admitted or removed by this entry.
validation_surfaces:
  - reports/event-authority-20260911/decision-responses.jsonl
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: child_run_history_retention_drift
reasoning_tier: high
context_scope: subagent_child_run_history_retention
implementation_surfaces:
  - Plans/storage-plan.md
  - Plans/storage_value_registry.json
  - Plans/Contracts_V0.md
  - Plans/orchestrator-subagent-integration.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - /mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/decision-card-answers-20260925/ANSWERS_STEP09_BATCH2.md
  - reports/event-authority-20260911/step-09-batch2-orchestrator-cards-20260925.md
  - reports/event-authority-20260911/step-09-batch2-card-answer-application-20260925.json
preserved_exact_tokens:
  - "Approve"
  - "EA-S09B2-CHILDRUN-RETENTION-001"
  - "RP-GOAL-THREAD-LIFETIME"
  - "subagent.spawned"
  - "subagent.started"
  - "subagent.completed"
  - "subagent.failed"
  - "subagent.cancelled"
  - "subagent.timeout"
  - "subagent.paused"
  - "subagent.resumed"
  - "subagent.progress"
  - "subagent.tool_called"
  - "subagent.tool_completed"
  - "subagent.message_sent"
  - "subagent.message_received"
  - "subagent.output_truncated"
  - "subagent.retried"
  - "subagent.context_warning"
  - "subagent.model_switched"
  - "subagent.budget_warning"
  - "subagent.escalated"
negative_constraints:
  - Do not give the 19 child-run families a one-year, split or indefinite lifetime, or keep their history after its chat is deleted beyond the chat's own deletion and hold rules.
  - Do not decide the count rule for a very busy chat on the strength of this entry; the Storage owner's reuse check settles whether RP-GOAL-THREAD-LIFETIME applies as it stands or the Chat content class is materialized.
  - Do not treat the retention assignment as registration, admission, binding or schema completion.
owner_hints:
  - Plans/storage-plan.md
  - Plans/storage_value_registry.json
  - Plans/Contracts_V0.md
  - Plans/orchestrator-subagent-integration.md
```

### DL-085 - Crew Board Messages Are Kept With The Coordination Records After Leaving The Board

```yaml
plan_unit_id: DL-085
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared answered Approve (option 1) on 2026-09-25 to EA-S09B2-BOARD-RETENTION-001: the
  crew board still hides a stale message after 24 hours, with unresolved blockers visible
  until resolved, and leaving the board deletes nothing. The stored messages of
  crew.board_message_posted, crew.board_message_read and crew.board_messages_archived are
  kept with the run's other coordination records under RP-COORDINATION-180D, 180 days
  after the run finishes, with at most 1,000,000 coordination records per project and the
  oldest eligible dropped first. The orchestrator board lifecycle says archived instead of
  archived or deleted, Storage binds RP-COORDINATION-180D for the three families in its
  coordination family and retention table, and the Contracts board rows carry that
  reference. No policy object or value changes, and nothing is registered, admitted or
  removed.
gui_related: false
gui_classification_reason: Decides stored message retention; the 24-hour board visibility rule is unchanged.
split_recommended: false
depends_on: [DL-039, DL-045]
unblocks: []
acceptance_criteria:
  - The orchestrator board lifecycle says stale board messages are archived after 24 hours, not archived or deleted, and unresolved blockers stay visible until resolved.
  - Storage owner text binds RP-COORDINATION-180D for crew.board_message_posted, crew.board_message_read and crew.board_messages_archived in its coordination family and retention table, and the Contracts board rows carry that retention reference.
  - No new retention policy is created and no RP-COORDINATION-180D value changes.
validation_surfaces:
  - reports/event-authority-20260911/decision-responses.jsonl
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: crew_board_message_retention_drift
reasoning_tier: high
context_scope: crew_board_message_retention
implementation_surfaces:
  - Plans/orchestrator-subagent-integration.md
  - Plans/storage-plan.md
  - Plans/storage_value_registry.json
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - /mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/decision-card-answers-20260925/ANSWERS_STEP09_BATCH2.md
  - reports/event-authority-20260911/step-09-batch2-orchestrator-cards-20260925.md
  - reports/event-authority-20260911/step-09-batch2-card-answer-application-20260925.json
preserved_exact_tokens:
  - "Approve"
  - "EA-S09B2-BOARD-RETENTION-001"
  - "RP-COORDINATION-180D"
  - "crew.board_message_posted"
  - "crew.board_message_read"
  - "crew.board_messages_archived"
negative_constraints:
  - Do not delete stored board messages when they leave the board, or keep them for a period other than the coordination records' period.
  - Do not create a new short retention policy for the crew board.
owner_hints:
  - Plans/orchestrator-subagent-integration.md
  - Plans/storage-plan.md
  - Plans/storage_value_registry.json
  - Plans/Contracts_V0.md
```

### DL-086 - Three Orchestrator Diagnostics Are Kept One Year After The Run Finishes

```yaml
plan_unit_id: DL-086
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared answered Approve (option 1) on 2026-09-25 to EA-S09B2-DIAGNOSTIC-RETENTION-001:
  phase.force_completed, config.validation.failed and parser.error are kept one year after
  the run finishes under RP-RUNTIME-365D, the rule of the run history they explain, with
  at most 1,000,000 records per run and 5,000,000 per project and a successor roll. The
  raw agent output parser.error carries, at least its first 500 characters, is kept for
  that year. The Storage retention owner writes the assignment and each family contract
  carries the structured retention_policy_ref; reconciling the orchestrator's
  first-500-characters rule with its all-raw-output rule stays owner work. No policy
  object or value changes, and nothing is registered, admitted or removed.
gui_related: false
gui_classification_reason: Assigns event retention, not visual presentation.
split_recommended: false
depends_on: [DL-039, DL-045]
unblocks: []
acceptance_criteria:
  - Storage owner text assigns RP-RUNTIME-365D to phase.force_completed, config.validation.failed and parser.error, and each family's full contract carries that structured retention_policy_ref.
  - The orchestrator reconciles its first-500-characters rule for parser.error with its all-raw-output rule, and the raw output parser.error keeps is retained for the RP-RUNTIME-365D period only.
  - No new retention policy is created and no RP-RUNTIME-365D value changes.
validation_surfaces:
  - reports/event-authority-20260911/decision-responses.jsonl
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: orchestrator_diagnostic_retention_drift
reasoning_tier: high
context_scope: orchestrator_diagnostic_retention
implementation_surfaces:
  - Plans/storage-plan.md
  - Plans/storage_value_registry.json
  - Plans/orchestrator-subagent-integration.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - /mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/decision-card-answers-20260925/ANSWERS_STEP09_BATCH2.md
  - reports/event-authority-20260911/step-09-batch2-orchestrator-cards-20260925.md
  - reports/event-authority-20260911/step-09-batch2-card-answer-application-20260925.json
preserved_exact_tokens:
  - "Approve"
  - "EA-S09B2-DIAGNOSTIC-RETENTION-001"
  - "RP-RUNTIME-365D"
  - "phase.force_completed"
  - "config.validation.failed"
  - "parser.error"
negative_constraints:
  - Do not keep these three diagnostics for 30 days or seven years, or split them between policies.
  - Do not treat the retention assignment as registration, admission, binding or schema completion.
owner_hints:
  - Plans/storage-plan.md
  - Plans/storage_value_registry.json
  - Plans/orchestrator-subagent-integration.md
```

### DL-087 - Six Older Crew Lifecycle Events Are Retired For The Shared Collaborative Workflow Events

```yaml
plan_unit_id: DL-087
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared gave no answer on 2026-09-25 to EA-S09B2-CREW-HISTORY-001 and wrote retire them
  but register the shared collaborative workflow events, so adding scope to this. It is
  recorded as retiring crew.formed, crew.member_added, crew.member_removed,
  crew.coordination, crew.completed and crew.disbanded, the substance of the card's option
  1 in his own words, and the scope he added, registering the shared collaborative
  workflow events, is defined by DL-090 to DL-092. A Crew run is recorded only by the
  shared collaborative workflow history. The Contracts owner removes the six rows, narrows
  CV-270 to the board events and retires CV-271, and the orchestrator adds a pointer to
  Collaborative Workflows. Nothing writes the six events, so no stored record is removed;
  in the Step 9 campaign the six rows are excluded as retired with their legacy bucket and
  cohort pins kept and no denominator removal claimed. Nothing is registered or admitted
  and no registered family changes.
gui_related: false
gui_classification_reason: Retires six unwritten Crew event names; a Crew run is shown through the shared collaborative run.
split_recommended: false
depends_on: [DL-039, DL-045]
unblocks: []
acceptance_criteria:
  - Contracts no longer lists crew.formed, crew.member_added, crew.member_removed, crew.coordination, crew.completed or crew.disbanded in its crew event table, CV-270 covers the three crew board families only, and CV-271 is retired.
  - The orchestrator's Crew text points to Plans/Collaborative_Workflows.md for the Crew run lifecycle, and no second Crew lifecycle history is written.
  - The J248 rows of the six families are RECLASSIFY_TO_EXCLUDED with their legacy bucket and cohort pins kept and no denominator removal claimed.
validation_surfaces:
  - reports/event-authority-20260911/decision-responses.jsonl
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: crew_lifecycle_event_retirement_drift
reasoning_tier: high
context_scope: crew_lifecycle_event_retirement
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/orchestrator-subagent-integration.md
  - Plans/Collaborative_Workflows.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - /mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/decision-card-answers-20260925/ANSWERS_STEP09_BATCH2.md
  - reports/event-authority-20260911/step-09-batch2-orchestrator-cards-20260925.md
  - reports/event-authority-20260911/step-09-batch2-card4-addendum-20260925.md
  - reports/event-authority-20260911/step-09-batch2-card-answer-application-20260925.json
preserved_exact_tokens:
  - "EA-S09B2-CREW-HISTORY-001"
  - "retire them but register the shared collaborative workflow events, so adding scope to this."
  - "crew.formed"
  - "crew.member_added"
  - "crew.member_removed"
  - "crew.coordination"
  - "crew.completed"
  - "crew.disbanded"
  - "CV-270"
  - "CV-271"
negative_constraints:
  - Do not keep the six crew lifecycle families as a second Crew history, now or until the shared events are registered.
  - Do not retire or change the three crew board families or any registered family when the six names are removed.
  - Do not read this entry as registering the shared collaborative workflow events; DL-090 to DL-092 define that scope, and each family still needs its own admission landing.
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/orchestrator-subagent-integration.md
  - Plans/Collaborative_Workflows.md
```

### DL-088 - Subagent Spawn Request Event Names Are Retired

```yaml
plan_unit_id: DL-088
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared answered Approve (option 1) on 2026-09-25 to EA-S09B2-SPAWN-REQUEST-001:
  subagent.spawn_requested and subagent.spawn_completed are retired, and Puppet Master
  records no start request separately from the subagent it creates. A waiting start is a
  child in the queued state and a start refused before any child exists keeps its existing
  outcome reason. The Contracts owner removes the two names from the subagent payload
  text, the lineage envelope sentence, CV-116 and CV-266, keeping the rule that
  chat.subagent_* names are legacy aliases, and Run Modes adds one clarifying sentence to
  its crew queue row. Nothing writes the two events, so no stored record is removed; in
  the Step 9 campaign both rows are excluded as retired with their legacy bucket and
  cohort pins kept and no denominator removal claimed. Nothing is registered or admitted
  and no registered family changes.
gui_related: false
gui_classification_reason: Retires two unwritten event names; chat already shows a waiting start as a queued child.
split_recommended: false
depends_on: [DL-039, DL-045]
unblocks: []
acceptance_criteria:
  - Contracts no longer names subagent.spawn_requested or subagent.spawn_completed in its subagent payload text, lineage envelope sentence, CV-116 or CV-266, and keeps the rule that chat.subagent_* names are legacy aliases.
  - Run Modes clarifies its crew queue row so that a waiting spawn is not recorded as a separate request, in wording the Run Modes owner chooses.
  - The J248 rows subagent.spawn_requested and subagent.spawn_completed are RECLASSIFY_TO_EXCLUDED with their legacy bucket and cohort pins kept and no denominator removal claimed.
validation_surfaces:
  - reports/event-authority-20260911/decision-responses.jsonl
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: subagent_spawn_request_event_retirement_drift
reasoning_tier: high
context_scope: subagent_spawn_request_retirement
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Run_Modes.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - /mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/decision-card-answers-20260925/ANSWERS_STEP09_BATCH2.md
  - reports/event-authority-20260911/step-09-batch2-orchestrator-cards-20260925.md
  - reports/event-authority-20260911/step-09-batch2-card-answer-application-20260925.json
preserved_exact_tokens:
  - "Approve"
  - "EA-S09B2-SPAWN-REQUEST-001"
  - "subagent.spawn_requested"
  - "subagent.spawn_completed"
  - "CV-116"
  - "CV-266"
negative_constraints:
  - Do not register subagent.spawn_requested or subagent.spawn_completed, or add a separate request history for subagent starts.
  - Do not remove the legacy chat.subagent_* alias rule or any registered family when the two names are removed.
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/Run_Modes.md
```

### DL-089 - Application-Scoped Platform Evaluations Count In Their Own Application Bucket Under RP-OPERATIONAL-2555D

```yaml
plan_unit_id: DL-089
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared answered Approve (option 1) on 2026-09-25 to EA-S09-PLATFORM-CARDINALITY-001:
  under RP-OPERATIONAL-2555D, the application-scoped evaluations of
  platform.capability_evaluated are counted in an application-wide bucket of their own,
  apart from the DL-083 bucket of the three Storage families, with the same
  2,000,000-record cap, fail-closed overflow and seven-year period. Project-scoped
  evaluations keep per-project counting. This answers the part of the SP-291 adapter seam
  that DL-083 left open; the Storage retention owner writes it into the SP-291 policy text
  as a second application-wide bucket, together with DL-083's still-pending edit, and
  binds it under DL-045, with no new policy object and no policy value changed. Until that
  owner edit lands, the family's retention cell in the Step 8 depth assessment stays
  PARTIAL. The catalog stays empty until build time (DL-082). Nothing is registered or
  admitted.
gui_related: false
gui_classification_reason: Decides retention cardinality counting, not visual presentation.
split_recommended: false
depends_on: [DL-039, DL-045, DL-083]
unblocks: []
acceptance_criteria:
  - Storage owner text counts the application-scoped evaluations of platform.capability_evaluated in an application-wide bucket of their own under RP-OPERATIONAL-2555D, separate from the DL-083 bucket, with its unchanged cap, overflow and period, and replaces the unproved adapter seam statement for this family with that binding.
  - No new retention policy object is created and no RP-OPERATIONAL-2555D value changes; project-scoped evaluations keep per-project counting.
  - Until that owner edit lands, the Step 8 depth assessment keeps the family's retention cell PARTIAL.
validation_surfaces:
  - reports/event-authority-20260911/decision-responses.jsonl
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: platform_capability_cardinality_scope_drift
reasoning_tier: high
context_scope: platform_capability_application_bucket
implementation_surfaces:
  - Plans/storage-plan.md
  - Plans/storage_value_registry.json
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - /mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/decision-card-answers-20260925/ANSWERS_STEP09_BATCH2.md
  - reports/event-authority-20260911/step-09-platform-cardinality-card-20260925.md
  - reports/event-authority-20260911/step-09-batch2-card-answer-application-20260925.json
preserved_exact_tokens:
  - "Approve"
  - "EA-S09-PLATFORM-CARDINALITY-001"
  - "RP-OPERATIONAL-2555D"
  - "platform.capability_evaluated"
negative_constraints:
  - Do not count the application-scoped evaluations of platform.capability_evaluated in the DL-083 bucket of the three Storage families, or leave them without a count cap.
  - Do not create a new retention policy, change any RP-OPERATIONAL-2555D value, or invent a project for application-scoped evaluations.
  - Do not add platform capability catalog entries before build time on the strength of this entry (DL-082).
owner_hints:
  - Plans/storage-plan.md
  - Plans/storage_value_registry.json
```

### DL-090 - Registration Of All Seventeen Collaborative Workflow Events One Family Per Landing Under Bounded Technical Bindings

```yaml
plan_unit_id: DL-090
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared chose option 2 of EA-S09B2-COLLAB-EVENTS-001 on 2026-09-25, written in the note
  with no radio button selected. All 17 event names of Collaborative Workflows section 13
  are to be registered, collaboration.created, collaboration.started,
  collaboration.paused, collaboration.resumed, collaboration.cancelled,
  collaboration.completed, collaboration.participant_started,
  collaboration.participant_completed, collaboration.message_added,
  collaboration.artifact_added, collaboration.configuration_changed,
  brainstorm.proposal_added, brainstorm.vote_added, brainstorm.plan_synthesized,
  review.finding_added, review.finding_dispositioned and review.artifact_finalized, each
  through its own Storage admission landing, one family per landing. The Collaborative
  Workflows, Contracts and Storage owners receive a separate bounded technical-binding
  permission for exactly these names on DL-045's terms, as DL-046 did for the Browser
  families, and DL-045's 285-family scope is unchanged. The permission covers only
  technical bindings for already specified behavior after per-family search and scoped
  negative evidence, and decides no feature, retention, deletion or owner conflict. Every
  family still needs its full contract, blind review and own admission landing. The 17
  families are new campaign scope outside the 252 J248 rows. Nothing is registered by this
  entry, and the run, message, proposal and finding records still need their own schemas.
gui_related: false
gui_classification_reason: Records event registration scope and bounded technical authority, not visual presentation.
split_recommended: false
depends_on: [DL-039, DL-045, DL-046, DL-087]
unblocks: []
acceptance_criteria:
  - The exact 17-name scope equals Plans/Collaborative_Workflows.md section 13 at 1e5d9b097b and is disjoint from DL-045's 285 families and DL-046's 53 Browser names.
  - Each new technical definition has a per-family current-source search, existing-contract citations and scoped negative evidence, is labelled newly authored, and stays limited to already specified behavior.
  - Each family has its full owner-backed contract, exact schema references, positive and negative semantic checks, a blind form-driven review and its own Storage admission landing, and the contracts of events that carry proposal or finding text say how that text is protected and deleted.
  - The run, message, proposal and finding records get their own contracts schema and fixture pair before anything is stored, and no family is emitted before its admission landing.
validation_surfaces:
  - reports/event-authority-20260911/decision-responses.jsonl
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: collaborative_workflow_event_scope_expansion
reasoning_tier: high
context_scope: collaborative_workflow_event_registration_scope
implementation_surfaces:
  - Plans/Collaborative_Workflows.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/event_family_registry.json
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - /mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/decision-card-answers-20260925/ANSWERS_CARD4_ADDENDUM.md
  - reports/event-authority-20260911/step-09-batch2-card4-addendum-20260925.md
  - reports/event-authority-20260911/step-09-batch2-card-answer-application-20260925.json
preserved_exact_tokens:
  - "EA-S09B2-COLLAB-EVENTS-001"
  - "DL-045"
  - "DL-046"
  - "collaboration.created"
  - "collaboration.started"
  - "collaboration.paused"
  - "collaboration.resumed"
  - "collaboration.cancelled"
  - "collaboration.completed"
  - "collaboration.participant_started"
  - "collaboration.participant_completed"
  - "collaboration.message_added"
  - "collaboration.artifact_added"
  - "collaboration.configuration_changed"
  - "brainstorm.proposal_added"
  - "brainstorm.vote_added"
  - "brainstorm.plan_synthesized"
  - "review.finding_added"
  - "review.finding_dispositioned"
  - "review.artifact_finalized"
negative_constraints:
  - Do not expand the 17-name scope through later file edits, or change DL-045's 285-family scope or DL-046's 53 Browser names.
  - Do not infer missing bindings or evidence from sibling names, and do not turn the technical permission into feature, retention, deletion or owner-conflict authority.
  - Do not bulk admit, emit a family before its own admission landing, or treat registering these events as registering the run, message, proposal or finding records.
owner_hints:
  - Plans/Collaborative_Workflows.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/event_family_registry.json
```

### DL-091 - A Failed Collaborative Run Gets Its Own Recorded Event

```yaml
plan_unit_id: DL-091
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared answered Approve (option 1) on 2026-09-25 to EA-S09B2-COLLAB-FAILED-001:
  Collaborative Workflows section 13 gains collaboration.failed, the recorded ending of a
  collaborative run that fails, with its reason, beside collaboration.completed and
  collaboration.cancelled. It is registered with the others under DL-090's permission, so
  that permission's exact list is 18 names, the 17 of DL-090 and collaboration.failed;
  DL-090's text is not edited. Its contract and its own Storage admission landing join
  DL-090's set, one family per landing. This entry adds no events for the waiting and
  blocked states, and a failed participant is recorded by its
  collaboration.participant_completed event. It is new campaign scope outside the 252 J248
  rows. Nothing is registered or admitted and no registry row changes.
gui_related: false
gui_classification_reason: Adds a recorded run ending; the failed run state is already shown.
split_recommended: false
depends_on: [DL-039, DL-045, DL-090]
unblocks: []
acceptance_criteria:
  - Plans/Collaborative_Workflows.md section 13 names collaboration.failed, and its contract records the failed ending of the whole run with its reason.
  - collaboration.failed is registered under DL-090's permission as the eighteenth name, through its own Storage admission landing with its full contract, blind review and semantic checks.
  - No event is added for the waiting or blocked states, and a failed participant stays recorded by collaboration.participant_completed.
validation_surfaces:
  - reports/event-authority-20260911/decision-responses.jsonl
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: collaborative_run_failure_event_drift
reasoning_tier: high
context_scope: collaborative_run_failure_event
implementation_surfaces:
  - Plans/Collaborative_Workflows.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - /mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/decision-card-answers-20260925/ANSWERS_CARD4_ADDENDUM.md
  - reports/event-authority-20260911/step-09-batch2-card4-addendum-20260925.md
  - reports/event-authority-20260911/step-09-batch2-card-answer-application-20260925.json
preserved_exact_tokens:
  - "Approve"
  - "EA-S09B2-COLLAB-FAILED-001"
  - "collaboration.failed"
  - "collaboration.completed"
  - "collaboration.cancelled"
  - "collaboration.participant_completed"
  - "DL-090"
negative_constraints:
  - Do not record a failed collaborative run as completed or cancelled, or end its history without collaboration.failed once that family is registered.
  - Do not add events for the waiting or blocked states on the strength of this entry.
  - Do not register collaboration.failed outside its own admission landing or outside the terms of DL-090's permission.
owner_hints:
  - Plans/Collaborative_Workflows.md
  - Plans/Contracts_V0.md
```

### DL-092 - Collaborative Workflow Event History Is Kept As Long As Its Chat Exists

```yaml
plan_unit_id: DL-092
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared answered Approve (option 1) on 2026-09-25 to EA-S09B2-COLLAB-RETENTION-001: the
  recorded events of every Crew, BrainStorm, Review and Chat Room run, the 18 families of
  DL-090 and DL-091, are kept as long as the run's chat exists, the lifetime DL-084 gave
  child-run history; deleting the chat removes them within 24 hours unless it is on hold.
  The policy object is RP-GOAL-THREAD-LIFETIME, subject to the same Storage owner DL-045
  reuse check against the Chat content class as DL-084, and which count rule applies to a
  very busy chat is that same Storage owner follow-up; the lifetime holds either way. The
  Storage retention owner writes the Case L-3 assignment, and each family contract carries
  the structured retention_policy_ref and reconciles chat deletion. This covers the
  recorded events only, not the run record, transcript messages, proposals or findings.
  Nothing is registered, admitted or removed and no registry row changes.
gui_related: false
gui_classification_reason: Assigns event retention; collaborative cards and panels are unchanged.
split_recommended: false
depends_on: [DL-039, DL-045, DL-084, DL-090, DL-091]
unblocks: []
acceptance_criteria:
  - Storage owner text assigns RP-GOAL-THREAD-LIFETIME, or after its DL-045 reuse check a materialized Chat content class with the same lifetime, to the 18 collaborative workflow families in the Case L-3 retention text, and states which count rule applies to a very busy chat, as for DL-084's families.
  - Each family's full contract carries the structured retention_policy_ref and removes the family's history with its chat, within 24 hours unless held.
  - The run record, transcript messages, proposals and findings take no lifetime from this entry, and no registry row changes.
validation_surfaces:
  - reports/event-authority-20260911/decision-responses.jsonl
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: collaborative_workflow_history_retention_drift
reasoning_tier: high
context_scope: collaborative_workflow_history_retention
implementation_surfaces:
  - Plans/storage-plan.md
  - Plans/storage_value_registry.json
  - Plans/Collaborative_Workflows.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - /mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/decision-card-answers-20260925/ANSWERS_CARD4_ADDENDUM.md
  - reports/event-authority-20260911/step-09-batch2-card4-addendum-20260925.md
  - reports/event-authority-20260911/step-09-batch2-card-answer-application-20260925.json
preserved_exact_tokens:
  - "Approve"
  - "EA-S09B2-COLLAB-RETENTION-001"
  - "RP-GOAL-THREAD-LIFETIME"
  - "DL-084"
negative_constraints:
  - Do not keep the 18 collaborative workflow families for one year or 180 days after the run finishes, or keep their history after its chat is deleted beyond the chat's own deletion and hold rules.
  - Do not decide the count rule for a very busy chat on the strength of this entry, or apply this lifetime to the run, transcript, proposal or finding records.
  - Do not treat the retention assignment as registration, admission, binding or schema completion.
owner_hints:
  - Plans/storage-plan.md
  - Plans/storage_value_registry.json
  - Plans/Collaborative_Workflows.md
```

### DL-093 - The Seven Coordination Families' Registration Entries Are Jared's Decision Entries For Those Families

```yaml
plan_unit_id: DL-093
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared answered 4 i approve on 2026-09-25 to the host's question 4, which put review
  question D-02 of the Step 9 procedure record to him for the seven coordination
  admissions: the Decision Log entry that each registration landing of the seven
  coordination families (coordination.agent_registered, coordination.agent_status_updated,
  coordination.agent_operation_updated, coordination.agent_file_ownership_updated,
  coordination.agent_unregistered, coordination.agent_crashed and
  coordination.agent_aborted) adds under DL-078, which names the family, is Jared's
  decision entry for that family in the sense of DL-077, and the family's DL-077 admission
  record cites it as its decision_ref; Jared does not approve each of those seven
  admissions himself. The question named the seven coordination families, and this answer
  covers those seven. No answer from Jared to the host's wider reading, which covered
  every Step 9 registration, is recorded, so D-02 stays open for every other Step 9
  registration. DL-077's and DL-078's text is unchanged, every other Step 9 requirement
  stands, and nothing is registered or admitted.
gui_related: false
gui_classification_reason: Defines admission-record governance, not visual presentation.
split_recommended: false
depends_on: [DL-039, DL-077, DL-078]
unblocks: []
acceptance_criteria:
  - The DL-077 admission record of each of the seven coordination families cites as its decision_ref the Decision Log entry that its own registration landing adds under DL-078 and that names the family.
  - The Step 9 procedure record marks review question D-02 as answered by DL-093 for the seven coordination families and as open for every other Step 9 registration.
  - DL-077's and DL-078's text is unchanged, and no registration skips any other part of the Step 9 procedure.
validation_surfaces:
  - reports/event-authority-20260911/step-09-procedure-20260924.md
  - python3 -m unittest tests.test_event_authority_holding_bucket
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: event_authority_admission_decision_entry_drift
reasoning_tier: high
context_scope: event_authority_step09_admission_decision_entry
implementation_surfaces:
  - reports/event-authority-20260911/step-09-procedure-20260924.md
  - reports/event-authority-20260911/admission-records
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - /mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/decision-card-answers-20260925/ANSWERS_OPEN_QUESTIONS.md
  - reports/event-authority-20260911/step-09-procedure-20260924.md
  - reports/event-authority-20260911/step-10-post-august-admission-receipt.json
preserved_exact_tokens:
  - "4 i approve"
  - "D-02"
  - "DL-077"
  - "DL-078"
  - "decision_ref"
negative_constraints:
  - Do not require a separate approval from Jared for the admission of one of the seven coordination families whose registration passes the full procedure and whose landing adds the family's own Decision Log entry.
  - Do not cite DL-077 or DL-078 themselves as a family's decision entry, and do not edit either entry's text to record this answer.
  - Do not lower any other Step 9 requirement on the strength of this entry.
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Plan_To_Node_Compilation.md
```

### DL-094 - Step 9 Registration Of coordination.agent_registered Moves The Approved Checkpoint To 2026-09-25.1

```yaml
plan_unit_id: DL-094
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Recorded on 2026-09-25 under DL-078's standing rule for the Storage admission landing
  of coordination.agent_registered; under DL-093 this entry is Jared's decision entry for
  that family in the sense of DL-077, and its DL-077 admission record
  reports/event-authority-20260911/admission-records/coordination.agent_registered.json
  cites it as its decision_ref. The family's prepared registry row is appended unchanged
  as the 43rd family of Plans/event_family_registry.json, moving the registry from
  revision 2026-09-11.2 (42 families) to revision 2026-09-25.1 (43 families, SHA-256
  4227be36806615cabc8a36c0a8a6555a24b6b6c38e960e07bd12354c3c373e70), under DL-045's
  binding authority, one family per landing. In the same landing
  EVENT_FAMILY_REGISTRY_REVISION and EVENT_FAMILY_REGISTRY_KERNEL_ROW_COUNT and their
  provenance comment move to 2026-09-25.1 and 43, the two test pins move to 43, and the
  derived plan index is regenerated. The registration passes the whole procedure: the
  full contract (OSI-438, CV-353, SP-320, ATS-058, the admission ledger and fixtures) on
  main since 4a2135b940, whose blind review found it landing-ready after its second
  cycle; this admission's own blind review, named with its verdict in the landing record;
  its own Storage admission landing; and the coordinator's landing go. The depth
  assessment reports/event-authority-20260911/step-09-depth-coordination.agent_registered.json
  (SHA-256 54346d8b231b7080b487ed5a8e7332cc0d6202a8177309a10d772b796266509c) shows all
  twelve criteria passing. The entry admits only this family and changes no other
  checkpoint, validator or seal condition.
gui_related: false
gui_classification_reason: Records an event family registration and its checkpoint move, not visual presentation.
split_recommended: false
depends_on: [DL-039, DL-045, DL-077, DL-078, DL-093]
unblocks: []
acceptance_criteria:
  - Plans/event_family_registry.json is at revision 2026-09-25.1 with 43 families and SHA-256 4227be36806615cabc8a36c0a8a6555a24b6b6c38e960e07bd12354c3c373e70, and its row for coordination.agent_registered equals the admission ledger's prepared row, canonical SHA-256 1602bb6d33b63f79b7dc1daf4502c0aadbb26a4aa871a2963b2510a5d0353b40.
  - EVENT_FAMILY_REGISTRY_REVISION and EVENT_FAMILY_REGISTRY_KERNEL_ROW_COUNT in scripts/pm_pnc019_currentness.py read 2026-09-25.1 and 43 with their provenance comment, and the test pins in tests/test_pm_testing_session_events.py and tests/test_pm_github_project_integration.py read 43.
  - The DL-077 admission record of coordination.agent_registered cites this entry as its decision_ref, pins this entry's prose section and pins the depth assessment whose twelve criteria all pass; the independent seal check accepts the family through that record.
  - No other family is admitted, and no other checkpoint, validator or seal condition changes.
validation_surfaces:
  - python3 scripts/pm_coordination_events.py
  - python3 -m unittest tests.test_event_authority_holding_bucket
  - python3 -m unittest tests.test_pm_pnc019_currentness
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: event_authority_registration_checkpoint_drift
reasoning_tier: high
context_scope: event_authority_step09_coordination_agent_registered
implementation_surfaces:
  - Plans/event_family_registry.json
  - Plans/coordination_event_admission.json
  - scripts/pm_pnc019_currentness.py
  - reports/event-authority-20260911/admission-records/coordination.agent_registered.json
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - reports/event-authority-20260911/step-09-depth-coordination.agent_registered.json
  - reports/event-authority-20260911/step-09-coordination-prep-20260925.md
  - reports/event-authority-20260911/step-09-procedure-20260924.md
  - /mnt/Cursor/PM-Experiments/review-ea-s09-coordination-prep-20260925/RECHECK.md
preserved_exact_tokens:
  - "coordination.agent_registered"
  - "2026-09-25.1"
  - "4227be36806615cabc8a36c0a8a6555a24b6b6c38e960e07bd12354c3c373e70"
  - "EVENT_FAMILY_REGISTRY_REVISION"
  - "EVENT_FAMILY_REGISTRY_KERNEL_ROW_COUNT"
  - "decision_ref"
negative_constraints:
  - Do not read this entry as admitting any of the six other coordination families; each needs its own Storage admission landing, depth assessment, Decision Log entry and admission record.
  - Do not append coordination events natively on the strength of this entry; SP-320 keeps the family contract-only until all seven coordination families are admitted.
  - Do not edit this entry's prose section after it lands; the admission record pins its bytes, and a changed section fails the seal check closed for this family.
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Plan_To_Node_Compilation.md
```

### DL-001 - Decision Log Source-Preserving Bridge Retired

```yaml
plan_unit_id: DL-001
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  The former Decision Log source-preserving bridge is retired in place after
  Phase 2B atomized or structurally dispositioned Decision_Log-S0001 through
  Decision_Log-S0026 into DL-002 through DL-026 or explicit structural coverage.
  DL-001 remains only as migration lineage for the retired bridge span and must
  not re-own atomized source coverage.
gui_related: false
gui_classification_reason: The retired bridge is migration lineage and no longer owns GUI or product behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- DL-001 no longer uses the source-preserving PlanUnit compile hint.
- Prior source coverage remains carried by DL-002 through DL-026 and structural coverage_map dispositions.
- The retired bridge does not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
- Coverage for the retired bridge is recorded in the Phase 2B batch 043 coverage map.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: migration_lineage
reasoning_tier: standard
context_scope: plan_standardization
implementation_surfaces:
- Plans/Decision_Log.md
node_compile_hint:
  mode: source_preserving_bridge_retired
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Log-S0025
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Decision_Log-S0001
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Decision_Log-S0002
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Decision_Log-S0003
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Decision_Log-S0004
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Decision_Log-S0005
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Decision_Log-S0006
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Decision_Log-S0007
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Decision_Log-S0008
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Decision_Log-S0009
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Decision_Log-S0010
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Decision_Log-S0011
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Decision_Log-S0012
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Decision_Log-S0013
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Decision_Log-S0014
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Decision_Log-S0015
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Decision_Log-S0016
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Decision_Log-S0017
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Decision_Log-S0018
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Decision_Log-S0019
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Decision_Log-S0020
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Decision_Log-S0021
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Decision_Log-S0022
preserved_exact_tokens:
- DL-001
- source_preserving_planunit
- DL-002
- DL-026
- Decision Log
- Purpose
- Entries
- 'DL-001: OpenCode Deep Extraction — SSOT target mapping for new subsystems'
- 'DL-002: Section numbering shift in OpenCode_Deep_Extraction.md'
- 'DL-003: Orchestrator execution model'
- 'ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Orchestrator_Page.md'
- 'DL-004: Governance split'
- 'ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/orchestrator-subagent-integration.md'
- 'DL-005: Completion and promotion model'
- 'ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Run_Graph_View.md'
- 'DL-006: Weak integration'
- 'ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Glossary.md'
- 'DL-007: Corroboration threshold'
- 'ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Decision_Policy.md'
- 'DL-008: Graph patch lineage'
- 'ContractRef: ContractName:Plans/Run_Graph_View.md, ContractName:Plans/storage-plan.md'
- 'DL-009: Source Control boundary'
- 'ContractRef: ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/GitHub_Integration.md'
- 'DL-010: Shared runtime identity'
- 'ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Multi-Account.md'
- 'DL-011: Blocked approval identity'
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/human-in-the-loop.md'
- 'DL-012: Navigation primitives'
negative_constraints:
- "Do not remap atomized Decision_Log spans back to DL-001."
- "Do not treat the retired bridge as implementation-ready product coverage."
- "Do not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks from this migration-lineage unit."
- 'Decision_Log is a human-authored decision ledger, not a derived decision log. `Plans/auto_decisions.jsonl` is pipeline-managed and must not be hand-edited here; `Plans/.pipeline/research_packet.json` (`/.pipeline/research_packet.json`) is regenerated after owner/consumer reconciliation and must not '
- Section-number drift in the extraction source must not become canonical drift in local SSOT docs.
- 'The shared provider-runtime contract applies beyond Orchestrator: `Multi-Account.md` governs assistant, interviewer, requirements builder, PRD builder, overseers, node workers, and provider-backed chat/tool turns. Requested and effective `/model/effort/persona/auth/account`, `/effective` identity, p'
- 'Supporting planning machinery is not exempt from decision traceability: `Plans/sharding_config.json` (`/sharding_config.json`) and `Plans/auto_decisions.jsonl` (`/auto_decisions.jsonl`) must not disagree on fallback `chunk-line` settings, because `/decision` state drift in support files can still co'
- Canonical copy favors precise runtime and user-facing labels. Object/action labels include `Seams`, `Feature Seam`, `Work Package`, `Package Overseer`, `Seam Overseer`, `Locally Complete`, `Seam Complete`, `Completion Blocked`, `Weak Integration`, `Promotion Blocked`, `Promotion Revoked`, `Corrobora
compatibility_only_notes:
- "The old source-preserving bridge is retained only so migration lineage and historical references to DL-001 remain auditable."
- Worktree and graph approval identity must stop hanging on `tier_id`, request-centric `HITL`, or `request_id` payloads once blocked-episode runtime identity is available. Replace graph HITL command payload identity with blocked-episode anchored identity while preserving `Contracts_V0.md` / `Contracts
- Lane cleanup may transition into `retained` instead of immediate cleanup when recent completion is pending review or `/promotion`, weak integration remains under investigation, unresolved concern or corroboration is tied to lane outputs, or manual operator retention is active.
stale_retired_dispositions: []
owner_boundary_notes:
- '> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: "Puppet Master" only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.'
- 'Decision_Log is a human-authored decision ledger, not a derived decision log. `Plans/auto_decisions.jsonl` is pipeline-managed and must not be hand-edited here; `Plans/.pipeline/research_packet.json` (`/.pipeline/research_packet.json`) is regenerated after owner/consumer reconciliation and must not '
- '### DL-001: OpenCode Deep Extraction — SSOT target mapping for new subsystems'
- The mapping captured in `OpenCode_Deep_Extraction.md` remains a reference aid, but local canonical contracts still control final ownership in Puppet Master.
- Section-number drift in the extraction source must not become canonical drift in local SSOT docs.
- The canonical orchestration model is the node graph. `Feature Seam` and `Work Package` are first-class graph-owned objects, and `Node` remains the smallest executable unit.
- '`Package Overseer` and `Seam Overseer` are distinct governance roles. Runtime remains the canonical owner of readiness, blockers, transitions, retries, and dispatch.'
- '### DL-009: Source Control boundary'
- Blocked episodes anchored by `run_id`, `node_id`, `blocked_sequence`, and `attempt_id?` supersede request-centric HITL identity as canonical runtime approval scope.
- '`route_target` is the canonical navigation contract. `OpenSubject` is the canonical identity-native source-open contract. `resume_url` is serialized transport only.'
- 'Supporting planning machinery is not exempt from decision traceability: `Plans/sharding_config.json` (`/sharding_config.json`) and `Plans/auto_decisions.jsonl` (`/auto_decisions.jsonl`) must not disagree on fallback `chunk-line` settings, because `/decision` state drift in support files can still co'
- Canonical copy favors precise runtime and user-facing labels. Object/action labels include `Seams`, `Feature Seam`, `Work Package`, `Package Overseer`, `Seam Overseer`, `Locally Complete`, `Seam Complete`, `Completion Blocked`, `Weak Integration`, `Promotion Blocked`, `Promotion Revoked`, `Corrobora
- 'Governance semantics stay graph-owned: a `run` is the full canonical graph under deterministic runtime control, a `work package` is a coherent precomputed subgraph with a local overseer, a `feature seam` is a cross-package oversight scope, and a `node` is the smallest executable work unit. Overseers'
- 'Revocation and reopen semantics are explicit named states: `Promotion Revoked`, `Seam Completion Revoked`, `Reopened`, `Reopened by Patch`, and `Reopened by New Evidence`. Blocked states expose blocked reason, blocked owner, and recovery context. Weak-integration buckets include missing GUI represen'
- 'Approval anchoring moves to canonical runtime identity: `run_id`, `node_id`, `blocked_sequence`, optional `attempt_id`, and execution-unit context refs supersede request-centric button copy, request-centric persistence language, and tier-boundary approval `CTA` framing in `Plans/human-in-the-loop.md'
- 'Corroboration disagreement handling uses the `2-of-3` rule: `2-of-3` accepts a high-impact claim as `/canonical`, no `2-of-3` means a high-impact claim is not accepted as blocking or canonical truth, and credible lesser concerns still emit a non-blocking `/minor` advisory visible on the Orchestrator'
owner_hints:
- Plans/Decision_Log.md
split_recommendation_reason: The bridge has been retired after safe atomization and structural coverage dispositions.
```

### DL-104 - The Chat Transcript Uses The Turn Stage Layout Distinct Item Families And An Accent Budget

```yaml
plan_unit_id: DL-104
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared decided on 2026-09-26 that the rebuilt Turn Stage transcript is the default chat
  transcript, that every transcript item renders as one of seven families chosen by its message
  type (prose, work, deliverable, needs you, people, time, ledger) with its own silhouette, and
  that the accent is spent only on live work, items that need the user, the one primary action of
  a card, and Send and Stop. Each assistant turn opens with a mark in a gutter and a hairline spine
  through its items to an end dot. ACD-469 and F3-562 carry the owner text; DR-043 names the
  single owners of the family map and the accent rule.
gui_related: true
gui_classification_reason: Sets the default chat transcript layout, item silhouettes and accent use.
split_recommended: false
depends_on: [ACD-072, ACD-073]
unblocks: [ACD-469, F3-562, DR-043]
acceptance_criteria:
  - Turn Stage is the default transcript presentation; other takes remain concept lab options only.
  - Every persisted message type maps to exactly one of the seven families through one owner map.
  - The accent is used only for live work, needs-you items, a card's one primary action, and Send and Stop.
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: chat_transcript_presentation_drift
reasoning_tier: high
context_scope: chat_transcript_presentation
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/DRY_Rules.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - /mnt/Cursor/PuppetMaster-Evidence/chat-wow-20260926/jared-decisions-20260926-27.md
  - Concepts/chat-assistant-concepts/5.6 Pro/Chat updates.md
preserved_exact_tokens:
  - "Make it the default (Recommended)"
  - "we can apply the rule now"
  - "Turn Stage"
negative_constraints:
  - Do not render every item kind in one shared card shell.
  - Do not spend the accent on decoration, event icons, the user bubble, or chips.
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### DL-105 - The Working Card Folds When The Answer Starts And Short Narration Folds Into It

```yaml
plan_unit_id: DL-105
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared decided on 2026-09-26 that short narration lines between tool calls fold into the
  working card, streaming at its foot and tucking into its head caption when the next subject
  starts, and that a live working card folds into its compact strip when the turn's final answer
  starts streaming, superseding the rule that the last working activity stays expanded. The
  approved plan also carries concurrent live subjects, failed and waiting subjects, and
  clustering past 16 and 30 nodes. ACD-473 carries the owner text.
gui_related: true
gui_classification_reason: Changes how the working activity card behaves in the transcript.
split_recommended: false
depends_on: [ACD-104]
unblocks: [ACD-473]
acceptance_criteria:
  - A live card stays expanded; it folds into its strip when the final answer starts streaming.
  - A short narration line never becomes a separate transcript card while its turn's work continues.
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: working_activity_behaviour_drift
reasoning_tier: high
context_scope: chat_working_activity
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - /mnt/Cursor/PuppetMaster-Evidence/chat-wow-20260926/jared-decisions-20260926-27.md
  - Concepts/chat-assistant-concepts/5.6 Pro/Chat updates.md
preserved_exact_tokens:
  - "folding short lines likely makes sense"
  - "We can do your reccommendation"
negative_constraints:
  - Do not keep the last working activity expanded after its turn's answer starts.
  - Do not split one turn into a stack of working cards around each narration line.
owner_hints:
  - Plans/assistant-chat-design.md
```

### DL-106 - Replies Stream Stop Lives In The Composer And Motion Follows The Theme Family

```yaml
plan_unit_id: DL-106
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared decided on 2026-09-26 that replies stream (a thinking placeholder, a paced word release
  and a settle, ending complete, stopped with the partial text kept, or with an error), that Stop
  is the composer's Send/Stop morph and never a control inside the working activity, that motion
  has one voice per theme family (Basic, Friendly, Glass, Retro; dark and light share it) whose
  path, easing and texture differ but never timing or order, and that the concept's demo
  controls, Demo Studio and its Motion voice picker are lab tools and never product. ACD-470,
  ACD-474 and ACD-475 carry the owner text.
gui_related: true
gui_classification_reason: Sets reply streaming, the Stop location and per-theme motion.
split_recommended: false
depends_on: [ACD-238, ACD-240]
unblocks: [ACD-470, ACD-474, ACD-475]
acceptance_criteria:
  - Replies stream in place and end in one of complete, stopped or error.
  - Stop is available only from the composer morph.
  - Voices differ only in path, easing and texture; beat timing and order are the same in every family.
  - Demo controls, Demo Studio and the Motion voice picker are absent from product surfaces.
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: chat_motion_and_streaming_drift
reasoning_tier: high
context_scope: chat_streaming_motion
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - /mnt/Cursor/PuppetMaster-Evidence/chat-wow-20260926/jared-decisions-20260926-27.md
  - Concepts/chat-assistant-concepts/5.6 Pro/Chat updates.md
preserved_exact_tokens:
  - "Not in the working animation"
  - "removed when ported over to PMConcept7"
negative_constraints:
  - Do not place Stop inside the working activity.
  - Do not let a theme voice change beat timing or order.
  - Do not ship demo controls or a per-theme voice override as product settings.
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### DL-107 - Chat Sound Is On By Default With A One Click Mute

```yaml
plan_unit_id: DL-107
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared decided on 2026-09-26 ("Subtle, on by default") that the chat plays subtle sound cues,
  on by default, with a one-click mute. general.interaction.sound-effects defaults to on,
  superseding its "Off by default" description; the chat header speaker button is a shared
  chrome control bound to that same key, as the onboarding and Tour sound controls are; the
  chat's cues are events of the Notifications & Sounds owner; and sound is never the only
  signal. SSYS-039, F3-564 and ACD-475 carry the owner text.
gui_related: true
gui_classification_reason: Changes a user-visible setting default and adds a header mute control.
split_recommended: false
depends_on: [UCC-103]
unblocks: [SSYS-039, F3-564, ACD-475]
acceptance_criteria:
  - general.interaction.sound-effects defaults to on.
  - The chat header mute reads and writes general.interaction.sound-effects through the Settings owner and adds no second sound setting.
  - Every chat cue is paired with a visible change.
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: sound_default_drift
reasoning_tier: standard
context_scope: chat_sound
implementation_surfaces:
  - Plans/Settings_System.md
  - Plans/settings_inventory.json
  - Plans/FinalGUISpec.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - /mnt/Cursor/PuppetMaster-Evidence/chat-wow-20260926/jared-decisions-20260926-27.md
preserved_exact_tokens:
  - "Subtle, on by default"
  - "general.interaction.sound-effects"
negative_constraints:
  - Do not add a chat-only sound setting or volume.
  - Do not let a sound carry information alone.
owner_hints:
  - Plans/Settings_System.md
  - Plans/assistant-chat-design.md
```

### DL-108 - Sends Made While The Assistant Is Busy Queue By Default And Send Now Steers

```yaml
plan_unit_id: DL-108
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared decided on 2026-09-27 ("Keep both, default Queue") that general.interaction.queue-behavior
  defaults to Queue instead of Steer while the Steer/Queue switch stays, and that Send now on a
  queued message steers without stopping the answer, as ACD-219 says: the answer written so far
  stays with no Stopped marker. Recorded with it, restating section 4's rule that Stop does not
  clear the queue: the queue advances on its own only when a turn completes, and after a Stop or
  an error it waits for the user. ACD-471, F3-563, SSYS-039 and UCC-168 carry the owner text.
gui_related: true
gui_classification_reason: Changes the default busy-send behaviour and the Send now control.
split_recommended: false
depends_on: [ACD-219, ACD-228]
unblocks: [ACD-471, F3-563, SSYS-039, UCC-168]
acceptance_criteria:
  - general.interaction.queue-behavior defaults to Queue and still offers Steer.
  - Send now steers the queued message into the running turn without a Stop.
  - The queue advances automatically only on turn completion, never after Stop or an error.
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: busy_send_semantics_drift
reasoning_tier: high
context_scope: chat_queue
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Settings_System.md
  - Plans/settings_inventory.json
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - /mnt/Cursor/PuppetMaster-Evidence/chat-wow-20260926/jared-decisions-20260926-27.md
preserved_exact_tokens:
  - "Keep both, default Queue"
  - "general.interaction.queue-behavior"
  - "Send now"
negative_constraints:
  - Do not remove Steer or the Steer/Queue switch.
  - Do not make Send now stop the running answer.
  - Do not advance the queue after a Stop or an error.
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Settings_System.md
```

### DL-109 - Wand Module Surfaces Use The Theme's Own Font And Nothing Is Cramped

```yaml
plan_unit_id: DL-109
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared decided on 2026-09-27 (owner amendments J-1, "no new display face", and J-2, "nothing
  cramped") that every wand-module surface uses
  its theme's own font with no separate display face and no italic voice face, the voice roles
  differing only by size, weight and colour, and that the J-2 spacing minimums are a floor in every
  theme that padding and gaps never compress below. This decision does not change which font each
  theme's canon tokens name; canon typography adoption is a separate open question. FinalGUISpec
  F3-566 carries the owner text.
gui_related: true
gui_classification_reason: Sets the typography and spacing floor of the wand module surfaces.
split_recommended: false
depends_on: []
unblocks: [F3-566, DR-044]
acceptance_criteria:
  - Every wand-module surface renders in its theme's own font with no display face.
  - Every wand-module surface meets the J-2 minimums in all eight themes.
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: wand_surface_typography_or_crowding
reasoning_tier: standard
context_scope: wand_modules_gui
implementation_surfaces:
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/LEAD-PLAN.md
preserved_exact_tokens:
  - "J-1"
  - "J-2"
  - "no new display face"
  - "nothing cramped"
negative_constraints:
  - Do not add a display face to a wand-module surface.
  - Do not compress padding or gaps below the J-2 minimums.
  - Do not read this decision as changing canon theme font tokens.
owner_hints:
  - Plans/FinalGUISpec.md
```

### DL-110 - Back Seat Driver Shows Plain Status Words And The Plans Change To Match

```yaml
plan_unit_id: DL-110
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared decided on 2026-09-27 on card n01 (E-10), choosing "Plain words only, and change the Plans
  to match", that Back Seat Driver shows the plain status words "Up to date", "Double-checking" and
  "Paused: usage limit reached" in place of "Caught up", "Finding held" and "Quota paused", and that
  the Plans' exact status words are amended to match by supersession, not deletion.
gui_related: true
gui_classification_reason: Records an owner decision about back seat driver status presentation or behaviour.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - "Back Seat Driver status lines show the plain words, not the official word first."
  - The owner documents supersede the three official status words with the plain words.
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: bsd_status_word_drift
reasoning_tier: high
context_scope: back_seat_driver_status
implementation_surfaces:
  - Plans/Back_Seat_Driver.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards.json
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards-companion.json
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS.json
preserved_exact_tokens:
  - "E-10"
  - "Plain words only, and change the Plans to match"
  - "Up to date"
  - "Double-checking"
  - "Paused: usage limit reached"
negative_constraints:
  - Do not print the official status word before the plain words.
  - Do not delete the preserved official words without a superseding statement.
owner_hints:
  - Plans/Back_Seat_Driver.md
  - Plans/FinalGUISpec.md
```

### DL-111 - The Coordinator's Mark In A Crew Card Uses The Text Or Seat Colour Not The Accent

```yaml
plan_unit_id: DL-111
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared decided on 2026-09-27 on card n02 (E-17), choosing "Text or seat colour", that the
  Coordinator's mark in a running Crew card uses the text or seat colour and never the accent, with
  no exception recorded against the transcript accent budget.
gui_related: true
gui_classification_reason: Records an owner decision about crew card marks presentation or behaviour.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - "The Coordinator's mark in a running Crew card paints no accent colour in any theme."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: accent_budget_drift
reasoning_tier: standard
context_scope: crew_card_marks
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/DRY_Rules.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards.json
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards-companion.json
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS.json
preserved_exact_tokens:
  - "E-17"
  - "Text or seat colour"
negative_constraints:
  - "Do not add the Coordinator's mark as an accent-budget exception."
owner_hints:
  - Plans/FinalGUISpec.md
  - Plans/DRY_Rules.md
```

### DL-112 - A Chat Room Message Sent Mid Round Queues For The Next Round And Can Steer Without Interrupting

```yaml
plan_unit_id: DL-112
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared answered card n03 (E-18) on 2026-09-27 by denying the options with his own instruction, that
  a message typed into a Chat Room mid-round works like the normal chat: it is queued for the
  next round, and the user may send it immediately to steer without interrupting the round,
  consistent with DL-108; neither the refuse option nor the build-later wording is taken. Lead
  ruling applied 2026-09-27: "Send now" delivers the message into the current round as steering
  without interrupting it; the next speaker reads it first and every later speaker in that round
  sees it.
gui_related: true
gui_classification_reason: Records an owner decision about chat room rounds presentation or behaviour.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - A mid-round Chat Room message is queued for the next round by default.
  - The user can send a queued Chat Room message immediately to steer without stopping the round.
  - After Send now, the next speaker in the current round reads the message first and every later speaker in that round sees it.
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: chat_room_send_semantics
reasoning_tier: high
context_scope: chat_room_rounds
implementation_surfaces:
  - Plans/Collaborative_Workflows.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards.json
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards-companion.json
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS.json
preserved_exact_tokens:
  - "E-18"
  - "next round"
  - "Send now"
negative_constraints:
  - Do not refuse a Chat Room message because a round is in progress.
  - Do not let steering a Chat Room round interrupt or stop it.
owner_hints:
  - Plans/Collaborative_Workflows.md
  - Plans/assistant-chat-design.md
```

### DL-113 - Each Theme Family Gets Its Own Motion Personality For Popups And Chat Cards

```yaml
plan_unit_id: DL-113
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared decided on 2026-09-27 on card n04 (E-22), choosing
  "Each theme family gets its own motion personality", that popups and chat cards animate with a
  motion personality per theme family rather than one motion everywhere with a Retro exception, and
  Reduce Motion stays instant in every family. Lead ruling applied 2026-09-27: the personalities
  align with the transcript's motion voices (Basic: ink; Friendly: hop; Glass: depth; Retro: type);
  canon states the principle, and the per-family duration and easing values are the foundation's
  tokens, recorded at the concept's closing step (FinalGUISpec F3-566).
gui_related: true
gui_classification_reason: Records an owner decision about theme motion presentation or behaviour.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - Each theme family has its own named motion rules for popups and chat cards.
  - "Each family's popup and card motion matches its transcript motion voice: Basic ink, Friendly hop, Glass depth, Retro type."
  - "Reduce Motion overrides every family's motion with instant changes."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: theme_motion_drift
reasoning_tier: high
context_scope: theme_motion
implementation_surfaces:
  - Plans/Collaborative_Workflows.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards.json
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards-companion.json
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS.json
preserved_exact_tokens:
  - "E-22"
  - "Each theme family gets its own motion personality"
  - "motion personality"
  - "Basic: ink; Friendly: hop; Glass: depth; Retro: type"
negative_constraints:
  - Do not ship one identical motion for every theme family.
  - Do not treat the Retro-only exception as the decided rule.
owner_hints:
  - Plans/Collaborative_Workflows.md
  - Plans/FinalGUISpec.md
```

### DL-114 - Setup Popups Keep The Blur Only If Slint 1.18.1 Can Draw It Otherwise They Are Solid

```yaml
plan_unit_id: DL-114
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared answered card n05 (E-24) on 2026-09-27 by denying the options with his own instruction, that
  the setup popups use the extra blur if Slint 1.18.1 no longer has the backdrop-blur limitation and
  are solid if it still does. The check was recorded on 2026-09-27 (resolved: solid): Slint 1.18.1
  still cannot draw a blur behind a popup (slint-ui/slint#13502 closed as a duplicate of the open
  #612; #2066 still open), so the setup popups are solid over a flat scrim, Glass keeps its
  near-opaque glass-coloured panel, and F3-431's blur budget stays closed (FinalGUISpec F3-566). Outcome replaced on
  2026-10-01 by DL-139: the setup popups (F3-566 sheets) are frosted glass on the Skia GPU path through Puppet
  Master's own Skia renderer extension (F3-582) and solid on the Skia CPU raster; the scrim stays a flat tint and
  F3-431's blur budget admits this one sheet blur only.
gui_related: true
gui_classification_reason: Records an owner decision about popup surfaces presentation or behaviour.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - A recorded check states whether Slint 1.18.1 can draw a blur behind a popup.
  - The setup popups are blurred if the check passes and solid if it fails.
  - As recorded on 2026-09-27 the check failed; DL-139 (2026-10-01) replaces that outcome, so setup popups are frosted on the Skia GPU path and solid on the Skia CPU raster, and no scrim uses a backdrop blur.
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: popup_surface_backend_drift
reasoning_tier: high
context_scope: popup_surfaces
implementation_surfaces:
  - Plans/Collaborative_Workflows.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards.json
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards-companion.json
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS.json
preserved_exact_tokens:
  - "E-24"
  - "Slint 1.18.1"
negative_constraints:
  - Do not canonize blurred or solid popups before the Slint 1.18.1 check is recorded.
  - Do not add a backdrop blur to the scrim, or to a setup popup on the Skia CPU raster (DL-139).
  - "Do not read the recorded check as permanent: DL-139 reopened it on 2026-10-01 through Puppet Master's own Skia extension (F3-582)."
owner_hints:
  - Plans/Collaborative_Workflows.md
  - Plans/FinalGUISpec.md
```

### DL-115 - Reduce Motion Means Instant

```yaml
plan_unit_id: DL-115
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared decided on 2026-09-27 on card n06 (E-25), choosing "Instant", that Reduce Motion means
  instant changes, as the Plans already state, and that the design's 0.12-second fade is not carried
  into canon.
gui_related: true
gui_classification_reason: Records an owner decision about reduced motion presentation or behaviour.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - "With Reduce Motion on, popups and chat cards change state with no transition."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: reduce_motion_drift
reasoning_tier: standard
context_scope: reduced_motion
implementation_surfaces:
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards.json
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards-companion.json
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS.json
preserved_exact_tokens:
  - "E-25"
  - "Instant"
negative_constraints:
  - Do not replace instant changes with a short fade under Reduce Motion.
owner_hints:
  - Plans/FinalGUISpec.md
```

### DL-116 - Applied Taught Rules Are Reported As Followed And The Plans Define What Counts As Following

```yaml
plan_unit_id: DL-116
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared decided on 2026-09-27 on card n07 (E-36), choosing
  ""Followed", and define what counts as following", that the note for applied taught rules says
  "Followed" rather than "Used", and that the Plans must define what counts as following, since
  inclusion of a rule in the prompt alone does not prove it was obeyed. Lead ruling applied
  2026-09-27: a rule counts as followed when it was given to the assistant and the finished reply
  passed that rule's check (the rule's testable statement compared with the reply); a failed check
  shows "Missed 1 of your rules" with a way to see which and ask for a fix; if no check could run,
  no tick.
gui_related: true
gui_classification_reason: Records an owner decision about teach receipts presentation or behaviour.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - The applied-rules note uses the word Followed.
  - The owner document defines the evidence that makes a rule count as followed.
  - A rule counts as followed only when it was given to the assistant and the finished reply passed that rule's check.
  - "A failed check shows Missed 1 of your rules with a way to see which and ask for a fix; with no check run, no tick shows."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: memory_claim_truthfulness
reasoning_tier: high
context_scope: teach_receipts
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/assistant-memory-subsystem.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards.json
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards-companion.json
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS.json
preserved_exact_tokens:
  - "E-36"
  - "\"Followed\", and define what counts as following"
  - "Followed"
  - "Missed 1 of your rules"
negative_constraints:
  - "Do not report a rule as followed merely because it was included in the prompt, once the definition exists."
  - Do not change the word to Used.
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/assistant-memory-subsystem.md
```

### DL-117 - Review's Setup Offers Team Presets

```yaml
plan_unit_id: DL-117
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared decided on 2026-09-27 on card n08 (E-37), choosing
  "Add presets (say which, e.g. "Security + Bugs + Tests")", that Review's setup offers
  Start from a team presets like the other three kinds rather than hiding the control. Lead ruling
  applied 2026-09-27: the presets that ship are "Careful review · Security, Bugs and Tests (3
  reviewers)" (the default), "Quick check · one reviewer" and "Deep audit · 5 reviewers, one of them
  a Critical Advisor".
gui_related: true
gui_classification_reason: Records an owner decision about review setup presentation or behaviour.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - "Review's setup shows a Start from a team control with at least one preset."
  - "Review offers Careful review (the default), Quick check and Deep audit."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: review_preset_gap
reasoning_tier: high
context_scope: review_setup
implementation_surfaces:
  - Plans/Collaborative_Workflows.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards.json
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards-companion.json
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS.json
preserved_exact_tokens:
  - "E-37"
  - "Add presets (say which, e.g. \"Security + Bugs + Tests\")"
  - "Start from a team"
  - "Careful review"
  - "Quick check"
  - "Deep audit"
negative_constraints:
  - Do not hide the Start from a team control on Review.
  - "Do not treat the card's example as the owner's chosen preset list."
owner_hints:
  - Plans/Collaborative_Workflows.md
```

### DL-118 - The Two Recovery Buttons Use The Plans' Words Retry And Recover

```yaml
plan_unit_id: DL-118
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared decided on 2026-09-27 on card n09 (E-38 (now)), choosing "Use "Retry" and "Recover"", that
  the two buttons labelled "Try again" and "Open recovery" in the design use the Plans' command
  words "Retry" and "Recover", with no amendment to the Plans.
gui_related: true
gui_classification_reason: Records an owner decision about command labels presentation or behaviour.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - The two buttons read Retry and Recover.
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: command_label_drift
reasoning_tier: standard
context_scope: command_labels
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards.json
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards-companion.json
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS.json
preserved_exact_tokens:
  - "E-38"
  - "Use \"Retry\" and \"Recover\""
  - "Retry"
  - "Recover"
negative_constraints:
  - Do not amend the Retry or Recover command labels in the Plans.
owner_hints:
  - Plans/UI_Command_Catalog.md
```

### DL-119 - Review And BrainStorm Keep Their Plans Entry Points And The Plans Gain Crew Auto Settings

```yaml
plan_unit_id: DL-119
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared decided on 2026-09-27 on card p01 (E-01), choosing "Plans unchanged, except add "Crew Auto
  settings…"", that the Plans keep Review under the Mode menu and BrainStorm under Deep Plan, add a
  "Crew Auto settings…" row without renaming "Manage Defaults…", and that the concept's own wand
  rows stand only until the PMConcept7 port, where the Mode menu opens these popups.
gui_related: true
gui_classification_reason: Records an owner decision about wand menu presentation or behaviour.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - The owner documents list a Crew Auto settings… row.
  - The owner documents give Review and BrainStorm no wand rows.
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: wand_entry_point_drift
reasoning_tier: standard
context_scope: wand_menu
implementation_surfaces:
  - Plans/Collaborative_Workflows.md
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards.json
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards-companion.json
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS.json
preserved_exact_tokens:
  - "E-01"
  - "Plans unchanged, except add \"Crew Auto settings…\""
  - "Crew Auto settings…"
negative_constraints:
  - Do not add Review or BrainStorm wand rows to the Plans.
  - Do not rename Manage Defaults… to Crew Auto settings….
owner_hints:
  - Plans/Collaborative_Workflows.md
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/UI_Command_Catalog.md
```

### DL-120 - Crews Are Summonable By The Agent And Crew Auto Is The Project Wide Default That Lets It Use Them

```yaml
plan_unit_id: DL-120
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared answered card p02 (E-02) on 2026-09-27 by denying the options with his own instruction, that
  Crews are summonable by the agent and usable to build plans, that Crew Auto tells the agent it may
  use Crews when it wants or needs them, and that turning Crew Auto off in the project-wide settings
  stops it from being on by default. Lead ruling applied 2026-09-27: Crew Auto is the permission for
  the assistant to start a Crew by itself when it needs one; it is on by default at project level
  (the settings key's default is a Settings follow-up, outside this compile); a chat's Crew Auto
  check overrides the project default for that chat; the assistant may start a Crew only when Crew
  Auto is on and the evaluator (CWR-021) admits the request, so the evaluator remains the gate;
  "Build With Crew" on a Plan stays a user choice; and the separate per-chat
  "Allow Crews in this chat" switch is retired into the Crew Auto check.
gui_related: true
gui_classification_reason: Records an owner decision about crew auto presentation or behaviour.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - "The owner documents describe Crew Auto as the agent's permission to summon a Crew."
  - Turning Crew Auto off project-wide makes it off by default in new chats.
  - "A chat's Crew Auto check overrides the project default for that chat."
  - "The assistant starts a Crew by itself only when Crew Auto is on and the CWR-021 evaluator admits the request."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: crew_permission_scope_drift
reasoning_tier: high
context_scope: crew_auto
implementation_surfaces:
  - Plans/Collaborative_Workflows.md
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards.json
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards-companion.json
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS.json
preserved_exact_tokens:
  - "E-02"
  - "summonable by the agent"
  - "Allow Crews in this chat"
negative_constraints:
  - Do not describe Crew as an On/Off switch the user must flip to start a Crew.
  - "Do not remove the agent's ability to summon a Crew when Crew Auto allows it."
owner_hints:
  - Plans/Collaborative_Workflows.md
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### DL-121 - Start Is Blocked Until The User Picks A Replacement For An Offline Model

```yaml
plan_unit_id: DL-121
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared decided on 2026-09-27 on card p03 (E-03), choosing "Always block Start until you pick a
  replacement", that when a chosen model is offline Start is always blocked until the user picks a
  replacement, with no automatic same-provider stand-in and no substitution policy in the saved
  setup, resolving the Plans' contradiction in favour of the blocking rule.
gui_related: true
gui_classification_reason: Records an owner decision about collaboration start presentation or behaviour.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - Start stays disabled while any chosen model is offline and unreplaced.
  - Start enables once the user picks a replacement.
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: model_substitution_drift
reasoning_tier: standard
context_scope: collaboration_start
implementation_surfaces:
  - Plans/Collaborative_Workflows.md
  - Plans/Models_System.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards.json
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards-companion.json
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS.json
preserved_exact_tokens:
  - "E-03"
  - "Always block Start until you pick a replacement"
  - "Always block Start"
negative_constraints:
  - Do not substitute another model for an offline chosen model automatically.
  - Do not add a substitution policy to the saved setup.
owner_hints:
  - Plans/Collaborative_Workflows.md
  - Plans/Models_System.md
```

### DL-122 - Activity Shows A Short Team List For The Four Collaboration Kinds And Back Seat Driver

```yaml
plan_unit_id: DL-122
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared decided on 2026-09-27 on card p04 (E-04), choosing "Allow the short list for these", that
  Activity shows a short team list for Crew, Chat Room, BrainStorm and Review and a compact form for
  Back Seat Driver's details, with the full detail in the run view, as a scoped exception to the
  2026-09-08 rollback that applies to these five only. DL-147 (2026-10-08) adds the To-Do rows as a
  second scoped exception (one-line checklist rows inside the native panel, FinalGUISpec F3-593).
gui_related: true
gui_classification_reason: Records an owner decision about activity detail presentation or behaviour.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - Activity renders the short team list for the four collaboration kinds and Back Seat Driver.
  - Every other Activity surface keeps the native cards and grids of the 2026-09-08 rollback, apart from the To-Do rows of DL-147.
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: activity_rollback_scope
reasoning_tier: standard
context_scope: activity_detail
implementation_surfaces:
  - Plans/Collaborative_Workflows.md
  - Plans/Back_Seat_Driver.md
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards.json
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards-companion.json
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS.json
preserved_exact_tokens:
  - "E-04"
  - "Allow the short list for these"
negative_constraints:
  - Do not widen the exception beyond the four collaboration kinds and Back Seat Driver.
owner_hints:
  - Plans/Collaborative_Workflows.md
  - Plans/Back_Seat_Driver.md
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### DL-123 - A Collapsed Or Narrow Run Card May Move Its Actions Behind Expand And Its Helper Count Into A Hover Card

```yaml
plan_unit_id: DL-123
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared decided on 2026-09-27 on card p05 (E-05), choosing "Allow it", that a collapsed or narrow
  run card may put Open Panel, Message and More behind Expand and the helper count in the hover
  card, and that a finished run's Message button shows why it is disabled, amending the Plans'
  always-shown list.
gui_related: true
gui_classification_reason: Records an owner decision about run card density presentation or behaviour.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - "A collapsed or narrow run card reaches Open Panel, Message and More through Expand."
  - "A finished run's Message button states its disabled reason."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: card_density_contract
reasoning_tier: standard
context_scope: run_card_density
implementation_surfaces:
  - Plans/Collaborative_Workflows.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards.json
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards-companion.json
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS.json
preserved_exact_tokens:
  - "E-05"
  - "Allow it"
negative_constraints:
  - Do not drop an action from a collapsed card without an Expand path to it.
owner_hints:
  - Plans/Collaborative_Workflows.md
  - Plans/FinalGUISpec.md
```

### DL-124 - Screens Say Helpers And The Data Keeps Participant

```yaml
plan_unit_id: DL-124
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared decided on 2026-09-27 on card p06 (E-06), choosing ""Helpers" on screen", that screens say
  "helpers" (and "reviewers" for Review) instead of "participants", while the data keeps the field
  name participant, and that the Plans' examples and the composer label change to match.
gui_related: true
gui_classification_reason: Records an owner decision about collaboration copy presentation or behaviour.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - "User-facing text says helpers or reviewers, never participants."
  - Data contracts keep participant.
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: terminology_drift
reasoning_tier: standard
context_scope: collaboration_copy
implementation_surfaces:
  - Plans/Collaborative_Workflows.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards.json
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards-companion.json
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS.json
preserved_exact_tokens:
  - "E-06"
  - "\"Helpers\" on screen"
  - "participant"
negative_constraints:
  - Do not rename the participant field in data contracts.
owner_hints:
  - Plans/Collaborative_Workflows.md
```

### DL-125 - Send Findings To Agent Fills The Message Box Instead Of Sending

```yaml
plan_unit_id: DL-125
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared decided on 2026-09-27 on card p07 (E-07), choosing "Fill the message box", that Send
  Findings To Agent fills the message box with an editable fix request and sends nothing until the
  user presses Send, changing the existing command's result and refusal and adding a lineage field.
gui_related: true
gui_classification_reason: Records an owner decision about review findings presentation or behaviour.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - Send Findings To Agent leaves an editable request in the message box and starts no turn.
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: command_semantics_change
reasoning_tier: standard
context_scope: review_findings
implementation_surfaces:
  - Plans/Collaborative_Workflows.md
  - Plans/assistant-chat-design.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards.json
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards-companion.json
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS.json
preserved_exact_tokens:
  - "E-07"
  - "Fill the message box"
  - "Send Findings To Agent"
negative_constraints:
  - Do not send the findings request without the user pressing Send.
owner_hints:
  - Plans/Collaborative_Workflows.md
  - Plans/assistant-chat-design.md
  - Plans/UI_Command_Catalog.md
```

### DL-126 - ELI5 Has A Project Default That A Chat Can Override And Switching It Never Rewrites A Reply

```yaml
plan_unit_id: DL-126
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared answered card p08 (E-11) on 2026-09-27 by asking a question back: he stated his original
  intent (a project-level default with a per-chat toggle that changes only that chat) and asked
  whether that would require two responses or a resent response when toggled. Owner resolution
  (Jared, 2026-09-27, confirmed in chat): ELI5 keeps a project-level default that applies everywhere
  in the project, and the ELI5 control in a chat overrides it for that chat only. Switching ELI5
  changes only replies written after the switch; it never re-sends, regenerates or rewrites an
  earlier reply, so a switch never produces a second response. Each finished assistant reply may
  offer "Explain this reply simply", which writes one extra reply, a simpler explanation of that
  reply, only when the user asks. Following the recommendation for parts 1 and 3, ELI5 is its own
  small popup (sheet) with the quick dot by the message box as the one-click on and off, and Expert
  and ELI5 dual copy exists only for tooltips and help. Compile details written by the design lead
  and the canon compile on 2026-09-27, not part of the recorded confirmation: the resolution order
  is the chat override, else the project default, else the app default; Explain this reply simply is
  refused while that reply is still streaming; the guided tour is re-pointed from the old toggle to
  the popup and the dot (the card's cost line); the commands are cmd.chat.eli5.set (on|off|inherit,
  inherit deleting the chat override) and cmd.chat.eli5.explain_reply. The project scope on the
  existing ELI5 default setting (general.interaction.eli5-default; per-chat override
  general.interaction.chat-eli5) is a Settings follow-up, out of scope for the wand-modules compile.
gui_related: true
gui_classification_reason: Records an owner decision about eli5 presentation or behaviour.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - "A chat's ELI5 state resolves as the chat override, else the project default, else the app default."
  - "Switching ELI5 never re-sends, regenerates or rewrites a reply written before the switch."
  - "Explain this reply simply writes exactly one extra reply, only when the user asks, and is refused while the target reply is streaming."
  - "ELI5 is a popup (sheet) with the quick dot by the message box as the one-click on and off, and the guided tour points to them."
  - "Expert and ELI5 dual copy appears only in tooltips and help."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: eli5_scope_and_rewrite
reasoning_tier: high
context_scope: eli5
implementation_surfaces:
  - Plans/Collaborative_Workflows.md
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/UI_Command_Catalog.md
  - Plans/Settings_System.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards.json
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards-companion.json
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS.json
  - "ANSWERS-20260927-final.json answer record p08, ask_resolved (SHA-256 33d13386f28fc5f667fd1df85ba9cb70eefff7eb43c92723e14cefa08237aaf5, /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS-20260927-final.json; Jared confirmed the lead's answer in chat on 2026-09-27)"
preserved_exact_tokens:
  - "E-11"
  - "project-level"
  - "two responses"
  - "Explain this reply simply"
  - "cmd.chat.eli5.set"
  - "cmd.chat.eli5.explain_reply"
negative_constraints:
  - "Do not re-send, regenerate or rewrite an earlier reply when ELI5 is switched."
  - "Do not write more than one extra reply for one Explain this reply simply request."
  - "Do not give every helper line an Expert and an ELI5 version; dual copy is for tooltips and help only."
  - "Do not edit Settings documents from this entry; the project scope on the ELI5 default is a Settings follow-up."
owner_hints:
  - Plans/Collaborative_Workflows.md
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/UI_Command_Catalog.md
  - Plans/Settings_System.md
```

### DL-127 - Teach Opens The Teach Popup Everywhere

```yaml
plan_unit_id: DL-127
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared decided on 2026-09-27 on card p09 (E-12), choosing "The popup everywhere", that /teach and
  the wand both open the Teach popup, prefilled from what was typed, superseding the Plans' in-chat
  capture card with no capture card planned for later.
gui_related: true
gui_classification_reason: Records an owner decision about teach presentation or behaviour.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - Typing /teach opens the Teach popup prefilled from the typed text.
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: teach_entry_drift
reasoning_tier: standard
context_scope: teach
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards.json
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards-companion.json
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS.json
preserved_exact_tokens:
  - "E-12"
  - "The popup everywhere"
  - "/teach"
negative_constraints:
  - Do not add an in-chat capture card for /teach.
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/UI_Command_Catalog.md
```

### DL-128 - The Coordinator Writes Each Crew Part's Done When And Must Finish First

```yaml
plan_unit_id: DL-128
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared decided on 2026-09-27 on card p10 (E-14), choosing "The Coordinator writes them", that the
  Coordinator writes each Crew part's what-done-looks-like and what-must-finish-first when it splits
  the job, shown and questionable in the run view, superseding the Plans' setup fields for them.
gui_related: true
gui_classification_reason: Records an owner decision about crew planning presentation or behaviour.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - "The run view shows each part's Coordinator-written done criteria and prerequisites."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: crew_spec_authorship
reasoning_tier: standard
context_scope: crew_planning
implementation_surfaces:
  - Plans/Collaborative_Workflows.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards.json
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards-companion.json
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS.json
preserved_exact_tokens:
  - "E-14"
  - "The Coordinator writes them"
negative_constraints:
  - Do not add done-criteria or prerequisite fields to the Crew setup popup.
owner_hints:
  - Plans/Collaborative_Workflows.md
```

### DL-129 - The Live Run Line And Per Reply Files Row Replace The Old Summary Above The Message Box

```yaml
plan_unit_id: DL-129
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared decided on 2026-09-27 on card p13 (E-27), choosing "Replace the old summary", that the
  live-run line and the per-reply files row replace the Plans' footer summary above the message box,
  and that the chat's total file count moves to Activity.
gui_related: true
gui_classification_reason: Records an owner decision about composer footer presentation or behaviour.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - Nothing but the live-run line sits above the message box for collaboration state.
  - "Activity shows the chat's total file count."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: composer_chrome_stacking
reasoning_tier: standard
context_scope: composer_footer
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards.json
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards-companion.json
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS.json
preserved_exact_tokens:
  - "E-27"
  - "Replace the old summary"
negative_constraints:
  - Do not keep the old footer summary alongside the live-run line.
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### DL-130 - All Seven New Commands Are Added

```yaml
plan_unit_id: DL-130
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared decided on 2026-09-27 on card p15 (E-32), choosing "Add all seven", that all seven new
  commands are registered: End discussion, Dismiss advice, Don't wait, Turn off a rule, Lock a rule,
  Export memory and the Wonderer's Check it, with none left demo-only.
gui_related: true
gui_classification_reason: Records an owner decision about command catalog presentation or behaviour.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - The command catalog registers all seven commands.
  - No popup button among them is demo-only.
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: command_catalog_gap
reasoning_tier: standard
context_scope: command_catalog
implementation_surfaces:
  - Plans/Collaborative_Workflows.md
  - Plans/Back_Seat_Driver.md
  - Plans/assistant-chat-design.md
  - Plans/assistant-memory-subsystem.md
  - Plans/UI_Command_Catalog.md
  - Plans/Commands_System.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards.json
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards-companion.json
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS.json
preserved_exact_tokens:
  - "E-32"
  - "Add all seven"
  - "End discussion"
  - "Dismiss advice"
  - "Don't wait"
  - "Export memory"
  - "Check it"
negative_constraints:
  - Do not leave Export memory or Check it as demo-only controls.
owner_hints:
  - Plans/Collaborative_Workflows.md
  - Plans/Back_Seat_Driver.md
  - Plans/assistant-chat-design.md
  - Plans/assistant-memory-subsystem.md
  - Plans/UI_Command_Catalog.md
  - Plans/Commands_System.md
```

### DL-131 - A Crew's Own Time And Cost Limit Overrides The General Run Limit

```yaml
plan_unit_id: DL-131
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared decided on 2026-09-27 on card p16 (E-33), choosing
  "The Crew's own limit overrides the general one", that a Crew's own time and cost limit overrides
  the app's general run limit rather than the tighter limit winning. Lead ruling applied 2026-09-27:
  the kind's own limit applies to every collaboration kind (they share one limit row), and a run
  that reaches its own limit ends as stopped with the reason "Stopped at your limit", a stop reason,
  not a new state: it settles in the existing terminal state cancelled, never failed, with
  stop_reason limit_time, limit_cost or limit_tokens (Collaborative_Workflows CWR-029).
gui_related: true
gui_classification_reason: Records an owner decision about run limits presentation or behaviour.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - "A Crew run's effective time and cost limit is the Crew's own limit when one is set."
  - "Every collaboration kind applies its own limit from the shared limit row."
  - "A run that reaches its own limit ends as stopped with the reason Stopped at your limit."
  - "That run settles in the terminal state cancelled with stop_reason limit_time, limit_cost or limit_tokens, never failed and never a new state."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: run_limit_precedence
reasoning_tier: high
context_scope: run_limits
implementation_surfaces:
  - Plans/Collaborative_Workflows.md
  - Plans/usage-feature.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards.json
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards-companion.json
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS.json
preserved_exact_tokens:
  - "E-33"
  - "The Crew's own limit overrides the general one"
  - "Stopped at your limit"
negative_constraints:
  - "Do not clamp a Crew's own limit to the general run limit."
  - "Do not add a limit-reached run state; the limit is a stop reason on a stopped run."
owner_hints:
  - Plans/Collaborative_Workflows.md
  - Plans/usage-feature.md
```

### DL-132 - This Chat's Assistant Checks The Work Of A Helper Who Is Also The Coordinator

```yaml
plan_unit_id: DL-132
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared decided on 2026-09-27 on card p17 (E-34), choosing "This chat's assistant", that when a
  helper is also the Coordinator, this chat's assistant checks that helper's own part, preserving
  the rule that no one approves their own work.
gui_related: false
gui_classification_reason: "Records an owner decision about crew review behaviour, not UI presentation."
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - "A Coordinator-helper's own part is reviewed by the chat's assistant."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: self_approval
reasoning_tier: standard
context_scope: crew_review
implementation_surfaces:
  - Plans/Collaborative_Workflows.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards.json
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards-companion.json
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS.json
preserved_exact_tokens:
  - "E-34"
  - "This chat's assistant"
negative_constraints:
  - Do not let a Coordinator approve its own part.
owner_hints:
  - Plans/Collaborative_Workflows.md
```

### DL-133 - The Team Preset Personas Are Registered For Team Use And Grill Me Is A Skill

```yaml
plan_unit_id: DL-133
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared decided on 2026-09-27 on card p18 (E-35), choosing "Register them; Grill Me is a skill",
  that Product Manager, Architect, Implementer, Reviewer, Critical Advisor and Wonderer are
  registered as Personas for team use and that Grill Me is a methodology skill, not a Persona.
gui_related: false
gui_classification_reason: "Records an owner decision about personas behaviour, not UI presentation."
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - The Persona registry lists the six Personas as usable in collaboration teams.
  - "Grill Me is registered as a skill, not a Persona."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: persona_registry_gap
reasoning_tier: standard
context_scope: personas
implementation_surfaces:
  - Plans/Collaborative_Workflows.md
  - Plans/Personas.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards.json
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards-companion.json
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS.json
preserved_exact_tokens:
  - "E-35"
  - "Register them; Grill Me is a skill"
  - "Critical Advisor"
negative_constraints:
  - Do not register Grill Me as a Persona.
owner_hints:
  - Plans/Collaborative_Workflows.md
  - Plans/Personas.md
```

### DL-134 - Three Official Labels Change To Friendlier Words And Two Data Words Get Plain Display Words

```yaml
plan_unit_id: DL-134
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared decided on 2026-09-27 on card p19 (E-38 (Plans)), choosing "Yes to all of it", that "Name it
  for me" replaces Regenerate Title, "Write the plan" replaces Synthesize and "Save as default"
  replaces Save as Default, and that Gist Review and frozen target pack keep their data words while
  the screen shows "Notes it took" and "snapshot".
gui_related: true
gui_classification_reason: Records an owner decision about command labels presentation or behaviour.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - "The three labels read Name it for me, Write the plan and Save as default."
  - Data keeps Gist Review and frozen target pack while the screen shows Notes it took and snapshot.
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: command_label_drift
reasoning_tier: high
context_scope: command_labels
implementation_surfaces:
  - Plans/Collaborative_Workflows.md
  - Plans/assistant-chat-design.md
  - Plans/assistant-memory-subsystem.md
  - Plans/FinalGUISpec.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards.json
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards-companion.json
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS.json
preserved_exact_tokens:
  - "E-38"
  - "Yes to all of it"
  - "Name it for me"
  - "Write the plan"
  - "Save as default"
  - "Notes it took"
  - "snapshot"
negative_constraints:
  - Do not rename Gist Review or frozen target pack in data contracts.
  - "Do not drop the old labels' preserved tokens without a superseding statement."
owner_hints:
  - Plans/Collaborative_Workflows.md
  - Plans/assistant-chat-design.md
  - Plans/assistant-memory-subsystem.md
  - Plans/FinalGUISpec.md
  - Plans/UI_Command_Catalog.md
```

### DL-135 - Crew Auto Leaves A One Line Note In The Chat Worded For The Project

```yaml
plan_unit_id: DL-135
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared decided on 2026-09-27 on card p11 (E-15), choosing "Keep the note, worded for the project",
  that turning Crew Auto on leaves a one-line note in the chat worded for the project,
  "Crew Auto is on for this project", so the user can see when it changed, even though Crew Auto is
  a project-wide setting. Lead ruling applied 2026-09-27: Collaborative Workflows owns the note,
  beside the Crew Auto evaluator (CWR-021) and the Crew Auto permission of DL-120. The note is for
  turning Crew Auto on for the project, the setting the card asked about; a chat's own Crew Auto
  check (the per-chat override of DL-120) and saving rules while Crew Auto is already on for the
  project add no note (Collaborative_Workflows CWR-038).
gui_related: true
gui_classification_reason: Records an owner decision about crew auto presentation or behaviour.
split_recommended: false
depends_on: [DL-120]
unblocks: []
acceptance_criteria:
  - "Turning Crew Auto on for the project leaves one line in the chat worded for the project."
  - "Changing one chat's Crew Auto check, or saving rules while Crew Auto is already on for the project, adds no note."
  - "The note's owner is Plans/Collaborative_Workflows.md."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: crew_auto_chat_record
reasoning_tier: standard
context_scope: crew_auto
implementation_surfaces:
  - Plans/Collaborative_Workflows.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards.json
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards-companion.json
  - "ANSWERS.json answer record p11 (SHA-256 d08c3551305290fafe43acaffd78d43f9f8d9cdb00a87e4d21bb34603a61969d, answered 2026-09-27T21:37:48Z; the /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS.json copy predates it)"
preserved_exact_tokens:
  - "E-15"
  - "Keep the note, worded for the project"
  - "Crew Auto is on for this project"
negative_constraints:
  - "Do not drop the note when Crew Auto is turned on for the project."
  - "Do not add more than one line to the chat for a Crew Auto change."
owner_hints:
  - Plans/Collaborative_Workflows.md
  - Plans/UI_Command_Catalog.md
```

### DL-136 - A Project Wide Pause All Automations Switch Stops Every Scheduled Send And Build Until The User Turns It Back On

```yaml
plan_unit_id: DL-136
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared decided on 2026-09-27 on card p12 (E-19), approving "Build a project-wide pause" in chat,
  that there is one project-wide switch: "One switch that stops every scheduled send and build until
  you turn it back on." It is a manual stop: turning it on latches a stop at project scope by
  advancing the user_stop_epoch the way Manual Stop does, so every scheduled send and scheduled build
  in the project fails its dispatch check while it is on. Only the user clears it, by turning it off;
  no automatic mechanism (quota reset, window opening, schedule time, Goal, Plan or Crew continuation)
  clears or bypasses it, and creating a new schedule while it is on does not clear it. The command is
  cmd.runtime.automation_pause.set, project-scoped, payload paused true or false. Cost: "A new command
  and a little runtime work."
gui_related: true
gui_classification_reason: Records an owner decision about automation pause presentation or behaviour.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - "Turning the switch on stops every scheduled send and scheduled build in the project at dispatch."
  - "Only a user turning the switch off clears it; no automatic mechanism clears or bypasses it."
  - "The switch is set by cmd.runtime.automation_pause.set with paused true or false."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: automation_manual_stop_precedence
reasoning_tier: high
context_scope: automation_pause
implementation_surfaces:
  - Plans/Scheduling_and_Quota_Resume.md
  - Plans/UI_Command_Catalog.md
  - Plans/Commands_System.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards.json
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards-companion.json
  - "ANSWERS-20260927-final.json answer record p12 (SHA-256 33d13386f28fc5f667fd1df85ba9cb70eefff7eb43c92723e14cefa08237aaf5, /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS-20260927-final.json; approved in chat on 2026-09-27)"
preserved_exact_tokens:
  - "E-19"
  - "Build a project-wide pause"
  - "One switch that stops every scheduled send and build until you turn it back on."
  - "cmd.runtime.automation_pause.set"
  - "user_stop_epoch"
negative_constraints:
  - "Do not let a quota reset, window opening, schedule time or Goal, Plan or Crew continuation clear or bypass the project-wide pause."
  - "Do not clear the project-wide pause except by a user turning it off."
owner_hints:
  - Plans/Scheduling_and_Quota_Resume.md
  - Plans/UI_Command_Catalog.md
  - Plans/Commands_System.md
```

### DL-137 - Each Helper's Line In A Running Card Streams What The Helper Is Writing Reusing The Reply Streaming

```yaml
plan_unit_id: DL-137
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared decided on 2026-09-27 on card p14 (E-31), approving "Add live streaming for helpers (reuse
  the reply streaming)" in chat, that each helper's line in a running collaboration card shows what
  the helper is writing, live, word by word, reusing the assistant reply streaming that the Chat WOW
  canon defined (EP-128 "Assistant turn presentation stream", DL-104 to DL-108, ACD-469 to ACD-475)
  rather than a second streaming model. The finished message still lands once, as a whole message;
  the streamed text is presentation of a message in progress, never a second record.
gui_related: true
gui_classification_reason: Records an owner decision about helper streaming presentation or behaviour.
split_recommended: false
depends_on: [DL-104, DL-105, DL-106, DL-107, DL-108]
unblocks: []
acceptance_criteria:
  - "A running helper's line shows its text live, word by word."
  - "Helper streaming reuses EP-128 and defines no second streaming model."
  - "The finished helper message is recorded once, as a whole message; streamed text is never a second record."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: helper_stream_record_duplication
reasoning_tier: high
context_scope: helper_streaming
implementation_surfaces:
  - Plans/Collaborative_Workflows.md
  - Plans/Executor_Protocol.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards.json
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards-companion.json
  - "ANSWERS-20260927-final.json answer record p14 (SHA-256 33d13386f28fc5f667fd1df85ba9cb70eefff7eb43c92723e14cefa08237aaf5, /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS-20260927-final.json; approved in chat on 2026-09-27)"
preserved_exact_tokens:
  - "E-31"
  - "Add live streaming for helpers (reuse the reply streaming)"
  - "EP-128"
negative_constraints:
  - "Do not record streamed helper text as a second message or record."
  - "Do not define a helper streaming model separate from EP-128."
owner_hints:
  - Plans/Collaborative_Workflows.md
  - Plans/Executor_Protocol.md
  - Plans/assistant-chat-design.md
```

### DL-138 - Approved Wand Modules Answers And Theme Fonts

```yaml
plan_unit_id: DL-138
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  DL-138 records the following owner decisions. Jared answered all 29 distinct wand-modules questions (33 ledger
  question records) on 2026-09-29 with their recommended options, including engineering defaults and follow-up routing,
  and amended question 22 to include both NieR Mode fonts. The answer source is the owner authorization for this
  compile. Jared said: "I agree with all your recommended for the 29 questions, except I added that there were 2
  more fonts added with nier mode that needed to be added to the spec from PMConcept7. I want codex to handle those
  questions too. When it finishes everything, it should do the snapshot. As for going forward, it should be after
  plan changes."


  1. Advisor pause state: Persist paused with a user or safety cause so Resume has a real state to validate.

  2. Advisor composer status: Show Reviewing while a finding is being double-checked; Double-checking stays in Context.

  3. Late critical finding: Use finding state emitted, retain stale and unreconfirmed data, print not re-checked at note weight, and accept Dismiss.

  4. Replaced wait Release: Return stale_projection for the stale view and refresh the outdated control.

  5. Advisor status word mapping: Close the duplicate as confirmed from ledger002 q-005 / dec-012; retain DL-110
  pairings.

  6. Scheduled Time card: Chat accepts Scheduling ownership of the scheduled-message card internals and its schedule
  time zone.

  7. Stored Build At grace and occurrence summary: Version the saved ExecutionSchedule to persist grace_seconds;
  define an occurrence summary rebuilt from existing owner records.

  8. Plan-card Cancel schedule: Add plan_card as an allowed origin for cmd.execution_window.cancel.

  9. Pause all automations companions: Approve storage, wiring, runtime acceptance and event-registration work;
  complete the first three now and retain event registration as an outstanding Event Authority obligation under
  the required admission procedure.

  10. Grill Me outside BrainStorm: Question peers and research independently; ask the user only through the ordinary
  needs-you path, with no new allowance.

  11. Crew Auto parallelism: Use Crew parallelism capped by app limits and show a read-only value on the sheet.

  12. Hard budget vs run limit: Hard budgets always cap a run limit and the sheet shows both requested and effective
  limits.

  13. First Crew Auto run: Create untouched configuration version 1 with the project; no confirmation sheet before
  first use, then show the note and settings link.

  14. Crew Auto Settings and chat override: Set the factory project default On and persist the per-chat override
  in thread metadata.

  15. Crew Auto receipt edge cases: Emit no chat receipt for a Settings-origin change or a chat that opted out.

  16. Coordinator lane state: Give a coordinator outside the helper roster a row in the same participant-status
  projection.

  17. Chat Room round exhaustion: Wait after the last round until the user adds rounds, summarizes, or ends the
  room.

  18. Rule-check persistence and fix action: Persist passed/failed/could-not-run results with the reply; reuse the
  existing draft-only fix-request action and reconcile command and older wording.

  19. Mixed rule-check result: Use one Missed-first line, for example Missed 1 of your rules · followed 2.

  20. Partly known estimate: Decide the cost and time ranges independently; use depends on the work only for the
  figure without a basis.

  21. Critical Advisor ID: Use the canonical critical-advisor hyphen spelling in Back Seat Driver (P-057, BSD-022).

  22. Bundled theme fonts: Adopt Inter for Basic/Glass, Poppins for Friendly, IBM Plex Mono for Retro, plus PM NieR
  Sans and PM NieR Mono as specified below.

  23. Chat/editor split width: Keep chat at least 360 px wide beside the editor.

  24. Theme motion timing: Theme durations govern sheets and internal card changes; transcript entrances keep shared
  timing.

  25. Project ELI5 default: Add project applicability to general.interaction.eli5-default; resolve chat override,
  then project, then app default.

  26. Command display names: Use Summarize Now and Run Another Review.

  27. Seven missing command shapes: Type End discussion, Research this lead, Dismiss a finding, Release a wait,
  Revoke a rule, Lock a rule and Export memory in existing owner pairs; Confirm a rule also supports locked.
  CS-085 and WM-063 route these contracts to CWR-031, BSD-037 and AMS-052.

  28. Three old wiring descriptions: Update chat_crew_auto_open_config, w_024 chat_crew_auto_set and w_051 chat_eli5_set
  to their current owner behavior.

  29. Superseded command rows: Add pointers from older Send Findings To Agent, Regenerate Title and other replaced
  rows to the newer rules.


  Inter is bundled for Basic and Glass, Poppins for Friendly (with Nunito as its fallback), and IBM Plex Mono for
  Retro. NieR Mode uses "PM NieR Sans", M PLUS 1 variable weights 100-900 from mplus1-latin-var.woff2, for body
  and display: it is a free stand-in for the game's commercial Fontworks FOT-Rodin. NieR Mode uses "PM NieR Mono",
  JetBrains Mono variable weights 100-800 from jetbrains-mono-latin-var.woff2, for mono text. All five named faces
  are bundled with the app; both NieR faces are SIL OFL. Their source is Concepts/onboarding/opus-5.5/src/settings/styles.d/13-nier.css,
  with licenses in Concepts/onboarding/opus-5.5/src/settings/nier/fonts/OFL-*.txt and notes in Concepts/onboarding/opus-5.5/src/settings/nier/SOURCE.md.
  NieR Mode owns general.visual.accent-color and general.visual.app-font through kit.d/18-nier.js.


  After every landing that changes any file under Plans/**, the landing agent runs snapshot-current and the landing check's --record-baseline in a full worktree at the new main, then lands the snapshot and baseline together as one separate commit under the same landing lock before releasing it. A landing with no Plans/** change needs no refresh. The operating rule belongs in reports/landing-checks/README.md, AGENTS.md and .claude/CLAUDE.md; this batch records the decision, and Part C applies those runbook changes after Part B lands.

  Question 9 does not waive event admission: runtime.automation_pause_changed is not one of the seven coordination
  families covered by DL-093. No event family is registered by this entry. Its approved registration remains
  outstanding as Scheduling ledger q-006: Event Authority owns the family-specific decision and admission,
  followed by the prescribed schema, registry, fixture, depth and checkpoint requirements before emission is enabled. Static schemas, fixtures and acceptance
  contracts do not prove implemented runtime behavior.
gui_related: true
gui_classification_reason: Records owner decisions for collaboration, scheduling, advisor, chat, Settings, typography
  and visible command behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- All 29 recommended answers and the complete two-face NieR amendment are preserved.
- Each answer compiles through its named owner; event admission retains the separate DL-093 boundary.
- Static contract evidence is distinguished from native runtime execution.
validation_surfaces:
- python3 scripts/pm-ledger-compile-witness.py Plans/ledgers/v2/pldg-20260927-001-wand-collab-workflows --base origin/main
- python3 scripts/pm-ledger-compile-witness.py Plans/ledgers/v2/pldg-20260927-002-wand-back-seat-driver --base origin/main
- python3 scripts/pm-ledger-compile-witness.py Plans/ledgers/v2/pldg-20260927-003-wand-scheduling --base origin/main
- python3 scripts/pm-ledger-compile-witness.py Plans/ledgers/v2/pldg-20260927-004-wand-memory-plan-usage --base origin/main
- python3 scripts/pm-ledger-compile-witness.py Plans/ledgers/v2/pldg-20260927-005-wand-chat-gui-contract --base origin/main
- python3 scripts/pm-ledger-compile-witness.py Plans/ledgers/v2/pldg-20260927-006-wand-command-census --base origin/main
- python3 scripts/pm-plan-index.py validate
risk_class: owner_answer_loss_or_unapproved_event_admission
reasoning_tier: high
context_scope: wand_modules_answer_resolution
implementation_surfaces:
- Plans/Assistant_Plan_Runtime.md
- Plans/Automated_Testing_System.md
- Plans/Back_Seat_Driver.md
- Plans/Collaborative_Workflows.md
- Plans/Commands_System.md
- Plans/FinalGUISpec.md
- Plans/Personas.md
- Plans/Scheduling_and_Quota_Resume.md
- Plans/Settings_System.md
- Plans/UI_Command_Catalog.md
- Plans/Wiring_Matrix.md
- Plans/assistant-chat-design.md
- Plans/assistant-memory-subsystem.md
- Plans/usage-feature.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-followups-20260929/ANSWERS-20260929.md, SHA-256 345247dfb965fa19ae2f68847125c5b6cafe26126a56bb5b80242e88d3fa9d5c
- Plans/ledgers/v2/pldg-20260927-001-wand-collab-workflows/source_shards/authorization.md
- Plans/ledgers/v2/pldg-20260927-002-wand-back-seat-driver/source_shards/authorization.md
- Plans/ledgers/v2/pldg-20260927-003-wand-scheduling/source_shards/authorization.md
- Plans/ledgers/v2/pldg-20260927-004-wand-memory-plan-usage/source_shards/authorization.md
- Plans/ledgers/v2/pldg-20260927-005-wand-chat-gui-contract/source_shards/authorization.md
- Plans/ledgers/v2/pldg-20260927-006-wand-command-census/source_shards/authorization.md
preserved_exact_tokens:
- DL-138
- PM NieR Sans
- PM NieR Mono
- Inter
- Poppins
- IBM Plex Mono
- M PLUS 1
- JetBrains Mono
- mplus1-latin-var.woff2
- jetbrains-mono-latin-var.woff2
- 360 px
- general.interaction.eli5-default
- stale_projection
- emitted
- unreconfirmed
- snapshot-current
- --record-baseline
negative_constraints:
- Do not register runtime.automation_pause_changed under the seven-family approval of DL-093.
- Do not treat static companion checks as implemented runtime evidence.
owner_hints:
- Plans/Decision_Log.md
```

### DL-139 - Skia Only Desktop With Our Own Skia Extensions And A Leptos Web Client

```yaml
plan_unit_id: DL-139
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  DL-139 records the owner decision of 2026-10-01, completed on 2026-10-02. The native desktop GUI compiles and ships only Slint's Skia
  renderer. Selection runs SLINT_BACKEND override, persisted preference, Skia on the GPU (winit-skia), then Skia's
  own CPU raster (winit-skia-software); FemtoVG and Slint's separate software renderer are not compiled or shipped.
  Puppet Master carries its own extensions to Slint's Skia renderer for element blur, backdrop blur, gradient and
  alpha masks, blend modes, saturate/contrast/brightness filters, ClearType text on Windows and selectable rich text
  (F3-582), written to upstream quality, offered to Slint, carried as a Cargo patch until merged and re-checked with
  every Slint upgrade; on the CPU raster backdrop blur is not drawn and frosted surfaces draw solid. "Slint
  portability" notes that ban blur, backdrop blur, masks, blend modes or filter effects only because stock Slint could
  not draw them no longer bind for those effects. Setup popups (the sheets of F3-566) take DL-114's extra blur: frosted
  glass on the GPU path, solid on the CPU raster, with the scrim a flat tint and F3-431's blur budget opened for this
  sheet blur only. The web GUI draws the terminal from the same Rust grid as a fixed, reused set of visible page-text
  rows updated by diff (SMPFS-072 web exception), subject to the heavy-output speed tests. The web GUI is a
  Leptos client drawn with browser elements and CSS and served by the trusted local daemon (F3-583); it replaces the
  Slint/WASM canvas web GUI. Both interfaces bind one shared Rust interface-model crate and one design-token source.
  Added 2026-10-01/02: Slint remains the native UI framework (layout, input, focus, text editing, clipboard, drag and
  drop, windows); the Skia extensions are a fixed, centrally implemented property set that screens use without
  calling the renderer, and replacing Slint needs a new decision. When the GPU adapter is a software implementation
  (llvmpipe or lavapipe, WARP, SwiftShader), Puppet Master always uses Skia's CPU raster, even when the Graphics
  Engine setting or the SLINT_BACKEND override asks for the GPU, and then warns the user that no GPU was detected;
  switching for this reason shows one quiet, non-blocking, one-time notice explaining why frosted panels look solid
  (F3-033). The Skia CPU raster is a supported, tested path that starts without a GPU and stays fully usable with
  motion unchanged, its only reductions being that backdrop blur is not drawn and frosted surfaces draw solid. After
  GPU device or surface loss, a driver update or crash, or suspend and resume, Puppet Master rebuilds its drawing
  surface without losing interface state and returns to the GPU automatically once it works again. Web text has no
  ClearType guarantee and is checked on Windows for readability, selection and caret behavior at rest and during
  transitions. The interfaces share behavior, not pixels, each with its own visual baselines (F3-583); the web
  terminal tracks its own selection in the terminal grid's data, not with the browser's selection; and the web GUI
  applies the UI Scale setting through one root-level CSS scale (CV-188). Development and test builds of both expose
  test-build observability, never production builds (ATS-067). A GPUI fork was researched and rejected on
  2026-10-02. Jared holds a Slint license, so no separate license cards are opened from the GPUI research's
  licensing questions; this does not address Puppet Master's own license.
  Jared said: "ok sounds like we are doing custom skia work and only using skia for desktop.  For web, you said we
  should use a browser-native web client, what would you recommend?", then "I told the other thread to drop the
  slint requirements since we are going to do custom code on skia to alleviate the shortcomings.", then "ok go with
  Leptos, draft the decision card and spec edits.  Including the skia change, custom code, dropping FemtoVG then
  cpu(skia has cpu)." Jared then confirmed in the question form, choosing the recommended option each time: "Yes,
  Skia only (Recommended)" (Slint's own software renderer goes too), "Yes, lift them now (Recommended)" (the
  Slint-portability bans), "Frosted on GPU, solid on CPU (Recommended)" (setup popups) and "Reused rows of page text
  (Recommended)" (web terminal). On the critique Jared chose "No, port normally" and "Yes, require it in test builds
  (Recommended)"; on 2026-10-02 he said: "Lets stick to Leptos for web, Slint for native, and keep the skia cpu fallback.  Your recommendation.",
  and in the question form typed "ignore the switch and warn the user that there is no gpu detected." and "I have a
  license." The Slint and Rust version pins, the no-React and no-Tauri rule, the trusted local
  daemon contract and the in-canvas float-layer name are unchanged.
gui_related: true
gui_classification_reason: Records the owner decision on the desktop renderer set, the visual capabilities added to
  it, and the technology of the web GUI.
split_recommended: false
depends_on: []
unblocks: [F3-566, F3-582, F3-583, ATS-067]
acceptance_criteria:
  - "Every live owner and consumer statement of the desktop renderer order names Skia on the GPU then Skia's CPU raster, with FemtoVG and Slint's separate software renderer retired."
  - "The Skia extension set and the Leptos web client each have one owning FinalGUISpec PlanUnit."
  - "Slint-portability bans on the F3-582 effects no longer bind; setup popups are frosted on the GPU path and solid on the CPU raster, and F3-431 admits only that sheet blur."
  - "The web terminal follows the SMPFS-072 web exception: reused visible page-text rows from the Rust grid, shipped only after the heavy-output speed tests."
  - "The trusted local daemon contract, web capability states, Slint version pins and the no-React and no-Tauri rule are unchanged."
  - "The owner answers of 2026-10-01 and 2026-10-02 are preserved verbatim with their source hashes."
  - "Software-GPU routing, the supported CPU raster, the Slint framework boundary, web text checks, behavior-not-pixels parity, web terminal selection, web UI scale and test-build observability each have an owning PlanUnit (F3-033, F3-582, F3-583, CV-188, ATS-067)."
  - "Jared's Slint license is recorded without stating its type, and no separate license card is opened for the GPUI research's licensing questions."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: gui_platform_renderer_or_web_stack_drift
reasoning_tier: high
context_scope: gui_stack_skia_leptos
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/Release_Supply_Chain.md
  - Plans/Automated_Testing_System.md
  - Plans/rewrite-tie-in-memo.md
  - Plans/settings_inventory.json
  - Plans/Section15_MVP_Promoted_Features_Spec.md
  - Plans/00-plans-index.md
  - Plans/Contracts_V0.md
  - Plans/Settings_System.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/gui-stack-20261001/ANSWERS-20261001.md, SHA-256 9ca1e2ab54c77a744d629eb4c6dcc1aa8c9d206c6256efbce8b66230a0961ad6"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/gui-stack-20261001/CONFIRMATIONS-20261001.md, SHA-256 104cfdda63686a6abe243b83d1c5863cf92929b755993cd87314cd264e44f83a"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/gui-stack-20261001/CRITIQUE-RESPONSE-20261001.md, SHA-256 76047abe87b2488f52b3e6df94160aa9da09ec1883d3a91876b20d3e1741a1da"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/gui-stack-20261001/GPUI-RESEARCH-20261002.md, SHA-256 119cfe4383311d15f0285b236a995c48e33c5bc5b41125b701e16c7534a33ec9"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/gui-stack-20261001/ANSWERS-20261002.md, SHA-256 6a4c9f58ef4439d0a1882b7306c0b8d446a94e5f45f2346ab4430b66f13f2e84"
preserved_exact_tokens:
  - "DL-139"
  - "winit-skia"
  - "winit-skia-software"
  - "Leptos"
  - "FemtoVG"
  - "dropping FemtoVG then cpu(skia has cpu)"
  - "Frosted on GPU, solid on CPU (Recommended)"
  - "Reused rows of page text (Recommended)"
  - "GPUI"
  - "Lets stick to Leptos for web, Slint for native, and keep the skia cpu fallback."
  - "ignore the switch and warn the user that there is no gpu detected."
negative_constraints:
  - "Do not compile or ship FemtoVG or Slint's separate software renderer in desktop builds."
  - "Do not use React, Tauri or TypeScript for the web GUI; JavaScript is limited to generated or minimal glue."
  - "Do not edit the Slint or Rust version pins under this decision."
owner_hints:
  - Plans/FinalGUISpec.md
  - Plans/Release_Supply_Chain.md
  - Plans/Automated_Testing_System.md
```

### DL-140 - Assistant Chat Icons Become One Neon Family

```yaml
plan_unit_id: DL-140
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  DL-140 records the owner decision of 2026-10-01, extended on 2026-10-02 and approved on 2026-10-07. Every icon in
  the assistant chat is drawn from one icon registry with one drawing per concept, reused everywhere, in the activity
  bar's neon-sign look: a lit stroke over a halo of the same ink plus a soft glow behind the host, never a blur or
  filter (F3-584). Ordinary controls ignite on hover or keyboard focus; status icons are always lit and moving like
  the activity bar; concept icons are lit and still; each icon moves part by part in its own way, the activity bar
  included; colour is reserved for status (amended on 2026-10-08 by DL-146, which draws the capabilities wand in its own
  colours); module cards draw their marks lit and still. The wand is redrawn as a rod
  with a star tip and the Fast-mode bolt is amber and strikes like lightning (F3-588). The halo approach stays after
  DL-139 made blur available, because it costs the same on the Skia CPU raster and NieR Mode draws no glow. Jared
  asked: "I really like the icons/animations used for the items in the chat activity bar.  They are kind of like
  neon signs, each with unique animations.  Can you redesign the icons used everywhere else in that html concept to
  match that style?  That includes the icons in the working animation(which arent far off now).  The icons next to the
  thread activity history previews should convey to the user the status of that thread easily.  A lot of the icons
  will be repeated so that is fine, you shouldnt make bespoke icons for artifacts everywhere it's needed when you
  already have 1, if that makes sense." He answered "Ignite on hover (Recommended)",
  "Per-glyph, bar included (Recommended)" and "Portable neon (Recommended)", later wrote "The magic wand looks more
  like a magic pencil.  So that needs to be fixed.  Lightning bolt for fast mode should be colored and hopefully its
  animated.  Most of it looked good from what I saw." and "I like option 3.  Also, the working animation with the
  circle and ball, the ball should be orbiting on the circle, not on the outside of it.  And the lightning bolt, the
  animation is a little off, maybe think of lighting being a crack, like you see lightning coming down from the
  sky(even though it comes from the ground technically but that isnt how it looks).  Right now the lightning bolt just
  kinda looks like it almost shakes which misses the opportunity to act like lightning.", and approved the result on
  2026-10-07: "changes are approved, you can PM_Chat_Assistant_5.6_Pro_Standalone.html with your version"
gui_related: true
gui_classification_reason: Records an owner decision on the assistant chat's visual design.
split_recommended: false
depends_on: [DL-139, F3-425, ACD-469]
unblocks: [F3-584, F3-588]
acceptance_criteria:
  - "Every assistant chat icon is drawn from one registry with one drawing per concept (F3-584)."
  - "Controls ignite on hover or focus, status icons are always lit and moving, and concept icons are lit and still."
  - "The icon glow is a halo and a soft host glow, not a blur or filter."
  - "The owner answers are preserved verbatim with their source hash."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: chat_icon_family_drift
reasoning_tier: high
context_scope: chat_neon_icons
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/00-plans-index.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/neon-icons-20261001-handoff/JARED-DECISIONS-20261001-07.md, SHA-256 1e43742aab47456f1c6c478106cb2ba8859291bb6a0030fcb70070b7beb30ebf"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/neon-icons-20261001-handoff/PLAN.md, SHA-256 a60dc9a203f9b55c4b30b5a919678110524a4d7933e7cae380cd1d974d95475d"
  - "Concepts/chat-assistant-concepts/5.6 Pro/Chat updates.md (concept lineage only; folded on main 7468d1b676)"
preserved_exact_tokens:
  - "DL-140"
  - "neon signs"
  - "Ignite on hover (Recommended)"
  - "Per-glyph, bar included (Recommended)"
  - "Portable neon (Recommended)"
negative_constraints:
  - "Do not draw a separate icon for each place a concept appears."
  - "Do not draw the icon glow with a blur or filter."
owner_hints:
  - Plans/FinalGUISpec.md
```

### DL-141 - Every Status Reads At A Glance From One Shared Set Of Marks

```yaml
plan_unit_id: DL-141
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  DL-141 records the owner decision of 2026-10-01, amended on 2026-10-02. One set of 13 status marks draws every
  status in the assistant chat (thread rows, the chat header, the activity bar previews, To-Dos, plan steps and module
  cards), each mark a distinct shape that reads without colour or motion (F3-585). Thread-row marks show only while
  the history drawer is wide. The working mark's bead travels on its ring. In lists needs you outshines working, and
  idle and paused never read more lit than a live status on the same row state. The chat header's status word takes
  its mark's tone. Lead rulings within the decision: the working mark draws a still ring with only its bead moving
  (one lap in 9 s), the needs-you mark hops with a glow swell, and idle contrast below 3:1 on hovered or selected
  light-theme rows is accepted under Jared's standing rule that concepts get no accessibility-only work. Jared asked
  that "The icons next to the thread activity history previews should convey to the user the status of that thread
  easily.", chose "Wide mode only", and wrote "the ball should be orbiting on the circle, not on the outside of it."
gui_related: true
gui_classification_reason: Records an owner decision on the assistant chat's visual design.
split_recommended: false
depends_on: [DL-140]
unblocks: [F3-585]
acceptance_criteria:
  - "The status set of F3-585 draws every status in the assistant chat."
  - "Thread-row status marks show only while the history drawer is wide."
  - "The owner answers are preserved verbatim with their source hash."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: chat_status_legibility_drift
reasoning_tier: high
context_scope: chat_neon_icons
implementation_surfaces:
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/neon-icons-20261001-handoff/JARED-DECISIONS-20261001-07.md, SHA-256 1e43742aab47456f1c6c478106cb2ba8859291bb6a0030fcb70070b7beb30ebf"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/neon-icons-20261001-handoff/PLAN.md, SHA-256 a60dc9a203f9b55c4b30b5a919678110524a4d7933e7cae380cd1d974d95475d"
  - "Concepts/chat-assistant-concepts/5.6 Pro/Chat updates.md (concept lineage only; folded on main 7468d1b676)"
preserved_exact_tokens:
  - "DL-141"
  - "Wide mode only"
  - "the ball should be orbiting on the circle, not on the outside of it."
negative_constraints:
  - "Do not show thread-row status marks in the narrow history drawer."
  - "Do not let idle or paused read more lit than a live status."
owner_hints:
  - Plans/FinalGUISpec.md
```

### DL-142 - The Working Activity Live Step Is A Dark Disc With A Lit Icon

```yaml
plan_unit_id: DL-142
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  DL-142 records the owner decision of 2026-10-01. In the working activity the live subject's node and the centre disc
  are a dark disc rimmed in the phase hue with the subject's icon lit in that hue and acting while the run runs;
  finished subjects are lit green, pending subjects sit at rest, and only the live node and the current strip or rail
  disc act (F3-586). Jared chose "Dark disc, lit glyph (Recommended)".
gui_related: true
gui_classification_reason: Records an owner decision on the assistant chat's visual design.
split_recommended: false
depends_on: [DL-140, ACD-473]
unblocks: [F3-586]
acceptance_criteria:
  - "The live node and the centre disc are a dark disc with a lit icon in the phase hue (F3-586)."
  - "Finished subjects are lit green and never act."
  - "The owner answer is preserved verbatim with its source hash."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: chat_working_activity_presentation_drift
reasoning_tier: high
context_scope: chat_neon_icons
implementation_surfaces:
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/neon-icons-20261001-handoff/JARED-DECISIONS-20261001-07.md, SHA-256 1e43742aab47456f1c6c478106cb2ba8859291bb6a0030fcb70070b7beb30ebf"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/neon-icons-20261001-handoff/PLAN.md, SHA-256 a60dc9a203f9b55c4b30b5a919678110524a4d7933e7cae380cd1d974d95475d"
  - "Concepts/chat-assistant-concepts/5.6 Pro/Chat updates.md (concept lineage only; folded on main 7468d1b676)"
preserved_exact_tokens:
  - "DL-142"
  - "Dark disc, lit glyph (Recommended)"
negative_constraints:
  - "Do not draw the live step as a filled accent disc with a dark icon."
owner_hints:
  - Plans/FinalGUISpec.md
```

### DL-143 - Send And Stop Are The Solid Living Design

```yaml
plan_unit_id: DL-143
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  DL-143 records the owner decision of 2026-10-02. The composer's Send and Stop control is the solid-living design
  (F3-587): a solid chip, accent for Send and Queue and danger for Stop, with the craft in the glyph; the paper plane
  lifts off and a fresh plane morphs into the Stop square before the danger colour floods; the square breathes gently
  while a run is live; Queue stacks planes with a count; empty and full clicks sputter; the second click of a
  double-click is ignored. Three designs were prototyped and judged (orbit-tie 56, ignition 50.5, solid-living 45);
  Jared picked option 3, solid-living, and the judge's defects in it were fixed while building it. The behaviour stays
  with F3-563 and ACD-471. Jared wrote "The send and stop buttons for the composer need to be really good too as they
  are something that will be looked at a lot." and then "I like option 3."
gui_related: true
gui_classification_reason: Records an owner decision on the assistant chat's visual design.
split_recommended: false
depends_on: [DL-108, F3-563, ACD-471]
unblocks: [F3-587]
acceptance_criteria:
  - "The composer renders the solid-living Send and Stop control of F3-587 in every state."
  - "Stop never clears the follow-up queue, and the double-click guard uses the click count, not a time window."
  - "The owner answers are preserved verbatim with their source hash."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: chat_send_stop_presentation_drift
reasoning_tier: high
context_scope: chat_send_stop
implementation_surfaces:
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/neon-icons-20261001-handoff/JARED-DECISIONS-20261001-07.md, SHA-256 1e43742aab47456f1c6c478106cb2ba8859291bb6a0030fcb70070b7beb30ebf"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/neon-icons-20261001-handoff/VERDICT.md, SHA-256 2bc323ea16e66d08512e3260969a9b3031c1688889d0f0e61363bce561b5e48a"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/neon-icons-20261001-handoff/SOLID-LIVING-NOTES.md, SHA-256 15bcacd90861b391404fbe9415f71fe79df7670c12a962c9cb59035875b9eb87"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/neon-icons-20261001-handoff/specs/SENDSTOP-BUILD.md, SHA-256 50c4cf5663543942eb6b11bab45c0d9b1bacfddeb4460979a748a3ad0b50890b"
  - "Concepts/chat-assistant-concepts/5.6 Pro/Chat updates.md (concept lineage only; folded on main 7468d1b676)"
preserved_exact_tokens:
  - "DL-143"
  - "solid-living"
  - "I like option 3."
negative_constraints:
  - "Do not show the plane on the danger colour."
  - "Do not guard the double-click with a time window."
owner_hints:
  - Plans/FinalGUISpec.md
```

### DL-144 - NieR Mode Covers The Whole Assistant Chat And Scene Changes Cross Fade

```yaml
plan_unit_id: DL-144
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  DL-144 records the owner decisions of 2026-10-02. NieR Mode (SSYS-043) covers every assistant chat surface, with
  each installed part placed in the chat and the transcript stage counted as the app's ground so the scene shows
  behind the conversation (F3-589). A change from one scene to another cross-fades by opacity over 520 ms, never above
  either scene's resting strength, everywhere a scene changes, PMConcept7 included; the chat adds no moving touches
  inside the scenes. In the concept NieR Light and NieR Dark are Demo Studio themes (lab only, ACD-474); in the
  product NieR Mode stays the Settings switch. Jared wrote "Dont forget about the new NieR mode found in
  PMConcept7.html, that will impacting this once it is ported into PMoncept7(not your job) so might as well address
  those changes now too.", then "might as well add the nier mode to the whole concept as well.  it will need to be
  done eventually so might as well have you do it.  Make it a selectable theme in the demo studio.", and on the two
  scene ideas "Also the images you sent me looked good.  Do 2 but not 1."
gui_related: true
gui_classification_reason: Records an owner decision on the assistant chat's visual design.
split_recommended: false
depends_on: [DL-140, SSYS-043, F3-441, ACD-474]
unblocks: [F3-589]
acceptance_criteria:
  - "Every assistant chat surface renders under NieR Mode with its parts placed as F3-589 lists."
  - "A change between two scenes cross-fades over 520 ms and swaps instantly under reduced motion."
  - "The owner answers are preserved verbatim with their source hash."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: chat_nier_mode_drift
reasoning_tier: high
context_scope: chat_nier_mode
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/Settings_System.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/neon-icons-20261001-handoff/JARED-DECISIONS-20261001-07.md, SHA-256 1e43742aab47456f1c6c478106cb2ba8859291bb6a0030fcb70070b7beb30ebf"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/neon-icons-20261001-handoff/specs/NIER.md, SHA-256 ea5f2a23dc4b48b50bdd90da19492aecbfa9b779a853d1d55942a1571fa059b5"
  - "Concepts/chat-assistant-concepts/5.6 Pro/Chat updates.md (concept lineage only; folded on main 7468d1b676)"
preserved_exact_tokens:
  - "DL-144"
  - "Do 2 but not 1."
negative_constraints:
  - "Do not make NieR Mode a ninth selectable theme in the product."
  - "Do not add moving touches inside the scenes in the chat."
owner_hints:
  - Plans/FinalGUISpec.md
```

### DL-145 - The Chat's Hover Labels Wait For A Deliberate Pause And Three Small Chrome Fixes

```yaml
plan_unit_id: DL-145
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  DL-145 records the owner request of 2026-10-07 and his answers on decision cards 1 and 2 of that day. The assistant
  chat's icon controls name themselves through the shared PMHoverTag of F3-523, never a native title, and every chat
  tag waits for F3-523's deliberate intent, which the concept now follows exactly with no faster hand-off; a press on
  an anchor closes its tag until the pointer leaves it (F3-523, amended). The owner's request for later hover labels
  is met by those thresholds. Activity bar previews open only after a deliberate pointer dwell and at once from
  keyboard focus (F3-590). Opening a message's More keeps its meta chips and actions on their row, and Context More
  Details' capability boxes draw their whole outline (F3-591). A dropdown in a setup sheet closes when its own trigger
  is clicked again (F3-568, CWR-018). The owner chose to land this wave with the concept as soon as the checks pass
  (card 1) and to have DL-145 to DL-151 describe his decisions in plain words, without quoting him (card 2).
gui_related: true
gui_classification_reason: Records an owner decision on the assistant chat's visual design.
split_recommended: false
depends_on: [DL-140, ACD-474]
unblocks: [F3-590, F3-591, F3-568, F3-523]
acceptance_criteria:
  - "No icon control in the assistant chat relies on a native title for its name, and no chat tag opens before F3-523's thresholds (F3-590)."
  - "Opening a message's More leaves its meta chips and actions on their row (F3-591)."
  - "The owner's decisions are recorded in plain words with their source hashes, and no entry of this wave quotes the owner."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: chat_hover_and_chrome_drift
reasoning_tier: high
context_scope: chat_tweaks_20261007
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/Collaborative_Workflows.md
  - Plans/00-plans-index.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/chat56-tweaks-20261007/JARED_REQUEST.md, SHA-256 acf112cbd082a46daddb57044df694fb780ebbf938bc2bd7cf20dd6a96ba02fe"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/chat56-tweaks-20261007/ANSWERS-20261007.txt, SHA-256 e481b9d35a5e4bced327100b6f8e46d96c94ba21d43a353ec6b3a75d468dd1fe"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/chat56-tweaks-20261007/LEAD-RULINGS-20261008.txt, SHA-256 546fa6cc210c40b50a6a5db5f4d6e436af82c2e3d9541796b214bb27061d80c7"
  - "Concepts/chat-assistant-concepts/5.6 Pro/Chat updates.md (concept lineage only)"
preserved_exact_tokens:
  - "DL-145"
  - "PMHoverTag"
  - "plain words"
negative_constraints:
  - "Do not use a native title as an icon control's name in the chat."
  - "Do not write the concept's hover or preview timings into canon as product values."
  - "Do not quote the owner's messages in DL-145 to DL-151."
owner_hints:
  - Plans/FinalGUISpec.md
```

### DL-146 - The Capabilities Wand In Colour The Fast Bolt Strikes From The Top And Grill Me's Icon Is A Kettle Grill

```yaml
plan_unit_id: DL-146
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  DL-146 records the owner request of 2026-10-07 and his answer on decision card 5, and amends DL-140. The composer's
  capabilities wand, and the wand in its menu head, is drawn in colour at rest and on hover (a silver handle, a gold
  star, blue, pink and green sparkles), and after its flick its sparkles twinkle in turn; it is the one exception to
  DL-140's rule that colour is reserved for status (F3-584, F3-588). Under NieR Mode the wand stays ink (F3-589). The
  Fast-mode bolt strikes top-down as a bright leader that runs down inside the bolt, then flashes, re-flashes and
  settles into an afterglow, never darker than at rest; under NieR Mode its leader steps down in ink and the bolt
  flashes solid ink (F3-588). Grill Me's glyph is a kettle grill whose act swings the lid open while flames flicker
  and smoke rises, drawn wherever Grill Me appears as a control or a label (F3-588).
gui_related: true
gui_classification_reason: Records an owner decision on the assistant chat's visual design.
split_recommended: false
depends_on: [DL-140]
unblocks: [F3-588, F3-584, F3-589]
acceptance_criteria:
  - "The capabilities wand shows its five colours at rest and on hover outside NieR Mode, and is ink under NieR Mode."
  - "No frame of the Fast bolt's strike is darker than the bolt at rest."
  - "The owner's decisions are recorded in plain words with their source hashes."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: chat_icon_family_drift
reasoning_tier: high
context_scope: chat_neon_icons
implementation_surfaces:
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/chat56-tweaks-20261007/JARED_REQUEST.md, SHA-256 acf112cbd082a46daddb57044df694fb780ebbf938bc2bd7cf20dd6a96ba02fe"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/chat56-tweaks-20261007/ANSWERS-20261007.txt, SHA-256 e481b9d35a5e4bced327100b6f8e46d96c94ba21d43a353ec6b3a75d468dd1fe"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/chat56-tweaks-20261007/LEAD-RULINGS-20261008.txt, SHA-256 546fa6cc210c40b50a6a5db5f4d6e436af82c2e3d9541796b214bb27061d80c7"
  - "Concepts/chat-assistant-concepts/5.6 Pro/Chat updates.md (concept lineage only)"
preserved_exact_tokens:
  - "DL-146"
  - "capabilities wand"
  - "kettle grill"
negative_constraints:
  - "Do not draw any chat glyph other than the capabilities wand in its own colours."
  - "Do not dim or darken the Fast bolt during its strike."
owner_hints:
  - Plans/FinalGUISpec.md
```

### DL-147 - Activity Detail Gets A Tidy Goal Panel One Line To Do Rows And A Live Subagent Transcript

```yaml
plan_unit_id: DL-147
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  DL-147 records the owner request of 2026-10-07 and his answer on decision card 7. Goal Activity Detail shows the
  objective and one control row (Pause or Resume and Edit objective, with Cancel Goal alone at the far edge) and an
  Objective history footer disclosure; the View Goal route and the Ask for a replacement control are removed, and an
  agent-proposed replacement still follows Goal_Runtime_System's approval path when the user asks in the chat (F3-593,
  GRS-055). To-Do rows are one-line checklist rows like the To-Do hover preview, keeping the explicit assignment when
  one exists, with no Start work or Run work control and Open work in the selected detail; this is a second scoped
  exception to the 2026-09-08 rollback, after DL-122's, for the To-Do rows only (F3-593, F3-542, F3-580, TDR-011).
  Subagent rows, the preview and the detail card underline the model, and opening a subagent opens its read-only live
  child transcript in the Turn Stage presentation, where each stretch of work between messages is one collapsed row
  with a plain count and a small Step Rail motif that opens on click (ACD-485, F3-593).
gui_related: true
gui_classification_reason: Records an owner decision on the assistant chat's Activity Detail presentation.
split_recommended: false
depends_on: [DL-122, GRS-055, TDR-011, ACD-480]
unblocks: [F3-593, ACD-485]
acceptance_criteria:
  - "Goal Activity Detail shows no View Goal route and no Ask for a replacement control."
  - "No To-Do row carries a button; Open work is in the selected detail."
  - "Opening a subagent opens one read-only document per child run with no composer, and each stretch of work is one collapsed row."
  - "The owner's decisions are recorded in plain words with their source hashes."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: chat_activity_detail_drift
reasoning_tier: high
context_scope: chat_tweaks_20261007
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/assistant-chat-design.md
  - Plans/Goal_Runtime_System.md
  - Plans/ToDo_Runtime.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/chat56-tweaks-20261007/JARED_REQUEST.md, SHA-256 acf112cbd082a46daddb57044df694fb780ebbf938bc2bd7cf20dd6a96ba02fe"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/chat56-tweaks-20261007/ANSWERS-20261007.txt, SHA-256 e481b9d35a5e4bced327100b6f8e46d96c94ba21d43a353ec6b3a75d468dd1fe"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/chat56-tweaks-20261007/LEAD-RULINGS-20261008.txt, SHA-256 546fa6cc210c40b50a6a5db5f4d6e436af82c2e3d9541796b214bb27061d80c7"
  - "Concepts/chat-assistant-concepts/5.6 Pro/Chat updates.md (concept lineage only)"
preserved_exact_tokens:
  - "DL-147"
  - "Objective history"
  - "Step Rail"
negative_constraints:
  - "Do not give a To-Do row a Start work, Run work or other mutation button."
  - "Do not give a subagent's live transcript a composer or a control that acts on the parent thread."
  - "Do not read the removal of the Ask for a replacement button as retiring cmd.chat.goal.propose_update."
owner_hints:
  - Plans/FinalGUISpec.md
  - Plans/assistant-chat-design.md
```

### DL-148 - The Setup Popups Get Step Tiles A Readable Chat Preview And A Draggable Send Time

```yaml
plan_unit_id: DL-148
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  DL-148 records the owner request of 2026-10-07 and his answer on decision card 8. In the setup sheets with numbered
  questions (the four collaboration kinds and Crew Auto) each number is a step tile and the focused step fills
  (F3-592, F3-566). The In your chat preview fills the hero's side column, scaled to fit and never above its real size
  (F3-592). The Schedule Message sheet's 48-hour track is also its send-time control (drag, press or keys, never in
  the past), and the sheet has no promise lines and no Technical details (F3-592, F3-573). Technical details also
  leaves Build At, the Scheduled and Automations manager and the scheduled-message records, and stays only on each
  setup sheet's Advanced page; Build At names the exact Plan version it binds, and the Plan's id, version and hash are
  in the Plan's Details (F3-573, SQR-013, SQR-015, UCC-170, CDRY-021).
gui_related: true
gui_classification_reason: Records an owner decision on the wand module sheets' presentation.
split_recommended: false
depends_on: [SQR-002]
unblocks: [F3-592, F3-573, F3-566]
acceptance_criteria:
  - "Dragging, pressing or stepping the send-time track writes the same Date and Time inputs as the presets and never a past time."
  - "The Schedule Message sheet, Build At, the Scheduled and Automations manager and the scheduled-message records show no Technical details."
  - "The owner's decisions are recorded in plain words with their source hashes."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: wand_sheet_presentation_drift
reasoning_tier: high
context_scope: wand_modules_gui
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/Scheduling_and_Quota_Resume.md
  - Plans/UI_Command_Catalog.md
  - Plans/Commands_System.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/chat56-tweaks-20261007/JARED_REQUEST.md, SHA-256 acf112cbd082a46daddb57044df694fb780ebbf938bc2bd7cf20dd6a96ba02fe"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/chat56-tweaks-20261007/ANSWERS-20261007.txt, SHA-256 e481b9d35a5e4bced327100b6f8e46d96c94ba21d43a353ec6b3a75d468dd1fe"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/chat56-tweaks-20261007/LEAD-RULINGS-20261008.txt, SHA-256 546fa6cc210c40b50a6a5db5f4d6e436af82c2e3d9541796b214bb27061d80c7"
  - "Concepts/chat-assistant-concepts/5.6 Pro/Chat updates.md (concept lineage only)"
preserved_exact_tokens:
  - "DL-148"
  - "step tile"
  - "send-time control"
negative_constraints:
  - "Do not let the send-time track set a time in the past."
  - "Do not drop the scheduled message's exact-snapshot behaviour with its promise lines (SQR-002)."
owner_hints:
  - Plans/FinalGUISpec.md
  - Plans/Scheduling_and_Quota_Resume.md
```

### DL-149 - Agents Are Drawn As Little Puppets The Agent Graphs Become Cast Plates And Technical Details Leaves The Run Surfaces

```yaml
plan_unit_id: DL-149
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  DL-149 records the owner request of 2026-10-07 and his answers on decision cards 6 and 8. Every agent is drawn as a
  small marionette puppet, after PMConcept7's onboarding helpers: a control bar with strings, a chibi figure and one
  role prop, in the theme family's material, and PMConcept7's ink NieR puppet under NieR Mode; one puppet primitive
  draws every agent everywhere, and no agent is drawn as initials (F3-594). The puppet replaces the cast mark of
  F3-566, F3-569, F3-580 and CWR-019 and the avatar stack of ACD-469 (DR-044). The Crew, Review, BrainStorm and Chat
  Room graphs become one cast plate grammar in the setup sheets and at the head of each run view (F3-595). Run cards
  and run views have no Technical details (F3-569, F3-595, UCC-170, CDRY-021). Puppets hold still in setup sheets, act
  once on run cards and run views, and sway continuously only on the chat's live agents card (F3-594).
gui_related: true
gui_classification_reason: Records an owner decision on how agents and their graphs are drawn.
split_recommended: false
depends_on: [DL-111]
unblocks: [F3-594, F3-595, F3-566, F3-569, ACD-469]
acceptance_criteria:
  - "Every agent mark in sheets, cards, run views, Activity and the live agents card is the one puppet primitive of F3-594."
  - "No run card or run view shows Technical details."
  - "The owner's decisions are recorded in plain words with their source hashes."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: agent_mark_presentation_drift
reasoning_tier: high
context_scope: chat_tweaks_20261007
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/Collaborative_Workflows.md
  - Plans/assistant-chat-design.md
  - Plans/DRY_Rules.md
  - Plans/UI_Command_Catalog.md
  - Plans/Commands_System.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/chat56-tweaks-20261007/JARED_REQUEST.md, SHA-256 acf112cbd082a46daddb57044df694fb780ebbf938bc2bd7cf20dd6a96ba02fe"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/chat56-tweaks-20261007/ANSWERS-20261007.txt, SHA-256 e481b9d35a5e4bced327100b6f8e46d96c94ba21d43a353ec6b3a75d468dd1fe"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/chat56-tweaks-20261007/LEAD-RULINGS-20261008.txt, SHA-256 546fa6cc210c40b50a6a5db5f4d6e436af82c2e3d9541796b214bb27061d80c7"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/chat56-tweaks-20261007/nier-puppets-final-handoff.md, SHA-256 492a3bbeae1285f1dd1d55dfbdc87da3bfa9fce207c9ef01a9f2005abb0ddfa0"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/chat56-tweaks-20261007/PM7-COORDINATION-20261008.md, SHA-256 c31bdbf5c69cf7f3110b2bbdc63258848bba8eee69da4154f976c295e2881002"
  - "Concepts/chat-assistant-concepts/5.6 Pro/Chat updates.md (concept lineage only)"
preserved_exact_tokens:
  - "DL-149"
  - "marionette puppet"
  - "cast plate"
negative_constraints:
  - "Do not draw an agent with initials, letters or an avatar."
  - "Do not draw a second puppet primitive for any surface."
owner_hints:
  - Plans/FinalGUISpec.md
```

### DL-150 - The Ask Card Gets A Livelier Look

```yaml
plan_unit_id: DL-150
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  DL-150 records the owner request of 2026-10-07. The questions card (the Ask Card) keeps its behaviour and features
  and gets a new look: an accent progress wire on its spine, one filled Next or Submit, distinct resting and chosen
  option rows whose selection lands, the waiting mark beside the question and calmer motion; under NieR Mode the
  chosen answer is the menu cursor and the spine's marks are diamonds (F3-596).
gui_related: true
gui_classification_reason: Records an owner decision on the questions card's visual design.
split_recommended: false
depends_on: []
unblocks: [F3-596]
acceptance_criteria:
  - "The Ask Card's behaviour and draft lifecycle are unchanged (assistant-chat-design section 7.4)."
  - "The owner's decision is recorded in plain words with its source hash."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: question_card_presentation_drift
reasoning_tier: standard
context_scope: chat_tweaks_20261007
implementation_surfaces:
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/chat56-tweaks-20261007/JARED_REQUEST.md, SHA-256 acf112cbd082a46daddb57044df694fb780ebbf938bc2bd7cf20dd6a96ba02fe"
  - "Concepts/chat-assistant-concepts/5.6 Pro/Chat updates.md (concept lineage only)"
preserved_exact_tokens:
  - "DL-150"
  - "Ask Card"
  - "progress wire"
negative_constraints:
  - "Do not change the questionnaire's behaviour through its look."
owner_hints:
  - Plans/FinalGUISpec.md
```

### DL-151 - The Retro Themes Follow PMConcept7's Colours And Box Shapes

```yaml
plan_unit_id: DL-151
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  DL-151 records the owner request of 2026-10-07 and his answers on decision cards 3 and 4. The app's Retro token
  tables take PMConcept7's retro values (the olive Atlas Retro Dark, and Retro Light's ink on paper with a blue
  primary), with Retro Light's warning ink darkened for readable contrast (F3-426); Retro focus is lime on Retro Dark
  and blue on Retro Light (F3-201). Under Retro the assistant chat uses PMConcept7's box grammar of square corners, 2
  px structural lines, inner hairlines and hard offset shadows, keeps the chat's retro fonts, motion and sounds, draws
  the user turn as a solid block in the theme's lime with paper-coloured text on Retro Light, and boxes the assistant
  turn with a plain border and the hard retro shadow and no coloured strip (F3-597, ACD-469, F3-562).
gui_related: true
gui_classification_reason: Records an owner decision on the Retro theme presentation.
split_recommended: false
depends_on: [F3-426, F3-201]
unblocks: [F3-597, ACD-469]
acceptance_criteria:
  - "Under Retro the chat paints only the app's Retro token values; no chat-local palette exists."
  - "Retro motion and sounds are unchanged."
  - "The owner's decisions are recorded in plain words with their source hashes."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: theme_token_drift
reasoning_tier: high
context_scope: chat_tweaks_20261007
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/chat56-tweaks-20261007/JARED_REQUEST.md, SHA-256 acf112cbd082a46daddb57044df694fb780ebbf938bc2bd7cf20dd6a96ba02fe"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/chat56-tweaks-20261007/ANSWERS-20261007.txt, SHA-256 e481b9d35a5e4bced327100b6f8e46d96c94ba21d43a353ec6b3a75d468dd1fe"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/chat56-tweaks-20261007/PMCONCEPT7-RETRO-VALUES.md, SHA-256 4268674a786a33f938d43a5c91c32ba8324c78d883070e13e5aaab7b030ebdec"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/chat56-tweaks-20261007/LEAD-RULINGS-20261008.txt, SHA-256 546fa6cc210c40b50a6a5db5f4d6e436af82c2e3d9541796b214bb27061d80c7"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/chat56-tweaks-20261007/PM7-COORDINATION-20261008.md, SHA-256 c31bdbf5c69cf7f3110b2bbdc63258848bba8eee69da4154f976c295e2881002"
  - "Concepts/chat-assistant-concepts/5.6 Pro/Chat updates.md (concept lineage only)"
preserved_exact_tokens:
  - "DL-151"
  - "box grammar"
  - "Retro token tables"
negative_constraints:
  - "Do not give the chat a palette of its own under Retro."
  - "Do not change Retro motion or sounds through this decision."
owner_hints:
  - Plans/FinalGUISpec.md
  - Plans/assistant-chat-design.md
```

### DL-152 - NieR Mode Where A Look Is Chosen NieR Onboarding And Tour And Their Sounds

```yaml
plan_unit_id: DL-152
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  DL-152 records the owner request of 2026-10-07. NieR Mode is reached wherever a look is chosen: the title-bar
  theme selector, the onboarding look choice and the onboarding and Tour Look menus carry a NieR Mode checkbox with an
  Adjust NieR look button that opens the NieR Mode editor, as a popup over the application or a panel inside the
  onboarding window (F3-082, F3-598); during setup NieR is a preview written with the look. Onboarding and the
  Guided Tour gain a NieR presentation, NieR ink marionettes included, gated by NieR Mode and the existing parts
  (F3-598). Their sounds become one Notifications & Sounds cue category with variants per cue, sounds for new
  moments with fixed fallbacks, a NieR kit while NieR Mode is painted with Menu sounds installed, one player and merged
  coincident cues, and every cue is listed in the Settings sound library (F3-599), 354 entries in the concept. The
  showpiece pass is part of this decision: the hero moments in setup and the tour, and the rules that long words type
  on and that a large area does not flash. No settings key, NieR part,
  theme variant or onboarding or tour action is added. Amended 2026-10-09 by DL-153: no command id, route, settings
  key or ui.guided_tour.* action is added, but onboarding's look choice and its NieR Mode controls use one new typed
  local action, ui.onboarding.choose_look, the NieR Mode editor's open, close and replay are
  ui.settings.nier_editor.open, ui.settings.nier_editor.close and ui.settings.nier_editor.replay, and the live
  controls compose cmd.settings.transaction.preview then cmd.settings.transaction.apply. NieR Mode gets its own Settings unit, SSYS-043, which DL-144
  and F3-589 now cite. Jared asked for the three tasks in one request on PMConcept7: a more polished NieR Mode in
  setup and the tour with NieR puppets and sounds, NieR Mode as a checkbox with an adjust button wherever a theme is
  chosen, and livelier, more varied setup and tour sounds with NieR ones, all listed in the sound library; the record
  states it in plain words, without quoting him.
gui_related: true
gui_classification_reason: Records an owner decision on NieR Mode's entry points and on onboarding and Guided Tour presentation and sound.
split_recommended: false
depends_on: [DL-107, DL-144, SSYS-043, F3-082, F3-405, F3-520, F3-521]
unblocks: [F3-598, F3-599]
acceptance_criteria:
  - "The title-bar theme selector, the onboarding look choice and both Look menus carry the NieR Mode checkbox and the Adjust NieR look button, and NieR Mode never appears as a theme or family (F3-598)."
  - "Onboarding and Tour cues form one Notifications & Sounds category with a NieR kit, and all of them are listed in the sound library (F3-599)."
  - "No settings key, NieR part or theme variant is added."
  - "The owner request is recorded in plain words, with the verbatim source cited by path and SHA-256."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: nier_onboarding_tour_drift
reasoning_tier: high
context_scope: nier_onboarding_tour
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/Settings_System.md
  - Plans/Planning_Wizard.md
  - Plans/DRY_Rules.md
  - Plans/00-plans-index.md
  - Plans/Decision_Log.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/nier-onb-20261007/JARED-REQUEST-20261007.md, SHA-256 416638453431ef6bac2b4a8066560214c4fa3bcd8e0663cf778fba89bc63e652"
  - "Concepts/onboarding/opus-5.5/README.md (concept lineage only; branch t3/concept/polish-nier-onboarding-sounds)"
preserved_exact_tokens:
  - "DL-152"
  - "NieR Mode"
  - "Adjust NieR look"
negative_constraints:
  - "Do not make NieR Mode a ninth theme or a family choice."
  - "Do not add a settings key, a NieR part or an onboarding-, tour- or NieR-only sound setting."
owner_hints:
  - Plans/FinalGUISpec.md
  - Plans/Settings_System.md
```

### DL-153 - The App Opens In Its Own Look Setup's Starting Look And The Four Families' Hero Moments

```yaml
plan_unit_id: DL-153
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  DL-153 records the owner request of 2026-10-09 and its two rulings. The pre-paint layer shows the look stored for
  the Project the application opens on, NieR Mode included, read from that Project's Settings, and stores no theme of
  its own (F3-468). A new install's onboarding always starts in Basic Dark, preselected, whatever look was shown before;
  Run Onboarding Again starts in the look on screen, NieR Mode included, preselected (F3-520). Onboarding's wake, act
  card and curtain call take five styles, one per look family: NieR's whenever NieR Mode is painted, whatever family is
  beneath, and otherwise the painted family's own, in its own materials and in both its variants (F3-600; F3-598 and
  F3-599 amended). The application's own notices about the tour's restore stay quiet in every look (F3-521). No
  settings key, theme variant, NieR part, sound setting, command id, route or tour action is added. Lead rulings under
  existing canon, not owner answers, wire DL-152's look controls: the live ones compose
  cmd.settings.transaction.preview then cmd.settings.transaction.apply (the title bar's Light/Dark/Auto keeps
  cmd.theme.set_mode); the NieR Mode editor opens, closes and replays through ui.settings.nier_editor.open,
  ui.settings.nier_editor.close and ui.settings.nier_editor.replay; the onboarding look choice, its NieR Mode controls
  and its Look menu use one new typed local action, ui.onboarding.choose_look, a preview written with the Project at
  commit that never dispatches cmd.theme.* or a Settings transaction; the sound library's Which look switch and Show N
  more takes are typed local actions and playing an entry is cmd.sound.preview; the Tour's Look menu and sound
  control are not tour actions; and DR-056 keeps one NieR Mode editor, reboot plate, look store and set of hero
  moments. Jared asked for the four
  next steps of the NieR showpiece and ruled on the five styles and on setup's starting look; the record states them in
  plain words, the rulings kept word for word in the cited source.
gui_related: true
gui_classification_reason: Records an owner decision on the first paint, onboarding's starting look, the families' hero moments and the tour's restore notices.
split_recommended: false
depends_on: [DL-152]
unblocks: [F3-600, F3-468, F3-520, F3-521, F3-598, F3-599, F3-082, DR-056, SSYS-010, SSYS-043, UIW-015, UCC-106, UCC-108, UCC-120, WM-041, WM-046, PWIZ-021, PWIZ-022, PWIZ-023, ATS-020]
acceptance_criteria:
  - "The first frame of an ordinary open is the stored look of the Project the application opens on, and no theme is stored outside that Project's Settings (F3-468)."
  - "A new install's onboarding starts in Basic Dark; Run Onboarding Again starts in the look on screen (F3-520)."
  - "Five styles of the three hero moments exist, NieR's always while NieR Mode is painted (F3-600)."
  - "Every look control named by DL-152 has one command or typed local action: the Settings transaction pair or cmd.theme.set_mode live, ui.settings.nier_editor.* for the editor, ui.onboarding.choose_look inside the onboarding window, and the sound library's two local actions with cmd.sound.preview (UIW-013)."
  - "Product Onboarding's census is fourteen typed local actions everywhere it is stated, and SSYS-043, F3-598 and DL-152 no longer say no onboarding action is added."
  - "The owner request is recorded in plain words, with the verbatim rulings cited by path and SHA-256, and the lead's wiring rulings are cited as agent rulings."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: nier_onboarding_tour_drift
reasoning_tier: high
context_scope: nier_onboarding_tour
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/Settings_System.md
  - Plans/Planning_Wizard.md
  - Plans/UI_Wiring_Rules.md
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.md
  - Plans/DRY_Rules.md
  - Plans/Automated_Testing_System.md
  - Plans/product_onboarding_contracts.schema.json
  - Plans/product_onboarding_contract_fixtures.json
  - Plans/touch_closure.json
  - Plans/Wiring_Matrix.production.json
  - Plans/00-plans-index.md
  - Plans/Decision_Log.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/nier-next-20261009/JARED-REQUEST-20261009.md, SHA-256 5d4f5b2aa55364c55fb022e4624657b5185e5ea5b316b6108b880dde51a98e48"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/nier-next-20261009/LEAD-RULINGS-20261009.md, SHA-256 d838d83f930bda2967e9c289cffe1a98a59a2d07dd163374331c8c3803b98b38 (agent rulings, not owner answers)"
  - "Concepts/onboarding/opus-5.5/README.md (concept lineage only; branch t3/concept/nier-showpiece-next)"
preserved_exact_tokens:
  - "DL-153"
  - "NieR Mode"
  - "Basic Dark"
  - "Run Onboarding Again"
  - "ui.onboarding.choose_look"
  - "ui.settings.nier_editor.open"
  - "cmd.settings.transaction.preview"
negative_constraints:
  - "Do not add a global or cross-Project theme store."
  - "Do not make a NieR variant per family."
  - "Do not add a settings key, a NieR part or an onboarding- or tour-only setting."
  - "Do not add a command id, a route or a Guided Tour action for a look control."
owner_hints:
  - Plans/FinalGUISpec.md
  - Plans/Settings_System.md
  - Plans/Planning_Wizard.md
```

### DL-161 - PMConcept7 Carries Its Own Fonts

```yaml
plan_unit_id: DL-161
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  DL-161 records the owner request of 2026-10-09 that PMConcept7 have all its fonts built in. PMConcept7 embeds
  Inter, Poppins with Nunito behind it, and IBM Plex Mono, at the weights and italics its looks use, as Latin woff2
  data, and Gelasio stands in under the name Georgia for the info-badge glyph because Georgia cannot be embedded
  (F3-430). Its Inter, Poppins and IBM Plex Mono files are the 5.6 Pro chat concept's, byte for byte (DR-050).
  Orbitron, Rajdhani and JetBrains Mono are not embedded because no text draws in them, and platform font names
  stay the computer's. The page's symbol characters are PM Symbols, drawn for Puppet Master as SVG and embedded
  beside every text face for those characters only, and form controls take the look's face (F3-430).
gui_related: true
gui_classification_reason: Records an owner request on the concepts' fonts.
split_recommended: false
depends_on: [F3-430]
unblocks: [DR-050]
acceptance_criteria:
  - "Every theme face PMConcept7 draws in Basic, Glass, Friendly and Retro comes from embedded data."
  - "Every symbol character the page uses draws from PM Symbols in every look."
  - "The owner's request is recorded in plain words with its source hashes."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: theme_token_drift
reasoning_tier: standard
context_scope: concept_web_fonts
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/DRY_Rules.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm7-fonts-20261009/README.md, SHA-256 51df0972bff7f0f909d1cf3438aa1389eaa9e76c3b12b5ac8363814fbded11e4"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm7-fonts-20261009/proof-after.json, SHA-256 bfda89d92f00e53a7ad8dec195de68ff5ef1774443e4fb70868ce32bc061a82a"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm7-fonts-20261009/symbols-proof.json, SHA-256 e0f74c7c89eb6d80a7f48776822310df03989c1cf4e9d421cfe962af30f8ceae"
preserved_exact_tokens:
  - "DL-161"
  - "Gelasio"
  - "Georgia"
  - "PM Symbols"
negative_constraints:
  - "Do not load a concept font from the network."
owner_hints:
  - Plans/FinalGUISpec.md
  - Plans/DRY_Rules.md
```

### DL-158 - The Ask Card Fits Long Answers

```yaml
plan_unit_id: DL-158
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  DL-158 records the owner request of 2026-10-09. The questions card (the Ask Card) adjusts to long answers: it grows
  and shrinks with its content up to the room above the composer, then scrolls its body inside the card with Back,
  Skip, Next or Submit and close always in reach; long text and long web addresses wrap inside their rows; option and
  question descriptions are shown; Something else and the note grow as they are typed; review shows answers whole; a
  questionnaire whose content fits is unchanged (F3-609).
gui_related: true
gui_classification_reason: Records an owner decision on how the questions card handles long content.
split_recommended: false
depends_on: [DL-150]
unblocks: [F3-609]
acceptance_criteria:
  - "The Ask Card's behaviour and draft lifecycle are unchanged (assistant-chat-design section 7.4)."
  - "The owner's request is recorded in plain words with its source hash."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: question_card_presentation_drift
reasoning_tier: standard
context_scope: chat_fixes_20261009
implementation_surfaces:
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/c56-questionnaire-long-answers-20261009/JARED_REQUEST.md, SHA-256 b1b1280a6dac4c2b1afed428e91c817bba1c2e7c360bfdae59b3bdec34cacf52"
  - "Concepts/chat-assistant-concepts/5.6 Pro/Chat updates.md (concept lineage only)"
preserved_exact_tokens:
  - "DL-158"
  - "Ask Card"
negative_constraints:
  - "Do not cut long answers short to make them fit."
  - "Do not change the questionnaire's behaviour through its size."
owner_hints:
  - Plans/FinalGUISpec.md
```

### DL-154 - A Collaboration Setup Sheet's Graph Stays In View As Helpers And Rounds Are Added

```yaml
plan_unit_id: DL-154
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  DL-154 records the owner request of 2026-10-09. A collaboration setup sheet's cast plate stays a drawing at every
  team size its kind allows, up to eight helpers with both specialists: it never yields past the leanest drawing that
  fits its slot's width, the roster scrolls in its own region instead, and a team too wide for one strip row is drawn
  as the wrap, its seats on two or three rows with a fork from the lead and a join to You (F3-601). In the one-column
  narrow sheet the plate stays at the top while its question is on screen, and a run view whose team is too wide for
  one row draws the same wrap. A Chat Room's run card and preview track shows one stop per round up to the 20-round
  limit, and a track of eight or more stops wraps its dots down with its words on their own row (F3-602). One
  plate-slot fit rule, one cast grammar and one track primitive carry this everywhere (DR-045). Helper limits, round
  limits, commands, settings and wiring are unchanged. Jared reported that adding helpers pushed the graph out of view
  in every setup sheet and asked that it hold a higher number, and that many Chat Room rounds pushed the graphic off
  the screen and should wrap down; the record states it in plain words, without quoting him.
gui_related: true
gui_classification_reason: Records an owner decision on how collaboration graphs and tracks behave as teams and rounds grow.
split_recommended: false
depends_on: [DL-149, F3-566, F3-569, F3-592, F3-595]
unblocks: [F3-601, F3-602, DR-045]
acceptance_criteria:
  - "Each collaboration setup sheet shows a cast plate drawing at its 8-helper limit with both specialists (F3-601)."
  - "A Chat Room of 20 rounds shows 20 stops inside its card (F3-602)."
  - "No helper limit, round limit, command, settings key or wiring row changes."
  - "The owner request is recorded in plain words, with the verbatim source cited by path and SHA-256."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: wand_sheet_presentation_drift
reasoning_tier: high
context_scope: wand_modules_gui
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/DRY_Rules.md
  - Plans/00-plans-index.md
  - Plans/Decision_Log.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/c56-popup-graphs-20261009/JARED_REQUEST.md, SHA-256 46723a8829ea87fc5e01a261d81e92e32f3f1bc2e8a428af6704b1e3a91229e2"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/c56-popup-graphs-20261009/SURVEY-BEFORE.md, SHA-256 b4036f1bffdf0bfb65f40fa5062540f60960b072bb46c667a7bcb00f26e0ac5f"
  - "Concepts/chat-assistant-concepts/5.6 Pro/Chat updates.md (concept lineage only; branch fix/c56-popup-graphs-20261009)"
preserved_exact_tokens:
  - "DL-154"
  - "cast plate"
  - "the wrap"
negative_constraints:
  - "Do not scale a cast plate to fit, and do not let it fall to its caption while a drawing fits its width."
  - "Do not change a helper limit, a round limit, a command or a wiring row under this decision."
owner_hints:
  - Plans/FinalGUISpec.md
  - Plans/DRY_Rules.md
```

### DL-156 - The Plan Card's Buttons Line Up And Fit The Card In Every Theme

```yaml
plan_unit_id: DL-156
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  DL-156 records the owner request of 2026-10-09: the Plan card's buttons, which did not line up, are designed for
  the space in every theme. Every Plan surface's actions use one shared action row: one height and one type size,
  even gaps, Build as a boxed primary (DR-047). The transcript card has no tinted footer band: one hairline opens a
  status zone of the schedule line, the step count and the action row on the card's content edge (F3-606). The
  schedule line reads in rows, its decision controls on a row of their own (F3-607). Disabled Build labels keep full
  contrast. By the lead's ruling, a schedule that Build or an ended run invalidated, with no newer version, reads
  Schedule ended and offers no Use V<n> (SQR-015). No command, action id, wiring, setting or label is added or
  removed. The record states the request in plain words, without quoting him.
gui_related: true
gui_classification_reason: Records an owner decision on the Plan card's action row and schedule line layout.
split_recommended: false
depends_on: [DL-145, F3-566, SQR-015, APR-071]
unblocks: [F3-606, F3-607, DR-047]
acceptance_criteria:
  - "Every Plan action row has one control height and type size in all ten themes (F3-606, DR-047)."
  - "The schedule line's decision controls sit on their own row (F3-607), and an invalidated schedule with no newer version reads Schedule ended (SQR-015)."
  - "The owner request is recorded in plain words, with the source cited by path and SHA-256."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: plan_card_layout_drift
reasoning_tier: medium
context_scope: chat_plan_card_actions_20261009
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/Scheduling_and_Quota_Resume.md
  - Plans/DRY_Rules.md
  - Plans/Decision_Log.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/c56-plan-card-actions-20261009/JARED_REQUEST.md, SHA-256 4454066fa6584209b779ebf33441037b484f09f452599fcbef3477383782a93d"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/c56-plan-card-actions-20261009/JARED-SCREENSHOT-retro-light.png, SHA-256 e668fe203ee8aeeb9c9ed1e8aa2f263f525188ce14d4a837958074aace4b839b"
  - "Concepts/chat-assistant-concepts/5.6 Pro/Chat updates.md (concept lineage only)"
preserved_exact_tokens:
  - "DL-156"
  - "Schedule ended"
  - "action row"
negative_constraints:
  - "Do not add a command, action id or setting for this layout."
owner_hints:
  - Plans/FinalGUISpec.md
  - Plans/DRY_Rules.md
```

### DL-160 - The To-Do Navigation Line Loses Its Last Item Button

```yaml
plan_unit_id: DL-160
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  DL-160 records the owner's decision of 2026-10-09. The Last item button is removed from the To-Do panel's navigation
  line, which keeps the visible count, "N visible of M items", and Expand all and nothing else (F3-593). The button
  jumped the list to the final item and selected it, and nothing takes its place. The search field still finds any
  title or exact ID, and the list reaches its final item by scrolling after Expand all has opened every parent. No
  command, wiring entry, setting or To-Do state changes: the button never had a command ID, so the UI command catalog,
  Commands_System and the Wiring Matrix hold no row for it and none is retired.
gui_related: true
gui_classification_reason: Records the owner's removal of one control from the To-Do panel's navigation line in Activity Detail.
split_recommended: false
depends_on: [DL-147]
unblocks: [F3-593]
acceptance_criteria:
  - "The To-Do navigation line holds the visible count and Expand all only, and no Last item control exists in the panel (F3-593)."
  - "No command, wiring row, setting or To-Do state is added or retired by this change."
  - "The removal is recorded with its date, 2026-10-09."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: todo_navigation_control_drift
reasoning_tier: high
context_scope: todo_navigation_line_20261009
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/Decision_Log.md
  - Plans/00-plans-index.md
  - Concepts/chat-assistant-concepts/5.6 Pro/todos.js
  - Concepts/chat-assistant-concepts/5.6 Pro/Chat updates.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Concepts/chat-assistant-concepts/5.6 Pro/Chat updates.md (To-Dos section; concept lineage only)"
preserved_exact_tokens:
  - "DL-160"
  - "Expand all"
  - "visible of"
negative_constraints:
  - "Do not add a replacement for the Last item button to the To-Do navigation line."
  - "Do not add a command, wiring row or setting for the removed button."
owner_hints:
  - Plans/FinalGUISpec.md
```

### DL-162 - The Left Rail Takes The Polish Design

```yaml
plan_unit_id: DL-162
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  DL-162 records the owner decision of 2026-10-09 that the left rail takes concept D, "Polish", of the left-rail
  review copy. The nine rail panels keep the Cozy Shelves structure and coloured shelf boxes with tighter geometry
  (a 3 px gutter, a 2 px inset, an outer radius R and an inner radius R minus the inset, row names 24 px from the
  rail edge), one type ladder with nothing under 11 px, and the looks' own faces (F3-618). Statuses are a glyph
  whose shape is the state plus a coloured word, counts are plain tabular numbers, and nothing is a pill or carries a
  coloured side bar (F3-619). Text fits by layout and is never abbreviated, tab strips included (F3-620; F3-480 (3),
  F3-445, CRAU-098, UCC-136 and GI-039 amended). Every rail dropdown is the chat picker, and motion is per theme family:
  Basic crisp, Friendly springy, Glass gliding with blur only on the shelf boxes, Retro stepped and NieR Mode ink,
  under the Animation speed and reduced-motion settings (F3-621). The worktree owner filter becomes an Owner
  dropdown and the publish and review card folds (F3-622, W-075 amended), with no new command. DR-057 keeps the
  grammar in one owner. Open owner questions: whether the rail's glyphs and the chat's 13 status marks (F3-585)
  should be one set, and whether the rail's frosted scroll-under plates fit F3-431's blur budget. Settled later
  under this decision: the Jujutsu view's tabs (DL-163), the remaining panels and the bottom Debug tab in their
  owner units with no new command, action or wiring row, the paused, immutable and errored glyphs (F3-619), and the
  More tray as the chat picker (F3-625).
gui_related: true
gui_classification_reason: Records an owner decision on the left rail's presentation.
split_recommended: false
depends_on: [F3-472, F3-474, F3-480, F3-445, F3-471]
unblocks: [F3-618, F3-619, F3-620, F3-621, F3-622, F3-625, DR-057]
acceptance_criteria:
  - "The rail's geometry, type, statuses, fitting, dropdowns and motion are owned by F3-618 to F3-622, and the amended consumer units point at them."
  - "No command, action or wiring row is added by this decision."
  - "The owner's decision is recorded in plain words with its source hash."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: rail_presentation_drift
reasoning_tier: high
context_scope: left_rail_polish
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/DRY_Rules.md
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/UI_Command_Catalog.md
  - Plans/GitHub_Integration.md
  - Plans/WorktreeGitImprovement.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/FileManager.md
  - Plans/Automated_Testing_System.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/leftrail-polish-20261009/JARED-REQUEST-20261009.md, SHA-256 4923cfc785f4dc020d5bd3ae86e4bf62946a2155572013ee353182dd9bf46b06"
  - "Concepts/leftrail-redesign/src/concepts/d/ at commit c93e341606 (concept lineage only)"
preserved_exact_tokens:
  - "DL-162"
  - "Polish"
  - "never abbreviated"
negative_constraints:
  - "Do not add a command, an action or a wiring row through this decision."
  - "Do not reintroduce pills, coloured side bars or abbreviated labels in the left rail."
owner_hints:
  - Plans/FinalGUISpec.md
  - Plans/DRY_Rules.md
```

### DL-163 - The Jujutsu View Of Source Control Gets Its Own Five Tabs

```yaml
plan_unit_id: DL-163
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  DL-163 records the answer of 2026-10-09 to the owner's question whether the Jujutsu view of Source Control should
  have tabs, which he left to the left-rail build (DL-162). It does: Jujutsu gets its own strip of five views, one at
  a time, Changes, Workspaces, History, Bookmarks and Operation Log, in JJI section 4.1's order and JJI-006's
  registered words, while Git keeps its own Changes, Worktrees, History and Branches strip, hidden in Jujutsu mode;
  neither strip relabels the other (JJI-001, JJI-006). The first four views share slot positions with Git's, so the
  presentation-only engine switch (ui.source_control.profile.preview) opens the same slot and Operation Log opens
  Git's History. Both Source Control strips fit by their longest label, so a strip never changes mode while one
  clicks through it. Publish and review stays the footer card in both engines, and Jujutsu mode adds Undo and
  Refresh to the panel head (F3-623). The five views list the current change, workspaces, stacks of changes,
  bookmarks per remote and operations with existing commands only (F3-624). SCS-005 records the per-engine tab
  strips, the footer card and the bookmark state axes; F3-529, F3-552, UCC-163 and JJI-008 call the fifth view
  Operation Log. Open: disabled-reason codes for the concept's local reasons, an update command for an out-of-date
  workspace, what Undo reverts after an automatic working-copy save, and, for the owner, whether a change's short
  ID shows on its row and whether to keep "Operation Log".
gui_related: true
gui_classification_reason: Records an owner decision on the Jujutsu view of the Source Control rail panel.
split_recommended: false
depends_on: [DL-162, JJI-006, SCS-005, F3-529]
unblocks: [F3-623, F3-624]
acceptance_criteria:
  - "The Jujutsu view's strip, views, rows and actions are owned by F3-623 and F3-624, and SCS-005, F3-529, F3-552, UCC-163 and JJI-008 point at them or use their label."
  - "No command, action, schema value or wiring row is added by this decision."
  - "The owner's question and the two choices left to him are recorded in plain words with the request's source hash."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: rail_presentation_drift
reasoning_tier: high
context_scope: left_rail_polish
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/Source_Control_System.md
  - Plans/Jujutsu_Integration.md
  - Plans/UI_Command_Catalog.md
  - Plans/GitHub_Integration.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/leftrail-polish-20261009/JARED-REQUEST-20261009.md, SHA-256 4923cfc785f4dc020d5bd3ae86e4bf62946a2155572013ee353182dd9bf46b06 (issue 2)"
  - "The left-rail build's Jujutsu tab decision, revision 2 of 2026-10-09, summarised in the DL-163 entry (not a repository file)"
  - "Concepts/leftrail-redesign/src/concepts/d/ from lane commits 8693996260 and 2f77b78710 (concept lineage only)"
preserved_exact_tokens:
  - "DL-163"
  - "Operation Log"
  - "ui.source_control.profile.preview"
negative_constraints:
  - "Do not add a command, an action, a disabled-reason code or a wiring row through this decision."
  - "Do not alias Bookmarks to Branches or Workspaces to Worktrees by relabelling one strip for both engines."
owner_hints:
  - Plans/FinalGUISpec.md
  - Plans/Jujutsu_Integration.md
  - Plans/Source_Control_System.md
```

### DL-180 - Home Becomes One Universal Panel System And The Chat Stays Fixed On The Right

```yaml
plan_unit_id: DL-180
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  DL-180 records Jared's decisions of 2026-10-09 on the home page, the first Decision Log entry about the home layout.
  The middle of the window becomes one universal panel system: an n-ary split tree of panels with sizes as
  proportions, each panel a tab group that holds any tab kind, maximize a flag outside the tree, a panel dragged below
  half its minimum folding to its tab strip, a full-width bottom row in the default layout that is an ordinary panel
  row, and four named layouts (Home, Build, Terminals 2x2, Focus) (F3-630). One tab strip serves every panel, the
  dashboard's included, with the contact-aware silhouette as the only active-tab marker and the active tab one surface
  with its panel in every look, Glass dark included, on a 35 px strip of 31 px tabs 8 px apart (Retro 2 px) (F3-631); a "+" after the last
  tab opens a menu of kinds as a new tab or a new panel (F3-632); a plain-text "+N" lists the tabs that do not fit
  (F3-633). Every file reference a person clicks opens by one rule set: a single click opens the panel's preview tab,
  a double click or an edit keeps it, an open file is revealed where it is, Alt+click opens a new panel, and files go
  to the last-focused panel that holds documents; what the user clicks in the chat opens and takes focus, and what an
  agent opens lands as a background tab with a hollow square in the last-focused panel holding that kind (F3-634,
  DR-071, CV-360). The tab kinds are listed once (F3-635); the narrow ladder keys on the centre's width (F3-636); the
  chat is a fixed right column from the title bar to the status bar, never a tab and never moved inside the window,
  with Pop out its only way to move (F3-637); dashboard tabs can show every Usage widget, several at once, each with its own layout (F3-638, WS-030);
  the Guided Tour stops asking the learner to move the chat and goes from 18 to 20 steps, a saved position at a retired
  step resuming at the start of its chapter (PWIZ-035); Output is one tab, id output, whose channel is view state,
  with a channel split off by Open in new tab as output:<channel> (F3-635, UCC-200; Jared, 2026-10-10). The old Home model of four fixed editor
  panels, one dashboard, terminal sections in a bottom zone and a movable chat came from an audit packet, not from an
  owner decision, and is superseded; an existing layout is converted, never reset (SP-330). Lead rulings recorded
  under the decisions: Output, Problems, Ports and Debug Console are dedicated tool kinds that land beside the
  terminals; activating a tab and maximizing are view state; every committed change emits the existing
  workspace.layout_changed.
gui_related: true
gui_classification_reason: Records the owner decision that replaces the home page's panel model, tabs, opening rules and chat position.
split_recommended: false
depends_on: []
unblocks: [F3-630, F3-631, F3-632, F3-633, F3-634, F3-635, F3-636, F3-637, F3-638, F3-639, F3-647, DR-065, DR-066, DR-067, DR-071, UCC-200, UCC-202, UCC-203, CS-100, CS-101, WM-090, WM-092, UIW-040, UIW-041, SSYS-050, SP-330, CV-360, CV-361, ACD-500, PWIZ-035, WS-030, F-090, RAP-065, ATS-075, GRRC-040, G-030]
acceptance_criteria:
  - "Output is one tab with the id output whose channel is view state; a channel split off by Open in new tab is output:<channel>; the tour has 20 steps with move_or_dock_chat retired, and a saved position at a retired step resumes at the start of its chapter (F3-635, UCC-200, PWIZ-035)."
  - "Canon describes one panel model for the home centre: a split tree whose panels each hold any tab kind, with the bottom row an ordinary panel row, and no fixed editor panels, singleton dashboard, terminal sections or bottom runtime zone remain active (F3-630)."
  - "One tab strip, one \"+\" menu and one \"+N\" list serve every panel, the dashboard's included (F3-631, F3-632, F3-633, DR-065)."
  - "Every caller that opens something goes through one opening module with one placement rule and one placement field set (F3-634, DR-071, CV-360)."
  - "The chat is a fixed right column whose only way to move is Pop out, with the width rule and History flyout of F3-637, and no unit still describes chat docking or floating inside the window as active."
  - "An existing Home layout is converted to the v2 record on first read and never reset (SP-330)."
  - "The Guided Tour's workspace chapter teaches the four new steps and no longer asks the learner to move or dock the chat (PWIZ-035)."
  - "Jared's words are quoted verbatim, the planning thread's accepted recommendations and the lead's rulings are labelled as such, and the source is cited by path and SHA-256."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: home_panels_terminal_redesign_drift
reasoning_tier: high
context_scope: home_panels_terminal
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/DRY_Rules.md
  - Plans/UI_Command_Catalog.md
  - Plans/Commands_System.md
  - Plans/Wiring_Matrix.md
  - Plans/Wiring_Matrix.production.json
  - Plans/UI_Wiring_Rules.md
  - Plans/Settings_System.md
  - Plans/settings_inventory.json
  - Plans/storage-plan.md
  - Plans/storage_value_registry.json
  - Plans/Contracts_V0.md
  - Plans/home_workspace_layout_v2.schema.json
  - Plans/assistant-chat-design.md
  - Plans/Planning_Wizard.md
  - Plans/guided_tour_contracts.schema.json
  - Plans/Widget_System.md
  - Plans/FileManager.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/Automated_Testing_System.md
  - Plans/GUI_Rebuild_Requirements_Checklist.md
  - Plans/Glossary.md
  - Plans/00-plans-index.md
  - Plans/Decision_Log.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-147 (cited, not a dependency, so units that compile this record close no dependency cycle through it)"
  - "Plans/Decision_Log.md#DL-161 (cited, not a dependency, so units that compile this record close no dependency cycle through it)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64 (D1-D10, D21, D23-D25, D28)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/proposal-visual.html, SHA-256 52dd51521a1266e39a2ab6b274176d89666baaaacb1d933e5cc2237c151ab981 (the agreed anatomy)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-CONTRACT-v1-778c8494e6.md, SHA-256 aa16fc080f44f6824b0ef32a2b568bfcae81277b6962caaba1b441015d68dae9 (concept lineage only)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-NUMBERS-407e6fb6fe.md, SHA-256 019721f5215d95c80b999d5b61e1ee4bf79b29afc5b229a12bccde6f738c5162 (concept lineage only)"
preserved_exact_tokens:
  - "DL-180"
  - "+N"
  - "Terminals 2x2"
  - "cmd.panel_tab.open"
  - "cmd.workspace_layout.split"
  - "ui.panel_tab.activate"
  - "workspace.layout_changed"
  - "home_workspace_layout.v2"
negative_constraints:
  - "Do not reintroduce fixed editor panel slots, a singleton dashboard surface, terminal sections or a fixed bottom runtime zone."
  - "Do not let the chat be docked, floated or moved inside the window; Pop out is its only way to move."
  - "Do not give any caller its own opening or dedupe rule."
  - "Do not reset a user's layout on upgrade."
owner_hints:
  - Plans/FinalGUISpec.md
  - Plans/DRY_Rules.md
  - Plans/UI_Command_Catalog.md
  - Plans/storage-plan.md
```

### DL-181 - The Terminal Is Rebuilt As One Session Per Tab With No AI Of Its Own

```yaml
plan_unit_id: DL-181
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  DL-181 records Jared's decisions of 2026-10-09 on the terminal. The terminal is an ordinary tab kind with one
  session per tab and no splits inside it; Split makes a new panel beside it with the same folder and shell; sections,
  workgroups, sub-tabs, in-tab splits, the editor terminal stack and the Quadrant layout retire, and the Terminals 2x2
  named layout makes four terminal panels (SMPFS-180). Its chrome is a readable tab label (process and folder, the
  exit code of a failed command, the agent mark) and one header row with the folder, branch, running command and
  elapsed time, then Find, Split, Maximize and a menu, with 24 px targets, no bottom bar and no internal ids (F3-640).
  It gains command marks drawn as glyphs, a sticky command header, command jumps, path links that open by the one
  opening rule, find, a minimap-style scrollbar, copy mode and quick select, inactive dimming, progress, a visual
  bell, IME and an accessible text buffer (F3-641, SMPFS-183). People and agents share terminals safely: a keystroke
  takes over and pauses the agent, agents type into a human's terminal only when allowed (Allow once for one command,
  or Allow in this terminal: an in-memory grant to that agent that ends when the terminal closes, the human takes over
  or the agent's run ends, and that never replaces the per-invocation command approval of SMPFS-024 and PS-041),
  secret prompts go only to the human, every command records who typed it, and the marks carry a per-terminal secret (SMPFS-182, F3-646). There
  is no AI inside the terminal: Explain What Commands Do moves to the Teacher persona in the chat. DL-035's own engine
  stands; other terminals are design references only (SMPFS-184). Lead ruling where the answer is silent: moving,
  folding, maximizing or hiding a terminal tab never touches its session; closing it ends the session after saying
  what is still running; reopening a closed terminal tab, or restoring one whose session did not survive, starts a new
  session in the same folder and profile and never pretends to be the old one.
gui_related: true
gui_classification_reason: Records the owner decision that rebuilds the terminal as a tab kind with new chrome, features and agent rules.
split_recommended: false
depends_on: [DL-180]
unblocks: [SMPFS-180, SMPFS-182, SMPFS-183, SMPFS-184, F3-640, F3-641, F3-646, UCC-201, WM-091, UIW-042, ACD-502, CV-362, SP-332, ATS-076]
acceptance_criteria:
  - "Canon holds one terminal session per tab; no active unit describes terminal sections, workgroups, sub-tabs, in-tab splits, the Quadrant layout or the four-section and four-pane caps (SMPFS-180)."
  - "The terminal tab's chrome and features are owned once (F3-640, F3-641, SMPFS-183), with marks drawn as glyphs and never as stripes."
  - "The agent rules hold: takeover by keystroke, agent input into a human's terminal only when allowed, secret prompts only to the human, attribution of every command, marks protected by a per-terminal secret (SMPFS-182)."
  - "No AI feature exists in the terminal surface, and code.terminal.explanations is retired in favour of the Teacher persona."
  - "DL-035's own-engine direction is unchanged."
  - "Jared's words are quoted verbatim and the lead's rulings on sessions and on the Allow in this terminal grant are labelled as such."
  - "No unit stores an agent's terminal write grant, keeps it after the terminal closes, the human takes over or the agent's run ends, or lets it stand in for command approval."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: home_panels_terminal_redesign_drift
reasoning_tier: high
context_scope: home_panels_terminal
implementation_surfaces:
  - Plans/Section15_MVP_Promoted_Features_Spec.md
  - Plans/FinalGUISpec.md
  - Plans/Personas.md
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.md
  - Plans/UI_Wiring_Rules.md
  - Plans/settings_inventory.json
  - Plans/storage-plan.md
  - Plans/Contracts_V0.md
  - Plans/assistant-chat-design.md
  - Plans/Automated_Testing_System.md
  - Plans/Decision_Log.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-035 (cited, not a dependency, so units that compile this record close no dependency cycle through it)"
  - "Plans/Decision_Log.md#DL-037 (cited, not a dependency, so units that compile this record close no dependency cycle through it)"
  - "Plans/Decision_Log.md#DL-038 (cited, not a dependency, so units that compile this record close no dependency cycle through it)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64 (D11-D13, D18-D20)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/terminal-ARCHITECTURE-542703c07c.md, SHA-256 b6daf31a8953b3d7b633dd0db0a7b8a0ecba41f4533e8d6db6df5fa0f08bf476 (concept lineage only)"
preserved_exact_tokens:
  - "DL-181"
  - "Take over"
  - "Interrupt"
  - "Stop"
  - "Explain What Commands Do"
  - "code.terminal.explanations"
negative_constraints:
  - "Do not add splits, sections or workgroups inside a terminal tab."
  - "Do not add an AI feature to the terminal surface."
  - "Do not let an agent answer a password or secret prompt, or type into a human-opened terminal without the human's grant."
owner_hints:
  - Plans/Section15_MVP_Promoted_Features_Spec.md
  - Plans/FinalGUISpec.md
```

### DL-182 - The Terminal Shows Images With Kitty Graphics Sixel And iTerm2 All In The First Release

```yaml
plan_unit_id: DL-182
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  DL-182 records Jared's decision of 2026-10-09 on terminal images, the decision the terminal research of 2026-09-09
  (DL-035) left out. The first terminal release has the complete kitty graphics protocol (direct, file, temporary-file
  and shared-memory transmission, placements, Unicode placeholders, layering above and below text, and animation),
  sixel, and iTerm2 inline images, with no phases. File, temporary-file and shared-memory transfers follow the
  protocol's hardening rules, are refused in remote sessions and for commands an agent typed, and are bounded by per-
  image, per-sequence and per-screen-buffer limits (no product-wide total in wave 1); a program that sends too much is refused, never allowed to freeze the app.
  Images persist with the terminal's saved scrollback within its storage quota, an evicted image leaving a short text
  placeholder that names it; animation pauses under Reduced Motion and while the terminal is hidden; images read as a
  short text placeholder in the accessible buffer and in agent output reads (SMPFS-181, F3-645). DL-035's own-engine
  rule stands: an image decoder is not a terminal emulator, parser or process host. The quota numbers come from the
  terminal concept's measurements.
gui_related: true
gui_classification_reason: Records the owner decision that admits three image protocols into the terminal's first release.
split_recommended: false
depends_on: [DL-181]
unblocks: [SMPFS-181, F3-645, ATS-076]
acceptance_criteria:
  - "SMPFS-181 owns the three protocols, their hardening rules, the remote refusal and the quotas, and F3-645 owns how images look in a tab."
  - "No unit still says image protocols are not approved."
  - "DL-035 is amended to point at this decision, with its own-engine rule unchanged."
  - "Jared's words are quoted verbatim, including his correction that there are no phases."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: home_panels_terminal_redesign_drift
reasoning_tier: high
context_scope: home_panels_terminal
implementation_surfaces:
  - Plans/Section15_MVP_Promoted_Features_Spec.md
  - Plans/FinalGUISpec.md
  - Plans/Settings_System.md
  - Plans/Automated_Testing_System.md
  - Plans/Decision_Log.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-035 (cited, not a dependency, so units that compile this record close no dependency cycle through it)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64 (D14)"
  - "Plans/ledgers/v2/pldg-20260908-001-terminal-research-repairs (image protocols left as a separate decision)"
preserved_exact_tokens:
  - "DL-182"
  - "kitty graphics protocol"
  - "sixel"
  - "iTerm2"
  - "Unicode placeholders"
negative_constraints:
  - "Do not phase the three protocols or ship one without the others."
  - "Do not read device files, FIFOs, sockets or anything that is not a regular file (outside /dev/shm), and do not accept file, temporary-file or shared-memory media from a remote session."
  - "Do not let saved images exceed the scrollback storage quota; an evicted image leaves a text placeholder naming it."
owner_hints:
  - Plans/Section15_MVP_Promoted_Features_Spec.md
  - Plans/FinalGUISpec.md
```

### DL-183 - The Terminal Gets Real Colour Schemes Backgrounds Effects And Fonts All Applying Live

```yaml
plan_unit_id: DL-183
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  DL-183 records Jared's decisions of 2026-10-09 on the terminal's appearance. The terminal follows the theme by
  default with a colour scheme chosen per look (Friendly Catppuccin, Glass Tokyo Night, Retro Puppet Master's Phosphor
  Green and Amber and Paper Teletype, Basic One Half, NieR Mode's YoRHa Parchment and Ink), offers about 30 curated
  schemes with clear licences, imports common theme files, and keeps a minimum-contrast floor. Cursor, background,
  padding, line height, letter spacing, ligatures and weight are choices, every one applying live with no restart. One
  layered appearance model resolves field by field from the look's defaults, the app default, a project default and a
  per-tab override; one code colour-scheme catalog serves the editor and the terminal, each scheme carrying the
  terminal palette and the editor's syntax colours, each surface defaulting to Follow look with its own scheme choice
  and the editor reusing the terminal's Appearance popover, and Retro's monochrome editor syntax takes its colour from
  the terminal's Retro scheme choice, stored once in the terminal's appearance model (Jared, 2026-10-10); the terminal's Appearance popover and Settings > Terminal bind the same model (F3-642, DR-068,
  SSYS-051, SP-331). Effects run only on the focused terminal, stop when idle, turn off on battery saver and where
  costly without a graphics card, and stop moving under Reduced Motion; the Full CRT tier is opt-in and flicker is off
  by default and capped below WCAG 2.3.1 (F3-643). The editor's code face is JetBrains Mono in every look, Retro
  included; the terminal defaults to JetBrains Mono except in Retro, where it defaults to VT323 with Sixtyfour and
  Departure Mono as options and JetBrains Mono selectable; Atkinson Hyperlegible Mono is offered for readability; only
  permissively licensed fonts (SIL Open Font License, Apache, MIT) are built in, through DL-161's pipeline (F3-644).
  General code text across the chat and PMConcept7 (JetBrains Mono in Basic, Glass and Friendly, IBM Plex Mono in
  Retro, PM NieR Mono in NieR; Jared, 2026-10-10, D17a) belongs to DL-161, F3-426 and F3-430 and is not amended by
  this record. The 34 schemes, the 4.5:1 default contrast floor and the terminal's own font files are the terminal concept's.
gui_related: true
gui_classification_reason: Records the owner decision on the terminal's schemes, backgrounds, effects and built-in code fonts.
split_recommended: false
depends_on: [DL-181]
unblocks: [F3-642, F3-643, F3-644, DR-068, SSYS-051, SP-331]
acceptance_criteria:
  - "One code colour-scheme catalog and one Appearance popover serve the editor and the terminal, each surface defaulting to Follow look with its own scheme choice, and Retro's monochrome editor syntax reads the terminal's Retro scheme choice from the terminal's appearance model with no second stored copy (F3-642, F3-639, DR-068)."
  - "One terminal appearance model exists with four layers resolved field by field, and every field applies live with no restart badge (F3-642, DR-068, SSYS-051)."
  - "Each look has its default scheme, and the curated schemes carry their licences."
  - "Effects follow the focused-only, idle-stop, battery, no-GPU and Reduced Motion policy, with Full CRT opt-in and flicker off by default (F3-643)."
  - "The editor's code face is JetBrains Mono in every look and the terminal's default face is JetBrains Mono except VT323 in Retro, and every built-in font is under the SIL Open Font License, Apache or MIT (F3-644)."
  - "DL-161, F3-426 and F3-430 are cited for general code text and are not amended by this record."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: home_panels_terminal_redesign_drift
reasoning_tier: high
context_scope: home_panels_terminal
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/DRY_Rules.md
  - Plans/Settings_System.md
  - Plans/settings_inventory.json
  - Plans/storage-plan.md
  - Plans/Decision_Log.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-161 (cited, not a dependency, so units that compile this record close no dependency cycle through it)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64 (D15-D17)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS-ADDENDUM-1.md, SHA-256 1651ae9c41a61f215ee960288b27bb78ee8d9ad804c741495e3313ff4a33e299 (D17a)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/terminal-SPEC-1-d605b4a256.md, SHA-256 71784f23a24c3f922292c8979093e0e5bcbdb1c49392da0d8cd9bd04533ea7c2 (concept lineage only)"
preserved_exact_tokens:
  - "DL-183"
  - "Follow look"
  - "JetBrains Mono"
  - "VT323"
  - "Sixtyfour"
  - "Departure Mono"
  - "Atkinson Hyperlegible Mono"
  - "WCAG 2.3.1"
negative_constraints:
  - "Do not mark a terminal appearance setting as needing a restart."
  - "Do not keep a second terminal theme or font store beside the one appearance model."
  - "Do not build in a font whose licence is not SIL Open Font License, Apache or MIT."
owner_hints:
  - Plans/FinalGUISpec.md
  - Plans/DRY_Rules.md
  - Plans/Settings_System.md
```

### DL-184 - No Boxes With A Coloured Side No Emoji And No Pills Anywhere In Puppet Master

```yaml
plan_unit_id: DL-184
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  DL-184 records Jared's rule of 2026-10-09, restated for the home redesign, as one shell-wide rule: no box with a
  coloured border or stripe on one side, no emoji in Puppet Master's own chrome, and no pills (fully rounded capsules
  used as tabs, tags, badges, buttons or status chips) anywhere in Puppet Master; keyboard key caps stay the one
  capsule-like shape allowed, and a program's own output in the terminal may contain emoji (DR-069, F3-648). Selection
  is shown by the surface itself, never by an edge stripe. The shell's default 3 px left-edge selection stripe, the
  accent left borders and the pill skins on tab-like controls retire; the chat's, Settings' and the left rail's own
  statements of the rule stay as instances of the one rule.
gui_related: true
gui_classification_reason: Records the owner's shell-wide ban on side stripes, emoji and pills.
split_recommended: false
depends_on: []
unblocks: [DR-069, F3-648]
acceptance_criteria:
  - "DR-069 states the rule once for the whole app and F3-648 owns its presentation."
  - "Section 3.5's selection stripe, F3-039's token, F3-276's accent left border, F3-469's inset left accent bar and the pill skins named by F3-648 carry dated retirement notes."
  - "Jared's words are quoted verbatim."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: home_panels_terminal_redesign_drift
reasoning_tier: high
context_scope: home_panels_terminal
implementation_surfaces:
  - Plans/DRY_Rules.md
  - Plans/FinalGUISpec.md
  - Plans/Decision_Log.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64 (D22 and Jared's brief)"
preserved_exact_tokens:
  - "DL-184"
negative_constraints:
  - "Do not draw a coloured border or stripe on one side of a box, a pill-shaped control, or an emoji in Puppet Master's chrome."
owner_hints:
  - Plans/DRY_Rules.md
  - Plans/FinalGUISpec.md
```

### DL-185 - One Demo Studio For All Of PMConcept7 And What The 5.6 Pro Chat Needs When It Moves In

```yaml
plan_unit_id: DL-185
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  DL-185 records Jared's decisions of 2026-10-09 on demo controls and the later chat port. PMConcept7's demo controls
  (the tour's, onboarding's, the chat's, the home demos', and later the Orchestrator and Planning Wizard pages') fold
  into one centralized Demo Studio modelled on the 5.6 Pro chat's; it is a concept tool and never a product control,
  setting, command, wiring row, saved value or test gate (F3-649, DR-070, in the pattern of ACD-474). When the 5.6 Pro
  chat is ported, after this redesign is published: its Basic, Friendly and Glass colours are fixed to match
  PMConcept7's, its class names are namespaced, it sizes by its own column, it uses the one overlay root and stacking
  order, PMConcept7's hover system owns its hover tags, its inline Shell box becomes a compact command card that opens
  the terminal tab, its pills and side stripes are removed, and its demo controls move into the Demo Studio (ACD-501,
  ACD-500). Publishing the redesign into PMConcept7 follows the NieR showpiece, the 5.6 Pro round with its fonts, the
  Usage port, the left rail and the hover polish.
gui_related: true
gui_classification_reason: Records the owner decisions on one Demo Studio and the requirements of the later chat port.
split_recommended: false
depends_on: [DL-180, DL-184]
unblocks: [F3-649, DR-070, ACD-501]
acceptance_criteria:
  - "One Demo Studio is owned by F3-649 and DR-070 and is excluded from every product catalog, setting, wiring row, persisted key and test gate."
  - "ACD-501 lists the chat port's requirements and says the port follows this redesign."
  - "Jared's words are quoted verbatim."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: home_panels_terminal_redesign_drift
reasoning_tier: high
context_scope: home_panels_terminal
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/DRY_Rules.md
  - Plans/assistant-chat-design.md
  - Plans/Decision_Log.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64 (D26-D28)"
preserved_exact_tokens:
  - "DL-185"
  - "Demo Studio"
negative_constraints:
  - "Do not give the Demo Studio or any demo control a command, setting, wiring row, persisted key or test gate."
  - "Do not draw a separate demo panel per surface."
owner_hints:
  - Plans/FinalGUISpec.md
  - Plans/DRY_Rules.md
  - Plans/assistant-chat-design.md
```
