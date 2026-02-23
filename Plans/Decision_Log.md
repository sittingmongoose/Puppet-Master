# Decision Log (Canonical)

<!--
PUPPET MASTER -- DECISION LOG

Purpose: record deterministic decisions (with rationale + references) so they do not drift.
-->

## 0. Format
Each entry MUST include:
- `DecisionID` -- stable ID
- `Decision` -- one-sentence statement
- `Rationale` -- short explanation
- `ContractRef` -- citations to Spec Lock / Crosswalk / Contracts / etc.

ContractRef: PolicyRule:Decision_Policy.md§2

---

## 1. Decisions

### DEC-0001 -- GitHub operations are API-only
Decision: GitHub hosting/auth/repo/fork/PR operations use GitHub HTTPS API only; GitHub CLI is forbidden.

Rationale: Removes dependency on external CLI auth state and enforces a single integration surface.

ContractRef: SchemaID:Spec_Lock.json#github_operations
