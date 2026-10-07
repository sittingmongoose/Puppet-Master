# Passive native receipt exporter

Run once with a finite list (1–12 exact stages):

```sh
python3 helpers/passive-receipts/export.py \
  --stage I-ANCHOR-MUSE/treatment/research-v1 \
  --stage I-ANCHOR-GLM/control/research-v2 \
  --stage I-ANCHOR-GLM/treatment/research-v2
```

Run from the ER10 runtime root. Standard library only. Writes content-addressed stage observations below this helper and the single authorized `state/passive-receipts-index-v1.json`. Existing snapshots remain immutable; the index describes the latest invocation. There are no polls, timers, watchers, RPCs, provider launches, Goal mutations, or account/config reads. Root remains responsible for prospective admission and publication.

Authority is exact IDs from root checkpoint and the explicitly named campaign-owned supervisor/dispatch JSON/JSONL files, recursively including nested parent records. Each requested jobs stage must have its dispatch ID in that authority or an exact-directory supervisor dispatch. No ID is guessed from a request name/task completion. Queries filter by that exact thread; parent lineage is reported but not traversed. Additional supervisor filenames require an explicit code extension, not a filesystem crawl. Other campaign stages are not queried by an invocation.

Sources: read-only SQLite transactions (`mode=ro`, `query_only`) for T3 projections; exact Muse session selected from native binding, with a streaming goal-only extraction and selected goals.db columns; GLM paths nominated by campaign-owned snapshots and rechecked against the exact objective assignment. GLM observation does not walk unrelated driver directories. Each native observation retains path/type/version/record ID/call ID/time/hash where exposed; unavailable IDs/times are null. SQLite hashes name observed record bodies, not whole live DBs. Muse native timestamps are milliseconds, log times microseconds, Codex Goal timestamps seconds; T3 metadata uses ISO timestamps. Original scalar states and counters are preserved, selected text is replaced by SHA-256, and the unredacted response is identified by its hash, never copied wholesale.

Boundaries: 16 MiB per source file/log, 512 native activity rows, 12 provider bindings, 12 stages. Overflow stops or records a bounded limitation. Current route limitations: Codex native tool bodies are absent from its T3 activity projection here; its available Goal projection is recorded as state, not a get/create response. Muse completed research-v1 has actual create, active get, completion update and complete native DB state, but no actual post-terminal get captured. GLM's installed integration driver is distinct from vendor backend target; aliases are retained and mapping remains unknown. No provider usage/cached/generated/billing fields occur in the selected native observations. Native cumulative Goal tokens/context occupancy remain separate counters; no sums or price estimates. File-access extraction is unsupported here, so scope audit is incomplete_unknown.

Qualification uses the already completed Muse stage, Luna's current terminal projection, and both exact current GLM v2 snapshots. No new Goal/test candidate or API probe was run. Hash/source/type/redaction/scope checks are saved in `qualification.json`; they are engineering checks only. See `PROSPECTIVE_CARRIER_V2.md` for the prospective contract.
