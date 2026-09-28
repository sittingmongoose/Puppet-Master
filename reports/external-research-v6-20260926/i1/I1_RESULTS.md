# I1 results — investigator comparison

## Decision

**No research-quality pass or maintained-record promotion.** The two maintained arms delivered no substantive current report. Muse control delivered useful material but its independent reviewer found preservation losses and unsupported/product-choice assertions. Zcode control delivered a report, but its formal evaluator declined to begin; zcode semantic acquisition and preservation remain ungraded. Nothing was repaired, retried or substituted after these outcomes.

This is a diagnostic result from one familiar fixed-corpus pair per application. It does not establish live-source discovery, carrier-level causal effects, reliability, production latency or whole-project economics. No flash verifier ran, so no end-to-end claim is available.

## Execution and delivery

| Assignment | Native outcome | Parent responses | Native seconds | Current artifact |
|---|---|---:|---:|---|
| Muse control | Goal complete | 38 | 760.3 | [Authored report](runs/I1-M-control/current.md), 25,588 bytes |
| Muse maintained | Goal complete | 45 | 1,122.3 | [Invalid-carrier diagnostic](runs/I1-M-maintained/current.md), 130 bytes |
| zcode maintained | Time cap | 32 | 1,817.1 | [Invalid-carrier diagnostic](runs/I1-Z-maintained/current.md), 130 bytes |
| zcode control | Goal complete | 42 | 1,416.5 | [Authored report](runs/I1-Z-control/current.md), 21,568 bytes |

Muse used `muse-spark-1.3-contributor` and zcode used `GLM-5.3-Flash`; both reported Max. Every arm received the same 129 corpus files and the exact frozen prompt for its carrier. Native Goal drivers and runtime pins were reused unchanged. Candidate calls, including Muse reminder children, stayed on the approved flash model identities.

Muse maintained's final JSON does not parse: `Expecting ',' delimiter: line 1 column 12283 (char 12282)`. Zcode maintained's JSON parses but violates the frozen strict schema with a top-level `snapshots_note`. The host renderer returned 2 for each and emitted only the approved generic current-view diagnostic. Original draft bytes and audit artifacts remain preserved separately. There was no premium cleanup, silent field removal or synthesized report.

Zcode maintained's unchanged polling driver detected the 1,800-second cap at 1,805.0 seconds; the 1,817.1-second receipt includes stop cleanup. Its 32 requests include 31 completed and one interrupted request. Native completion, carrier validity and research quality are separate outcomes.

## Independent evaluation outcomes

| Assignment | Native / host outcome | Responses | Seconds | Formal coverage |
|---|---|---:|---:|---|
| I1-REV-M | Native success / required files present | 38 | 690.1 | Muse pair reviewed, with explicit unassessed scope and protocol limitations |
| I1-REV-Z | Native success / **FAILED_INCOMPLETE** | 1 | 34.7 | No tool calls, no assessment files, no grades |

Both fresh reviewers used `claude-opus-5-5` with `--effort xhigh`. Native initialization confirmed the model and restricted tools, but returned no effective-effort value. **xhigh is requested, not observed.** Sol helpers performed mechanical integrity and chronology checks only; they supplied no substitute semantic grades.

The zcode reviewer saw the unchanged evaluator prompt sentence describing a future separately authorized evaluation and requested confirmation instead of executing. User authorization existed in the operator record, but the frozen reviewer input did not convey a separate execution authorization. Its [terminal response](eval/I1-REV-Z/terminal-response.md) is retained verbatim. No clarification or replacement call was made: the second assignment was already consumed. The launcher's missing-output check correctly dominated the success-shaped native receipt. This is evaluator non-execution, not a zcode candidate grade or a quota failure. A native shared-account `allowed_warning` reported 90% five-hour and 74% weekly use; this was not a hard quota stop and is not attributed solely to I1.

### Muse: delivered findings and preservation

The following are the independent Opus reviewer's judgments, preserved in the [review](eval/I1-REV-M/review.md), [grades](eval/I1-REV-M/grades.json), [fixed assessment](eval/I1-REV-M/final-assessment.json) and [acquisition/preservation record](eval/I1-REV-M/acquisition-and-preservation.json). They are not new Astra/Sol grades.

- **Control delivered reference coverage:** two retained, four narrowed, zero wholly lost/contradicted among the six fully eligible references. The other two whole references were `unassessable_missing_input`, with eligible subsets assessed separately. Missing corpus text was not reconstructed or charged as a full candidate miss.
- **Control preservation:** the reviewer traced 45 saved observation blocks and reported final dispositions of 30 retained, 12 narrowed and 3 lost. It identified `source.image` association in O-010 as acquired and then dropped; several conditions and implications were narrowed during drafting. Exact copying from frozen draft to current report was confirmed mechanically.
- **Control adverse findings:** the reviewer reported six unsupported/overstated assertions, including copied errors, scope removed during drafting and silent product choices. One was warn-and-continue treatment of transforms forbidden by the pinned specification; another adopted a UI default as a constraint. Useful novel findings do not cancel these defects.
- **Maintained acquisition versus delivery:** the reviewer found useful raw material, including more complete label-association substance, but none reached the current report. It reported 15 raw findings as the observable subset and **temporal denominator `not_recoverable`**, because saved snapshots were absent. Native write traces corroborated ordering; unsaved snapshots were not reconstructed. The 0/15 delivery result is a serialization failure with correct host rejection, not proof of a faulty renderer.

The observation counts are the reviewer's inventory dispositions, **not a fully verified supported-acquisition rate**. Its assessed source scope is incomplete, some copied observations contain errors, and it explicitly leaves claims unverified. The acquisition JSON retains intermediate `31/11` fields followed by its own explicit count correction to `30/12`; the review and grades use the corrected counts. These originals have not been edited. Its two recorded maintained-arm corrections include bookkeeping and a source claim it did not independently verify; they are not counted here as two proven substantive corrections. Proposed validations in candidate reports remain unexecuted proposals.

### Review chronology and coverage limits

The same workspace exposed first-view and deferred directories. The gate was prompt-controlled, with no filesystem isolation or mid-run host lock.

The Muse reviewer's first root `Glob('*')` searched the whole readable workspace before saving judgments. The result returned 100 first-view filenames, was truncated, and exposed a total of 145 matches. No deferred filenames or content appeared in that returned listing, but the broad search crossed the prescribed boundary and exposed an aggregate inventory count. **Clean staged independence cannot be claimed.** The reviewer disclosed the broad glob; current-report formats also revealed treatment, and deferred native traces later named the arms.

Both initial-assessment files were successfully written before explicit deferred glob/read operations. No subsequent edits to those fixed files were observed, and terminal hashes match the passive observation. This narrower ordering fact does not erase the early glob. The reviewer also lists unassessed source claims; native completion and five existing output files do not establish an exhaustive research-quality pass. See the [Muse protocol audit](checks/I1-REV-M-protocol-audit.json). The [zcode audit](checks/I1-REV-Z-protocol-audit.json) documents complete non-execution rather than an independent judgment. The launcher reads the frozen prompt file verbatim; the native receipt does not capture a full provider input-payload hash, a transmission-evidence limitation retained in that audit.

## Time and usage

| Candidate | Native seconds | Source reads / unique | Reported input | Reported cache reads | Reported output |
|---|---:|---:|---:|---:|---:|
| Muse control | 760.3 | 36 / 29 | 5,205,027 | 5,001,813 | 31,425 |
| Muse maintained | 1,122.3 | 59 / 52 | 7,676,114 | 7,397,100 | 43,717 |
| zcode maintained | 1,817.1 | 50 / 44 | 4,637,079 | 4,404,416 | 77,524 |
| zcode control | 1,416.5 | 51 / 50 | 6,097,149 | 5,864,064 | 64,239 |

Candidate native elapsed totals 5,116.2 seconds (85.3 minutes); formal evaluation totals 724.8 seconds (12.1 minutes). These sum to 5,841.0 native-reported seconds, not the whole phase or development time. Four investigators and two evaluator assignments were dispatched serially. Original ceilings were 1,800 seconds/160 responses per investigator, 2,700 seconds/160 responses per evaluator, 12,600 scheduled model seconds and a 14,400-second phase; no retry/replacement slots were used.

The counters are cache-heavy provider reports, not unique input or subscription charges. Muse's 76 reminder-child attempts are recorded separately; child token totals are unknown. Zcode control exposes usage deltas for 41 of 42 requests; missing usage is not assumed zero. Zcode's zero reasoning-token field does not establish absence of reasoning. Opus reports $4.1496678 on native `costBasis=list`, not a measured subscription debit. Candidate dollar costs and development usage are not established. [USAGE.json](USAGE.json) keeps the three lanes separate.

Maintained delivery failed in both samples and took longer than its paired control. Lower zcode maintained input/read counts did not establish savings. No affordability or production-economics conclusion follows from these samples.

## Verification and preservation

No runner redesign or regression rerun was performed for this execution. Launch checks verified the frozen manifests, runtime/driver pins, corpus, prompt hashes and caps. The prior 30 portable preparation tests and separate technical closure probes remain historical preparation evidence, not extra tests run during I1.

Sol mechanical checks verified all candidate input/output hashes, exact host copies and failure-only maintained renders, evaluator staging, and terminal review chronology. Logged candidate tool audits found no shell, web or outside-workspace paths; this is an observed trace boundary, not proof of semantic absence or truth. Raw evidence stays on the VM with published path/SHA-256 pointers. No historical R1/R1b files or scores changed.

## Next offline work — proposals only

1. Address the demonstrated carrier serialization/schema fragility using offline realistic fixtures and a flash-compatible validation contract. Preserve invalid examples and all material finding parts. This is new work to review, not permission to repair these scored outputs.
2. Separate the evaluator's frozen task specification from an explicit, blinded execution-authorization envelope so an authorized assignment is not mistaken for preparation. Test this offline before another freeze; reuse the existing runner and Goal drivers.
3. Tighten first-view path instructions and audit broad searches, while retaining the honest prompt-only boundary and finite evaluation capacity. Preserve explicit unassessed scope and keep inventory counts separate from verified source-supported denominators.

No additional trial is prepared as an approved run. Any future trial needs a new reviewed freeze and applicable authorization; I1 is not retried. `V-FOLLOWON-1` stays OPEN / NOT QUALIFIED and outside this result. R1b Block 2 remains unauthorized.
