# PM Bootstrap Ledger-to-Plans Audit

Status: BLOCKED

Audit id: `audit-20260615-001-part-3-fable-cleanup`
Ledger: `pldg-20260614-002-part-3-fable-cleanup`
Range: `e9be8144f299d0d54a40366403ab4f87f04a9df7..5c93f1227ec75354555e3a030a26e139805caac1`

## Inferred Range

`current_ref` is `HEAD` at `5c93f1227ec75354555e3a030a26e139805caac1`. The latest non-background ledger was inferred from `Plans/ledgers/v2/ledger_registry.json`: `pldg-20260614-002-part-3-fable-cleanup`, last updated `2026-06-15T13:59:47Z`.

The ledger directory first appears in `HEAD`, and `HEAD^` is `e9be8144f299d0d54a40366403ab4f87f04a9df7`, so the audited range is the parent-to-HEAD cycle commit. That same commit contains the live Plan, `.plan_index`, `.plan_migration`, `.evidence`, `Spec_Lock`, shard, `auto_decisions`, `plan_graph`, ledger, and registry changes for Part 3.

## Changed Files

Changed live top-level Plans docs:

- `Plans/Containers_Registry_and_Unraid.md`
- `Plans/Contracts_V0.md`
- `Plans/FileManager.md`
- `Plans/FileSafe.md`
- `Plans/FinalGUISpec.md`
- `Plans/Media_Generation_and_Capabilities.md`
- `Plans/MiscPlan.md`
- `Plans/Permissions_System.md`
- `Plans/Progression_Gates.md`
- `Plans/Project_Output_Artifacts.md`
- `Plans/Provider_OpenCode.md`
- `Plans/Run_Graph_View.md`
- `Plans/Runtime_Artifacts_Panel.md`
- `Plans/chain-wizard-flexibility.md`
- `Plans/orchestrator-subagent-integration.md`

Generated/governance artifacts also changed under `Plans/.plan_index/`, `Plans/.plan_migration/pds-20260611-002-atomize-planunits/`, `Plans/.evidence/`, `Plans/_shards/`, `Plans/Spec_Lock.json`, `Plans/auto_decisions.jsonl`, `Plans/plan_graph.json`, and `Plans/ledgers/v2/`.

## PlanUnit Deltas

PlanUnits added: 26. Changed: 2. Deleted: 0.

Changed PlanUnits:

- `CRAU-041`: promoted from reserved future-scope compatibility disposition to active Docker Manager operation requirement.
- `CWF-065`: refined GitHub/fork behavior to include explicit organization-fork preflight and typed unsupported-host outcomes.

No changed live Plan doc had missing required PlanUnit fields or invalid `gui_related` booleans. All 26 compiled PlanUnits were found in live non-pipeline Plans docs, and all 58 compiled source atoms in the compile queue were covered by live PlanUnit `source_lineage`.

## Possible Losses And Drift

Possible losses were found.

High-risk examples:

- `CRAU-041` changed semantic status from future-scope placeholder to active requirement without fresh ledger/source lineage on the changed PlanUnit.
- `RAP-026` / `POA-046` use `artifacts_index:v1:{project_id}` while existing owner text names `artifacts_index.v1:{project_id}:{artifact_id}`, losing artifact row identity and key shape.
- Docker Manager compiled atoms lost specific review/failure/drift/access/K8s payload fields.
- `F-069` replaced exact operation/conflict/lifecycle enum tokens with different names.
- `PS-113` omits `approval_scope_level` and cross-project approval boundary.

See `semantic_risks.jsonl` for the full compact risk list.

## Ledger Consistency

Ledger record counts match manifest counts, and the compile queue itself is internally clean: 58 source atoms are all `compiled_to_plan`; none of the lingering candidate atoms are compile queue inputs.

The sealed ledger is still inconsistent:

- `current.json` says `governance_status: sealed` and records `candidate_atoms_count: 48`.
- `open_items.json` says there are no open questions, blockers, unclassified candidates, or contradictions.
- `records/design_atoms.jsonl` still has 48 `status: candidate` atoms: 15 `candidate_for_later_compile`, 28 `source_memory_until_answered`, and 5 `candidate_conversation_only`.
- `operating_capsule.json` still says `hold_part_3_fable_cleanup_ledger_complete_until_compile_requested`.
- Registry/manifest/compile queue owner routing is narrowed to `Plans/Contracts_V0.md` even though compiled outputs span 15 live owner docs.

Under the requested sealed-ledger rule, active candidate atoms are a blocking audit failure unless explicitly deferred, not-for-plan, or source-lineage-only.

## Governance And Index

Plan index summary:

- PlanUnits: 4,998
- Acceptance units: 17,760
- Required metadata coverage: complete
- `gui_related`: 2,119 true, 2,879 false
- Dependency graph: 4,998 nodes, 11,949 edges, 245 cycle blockers, 0 unresolved references
- Node readiness: `blocked_plans_incomplete`
- Compiler contract: `blocked_compiler_contract_incomplete`
- `no_worknodes_created: true`
- `nodeseed_candidates_created: false`

Governance artifact risks:

- Part 3 seal evidence records `pm-bootstrap-ledger-validate.py` against `pldg-20260610-001-ledger-plan-system`, not the audited Part 3 ledger.
- Part 3 seal evidence omits `python3 scripts/pm-plans-verify.py run-gates`.
- Migration final summary and coverage report still carry pre-seal `expected_preseal_failure` and "Spec Lock/evidence not updated" notes even though clean-state run-gates passes.

## Validators

Required validator sequence result:

- `python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260614-002-part-3-fable-cleanup`: pass
- `python3 scripts/pm-plan-index.py validate`: pass
- `python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits`: pass but mutates `validation_report.json`
- `python3 scripts/pm-plans-verify.py run-gates`: fail after mutation due stale evidence hash
- `python3 scripts/pm-shard-plans.py --check`: pass
- `python3 scripts/pm-plans-verify.py validate-auto-decisions`: pass
- `python3 scripts/pm-plans-verify.py verify-spec-lock`: pass
- `python3 scripts/pm-plans-verify.py validate-evidence`: fail after mutation due stale evidence hash
- `git diff --check`: pass

The mutation was timestamp-only: `validation_report.json` `generated_at_utc` changed from `2026-06-15T14:03:46Z` to `2026-06-15T18:12:03Z`. The audit restored that side effect to keep the worktree clean. Clean-state reruns of `run-gates` and `validate-evidence` both passed.

Static evidence: `scripts/pm-plan-migration.py` `cmd_validate` calls `write_json(run_dir / "validation_report.json", report)` during `validate`.

## Forbidden Artifacts

Pass. No WorkNodes, NodeSeeds, NodeSeed candidates, executable queues, final node manifests, implementation files, production build tasks, final node queues, or legacy Iced app recreation were found. Mentions are textual boundary mentions only, and `node_readiness_report.json` explicitly preserves no-node creation fields.

## Subagent Summary

Six read-only subagents completed bounded reviews:

- changed-doc fidelity
- compiled atom evidence mapping
- governance/index/evidence/shards
- semantic drift/exact tokens
- forbidden artifacts
- ledger consistency

One planned validator-mutability subagent could not be spawned due to the thread limit; the main audit performed that check directly through before/after git status and script inspection.

## Exact Next Safe Action

Open a dedicated repair cycle for audit findings only. Do not create WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, production build tasks, or final node queues.

Repair should first normalize ledger state and evidence:

1. Reclassify or disposition the 48 candidate atoms as compiled, deferred, not-for-plan, or source-lineage-only with explicit rationale.
2. Refresh `current`, `handoff`, `open_items`, `operating_capsule`, `ledger_health`, manifest/registry canonical targets, and compile queue owner routing so they agree.
3. Repair semantic/lineage drift in changed PlanUnits, especially `CRAU-041`, `CWF-065`, `RAP-026`/`POA-046`, Docker payload fields, FileManager enums, and permission/project boundary fields.
4. Make `pm-plan-migration.py validate` non-mutating or separate write/update mode from validation.
5. Regenerate migration/index/shards/evidence/spec-lock governance artifacts in the explicit governance seal phase and rerun the full validator suite.

## Compact Repair Prompt

Repair the audit findings in `Plans/.audits/audit-20260615-001-part-3-fable-cleanup/` without creating WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks. First fix sealed-ledger consistency for `pldg-20260614-002-part-3-fable-cleanup`: disposition the 48 candidate atoms, align `current`, `handoff`, `open_items`, `operating_capsule`, `ledger_health`, manifest/registry targets, and compile queue owner routing. Then repair PlanUnit semantic/lineage drift listed in `semantic_risks.jsonl`. Make migration validation non-mutating. Finally run the governance seal regeneration and validators, preserving clean git status except intended repair artifacts.
