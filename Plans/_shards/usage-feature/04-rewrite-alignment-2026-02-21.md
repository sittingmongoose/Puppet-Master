## Rewrite alignment (2026-02-21)

The rewrite described in `Plans/rewrite-tie-in-memo.md` reinforces this plan's intent: Usage should be implemented as **projections/rollups** over the canonical event ledger (seglog), with durable KV state in redb and fast search in Tantivy--without changing the UX requirements in this document. 5h/7d and dashboard numbers are served from **redb rollups** produced by **analytics scan jobs** that aggregate over the seglog (and any JSONL mirror); the Usage view reads these rollups rather than scanning the ledger on demand.

**ELI5/Expert copy alignment:** Authored usage tooltip/help text in this plan (for example context-circle hover copy and explanatory hints) must provide both Expert and ELI5 variants and follow the authoritative checklist in `Plans/FinalGUISpec.md` §7.4.0.

