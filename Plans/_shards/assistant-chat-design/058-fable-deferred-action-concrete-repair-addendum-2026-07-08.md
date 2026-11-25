# Shard 058: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/assistant-chat-design.md`

Source lines: L24732-L24778

Source SHA256: `107f29337df5403adb7fad8f9a34b6a22271cee57d2c9a27ac889a4c01e5c1b7`

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

Amended 2026-11-25: the command catalog and the wiring bind Export bundle and Revoke item to the `cmd.chat.*` ids, and those ids are canonical here too. Export bundle is `cmd.chat.export_investigation_bundle`: it writes the bundle manifest and emits the export event. Revoke item is `cmd.chat.revoke_investigation_item`: it marks the item revoked and keeps it out of future prompt injection (`Plans/UI_Command_Catalog.md#section=PMConcept command aliases and retirements`, `Plans/Wiring_Matrix.md#section=Debug investigation minimum rows`). `cmd.investigation_context.export_bundle` and `cmd.investigation_context.revoke_item` are retired source spellings: they are not commands, aliases or wiring rows, and nothing dispatches them. Open in Terminal is `cmd.terminal.open` (`Plans/UI_Command_Catalog.md`, Open in Terminal row), revealing the existing terminal session. `cmd.investigation_context.open_target` stays this document's id for Open target; it has no catalog or wiring row yet.

Operation card state transitions:

| From | Event | To |
| --- | --- | --- |
| `created` | `start` | `running` |
| `running` | `pause_requested` | `paused` |
| `paused` | `resume` | `running` |
| `running` | `needs_attention` | `blocked` |
| `blocked` | `user_action_completed` | `running` |
| `running` | `complete` | `completed` |
| `running` | `fail` | `failed` |
| `running` | `cancel` | `cancelled` |

Each transition record carries `operation_id`, `from_state`, `to_state`, `event_id`, `actor_ref`, and `created_at_utc`.
