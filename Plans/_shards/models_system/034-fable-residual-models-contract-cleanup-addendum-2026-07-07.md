# Shard 034: FABLE Residual Models Contract Cleanup Addendum - 2026-07-07

Source: `Plans/Models_System.md`

Source lines: L9729-L10098

Source SHA256: `340bf9854a9139cf1e164d0a5b2681767e23b38fcfdf297a4b517497e4120706`

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
gui_related: true
gui_classification_reason: Mostly backend provider/model contracts, but the unit also assigns model-picker visibility_state per lifecycle state and the unknown-price display, which are user-visible GUI presentation.
depends_on: [MS-017, MS-031, MS-083, MS-124, MS-127, MS-134, MA-067]
unblocks: []
acceptance_criteria:
  - Gemini provider variants are named gemini_api_key and vertex_ai, with credential_kind, endpoint_base, project_id?, location?, quota_scope, and capability_snapshot_ref fields.
  - ProviderCapabilityEpoch replacement rule is provider_id plus account_id plus credential_route_epoch_id plus capability_source plus epoch_started_at_ms; MS-124 and MS-127 references must merge into that identity instead of duplicating epochs.
  - fallback_chain[] items include model_id, provider_id, reason_code, priority, max_attempts, eligibility_filter_ref, and terminal_on_reason_codes[]; max_depth defaults to 3 and exhaustion emits fallback_exhausted.
  - Resolver examples include requested_model_id, requested_provider_id?, account_id?, capability_snapshot_ref, credential_route_epoch_id, resolved_model_id, fallback_used, clamp_reason?, and visibility_state.
  - Provider lifecycle transitions are discovered -> configured -> healthy -> degraded -> disabled -> removed, with degraded -> healthy and disabled -> configured recovery routes and no removed recovery.
  - EffortSettlementReceipt records requested_effort, effective_effort, clamp_reason, model_id, account_id, token_budget, cost_ceiling_microusd?, and settlement_reason.
  - ModelSelectionRouter applies account_entitlement as an eligibility gate and scores eligible provider/model candidates by capability_match, route_health, cost, latency, context_window, and user_preference with deterministic tie-break by configured priority then provider_id/model_id.
  - EntitlementQuotaSettlement, ProviderPolicyRuleset, ProviderMetadataReplayPolicy, and ProviderErrorEnvelope carry concrete fields for quota_state, policy_decision, replay_window_ms, HTTP/status/body_class/request_id/retryability, and redaction policy.
  - The two populated resolver record examples below MS-135 carry requested_model_id, resolved_model_id, fallback_used and visibility_state beside the emit-shape fields they equal, and a record whose MS-135 spelling differs from its emit-shape field is rejected with resolver_record_invalid.
  - model_lifecycle_state (active, deprecated, sunset_pending, sunset, removed) changes only along the MS-135 model lifecycle transition table, which is separate from the provider lifecycle above; each state maps to one dispatch rule and one visibility_state shown in the model picker.
  - EffortSettlementReceipt is the typed payload in the MS-135 table, with closed settlement_reason and clamp_reason values, and only settlement_reason honored may display as honored.
  - ModelSelectionRouter applies the MS-135 gates, integer 0-1000 factor scores, policy-adjusted integer weights summing to 100, and the highest total_score, so conflicting cost and latency inputs select the same winner in every implementation.
  - ModelSelectionRouterInput is the closed typed router input carrying the MS-128 inputs and pinned by selection_reason.router_input_ref. Example 3 below MS-135 shows each candidate's eligibility and weights, the exclusion reason for a failed gate, and factor_scores and total_score only for eligible candidates. An unknown price stays pickable and is shown as unknown.
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
| `clamp_reason?` | string, closed to these members of the `clamp/substitution` reason-code family ("Provider capability and cost gating" above): `effort_unsupported`, `effort_clamped`, `auth_family_capability_clamped`, `capability_unknown`, `instruction_projection_partial`, `skill_projection_partial` | Present only when a requested value was not applied exactly for a reason other than model fallback, with the family's meanings (`effort_clamped` = accepted but narrowed effort; `effort_unsupported` = the effort control is unsupported). The model-level family codes `model_unavailable`, `model_routed_by_provider` and `model_substituted` are never written here: model fallback is `fallback_used = true` with `selection_reason.fallback_reason`. When more than one code applies, the first in this list is recorded and the others stay in the attempt's `EffortSettlementReceipt` and `skipped_persona_controls[]`. Why an effort was narrowed (model maximum, policy ceiling, budget, provider mapping) is the attempt's `EffortSettlementReceipt.clamp_reason`, not this field. |
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
  "clamp_reason": "effort_clamped",
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
| `effective_wire_effort` | string or null | The exact provider-native value sent, such as `high` for `model_reasoning_effort`. |
| `provider_native_field` | string or null | The provider field it was sent in, such as `model_reasoning_effort` or `thinking`. |
| `display_label` | string | The label the GUI shows for the effective effort: the effort label, optionally followed by one space and one parenthesized notice such as `(Max not supported)`. |
| `settlement_reason` | string, closed: `honored`, `not_requested`, `clamped`, `transformed`, `skipped_unsupported`, `ignored_by_provider`, `blocked_by_policy`, `reset_on_continuation` | Outcome of the effort request for this attempt. |
| `clamp_reason` | string or null, closed: `model_max_effort`, `policy_ceiling`, `budget_limit`, `provider_mapping` | Required when `settlement_reason` is `clamped` or `transformed`; null otherwise. These values are the cause of the narrowing, not `clamp/substitution` family codes: the resolver record for the same attempt carries the family code, `effort_clamped` for `clamped`, and for `transformed` when the transform lowered the effort, and `effort_unsupported` for `skipped_unsupported`. |
| `fallback_reason` | string or null | When this attempt runs on a fallback model, the same value as the resolver record's `selection_reason.fallback_reason`, and the effort is settled again against the fallback model's capability snapshot; null when no fallback happened. |
| `reset_detection` | string, closed: `not_applicable`, `preserved`, `reset_detected` | `not_applicable` on the first attempt of a session lineage. On a model switch, compaction, resume, continuation or subagent spawn PM compares this attempt's effective effort with the previous receipt of the same lineage: `preserved` when the requested effort is still applied, `reset_detected` when the provider or harness dropped it back to a default. `reset_detected` requires `settlement_reason = reset_on_continuation`, and `reset_on_continuation` requires `reset_detected`. |
| `token_budget` | integer or null | Reasoning token budget sent; null when the route has none. |
| `cost_ceiling_microusd` | integer or null | Cost ceiling applied to the attempt; null when none. |
| `support_source` | string, closed: `documented`, `empirical`, `inferred` | Same meaning as §10.4.3 `source`. |
| `transform_version` | string | Version of the PM-owned effort transform used. |
| `first_response_latency_bucket` | string, closed: `under_1s`, `1s_to_10s`, `10s_to_60s`, `over_60s`, `no_first_response` | Time to the first token or reasoning item; a stall is `no_first_response`, never ordinary thinking time. |
| `display_mismatch` | boolean | `true` when the provider accepted the request but the GUI label differs from `effective_effort`. The comparison removes a trailing parenthesized notice from `display_label`, trims spaces and compares the rest with `effective_effort` ignoring ASCII case; `false` when they are equal or the provider did not accept the request. In the example below `High (Max not supported)` compares as `High`, which equals `high`, so `display_mismatch` is `false`. |
| `created_at_utc` | string (RFC 3339) | When the receipt was written. |

`settlement_reason = honored` requires `requested_effort` and `effective_effort` to be equal and non-null; only `honored` may be shown as honored. `not_requested` requires `requested_effort = null`. The field names follow MS-126's EffortSettlementReceipt list exactly (`requested_effort`, `policy_effort`, `effective_wire_effort`, `provider_native_field`, `display_label`, `support_source`, `transform_version`, `fallback_reason`, `reset_detection`, `first_response_latency_bucket`); `settlement_reason`, `clamp_reason` and the other fields above are added beside them, and none replaces an MS-126 field. The model-switch replay rule is the first sentence of this payload: a model switch writes a fresh receipt, settled against the new model's snapshot.

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
  "effective_wire_effort": "high",
  "provider_native_field": "reasoning_effort",
  "display_label": "High (Max not supported)",
  "settlement_reason": "transformed",
  "clamp_reason": "provider_mapping",
  "fallback_reason": null,
  "reset_detection": "not_applicable",
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

Router input. Each routing decision reads one closed `ModelSelectionRouterInput` record, written before Step 1 and pinned in the resolver record by `selection_reason.router_input_ref`; it carries MS-128's inputs. All fields are required.

| Field | Type | Source and use |
| --- | --- | --- |
| `router_input_id` | string | Unique per routing decision; `selection_reason.router_input_ref` holds this value. |
| `routing_policy_ref` | string | The routing policy the winning precedence tier named, such as `/easiest`. |
| `execution_unit_id` | string | Same value as `selection_reason.execution_unit_id`. |
| `task_kind` | string | The execution unit's task kind, from its dispatch context; the vocabulary stays with the dispatching owner. |
| `risk_class` | string | The execution unit's risk class, from the same place and with the same vocabulary rule. |
| `context_size` | object `{estimated_input_tokens: integer, reserved_output_tokens: integer}` | The `context_window` gate and factor; "required tokens" below is their sum. |
| `modalities[]` | array of string, capability names from the §10.4.3 snapshot | Required modalities; `capability_match` gate. |
| `tool_need[]` | array of string, capability names from the §10.4.3 snapshot | Required tool capabilities; `capability_match` gate. |
| `verification_tier` | string or null | A capability the candidate's snapshot must list; null when the policy requires none; `capability_match` gate. |
| `preferred_capabilities[]` | array of string | Optional preferred capabilities; `capability_match` factor. |
| `cost_policy` | string, closed: `default`, `prefer_low_cost`, `ignore_cost` | Step 3. |
| `latency_policy` | string, closed: `default`, `prefer_low_latency`, `ignore_latency` | Step 3. |
| `preference_list[]` | ordered array of `{provider_id: string, model_id: string}` | `user_preference` factor. |
| `persona_cost_budget_microusd` | integer or null | `cost_budget` gate; null when no active Persona cost budget applies. |
| `candidates[]` | array of objects, one per provider/model pair the routing policy allows on an account the person can use (MS-128's provider availability) | Each has `provider_id` (string), `model_id` (string), `account_id` (string or null), `capability_snapshot_ref` (string), `quota_settlement_ref` (string, the EntitlementQuotaSettlement the `account_entitlement` gate reads), `provider_lifecycle_state` (string), `model_lifecycle_state` (string), `effective_context_window_tokens` (integer), `estimated_cost_microusd` (integer or null, null when the price is unknown), `expected_first_response_latency_ms` (integer or null) and `priority` (integer or null, null when unlisted). |
| `fallback_chain[]` | array of the `fallback_chain[]` items above | Step 4, only when no candidate is eligible. |

`task_kind` and `risk_class` never score. A routing policy states what a task kind and risk class need through `modalities[]`, `tool_need[]`, `verification_tier`, `preferred_capabilities[]`, `cost_policy` and `latency_policy`. Whether cost may weigh more for a low-risk task, and which `verification_tier` a verifier's or adjudicator's model must have, are therefore set by the policy and never relaxed by the router: a candidate without the required tier fails `capability_match` (MS-128). The router's winner is the requested pair of the resolver record (MS-128: router output is requested and effective): `requested_platform`, `requested_model` and the MS-135 `requested_model_id` and `requested_provider_id` hold the winner, and the effective fields differ from them only through the fallback and clamp rules above.

Step 1, gates. A candidate that fails any gate is excluded and listed with `eligible = false` and one `exclusion_reason`, checked in this order:

| Gate | Passes when | `exclusion_reason` |
| --- | --- | --- |
| `capability_match` | The candidate provides every required capability of the request: modalities, tool need and verification tier. | `capability_missing` |
| `account_entitlement` | The candidate's account is selectable under Multi-Account: its EntitlementQuotaSettlement `quota_state` permits dispatch and no blocking `failure_class` is set. | `not_entitled` |
| `route_health` | The provider lifecycle state is `healthy` or `degraded`. | `route_unhealthy` |
| model lifecycle | `model_lifecycle_state` allows new dispatch by the table above. | `model_not_dispatchable` |
| `context_window` | `effective_context_window_tokens` is at least the request's estimated input tokens plus its reserved output tokens. | `context_too_small` |
| `cost_budget` | No active Persona cost budget applies, or the candidate's estimated request cost is unknown, or it is known and at most that budget in microusd ("Provider capability and cost gating", MS-102). A known estimate above the budget fails. | `over_cost_budget` |

The `cost_budget` gate is the hard "Cost gating" rule: an over-budget candidate is excluded before scoring, and no weight, `cost_policy` or `ignore_cost` setting can readmit it. The same gate is part of eligibility for a concrete pick and for every `fallback_chain[]` entry. An unknown estimate cannot be shown to exceed the budget, so it passes the gate and scores 0 on `cost` below. A candidate with an unknown price therefore stays pickable (DL-2604). Wherever the choice is shown, in its `selection_reason.alternatives[]` entry, the model picker and any settlement or receipt text, its price is shown as unknown (`cost_status` `unknown`, as in usage-feature GUI-USG-003), never as `$0.00`, as a known estimate or as within budget. MS-136's visible unknown-cost fail-closed state is this display rule: it refuses to show or total an unknown price as a known cost, and it does not exclude the candidate.

Step 2, factor scores. Each eligible candidate gets integer scores from 0 to 1000. `account_entitlement` and `cost_budget` are gates only and score nothing.

| Factor | Score |
| --- | --- |
| `capability_match` | `floor(1000 * satisfied / requested)` over the request's optional preferred capabilities; 1000 when none are requested. |
| `route_health` | 1000 for `healthy`, 500 for `degraded`. |
| `cost` | `floor(1000 * (max - c) / (max - min))` over the estimated request cost `c` in microusd. `min` and `max` are taken only over the eligible candidates whose estimate is known. A candidate whose estimate is unknown scores 0 and takes no part in `min` or `max`. When `max = min` (including exactly one known estimate) every candidate with a known estimate scores 1000. |
| `latency` | The same formula and the same known-only `min`/`max` domain over expected first-response latency in milliseconds; an unknown latency scores 0. |
| `context_window` | 1000 when the window is at least twice the required tokens, otherwise 500. |
| `user_preference` | For the router policy's ordered preference list of length `n`, rank `r` (0-based) scores `floor(1000 * (n - r) / n)`; unlisted candidates and an empty list score 0. |

Step 3, weights. Weights are integer percentages that always sum to 100. The default is `capability_match` 30, `route_health` 20, `user_preference` 20, `cost` 15, `latency` 10, `context_window` 5. `cost_policy = prefer_low_cost` moves 10 points from `user_preference` to `cost`; `cost_policy = ignore_cost` moves all `cost` points to `capability_match`. `latency_policy = prefer_low_latency` moves 10 points from `user_preference` to `latency`; `latency_policy = ignore_latency` moves all `latency` points to `capability_match`. No weight goes below 0.

Step 4, choice. `total_score = sum(weight * factor_score)`, an integer from 0 to 100000. The highest `total_score` wins. A tie is broken by lower configured `priority` (unlisted candidates take 2147483647), then `provider_id`, then `model_id`, both in ascending UTF-8 byte order. When no candidate is eligible the router returns `no_eligible_candidate`, the resolver walks `fallback_chain[]` up to `max_depth`, and exhaustion emits `fallback_exhausted`. When any candidate or fallback was excluded with `over_cost_budget`, that exhaustion also emits the MS-102 cost-budget concern with cheaper alternatives or escalation. Cost, latency, capability and quota inputs are read from refs pinned in the resolver record, so the same inputs always select the same winner.

Each `selection_reason.alternatives[]` entry from the router has `provider_id` (string), `model_id` (string), `eligible` (boolean), `exclusion_reason?` (one of the six gate codes), `estimated_cost_microusd` (integer or null; null when the price is unknown, and the GUI then shows the price as unknown, never `$0.00`), `factor_scores?` (object with the six integer factor scores), `weights` (object with the six integer weights), `total_score?` (integer) and `priority` (integer).

Example 3, a routing policy picks the model. Input (abridged to the fields that change the result; the fields not shown are present as the table above requires):

```json
{
  "router_input_id": "rti_0311",
  "routing_policy_ref": "/easiest",
  "execution_unit_id": "node_0101",
  "task_kind": "summarize",
  "risk_class": "low",
  "context_size": { "estimated_input_tokens": 60000, "reserved_output_tokens": 8000 },
  "preferred_capabilities": ["structured_output", "long_context"],
  "cost_policy": "prefer_low_cost",
  "latency_policy": "default",
  "preference_list": [
    { "provider_id": "claude-code", "model_id": "claude-sonnet-4-6" },
    { "provider_id": "codex", "model_id": "gpt-5.5-codex" }
  ],
  "persona_cost_budget_microusd": 200000,
  "candidates": [
    { "provider_id": "claude-code", "model_id": "claude-sonnet-4-6", "provider_lifecycle_state": "healthy", "effective_context_window_tokens": 200000, "estimated_cost_microusd": 120000, "expected_first_response_latency_ms": 2000, "priority": 1 },
    { "provider_id": "codex", "model_id": "gpt-5.5-codex", "provider_lifecycle_state": "degraded", "effective_context_window_tokens": 128000, "estimated_cost_microusd": 80000, "expected_first_response_latency_ms": 4000, "priority": 2 },
    { "provider_id": "gemini", "model_id": "gemini-3-pro", "provider_lifecycle_state": "healthy", "effective_context_window_tokens": 1000000, "estimated_cost_microusd": null, "expected_first_response_latency_ms": null, "priority": null },
    { "provider_id": "claude-code", "model_id": "claude-opus-4-6", "provider_lifecycle_state": "healthy", "effective_context_window_tokens": 200000, "estimated_cost_microusd": 450000, "expected_first_response_latency_ms": 3000, "priority": 3 }
  ]
}
```

Every candidate passes `capability_match`, `account_entitlement`, `route_health`, model lifecycle and `context_window` (required tokens 68000). `claude-opus-4-6` fails `cost_budget` (450000 > 200000) and is excluded. `gemini-3-pro` has an unknown price, so it passes `cost_budget` and stays pickable (DL-2604). Of the preferred capabilities, `claude-sonnet-4-6` and `gemini-3-pro` have both and `gpt-5.5-codex` has one. `prefer_low_cost` moves 10 points from `user_preference` to `cost`, giving weights `capability_match` 30, `route_health` 20, `user_preference` 10, `cost` 25, `latency` 10, `context_window` 5. The known costs are 120000 and 80000 and the known latencies 2000 and 4000, so `min` and `max` come from those two candidates only. `claude-sonnet-4-6` wins with 75000. The resolver record's `selection_reason` (other fields as in Examples 1 and 2):

```json
{
  "selected_provider": "claude-code",
  "selected_model": "claude-sonnet-4-6",
  "precedence_tier": 2,
  "router_input_ref": "rti_0311",
  "alternatives": [
    { "provider_id": "claude-code", "model_id": "claude-sonnet-4-6", "eligible": true, "estimated_cost_microusd": 120000,
      "factor_scores": { "capability_match": 1000, "route_health": 1000, "user_preference": 1000, "cost": 0, "latency": 1000, "context_window": 1000 },
      "weights": { "capability_match": 30, "route_health": 20, "user_preference": 10, "cost": 25, "latency": 10, "context_window": 5 },
      "total_score": 75000, "priority": 1 },
    { "provider_id": "codex", "model_id": "gpt-5.5-codex", "eligible": true, "estimated_cost_microusd": 80000,
      "factor_scores": { "capability_match": 500, "route_health": 500, "user_preference": 500, "cost": 1000, "latency": 0, "context_window": 500 },
      "weights": { "capability_match": 30, "route_health": 20, "user_preference": 10, "cost": 25, "latency": 10, "context_window": 5 },
      "total_score": 57500, "priority": 2 },
    { "provider_id": "gemini", "model_id": "gemini-3-pro", "eligible": true, "estimated_cost_microusd": null,
      "factor_scores": { "capability_match": 1000, "route_health": 1000, "user_preference": 0, "cost": 0, "latency": 0, "context_window": 1000 },
      "weights": { "capability_match": 30, "route_health": 20, "user_preference": 10, "cost": 25, "latency": 10, "context_window": 5 },
      "total_score": 55000, "priority": 2147483647 },
    { "provider_id": "claude-code", "model_id": "claude-opus-4-6", "eligible": false, "exclusion_reason": "over_cost_budget", "estimated_cost_microusd": 450000,
      "weights": { "capability_match": 30, "route_health": 20, "user_preference": 10, "cost": 25, "latency": 10, "context_window": 5 },
      "priority": 3 }
  ],
  "selection_time_utc": "2026-11-26T14:20:00Z",
  "execution_unit_id": "node_0101"
}
```

The same record has `resolver_matrix_entry = "model_selection_router"`, `requested_platform` and `effective_platform` `claude-code`, `requested_model`, `effective_model`, `requested_model_id` and `resolved_model_id` `claude-sonnet-4-6`, and `fallback_used = false`. Wherever this choice is shown, `gemini-3-pro`'s price reads as unknown, never `$0.00` or within budget.
