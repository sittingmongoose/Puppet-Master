# Shard 005: PlanUnits

Source: `Plans/Decision_Log.md`

Source lines: L127-L1500

Source SHA256: `903a5cc05c94247222af6abc77ff7561d27acc543d84f453eae84aaec332f594`

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
