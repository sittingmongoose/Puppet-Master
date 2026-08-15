# R8 candidate v8 — audited candidate-bundle custody

Candidate ID: `PW-R8-ITERATIVE-FIX-TWO-CLEAN-RUNS-20260815.CANDIDATE-8`.

Candidate-v8 is a create-only closure-gated facade over immutable candidate-v7. It preserves all 97 provider semantic prompts, semantic oracles, subject-cell schedule, reducers, frozen fixtures, scoring, first-attempt behavior, and weak-model-safe tension architecture. No semantic render byte changes.

Before candidate-v7 is dynamically imported, the harness validates an exact sorted 46-file external runtime closure. The closure is the complete candidate-v7 42-file closure plus four candidate-v7 files actually used by this facade: `r8_harness.py`, `architecture_contract.json`, `counterfactual_holdouts.json`, and `deterministic_preflight_report.json`. Every dependency must be a regular non-link with exact SHA-256 and byte count. Missing, extra, duplicate, reordered, tampered, or drifted closure rows fail closed. Candidate-v8-local files are candidate custody bytes, not runtime dependencies.

Preflight mechanically reconstructs the 46 paths from candidate-v7's embedded exact closure plus the four facade paths. Python open-event tracing proves every existing external file opened beneath `successor_20260813/` is declared. Live `Plans/**` paths are forbidden; the eleven Plan-derived source files remain under the frozen snapshot fixture.

The 64 candidate-v7 counterfactual holdout objects are preserved exactly. Candidate-v8 adds one generic custody case, `CF-R8-65-v7-facade-mutation-fails-before-import`: appending one LF to the bound v7 harness bytes is rejected by the same hash/byte validator before any dynamic-import attempt. There are no answer literals, cell-specific semantic branches, model-specific exceptions, retries, best-of selection, replacements, or hidden repairs.

## Audited candidate-bundle interface

The external controller owns a canonical `audited_candidate_bundle` with exact ordered keys:

```text
schema_id,candidate_id,excluded_path,file_count,aggregate_file_bytes,files,canonical_rows_sha256,canonical_rows_bytes
```

Its schema is `pw-r8-audited-candidate-bundle-v1`; `candidate_id` is candidate-v8; `excluded_path` is `independent_preseal_audit.json`; and `file_count` is 10. `aggregate_file_bytes` is the sum of the current storage byte counts for these exact sorted candidate files:

```text
README.md
architecture_contract.json
controller_contract.json
counterfactual_holdouts.json
deterministic_preflight_report.json
r8_harness.py
r8_run_verifier.py
r8_subject_task_driver.py
revision_lineage.json
verifier_contract.json
```

Each `files` row has exact keys `path,sha256,bytes`. `canonical_rows_sha256` and `canonical_rows_bytes` bind only the canonical minified UTF-8 JSON bytes of the exact `files` array.

The external freeze manifest v5 retains its existing exact prefix through `preseal_launch_ready`, followed by:

```text
audited_candidate_bundle,independent_preseal_audit,qualification_contract,candidate_file_count,candidate_files,runtime_dependency_count,runtime_dependencies
```

The run-contract v5 exact key order is:

```text
schema_id,candidate_id,run_id,routes,dispatch_schedule_path,dispatch_schedule_storage_sha256,dispatch_schedule_storage_bytes,candidate_freeze_manifest_path,candidate_freeze_manifest_storage_sha256,candidate_freeze_manifest_storage_bytes,audited_candidate_bundle,qualification_sequence,predecessor_run_id
```

`freeze_binding` carries exact fields `path,storage_sha256,storage_bytes,audited_candidate_bundle`.

The controller's typed opaque dispatch wrapper remains outside semantic input. It binds the exact dispatch identity, semantic packet, and dispatch-schedule fields documented in the architecture contract; semantic packet and full model-visible wrapper bytes are measured separately.

## Pure command surface

```text
PYTHONDONTWRITEBYTECODE=1 python3 r8_harness.py preflight
PYTHONDONTWRITEBYTECODE=1 python3 r8_harness.py list-cells
PYTHONDONTWRITEBYTECODE=1 python3 r8_harness.py render --cell CELL --slot SLOT --execution-root ABSOLUTE_RUN_EXECUTION_ROOT
PYTHONDONTWRITEBYTECODE=1 python3 r8_harness.py expected --cell CELL --slot SLOT --execution-root ABSOLUTE_RUN_EXECUTION_ROOT
PYTHONDONTWRITEBYTECODE=1 python3 r8_harness.py score --cell CELL --slot SLOT --execution-root ABSOLUTE_RUN_EXECUTION_ROOT
PYTHONDONTWRITEBYTECODE=1 python3 r8_harness.py measure --cell CELL --slot SLOT --execution-root ABSOLUTE_RUN_EXECUTION_ROOT
PYTHONDONTWRITEBYTECODE=1 python3 r8_harness.py reduce --stage STAGE --slot SLOT --execution-root ABSOLUTE_RUN_EXECUTION_ROOT
```

The deterministic preflight makes zero subject calls, zero provider calls, and zero live Plans reads. Static success is not empirical model success, two-run qualification, production enforcement, release readiness, safety certification, or permission to compile Plans. No freeze, audit, or launch is performed here.
