# Shard 008: Package and Seam Completion Gates

Source: `Plans/human-in-the-loop.md`

Source lines: L157-L167

Source SHA256: `547b28001f8297b26cbd57823d00c6037b7066f68f51a032662200e08904801c`

---

## Package and Seam Completion Gates

The node-model rewrite uses package- and seam-scoped gates while preserving the same human approval affordances.

Canonical gate types:
- `package_complete_gate` — fires when all nodes in a package have completed. Conditions: all node statuses are in `{completed, skipped}`. Actions: run package-level verification and emit the canonical gate events from `Plans/Contracts_V0.md` with `gate_id = package_complete_gate`.
- `seam_complete_gate` — fires when a seam transition is needed. Conditions: the source package is completed and the target package prerequisites are met. Actions: validate cross-package contracts, transfer context, and emit the canonical gate events from `Plans/Contracts_V0.md` with `gate_id = seam_complete_gate`.

HITL approval behavior stays intact, but it now binds to these gate types. When HITL is enabled, the existing approve / decline / skip / abort flow applies after `package_complete_gate` or `seam_complete_gate` reaches its decision point.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Orchestrator_Page.md
