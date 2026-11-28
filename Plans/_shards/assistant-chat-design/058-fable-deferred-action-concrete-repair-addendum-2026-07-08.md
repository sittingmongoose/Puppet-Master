# Shard 058: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/assistant-chat-design.md`

Source lines: L24745-L24794

Source SHA256: `d1e223940532c46a95560fcdb33453ff83f1d46607025003fcd20cb1aca0e1cb`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum is canonical chat/assistant GUI spec text for deferred non-runtime FABLE rows. It creates no WorkNodes, NodeSeeds, executable queues, runtime artifacts, implementation files, build tasks, final manifests, or PNC-019 receipts, and it does not mark `buildability_gate_passed` true.

### Planning Turn Budget Dimension

Repairs row `sfk-1809229e72ce853d4db0d8d8`.

The PT budget matrix counts user-facing clarification questions, not research calls. `Light = 2`, `Balanced = 4`, and `Comprehensive = 6` are maximum question counts per planning turn. Research/tool calls are governed separately by the run budget and must not consume these question slots unless their result is converted into a user-facing question.

### Subagent Question Unavailable And Debug Promotion Surfaces

Repairs row `sfk-de883c170f06a868b598c547`.

- Subagent-question unavailable notification path: `chat.thread.banner.subagent_question_unavailable`.
- Command to inspect unavailable question context: `cmd.chat.subagent_question.view_context`.
- Command to promote a debug investigation to user-visible attention: `cmd.chat.debug_investigation.promote`.
- Command to dismiss the promoted debug card: `cmd.chat.debug_investigation.dismiss`.
- Unavailable reason codes: `subagent_closed`, `question_expired`, `parent_context_replaced`, `permission_snapshot_stale`, and `redacted_by_policy`.

### Investigation Context Commands And Operation Card States

Repairs row `sfk-ab0dd1ec7c643f8e3ae96066`.

Command IDs:

- `cmd.investigation_context.open_target`
- `cmd.investigation_context.export_bundle`
- `cmd.investigation_context.revoke_item`
- `cmd.terminal.open`

Amended 2026-11-25: the command catalog and the wiring bind Export bundle and Revoke item to the `cmd.chat.*` ids, and those ids are canonical here too. Export bundle is `cmd.chat.export_investigation_bundle`. In Project scope it writes the bundle manifest, and the Runtime Artifacts exporter emits `debug.investigation.exported` only after the manifest commits and its counts are verified (`Plans/Contracts_V0.md#CV-572`, Project edition only). The current production row `catalog.chat_export_investigation_bundle` and its `no_project` binding in `Plans/projects_refresh_command_bindings.json` declare no persisted event: in application scope dispatch records a no-persist command receipt or route/open disposition and claims no export event. Revoke item is `cmd.chat.revoke_investigation_item`: it marks the item revoked and keeps it out of future prompt injection (`Plans/UI_Command_Catalog.md#section=PMConcept command aliases and retirements`, `Plans/Wiring_Matrix.md#section=Debug investigation minimum rows`). `cmd.investigation_context.export_bundle` and `cmd.investigation_context.revoke_item` are retired source spellings: they are not commands, aliases or wiring rows, and nothing dispatches them. Open in Terminal is `cmd.terminal.open` (`Plans/UI_Command_Catalog.md`, Open in Terminal row), revealing the existing terminal session. Open target is `cmd.chat.open_investigation_target` (cataloged and wired 2026-11-25, `Plans/UI_Command_Catalog.md#section=PMConcept command aliases and retirements`, `Plans/Wiring_Matrix.md#section=Debug investigation minimum rows`, production row `catalog.chat_open_investigation_target`): a no-persist route/open command with `thread_id` and `investigation_id` that opens the investigation's `effective_target` (else `target`) in the surface that owns it, disabled with `stale_projection` when the target no longer resolves (rebind it through the Debug target picker, `cmd.chat.open_debug_target_picker`, production row `catalog.chat_open_debug_target_picker`; `Revalidate target` is offered only where supported, as ACD-100 says) or `unreachable` when that surface cannot open it, and emitting no event. `cmd.investigation_context.open_target` is now a retired source spelling like the other two.

Operation card state transitions for Investigation Context lifecycle-bearing operations, with the ACD-104 blocked recovery path:

| From | Event | To |
| --- | --- | --- |
| `created` | `start` | `running` |
| `running` | `pause_requested` | `paused` |
| `paused` | `resume` | `running` |
| `running` | `needs_attention` | `blocked` |
| `blocked` | `user_action_completed` | `running` |
| `blocked` | `cancel` | `cancelled` |
| `running` | `complete` | `completed` |
| `running` | `fail` | `failed` |
| `running` | `cancel` | `cancelled` |

`cancel` from `blocked` records the owner's accepted cancellation. It must be a permitted action from `allowed_action_ids[]` on the current blocked episode and does not resume the operation. Each transition record carries `operation_id`, `from_state`, `to_state`, `event_id`, `actor_ref`, and `created_at_utc`. These are transition triggers, with persisted events governed by the operation's owner.

For a task or subagent operation card covered by §13.1 `Operation-card family`, the child owner's states apply instead of `created`: `pending` → `running` on admission, then `running` → `completed` (completion), `failed` (failure), `cancelled` (accepted cancellation) or `timed_out` (the child deadline expires), plus the two blocked recovery rows above (`running` → `blocked` on a recoverable wait, `blocked` → `running` or `cancelled`). Child deadlines default to `120s` for regular and `300s` for long-running child operations, and retries stay parent-owned (§13.1). `task.failed` is the existing presentation notification over canonical child records. Delegated-task and subagent disclosure blocks remain separate widget families. Terminal command cards take their states from `#section=Status, degradation, and linked-surface behavior` (`starting`, `running`, `exited`, `failed`, `terminated`, `disconnected`, `restoring`, `attention_required`) under §13.3 `Bash and terminal ownership`, so a terminal reveal does not create an Investigation Context operation.
