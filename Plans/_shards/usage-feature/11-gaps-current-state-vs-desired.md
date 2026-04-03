## Gaps (Current State vs. Desired)

### Resolved: canonical usage and cost design

The prior Gap 1–7 framing is retired. The following items are resolved and MVP-blocking.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md

### Canonical usage pipeline
PM usage surfaces are projection-driven. The canonical flow is:
`usage.event` + executed-call lineage (`tool.invoked` and canonical `run.completed.usage`) -> analytics scan jobs -> redb rollups -> UI consumers.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Contracts_V0.md

Compatibility-shim retirement condition:
- once Usage/dashboard rollups read exclusively from redb projections
- once thread and current-run summaries read from `usage.event` plus canonical `run.completed.usage` snapshots rather than parsing `usage.jsonl`
- once no in-product reader treats `usage.jsonl` as authoritative input

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Contracts_V0.md

Rules:
- `usage.event` remains canonical for provider/model token and cost accounting
- executed tool invocations and other helper/background operations that do not expose provider token buckets still emit canonical lineage/attribution through their runtime records and MUST join to the same parent totals via `run_id`, `parent_run_id`, and `thread_id` when present
- `usage.jsonl` may exist as a human-readable mirror or temporary compatibility source, but it is NOT the canonical rollup source for the 5h/7d windows
- after the compatibility-shim retirement conditions are met, `usage.jsonl` remains an optional export/debug mirror only. New canonical fields MUST NOT be introduced only in the compatibility path

ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md

### Cost storage and token segregation
- All cost values are stored as integer microdollars (`cost_microdollars: u64`).
- The canonical token buckets are `input_tokens`, `output_tokens`, `cache_read_input_tokens`, `cache_creation_input_tokens`, `reasoning_tokens`, and `total_tokens`.
- These fields MUST remain separate at the storage layer; aggregation happens only in presentation or rollup logic.
- `cost_usd` is a presentation-only derived field computed from `cost_microdollars`; it is not a second durable source of truth.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Architecture_Invariants.md

- Raw provider cost anomalies that would produce a negative stored value MUST be clamped to zero before durable write.
- When a clamp or correction occurs, PM emits a structured diagnostic or correction record that preserves the provider anomaly without storing negative ad-hoc cost deltas.
- Canonical stored cost values, cumulative session totals, and rollup deltas are non-negative and MUST remain monotonically non-decreasing across model switches, retries, and background/helper activity.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/storage-plan.md
### Spending limits and budget enforcement
Spending limits are enforced at two checkpoints:
1. **Pre-request estimate:** if estimated request cost would exceed remaining budget, PM blocks before dispatch with `kill.budget_exceeded`.
2. **Post-response actual:** after the provider responds, PM records actual cost and terminates with `done.budget_exceeded` if the run or session budget is exceeded.

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md

Warning threshold: PM emits a warning when consumption reaches `warn_budget_pct = 80` of the configured run or session budget. Both per-run and per-session budgets are supported.

ContractRef: ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md

Budget rules:
- actual cost recording MUST NOT underflow remaining budget calculations
- estimated preflight cost may be conservative, but it MUST NOT rewrite the actual cost record emitted after provider completion
- blocked budget checks and terminal budget outcomes preserve the same run and parent attribution lineage as any other usage event
- hidden/background/helper calls that consume budget (for example tool-driven model calls, title generation, summaries, compaction helpers, or subagent-side model work) MUST obey the same budget policy and roll into the same parent totals

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Prompt_Pipeline.md
### Billing identity, attribution, and pricing metadata

Cost attribution is keyed by the canonical runtime identity tuple: `(model_id, provider_id, account_id?, billing_entity_id?, entitlement_class?)` when those fields are known. `billing_entity_id` alone is not a sufficient canonical substitute when account or entitlement context exists. `parent_run_id` is the canonical attribution bridge for tool-level and subagent-level usage rollups.

Pricing metadata is consumed from `Plans/Models_System.md`; this document uses it but does not own provider pricing tables.

ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/Contracts_V0.md

### Adaptive display precision
UI cost display rules:
- amounts below `$0.01`: show 6 decimal places
- amounts from `$0.01` up to but not including `$1.00`: show 4 decimal places
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
- `parent_run_id` when emitted by a child run, executed tool operation, or background/helper operation
- `thread_id?`
- `provider_id`
- `model_id`
- `account_id?`
- `billing_entity_id?`
- `entitlement_class?`
- canonical token buckets including `total_tokens`
- `cost_microdollars`
- `cache_hit?`
- `cache_strategy?`

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Models_System.md

Rules:
- every usage-relevant operation MUST emit canonical attribution. Provider/model calls emit a canonical usage record; executed tool operations and other helper/background activity that do not expose token buckets still emit the same run/provider/account/billing/entitlement lineage and omit only the unknown token counts
- if a provider cannot supply every token bucket, PM still emits the record with all known attribution fields and omits only the unknown token counts; it MUST NOT skip the usage record entirely
- bridge adapters, storage snapshots, and UI rollups MUST preserve the full `(provider_id, model_id, account_id?, billing_entity_id?, entitlement_class?)` tuple when known; they MUST NOT collapse attribution to billing entity alone
- compatibility shims may ingest older records, but new surfaces MUST NOT invent a second attribution schema or add canonical-only fields exclusively to `usage.jsonl`
- `cost_usd` may be projected for presentation, but the durable record remains `cost_microdollars` plus the canonical attribution fields above

ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Runtime_Artifacts_Panel.md
