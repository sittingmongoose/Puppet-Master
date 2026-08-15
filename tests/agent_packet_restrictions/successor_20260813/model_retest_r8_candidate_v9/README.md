# R8 candidate v9 — direct receipt-v4 scoring adapter

Candidate ID: `PW-R8-ITERATIVE-FIX-TWO-CLEAN-RUNS-20260815.CANDIDATE-9`.

Candidate-v9 is a create-only closure-gated facade over immutable candidate-v8. It changes exactly one generic transport interface: the semantic scorer now accepts the operative completed direct subject receipt schema `pw-r8-direct-appserver-subject-receipt-v4` and its dispatch-bound fields. The capture envelope remains `pw-r8-subject-capture-envelope-v3`. Stale receipt schema v3 and every unknown direct receipt schema fail closed.

All 97 provider semantic prompts, semantic oracles, subject-cell schedule entries, reducers, frozen fixtures, response schemas, and semantic acceptance rules remain unchanged. A transport-valid receipt does not grant semantic credit: the existing exact JSON, closed-option/type/enum, expected-value, prohibited-activity, and conformance checks still run, and a semantic mismatch remains a permanent subject `FAIL`.

## Generic receipt adapter

The adapter requires the exact ordered 55-key receipt-v4 object settled with the controller. It retains strict candidate, run, slot, cell, execution-root, thread, and turn identity. It validates:

- exact canonical receipt storage bytes including one terminal LF;
- the capture-v3 envelope's hash and byte binding to that actual receipt storage;
- current render-storage and semantic-packet hashes and byte counts;
- exact `dispatch_schedule` object keys `path,storage_sha256,storage_bytes`, fixed path `dispatch_schedule.json`, lowercase 64-hex hash, and positive byte count;
- lowercase 64-hex dispatch nonce;
- exact ordered dispatch-binding keys `schema_id,candidate_id,run_id,slot,cell,dispatch_nonce,semantic_packet_sha256,semantic_packet_bytes,dispatch_schedule_sha256,dispatch_schedule_bytes` and all cross-field identities;
- admission-to-dispatch identity, dispatch-wrapper binding shape, raw final-message binding, raw prohibited-item binding, single-text binding, and exact normalization derivation.

The implementation is generic. It contains no cell-, route-, model-, or answer-specific acceptance branch.

## Closure custody

Before candidate-v8 is imported, the harness validates an exact sorted 50-file runtime closure: candidate-v8's complete 46-file external closure plus the four immutable v8 facade files actually read or imported by v9 (`r8_harness.py`, `architecture_contract.json`, `counterfactual_holdouts.json`, and `deterministic_preflight_report.json`). Every file must be a regular non-link with exact SHA-256 and byte count.

Static reconstruction and Python open-event tracing prove that all 50 existing external opens beneath `successor_20260813/` are declared. No live `Plans/**` path is admitted; all eleven Plan-derived source files remain beneath the frozen fixture. Candidate-v9-local files remain candidate-custody bytes, not runtime dependencies.

The 65 candidate-v8 holdout objects are preserved exactly. Six in-memory interface holdouts are added:

```text
CF-R8-66 valid receipt-v4 / capture-v3 interface passes
CF-R8-67 stale receipt-v3 schema rejects
CF-R8-68 unknown receipt schema rejects
CF-R8-69 altered dispatch binding rejects
CF-R8-70 altered actual receipt-storage binding rejects
CF-R8-71 generic semantic mismatch remains subject FAIL
```

## Pure command surface

```text
PYTHONDONTWRITEBYTECODE=1 python3 r8_harness.py preflight
PYTHONDONTWRITEBYTECODE=1 python3 r8_harness.py list-cells
PYTHONDONTWRITEBYTECODE=1 python3 r8_harness.py render --cell CELL --slot SLOT --execution-root ABSOLUTE_RUN_EXECUTION_ROOT
PYTHONDONTWRITEBYTECODE=1 python3 r8_harness.py expected --cell CELL --slot SLOT --execution-root ABSOLUTE_RUN_EXECUTION_ROOT
PYTHONDONTWRITEBYTECODE=1 python3 r8_harness.py score --cell CELL --slot SLOT --execution-root ABSOLUTE_RUN_EXECUTION_ROOT
PYTHONDONTWRITEBYTECODE=1 python3 r8_harness.py measure --cell CELL --slot SLOT --execution-root ABSOLUTE_RUN_EXECUTION_ROOT
PYTHONDONTWRITEBYTECODE=1 python3 r8_harness.py reduce --stage STAGE --slot SLOT --execution-root ABSOLUTE_RUN_EXECUTION_ROOT
```

Preflight makes zero subject calls, zero provider calls, and zero live Plans reads. Static success is not empirical model success, two-run qualification, production enforcement, release readiness, safety certification, or permission to compile Plans. No freeze, independent audit, or launch is performed here.
