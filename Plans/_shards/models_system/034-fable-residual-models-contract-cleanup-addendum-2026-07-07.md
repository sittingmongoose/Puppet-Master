# Shard 034: FABLE Residual Models Contract Cleanup Addendum - 2026-07-07

Source: `Plans/Models_System.md`

Source lines: L9362-L9434

Source SHA256: `87d9afd9ad3db1e329d9bef8c845f6d4f5794bfee9d843cd483c75c4099c857b`

---

## FABLE Residual Models Contract Cleanup Addendum - 2026-07-07

This addendum closes only residual FABLE Critical/High Models rows named by the FABLE registry. It does not redo platform_specs retirement, GUI wiring, or provider runtime implementation.

### MS-135 - Provider Capability, Fallback, Lifecycle, And Error Schema Closure

```yaml
plan_unit_id: MS-135
unit_type: schema_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: >-
  Models_System owns the residual provider/model schema gaps for Gemini provider variants, ProviderCapabilityEpoch
  merge rules, fallback chain limits, resolver examples, lifecycle transitions, effort settlement, model routing,
  entitlement quota settlement, provider policy rules, metadata replay, and provider error envelopes. These contracts
  extend MS-134 without reactivating legacy platform_specs authority.
gui_related: false
gui_classification_reason: Provider/model capability schemas and routing defaults are backend contracts; GUI consumers may render them but do not own them.
depends_on: [MS-017, MS-031, MS-083, MS-124, MS-127, MS-134, MA-067]
unblocks: []
acceptance_criteria:
  - Gemini provider variants are named gemini_api_key and vertex_ai, with credential_kind, endpoint_base, project_id?, location?, quota_scope, and capability_snapshot_ref fields.
  - ProviderCapabilityEpoch replacement rule is provider_id plus account_id plus credential_route_epoch_id plus capability_source plus epoch_started_at_ms; MS-124 and MS-127 references must merge into that identity instead of duplicating epochs.
  - fallback_chain[] items include model_id, provider_id, reason_code, priority, max_attempts, eligibility_filter_ref, and terminal_on_reason_codes[]; max_depth defaults to 3 and exhaustion emits fallback_exhausted.
  - Resolver examples include requested_model_id, requested_provider_id?, account_id?, capability_snapshot_ref, credential_route_epoch_id, resolved_model_id, fallback_used, clamp_reason?, and visibility_state.
  - Provider lifecycle transitions are discovered -> configured -> healthy -> degraded -> disabled -> removed, with degraded -> healthy and disabled -> configured recovery routes and no removed recovery.
  - EffortSettlementReceipt records requested_effort, effective_effort, clamp_reason, model_id, account_id, token_budget, cost_ceiling_microusd?, and settlement_reason.
  - ModelSelectionRouter scores provider/model candidates by capability_match, account_entitlement, route_health, cost, latency, context_window, and user_preference with deterministic tie-break by configured priority then provider_id/model_id.
  - EntitlementQuotaSettlement, ProviderPolicyRuleset, ProviderMetadataReplayPolicy, and ProviderErrorEnvelope carry concrete fields for quota_state, policy_decision, replay_window_ms, HTTP/status/body_class/request_id/retryability, and redaction policy.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py lint-contractrefs
  - python3 scripts/pm-audit-closure.py validate --audit-dir Plans/.audits/fable-20260706 --require-closure-matrix --require-effective-status --source-artifact residual_feature_contract_findings.jsonl
risk_class: fable_residual_models_contract_drift
reasoning_tier: high
context_scope: residual_feature_contract_cleanup
implementation_surfaces:
  - Plans/Models_System.md
  - Plans/Multi-Account.md
node_compile_hint:
  mode: residual_models_provider_capability_schema
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - fablereport.md:640
  - fablereport.md:642
  - fablereport.md:643
  - fablereport.md:644
  - fablereport.md:645
  - fablereport.md:646
  - fablereport.md:647
  - Plans/.audits/fable-20260706/buildability_repair_registry.jsonl
source_atom_ids: []
preserved_exact_tokens:
  - "Gemini"
  - "ProviderCapabilityEpoch"
  - "fallback_chain[]"
  - "fallback_exhausted"
  - "EffortSettlementReceipt"
  - "ModelSelectionRouter"
  - "EntitlementQuotaSettlement"
  - "ProviderPolicyRuleset"
  - "ProviderMetadataReplayPolicy"
  - "ProviderErrorEnvelope"
negative_constraints:
  - Do not reactivate platform_specs or platform_specs.rs as active capability authority.
  - Do not create provider adapter implementation, runtime certification evidence, WorkNodes, NodeSeeds, executable queues, implementation files, or production build tasks.
  - Do not close GUI behavior rows outside the named Models schema/default gaps.
owner_hints:
  - Plans/Models_System.md
  - Plans/Multi-Account.md
  - Plans/CLI_Bridged_Providers.md
```
