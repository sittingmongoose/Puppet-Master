# PNC-019 harness preconditions

**Generated:** 2026-08-12T10:50:00Z  
**Harness:** `python scripts/pm-pnc019-certification-harness.py run`  
**Receipt:** `Plans/.implementation_readiness/pnc019_certification_receipt.json`

## Hard gates (must pass before harness writes receipt)

1. **Independent EA validator** `pass=true` (post-seal certification only)
   - Receipt: `independent-validator/receipts/event_authority_validator_receipt.json`
   - Current: `pass=false` (2026-08-12T10:47:49Z)

2. **Denominator artifact sealed**
   - `FRESH_CENSUS_DENOMINATOR.json`: `closed=true`, exact nonempty `event_types`
   - Current: `closed=false`, `event_types=null`

3. **Preflight clearance** (`certification_preflight_failures()`)
   - Case L non-event materialization validator pass
   - `pnc019_event_authority_clearance_failures(ROOT)` empty

## What each owner decision unblocks toward harness

| Owner decision | Harness-relevant effect |
|---|---|
| EXCL-OD-* (2) | `exclusion_revalidation_incomplete` → seal prereq |
| EMIT-PERSIST-026 | 26 evidence-gap rows → seal prereq |
| COMPACT-001 | compaction product stance → seal prereq |
| AUG-CP-* (2) | August contract depth → `registered_contract_depth_incomplete` |
| J248 + J40 | 280 owner-veto rows → `individual_dispositions_owner_veto_blocking` |

All 8 required for `seal_prerequisites_met=true`; none alone sufficient.

## Current readiness validate blockers (pre-harness)

- `buildability_gate_report_stale_or_not_canonical` — regen after fixed point
- `pnc019_source_hash_stale` (14 paths) — fresh harness run after EA pass
- `event_denominator_unresolved` / `event_family_contract_depth_unresolved` on registry — closed by EA campaign

## Command

```bash
python scripts/pm-pnc019-certification-harness.py run
```

**Do not run** until Phase 3 EA `pass=true`. Preflight fails closed; no receipt written on failure.

## IRB linkage

- **IRB-005** (`runtime_lifecycle`): repaired row append after harness + validator pass
- **IRB-011** (`clean_room_harness`): repaired row append after fresh PNC-019 receipt `pass=true`

See `IRB_APPEND_PLAN.md` and `IRB_REPAIRED_ROWS_DRAFT.jsonl`.
