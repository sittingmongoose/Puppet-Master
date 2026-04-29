## Gaps (Current State vs. Desired)

### Canonical usage pipeline
- Usage events are emitted by tool invocation and aggregated into usage records.
- UsageRecord is the canonical schema for all usage data (tokens, costs, tool calls, API calls).
- Usage records are immutable once committed; corrections require a new record with explicit versioning.

### Billing identity, attribution, and pricing metadata
- Billing identity is derived from account context and subscription tier.

#### Shared runtime identity
- Carry execution_role plus requested/effective operational identity in shared runtime identity.
- Project them into effective-resolution, attempt, usage, and inspector surfaces.
- cov-089 exact item present: Carry execution_role plus requested/effective operational identity in shared runtime identity
- cov-089 exact item present: Project them into effective-resolution, attempt, usage, and inspector surfaces

#### Attribution family, anchors, and pricing metadata
- Attribution metadata links usage to project, run, node, and account for cost allocation.
- Share one attribution family across tool events, runtime artifacts, receipts, and usage records.
- Carry run/attempt/thread/node/artifact/provider/usage anchors plus execution/runtime identity fields.
- Pricing metadata includes rate cards and surcharges that apply to each usage event.
- cov-118 exact item present: Share one attribution family across tool events, runtime artifacts, receipts, and usage records
- cov-118 exact item present: Carry run/attempt/thread/node/artifact/provider/usage anchors plus execution/runtime identity fields

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
- cov-184 exact item present: Use attempt_id as local anchor, provider_attempt_ref as provider/runtime bridge, usage_event_ref as usage bridge, and receipt refs as external side-effect lineage bridge
- cov-184 exact item present: None of those bridge fields replace the primary local key

##### Usage and receipt lineage routing

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0705
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Role-scoped routing exists in policy/storage but not in effective-resolution or usage schemas.
  - Usage still wants switch explanations without carrying switch lineage in its canonical records.
  - keep canonical Usage routing on shared usage identity, not feature-local cost or receipt notions
  - `inspector_target = details | evidence | usage | lineage`
  - inspector_target = details | evidence | usage | lineage
  - Usage pivots still describe `tier_id` filters in graph/detail docs even though the routing and identity work now requires object-first `usage_event` and runtime-object pivots.
  - tier_id
  - usage_event
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Prefer usage_event_ref rather than timestamp heuristics when routing cost-bearing artifacts to Usage and Ledger.
- Require runtime artifacts summarizing external operations to carry receipt linkage.
- cov-203 exact item present: Prefer usage_event_ref rather than timestamp heuristics when routing cost-bearing artifacts to Usage and Ledger
- cov-203 exact item present: Require runtime artifacts summarizing external operations to carry receipt linkage

#### help surfaces
##### Notification routing policy
- Route notifications using severity, execution impact, blocked owner, persistence, and projection trust.
- cov-069 exact item present: Route notifications using severity, execution impact, blocked owner, persistence, and projection trust

##### Quiet-window policy
- Allow quiet windows for advisory warnings but not for canonical blocked episodes.
- cov-069 exact item present: Allow quiet windows for advisory warnings but not for canonical blocked episodes

#### projection-health-aware degrade behavior
##### Projection freshness and health states
- Use current/refreshing/stale/degraded/unavailable projection states.
- cov-045 exact item present: Use current/refreshing/stale/degraded/unavailable projection states

##### Sensitive action gating and record-backed fallback
- Gate sensitive actions on current or direct canonical revalidation and fall back to record-backed views when degraded.
- cov-045 exact item present: Gate sensitive actions on current or direct canonical revalidation and fall back to record-backed views when degraded

### Unified UsageRecord schema expectations
- UsageRecord includes `usage_id`, `created_at_utc`, `account_id`, `run_id`, `node_id`, `tool_id`, `input_tokens`, `output_tokens`, `cost_usd`, and `metadata`.
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
  - Show "Last updated: &lt;time&gt;" next to 5h/7d and provide a prominent "Refresh" action.
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

