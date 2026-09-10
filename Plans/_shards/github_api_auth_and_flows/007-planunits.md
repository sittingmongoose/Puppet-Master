# Shard 007: PlanUnits

Source: `Plans/GitHub_API_Auth_and_Flows.md`

Source lines: L162-L806

Source SHA256: `3109298d54ea966d7161ce851efa826bbb71ce09feba86cc2cc2b79fdaa307a2`

---

## PlanUnits

### GAAAF-002 - Locked GitHub API Auth Decisions And Credential Secrecy

```yaml
plan_unit_id: GAAAF-002
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_API_Auth_and_Flows.md
canonical_text: GitHub platform operations use the github_api realm with the GitHub API provider, OAuth device-code default auth flow, no external auth-shell dependency, and secrets stored only in the OS credential store rather than seglog, redb, Tantivy, or logs.
gui_related: false
gui_classification_reason: This unit defines provider/auth and credential-storage rules, not GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad GAAAF-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: github_auth_drift
reasoning_tier: standard
context_scope: github_api_auth_standardization
implementation_surfaces:
- Plans/GitHub_API_Auth_and_Flows.md
node_compile_hint:
  mode: locked_github_api_auth_decisions_credential_secrecy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GitHub_API_Auth_and_Flows-S0001
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GitHub_API_Auth_and_Flows-S0003
preserved_exact_tokens:
- Puppet Master -- GitHub API Auth and Flows
- github_api
- GitHub API provider only
- OAuth device-code
- no external auth-shell dependency
- No secrets in seglog/redb/Tantivy or logs
- OS credential store
- repo create, fork, PR, and permission checks
negative_constraints:
- Generic API key, HTTP auth, OAuth 2.0, OpenID Connect, and mTLS mechanisms do not replace the github_api OAuth device-code flow or OS credential-store token boundary.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/GitHub_API_Auth_and_Flows.md owns GitHub API auth realm, token storage boundary, and GitHub REST /platform operation authorization.
owner_hints:
- Plans/GitHub_API_Auth_and_Flows.md
preserved_contractrefs:
- 'ContractRef: SchemaID:Spec_Lock.json#github_operations, Primitive:PatchPipeline, Primitive:Provider'
split_recommendation_reason: GitHub_API_Auth_and_Flows-S0003 also contains remote consumer and GUI disabled-state concerns covered by GAAAF-003.
```

### GAAAF-003 - Local Git, GitHub Hosting, And Remote Consumer Boundary

```yaml
plan_unit_id: GAAAF-003
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_API_Auth_and_Flows.md
canonical_text: Local Git operations remain performed by the local git binary while GitHub hosting operations use the GitHub HTTPS API; GitHub Copilot auth does not authorize repository/platform mutations, github_api tokens never transfer to SSH remotes or local Git credential helpers, and GitHub_Integration remote surfaces consume FileSafe mutation-safety, write-scope, and durability contracts.
gui_related: true
gui_classification_reason: This unit includes user-visible blocked/runtime and disabled-state behavior for GitHub surfaces as well as remote-surface consumer routing.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad GAAAF-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: github_auth_drift
reasoning_tier: standard
context_scope: github_api_auth_standardization
implementation_surfaces:
- Plans/GitHub_API_Auth_and_Flows.md
node_compile_hint:
  mode: local_git_github_hosting_remote_consumer_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GitHub_API_Auth_and_Flows-S0003
preserved_exact_tokens:
- Local Git operations
- GitHub HTTPS API
- GitHub Copilot auth does not authorize
- github_api tokens never transfer to SSH remotes
- canonical blocked/runtime condition
- GitHub_Integration.md
- /remote
- FileSafe.md mutation-safety
negative_constraints:
- An expired or insufficient GitHub API credential is not a panel-local refresh case.
- Hosted and SSH remote mutations must not bypass the FileSafe owner.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/GitHub_Integration.md remains the consumer cross-reference for /remote GitHub surfaces.
- Plans/FileSafe.md owns mutation-safety, write-scope, and durability contracts consumed by hosted and SSH remote mutations.
owner_hints:
- Plans/GitHub_API_Auth_and_Flows.md
preserved_contractrefs:
- 'ContractRef: SchemaID:Spec_Lock.json#github_operations, Primitive:PatchPipeline, Primitive:Provider'
split_recommendation_reason: GitHub_API_Auth_and_Flows-S0003 also carries core auth realm and credential secrecy constraints covered by GAAAF-002.
```

### GAAAF-004 - Cross-owner Command Routing And Loopback Callback Policy

```yaml
plan_unit_id: GAAAF-004
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_API_Auth_and_Flows.md
canonical_text: GitHub command and routing dependencies stay owned by Permissions_System, UI_Command_Catalog, WorktreeGitImprovement, and Progression_Gates; wizard/thread resume URLs normalize through object and scope identity, and OAuth callback listeners are loopback-only for the active local, WSL, container, or remote-dev context.
gui_related: false
gui_classification_reason: This unit defines command routing, owner-doc dependencies, and auth callback binding constraints, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad GAAAF-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: github_auth_drift
reasoning_tier: standard
context_scope: github_api_auth_standardization
implementation_surfaces:
- Plans/GitHub_API_Auth_and_Flows.md
node_compile_hint:
  mode: cross_owner_command_routing_loopback_callback_policy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GitHub_API_Auth_and_Flows-S0004
preserved_exact_tokens:
- Permissions_System.md
- UI_Command_Catalog.md
- WorktreeGitImprovement.md
- Progression_Gates.md
- resume_url
- /open
- loopback-only
- bind-address
- bind-host
- wildcard/public-interface callback binds are invalid
negative_constraints:
- Wildcard/public-interface callback binds are invalid.
- /open behavior normalizes through canonical object identity and scope identity before using resume_url.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Permissions_System owns scope-keyed approval semantics and snapshots consumed by GitHub API mutation gates.
- UI_Command_Catalog owns governance command families, route-payload normalization, and projection-freshness gating.
- WorktreeGitImprovement owns lane and /worktree lifecycle vocabulary, cleanup semantics, gating checks, and transition rules.
- Progression_Gates owns package-completion and seam-transition gates consumed by GitHub orchestration.
owner_hints:
- Plans/GitHub_API_Auth_and_Flows.md
```

### GAAAF-005 - GitHub Host Policy And Enterprise Disabled-state UX

```yaml
plan_unit_id: GAAAF-005
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_API_Auth_and_Flows.md
canonical_text: The github_host_policy distinguishes github.com_only and enterprise_allowed; if MVP remains github.com_only, GHES repositories and GitHub Enterprise Server URLs receive deterministic disabled-state UX rather than hidden fallback or accidental downgraded behavior.
gui_related: true
gui_classification_reason: This unit defines deterministic user-visible disabled-state UX for unsupported GitHub Enterprise Server repositories.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad GAAAF-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: github_auth_drift
reasoning_tier: standard
context_scope: github_api_auth_standardization
implementation_surfaces:
- Plans/GitHub_API_Auth_and_Flows.md
node_compile_hint:
  mode: github_host_policy_enterprise_disabled_state_ux
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GitHub_API_Auth_and_Flows-S0005
preserved_exact_tokens:
- github_host_policy
- github.com_only
- enterprise_allowed
- GHES repositories
- GitHub Enterprise Server URLs
- deterministic disabled-state UX
- hidden fallback
- accidental downgraded behavior
negative_constraints:
- GHES repositories and GitHub Enterprise Server URLs must not receive hidden fallback or accidental downgraded behavior when MVP policy is github.com_only.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/GitHub_API_Auth_and_Flows.md
```

### GAAAF-006 - Stable Account Identity And Credential Reference Keying

```yaml
plan_unit_id: GAAAF-006
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_API_Auth_and_Flows.md
canonical_text: 'GitHub identity is account-keyed rather than login-keyed: stable account_id is the durable join key, credential_ref points to the credential-store entry that authorizes the account, and runtime/mutation envelopes carry requested/effective account identity, account metadata, execution role, operational identity, and account_switch_lineage.'
gui_related: false
gui_classification_reason: This unit defines identity and credential data shapes, not GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad GAAAF-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: github_auth_drift
reasoning_tier: standard
context_scope: github_api_auth_standardization
implementation_surfaces:
- Plans/GitHub_API_Auth_and_Flows.md
node_compile_hint:
  mode: stable_account_identity_credential_reference_keying
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GitHub_API_Auth_and_Flows-S0008
preserved_exact_tokens:
- account_id
- credential_ref
- requested_account_id
- effective_account_id
- account_type
- account_login
- execution_role
- operational_identity
- account_switch_lineage[]
- account-keyed, not login-keyed
negative_constraints:
- account_login and provider-native handles stay descriptive only.
- GitHub auth retry and failover must follow multi-account policy and must not stop at provider/model labels.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Credential authorization is represented by credential_ref, while login and disclosure-only provider metadata remain display/audit descriptors.
owner_hints:
- Plans/GitHub_API_Auth_and_Flows.md
split_recommendation_reason: GitHub_API_Auth_and_Flows-S0008 also defines requested/effective account disclosure UI covered by GAAAF-007.
```

### GAAAF-007 - Requested Effective Account Disclosure And Blocked Copy

```yaml
plan_unit_id: GAAAF-007
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_API_Auth_and_Flows.md
canonical_text: Requested-vs-effective admin capability UI displays stable account_id, effective account, and switch reason, while blocked-state copy explains why a requested account was skipped, clamped, or fell through.
gui_related: true
gui_classification_reason: This unit defines visible admin capability UI and blocked-state copy.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad GAAAF-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: github_auth_drift
reasoning_tier: standard
context_scope: github_api_auth_standardization
implementation_surfaces:
- Plans/GitHub_API_Auth_and_Flows.md
node_compile_hint:
  mode: requested_effective_account_disclosure_blocked_copy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GitHub_API_Auth_and_Flows-S0008
preserved_exact_tokens:
- requested-vs-effective admin capability UI
- stable account_id
- effective-account
- switch-reason
- blocked-state copy
- skipped
- clamped
- fell through
- display-only
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/GitHub_API_Auth_and_Flows.md
split_recommendation_reason: GitHub_API_Auth_and_Flows-S0008 also contains non-GUI stable identity and credential-reference rules covered by GAAAF-006.
```

### GAAAF-008 - Command Surface Trust And Projection Gating

```yaml
plan_unit_id: GAAAF-008
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_API_Auth_and_Flows.md
canonical_text: GitHub command surfaces normalize through cmd.runtime and cmd.orchestrator.open_in_* bindings, allow only low-risk presentation/navigation in weakened projection states, require current or direct canonical-runtime validation before mutation/recovery/retry/cleanup, and display contextual help, projection-health, trust-state, historical-run, idle, and degraded-mode state before mutation-capable actions are enabled.
gui_related: true
gui_classification_reason: This unit defines user-visible command gating, disabled/degraded states, contextual help, and projection-health surfaces.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad GAAAF-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: github_auth_drift
reasoning_tier: standard
context_scope: github_api_auth_standardization
implementation_surfaces:
- Plans/GitHub_API_Auth_and_Flows.md
node_compile_hint:
  mode: command_surface_trust_projection_gating
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GitHub_API_Auth_and_Flows-S0009
preserved_exact_tokens:
- cmd.runtime
- cmd.orchestrator.open_in_*
- Trust/degraded-state split
- contextual-help-only
- projection-health
- trust-state
- historical-run rendering
- idle widget rendering
- /degraded-mode
- mutation-capable actions
negative_constraints:
- contextual-help-only guidance never upgrades a disabled or degraded action into an executable mutation.
- Gating level none is limited to safe navigation or /focus actions and low-risk presentation actions that do not touch user-data or mutate live-runtime state.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/GitHub_API_Auth_and_Flows.md
split_recommendation_reason: GitHub_API_Auth_and_Flows-S0009 mixes visible command gating with recovery payload, identity, capability, and attribution constraints.
```

### GAAAF-009 - Recovery Context Payload And Mutation Preconditions

```yaml
plan_unit_id: GAAAF-009
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_API_Auth_and_Flows.md
canonical_text: GitHub mutation and recovery payloads consume execution_unit_context and recovery_context with blocked sequence, blocked episode, recovery handshake, trust state, degraded state, optional approval, and DAE jail posture; mutations proceed only after startup recovery rebinds the current blocked episode, trust_state is writable, degraded_state is false, and approval or DAE jail gates are cleared.
gui_related: false
gui_classification_reason: This unit defines runtime recovery payload and mutation preconditions, not GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad GAAAF-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: github_auth_drift
reasoning_tier: standard
context_scope: github_api_auth_standardization
implementation_surfaces:
- Plans/GitHub_API_Auth_and_Flows.md
node_compile_hint:
  mode: recovery_context_payload_mutation_preconditions
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GitHub_API_Auth_and_Flows-S0009
preserved_exact_tokens:
- execution_unit_context
- recovery_context
- blocked_sequence
- blocked_episode_id
- recovery_handshake_state
- trust_state
- degraded_state
- approval_id?
- dae_jail_posture
- startup recovery handshake
negative_constraints:
- A GitHub mutation may proceed only after the startup recovery handshake rebinds the current blocked episode, trust_state is writable, degraded_state is false, and any approval or DAE jail gate has been cleared.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/GitHub_API_Auth_and_Flows.md
split_recommendation_reason: GitHub_API_Auth_and_Flows-S0009 mixes recovery payload rules with visible command gating and cross-surface attribution constraints.
```

### GAAAF-010 - Cross-surface Identity Capability And Attribution Constraints

```yaml
plan_unit_id: GAAAF-010
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_API_Auth_and_Flows.md
canonical_text: Multi-account GitHub and widget data sourcing, GitHub/integration pivots, mutation/recovery audits, HITL/policy recovery, skills/formatters/DAE/tool reachability, and Orchestrator/Source Control routing preserve lane, package, runtime, degraded-trust, workspace, provider-attempt, node attempt, and current blocked-sequence ownership instead of falling back to pre-rewrite, single-account, GitHub-local auth, or graph-authority shortcuts.
gui_related: false
gui_classification_reason: This unit defines cross-surface ownership, attribution, and capability constraints, not GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad GAAAF-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: github_auth_drift
reasoning_tier: standard
context_scope: github_api_auth_standardization
implementation_surfaces:
- Plans/GitHub_API_Auth_and_Flows.md
node_compile_hint:
  mode: cross_surface_identity_capability_attribution_constraints
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GitHub_API_Auth_and_Flows-S0009
preserved_exact_tokens:
- /GitHub
- /integration
- lane
- package
- /runtime
- degraded-trust
- /package/degraded-trust
- workspace and provider-attempt anchors
- /HITL/policy
- /skills/formatters
- DAE
- runtime tool reachability
- Orchestrator and Source Control stay intentionally asymmetric
negative_constraints:
- Multi-account GitHub and widget data sourcing must not fall back to pre-rewrite or single-account-only identity rules.
- Capability boundaries must not remain under-owned or be recreated as GitHub-local auth rules.
- GitHub routes preserve Orchestrator/Source Control asymmetry rather than treating repository hosting as the graph authority.
- Routing, blocked-family, and attribution flows reconcile end-to-end before GitHub-facing commands claim a recoverable, attributable, or safe-to-mutate state.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Orchestrator owns package /governance/execution truth.
- Source Control owns concrete Git /worktree inspection and mutation.
owner_hints:
- Plans/GitHub_API_Auth_and_Flows.md
split_recommendation_reason: GitHub_API_Auth_and_Flows-S0009 mixes these ownership constraints with GUI gating and recovery preconditions.
```

### GAAAF-011 - Runtime Identity And Blocked-policy Transfer

```yaml
plan_unit_id: GAAAF-011
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_API_Auth_and_Flows.md
canonical_text: GitHub write attempts transfer execution_role, requested_account_id, operational_identity, account-switch and pressure ownership, blocked_sequence minting, startup recovery handshake, DAE jail, approval policy, usage switch-history, and usage execution-role follow-through into owner and consumer docs, and usage/audit rows record the identities and credential reference that actually executed the call.
gui_related: false
gui_classification_reason: This unit defines runtime identity transfer and audit fields, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad GAAAF-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: github_auth_drift
reasoning_tier: standard
context_scope: github_api_auth_standardization
implementation_surfaces:
- Plans/GitHub_API_Auth_and_Flows.md
node_compile_hint:
  mode: runtime_identity_blocked_policy_transfer
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GitHub_API_Auth_and_Flows-S0010
preserved_exact_tokens:
- execution_role
- requested_account_id
- operational_identity
- account-switch
- pressure ownership
- blocked_sequence
- startup recovery handshake
- DAE jail/approval policy
- usage switch-history
- usage/audit rows
- account_id / credential_ref
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/GitHub_API_Auth_and_Flows.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/Prompt_Pipeline.md'
```

### GAAAF-012 - Browser Debug Auth Handoff And Session Shaping

```yaml
plan_unit_id: GAAAF-012
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_API_Auth_and_Flows.md
canonical_text: Ordinary browser session-shaping actions remain explicit_confirmation operations when they mutate cookies, storage, export/import state, offline mock routing, or promotion. Interactive app-debug or provider login enters attention_required and hands foreground control to a protected human-only AuthBrowserSession; protected state never returns to automation, artifacts, inspection, persistence, or generic navigation.
gui_related: false
gui_classification_reason: This unit defines browser automation auth handoff and session mutation policy, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad GAAAF-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: github_auth_drift
reasoning_tier: standard
context_scope: github_api_auth_standardization
implementation_surfaces:
- Plans/GitHub_API_Auth_and_Flows.md
node_compile_hint:
  mode: browser_debug_auth_handoff_session_shaping
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GitHub_API_Auth_and_Flows-S0011
preserved_exact_tokens:
- explicit_confirmation
- cookies
- /storage
- storage /export
- import state
- offline /mock routing
- normal browsing
- isolated automation session
- /device/login
- auth_session
negative_constraints:
- Browser session-shaping actions remain explicit_confirmation operations when they mutate cookies, storage, export/import state, mock routing, or promotion into normal browsing.
- The preserved auth_session token is legacy lineage only and grants no automation, persistence, capture, inspection, or generic-navigation capability.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/GitHub_API_Auth_and_Flows.md
```

### GAAAF-001 - GitHub API Auth Source-Preserving Bridge Retired

```yaml
plan_unit_id: GAAAF-001
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/GitHub_API_Auth_and_Flows.md
canonical_text: The former GitHub_API_Auth_and_Flows doc-level source-preserving bridge is retired after Phase 2B atomized GitHub_API_Auth_and_Flows-S0001 and S0003 through S0011 into GAAAF-002 through GAAAF-012 and structurally dispositioned S0002, S0006, S0007, S0012, S0013, and S0015. GAAAF-001 remains only as migration lineage for GitHub_API_Auth_and_Flows-S0014 and must not re-own atomized source coverage or use source_preserving_planunit compile mode.
gui_related: false
gui_classification_reason: This retired bridge records migration lineage only; product GUI coverage is owned by fine-grained GAAAF-003, GAAAF-005, GAAAF-007, and GAAAF-008.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- GAAAF-001 no longer uses source_preserving_planunit compile mode.
- GAAAF-002 through GAAAF-012 own product coverage for GitHub_API_Auth_and_Flows-S0001 and S0003 through S0011.
- GitHub_API_Auth_and_Flows-S0002, S0006, S0007, S0012, S0013, and S0015 are structural or migration-history dispositions.
- The retired bridge does not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: migration_lineage
reasoning_tier: standard
context_scope: residual_plan_standardization
implementation_surfaces:
- Plans/GitHub_API_Auth_and_Flows.md
node_compile_hint:
  mode: source_preserving_bridge_retired
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GitHub_API_Auth_and_Flows-S0014
preserved_exact_tokens:
- GAAAF-001
- source_preserving_planunit
- source_preserving_bridge_retired
- GitHub_API_Auth_and_Flows-S0001
- GitHub_API_Auth_and_Flows-S0015
- Owner / Consumer Map
- PlanUnits
- Migration Coverage
negative_constraints:
- GAAAF-001 must not re-own GitHub_API_Auth_and_Flows-S0001 or S0003 through S0011 product coverage.
- GAAAF-001 must not use node_compile_hint.mode=source_preserving_planunit.
- Do not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks from this retired bridge.
compatibility_only_notes:
- GAAAF-001 remains only as a retired source-preserving bridge audit record for migration lineage.
- The token source_preserving_planunit is preserved for audit compatibility only and is not the node compile mode.
stale_retired_dispositions:
- The broad GitHub API auth source-preserving bridge was retired in Phase 2B batch 076.
owner_boundary_notes:
- GAAAF-002 through GAAAF-012 own GitHub_API_Auth_and_Flows product coverage for S0001 and S0003 through S0011.
- S0002, S0006, S0007, S0012, S0013, and S0015 are structural or migration-history dispositions, not product coverage owned by GAAAF-001.
owner_hints:
- Plans/GitHub_API_Auth_and_Flows.md
```
