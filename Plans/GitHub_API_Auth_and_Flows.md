# Puppet Master -- GitHub API Auth and Flows


> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


<!--
PUPPET MASTER -- PLAN DOC REWRITE HEADER

ABSOLUTE NAMING RULE:
- Platform name is "Puppet Master" only.
- If older naming exists, refer to it only as "legacy naming" (do not quote it).

LOCKED DECISIONS (DO NOT CHANGE IN THIS DOC):
- GitHub operations: GitHub API provider only; no external auth-shell dependency
- Default auth flow: OAuth device-code
- No secrets in seglog/redb/Tantivy or logs; secrets live only in OS credential store

REWRITE METADATA:
- Doc updated by: GitHub Copilot CLI (deep review pass)
- Legacy intent preserved: YES
- Primary Target Primitives:
  - Provider (GitHub API)
  - Patch Pipeline (local git)
  - Policy Engine / Permissions (redaction, secrets)
  - Session Store (seglog events)
  - UI Surface (commands only; UI holds no business logic)
- Canonical sources referenced (DRY):
  - Plans/Spec_Lock.json
  - Plans/DRY_Rules.md
  - Plans/Contracts_V0.md
  - Plans/Glossary.md
  - Plans/Architecture_Invariants.md
  - Plans/Progression_Gates.md
  - Plans/UI_Command_Catalog.md
  - Plans/storage-plan.md
  - Plans/Crosswalk.md
  - Plans/Decision_Policy.md
-->

## Change Summary


- 2026-02-25: Added scope-failure UI cross-reference so `MissingScopes` and related auth failures explicitly drive disabled-state behavior for PR/Issues/Actions surfaces in `Plans/GitHub_Integration.md §B`.
- 2026-02-25: Added SSH Remote Dev Server auth context section; added device-code prominence note; cross-references Plans/GitHub_Integration.md §C.

## Purpose
Define the canonical GitHub API authentication contract and GitHub API call flows Puppet Master relies on for repository, fork, and pull request workflows.

This document also defines the hard boundary between:
- **Local Git operations** (performed via the local `git` binary), and
- **GitHub hosting operations** (performed via the GitHub HTTPS API).

`github_api` is the auth realm for GitHub REST `/platform` operations such as repo create, fork, PR, and permission checks; GitHub Copilot auth does not authorize these repository/platform mutations.

Git transport auth and GitHub API auth are separate systems. `github_api` tokens never transfer to SSH remotes, local Git credential helpers, or Source Control SSH operations, and an expired or insufficient GitHub API credential is a canonical blocked/runtime condition with owner routing through GitHub Actions or GitHub API auth recovery rather than a panel-local refresh case.

`Plans/GitHub_Integration.md` remains the consumer cross-reference for `/remote` GitHub surfaces: hosted and SSH remote mutations consume FileSafe.md mutation-safety, write-scope, and durability contracts rather than bypassing the FileSafe owner.

Generic API key, HTTP auth, OAuth 2.0, OpenID Connect, and mTLS mechanisms are transport-layer auth families only when an owning provider/runtime contract explicitly maps them into a GitHub operation. They do not replace the `github_api` OAuth device-code flow or OS credential-store token boundary.

### OAuth device-code flow contract

The `github_api` realm uses GitHub OAuth device flow only for constrained local/headless contexts. The app must have device flow enabled before PM presents this route.

Device-code steps:
1. Start auth with `POST https://github.com/login/device/code`, passing `client_id` and requested space-delimited `scope`.
2. Store only the non-secret pending auth record: `device_code_ref`, `user_code`, `verification_uri`, `expires_at`, `poll_interval_seconds`, requested scopes, host, and account binding.
3. Show `verification_uri` and `user_code` to the user, with expiry and requested scopes visible.
4. Poll `POST https://github.com/login/oauth/access_token` with `client_id`, `device_code`, and `grant_type = urn:ietf:params:oauth:grant-type:device_code`.
5. Poll no faster than the returned `interval`; on `slow_down`, increase the interval by 5 seconds and persist the new poll cadence.
6. Terminal success stores the access token only in the OS credential store and persists `credential_ref`, scopes, host, account_id, and expiry/refresh metadata outside the token secret.

Device-code polling errors are closed to `authorization_pending`, `slow_down`, `expired_token`, `unsupported_grant_type`, `incorrect_client_credentials`, `incorrect_device_code`, `access_denied`, and `network_or_rate_limited`. `authorization_pending` keeps polling until expiry. `slow_down` adjusts cadence. `expired_token`, `incorrect_client_credentials`, `incorrect_device_code`, `unsupported_grant_type`, and `access_denied` stop polling and surface a retry/start-over action.

Scope matrix:
- Repository create/fork/PR, private repo reads, branch/commit/status mutations: request `repo`.
- GitHub Actions workflow dispatch, run rerun/cancel, and workflow-file mutation: request `workflow` in addition to repo access.
- Organization/team membership lookup and org-owned repo routing: request `read:org`.
- User email disclosure for account labeling only: request `user:email` when the label cannot be derived from non-email identity.
- Webhook management: request `admin:repo_hook` only for hook create/update/delete flows and never for ordinary PR/issue operations.

Missing scopes produce `blocked_reason_code = missing_scopes` with `missing_scopes[]`, `credential_ref`, `account_id`, `operation_ref`, and `allowed_action_ids[]` that include reconnect with expanded scopes or choose another account when permitted.

Credential storage:
- PM uses the platform OS credential store through the Rust `keyring` crate abstraction: macOS Keychain, Windows Credential Manager, and Linux Secret Service/libsecret where available.
- Credential service names use `puppet-master.github_api`.
- Credential keys use `github_api/{host}/{account_id}/{credential_ref}`; `host` is `github.com` or the normalized enterprise host, `account_id` is PM's stable internal account id, and `credential_ref` is the durable pointer stored in PM records.
- Seglog, redb, Tantivy, logs, prompts, exports, and runtime artifacts may store only `credential_ref`, scope metadata, account metadata, and redacted health state, never the raw token or device_code secret.

ContractRef: ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/Permissions_System.md

ContractRef: SchemaID:Spec_Lock.json#github_operations, Primitive:PatchPipeline, Primitive:Provider

#### Cross-owner command and routing dependencies

- `Plans/Permissions_System.md` / `/Permissions_System.md` owns scope-keyed approval semantics, de-tiered gating language, and permission snapshots consumed by GitHub API mutation gates.
- `Plans/UI_Command_Catalog.md` / `/UI_Command_Catalog.md` owns governance command families, typed route-payload normalization, and projection-freshness gating for GitHub command surfaces.
- `Plans/WorktreeGitImprovement.md` / `/WorktreeGitImprovement.md` owns lane and `/worktree` lifecycle vocabulary, cleanup semantics, gating checks, and transition rules for repository worktree state.
- `Plans/Progression_Gates.md` / `/Progression_Gates.md` owns the replacement of tier-scoped gate logic with package-completion and seam-transition gates that GitHub orchestration consumes.
- Wizard-blocked and thread-blocked flows may serialize `resume_url`, including wizard-step restoration detail, but `/open` behavior normalizes through canonical object identity and scope identity before using that URL.

GitHub API OAuth callback listeners are loopback-only: they bind only to the configured loopback `bind-address` / `bind-host` for the active local, WSL, container, or remote-dev context, and wildcard/public-interface callback binds are invalid.

### GitHub host policy and enterprise availability

`github_host_policy` distinguishes at least `github.com_only` and `enterprise_allowed`. If the MVP remains `github.com_only`, GHES repositories and GitHub Enterprise Server URLs receive deterministic disabled-state UX rather than hidden fallback or accidental downgraded behavior.

## Canonical data-shape reconciliation

### Required data shape

#### Stable account identity and credential references
- Replace login-keyed durable GitHub identity with stable `account_id` / `credential_ref`.
- GitHub identity is account-keyed, not login-keyed: stable internal `account_id` is the durable join key, while login and disclosure-only provider metadata remain display/audit descriptors.
- Canonical GitHub runtime and mutation envelopes carry `requested_account_id`, `effective_account_id`, stable `account_id`, `credential_ref`, `account_type`, `account_login`, `execution_role`, `operational_identity`, and `account_switch_lineage[]`.
- `account_login` and any provider-native handle stay descriptive only; `credential_ref` points to the credential-store entry that actually authorizes the GitHub account.
- GitHub auth retry and failover follow multi-account policy: bare-context fallback may start without a persona only when the owning runtime contract permits it; Docker `/media/provider` and provider `/model` flows carry account-resolution lineage instead of stopping at provider/model labels.
- The requested-vs-effective admin capability UI displays stable `account_id`, effective-account, and switch-reason; login-keyed handles are display-only, and blocked-state copy explains why a requested account was skipped, clamped, or fell through.

#### Recovery context and mutation gating

- Run Graph and Orchestrator GitHub actions normalize onto `cmd.runtime` / `cmd.runtime.*` plus `cmd.orchestrator.open_in_` / `cmd.orchestrator.open_in_*` bindings with a mutation action envelope and trust-state gating.
- Trust/degraded-state split: low-risk read-only inspection may run on refreshing, stale, and sometimes degraded projections; deep-linking is allowed when target identity remains valid; live mutation, approval, recovery, retry, and cleanup require `current` or direct canonical-runtime validation.
- GitHub mutations and Orchestrator handoffs include `/degraded-state` gating and concern handoff rules before execution.
- Gating level `none` is limited to safe navigation or `/focus` actions and low-risk presentation actions that do not touch user-data and do not mutate live-runtime state.
- `contextual-help-only` guidance may appear on individual graph badges, narrow panel chips, trust-state chrome, widget-specific filter fields, and per-surface action gating messages, but it never upgrades a disabled or degraded action into an executable mutation.
- GitHub recovery payloads consume `execution_unit_context` as the runtime-facing union of immutable attempt handoff identity, active blocked `/recovery/runtime` gating anchors, and workspace `/isolation` anchors.
- Runtime-era command wiring/gate contracts require reverse `matrix-to-catalog` coverage, precondition `/freshness/mutation-risk` fields, stale-blocking policy, explicit dispatcher obligations, and machine-verifiable allowed-action selection before dispatch.
- GitHub-facing Orchestrator, widget, and Run Graph consumers read the shared `projection-health` / `trust-state` record family for action gating and fallback instead of inventing surface-local degraded-state checks.
- Historical-run rendering, idle widget rendering, and `/degraded-mode` projection gates are surface-level GitHub requirements as well as storage concerns; GitHub-facing views must show historical-run and degraded projection state before enabling mutation-capable actions.
- Multi-account GitHub and widget data sourcing must not fall back to pre-rewrite or single-account-only identity rules; cross-surface `/GitHub` and `/integration` pivots carry lane, package, `/runtime`, degraded-trust, `/package/degraded-trust`, and stale-data state into mutation gating and concern ownership.
- Mutation and `/recovery` audits carry stable workspace and provider-attempt anchors, because deferred provider work cannot be repaired correctly from GitHub login, branch, or panel state alone.
- Blocked `/HITL/policy` flows re-anchor on canonical node `/attempt` identifiers and the current blocked sequence before GitHub recovery, approval, retry, or cleanup continues.
- GitHub operations that traverse `/skills/formatters`, DAE, mixed mutation semantics, or runtime tool reachability inherit runtime safety and capability contracts; those capability boundaries must not remain under-owned or be recreated as GitHub-local auth rules.
- Orchestrator and Source Control stay intentionally asymmetric: Orchestrator owns package `/governance/execution` truth, while Source Control owns concrete Git `/worktree` inspection and mutation; GitHub routes preserve that split rather than treating repository hosting as the graph authority.
- Routing, blocked-family, and attribution flows reconcile end-to-end across owner and consumer docs before GitHub-facing commands claim a recoverable, attributable, or safe-to-mutate state.


- Add recovery context payload and trust/degraded-state gating for GitHub mutations.
- Every write-capable GitHub request carries `recovery_context { blocked_sequence, blocked_episode_id, recovery_handshake_state, trust_state, degraded_state, approval_id?, dae_jail_posture }`.
- A GitHub mutation may proceed only after the startup recovery handshake rebinds the current blocked episode, `trust_state` is writable, `degraded_state` is false, and any approval or DAE jail gate has been cleared.

#### Runtime identity and blocked-policy transfer
- Transfer execution_role, requested_account_id, operational_identity, account-switch and pressure ownership, blocked_sequence minting, startup recovery handshake, and DAE jail/approval policy into owner and consumer docs.
- GitHub write attempts mint or reuse the current `blocked_sequence`; startup recovery must rebind that same sequence before resuming deferred work.
- Carry usage switch-history and usage execution-role follow-through.
- Usage and audit rows record `execution_role`, requested/effective account identity, switch history, pressure owner, and the GitHub `account_id` / `credential_ref` pair that actually executed the call.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/Prompt_Pipeline.md

## Browser/debug auth handoff and session shaping
- Browser session-shaping actions remain `explicit_confirmation` operations when they mutate cookies, `/storage`, storage `/export` or import state, offline `/mock` routing, or promotion into normal browsing.
- App-debug login handoff stops automation at `attention_required` and transfers foreground control to a protected human-only `AuthBrowserSession` when interactive authentication is required. PM-owned provider device-login flows may open that protected session only under exact domain policy; protected content/state never returns to automation, artifacts, inspection, persistence, or generic navigation.

## Owner / Consumer Map

`Plans/GitHub_API_Auth_and_Flows.md` remains the owner doc for GitHub API auth realm, credential secrecy, local Git versus GitHub hosting boundaries, callback binding policy, host policy, stable account identity, mutation recovery context, runtime identity transfer, and browser/debug auth handoff. Cross-doc consumers must preserve the owner routing in the source body rather than recreating GitHub-local auth, disabled-state, worktree, permission, or command-routing rules.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md

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

## Migration Coverage

Original hash: `ae9a04b542086ed39c8b78e71f708c91a73242ebf4bfe39fd4680336c75f870d`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/anchor_aliases.json`

Phase 2B batch 076 atomized `GitHub_API_Auth_and_Flows-S0001` and `GitHub_API_Auth_and_Flows-S0003` through `GitHub_API_Auth_and_Flows-S0011` into `GAAAF-002` through `GAAAF-012`, with mixed GUI/runtime/identity/recovery spans split where safe. `GitHub_API_Auth_and_Flows-S0002`, `GitHub_API_Auth_and_Flows-S0006`, `GitHub_API_Auth_and_Flows-S0007`, `GitHub_API_Auth_and_Flows-S0012`, `GitHub_API_Auth_and_Flows-S0013`, and `GitHub_API_Auth_and_Flows-S0015` are structural or migration-history dispositions. `GitHub_API_Auth_and_Flows-S0014` maps to retired bridge lineage `GAAAF-001`; `GAAAF-001` no longer uses source-preserving compile mode, and `Plans/GitHub_API_Auth_and_Flows.md` has no remaining source-preserving product coverage. This batch did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and did not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.


## Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260618-001-prd-planning-wizard` into this existing owner or consumer doc. It does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### GAAAF-013 - GitHub Auth Consumers For Optional Planning Context

```yaml
plan_unit_id: GAAAF-013
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_API_Auth_and_Flows.md
canonical_text: 'GitHub is optional for repository creation, fork, push, and PR workflows; local or remote Git and FileSafe remain valid without GitHub credentials, and repository/worktree state is execution truth. For an SSH project, discovery, FileSafe, Git, worktrees, commands, testing, path authority, safe points, and execution occur on the remote host through the authorized adapter, with no silent local fallback.'
gui_related: false
gui_classification_reason: Backend, planning, contract, governance, or workflow behavior rather than visual presentation.
depends_on: []
unblocks: []
acceptance_criteria:
- The live owner doc preserves every source atom listed in source_atom_ids without treating the ledger as canonical product prose.
- Exact tokens, negative constraints, owner hints, and accepted corrections remain available to future audits through this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard
risk_class: owner_drift
reasoning_tier: standard
context_scope: ledger_to_plans_compile
implementation_surfaces:
- Plans/GitHub_API_Auth_and_Flows.md
- Plans/GitHub_Integration.md
- Plans/Planning_Wizard.md
- Plans/FileSafe.md
- Plans/Executor_Protocol.md
- Plans/Permissions_System.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0069
- pldg-20260618-001-prd-planning-wizard:atom-0075
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/04-project-context-and-source-control.md#SRC-PROJECT
source_atom_ids:
- atom-0069
- atom-0075
decision_refs:
- dec-0015
correction_refs: []
preserved_exact_tokens:
- GitHub optional
- execution truth
- remote host
- no silent local fallback
negative_constraints:
- Do not block local-only planning or build completion solely because GitHub is unavailable.
- Do not run against an unrelated local copy when remote context is active.
owner_hints:
- Plans/GitHub_Integration.md
- Plans/GitHub_API_Auth_and_Flows.md
- Plans/Planning_Wizard.md
- Plans/FileSafe.md
- Plans/Executor_Protocol.md
- Plans/Permissions_System.md
```

## FABLE Residual GitHub Auth Cleanup Addendum - 2026-07-07

This addendum closes the residual FABLE GitHub API auth rows for OAuth device-code mechanics, scope enumeration, and credential-store key naming. Values were checked against official GitHub OAuth documentation during the repair pass.

### GAAAF-014 - OAuth Device Flow, Scope Matrix, And Credential Keys

```yaml
plan_unit_id: GAAAF-014
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_API_Auth_and_Flows.md
canonical_text: >-
  GitHub API auth uses the OAuth device-code flow with explicit device-code request, user-code display,
  interval-governed polling, closed polling errors, operation-specific scope requests, MissingScopes blocked
  behavior, and OS credential-store key naming. Raw tokens and device-code secrets never enter PM storage,
  logs, prompts, exports, or runtime artifacts.
gui_related: true
gui_classification_reason: Device login, missing-scope recovery, and credential health are user-visible auth/setup behavior.
depends_on: [GAAAF-002, GAAAF-006, UCC-030, PS-131]
unblocks: []
acceptance_criteria:
  - Device auth requests and polling use GitHub's documented device-code endpoints and respect returned poll interval.
  - Polling handles authorization_pending, slow_down, expired_token, unsupported_grant_type, incorrect_client_credentials, incorrect_device_code, access_denied, and network_or_rate_limited.
  - Operation scope requests are explicit for repo, workflow, read:org, user:email, and admin:repo_hook.
  - Missing scopes produce blocked_reason_code = missing_scopes with missing_scopes[], credential_ref, account_id, operation_ref, and allowed_action_ids[].
  - Credential storage uses OS credential-store APIs through keyring, service name puppet-master.github_api, and keys github_api/{host}/{account_id}/{credential_ref}.
  - Stored PM records contain credential_ref and metadata only, never raw tokens or device_code secrets.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py lint-contractrefs
  - python3 scripts/pm-audit-closure.py validate --audit-dir Plans/.audits/fable-20260706 --require-closure-matrix --require-effective-status
risk_class: fable_residual_github_auth_drift
reasoning_tier: high
context_scope: residual_feature_contract_cleanup
implementation_surfaces:
  - Plans/GitHub_API_Auth_and_Flows.md
  - Plans/Multi-Account.md
  - Plans/Permissions_System.md
node_compile_hint:
  mode: residual_github_oauth_device_flow_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - fablereport.md:1251
  - fablereport.md:1252
  - fablereport.md:1253
  - https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps
  - https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/scopes-for-oauth-apps
  - Plans/.audits/fable-20260706/buildability_repair_registry.jsonl
source_atom_ids: []
preserved_exact_tokens:
  - "OAuth device-code"
  - "authorization_pending"
  - "slow_down"
  - "expired_token"
  - "repo"
  - "workflow"
  - "read:org"
  - "OS credential store"
  - "credential_ref"
negative_constraints:
  - Do not store raw OAuth tokens, raw device codes, or client secrets in seglog, redb, Tantivy, logs, prompts, exports, runtime artifacts, or closure evidence.
  - Do not treat GitHub Copilot auth or local Git credential helpers as authorization for GitHub API platform mutations.
  - Do not create WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, runtime launches, runtime certification evidence, production build tasks, generated governance artifacts, or governance seal outputs.
owner_hints:
  - Plans/GitHub_API_Auth_and_Flows.md
  - Plans/Multi-Account.md
  - Plans/Permissions_System.md
```

## Post-Integration Shared Authentication Consumer Addendum - 2026-09-01

GitHub device-code behavior remains GitHub-specific. Forgejo/Gitea instance authorization, Backup destination authorization, and hosted Tailscale/Headscale connector authorization consume the shared Authentication Broker, auth-profile commands, protected input channels, and `AuthBrowserSession` boundary; this document does not become their semantic owner. Selecting `repository_automation` or a provider binding never silently starts authentication, reuses a GitHub credential for another provider, or grants write authority.

Forgejo and Gitea default to a guided scoped PAT when an instance has no registered OAuth application and may use OAuth/PKCE only for an explicitly registered instance flow. Git transport and hosting API credentials remain separately attached; a read-only API profile blocks API mutation without declaring Git fetch/publish unavailable. Backup Drive/OneDrive uses only provider-supported production registrations, callbacks, and scopes; a missing approval/registration is `handler_unavailable`, not a fabricated working login. Hosted Tailscale authorization is connector-owner work and tailnet identity never authorizes GitHub, forge, Backup, or Puppet Master permissions.

Any permitted interactive fallback enters the protected human-only `AuthBrowserSession` for the exact operation and initiating active Client. It is non-recordable, non-inspectable, non-persistent, inaccessible to agents and adapters, and returns only a redacted lifecycle/currentness outcome. No raw URL, code, token, PAT, cookie, storage state, page representation, connector identity secret, or callback verifier is returned to `repository_automation`, a provider adapter, Backup, Remote Access, Chat, Usage, artifacts, or ordinary Browser tooling.

### GAAAF-015 - Shared Auth Consumers And Protected Handoff Boundary

```yaml
plan_unit_id: GAAAF-015
unit_type: security_contract
status: accepted
owner_doc: Plans/GitHub_API_Auth_and_Flows.md
canonical_text: >-
  GitHub retains its device-code owner contract while Forgejo/Gitea, Backup destinations, and the embedded Tailscale connector consume shared authentication and protected human handoff by exact owner reference. repository_automation never implies provider identity or auth authority; read-only and handler_unavailable states remain truthful; AuthBrowserSession content remains unavailable to agents, adapters, recording, inspection, persistence, and generic Browser navigation.
gui_related: true
gui_classification_reason: Provider setup, Data Backup and Retention, Remote Access, and Actions & Pipelines display exact protected, read-only, unavailable, resume, cancel, and return states.
depends_on: [GAAAF-002, GAAAF-003, GAAAF-004, GAAAF-012, GAAAF-014, SIR-033, PS-135]
unblocks: []
acceptance_criteria:
  - GitHub device-code auth stays GitHub-specific and no GitHub credential authorizes Forgejo, Gitea, Backup, connector, or repository_automation operations.
  - Forgejo/Gitea use guided scoped PAT by default or an explicitly registered instance OAuth/PKCE flow; Git and API credential roles remain separate.
  - Read-only hosting API state blocks API mutation without disabling independently ready Git transport.
  - Missing Backup OAuth registration/approval/callback evidence remains handler_unavailable and no synthetic login success is exposed.
  - Protected handoff binds Server, Host, resource, profile, continuation, requested-scope ref, operation generation, initiating Client/session generation, and exact return target while exposing no protected content.
  - AuthBrowserSession is human-only, non-recordable, non-inspectable, non-persistent, and inaccessible to agents and adapters for every consumer.
  - Static schemas and fixtures claim no real provider login, callback, secret-isolation, browser-process isolation, or runtime evidence.
validation_surfaces: [Plans/protected_auth_browser_contracts.schema.json, Plans/protected_auth_browser_contract_fixtures.json, python3 scripts/pm-protected-auth-browser-contracts.py validate, python3 scripts/pm-new-contracts-verify.py]
risk_class: cross_provider_credential_reuse_or_protected_auth_exposure
reasoning_tier: high
context_scope: shared_auth_consumer_and_protected_handoff
implementation_surfaces: [Plans/GitHub_API_Auth_and_Flows.md, Plans/protected_auth_browser_contracts.schema.json, Plans/protected_auth_browser_contract_fixtures.json]
node_compile_hint: {mode: static_auth_consumer_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/05_FORGE_CAPABILITY_AND_AUTH_MATRIX.md:23-45
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/06_SOURCE_AUTHENTICATION_AND_INTERNAL_ROUTING.md:7-45
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/08_CLOUD_DESTINATIONS_AND_SIGN_IN.md:31-61
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/13_TSNET_INTEGRATION_AND_CROSS_DOMAIN_BOUNDARIES.md:31-45
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/14_COMMAND_CONTRACTS.md:15-37
  - source_report:scratchpad/pm-forge-backup-tsnet-post-integration-2026-09-01/agent_reports/coverage_verification.md:84-93
preserved_exact_tokens: [Forgejo, Gitea, repository_automation, read-only, handler_unavailable, AuthBrowserSession, human-only, non-recordable, non-inspectable]
negative_constraints:
  - Do not make this GitHub document the semantic owner of Forgejo/Gitea, Backup, connector, or generic authentication.
  - Do not infer auth, identity, scope, or write authority from the selected shell, provider label, tailnet membership, or a cached capability.
  - Do not expose protected content to agents, adapters, Browser tools, artifacts, recordings, inspection, persistence, logs, Chat, or Usage.
  - Do not claim runtime authentication, provider approval, callback operation, or security isolation from static fixtures.
```

## Connection Draft, Scoped Profile, And Source-Orchestration Depth Repair - 2026-09-02

### GAAAF-016 - Shared AuthSession And ConnectionDraft Lifecycle

```yaml
plan_unit_id: GAAAF-016
unit_type: security_contract
status: accepted
owner_doc: Plans/GitHub_API_Auth_and_Flows.md
canonical_text: >-
  Shared authentication persists non-secret AuthSession metadata for exact session, initiating Client/session
  generation, owning Server/Host/Environment, provider instance, connection/profile, requested method/scopes,
  continuation and return context, expiry, and nonce/PKCE references while token, verifier, code, cookie, and
  private browser content remain in the secret channel. The active Client opens supported official system
  browser, authorization-code-with-PKCE, provider-approved device, paste-code/official CLI, scoped-token entry,
  registered web callback, or isolated human AuthBrowser flows only when the named provider/app supports them.
  Native callback bridges admit one authenticated transaction to the owning Server; web-only/headless paths do
  not fabricate OOB, device, embedded-browser, localhost, or arbitrary-domain support. Forge, automation, and
  cloud setup begins with a typed inactive ConnectionDraft carrying connection kind, provider/instance/target
  intent, requested scope set, and exact return context. A preexisting authenticated Connection is not required.
  The fixed lifecycle is create inactive draft, start shared AuthSession, select the permitted repository or
  storage path, verify minimum non-destructive capabilities, then atomically activate one Connection. Cancel or
  expiry invalidates callbacks and removes only uncommitted draft attachments after safe cleanup while
  preserving user-owned profiles; restart resumes through a new fenced session. Edit/remove/test/details use
  shared lifecycle commands, global provider configuration is unchanged, and removing a Backup connection
  never deletes Backup data. Connection UI renders service, account, instance, and readable requested
  permissions; extra scope is just-in-time. Refreshable state lives in the owning Server/Environment vault or
  an external secret reference, survives container replacement, and serializes refresh writes per profile.
  Sign Out previews dependencies and detaches/revokes only the exact connection/profile; it never globally
  deletes CLI profiles. Copy Project settings reuses a binding rather than copying a token, and general
  build/test processes never inherit all credentials. Git transport and forge API credential roles remain separate.
gui_related: true
gui_classification_reason: The contract defines first-time connection setup, readable scopes, protected browser handoff, cancellation/restart, activation, reconnect, sign-out, and return behavior.
depends_on: [GAAAF-002, GAAAF-003, GAAAF-004, GAAAF-014, GAAAF-015, SIR-033]
unblocks: [FGI-015, F3-529]
acceptance_criteria:
  - Native, web-only, SSH, container, device, PKCE, official CLI, and scoped-token fixtures bind one exact session/profile/return and reject replay, mismatch, unsupported methods, and laptop-versus-container localhost confusion.
  - First-time no-profile setup has a complete ConnectionDraft create/auth/select/verify/activate path plus cancel and restart without global provider configuration changes.
  - Activation is atomic and requires current non-destructive capability evidence; inactive/cancelled/expired drafts never claim a live Connection.
  - Cancellation expires callbacks and removes only uncommitted draft attachments; user-owned external/CLI profiles and existing Connections survive.
  - Expiry, concurrent refresh, redeployed container, sign-out shared by other Projects, external profile, copy-settings, and general-process isolation fixtures preserve exact profile boundaries and no secret bytes.
validation_surfaces: [Plans/protected_auth_browser_contracts.schema.json, Plans/protected_auth_browser_contract_fixtures.json, python3 scripts/pm-protected-auth-browser-contracts.py validate, future AuthSession callback and ConnectionDraft lifecycle fixtures]
risk_class: auth_session_replay_connection_activation_or_credential_scope_escape
reasoning_tier: high
context_scope: shared_auth_session_connection_draft_and_profile_lifecycle
implementation_surfaces: [Plans/GitHub_API_Auth_and_Flows.md, Plans/protected_auth_browser_contracts.schema.json, Plans/protected_auth_browser_contract_fixtures.json, future auth broker and connection lifecycle coordinator]
node_compile_hint: {mode: static_auth_lifecycle_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/06_SOURCE_AUTHENTICATION_AND_INTERNAL_ROUTING.md:7-13
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/06_SOURCE_AUTHENTICATION_AND_INTERNAL_ROUTING.md:15-21
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/06_SOURCE_AUTHENTICATION_AND_INTERNAL_ROUTING.md:23-29
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/06_SOURCE_AUTHENTICATION_AND_INTERNAL_ROUTING.md:31-37
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/06_SOURCE_AUTHENTICATION_AND_INTERNAL_ROUTING.md:39-45
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/05_FORGE_CAPABILITY_AND_AUTH_MATRIX.md:23-29
  - source_ref:corrected-slice:machine__requirements.json__part-005__lines-000801-001020.txt:197-220
  - source_ref:corrected-slice:machine__requirements.json__part-006__lines-001001-001220.txt:13-29
  - source_ref:corrected-slice:machine__requirements.json__part-011__lines-002001-002196.txt:125-141
preserved_exact_tokens: [AuthSession, ConnectionDraft, authorization code with PKCE, device authorization, official CLI, guided scoped PAT, initiating Client, owning Server, return context, inactive, atomic activation, Sign Out]
negative_constraints:
  - Do not store tokens, verifiers, authorization codes, PATs, passwords, cookies, or protected browser content in AuthSession, ConnectionDraft, events, Usage, Chat, or ordinary artifacts.
  - Do not fabricate provider auth methods, assume a laptop localhost reaches a container, or use AuthBrowser to bypass embedded-browser restrictions.
  - Do not require a preexisting Connection to create a draft or mutate global provider configuration during draft activation.
  - Do not delete user-owned CLI profiles or Backup data when cancelling/removing one connection.
  - Do not copy tokens with Project settings or expose all credentials to general build/test processes.
  - Do not claim live authentication, callback, browser isolation, vault durability, or runtime activation from static contracts.
```

### GAAAF-017 - Owner-Routed Source Mutation And API Orchestration

```yaml
plan_unit_id: GAAAF-017
unit_type: integration_contract
status: accepted
owner_doc: Plans/GitHub_API_Auth_and_Flows.md
canonical_text: >-
  Repository edits route through local Git or Jujutsu plus Worktree/Workspace Manager on the Source Location's
  authorized Environment; hosted repository/review changes route through ForgeAdapter on the exact authorized
  egress Host; CI changes route through the independently bound AutomationAdapter. Composite publish-and-review
  records ordered suboperations, preconditions, targets, and receipts instead of shell chaining. Shared governor
  leases fence directory, branch, path, and revision. Named Plan, Goal, thread, Source Location, Environment,
  account, and initiating Client lineage travels when present but never becomes identity or authority. GUI,
  command palette, and automation use the same semantic handler; no panel-private implementation or silent
  cross-host/account fallback exists. Output and network errors are scrubbed before EventRecord, Usage, or Chat.
gui_related: true
gui_classification_reason: GUI, palette, and automation share one visible progress/receipt/error path with exact return context.
depends_on: [GAAAF-016, SCS-015, SCS-016, FGI-014]
unblocks: [F3-529]
acceptance_criteria:
  - One GUI action, palette invocation, and automation request produce the same ordered semantic suboperations and owner receipts.
  - Local source, forge API, and automation phases remain on their captured Environments, Hosts, accounts, bindings, revisions, and credentials without silent fallback.
  - Shared governor lease loss or revision change invalidates pending approval before any effect.
  - Events, Usage, Chat, logs, and receipts contain scrubbed typed errors rather than URLs with credentials, tokens, headers, or private paths.
validation_surfaces: [Plans/protected_auth_browser_contracts.schema.json, Plans/protected_auth_browser_contract_fixtures.json, Plans/source_control_contracts.schema.json, Plans/source_control_contract_fixtures.json, Plans/forge_integration_contracts.schema.json, Plans/forge_integration_contract_fixtures.json]
risk_class: duplicated_semantic_handler_cross_host_fallback_or_error_secret_leak
reasoning_tier: high
context_scope: source_mutation_and_hosted_api_orchestration
implementation_surfaces: [Plans/GitHub_API_Auth_and_Flows.md, Plans/protected_auth_browser_contracts.schema.json, Plans/protected_auth_browser_contract_fixtures.json, future semantic orchestration handler]
node_compile_hint: {mode: static_orchestration_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/06_SOURCE_AUTHENTICATION_AND_INTERNAL_ROUTING.md:31-37
  - source_ref:corrected-slice:machine__requirements.json__part-005__lines-000801-001020.txt:213-220
  - source_ref:corrected-slice:machine__requirements.json__part-006__lines-001001-001220.txt:13-29
preserved_exact_tokens: [Git/JJ, Worktree Manager, ForgeAdapter, AutomationAdapter, ordered suboperations, shared governor leases, initiating Client]
negative_constraints:
  - Do not chain untracked shell effects or put local edits, forge effects, and CI effects behind one ambient working-directory assumption.
  - Do not treat lineage as authority, fall back to another Host/account, or duplicate a semantic handler inside a GUI panel.
  - Do not emit unredacted output/network errors to events, Usage, Chat, logs, or receipts.
  - Do not claim runtime dispatch, handler implementation, external effects, or security proof from static Plans/schema/fixtures.
```
