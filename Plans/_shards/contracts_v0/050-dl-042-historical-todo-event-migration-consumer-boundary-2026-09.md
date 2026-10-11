# Shard 050: DL-042 — Historical TODO Event Migration Consumer Boundary (2026-09-11)

Source: `Plans/Contracts_V0.md`

Source lines: L21686-L21690

Source SHA256: `8772b2d696177a79dbb77d016a5e3f1d8c1ec0aef2150ce77ee1487022d812e2`

---

## DL-042 — Historical TODO Event Migration Consumer Boundary (2026-09-11)

Contracts retains the shared EventRecord envelope and historical six-field payload shape reference for `chat.plan_todo_updated`; the proposed static schema is not append authority or proof of every historical writer shape. TDR-012 in `Plans/ToDo_Runtime.md` owns the complete approved mapping, compatibility semantics and admission gaps. No automatic alias or new legacy append is authorized.

ContractRef: ContractName:Plans/ToDo_Runtime.md, ContractName:Plans/Decision_Log.md
