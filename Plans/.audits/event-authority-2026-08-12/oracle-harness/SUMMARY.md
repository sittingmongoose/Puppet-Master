# Oracle Harness Summary

Generated: 2026-08-12T07:00:00Z

## Outcome
- Overall pass: **True**
- Families tested: **39**
- Families passed: **39**
- Families failed: **0**

## Invocation
```bash
python Plans/.audits/event-authority-2026-08-12/oracle-harness/HARNESS.py
```

## Oracle citation surfaces
- `Plans/Contracts_V0.md:3468-3496`
- `Plans/Contracts_V0.md:3441-3445` / `Plans/Contracts_V0.md:3460-3462`
- `Plans/Section15_MVP_Promoted_Features_Spec.md:8496-8518`
- `Plans/storage-plan.md#case-l-7-required-acceptance-oracles`
- `Plans/event_payloads/*.schema.json`

## Per-family status

| Family | Pass | Positive rules | Negative rules |
|---|---:|---:|---:|
| `goal.blocked` | True | 2 | 2 |
| `goal.cancelled` | True | 2 | 2 |
| `goal.child_status_changed` | True | 2 | 2 |
| `goal.completed` | True | 2 | 2 |
| `goal.created` | True | 2 | 2 |
| `goal.degraded` | True | 2 | 2 |
| `goal.evidence_captured` | True | 2 | 2 |
| `goal.progressed` | True | 2 | 2 |
| `goal.receipt_recorded` | True | 2 | 2 |
| `goal.replanned` | True | 2 | 2 |
| `goal.scheduled` | True | 2 | 2 |
| `goal.stopped` | True | 2 | 2 |
| `goal.tool_check_recorded` | True | 2 | 2 |
| `goal.updated` | True | 2 | 2 |
| `goal.verification_decided` | True | 2 | 2 |
| `goal_run.blocked` | True | 2 | 2 |
| `goal_run.cancelled` | True | 2 | 2 |
| `goal_run.certified` | True | 2 | 2 |
| `goal_run.replanned` | True | 2 | 2 |
| `goal_run.started` | True | 2 | 3 |
| `goal_run.stopped` | True | 2 | 2 |
| `platform.capability_evaluated` | True | 2 | 1 |
| `restore_point.applied` | True | 1 | 1 |
| `restore_point.corrupt` | True | 2 | 1 |
| `restore_point.created` | True | 1 | 1 |
| `restore_point.deleted` | True | 1 | 1 |
| `restore_point.expired` | True | 1 | 1 |
| `run.started` | True | 2 | 1 |
| `safe_point.recovery_unavailable` | True | 2 | 1 |
| `seglog.event_appended` | True | 3 | 2 |
| `storage.boot_recovery` | True | 2 | 1 |
| `storage.compaction_lifecycle_changed` | True | 2 | 1 |
| `storage.deletion_lifecycle_changed` | True | 2 | 1 |
| `storage.integrity_detected` | True | 2 | 1 |
| `storage.recovery_applied` | True | 2 | 1 |
| `storage.retention_hold_changed` | True | 2 | 1 |
| `storage.value_quarantine_changed` | True | 2 | 1 |
| `terminal.workgroup_moved` | True | 3 | 2 |
| `workspace.layout_changed` | True | 2 | 2 |

