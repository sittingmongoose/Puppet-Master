# Shard 010: Goal V2 exact commands and required result boundaries

Source: `Plans/Goal_Runtime_System.md`

Source lines: L251-L269

Source SHA256: `d47d2c6751e64a671b5d4d6e5545b86dfd30f91ab7159eea2d13c79e4530cdca`

---

## Goal V2 exact commands and required result boundaries

| Command ID | Meaning | Required result boundary |
|---|---|---|
| `cmd.chat.goal.start` | Create one text-only Goal for the thread | Returns `goal_id`, revision 1, `currentness_hash`, and a creation receipt. Creates no phase, child Goal, budget, schedule, Plan, or To-Do. |
| `cmd.chat.goal.update` | Write an approved objective revision | Requires the expected revision and currentness hash, and either a user-authored edit or a resolved `approval_id`. The body transaction returns revision `n+1` atomically under GRS-068/SP-299; later event/command settlement can remain unresolved while preserving that accepted body. |
| `cmd.chat.goal.propose_update` | Agent requests an objective change | Returns an `ApprovalRequest` and writes nothing. A denied or expired proposal leaves revision and currentness untouched. |
| `cmd.chat.goal.pause` | User pauses continuation | Sets `paused`, latches the stop epoch, and cancels no workflow-owned record. Nothing may auto-resume afterwards. |
| `cmd.chat.goal.resume` | User resumes continuation | Refused while a manual stop is latched or while `blocked_reason_ref` has not cleared; the refusal names the reason. |
| `cmd.chat.goal.cancel` | User ends the Goal | Writes a cancellation receipt, removes the Goal from the active projection, and forbids further continuation. Workflow-owned records remain under their owners. |
| `cmd.chat.goal.open_editor` | Open Goal Activity Detail in edit mode | Navigation only. Opening the editor is not a mutation and cannot change revision or currentness. |

`cmd.chat.goal.start` and `cmd.chat.goal.update` are pre-existing registered command IDs. This wave revises their request and result contracts in place to `GoalStartRequestV2`/`GoalStartResultV2` and `GoalUpdateRequestV2`/`GoalUpdateResultV2`. They keep one registration, one sole future handler, and one wiring identity; no peer row, compatibility spelling, or second handler is minted for them.

Every request carries `schema_id`, `schema_version`, command ID, command instance ID, `project_id`, `thread_id`, `goal_id` where applicable, expected revision, expected `currentness_hash`, actor, permission snapshot, idempotency key, source surface, and return route. Typed errors are `invalid_request`, `goal_not_found`, `stale_goal_revision`, `stale_currentness`, `objective_too_long`, `approval_required`, `approval_not_resolved`, `manual_stop_latched`, `blocked_condition_unresolved`, `command_not_registered`, `permission_denied`, `owner_unavailable`, or `cancelled`. A rejection or proven no-effect before original body admission writes no body/revision and emits no success-shaped receipt. For cmd.chat.goal.start, a later refusal or unresolved event/result step after a valid joined body commit preserves that accepted original revision and pending custody, emits no success-shaped receipt and creates no additional revision under GRS-066/SP-294. Other commands retain their existing atomic mutation and typed-error boundaries.

Until the central command catalog, Event Authority, and production wiring rows close for a given ID, its controls render disabled with `command_not_registered`. No page-local handler, alias, fixture, or toast may simulate success.

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Commands_System.md, ContractName:Plans/Wiring_Matrix.production.json
