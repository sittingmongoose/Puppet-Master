# Shard 005: PlanUnits

Source: `Plans/Decision_Log.md`

Source lines: L1744-L6569

Source SHA256: `9af90b69abe5c8685b5de674fbc9f88b1acb6908d1b5d1d210db0b384c92c728`

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
  following the Step 4 and Step 8 precedent, the landing also regenerates the readiness
  projections and the entry records the registry SHA-256. The Decision Log entry
  each such landing adds names the family and is the decision entry its DL-077 admission
  record cites. Any other registry change, or a registration that skips part of the
  procedure, still needs Jared's own approval. Jared can revoke the rule at any time.
gui_related: false
gui_classification_reason: Defines checkpoint approval governance for event registration, not visual presentation.
split_recommended: false
depends_on: [DL-039, DL-045, DL-046]
unblocks: []
acceptance_criteria:
  - A registration landing under this rule moves EVENT_FAMILY_REGISTRY_REVISION, EVENT_FAMILY_REGISTRY_KERNEL_ROW_COUNT and their provenance comment, the test pins in tests/test_pm_testing_session_events.py and tests/test_pm_github_project_integration.py, and the readiness projections in the same landing.
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
  storage.recovery_applied and storage.compaction_lifecycle_changed, and the
  application-scoped evaluations of platform.capability_evaluated, are counted in one
  application-wide bucket that takes the place of the project bucket, with the same
  2,000,000-record cap, fail-closed overflow and seven-year period. Project-scoped
  records keep per-project counting. This is the policy-owner decision the SP-291
  adapter seam waits for; the Storage retention owner writes it into its policy text and
  binds the bucket under DL-045, with no new policy object and no other policy value
  changed. Until that owner edit lands, the four retention cells in the Step 8 depth
  assessment stay PARTIAL. Nothing is registered or admitted.
gui_related: false
gui_classification_reason: Decides retention cardinality counting, not visual presentation.
split_recommended: false
depends_on: [DL-039, DL-045]
unblocks: []
acceptance_criteria:
  - Storage owner text counts the application-scoped records of the four families in one application-wide bucket under RP-OPERATIONAL-2555D with its unchanged cap, overflow and period, and replaces the unproved adapter seam statement with that binding.
  - No new retention policy object is created and no RP-OPERATIONAL-2555D value changes; project-scoped records keep per-project counting.
  - Until that owner edit lands, the Step 8 depth assessment keeps the four retention cells PARTIAL.
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
owner_hints:
  - Plans/storage-plan.md
  - Plans/storage_value_registry.json
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
