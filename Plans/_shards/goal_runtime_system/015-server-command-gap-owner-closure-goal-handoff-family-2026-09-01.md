# Shard 015: Server command-gap owner closure - Goal handoff family (2026-09-01)

Source: `Plans/Goal_Runtime_System.md`

Source lines: L772-L845

Source SHA256: `905e3f1889eb2f6aaf3583d278b9d49b80cc69be4f01fecefbcbda7f3887d429`

---

## Server command-gap owner closure - Goal handoff family (2026-09-01)

`GoalExecutionHandoffCoordinator` owns one DRY command family in `Plans/goal_handoff_contracts.schema.json`: request, result, error, availability, disabled reason, permission decision, exact-return round trip, and the typed local details action. The six canonical commands and their sole future handlers are:

- `cmd.goal.checkpoint` -> `handlers::goal_handoff::checkpoint`
- `cmd.goal.continue_on_host` -> `handlers::goal_handoff::continue_on_host`
- `cmd.goal.handoff.cancel` -> `handlers::goal_handoff::handoff_cancel`
- `cmd.goal.handoff.retry` -> `handlers::goal_handoff::handoff_retry`
- `cmd.goal.pause` -> `handlers::goal_handoff::pause`
- `cmd.goal.resume_here` -> `handlers::goal_handoff::resume_here`

All six are `handler_unavailable` until central registration, schema binding, the named sole native handler, permission/FileSafe route, production wiring, and receipt-or-admitted-event disposition are current. No fixture or Plan text makes a handler available. Source token `cmd.goal.handoff.open_details` is retained only as the adjudicated spelling for `ui.goal.handoff.open_details`, a typed, bounded, redacted, lazy local projection with no domain handler and no domain EventRecord. Its exact consumers are Goal/Assistant status, Project activity, Goal handoff modal, status bar, and Doctor.

Checkpoint and pause serialize only a durable continuation boundary, source/worktree identity, artifact refs, owner state, generations, and non-secret credential refs; they never freeze, serialize, or migrate a live process. Continue and resume revalidate exact Goal/GoalRun/Project/source location/current Host/target Host, topology, source, worktree, capability, credential, permission, and checkpoint generations. Retry keeps the same idempotent handoff identity but revalidates the typed failure and all currentness inputs. Cancel targets only the exact cancellable handoff operation. Restart converges from the durable handoff journal to resume, rollback, or `recovery_required`; duplicated, stale, or racing requests cannot produce two continuations. Results restore the exact initiating surface, route, focus, and invocation generation or report `caller_unavailable` without redirecting to a convenient fallback. Requests, results, receipts, logs, details projections, and ObservableWork expose no raw secret, protected authentication content, credential value, or unrestricted filesystem path.

### GRS-047 - Goal Handoff Command And Local-Projection Closure

```yaml
plan_unit_id: GRS-047
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  GoalExecutionHandoffCoordinator owns six exact checkpoint, pause, continue, resume, retry, and cancel commands through
  one closed request/result/error/availability/disabled/permission family, plus one presentation-only details action.
  Every command remains handler_unavailable until its named sole native handler and complete central integration exist;
  durable checkpoints transfer reconstructible authority only and never claim live-process migration.
gui_related: true
gui_classification_reason: Goal handoff availability, progress, blockers, details, and exact return are visible across five named GUI consumers.
depends_on: [GRS-019, GRS-043]
unblocks: []
acceptance_criteria:
  - The schema and fixtures cover exactly six canonical command IDs, six sole handlers, and ui.goal.handoff.open_details as a no-domain-handler/no-domain-event local action.
  - Goal/Assistant status, Project activity, Goal handoff modal, status bar, and Doctor consume the same owner projection.
  - Checkpoint, pause, continue, resume, retry, cancel, restart, duplicate, stale-generation, race, permission, FileSafe, secret-redaction, and exact-return cases remain typed and fail closed.
  - No command becomes available from schema, fixture, catalog text, or browser/static evidence alone.
validation_surfaces: [Plans/goal_handoff_contracts.schema.json, Plans/goal_handoff_contract_fixtures.json, focused Server owner-bundle-A validator]
risk_class: goal_handoff_false_migration_or_duplicate_continuation
reasoning_tier: high
context_scope: server_command_gap_goal_handoff
implementation_surfaces: [Plans/Goal_Runtime_System.md, Plans/goal_handoff_contracts.schema.json, future Goal handoff native handler]
node_compile_hint: {mode: goal_handoff_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:server-command-gap-adjudication:rows-77-83]
negative_constraints:
  - Do not serialize or migrate a live process.
  - Do not create a domain handler or EventRecord for ui.goal.handoff.open_details.
  - Do not expose raw secrets, protected authentication content, credential values, or unrestricted paths.
```

### GRS-046 - Frozen Goal Route And Explicit Rebind

```yaml
plan_unit_id: GRS-046
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: A GoalRun freezes its requested and effective provider, model, account, route, Persona, mode, topology, policy generations, and resolver evidence at admission. Replan, provider rotation, fallback, or user route change creates an explicit revisioned rebind with reason, authority/currentness checks, prior/new snapshots, and owner epoch; focus, thread selection, reconnect, compaction, or current Settings never silently retarget an admitted GoalRun.
gui_related: false
depends_on: [GRS-044, MS-137]
unblocks: []
acceptance_criteria:
  - AGT-003 route identity survives context compaction, client loss, reconnect, and current-catalog change.
  - A required route/account cannot silently fall back; permitted changes produce a new immutable binding and reason.
  - Late prior-binding work cannot commit after rebind or owner-epoch change.
validation_surfaces: [Goal route-freeze and rebind fixtures]
risk_class: goal_route_retargeting
reasoning_tier: high
context_scope: frozen_goal_route
implementation_surfaces: [Plans/Goal_Runtime_System.md, Plans/Models_System.md, Plans/Multi-Account.md]
node_compile_hint: {mode: goal_route_binding_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/ACCOUNTABILITY_MATRIX.json#AGT-003
negative_constraints: [Do not retarget a Goal from focus or current settings., Do not commit late prior-binding work.]
```
