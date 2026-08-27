# Storage GLM53 max normalized canary V1

This is one fresh, one-use, zero-credit `opencode-go/glm-5.3-flash|max` native OMP Goal canary. It formalizes the successful direct V5 diagnostic without retrying or retro-crediting any earlier row.

The package imports the pushed V7 prompt, transport, session parser, scorer, row verifier, oracle, and schema. It imports the pushed 7,024-byte deterministic normalizer unchanged. It does not copy those bodies and has no catalog, SQLite, discovery-helper, provider, or model subprocess of its own.

The only model metadata change is the exact isolated `models.yml` override declaring effort levels `[low, high, max]`. The disposable Linux profile is seeded from the V7 profile, both advisor controls remain off, the native/default argv has no `--config`, and the exact 3,036-byte prompt is written once without a terminator followed by one standalone CR. Every Windows OMP or Terminal process/window is foreign and excluded.

Pre-submission TUI evidence must visibly show `GLM-5.3-Flash (2x usage)` and literal `max`. Request debug capture is admitted only in the fresh registered cwd. The active-Goal prefix binds one request; terminal evidence binds exactly two complete HTTP-200/SSE request-response pairs, in order, to the verified Goal-call assistant and the distinct final assistant. Each request must be POST to the frozen OpenCode-Go endpoint with model `glm-5.3-flash`, `reasoning_effort=max`, and the sole native `goal` tool. The first response must reproduce the verified canonical Goal call ID and assistant-text hash; the second must reproduce the verified distinct-final text hash with no tool call.

Raw request/response capture stays in the private runtime directory. Evidence contains only names, sizes, hashes, endpoint, method, model, reasoning effort, and tool names; authorization, cookie, key, and token material is forbidden. Phase-named prefix and final receipts are immutable and referenced paths may not be overwritten.

V7 structural verification runs first. The imported host program then normalizes bounded assistant `PM_RESULT` candidates for the unchanged scorer. Retry recovery, provider errors, terminal structural defects, malformed/conflicting results, request/assistant mismatch, path contamination, abnormal exit, or any custody drift permanently fail the one row. Exactly one Ctrl-D is sent only after a stable verified terminal result; exit code zero remains mandatory. The active wait budget is 3,600 seconds.

Zero-subject checks:

```bash
PYTHONDONTWRITEBYTECODE=1 python3 -B controller.py lint
PYTHONDONTWRITEBYTECODE=1 python3 -B controller.py verify-prefix
PYTHONDONTWRITEBYTECODE=1 python3 -B selftest.py
PYTHONDONTWRITEBYTECODE=1 python3 -B -O selftest.py
```

The sole subject command, only after separate pushed-custody review and launch authority, is `PYTHONDONTWRITEBYTECODE=1 python3 -B controller.py run 1 --max-seconds 3600`. Do not run it during preparation. A PASS is diagnostic evidence only: qualification, matrix, and production credit remain zero and no retry, replacement, suffix, or new route follows automatically.
