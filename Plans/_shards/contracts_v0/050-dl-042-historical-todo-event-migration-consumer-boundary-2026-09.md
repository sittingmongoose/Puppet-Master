# Shard 050: DL-042 — Historical TODO Event Migration Consumer Boundary (2026-09-11)

Source: `Plans/Contracts_V0.md`

Source lines: L21761-L21765

Source SHA256: `7347303a5ee0210d1243b890f116058533264778aa679d97ff183863948f39d1`

---

## DL-042 — Historical TODO Event Migration Consumer Boundary (2026-09-11)

Contracts retains the shared EventRecord envelope and historical six-field payload shape reference for `chat.plan_todo_updated`; the proposed static schema is not append authority or proof of every historical writer shape. TDR-012 in `Plans/ToDo_Runtime.md` owns the complete approved mapping, compatibility semantics and admission gaps. No automatic alias or new legacy append is authorized.

ContractRef: ContractName:Plans/ToDo_Runtime.md, ContractName:Plans/Decision_Log.md
