# IRB-005 / IRB-011 Closure Append Plan

**Generated:** 2026-08-12T11:22:00Z (refreshed)  
**Scope:** Append-only repair of semantic closure for IRB-005 (`runtime_lifecycle`) and IRB-011 (`clean_room_harness`) after Event Authority (EA) validator `pass=true`.  
**Constraint:** Do **not** rewrite historical reopened rows; do **not** run PNC-019 harness in this planning step; do **not** append duplicate `blocker_id` rows to `readiness_blockers.jsonl`.  
**Cross-ref:** 26-gate inventory → `governance/GOVERNANCE_GATES_INVENTORY.md`; latest gate snapshot → `Plans/.audits/irb-closure/run_gates_live.json`.

---

## 1. Current authority snapshot

| Artifact | Current state | Blocks closure? |
|---|---|---|
| `Plans/.audits/_audit_status_index.json` | `current_reopened_finding_count=2`, `current_blocker_count=2` | Yes |
| `Plans/.audits/_semantic_closure_registry.jsonl` L736–737 | `closure_status: reopened` | Yes |
| `Plans/.implementation_readiness/buildability_gate_report.json` | `buildability_gate_passed=false`, `open_blocker_count=2` | Yes |
| `Plans/.plan_index/node_readiness_report.json` | `status=blocked_runtime_certification_incomplete` | Yes |
| `Plans/.implementation_readiness/pnc019_certification_receipt.json` | `status=pass`, `generated_at_utc=2026-07-06` (stale) | Yes |
| `Plans/.audits/event-authority-2026-08-12/independent-validator/receipts/event_authority_validator_receipt.json` | `pass=false`, `seal_prerequisites_met=false`, `generated_at_utc=2026-08-12T11:06:09Z` | **Primary gate** |
| `governance/GOVERNANCE_GATES_INVENTORY.md` | 22/26 pass; 4 fail (`implementation_readiness`, `audit_closure`, + infra) | Yes (Phase 7) |
| `Plans/.audits/event-authority-2026-08-12/closed-world-census/denominator/FRESH_CENSUS_DENOMINATOR.json` | `closed=false` | Yes |
| `Plans/.audits/event-authority-2026-08-12/oracle-harness/ORACLE_HARNESS_RECEIPT.json` | `pass=true` (39/39) | Partial |
| `Plans/.implementation_readiness/readiness_blockers.jsonl` L5, L11 | IRB-005 / IRB-011 `status=closed` (historical) | No append target |

---

## 2. Reopened rows to preserve (never rewrite)

| Line | `closure_id` | `finding_key` | IRB |
|---:|---|---|---|
| **736** | `reopen-fable-20260706-remaining-registry-pnc019-20260810` | `sfk-5e3e2e181221c2aeea675f79` | IRB-005 |
| **737** | `reopen-fable-20260706-pnc019-currentness-20260810` | `sfk-8d83d4bcc29328c680b11986` | IRB-005 + IRB-011 |

Prior repaired predecessors (preserved): L471 (`sfk-5e3e2e181221c2aeea675f79`), L735 (`sfk-8d83d4bcc29328c680b11986`).

Reopen rationale (from `_audit_status_index.json`):

- **L736:** stale PNC-019 receipt bindings; unresolved event-family denominator; node readiness blocked; buildability gate false.
- **L737:** stale governed PNC-019 receipt; EA denominator `UNKNOWN_OPEN`; IRB-005 and IRB-011 effectively open.

---

## 3. Append target

Append two `closure_status: repaired` rows to `Plans/.audits/_semantic_closure_registry.jsonl` (next lines **738–739** at time of writing).

| Row | Proposed `closure_id` | Supersedes | `finding_key` |
|---|---|---|---|
| 1 | `repair-ea-20260812-fable-20260706-remaining-registry-pnc019-20260810` | `reopen-fable-20260706-remaining-registry-pnc019-20260810` | `sfk-5e3e2e181221c2aeea675f79` |
| 2 | `repair-ea-20260812-fable-20260706-pnc019-currentness-20260810` | `reopen-fable-20260706-pnc019-currentness-20260810` | `sfk-8d83d4bcc29328c680b11986` |

Draft (not appended): `Plans/.audits/irb-closure/IRB_APPEND_ROWS_DRAFT.jsonl`

### Registry schema

From `scripts/pm-audit-closure.py`:

- Required fields: L171–191 (`REGISTRY_REQUIRED_FIELDS`)
- Finding identity / `finding_key`: L347–358 (`compute_finding_key`)
- Reopen conditions: L164–170 (all five, unchanged from rows 736/737)

**Identity rule:** keep `finding_family`, `ledger_id`, `source_atom_ids`, `plan_unit_ids`, `owner_docs`, `detail_keys`, and `exact_tokens` identical to reopened rows so `finding_key` matches and supersession chains correctly.

---

## 4. Required evidence pins

### 4.1 EA validator (blocking)

| Pin | Path | Required |
|---|---|---|
| Validator receipt | `Plans/.audits/event-authority-2026-08-12/independent-validator/receipts/event_authority_validator_receipt.json` | `pass=true` |
| Sealed denominator | `Plans/.audits/event-authority-2026-08-12/closed-world-census/denominator/FRESH_CENSUS_DENOMINATOR.json` | `closed=true` |
| Oracle harness | `Plans/.audits/event-authority-2026-08-12/oracle-harness/ORACLE_HARNESS_RECEIPT.json` | `pass=true` |

**Current validator state:** `pass=false`, `seal_prerequisites_met=false`, `closed=false`.

**Current pre-seal blocking errors (9):** `august_checkpoint_veto_pending`, `exclusion_revalidation_incomplete`, `fresh_denominator_admitted_event_types_unspecified`, `individual_dispositions_evidence_gap_blocking`, `individual_dispositions_owner_veto_blocking`, `individual_dispositions_provisional`, `owner_decision_sheet_unresolved`, `registered_contract_depth_incomplete`, `unresolved_bucket_not_closed`.

**Current `validate_implementation_readiness` failures (blocks gate 13/26):** `buildability_gate_report_stale_or_not_canonical`, 15× `pnc019_source_hash_stale`, 2× `event_denominator_unresolved`, 2× `event_family_contract_depth_unresolved`.

**Owner-decision themes represented in the current blockers:** `august_consumer_checkpoint_depth`, `july68_exact_exclusion_reclass`, `machine_contract_emit_persistence`, `persisted_lifecycle_vs_no_persist_wiring`, `july248_persisted_unregistered_vetoes`, `july40_unresolved_vetoes`.

### 4.2 PNC-019 currentness (blocking)

| Pin | Path | Required |
|---|---|---|
| Harness receipt | `Plans/.implementation_readiness/pnc019_certification_receipt.json` | fresh `pass` + current `source_hashes` |
| Positive cases | `.../pnc019_certification_receipt.json#/positive_cases` | all pass |
| Negative cases | `.../pnc019_certification_receipt.json#/negative_cases` | all pass |
| Lifecycle trace | `.../pnc019_certification_receipt.json#/lifecycle_trace` | complete |
| Harness script | `scripts/pm-pnc019-certification-harness.py` | sole producer (**not run in this plan**) |

### 4.3 Readiness projection (after fixed-point regen)

| Pin | Path | Required |
|---|---|---|
| Node readiness | `Plans/.plan_index/node_readiness_report.json` | `ready_for_node_compile` |
| Buildability | `Plans/.implementation_readiness/buildability_gate_report.json` | `buildability_gate_passed=true`, `open_blocker_count=0` |
| Blocker registry | `Plans/.implementation_readiness/readiness_blockers.jsonl` | IRB-005 L5 + IRB-011 L11 only — **no new rows** |

Duplicate `blocker_id` rejected at `scripts/pm-implementation-readiness.py` L7707–7715. Effective reopen is projected in `buildability_gate_report.json` `remaining_open_blockers` until registry append + regen.

### 4.4 FABLE / registry sync (row 1)

- `Plans/.audits/fable-20260706/final_deferred_lane_and_registry_sync_report.json`
- `Plans/.audits/fable-20260706/FINAL_DEFERRED_LANE_AND_REGISTRY_SYNC.md`
- `Plans/.audits/fable-20260706/pnc019_runtime_certification_currentness_report.json`
- Source atom: `fable-20260706-report-l0548-critical-l506-510-registry-itself-states-buildability-gate-passed-false-e29bd955`

### 4.5 Event Authority census (row 2)

- `Plans/event_family_registry.json`
- `Plans/storage-plan.md`
- `Plans/.implementation_readiness/readiness_blockers.jsonl` (hash pin)
- Source atom: `Plans/.implementation_readiness::{IRB-005,IRB-011}`

---

## 5. Blocking dependencies

1. Owner decisions resolved (`OWNER_DECISION_SHEET.json` — 8 pending)
2. EA seal prerequisites (`named_checks.seal_prerequisites_met=true`; diagnostic `pass=false` expected while `closed=false`)
3. Seal `FRESH_CENSUS_DENOMINATOR.json` (`closed=true`, exact admitted `event_types`)
4. **EA validator `pass=true`** (hard gate — do not append before this)
5. Fresh PNC-019 harness receipt (`python scripts/pm-pnc019-certification-harness.py run` — **not run in this plan**)
6. Fixed-point regen per runbook Phase 5 (includes closure hash refresh for historical registry rows)
7. Append 2 repaired registry rows (738–739)
8. `python3 scripts/pm-plans-verify.py run-gates` — all **26** gates pass (see inventory)
9. `scripts/pm-implementation-readiness.py validate` pass (artifact currentness; distinct from product buildability)

---

## 6. Execution sequence (when authorized)

1. Resolve owner decisions and apply all pre-seal prerequisites.
2. Write the proposed nonempty exact admitted `event_types` set while `FRESH_CENSUS_DENOMINATOR.json` remains `closed=false`.
3. Run `pm_event_authority_independent_validator.py` diagnostically until `seal_prerequisites_met=true` (`pass=false` still expected).
4. Seal `FRESH_CENSUS_DENOMINATOR.json` (`closed=true`).
5. Rerun `pm_event_authority_independent_validator.py` until `pass=true`.
6. Run `python scripts/pm-pnc019-certification-harness.py run`.
7. Regenerate to fixed point per `Plans/.audits/event-authority-2026-08-12/FIXED_POINT_CLOSURE_RUNBOOK.md`.
8. Recompute `hashes` / `reopen_hash` on draft rows (placeholders in draft JSONL).
9. Append rows from `Plans/.audits/irb-closure/IRB_APPEND_ROWS_DRAFT.jsonl`; strip draft-only fields (`draft_status`, `supersedes_*`, `irb_*`).
10. Re-validate closure + readiness; confirm `_audit_status_index.json` `current_reopened_finding_count=0`.

---

## 7. Append-row payloads (exact, append-only)

**Source draft:** `Plans/.audits/irb-closure/IRB_APPEND_ROWS_DRAFT.jsonl`  
**Target file:** `Plans/.audits/_semantic_closure_registry.jsonl` (append at next lines 738–739)  
**Strip before append:** `draft_status`, `supersedes_closure_id`, `irb_blocker`, `irb_family`, `supersedes_registry_line`  
**Recompute at append:** `hashes.closure_evidence_hashes`, `hashes.reopen_hash`, `updated_at`

### Row 738 — IRB-005 (`sfk-5e3e2e181221c2aeea675f79`)

| Field | Value |
|---|---|
| `closure_id` | `repair-ea-20260812-fable-20260706-remaining-registry-pnc019-20260810` |
| `closure_status` | `repaired` |
| `finding_key` | `sfk-5e3e2e181221c2aeea675f79` (must match L736) |
| `finding_family` | `fable_remaining_registry_out_of_scope_runtime_certification` |
| `ledger_id` | `fable-remaining-registry-triage-20260708` |
| `closed_by_audit_id` | `event-authority-2026-08-12` |
| Supersedes (append-only) | L736 `reopen-fable-20260706-remaining-registry-pnc019-20260810` |

**`closure_evidence` (12 paths):**

- `Plans/.audits/event-authority-2026-08-12/independent-validator/receipts/event_authority_validator_receipt.json`
- `Plans/.audits/event-authority-2026-08-12/oracle-harness/ORACLE_HARNESS_RECEIPT.json`
- `Plans/.implementation_readiness/pnc019_certification_receipt.json`
- `Plans/.implementation_readiness/buildability_gate_report.json`
- `Plans/.plan_index/node_readiness_report.json`
- `Plans/.audits/event-authority-2026-08-12/closed-world-census/denominator/FRESH_CENSUS_DENOMINATOR.json`
- `Plans/.implementation_readiness/pnc019_certification_receipt.json#/positive_cases`
- `Plans/.implementation_readiness/pnc019_certification_receipt.json#/negative_cases`
- `Plans/.implementation_readiness/pnc019_certification_receipt.json#/lifecycle_trace`
- `Plans/.audits/fable-20260706/FINAL_DEFERRED_LANE_AND_REGISTRY_SYNC.md`
- `Plans/.audits/fable-20260706/final_deferred_lane_and_registry_sync_report.json`
- `Plans/.audits/fable-20260706/pnc019_runtime_certification_currentness_report.json`

**Identity fields (must match L736 exactly):** `source_atom_ids`, `owner_docs`, `plan_unit_ids`, `detail_keys`, `exact_tokens`, `reopen_conditions`.

### Row 739 — IRB-011 (`sfk-8d83d4bcc29328c680b11986`)

| Field | Value |
|---|---|
| `closure_id` | `repair-ea-20260812-fable-20260706-pnc019-currentness-20260810` |
| `closure_status` | `repaired` |
| `finding_key` | `sfk-8d83d4bcc29328c680b11986` (must match L737) |
| `finding_family` | `fable_pnc019_runtime_certification_currentness` |
| `ledger_id` | `pnc019-runtime-certification-currentness-20260708` |
| `closed_by_audit_id` | `event-authority-2026-08-12` |
| `plan_unit_ids` | `["PNC-019"]` |
| Supersedes (append-only) | L737 `reopen-fable-20260706-pnc019-currentness-20260810` |

**`closure_evidence` (16 paths):**

- `Plans/.audits/event-authority-2026-08-12/independent-validator/receipts/event_authority_validator_receipt.json`
- `Plans/.audits/event-authority-2026-08-12/oracle-harness/ORACLE_HARNESS_RECEIPT.json`
- `Plans/.implementation_readiness/pnc019_certification_receipt.json`
- `Plans/.implementation_readiness/buildability_gate_report.json`
- `Plans/.plan_index/node_readiness_report.json`
- `Plans/.audits/event-authority-2026-08-12/closed-world-census/denominator/FRESH_CENSUS_DENOMINATOR.json`
- `Plans/.implementation_readiness/pnc019_certification_receipt.json#/positive_cases`
- `Plans/.implementation_readiness/pnc019_certification_receipt.json#/negative_cases`
- `Plans/.implementation_readiness/pnc019_certification_receipt.json#/lifecycle_trace`
- `Plans/.implementation_readiness/readiness_blockers.jsonl`
- `Plans/event_family_registry.json`
- `Plans/storage-plan.md`
- `Plans/.audits/fable-20260706/PNC019_RUNTIME_CERTIFICATION_CURRENTNESS.md`
- `Plans/.audits/fable-20260706/pnc019_runtime_certification_currentness_report.json`
- `Plans/.audits/fable-20260706/FINAL_DEFERRED_LANE_AND_REGISTRY_SYNC.md`
- `Plans/.audits/fable-20260706/final_deferred_lane_and_registry_sync_report.json`

**Identity fields (must match L737 exactly):** `source_atom_ids`, `owner_docs`, `detail_keys`, `exact_tokens`, `reopen_conditions`.

Full JSONL payloads with placeholder hashes remain in `IRB_APPEND_ROWS_DRAFT.jsonl`.

---

## 8. Non-goals

| Action | Reason |
|---|---|
| Rewrite L736/L737 | Append-only policy |
| Append IRB rows to `readiness_blockers.jsonl` | `duplicate_blocker_id` at L7707–7715 |
| Run PNC harness now | Assignment constraint |
| Trust stale July PNC-019 receipt | Root cause of reopen |
| Manual `buildability_gate_passed=true` | Must follow governed regen |

---

## 9. Artifacts consulted

`Plans/.audits/_audit_status_index.json`, `Plans/.audits/_semantic_closure_registry.jsonl`, `Plans/.implementation_readiness/readiness_blockers.jsonl`, `Plans/.implementation_readiness/pnc019_certification_receipt.json`, `Plans/.implementation_readiness/buildability_gate_report.json`, `Plans/.plan_index/node_readiness_report.json`, `Plans/.audits/event-authority-2026-08-12/` (validator, oracle, census, owner sheet), `Plans/.audits/fable-20260706/PNC019_*`, `Plans/.audits/irb-closure/run_gates_live.json`, `governance/GOVERNANCE_GATES_INVENTORY.md`, `scripts/pm-audit-closure.py`, `scripts/pm-implementation-readiness.py`, `scripts/pm-plans-verify.py`.
