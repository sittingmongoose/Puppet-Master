# R8 candidate v7 — complete external runtime dependency closure

Candidate ID: `PW-R8-ITERATIVE-FIX-TWO-CLEAN-RUNS-20260815.CANDIDATE-7`.

This create-only successor fixes only `C6-PRESEAL-B003`. It retains candidate-v6/candidate-v5 provider semantic prompts, the 97-cell schedule, semantic oracles, reducers, frozen tension fixture, scoring, first-attempt policy, and weak-model-safe tension decomposition. It makes zero provider or subject calls and never reads live `Plans/**`.

The harness is a small closure-gated facade over the exact candidate-v6 harness. Before importing candidate-v6 or reading a predecessor fixture, it parses the candidate-local architecture contract and validates the exact sorted deduplicated runtime dependency closure. Every external dependency must be a regular non-link with the declared SHA-256 and byte count. Missing, extra, duplicate, reordered, tampered, or drifted rows fail closed before dynamic import.

The closure contains exactly 42 external files:

- 28 inherited candidate-v6 `FROZEN_BINDINGS` files;
- 11 unique frozen snapshot source files reopened by tension source-byte and excerpt validation;
- 3 candidate-v6 facade files used for semantic import and deterministic preflight inheritance (`r8_harness.py`, `architecture_contract.json`, and `counterfactual_holdouts.json`).

Candidate-v7-local files belong to the external candidate manifest's `candidate_files` inventory and are intentionally excluded from `runtime_dependencies`. Caller execution evidence beneath the authorized execution root is dynamic run input, not a frozen runtime dependency.

The preflight mechanically reconstructs the external read/import path set from candidate-v6 `FROZEN_BINDINGS`, the frozen tension fixture's `source_catalog`, and the three facade baseline paths. The sorted union must exactly equal the declared closure. A live path beginning `Plans/` is forbidden; all Plan-derived source bytes are under `frozen_plans_snapshot_20260814_v1/fixture/Plans/`.

The external controller may add the candidate-v7 typed dispatch-binding wrapper required to fix the separate rollout-replay defect. The harness's semantic render bytes do not change. The wrapper is outside semantic input and has the exact closed-world fields `schema_id`, `candidate_id`, `run_id`, `slot`, `cell`, unique predeclared lowercase-64-hex `dispatch_nonce`, semantic packet hash and byte count, and dispatch-schedule hash and byte count. The semantic packet and full model-visible wrapper are measured separately, and the canonical `dispatch_schedule.json` is also bound by the run contract.

Pure command surface:

```text
PYTHONDONTWRITEBYTECODE=1 python3 r8_harness.py preflight
PYTHONDONTWRITEBYTECODE=1 python3 r8_harness.py list-cells
PYTHONDONTWRITEBYTECODE=1 python3 r8_harness.py render --cell CELL --slot SLOT --execution-root ABSOLUTE_RUN_EXECUTION_ROOT
PYTHONDONTWRITEBYTECODE=1 python3 r8_harness.py expected --cell CELL --slot SLOT --execution-root ABSOLUTE_RUN_EXECUTION_ROOT
PYTHONDONTWRITEBYTECODE=1 python3 r8_harness.py score --cell CELL --slot SLOT --execution-root ABSOLUTE_RUN_EXECUTION_ROOT
PYTHONDONTWRITEBYTECODE=1 python3 r8_harness.py measure --cell CELL --slot SLOT --execution-root ABSOLUTE_RUN_EXECUTION_ROOT
PYTHONDONTWRITEBYTECODE=1 python3 r8_harness.py reduce --stage STAGE --slot SLOT --execution-root ABSOLUTE_RUN_EXECUTION_ROOT
```

The deterministic preflight inherits all 59 candidate-v6 holdouts and adds five closure cases: missing row, extra row, duplicate path, tampered binding, and no live Plans path. Static/deterministic success is not empirical subject-model success, two-run qualification, current-Plans evidence, production enforcement, release readiness, safety certification, or permission to compile Plans.
