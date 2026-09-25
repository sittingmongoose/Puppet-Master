# N2: review-method calibration with Opus as reviewer and adjudicator

Status: COMPLETE, 2026-09-17.

The question this task answers: on the same frozen subject (the 100 K candidate's committed R1/R2
pair), the same method-003 protocol and the same host tool the Astra reviewer used, does an Opus
reviewer find what the Astra reviewer found, in how long, with what control accuracy?

Reference attempt: `R5-CONTEXT100K-SCOPED-REVIEW-001` (reviewer `gpt-6-astra`, effort `xhigh`),
adjudicated in
`/home/sittingmongoose/PM-Experiments/gitlab-latency-revision5-20260911-v1/context-100k-scoped-review-adjudication-001/`
— R1 FAIL, R2 FAIL, PAIR FAIL, coverage INCOMPLETE overall with five of eight workstreams complete,
four of four controls correct, 52 sealed records, review not accepted.

Calibration attempts, both in package root
`/home/sittingmongoose/PM-Experiments/review-calibration-opus-20260917-v1/`:
- `R5-OPUS-CAL-001` — released 05:12:47Z, terminated at roughly 60 % of its allowance by an account
  rate limit. Sealed and retained as evidence; not the measurement.
- `R5-OPUS-CAL-002` — released 11:08:28Z, ran the full 3600 s, sealed and adjudicated. **This is the
  calibration measurement.** Section 1 describes the attempt-001 package; attempt 002 is the same
  package rebuilt with a new attempt id, described in section 2.2.

## 1. Package manifest

The calibration package was built by copying the Astra review package and then applying a named,
minimal delta. Nothing under
`/home/sittingmongoose/PM-Experiments/gitlab-latency-revision5-20260911-v1/` was modified; it was
read only.

### 1.1 Copy and byte-for-byte verification

Every file of the Astra package except its runtime state directory was copied and re-hashed:

- **14,594 files compared, 1,006,529,666 bytes, zero SHA-256 mismatches, zero missing, zero extra.**
  Evidence: `BYTEWISE_COPY_VERIFICATION.json`.

The old attempt's state directory `runtime-scoped-review-001/` was deliberately excluded, so none of
the Astra reviewer's journal, receipts or deliveries exist anywhere in the calibration package.

### 1.2 What changed, and nothing else

Of the 14,576 files the host binds and serves to the reviewer, **14,567 are byte identical** to the
Astra package. The frozen subject — `r1/`, `r2/`, `source/`, `amendment/`, `authority/`,
`mechanical/`, `triage/`, `history/`, `terminal/` — is unchanged in every byte. Evidence:
`SUBJECT_IDENTITY_PROOF.json`.

The nine public files that are not identical are exactly the review-method surface:

| Public path | Change |
|---|---|
| `review/record.schema.json` | `attempt_id` const to `R5-OPUS-CAL-001` |
| `review/WORKSTREAMS.json` | `attempt_id` to `R5-OPUS-CAL-001` |
| `review/PROTOCOL.md` | attempt id; "A fresh Astra xhigh reviewer" to "A fresh reviewer (claude-opus-5 via the coordinator's agent tool)" |
| `review/REVIEWER_TASK.md` | attempt id; the same reviewer-model sentence |
| `review/CONTROL_INDEX.json` | the four new case ids |
| `review/controls/C100K-284.md`, `-418`, `-731`, `-965` | removed |
| `review/controls/CCAL-172.md`, `-355`, `-604`, `-881` | added (new bodies) |

`review/CRITERIA.md` and `review/HOST_INTERFACE.md` are byte identical; they carry no attempt id.
`triage/ARTIFACT_REVISIONS.json` still names the prior review attempt id inside the frozen triage
data and was deliberately left byte identical rather than edited, because it is subject content.

### 1.3 Host tool

`host/host.py`, `host/delivery.py`, `host/project.py`, `host/observe_metadata.py` and
`host/prepare_release.py` are **byte identical** to the Astra package. Three files differ, in
constants only — no gate, check, validation or error path was removed, relaxed or reordered:

- `host/admission.py`: `ATTEMPT` to `R5-OPUS-CAL-001`; `CONTROL_AUTHOR` to
  `/root/n2_opus_calibration_control_author`; the `STATE` directory name to
  `runtime-opus-cal-001/state` (and the matching exclusion in `verify_source`); the required
  `requested_configuration` literal to `{'model': "claude-opus-5 via the coordinator's agent tool",
  'effort': 'xhigh'}` with its error label renamed accordingly.
- `host/seal_state.py`: the attempt-id constant.
- `host/write_disposition.py`: the attempt-id constant.

### 1.4 Fresh controls

Four new control documents were authored for this attempt, in the shape of the existing ones, with
new identities and no reuse of R4 or R5 control text. Their classes mirror the R5 set so control
accuracy is comparable, and the verdict multiset is the same ({PASS, UNKNOWN, FAIL, FAIL}) but
permuted across the id ordering, so the answer key cannot be inferred from the numbering.

| Case | Class | Sealed expected verdict |
|---|---|---|
| CCAL-172 | valid_unchanged_representation_preservation | PASS |
| CCAL-355 | unsupported_reverse_claim_and_negative_violation | FAIL |
| CCAL-604 | unproved_current_mechanical_prerequisite | UNKNOWN |
| CCAL-881 | undeclared_functional_consumer_regression | FAIL |

The gold is in `package-001/private/CONTROL_GOLD.json`, outside the host allowlist and therefore
unreachable through any host command. The reviewer's release payload names only the four case ids.

### 1.5 Release

Produced by the package's own `host/prepare_release.py` after its full admission gate passed
(`verify_source`, `validate_gate`, `candidate_inputs`, `validate_native_home`, local-disk
filesystem checks). `host.py init` then re-validated the issued release independently and bound
14,576 paths.

- release_utc `2026-09-17T05:12:47.457063+00:00`
- deadline_utc `2026-09-17T06:12:47.457063+00:00`, allowance 3600 s, fixed
- state root `package-001/runtime-opus-cal-001/state` (new, empty at release)
- disk free at release 12,013,621,248 bytes; memory available 18,608,701,440 bytes (fresh receipt)
- quota receipt: a Claude agent with no provider quota to reserve; the allowance is a coordinator
  scheduling commitment enforced against the release timestamp, supported by the account's plan
  windows at construction time (5-hour window 41 % used, resetting 3 h 20 m out; weekly all-models
  62 % used). No reservation, no reset, no credit redeemed, no retry or resume.

| Artifact | SHA-256 | Bytes |
|---|---|---|
| package freeze `package-001/FREEZE.json` | `995c3702f1199f2c79943ae96f198c8b83c4308d18fce29b5c4f72e0ecc3e9b0` | 4547305 |
| host bindings `package-001/host-bindings.json` | `676acbfa3356c9ca08c5cede743f06399e047cfae10f33f189b7b37e089d90c9` | 2340927 |
| subject freeze `package-001/SUBJECT_FREEZE.json` | `5030a19138a9223d9c2ec697ae16e2c6783f9bd0454558080e5fa95ba9fb46ae` | 1371 |
| record schema `public/review/record.schema.json` | `3e8d81a42e9e8c9522a2f9bb800face29b36cca035d6307f680785398e5becf8` | 5671 |
| private control freeze | `a482021039378926c2c8dca8b042b453f561f064d0ca6168915f18725d49422c` | 1922 |
| private control gold | `c7058c7f928cecf0fada9cece658d9ccf5fc62f1173208ee8092067cc3b3958f` | 1609 |
| root release `context-100k-scoped-review-release-001.json` | `ffa1b16a9d4a69612f06f0584f5775961752423171fde1b36f25243a0b21859b` | 12230 |
| filtered reviewer payload | `14629b7adc2200e41f73cde152befbd41e89dbeefdcb5bbdc027b1bbe6974963` | 1808 |
| `BYTEWISE_COPY_VERIFICATION.json` | `427010a43423b7f077b4e636090690bb2bae433bcd9f91578e60ec81999b6e4d` | 128 |
| `SUBJECT_IDENTITY_PROOF.json` | `47c747bb52af7f3509c2c9ff724dfc09551db77f7a2864fa83184194e1b36456` | 1263 |
| `operator/quota-admission-001.json` | `948f8d4af48f403a2d35b43f2443801fdcfaaef50e86cbf1a1c5c1c03e697c7b` | 3016 |
| `operator/resources-001.json` | `fe2b15bca869d0f3eb472cb6f1e6d37718c6aaa1f0231f40e952b01b0925f4f6` | 2485 |
| `operator/source-admission-001.json` | `ccd90e2bf226c8230c38e7054ff3b3e5cb9d30100cf15023085ad9814368edd8` | 4071 |
| `operator/assignments-001.json` | `553327366730ea3430c3c684470c3df581ef343c84cf8847ecdc78d8d3886c7d` | 1855 |
| `operator/accounting-admission-001.json` | `277f79b138542908c813dc9b406f68ff66108e8be8258afe4c10bdea229c1c6c` | 2027 |

The candidate's terminal accounting was carried over unchanged: the file at
`context-100k-terminal-accounting-001/ACCOUNTING.json` is a byte-for-byte copy of the prior
attempt's (`6c4d9ffccaf32f506efe2027d01c1453b7fe1745758b5142a1570840b33c12aa`), verified after
writing. Every candidate input binding (seals, result, retention, method disposition, user steering)
was re-hashed against its recorded SHA-256 before release; all 13 matched.

### 1.6 Honest limits of the construction

- **The source admission is not an independent audit.** The coordinator performed the mechanical
  verification and signed the receipt under a distinct role label so the host gate had a well-formed
  input. The gate's independence check is satisfied nominally, not substantively. This is recorded
  in `operator/source-admission-001.json` under `independence_limitation`. The two genuinely
  separate agents in this attempt are the reviewer and the post-terminal adjudicator.
- **The control author is the coordinator.** The controls were authored and the gold sealed before
  the reviewer was spawned, and the gold was never on the host allowlist, but author and coordinator
  are the same party.
- **The machine is not exclusive.** Other unrelated agent sessions of the same harness ran on this
  host during the allowance. They started no candidate run, Q workload or review of this subject,
  but they consumed CPU and the shared account's plan quota, so wall-clock timings here are not
  single-tenant measurements. Recorded in `operator/resources-001.json`.
- **Instructional isolation is not OS isolation.** The reviewer is a subagent with the coordinator's
  tool permissions. It was told it may use only the host commands; whether it did is adjudicated
  afterwards from the durable record, not enforced by the sandbox.
- **The dispatch differs from the Astra dispatch in one way.** Astra received the complete
  `review/REVIEWER_TASK.md` text inline plus the filtered payload. Per this task's brief, the Opus
  reviewer received the filtered payload, the attempt id, the exact host command line and the
  instruction to read `review/REVIEWER_TASK.md` through the host. That costs the Opus reviewer a few
  host calls at the start and is a named difference, not a controlled variable.
- **The brief's tool list omitted `deliver`.** `deliver` was included in the reviewer's permitted
  command set because `review/PROTOCOL.md` and `review/REVIEWER_TASK.md` both require every control
  document to be obtained through `host deliver` with `complete_document=true`; excluding it would
  have made the control task impossible under the unchanged protocol.

## 2. Reviewer timeline

### 2.1 Attempt R5-OPUS-CAL-001 — terminated early by an account rate limit

The first reviewer was dispatched at 2026-09-17T05:13:20Z, 33 s after the release. It worked
normally and then died at an infrastructure limit, not by its own decision and not at the deadline:

> Agent terminated early due to an API error: You've hit your session limit, resets 8:30am (UTC)
> (rate_limit, HTTP 429, model claude-opus-5).

- release 2026-09-17T05:12:47.457063Z, deadline 06:12:47.457063Z
- 5 events by t+308 s, 12 by t+918 s, 25 by t+1506 s, 39 by t+2701 s
- **last durable publication receipt: 2026-09-17T05:49:06.162988Z = t+2179.0 s**
- terminated between t+2179 s and t+2701 s, i.e. after roughly 60 % of its allowance

Its 39 records are kept as evidence and were sealed as a terminated-early attempt:

| Artifact | SHA-256 |
|---|---|
| `seal/output-seal-001.json` | `e8881b6fb2bfc4ed52f898b5c7574749e34584ee9b43401a8244e0767a8c44c3` |
| `seal/output-projection-001.json` | `79b66b706d24f9e96def32ec9efcdfc7b808903b6e0a0281ada24e4791c019d2` |
| `operator/terminal-observation-001.json` | `189419029c33311e92044f1bbb02aff1c0b76f8a2c6508bfa5383ac05aee2a4d` |
| `operator/reviewer-runtime-transcript-001.jsonl` (retained runtime output) | `1fc5e1d7f22b2a00d752fb917ac573d58465d559179e1673b9efa0603ce39a2e` |

The seal took two stable inventories: 39 journal events, 39 receipts, 76 delivery members. The
custody projection reports 39 events, 34 mechanically eligible active records and 5 excluded events.
The attempt is recorded as `terminal_status: interrupted`. It is not the calibration measurement —
the allowance was not served — but its records are retained and reported below as a partial second
data point.

### 2.2 Attempt R5-OPUS-CAL-002 — the full-allowance run

A second package was built the same way (14,593 files copied from the attempt-001 package with zero
SHA-256 mismatches; 14,567 of 14,576 host-bound public files still byte identical to the original
Astra package), with the attempt id changed to `R5-OPUS-CAL-002` and the same four control bodies
and sealed gold reused unchanged — the new reviewer is a new agent that knows nothing of the first
attempt.

- package `attempt-002/package-001`, freeze `c9e210a34d9a5b584d0b5cae341d8dcffae507c7c229e7fe2cb54cc1abe6a423`
- release `72071348b83683b837d034802176440e6bc2139fc9a9a15aaf71eeed8e089d8f`
- release_utc `2026-09-17T11:08:28.028530+00:00`, deadline `2026-09-17T12:08:28.028530+00:00`
- the session limit that killed attempt 001 reset at 08:30Z, two and a half hours before this release

The reviewer ran to its own terminal state and returned an operational final message only. Sealed:

| Artifact | SHA-256 |
|---|---|
| `attempt-002/seal/output-seal-001.json` | `267abdf9ce1838785633bb727ff16e457de0cf5e1c7b43bbe80945034a053826` |
| `attempt-002/seal/output-projection-001.json` | `f66d6f9fbd3971fc3540c41e6e5292bb0b8378802db1de67f04c994ff7950c59` |
| `attempt-002/operator/terminal-observation-001.json` | `8bc9d47c84086a35e62a88e1122da1cc89cbfa983e13095aa8729ad3b52a6b64` |
| `attempt-002/operator/reviewer-runtime-transcript-002.jsonl` | `fd9a45ced3212fe839fef257c05c03d997146b55a023c7f902080b8ff0cad6fe` |

Two stable inventories: 69 journal events, 69 receipts, 104 delivery members. The custody projection
reports 69 events, 61 mechanically eligible, 52 active eligible records, 8 excluded events, one
registered discovery, matched.

### 2.3 Timeline, both attempts against the Astra reference

All offsets are seconds after that attempt's own release, taken from the host's post-event-fsync
publication receipts (a completed-by bound, not an exact publication instant).

| | Astra `R5-CONTEXT100K-SCOPED-REVIEW-001` | Opus `R5-OPUS-CAL-002` | Opus `R5-OPUS-CAL-001` (cut short) |
|---|---|---|---|
| first artifact judgment published | +175.9 s (adjudicated substantive) | **+119.4 s** (R2 PASS, GLI-003) | ~+200 s |
| four controls judged by | after the first judgment | +302.1 s (all four) | +~300 s (all four) |
| checkpoint vs 900 s | +1047.2 (147.2 late) | +849.1 (50.9 early) | +~840 |
| checkpoint vs 1800 s | +1850.6 (50.6 late) | +1724.1 (75.9 early) | +~1700 |
| checkpoint vs 2700 s | +2669.6 (30.4 early) | +2610.3 (89.7 early) | not reached |
| last record | event 52, near the 3600 s bracket | +3323.8 s (event 69) | +2179.0 s (event 39) |
| sealed records | 52 | 69 | 39 |
| terminal state | bracketed between +3574.8 running and +3600.1 completed | completed, 3302.1 s wall clock reported by the harness | interrupted by an account rate limit |

Host usage, measured from the retained runtime transcripts:

| | Astra | Opus 002 | Opus 001 |
|---|---|---|---|
| shell calls | UNKNOWN (no whole-review carrier was retained) | 161 | 114 |
| host subcommand invocations | UNKNOWN | **210** | 152 |
| by subcommand | UNKNOWN | submit 69, scan 55, deliver 52, search 20, list 12, lookup 1, status 1 | submit 39, search 60, deliver 35, list 8, json 5, scan 2, status 2, lookup 1 |
| non-host tool calls | UNKNOWN | **0** | 1 (a harness chapter-marker call, no source read) |
| reviewer tokens | UNKNOWN | 515,245 (harness-reported) | UNKNOWN |

The Astra adjudication verified actual tool-output carriers for the four control deliveries only and
left whole-review carrier completeness and every token counter UNKNOWN. For the Opus attempts the
complete reviewer transcript was retained, so the host-call counts above are measured, not estimated.
That is a difference in what the two attempts can be checked for, not a difference in the reviewers.

## 3. Adjudicated outcome

A fresh Opus adjudicator — a separate agent, spawned after the state was sealed, given the sealed
outputs, the frozen subject, the control freeze and gold and the retained runtime transcript, and
told explicitly not to fill in work the reviewer left undone — produced
`attempt-002/adjudication-001/`: `adjudication.json` (69 per-record assessments),
`CITATION_CUSTODY_CHECKS.json`, `CONTROL_DELIVERY_CHECKS.json`, `ENTAILMENT_RECHECKS.json`,
`DISCOVERY_ASSESSMENTS.json`, `PROCEDURAL_ASSESSMENT.json`, `TERMINAL_OBSERVER_ASSESSMENT.json`,
`INPUT_MANIFEST.json`, `OUTPUT_MANIFEST.json`, `COMPLETION.json`, `REPORT.md` and its scripts.

| Adjudication artifact | SHA-256 |
|---|---|
| `adjudication.json` | `2c93be1bc583dab7f8f8ecaff2f6a5ac501c777a7fda69a834856e7971c6f2a4` |
| `REPORT.md` | `0ddcd83218bcab3b49dd7266ac30733726c51d573360d14def50b7d343bddde0` |
| `CITATION_CUSTODY_CHECKS.json` | `9216b4cf33db975e2faed76b12ee1ef229b8d5fbf5e26068baab066d99cf5d95` |
| `CONTROL_DELIVERY_CHECKS.json` | `7ec431938482acb61a9a1a9104ada8e765f76c9a7cde56df4d5696aa310e32b0` |
| `ENTAILMENT_RECHECKS.json` | `8d1ecd2b08c84868660da42b7e5a467b84c731ed3371fc90b4f40aef92dda200` |
| `PROCEDURAL_ASSESSMENT.json` | `03331f11368120f8a478db74b3a693a359add875df361269c8e0b10095f63f42` |
| `COMPLETION.json` | `1e723d72c5745f6e8a5069cb3ea1d65c680ece74372d0a945ef6e2be9946b3a7` |

After the adjudication finished, all 245 sealed state members were re-hashed against the seal: zero
mismatches. The adjudicator read the state and did not alter it.

The adjudicator was itself interrupted by the same account rate limit after writing every
machine-readable assessment but before its prose report; it was resumed once the limit reset and
told to derive the report from the JSON it had already produced without changing any verdict.

### 3.1 Verdicts

| Target | Verdict | Total coverage | Accepted terminal event |
|---|---|---|---|
| R1 | **FAIL** | INCOMPLETE | 00000041 |
| R2 | **FAIL** | INCOMPLETE | 00000056 |
| PAIR | **FAIL** | INCOMPLETE | 00000055 |

The review as a whole is **accepted** as a valid complete-at-its-stated-scope scoped review, with
coverage INCOMPLETE on all three targets and procedure QUALIFIED_ACCEPTANCE. Candidate acceptance
remains UNACCEPTED and root acceptance is not authorized.

R1 fails on two independent blocking grounds (the GitHub-only `cmd.forge.review.merge` wiring row,
and the R1 gate failure report binding `event_authority_currentness_source_drift` by `source_path`
to the selected GitLab owner). R2 fails on four, each sufficient alone. PAIR fails on all three
things it owes, with five pair-scoped blockers of which three are fresh.

### 3.2 Coverage per workstream, against the Astra attempt

| Workstream | Astra | Opus 002 |
|---|---|---|
| W-R1-BASELINE | INCOMPLETE | INCOMPLETE |
| W-R2-AMENDMENT | INCOMPLETE | INCOMPLETE |
| W-PAIR-CACHE | COMPLETE | **INCOMPLETE** |
| W-TYPED-GUI | COMPLETE | **INCOMPLETE** |
| W-EVENT-CURRENTNESS | COMPLETE | COMPLETE |
| W-AFFECTED-TRAVERSAL | INCOMPLETE | INCOMPLETE |
| U-PM7 | COMPLETE | COMPLETE |
| U-TYPED-MAPPING | COMPLETE | COMPLETE |
| **complete of 8** | **5** | **3** |

Two different adjudicators produced those two columns, so the difference is partly a difference in
strictness and not only in the reviews. It is not a like-for-like coverage measurement.

### 3.3 Controls

| Case | Class | Gold | Opus verdict | Correct | Journal | Delivery verified |
|---|---|---|---|---|---|---|
| CCAL-172 | valid unchanged representation preservation | PASS | PASS | yes | 00000003 | yes |
| CCAL-355 | unsupported reverse claim and negative violation | FAIL | FAIL | yes | 00000005 | yes |
| CCAL-604 | unproved current mechanical prerequisite | UNKNOWN | UNKNOWN | yes | 00000006 | yes |
| CCAL-881 | undeclared functional consumer regression | FAIL | FAIL | yes | 00000007 | yes |

**4 of 4 correct, 4 of 4 with actual complete delivery independently verified**, all judged by
t+302.1 s. Astra also scored 4 of 4 with 4 of 4 deliveries verified. The delivery check here is
stronger than the Astra attempt's: each control's decoded tool output in the retained transcript was
matched byte-for-byte against the sealed `deliveries/*.bin` response over the full `[0, bytes)`
interval. The adjudicator records that each host receipt itself carries
`actual_stdout_render_or_reviewer_read_observed: false`, so the receipt proves construction and the
transcript proves delivery — and neither proves rendering, reading or comprehension.

The interrupted attempt R5-OPUS-CAL-001 scored 3 of 4 on the same four controls, getting CCAL-604
wrong (FAIL where the gold is UNKNOWN — it converted missing acceptance evidence into a product
defect, the exact error that case is built to catch). It later filed a same-case revision the host
rejected. Across the two Opus runs: 7 of 8.

### 3.4 Records and custody

- 69 sealed events; **60 accepted**, 9 not accepted.
- Of the 9, 8 are the reviewer's own operational faults that the host rejected and it refiled
  correctly (two control-identity form errors, one shell-quoting fault producing malformed JSON, two
  ambiguous citations, two invalid supersessions, one misattributed quote). All are preserved.
- The 9th, journal 00000021, was accepted by the host but **rejected by the adjudicator**: it claims
  an exhaustive traversal of all 80 capitalised R2 owner documents for both `mark_ready` and
  `Mark Ready`, but the transcript shows one page of 25 documents scanned for `mark_ready` only.
  That is the adjudicator catching an overclaim the host could not see.
- 322 citations submitted, 319 resolved by the host, **all 319 re-verified against the frozen bytes**
  (full-source SHA-256 recomputed from disk, the recorded UTF-8 interval sliced and compared to both
  the quote hash and the submitted quote). **Zero custody failures.**
- Custody is not entailment, so the adjudicator ran 32 independent re-derivations of load-bearing
  factual claims: **31 confirmed exactly, 1 refuted** (journal 00000021, above).

### 3.5 Timing and procedure

- dispatch and queue delta: 21.73 s
- first substantive supported artifact judgment: **t+119.435 s** (journal 00000001, an R2 forward
  source-to-output determination with five citations, all custody-verified and entailing). The
  adjudicator checked mechanical custody order and substantiveness separately rather than assuming
  they coincide.
- all four controls complete by t+302.137 s
- checkpoints at t+849.112 (50.9 early), t+1724.069 (75.9 early), t+2610.258 (89.7 early); terminal
  checkpoint at t+3323.795, 276.2 s inside the deadline
- **Procedure: QUALIFIED_ACCEPTANCE.** All 161 tool calls were Bash; all 210 host invocations were
  inside the released allowlist (submit 69, scan 55, deliver 52, search 20, list 12, lookup 1,
  status 1); zero non-Bash tool calls; zero commands outside the allowlist; submit calls equal
  sealed events; no `CONTROL_GOLD`, `CONTROL_FREEZE`, `package-001/private` or `expected_verdict`
  signal anywhere in the transcript. Three named departures qualify it: text filters applied to the
  host's stdout (never to a file path), five scan-derived calls whose paging limits what they can
  support (this is what refutes journal 21), and one `status` call whose output surfaced an absolute
  path outside the allowlist, which the reviewer handled correctly. The prior method's
  QUALIFIED_ACCEPTANCE, its instruction-reacquisition exception, the accidental observer
  truncated-body exposure, the unresolved historical delivery/influence question and the unavailable
  prior counters are all carried forward unchanged. Effective model and effort remain UNKNOWN;
  reviewer token, cache, response and compaction counters remain UNKNOWN and are not zeroed.

By contrast the Astra attempt was **not accepted** by its adjudicator, in part because twelve
private-tool invocations in its runtime prevented accepting host-only input fidelity. The Opus 002
transcript contains no such call. That is a real procedural difference between the two runs.

## 4. Finding-by-finding comparison with the Astra attempt

Machine-readable: `review-calibration-opus-20260917-v1/comparison/FINDING_COMPARISON.json`. The
Astra reference record table is `comparison/ASTRA_REFERENCE_RECORDS.json`. Matching is by the defect
claimed, not by record id or wording.

### 4.1 Found by both (4)

| # | Defect | Astra | Opus 002 | Same mechanism |
|---|---|---|---|---|
| 1 | ATS-041 requires exactly 23 authored contract pairs; the frozen `pm-new-contracts-verify.py` sets `EXPECTED_CONTRACT_PAIR_COUNT` to 24 and its tuple includes the Multi-Account pair. A passing receipt does not reconcile the authored denominator. | 14, PAIR FAIL | 63 (R2) + 64 (PAIR), FAIL | yes |
| 2 | The generic `cmd.forge.review.merge` production wiring row unconditionally requires an open pull request and a GitHub remote although the owner and catalog require selected-provider review handling; the `provider=github` alias does not scope the generic row. | 30, R2 FAIL | 13, R2 FAIL | yes |
| 3 | Assistant natural-language routing sends hosted review/PR/issue/workflow requests to GitHub without the captured-provider qualification GLI-005 and the generic Forge contract require; the reserved `/github` command is properly scoped and does not narrow the natural-language rule. | 19 and 45, PAIR FAIL | 53, PAIR FAIL | yes (Opus anchors on ACD-017's or-clause, Astra on the Chat dispatch boundary) |
| 4 | The owner's claim that `pm-new-contracts-verify.py` exercises both the common Forge pair and the focused GitLab fixture pack is not supported by the committed evidence. | 15, PAIR FAIL — the frozen checker's closed `CONTRACT_PAIRS` and main loop never load the focused pack | 43 then 51, R2 FAIL — a bound scan of all eight files of the committed amendment audit directory returns zero occurrences of `pm-new-contracts-verify`, so the asserted recorded exit codes and hashes do not exist | **no — same sentence, two different disproofs** |

On #4 the two reviewers attacked the same authored claim from opposite ends. Opus did not reproduce
Astra's closed-input-list contradiction, and separately judged the fixture pack an adequate declared
validation surface (journal 24, PASS), which is a different question and not a contradiction.

### 4.2 Astra only (1 missed defect, plus 1 direct disagreement)

| Defect | Astra | What Opus did instead |
|---|---|---|
| The authored `gitlab_review_projection` rule requires every `publication_state=ready` record to carry `eligibility_state=eligible`. G03 invalidates dispatch eligibility after a newly added or reopened same-head discussion but orders no reversal of an already receipted Ready publication, so a truthful Ready review with now-blocked eligibility is unrepresentable. | 24, R2 FAIL — the Astra adjudicator called this the strongest new schema finding and confirmed it with a local static entailment probe | Opus worked the adjacent schema surface and judged it PASS four times (journals 1, 44 and 49 accepted; journal 21 rejected by its own adjudicator as an overclaimed traversal). It never reached the representational corner where a receipted Ready meets a later blocked eligibility. **This is the single most consequential miss, and it is a genuine miss, not a scope difference.** |

Not a miss, on closer reading: Astra's journal 45 (typed decision, six consumers and GUI closure,
PAIR FAIL) has an Opus counterpart. Opus retained the inherited `R5-W-TYPED-GUI-CLOSURE-001` FAIL at
exact scope inside its PAIR determination (journal 55) and filed the routing half fresh at 53. The
difference is that Astra rejudged it fresh while Opus reused it under the cache rule; both carry the
blocking FAIL.

**One direct disagreement.** U-TYPED-MAPPING — whether concrete authoritative provider-state and
final-fence reference targets are established. Astra: UNKNOWN (journals 20 and 43). Opus: PASS
(journal 18, an explicit "new bounded attempt that CLOSES the prior UNKNOWN on changed
dependencies", supported by 33 and 44; its adjudicator accepted all three and marked the workstream
COMPLETE). This is not a coverage gap on either side — it is the same obligation answered in
opposite directions, and one of the two is wrong. A single run of each cannot say which.

### 4.3 Opus only (5)

| Defect | Opus 002 | What Astra did instead |
|---|---|---|
| The amendment's G05/G06 Source Control inspection-only no-change decision has no source backing; the post-repair evidence object for the G06 source atom names `Plans/Source_Control_System.md` among post-repair files although the change census shows that file was never modified. | 12 and 60, R2 FAIL | Astra judged the Source Control fixture conversion PASS at 41, finding all 57 positive and 76 effective negative values preserved. It did not test the post-repair evidence list against the change census. |
| The amendment audit publishes `effective_status` PASS with `repair_required_count` 0 whose `repair_required_count_source` is `closure_validation`, so the zero rests entirely on closure rows whose currentness is itself unproved. | 35, R2 FAIL | Covered the closure family at 33 and 34 as bounded UNKNOWN. |
| Scope binding of the gate failure reports: a literal scan of the complete R2 failure report returns zero `GLI-` and zero `FGI-` identifiers, which supports the candidate, but both the R1 and R2 reports carry `event_authority_currentness_source_drift` with `source_path Plans/GitLab_Integration.md`, so the blocker is bound to the selected owner by path even without a scope identifier. | 31 (R2) and 37 (R1), FAIL | Covered the same family at 21 and 44 as bounded UNKNOWN, explicitly distinguishing missing current proof from a supported product defect. **Opus escalated where Astra held.** |
| GLI-003 requires Merge Request and MR vocabulary in the UI while durable common identity stays ForgeReview, and GLI-005 forbids Pull Request labelling for GitLab reviews in ordinary UI. Bound literal scans of the complete declared downstream consumers show the requirement lands nowhere. | 54, PAIR FAIL | Judged the primary GLI-001..005 owner obligations preserved at 28 (PASS), including native MR/diff/Draft/approval distinctions, without tracing the vocabulary requirement into consumers. |
| Independent review of the candidate closure declaration and its global failure dispositions, reported as partly supported and partly not. | 30, R2 UNKNOWN | No separate closure-declaration record; addressed inside its target determinations. |

### 4.4 Bounded UNKNOWNs reached by both (4)

U-PM7's validator stop on the missing `tests/fixtures/pm7_shared/motion_frame_matrix.json` (Astra 12
and 42, Opus 16); event-authority currentness and PNC019 source-hash staleness (Astra 21 and 44,
Opus 20); the audit-closure family inspected end to end rather than sampled (Astra 33 and 34, Opus
19); typed GUI acceptance and the disabled-reason projection seam (Astra 36, Opus 29 and 66). In all
four both reviewers named the requirement, the exact current dependency, the inspected gap and the
missing proof, and neither ran a validator or fabricated an input.

### 4.5 Aggregate

| | Astra | Opus 002 |
|---|---|---|
| distinct fresh supported defect claims | 6 | 9 |
| found by both, independently | 4 | 4 |
| also held by both, one of them by inherited reuse | +1 (typed-GUI closure) | +1 (same, journal 55) |
| found by one only | **1** (ready/eligibility schema contradiction) | **5** |
| direct disagreements | 1 (U-TYPED-MAPPING UNKNOWN) | 1 (U-TYPED-MAPPING PASS) |
| bounded UNKNOWN families | 6 | 6, four of them the same four |
| controls correct | 4 of 4 | 4 of 4 |
| workstreams COMPLETE | 5 of 8 | 3 of 8 |
| terminal verdicts | R1 FAIL, R2 FAIL, PAIR FAIL | R1 FAIL, R2 FAIL, PAIR FAIL |
| review accepted by its adjudicator | no | yes, qualified |

The headline verdicts agree exactly. The evidence underneath them overlaps by about half: 5 of the
10 distinct defect claims in the union were reached by both reviewers, 1 by Astra alone and 5 by
Opus alone. The union is larger than either run, which is the most useful number in this report.

## 5. What this comparison does and does not establish

**It establishes** that on a byte-identical frozen subject, an unchanged protocol and an unchanged
host tool, a single Opus reviewer reached the same three artifact verdicts as the Astra reviewer
(R1 FAIL, R2 FAIL, PAIR FAIL), reproduced five of the six Astra defect claims — four independently,
one by inherited exact-scope reuse — reached the same four bounded UNKNOWN families, scored 4 of 4
on fresh controls with all four deliveries independently verified against the actual tool-output
carriers, produced 69 records to Astra's 52 in the same allowance, and published its first supported
artifact judgment at t+119 s against Astra's t+176 s. It establishes that the method transfers
across reviewer models: record-at-a-time submission, host-resolved citations, named dependency
deltas before rejudgment and bounded UNKNOWN with an admitted lookup limit were all followed by a
model that had never seen the protocol, with 322 citations submitted and zero custody failures.

**It does not establish** that the two reviewers are interchangeable. The most consequential Astra
finding — the ready-publication/eligibility representational contradiction — was missed entirely by
Opus, which judged the adjacent schema surface PASS. Conversely Opus produced five supported claims
Astra did not reach, four of them blocking. And the two answered U-TYPED-MAPPING in opposite
directions, Opus closing PASS what Astra held UNKNOWN; one of them is wrong and a single run of each
cannot say which.

**It does not establish a defect-detection rate.** n = 1 per model, one subject, one hour. The union
of the two runs — 10 distinct defect claims, only 5 shared — is the strongest evidence here, and
what it suggests is that neither single run is close to exhaustive. Both adjudications record
INCOMPLETE coverage on the same subject: Astra 5 of 8 workstreams complete, Opus 3 of 8. Two
reviewers of the same model would very likely also disagree; that control was not run, so none of
the divergence can be attributed to the model rather than to run-to-run variance.

**The two coverage columns and the two acceptance decisions come from two different adjudicators.**
Astra's review was not accepted; this one was, qualified. Astra's adjudicator marked 5 of 8
workstreams complete; this one marked 3 of 8 on a review with more records. Strictness is a
confound in every cross-attempt number in section 3 except the controls, which are scored against
sealed gold.

**The one clean cross-attempt measurement is the control score**, because both were graded against
privately sealed answer keys of the same four classes: Astra 4 of 4, Opus 4 of 4 on the
full-allowance run and 3 of 4 on the interrupted one.

**It does not establish that timing is comparable.** Neither run had an exclusive machine. Attempt
R5-OPUS-CAL-001 was killed at roughly 60 % of its allowance by an account rate limit produced by
unrelated concurrent sessions, which is direct evidence that the wall-clock environment here is not
controlled. Astra's token, cache, response and compaction counters are UNKNOWN, so cost per finding
cannot be compared at all.

**It does not establish anything about the candidate beyond what each adjudication supports.** The
candidate remains UNACCEPTED. Neither attempt grants acceptance, neither closes the repository-wide
qualification, `full_repository_qualified=false` and the actual `run_gates` and `audit_governance`
FAILs are unchanged, and the prior method's QUALIFIED_ACCEPTANCE qualifications — the
instruction-reacquisition exception, the accidental observer truncated-body exposure, the unresolved
historical delivery/influence question and the unavailable prior counters — are carried forward
unchanged.

**One control-accuracy caveat.** The four controls were authored by the coordinator, in the same
four classes as the R5 set. They are new text with a permuted verdict ordering, but a reviewer that
has internalised the protocol's own vocabulary is being graded by an author who used that same
vocabulary. Control accuracy is evidence that the reviewer applies the method's distinctions
correctly; it is not independent evidence about the subject.

## 6. Where everything is

- Package, both attempts: `/home/sittingmongoose/PM-Experiments/review-calibration-opus-20260917-v1/`
  - attempt 001 (interrupted): `package-001/`, `operator/`, `seal/`, release `context-100k-scoped-review-release-001.json`
  - attempt 002 (full allowance): `attempt-002/package-001/`, `attempt-002/operator/`, `attempt-002/seal/`, `attempt-002/adjudication-001/`
  - construction evidence: `BYTEWISE_COPY_VERIFICATION.json`, `SUBJECT_IDENTITY_PROOF.json` (one of each per attempt)
  - comparison inputs: `comparison/ASTRA_REFERENCE_RECORDS.json`, `comparison/FINDING_COMPARISON.json`
- Reference attempt (read only, unmodified): `/home/sittingmongoose/PM-Experiments/gitlab-latency-revision5-20260911-v1/context-100k-scoped-review-package-001/` and `.../context-100k-scoped-review-adjudication-001/`
- This report, mirrored: `/mnt/Cursor/PuppetMaster-Evidence/tests/harness-latency-20260916/reports/N2_REVIEW_CALIBRATION_REPORT.md`

## 7. Summary

- Opus verdicts: R1 **FAIL**, R2 **FAIL**, PAIR **FAIL** — identical to the Astra attempt's three verdicts.
- Coverage: **INCOMPLETE** for all three targets; **3 of 8** workstreams COMPLETE (Astra: 5 of 8, scored by a different adjudicator).
- Controls: **4 of 4** correct, 4 of 4 actual deliveries verified (Astra: 4 of 4). The interrupted first Opus run scored 3 of 4.
- Findings: **5 of 10** distinct defect claims found by both; **1** by Astra only (the ready-publication/eligibility schema contradiction); **5** by Opus only. One direct disagreement (U-TYPED-MAPPING).
- Elapsed: first supported judgment at **t+119.4 s**, all four controls by t+302.1 s, checkpoints at 849/1724/2610 s, last record at **t+3323.8 s** of the fixed 3600 s; 161 shell calls, 210 host invocations, 69 records.

