# Shard 034: FABLE Residual Models Contract Cleanup Addendum - 2026-07-07

Source: `Plans/Models_System.md`

Source lines: L9709-L9988

Source SHA256: `a8981834baacb3da38b122e9a71c202173a1773bc4df24f06c24f3d9fd2c4c16`

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
  - The two populated resolver record examples below MS-135 carry requested_model_id, resolved_model_id, fallback_used and visibility_state beside the emit-shape fields they equal, and a record whose MS-135 spelling differs from its emit-shape field is rejected with resolver_record_invalid.
  - model_lifecycle_state (active, deprecated, sunset_pending, sunset, removed) changes only along the MS-135 model lifecycle transition table, which is separate from the provider lifecycle above; each state maps to one dispatch rule and one visibility_state shown in the model picker.
  - EffortSettlementReceipt is the typed payload in the MS-135 table, with closed settlement_reason and clamp_reason values, and only settlement_reason honored may display as honored.
  - ModelSelectionRouter applies the MS-135 gates, integer 0-1000 factor scores, policy-adjusted integer weights summing to 100, and the highest total_score, so conflicting cost and latency inputs select the same winner in every implementation.
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

**MS-135 resolver record example (2026-11-25).** The resolver record is the shared record from "Resolver inputs and emit shape" above; that section stays the authority for its fields. The MS-135 spellings below carry exactly the same values under the names that fallback, clamp and picker consumers read. A record where an MS-135 spelling and its emit-shape field differ is invalid and is rejected with `resolver_record_invalid`.

| MS-135 field | Same value as | Type |
| --- | --- | --- |
| `requested_model_id` | `requested_model` | string |
| `requested_provider_id?` | `requested_platform` | string, omitted when no provider was requested |
| `account_id?` | `effective_account_id?` | string, omitted when the route has no account |
| `resolved_model_id` | `effective_model` | string |

Fields only MS-135 adds:

| Field | Type | Rule |
| --- | --- | --- |
| `capability_snapshot_ref` | string | Ref of the §10.4.3 capability snapshot the resolver read. |
| `credential_route_epoch_id` | string | The MA-067 credential route epoch the effective account used. |
| `fallback_used` | boolean | `true` only when `resolved_model_id` came from a `fallback_chain[]` entry instead of the precedence winner. |
| `clamp_reason?` | string, closed: `policy_ceiling`, `computer_capacity_limit`, `effort_unsupported`, `variant_unsupported`, `context_window_limit` | Present only when a requested value was narrowed for a reason other than fallback. |
| `visibility_state` | string, closed: `visible`, `visible_with_notice`, `hidden_from_picker`, `history_only` | Derived from the effective model's `model_lifecycle_state` by the model lifecycle table below. |

Example 1, the run's own pick is honored:

```json
{
  "requested_platform": "claude-code",
  "effective_platform": "claude-code",
  "requested_model": "claude-opus-4-6",
  "effective_model": "claude-opus-4-6",
  "requested_variant": null,
  "effective_variant": null,
  "requested_auth_mode": "subscription",
  "effective_auth_mode": "subscription",
  "requested_account_id": "acct_work",
  "effective_account_id": "acct_work",
  "execution_role": "node_worker",
  "selection_reason": {
    "selected_provider": "claude-code",
    "selected_model": "claude-opus-4-6",
    "precedence_tier": 1,
    "alternatives": [],
    "selection_time_utc": "2026-11-25T15:04:05Z",
    "execution_unit_id": "node_0042"
  },
  "resolver_matrix_entry": "run_envelope_override",
  "worker_policy_display": "Opus 4.6, picked for this run",
  "skipped_persona_controls": [],
  "requested_model_id": "claude-opus-4-6",
  "requested_provider_id": "claude-code",
  "account_id": "acct_work",
  "resolved_model_id": "claude-opus-4-6",
  "capability_snapshot_ref": "capsnap://claude-code/claude-opus-4-6/rev-118",
  "credential_route_epoch_id": "cre_7f3a",
  "fallback_used": false,
  "visibility_state": "visible"
}
```

Example 2, the picked model is sunset, the first fallback runs, and effort is clamped:

```json
{
  "requested_platform": "codex",
  "effective_platform": "codex",
  "requested_model": "gpt-5.2-codex",
  "effective_model": "gpt-5.5-codex",
  "requested_variant": null,
  "effective_variant": null,
  "requested_auth_mode": "subscription",
  "effective_auth_mode": "subscription",
  "requested_account_id": "acct_team",
  "effective_account_id": "acct_team",
  "execution_role": "overseer",
  "selection_reason": {
    "selected_provider": "codex",
    "selected_model": "gpt-5.5-codex",
    "precedence_tier": 5,
    "fallback_reason": "model_not_dispatchable",
    "alternatives": [
      { "provider_id": "codex", "model_id": "gpt-5.2-codex", "eligible": false, "exclusion_reason": "model_not_dispatchable" }
    ],
    "selection_time_utc": "2026-11-25T15:10:00Z",
    "execution_unit_id": "overseer_0007"
  },
  "resolver_matrix_entry": "project_defaults_list",
  "worker_policy_display": "GPT-5.5 Codex (GPT-5.2 Codex has ended)",
  "skipped_persona_controls": [],
  "requested_model_id": "gpt-5.2-codex",
  "requested_provider_id": "codex",
  "account_id": "acct_team",
  "resolved_model_id": "gpt-5.5-codex",
  "capability_snapshot_ref": "capsnap://codex/gpt-5.5-codex/rev-41",
  "credential_route_epoch_id": "cre_19bd",
  "fallback_used": true,
  "clamp_reason": "effort_unsupported",
  "visibility_state": "visible"
}
```

Open-string values in the examples (platform, model, account, auth mode, execution role, matrix entry) are illustrative; their vocabularies stay with their own owners.

**MS-135 model lifecycle transitions (2026-11-25).** `model_lifecycle_state` (§4.1, CV-144) is a catalog-entry state, separate from the provider lifecycle in the acceptance criteria above. A model is dispatchable only when its own state allows it and its provider's state is `healthy` or `degraded`. The allowed transitions are exactly these; every other transition is invalid. A failed or partial catalog refresh never changes `model_lifecycle_state`. Each transition records `from_state`, `to_state`, `trigger`, `evidence_ref` and `transitioned_at_utc`.

| From | To | Trigger |
| --- | --- | --- |
| `active` | `deprecated` | A successful catalog refresh or provider metadata marks the model deprecated; `deprecation_notice_ref?` is recorded. |
| `active` | `sunset_pending` | The provider announces an end date; `sunset_at_utc` and `replacement_model_id?` are recorded. |
| `deprecated` | `sunset_pending` | The provider announces an end date for a deprecated model. |
| `deprecated` | `active` | A later successful catalog refresh no longer marks the model deprecated. |
| `sunset_pending` | `deprecated` | The provider withdraws the end date but keeps the deprecation. |
| `sunset_pending` | `sunset` | `sunset_at_utc` passes. |
| `active`, `deprecated` or `sunset_pending` | `sunset` | The provider stops serving the model before any announced date: a dispatch returns the provider's model-not-found error and the next successful catalog refresh omits the model. |
| `sunset` | `removed` | The provider explicitly lists the model as removed, or two consecutive successful catalog refreshes at least 24 hours apart omit it. |

`removed` is terminal for that catalog entry. If a provider later lists the same model id again, PM creates a new catalog entry generation that starts in `active`; history keeps the removed generation and its receipts.

| `model_lifecycle_state` | New dispatch | `visibility_state` | Model picker shows |
| --- | --- | --- | --- |
| `active` | yes | `visible` | the model with no notice |
| `deprecated` | yes | `visible_with_notice` | the model with a "Deprecated" notice and `deprecation_notice_ref?` |
| `sunset_pending` | yes | `visible_with_notice` | the model with an "Ends {sunset_at_utc}" notice and `replacement_model_id?` |
| `sunset` | no, unless an explicit compatibility policy permits it (CV-144) | `hidden_from_picker` | nothing; a run that a compatibility policy lets use it shows "Ended" beside the model name |
| `removed` | no, unless an explicit compatibility policy permits it (CV-144) | `history_only` | nothing; history, receipts and migration lineage still show it |

**MS-135 EffortSettlementReceipt payload (2026-11-25).** One receipt is written for every provider attempt, and a fresh one for every model switch, compaction, resume or subagent spawn. Effort values are the provider/model-specific labels from the capability snapshot (for example `high`, `max` or `thinking`), never a generic ladder (MS-115).

| Field | Type | Rule |
| --- | --- | --- |
| `receipt_id` | string | Unique per receipt. |
| `attempt_id` | string | The provider attempt this settles. |
| `model_id` | string | Effective model of the attempt. |
| `account_id` | string or null | Effective account; null when the route has no account. |
| `capability_snapshot_ref` | string | Snapshot whose effort support was read. |
| `requested_effort` | string or null | The label requested for this run; null when none was requested. |
| `policy_effort` | string or null | The label after scope policy ceilings; null when no policy applied. |
| `effective_effort` | string or null | The label actually honored; null when the route has no effort control or the request was skipped. |
| `effective_wire_value` | string or null | The exact provider-native value sent, such as `high` for `model_reasoning_effort`. |
| `provider_native_field` | string or null | The provider field it was sent in, such as `model_reasoning_effort` or `thinking`. |
| `display_label` | string | The label the GUI shows for the effective effort. |
| `settlement_reason` | string, closed: `honored`, `not_requested`, `clamped`, `transformed`, `skipped_unsupported`, `ignored_by_provider`, `blocked_by_policy`, `reset_on_continuation` | Outcome of the effort request for this attempt. |
| `clamp_reason` | string or null, closed: `model_max_effort`, `policy_ceiling`, `budget_limit`, `provider_mapping` | Required when `settlement_reason` is `clamped` or `transformed`; null otherwise. |
| `token_budget` | integer or null | Reasoning token budget sent; null when the route has none. |
| `cost_ceiling_microusd` | integer or null | Cost ceiling applied to the attempt; null when none. |
| `support_source` | string, closed: `documented`, `empirical`, `inferred` | Same meaning as §10.4.3 `source`. |
| `transform_version` | string | Version of the PM-owned effort transform used. |
| `first_response_latency_bucket` | string, closed: `under_1s`, `1s_to_10s`, `10s_to_60s`, `over_60s`, `no_first_response` | Time to the first token or reasoning item; a stall is `no_first_response`, never ordinary thinking time. |
| `display_mismatch` | boolean | `true` when the provider accepted the request but the GUI label differs from `effective_effort`. |
| `created_at_utc` | string (RFC 3339) | When the receipt was written. |

`settlement_reason = honored` requires `requested_effort` and `effective_effort` to be equal and non-null; only `honored` may be shown as honored. `not_requested` requires `requested_effort = null`.

```json
{
  "receipt_id": "esr_0193",
  "attempt_id": "attempt_0007",
  "model_id": "kimi-k2-thinking",
  "account_id": "acct_kimi",
  "capability_snapshot_ref": "capsnap://kimi/kimi-k2-thinking/rev-9",
  "requested_effort": "max",
  "policy_effort": "max",
  "effective_effort": "high",
  "effective_wire_value": "high",
  "provider_native_field": "reasoning_effort",
  "display_label": "High (Max not supported)",
  "settlement_reason": "transformed",
  "clamp_reason": "provider_mapping",
  "token_budget": null,
  "cost_ceiling_microusd": 250000,
  "support_source": "documented",
  "transform_version": "effort-transform-3",
  "first_response_latency_bucket": "1s_to_10s",
  "display_mismatch": false,
  "created_at_utc": "2026-11-25T15:12:30Z"
}
```

**MS-135 ModelSelectionRouter scoring (2026-11-25).** The router never replaces a concrete model chosen by the precedence tiers in "Deterministic precedence by scope". It runs only when the winning tier names a routing policy instead of a model (an auto-selected default recorded in the resolver record, such as `/easiest`). A concrete pick that is not eligible goes to `fallback_chain[]` in `priority` order, not to the router. The router's result sets `resolver_matrix_entry = "model_selection_router"` and lists every candidate in `selection_reason.alternatives[]`.

Step 1, gates. A candidate that fails any gate is excluded and listed with `eligible = false` and one `exclusion_reason`, checked in this order:

| Gate | Passes when | `exclusion_reason` |
| --- | --- | --- |
| `capability_match` | The candidate provides every required capability of the request: modalities, tool need and verification tier. | `capability_missing` |
| `account_entitlement` | The candidate's account is selectable under Multi-Account: its EntitlementQuotaSettlement `quota_state` permits dispatch and no blocking `failure_class` is set. | `not_entitled` |
| `route_health` | The provider lifecycle state is `healthy` or `degraded`. | `route_unhealthy` |
| model lifecycle | `model_lifecycle_state` allows new dispatch by the table above. | `model_not_dispatchable` |
| `context_window` | `effective_context_window_tokens` is at least the request's estimated input tokens plus its reserved output tokens. | `context_too_small` |

Step 2, factor scores. Each eligible candidate gets integer scores from 0 to 1000. `account_entitlement` is a gate only and scores nothing.

| Factor | Score |
| --- | --- |
| `capability_match` | `floor(1000 * satisfied / requested)` over the request's optional preferred capabilities; 1000 when none are requested. |
| `route_health` | 1000 for `healthy`, 500 for `degraded`. |
| `cost` | `floor(1000 * (max - c) / (max - min))` over the eligible candidates' estimated request cost `c` in microusd; 1000 for all when `max = min`; 0 when the cost is unknown. |
| `latency` | The same formula over expected first-response latency in milliseconds; 0 when unknown. |
| `context_window` | 1000 when the window is at least twice the required tokens, otherwise 500. |
| `user_preference` | For the router policy's ordered preference list of length `n`, rank `r` (0-based) scores `floor(1000 * (n - r) / n)`; unlisted candidates and an empty list score 0. |

Step 3, weights. Weights are integer percentages that always sum to 100. The default is `capability_match` 30, `route_health` 20, `user_preference` 20, `cost` 15, `latency` 10, `context_window` 5. `cost_policy = prefer_low_cost` moves 10 points from `user_preference` to `cost`; `cost_policy = ignore_cost` moves all `cost` points to `capability_match`. `latency_policy = prefer_low_latency` moves 10 points from `user_preference` to `latency`; `latency_policy = ignore_latency` moves all `latency` points to `capability_match`. No weight goes below 0.

Step 4, choice. `total_score = sum(weight * factor_score)`, an integer from 0 to 100000. The highest `total_score` wins. A tie is broken by lower configured `priority` (unlisted candidates take 2147483647), then `provider_id`, then `model_id`, both in ascending UTF-8 byte order. When no candidate is eligible the router returns `no_eligible_candidate`, the resolver walks `fallback_chain[]` up to `max_depth`, and exhaustion emits `fallback_exhausted`. Cost, latency, capability and quota inputs are read from refs pinned in the resolver record, so the same inputs always select the same winner.

Each `selection_reason.alternatives[]` entry from the router has `provider_id` (string), `model_id` (string), `eligible` (boolean), `exclusion_reason?` (one of the gate codes), `factor_scores?` (object with the six integer factor scores), `weights` (object with the six integer weights), `total_score?` (integer) and `priority` (integer).
