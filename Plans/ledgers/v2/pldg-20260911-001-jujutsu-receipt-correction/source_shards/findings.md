# F001 — terminal attempt receipts

SCS-003 (Plans/Source_Control_System.md:127–131) requires a typed receipt on every terminal attempt. JJI-003 and §3.2 consume that owner. Current command_result permits null receipt_ref outside succeeded mutations. Add the six-outcome conditional reusing non_secret_ref. Accepted requires ObservableWork; effect_unknown retains null after_revision, typed error, and after_reconciliation. Availability and pre-attempt errors retain nullable identity. Native oplog publication is not required.

Evidence/source reports:
- reports/jujutsu-research-2026-09-11/d3/corrections.md — SHA-256 `200bfe08dbf82ef00cd7984670401ae3d40555f7ce41026c87330dc17444eaf6`
- reports/jujutsu-research-2026-09-11/d3/independent-review.json — SHA-256 `f3b933e4b7258b02d47fc36a199b6dc2cb1b52ec34c56f5f9c1c0c2b3cf72c99`

Exact tokens: succeeded, blocked, failed, cancelled, recovery_required, effect_unknown, accepted, ObservableWork, receipt_ref, non_secret_ref, command_result, command_availability, command_error_record, after_revision, after_reconciliation, JJI-003

Target: Plans/Jujutsu_Integration.md#JJI-003; companion schema and fixtures. No new PlanUnit.
