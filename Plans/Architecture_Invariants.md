# Architecture Invariants (Canonical)

<!--
PUPPET MASTER -- ARCHITECTURE INVARIANTS

ABSOLUTE NAMING RULE:
- Platform name is "Puppet Master" only.
- If older naming exists, refer to it only as "legacy naming" (do not quote it).
-->

## 0. Scope
Invariants are cross-cutting rules that MUST hold across all plans and implementations.

ContractRef: Primitive:Invariant, PolicyRule:Decision_Policy.md§1

---

<a id="INV-001"></a>
## INV-001 -- Tool correlation integrity (normalized streams + persisted events)
**Rule:** Tool invocation correlation MUST be consistent:
- In normalized provider streams, every `tool_use` MUST have exactly one matching `tool_result` with the same `tool_use_id` (no orphan tool events).  
  ContractRef: ContractName:Plans/CLI_Bridged_Providers.md
- In persisted event streams, tool activity MUST be represented using the canonical tool event types (`tool.invoked`, `tool.denied`) and MUST include stable `run_id` + `thread_id` correlation.  
  ContractRef: ContractName:Contracts_V0.md

---

<a id="INV-002"></a>
## INV-002 -- No secrets in persistent storage
**Rule:** Secrets (tokens, credentials, private keys) MUST NOT be written to:
- seglog event stream
- redb projections
- Tantivy indexes
- plaintext logs, evidence bundles, or state files

**Allowed persistence:** OS credential store only.

ContractRef: SchemaID:Spec_Lock.json#locked_decisions.storage, SchemaID:evidence.schema.json, PolicyRule:no_secrets_in_storage

---

<a id="INV-003"></a>
## INV-003 -- UI SSOT (no bespoke UI behavior)
**Rule:** UI copy, buttons, and view behavior MUST be specified in the canonical UI SSOT docs and typed command layer; plan docs may reserve IDs but must not invent ad-hoc UI behaviors.

ContractRef: Primitive:UICommand, ContractName:Contracts_V0.md#UICommand

---

<a id="INV-004"></a>
## INV-004 -- UI command boundary (no business logic in UI)
**Rule:** The UI layer MUST dispatch stable `UICommand` IDs and MUST NOT execute business logic directly.

ContractRef: Primitive:UICommand, ContractName:Contracts_V0.md#UICommand, ContractName:Plans/UI_Command_Catalog.md

---

<a id="INV-005"></a>
## INV-005 -- Deterministic ordering from SSOT lists
**Rule:** When multiple candidates exist (paths, names, servers, etc.), tie-break ordering MUST come from a single SSOT list owned by the relevant domain; no heuristic reordering.

ContractRef: Primitive:Provider, ContractName:Plans/CLI_Bridged_Providers.md

---

<a id="INV-006"></a>
## INV-006 -- Providers are storage-isolated
**Rule:** Providers and provider adapters MUST NOT write directly to persistent storage (seglog/redb/Tantivy). They emit normalized events; storage writers/projectors own persistence.

ContractRef: Primitive:Provider, Primitive:SessionStore, ContractName:Plans/Crosswalk.md

---

<a id="INV-007"></a>
## INV-007 -- No stringly-typed IDs outside SSOT
**Rule:** Stable IDs (Tool IDs, UICommand IDs, ConfigKey names, schema IDs) MUST NOT be re-invented as ad-hoc string literals in multiple places. They must be defined once (SSOT) and referenced everywhere else.

ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md

---

<a id="INV-008"></a>
## INV-008 -- GitHub operations are API-only
**Rule:** GitHub hosting/auth/repo/fork/PR operations MUST use the GitHub HTTPS API only; the GitHub CLI (`gh`) MUST NOT be used for these operations.

ContractRef: SchemaID:Spec_Lock.json#locked_decisions.github_operations, ContractName:Plans/GitHub_API_Auth_and_Flows.md

---

<a id="INV-009"></a>
## INV-009 -- Cursor transport is invisible to consumers
**Rule:** Cursor must support both `stream-json` and ACP transports under one Provider facade; consumers MUST NOT branch on transport type.

ContractRef: SchemaID:Spec_Lock.json#locked_decisions.providers, ContractName:Plans/CLI_Bridged_Providers.md

---

<a id="INV-010"></a>
## INV-010 -- Platform naming compliance
**Rule:** The platform name is **Puppet Master** only.
Any older naming must be referred to only as **legacy naming** (without quoting the older name).

ContractRef: Primitive:Glossary

---

## Contract-driven code generation (lightweight; DRY)
To avoid duplicated shapes for tools/events/policy:
- JSON Schemas under `Plans/*.schema.json` are the canonical source for validation and (optionally) code generation.  
  ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md
- Generated Rust code MUST live under a single `generated/` boundary (path is implementation-defined) and MUST NOT be hand-edited.  
  ContractRef: Primitive:Invariant, PolicyRule:Decision_Policy.md§2

---

## Validation (gated; autonomous)
Invariants are validated by progression gate `GATE-003`.

**Minimum automated checks (scriptable):**
- Validate schemas (plan graph, evidence, change budget, auto decisions).  
  ContractRef: Gate:GATE-001
- Enforce `INV-008` by scanning for GitHub CLI usage in build-governing docs and implementation surfaces.  
  ContractRef: Invariant:INV-008
- Enforce `INV-010` naming compliance in `Plans/` (platform name only).  
  ContractRef: Invariant:INV-010

ContractRef: Gate:GATE-003
