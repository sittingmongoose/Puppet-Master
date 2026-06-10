# Shard 011: Implementation Hooks (Planning Only)

Source: `Plans/human-in-the-loop.md`

Source lines: L262-L295

Source SHA256: `1d422c28121f5136cf861604a3df266fb3bb96deca8fc1dd177205c530863fb9`

---

## Implementation Hooks (Planning Only)

When implementing:

1. **Config:** Keep approval/blocking policy in the shared runtime config so GUI and runtime resolve the same blocked episode state.
2. **Runtime loop:** When a node reaches an approval prerequisite, transition into the canonical blocked episode flow and wait for a runtime action rather than a tier-local pause flag.
3. **Persistence:** Persist and restore the same blocked episode so restart, retry, skip, abort, and recovery actions stay attached to the original runtime identity.
4. **Dashboard CtAs:** Surface the blocked episode through Dashboard and Assistant without rewriting its identity or action set.

### Restart recovery and blocked-episode continuity


#### Acceptance carry-through
- Transfer execution_role, requested_account_id, operational_identity, account-switch and pressure ownership, blocked_sequence minting, startup recovery handshake, and DAE jail/approval policy into owner and consumer docs
- Carry usage switch-history and usage execution-role follow-through

### Approval Scope Key and provider-native correlation
- `approval_scope_key` is the durable blocked-episode scope key across actor, lane, run, node, and account context.
- The same scope key is reused across permissions, HITL, doom-loop handling, and session approval caching.
- Provider-native session or attempt identifiers live in dedicated correlation fields; canonical thread identity is not overloaded to carry provider correlation.
- Approval scope for one blocked episode is distinct from any broader session-wide policy scope.
- Approval and rejection events persist durable approver identity fields so audit history records who resolved the blocked episode.

### Tier-era compatibility retirement

- The legacy tier-era runtime canon is retired. The former runtime context, identifier, type, and collection labels, plus Phase-Task-Subtask wording, are compatibility-only display/grouping aliases and MUST NOT appear in runtime-owned blocked payloads, approval events, persistence records, cache keys, or recovery state.
- Canonical blocked-episode identity is `run_id` + `node_id` + `blocked_sequence`. Those fields own lookup, replay, restart recovery, audit joins, and resolver routing.
- Canonical blocked classification uses `concern_reason`. If additional detail is needed, it MUST be carried in dedicated structured metadata or `detail_ref?`; no legacy short-code survivor field remains in the live contract.
- Canonical action enumeration uses ordered `allowed_action_ids[]` only. Runtime, Dashboard, Assistant, and APIs MUST derive visible controls from that array and MUST NOT carry a second survivor array for blocked or recovery actions.
- Canonical approval resolution uses explicit outcome fields such as `approval_outcome` and `approval_recorded_at`, scoped by `approval_scope_key`. Continuation after review is represented by the recorded approval outcome, not by a separate legacy continue-decision field.
- Durable approver identity MUST be persisted with the resolution record via `approver_identity` or an equivalent durable approver principal field so audit history records who approved or declined the blocked episode.
- Blocked-episode recovery semantics are canonical. Retry, resume-after-prerequisite, skip, abort, replan, and safe-point restore behavior remain attached to the same `run_id` + `node_id` + `blocked_sequence` episode, and recovery affordances are derived from `allowed_action_ids[]`, `concern_reason`, and safe-point metadata rather than from any legacy recovery-option survivor fields.
- Any remaining phase/task/subtask labels may be rendered as explanatory UI copy, but they MUST NOT redefine approval scope, blocked identity, recovery semantics, or persistence ownership. `approval_scope_key` remains the only durable approval-scope handle for the blocked episode.

