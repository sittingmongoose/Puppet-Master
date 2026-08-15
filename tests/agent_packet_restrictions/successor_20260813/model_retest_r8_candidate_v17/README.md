# R8 candidate-17 — standalone closure-bound clean room

Candidate ID: `PW-R8-ITERATIVE-FIX-TWO-CLEAN-RUNS-20260815.CANDIDATE-17`

Candidate-17 is a standalone successor to candidate-16. Its controller and independent verifier contain their operative implementations in this seven-file candidate bundle. They do not import, execute, or load a candidate-15 or candidate-16 controller, verifier, or preflight at runtime. Only isolated semantic renderer, oracle, scorer, reducer, subject-call primitive, frozen fixtures, and the preserved v14 predecessor reproducer remain external, and every exact external file is declared in the closure.

The candidate changes only the two custody blockers from the failed candidate-16 audit. Semantic packets, oracles, scorer, reducers, the exact 97-cell schedule, routes, single-process `run-cell` transaction, causal-prefix verifier, receipt-v4, capture-v3, 25-key dispatch attempt, and 39-key completion remain unchanged.

The future freeze path is exactly:

`tests/agent_packet_restrictions/successor_20260813/r8_candidate_v17_freeze_manifest.json`

The freeze embeds all 65 exact sorted dependency rows, including path, SHA-256, bytes, and roles. At validation, the independent verifier:

1. Requires the manifest checkpoint to equal current local `HEAD`.
2. Requires the manifest rows to equal the candidate’s complete expected set exactly.
3. Recomputes the row inventory hash and byte count.
4. Reopens every current dependency with no symlink following and requires a stable regular file.
5. Reopens every matching blob through read-only Git object lookup at the checkpoint.
6. Requires current bytes, checkpoint bytes, and the row hash/byte count to agree exactly.

Missing, extra, reordered, duplicate, tampered, uncommitted, symlink, and nonregular dependencies reject. The same full validation runs through `_load_controls` before admission or `run-cell`, so a dependency cannot drift between freeze and launch. The candidate seven-file bundle plus later passing audit are independently checkpoint-bound. Audit and progress hashes are read from the future manifest rather than predicted by source; the manifest is not self-bound.

The deterministic suite locally reproduces candidate-16 accepting a closure summary while 63 of its 64 targets are absent, and accepting two distinct wrong committed dependency byte strings. Candidate-17 rejects all three, iterates deletion and committed-byte mutation across every one of its 65 closure rows, and covers malformed row shapes and file kinds. Its observed import/open trace is restricted to the candidate bundle plus declared rows, with no live `Plans/**` reads.

Run kinds remain exactly `ZERO_CREDIT_THREE_ROUTE_CANARY` and `QUALIFICATION_MATRIX`. A canary authorizes only `S10A_DECISION_A01` once on alpha, bravo, and charlie; run-contract qualification credit is zero. Prelaunch control files remain exactly `run_contract.json`, `ordered_schedule.json`, and `dispatch_schedule.json`.

Future validation commands:

```bash
PYTHONDONTWRITEBYTECODE=1 python3 tests/agent_packet_restrictions/successor_20260813/model_retest_r8_candidate_v17/r8_run_verifier.py validate-freeze \
  --manifest tests/agent_packet_restrictions/successor_20260813/r8_candidate_v17_freeze_manifest.json

PYTHONDONTWRITEBYTECODE=1 python3 tests/agent_packet_restrictions/successor_20260813/model_retest_r8_candidate_v17/r8_run_verifier.py validate-preflight
```

Only after an independently passing audit, exact freeze, and exact admission may an operator invoke interactive `run-cell`. This candidate creates no audit, freeze, progress, run control, canary, task, empirical evidence, qualification credit, or readiness claim.
