# Shard 007: INV-005 -- Deterministic ordering from SSOT lists

Source: `Plans/Architecture_Invariants.md`

Source lines: L78-L87

Source SHA256: `6ce7f74c2d708b8bdc9358c3f7e41354630e681db5985087d30bd42654a39c7b`

---

## INV-005 -- Deterministic ordering from SSOT lists


**Rule:** When multiple candidates exist (paths, names, servers, etc.), tie-break ordering MUST come from a single SSOT list owned by the relevant domain; no heuristic reordering.

ContractRef: Primitive:Provider, ContractName:Plans/CLI_Bridged_Providers.md

---

<a id="INV-006"></a>
