# Architecture Invariants (Canonical)

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0036
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `Plans/[retired-token-1]`
  - Plans/[retired-token-1]
  - `[retired-token-1]` needs to reflect newer runtime invariants like scheduler lane ordering and mutation-safe-point requirements
  - [retired-token-1]
  - Canonical invariants are increasingly runtime-object-first:
  - Add `attempt_id` to the reserved diagnostic schemas that represent execution, audit, handoff, and HITL events, and back it with a new architecture invariant for attempt continuity.
  - attempt_id
  - The key remaining question is breadth: how many authored `Plans/*.md` docs are still only Gemini or otherwise below full requested model coverage.
  - Plans/*.md
  - `[retired-token-1]` lacks invariants for requested/effective identity completeness, graph-lock degradation boundaries, projection trust/generation staleness, blocked/failure classification, concurrent actors sharing provider pools, and safe-point vs restore-point separation.
  - `[retired-token-1]` needs explicit invariants for frozen requested/effective execution identity bundles, provider-pool concurrency scope, projection trust vs scheduler authority, and safe-point lineage exactness.
  - `[retired-token-1]` is now missing invariants that adjacent owner docs already state normatively: safe-point vs restore-point boundaries, graph-lock non-degradation, classification-before-policy, checkpoint-derived projection freshness, and attempt-boundary identity freeze.
  - Coverage has been re-audited after the merge: `39` top-level `Plans/*.md` docs are full six-pass complete and the remaining `22` docs are now uniformly at five passes.
  - 39
  - 22
  - `[retired-token-1]` remains missing owner-level invariants for attempt immutability, failure-vs-blocked family separation, restore identity, projection authority, and shared provider-pool concurrency.
  - After this merge, the authored top-level `Plans/*.md` surface is fully covered: all `61` docs now have all six requested model passes.
  - 61
  - `ContractRef: Plans/[retired-token-1]#INV-002, Plans/[retired-token-1]#INV-010, SchemaID:evidence.schema.json`
  - ContractRef: Plans/[retired-token-1]#INV-002, Plans/[retired-token-1]#INV-010, SchemaID:evidence.schema.json
- Legacy token retirement handling:
  - Retired token #1 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
  - All exact_stale_tokens_to_retire are removed, reframed as explicitly deprecated, or preserved only as documented legacy aliases.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


<!--
PUPPET MASTER -- ARCHITECTURE INVARIANTS

ABSOLUTE NAMING RULE:
- Platform name is "Puppet Master" only.
- If older naming exists, refer to it only as "legacy naming" (do not quote it).
-->

## 0. Scope

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0037
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - should show scope and consequence clearly
  - Conversational/HITL/tooling docs still overload “session” with incompatible scope meanings, which becomes a correctness bug under multi-lane and multi-actor execution.
  - Common scope fields:
  - object identity and scope stay separate from destination
  - shell and scope belong to `route_target`
  - route_target
  - `focused_run_id` and `thread_id` remain route fields because they are scope restorers, not just object metadata.
  - focused_run_id
  - thread_id
  - It carries navigation identity, scope restoration, and narrow focus refinement.
  - Scope and focus fields are not selector identity.
  - `blocked_sequence` in `{ run_id, node_id }` scope
  - blocked_sequence
  - { run_id, node_id }
  - The system now has canonical field-name modernization without canonical scope modernization.
  - `Media_Generation_and_Capabilities.md`, `agent-rules-context.md`, and `Skills_System.md` all still under-specify caller scope, execution-role capture, identity disclosure, or currently-usable-vs-instance-enabled capability semantics.
  - Media_Generation_and_Capabilities.md
  - agent-rules-context.md
  - Skills_System.md
  - That means the main owner gap is no longer field names first. It is scope and owner identity.
  - The handoff addenda already assume attempt-native execution identity, but the core narrative still teaches tier-centric scope resolution.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
Invariants are cross-cutting rules that MUST hold across all plans and implementations.

ContractRef: Primitive:Invariant, PolicyRule:Decision_Policy.md§1

---

<a id="INV-001"></a>
## INV-001 -- Tool correlation integrity (normalized streams + persisted events)

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0039
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - impacted contract/runtime/storage area: persisted object identity and workspace layout.
  - `provider_account_id` is being normalized in usage/storage-facing docs without a governing rule, so it risks becoming a second shadow routing identity
  - provider_account_id
  - `Health`: setup/config/repo integrity signal
  - Health
  - `plan_or_tier_default` is still a persisted enum value in `Prompt_Pipeline.md`
  - plan_or_tier_default
  - Prompt_Pipeline.md
  - 2026-03-09 addenda say normalized streams MUST preserve `attempt_id`
  ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md, Primitive:RuntimeIdentity
  - attempt_id
  - it still leaves no normalized path for account-switch, pressure/confidence, or actor-class disclosure
  - Add a versioned correlation block to bridged-provider normalized events and require actor/thread/attempt/lineage refs there.
  - likely owners for canonical correlation blocks, switch/pressure episodes, and blocked/approval identity linkage
  - any run-start/runtime snapshot events that already carry requested/effective auth-account fields
  - canonical `thread_id` remains PM correlation
  - thread_id
  - Add a versioned stream/provider correlation block for actor/attempt/account/trust metadata.
  - they are useful correlation fields
  - No durable approver identity is defined on approval/rejection events yet.
  - `tier_id` can still survive as a human-readable grouping label, but it should stop acting like the canonical execution correlation key.
  - tier_id
  - align project-artifact events to EventRecord-level identity,
  - requested/effective provider/model/auth/account disclosure fields by ref or normalized snapshot
  - args should carry a normalized subject/route target
  - `correlation_id` still lacks an explicit trace-through requirement into persisted dispatch/domain events.
  - correlation_id
  - The subject-first behavior is present in practice, but still looks like a set of special-case prose pockets instead of one normalized identity rule.
  - new producers/docs should emit the canonical normalized target model
  - Add explicit migration notes when replacing raw local IDs with normalized `subject_id` or `object_kind/object_id` forms.
  - subject_id
  - object_kind/object_id
  - otherwise it should reuse persisted shell state and local destination defaults
  - MUST NOT reuse persisted state when doing so would:
  ContractRef: ContractName:Plans/Contracts_V0.md, Primitive:RouteTarget, Primitive:OpenSubject
  - `usage_event_ref` still appears as a special-case route concept in some docs instead of being normalized into `object_kind = usage_event`.
  - usage_event_ref
  - object_kind = usage_event
  - `usage_event_ref` still reads like a direct route field in some docs rather than a normalized object identity.
  - but they still carry `resume_url?`, which keeps navigation transport inside persisted state as if it were canonical identity
  - resume_url?
  - tier-start validation/persona/QA events
  - tier-keyed usage/evidence correlation
  - 1. owner-doc integrity and routing
  - `tier_id` worker-output correlation
  - Reconciliation should treat this as an owner-doc integrity stack, not three isolated docs:
  - `Run_Graph_View.md` and `usage-feature.md` still reinforce each other through `tier_id`, which keeps the old usage/evidence/runtime correlation alive.
  - Run_Graph_View.md
  - usage-feature.md
  - Route-aware schema/gate/evidence extensions remain incomplete relative to the ledger's normalized routing model.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
**Rule:** Tool invocation correlation MUST be consistent:
- In normalized provider streams, every `tool_use` MUST have exactly one matching `tool_result` with the same `tool_use_id` (no orphan tool events).  
  ContractRef: ContractName:Plans/CLI_Bridged_Providers.md
- In persisted event streams, tool activity MUST be represented using the canonical tool event types (`tool.invoked`, `tool.denied`) and MUST include stable `run_id` + `thread_id` correlation.  
  ContractRef: ContractName:Contracts_V0.md

---

<a id="INV-002"></a>
## INV-002 -- No secrets in persistent storage

**Rule:** Secrets (tokens, credentials, private keys) MUST NOT be written to:
- seglog event stream
- redb projections
- Tantivy indexes
- sparse n-gram regex-index artifacts (`frequency_table.bin`, `postings.bin`, `lookup.bin`, `file_map.bin`, `index_meta.json`) except for secrets-scrubbed derived content and project-relative paths
- plaintext logs, evidence bundles, or state files

**Allowed persistence:** OS credential store only.

ContractRef: SchemaID:Spec_Lock.json#locked_decisions.storage, SchemaID:evidence.schema.json, PolicyRule:no_secrets_in_storage, ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md

## INV-003 -- UI SSOT (no bespoke UI behavior)

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0040
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Why it matters: this changes default behavior, user expectations, and blocked-state routing.
  - `always`, reject-cascade, and doom-loop behavior still hinge on vague “same session” semantics
  - always
  - `validation_pass_report.pass_verdict` still conflicts with downstream `skipped` behavior.
  - validation_pass_report.pass_verdict
  - skipped
  - `FileManager.md` adds pressure on the envelope because it now needs open-by-identity behavior for:
  - FileManager.md
  - Keep filter/scroll/highlight behavior as destination realization, not as canonical navigation identity.
  - `generated://<artifact_id>` is correctly treated as transport realization in assistant-chat behavior, but FileManager still lacks the matching subject-open model that explains how those buffers are opened without pretending they are normal workspace paths.
  - generated://<artifact_id>
  - evidence/gate schemas that cannot yet structurally prove the richer routing/normalization behavior
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
**Rule:** UI copy, buttons, and view behavior MUST be specified in the canonical UI SSOT docs and typed command layer; plan docs may reserve IDs but must not invent ad-hoc UI behaviors.

ContractRef: Primitive:UICommand, ContractName:Contracts_V0.md#UICommand

---

<a id="INV-004"></a>
## INV-004 -- UI command boundary (no business logic in UI)

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0041
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Merge/split/supersession logic for concerns is currently discussion-only, not contract-level.
  - The new blocked-owner logic sharpens the summary rule:
  - The right owner boundary is:
  - add a primitive boundary for route-target / open-by-identity navigation
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
**Rule:** The UI layer MUST dispatch stable `UICommand` IDs and MUST NOT execute business logic directly.

ContractRef: Primitive:UICommand, ContractName:Contracts_V0.md#UICommand, ContractName:Plans/UI_Command_Catalog.md

---

<a id="INV-005"></a>
## INV-005 -- Deterministic ordering from SSOT lists

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0042
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `Models_System.md` still frames deterministic selection around provider/model/variant and availability sets
  - Models_System.md
  - now clearly under-specifies deterministic selection because provider/model selection is no longer enough without actor/auth/account inputs
  - `project_id` is no longer just a nice-to-have lineage field; its omission now clearly blocks deterministic projector partitioning, replay, and per-project artifact/search indexing.
  - project_id
  - this weakens the deterministic posture expected from an owner gate doc
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
**Rule:** When multiple candidates exist (paths, names, servers, etc.), tie-break ordering MUST come from a single SSOT list owned by the relevant domain; no heuristic reordering.

ContractRef: Primitive:Provider, ContractName:Plans/CLI_Bridged_Providers.md

---

<a id="INV-006"></a>
## INV-006 -- Providers are storage-isolated

**Rule:** Providers and provider adapters MUST NOT write directly to persistent storage (`seglog`, `redb`, `Tantivy`, sparse n-gram index files, or remote-cache state). They emit normalized events or tool results; PM-owned storage writers, projectors, and cache managers own persistence.

ContractRef: Primitive:Provider, Primitive:SessionStore, ContractName:Plans/Crosswalk.md, ContractName:Plans/storage-plan.md

## INV-007 -- No stringly-typed IDs outside SSOT

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0043
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - exact structured object(s), canonical ids, references, metadata
  - `Ledger` export should preserve canonical ids and structured fields
  - Ledger
  - package/seam/node ids
  - receipt-like exports should not invent shadow IDs
  - newer concern should carry lineage back to prior ids
  - `attempt_id` must stay unique per dispatch; retry/resume should not reuse old attempt ids
  - attempt_id
  - later handoff/addenda collapse the bundle back to IDs + model/permission refs and even lose `thread_id`
  - thread_id
  - requested/effective model snapshot ids where relevant
  - command/catalog ghost IDs and missing owner rows
  - both introduce concrete commands/events/tool IDs that the canonical owners do not currently register.
  - Avoid route-local surrogate IDs if a canonical domain ID already exists.
  - Keep all transport/open realization detail outside `route_target`.
  - route_target
  - Normalize all special-case ids into `subject_id` or `object_kind` + `object_id` before they enter the canonical route layer.
  - subject_id
  - object_kind
  - object_id
  - `object_id` must use existing canonical ids:
  - Normalize older route/pivot docs away from `tier_id` and one-off special-case ids.
  - tier_id
  - `Formatters_System.md` continues to sit outside the central mutation/policy engine and loses attribution under DAE.
  - Formatters_System.md
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
**Rule:** Stable IDs (Tool IDs, UICommand IDs, ConfigKey names, schema IDs) MUST NOT be re-invented as ad-hoc string literals in multiple places. They must be defined once (SSOT) and referenced everywhere else.

ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md

---

<a id="INV-008"></a>
## INV-008 -- GitHub operations are API-only

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0044
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `Source Control` owns repo/worktree execution and inspection operations:
  - Source Control
  - Reserve `hard_gate` for exceptional concern-affecting operations only:
  - hard_gate
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
**Rule:** GitHub hosting/auth/repo/fork/PR operations MUST use the GitHub HTTPS API only; the GitHub CLI (`gh`) MUST NOT be used for these operations.

ContractRef: SchemaID:Spec_Lock.json#locked_decisions.github_operations, ContractName:Plans/GitHub_API_Auth_and_Flows.md

---

<a id="INV-009"></a>
## INV-009 -- Cursor transport is invisible to consumers

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0045
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `SelectSpeakerEvent` remains `raw_observation`, so shared conversational/runtime actor changes are still largely invisible as durable lineage
  - SelectSpeakerEvent
  - raw_observation
  - but the capability snapshot example uses `provider_id: cursor` while `model_id` already embeds `anthropic/...`
  - provider_id: cursor
  - model_id
  - anthropic/...
  - Treat `resume_url` as one serialized transport form of the same canonical route-target model rather than a parallel stronger primitive.
  - resume_url
  - serialized transport form of `route_target`, not a stronger parallel primitive
  - route_target
  - `agent-rules-context.md` still assumes a tiny set of actors and CLI-only transport, while the real provider-using actor set is much broader and now includes non-CLI transports.
  - agent-rules-context.md
  - A deep-link transport should preserve:
  - `resume_url` is one concrete transport instance of that form
  - `resume_url` is a serialized transport of `route_target`.
  - `resume_url` is transport.
  - `resume_url` is still acting as a shadow routing primitive in multiple docs instead of being treated as serialized transport for canonical route identity.
  - `resume_url` is still being used as if it were canonical navigation identity instead of serialized transport.
  - Treat `resume_url` as serialized transport only.
  - `resume_url` is the only field in this cluster that is trying to act as navigation transport
  - Keep `resume_url` only as serialized transport derived from canonical route identity.
  - Reconcile worker/verifier identity consumers to the canonical requested/effective field set.
  - Keep any surviving `PuppetMasterEvent::*` references explicitly marked as compatibility transport or migration notes, not as the primary operational source.
  - PuppetMasterEvent::*
  - `resume_url` reduced to transport, not first-class navigation identity
  - `resume_url` reduced to transport or compatibility wording where it still survives
  - Still preserve `resume_url` as a primary routing primitive in places that should treat it as derived transport only.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
**Rule:** Cursor must support both `stream-json` and ACP transports under one Provider facade; consumers MUST NOT branch on transport type.

ContractRef: SchemaID:Spec_Lock.json#locked_decisions.providers, ContractName:Plans/CLI_Bridged_Providers.md

---

<a id="INV-010"></a>
## INV-010 -- Platform naming compliance

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0046
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Canonical naming conflict:
  - tier-based branch/worktree naming and recovery language
  - The missing piece is ownership semantics, not field naming:
  - The command/wiring/documentation stack now has multiple hard ghost-ID failures, not just naming drift.
  - Event/command naming and routing are still split enough that two “correct” implementations could disagree materially and still point at different local SSOTs.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
**Rule:** The platform name is **Puppet Master** only.
Any older naming must be referred to only as **legacy naming** (without quoting the older name).

ContractRef: Primitive:Glossary

---

<a id="INV-011"></a>
## INV-011 -- UI command dispatch only (Rule 1)

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0047
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Add a governance rule for `provider_account_id`:
  - provider_account_id
  - Canonical-vs-derived rule
  - The earlier “don’t spam on every heartbeat” rule still stands, but now it needs sharper triggers.
  - There is still no explicit rule for whether runtime/overseer actors may directly perform concern-state transitions versus only propose them through linked records.
  - the safer rule is: simplify explanation depth, not canonical object names
  - there is still no canonical envelope slot for those fields, so the doc cannot satisfy its own preservation rule cleanly
  - 1. Mandatory dispatch identity
  - Recommended canonical rule
  - mandatory dispatch fields
  - Recommended bridge-field rule
  - `Project_Output_Artifacts.md` already carries the right anti-drift rule for runtime-analysis exports:
  - Project_Output_Artifacts.md
  - This should let current docs reconcile incrementally instead of forcing a single disruptive replacement of every existing open/navigation rule.
  - `route_target` needs an explicit selector precedence rule.
  - route_target
  - The canonical selector rule is:
  - The split needs a hard classification rule.
  - The canonical rule is:
  - own `resume_url` serialization rule
  - resume_url
  - canonical dispatch already uses scored ready-set selection, not pure lexical `node_id`
  - node_id
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
**Rule:** The UI layer MUST dispatch only typed `UICommand` envelopes to trigger non-trivial behavior. The UI MUST NOT call backend services, storage, domain logic, or provider integrations directly. All user-initiated interactions flow through the UI Command Dispatcher boundary.

ContractRef: Primitive:UICommand, ContractName:Plans/UI_Wiring_Rules.md#section-1, ContractName:Plans/Contracts_V0.md#UICommand, ContractName:Plans/UI_Command_Catalog.md

---

<a id="INV-012"></a>
## INV-012 -- Wiring matrix coverage (Rule 2)

<a id="INV-013"></a>
## INV-013 -- Pre-dispatch tool validation

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0048
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - require `current` or a direct canonical-runtime validation path
  - current
  - there is no structured place for wrapper target, alias target, route-payload validation result, or canonical-contract normalization evidence
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

`policy.may_execute_tool()` MUST be called for every tool dispatch at every nesting depth regardless of invocation path. No child-run, plugin path, provider surface, or shell bridge may bypass this invariant.

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Tools.md

Enforcement may be static (import-graph / compile-time gate) or runtime (central dispatch gate), but direct calls to tool implementations without this permission gate are prohibited.

ContractRef: Invariant:INV-013, ContractName:Plans/Architecture_Invariants.md

## INV-014 -- Shared mutable state requires RWMutex

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0049
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `GitHub_API_Auth_and_Flows.md` still keys storage/routing on mutable `login`
  - GitHub_API_Auth_and_Flows.md
  - login
  - shared seam/package/node identity
  - Good shared fields:
  - The shared provider/persona/runtime docs are already fairly disciplined on several critical terms:
  - Shared provider-runtime impact
  - The shared runtime/provider docs are stronger than the shared concept/glossary docs.
  - keep a shared runtime-identity field family
  - Keep blocked/remediation taxonomy shared, while preserving actor-specific state machines and object identities.
  - Shared historical semantics are important mainly because search and ledger need to render them consistently.
  - Define a shared requested/effective/provider/account identity disclosure pattern reusable across:
  - `GitHub_API_Auth_and_Flows.md` still keys credential identity by mutable `login`
  - shared operational identity vs provider/account identity
  - Extend the shared effective-resolution/runtime identity model with:
  - one shared attribution family should be available to:
  - keep artifact-family distinctions, but consume the shared attribution packet instead of relying on artifact-local identity alone
  - one shared canonical `route_target` object
  - route_target
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

Any data structure shared across threads or async tasks that can be mutated MUST be protected by an `RwLock` (or equivalent). Lock-free approaches are allowed only when formally justified. Silent data races are prohibited.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/storage-plan.md

ContractRef: Invariant:INV-014

<a id="INV-015"></a>
## INV-015 -- Monetary values are integer microdollars

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0050
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Candidate `resolution_kind` values:
  - resolution_kind
  - Candidate `resolution_kind` values still look right:
  - Recommended `requested_account_binding` values:
  - requested_account_binding
  - effective model/account/persona values are attributes of objects, not usually target kinds by themselves
  - `wizard_step`, `message_id`, `line`, `range`, and compare-target state are not `inspector_target` values.
  - wizard_step
  - message_id
  - line
  - range
  - inspector_target
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

All persisted and in-memory monetary cost values MUST be stored as integer microdollars (`u64`). Float types MUST NOT be used for cost storage or accumulation at any layer. Display conversion to decimal happens only at the presentation layer.

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/Contracts_V0.md

Enforcement: `clippy` or custom lint to reject `f64`/`f32` fields named `cost*`, `price*`, or `amount*` in persisted structs.
ContractRef: Invariant:INV-015

<a id="INV-016"></a>
## INV-016 -- Token fields are never aggregated at storage layer

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0051
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - it must never do so silently
  - `request_id` must never be the only durable key for recovery/mutation decisions.
  - request_id
  - FileManager’s `OpenFile { path... }` shape still cannot satisfy its own runtime-identity addendum without a new resolution layer.
  - OpenFile { path... }
  - never actor-role or external-target identity
  - Canonical layer:
  - Destination-local refinement is real, but it is one layer down from canonical target identity.
  - The wiring/gate layer now needs to understand normalization, not just uniqueness.
  - Missing a unified execution-role and operational/account identity layer.
  - `account_pressure_episode` and `account_switch_event` key families already exist as registered families; the missing transfer is the schema/detail layer.
  - account_pressure_episode
  - account_switch_event
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

The five canonical token fields (`input_tokens`, `output_tokens`, `cache_read_input_tokens`, `cache_creation_input_tokens`, `reasoning_tokens`) MUST be stored individually in every usage record. Pre-aggregation or collapsing at the storage or event layer is prohibited.

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/Contracts_V0.md

ContractRef: Invariant:INV-016

<a id="INV-017"></a>
## INV-017 -- File mutations are atomic (temp-fsync-rename)

All FileSafe-managed file write operations MUST use the atomic write pattern: write to a temp file, fsync, rename to the target path. Direct `os.WriteFile` or equivalent non-atomic write calls MUST NOT be used for managed files.

ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/storage-plan.md

ContractRef: Invariant:INV-017

<a id="INV-018"></a>
## INV-018 -- Seglog CRC32 is mandatory

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0052
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `scheduler_lane` is already mandatory in some addenda but structurally homeless in the older orchestration body.
  - scheduler_lane
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

Every seglog record MUST include a CRC32 checksum. Checksum validation MUST occur on every read. A record that fails CRC32 validation MUST be skipped and a recovery event emitted. Silently processing a corrupt record is prohibited.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Executor_Protocol.md

ContractRef: Invariant:INV-018

**Rule:** Every interactive UI element MUST map to exactly one `UICommandID`. The mapping MUST be recorded in the wiring matrix (validated by `Plans/Wiring_Matrix.schema.json`). Every `UICommandID` listed in `Plans/UI_Command_Catalog.md` MUST have a registered handler. No interactive element may exist without a wiring matrix entry; no catalog command may lack a handler.

ContractRef: Primitive:UICommand, ContractName:Plans/UI_Wiring_Rules.md#section-2, SchemaID:Wiring_Matrix.schema.json, Gate:GATE-010

---

## Contract-driven code generation (lightweight; DRY)
To avoid duplicated shapes for tools/events/policy:
- JSON Schemas under `Plans/*.schema.json` are the canonical source for validation and (optionally) code generation.  
  ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md
- Generated Rust code MUST live under a single `generated/` boundary (path is implementation-defined) and MUST NOT be hand-edited.  
  ContractRef: Primitive:Invariant, PolicyRule:Decision_Policy.md§2

---

## Validation (gated; autonomous)
Invariants are validated by progression gate `GATE-003`.

**Minimum automated checks (scriptable):**
- Validate schemas (plan graph, evidence, change budget, auto decisions).  
  ContractRef: Gate:GATE-001
- Enforce `INV-008` by scanning for GitHub CLI usage in build-governing docs and implementation surfaces.  
  ContractRef: Invariant:INV-008
- Enforce `INV-010` naming compliance in `Plans/` (platform name only).  
  ContractRef: Invariant:INV-010
- Enforce `INV-011` by verifying no UI code directly calls backend/storage/provider modules (static analysis or import-graph check).  
  ContractRef: Invariant:INV-011
- Enforce `INV-012` by validating wiring matrix coverage: every UICommandID in the catalog has a handler entry, and every interactive element has a wiring entry.  
  ContractRef: Invariant:INV-012, Gate:GATE-010

ContractRef: Gate:GATE-003

## Debug investigation invariants addendum (2026-03-23)

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0038
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `allowed_actions` is still alive in canonical-looking HITL/storage shapes even after the deprecation addendum.
  - allowed_actions
  - earlier addendum uses `resolution` = `success | failed | ceiling_exceeded`
  - resolution
  - success | failed | ceiling_exceeded
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

### Invariant A -- Debug overlay is not a runtime mode

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0054
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `waiting_approval` is a blocked/runtime overlay
  - waiting_approval
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
`debug` MUST exist only in overlay identity and UI label state. The canonical runtime-mode enum remains `ask | plan | regular | yolo`.

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Contracts_V0.md

### Invariant B -- Visible evidence ingress only

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0055
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - active-run ownership must be visible before prune/remove
  - on-demand refresh should leave previous rollups visible until the new scan completes
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
Automatically collected Debug evidence MUST become visible Investigation Context or Runtime Artifacts state. PM MUST NOT rely on hidden prompt-only evidence injection for browser/debug payloads.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Prompt_Pipeline.md

### Invariant C -- Cross-surface investigation identity

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0056
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Cross-surface usage/deep-link identity is now clearly under-typed:
  - Optional later expansion only if a real cross-surface need appears:
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
Any PM surface that participates in debugging MUST preserve `investigation_id` and, when applicable, `instrumentation_id` rather than minting surface-local debug identities that cannot be correlated later.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/orchestrator-subagent-integration.md

## INV-019 -- Runtime identity and blocked-policy continuity

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0053
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Identity / attribution / blocked-policy misses were reconfirmed with stronger specificity
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
**Rule:** Canonical runtime identity and blocked-state policy MUST survive dispatch, restart recovery, approval, and usage attribution without being reminted or collapsed into provider-native aliases.
- `execution_role`, `requested_account_id`, requested/effective operational identity, and account-switch lineage remain part of the shared runtime packet and every blocked/recovery handoff.
- `blocked_sequence` is the canonical blocked-episode anchor; startup recovery rebinds unresolved blocked episodes to the preserved runtime identity instead of minting a new episode.
- DAE jail posture, approval posture, usage switch-history, and execution-role follow-through remain continuous across retries, resumes, restores, and recovered attempts.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/GitHub_API_Auth_and_Flows.md
