## blocked Thread State and Recovery Addendum (2026-03-08)

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

Required actions when applicable:
- `Resume Wizard`
- `View report`
- `Provide new input`
- `Open in Chat`

### 5. Acceptance criteria

- Assistant thread lifecycle formally includes `blocked`.
- blocked and attention_required have distinct copy and badges.
- blocking reports/links remain visible and auditable.
- blocked state recovery actions are explicit rather than implied.
