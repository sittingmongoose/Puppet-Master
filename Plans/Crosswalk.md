# Crosswalk (Canonical)

<!--
PUPPET MASTER -- CANONICAL CROSSWALK

Purpose:
- Define *ownership boundaries* for core primitives so plan documents do not drift into duplicating each other.
- Keep it DRY: other plans reference these sections rather than redefining boundaries.

ABSOLUTE NAMING RULE:
- Platform name is "Puppet Master" only.
- If older naming exists, refer to it only as "legacy naming" (do not quote it).
-->

## 0. Scope
This document is a **boundary map**, not an implementation plan.
It assigns authoritative ownership for *primitives* (Tool, Provider, UICommand, SessionStore, PatchPipeline, AuthState, etc.) so each plan can remain DRY.

ContractRef: Primitive:Crosswalk

---

## 1. Precedence (anti-drift)
When two plan documents disagree, resolve conflicts deterministically with this precedence order:
1. `Plans/Spec_Lock.json`
2. This Crosswalk
3. `Plans/DRY_Rules.md`
4. `Plans/Glossary.md`
5. `Plans/Decision_Policy.md`

ContractRef: PolicyRule:Decision_Policy.md§2, SchemaID:Spec_Lock.json

---

## 2. Primitive index (definitions are DRY)
This file uses primitive names as **routing labels** only; detailed schemas belong to their SSOT documents.

- `Primitive:Provider` -- provider CLIs and their normalized streams (see `Plans/CLI_Bridged_Providers.md`).
- `Primitive:Tool` -- host tools invoked by Puppet Master (see `Plans/Tools.md`).
- `Primitive:UICommand` -- stable UI command IDs (see `Plans/Contracts_V0.md#UICommand` and `Plans/UI_Command_Catalog.md`).
- `Primitive:SessionStore` -- persistent store boundaries (see `Plans/storage-plan.md`).
- `Primitive:PatchPipeline` -- Git + PR workflows (see `Plans/WorktreeGitImprovement.md` and `Plans/GitHub_API_Auth_and_Flows.md`).
- `ContractName:Contracts_V0.md#AuthState` -- auth state + events.

ContractRef: ContractName:Contracts_V0.md, SchemaID:Spec_Lock.json

---

## 3. Ownership boundaries

<a id="3.1"></a>
### 3.1 GitHubApiTool
**Owner:** Tooling domain (`Plans/Tools.md`).

**Definition (boundary only):** `GitHubApiTool` is the *only* permitted interface for GitHub HTTPS API calls.

Rules:
- GitHub operations MUST be implemented via GitHub HTTPS API calls and OAuth access tokens.
- The GitHub CLI is forbidden for auth/status/repo/fork/PR operations.
- Auth flows are owned by `Plans/GitHub_API_Auth_and_Flows.md`; this section only assigns ownership.

ContractRef: ToolID:GitHubApiTool, SchemaID:Spec_Lock.json#github_operations, ContractName:Contracts_V0.md#AuthEvent

---

### 3.2 UICommand
**Owner:** UI domain (UI catalog + typed commands).

Rules:
- The UI MUST dispatch stable command IDs; it MUST NOT implement business logic.
- Command IDs are canonical in `Plans/UI_Command_Catalog.md`.

ContractRef: Primitive:UICommand, ContractName:Contracts_V0.md#UICommand

---

### 3.3 Provider
**Owner:** Provider domain (CLI runners, capability probing, normalized stream).

Rules:
- Provider-specific discovery/auth/model logic MUST live in Provider-owned modules and contracts.
- Plans may reference provider behavior, but MUST NOT hardcode provider CLI details outside Provider SSOT.

ContractRef: Primitive:Provider, ContractName:Plans/CLI_Bridged_Providers.md

---

### 3.4 PatchPipeline
**Owner:** PatchPipeline domain.

Rules:
- Git primitives (worktrees, remotes, push) are local-git owned; hosting operations are GitHub API owned per Spec Lock.

ContractRef: Primitive:PatchPipeline, SchemaID:Spec_Lock.json#github_operations

---

### 3.5 SessionStore
**Owner:** Storage domain (`Plans/storage-plan.md`).

Rules:
- Persistent event envelope contracts are owned by `Plans/Contracts_V0.md`.
- Secrets are forbidden from persistent stores (see invariants).

ContractRef: Primitive:SessionStore, ContractName:Contracts_V0.md#EventRecord

---

<a id="3.6"></a>
### 3.6 AuthState
**Owner:** Contracts + provider-specific auth plan.

Rules:
- `AuthState` and auth event types are defined in `Plans/Contracts_V0.md`.
- Provider-specific auth flows (GitHub device flow) are defined in `Plans/GitHub_API_Auth_and_Flows.md`.
- Tokens MUST NOT be persisted in `AuthState`; tokens live only in the OS credential store.

ContractRef: ContractName:Contracts_V0.md#AuthState, Plans/Architecture_Invariants.md#INV-002

---

## References
- `Plans/Spec_Lock.json`
- `Plans/DRY_Rules.md`
- `Plans/Glossary.md`
- `Plans/Decision_Policy.md`
- `Plans/Tools.md`
- `Plans/Contracts_V0.md`
- `Plans/storage-plan.md`
