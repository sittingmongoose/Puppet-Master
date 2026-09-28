# I2 — stopped for a delivery harness failure

TEST_ONLY_NEVER_PROMOTE. **I2 stopped after its two Muse originals. No semantic evaluation ran, and no research-quality or savings conclusion is available.** The maintained arm's watcher acknowledged six transient empty marker files while their single correct native Writes were still running. Its frozen structural gate therefore failed. The existing harness-stop rule leaves both zcode originals unstarted; there are no replacements or retries.

Execution used reviewed commit `f4e9d5855ee5ca5b84b2166dca27db12cd209634` and [I2 FREEZE.json](../i2-prep/FREEZE.json), SHA-256 `994cc7974acd438fc3b74b06197ee0de9007a252db6c432cc63e17c4424e17e4`. The user's explicit “Go” authorized four original investigators and conditionally up to two paired evaluations. [Technical sign-off](TECHNICAL_SIGNOFF.md) was technical review only; the frozen preparation's historical unauthorized wording was not edited into approval. All 16 preparation files, 24 reused files, three runtime-pinned files and 129 corpus files matched their pins. Both staged inputs remained unchanged.

## Original slots and admission

| Original, in declared order | Native result | Parent responses | Native seconds / complete slot seconds | Structural delivery | Evaluation |
|---|---|---:|---:|---|---|
| I2-M-control | goal_complete | 38 | 558.3 / 559.571 | Complete; exact current draft copy | EVAL-001 skipped: paired arm failed |
| I2-M-maintained | goal_complete | 36 | 634.3 / 635.693 | INCOMPLETE; six persistent marker-mutation errors | EVAL-001 ineligible |
| I2-Z-maintained | NOT RUN | — | — | Unassessed | EVAL-002 not admitted |
| I2-Z-control | NOT RUN | — | — | Unassessed | EVAL-002 not admitted |

Both Muse originals requested and observed `muse-spark-1.3-contributor` with `max`, through the unchanged native Goal driver. zcode / GLM 5.3 Flash Max remained the assigned model but was never launched or observed in I2. No extra smoke, probe, repair Goal, singleton review or raw-output semantic diagnosis ran. All four originals remain in the schedule accounting: two executed, two unstarted after the stop. Original native and host terminal receipts still say what they originally recorded; the separate [post-audit disposition](POST_AUDIT_DISPOSITION.json) records the later harness-stop finding without rewriting them.

Caps remained 1800 seconds/160 parent responses per candidate, 2700 seconds/160 responses per eligible evaluator, and 14400 seconds for the phase. Each dispatched original had room for its whole slot plus 300 seconds of host reserve. No cap was transferred. The maintained carrier retained its declared 64 acknowledged attempts/32768 bytes per payload, and both arms retained the 128-file/8-MiB inventory bound. No output was clipped to fit.

## The observed failure

The maintained arm made 12 initial submissions and six subsequent revisions: **18/64 acknowledged attempts**, including all six invalid initial attempts. There were no unbound attempts, unacknowledged surviving paths, overflows or missing snapshots. All 12 latest records eventually parsed as `VALID_UNVERIFIED`. The final inventory passed (36 authored files, 96,128 bytes), and C2 passed exact current JSON/Markdown, history and snapshot-lineage checks. Its `structurally_complete` result remained false because the frozen Store correctly retained its already-recorded protocol errors.

The errors originated at the host acknowledgement boundary. For each of six original request paths, the native log records one `write_file` with exactly seven bytes, `submit\n`, and a completed result. There is no later candidate Write/Edit to those same paths. The empty marker snapshots were captured between each Write's start and completion, 58–267 ms before its terminal event; the final marker modification followed its snapshot by 16–231 ms. The six repairs used new revision paths. These are logged event times and filesystem mtimes, not syscall tracing; hidden external writes are not independently excluded. See the [native-order evidence](checks/marker-order.md) and [machine-readable trace](checks/marker-order.json).

Thus the observed transition from empty to seven-byte marker was inside one native Write, not a candidate-authored empty submission followed by an overwrite. Filesystem existence was treated as completion too early. The watcher and its permanent mutation checks then made an otherwise correctly revised carrier ineligible. The original six empty snapshots, later marker bytes, all rejected attempts, revisions, current render and errors remain preserved. No host or premium model repaired the answer or cleared those errors.

This is new I2 runtime evidence about the delivery interface. D1's closed 15/15 and 14/15 results and I1's closed failures were not rescored, rerun or edited. The prospective current/history criterion was not relaxed.

## Separate measures

**Acquisition quality: UNASSESSED.** No pair passed the frozen admission gate, so no independent Opus semantic call was made. Source-read counts and the maintained arm's 12 latest records do not establish supported acquisition. Eligible reference misses, novel findings, false claims and partial leads have no formal I2 grades.

**Temporal semantic preservation: UNASSESSED.** The control saved observations, history and two snapshots. The maintained carrier retained 18 payload/marker snapshot pairs, including six empty marker snapshots, plus current/history projections and attempted revisions. Those are available evidence, not a source-supported semantic denominator. No numerator, loss rate, correction judgment or chronology reconstruction is fabricated from final prose. C2's structural lineage result is not semantic preservation.

**Structural delivery:** control passed retained inventory and exact final-copy checks. Maintained failed completeness despite faithful current/history rendering and 12 valid latest records. Its six corrected invalid attempts remain in the record and denominator. No stale fallback or missing snapshot was detected by C2; general source applicability and condition preservation remain unassessed.

**Time/usage:** [USAGE.json](USAGE.json) contains actual native/host times, requested versus observed settings, parent counters, visible child attempts, tool/write/read measures and raw-source hashes. The two complete slot spans total **1195.263 seconds**; their native Goal times total **1192.6 seconds**. The persisted phase consumed **2131.762 seconds (35m 31.8s)** through terminal result-bundle freeze, including intervening staging, waiting, evidence tracing and reporting overhead; [PHASE_STATE.json](PHASE_STATE.json) records the clock. Subsequent Git publication is separate from this frozen execution measurement. Prelaunch identity/account checks occurred before the phase, as authorized, and were not given an invented full duration. [Token coverage](checks/token-coverage.json) confirms all six reported fields exist in every parent event and their sums match the original receipts. Store polling consumed 73.712 elapsed host seconds inside the maintained slot, plus 0.038 seconds to close; it overlaps native wall time and must not be added again. Feedback wait duration is not independently recoverable from these counters.

| Exposed candidate measure | Muse control | Muse maintained |
|---|---:|---:|
| Parent input tokens, cumulative | 6,532,778 | 5,204,724 |
| Cache-read tokens | 6,277,461 | 5,018,483 |
| Uncached input by exposed subtraction | 255,317 | 186,241 |
| Output tokens | 36,414 | 38,105 |
| Reasoning tokens reported separately | 5,256 | 7,741 |
| Visible reminder-child terminal attempts | 29 | 21 |
| Source Read calls / distinct source handles | 66 / 57 | 21 / 17 |
| Native tool calls | 99 | 101 |
| Returned tool text bytes retained in session log | 626,474 | 376,956 |
| Write / Edit calls | 5 / 4 | 36 / 0 |
| Attempted Write bytes / replacement-text bytes | 58,987 / 31,799 | 96,128 / 0 |
| Retained model-authored output files / bytes | 5 / 89,965 | 36 / 96,128 |

All 50 visible reminder-child attempts used the same Muse Contributor model; their tokens are unknown. Cumulative cached input is neither unique context nor subscription debit. The generic result schema lacks explicit success/error flags, so those original meter fields remain unknown. A separate [native outcome audit](checks/native-write-outcomes.json) correlates call/effect/task IDs: all 9 control Write/Edit calls and all 36 maintained Writes completed, with 0 recorded failures and 0 unmatched outcomes. This is native task completion, not Store acceptance or atomic filesystem publication. The maintained Goal made 19 explicit feedback Reads; the control made none. Actual cumulative successful bytes and filesystem overwrite volume remain unknown. Repeated path calls in control are four; repeated Write/Edit paths in maintained are zero. Returned-text byte counts exclude spill artifacts and do not prove provider-input coverage. Fewer source reads do not establish savings, especially with no semantic comparison and an incomplete treatment.

Launch-time Claude `/usage` reported 18% session and 89% weekly use, credits off, with zero API time/tokens/cost for that check. Muse's standalone usage read returned no numeric data; each completed candidate's later account readout reported 0% window/weekly. These are account snapshots, not per-slot costs. zcode has no exposed headroom readout. Codex/Astra and explicitly configured Sol high/medium development work are separate from candidates; their usage is not exposed by these native logs and is reported unknown. Formal evaluator calls/tokens: **0/0**.

## Evaluator chronology and checkpoint

No evaluator workspace was staged, no schedule was admitted, and no live composed message was dispatched. Evaluator first-view/deferred ordering and contamination are therefore **not applicable**, rather than a successful chronology test. The ready operator binding uses the frozen composed-message dispatcher; that paid path was not exercised by I2. Its separate chronology utility passed 11 synthetic metadata cases, which are development evidence only. Candidate tool auditing found no shell/web calls or paths outside each workspace, including resolution of relative paths; this is an audit of exposed tools, not OS isolation. No helper answers entered either candidate.

The one stable VM root is `~/PM-Experiments/external-research-v6-20260926/i2-20260928/`. Its phase is durably stopped and closed, with unused slots unavailable for automatic resumption. Raw logs, full corpus, evaluator keys and raw snapshots remain VM-only; the per-arm `EVIDENCE.json` files list exact paths, sizes and hashes. Published current reports are exact copies, not repaired or graded answers. All experiment source/prompt pins remain unchanged. Operator snapshots are review evidence for this run, not a new execution framework or approval loader.

The next concrete issue is the acknowledgement boundary: a future offline repair must establish native Write completion before accepting a marker, and prove that transient file creation cannot consume an attempt or create a permanent false mutation. That work and any new native qualification/research run require their own scope decision; I2 receives no repair, retry or rescue grade. **V-FOLLOWON-1 remains OPEN. R1b Block 2, canon, governance and WorkNodes remain outside scope.**
