# Independent current C03 final source review

Scientific outcome: **FAIL**. This is a whole-current-final source review of the original holdout, not a matched-arm comparison. The missing/unselected counterpart remains **UNASSESSED**. No DEC014 credit is granted.

The final contains useful, substantial planning and all four meaningful current artifacts. Its documented precedents, source identities, many arithmetic facts, accessibility plan and honest proposed-validation labels are preserved. Consequential integration and recovery claims prevent complete source qualification.

| Obligation | Coverage | Assessment |
|---|---|---|
| H1-01 | PARTIAL | Minimum workflow, support limits and immutable originals covered; heard-state deferral and export completion remain defective. |
| H1-02 | PARTIAL | All domains/source identity and rounding stated; downsample-tail and renderer/output-oracle reconciliation unresolved. |
| H1-03 | PARTIAL | Three state classes, channel mapping, transitions and clipping census covered; resampler drain and RF64 conditions faulty. |
| H1-04 | COMPLETE | Bounded windows, cache identity/invalidation, seeking caveats, progress/cancel, arithmetic sizing and unmeasured RSS target are meaningfully planned. |
| H1-05 | PARTIAL | Hash identity, relocation, portable exchange and missing media are useful; save/export transaction claims are incomplete. |
| H1-06 | COMPLETE | Keyboard workflow, transcript legibility, errors, undo/redo, channel choice and timing/provenance presentation are explicit; UI tests are proposed. |
| H1-07 | COMPLETE | Audacity and BBC audiowaveform supply independent useful precedents and concrete lessons; libsndfile, libsamplerate and SQLite broaden mechanisms. |
| H1-08 | PARTIAL | Real issue, fix and release pinned; useful limitations disclosed; exact causal regression coverage is not demonstrated. |
| H1-09 | PARTIAL | Coherent bounded stack, alternatives and opportunities present; unsupported recovery/render claims and heard-state scope remain critical. |
| H1-10 | PARTIAL | All four exact final files are present and meaningful, many source claims and honest validation labels survive; consequential scientific errors prevent complete qualification. |

The actual scope is all ten H1 obligations, frozen common Q1-Q8, and exact card duties: final4, two independent precedents, real issue/fix/regression. A/B twelve/five and diagnostic target-three rubrics are not applicable. No aggregate score was used.

## F01 — Export completion precedes required cue-table completion

CONSEQUENTIAL; current proposal lines 181.

The current lifecycle writes status=complete after audio rename and writes the cue table afterward. Interruption or cancellation between those operations leaves a checksum-valid audio and a complete record without the required cue table. Its cancel action handles the temporary filename, which has already been renamed. The stated scan/checksum recovery does not define a transaction over both outputs.

The promised incomplete-output/cancel rule and review-mix-plus-cue-table delivery are not established by this state machine. Completion needs a defined commit boundary for all required outputs.

Limit: Static contradiction in the proposed order; no candidate application was run and no actual failed export is claimed. Atomic serialization of final research files is unrelated.


## F02 — Renderer stops on consumed input without a defined output-drain condition

CONSEQUENTIAL; current proposal lines 151,177,238.

The renderer specifies looping until input_frames_used consumes a window, then resetting at the next clip. At the pinned 0.2.2 API, input consumption and output generation are separate per-call values. The official example continues processing after input exhaustion until end_of_input with output_frames_gen=0; the termination test does likewise. The proposal has no final drain, pending-output handling, or reconciled output-frame contract before reset/quantization.

A supported mixed-rate clip can lose pending resampler output or disagree with the cue/length contract. The assertion that no load-bearing claim depends on an unverified component overlooks this load-bearing integration behavior.

Limit: Source inspection establishes an omitted termination obligation, not a measured loss for a particular 4-second buffer. E2 exercises fastest sinc plus linear/ZOH, not a newly executed medium-quality test; E3 selects medium quality.

- S14: /home/sittingmongoose/PM-Experiments/external-research-v9-20261005-203005/ops/frozen-exports/selected-evidence/C03-REQUESTED-CURRENT-SOURCE-PRESERVATION-WITNESS-001/S14.body; SHA-256 b45438c450036c2cc40dd7e8c39abeafa99c1b60e1abb4d993fb6f576beaee85; Process and Reset sections
- S20: /home/sittingmongoose/PM-Experiments/external-research-v9-20261005-203005/ops/frozen-exports/selected-evidence/C03-REQUESTED-CURRENT-SOURCE-PRESERVATION-WITNESS-001/S20.body; SHA-256 cbb39118af1b3992455a7742d641693471db1e534350a4f11d827ee4590ef31e; SRC_DATA per-call counts
- E1: /home/sittingmongoose/PM-Experiments/external-research-v9-20261005-203005/ops/frozen-exports/selected-evidence/C03-REQUESTED-INDEPENDENT-PRIMARY-URLS-001/15eb3adb42f0803458e7ea200d0fe45473628275d6ecafd1221581b33b49305c.body; SHA-256 ecc11b6bec5bd8131a3dd510a7017a5b7b503573d9b49b7e02ee5c3c86568717; src_callback_read, lines 192-223
- E2: /home/sittingmongoose/PM-Experiments/external-research-v9-20261005-203005/ops/frozen-exports/selected-evidence/C03-REQUESTED-INDEPENDENT-PRIMARY-URLS-001/707577682e8d0cb31220664b2f88d46031ecca3f2d0ac2f5a758124db3d8cea8.body; SHA-256 aed8de138e10641241efd83ecc8ba507f829eefcba7709decfb4e88da690684c; stream_test termination loop
- E3: /home/sittingmongoose/PM-Experiments/external-research-v9-20261005-203005/ops/frozen-exports/selected-evidence/C03-REQUESTED-INDEPENDENT-PRIMARY-URLS-001/e1cc07d9807c3d25742f55340239e9df056379f717f6de37914a60644ac2e476.body; SHA-256 80c7fd9a445502cc5ab388f6da2b60539431fd98b9d3f752cca754917a047f7f; timewarp_convert, termination after end_of_input and zero output

## F03 — Downsampled in-range anchors can map outside the declared clip domain

CONSEQUENTIAL; current proposal lines 99,101,102,103,110.

For supported Rsrc=96000, Rproj=48000, t=q=0 and len=96001, Lproj=48000. The valid source anchor s=96000 maps by the written floor rule to p=48000, excluded from [0,48000). Only s=t+len is declared a boundary cue. The proposal does not classify this in-range tail anchor or reconcile its exported cue with the rendered domain. The same problem occurs for a one-source-frame clip, whose downsampled length is zero.

Boundary/orphan semantics and cue provenance at rate conversion are incomplete despite exact preservation of the source identity. FW1 verifies 1:1 and one upsample ratio, which does not resolve this allowed downsample case.

Limit: Evaluator-only paper counterexample to the exact formula; no code execution/retest or audio-content claim. Keeping the source anchor is a valid protected choice and is not rejected.


## F04 — Issue mechanism and claimed regression chain miss the premature-EOF path

CONSEQUENTIAL; current proposal lines 157,159,163,165.

The parent of fix 63c8bd4 loads waveform points before the invalid-header checks. A premature EOF transfers control to the catch; the catch leaves success=true for EOF and bypasses those later checks. A complete malformed-header fixture can instead reach the old checks and return false. Moving checks ahead of sample reads blocks the bypass. Therefore merely saying that success=false continued execution is not the entire mechanism. The captured current test file is byte-identical to the fix-parent test file; the cited tests assert false/error for existing low-header fixtures, but no captured test exercises the issue's truncated declared-count/zero-scale combination or its downstream SIGFPE.

A real and useful issue/fix/release investigation is present, but the consequential causal account and regression coverage are only partial. The absence of a specific reproducer is honestly disclosed; that disclosure cannot supply the required verified issue/fix/regression chain.

Limit: No upstream tests were executed. Source inspection proves the bypass structure and unchanged test bytes; it does not assert that every older release fails or that every later release/fork is immune. Release 1.6.0 changelog support is preserved.

- S04: /home/sittingmongoose/PM-Experiments/external-research-v9-20261005-203005/ops/frozen-exports/selected-evidence/C03-REQUESTED-CURRENT-SOURCE-PRESERVATION-WITNESS-001/S04.body; SHA-256 40eda972d0a9800c3fc0ce19f0f679721801ed1062cf5b8fca89da189f4e73ea; crash.dat bytes and reported SIGFPE
- S05: /home/sittingmongoose/PM-Experiments/external-research-v9-20261005-203005/ops/frozen-exports/selected-evidence/C03-REQUESTED-CURRENT-SOURCE-PRESERVATION-WITNESS-001/S05.body; SHA-256 00616f2d78d67f64a7b5be72bae96846a0fb490b6c8237e7fe5575ee2ba4cf10; WaveformBuffer.cpp fix patch
- S07: /home/sittingmongoose/PM-Experiments/external-research-v9-20261005-203005/ops/frozen-exports/selected-evidence/C03-REQUESTED-CURRENT-SOURCE-PRESERVATION-WITNESS-001/S07.body; SHA-256 dbd8dfc4050b40c1618b07e545e7a298dce3c6d91201b0b97783bfd598a88a0d; shouldNotLoadDataFileWithSamplesPerPixelBelowMinimum and sample-rate test
- E5: /home/sittingmongoose/PM-Experiments/external-research-v9-20261005-203005/ops/frozen-exports/selected-evidence/C03-REQUESTED-INDEPENDENT-PRIMARY-URLS-001/cd3cf6bc5f3331f50de9bc00714a6e2adef5753d86e2f259da2b587d887d38dd.body; SHA-256 15c593f5d28159d6f228529a23b708ad9d92be7c9a1072cdee9588cd0d33da7c; load, lines 204-277 including EOF catch
- E6: /home/sittingmongoose/PM-Experiments/external-research-v9-20261005-203005/ops/frozen-exports/selected-evidence/C03-REQUESTED-INDEPENDENT-PRIMARY-URLS-001/a5037b9edf2c2708c33e7b6e7ada0f69f34422a44fc71e88be7bddc8b87a04a4.body; SHA-256 3c1111654ce9810d102e36fcf39f7965e676f64a87f7aa6bc17be7579746318b; load, lines 183-207 before waveform-data reads
- E7: /home/sittingmongoose/PM-Experiments/external-research-v9-20261005-203005/ops/frozen-exports/selected-evidence/C03-REQUESTED-INDEPENDENT-PRIMARY-URLS-001/50287daaeda7b13f377c8125aae90ea9226d2fca0fde3d1053d088f50a947f94.body; SHA-256 dbd8dfc4050b40c1618b07e545e7a298dce3c6d91201b0b97783bfd598a88a0d; whole file, identical SHA to S07

## F05 — Proposed render validation establishes repeatability, not correct assembled content

CONSEQUENTIAL; current proposal lines 115,225,226,227,240.

The proposal calls sections 11.2-11.3 the evidence for correct assembled audio, but 11.2 checks byte equality across repeated runs/window sizes and 11.3 checks interruption state. It defines no independently justified expected audio samples/content for trims, gaps, joins, channel routing, transitions or resampling. A renderer emitting the same correctly sized silence every run can satisfy those checks while assembling the wrong material.

The validation plan does not yet discharge the brief's explicit warning that timing/duration alone does not verify final audio content. This is a defect in the proposed oracle, not a demand to build the whole application during research.

Limit: Logical countermodel only; existing arithmetic checks and all honest UNEXECUTED labels remain credited.


## F06 — Save durability is not the cited SQLite rollback protocol

CONSEQUENTIAL; current proposal lines 153,189,191.

The proposed sequence syncs manifest.json.new and its directory before atomically replacing manifest.json, with no specified directory sync after replacement or backup rotation. The Linux fsync reference separately requires directory synchronization for directory-entry persistence. The SQLite source preserves original pages in a rollback journal before modification and places its commit after database flush; writing only the new manifest is not that rollback journal. The claim that any mid-save crash leaves the old manifest untouched also fails after replacement but before the remaining steps.

Interrupted-save guarantees and two-generation recovery are overstated. A bounded cross-platform replacement/backup/durability protocol and old-or-new recovery rule are required; a proposed kill test alone does not define them.

Limit: The explicit directory-sync fact is Linux-specific. No filesystem fault test was run and no universal behavior of Windows/macOS or network filesystems is inferred. Atomic visibility is distinct from persistence.

- S17: /home/sittingmongoose/PM-Experiments/external-research-v9-20261005-203005/ops/frozen-exports/selected-evidence/C03-REQUESTED-CURRENT-SOURCE-PRESERVATION-WITNESS-001/S17.body; SHA-256 5a5be7b660217c9408c8a81eaf2faa2d08832ed3790f895a0a713916ad856ea1; sections 2, 3.5, 3.7, 3.10 and 3.11
- E4: /home/sittingmongoose/PM-Experiments/external-research-v9-20261005-203005/ops/frozen-exports/selected-evidence/C03-REQUESTED-INDEPENDENT-PRIMARY-URLS-001/908cff5fca2cb1770e8001678c84855cffed295dfde8d19f0d13cbfd82a6b3b4.body; SHA-256 f0a986d21500222ecb69580fc7a910f346c6b1ff1005ca515501fb05bb5d91f5; DESCRIPTION: file fsync does not necessarily persist directory entry

## F07 — What was heard is deferred to an optional opportunity

CONSEQUENTIAL; current proposal lines 201.

The brief requires the next editor to understand which audio was heard. The proposal explicitly says adding optional reviewed-region state supplies that property, while the minimum data contract records cues/edits rather than heard/review state. No minimum substitute for that audit fact is specified.

A required editorial handoff property is deferred, although the import/edit/cue workflow otherwise has substantial coverage.

Limit: This finding follows the actual H1 brief, not an imported A/B diagnostic rubric. It does not require automatic listening telemetry; a bounded manual review record would suffice.


## F08 — New RF64 correction drops the documented downgrade condition

BOUNDED_SOURCE_ERROR; current proposal lines 19,63,238.

S19's complete command section says RF64 auto downgrade applies when the resulting file is less than 4 Gig. The current final infers from the command-table name that oversized RF64 output must defeat a silent downgrade into overflowing WAV. The existence pin is correct; the oversize-danger rationale does not follow from the source conditions.

C4 introduces a source-interpretation error. Explicitly disabling downgrade can be a format-consistency choice, and the ordinary oversized-WAV refusal remains useful; neither is evidence that the library would downgrade an oversized file.

Limit: No actual RF64 writer test was run; this is a documented-condition correction, not a claim about a observed export.

- S19: /home/sittingmongoose/PM-Experiments/external-research-v9-20261005-203005/ops/frozen-exports/selected-evidence/C03-REQUESTED-CURRENT-SOURCE-PRESERVATION-WITNESS-001/S19.body; SHA-256 ee59248c61847bd64291e46ce377e277c9e558eb70dd903c8f8c27bb4abe319e; SFC_RF64_AUTO_DOWNGRADE detailed section, HTML text tokens 2530-2560

## Bounded source qualifications

- B01: Note 1 normalizes integer-file data read through float methods. The final's broad float-normalization wording should retain that file-type condition. The float-to-integer zero trap is correctly preserved; no concrete floating-file clamp behavior was tested.
- B02: Undo-history loss is documented Audacity product behavior, not a necessary cost of a new SQLite project format. The folder-bundle choice and AU3 precedent are useful, but this alternative rationale needs its product-specific qualifier.
- B03: The proposal appropriately says chunks the library exposes, but its catalog's any-and-all retrieval shorthand omits the source's not-all-chunks/not-all-formats qualification. Original bytes remaining unchanged is supported as a design choice; universal metadata extraction is not independently established.

## Whole-final claim and preservation coverage

- 1-3 (Workflow, support set and state classes): Reviewed; source format additions/releases and read-only choice supported; B01 and F01/F07 retained.
- 4.1 (Media identity, metadata and ambiguity): Reviewed; hash/revision/readonly choices coherent, exposed-chunk qualification retained, B03.
- 4.2-4.3 (Container, relocation, missing media and exchange): Reviewed; Audacity facts corroborated; source-copy and degraded-state choices useful; B02.
- 5.1-5.3 (Timing domains, mappings, rounding and boundaries): Reviewed; FW1/FW2 arithmetic substantiated, source anchors protected; F03 plus boundary/orphan exception ambiguity.
- 5.4-5.6 (Joins, transitions, cue export and channel mapping): Reviewed; FW4 limited formulas corroborated, explicit channel choice protected; F02/F05 affect audio/cue integration.
- 6.1-6.3 (Components, independent precedents and library APIs): Reviewed against S01-S03/S11-S17/S20; documented facts largely supported; integration limitations remain.
- 6.4 (Issue/fix/release/tests and mechanism): Reviewed against S04-S10 and fix-parent/current implementation; F04; FLAC half appropriately unclaimed as fixed.
- 7.1 (Waveform cache keys, sizing and invalidation): Reviewed; corrected 345600000 frames/1350000 points/5.4 MB supported; a source cache is independent of edit placement.
- 7.2 (Chunked rendering, conversion and clipping): Reviewed; API controls/quality pin and equal-power peak supported; F02 and source-condition qualifiers.
- 7.3 (Export and cancel lifecycle): Reviewed; F01 prevents stated guarantee.
- 7.4 (Memory, seek, progress/cancel): Reviewed; integer size claims supported; targets explicitly unmeasured and lossy seek risk honestly retained.
- 8 (Save, interruption and recovery): Reviewed; F06; import/cache retry and originals preservation are legitimate planned choices.
- 9 (Editor interface/accessibility): Reviewed; proposal obligations meaningful, GUI execution properly unclaimed.
- 10 (Opportunities and alternatives): Reviewed; optional ASR/WebVTT correctly bounded; F07 and B02.
- 11 (Executed/adopted checks and proposed gates): Reviewed against exact submitted code/inputs/streams/exit; no retest; F05 and scoped receipt limits.
- 12-13 (Critical dependencies, limits and evidence index): Reviewed; source duties largely reproducible; universal no-load-bearing-unverified assertion conflicts with F02/F06.
- C1-C5 (Current critique correction/preservation claims): C1 corrected genuine earlier numeric error; C2 honest display property; C3 real upstream size tolerance; C5 arithmetic peak correct. C4 existence/quality pins valid but RF64 rationale erroneous. Earlier useful design/lead meaning substantially preserved; inherited scientific errors are not excused by preservation.

## Witness limits

- FW1: Exact candidate code/streams/exit corroborate stated finite 1:1 and upsample formulas, not all mapping domains.
- FW2R1: Exact failed expectations and FAILED stream preserved despite exit0; no false pass inferred.
- FW2: Revision2 exact stream corroborates nearest-ms display cases; catalog says 11 PASS lines but actual stream has 10 PASS lines plus float demonstration (minor bookkeeping only).
- FW3: Exact arithmetic outputs corroborate sizes and genuine research cache correction; not measured RSS or RF64 behavior.
- FW4: Exact formulas/streams corroborate lengths/power sum/in-phase peak; no perceived transition or actual audio render proof.
- RW1_RW2_RW3: Exact adopted source facets checked with research attribution; distinct current checks corroborate shared arithmetic, not a whole editor.
- disclosed_RW1_rev1: Exact failed-receipt facets unavailable before P1 freeze; failure disclosure UNASSESSED. Adopted rev2 facets verified; no fabrication inference.
- evaluator_execution: NONE; no candidate runs/retests, no code repaired, no candidate feedback.

Complete exact source/criterion/proposal/witness/preservation pins and common-dimension assessments are in phase1.json. All source evidence was delivered as positive byte facets. No model/Goal/status/native/cost key was read before this judgment. The reservation is preparation; the actual source clock is 2026-10-06T06:25:50.036989+00:00. The original 1200/600-inclusive/1800 limits remain unchanged.

---

# Current C03 independent operational qualification

The immutable source judgment remains **FAIL**. Source quality and operational delivery are separate.

The selected treatment has its exact final4 and positive current cleanup/resource/outer-descendant quiet evidence. The safe runtime projection records direct activation/submission flags for two fresh role sessions and driver status completed. It does **not** export a direct Goal status record: native Goal status and opaque Goal ID remain **UNKNOWN**, while the owner-selected completion claim is retained as a claim. Physical provider and billed dollars remain **UNKNOWN**.

| Selected role | Observed model / effort | Recorded elapsed / bound | Known requests | Operational / Goal status |
|---|---|---|---|
| research | GLM-5.3-Flash / max | 1072.7391654120001 / 1200 s | 15 | complete+quiet / UNKNOWN direct Goal status |
| critic_final | GLM-5.3-Flash / max | 1241.257768609008 / 1500 s | 22 | complete+quiet / UNKNOWN direct Goal status |

Per-request last usage.delta, native counters, cache fields and provider-export row metadata retain their literal scopes. They are not dollars or reconstructed total campaign/attempt cost. Complete resource fit remains UNKNOWN despite recorded finite peaks and no observed OOM.

Only the actual originalold1.4 research and critic_final roles were selected. Counterpart scientific quality remains UNASSESSED; no paired winner, matched causal credit or DEC014 future-stratum credit is assigned.

Phase 1 froze at 2026-10-06T06:43:19.976811+00:00 after 1049.939750428 source seconds. Phase 2 checking began at 2026-10-06T06:47:15.126140+00:00; the literal 600-second budget began at the earlier freeze and includes the 235.149314623 second key/verification wait. No clock was reset.

Runtime projection: /home/sittingmongoose/PM-Experiments/external-research-v9-20261005-203005/ops/frozen-exports/phase2/C03_CURRENT_TWO_ROLE_NATIVE_RESOURCE_001.json; SHA-256 0ba5a56502f1fef26eb1a300bffd5151ecd488e232d977c29c455917d896b5db.

Detailed scopes, role metadata, pins and clocks are in phase2.json. Immutable scientific evidence remains in phase1.json and phase1.md.
