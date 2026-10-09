# ER11 publication component audit

Completed the finite, read-only report/accounting/method-attribution check. Four publication clarifications are needed. No candidate science was evaluated, no reviewed artifact was changed, and all four M16 source grades remain pending for this assignment.

The initial reporting counts reconcile: **80 arms = 13 graded full-final passes + 41 graded full-final failures + 4 pending delivered finals + 8 missing finals + 14 unstarted cells**. Thus 58 finals were delivered from 66 attempted arms across 33 blocks; 31 paired assessments were terminal at the initial snapshot. Missing-final raw labels remain distinct from full-final quality, and no confirmation ran.

## Publication findings

1. **PUB-01 — Label M16 arms explicitly.** The draft and reference prose use treatment/control order without labels. Correct control/treatment figures are H01 **34.391 / 28.848 minutes**, and H02 **23.644 / 39.944 minutes**. The stated 16.116% saving and 68.944% slower treatment are arithmetically correct. Neither reaches the 20% delivery gate; this conclusion requires no source-grade inference.
   Evidence: final/FINAL_RESULTS_DRAFT.md (SHA-256 36d7f33db93c9accfdea92ae4953ea50e6ff8c481a47d63f53f21625874e8016); reusable/REFERENCE_WORKFLOW.md (SHA-256 ce4560e0474774defc65c8102c4e29076b6690e32c3e251bed86d6d37ec2455f); control/QUEUE_CLOSURE.json (SHA-256 1fe82863f0b301ee017aecdd958fb901e9fefb5db26b6369fea18a7c83300f95).

2. **PUB-02 — Distinguish scheduling statuses from final execution accounting.** Twenty non-M16 executed blocks still have UNSTARTED/READY variants in mutable queue.json; C-01/C-02 also had UNSTARTED labels at the first read despite completed delivery. Preserve QUEUE_ORIGINAL.json, but identify the mutable queue as a scheduling record or reconcile its execution statuses. Counting only literal STARTED statuses would omit eight original failed attempts and yield 58 instead of 66.
   Evidence: control/queue.json (SHA-256 21b0f59697cc73352ed4a89b88652d0e19b5e19729310904f9a6eeb52e55e30f); final/tables/ALL_80_ARMS.json (SHA-256 3686c5c47d8bfefd35cb90129cc53e306197e66c20ba3b8d142c20277fde8008). Exact affected non-M16 blocks are listed in result.json.

3. **PUB-03 — Keep paired timing separate from scientific qualification.** C-02 pair.strict_time_eligible is false although both arms meet whole-arm, every stage, and occupied-work ceilings. C-01 had the same discrepancy in the first snapshot. If this field represents joint source/time qualification, name it accordingly; a pending grade cannot establish a timing failure. M16 science remains outside this audit.
   Evidence: accounting/v2/TIMING.json (SHA-256 07ff2aca74e3fbe50e00592273f78b9ec800f6239015482d26e710509e907eca); final/tables/ALL_80_ARMS.json (SHA-256 3686c5c47d8bfefd35cb90129cc53e306197e66c20ba3b8d142c20277fde8008).

4. **PUB-04 — Substantiate the all-eight component-coverage claim.** Closeout claims available components of all eight missing-final arms were assessed. A-M12-B/treatment has null original_assessor_grade and assessment_path. A paired review is linked in SCREENING_RESULTS.md, but treatment component coverage is not established by the permitted metadata. Add the coverage disposition or qualify the statement. This does not prove that review was absent, and unseen final quality must remain null.
   Evidence: final/FINAL_CLOSEOUT.md (SHA-256 5b4a2a0d868da18d87a13f4f58955b6d10465cc02b90bc1a51dff300c1c61dab); final/SCREENING_RESULTS.md (SHA-256 96316ee4d99cb10455f5e0bebfd9d0c180d56b7e53288e260ee30aa2444b5147); final/tables/ALL_80_ARMS.json (SHA-256 3686c5c47d8bfefd35cb90129cc53e306197e66c20ba3b8d142c20277fde8008).

## Checks that passed

All **24 screening mappings** match method, case, provider and full-final quality. All **180 original stage assignments** match their method/version and registered arm contrast exactly. M02 correctly uses progressive retrieval with a separate fresh reviser; M03 is critic-finalizer. M05-v2 is a successor, M14 preserves its Muse/Luna bundled role comparison, and M15 charges its additional factored verifier context. No case-number-to-method mapping error was found.

The three-context reference independently reconstructs to **10/10 delivered, 8/10 source passes, 2/10 failures, and 5/10 jointly source/time eligible**. Its two failures remain in the denominator; four-context M01 controls are correctly excluded. Among eight passes, delivery range 27.675–59.622 minutes and median 41.655, and occupied-work range 19.662–50.932 and median 35.247 agree with the report.

Using the control as denominator, A-M05-B saves **28.270942%** delivery while using **16.671975% more work**. A-M08-B saves **0.398932%** delivery and **4.709090% work**; B-02 saves **4.906517%** delivery with **60.365467% more work**. A-M08-A's 24.338645% faster treatment remains a non-comparable failed pair. No repeatable speed, 2×, billing, subscription or affordability win is established.

Evidence: reusable/OBSERVED_REFERENCE.json (SHA-256 8b4cd277d188b2c03e38b74e719ca526a2c0942f9137485ccdd6e2d52d5bb628); accounting/v2/TIMING.json (SHA-256 07ff2aca74e3fbe50e00592273f78b9ec800f6239015482d26e710509e907eca). result.json records hashes of all 210 permitted inputs actually read, including original attribution-only assignments.

## Accounting and audit limits

At timing snapshot 2026-10-09T22:29:10.675683+00:00, the reported partial experiment subtotal is 174897.721 seconds (48.582700 hours); the conversion is correct. Product occupation is 125317.877 seconds, paired assessments counted once total 36232.674, and explicitly recorded extra occupation is 78.818. Their 13268.352-second difference from the reported subtotal is not fully itemized in the permitted row fields. Auxiliary work may explain it; this is a reconstruction limit, not a demonstrated arithmetic error. Root/shared preparation and other unmeasured quantities remain unknown rather than zero.

The files changed during this finite audit. Initial table counts were observed at frozen_at 2026-10-09T22:24:55.484392+00:00; fingerprints identify the later bounded read, not that earlier version. M16 source-grade fields are excluded from conclusions and all four are held pending under the user's instruction.

This allowlist cannot independently verify primary-source science, complete evaluator coverage, root Ultra configuration, runner execution, actual GitHub publication or cleanup. Recorded source judgments and native/configuration observations stay separate. No candidate artifacts, full transcripts, private provider internals or additional linked files were opened.

One actual supported native Goal was activated before the audit. Both result files are saved before its supported terminal completion; no receipt JSON is fabricated. No delegation, monitoring/polling loop, T3 control, network download, Git, product change, reviewed-artifact edit or new harness was used.
