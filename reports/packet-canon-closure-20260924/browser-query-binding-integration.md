# Browser selected query binding — integration in progress

Status: reviewed static companion installed; focused tests PASS; central gate
carry review and full contract check pending. No native Browser proof.

The helper now decodes the selected original query bytes once, validates that
record, checks the digest of those exact bytes and joins the command and result
to it. A separately co-mutated query object can no longer bypass the retained
original. Missing or invalid originals fail closed. All 12 unrelated command
shapes retain their existing behavior.

Frozen evidence directory:
`/home/sittingmongoose/PM-Experiments/packet-parallel-20260925-WF6UrR/case-reconciliation/browser-representation-query-binding-correction-02/`.
Different-Sol `REVIEW-DIFFERENT-SOL-V3.md` SHA-256
`045a1de66288f0de00b105a9a5149c2c3a3717823168b7a3557e23bb21fae5d2`;
freeze `freeze-v3-20260926T0659Z/COORDINATOR-FREEZE.md` SHA-256
`c1764eb5dbe607617294323f9d26de7d2c8da69fa3587c2dd6001daa3bb9a088`.

Installed schema, current fixtures and helper exactly match that freeze.
Initial installed tests failed because the baseline fixture path pointed to the
external author staging directory. Root retained all baseline assertions by
adding the unchanged canonical prior fixture as named test data under
`tests/fixtures/browser_representation_query_prior.json`, SHA-256
`a37b54ae9fb75bb43b8d602b8d6003968f49b9a478ecbedf3d6d4a6d232d9ff8`.
The test's sole change is that installed fixture path; resulting test SHA-256
`247405caef211ec44892b9e80dd92374156ba15b77fb7fa7121cdaa9ec378c37`.
Root ran `python3 -m unittest tests.test_pm_browser_representation_query_binding`:
37 tests PASS, with no skipped baseline comparisons.
The installed combined query-binding, Settings, Search and Browser-capture suite
also passes all 161 tests. Central gate enrollment remains pending separately.

Selected original bytes remain an explicit trusted static input; authentic
native custody, page-generation revalidation at use, handlers and GUI effects
remain unproved. No command, event or product policy is created by this repair.
