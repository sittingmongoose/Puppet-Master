# Shard 035: Usage GUI Propagation Addendum - 2026-07-09

Source: `Plans/Models_System.md`

Source lines: L9436-L9497

Source SHA256: `87d9afd9ad3db1e329d9bef8c845f6d4f5794bfee9d843cd483c75c4099c857b`

---

## Usage GUI Propagation Addendum - 2026-07-09

This addendum binds model capability rows to UsageRecord/provider authority displays. It creates no WorkNodes, NodeSeeds, executable queues, implementation files, runtime artifacts, generated wiring rows, production build tasks, final manifests, or PNC-019 receipts.

### MS-136 - Model Capability Usage Signal Display Contract

```yaml
plan_unit_id: MS-136
unit_type: requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: >-
  Model rows and model-picker/provider-capability details may show usage-adjacent information only when it is backed by UsageRecord, ProviderCapabilityEpoch, CredentialRouteEpoch, or explicit provider route evidence. They display requested and effective provider route identity, account/profile refs, source_class, source_confidence, source_authority, quota/credit availability, cost_status, pricing snapshot/custom price row refs, and projection freshness. Antigravity public model rows keep provider_id `antigravity_cli` and route `agy`; missing stats, usage, quota, or credits render unavailable/unknown/not_exposed states, while G1 credits remain separate credit metadata and never become model token/cost/quota capacity.
gui_related: true
gui_classification_reason: Model picker and model/provider rows are visible GUI surfaces.
depends_on: [MS-134, MS-135, MA-069, UF-087, CBP-027]
unblocks: []
acceptance_criteria:
  - Model rows preserve requested/effective provider route identity and never infer Usage authority from model_id alone.
  - Usage-adjacent model rows display source_class, source_confidence, source_authority, quota_state, credits_state, cost_status, and projection_freshness.
  - Antigravity model fixtures show `antigravity_cli`/`agy`, stats unavailable, usage unknown, quota not exposed, credits not exposed, disabled bucket, and G1 credits as separate state.
  - Custom-provider rows surface price row refs before estimated cost is displayed, and unknown-cost fail-closed state is visible.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py run-gates
  - future model usage display fixture suite
risk_class: model_usage_authority_drift
reasoning_tier: high
context_scope: model_usage_signal_display
implementation_surfaces:
  - Plans/Models_System.md
  - Plans/Multi-Account.md
  - Plans/usage-feature.md
node_compile_hint:
  mode: model_usage_signal_display_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Models_System.md:293-310"
  - "Plans/Models_System.md:9297-9415"
  - "Plans/Multi-Account.md:421-532"
  - "Plans/CLI_Bridged_Providers.md:1429-1510"
  - "uploaded:pi-main/packages/coding-agent/docs/custom-provider.md:164-233"
  - "uploaded:zero-main/internal/modelregistry/cost.go:38-119"
  - "uploaded:antigravity-cli-main/CHANGELOG.md:122-136"
preserved_exact_tokens:
  - ProviderCapabilityEpoch
  - CredentialRouteEpoch
  - source_confidence
  - custom_provider_price_row_ref
  - antigravity_cli
  - agy
  - G1 credits
negative_constraints:
  - Do not infer quota, credits, usage, or cost from model names or availability alone.
  - Do not treat G1 credits as model context, token usage, cost, quota, or provider_total.
  - Do not reactivate platform_specs or platform_specs.rs as usage authority.
owner_hints:
  - Plans/Models_System.md
  - Plans/Multi-Account.md
  - Plans/usage-feature.md
```
