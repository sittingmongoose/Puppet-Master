# Shard 037: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/Tools.md`

Source lines: L12100-L12145

Source SHA256: `772174635baa735ba6ce627d3b3766e88cfe51b1b45778e641a93516d1655fdb`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum is canonical tool contract text for deferred non-runtime FABLE rows. It creates no WorkNodes, NodeSeeds, executable queues, runtime artifacts, implementation files, build tasks, final manifests, or PNC-019 receipts, and it does not mark `buildability_gate_passed` true.

### Section 10 Numbering Supersession

Repairs row `sfk-88d65b2be00892daadd2f0d8`.

- The first `## 10. Implementation plan: permissions (spec for implementers)` remains a permissions implementation-plan compatibility section.
- The second `## 10. Firecrawl provider integration` is canonically superseded as `## 11. Firecrawl provider integration`.
- Citations to Firecrawl subsections must use `Firecrawl provider integration` plus the subsection title rather than bare `§10.x` until the heading numbers are mechanically renumbered in a dedicated structural cleanup.
- Citations to permissions implementation subsections must include `Implementation plan: permissions` plus the subsection title.

### Tool Turn Contract Minima

Repairs rows `sfk-0649b6a2c860f179ee699f58`, `sfk-e257db159bd84ee85f74371d`, and `sfk-47f640ed50d4ed24f6b34c49`.

`ToolTurnSettlement` fields are `settlement_id`, `tool_call_id`, `settlement_state`, `result_ref?`, `error_ref?`, `truncation_ref?`, `redaction_ref?`, `retention_ref?`, `retry_after_ms?`, `created_at_utc`, and `schema_version`.

`settlement_state` values are `success`, `partial`, `partial_truncated`, `malformed`, `nullable_content`, `redacted`, `retained`, `retryable`, and `fatal`. `success` is legal only when required result, error, truncation, retention, and redaction metadata are normalized.

`CommandInvocationContract` fields are `invocation_id`, `tool_call_id`, `invocation_kind`, `interpreter`, `argv?`, `shell_string?`, `powershell_script?`, `pty_input_ref?`, `cwd`, `env_policy_ref`, `permission_snapshot_id?`, `configured`, `allowed`, `injected`, `visible_to_model`, `created_at_utc`, and `schema_version`.

`invocation_kind` values are `shell_string`, `argv`, `powershell_script`, `pty_input`, and `tui_automation`.

`ProviderToolTurnAdmissionGate` fields are `gate_id`, `tool_call_id`, `provider_id`, `model_id`, `allowed`, `denial_reason_code?`, `permission_snapshot_id?`, `capability_snapshot_id?`, and `created_at_utc`.

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
