# GitHub Integration -- Spec

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: "Puppet Master" only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.

<!--
PUPPET MASTER -- GITHUB INTEGRATION SPEC

ABSOLUTE NAMING RULE:
- Platform name is "Puppet Master" only.
- If older naming exists, refer to it only as "legacy naming" (do not quote it).

LOCKED DECISIONS (DO NOT CHANGE IN THIS DOC):
- GitHub operations: GitHub API provider only; no external auth-shell dependency
- Default auth flow: OAuth device-code (realm: github_api)
- No secrets in seglog/redb/Tantivy or logs; secrets live only in OS credential store
- Local git operations use the local `git` binary (not the GitHub API)
- SSH remote execution: git commands run on the remote via SSH subprocess
- All interactive UI elements dispatch UICommand IDs; no business logic in the UI layer
-->

## Change Summary

- **2026-02-25:** Remediation pass for §B. Added conditional PR/Issues panel visibility
  behavior (optional surface with deterministic disabled state), expanded PR/Issues/Actions
  failure-state tables, and added explicit Actions run/log summary contract fields.
- **2026-02-25:** Initial creation. Covers IDE Git Panel (§A), GitHub API integration
  (§B), SSH Remote Dev Servers (§C), and no-wizard Project Management flows (§D).
  All decisions resolved deterministically; no open questions.

---

## SSOT References (DRY)

The following canonical documents govern this spec. This document MUST NOT redefine schemas or contracts owned by those sources; it adds the IDE UX layer on top of them.

ContractRef: ContractName:Plans/DRY_Rules.md, PolicyRule:Decision_Policy.md§2

| Reference | Purpose |
|---|---|
| `Plans/Spec_Lock.json` | Locked decisions (`github_operations`, `auth_model`) |
| `Plans/DRY_Rules.md` | DRY + ContractRef rule (canonical) |
| `Plans/Contracts_V0.md` | Canonical contracts: EventRecord, UICommand, AuthState |
| `Plans/Glossary.md` | Canonical terminology |
| `Plans/Decision_Policy.md` | Deterministic defaults; tie-break policy |
| `Plans/Architecture_Invariants.md` | INV-002 (no secrets in storage), INV-010 (naming), INV-003/004/011/012 (UI rules) |
| `Plans/GitHub_API_Auth_and_Flows.md` | GitHub auth contract and API call flows (SSOT for auth; this doc adds IDE UX layer only) |
| `Plans/WorktreeGitImprovement.md` | Git/worktree implementation details and gap fixes |
| `Plans/FileManager.md` | File Manager panel and IDE-style editor |
| `Plans/chain-wizard-flexibility.md` | Wizard/project intent-based workflow definitions |
| `Plans/UI_Command_Catalog.md` | Stable UI command IDs (canonical SSOT) |
| `Plans/Progression_Gates.md` | GATE-003 (invariants), GATE-009 (ContractRef), GATE-010 (wiring) |
| `Plans/Crosswalk.md` | Primitive ownership boundaries |
| `Plans/storage-plan.md` | redb/seglog/Tantivy storage rules |

> This document intentionally does **not** redefine `AuthState`, `AuthPolicy`, `AuthEvent`, GitHub device-code polling semantics, token storage rules, or GitHub API call contracts.
> Those are canonical in `Plans/GitHub_API_Auth_and_Flows.md` and `Plans/Contracts_V0.md`.

---

> **Anti-Drift Compliance:**
> - All operational statements require `ContractRef:` annotations (ContractRef: Plans/DRY_Rules.md, Plans/Progression_Gates.md#GATE-009).
> - Architecture invariants apply, especially secrets and naming (ContractRef: Plans/Architecture_Invariants.md#INV-002, Plans/Architecture_Invariants.md#INV-010).
> - Ambiguity resolved deterministically via `Plans/Decision_Policy.md` §2 (ContractRef: PolicyRule:Decision_Policy.md§2).
> - GitHub API operations use `github_api` realm only; not `copilot_github` (ContractRef: Plans/GitHub_API_Auth_and_Flows.md §auth-realm-split).

---

## Canonical owner and consumer reconciliation

This section reconciles GitHub integration consumer semantics with the canonical owner specifications in Plans/Contracts_V0.md, Plans/Executor_Protocol.md, and Plans/Models_System.md.

### Consumer propagation

**Route and open integration**:
- GitHub Integration is a consumer of route_target and OpenSubject semantics.
- When a route_target resolves to a GitHub resource (e.g., `github://owner/repo/file.md`), GitHub Integration interprets the path, fetches the resource, and emits it to the active route (local file, artifact storage, etc.).
- When an OpenSubject references a GitHub concern (e.g., `github://owner/repo/issues/123`), GitHub Integration opens the issue and propagates its metadata (title, labels, state) to the orchestrator's concern record for unified help/escalation.

**Approval scope in GitHub workflows**:
- GitHub Integration respects the active execution_unit_context's approval_scope.
- If approval_scope is 'require_approval' and a GitHub PR review is pending, the approval_id is tied to the GitHub PR review ID so resumption can query the PR status.
- GitHub check runs and CI status are tied to execution_unit_id so the orchestrator can correlate CI outcomes with execution units.

**Account identity and GitHub permissions**:
- GitHub Integration consumes the runtime identity's GitHub_AuthContext (see Plans/GitHub_API_Auth_and_Flows.md).
- All GitHub API calls include the effective_account_id so the audit trail shows which account performed the operation.
- If a GitHub operation requires a different account context (e.g., cross-org access), GitHub Integration triggers a capability check through the runtime identity resolution flow, not a silent re-auth.

**Provider and model in GitHub context**:
- GitHub Integration may invoke providers (e.g., GitHub Copilot, GPT-4) as part of analysis (code review, test generation, etc.).
- Provider selection follows the scoped settings model in Plans/Models_System.md, with GitHub-specific precedence (e.g., prefer GitHub Copilot for GitHub-hosted code).
- Model selection is tied to the active Persona and execution_unit_type, not to the repository or organization.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Models_System.md, ContractName:Plans/GitHub_API_Auth_and_Flows.md
