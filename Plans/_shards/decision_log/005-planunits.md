# Shard 005: PlanUnits

Source: `Plans/Decision_Log.md`

Source lines: L679-L3361

Source SHA256: `d913d458dee4fa50b3edfee8d3ecb6553e418421bf568c867f5029025269705d`

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
