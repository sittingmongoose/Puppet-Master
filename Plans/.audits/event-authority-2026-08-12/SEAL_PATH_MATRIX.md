# Seal-path matrix — event-authority-2026-08-12

**Generated:** 2026-08-12T11:35:00Z
**Binding inputs:** `independent-validator/pm_event_authority_independent_validator.py` (receipt `2026-08-12T11:10:41Z`), `OWNER_DECISION_SHEET.json`, `PHASE1_APPLY_PLAYBOOK.md`
**This file does not apply owner authority.** It states validator mechanics so owner choices are not made blind.

## Validator predicates that must all be true before `seal_prerequisites_met`

| Predicate | Keys off |
|---|---|
| `no_blocking_owner_veto_dispositions` | zero ledger rows with `disposition=NEEDS_OWNER_VETO` |
| `no_blocking_evidence_gap_dispositions` | zero ledger rows with `disposition=NEEDS_MORE_EVIDENCE` |
| `unresolved_bucket_not_closed` absent | zero ledger rows with `bucket=unresolved` (disposition ignored) |
| `no_provisional_rows` | zero `provisional=true` |
| `registered_rows_full_depth` | every ledger row with `disposition=KEEP_REGISTERED` **or** `event_type` in live registry has all 12 evidence cells PASS with `Plans/` citations and `provisional=false` |
| `exclusion_revalidation_all_rows_pass` | 94/94 exclusion rows `pass=true`, `all_revalidated=true` |
| `owner_decision_sheet_all_applied` | all 8 IDs have `owner_response.chosen_option` exact-matching `options[]` |
| `august_checkpoint_decisions_applied` | both August drafts `veto_status` match the chosen option and are not `PENDING` |
| `fresh_denominator_admitted_event_types_specified` | denominator `event_types` equals IndividualDisposition rows whose `bucket ∈ {confirmed_persisted_unregistered, august}` (must be nonempty) |

Live registry is Known37 + August2 = 39. IndividualDisposition does **not** contain Known37 rows. `registered_like` depth therefore currently means the **two August rows** (they are live and `KEEP_REGISTERED`).

Admitted denominator candidate today = 253 CPU + 2 August = **255**, not Known37.

## Option → seal effect (if applied exactly as playbook)

### Can contribute to a seal (do not by themselves finish it)

| ID | Option token | Clears | Leaves |
|---|---|---|---|
| `EXCL-OD-*` | `CONFIRM_EXACT_EXCLUDE` | that 1/94 exclusion row | sibling EXCL-OD still required |
| `EXCL-OD-*` | `RECLASSIFY_TO_NON_EXACT` | that exclusion row if pin+census+ledger triple is coherent | not admitted |
| `J248-VETO-BATCH-252` | `CONFIRM_ALL_QUARANTINE_NO_ADMIT` | 252× `NEEDS_OWNER_VETO` → `KEEP_QUARANTINED` | those 252 **remain in admitted denominator** (CPU bucket) without live-registry membership and without 12-field PASS. Requirement 6 (complete EA contract for every admitted family) is **not** satisfied for those 252 unless owner explicitly accepts denominator-admit ≠ registry-admit |
| `COMPACT-001` | `KEEP_UNREGISTERED_NO_PERSIST` | this 1 evidence-gap **only if** disposition becomes `KEEP_QUARANTINED` (not `NEEDS_MORE_EVIDENCE`) **and** the row leaves CPU without dropping `july248` pin | pin-coherence refuse is likely; if rebucketed to `unresolved`, `unresolved_bucket_not_closed` gains a row |

### Cannot reach `seal_prerequisites_met` (even after `chosen_option` is recorded)

| ID | Option token | Why seal stays false |
|---|---|---|
| `EMIT-PERSIST-026` | **all three** | all keep `disposition=NEEDS_MORE_EVIDENCE` and `bucket=unresolved` → evidence-gap **and** unresolved-bucket remain |
| `J40-VETO-BATCH` | `CONFIRM_UNRESOLVED_NO_ADMIT` | 28× `KEEP_QUARANTINED` but `bucket` stays `unresolved` → `unresolved_bucket_not_closed` remains |
| `J40-VETO-BATCH` | `ESCALATE_SUBSET` without `event_types` list | refuse; 28 stay `NEEDS_OWNER_VETO` |
| `J40-VETO-BATCH` | `PER_ROW_REVIEW` | no mutation; veto + unresolved remain |
| `J248-VETO-BATCH-252` | `ESCALATE_SUBSET_FOR_REGISTRY_ADMIT` without list | refuse; 252 stay `NEEDS_OWNER_VETO` |
| `J248-VETO-BATCH-252` | `PER_ROW_REVIEW_REQUIRED` | no mutation; 252 stay `NEEDS_OWNER_VETO` |
| `AUG-CP-*` | `AFFIRM_DRAFT_AS_PROPOSED` | playbook **refuses** unless owner supplies cited `consumer_id`, `projector_id`, `checkpoint_key`, `checkpoint_schema`, `checkpoint_version`. Drafts currently have all five **null**. Agent must not invent IDs. Also all 12 evidence cells must become PASS — they are not |
| `AUG-CP-*` | `VETO_KEEP_REGISTERED_PROVISIONAL` | `provisional=true` and `consumers_checkpoints` not PASS → `individual_dispositions_provisional` + `registered_contract_depth_incomplete` remain |
| `COMPACT-001` | `ESCALATE_AS_PERSISTED_FAMILY` | refuse; no complete contract; evidence-gap remains |
| `COMPACT-001` | `RECLASSIFY_UNRESOLVED_PENDING_AUTHORITY` | keeps `NEEDS_MORE_EVIDENCE` and moves to unresolved → both blockers remain |

### August close paths that do not invent IDs

`RECLASSIFY_OUT_OF_REGISTRY` can clear August depth/provisional **only if** the two families leave live `Plans/event_family_registry.json` **and** ledger `disposition` is no longer `KEEP_REGISTERED`. That is a live-registry amendment (not Known37). Known37 must stay 37/37.

## Structural gap (irreducible; not closable by applying the current 8 options)

The 54 unresolved rows (28 J40 + 26 EMIT) have **no current sheet option** that both:

1. leaves them **out of** the admitted denominator (`bucket` not in `{confirmed_persisted_unregistered, august}`), and
2. leaves `bucket != unresolved` and `disposition ∉ {NEEDS_OWNER_VETO, NEEDS_MORE_EVIDENCE}`.

Schema buckets on IndividualDisposition are `confirmed_persisted_unregistered | unresolved | august` (alias exists in the live ledger as a fourth working bucket). There is no `quarantined_not_admitted` bucket.

Therefore **no combination of the current 8 `options[]` can make `seal_prerequisites_met=true`.** Recording `chosen_option` on all 8 IDs clears `owner_decision_sheet_unresolved` only.

Owner must additionally choose a close path for those 54 rows, for example:

1. **New non-admitted quarantine bucket** (schema + validator recognize e.g. `quarantined_not_admitted` / `KEEP_QUARANTINED`; not registry admit; not denominator admit). Fail-closed tracking.
2. **Validator change:** `unresolved` + `KEEP_QUARANTINED` no longer emits `unresolved_bucket_not_closed`, and `NEEDS_MORE_EVIDENCE` may become `KEEP_QUARANTINED` under an explicit owner stance. This weakens the current fail-closed predicates.
3. **Denominator-admit the 252 J248 quarantines** (already implied by `CONFIRM_ALL_QUARANTINE_NO_ADMIT`) **and** move the 54 into CPU `KEEP_QUARANTINED` as well — they become admitted persisted families without complete EA contracts. Conflicts with requirement 6 unless owner redefines “admitted”.
4. **Per-row review** — delay seal; split into 54 new sheet IDs; do not default-quarantine.

Do not bulk-register, infer by analogy, invent consumer/checkpoint IDs, restamp freeze digests, or enable runtime to escape this gap.

## Recommended owner review order (unchanged)

1. Two EXCL-OD rows (can reach 94/94 regardless of the gap)
2. COMPACT-001 (independent of EMIT)
3. EMIT-PERSIST-026 + J40 close-path (the gap)
4. Two AUG-CP rows (AFFIRM only with cited IDs; otherwise reclassify vs veto)
5. J248-VETO-BATCH-252 (quarantine-in-denominator vs escalate-with-list vs per-row)

## Non-claims

- Does not write `owner_response`
- Does not apply defaults
- Does not edit the independent validator
- Does not edit live registry
- Does not seal or run PNC-019
