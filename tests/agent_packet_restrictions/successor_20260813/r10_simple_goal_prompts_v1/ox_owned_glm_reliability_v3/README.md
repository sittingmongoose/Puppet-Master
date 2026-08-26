# Owned-GLM Ox reliability v3 — simple architecture

This is a fresh, zero-credit, Ox-only five-row development experiment. It replaces the discarded copied-runner design with six owned files and delegates transport, terminal capture, scoring, raw-evidence verification, evidence-tree custody, and global uniqueness to the unchanged frozen V7 implementation.

All five `opencode-go/ox-alpha-free` max identities are frozen before launch. Rows run once, in ordinal order, on unchanged bytes. Every row counts; the first failure or custody mismatch stops all remaining rows permanently. There is no retry, replacement, best-of selection, skipped denominator row, or retro-credit. Only 5/5 PASS supports the bounded reliability hypothesis, and even 5/5 earns zero matrix qualification credit.

The experiment keeps the exact 3,036-byte `/goal` prompt, V7 scorer, OMP 18.0.4/profile, advisor-off controls, `--no-tools`, native Goal lifecycle, distinct exact final assistant, normal exit, 3,600-second allowance, and exact 21-byte `tools.format: glm` overlay. The route-local projection changes only two parser boundaries:

- Zero tool calls plus the exact accepted submission and latest continuous active Goal state raises pending `OmpSessionError`; it can never project, score, or PASS.
- After one canonical owned-GLM `goal({"op":"complete"})` raw block, the adapter may remove from a temporary projection either no trailing block or one final nonempty text block containing only ASCII TAB/LF/CR/SPACE, optionally surrounding exactly one literal `<observation>`. Raw evidence bytes and SHA remain authoritative. Framing is never final output, scoring, or lifecycle evidence.

Wrong, ordinary, malformed, or multiple calls; malformed pending state; Unicode whitespace; closing/duplicate markers; prose; `tool_response`; `PM_RESULT`; or multiple/following blocks fail closed. V7 defaults are never modified outside the controller's `finally`-restored 11-binding context.

The standing authority is source thread `01a034b9-a1c8-7a80-937f-4e45e3f2ae45`, exact text `You can run as many free Ox runs as you want.  Dont ask going forward` (69 UTF-8 bytes; SHA-256 `99df1f43d62da6ae6314c385f43208ac159374deed46c8b16382d3c9909d54e8`). It admits these five fresh free-Ox development rows only after exact source bytes are committed at one HEAD pushed to both configured remotes. It admits no V1/V2 retry, paid or non-Ox route, further dialect, matrix credit, or retro-credit.

Zero-subject commands:

```text
PYTHONDONTWRITEBYTECODE=1 python3 -B controller.py lint
PYTHONDONTWRITEBYTECODE=1 python3 -B -O controller.py lint
PYTHONDONTWRITEBYTECODE=1 python3 -B selftest.py
PYTHONDONTWRITEBYTECODE=1 python3 -B -O selftest.py
PYTHONDONTWRITEBYTECODE=1 python3 -B controller.py verify-prefix
```

The only subject command is `PYTHONDONTWRITEBYTECODE=1 python3 -B controller.py run <ordinal 1..5> --max-seconds 3600`. It is fail-closed until the six files are tracked byte-for-byte at a dual-pushed HEAD. No Muse, Cursor, Codex, Qwen, paid, or suffix route is mechanically launchable.
