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

ContractRef: SchemaID:Spec_Lock.json#github_operations, Primitive:PatchPipeline, Primitive:Provider

## Canonical data-shape reconciliation

### Required data shape

#### Stable account identity and credential references
- Replace login-keyed durable GitHub identity with stable `account_id` / `credential_ref`.
- Canonical GitHub runtime and mutation envelopes carry `requested_account_id`, `effective_account_id`, stable `account_id`, `credential_ref`, `account_type`, `account_login`, `execution_role`, `operational_identity`, and `account_switch_lineage[]`.
- `account_login` and any provider-native handle stay descriptive only; `credential_ref` points to the credential-store entry that actually authorizes the GitHub account.

#### Recovery context and mutation gating
- Add recovery context payload and trust/degraded-state gating for GitHub mutations.
- Every write-capable GitHub request carries `recovery_context { blocked_sequence, blocked_episode_id, recovery_handshake_state, trust_state, degraded_state, approval_id?, dae_jail_posture }`.
- A GitHub mutation may proceed only after the startup recovery handshake rebinds the current blocked episode, `trust_state` is writable, `degraded_state` is false, and any approval or DAE jail gate has been cleared.

#### Runtime identity and blocked-policy transfer
- Transfer execution_role, requested_account_id, operational_identity, account-switch and pressure ownership, blocked_sequence minting, startup recovery handshake, and DAE jail/approval policy into owner and consumer docs.
- GitHub write attempts mint or reuse the current `blocked_sequence`; startup recovery must rebind that same sequence before resuming deferred work.
- Carry usage switch-history and usage execution-role follow-through.
- Usage and audit rows record `execution_role`, requested/effective account identity, switch history, pressure owner, and the GitHub `account_id` / `credential_ref` pair that actually executed the call.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/Prompt_Pipeline.md
