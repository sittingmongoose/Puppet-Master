# Shard 057: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/assistant-chat-design.md`

Source lines: L23522-L23566

Source SHA256: `dbe013e75b0359ac3f4763abd6cc3756a3366b628c1ddb066c68e4ecc91e0f67`

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
