# Decision Policy (Canonical)

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


<!--
PUPPET MASTER -- DETERMINISTIC DECISION POLICY

Goal: remove deferred-decision ambiguity by defining deterministic defaults.

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
   ContractRef: PolicyRule:Decision_Policy.md§2

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

### 3.1 Autonomous decision logging contract

When Puppet Master resolves an ambiguity without human input, it MUST emit exactly one schema-valid auto-decision row for that resolved ambiguity.

ContractRef: SchemaID:pm.auto_decisions.schema.v1, PolicyRule:Decision_Policy.md§2

Two logging scopes exist:
- `Plans/auto_decisions.jsonl` — internal Puppet Master plan-governance decisions.
- `.puppet-master/project/auto_decisions.jsonl` — user-project decisions made while generating or validating project artifacts.

Path selection rule:
- If the decision changes or explains Puppet Master internal SSOT documents, write to `Plans/auto_decisions.jsonl`.
- If the decision changes or explains generated user-project artifacts under `.puppet-master/project/**`, write to `.puppet-master/project/auto_decisions.jsonl`.

Field semantics:
- `scope` MUST identify the decision domain deterministically.
- `inputs_hash` MUST be computed from the ambiguity inputs actually used to make the choice, using a deterministic byte representation chosen by the owning subsystem.
- `decision` MUST name the winning choice in stable language.
- `rationale` MUST state why the winning choice was required by the precedence stack or deterministic defaults.
- `applied_to[]` MUST identify the concrete targets affected by the decision.
- `contract_refs[]` MUST include the authoritative references that justified the choice.

Security rule:
- Auto-decision rows MUST NOT contain secrets or credential material in `decision`, `rationale`, or `applied_to[]`.

ContractRef: SchemaID:pm.auto_decisions.schema.v1, PolicyRule:Decision_Policy.md§1, PolicyRule:no_secrets_in_storage, Invariant:INV-002

---

## 4. "No human in the loop" rule
Plans MUST NOT depend on humans making decisions mid-run.
If a plan describes optionality, it MUST declare a deterministic default and cite this policy.

ContractRef: PolicyRule:Decision_Policy.md§2

---

<a id="spec-lock-update-protocol"></a>
## 5. SpecLock Update Protocol (autonomous; no human readers)

**Rule:** `Plans/Spec_Lock.json` is a lockfile; agents MUST only update it via this protocol and MUST proceed deterministically (no interactive human-decision pauses; deterministic logging remains required where this protocol says to append to `auto_decisions.jsonl`).
ContractRef: SchemaID:Spec_Lock.json, PolicyRule:Decision_Policy.md§2, SchemaID:pm.auto_decisions.schema.v1

### 5.1 When Spec Lock updates are allowed
Spec Lock updates are allowed only when at least one locked invariant/decision must change to satisfy a higher-level requirement (e.g., a new official toolkit version, a required auth scope change).  
ContractRef: SchemaID:Spec_Lock.json

### 5.2 Required steps (deterministic)
When an update is required, agents MUST:
1. Update `Plans/Spec_Lock.json` fields (no partial updates).  
   ContractRef: SchemaID:Spec_Lock.json, PolicyRule:Decision_Policy.md#spec-lock-update-protocol
2. Recompute and update `canonical_ssot_hashes[*].sha256` for every SSOT file listed in Spec Lock.  
   ContractRef: SchemaID:Spec_Lock.json#canonical_ssot_hashes
3. Append one JSONL row to `Plans/auto_decisions.jsonl` describing the change and its deterministic rationale.  
   ContractRef: SchemaID:auto_decisions.schema.json, PolicyRule:Decision_Policy.md#spec-lock-update-protocol
4. Produce an evidence bundle for the update (schema-valid) and run the verifier gates.  
   ContractRef: SchemaID:evidence.schema.json, Gate:GATE-001, PolicyRule:Decision_Policy.md#spec-lock-update-protocol

### 5.3 Prohibited update behaviors
Agents MUST NOT:
- add `TBD` / `Open Questions` / `ask later` language as part of a Spec Lock update  
  ContractRef: ContractName:Plans/DRY_Rules.md#4
- leave hashes stale after changing SSOT docs  
  ContractRef: SchemaID:Spec_Lock.json#canonical_ssot_hashes

---

### PolicyRule: no_secrets_in_storage

**Scope:** All persistent stores (seglog, redb, Tantivy indexes).

**Rule:** Persistent stores MUST NOT contain secrets (tokens, passwords, API keys, OAuth refresh tokens). Tokens live only in the OS credential store (platform keyring). Violations are P0 bugs requiring immediate remediation.

**Rationale:** Secrets in persistent stores risk exfiltration via backup, log export, or crash dump. The OS credential store provides encrypted, access-controlled storage.

**Cross-references:**
- Architecture_Invariants.md#INV-002
- Crosswalk.md §3.5 (SessionStore rules)
- Crosswalk.md §3.6 (AuthState rules: "Tokens MUST NOT be persisted in AuthState")

ContractRef: PolicyRule:no_secrets_in_storage, Plans/Architecture_Invariants.md#INV-002

---

<a id="6"></a>
## 6. Ambiguity vs. Missing User Intent

### 6.1 Ambiguity (multiple valid choices)

**Definition:** The specification leaves open a technical or design choice where multiple options would equally satisfy user intent.

**Resolution rule:** Apply a deterministic default from §2. Log to `Plans/auto_decisions.jsonl` with schema `pm.auto_decisions.schema.v1`. No user interaction required.

**Examples:**
- Choosing a buffer size
- Picking a retry count
- Selecting a color within a brand palette

ContractRef: `PolicyRule:Decision_Policy.md§2`, `SchemaID:auto_decisions.schema.json`

---

### 6.2 Missing User Intent / Insufficient Specification

**Definition:** The user has not expressed what they want — the system cannot infer intent because the choice materially affects product behavior or scope. This is NOT a technical implementation detail; it is a product decision only the user can make.

**Resolution rule:** The system MUST generate a clarification question. It MUST NOT apply a deterministic default. The clarification question is captured in the requirements quality report (`Plans/requirements_quality_report.schema.json`, field `needs_user_clarification[]`).

**Examples:**
- "Should the wizard allow importing from a URL or only local files?"
- "Should failed iterations retry automatically or pause for user review?"

ContractRef: `SchemaID:pm.requirements_quality_report.schema.v1`, `PolicyRule:Decision_Policy.md§4`

---

### 6.3 Interaction with the "No Human in the Loop" Rule (§4)

The §4 rule ("plans must not depend on humans making decisions mid-run") applies to **runtime execution** (orchestrator runs, agent iterations, verification gates).

Clarification questions under §6.2 are generated **prior to execution**, during wizard/interview artifact generation. This does NOT violate §4.

**Timing:** Clarification questions surface during Chain Wizard or Interview phase, before any orchestrator run begins.

**Blocking rule:** If a clarification question cannot be resolved before an orchestrator run begins, the run MUST NOT start. The wizard state transitions to `attention_required` and blocks the "Start Run" action.

ContractRef: `PolicyRule:Decision_Policy.md§4`, `ContractName:Plans/chain-wizard-flexibility.md`

---

### 6.4 Requirements quality report boundary, severity, and persistence

The `requirements_quality_report` is a pre-execution artifact. It MUST be generated during the mandatory validation sweep defined in `Plans/chain-wizard-flexibility.md §12` after Contract Unification and before any orchestrator run, plan-node execution, or user-visible "Start Run" action begins.

ContractRef: SchemaID:pm.requirements_quality_report.schema.v1, ContractName:Plans/chain-wizard-flexibility.md

Blocking rule:
- Execution MAY continue only when the latest canonical report has `verdict: "PASS"` and `needs_user_clarification[]` is empty.
- If `needs_user_clarification[]` is non-empty, the workflow MUST transition to the clarification/escalation path instead of starting execution.

ContractRef: SchemaID:pm.requirements_quality_report.schema.v1, PolicyRule:Decision_Policy.md§4

Deterministic severity rules:
- `missing_scenarios`, `missing_boundary`, `missing_anchor`, `missing_acceptance`, and `missing_research` are always `blocking`.
- `contradiction` is `blocking` when it changes product behavior, acceptance expectations, or contract/plan routing; otherwise it MAY be `warning` only when a deterministic autofix resolves it fully.
- `vagueness` is `blocking` when it prevents executable acceptance, boundary declaration, or user-intent resolution; otherwise it MAY be `warning`.

Persistence safety rule:
- Before persisting `description`, `before`, `after`, `context`, or `question` fields in the quality report, Puppet Master MUST redact secret-like values and MUST NOT copy credentials or tokens into the artifact.

ContractRef: SchemaID:pm.requirements_quality_report.schema.v1, PolicyRule:no_secrets_in_storage

Lifecycle note:
- Clarification-round limits and `blocked` transition semantics are owned by `Plans/chain-wizard-flexibility.md §15`; this section defines the pre-execution boundary and severity rules only.

ContractRef: SchemaID:pm.requirements_quality_report.schema.v1, PolicyRule:Decision_Policy.md§4, PolicyRule:no_secrets_in_storage, Invariant:INV-002, ContractName:Plans/chain-wizard-flexibility.md#12-three-pass-canonical-validation-workflow-mandatory-invariant-sweep
