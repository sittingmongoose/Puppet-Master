# Shard 021: Shared Runtime Context and Provider Dispatch Integration Addendum (2026-08-13)

Source: `Plans/Prompt_Pipeline.md`

Source lines: L5113-L5677

Source SHA256: `cbda2ffd980a861f82ffab67431b1190940e9227a2d3302a8337a726502f14b7`

---

## Shared Runtime Context and Provider Dispatch Integration Addendum (2026-08-13)

This is the canonical Prompt Pipeline integration addendum for the corrected remaining-runtime packet. It strengthens context compilation and prompt policy without creating a second runtime, provider, Tool, Skill, MCP, permission, FileSafe, storage, Usage, or Goal owner.

### Owner boundary and no-authority-widening invariant

The owner split is mandatory:

| Concern | Canonical responsibility |
|---|---|
| Context candidate selection, Context Admission policy, bounded `PromptCapsule` construction, `ContextReceipt` meaning, normalized provider-prefix policy, divergence calculation, selected-schema materialization policy, context shaping of typed recovery, compaction content/commit predicates, and conditional-instruction inclusion | `Plans/Prompt_Pipeline.md` |
| Generic operation/lifecycle state machines, durable operation identity, transaction/lease/epoch mechanics, restart reconciliation, and shared typed runtime projections | `Plans/Shared_Integration_Runtime.md` |
| Provider/account/model resolution and eligibility | `Plans/Models_System.md` and `Plans/Multi-Account.md` |
| Tool, Skill, and MCP registry/lifecycle/domain semantics | `Plans/Tools.md`, `Plans/Skills_System.md`, and `Plans/MCP_Integration.md` |
| Permission and safety authority | `Plans/Permissions_System.md` and `Plans/FileSafe.md` |
| Provider-dispatch admission and resource-policy consumption | `ProviderDispatchAdmissionService` in `Plans/Shared_Integration_Runtime.md`, consuming current `RuntimeResourceGovernor` and owner decisions |
| Canonical history, artifacts, receipts, event persistence, replay, retention, and migration | `Plans/storage-plan.md` and contract/schema owners |

No mechanism in this addendum may widen authority. Context selection, cache reuse, compaction, recovery, progressive materialization, conditional rules, fallback, retry, child inheritance, or provider-dispatch admission may only preserve or narrow the effective permission, FileSafe, route, account, model, tool, network, host/environment, and execution-mode ceilings already resolved for the attempt. Derived data and cache hits are reusable evidence only; they are not transferable execution authority.

ContractRef: ContractName:Plans/Shared_Integration_Runtime.md, ContractName:Plans/Models_System.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/Tools.md, ContractName:Plans/Skills_System.md, ContractName:Plans/MCP_Integration.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/FileSafe.md, ContractName:Plans/storage-plan.md

### Context Admission, account-envelope reconciliation, and provider-dispatch admission

The provider-bound automated path is:

```text
durable stores and registries
-> trusted task/phase/origin plus resolved route/capability identity
-> retrieval and candidate selection
-> deterministic Context Admission Gate
-> RuntimePolicySnapshot + bounded PromptCapsule + explanatory ContextReceipt
-> provider-specific rendering
-> deterministic Packet Admission Gate decision + existing Permissions/FileSafe receipts
-> single-use ProviderDispatchAdmissionReceipt over the exact final bytes and dependencies
-> provider call/stream
-> deterministic response conformance and history admission
```

Context Admission occurs before candidate material is marked protected or compaction-immune. A source's `pinned`, `protected`, or `compaction_immune` metadata controls retention only after the source is relevant, current, permitted, and admitted. It does not force injection. Mandatory system/runtime kernel content remains mandatory by its owner contract, not because an unadmitted source self-labels as immune.

`RuntimePolicySnapshot`, `PromptCapsule`, and `ContextReceipt` are bounded compilation inputs/outputs. The `ContextReceipt` records exact source/provenance refs, admitted and omitted block IDs, on-demand handles, byte/token estimates, truncation/compaction reasons, selected schema identities, policy/permission snapshot refs, and `context_epoch_id`; it explains the compile but grants no execution authority.

Packet Admission proves final packet structure and obligation coverage; Permissions and FileSafe separately prove their owner decisions. `ProviderDispatchAdmissionService` consumes those current decisions plus the exact final provider-visible bytes, structured-attachment manifest, route/model/account/transform identity, run/node/attempt identity, current resource-policy admission, and relevant generations. It emits the sole single-use `ProviderDispatchAdmissionReceipt`. No separate `PacketAdmissionReceipt`, `FileSafeGuardReceipt`, `ImmutableDispatchIntent`, or `ProviderRequestPermit` family is created here. The provider adapter sends the exact receipt-bound bytes rather than reconstructing the request from mutable inputs. An exact retry may reuse the same rendered bytes, but because the receipt is single-use, each network attempt obtains a fresh current receipt; any changed byte or binding also reruns the owning decisions.

The existing `requested_account_id` contradiction is resolved, not deferred. Section 6.2A and the effective-resolution record already require `requested_account_id`, while the former canonical run-envelope list omitted it. The run envelope now carries:

- `requested_account_id: string?`
- `requested_account_policy`
- `requested_account_binding: none | preferred | required`
- `effective_account_id: string?`
- the frozen effective provider/account/route snapshot ref and switch reason when requested and effective differ

`requested_account_policy` and `requested_account_binding` are orthogonal to the concrete requested ID. The concrete ID remains required-present and nullable independently of the binding value; `none | preferred | required` fallback semantics remain owned by Multi-Account and are carried without reinterpretation here. Any requested/effective difference, including null-to-non-null default selection, requires explicit resolver evidence and `account_switch_reason`; `required` blocks silent substitution when the exact eligible requested account cannot be used. No prompt, Persona, conditional rule, fallback, cache entry, resource admission, or provider-dispatch receipt may silently change a required account binding.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/FileSafe.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/Models_System.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/Shared_Integration_Runtime.md

### Stable normalized provider prefixes, append-only divergence, and cache-break receipts

The canonical transcript remains provider-neutral and immutable under its storage owner. Prompt Pipeline derives a provider-facing view; it never writes provider cache decorations or adapter-specific serialization back into canonical history.

`StablePrefixSnapshot` contains only normalized, dependency-current content whose order and bytes are stable for the effective provider wire protocol:

- invariant system/runtime kernel blocks;
- the bounded Persona behavior capsule;
- admitted scoped-rule blocks;
- selected Tool/Skill/MCP schemas in deterministic canonical-ID order;
- response/output schema and capability identities;
- versioned normalization/adapter-transform identity;
- hashes for the `RuntimePolicySnapshot`, permission scope, route/model/account binding, selected schema set, and `context_epoch_id`.

Volatile time, working-directory, branch/status, catalog freshness, Usage, resource-pressure, and current-turn facts remain in ordered late blocks unless their owner contract makes one an invariant dependency. Request-local provider cache markers are applied after canonical normalization and stripped/recomputed for provider failover; they never contaminate stored transcript bytes.

`AppendOnlyProviderContext` stores ordered `MessageDigest` entries for the derived provider view. Its deterministic update algorithm is:

1. If the normalized stable-prefix fingerprint and every existing message digest are unchanged, append only the new tail.
2. If a prior normalized message changed, compute the longest unchanged prefix, record `DivergencePoint`, retain that prefix where the effective provider/adapter supports it, and replace only the changed tail.
3. If compaction, branch reconstruction, provider/model/account/wire-protocol change, incompatible schema change, or provider capability forbids safe reuse, rebase the derived view and record the explicit break reason.
4. Never infer equivalence from raw text alone; roles, structured parts, tool-call/result lineage, attachment digests, reasoning/replay shape, and adapter normalization version participate in each digest.

Every divergence or rebase appends a `CacheBreakReceipt` with at least `receipt_id`, `context_epoch_id`, old/new prefix fingerprint, provider/route/model/account/adapter-transform refs, divergence index, retained and replaced message counts, estimated retained/replayed bytes and tokens, selected-schema hash, break-reason enum, provider capability evidence, and the later `provider_dispatch_admission_receipt_id` when dispatch occurs. Required break reasons include `provider_changed`, `account_changed`, `model_or_wire_protocol_changed`, `persona_changed`, `rules_changed`, `selected_schema_set_changed`, `policy_or_permission_changed`, `compaction_rebase`, `history_divergence`, `adapter_transform_changed`, `provider_marker_strategy_changed`, and `append_only_unsupported`.

Cache reuse is optimization evidence, not permission, Packet Admission, FileSafe, provider identity attestation, or billing authority. The cache and divergence records are append-safe receipts; the generic receipt lifecycle and persistence remain Shared Integration Runtime/storage responsibilities.

ContractRef: ContractName:Plans/Shared_Integration_Runtime.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Models_System.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/usage-feature.md

### Progressive Tool, Skill, and MCP schema materialization

Prompt Pipeline consumes domain registries without re-owning them. Each capability identity is projected through five distinct states:

```text
installed
project_enabled
policy_available
selected_for_request
invoked
```

Only `selected_for_request` schemas are materialized into the final provider request. `installed` or `project_enabled` alone never implies prompt inclusion or permission. Essential bounded discovery/read/search surfaces may remain directly available when permitted; large Tool, Skill, plugin-projected, and MCP catalogs remain external, searchable, and materialize on demand through the canonical discovery path.

Selection and materialization rules are deterministic:

- filter by current mode, permission, FileSafe, route capability, host/environment readiness, project enablement, and inherited authority ceiling before selection;
- de-duplicate by canonical domain identity and resolve collisions through the domain owner, never prompt order;
- order selected schemas by the domain-owner tuple `(capability_kind_rank, canonical_capability_ref, schema_version, schema_sha256)`, not discovery timing, connection timing, popularity, or filesystem traversal order;
- include one version/hash per schema and bounded omission counts/reasons through `ContextCatalogBudget`/`ContextReceipt` rather than injecting full deferred definitions;
- an on-demand materialization that changes provider-visible bytes advances or updates the `ContextEpoch`, records cache impact, repeats Packet Admission and the applicable Permissions/FileSafe checks, and obtains a fresh `ProviderDispatchAdmissionReceipt`;
- `invoked` is observed execution state and never back-propagates permission or automatic future selection.

Provider-native Tool/Skill/MCP files remain compatibility projections. They cannot become peer authorities or silently add schemas outside the selected PM-native set.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Skills_System.md, ContractName:Plans/MCP_Integration.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/FileSafe.md, ContractName:Plans/Shared_Integration_Runtime.md

### Typed recovery and artifact-backed prompt outputs

Prompt Pipeline consumes the domain-owned/shared-runtime `ToolRecoveryEnvelope` and decides only its bounded provider-visible representation. It does not own terminal, patch, read, search, write, MCP, Skill, attachment, or artifact lifecycle state machines.

The consumable envelope distinguishes at least:

- `status: complete | partial | timed_out | truncated | unavailable | blocked | failed`;
- original logical operation and attempt/tool-call identity;
- source identity/revision, failure class, retryability, retry count, final outcome, and elapsed/Usage refs;
- requested and returned range/count, original size, visible size, omitted size/range, and `truncated`;
- redacted immutable `artifact_or_spill_ref` plus bounded visible head/tail when output is large;
- `cwd_before` / `cwd_after`;
- already-applied proof, no-match, whitespace-mismatch, ambiguous-location, negative-cache-hit, and post-write verification state where applicable;
- one bounded recovery hint and preregistered `next_safe_action_ids[]` within the current authority ceiling.

Permission or FileSafe denial is a blocked policy outcome, never a transient failure to route around. Already-applied is success/no-op only with proof that the intended new state exists and the old target no longer requires change. Ambiguous or approximate patch recovery does not mutate. A zero result remains distinct from timeout, truncation, unavailable, or unsearched scope.

Oversized output is persisted through the artifact/storage owner after redaction; the prompt receives bounded evidence plus the immutable reference, original size, completeness state, and recovery path. Re-reading an admitted recovery artifact is protected from immediate re-pruning during the same recovery episode. Any recovery that changes the provider-visible request or effective action requires fresh Context Admission as applicable, fresh Packet Admission and owner checks, and a fresh `ProviderDispatchAdmissionReceipt`; no hidden semantic retry or blind rerun is allowed.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/FileSafe.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Shared_Integration_Runtime.md

### Bounded transactional compaction

Shared Integration Runtime owns the generic idempotent transaction state machine, lease/fence, operation identity, restart reconciliation, and durable progress projection. Prompt Pipeline owns compaction candidate selection, bounded summarizer inputs, retention rules, semantic validation, minimum-gain policy, provider/cache strategy, and the predicates that permit a candidate to become the active provider-context head.

Every compaction profile must set finite `max_summarizer_input_tokens`, `max_summarizer_input_bytes`, `max_summary_output_tokens`, `minimum_actionable_user_turns`, `min_reclaim_tokens`, `progress_timeout`, and `absolute_timeout`. Missing or invalid bounds make provider-backed compaction unavailable; they never degrade to an unbounded helper call.

The transaction contract is:

1. Freeze `input_context_revision`, `context_epoch_id`, active branch/head, ordered bounded head, required exact IDs/obligations, and a recent tail containing at least the configured number of actionable user turns.
2. Redact helper input before dispatch; redact helper output, logs, diagnostics, and persisted artifacts again before validation/commit.
3. Preserve system/runtime kernel, Persona behavior obligations, selected-schema identities, unresolved instructions/corrections, active Plan/Goal evidence refs, and exact skill/instruction provenance or deterministic reload handles.
4. Replace eligible large historical bodies with bounded summaries plus immutable artifact refs. A `ghost-skill` or instruction-survival marker must preserve exact source/version, obligation IDs, and reload ref; loss or weakening of the marker fails the candidate.
5. Validate role/message boundaries, causal tool/result lineage, branch ancestry, actionable-user tail, retained exact IDs, semantic closure, expected reclaimed size, and provider compatibility.
6. Commit only when `input_context_revision`, branch/head, `ContextEpoch`, and transaction lease/fence remain current and reclaimed context meets `min_reclaim_tokens`. The artifact, `CompactionReceipt`, new head pointer, and commit marker become visible atomically.
7. A stale or late helper result is discarded. Lock contention or an unavailable lease is `soft_defer` and consumes neither the ordinary failure budget nor a compaction attempt. No-gain is a typed no-op receipt, not success.
8. A failed/interrupted transaction leaves the prior context head authoritative. Canonical transcript, settled Usage, branch ancestry, Goal/Plan state, and tool evidence are never rewritten by compaction.

Optional provider-aware micro-compaction may absorb eligible old assistant/tool exchanges only when the effective provider/model/cache economics and configured gain threshold justify the cache break. It never compacts user messages, never crosses protected head/tail fences, records a rolling cursor and cache impact, skips a repeatedly failing exchange after a bounded configured count, and cannot become the universal default.

`CompactionReceipt` carries the transaction/input/output revisions and hashes, retained head/tail counts, actionable-user-turn count, protected/reload marker refs, artifact refs, redaction profile, pre/post size, reclaimed size, minimum-gain result, helper provider/Usage ref when used, progress/absolute timeout outcome, cache/ContextEpoch effect, commit/no-op/discard/soft-defer disposition, and currentness proof.

ContractRef: ContractName:Plans/Shared_Integration_Runtime.md, ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/usage-feature.md, ContractName:Plans/FileSafe.md

### Time-Traveling conditional rules

The shared runtime may evaluate versioned dormant conditional rules indexed by `project`, `path`, `tool`, `mode`, Goal phase, workflow state, and regex/AST/typed conditions. Prompt Pipeline owns only the admission and stable rendering of a resulting concise instruction delta. Rule discovery/evaluation remains deterministic program logic and adds zero hidden model-gate calls.

Each shared-runtime `ConditionalRuleEngine` receipt consumed by Prompt Pipeline carries `rule_id`, `rule_version`, scope refs, matched typed fact/evidence IDs, matcher kind/version, emitted instruction IDs or stable content ref, interrupt policy, logical turn/attempt/context epoch, pre/post rendered dependency hashes, cache impact, retry counters/caps, disposition, loop-breaker state, and user-visible activity reason. Prompt Pipeline does not create a parallel conditional-rule lifecycle or receipt family.

Deterministic hard caps are:

- one emitted instruction delta per `(rule_id, rule_version, matched_evidence_digest, logical_turn_id)`;
- at most one interrupt-and-retry for one rule version in one logical turn;
- at most two interrupting conditional-rule retries in aggregate across the logical turn;
- non-interrupting duplicate matches for the same rule/version/evidence are suppressed rather than re-injected.

When a cap is reached, PM records `rule_cap_exhausted`, suppresses further retry for that logical turn, and continues or fails under the pre-existing run policy; it does not silently reset counters by starting a new provider attempt. Repeated failure may route to a separately authorized process-repair workflow, not recurse inside the conditional-rule engine.

Conditional rules are advanced prompt-policy aids for instructions that require model reasoning. They cannot implement deterministic safety or state transitions; grant permission; expand FileSafe/read/write/network/tool scope; change provider/model/account/host/environment routing; bypass Context Admission, Packet Admission, FileSafe, or resource admission; inject untrusted retrieved text as executable policy; or mutate provider bytes after final gate approval. Conflicting applicable rules fail closed to bounded owner adjudication before rendering.

ContractRef: ContractName:Plans/agent-rules-context.md, ContractName:Plans/Shared_Integration_Runtime.md, ContractName:Plans/FileSafe.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/Contracts_V0.md

### Provider-request admission consumption

The source packet's `ProviderRequestPermit` term resolves to the single-use, short-lived `ProviderDispatchAdmissionReceipt` owned by `ProviderDispatchAdmissionService`; Prompt Pipeline does not create a second permit or receipt family. Prompt Pipeline supplies finalized provider bytes and their context dependencies, then consumes the shared runtime admission outcome.

The `ProviderDispatchAdmissionReceipt` is issued only after route/account/model resolution, prompt finalization, Packet Admission, current Permissions/FileSafe decisions, and current RuntimeResourceGovernor admission. Its atomic single-use consumption occurs only for the actual provider network request or stream-production interval. Parent/child lifetime, local planning, tool work, compaction, queue time, approval waits, artifact reads, and waiting on other agents do not retain or pre-consume provider dispatch admission.

Each retry or resumed network attempt obtains a fresh current receipt even when the rendered request bytes are identical. A receipt cannot authorize changed bytes, route, account, model, permission generation, topology generation, mutation evidence, or resource decision. Stale, expired, consumed, infeasible, or denied admission blocks before network transmission with a typed wait/reduction/denial outcome and never widens authority or triggers silent alternate-account routing. Provider-admission wait, provider-active time, and consumed/rejected/aborted outcome remain separately attributable.

ContractRef: ContractName:Plans/Shared_Integration_Runtime.md#11-provider-dispatch-admission, ContractName:Plans/Multi-Account.md, ContractName:Plans/Models_System.md, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/usage-feature.md

### Acceptance and negative fixtures

At minimum, implementation verification must cover:

- stable-prefix reuse for identical normalized dependencies and explicit cache-break reasons for every bound mutation;
- append-only normal growth, longest-prefix divergence after a rewrite, and full rebase after incompatible compaction/provider change;
- 100 installed capabilities with only five selected schemas materialized in stable order;
- deferred Tool/Skill/MCP discovery without permission widening or catalog-wide prompt injection;
- terminal spill, already-applied proof, whitespace/no-match/ambiguity, zero-result completeness, negative-cache invalidation, and artifact reread without immediate re-prune;
- stale compaction discard, lock soft-defer, no-gain no-op, ghost-skill marker loss, redaction at each boundary, progress timeout, absolute timeout, and atomic commit recovery;
- conditional-rule match/no-match, duplicate suppression, false positive, one-rule retry cap, aggregate retry cap, conflict fail-closed behavior, and deterministic-safety non-substitution;
- required/preferred/none requested-account bindings and truthful requested/effective resolution;
- Packet Admission plus current Permissions/FileSafe decisions over the same final bytes, post-gate mutation invalidation, single-use dispatch-receipt retry, and receipt reacquisition;
- parent/child provider-dispatch deadlock regression proving that non-provider work does not pre-consume scarce provider capacity.

Static Plan text, schema existence, or validator success is not runtime enforcement evidence.

### PP-074 - Context Admission and Immutable Provider Dispatch Boundary

```yaml
plan_unit_id: PP-074
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Prompt Pipeline runs deterministic Context Admission before candidate material can become protected or immune, compiles RuntimePolicySnapshot plus bounded PromptCapsule and non-authoritative ContextReceipt, and supplies Packet Admission plus current Permissions/FileSafe decisions to Shared Integration Runtime so its sole single-use ProviderDispatchAdmissionReceipt binds the exact final provider bytes and dependencies.
gui_related: false
gui_classification_reason: This unit defines backend compilation, gate ordering, receipt authority, and immutable dispatch semantics.
depends_on: [PP-008, PP-014, PP-025, PP-045]
unblocks: [PP-075, PP-076, PP-080]
acceptance_criteria:
  - ContextReceipt cannot authorize provider dispatch, tools, file access, or mutation.
  - Protected or compaction-immune metadata cannot force an unadmitted candidate into context.
  - ProviderDispatchAdmissionReceipt binds the final bytes, attachments, route, account, model, transform, owner receipt refs, resource admission, generations, and run/node/attempt identity.
  - Post-gate mutation invalidates provider-dispatch admission and requires fresh owner checks.
validation_surfaces:
  - Context Admission include/omit/on-demand fixtures
  - co-bound gate digest and post-gate mutation fixtures
risk_class: prompt_authority_and_dispatch_integrity
reasoning_tier: high
context_scope: context_admission_and_dispatch
implementation_surfaces: [Plans/Prompt_Pipeline.md]
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/03_PROVIDER_CONTEXT_TOOLS_RECOVERY_AND_COMPACTION.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/reference/ASSISTANT_CHAT_SHARED_CONTRACTS.md
negative_constraints:
  - Do not merge Context Admission, Packet Admission, and FileSafe into one gate.
  - Do not add hidden per-dispatch model readers.
```

### PP-075 - Stable Prefix Append-Only Divergence and Cache-Break Receipts

```yaml
plan_unit_id: PP-075
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Prompt Pipeline derives a normalized StablePrefixSnapshot and AppendOnlyProviderContext from provider-neutral canonical history, appends unchanged tails, retains the longest unchanged digest prefix after rewrites when supported, and records every divergence or rebase in an append-safe CacheBreakReceipt without treating cache reuse as authority.
gui_related: false
gui_classification_reason: This unit defines backend provider normalization, divergence, cache identity, and receipt semantics.
depends_on: [PP-061, PP-062, PP-063, PP-074]
unblocks: [PP-078, PP-079]
acceptance_criteria:
  - Provider cache decoration never mutates canonical transcript history.
  - Identical normalized dependencies reuse the exact stable prefix and append only the new tail.
  - Rewrites compute the longest unchanged prefix and expose a typed divergence point.
  - Provider, account, model, policy, schema, compaction, and adapter changes emit explicit cache-break reasons.
validation_surfaces:
  - stable-prefix and schema-order fixtures
  - append, divergence, rebase, failover, and cache-break fixtures
risk_class: provider_context_cache_integrity
reasoning_tier: high
context_scope: stable_prefix_and_append_only_context
implementation_surfaces: [Plans/Prompt_Pipeline.md]
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/03_PROVIDER_CONTEXT_TOOLS_RECOVERY_AND_COMPACTION.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/reference/T3_OMP_COMPLETE_SOURCE_REVIEW.md
negative_constraints:
  - Do not infer digest equivalence from raw text alone.
  - Do not treat cache reuse as permission, identity attestation, or billing authority.
```

### PP-076 - Progressive Tool Skill and MCP Schema Materialization

```yaml
plan_unit_id: PP-076
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Prompt Pipeline consumes canonical Tool, Skill, and MCP registries through distinct installed, project-enabled, policy-available, selected-for-request, and invoked states; only selected schemas materialize in deterministic canonical-ID order, while deferred catalogs remain bounded and discoverable on demand.
gui_related: false
gui_classification_reason: This unit defines backend schema-selection and prompt-materialization policy rather than visual manager design.
depends_on: [PP-009, PP-049, PP-059, PP-074]
unblocks: [PP-077]
acceptance_criteria:
  - Installed or enabled state alone never causes schema injection.
  - One hundred installed capabilities with five selected materialize only the five selected schemas.
  - On-demand materialization changes ContextEpoch/cache dependencies and repeats final gates.
  - Child, provider-native, or discovered projections cannot widen the selected authority ceiling.
validation_surfaces:
  - 100-installed/5-selected fixture
  - schema collision, order, omission, permission, and on-demand rematerialization fixtures
risk_class: progressive_capability_context_integrity
reasoning_tier: high
context_scope: progressive_capabilities
implementation_surfaces: [Plans/Prompt_Pipeline.md]
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/03_PROVIDER_CONTEXT_TOOLS_RECOVERY_AND_COMPACTION.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/reference/T3_OMP_COMPLETE_SOURCE_REVIEW.md
negative_constraints:
  - Do not inject complete Tool, Skill, plugin, or MCP catalogs into every request.
  - Do not make provider-native projections peer authorities.
```

### PP-077 - Typed Recovery and Artifact-Backed Context Outputs

```yaml
plan_unit_id: PP-077
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Prompt Pipeline consumes typed ToolRecoveryEnvelope outputs, preserves complete/partial/timed-out/truncated/unavailable distinctions, places large redacted results in immutable artifacts with bounded prompt representations and recovery paths, and requires renewed admission whenever recovery changes provider-visible bytes or the effective action.
gui_related: false
gui_classification_reason: This unit defines backend recovery evidence and context shaping; visual cards and inspectors remain consumer-owned.
depends_on: [PP-020, PP-024, PP-074, PP-076]
unblocks: [PP-078]
acceptance_criteria:
  - Permission and FileSafe denial cannot become a transient retry.
  - Already-applied success/no-op requires proof; ambiguous recovery does not mutate.
  - Zero result remains distinct from incomplete, timeout, truncation, and unavailable scope.
  - Artifact-backed output preserves original size, completeness, redaction, lineage, and bounded reread.
validation_surfaces:
  - terminal spill and artifact reread fixtures
  - patch no-op/no-match/whitespace/ambiguity fixtures
  - search completeness and negative-cache invalidation fixtures
risk_class: recovery_evidence_and_context_integrity
reasoning_tier: high
context_scope: typed_recovery
implementation_surfaces: [Plans/Prompt_Pipeline.md]
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/03_PROVIDER_CONTEXT_TOOLS_RECOVERY_AND_COMPACTION.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/reference/HERMES_V020_SOURCE_REVIEW.md
negative_constraints:
  - Do not blind-rerun to recover truncated output.
  - Do not inline oversized raw outputs when an authorized artifact ref suffices.
```

### PP-078 - Bounded Transactional Compaction

```yaml
plan_unit_id: PP-078
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Compaction uses finite input/output/time/gain bounds, deterministic head plus actionable-user-tail retention, redaction at every boundary, skill/instruction survival markers, immutable artifact refs, and a revision/epoch/lease commit fence; stale, interrupted, no-gain, and lock-contention outcomes cannot replace the current context head.
gui_related: false
gui_classification_reason: This unit defines backend compaction policy, validation, transaction predicates, and recovery semantics.
depends_on: [PP-016, PP-017, PP-020, PP-024, PP-025, PP-075, PP-077]
unblocks: []
acceptance_criteria:
  - Every compaction profile has finite summarizer input/output, actionable-tail, gain, progress-timeout, and absolute-timeout bounds.
  - Commit requires current revision, branch/head, ContextEpoch, lease/fence, valid markers, semantic closure, and minimum gain.
  - Late results discard, lock contention soft-defers, and no-gain emits a no-op receipt.
  - Failed/interrupted compaction leaves canonical transcript, prior head, Usage, ancestry, Goal, Plan, and evidence intact.
validation_surfaces:
  - stale-result, soft-defer, no-gain, marker-loss, redaction, timeout, and crash-recovery fixtures
  - provider-aware micro-compaction/cache-break fixtures
risk_class: transactional_compaction_integrity
reasoning_tier: high
context_scope: transactional_compaction
implementation_surfaces: [Plans/Prompt_Pipeline.md]
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/03_PROVIDER_CONTEXT_TOOLS_RECOVERY_AND_COMPACTION.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/reference/HERMES_V020_SOURCE_REVIEW.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/reference/ASSISTANT_CHAT_SHARED_CONTRACTS.md
negative_constraints:
  - Do not make compaction success possible without useful reclaimed context.
  - Do not let a late helper result mutate current context state.
```

### PP-079 - Time-Traveling Conditional Rule Admission and Caps

```yaml
plan_unit_id: PP-079
unit_type: constraint
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Time-Traveling conditional rules remain dormant until deterministic scoped typed conditions match, may render only concise stable-ID instruction deltas, and are capped at one delta per rule/version/evidence/turn, one interrupt-retry per rule version per turn, and two interrupting retries total per turn without ever replacing deterministic safety or widening authority.
gui_related: false
gui_classification_reason: This unit defines backend conditional-instruction matching, prompt admission, retry caps, and safety boundaries.
depends_on: [PP-057, PP-069, PP-074, PP-075]
unblocks: []
acceptance_criteria:
  - Duplicate rule/version/evidence matches in one logical turn are suppressed.
  - Same-rule and aggregate interrupt-retry caps persist across provider attempts in the logical turn.
  - Cap exhaustion records a typed receipt and cannot recursively reset itself.
  - Conditional rules cannot grant permission, change route/account/model, bypass gates, or own deterministic state transitions.
validation_surfaces:
  - match/no-match, duplicate, false-positive, conflict, same-rule cap, and aggregate-cap fixtures
  - authority-widening and deterministic-safety negative fixtures
risk_class: conditional_instruction_loop_and_authority
reasoning_tier: high
context_scope: conditional_instruction_admission
implementation_surfaces: [Plans/Prompt_Pipeline.md]
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/05_BSD_TIME_TRAVEL_GOAL_AND_OPERATIONAL_AWARENESS.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/reference/T3_OMP_COMPLETE_SOURCE_REVIEW.md
negative_constraints:
  - Do not use conditional rules for FileSafe, Permissions, path boundaries, or destructive-operation enforcement.
  - Do not use an extra model to decide ordinary rule firing.
```

### PP-080 - Requested Account Envelope Reconciliation

```yaml
plan_unit_id: PP-080
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  The canonical run envelope includes requested_account_id, requested_account_policy, requested_account_binding, effective_account_id, and the frozen effective provider/account/route snapshot; the concrete requested ID remains required-present and nullable independently of binding, every requested/effective difference requires resolver evidence and an account_switch_reason, and required binding blocks silent substitution.
gui_related: false
gui_classification_reason: This unit resolves backend runtime identity and provider-dispatch envelope semantics.
depends_on: [PP-034, PP-035, PP-045, PP-074]
unblocks: [PP-081]
acceptance_criteria:
  - The run-envelope list and effective-resolution record carry the same requested/effective account grammar.
  - The concrete requested ID remains separately required-present and nullable while binding fallback semantics remain owned by Multi-Account.
  - required binding cannot silently substitute another account.
  - Any requested/effective difference, including null-to-non-null default selection, records the requested identity, effective identity, switch reason, and resolver evidence.
  - Context, cache, recovery, conditional-rule, resource-admission, and provider-dispatch paths preserve the frozen account ceiling.
validation_surfaces:
  - none/preferred/required account-resolution fixtures
  - unavailable-required and preferred-fallback dispatch fixtures
risk_class: requested_effective_account_dispatch_integrity
reasoning_tier: high
context_scope: runtime_identity_envelope
implementation_surfaces: [Plans/Prompt_Pipeline.md]
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/Prompt_Pipeline.md#Requested/effective-account-identity-contract
negative_constraints:
  - Do not collapse concrete requested account identity into requested_account_policy.
  - Do not let Persona, prompt, cache, rule, resource-admission, or provider-dispatch state change a required account binding.
```

### PP-081 - Provider Dispatch Admission Receipt Consumption and Runtime Owner Boundary

```yaml
plan_unit_id: PP-081
unit_type: constraint
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Prompt Pipeline consumes Shared Integration Runtime's sole single-use ProviderDispatchAdmissionReceipt only after final rendering, Packet Admission, current Permissions/FileSafe decisions, and RuntimeResourceGovernor admission; every network attempt obtains a current receipt, and the receipt never becomes prompt, safety, account, or execution authority.
gui_related: false
gui_classification_reason: This unit defines backend capacity-admission consumption and owner separation.
depends_on: [PP-074, PP-080]
unblocks: []
acceptance_criteria:
  - Parent/child lifetime, local work, tool work, compaction, queues, approvals, and waits do not pre-consume provider dispatch admission.
  - Every network retry obtains a fresh single-use receipt even when the exact rendered bytes are reused.
  - Stale, expired, consumed, denied, or infeasible admission blocks dispatch without alternate-account authority widening.
  - Generic lifecycle state machines remain owned by Shared Integration Runtime, not Prompt Pipeline.
validation_surfaces:
  - parent-child provider-dispatch deadlock regression fixture
  - stale/expired/consumed receipt, retry reacquisition, and account-substitution negative fixtures
risk_class: provider_capacity_deadlock_and_owner_drift
reasoning_tier: high
context_scope: provider_request_admission_consumption
implementation_surfaces: [Plans/Prompt_Pipeline.md]
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/05_BSD_TIME_TRAVEL_GOAL_AND_OPERATIONAL_AWARENESS.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/reference/T3_OMP_COMPLETE_SOURCE_REVIEW.md
negative_constraints:
  - Do not create a second ProviderRequestPermit or dispatch-intent receipt family.
  - Do not let ProviderDispatchAdmissionReceipt substitute for Packet Admission, FileSafe, Permissions, resource policy, or route/account resolution.
```

### PP-082 - Durable Breadth Narrow Request Context And Native Goal Capsules

```yaml
plan_unit_id: PP-082
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: Durable Project, Goal, Plan, thread, agent, artifact, and evidence breadth remains addressable by stable typed refs while each provider request receives only a bounded dependency-current slice. Native Goal compilation emits typed task capsules and lineage refs rather than a giant staged prompt chain, and InstructionLoad records exact loaded instruction identities, byte/token cost, omission reasons, and cache/currentness without becoming billing or authority.
gui_related: false
depends_on: [PP-074, PP-075, GRS-044]
unblocks: []
acceptance_criteria:
  - CTX-001 keeps durable breadth addressable without injecting full transcripts, registries, or project state into every request.
  - CTX-016 records instruction-load metrics by stable source/version/hash and distinguishes loaded, omitted, deferred, cache-hit, and invalidated material.
  - PRM-001 uses the native Goal compiler and typed state/refs rather than recreating giant prompt-chain handoffs.
  - PRM-004 task capsules carry exact identity, objective, constraints, authority ceiling, inputs, expected outputs, validation, recovery, and lineage refs.
validation_surfaces: [bounded context fixtures, instruction-load fixtures, typed task-capsule schema fixtures]
risk_class: prompt_breadth_or_capsule_drift
reasoning_tier: high
context_scope: durable_breadth_narrow_context
implementation_surfaces: [Plans/Prompt_Pipeline.md, Plans/Goal_Runtime_System.md]
node_compile_hint: {mode: prompt_context_and_task_capsule_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/ACCOUNTABILITY_MATRIX.json#CTX-001
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/ACCOUNTABILITY_MATRIX.json#CTX-016
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/ACCOUNTABILITY_MATRIX.json#PRM-001
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/ACCOUNTABILITY_MATRIX.json#PRM-004
negative_constraints: [Do not rebuild Goal execution as a staged giant prompt chain., Do not treat instruction-load metrics as Usage or authority., Do not inject durable breadth wholesale into one request.]
```

### PP-083 - Capability-Specific API Digest And On-Demand Help Admission

```yaml
plan_unit_id: PP-083
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Browser Program uses one shipped/signed registry of pinned, versioned, capability-specific API digests. Each
  registry entry is limited to one exact effective-capability profile and binds API version, API digest hash,
  capability-profile hash, registry generation, compact digest ref, and a compact byte budget; the same signed
  entry is stable across Hosts for the same inputs. The base prompt carries only the compact digest identity needed
  for selection. Expanded help is absent until an explicit on-demand topic request through the capability owner,
  remains within an independent byte/token budget, and produces a secret-free receipt binding capability, registry
  generation, help topic/version/hash, emitted bytes, omissions, permission snapshot, and prompt/context epoch.
gui_related: false
gui_classification_reason: Capability-registry admission, prompt budgeting, hashes, and help receipts are prompt-compiler contracts rather than visible GUI work.
depends_on: [PP-076]
unblocks: [SMPFS-154]
acceptance_criteria:
  - HBU-005 retains one shipped/signed Browser Program digest-registry entry per effective-capability profile with pinned API version, API digest SHA-256, capability-profile SHA-256, registry generation, compact digest ref, compact byte budget, on-demand help-topic index/ref, and receipt SHA-256.
  - A positive registry fixture proves that identical signed inputs resolve to the same entry across Hosts, the compact digest stays within its declared byte budget, and a selected help topic stays within its independent budget while recording exact emitted bytes and omissions.
  - Help bodies and the full typed Browser Program step union are absent from the base prompt; only an explicit `explicit_on_demand` request for a topic admitted by the effective capability profile may materialize expanded help.
  - Negative fixtures reject a duplicate capability/profile key, invalid signature or digest hash, host-divergent entry for identical signed inputs, compact or help budget overflow, unavailable capability/help topic, unsolicited help injection, stale registry/API/capability/help/permission/prompt-context epoch, and a receipt whose bytes/hash/omissions do not match materialized help.
  - A stale API, capability, help, permission, registry, or prompt/context epoch invalidates the receipt and requires re-materialization with no inherited tool or effect authority.
  - cmd.browser.program.inspect may expose the bounded read-only Browser Program help projection; this PlanUnit creates no new command ID.
  - Static schema/fixture success does not prove prompt delivery, provider behavior, browser execution, native runtime, or token-efficiency improvement.
validation_surfaces: [Plans/egolite_retained_requirement_contracts.schema.json, Plans/egolite_retained_requirement_contract_fixtures.json, focused Egolite remediation validator, future capability digest registry hash/signature/host-stability/budget/help-receipt matrix]
risk_class: capability_digest_drift_or_unbounded_help_injection
reasoning_tier: high
context_scope: capability_specific_digest_and_help
implementation_surfaces: [Plans/Prompt_Pipeline.md, Plans/Section15_MVP_Promoted_Features_Spec.md, future prompt compiler and capability registry]
node_compile_hint: {mode: capability_digest_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-requirement:HBU-005, source_ref:egolite-packet:01_IMPLEMENTATION_PACKET.md#compact-browser-script, source_ref:egolite-packet:07_VALIDATION_AND_ACCEPTANCE.md#compact-pm-browser-script-and-compiler]
preserved_exact_tokens: [pinned, versioned, capability-specific API digest, shipped/signed with PM, stable across Hosts, effective capabilities, API digest hash, on-demand help, byte budget, receipt hash]
negative_constraints:
  - Do not inject complete capability help into every prompt.
  - Do not select an API digest or help topic outside the effective-capability profile.
  - Do not accept host-local digest drift, an invalid signature/hash, budget overflow, or an unreceipted help expansion.
  - Do not treat a digest or help receipt as tool, permission, browser, or runtime authority.
owner_hints: [Plans/Prompt_Pipeline.md, Plans/Section15_MVP_Promoted_Features_Spec.md]
```
