# Shard 017: PlanUnits

Source: `Plans/Project_Output_Artifacts.md`

Source lines: L794-L952

Source SHA256: `d3f7e2668f37e40cac8a8cdf7a48f9754e63b681bcccae8b141fbdac09917c12`

---

## PlanUnits

### POA-001 - Puppet Master — User-Project Project Plan Package Outputs (SSOT) Source-Preserving PlanUnit

```yaml
plan_unit_id: POA-001
unit_type: requirement
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: Plans/Project_Output_Artifacts.md keeps its pre-migration canonical source content losslessly in place while exposing a source-preserving PlanUnit for Plan Document System indexing. Fine-grained requirement splitting may occur in a later controlled batch using the recorded span_map and coverage_map.
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
- Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: source_preserving_planunit
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0001
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0002
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0003
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0004
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0005
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0006
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0007
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0008
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0009
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0010
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0011
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0012
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0013
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0014
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0015
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0016
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0017
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0018
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0019
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0020
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0021
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0022
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0023
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0024
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0025
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0026
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0027
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0028
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0029
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0030
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0031
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0032
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0033
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0034
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0035
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0036
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0037
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0038
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0039
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0040
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0041
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0042
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0043
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0044
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0045
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0046
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0047
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0048
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0049
preserved_exact_tokens:
- Puppet Master — User-Project Project Plan Package Outputs (SSOT)
- 0. Scope (normative)
- Runtime Artifacts (GUI panel) — distinct from this document
- P5 project-output artifact recovery requirements
- 'ContractRef: ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/storage-plan.md'
- 1. Canonical persistence vs filesystem staging
- 'ContractRef: SchemaID:pm.project-plan-graph-index.v1, Gate:GATE-001, ContractName:Plans/Project_Output_Artifacts.md'
- 2. Required artifact set (SSOT) — Project Plan Package
- 'ContractRef: SchemaID:pm.requirements_quality_report.schema.v1, SchemaID:pm.requirements_coverage.schema.v1, Gate:GATE-011, ContractName:Plans/Project_Output_Artifacts.md'
- 2.1 Canonical staging tree
- 2.2 Non-canonical execution workspace (sidecar) — `.puppet-master/workspace/**`
- 'ContractRef: ContractName:Plans/Contracts_V0.md#AttemptJournal, ContractName:Plans/Contracts_V0.md#ParentSummary, ContractName:Plans/agent-rules-context.md#FeatureSpecVerbatim'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Project_Output_Artifacts.md'
- 'ContractRef: ContractName:Plans/Contracts_V0.md#PromotionRules, ContractName:Plans/Contracts_V0.md#AgentsMdLightEnforcement'
- 2.3 Document Set packaging for large Markdown/text artifacts
- 'ContractRef: ContractName:Plans/Document_Packaging_Policy.md, Gate:GATE-014, SchemaID:pm.project-plan-graph-index.v1'
- 'ContractRef: ContractName:Plans/Document_Packaging_Policy.md#7, Gate:GATE-014'
- Canonical persistence for packaged Document Sets
- 'ContractRef: SchemaID:pm.project-plan-graph-index.v1'
- 3. Schema alignment (critical; do not rename fields)
- 4. Contract layers (two-layer model)
- A) Platform Contracts (internal SSOT; not copied into user projects)
- B) Project Contracts (generated per user project)
- 'Required: `contracts/index.json` (Project Contract Pack index)'
negative_constraints:
- '> **Do not duplicate:** This file is the SSOT for artifact paths and sharding rules; other docs should link here instead of repeating them.'
- 'This document is the SSOT for **Project Plan Package** artifacts (user-project outputs under `.puppet-master/project/**`). A separate concept is **Runtime Artifacts**: agent-run outputs (diffs, plans, evidence, browser recordings, cost_usage, etc.) displayed in the **Artifacts panel** of the GUI. Th'
- '- `acknowledged` concerns should reduce repeat in-app surfacing, but they must not mask an active blocked state if the underlying condition still blocks progress.'
- '- Artifact and record exports preserve canonical IDs and `/refs`; they must not invent export-local shadow identity for artifacts, receipts, records, or related runtime refs.'
- '- `.puppet-master/project/quickstart.md` (deterministic command quickstart; AI correctness and validator correctness MUST NOT depend on this file)'
- '- A project MUST NOT emit only one of the two GUI artifacts.'
- '- `.puppet-master/workspace/**` remains the non-canonical execution sidecar and MUST NOT be repurposed as canonical storage.'
- Generated `.docset/**` contents are packaging outputs, not new packaging inputs; verifiers and generators MUST NOT recurse and package Document Set members again.
- '- Node shards MUST NOT repeat or inline the contract pack’s canonical specifications; use `contract_refs` instead.'
- '- MUST NOT depend on timestamps, randomness, session IDs, or nondeterministic ordering.'
- '`edges.json` MUST NOT be required for headless execution and MUST NOT override shard-local `blockers[]` readiness semantics.'
- '- It is **NOT** the canonical plan representation and MUST NOT be required for validation or orchestration.'
- '- orchestration, planning, and validator correctness MUST NOT depend on `quickstart.md`'
- '- AI correctness, planning correctness, and validator correctness MUST NOT depend on `quickstart.md`.'
- '- 2026-02-24: Marked `.puppet-master/project/plan_graph/exports/plan_graph.monolithic.json` as an **optional, non-canonical** derived export (may be generated, but must not be required; path was previously `.puppet-master/project/plan_graph.json`).'
compatibility_only_notes:
- '- event aliasing discipline applies to artifact event families: compatibility aliases may exist only as declared aliases to canonical event/artifact types, never as independent persistence identities.'
- '- Dependency semantics are canonicalized as follows: `blockers[]` is the readiness-driving dependency list, `unblocks[]` is the forward adjacency projection, `depends_on[]` is optional compatibility metadata only, and `edges.json` (if materialized) is a derived consistency artifact rather than an au'
stale_retired_dispositions:
- '- Export correctness now depends on the earlier projection-trust work. - Recommended rule: - exports derived from stale/degraded projections must either: - disclose trust state in the export/manifest - or re-query from canonical/current backing data before export'
- '- CSV `/table` exports are convenience view exports, not canonical archival exports; when built from stale or `/degraded` projections they must disclose trust state or re-query canonical backing data before export.'
owner_boundary_notes:
- '# Puppet Master — User-Project Project Plan Package Outputs (SSOT)'
- '> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.'
- 'This document is the **canonical single source of truth (SSOT)** for the user-project **Project Plan Package** outputs produced by **Puppet Master** and staged under:'
- '- **seglog canonical persistence** for these artifacts (filesystem is staging/export/cache only)'
- '- **DRY, contract-referenced plan graph** requirements (**sharded-only plan graph**; machine-runnable, headless) with an **optional, non-canonical** derived export for convenience.'
- '> **Do not duplicate:** This file is the SSOT for artifact paths and sharding rules; other docs should link here instead of repeating them.'
- 'This document is the SSOT for **Project Plan Package** artifacts (user-project outputs under `.puppet-master/project/**`). A separate concept is **Runtime Artifacts**: agent-run outputs (diffs, plans, evidence, browser recordings, cost_usage, etc.) displayed in the **Artifacts panel** of the GUI. Th'
- Optional runtime-analysis exports that summarize queue analysis, attempts, safe points, remediation, or blocked outcomes remain projections of canonical runtime data. When materialized, they MUST use canonical runtime identities (`scheduler_pass_id`, `attempt_id`, `safe_point_id`, `remediation_root_
- '- `Project_Output_Artifacts.md`, `FileManager.md`, `newtools.md`, and `assistant-memory-subsystem.md` now form a stronger artifact/event/runtime-observability gap cluster: - `validation_pass_report.pass_verdict` still conflicts with downstream `skipped` behavior. - project artifact events are under-'
- '- Artifact / persistence / lineage owner docs still have field-family holes that downstream passes kept surfacing: - `Project_Output_Artifacts.md` is now clearly under-keyed relative to the canonical EventRecord/runtime model: artifact events and validation pass reports still omit project/thread/run'
- '- Project artifact / file-management gaps continued to deepen: - `validation_pass_report` still conflicts with workflow-required `skipped`, but GPT-5.2 also pinned missing `auto_fixes_applied[]`, a Pass-1 scope contradiction around requirements creation, and unresolved `workflow_run_id` vs canonical'
- '- State the precedence rule directly in `Contracts_V0.md`. - Reject multi-selector route payloads as non-canonical.'
- '- Promote artifact/memory/live/runtime-observability records to full owner status: - align project-artifact events to EventRecord-level identity, - add missing artifact types, - define an `OpenArtifact`-style FileManager contract plus required supporting projections, - register `memory.*`, `live.*`,'
- '- The canonical-storage side is already disciplined: - `seglog` is canonical - JSONL mirror is derived - Project Plan Package artifacts are canonically persisted and filesystem materializations are staging/export/cache - packaged document sets already have explicit `manifest.json` ownership'
- '- Source Control and artifact navigation surfaces are showing a broader object-identity problem: - `GitHub_Integration.md` still frames worktree ownership around `run/tier` - `FileManager.md` already wants identity-based artifact opening, but its open contract is still too path-first - `Runtime_Arti'
- '- Export correctness now depends on the earlier projection-trust work. - Recommended rule: - exports derived from stale/degraded projections must either: - disclose trust state in the export/manifest - or re-query from canonical/current backing data before export'
- '- `Project_Output_Artifacts.md` is clear that canonical persistence is seglog-first and filesystem materialization under `.puppet-master/project/**` is staging/export/cache only.'
- '- Adjacent owner reference remains `Plans/Runtime_Artifacts_Panel.md` for this recovery seam.'
- '- Artifact and file-opening semantics are not yet fully aligned with recovery/run-aware identity: - `FileManager.md` is moving toward identity-based opens - `Runtime_Artifacts_Panel.md` and related surfaces still need a tighter canonical id/trust/freshness contract'
- '- `Runtime_Artifacts_Panel.md` also confirms that artifact surfaces are identity-native and project-scoped, but it still does not fully own the open-resolution path. It references File Manager for open-by-artifact identity, which means the open contract boundary is still under-specified.'
- '- event aliasing discipline applies to artifact event families: compatibility aliases may exist only as declared aliases to canonical event/artifact types, never as independent persistence identities.'
- '- CSV `/table` exports are convenience view exports, not canonical archival exports; when built from stale or `/degraded` projections they must disclose trust state or re-query canonical backing data before export.'
- '- Artifact and record exports preserve canonical IDs and `/refs`; they must not invent export-local shadow identity for artifacts, receipts, records, or related runtime refs.'
- '## 1. Canonical persistence vs filesystem staging'
owner_hints:
- Plans/Project_Output_Artifacts.md
split_recommendation_reason: The doc-level source-preserving unit covers both GUI-related and non-GUI spans; future fine-grained PlanUnits should split those surfaces when safe.
```

