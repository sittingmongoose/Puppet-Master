# Governance gates inventory

**Generated:** 2026-08-12T10:50:00Z  
**Audit root:** `Plans/.audits/event-authority-2026-08-12/`

## Note on "26 governance gates"

`FIXED_POINT_CLOSURE_RUNBOOK.md` Phase 7 references `python scripts/pm-implementation-readiness.py --validate-gates`, but the script exposes **`validate`**, **`self-test`**, **`generate`**, and **`validate-case-l`** only. Treat closure as the composite gate stack below (26 = full post-cert stack per runbook intent, not a single CLI flag).

## Composite gate stack (current)

| # | Gate layer | Command / artifact | Current status | Blocker |
|---:|---|---|---|---|
| 1 | Independent EA validator (diagnostic) | `pm_event_authority_independent_validator.py` | **fail** (expected) | 10 pre-seal errors; receipt `2026-08-12T10:47:49Z` |
| 2 | Seal prerequisites | `named_checks.seal_prerequisites_met` | **false** | 8 owner decisions + ledger outcomes |
| 3 | Fresh census denominator sealed | `FRESH_CENSUS_DENOMINATOR.json` `closed=true` | **blocked** | Phase 1–2 runbook |
| 4 | EA validator certification | `pass=true` post-seal | **blocked** | denominator seal |
| 5 | Oracle harness | `oracle-harness/` 39/39 | **pass** | — |
| 6 | Known37 preservation | `known37/KNOWN37_NO_REGRESSION_DEPTH.md` | **pass membership / depth incomplete** | contract depth (August + fields) |
| 7 | Census adjudication partition | `census-adjudication/COVERAGE.json` | **pass** | — |
| 8 | Census drift extract | `closed-world-census/extract/EXTRACT_SUMMARY.json` | **complete** (`2026-08-12T10:34:29Z`) | no admission inferred |
| 9 | Owner decision sheet | `OWNER_DECISION_SHEET.json` | **8/8 PENDING** | owner input |
| 10 | Exclusion revalidation | `exclusion-revalidation/` | **92/94** | EXCL-OD-* (2) |
| 11 | Individual disposition unresolved | `individual-disposition/LEDGER.jsonl` | **54 unresolved** | J248/J40/EMIT-PERSIST/COMPACT |
| 12 | August checkpoint drafts | `august-checkpoint-drafts/` | **2 PENDING** | AUG-CP-* |
| 13 | Readiness validate | `pm-implementation-readiness.py validate` | **fail** (20 failures) | stale receipt + EA unresolved |
| 14 | Readiness self-test | `pm-implementation-readiness.py self-test` | **pass** (139 checks) | — |
| 15 | Buildability gate report | `buildability_gate_report.json` | **`buildability_gate_passed=false`** | IRB-005, IRB-011 |
| 16 | Approve-and-build wizard gate | `wizard_gate_contract` | **disabled** | buildability + PNC-019 |
| 17 | PNC-019 harness preflight | `certification_preflight_failures()` | **blocked** | EA clearance + Case L |
| 18 | PNC-019 harness run | `pm-pnc019-certification-harness.py run` | **not run** | Phases 3–4 |
| 19 | Fixed-point regen | migration/index/readiness/seal/shards | **not run** | harness pass |
| 20 | IRB-005 append | `_semantic_closure_registry.jsonl` | **blocked** | Phases 3–4 |
| 21 | IRB-011 append | `_semantic_closure_registry.jsonl` | **blocked** | Phases 3–4 |
| 22 | Spec Lock current | `Plans/Spec_Lock.json` | **stale vs worktree** | fixed-point regen |
| 23 | Node readiness | `node_readiness_report.json` | **PNC-019 hard-disabled** | certification |
| 24 | Git worktree clean | `git status` | **dirty/untracked campaign** | commit after pass |
| 25 | Runtime/buildability enable | buildability + gates | **disabled** | full stack |
| 26 | Fast-forward push main | `git push origin main` | **not done** | all above |

## Open IRB blockers (buildability)

- **IRB-005** (runtime_lifecycle): open
- **IRB-011** (clean_room_harness): open

## Readiness validate failure families

- `buildability_gate_report_stale_or_not_canonical`: 1
- `event_denominator_unresolved`: 2
- `event_family_contract_depth_unresolved`: 2
- `pnc019_source_hash_stale`: 15

## Owner-decision mapping (sole human unblock)

| Decision ID | Unblocks |
|---|---|
| `EXCL-OD-done_budget_exceeded` | exclusion 93/94 |
| `EXCL-OD-stop_identical_failure` | exclusion 94/94 |
| `COMPACT-001` | 1 evidence-gap row (`context.compaction.failed`) |
| `EMIT-PERSIST-026` | 26 emit/persist evidence-gap rows |
| `AUG-CP-WLC-001` | August `workspace.layout_changed` depth |
| `AUG-CP-TWM-001` | August `terminal.workgroup_moved` depth |
| `J248-VETO-BATCH-252` | 252 persisted-unregistered owner-veto rows |
| `J40-VETO-BATCH` | 28 unresolved owner-veto rows |

Defaults are **not** auto-applied. See `OWNER_DECISION_BRIEF.md`.

## Post-owner sequence (binding)

1. Apply sheet → ledgers (Phase 1 runbook)
2. Proposed admitted `event_types` while `closed=false`
3. `seal_prerequisites_met=true` → seal denominator → EA `pass=true`
4. PNC-019 harness `run` (sole receipt producer)
5. Fixed-point regen → IRB append → readiness validate pass → governance seal
6. Clean FF push to main
