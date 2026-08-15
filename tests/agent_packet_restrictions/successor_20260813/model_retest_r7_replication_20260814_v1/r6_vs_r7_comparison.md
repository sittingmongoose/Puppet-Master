# R6-v7 versus R7 repeatability comparison

R7 did **not** reproduce R6's three-path PASS. Under the unchanged frozen R6-v7 architecture, one fresh path completed and two preserved valid first attempts failed:

- GPT-5.4 mini xhigh: FIRST_ATTEMPT_FAIL at S10A (`$.decisions[4].source_record_ids[0]`: expected `A-S02`, observed `A-S04`).
- GPT-5.4 mini medium: COMPLETE_PASS through S90; the final artifact is byte-identical to the R6-v7 S90 artifact.
- GPT-5.6 Luna medium: FIRST_ATTEMPT_FAIL at S30_B11 (`verdict` expected `clean`, observed `finding`; `expected_choice` expected null, observed string `current_exact_count`).

All 99 R7 PASS scores were byte-exact to the frozen expected payload. The 52-cell bravo path completed; alpha stopped after its first valid failure; Charlie completed all W30 peers and then stopped before downstream waves.

The frozen renderer identities matched 98 observed per-call packet/storage receipts with zero mismatches; the three S10A platform receipts retained only the prelaunch identity. Direct app-server receipts bind both the renderer storage and the semantic provider-visible payload after removal of exactly one terminal storage LF. Response contracts, scorers, oracles, reducers, routing, configuration, and phase order remained frozen.

R6-v7 itself made zero new subject calls: it deterministically finalized preserved earlier-revision evidence. Therefore the per-cell table in `r6_vs_r7_comparison.json` compares each R7 first attempt to the frozen R6-v7 oracle/architecture, while explicitly marking the absence of a paired R6-v7 empirical call.

Bounded verdict: **R6_ALL_PATH_PASS_NOT_REPRODUCED_BY_SINGLE_FRESH_R7_REPLICATE**. This is evidence against one-run all-path repeatability, not a probability estimate and not proof that the R6 outcome was a fluke.
