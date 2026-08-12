# IRB-005 / IRB-011 Append Plan

**Generated:** 2026-08-12T08:10:00Z  
**Audit root:** `Plans/.audits/event-authority-2026-08-12/`

## Blocker definitions

| Blocker | Family | Meaning |
|---|---|---|
| **IRB-005** | `runtime_lifecycle` | Runtime certification / lifecycle evidence incomplete; node readiness blocked |
| **IRB-011** | `clean_room_harness` | PNC-019 clean-room harness receipt missing, stale, or not current with source bindings |

Both blockers were **reopened** (not deleted) when PNC-019 / Event Authority denominator remained unresolved.

## Canonical append target

**Append-only:** `Plans/.audits/_semantic_closure_registry.jsonl`

- Append **two** new `closure_status: repaired` rows superseding the reopened rows at lines **736** and **737** (IRB-005, IRB-011).
- **Do not rewrite** historical `reopened` rows — append repaired successors only.
- Preserve identity fields (`semantic_finding_key`, `blocker_id`, audit refs) so supersession chain retains `sfk-5e3e…` / `sfk-8d83…`.

## Do NOT append to

`Plans/.implementation_readiness/readiness_blockers.jsonl` — `scripts/pm-implementation-readiness.py` rejects duplicate `blocker_id` (lines ~7707–7715). Closure is via semantic registry + readiness regen, not duplicate blocker rows.

## Repaired row schema (from `scripts/pm-audit-closure.py`)

Required fields per repaired closure row:

- `closure_id` (new unique id)
- `closure_status`: `repaired`
- `blocker_id`: `IRB-005` or `IRB-011`
- `audit_ids`, `closed_by_audit_id`
- `closure_evidence` (current governed paths)
- `reopen_conditions` (same five conditions from reopened row)
- Current closure hashes / evidence bindings

## Preconditions (ALL required before append)

1. **All closure prerequisites applied** (`named_checks.seal_prerequisites_met=true`)
2. **Denominator artifact sealed** — `FRESH_CENSUS_DENOMINATOR.json` `closed=true` with exact admitted `event_types`
3. **Independent EA validator** `pass=true` (**post-seal certification**; cannot precede seal)  
   - Receipt: `independent-validator/receipts/event_authority_validator_receipt.json`
4. **Fresh governed PNC-019 harness receipt** `pass=true` (sole receipt producer)  
   - `python scripts/pm-pnc019-certification-harness.py run`  
   - Output: `Plans/.implementation_readiness/pnc019_certification_receipt.json`
5. **Lifecycle + adversarial evidence** current (oracle harness 39/39 pass; node readiness unblocked)
6. **Implementation-readiness validator** pass after fixed-point regen
7. **Owner decisions** resolved — see `OWNER_DECISION_SHEET.md`

## Execution sequence

**Do not** “validator `pass=true` → seal.” That gate is circular: the validator always emits `fresh_census_denominator_not_closed` while `closed=false`.

1. Apply owner decisions and all seal prerequisites (`seal_prerequisites_met=true`; `pass` still `false`)
2. Build/seal `FRESH_CENSUS_DENOMINATOR.json` (`closed=true`, admitted `event_types` exact set)
3. Independent EA validator `pass=true` (post-seal certification)
4. Run PNC-019 harness → fresh receipt
5. Regenerate migration, Plan index, readiness, audit closure/status, shards, evidence, Spec Lock to fixed point
6. Append two repaired rows to `_semantic_closure_registry.jsonl`
7. Re-run implementation-readiness validator; confirm 26 governance gates pass
8. Enable runtime/buildability only if legitimately certified (no hash restamping)

See `FIXED_POINT_CLOSURE_RUNBOOK.md`.

## Non-goals

- No rewriting historical `reopened` rows
- No duplicate IRB rows in `readiness_blockers.jsonl`
- No runtime enable before certification
- No client workspace alteration or historical custody deletion
- No “validator pass → seal” sequencing
