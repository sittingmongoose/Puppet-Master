# Shard 004: Canonical references and constraints (SSOT; DRY)

Source: `Plans/BinaryLocator_Spec.md`

Source lines: L22-L63

Source SHA256: `841eb411c76dcc294459641183432172fed5ee3515a566e23716c09b85ad1e6a`

---

## Canonical references and constraints (SSOT; DRY)

### Locked decisions (no drift)


- Platform name is **Puppet Master** only. (ContractRef: Invariant:INV-010)
- UI toolkit is **Slint 1.17.1 on Rust stable 1.96.1** by 2026-07-07 owner decision; Iced is legacy. (ContractRef: SchemaID:spec_lock)
- Storage is **seglog + redb + Tantivy**; SQLite is forbidden. (ContractRef: SchemaID:spec_lock)

### Canonical sources (reference, don't duplicate)


- Primitive ownership boundaries: `Plans/Crosswalk.md` (ContractRef: Primitive:Provider)
- DRY / ContractRef rule: `Plans/DRY_Rules.md` §7 (ContractRef: SchemaID:spec_lock)
- Autonomy / deterministic defaults: `Plans/Decision_Policy.md` (ContractRef: SchemaID:spec_lock)
- Contracts baseline (providers, tools, events): `Plans/Contracts_V0.md` (ContractRef: SchemaID:spec_lock)
- Storage envelopes + transition note: `Plans/storage-plan.md` §2.2 (ContractRef: SchemaID:EventEnvelopeV1)
- Naming rules + canonical terms: `Plans/Glossary.md` (ContractRef: SchemaID:spec_lock)

### Legacy-code anchor note (read-only)
This spec may cite `puppet-master-rs/src/...` paths as **legacy-code behavior anchors** only.
- Those paths are **not** the canonical SSOT for the rewrite architecture (see Spec Lock). (ContractRef: SchemaID:spec_lock)
- When conflicts exist, follow Decision Policy precedence: **Spec Lock → Crosswalk → DRY Rules → Glossary → Decision Policy defaults**. (ContractRef: SchemaID:spec_lock)

Packet-derived output boundary: when BinaryLocator is mentioned in reconciliation packets, packet doc intent buckets include `MUST CHANGE` and `MUST RECONCILE` docs only; `MUST VERIFY` docs are review inputs rather than primary write targets. Derived-only outputs such as ledger summaries, audit tables, and cross-reference matrices are research artifacts, not BinaryLocator doc intents. If packet material restates a behavior owned by another canonical doc, REFERENCE that owner doc instead of duplicating the behavior inline.

### Cross-owner boundary constraints

BinaryLocator preserves the following routed boundary constraints when provider or binary-discovery packet material exposes wider platform drift:
- Agent coordination state MUST remain event-sourced through `seglog` / `redb` and `/redb` storage; `active-agents.json` and `active-agents` views may be debug mirrors only, because using a flat agent file as canonical state creates split-brain risk.
- `Plans/interview-subagent-integration.md` / `/interview-subagent-integration.md` consumers with field-name drift, pseudo-tier execution-key bugs, or simultaneous field-name and scope-language drift must normalize through the runtime, route, and contract owners instead of teaching BinaryLocator new execution identity.
- `usage_event_ref` is a locator-grade structured locator, not a display string, timestamp heuristic, or opaque replacement ID family; chat/interview/wizard actors, including `/interview/wizard` flows, may share provider `/runtime` but must stay ontology-separated from orchestration nodes.
- Hard spec-integrity defects such as duplicate sections, duplicate numbering, internally contradictory migration rules, stale approval-model command contracts, and exact command-arg mismatches are contract failures; BinaryLocator references the owning command, approval, or migration doc rather than masking them as style cleanup.
- Terminology drift in `Plans/Glossary.md`, `Plans/Decision_Policy.md`, and `Plans/Crosswalk.md` must adopt Seam/Lane/Overseer/Package vocabulary, including `/Glossary.md`, `/Decision_Policy.md`, `/Crosswalk.md`, and `/Lane/Overseer/Package` references; stale `newfeatures.md` four-tier hierarchy and `no new tiers` claims must not override the `chain-wizard-flexibility.md` / chain-wizard-flexibility node-graph model.
- `Plans/Executor_Protocol.md` / `/Executor_Protocol.md` remains the owner for execution-core duplicate canonical sections plus mint, `/handshake`, and handoff rules; BinaryLocator must not absorb those rules while validating provider binaries.
- `storage-plan.md`, storage-plan, and `FileManager.md` remain consumers of canonical route identity, not owners that can redefine it locally; BinaryLocator traces and cache keys must follow route/runtime owners when a provider discovery outcome is opened or inspected.
- `Permissions_System.md` / Permissions_System approval cache and reject-cascade behavior must be scoped by multi-lane, shared-runtime actor separation rather than globally session-scoped state; BinaryLocator diagnostics may reference permission results but must not define permission scope.
- `Plans/assistant-chat-design.md` / `/assistant-chat-design.md` must not be over-corrected when provider/runtime packet material touches chat surfaces: assistant-chat-design is mostly aligned, no longer a main drift multiplier, and any remaining compatibility-oriented drift stays with the chat owner instead of becoming BinaryLocator behavior.
- Approval and blocking seams that expose blocked-family mismatch, scope-language drift, or graph command payload drift route to the HITL, runtime, Run Graph, Orchestrator, and command owners; BinaryLocator must not encode those seams as locator state, binary validation, or provider discovery contracts.
- Orchestrator GUI/help copy drift is a glossary/help coverage dependency: newer Orchestrator concepts need `GUI` and `/help` coverage before user-facing copy can stabilize, and BinaryLocator diagnostics may reference those owners without minting local help vocabulary.

---
