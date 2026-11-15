# PNC-019 S3, lane s3b: registered Storage, restore, platform and seglog family depth (2026-11-14)

Fresh 12-criterion grades for the 14 registered families last graded on 2026-09-24 (PNC019-SCOPE PLAN.md finding 8), then the owner text that closes their open cells. Rubric unchanged (`step-08-depth42-20260924/rubric.md`), plus the stream E oracle bar: criterion 12 passes only with an executable checker whose guard rows the gated guard tool proves.

- **Before:** `depth-s3b-registered-families-before.json`, graded at the lane base `3c33510c57` (batch-3 integration head; batch 3 was not on `main`). 660 evidence quotes, all exact.
- **After:** `depth-s3b-registered-families.json`, graded at `0ae4c931af` (Plans text identical at the report commit). 709 evidence quotes, all exact. It supersedes the 2026-09-24 rows for these 14 families only.
- **Owner text:** SP-2200..SP-2210 in `Plans/storage-plan.md`, ATS-2200..ATS-2205 in `Plans/Automated_Testing_System.md`; companions `Plans/restore_point_application_corruption_contracts.schema.json`, `Plans/platform_capability_decision_read_output.schema.json`, two appended rows in `Plans/storage_value_registry.json`, and the readiness family-count re-pin (678 to 680).

| Family | 2026-09-24 | Before (3c33510c57) | After | Cells changed | Still open |
|---|---:|---:|---:|---|---|
| `platform.capability_evaluated` | 10/12 | 10/12 | 11/12 | consumers_checkpoints | positive_negative_oracles |
| `restore_point.applied` | 5/12 | 5/12 | 11/12 | producer, scope_identity, replay_idempotency, redaction_custody, consumers_checkpoints, compatibility_withdrawal | positive_negative_oracles |
| `restore_point.corrupt` | 4/12 | 4/12 | 11/12 | producer, scope_identity, replay_idempotency, redaction_custody, transitions, consumers_checkpoints, compatibility_withdrawal | positive_negative_oracles |
| `restore_point.created` | 11/12 | 11/12 | 11/12 | none | positive_negative_oracles |
| `restore_point.expired` | 11/12 | 11/12 | 11/12 | none | positive_negative_oracles |
| `safe_point.recovery_unavailable` | 5/12 | 5/12 | 11/12 | producer, scope_identity, replay_idempotency, redaction_custody, consumers_checkpoints, compatibility_withdrawal | positive_negative_oracles |
| `seglog.event_appended` | 10/12 | 10/12 | 11/12 | owner_doc | positive_negative_oracles |
| `storage.boot_recovery` | 8/12 | 9/12 | 11/12 | transitions, consumers_checkpoints | positive_negative_oracles |
| `storage.compaction_lifecycle_changed` | 9/12 | 10/12 | 11/12 | consumers_checkpoints | positive_negative_oracles |
| `storage.deletion_lifecycle_changed` | 6/12 | 6/12 | 11/12 | producer, scope_identity, replay_idempotency, consumers_checkpoints, compatibility_withdrawal | positive_negative_oracles |
| `storage.integrity_detected` | 11/12 | 11/12 | 11/12 | none | positive_negative_oracles |
| `storage.recovery_applied` | 9/12 | 10/12 | 11/12 | consumers_checkpoints | positive_negative_oracles |
| `storage.retention_hold_changed` | 11/12 | 10/12 | 11/12 | transitions | positive_negative_oracles |
| `storage.value_quarantine_changed` | 5/12 | 5/12 | 10/12 | producer, scope_identity, replay_idempotency, consumers_checkpoints, compatibility_withdrawal | redaction_custody, positive_negative_oracles |

Totals: before {'PASS': 117, 'PARTIAL': 47, 'ABSENT': 4} ; after {'PASS': 153, 'PARTIAL': 15}

Before vs 2026-09-24: four retention cells became PASS (the DL-083/DL-089 application-wide buckets landed on 2026-11-04); two oracle cells that were PASS (platform, legal hold) are PARTIAL on the current bar only.

**No family reaches 12/12.** Criterion 12 is PARTIAL for all 14: ATS-2200..2205 are plans, not executed checks. The remaining per-family gaps are listed in each row's `remaining_gaps`.

**Contingency question S3B-Q1 (owner conflict, for Jared):** when a thread or a Project's data is deleted, Case L-3 purges its content within 24 hours unless held, but an unresolved Q-CRITICAL quarantine is kept indefinitely and never evicted. If one of that thread's or Project's stored values is in quarantine, should deletion purge the quarantined raw bytes too, or keep them in quarantine until the quarantine is resolved? Until answered, `storage.value_quarantine_changed` redaction/custody stays PARTIAL and no interim rule is written.

Native execution is NOT_RUN for every family and lowers no cell. Nothing here registers or admits a family, changes a registry row, or reseals.
