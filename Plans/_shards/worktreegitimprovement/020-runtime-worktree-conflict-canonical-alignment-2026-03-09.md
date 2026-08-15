# Shard 020: Runtime Worktree Conflict Canonical Alignment (2026-03-09)

Source: `Plans/WorktreeGitImprovement.md`

Source lines: L782-L818

Source SHA256: `a91952094251ba92ee185e07d897f219d7f8a47942834c70e88d45e77fe6a5fb`

---

## Runtime Worktree Conflict Canonical Alignment (2026-03-09)


This addendum is retained as historical context only.

Canonical worktree-conflict and dirty-worktree runtime rules now live in `## Worktree Conflict and Dirty-Worktree Runtime Alignment`.

Canonical blocked reasons for this domain are `worktree_conflict` and `dirty_worktree`.

Required rules:
- blocked payloads use canonical blocked fields and ordered `allowed_action_ids[]`
- recovery may require safe-point restore when the runtime marks `requires_safe_point_restore = true`
- clearing the underlying worktree issue resolves the blocked prerequisite; it does not fabricate a new failure class
- worktree conflict resolution must preserve lineage to the blocked episode and any affected safe point

ContractRef: Plans/Orchestrator_Page.md#Source Control boundary

Required fields:
- blocked_reason_code
- blocked_reason_detail
- remediation_actions_allowed
- dirty_state
- conflict_state

Canonical terms and values:
- blocked_reason_code
- remediation_actions_allowed

Labels:
- dirty worktree

Behavioral rules:
- `dirty_worktree` and `worktree_conflict` stay canonical blocked reasons instead of generic SCM failures.
- Conflict and cleanup semantics must remain distinct.

Permission carry-through:
- remediation actions must surface only through the allowed-action set
