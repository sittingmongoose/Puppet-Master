# Shard 039: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/FileSafe.md`

Source lines: L14709-L14745

Source SHA256: `71445d627ac4db3042d0ba37f1d17b701496942d9972dcd09bfcc94dee617562`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime FileSafe rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-e8baa3796f5c29cdb66f46eb`: `RedactionSettlement` fields are `settlement_id`, `source_ref`, `redaction_profile_id`, `decision`, `redacted_artifact_ref?`, `blocked_reason_code?`, and `created_at_utc`. `ObservabilityEnvelope` fields are `envelope_id`, `trace_id`, `event_refs[]`, `sampling_policy_id`, `quota_class`, `redaction_settlement_id`, and `created_at_utc`. `TracePersistencePolicy` fields are `policy_id`, `sample_rate`, `max_bytes_per_trace`, `retention_days`, `redaction_required`, and `export_allowed`.

### Trace persistence limits and sampling rule (2026-11-25)

This completes `sfk-e8baa3796f5c29cdb66f46eb` for the "bounded per-run log quotas" and "log sampling levels" of F2-197; the redaction hook stays where F2-195 puts it. Every log or trace event bound for disk passes these steps in this order, and a later step never runs on an event an earlier step dropped: (1) sensitivity classification; (2) `RedactionSettlement` (F2-195); (3) severity and sampling filter; (4) quota check; (5) write. Disk bytes are counted after redaction, as the serialized record written.

**`TracePersistencePolicy` fields and limits.**

| Field | Type | Allowed values | Default |
| --- | --- | --- | --- |
| `policy_id` | string | non-empty | — |
| `sampling_level` | enum | `errors`, `standard`, `debug` | `standard` |
| `sample_rate` | number | 0.0 to 1.0 inclusive | 1.0 |
| `max_bytes_per_trace` | integer bytes | 1 MiB to 64 MiB | 8 MiB |
| `max_bytes_per_run` | integer bytes | 16 MiB to 1 GiB, and at least `max_bytes_per_trace` | 256 MiB |
| `terminal_coalesce_ms` | integer ms | 16 to 1000 | 100 |
| `retention_days` | integer days | at least 1 | the retention class `Plans/storage-plan.md` assigns to the log family; this policy references it and never overrides it |
| `redaction_required` | boolean | always `true` for any persisted trace | `true` |
| `export_allowed` | boolean | `true` only when the user enables the optional OTLP export adapter | `false` |

**Sampling levels.** Event severities are `error`, `warn`, `info`, `debug`, `trace`. `errors` persists `error` and `warn`; `standard` adds `info`; `debug` adds `debug` and `trace`, subject to `sample_rate`. `sample_rate` applies only to `debug` and `trace` events and only at level `debug`. The decision is per trace, so a kept trace is complete: its `debug`/`trace` events persist when the first 8 bytes of `sha256(trace_id)`, read as an unsigned big-endian integer and divided by 2^64, are less than `sample_rate`. `error` and `warn` events, and the join events usage needs (attempt start, attempt end, and each usage record carrying `attempt_id`), are never sampled out at any level.

**Terminal streams.** Terminal output is persisted as chunks, never per character: bytes are coalesced and a chunk is written when `terminal_coalesce_ms` has passed since the chunk opened or it reaches 64 KiB, whichever is first.

**`quota_class`** on `ObservabilityEnvelope` is a closed enum: `provider_trace`, `stream` (WebSocket/SSE), `terminal`, `subagent`, `tool`, `mcp`, `memory`, `support_bundle`. Every class counts toward the same per-run total; quotas reset when a new run starts.

**Overflow.** When a trace reaches `max_bytes_per_trace`, or a run reaches `max_bytes_per_run`, `info`, `debug` and `trace` events for that trace or run stop persisting. `error`, `warn` and usage join events continue into a reserve of 10% of the limit that was reached; past the reserve nothing more of that trace or run is written. On first overflow exactly one `quota_exceeded` marker is written, carrying `trace_id` or `run_id`, the limit reached, and running counts of dropped events and dropped bytes, which are updated in place of further writes. Overflow never pauses, fails or slows the run, and the run's log view shows "Log limit reached; N events not saved".

**Other enums.** `RedactionSettlement.decision` is `clean` (nothing to redact; written as is), `redacted` (written from `redacted_artifact_ref`) or `blocked` (not written; `blocked_reason_code` set; counted as a dropped event). `ObservabilityEnvelope.sampling_policy_id` names the `TracePersistencePolicy.policy_id` in force when the envelope was created.

**Acceptance.** (1) With defaults, a run whose events exceed 256 MiB after redaction writes at most 256 MiB plus the 10% reserve, the reserve holds only `error`, `warn` and usage join events, and exactly one `quota_exceeded` marker exists with correct dropped counts. (2) The same `trace_id` and `sample_rate` give the same keep or drop decision on every run and machine. (3) At level `errors`, no `info`, `debug` or `trace` event is on disk, and every usage record still joins by `attempt_id`. (4) A terminal emitting one character per millisecond for 10 s writes at most 10 s / `terminal_coalesce_ms` + 1 chunks. (5) An event whose settlement is `blocked` is never on disk and appears in the dropped count.

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_BEGIN -->
