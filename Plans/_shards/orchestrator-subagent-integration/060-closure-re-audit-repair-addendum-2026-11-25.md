# Shard 060: Closure Re-audit Repair Addendum - 2026-11-25

Source: `Plans/orchestrator-subagent-integration.md`

Source lines: L35149-L35179

Source SHA256: `7307d448314036b35907dbf3376709b36f026d1a43432f1c9db52e9c0f0a019d`

---

## Closure Re-audit Repair Addendum - 2026-11-25

Stream C closure re-audit repairs (cluster K2). This addendum adds no WorkNodes, NodeSeeds, commands, events or runtime evidence; it binds existing names.

### Pause Gate Live Contract

Repairs `sfk-52b55259003ddf5c68bd4d44` (registry lines 1501 and 1588).

- Path: `<project root>/.puppet-master/PAUSE.md`, one file per project. This is the Pause File Location above and the project-root file named in `Plans/human-in-the-loop.md` PAUSE.md Gate And Precedence; no other path is read.
- Watcher: the Orchestrator reads the file at two points only: before dispatching each new execution-unit attempt (each loop iteration, OSI-387) and before admitting `cmd.orchestrator.resume` for a run the gate halted. No file-system notification is needed. An attempt already running is not interrupted; its result is recorded, and no new mutating attempt is dispatched in scope while the gate is active. Read-only work (`ask`, `plan`) is not blocked.
- Fields and order: the frontmatter fields and the PAUSE-before-HITL precedence are the human-in-the-loop.md contract. `scope` is closed: `project` (every run in this project) or `run:<run_id>` (that run only). `allowed_action_ids[]` holds canonical `allowed_action_id` values from the `Plans/UI_Command_Catalog.md` recovery table.
- Fail-closed parsing: a file that exists with no frontmatter, unparseable frontmatter, an unknown `scope` value or a missing `pause_id` still pauses, read as `scope: project` with `allowed_action_ids[] = []`, and the run's pause notice says the gate file is invalid. A file whose `expires_at_utc` is in the past is inactive.
- Halt: at a blocked dispatch the run logs the `pause_id` and reason, returns a halted result and waits (OSI-387).
- Resume: the gate clears only when the file is removed or expires. While it is active, `cmd.orchestrator.resume` for a run in scope is not admitted and the run keeps showing the pause reason. After it clears, a halted run continues at its next dispatch point once `cmd.orchestrator.resume` is admitted.

### Parser-Failure And Unrelated-Failure Recovery Actions

Repairs `sfk-15a9ffa7a7561411bb7625a4` (registry line 1518); binds OSI-094, Handoff Retry Ceiling and Unrelated-failure escalation to the existing `cmd.runtime.*` recovery commands in `Plans/UI_Command_Catalog.md`. No new command id is added.

- Raise: when the platform parser, the generic fallback and the one automatic retry all fail (OSI-094), or `subagent.handoff.max_retries` is exhausted (Handoff Retry Ceiling), the attempt settles with `failure_class = structured_output_invalid`, the raw output stays in the `parser.error` seglog event, a `handoff_retry_exhausted` record is written, and the node takes the `needs_review` overlay (§7 Retry/backoff matrix) at a recovery point with a minted `blocked_sequence`.
- Raise for the Unrelated-failure escalation CTA (OSI-136): when an attempt fails because of issues outside its intended scope and its one automatic retry with the same config also fails, the retried attempt keeps the classifier family and classifier the executor emitted for it (`failure_class` or `blocked_reason_code`, §7 Retry/backoff matrix: never coerced into `structured_output_invalid` or another `failure_class`). No `parser.error` event and no `handoff_retry_exhausted` record is written for it unless that attempt really was a structured-output parse failure. The node waits at a recovery point with a minted `blocked_sequence` and the chat CTA; a modal replaces the chat CTA only for P0 risk (OSI-136). The attempt's own classifier row still governs anything the matrix makes automatic (for example `provider_transient` retries run before this escalation is reached).
- Local spellings map to canonical `allowed_action_id` values: `retry` -> `retry_now`; `skip_with_operator_acceptance` -> `skip_node`; `view_raw_output` -> `open_details`. The recovery point's `allowed_action_ids[]` is `[retry_now, skip_node, open_details]` for the parser prompt and `[open_details, skip_node, retry_now, abort_run]` for the Assistant chat CTA (review, skip, retry, abort).

| Control | `allowed_action_id` | Command | Payload | State after success |
|---|---|---|---|---|
| [Retry] / chat retry | `retry_now` | `cmd.runtime.retry_now` | the catalog's `retry_now` arguments for this node: `project_id`, `run_id`, `node_id`, `blocked_sequence`, `attempt_id`, `idempotency_key` | The recovery point closes; a new attempt with a new `attempt_id` is dispatched for the same node and handoff. This operator retry is outside the automatic `subagent.handoff.max_retries` count. If it fails the same way, a new recovery point with a new `blocked_sequence` is raised. |
| [Skip] / chat skip | `skip_node` | `cmd.runtime.skip_node` | `run_id`, `node_id`, `attempt_id`, `reason_code`, `operator_note?` (human-in-the-loop.md Skip And Cancel Commands); `reason_code = handoff_retry_exhausted` for the parser prompt, and for the Unrelated-failure CTA the failed retry's own classifier value (its `failure_class` or `blocked_reason_code`) | The node settles as skipped by the operator; no Downstream Context or partial SubagentOutput is forwarded from it; the run continues with the remaining nodes. |
| [View raw output] / chat review | `open_details` | `cmd.runtime.open_attempt_details` | `run_id`, `node_id`, `attempt_id` | No state change. For the parser prompt, attempt details open on the raw output kept in `parser.error`; for the Unrelated-failure CTA they open on the failed retry's classifier, error detail and logs. The recovery point stays open. |
| chat abort (Unrelated-failure CTA only) | `abort_run` | `cmd.runtime.abort_run` | `run_id`, `reason_code` = the failed retry's own classifier value (its `failure_class` or `blocked_reason_code`), `requested_by`, `created_at_utc` | The run ends through the existing abort semantics. |

- Stale checks use the identity each payload carries. `cmd.runtime.retry_now` is refused as stale, changing nothing, when its `blocked_sequence` or `attempt_id` no longer matches the open recovery point. `cmd.runtime.skip_node` carries no `blocked_sequence`: it is refused as stale when the node has no open recovery point or its `attempt_id` is not the attempt that recovery point was raised for. `cmd.runtime.abort_run` carries only `run_id`: it is never stale against a recovery point, and is refused only when the run is already terminal. `cmd.runtime.open_attempt_details` changes no state and is never refused as stale; it opens the named attempt even after the recovery point closed. Only one of `retry_now` and `skip_node` settles a recovery point; the first admitted one wins and the later one is refused as stale. An admitted `abort_run` ends the run, which closes any open recovery point, so every later `retry_now` or `skip_node` for it is refused because the run is terminal. An `abort_run` that arrives after `retry_now` or `skip_node` already settled the point is not stale: while the run is still active it is admitted and aborts the run like any other abort.
