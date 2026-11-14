# Shard 051: DL-042 — Historical TODO Event Migration Consumer Boundary (2026-09-11)

Source: `Plans/storage-plan.md`

Source lines: L19917-L19921

Source SHA256: `da01bb5b8995f081f223c1fed265377a35453f2a97e31e5b739209ed03c31ee9`

---

## DL-042 — Historical TODO Event Migration Consumer Boundary (2026-09-11)

Storage preserves historical `chat.plan_todo_updated` reads under existing access, retention and deletion rules. TDR-012 in `Plans/ToDo_Runtime.md` owns the complete mapping. Storage must establish the complete atomic mutation/projection boundary before execution consumes revised state; incomplete future event admission cannot fall back to legacy appends or partial durable publication.

ContractRef: ContractName:Plans/ToDo_Runtime.md, ContractName:Plans/Decision_Log.md
