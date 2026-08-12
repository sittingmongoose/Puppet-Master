# Event Authority — Fixed-Point Closure Runbook

**Generated:** 2026-08-12T08:52:00Z  
**Audit root:** `Plans/.audits/event-authority-2026-08-12/`

## Anti-circularity (binding)

**Do not claim “validator `pass=true` → seal.”** That sequence cannot succeed.

The independent validator **unconditionally** emits `fresh_census_denominator_not_closed` while `FRESH_CENSUS_DENOMINATOR.json` has `closed=false` (validator lines that read `if not closed`). Therefore:

| Object | Who produces it | When |
|---|---|---|
| **Artifact seal** (`FRESH_CENSUS_DENOMINATOR.json` `closed=true` + nonempty admitted `event_types`) | Constructed input, after prerequisites | **Before** certification |
| **Checkpoint close** (`complete_denominator_known`, `contract_depth_complete`, `pass`) | Independent validator only | **After** artifact seal |

Requirement 8 (“close denominator and contract-depth checkpoints only through the independent validator”) refers to **checkpoint close**, not artifact construction.

**Executable pre-seal gate:** `named_checks.seal_prerequisites_met=true`  
This is true iff the **only** remaining failure is `fresh_census_denominator_not_closed`.

Empty, unspecified, or mismatched admitted `event_types` are **pre-seal** (`fresh_denominator_admitted_event_types_unspecified`, `fresh_denominator_closed_but_empty_event_types`, `ledger_admitted_persisted_families_set_mismatch`, `proposed_admitted_event_types_empty`). Do **not** seal an empty or wrong set.

While `closed=false`, `pass=false` is **expected**. It is not a reason to delay sealing once `seal_prerequisites_met=true` **and** the proposed admitted set is nonempty and equal to the ledger candidate.

**Correct sequence:** apply all closure prerequisites → write proposed nonempty exact `event_types` → confirm `seal_prerequisites_met=true` → flip `closed=true` → run the validator for `pass=true`.

---

## Phase 0 — Diagnostic validator run (expected `pass=false`)

```bash
python Plans/.audits/event-authority-2026-08-12/independent-validator/pm_event_authority_independent_validator.py
```

Inspect `independent-validator/receipts/event_authority_validator_receipt.json`:

- `pass` will be `false` while `closed=false`
- Use `named_checks.seal_prerequisites_met` and `named_checks.seal_prerequisites_blocking_errors` as the worklist
- Do **not** wait for `pass=true` in this phase

Already-true diagnostics (do not re-open): oracle harness 39/39, md_only adjudication 31/31, census partition/independent-set equality, Known37 membership preservation.

---

## Phase 1 — Apply all closure prerequisites (owner + ledgers)

Execute **only after** owner responses exist in `OWNER_DECISION_SHEET.json`.

1. Record `owner_response` + `applied_at_utc` on every decision in `OWNER_DECISION_SHEET.json`.
2. August checkpoints (`AUG-CP-WLC-001`, `AUG-CP-TWM-001`): update `august-checkpoint-drafts/AUGUST_CHECKPOINT_DRAFTS.jsonl` (`veto_status` ∈ `{AFFIRM_DRAFT_AS_PROPOSED, VETO_KEEP_REGISTERED_PROVISIONAL, RECLASSIFY_OUT_OF_REGISTRY}`; exactly one row per August event) and then regenerate the two individual-disposition rows according to the chosen outcome. `AFFIRM_DRAFT_AS_PROPOSED` must end with `consumers_checkpoints=PASS` and `provisional=false`; `VETO_KEEP_REGISTERED_PROVISIONAL` intentionally leaves `registered_contract_depth_incomplete` and `individual_dispositions_provisional` blocking; `RECLASSIFY_OUT_OF_REGISTRY` requires coherent registry/census/ledger updates before the depth blocker can clear.
3. Exclusion reclass (`EXCL-OD-done_budget_exceeded`, `EXCL-OD-stop_identical_failure`): update `exclusion-revalidation/` so `all_revalidated=true` / 94/94 `pass`.
4. Apply batch stances (`EMIT-PERSIST-026`, `J248-VETO-BATCH-252`, `J40-VETO-BATCH`) onto `individual-disposition/LEDGER.jsonl` without bulk-registering, inferring by analogy, or inventing owner authority.
5. Write the **proposed nonempty exact admitted** `event_types` set onto `closed-world-census/denominator/FRESH_CENSUS_DENOMINATOR.json` **while keeping**:
   - `closed=false`
   - `freeze_digest_sha256` unchanged (do not restamp)
   - unresolved / emit-open rows remain outside the admitted `event_types`

   The admitted set is derived only from `individual-disposition/LEDGER.jsonl` rows with:
   - `bucket ∈ {confirmed_persisted_unregistered, august}`
   - exact, nonempty set equality (no extras, no missing, no duplicates)
6. Re-run the independent validator as a **diagnostic**. Required before Phase 2:
   - `named_checks.seal_prerequisites_met=true`
   - `named_checks.fresh_denominator_closed=false` (still)
   - `pass=false` (still, solely from the open-denominator family)

If `seal_prerequisites_blocking_errors` is nonempty, **do not seal**.

---

## Phase 2 — Build/seal the denominator artifact

**Gate:** Phase 1 `seal_prerequisites_met=true`. Not `pass=true`.

Write/complete `closed-world-census/denominator/FRESH_CENSUS_DENOMINATOR.json`:

1. Keep schema `pm.assurance.event_authority.fresh_census_denominator.v2`.
2. Confirm the admitted `event_types` set is already exact, nonempty, and derived from the Phase 1 ledger candidate rows.
3. Keep unresolved / emit-open rows **only** under `persistence_open_not_admitted` (not in admitted `event_types`).
4. Do **not** admit Known37 `registered_keep`, july68/july26 exclusions, or rejected lexical candidates.
5. Pin `freeze_digest_sha256` to `closed-world-census/CURRENT_SOURCE_INVENTORY.json` `canonical_digest_sha256`.
6. Set `closed=true` and clear `close_blocked_by` only after steps 2–5 are exact.
7. Mirror the admitted set on top-level `event_types` if that alias is still consumed.

Do not restamp hashes to manufacture readiness. Do not enable runtime.

---

## Phase 3 — Certification validator run (`pass=true` is post-seal)

```bash
python Plans/.audits/event-authority-2026-08-12/independent-validator/pm_event_authority_independent_validator.py
```

**Required outputs:**

- `pass=true`
- `complete_denominator_known=true`
- `contract_depth_complete=true`
- `named_checks.fresh_denominator_closed=true`
- `named_checks.ledger_equals_admitted_persisted_families=true`
- `failures=[]`

This is the first moment `pass=true` is a legitimate gate. If it fails, **do not** reopen Phase 2 to flip `closed` without fixing the named mismatch; do not treat a failed receipt as authority to restamp.

---

## Phase 4 — PNC-019 harness (sole receipt producer)

**Gate:** Phase 3 `pass=true`.

```bash
python scripts/pm-pnc019-certification-harness.py run
```

Output: `Plans/.implementation_readiness/pnc019_certification_receipt.json` must be fresh and `pass=true`.

Do not reuse stale receipts or restamp hashes.

---

## Phase 5 — Fixed-point regeneration

Run to convergence (repeat until hashes stable):

```bash
python scripts/pm-plan-migration.py
python scripts/pm-plan-index.py
python scripts/pm-implementation-readiness.py
python scripts/pm-audit-status-index.py
python scripts/pm-governance-seal.py
python scripts/pm-shard-plans.py
```

Verify:

- `Plans/.implementation_readiness/buildability_gate_report.json` — `buildability_gate_passed=true` only if legitimately certified
- `Plans/.plan_index/node_readiness_report.json` — runtime readiness unblocked
- Spec Lock / evidence shards current

---

## Phase 6 — IRB-005 / IRB-011 append (append-only)

**Gate:** Phase 3 validator `pass=true` **and** Phase 4 PNC-019 receipt `pass=true`.

1. Finalize draft rows in `IRB_REPAIRED_ROWS_DRAFT.jsonl` (remove `draft_status`, refresh `hashes.closure_evidence_hashes` from current files).
2. **Append** (do not rewrite) to `Plans/.audits/_semantic_closure_registry.jsonl`.
3. Supersede reopened rows at lines 736–737 without deleting history.

See `IRB_APPEND_PLAN.md`.

---

## Phase 7 — Governance gates (26)

```bash
python scripts/pm-implementation-readiness.py --validate-gates
```

All **26** governance gates must pass before runtime enable.

---

## Phase 8 — Git hygiene + push

```bash
git status   # worktree clean
git log origin/main..HEAD
git push origin main   # fast-forward only
```

---

## Non-goals

- No client workspace alteration
- No historical custody deletion
- No hash restamping to manufacture readiness
- No runtime enable before certification
- No bulk registry admit / invented owner authority
- No “validator pass → seal” sequencing

## Current blockers (2026-08-12T11:10:41Z)

Receipt: `independent-validator/receipts/event_authority_validator_receipt.json` (`generated_at_utc`: **2026-08-12T11:10:41Z**). Owner worklist: `OWNER_DECISION_BRIEF.md` (8 pending sheet IDs). Pin/live identities: `cohort-pins/LIVE_VS_PIN_RECONCILIATION.md`.

- Owner decisions pending — 8 sheet IDs; 2 August checkpoints still `PENDING`
- `seal_prerequisites_met=false` (exclusion revalidation 92/94, owner sheet, August vetoes, 280 owner-veto rows, 27 evidence-gap rows, 54 unresolved = 28 veto + 26 evidence-gap, alias 12 outside unresolved, 2 provisional, August contract depth)
- Artifact `closed=false` — **do not seal** until `seal_prerequisites_met=true`
- Validator `pass=false` is expected until Phase 3
- IRB append blocked until Phases 3–4 complete
