# Re-Audit 1 — Repair Wave Follow-Up (work item `wnc-20260905`)

Scope: verify the repairs executed against audit findings AUD-F01..AUD-F04 (see `REPAIR_GOAL.md` and `findings.jsonl`), re-check the repaired subject for new defects, and re-classify the final state. Original audit: `AUDIT_REPORT.md` (BLOCKED, 4 repair_required findings). Per-finding closure evidence: `repair_closure_audit.jsonl`.

## Repairs verified (all closed, post_repair_verdict = pass)

1. **AUD-F01 (WNC-N10)** — `Plans/working_notebook_contract_fixtures.json` now contains `entry_envelopes[2]`: an imported note whose hostile instruction-like body is captured verbatim as restricted attributed task data (`provenance_refs` kind `note_entry`, `restriction_refs` `protected_evidence`). `neg_import_without_restriction` is rejected by a new schema conditional (note_entry provenance ⇒ `restriction_refs` minItems 1) plus a validator invariant. WN-015's "import and injection fixtures preserve the instruction/data boundary" is now true in live canon.
2. **AUD-F02 (WNC-C08)** — SIR-036/C08's named crash cut points are materialized: `context_transitions[1..3]` (crash-before-commit keeps `checkpoint_ref` null; crash-after-commit retains the committed checkpoint ref and no admission receipt; unobserved native activation records failed-with-reason and no invented state), with two negatives (`neg_crash_before_commit_claims_checkpoint`, `neg_crash_after_commit_discards_checkpoint`) enforced by new schema conditionals and validator invariants.
3. **AUD-F03 (WNC-V01)** — `doc_impact_matrix.json` now carries no-change rows with live evidence for `Plans/Skills_System.md` and `Plans/Plugins_System.md` (68 rows total); the "all 61 packet candidates" claims in the matrix basis and `IMPLEMENTATION_REPORT.md` are corrected.
4. **AUD-F04 (WNC-S05)** — the corrupted `format!` example in `Plans/orchestrator-subagent-integration.md` is restored byte-identical to HEAD `4c88c0f` (verified by diffing the surrounding region against `git show HEAD`).

## New defects found during the loop (both fixed this wave)

5. **AUD-F05 (WNC-V03/V04)** — the negative-fixture check was **vacuous**: `apply_mutation` dropped the required `schema_id`/`schema_version` envelope, so all 14 original negatives were "rejected" for missing keys rather than their encoded semantics; 5 of them (`neg_committed_checkpoint_without_receipt`, `neg_transition_native_success_without_observation`, `neg_mixed_range_convention`, `neg_applied_without_result_revision`, `neg_conflict_without_conflicting_revision`) would not have been rejected at all. Fixed by preserving the envelope and hardening five schema conditionals (committed-checkpoint receipt, success-state admission boundary, exact-read range-convention enum, mutation-outcome non-null fields). All **17** negatives now fail for their own semantics — verified per-negative with sample errors.
6. **AUD-F06 (WNC-V05 seal convergence)** — an unquoted YAML flow scalar (items containing `?` and `: `) in `FinalGUISpec.md`'s F3-521 `preserved_exact_tokens` (content belonging to the parallel Guided-Tour work stream, pre-existing in the tree) broke PlanUnit parsing, dropped one PlanUnit from the index (6361 vs 6362), and blocked plan-migration/plan-index. Fixed mechanically (quoting only; token text unchanged, 534/534 YAML blocks in the doc now parse), then the serial supported seal was executed.

## Governance reseal (serial, supported scripts)

`pm-working-notebook-contracts.py` (pass) → `pm-shard-plans.py --generate` → `--check` (98 docs / 2132 shards, pass) → `pm-governance-seal.py sync-plan-sharding-evidence` → `pm-plan-migration.py snapshot-current` (run `pds-20260906-013…`, supersedes 012) → `pm-plan-index.py generate` + `validate` (6362 PlanUnits, coverage pass, `no_worknodes_created: true`, `nodeseed_candidates_created: false`, readiness `blocked_runtime_certification_incomplete` — honest PNC-019 state) → `pm-event-authority-currentness.py generate` + `validate` → `pm-implementation-readiness.py generate` → `pm-audit-status-index.py generate` → `pm-governance-seal.py refresh --spec-lock Plans/Spec_Lock.json --evidence …` last (7 stale doc hashes refreshed). Logs: `../implementation/logs/seal2_*`. `verify-spec-lock` re-run standalone: **pass** (exit 0).

## Final static-gate classification

Full `run-gates` after the repair wave: failing groups reduced 12 → 3, all pre-existing and out of this packet's repair scope:
- `validate_implementation_readiness` — PNC-019 certification receipt staleness; requires the runtime certification harness (explicitly out of Plans-only scope; no unlock performed).
- `validate_touch_closure` — inventory drift of the unrelated in-flight Guided-Tour work item (failing at baseline in this class).
- `validate_audit_closure` — the global closure registry pins pre-edit doc hashes; per PDS-014 its reconciliation belongs to a semantic audit cycle and the audit does not hand-edit the registry.

Everything else passes, including `verify_spec_lock`, `validate_plan_migration`, `validate_plan_index` (inside run-gates), `check_shards`, `validate_working_notebook_contracts`, `json_syntax`, `lint_*`, `validate_pm7_gui_fixtures`, wiring, plan-graph, evidence, audit-status-index.

## Status after re-audit 1

**PASS_WITH_WARNINGS** at Plans level: all 85 requirements and 62 scenarios hold current substantive evidence with zero outstanding `repair_required=true` findings; warnings (AUD-W01..W09 in `findings.jsonl`) are non-blocking and unchanged; the three remaining gate failures are pre-existing blockers explicitly out of scope; every runtime layer (native handlers, provider behavior, crash recovery at runtime, permission enforcement, security, visual, performance, PNC-019 certification) remains **NOT_RUN** and is not claimed.

## Loop note (iteration 2)

During verification the parallel Guided-Tour stream concurrently edited `Plans/FinalGUISpec.md` and `Plans/Automated_Testing_System.md` (17:30:50Z), stal-ing shards/snapshot/spec-lock again. A further serial seal cycle (shards → check → evidence sync → snapshot run `pds-20260906-014…` → plan-index generate/validate → readiness → audit-status → Spec Lock refresh) restored convergence. Final full `run-gates`: 27 pass / 3 fail, the three pre-existing out-of-scope failures listed above; `verify_spec_lock`, `check_shards`, and `validate_plan_migration` all pass. Repairs re-verified intact after the concurrent edits (17-negative-fixture gate, restored `format!` line, hostile-import fixture, crash-cut-point fixtures).
