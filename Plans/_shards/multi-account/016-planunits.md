# Shard 016: PlanUnits

Source: `Plans/Multi-Account.md`

Source lines: L779-L4564

Source SHA256: `3f281fb746ae606cbb38b04c81ecff30f21cf4d16c0704ccab20aa1028b77738`

---

## PlanUnits

### MA-002 - Owner Requirements And Vocabulary Boundary

```yaml
plan_unit_id: MA-002
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: >-
  Plans/Multi-Account.md is canonical live specification text for product, runtime, storage, UI, and governance
  account behavior. Compatibility-only source vocabulary is noncanonical; live wording uses the owner terminology
  in this document. The shared conversational/runtime boundary preserves Puppet Master naming, DRY compliance,
  deterministic defaults, implementation status, and source cross-references.
gui_related: true
gui_classification_reason: The unit preserves a source span that explicitly includes UI among the owner-section requirements.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Compatibility-only vocabulary is not treated as live canonical terminology.
- The shared conversational/runtime boundary remains visible to downstream consumers.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: account_owner_boundary
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: multi_account_owner_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0002
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0003
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0004
preserved_exact_tokens:
- Canonical owner-section requirements
- Requested/effective account identity contract
- Shared conversational/runtime boundary
- Compatibility-only source vocabulary
- Puppet Master
- Plans/DRY_Rules.md
- Plans/Contracts_V0.md
- Plans/Decision_Policy.md
negative_constraints: []
compatibility_only_notes:
- Compatibility-only source vocabulary is noncanonical; live wording uses the owner terminology below.
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Multi-Account.md owns the requested/effective account terminology used by this document.
- Cross-references remain source references and do not supersede owner documents.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs: []
split_recommendation_reason: The covered spans are narrow owner/vocabulary scaffolding and do not require further splitting.
```

### MA-003 - Provider Runtime Scope And Entry Count

```yaml
plan_unit_id: MA-003
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: >-
  Multi-account support covers multiple accounts per provider for Claude Code, Codex, Gemini, GitHub Copilot,
  Cursor, and OpenCode. Routing is shared provider-runtime behavior for all provider-using roles, provider-touched
  /web work maps through the provider capability registry or adapter contract, Gemini Direct and Gemini CLI remain
  separate provider entries, and the current planning model contains exactly seven provider entries.
gui_related: false
gui_classification_reason: The unit defines runtime/provider scope and account identity rather than GUI presentation.
split_recommended: true
depends_on:
- MA-002
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Multi-account routing remains shared provider-runtime behavior rather than Orchestrator-only behavior.
- Gemini Direct and Gemini CLI remain separate provider entries.
- The seven provider-entry inventory remains traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: provider_runtime_scope
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: provider_runtime_scope
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0005
preserved_exact_tokens:
- Purpose
- Scope
- Provider/runtime scope
- Gemini scope
- Provider-entry count
- Gemini Direct
- Gemini CLI
- Claude Code
- Codex
- GitHub Copilot
- Cursor
- OpenCode
negative_constraints:
- Multi-account routing is not an Orchestrator-only feature.
- Provider-touched /web work must not depend on a brittle provider-doc layout.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Provider-runtime identity applies across assistant, interviewer, builder, package/seam, and governance/execution actors while preserving separate actor ontologies.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/storage-plan.md, ContractName:Plans/usage-feature.md'
split_recommendation_reason: Multi-Account-S0005 is intentionally split into provider scope, policy, pool, recovery, and actor identity units.
```

### MA-004 - Effective Policy Visibility And Storage Alignment

```yaml
plan_unit_id: MA-004
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: >-
  Multi-account auto-switching is on by default for provider-using roles unless policy disables it. Policy is
  primarily project-owned, runs snapshot the effective policy space at run start, and each attempt or message records
  the effective account actually used. Requested provider/model/effort/persona/auth mode/account policy and effective
  provider/model/effort/persona/auth mode/account remain visible and queryable. Account selection and env/config
  wiring belong to the Provider contract, state lives in seglog and redb, secrets stay outside canonical storage, GUI
  requirements remain UX-only, and same-provider accounts are not interchangeable buckets.
gui_related: true
gui_classification_reason: The unit includes GUI requirements and user-visible requested/effective disclosure.
split_recommended: true
depends_on:
- MA-003
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Requested and effective provider/account identity remain visible and queryable.
- Account selection remains part of the Provider contract.
- Secrets remain outside canonical storage.
- Same-provider accounts are not flattened into interchangeable buckets.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: requested_effective_policy
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: requested_effective_policy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0005
preserved_exact_tokens:
- Default behavior
- Policy ownership
- Requested/effective identity
- Rewrite alignment
- Non-goal
- seglog
- redb
- no Iced/Slint lock-in
negative_constraints:
- Same-provider accounts are not treated as an interchangeable bucket.
- Secrets remain outside canonical storage.
- GUI requirements remain UX-only with no Iced/Slint lock-in inside this document.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Provider contract owns account selection and env/config wiring.
- Plans/storage-plan.md owns canonical storage mechanics referenced by this account contract.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD, ContractName:Plans/Contracts_V0.md#42-authpolicy, ContractName:Plans/storage-plan.md'
split_recommendation_reason: Multi-Account-S0005 is split so GUI disclosure and backend routing concerns remain separately addressable.
```

### MA-005 - Account Pool Shape And Usage Pressure Ownership

```yaml
plan_unit_id: MA-005
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: >-
  Account-pool routing preserves account-scoped policy, per-request selection, failover caps, async-local context,
  recovery signals, active-account state, operator-visible history, TUI surfaces, provider-specific records, pool and
  fallback state, settings-spec and GUI coverage, Usage-owned account pressure, requested/effective gap closure,
  current effective account displays, and switch policy thresholds without hiding provider account selection or
  inventing a second quota subsystem beside Usage.
gui_related: true
gui_classification_reason: The unit includes settings-spec, GUI coverage, TUI surfaces, and current account display requirements.
split_recommended: true
depends_on:
- MA-004
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Account-pool routing exposes account, fallback, pressure, and effective_account_id state.
- Settings and GUI coverage do not hide provider account selection or switch thresholds.
- Usage remains the owner for account pressure and quota-pressure projection.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: account_pool_usage_pressure
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: account_pool_usage_pressure
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0005
preserved_exact_tokens:
- Account-pool runtime shape
- Provider product shape
- Pool and fallback state
- Settings-spec and GUI coverage
- Usage-owned account pressure
- Requested/effective account gap closure
- Current effective account state
- Switch policy thresholds
- effective_account_id
- signal_confidence
negative_constraints:
- Provider account selection, account pool policy, and switch thresholds must not stay under-specced or hidden.
- PM must not invent a second independent account pressure or quota subsystem beside Usage.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/usage-feature.md consumes account pressure and quota projection instead of being replaced by this document.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, PolicyRule:no_secrets_in_storage, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: Multi-Account-S0005 is split so pool/runtime pressure and actor/audit boundaries can compile independently.
```

### MA-006 - Recovery Audit And Owner Boundary Records

```yaml
plan_unit_id: MA-006
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: >-
  Multi-account recovery records preserve cross-owner references, recovering provider control states, project/worktree
  account context, GitHub auth disclosure, switch availability evidence, actor and target identity separation,
  storage-facing audit identity, behavior-driving audit flags, shared runtime boundaries, and rewrite-era decision
  references without making consumer docs or provider-native labels the account owner.
gui_related: false
gui_classification_reason: The unit defines audit, owner-boundary, and recovery records rather than direct GUI layout or controls.
split_recommended: true
depends_on:
- MA-005
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Cross-owner recovery references remain auditable in recovery records.
- Provider-native labels remain separate from actor and target identity.
- Behavior-driving facts remain distinct from audit-only facts.
- Shared-runtime account behavior does not make the CLI bridge the account owner.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: recovery_audit_boundary
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: recovery_audit_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0005
preserved_exact_tokens:
- Cross-owner recovery references
- Recovering provider control
- Project/worktree account context
- GitHub auth disclosure
- Switch availability state
- Actor and target identity
- Storage-facing audit identity
- Behavior-driving audit flags
- Shared runtime boundary
- Rewrite-era decision references
- github_api:github.com/<login>
- approve_continue
- TierContext
negative_constraints:
- Provider-native identity must not be treated as the actor.
- Shared-runtime account behavior consumed by CLI_Bridged_Providers does not make the CLI bridge the account owner.
- Rewrite-era decision references are not substitutes for the live Multi-Account contract.
compatibility_only_notes: []
stale_retired_dispositions:
- Rewrite-era Decision_Log entries are preserved as decision-history references, not live owner alternatives.
owner_boundary_notes:
- Executor, GitHub auth, UI command, and orchestrator integration docs are recovery consumers unless their ContractRefs say otherwise.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, PolicyRule:no_secrets_in_storage, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: Recovery/audit ownership is split from GUI pressure and actor/run scope.
```

### MA-007 - Actor Run Persona And Control Loop Account Identity

```yaml
plan_unit_id: MA-007
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: >-
  Requested/effective account identity applies across assistant turns, interviews, builders, orchestrator nodes,
  attempts, runs, documents, and reviews while preserving distinct actor ontologies. Serialization, account/persona
  runtime identity, role-scoped confidence, pre-send and post-send control loops, GPT account fields, active versus
  historical identity, and builder/runtime scopes inherit the same account contract without creating feature-local
  account state.
gui_related: false
gui_classification_reason: The unit covers runtime identity propagation and control loops rather than visual presentation.
split_recommended: true
depends_on:
- MA-006
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Distinct actor/run kinds share account truth without collapsing ontologies.
- Serialization carries account/persona runtime identity instead of feature-local account state.
- Active account context remains distinct from historical switch records and prior attempt identity.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: actor_account_identity
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: actor_account_identity
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0005
preserved_exact_tokens:
- Actor/run kind coverage
- Serialization and persona account scope
- Role-scoped confidence
- Pre/post-send control loop
- GPT account fields
- Active versus historical identity
- Builder/runtime account scope
- requested_account
- effective_account
- generated://
negative_constraints:
- Runtime records must preserve distinct actor ontologies while sharing account truth.
- Feature-local account state must not replace account/persona runtime identity.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Assistant, interviewer, builder, and orchestrator surfaces consume the same requested/effective account contract.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, PolicyRule:no_secrets_in_storage, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: Actor identity propagation is split from pool pressure and recovery audit records.
```

### MA-008 - Source Reference And Evidence Inventory

```yaml
plan_unit_id: MA-008
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: >-
  The multi-account references and assessment preserve the source inventory for Plans/rewrite-tie-in-memo.md,
  Plans/storage-plan.md, Plans/usage-feature.md, AGENTS.md, claude-nonstop, OpenCode PR #11832, and OpenCode PR #8536.
  The assessment records that the design evidence is sufficient to reverse-engineer multi-account behavior for covered
  providers, with remaining work in the Rust port and provider-specific clients.
gui_related: true
gui_classification_reason: The preserved reference inventory includes UI/storage alignment and Usage view requirements.
split_recommended: false
depends_on:
- MA-003
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Reference table rows remain traceable.
- External design-source rows remain traceable.
- The Q/A assessment remains preserved as source evidence, not as an executable task.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: source_evidence_inventory
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: source_evidence_inventory
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0006
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0010
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0011
preserved_exact_tokens:
- Plans/rewrite-tie-in-memo.md
- Plans/storage-plan.md
- Plans/usage-feature.md
- AGENTS.md
- claude-nonstop
- OpenCode PR #11832
- OpenCode PR #8536
- Do we have what we need to reverse-engineer multi-account and apply it to Puppet Master for all covered providers?
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- External references are design evidence and do not become PM owner docs.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs: []
split_recommendation_reason: The covered evidence spans are narrow enough for one source-inventory PlanUnit.
```

### MA-009 - Requested Effective Account Identity Envelope

```yaml
plan_unit_id: MA-009
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: >-
  Runtime, bridged-provider, and permission-facing envelopes that carry account identity preserve requested_account_id,
  requested_account_policy, requested_account_binding, effective_account_id, effective_provider_identity,
  execution_role, and operational_identity. provider_account_id is retired from canonical account-identity naming and
  remains only subordinate provider-native metadata. Assistant, chat, interview, and builder actors share provider/runtime
  identity semantics with Orchestrator while preserving actor kind and execution context.
gui_related: false
gui_classification_reason: The unit defines runtime envelope fields and actor boundaries rather than GUI presentation.
split_recommended: false
depends_on:
- MA-004
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- requested_account_id exists alongside requested_account_policy.
- requested_account_binding governs none, preferred, and required fallback behavior.
- provider_account_id remains provider-native metadata rather than canonical identity.
- Cross-surface consumers preserve actor kind and execution context.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: account_identity_envelope
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: account_identity_envelope
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0007
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0008
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0009
preserved_exact_tokens:
- requested_account_id
- requested_account_policy
- requested_account_binding
- effective_account_id
- effective_provider_identity
- execution_role
- operational_identity
- provider_account_id
- none
- preferred
- required
negative_constraints:
- Cross-surface consumers must not collapse actor kinds into orchestration-only terms.
compatibility_only_notes: []
stale_retired_dispositions:
- provider_account_id is retired from canonical account-identity naming and kept only as provider-native metadata.
owner_boundary_notes:
- This section owns the canonical requested/effective account identity contract for all provider-using actors.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Contracts_V0.md'
split_recommendation_reason: The covered envelope spans are focused on one account identity contract.
```

### MA-010 - Provider Capability Inventory And Canon Correction

```yaml
plan_unit_id: MA-010
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: >-
  The provider inventory preserves known capabilities and remaining Rust/client work for Claude Code, Codex, Gemini,
  Copilot, and Cursor, plus resolved gaps for Gemini usage, Copilot usage, Cursor config isolation, Codex multi-account,
  and Rust idioms. Current canon must not revive stale CLI-centric assumptions for Codex or GitHub Copilot; Codex and
  GitHub Copilot are direct providers, Cursor isolation uses runnable cursor-agent account boundaries under PM-owned
  HOME/XDG roots, and Gemini quota project-context can affect effective quota identity.
gui_related: false
gui_classification_reason: The unit covers provider capability inventory and stale-canon correction rather than GUI presentation.
split_recommended: false
depends_on:
- MA-008
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Provider capability and gap tables remain traceable.
- Stale CLI-centric assumptions for Codex and GitHub Copilot are not revived.
- Cursor account isolation remains tied to PM-owned HOME/XDG roots.
- Gemini quota project-context remains part of effective quota identity.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: provider_inventory_correction
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: provider_inventory_correction
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0012
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0013
preserved_exact_tokens:
- Claude Code
- Codex
- Gemini
- Copilot
- Cursor
- Cloud Quotas API
- GOOGLE_CLOUD_PROJECT
- GOOGLE_APPLICATION_CREDENTIALS
- No CURSOR_CONFIG_DIR
- Current-canon correction
- cursor-agent
negative_constraints:
- Current canon must not revive stale CLI-centric assumptions for Codex or GitHub Copilot.
compatibility_only_notes: []
stale_retired_dispositions:
- Stale CLI-centric Codex and GitHub Copilot assumptions are correction inputs only.
owner_boundary_notes:
- Provider capability inventory remains evidence for Multi-Account routing and does not replace provider-specific owner docs.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs: []
split_recommendation_reason: Provider inventory and stale-canon correction are cohesive in this bounded window.
```

### MA-011 - Rewrite Alignment And Current PM Context

```yaml
plan_unit_id: MA-011
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: >-
  Account registry, active index, cooldowns, and usage cache live in redb or a temporary app-data JSON until redb,
  while usage and rate-limit events live in seglog. Account selection and env/config wiring are part of the Provider
  contract. GUI and usage views are UX requirements only, with no Iced/Slint lock-in from this document. The historical
  Rust/Iced and platform_specs.rs context is preserved as source context, while future native auth for Codex, Copilot,
  and Gemini uses OpenCode PR #11832-style stores and per-request context.
gui_related: true
gui_classification_reason: The unit explicitly preserves GUI/usage UX requirements and no Iced/Slint lock-in language.
split_recommended: false
depends_on:
- MA-010
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Storage alignment remains redb plus seglog, with temporary JSON only as an interim app-data option.
- Provider abstraction owns account selection and env/config wiring.
- Historical Rust/Iced wording is preserved as source context and does not authorize legacy app recreation.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: rewrite_alignment_context
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: rewrite_alignment_context
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0014
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0015
preserved_exact_tokens:
- Storage
- Provider abstraction
- UI
- Stack
- Future
- Rust/Iced
- PlatformConfig
- platform_specs.rs
- OpenCode PR #11832
negative_constraints:
- No Iced/Slint commitment in this document authorizes recreating the removed legacy Iced app.
compatibility_only_notes:
- Rust/Iced is preserved as historical source context only.
stale_retired_dispositions:
- The removed legacy Iced app remains retired unless explicitly requested elsewhere.
owner_boundary_notes:
- Plans/storage-plan.md owns storage mechanics; Plans/Multi-Account.md owns account-selection requirements.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Prompt_Pipeline.md'
split_recommendation_reason: Rewrite alignment and current PM context are narrow enough for one PlanUnit.
```

### MA-012 - Provider Entry Identity And Coding Plan Boundaries

```yaml
plan_unit_id: MA-012
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: >-
  Each provider entry represents one concrete runtime surface, not a loose vendor family label. provider_family_id is
  additive grouping metadata and must not replace provider_entry_id. Provider entries declare allowed auth_surface values,
  preserve provider_entry_id, provider_family_id, and transport_kind, keep provider_identity descriptive and provider-native,
  and preserve direct coding-plan provider boundaries for MiniMax, Z.AI, Zhipu AI, and Alibaba coding-plan endpoints and keys.
gui_related: false
gui_classification_reason: The unit defines provider registry identity and API boundaries rather than GUI presentation.
split_recommended: false
depends_on:
- MA-011
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Concrete provider_entry_id is not replaced by provider_family_id.
- Provider entries declare supported auth_surface values.
- transport_kind remains direct_api, cli_runtime, or server_bridge.
- Coding-plan provider identities preserve vendor-specific API boundaries.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: provider_entry_identity
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: provider_entry_identity
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0016
preserved_exact_tokens:
- provider_entry_id
- provider_family_id
- transport_kind = direct_api | cli_runtime | server_bridge
- gemini
- gemini_cli
- cursor_cli
- claude_code_cli
- github_copilot
- opencode
- MiniMax Coding Plan
- Z.AI Coding Plan
- Zhipu AI Coding Plan
- Alibaba Coding Plan
- sk-sp-...
negative_constraints:
- provider_family_id is additive grouping metadata only and MUST NOT replace the concrete provider entry id.
- Coding-plan provider identity must not collapse into a generic OpenAI-compatible or pay-as-you-go bucket.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Provider-entry identity fields are part of Agent-Config/provider registry canon.
- Requested/effective runtime handles owned by Orchestrator or Prompt Pipeline snapshots are not renamed by these provider-entry fields.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Models_System.md, ContractName:Plans/usage-feature.md'
split_recommendation_reason: Provider-entry identity and coding-plan API boundaries are cohesive in this span.
```

### MA-013 - Account Profile Schema And Stable Account Identity

```yaml
plan_unit_id: MA-013
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: >-
  Account-backed providers store ordered account rows with stable ids. The locked account-profile schema and minimum
  fields preserve account_id, provider_id, label, auth_surface, enabled, priority, provider_identity, credential_ref,
  configured_project_id, selected_billing_entity_id, threshold and retry controls, cooldown, availability, configuration,
  credential state, and user-facing status. account_id is the internal stable key, provider_identity is descriptive
  provider-native metadata only, secrets remain outside config/state stores, auth families that change quota semantics
  remain separate account rows, and Codex and Gemini account examples preserve auth-family separation.
gui_related: false
gui_classification_reason: The unit defines backend account schema and identity constraints rather than GUI presentation.
split_recommended: true
depends_on:
- MA-012
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- account_id remains the internal stable key.
- provider_identity remains descriptive provider-native metadata only.
- Secrets and tokens stay outside config and state stores.
- Auth families that change quota semantics remain separate account rows.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: account_profile_schema
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: account_profile_schema
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0017
preserved_exact_tokens:
- account_id
- provider_id
- label
- auth_surface
- enabled
- priority
- provider_identity
- credential_ref
- configured_project_id
- selected_billing_entity_id
- availability_state
- configuration_state
- credential_state
- active | expired | revoked | error
- Codex `ChatGPT`
- Codex `API key`
- Gemini direct API-key accounts
- Gemini CLI auth-backed rows
negative_constraints:
- provider_identity is descriptive provider-native metadata only.
- Actual /tokens/keys remain only in OS credential storage.
- Separate auth families that change quota semantics remain separate account rows.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- The canonical account-registration shape may be extended by additive runtime/health fields without replacing canonical keys.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: PolicyRule:no_secrets_in_storage, ContractName:Plans/Contracts_V0.md#AuthState, ContractName:Plans/usage-feature.md'
split_recommendation_reason: Multi-Account-S0017 is split between account schema and credential/auth-surface validation.
```

### MA-014 - Credential Reference And Auth Surface Validation

```yaml
plan_unit_id: MA-014
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: >-
  credential_ref is a non-secret pointer to credential storage, formatted as credential_store:key_path, with supported
  stores os_keychain, env, file, and cli. auth_surface describes credential consumption through header_bearer,
  header_api_key, deprecated query_param, cli_managed, or oauth_token. Each provider definition specifies supported
  auth_surface values so the HTTP client can attach credentials correctly and account validation rejects incompatible
  pairings early.
gui_related: false
gui_classification_reason: The unit defines credential indirection and validation semantics rather than GUI presentation.
split_recommended: true
depends_on:
- MA-013
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- credential_ref remains a pointer and never the secret itself.
- Supported credential_ref stores remain auditable.
- query_param remains deprecated and warns before use.
- Provider definitions validate supported auth_surface values early.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: credential_auth_surface
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: credential_auth_surface
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0017
preserved_exact_tokens:
- credential_ref
- credential_store
- key_path
- os_keychain
- env
- file
- cli
- os_keychain:pm/openai/account_abc123
- env:OPENAI_API_KEY
- file:~/.config/pm/credentials/gemini_cli.json
- cli:gemini/default
- header_bearer
- header_api_key
- query_param
- cli_managed
- oauth_token
negative_constraints:
- credential_ref is a pointer to where the credential lives, never the secret itself.
- query_param is deprecated and PM should warn before use.
compatibility_only_notes: []
stale_retired_dispositions:
- query_param is deprecated for API keys in query strings.
owner_boundary_notes:
- Credential attachment is validated through provider definitions and HTTP/client behavior.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: PolicyRule:no_secrets_in_storage, ContractName:Plans/Contracts_V0.md#AuthState, ContractName:Plans/usage-feature.md'
split_recommendation_reason: Credential references are separated from account profile identity so secret handling remains independently addressable.
```

### MA-015 - Runtime Resolution Envelope And Non-Secret Handles

```yaml
plan_unit_id: MA-015
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: >-
  Selectable unit and runtime resolution preserve the canonical account-profile row schema with non-secret credential
  handles and no /tokens/keys in project config, redb state, or logs. Runtime records preserve requested_account_id,
  requested_account_binding, requested_account_policy, effective_account_id, provider_account_id, login, auth_realm,
  effective_provider_identity, execution_role, operational_identity, selectable_unit_id, resolution_outcome,
  reason_codes[], provider family, transport, connection profile, health, pressure, and instruction projection state.
gui_related: false
gui_classification_reason: The unit defines runtime snapshot fields and non-secret account handles rather than GUI presentation.
split_recommended: true
depends_on:
- MA-014
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Required runtime fields remain present in requested/effective records.
- credential_locator or credential_ref remains the non-secret OS credential handle.
- /tokens/keys never enter project config, redb state, or logs.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: runtime_resolution_envelope
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: runtime_resolution_envelope
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0018
preserved_exact_tokens:
- requested_account_id
- requested_account_binding
- requested_account_policy
- effective_account_id
- provider_account_id
- login
- auth_realm
- effective_provider_identity
- execution_role
- operational_identity
- selectable_unit_id
- resolution_outcome
- reason_codes[]
- instruction_projection_state?
- /tokens/keys
negative_constraints:
- Actual /tokens/keys never enter project config, redb state, or logs.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Runtime resolution consumes Auth, GitHub credential-store, Prompt Pipeline, and assistant navigation contracts through preserved ContractRefs.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: Plans/Contracts_V0.md#4. Auth contracts, Plans/GitHub_API_Auth_and_Flows.md#Token handling and storage (hard rules), Plans/GitHub_API_Auth_and_Flows.md#Credential store keying (canonical), Plans/Prompt_Pipeline.md#6.4 Effective resolution record, Plans/assistant-chat-design.md#Canonical navigation model'
split_recommendation_reason: Multi-Account-S0018 is split between runtime envelope fields, selectable-unit identity, and permission-visible labels.
```

### MA-016 - Selectable Unit Identity And Registry Boundary

```yaml
plan_unit_id: MA-016
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: >-
  selectable_unit is the runtime candidate PM can choose for an attempt. unit_id is stable within the provider registry,
  provider_entry_id links the unit to the concrete runtime surface, provider_family_id preserves pooling context, and
  unit_kind distinguishes direct_account, cli_account_root, and server_profile. Runtime snapshots preserve root_path,
  health_state, pressure_state, last_usage_snapshot, and last_cooldown_snapshot. Provider-registry-only discovery
  timestamps, /status caches, and shared-overlay advanced knobs stay internal unless copied into requested/effective evidence.
gui_related: false
gui_classification_reason: The unit defines runtime candidate and registry boundaries rather than GUI presentation.
split_recommended: true
depends_on:
- MA-015
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- selectable_unit and unit_id remain stable runtime candidate identifiers.
- direct_account, cli_account_root, and server_profile stay distinct.
- Provider-registry-only discovery timestamps and /status caches do not become canonical run snapshots by default.
- Requested/effective resolver output keeps provider-family, transport, and connection-profile intent distinct from selected units.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: selectable_unit_registry_boundary
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: selectable_unit_registry_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0018
preserved_exact_tokens:
- selectable_unit
- unit_id
- provider_entry_id
- provider_family_id
- unit_kind = direct_account | cli_account_root | server_profile
- root_path
- health_state
- pressure_state
- last_usage_snapshot
- last_cooldown_snapshot
- /status
- requested_provider_family_id
- effective_provider_family_id
- requested_transport_kind
- effective_transport_kind
- requested_connection_profile_id
- effective_connection_profile_id
- effective_health_state
- effective_pressure_state
negative_constraints:
- Provider-registry-only discovery timestamps and /status caches stay in provider-registry internals, not canonical run snapshots.
- Effective runtime states are not replacements for account status, generic availability, or provider-native drift records.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Provider registry state may influence candidate preparation but only copied evidence enters requested/effective runtime records.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: Plans/Contracts_V0.md#4. Auth contracts, Plans/GitHub_API_Auth_and_Flows.md#Token handling and storage (hard rules), Plans/GitHub_API_Auth_and_Flows.md#Credential store keying (canonical), Plans/Prompt_Pipeline.md#6.4 Effective resolution record, Plans/assistant-chat-design.md#Canonical navigation model'
split_recommendation_reason: Selectable-unit identity is split from runtime envelope fields and permission-visible labels.
```

### MA-017 - Canonical Terms Labels And Permission Carry-Through

```yaml
plan_unit_id: MA-017
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: >-
  Runtime resolution preserves canonical terms and values for requested_account_id, requested_account_binding,
  requested_account_policy, effective_account_id, provider_account_id, login, account_id, provider_identity,
  canonical account-registration shape, requested/effective execution identity, effective_provider_identity,
  execution_role, operational_identity, and reason_codes[]. User-visible labels include requested account and effective
  account. Stable internal account identity outranks provider-native display metadata, requested/effective account state
  stays explicit, requested state remains recoverable in history, binding distinguishes preference from requirement,
  fallback follows binding, and effective account identity remains available to permission and approval consumers.
gui_related: true
gui_classification_reason: The unit preserves user-visible labels and permission/approval consumer disclosure.
split_recommended: true
depends_on:
- MA-016
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Canonical account terms and values remain addressable.
- requested account and effective account labels remain preserved.
- Stable internal account identity outranks provider-native display metadata.
- Binding governs fallback behavior rather than ad hoc UI or provider policy.
- Effective account identity remains available to permission and approval consumers.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: account_label_permission_carrythrough
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: account_label_permission_carrythrough
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0018
preserved_exact_tokens:
- requested_account_id
- requested_account_binding
- requested_account_policy
- effective_account_id
- provider_account_id
- account_id is the internal stable key.
- provider_identity is descriptive metadata only.
- requested/effective execution identity
- effective_provider_identity
- execution_role
- operational_identity
- reason_codes
- reason_codes[]
- requested account
- effective account
negative_constraints:
- Stable internal account identity is separate from provider-native display metadata.
- Fallback behavior depends on binding rather than ad hoc UI or provider policy.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Permission and approval consumers receive effective account identity as carry-through evidence.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: Plans/Contracts_V0.md#4. Auth contracts, Plans/GitHub_API_Auth_and_Flows.md#Token handling and storage (hard rules), Plans/GitHub_API_Auth_and_Flows.md#Credential store keying (canonical), Plans/Prompt_Pipeline.md#6.4 Effective resolution record, Plans/assistant-chat-design.md#Canonical navigation model'
split_recommendation_reason: Permission-visible labels are split from the broader runtime envelope for GUI/consumer traceability.
```

### MA-018 - Auto-Rotation Attempt Boundary And Stickiness

```yaml
plan_unit_id: MA-018
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: Multi-account switching happens only at attempt/message boundaries, never mid-attempt. Completed attempts
  belong to the account actually used, the next message or attempt re-resolves, and recovered higher-priority accounts
  do not immediately steal traffic back unless policy and health justify it.
gui_related: false
gui_classification_reason: The unit defines scheduler/runtime switching boundaries rather than GUI presentation.
split_recommended: false
depends_on:
- MA-017
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Switching remains limited to attempt/message boundaries.
- Soft-threshold pressure does not switch mid-turn except under hard failover conditions.
- Completed attempts remain attributed to the account actually used.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: account_switch_boundary
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: account_switch_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0019
preserved_exact_tokens:
- Switch boundary
- Never switch mid-attempt
- Soft-threshold boundary
- Completed ownership rule
- Sticky behavior
negative_constraints:
- Soft-threshold auto-switch behavior must not switch mid-turn.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Scheduler account switching is resolved at attempt/message boundaries.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD, ContractName:Plans/usage-feature.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: The source span is split across switch boundary, reason-code, no-fallback, threshold, and manual-control units.
```

### MA-019 - Switch Reason Codes And Runtime State Dimensions

```yaml
plan_unit_id: MA-019
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: Scheduler switch records persist normalized PM reason codes rather than UI-only text, while GUI and runtime
  projections keep selectable-unit health, cooldown, usage pressure, and per-attempt resolution outcome as separate state
  dimensions that do not overwrite each other.
gui_related: true
gui_classification_reason: The unit preserves GUI/runtime projection requirements and user-visible switch-state dimensions.
split_recommended: false
depends_on:
- MA-018
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Stable switch reason codes remain persisted.
- Raw provider conditions remain evidence beside normalized PM reasons.
- GUI and runtime projections keep health, cooldown, usage pressure, and resolution outcome separate.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: switch_reason_projection
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: switch_reason_projection
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0019
preserved_exact_tokens:
- soft_threshold_preemptive_switch
- threshold_preemptive_switch
- cooldown_preemptive_switch
- preferred_recovered
- hard_exhaustion_failover
- cooldown_active
- account_unhealthy
- profile_unhealthy
- credentials_expired
- needs_configuration
- provider_disconnected
- model_incompatible
- unsupported-model
- workspace-deactivated
- provider-unhealthy
- health
- cooldown
- usage pressure
- resolution outcome
negative_constraints:
- Runtime state dimensions must not overwrite one another.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Provider adapters may surface raw provider conditions; PM stores normalized switch reasons in requested/effective snapshots.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD, ContractName:Plans/usage-feature.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: Reason-code and projection-state requirements are split from switch timing and threshold logic.
```

### MA-020 - Resolver Ownership And Hard No-Fallback Rule

```yaml
plan_unit_id: MA-020
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: PM owns final selectable-unit resolution, requested/effective disclosure, and cross-provider switching policy.
  Provider-auth account operations mutate metadata while preserving requested/effective history. The hard no-fallback rule
  records blocked reasons instead of silently crossing to another auth surface, provider entry, or account family.
gui_related: false
gui_classification_reason: The unit defines scheduler/resolver ownership and blocking semantics rather than GUI presentation.
split_recommended: false
depends_on:
- MA-019
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- PM owns final selectable-unit resolution and requested/effective disclosure.
- Provider-auth set-active/delete/update operations preserve historical requested/effective records.
- Hard no-fallback cases record blocked reasons instead of silently crossing account boundaries.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: resolver_no_fallback
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: resolver_no_fallback
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0019
preserved_exact_tokens:
- /set-active/delete/update
- requested /effective
- /hard
- auth-mode
- Set Preferred
- /control
- needs_configuration
- validation_required
negative_constraints:
- PM must not silently cross to another auth surface, provider entry, or account family when hard no-fallback applies.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Provider adapters expose facts; PM owns cross-provider switching policy and final selectable-unit resolution.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/storage-plan.md'
split_recommendation_reason: Hard no-fallback is split from threshold and cooldown behavior.
```

### MA-021 - Switch Eligibility Signal Weighting And Threshold Evidence

```yaml
plan_unit_id: MA-021
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: Auto-switching is allowed only when policy permits and the account has hard exhaustion, projected quota below
  threshold, severe rate-limit pressure, or temporary unavailability/capacity constraints. PM orders evidence from hard
  runtime failure through weaker heuristics, uses authoritative counters for threshold and exhausted states, preserves
  provider windows, and does not promote weak one-off plan warnings into automatic switching.
gui_related: false
gui_classification_reason: The unit covers runtime evidence weighting and threshold semantics rather than visual presentation.
split_recommended: false
depends_on:
- MA-020
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Signal weighting order remains preserved.
- Authoritative remaining counters drive threshold_reached and exhausted transitions.
- Runtime token stats alone do not become hard blocks without authoritative evidence.
- One soft plan-warning does not trigger auto-switch by itself.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: switch_signal_weighting
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: switch_signal_weighting
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0019
preserved_exact_tokens:
- hard exhaustion
- projected remaining quota below threshold
- severe rate-limit pressure
- threshold_reached
- exhausted
- 20% remaining
- 10% remaining
- fiveHour
- weekly
- pattern_only_or_inferred
- plan-warning
- plan-pressure
- reset_at
negative_constraints:
- The scheduler must not leave threshold/exhausted transitions undefined when authoritative remaining quota is available.
- PM must not auto-switch purely on one soft plan-warning.
compatibility_only_notes:
- Authoritative threshold semantics are preserved from source for audit compatibility.
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/usage-feature.md and provider adapters supply evidence; PM resolves switching policy.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/storage-plan.md'
split_recommendation_reason: Threshold evidence is split from cooldown/no-switch and manual control requirements.
```

### MA-022 - No-Switch Cooldown Retry Budget Manual Override And Exhausted Copy

```yaml
plan_unit_id: MA-022
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: PM does not auto-switch when no eligible backup exists, policy forbids it, provider capability does not support
  switching, a hard requested constraint forbids fallback, or explicit recovery is required. Cooldown and retry budget are
  first-class account state, authoritative cooldown sets hard_block until revalidation, manual set-active remains an
  override/debug control, and exhausted account copy remains user-visible when fallback is available.
gui_related: true
gui_classification_reason: The unit preserves user-visible exhausted copy and manual account control behavior.
split_recommended: false
depends_on:
- MA-021
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- No-switch conditions remain explicit.
- cooldown and retry_budget remain first-class account state.
- cooldown_until sets hard_block=true until revalidation after expiry.
- Manual set-active/preferred account controls remain override/debug controls.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: cooldown_manual_control
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: cooldown_manual_control
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0019
preserved_exact_tokens:
- cooldown_until
- hard_block=true
- cooldown
- retry budget
- manual set active
- preferred account
- Usage exhausted
- Puppet Master will use another eligible account until this one resets
negative_constraints:
- Manual control does not redefine the default operating model.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Manual controls still record requested versus effective account identity and switch reason.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md#AuthState, ContractName:Plans/FinalGUISpec.md'
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD, ContractName:Plans/Contracts_V0.md#42-authpolicy'
split_recommendation_reason: No-switch, cooldown, manual override, and exhausted copy close the S0019 split.
```

### MA-023 - Provider Behavior Matrix

```yaml
plan_unit_id: MA-023
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: Provider-specific behavior preserves the provider-entry matrix for Gemini Direct, Gemini CLI, Cursor CLI,
  Claude Code CLI, Codex, GitHub Copilot, and OpenCode, including identity shape, usage/health signals, recovery and
  switching notes, and the rule that Codex plan-backed and API-billed usage/cooldowns must not be merged.
gui_related: false
gui_classification_reason: The unit preserves provider behavior data and runtime identity, not direct GUI layout.
split_recommended: true
depends_on:
- MA-022
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- All provider matrix rows remain traceable.
- Codex ChatGPT and API key account families remain separate.
- OpenCode managed and attached server profiles remain distinct.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: provider_behavior_matrix
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: provider_behavior_matrix
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0020
preserved_exact_tokens:
- Gemini Direct
- Gemini CLI
- Cursor CLI
- Claude Code CLI
- Codex
- GitHub Copilot
- OpenCode
- ChatGPT
- API key
- Managed Server
- Attach to Existing Server
negative_constraints:
- PM must not merge plan-backed and API-billed usage/cooldowns.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Provider-specific rows route to their provider owners while Multi-Account owns account identity and switching semantics.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/usage-feature.md'
split_recommendation_reason: Multi-Account-S0020 is split by provider/root/auth/capability/sharing topics.
```

### MA-024 - Claude Code Account Roots Login Import And Sharing Boundaries

```yaml
plan_unit_id: MA-024
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: Claude Code account handling preserves native auth evidence, CLAUDE_CONFIG_DIR profile switching, isolated
  account auth state, selective sharing evidence, narrow auth-bearing import, native login variants, user-facing setup
  actions, and clean logged-out account evidence for isolated roots.
gui_related: true
gui_classification_reason: The unit includes user-facing Claude setup actions and login labels.
split_recommended: false
depends_on:
- MA-023
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Claude account status evidence is recorded rather than inferred blindly.
- CLAUDE_CONFIG_DIR remains the Claude Code profile switching mechanism.
- Import Existing Claude Auth copies only auth-bearing state.
- Login variants and user-facing setup actions remain distinct.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: claude_code_account_boundary
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: claude_code_account_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0020
preserved_exact_tokens:
- claude auth status
- 'loggedIn: true'
- 'authMethod: "claude.ai"'
- 'apiProvider: "firstParty"'
- 'subscriptionType: "pro"'
- CLAUDE_CONFIG_DIR
- .claude.json
- claude.json
- clausona
- symlink
- credentials.json
- .credentials.json
- Import Existing Claude Auth
- --email
- --sso
- --claudeai
- --console
- Sign In to Claude
- Sign In to Console/API
- Use SSO
negative_constraints:
- Claude Code config-dir-per-account must not be treated as sufficient for every provider.
compatibility_only_notes: []
stale_retired_dispositions:
- Earlier all-provider config-dir assumptions are incomplete for newer Gemini/Cursor direction.
owner_boundary_notes:
- Claude Code account-local files remain isolated unless a later owner contract promotes overlays.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/usage-feature.md'
split_recommendation_reason: Claude Code auth/root behavior is separable from Gemini/Cursor/Codex root behavior.
```

### MA-025 - Provider Account Root Layout And Gemini CLI Managed Root

```yaml
plan_unit_id: MA-025
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: PM-owned provider account roots are keyed by provider_entry_id with explicit Linux, macOS, Windows, and
  portable path families. Selectable account-like units get stable child roots, CLI account roots use a runnable root
  segment, and Gemini CLI roots are precreated, provisioned, validated, and imported using only minimum provider-native
  auth/settings state.
gui_related: false
gui_classification_reason: The unit defines filesystem/root provisioning and provider-native state boundaries.
split_recommended: false
depends_on:
- MA-024
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Account-isolation path ownership remains concrete for Linux, macOS, and Windows.
- GEMINI_CLI_HOME is precreated before launch/probe where required.
- Gemini CLI auth-bearing import remains minimal.
- Provider-native history, credential, settings, and project-state bleed-through is avoided.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: provider_root_layout
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: provider_root_layout
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0020
preserved_exact_tokens:
- '$XDG_DATA_HOME/puppet-master/providers/<provider_entry_id>/'
- '~/Library/Application Support/Puppet Master/providers/<provider_entry_id>/'
- '%APPDATA%\\Puppet Master\\providers\\<provider_entry_id>\\'
- /puppet-master/providers/
- /Puppet
- /providers/
- '.../accounts/<account_id>/'
- '.../accounts/<account_id>/root/'
- GEMINI_CLI_HOME
- fresh-home
- fresh-profile
- /.gemini/settings.json
- GEMINI_API_KEY
- GOOGLE_GENAI_USE_VERTEXAI
- GOOGLE_GENAI_USE_GCA
- oauth_creds.json
- state.json
- installation_id
- projects.json
negative_constraints:
- PM must not hand-wave filesystem ownership for CLI-backed providers.
- Gemini CLI must not rely on pristine-home first run when the home path is missing.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Gemini state under GEMINI_CLI_HOME is provider-native state managed within the account root.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/usage-feature.md'
split_recommendation_reason: Provider root layout and Gemini CLI root provisioning are cohesive filesystem concerns.
```

### MA-026 - Gemini Auth Project Context And Quota Plane Readiness

```yaml
plan_unit_id: MA-026
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: Gemini auth states are richer than a binary logged-in flag. OAuth, API-key, and Vertex/Google credential
  families remain distinct auth, billing, quota, project-context, capability, and readiness planes, with requested/effective
  storage vocabulary preserving auth, capability, billing/quota plane, project context, and usage source.
gui_related: true
gui_classification_reason: The unit includes Gemini setup/readiness states and user-visible validation behavior.
split_recommended: false
depends_on:
- MA-025
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Gemini OAuth, API-key, and Vertex/Google credential families remain distinct.
- validation_required is surfaced before onboarding when project/account context cannot be proven.
- configured project id outranks persisted managed-project id.
- Credentials stay out of redb and seglog.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: gemini_auth_quota_readiness
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: gemini_auth_quota_readiness
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0020
preserved_exact_tokens:
- oauth_logged_out
- oauth_logged_in
- oauth_needs_project_context
- oauth_needs_configuration
- api_key_configured
- validation_required
- managed-project
- PKCE
- /project-context
- requested_auth_mode
- effective_*
- /capability
- billing/quota plane
negative_constraints:
- Gemini OAuth and API-key paths are not interchangeable labels over one key-centric bucket.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Gemini account/runtime records use requested/effective storage vocabulary for auth, capability, billing/quota, project context, and usage source.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/usage-feature.md'
split_recommendation_reason: Gemini auth/project/quota readiness is split from root layout and capability declarations.
```

### MA-027 - Cursor Agent Home XDG Isolation And Import Boundary

```yaml
plan_unit_id: MA-027
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: Cursor account isolation is tied to PM-owned HOME and XDG roots for cursor-agent execution, login, status,
  import, and launch behavior. Editor-oriented user-data flags and Cursor ACP do not replace the account-root boundary,
  and Cursor-owned profile/native state remains account-local unless a later owner contract promotes it.
gui_related: false
gui_classification_reason: The unit defines Cursor account-root and launch isolation rather than GUI presentation.
split_recommended: false
depends_on:
- MA-026
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Fresh HOME/XDG roots remain account-boundary inputs for Cursor probes.
- cursor-agent status under isolated roots is evidence for the isolated account row.
- Import Existing Cursor Auth copies only narrow auth-bearing state.
- Editor user-data flags do not become PM's core Cursor multi-account isolation mechanism.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: cursor_account_isolation
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: cursor_account_isolation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0020
preserved_exact_tokens:
- HOME
- XDG_*
- XDG_CONFIG_HOME
- XDG_DATA_HOME
- XDG_CACHE_HOME
- CURSOR_USER_DATA_DIR
- cursor-agent
- cursor-agent login
- NO_OPEN_BROWSER
- cursor-agent status
- Not logged in
- cursor --user-data-dir
- Import Existing Cursor Auth
- ~/.config/cursor/auth.json
- statsig-cache.json
- ~/.cursor/projects/
- Cursor ACP
- /its
negative_constraints:
- Cursor isolation is not a config-path/manual switching model.
- Cursor ACP is not an account-root boundary.
compatibility_only_notes: []
stale_retired_dispositions:
- Editor-facing cursor --user-data-dir assumptions are provider/desktop details only, not the core account isolation contract.
owner_boundary_notes:
- Cursor profile-local/native state remains Cursor-owned and account-local unless promoted by a later owner contract.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/usage-feature.md'
split_recommendation_reason: Cursor isolation is split from Codex and Gemini provider-root behavior.
```

### MA-028 - Codex Account Roots And Auth Family Separation

```yaml
plan_unit_id: MA-028
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: Codex account roots are isolated with CODEX_HOME. Auth probes and authenticated structured execution validate
  account/root state, upstream runtime artifacts remain account-local provider state, and ChatGPT-backed and API-key-backed
  Codex accounts stay separate for switching, usage display, cooldown behavior, and preferred-account policy.
gui_related: false
gui_classification_reason: The unit covers Codex account-root validation and auth-family semantics rather than GUI presentation.
split_recommended: false
depends_on:
- MA-027
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Fresh CODEX_HOME logged-out probes are account-sandbox evidence.
- Upstream Codex runtime artifacts are not shared across PM account rows by default.
- ChatGPT and API-key auth families remain distinct entitlement pools.
- Structured codex exec event output remains valid account/root validation evidence.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: codex_account_root_auth_family
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: codex_account_root_auth_family
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0020
preserved_exact_tokens:
- CODEX_HOME
- auth.json
- codex login status
- codex exec --json
- thread.started
- turn.started
- error
- item.completed
- sessions/
- models_cache
- models_cache.json
- logs_1.sqlite
- state_5.sqlite
- skills/.system/
- /.system/
- tmp/
- ChatGPT-backed
- API-key-backed
negative_constraints:
- Codex plan-backed and API-billed usage/cooldowns must not collapse into one generic Codex account bucket.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Codex SQLite filenames are upstream-provider artifacts, not PM storage technology.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/usage-feature.md'
split_recommendation_reason: Codex account roots and auth-family separation are independently addressable.
```

### MA-029 - Gemini Copilot Direct Provider Identity And Capability Boundaries

```yaml
plan_unit_id: MA-029
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: Gemini is not direct-only, Gemini provider entries use shared capability declarations, Codex and GitHub
  Copilot are direct providers in PM, GitHub API auth remains independent from GitHub Copilot provider auth, and Copilot
  account records preserve auth realm, billing/entity context, entitlement class, policy block, and cooldown reason codes.
gui_related: false
gui_classification_reason: The unit defines provider identity and capability boundaries rather than GUI presentation.
split_recommended: false
depends_on:
- MA-028
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Gemini Direct and Gemini CLI remain separate provider entries that may family-pool only when policy allows.
- Gemini capability declarations use the shared provider capability model.
- GitHub Copilot account switching does not alter Git or GitHub API identity.
- Copilot entitlement and cooldown reason codes remain explicit.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: direct_provider_capability_boundary
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: direct_provider_capability_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0020
preserved_exact_tokens:
- direct-only
- supports_multi_account
- account_identity_kind
- quota_signal_sources
- supports_threshold_switch
- supports_reset_countdown
- supports_role_scoped_account_pools
- requested_auth_mode
- effective_*
- billing_entity_required
- included_premium_exhausted
- paid_overage_disallowed
- copilot_org_policy_blocked
- copilot_entitlement_missing
negative_constraints:
- Switching GitHub Copilot accounts must not change Git transport, local Git/worktree state, remotes, worktree ownership, repository transport state, or GitHub API account binding.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- GitHub API auth for repository operations is independent from GitHub Copilot provider auth.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/OpenCode_Deep_Extraction.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: Direct-provider identity and capability declarations are split from OpenCode and sharing policy.
```

### MA-030 - Provider-Native Advanced Instructions OpenCode Evidence And Skill Boundary

```yaml
plan_unit_id: MA-030
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: >-
  Provider-native advanced instruction surfaces, OpenCode evidence, and skill/MCP behavior remain bounded: Copilot advanced
  target groups carry PM control and drift state, native projections have explicit failure behavior, OpenCode pressure
  evidence preserves source authority, and PM does not invent provider-specific skill plumbing inside the OpenCode server
  profile for direct providers.
gui_related: true
gui_classification_reason: The unit includes user-visible advanced instruction panes, target groups, and drift controls.
split_recommended: false
depends_on:
- MA-029
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- GitHub Copilot Advanced target groups remain provider-native instruction surfaces.
- native_projected failure behavior remains explicit.
- OpenCode pressure records preserve observed versus upstream-authoritative source authority.
- Direct-provider differences remain in auth/model/runtime/capability transforms, not OpenCode skill plumbing.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: provider_native_instruction_boundary
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: provider_native_instruction_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0020
preserved_exact_tokens:
- GitHub Copilot Advanced
- Repository Instructions
- .github/copilot-instructions.md
- Path Instructions
- .github/instructions/*.instructions.md
- Custom Agents
- .github/agents/*.agent.md
- PM Controlled
- Manual Override
- native_projected
- '429'
- rateLimitedUntil
- OpenCode-observed
- upstream-authoritative
negative_constraints:
- PM should not invent provider-specific skill plumbing inside the OpenCode server profile for direct-provider entries.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Provider differences belong in auth, model/runtime, and capability transforms rather than replacing PM-native skill delivery.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/OpenCode_Deep_Extraction.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: Advanced instruction and OpenCode evidence boundaries are split from sharing deny classes.
```

### MA-031 - CLI Provider Sharing Deny Classes And Overlay Policy

```yaml
plan_unit_id: MA-031
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: CLI-backed providers deny sharing for account-bearing state and runtime residue by default. PM-managed overlays
  may be projected only when target-specific, deny_classes wins for account-bearing state, and provider_api projection
  remains a provider adapter boundary rather than a filesystem sharing shortcut.
gui_related: false
gui_classification_reason: The unit defines provider account state sharing policy rather than GUI presentation.
split_recommended: false
depends_on:
- MA-030
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Account-bearing state and residue do not leak between runnable profiles.
- Runtime sharing defaults preserve account-local provider-generated state unless explicitly promoted.
- share_classes, deny_classes, and projection_mode remain recorded policy fields.
- provider_api projection remains a provider adapter boundary.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: cli_provider_sharing_policy
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: cli_provider_sharing_policy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0020
preserved_exact_tokens:
- auth_state
- history
- mcp_oauth_tokens
- extensions runtime state
- project registry
- temp chats
- workspace_trust
- runtime_cache
- cooldown_residue
- telemetry_state
- share_classes[]
- deny_classes[]
- projection_mode = copy | symlink | generated | provider_api
negative_constraints:
- Account-bearing state and residue from one profile must not leak into another account's runnable profile.
- deny_classes[] wins for account-bearing state.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- PM-managed overlays for instructions, skills, selected MCP definitions, and selected bridge config are allowed only when target-specific.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/OpenCode_Deep_Extraction.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: Sharing deny classes close the provider-specific S0020 split.
```

### MA-032 - Runner Orchestration Account Contract

```yaml
plan_unit_id: MA-032
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: The multi-account contract applies across assistant, interviewer, builders, overseers, and node workers.
  Auto-switching is on by default for provider-using actors, provider selection is provider-aware, account-aware, and
  role-aware, same-provider accounts are not interchangeable, and manual set-active remains an override/debug control.
gui_related: false
gui_classification_reason: The unit defines runtime actor coverage rather than GUI presentation.
split_recommended: false
depends_on:
- MA-031
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Multi-account applies across all listed provider-using actor classes.
- Provider selection remains provider-aware, account-aware, and role-aware.
- Same-provider accounts are not interchangeable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: runner_orchestration_account_contract
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: runner_orchestration_account_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0021
preserved_exact_tokens:
- assistant
- interviewer
- builders
- overseers
- node workers
- provider-aware
- account-aware
- role-aware
- manual set-active
negative_constraints:
- Same-provider accounts are not interchangeable.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Runner and orchestration consumers inherit the Multi-Account requested/effective account contract.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/usage-feature.md'
split_recommendation_reason: The source span is narrow enough for one runner/orchestration PlanUnit.
```

### MA-033 - Owner Consumer Account Binding And Pressure History

```yaml
plan_unit_id: MA-033
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: Runtime-account consumers defer to Multi-Account for requested/effective account selection. requested_account_binding
  and operational_identity remain shared runtime fields, required account binding fields remain explicit, blocked switch
  decisions stay historically material, pressure history persists through account_switch_event and account_pressure_episode,
  and hard-blocked evidence keeps accounts ineligible until successful revalidation.
gui_related: false
gui_classification_reason: The unit defines runtime storage/history fields rather than GUI presentation.
split_recommended: false
depends_on:
- MA-032
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- requested_account_policy alone is not treated as sufficient account-selection evidence.
- requested_account_binding remains closed to none, preferred, and required.
- account_switch_event and account_pressure_episode preserve durable history.
- hard_blocked evidence waits for successful revalidation before routing resumes.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: account_binding_pressure_history
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: account_binding_pressure_history
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0022
preserved_exact_tokens:
- requested_account_policy
- requested_account_id?
- requested_account_binding?
- effective_account_id?
- account_switch_reason?
- execution_role
- none
- preferred
- required
- account_switch_event
- account_pressure_episode
- nominal
- hard_block=true
- hard_blocked
negative_constraints:
- requested_account_policy alone is not enough to explain concrete account selection.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Runtime-account consumers defer to Plans/Multi-Account.md for requested/effective account selection.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/Models_System.md'
split_recommendation_reason: The owner/consumer binding span is narrow enough for one PlanUnit.
```

### MA-034 - Usage Pressure Owner And Pick-Best Evidence

```yaml
plan_unit_id: MA-034
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: Usage/account pressure plugs into the shared Usage model rather than creating a parallel quota system.
  Provider-using interactions may update account health, pick-best uses the strongest available account-health signals
  plus policy, and Gemini provider-level-only quota/status projections are incomplete when they omit account-level state.
gui_related: false
gui_classification_reason: The unit defines Usage-owned runtime pressure and pick-best behavior rather than GUI presentation.
split_recommended: true
depends_on:
- MA-033
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- No parallel quota system is created for multi-account routing.
- Account health can update from every provider-using interaction.
- Pick-best does not treat all signals as equally authoritative.
- Gemini family summaries preserve account-level state.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_pressure_owner
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: usage_pressure_owner
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0023
preserved_exact_tokens:
- Usage/account pressure
- shared usage model
- parallel quota system
- account-health signals
- /quota/status
- usage
- pressure
- cooldown
- source-confidence
negative_constraints:
- Do not create a parallel quota system for multi-account routing.
- Gemini provider-level-only /quota/status projection is incomplete without account-level state.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/usage-feature.md remains the Usage owner consumed by Multi-Account routing.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md#42-authpolicy'
split_recommendation_reason: Multi-Account-S0023 is split between Usage owner, Gemini labels, and priority rules.
```

### MA-035 - Gemini Usage Source Labels And Confidence

```yaml
plan_unit_id: MA-035
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: Gemini usage/source expectations present one shared Gemini-family usage surface while preserving source-qualified
  labels. OAuth-backed views use Gemini quota when authoritative semantics are available, API-key/local-only views use
  source-qualified estimated wording, and signal_confidence exposes whether quota pressure is authoritative, structured,
  heuristic, or local-only.
gui_related: true
gui_classification_reason: The unit defines user-visible Gemini usage labels and confidence disclosure.
split_recommended: true
depends_on:
- MA-034
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Gemini usage appears as a shared family surface rather than separate top-level pages.
- Gemini quota and Gemini (estimated) labels remain source-qualified.
- signal_confidence remains visible.
- Authoritative, structured, heuristic, and local-only confidence levels remain distinguishable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: gemini_usage_labels
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: gemini_usage_labels
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0023
preserved_exact_tokens:
- Gemini-family usage surface
- Gemini quota
- Gemini (estimated)
- signal_confidence
- authoritative
- structured
- heuristic
- local-only
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Usage labels consume Plans/usage-feature.md while preserving Multi-Account account context.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/rewrite-tie-in-memo.md'
split_recommendation_reason: Gemini labels are split from generic pick-best evidence and priority ordering.
```

### MA-036 - Priority Ordering And Sticky Selection

```yaml
plan_unit_id: MA-036
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: Priority, GUI ordering, and stickiness rules use lower numeric priority first, prefer the current effective
  account when healthy enough, otherwise choose the highest-priority eligible account inside the highest-ranked viable
  auth surface, and avoid bouncing back to a recovered higher-priority account unless policy and health justify it.
gui_related: true
gui_classification_reason: The unit covers GUI ordering and user-visible account priority/stickiness behavior.
split_recommended: true
depends_on:
- MA-035
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Lower numeric priority wins.
- Current effective account remains preferred when healthy enough.
- Selection considers highest-ranked viable auth surface.
- Recovered higher-priority accounts do not immediately steal traffic back without policy and health support.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: priority_sticky_selection
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: priority_sticky_selection
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0023
preserved_exact_tokens:
- lower numeric priority wins
- '1'
- '2'
- '3'
- current effective account
- highest-priority eligible account
- highest-ranked viable auth surface
negative_constraints:
- Do not bounce immediately back to a recovered higher-priority account unless policy and health justify it.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Priority and stickiness rules align GUI ordering with requested/effective runtime selection.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD, PolicyRule:Decision_Policy.md§3'
split_recommendation_reason: Priority ordering closes the S0023 split.
```

### MA-037 - GUI UX-Only Boundary And Agent-Config Section Order

```yaml
plan_unit_id: MA-037
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: Multi-account GUI requirements are UX requirements independent of implementation stack. Agent-Config is the
  canonical management surface for provider defaults, accounts/profiles, models, instructions, skills, and advanced
  runtime controls, with required section order and a persistent Effective Runtime inspector in the provider detail flow.
gui_related: true
gui_classification_reason: The unit defines GUI surface structure, navigation order, and persistent runtime inspector behavior.
split_recommended: true
depends_on:
- MA-036
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- GUI requirements remain implementation-stack independent.
- Agent-Config remains the canonical management surface.
- Required Agent-Config section order remains preserved.
- Effective Runtime inspector remains persistently visible in the provider detail flow.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: agent_config_gui_structure
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: agent_config_gui_structure
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0024
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0025
preserved_exact_tokens:
- GUI requirements (UX only)
- Agent-Config
- Overview
- Defaults
- Accounts / Profiles
- Models
- Instructions
- Skills
- Advanced Runtime
- Effective Runtime
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Agent-Config owns the provider/account management surface while runtime records own actual requested/effective execution.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/usage-feature.md'
split_recommendation_reason: GUI structure is split from family pooling guardrails.
```

### MA-038 - Provider Pooling Family Guardrails And No Pseudo-Providers

```yaml
plan_unit_id: MA-038
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: Agent-Config surfaces provider/family pooling where a provider entry participates in family-level pooling,
  preserves Gemini Direct and Gemini CLI through the real provider-entry/account model, requires requested/effective
  disclosure when family pooling selects a different backend, capability-checks media/effort/tooling needs, and forbids
  fake OAuth/API-key pseudo-providers.
gui_related: true
gui_classification_reason: The unit defines GUI pooling controls, account row badges, and requested/effective disclosure.
split_recommended: true
depends_on:
- MA-037
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Provider Pooling and Family Pooling sections remain visible where applicable.
- Gemini Direct and Gemini CLI remain real provider entries.
- Family pooling preserves requested and effective provider entries in run records.
- GUI grouping does not mint fake pseudo-providers.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: family_pooling_guardrails
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: family_pooling_guardrails
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0025
preserved_exact_tokens:
- Provider Pooling
- Family Pooling
- Gemini Direct
- Gemini CLI
- /media/effort/tooling
- requested provider entry
- effective provider entry
- pseudo-providers
- gemini
- gemini_cli
- auth-surface badges
- /configuration/availability
negative_constraints:
- The GUI must not mint fake OAuth/API-key pseudo-providers that compete with real gemini and gemini_cli provider entries.
- PM must never silently route across Gemini Direct/Gemini CLI capability boundaries without requested/effective disclosure.
compatibility_only_notes: []
stale_retired_dispositions:
- The older one-card mixed OAuth/API grouping is preserved only as a retired direction.
owner_boundary_notes:
- Provider family grouping is a GUI/runtime policy surface, not a replacement for concrete provider entries.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/usage-feature.md'
split_recommendation_reason: Family pooling is split from the Agent-Config section-order unit.
```

### MA-039 - Account Profile Row Content Actions And Inspector Boundaries

```yaml
plan_unit_id: MA-039
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: Account/profile rows display dense scan-friendly identity, auth, configuration, availability, pressure,
  cooldown, entitlement, billing, health, and action state. Detailed usage/cooldown and requested/effective explanation
  belongs in the inspector, Codex and Copilot rows preserve their real account/entity shape, OpenCode server profiles
  expose connection readiness, and provider-level enable/disable changes future eligibility without destroying rows/defaults.
gui_related: true
gui_classification_reason: The unit defines GUI account/profile row content, actions, and inspector boundaries.
split_recommended: false
depends_on:
- MA-038
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Account/profile rows stay dense and scan-friendly.
- Codex ChatGPT and API key rows remain separate top-level rows.
- GitHub Copilot billing entities stay in the inspector rather than fake top-level accounts.
- Provider Enable/Disable does not destroy account/profile rows or saved defaults.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: account_row_inspector_boundary
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: account_row_inspector_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0026
preserved_exact_tokens:
- label
- auth family or profile mode
- current state
- derived auth/configuration/availability state
- pressure/cooldown summary
- entitlement/billing secondary line
- Add Account
- Add Profile
- Set Preferred
- Refresh Usage
- Revalidate
- Edit Threshold
- Open Provider Settings
- Enable/Disable Provider
negative_constraints:
- Provider-level Enable/Disable Provider changes future eligibility only and must not destroy account/profile rows or saved defaults.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- The expanded inspector owns billing-entity selection, premium-request state, and fallback-to-included-model disclosure.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: Account/profile row requirements are narrow enough for one PlanUnit.
```

### MA-040 - Setup Readiness State Machine And Labels

```yaml
plan_unit_id: MA-040
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: Provider/account setup flows distinguish authentication from readiness. Account/profile GUI state machines
  retain provider-specific state for logged-out, logging-in, logged-in, needs-setup, validating, ready, expired, failed,
  logging-out, and disabled labels, and PM does not collapse logged-in, entitlement, billing, or partial setup states into Ready.
gui_related: true
gui_classification_reason: The unit defines user-visible setup/readiness states and GUI state machine labels.
split_recommended: true
depends_on:
- MA-039
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Authentication and readiness remain distinct.
- Logged in is not treated as Ready.
- Provider-specific entitlement/billing can keep an account in Needs setup after auth succeeds.
- The GUI state machine preserves provider-specific degraded states.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: setup_readiness_state_machine
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: setup_readiness_state_machine
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0027
preserved_exact_tokens:
- Logged out
- Logged Out
- Logging in
- Logging In
- Logged in
- Needs setup
- Validating
- Ready
- Auth expired
- Validation failed
- Logging out
- Disabled
- partial-setup
negative_constraints:
- Logged in is not the same as Ready.
- PM must not collapse provider-specific entitlement or billing setup into Ready, partial-setup, or Logging Out.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Setup readiness labels consume setup/health lifecycle contracts but Multi-Account owns account-specific readiness semantics.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md#Setup/Health-lifecycle-contracts, ContractName:Plans/usage-feature.md, ContractName:Plans/CLI_Bridged_Providers.md'
split_recommendation_reason: Setup state labels are split from provider-specific readiness branches.
```

### MA-041 - Provider-Specific Readiness Branches And Cursor Rules Projection

```yaml
plan_unit_id: MA-041
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: Provider-specific readiness branches preserve Copilot billing entity selection, Gemini Vertex/Google Cloud
  credential, project, location, trust, MCP, and account-auth choices, Cursor browser login and API-key availability, Cursor
  Rules projection to .cursor/rules/*.mdc as primary/native rules, and provider-reported cooldowns as read-only facts
  with source confidence.
gui_related: true
gui_classification_reason: The unit covers provider-specific setup GUI paths, helper text, and visible readiness labels.
split_recommended: true
depends_on:
- MA-040
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Copilot may require Choose Billing Entity before Ready.
- Gemini Vertex setup exposes ADC, service account JSON, and Google Cloud API key paths.
- Cursor CLI browser login is default and API key remains advanced optional.
- Cursor Rules labels and .cursorrules compatibility remain preserved.
- Provider-reported cooldowns remain read-only facts with source confidence.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: provider_readiness_branches
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: provider_readiness_branches
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0027
preserved_exact_tokens:
- Choose Billing Entity
- Use Vertex AI
- Application Default Credentials (ADC)
- Service Account JSON
- Sign In with Google
- Use Gemini API Key
- /trust/MCP
- .cursor/rules/*.mdc
- Cursor Rules
- .cursorrules
- /confidence
negative_constraints:
- Project Rules are primary/native for Cursor docs/rules projection; .cursorrules remains legacy/deprecated compatibility.
compatibility_only_notes:
- .cursorrules and root compatibility files remain compatibility targets, not the primary managed artifact.
stale_retired_dispositions:
- .cursorrules is legacy/deprecated relative to .cursor/rules/*.mdc.
owner_boundary_notes:
- Provider-specific setup surfaces expose only readiness branches valid for the selected provider entry/account state.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md#Setup/Health-lifecycle-contracts, ContractName:Plans/usage-feature.md, ContractName:Plans/CLI_Bridged_Providers.md'
split_recommendation_reason: Provider-specific readiness branches close the S0027 split.
```

### MA-042 - Account Lifecycle Flows Registration Schema And Defaults

```yaml
plan_unit_id: MA-042
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: Provider settings expose account lifecycle controls in a consistent location while honoring provider-specific
  auth. Add, edit, remove/archive, and default account flows preserve credential revalidation, stable ULID account_id,
  canonical registration schema, closed status values, and exactly one default account or explicit no-default handling.
gui_related: true
gui_classification_reason: The unit defines settings GUI account lifecycle flows and confirmation dialogs.
split_recommended: true
depends_on:
- MA-041
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Add account, edit account, remove account/profile, and default account flows remain present.
- Credential rotation triggers re-auth or revalidation before returning to Ready.
- account_id remains a ULID.
- Canonical registration schema and status enum remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: account_lifecycle_flow
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: account_lifecycle_flow
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0028
preserved_exact_tokens:
- Settings -> Providers -> [Provider] -> Add Account
- display_name
- Remove from PM only
- Remove and archive PM-managed data
- account_id
- ULID
- '{ account_id: ulid, provider_id, display_name, auth_method, credential_ref, created_at, last_used_at, status }'
- active | expired | revoked | error
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Lifecycle controls are consistent but remain provider-specific where auth requirements differ.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: Account registration is split from provider-specific setup choices and button/removal safety.
```

### MA-043 - Provider-Specific Setup Choices And Remediation Actions

```yaml
plan_unit_id: MA-043
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: Provider-specific setup choices preserve Codex ChatGPT/API-key account entry labels and helper text, root-backed
  Fresh Login and Import Existing Auth modes, direct coding-plan provider API-key setup rows, remediation actions valid
  for the selected provider entry/account state, and explicit billing-entity refresh cadence.
gui_related: true
gui_classification_reason: The unit defines user-visible provider setup choices, helper text, and remediation actions.
split_recommended: true
depends_on:
- MA-042
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Codex add-account choices remain Sign in with ChatGPT and Use API Key.
- Generic stale browser/device-code/API-key matrix is not revived for Codex.
- Fresh Login, Import Existing Auth, and Environment/API-Key Setup remain provider-specific.
- Invalid remediation actions are hidden rather than generalized.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: provider_setup_remediation
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: provider_setup_remediation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0028
preserved_exact_tokens:
- Sign in with ChatGPT
- Use API Key
- Uses Codex through your ChatGPT plan limits
- Switching to ChatGPT-backed access may require signing out first
- Fresh Login
- Import Existing Auth
- Environment/API-Key Setup
- Alibaba Coding Plan
- MiniMax Coding Plan
- Z.AI Coding Plan
- Retry Sign-In
- Edit Auth Settings
- Repair Home
- Revalidate
- Refresh Entitlements
negative_constraints:
- Codex setup copy must not revive the stale browser/device-code/API-key matrix as the primary Codex account model.
compatibility_only_notes: []
stale_retired_dispositions:
- Stale Codex browser/device-code/API-key matrix is retired as the primary Codex setup model.
owner_boundary_notes:
- Provider setup surfaces expose only actions valid for the selected provider entry and account state.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: Provider-specific setup is split from registration schema and removal safety.
```

### MA-044 - Button State Contract And Removal Safety Rules

```yaml
plan_unit_id: MA-044
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: Row-level setup actions use explicit in-progress and terminal label transitions. Account/profile removal preserves
  requested/effective history, default-account removal atomically promotes an eligible account or leaves explicit no-default
  state, disabling does not delete roots, and removal avoids deleting non-PM-managed provider data outside the owned root.
gui_related: true
gui_classification_reason: The unit defines user-visible button states, terminal labels, and removal confirmations.
split_recommended: true
depends_on:
- MA-043
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Button-state labels remain explicit for sign in, save key, import, validate, refresh usage, and log out.
- Non-default removal preserves requested/effective history for past runs.
- Current-default removal promotes another eligible account or creates explicit no-default blocking state.
- Disabling an account/profile does not delete its root.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: button_state_removal_safety
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: button_state_removal_safety
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0028
preserved_exact_tokens:
- Sign In -> Signing In...
- Save Key -> Saving...
- Import -> Importing...
- Validate -> Validating...
- Refresh Usage -> Refreshing...
- Log Out -> Logging Out...
- Logged In
- Saved
- Logged Out
negative_constraints:
- Disabling an account/profile MUST NOT delete its root.
- Removal MUST avoid deleting non-PM-managed provider data outside the owned root.
compatibility_only_notes:
- Row-level setup actions use an explicit button-state contract.
stale_retired_dispositions: []
owner_boundary_notes:
- Backups and archives are for PM-managed artifacts only, not whole provider-home snapshots by default.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: Button states and removal safety close the S0028 split.
```

### MA-045 - Auth Flow Disclosure And Recovery Boundary

```yaml
plan_unit_id: MA-045
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: Authentication walkthroughs define PM-side orchestration around provider-native auth mechanisms. Every account
  setup/auth flow surfaces its active auth path, token refresh is either PM-managed or visibly delegated, and credential
  expiry produces user-visible notification and recovery action instead of silently degrading the account row.
gui_related: true
gui_classification_reason: The unit covers user-visible auth path disclosure, expiry notification, and recovery actions.
split_recommended: false
depends_on:
- MA-044
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- OAuth flows surface redirect, verification URL, or localhost callback state.
- API-key flows surface secure key entry.
- Token refresh ownership is visible.
- Credential expiry is visible and recoverable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: auth_flow_disclosure
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: auth_flow_disclosure
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0029
preserved_exact_tokens:
- Authentication flow walkthroughs
- redirect
- verification URL
- localhost callback
- secure API key entry
- token refresh
- user-visible notification
- recovery action
negative_constraints:
- Credential expiry must not silently degrade the account row.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Provider-native auth mechanisms are orchestrated by PM setup flows without replacing provider auth ownership.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs: []
split_recommendation_reason: The setup/auth flow disclosure span is narrow enough for one PlanUnit.
```

### MA-046 - API Key Setup Flow And Credential Storage

```yaml
plan_unit_id: MA-046
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: API-key setup lets the user select API Key, enter the key in a secure input, validate it with a lightweight
  provider call, store the key in the OS credential store on success, write the resulting credential_ref, mark the account
  active, and keep failed setup recoverable with a concrete reason.
gui_related: true
gui_classification_reason: The unit covers the visible API-key setup flow and secure input behavior.
split_recommended: false
depends_on:
- MA-045
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- API key entry uses a secure input field.
- PM validates the key before marking the account active.
- Secret material is stored in the OS credential store.
- Failure reasons are concrete and recoverable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: api_key_setup_flow
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: api_key_setup_flow
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0030
preserved_exact_tokens:
- API Key
- secure input field
- list models
- OS credential store
- credential_ref
- invalid key
- expired
- quota exceeded
negative_constraints:
- Failed API-key setup must not pretend setup succeeded.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- credential_ref is the stored non-secret handle after OS credential storage succeeds.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs: []
split_recommendation_reason: API-key setup is narrow enough for one PlanUnit.
```

### MA-047 - OAuth Device-Code Setup Flow

```yaml
plan_unit_id: MA-047
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: OAuth device-code setup requests a provider device code, shows the device code, verification URL, and QR code,
  lets the user complete authorization outside PM, polls for the token every five seconds for up to five minutes, stores
  refresh tokens in the OS credential store, keeps short-lived access tokens in memory only, and exposes clear retry on failure.
gui_related: true
gui_classification_reason: The unit covers visible device-code, URL, QR, timeout, and retry behavior.
split_recommended: false
depends_on:
- MA-046
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Device code, verification URL, and QR code are shown.
- Browser authorization happens outside PM.
- Token polling cadence and timeout remain explicit.
- Refresh tokens and access tokens use the specified storage/cache split.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: oauth_device_code_flow
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: oauth_device_code_flow
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0031
preserved_exact_tokens:
- Sign in with [Provider]
- device code
- verification URL
- QR code
- 5 seconds
- 5 minutes
- refresh token
- short-lived access token
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- OAuth authorization remains provider/browser-native while PM orchestrates polling and credential storage.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs: []
split_recommendation_reason: OAuth device-code setup is narrow enough for one PlanUnit.
```

### MA-048 - Gemini CLI Token Flow And Import Boundary

```yaml
plan_unit_id: MA-048
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: Gemini CLI token setup detects an installed CLI before presenting the option as ready, invokes CLI auth in
  the background, delegates native OAuth/browser and refresh behavior to the Gemini CLI runtime, records the token or
  credential handle through credential_ref, and imports only minimum auth-bearing state into the precreated PM-owned
  GEMINI_CLI_HOME root.
gui_related: false
gui_classification_reason: The unit covers CLI auth orchestration and import boundaries rather than GUI layout.
split_recommended: false
depends_on:
- MA-047
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Gemini CLI is detected before the CLI-token option is ready.
- CLI native OAuth/browser flow remains delegated.
- credential_ref records the resulting token or credential handle.
- Import Existing Gemini CLI Auth copies only minimum auth-bearing state.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: gemini_cli_token_flow
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: gemini_cli_token_flow
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0032
preserved_exact_tokens:
- Gemini CLI
- credential_ref
- Import Existing Gemini CLI Auth
- GEMINI_CLI_HOME
- native OAuth/browser flow
negative_constraints:
- Ongoing token refresh remains delegated to the Gemini CLI runtime rather than reimplemented inside PM.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- CLI-token setup is provider-runtime delegated while PM owns account row evidence and root import boundary.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: Gemini CLI token flow is narrow enough for one PlanUnit.
```

### MA-049 - Usage Runtime Visibility And Usage Consumer Boundary

```yaml
plan_unit_id: MA-049
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: Usage and status surfaces show current effective account/profile, effective auth mode, billing/entity context,
  pressure/cooldown state, source-confidence/stale/estimated labels, and switch/failover reason. Plans/usage-feature.md
  consumes this account/provider owner contract and must not reintroduce stale buckets or flatten direct-provider quota
  context into one generic account label.
gui_related: true
gui_classification_reason: The unit defines user-visible usage/status surface fields and labels.
split_recommended: false
depends_on:
- MA-048
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Usage/status surfaces show account, auth, billing/entity, pressure/cooldown, confidence, and switch reason fields.
- Plans/usage-feature.md remains a consumer and does not flatten provider quota context.
- Usage rows prefer plain-language statuses or concrete failure reasons over transport-internal terminology.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_runtime_visibility
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: usage_runtime_visibility
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0033
preserved_exact_tokens:
- current effective account or server profile
- current effective auth mode
- current effective billing/entity context
- pressure/cooldown state
- source-confidence
- stale
- estimated labels
- switch/failover reason
- Plans/usage-feature.md
- Working
negative_constraints:
- Usage sections must not reintroduce stale provider buckets or flatten direct-provider quota context into one generic account label.
compatibility_only_notes: []
stale_retired_dispositions:
- source-confidence, stale, or estimated labels are retained when data is not authoritative.
owner_boundary_notes:
- Plans/usage-feature.md consumes the Multi-Account account/provider owner contract.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md'
split_recommendation_reason: Usage/runtime visibility is narrow enough for one PlanUnit.
```

### MA-050 - Instruction Skills And MCP Agent-Config Exposure

```yaml
plan_unit_id: MA-050
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: Agent-Config exposes shared instruction panes sourced from PM AGENTS-layer intent, provider-native advanced
  panes for GitHub Copilot, PM-native skills with readiness/fix text/actions, and PM-native MCP servers with per-provider
  and per-runtime effective status in inspectors.
gui_related: true
gui_classification_reason: The unit defines Agent-Config instruction, skill, MCP, and inspector GUI exposure.
split_recommended: true
depends_on:
- MA-049
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Shared instruction panes remain sourced from PM AGENTS-layer intent.
- GitHub Copilot provider-native advanced panes remain visible.
- PM-native skills expose readiness/fix text/actions.
- PM-native MCP servers expose per-provider/runtime effective status in inspectors.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: agent_config_instruction_skill_mcp
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: agent_config_instruction_skill_mcp
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0034
preserved_exact_tokens:
- AGENTS.md
- CLAUDE.md
- GEMINI.md
- Cursor Rules
- GitHub Copilot
- PM-native skills
- PM-native MCP servers
- per-provider/runtime effective status
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Skills and MCP are PM-native rows; provider/runtime state appears in inspectors.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Skills_System.md, ContractName:Plans/Tools.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: Multi-Account-S0034 is split between exposure, projection schema, repair rules, and import/path scope.
```

### MA-051 - Projection Record Schema And Drift GUI Audit

```yaml
plan_unit_id: MA-051
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: Provider-native files under PM control expose drift states and repair/detach/diff actions. Projection records
  preserve control_mode, drift_state, projection timestamps/targets, instruction_projection metadata, source revision,
  target kind/path, preview hash, requested runtime snapshot, and drift check timestamps so PM can prove what was projected.
gui_related: true
gui_classification_reason: The unit defines projection GUI records, drift states, and audit fields.
split_recommended: true
depends_on:
- MA-050
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Provider-native generated artifacts do not become source of truth when edited directly.
- Drift states and repair/detach/view diff actions remain visible.
- Projection records preserve canonical revision, target kind, target path, preview hash, and runtime snapshot.
- last_projected_at and last_drift_check_at remain inspectable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: projection_drift_audit
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: projection_drift_audit
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0034
preserved_exact_tokens:
- In Sync
- PM Outdated
- Provider Modified
- Projection Failed
- Unknown
- Repair
- Detach
- View diff
- control_mode = pm_controlled | manual_override
- drift_state = in_sync | pm_outdated | provider_modified | projection_failed | unknown
- instruction_projection
- canonical_revision
- projection_target_kind = agents_md | claude_md | gemini_md | cursor_rules
- target_path
- preview_hash
- requested_runtime_snapshot
- last_projected_at
- last_drift_check_at
negative_constraints:
- Provider-native files edited directly are reported as drift rather than treated as the new source of truth.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Provider-native rule/settings files are generated artifacts derived from one canonical instruction model.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Skills_System.md, ContractName:Plans/Tools.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: Projection record schema is split from conflict/repair rules.
```

### MA-052 - Conflict Manual Override And Repair Rules

```yaml
plan_unit_id: MA-052
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: Projection conflict handling records conflict policy and drift detection mode. Repair may overwrite only
  PM-managed portions of profile/config surfaces PM owns, direct provider-native edits require Manual Override before
  editing, canonical-source edits keep semantic sync across controlled targets, and Provider Modified must not auto-overwrite
  at launch.
gui_related: true
gui_classification_reason: The unit preserves visible conflict, manual override, repair, and launch warning behavior.
split_recommended: true
depends_on:
- MA-051
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- conflict_policy and drift_detection fields remain explicit.
- Drift repair preserves manual/provider-owned sections.
- Editing PM Controlled provider-native targets requires Manual Override first.
- Provider Modified does not auto-overwrite at launch.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: projection_conflict_repair
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: projection_conflict_repair
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0034
preserved_exact_tokens:
- conflict_policy = pm_wins | manual_review | provider_wins
- drift_detection = hash | mtime | disabled
- /drift
- /overwrite
- PM Controlled
- Manual Override
- Provider Modified
negative_constraints:
- Provider Modified must not auto-overwrite at launch.
- Drift repair must never clobber an entire provider profile merely because one PM-controlled target diverged.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Editing the canonical source is the only path that keeps semantic sync across controlled targets.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Skills_System.md, ContractName:Plans/Tools.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: Conflict/repair rules are split from projection path/import scope.
```

### MA-053 - Projection Paths Server Profiles And Minimal Import Scope

```yaml
plan_unit_id: MA-053
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: Workspace projections, provider-local config, rules, instructions, agents, skill rows, MCP rows, provider entry
  metadata, OpenCode sidecar layout, and import metadata remain separate from provider account roots. Import Existing Auth
  copies only minimum auth-bearing material into the PM-owned root, source-side migration/cache/log/backup paths are not
  automatic wholesale imports, and Import Existing Codex Auth remains optional/non-MVP.
gui_related: true
gui_classification_reason: The unit preserves GUI-visible projection paths, skill/MCP rows, and import controls.
split_recommended: true
depends_on:
- MA-052
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Workspace projections remain tracked separately from provider account roots.
- Skill rows use plain-language statuses, fix text, and primary remediation actions.
- MCP rows are server-centric at the top level.
- Import Existing Auth copies only minimum auth-bearing material.
- Import Existing Codex Auth remains optional/non-MVP.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: projection_path_import_scope
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: projection_path_import_scope
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0034
preserved_exact_tokens:
- AGENTS.md
- CLAUDE.md
- GEMINI.md
- .cursor/rules/*.mdc
- cursor/rules/*.mdc
- .mcp.json
- .github/copilot-instructions.md
- .github/instructions/*.instructions.md
- .github/agents/*.agent.md
- agent.md
- instructions.md
- /rules/
- /instructions/
- /agents/
- display_name
- enabled
- supports_family_pooling
- default_model_id_raw
- pm/state.json
- pm/logs/
- pm/projections/
- pm/backups/
- Import Existing Auth
- /migration
- /caches
- /logs/
- /backups/
- Import Existing Codex Auth
negative_constraints:
- Import Existing Auth must not wholesale clone unrelated provider history, caches, logs, projections, or backups by default.
compatibility_only_notes:
- Import Existing Codex Auth is optional/non-MVP.
stale_retired_dispositions: []
owner_boundary_notes:
- Imported account or server profile runs from the PM-owned root after import; source path remains audit/debug metadata.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Skills_System.md, ContractName:Plans/Tools.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: Projection path and import scope close the S0034 split.
```

### MA-054 - Native Auth In-Process Token Store

```yaml
plan_unit_id: MA-054
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: >-
  Native auth for Codex, Copilot, Gemini, and optionally Claude uses an in-process Rust token store shaped after OpenCode
  PR #11832, with providers[platform_id], active, order, records for per-account tokens and health, file locking for
  writes, and best-effort health updates.
gui_related: false
gui_classification_reason: The unit covers native auth token storage and account health records rather than GUI presentation.
split_recommended: true
depends_on:
- MA-053
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Native auth token-store shape preserves providers[platform_id], active, order, and records.
- Per-account token and health records remain represented.
- File lock for writes and best-effort health updates remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: native_auth_token_store
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: native_auth_token_store
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0035
preserved_exact_tokens:
- Codex
- Copilot
- Gemini
- Claude
- OpenCode PR #11832
- providers[platform_id]
- active
- order
- records
- per-account tokens + health
- File lock for writes
- best-effort for health updates
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Native auth remains a future-phase account-store shape and does not create executable work in this PlanUnit.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs: []
split_recommendation_reason: Multi-Account-S0035 is split into token store, rotating fetch, and current-account context.
```

### MA-055 - Native Auth Rotating Fetch And Cooldown Failover

```yaml
plan_unit_id: MA-055
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: >-
  Native auth HTTP calls use rotating fetch: get candidates active first and then order, filter by cooldown, and on 429,
  401, or 403 apply cooldown, move the account to back, notify, and retry with the next account.
gui_related: false
gui_classification_reason: The unit covers HTTP failover and cooldown handling rather than GUI presentation.
split_recommended: true
depends_on:
- MA-054
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Candidate ordering remains active first, then order.
- Cooldown filtering occurs before HTTP calls.
- 429/401/403 responses apply cooldown, moveToBack, notify, and retry next account.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: native_auth_rotating_fetch
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: native_auth_rotating_fetch
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0035
preserved_exact_tokens:
- Rotating fetch
- active first, then order
- cooldown
- 429/401/403
- apply cooldown
- moveToBack
- notify
- retry with next account
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Rotating fetch is the native-auth HTTP failover shape for future in-process auth.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs: []
split_recommendation_reason: Rotating fetch is split from token-store and current-account context.
```

### MA-056 - Request-Scoped Current Account Context

```yaml
plan_unit_id: MA-056
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: Native auth current-account state is request-scoped through an explicit context struct or thread-local in
  Rust, preserving the negative constraint that Rust does not use AsyncLocalStorage for this account context.
gui_related: false
gui_classification_reason: The unit defines native runtime context propagation rather than GUI presentation.
split_recommended: true
depends_on:
- MA-055
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Current account state is request-scoped.
- Explicit context struct or thread-local approaches remain allowed.
- no AsyncLocalStorage in Rust remains preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: native_auth_current_account_context
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: native_auth_current_account_context
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0035
preserved_exact_tokens:
- Current account
- current account
- explicit context struct
- thread-local
- no AsyncLocalStorage in Rust
negative_constraints:
- Native auth current-account propagation does not use AsyncLocalStorage in Rust.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Current account context is scoped per request, not a global account bucket.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs: []
split_recommendation_reason: Current-account context closes the S0035 split.
```

### MA-057 - Implementer Confirmation Guardrails

```yaml
plan_unit_id: MA-057
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: The Multi-Account document has no remaining design-open questions for the Gemini auth/account model.
  Implementation confirmations are limited to provider adapter details, migration sequencing, and exact UI copy polish,
  and must not change locked defaults, precedence order, requested/effective field names, or the Gemini media account model.
gui_related: true
gui_classification_reason: The unit includes exact UI copy polish as an allowed implementer confirmation area.
split_recommended: false
depends_on:
- MA-056
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Gemini auth/account model has no design-open questions in this document.
- Allowed confirmations remain limited to provider adapter details, migration sequencing, and exact UI copy polish.
- Locked defaults, precedence order, requested/effective field names, and media account model remain unchanged by confirmations.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: implementer_confirmation_guardrail
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: implementer_confirmation_guardrail
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0036
preserved_exact_tokens:
- Gemini auth/account model
- provider adapter details
- migration sequencing
- exact UI copy polish
- MUST NOT change
- locked defaults
- precedence order
- requested/effective field names
- media follows the same Gemini auth/account model as normal provider usage
negative_constraints:
- Implementer confirmations MUST NOT change locked defaults, precedence order, requested/effective field names, or the Gemini media account model.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Remaining implementation confirmations are bounded and cannot reopen product decisions.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD'
split_recommendation_reason: The implementer guardrail span is narrow enough for one PlanUnit.
```

### MA-058 - Operational Identity Class Inventory

```yaml
plan_unit_id: MA-058
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: Multi-Account distinguishes provider accounts from operational identities needed by GitHub Actions and Docker
  Manager, including github_api account identity for GitHub Actions, registry account identity or namespace identity for
  Docker Manager, and Kubernetes context or cluster identity for the Docker Manager Kubernetes subview.
gui_related: false
gui_classification_reason: The unit defines backend/runtime identity classes rather than direct GUI presentation.
split_recommended: true
depends_on:
- MA-057
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Provider accounts remain distinct from operational identities.
- github_api identity remains tied to GitHub Actions.
- Registry account or namespace identity remains tied to Docker Manager.
- Kubernetes context or cluster identity remains tied to Docker Manager Kubernetes subview.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: operational_identity_inventory
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: operational_identity_inventory
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0037
preserved_exact_tokens:
- Operational Identity Addendum for GitHub Actions and Docker Manager (2026-03-12)
- github_api
- GitHub Actions surface
- registry account identity
- namespace identity
- Docker Manager
- Kubernetes context
- cluster identity
- Docker Manager Kubernetes subview
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Operational identity classes are required by GitHub Actions and Docker Manager without replacing provider accounts.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/Containers_Registry_and_Unraid.md, ContractName:Plans/Permissions_System.md'
split_recommendation_reason: Multi-Account-S0037 is split between identity inventory and visible boundary rules.
```

### MA-059 - Operational Identity Boundary And Partial-Capability Visibility

```yaml
plan_unit_id: MA-059
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: Operational identity state may be displayed alongside provider/account state, but it must not imply shared
  ownership or token source unless the owning auth contract says so. Requested versus effective state remains visible when
  an operational identity exists but capability is partial.
gui_related: true
gui_classification_reason: The unit explicitly covers displayed operational identity state and visible requested/effective state.
split_recommended: true
depends_on:
- MA-058
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Operational identity display does not imply shared provider account ownership or token source.
- Owning auth contracts remain authoritative for operational identity token ownership.
- Requested versus effective state remains visible when capability is partial.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: operational_identity_visibility
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: operational_identity_visibility
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0037
preserved_exact_tokens:
- operational identity state
- provider/account state
- ownership
- token source
- requested vs effective state
- capability is partial
negative_constraints:
- Operational identity state must not imply shared ownership or token source unless the owning auth contract says so.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Requested/effective state remains visible for partial operational identity capability.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/Containers_Registry_and_Unraid.md, ContractName:Plans/Permissions_System.md'
split_recommendation_reason: Visibility and token-source guardrails close the S0037 split.
```

### MA-001 - Multi-Account Retired Source-Preserving Bridge

```yaml
plan_unit_id: MA-001
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: >-
  MA-001 is retired to migration-lineage-only compatibility disposition after Phase 2B batch 102 because
  Multi-Account-S0001 through Multi-Account-S0041 are covered by MA-002 through MA-059 or explicit structural, retired,
  and migration-coverage dispositions. MA-001 no longer carries source_preserving_planunit compile mode and must not own
  product coverage.
gui_related: false
gui_classification_reason: The live unit is retired migration-lineage compatibility only; GUI-related source coverage is
  carried by fine-grained Multi-Account PlanUnits and coverage_map proof.
split_recommended: false
depends_on:
- MA-054
- MA-055
- MA-056
- MA-057
- MA-058
- MA-059
unblocks: []
acceptance_criteria:
- MA-001 no longer uses node_compile_hint.mode source_preserving_planunit after Phase 2B batch 102.
- Multi-Account-S0001 through Multi-Account-S0041 product coverage is owned by MA-002 through MA-059 or explicit structural, retired, and migration-coverage dispositions.
- MA-001 remains only to preserve migration lineage for the former source-preserving bridge.
- The retired bridge does not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: migration_lineage
reasoning_tier: standard
context_scope: residual_plan_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: source_preserving_bridge_retired
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0040
preserved_exact_tokens:
- MA-001
- Multi-Account Specification Source-Preserving PlanUnit
- source_preserving_planunit
- source_preserving_bridge_retired
- Owner / Consumer Map
- PlanUnits
- Migration Coverage
negative_constraints:
- MA-001 must not re-own Multi-Account-S0001 through Multi-Account-S0041 after Phase 2B batch 102.
- MA-001 must not use node_compile_hint.mode=source_preserving_planunit.
- Retired bridge lineage must not be treated as implementation-ready product coverage.
- The retired bridge must not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
compatibility_only_notes:
- MA-001 remains only as a retired source-preserving bridge audit record for migration lineage.
- The token source_preserving_planunit is preserved for audit compatibility only and is not the node compile mode.
stale_retired_dispositions:
- The former MA-001 residual source-preserving bridge is retired by Phase 2B batch 102.
owner_boundary_notes:
- MA-002 through MA-059 and explicit coverage dispositions own Multi-Account product coverage after bridge retirement.
- Multi-Account-S0040 is migration-lineage coverage only after bridge retirement.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md'
split_recommendation_reason: The former source-preserving bridge has been atomized or structurally dispositioned and is now retired.
```

### MA-060 - Goal Runtime Account Identity Consumer

```yaml
plan_unit_id: MA-060
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: >-
  Multi-Account owns requested/effective account identity for Goal Runtime worker, planner, evaluator, verifier, and adjudicator provider use. Goal Runtime consumes account identity and role scope, but does not redefine account stickiness, failover, quota pressure, or provider-account policy.
gui_related: false
gui_classification_reason: Requested/effective account identity and role-scoped provider-account policy are backend account-resolution behavior; F3-393 owns visible Settings placement.
depends_on:
  - MA-009
  - MA-015
  - MA-056
  - MS-108
unblocks: []
acceptance_criteria:
  - Goal Runtime role execution can carry requested and effective account identity for worker, planner, evaluator, verifier, and adjudicator provider use.
  - Multi-Account keeps ownership of account stickiness, failover, quota pressure, and provider-account policy.
  - Goal Runtime consumes role-scoped account identity without redefining provider-account behavior.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future Goal Runtime account-identity resolver review
risk_class: goal_runtime_account_identity_drift
reasoning_tier: high
context_scope: goal_runtime_account_policy
implementation_surfaces:
  - Plans/Multi-Account.md
  - Plans/Models_System.md
  - Plans/Goal_Runtime_System.md
node_compile_hint:
  mode: goal_runtime_account_identity_consumer
  create_worknodes: false
source_lineage:
  - pldg-20260616-001-goal-runtime-system:atom-0075
  - pldg-20260616-001-goal-runtime-system:atom-0076
  - pldg-20260616-001-goal-runtime-system:atom-0104
  - pldg-20260616-001-goal-runtime-system:atom-0105
  - pldg-20260616-001-goal-runtime-system:dec-0018
  - pldg-20260616-001-goal-runtime-system:dec-0019
preserved_exact_tokens:
  - "requested/effective account identity"
  - "worker"
  - "planner"
  - "evaluator"
  - "verifier"
  - "adjudicator"
  - "account stickiness"
  - "failover"
  - "quota pressure"
negative_constraints:
  - Do not let Goal Runtime redefine account stickiness, failover, quota pressure, or provider-account policy.
  - Do not infer effective account identity from model role alone.
owner_hints:
  - Plans/Multi-Account.md
  - Plans/Models_System.md
  - Plans/Goal_Runtime_System.md
```
