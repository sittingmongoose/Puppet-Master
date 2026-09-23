# BSD lifecycle family registration spec — ready-to-apply annex for the Storage-registry-owner lane

**Status: PROPOSAL INPUT — not a registration, not an admission, not canon.** This annex exists because matrix row `CCR-01-REG` records the BSD lifecycle persistence registration as BLOCKED with named owners. Every field below is a proposed value derived from live sibling conventions (`bsd_runtime_record`, `execution_schedule`, `execution_schedule_run_binding` family rows; SP-318 disposition `scd.back_seat_driver.durable.v1`; BSD §16 restart-restoration rule) so the owner lane can execute without re-derivation. The owner lane adjudicates every value; nothing here binds it.

## 0. Why this cannot land in a repair wave (exception mechanics)

The DL-039 scoped landing exception (`reports/event-authority-20260911/landing-record-20260923.md`, item 1) excuses only findings **"also present on `main` with the same error, path and family."** Registering six new physical families mints **new per-family readiness findings** (secret-material scans, value-schema shape checks, required-field checks, census/tier/status-count rows) that by definition are *not* present on main — they fall **outside any existing exception** and would require a fresh central ruling even if the count pins were current. Combined with the stale validator pins (`STORAGE_VALUE_REGISTRY_EXPECTED_FAMILY_COUNT = 88` vs live 294; `EXPECTED_RETENTION_POLICY_COUNT = 24` vs live 27; `EXPECTED_STATUS_COUNTS.materialized = 66`) and SP-251's negative constraint against silently changing the readiness-enforced denominator, registration is not landable by a repair wave in any case. Sequence below.

## 1. Prerequisites (ordered)

1. **Owner-lane pin repair first** (`fix/storage-registry-repairs-20260923`, cut at `dca3c3349e`): re-pin or adjudicate `EXPECTED_FAMILY_COUNT`/`EXPECTED_RETENTION_POLICY_COUNT`/`EXPECTED_STATUS_COUNTS`/`EXPECTED_TIER_COUNTS` against live main and clear the 45 DL-039-exceptioned findings.
2. **An authorized wave** (owner lane or Jared-directed) registers the six families with the rows below, updates the pins in the same change, and lands under either a clean check or a fresh scoped ruling covering the newly minted per-family findings.
3. **Event Authority adjudication stays separate**: nothing in family registration admits EventRecords; the fifteen `bsd.*` event names remain in the CS-078 `required` queue under `UNKNOWN_OPEN` (no bulk registration). The disposition row's `event_effect_policy` changes only by that adjudication.
4. **Designated Plans agent reseals** after the registration wave (Spec Lock/evidence/readiness for registry + storage-plan + BSD + this annex's consumed rows).

## 2. Proposed family rows (six)

Common fields: `storage_kind: redb`; `status`: register as `materialized` only when a native writer is admitted — until then the SP-318 disposition's `physical_family_registration_pending` remains the machine truth and these rows do not exist; `schema_version: "1.0.0"`; `encoding: json_canonical` (sibling `execution_schedule` convention; `bsd_runtime_record` uses `messagepack_canonical` — owner lane picks per family); `owner_doc: Plans/Back_Seat_Driver.md#16-typed-records` (+ `Plans/storage-plan.md#SP-318` lineage); `producer: ["BackSeatDriverService"]` (proposed; admission of any writer is a separate authorization); `consumers`: per family below; `compatibility_key_shapes: []` (no predecessors exist — the disposition row's `migration_rule` already records that `bsd_runtime_record` is not a lifecycle migration input); `required_fields` = the def's full `required` list; `nullable_fields` per def; `optional_fields: []` (every def is `additionalProperties:false` with all fields required).

| family_id | proposed key_shape | value_schema_id | value_schema_ref | proposed tier |
|---|---|---|---|---|
| `bsd_policy` | `bsd_policy.v1:{hex(storage_instance_id)}:{hex(project_id)}` | `pm.bsd.policy.v1` | `Plans/back_seat_driver_contracts.schema.json#/$defs/bsd_policy` | later_gui_or_feature_projection |
| `bsd_workflow_binding` | `bsd_workflow_binding.v1:{hex(storage_instance_id)}:{hex(project_id)}:{hex(binding_id)}` | `pm.bsd.workflow_binding.v1` | `…#/$defs/bsd_workflow_binding` | later_gui_or_feature_projection |
| `bsd_assignment` | `bsd_assignment.v1:{hex(storage_instance_id)}:{hex(project_id)}:{hex(bsd_assignment_id)}` | `pm.bsd.assignment.v1` | `…#/$defs/bsd_assignment` | later_gui_or_feature_projection |
| `bsd_review_cycle` | `bsd_review_cycle.v1:{hex(storage_instance_id)}:{hex(project_id)}:{hex(review_cycle_id)}` | `pm.bsd.review_cycle.v1` | `…#/$defs/bsd_review_cycle` | later_gui_or_feature_projection |
| `bsd_finding` | `bsd_finding.v1:{hex(storage_instance_id)}:{hex(project_id)}:{hex(bsd_finding_id)}` | `pm.bsd.finding.v1` | `…#/$defs/bsd_finding` | later_gui_or_feature_projection |
| `bsd_quarantine` | `bsd_quarantine.v1:{hex(storage_instance_id)}:{hex(project_id)}:{hex(quarantine_id)}` | `pm.bsd.quarantine.v1` | `…#/$defs/bsd_quarantine` | later_gui_or_feature_projection |

Nullable fields (from the defs): policy — `requested_model_id`, `requested_persona_id`, `project_watch_instructions_ref`, `stage_defaults_ref`; workflow_binding — stage-binding `requested_advisor_ref`/`effective_advisor_ref` (nested); assignment — `requested_effective_snapshot_ref`; review_cycle — `usage_attempt_ref`, `latency_ms`, `no_call_reason`; finding — `closed_reason`; quarantine — none.

Secondary-index requirement (proposal): `bsd_finding` needs a `finding_key` → active-finding lookup to serve the owner's deduplication obligation (BSD §7); `bsd_assignment` needs a `(binding_id, stage_id)` current-assignment lookup. Index registration is part of the same owner-lane row work.

## 3. Replay / recovery / migration (per family, proposed)

- **replay_behavior** (all six): "Restore exact canonical bytes from a verified mandatory backup; absence or corruption stays a disclosed recovery failure — never recovered as success (Back_Seat_Driver.md §16: absence of evidence is never recovered as success; a nonterminal assignment that cannot be reconciled becomes `failed` with an explicit reason rather than silently `idle`)."
- **recovery_disposition** (all six, proposed): `authority_class: canonical_non_rebuildable`, `backup_required: true` — held findings, closed keys, epochs, cursors, quarantine counters, and policy/binding revisions are restart-restoration obligations (BSD §16 L313; disposition `hold_rule`); none is a rebuildable projection.
- **migration** (all six): the sibling StorageMigrationCoordinator pattern (transactional create/copy-forward of the exact-key family, bundled owner-schema validation, backup/rebuild-basis verification, store version written last; no lazy rewrite-on-read). No predecessor families exist; `migration_rule` in the disposition row already forbids treating `bsd_runtime_record` as a migration input.

## 4. Retention (proposed requirements; policy rows are owner-lane decisions)

- `bsd_finding`, `bsd_quarantine`: indefinite, `hold_eligible: true`, `expiry_action: none` — the disposition's `expiry_rule` forbids erasing closure or quarantine evidence required for audit. Proposed basis: `RP-AUTHORITY-INDEFINITE`-class policy or a new `RP-BSD-CLOSURE-EVIDENCE-INDEFINITE`.
- `bsd_policy`, `bsd_workflow_binding`: current-state rows, indefinite while the project binding lives; project-removal archival is an owner-lane decision (interacts with the quarantine-cleanup card `step-08-quarantine-cleanup-card.md` pending with Jared).
- `bsd_assignment`, `bsd_review_cycle`: bounded-retention candidates (superseded epochs/cycles) — cardinality or TTL bounds are owner-lane decisions; the restart-restoration obligation bounds how aggressively epochs may be dropped.
- Any new policy rows change `EXPECTED_RETENTION_POLICY_COUNT` (pin repair prerequisite #1).

## 5. Readiness pin deltas produced by this registration (for the same-change pin update)

- `STORAGE_VALUE_REGISTRY_EXPECTED_FAMILY_COUNT`: live 294 → 300.
- `EXPECTED_STATUS_COUNTS.materialized`: +6 (if registered as materialized).
- `EXPECTED_TIER_COUNTS.later_gui_or_feature_projection`: +6 (as proposed).
- `EXPECTED_RETENTION_POLICY_COUNT`: 24 (stale pin; live 27) → 27+N per §4 decisions.
- The wave-2 closure suite pins `len(REGISTRY["families"]) == 294` (`BsdLifecycleRecordClosureTests.test_disposition_row_bound_and_bounded`) and `test_bsd_registration_stays_blocked_pending_authority` pins the pending disposition + zero BSD lifecycle families: **the registration wave must update both pins in the same change** (the tripwire is designed to fail exactly then, forcing the payload/registration evidence to land together).

## 6. What registration does NOT change

- `event_effect_policy` stays `receipt_only_no_eventrecord_pending_event_authority` until Event Authority adjudicates the fifteen `bsd.*` names individually.
- CS-078 `cmd.bsd.*` rows keep `handler_unavailable` until handler authorization; the schema file's absent command defs stay absent (TruthBoundary-pinned).
- The disposition row `scd.back_seat_driver.durable.v1` flips `physical_family_status` only when the rows above are admitted; its `existing_family_refs` pointer to `bsd_runtime_record` remains (the completed-review summary keeps its own separate role; non-folding is test-pinned).
