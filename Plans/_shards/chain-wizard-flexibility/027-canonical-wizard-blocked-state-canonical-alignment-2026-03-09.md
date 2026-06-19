# Shard 027: Canonical Wizard Blocked-State Canonical Alignment (2026-03-09)

Source: `Plans/chain-wizard-flexibility.md`

Source lines: L2179-L2199

Source SHA256: `0b04946d9ec2c1f17eba863e6167a9df24c398c55901440a71f1b36b4a858cb5`

---

## Canonical Wizard Blocked-State Canonical Alignment (2026-03-09)

See canonical `wizard_status` definition in §2.1.

### Escalation rule
Remain in `attention_required` while the current clarification/review loop can still resolve the issue set inside the current flow.

Escalate to `blocked` when either condition is met:
- `clarification_round_count` reaches `3` without clearing the blocking issues, or
- the next required action can no longer be completed inside the current flow (for example auth recovery, explicit user correction outside the inline form, or replan approval)

### Persisted blocked fields
Persist:
- `blocked_reason_code`
- `clarification_round_count`
- `latest_quality_report_ref`
- `resume_url`
- `attempted_recovery_actions[]`
- `decomposition_degraded`
- degradation reason
- active `replan_generation`
