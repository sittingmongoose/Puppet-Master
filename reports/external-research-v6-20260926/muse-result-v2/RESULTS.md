# Muse result v2: offline repair complete

A1-M remains **FAIL / INCOMPLETE** at reviewed commit `f250bb8acd0ccf882d47813ed811195285bfd90c`. This successor changes only Muse Write-result interpretation, missing-prerequisite audit reporting, and parameterization of the existing operator for a separately authorized future check. No provider, native Goal, candidate, evaluator, account or smoke call ran during this work. No live qualification or semantic grade is claimed.

## Repair and preserved boundaries

[The successor reader](tools/native_completion.py) imports the hash-pinned frozen reader and reuses its event ingestion, session/run/call/task/effect correlation, successful terminal boundary, incremental reads and identity checks. It recognizes two complete result forms: the exact `wrote N bytes to <bound absolute path>` sentence, and that sentence followed by the evidenced `; note: near-duplicate sibling <simple basename> exists in this directory — verify this new file is intended` annotation. The entire result record and delimiter-plus-advisory remain verbatim in operation data and completion proofs.

The match consumes the whole string. A path-prefix lookalike, wrong count or different recognized path blocks completion. Arbitrary suffixes, different annotations and unknown result-envelope fields remain visibly **unrecognized** and cannot acknowledge. The basename slot deliberately accepts only ASCII letters/digits followed by letters/digits/dot/underscore/hyphen; other unobserved spellings remain unrecognized. Failed terminals and conflicting results cannot be overruled by success-shaped text. No fields are invented for the provider and no template was changed to avoid annotations.

The existing Store and host receiver are unchanged. Payload-before-marker ordering, native-argument/live/snapshot hashes, snapshots before receipts, independent findings, current/history separation, invalid-latest withholding, pending evidence, mutation detection, cancellation and idle-publication behavior remain covered by the inherited tests. A failed or unknown operation remains a failure/incomplete boundary; this patch grants no correction slot.

## Evidence

| Evidence kind | Result | Limits |
|---|---|---|
| Read-only stopped A1-M journal | Six completed annotated payload proofs; all six live hashes equal their native argument hashes; **zero markers and zero acknowledgements** | No Store attached to the original workspace; no missing operation synthesized |
| Prior stopped I2 maintained journal | 36 completed plain Write proofs | Compatibility replay only; no I2 grade, repair or rescore |
| Reader → unchanged Store/receiver regressions | **53/53 methods pass**: 36 inherited interleaving tests plus 17 result-boundary tests | Synthetic native-shaped envelopes; payload and marker advisory cases are isolated development fixtures |
| Audit regressions | **8/8 pass** | Includes zero/partial/malformed/missing evidence and fully populated synthetic plain/annotated nine-record cases |
| Operator guards/import route | **6/6 pass** | Negative launch guards and real module binding only; subprocess dispatch forbidden |

See [replay summary](evidence/replay-summary.json), [regression evidence](evidence/native-results-regressions.md), [test receipt](evidence/native-results-regression-receipt.json) and [validation/preservation receipt](VALIDATION.json). The 67 methods are development tests, not 66 native trials. Raw journals, full proof replay and synthetic captures stay on the VM with path/hash references. No keys or research answers were fetched for these tests.

The new [audit](tools/audit_check.py) inherits the frozen grading methods and adds prerequisite checks. A derived, read-only invocation on closed A1-M still reports failure and retains its original protocol/native root fault. Dependent checks say `not_reached` or `unavailable` instead of cascading missing-attribute errors. [This derived diagnostic](evidence/derived-a1-audit.json) is reporting regression evidence, not a replacement audit or rescore. The frozen audit remains unchanged.

[ERRATUM.md](ERRATUM.md) corrects the relative expected-prefix field in the old failure explanation without editing it. The reader actually bound an absolute path; all six headers match that absolute path and count, while their full strings differ from the bare sentence.

## Reuse, timing and limitations

[run_check.py](tools/run_check.py) is a parameterized successor of the existing A1 operator, with its [bounded diff](evidence/operator-reuse.patch) retained. It uses the unchanged driver and host receiver with the successor reader selected by the existing import route. It reuses the exact A1 task/templates and refuses a used run root, missing authorization reference, stale/future clock or source drift. An authorization-reference string is an audit trail, **not** permission: actual new user authorization is still required.

The future clock contract in [NEXT_CHECK.md](NEXT_CHECK.md) includes all work from the newly observed Go through confirmed publication within the same 390 seconds. Native caps remain 300 seconds / 48 parent responses; staging, cleanup, audit and publication consume the 90-second host reserve. This patch does not establish that the future workflow will fit. The operator records execution termination separately and leaves whole-check publication status pending until host confirmation. Existing audit-timeout/cleanup-failure exceptional paths may leave only partial operator evidence; they require explicit incomplete reporting, never a pass or replacement.

A1's 41.323-second execution/freeze/audit interval and 398.609-second publication-confirmation interval remain distinct. Its earlier 464.246 seconds of pre-execution orchestration and 862.856 seconds from goal start to first push confirmation remain preserved in [the original publication record](../a1-m/PUBLICATION.json). Broader A1 completion within 390 seconds remains **not established**. No wall-time, usage, token or cost saving is inferred from replay or tests. This work incurred development orchestration/helper usage only; billing totals were not measured and are not zero-valued candidate counters.

The single newer-work check found local and remote at the reviewed result commit with no pre-existing edits. All 535 pinned original files remain byte-identical. The original closed runs and failures are preserved. I2 remains closed, both zcode originals remain **unstarted**, V-FOLLOWON-1 remains **OPEN**, and R1b Block 2 stays unauthorized. No canon, governance or WorkNodes changed. Ready for a separate one-slot Muse decision; no live work is authorized by this bundle.
