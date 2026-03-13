## Anti-Drift Compliance

> - All operational statements require `ContractRef:` annotations
>   (ContractRef: Plans/DRY_Rules.md, Plans/Progression_Gates.md#GATE-009).
> - Architecture invariants apply, especially secrets and naming
>   (ContractRef: Plans/Architecture_Invariants.md#INV-002, Plans/Architecture_Invariants.md#INV-010).
> - Ambiguity resolved deterministically via `Plans/Decision_Policy.md` §2
>   (ContractRef: PolicyRule:Decision_Policy.md§2).
> - GitHub API operations use `github_api` realm only; not `copilot_github`
>   (ContractRef: Plans/GitHub_API_Auth_and_Flows.md §auth-realm-split).
> - No `TBD`, `Open question`, or `ask later` language exists in this document
>   (ContractRef: ContractName:Plans/DRY_Rules.md#4).
> - All MUST/SHALL/REQUIRED/NEVER statements carry at least one `ContractRef:`
>   (ContractRef: ContractName:Plans/DRY_Rules.md#7).
> - UI commands are reserved in §E and MUST be added to `Plans/UI_Command_Catalog.md`
>   before implementation (ContractRef: Invariant:INV-007, Gate:GATE-010).

---

