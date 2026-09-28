I2 results review — repair the acknowledgement boundary, not the research strategy
Decision
Accept I2 as correctly stopped for a harness failure. Do not resume its remaining slots, repair its frozen outputs, or infer a research-quality result.
Reviewed publication: 8418b01038c083eaf00537192fb86b3e2bdac99a, repository sittingmongoose/Puppet-Master, report root reports/external-research-v6-20260926/i2/.
The next work should be one bounded offline repair of submission readiness, with a closely related reduction in idle publication work. No new candidate, evaluator, smoke, account-probe or replacement assignment is authorized by this review. Keep V-FOLLOWON-1 open and out of scope.
This is review evidence and a continuation brief, not a replacement execution packet or a production patch.
Evidence and review limits
Read the published RESULTS.md, POST_AUDIT_DISPOSITION.json, checks/marker-order.md, the first two detailed marker traces in checks/marker-order.json, operator/run_original.py, the maintained arm's receipt, and the pinned Store implementation. The corresponding local Store and four fixture/dependency files came from the previously supplied I2 review archive. Their hashes match the published preparation pins; the current marker audit names the same Store hash.
Eight independent synthetic characterization tests ran against that unchanged code. These deliberately reproduce bad behavior as well as checking successful completed writes and true mutation detection. Their passing assertions mean the behavior was reproduced, not that the defect is fixed. No model or native Goal was called. No live VM filesystem, raw provider trace, source corpus, evaluator key or research truth was independently assessed here. The full previous 58-test suite was not rerun in this review.
The report's native-event evidence supports premature host capture. Event times and filesystem mtimes are not syscall tracing, and the absence of a logged second write does not independently exclude every possible external writer. Do not upgrade that evidence into a broader security or durability claim.
1. What happened
The published audit reports one correct seven-byte submit\n native Write for each of six affected marker paths, with no subsequent candidate Write/Edit to those paths. Their empty snapshots were captured during each operation, 58.092–267.470 ms before its native terminal event. All six marker calls belong to one recorded batch. Later corrections used fresh revision paths.
The frozen Store treats a newly visible path as an acknowledged submission immediately. It snapshots the marker, assigns an attempt/identity, checks the marker bytes, and returns an INVALID receipt. On a later poll, the same marker's completed contents differ from the premature snapshot, so the Store records a persistent mutation error.
The resulting sequence is:
1. A native Write begins; an empty destination file becomes visible.
2. The watcher mistakes visibility for completed submission.
3. It archives the empty bytes and emits an invalid-input receipt.
4. The same native Write completes with correct submit\n bytes.
5. The watcher mistakes completion of that operation for a change to acknowledged input.
6. The model submits fresh corrections, but the prior protocol errors correctly remain latched under the frozen implementation.
I reproduced this exact logical interleaving locally by holding a marker's file handle open across Store.poll(), then finishing the same producer operation. A partial marker prefix produces the same problem. Six overlapping synthetic writes reproduce six premature invalid records and six latched protocol errors. An independent finding remains visible, but even a correct new revision cannot clear the false historical violation.
These are forced filesystem interleavings, not a replay of the native application's private implementation. They show that the published Store has the failure path described by the native audit.
The finding is not that Muse authored six empty markers or rewrote acknowledged paths. The supported diagnosis is that the host acknowledged in-progress writes.
The previous sign-off missed this live-write interleaving. Completed-file fixture tests and the sequential D1 exercise did not establish that concurrent publication was safe. Future closure must test the consumer while the producer is still writing, not only after all files are present.
2. Required invariant and bounded repair
File visibility is discovery, not submission completion.
Prefer the already-exposed native tool-result/lifecycle stream as the readiness signal. Correlate the original session, tool-call identity and exact path; establish successful completion of the payload operation and the corresponding marker operation before committing the submission and acknowledging its bytes. Retain the candidate's payload-before-marker ordering rule. A host-created marker published atomically after those completions can be an implementation detail, but must not be assumed to exist in either native application.
The implementation must use demonstrated native events or another demonstrated positive commit boundary. Do not invent an unavailable app API. If a completion event is not observable live, record that constraint and design an equivalent bounded mechanism before claiming readiness; do not infer completion from elapsed time.
Required behavior:
- A visible empty/partial file whose operation is still in progress is pending, not a malformed completed submission. It does not consume a second acknowledged attempt each time it is polled or generate a false permanent mutation error.
- Native operations and failed/pending attempts remain counted in usage and attempt accounting. Deferring acknowledgement is not hiding work from the denominator.
- A completed malformed marker is genuinely invalid. A failed native Write or missing terminal result remains failed/pending/incomplete with its evidence; it is not silently accepted or forgotten.
- Duplicate notifications do not create duplicate acknowledgements. Events must belong to the right session, operation and path.
- After true acceptance, changes to payload or marker remain detectable violations. Do not clear mutation evidence merely to produce a pass.
- Snapshot completed payload and marker bytes before the receipt. Preserve incomplete raw material separately when a cap, cancellation or failure ends an operation; never present it as successfully committed history.
- A genuine invalid latest revision continues to withhold the affected identity, with no stale fallback. Independent valid findings remain available.
- Batching independent writes remains allowed. Do not force a new model turn or a fully serial workflow per finding to mask the race.
Do not fix this with a 300 ms/one-second sleep, slower polling, file-size stability alone, or an unconditional 'ignore empty markers' rule. Those heuristics do not distinguish a paused writer from a writer that completed with invalid content.
Use the existing native execution and same-Goal receipt mechanism. No new Goal engine, model transport, general transaction service, canonical changes or semantic parser redesign is needed.
3. A concrete, related efficiency opportunity
The maintained receipt records 11,191 Store polls, taking 73.712 seconds inside a 635.693-second complete slot (634.3 native-reported seconds). That time overlaps the native run and must not be added to it.
Every poll() calls publish() even when nothing changes. publish() reconstructs the projection and writes five files: state, current JSON, current Markdown, history JSON and feedback status. It also invokes snapshot checks. A local synthetic record followed by twenty unchanged polls produced 100 write_text calls, with every final byte unchanged.
This identifies repeated host work. It does not establish that 73.7 seconds are fully removable or that removing them yields the same wall-time improvement: polling includes checking and other work, and the activity overlaps model execution.
While repairing readiness, make derived publication conditional on an actual state/diagnostic change. Reuse unchanged projections where safe, and consume native event logs incrementally rather than repeatedly parsing entire traces. Keep required snapshot-before-ack ordering, actual post-acceptance mutation checks, and final frozen-integrity checks. Do not sacrifice detection to reduce an operation counter.
This is a narrow candidate optimization of the same receiver, not another broad performance project. Validate both correctness and no-change write counts before making a latency claim.
4. What the research and timing evidence cannot prove
I2 has no semantic grades. The control's structural pass is not a quality pass, and the maintained arm's twelve latest valid records are not twelve independently supported discoveries. The zcode originals are not run, not failed. The frozen phase is stopped and closed; unused slots are not automatic resume permission.
Descriptive published measurements:
Measure	Muse control	Muse maintained
Native seconds	558.3	634.3
Parent responses	38	36
Source reads / distinct handles	66 / 57	21 / 17
Exposed uncached-input subtraction	255,317	186,241
Reported output tokens	36,414	38,105


The maintained native span is 13.6% longer, while its exposed uncached-input subtraction is 27.1% lower. Those are not a quality-adjusted efficiency result: the run received false feedback and no semantic comparison was performed. Fewer source reads can reflect different coverage or different work, not necessarily efficient equivalent research.
The six correction payloads sum to 33,651 bytes, approximately 35.0% of the maintained run's 96,128 attempted Write bytes. This establishes meaningful re-authoring after the false receipts. It is not a measured token charge, a proof that every correction word is redundant, or a guaranteed 35% saving after repair.
Two complete slots total 1,195.263 seconds. Published phase time through result-bundle freeze is 2,131.762 seconds; the user's broader phase-plus-publication number is approximately 36m56s. Keep those accounting boundaries separate. The difference includes intervening staging, tracing, reporting and other overhead; it is not all automatically recurring production coordination.
All 50 visible child attempts remain counted, with unknown token usage. No hidden-token zero, subscription-debit estimate, whole-pipeline speedup or cost claim should be inferred.
5. Closure tests that are actually relevant
Use barrier-controlled or deterministically scheduled producer/consumer tests, not arbitrary timing sleeps. Cover the real event-reader/receiver connection where available, with native inference stubbed.
- Payload completed, marker created empty, several polls, marker finishes, matching native success arrives: one correct acknowledgement, no false invalid/mutation.
- Partial marker prefix and delayed completion, including a delay longer than any proposed debounce: still pending until the positive boundary.
- A batch of at least the observed six affected writes, interleaved with independent completed submissions, plus multiple revisions: correct identity, complete history, no duplicate acknowledgements.
- Completed empty/wrong marker, native write failure, missing completion, cancellation and cap: explicit failure/incompleteness, retained evidence, no infinite polling or silent disappearance.
- Delayed/duplicate/wrong-session/wrong-path completion notifications: no accidental commit or double counting.
- Genuine mutation after acceptance and invalid latest revision: still detected and still no stale fallback.
- Repeated idle polls after settled state: no unnecessary current/history rewrites, without disabling final integrity or real mutation checks.
A saved source-fact answer key is unnecessary for every test above. Source payloads can be artificial and bounded.
6. Next execution decision
The immediate development assignment should end with an offline patch, relevant replay/interleaving results, pins, and a compact launch proposal. Keep Astra xhigh orchestration and Sol high/medium development helpers. No candidate or formal-evaluator calls follow from this review.
Do not use another full research comparison as the integration test for a file-acknowledgement repair. Once separately authorized, the smallest useful live check is a short batched/concurrent submission exercise through the repaired native path, not another one-at-a-time D1 replay. Start with the observed Muse path; require a separate zcode check only where changed or previously unproved app-specific integration warrants it. Declare the exact scope and cap before any live check.
After that, a new research trial can test the maintained approach. Do not resume the stopped I2 phase or silently reuse its control as a contemporaneous pair after changing the receiver. Historical control results can remain contextual evidence, not a hidden matched-control substitute.
Keep all scores, originals, protocol errors, snapshots, receipts and usage unchanged. No Opus semantic diagnosis of this structurally failed pair is needed to establish the race. V-FOLLOWON-1, R1b Block 2, canon, governance and WorkNodes remain outside scope.
Source map
All repository sources are pinned at 8418b01038c083eaf00537192fb86b3e2bdac99a:
- reports/external-research-v6-20260926/i2/RESULTS.md — full outcome, accounting and limits.
- reports/external-research-v6-20260926/i2/checks/marker-order.md and .json — six marker operations and snapshot timing.
- reports/external-research-v6-20260926/i2/runs/I2-M-maintained/arm-receipt.json — poll counts, elapsed time, attempted records and per-file bytes.
- reports/external-research-v6-20260926/i2/operator/run_original.py — 50 ms watcher loop and terminal handling.
- reports/external-research-v6-20260926/delivery-v2/tools/delivery_store.py — immediate admission of visible markers and repeated publication.
- reports/external-research-v6-20260926/i2/POST_AUDIT_DISPOSITION.json — effective stopped status and untouched original receipts.
Local companion files: probe_watcher_boundary.py, watcher_probe_results.json, watcher_probe_log.txt, recomputed_metrics.json, and SOURCE_IDENTITIES.json. No repaired implementation is included.