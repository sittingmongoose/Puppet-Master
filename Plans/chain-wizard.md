# Chain Wizard -- Plan


## Wizard and launched-run lineage reconciliation


### Required data shape
- The wizard → execution handoff MUST include `project_id`, `thread_id`, `wizard_id`, and `run_id` for the child run.
- Lineage tracing MUST preserve the wizard → run bridge so review and resume surfaces can navigate back to the planning phase.
- The handoff packet MUST carry requested/effective runtime identity and `execution_role` so child-run policy is aligned with wizard context.
- When a wizard-launched run includes web/provider research output, the handoff summary MUST preserve `provider_fallback_summary` when a fallback chain was triggered and `source_count` as the number of sources returned.

## Wizard Route, Attention, and Worktree Lineage

Wizard, interview, and worktree lineage must preserve the exact seams that launch execution. `interview-subagent-integration.md`, `interview-subagent-integration`, `chain-wizard-flexibility.md`, `chain-wizard-flexibility`, `GitHub_Integration.md`, `GitHub_Integration`, `WorktreeGitImprovement.md`, `storage-plan`, and storage-plan references remain adjacent owners for shared-runtime, git-hook, pseudo-tier, `/filesystem`, pre-run, `/account`, `tier_id`, `thread_id`, `project_id`, `worktree_id`, `base_branch`, and first-class worktree identity. The stale `interview-phase-phase` / `interview-phase-phase-*` routing bug must not survive in canonical wizard-launch keys.

`Plans/chain-wizard-flexibility.md` and `/chain-wizard-flexibility.md` are the Wizard / Project Creation owner for the modular Contract Pack direction; monolithic wizard state cannot be the long-term handoff shape. A surface-focus route targets a specific page `/tab/inspector` with context: Usage with `usage_event_ref`, Ledger with event identity, Orchestrator with `focused_run_id`, selected node `/attempt`, tab, and inspector target, and wizard resume through `wizard_id + step`.

Attention routing is not thread-local or wizard-local. `Plans/FinalGUISpec.md`, `Plans/assistant-chat-design.md`, `Plans/chain-wizard-flexibility.md`, `/FinalGUISpec.md`, `/assistant-chat-design.md`, and `/chain-wizard-flexibility.md` must route Dashboard -> Orchestrator -> chat-thread for blocked-thread and major-decision paths when needed. `Plans/storage-plan.md` and `/storage-plan.md` keep `resume_url` as serialized transport for blocked-thread and wizard projections.

Attention-surface target fields restore destination surface, `project_id`, `thread_id`, `focused_run_id`, `wizard_id`, `wizard_step`, `message_id`, selected object, and inspector context. Conversational planning target classes include `thread`, `message`, `wizard`, and `usage_event`. `primary_view` values include Dashboard, Projects, Wizard, Interview, Settings, Usage, FileEditor, and Orchestrator.

Wizard resume uses `target_kind = primary_view`, `project_id = <project_id>`, `object_kind = wizard`, `object_id = <wizard_id>`, `thread_id = <thread_id>`, `object_id`, `target_kind`, `object_kind`, and `resume_url` for the narrow step anchor. Wizard, builder, and interview remain conversational `/document-production` actors, not orchestration nodes `/packages/seams`, but their handoff payloads carry enough identity and lineage for runtime, history, ledger, search, and audit. `Resume Wizard` overrides to the wizard surface and the correct wizard `/step` context and must not preserve unrelated current primary-view context.

Wizard resume detail is identity-first, not URL-first. `object_kind = wizard` and `object_id = <wizard_id>` identify the wizard object; `/clarification` focus, step focus, and other `domain-local` anchors travel as serialized `deep-link` detail or `URL` transport only after the base `object_id` / `wizard_id` identity is known. The current wizard URL shape remains useful, but it must not stand alone as the app's only precise `deep-link` contract.

In-app navigation must use one route-object model across file opens, wizard resumes, Usage `/artifact` pivots, and runtime CTAs. Chain wizard consumers should not invent separate `in-app` `deep-link` contracts for each surface just because the wizard path is currently the clearest example; the shared model is otherwise under-specified.

## Owner / Consumer Map

`Plans/chain-wizard.md` is retained as historical/source-lineage compatibility for legacy wizard-launch and route examples. Current PRD intake and planning authority routes to `Plans/PRD_Builder.md` and `Plans/Planning_Wizard.md`; current GUI, command, PlanCompile, Executor, and Orchestrator behavior routes through their named owner docs. Preserved legacy details in this file are consumer inputs and must be revalidated through current owners before implementation.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md

## PlanUnits

### CW-001 - Chain Wizard -- Plan Source-Preserving Bridge Retired

```yaml
plan_unit_id: CW-001
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/chain-wizard.md
canonical_text: >-
  The former doc-level source-preserving bridge is retired in place after Phase
  2B atomized chain-wizard-S0001 through chain-wizard-S0004 into CW-002 through
  CW-007. CW-001 remains only as migration lineage for the retired bridge span
  and must not re-own atomized source coverage.
gui_related: false
gui_classification_reason: The retired bridge is migration lineage and no longer owns GUI or product behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- CW-001 no longer uses the source-preserving PlanUnit compile hint.
- Prior source coverage remains carried by CW-002 through CW-007.
- The retired bridge does not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
- Coverage for the retired bridge is recorded in the Phase 2B batch 023 coverage map.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: migration_lineage
reasoning_tier: standard
context_scope: plan_standardization
implementation_surfaces:
- Plans/chain-wizard.md
node_compile_hint:
  mode: source_preserving_bridge_retired
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-S0007
preserved_exact_tokens:
- CW-001
- source_preserving_planunit
- CW-002
- CW-007
negative_constraints:
- "Do not remap atomized chain-wizard spans back to CW-001."
- "Do not treat the retired bridge as implementation-ready product coverage."
- "Do not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks from this migration-lineage unit."
compatibility_only_notes:
- "The old source-preserving bridge is retained only so migration lineage and historical references to CW-001 remain auditable."
owner_hints:
- Plans/chain-wizard.md
```

### CW-002 - Wizard Launched-Run Handoff Identity

```yaml
plan_unit_id: CW-002
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard.md
canonical_text: >-
  Wizard-launched execution handoffs include project, thread, wizard, and child
  run identity, preserve the wizard-to-run bridge for review/resume, carry
  requested/effective runtime identity and execution_role, and preserve provider
  fallback summary plus source count for fallback research output.
gui_related: false
gui_classification_reason: Handoff identity and launched-run lineage are backend runtime contract behavior.
split_recommended: false
depends_on: []
unblocks: [CW-003, CW-004, CW-005, CW-006]
acceptance_criteria:
  - The wizard to execution handoff includes project_id, thread_id, wizard_id, and run_id for the child run.
  - Lineage tracing preserves the wizard to run bridge so review and resume surfaces can navigate back to planning.
  - The handoff packet carries requested/effective runtime identity.
  - The handoff packet carries execution_role.
  - Web/provider research fallback output preserves provider_fallback_summary and source_count when fallback chain was triggered.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: launched_run_lineage_drift
reasoning_tier: high
context_scope: chain_wizard_handoff
implementation_surfaces:
  - Plans/chain-wizard.md
node_compile_hint:
  mode: chain_wizard_launched_run_handoff_identity
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-S0001
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-S0002
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-S0003
preserved_exact_tokens:
  - "Chain Wizard -- Plan"
  - "Wizard and launched-run lineage reconciliation"
  - "Required data shape"
  - "project_id"
  - "thread_id"
  - "wizard_id"
  - "run_id"
  - "provider_fallback_summary"
  - "source_count"
negative_constraints: []
owner_hints:
  - Plans/chain-wizard.md
```

### CW-003 - Wizard Interview Worktree Launch Seam Identity

```yaml
plan_unit_id: CW-003
unit_type: constraint
status: accepted
owner_doc: Plans/chain-wizard.md
canonical_text: >-
  Wizard, interview, and worktree lineage preserves the exact launch seams and
  adjacent owner references for shared-runtime, git-hook, pseudo-tier,
  filesystem, pre-run, account, tier, thread, project, worktree, and branch
  identity.
gui_related: false
gui_classification_reason: Launch seam identity and adjacent owner references are backend/runtime boundary semantics.
split_recommended: true
split_recommendation_reason: Source span S0004 mixes backend launch seams with GUI route and attention routing requirements.
depends_on: [CW-002]
unblocks: [CW-004, CW-005, CW-006, CW-007]
acceptance_criteria:
  - Adjacent owners include interview-subagent-integration.md, chain-wizard-flexibility.md, GitHub_Integration.md, WorktreeGitImprovement.md, and storage-plan.
  - Shared launch identity preserves tier_id, thread_id, project_id, worktree_id, base_branch, first-class worktree identity, /filesystem, pre-run, and /account.
  - The stale interview-phase-phase and interview-phase-phase-* routing bug does not survive in canonical wizard-launch keys.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: launch_seam_identity_drift
reasoning_tier: high
context_scope: chain_wizard_routes
implementation_surfaces:
  - Plans/chain-wizard.md
  - Plans/interview-subagent-integration.md
  - Plans/chain-wizard-flexibility.md
  - Plans/GitHub_Integration.md
  - Plans/WorktreeGitImprovement.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: chain_wizard_interview_worktree_launch_seam_identity
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-S0004
preserved_exact_tokens:
  - "interview-subagent-integration.md"
  - "chain-wizard-flexibility.md"
  - "GitHub_Integration.md"
  - "WorktreeGitImprovement.md"
  - "tier_id"
  - "worktree_id"
  - "base_branch"
  - "interview-phase-phase"
negative_constraints:
  - "The stale interview-phase-phase / interview-phase-phase-* routing bug must not survive in canonical wizard-launch keys."
owner_hints:
  - Plans/chain-wizard.md
  - Plans/chain-wizard-flexibility.md
```

### CW-004 - Modular Contract Pack Surface Focus Route

```yaml
plan_unit_id: CW-004
unit_type: constraint
status: accepted
owner_doc: Plans/chain-wizard.md
canonical_text: >-
  Chain Wizard routes preserve chain-wizard-flexibility as Wizard / Project
  Creation owner for modular Contract Pack direction and use surface-focus route
  context for Usage, Ledger, Orchestrator, node attempts, inspector targets, and
  wizard resume.
gui_related: true
gui_classification_reason: Surface-focus route context targets visible app pages, tabs, inspectors, and wizard resume.
split_recommended: true
split_recommendation_reason: Source span S0004 mixes owner boundary, route targeting, attention routing, and route-object model.
depends_on: [CW-002, CW-003]
unblocks: [CW-005, CW-006, CW-007]
acceptance_criteria:
  - Plans/chain-wizard-flexibility.md and /chain-wizard-flexibility.md remain Wizard / Project Creation owner for modular Contract Pack direction.
  - Monolithic wizard state is not the long-term handoff shape.
  - Surface-focus routes can target page /tab/inspector with Usage usage_event_ref, Ledger event identity, Orchestrator focused_run_id, selected node /attempt, tab, inspector target, and wizard_id + step.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: modular_contract_route_drift
reasoning_tier: high
context_scope: chain_wizard_routes
implementation_surfaces:
  - Plans/chain-wizard.md
  - Plans/chain-wizard-flexibility.md
node_compile_hint:
  mode: chain_wizard_modular_contract_pack_surface_focus_route
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-S0004
preserved_exact_tokens:
  - "modular Contract Pack"
  - "monolithic wizard state"
  - "/tab/inspector"
  - "usage_event_ref"
  - "focused_run_id"
  - "wizard_id + step"
negative_constraints:
  - "Monolithic wizard state cannot be the long-term handoff shape."
owner_hints:
  - Plans/chain-wizard.md
  - Plans/chain-wizard-flexibility.md
```

### CW-005 - Cross-Surface Attention Routing Target Shape

```yaml
plan_unit_id: CW-005
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard.md
canonical_text: >-
  Attention routing is shared across Dashboard, Orchestrator, chat thread,
  storage projection, and conversational planning target classes, restoring the
  destination surface and relevant project, thread, run, wizard, message, object,
  and inspector context.
gui_related: true
gui_classification_reason: Attention routes drive visible Dashboard, Orchestrator, chat-thread, and primary-view navigation.
split_recommended: true
split_recommendation_reason: Source span S0004 mixes attention routing with wizard resume and route-object model requirements.
depends_on: [CW-002, CW-004]
unblocks: [CW-006, CW-007]
acceptance_criteria:
  - Attention routing is not thread-local or wizard-local.
  - Dashboard can route to Orchestrator and chat-thread for blocked-thread and major-decision paths when needed.
  - storage-plan keeps resume_url as serialized transport for blocked-thread and wizard projections.
  - Attention target fields restore destination surface, project_id, thread_id, focused_run_id, wizard_id, wizard_step, message_id, selected object, and inspector context.
  - Conversational planning target classes include thread, message, wizard, and usage_event.
  - primary_view values include Dashboard, Projects, Wizard, Interview, Settings, Usage, FileEditor, and Orchestrator.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: attention_route_target_drift
reasoning_tier: high
context_scope: chain_wizard_routes
implementation_surfaces:
  - Plans/chain-wizard.md
  - Plans/FinalGUISpec.md
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: chain_wizard_cross_surface_attention_routing_target_shape
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-S0004
preserved_exact_tokens:
  - "Dashboard -> Orchestrator -> chat-thread"
  - "blocked-thread"
  - "major-decision paths"
  - "resume_url"
  - "primary_view"
negative_constraints:
  - "Attention routing is not thread-local or wizard-local."
owner_hints:
  - Plans/chain-wizard.md
  - Plans/FinalGUISpec.md
```

### CW-006 - Wizard Resume Identity-First Deep-Link Contract

```yaml
plan_unit_id: CW-006
unit_type: constraint
status: accepted
owner_doc: Plans/chain-wizard.md
canonical_text: >-
  Wizard resume is identity-first and uses primary-view route objects with
  wizard object identity before serialized deep-link or URL detail, while
  keeping wizard, builder, and interview as conversational document-production
  actors rather than orchestration nodes.
gui_related: true
gui_classification_reason: Resume Wizard and step/clarification focus are visible navigation behavior.
split_recommended: true
split_recommendation_reason: Source span S0004 mixes wizard resume identity with broader route-object model.
depends_on: [CW-002, CW-005]
unblocks: [CW-007]
acceptance_criteria:
  - Wizard resume uses target_kind = primary_view and project_id = <project_id>.
  - Wizard resume uses object_kind = wizard and object_id = <wizard_id>.
  - Wizard resume uses thread_id = <thread_id> and resume_url for narrow step anchor.
  - Wizard, builder, and interview remain conversational /document-production actors, not orchestration nodes /packages/seams.
  - Resume Wizard overrides to the wizard surface and correct wizard /step context without preserving unrelated current primary-view context.
  - Deep-link or URL detail travels only after object_id / wizard_id identity is known.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: wizard_resume_deeplink_drift
reasoning_tier: high
context_scope: chain_wizard_routes
implementation_surfaces:
  - Plans/chain-wizard.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: chain_wizard_resume_identity_first_deeplink_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-S0004
preserved_exact_tokens:
  - "target_kind = primary_view"
  - "object_kind = wizard"
  - "object_id = <wizard_id>"
  - "Resume Wizard"
  - "/document-production"
  - "/packages/seams"
  - "/clarification"
negative_constraints:
  - "Wizard resume detail is identity-first, not URL-first."
  - "Wizard, builder, and interview remain conversational /document-production actors, not orchestration nodes /packages/seams."
owner_hints:
  - Plans/chain-wizard.md
  - Plans/FinalGUISpec.md
```

### CW-007 - Shared In-App Route Object Model

```yaml
plan_unit_id: CW-007
unit_type: constraint
status: accepted
owner_doc: Plans/chain-wizard.md
canonical_text: >-
  In-app navigation uses one route-object model across file opens, wizard
  resumes, Usage artifact pivots, and runtime CTAs; chain wizard consumers do
  not invent separate in-app deep-link contracts per surface.
gui_related: true
gui_classification_reason: Shared route objects drive visible navigation across files, wizard, Usage, and runtime CTA surfaces.
split_recommended: false
depends_on: [CW-004, CW-005, CW-006]
unblocks: []
acceptance_criteria:
  - File opens use the shared route-object model.
  - Wizard resumes use the shared route-object model.
  - Usage /artifact pivots use the shared route-object model.
  - Runtime CTAs use the shared route-object model.
  - Chain wizard consumers do not invent separate in-app deep-link contracts for each surface.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: route_object_model_fragmentation
reasoning_tier: high
context_scope: chain_wizard_routes
implementation_surfaces:
  - Plans/chain-wizard.md
  - Plans/FinalGUISpec.md
  - Plans/usage-feature.md
node_compile_hint:
  mode: chain_wizard_shared_in_app_route_object_model
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-S0004
preserved_exact_tokens:
  - "route-object model"
  - "Usage `/artifact` pivots"
  - "runtime CTAs"
  - "in-app"
  - "deep-link"
negative_constraints:
  - "Chain wizard consumers should not invent separate in-app deep-link contracts for each surface."
owner_hints:
  - Plans/chain-wizard.md
  - Plans/FinalGUISpec.md
```

## Migration Coverage

Original hash: `ecf1df1271c635a49f58d6d94f99144eca042acd5f61d3aa7178cbfdfbf77921`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/anchor_aliases.json`

Phase 2B atomized `chain-wizard-S0001` through `chain-wizard-S0004` into fine-grained PlanUnits `CW-002` through `CW-007`. `CW-001` is retained only as a retired migration-lineage bridge and must not re-own atomized source coverage. This phase did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, or executable build tasks.

## Ledger Compile Addendum - pldg-20260616-002

### CW-008 - Legacy Builder Invisible Goal Handoff Pointer

```yaml
plan_unit_id: CW-008
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard.md
canonical_text: >-
  Legacy builder entry points that carried Chain Wizard, Plan Wizard, or Requirements Doc Builder labels are compatibility/source-lineage aliases only. Current product flows route users to PRD Builder and Planning Wizard conversational v2 ledger capture before any invisible Goal conversion. When the accepted ledger is ready, the Planning Wizard handoff points to Goal Runtime for invisible ledger-to-requirements-docs, ledger-to-Plans, plans-to-work-graphs, or conversion-audit work, and routes any plans-to-work-graphs or work-graph preparation artifact boundary through Plan_To_Node_Compilation/PNC-009; it does not create default Orchestrator WorkNodes or bypass ledger source preservation.
gui_related: true
gui_classification_reason: This unit defines visible legacy compatibility entry and handoff behavior for PRD Builder and Planning Wizard flows.
depends_on:
  - CW-007
  - GRS-003
  - PNC-009
unblocks: []
acceptance_criteria:
  - Legacy wizard or builder labels redirect to PRD Builder and Planning Wizard rather than remaining active product names.
  - PRD Builder or Planning Wizard entry can start conversational v2 ledger capture.
  - Invisible conversion handoff occurs only after the ledger is accepted and ready.
  - Handoffs preserve ledger source refs and conversion-audit lineage.
  - plans-to-work-graphs handoffs route through the Plan_To_Node_Compilation compiler boundary.
  - Wizard handoff does not create default Orchestrator WorkNodes.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future legacy builder compatibility handoff review
risk_class: legacy_builder_handoff_drift
reasoning_tier: standard
context_scope: legacy_builder_compatibility_handoff
implementation_surfaces:
  - Plans/chain-wizard.md
  - Plans/chain-wizard-flexibility.md
  - Plans/Goal_Runtime_System.md
  - Plans/Plan_To_Node_Compilation.md
node_compile_hint:
  mode: legacy_builder_compatibility_handoff
  create_worknodes: false
source_lineage:
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0004
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0007
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0103
  - pldg-20260616-002-orchestrator-goal-runtime-flow:dec-0028
preserved_exact_tokens:
  - "ledger to plans"
  - "plans to work graphs"
  - "work-graph preparation artifacts"
  - "Plan_To_Node_Compilation"
  - "auditing those conversions"
  - "chain wizard"
  - "doc builder"
  - "Requirements Doc Builder"
  - "invisible Goal Mode"
compatibility_only_notes:
  - "'Chain Wizard', 'Plan Wizard', and 'Requirements Doc Builder' are retained in this PlanUnit only as legacy compatibility/source-lineage labels that redirect to PRD Builder and Planning Wizard."
stale_retired_dispositions:
  - Chain Wizard and Plan Wizard are retired current-product names.
  - Requirements Doc Builder is the former product label now named PRD Builder.
negative_constraints:
  - Do not use Chain Wizard, Plan Wizard, or Requirements Doc Builder as active current-product names.
  - Do not bypass ledger preservation or conversion audit.
  - Do not treat invisible conversion handoff as a default Orchestrator WorkNode.
owner_hints:
  - Plans/chain-wizard.md
  - Plans/chain-wizard-flexibility.md
  - Plans/Goal_Runtime_System.md
  - Plans/Plan_To_Node_Compilation.md
```


## Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260618-001-prd-planning-wizard` into this existing owner or consumer doc. It does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### CW-009 - Planning Wizard Compatibility Redirect

```yaml
plan_unit_id: CW-009
unit_type: constraint
status: accepted
owner_doc: Plans/chain-wizard.md
canonical_text: 'The canonical product name is Planning Wizard; Chain Wizard and Plan Wizard are stale names that must be retired from active product prose, UI, commands, events, and contracts. Plans/chain-wizard.md and Plans/chain-wizard-flexibility.md are legacy compatibility/source-lineage consumers for material now owned by PRD Builder, Planning Wizard, Final GUI, and downstream PlanCompile/Executor owners. PMConcept and FinalGUISpec replace the old fixed Project Setup through Start Chain sequence with PRD Builder intake, dynamic Planning Run topics, live topic and plan projections, audits, Approve And Build, and Orchestrator Plan Compile navigation.'
gui_related: true
gui_classification_reason: Includes user-visible GUI/workspace/command/projection behavior.
depends_on: []
unblocks: []
acceptance_criteria:
- The live owner doc preserves every source atom listed in source_atom_ids without treating the ledger as canonical product prose.
- Exact tokens, negative constraints, owner hints, and accepted corrections remain available to future audits through this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard
risk_class: owner_drift
reasoning_tier: standard
context_scope: ledger_to_plans_compile
implementation_surfaces:
- Plans/chain-wizard.md
- Plans/Planning_Wizard.md
- Plans/FinalGUISpec.md
- Plans/00-plans-index.md
- Plans/PRD_Builder.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0002
- pldg-20260618-001-prd-planning-wizard:atom-0159
- pldg-20260618-001-prd-planning-wizard:atom-0156
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/01-naming-and-boundaries.md#SRC-NAMING
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/10-doc-and-contract-impact.md#SRC-IMPACT
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/08-gui-threads-and-navigation.md#SRC-GUI
source_atom_ids:
- atom-0002
- atom-0159
- atom-0156
decision_refs:
- dec-0001
- dec-0029
correction_refs:
- corr-0002
preserved_exact_tokens:
- Planning Wizard
- Chain Wizard
- Plan Wizard
- Plans/chain-wizard.md
- Plans/chain-wizard-flexibility.md
- Start Chain
- Approve And Build
negative_constraints:
- Do not use Chain Wizard or Plan Wizard as current terminology.
- Do not perform a blind filename or term replacement that preserves obsolete ownership and workflow.
- Do not retain the old nine-step linear wizard as canonical UX.
compatibility_only_notes:
- Chain Wizard, Plan Wizard, Requirements Doc Builder, Run Chain Wizard later, and Start Chain are retained only for historical migration, source-lineage, and search compatibility.
- Current product prose must use PRD Builder, Planning Wizard, Approve PRD for Planning Wizard, and Approve And Build.
- Still-valid legacy details in this doc are consumer/source-lineage inputs and must route through current owner docs before implementation.
stale_retired_dispositions:
- Active Chain Wizard and Plan Wizard ownership is retired.
- The old fixed Project Setup through Start Chain sequence is retired as canonical UX.
- Current UX is PRD Builder intake -> dynamic PlanningRun topics -> live topic/plan projections -> audits/final integration -> Approve And Build -> Orchestrator Plan Compile.
owner_hints:
- Plans/Planning_Wizard.md
- Plans/FinalGUISpec.md
- Plans/00-plans-index.md
- Plans/PRD_Builder.md
- Concepts/PMConcept.html
```
