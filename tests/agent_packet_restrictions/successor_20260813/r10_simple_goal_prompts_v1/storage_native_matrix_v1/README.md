# Storage native matrix v1

This is a zero-subject, fail-closed controller for the next fresh Storage 12-route by 2-pass qualification candidate. It reuses the frozen `system_pipeline_sandbox_v7` pipeline, OMP runner, session parser, scorer, and full evidence verifier without copying their bodies.

The fixed route order in each pass is Ox, Cursor, Muse, DeepSeek, Gemini, six Codex App rows, then Qwen. Ox and Cursor are explicit gates and Qwen remains last. Every one of the 24 preregistered rows counts. A failed, stranded, reused, or custody-mismatched row permanently blocks the suffix; there is no retry, replacement, best-of selection, or retroactive credit.

OMP rows use the unmodified native/default V7 argv under the isolated Linux profile. They have no config overlay and no ordinary tools. Both advisor controls remain off, the row budget is exactly 3600 seconds, the native Goal lifecycle and exact typed result are required, and process exit must be normal. Any Windows OMP or Windows Terminal process/window is foreign: do not inspect, focus, inject, signal, close, reuse, or clean it up.

Codex rows are receipt-driven projectless App Goal rows. This package never launches a Codex subprocess. The controller reserves the one-use row and emits an exact `codex_app__create_thread` request. A host controller must call only `create_thread`, zero or more `wait_threads`, and one final `read_thread`, feeding each exact canonical receipt back on stdin. Follow-up, send, fork, handoff, and any other parent/App call are outside the contract. The final read projection is corroborative. The creating App host must then supply two ordered canonical raw-copy receipts, each embedding a fresh read of the same persisted child JSONL and joining its host, source path, bytes, and SHA-256; Linux-home discovery is forbidden. Only byte-identical copies become the authoritative raw rollout. That rollout must prove one exact external task submission, the requested model/effort, exactly one `create_goal(active)` then one `update_goal(complete)`, the exact final answer, and no ordinary/App/command tool calls.

Current source bytes are intentionally untracked, so subject execution is disabled by pushed-custody admission. The source Goal and later exact user messages authorize precisely these 24 preregistered full-matrix rows, including the twelve projectless Codex App tasks, but no retry, replacement, follow-up, identity substitution, extra route, or other task. The standing 69-byte free-Ox development authority remains separately bound and does not widen that matrix denominator. Before any launch, the five source files must be committed identically to both configured remotes, the contract must bind that pushed commit, and zero-subject lint must still pass. The open Windows OMP/Terminal boundary remains unchanged.

Zero-subject commands:

```sh
PYTHONDONTWRITEBYTECODE=1 python3 -B controller.py lint
PYTHONDONTWRITEBYTECODE=1 python3 -B selftest.py
PYTHONDONTWRITEBYTECODE=1 python3 -O -B selftest.py
```

Future receipt workflow, only after the authorized contract is dual-pushed with exact source custody:

```sh
PYTHONDONTWRITEBYTECODE=1 python3 -B controller.py run-omp 1
PYTHONDONTWRITEBYTECODE=1 python3 -B controller.py codex-reserve 6
PYTHONDONTWRITEBYTECODE=1 python3 -B controller.py codex-create-request 6
# call the emitted create_thread request externally, then pipe one canonical receipt
PYTHONDONTWRITEBYTECODE=1 python3 -B controller.py codex-ingest-create 6
PYTHONDONTWRITEBYTECODE=1 python3 -B controller.py codex-wait-request 6
PYTHONDONTWRITEBYTECODE=1 python3 -B controller.py codex-ingest-wait 6
PYTHONDONTWRITEBYTECODE=1 python3 -B controller.py codex-read-request 6
PYTHONDONTWRITEBYTECODE=1 python3 -B controller.py codex-ingest-read 6
PYTHONDONTWRITEBYTECODE=1 python3 -B controller.py codex-raw-request 6
# the creating host reads its persisted child JSONL twice and pipes each canonical copy receipt
PYTHONDONTWRITEBYTECODE=1 python3 -B controller.py codex-ingest-raw1 6
PYTHONDONTWRITEBYTECODE=1 python3 -B controller.py codex-ingest-raw2 6
```

Preparation, static verification, receipt capture, Goal activation, and a partial pass earn zero matrix, qualification, readiness, or production credit. Only two complete independently verified clean passes on unchanged pushed bytes can support the matrix claim, and that result still creates no WorkNodes.
