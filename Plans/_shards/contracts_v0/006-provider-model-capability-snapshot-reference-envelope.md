# Shard 006: Provider/Model Capability Snapshot Reference Envelope

Source: `Plans/Contracts_V0.md`

Source lines: L1008-L1026

Source SHA256: `4ba6e6824049cf7d730459e43feba01ba802800f526dca6d1d8aa946b51caad3`

---

## Provider/Model Capability Snapshot Reference Envelope

Contracts_V0 owns only the cross-surface reference envelope for provider/model capability snapshots. `Plans/Models_System.md` owns the capability field semantics, fallback-chain eligibility, context-window and max-token limits, provenance, and requested/effective model resolution.

Cross-surface payloads that need provider/model capability evidence MUST reference the shared snapshot instead of copying provider capability tables. The minimal envelope fields are:
- `capability_snapshot_ref`
- `requested_effective_snapshot_ref`
- `provider_entry_id`
- `model_id`
- `effective_model_id?`
- `context_budget_ref?`
- `fallback_chain_ref?`
- `capability_provenance_refs[]`
- `capability_state`
- `capability_state_reason?`

Allowed `capability_state` values are `supported`, `unsupported`, `capability_gated`, `clamped`, `inferred`, `opaque`, `stale`, and `unverified`. `fallback_chain_ref?` points to the Models_System `fallback_chain[]` snapshot shape; `context_budget_ref?` points to the same snapshot's context-window and max-token fields. Legacy `platform_specs` / `platform_specs.rs` references are not valid capability snapshot refs and may appear only in explicit source-lineage or compatibility notes.

ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/CLI_Bridged_Providers.md
