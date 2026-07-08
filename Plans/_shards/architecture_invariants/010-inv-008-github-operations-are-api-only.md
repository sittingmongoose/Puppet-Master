# Shard 010: INV-008 -- GitHub operations are API-only

Source: `Plans/Architecture_Invariants.md`

Source lines: L137-L146

Source SHA256: `fab349fb07405fa12bb0ee2bf0c49308e8b0bb9581290de3ba5db02abe5c0b1e`

---

## INV-008 -- GitHub operations are API-only


**Rule:** GitHub hosting/auth/repo/fork/PR operations MUST use the GitHub HTTPS API only; the GitHub CLI (`gh`) MUST NOT be used for these operations.

ContractRef: SchemaID:Spec_Lock.json#locked_decisions.github_operations, ContractName:Plans/GitHub_API_Auth_and_Flows.md

---

<a id="INV-009"></a>
