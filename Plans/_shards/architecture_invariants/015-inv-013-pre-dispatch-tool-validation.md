# Shard 015: INV-013 -- Pre-dispatch tool validation

Source: `Plans/Architecture_Invariants.md`

Source lines: L154-L163

Source SHA256: `6ce7f74c2d708b8bdc9358c3f7e41354630e681db5985087d30bd42654a39c7b`

---

## INV-013 -- Pre-dispatch tool validation


`policy.may_execute_tool()` MUST be called for every tool dispatch at every nesting depth regardless of invocation path. No child-run, plugin path, provider surface, or shell bridge may bypass this invariant.

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Tools.md

Enforcement may be static (import-graph / compile-time gate) or runtime (central dispatch gate), but direct calls to tool implementations without this permission gate are prohibited.

ContractRef: Invariant:INV-013, ContractName:Plans/Architecture_Invariants.md
