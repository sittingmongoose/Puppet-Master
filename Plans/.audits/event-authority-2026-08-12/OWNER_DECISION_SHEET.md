# Owner Decision Sheet

**Generated:** 2026-08-12T09:34:17Z
**Campaign:** event-authority-2026-08-12

All irreducible product decisions are batched here. Owner must apply `owner_response` to each decision before the validator can proceed.

---

### AUG-CP-WLC-001

**Theme:** august_consumer_checkpoint_depth
**Event type:** `workspace.layout_changed`

**Question:** Affirm or veto consumer/checkpoint draft for workspace.layout_changed without inventing consumer_id/projector_id/checkpoint_key?

**Options:**
- `AFFIRM_DRAFT_AS_PROPOSED (supply explicit consumer/checkpoint IDs in veto response)`
- `VETO_KEEP_REGISTERED_PROVISIONAL (retain registered_keep; consumers_checkpoints remain UNKNOWN)`
- `RECLASSIFY_OUT_OF_REGISTRY (requires census + registry amendment)`

**Status:** PENDING

---

### AUG-CP-TWM-001

**Theme:** august_consumer_checkpoint_depth
**Event type:** `terminal.workgroup_moved`

**Question:** Affirm or veto consumer/checkpoint draft for terminal.workgroup_moved without inventing consumer_id/projector_id/checkpoint_key?

**Options:**
- `AFFIRM_DRAFT_AS_PROPOSED (supply explicit consumer/checkpoint IDs in veto response)`
- `VETO_KEEP_REGISTERED_PROVISIONAL (retain registered_keep; consumers_checkpoints remain UNKNOWN)`
- `RECLASSIFY_OUT_OF_REGISTRY (requires census + registry amendment)`

**Status:** PENDING

---

### EXCL-OD-done_budget_exceeded

**Theme:** july68_exact_exclusion_reclass
**Event type:** `done.budget_exceeded`

**Question:** Confirm `done.budget_exceeded` remains exact_excluded (july68) or reclassify cohort?

**Options:**
- `CONFIRM_EXACT_EXCLUDE`
- `RECLASSIFY_TO_NON_EXACT`
- `RECLASSIFY_TO_UNRESOLVED_OR_QUARANTINE`

**Status:** PENDING

---

### EXCL-OD-stop_identical_failure

**Theme:** july68_exact_exclusion_reclass
**Event type:** `stop.identical_failure`

**Question:** Confirm `stop.identical_failure` remains exact_excluded (july68) or reclassify cohort?

**Options:**
- `CONFIRM_EXACT_EXCLUDE`
- `RECLASSIFY_TO_NON_EXACT`
- `RECLASSIFY_TO_UNRESOLVED_OR_QUARANTINE`

**Status:** PENDING

---

### EMIT-PERSIST-026

**Theme:** machine_contract_emit_persistence

**Question:** For 26 triple-bound machine-contract emit candidates with Wiring_Matrix obligation but no EventRecord/seglog persistence proof: what is the owner stance?

**Options:**
- `ACCEPT_EMIT_OBLIGATION_ONLY (keep NEEDS_MORE_EVIDENCE; no registry admit)`
- `DEMAND_PERSISTENCE_PROOF_BEFORE_ANY_ADMIT`
- `PER_ROW_VETO_REQUIRED (split into 26 individual decisions)`

**Status:** PENDING

---

### COMPACT-001

**Theme:** persisted_lifecycle_vs_no_persist_wiring

**Question:** Resolve authority conflict for `context.compaction.completed`: production wiring requires no persisted event, while UI_Command_Catalog and Automated_Testing_System name a persisted lifecycle token. Citation deepening cannot choose which authority wins. Do not infer from EMIT-PERSIST-026.

**Options:**
- `KEEP_UNREGISTERED_NO_PERSIST (treat wiring no-persist as controlling; remain outside admitted denominator)`
- `ESCALATE_AS_PERSISTED_FAMILY (requires owner-backed EventRecord/seglog authority + complete EA contract; not supported by current evidence)`
- `RECLASSIFY_UNRESOLVED_PENDING_AUTHORITY (keep NEEDS_MORE_EVIDENCE / quarantine; no admit)`

**Status:** PENDING

---

### J248-VETO-BATCH-252

**Theme:** july248_persisted_unregistered_vetoes

**Question:** For 252 confirmed_persisted_unregistered rows adjudicated NEEDS_OWNER_VETO: confirm quarantine (no registry admit) or escalate subsets?

**Options:**
- `CONFIRM_ALL_QUARANTINE_NO_ADMIT`
- `ESCALATE_SUBSET_FOR_REGISTRY_ADMIT (owner lists event_types)`
- `PER_ROW_REVIEW_REQUIRED`

**Status:** PENDING

---

### J40-VETO-BATCH

**Theme:** july40_unresolved_vetoes

**Question:** For unresolved july40 rows (excluding emit candidates) with NEEDS_OWNER_VETO: confirm remain unresolved/quarantine?

**Options:**
- `CONFIRM_UNRESOLVED_NO_ADMIT`
- `ESCALATE_SUBSET`
- `PER_ROW_REVIEW`

**Status:** PENDING

---
