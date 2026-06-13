# Shard 012: HITL Retry and Safe-Point Clarification Addendum (2026-03-08)

Source: `Plans/human-in-the-loop.md`

Source lines: L296-L343

Source SHA256: `258335107791951d7805aee616ad04d09f3273c964bc83758f85f55ca003a6e5`

---

## HITL Retry and Safe-Point Clarification Addendum (2026-03-08)

### 1. HITL resolution wakes the scheduler

Approval/rejection resolution is a primary scheduler wake trigger.

Required behavior:
- `hitl.approved` / `hitl.rejected` must cause immediate queue reevaluation
- unrelated runnable work continues while a node is waiting on HITL

### 1A. HITL wait timers and long-governance waits

HITL approval waits consume the shared temporal taxonomy in Plans/Contracts_V0.md; this document does not redefine timeout classes.

Required rules:
- A pending approval is an `approval_wait` and may also be represented as a `long_governance_wait` (`long-governance-wait`) when policy declares the wait intentionally long.
- While an approval wait has a known future-timestamp or active user-visible timer, HITL surfaces MUST NOT render it as generic `deadlock/stall`, MUST NOT show stall banners, and MUST NOT auto-pause unrelated runnable work.
- Expiry of a user-facing approval countdown maps to `user_visible_wait_timer_expiry` (`user-visible wait timer expiry`); it keeps the same `run_id`, `node_id`, `blocked_sequence`, and `approval_scope_key`.
- Approval resolution, decline, expiry, restart recovery, retry, skip, and abort continue to use the canonical blocked episode identity rather than minting a separate timer-local request.

### 2. Re-run semantics after reject

`Re-run` cannot remain ambiguous.

Required rule:
- the rejection CTA must declare whether the rerun is `retry_from_safe_point` or `fresh_attempt`
- default should be `retry_from_safe_point` for mutation-capable attempts when a valid safe point exists
- if no safe point exists or the execution unit is explicitly non-recoverable, use `fresh_attempt`

### 3. Skip semantics

`Skip` must preserve lineage.

Required rule:
- the skipped attempt remains in history
- the UI must show that the user chose to advance without rerunning the rejected execution unit
- downstream behavior must obey graph semantics and any declared skip policy; skip is not silent success

### 4. Abort semantics

Abort terminates the run and preserves the full paused/rejected lineage.

### 5. Acceptance criteria

- HITL resolution immediately wakes scheduling.
- Rerun semantics are explicit about safe-point vs fresh attempt.
- Skip preserves lineage rather than masquerading as a passed attempt.
- Abort preserves audit history.
