# Shard 039: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/FileSafe.md`

Source lines: L14709-L14769

Source SHA256: `ad899d70b09145d16caca8f16122a499904534c94336cbfdd7cf42bcdf36fd6b`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime FileSafe rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-e8baa3796f5c29cdb66f46eb`: `RedactionSettlement` fields are `settlement_id`, `source_ref`, `redaction_profile_id`, `decision`, `redacted_artifact_ref?`, `blocked_reason_code?`, and `created_at_utc`. `ObservabilityEnvelope` fields are `envelope_id`, `trace_id`, `event_refs[]`, `sampling_policy_id`, `quota_class`, `redaction_settlement_id`, and `created_at_utc`. `TracePersistencePolicy` fields are `policy_id`, `sample_rate`, `max_bytes_per_trace`, `retention_days`, `redaction_required`, and `export_allowed`.

### Trace persistence limits and sampling rule (2026-11-25)

This completes `sfk-e8baa3796f5c29cdb66f46eb` for the "bounded per-run log quotas" and "log sampling levels" of F2-197; the redaction hook stays where F2-195 puts it. Every log or trace event bound for disk passes these steps in this order, and a later step never runs on an event an earlier step dropped: (1) sensitivity classification; (2) `RedactionSettlement` (F2-195); (3) severity and sampling filter; (4) quota check; (5) write. Disk bytes are counted after redaction, as the serialized record written.

**`RedactionSettlement` and `ObservabilityEnvelope` fields.** Both records are closed. These tables type the 2026-07-08 field lists above; `ObservabilityEnvelope` also carries `run_id`, `quota_owner_kind` and `quota_owner_id`, which per-run quota accounting needs. `identity_id` and `non_secret_ref` use the like-named definitions in `Plans/source_control_contracts.schema.json`. All timestamps are RFC 3339 UTC strings. All fields are required unless their presence rule says otherwise.

| `RedactionSettlement` field | Type and presence rule |
| --- | --- |
| `settlement_id` | `identity_id`; identifies this exact pre-write decision |
| `source_ref` | `non_secret_ref`; opaque identity of the classified source, never a raw payload or local path |
| `redaction_profile_id` | `identity_id`; exact redaction profile applied |
| `decision` | Closed enum `clean` (content can be written as classified), `redacted` (write the redacted artifact), `blocked` (write no content; count one dropped event) |
| `redacted_artifact_ref` | `non_secret_ref`; present only for `redacted`, names only the sanitized output to be written |
| `blocked_reason_code` | Non-empty string; present only for `blocked`, carrying the redaction owner's reason code and no raw text |
| `created_at_utc` | UTC timestamp of settlement |

| `ObservabilityEnvelope` field | Type and presence rule |
| --- | --- |
| `envelope_id`, `trace_id` | `identity_id`; exact envelope and trace |
| `run_id` | Required `identity_id` or `null`. The value is the owning run id for run-owned events and `null` for terminal diagnostic logs or user-requested terminal diagnostic bundles that belong to no run (`Plans/Section15_MVP_Promoted_Features_Spec.md` SMPFS-076) |
| `quota_owner_kind` | Closed enum `run`, `terminal_session`, `diagnostic_bundle`. A non-null `run_id` requires `run`. A null `run_id` requires `terminal_session` for a session's diagnostic logs or `diagnostic_bundle` for a user-requested terminal diagnostic bundle |
| `quota_owner_id` | `identity_id`; equals `run_id` for `run`, `terminal_session_id` for `terminal_session`, and the bundle request id for `diagnostic_bundle` |
| `event_refs[]` | Non-empty ordered array of unique `non_secret_ref`; references only events covered by this settlement and admitted by filtering and quotas, never discarded content |
| `sampling_policy_id` | `identity_id`; identifies the `TracePersistencePolicy.policy_id` in force when the envelope was created |
| `quota_class` | Closed enum `provider_trace`, `stream` (WebSocket/SSE), `terminal`, `subagent`, `tool`, `mcp`, `memory`, `support_bundle`; all classes share the same per-run total |
| `redaction_settlement_id` | `identity_id`; resolves to the exact `clean` or `redacted` settlement for every event named by the envelope |
| `created_at_utc` | UTC timestamp of envelope creation |

**Quota owner.** Per-run accounting is kept per quota owner. Wherever the quota class, limits, overflow, quota marker and acceptance rules of this section say "run" or "per-run", they mean the envelope's quota owner: its run, or for a runless envelope its terminal session or diagnostic bundle request. `max_bytes_per_run` caps each quota owner. A `terminal_session` owner's quota and diagnostic summary settle when the session closes, and a `diagnostic_bundle` owner's when the bundle is written. The "run's log view" for a runless owner is that terminal tab's diagnostics (SMPFS-076).

**`TracePersistencePolicy` fields and limits.** DL-2602 confirms the defaults of 8 MiB per trace and 256 MiB per run.

| Field | Type | Allowed values | Default |
| --- | --- | --- | --- |
| `policy_id` | `identity_id` | non-empty | — |
| `sampling_level` | enum | `errors`, `standard`, `debug` | `standard` |
| `sample_rate` | number | 0.0 to 1.0 inclusive | 1.0 |
| `max_bytes_per_trace` | integer bytes | 1 MiB to 64 MiB | 8 MiB |
| `max_bytes_per_run` | integer bytes | 16 MiB to 1 GiB, and at least `max_bytes_per_trace` | 256 MiB |
| `terminal_coalesce_ms` | integer ms | 16 to 1000 | 100 |
| `retention_days` | integer days | at least 1 | the retention class `Plans/storage-plan.md` assigns to the log family; this policy references it and never overrides it |
| `redaction_required` | boolean | always `true` for any persisted trace | `true` |
| `export_allowed` | boolean | `true` only when the user enables the optional OTLP export adapter | `false` |

**Sampling levels.** Event severities are `error`, `warn`, `info`, `debug`, `trace`. `errors` persists `error` and `warn`; `standard` adds `info`; `debug` adds `debug` and `trace`, subject to `sample_rate`. `sample_rate` applies only to `debug` and `trace` events and only at level `debug`. The sampling decision is per trace and applies uniformly to all eligible events: its `debug`/`trace` events persist when the first 8 bytes of `sha256(trace_id)`, read as an unsigned big-endian integer and divided by 2^64, are less than `sample_rate`. `error` and `warn` events, and the join events usage needs (attempt start, attempt end, and each usage record carrying `attempt_id`), are never sampled out at any level.

**Terminal streams.** Terminal output is persisted as chunks, never per character: bytes are coalesced and a chunk is written when `terminal_coalesce_ms` has passed since the chunk opened or it reaches 64 KiB, whichever is first.

**Overflow.** Before each write, check whether its serialized redacted bytes would exceed either cap. After crossing the base limit for the trace or the run, only `error`, `warn` and usage join events can use that scope's reserve of 10% of its limit (rounded down to whole bytes). The write must fit both applicable caps, including any available reserve. The writer counts each quota-rejected event once per run even if both caps refuse it. `dropped_bytes` counts the size of those serialized redacted records. A blocked redaction contributes one `dropped_events` and zero `dropped_bytes` because it yields no safe serialized record. Filtering and sampling exclusions are outside these counts. A new run starts with fresh quotas.

**Quota marker.** The trace writer owns one bounded diagnostic summary per exact quota owner (`quota_owner_kind`, `quota_owner_id`). On the first quota refusal it sets one `quota_exceeded` marker on that summary, with `scope: trace | run`, `limit_bytes` and `trace_id` only when `scope=trace`. If both limits refuse the same write, record the run limit. The writer maintains `dropped_events` and `dropped_bytes` as monotonic, saturating unsigned 64-bit totals and publishes the final totals at run settlement. The marker and totals occupy one mutable redacted projection value, at most 1 KiB per run, accounted separately from the trace-event budget. Storage-plan §2.3.1 registration for that diagnostic value is required before durable publication. The projection is not an `EventRecord`; it never rewrites seglog or persists one event per drop. Live accounting stays with the trace writer, and overflow never pauses, fails or slows the run. The run's log view shows "Log limit reached; N events not saved" while the counts are available and shows the limit without a number if the summary cannot be verified.

**Acceptance.** (1) With defaults, a run whose events exceed 256 MiB after redaction writes at most 256 MiB plus the 10% reserve, the reserve holds only `error`, `warn` and usage join events, and exactly one `quota_exceeded` marker exists with correct dropped counts. (2) The same `trace_id` and `sample_rate` give the same keep or drop decision on every run and machine. (3) At level `errors`, no `info`, `debug` or `trace` event is on disk, and every admitted usage record still joins by `attempt_id`. (4) A terminal emitting one character per millisecond for 10 s writes at most 10 s / `terminal_coalesce_ms` + 1 chunks. (5) An event whose settlement is `blocked` is never on disk and appears in the dropped count. (6) A terminal session and a user-requested diagnostic bundle outside any run both write envelopes with `run_id = null`. Session diagnostics use `quota_owner_kind = terminal_session` and the `terminal_session_id` as `quota_owner_id`. Bundle writes use `quota_owner_kind = diagnostic_bundle` and the bundle request id as `quota_owner_id`. The same caps, reserve and single marker apply independently to each owner. (7) A run-owned envelope carries a non-null `run_id`, `quota_owner_kind = run` and `quota_owner_id = run_id`. An envelope with a missing `run_id` or a mismatched quota owner fails validation.

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_BEGIN -->
