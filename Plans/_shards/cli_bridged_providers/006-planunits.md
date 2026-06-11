# Shard 006: PlanUnits

Source: `Plans/CLI_Bridged_Providers.md`

Source lines: L137-L233

Source SHA256: `e14f83cf3e0a04701bacf7c329142f6b7c915c8447274f81e326a5789ca88d36`

---

## PlanUnits

### CBP-001 - CLI-Bridged Providers (Provider Facade) Source-Preserving PlanUnit

```yaml
plan_unit_id: CBP-001
unit_type: requirement
status: accepted
owner_doc: Plans/CLI_Bridged_Providers.md
canonical_text: Plans/CLI_Bridged_Providers.md keeps its pre-migration canonical source content losslessly in place while exposing a source-preserving PlanUnit for Plan Document System indexing. Fine-grained requirement splitting may occur in a later controlled batch using the recorded span_map and coverage_map.
gui_related: true
gui_classification_reason: The preserved source spans include GUI/UI/user-visible presentation or interactive control requirements.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- Original source spans remain available for exact-text audit.
- Every original span for this doc has one coverage_map disposition.
- ContractRefs, anchors or aliases, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage are preserved by span_map and coverage_map.
- No WorkNodes, NodeSeeds, or executable build tasks are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-001-standardize-plans
- python3 scripts/pm-plans-verify.py run-gates
- python3 scripts/pm-shard-plans.py --check
risk_class: source_preservation
reasoning_tier: standard
context_scope: single_plan_doc
implementation_surfaces:
- Plans/CLI_Bridged_Providers.md
node_compile_hint:
  mode: source_preserving_planunit
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:CLI_Bridged_Providers-S0001
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:CLI_Bridged_Providers-S0002
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:CLI_Bridged_Providers-S0003
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:CLI_Bridged_Providers-S0004
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:CLI_Bridged_Providers-S0005
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:CLI_Bridged_Providers-S0006
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:CLI_Bridged_Providers-S0007
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:CLI_Bridged_Providers-S0008
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:CLI_Bridged_Providers-S0009
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:CLI_Bridged_Providers-S0010
preserved_exact_tokens:
- CLI-Bridged Providers (Provider Facade)
- Canonical owner-section requirements
- Requested/effective account identity contract
- Purpose
- 'ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md'
- 'ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Contracts_V0.md'
- 'ContractRef: ContractName:Plans/Provider_Stream_Mapping_External_Reference_A2A.md, ContractName:Plans/orchestrator-subagent-integration.md'
- Canonical data-shape reconciliation
- Required data shape
- Contract shape (facade)
- 'ContractRef: Primitive:Provider, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md'
- Provider guard rails
- 'ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Provider_OpenCode.md'
- Bridged-provider capability projection
- CLI provider protocol and state surfaces
negative_constraints:
- Canonical mapping SSOT for upstream external-framework and A2A bridge concepts is `Plans/Provider_Stream_Mapping_External_Reference_A2A.md`. That document is external-reference and future-interop guidance for adapter implementors. It MUST NOT be interpreted as approval to move PM-internal orchestrat
- '`ProviderRequestEnvelope` is the canonical provider-facade handoff record above provider-specific command-line or HTTP encodings. The expanded identity bundle in `ProviderRequestEnvelope` MUST include run/thread/parent/child lineage, attempt identity when present, execution role, requested/effective'
- 'Normalized output preservation (`normalized output preservation`) is mandatory for every bridge. CLI/server adapters must keep provider output, tool-call fragments, errors, truncation markers, ordering/repair evidence, usage/cost observations, and correlation ids in the normalized stream before UI, '
- Provider adapters MUST run bridge-side `/parsing/sanitization/payload-preflight` before admitting request envelopes, tool-call fragments, tool-event payloads, or provider stream events into the normalized event stream. The preflight validates schema shape, required identifiers, tool-call JSON, strea
- 'Gemini/VertexAI adapter initialization is fail-fast: a nil/error client init result MUST propagate immediately as a provider error and must not be stored behind a typed-interface value that later appears valid.'
- 'Provider-facade ingestion owns adapter-facing `/schema` capability declarations for role surfaces. `system_role_name`, developer-role handling, and any provider-native role aliases must be declared as bridge capabilities and normalized before request construction; the bridge must not let a provider '
- 'Malformed tool-call JSON is validated when the bridge stores or admits the tool-call event, not during later re-serialization. `OC-EXEC-109` keeps this as EXEC evidence: a malformed provider tool-call may be persisted only as a structured error event and MUST NOT be silently dropped from history.'
compatibility_only_notes:
- '- Compatibility-only source vocabulary is noncanonical; live wording uses the owner terminology below.'
stale_retired_dispositions:
- 'If the bridge cannot observe a provider fact directly, it MUST mark the capability or signal as `unsupported`, `opaque`, `inferred`, or `stale` rather than copying direct-provider confidence. Bridge invoke options such as `account_id?`, `retry_policy?`, and `max_retries?` do not by themselves prove '
- '`ACP` is tracked as provider-protocol capability metadata for CLI-bridged adapters. Cursor `ACP` support supersedes stale assumptions in `Plans/rewrite-tie-in-memo.md` that Cursor cannot expose ACP; PM still keeps provider ontology, account identity, and transport/runtime boundaries separate, so ACP'
owner_boundary_notes:
- '## Canonical owner-section requirements'
- These requirements are canonical live specification text for this owner document and preserve the required product, runtime, storage, UI, and governance details in owner-section form.
- '- Compatibility-only source vocabulary is noncanonical; live wording uses the owner terminology below.'
- '> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.'
- '- **Normalized streaming events** (one consumer; no UI special-casing)'
- Canonical mapping SSOT for upstream external-framework and A2A bridge concepts is `Plans/Provider_Stream_Mapping_External_Reference_A2A.md`. That document is external-reference and future-interop guidance for adapter implementors. It MUST NOT be interpreted as approval to move PM-internal orchestrat
- 'A2A seam warning: A2A bridge packet verification keeps `Plans/Provider_Stream_Mapping_External_Reference_A2A.md` in the highest-risk verify-only omission lane unless its intro and `/non-goal` framing still read as external-reference and `/future-interop` only; otherwise, it must be promoted out of `'
- '## Canonical data-shape reconciliation'
- '`ProviderRequestEnvelope` is the canonical provider-facade handoff record above provider-specific command-line or HTTP encodings. The expanded identity bundle in `ProviderRequestEnvelope` MUST include run/thread/parent/child lineage, attempt identity when present, execution role, requested/effective'
- 'The existing `working_directory` passthrough is sufficient for assistant worktree context: when the executor launches a CLI-bridged provider from a bound thread, `working_directory` is the worktree path and no provider-specific worktree field is required beyond the canonical runtime envelope.'
- Provider adapters MUST run bridge-side `/parsing/sanitization/payload-preflight` before admitting request envelopes, tool-call fragments, tool-event payloads, or provider stream events into the normalized event stream. The preflight validates schema shape, required identifiers, tool-call JSON, strea
- Because OpenAI, Anthropic, MiniMax, Gemini, and Bedrock can format tool calls differently across JSON shape, parallel-tool layout, provider call identifiers, finish metadata, schema subsets, or stream framing, provider adapters MUST preserve those provider/runtime facts through parsing, sanitization
- For JSON, JSONL, and `/NDJSON` streams from LLM providers, including GLM-4.7, GLM-5, and Kimi, parser state is incremental and chunk-boundary aware. A bridge accumulates partial UTF-8 and line-delimited fragments until a complete JSON value is available; malformed or incomplete fragments become stru
- Stream resilience is a facade-level floor, with provider-specific constants allowed only when they preserve the shared retry taxonomy. Reconnect/resume attempts are bounded to `max_retries=3` unless a stricter provider policy applies, use exponential backoff `1s -> 2s -> 4s` with `+/-25%` jitter, an
- 'CLI-bridged and server-bridged providers are not exempt from the shared provider capability metadata surface in Plans/Models_System.md. When a bridged provider participates in multi-account routing, account switching, or pressure interpretation, the facade MUST project the canonical account-routing '
- 'If the bridge cannot observe a provider fact directly, it MUST mark the capability or signal as `unsupported`, `opaque`, `inferred`, or `stale` rather than copying direct-provider confidence. Bridge invoke options such as `account_id?`, `retry_policy?`, and `max_retries?` do not by themselves prove '
- '`Plans/CLI_Bridged_Providers.md` / `/CLI_Bridged_Providers.md` is the facade owner for canonical account identity, `switch-reason` disclosure, and `conversational-actor` routing through bridged providers. `Plans/Provider_Stream_Mapping_External_Reference_A2A.md` / `/Provider_Stream_Mapping_External_'
- 'For provider-facade `/auth/ingestion`, CLI/server bridges preserve credential precedence and proactive refresh-before-expiry behavior: explicit config wins over stored OAuth state unless the resolver records an override, `/expiry` evidence triggers refresh before a mid-session 401 stall, and credent'
- Buffering and stream ingestion must preserve provider ordering semantics while making any adapter-facing `/reordering` explicit. If a bridge buffers, batches, retries, or resumes stream segments, the provider-facade records the ordering boundary and exposes whether downstream consumers are seeing or
owner_hints:
- Plans/CLI_Bridged_Providers.md
split_recommendation_reason: The doc-level source-preserving unit covers both GUI-related and non-GUI spans; future fine-grained PlanUnits should split those surfaces when safe.
```

