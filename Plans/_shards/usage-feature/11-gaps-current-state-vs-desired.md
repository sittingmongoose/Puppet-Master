## Gaps (Current State vs. Desired)

### Resolved: canonical usage and cost design

The prior Gap 1–7 framing is retired. The following items are resolved and MVP-blocking.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md

### Canonical usage pipeline

PM usage surfaces are projection-driven. The canonical flow is:
`seglog -> analytics scan jobs -> redb rollups -> UI consumers`.

`usage.jsonl` may exist as a human-readable mirror or compatibility source, but it is NOT the canonical rollup source for the 5h/7d windows.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md

### Cost storage and token segregation

- All cost values are stored as integer microdollars (`u64`).
- The canonical token buckets are `input_tokens`, `output_tokens`, `cache_read_input_tokens`, `cache_creation_input_tokens`, and `reasoning_tokens`.
- These fields MUST remain separate at the storage layer; aggregation happens only in presentation or rollup logic.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Architecture_Invariants.md

### Spending limits and budget enforcement
### Cost monotonicity and model-switch handling

Cumulative cost for a run or session MUST be monotonically non-decreasing. When a model switch occurs mid-run (e.g., fallback from an expensive model to a cheaper one), the cost counter does not decrease retroactively.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Models_System.md

Rules:
- Each provider response adds its actual cost to the cumulative total; cost is never subtracted.
- If a pre-request cost estimate was higher than the actual post-response cost, the difference is not reclaimed from the cumulative total. The estimate is advisory; the actual is authoritative.
- Model-switch events are recorded with their own cost attribution. The cumulative total is the sum of all actual costs across all models used within the run or session.
- If a provider returns a cost of zero (e.g., cached response), the cumulative total remains unchanged.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Run_Modes.md

Spending limits are enforced at two checkpoints:
1. **Pre-request estimate:** if the estimated request cost would exceed the remaining budget, PM blocks before dispatch with `stop.budget_exceeded`.
2. **Post-response actual:** after the provider responds, PM records actual cost and terminates with `done.budget_exceeded` if the run or session budget is exceeded.

Warning threshold: PM emits a warning at 80% of the configured remaining budget. Both per-run and per-session budgets are supported.

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Executor_Protocol.md

### Billing identity, attribution, and pricing metadata

Cost attribution is keyed by `(model_id, provider_id, billing_entity_id)` when billing-entity semantics exist. `parent_run_id` is the canonical attribution bridge for tool-level and subagent-level usage rollups.

Pricing metadata is consumed from `Plans/Models_System.md`; this document uses it but does not own provider pricing tables.

ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/Contracts_V0.md

### Adaptive display precision

UI cost display rules:
- amounts below `$1.00`: show 4 decimal places
- amounts at or above `$1.00`: show 2 decimal places
- always show the currency label
- when pricing is estimated rather than authoritative, label the surface `Estimated Cost`

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Runtime_Artifacts_Panel.md

### 5h / 7d aggregation and freshness

The 5h / 7d windows are served from redb rollups. While a background analytics scan is refreshing a window, the UI shows the last committed rollup plus an explicit `Updating...` freshness cue rather than recomputing in the foreground.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md

### Unified `UsageRecord` schema expectations

All usage surfaces derive from the same `UsageRecord` identity. Minimum shared attribution fields are:
- `run_id`
- `parent_run_id` when emitted by a child run, tool, or background operation
- `provider_id`
- `model_id`
- `billing_entity_id?`
- token buckets
- `cost_microdollars`
- `cache_hit?`
- `cache_strategy?`

Compatibility shims may ingest older records, but new surfaces MUST NOT invent a second attribution schema.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md

### Canonical enums

Canonical enum values for usage attribution MUST be shared across persistence, projection, and UI layers.

```text
usage_source_kind: enum {
  chat,          // direct user chat interaction
  subagent,      // subagent execution
  background,    // background task (indexing, analysis)
  system,        // system-initiated (health check, model probe)
  tool,          // tool-initiated (tool calling another model)
}
```

```text
effective_auth_mode: enum {
  api_key,       // authenticated via API key
  oauth_token,   // authenticated via OAuth access token
  cli_managed,   // authentication managed by CLI tool
  env_variable,  // credential from environment variable
}
```

`effective_auth_mode` records how the provider was authenticated for a specific usage record so cost and quota analysis can be grouped by auth path rather than only by provider or model.

ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md

### Canonical `UsageRecord` type

All new usage persistence and projection work MUST normalize into the following canonical shape:

```text
UsageRecord {
  usage_id: string,              // unique record ID, format: usg_{ulid}
  timestamp: ISO8601,            // when the usage occurred
  dev_session_id: string,        // session context
  thread_id: string?,            // chat thread if applicable
  provider_id: string,           // which provider
  model_id: string,              // which model
  usage_source_kind: UsageSourceKind,
  effective_auth_mode: EffectiveAuthMode,

  // Token counts
  input_tokens: u64,
  output_tokens: u64,
  cache_read_tokens: u64?,
  cache_write_tokens: u64?,
  total_tokens: u64,

  // Cost
  estimated_cost_usd: f64?,      // estimated cost based on known pricing

  // Context
  agent_id: string?,             // if from subagent
  tool_name: string?,            // if from tool
  persona_id: string?,           // active persona

  // Performance
  time_to_first_token_ms: u64?,
  total_duration_ms: u64,
  tokens_per_second: f64?,
}
```

Ownership:
- `UsageRecord`s are owned by the session and persisted in the usage store as part of the canonical usage pipeline
- child runs, tools, and background operations still emit records into the same session-owned store using shared identity rules

Consumption:
- usage data is consumed by the Usage panel, budget enforcement, and billing/attribution flows
- thread-scoped context detail reads the same canonical records rather than inventing a chat-only side schema

Aggregation:
- records can be aggregated by provider, model, session, thread, or time period
- aggregation MUST preserve source-kind and auth-mode dimensions so dashboards and budgets can explain where usage came from

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md

