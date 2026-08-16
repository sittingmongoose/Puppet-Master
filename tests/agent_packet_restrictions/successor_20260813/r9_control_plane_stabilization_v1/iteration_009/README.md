# R9 standalone causal controller — iteration 009

This directory is an internal, zero-credit stabilization iteration under `r9_goal_operating_contract_v1.json`. It starts from iteration 008 and applies only the component replacement authorized by `v4_run1_semantic_failure_diagnosis_v1.json` (SHA-256 `0f0544c2fd01532feaa6e2ab85fe81367ba9e42898f54670e25358ccd94a590a`, 28,284 bytes) and the post-diagnosis churn assessment (SHA-256 `bd792ba1a89dd46e83a41abc13068620c67887b696e0a6c03855c30192c2453d`, 5,941 bytes). The exact V4 211-byte preserve-boundary question remains unchanged. Exactly once in each of the four tension renders, immediately after the common instruction sentence, iteration 009 adds the exact 487-byte generic operational rule that classifies `source_bindings.authority` as document metadata, makes `predecessor_outputs` controlling, maps resolved-no-boundary to false, and maps unresolved, missing-resolution, or deliberately separate boundaries to true. The other 93 provider prompts, all 97 expected outputs, all source bindings, predecessor outputs, dependency gates, and all 18 deterministic artifact payloads remain unchanged.

The controller, backend, verifier, routes, schedule, public surface, and runtime behavior are byte-identical to iteration 008. The V4 Matrix 1 failure remains a valid subject failure with zero credit: the preserved route answers at B-T02 are true, false, true against the unchanged false oracle. No answer is repaired, retried, replaced, or reinterpreted. This iteration adds only four uniform prompt-line insertions, mechanically recomputed render identities, V4 evidence bindings, a predecessor-contract FAIL, a successor static-contract PASS, seven zero-call counterfactual receipts, and explanatory metadata.

This is not a formal candidate, audit, freeze, canary result, qualification run, readiness claim, or empirical evidence. Development simulations and data-only semantic checks have zero qualification credit. No model, provider, network, subject, canary, or matrix call is authorized by this iteration.

Construction-process disclosure: no Git, model, provider, subject, network, cache, candidate, audit, freeze, canary, or matrix action was used to construct the five assigned semantic-lane files. The complete simulator suite and independent holistic review remain separate pending gates.

## Public surface

`controller.py` exposes exactly four subcommands, plus argparse help:

```text
simulate --run-root NAME [--scenario NAME]
simulate --check-only
run-canary --run-root NAME
run-matrix --run-root NAME
reopen --run-root NAME
```

Return codes are `0` for `PASS`, `1` for `VALID_SUBJECT_FAIL`, and `2` for controller/evidence `CONTROLLER_INVALID` or an intentionally incomplete `STOPPED_AFTER_DRAIN` run. Run roots are new direct children of `iteration_009/evidence`; there is no resume or relaunch path.

For retained simulator fault sandboxes only, `PW_R9_SIMULATOR_EVIDENCE_ROOT` may name an existing absolute nonlink directory. The seam is honored only by `simulate` and `reopen`; it adds no CLI command or option and cannot redirect `run-canary` or `run-matrix` actual evidence. Each named run remains a direct child of that selected root.

## Narrow integration APIs

`backend.py` exports:

```python
invoke(request: dict) -> dict
```

The interface is blocking, persistence-free, and callback-free. One call is one fresh first attempt. A controller-admissible result must be request-bound, `terminal=true`, `terminal_status=TASK_COMPLETE`, contain the matching observed `task_complete`, and report the child reaped. A non-complete, unbound, unreaped, malformed, or uncertain transport is controller `INVALID`; it is never scored into a subject result. Once transport is admitted, deterministic exact scoring applies. In particular, a complete return-code-zero response mismatch is durably sealed as permanent subject `FAIL`.

The actual rollout reopen requires exactly one session, turn context, `task_started`, and `task_complete`, all bound to the fresh requested identities and route. It selects exactly one user message after the unique matching `turn_context` and before the matching `task_complete`; that row must contain exactly one `input_text` equal to the provider input byte-for-byte. User messages before the matching turn context are retained as session evidence but excluded from provider-input cardinality. Zero, duplicate, wrong, malformed, extra post-context, or post-terminal user rows; multiple turn contexts; wrong or extra task terminals; and malformed final content fail closed. Exactly one well-formed assistant final in the target interval remains the only PASS-capable capture.

`backend.py self-test` is the only backend CLI. Its unchanged local `rollout_selector` receipt binds the archived candidate-V2 rollout and preserves the predecessor `BackendError` caused by two session-wide user rows, while the retained iteration-007 repair accepts the unique exact target-turn prompt and preserves its exact assistant final and task terminal. This is normalized variant `R9_REG_007_ROLLOUT_PREEXISTING_USER_CONTEXT_CARDINALITY_REJECTED`, selector contract `turn-scoped-provider-input-selection`, under the existing `R9-REG-007` family. The matrix accepts zero, one, and two precontext user messages and rejects every declared ambiguous or malformed target-turn shape. It uses no app-server, provider, subject, or network call and writes no experiment evidence.

`verifier.py` exports:

```python
verify(run_root: pathlib.Path, expected: dict) -> dict
```

It is offline, persistence-free, callback-free, and returns a JSON-able object containing boolean `valid`. It independently replays the selected slot-major schedule, exact dependency gates, stage eligibility, create-only row chains, global nonce/task/thread/turn freshness, transport admission, deterministic score, post-FAIL stop, stage identities, terminals, and accounting.

The manifest and pipeline contract are data, not executable authority:

- `semantic_manifest.json`, schema `pw-r9-semantic-manifest-v2`, declares three routes, 97 ordered cells, 18 ordered deterministic stages, exact render/oracle identities, per-cell dependency gates, finalization boundaries, expected artifact payload/storage identities, the retained `S10A_DECISION_A01` canary, and sorted transitive source rows.
- `pipeline_contract.json`, schema `pw-r9-semantic-pipeline-contract-v1`, retains the exact closed iteration-007 controller-facing shape, defines `pw-r9-exact-input-frozen-artifact-v1` gate and finalizer semantics, and changes only its `semantic_manifest` hash/byte binding.
- `semantic_inventory_receipt.json`, schema `pw-r9-semantic-inventory-receipt-v2`, retains `R9-SEM-REG-001` through `R9-SEM-REG-006` as historical data-only checks and adds `R9-SEM-REG-007` through `R9-SEM-REG-013`. The new receipts preserve V4's incomplete contract, bind iteration 009's complete static contract, and exercise resolved renamed/reordered false, stale/current false, lineage-only metadata false, genuine unresolved true, deliberately separate authorities true, missing predecessor resolution true, and no-answer-leakage PASS.
- The separately owned data-only regression work is expected to contain 22 families and 56 normalized variants while preserving 10 global cases. Those totals and the required two clean 291-row synthetic traversals are pending separate simulator-owner execution and are not claimed by these five files.
- The controller validates every declared file as a regular nonlink with exact path/hash/bytes. Runtime cache rows are forbidden. It never imports or executes manifest-listed source files.

The exact three-call canary remains `S10A_DECISION_A01`. `S10B_TENSION_B-T02` requires 28 prior same-slot PASS cells, so selecting it as a three-call canary would be non-constructible without weakening the existing causal gate. No such weakening is permitted. The operational-rule repair therefore first reaches a subject only in a later separately authorized full 291-call matrix; this iteration does not authorize that launch.

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

## Supervised persistence boundary

The simulator's process-loss cases observe `attempt.json`, `raw_result.json`, or `completion.json` only through a persistence witness. Mere path existence is never enough. The witness requires exact canonical JSON with one terminal LF and no CR, the file-kind-specific `schema_id`, and two consecutive observations of the identical path, SHA-256, and byte count. Only then may the supervisor signal the foreground controller. After process termination, the retained bytes must still equal the witnessed bytes. Empty, partial, malformed, noncanonical, wrong-schema, or singly observed storage stays invalid.

The `loss-after-completion` variant also retains a zero-provider phased-writer causal proof. It binds the exact iteration 004 failed receipt (`1955606f…`, 451 bytes) and its zero-byte `completion.json` (`e3b0c442…`, 0 bytes), then phases one create-only local witness through empty, canonical JSON without its storage LF, and complete canonical one-LF bytes. The iteration 004 existence predicate accepts the first two phases. Iteration 006 rejects both, requires two identical complete observations, and requires the retained bytes to remain identical. This is simulator evidence only and has zero qualification credit.

The supervised fault evaluator no longer calls the generic clean-evidence summarizer on an interrupted root. For `SIGKILL`, it requires process return code `-9` and no controller result, reopens the witnessed stage against its row/schema/hash bindings, and classifies every later-stage path exactly as `ABSENT`, `INCOMPLETE_OR_MALFORMED`, or `CANONICAL_PRE_CRASH`. Malformed storage records its raw path/hash/bytes but is never admitted as valid evidence. A public `reopen` must return `2/CONTROLLER_INVALID` without changing the exact root inventory; path, matrix, and accounting terminals, later rows, relaunch, retry, replacement, best-of, and credit are forbidden.

For `SIGTERM`, the same stage inspector requires the admitted row to drain to a complete exact chain. The foreground command and public reopen both return `2/STOPPED_AFTER_DRAIN`; the offline verifier is valid; all three path terminals, matrix terminal, and accounting are exact; and no later row exists. The five R9-REG-006 graceful expectations name `STOPPED_AFTER_DRAIN`, matching the retained controller evidence instead of the stale `CONTROLLER_INVALID` label. Every declared supervised `expect` key is explicitly enforced, and an unknown key fails closed.

The bounded zero-call causal check binds the immutable iteration 005 `loss-after-raw` receipt (`df700199…`, 444 bytes) and its zero-byte completion (`e3b0c442…`, 0 bytes). It preserves the predecessor generic-evaluator FAIL, shows the iteration 006 stage inspector classifying that completion as `INCOMPLETE_OR_MALFORMED`, and confirms public reopen remains `CONTROLLER_INVALID` and byte-preserving. The same check exercises absent, zero-byte, partial/noncanonical, wrong-schema, canonical raced-ahead, and graceful-drain shapes. It also reopens the iteration 004 persistence predecessor and the iteration 005 `loss-after-completion` PASS unchanged. Fault-test PASS means only that invalid evidence failed closed; it never converts malformed evidence into empirical or qualification credit.

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

This preserves the successor behavior for `R9-REG-020`, scenario `historical-head-reopen`, normalized signature `R9_REG_20_HISTORICAL_RUN_GIT_HEAD_DRIFT`: iteration 002 rejected an unchanged synthetic witness solely because repository HEAD advanced; iteration 003 repaired run-level historical-HEAD reopen, but its suite-level `reopen-suite` still compared the entire mutable pre-push Git snapshot to the later tracked, pushed state. Iteration 004 deleted that suite-level equality. Iteration 008 retains the stable sorted `path`/`sha256`/`bytes` comparison, independent inventory, and receipt-bound public reopens.

`reopen-suite` first requires the retained `simulator_receipt.json` itself to be `PASS`, error-free, zero-call, and source-unchanged. Its `clean_pair` must be `PASS`; `run-regressions` and `self-test` receipts also require `faults=PASS`. Thus the exact pushed iteration 004 suite with `status=FAIL` and `faults=FAIL` remains rejected even though its clean pair and source custody pass.

Current Git custody remains a separate required fail-closed result: local `HEAD` must equal local `origin/main`, and every recorded bound file must match its blob at current `HEAD`. Historical `HEAD`, porcelain status, tracking state, and status digests are observations rather than equality inputs. Missing or extra recorded paths, byte drift, inventory drift, current custody failure, either clean-run reopen failure, or failed retained-terminal admission makes `reopen-suite` fail. The pre-push iteration 009 source is therefore expected to fail this custody gate until safely committed and pushed.

The bounded zero-call causal proof is the retained `iteration-003-final-self-test-001` suite plus exact checkpoint `git_checkpoint_iteration_003_v1.json` (`f71b6d8f…`, 6197 bytes) and progress assessment `progress_assessment_iteration_003_final_v1.json` (`a1684c89…`, 2542 bytes). It preserves predecessor `POST_PUSH_REOPEN_FAIL`, observes the pre-push untracked to post-push tracked/status and HEAD transition, and passes only when stable source identities, present Git custody, the retained inventory, and both public clean-run reopens all pass. It makes zero subject, provider, or network calls and earns zero qualification credit.

## Zero-call checks

The semantic repair validation is initially bounded to static JSON, hash, byte, projection, and predecessor/successor contract checks. The complete simulator suite remains required and pending. The following unchanged commands make no provider/model/network calls when the controller owner runs them:

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
