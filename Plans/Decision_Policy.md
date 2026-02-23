# Decision Policy (Canonical)

<!--
PUPPET MASTER -- DETERMINISTIC DECISION POLICY

Goal: remove "ask later" ambiguity by defining deterministic defaults.

ABSOLUTE NAMING RULE:
- Platform name is "Puppet Master" only.
- If older naming exists, refer to it only as "legacy naming" (do not quote it).
-->

## 0. Scope
This policy applies whenever a plan or implementation encounters an ambiguity that is not resolved by Spec Lock, Crosswalk, DRY Rules, or Glossary.

ContractRef: PolicyRule:Decision_Policy.md

---

## 1. Precedence (non-negotiable)
Resolve ambiguity in this order:
1. `Plans/Spec_Lock.json`
2. `Plans/Crosswalk.md`
3. `Plans/DRY_Rules.md`
4. `Plans/Glossary.md`
5. This policy

ContractRef: SchemaID:Spec_Lock.json

---

<a id="2"></a>
## 2. Deterministic defaults (must be autonomous)
When multiple valid choices exist and higher-precedence sources do not decide:

1) **Prefer the simplest safe default** that does not expand scope.
   - Example: choose a single host (GitHub.com) rather than adding multi-host abstractions.

2) **Prefer API-only over CLI subprocesses** when both are possible and Spec Lock forbids the CLI.

3) **Prefer idempotent behavior**.
   - If an operation can be repeated safely, implement it as idempotent (no double-side-effects).

4) **Prefer bounded retries**.
   - Retries MUST have explicit limits and backoff.

5) **Prefer stable IDs over inferred labels**.
   - UI commands use `cmd.*` IDs; event types use stable `type` strings.

6) **Prefer redaction**.
   - If data might be a secret, treat it as a secret and do not persist it.

ContractRef: Invariant:INV-002, SchemaID:Spec_Lock.json#github_operations

---

## 3. Tie-break rules (ordering)
If two choices are otherwise equal:
- Choose the option that is already referenced by an existing plan document.
- If still tied, choose lexicographically smallest stable ID.

ContractRef: PolicyRule:Decision_Policy.md§2

---

## 4. "No human in the loop" rule
Plans MUST NOT depend on humans making decisions mid-run.
If a plan describes optionality, it MUST declare a deterministic default and cite this policy.

ContractRef: PolicyRule:Decision_Policy.md§2
