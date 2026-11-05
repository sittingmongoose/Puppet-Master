# Shard 051: DL-042 — Historical TODO Event Migration Consumer Boundary (2026-09-11)

Source: `Plans/storage-plan.md`

Source lines: L19564-L19568

Source SHA256: `e43cad0f3391b91b4b7ee625296c84afb5abf3bf63949f9bf07d0fbf580f8d44`

---

## DL-042 — Historical TODO Event Migration Consumer Boundary (2026-09-11)

Storage preserves historical `chat.plan_todo_updated` reads under existing access, retention and deletion rules. TDR-012 in `Plans/ToDo_Runtime.md` owns the complete mapping. Storage must establish the complete atomic mutation/projection boundary before execution consumes revised state; incomplete future event admission cannot fall back to legacy appends or partial durable publication.

ContractRef: ContractName:Plans/ToDo_Runtime.md, ContractName:Plans/Decision_Log.md
