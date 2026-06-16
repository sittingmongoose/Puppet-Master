# audit-20260616-003-goal-runtime-system

Status: PASS_WITH_WARNINGS  
Ledger: `pldg-20260616-001-goal-runtime-system`  
Range: `fb7dd9aee5ef21d4244deb74d151d2de15a620ab..25b5ae3b1b646228aa6c98f4a8969daed379b6ad`  
Earliest cycle commit: `fbb9c48c1e8bb1aff0ab70dae558d21fb68a7050`  
Generated: `2026-06-16T09:25:18Z`

## Basis

The audit targeted committed `HEAD` in clean detached worktree `/tmp/pm-audit-head-E08lOB` because the main worktree already had unrelated uncommitted repair changes. This audit wrote only `Plans/.audits/audit-20260616-003-goal-runtime-system/`.

Ledger inference used the latest non-background v2 registry entry, `pldg-20260616-001-goal-runtime-system`, then selected the earliest commit in the cycle touching `Plans/ledgers/v2/pldg-20260616-001-goal-runtime-system/` or `Plans/ledgers/v2/ledger_registry.json`; the baseline is that commit's parent.

## Changed Files

Committed changed paths in range: 261. Changed live top-level Plan docs:

- `Plans/00-plans-index.md`
- `Plans/FinalGUISpec.md`
- `Plans/Goal_Runtime_System.md`
- `Plans/assistant-chat-design.md`

The range also changes ledger records/projections, `.plan_index`, `.plan_migration`, `.evidence`, `_shards`, `Spec_Lock.json`, `auto_decisions.jsonl`, and `plan_graph.json`.

## PlanUnit Deltas

Added PlanUnits: 31. Changed PlanUnits: 0. Deleted PlanUnits: 0.

Added IDs: `0PI-055, ACD-416, ACD-417, ACD-418, ACD-419, F3-393, GRS-001, GRS-002, GRS-003, GRS-004, GRS-005, GRS-006, GRS-007, GRS-008, GRS-009, GRS-010, GRS-011, GRS-012, GRS-013, GRS-014, GRS-015, GRS-016, GRS-017, GRS-018, GRS-019, GRS-020, GRS-021, GRS-022, GRS-023, GRS-024, GRS-025`.

No changed or deleted PlanUnits were found in the scoped live Plan docs. No live-doc prose/headings/ContractRefs were removed; the changed live docs are additive in this range.

## Possible Losses And Drift

No deletion-based loss was found. The main risks are semantic/status drift in added or refreshed content:

- High: canonical plan prose still contains pre-seal or no-governance-update wording after the committed range refreshed governance artifacts and the ledger reports sealed state (`Plans/00-plans-index.md:222`, `Plans/Goal_Runtime_System.md:1131`, `Plans/Goal_Runtime_System.md:1457`).
- High: the Goal Runtime evidence bundle declares `pm.build-governance.goal-runtime-system-governance-seal`, but `Plans/plan_graph.json` does not define that node.
- Medium: evidence bundles have current hashes but stale embedded count text, including old 5,005/17,798 PlanUnit/acceptance counts and 50/876 shard counts.
- Medium: sealed ledger projections and atom compile notes retain pending-seal or refreshing wording.
- Medium: `q-0005` lists `F3-393`, but `F3-393` source_lineage does not cite `q-0005`; the question is covered by `GRS-010` and `GRS-025`.
- Medium: several exact source tokens were compressed or omitted in Goal Runtime and Assistant Chat PlanUnits.
- Medium/low: contract/storage owner routing and full governance validation surfaces need explicit disposition.

See `semantic_risks.jsonl` and `changed_plan_fidelity.jsonl` for exact evidence.

## Ledger Consistency

Manifest record counts match the committed JSONL records. Atom statuses are 108 `compiled_to_plan`, 1 `not_for_plan`, and 1 `deferred`. All five questions are `deferred`. No sealed-ledger active candidate/open_question/ready_for_plan_compile atom violation was found. Every compiled atom has live non-pipeline PlanUnit source_lineage. All design atoms have `gui_related`.

Warnings remain: stale pending-seal compile notes on 108 compiled atoms; stale current/handoff/registry projection text; registry keeps the ledger under `compiled_ledgers` while ledger state and health report sealed; `atom-0016` appears in both `source_atom_ids` and `deferred_atom_ids`; several decision/question compiled-output mappings overclaim individual PlanUnits even though coverage exists elsewhere.

## Governance And Index

`.plan_index` validates with 5,036 PlanUnits and 17,890 acceptance units. Coverage status is pass. `node_readiness_report.status` remains `blocked_compiler_contract_incomplete`; `no_worknodes_created=true`; `nodeseed_candidates_created=false`.

Spec Lock hashes, shard report hashes, and evidence file hashes validate. Governance warnings are about provenance and graph/count consistency, not hash mismatches: the Goal Runtime evidence node is orphaned from `plan_graph.json`, full gate command provenance is incomplete in the new evidence bundle, and several older evidence bundles preserve stale human/count excerpts.

## Validators

Validator worktree status before validators: empty. Status after validators: empty. Mutating validation detected: false.

All required commands returned 0:

- `python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260616-001-goal-runtime-system`
- `python3 scripts/pm-plan-index.py validate`
- `python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits`
- `python3 scripts/pm-plans-verify.py run-gates`
- `python3 scripts/pm-shard-plans.py --check`
- `python3 scripts/pm-plans-verify.py validate-auto-decisions`
- `python3 scripts/pm-plans-verify.py verify-spec-lock`
- `python3 scripts/pm-plans-verify.py validate-evidence`
- `git diff --check`

Raw command output is in `validator_results.json`.

## Forbidden Artifacts

PASS. No committed WorkNodes, NodeSeeds, NodeSeed candidates, executable queues, final node manifests, implementation files, product build tasks, or legacy Iced/Rust/Slint app scaffolding were found in the audit range. The node readiness report remains blocked pending the compiler contract.

## Subagent Summary

- Peirce: changed-doc fidelity found additive PlanUnit changes only, but flagged stale governance prose as a fail-grade finding.
- Heisenberg: compiled atoms all have canonical PlanUnit evidence; weak question/decision output mappings remain.
- Kepler: Spec Lock and shards are mechanically valid; evidence/plan_graph provenance and stale evidence count text need repair.
- Dirac: ledger counts/status invariants pass; sealed projections contain stale lifecycle text.
- Tesla: forbidden artifact scan passed.

## Exact Next Safe Action

Run a bounded repair pass that only reconciles ledger projections, canonical stale governance prose, evidence/plan_graph provenance, stale count excerpts, exact token omissions, and weak output mappings. Do not create WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks. After repair, rerun the full validator suite and refresh governance artifacts through the repo scripts/tooling rather than hand-editing generated files.

## Compact Repair Prompt

```text
Repair audit audit-20260616-003-goal-runtime-system for ledger pldg-20260616-001-goal-runtime-system. Do not create WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or build tasks. Fix only: stale pre-seal/sealed wording in live Plan prose and ledger projections; 108 pending-seal atom compile notes; q-0005/F3-393 and weak decision output mappings; Goal Runtime evidence node/plan_graph mismatch; stale evidence count excerpts; missing gate provenance; exact-token compression in GRS/ACD PlanUnits; owner routing for contract/storage and Chain Wizard UI; full governance validator surface. Regenerate generated governance/index/shard/evidence artifacts with repo scripts, then run the full validator suite and git diff --check.
```
