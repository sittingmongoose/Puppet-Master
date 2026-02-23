# Architecture Invariants (Canonical)

<!--
PUPPET MASTER -- ARCHITECTURE INVARIANTS

ABSOLUTE NAMING RULE:
- Platform name is "Puppet Master" only.
- If older naming exists, refer to it only as "legacy naming" (do not quote it).
-->

## 0. Scope
Invariants are cross-cutting rules that MUST hold across all plans and implementations.

ContractRef: Primitive:Invariant

---

<a id="INV-002"></a>
## INV-002 -- No secrets in persistent storage
**Rule:** Secrets (tokens, credentials, private keys) MUST NOT be written to:
- seglog event stream
- redb projections
- Tantivy indexes
- plaintext logs, evidence bundles, or state files

**Allowed persistence:** OS credential store only.

ContractRef: SchemaID:Spec_Lock.json#storage, PolicyRule:no_secrets_in_storage

---

<a id="INV-003"></a>
## INV-003 -- UI SSOT (no bespoke UI behavior)
**Rule:** UI copy, buttons, and view behavior MUST be specified in the canonical UI SSOT docs and typed command layer; plan docs may reserve IDs but must not invent ad-hoc UI behaviors.

ContractRef: Primitive:UICommand, ContractName:Contracts_V0.md#UICommand

---

<a id="INV-005"></a>
## INV-005 -- Deterministic ordering from SSOT lists
**Rule:** When multiple candidates exist (paths, names, servers, etc.), tie-break ordering MUST come from a single SSOT list owned by the relevant domain; no heuristic reordering.

ContractRef: Primitive:Provider

---

<a id="INV-010"></a>
## INV-010 -- Platform naming compliance
**Rule:** The platform name is **Puppet Master** only.
Any older naming must be referred to only as **legacy naming** (without quoting the older name).

ContractRef: Primitive:Glossary

---

## Validation (gated)
- Invariants are validated by progression gate `GATE-003`.

ContractRef: Gate:GATE-003
