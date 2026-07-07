# Shard 031: Compatibility/source-lineage - Scheduler, blocked, and Remediation GUI Addendum (2026-03-08)

Source: `Plans/FinalGUISpec.md`

Source lines: L3113-L3188

Source SHA256: `7bdec1f1dc213cffa20bdb39b72e26439653741d4d94554b6c6d72aab702b04c`

---

## Compatibility/source-lineage - Scheduler, blocked, and Remediation GUI Addendum (2026-03-08)


> **Superseded — see Canonical Blocked/Recovery Behavior below. Compatibility/source-lineage only.** This section preserves exact GUI tokens and older examples; the canonical GUI summary and referenced owner docs govern overlapping blocked/recovery behavior.

### 1. Dashboard cards


The Dashboard must distinguish:
- `wizard_attention_required`
- `wizard_blocked`
- HITL blocked actions
- remote-side-effect blocked actions

`wizard_blocked` card requirements:
- more severe copy than `wizard_attention_required`
- primary CTA: `Resume Wizard`
- secondary CTA: `View report`
- auto-dismiss only when the wizard leaves `blocked`

### 2. Assistant thread selector / badges

#### 2.1 Worktree icon in thread selector

Each thread row in the thread selector displays a worktree icon when the thread has an active worktree binding.

- **Position:** Left gutter of thread row, vertically below the status badge (running/blocked/attention)
- **Icon:** Theme-consistent branch/tree glyph from icon set
- **Size:** Same size as status badge icons so visual weight stays consistent.
- **Visibility:** Present only when thread has a worktree binding; absent (no placeholder) when unbound
- **Hover tooltip content:** Line 1 is the branch name, e.g. `assistant/fix-auth-bug`; line 2 is status pill text such as `clean`, `dirty`, or `conflict`; line 3 is the worktree path, e.g. `.puppet-master/worktrees/wt-abc123`.
- **Icon color:** Clean: `icon-secondary`. Dirty: `accent-warning`. Conflict: `accent-error`. Colors resolve through theme tokens across all three built-in themes.
- **Stale projection:** Icon shows last-known state with subtle desaturation; tooltip appends "(status may be outdated)"
- **Accessible label:** Thread selector worktree icon uses `aria-label="Has worktree: {branch_name}, {status}"`.
- **Announcements:** Worktree state changes are announced through an `aria-live="polite"` region for create, unbind, remove, dirty status, conflict status, and creation-failed transitions.
- **Completed/failed dirty worktrees:** If a completed or failed thread still has a dirty bound worktree, the selector may show status pill text such as `dirty · completed` or `dirty · failed`, and the completion toast suggests merge/cleanup; there is no auto-cleanup.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Wiring_Matrix.md

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md

Thread and session navigation uses persistent shell surfaces.

Rules:
- the active thread list is visible in a persistent sidebar or equivalent persistent region, not only in a floating overlay
- the selector must expose running, queued, blocked, and attention-required badges per thread
- branch lineage is visible in the selector/history model using stable branch labels and source-origin metadata
- badge aggregation must preserve highest-severity state while still showing blocked counts when present
- the project/session browser may complement thread navigation but does not replace the active-thread list inside chat

The floating thread-list overlay pattern is not canonical after this section.
### 3. Run Graph and Orchestrator views

Required visible scheduler/remediation data:
- wake reason
- ready/blocked/backoff/remediation counts
- selected-node score breakdown
- ready-but-unselected reasons
- safe-point ID
- remediation lineage identifiers

### 4. blocked outcome copy

When a remote side effect or guard prevents execution, the GUI MUST present the outcome as `blocked`, not `failed`, and must preserve any completed local work.

### 5. Event-driven correctness

All scheduler/remediation/blocked UI updates must follow the existing `invoke_from_event_loop` event-driven rule. No timer polling for correctness.

### 6. Acceptance criteria

- Dashboard has a first-class `wizard_blocked` card.
- Thread badges distinguish `blocked` from `attention_required`.
- Scheduler/remediation state is inspectable in run surfaces.
- blocked outcomes are not mislabeled as failures.
- new runtime widgets obey the event-driven rewrite rule.
