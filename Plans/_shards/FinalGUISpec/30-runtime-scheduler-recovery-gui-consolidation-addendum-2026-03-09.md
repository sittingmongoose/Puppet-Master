## Runtime Scheduler Recovery GUI Consolidation Addendum (2026-03-09)

### Dashboard action-required priority
Canonical priority order:
`wizard_blocked > HITL approval > wizard_attention_required > interrupted > rate limit > warnings`

Earlier Dashboard wording that omits `wizard_blocked` or places it below HITL is superseded.

### Wizard blocked card
Required fields:
- `card_type = wizard_blocked`
- `wizard_id`
- `wizard_step`
- `blocked_reason_code`
- `report_ref`
- `resume_url`
- `thread_id?`

Required behavior:
- more severe treatment than `wizard_attention_required`
- primary action: `Resume Wizard`
- secondary action: `View report`
- auto-dismiss only when the wizard leaves `blocked`

### Thread selector status taxonomy
Thread/run surfaces MUST distinguish:
- `attention_required`
- `blocked`
- `retrying/backoff`
- `remediation`
- terminal failure

A single red status dot for `attention_required` is insufficient and non-canonical.

### Run-surface recovery parity
Dashboard, Run Graph, Orchestrator, and chat surfaces MUST all expose:
- queue-analysis visibility
- blocked-state reason visibility
- safe-point status / restore status when applicable
- remediation lineage navigation
- disabled-action explanations tied to canonical reason codes

### Recovery action UX
- safe points are runtime recovery anchors, not restore points
- `Retry from safe point` and `Start fresh attempt` MUST be distinct visible choices when both are legal
- if no valid safe point exists, `Retry from safe point` is disabled with an explanation
- `Skip` and `Abort` require explicit confirmation copy when they discard resumable work or alter run scope irreversibly

