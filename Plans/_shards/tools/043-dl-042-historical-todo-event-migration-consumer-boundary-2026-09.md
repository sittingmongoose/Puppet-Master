# Shard 043: DL-042 — Historical TODO Event Migration Consumer Boundary (2026-09-11)

Source: `Plans/Tools.md`

Source lines: L12877-L12881

Source SHA256: `d16b9cb18b7053ffe1e667aafbb44b7a8b635a960007b796d13117457029972b`

---

## DL-042 — Historical TODO Event Migration Consumer Boundary (2026-09-11)

Tools retains proposal-only `todowrite` authority and non-mutating `todoread` projection reads under T-179. Permission approval authorizes proposal processing, not direct canonical writes. TDR-012 in `Plans/ToDo_Runtime.md` owns the complete approved historical-read/future-event mapping and its admission gates.

ContractRef: ContractName:Plans/ToDo_Runtime.md, ContractName:Plans/Decision_Log.md
