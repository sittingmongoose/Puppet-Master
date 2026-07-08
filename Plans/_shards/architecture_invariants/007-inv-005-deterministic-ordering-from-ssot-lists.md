# Shard 007: INV-005 -- Deterministic ordering from SSOT lists

Source: `Plans/Architecture_Invariants.md`

Source lines: L111-L120

Source SHA256: `13ae96c59ca1c16416a77b1d9bac8c759d67536df3d0c4f1e332ad5763e83785`

---

## INV-005 -- Deterministic ordering from SSOT lists


**Rule:** When multiple candidates exist (paths, names, servers, etc.), tie-break ordering MUST come from a single SSOT list owned by the relevant domain; no heuristic reordering.

ContractRef: Primitive:Provider, ContractName:Plans/CLI_Bridged_Providers.md

---

<a id="INV-006"></a>
