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

This source-preserving standardization keeps the owner and consumer boundaries stated in the original document body. During this batch, `Plans/chain-wizard.md` remains the owner doc for the behavior described by its preserved sections, while cross-doc ownership follows the ContractRefs and boundary notes already present in the original text.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md

## PlanUnits

### CW-001 - Chain Wizard -- Plan Source-Preserving PlanUnit

```yaml
plan_unit_id: CW-001
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard.md
canonical_text: Plans/chain-wizard.md keeps its pre-migration canonical source content losslessly in place while exposing a source-preserving PlanUnit for Plan Document System indexing. Fine-grained requirement splitting may occur in a later controlled batch using the recorded span_map and coverage_map.
gui_related: true
gui_classification_reason: The preserved source spans include GUI/UI/user-visible presentation or interactive control requirements.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- Original source spans remain available for exact-text audit.
- Every original span for this doc has one coverage_map disposition.
- ContractRefs, anchors or aliases, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage are preserved by span_map and coverage_map.
- No WorkNodes, NodeSeeds, or executable build tasks are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-001-standardize-plans
- python3 scripts/pm-plans-verify.py run-gates
- python3 scripts/pm-shard-plans.py --check
risk_class: source_preservation
reasoning_tier: standard
context_scope: single_plan_doc
implementation_surfaces:
- Plans/chain-wizard.md
node_compile_hint:
  mode: source_preserving_planunit
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-S0001
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-S0002
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-S0003
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-S0004
preserved_exact_tokens:
- Chain Wizard -- Plan
- Wizard and launched-run lineage reconciliation
- Required data shape
- Wizard Route, Attention, and Worktree Lineage
negative_constraints:
- Wizard, interview, and worktree lineage must preserve the exact seams that launch execution. `interview-subagent-integration.md`, `interview-subagent-integration`, `chain-wizard-flexibility.md`, `chain-wizard-flexibility`, `GitHub_Integration.md`, `GitHub_Integration`, `WorktreeGitImprovement.md`, `
- Wizard resume uses `target_kind = primary_view`, `project_id = <project_id>`, `object_kind = wizard`, `object_id = <wizard_id>`, `thread_id = <thread_id>`, `object_id`, `target_kind`, `object_kind`, and `resume_url` for the narrow step anchor. Wizard, builder, and interview remain conversational `/d
- Wizard resume detail is identity-first, not URL-first. `object_kind = wizard` and `object_id = <wizard_id>` identify the wizard object; `/clarification` focus, step focus, and other `domain-local` anchors travel as serialized `deep-link` detail or `URL` transport only after the base `object_id` / `w
compatibility_only_notes: []
stale_retired_dispositions:
- Wizard, interview, and worktree lineage must preserve the exact seams that launch execution. `interview-subagent-integration.md`, `interview-subagent-integration`, `chain-wizard-flexibility.md`, `chain-wizard-flexibility`, `GitHub_Integration.md`, `GitHub_Integration`, `WorktreeGitImprovement.md`, `
owner_boundary_notes:
- Wizard, interview, and worktree lineage must preserve the exact seams that launch execution. `interview-subagent-integration.md`, `interview-subagent-integration`, `chain-wizard-flexibility.md`, `chain-wizard-flexibility`, `GitHub_Integration.md`, `GitHub_Integration`, `WorktreeGitImprovement.md`, `
- '`Plans/chain-wizard-flexibility.md` and `/chain-wizard-flexibility.md` are the Wizard / Project Creation owner for the modular Contract Pack direction; monolithic wizard state cannot be the long-term handoff shape. A surface-focus route targets a specific page `/tab/inspector` with context: Usage wi'
owner_hints:
- Plans/chain-wizard.md
split_recommendation_reason: The doc-level source-preserving unit covers both GUI-related and non-GUI spans; future fine-grained PlanUnits should split those surfaces when safe.
```

## Migration Coverage

Original hash: `ecf1df1271c635a49f58d6d94f99144eca042acd5f61d3aa7178cbfdfbf77921`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/anchor_aliases.json`

All original spans from `chain-wizard-S0001` through `chain-wizard-S0004` are preserved in place and mapped in `coverage_map.jsonl` to `CW-001`. This batch did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, or executable build tasks.

