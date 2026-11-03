# Shard 007: INV-005 -- Deterministic ordering from SSOT lists

Source: `Plans/Architecture_Invariants.md`

Source lines: L78-L87

Source SHA256: `480fac0bed813d64ffbc35f54515ef098785f04fd1b0893cdf132bba61a93e2b`

---

## INV-005 -- Deterministic ordering from SSOT lists


**Rule:** When multiple candidates exist (paths, names, servers, etc.), tie-break ordering MUST come from a single SSOT list owned by the relevant domain; no heuristic reordering.

ContractRef: Primitive:Provider, ContractName:Plans/CLI_Bridged_Providers.md

---

<a id="INV-006"></a>
