# audit-20260617-001-orchestrator-goal-runtime-flow-post-repair-fidelity

Status: PASS_WITH_WARNINGS

## Inferred Range

- ledger_id: `pldg-20260616-002-orchestrator-goal-runtime-flow`
- baseline_ref: `0406286cd7732d72c73a6a88c19519136b074536`
- current_ref: `506dde29cad8ec557088a875ff56ab8624c3af3f`
- Inference: HEAD is the smallest contiguous recent committed cycle ending at the current ref and touching the target ledger, live Plans docs, `.plan_index`, governance artifacts, and ledger projections. The parent of HEAD is the baseline.

## Changed Files

Full changed-file inventory is in `audit_report.json`. The semantically audited live Plans docs changed in this range were:

- `Plans/Contracts_V0.md`
- `Plans/Executor_Protocol.md`
- `Plans/Goal_Runtime_System.md`
- `Plans/Models_System.md`
- `Plans/Orchestrator_Page.md`
- `Plans/Planning_Ledger_System.md`
- `Plans/Run_Graph_View.md`
- `Plans/assistant-chat-design.md`
- `Plans/orchestrator-subagent-integration.md`
- `Plans/storage-plan.md`

Generated/index/governance outputs also changed: `Plans/.plan_index/**`, `Plans/.plan_migration/**`, `Plans/_shards/**`, `Plans/.evidence/**`, `Plans/Spec_Lock.json`, and `Plans/auto_decisions.jsonl`.

## PlanUnit Deltas

- Added PlanUnits: none.
- Deleted PlanUnits: none.
- Materially changed: `CV-288`, `EP-098`, `GRS-002`, `GRS-026`, `GRS-027`, `MS-109`, `OP-022`, `RGV-012`, `SP-215`.
- Moved unchanged: `PLS-011`, `ACD-420`.
- Line-shift/grouping only: `PLS-004` through `PLS-010`, `ACD-417` through `ACD-419`, `OSI-425` through `OSI-428`.

## Exact-Detail Fidelity

The cycle is not a clean semantic PASS. The exhaustive atom matrix covers 104 atoms; final summary: `{'not_for_plan': 2, 'exact_present': 29, 'source_lineage_only': 2, 'equivalent_with_evidence': 51, 'missing_or_drift': 20}`.

Lead exact-detail warnings:

- `CV-288` / `SP-215`: `VerificationCycle.status` is repaired to `failed | passed | blocked`, but both docs still place broader `ready/running/provisional_success/verifying/failed_verification/repairing/certified/failed/blocked/cancelled/stopped` wording close enough to blur VerificationCycle status with GoalRun/WorkNode projection status.
- `atom-0014`, `atom-0017`, `atom-0020`, `atom-0047`, `atom-0053`, and several GUI/doc-path atoms have exact tokens or source details that are missing, normalized, source-lineage-only, or only weakly evidenced in governed live Plan prose.
- `atom-0101` is correctly non-applicable/not-for-plan.

See `atom_fidelity_matrix.jsonl` and `semantic_risks.jsonl` for per-atom detail status.

## Reciprocal Lineage

- `EP-098` has thin reciprocal lineage for added `PS-115`/`W-071` dependency and owner routing.
- `CV-288` and `SP-215` compress separate ledger exact tokens `status` and `failed | passed | blocked` into `status failed | passed | blocked`.
- `MS-109` dropped baseline `atom-0031`/`atom-0032` source refs while related exact tokens remain; either restore refs or explicitly disposition the moved ownership.

## Owner Routing

No wrong-owner blocker was found, but cross-owner references need cleanup:

- `OSI-428` should reference `Contracts_V0` and `storage-plan` for schema/persistence consumption.
- `PLS-011` should reference `Bootstrap_Planning_Migration` for governance seal timing.
- `CV-288` should reference `Permissions_System` and `WorktreeGitImprovement` for `write_mode` authority/lease semantics.
- `ACD-420` should directly reference `Planning_Ledger_System` and `Plan_To_Node_Compilation` for ledger/work-graph boundaries.

## Ledger And Governance

- Ledger projections mostly agree: manifest/current/compile_queue sealed, no active candidate atoms, no ready-for-compile atoms, no blockers, and `q-0007` through `q-0009` are explicitly `post_seal_followup_not_compiled`.
- Warning: `registry_entry.json` and `ledger_registry.json` still expose 16 `candidate_compile_owner_docs` on a sealed ledger. Treat as source-lineage-only or move under explicit source-lineage fields.
- Warning: evidence narration has stale count excerpts (`18068` acceptance units) while current validators agree on 5065 PlanUnits, 18074 acceptance units, and 906 checked shards.
- `.plan_index` coverage is consistent: 68/68 docs covered, 5065 unique PlanUnits, 18074 acceptance units, no missing `gui_related`, no unresolved dependency refs. Node readiness remains intentionally `blocked_compiler_contract_incomplete`.

## Validators

All required validators passed with no repo mutation outside the already-untracked audit directory:

- `pm-bootstrap-ledger-validate`: pass.
- `pm-plan-index validate`: pass.
- `pm-plan-migration validate`: pass.
- `pm-plans-verify run-gates`: pass.
- `pm-shard-plans --check`: pass.
- `validate-auto-decisions`: pass.
- `verify-spec-lock`: pass.
- `validate-evidence`: pass.
- `git diff --check`: pass.

YAML-dependent validators used `PYTHONPATH=Plans/.audits/audit-20260616-008-orchestrator-goal-runtime-flow-post-repair/.pydeps` because bare local `python3` cannot import `yaml`.

## Forbidden Artifacts

No range-created WorkNodes, NodeSeeds, NodeSeed candidates, executable queues, final node manifests, production/final build tasks, Rust/Slint scaffold, implementation files, or legacy Iced resurrection were found.

Out-of-range residuals remain in the current tree: `Concepts/*` executable/prototype files and `.claude/settings.local.json`. They were not introduced by this audited range.

## Subagent Summary

- atom exact-fidelity atoms 0002-0027: warn - Most claims were exact/equivalent; atom-0014 governance-artifact owner claim, atom-0017 low-end/input-output details, and atom-0020 VerificationFinding token were missing or drifted.
- atom exact-fidelity atoms 0028-0053: warn - Several normalized terms are acceptable, but atom-0047 replan details and atom-0053 defect-signature schema fields lost exact canonical coverage.
- atom exact-fidelity atoms 0054-0080: warn - GUI/page atom semantics are broadly present; many exact GUI tokens remain partial or weak, especially Dashboard/Agents/PlanUnit page surface tokens and broad doc-path audit atoms.
- atom exact-fidelity atoms 0081-0104: warn - Compiler/governance boundaries are mostly preserved; several broad impact atoms are source-lineage only or overbroad in compiled_output metadata.
- PlanUnit reciprocal lineage: warn - EP-098 has thin permission/worktree reciprocal lineage; CV-288/SP-215 compress status enum tokens; MS-109 dropped baseline atom-0031/atom-0032 lineage while retaining related exact tokens.
- owner routing: warn - No wrong-owner blocker found, but OSI-428, PLS-011, ACD-420, and CV-288 need cross-owner refs; SP-215 blurs VerificationCycle status with broader projection status.
- changed-doc fidelity: warn - No PlanUnits added/deleted and no ContractRef loss; material changes require reconciliation in CV-288/SP-215 and MS-109 source-lineage disposition.
- ledger/index/governance: warn - Validators and index counts pass; registry_entry and ledger_registry still expose candidate_compile_owner_docs on a sealed ledger, and evidence narration has stale count text.
- forbidden artifacts: pass_with_out_of_range_residuals - No range-created WorkNodes, NodeSeeds, executable queues, final manifests, build tasks, implementation files, or legacy app resurrection; old Concepts prototypes and .claude local state remain out of range.
- validator mutability: pass - All 9 validators passed with identical before/after git status; only the expected untracked audit directory exists.

## Next Safe Action

Open a separate repair pass for the warnings. Do not repair inside this audit.

Compact repair prompt:

```text
Repair pldg-20260616-002 post-audit semantic warnings only. Do not broaden scope. Fix CV-288/SP-215 status-shape wording so VerificationCycle.status is only failed | passed | blocked and ready/running/.../stopped are scoped to GoalRun/WorkNode projections or compatibility-only. Restore or explicitly disposition MS-109 atom-0031/atom-0032 lineage. Add missing owner refs for OSI-428, PLS-011, CV-288, and ACD-420. Move sealed registry candidate_compile_owner_docs to explicit source-lineage fields or clear active candidate fields. Refresh generated index/shards/evidence/Spec_Lock only through governance scripts and rerun all gates. Do not create WorkNodes, NodeSeeds, executable queues, implementation files, or build tasks.
```
