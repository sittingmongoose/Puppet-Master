# R8 candidate v11 — process-completion admission facade

Candidate ID: `PW-R8-ITERATIVE-FIX-TWO-CLEAN-RUNS-20260815.CANDIDATE-11`.

Candidate-v11 is the smallest process-completion-gated facade over immutable candidate-v9. It preserves the exact 97 semantic cells, 291-call complete matrix, provider-visible semantic packets, expected oracles, reducers, scorers, receipt-v4/capture-v3 interface, frozen Plans fixture, and three routes. Only candidate/run/dispatch bindings and one generic pre-receipt process-completion gate change.

## Completion gate

The harness will not admit a persisted receipt or capture unless `<execution_root>/invocation_completions/<slot>_<cell>.json` is a canonical `pw-r8-invocation-completion-observation-v1` object bound to the exact receipt bytes. The observation must establish both layers of completion:

- the fixed candidate-local driver actually started, was polled if live, exited with code zero, and had all stdout captured;
- any yielded outer unified-exec session was polled through its real terminal result, exited with code zero, and had all terminal-envelope stdout captured;
- the receipt and observation were persisted create-only with `apply_patch` only after that outer terminal admission;
- the fully captured driver stdout is exactly one canonical completed `pw-r8-direct-appserver-subject-receipt-v4` plus one terminal LF.

Missing observations and unexited, nonzero, empty, partial, malformed, noncanonical, or binding-mismatched stdout fail closed before receipt admission, capture, semantic scoring, or schedule advance. There is no answer-, cell-, model-, or route-specific acceptance branch.

The process controller itself performs no filesystem writes. Its `run` command synchronously polls the fixed driver and emits one canonical terminal envelope only after child exit-zero and full receipt validation. If the outer execution API yields a live session, the external controller must keep polling the same session through a real `exit_code=0`, reconstruct the full terminal envelope, and only then create the receipt and sidecar using `apply_patch`.

## Closure custody

Before importing candidate-v9 or the process controller, the harness validates an exact sorted 61-file runtime closure:

- candidate-v9's inherited 50-file closure;
- four frozen candidate-v9 harness facade files;
- the two transitively imported candidate-v9 driver/verifier baselines;
- all five candidate-v11 controller/process files: driver, process controller, verifier, controller contract, and process-completion contract.

Every row requires a regular non-link with exact SHA-256 and byte count. Static reconstruction and Python open-event tracing observed 61/61 bound paths, zero unbound paths, and zero live `Plans/**` paths. All eleven Plan-derived source files remain under the frozen fixture.

The 71 candidate-v9 holdout objects are preserved exactly. Four generic cases are added:

```text
CF-R8-72 exited-zero complete canonical receipt stdout is admitted
CF-R8-73 empty driver stdout is rejected
CF-R8-74 partial driver stdout is rejected
CF-R8-75 unexited driver stdout is rejected
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
PYTHONDONTWRITEBYTECODE=1 python3 r8_process_controller.py self-test
```

Preflight makes zero subject calls, zero provider calls, and zero live Plans reads. Static success is not empirical model success, two-run qualification, production enforcement, release readiness, safety certification, or permission to compile Plans. No freeze, independent audit, or launch is performed here.
