# Shard 051: DL-042 — Historical TODO Event Migration Consumer Boundary (2026-09-11)

Source: `Plans/storage-plan.md`

Source lines: L19913-L19917

Source SHA256: `c01ce0709c301e88287c4311a3617accc434f187324ce9cf3fb60d84d6ae9fb9`

---

## DL-042 — Historical TODO Event Migration Consumer Boundary (2026-09-11)

Storage preserves historical `chat.plan_todo_updated` reads under existing access, retention and deletion rules. TDR-012 in `Plans/ToDo_Runtime.md` owns the complete mapping. Storage must establish the complete atomic mutation/projection boundary before execution consumes revised state; incomplete future event admission cannot fall back to legacy appends or partial durable publication.

ContractRef: ContractName:Plans/ToDo_Runtime.md, ContractName:Plans/Decision_Log.md
