# Shard 038: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/Tools.md`

Source lines: L12441-L12699

Source SHA256: `a1083255c7e8cb94f9b8203ce6191eff148d66620b449bb1828d7007c1e9cb45`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum is canonical tool contract text for deferred non-runtime FABLE rows. It creates no WorkNodes, NodeSeeds, executable queues, runtime artifacts, implementation files, build tasks, final manifests, or PNC-019 receipts, and it does not mark `buildability_gate_passed` true.

### Section 10 Numbering Supersession

Repairs row `sfk-88d65b2be00892daadd2f0d8`.

- The first `## 10. Implementation plan: permissions (spec for implementers)` remains a permissions implementation-plan compatibility section.
- The second block of numbered chapters, from the second `## 10. Firecrawl provider integration` through `## 15. Assistant collaboration, To-Do proposal, and read-only advisor tool boundaries` (with its `## 11.` to `## 14.`), is cited by heading name: the chapter and subsection numbers in that block are not authoritative, because `## 10.` to `## 13.` also number the first block (`Implementation plan: permissions`, `Relationship to other plans`, `Implementation checklist`, `References`). Corrected 2026-11-24 (Decision_Log DL-2602, C-FIX79): the earlier line here that superseded the second `## 10.` as `## 11. Firecrawl provider integration` is withdrawn, since `## 11. Relationship to other plans` already holds that number; no heading is renamed.
- Citations to Firecrawl subsections must use `Firecrawl provider integration` plus the subsection title rather than bare `§10.x`. Renumbering the second block is left to a scheduled structural cleanup.
- Citations to permissions implementation subsections must include `Implementation plan: permissions` plus the subsection title.

### Tool Turn Contract Minima

Repairs rows `sfk-0649b6a2c860f179ee699f58`, `sfk-e257db159bd84ee85f74371d`, and `sfk-47f640ed50d4ed24f6b34c49`.

`ToolTurnSettlement` fields are `settlement_id`, `tool_call_id`, `settlement_state`, `result_ref?`, `error_ref?`, `truncation_ref?`, `redaction_ref?`, `retention_ref?`, `retry_after_ms?`, `created_at_utc`, and `schema_version`. Amended 2026-11-26: the list also has `gate_id?`, and `tool_call_id` is absent only for a call that arrived with no provider id, which the admission gate always denies; the `ToolTurnSettlement` typed shape below gives every type and presence rule.

`settlement_state` values are `success`, `partial`, `partial_truncated`, `malformed`, `nullable_content`, `redacted`, `retained`, `retryable`, and `fatal`. `success` is legal only when required result, error, truncation, retention, and redaction metadata are normalized.

`CommandInvocationContract` fields are `invocation_id`, `tool_call_id`, `invocation_kind`, `interpreter`, `argv?`, `shell_string?`, `powershell_script?`, `pty_input_ref?`, `cwd`, `env_policy_ref`, `permission_snapshot_id?`, `configured`, `allowed`, `injected`, `visible_to_model`, `created_at_utc`, and `schema_version`. Amended 2026-11-26: the list also has `terminal_session_id?`, typed below.

`invocation_kind` values are `shell_string`, `argv`, `powershell_script`, `pty_input`, and `tui_automation`.

`ProviderToolTurnAdmissionGate` fields are `gate_id`, `tool_call_id`, `provider_id`, `model_id`, `allowed`, `denial_reason_code?`, `permission_snapshot_id?`, `capability_snapshot_id?`, and `created_at_utc`. Amended 2026-11-26: the list also has `call_index`, and `tool_call_id` is absent only for a call that arrived with no provider id; the typed contract below gives every type and presence rule.

#### `interpreter` type and the `bash` adapter binding (added 2026-11-25)

`CommandInvocationContract.interpreter` is an object `{ interpreter_kind, executable_path, version? }`. `interpreter_kind` is the closed enum `bash`, `zsh`, `sh`, `fish`, `pwsh`, `powershell`, `cmd`, and `none`; `executable_path` is the absolute path the runtime resolved, never a bare name; `version` is an optional string. `none` is legal only with `invocation_kind = argv` (direct exec with no shell). A call whose interpreter cannot be resolved is refused with `spawn_failed` before dispatch.

Every `bash` tool call (§3.5.1) that reaches command normalization produces exactly one `CommandInvocationContract` before invocation approval and dispatch, mapped field by field. A call denied by T-169 has no invocation contract.

| Contract field | Value for a `bash` call |
|---|---|
| `invocation_id` | New for every call, also when `shellId` reuses a session. |
| `tool_call_id` | The `bash` tool call's id. |
| `invocation_kind` | Always `shell_string`. `bash` never produces `argv`, `powershell_script`, `pty_input`, or `tui_automation`. |
| `interpreter` | With `shellId`: the shell of the bound `terminal_session_id` (DL-181). Without it: the shell the runtime resolves for the frozen Project/worktree or Computer/working-root context (T-187) when it creates the binding. |
| `shell_string` | `command`, byte for byte: no trimming, re-quoting or splitting. |
| `argv`, `powershell_script`, `pty_input_ref` | Absent. |
| `terminal_session_id` | With `shellId`, use the bound session's id (DL-181). Without it, reserve the canonical id of the new session before building the contract. No terminal starts on reservation. On admission and startup the result's `shellId` binds to that id. Release an unused reservation if approval or startup fails. |
| `cwd` | The frozen working root (T-187) for a new binding; for a reused `shellId`, the session's working directory observed at dispatch. |
| `env_policy_ref` | The environment policy of the shell binding. |
| `permission_snapshot_id` | The snapshot the pre-dispatch Permissions and FileSafe evaluation used. |
| `configured`, `allowed`, `injected`, `visible_to_model` | Copied from the `bash` entry of the `ActiveToolNamespaceReceipt` current at dispatch (below). |
| `created_at_utc` | Stamped by the runtime when it builds the contract, before dispatch (RFC 3339 UTC). |
| `schema_version` | `1.0.0`. |

`mode`, `initial_wait`, `detach`, and `shellId` are execution controls of §3.5.1 and are not contract fields. After admission and per-invocation approval, a new binding starts `executable_path` as a persistent interactive shell on the reserved terminal session, using the contract's `cwd` and `env_policy_ref`. Startup must establish shell readiness and authoritative command tracking before command submission or returns `spawn_failed`. A reused binding submits to the existing interpreter. Every admitted `bash` dispatch with either binding uses the session-bound `shell_string` variant below.

For both bindings, check terminal input ownership under DL-181 and SMPFS-182, including the human-write grant, take-over, secret-input and input-protection checks of CV-362. Recheck the approved target and observed `cwd` at the verified idle shell boundary before writing. A changed target or directory requires fresh admission before any bytes are written. Each shell accepts one `bash` invocation at a time. The terminal adapter supplies the exact bytes as one shell input buffer, using the profile's literal command-entry path, then submits that buffer once. Transport framing and the separate submit action are outside the approved command text. Preserve newlines and quoting in the buffer. If the profile cannot submit the full text unchanged, refuse with `validation_error` before writing. The shell evaluates the buffer in its current interpreter context. It does not run the command in a separate interpreter or subshell unless the approved command itself asks for one.

At submission, bind the invocation to its session and command boundary. Settle command completion once, from shell integration authenticated under SMPFS-183 or authoritative runtime evidence for that exact invocation and its integer exit status. A prompt-like string, unmatched mark, quiet interval or session disconnect supplies no exit code (SMPFS-021, SMPFS-022, SMPFS-129). Attribute only the invocation's output to its result and apply SMPFS-023 and CV-362 backing and loss rules to terminal reads. If the session ends without authoritative command completion, return the available output with `status: "failed"`, `exit_code: null` and `error.code: "shell_not_found"`. Completion of a command does not retire a live binding. Sync waits up to `initial_wait`, and async returns on dispatch. The hard ceiling applies to the command under §3.5.1.

`command` is never executed as `argv[0]`, and a non-string `command` is `validation_error`. `powershell_script` stays reserved for inspected PowerShell wrapper scripts (T-171) and `pty_input` for raw input to an interactive program. Approval UI shows `shell_string` verbatim beside `interpreter_kind` and `executable_path` and identifies the new shell or the existing terminal by its tab.

#### `CommandInvocationContract` typed shape and variants (added 2026-11-26)

Field types, for every tool that builds the contract (the `bash` mapping above is one producer):

| Field | Type | Rule |
|---|---|---|
| `invocation_id` | string (UUID) | New for every call. |
| `tool_call_id` | string | The tool call that produced the contract. |
| `invocation_kind` | closed enum | One of the five values above; selects exactly one content field (variant table below). |
| `interpreter` | object `{ interpreter_kind, executable_path, version? }` | As defined in the `interpreter` subsection above. |
| `argv` | array of strings, at least 1 entry | `argv[0]` is the program, resolved to an absolute path before dispatch; each entry is passed as one argument with no shell. |
| `shell_string` | string, at least 1 byte | Byte for byte, never trimmed, re-quoted or split. The session-bound form submits one shell input buffer under the rules above. The standalone form passes one command argument. |
| `powershell_script` | string, at least 1 byte | The text of an inspected PowerShell wrapper script. |
| `pty_input_ref` | string | Reference to the exact bytes written to the PTY of a bound terminal session. |
| `terminal_session_id` | string, optional | The canonical terminal session (DL-181) the contract writes into. Required for `pty_input` and the session-bound `shell_string` form, including the new session of a first `bash` call. Absent for standalone `shell_string`, `argv` and `powershell_script`. |
| `cwd` | string | Absolute path. |
| `env_policy_ref` | string | The environment policy applied to the process. |
| `permission_snapshot_id` | string, optional | Present on every contract that is dispatched: the snapshot the pre-dispatch Permissions and FileSafe evaluation used. Absent only on a contract refused before that evaluation ran. |
| `configured`, `allowed`, `injected`, `visible_to_model` | boolean | Copied from the producing tool's `ToolNamespaceEntry` in the `ActiveToolNamespaceReceipt` current at dispatch. |
| `created_at_utc` | RFC 3339 UTC string | Stamped by the runtime when it builds the contract, before dispatch. |
| `schema_version` | string | `1.0.0`. |

Variants are exclusive. Exactly the content field the kind names is present; the other three content fields are absent:

| `invocation_kind` | Required content field | `interpreter_kind` | Dispatch |
|---|---|---|---|
| `shell_string` | `shell_string` | any value except `none`; with `terminal_session_id`, the shell of that session | Session-bound: submit to the new or reused live shell using the terminal write and completion rules above. Standalone (no `terminal_session_id`, never produced by `bash`): run the text as one command argument for a one-shot process with `-c` (`bash`, `zsh`, `sh`, `fish`), `-NoProfile -Command` (`pwsh`, `powershell`) or `/d /s /c` (`cmd`). |
| `argv` | `argv` | `none` | Direct exec of `argv`; never routed through a shell (T-171). |
| `powershell_script` | `powershell_script` | `pwsh` or `powershell` | Needs the inspected-wrapper receipt and, when configured, one-shot approval (T-171). |
| `pty_input` | `pty_input_ref` | the shell of the bound terminal session; not `none` | The referenced bytes are written to the `terminal_session_id` session, exactly and with nothing appended, under the DL-181 and SMPFS-182 write rules. |
| `tui_automation` | none defined | none defined | Reserved, not admitted: no registered tool produces this kind and no body field exists for it. A contract carrying it is refused with `validation_error` before dispatch until an owner registers a TUI-automation tool and adds its body field to this table. |

A contract that breaks a presence, type or variant rule is refused with `validation_error` before dispatch and nothing runs. Approval UI shows the one content field verbatim beside `invocation_kind`, `interpreter_kind` and `executable_path`. For a terminal target it identifies the new shell or the existing terminal by its tab. For a standalone target it shows the one-shot interpreter form and flags (T-171 criterion 2).

#### `ActiveToolNamespaceReceipt` typed contract (added 2026-11-25)

T-172's receipt is one immutable record per session namespace generation:

| Field | Type | Rule |
|---|---|---|
| `receipt_id` | string | Opaque and unique. |
| `session_id` | string | The session the namespace belongs to. |
| `thread_id` | string | |
| `run_id` | string, optional | Present for run-scoped sessions. |
| `provider_id`, `model_id` | string | The route that receives the tool schemas. |
| `namespace_generation` | integer ≥ 1 | Rises by one on every change to any entry; a change always writes a new receipt. |
| `catalog_generation` | integer | The `CapabilityMaterializationReceipt.catalog_generation` it was built from (§1.0A). |
| `policy_snapshot_id` | string | |
| `entries[]` | array of `ToolNamespaceEntry` | One per tool namespace, ordered by the §1.0A schema order. |
| `created_at_utc` | RFC 3339 UTC string | |
| `schema_version` | string | `1.0.0`. |

`ToolNamespaceEntry` fields: `namespace_id` (string; the canonical tool or family name, such as `bash`, `computer.screen`, or `mcp.<server>`), `capability_ref` (string; the `CapabilityStageRecord` capability), `configured`, `allowed`, `injected`, `visible_to_model`, `visible_to_ui` (all boolean), `startup_status` (closed enum `not_required`, `pending`, `ready`, `failed`, `timed_out`), `denial_reason_code?`, `schema_ref?` (`{ schema_id, schema_version, schema_sha256 }`, required when `visible_to_model` is true), and `evidence_ref?` (string).

`configured` is true when the capability's `installed` and `project_enabled` stages are true; `allowed` when `policy_available` is also true; `injected` when its L2 schema was materialized into this provider request. `injected` requires `allowed`, `allowed` requires `configured`, `visible_to_model` requires `injected`, and `visible_to_ui` requires `configured`. `denial_reason_code` is required whenever any of the five booleans is false or `startup_status` is `pending`, `failed`, or `timed_out`; its values are the §1.0A omission codes (`not_installed`, `project_disabled`, `policy_denied`, `incompatible_runtime`, `unavailable`, `not_selected`, `budget_deferred`, `schema_unavailable`, `collision_suppressed`) plus `provider_not_receiving`, `startup_pending`, and `startup_failed`. When all five booleans are true, `startup_status` decides the code: `pending` gives `startup_pending`, and `failed` or `timed_out` gives `startup_failed`; `ready` and `not_required` carry no code. A `startup_pending` denial is not final: the startup settling is an entry change, so it writes the next receipt generation with `startup_status` `ready` (no code) or `failed`/`timed_out` (`startup_failed`).

A tool may be dispatched only when its entry has all five booleans true and `startup_status` is `ready` or `not_required`. Any other entry denies the call with that entry's `denial_reason_code` before dispatch (T-172 criterion 2). Tool mentions, UI chips, and model-visible schemas read one receipt at one `namespace_generation` (T-172 criterion 3).

Example:

```json
{
  "receipt_id": "atnr_01",
  "session_id": "sess_7",
  "thread_id": "thr_3",
  "provider_id": "provider_a",
  "model_id": "model_a",
  "namespace_generation": 4,
  "catalog_generation": 12,
  "policy_snapshot_id": "pol_88",
  "entries": [
    { "namespace_id": "bash", "capability_ref": "builtin:bash", "configured": true, "allowed": true, "injected": true, "visible_to_model": true, "visible_to_ui": true, "startup_status": "not_required", "schema_ref": { "schema_id": "pm.tool.bash", "schema_version": "1.0.0", "schema_sha256": "<64 hex>" } },
    { "namespace_id": "computer.screen", "capability_ref": "builtin:computer.screen", "configured": true, "allowed": false, "injected": false, "visible_to_model": false, "visible_to_ui": true, "startup_status": "not_required", "denial_reason_code": "policy_denied" }
  ],
  "created_at_utc": "2026-11-25T15:00:00Z",
  "schema_version": "1.0.0"
}
```

Persistence of this receipt is not settled here: it needs a storage registration in `Plans/storage-plan.md` (a redb family or an admitted seglog event family), which this section does not create.

#### `ProviderToolTurnAdmissionGate` typed contract (T-169, added 2026-11-26)

One gate record is written for every provider tool call before the turn that carries it may enter replayable history or be dispatched.

| Field | Type | Rule |
|---|---|---|
| `gate_id` | string | Opaque and unique; minted by PM, never taken from the provider. It is the call's PM identity in every record that names the call. |
| `tool_call_id` | nonempty string, optional | The provider's own id for the call judged. An omitted or empty provider id is absent here and always denied: as `tool_call_id_missing`, or as `length_truncated` when that check fired first. PM never invents a value for it. |
| `call_index` | integer, at least 0 | The call's position among the tool calls of its provider turn, in stream order. With `gate_id` it identifies a call that has no provider id. |
| `provider_id`, `model_id` | string | The route that produced the call. |
| `allowed` | boolean | True only when every check below passes. |
| `denial_reason_code` | closed enum, optional | Required when `allowed` is false, absent when it is true. |
| `permission_snapshot_id` | string, optional | The Permissions snapshot the dispatch check used; present whenever that check ran. |
| `capability_snapshot_id` | string, optional | The `Plans/Models_System.md` capability snapshot of the route; present whenever the route has one. |
| `created_at_utc` | RFC 3339 UTC string | |

Checks, in this order; the first that fails gives the code: `length_truncated` (the provider ended the tool-call deltas with a length finish reason; checked first, so a length-ended call keeps this code even when its id, name or arguments are also incomplete, which is the Truncation gate case of §3.5 and T-167's `partial_truncated` rule), `tool_call_id_missing` (the call has no id), `tool_call_id_duplicate` (the id was already admitted in this session), `empty_tool_call` (no tool name), `args_unparseable` (streamed JSON or tool XML is partial, or the arguments are not one complete JSON value, in a call that did not end on length), `tool_not_in_namespace` (the `ActiveToolNamespaceReceipt` current for the turn has no entry for the tool), then the namespace dispatch rule above (an entry that does not permit dispatch denies with its own `denial_reason_code`), `schema_invalid` (the arguments fail that entry's `schema_ref` schema), and `provider_metadata_missing` (provider-native metadata the route requires is absent). `denial_reason_code` is closed to these eight codes plus the `ToolNamespaceEntry.denial_reason_code` values.

A denied call never enters replayable history and is never dispatched. The gate emits one `provider_turn_malformed` record per denied call, using the payload below (T-169). The eight gate codes normalize to `failure_class = structured_output_invalid` and follow its `Plans/Executor_Protocol.md` §7.1 row (max retries 2, no backoff). If another provider-turn retry is admitted under that row and the existing retry budget and loop rules, the tool turn settles `retryable`. Otherwise it settles `malformed` and the run takes that classifier's escalation. The one exception is `length_truncated`: it follows the same retry row and settles `partial_truncated` on every attempt, as T-167 requires. Its structured error is `truncated_by_length` (Truncation gate), and no argument is synthesized. A namespace denial settles `fatal` with the receipt entry's own code and does not retry. An admitted provider retry requests one replacement for the failed turn, even when several calls were denied. It performs no invocation retry under §3.5.0A or "Retry classification and bounded recovery".

All four records for a denied call carry the same `gate_id`: the gate record, the `provider_turn_malformed` record, the `ToolTurnSettlement` and the `ToolRecoveryEnvelope`. Copy the original provider id to each record when available. If it is absent, omit `tool_call_id` from the gate, malformed record and settlement, and omit `original_tool_call_id` from the recovery envelope. The envelope has `retryable: false` because the denied call itself cannot be dispatched again. Its `status` is `truncated` for `length_truncated`, `blocked` for a namespace denial and `failed` for other gate denials. Persistence of gate and `provider_turn_malformed` records waits on the same Storage registration as the receipt above.

#### `provider_turn_malformed` payload (T-169)

The payload is one UTF-8 JSON object containing only the following members. Optional members are omitted when absent. Use `gate_id` as its record identity and to resolve the gate's provider/model route. The payload is per-call recovery evidence outside replayable assistant history. The turn-level history admission and quarantine contract remains owned by `Plans/Prompt_Pipeline.md#PP-060`.

| Field | Type | Rule |
|---|---|---|
| `record_type` | string constant | `provider_turn_malformed`. |
| `schema_version` | string constant | `1.0.0`. |
| `gate_id` | nonempty string | Matches the denied gate record. |
| `call_index` | integer, at least 0 | Copy the gate's position in the provider turn. |
| `tool_call_id` | nonempty string, optional | Copy the gate's original provider id when present. |
| `denial_reason_code` | closed enum | Copy the gate's reason, including the receipt's namespace reason when that check denied admission. |
| `raw_redacted_state` | closed enum | `available` if redacted provider evidence could be captured and referenced, otherwise `unavailable`. |
| `raw_redacted_ref` | nonempty string, optional | Required when `raw_redacted_state` is `available`, otherwise absent. Resolves to evidence from the same provider turn containing the rejected call's source as received, after secret redaction. |
| `created_at_utc` | RFC 3339 UTC string | Copy the gate's timestamp. |

Capture evidence with the bounded redaction and access controls of §3.5.0A. The reference is opaque to the provider. The payload carries no inline provider bytes or hashes of unredacted material. If capture or redaction fails, use `unavailable` and preserve the denial, settlement and retry decision. A `length_truncated` settlement's `truncation_ref` still resolves to this record even when its source evidence is unavailable.

Example of a length-ended call cut off before its provider id arrived, with redacted source evidence available:

```json
{
  "record_type": "provider_turn_malformed",
  "schema_version": "1.0.0",
  "gate_id": "gate_42",
  "call_index": 0,
  "denial_reason_code": "length_truncated",
  "raw_redacted_state": "available",
  "raw_redacted_ref": "redacted_42",
  "created_at_utc": "2026-11-26T12:00:00Z"
}
```

#### `ToolTurnSettlement` typed shape (T-167, added 2026-11-26)

One immutable settlement is written per tool call attempt, including a call the admission gate denied. It carries one `settlement_state`; when several conditions hold at once, the §3.5 precedence (`fatal` > `malformed` > `partial_truncated` > `redacted` > `nullable_content` > `partial` > `retryable` > `retained` > `success`) picks that one value, and the refs of the other conditions that hold are still present.

| Field | Type | Rule |
|---|---|---|
| `settlement_id` | string | Opaque and unique. |
| `tool_call_id` | nonempty string, optional | The provider's id for the call. Absent exactly when the gate received no id or an empty id, which it always denies. |
| `gate_id` | string, optional | The `ProviderToolTurnAdmissionGate` record of the call. Present for every provider tool call; required when `tool_call_id` is absent. |
| `settlement_state` | closed enum | One of the nine values above. |
| `result_ref` | string, optional | Reference to the normalized tool result, a payload reference when spilled (DL-270, §3.5.0A). Present for every dispatched call that returned a result, so for `success` unless the tool's own contract omits it; absent for a call the gate denied. |
| `error_ref` | string, optional | Reference to the structured error (its code, such as a gate code or `heartbeat_lost`, and the `ToolRecoveryEnvelope`). Required for `malformed`, `retryable` and `fatal` and for every gate denial; absent for `success`. |
| `truncation_ref` | string, optional | Reference to the truncation facts: the bounded head/tail, exact original size and artifact ref of §3.5.0A, or the `provider_turn_malformed` record of a `length_truncated` denial. Required whenever output or arguments were truncated, so always for `partial_truncated`; absent for `success`. |
| `redaction_ref` | string, optional | Reference to the redaction applied. Required whenever any result or output content was redacted, so always for `redacted`. |
| `retention_ref` | `ToolManagedOutputRef` string, optional | The SP-337 content ID of this attempt's retained output, defined by T-177. Present whenever output was successfully spilled or retained, so always for `retained`. |
| `retry_after_ms` | integer, at least 0, optional | Present only with `retryable`, when the retry row or a provider minimum delay sets one. |
| `created_at_utc` | RFC 3339 UTC string | |
| `schema_version` | string | `1.0.0`. |

`success` is legal only under the §3.5 rule (required result, error, truncation, retention and redaction metadata normalized and persisted, or intentionally omitted by the tool's own contract); a settlement that would break a presence rule above is never written as `success`: it takes the state the missing metadata gives (for failed retention, `fatal` or `partial_truncated`, §3.5.0A). Persistence of settlements waits on the same Storage registration as the receipt above.

#### `ToolProgressHeartbeat` contract (T-175, added 2026-11-26)

Every long-running tool call of the families `mcp`, `subagent`, `browser` and `device` emits heartbeats while it runs. The PM-side adapter that supervises the call emits them while the server, child session, browser session or device session behind it is alive and responsive, so silence means liveness was lost, not that the work is slow. A heartbeat is a live progress signal on the tool call; it is not a durable record. Command tools (`bash`) follow §3.5.1 for terminal liveness and per-invocation completion.

| Field | Type | Rule |
|---|---|---|
| `tool_call_id` | string | The running call. |
| `tool_family` | closed enum `mcp`, `subagent`, `browser`, `device` | |
| `sequence` | integer, at least 1 | Rises by one per heartbeat of the call. |
| `progress` | object, optional | `{ completed?, total?, message? }`: `completed` integer at least 0, `total` integer at least 1, `message` string of at most 200 characters. |
| `emitted_at_utc` | RFC 3339 UTC string | |

Intervals. A family emits a heartbeat at least every `heartbeat_interval_ms`. For `mcp` that is the `Plans/MCP_Integration.md` liveness default (`heartbeat_interval_ms` 15000); the other three families use the same 15000 ms default. `max_silent_interval_ms` is twice the heartbeat interval (30000 by default). A heartbeat, an output chunk or a settlement of the call resets the silence timer.

States of a running call, shown on its tool card:

| From | Event | To |
|---|---|---|
| `running` | silent for `max_silent_interval_ms` | `stalled`: the card shows the call as stalled with the time since the last signal and keeps its Stop control |
| `stalled` | any heartbeat, output chunk or settlement | `running` (or settled) |
| `stalled` | still silent when the silence reaches `heartbeat_lost_after_ms` (120000 ms for every family; an `mcp` call's own `tool_call_timeout_ms`, counted from the call's start, still applies beside it) | settled: `ToolTurnSettlement.settlement_state = fatal` with error code `heartbeat_lost`, the code the MCP synthetic settlement receipt already uses |
| `running` or `stalled` | user stops the call | settled through that tool's own stop path |

`stalled` is a display state, not a settlement: the call keeps running and nothing is retried automatically.


### Webcrawl Host Pattern Matcher Owner

Repairs row `sfk-f03e45ea5b3fd0c8b0a456cb`.

The owner for the webcrawl advanced query-pattern matcher is this Tools document under the provider-pluggable web layer. Pattern records use `pattern_id`, `host_pattern`, `path_pattern?`, `allow_subdomains`, `case_sensitive`, `scope_action`, and `owner_doc_ref`. `scope_action` values are `allow`, `deny`, and `require_confirmation`.

### DuckDuckGo Capability Canon

Repairs row `sfk-93d35815be976b651248b9bc`.

DuckDuckGo capability text is canonical only in the provider capability table and the explicit DuckDuckGo capability canon paragraph. Repeated prose in examples or migration addenda is source-lineage. The canonical posture is: DuckDuckGo search is `native-ish`, research is `pm_composed` or provider-composed when the adapter supports it, extract/fetch are PM-composed, crawl is partial, and map is unsupported unless PM supplies traversal.

### InstantGrep Ownership

Repairs row `sfk-ca8ac335e38bf1a7766e9217`.

`InstantGrep` is a promoted display label for the existing search/grep fast-path, not a new tool family. Canonical owner is `Plans/Tools.md` with command family `cmd.search.instant_grep`. Required fields for an instant-grep request are `query`, `root_ref`, `include_globs[]?`, `exclude_globs[]?`, `case_sensitive`, `max_results`, and `timeout_ms`.

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_BEGIN -->
