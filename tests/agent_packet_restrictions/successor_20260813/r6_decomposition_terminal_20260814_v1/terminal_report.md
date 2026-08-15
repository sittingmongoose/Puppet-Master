# R6 prompt-complexity remediation terminal

Terminal: **VALID_COMPLETED_FROZEN_SNAPSHOT_MATRIX**.

All three configured paths now reach “bounded_causal_simulation_pass” under the same cumulative R6-v7 architecture:

- GPT-5.4 mini xhigh: PASS
- GPT-5.4 mini medium: PASS
- GPT-5.6 Luna medium: PASS

This is not a claim that every historical attempt passed. The ledger preserves 104 first-attempt subject calls: 83 PASS, 15 FAIL, and 6 INVALID with no empirical credit. There were zero retries, best-of calls, or replacement results. R6-v5’s three S70 failures and R6-v6’s xhigh S90 failure remain failures; later general revisions changed who owns those fields.

## What made the matrix complete

The final architecture keeps model ownership only for bounded semantic judgments: per-edge S10B verdicts, small S30 comparisons, genuinely semantic S50 edges, and one-role/one-edge S60 specialist verdicts. Those contributing model-owned paths pass across all three configurations.

Deterministic code now owns unsupported-candidate exclusion, direct authority projection and boolean/string typing, stable joins/order, JSON Patch construction, cryptographic hashes, byte counts, predecessor bindings, finding closure, unsupported-edge absence, and terminal projection. This is the evidence-driven simplification the experiment was intended to test; it is not answer substitution.

Counterfactual protections include changed IDs and order, duplicate/multiple/zero targets, a fully consistent renamed/reordered chain, predecessor-hash corruption, boolean-as-string corruption, retained unsupported targets, and stale specialist closure. The finalizer source contains none of the frozen edge IDs, finding IDs, or terminal hashes used as answers.

## Key evidence

- Frozen Plans fixture: `frozen_plans_snapshot_20260814_v1/provenance_manifest.json`
- Final revision freeze: `model_retest_r6_decomposed_v7/revision_freeze_manifest.json`
- Final deterministic preflight: `model_retest_r6_decomposed_v7/deterministic_preflight_report.json`
- Final audit: `model_retest_r6_decomposed_v7/prelaunch_audit.json`
- Three-slot completion: `model_retest_r6_decomposed_v7/execution/R6V7-W90.completion.json`
- Detailed call accounting: `r6_decomposition_terminal_20260814_v1/subject_call_accounting.json`
- Before/after diagnostics: `r6_decomposition_terminal_20260814_v1/measurement_summary.json`
- Preserved process failures: `r6_decomposition_terminal_20260814_v1/process_repair_history.json`

## Boundary

The result applies only to the unfinished throwaway frozen snapshot and the tested causal architecture. It does not prove current Plans, the entire Planning Wizard audit process, production runtime enforcement, release readiness, safety certification, general weak-model safety, or permission to compile Plans.

