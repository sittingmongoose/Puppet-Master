# Shard 050: DL-042 — Historical TODO Event Migration Consumer Boundary (2026-09-11)

Source: `Plans/Contracts_V0.md`

Source lines: L26798-L26802

Source SHA256: `0f4e6f9388023f4dffbf39e1b33e274c159f02a09665561d1dc1d54989d53d7e`

---

## DL-042 — Historical TODO Event Migration Consumer Boundary (2026-09-11)

Contracts retains the shared EventRecord envelope and historical six-field payload shape reference for `chat.plan_todo_updated`; the proposed static schema is not append authority or proof of every historical writer shape. TDR-012 in `Plans/ToDo_Runtime.md` owns the complete approved mapping, compatibility semantics and admission gaps. No automatic alias or new legacy append is authorized.

ContractRef: ContractName:Plans/ToDo_Runtime.md, ContractName:Plans/Decision_Log.md
