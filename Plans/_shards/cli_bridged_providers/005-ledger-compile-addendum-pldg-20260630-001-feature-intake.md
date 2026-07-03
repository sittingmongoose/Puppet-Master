# Shard 005: Ledger Compile Addendum - pldg-20260630-001-feature-intake

Source: `Plans/CLI_Bridged_Providers.md`

Source lines: L69-L202

Source SHA256: `f378e678d5026f04ed7692d91e16bddcfecee234cc66a7af465f15b8ec2ad415`

---

## Ledger Compile Addendum - pldg-20260630-001-feature-intake

This addendum compiles containerized-host bridged-provider context obligations from bootstrap ledger `pldg-20260630-001-feature-intake`. It does not create WorkNodes, NodeSeeds, executable queues, implementation files, runtime dispatch, production build tasks, generated governance artifacts, or a governance seal.

### CBP-023 - Bridged Provider Host Capability Context Projection

```yaml
plan_unit_id: CBP-023
unit_type: requirement
status: accepted
owner_doc: Plans/CLI_Bridged_Providers.md
canonical_text: >-
  CLI-backed and bridged provider request envelopes may carry containerized-host capability context so provider tools can
  understand the selected worktree/runtime environment, but that context is not direct host authority and does not make a
  provider bridge the owner of containerized-host execution. ProviderRequestEnvelope-style payloads may include
  host_capability_ref, host_profile_id, runtime_family, working_directory, requested/effective runtime, provider, model,
  account descriptors, blocked/degraded state, and required receipt refs. Any host operation still resolves through
  HostCapabilityCommand, Executor intake, Tools policy, Run Modes, Permissions, FileSafe, and cleanup/retention receipt
  paths. OpenCode remains reference-only for this compile unless a later OpenCode-specific host hook is explicitly
  accepted.
gui_related: false
gui_classification_reason: Provider bridge context is backend/provider routing behavior, not GUI presentation.
depends_on: [T-166, MI-031, EP-109, RM-048, PS-126]
unblocks: []
acceptance_criteria:
  - Bridged provider envelopes can reference host_capability_ref and host_profile_id as context while preserving requested/effective provider, model, and account identity.
  - Provider bridge context does not authorize Docker, Kubernetes, SSH, shell, file, terminal, or cleanup operations by itself.
  - Host unavailable, blocked, disabled, stale, or degraded states become normalized provider/tool blocker outcomes rather than silent fallback.
  - OpenCode is not promoted to a generic host owner by this compile.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future bridged-provider host-context fixture
risk_class: provider_bridge_host_authority_drift
reasoning_tier: standard
context_scope: bridged_provider_containerized_host_context
implementation_surfaces:
  - Plans/CLI_Bridged_Providers.md
  - future ProviderRequestEnvelope and CLI bridge context payloads
node_compile_hint:
  mode: bridged_provider_host_context_projection
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0029
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0034
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0040
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0044
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0047
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0053
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0069
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0081
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/source_shards/implementation_readiness_hardening_20260701.json#execution_lane_matrix
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/source_shards/subagent_hardening_synthesis_20260701.json#ref-005-host-capability-command
source_atom_ids: [atom-0029, atom-0034, atom-0040, atom-0044, atom-0047, atom-0053, atom-0069, atom-0081]
preserved_exact_tokens:
  - "provider bridges"
  - "provider tools"
  - "ProviderRequestEnvelope"
  - "requested/effective runtime/provider/model/account descriptors"
  - "working_directory"
  - "host_capability_ref"
  - "host_profile_id"
negative_constraints:
  - Do not treat provider bridge context as direct host authority.
  - Do not silently fallback from a blocked host to a different runtime or host without evidence.
  - Do not promote OpenCode to a generic containerized-host owner.
owner_hints:
  - Plans/CLI_Bridged_Providers.md
  - Plans/Tools.md
  - Plans/MCP_Integration.md
  - Plans/Provider_OpenCode.md
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

Retired Gemini CLI account, `/session/config`, subagents, extensions, model routing, telemetry, `OTLP`, `GEMINI_CLI_HOME`, and probe vocabulary are retained only as source-lineage for the deprecated/unsupported Gemini CLI route. PM must not provision, launch, or expose Gemini CLI as an active CLI-bridged provider. Active Google-owned CLI-runtime support is Antigravity CLI, with its own account/root/setup contract; Gemini Direct remains the separate direct API provider.

`ACP` is tracked as provider-protocol capability metadata for CLI-bridged adapters. Cursor `ACP` support supersedes stale assumptions in `Plans/rewrite-tie-in-memo.md` that Cursor cannot expose ACP; PM still keeps provider ontology, account identity, and transport/runtime boundaries separate, so ACP support does not turn Cursor into a PM orchestration node and does not replace account-root isolation.
