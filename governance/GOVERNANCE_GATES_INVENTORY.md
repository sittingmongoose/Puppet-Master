# Governance Gates Inventory (26)

**Generated:** 2026-08-12T11:22:00Z  
**Authority:** `python3 scripts/pm-plans-verify.py run-gates` (`scripts/pm-plans-verify.py` L5986–6031)  
**Snapshot:** `Plans/.audits/irb-closure/run_gates_live.json` (`generated_at_utc=2026-08-12T11:18:59Z`)  
**Scope:** Post-certification fixed-point regen gate stack for IRB-005 / IRB-011 closure.  
**Non-goals:** Append registry rows now, run PNC-019 harness, enable runtime, rewrite reopened rows.

---

## Summary

| Metric | Value |
|---|---|
| Overall `run-gates` | **fail** (4/26 subchecks failing) |
| Gates passing | 22 |
| Gates failing | 4 (`json_syntax`, `verify_spec_lock`, `validate_implementation_readiness`, `validate_audit_closure`) |
| IRB blockers (effective) | IRB-005, IRB-011 (`open_blocker_count=2`) |
| EA validator | `pass=false`, `seal_prerequisites_met=false` |
| PNC-019 receipt | stale (`generated_at_utc=2026-07-06`; 15 `pnc019_source_hash_stale` failures) |
| Reopened registry rows | L736, L737 (`current_reopened_finding_count=2`) |

**Primary closure chain (blocking IRB append):**

1. Owner decisions → EA seal prerequisites (`seal_prerequisites_met=true`)
2. Seal `FRESH_CENSUS_DENOMINATOR.json` (`closed=true`)
3. EA independent validator `pass=true`
4. Fresh PNC-019 harness receipt (`python scripts/pm-pnc019-certification-harness.py run`)
5. Fixed-point regen (runbook Phase 5)
6. Append IRB repaired rows (runbook Phase 6)
7. All 26 `run-gates` pass (runbook Phase 7)

See `Plans/.audits/event-authority-2026-08-12/FIXED_POINT_CLOSURE_RUNBOOK.md` and `Plans/.audits/irb-closure/IRB_005_011_APPEND_PLAN.md`.

---

## 26-gate table

Command to refresh: `python3 scripts/pm-plans-verify.py run-gates`

| # | Gate ID | Progression_Gates map | Status | Primary blocker / failure | Evidence path(s) required |
|---:|---|---|---|---|---|
| 1 | `json_syntax` | (infra) | **fail** | Invalid JSON under `Plans/` (prior corrupted `run_gates_snapshot.json` removed 2026-08-12; re-run to confirm) | All `Plans/**/*.json`, `Plans/**/*.jsonl` |
| 2 | `verify_spec_lock` | GATE-002 | **fail** | `subcheck_exception`: `signal.SIGALRM` unavailable on Windows host | `Plans/Spec_Lock.json`, governed owner-doc hashes |
| 3 | `validate_plan_graph` | GATE-001 (partial) | pass | — | `Plans/plan_graph.json`, node change budgets |
| 4 | `validate_auto_decisions` | GATE-001 (partial) | pass | — | `Plans/auto_decisions.jsonl` |
| 5 | `validate_evidence` | GATE-005 | pass | — | `Plans/.evidence/**/evidence.json` |
| 6 | `lint_contractrefs` | GATE-009 | pass | — | `Plans/**/*.md` ContractRef lint |
| 7 | `lint_banned_phrases` | GATE-004 | pass | — | `Plans/**/*.md` (`TBD`, `Open Questions`, …) |
| 8 | `lint_path_refs` | (infra) | pass | — | Path references across Plans |
| 9 | `check_project_artifact_requirements` | GATE-011 (partial) | pass | — | `Plans/Project_Output_Artifacts.md` requirements |
| 10 | `validate_plans_to_code_handoff_schema` | (handoff) | pass | — | Plans-to-code handoff schema artifacts |
| 11 | `validate_prd_planning_runtime_contracts` | (PRD/runtime) | pass | — | PRD / planning runtime contract packet |
| 12 | `validate_case_l_non_event_materialization` | Case L | pass | — | `Plans/.implementation_readiness/non_executable_closure_evidence.json` |
| 13 | `validate_implementation_readiness` | PG-060 / GATE product gate | **fail** | `buildability_gate_report_stale_or_not_canonical`; 15× `pnc019_source_hash_stale`; 2× `event_denominator_unresolved`; 2× `event_family_contract_depth_unresolved` | `Plans/.implementation_readiness/readiness_blockers.jsonl`, `readiness_matrix.json`, `buildability_gate_report.json`, `pnc019_certification_receipt.json`, `Plans/.plan_index/node_readiness_report.json` |
| 14 | `validate_plan_migration` | (migration) | pass | — | `Plans/.plan_migration/pds-20260611-002-atomize-planunits/` |
| 15 | `validate_runtime_artifact_schemas` | (schemas) | pass | — | Runtime artifact JSON schemas under `Plans/` |
| 16 | `validate_goal_runtime_event_fixtures` | (fixtures) | pass | — | Goal runtime event fixture corpus |
| 17 | `validate_project_output_fixtures` | GATE-011 (partial) | pass | — | Project output fixture corpus |
| 18 | `validate_usage_gui_fixtures` | (GUI) | pass | — | Usage GUI fixture corpus |
| 19 | `validate_usage_contract_drift` | (usage) | pass | — | Usage contract drift baselines |
| 20 | `validate_gui_asset_policy` | (GUI policy) | pass | — | GUI asset policy fixtures |
| 21 | `validate_web_capability_contracts` | (web) | pass | — | Web capability contract schemas/fixtures |
| 22 | `validate_filesafe_security_policy` | (FileSafe) | pass | — | FileSafe security policy fixtures |
| 23 | `validate_wiring_matrix` | GATE-010 | pass | — | `Plans/Wiring_Matrix.production.json`, `UI_Command_Catalog.md`, `UI_Wiring_Rules.md` |
| 24 | `validate_audit_closure` | semantic closure | **fail** | Stale `owner_evidence_hashes` / `closure_evidence_hashes` in `_semantic_closure_registry.jsonl` (historical rows; includes reopened L736–737 bindings) | `Plans/.audits/_semantic_closure_registry.jsonl`, `scripts/pm-audit-closure.py validate` |
| 25 | `validate_audit_status_index` | audit index | pass | — | `Plans/.audits/_audit_status_index.json` |
| 26 | `check_shards` | (sharding) | pass | — | `Plans/_shards/**` vs owner docs / `Plans/.plan_index/sharding_config.json` |

### Progression_Gates manual slots (not in 26-stack)

These are **not** subchecks of `run-gates` but remain runtime-progression gates per `Plans/Progression_Gates.md`:

| Gate | Status | Notes |
|---|---|---|
| GATE-003 Architecture invariants | manual_pending | No automated `run-gates` subcheck |
| GATE-007 | tombstone | Reserved; no pass/fail |
| GATE-008 | tombstone | Reserved; no pass/fail |
| GATE-011 Requirements traceability | manual_pending | Partial coverage via gates 9, 17 |
| GATE-012 Requirements quality | manual_pending | Requires live `.puppet-master/project/traceability/requirements_quality_report.json` |
| GATE-013 Ambiguity markers | manual_pending | — |
| GATE-014 Document Set generation | manual_pending | — |

---

## Gate ↔ IRB-005 / IRB-011 dependency matrix

| Gate | Blocks IRB append directly? | Why |
|---|---|---|
| `validate_implementation_readiness` | **Yes** | Projects IRB-005/IRB-011 as effectively open until EA + PNC-019 + buildability regen |
| `validate_audit_closure` | **Yes** | Reopened rows L736–737 must be superseded by appended `repaired` rows with fresh hashes |
| `validate_audit_status_index` | Indirect | Must show `current_reopened_finding_count=0` after append + regen |
| EA validator (pre-gate) | **Yes (hard)** | IRB append gated on `pass=true` per runbook Phase 6 |
| PNC-019 harness (pre-gate) | **Yes (hard)** | Sole receipt producer; blocked until Phase 4 |
| Other 22 passing gates | No (current) | Must remain pass after fixed-point regen; no regressions |

---

## Current upstream blockers (Event Authority)

From `event_authority_validator_receipt.json` (`generated_at_utc=2026-08-12T11:06:09Z`):

| Check | Value |
|---|---|
| `pass` | false |
| `seal_prerequisites_met` | false |
| `fresh_denominator_closed` | false |
| `complete_denominator_known` | false |
| `contract_depth_complete` | false |

**Pre-seal blocking errors (9):** `august_checkpoint_veto_pending`, `exclusion_revalidation_incomplete`, `fresh_denominator_admitted_event_types_unspecified`, `individual_dispositions_evidence_gap_blocking`, `individual_dispositions_owner_veto_blocking`, `individual_dispositions_provisional`, `owner_decision_sheet_unresolved`, `registered_contract_depth_incomplete`, `unresolved_bucket_not_closed`.

**Owner sheet:** 8 unresolved decisions — `Plans/.audits/event-authority-2026-08-12/OWNER_DECISION_SHEET.json`.

---

## Readiness projection (current)

| Artifact | Current | Required for IRB closure |
|---|---|---|
| `buildability_gate_report.json` | `buildability_gate_passed=false`, `open_blocker_count=2` | `true`, `0` |
| `node_readiness_report.json` | `blocked_runtime_certification_incomplete` | `ready_for_node_compile` |
| `pnc019_certification_receipt.json` | `pass` but stale (2026-07-06) | Fresh `pass` with current `source_hashes` |
| `readiness_blockers.jsonl` | IRB-005 L5, IRB-011 L11 `status=closed` (historical) | No new rows; effective reopen via regen only |
| `_audit_status_index.json` | `current_reopened_finding_count=2` | `0` |

---

## Regen command reference (fixed point)

Per `FIXED_POINT_CLOSURE_RUNBOOK.md` Phase 5 — repeat until hashes stable:

```bash
python scripts/pm-plan-migration.py
python scripts/pm-plan-index.py
python scripts/pm-implementation-readiness.py
python scripts/pm-audit-status-index.py
python scripts/pm-governance-seal.py
python scripts/pm-shard-plans.py
python3 scripts/pm-plans-verify.py run-gates
```

**Note:** Runbook Phase 7 references `python scripts/pm-implementation-readiness.py --validate-gates`; that flag is **not implemented**. Use `python3 scripts/pm-plans-verify.py run-gates` as the 26-gate authority (PG-060 / shard 034).

---

## Artifacts

| Path | Role |
|---|---|
| `governance/GOVERNANCE_GATES_INVENTORY.md` | This inventory |
| `Plans/.audits/irb-closure/run_gates_live.json` | Latest full `run-gates` JSON snapshot |
| `Plans/.audits/irb-closure/IRB_005_011_APPEND_PLAN.md` | IRB append execution plan |
| `Plans/.audits/irb-closure/IRB_APPEND_ROWS_DRAFT.jsonl` | Draft append payloads (not yet appended) |
| `Plans/.audits/event-authority-2026-08-12/FIXED_POINT_CLOSURE_RUNBOOK.md` | Binding closure sequence |
