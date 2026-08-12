# Owner Decision Brief — event-authority-2026-08-12

**Generated:** 2026-08-12  
**Source sheet:** `OWNER_DECISION_SHEET.json` / `OWNER_DECISION_SHEET.md` (8 decisions, all `owner_response: null`)  
**Linked packs:** `exclusion-revalidation/EXCL_TWO_OWNER_BRIEF.md`, `individual-disposition/EVIDENCE_GAP_PACK.md`, `individual-disposition/J248_J40_OWNER_PACK.md`

This brief summarizes every irreducible owner decision blocking Event Authority closure. It is for human review only — **do not treat this file as applied authority**; responses must be recorded on `OWNER_DECISION_SHEET.json`.

---

## Before you decide — three campaign facts

1. **Defaults are not self-applied.** Several decisions list a `default_if_no_response` on the sheet, but the independent validator requires an explicit `owner_response.chosen_option` on every decision ID. Until all eight are answered, `owner_decision_sheet_unresolved` remains blocking and `seal_prerequisites_met` stays false.

2. **12 alias rows need no owner decision.** Twelve `RECLASSIFY_ALIAS` rows were rebucketed from `unresolved` to `alias` in `individual-disposition/LEDGER.jsonl`. They are enumerated in `J248_J40_OWNER_PACK.md` and require no sheet ID. Do **not** fold them into `J40-VETO-BATCH`.

3. **Unresolved bucket is now 54 (not 66).** After the alias rebucket, the individual-disposition `unresolved` bucket holds **54 rows**: **28** `NEEDS_OWNER_VETO` (J40 batch) + **26** `NEEDS_MORE_EVIDENCE` (EMIT-PERSIST-026). Census-adjudication is synced: unresolved **54** + alias **12**. Original july40 pin = those 28 veto + 12 alias. The extra 26 unresolved are emit evidence-gap rows disjoint from july40.

---

## Seal gate — downstream blocker families

Answering the sheet clears prerequisites listed in `STATUS.md` and `FIXED_POINT_CLOSURE_RUNBOOK.md`. Each decision affects one or more of these **seal_prerequisites_blocking_errors** families:

| Blocker family | Cleared when |
|---|---|
| `owner_decision_sheet_unresolved` | All 8 decision IDs have explicit `owner_response.chosen_option` |
| `august_checkpoint_veto_pending` | `AUG-CP-WLC-001` and `AUG-CP-TWM-001` answered; August drafts updated |
| `exclusion_revalidation_incomplete` | `EXCL-OD-done_budget_exceeded` and `EXCL-OD-stop_identical_failure` answered; exclusion ledger 94/94 pass |
| `individual_dispositions_provisional` | August decisions applied (only fully clears if `AFFIRM_DRAFT_AS_PROPOSED` or reclassify path chosen for both) |
| `registered_contract_depth_incomplete` | August consumer/checkpoint depth resolved per chosen option |
| `individual_dispositions_evidence_gap_blocking` | `EMIT-PERSIST-026` and `COMPACT-001` answered; ledger dispositions updated |
| `individual_dispositions_owner_veto_blocking` | `J248-VETO-BATCH-252` and `J40-VETO-BATCH` answered; 280 veto rows finalized |
| `unresolved_bucket_not_closed` | J40 batch + evidence-gap rows resolved; unresolved bucket no longer open |
| `fresh_denominator_admitted_event_types_unspecified` | Phase 1 ledger outcomes written; proposed admitted set derived (post-decision application) |

Post-seal only: `fresh_census_denominator_not_closed` (flip `FRESH_CENSUS_DENOMINATOR.json` `closed=true` after prerequisites).

---

## Recommended dependency order

**For owner review (smallest / least coupled first):**

1. `EXCL-OD-done_budget_exceeded` and `EXCL-OD-stop_identical_failure` — two single-row exclusion decisions; unblock 92/94 → 94/94 exclusion revalidation.
2. `COMPACT-001` — one-row authority conflict; **independent of** `EMIT-PERSIST-026` (do not infer compaction stance from emit batch).
3. `EMIT-PERSIST-026` — 26-row emit-vs-persistence stance for unresolved evidence-gap rows.
4. `AUG-CP-WLC-001` and `AUG-CP-TWM-001` — two registered August events; consumer/checkpoint depth and provisional flag.
5. `J248-VETO-BATCH-252` — 252 persisted-unregistered quarantine stance.
6. `J40-VETO-BATCH` — 28 unresolved veto rows (aliases excluded).

**For ledger application after responses exist** (per `FIXED_POINT_CLOSURE_RUNBOOK.md` Phase 1):

1. Record all eight `owner_response` values on the sheet.
2. Apply August outcomes (`AUG-CP-*`) → August drafts + two disposition rows.
3. Apply exclusion outcomes (`EXCL-OD-*`) → exclusion-revalidation 94/94.
4. Apply batch stances (`EMIT-PERSIST-026`, `COMPACT-001`, `J248-VETO-BATCH-252`, `J40-VETO-BATCH`) → `individual-disposition/LEDGER.jsonl`.
5. Derive proposed nonempty admitted `event_types` (still `closed=false`) and re-run diagnostic validator until `seal_prerequisites_met=true`.

---

## Decision 1 — `AUG-CP-WLC-001`

**Theme:** august_consumer_checkpoint_depth  
**Event type:** `workspace.layout_changed`

**Question (verbatim):**  
Affirm or veto consumer/checkpoint draft for workspace.layout_changed without inventing consumer_id/projector_id/checkpoint_key?

**Options (verbatim):**

- `AFFIRM_DRAFT_AS_PROPOSED (supply explicit consumer/checkpoint IDs in veto response)`
- `VETO_KEEP_REGISTERED_PROVISIONAL (retain registered_keep; consumers_checkpoints remain UNKNOWN)`
- `RECLASSIFY_OUT_OF_REGISTRY (requires census + registry amendment)`

**Row coverage:** **1/1** — one August ledger row (`bucket=august`, `disposition=KEEP_REGISTERED`, provisional).

**Downstream blocker families affected:**

- `owner_decision_sheet_unresolved`
- `august_checkpoint_veto_pending`
- `individual_dispositions_provisional`
- `registered_contract_depth_incomplete`
- `fresh_denominator_admitted_event_types_unspecified` (if reclassify or affirm changes admitted candidate)

**Default if no response (not auto-applied):** `BLOCKED — no seal, no PNC-019, no runtime`

---

## Decision 2 — `AUG-CP-TWM-001`

**Theme:** august_consumer_checkpoint_depth  
**Event type:** `terminal.workgroup_moved`

**Question (verbatim):**  
Affirm or veto consumer/checkpoint draft for terminal.workgroup_moved without inventing consumer_id/projector_id/checkpoint_key?

**Options (verbatim):**

- `AFFIRM_DRAFT_AS_PROPOSED (supply explicit consumer/checkpoint IDs in veto response)`
- `VETO_KEEP_REGISTERED_PROVISIONAL (retain registered_keep; consumers_checkpoints remain UNKNOWN)`
- `RECLASSIFY_OUT_OF_REGISTRY (requires census + registry amendment)`

**Row coverage:** **1/1** — one August ledger row (`bucket=august`, `disposition=KEEP_REGISTERED`, provisional).

**Downstream blocker families affected:**

- `owner_decision_sheet_unresolved`
- `august_checkpoint_veto_pending`
- `individual_dispositions_provisional`
- `registered_contract_depth_incomplete`
- `fresh_denominator_admitted_event_types_unspecified` (if reclassify or affirm changes admitted candidate)

**Default if no response (not auto-applied):** `BLOCKED — no seal, no PNC-019, no runtime`

---

## Decision 3 — `EXCL-OD-done_budget_exceeded`

**Theme:** july68_exact_exclusion_reclass  
**Event type:** `done.budget_exceeded`

**Question (verbatim):**  
Confirm `done.budget_exceeded` remains exact_excluded (july68) or reclassify cohort?

**Options (verbatim):**

- `CONFIRM_EXACT_EXCLUDE`
- `RECLASSIFY_TO_NON_EXACT`
- `RECLASSIFY_TO_UNRESOLVED_OR_QUARANTINE`

**Row coverage:** **1/1** — one exclusion-revalidation row and matching census-adjudication row (`disposition=OWNER_DECISION_REQUIRED`). Token is not in `event_family_registry.json`, `Wiring_Matrix.production.json`, or `storage_value_registry.json`.

**Downstream blocker families affected:**

- `owner_decision_sheet_unresolved`
- `exclusion_revalidation_incomplete` (currently 92/94 pass)
- Census denominator seal (exclusion cohort must be coherent before seal)

**Default if no response (not auto-applied):** `CONFIRM_EXACT_EXCLUDE`

---

## Decision 4 — `EXCL-OD-stop_identical_failure`

**Theme:** july68_exact_exclusion_reclass  
**Event type:** `stop.identical_failure`

**Question (verbatim):**  
Confirm `stop.identical_failure` remains exact_excluded (july68) or reclassify cohort?

**Options (verbatim):**

- `CONFIRM_EXACT_EXCLUDE`
- `RECLASSIFY_TO_NON_EXACT`
- `RECLASSIFY_TO_UNRESOLVED_OR_QUARANTINE`

**Row coverage:** **1/1** — one exclusion-revalidation row and matching census-adjudication row. Same-file emit vs alias conflict (`stop.identical_failure` vs `kill.identical_failure`) is owner-only per `EXCL_TWO_OWNER_BRIEF.md`.

**Downstream blocker families affected:**

- `owner_decision_sheet_unresolved`
- `exclusion_revalidation_incomplete` (currently 92/94 pass)
- Census denominator seal

**Default if no response (not auto-applied):** `CONFIRM_EXACT_EXCLUDE`

---

## Decision 5 — `EMIT-PERSIST-026`

**Theme:** machine_contract_emit_persistence

**Question (verbatim):**  
For 26 triple-bound machine-contract emit candidates with Wiring_Matrix obligation but no EventRecord/seglog persistence proof: what is the owner stance?

**Options (verbatim):**

- `ACCEPT_EMIT_OBLIGATION_ONLY (keep NEEDS_MORE_EVIDENCE; no registry admit)`
- `DEMAND_PERSISTENCE_PROOF_BEFORE_ANY_ADMIT`
- `PER_ROW_VETO_REQUIRED (split into 26 individual decisions)`

**Row coverage:** **26/26** — all 26 `NEEDS_MORE_EVIDENCE` rows in the `unresolved` bucket listed in `EVIDENCE_GAP_PACK.md` (Profile A). Sheet explicit membership **0/26**; ledger holes **all 26** enumerated in the pack. Does **not** include `context.compaction.completed` (that is `COMPACT-001`).

**Downstream blocker families affected:**

- `owner_decision_sheet_unresolved`
- `individual_dispositions_evidence_gap_blocking` (27 total evidence-gap rows; this decision covers 26)
- `unresolved_bucket_not_closed`
- `fresh_census_denominator_not_closed` / unresolved emit rows remain outside admitted denominator until resolved

**Default if no response (not auto-applied):** `ACCEPT_EMIT_OBLIGATION_ONLY`

---

## Decision 6 — `COMPACT-001`

**Theme:** persisted_lifecycle_vs_no_persist_wiring

**Question (verbatim):**  
Resolve authority conflict for `context.compaction.completed`: production wiring requires no persisted event, while UI_Command_Catalog and Automated_Testing_System name a persisted lifecycle token. Citation deepening cannot choose which authority wins. Do not infer from EMIT-PERSIST-026.

**Options (verbatim):**

- `KEEP_UNREGISTERED_NO_PERSIST (treat wiring no-persist as controlling; remain outside admitted denominator)`
- `ESCALATE_AS_PERSISTED_FAMILY (requires owner-backed EventRecord/seglog authority + complete EA contract; not supported by current evidence)`
- `RECLASSIFY_UNRESOLVED_PENDING_AUTHORITY (keep NEEDS_MORE_EVIDENCE / quarantine; no admit)`

**Row coverage:** **1/1** — one ledger row (`event_type=context.compaction.completed`, `bucket=confirmed_persisted_unregistered`, `disposition=NEEDS_MORE_EVIDENCE`, Profile B in evidence-gap pack). **Independent of** `EMIT-PERSIST-026`.

**Downstream blocker families affected:**

- `owner_decision_sheet_unresolved`
- `individual_dispositions_evidence_gap_blocking` (1 of 27 evidence-gap rows)
- `fresh_denominator_admitted_event_types_unspecified` (row currently outside admitted set until authority resolved)

**Default if no response (not auto-applied):** `BLOCKED — no seal, no PNC-019, no runtime`

---

## Decision 7 — `J248-VETO-BATCH-252`

**Theme:** july248_persisted_unregistered_vetoes

**Question (verbatim):**  
For 252 confirmed_persisted_unregistered rows adjudicated NEEDS_OWNER_VETO: confirm quarantine (no registry admit) or escalate subsets?

**Options (verbatim):**

- `CONFIRM_ALL_QUARANTINE_NO_ADMIT`
- `ESCALATE_SUBSET_FOR_REGISTRY_ADMIT (owner lists event_types)`
- `PER_ROW_REVIEW_REQUIRED`

**Row coverage:** **252/252** — ledger filter: `bucket=confirmed_persisted_unregistered` AND `disposition=NEEDS_OWNER_VETO`. Sheet explicit membership **0/252**; ledger holes **all 252** enumerated in `J248_J40_OWNER_PACK.md` and mirrored in `OWNER_VETOES.jsonl`.

**Downstream blocker families affected:**

- `owner_decision_sheet_unresolved`
- `individual_dispositions_owner_veto_blocking` (252 of 280 total veto-blocking rows)
- `fresh_denominator_admitted_event_types_unspecified` (quarantine stance keeps rows outside admitted denominator)

**Default if no response (not auto-applied):** `CONFIRM_ALL_QUARANTINE_NO_ADMIT`

---

## Decision 8 — `J40-VETO-BATCH`

**Theme:** july40_unresolved_vetoes

**Question (verbatim):**  
For unresolved july40 rows (excluding emit candidates) with NEEDS_OWNER_VETO: confirm remain unresolved/quarantine?

**Options (verbatim):**

- `CONFIRM_UNRESOLVED_NO_ADMIT`
- `ESCALATE_SUBSET`
- `PER_ROW_REVIEW`

**Row coverage:** **28/28** — ledger filter: `bucket=unresolved` AND `disposition=NEEDS_OWNER_VETO`. Sheet explicit membership **0/28**; ledger holes **all 28** enumerated in `J248_J40_OWNER_PACK.md`. **Excludes** 12 `RECLASSIFY_ALIAS` rows (no owner decision) and 26 EMIT-PERSIST evidence-gap rows.

**Downstream blocker families affected:**

- `owner_decision_sheet_unresolved`
- `individual_dispositions_owner_veto_blocking` (28 of 280 total veto-blocking rows)
- `unresolved_bucket_not_closed`

**Default if no response (not auto-applied):** `CONFIRM_UNRESOLVED_NO_ADMIT`

---

## Coverage summary

| Decision ID | Rows covered | Sheet explicit | Ledger holes |
|---|---:|---:|---|
| `AUG-CP-WLC-001` | 1 | 1/1 (`event_type` on sheet) | 0 |
| `AUG-CP-TWM-001` | 1 | 1/1 | 0 |
| `EXCL-OD-done_budget_exceeded` | 1 | 1/1 | 0 |
| `EXCL-OD-stop_identical_failure` | 1 | 1/1 | 0 |
| `EMIT-PERSIST-026` | 26 | 0/26 | all 26 in pack |
| `COMPACT-001` | 1 | 1/1 (`event_type` in question) | 0 |
| `J248-VETO-BATCH-252` | 252 | 0/252 | all 252 in pack |
| `J40-VETO-BATCH` | 28 | 0/28 | all 28 in pack |

**No sheet decision required:** 12 `RECLASSIFY_ALIAS` rows (alias bucket).  
**Ledger total:** 321 rows — 280 `NEEDS_OWNER_VETO`, 27 `NEEDS_MORE_EVIDENCE`, 12 `RECLASSIFY_ALIAS`, 2 August `KEEP_REGISTERED`.

---

## What happens next (non-binding)

After owner records all eight responses on `OWNER_DECISION_SHEET.json`, apply outcomes per `FIXED_POINT_CLOSURE_RUNBOOK.md` Phase 1. Do **not** seal, claim validator `pass=true`, or enable runtime until `seal_prerequisites_met=true` and the fresh census denominator artifact is explicitly closed in Phase 2.
