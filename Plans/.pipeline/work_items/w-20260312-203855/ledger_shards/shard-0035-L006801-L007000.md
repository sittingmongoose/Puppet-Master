- `CLI_Bridged_Providers.md` imposes shared-runtime snapshot language and multi-account capability declarations on direct providers but leaves bridged providers exempt by omission.
- `Multi-Account.md` requires switch notifications/history semantics that `storage-plan.md`, `Prompt_Pipeline.md`, and bridged-provider stream contracts still cannot represent durably.
- `Permissions_System.md` still treats session cache and reject-cascade as globally session-scoped, which directly conflicts with multi-lane isolation and shared-runtime actor separation.

### Candidate fixes to carry forward
- Add `requested_account_id?`, `effective_account_id?`, execution-scope fields, and `actor_kind` / `execution_role` to the shared runtime identity bundle and to the bridged-provider envelope.
- Replace tier-era persisted names/values in `Prompt_Pipeline.md` and `Personas.md` before they become entrenched in durable records.
- Define a canonical switch-history / pressure-episode family and make it queryable from History, Ledger, Usage, and Account/Usage Pressure projections.
- Add a canonical role enumeration and apply it consistently to role-scoped account policies, Persona resolution, permission scoping, and provider dispatch.
- Re-scope permission session cache / reject cascade and OpenCode SSE/session isolation rules to actor/lane-aware boundaries.

### Do-not-forget details
- `manual_preferred_account_id` now exists, but it still does not solve the broader missing `requested_account_id` asymmetry in runtime records.
- `provider_account_id` remains dangerous unless it is explicitly treated as audit/display-only metadata subordinate to stable internal account identity.
- `Provider_OpenCode.md` and `CLI_Bridged_Providers.md` are now the sharpest places where the rewrite can silently lose account identity and execution-scope attribution before projections ever see the data.
- `Permissions_System.md` now has multiple concrete misbehavior risks under parallelism, not just abstract schema drift.

## Research Progress - 2026-03-16 - GPT-5.2 UI / Projection Follow-Through

### Targeted docs read
- `Plans/usage-feature.md`
- `Plans/Orchestrator_Page.md`
- `Plans/GitHub_Integration.md`
- `Plans/Widget_System.md`
- `Plans/storage-plan.md`
- `Plans/Runtime_Artifacts_Panel.md`
- `Plans/UI_Command_Catalog.md`
- `Plans/Run_Graph_View.md`

### Key findings
- Cross-surface usage/deep-link identity is now clearly under-typed:
  - `storage-plan.md` promotes `usage_event_ref?` into receipt and cross-surface bridge records but still never defines its concrete format or stability semantics
  - `Runtime_Artifacts_Panel.md` requires `Show in Ledger` / `Show in Usage` for `cost_usage`, but the promised runtime-artifact schemas are not present and no concrete usage identity payload is pinned
  - `Orchestrator_Page.md` and `Run_Graph_View.md` still route `View in Usage` by `run_id` or `tier_id`, not by receipt/attempt/usage-event identity
- GitHub integration still lacks the project/repo/account scoping contract the rewrite now needs:
  - `storage-plan.md` already has `selected_repo_id` and project-scoped `provider_accounts.*` policy state
  - `GitHub_Integration.md` still treats current repo selection and effective GitHub account as implicit rather than canonical
  - Deferred GitHub Recovery Binding now fits more naturally as blocked-episode `detail_ref` / wizard-blocked attachment than as a new standalone runtime object
  - cache scoping still needs `{project_id, selected_repo_id, effective github_api account}` to avoid cross-root or cross-account ambiguity
- Widget/page persistence and hostability are still materially under-owned:
  - `Orchestrator_Page.md` TOC sections 13–17 are genuinely missing, not relocated
  - `Widget_System.md` still splits terminal widgets between `widget.terminal_output` and `widget.agent_terminal`
  - Orchestrator-owned worktree partitioning still exists only as row metadata (`owner run/tier`) in Source Control docs, not as a canonical grouping/partition contract
  - widget layouts still need project-scoped keys rather than implicit global layouts for project-heavy surfaces
- The repo now has a clearer mechanical basis for projection trust than the docs admit:
  - `storage-plan.md` already grounds freshness in committed projection state, checkpoints, and receipts
  - Usage already models user-facing stale-data mitigation
  - but there is still no shared `ProjectionHealth`/trust contract spanning Usage, Orchestrator, Source Control, and widgets
- Live widget and page contracts still need attempt-/lane-/session-aware attribution rather than tier-only routing:
  - stable live identity now centers on `attempt_id`, receipt refs, `scheduler_lane`, `worktree_id`, and requested/effective identity per attempt
  - page/widget contracts still mostly speak in `tier_id` terms, which will collapse concurrent actors and remediation lanes into misleading “current work” summaries

### Highest-risk impacted docs
- `Plans/Orchestrator_Page.md`
  - still missing core persistence/acceptance sections and still under-specifies historical mode, worktree partitioning, and precise usage/deep-link behavior
- `Plans/Widget_System.md`
  - still needs project-scoped layout rules, terminal-widget normalization, projection-trust chrome, and attempt/lane-aware live data contracts
- `Plans/GitHub_Integration.md`
  - still needs explicit binding to project-scoped repo/account selection, degraded-trust signaling, and blocked-episode recovery linkage
- `Plans/storage-plan.md`
  - now clearly owns the missing bridge semantics for `usage_event_ref`, projection freshness, receipt pivots, and project-scoped UI state, but has not finished naming them
- `Plans/Run_Graph_View.md` + `Plans/Runtime_Artifacts_Panel.md`
  - still lack the concrete receipt/usage identity and projection-trust hooks their cross-surface actions now depend on

### Contradictions / gaps surfaced
- `usage_event_ref?` is treated as the canonical bridge name in storage/receipt rules, but no doc actually defines what it is.
- `Runtime_Artifacts_Panel.md` assumes concrete runtime-artifact schema enforcement that is not currently present in the repo.
- `Orchestrator_Page.md` and `Run_Graph_View.md` still pivot usage and identity with `tier_id`-centric addressing even though storage/runtime contracts have moved to attempt/receipt-based truth.
- `GitHub_Integration.md` still lacks an explicit current-repo / current-account contract even though `storage-plan.md` already models `selected_repo_id` and project-scoped account policy state.
- `Widget_System.md` and `Orchestrator_Page.md` still disagree on terminal widget identity and broader Progress/Dashboard hostability details.

### Candidate fixes to carry forward
- Define `usage_event_ref` explicitly and make all `Show in Usage` / `Show in Ledger` pivots prefer receipt + attempt + usage-event identity over run-only or tier-only filters.
- Add a shared projection-health / trust-state record family built from committed projection state, checkpoints, and last-updated metadata.
- Make widget layouts project-scoped for project-centric surfaces, with a limited global fallback only when no project is open.
- Normalize terminal widget IDs/hostability and explicitly decide how Orchestrator-owned worktree state is grouped in Source Control.
- Bind GitHub Integration to project-scoped `selected_repo_id` and `provider_accounts.*` state, and fold Deferred GitHub Recovery Binding into canonical blocked-episode detail paths.

### Do-not-forget details
- The missing `usage_event_ref` definition is now a hard blocker for trust-safe cross-surface navigation, not just a naming cleanup.
- The promised runtime-artifact schemas are absent today, so any linkage that depends on them is currently documentation-only.
- `selected_repo_id` already exists in storage planning; the gap is now in UI contract adoption, not in basic storage vocabulary.
- Projection trust should be derived from committed state and receipts, not reinvented per page with ad-hoc polling language.

## Research Progress - 2026-03-16 - Sonnet Stream / A2A Schema Recheck

### Targeted docs read
- `Plans/Provider_Stream_Mapping_External_Reference_A2A.md`
- `Plans/CLI_Bridged_Providers.md`
- `Plans/Contracts_V0.md`
- `Plans/Executor_Protocol.md`
- `Plans/Multi-Account.md`
- `Plans/human-in-the-loop.md`
- `Plans/storage-plan.md`
- `Plans/Architecture_Invariants.md`

### Key findings
- `tier_boundary` is not just stale prose here; it is a reserved diagnostic category with hard detail keys (`from_tier` / `to_tier`). That means the tier model is still embedded at the stream-schema layer and cannot be reconciled by a simple terminology sweep.
- The Overseer audit protocol is structurally incompatible with the rewrite:
  - singular `Overseer`
  - `audit_kind = start_of_tier | end_of_tier`
  - hard `exactly 2 reviewer subagents`
  - no minority-advisory outcome for the now-required 2-of-3 corroboration pattern
- The doc internally contradicts itself on attempt continuity:
  - 2026-03-09 addenda say normalized streams MUST preserve `attempt_id`
  - but none of the reserved diagnostic category schemas actually expose `attempt_id`
  - adapters currently have no canonical way to satisfy both requirements at once
- Multi-account and blocked-owner semantics are still lost at the stream boundary:
  - `usage` events carry no account attribution
  - `auth_state` carries no pool-member / account context for failover rotation
  - `input_required` / `input_provided` cannot distinguish node HITL, corroboration pause, or conversational user-input pause
- Shared provider runtime still lacks actor-class disclosure in the normalized stream:
  - no `actor_kind`
  - `handoff` uses bare agent names with no package/seam/lane context
  - `SelectSpeakerEvent` is demoted to `raw_observation`, which hides governance-relevant speaker/overseer transitions from downstream projections

### Highest-risk impacted docs
- `Plans/Provider_Stream_Mapping_External_Reference_A2A.md`
  - now clearly a schema-owner doc that will need a versioned migration, not only prose cleanup
- `Plans/CLI_Bridged_Providers.md`
  - must decide whether these field additions are V0 extensions or a V1 event contract
- `Plans/Contracts_V0.md`
  - canonical requested/effective identity and blocked-owner payloads still do not round-trip through the stream adapter
- `Plans/Multi-Account.md`
  - requires per-interaction account attribution and switch/failover reasoning that the stream cannot currently express
- `Plans/human-in-the-loop.md` + `Plans/Executor_Protocol.md`
  - both now depend on richer blocked-owner / audit-scope vocabulary than the stream exposes today

### Contradictions / gaps surfaced
- The tier model is still encoded in reserved stream categories even where planning docs now move to package/seam/lane authority.
- The A2A addenda require `attempt_id` continuity, but the schema anchor never permits it explicitly.
- `usage` and `auth_state` events still cannot support correct multi-account attribution or failover routing.
- Stream consumers still cannot tell whether an event came from a node worker, package overseer, seam overseer, chat assistant, interviewer, or builder.
- The §9 auditability guarantee is now false under the rewrite unless the audit protocol itself is redesigned.

### Candidate fixes to carry forward
- Introduce a versioned replacement for `tier_boundary` such as `governance_boundary`, keeping compatibility aliases only as an explicit migration strategy.
- Add `attempt_id` to the reserved diagnostic schemas that represent execution, audit, handoff, and HITL events, and back it with a new architecture invariant for attempt continuity.
- Extend the stream/event contract with account attribution, actor kind, blocked-owner context, and package/seam/lane identity where downstream projections depend on them.
- Rewrite §9 around dual-overseer / corroboration reality rather than layering more addenda onto the current singular-Overseer protocol.
- Promote governance-relevant speaker/handoff selections out of `raw_observation` when they affect orchestration projections or audit reconstruction.

### Do-not-forget details
- This seam now needs explicit contract-version governance; otherwise adapter-local shadow fields will proliferate.
- Multi-account attribution and projection trust are coupled here: stale projections plus account-less stream events leave no trustworthy account-pressure signal at all.
- `minority_advisory` is now conceptually required by the research, but it still has no canonical stream/event name.

## Research Progress - 2026-03-16 - GPT-5.3-Codex Contract / Actor Envelope Hotspot

### Targeted docs read
- `Plans/Contracts_V0.md`
- `Plans/storage-plan.md`
- `Plans/usage-feature.md`
- `Plans/Run_Graph_View.md`
- `Plans/Runtime_Artifacts_Panel.md`
- `Plans/UI_Command_Catalog.md`
- `Plans/assistant-chat-design.md`

### Key findings
- The canonical contract layer still has unresolved intra-doc collisions, not just downstream drift:
  - `Contracts_V0.md` still conflicts with itself on remediation resolution enums and on safe-point / scheduler payload shapes
  - storage and UI consumers now have no single obviously-canonical payload block for scheduler, safe point, and remediation lineage
- The rewrite now clearly needs an actor envelope broader than `run_id`:
  - `storage-plan.md` still keys provider account snapshots as `provider_accounts.run_snapshot.{run_id}.{provider_id}`
  - but requested/effective account resolution already spans thread/chat/interview/wizard/non-run actors
  - Codex sharpened that the missing minimum envelope is now `project_id` + `actor_kind` + sparse actor refs (`run_id?`, `attempt_id?`, `thread_id?`, `wizard_id?`, `interview_id?`) plus requested/effective runtime/account fields
- Cross-surface receipt and usage routing are now under-specified in exact, actionable ways:
  - `storage-plan.md` internally contradicts itself because the early `orchestrator.receipt.{run_id}.{attempt_id}` value shape omits `project_id` and `created_at_utc`, while the later cross-surface receipt record makes them mandatory
  - `usage-feature.md` sharpened that the canonical pointer should be `usage_event_ref`, not a new opaque `usage_event_id`
  - `usage_event_ref` now needs one authoritative schema because artifacts, receipts, Usage, Ledger, and chat pivots all rely on it already
- Run Graph still has concrete command/routing contract drift:
  - `cmd.graph.approve_hitl` / `deny_hitl` arguments do not match `UI_Command_Catalog.md` (`request_id` mismatch)
  - graph-local recovery IDs still conflict with the canonical `allowed_action_ids[] -> cmd.runtime.*` model
  - cross-surface open commands are required in prose but not bound in the Run Graph command section
  - no projection-trust payload exists for mutating or cross-surface actions on stale/degraded graph projections
- Concern and trust ownership are still only partial:
  - remediation-linked `finding_refs[]` can carry some node concern rendering immediately
  - but non-remediation concern posture, projection freshness, and degraded-action gating still lack a single contract owner at the canonical layer

### Highest-risk impacted docs
- `Plans/Contracts_V0.md`
  - still the primary SSOT for canonical payloads, but now clearly needs addendum consolidation plus actor-envelope ownership
- `Plans/storage-plan.md`
  - now owns the sharpest receipt/actor-snapshot contradictions and needs a project+actor-aware canonical cross-surface receipt contract
- `Plans/usage-feature.md`
  - now clearly depends on a defined `usage_event_ref` schema and a single scope-precedence envelope
- `Plans/Run_Graph_View.md`
  - still has exact command-arg mismatches, legacy recovery namespaces, and no trust/action-gating payload
- `Plans/UI_Command_Catalog.md` + `Plans/Runtime_Artifacts_Panel.md`
  - both now depend on the same actor/receipt/usage envelope normalization work

### Contradictions / gaps surfaced
- `Contracts_V0.md` still self-conflicts on canonical remediation / safe-point / scheduler payloads.
- `storage-plan.md` still models durable provider account snapshots for runs but not for other actor classes that use the same provider runtime.
- `storage-plan.md` receipt row shape still conflicts with its own later minimum cross-surface receipt contract.
- `usage-feature.md` and related docs already rely on `usage_event_ref`, but no authoritative shape exists.
- `Run_Graph_View.md` still conflicts with `UI_Command_Catalog.md` on HITL args and recovery command namespaces.
- Projection trust and node concern posture still lack a compact canonical contract that page/widget consumers can reuse.

### Candidate fixes to carry forward
