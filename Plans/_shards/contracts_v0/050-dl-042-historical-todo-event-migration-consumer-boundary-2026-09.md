# Shard 050: DL-042 — Historical TODO Event Migration Consumer Boundary (2026-09-11)

Source: `Plans/Contracts_V0.md`

Source lines: L21532-L21536

Source SHA256: `9753361f6702fae3b897aa0d1791de664b1f4f0cac04959935ca948fe721862d`

---

## DL-042 — Historical TODO Event Migration Consumer Boundary (2026-09-11)

Contracts retains the shared EventRecord envelope and historical six-field payload shape reference for `chat.plan_todo_updated`; the proposed static schema is not append authority or proof of every historical writer shape. TDR-012 in `Plans/ToDo_Runtime.md` owns the complete approved mapping, compatibility semantics and admission gaps. No automatic alias or new legacy append is authorized.

ContractRef: ContractName:Plans/ToDo_Runtime.md, ContractName:Plans/Decision_Log.md
