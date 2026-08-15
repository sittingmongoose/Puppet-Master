# R8 candidate-18 — pre-import authority gate

Candidate ID: `PW-R8-ITERATIVE-FIX-TWO-CLEAN-RUNS-20260815.CANDIDATE-18`

Candidate-18 is the load-order-only successor to standalone candidate-17. It preserves the candidate-local controller, independent verifier, single-process `run-cell` transaction, exact causal-prefix and terminal verification, 65-row closure, three routes, frozen 97-cell semantics, receipt-v4, capture-v3, 25-key dispatch attempt, and 39-key completion.

The only operative change is the order of prelaunch control loading in both the controller and verifier. Active control loading now uses candidate-local standard-library code in this order:

1. `lstat` and read only `run_contract.json`; strictly parse its exact canonical schema and minimal run-kind, route, launch, and first-attempt envelope.
2. Derive the one predeclared freeze-manifest binding from that contract.
3. Reopen and validate the exact checkpoint-bound candidate, future passing audit, progress, addendum, deterministic preflight, qualification contract, and all 65 dependency rows. Every dependency must be a current regular nonlink whose bytes equal both the manifest row and the Git blob at the manifest’s current-`HEAD` checkpoint.
4. Only after recording `freeze_dependency_gate_pass`, read `ordered_schedule.json` and `dispatch_schedule.json`. Validate their storage bindings, the frozen schedule hash, exact routes, exact task inventory, and deterministic nonces using candidate-local code.
5. Only after recording `static_schedule_route_nonce_gate_pass` may the external semantic schedule factory be consulted. The resulting schedule must equal the already admitted static schedule exactly.

Absent or malformed run authority, missing manifests, `PRESEAL_FAIL`, wrong manifest hashes, stale `HEAD`, missing or mutated dependencies, and wrong route, schedule, or nonce evidence all reject with zero external dependency execution events. A valid synthetic post-audit authority records the full freeze/dependency gate and static envelope before the first external semantic event.

The predecessor receipt is the exact candidate-17 failed audit `d9f3e3e373c112a89aa6dd16aa45b7b68eca975ef57e07c42f05136ac7c93526/15008`, whose real controller and verifier traces execute the v9 harness before discovering the absent run contract and never reach freeze validation. Candidate-18 binds progress `374a62a4549dd11134424e43508524e24af9542e11d72bbffb4519746b10d401/4588`, the goal addendum `d3f901e724d785ba3d053a961a8559b6f5b5add7e7b660a9fbb503586ad822d0/4468`, and creation checkpoint `fe1818f01d8d4f95e3d89d75c1bf6de43c3f0670`.

The future freeze path remains:

`tests/agent_packet_restrictions/successor_20260813/r8_candidate_v18_freeze_manifest.json`

Run kinds remain exactly `ZERO_CREDIT_THREE_ROUTE_CANARY` and `QUALIFICATION_MATRIX`. The canary authority remains exactly the first frozen cell once on alpha, bravo, and charlie; run-contract qualification credit is zero. Prelaunch run-root files remain exactly `run_contract.json`, `ordered_schedule.json`, and `dispatch_schedule.json`.

Deterministic checks retain all 65 dependency deletion and mutation cases, 24 authority cases, 48 exact-prefix cases, 20 named/live zero-call cases, C13/v14/v15/v16 regressions, 97/291/582 terminal constructibility, and 97/97 render/oracle/schedule identity. Candidate-18 additionally executes the 12-case order suite independently in the controller and verifier.

Future validation commands:

```bash
PYTHONDONTWRITEBYTECODE=1 python3 tests/agent_packet_restrictions/successor_20260813/model_retest_r8_candidate_v18/r8_run_verifier.py validate-freeze \
  --manifest tests/agent_packet_restrictions/successor_20260813/r8_candidate_v18_freeze_manifest.json

PYTHONDONTWRITEBYTECODE=1 python3 tests/agent_packet_restrictions/successor_20260813/model_retest_r8_candidate_v18/r8_run_verifier.py validate-preflight
```

This candidate creates no audit, freeze, progress, run control, subject output, canary, empirical evidence, qualification credit, or readiness claim.
