  - `artifact_id?`
  - `attempt_id?`
  - `lane_id?`
  - `worktree_id?`
  - `filter_payload?`
  - `inspector_target?`
  - `scroll_target?`
  - `focus_behavior?`
- Treat `resume_url` as a serialized transport form of that route payload.
  - URL deep links decode into the same route model used by in-app command dispatch
  - stored `resume_url` fields can remain for portability, but must not imply a separate routing ontology
- Recommended command model:
  - keep stable object/action command IDs (`cmd.runtime.*`, `cmd.orchestrator.open_in_source_control`, etc.)
  - allow navigation/open/focus commands to carry or resolve into the canonical route payload
  - avoid proliferating bespoke “open/focus/show in” arg shapes when they are all just routes
- Add a stricter vocabulary rule:
  - route payload should use canonical surface/tab/object terms
  - generic `page: string` payloads should be retired or constrained where they currently hide non-canonical tab naming

### Do-not-forget details
- attention-center items should likely store either an inline route payload or a stable ref to one; they should not depend on ambient current UI state to open correctly
- search results and command-palette results should restore the same target context as deep links, not a watered-down approximation
- historical-run mode is part of routing context, not just a local UI toggle
- `cmd.panel.switch` can stay as a concrete command, but it should align with the richer route model rather than becoming a second navigation language

## Research Progress - 2026-03-16 - GPT-5.2 Identity Semantics / Role-Routing Clarifications

### Targeted docs read
- `Plans/Multi-Account.md`
- `Plans/Models_System.md`
- `Plans/Personas.md`
- `Plans/Prompt_Pipeline.md`
- `Plans/Contracts_V0.md`
- `Plans/storage-plan.md`
- `Plans/Orchestrator_Page.md`
- `Plans/Run_Graph_View.md`
- `Plans/usage-feature.md`

### Key findings
- The rewrite now needs one explicit **operational identity** layer in addition to provider-account identity:
  - `Multi-Account.md` already distinguishes identities like `github_api`, registry identity, and Kubernetes context
  - but the shared effective-resolution record still only models provider/model/persona/auth/account identity
  - GPT-5.2 sharpened that Orchestrator rewrite must not collapse provider account identity and operational side-effect identity into one field family
- `Models_System.md` still contains a concrete naming collision between **transport host** and **upstream provider**:
  - canonical model IDs treat `provider_id` as upstream provider slug
  - but the capability snapshot example uses `provider_id: cursor` while `model_id` already embeds `anthropic/...`
  - this now creates a direct requested/effective identity rendering risk for Orchestrator, Chat, and History surfaces
- The missing role dimension is now clearly the link between account routing and auditability:
  - role-scoped pools already exist in storage and Multi-Account selection rules
  - but the effective runtime record, usage records, and page/graph identity projections still lack a canonical `execution_role` / `actor_role` field
  - without it, role-based account choices cannot be explained after the fact even when requested/effective account fields exist
- Prompt Pipeline still has the sharpest canonical gap for requested-vs-effective truth:
  - `requested_account_policy` exists
  - `effective_account_id` exists
  - but there is still no canonical requested concrete-account field, so explicit account pinning cannot be shown truthfully when runtime falls back or switches
- GPT-5.2 reinforced that switch-history remains under-owned as an event family, not just a missing view:
  - `account_switch_reason` and `recent_switch_reason` exist
  - but there is still no durable append-only switch/pressure timeline that History, Ledger, Usage, and Orchestrator can share
- `storage-plan.md` already uses `trust_tier` for Preview semantics, so the broader rewrite now needs a distinct projection-freshness name to avoid vocabulary collision when trust/degraded state is generalized across Orchestrator surfaces

### Highest-risk impacted docs
- `Plans/Prompt_Pipeline.md`
  - still needs requested concrete-account ownership plus explicit role/actor semantics in the canonical runtime record
- `Plans/Multi-Account.md`
  - now clearly needs a binding path from operational identity and role-scoped pools into the shared runtime grammar
- `Plans/Models_System.md`
  - now clearly needs transport/upstream naming cleanup to keep requested/effective identity deterministic
- `Plans/Contracts_V0.md` + `Plans/storage-plan.md`
  - likely owners for role-aware snapshots, operational-identity disclosure, and switch-history records
- `Plans/Orchestrator_Page.md` + `Plans/Run_Graph_View.md`
  - still consume stale persona names, tier-era pivots, and under-specified identity payloads

### Contradictions / gaps surfaced
- Operational identities are declared in Multi-Account, but not carried in the canonical runtime identity bundle.
- `Models_System.md` still mixes transport host and upstream provider in one `provider_id` vocabulary.
- Role-scoped routing exists in policy/storage but not in effective-resolution or usage schemas.
- `requested_persona_id` / `effective_persona_id` remain embedded in consumer docs despite canonical prohibition.
- Switch history is still reason fields without a durable event/projection family.
- `trust_tier` is already occupied by Preview, so projection-freshness trust needs a distinct name.

### Candidate fixes to carry forward
- Add an OperationalIdentity block or equivalent disclosure layer to the shared runtime identity grammar.
- Add a canonical requested concrete-account field distinct from `requested_account_policy`.
- Introduce `execution_role` / `actor_role` into effective-resolution, event, and usage contracts.
- Cleanly separate transport host fields from upstream provider/model identity in `Models_System.md` and adjacent bridge docs.
- Define an append-only account-switch / pressure-episode family with shared projection consumers.
- Rename or explicitly separate projection-freshness trust vocabulary from Preview `trust_tier`.

### Do-not-forget details
- Operational identities must be displayable with provider/account identity but must not imply shared token ownership.
- `usage_event_ref` + `attempt_id` remain safer pivots than `tier_id` for switch-aware usage/history views.
- If role-scoped routing is not surfaced in records, later projections will recreate it heuristically and drift immediately.

## Research Progress - 2026-03-16 - GPT-5.2 Bridge / OpenCode / Permission Scope Clarifications

### Targeted docs read
- `Plans/CLI_Bridged_Providers.md`
- `Plans/Provider_OpenCode.md`
- `Plans/Provider_Stream_Mapping_External_Reference_A2A.md`
- `Plans/Permissions_System.md`
- `Plans/Tools.md`
- `Plans/human-in-the-loop.md`
- `Plans/Executor_Protocol.md`

### Key findings
- `Provider_OpenCode.md` contains a direct identity-mapping bug at the contract level:
  - it maps canonical `thread_id` to an OpenCode session ID
  - while `CLI_Bridged_Providers.md` treats `thread_id` as the stable PM correlation id and separately allows provider-native identifiers
  - GPT-5.2 sharpened that OpenCode session IDs belong in provider-native correlation, not in canonical `thread_id`
- Bridge/event contracts are still too thin for rewrite-era correlation:
  - normalized envelopes remain minimal while later addenda require thread/node/attempt/lineage preservation
  - there is still no canonical slot for actor kind, effective account, switch reason, lane/worktree identity, or pressure/trust context
  - the A2A doc’s hard “no new categories” rule now blocks clean introduction of those semantics without version governance
- Provider/runtime boundaries still cannot express enough account-health state for shared account-pressure/degraded-trust UI:
  - `CLI_Bridged_Providers.md` normalizes auth lifecycle only
  - but Multi-Account needs configuration/availability/pressure/cooldown state, and Usage/Orchestrator need confidence-aware account-health projections
  - GPT-5.2 sharpened that this likely needs a distinct account-health / pressure event or record family instead of overloading auth-state
- Permissions are still under-specified for parallel actors:
  - session-scoped `always` approvals and reject-cascade rules have no actor/lane/run/account scope key
  - doom-loop “three consecutive times” semantics are ambiguous under interleaved concurrent execution
  - headless `ask -> deny unless HITL at current tier boundary` still leaks tier-era gating into what should now be normal blocked-overlay routing
- Permission snapshots still do not satisfy rewrite-era requested/effective disclosure:
  - the SSOT requires requested/effective capability truth
  - but the schema only records resolved/effective values and still omits requested state, downgrade reason, effective account, and actor/surface context
- GPT-5.2 also sharpened that bridged/provider docs still lack a legal place for opaque-but-real provider continuity fields like `provider_attempt_ref?`, which means reconnect/replay semantics remain under-specified even before account-switch history is added

### Highest-risk impacted docs
- `Plans/Provider_OpenCode.md`
  - needs immediate correction of canonical `thread_id` semantics and explicit upstream-account opacity rules
- `Plans/CLI_Bridged_Providers.md`
  - now clearly needs a versioned correlation/context block and stronger account-health semantics
- `Plans/Provider_Stream_Mapping_External_Reference_A2A.md`
  - now clearly needs version governance for new actor/account/trust categories or fields
- `Plans/Permissions_System.md`
  - needs scope-keyed approval semantics, de-tiered gating language, and richer permission snapshots
- `Plans/Contracts_V0.md` + `Plans/storage-plan.md`
  - likely owners for canonical correlation blocks, switch/pressure episodes, and blocked/approval identity linkage

### Contradictions / gaps surfaced
- OpenCode still repurposes canonical `thread_id` for provider-native session identity.
- Bridged envelopes still conflict with their own later correlation-preservation addenda.
- A2A still forbids new categories while the rewrite needs actor/account/trust/governance semantics at the stream layer.
- Permissions still use session-scoped approval logic without defining the session/actor/lane scope key.
- Permission snapshots still omit requested state and identity context despite rewrite-era requested/effective disclosure needs.
- Provider continuity fields like `provider_attempt_ref?` are named but still not owned by a stable schema slot.

### Candidate fixes to carry forward
- Move OpenCode session IDs to provider-native correlation fields and keep `thread_id` canonical to PM correlation.
- Add a versioned event/correlation context block for bridged runtimes and normalized streams.
- Introduce a canonical account-health / pressure / degraded-trust family rather than overloading auth lifecycle states.
- Define an Approval Scope Key for permissions keyed by actor/lane/run/account context.
- Upgrade permission snapshots to include requested/effective values, downgrade reasons, and identity context.
- Add explicit versioning/migration guidance to A2A before introducing new actor/account/trust semantics.

### Do-not-forget details
- `origin` is still audit-only; do not turn it into behavior-driving actor identity.
- A2A’s “input_provided” resume semantics are unsafe without actor/thread binding once multiple conversational actors share provider runtime.
- If provider continuity remains opaque, the docs need an explicit opaque contract instead of silent omission.
- Permission approval state must not leak across lanes or accounts just because actors share a UI session.

## Research Progress - 2026-03-16 - readiness posture and remaining-open-seams cluster

### Targeted docs read
- current `working_ledger.md`
- `Plans/FinalGUISpec.md`
- `Plans/Contracts_V0.md`
- `Plans/storage-plan.md`
- `Plans/Orchestrator_Page.md`

### Key findings
- The research has now moved a large portion of the rewrite from conceptual uncertainty into normalization work.
  - many core directions are stable enough
  - but several cross-doc authority gaps are still too sharp to call this ready for reconciliation yet
- The remaining work splits cleanly into two buckets:
  - **structural gaps still needing research decisions**
  - **reconciliation-heavy gaps where the direction exists but SSOT ownership/field naming/event families still conflict**
- The strongest structural gaps still open appear to be:
  - shared operational identity vs provider/account identity
  - requested concrete-account ownership
  - switch-history / pressure episode event family
  - projection-freshness vocabulary and ownership distinct from Preview `trust_tier`
  - exact authority rules for actor-driven vs user-driven concern transitions in some cases
- Most other seams now look more like reconciliation work than fresh design work:
  - native vs widget surface ownership
  - project-summary vs attention-item projections
  - route-payload normalization
  - historical overlay semantics
  - lane/worktree lifecycle split
  - help/glossary term ownership
  - concern record family and action policy
- A practical signal is emerging:
  - whenever a seam still depends on a missing canonical event/record family or a missing owner doc, it is not yet reconciliation-ready
  - whenever a seam mainly depends on updating stale consumers to match an already-set direction, it is approaching reconciliation territory

### Not-ready-yet indicators
- `Contracts_V0.md` and `storage-plan.md` still contain live contradictions or unowned gaps that would force reconciliation to invent answers:
  - `remediation.resolved` conflict
  - requested concrete-account gap
  - missing role/actor dimension in effective/runtime records
  - missing shared route-payload schema
