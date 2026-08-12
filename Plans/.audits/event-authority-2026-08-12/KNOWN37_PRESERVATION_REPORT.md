# Known37 Preservation Report

**Generated:** 2026-08-12T07:50:00Z
**Verdict:** **PASS** (contract/membership preservation)

## Summary
- Known37 families: **37** (immutable cohort pin `known37`)
- August2 beyond Known37: **2** (`terminal.workgroup_moved`, `workspace.layout_changed`)
- `registered_keep` census rows: **39** = Known37 (37) + August2 (2)
- All Known37 ⊆ `registered_keep`: **true**
- Registry contains all 37 families: **true** (rev 2026-08-04.1)

## Hashes (current pins)
| Artifact | SHA-256 |
|---|---|
| IMMUTABLE_COHORT_PINS.json | `2859343a914ddd943d8db4600aaa869e7f3e8c3723c38730c525e1d4f5e7eec3` |
| census-adjudication/LEDGER.jsonl | `03f36729559c7cb37a24f4bb8cc5562f991a01f3e19afef8dd4f7bf40503a828` |

## Caveat
`CURRENT_SOURCE_INVENTORY` records comment-only drift on 21 Goal/GoalRun payload schema files (`SS-001 Goal schema $comment lift`). Closed payload fields unchanged; refrozen under Known37 honesty policy. This is **not** membership or registry-depth regression.

## Known37 families (37)
1. `goal.blocked`
2. `goal.cancelled`
3. `goal.child_status_changed`
4. `goal.completed`
5. `goal.created`
6. `goal.degraded`
7. `goal.evidence_captured`
8. `goal.progressed`
9. `goal.receipt_recorded`
10. `goal.replanned`
11. `goal.scheduled`
12. `goal.stopped`
13. `goal.tool_check_recorded`
14. `goal.updated`
15. `goal.verification_decided`
16. `goal_run.blocked`
17. `goal_run.cancelled`
18. `goal_run.certified`
19. `goal_run.replanned`
20. `goal_run.started`
21. `goal_run.stopped`
22. `platform.capability_evaluated`
23. `restore_point.applied`
24. `restore_point.corrupt`
25. `restore_point.created`
26. `restore_point.deleted`
27. `restore_point.expired`
28. `run.started`
29. `safe_point.recovery_unavailable`
30. `seglog.event_appended`
31. `storage.boot_recovery`
32. `storage.compaction_lifecycle_changed`
33. `storage.deletion_lifecycle_changed`
34. `storage.integrity_detected`
35. `storage.recovery_applied`
36. `storage.retention_hold_changed`
37. `storage.value_quarantine_changed`
