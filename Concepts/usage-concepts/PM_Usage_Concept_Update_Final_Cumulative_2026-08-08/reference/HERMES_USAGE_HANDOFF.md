# Handoff to “Usage Feature Review” from PMConcept7 Settings / Hermes Source Audit

**Date:** 2026-08-04  
**Audience:** Agent continuing the Usage page redesign and Usage Plans/U10 work  
**Purpose:** Add the usage-accounting consequences of the Settings, provider, Chat Assistant, Hermes v0.20.0, multi-account, Free Models, context, tool-recovery, approval, and subagent research. This handoff does **not** ask the Usage agent to design Settings.

## Source basis

This handoff is grounded in:

- the current Usage-to-Settings handoff;
- the supplied Puppet Master Plans;
- attached Hermes Agent v0.20.0 source;
- attached `claude-swap`, `CCSwitcher`, `codex-switcher`, and Free Coding Models sources.

No Plans, PMConcept7, Usage concepts, commands, wiring, DRY files, or repositories were changed.

---

# 1. Preserve the existing ownership boundary

Keep this division:

> **Settings decides what should happen next.**  
> **Chat explains what is about to happen now.**  
> **Usage explains what actually happened, what it consumed, and what state remains.**

Settings remains canonical for:

- provider/account/connection configuration;
- model visibility, favorites, aliases, priority, and role assignment;
- account/provider fallback and continuation policy;
- included-plan versus extra-usage behavior;
- model/provider/cache/context warning preferences;
- auxiliary-model defaults;
- probe/catalog refresh policy.

Usage remains canonical for:

- provider- or CLI-reported usage;
- observed token, cache, time, cost, allowance, reset, and cooldown history;
- current balances and pressure projections;
- execution-time requested/effective route receipts;
- helper, retry, replay, subagent, and transformation attribution;
- data quality, freshness, settlement, and evidence provenance;
- exports and historical inspection.

Do not build a second provider/account settings system in Usage. Deep-link to semantic Settings destinations.

The shared hierarchy remains:

```text
Provider family
  Account/profile
    Connection
      Product or entitlement
        Models and capabilities
```

A Free Models wrapper is a catalog/routing grouping. It is not a quota, billing, account, or usage identity.

---

# 2. Preserve the canonical attempt model

Use this fundamental rule:

> **One real provider attempt gets one usage event. Related attempts are grouped under one logical turn or operation.**

A visible user turn may include:

```text
primary model attempt
failed attempt
fallback replay
model-switch replay
subagent calls
vision helper
compression helper
web extraction helper
approval reviewer
MCP router
skill search
catalog/model validation probe
attachment transformation
MoA reference calls
MoA aggregation
```

Do not collapse those into the final successful model. Do not double-count them as both helper activity and main-turn activity.

Every event should preserve immutable execution-time snapshots rather than joining historical events to today's current Settings.

Minimum shared identity:

```text
usage_event_id
logical_turn_id
attempt_id
parent_event_id?
session_id
thread_id
goal_id?
run_id?
subagent_id?

provider_family_id
requested_account_id
effective_account_id
connection_id
product_or_entitlement_id
requested_model_id
effective_model_id
billing_route

purpose
conversation_mode
requested_access_profile
effective_access_profile
reasoning_effort
speed_mode

started_at
finished_at
settlement_status
source_class
data_quality
receipt_ref
```

Never persist raw credentials, raw CLI token blobs, or directly retrievable secret references in Usage.

---

# 3. Add context-maintenance accounting

Puppet Master already has extensive context and compaction policy. Hermes source adds implementation-level events that Usage must be prepared to represent.

The final canonical event name belongs to the Plans owner. For design and data planning, account for a `ContextMaintenanceEvent` or equivalent.

## Required semantics

```text
context_maintenance_event_id
parent_logical_turn_id
parent_attempt_id?
operation_kind:
  proactive_prune
  automatic_compaction
  manual_compaction
  micro_compaction
  context_reselection
  rotation_repack
  model_switch_repack
  cache_rebuild

trigger_kind:
  ratio_threshold
  absolute_token_threshold
  large_tool_result
  idle
  manual
  model_switch
  provider_switch
  account_switch
  context_engine

engine_id
strategy_id
config_snapshot_hash
context_epoch_before
context_epoch_after

estimated_tokens_before
estimated_tokens_after
estimated_tokens_reclaimed
protected_tail_user_turns
protected_head_items
skill_markers_preserved

cache_effect:
  preserved
  partially_preserved
  broken
  rebuilt
  not_supported
  unknown

status:
  started
  no_gain
  soft_deferred
  completed
  timed_out_discarded
  failed

attempt_number
duration_ms
helper_usage_event_ids[]
source_class
data_quality
failure_or_defer_reason?
```

## Display rule

Do not expose raw compacted prompts or giant technical logs in the main Usage view.

Default compact presentation:

```text
Context compacted
18.2K tokens reclaimed · Cache restarted · 1 helper call
```

Expanded details may show:

- why it ran;
- before/after pressure;
- helper provider/account/model;
- input/output/cache tokens and cost;
- whether the cache prefix survived;
- whether it was user-requested or automatic;
- whether no change was committed because there was no gain, a timeout, or lock contention.

A deterministic local prune with no model call can have zero provider tokens while still being a context-maintenance event. Zero must be distinct from unknown.

## Manual Compact Now

`cmd.chat.compact_context` should remain a context operation, not fake user work. It must not mutate historical usage totals. Any actual helper provider calls it causes are new usage events attributed to `compression` or `context_maintenance`.

---

# 4. Add prompt-cache evidence

Settings and Chat need to predict cache impact; Usage must record what actually occurred.

Represent a `PromptCacheEvent` or request-level cache snapshot with:

```text
requested_cache_policy
effective_cache_policy
provider_marker_format
provider_marker_supported
stable_prefix_hash
tool_schema_hash
skill_slice_hash
mcp_surface_hash
context_epoch
cache_read_tokens
cache_write_tokens
cache_hit_expectation
observed_cache_hit
invalidation_reason
source_class
settlement_status
data_quality
```

Material invalidation reasons should include:

```text
provider_changed
account_or_connection_changed
model_changed
effort_changed
speed_mode_changed
system_or_persona_changed
tool_schema_changed
mcp_surface_changed
skill_slice_changed
memory_or_context_assembly_changed
compaction_changed_prefix
conversation_branch
fallback_or_replay
provider_did_not_honor_marker
unknown
```

Do not infer route support from a model family alone. The attached Hermes v0.20.0 source explicitly excludes DeepSeek cache markers on OpenCode because that exact route rejects the transformed content shape, despite broader release wording. Usage and capability metadata therefore need source/version/route evidence.

---

# 5. Add tool self-recovery attribution

Hermes's “tools that fix themselves” means tools emit recovery evidence. Usage should preserve it without turning recovery into duplicate user work.

Represent a `ToolRecoveryEvent` or equivalent:

```text
logical_tool_operation_id
tool_call_id
parent_turn_id
subagent_id?
tool_id
failure_class
retryability
recovery_hint_kind
spill_or_artifact_ref?
visible_output_chars
full_output_chars
truncated
cwd_changed
already_applied_noop
ambiguous_match_count
negative_cache_hit
verification_status
retry_tool_call_ids[]
final_outcome
```

Rules:

- each actual tool invocation remains an attempt;
- retries are grouped under one logical tool operation;
- an already-applied patch success-no-op is not a failed edit and must not imply file mutation;
- reading a spill artifact instead of rerunning a command should show as recovery without duplicate command execution;
- FileSafe or permission denial is not a transient tool failure;
- local tool calls without provider tokens still belong in operational history, but provider cost remains zero rather than estimated from nothing;
- tool spill refs must be redacted, bounded, retained, and cleaned according to canonical artifact policy.

Suggested expanded Usage copy:

```text
Test command output was truncated
Full redacted output was saved and inspected; the command was not rerun.
```

---

# 6. Add active-turn redirect accounting

The Chat Assistant concepts will model a user correcting an active turn. Usage needs to distinguish that from an ordinary new message.

Represent an `ActiveTurnRedirectEvent` or equivalent:

```text
redirect_event_id
original_turn_id
original_attempt_ids[]
correction_message_id
provider_support:
  native_redirect
  interrupt_and_resume
  unsupported

abort_status
visible_partial_output_preserved
hidden_reasoning_replayed = false
new_logical_turn_id?
resumed_attempt_ids[]
cache_effect
wasted_or_aborted_tokens
wasted_or_aborted_cost
settlement_status
```

Default Usage view should group the sequence under the user's logical correction while preserving the aborted and resumed attempts in details.

Do not hide spend merely because the first attempt was interrupted.

---

# 7. Add approval and access-policy receipts

The Chat Assistant will use:

```text
Ask for approval
Auto accept edits
Auto
Full Access
```

Conversation mode is a separate ceiling. Plan and Review may use safe read, web, browser, test, and diagnostic operations but remain effect-limited.

Usage should consume, not own, `ApprovalDecisionEvent` semantics:

```text
approval_event_id
parent_turn_id
operation_digest
operation_kind
requested_access_profile
effective_access_profile
conversation_mode
mode_ceiling_applied
scope_summary
decision:
  denied
  allowed_once
  allowed_session
  allowed_persistent
  auto_approved
  filesafe_blocked

smart_reviewer_usage_event_id?
consecutive_denial_count
breaker_triggered
filesafe_outcome_ref?
policy_source
wait_duration_ms
```

Usage may display:

- time waiting for approval;
- helper-model usage/cost for an approval reviewer;
- denials and repeated-denial breaker outcomes;
- Full Access being limited by Review mode;
- FileSafe blocking after a permissive approval policy.

Usage must not expose raw command arguments, secrets, or protected paths in ordinary summaries. Exact redacted details live behind the canonical receipt/detail reference.

---

# 8. Expand subagent lifecycle attribution

PM already has a much richer policy and Persona system than Hermes. Hermes adds useful runtime status and delivery mechanics.

Each child should preserve:

```text
child_agent_id
parent_goal_or_turn_id
subagent_role_id
requested_persona_id
effective_persona_id
provider_family_id
account_id
connection_id
model_id
reasoning_effort
speed_mode
write_mode
started_at
finished_at
status
progress_state
stall_reason?
timeout_reason?
tool_rounds
context_epoch
cache_lineage_ref
input_tokens
output_tokens
reasoning_tokens
cache_read_tokens
cache_write_tokens
cost_or_allowance
queue_time_ms
active_time_ms
result_delivery_receipt
redacted_trace_ref?
```

Usage should distinguish:

```text
configured PM maximum
provider/account advertised or discovered maximum
current effective maximum
actual peak concurrency
queued because of PM policy
queued because of provider/account limitation
queued because of runtime capacity
```

Unknown or dynamically limited must not be rendered as zero.

Default view may aggregate subagents; expanded detail must retain each child and all fallback/retry attempts.

---

# 9. Add catalog refresh and model-validation evidence

Models.dev and Free Coding Models change frequently. They are continuously refreshed sources, not one-time imports.

Represent a `CatalogRefreshEvent` or equivalent:

```text
catalog_source:
  models_dev
  free_coding_models
  provider_catalog
  cli_catalog

source_version_or_commit
source_hash
prior_active_version
refresh_mode:
  background
  forced
  post_auth
  startup

stale_data_served
last_known_good_used
status
failure_backoff_until?
models_added
models_removed
models_changed
free_state_changes
auth_flow_changes
capability_changes
activated_at?
```

Catalog-only network refresh is operational telemetry, not provider model usage.

When PM sends an actual model request to verify availability/capability, create a separate `ProbeUsageEvent`:

```text
probe_kind
provider/account/connection/model
passive_or_active
reason
tokens
cache
cost
quota_effect
result
source_version
```

Active free-model probes can consume scarce allowance. Attribute them as `validation` or `probe`, not user work.

---

# 10. Add exact credential-route snapshot without secrets

Multi-account source review shows why “authenticated” is not enough. Usage must know which route actually supplied allowance or received cost.

Each provider attempt needs a `CredentialRouteSnapshot` or equivalent with:

```text
authentication_method
credential_source_class
account_id
connection_id
profile_home_id?
endpoint_or_harness
expected_product_or_plan
actual_product_or_plan
billing_route
route_selection_reason
identity_verified_at
inference_verified_at
```

Allowed source classes can include:

```text
cli_owned_profile
pm_oauth
api_key_secret_ref
vault_ref
command_helper_ref
environment_ref
local_endpoint
no_auth
```

Never store raw credential values in Usage.

A silently selected environment key is a material route change and must be visible in route evidence because it can move usage from a subscription allowance to API billing.

---

# 11. UI grouping and information density

The default Usage page should remain human-readable.

Recommended top-level grouping:

```text
User work
Subagents
Vision and media
Context and compression
Web and research helpers
Tool and MCP helpers
Validation and probes
Retries, fallbacks, and replays
```

Do not expose every system event as a giant undifferentiated ledger by default. The detailed ledger remains available for inspection/export.

A normal turn card can say:

```text
GPT-5.6 · Personal OpenAI · ChatGPT plan
42.1K input · 3.2K output · 18.0K cache read
2 helper calls · 1 subagent
```

Expanded system activity can show:

```text
Compression helper       2.4K input · 310 output
Vision helper            Gemini · API usage
Fallback replay          Work account → Personal account
```

Use the established source-quality labels and never render missing data as zero.

---

# 12. Data-quality and settlement rules

Every amount must retain:

```text
source_class:
  provider_reported
  provider_header
  cli_reported
  pm_observed
  local_estimated
  pricing_estimated
  derived
  unknown

settlement_status:
  observed
  streaming_partial
  settled
  adjusted
  failed
  unknown

projection_freshness:
  current
  refreshing
  stale

projection_health:
  healthy
  degraded
  unavailable
```

Rules:

- absent is not zero;
- unknown is not unavailable;
- a missing cache-write field is not `0 cache writes`;
- failed and aborted attempts remain in history;
- provider-reported receipt is retained alongside normalized values;
- derived/estimated values preserve method and pricing/version snapshot;
- historical route, price, free-state, and capability interpretation is immutable.

---

# 13. State that Settings may read from Usage

The Provider Manager can consume compact read-only projections from Usage:

```text
included usage remaining
extra balance
usage packs and expiration
saved resets and expiration
current pressure
next reset or cooldown
post-plan rate
last successful use
last failure
cache read/write and hit rate
run-out projection
provider source freshness
data-quality status
validation/probe activity
```

Settings chooses policy. Usage computes or reports state. Do not put provider billing math into Settings components.

---

# 14. Semantic deep links

Do not hard-code the old `cmd.settings.bloom.open` interaction as the future contract.

Usage should target a semantic destination:

```text
surface: settings
manager: providers
provider_family_id
account_id?
connection_id?
product_id?
model_id?
section: usage_and_extra_usage | routing | models | diagnostics
setting_id?
focus_reason
```

The command layer can later map this to the selected Settings workspace implementation.

---

# 15. Demo scenarios the Usage concepts should include

Add or ensure coverage of these realistic states:

1. **Automatic compaction with a helper call** — context reclaimed, cache prefix changed, helper cost attributed.
2. **Local proactive prune** — context reclaimed with no provider call and no fake cost.
3. **Micro-compaction enabled** — several small helper calls, cache-break consequence visible.
4. **Model switch and conversation replay** — old cache does not carry over; destination route and replay cost shown.
5. **Terminal output spill** — full redacted output inspected without rerunning the command.
6. **Patch already applied** — successful no-op, zero mutation, no redundant repair attempt.
7. **Active-turn redirect** — first provider attempt interrupted, partial usage retained, corrected attempt grouped underneath.
8. **Full Access limited by Review mode** — effective access differs from requested access; safe browser/test tools still work.
9. **Subagent wave with mixed models/accounts** — parent plus children, cache and cost per child, peak/effective concurrency.
10. **Free-model active probe** — quota consumed as validation activity, not user work.
11. **Stale catalog served immediately** — background refresh succeeds or enters backoff; no provider usage unless probed.
12. **Same-provider account fallback** — requested Work account, effective Personal account, exact connection and reason.
13. **Vision alternate route** — text-only main model plus separately billed vision helper after consent/policy.
14. **Compression timeout discarded** — helper call may have usage, but no context mutation committed.
15. **Approval reviewer and denial breaker** — reviewer cost, repeated denials, breaker stops further proposals.

---

# 16. Existing Usage requirements that remain authoritative

Do not regress the current redesign's established requirements:

- separate input, output, reasoning, cache-read, and cache-write buckets;
- no double counting;
- session/project/model/provider/account/subagent/tool grouping;
- plan allowance versus API cost/value separation;
- resets, cooldowns, overage, packs, saved resets, and provider-specific continuation behavior;
- burn rate and run-out estimates with provenance;
- requested/effective account and model;
- current/refreshing/stale and healthy/degraded/unavailable semantics;
- `provider_reported | provider_header | cli_reported | local_estimated | pricing_estimated | unknown` style authority distinctions;
- widgets, responsive layouts, theme coverage, no left-edge color bars, no emojis, Slint 1.17.1 portability;
- realistic demo content and wired interactions.

---

# 17. Non-goals for the Usage thread

Do not make Usage responsible for:

- provider onboarding or credential entry;
- account profile isolation;
- model favorite/alias/priority editing;
- approval-policy configuration;
- FileSafe rule editing;
- compaction strategy configuration;
- tool/MCP enablement;
- Persona or subagent-role editing;
- catalog import validation logic;
- attachment-routing policy;
- direct purchase flows unless an explicit typed command and receipt are later approved.

Usage can show current state, consequences, and deep links into those owners.

---

# 18. Impact-tracking checklist for the Usage agent

The Usage redesign agent should track, but not update yet unless explicitly authorized:

```text
Plans
  usage-feature.md
  storage-plan.md
  Contracts_V0.md
  Prompt_Pipeline.md consumer refs
  Models_System.md consumer refs
  Goal_Runtime_System.md consumer refs
  orchestrator-subagent-integration.md consumer refs
  Permissions_System.md consumer refs
  Tools.md consumer refs

Commands
  usage detail/open/export/refresh
  semantic Settings deep link
  compact-context detail linkage
  child/subagent detail linkage

Wiring
  provider attempt → UsageRecord
  helper call → parent logical turn
  cache/context event → usage detail
  tool recovery → attempt ledger
  approval event → wait/reviewer usage
  catalog refresh/probe → system activity
  semantic Settings destination

DRY
  route snapshot
  source quality
  settlement state
  helper purpose enum
  context maintenance event
  cache event
  tool recovery event
  active-turn redirect event
  approval decision receipt
  subagent lifecycle event
  catalog refresh/probe event
```

The exact canonical names should be reconciled with existing PlanUnits and schemas rather than appended as duplicates.

---

# 19. Concise directive for the Usage Feature Review thread

> Extend the Usage redesign so it can explain not only the selected main model, but the complete executed route and all meaningful helper/system work: compression, cache changes, tool recovery, approvals, active-turn redirects, subagents, alternate media routes, catalog validation, probes, retries, fallbacks, and replays. Preserve one event per real attempt, group events under the user's logical turn, retain immutable route/policy snapshots, distinguish zero from unknown, and keep policy configuration in Settings/Permissions/FileSafe rather than duplicating it in Usage.
