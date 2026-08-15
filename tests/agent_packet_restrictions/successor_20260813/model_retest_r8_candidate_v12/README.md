# R8 candidate v12 — persisted-render and safe-stop facade

Candidate ID: `PW-R8-ITERATIVE-FIX-TWO-CLEAN-RUNS-20260815.CANDIDATE-12`.

Candidate-v12 is the smallest generic pre-dispatch render-validation and safe-boundary transaction facade over immutable candidate-v11. It preserves the exact 97 semantic cells, 291-call complete matrix, provider-visible semantic packets, expected oracles, reducers, scorers, receipt-v4/capture-v3 interface, frozen Plans fixture, schedule, and three routes. No answer-, cell-, model-, route-, or expected-answer-specific acceptance logic is added.

## Pre-dispatch persisted-render gate

Before the subject process may start, the controller reopens `<execution_root>/<slot>/rendered/<cell>.txt` as a regular non-link with `lstat` plus `O_NOFOLLOW`, independently invokes the inherited harness renderer, and requires the persisted bytes to equal the independently rendered bytes. The storage must have exactly one terminal LF. It reopens the same path and requires stable identity, metadata, and bytes before admitting process start.

The canonical `pw-r8-pre-dispatch-render-observation-v1` record binds the run, slot, cell, execution root, persisted storage, provider-visible payload, independent expected render, stable stat identity, and `observation_phase=BEFORE_SUBJECT_PROCESS_START`. Missing, two-LF, byte-drifted, and nonregular rendered storage is rejected before `Popen`; the correct exact one-LF storage is admitted.

## Safe-boundary transaction

The generic `pw-r8-cell-transaction-state-v1` state machine has only two safe stop boundaries:

- `BEFORE_START_SAFE / SAFE_STOP_BEFORE_START`, before any subject process starts;
- `FULL_CHAIN_SEALED_SAFE / SAFE_STOP_AFTER_CURRENT_CELL`, after receipt, completion, capture, score, cell validation, and exact-chain reopen all succeed.

Once a child starts, a stop signal during the child, after the child envelope, or while receipt/completion/capture/score/validation evidence is incomplete yields `MUST_SEAL_CURRENT_CELL`. The controller may not dispatch the next cell while sealing. Completion-observation-v2 records are persisted in `RECEIPT_AND_COMPLETION_PERSISTED_UNSEALED / MUST_SEAL_CURRENT_CELL`; later evidence completes the transaction. This interface does not authorize retry, replacement, partial credit, or schedule advance.

## Goal binding, closure, and custody

Candidate-v12 is directly bound to `tests/agent_packet_restrictions/successor_20260813/r8_goal_loop_buster_addendum_v1.json` at SHA-256 `d3f901e724d785ba3d053a961a8559b6f5b5add7e7b660a9fbb503586ad822d0` and 4468 storage bytes. The binding key order is exactly `path`, `storage_sha256`, `storage_bytes`. The verifier requires a regular non-link, stable read, canonical minified UTF-8 JSON, exactly one terminal LF, schema `pw-r8-goal-loop-buster-addendum-v1`, the R8 identity family, and status `ACTIVE_BINDING_ACCEPTANCE_CRITERIA`.

Before importing candidate-v11 or the candidate-v12 controller, the harness validates an exact sorted 73-file transitive runtime closure:

- candidate-v11's 61-file transitive closure;
- four candidate-v11 facade identities: harness, architecture, holdouts, and deterministic preflight;
- all seven candidate-v12 controller-owned files.
- the one external goal-acceptance custody addendum.

Every row requires a regular non-link with exact SHA-256 and byte count. Live `Plans/**` paths are forbidden; all eleven Plan-derived source paths remain beneath the frozen fixture.

The exact non-audit candidate bundle contains 12 files: this five-file facade plus `controller_contract.json`, `process_completion_contract.json`, `r8_process_controller.py`, `r8_run_verifier.py`, `r8_subject_task_driver.py`, `revision_lineage.json`, and `verifier_contract.json`. `independent_preseal_audit.json` is excluded and does not exist in this build lane.

The native custody chain uses revision-lineage-v9, audit-v2, external-freeze-manifest-v6, and run-contract-v6. Each carries the same direct addendum binding. The verifier derives all 73 runtime dependency rows directly from the architecture closure; no redundant runtime-closure count contract exists. Existing terminal `candidate_freeze_manifest` bindings keep their prior shape because the manifest storage hash transitively commits the direct addendum binding. A later canary must use `pw-r8-controller-canary-contract-v1` and `pw-r8-controller-canary-terminal-v1`; it has zero qualification credit.

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

Preflight makes zero subject calls, zero provider calls, and zero live Plans reads. Static success is not empirical model success, two-run qualification, production enforcement, release readiness, safety certification, or permission to compile Plans. No freeze, independent audit, launch, run, or evidence artifact is produced here.
