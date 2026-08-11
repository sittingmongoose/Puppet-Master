# Shard 007: INV-005 -- Deterministic ordering from SSOT lists

Source: `Plans/Architecture_Invariants.md`

Source lines: L78-L87

Source SHA256: `a1488a98949bf363a0c763a51dae6dc4db5261708c7828eeca492e65f251c543`

---

## INV-005 -- Deterministic ordering from SSOT lists


**Rule:** When multiple candidates exist (paths, names, servers, etc.), tie-break ordering MUST come from a single SSOT list owned by the relevant domain; no heuristic reordering.

ContractRef: Primitive:Provider, ContractName:Plans/CLI_Bridged_Providers.md

---

<a id="INV-006"></a>
