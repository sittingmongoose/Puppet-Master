# Shard 017: PlanUnits

Source: `Plans/Project_Output_Artifacts.md`

Source lines: L801-L3112

Source SHA256: `b3a47beac1f91f6f550d47cc74fd5cf3b618dd1c27d59ec127d2e03e0c33539c`

---

## PlanUnits

### POA-002 - Project Plan Package SSOT And Anti-Duplication

```yaml
plan_unit_id: POA-002
unit_type: requirement
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  Plans/Project_Output_Artifacts.md is the SSOT for user-project Project Plan Package outputs staged under .puppet-master/project/**, including artifact paths, sharding rules, seglog canonical persistence, DRY contract-referenced sharded headless graph requirements, and optional non-canonical derived exports.
gui_related: false
gui_classification_reason: This unit defines canonical package authority and storage semantics rather than visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - "Project Plan Package SSOT And Anti-Duplication remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, owner boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: project_output_artifact_drift
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0001
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0002
preserved_exact_tokens:
  - "Puppet Master — User-Project Project Plan Package Outputs (SSOT)"
  - ".puppet-master/project/**"
  - "seglog canonical persistence"
  - "sharded-only plan graph"
  - "optional, non-canonical"
negative_constraints:
  - "Do not duplicate: This file is the SSOT for artifact paths and sharding rules; other docs should link here instead of repeating them."
preserved_contractrefs: []
owner_hints:
  - Plans/Project_Output_Artifacts.md
```

### POA-003 - Runtime Artifacts Boundary

```yaml
plan_unit_id: POA-003
unit_type: constraint
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  Project Plan Package artifacts are distinct from GUI Runtime Artifacts; optional runtime-analysis exports are projections of canonical runtime identities, and debug/runtime targets bind to the package only through explicit project/session/runtime identity.
gui_related: true
gui_classification_reason: This unit preserves the GUI Artifacts panel boundary and user-visible runtime artifact distinctions.
split_recommended: false
depends_on:
  - POA-002
unblocks: []
acceptance_criteria:
  - "Runtime Artifacts Boundary remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - "Runtime artifact GUI panel semantics remain distinct from Project Plan Package outputs."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: project_runtime_artifact_conflation
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0003
preserved_exact_tokens:
  - "Runtime Artifacts (GUI panel) — distinct from this document"
  - "runtime_artifact.*"
  - "artifacts_index:v1:{project_id}"
  - "Plans/Runtime_Artifacts_Panel.md"
  - "scheduler_pass_id"
  - "attempt_id"
  - "safe_point_id"
  - "remediation_root_id"
  - "project_id"
  - "dev_session_id"
  - "/browser"
negative_constraints:
  - "Do not conflate the two: Project Plan Package = user-project deliverables; Runtime Artifacts = agent-run outputs in the Artifacts panel."
preserved_contractrefs: []
owner_hints:
  - Plans/Project_Output_Artifacts.md
  - Plans/Runtime_Artifacts_Panel.md
```

### POA-004 - Project Artifact Event Identity And Registration Gaps

```yaml
plan_unit_id: POA-004
unit_type: requirement
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  Project artifact events, Auditor cycle reports, and legacy pass-report compatibility mirrors must align to EventRecord-level identity, register missing artifact and event families, and resolve report lineage across project, run, thread, wizard, account, provider, model, and later launched run identity.
gui_related: false
gui_classification_reason: This unit defines artifact/event identity and lineage requirements rather than visual presentation.
split_recommended: false
depends_on:
  - POA-003
unblocks: []
acceptance_criteria:
  - "Project Artifact Event Identity And Registration Gaps remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - "Artifact event identity remains aligned to EventRecord-level lineage before downstream export or handoff claims."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: project_artifact_lineage_drift
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0004
preserved_exact_tokens:
  - "validation_pass_report.pass_verdict"
  - "skipped"
  - "project/run/thread/wizard/account"
  - "glossary"
  - "evidence/<node_id>.json"
  - "live.*"
  - "memory.gist"
  - "memory.gist.*"
  - "cmd.*"
  - "/permissions"
  - "project_id"
  - "workflow_run_id"
  - "run_id"
  - "provider"
  - "model"
negative_constraints:
  - "Weak validation-pass identity must block downstream export, History/Ledger, or run-handoff claims until lineage is explicit."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/storage-plan.md"
owner_hints:
  - Plans/Project_Output_Artifacts.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/storage-plan.md
```

### POA-005 - Identity-Native Artifact Opening And Navigation Boundary

```yaml
plan_unit_id: POA-005
unit_type: requirement
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  Artifact opening and navigation must be identity-native, supporting generated and staged artifacts before backing paths exist while preserving project/run-aware resolver metadata for FileManager, Runtime Artifacts, ledger/history/search, and attempt-scoped evidence views.
gui_related: true
gui_classification_reason: This unit preserves artifact opening and navigation behavior visible through FileManager, Runtime Artifacts, ledger, history, search, and attempt views.
split_recommended: false
depends_on:
  - POA-004
unblocks: []
acceptance_criteria:
  - "Identity-Native Artifact Opening And Navigation Boundary remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - "Generated and runtime artifact opens remain identity-native rather than path-only."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: artifact_open_identity_drift
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0004
preserved_exact_tokens:
  - "OpenFile { path: PathBuf }"
  - "OpenArtifact"
  - "evidence_by_attempt"
  - "artifact-index freshness/degraded fallback"
  - "generated://<artifact_id>"
  - "artifact:<artifact_id>"
  - "artifact_id"
  - "/session"
  - "/node/attempt"
  - "/history/ledger/search"
negative_constraints:
  - "Generated/runtime artifact opens must not be forced through path-only OpenFile { path }."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/storage-plan.md"
owner_hints:
  - Plans/Project_Output_Artifacts.md
  - Plans/FileManager.md
  - Plans/Runtime_Artifacts_Panel.md
```

### POA-006 - Export Trust, Aliasing, And Stable Artifact IDs

```yaml
plan_unit_id: POA-006
unit_type: constraint
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  Exported artifact records preserve canonical IDs and refs, disclose or refresh stale/degraded projection trust, keep compatibility aliases subordinate to canonical identities, preserve stable project identity across moves/rebinds, and keep health, activity, and attention distinct.
gui_related: false
gui_classification_reason: This unit defines export identity, trust, aliasing, and project identity constraints rather than visual presentation.
split_recommended: false
depends_on:
  - POA-004
unblocks: []
acceptance_criteria:
  - "Export Trust, Aliasing, And Stable Artifact IDs remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - "Exports preserve canonical IDs and trust state without inventing shadow identities."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: artifact_export_identity_drift
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0004
preserved_exact_tokens:
  - "seglog"
  - "JSONL mirror"
  - "stale/degraded"
  - "/degraded"
  - "compatibility aliases"
  - "linked_artifact_id?"
  - "logical_artifact_id?"
  - "/refs"
  - "project health"
  - "project activity"
  - "project attention"
  - "app-default"
  - "/override/effective"
negative_constraints:
  - "Acknowledged concerns must not mask active blocked state."
  - "Exports must not invent shadow IDs, feature-local receipt IDs, artifact-local cost models, or conflate runtime artifacts with Project Plan Package artifacts."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/storage-plan.md"
compatibility_only_notes:
  - "Event aliasing discipline applies to artifact event families: compatibility aliases may exist only as declared aliases to canonical event/artifact types, never as independent persistence identities."
owner_hints:
  - Plans/Project_Output_Artifacts.md
  - Plans/storage-plan.md
```

### POA-007 - Seglog Canonical Persistence And Filesystem Staging

```yaml
plan_unit_id: POA-007
unit_type: requirement
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  Project Plan Package artifacts are canonical in seglog; filesystem materialization under .puppet-master/project/** is staging/export/cache and must be regenerable with byte-identical hash verification.
gui_related: false
gui_classification_reason: This unit defines persistence and staging semantics rather than visual presentation.
split_recommended: false
depends_on:
  - POA-002
unblocks: []
acceptance_criteria:
  - "Seglog Canonical Persistence And Filesystem Staging remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - "Filesystem materialization remains staging/export/cache rather than canonical storage."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: canonical_persistence_drift
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0005
preserved_exact_tokens:
  - "seglog"
  - "usage_event"
  - "usage_event_ref"
  - "artifact_id"
  - "logical_path"
  - ".puppet-master/project/**"
  - "GATE-001"
negative_constraints:
  - "usage_event is not a rename target for seglog references; usage_event_ref never replaces artifact_id, logical_path, or seglog event identity."
preserved_contractrefs:
  - "ContractRef: SchemaID:pm.project-plan-graph-index.v1, Gate:GATE-001, ContractName:Plans/Project_Output_Artifacts.md"
owner_hints:
  - Plans/Project_Output_Artifacts.md
```

### POA-008 - Required Project Plan Package Artifacts And Verification Outputs

```yaml
plan_unit_id: POA-008
unit_type: requirement
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  Puppet Master must persist the required Project Plan Package artifact set canonically in seglog, with sharded graph paths, required traceability outputs, optional non-canonical quickstart, and a staging tree matching the listed paths.
gui_related: false
gui_classification_reason: This unit defines required artifact outputs and verification files rather than visual presentation.
split_recommended: false
depends_on:
  - POA-007
unblocks: []
acceptance_criteria:
  - "Required Project Plan Package Artifacts And Verification Outputs remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - "The required artifact set and staging tree remain aligned to the Project Plan Package SSOT."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: project_package_artifact_omission
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0006
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0007
preserved_exact_tokens:
  - "requirements.md"
  - "contracts/"
  - "plan.md"
  - "plan_graph/"
  - "index.json"
  - "nodes/<node_id>.json"
  - "acceptance_manifest.json"
  - "auto_decisions.jsonl"
  - "requirements_quality_report.json"
  - "requirements_coverage.json"
  - "requirements_coverage.md"
  - "quickstart.md"
negative_constraints:
  - "AI correctness and validator correctness must not depend on quickstart.md."
preserved_contractrefs:
  - "ContractRef: SchemaID:pm.requirements_quality_report.schema.v1, SchemaID:pm.requirements_coverage.schema.v1, Gate:GATE-011, ContractName:Plans/Project_Output_Artifacts.md"
owner_hints:
  - Plans/Project_Output_Artifacts.md
```

### POA-009 - Optional GUI Artifact Pair Trigger

```yaml
plan_unit_id: POA-009
unit_type: requirement
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  If the generated project includes interactive GUI surfaces dispatching UICommand IDs, Puppet Master emits both GUI artifacts; when no interactive GUI surface is in scope, both may be absent.
gui_related: true
gui_classification_reason: This unit governs optional GUI wiring and command catalog artifacts for generated interactive GUI surfaces.
split_recommended: false
depends_on:
  - POA-008
unblocks: []
acceptance_criteria:
  - "Optional GUI Artifact Pair Trigger remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - "Interactive GUI output emits both optional GUI artifacts or neither when no interactive GUI surface is in scope."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: gui_artifact_pair_drift
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0006
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0007
preserved_exact_tokens:
  - "Optional (GUI)"
  - ".puppet-master/project/ui/wiring_matrix.json"
  - ".puppet-master/project/ui/ui_command_catalog.json"
  - "UICommand"
negative_constraints:
  - "A project MUST NOT emit only one of the two GUI artifacts."
preserved_contractrefs:
  - "ContractRef: SchemaID:pm.requirements_quality_report.schema.v1, SchemaID:pm.requirements_coverage.schema.v1, Gate:GATE-011, ContractName:Plans/Project_Output_Artifacts.md"
owner_hints:
  - Plans/Project_Output_Artifacts.md
```

### POA-010 - Non-Canonical Execution Workspace Sidecar

```yaml
plan_unit_id: POA-010
unit_type: requirement
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  Execution-time Attempt Journal, Parent Summary, AGENTS, and iteration artifacts live in the non-canonical workspace sidecar, while .puppet-master/project/** remains package staging and .puppet-master/state/** remains reserved for project-local runtime state.
gui_related: false
gui_classification_reason: This unit defines execution workspace and storage boundaries rather than visual presentation.
split_recommended: false
depends_on:
  - POA-007
unblocks: []
acceptance_criteria:
  - "Non-Canonical Execution Workspace Sidecar remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - ".puppet-master/workspace/** remains non-canonical sidecar storage."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: canonical_workspace_boundary_drift
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0008
preserved_exact_tokens:
  - ".puppet-master/workspace/<project>/<phase>/<task>/<subtask>/"
  - "Attempt Journal"
  - "Parent Summary"
  - ".puppet-master/state/**"
  - "AGENTS.md"
  - "Promotion rules"
  - "AGENTS.md lightness budgets"
negative_constraints:
  - ".puppet-master/workspace/** remains the non-canonical execution sidecar and must not be repurposed as canonical storage."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Contracts_V0.md#AttemptJournal, ContractName:Plans/Contracts_V0.md#ParentSummary, ContractName:Plans/agent-rules-context.md#FeatureSpecVerbatim"
  - "ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Project_Output_Artifacts.md"
  - "ContractRef: ContractName:Plans/Contracts_V0.md#PromotionRules, ContractName:Plans/Contracts_V0.md#AgentsMdLightEnforcement"
owner_hints:
  - Plans/Project_Output_Artifacts.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
```

### POA-011 - Document Set Packaging Trigger And Pointer Stub

```yaml
plan_unit_id: POA-011
unit_type: requirement
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  Markdown/text artifacts under .puppet-master/** that reach packaging triggers become adjacent .docset/ Document Sets per policy, with the original path retained as a deterministic derived pointer stub.
gui_related: true
gui_classification_reason: This unit preserves Document Set packaging behavior for user-visible Markdown/text artifacts and pointer stubs.
split_recommended: false
depends_on:
  - POA-008
unblocks: []
acceptance_criteria:
  - "Document Set Packaging Trigger And Pointer Stub remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - "Packaging trigger behavior remains aligned to Document Packaging Policy and Gate:GATE-014."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: document_set_packaging_drift
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0009
preserved_exact_tokens:
  - "Plans/Document_Packaging_Policy.md"
  - ".docset/"
  - ".puppet-master/project/requirements.md.docset/"
  - "deterministic pointer stub"
  - "Gate:GATE-014"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Document_Packaging_Policy.md, Gate:GATE-014, SchemaID:pm.project-plan-graph-index.v1"
  - "ContractRef: ContractName:Plans/Document_Packaging_Policy.md#7, Gate:GATE-014"
owner_hints:
  - Plans/Project_Output_Artifacts.md
  - Plans/Document_Packaging_Policy.md
```

### POA-012 - Packaged Document Set Canonical Members And No Recursion

```yaml
plan_unit_id: POA-012
unit_type: constraint
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  Packaged Document Sets make index, manifest, shards, and evidence canonical for the logical artifact while the original path remains only a derived pointer stub; sharded plan graph identity remains unchanged.
gui_related: false
gui_classification_reason: This unit defines packaging output and recursion constraints rather than visual presentation.
split_recommended: false
depends_on:
  - POA-011
unblocks: []
acceptance_criteria:
  - "Packaged Document Set Canonical Members And No Recursion remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - "Generated Document Set contents do not recursively become new packaging inputs."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: document_set_recursion_drift
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0010
preserved_exact_tokens:
  - "<logical_artifact_path>.docset/00-index.md"
  - "manifest.json"
  - "evidence/"
  - "<logical_artifact_path>"
  - "plan_graph/index.json"
  - "nodes/<node_id>.json"
negative_constraints:
  - "Generated .docset/** contents are packaging outputs, not new packaging inputs; verifiers and generators must not recurse and package Document Set members again."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Document_Packaging_Policy.md#7, Gate:GATE-014"
  - "ContractRef: SchemaID:pm.project-plan-graph-index.v1"
owner_hints:
  - Plans/Project_Output_Artifacts.md
  - Plans/Document_Packaging_Policy.md
```

### POA-013 - Schema Alignment Exact Field Names

```yaml
plan_unit_id: POA-013
unit_type: constraint
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  The listed Puppet Master internal schemas and exact field names are authoritative; this document owns paths, sharding, DRY requirements, and cross-file integrity rules.
gui_related: false
gui_classification_reason: This unit defines schema and field-name requirements rather than visual presentation.
split_recommended: false
depends_on:
  - POA-008
unblocks: []
acceptance_criteria:
  - "Schema Alignment Exact Field Names remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - "Exact schema IDs and field names remain stable and are not renamed during implementation."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: schema_field_name_drift
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0011
preserved_exact_tokens:
  - "pm.project-plan-graph-index.v1"
  - "pm.project-plan-node.v1"
  - "pm.project-plan-graph.v1"
  - "pm.project_contracts_index.schema.v1"
  - "pm.acceptance_manifest.schema.v1"
  - "pm.auto_decisions.schema.v1"
  - "pm.requirements_quality_report.schema.v1"
  - "nodes[].path"
  - "nodes[].sha256"
  - "contract_refs"
  - "depends_on"
negative_constraints:
  - "Do not rename fields."
preserved_contractrefs: []
owner_hints:
  - Plans/Project_Output_Artifacts.md
```

### POA-014 - Platform And Project Contract Pack Index Layers

```yaml
plan_unit_id: POA-014
unit_type: requirement
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  Internal Platform Contracts are referenced by stable IDs, while generated Project Contracts live in the Project Contract Pack; contracts/index.json is the canonical mapping from ProjectContract:* IDs to kind, path, sha256, and related metadata.
gui_related: false
gui_classification_reason: This unit defines contract layering and project contract index semantics rather than visual presentation.
split_recommended: false
depends_on:
  - POA-013
unblocks: []
acceptance_criteria:
  - "Platform And Project Contract Pack Index Layers remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - "Platform Contracts remain referenced rather than embedded in generated user projects."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: contract_pack_index_drift
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0012
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0013
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0014
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0015
preserved_exact_tokens:
  - "Platform Contracts"
  - "Project Contracts"
  - "PolicyRule:*"
  - "SchemaID:*"
  - "ProjectContract:*"
  - ".puppet-master/project/contracts/index.json"
  - "contracts[].contract_id"
  - "contracts[].path"
  - "^ProjectContract:"
  - "pm.project_contracts_index.schema.v1"
negative_constraints:
  - "Platform Contracts are referenced from project artifacts but not embedded verbatim in user projects."
preserved_contractrefs:
  - "ContractRef: SchemaID:pm.project_contracts_index.schema.v1"
  - "ContractRef: SchemaID:pm.project_contracts_index.schema.v1, ContractName:Plans/DRY_Rules.md#7"
owner_hints:
  - Plans/Project_Output_Artifacts.md
  - Plans/DRY_Rules.md
```

### POA-015 - DRY Graph And Acceptance Cross-References

```yaml
plan_unit_id: POA-015
unit_type: requirement
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  Node shards and acceptance manifests cross-reference Project Contract IDs instead of duplicating specifications, and human plan.md summaries must point to canonical ProjectContract sources.
gui_related: false
gui_classification_reason: This unit defines DRY graph and acceptance cross-reference rules rather than visual presentation.
split_recommended: false
depends_on:
  - POA-014
unblocks: []
acceptance_criteria:
  - "DRY Graph And Acceptance Cross-References remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - "Node shards and acceptance manifests reference contract IDs rather than inlining canonical specifications."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: dry_contract_duplication
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0016
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0017
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0018
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0019
preserved_exact_tokens:
  - "contract_refs"
  - "ProjectContract:*"
  - "acceptance_manifest.json"
  - "nodes[].node_id"
  - "nodes[].checks[].contract_refs"
  - "acceptance[].check_id"
  - "Canonical source: ProjectContract:<...>"
negative_constraints:
  - "Node shards must not repeat or inline the contract pack canonical specifications; use contract_refs instead."
preserved_contractrefs:
  - "ContractRef: SchemaID:pm.project-plan-node.v1, ContractName:Plans/DRY_Rules.md#7"
  - "ContractRef: SchemaID:pm.acceptance_manifest.schema.v1, Gate:GATE-001, ContractName:Plans/Project_Output_Artifacts.md"
  - "ContractRef: ContractName:Plans/DRY_Rules.md#7"
owner_hints:
  - Plans/Project_Output_Artifacts.md
  - Plans/DRY_Rules.md
```

### POA-016 - Autonomous Decision Logging Projection

```yaml
plan_unit_id: POA-016
unit_type: requirement
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  Puppet Master applies deterministic defaults autonomously, records valid ambiguities to user-project auto_decisions.jsonl, keeps internal SSOT decisions separate, and supports optional HITL approval-boundary nodes through tool_policy_mode: "ask".
gui_related: false
gui_classification_reason: This unit defines decision logging and autonomy behavior rather than visual presentation.
split_recommended: false
depends_on:
  - POA-007
unblocks: []
acceptance_criteria:
  - "Autonomous Decision Logging Projection remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - "User-project decision projections stay separate from internal Plans/auto_decisions.jsonl."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: decision_log_projection_drift
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0020
preserved_exact_tokens:
  - "Plans/Decision_Policy.md"
  - ".puppet-master/project/auto_decisions.jsonl"
  - "Plans/auto_decisions.jsonl"
  - "pm.auto_decisions.schema.v1"
  - "tool_policy_mode: \"ask\""
  - "pm.project-plan-node.v1"
negative_constraints:
  - "Human ambiguity resolution is not required for continued execution; decision logging is traceability, not gating."
preserved_contractrefs:
  - "ContractRef: `PolicyRule:Decision_Policy.md`"
  - "ContractRef: SchemaID:pm.auto_decisions.schema.v1, PolicyRule:Decision_Policy.md§4"
owner_hints:
  - Plans/Project_Output_Artifacts.md
  - Plans/Decision_Policy.md
```

### POA-017 - Sharded-Only Plan Graph Root

```yaml
plan_unit_id: POA-017
unit_type: requirement
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  Puppet Master produces user-project plans as a canonical sharded-only graph under .puppet-master/project/plan_graph/, while plan.md remains the required human-readable view.
gui_related: true
gui_classification_reason: This unit preserves the user-visible human plan view boundary while defining the sharded headless graph root.
split_recommended: false
depends_on:
  - POA-013
  - POA-015
unblocks: []
acceptance_criteria:
  - "Sharded-Only Plan Graph Root remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - "The sharded graph remains canonical headless input and plan.md remains the human-readable view."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: plan_graph_entrypoint_drift
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0021
preserved_exact_tokens:
  - "sharded-only plan graph"
  - ".puppet-master/project/plan_graph/"
  - "canonical headless execution input"
  - "plan.md"
  - "pm.project-plan-graph-index.v1"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: SchemaID:pm.project-plan-graph-index.v1, ContractName:Plans/Project_Output_Artifacts.md"
  - "ContractRef: SchemaID:pm.project-plan-graph-index.v1"
owner_hints:
  - Plans/Project_Output_Artifacts.md
```

### POA-018 - Locked Plan Graph Entrypoint And Noncanonical Monolithic Export

```yaml
plan_unit_id: POA-018
unit_type: decision
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  The canonical graph entrypoint is always plan_graph/index.json; node files live under nodes/, optional edges.json is allowed, and any monolithic graph is a labeled derived export only.
gui_related: false
gui_classification_reason: This unit defines canonical graph file authority and derived export disposition rather than visual presentation.
split_recommended: false
depends_on:
  - POA-017
unblocks: []
acceptance_criteria:
  - "Locked Plan Graph Entrypoint And Noncanonical Monolithic Export remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - "No canonical .puppet-master/project/plan_graph.json is introduced."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: plan_graph_monolith_drift
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: decision
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0022
preserved_exact_tokens:
  - ".puppet-master/project/plan_graph/index.json"
  - "nodes/<node_id>.json"
  - "edges.json"
  - "NO canonical .puppet-master/project/plan_graph.json"
  - "plan_graph/exports/plan_graph.monolithic.json"
  - "locked decision"
  - "no open questions remain"
negative_constraints:
  - "There is no canonical .puppet-master/project/plan_graph.json; monolithic export is never canonical input for orchestration or validation."
preserved_contractrefs:
  - "ContractRef: SchemaID:pm.project-plan-graph-index.v1, ContractName:Plans/Project_Output_Artifacts.md"
stale_retired_dispositions:
  - "2026-02-24: Marked .puppet-master/project/plan_graph/exports/plan_graph.monolithic.json as an optional, non-canonical derived export."
owner_hints:
  - Plans/Project_Output_Artifacts.md
```

### POA-019 - Deterministic Node IDs

```yaml
plan_unit_id: POA-019
unit_type: constraint
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  Node IDs must be stable and reproducible from canonical node intent for identical inputs so shard filenames remain deterministic.
gui_related: false
gui_classification_reason: This unit defines deterministic identity constraints rather than visual presentation.
split_recommended: false
depends_on:
  - POA-017
unblocks: []
acceptance_criteria:
  - "Deterministic Node IDs remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - "Node IDs do not depend on nondeterministic inputs."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: node_id_nondeterminism
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0023
preserved_exact_tokens:
  - "stable and deterministic"
  - "timestamps"
  - "randomness"
  - "session IDs"
  - "canonical representation of the node intent"
  - "Invariant:INV-005"
  - "PolicyRule:Decision_Policy.md§2"
negative_constraints:
  - "Node IDs must not depend on timestamps, randomness, session IDs, or nondeterministic ordering."
preserved_contractrefs:
  - "ContractRef: Invariant:INV-005, PolicyRule:Decision_Policy.md§2"
owner_hints:
  - Plans/Project_Output_Artifacts.md
```

### POA-020 - Canonical Plan Graph Index Requirements

```yaml
plan_unit_id: POA-020
unit_type: requirement
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  plan_graph/index.json is the required canonical graph entrypoint with schema version, node shard listing and hashes, entrypoints, deterministic execution ordering, validation targets, Executor Protocol status semantics, and canonical dependency semantics driven by blockers[].
gui_related: true
gui_classification_reason: The source span is GUI-related in the migration map because it preserves user-visible plan graph entrypoint and validation target semantics alongside headless execution rules.
split_recommended: false
depends_on:
  - POA-018
  - POA-019
unblocks: []
acceptance_criteria:
  - "Canonical Plan Graph Index Requirements remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - "Index requirements preserve canonical dependency semantics and Executor Protocol status alignment."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: plan_graph_index_schema_drift
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0024
preserved_exact_tokens:
  - "schema_version"
  - "nodes[]"
  - "nodes/<node_id>.json"
  - "sha256"
  - "entrypoints"
  - "execution_ordering"
  - "execution_ordering.node_state_source"
  - "validation.targets"
  - "acceptance_manifest"
  - "contracts_index"
  - "blockers[]"
  - "unblocks[]"
  - "depends_on[]"
  - "edges.json"
  - "Plans/Executor_Protocol.md"
negative_constraints:
  - "Graph execution must not rely on GUI-only artifacts."
preserved_contractrefs:
  - "ContractRef: SchemaID:pm.project-plan-graph-index.v1, ContractName:Plans/Project_Output_Artifacts.md"
  - "ContractRef: SchemaID:pm.project-plan-graph-index.v1, ContractName:Plans/Executor_Protocol.md"
compatibility_only_notes:
  - "depends_on[] is optional compatibility metadata only, and edges.json is a derived consistency artifact rather than authority."
owner_hints:
  - Plans/Project_Output_Artifacts.md
  - Plans/Executor_Protocol.md
```

### POA-021 - Plan Graph Node Shard Required Fields

```yaml
plan_unit_id: POA-021
unit_type: requirement
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  Node shards under plan_graph/nodes/<node_id>.json must conform to pm.project-plan-node.v1, include all required lifecycle, policy, evidence, dependency, decision, and readiness fields, and keep filename node_id, ProjectContract:*, acceptance[], and evidence_required.path integrity aligned.
gui_related: false
gui_classification_reason: This unit defines sharded node schema and integrity behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "POA-020"
unblocks: []
acceptance_criteria:
  - "Plan Graph Node Shard Required Fields remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: project_plan_node_schema_drift
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0025
preserved_exact_tokens:
  - "node_id"
  - "objective"
  - "contract_refs"
  - "acceptance"
  - "evidence_required"
  - "allowed_tools"
  - "tool_policy_mode"
  - "policy_mode"
  - "change_budget"
  - "blockers"
  - "unblocks"
  - "status"
  - "evidence_pointer"
  - "verifier_result"
  - "decision_refs"
  - "spec_lock_requirements"
negative_constraints:
  - "No manual-only acceptance checks are allowed."
  - "evidence_required.path is reserved execution evidence, not initial Project Plan Package output."
preserved_contractrefs:
  - "ContractRef: SchemaID:pm.project-plan-node.v1, ContractName:Plans/Project_Output_Artifacts.md"
  - "ContractRef: SchemaID:pm.project-plan-node.v1, Gate:GATE-001"
  - "ContractRef: SchemaID:pm.project-plan-node.v1, Gate:GATE-001, ContractName:Plans/Project_Output_Artifacts.md"
owner_hints:
  - "Plans/Project_Output_Artifacts.md"
```

### POA-022 - Optional Edges Consistency Artifact

```yaml
plan_unit_id: POA-022
unit_type: constraint
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  plan_graph/edges.json is optional and, if present, must be consistent with shard dependency semantics.
gui_related: false
gui_classification_reason: This unit defines optional dependency projection behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "POA-021"
unblocks: []
acceptance_criteria:
  - "Optional Edges Consistency Artifact remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: optional_edges_authority_drift
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0026
preserved_exact_tokens:
  - "edges.json"
  - "blockers"
  - "unblocks"
  - "depends_on"
negative_constraints:
  - "edges.json must not be required for headless execution and must not override shard-local blockers[]."
preserved_contractrefs:
  - "ContractRef: Gate:GATE-001, ContractName:Plans/Project_Output_Artifacts.md"
owner_hints:
  - "Plans/Project_Output_Artifacts.md"
```

### POA-023 - Noncanonical Monolithic Graph Export

```yaml
plan_unit_id: POA-023
unit_type: constraint
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  plan_graph/exports/plan_graph.monolithic.json may exist only as a faithful, lossless, noncanonical derived export.
gui_related: false
gui_classification_reason: This unit defines derived export disposition rather than visual presentation.
split_recommended: false
depends_on:
  - "POA-018"
  - "POA-021"
unblocks: []
acceptance_criteria:
  - "Noncanonical Monolithic Graph Export remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: noncanonical_export_drift
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0027
preserved_exact_tokens:
  - "pm.project-plan-graph.v1"
  - "same node IDs"
  - "same node fields"
  - "same entrypoints"
negative_constraints:
  - "The monolithic graph is not canonical and must not be required for validation or orchestration."
preserved_contractrefs:
  - "ContractRef: SchemaID:pm.project-plan-graph.v1, ContractName:Plans/Project_Output_Artifacts.md"
owner_hints:
  - "Plans/Project_Output_Artifacts.md"
```

### POA-024 - Seglog Artifact Event Persistence Fields

```yaml
plan_unit_id: POA-024
unit_type: requirement
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  Project Plan Package artifacts are canonical in seglog, with filesystem as regenerable export/cache and required artifact-event fields sufficient for hash-verified reconstruction.
gui_related: false
gui_classification_reason: This unit defines persistence event fields and reconstruction semantics rather than visual presentation.
split_recommended: false
depends_on:
  - "POA-007"
unblocks: []
acceptance_criteria:
  - "Seglog Artifact Event Persistence Fields remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: seglog_artifact_event_drift
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0028
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0029
preserved_exact_tokens:
  - "artifact_id"
  - "artifact_type"
  - "schema_version"
  - "logical_path"
  - "content_bytes"
  - "content_hash"
  - "ts"
  - "session_id"
  - "agent_id"
  - "workspace-root relative"
  - "SHA-256"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Contracts_V0.md#EventRecord, Primitive:Seglog"
owner_hints:
  - "Plans/Project_Output_Artifacts.md"
```

### POA-025 - Canonical Project Plan Package Artifact Types

```yaml
plan_unit_id: POA-025
unit_type: requirement
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  The canonical artifact_type registry maps Project Plan Package artifact types to their required, optional, GUI, validation, traceability, and quickstart logical paths.
gui_related: true
gui_classification_reason: The source span includes optional GUI artifact types and user-visible package artifact registry entries.
split_recommended: false
depends_on:
  - "POA-024"
unblocks: []
acceptance_criteria:
  - "Canonical Project Plan Package Artifact Types remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: artifact_type_registry_drift
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0030
preserved_exact_tokens:
  - "requirements"
  - "contracts_pack"
  - "plan_human"
  - "plan_graph_index"
  - "plan_graph_node"
  - "plan_graph_edges"
  - "plan_graph_monolith"
  - "acceptance_manifest"
  - "auto_decisions"
  - "ui_wiring_matrix"
  - "ui_command_catalog"
  - "validation_pass_report"
  - "requirements_quality_report"
  - "requirements_coverage_json"
  - "requirements_coverage_md"
  - "quickstart_md"
negative_constraints:
  - "plan_graph_monolith remains optional and noncanonical."
preserved_contractrefs: []
owner_hints:
  - "Plans/Project_Output_Artifacts.md"
```

### POA-026 - Validator Graph Integrity And Headless Execution

```yaml
plan_unit_id: POA-026
unit_type: requirement
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  Validators must prove sharded graph validity, shard hashes, contract references, acceptance coverage, seglog hash matching, headless orchestration, and optional monolithic export consistency.
gui_related: true
gui_classification_reason: The source span includes validation behavior that explicitly excludes reliance on GUI artifacts while preserving GUI-artifact boundary checks.
split_recommended: false
depends_on:
  - "POA-021"
  - "POA-025"
unblocks: []
acceptance_criteria:
  - "Validator Graph Integrity And Headless Execution remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: validator_graph_integrity_drift
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0031
preserved_exact_tokens:
  - "plan_graph/index.json"
  - "nodes[].path"
  - "nodes[].sha256"
  - "ProjectContract:*"
  - "contracts/index.json"
  - "acceptance_manifest.json"
  - "content_hash"
  - "plan.md"
  - "GUI artifacts"
  - "plan_graph.monolithic.json"
negative_constraints:
  - "Headless orchestration must not depend on plan.md, GUI artifacts, or optional monolithic exports."
preserved_contractrefs:
  - "ContractRef: Gate:GATE-001, Gate:GATE-005, Gate:GATE-009, ContractName:Plans/Project_Output_Artifacts.md"
  - "ContractRef: Gate:GATE-001, Gate:GATE-005, Gate:GATE-009"
owner_hints:
  - "Plans/Project_Output_Artifacts.md"
```

### POA-027 - Validation Sweep Completeness And Post-Pass Finality

```yaml
plan_unit_id: POA-027
unit_type: requirement
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  Validation sweeps must produce Auditor cycle reports tied by workflow_run_id,
  preserve provider/model provenance, remain deterministic/headless, and
  validate post-loop corrected artifacts until certified or critically blocked;
  zero or more legacy pass-shaped report rows may exist only as import/export/search compatibility mirrors.
gui_related: true
gui_classification_reason: The source span is GUI-related in the migration map and covers user-visible validation sweep provenance and corrected output finality.
split_recommended: false
depends_on:
  - "POA-026"
unblocks: []
acceptance_criteria:
  - "Validation Sweep Completeness And Post-Pass Finality remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: validation_sweep_finality_drift
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0031
preserved_exact_tokens:
  - "validation_pass_report"
  - "pass_number 1, 2, 3"
  - "workflow_run_id"
  - "changes_applied_summary"
  - "requirements.md"
  - "plan.md"
  - "quickstart.md"
  - "provider"
  - "model"
  - "model_roles.auditor.provider"
  - "model_roles.auditor.model"
negative_constraints:
  - "Certification-cycle summary contains no write-protected requirements.md or plan.md."
  - "No human approval gates occur inside the Auditor audit/repair/re-audit loop."
preserved_contractrefs:
  - "ContractRef: SchemaID:pm.project-plan-graph-index.v1, ContractName:Plans/Project_Output_Artifacts.md"
owner_hints:
  - "Plans/Project_Output_Artifacts.md"
```

### POA-028 - Traceability And Quickstart Validator Integrity

```yaml
plan_unit_id: POA-028
unit_type: requirement
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  Validators must enforce requirements quality and coverage JSON integrity, Markdown/JSON ID parity, and optional quickstart command, count, and size constraints.
gui_related: true
gui_classification_reason: The source span is GUI-related in the migration map and includes human-readable traceability and quickstart validation outputs.
split_recommended: false
depends_on:
  - "POA-026"
unblocks: []
acceptance_criteria:
  - "Traceability And Quickstart Validator Integrity remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: traceability_quickstart_validation_drift
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0031
preserved_exact_tokens:
  - "summary.total_requirements"
  - "uncovered_requirements[]"
  - "orphaned_node_requirement_refs[]"
  - "uncovered_acceptance[]"
  - "requirements_coverage.md"
  - "nodes[].checks[].commands[].cmd"
  - "<= 20"
  - "<= 16384 bytes"
negative_constraints:
  - "Orchestration, planning, and validator correctness must not depend on quickstart.md."
preserved_contractrefs:
  - "ContractRef: SchemaID:pm.requirements_quality_report.schema.v1, SchemaID:pm.requirements_coverage.schema.v1, SchemaID:pm.acceptance_manifest.schema.v1, Gate:GATE-011, ContractName:Plans/Project_Output_Artifacts.md"
owner_hints:
  - "Plans/Project_Output_Artifacts.md"
```

### POA-029 - Auditor Cycle Report Lineage Bridge

```yaml
plan_unit_id: POA-029
unit_type: requirement
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  Auditor cycle reports remain upstream artifacts but must bridge backward to planning/wizard state and forward to launched execution through explicit lineage and runtime/account identity fields. The legacy `validation_pass_report` artifact family name is a compatibility mirror, not a fixed validation-pass model selector; plans-to-code audit, verification, certification, quality gates, and evidence review route to Auditor Model, and broad artifact-family rename remains deferred.
gui_related: true
gui_classification_reason: The source span is GUI-related in the migration map and preserves History/Ledger/export lineage for Auditor cycle reports and legacy compatibility mirrors.
split_recommended: false
depends_on:
  - "POA-027"
unblocks: []
acceptance_criteria:
  - "Auditor Cycle Report Lineage Bridge remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - "validation_pass_report remains a compatibility mirror artifact-family lineage name with compatibility_only true and cycle_report_ref, not a user-facing validation-pass model selector."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: validation_pass_lineage_drift
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0031
preserved_exact_tokens:
  - "project_id"
  - "wizard_id?"
  - "thread_id?"
  - "phase_plan_ref?"
  - "staged bundle refs"
  - "requirements_quality_report_ref?"
  - "promoted artifact refs"
  - "workflow_run_id"
  - "requested/effective runtime identity snapshot refs"
  - "effective_account_id?"
  - "execution_role"
  - "run_id?"
  - "pass_verdict"
  - "skipped"
negative_constraints:
  - "Auditor cycle reports and legacy validation_pass_report mirrors do not become runtime attempts."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Runtime_Artifacts_Panel.md"
  - "ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/Contracts_V0.md"
  - "ContractRef: Plans/Contracts_V0.md#3.3 Requirements quality events, Plans/chain-wizard-flexibility.md#12. Auditor Invariant Loop (Mandatory Invariant Sweep)"
owner_hints:
  - "Plans/Project_Output_Artifacts.md"
```

### POA-030 - Traceability Outputs Classification

```yaml
plan_unit_id: POA-030
unit_type: requirement
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  Traceability outputs are derived, noncanonical for planning decisions, and canonical for verification outputs.
gui_related: false
gui_classification_reason: This unit defines traceability output authority and classification rather than visual presentation.
split_recommended: false
depends_on:
  - "POA-028"
unblocks: []
acceptance_criteria:
  - "Traceability Outputs Classification remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: traceability_classification_drift
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0032
preserved_exact_tokens:
  - "derived"
  - "non-canonical"
  - "canonical"
  - "requirements quality"
  - "coverage reports"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: SchemaID:pm.requirements_quality_report.schema.v1, SchemaID:pm.requirements_coverage.schema.v1, SchemaID:pm.project-plan-node.v1, SchemaID:pm.acceptance_manifest.schema.v1, Gate:GATE-011"
owner_hints:
  - "Plans/Project_Output_Artifacts.md"
```

### POA-031 - Requirements Quality Report Artifact

```yaml
plan_unit_id: POA-031
unit_type: requirement
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  requirements_quality_report.json is the machine-readable requirements quality artifact, validates against pm.requirements_quality_report.schema.v1, and is verification-canonical but noncanonical for planning decisions.
gui_related: false
gui_classification_reason: This unit defines a derived verification artifact path and schema rather than visual presentation.
split_recommended: false
depends_on:
  - "POA-030"
unblocks: []
acceptance_criteria:
  - "Requirements Quality Report Artifact remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: requirements_quality_report_drift
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0033
preserved_exact_tokens:
  - ".puppet-master/project/traceability/requirements_quality_report.json"
  - "pm.requirements_quality_report.schema.v1"
  - "verification-canonical"
  - "non-canonical for planning decisions"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: SchemaID:pm.requirements_quality_report.schema.v1"
owner_hints:
  - "Plans/Project_Output_Artifacts.md"
```

### POA-032 - Requirements Coverage JSON And Requirement Extraction

```yaml
plan_unit_id: POA-032
unit_type: requirement
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  requirements_coverage.json validates against pm.requirements_coverage.schema.v1 and is generated by extracting authoritative requirement IDs from requirements.md into requirements[] with initial uncovered coverage state.
gui_related: false
gui_classification_reason: This unit defines machine-readable traceability extraction rules rather than visual presentation.
split_recommended: false
depends_on:
  - "POA-030"
unblocks: []
acceptance_criteria:
  - "Requirements Coverage JSON And Requirement Extraction remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: requirements_coverage_extraction_drift
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0034
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0035
preserved_exact_tokens:
  - ".puppet-master/project/traceability/requirements_coverage.json"
  - "pm.requirements_coverage.schema.v1"
  - "FR-[0-9]{3,}"
  - "NFR-[0-9]{3,}"
  - "REQ-[0-9]{3,}"
  - "requirements[]"
  - "node_ids: []"
  - "acceptance_check_ids: []"
  - "coverage_status: \"uncovered\""
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: SchemaID:pm.requirements_coverage.schema.v1"
owner_hints:
  - "Plans/Project_Output_Artifacts.md"
```

### POA-033 - Node Requirement Refs Coverage Mapping

```yaml
plan_unit_id: POA-033
unit_type: requirement
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  Node shard requirement_refs map known requirement IDs to node_ids[] and record unknown refs in orphaned_node_requirement_refs[] with the req_id_not_in_requirements_md sentinel.
gui_related: false
gui_classification_reason: This unit defines coverage mapping logic rather than visual presentation.
split_recommended: false
depends_on:
  - "POA-032"
unblocks: []
acceptance_criteria:
  - "Node Requirement Refs Coverage Mapping remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: node_requirement_ref_mapping_drift
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0036
preserved_exact_tokens:
  - "requirement_refs: string[]"
  - "orphaned_node_requirement_refs[]"
  - "req_id_not_in_requirements_md"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: SchemaID:pm.project-plan-node.v1"
owner_hints:
  - "Plans/Project_Output_Artifacts.md"
```

### POA-034 - Acceptance Manifest Requirement Mapping

```yaml
plan_unit_id: POA-034
unit_type: requirement
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  Acceptance manifest req_id fields map acceptance check IDs to known requirements while checks without req_id do not contribute and unknown req_id checks are ignored for uncovered_acceptance[] computation.
gui_related: false
gui_classification_reason: This unit defines acceptance coverage mapping semantics rather than visual presentation.
split_recommended: false
depends_on:
  - "POA-032"
unblocks: []
acceptance_criteria:
  - "Acceptance Manifest Requirement Mapping remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: acceptance_requirement_mapping_drift
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0037
preserved_exact_tokens:
  - ".puppet-master/project/acceptance_manifest.json"
  - "req_id"
  - "check_id"
  - "acceptance_check_ids[]"
  - "uncovered_acceptance[]"
negative_constraints:
  - "Checks with no req_id do not contribute to coverage."
  - "Acceptance checks with unknown req_id are ignored for uncovered_acceptance[] computation."
preserved_contractrefs:
  - "ContractRef: SchemaID:pm.acceptance_manifest.schema.v1, Gate:GATE-011, ContractName:Plans/Project_Output_Artifacts.md"
  - "ContractRef: SchemaID:pm.acceptance_manifest.schema.v1, ContractName:Plans/Project_Output_Artifacts.md"
owner_hints:
  - "Plans/Project_Output_Artifacts.md"
```

### POA-035 - Coverage Status And Uncovered Acceptance Rules

```yaml
plan_unit_id: POA-035
unit_type: requirement
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  Coverage status is computed as covered, partially_covered, or uncovered from node and acceptance mappings, and uncovered_acceptance[] records only requirements with node coverage but no mapped acceptance checks.
gui_related: false
gui_classification_reason: This unit defines coverage computation semantics rather than visual presentation.
split_recommended: false
depends_on:
  - "POA-033"
  - "POA-034"
unblocks: []
acceptance_criteria:
  - "Coverage Status And Uncovered Acceptance Rules remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: coverage_status_drift
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0038
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0039
preserved_exact_tokens:
  - "\"covered\""
  - "\"partially_covered\""
  - "\"uncovered\""
  - "no_acceptance_check_maps_to_this_requirement"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: SchemaID:pm.requirements_coverage.schema.v1, ContractName:Plans/Project_Output_Artifacts.md"
  - "ContractRef: SchemaID:pm.requirements_coverage.schema.v1, ContractName:Plans/requirements_coverage.schema.json"
owner_hints:
  - "Plans/Project_Output_Artifacts.md"
```

### POA-036 - Requirements Coverage Summary Computation

```yaml
plan_unit_id: POA-036
unit_type: requirement
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  The requirements_coverage summary object is computed after all mapping steps and reports total, covered, partially covered, uncovered, orphaned_refs, and uncovered_acceptance_count values from the generated collections.
gui_related: false
gui_classification_reason: This unit defines summary computation rather than visual presentation.
split_recommended: false
depends_on:
  - "POA-035"
unblocks: []
acceptance_criteria:
  - "Requirements Coverage Summary Computation remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: coverage_summary_drift
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0040
preserved_exact_tokens:
  - "total_requirements"
  - "covered"
  - "partially_covered"
  - "uncovered"
  - "orphaned_refs"
  - "uncovered_acceptance_count"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: SchemaID:pm.requirements_coverage.schema.v1, ContractName:Plans/Project_Output_Artifacts.md"
owner_hints:
  - "Plans/Project_Output_Artifacts.md"
```

### POA-037 - Human-Readable Requirements Coverage Markdown

```yaml
plan_unit_id: POA-037
unit_type: requirement
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  requirements_coverage.md is regenerated deterministically from requirements_coverage.json and must match JSON counts and IDs exactly while listing covered, partially covered, uncovered, orphaned, and uncovered acceptance entries.
gui_related: false
gui_classification_reason: This unit defines human-readable verification output generation but not GUI layout or styling.
split_recommended: false
depends_on:
  - "POA-036"
unblocks: []
acceptance_criteria:
  - "Human-Readable Requirements Coverage Markdown remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: requirements_coverage_markdown_drift
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0041
preserved_exact_tokens:
  - "requirements_coverage.md"
  - "regenerated deterministically"
  - "exact counts and IDs"
  - "covered"
  - "partially covered"
  - "uncovered"
  - "orphaned node requirement_refs"
  - "uncovered acceptance requirements"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: SchemaID:pm.requirements_coverage.schema.v1, ContractName:Plans/Project_Output_Artifacts.md"
owner_hints:
  - "Plans/Project_Output_Artifacts.md"
```

### POA-038 - Traceability Verifier Integrity Checks

```yaml
plan_unit_id: POA-038
unit_type: requirement
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  The verifier must enforce deterministic traceability integrity checks including summary count equality, uncovered and orphaned lengths, Markdown ID parity, and JSON schema validation.
gui_related: false
gui_classification_reason: This unit defines verifier checks rather than visual presentation.
split_recommended: false
depends_on:
  - "POA-031"
  - "POA-037"
unblocks: []
acceptance_criteria:
  - "Traceability Verifier Integrity Checks remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: traceability_verifier_integrity_drift
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0042
preserved_exact_tokens:
  - "summary.total_requirements"
  - "len(requirements[])"
  - "len(uncovered_requirements[])"
  - "len(orphaned_node_requirement_refs[])"
  - "len(uncovered_acceptance[])"
  - "requirements_coverage.md"
  - "Plans/requirements_coverage.schema.json"
  - "Plans/requirements_quality_report.schema.json"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: SchemaID:pm.requirements_quality_report.schema.v1, SchemaID:pm.requirements_coverage.schema.v1, ContractName:Plans/Project_Output_Artifacts.md"
  - "ContractRef: SchemaID:pm.requirements_coverage.schema.v1"
  - "ContractRef: SchemaID:pm.requirements_coverage.schema.v1, Gate:GATE-011"
  - "ContractRef: SchemaID:pm.requirements_quality_report.schema.v1"
  - "ContractRef: SchemaID:pm.requirements_quality_report.schema.v1, SchemaID:pm.requirements_coverage.schema.v1, SchemaID:pm.project-plan-node.v1, SchemaID:pm.acceptance_manifest.schema.v1, Gate:GATE-011"
owner_hints:
  - "Plans/Project_Output_Artifacts.md"
```

### POA-039 - Traceability Outputs Seglog Persistence

```yaml
plan_unit_id: POA-039
unit_type: requirement
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  Traceability outputs persist to seglog as requirements_quality_report, requirements_coverage_json, and requirements_coverage_md artifact types, with filesystem files regenerable from seglog.
gui_related: false
gui_classification_reason: This unit defines persistence for traceability outputs rather than visual presentation.
split_recommended: false
depends_on:
  - "POA-024"
  - "POA-038"
unblocks: []
acceptance_criteria:
  - "Traceability Outputs Seglog Persistence remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: traceability_seglog_persistence_drift
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0043
preserved_exact_tokens:
  - "requirements_quality_report"
  - "requirements_coverage_json"
  - "requirements_coverage_md"
  - "Contracts_V0.md#EventRecord"
  - "Primitive:Seglog"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Contracts_V0.md#EventRecord, Primitive:Seglog"
owner_hints:
  - "Plans/Project_Output_Artifacts.md"
```

### POA-040 - Optional Quickstart Derived Convenience Contract

```yaml
plan_unit_id: POA-040
unit_type: constraint
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  quickstart.md is an optional derived convenience output and is noncanonical for planning and orchestration.
gui_related: false
gui_classification_reason: This unit defines human convenience output authority rather than visual presentation.
split_recommended: false
depends_on:
  - "POA-028"
unblocks: []
acceptance_criteria:
  - "Optional Quickstart Derived Convenience Contract remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: quickstart_authority_drift
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0044
preserved_exact_tokens:
  - ".puppet-master/project/quickstart.md"
  - "derived convenience output"
  - "non-canonical for planning and orchestration"
negative_constraints:
  - "AI correctness, planning correctness, and validator correctness must not depend on quickstart.md."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Project_Output_Artifacts.md, SchemaID:pm.acceptance_manifest.schema.v1"
owner_hints:
  - "Plans/Project_Output_Artifacts.md"
```

### POA-041 - Quickstart Deterministic Generation Rules

```yaml
plan_unit_id: POA-041
unit_type: requirement
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  quickstart.md is generated deterministically from acceptance_manifest commands using manifest traversal order, fixed count and byte limits, verbatim command membership, and the exact truncation note.
gui_related: false
gui_classification_reason: This unit defines deterministic file generation rules rather than visual presentation.
split_recommended: false
depends_on:
  - "POA-040"
unblocks: []
acceptance_criteria:
  - "Quickstart Deterministic Generation Rules remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: quickstart_generation_drift
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0045
preserved_exact_tokens:
  - "nodes[].checks[].commands[].cmd"
  - "no synthesis, normalization, aliasing, interpolation, or reformatting"
  - "manifest traversal order"
  - "max_commands = 20"
  - "max_file_size_bytes = 16384"
  - "... truncated; see .puppet-master/project/acceptance_manifest.json for complete checks"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: SchemaID:pm.acceptance_manifest.schema.v1, ContractName:Plans/Project_Output_Artifacts.md"
owner_hints:
  - "Plans/Project_Output_Artifacts.md"
```

### POA-042 - Quickstart Validation Rules

```yaml
plan_unit_id: POA-042
unit_type: requirement
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  If quickstart.md is present, validators enforce file size, executable command count, verbatim command membership in acceptance_manifest, and absence of commands not present in the manifest command set.
gui_related: false
gui_classification_reason: This unit defines validation rules for a derived convenience file rather than visual presentation.
split_recommended: false
depends_on:
  - "POA-041"
unblocks: []
acceptance_criteria:
  - "Quickstart Validation Rules remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: quickstart_validation_drift
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0046
preserved_exact_tokens:
  - "<= 16384 bytes"
  - "<= 20"
  - "nodes[].checks[].commands[].cmd"
  - "no command appears that is absent from the manifest command set"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: SchemaID:pm.acceptance_manifest.schema.v1, ContractName:Plans/Project_Output_Artifacts.md"
owner_hints:
  - "Plans/Project_Output_Artifacts.md"
```

### POA-043 - Change Summary Source-Lineage Map

```yaml
plan_unit_id: POA-043
unit_type: source_lineage_disposition
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  The change summary is source-lineage coverage only: it records historical additions for document packaging, traceability outputs, validation sweep hardening, validation_pass_report typing, sharded-only plan graph, noncanonical monolithic export, Project Plan Package SSOT replacement, seglog persistence, DRY contract references, and schema terminology alignment without overriding implementation-facing PlanUnits.
gui_related: false
gui_classification_reason: This unit preserves source lineage, runtime evidence, or validation artifact lineage rather than GUI implementation or visual presentation.
split_recommended: false
depends_on:
  - "POA-011"
  - "POA-018"
  - "POA-024"
  - "POA-032"
  - "POA-038"
  - "POA-042"
unblocks: []
acceptance_criteria:
  - "Change Summary Source-Lineage Map remains addressable as a fine-grained Project Output Artifacts PlanUnit or disposition."
  - "ContractRefs, anchors, exact tokens, negative constraints, owner/consumer boundaries, and source lineage remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: source_lineage_changelog_drift
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: source_lineage_disposition
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0047
preserved_exact_tokens:
  - ".docset/"
  - "pointer stub"
  - "requirements_quality_report.json"
  - "pm.requirements_quality_report.schema.v1"
  - "orphaned_node_requirement_refs[].reason"
  - "uncovered_acceptance[]"
  - "single Auditor validation loop"
  - "model_roles.auditor.*"
  - "unresolved_findings[]"
  - "validation_pass_report"
  - "sharded-only"
  - ".puppet-master/project/plan_graph/index.json"
  - "plan_graph/exports/plan_graph.monolithic.json"
  - "optional, non-canonical"
  - ".puppet-master/project/**"
  - "seglog"
  - "ProjectContract:*"
negative_constraints:
  - "This changelog/source-lineage coverage must not override implementation-facing POA-002 through POA-042."
preserved_contractrefs:
  - "Cross-ref: Plans/Document_Packaging_Policy.md §7"
  - "ContractRefs: SchemaID:pm.requirements_coverage.schema.v1, SchemaID:pm.project-plan-node.v1, SchemaID:pm.acceptance_manifest.schema.v1, Gate:GATE-011"
owner_hints:
  - "Plans/Project_Output_Artifacts.md"
```

### POA-044 - Runtime Evidence Projection Consumer Boundary

```yaml
plan_unit_id: POA-044
unit_type: constraint
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  Runtime evidence projections remain downstream consumers of the storage-owned receipt packet.
gui_related: false
gui_classification_reason: This unit preserves source lineage, runtime evidence, or validation artifact lineage rather than GUI implementation or visual presentation.
split_recommended: false
depends_on:
  - "POA-006"
  - "POA-024"
unblocks: []
acceptance_criteria:
  - "Runtime Evidence Projection Consumer Boundary remains addressable as a fine-grained Project Output Artifacts PlanUnit or disposition."
  - "ContractRefs, anchors, exact tokens, negative constraints, owner/consumer boundaries, and source lineage remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: runtime_evidence_projection_boundary_drift
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0048
preserved_exact_tokens:
  - "Runtime Evidence and Degradation Artifact Addendum (2026-03-08)"
  - "Runtime evidence projections"
  - "downstream consumers"
  - "storage-owned receipt packet"
negative_constraints: []
preserved_contractrefs: []
owner_hints:
  - "Plans/Project_Output_Artifacts.md"
  - "Plans/storage-plan.md"
```

### POA-045 - Validation Artifact Lineage Required Fields

```yaml
plan_unit_id: POA-045
unit_type: requirement
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  Validation artifact lineage requires auditor_cycle_report, workflow_run_id, pass_verdict, phase_plan_ref, requirements_quality_report_ref, and any legacy validation_pass_report mirror to carry compatibility_only true plus cycle_report_ref; validation lineage stays concrete and inspectable, and report records remain upstream artifacts rather than local replacement identifiers.
gui_related: false
gui_classification_reason: This unit preserves source lineage, runtime evidence, or validation artifact lineage rather than GUI implementation or visual presentation.
split_recommended: false
depends_on:
  - "POA-029"
  - "POA-031"
  - "POA-038"
unblocks: []
acceptance_criteria:
  - "Validation Artifact Lineage Required Fields remains addressable as a fine-grained Project Output Artifacts PlanUnit or disposition."
  - "ContractRefs, anchors, exact tokens, negative constraints, owner/consumer boundaries, and source lineage remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: validation_artifact_lineage_drift
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0049
preserved_exact_tokens:
  - "validation_pass_report"
  - "workflow_run_id"
  - "pass_verdict"
  - "phase_plan_ref"
  - "requirements_quality_report_ref"
  - "Validation lineage stays concrete and inspectable."
  - "Pass reports remain upstream artifacts rather than local replacement identifiers."
negative_constraints: []
preserved_contractrefs: []
owner_hints:
  - "Plans/Project_Output_Artifacts.md"
```

### POA-001 - Project Output Artifacts Retired Source-Preserving Bridge

```yaml
plan_unit_id: POA-001
unit_type: compatibility_disposition
status: retired
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  POA-001 is retired to migration-lineage-only compatibility disposition after Phase 2B batch 152. Project_Output_Artifacts-S0001 through Project_Output_Artifacts-S0046 are covered by POA-002 through POA-042, Project_Output_Artifacts-S0047 through Project_Output_Artifacts-S0049 are covered by POA-043 through POA-045, S0050/S0051/S0053 are generated structural/audit dispositions, and S0052 is retired bridge lineage. POA-001 must not re-own or override implementation-facing PlanUnits and must not use source_preserving_planunit compile mode.
gui_related: false
gui_classification_reason: The live retired bridge is migration/audit metadata only; historical GUI-related bridge tokens remain preserved by span_map and coverage_map.
split_recommended: false
depends_on:
  - "POA-002"
  - "POA-003"
  - "POA-004"
  - "POA-005"
  - "POA-006"
  - "POA-007"
  - "POA-008"
  - "POA-009"
  - "POA-010"
  - "POA-011"
  - "POA-012"
  - "POA-013"
  - "POA-014"
  - "POA-015"
  - "POA-016"
  - "POA-017"
  - "POA-018"
  - "POA-019"
  - "POA-020"
  - "POA-021"
  - "POA-022"
  - "POA-023"
  - "POA-024"
  - "POA-025"
  - "POA-026"
  - "POA-027"
  - "POA-028"
  - "POA-029"
  - "POA-030"
  - "POA-031"
  - "POA-032"
  - "POA-033"
  - "POA-034"
  - "POA-035"
  - "POA-036"
  - "POA-037"
  - "POA-038"
  - "POA-039"
  - "POA-040"
  - "POA-041"
  - "POA-042"
  - "POA-043"
  - "POA-044"
  - "POA-045"
unblocks: []
acceptance_criteria:
  - "POA-001 does not override POA-002 through POA-045 for Project_Output_Artifacts-S0001 through Project_Output_Artifacts-S0049."
  - "Generated Owner / Consumer Map, PlanUnits heading, retired bridge, and Migration Coverage spans remain available for exact-text audit."
  - "Plans/Project_Output_Artifacts.md has no residual source_preserving_planunit product coverage after this bridge retirement."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this disposition."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: residual_bridge_overreach
reasoning_tier: standard
context_scope: project_output_artifacts_residual_bridge
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: retired_source_preserving_bridge
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0052
preserved_exact_tokens:
  - "POA-001"
  - "Project Output Artifacts Residual Source-Preserving Bridge"
  - "Project Output Artifacts Retired Source-Preserving Bridge"
  - "source_preserving_planunit"
  - "retired_source_preserving_bridge"
  - "source_preserving_bridge_retired"
  - "Owner / Consumer Map"
  - "PlanUnits"
  - "Migration Coverage"
  - "POA-002"
  - "POA-045"
  - "Project_Output_Artifacts-S0052"
negative_constraints:
  - "POA-001 must not be used as implementation-ready product coverage for spans now mapped to POA-002 through POA-045."
  - "Do not remap Project_Output_Artifacts-S0001 through Project_Output_Artifacts-S0049 product coverage back to POA-001."
  - "POA-001 must not re-enter source_preserving_planunit mode after phase2b-152."
owner_hints:
  - "Plans/Project_Output_Artifacts.md"
```
