# Storage GLM53 max normalized canary V3

This is one fresh, one-use, zero-credit `opencode-go/glm-5.3-flash|max` native OMP Goal canary. It is a successor to consumed V1 and V2, not a retry or a source of retroactive credit.

The package imports the pushed V7 prompt, transport, session parser, scorer, row verifier, oracle, and schema. It imports the pushed 7,024-byte deterministic normalizer unchanged. No V7 runner, parser, verifier, scorer, or normalizer body is copied.

The V2 reset's three bounded changes remain unchanged. First, every OMP subprocess receives a fresh HOME, XDG config/cache/data home, Claude config directory, Copilot home, and explicit default OMP/PI profile. The disposable coding-agent profile begins with exactly `config.yml`, `agent.db`, `models.db`, and this package's exact `models.yml`; it contains no MCP, tool, or extension seed, and the subject argv adds `--no-extensions`. Second, the empty-MCP startup path is admitted by the exact prompt-ready `❯` glyph and the same before/after composer transition instead of the absent `MCP finished` banner. Third, active-Goal submission acceptance is the unchanged V7 persisted-session prefix only; zero, one, or two in-progress request-debug files cannot admit or reject it.

The sole V3 correction is exception classification during composer polling. Ordinary not-yet-ready or partial prompt-card/glyph snapshots raise inherited `RunnerError` so the inherited loop continues polling. A forbidden MCP banner, wrong prompt bytes, transcript contamination, model-selection drift, or a contradictory prompt card remains a permanent failure. All other pre-completion compatibility seams retain their V2 exception behavior.

Only after V7 structural verification, deterministic normalization, and normal exit does the host accept request-debug evidence. The final cwd must contain a contiguous complete `rr-session-1..N` request/response roster with no gaps or extras, where `N` equals the verified assistant-turn count. Every request must target the frozen OpenCode-Go endpoint with model `glm-5.3-flash`, `reasoning_effort=max`, and exactly the native `goal` tool. Ordered request history, response text hashes, the sole canonical `goal({"op":"complete"})` call, its result history, and the verified assistant entry IDs must all join. Raw request/response bytes move to the private runtime directory; evidence keeps only a single immutable sanitized final receipt.

The exact 3,036-byte prompt is written once without a terminator, followed by one standalone CR. Retry recovery, provider error, structural defect, normalization defect, HTTP pair gap/reorder/contamination, abnormal exit, or custody drift permanently fails the row. Exactly one Ctrl-D is sent only after a stable verified terminal result. The active budget is 3,600 seconds. Every Windows OMP or Terminal process/window is foreign and excluded.

Zero-subject checks:

```bash
PYTHONDONTWRITEBYTECODE=1 python3 -B controller.py lint
PYTHONDONTWRITEBYTECODE=1 python3 -B controller.py verify-prefix
PYTHONDONTWRITEBYTECODE=1 python3 -B selftest.py
PYTHONDONTWRITEBYTECODE=1 python3 -B -O selftest.py
```

The sole subject command, only after separate pushed-custody review and launch authority, is `PYTHONDONTWRITEBYTECODE=1 python3 -B controller.py run 1 --max-seconds 3600`. Do not run it during preparation. A PASS remains diagnostic evidence only: qualification, matrix, production, and retroactive credit are zero.
