## Runner Preparation/Cleanup and Safe-Point Reconciliation Addendum (2026-03-08)

Any runner prepare/cleanup flow must respect runtime safe points and remediation lineage.

Required rule:
- prepare/cleanup logic must not erase or invalidate the baseline needed for `retry_from_safe_point`
- cleanup after failed runs must preserve enough state for scheduler/runtime recovery until the attempt is terminal or superseded
- temporary cleanup behavior must not collapse blocked/remediation states into generic failure cleanup

Acceptance criteria:
- runner cleanup and safe-point recovery are compatible
- remediation/retry lineage is not lost by generic cleanup routines
