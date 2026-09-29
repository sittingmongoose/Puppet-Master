# Four-submission Muse check — offline preparation

**OFFLINE PREPARED; no live launch authorized or performed.** This prospective packet reduces the existing A1 task to two initial records and two target revisions. It does not rescore A1/A2 or combine their partial results into a nine-submission pass.

Base: `8eb170986053619e348e13c2ca4e259c81e418ea`, branch `research/external-research-v6-20260927`. One bounded local/remote/lab check found that same published head and no newer successor work. Earlier files are preserved; hashes and test receipts are in [VALIDATION.json](VALIDATION.json). All changed code is experiment-owned. Astra owns integration; explicitly configured Sol medium adapted operator/accounting and Sol high wrote bounded offline tests. Those are development activities, not candidate research or formal grading.

## Narrow adaptation

[Task](inputs/task.txt), [input manifest](input-manifest.json), [operator](tools/run_check.py), [audit](tools/audit_check.py), [accounting](tools/report_check.py), and [next-check invocation](NEXT_CHECK.md) are frozen together by [SOURCE_PINS.json](SOURCE_PINS.json). All four full templates are byte-identical to A1: `01.md`, `07.md`, `revision-1.md`, `revision-2.md`. No finding shortening or annotation suppression. The receiver, native result reader, protocol, driver, native Goal, Muse model/Max effort, native retry behavior and transport remain unchanged and pinned.

The audit requires exactly four valid receipts and eight matching snapshots, exact native identities/order, payload completion before marker calls, snapshots/state before receipts, both initial receipts before revision 1, revision 1's receipt before revision 2, then revision 2's receipt before final status. The actual returned target identity controls both revision names. Current contains only target revision 3 and the unchanged independent revision 1; history retains all four attempts. A positive native Goal completion is required. Missing/wrong/invalid revisions, extra attempts, pending/protocol failures, stale current/history, incomplete receipt reads or a cap cannot pass merely because some received records are valid.

Initial two-payload/two-marker batching is prescribed and recorded; batching and overlap are **observations, not the former six-marker qualification gate**. No overlap alone does not fail this reduced check. The separate required ordering and identity checks still apply.

The compact accounting path now exists before Go. It records reported completed-parent tokens with component coverage, preserves unknown child/cancelled/total usage, counts observed native internal retries, and separates execution terminal, first confirmed result publication and later confirmation-record publication. Host redispatch is forbidden. Internal waits remain inside elapsed time; no clock subtraction or predicted no-error score.

## Evidence and limits

Focused inference-stubbed tests exercise the four-input count/order boundary, dynamic F0002 target allocation, plain/annotated results, non-overlap, missing/wrong revisions, wrong revision bytes, invalid/extra attempts, missing/premature receipt reads, corruption, packet drift and capped/incomplete Goals. Existing refusal guards and selected receiver/result regressions are reused. Accounting tests cover unknown counters, closed partial output, retry interval extraction and publication boundaries. Exact commands/counts/results and VM trace hashes are in [VALIDATION.json](VALIDATION.json) and [evidence](evidence).

Synthetic frames and host logtimes are fabricated development fixtures; they demonstrate deterministic host/audit behavior, not actual native scheduling, service latency, reliability or semantic research quality. Reused A2 retry bytes are read only for accounting regression; the recorded A2 grade is unchanged. No keys, research answers, evaluator calls, probes or new native sessions were used. No public test claims access to private logs: the A2 accounting test skips if that VM-only journal is absent.

Accept the existing latency diagnosis: three completed 503 waits total **180.023499 s**, with a fourth cancelled after **13.905108 s**, inside the original clocks. No host redispatch/replacement occurred; native retries did. Backend cause/throttling and unreported token totals remain unknown.

Checkpoint: ready for a **separate run decision**, under the fixed caps in NEXT_CHECK. A1/A2 remain FAIL/INCOMPLETE. I2 remains closed, both zcode originals unstarted. R1b Block 2 remains unauthorized; V-FOLLOWON-1 remains OPEN. Marker removal remains deferred. No canon, governance or WorkNode changes.
