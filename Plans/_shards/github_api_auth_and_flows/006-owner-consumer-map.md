# Shard 006: Owner / Consumer Map

Source: `Plans/GitHub_API_Auth_and_Flows.md`

Source lines: L156-L160

Source SHA256: `d67b62830013f496d67e925f36cb00eea849875c94a5921af311ae8f29bd5271`

---

## Owner / Consumer Map

`Plans/GitHub_API_Auth_and_Flows.md` remains the owner doc for GitHub API auth realm, credential secrecy, local Git versus GitHub hosting boundaries, callback binding policy, host policy, stable account identity, mutation recovery context, runtime identity transfer, and browser/debug auth handoff. Cross-doc consumers must preserve the owner routing in the source body rather than recreating GitHub-local auth, disabled-state, worktree, permission, or command-routing rules.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md
