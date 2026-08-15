# PW-R7-REPLICATION-20260814.1 terminal

Terminal: **VALID_COMPLETED_REPLICATION_WITH_FIRST_ATTEMPT_FAILURES**.

The single predeclared fresh replicate is complete. It did not reproduce R6's three-path PASS:

- GPT-5.4 mini xhigh: **FIRST_ATTEMPT_FAIL** at S10A. At `$.decisions[4].source_record_ids[0]`, expected `A-S02`; observed `A-S04`.
- GPT-5.4 mini medium: **COMPLETE_PASS** through S90. Its S90 storage hash is `5e19f127deb440e56d54de9a02680010f0ed7983abd2caaacaeda71b16028901`, byte-identical to the R6-v7 terminal artifact.
- GPT-5.6 Luna medium: **FIRST_ATTEMPT_FAIL** at S30_B11. Expected `{"verdict":"clean","expected_choice":null}`; observed `{"verdict":"finding","expected_choice":"current_exact_count"}`. All same-wave W30 peers completed, then the path stopped.

Call accounting: 101 valid fresh first-attempt calls, 99 PASS, 2 FAIL, 0 retries, 0 best-of calls, and 0 replacement results. Alpha used 1 call; bravo 52; Charlie 48. No prior R6 output received empirical credit.

Ten controller/process receipts are preserved. Six came from execution/recovery; four came from terminal validation. Two execution receipts describe observation defects after an original valid call completed and do not add calls. The remaining receipts have no subject result. A transient empty `/tmp` directory boundary violation was removed and recorded. The inherited scorer also exposes nondeterministic ordering of S30_B11's two structural-diff rows across some fresh processes; the stored verdict, scalar fields, and exact typed diff set are stable, and no result was rewritten.

Terminal validation reopened all 101 raw outputs, captures, platform rows, and scores; confirmed 101 unique thread and turn IDs; hash-validated 29 direct rollout files; reproduced all 22 deterministic artifacts; and found no retries, replacements, prohibited subject activity, prompt-identity mismatch, frozen-control drift, or downstream execution after a valid path failure. Three S10A platform rows retain only the prelaunch packet identity; no separate per-call packet hash was captured there.

Requested route and pm-dev host/thread are recorded for every call. Twenty-nine direct receipts also bind the OpenAI provider and turn-context model/effort. The platform exposes no independent provider-effective serving snapshot.

Bounded repeatability verdict: **R6_ALL_PATH_PASS_NOT_REPRODUCED_BY_SINGLE_FRESH_R7_REPLICATE**. This is evidence against one-run all-path repeatability, not a probability estimate and not proof that R6 was a fluke.

The experiment is limited to the exact frozen unfinished throwaway snapshot. It makes no current-Plans, production-enforcement, full Planning Wizard audit, release-readiness, safety-certification, general weak-model-safety, or permission-to-compile claim.
