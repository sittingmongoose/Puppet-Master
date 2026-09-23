# Shard 051: DL-042 — Historical TODO Event Migration Consumer Boundary (2026-09-11)

Source: `Plans/storage-plan.md`

Source lines: L19344-L19348

Source SHA256: `fff136533e78d7c5772cb52b0a3d11f4d2b4db0705ce60f5f580b5ef69a8bfaa`

---

## DL-042 — Historical TODO Event Migration Consumer Boundary (2026-09-11)

Storage preserves historical `chat.plan_todo_updated` reads under existing access, retention and deletion rules. TDR-012 in `Plans/ToDo_Runtime.md` owns the complete mapping. Storage must establish the complete atomic mutation/projection boundary before execution consumes revised state; incomplete future event admission cannot fall back to legacy appends or partial durable publication.

ContractRef: ContractName:Plans/ToDo_Runtime.md, ContractName:Plans/Decision_Log.md
