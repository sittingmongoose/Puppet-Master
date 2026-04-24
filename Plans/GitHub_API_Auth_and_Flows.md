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

The GitHub OAuth/PAT auth context MUST include these fields in the runtime identity record:
ContractRef: Primitive:RuntimeIdentity, Primitive:ExecutionContext, ContractName:Plans/Contracts_V0.md

```typescript
GitHub_AuthContext {
  account_id: string,                  // GitHub user or org ID
  account_type: enum,                  // 'user' | 'org' | 'app'
  account_login: string,               // GitHub username or org name
  oauth_token?: string,                // (only when active session)
  pat_token?: string,                  // (only when PAT-based)
  scopes: string[],                    // OAuth scopes or PAT permissions
  expires_at_utc?: string,             // Token expiration (if applicable)
  is_effective_account: boolean,       // Whether this is the effective_account_id or a capability check
  switched_from_account_id?: string,   // If account was switched, the prior account_id
  switch_reason?: string,              // Why the switch occurred (capability check, user request, policy, etc.)
}
```

**Integration with runtime identity:**
- When a GitHub operation is requested, the runtime identity's `effective_account_id` is resolved through the GitHub auth context.
- If the requested GitHub account differs from the effective account, the switch is logged in `account_switch_lineage[]` with metadata (switch_reason, switch_time_utc).
- All GitHub API calls include the account_id context so audits and logs can trace which account performed the operation.

**Capability-check semantics:**
- Before switching to a requested GitHub account, the runtime performs a capability check: does the current user/role have permission to assume this account's context?
- If the capability check fails, the effective_account_id remains the prior account and an escalation is triggered (not a silent fallback).
- Successful capability checks are logged (not as errors, but as audit events) so recovery and tracing are visible.

ContractRef: Primitive:RuntimeIdentity, Primitive:ExecutionContext, ContractName:Plans/Contracts_V0.md
