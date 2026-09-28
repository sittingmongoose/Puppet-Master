# A1-M result: FAIL / INCOMPLETE

One authorized fresh Muse native Goal ran from approved commit `655fa669c71fa9832df479a16efd3b54f425dd08`, with the unchanged pinned driver and acknowledgement receiver. It stopped at the first payload-result batch. No retry, replacement, zcode assignment, evaluator, separate account probe or research campaign followed.

## Failure

All six initial payload Writes were in one native call batch and completed successfully. Their arguments, live bytes and retained pending bytes match their exact prestaged templates: 1,194 UTF-8 bytes each. Muse returned the expected path and byte count **plus a near-duplicate sibling note**. For example:

```text
wrote 1194 bytes to <workspace>/out/submissions/new--batch-01.md; note: near-duplicate sibling new--batch-02.md exists in this directory — verify this new file is intended
```

The frozen reader requires exact equality with the bare `wrote N bytes to <path>` sentence. It therefore raised `native write result path/byte-count mismatch` on the additional text. The paths and counts themselves match. This is an unhandled native result variant, not evidence of incorrect candidate payload bytes. The [six exact result records](checks/failure.json) retain call IDs, source lines, sequences, successful terminal outcomes and hashes. No receiver fix or output repair was applied.

The host stopped the process group with bounded cleanup, reaped the driver with exit `-15`, closed the receiver as cancelled, and preserved six pending payload captures. A later read-only process observation found no matching live Muse serve/A1-M driver. The native driver's final receipt was not written before termination; its final stop/counter fields remain unknown.

| Declared structural check | Observed result |
|---|---|
| One fresh Muse / Contributor Max Goal | One dispatched; observed `muse-spark-1.3-contributor`, effort `max` |
| Six initial payloads in one native batch | Observed: call sequence 175; result batch 248 |
| Six-marker batch and overlapping marker intervals | Not reached; zero marker calls |
| Seven initial findings and two revisions | Six payload attempts; independent record and revisions not reached |
| Nine acknowledgements / eighteen accepted snapshots | 0 / 0; six raw pending payload captures retained |
| Receipt ordering, current lineage, independent findings and history | Not exercised through acceptance |
| Unchanged polls after an acknowledgement | Not reached; eligible idle-poll count 0, not a passed idle test |

The overall result is **failed/incomplete**, not the “no overlap” inconclusive outcome: the receiver fault occurred before markers existed. Zero invalid receipts and zero mutation accusations were emitted, but that does not qualify the acknowledgement or concurrency path.

The [frozen automatic audit](checks/structural-audit.json) also reports failure. Its absent-acknowledgement `KeyError` causes dependent missing-attribute errors; these are not eleven independently demonstrated defects. We preserve that audit unchanged. The separate read-only failure explanation above distinguishes reached behavior from checks that could not run.

## Time and usage

The 390-second persistent check allocation reserved 300 native seconds plus 90 host seconds before staging. Staging used 1.248 seconds of host reserve. The native driver received caps of 300 seconds and 48 parent responses; the check stopped on error well before either cap.

| Measurement | Observed |
|---|---:|
| Staging through assignment, cleanup, freeze and automatic audit | 41.323 s |
| Driver plus receiver attachment/closure | 39.945 s |
| Receiver polls / core poll time | 781 / 0.745 s |
| Projection publications | 19 |
| Completed parent responses captured | 2 |
| Parent physical attempts | 3: two completed tool-call responses, one cancelled |
| Native reminder-child attempts | 2: one completed tool-call response, one cancelled |
| Exposed completed-parent input / output | 45,433 / 3,419 tokens |
| Exposed cache-read / derived uncached input | 20,593 / 24,840 tokens |
| Reported reasoning tokens | 918, not added again to input/output totals |

These token sums cover only the two completed parent responses. Raw MSP and the native journal expose both; `usage-events.jsonl` flushed only the first before cancellation. The final driver response counter is absent. Completed-child tokens, cancelled-parent/child tokens, whole-run tokens and monetary/subscription charges remain **unknown**, not zero. Both observed reminder-child models were Contributor. The driver's existing inline usage reads were retained; no extra account probe ran. See [usage evidence and source pins](checks/usage.json).

The 41.323-second receipt is the execution/freeze clock, not the complete conversational workflow: source inspection, ordinary launch-record/operator construction before that clock, and post-check explanation/publication are separate overhead. GitHub publication was confirmed **398.609 seconds** after the run clock began; its exact earlier finish is unmeasured. Thus completion of the broader workflow including publication within 390 seconds is **not established**. Source inspection and one-use operator/audit construction before the execution clock took 464.246 seconds; first push confirmation was 862.856 seconds after the Codex goal began. These overheads are retained in [PUBLICATION.json](PUBLICATION.json), rather than omitted from the full workflow. No wall-time, token or cost saving is claimed. Astra orchestrated; one explicitly configured Sol/high helper supplied mechanical audit/accounting, not research or formal grading.

## Evidence and disposition

The [exact launch objective](launch-objective.txt), [task](inputs/task.txt), nine [templates](inputs/templates), [launch identities](launch-identities.json), [dispatch](dispatch.json), and one-slot [clock](phase-clock.json) were saved before inference. The one-use [operator](operator/run_a1.py) observes receipt writes without altering frozen source files; its hash and the audit hash are in launch identities. It fails if its stable run root already exists. Published operator copies are evidence, not a new launch authorization.

Raw journals, trace logs, snapshots, partial-input evidence and the original audit remain on the VM at `/home/sittingmongoose/PM-Experiments/external-research-v6-20260926/a1-m-20260928/`. [RAW_EVIDENCE.json](RAW_EVIDENCE.json) binds their paths and hashes. The original native tracing file was copied byte-for-byte into this run after closure, with its original source hash preserved.

All approved receiver/driver pins still match. All 464 files in the prior preservation manifest remain unchanged. I2 stays closed; its two original zcode assignments remain **unstarted**. V-FOLLOWON-1 stays OPEN. R1b Block 2, canonical/governance changes and WorkNodes remain untouched. This one check is closed; no further live work is authorized. The demonstrated annotated-result boundary is the remaining issue for a separate decision.
