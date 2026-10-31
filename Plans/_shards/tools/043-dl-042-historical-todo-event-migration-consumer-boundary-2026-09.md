# Shard 043: DL-042 — Historical TODO Event Migration Consumer Boundary (2026-09-11)

Source: `Plans/Tools.md`

Source lines: L12890-L12894

Source SHA256: `9f8f951e268b5a9642675d8bc16560174ee3265592aa1c7c4d77e345c3e8f504`

---

## DL-042 — Historical TODO Event Migration Consumer Boundary (2026-09-11)

Tools retains proposal-only `todowrite` authority and non-mutating `todoread` projection reads under T-179. Permission approval authorizes proposal processing, not direct canonical writes. TDR-012 in `Plans/ToDo_Runtime.md` owns the complete approved historical-read/future-event mapping and its admission gates.

ContractRef: ContractName:Plans/ToDo_Runtime.md, ContractName:Plans/Decision_Log.md
