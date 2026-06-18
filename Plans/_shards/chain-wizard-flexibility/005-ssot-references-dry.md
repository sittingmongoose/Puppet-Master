# Shard 005: SSOT references (DRY)

Source: `Plans/chain-wizard-flexibility.md`

Source lines: L45-L57

Source SHA256: `f3d36df91449821add7b4fb1ccd89743610c2b29a761660fb3ae1a96bc4db6dc`

---

## SSOT references (DRY)
- Locked decisions: `Plans/Spec_Lock.json` (GitHub HTTPS API-only operations)
- Canonical contracts: `Plans/Contracts_V0.md`
- Ownership boundaries (primitives): `Plans/Crosswalk.md`
- DRY + ContractRef rule: `Plans/DRY_Rules.md`
- Canonical terms: `Plans/Glossary.md`
- Deterministic defaults: `Plans/Decision_Policy.md`
- GitHub auth + API flows: `Plans/GitHub_API_Auth_and_Flows.md`
- User-project output artifacts: `Plans/Project_Output_Artifacts.md` (under `.puppet-master/project/*`)
- OpenCode provider integration: `Plans/Provider_OpenCode.md`
- Wizard/interview flows consume runtime `budget-outcome` names and usage snapshot fields only after `Plans/Contracts_V0.md` confirms the `/schema` surface stays stable across `Plans/Run_Modes.md`, `Plans/usage-feature.md`, and `Plans/orchestrator-subagent-integration.md`; this document must not mint a fresh event/schema delta for those outcomes.

ContractRef: SchemaID:Spec_Lock.json#locked_decisions.github_operations, PolicyRule:Decision_Policy.md§1
