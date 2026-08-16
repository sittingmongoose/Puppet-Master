# R9 standalone causal controller — iteration 004

This directory is an internal, zero-credit stabilization iteration under `r9_goal_operating_contract_v1.json`. It preserves iteration 002's causal controller and repairs only durable historical-HEAD reopen custody. It does not import or invoke the iteration 002 controller, any candidate v12–v21 controller, or any recursive authority layer.

This is not a formal candidate, audit, freeze, canary result, qualification run, readiness claim, or empirical evidence. Development simulations have zero qualification credit. No actual provider call is authorized during implementation or synthetic verification.

## Public surface

`controller.py` exposes exactly four subcommands, plus argparse help:

```text
simulate --run-root NAME [--scenario NAME]
simulate --check-only
run-canary --run-root NAME
run-matrix --run-root NAME
reopen --run-root NAME
```

Return codes are `0` for `PASS`, `1` for `VALID_SUBJECT_FAIL`, and `2` for controller/evidence `CONTROLLER_INVALID` or an intentionally incomplete `STOPPED_AFTER_DRAIN` run. Run roots are new direct children of `iteration_004/evidence`; there is no resume or relaunch path.

For retained simulator fault sandboxes only, `PW_R9_SIMULATOR_EVIDENCE_ROOT` may name an existing absolute nonlink directory. The seam is honored only by `simulate` and `reopen`; it adds no CLI command or option and cannot redirect `run-canary` or `run-matrix` actual evidence. Each named run remains a direct child of that selected root.

## Narrow integration APIs

`backend.py` exports:

```python
invoke(request: dict) -> dict
```

The interface is blocking, persistence-free, and callback-free. One call is one fresh first attempt. A controller-admissible result must be request-bound, `terminal=true`, `terminal_status=TASK_COMPLETE`, contain the matching observed `task_complete`, and report the child reaped. A non-complete, unbound, unreaped, malformed, or uncertain transport is controller `INVALID`; it is never scored into a subject result. Once transport is admitted, deterministic exact scoring applies. In particular, a complete return-code-zero response mismatch is durably sealed as permanent subject `FAIL`.

`verifier.py` exports:

```python
verify(run_root: pathlib.Path, expected: dict) -> dict
```

It is offline, persistence-free, callback-free, and returns a JSON-able object containing boolean `valid`. It independently replays the selected slot-major schedule, exact dependency gates, stage eligibility, create-only row chains, global nonce/task/thread/turn freshness, transport admission, deterministic score, post-FAIL stop, stage identities, terminals, and accounting.

The manifest and pipeline contract are data, not executable authority:

- `semantic_manifest.json`, schema `pw-r9-semantic-manifest-v2`, declares three routes, 97 ordered cells, 18 ordered deterministic stages, exact render/oracle identities, per-cell dependency gates, finalization boundaries, expected artifact payload/storage identities, a canary, and sorted transitive source rows.
- `pipeline_contract.json`, schema `pw-r9-semantic-pipeline-contract-v1`, defines `pw-r9-exact-input-frozen-artifact-v1` gate and finalizer semantics and binds its lineage.
- The controller validates every declared file as a regular nonlink with exact path/hash/bytes. Runtime cache rows are forbidden. It never imports or executes manifest-listed source files.

## Causal execution

The controller executes sequentially in manifest route order, then selected cell order. Before every row it reopens exactly the same-slot PASS-cell completions and stage artifacts declared by that cell's dependency gate. It binds their sorted `{kind,id,path,sha256,bytes}` rows in `attempt.json` before dispatch.

`provider_input.txt` is the exact manifest `render_utf8` storage, including exactly one terminal LF and no CR. `backend.invoke` receives exactly those UTF-8 bytes minus only that storage LF. There is no metadata, nonce, run-specific, or causal-input wrapper in provider-visible text.

For every row the controller:

1. reopens all declared causal inputs;
2. create-only persists and reopens `provider_input.txt`;
3. create-only persists canonical `attempt.json`, which is permanent once-only admission;
4. calls `backend.invoke` exactly once and remains foreground until it returns;
5. create-only persists the complete backend return in `raw_result.json` before transport adjudication;
6. admits only a TASK_COMPLETE, terminal, reaped, request-bound transport;
7. reopens the provider input and all causal inputs, then exact-scores the raw response;
8. create-only writes `completion.json` as the last write in that row and reopens the complete row chain;
9. after PASS, finalizes every newly eligible declarative stage in order.

Each stage artifact is written create-only to `artifacts/<slot>/<stage>.json` as the exact manifest `expected_artifact` minified payload plus one LF. Before and after creation the controller verifies the declared payload and storage hash/byte identities; it then reopens the artifact. A full clean matrix requires exactly 291 PASS completions and 54 artifacts: all 18 stages for all three routes.

A valid subject FAIL is sealed normally, then that slot stops immediately. All later same-slot rows are explicitly ineligible and no later same-slot attempt may exist; the other slots continue. Any controller INVALID aborts every slot. Terminals and accounting separately name valid subject failures, post-failure ineligible rows, signal-stopped rows, controller-aborted rows, invalid rows, unexplained missing rows, and missing or invalid eligible artifacts.

SIGINT or SIGTERM sets only a stop-request flag. An already-admitted foreground invoke drains through raw capture, transport validation, deterministic completion seal, row reopen, and any newly eligible artifact finalization. The controller then admits no new attempt and writes `STOPPED_AFTER_DRAIN` terminal accounting.

## Evidence layout

All evidence is regular nonlink and create-only. JSON evidence uses the controller's sorted-key canonical encoding plus one LF. Frozen semantic artifacts instead preserve the manifest's declared object-key order and add exactly one storage LF. Every file is fsynced, followed by a parent-directory fsync, and reopened before use.

```text
<selected-evidence-root>/<run_id>/
  run.json
  cells/<slot>/<index>_<cell>/
    provider_input.txt
    attempt.json
    raw_result.json
    completion.json
  artifacts/<slot>/<stage>.json
  controller_invalid.json          # present only for caught controller INVALID
  terminals/<slot>.json
  matrix_terminal.json
  accounting.json
```

An attempt without a valid completion, dependency mutation, malformed transport, illegal post-FAIL advance, missing eligible artifact, inconsistent chain, or unexplained missing row permanently invalidates the run. `reopen` is read-only and cannot repair or resume it.

## Git and bundle custody

There is no hardcoded pre-stabilization checkpoint. Each run records the current Git HEAD and one exact sorted bundle of successor-relative path/hash/bytes rows covering the operating contract, controller, backend, verifier, manifest/pipeline, routes/schedule, architecture, and static contracts/catalogs.

Synthetic runs use `WORKTREE_EXACT_BUNDLE` and are zero-credit. Their durable reopen depends on the exact run-bound live bundle, not equality between `run.git_head` and the repository's later HEAD. Actual `run-canary` and `run-matrix` additionally require `GIT_HEAD_PINNED`: launch checks the then-current HEAD, while every later reopen resolves `run.git_head` as an existing commit and requires every declared live bundle file to equal `git show <run.git_head>:<path>`. A malformed or missing recorded commit, missing blob, or byte drift fails closed. Unrelated later commits therefore do not invalidate unchanged evidence. This local check does not claim that the recorded commit is pushed; the external freeze remains responsible for that custody fact.

This is the successor behavior for `R9-REG-020`, scenario `historical-head-reopen`, normalized signature `R9_REG_20_HISTORICAL_RUN_GIT_HEAD_DRIFT`: iteration 002 rejected an unchanged synthetic witness solely because repository HEAD advanced; iteration 003 repaired run-level historical-HEAD reopen, but its suite-level `reopen-suite` still compared the entire mutable pre-push Git snapshot to the later tracked, pushed state. Iteration 004 deletes that suite-level equality. It compares the receipt's before/after/current source closures only as stable sorted `path`/`sha256`/`bytes` rows, inventories the suite independently, and public-reopens exactly both clean runs with the controller bound by the receipt.

Current Git custody is a separate fail-closed result: local `HEAD` must equal local `origin/main`, and every recorded bound file must match its blob at current `HEAD`. Historical `HEAD`, porcelain status, tracking state, and status digests are observations rather than equality inputs. Missing or extra recorded paths, byte drift, inventory drift, current custody failure, or either clean-run reopen failure still makes `reopen-suite` fail.

The bounded zero-call causal proof is the retained `iteration-003-final-self-test-001` suite plus exact checkpoint `git_checkpoint_iteration_003_v1.json` (`f71b6d8f…`, 6197 bytes) and progress assessment `progress_assessment_iteration_003_final_v1.json` (`a1684c89…`, 2542 bytes). It preserves predecessor `POST_PUSH_REOPEN_FAIL`, observes the pre-push untracked to post-push tracked/status and HEAD transition, and passes only when stable source identities, present Git custody, the retained inventory, and both public clean-run reopens all pass. It makes zero subject, provider, or network calls and earns zero qualification credit.

## Zero-call checks

These commands must make no provider/model/network calls:

```bash
PYTHONDONTWRITEBYTECODE=1 python3 controller.py --help
PYTHONDONTWRITEBYTECODE=1 python3 controller.py simulate --check-only
PYTHONDONTWRITEBYTECODE=1 python3 backend.py self-test
```

A synthetic traversal creates durable evidence but still has zero empirical or qualification credit:

```bash
PYTHONDONTWRITEBYTECODE=1 python3 controller.py simulate --run-root synthetic-001
PYTHONDONTWRITEBYTECODE=1 python3 controller.py reopen --run-root synthetic-001
```

## Explicit nonblocking residual risks

The binding operating contract retains these residual risks exactly:

- malicious trusted-controller fabrication
- host or OS compromise
- arbitrary in-process Python callers invoking private helpers
- capability tokens
- recursive or self-hosting verifier authority
- callback confinement
- reflection resistance
- production FileSafe or read-isolation proof

They do not relax any experiment-validity invariant inside the stated boundary, and this iteration makes no claim to resolve them.
