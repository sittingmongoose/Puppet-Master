# R9 minimal outer controller — iteration 001

This directory is an internal, zero-credit stabilization iteration. It binds `r9_goal_operating_contract_v1.json` at SHA-256 `764dd27b3f472a90eef0f8493e63ac8fb349fe05a3a97dc4673a4a835e6e8dbd` / 7,024 bytes and repository checkpoint `d1d139e01d99a612319148c43b6d9e43b0cb8a0e`.

It is not a formal candidate, audit, freeze, canary result, qualification run, readiness claim, or empirical evidence. No actual command is authorized during this implementation iteration.

## Public surface

`controller.py` exposes only these subcommands, plus argparse help:

```text
simulate --run-root NAME [--scenario NAME]
simulate --check-only
run-canary --run-root NAME
run-matrix --run-root NAME
reopen --run-root NAME
```

Return codes are `0` for PASS, `1` for a valid subject FAIL, and `2` for controller/evidence INVALID. `simulate --check-only` performs control/hash/import validation without evidence writes or backend calls. Run roots must be new direct children of `iteration_001/evidence`; there is no resume or relaunch path.

## Narrow integration APIs

`backend.py` exports:

```python
invoke(request: dict) -> dict
```

It is blocking, persistence-free, and callback-free. One call represents one fresh synthetic or actual invocation and must wait to terminal. Each predeclared nonce is exactly 64 lowercase hexadecimal characters. It returns schema `pw-r9-backend-result-v1` with the request mode/nonce/route/input binding, globally fresh `task_id`, `thread_id`, and `turn_id`, full UTF-8 stdout/stderr, return code, process metadata, and exact `dispatch_count=1`, `retry_count=0`, `best_of=false`, `replacement_result=false`.

For actual calls, `provider_input_utf8` is the exact semantic manifest render with only its storage LF removed. There is no run-specific or metadata wrapper in provider-visible text. `provider_input.txt` durably stores the same manifest render with exactly one terminal LF; attempt and completion evidence bind both storage and provider-visible hashes/byte counts.

`verifier.py` exports:

```python
verify(run_root: pathlib.Path, expected: dict) -> dict
```

It is offline, persistence-free, callback-free, and returns a JSON-able object containing boolean `valid`. It independently checks control identities, the slot-major selected schedule, exact create-only chains, global task/thread/turn/nonce freshness across `iteration_001/evidence`, render immutability, complete raw results, deterministic score recomputation, no-retry accounting, and path/matrix terminals.

`semantic_manifest.json` is data, not authority. It contains three ordered routes, 97 ordered cells, frozen render/oracle data, the canary cell, and sorted hash bindings for transitive sources relative to `successor_20260813`. The controller verifies every listed source once before a run and never imports or executes those sources. In particular, it imports no candidate v12–v21 controller code.

## State and evidence

The controller executes slot-major and sequentially. `simulate` and `run-matrix` select all 291 route/cell rows. `run-canary` selects the manifest canary cell once for each of the three routes.

For each row it:

1. creates the row directory and O_EXCL `provider_input.txt`, fsyncs it and its parent;
2. creates O_EXCL canonical `attempt.json` containing run/slot/cell/index/route, the predeclared nonce, render and provider-input bindings, `attempt=1`, and no-retry/no-relaunch flags;
3. calls `backend.invoke` exactly once and remains foreground until terminal;
4. create-only writes the complete backend return in `raw_result.json`;
5. checks route/input/identity/terminal metadata and exact-scores stdout against canonical frozen expected JSON plus LF;
6. create-only writes `completion.json` last;
7. reopens and recomputes the exact row chain before advancing.

An attempt is the permanent once-only admission record. Any attempt without a valid completion, mutation, duplicate identity, malformed terminal result, or inconsistent binding permanently invalidates the run. The controller never retries, replaces, performs best-of, resumes, or launches that row again.

SIGINT or SIGTERM sets a stop request. Because dispatch is sequential and blocking, the already-admitted foreground call is allowed to reach terminal, is captured, scored, sealed, and reopened; the controller then starts no new row and writes path/matrix accounting. An incomplete stopped run is controller INVALID, not a subject FAIL.

Evidence is create-only canonical JSON plus one LF, except `provider_input.txt`. Every file is a regular nonlink, created with O_EXCL, fsynced, followed by a parent-directory fsync, and reopened before use. Layout:

```text
evidence/<run_id>/
  run.json
  cells/<slot>/<index>_<cell>/
    provider_input.txt
    attempt.json
    raw_result.json
    completion.json
  terminals/<slot>.json
  matrix_terminal.json
  accounting.json
```

## Static and synthetic no-call checks

These checks create no runtime evidence and make no provider/model/network call:

```bash
python3 - <<'PY'
import ast
from pathlib import Path
p = Path("controller.py")
tree = ast.parse(p.read_text(encoding="utf-8"))
commands = {node.value for node in ast.walk(tree)
            if isinstance(node, ast.Constant) and isinstance(node.value, str)
            and node.value in {"simulate", "run-canary", "run-matrix", "reopen"}}
assert commands == {"simulate", "run-canary", "run-matrix", "reopen"}
assert not any(isinstance(node, (ast.Import, ast.ImportFrom)) and "model_retest_r8_candidate_v" in ast.unparse(node)
               for node in ast.walk(tree))
print("AST_OK")
PY
PYTHONDONTWRITEBYTECODE=1 python3 controller.py --help
PYTHONDONTWRITEBYTECODE=1 python3 controller.py simulate --check-only
```

A synthetic traversal is still a run that creates evidence. It is zero-credit and must only be executed in a new `iteration_001/evidence/<run_id>` after integration authorization:

```bash
PYTHONDONTWRITEBYTECODE=1 python3 controller.py simulate --run-root synthetic-001
PYTHONDONTWRITEBYTECODE=1 python3 controller.py reopen --run-root synthetic-001
```

## Explicit nonblocking residual risks

The binding operating contract names these exactly:

- malicious trusted-controller fabrication
- host or OS compromise
- arbitrary in-process Python callers invoking private helpers
- capability tokens
- recursive or self-hosting verifier authority
- callback confinement
- reflection resistance
- production FileSafe or read-isolation proof

These residuals do not weaken the experiment-validity blockers inside the stated trusted boundary, and this iteration makes no claim to resolve them.
