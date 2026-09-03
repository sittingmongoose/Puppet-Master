# Shard 014: Usage And Quota Evidence Addendum - 2026-07-09

Source: `Plans/CLI_Bridged_Providers.md`

Source lines: L1760-L1845

Source SHA256: `53d1d3779e9c3f41567c015b7e879c5d021cc372a690db9bfeb6813495145459`

---

## Usage And Quota Evidence Addendum - 2026-07-09

This addendum narrows Antigravity CLI usage/quota behavior from uploaded local evidence and live GitHub issue checks. It creates no provider adapter implementation, runtime launch, executable queue, WorkNode, NodeSeed, implementation file, production build task, generated governance artifact, final manifest, or runtime certification evidence.

### CBP-027 - Antigravity CLI Usage Quota Credits And Statusline Contract

```yaml
plan_unit_id: CBP-027
unit_type: schema_contract
status: accepted
owner_doc: Plans/CLI_Bridged_Providers.md
canonical_text: >-
  Antigravity CLI usage and quota collection is a separate `antigravity_cli` provider route backed by `agy`, not Gemini Direct and not retired `gemini_cli`. PM probes `agy --version`, `agy models`, supported prompt-output routes, `/usage`, `/quota`, `/credits`, `/stats` only when available, the Models & Quota page, and statusline JSON. Usage/quota ingestion records source_class = cli_reported or unknown unless a provider/header/API source is directly proven, and it never maps quota progress, G1 credits, statusline context, or disabled quota buckets into token/cost counters. Models & Quota disabled buckets render disabled, omit fabricated progress bars, and do not become zero remaining quota. `/credits`, `UseG1Credits`, remaining credits, and G1 credits are credit/overflow-pool signals, not token usage, model cost, or provider_total. Statusline quota usage, execution_mode, context usage, active model, subagent/task, and token-like fields are accepted only as observed CLI/statusline signals with explicit field names and payload refs. Missing or broken `/stats` renders stats unavailable and usage unknown or quota not exposed; it is not proof of no usage. Missing `/usage`, `/quota`, `/credits`, Models & Quota, statusline, reset, or cooldown evidence renders usage unknown, quota not exposed, credits not exposed, reset unknown, or cooldown unknown rather than guessed countdowns.
gui_related: true
gui_classification_reason: Usage, quota, credits, Models & Quota, statusline, and fail-closed copy are user-visible CLI/provider state.
depends_on: [CBP-019, CBP-020, CBP-026, UF-085]
unblocks: [UF-086, RAP-043]
acceptance_criteria:
  - "Antigravity rows use provider_id `antigravity_cli` and provider route `agy`; Gemini Direct remains `gemini`, and retired Gemini CLI remains compatibility/source-lineage only."
  - "Probes record which of `agy --version`, `agy models`, `/usage`, `/quota`, `/credits`, `/stats`, Models & Quota, and statusline JSON were available, unavailable, disabled, broken, or not exposed."
  - "`/usage` and `/quota` output can update UsageRecord only when field names, timestamps, route/account/model identity, and source payload refs are captured."
  - "`/credits`, `UseG1Credits`, remaining credits, and G1 credits are modeled as credit signals separate from token buckets, cost, and quota counters."
  - "Disabled buckets render `disabled`; missing quota renders `quota not exposed`; missing credits render `credits not exposed`; missing usage renders `usage unknown`; broken or absent `/stats` renders `stats unavailable`."
  - Statusline context/quota/token signals are accepted only as cli_reported observations with payload refs and are not treated as provider billing authority.
  - Reset/cooldown values are displayed only when the observed CLI payload or message provides evidence; PM does not fabricate countdowns.
  - Fixture coverage includes disabled quota bucket, missing `/stats`, missing `/usage`, missing `/quota`, missing `/credits`, statusline context-only payload, statusline quota payload, G1 credits enabled, G1 credits disabled, and quota exhaustion message cases.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-shard-plans.py --check
  - future Antigravity CLI usage/quota/statusline parser fixtures
  - future UsageRecord source-class and unknown-signal fixtures
risk_class: antigravity_usage_quota_drift
reasoning_tier: high
context_scope: antigravity_cli_usage_quota
implementation_surfaces:
  - Plans/CLI_Bridged_Providers.md
  - Plans/usage-feature.md
  - Plans/runtime_artifact_cost_usage.schema.json
  - Plans/runtime_artifact_tool_llm_trace.schema.json
node_compile_hint:
  mode: antigravity_cli_usage_quota_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "uploaded:antigravity-cli-main/CHANGELOG.md:122-136"
  - "uploaded:antigravity-cli-main/CHANGELOG.md:197-200"
  - "uploaded:antigravity-cli-main/CHANGELOG.md:222-233"
  - "uploaded:antigravity-cli-main/examples/statusline/README.md:8-14"
  - "https://github.com/google-antigravity/antigravity-cli/issues/46"
  - "https://github.com/google-antigravity/antigravity-cli/issues/74"
  - "https://github.com/google-antigravity/antigravity-cli/issues/23"
  - "https://github.com/google-antigravity/antigravity-cli/issues/397"
preserved_exact_tokens:
  - antigravity_cli
  - agy
  - /usage
  - /quota
  - /credits
  - /stats
  - Models & Quota
  - quota_usage
  - execution_mode
  - Disabled
  - G1 credits
  - UseG1Credits
  - remaining credits
  - statusline
  - context usage
  - usage unknown
  - quota not exposed
  - credits not exposed
  - stats unavailable
negative_constraints:
  - Do not map Antigravity CLI usage or quota to Gemini Direct.
  - Do not alias `gemini_cli` to `antigravity_cli` or reuse retired Gemini CLI fields as active Antigravity schema.
  - Do not infer token, cost, provider_total, reset, or remaining quota counters from quota/credit progress without explicit evidence.
  - Do not treat missing or broken `/stats` as zero usage.
  - Do not treat disabled quota buckets as zero remaining or exhausted usage.
  - Do not treat G1 credits as token usage or model cost.
owner_hints:
  - Plans/CLI_Bridged_Providers.md
  - Plans/usage-feature.md
  - Plans/Multi-Account.md
  - Plans/Models_System.md
  - Plans/Contracts_V0.md
```
