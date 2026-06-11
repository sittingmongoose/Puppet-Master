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
- App-debug login handoff normally remains in the same isolated automation session so authenticated state can resume the investigation, while PM-owned provider `/device/login` flows may use a dedicated `auth_session` when that is the canonical provider flow.

## Owner / Consumer Map

This source-preserving standardization keeps the owner and consumer boundaries stated in the original document body. During this batch, `Plans/GitHub_API_Auth_and_Flows.md` remains the owner doc for the behavior described by its preserved sections, while cross-doc ownership follows the ContractRefs and boundary notes already present in the original text.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md

## PlanUnits

### GAAAF-001 - Puppet Master -- GitHub API Auth and Flows Source-Preserving PlanUnit

```yaml
plan_unit_id: GAAAF-001
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_API_Auth_and_Flows.md
canonical_text: Plans/GitHub_API_Auth_and_Flows.md keeps its pre-migration canonical source content losslessly in place while exposing a source-preserving PlanUnit for Plan Document System indexing. Fine-grained requirement splitting may occur in a later controlled batch using the recorded span_map and coverage_map.
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
- Plans/GitHub_API_Auth_and_Flows.md
node_compile_hint:
  mode: source_preserving_planunit
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:GitHub_API_Auth_and_Flows-S0001
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:GitHub_API_Auth_and_Flows-S0002
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:GitHub_API_Auth_and_Flows-S0003
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:GitHub_API_Auth_and_Flows-S0004
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:GitHub_API_Auth_and_Flows-S0005
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:GitHub_API_Auth_and_Flows-S0006
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:GitHub_API_Auth_and_Flows-S0007
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:GitHub_API_Auth_and_Flows-S0008
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:GitHub_API_Auth_and_Flows-S0009
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:GitHub_API_Auth_and_Flows-S0010
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:GitHub_API_Auth_and_Flows-S0011
preserved_exact_tokens:
- Puppet Master -- GitHub API Auth and Flows
- Change Summary
- Purpose
- 'ContractRef: SchemaID:Spec_Lock.json#github_operations, Primitive:PatchPipeline, Primitive:Provider'
- Cross-owner command and routing dependencies
- GitHub host policy and enterprise availability
- Canonical data-shape reconciliation
- Required data shape
- Stable account identity and credential references
- Recovery context and mutation gating
- Runtime identity and blocked-policy transfer
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/Prompt_Pipeline.md'
- Browser/debug auth handoff and session shaping
negative_constraints:
- '- Multi-account GitHub and widget data sourcing must not fall back to pre-rewrite or single-account-only identity rules; cross-surface `/GitHub` and `/integration` pivots carry lane, package, `/runtime`, degraded-trust, `/package/degraded-trust`, and stale-data state into mutation gating and concern'
- '- GitHub operations that traverse `/skills/formatters`, DAE, mixed mutation semantics, or runtime tool reachability inherit runtime safety and capability contracts; those capability boundaries must not remain under-owned or be recreated as GitHub-local auth rules.'
compatibility_only_notes:
- '- If older naming exists, refer to it only as "legacy naming" (do not quote it).'
- '- Legacy intent preserved: YES'
- '- `Plans/WorktreeGitImprovement.md` / `/WorktreeGitImprovement.md` owns lane and `/worktree` lifecycle vocabulary, cleanup semantics, gating checks, and transition rules for repository worktree state.'
- '- `Plans/Progression_Gates.md` / `/Progression_Gates.md` owns the replacement of tier-scoped gate logic with package-completion and seam-transition gates that GitHub orchestration consumes.'
stale_retired_dispositions:
- '- Trust/degraded-state split: low-risk read-only inspection may run on refreshing, stale, and sometimes degraded projections; deep-linking is allowed when target identity remains valid; live mutation, approval, recovery, retry, and cleanup require `current` or direct canonical-runtime validation.'
- '- Runtime-era command wiring/gate contracts require reverse `matrix-to-catalog` coverage, precondition `/freshness/mutation-risk` fields, stale-blocking policy, explicit dispatcher obligations, and machine-verifiable allowed-action selection before dispatch.'
- '- Multi-account GitHub and widget data sourcing must not fall back to pre-rewrite or single-account-only identity rules; cross-surface `/GitHub` and `/integration` pivots carry lane, package, `/runtime`, degraded-trust, `/package/degraded-trust`, and stale-data state into mutation gating and concern'
owner_boundary_notes:
- '> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.'
- '- Canonical sources referenced (DRY):'
- Define the canonical GitHub API authentication contract and GitHub API call flows Puppet Master relies on for repository, fork, and pull request workflows.
- 'This document also defines the hard boundary between:'
- Git transport auth and GitHub API auth are separate systems. `github_api` tokens never transfer to SSH remotes, local Git credential helpers, or Source Control SSH operations, and an expired or insufficient GitHub API credential is a canonical blocked/runtime condition with owner routing through Git
- '`Plans/GitHub_Integration.md` remains the consumer cross-reference for `/remote` GitHub surfaces: hosted and SSH remote mutations consume FileSafe.md mutation-safety, write-scope, and durability contracts rather than bypassing the FileSafe owner.'
- Generic API key, HTTP auth, OAuth 2.0, OpenID Connect, and mTLS mechanisms are transport-layer auth families only when an owning provider/runtime contract explicitly maps them into a GitHub operation. They do not replace the `github_api` OAuth device-code flow or OS credential-store token boundary.
- '#### Cross-owner command and routing dependencies'
- '- Wizard-blocked and thread-blocked flows may serialize `resume_url`, including wizard-step restoration detail, but `/open` behavior normalizes through canonical object identity and scope identity before using that URL.'
- '## Canonical data-shape reconciliation'
- '- Canonical GitHub runtime and mutation envelopes carry `requested_account_id`, `effective_account_id`, stable `account_id`, `credential_ref`, `account_type`, `account_login`, `execution_role`, `operational_identity`, and `account_switch_lineage[]`.'
- '- Trust/degraded-state split: low-risk read-only inspection may run on refreshing, stale, and sometimes degraded projections; deep-linking is allowed when target identity remains valid; live mutation, approval, recovery, retry, and cleanup require `current` or direct canonical-runtime validation.'
- '- Blocked `/HITL/policy` flows re-anchor on canonical node `/attempt` identifiers and the current blocked sequence before GitHub recovery, approval, retry, or cleanup continues.'
- '- Routing, blocked-family, and attribution flows reconcile end-to-end across owner and consumer docs before GitHub-facing commands claim a recoverable, attributable, or safe-to-mutate state.'
- '- Transfer execution_role, requested_account_id, operational_identity, account-switch and pressure ownership, blocked_sequence minting, startup recovery handshake, and DAE jail/approval policy into owner and consumer docs.'
- '- Usage and audit rows record `execution_role`, requested/effective account identity, switch history, pressure owner, and the GitHub `account_id` / `credential_ref` pair that actually executed the call.'
- '- App-debug login handoff normally remains in the same isolated automation session so authenticated state can resume the investigation, while PM-owned provider `/device/login` flows may use a dedicated `auth_session` when that is the canonical provider flow.'
owner_hints:
- Plans/GitHub_API_Auth_and_Flows.md
split_recommendation_reason: The doc-level source-preserving unit covers both GUI-related and non-GUI spans; future fine-grained PlanUnits should split those surfaces when safe.
```

## Migration Coverage

Original hash: `032feb2a9cdf3685d4373b2e47d2e4b50566f1cd202f9a0cd9283904170dea9b`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/anchor_aliases.json`

All original spans from `GitHub_API_Auth_and_Flows-S0001` through `GitHub_API_Auth_and_Flows-S0011` are preserved in place and mapped in `coverage_map.jsonl` to `GAAAF-001`. This batch did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, or executable build tasks.
