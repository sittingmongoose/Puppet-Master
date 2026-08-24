# R10 simple Goal prompts

Disposable empirical qualification lane for the bounded-context architecture that supersedes Prompt Complexity R9.

## Authority and scope

- Canonical `Plans/**`, planning ledgers, production runtime, and unrelated dirty work are read-only.
- This lane may establish empirical findings; it cannot establish production readiness, safety certification, or canonical Plan completion.
- All new R10 bytes live under this directory unless a later shared-helper exception is separately justified and recorded.
- Predecessor `r9g*`, `iteration_*`, and `r9_control_plane_stabilization_v1/**` artifacts are immutable diagnostic evidence.
- Qualification starts at `0/2` and requires two consecutive clean full matrices on identical frozen bytes and configuration.

## Correct subject boundary

- A fresh Codex test taker receives exactly one ordinary user prompt beginning naturally with `Create a goal that ...`.
- A fresh OMP test taker receives exactly one prompt beginning `/goal ...`.
- The same prompt carries only the bounded objective, admitted context, constraints, and typed output contract.
- Goal activation, in-Goal work, and terminal state are observed afterward; lifecycle choreography is not sent to the subject.
- Canary 001 attempted the preserved three Codex routes but was rejected by provider schema admission before inference and remains permanently 0/3. Canary 002 reached inference on alpha and returned the exact semantic result but never activated Goal; it remains permanently failed, and fail-stop left its suffix unlaunched. Canary 003 is a fresh one-row, zero-credit diagnostic that removes only provider-side output-schema attachment while retaining the inline/external schema and exact host validation. A Windows-native OMP conformance canary remains a hard gate after the Codex vertical slice, and OMP must be present in the frozen full-matrix route set.

See `PROGRESS.md` for alignment/churn checkpoints and `CUSTODY.json` for the initial repository boundary.

## Canary execution boundary

The successor runner performs a zero-subject atomic preflight and refuses launch unless every input is an exact blob in pushed `main` with `HEAD == origin/main`. Canary 003 has one row; its frozen verifier must still emit an immutable prefix-PASS gate before final acceptance:

```text
/usr/bin/python3 -B r10_runner.py \
  --manifest canary_003/manifest.json \
  --manifest-commitment canary_003/manifest.commitment.json \
  --evidence-root canary_003/r10-codex-canary-003-evidence
```

After capture, verification must execute from the snapshotted verifier, not the live checkout:

```text
/usr/bin/python3 -B canary_003/r10-codex-canary-003-evidence/frozen_snapshot/r10_verify.py \
  --evidence-root canary_003/r10-codex-canary-003-evidence \
  --write-receipts
```

Neither command may be rerun against an existing evidence root. A failed or controller-invalid first attempt remains consumed and earns zero credit. Canary 001 and Canary 002 evidence are historical inputs to diagnosis only and are never launch inputs for Canary 003.
