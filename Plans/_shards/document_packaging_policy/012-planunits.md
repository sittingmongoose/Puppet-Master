# Shard 012: PlanUnits

Source: `Plans/Document_Packaging_Policy.md`

Source lines: L352-L1729

Source SHA256: `3c834360059f6f49f22343004eccfccf69dd569792ef84a958cca9bc74013a77`

---

## PlanUnits

### DPP-002 - Scope, Alignment, and Canon Boundaries

```yaml
plan_unit_id: DPP-002
unit_type: requirement
status: accepted
owner_doc: Plans/Document_Packaging_Policy.md
canonical_text: Document Packaging Policy defines deterministic packaging for long Markdown/text artifacts under .puppet-master/** into Document Sets, while Plans/_shards/** remains process-mirror output and plan graph remains the separate sharded JSON mechanism under .puppet-master/project/plan_graph/index.json with nodes/<node_id>.json shards.
gui_related: false
gui_classification_reason: This unit defines backend/governance packaging behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of DPP-001.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: document_packaging_policy_drift
reasoning_tier: standard
context_scope: document_packaging_policy_standardization
implementation_surfaces:
- Plans/Document_Packaging_Policy.md
node_compile_hint:
  mode: scope_alignment_and_canon_boundaries
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Document_Packaging_Policy-S0001
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Document_Packaging_Policy-S0002
preserved_exact_tokens:
- Document Packaging Policy (Canonical)
- .puppet-master/**
- Document Sets
- Plans/_shards/**
- .puppet-master/project/plan_graph/index.json
- nodes/<node_id>.json
- 'ContractRef: ContractName:Plans/Project_Output_Artifacts.md, ContractName:Plans/DRY_Rules.md#7'
negative_constraints:
- Shard mirrors under Plans/_shards/** are process mirrors, not canonical Document Set sources or live edit targets.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plan graph ownership stays with Plans/Project_Output_Artifacts.md; this policy owns large text artifact packaging.
owner_hints:
- Plans/Document_Packaging_Policy.md
```

### DPP-003 - Document Set Directory Contract

```yaml
plan_unit_id: DPP-003
unit_type: requirement
status: accepted
owner_doc: Plans/Document_Packaging_Policy.md
canonical_text: A Document Set is a directory artifact containing 00-index.md, manifest.json, ordered NN-*.md or NN-*.txt shard files with exact source segments, and an evidence/ directory for audits A/B/C.
gui_related: false
gui_classification_reason: This unit defines backend/governance packaging behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of DPP-001.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: document_packaging_policy_drift
reasoning_tier: standard
context_scope: document_packaging_policy_standardization
implementation_surfaces:
- Plans/Document_Packaging_Policy.md
node_compile_hint:
  mode: document_set_directory_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Document_Packaging_Policy-S0003
preserved_exact_tokens:
- 00-index.md
- manifest.json
- NN-*.md
- NN-*.txt
- evidence/
- audits A/B/C
- 'ContractRef: ContractName:Plans/Document_Packaging_Policy.md, Gate:GATE-014'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Document_Packaging_Policy.md
```

### DPP-004 - Document Set Index Requirements

```yaml
plan_unit_id: DPP-004
unit_type: requirement
status: accepted
owner_doc: Plans/Document_Packaging_Policy.md
canonical_text: 00-index.md must expose source logical path, deterministic generation marker from source_sha256, source sha256, split rule summary, ordered shard listing with filenames and line ranges, and the fixed generated-file warning.
gui_related: false
gui_classification_reason: This unit defines backend/governance packaging behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of DPP-001.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: document_packaging_policy_drift
reasoning_tier: standard
context_scope: document_packaging_policy_standardization
implementation_surfaces:
- Plans/Document_Packaging_Policy.md
node_compile_hint:
  mode: document_set_index_requirements
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Document_Packaging_Policy-S0004
preserved_exact_tokens:
- 00-index.md
- source_sha256
- ordered shard listing
- Generated artifact. Do not edit shards directly; regenerate from canonical source.
- 'ContractRef: ContractName:Plans/Document_Packaging_Policy.md, Gate:GATE-014'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Document_Packaging_Policy.md
```

### DPP-005 - Document Set Manifest Requirements

```yaml
plan_unit_id: DPP-005
unit_type: requirement
status: accepted
owner_doc: Plans/Document_Packaging_Policy.md
canonical_text: manifest.json must include source_path, source_sha256, source_line_count, split_rule, audit_files, and canonical shards[] entries with order, filename, start_line, end_line, segment_sha256, and byte_count.
gui_related: false
gui_classification_reason: This unit defines backend/governance packaging behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of DPP-001.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: document_packaging_policy_drift
reasoning_tier: standard
context_scope: document_packaging_policy_standardization
implementation_surfaces:
- Plans/Document_Packaging_Policy.md
node_compile_hint:
  mode: document_set_manifest_requirements
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Document_Packaging_Policy-S0005
preserved_exact_tokens:
- manifest.json
- source_path
- source_sha256
- source_line_count
- split_rule
- audit_files
- shards[]
- segment_sha256
- byte_count
- 'ContractRef: ContractName:Plans/Document_Packaging_Policy.md, Gate:GATE-014'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Document_Packaging_Policy.md
```

### DPP-006 - Shard Naming and Packaging Input Exclusion

```yaml
plan_unit_id: DPP-006
unit_type: requirement
status: accepted
owner_doc: Plans/Document_Packaging_Policy.md
canonical_text: 'Shard filenames are deterministic: numbering starts at 01, zero padding width is max(2, digits(total_shards)), filename format is <zero_padded_index>-<slug>.<ext>, and generated .docset/** members must not become packaging inputs.'
gui_related: false
gui_classification_reason: This unit defines backend/governance packaging behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of DPP-001.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: document_packaging_policy_drift
reasoning_tier: standard
context_scope: document_packaging_policy_standardization
implementation_surfaces:
- Plans/Document_Packaging_Policy.md
node_compile_hint:
  mode: shard_naming_and_packaging_input_exclusion
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Document_Packaging_Policy-S0006
preserved_exact_tokens:
- '01'
- max(2, digits(total_shards))
- <zero_padded_index>-<slug>.<ext>
- chunk-<start_line>-<end_line>
- .docset/**
- 'ContractRef: PolicyRule:Decision_Policy.md§2, Gate:GATE-014'
negative_constraints:
- Existing .docset/** members are generated outputs and must not themselves become new packaging inputs.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Document_Packaging_Policy.md
```

### DPP-007 - Local Auth, Provider, Runtime Evidence Routing

```yaml
plan_unit_id: DPP-007
unit_type: requirement
status: accepted
owner_doc: Plans/Document_Packaging_Policy.md
canonical_text: Document packages may preserve local auth, provider/account, connect-health, runtime lifecycle, durability, attribution, and provider-facade evidence, but interpretation remains routed to the owning docs and file hints alone never prove readiness.
gui_related: false
gui_classification_reason: This unit defines backend/governance packaging behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of DPP-001.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: document_packaging_policy_drift
reasoning_tier: standard
context_scope: document_packaging_policy_standardization
implementation_surfaces:
- Plans/Document_Packaging_Policy.md
node_compile_hint:
  mode: local_auth_provider_runtime_evidence_routing
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Document_Packaging_Policy-S0008
preserved_exact_tokens:
- google_accounts.json.active
- json.active
- google_accounts
- /project
- /onboarding
- provider_definition
- provider_account
- provider_account_policy
- /auth/health
- /disposal
- /durability
- /attribution
negative_constraints:
- File hints alone are not sufficient readiness.
- Document packaging does not own runtime resource-disposal behavior.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Interpretation routes to Multi-Account, Run_Modes, FileSafe, storage-plan, Prompt_Pipeline, Contracts_V0, and CLI_Bridged_Providers owners.
owner_hints:
- Plans/Document_Packaging_Policy.md
```

### DPP-008 - Command and Event Seam Contradiction Evidence

```yaml
plan_unit_id: DPP-008
unit_type: requirement
status: accepted
owner_doc: Plans/Document_Packaging_Policy.md
canonical_text: Command and event seam evidence packages keep contradictions visible, including chat.thread.created versus chat.thread_created, terminal run names, requested/effective/runtime mode splits, reserved-name ownership, and /compact owner evidence.
gui_related: false
gui_classification_reason: This unit defines backend/governance packaging behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of DPP-001.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: document_packaging_policy_drift
reasoning_tier: standard
context_scope: document_packaging_policy_standardization
implementation_surfaces:
- Plans/Document_Packaging_Policy.md
node_compile_hint:
  mode: command_and_event_seam_contradiction_evidence
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Document_Packaging_Policy-S0009
preserved_exact_tokens:
- chat.thread.created
- chat.thread_created
- run.cancelled
- run.completed
- '{ mode }'
- /mode
- /effective
- /runtime
- reserved-name
- /compact
- 'ContractRef: ContractName:Plans/Document_Packaging_Policy.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/Widget_System.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FileManager.md'
negative_constraints:
- Do not flatten naming contradictions into unsafe copied command/event lists.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Owning docs remain Contracts_V0, UI_Command_Catalog, Wiring_Matrix, Widget_System, FinalGUISpec, assistant-chat-design, and FileManager.
owner_hints:
- Plans/Document_Packaging_Policy.md
```

### DPP-009 - Worktree Surface Ownership Evidence

```yaml
plan_unit_id: DPP-009
unit_type: requirement
status: accepted
owner_doc: Plans/Document_Packaging_Policy.md
canonical_text: 'Worktree evidence packages preserve surface ownership: Source Control is the primary operational surface, Orchestrator consumes worktree identity and recovery views, and Settings surfaces expose configuration and diagnostics rather than primary active-worktree management.'
gui_related: true
gui_classification_reason: This unit concerns user-visible file/path presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of DPP-001.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: document_packaging_policy_drift
reasoning_tier: standard
context_scope: document_packaging_policy_standardization
implementation_surfaces:
- Plans/Document_Packaging_Policy.md
node_compile_hint:
  mode: worktree_surface_ownership_evidence
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Document_Packaging_Policy-S0009
preserved_exact_tokens:
- Source Control
- Orchestrator
- Settings > Branching
- Settings > Health
- active-worktree
- /history/recovery
- /diagnostics
negative_constraints:
- Settings surfaces are not primary active-worktree management.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Document_Packaging_Policy.md
```

### DPP-010 - Consumer Drift and Packaging Evidence Lineage

```yaml
plan_unit_id: DPP-010
unit_type: requirement
status: accepted
owner_doc: Plans/Document_Packaging_Policy.md
canonical_text: Consumer-drift packages flag mechanical stale examples and preserve glossary artifacts, requirements-staging seglog artifacts, package-generation lineage states, and the distinction between packaging evidence and execution evidence when both use evidence/ naming.
gui_related: false
gui_classification_reason: This unit defines backend/governance packaging behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of DPP-001.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: document_packaging_policy_drift
reasoning_tier: standard
context_scope: document_packaging_policy_standardization
implementation_surfaces:
- Plans/Document_Packaging_Policy.md
node_compile_hint:
  mode: consumer_drift_and_packaging_evidence_lineage
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Document_Packaging_Policy-S0009
preserved_exact_tokens:
- Wiring_Matrix.md
- cmd.orchestrator.switch_tab
- ghost
- /stale-ID
- requirements-staging
- package-generation
- evidence/
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions:
- Wiring_Matrix rows such as cmd.orchestrator.switch_tab can reinforce older command shape and carry ghost and /stale-ID risk.
owner_boundary_notes: []
owner_hints:
- Plans/Document_Packaging_Policy.md
```

### DPP-011 - UI Command Evidence Consumer Split

```yaml
plan_unit_id: DPP-011
unit_type: requirement
status: accepted
owner_doc: Plans/Document_Packaging_Policy.md
canonical_text: UI command evidence packages preserve consumer splits for UI_Command_Catalog, blocked/HITL mutator ownership, account and concern promotion flows, and wizard_step meaning without making the base target wizard-shaped.
gui_related: true
gui_classification_reason: This unit concerns user-visible file/path presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of DPP-001.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: document_packaging_policy_drift
reasoning_tier: standard
context_scope: document_packaging_policy_standardization
implementation_surfaces:
- Plans/Document_Packaging_Policy.md
node_compile_hint:
  mode: ui_command_evidence_consumer_split
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Document_Packaging_Policy-S0009
preserved_exact_tokens:
- Plans/UI_Command_Catalog.md
- /UI_Command_Catalog.md
- blocked
- /HITL
- /concern/promotion
- wizard_step
- wizard-shaped
negative_constraints:
- This policy does not become the command owner.
- The base target object must not become wizard-shaped.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Document_Packaging_Policy.md
```

### DPP-012 - UI Migration and Reversible Action Evidence Alignment

```yaml
plan_unit_id: DPP-012
unit_type: requirement
status: accepted
owner_doc: Plans/Document_Packaging_Policy.md
canonical_text: Migration and reversible-action evidence keeps Widget_System and FinalGUISpec on one mirrored migration rule, and limits immediate_undo to direct undo or /revert within practical reversible local presentation/layout and editor-level windows.
gui_related: true
gui_classification_reason: This unit concerns user-visible file/path presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of DPP-001.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: document_packaging_policy_drift
reasoning_tier: standard
context_scope: document_packaging_policy_standardization
implementation_surfaces:
- Plans/Document_Packaging_Policy.md
node_compile_hint:
  mode: ui_migration_and_reversible_action_evidence_alignment
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Document_Packaging_Policy-S0009
preserved_exact_tokens:
- Plans/Widget_System.md
- Plans/FinalGUISpec.md
- /Widget_System.md
- /FinalGUISpec.md
- immediate_undo
- /revert
- /layout
- editor-level
negative_constraints:
- immediate_undo is not a general rollback contract.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Document_Packaging_Policy.md
```

### DPP-013 - Provider Account and Routing Identity Boundaries

```yaml
plan_unit_id: DPP-013
unit_type: requirement
status: accepted
owner_doc: Plans/Document_Packaging_Policy.md
canonical_text: Provider/account and event/command routing packages expose account, non-provider identity, command routing, local SSOT disagreement, subject-open requirements, and stale FileManager consumer boundaries.
gui_related: false
gui_classification_reason: This unit defines backend/governance packaging behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of DPP-001.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: document_packaging_policy_drift
reasoning_tier: standard
context_scope: document_packaging_policy_standardization
implementation_surfaces:
- Plans/Document_Packaging_Policy.md
node_compile_hint:
  mode: provider_account_and_routing_identity_boundaries
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Document_Packaging_Policy-S0009
preserved_exact_tokens:
- /account
- non-provider
- /command
- SSOTs
- subject-open
- FileManager.md
negative_constraints:
- /account snapshots must not become a dumping ground for non-provider identity.
compatibility_only_notes: []
stale_retired_dispositions:
- FileManager.md remains the stale consumer for the subject-open seam.
owner_boundary_notes: []
owner_hints:
- Plans/Document_Packaging_Policy.md
```

### DPP-014 - Canonical Field Names vs Stale Scope Boundaries

```yaml
plan_unit_id: DPP-014
unit_type: requirement
status: accepted
owner_doc: Plans/Document_Packaging_Policy.md
canonical_text: Owner/consumer reconciliation packages preserve modern canonical field names separately from stale canonical scope language, so transfer cleanup does not mistake newer labels for complete owner alignment.
gui_related: false
gui_classification_reason: This unit defines backend/governance packaging behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of DPP-001.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: document_packaging_policy_drift
reasoning_tier: standard
context_scope: document_packaging_policy_standardization
implementation_surfaces:
- Plans/Document_Packaging_Policy.md
node_compile_hint:
  mode: canonical_field_names_vs_stale_scope_boundaries
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Document_Packaging_Policy-S0010
preserved_exact_tokens:
- modern canonical field names
- stale canonical scope language
- transfer cleanup
- 'ContractRef: ContractName:Plans/Document_Packaging_Policy.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/FileManager.md, ContractName:Plans/assistant-chat-design.md'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions:
- Stale canonical scope language remains explicitly labeled rather than silently normalized.
owner_boundary_notes: []
owner_hints:
- Plans/Document_Packaging_Policy.md
```

### DPP-015 - Attention and Blocked-State Evidence Scoping

```yaml
plan_unit_id: DPP-015
unit_type: requirement
status: accepted
owner_doc: Plans/Document_Packaging_Policy.md
canonical_text: 'Attention and blocked-state evidence remains scoped: a project can be background_active with attention_required without being globally blocked, and blocked_episode does not expand the policy into a blocked-episode-shaped payload family.'
gui_related: false
gui_classification_reason: This unit defines backend/governance packaging behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of DPP-001.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: document_packaging_policy_drift
reasoning_tier: standard
context_scope: document_packaging_policy_standardization
implementation_surfaces:
- Plans/Document_Packaging_Policy.md
node_compile_hint:
  mode: attention_and_blocked_state_evidence_scoping
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Document_Packaging_Policy-S0010
preserved_exact_tokens:
- background_active
- attention_required
- blocked
- blocked_episode
- blocked-episode-shaped
negative_constraints:
- Attention_required must not collapse every attention reason into globally blocked state.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Document_Packaging_Policy.md
```

### DPP-016 - Command Identity Split and Re-Audit Defect Labels

```yaml
plan_unit_id: DPP-016
unit_type: requirement
status: accepted
owner_doc: Plans/Document_Packaging_Policy.md
canonical_text: Command evidence packages preserve request_id versus blocked_sequence user-facing splits and distinguish overstated exact-missing absence from remaining receipt, glossary-label, account-history, partial-transfer, structural-heading, and stale-survivor defects.
gui_related: false
gui_classification_reason: This unit defines backend/governance packaging behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of DPP-001.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: document_packaging_policy_drift
reasoning_tier: standard
context_scope: document_packaging_policy_standardization
implementation_surfaces:
- Plans/Document_Packaging_Policy.md
node_compile_hint:
  mode: command_identity_split_and_re_audit_defect_labels
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Document_Packaging_Policy-S0010
preserved_exact_tokens:
- request_id
- blocked_sequence
- user-facing
- exact-missing
- receipt
- glossary-label
- account-history
- partial-transfer
- structural-heading
- stale-survivor
negative_constraints:
- Do not turn this policy into the command catalog owner.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Document_Packaging_Policy.md
```

### DPP-017 - Generated Doc Preview Routing Identity Boundaries

```yaml
plan_unit_id: DPP-017
unit_type: requirement
status: accepted
owner_doc: Plans/Document_Packaging_Policy.md
canonical_text: Generated-doc and preview evidence packages must not leak path assumptions back into routing, and must preserve the FileManager path-open versus assistant-chat open-by-identity consumer split.
gui_related: false
gui_classification_reason: This unit defines backend/governance packaging behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of DPP-001.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: document_packaging_policy_drift
reasoning_tier: standard
context_scope: document_packaging_policy_standardization
implementation_surfaces:
- Plans/Document_Packaging_Policy.md
node_compile_hint:
  mode: generated_doc_preview_routing_identity_boundaries
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Document_Packaging_Policy-S0010
preserved_exact_tokens:
- generated docs
- /artifacts
- preview-backed
- path-based
- path-open
- /open-by-identity
negative_constraints:
- Path assumptions must not leak back into routing.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Document_Packaging_Policy.md
```

### DPP-018 - Primary Markdown Heading Split Rule

```yaml
plan_unit_id: DPP-018
unit_type: requirement
status: accepted
owner_doc: Plans/Document_Packaging_Policy.md
canonical_text: 'Primary split must occur at Markdown headings beginning with ## outside fenced code blocks, while heading-like lines inside fences opened by triple backticks or ~~~ are ignored until matching fence delimiters close the active context.'
gui_related: false
gui_classification_reason: This unit defines backend/governance packaging behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of DPP-001.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: document_packaging_policy_drift
reasoning_tier: standard
context_scope: document_packaging_policy_standardization
implementation_surfaces:
- Plans/Document_Packaging_Policy.md
node_compile_hint:
  mode: primary_markdown_heading_split_rule
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Document_Packaging_Policy-S0011
preserved_exact_tokens:
- '## '
- fenced code blocks
- triple backticks
- ~~~
- matching fence delimiters
- 'ContractRef: ContractName:Plans/Document_Packaging_Policy.md, Gate:GATE-014'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Document_Packaging_Policy.md
```

### DPP-019 - Fallback Fixed-Line Chunk Rule

```yaml
plan_unit_id: DPP-019
unit_type: requirement
status: accepted
owner_doc: Plans/Document_Packaging_Policy.md
canonical_text: If primary split does not produce valid bounded shards, the splitter must use deterministic fixed line chunks and record fallback parameters in manifest.json.split_rule uniformly.
gui_related: false
gui_classification_reason: This unit defines backend/governance packaging behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of DPP-001.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: document_packaging_policy_drift
reasoning_tier: standard
context_scope: document_packaging_policy_standardization
implementation_surfaces:
- Plans/Document_Packaging_Policy.md
node_compile_hint:
  mode: fallback_fixed_line_chunk_rule
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Document_Packaging_Policy-S0012
preserved_exact_tokens:
- deterministic fixed line chunks
- manifest.json.split_rule
- 'ContractRef: PolicyRule:Decision_Policy.md§2, Gate:GATE-014'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Document_Packaging_Policy.md
```

### DPP-020 - Trigger Budgets and Auto Decisions Defaults

```yaml
plan_unit_id: DPP-020
unit_type: requirement
status: accepted
owner_doc: Plans/Document_Packaging_Policy.md
canonical_text: Packaging triggers when max_bytes, max_estimated_tokens, or fallback_chunk_lines thresholds are reached; these deterministic defaults are recorded in Plans/auto_decisions.jsonl and reused unless superseded by a higher-precedence SSOT source.
gui_related: false
gui_classification_reason: This unit defines backend/governance packaging behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of DPP-001.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: document_packaging_policy_drift
reasoning_tier: standard
context_scope: document_packaging_policy_standardization
implementation_surfaces:
- Plans/Document_Packaging_Policy.md
node_compile_hint:
  mode: trigger_budgets_and_auto_decisions_defaults
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Document_Packaging_Policy-S0013
preserved_exact_tokens:
- max_bytes = 262144
- max_estimated_tokens = 65536
- char_count / 4
- fallback_chunk_lines = 400
- Plans/auto_decisions.jsonl
- 'ContractRef: PolicyRule:Decision_Policy.md§2, SchemaID:pm.auto_decisions.schema.v1, Gate:GATE-014'
negative_constraints:
- Do not hand-edit Plans/auto_decisions.jsonl during this standardization batch.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Document_Packaging_Policy.md
```

### DPP-021 - Losslessness and Source Byte Preservation Proofs

```yaml
plan_unit_id: DPP-021
unit_type: requirement
status: accepted
owner_doc: Plans/Document_Packaging_Policy.md
canonical_text: A packaged Document Set must prove reconstruction hash equality, complete line accounting, idempotency, and clean-room determinism; packaging is only a file-boundary transformation and must not rewrite source bytes, normalize line endings, or clean up content.
gui_related: false
gui_classification_reason: This unit defines backend/governance packaging behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of DPP-001.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: document_packaging_policy_drift
reasoning_tier: standard
context_scope: document_packaging_policy_standardization
implementation_surfaces:
- Plans/Document_Packaging_Policy.md
node_compile_hint:
  mode: losslessness_and_source_byte_preservation_proofs
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Document_Packaging_Policy-S0014
preserved_exact_tokens:
- Reconstruction hash equality
- Line accounting completeness
- Idempotency
- Clean-room determinism
- sha256 == source_sha256
- MUST NOT rewrite source bytes
- normalize line endings
- clean up
- 'ContractRef: Gate:GATE-014, PolicyRule:Decision_Policy.md§2'
negative_constraints:
- Packaging must not rewrite bytes, normalize line endings, or clean up content.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Document_Packaging_Policy.md
```

### DPP-022 - Independent Full-Coverage Audits

```yaml
plan_unit_id: DPP-022
unit_type: requirement
status: accepted
owner_doc: Plans/Document_Packaging_Policy.md
canonical_text: Every packaging run must execute Audit A, Audit B, and Audit C at full coverage with no sampling, write deterministic audit JSON files under evidence/, and include audit_id, source_path, source_sha256, status, generated_at, and details.
gui_related: false
gui_classification_reason: This unit defines backend/governance packaging behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of DPP-001.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: document_packaging_policy_drift
reasoning_tier: standard
context_scope: document_packaging_policy_standardization
implementation_surfaces:
- Plans/Document_Packaging_Policy.md
node_compile_hint:
  mode: independent_full_coverage_audits
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Document_Packaging_Policy-S0015
preserved_exact_tokens:
- Audit A
- Audit B
- Audit C
- no sampling
- evidence/audit_a_verification.json
- evidence/audit_b_index_manifest.json
- evidence/audit_c_clean_room.json
- audit_id
- source_path
- source_sha256
- generated_at
- 'ContractRef: Gate:GATE-014, ContractName:Plans/Progression_Gates.md'
- 'ContractRef: SchemaID:evidence.schema.json, ContractName:Plans/00-plans-index.md'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Document_Packaging_Policy.md
```

### DPP-023 - Enforcement Coverage and Non-Bypassable Run Failure

```yaml
plan_unit_id: DPP-023
unit_type: requirement
status: accepted
owner_doc: Plans/Document_Packaging_Policy.md
canonical_text: Document Packaging enforcement covers requirements builder staging outputs, canonical project Markdown/text artifacts, and any subsystem writing Markdown/text under .puppet-master/** through the same writer abstraction; a tracked over-budget artifact without a valid passing Document Set must fail the run.
gui_related: false
gui_classification_reason: This unit defines backend/governance packaging behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of DPP-001.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: document_packaging_policy_drift
reasoning_tier: standard
context_scope: document_packaging_policy_standardization
implementation_surfaces:
- Plans/Document_Packaging_Policy.md
node_compile_hint:
  mode: enforcement_coverage_and_non_bypassable_run_failure
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Document_Packaging_Policy-S0016
preserved_exact_tokens:
- .puppet-master/requirements/**
- .puppet-master/project/**
- .puppet-master/project/requirements.md
- .puppet-master/project/plan.md
- .puppet-master/project/traceability/requirements_coverage.md
- .puppet-master/project/quickstart.md
- same writer abstraction
- Non-bypassable rule
- 'ContractRef: ContractName:Plans/Project_Output_Artifacts.md, ContractName:Plans/chain-wizard-flexibility.md, ContractName:Plans/interview-subagent-integration.md, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Executor_Protocol.md, Gate:GATE-014'
negative_constraints:
- If a tracked artifact exceeds budget and no valid Document Set exists with passing audits A/B/C, the run must fail.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Document_Packaging_Policy.md
```

### DPP-024 - Document Set Directory Naming Convention

```yaml
plan_unit_id: DPP-024
unit_type: requirement
status: accepted
owner_doc: Plans/Document_Packaging_Policy.md
canonical_text: When packaging triggers for a Markdown/text logical artifact path, the canonical packaged form is a .docset directory named by appending .docset to the complete filename including extension.
gui_related: true
gui_classification_reason: This unit concerns user-visible file/path presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of DPP-001.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: document_packaging_policy_drift
reasoning_tier: standard
context_scope: document_packaging_policy_standardization
implementation_surfaces:
- Plans/Document_Packaging_Policy.md
node_compile_hint:
  mode: document_set_directory_naming_convention
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Document_Packaging_Policy-S0018
preserved_exact_tokens:
- .docset
- .puppet-master/project/requirements.md
- .puppet-master/project/requirements.md.docset/
- complete filename including its extension
- 'ContractRef: ContractName:Plans/Document_Packaging_Policy.md#7, Gate:GATE-014'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Document_Packaging_Policy.md
```

### DPP-025 - Document Set Directory Contents Reuse

```yaml
plan_unit_id: DPP-025
unit_type: requirement
status: accepted
owner_doc: Plans/Document_Packaging_Policy.md
canonical_text: 'The Document Set directory reuses the contract contents: 00-index.md, manifest.json, NN-*.md or NN-*.txt shards, and evidence/ directory.'
gui_related: false
gui_classification_reason: This unit defines backend/governance packaging behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of DPP-001.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: document_packaging_policy_drift
reasoning_tier: standard
context_scope: document_packaging_policy_standardization
implementation_surfaces:
- Plans/Document_Packaging_Policy.md
node_compile_hint:
  mode: document_set_directory_contents_reuse
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Document_Packaging_Policy-S0019
preserved_exact_tokens:
- 00-index.md
- manifest.json
- NN-*.md
- NN-*.txt
- evidence/
- 'ContractRef: ContractName:Plans/Document_Packaging_Policy.md#7, Gate:GATE-014'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Document_Packaging_Policy.md
```

### DPP-026 - Pointer Stub Presence and Fixed Format

```yaml
plan_unit_id: DPP-026
unit_type: requirement
status: accepted
owner_doc: Plans/Document_Packaging_Policy.md
canonical_text: When packaging produces a .docset/ directory, the original file path remains as a deterministic pointer stub with canonical-content statement, entrypoint <filename>.docset/00-index.md, source_sha256, and puppet-master docset verify <docset_path> command.
gui_related: false
gui_classification_reason: This unit defines backend/governance packaging behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of DPP-001.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: document_packaging_policy_drift
reasoning_tier: standard
context_scope: document_packaging_policy_standardization
implementation_surfaces:
- Plans/Document_Packaging_Policy.md
node_compile_hint:
  mode: pointer_stub_presence_and_fixed_format
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Document_Packaging_Policy-S0020
preserved_exact_tokens:
- original file path MUST remain present
- <filename>.docset/00-index.md
- source_sha256
- puppet-master docset verify <docset_path>
- <!-- Puppet Master Document Set pointer stub — do not edit -->
- 'ContractRef: ContractName:Plans/Document_Packaging_Policy.md#7, Gate:GATE-014, Gate:GATE-002'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Document_Packaging_Policy.md
```

### DPP-027 - Canonical Truth Rules for Docset vs Source File

```yaml
plan_unit_id: DPP-027
unit_type: requirement
status: accepted
owner_doc: Plans/Document_Packaging_Policy.md
canonical_text: When a .docset/ directory exists for an artifact, that directory is canonical and the pointer stub file is derived; without a .docset/ directory, the logical .md or .txt file is canonical.
gui_related: false
gui_classification_reason: This unit defines backend/governance packaging behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of DPP-001.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: document_packaging_policy_drift
reasoning_tier: standard
context_scope: document_packaging_policy_standardization
implementation_surfaces:
- Plans/Document_Packaging_Policy.md
node_compile_hint:
  mode: canonical_truth_rules_for_docset_vs_source_file
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Document_Packaging_Policy-S0021
preserved_exact_tokens:
- .docset/
- pointer stub file is derived
- .md
- .txt
- 'ContractRef: ContractName:Plans/Document_Packaging_Policy.md#7, Gate:GATE-014'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Document_Packaging_Policy.md
```

### DPP-028 - Pointer Stub Verification Discovery and Failure Rules

```yaml
plan_unit_id: DPP-028
unit_type: requirement
status: accepted
owner_doc: Plans/Document_Packaging_Policy.md
canonical_text: Pointer-stub verification requires the .docset/ directory, .docset/manifest.json, and all reconstruction sha256, line coverage, index/manifest, idempotency, and clean-room checks; verification fails for missing docset, failed checks, or over-budget source without docset.
gui_related: false
gui_classification_reason: This unit defines backend/governance packaging behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of DPP-001.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: document_packaging_policy_drift
reasoning_tier: standard
context_scope: document_packaging_policy_standardization
implementation_surfaces:
- Plans/Document_Packaging_Policy.md
node_compile_hint:
  mode: pointer_stub_verification_discovery_and_failure_rules
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Document_Packaging_Policy-S0022
preserved_exact_tokens:
- .docset/manifest.json
- reconstruction sha256
- line coverage
- index/manifest match
- idempotency
- clean-room determinism
- pointer stub exists but the .docset/ directory is missing
- the .md file exceeds budget thresholds (§3) and no .docset/ directory exists
negative_constraints:
- Do not treat a pointer stub as compliant unless all listed verification checks pass.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Document_Packaging_Policy.md
```

### DPP-029 - Requirements Docset Example and Pointer Stub Example

```yaml
plan_unit_id: DPP-029
unit_type: requirement
status: accepted
owner_doc: Plans/Document_Packaging_Policy.md
canonical_text: The requirements.md example preserves the canonical pointer-stub and requirements.md.docset/ directory shape, ordered shard examples, audit filenames, example source hash, and deterministic verify command.
gui_related: false
gui_classification_reason: This unit defines backend/governance packaging behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of DPP-001.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: document_packaging_policy_drift
reasoning_tier: standard
context_scope: document_packaging_policy_standardization
implementation_surfaces:
- Plans/Document_Packaging_Policy.md
node_compile_hint:
  mode: requirements_docset_example_and_pointer_stub_example
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Document_Packaging_Policy-S0023
preserved_exact_tokens:
- .puppet-master/project/requirements.md
- requirements.md.docset/
- 01-introduction.md
- 02-functional-requirements.md
- audit_a_verification.json
- audit_b_index_manifest.json
- audit_c_clean_room.json
- a1b2c3d4e5f6...
- puppet-master docset verify requirements.md.docset/
- 'ContractRef: ContractName:Plans/Document_Packaging_Policy.md#7, Gate:GATE-014'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Document_Packaging_Policy.md
```

### DPP-001 - Document Packaging Policy Source-Preserving Bridge Retired

```yaml
plan_unit_id: DPP-001
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Document_Packaging_Policy.md
canonical_text: The former Document Packaging Policy source-preserving bridge is retired in place after Phase 2B atomized or structurally dispositioned Document_Packaging_Policy-S0001 through Document_Packaging_Policy-S0028 into DPP-002 through DPP-029, explicit structural coverage, and retired bridge lineage. DPP-001 remains only as migration lineage for the retired bridge span and must not re-own atomized source coverage.
gui_related: false
gui_classification_reason: The retired bridge is migration lineage and no longer owns GUI or product behavior; coverage_map still preserves S0027 gui_related_inferred=true.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- DPP-001 no longer uses the source-preserving PlanUnit compile hint.
- DPP-002 through DPP-029 own product coverage for Document_Packaging_Policy-S0001 through Document_Packaging_Policy-S0023.
- Document_Packaging_Policy-S0024, S0025, S0026, and S0028 are structural/reference/migration scaffolding dispositions.
- The retired bridge does not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: migration_lineage
reasoning_tier: standard
context_scope: plan_standardization
implementation_surfaces:
- Plans/Document_Packaging_Policy.md
node_compile_hint:
  mode: source_preserving_bridge_retired
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Document_Packaging_Policy-S0027
preserved_exact_tokens:
- DPP-001
- source_preserving_planunit
- source_preserving_bridge_retired
- DPP-002
- DPP-029
- Document_Packaging_Policy-S0001
- Document_Packaging_Policy-S0028
- References
- Owner / Consumer Map
- PlanUnits
- Migration Coverage
negative_constraints:
- Do not remap atomized Document_Packaging_Policy spans back to DPP-001.
- Do not treat the retired bridge as implementation-ready product coverage.
- Do not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks from this migration-lineage unit.
compatibility_only_notes:
- The old source-preserving bridge is retained only so migration lineage and historical references to DPP-001 remain auditable.
stale_retired_dispositions: []
owner_boundary_notes:
- DPP-002 through DPP-029 own product coverage for S0001-S0023.
- S0024, S0025, S0026, and S0028 are structural/reference/migration scaffolding dispositions.
owner_hints:
- Plans/Document_Packaging_Policy.md
```
