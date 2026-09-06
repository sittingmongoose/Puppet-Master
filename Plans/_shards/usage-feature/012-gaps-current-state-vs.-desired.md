# Shard 012: Gaps (Current State vs. Desired)

Source: `Plans/usage-feature.md`

Source lines: L433-L645

Source SHA256: `b992d366f78133b51691900eac1e8a6e32e7b48648348bd6984c1acc2ab781d1`

---

## Gaps (Current State vs. Desired)

### Canonical usage pipeline
- Usage events are emitted by tool invocation and aggregated into usage records.
- UsageRecord is the canonical schema for all usage data (tokens, costs, tool calls, API calls).
- Usage records are immutable once committed; corrections require a new record with explicit versioning.
- Tool, helper, and `/helper/background` usage emission keeps lineage to the parent run/thread plus the concrete helper/tool invocation so background work can be attributed without flattening it into the foreground assistant message.

#### Debug investigation phase attribution
- Usage projections that summarize Debug Mode work may group usage by investigation lifecycle phase, including `instrumenting`, `reproducing`, `collecting_evidence`, `analyzing`, and `applying_fix`.
- These labels are usage and analytics attribution dimensions on records and rollups; they do not make Usage the owner of Debug runtime state-machine semantics.

### Billing identity, attribution, and pricing metadata
- Billing identity is derived from account context and subscription tier.
- Provider `/billing` and `/usage/billing` metadata remains attribution and pressure evidence; it does not replace the canonical usage_record, entitlement, or billing-entity contracts.

#### Shared runtime identity
- Carry execution_role plus requested/effective operational identity in shared runtime identity.
- Project them into effective-resolution, attempt, usage, and inspector surfaces.
- Role-scoped routing must appear in effective-resolution and usage schemas when policy/storage carries role scope; Usage must not rely on policy/storage-only role state for canonical usage attribution.
- Canonical Usage routing stays on shared usage identity, not feature-local cost or receipt notions.

#### Attribution family, anchors, and pricing metadata
- Attribution metadata links usage to project, run, node, and account for cost allocation.
- Share one attribution family across tool events, runtime artifacts, receipts, and usage records.
- Carry run/attempt/thread/node/artifact/provider/usage anchors plus execution/runtime identity fields.
- Pricing metadata includes rate cards and surcharges that apply to each usage event.

#### export taxonomy
- Export taxonomy documents which usage metrics are surfaced in export manifests and accounting reports.
- Export taxonomy is versioned and stable across release boundaries.

##### Export classes
- Define record export, bundle export, and view export as distinct export classes.
- cov-016 exact item present: Define record export, bundle export, and view export as distinct export classes

##### Export manifest requirements
- Require export manifests with export_id/export_kind/project scope/included ids/trust-state disclosure.
- cov-016 exact item present: Require export manifests with export_id/export_kind/project scope/included ids/trust-state disclosure

#### account history
##### Durable account-pressure and switch events
- Add append-only account_pressure_episode and account_switch_event families.
- Let Usage, History, Ledger, and Orchestrator consume the same durable event family.
- Usage consumes Multi-Account selection flow, pressure `/switch` history, and role-aware routing through the same requested/effective disclosure model, so usage projections show both requested account intent and effective account outcome.
- Usage switch explanations retain switch lineage in canonical records; rollups may explain selected/effective account outcomes only when the switch lineage remains reachable.
- cov-092 exact item present: Add append-only account_pressure_episode and account_switch_event families
- cov-092 exact item present: Let Usage, History, Ledger, and Orchestrator consume the same durable event family

##### Recovery and execution-role continuity
- Transfer execution_role, requested_account_id, operational_identity, account-switch and pressure ownership, blocked_sequence minting, startup recovery handshake, and DAE jail/approval policy into owner and consumer docs.
- Carry usage switch-history and usage execution-role follow-through.
- cov-162 exact item present: Transfer execution_role, requested_account_id, operational_identity, account-switch and pressure ownership, blocked_sequence minting, startup recovery handshake, and DAE jail/approval policy into owner and consumer docs
- cov-162 exact item present: Carry usage switch-history and usage execution-role follow-through

#### artifact drill-through section
##### Local keys and bridge fields
- Use attempt_id as local anchor, provider_attempt_ref as provider/runtime bridge, usage_event_ref as usage bridge, and receipt refs as external side-effect lineage bridge.
- None of those bridge fields replace the primary local key.
- Usage inspector routing uses `inspector_target = details | evidence | usage | lineage` so details, evidence, usage, and lineage pivots are explicit rather than inferred from timestamps or surrounding UI state.
- Prefer `usage_event_ref` rather than timestamp heuristics when routing cost-bearing artifacts to Usage and Ledger.
- Runtime artifacts summarizing external operations must carry receipt linkage.
- Usage pivots move away from `tier_id` filters toward object-first `usage_event` and runtime-object pivots.

##### Usage and receipt lineage routing

History inspector deref policy is on-demand only, never eager. History rows combine the canonical runtime snapshot fields, web-operation details from `payload.meta`, and ref/blob pointers; dereferenced refs load only when the user chooses click-to-expand, preserving responsive log browsing and the inline/ref storage split.

#### help surfaces
##### Notification routing policy
- Route notifications using severity, execution impact, blocked owner, persistence, and projection trust.

##### Quiet-window policy
- Allow quiet windows for advisory warnings but not for canonical blocked episodes.

#### projection-health-aware degrade behavior
##### Projection freshness and health states
- Use current/refreshing/stale/degraded/unavailable projection states.

##### Sensitive action gating and record-backed fallback
- Gate sensitive actions on current or direct canonical revalidation and fall back to record-backed views when degraded.

### Canonical UsageRecord fields
- For gap-001 lineage, this section is also the usage-side partial-transfer anchor for ``### Unified `UsageRecord` schema expectations`` and the queue-escaped alias ``### Unified \`UsageRecord\` schema expectations``; both resolve here rather than creating a second schema section.
- UF-085 is the implementation-ready UsageRecord contract. Older field names in this section are compatibility, import, export, or display aliases unless they are repeated by UF-085.
- `usage_id` resolves to `usage_record_id` or `usage_event_ref` according to the importing source; event-primary UI routes normalize `usage_event_ref` through `object_kind = usage_event`, while a PMConcept7 Ledger attempt row normalizes `attempt_id` through `object_kind = usage_attempt` and keeps the event ref as correlation.
- `input_tokens` resolves to `input_total`; `output_tokens` resolves to `output_total`; older `cache_read_tokens`, `cached_input_tokens`, and `cache_creation_input_tokens` aliases resolve to `cache_read`, `cache_write`, `cache_write_1h`, or `cache_write_ttl` only when the provider mapper states the TTL and inclusive/exclusive semantics.
- `cost_usd` is display or migration material only. Canonical cost authority uses `cost_microdollars`, provider minor units, currency, cost_status, pricing_snapshot_id/version/date/source, and custom-provider price row refs where applicable.
- `usage_source_kind` remains source-lineage vocabulary and maps to UF-085 `source_class`, `source_confidence`, and `source_authority`; it does not replace the closed source classes `provider_reported`, `provider_header`, `cli_reported`, `local_estimated`, `pricing_estimated`, and `unknown`.
- Usage field-name rules follow the storage naming contract: shared runtime and attribution fields keep stable meanings across usage aggregation, persistence, events, and Config consumers instead of reviving tier-era labels.
- Cost-integrity display rules are `/clamp/derived-field` rules: sub-cent and sub-dollar display precision is derived from `cost_microdollars` or exact provider minor-unit receipts when available; the canonical display tiers are `<$0.01 = 6dp`, `<$1 = 4dp`, and otherwise 2dp, while `cost_usd` remains display/migration material and must not be the only canonical precision source.
- `cost_usd = cost_microdollars / 1_000_000` is derived only at display/export boundaries or compatibility import/migration edges; it is not a persisted UsageRecord authority field.
- Raw-cost provider values are retained as provenance or debug evidence only after normalization to canonical token buckets and `cost_microdollars`; raw-cost fields must not become independent billing authority.

### Ownership and consumption
- Usage owns canonical UsageRecord aggregation and display semantics; History, Ledger, Orchestrator, and runtime-artifact consumers consume the same durable event family instead of defining parallel usage schemas.
- All usage events are coerced into UsageRecord format before aggregation.

### Blocked-state and escalation surfaces
#### Shared escalation ladder and attention semantics
#### blocked_notice contract and observability
#### Blocked-owner taxonomy and surface mapping

#### Acceptance carry-through
- Define one escalation ladder shared across Orchestrator, Dashboard, thread badges, and notifications
- Keep attention_required distinct from blocked and resurface persistent blockers on meaningful change/persistence
- Expand blocked_notice beyond blocked_family and allowed_action_ids[]
- Carry escalation_level, action_available ownership, and usage observability through blocked surfaces
- Define an explicit blocked-owner 8-kind taxonomy and 5-level escalation ladder with surface mapping
- cov-053 exact item present: Define one escalation ladder shared across Orchestrator, Dashboard, thread badges, and notifications
- cov-053 exact item present: Keep attention_required distinct from blocked and resurface persistent blockers on meaningful change/persistence
- cov-146 exact item present: Expand blocked_notice beyond blocked_family and allowed_action_ids[]
- cov-146 exact item present: Carry escalation_level, action_available ownership, and usage observability through blocked surfaces
- cov-146 stale token retired: allowed_action_ids[]
- cov-198 exact item present: Define an explicit blocked-owner 8-kind taxonomy and 5-level escalation ladder with surface mapping

### Problem 1: Platform APIs require secrets

- **Risk**
  - Claude Admin API and Copilot metrics require `ANTHROPIC_API_KEY` and `GITHUB_TOKEN`/`GH_TOKEN`. Many users will not set these; 5h/7d from APIs would be missing or "N/A" for those platforms.
- **Impact**
  - Users might assume "no data" means "no usage" instead of "API not configured"; or they may not know how to enable live data.
- **Mitigation**
  - In Usage view (or tooltip), document which env vars enable live data per platform (e.g. "Set ANTHROPIC_API_KEY for Claude 5h/7d").
  - **Always** show a fallback: display the project-local canonical usage summary available from current rollups/projections even when provider API quota data is unavailable.
  - Clearly label source: "From this project's usage" vs "From Claude (API)" when both exist.

### Problem 2: Rate limits on usage APIs

- **Risk**
  - Polling Claude/Copilot/Gemini usage endpoints too frequently could hit rate limits or consume quota.
- **Impact**
  - API errors, blocked requests, or user quota consumed by the app itself.
- **Mitigation**
  - Background refresh at a reasonable interval (e.g. 5-15 min); cache last result; expose "Refresh" for on-demand update.
  - After each run, update usage from the run result (tokens/cost when available) without an extra API call.
  - Document recommended refresh interval per platform if limits are known.

### Problem 3: Two usage tracker types and ad-hoc Ledger parsing

- **Risk**
  - `state::UsageTracker` + `types::UsageRecord` vs. `platforms::UsageTracker` + `UsageEvent`/`UsageSummary`; Ledger parses raw JSON with different field names. Duplicate logic and schema drift: writers and readers can get out of sync.
- **Impact**
  - Ledger shows wrong or missing fields; 5h/7d aggregation might miss data or double-count if we add a second reader; bugs when we change one path and forget the other.
- **Mitigation**
  - Unify on one canonical write path and one `UsageRecord` schema. If `usage.jsonl` persists, it is a mirror / compatibility artifact rather than an independent canonical source.
  - Document the schema in STATE_FILES and in code; use the same types for write and read where possible.
  - Prefer one projector/reader path for local summaries so Ledger, rollups, and UI projections do not fork into separate attribution models.

### Problem 4: 5h/7d semantics differ by platform

- **Risk**
  - Codex: 5h message limit. Claude/Copilot: org-specific windows. Gemini: quota window (e.g. reset after 8h44m). Cursor: API available for augmentation but window semantics may differ. A single "5h: X/Y" column implies identical meaning across platforms when it is not.
- **Impact**
  - User misinterprets "5h" for Gemini as the same as Codex; or we show misleading comparisons.
- **Mitigation**
  - Per-platform labels in the UI (e.g. "Codex 5h", "Claude 7d", "Gemini (estimated)") and a short tooltip or doc link explaining what each window means.
  - Avoid one generic "5h/7d" column when semantics differ; use platform-specific columns or clearly labeled sections.

### Canonical usage-window model

Usage/cooldown semantics use a generic `usage-window` model rather than hardcoded `5h/7d` assumptions.

Fields:
- `window_kind: rolling | fixed_reset | billing_cycle | session_only | unknown`
- `window_label`
- `window_scope: provider | account | account+model | org | server_profile`

Rules:
- `rolling` means the remaining amount changes against a sliding lookback interval.
- `fixed_reset` means the provider reports a fixed reset boundary or countdown for the current window.
- `billing_cycle` means quota pressure is tied to the plan or billing period rather than a short cooldown.
- `session_only` means PM has authoritative session/tool stats from the local runtime but no durable provider quota window.
- `unknown` means the UI may show inferred/estimated usage only if it labels the evidence source and avoids pretending to know reset semantics.
- `MiniMax Coding Plan` is modeled as `MiniMax` direct-provider usage metadata with a fixed 5-hour window plus explicit remains endpoint from official docs. The Usage view must preserve that provider-specific `fixed_reset` evidence instead of flattening it into a generic 5h column.

ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/Models_System.md, ContractName:Plans/storage-plan.md

### Problem 5: Ledger file size

- **Risk**
  - Event storage (seglog) grows unbounded over long-running or high-throughput projects. Very large seglogs slow analytics scan jobs and increase startup recovery time.
- **Impact**
  - Slow UI refresh for 5h/7d windows, elevated memory during rollup recalculation, or degraded startup when the seglog requires extended CRC validation.
- **Mitigation**
  - Retention policy: keep raw seglog events for a configurable window (default 90 days); archive or compact older events with an optional export-first step.
  - Seglog compaction: periodic background job consolidates older fine-grained events into daily summary records, reducing scan time while preserving attribution fidelity.
  - Rollup freshness: 5h/7d windows are served from redb rollups, not from raw event scans. Background analytics jobs refresh rollups incrementally; UI shows the last committed rollup plus an explicit freshness cue when a refresh is in progress.
  - `usage.jsonl` is a human-readable mirror only and MUST NOT be used for aggregation, rollup computation, or 5h/7d window serving. If retained for debugging, it follows the same retention policy as seglog.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md

### Problem 6: Stale data

- **Risk**
  - User sees 5h/7d that was last updated 30 minutes ago; they hit a limit in the meantime and are surprised.
- **Impact**
  - Loss of trust in the Usage view; unnecessary failed runs.
- **Mitigation**
  - Show "Last updated: &lt;time&gt;" next to 5h/7d and provide an explicit "Refresh" action; on the Usage page head this renders as an icon-only button with `title` and `aria-label` accessible names (UF-089).
  - Optional: lightweight refresh when app gains focus or when starting a new run (with rate limiting to avoid thrash).

### Problem 7: Multi-project usage

- **Risk**
  - `usage.jsonl` is per-project (`.puppet-master/usage/`). Users with many projects may expect "total usage across my projects" or get confused whether the view is project-scoped.
- **Impact**
  - Confusion about scope; feature requests for cross-project aggregation before we are ready.
- **Mitigation**
  - Clarify in UI: "Usage for this project" (or "Current project") for v1.
  - If we later support "All projects", require an explicit scope selector and document where we read from (e.g. scan multiple `.puppet-master/usage/` dirs).

---
