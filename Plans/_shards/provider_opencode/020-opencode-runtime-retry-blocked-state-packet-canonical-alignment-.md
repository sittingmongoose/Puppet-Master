# Shard 020: OpenCode Runtime Retry / Blocked-State / Packet Canonical Alignment (2026-03-09)

Source: `Plans/Provider_OpenCode.md`

Source lines: L640-L703

Source SHA256: `0c79b2e1085dbb56e95d90c05a6bbb966fa1b78d08709f04632790bd7624bed1`

---

## OpenCode Runtime Retry / Blocked-State / Packet Canonical Alignment (2026-03-09)


OpenCode-specific runtime behavior must remain aligned with the canonical runtime scheduler, retry taxonomy, safe-point contract, remediation lineage, runtime packet, and usage pipeline.

### Required OpenCode runtime fields

Each OpenCode-backed attempt MUST preserve the shared runtime identity and correlation bundle:
- `run_id`
- `thread_id`
- `node_id`
- `attempt_id`
- `retry_count` when present
- requested/effective model identifiers
- requested/effective permission snapshot identifiers when relevant
- `replan_generation`
- `mutation_capable`
- `safe_point_id?`
- `remediation_root_id?`
- `remediation_parent_attempt_id?`
- `remediation_generation?`

If a field is not transmitted directly to an OpenCode HTTP endpoint, the adapter MUST still preserve it in local correlation state and attach it to normalized provider events, storage records, and retry/recovery decisions.

### Required rules
- preserve canonical runtime identity (`run_id`, `thread_id`, `node_id`, `attempt_id`, generation, snapshot ids, safe point, and remediation lineage) across the request/stream lifecycle
- OpenCode transport reconnect logic may reconnect only to observe an existing attempt; it MUST NOT silently resubmit prompts, reset attempt identity, or invent provider-local fallback loops
- once a prompt/request has been accepted for execution, any retry decision MUST round-trip through the canonical runtime scheduler and failure taxonomy
- OpenCode-specific auth, transient, structured-output, and tool-denial signals MUST normalize into canonical `blocked_reason_code` / `failure_class` values before orchestration or UI consumes them
- prerequisite resolution after auth or permission recovery MUST surface a canonical scheduler wake and create a new attempt snapshot rather than mutating the blocked attempt in place
- a `safe_point_id` created before a mutation-capable OpenCode attempt remains attached across the entire request/stream lifecycle
- recovery restores that rerun work use a new `attempt_id` while preserving lineage references to the restored parent context
- replan invalidation MUST be checked before rerunning a blocked or retried OpenCode attempt; stale attempts from an older `replan_generation` must not resume silently
- any OpenCode-local retry wording is superseded by canonical runtime retry ownership

### Canonical failure and blocked mapping

OpenCode-specific signals MUST collapse into the shared runtime taxonomy before they reach orchestration or UI layers.

| OpenCode / server condition | Canonical runtime classification | Required behavior |
|---|---|---|
| `401` / invalid server credentials / server auth expiry for the OpenCode server realm | `blocked_reason_code = auth_expired` (server realm) | Surface blocked recovery; require credential refresh before explicit retry |
| Upstream provider auth challenge or expired provider session reported by OpenCode | `blocked_reason_code = auth_expired` (provider realm) | Preserve blocked node/thread state and wait for auth recovery |
| Timeout, connection refused, transient SSE disconnect after submission, HTTP 5xx, provider outage, or rate limiting | `failure_class = provider_transient` | Runtime retry/backoff policy applies; no OpenCode-local retry policy may override it |
| Malformed structured output, missing required JSON shape, or incomplete normalized tool payload | `failure_class = structured_output_invalid` | Route into structured-output remediation / retry policy |
| Tool-policy refusal, permission denial, FileSafe denial, or external side-effect approval block surfaced through OpenCode-mediated work | Preserve the already-determined canonical runtime class (`permission_denied`, `filesafe_blocked`, `external_side_effect_blocked`, etc.) | The adapter MUST NOT collapse these to generic `error` or `provider_failed` |

### Capability and usage alignment

OpenCode capability reporting MUST stay consistent with the shared provider contract.

Required declarations:
- transport class = server-bridged HTTP/SSE
- supports streaming normalized events
- supports tool use only through the canonical tool-policy snapshot
- uses split auth realms (server credentials vs upstream provider auth)
- performs no hidden runtime retries

If OpenCode or the selected upstream model does not support a requested runtime control, Puppet Master MUST record the control as unsupported/skipped in effective runtime state rather than silently ignoring it.

**Usage and Ledger alignment:** OpenCode server returns message-level usage; the adapter maps it to normalized usage (same shape as `usage.event`). Persistence and Ledger/Usage consumption follow `Plans/storage-plan.md` and `Plans/usage-feature.md`. For implementers, the OpenCode product pipeline (`Session.getUsage`, processor finish-step) is the reference for how message metadata becomes stored usage; terminology should not drift.

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Provider_Stream_Mapping_External_Reference_A2A.md, ContractName:Plans/Models_System.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/usage-feature.md

