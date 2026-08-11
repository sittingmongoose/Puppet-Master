# Preflight status — method V2

Status: `READY_FOR_USER_MODEL_SELECTION`  
Subject-model calls: `0`  
Provider subprocesses launched by this lane: `0`  
Credentials read by model-launch path: `0`

## Frozen preparation

- Accepted restriction contract reconstructed from the active ledger without compiling it.
- Dirty-tree and exclusive-write boundary recorded.
- Closed-world inventory frozen at 54 source-linked rows:
  - 51 `blocked_production_implementation`
  - 2 `isolated_contract_simulation`
  - 1 `runnable_current_deterministic`
- Six semantic core cases frozen under one unchanged packet profile.
- V2 deterministic suite frozen at 50 checks: one known-good scorer case, 13 negative scorer mutations, and 36 contract fixtures.
- Twenty-two production integration tests are explicitly implementation-gated.
- Route-canary template, nine-call pilot, and sixty-call fleet rules are preregistered.

## Qualification history

V1 initially produced passing self-test receipts, then failed independent code audit. That is preserved as `CONTROL_PLANE_DEFECT`; it did not launch a model or provider call.

V2 corrected the stale-freeze, fail-open missing-object, rescore, identity, result-admission, reducer/coverage, exact-scoring, authorization-lineage, and path-redaction defects.

Final V2 controller receipts:

- freeze: `receipts/verify_freeze/verify_freeze-20260802T203122Z-2b0b1d5d.json`
- deterministic: `receipts/deterministic_canary/deterministic_canary-20260802T203125Z-b36a66ef.json`
- frozen input count: 14
- freeze digest: `5a6bc023f506259ea9fa57f669f38c4b2bd61975095ac963407729dd0ad1f7df`
- deterministic result: 50/50 pass

## Current blocker

The user has not yet supplied the exact subject routes. `inventory/model_matrix_status.v2.json` blocks route canary, pilot, and fleet before authentication/config reads or provider launch.

When the user supplies the models, the controller will:

1. freeze a newly versioned exact 8-low/2-high matrix with route, underlying model, variant, and reasoning configuration;
2. hash that authorized matrix into a new final freeze;
3. run one nonsemantic fresh-context identity canary per exact slot;
4. stop before semantic testing if any slot is unavailable, substituted, identity-ambiguous, or not genuinely distinct as required;
5. otherwise run the preregistered pilot and then the sixty-call fleet with zero hidden semantic retries.

No recommendation about weak-model semantic performance or production enforcement is available yet. All 51 real product surfaces remain implementation-gated regardless of isolated test outcomes.

## Shared-checkout boundary note

The HEAD and 1,202-path tracked dirty projection still match the original boundary exactly. The outside-root untracked projection increased by nine files while this lane was running; recent paths belong to the active planning ledger and separate Concepts/evidence work. This lane issued no outside-root write, but the checkout is shared, so the delta is recorded as concurrent external state rather than silently called unchanged. Subject testing will take a new immediate prelaunch snapshot and compare it after the run. See `receipts/boundary/preflight_outside_root_check-20260802T203408Z.json`.
