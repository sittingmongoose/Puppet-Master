# C12-DR — criterion-12 closure for the 19 runtime-artifact families

Branch `plans/ea-pnc-c12-dr-20261114`, base `origin/main` `80a2a22e1efbe7dfd0e73a1a2794f225dec39c89`; code head `98a662574ba1f61ee593db3e977dd4dd39b4409c`. Full report and raw evidence: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/PNC019/c12-dr/REPORT.md` (pinned by its `SHA256SUMS`).

**All 19 criterion-12 cells: PARTIAL → PASS** (worker self-grade; independent review NOT_RUN). Other cells unchanged; membership ABSENT; native execution NOT_RUN. The DR checker (`scripts/pm-runtime-artifact-event-drafts.py`, sha `fb6b914b…`), its table modules and the gated guard tool (`004bdedd63`) are unchanged. No Plans document, shard, index, registry or governance file changed; no new ids.

## What closes the cell

- **Fresh gated proof:** 785/785 suites PASS, 3,042/3,042 row cells proved, 0 unproved, at most 7 rows per table. Proof fields identical to s4o2's run of the same bytes in all 785 suites.
- **Complete-checker proof of the extracted phases:** every causal witness pair (9,194) runs through the complete checker; its exact declared first refusal is cut alone and restored. 7,468 KILLED, 1,636 COVERED_LATER (a named later row still refuses; no kill credit), 90 excluded with reasons, 0 INVALID. Every proved row has a complete-boundary pair. The H05b binding-only pairs are KILLED in all 19 families.
- **Schema (W3H whole-definition Method B route):** 23,497 reachable keyword sites over 2,236 rule bodies in 12 occurrences per family (payload, EventRecord, AppendReceipt, custody and result, current and historical-v1; checkpoint; read token; packed payload route). 25,035 isolated whole-occurrence clause witnesses, 3,964 local clause witnesses, 0 rule bodies without a validated control, 0 unresolved references; 6,279 INVALID proposals listed apart. At the complete boundary: 6,864 KILLED, 20,280 COVERED_LATER, 0 INVALID.
- **Retained reads (SP-1101):** 1,393 reads with declared outcomes and first rows — accepted, body deleted, withdrawal/authority/validity/Project/family/payload, caller recipe, absent/unknown/ambiguous recipe, foreign Server/owner operation/original, and requested- and sealed-side receipt missing/ambiguous/other-original — 0 store changes, 0 receipts created, 0 appends.
- **Numbers and time:** number self-test 580/580; corpus 2,320 route runs, 0 disagreements; the shared date-time battery and derived single-defect spellings at every DR timestamp field through the complete boundary, 136,546 cases, 0 mismatches; `acknowledged_at_utc` on the EventRecord profile (E5-2).
- **Original suite:** pass, 26,165 assertions, 0 failures.

## Limits

The repository-wide date-time inventory gate is refused at this base (retired snapshot citation, C12-DT tool issue); no broad shared date-time-suite PASS is claimed. Standing trials: 50/50 caught over the four standing families; `S6_compare_Storage_metadata` aborts the DR standing harness (its mutant raises on the 4,400-digit witness, failing closed; tool issue C12-DR-S6).

No file was added under `tests/`; `.gitignore` is unchanged.

## Files

| File | What |
|---|---|
| `scripts/pm_runtime_artifact_c12.py` | Schema graph, directed proposals, isolation, complete-route cut/restore, store snapshots, local controls |
| `scripts/pm-runtime-artifact-c12-closure.py` | Per-family schema, pairs, retained and date-time parts |
| `scripts/pm_runtime_artifact_c12_selftest.py` | Accounting self-test (13 cases) |
| `reports/event-authority-20261114/C12-DR-self-grade.json` | Per-family regrade with criteria and exact quotations |
| `reports/event-authority-20261114/C12-DR-coverage.json` | Compact coverage matrix: every family's rows (gated, KILLED, COVERED_LATER, shared) and schema/retained/date-time summaries |
