# Shard 013: Usage and Billing Contracts Addendum

Source: `Plans/Contracts_V0.md`

Source lines: L1965-L2076

Source SHA256: `395f317cff4aab317c64cd467be8f79a5edc391e26cceb7425ad6d01a40caeaa`

---

## Usage and Billing Contracts Addendum


### Cost field type contract


All persisted usage/cost values are stored as integer microdollars (`u64`). Presentation converts to decimal currency strings; storage and accumulation do not.

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/storage-plan.md

### Thread context detail and usage display contract
Assistant chat-thread usage surfaces use a shared context-detail contract instead of a chat-local side panel. The stale direct-click detail-open pattern is replaced by a hover info-popover plus `More Details`: hover shows the compact thread status module, selecting `More Details` opens the context-detail editor-tab detail-surface, and the click-triggered action on the context circle is `Compact Now`.

The compact-row schema for the under-message summary and the `Messages` tab is closed to role, worker type, mode, model, time or `/duration`, total tokens, and cost. `Messages` renders one expandable row per message. The expanded message info-popover uses the closed Assistant Chat field list and label rules for `Mode`, `Provider`, `Model`, `Effort`, `Persona`, `Worker`, `Tokens`, and `Context`; expanded detail rows may add token breakdown, context usage, cost, relevant requested `/effective` deltas, and notable tool `/part` summary. `Resend` remains the message action that retries the most recent user message and discards later history or work.

The context-detail editor-tab has top-level `Curated` and `/raw` inspection paths. `Curated` contains Overview, Breakdown, and Messages. `/raw` may expose serialized payloads, provider metadata blobs, and path/runtime data for `/log`, `/detail`, and `/debugging` without making those lower-level fields chat-facing labels. Deep Plan remains a distinct `/workflow` identity and display label rather than being collapsed into generic plan mode.

Thread cost labels are `Estimated Cost` unless PM has provider-authoritative cost semantics for that value. The estimated-cost baseline may use the OpenCode-style normalization formula, but contracts must preserve provider-reported buckets, provider-sensitive cache normalization caveats, and over-200k pricing tier selection where available. Raw/log/debug paths preserve the normalization path and raw bucket values for audit.

Implementation readiness pins canonical schema and `/field` names only when they are part of planning-doc contracts, persisted payloads, runtime identity objects, or cross-doc shared vocabulary; it does not require naming every implementation-local helper, variable, or UI component ahead of time.

### Token bucket contract


The canonical token fields are:
- `input_tokens`
- `output_tokens`
- `cache_read_input_tokens`
- `cache_creation_input_tokens`
- `reasoning_tokens`

Provider-specific token counting flows through a token-counting abstraction before these buckets are persisted. Usage events and run-completion snapshots preserve `token_counting_adapter_id`, `token_counting_basis`, and optional provider raw-count metadata when provider semantics differ; raw counts explain the canonical buckets but do not replace them.

These fields are individually persisted. Storage-layer aggregation or collapse into a smaller field set is prohibited. The product LESSON from provider cost failures is that every LLM call, including title generation, summaries, hidden helper passes, subagents, and other background ops, emits usage with separated input, output, cache_read, cache_write, and reasoning buckets. Client-side spending limit enforcement reads the canonical usage stream rather than an optional display rollup.

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/Architecture_Invariants.md

`total_tokens` MAY be stored or derived for convenience, but it MUST NOT replace the individual token buckets.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md

### Usage attribution contract
Usage records and normalized usage events MUST preserve:
- `provider_id`
- `model_id`
- `account_id` when the provider/runtime surface is account-backed
- `provider_account_id?` and `/account-label` only as provider-native/display metadata subordinate to stable account identity when needed for future multi-account UI
- `parent_run_id` when usage is emitted by a child run, tool, title-generation pass, summary pass, or other background operation
- per-message model attribution for every user-visible or background LLM call
- parent aggregation keys so subagent costs roll up to the parent run without losing the child usage event
- `billing_entity_id` when quota semantics depend on it
- `entitlement_class` when provider routing, quota, or pricing semantics depend on it
- `usage_source_kind` so Gemini and similar providers can distinguish `local-estimated`, API-key-derived, OAuth-quota-derived, and `/API-key-derived/OAuth-quota-derived` attribution rather than collapsing all usage into one projection
- usage-window metadata, including `window_label` and `window_scope`; `window_scope` is closed to `provider | account | account+model | org | server_profile`
- `cache_hit?`
- `cache_strategy?`
- The display/review phrase usage-record maps to canonical `usage_record`; the canonical object only adds fields that materially affect attribution, rollups, or cross-surface clarity.

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/Models_System.md, ContractName:Plans/storage-plan.md

Rules:
- usage attribution is keyed by the canonical tuple `(provider_id, model_id, account_id?, billing_entity_id?, entitlement_class?)` when those fields are known
- Per-node UsageRecord consumption, worker-identity surfaces, and model-selection SSOT must stay coherent when `/auth/account` attribution expands. `Plans/Orchestrator_Page.md`, `Plans/Run_Graph_View.md`, and `Plans/Models_System.md` are consumers of this contract; node-level usage display must not restate or conflict with the requested/effective account model.
- High-value Gemini contradictions are tracked here because they affect core auth and usage contracts: direct-provider planning is valid, but GUI/spec copy must not over-focuses API key or under-specifies OAuth as a distinct surface. Usage and account wording must keep OAuth bucket semantics distinct from API-key semantics.
- Provider-settings/auth UI specs must expose OAuth login, `/re-auth/logout`, and status independently from API key presence/config, explain what each mode unlocks and which bucket it uses, and define precedence when both are present.
- bridge adapters, storage snapshots, analytics rollups, and UI projections MUST NOT collapse that tuple to `billing_entity_id` alone when account or entitlement context exists
- background/helper usage keeps the same attribution tuple and lineage through `parent_run_id` rather than inventing a second attribution model
- Bridge-visible usage fields that affect spending-limit checks must round-trip through the normalized stream and remain aligned with `Plans/Run_Modes.md` and `Plans/CLI_Bridged_Providers.md`; UI, storage, and rollup consumers may summarize display text, but they cannot drop account, entitlement, or source-kind fields needed for enforcement.
- `run.completed.usage` snapshots MUST NOT use the legacy `(tokens_in, tokens_out, cost, thread_id)` tuple as the persisted contract. If compatibility import sees legacy `tokens_in`, `tokens_out`, or `cost`, it maps them into the canonical token buckets, microdollar cost fields, attribution tuple, and runtime lineage; this migration work is separate from already-fixed root-precedence rules.
- Cost accumulation is monotonic, non-decreasing, and /non-negative across a cumulative-session, including model-switch scenarios. A model-switch cost sign-flip or provider correction that would otherwise produce negative-raw-cost is recorded as an explicit /adjustment or clamp event rather than retroactively decreasing prior displayed usage.
- `cost_usd` is presentation-only and derived from stored microdollars. Sub-cent display uses an adaptive precision tier, including `<$0.01 => 6 decimals`, while persistence remains integer microdollars; a negative-cost display is always backed by an explicit adjustment record, never by mutating prior usage.
- Contracts mirror the usage-event field blocks needed by `Plans/Executor_Protocol.md` consumers without copying protocol /prose: `### 7.1 Classified outcome matrix`, `### 7.2 Doom-loop guard`, `### 7.3 Signal handling and process lifecycle`, and `### Blocked and retry behavior` remain protocol anchors, while `### Usage attribution contract` owns the shared attribution tuple. BrainStorm and subagent-collaboration consumers use these owner contracts rather than defining parallel usage or retry fields.

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Architecture_Invariants.md

Legacy audit closure note: `LF-004` and `LF-008` identify the old same-file contradiction between `### 4.1 AuthState` examples and `### Billing entity field contract`; they are resolved by the conditional omission rules above. Audit verdict words such as `MINOR`, `MOSTLY`, and `CONFIRMED` are not schema states. Stale TODOs, case-folding examples, and shell-isolation notes remain non-authoritative unless restated in the relevant owner contract; `timeout_ms` and shell execution envelopes belong to executor/runtime contracts, not usage attribution.

### Spending limits and budget enforcement

Spending-limit enforcement reads the canonical usage_record stream and its legacy `/record` review marker through the same attribution tuple. Pre-dispatch checks that exceed budget emit `kill.budget_exceeded`; post-response `/post` recording that discovers an overrun emits `done.budget_exceeded` and persists overrun evidence rather than rewriting prior usage.

The canonical usage pipeline is `seglog -> analytics scan -> redb rollups -> UI`. Rollups preserve per-run, per-session, and per-tool attribution, including `parent_run_id`, `cache_hit?`, and `cache_strategy?`, so helper calls and subagent work remain explainable without collapsing child usage into display-only parent totals.

CLI bridge consumers stay aligned with `Plans/CLI_Bridged_Providers.md` owner sections named `### HTTP/status to failure-class mapping`, `### Normalized usage event minimum fields`, and `### Stream cancellation and replay safety`. For bridge-side consumer-field projections, `402 / quota_exceeded` is no-retry and upgrade-facing, `429 / rate limit` remains a distinct rate-limited class, and transient circuit-breaker windows preserve the owner value such as `2 minutes` instead of redefining it in this contract.

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Run_Modes.md

### Provider cache accounting policy

OpenRouter cache policy is explicit:
- PM records the provider cache-key policy used for an OpenRouter request when cache behavior affects reuse, billing, or debugging.
- OpenCode-sourced OpenRouter requests that expose `prompt_cache_key` keep that key as provider/cache metadata; TTL evidence from `#16848` and `#16850` informs adapter policy, while cache-write accounting evidence from `#18440` maps into PM usage buckets instead of redefining storage persistence.
- PM records the OpenRouter cache TTL policy as provider/cache metadata and must not treat TTL as a PM-owned persistence guarantee.
- OpenRouter `/accounting` records preserve the cache TTL policy used for the request so cost, cache reuse, and debug views can explain provider behavior without inventing PM-owned cache persistence.
- OpenRouter cache-write token accounting maps into the canonical cache token buckets; cache-write tokens are persisted in `cache_creation_input_tokens`, and cache reads remain in `cache_read_input_tokens`.

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Prompt_Pipeline.md

### Billing entity field contract

`requested_billing_entity_id` and `effective_billing_entity_id` are conditionally required fields. A provider includes them only when billing entity selection exists for that provider and when the field is meaningful in the current flow.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Multi-Account.md

This conditional-requirement contract applies uniformly wherever billing entity selection is surfaced:
- In `EventRecord.payload`, fields are present only for provider flows that expose billing entity selection.
- In `AuthState`, the persisted selection field is present only when the effective quota bucket depends on entity selection; otherwise the field is omitted.
- In usage attribution, canonical attribution is keyed by `(provider_id, model_id, account_id?, billing_entity_id?, entitlement_class?)` when those dimensions are known. `billing_entity_id` alone is never a sufficient canonical substitute when account or entitlement context exists.

UI readiness projections that mention `pm.lock`, viewer-mode, MCP lazy-load, or `/startup-time` are contract consumers. `pm.lock` and viewer-mode messaging follow the storage/runtime lock contract, while MCP lazy-load and startup-time UX defer to the MCP/tool owner docs; Contracts_V0 only requires those projections to preserve the referenced owner state and not mint parallel status fields.

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/CLI_Bridged_Providers.md
