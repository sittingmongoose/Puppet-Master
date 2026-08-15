# R8 candidate-16 — authority constructibility only

Candidate ID: `PW-R8-ITERATIVE-FIX-TWO-CLEAN-RUNS-20260815.CANDIDATE-16`

Candidate-16 is a narrow successor to candidate-15. It changes only the freeze and run-authority boundary exposed by the preserved v15 post-audit constructibility failure. It does not change provider-visible semantic packets, oracles, scorer, reducers, the 97-cell schedule, the three routes, receipt-v4, capture-v3, the 25-key attempt, the 39-key completion, the one-process `run-cell` transaction, or the independent exact-prefix material verifier.

The freeze manifest has one canonical future path:

`tests/agent_packet_restrictions/successor_20260813/r8_candidate_v16_freeze_manifest.json`

The manifest carries a checkpoint commit as data. At validation time the independent verifier requires that commit to equal the current local `HEAD`, then uses read-only Git object lookup to prove that every bound candidate, audit, and progress file is byte-identical both in the working tree and in that commit. Unrelated dirty files are outside the decision. The source contains no predicted future audit hash, progress hash, or freeze-time commit.

The future audit and progress paths are exact:

- `tests/agent_packet_restrictions/successor_20260813/model_retest_r8_candidate_v16/independent_preseal_audit.json`
- `tests/agent_packet_restrictions/successor_20260813/r8_progress_assessment_candidate_v16_pre_freeze_v1.json`

The audit must be canonical strict JSON with the exact v16 audit schema, `PRESEAL_PASS`, `LOOP_BROKEN`, zero calls, no blockers, and byte identities for the seven pre-audit candidate files. The progress must be canonical strict JSON with the exact progress schema, bind the actual audit hash and bytes, record `LOOP_BROKEN`, and authorize only the next freeze-then-canary phase. The freeze binds the seven files plus audit, progress, addendum, v15 failure lineage, exact inherited 64-row dependency closure, deterministic preflight, and qualification contract. The freeze never binds itself.

Run authority has one exact vocabulary:

- `ZERO_CREDIT_THREE_ROUTE_CANARY`: exactly the first frozen cell, `S10A_DECISION_A01`, is authorized once in each of `slot-alpha`, `slot-bravo`, and `slot-charlie`; qualification credit is zero.
- `QUALIFICATION_MATRIX`: all 291 exact tasks are authorized; credit remains zero in the run contract and can be earned only by the independent completed-matrix verifier.

The prelaunch execution root contains exactly `run_contract.json`, `ordered_schedule.json`, and `dispatch_schedule.json`. There is no separate canary contract or caller-minted launch file. The 291 task IDs and nonces are closed-world and unique. Nonces use the v16 domain-separated deterministic derivation bound to run ID, slot, and cell. All authorized calls require a fresh task/thread, first attempt, retry count zero, `best_of=false`, and `replacement_result=false`.

Future freeze validation:

```bash
PYTHONDONTWRITEBYTECODE=1 python3 tests/agent_packet_restrictions/successor_20260813/model_retest_r8_candidate_v16/r8_run_verifier.py validate-freeze \
  --manifest tests/agent_packet_restrictions/successor_20260813/r8_candidate_v16_freeze_manifest.json
```

Future prelaunch admission validation for one authorized canary cell:

```bash
PYTHONDONTWRITEBYTECODE=1 python3 tests/agent_packet_restrictions/successor_20260813/model_retest_r8_candidate_v16/r8_run_verifier.py validate-admission \
  --run-id PW-R8-C16-CANARY-01-20260815 \
  --execution-root tests/agent_packet_restrictions/successor_20260813/model_retest_r8_candidate_v16_canary_01 \
  --slot slot-alpha --cell S10A_DECISION_A01
```

Only after freeze and admission independently pass may the operator invoke the interactive controller `run-cell`. It emits one canonical create-only apply-patch proposal, waits for an exact cryptographic ACK and durable reopen, then advances through claim, render, attempt, the single provider call, receipt, capture, score, and completion-last. Process death after attempt and before receipt is permanently invalid and cannot be relaunched.

Current validation is deterministic zero-call evidence only. No audit, freeze, canary, subject task, provider call, empirical credit, qualification, or readiness claim is created here.
