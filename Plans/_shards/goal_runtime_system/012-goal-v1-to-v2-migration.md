# Shard 012: Goal V1 to V2 migration

Source: `Plans/Goal_Runtime_System.md`

Source lines: L283-L296

Source SHA256: `905e3f1889eb2f6aaf3583d278b9d49b80cc69be4f01fecefbcbda7f3887d429`

---

## Goal V1 to V2 migration

Migration reads `pm.goal.record.v1` and writes `pm.goal.record.v2`. It is a one-way structural reduction with explicit custody of what is dropped.

- `objective` maps to `objective_text` unchanged. A V1 record whose objective exceeds the product maximum is quarantined for owner review rather than truncated.
- `title` is dropped. Where a V1 title carried meaning the objective does not, migration does not merge it silently; it records the dropped title in the migration receipt so an owner can decide.
- `phases`, `currentPhaseId`, `tranches`, `subgoals`, `child_goal_ids`, `budget`, and role-cast fields are dropped and recorded in the receipt. Evidence that was attached to a completed phase is re-parented to the workflow owner that produced it, or retained as an immutable historical artifact reference; it is never deleted to make a migration pass.
- V1 status maps as `active → active`, `paused → paused`, `blocked → blocked`, `completed → completed`, and `cancelled → cancelled receipt plus removal from the active projection` (cancellation is not a V2 state).
- Revision history is synthesized as a single revision 1 with `change_source: user_direct` when no V1 revision history exists. Migration never fabricates intermediate revisions.
- In-flight V1 Goals are paused across the migration boundary and require an explicit user resume. Migration never resumes work by itself, and a V1 Goal that was manually stopped stays stopped.

Receipts record before and after hashes, dropped-field custody, quarantined records, and unresolved residual risk. A migration that cannot validate a Project or thread edge quarantines rather than guessing.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Bootstrap_Planning_Migration.md
