# Shard 038: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/Tools.md`

Source lines: L12421-L12534

Source SHA256: `6bf31b611dd8e97cde68ed44dacddde22cce456ef5b95348899865d6fc5974fc`

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

`ToolTurnSettlement` fields are `settlement_id`, `tool_call_id`, `settlement_state`, `result_ref?`, `error_ref?`, `truncation_ref?`, `redaction_ref?`, `retention_ref?`, `retry_after_ms?`, `created_at_utc`, and `schema_version`.

`settlement_state` values are `success`, `partial`, `partial_truncated`, `malformed`, `nullable_content`, `redacted`, `retained`, `retryable`, and `fatal`. `success` is legal only when required result, error, truncation, retention, and redaction metadata are normalized.

`CommandInvocationContract` fields are `invocation_id`, `tool_call_id`, `invocation_kind`, `interpreter`, `argv?`, `shell_string?`, `powershell_script?`, `pty_input_ref?`, `cwd`, `env_policy_ref`, `permission_snapshot_id?`, `configured`, `allowed`, `injected`, `visible_to_model`, `created_at_utc`, and `schema_version`.

`invocation_kind` values are `shell_string`, `argv`, `powershell_script`, `pty_input`, and `tui_automation`.

`ProviderToolTurnAdmissionGate` fields are `gate_id`, `tool_call_id`, `provider_id`, `model_id`, `allowed`, `denial_reason_code?`, `permission_snapshot_id?`, `capability_snapshot_id?`, and `created_at_utc`.

#### `interpreter` type and the `bash` adapter binding (added 2026-11-25)

`CommandInvocationContract.interpreter` is an object `{ interpreter_kind, executable_path, version? }`. `interpreter_kind` is the closed enum `bash`, `zsh`, `sh`, `fish`, `pwsh`, `powershell`, `cmd`, and `none`; `executable_path` is the absolute path the runtime resolved, never a bare name; `version` is an optional string. `none` is legal only with `invocation_kind = argv` (direct exec with no shell). A call whose interpreter cannot be resolved is refused with `spawn_failed` before dispatch.

Every `bash` tool call (§3.5.1) produces exactly one `CommandInvocationContract` before dispatch, mapped field by field:

| Contract field | Value for a `bash` call |
|---|---|
| `invocation_id` | New for every call, also when `shellId` reuses a session. |
| `tool_call_id` | The `bash` tool call's id. |
| `invocation_kind` | Always `shell_string`. `bash` never produces `argv`, `powershell_script`, `pty_input`, or `tui_automation`. |
| `interpreter` | With `shellId`: the shell of the bound `terminal_session_id` (DL-181). Without it: the shell the runtime resolves for the frozen Project/worktree or Computer/working-root context (T-187) when it creates the binding. |
| `shell_string` | `command`, byte for byte: no trimming, re-quoting or splitting. |
| `argv`, `powershell_script`, `pty_input_ref` | Absent. |
| `cwd` | The frozen working root (T-187) for a new binding; for a reused `shellId`, the session's working directory observed at dispatch. |
| `env_policy_ref` | The environment policy of the shell binding. |
| `permission_snapshot_id` | The snapshot the pre-dispatch Permissions and FileSafe evaluation used. |
| `configured`, `allowed`, `injected`, `visible_to_model` | Copied from the `bash` entry of the `ActiveToolNamespaceReceipt` current at dispatch (below). |

`mode`, `initial_wait`, `detach`, and `shellId` are execution controls of §3.5.1 and are not contract fields. A new binding runs `shell_string` as one argument to the interpreter (`-c` for `bash`, `zsh`, `sh`, and `fish`; `-NoProfile -Command` for `pwsh` and `powershell`; `/d /s /c` for `cmd`); a reused binding receives it as one complete command line under the DL-181 and SMPFS-182 write rules. `command` is never executed as `argv[0]`, and a non-string `command` is `validation_error`. `powershell_script` stays reserved for inspected PowerShell wrapper scripts (T-171) and `pty_input` for raw input to an interactive program; neither is produced by `bash`. Approval UI shows `shell_string` verbatim beside `interpreter_kind` and `executable_path`.

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

`configured` is true when the capability's `installed` and `project_enabled` stages are true; `allowed` when `policy_available` is also true; `injected` when its L2 schema was materialized into this provider request. `injected` requires `allowed`, `allowed` requires `configured`, `visible_to_model` requires `injected`, and `visible_to_ui` requires `configured`. `denial_reason_code` is required whenever any of the five booleans is false or `startup_status` is `failed` or `timed_out`; its values are the §1.0A omission codes (`not_installed`, `project_disabled`, `policy_denied`, `incompatible_runtime`, `unavailable`, `not_selected`, `budget_deferred`, `schema_unavailable`, `collision_suppressed`) plus `provider_not_receiving` and `startup_failed`.

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
