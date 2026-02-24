# Decision Log (DEPRECATED — do not use)

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


<!--
PUPPET MASTER -- DECISION LOG (DEPRECATED)

This file is retained only for legacy context. It is NOT a canonical input to autonomous execution.
-->

## 0. Canonical replacement (machine-consumable)

**Rule:** Puppet Master decisions are recorded as newline-delimited JSON in:
- `Plans/auto_decisions.jsonl` (rows validate against `Plans/auto_decisions.schema.json`)

Deterministic decision-making rules live in:
- `Plans/Decision_Policy.md`

ContractRef: SchemaID:auto_decisions.schema.json, PolicyRule:Decision_Policy.md

## 1. No new entries

Agents MUST NOT add new entries to this file.  
ContractRef: PolicyRule:Decision_Policy.md#spec-lock-update-protocol
