## blocked Thread State and Recovery Addendum (2026-03-08)

> **Superseded** — see [Unified Thread Blocked-State Lifecycle](#unified-thread-blocked-state-lifecycle).

### 1. Canonical thread-state expansion

Assistant thread lifecycle must support both:
- `attention_required`
- `blocked`

`blocked` is not out of scope.

### 2. blocked state definition

A thread enters `blocked` when a governing upstream flow has exhausted automatic clarification/remediation progress and requires new explicit user input before more automation can continue.

Initial required use case:
- wizard clarification rounds exhausted

Additional allowed uses when later wired:
- explicit remediation dead-end requiring user decision
- replan-required state with no auto-applicable patch

### 3. blocked thread UI

Required thread-list behavior:
- distinct badge/state for `blocked`
- copy different from `attention_required`
- `blocked` badge must not imply that answering the current inline form alone will necessarily resume automation

Required message behavior:
- post a system message for the blocking condition
- preserve links to the relevant report / findings / resume target
- archive prior clarification messages rather than silently replacing lineage

### 4. Recovery actions

Recovery actions are rendered from canonical `allowed_action_id` values rather than ad hoc labels.

| action_id | Label | Behavior |
|---|---|---|
| `resume` | Resume | Resume the blocked runtime or wizard flow through the canonical scheduler-owned resume path. |
| `retry` | Retry | Re-run the most recent eligible blocked step or operation when prerequisites are already satisfied. |
| `abort` | Abort | Stop the blocked flow and mark the current blocked episode intentionally terminated. |
| `escalate` | Escalate | Hand the blocked episode to a higher-order workflow, parent agent, or explicit user-decision surface. |
| `provide_input` | Provide new input | Open the clarification/input path required to continue with new user-supplied data. |
| `view_report` | View report | Open the relevant findings, validation, or failure report associated with the blocked state. |
| `open_in_chat` | Open in Chat | Focus the relevant thread/context so the user can inspect or continue from the blocked episode. |
| `replan` | Replan | Start the canonical replanning path when blocked work cannot continue without a new plan. |

Only applicable action ids may appear in `allowed_action_ids[]`; visible labels are projections of the canonical ids above.

### 5. Acceptance criteria

- Assistant thread lifecycle formally includes `blocked`.
- blocked and attention_required have distinct copy and badges.
- blocking reports/links remain visible and auditable.
- blocked state recovery actions are explicit rather than implied.
