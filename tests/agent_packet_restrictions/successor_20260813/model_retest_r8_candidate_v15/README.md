# R8 candidate 15 — exact-prefix verifier boundary

Candidate ID: `PW-R8-ITERATIVE-FIX-TWO-CLEAN-RUNS-20260815.CANDIDATE-15`.

This is an unaudited, unfrozen, zero-call successor to failed candidate 14. It binds checkpoint `85c2d5fd5a537f514c3ce13d15d51353156c376d`, the loop-buster addendum, the byte-exact candidate-14 PRESEAL_FAIL audit `fdec429e7b7773bfc6af8f2227fa780096bada40bfcfd0832fa58bbabbce2e80`/12444, and progress assessment `64665b2978248edbe94b265af9e97e8987c86694fca21fc674287c381f016b61`/4882. It does not authorize freeze, launch, qualification, or release.

## One launch transaction

`run-cell` is the only subject-launch interface. There is no `run-subject`, split prepare/prestart command, or launch-resume mode.

One still-running process performs this order:

1. Emit a create-only transaction-claim proposal containing a commitment to process-local randomness.
2. Read an exact canonical ACK from stdin and reopen the exact durable claim.
3. Repeat proposal, ACK, and reopen for the frozen render and exact 25-key dispatch-attempt.
4. Reopen claim, render, attempt, full prior causal chains, and exact run authority immediately before the sole provider-call site.
5. Make the one first-attempt call.
6. Repeat proposal, ACK, and reopen for receipt-v4, capture-v3, score, and exact 39-key completion-v3, in that order.
7. Recompute and reopen the whole chain. Completion is last. Schedule advancement remains forbidden until the independent verifier passes.

Concurrent processes propose byte-distinct claims; create-only persistence can ACK only one. Any later `run-cell` invocation that sees a claim or other cell evidence rejects. A durable attempt without a receipt is permanently invalid and cannot relaunch. Receipt, capture, and score prefixes remain deterministically recoverable through the zero-call commands.

The controller writes no files. Every durable write is an external `apply_patch` create-only action whose exact hash and byte count must be ACKed and independently reopened.

## Authority and verification

Future freeze authority is an exact 13-key closed-world manifest. It requires the exact eight-file post-audit bundle, an exact-schema independent `PRESEAL_PASS` with `LOOP_BROKEN`, the addendum, failed-parent audit and progress bindings, runtime dependency closure, deterministic preflight, and qualification contract. Run authority is an exact 20-key contract with exact routes, schedules, 291 unique task/nonces, an exact authorized-task list, and a closed run inventory. A zero-credit canary authorizes exactly the first frozen cell on each route; qualification runs authorize all 291 tasks. Missing, extra, reordered, retagged, stale, or PRESEAL_FAIL authority rejects.

`r8_run_verifier.py` does not import the controller. Before any cell PASS or identity collection, it enumerates the entire execution root and admits only the exact causal file and directory set. The requested slot must contain exactly the sealed prefix through the requested cell. Other slots may contain only a contiguous, fully consumed prefix. Future, partial, wrong-slot, unknown, malformed, extra, duplicate, symlink, and nonregular objects reject. Every admitted claim, render, attempt, receipt wrapper and rollout, capture, score, completion, and causally due reducer artifact is independently reopened and recomputed. The device/inode/size/mtime inventory is then reopened and must remain identical before PASS.

Artifact validation uses the exact deterministic emission order. Path, matrix, and two-run terminals apply the same whole-root ownership rule. Qualification credit exists only in this independent verifier and only for an exact `QUALIFICATION_MATRIX`. Across two runs, run IDs, task IDs, dispatch nonces, thread IDs, turn IDs, and rollout paths must be disjoint.

## Zero-call preflight

`python3 -B r8_clean_room_controller.py self-test` executes the exact named cases: `ZC-PRED-001`, `ZC-SUCC-001`, `ZC-REC-002` through `ZC-REC-010`, and `ZC-LIVE-001`. The live case yields across a real local subprocess/session boundary and then derives and reopens receipt, capture, score, and completion with zero provider calls. It also executes all eight historical normalized signatures and the four candidate-13 blocker regressions.

The preflight also executes the exact candidate-14 counterexample: v14 accepts a valid current cell plus an identity-only future receipt and authorizes schedule advance; v15 rejects the same receipt before identity collection. Distinct future claim/render/attempt/receipt/capture/score/completion, premature artifact, wrong-slot, unknown, malformed, duplicate, symlink, and nonregular injections reject. Legitimate cell and artifact boundaries plus 97-cell path, 291-cell matrix, and 582-cell two-run structures remain constructible.

The stored preflight is deterministic, byte-addressed, makes zero subject/provider/network calls, performs zero filesystem writes, observes no live `Plans/**` reads, and claims no empirical result.
