# Shard 025: Usage GUI Propagation Addendum - 2026-07-09

Source: `Plans/Multi-Account.md`

Source lines: L5090-L5159

Source SHA256: `d2a7eb5beb660e11a81cd2336f1430121ced46fcd02ea15970a91be3e4b9391a`

---

## Usage GUI Propagation Addendum - 2026-07-09

This addendum binds account/provider settings usage displays to the canonical UsageRecord projection. It creates no WorkNodes, NodeSeeds, executable queues, implementation files, runtime artifacts, generated wiring rows, production build tasks, final manifests, or PNC-019 receipts.

### MA-069 - Provider Usage State Settings Display Contract

```yaml
plan_unit_id: MA-069
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: >-
  Multi-Account provider and account rows display usage, quota, credits, billing visibility, and provider pressure only from normalized UsageRecord, CredentialRouteEpoch, and ProviderCapabilityEpoch projections. Rows expose source_class, source_confidence, source_authority, quota_state, credits_state, cost_status, pricing snapshot/custom price row refs when relevant, and stale/degraded/unknown reasons. Antigravity CLI remains a separate provider route with provider_id `antigravity_cli` and route `agy`; missing `/stats`, `/usage`, `/quota`, and `/credits` render stats unavailable, usage unknown, quota not exposed, and credits not exposed. Disabled Models & Quota buckets render disabled, and G1 credits remain credits only. BYOK and subscription/provider-plan cost display suppression preserves usage identity while avoiding fake token-cost display.
gui_related: true
gui_classification_reason: Provider/account settings rows and readiness displays are user-visible GUI.
depends_on: [MA-067, MA-068, UF-087, UF-088, CBP-027]
unblocks: []
acceptance_criteria:
  - Provider/account rows display source_class, source_confidence, source_authority, cost_status, quota_state, credits_state, projection_freshness, and degraded reason beside usage-adjacent values.
  - Antigravity account fixtures cover missing `/stats`, `/usage`, `/quota`, `/credits`, disabled bucket, statusline-context-only signal, and G1 credits enabled/disabled.
  - BYOK and subscription-hidden fixtures preserve usage_event_ref and provider_attempt_ref while suppressing per-token cost display.
  - Custom-provider price rows show pricing_snapshot_id or custom_provider_price_row_ref before cost estimates are marked pricing_estimated.
  - Settings rows never infer quotas, credits, reset countdowns, or costs from login status, model name, or provider availability alone.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py run-gates
  - future provider settings Usage fixture suite
risk_class: provider_settings_usage_state_drift
reasoning_tier: high
context_scope: multi_account_usage_display
implementation_surfaces:
  - Plans/Multi-Account.md
  - Plans/Models_System.md
  - Plans/usage-feature.md
  - Plans/CLI_Bridged_Providers.md
node_compile_hint:
  mode: provider_usage_state_settings_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Multi-Account.md:421-532"
  - "Plans/Models_System.md:293-310"
  - "Plans/usage-feature.md:5412-5605"
  - "Plans/CLI_Bridged_Providers.md:1429-1510"
  - "uploaded:antigravity-cli-main/CHANGELOG.md:122-136"
  - "uploaded:antigravity-cli-main/examples/statusline/README.md:8-14"
  - "https://github.com/google-antigravity/antigravity-cli/issues/46"
  - "https://github.com/google-antigravity/antigravity-cli/issues/74"
preserved_exact_tokens:
  - antigravity_cli
  - agy
  - /stats
  - /usage
  - /quota
  - /credits
  - Models & Quota
  - G1 credits
  - source_confidence
  - hidden_byok
  - hidden_subscription
negative_constraints:
  - Do not alias Gemini CLI, gemini_cli, or GEMINI_CLI_HOME to Antigravity CLI.
  - Do not render missing quota, disabled bucket, unknown usage, hidden cost, or missing credits as zero.
  - Do not treat G1 credits as tokens, cost, quota, or provider_total.
  - Do not infer provider route identity from model names.
owner_hints:
  - Plans/Multi-Account.md
  - Plans/Models_System.md
  - Plans/CLI_Bridged_Providers.md
```
