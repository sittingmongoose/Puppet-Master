# Shard 043: DL-042 — Historical TODO Event Migration Consumer Boundary (2026-09-11)

Source: `Plans/Tools.md`

Source lines: L12861-L12865

Source SHA256: `e3d73fe4f4cde68957321dfa11bb0111c4d350a1908ae16fc7650ff2d2c454a3`

---

## DL-042 — Historical TODO Event Migration Consumer Boundary (2026-09-11)

Tools retains proposal-only `todowrite` authority and non-mutating `todoread` projection reads under T-179. Permission approval authorizes proposal processing, not direct canonical writes. TDR-012 in `Plans/ToDo_Runtime.md` owns the complete approved historical-read/future-event mapping and its admission gates.

ContractRef: ContractName:Plans/ToDo_Runtime.md, ContractName:Plans/Decision_Log.md
