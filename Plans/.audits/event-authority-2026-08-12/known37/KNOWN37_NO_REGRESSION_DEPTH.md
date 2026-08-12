# Known37 No-Regression Depth Audit

**Generated:** 2026-08-12T09:29:00Z  
**Source findings:** Known37NoRegression (read-only); materialized here because that role cannot write.  
**Cohort pin:** `Plans/storage-plan.md` RET-K37-ASSIGNMENT-001 / `known37`  
**Live registry:** `Plans/event_family_registry.json` revision `2026-08-04.1`

## Verdict

**DEPTH_INCOMPLETE** — not REGRESSION.

Membership is preserved (37/37 unique, live, census `KEEP_REGISTERED`, no silent mutation). Contract depth is **not** complete: every row still has ABSENT or PARTIAL cells on producer, replay/idempotency, redaction/custody (redaction-only), transitions, consumers/checkpoints, compatibility/withdrawal (legacy-compat only), and oracles.

This artifact does **not** flip `complete_denominator_known` or `contract_depth_complete`.

Classification is **registry-structured only**. `P` means a closed field on the live family object (or exact RET-K37 retention pin). `owner=P` is owner **document refs** (`semantic_owner_doc` / `payload_owner_doc`), not an accountable bound owner ID. RET-K37 companion prose at `Plans/storage-plan.md:17748-17798` was checked: sole writers, replay/idempotency/redaction/identity, v1 compatibility/quarantine, storage transitions/checkpoint actions, and normative positive/negative oracle IDs remain **LISTED_ONLY** (L) via owner/source refs — they are not lost, and they are not structured family fields. That is why the verdict is DEPTH_INCOMPLETE rather than REGRESSION, and why it is not a depth PASS.

## Row-local RET-K37 companion mapping (storage-plan.md:17748-17798)

Per-event companion prose coverage. `(L)` = LISTED_ONLY via owner/source refs (not a structured registry family field). Rows without companion prose have `—` (their absent fields are genuinely absent, not lost).

| event_type | companion coverage |
|---|---|
| `goal.blocked` | writer(L), replay/idempotency(L), redaction/identity(L); oracle IDs(L) |
| `goal.cancelled` | writer(L), replay/idempotency(L), redaction/identity(L); oracle IDs(L) |
| `goal.child_status_changed` | writer(L), replay/idempotency(L), redaction/identity(L); oracle IDs(L) |
| `goal.completed` | writer(L), replay/idempotency(L), redaction/identity(L); oracle IDs(L) |
| `goal.created` | writer(L), replay/idempotency(L), redaction/identity(L); oracle IDs(L) |
| `goal.degraded` | writer(L), replay/idempotency(L), redaction/identity(L); oracle IDs(L) |
| `goal.evidence_captured` | writer(L), replay/idempotency(L), redaction/identity(L); oracle IDs(L) |
| `goal.progressed` | writer(L), replay/idempotency(L), redaction/identity(L); oracle IDs(L) |
| `goal.receipt_recorded` | writer(L), replay/idempotency(L), redaction/identity(L); oracle IDs(L) |
| `goal.replanned` | writer(L), replay/idempotency(L), redaction/identity(L); oracle IDs(L) |
| `goal.scheduled` | writer(L), replay/idempotency(L), redaction/identity(L); oracle IDs(L) |
| `goal.stopped` | writer(L), replay/idempotency(L), redaction/identity(L); oracle IDs(L) |
| `goal.tool_check_recorded` | writer(L), replay/idempotency(L), redaction/identity(L); oracle IDs(L) |
| `goal.updated` | writer(L), replay/idempotency(L), redaction/identity(L); oracle IDs(L) |
| `goal.verification_decided` | writer(L), replay/idempotency(L), redaction/identity(L); oracle IDs(L) |
| `goal_run.blocked` | writer(L), replay/idempotency(L), redaction/identity(L); oracle IDs(L) |
| `goal_run.cancelled` | writer(L), replay/idempotency(L), redaction/identity(L); oracle IDs(L) |
| `goal_run.certified` | writer(L), replay/idempotency(L), redaction/identity(L); oracle IDs(L) |
| `goal_run.replanned` | writer(L), replay/idempotency(L), redaction/identity(L); oracle IDs(L) |
| `goal_run.started` | writer(L), replay/idempotency(L), redaction/identity(L); oracle IDs(L) |
| `goal_run.stopped` | writer(L), replay/idempotency(L), redaction/identity(L); oracle IDs(L) |
| `platform.capability_evaluated` | v1 compatibility bindings(L) |
| `restore_point.applied` | oracle IDs(L) |
| `restore_point.corrupt` | v1 compatibility bindings(L); oracle IDs(L) |
| `restore_point.created` | oracle IDs(L) |
| `restore_point.deleted` | oracle IDs(L) |
| `restore_point.expired` | oracle IDs(L) |
| `run.started` | v1 compatibility bindings(L) |
| `safe_point.recovery_unavailable` | v1 compatibility bindings(L); oracle IDs(L) |
| `seglog.event_appended` | oracle IDs(L) |
| `storage.boot_recovery` | v1 compatibility bindings(L); storage writer semantics(L); oracle IDs(L) |
| `storage.compaction_lifecycle_changed` | oracle IDs(L) |
| `storage.deletion_lifecycle_changed` | oracle IDs(L) |
| `storage.integrity_detected` | v1 compatibility bindings(L); storage writer semantics(L); oracle IDs(L) |
| `storage.recovery_applied` | v1 compatibility bindings(L); storage writer semantics(L); oracle IDs(L) |
| `storage.retention_hold_changed` | oracle IDs(L) |
| `storage.value_quarantine_changed` | oracle IDs(L) |

Coverage groups:
- **Goal cohort** (21 rows `goal.*` + `goal_run.*`): sole writers, replay/idempotency, redaction/identity — all LISTED_ONLY.
- **v1 compatibility bindings** (7 rows): `platform.capability_evaluated`, `restore_point.corrupt`, `run.started`, `safe_point.recovery_unavailable`, `storage.boot_recovery`, `storage.integrity_detected`, `storage.recovery_applied`.
- **Storage writer semantics** (3 rows): `storage.boot_recovery`, `storage.integrity_detected`, `storage.recovery_applied`.
- **Oracle IDs** (35 rows): goal cohort + storage/restore_point/seglog/safe_point families per 17798.
- **No companion** (0 rows): none (restore_point.* rows carry oracle IDs/listed-only companion prose; absent fields are genuinely absent, not lost).

Companion prose does not elevate these fields to structured `P`; it confirms they are LISTED_ONLY (L) rather than lost (which would be REGRESSION).

## Counts

| Metric | Value |
|--------|------:|
| Rows | 37 |
| Unique in cohort | 37 |
| Present in live registry (exactly 1 family each) | 37 |
| Census `KEEP_REGISTERED` | 37 |
| Family revision | 2.0.0 (all) |
| Payload REF | 28 |
| Payload INLINE | 9 |
| Contract-field cells (12 × 37) | 444 |
| PASS (P) | 185 |
| PARTIAL | 74 |
| ABSENT (A) | 185 |
| Cells not complete (PARTIAL + A) | 259 |
| Row verdict DEPTH_INCOMPLETE | 37 |
| Row verdict REGRESSION | 0 |

## Legend

| Code | Meaning |
|------|---------|
| P | PASS |
| PARTIAL | Present but incomplete vs full Event Authority contract |
| A | ABSENT / not machine-checkable here |
| REF | `payload_schema_ref` |
| INLINE | `inline_payload_schema` |
| unique | Exactly one Known37 cohort membership for this `event_type` |
| live | Exactly one live registry family for this `event_type` |

Uniform field codes (all 37 rows):

- membership/version (M/V): **P**
- owner: **P** (doc refs only; no invented owner ID)
- producer: **A**
- closed payload schema: **P**
- scope/identity: **P**
- replay/idempotency: **A**
- retention: **P** (no RET-K37 regression)
- redaction/custody: **PARTIAL** (redaction only)
- transitions: **A**
- consumers/checkpoints: **A**
- compatibility/withdrawal: **PARTIAL** (legacy compat only)
- positive/negative oracles: **A**
- row verdict: **DEPTH_INCOMPLETE**

## Retention groups (no RET-K37 regression)

| Group | Count | Members |
|-------|------:|---------|
| AUTH-INDEF | 23 | all 15 `goal.*`; `goal_run.blocked`, `goal_run.cancelled`, `goal_run.certified`, `goal_run.stopped`; `storage.deletion_lifecycle_changed`, `storage.integrity_detected`, `storage.retention_hold_changed`, `storage.value_quarantine_changed` |
| OP-2555D | 4 | `platform.capability_evaluated`, `storage.boot_recovery`, `storage.compaction_lifecycle_changed`, `storage.recovery_applied` |
| RESTORE90 | 5 | all 5 `restore_point.*` |
| RUNTIME365 | 3 | `goal_run.replanned`, `goal_run.started`, `run.started` |
| SAFE90 | 1 | `safe_point.recovery_unavailable` |
| SEGLOG7 | 1 | `seglog.event_appended` |

## 37-row depth table

| # | event_type | unique | live | census | rev | payload | ret | M/V | owner | prod | pay | scp | rpl | retn | red | trn | con | cpt | orl | verdict |
|--:|------------|:------:|:----:|--------|-----|---------|-----|:---:|:-----:|:----:|:---:|:---:|:---:|:----:|:---:|:---:|:---:|:---:|:---:|---------|
| 1 | `goal.blocked` | YES | YES (1) | KEEP_REGISTERED | 2.0.0 | REF | AUTH-INDEF | P | P | A | P | P | A | P | PARTIAL | A | A | PARTIAL | A | DEPTH_INCOMPLETE |
| 2 | `goal.cancelled` | YES | YES (1) | KEEP_REGISTERED | 2.0.0 | REF | AUTH-INDEF | P | P | A | P | P | A | P | PARTIAL | A | A | PARTIAL | A | DEPTH_INCOMPLETE |
| 3 | `goal.child_status_changed` | YES | YES (1) | KEEP_REGISTERED | 2.0.0 | REF | AUTH-INDEF | P | P | A | P | P | A | P | PARTIAL | A | A | PARTIAL | A | DEPTH_INCOMPLETE |
| 4 | `goal.completed` | YES | YES (1) | KEEP_REGISTERED | 2.0.0 | REF | AUTH-INDEF | P | P | A | P | P | A | P | PARTIAL | A | A | PARTIAL | A | DEPTH_INCOMPLETE |
| 5 | `goal.created` | YES | YES (1) | KEEP_REGISTERED | 2.0.0 | REF | AUTH-INDEF | P | P | A | P | P | A | P | PARTIAL | A | A | PARTIAL | A | DEPTH_INCOMPLETE |
| 6 | `goal.degraded` | YES | YES (1) | KEEP_REGISTERED | 2.0.0 | REF | AUTH-INDEF | P | P | A | P | P | A | P | PARTIAL | A | A | PARTIAL | A | DEPTH_INCOMPLETE |
| 7 | `goal.evidence_captured` | YES | YES (1) | KEEP_REGISTERED | 2.0.0 | REF | AUTH-INDEF | P | P | A | P | P | A | P | PARTIAL | A | A | PARTIAL | A | DEPTH_INCOMPLETE |
| 8 | `goal.progressed` | YES | YES (1) | KEEP_REGISTERED | 2.0.0 | REF | AUTH-INDEF | P | P | A | P | P | A | P | PARTIAL | A | A | PARTIAL | A | DEPTH_INCOMPLETE |
| 9 | `goal.receipt_recorded` | YES | YES (1) | KEEP_REGISTERED | 2.0.0 | REF | AUTH-INDEF | P | P | A | P | P | A | P | PARTIAL | A | A | PARTIAL | A | DEPTH_INCOMPLETE |
| 10 | `goal.replanned` | YES | YES (1) | KEEP_REGISTERED | 2.0.0 | REF | AUTH-INDEF | P | P | A | P | P | A | P | PARTIAL | A | A | PARTIAL | A | DEPTH_INCOMPLETE |
| 11 | `goal.scheduled` | YES | YES (1) | KEEP_REGISTERED | 2.0.0 | REF | AUTH-INDEF | P | P | A | P | P | A | P | PARTIAL | A | A | PARTIAL | A | DEPTH_INCOMPLETE |
| 12 | `goal.stopped` | YES | YES (1) | KEEP_REGISTERED | 2.0.0 | REF | AUTH-INDEF | P | P | A | P | P | A | P | PARTIAL | A | A | PARTIAL | A | DEPTH_INCOMPLETE |
| 13 | `goal.tool_check_recorded` | YES | YES (1) | KEEP_REGISTERED | 2.0.0 | REF | AUTH-INDEF | P | P | A | P | P | A | P | PARTIAL | A | A | PARTIAL | A | DEPTH_INCOMPLETE |
| 14 | `goal.updated` | YES | YES (1) | KEEP_REGISTERED | 2.0.0 | REF | AUTH-INDEF | P | P | A | P | P | A | P | PARTIAL | A | A | PARTIAL | A | DEPTH_INCOMPLETE |
| 15 | `goal.verification_decided` | YES | YES (1) | KEEP_REGISTERED | 2.0.0 | REF | AUTH-INDEF | P | P | A | P | P | A | P | PARTIAL | A | A | PARTIAL | A | DEPTH_INCOMPLETE |
| 16 | `goal_run.blocked` | YES | YES (1) | KEEP_REGISTERED | 2.0.0 | REF | AUTH-INDEF | P | P | A | P | P | A | P | PARTIAL | A | A | PARTIAL | A | DEPTH_INCOMPLETE |
| 17 | `goal_run.cancelled` | YES | YES (1) | KEEP_REGISTERED | 2.0.0 | REF | AUTH-INDEF | P | P | A | P | P | A | P | PARTIAL | A | A | PARTIAL | A | DEPTH_INCOMPLETE |
| 18 | `goal_run.certified` | YES | YES (1) | KEEP_REGISTERED | 2.0.0 | REF | AUTH-INDEF | P | P | A | P | P | A | P | PARTIAL | A | A | PARTIAL | A | DEPTH_INCOMPLETE |
| 19 | `goal_run.replanned` | YES | YES (1) | KEEP_REGISTERED | 2.0.0 | REF | RUNTIME365 | P | P | A | P | P | A | P | PARTIAL | A | A | PARTIAL | A | DEPTH_INCOMPLETE |
| 20 | `goal_run.started` | YES | YES (1) | KEEP_REGISTERED | 2.0.0 | REF | RUNTIME365 | P | P | A | P | P | A | P | PARTIAL | A | A | PARTIAL | A | DEPTH_INCOMPLETE |
| 21 | `goal_run.stopped` | YES | YES (1) | KEEP_REGISTERED | 2.0.0 | REF | AUTH-INDEF | P | P | A | P | P | A | P | PARTIAL | A | A | PARTIAL | A | DEPTH_INCOMPLETE |
| 22 | `platform.capability_evaluated` | YES | YES (1) | KEEP_REGISTERED | 2.0.0 | REF | OP-2555D | P | P | A | P | P | A | P | PARTIAL | A | A | PARTIAL | A | DEPTH_INCOMPLETE |
| 23 | `restore_point.applied` | YES | YES (1) | KEEP_REGISTERED | 2.0.0 | INLINE | RESTORE90 | P | P | A | P | P | A | P | PARTIAL | A | A | PARTIAL | A | DEPTH_INCOMPLETE |
| 24 | `restore_point.corrupt` | YES | YES (1) | KEEP_REGISTERED | 2.0.0 | REF | RESTORE90 | P | P | A | P | P | A | P | PARTIAL | A | A | PARTIAL | A | DEPTH_INCOMPLETE |
| 25 | `restore_point.created` | YES | YES (1) | KEEP_REGISTERED | 2.0.0 | INLINE | RESTORE90 | P | P | A | P | P | A | P | PARTIAL | A | A | PARTIAL | A | DEPTH_INCOMPLETE |
| 26 | `restore_point.deleted` | YES | YES (1) | KEEP_REGISTERED | 2.0.0 | INLINE | RESTORE90 | P | P | A | P | P | A | P | PARTIAL | A | A | PARTIAL | A | DEPTH_INCOMPLETE |
| 27 | `restore_point.expired` | YES | YES (1) | KEEP_REGISTERED | 2.0.0 | INLINE | RESTORE90 | P | P | A | P | P | A | P | PARTIAL | A | A | PARTIAL | A | DEPTH_INCOMPLETE |
| 28 | `run.started` | YES | YES (1) | KEEP_REGISTERED | 2.0.0 | REF | RUNTIME365 | P | P | A | P | P | A | P | PARTIAL | A | A | PARTIAL | A | DEPTH_INCOMPLETE |
| 29 | `safe_point.recovery_unavailable` | YES | YES (1) | KEEP_REGISTERED | 2.0.0 | REF | SAFE90 | P | P | A | P | P | A | P | PARTIAL | A | A | PARTIAL | A | DEPTH_INCOMPLETE |
| 30 | `seglog.event_appended` | YES | YES (1) | KEEP_REGISTERED | 2.0.0 | INLINE | SEGLOG7 | P | P | A | P | P | A | P | PARTIAL | A | A | PARTIAL | A | DEPTH_INCOMPLETE |
| 31 | `storage.boot_recovery` | YES | YES (1) | KEEP_REGISTERED | 2.0.0 | REF | OP-2555D | P | P | A | P | P | A | P | PARTIAL | A | A | PARTIAL | A | DEPTH_INCOMPLETE |
| 32 | `storage.compaction_lifecycle_changed` | YES | YES (1) | KEEP_REGISTERED | 2.0.0 | INLINE | OP-2555D | P | P | A | P | P | A | P | PARTIAL | A | A | PARTIAL | A | DEPTH_INCOMPLETE |
| 33 | `storage.deletion_lifecycle_changed` | YES | YES (1) | KEEP_REGISTERED | 2.0.0 | INLINE | AUTH-INDEF | P | P | A | P | P | A | P | PARTIAL | A | A | PARTIAL | A | DEPTH_INCOMPLETE |
| 34 | `storage.integrity_detected` | YES | YES (1) | KEEP_REGISTERED | 2.0.0 | REF | AUTH-INDEF | P | P | A | P | P | A | P | PARTIAL | A | A | PARTIAL | A | DEPTH_INCOMPLETE |
| 35 | `storage.recovery_applied` | YES | YES (1) | KEEP_REGISTERED | 2.0.0 | REF | OP-2555D | P | P | A | P | P | A | P | PARTIAL | A | A | PARTIAL | A | DEPTH_INCOMPLETE |
| 36 | `storage.retention_hold_changed` | YES | YES (1) | KEEP_REGISTERED | 2.0.0 | INLINE | AUTH-INDEF | P | P | A | P | P | A | P | PARTIAL | A | A | PARTIAL | A | DEPTH_INCOMPLETE |
| 37 | `storage.value_quarantine_changed` | YES | YES (1) | KEEP_REGISTERED | 2.0.0 | INLINE | AUTH-INDEF | P | P | A | P | P | A | P | PARTIAL | A | A | PARTIAL | A | DEPTH_INCOMPLETE |

## INLINE payload families (9)

`restore_point.applied`, `restore_point.created`, `restore_point.deleted`, `restore_point.expired`, `seglog.event_appended`, `storage.compaction_lifecycle_changed`, `storage.deletion_lifecycle_changed`, `storage.retention_hold_changed`, `storage.value_quarantine_changed`.

`restore_point.corrupt` is REF (not INLINE). Remaining 28 families are REF.

## Non-claims

- Does **not** close the Event Authority denominator (`complete_denominator_known` remains false).
- Does **not** close the Event Authority contract-depth checkpoint (`contract_depth_complete` remains false).
- Does **not** change live `Plans/event_family_registry.json` membership or revision.
- Does **not** produce or substitute the PNC-019 certification receipt.
- Does **not** apply owner decisions or invent owner/producer IDs.
- Does **not** enable runtime or buildability.
- Does **not** bulk-register families.
- Preservation of 37/37 live membership is **not** a depth-complete result.

## Related pins

- `known37/KNOWN37_PRESERVATION_REPORT.md` — membership KEEP_REGISTERED (not depth).
- `known37/KNOWN37_PRESERVATION_SUMMARY.json`
- `known37/KNOWN37_FROM_PLANS.json`

## Recheck

**2026-08-12T11:17:24Z** — live `Plans/event_family_registry.json` revision `2026-08-04.1` re-verified against pin `known37` / RET-K37-ASSIGNMENT-001. Membership **37/37** unique live `event_type`s (exactly one family each), census `KEEP_REGISTERED` **37/37**, **0 RET-K37 drift**. Field-depth counts unchanged: P **185** / PARTIAL **74** / A **185** (444 cells; 259 not complete); row verdicts 37 `DEPTH_INCOMPLETE` / 0 `REGRESSION`. Payload REF **28** / INLINE **9**. `generated_at_utc` left at `2026-08-12T09:29:00Z`. Live registry not edited.
