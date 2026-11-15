# PNC019 s3ao — shared Goal oracle checkpoint

**IN_PROGRESS.** Eleven requested families reach 12/12 at the core checkpoint. `restore_point.deleted` and `run.started` remain 11/12; their complete external/adoption guard closure is unfinished. No native or runtime execution is claimed.

Base: `2f44dc23cdc12ca49c82b43b16bd0310f8e11777`. Core implementation: `9c188cd769759dadd5c2c9b1d1f6f317928468f9`. Branch: `plans/ea-pnc-s3ao-20261114`. Both push URLs hold the core checkpoint. No Plans, governance, gated guard-tool or NUMRULE foundation files changed. No IDs minted from SP/CV/ATS-2100..2149.

| Core check | Result |
|---|---:|
| Complete checker calls | 61,676 |
| Named tables / maximum rows per table | 867 / 1 |
| Gated Method B proved | 862 |
| Unproved, with verified earlier owner-union proofs | 5 |
| Exact expected-refusal mutation kills | 862 |
| Complete checker accepts after a deliberate single-row cut | 845 |
| Deliberately cut checker exceptions | 2, never credited as kills or acceptance |
| Authored expectation failures | 0 |

The remaining 15 cut replays refuse later. The gated result proves predicate observation dispatch, following the existing W3F adapters. The complete checker derives each observed predicate from the full input and supplies its first-refusal witness. This is not JSON-schema keyword occurrence proof; it does not imply every whole-checker cut accepts. Every owner schema keyword is retained. The five unproved rows are nullable branch/receipt edition root declarations: the earlier whole union refuses first, and its own table passes. Their exact owner hashes and proofs are in `PNC019-S3AO-core.json`.

Mutation credit requires the exact expected refusal, source label and input SHA-256. A different refusal, unexpected exception or accepted input is not a kill. The judge's four-case self-test exercises all four outcomes against actual retained reads. Complete checker cut diagnostics are kept separate.

The shared runner accepts repeated `--source MODULE` extensions. A source exposes `main()` and registers complete calls with the collector; ATS-1119 retains its existing `run()` entry point. Future blocked/completed/stopped sources can join without changes to the proof or mutation judge. Default sources are the verified core. Restore and adoption adapters stay explicit until closed.

```sh
python3 scripts/pm_goal_guard_sweep.py --no-fuzz --out /absolute/evidence/core
python3 scripts/pm_goal_guard_sweep.py --generate --prove-generated --no-fuzz --source pm_goal_run_adoption_oracles --out /absolute/evidence/adoption
python3 scripts/pm_goal_guard_sweep.py --judge-self-test --out /absolute/evidence/judge
python3 scripts/pm_goal_frozen_regressions.py --out /absolute/evidence/frozen-regressions
```

Run long checks through `long-job`, with the shared memory cap and foreground waiter. The verified core uses `--no-fuzz`: its authored and explicit schema witnesses already account for every row. Omitting that flag adds optional exploratory search, which earns no credit by itself.

Current integer boundaries call `current_integer` or `storage_uint64`. Producer semantic bytes/digests, qualified JCS and stored bytes use the shared NUMRULE calls. Frozen original schemas keep their original integer grammar; a current write never selects that grammar. The corpus covers a valid 4,400-digit integer without a Python conversion crash, JCS loss within the physical uint64 range and physical overflow after JCS qualification. The illustrative corpus's 0..10 bound is not invented for producer_sequence_id, whose owner has no such ceiling.

Every runtime-schema format assertion uses the shared format checker. Event occurrence and append acknowledgement use the EventRecord profile; EventRecord observed/persisted fields use Storage UTC-Z. Other owner date-time fields retain the EventRecord profile unless their consumed schema identifies the Storage-owned role. Exact chronology supports year 0000, legitimate leap seconds, equivalent offsets and arbitrary fractions; Python microsecond truncation no longer decides scheduling order. The global date-time inventory is not reported as passing: its existing stale exclusions/missing sparse citation containers remain open in the recorded inventory output.

Retained reads choose only an installed recipe from the independently sealed receipt for the exact original. Issuance is TEST_ONLY and separate from reading. Missing, ambiguous, other-original, altered seal/shape/bytes, unknown recipe, foreign Storage, caller override and denied disclosure cases preserve the full store snapshot. No read creates a receipt. The receipt binds recipe resources and original record/result/receipt bytes; later reads also revalidate before disclosure. The thirteen families each run the receipt controls and negatives.

The restore adapter verifies the 93-file frozen manifest, loads its original suite read-only and replays explicit helper mutations. The run adapter loads only pure function definitions from that same pinned source, preserving the adopted full schema graph and SP-278 handoff joins. All 46 index-adoption and six retention authored cases pass; the dedicated run-domain single-copy witnesses and shape witnesses also pass. These results alone do not close criterion 12: the remaining guard rows require actual witnesses or earlier-clause proofs.

All six frozen phase/pending regression programs pass (199 unchanged original checks, 99 phase cases, 58 final boundaries, and pending suites of 30/38/44/42 cases). They run with all attempted artifact writes redirected to lane evidence. Their original catch behavior is preserved, so they earn **regression credit only**, zero guard/mutation credit. Original pins are checked before and after. Their modeled results do not establish native authentication, atomicity, source durability or runtime conformance.

Self-grades: `PNC019-S3AO-grades-core.json`; 601 exact quotes in 32 files pass. Its 11 changed oracle cells cite the result and implementation. The unrelated five successor families retain s3a's grades. A real-input issue in s3a's grade checker accepted an inconsistent `vector`; the checker now verifies it, and the altered-vector witness fails specifically at `goal.created: vector`.

Raw evidence: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/PNC019/s3ao/`. `PNC019-S3AO-core.json` binds the core collection, table summary, mutations and schema inventory by path and SHA-256. Final lane reporting and the remaining two criterion-12 closures are still pending.
