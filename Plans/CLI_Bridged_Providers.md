# CLI-Bridged Providers (Provider Facade)


## Canonical owner-section requirements

These requirements are canonical live specification text for this owner document and preserve the required product, runtime, storage, UI, and governance details in owner-section form.

### Requested/effective account identity contract


- Compatibility-only source vocabulary is noncanonical; live wording uses the owner terminology below.
> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


## Purpose
Define the **Provider facade** used by Puppet Master to run **bridged providers** (CLI-bridged and server-bridged) with a single, uniform contract for:

- **Structured request envelopes** (deterministic, replayable runs)
- **Normalized streaming events** (one consumer; no UI special-casing)
- **Tool-call correlation + reconciliation** (CLI oddities tolerated)
- **Authentication / UX-state detection** (logged out, expired or invalid, rate limit, outage)
- **Stream resilience** (bounded retry, replay safety, and circuit breaking)

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md

This document owns bridged-provider transport normalization only. PM-internal child orchestration, crew control, runtime ceilings, and parent/child lineage remain owned by `Plans/orchestrator-subagent-integration.md` and `Plans/Contracts_V0.md`.

ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Contracts_V0.md

Canonical mapping SSOT for upstream external-framework and A2A bridge concepts is `Plans/Provider_Stream_Mapping_External_Reference_A2A.md`. That document is external-reference and future-interop guidance for adapter implementors. It MUST NOT be interpreted as approval to move PM-internal orchestration or child-run control onto A2A semantics.

ContractRef: ContractName:Plans/Provider_Stream_Mapping_External_Reference_A2A.md, ContractName:Plans/orchestrator-subagent-integration.md

A2A seam warning: A2A bridge packet verification keeps `Plans/Provider_Stream_Mapping_External_Reference_A2A.md` in the highest-risk verify-only omission lane unless its intro and `/non-goal` framing still read as external-reference and `/future-interop` only; otherwise, it must be promoted out of `MUST VERIFY`. Adjacent docs rechecked and kept out of the packet for now are `Plans/Models_System.md`, whose current capability and compaction-threshold fields already match the narrowed owner set, and `Plans/Provider_Stream_Mapping_External_Reference_A2A.md`, whose current intro/non-goal framing already keeps A2A external-only. Other `MUST VERIFY` watchers must confirm that `Plans/Section15_MVP_Promoted_Features_Spec.md` defers `terminate_session` / graceful shutdown to `Run_Modes.md`; `Plans/Runtime_Artifacts_Panel.md` keeps `cost_usage` and `reasoning_tokens` compatible with microdollars and usage canon; `Plans/Wiring_Matrix.md` terminal kill wiring and checksum-validation flows do not conflict with process-group kills or mandatory CRC recovery; `Plans/MiscPlan.md` SIGTERM, symlink, and multi-instance notes remain advisory and do not shadow the new SSOT; and `Plans/assistant-chat-design.md` concurrent-thread UI defaults are not misread as global subagent concurrency limits.

## Canonical data-shape reconciliation

### Required data shape


### Contract shape (facade)

The contract shape is the provider facade handoff record used by bridge launchers, HTTP adapters, and normalized stream consumers.

The `BRIDGE_INVOKE_OPTIONS` record passed through the shell command line MUST preserve these fields:

```typescript
BRIDGE_INVOKE_OPTIONS {
  persona: string;            // Which Persona is active
  model: string;              // AI model requested (no provider precompute)
  model_variant?: string;     // Optional variant (effort, reasoning, etc.)
  provider_override?: string; // Explicitly requested provider
  run_mode: string;           // 'automate' | 'interactive' | 'diagnostic'
  trace_level: string;        // 'none' | 'summary' | 'detailed' | 'debug'
  account_id?: string;        // Requested GitHub account context
  dag_input?: string;         // Serialized DAG for this stage
  execution_role: string;     // Executor identity for permission/quota/logs
  shell_env?: Record;         // Safe shell environment snapshot
  worktree_id?: string;       // Assigned worktree for this node
  approve_mode?: string;      // 'auto_approve' | 'require_approval' | 'suggest_only'
  approval_id?: string;       // ID for prior approval context if resuming
  mutation_policy: string;    // 'conservative' | 'standard' | 'aggressive'
  timeout_ms?: number;        // Explicit timeout if scoped
  retry_policy?: string;      // 'backoff' | 'immediate' | 'custom'
  max_retries?: number;       // Retry ceiling for this provider
}
```

ContractRef: Primitive:Provider, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md

`ProviderRequestEnvelope` is the canonical provider-facade handoff record above provider-specific command-line or HTTP encodings. The expanded identity bundle in `ProviderRequestEnvelope` MUST include run/thread/parent/child lineage, attempt identity when present, execution role, requested/effective runtime/provider/model/account descriptors, permission/tool-policy snapshot refs, working-directory or worktree identity, prompt parts, and retry/approval context. Provider-specific projections such as `BRIDGE_INVOKE_OPTIONS` may encode a subset for launch, but they must remain derivable from `ProviderRequestEnvelope` and must not replace it as the ownership boundary.

The existing `working_directory` passthrough is sufficient for assistant worktree context: when the executor launches a CLI-bridged provider from a bound thread, `working_directory` is the worktree path and no provider-specific worktree field is required beyond the canonical runtime envelope.

When a thread has a worktree binding, MCP tools and CLI-bridged provider launches receive the frozen execution-context `working_directory`; tool invocations that use `cwd` run in that worktree path, and git-aware commands such as `git status` resolve git context from that cwd. No additional provider-specific worktree configuration is required.

Normalized output preservation (`normalized output preservation`) is mandatory for every bridge. CLI/server adapters must keep provider output, tool-call fragments, errors, truncation markers, ordering/repair evidence, usage/cost observations, and correlation ids in the normalized stream before UI, storage, or retry logic consumes them; adapters may redact secrets, but they must not collapse provider output into unstructured text or drop fields needed to replay, audit, or compare the request.

### Provider guard rails

Provider adapters MUST run bridge-side `/parsing/sanitization/payload-preflight` before admitting request envelopes, tool-call fragments, tool-event payloads, or provider stream events into the normalized event stream. The preflight validates schema shape, required identifiers, tool-call JSON, stream framing, usage/cost observations, and retry/correlation metadata; sanitization may redact secrets or unsafe control bytes, but it MUST NOT remove fields needed for replay, audit, permission review, usage attribution, or deterministic failure classification. Any adapter prose that over-summarizes normalization, parsing, sanitization, and payload preflight into generic "bridge handling" is non-canonical.

Because OpenAI, Anthropic, MiniMax, Gemini, and Bedrock can format tool calls differently across JSON shape, parallel-tool layout, provider call identifiers, finish metadata, schema subsets, or stream framing, provider adapters MUST preserve those provider/runtime facts through parsing, sanitization, and payload preflight before normalizing them into PM's canonical tool-call event stream.

For JSON, JSONL, and `/NDJSON` streams from LLM providers, including GLM-4.7, GLM-5, and Kimi, parser state is incremental and chunk-boundary aware. A bridge accumulates partial UTF-8 and line-delimited fragments until a complete JSON value is available; malformed or incomplete fragments become structured provider error events and never become fabricated tool calls, silently dropped history, or reserialized clean output.

Stream resilience is a facade-level floor, with provider-specific constants allowed only when they preserve the shared retry taxonomy. Reconnect/resume attempts are bounded to `max_retries=3` unless a stricter provider policy applies, use exponential backoff `1s -> 2s -> 4s` with `+/-25%` jitter, and open a circuit breaker after `5` consecutive transient stream failures within `2 minutes`; the breaker stays open for `30s`, then moves through half-open probe state before close/reopen. `Plans/Provider_OpenCode.md` (`/Provider_OpenCode.md`) records the OpenCode-specific streaming-resilience owner details, but those details must remain compatible with this facade floor.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Provider_OpenCode.md

### Bridged-provider capability projection

CLI-bridged and server-bridged providers are not exempt from the shared provider capability metadata surface in Plans/Models_System.md. When a bridged provider participates in multi-account routing, account switching, or pressure interpretation, the facade MUST project the canonical account-routing capability fields, including `supports_multi_account`, `account_identity_kind`, `quota_signal_sources`, `quota_signal_confidence`, `supports_threshold_switch`, `supports_hard_exhaustion_detection`, `supports_rate_limit_detection`, `supports_reset_countdown`, `supports_manual_set_active`, `supports_cooldown`, `supports_retry_budget`, `supports_role_scoped_account_pools`, signal sources/confidence, cooldown/retry-budget support, and reset countdown support.

If the bridge cannot observe a provider fact directly, it MUST mark the capability or signal as `unsupported`, `opaque`, `inferred`, or `stale` rather than copying direct-provider confidence. Bridge invoke options such as `account_id?`, `retry_policy?`, and `max_retries?` do not by themselves prove multi-account support; they only carry the selected request once the canonical resolver has accepted the provider capability snapshot.

Provider eligibility filtering runs before adapter selection. The facade removes providers that are not configured, including missing API key, missing URL, or other required connection fields; providers currently rate-limited from a known recent 429; and providers temporarily unavailable from a known recent 5xx. If the filter removes every candidate, the facade returns `no_eligible_adapter` instead of silently falling back to an unrelated provider.

Bridged-provider docs own adapter-facing capability, buffering, and role-mapping rules. The provider-facade must make adapter-facing role and capability projections explicit instead of leaving them implied by the ledger or by a provider CLI's native labels.

`Plans/CLI_Bridged_Providers.md` / `/CLI_Bridged_Providers.md` is the facade owner for canonical account identity, `switch-reason` disclosure, and `conversational-actor` routing through bridged providers. `Plans/Provider_Stream_Mapping_External_Reference_A2A.md` / `/Provider_Stream_Mapping_External_Reference_A2A.md` remains external-reference mapping only; before A2A introduces new actor/account/trust semantics, it must publish explicit `/migration` guidance and `/account/trust` versioning that the PM facade can project without moving PM orchestration identity into A2A.

Bridged providers are not exempt from the multi-account/switch capability surface expected of direct providers: `CLI_Bridged_Providers` and `CLI_Bridged_Providers.md` must declare bridged multi-account support, `/switch` behavior, switch attribution, and account-routing limits in parity with `Multi-Account.md`. Omission is not a declaration that bridged routing is unsupported.

For provider-facade `/auth/ingestion`, CLI/server bridges preserve credential precedence and proactive refresh-before-expiry behavior: explicit config wins over stored OAuth state unless the resolver records an override, `/expiry` evidence triggers refresh before a mid-session 401 stall, and credential refresh that changes the effective token/client requires client `/reconfigure` before reuse. Provider-specific cache markers, including cache-with-OAuth, cache-point, or cache-boundary annotations, remain positive adapter obligations when the provider requires them. `OC-PROV-009` keeps this as PROV evidence for Copilot and any bridge whose HTTP client caches auth state.

Gemini/VertexAI adapter initialization is fail-fast: a nil/error client init result MUST propagate immediately as a provider error and must not be stored behind a typed-interface value that later appears valid.

Bridged providers must map upstream termination metadata into PM's normalized event stream. A provider `finishReason=length` attached to an incomplete `tool_use` never becomes an `/execute` request; the bridge emits a closing `tool_result(ok=false, error=truncated_by_length)` event for downstream tool policy to record without synthesizing missing arguments.

Provider-adapter finish-reason canon includes `FinishReasonUnknown`, `FinishReasonContentFilter`, and `FinishReasonSafety`; `finishReason=length` on an incomplete tool call is a `/no-dispatch` path, while empty-choices, nil-client, JSON, and bounds guards fail as structured provider errors before tool dispatch.

Tool call identity for bridged providers is keyed by provider call IDs / UUIDs, never by `Name+Input` deduplication, so Gemini duplicate names or inputs do not collapse distinct tool calls.

Provider retry and schema handling (`OC-EXEC-113`, `OC-PROV-003`) are structured, not string-matched: per-provider and `/per-status` retry decisions use provider error codes/HTTP status and failure class instead of fragile substring matching, unknown errors default to not retrying, Gemini stream retries MUST restart the underlying connection/iterator from an OUTER retry loop rather than breaking only out of a select inside the iterator, empty choice arrays are checked before indexing, and adapter-emitted tool schemas include required fields.

Provider-facade ingestion owns adapter-facing `/schema` capability declarations for role surfaces. `system_role_name`, developer-role handling, and any provider-native role aliases must be declared as bridge capabilities and normalized before request construction; the bridge must not let a provider CLI's native label silently redefine PM roles.

Buffering and stream ingestion must preserve provider ordering semantics while making any adapter-facing `/reordering` explicit. If a bridge buffers, batches, retries, or resumes stream segments, the provider-facade records the ordering boundary and exposes whether downstream consumers are seeing original order, replay order, or a repaired order. Any wording that under-specifies this bridge scope is non-canonical.

Stream cancellation checks are fail-open only for live streams: adapter code must treat `ctx.Err() != nil` as cancellation, not invert the nil-check; cancellation emits `EventError` with the cancellation reason before the normalized stream closes.

Malformed tool-call JSON is validated when the bridge stores or admits the tool-call event, not during later re-serialization. `OC-EXEC-109` keeps this as EXEC evidence: a malformed provider tool-call may be persisted only as a structured error event and MUST NOT be silently dropped from history.

### CLI provider protocol and state surfaces

Gemini CLI account, `/session/config`, subagents, extensions, model routing, telemetry, and `OTLP` output are CLI-bridged provider surfaces rooted under the selected `GEMINI_CLI_HOME`. PM must provision and launch the account root through the account resolver, then surface requested/effective model-routing evidence instead of collapsing Gemini CLI state into the direct Gemini provider entry. Gemini CLI probe evidence may include `ACP`, headless prompt mode, JSON `/stream-json` output, policy loading, MCP, extensions, hooks, and native skill management; PM records those as provider-protocol capabilities instead of assuming they are available for every account or auth family.

`ACP` is tracked as provider-protocol capability metadata for CLI-bridged adapters. Cursor `ACP` support supersedes stale assumptions in `Plans/rewrite-tie-in-memo.md` that Cursor cannot expose ACP; PM still keeps provider ontology, account identity, and transport/runtime boundaries separate, so ACP support does not turn Cursor into a PM orchestration node and does not replace account-root isolation.

## Owner / Consumer Map

This source-preserving standardization keeps the owner and consumer boundaries stated in the original document body. During this batch, `Plans/CLI_Bridged_Providers.md` remains the owner doc for the behavior described by its preserved sections, while cross-doc ownership follows the ContractRefs and boundary notes already present in the original text.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md

## PlanUnits

### CBP-001 - CLI-Bridged Providers Source-Preserving Bridge Retired

```yaml
plan_unit_id: CBP-001
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/CLI_Bridged_Providers.md
canonical_text: >-
  The former doc-level source-preserving bridge is retired in place after Phase
  2B atomized CLI_Bridged_Providers-S0001 through
  CLI_Bridged_Providers-S0010 into CBP-002 through CBP-018. CBP-001 remains
  only as migration lineage for the retired bridge span and must not re-own
  atomized source coverage.
gui_related: false
gui_classification_reason: The retired bridge is migration lineage and no longer owns GUI or product behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- CBP-001 no longer uses the source-preserving PlanUnit compile hint.
- Prior source coverage remains carried by CBP-002 through CBP-018.
- The retired bridge does not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
- Coverage for the retired bridge is recorded in the Phase 2B batch 024 coverage map.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: migration_lineage
reasoning_tier: standard
context_scope: plan_standardization
implementation_surfaces:
- Plans/CLI_Bridged_Providers.md
node_compile_hint:
  mode: source_preserving_bridge_retired
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:CLI_Bridged_Providers-S0013
preserved_exact_tokens:
- CBP-001
- source_preserving_planunit
- CBP-002
- CBP-018
negative_constraints:
- "Do not remap atomized CLI_Bridged_Providers spans back to CBP-001."
- "Do not treat the retired bridge as implementation-ready product coverage."
- "Do not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks from this migration-lineage unit."
compatibility_only_notes:
- "The old source-preserving bridge is retained only so migration lineage and historical references to CBP-001 remain auditable."
owner_hints:
- Plans/CLI_Bridged_Providers.md
```

### CBP-002 - Provider Facade Authority and Account Identity Compliance

```yaml
plan_unit_id: CBP-002
unit_type: constraint
status: accepted
owner_doc: Plans/CLI_Bridged_Providers.md
canonical_text: >-
  CLI-Bridged Providers is the live owner-section specification for provider
  facade requirements, preserving product, runtime, storage, UI, and governance
  details while using canonical requested/effective account identity terminology.
gui_related: true
gui_classification_reason: The authority span explicitly includes UI details as part of owner-section requirements.
split_recommended: true
split_recommendation_reason: Source spans S0001-S0003 combine document authority, compliance, account identity heading, and compatibility vocabulary.
depends_on: []
unblocks: [CBP-003, CBP-005, CBP-011, CBP-013]
acceptance_criteria:
  - The document remains the canonical live owner-section specification for CLI-bridged provider facade behavior.
  - Compatibility-only source vocabulary remains noncanonical.
  - Live wording uses owner terminology.
  - Puppet Master naming and deterministic defaults are preserved.
  - DRY_Rules, Contracts_V0, and Decision_Policy compliance references remain preserved.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: owner_authority_drift
reasoning_tier: standard
context_scope: provider_facade
implementation_surfaces:
  - Plans/CLI_Bridged_Providers.md
node_compile_hint:
  mode: cli_bridged_provider_authority_account_identity
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:CLI_Bridged_Providers-S0001
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:CLI_Bridged_Providers-S0002
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:CLI_Bridged_Providers-S0003
preserved_exact_tokens:
  - "CLI-Bridged Providers (Provider Facade)"
  - "Canonical owner-section requirements"
  - "Requested/effective account identity contract"
  - "Compatibility-only source vocabulary"
  - "Puppet Master"
negative_constraints:
  - "Compatibility-only source vocabulary is noncanonical."
owner_hints:
  - Plans/CLI_Bridged_Providers.md
```

### CBP-003 - Provider Facade Purpose and Transport Scope

```yaml
plan_unit_id: CBP-003
unit_type: requirement
status: accepted
owner_doc: Plans/CLI_Bridged_Providers.md
canonical_text: >-
  The Provider facade runs CLI-bridged and server-bridged providers through a
  uniform transport-normalization contract for deterministic request envelopes,
  normalized streams, tool-call reconciliation, auth/UX-state detection, and
  stream resilience, without taking ownership of PM-internal child orchestration.
gui_related: true
gui_classification_reason: The facade owns normalized streaming with one consumer and no UI special-casing plus auth/UX-state detection.
split_recommended: true
split_recommendation_reason: Source span S0004 mixes provider transport scope, UX-state detection, stream resilience, and A2A owner boundaries.
depends_on: [CBP-002]
unblocks: [CBP-004, CBP-005, CBP-008, CBP-010]
acceptance_criteria:
  - The facade supports structured request envelopes for deterministic replayable runs.
  - Normalized streaming events have one consumer and no UI special-casing.
  - Tool-call correlation and reconciliation tolerate CLI oddities.
  - Auth/UX-state detection includes logged out, expired or invalid, rate limit, and outage.
  - Stream resilience includes bounded retry, replay safety, and circuit breaking.
  - PM-internal child orchestration, crew control, runtime ceilings, and parent/child lineage remain owned by orchestrator-subagent-integration and Contracts_V0.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: provider_facade_scope_drift
reasoning_tier: high
context_scope: provider_facade
implementation_surfaces:
  - Plans/CLI_Bridged_Providers.md
  - Plans/Executor_Protocol.md
  - Plans/Contracts_V0.md
  - Plans/orchestrator-subagent-integration.md
node_compile_hint:
  mode: cli_bridged_provider_facade_transport_scope
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:CLI_Bridged_Providers-S0004
preserved_exact_tokens:
  - "Structured request envelopes"
  - "Normalized streaming events"
  - "no UI special-casing"
  - "Authentication / UX-state detection"
  - "bounded retry"
  - "circuit breaking"
negative_constraints:
  - "Provider facade transport normalization does not own PM-internal child orchestration."
owner_hints:
  - Plans/CLI_Bridged_Providers.md
  - Plans/orchestrator-subagent-integration.md
```

### CBP-004 - A2A External Reference Boundary

```yaml
plan_unit_id: CBP-004
unit_type: constraint
status: accepted
owner_doc: Plans/CLI_Bridged_Providers.md
canonical_text: >-
  A2A and external-framework mapping remains external-reference and
  future-interop guidance for adapter implementors, with verify-only watchers
  preventing PM-internal orchestration or child-run control from moving onto A2A
  semantics without explicit migration and account/trust versioning.
gui_related: false
gui_classification_reason: A2A external-reference boundary is owner-governance and adapter guidance, not GUI behavior.
split_recommended: false
depends_on: [CBP-003]
unblocks: []
acceptance_criteria:
  - Provider_Stream_Mapping_External_Reference_A2A.md remains the canonical mapping SSOT for upstream external-framework and A2A bridge concepts.
  - A2A mapping is external-reference and future-interop guidance for adapter implementors.
  - A2A mapping is not approval to move PM-internal orchestration or child-run control onto A2A semantics.
  - A2A bridge packet verification keeps the document in the highest-risk verify-only omission lane unless intro and /non-goal framing remain external-reference and /future-interop only.
  - A2A must publish explicit /migration guidance and /account/trust versioning before introducing new actor/account/trust semantics.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: a2a_boundary_drift
reasoning_tier: high
context_scope: provider_facade_external_reference
implementation_surfaces:
  - Plans/CLI_Bridged_Providers.md
  - Plans/Provider_Stream_Mapping_External_Reference_A2A.md
  - Plans/orchestrator-subagent-integration.md
node_compile_hint:
  mode: cli_bridged_provider_a2a_external_reference_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:CLI_Bridged_Providers-S0004
preserved_exact_tokens:
  - "Provider_Stream_Mapping_External_Reference_A2A.md"
  - "/future-interop"
  - "/non-goal"
  - "MUST VERIFY"
  - "/account/trust"
  - "/migration"
negative_constraints:
  - "A2A MUST NOT be interpreted as approval to move PM-internal orchestration or child-run control onto A2A semantics."
owner_hints:
  - Plans/CLI_Bridged_Providers.md
  - Plans/Provider_Stream_Mapping_External_Reference_A2A.md
```

### CBP-005 - ProviderRequestEnvelope and Bridge Invoke Projection

```yaml
plan_unit_id: CBP-005
unit_type: requirement
status: accepted
owner_doc: Plans/CLI_Bridged_Providers.md
canonical_text: >-
  ProviderRequestEnvelope is the canonical provider-facade handoff record above
  provider-specific command-line or HTTP encodings, while BRIDGE_INVOKE_OPTIONS
  is a derivable projection for bridge launchers.
gui_related: false
gui_classification_reason: Request envelope and launch option projection are backend handoff contract semantics.
split_recommended: false
depends_on: [CBP-003]
unblocks: [CBP-006, CBP-007, CBP-011]
acceptance_criteria:
  - BRIDGE_INVOKE_OPTIONS preserves persona, model, model_variant?, provider_override?, run_mode, trace_level, account_id?, dag_input?, execution_role, shell_env?, worktree_id?, approve_mode?, approval_id?, mutation_policy, timeout_ms?, retry_policy?, and max_retries?.
  - ProviderRequestEnvelope is the canonical provider-facade handoff record above command-line or HTTP encodings.
  - ProviderRequestEnvelope includes run/thread/parent/child lineage, attempt identity when present, execution role, requested/effective runtime/provider/model/account descriptors, permission/tool-policy snapshot refs, working-directory or worktree identity, prompt parts, and retry/approval context.
  - Provider-specific projections remain derivable from ProviderRequestEnvelope.
  - Provider-specific projections do not replace ProviderRequestEnvelope as the ownership boundary.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: provider_envelope_projection_drift
reasoning_tier: high
context_scope: provider_request_envelope
implementation_surfaces:
  - Plans/CLI_Bridged_Providers.md
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
node_compile_hint:
  mode: cli_bridged_provider_request_envelope_projection
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:CLI_Bridged_Providers-S0005
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:CLI_Bridged_Providers-S0006
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:CLI_Bridged_Providers-S0007
preserved_exact_tokens:
  - "BRIDGE_INVOKE_OPTIONS"
  - "ProviderRequestEnvelope"
  - "provider_override?"
  - "execution_role"
  - "worktree_id?"
  - "max_retries?"
negative_constraints:
  - "Provider-specific projections must remain derivable from ProviderRequestEnvelope and must not replace it as the ownership boundary."
owner_hints:
  - Plans/CLI_Bridged_Providers.md
```

### CBP-006 - Worktree Execution Context Passthrough

```yaml
plan_unit_id: CBP-006
unit_type: requirement
status: accepted
owner_doc: Plans/CLI_Bridged_Providers.md
canonical_text: >-
  CLI-bridged provider launches and MCP tool invocations use the frozen
  execution-context working_directory as the worktree path, with cwd resolving
  git-aware commands and no extra provider-specific worktree configuration.
gui_related: false
gui_classification_reason: Worktree execution-context passthrough is runtime launch behavior.
split_recommended: false
depends_on: [CBP-005]
unblocks: []
acceptance_criteria:
  - working_directory is sufficient for assistant worktree context.
  - For bound threads, working_directory is the worktree path.
  - MCP tools and CLI-bridged launches receive the frozen execution-context working_directory.
  - Tool invocations using cwd run in that worktree path.
  - git status resolves git context from cwd.
  - No additional provider-specific worktree configuration is required.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: worktree_context_drift
reasoning_tier: standard
context_scope: provider_request_envelope
implementation_surfaces:
  - Plans/CLI_Bridged_Providers.md
node_compile_hint:
  mode: cli_bridged_provider_worktree_execution_context
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:CLI_Bridged_Providers-S0007
preserved_exact_tokens:
  - "working_directory"
  - "cwd"
  - "git status"
  - "worktree path"
negative_constraints:
  - "No additional provider-specific worktree configuration is required."
owner_hints:
  - Plans/CLI_Bridged_Providers.md
```

### CBP-007 - Normalized Output Preservation

```yaml
plan_unit_id: CBP-007
unit_type: constraint
status: accepted
owner_doc: Plans/CLI_Bridged_Providers.md
canonical_text: >-
  Every bridge preserves provider output, tool-call fragments, errors,
  truncation markers, ordering/repair evidence, usage/cost observations, and
  correlation IDs in the normalized stream before UI, storage, or retry logic
  consumes them.
gui_related: true
gui_classification_reason: Normalized stream preservation is explicitly before UI consumption and prevents UI special-casing or field loss.
split_recommended: true
split_recommendation_reason: Source span S0007 mixes backend normalized stream persistence with UI/storage/retry consumers.
depends_on: [CBP-005]
unblocks: [CBP-008, CBP-009, CBP-016]
acceptance_criteria:
  - CLI and server adapters keep provider output in the normalized stream.
  - Tool-call fragments, errors, truncation markers, ordering/repair evidence, usage/cost observations, and correlation IDs are preserved.
  - Secret redaction may occur.
  - Adapters do not collapse provider output into unstructured text.
  - Adapters do not drop fields needed to replay, audit, or compare the request.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: normalized_output_loss
reasoning_tier: high
context_scope: normalized_provider_stream
implementation_surfaces:
  - Plans/CLI_Bridged_Providers.md
node_compile_hint:
  mode: cli_bridged_provider_normalized_output_preservation
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:CLI_Bridged_Providers-S0007
preserved_exact_tokens:
  - "normalized output preservation"
  - "tool-call fragments"
  - "truncation markers"
  - "ordering/repair evidence"
  - "usage/cost observations"
  - "correlation ids"
negative_constraints:
  - "Adapters must not collapse provider output into unstructured text or drop fields needed to replay, audit, or compare the request."
owner_hints:
  - Plans/CLI_Bridged_Providers.md
```

### CBP-008 - Bridge Parsing Sanitization Payload Preflight

```yaml
plan_unit_id: CBP-008
unit_type: constraint
status: accepted
owner_doc: Plans/CLI_Bridged_Providers.md
canonical_text: >-
  Provider adapters run bridge-side parsing, sanitization, and payload preflight
  before admitting request envelopes, tool payloads, fragments, or stream events
  into the normalized event stream, without removing replay, audit, permission,
  usage, or deterministic failure fields.
gui_related: false
gui_classification_reason: Parsing, sanitization, and payload preflight are adapter validation behavior.
split_recommended: false
depends_on: [CBP-007]
unblocks: [CBP-009, CBP-016]
acceptance_criteria:
  - Preflight validates schema shape, required identifiers, tool-call JSON, stream framing, usage/cost observations, and retry/correlation metadata.
  - Sanitization may redact secrets or unsafe control bytes.
  - Sanitization does not remove fields needed for replay, audit, permission review, usage attribution, or deterministic failure classification.
  - Adapter prose does not over-summarize normalization, parsing, sanitization, and payload preflight as generic bridge handling.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: payload_preflight_drift
reasoning_tier: high
context_scope: normalized_provider_stream
implementation_surfaces:
  - Plans/CLI_Bridged_Providers.md
  - Plans/Executor_Protocol.md
  - Plans/Contracts_V0.md
  - Plans/Provider_OpenCode.md
node_compile_hint:
  mode: cli_bridged_provider_parsing_sanitization_preflight
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:CLI_Bridged_Providers-S0008
preserved_exact_tokens:
  - "/parsing/sanitization/payload-preflight"
  - "replay"
  - "permission review"
  - "usage attribution"
  - "deterministic failure classification"
negative_constraints:
  - "Generic bridge handling prose is non-canonical."
owner_hints:
  - Plans/CLI_Bridged_Providers.md
```

### CBP-009 - Provider Format and Incremental Parser Preservation

```yaml
plan_unit_id: CBP-009
unit_type: constraint
status: accepted
owner_doc: Plans/CLI_Bridged_Providers.md
canonical_text: >-
  Provider/runtime tool-call and stream-format facts are preserved through
  parsing, sanitization, and payload preflight, while JSON, JSONL, and NDJSON
  parsing remains incremental and chunk-boundary aware.
gui_related: false
gui_classification_reason: Provider format and parser preservation are adapter-level stream semantics.
split_recommended: false
depends_on: [CBP-008]
unblocks: [CBP-016]
acceptance_criteria:
  - Provider facts from OpenAI, Anthropic, MiniMax, Gemini, and Bedrock are preserved across tool-call JSON shape, parallel-tool layout, provider call identifiers, finish metadata, schema subsets, and stream framing.
  - JSON, JSONL, and /NDJSON streams from providers including GLM-4.7, GLM-5, and Kimi use incremental chunk-boundary-aware parser state.
  - Bridges accumulate partial UTF-8 and line-delimited fragments until a complete JSON value is available.
  - Malformed or incomplete fragments become structured provider error events.
  - Malformed or incomplete fragments do not become fabricated tool calls, silently dropped history, or reserialized clean output.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: provider_format_parser_drift
reasoning_tier: high
context_scope: normalized_provider_stream
implementation_surfaces:
  - Plans/CLI_Bridged_Providers.md
node_compile_hint:
  mode: cli_bridged_provider_format_incremental_parser
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:CLI_Bridged_Providers-S0008
preserved_exact_tokens:
  - "OpenAI"
  - "Anthropic"
  - "MiniMax"
  - "Gemini"
  - "Bedrock"
  - "JSONL"
  - "/NDJSON"
  - "GLM-4.7"
  - "Kimi"
negative_constraints:
  - "Malformed or incomplete fragments never become fabricated tool calls, silently dropped history, or reserialized clean output."
owner_hints:
  - Plans/CLI_Bridged_Providers.md
```

### CBP-010 - Shared Stream Resilience Floor

```yaml
plan_unit_id: CBP-010
unit_type: constraint
status: accepted
owner_doc: Plans/CLI_Bridged_Providers.md
canonical_text: >-
  Stream resilience is a facade-level floor with bounded retry, exponential
  backoff and jitter, circuit breaking, half-open probing, and provider-specific
  constants only when compatible with the shared retry taxonomy.
gui_related: false
gui_classification_reason: Stream resilience is provider adapter runtime behavior.
split_recommended: false
depends_on: [CBP-003]
unblocks: [CBP-015]
acceptance_criteria:
  - Reconnect/resume attempts are bounded to max_retries=3 unless stricter provider policy applies.
  - Retry uses exponential backoff 1s -> 2s -> 4s with +/-25% jitter.
  - Circuit breaker opens after 5 consecutive transient stream failures within 2 minutes.
  - Breaker stays open for 30s and then moves through half-open probe state before close/reopen.
  - Provider_OpenCode.md streaming-resilience owner details remain compatible with this facade floor.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: stream_resilience_drift
reasoning_tier: high
context_scope: normalized_provider_stream
implementation_surfaces:
  - Plans/CLI_Bridged_Providers.md
  - Plans/Provider_OpenCode.md
node_compile_hint:
  mode: cli_bridged_provider_shared_stream_resilience_floor
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:CLI_Bridged_Providers-S0008
preserved_exact_tokens:
  - "max_retries=3"
  - "1s -> 2s -> 4s"
  - "+/-25%"
  - "5"
  - "2 minutes"
  - "30s"
negative_constraints: []
owner_hints:
  - Plans/CLI_Bridged_Providers.md
  - Plans/Provider_OpenCode.md
```

### CBP-011 - Bridged Capability Projection and Unknown Fact States

```yaml
plan_unit_id: CBP-011
unit_type: requirement
status: accepted
owner_doc: Plans/CLI_Bridged_Providers.md
canonical_text: >-
  CLI-bridged and server-bridged providers project the shared provider
  capability metadata surface, including multi-account routing and pressure
  interpretation fields, and mark unobservable facts as unsupported, opaque,
  inferred, or stale rather than copying direct-provider confidence.
gui_related: false
gui_classification_reason: Capability projection and confidence states are provider metadata semantics.
split_recommended: false
depends_on: [CBP-005]
unblocks: [CBP-012, CBP-013]
acceptance_criteria:
  - Bridged providers project supports_multi_account, account_identity_kind, quota_signal_sources, quota_signal_confidence, supports_threshold_switch, supports_hard_exhaustion_detection, supports_rate_limit_detection, supports_reset_countdown, supports_manual_set_active, supports_cooldown, supports_retry_budget, supports_role_scoped_account_pools, and reset countdown support.
  - Unobservable provider facts are marked unsupported, opaque, inferred, or stale.
  - Bridge invoke options such as account_id?, retry_policy?, and max_retries? do not prove multi-account support by themselves.
  - Canonical resolver must accept the provider capability snapshot before selected request fields are carried.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: bridged_capability_projection_drift
reasoning_tier: high
context_scope: provider_capabilities
implementation_surfaces:
  - Plans/CLI_Bridged_Providers.md
  - Plans/Models_System.md
node_compile_hint:
  mode: cli_bridged_provider_capability_projection_unknown_states
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:CLI_Bridged_Providers-S0009
preserved_exact_tokens:
  - "supports_multi_account"
  - "account_identity_kind"
  - "quota_signal_sources"
  - "supports_hard_exhaustion_detection"
  - "unsupported"
  - "opaque"
  - "inferred"
  - "stale"
negative_constraints:
  - "Bridge invoke options do not by themselves prove multi-account support."
owner_hints:
  - Plans/CLI_Bridged_Providers.md
  - Plans/Models_System.md
```

### CBP-012 - Provider Eligibility Filtering and No Silent Fallback

```yaml
plan_unit_id: CBP-012
unit_type: constraint
status: accepted
owner_doc: Plans/CLI_Bridged_Providers.md
canonical_text: >-
  Provider eligibility filtering removes unconfigured, recently rate-limited, or
  temporarily unavailable providers before adapter selection and returns
  no_eligible_adapter when no candidate remains.
gui_related: false
gui_classification_reason: Eligibility filtering is backend provider selection behavior.
split_recommended: false
depends_on: [CBP-011]
unblocks: []
acceptance_criteria:
  - Filtering removes providers missing API key, missing URL, or other required connection fields.
  - Filtering removes providers currently rate-limited from a known recent 429.
  - Filtering removes providers temporarily unavailable from a known recent 5xx.
  - If filtering removes every candidate, the facade returns no_eligible_adapter.
  - The facade does not silently fall back to an unrelated provider.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: provider_eligibility_fallback_drift
reasoning_tier: high
context_scope: provider_capabilities
implementation_surfaces:
  - Plans/CLI_Bridged_Providers.md
node_compile_hint:
  mode: cli_bridged_provider_eligibility_filtering
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:CLI_Bridged_Providers-S0009
preserved_exact_tokens:
  - "missing API key"
  - "missing URL"
  - "429"
  - "5xx"
  - "no_eligible_adapter"
negative_constraints:
  - "Do not silently fall back to an unrelated provider."
owner_hints:
  - Plans/CLI_Bridged_Providers.md
```

### CBP-013 - Account Identity Switch Attribution and A2A Trust Boundary

```yaml
plan_unit_id: CBP-013
unit_type: requirement
status: accepted
owner_doc: Plans/CLI_Bridged_Providers.md
canonical_text: >-
  CLI_Bridged_Providers owns bridged-provider canonical account identity,
  switch-reason disclosure, conversational-actor routing, multi-account support
  declarations, switch attribution, account-routing limits, and the boundary
  that A2A account/trust migration must not move PM orchestration identity.
gui_related: true
gui_classification_reason: switch-reason disclosure and conversational-actor routing have user-visible/account routing implications.
split_recommended: true
split_recommendation_reason: Source span S0009 mixes backend capability projection with user-visible switch/account routing and A2A migration boundaries.
depends_on: [CBP-011]
unblocks: [CBP-014]
acceptance_criteria:
  - CLI_Bridged_Providers.md is the facade owner for canonical account identity.
  - The facade owns switch-reason disclosure and conversational-actor routing through bridged providers.
  - Bridged providers declare bridged multi-account support, /switch behavior, switch attribution, and account-routing limits in parity with Multi-Account.md.
  - Omission is not a declaration that bridged routing is unsupported.
  - Provider_Stream_Mapping_External_Reference_A2A.md remains external-reference mapping only.
  - A2A must publish /migration guidance and /account/trust versioning before PM projects new actor/account/trust semantics.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: bridged_account_identity_drift
reasoning_tier: high
context_scope: provider_capabilities
implementation_surfaces:
  - Plans/CLI_Bridged_Providers.md
  - Plans/Multi-Account.md
  - Plans/Provider_Stream_Mapping_External_Reference_A2A.md
node_compile_hint:
  mode: cli_bridged_provider_account_identity_switch_attribution
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:CLI_Bridged_Providers-S0009
preserved_exact_tokens:
  - "switch-reason"
  - "conversational-actor"
  - "/switch"
  - "Multi-Account.md"
  - "/account/trust"
negative_constraints:
  - "Omission is not a declaration that bridged routing is unsupported."
owner_hints:
  - Plans/CLI_Bridged_Providers.md
  - Plans/Multi-Account.md
```

### CBP-014 - Auth Ingestion Refresh Reconfigure and Nil Client Guards

```yaml
plan_unit_id: CBP-014
unit_type: constraint
status: accepted
owner_doc: Plans/CLI_Bridged_Providers.md
canonical_text: >-
  Provider-facade auth ingestion preserves credential precedence,
  refresh-before-expiry, client reconfigure after token/client change,
  provider cache obligations, and Gemini/VertexAI fail-fast nil/error client
  initialization.
gui_related: false
gui_classification_reason: Auth ingestion and client initialization are adapter/runtime guard behavior.
split_recommended: false
depends_on: [CBP-013]
unblocks: [CBP-017]
acceptance_criteria:
  - Explicit config wins over stored OAuth state unless the resolver records an override.
  - /expiry evidence triggers refresh before a mid-session 401 stall.
  - Credential refresh changing effective token/client requires client /reconfigure before reuse.
  - Provider-specific cache markers including cache-with-OAuth, cache-point, or cache-boundary remain positive adapter obligations when required.
  - OC-PROV-009 remains PROV evidence for Copilot and bridges whose HTTP client caches auth state.
  - Gemini/VertexAI nil/error client init result propagates immediately as provider error and is not stored behind a typed-interface value that later appears valid.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: auth_ingestion_client_guard_drift
reasoning_tier: high
context_scope: provider_auth_ingestion
implementation_surfaces:
  - Plans/CLI_Bridged_Providers.md
node_compile_hint:
  mode: cli_bridged_provider_auth_ingestion_reconfigure_nil_client
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:CLI_Bridged_Providers-S0009
preserved_exact_tokens:
  - "/auth/ingestion"
  - "/expiry"
  - "/reconfigure"
  - "cache-with-OAuth"
  - "OC-PROV-009"
  - "Gemini/VertexAI"
negative_constraints:
  - "A nil/error client init result must not be stored behind a typed-interface value that later appears valid."
owner_hints:
  - Plans/CLI_Bridged_Providers.md
```

### CBP-015 - Finish Reason Tool Identity Retry and Schema Guards

```yaml
plan_unit_id: CBP-015
unit_type: constraint
status: accepted
owner_doc: Plans/CLI_Bridged_Providers.md
canonical_text: >-
  Bridged providers map termination metadata, finish reasons, tool-call
  identity, retry decisions, and emitted schemas into structured canonical
  behavior without dispatching truncated tool calls or collapsing duplicate tool
  calls by name/input.
gui_related: false
gui_classification_reason: Finish reason, tool identity, retry, and schema guards are adapter execution semantics.
split_recommended: false
depends_on: [CBP-010]
unblocks: [CBP-016]
acceptance_criteria:
  - finishReason=length attached to incomplete tool_use never becomes an /execute request.
  - The bridge emits tool_result(ok=false, error=truncated_by_length) for downstream tool policy.
  - FinishReasonUnknown, FinishReasonContentFilter, and FinishReasonSafety remain canonical finish reasons.
  - Tool call identity is keyed by provider call IDs / UUIDs and never by Name+Input deduplication.
  - Retry decisions use provider error codes/HTTP status and failure class instead of fragile substring matching.
  - Unknown errors default to not retrying.
  - Gemini stream retries restart the underlying connection/iterator from an OUTER retry loop.
  - Empty choice arrays are checked before indexing and adapter-emitted tool schemas include required fields.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: finish_reason_tool_identity_retry_drift
reasoning_tier: high
context_scope: provider_tool_calls
implementation_surfaces:
  - Plans/CLI_Bridged_Providers.md
node_compile_hint:
  mode: cli_bridged_provider_finish_reason_tool_identity_retry_schema
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:CLI_Bridged_Providers-S0009
preserved_exact_tokens:
  - "finishReason=length"
  - "/no-dispatch"
  - "FinishReasonUnknown"
  - "FinishReasonContentFilter"
  - "FinishReasonSafety"
  - "Name+Input"
  - "OC-EXEC-113"
  - "OC-PROV-003"
negative_constraints:
  - "Tool call identity is keyed by provider call IDs / UUIDs, never by Name+Input deduplication."
owner_hints:
  - Plans/CLI_Bridged_Providers.md
```

### CBP-016 - Role Schema Ordering Cancellation and Malformed Tool Storage

```yaml
plan_unit_id: CBP-016
unit_type: constraint
status: accepted
owner_doc: Plans/CLI_Bridged_Providers.md
canonical_text: >-
  Provider-facade ingestion declares adapter-facing role schema capabilities,
  records ordering/reordering boundaries, treats context errors as cancellation,
  and persists malformed tool-call JSON only as structured error events.
gui_related: false
gui_classification_reason: Role schema, ordering, cancellation, and malformed tool-call storage are adapter/event semantics.
split_recommended: false
depends_on: [CBP-008, CBP-009, CBP-015]
unblocks: []
acceptance_criteria:
  - system_role_name, developer-role handling, and provider-native role aliases are declared as bridge capabilities and normalized before request construction.
  - Provider CLI native labels do not silently redefine PM roles.
  - Buffering/retry/resume records whether downstream consumers see original order, replay order, or repaired order.
  - Stream cancellation treats ctx.Err() != nil as cancellation and emits EventError with the cancellation reason before close.
  - Malformed tool-call JSON is validated when stored or admitted, not during later re-serialization.
  - Malformed provider tool calls may persist only as structured error events and must not be silently dropped from history.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: role_ordering_cancellation_tool_storage_drift
reasoning_tier: high
context_scope: provider_tool_calls
implementation_surfaces:
  - Plans/CLI_Bridged_Providers.md
node_compile_hint:
  mode: cli_bridged_provider_role_ordering_cancellation_malformed_tool_storage
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:CLI_Bridged_Providers-S0009
preserved_exact_tokens:
  - "/schema"
  - "system_role_name"
  - "/reordering"
  - "ctx.Err() != nil"
  - "EventError"
  - "OC-EXEC-109"
negative_constraints:
  - "A provider CLI's native label must not silently redefine PM roles."
  - "Malformed tool-call JSON MUST NOT be silently dropped from history."
owner_hints:
  - Plans/CLI_Bridged_Providers.md
```

### CBP-017 - Gemini CLI Account Root and Provider Protocol Capabilities

```yaml
plan_unit_id: CBP-017
unit_type: requirement
status: accepted
owner_doc: Plans/CLI_Bridged_Providers.md
canonical_text: >-
  Gemini CLI account, session config, subagents, extensions, model routing,
  telemetry, OTLP, and protocol probes are rooted under selected GEMINI_CLI_HOME
  and surfaced as provider-protocol capability metadata through the account
  resolver.
gui_related: false
gui_classification_reason: CLI account roots and provider-protocol capabilities are adapter/runtime metadata.
split_recommended: false
depends_on: [CBP-014]
unblocks: [CBP-018]
acceptance_criteria:
  - Gemini CLI account, /session/config, subagents, extensions, model routing, telemetry, and OTLP output are rooted under selected GEMINI_CLI_HOME.
  - PM provisions and launches the account root through the account resolver.
  - PM surfaces requested/effective model-routing evidence.
  - Gemini CLI state is not collapsed into the direct Gemini provider entry.
  - Probe evidence may include ACP, headless prompt mode, JSON /stream-json output, policy loading, MCP, extensions, hooks, and native skill management.
  - PM records probe evidence as provider-protocol capabilities rather than assuming availability for every account or auth family.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: gemini_cli_protocol_capability_drift
reasoning_tier: high
context_scope: cli_provider_protocol
implementation_surfaces:
  - Plans/CLI_Bridged_Providers.md
node_compile_hint:
  mode: cli_bridged_provider_gemini_cli_account_protocol_capabilities
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:CLI_Bridged_Providers-S0010
preserved_exact_tokens:
  - "GEMINI_CLI_HOME"
  - "/session/config"
  - "OTLP"
  - "ACP"
  - "JSON `/stream-json`"
  - "MCP"
negative_constraints:
  - "Gemini CLI state must not collapse into the direct Gemini provider entry."
owner_hints:
  - Plans/CLI_Bridged_Providers.md
```

### CBP-018 - ACP Cursor Stale-Assumption Retirement

```yaml
plan_unit_id: CBP-018
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/CLI_Bridged_Providers.md
canonical_text: >-
  ACP is provider-protocol capability metadata for CLI-bridged adapters, and
  Cursor ACP support retires stale assumptions that Cursor cannot expose ACP
  while preserving provider ontology, account identity, transport/runtime
  boundaries, and account-root isolation.
gui_related: false
gui_classification_reason: ACP stale-assumption retirement is provider ontology and capability metadata, not GUI behavior.
split_recommended: false
depends_on: [CBP-017]
unblocks: []
acceptance_criteria:
  - ACP is tracked as provider-protocol capability metadata for CLI-bridged adapters.
  - Cursor ACP support supersedes stale assumptions in rewrite-tie-in-memo that Cursor cannot expose ACP.
  - Provider ontology, account identity, and transport/runtime boundaries remain separate.
  - ACP support does not turn Cursor into a PM orchestration node.
  - ACP support does not replace account-root isolation.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: acp_stale_assumption_drift
reasoning_tier: standard
context_scope: cli_provider_protocol
implementation_surfaces:
  - Plans/CLI_Bridged_Providers.md
  - Plans/rewrite-tie-in-memo.md
node_compile_hint:
  mode: cli_bridged_provider_acp_cursor_stale_assumption_retirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:CLI_Bridged_Providers-S0010
preserved_exact_tokens:
  - "ACP"
  - "Cursor `ACP` support"
  - "Plans/rewrite-tie-in-memo.md"
  - "account-root isolation"
negative_constraints:
  - "ACP support does not turn Cursor into a PM orchestration node and does not replace account-root isolation."
owner_hints:
  - Plans/CLI_Bridged_Providers.md
  - Plans/rewrite-tie-in-memo.md
```

## Migration Coverage

Original hash: `3b2f3908a287cb355fa85b17c3a6f5d7af31cba872c6756f89f14db4cf1ea9b7`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/anchor_aliases.json`

Phase 2B atomized `CLI_Bridged_Providers-S0001` through `CLI_Bridged_Providers-S0010` into fine-grained PlanUnits `CBP-002` through `CBP-018`. `CBP-001` is retained only as a retired migration-lineage bridge and must not re-own atomized source coverage. This phase did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, or executable build tasks.
