# PM Bootstrap Ledger-to-Plans Semantic Fidelity Audit

Status: BLOCKED

Audit ID: audit-20260617-004-orchestrator-goal-runtime-flow-post-repair-semantic-fidelity
Ledger ID: pldg-20260616-002-orchestrator-goal-runtime-flow
Range: cd41074b31bdc476a3bc2a985e7551f7de6775ed..28a01091b2347f5e69020297cb96ec0e66f1be58
Baseline: cd41074b31bdc476a3bc2a985e7551f7de6775ed
Current ref: 28a01091b2347f5e69020297cb96ec0e66f1be58

## Status Basis

The latest ledger cycle is semantically much cleaner after the two repairs: no current-cycle exact-detail `missing_or_drift` finding was proven in the bounded atom/PlanUnit audit. The audit is still BLOCKED because the required validator suite exposed a present historical migration run failure:

- `python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-001-standardize-plans` failed with `doc_count_mismatch`, `inventory_doc_set_mismatch`, and stale `batch_report` `sha256_after` entries.
- The current changed migration run, `Plans/.plan_migration/pds-20260611-002-atomize-planunits`, passed validation.
- No validator mutated non-audit files; no reverts were needed.

## Inference Evidence

`pldg-20260616-002-orchestrator-goal-runtime-flow` was inferred as the latest non-background sealed ledger from the registry and recent commit range, excluding `pldg-20260610-001-ledger-plan-system`. The earliest contiguous cycle commit touching the latest ledger/governance/audit surfaces is parented by `cd41074b31bdc476a3bc2a985e7551f7de6775ed`; `HEAD` is `28a01091b2347f5e69020297cb96ec0e66f1be58`.

## Changed Files

Changed live Plans docs in range:

- `Plans/00-plans-index.md`
- `Plans/Contracts_V0.md`
- `Plans/Executor_Protocol.md`
- `Plans/FinalGUISpec.md`
- `Plans/Goal_Runtime_System.md`
- `Plans/Models_System.md`
- `Plans/Orchestrator_Page.md`
- `Plans/Plan_Document_System.md`
- `Plans/Plan_To_Node_Compilation.md`
- `Plans/Run_Graph_View.md`
- `Plans/assistant-chat-design.md`
- `Plans/orchestrator-subagent-integration.md`
- `Plans/storage-plan.md`

The range also touched ledger projections, `.plan_index`, `.evidence`, `_shards`, `Spec_Lock.json`, `auto_decisions.jsonl`, prior audit artifacts, and migration artifacts. Full file inventory is in `audit_report.json`.

## PlanUnit Deltas

No live PlanUnit headings/IDs were added or deleted in the changed live docs. Changed units:

`0PI-056`, `ACD-420`, `CV-288`, `EP-098`, `F3-395`, `GRS-026`, `GRS-027`, `MS-109`, `OP-022`, `OSI-428`, `PDS-006`, `PNC-009`, `RGV-012`, `SP-215`.

Changed-doc audit found one review-required traceability issue: `MS-109` removed the moved-owner breadcrumb for `atom-0031`/`atom-0032`; current bounded evidence finds those atoms only in `OSI-428`, not the prior EP/GRS breadcrumb set.

## Exact Detail Fidelity

Atom matrix summary:

- `exact_present`: 8
- `equivalent_with_evidence`: 3
- `explicitly_deferred`: 1
- `not_for_plan`: 2
- `source_lineage_only`: 90

No proven current-cycle exact detail loss remains in the high-risk compiled atom slice. The broad `source_lineage_only` bucket records ledger/setup or compressed provenance details that are not live canonical product prose; it should not be treated as product semantic drift by itself.

Notable low-risk exact-token note: `GRS-026` normalizes `canceled/resteered` to `cancelled/re-steered`; semantic support is present, exact spelling differs.

## Reciprocal Lineage

The reciprocal PlanUnit audit found all 23 compiled PlanUnits supported by ledger source lineage. No missing lineage, unsupported overclaim, changed enum/key shape, or unrelated requirement merge was found in the audited slice.

## Owner Routing

Open owner-routing findings:

- `MS-109`: model/provider lane binding omits provider-specific owner refs such as the provider-specific owner family / `Plans/Provider_OpenCode.md`.
- `RAP-027`: projects Goal Runtime receipt and verification evidence but omits direct `Goal_Runtime_System` / `GRS-027` dependency or owner hint.
- `F3-395`: consumes `Goal_Runtime_System` records but omits direct `GRS-026` / `GRS-027` or `Plans/Goal_Runtime_System.md` refs.
- `F3-395`: Usage/cost surface likely needs a `UF-*` dependency such as `UF-064` or `UF-069`.

## Ledger And Governance

Ledger records/projections agree on sealed state: registry, manifest, registry_entry, current, handoff, compile_queue, ledger_health, and governance status are consistent. `q-0007`..`q-0009` remain open only as `post_seal_followup_not_compiled` ledger-only follow-ups, not active compile blockers.

Governance warning: `Plans/.evidence/orchestrator-goal-runtime-flow-post-audit-repair-2026-06-16/evidence.json` still records `18075 acceptance units`, while live projections report `18081`. This is generated evidence text/provenance drift, not a live gate failure.

`.plan_index` summary: `5065` PlanUnits, `18081` acceptance units, node readiness remains `blocked_compiler_contract_incomplete`, `245` cycle blockers, and `build_order_available=false`.

## Validators

Passed:

- bootstrap ledger validate
- pm-plan-index validate
- pm-plan-migration validate for `pds-20260611-002-atomize-planunits`
- run-gates
- `pm-shard-plans.py --check`
- `pm-plans-verify check-shards`
- validate-auto-decisions
- verify-spec-lock
- validate-evidence
- `git diff --check`

Failed:

- pm-plan-migration validate for `pds-20260611-001-standardize-plans`

Mutation tracking: no non-audit mutations observed; no side-effect reverts were needed.

## Forbidden Artifacts

No WorkNodes, NodeSeeds, NodeSeed candidates, executable queues, final node manifests, production build tasks, Rust/Slint scaffolds, or legacy Iced app resurrection were added by this range.

Open forbidden/local-state warnings:

- Ignored current-tree `.claude` credential/session/debug state exists, including `.claude/.credentials.json` and `.claude/_state/.credentials.json`.
- `.claude/settings.local.json` is tracked local tool permission state from baseline/current tree.
- `Plans/.audits/audit-20260616-008-orchestrator-goal-runtime-flow-post-repair/.pydeps/**` is tracked local dependency/platform state.
- Prior audit helper scripts and validator provenance remain in the range/prior audit artifacts.

## Subagent Summary

Read-only subagents covered atom exact fidelity, reciprocal PlanUnit lineage, owner routing, changed-doc fidelity, ledger/governance/index consistency, validator mutability context, and forbidden artifact scanning. Main agent integrated findings and wrote only under this audit directory.

## Why The Repairs Did Not Finish Everything

The prior repairs appear to have fixed the main semantic fidelity defects they targeted. This audit found remaining issues because it widened and re-ran the boundary checks: owner cross-doc refs are stricter than atom text fidelity, generated evidence text can drift after index count changes, and the broad migration validator includes an older historical run that is stale even though the current changed migration run passes.

## Next Safe Action

Run a bounded repair for this audit only:

1. Fix or formally exempt the stale `pds-20260611-001-standardize-plans` migration validation failure.
2. Add the missing owner refs for `MS-109`, `RAP-027`, and `F3-395` if accepted by owner routing.
3. Refresh the evidence acceptance-count text through governance scripts only.
4. Rerun the same validator suite with mutation tracking.

## Compact Repair Prompt

Repair only `audit-20260617-004-orchestrator-goal-runtime-flow-post-repair-semantic-fidelity` findings: fix or formally exempt stale `Plans/.plan_migration/pds-20260611-001-standardize-plans` validation failure; add missing owner refs for `MS-109` provider docs, `RAP-027` Goal_Runtime_System/GRS-027, `F3-395` Goal_Runtime_System/GRS-026/GRS-027 and UF usage dependency if accepted; refresh generated evidence text drift through governance scripts only; rerun bootstrap ledger validate, pm-plan-index validate, pm-plan-migration validate, run-gates, shard check, auto-decisions, spec-lock, evidence, and git diff --check with mutation tracking. No WorkNodes, NodeSeeds, executable queues, manifests, build tasks, or implementation files.
