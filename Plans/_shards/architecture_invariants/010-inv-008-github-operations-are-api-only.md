# Shard 010: INV-008 -- GitHub operations are API-only

Source: `Plans/Architecture_Invariants.md`

Source lines: L104-L113

Source SHA256: `a1488a98949bf363a0c763a51dae6dc4db5261708c7828eeca492e65f251c543`

---

## INV-008 -- GitHub operations are API-only


**Rule:** GitHub hosting/auth/repo/fork/PR operations MUST use the GitHub HTTPS API only; the GitHub CLI (`gh`) MUST NOT be used for these operations.

ContractRef: SchemaID:Spec_Lock.json#locked_decisions.github_operations, ContractName:Plans/GitHub_API_Auth_and_Flows.md

---

<a id="INV-009"></a>
