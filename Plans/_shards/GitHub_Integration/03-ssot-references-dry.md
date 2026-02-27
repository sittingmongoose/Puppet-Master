## SSOT References (DRY)

The following canonical documents govern this spec. This document MUST NOT redefine
schemas or contracts owned by those sources; it adds the IDE UX layer on top of them.

ContractRef: ContractName:Plans/DRY_Rules.md, PolicyRule:Decision_Policy.md§2

| Reference | Purpose |
|---|---|
| `Plans/Spec_Lock.json` | Locked decisions (github_operations, auth_model) |
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

> This document intentionally does **not** redefine `AuthState`, `AuthPolicy`, `AuthEvent`,
> GitHub device-code polling semantics, token storage rules, or GitHub API call contracts.
> Those are canonical in `Plans/GitHub_API_Auth_and_Flows.md` and `Plans/Contracts_V0.md`.

---

> **Anti-Drift Compliance:**
> - All operational statements require `ContractRef:` annotations (ContractRef: Plans/DRY_Rules.md, Plans/Progression_Gates.md#GATE-009).
> - Architecture invariants apply, especially secrets and naming (ContractRef: Plans/Architecture_Invariants.md#INV-002, Plans/Architecture_Invariants.md#INV-010).
> - Ambiguity resolved deterministically via `Plans/Decision_Policy.md` §2 (ContractRef: PolicyRule:Decision_Policy.md§2).
> - GitHub API operations use `github_api` realm only; not `copilot_github` (ContractRef: Plans/GitHub_API_Auth_and_Flows.md §auth-realm-split).

---

