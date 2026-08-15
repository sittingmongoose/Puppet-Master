# R8 candidate 13 clean-room controller

Candidate ID: `PW-R8-ITERATIVE-FIX-TWO-CLEAN-RUNS-20260815.CANDIDATE-13`.

This is an unaudited, unfrozen, zero-call candidate. It does not authorize a canary, matrix, empirical credit, qualification, or release claim.

The controller is a no-write state machine. It reads and reopens exact evidence, computes canonical bytes, and returns create-only persistence proposals. A trusted outer caller may apply those bytes with `apply_patch`; the controller itself never writes, overwrites, repairs, creates temporary files, or creates caches. Completion-v3 is proposed last, and schedule advancement remains forbidden until the independent verifier reopens the entire exact chain.

The normal cell flow is:

1. `prepare-cell` emits the exact rendered storage and 25-key dispatch-attempt fuse.
2. External `apply_patch` creates those paths only if absent.
3. `validate-prestart` reopens the run/freeze/addendum/schedules, exact render and attempt, every prior same-slot PASS seal, the absence of downstream evidence, and run-wide nonce/thread/turn uniqueness.
4. `run-subject` is future-only. It uses the run contract's frozen, predeclared launch authority and the isolated candidate-v9 app-server primitive through a v13-specific admission path. There is no per-cell authorization sidecar. This command was not exercised while building or testing the candidate.
5. External `apply_patch` creates the emitted receipt-v4.
6. `emit-capture`, `score-cell`, and `emit-completion` are deterministic zero-subject-call transitions. Each existing exact artifact is reopened; mismatch is terminal and never repaired.
7. External `apply_patch` creates completion-v3 last.
8. `r8_run_verifier.py validate-cell` independently reopens the full chain. Only a sealed PASS score may advance the schedule.

`emit-artifact` and `validate-artifact` expose the unchanged deterministic reducer transitions. `validate-path`, `validate-matrix`, and `validate-two-runs` reopen the complete 97-cell route, 291-cell matrix, and two unchanged sequential matrices respectively.

Recovery is fail-closed. A process-loss recovery that finds a dispatch-attempt without a receipt is permanently invalid and never relaunched. Once the exact receipt exists, capture, score, and completion are deterministically resumable with zero subject calls. Existing exact artifacts may be continued; mismatched artifacts are preserved as failures.

The local zero-call command is:

```text
python3 -B r8_clean_room_controller.py self-test
```

It executes the byte-addressed v12 A02 predecessor failure, the v13 successor recovery over the same durable receipt, ZC-REC-002 through ZC-REC-010, a real delayed fragmented local emitter with injected SIGTERM, all historical normalized control-plane signatures, the closed-world dependency gate, and the 97/97 render/oracle/schedule identity gate. The recovery cases use an isolated in-memory create-only state and the same receipt projection, scorer, completion constructor, prefix classifier, and reopen validators as the durable controller path. A Python open-event audit records every successor-root file opened while those semantic gates execute and rejects any undeclared dependency or live `Plans/**` path. The suite makes zero subject, provider, and network calls.
