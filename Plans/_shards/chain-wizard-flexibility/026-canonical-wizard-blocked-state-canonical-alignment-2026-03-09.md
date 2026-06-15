# Shard 026: Canonical Wizard Blocked-State Canonical Alignment (2026-03-09)

Source: `Plans/chain-wizard-flexibility.md`

Source lines: L2162-L2182

Source SHA256: `2035f6da4cb81b7209ab91a00e6e0bb34e981941f1fc67e904f70f72a71c5b64`

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
