# R8 candidate-19 — centralized entrypoint authority gate

Candidate ID: `PW-R8-ITERATIVE-FIX-TWO-CLEAN-RUNS-20260815.CANDIDATE-19`

Candidate-19 is the entrypoint-gating-only successor to standalone candidate-18. It preserves the candidate-local controller and independent verifier, the single-process `run-cell` transaction, exact causal-prefix and terminal verification, 65-row checkpoint-bound closure, three routes, frozen 97-cell semantics, receipt-v4, capture-v3, 25-key dispatch attempt, and 39-key completion.

The only operative change is a single candidate-local `_authority_dispatcher` boundary in both controller and verifier. It reads and strictly validates the minimal run contract, full freeze/dependency Git custody, and exact static route/schedule/nonce envelope before `_v19_bootstrap_controls` may mint an opaque read-only validated-controls token. No other function may mint the token. Caller-created objects and direct token construction reject.

Runtime semantic schedule/module loading, scorer/reducer access, the future driver primitive, and create-only proposal projection require that token. `emit-artifact` and `validate-artifact` obtain controls before selecting a cell or invoking the reducer; neither has a pre-gate `schedule()` path. Direct helper, CLI, alias, reflection, caller-token, and monkeypatched-schedule probes reject before any external dependency event when authority is absent or invalid.

The executable entrypoint suite reopens the exact candidate-18 failed audit `5811cca14b949c289e020375d92c5e44d7b714b2aec1a0f03c61e11934b85d57/16720` and reproduces its two direct bypass traces. Candidate-19 then exercises the 20 audited controller/verifier runtime or helper entries with an absent run root, the six runtime CLI commands, six direct alias/reflection/token probes, and the dual eleven-class invalid-authority receipts. Valid authority records `freeze_dependency_gate_pass` and `static_schedule_route_nonce_gate_pass` before the first external semantic event.

Lineage is exact:

- goal addendum: `d3f901e724d785ba3d053a961a8559b6f5b5add7e7b660a9fbb503586ad822d0/4468`
- candidate-18 failed audit: `5811cca14b949c289e020375d92c5e44d7b714b2aec1a0f03c61e11934b85d57/16720`
- candidate-18 progress: `b155116f7eb4ea6df9a8a915b86437b97149be83c5d31b9965b452e5d4e4cf24/4482`
- creation checkpoint: `b888b46bb85fd97dfd3afc33a231695ef731aab7`

The future freeze path remains `tests/agent_packet_restrictions/successor_20260813/r8_candidate_v19_freeze_manifest.json`. Run kinds remain exactly `ZERO_CREDIT_THREE_ROUTE_CANARY` and `QUALIFICATION_MATRIX`; prelaunch run-root files remain exactly `run_contract.json`, `ordered_schedule.json`, and `dispatch_schedule.json`.

Read-only deterministic validation:

```bash
PYTHONDONTWRITEBYTECODE=1 python3 tests/agent_packet_restrictions/successor_20260813/model_retest_r8_candidate_v19/r8_clean_room_controller.py self-test
PYTHONDONTWRITEBYTECODE=1 python3 tests/agent_packet_restrictions/successor_20260813/model_retest_r8_candidate_v19/r8_run_verifier.py validate-preflight
```

This candidate creates no audit, freeze, progress, run control, subject output, canary, empirical evidence, qualification credit, or readiness claim.
